import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Application, CandidateProfile, Job, PaginatedResponse } from "../../types";
import { api } from "../api";

export function useCandidateApplications(status?: string) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  const qs = params.toString();
  return useQuery({
    queryKey: ["applications", "mine", status],
    queryFn: () =>
      api.get<PaginatedResponse<Application>>(`/api/applications/mine${qs ? `?${qs}` : ""}`),
  });
}

export function useCandidateProfile() {
  return useQuery({
    queryKey: ["candidate-profile"],
    queryFn: () => api.get<CandidateProfile>("/api/candidate/profile"),
  });
}

export function useUpdateCandidateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CandidateProfile>) =>
      api.put<CandidateProfile>("/api/candidate/profile", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidate-profile"] });
    },
  });
}

export function useSavedJobs() {
  return useQuery({
    queryKey: ["saved-jobs"],
    queryFn: () => api.get<PaginatedResponse<Job>>("/api/saved-jobs"),
  });
}
