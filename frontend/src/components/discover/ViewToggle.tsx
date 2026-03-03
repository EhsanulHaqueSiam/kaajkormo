import { Layers, LayoutGrid } from "lucide-react";
import { cn } from "../../lib/utils";

interface ViewToggleProps {
  mode: "swipe" | "list";
  onToggle: () => void;
}

export function ViewToggle({ mode, onToggle }: ViewToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium transition-colors",
        "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
      )}
    >
      {mode === "swipe" ? (
        <>
          <LayoutGrid className="h-4 w-4" />
          <span className="hidden sm:inline">List view</span>
        </>
      ) : (
        <>
          <Layers className="h-4 w-4" />
          <span className="hidden sm:inline">Swipe view</span>
        </>
      )}
    </button>
  );
}
