import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Spinner";
import { usePlatformStats } from "../../lib/queries/admin";

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data: stats, isLoading } = usePlatformStats();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      <p className="mt-1 text-gray-500">Platform overview and management.</p>

      {/* Stats */}
      {isLoading ? (
        <div className="mt-8 flex justify-center">
          <Spinner />
        </div>
      ) : (
        <div className="mt-8 grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card>
            <p className="text-sm text-gray-500">Total Users</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">
              {stats?.total_users ?? 0}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Total Jobs</p>
            <p className="mt-1 text-3xl font-bold text-primary-600">
              {stats?.total_jobs ?? 0}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Applications</p>
            <p className="mt-1 text-3xl font-bold text-green-600">
              {stats?.total_applications ?? 0}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Companies</p>
            <p className="mt-1 text-3xl font-bold text-purple-600">
              {stats?.total_companies ?? 0}
            </p>
          </Card>
        </div>
      )}

      {/* Quick links */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card>
          <h3 className="font-semibold text-gray-900">Job Moderation</h3>
          <p className="mt-1 text-sm text-gray-500">
            Review and moderate job listings.
          </p>
          <Link to="/admin/jobs" className="mt-3 inline-block">
            <Button variant="outline" size="sm">
              Manage Jobs
            </Button>
          </Link>
        </Card>
        <Card>
          <h3 className="font-semibold text-gray-900">User Management</h3>
          <p className="mt-1 text-sm text-gray-500">
            View and manage platform users.
          </p>
          <Link to="/admin/users" className="mt-3 inline-block">
            <Button variant="outline" size="sm">
              Manage Users
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
