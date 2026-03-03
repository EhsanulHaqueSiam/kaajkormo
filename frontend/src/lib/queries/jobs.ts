import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Job, JobSearchParams, PaginatedResponse } from "../../types";
import { api } from "../api";

export function useJobs(params: JobSearchParams) {
  const searchParams = new URLSearchParams();
  if (params.q) searchParams.set("q", params.q);
  if (params.job_type) searchParams.set("job_type", params.job_type);
  if (params.experience_level) searchParams.set("experience_level", params.experience_level);
  if (params.location) searchParams.set("location", params.location);
  if (params.is_remote !== undefined) searchParams.set("is_remote", String(params.is_remote));
  if (params.skills?.length) searchParams.set("skills", params.skills.join(","));
  if (params.page) searchParams.set("page", String(params.page));
  if (params.per_page) searchParams.set("per_page", String(params.per_page));

  const qs = searchParams.toString();
  return useQuery({
    queryKey: ["jobs", params],
    queryFn: () => api.get<PaginatedResponse<Job>>(`/api/jobs?${qs}`),
  });
}

export function useJob(slug: string) {
  return useQuery({
    queryKey: ["job", slug],
    queryFn: () => api.get<Job>(`/api/jobs/${slug}`),
    enabled: !!slug,
  });
}

export function useFeaturedJobs() {
  return useQuery({
    queryKey: ["jobs", "featured"],
    queryFn: () => api.get<PaginatedResponse<Job>>("/api/jobs?featured=true&per_page=6"),
  });
}

export function useApply() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { job_id: string; cover_letter?: string }) =>
      api.post("/api/applications", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });
}

export function useSaveJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => api.post(`/api/saved-jobs/${jobId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-jobs"] });
    },
  });
}

export function useUnsaveJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => api.delete(`/api/saved-jobs/${jobId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-jobs"] });
    },
  });
}
