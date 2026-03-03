import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  CheckCircle,
  Eye,
  MessageSquare,
  Phone,
  Star,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Spinner } from "../../components/ui/Spinner";
import { useCandidateApplications } from "../../lib/queries/candidate";
import { cn, formatDate, timeAgo } from "../../lib/utils";

export const Route = createFileRoute("/candidate/applications")({
  component: CandidateApplications,
});

const statusConfig: Record<
  string,
  {
    label: string;
    variant: "default" | "info" | "success" | "warning" | "danger";
    icon: React.ReactNode;
  }
> = {
  pending: { label: "Pending", variant: "default", icon: <Briefcase className="h-3.5 w-3.5" /> },
  viewed: { label: "Viewed", variant: "info", icon: <Eye className="h-3.5 w-3.5" /> },
  shortlisted: { label: "Shortlisted", variant: "info", icon: <Star className="h-3.5 w-3.5" /> },
  phone_screen: {
    label: "Phone Screen",
    variant: "warning",
    icon: <Phone className="h-3.5 w-3.5" />,
  },
  interview: {
    label: "Interview",
    variant: "warning",
    icon: <MessageSquare className="h-3.5 w-3.5" />,
  },
  offered: { label: "Offered", variant: "success", icon: <CheckCircle className="h-3.5 w-3.5" /> },
  rejected: { label: "Rejected", variant: "danger", icon: <XCircle className="h-3.5 w-3.5" /> },
  withdrawn: { label: "Withdrawn", variant: "default", icon: <XCircle className="h-3.5 w-3.5" /> },
  hired: { label: "Hired", variant: "success", icon: <CheckCircle className="h-3.5 w-3.5" /> },
};

const statusFilters = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "viewed", label: "Viewed" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "interview", label: "Interview" },
  { value: "offered", label: "Offered" },
  { value: "rejected", label: "Rejected" },
];

const pipelineStages = ["pending", "viewed", "shortlisted", "interview", "offered", "hired"];

function CandidateApplications() {
  const [statusFilter, setStatusFilter] = useState("");
  const { data, isLoading } = useCandidateApplications(statusFilter || undefined);

  const applications = data?.data ?? [];

  // Pipeline visualization counts
  const stageCounts = pipelineStages.map((stage) => ({
    stage,
    count: applications.filter((a) => a.status === stage).length,
    ...statusConfig[stage],
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
      <p className="mt-1 text-gray-500">Track your job applications and progress.</p>

      {/* Pipeline viz */}
      {!statusFilter && applications.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <div className="flex items-center gap-1 min-w-max">
            {stageCounts.map((stage, i) => (
              <div key={stage.stage} className="flex items-center">
                <div
                  className={cn(
                    "flex flex-col items-center rounded-lg px-4 py-3 text-center min-w-[90px]",
                    stage.count > 0 ? "bg-primary-50" : "bg-gray-50",
                  )}
                >
                  <span
                    className={cn(
                      "text-xl font-bold",
                      stage.count > 0 ? "text-primary-600" : "text-gray-400",
                    )}
                  >
                    {stage.count}
                  </span>
                  <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-gray-500">
                    {stage.label}
                  </span>
                </div>
                {i < stageCounts.length - 1 && (
                  <ArrowRight className="mx-1 h-4 w-4 shrink-0 text-gray-300" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status filter tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        {statusFilters.map((sf) => (
          <button
            key={sf.value}
            onClick={() => setStatusFilter(sf.value)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              statusFilter === sf.value
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200",
            )}
          >
            {sf.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="mt-8 flex justify-center">
          <Spinner />
        </div>
      ) : applications.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            preset="no-data"
            title={statusFilter ? `No ${statusFilter} applications` : "No applications yet"}
            description="Start applying to jobs to track your progress here."
            action={{ label: "Browse Jobs", onClick: () => {} }}
          />
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {applications.map((app, i) => {
            const config = statusConfig[app.status] ?? statusConfig.pending;
            return (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className="p-4 sm:flex sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Link
                        to="/jobs/$jobSlug"
                        params={{ jobSlug: app.job?.slug ?? "" }}
                        className="font-medium text-gray-900 hover:text-primary-600 truncate"
                      >
                        {app.job?.title ?? "Job"}
                      </Link>
                      <Badge variant={config.variant} icon={config.icon}>
                        {config.label}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {app.job?.company?.name ?? "Company"}
                      {app.job?.location && ` · ${app.job.location}`}
                    </p>
                  </div>
                  <div className="mt-2 text-sm text-gray-400 sm:mt-0 sm:text-right">
                    <p>Applied {timeAgo(app.created_at)}</p>
                    <p className="text-xs">{formatDate(app.created_at)}</p>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
