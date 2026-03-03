import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import type {
  Job,
  Application,
  Company,
  PaginatedResponse,
} from "../../types";

export function useEmployerJobs() {
  return useQuery({
    queryKey: ["employer", "jobs"],
    queryFn: () => api.get<PaginatedResponse<Job>>("/api/employer/jobs"),
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Job>) => api.post<Job>("/api/jobs", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employer", "jobs"] });
    },
  });
}

export function useJobApplicants(jobId: string) {
  return useQuery({
    queryKey: ["employer", "applicants", jobId],
    queryFn: () =>
      api.get<PaginatedResponse<Application>>(
        `/api/employer/jobs/${jobId}/applicants`,
      ),
    enabled: !!jobId,
  });
}

export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { applicationId: string; status: string }) =>
      api.patch(`/api/applications/${data.applicationId}`, {
        status: data.status,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employer", "applicants"] });
    },
  });
}

export function useCompanyProfile() {
  return useQuery({
    queryKey: ["company-profile"],
    queryFn: () => api.get<Company>("/api/employer/company"),
  });
}

export function useUpdateCompanyProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Company>) =>
      api.put<Company>("/api/employer/company", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-profile"] });
    },
  });
}
