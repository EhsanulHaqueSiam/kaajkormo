import { useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { SignedIn, SignedOut, UserButton } from "../../lib/auth-components";
import { Menu, Compass } from "lucide-react";
import { useAppUser } from "../../lib/auth";
import { Button } from "../ui/Button";
import { CommandTrigger, CommandPalette } from "../ui/CommandPalette";
import { MobileNav } from "./MobileNav";
import { cn } from "../../lib/utils";

export function Header() {
  const { user } = useAppUser();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const commandItems = [
    { id: "jobs", label: "Browse Jobs", group: "Navigation", onSelect: () => navigate({ to: "/jobs" }), keywords: ["find", "search"] },
    { id: "home", label: "Home", group: "Navigation", onSelect: () => navigate({ to: "/" }) },
    ...(user?.role === "candidate"
      ? [
          { id: "dashboard", label: "Dashboard", group: "Navigation", onSelect: () => navigate({ to: "/candidate/dashboard" }) },
          { id: "profile", label: "Edit Profile", group: "Navigation", onSelect: () => navigate({ to: "/candidate/profile" }) },
          { id: "discover", label: "Discover Jobs", group: "Navigation", onSelect: () => navigate({ to: "/candidate/discover" }), keywords: ["swipe"] },
          { id: "applications", label: "Applications", group: "Navigation", onSelect: () => navigate({ to: "/candidate/applications" }) },
        ]
      : []),
    ...(user?.role === "employer"
      ? [
          { id: "emp-dashboard", label: "Dashboard", group: "Navigation", onSelect: () => navigate({ to: "/employer/dashboard" }) },
          { id: "post-job", label: "Post a Job", group: "Navigation", onSelect: () => navigate({ to: "/employer/post-job" }) },
        ]
      : []),
  ];

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 transition-all duration-300",
          scrolled
            ? "glass-strong shadow-sm"
            : "border-b border-gray-200 bg-white",
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <span className="text-sm font-bold text-white">KK</span>
            </div>
            <span className="text-lg font-bold text-gray-900">
              Kaaj<span className="text-primary-600">Kormo</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <Link
              to="/jobs"
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 [&.active]:bg-primary-50 [&.active]:text-primary-600"
            >
              Find Jobs
            </Link>

            <SignedIn>
              {user?.role === "candidate" && (
                <>
                  <Link
                    to="/candidate/dashboard"
                    className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 [&.active]:bg-primary-50 [&.active]:text-primary-600"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/candidate/discover"
                    className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 [&.active]:bg-primary-50 [&.active]:text-primary-600"
                  >
                    <Compass className="h-4 w-4" />
                    Discover
                  </Link>
                  <Link
                    to="/candidate/applications"
                    className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 [&.active]:bg-primary-50 [&.active]:text-primary-600"
                  >
                    Applications
                  </Link>
                </>
              )}

              {user?.role === "employer" && (
                <>
                  <Link
                    to="/employer/dashboard"
                    className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 [&.active]:bg-primary-50 [&.active]:text-primary-600"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/employer/post-job"
                    className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 [&.active]:bg-primary-50 [&.active]:text-primary-600"
                  >
                    Post Job
                  </Link>
                </>
              )}

              {user?.role === "admin" && (
                <Link
                  to="/admin/dashboard"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 [&.active]:bg-primary-50 [&.active]:text-primary-600"
                >
                  Admin
                </Link>
              )}
            </SignedIn>
          </nav>

          <div className="flex items-center gap-2">
            <SignedIn>
              <CommandTrigger onClick={() => setCmdOpen(true)} className="hidden md:flex" />
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8",
                  },
                }}
              />
            </SignedIn>

            <SignedOut>
              <div className="hidden items-center gap-2 md:flex">
                <Link to="/auth/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth/register">
                  <Button variant="gradient" size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            </SignedOut>

            <button
              className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 md:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <CommandPalette items={commandItems} open={cmdOpen} onOpenChange={setCmdOpen} />
    </>
  );
}
