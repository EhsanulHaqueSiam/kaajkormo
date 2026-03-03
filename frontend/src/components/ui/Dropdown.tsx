import { useState, useRef, useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";

interface DropdownItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

interface DropdownProps {
  trigger: ReactNode;
  items: (DropdownItem | "separator")[];
  align?: "left" | "right";
  className?: string;
}

export function Dropdown({ trigger, items, align = "right", className }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className={cn("relative inline-flex", className)} ref={ref}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className={cn(
              "absolute top-full z-50 mt-1 min-w-[180px] overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg",
              align === "right" ? "right-0" : "left-0",
            )}
          >
            {items.map((item, i) => {
              if (item === "separator") {
                return <div key={i} className="my-1 border-t border-gray-100" />;
              }
              return (
                <button
                  key={i}
                  disabled={item.disabled}
                  className={cn(
                    "flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors",
                    item.danger
                      ? "text-danger-600 hover:bg-danger-50"
                      : "text-gray-700 hover:bg-gray-50",
                    item.disabled && "opacity-50 cursor-not-allowed",
                  )}
                  onClick={() => {
                    item.onClick();
                    setIsOpen(false);
                  }}
                >
                  {item.icon && (
                    <span className="shrink-0 [&>svg]:h-4 [&>svg]:w-4">{item.icon}</span>
                  )}
                  {item.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
