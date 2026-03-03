import { Link } from "@tanstack/react-router";
import { formatSalary, timeAgo } from "../../lib/utils";
import type { Job } from "../../types";
import { Badge } from "../ui/Badge";

const jobTypeBadge: Record<
  string,
  { label: string; variant: "default" | "info" | "success" | "warning" }
> = {
  "full-time": { label: "Full-time", variant: "success" },
  "part-time": { label: "Part-time", variant: "info" },
  contract: { label: "Contract", variant: "warning" },
  internship: { label: "Internship", variant: "default" },
};

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const badge = jobTypeBadge[job.job_type] ?? { label: job.job_type, variant: "default" as const };

  return (
    <Link
      to="/jobs/$jobSlug"
      params={{ jobSlug: job.slug }}
      className="block rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-primary-200 hover:shadow-md"
    >
      <div className="flex items-start gap-4">
        {job.company?.logo_url ? (
          <img
            src={job.company.logo_url}
            alt={job.company.name}
            className="h-12 w-12 shrink-0 rounded-lg border border-gray-100 object-contain"
          />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-lg font-bold text-primary-600">
            {(job.company?.name ?? job.title).charAt(0)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900 truncate">{job.title}</h3>
          <p className="mt-0.5 text-sm text-gray-500">{job.company?.name ?? "Company"}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-500">
        {job.location && (
          <span className="flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
              />
            </svg>
            {job.location}
          </span>
        )}
        {job.is_remote && <Badge variant="info">Remote</Badge>}
        <Badge variant={badge.variant}>{badge.label}</Badge>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-900">
          {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
        </span>
        <span className="text-xs text-gray-400">{timeAgo(job.created_at)}</span>
      </div>

      {job.skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {job.skills.slice(0, 4).map((skill) => (
            <span key={skill} className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
              {skill}
            </span>
          ))}
          {job.skills.length > 4 && (
            <span className="text-xs text-gray-400">+{job.skills.length - 4} more</span>
          )}
        </div>
      )}
    </Link>
  );
}

export function JobCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-lg bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-3/4 rounded bg-gray-200" />
          <div className="h-4 w-1/2 rounded bg-gray-200" />
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <div className="h-5 w-20 rounded-full bg-gray-200" />
        <div className="h-5 w-16 rounded-full bg-gray-200" />
      </div>
      <div className="mt-3 flex justify-between">
        <div className="h-4 w-24 rounded bg-gray-200" />
        <div className="h-4 w-16 rounded bg-gray-200" />
      </div>
    </div>
  );
}
