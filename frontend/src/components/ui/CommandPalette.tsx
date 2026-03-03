import { useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Command } from "lucide-react";
import { cn } from "../../lib/utils";

interface CommandItem {
  id: string;
  label: string;
  icon?: ReactNode;
  group?: string;
  onSelect: () => void;
  keywords?: string[];
}

interface CommandPaletteProps {
  items: CommandItem[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CommandPalette({ items, open: controlledOpen, onOpenChange }: CommandPaletteProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const isOpen = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  // Cmd+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(!isOpen);
      }
      if (e.key === "Escape" && isOpen) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filtered = search
    ? items.filter(
        (item) =>
          item.label.toLowerCase().includes(search.toLowerCase()) ||
          item.keywords?.some((k) => k.toLowerCase().includes(search.toLowerCase())),
      )
    : items;

  // Group items
  const groups = new Map<string, CommandItem[]>();
  for (const item of filtered) {
    const key = item.group || "Actions";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  }

  const flatFiltered = filtered;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % flatFiltered.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + flatFiltered.length) % flatFiltered.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        flatFiltered[activeIndex]?.onSelect();
        setOpen(false);
      }
    },
    [flatFiltered, activeIndex, setOpen],
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[20vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl"
            onKeyDown={handleKeyDown}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
                placeholder="Type a command or search..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setActiveIndex(0);
                }}
              />
              <kbd className="hidden rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-xs text-gray-400 sm:inline-flex">
                Esc
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-72 overflow-y-auto py-2">
              {Array.from(groups.entries()).map(([group, groupItems]) => (
                <div key={group}>
                  <div className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    {group}
                  </div>
                  {groupItems.map((item) => {
                    const idx = flatFiltered.indexOf(item);
                    return (
                      <button
                        key={item.id}
                        className={cn(
                          "flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors",
                          idx === activeIndex
                            ? "bg-primary-50 text-primary-700"
                            : "text-gray-700 hover:bg-gray-50",
                        )}
                        onClick={() => {
                          item.onSelect();
                          setOpen(false);
                        }}
                        onMouseEnter={() => setActiveIndex(idx)}
                      >
                        {item.icon && (
                          <span className="shrink-0 [&>svg]:h-4 [&>svg]:w-4">{item.icon}</span>
                        )}
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-gray-500">
                  No results found
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-4 border-t border-gray-100 px-4 py-2 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-gray-200 bg-gray-50 px-1">↑↓</kbd>
                navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-gray-200 bg-gray-50 px-1">↵</kbd>
                select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-gray-200 bg-gray-50 px-1">esc</kbd>
                close
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function CommandTrigger({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700",
        className,
      )}
    >
      <Search className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">Search...</span>
      <kbd className="hidden items-center gap-0.5 rounded border border-gray-200 bg-white px-1.5 py-0.5 text-xs sm:inline-flex">
        <Command className="h-3 w-3" />K
      </kbd>
    </button>
  );
}
