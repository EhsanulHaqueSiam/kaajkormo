import { motion } from "framer-motion";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: "underline" | "pills";
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, variant = "underline", className }: TabsProps) {
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  useEffect(() => {
    const activeEl = tabRefs.current.get(activeTab);
    if (activeEl) {
      setIndicatorStyle({
        left: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
      });
    }
  }, [activeTab]);

  if (variant === "pills") {
    return (
      <div className={cn("flex gap-1 rounded-lg bg-gray-100 p-1", className)}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              tab.id === activeTab ? "text-gray-900" : "text-gray-600 hover:text-gray-900",
            )}
          >
            {tab.id === activeTab && (
              <motion.div
                layoutId="pill-bg"
                className="absolute inset-0 rounded-md bg-white shadow-sm"
                transition={{ duration: 0.2 }}
              />
            )}
            <span className="relative flex items-center gap-1.5">
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && (
                <span className="rounded-full bg-gray-200 px-1.5 text-xs">{tab.count}</span>
              )}
            </span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-x-auto", className)}>
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            ref={(el) => {
              if (el) tabRefs.current.set(tab.id, el);
            }}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex items-center gap-1.5 whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors",
              tab.id === activeTab ? "text-primary-600" : "text-gray-600 hover:text-gray-900",
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  "rounded-full px-1.5 text-xs",
                  tab.id === activeTab
                    ? "bg-primary-100 text-primary-700"
                    : "bg-gray-100 text-gray-600",
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
        <motion.div
          className="absolute bottom-0 h-0.5 bg-primary-600"
          animate={indicatorStyle}
          transition={{ duration: 0.2 }}
        />
      </div>
    </div>
  );
}
