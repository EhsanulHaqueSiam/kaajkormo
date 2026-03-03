import type { JobSearchParams } from "../../types";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";

interface JobFiltersProps {
  filters: JobSearchParams;
  onChange: (filters: JobSearchParams) => void;
  onReset: () => void;
  className?: string;
}

const jobTypeOptions = [
  { value: "", label: "All Types" },
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
];

const experienceOptions = [
  { value: "", label: "All Levels" },
  { value: "entry", label: "Entry Level" },
  { value: "mid", label: "Mid Level" },
  { value: "senior", label: "Senior Level" },
  { value: "lead", label: "Lead" },
  { value: "executive", label: "Executive" },
];

const workplaceOptions = [
  { value: "", label: "Any Workplace" },
  { value: "true", label: "Remote Only" },
  { value: "false", label: "On-site Only" },
];

export function JobFilters({ filters, onChange, onReset, className }: JobFiltersProps) {
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Filters</h3>
        <Button variant="ghost" size="sm" onClick={onReset}>
          Reset
        </Button>
      </div>

      <div className="space-y-4">
        <Input
          label="Location"
          placeholder="e.g. Dhaka, Chittagong"
          value={filters.location ?? ""}
          onChange={(e) => onChange({ ...filters, location: e.target.value || undefined })}
        />

        <Select
          label="Job Type"
          options={jobTypeOptions}
          value={filters.job_type ?? ""}
          onChange={(val) =>
            onChange({
              ...filters,
              job_type: (val || undefined) as JobSearchParams["job_type"],
            })
          }
        />

        <Select
          label="Experience Level"
          options={experienceOptions}
          value={filters.experience_level ?? ""}
          onChange={(val) =>
            onChange({
              ...filters,
              experience_level: (val || undefined) as JobSearchParams["experience_level"],
            })
          }
        />

        <Select
          label="Workplace"
          options={workplaceOptions}
          value={filters.is_remote === true ? "true" : filters.is_remote === false ? "false" : ""}
          onChange={(val) =>
            onChange({
              ...filters,
              is_remote: val === "true" ? true : val === "false" ? false : undefined,
            })
          }
        />
      </div>
    </div>
  );
}
