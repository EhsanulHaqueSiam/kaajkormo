import { motion } from "framer-motion";
import { Bookmark, Briefcase, DollarSign, Heart, MapPin, X } from "lucide-react";
import { formatSalary, timeAgo } from "../../lib/utils";
import type { Job } from "../../types";
import { Badge } from "../ui/Badge";

interface DiscoverListViewProps {
  jobs: Job[];
  onAction: (job: Job, direction: "left" | "right" | "up") => void;
}

export function DiscoverListView({ jobs, onAction }: DiscoverListViewProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {jobs.map((job) => (
        <motion.div
          key={job.id}
          layout
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="group relative rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          {/* Header */}
          <div className="flex items-start gap-3">
            {job.company?.logo_url ? (
              <img
                src={job.company.logo_url}
                alt={job.company.name}
                className="h-10 w-10 shrink-0 rounded-lg border border-gray-100 object-contain"
              />
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 text-sm font-bold text-white">
                {(job.company?.name ?? job.title).charAt(0)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 truncate">{job.title}</h3>
              <p className="text-sm text-gray-500">{job.company?.name ?? "Company"}</p>
            </div>
          </div>

          {/* Meta */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {job.location && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin className="h-3 w-3" />
                {job.location}
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Briefcase className="h-3 w-3" />
              {job.job_type}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <DollarSign className="h-3 w-3" />
              {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
            </span>
            {job.is_remote && <Badge variant="info">Remote</Badge>}
          </div>

          {/* Description */}
          <p className="mt-3 text-sm leading-relaxed text-gray-600 line-clamp-3">
            {job.description}
          </p>

          {/* Skills */}
          {job.skills.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {job.skills.slice(0, 4).map((skill) => (
                <span
                  key={skill}
                  className="rounded-md bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700"
                >
                  {skill}
                </span>
              ))}
              {job.skills.length > 4 && (
                <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                  +{job.skills.length - 4}
                </span>
              )}
            </div>
          )}

          {/* Time */}
          <p className="mt-3 text-xs text-gray-400">{timeAgo(job.created_at)}</p>

          {/* Action buttons overlay */}
          <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={() => onAction(job, "left")}
              className="rounded-full bg-white p-1.5 text-gray-400 shadow-sm ring-1 ring-gray-200 transition-colors hover:text-danger-500"
              title="Skip"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onAction(job, "up")}
              className="rounded-full bg-white p-1.5 text-gray-400 shadow-sm ring-1 ring-gray-200 transition-colors hover:text-primary-500"
              title="Save"
            >
              <Bookmark className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onAction(job, "right")}
              className="rounded-full bg-white p-1.5 text-gray-400 shadow-sm ring-1 ring-gray-200 transition-colors hover:text-success-500"
              title="Apply"
            >
              <Heart className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
