import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check } from "lucide-react";
import { cn } from "../../lib/utils";
import { timeAgo } from "../../lib/utils";

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  type?: "info" | "success" | "warning";
}

interface NotificationBellProps {
  notifications: Notification[];
  onMarkRead?: (id: string) => void;
  onMarkAllRead?: () => void;
  onViewAll?: () => void;
  className?: string;
}

const typeDots = {
  info: "bg-primary-500",
  success: "bg-success-500",
  warning: "bg-warning-500",
};

export function NotificationBell({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onViewAll,
  className,
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((n) => !n.read).length;

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
    <div className={cn("relative", className)} ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-danger-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg sm:w-96"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && onMarkAllRead && (
                <button
                  onClick={onMarkAllRead}
                  className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700"
                >
                  <Check className="h-3 w-3" />
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-500">
                  No notifications
                </div>
              ) : (
                notifications.slice(0, 10).map((n) => (
                  <button
                    key={n.id}
                    className={cn(
                      "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50",
                      !n.read && "bg-primary-50/50",
                    )}
                    onClick={() => onMarkRead?.(n.id)}
                  >
                    <span
                      className={cn(
                        "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                        !n.read
                          ? typeDots[n.type || "info"]
                          : "bg-transparent",
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <p className={cn("text-sm", !n.read ? "font-medium text-gray-900" : "text-gray-700")}>
                        {n.title}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">{n.message}</p>
                      <p className="mt-1 text-xs text-gray-400">{timeAgo(n.created_at)}</p>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            {onViewAll && notifications.length > 0 && (
              <div className="border-t border-gray-100 px-4 py-2">
                <button
                  onClick={() => {
                    onViewAll();
                    setIsOpen(false);
                  }}
                  className="w-full text-center text-xs font-medium text-primary-600 hover:text-primary-700"
                >
                  View all notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
