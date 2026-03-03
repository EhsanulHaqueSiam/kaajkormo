import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Compass, Briefcase, LayoutDashboard, User, FileText, Bookmark, Building, Users, Shield } from "lucide-react";
import { useAppUser } from "../../lib/auth";
import { Button } from "../ui/Button";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const { user } = useAppUser();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.x > 100) onClose();
            }}
            className="fixed inset-y-0 right-0 w-72 bg-white shadow-2xl"
          >
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
                <span className="text-lg font-bold text-gray-900">Menu</span>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Nav items */}
              <nav className="flex-1 overflow-y-auto px-3 py-4">
                <div className="space-y-1">
                  <NavLink to="/jobs" icon={<Briefcase />} onClick={onClose}>
                    Find Jobs
                  </NavLink>

                  <SignedOut>
                    <div className="mt-4 space-y-2 px-1">
                      <Link to="/auth/login" onClick={onClose}>
                        <Button variant="outline" className="w-full">
                          Sign In
                        </Button>
                      </Link>
                      <Link to="/auth/register" onClick={onClose}>
                        <Button variant="gradient" className="w-full">
                          Get Started
                        </Button>
                      </Link>
                    </div>
                  </SignedOut>

                  <SignedIn>
                    {user?.role === "candidate" && (
                      <>
                        <div className="my-3 border-t border-gray-100" />
                        <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                          Candidate
                        </p>
                        <NavLink to="/candidate/dashboard" icon={<LayoutDashboard />} onClick={onClose}>
                          Dashboard
                        </NavLink>
                        <NavLink to="/candidate/discover" icon={<Compass />} onClick={onClose}>
                          Discover
                        </NavLink>
                        <NavLink to="/candidate/applications" icon={<FileText />} onClick={onClose}>
                          Applications
                        </NavLink>
                        <NavLink to="/candidate/saved" icon={<Bookmark />} onClick={onClose}>
                          Saved Jobs
                        </NavLink>
                        <NavLink to="/candidate/profile" icon={<User />} onClick={onClose}>
                          Profile
                        </NavLink>
                      </>
                    )}

                    {user?.role === "employer" && (
                      <>
                        <div className="my-3 border-t border-gray-100" />
                        <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                          Employer
                        </p>
                        <NavLink to="/employer/dashboard" icon={<LayoutDashboard />} onClick={onClose}>
                          Dashboard
                        </NavLink>
                        <NavLink to="/employer/post-job" icon={<Briefcase />} onClick={onClose}>
                          Post Job
                        </NavLink>
                        <NavLink to="/employer/company-profile" icon={<Building />} onClick={onClose}>
                          Company Profile
                        </NavLink>
                      </>
                    )}

                    {user?.role === "admin" && (
                      <>
                        <div className="my-3 border-t border-gray-100" />
                        <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                          Admin
                        </p>
                        <NavLink to="/admin/dashboard" icon={<Shield />} onClick={onClose}>
                          Dashboard
                        </NavLink>
                        <NavLink to="/admin/jobs" icon={<Briefcase />} onClick={onClose}>
                          Manage Jobs
                        </NavLink>
                        <NavLink to="/admin/users" icon={<Users />} onClick={onClose}>
                          Manage Users
                        </NavLink>
                      </>
                    )}
                  </SignedIn>
                </div>
              </nav>

              {/* User section */}
              <SignedIn>
                <div className="border-t border-gray-100 px-4 py-4">
                  <div className="flex items-center gap-3">
                    <UserButton afterSignOutUrl="/" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">{user?.full_name}</p>
                      <p className="truncate text-xs text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                </div>
              </SignedIn>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function NavLink({
  to,
  icon,
  children,
  onClick,
}: {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 [&.active]:bg-primary-50 [&.active]:text-primary-600 [&>svg]:h-4 [&>svg]:w-4"
    >
      {icon}
      {children}
    </Link>
  );
}
