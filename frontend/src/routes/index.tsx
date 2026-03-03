import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Search,
  Upload,
  MousePointerClick,
  Briefcase,
  Code,
  Megaphone,
  Palette,
  TrendingUp,
  Users,
  GraduationCap,
  Heart,
  Wrench,
  Building,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Zap,
  Star,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { JobCard, JobCardSkeleton } from "../components/jobs/JobCard";
import { useFeaturedJobs } from "../lib/queries/jobs";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

const categories = [
  { name: "Software Engineering", icon: Code },
  { name: "Marketing", icon: Megaphone },
  { name: "Design", icon: Palette },
  { name: "Finance", icon: TrendingUp },
  { name: "Sales", icon: Users },
  { name: "Education", icon: GraduationCap },
  { name: "Healthcare", icon: Heart },
  { name: "Engineering", icon: Wrench },
  { name: "Business", icon: Building },
];

const steps = [
  {
    icon: Upload,
    title: "Create Your Profile",
    description: "Sign up and build your professional profile with skills and experience.",
  },
  {
    icon: MousePointerClick,
    title: "Discover & Apply",
    description: "Swipe through curated jobs or search by keyword, location, and more.",
  },
  {
    icon: Briefcase,
    title: "Get Hired",
    description: "Track applications, schedule interviews, and land your dream job.",
  },
];

const stats = [
  { label: "Active Jobs", value: "500+", icon: Briefcase },
  { label: "Companies", value: "200+", icon: Building },
  { label: "Job Seekers", value: "10K+", icon: Users },
  { label: "Placements", value: "2K+", icon: Star },
];

function LandingPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: featured, isLoading: featuredLoading } = useFeaturedJobs();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate({ to: "/jobs", search: { q: searchQuery || undefined } });
  }

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-accent-50 py-20 sm:py-28">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-primary-100/50 blur-3xl" />
          <div className="absolute -left-40 top-20 h-80 w-80 rounded-full bg-accent-100/40 blur-3xl" />
        </div>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8"
        >
          <motion.div variants={fadeUp} className="mx-auto max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white/80 px-4 py-1.5 text-sm font-medium text-primary-700 shadow-sm backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              Bangladesh's Premier Job Portal
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Find Your Dream Job in{" "}
              <span className="gradient-text">Bangladesh</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-gray-500">
              Connect with top employers across Bangladesh. Swipe through curated opportunities
              or search by skills, location, and more.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.form
            variants={fadeUp}
            onSubmit={handleSearch}
            className="mx-auto mt-10 max-w-2xl"
          >
            <div className="glass flex items-center gap-2 rounded-2xl p-2 shadow-lg shadow-primary-500/10">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Job title, keyword, or company..."
                  className="w-full rounded-xl bg-white py-3 pl-11 pr-4 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                />
              </div>
              <Button type="submit" variant="gradient" size="lg" className="shrink-0">
                Search Jobs
              </Button>
            </div>
          </motion.form>

          <motion.div variants={fadeUp} className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm text-gray-500">
            <span>Popular:</span>
            {["React", "Python", "Marketing", "Accountant"].map((term) => (
              <Link
                key={term}
                to="/jobs"
                search={{ q: term }}
                className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-600 shadow-sm ring-1 ring-gray-200 transition-colors hover:bg-primary-50 hover:text-primary-600"
              >
                {term}
              </Link>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="relative -mt-8 z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="mx-auto grid max-w-5xl grid-cols-2 gap-4 px-4 sm:px-6 lg:grid-cols-4 lg:px-8"
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              className="glass-strong rounded-2xl p-5 text-center shadow-lg"
            >
              <stat.icon className="mx-auto mb-2 h-6 w-6 text-primary-500" />
              <p className="text-2xl font-bold text-gray-900 sm:text-3xl">{stat.value}</p>
              <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center"
          >
            <motion.h2 variants={fadeUp} className="text-2xl font-bold text-gray-900 sm:text-3xl">
              How It Works
            </motion.h2>
            <motion.p variants={fadeUp} className="mx-auto mt-2 max-w-xl text-gray-500">
              Get started in three simple steps
            </motion.p>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="mt-12 grid gap-8 sm:grid-cols-3"
          >
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                variants={fadeUp}
                className="group relative rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm transition-all hover:border-primary-200 hover:shadow-md"
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary-100 px-3 py-0.5 text-xs font-bold text-primary-700">
                  Step {i + 1}
                </div>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 text-white shadow-md shadow-primary-500/20">
                  <step.icon className="h-7 w-7" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-gray-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="flex items-end justify-between"
          >
            <motion.div variants={fadeUp}>
              <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Featured Jobs</h2>
              <p className="mt-1 text-gray-500">Latest opportunities from top employers</p>
            </motion.div>
            <motion.div variants={fadeUp}>
              <Link to="/jobs">
                <Button variant="outline" size="sm" iconRight={<ArrowRight className="h-4 w-4" />}>
                  View All
                </Button>
              </Link>
            </motion.div>
          </motion.div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredLoading
              ? Array.from({ length: 6 }).map((_, i) => <JobCardSkeleton key={i} />)
              : featured?.data?.map((job) => <JobCard key={job.id} job={job} />)}
            {!featuredLoading && !featured?.data?.length && (
              <div className="col-span-full py-12 text-center text-gray-400">
                No featured jobs yet. Check back soon!
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center"
          >
            <motion.h2 variants={fadeUp} className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Browse by Category
            </motion.h2>
            <motion.p variants={fadeUp} className="mx-auto mt-2 max-w-xl text-gray-500">
              Explore opportunities across different industries
            </motion.p>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3"
          >
            {categories.map((cat) => (
              <motion.div key={cat.name} variants={fadeUp}>
                <Link
                  to="/jobs"
                  search={{ q: cat.name }}
                  className="group flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white p-6 text-center transition-all hover:border-primary-200 hover:shadow-md"
                >
                  <div className="rounded-xl bg-primary-50 p-3 text-primary-600 transition-colors group-hover:bg-primary-100">
                    <cat.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary-600">{cat.name}</h3>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* For Employers */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid gap-12 lg:grid-cols-2 lg:items-center"
          >
            <motion.div variants={fadeUp}>
              <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Hire the Best Talent in Bangladesh
              </h2>
              <p className="mt-4 text-gray-500 leading-relaxed">
                Post your job openings and reach thousands of qualified candidates.
                Our smart matching algorithm connects you with the right people faster.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Post jobs and manage applications from one dashboard",
                  "Kanban-style applicant tracking pipeline",
                  "Smart candidate matching and search",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-success-500" />
                    <span className="text-sm text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex gap-3">
                <Link to="/employer/post-job">
                  <Button variant="gradient" icon={<Zap className="h-4 w-4" />}>
                    Post a Job
                  </Button>
                </Link>
                <Link to="/auth/register">
                  <Button variant="outline">Employer Sign Up</Button>
                </Link>
              </div>
            </motion.div>
            <motion.div variants={fadeUp} className="relative">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
                <div className="mb-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
                    <Building className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Your Company</p>
                    <p className="text-xs text-gray-500">Employer Dashboard</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {["Published", "In Review", "Interviewing"].map((status, i) => (
                    <div key={status} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                      <span className="text-sm font-medium text-gray-700">{status}</span>
                      <span className="rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-bold text-primary-700">
                        {[12, 8, 5][i]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="relative overflow-hidden rounded-3xl p-1"
            style={{
              background: "linear-gradient(135deg, var(--color-primary-500), var(--color-accent-500))",
            }}
          >
            <div className="glass-strong relative rounded-[22px] px-8 py-14 text-center sm:px-16">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary-200/30 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-accent-200/30 blur-3xl" />
              <div className="relative">
                <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                  Ready to Start Your Journey?
                </h2>
                <p className="mx-auto mt-3 max-w-lg text-gray-600">
                  Join thousands of professionals who've found their perfect match on KaajKormo.
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link to="/auth/register">
                    <Button variant="gradient" size="lg" icon={<Sparkles className="h-5 w-5" />}>
                      Get Started Free
                    </Button>
                  </Link>
                  <Link to="/jobs">
                    <Button variant="outline" size="lg">
                      Browse Jobs
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
