import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface TimelineItem {
  title: string;
  subtitle?: string;
  content?: ReactNode;
  date?: string;
  color?: "primary" | "success" | "warning" | "danger" | "gray";
  icon?: ReactNode;
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

const dotColors = {
  primary: "bg-primary-500 ring-primary-100",
  success: "bg-success-500 ring-success-100",
  warning: "bg-warning-500 ring-warning-100",
  danger: "bg-danger-500 ring-danger-100",
  gray: "bg-gray-400 ring-gray-100",
};

export function Timeline({ items, className }: TimelineProps) {
  return (
    <div className={cn("relative space-y-6", className)}>
      {items.map((item, i) => (
        <div key={i} className="relative flex gap-4">
          {/* Line */}
          {i < items.length - 1 && (
            <div className="absolute left-[11px] top-8 h-[calc(100%-8px)] w-0.5 bg-gray-200" />
          )}

          {/* Dot */}
          <div className="relative shrink-0 pt-1">
            {item.icon ? (
              <div
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-white ring-4",
                  dotColors[item.color || "primary"],
                )}
              >
                <span className="[&>svg]:h-3 [&>svg]:w-3">{item.icon}</span>
              </div>
            ) : (
              <div
                className={cn(
                  "h-6 w-6 rounded-full ring-4",
                  dotColors[item.color || "primary"],
                )}
              />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 pb-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                {item.subtitle && (
                  <p className="text-sm text-gray-500">{item.subtitle}</p>
                )}
              </div>
              {item.date && (
                <span className="shrink-0 text-xs text-gray-400">{item.date}</span>
              )}
            </div>
            {item.content && <div className="mt-2">{item.content}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
