import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";
import { cn } from "../../lib/utils";

interface SidebarItem {
  label: string;
  icon: LucideIcon;
  to: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebarItems: SidebarItem[];
  title?: string;
}

export function DashboardLayout({ children, sidebarItems, title }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className="mx-auto flex max-w-7xl gap-0 px-4 py-6 sm:px-6 lg:px-8 lg:gap-6">
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ duration: 0.2 }}
        className="hidden shrink-0 lg:block"
      >
        <div className="sticky top-24">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            {title && !collapsed && (
              <div className="border-b border-gray-100 px-4 py-3">
                <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
              </div>
            )}
            <nav className="p-2">
              {sidebarItems.map((item) => {
                const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + "/");
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary-50 text-primary-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                      collapsed && "justify-center px-2",
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon className="h-4.5 w-4.5 shrink-0" />
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          className="truncate"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-gray-100 p-2">
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="flex w-full items-center justify-center rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600"
              >
                {collapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main content */}
      <main className="min-w-0 flex-1">{children}</main>

      {/* Mobile bottom tabs */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white/90 backdrop-blur-md lg:hidden">
        <nav className="mx-auto flex max-w-lg items-center justify-around px-2 py-1.5">
          {sidebarItems.slice(0, 5).map((item) => {
            const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + "/");
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors",
                  isActive ? "text-primary-600" : "text-gray-500",
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive && "text-primary-600")} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
