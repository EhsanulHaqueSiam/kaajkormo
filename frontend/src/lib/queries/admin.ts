import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import type { Job, User, PaginatedResponse } from "../../types";

interface PlatformStats {
  total_users: number;
  total_jobs: number;
  total_applications: number;
  total_companies: number;
}

export function usePlatformStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => api.get<PlatformStats>("/api/admin/stats"),
  });
}

export function useAdminJobs(page = 1) {
  return useQuery({
    queryKey: ["admin", "jobs", page],
    queryFn: () =>
      api.get<PaginatedResponse<Job>>(`/api/admin/jobs?page=${page}`),
  });
}

export function useAdminUsers(page = 1) {
  return useQuery({
    queryKey: ["admin", "users", page],
    queryFn: () =>
      api.get<PaginatedResponse<User>>(`/api/admin/users?page=${page}`),
  });
}

export function useModerateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { jobId: string; action: "approve" | "reject" }) =>
      api.post(`/api/admin/jobs/${data.jobId}/${data.action}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "jobs"] });
    },
  });
}

export function useToggleUserActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { userId: string; is_active: boolean }) =>
      api.patch(`/api/admin/users/${data.userId}`, {
        is_active: data.is_active,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}
