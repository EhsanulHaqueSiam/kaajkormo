import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Textarea } from "../../components/ui/Textarea";
import { ApiError } from "../../lib/api";
import { useCreateJob } from "../../lib/queries/employer";
import { cn } from "../../lib/utils";
import type { ExperienceLevel, JobType } from "../../types";

export const Route = createFileRoute("/employer/post-job")({
  component: PostJobPage,
});

const steps = ["Basic Info", "Details", "Compensation", "Review"];

const jobTypeOptions = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
];

const experienceOptions = [
  { value: "entry", label: "Entry Level" },
  { value: "mid", label: "Mid Level" },
  { value: "senior", label: "Senior Level" },
  { value: "lead", label: "Lead" },
  { value: "executive", label: "Executive" },
];

function PostJobPage() {
  const navigate = useNavigate();
  const createJob = useCreateJob();
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");

  // Form state
  const [title, setTitle] = useState("");
  const [jobType, setJobType] = useState<JobType>("full-time");
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>("mid");
  const [location, setLocation] = useState("");
  const [isRemote, setIsRemote] = useState(false);
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [salaryCurrency, setSalaryCurrency] = useState("BDT");
  const [deadline, setDeadline] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);

  function addSkill() {
    const trimmed = skillsInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }
    setSkillsInput("");
  }

  function next() {
    setStep((s) => Math.min(s + 1, steps.length - 1));
  }
  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await createJob.mutateAsync({
        title,
        job_type: jobType,
        experience_level: experienceLevel,
        location: location || undefined,
        is_remote: isRemote,
        description,
        requirements: requirements || undefined,
        responsibilities: responsibilities || undefined,
        salary_min: salaryMin ? Number(salaryMin) : undefined,
        salary_max: salaryMax ? Number(salaryMax) : undefined,
        salary_currency: salaryCurrency,
        deadline: deadline || undefined,
        skills,
      });
      navigate({ to: "/employer/dashboard" });
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Failed to create job. Please try again.");
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900">Post a New Job</h1>

      {/* Step indicator */}
      <div className="mt-6 flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStep(i)}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
                i <= step ? "bg-primary-600 text-white" : "bg-gray-200 text-gray-500",
              )}
            >
              {i + 1}
            </button>
            <span
              className={cn(
                "hidden text-sm sm:inline",
                i <= step ? "text-primary-600 font-medium" : "text-gray-400",
              )}
            >
              {s}
            </span>
            {i < steps.length - 1 && (
              <div
                className={cn("h-0.5 w-6 sm:w-12", i < step ? "bg-primary-600" : "bg-gray-200")}
              />
            )}
          </div>
        ))}
      </div>

      {error && <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Step 1: Basic Info */}
        {step === 0 && (
          <Card className="mt-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Basic Information</h2>
            <div className="space-y-4">
              <Input
                id="title"
                label="Job Title"
                placeholder="e.g. Senior React Developer"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Select
                  id="jobType"
                  label="Job Type"
                  options={jobTypeOptions}
                  value={jobType}
                  onChange={(val) => setJobType(val as JobType)}
                />
                <Select
                  id="experienceLevel"
                  label="Experience Level"
                  options={experienceOptions}
                  value={experienceLevel}
                  onChange={(val) => setExperienceLevel(val as ExperienceLevel)}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  id="location"
                  label="Location"
                  placeholder="e.g. Dhaka, Bangladesh"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={isRemote}
                      onChange={(e) => setIsRemote(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    Remote position
                  </label>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button type="button" onClick={next}>
                Next
              </Button>
            </div>
          </Card>
        )}

        {/* Step 2: Details */}
        {step === 1 && (
          <Card className="mt-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Job Details</h2>
            <div className="space-y-4">
              <Textarea
                id="description"
                label="Description"
                placeholder="Describe the role, team, and what the candidate will be doing..."
                rows={6}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <Textarea
                id="requirements"
                label="Requirements"
                placeholder="List the qualifications and experience needed..."
                rows={4}
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
              />
              <Textarea
                id="responsibilities"
                label="Responsibilities"
                placeholder="What will this person be responsible for..."
                rows={4}
                value={responsibilities}
                onChange={(e) => setResponsibilities(e.target.value)}
              />
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Skills</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add skills (press Enter)"
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addSkill}>
                    Add
                  </Button>
                </div>
                {skills.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-sm text-primary-700"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => setSkills(skills.filter((s) => s !== skill))}
                          className="ml-1 text-primary-400 hover:text-primary-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-between">
              <Button type="button" variant="outline" onClick={back}>
                Back
              </Button>
              <Button type="button" onClick={next}>
                Next
              </Button>
            </div>
          </Card>
        )}

        {/* Step 3: Compensation */}
        {step === 2 && (
          <Card className="mt-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Compensation & Deadline</h2>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <Input
                  id="salaryMin"
                  label="Minimum Salary"
                  type="number"
                  placeholder="e.g. 30000"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                />
                <Input
                  id="salaryMax"
                  label="Maximum Salary"
                  type="number"
                  placeholder="e.g. 60000"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                />
                <Select
                  id="currency"
                  label="Currency"
                  options={[
                    { value: "BDT", label: "BDT (৳)" },
                    { value: "USD", label: "USD ($)" },
                  ]}
                  value={salaryCurrency}
                  onChange={(val) => setSalaryCurrency(val)}
                />
              </div>
              <Input
                id="deadline"
                label="Application Deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
            <div className="mt-6 flex justify-between">
              <Button type="button" variant="outline" onClick={back}>
                Back
              </Button>
              <Button type="button" onClick={next}>
                Next
              </Button>
            </div>
          </Card>
        )}

        {/* Step 4: Review */}
        {step === 3 && (
          <Card className="mt-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Review & Publish</h2>
            <div className="space-y-4 text-sm">
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="font-medium text-gray-900">{title || "Untitled"}</p>
                <p className="mt-1 text-gray-500">
                  {jobType} · {experienceLevel} · {location || "No location"}{" "}
                  {isRemote && "· Remote"}
                </p>
                {(salaryMin || salaryMax) && (
                  <p className="mt-1 text-gray-500">
                    Salary: {salaryCurrency} {salaryMin && salaryMin}
                    {salaryMin && salaryMax && " - "}
                    {salaryMax && salaryMax}
                  </p>
                )}
                {deadline && <p className="mt-1 text-gray-500">Deadline: {deadline}</p>}
                {skills.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {skills.map((skill) => (
                      <span key={skill} className="rounded bg-gray-200 px-2 py-0.5 text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {description && (
                <div>
                  <p className="font-medium text-gray-700">Description</p>
                  <p className="mt-1 whitespace-pre-wrap text-gray-500">
                    {description.slice(0, 300)}
                    {description.length > 300 && "..."}
                  </p>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-between">
              <Button type="button" variant="outline" onClick={back}>
                Back
              </Button>
              <Button type="submit" loading={createJob.isPending}>
                Publish Job
              </Button>
            </div>
          </Card>
        )}
      </form>
    </div>
  );
}
