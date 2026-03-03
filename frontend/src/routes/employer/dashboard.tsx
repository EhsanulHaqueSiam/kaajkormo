import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Briefcase,
  Eye,
  Users,
  TrendingUp,
  Plus,
  ArrowRight,
  Building,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Spinner";
import { StatsCard } from "../../components/ui/StatsCard";
import { useEmployerJobs } from "../../lib/queries/employer";
import { useAppUser } from "../../lib/auth";
import { timeAgo } from "../../lib/utils";

export const Route = createFileRoute("/employer/dashboard")({
  component: EmployerDashboard,
});

const statusVariant: Record<string, "default" | "success" | "warning" | "info"> = {
  draft: "default",
  published: "success",
  closed: "warning",
  archived: "default",
};

function EmployerDashboard() {
  const { user } = useAppUser();
  const { data, isLoading } = useEmployerJobs();
  const jobs = data?.data ?? [];

  const publishedCount = jobs.filter((j) => j.status === "published").length;
  const draftCount = jobs.filter((j) => j.status === "draft").length;
  const closedCount = jobs.filter((j) => j.status === "closed").length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employer Dashboard</h1>
          <p className="mt-1 text-gray-500">
            Welcome back, {user?.full_name?.split(" ")[0] ?? "there"}
          </p>
        </div>
        <Link to="/employer/post-job">
          <Button variant="gradient" icon={<Plus className="h-4 w-4" />}>Post New Job</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatsCard icon={<Briefcase className="h-5 w-5" />} label="Total Jobs" value={isLoading ? 0 : jobs.length} />
        <StatsCard icon={<Eye className="h-5 w-5" />} label="Published" value={isLoading ? 0 : publishedCount} trend={{ value: 12, isPositive: true }} />
        <StatsCard icon={<Users className="h-5 w-5" />} label="Drafts" value={isLoading ? 0 : draftCount} />
        <StatsCard icon={<TrendingUp className="h-5 w-5" />} label="Closed" value={isLoading ? 0 : closedCount} />
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Link to="/employer/candidates">
          <motion.div
            whileHover={{ y: -2 }}
            className="rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md"
          >
            <Users className="h-8 w-8 text-primary-500" />
            <h3 className="mt-3 font-semibold text-gray-900">CV Bank</h3>
            <p className="mt-1 text-sm text-gray-500">Browse candidate profiles</p>
          </motion.div>
        </Link>
        <Link to="/employer/interviews">
          <motion.div
            whileHover={{ y: -2 }}
            className="rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md"
          >
            <TrendingUp className="h-8 w-8 text-accent-500" />
            <h3 className="mt-3 font-semibold text-gray-900">Interviews</h3>
            <p className="mt-1 text-sm text-gray-500">Manage interview schedule</p>
          </motion.div>
        </Link>
        <Link to="/employer/company-profile">
          <motion.div
            whileHover={{ y: -2 }}
            className="rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md"
          >
            <Building className="h-8 w-8 text-success-500" />
            <h3 className="mt-3 font-semibold text-gray-900">Company Profile</h3>
            <p className="mt-1 text-sm text-gray-500">Edit company details</p>
          </motion.div>
        </Link>
      </div>

      {/* Jobs list */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Your Job Listings</h2>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : jobs.length === 0 ? (
          <Card className="text-center">
            <Briefcase className="mx-auto h-8 w-8 text-gray-300" />
            <p className="mt-2 text-gray-500">No jobs posted yet.</p>
            <Link to="/employer/post-job" className="mt-3 inline-block">
              <Button size="sm">Post Your First Job</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {jobs.map((job, i) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className="p-4 sm:flex sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 truncate">{job.title}</p>
                      <Badge variant={statusVariant[job.status] ?? "default"}>
                        {job.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Posted {timeAgo(job.created_at)}
                      {job.location && ` · ${job.location}`}
                    </p>
                  </div>
                  <div className="mt-2 flex gap-2 sm:mt-0">
                    <Link to="/employer/applicants/$jobId" params={{ jobId: job.id }}>
                      <Button variant="outline" size="sm" iconRight={<ArrowRight className="h-3.5 w-3.5" />}>
                        Applicants
                      </Button>
                    </Link>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
