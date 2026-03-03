import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Bell, Check, CheckCheck } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { Spinner } from "../components/ui/Spinner";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "../lib/queries/notifications";
import { cn, timeAgo } from "../lib/utils";

export const Route = createFileRoute("/notifications")({
  component: NotificationsPage,
});

function NotificationsPage() {
  const { data, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const notifications = data?.data ?? [];
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="mt-1 text-gray-500">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            icon={<CheckCheck className="h-4 w-4" />}
            onClick={() => markAllRead.mutate()}
            loading={markAllRead.isPending}
          >
            Mark All Read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-12 w-12" />}
          title="No notifications"
          description="You're all caught up! Notifications about your applications and jobs will appear here."
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((n, i) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
            >
              <Card
                className={cn(
                  "flex cursor-pointer items-start gap-4 p-4 transition-colors hover:bg-gray-50",
                  !n.is_read && "border-l-4 border-l-primary-500 bg-primary-50/30",
                )}
                onClick={() => !n.is_read && markRead.mutate(n.id)}
              >
                <div
                  className={cn(
                    "mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full",
                    n.is_read ? "bg-transparent" : "bg-primary-500",
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-sm",
                      n.is_read ? "text-gray-700" : "font-medium text-gray-900",
                    )}
                  >
                    {n.title}
                  </p>
                  {n.body && <p className="mt-0.5 text-sm text-gray-500">{n.body}</p>}
                  <p className="mt-1 text-xs text-gray-400">{timeAgo(n.created_at)}</p>
                </div>
                {!n.is_read && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markRead.mutate(n.id);
                    }}
                    className="shrink-0 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    title="Mark as read"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
