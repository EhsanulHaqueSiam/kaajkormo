import { useCallback } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Mail, FileText } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Spinner";
import { KanbanBoard } from "../../components/ui/KanbanBoard";
import { showToast } from "../../components/ui/Toast";
import {
  useJobApplicants,
  useUpdateApplicationStatus,
} from "../../lib/queries/employer";
import { timeAgo } from "../../lib/utils";
import type { Application } from "../../types";

export const Route = createFileRoute("/employer/applicants/$jobId")({
  component: ApplicantsPage,
});

const COLUMNS = [
  { id: "pending", title: "Applied", color: "#94a3b8" },
  { id: "viewed", title: "Viewed", color: "#60a5fa" },
  { id: "shortlisted", title: "Shortlisted", color: "#a78bfa" },
  { id: "interview", title: "Interview", color: "#fbbf24" },
  { id: "offered", title: "Offered", color: "#22c55e" },
  { id: "rejected", title: "Rejected", color: "#ef4444" },
];

function ApplicantsPage() {
  const { jobId } = Route.useParams();
  const { data, isLoading } = useJobApplicants(jobId);
  const updateStatus = useUpdateApplicationStatus();

  const applicants = data?.data ?? [];

  const handleCardMove = useCallback(
    (cardId: string, _from: string, to: string) => {
      updateStatus.mutate(
        { applicationId: cardId, status: to },
        {
          onSuccess: () => showToast.success("Status updated"),
          onError: () => showToast.error("Failed to update status"),
        },
      );
    },
    [updateStatus],
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const columns = COLUMNS.map((col) => ({
    ...col,
    cards: applicants
      .filter((app) => app.status === col.id)
      .map((app) => ({
        id: app.id,
        content: <ApplicantCard app={app} />,
      })),
  }));

  return (
    <div className="mx-auto max-w-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-3">
        <Link to="/employer/dashboard">
          <Button variant="ghost" size="sm" icon={<ArrowLeft className="h-4 w-4" />}>
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Applicants</h1>
          <p className="text-sm text-gray-500">
            Drag cards between columns to update status
          </p>
        </div>
        <Badge variant="info" className="ml-2">{applicants.length} total</Badge>
      </div>

      {applicants.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-500">No applications received yet.</p>
        </div>
      ) : (
        <KanbanBoard columns={columns} onCardMove={handleCardMove} />
      )}
    </div>
  );
}

function ApplicantCard({ app }: { app: Application }) {
  return (
    <div>
      <p className="font-medium text-gray-900 text-sm">
        {app.candidate?.full_name ?? "Applicant"}
      </p>
      <p className="mt-0.5 text-xs text-gray-500">{app.candidate?.email}</p>
      <p className="mt-1 text-xs text-gray-400">Applied {timeAgo(app.created_at)}</p>
      {app.cover_letter && (
        <p className="mt-2 text-xs text-gray-500 line-clamp-2">{app.cover_letter}</p>
      )}
      <div className="mt-2 flex gap-1.5">
        {app.resume_url && (
          <a
            href={app.resume_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded bg-gray-50 px-1.5 py-0.5 text-[10px] text-gray-600 hover:bg-gray-100"
          >
            <FileText className="h-3 w-3" />
            Resume
          </a>
        )}
        {app.candidate?.email && (
          <a
            href={`mailto:${app.candidate.email}`}
            className="inline-flex items-center gap-1 rounded bg-gray-50 px-1.5 py-0.5 text-[10px] text-gray-600 hover:bg-gray-100"
          >
            <Mail className="h-3 w-3" />
            Email
          </a>
        )}
      </div>
    </div>
  );
}
