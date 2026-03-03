import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Bookmark, Heart, Keyboard, X } from "lucide-react";
import { useCallback, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { CardStack } from "../../components/discover/CardStack";
import { DiscoverListView } from "../../components/discover/DiscoverListView";
import { ViewToggle } from "../../components/discover/ViewToggle";
import { EmptyState } from "../../components/ui/EmptyState";
import { Spinner } from "../../components/ui/Spinner";
import { showToast } from "../../components/ui/Toast";
import { useViewPreference } from "../../lib/hooks/useViewPreference";
import { HOTKEYS } from "../../lib/hotkeys";
import { useDiscoverJobs, useSwipeAction } from "../../lib/queries/discover";
import type { Job } from "../../types";

export const Route = createFileRoute("/candidate/discover")({
  component: DiscoverPage,
});

function DiscoverPage() {
  const { data: jobs, isLoading } = useDiscoverJobs();
  const swipeAction = useSwipeAction();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [viewMode, toggleView] = useViewPreference();

  const remaining = (jobs ?? []).filter((j) => !dismissed.has(j.id));
  const hasJobs = remaining.length > 0;
  const isSwipe = viewMode === "swipe";

  const handleSwipe = useCallback(
    (job: Job, direction: "left" | "right" | "up") => {
      setDismissed((prev) => new Set(prev).add(job.id));

      const actionMap = { right: "apply", left: "skip", up: "save" } as const;
      const action = actionMap[direction];

      swipeAction.mutate(
        { job_id: job.id, action },
        {
          onSuccess: () => {
            if (action === "apply") {
              showToast.success(`Applied to ${job.title}`);
            } else if (action === "save") {
              showToast.info(`Saved ${job.title}`);
            }
          },
        },
      );
    },
    [swipeAction],
  );

  // Swipe keyboard shortcuts — only active in swipe mode with jobs
  useHotkeys(
    HOTKEYS.SWIPE_APPLY,
    () => handleSwipe(remaining[0], "right"),
    { enabled: isSwipe && hasJobs },
    [remaining, handleSwipe],
  );
  useHotkeys(
    HOTKEYS.SWIPE_SKIP,
    () => handleSwipe(remaining[0], "left"),
    { enabled: isSwipe && hasJobs },
    [remaining, handleSwipe],
  );
  useHotkeys(
    HOTKEYS.SWIPE_SAVE,
    () => handleSwipe(remaining[0], "up"),
    { enabled: isSwipe && hasJobs },
    [remaining, handleSwipe],
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Discover Jobs</h1>
          <p className="mt-1 text-gray-500">
            {isSwipe ? "Swipe right to apply, left to skip, up to save" : "Browse and act on jobs"}
          </p>
        </div>
        <ViewToggle mode={viewMode} onToggle={toggleView} />
      </div>

      {!hasJobs ? (
        <EmptyState
          preset="no-data"
          title="No more jobs to discover"
          description="Check back later for new opportunities, or search for specific roles."
          action={{ label: "Browse All Jobs", onClick: () => {} }}
        />
      ) : isSwipe ? (
        <div className="flex flex-col items-center gap-8">
          <CardStack jobs={remaining} onSwipe={handleSwipe} />

          {/* Action buttons */}
          <div className="flex items-center gap-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => handleSwipe(remaining[0], "left")}
              className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-danger-200 bg-white text-danger-500 shadow-md transition-colors hover:bg-danger-50"
            >
              <X className="h-6 w-6" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => handleSwipe(remaining[0], "up")}
              className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary-200 bg-white text-primary-500 shadow-md transition-colors hover:bg-primary-50"
            >
              <Bookmark className="h-5 w-5" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => handleSwipe(remaining[0], "right")}
              className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-success-200 bg-white text-success-500 shadow-md transition-colors hover:bg-success-50"
            >
              <Heart className="h-6 w-6" />
            </motion.button>
          </div>

          {/* Keyboard shortcut hint */}
          <button
            type="button"
            onClick={() => setShowShortcuts(!showShortcuts)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600"
          >
            <Keyboard className="h-3.5 w-3.5" />
            Keyboard shortcuts
          </button>
          {showShortcuts && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4 text-xs text-gray-500"
            >
              <span>
                <kbd className="rounded bg-gray-100 px-1.5 py-0.5 font-mono">←</kbd> Skip
              </span>
              <span>
                <kbd className="rounded bg-gray-100 px-1.5 py-0.5 font-mono">→</kbd> Apply
              </span>
              <span>
                <kbd className="rounded bg-gray-100 px-1.5 py-0.5 font-mono">↑</kbd> Save
              </span>
            </motion.div>
          )}
        </div>
      ) : (
        <DiscoverListView jobs={remaining} onAction={handleSwipe} />
      )}
    </div>
  );
}
