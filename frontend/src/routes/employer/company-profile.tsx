import { createFileRoute } from "@tanstack/react-router";
import { type FormEvent, useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Spinner } from "../../components/ui/Spinner";
import { Textarea } from "../../components/ui/Textarea";
import { useCompanyProfile, useUpdateCompanyProfile } from "../../lib/queries/employer";

export const Route = createFileRoute("/employer/company-profile")({
  component: CompanyProfilePage,
});

const sizeOptions = [
  { value: "1-10", label: "1-10 employees" },
  { value: "11-50", label: "11-50 employees" },
  { value: "51-200", label: "51-200 employees" },
  { value: "201-500", label: "201-500 employees" },
  { value: "501-1000", label: "501-1000 employees" },
  { value: "1000+", label: "1000+ employees" },
];

function CompanyProfilePage() {
  const { data: company, isLoading } = useCompanyProfile();
  const update = useUpdateCompanyProfile();

  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [size, setSize] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!company) return;
    setName(company.name ?? "");
    setIndustry(company.industry ?? "");
    setSize(company.size ?? "");
    setLocation(company.location ?? "");
    setWebsite(company.website ?? "");
    setDescription(company.description ?? "");
  }, [company]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await update.mutateAsync({
      name,
      industry: industry || undefined,
      size: size || undefined,
      location: location || undefined,
      website: website || undefined,
      description: description || undefined,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
      <p className="mt-1 text-gray-500">
        Keep your company profile up to date to attract top talent.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <Card>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Company Details</h2>
          <div className="space-y-4">
            <Input
              id="companyName"
              label="Company Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="industry"
                label="Industry"
                placeholder="e.g. Technology, Finance"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              />
              <Select
                id="size"
                label="Company Size"
                options={sizeOptions}
                placeholder="Select size"
                value={size}
                onChange={(val) => setSize(val)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="companyLocation"
                label="Location"
                placeholder="e.g. Dhaka, Bangladesh"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <Input
                id="website"
                label="Website"
                placeholder="https://..."
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
            <Textarea
              id="companyDescription"
              label="About the Company"
              placeholder="Tell candidates what makes your company great..."
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit" loading={update.isPending}>
            Save Company Profile
          </Button>
          {saved && <span className="text-sm font-medium text-green-600">Saved!</span>}
        </div>
      </form>
    </div>
  );
}
