import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Spinner";
import { useAdminUsers, useToggleUserActive } from "../../lib/queries/admin";
import { formatDate } from "../../lib/utils";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsersPage,
});

const roleVariant: Record<string, "default" | "info" | "success"> = {
  candidate: "default",
  employer: "info",
  admin: "success",
};

function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminUsers(page);
  const toggleActive = useToggleUserActive();

  const users = data?.data ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
      <p className="mt-1 text-gray-500">View and manage platform users.</p>

      {isLoading ? (
        <div className="mt-8 flex justify-center">
          <Spinner />
        </div>
      ) : users.length === 0 ? (
        <Card className="mt-8 text-center">
          <p className="text-gray-500">No users found.</p>
        </Card>
      ) : (
        <>
          <div className="mt-8 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Joined
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-4">
                      <p className="font-medium text-gray-900">
                        {user.full_name}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={roleVariant[user.role] ?? "default"}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={user.is_active ? "success" : "danger"}>
                        {user.is_active ? "Active" : "Disabled"}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end">
                        <Button
                          variant={user.is_active ? "danger" : "outline"}
                          size="sm"
                          loading={
                            toggleActive.isPending &&
                            toggleActive.variables?.userId === user.id
                          }
                          onClick={() =>
                            toggleActive.mutate({
                              userId: user.id,
                              is_active: !user.is_active,
                            })
                          }
                        >
                          {user.is_active ? "Disable" : "Enable"}
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
