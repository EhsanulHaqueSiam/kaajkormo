import { useCallback, useState } from "react";
import { useIsMobile } from "./useMediaQuery";

type ViewMode = "swipe" | "list";

const STORAGE_KEY = "discover-view-pref";

export function useViewPreference(): [ViewMode, () => void] {
  const isMobile = useIsMobile();
  const defaultMode: ViewMode = isMobile ? "swipe" : "list";

  const [mode, setMode] = useState<ViewMode>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "swipe" || stored === "list") return stored;
    return defaultMode;
  });

  const toggle = useCallback(() => {
    setMode((prev) => {
      const next = prev === "swipe" ? "list" : "swipe";
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  return [mode, toggle];
}
