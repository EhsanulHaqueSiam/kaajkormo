import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Job, SwipeAction } from "../../types";
import { api } from "../api";

export function useDiscoverJobs() {
  return useQuery({
    queryKey: ["discover", "jobs"],
    queryFn: () => api.get<Job[]>("/api/discover/jobs"),
  });
}

export function useSwipeAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (action: SwipeAction) => api.post("/api/discover/swipe", action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discover"] });
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["saved-jobs"] });
    },
  });
}
