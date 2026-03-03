import { createFileRoute } from "@tanstack/react-router";
import { Filter, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";

export const Route = createFileRoute("/employer/candidates")({
  component: CandidatesPage,
});

function CandidatesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [skillsFilter, setSkillsFilter] = useState("");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">CV Bank</h1>
        <p className="mt-1 text-gray-500">Search and browse candidate profiles</p>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, headline, or skills..."
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
          <div className="relative flex-1 sm:max-w-xs">
            <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={skillsFilter}
              onChange={(e) => setSkillsFilter(e.target.value)}
              placeholder="Filter by skills..."
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
          <Button icon={<Search className="h-4 w-4" />}>Search</Button>
        </div>
      </Card>

      <EmptyState
        preset="no-results"
        title="Search for candidates"
        description="Use the search bar above to find candidates by name, skills, or location."
      />
    </div>
  );
}
