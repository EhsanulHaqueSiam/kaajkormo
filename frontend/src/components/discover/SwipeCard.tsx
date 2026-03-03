import { motion, useMotionValue, useTransform, type PanInfo } from "framer-motion";
import { MapPin, Briefcase, DollarSign, Clock } from "lucide-react";
import { Badge } from "../ui/Badge";
import { formatSalary, timeAgo } from "../../lib/utils";
import type { Job } from "../../types";

interface SwipeCardProps {
  job: Job;
  onSwipe: (direction: "left" | "right" | "up") => void;
  isTop?: boolean;
}

export function SwipeCard({ job, onSwipe, isTop = false }: SwipeCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const applyOpacity = useTransform(x, [0, 100], [0, 1]);
  const skipOpacity = useTransform(x, [-100, 0], [1, 0]);
  const saveOpacity = useTransform(y, [-100, 0], [1, 0]);

  function handleDragEnd(_: unknown, info: PanInfo) {
    const threshold = 100;
    if (info.offset.x > threshold) {
      onSwipe("right");
    } else if (info.offset.x < -threshold) {
      onSwipe("left");
    } else if (info.offset.y < -threshold) {
      onSwipe("up");
    }
  }

  return (
    <motion.div
      drag={isTop}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.8}
      onDragEnd={handleDragEnd}
      style={isTop ? { x, y, rotate } : undefined}
      className="absolute inset-0 cursor-grab rounded-2xl border border-gray-200 bg-white shadow-lg active:cursor-grabbing"
    >
      {/* Swipe indicators */}
      {isTop && (
        <>
          <motion.div
            style={{ opacity: applyOpacity }}
            className="absolute left-6 top-6 z-10 rounded-xl border-3 border-success-500 px-4 py-2 font-bold text-success-500 -rotate-12"
          >
            APPLY
          </motion.div>
          <motion.div
            style={{ opacity: skipOpacity }}
            className="absolute right-6 top-6 z-10 rounded-xl border-3 border-danger-500 px-4 py-2 font-bold text-danger-500 rotate-12"
          >
            SKIP
          </motion.div>
          <motion.div
            style={{ opacity: saveOpacity }}
            className="absolute left-1/2 top-6 z-10 -translate-x-1/2 rounded-xl border-3 border-primary-500 px-4 py-2 font-bold text-primary-500"
          >
            SAVE
          </motion.div>
        </>
      )}

      <div className="flex h-full flex-col p-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          {job.company?.logo_url ? (
            <img
              src={job.company.logo_url}
              alt={job.company.name}
              className="h-14 w-14 shrink-0 rounded-xl border border-gray-100 object-contain"
            />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 text-xl font-bold text-white">
              {(job.company?.name ?? job.title).charAt(0)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold text-gray-900 truncate">{job.title}</h2>
            <p className="text-sm text-gray-500">{job.company?.name ?? "Company"}</p>
          </div>
        </div>

        {/* Meta */}
        <div className="mt-5 flex flex-wrap gap-2">
          {job.location && (
            <div className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-1.5 text-xs text-gray-600">
              <MapPin className="h-3.5 w-3.5" />
              {job.location}
            </div>
          )}
          <div className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-1.5 text-xs text-gray-600">
            <Briefcase className="h-3.5 w-3.5" />
            {job.job_type}
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-1.5 text-xs text-gray-600">
            <DollarSign className="h-3.5 w-3.5" />
            {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-1.5 text-xs text-gray-600">
            <Clock className="h-3.5 w-3.5" />
            {timeAgo(job.created_at)}
          </div>
          {job.is_remote && <Badge variant="info">Remote</Badge>}
        </div>

        {/* Description */}
        <div className="mt-5 flex-1 overflow-y-auto">
          <p className="text-sm leading-relaxed text-gray-600 line-clamp-6">
            {job.description}
          </p>
        </div>

        {/* Skills */}
        {job.skills.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5 border-t border-gray-100 pt-4">
            {job.skills.slice(0, 6).map((skill) => (
              <span
                key={skill}
                className="rounded-md bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700"
              >
                {skill}
              </span>
            ))}
            {job.skills.length > 6 && (
              <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs text-gray-500">
                +{job.skills.length - 6} more
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
