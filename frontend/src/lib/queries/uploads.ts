import { useMutation } from "@tanstack/react-query";
import type { ParsedResume } from "../../types";
import { api } from "../api";

export function useUploadResume() {
  return useMutation({
    mutationFn: (file: File) => api.upload<{ url: string }>("/api/uploads/resume", file),
  });
}

export function useUploadPhoto() {
  return useMutation({
    mutationFn: (file: File) => api.upload<{ url: string }>("/api/uploads/photo", file),
  });
}

export function useParseResume() {
  return useMutation({
    mutationFn: (file: File) => api.upload<ParsedResume>("/api/uploads/resume/parse", file),
  });
}
