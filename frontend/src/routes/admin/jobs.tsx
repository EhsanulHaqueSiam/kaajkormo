import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Spinner";
import { useAdminJobs, useModerateJob } from "../../lib/queries/admin";
import { formatDate } from "../../lib/utils";

export const Route = createFileRoute("/admin/jobs")({
  component: AdminJobsPage,
});

const statusVariant: Record<string, "default" | "success" | "warning" | "info"> = {
  draft: "default",
  published: "success",
  closed: "warning",
  archived: "default",
};

function AdminJobsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminJobs(page);
  const moderate = useModerateJob();

  const jobs = data?.data ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900">Job Moderation</h1>
      <p className="mt-1 text-gray-500">Review and moderate job listings.</p>

      {isLoading ? (
        <div className="mt-8 flex justify-center">
          <Spinner />
        </div>
      ) : jobs.length === 0 ? (
        <Card className="mt-8 text-center">
          <p className="text-gray-500">No jobs to moderate.</p>
        </Card>
      ) : (
        <>
          <div className="mt-8 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Job
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Company
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Posted
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {jobs.map((job) => (
                  <tr key={job.id}>
                    <td className="px-4 py-4">
                      <p className="font-medium text-gray-900 truncate max-w-xs">
                        {job.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {job.job_type} · {job.experience_level}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {job.company?.name ?? "—"}
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={statusVariant[job.status] ?? "default"}>
                        {job.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {formatDate(job.created_at)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={job.status === "published"}
                          loading={
                            moderate.isPending &&
                            moderate.variables?.jobId === job.id &&
                            moderate.variables?.action === "approve"
                          }
                          onClick={() =>
                            moderate.mutate({
                              jobId: job.id,
                              action: "approve",
                            })
                          }
                        >
                          Approve
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          loading={
                            moderate.isPending &&
                            moderate.variables?.jobId === job.id &&
                            moderate.variables?.action === "reject"
                          }
                          onClick={() =>
                            moderate.mutate({
                              jobId: job.id,
                              action: "reject",
                            })
                          }
                        >
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data && data.total_pages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <span className="px-3 text-sm text-gray-600">
                Page {page} of {data.total_pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= data.total_pages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
