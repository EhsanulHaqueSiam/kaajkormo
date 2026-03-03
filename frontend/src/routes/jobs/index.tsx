import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { JobCard, JobCardSkeleton } from "../../components/jobs/JobCard";
import { JobFilters } from "../../components/jobs/JobFilters";
import { JobSearch } from "../../components/jobs/JobSearch";
import { Button } from "../../components/ui/Button";
import { useJobs } from "../../lib/queries/jobs";
import type { JobSearchParams } from "../../types";

export const Route = createFileRoute("/jobs/")({
  validateSearch: (search: Record<string, unknown>): JobSearchParams => ({
    q: (search.q as string) ?? undefined,
    job_type: search.job_type as JobSearchParams["job_type"],
    experience_level: search.experience_level as JobSearchParams["experience_level"],
    location: search.location as string | undefined,
    is_remote: search.is_remote === "true" ? true : undefined,
    page: Number(search.page) || 1,
    per_page: Number(search.per_page) || 20,
  }),
  component: JobListingPage,
});

function JobListingPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const { data, isLoading, isError } = useJobs(search);

  function updateSearch(params: Partial<JobSearchParams>) {
    navigate({
      to: "/jobs",
      search: { ...search, ...params, page: 1 },
    });
  }

  function handleSearchQuery(q: string) {
    updateSearch({ q: q || undefined });
  }

  function handleFilterChange(filters: JobSearchParams) {
    updateSearch(filters);
  }

  function handleReset() {
    navigate({ to: "/jobs", search: {} });
  }

  function handlePageChange(page: number) {
    navigate({ to: "/jobs", search: { ...search, page } });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Search */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          {search.q ? `Results for "${search.q}"` : "Browse Jobs"}
        </h1>
        <JobSearch initialQuery={search.q ?? ""} onSearch={handleSearchQuery} className="mt-4" />
      </div>

      <div className="lg:flex lg:gap-8">
        {/* Mobile filter toggle */}
        <div className="mb-4 lg:hidden">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            Filters
          </Button>
        </div>

        {/* Mobile filter drawer */}
        {showFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
            <div className="fixed inset-y-0 left-0 w-80 bg-white p-6 shadow-xl overflow-y-auto">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Filters</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <JobFilters
                filters={search}
                onChange={(f) => {
                  handleFilterChange(f);
                  setShowFilters(false);
                }}
                onReset={() => {
                  handleReset();
                  setShowFilters(false);
                }}
              />
            </div>
          </div>
        )}

        {/* Desktop filters sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24 rounded-xl border border-gray-200 bg-white p-5">
            <JobFilters filters={search} onChange={handleFilterChange} onReset={handleReset} />
          </div>
        </aside>

        {/* Job list */}
        <div className="flex-1">
          {isLoading && (
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <JobCardSkeleton key={i} />
              ))}
            </div>
          )}

          {isError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
              <p className="text-red-700">Failed to load jobs. Please try again.</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          )}

          {!isLoading && !isError && data?.data && (
            <>
              <p className="mb-4 text-sm text-gray-500">
                {data.total} job{data.total !== 1 ? "s" : ""} found
              </p>
              {data.data.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {data.data.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
                  <p className="text-gray-500">
                    No jobs match your criteria. Try adjusting your filters.
                  </p>
                </div>
              )}

              {/* Pagination */}
              {data.total_pages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={data.page <= 1}
                    onClick={() => handlePageChange(data.page - 1)}
                  >
                    Previous
                  </Button>
                  <span className="px-3 text-sm text-gray-600">
                    Page {data.page} of {data.total_pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={data.page >= data.total_pages}
                    onClick={() => handlePageChange(data.page + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Show empty state when API not connected yet */}
          {!isLoading && !isError && !data && (
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
              <p className="text-lg font-medium text-gray-900">Connecting to backend...</p>
              <p className="mt-2 text-sm text-gray-500">
                Job listings will appear once the API is available.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
