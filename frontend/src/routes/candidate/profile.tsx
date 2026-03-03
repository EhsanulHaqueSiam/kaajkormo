import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Briefcase, Camera, FileText, Link2, Upload, User } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { ProgressRing } from "../../components/ui/Progress";
import { Spinner } from "../../components/ui/Spinner";
import { Tabs } from "../../components/ui/Tabs";
import { Textarea } from "../../components/ui/Textarea";
import { showToast } from "../../components/ui/Toast";
import { useCandidateProfile, useUpdateCandidateProfile } from "../../lib/queries/candidate";
import { useParseResume, useUploadPhoto, useUploadResume } from "../../lib/queries/uploads";

export const Route = createFileRoute("/candidate/profile")({
  component: CandidateProfile,
});

function CandidateProfile() {
  const { data: profile, isLoading } = useCandidateProfile();
  const update = useUpdateCandidateProfile();
  const uploadPhoto = useUploadPhoto();
  const uploadResume = useUploadResume();
  const parseResume = useParseResume();

  const [activeTab, setActiveTab] = useState("basic");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [education, setEducation] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [phone, setPhone] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [stackoverflowUrl, setStackoverflowUrl] = useState("");
  const [leetcodeUrl, setLeetcodeUrl] = useState("");
  const [codeforcesUrl, setCodeforcesUrl] = useState("");
  const [behanceUrl, setBehanceUrl] = useState("");
  const [mediumUrl, setMediumUrl] = useState("");
  const [personalWebsite, setPersonalWebsite] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [photoUrl, setPhotoUrl] = useState<string | undefined>();
  const [resumeUrl, setResumeUrl] = useState<string | undefined>();

  useEffect(() => {
    if (!profile) return;
    setHeadline(profile.headline ?? "");
    setBio(profile.bio ?? "");
    setLocation(profile.location ?? "");
    setEducation(profile.education ?? "");
    setExperienceYears(profile.experience_years != null ? String(profile.experience_years) : "");
    setPhone(profile.phone ?? "");
    setLinkedinUrl(profile.linkedin_url ?? "");
    setGithubUrl(profile.github_url ?? "");
    setPortfolioUrl(profile.portfolio_url ?? "");
    setStackoverflowUrl(profile.stackoverflow_url ?? "");
    setLeetcodeUrl(profile.leetcode_url ?? "");
    setCodeforcesUrl(profile.codeforces_url ?? "");
    setBehanceUrl(profile.behance_url ?? "");
    setMediumUrl(profile.medium_url ?? "");
    setPersonalWebsite(profile.personal_website ?? "");
    setSkills(profile.skills ?? []);
    setPhotoUrl(profile.photo_url);
    setResumeUrl(profile.resume_url);
  }, [profile]);

  // Completion calculation
  const fields = [headline, bio, location, education, phone];
  const filled =
    fields.filter(Boolean).length +
    (skills.length > 0 ? 1 : 0) +
    (photoUrl ? 1 : 0) +
    (resumeUrl ? 1 : 0);
  const totalFields = fields.length + 3;
  const completionPct = Math.round((filled / totalFields) * 100);

  function addSkill() {
    const trimmed = skillsInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }
    setSkillsInput("");
  }

  function removeSkill(skill: string) {
    setSkills(skills.filter((s) => s !== skill));
  }

  function handleSkillKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill();
    }
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await uploadPhoto.mutateAsync(file);
      setPhotoUrl(result.url);
      showToast.success("Photo uploaded");
    } catch {
      showToast.error("Failed to upload photo");
    }
  }

  async function handleResumeUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await uploadResume.mutateAsync(file);
      setResumeUrl(result.url);
      showToast.success("Resume uploaded");
    } catch {
      showToast.error("Failed to upload resume");
    }
  }

  async function handleResumeParse(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const parsed = await parseResume.mutateAsync(file);
      if (parsed.skills.length > 0) setSkills([...new Set([...skills, ...parsed.skills])]);
      if (parsed.education.length > 0 && !education) setEducation(parsed.education.join(", "));
      showToast.success("Resume parsed! Fields auto-filled.");
    } catch {
      showToast.error("Failed to parse resume");
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await update.mutateAsync({
        headline: headline || undefined,
        bio: bio || undefined,
        location: location || undefined,
        education: education || undefined,
        experience_years: experienceYears ? Number(experienceYears) : undefined,
        phone: phone || undefined,
        linkedin_url: linkedinUrl || undefined,
        github_url: githubUrl || undefined,
        portfolio_url: portfolioUrl || undefined,
        stackoverflow_url: stackoverflowUrl || undefined,
        leetcode_url: leetcodeUrl || undefined,
        codeforces_url: codeforcesUrl || undefined,
        behance_url: behanceUrl || undefined,
        medium_url: mediumUrl || undefined,
        personal_website: personalWebsite || undefined,
        photo_url: photoUrl,
        resume_url: resumeUrl,
        skills,
      });
      showToast.success("Profile saved!");
    } catch {
      showToast.error("Failed to save profile");
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const tabs = [
    { id: "basic", label: "Basic Info", icon: <User className="h-4 w-4" /> },
    { id: "skills", label: "Skills", icon: <Briefcase className="h-4 w-4" /> },
    { id: "links", label: "Links", icon: <Link2 className="h-4 w-4" /> },
    { id: "resume", label: "Resume", icon: <FileText className="h-4 w-4" /> },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header with photo and completion ring */}
      <div className="mb-8 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        {/* Photo upload */}
        <div className="group relative">
          <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white shadow-lg">
            {photoUrl ? (
              <img src={photoUrl} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary-50 text-3xl font-bold text-primary-600">
                <User className="h-10 w-10" />
              </div>
            )}
          </div>
          <label className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <Camera className="h-6 w-6 text-white" />
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </label>
          {uploadPhoto.isPending && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-white/60">
              <Spinner size="sm" />
            </div>
          )}
        </div>

        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="mt-1 text-gray-500">Complete your profile to stand out to employers.</p>
        </div>

        {/* Completion ring */}
        <ProgressRing
          value={completionPct}
          size={80}
          strokeWidth={6}
          color={completionPct >= 80 ? "success" : completionPct >= 50 ? "primary" : "warning"}
        >
          <span className="text-sm font-bold text-gray-900">{completionPct}%</span>
        </ProgressRing>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        variant="pills"
        className="mb-6"
      />

      <form onSubmit={handleSubmit}>
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "basic" && (
            <Card className="space-y-5">
              <Input
                id="headline"
                label="Professional Headline"
                placeholder="e.g. Full-Stack Developer with 3 years experience"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
              />
              <Textarea
                id="bio"
                label="Bio"
                placeholder="Tell employers about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={500}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  id="location"
                  label="Location"
                  placeholder="e.g. Dhaka, Bangladesh"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
                <Input
                  id="phone"
                  label="Phone"
                  placeholder="+880-1XXXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  id="education"
                  label="Education"
                  placeholder="e.g. BSc in CSE, BUET"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                />
                <Input
                  id="experienceYears"
                  label="Years of Experience"
                  type="number"
                  min="0"
                  placeholder="e.g. 3"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                />
              </div>
            </Card>
          )}

          {activeTab === "skills" && (
            <Card>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a skill and press Enter"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                />
                <Button type="button" variant="outline" onClick={addSkill}>
                  Add
                </Button>
              </div>
              {skills.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1.5 text-sm font-medium text-primary-700"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-0.5 rounded-full p-0.5 text-primary-400 hover:bg-primary-100 hover:text-primary-700"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {skills.length === 0 && (
                <p className="mt-4 text-center text-sm text-gray-400">
                  No skills added yet. Add your top skills to improve matching.
                </p>
              )}
            </Card>
          )}

          {activeTab === "links" && (
            <Card className="space-y-5">
              <h3 className="text-sm font-semibold text-gray-900">Professional Links</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  id="linkedin"
                  label="LinkedIn"
                  placeholder="https://linkedin.com/in/..."
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                />
                <Input
                  id="github"
                  label="GitHub"
                  placeholder="https://github.com/..."
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  id="portfolio"
                  label="Portfolio"
                  placeholder="https://..."
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                />
                <Input
                  id="personalWebsite"
                  label="Personal Website"
                  placeholder="https://..."
                  value={personalWebsite}
                  onChange={(e) => setPersonalWebsite(e.target.value)}
                />
              </div>
              <h3 className="pt-2 text-sm font-semibold text-gray-900">Engineering & Creative</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  id="stackoverflow"
                  label="Stack Overflow"
                  placeholder="https://stackoverflow.com/users/..."
                  value={stackoverflowUrl}
                  onChange={(e) => setStackoverflowUrl(e.target.value)}
                />
                <Input
                  id="leetcode"
                  label="LeetCode"
                  placeholder="https://leetcode.com/..."
                  value={leetcodeUrl}
                  onChange={(e) => setLeetcodeUrl(e.target.value)}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  id="codeforces"
                  label="Codeforces"
                  placeholder="https://codeforces.com/profile/..."
                  value={codeforcesUrl}
                  onChange={(e) => setCodeforcesUrl(e.target.value)}
                />
                <Input
                  id="behance"
                  label="Behance"
                  placeholder="https://behance.net/..."
                  value={behanceUrl}
                  onChange={(e) => setBehanceUrl(e.target.value)}
                />
              </div>
              <Input
                id="medium"
                label="Medium / Blog"
                placeholder="https://medium.com/@..."
                value={mediumUrl}
                onChange={(e) => setMediumUrl(e.target.value)}
              />
            </Card>
          )}

          {activeTab === "resume" && (
            <Card className="space-y-6">
              {/* Resume upload */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-900">Upload Resume</h3>
                <div className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
                  <Upload className="h-8 w-8 text-gray-400" />
                  {resumeUrl ? (
                    <p className="text-sm text-success-600 font-medium">Resume uploaded</p>
                  ) : (
                    <p className="text-sm text-gray-500">Upload your resume (PDF, DOCX)</p>
                  )}
                  <label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      loading={uploadResume.isPending}
                    >
                      {resumeUrl ? "Replace Resume" : "Choose File"}
                    </Button>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={handleResumeUpload}
                    />
                  </label>
                </div>
              </div>

              {/* Resume parse */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-900">Auto-fill from Resume</h3>
                <p className="mb-3 text-sm text-gray-500">
                  Upload your resume and we'll extract skills and education to fill in your profile.
                </p>
                <label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    icon={<FileText className="h-4 w-4" />}
                    loading={parseResume.isPending}
                  >
                    Parse Resume
                  </Button>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={handleResumeParse}
                  />
                </label>
              </div>
            </Card>
          )}
        </motion.div>

        <div className="mt-6 flex items-center gap-3">
          <Button type="submit" loading={update.isPending}>
            Save Profile
          </Button>
        </div>
      </form>
    </div>
  );
}
