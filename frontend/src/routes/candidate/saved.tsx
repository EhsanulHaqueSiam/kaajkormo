import { createFileRoute, Link } from "@tanstack/react-router";
import { JobCard, JobCardSkeleton } from "../../components/jobs/JobCard";
import { Button } from "../../components/ui/Button";
import { useSavedJobs } from "../../lib/queries/candidate";

export const Route = createFileRoute("/candidate/saved")({
  component: SavedJobs,
});

function SavedJobs() {
  const { data, isLoading } = useSavedJobs();
  const jobs = data?.data ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900">Saved Jobs</h1>
      <p className="mt-1 text-gray-500">Jobs you've bookmarked for later.</p>

      <div className="mt-8">
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <JobCardSkeleton key={i} />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
            <p className="text-gray-500">No saved jobs yet.</p>
            <Link to="/jobs" className="mt-3 inline-block">
              <Button size="sm">Browse Jobs</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
