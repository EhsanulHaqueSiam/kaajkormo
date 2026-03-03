import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Briefcase,
  Clock,
  CheckCircle,
  Compass,
  Calendar,
  Bookmark,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Spinner";
import { StatsCard } from "../../components/ui/StatsCard";
import { useCandidateApplications } from "../../lib/queries/candidate";
import { useUpcomingInterviews } from "../../lib/queries/interviews";
import { useAppUser } from "../../lib/auth";
import { timeAgo, formatDate } from "../../lib/utils";

export const Route = createFileRoute("/candidate/dashboard")({
  component: CandidateDashboard,
});

const statusVariant: Record<string, "default" | "info" | "success" | "warning" | "danger"> = {
  pending: "default",
  viewed: "info",
  shortlisted: "info",
  interview: "warning",
  offered: "success",
  rejected: "danger",
  withdrawn: "default",
  hired: "success",
};

function CandidateDashboard() {
  const { user } = useAppUser();
  const { data, isLoading } = useCandidateApplications();
  const { data: interviewsData } = useUpcomingInterviews();

  const applications = data?.data ?? [];
  const interviews = interviewsData?.data ?? [];
  const interviewCount = applications.filter((a) => a.status === "interview").length;
  const pendingCount = applications.filter((a) => a.status === "pending").length;
  const offeredCount = applications.filter((a) => a.status === "offered").length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.full_name?.split(" ")[0] ?? "there"}!
        </h1>
        <p className="mt-1 text-gray-500">Here's your job search overview.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatsCard icon={<Briefcase className="h-5 w-5" />} label="Total Applications" value={isLoading ? 0 : applications.length} />
        <StatsCard icon={<Clock className="h-5 w-5" />} label="Pending" value={isLoading ? 0 : pendingCount} />
        <StatsCard icon={<Calendar className="h-5 w-5" />} label="Interviews" value={isLoading ? 0 : interviewCount} />
        <StatsCard icon={<CheckCircle className="h-5 w-5" />} label="Offers" value={isLoading ? 0 : offeredCount} />
      </div>

      {/* Discover CTA */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6"
      >
        <Link to="/candidate/discover">
          <div className="group rounded-2xl border border-primary-200 bg-gradient-to-r from-primary-50 to-accent-50 p-6 transition-all hover:shadow-md">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 text-white shadow-md">
                <Compass className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Discover Jobs</h3>
                <p className="text-sm text-gray-500">Swipe through curated job matches</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </Link>
      </motion.div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Upcoming Interviews */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Upcoming Interviews</h2>
          {interviews.length === 0 ? (
            <Card className="text-center">
              <Calendar className="mx-auto h-8 w-8 text-gray-300" />
              <p className="mt-2 text-sm text-gray-500">No upcoming interviews</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {interviews.slice(0, 3).map((interview) => (
                <Card key={interview.id} className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {interview.interview_type.replace("_", " ")} Interview
                    </p>
                    <p className="text-xs text-gray-500">{formatDate(interview.scheduled_at)}</p>
                  </div>
                  <Badge variant="info">{interview.status}</Badge>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Recent Applications */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
            <Link to="/candidate/applications" className="text-sm text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : applications.length === 0 ? (
            <Card className="text-center">
              <Briefcase className="mx-auto h-8 w-8 text-gray-300" />
              <p className="mt-2 text-sm text-gray-500">No applications yet</p>
              <Link to="/jobs" className="mt-3 inline-block">
                <Button size="sm">Browse Jobs</Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-3">
              {applications.slice(0, 5).map((app) => (
                <Card key={app.id} className="flex items-center justify-between p-4">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate text-sm">
                      {app.job?.title ?? "Job"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {app.job?.company?.name ?? "Company"} &middot; {timeAgo(app.created_at)}
                    </p>
                  </div>
                  <Badge variant={statusVariant[app.status] ?? "default"}>
                    {app.status}
                  </Badge>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-6 flex flex-wrap gap-3">
        <Link to="/jobs">
          <Button variant="outline" size="sm" icon={<Briefcase className="h-4 w-4" />}>Search Jobs</Button>
        </Link>
        <Link to="/candidate/saved">
          <Button variant="outline" size="sm" icon={<Bookmark className="h-4 w-4" />}>Saved Jobs</Button>
        </Link>
        <Link to="/candidate/profile">
          <Button variant="outline" size="sm" icon={<TrendingUp className="h-4 w-4" />}>Edit Profile</Button>
        </Link>
      </div>
    </div>
  );
}
