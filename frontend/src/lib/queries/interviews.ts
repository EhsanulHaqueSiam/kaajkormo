import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Interview, PaginatedResponse } from "../../types";
import { api } from "../api";

export function useInterviews() {
  return useQuery({
    queryKey: ["interviews"],
    queryFn: () => api.get<PaginatedResponse<Interview>>("/api/interviews"),
  });
}

export function useUpcomingInterviews() {
  return useQuery({
    queryKey: ["interviews", "upcoming"],
    queryFn: () =>
      api.get<PaginatedResponse<Interview>>("/api/interviews?status=scheduled&sort=scheduled_at"),
  });
}

export function useCreateInterview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Interview>) => api.post<Interview>("/api/interviews", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interviews"] });
    },
  });
}

export function useUpdateInterview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Interview> & { id: string }) =>
      api.patch<Interview>(`/api/interviews/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interviews"] });
    },
  });
}
