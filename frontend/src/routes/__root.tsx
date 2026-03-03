import { createRootRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { Footer } from "../components/layout/Footer";
import { Header } from "../components/layout/Header";
import { PostHogIdentify } from "../components/PostHogIdentify";
import { PostHogPageview } from "../components/PostHogPageview";
import { ShortcutsModal } from "../components/ui/ShortcutsModal";
import { Toaster } from "../components/ui/Toast";
import { HOTKEYS } from "../lib/hotkeys";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  const navigate = useNavigate();
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  useHotkeys(HOTKEYS.GO_HOME, () => navigate({ to: "/" }));
  useHotkeys(HOTKEYS.GO_JOBS, () => navigate({ to: "/jobs" }));
  useHotkeys(HOTKEYS.GO_DISCOVER, () => navigate({ to: "/candidate/discover" }));
  useHotkeys(HOTKEYS.GO_DASHBOARD, () => navigate({ to: "/candidate/dashboard" }));
  useHotkeys(HOTKEYS.SHOW_SHORTCUTS, () => setShortcutsOpen((v) => !v));

  return (
    <div className="flex min-h-screen flex-col bg-surface-50">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toaster />
      <ShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      <PostHogPageview />
      <PostHogIdentify />
      {import.meta.env.DEV && <TanStackRouterDevtools position="bottom-right" />}
    </div>
  );
}
