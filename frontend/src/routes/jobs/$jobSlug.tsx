import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Bookmark,
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  ExternalLink,
  MapPin,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Modal } from "../../components/ui/Modal";
import { ProgressBar } from "../../components/ui/Progress";
import { Spinner } from "../../components/ui/Spinner";
import { Textarea } from "../../components/ui/Textarea";
import { showToast } from "../../components/ui/Toast";
import { useAppUser } from "../../lib/auth";
import { useCandidateProfile } from "../../lib/queries/candidate";
import { useApply, useJob, useSaveJob } from "../../lib/queries/jobs";
import { formatDate, formatSalary, matchScore, timeAgo } from "../../lib/utils";

export const Route = createFileRoute("/jobs/$jobSlug")({
  component: JobDetailPage,
});

const typeBadge: Record<
  string,
  { label: string; variant: "default" | "success" | "warning" | "info" }
> = {
  "full-time": { label: "Full-time", variant: "success" },
  "part-time": { label: "Part-time", variant: "info" },
  contract: { label: "Contract", variant: "warning" },
  internship: { label: "Internship", variant: "default" },
};

function JobDetailPage() {
  const { jobSlug } = Route.useParams();
  const { user } = useAppUser();
  const { data: job, isLoading, isError } = useJob(jobSlug);
  const apply = useApply();
  const saveJob = useSaveJob();
  const { data: profile } = useCandidateProfile();
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900">Job Not Found</h1>
        <p className="mt-2 text-gray-500">This job listing may have been removed.</p>
        <Link to="/jobs" className="mt-4 inline-block">
          <Button variant="outline">Browse Jobs</Button>
        </Link>
      </div>
    );
  }

  const badge = typeBadge[job.job_type] ?? { label: job.job_type, variant: "default" as const };
  const score = profile?.skills ? matchScore(profile.skills, job.skills) : null;

  async function handleApply() {
    if (!job) return;
    try {
      await apply.mutateAsync({ job_id: job.id, cover_letter: coverLetter || undefined });
      setShowApplyModal(false);
      setCoverLetter("");
      showToast.success("Application submitted!");
    } catch {
      showToast.error("Failed to submit application");
    }
  }

  async function handleQuickApply() {
    if (!job) return;
    try {
      await apply.mutateAsync({ job_id: job.id });
      showToast.success("Quick applied!");
    } catch {
      showToast.error("Failed to apply");
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-500">
        <Link to="/jobs" className="hover:text-gray-700">
          Jobs
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{job.title}</span>
      </nav>

      <div className="lg:flex lg:gap-8">
        {/* Main */}
        <div className="flex-1">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              {/* Header */}
              <div className="flex items-start gap-4">
                {job.company?.logo_url ? (
                  <img
                    src={job.company.logo_url}
                    alt={job.company.name}
                    className="h-16 w-16 shrink-0 rounded-xl border border-gray-100 object-contain"
                  />
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 text-2xl font-bold text-white">
                    {(job.company?.name ?? job.title).charAt(0)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                  <p className="mt-1 text-gray-600">{job.company?.name ?? "Company"}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                    {job.is_remote && <Badge variant="info">Remote</Badge>}
                    {job.location && (
                      <span className="flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="h-3.5 w-3.5" />
                        {job.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Meta grid */}
              <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl bg-gray-50 p-4 sm:grid-cols-4">
                <MetaItem
                  icon={DollarSign}
                  label="Salary"
                  value={formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
                />
                <MetaItem icon={Briefcase} label="Experience" value={job.experience_level} />
                <MetaItem icon={Clock} label="Posted" value={timeAgo(job.created_at)} />
                {job.deadline && (
                  <MetaItem icon={Calendar} label="Deadline" value={formatDate(job.deadline)} />
                )}
              </div>

              {/* Match score */}
              {score !== null && score > 0 && (
                <div className="mt-6 rounded-xl border border-primary-100 bg-primary-50/50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-primary-600" />
                      <span className="text-sm font-medium text-gray-900">Skill Match</span>
                    </div>
                    <span className="text-sm font-bold text-primary-600">{score}%</span>
                  </div>
                  <ProgressBar
                    value={score}
                    color={score >= 70 ? "success" : score >= 40 ? "primary" : "warning"}
                    size="sm"
                    className="mt-2"
                  />
                </div>
              )}

              {/* Description */}
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-900">Description</h2>
                <div className="prose mt-3 max-w-none text-sm leading-relaxed text-gray-600 whitespace-pre-wrap">
                  {job.description}
                </div>
              </div>

              {job.requirements && (
                <div className="mt-6">
                  <h2 className="text-lg font-semibold text-gray-900">Requirements</h2>
                  <div className="prose mt-3 max-w-none text-sm leading-relaxed text-gray-600 whitespace-pre-wrap">
                    {job.requirements}
                  </div>
                </div>
              )}

              {job.responsibilities && (
                <div className="mt-6">
                  <h2 className="text-lg font-semibold text-gray-900">Responsibilities</h2>
                  <div className="prose mt-3 max-w-none text-sm leading-relaxed text-gray-600 whitespace-pre-wrap">
                    {job.responsibilities}
                  </div>
                </div>
              )}

              {job.skills.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-lg font-semibold text-gray-900">Required Skills</h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {job.skills.map((skill) => {
                      const hasSkill = profile?.skills?.includes(skill);
                      return (
                        <Badge
                          key={skill}
                          variant={hasSkill ? "success" : "default"}
                          icon={hasSkill ? <CheckCircle className="h-3 w-3" /> : undefined}
                        >
                          {skill}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        </div>

        {/* Sidebar */}
        <aside className="mt-6 w-full shrink-0 lg:mt-0 lg:w-80">
          <div className="sticky top-24 space-y-4">
            <Card>
              <div className="space-y-3">
                {user?.role === "candidate" ? (
                  <>
                    <Button className="w-full" onClick={() => setShowApplyModal(true)}>
                      Apply Now
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      icon={<Zap className="h-4 w-4" />}
                      onClick={handleQuickApply}
                      loading={apply.isPending}
                    >
                      Quick Apply
                    </Button>
                  </>
                ) : !user ? (
                  <Link to="/auth/login" className="block">
                    <Button className="w-full">Sign In to Apply</Button>
                  </Link>
                ) : null}
                {user?.role === "candidate" && (
                  <Button
                    variant="ghost"
                    className="w-full"
                    icon={<Bookmark className="h-4 w-4" />}
                    onClick={() => {
                      saveJob.mutate(job.id, {
                        onSuccess: () => showToast.success("Job saved!"),
                      });
                    }}
                    loading={saveJob.isPending}
                  >
                    Save Job
                  </Button>
                )}
              </div>
            </Card>

            {job.company && (
              <Card>
                <h3 className="font-semibold text-gray-900">About {job.company.name}</h3>
                {job.company.description && (
                  <p className="mt-2 text-sm text-gray-500">{job.company.description}</p>
                )}
                <div className="mt-3 space-y-2 text-sm text-gray-600">
                  {job.company.industry && (
                    <InfoRow label="Industry" value={job.company.industry} />
                  )}
                  {job.company.size && <InfoRow label="Size" value={job.company.size} />}
                  {job.company.location && (
                    <InfoRow label="Location" value={job.company.location} />
                  )}
                  {job.company.website && (
                    <a
                      href={job.company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-sm text-primary-600 hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Visit website
                    </a>
                  )}
                </div>
              </Card>
            )}
          </div>
        </aside>
      </div>

      {/* Apply Modal */}
      <Modal
        open={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        title={`Apply for ${job.title}`}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Submit your application to {job.company?.name ?? "this company"}.
          </p>
          <Textarea
            id="coverLetter"
            label="Cover Letter (optional)"
            placeholder="Write a brief cover letter..."
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            maxLength={2000}
          />
          {apply.isError && (
            <div className="rounded-lg bg-danger-50 p-3 text-sm text-danger-700">
              Failed to submit application. Please try again.
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowApplyModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleApply} loading={apply.isPending}>
              Submit Application
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function MetaItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs font-medium uppercase text-gray-500">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-1 text-sm font-semibold text-gray-900 capitalize">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <p>
      <span className="font-medium">{label}:</span> {value}
    </p>
  );
}
