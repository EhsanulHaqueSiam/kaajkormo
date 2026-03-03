import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { JobAlert, PaginatedResponse } from "../../types";
import { api } from "../api";

export function useJobAlerts() {
  return useQuery({
    queryKey: ["job-alerts"],
    queryFn: () => api.get<PaginatedResponse<JobAlert>>("/api/job-alerts"),
  });
}

export function useCreateJobAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<JobAlert>) => api.post<JobAlert>("/api/job-alerts", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-alerts"] });
    },
  });
}

export function useUpdateJobAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<JobAlert> & { id: string }) =>
      api.patch<JobAlert>(`/api/job-alerts/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-alerts"] });
    },
  });
}

export function useDeleteJobAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/job-alerts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-alerts"] });
    },
  });
}
