import { useState, useEffect, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Heart, X, Bookmark, Keyboard } from "lucide-react";
import { CardStack } from "../../components/discover/CardStack";
import { EmptyState } from "../../components/ui/EmptyState";
import { Spinner } from "../../components/ui/Spinner";
import { showToast } from "../../components/ui/Toast";
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

  const remaining = (jobs ?? []).filter((j) => !dismissed.has(j.id));

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

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (remaining.length === 0) return;
      const top = remaining[0];
      if (e.key === "ArrowRight") handleSwipe(top, "right");
      else if (e.key === "ArrowLeft") handleSwipe(top, "left");
      else if (e.key === "ArrowUp") handleSwipe(top, "up");
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [remaining, handleSwipe]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Discover Jobs</h1>
        <p className="mt-1 text-gray-500">
          Swipe right to apply, left to skip, up to save
        </p>
      </div>

      {remaining.length === 0 ? (
        <EmptyState
          preset="no-data"
          title="No more jobs to discover"
          description="Check back later for new opportunities, or search for specific roles."
          action={{ label: "Browse All Jobs", onClick: () => {} }}
        />
      ) : (
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
      )}
    </div>
  );
}
