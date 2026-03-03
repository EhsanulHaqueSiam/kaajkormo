import { useUser, useAuth as useClerkAuth } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "./api";
import type { User } from "../types";

/**
 * Hook to get the local app user (from our backend).
 * Clerk handles authentication; this syncs with our DB user record.
 */
export function useAppUser() {
  const { isSignedIn, isLoaded } = useClerkAuth();

  const query = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => api.get<User>("/api/auth/me"),
    enabled: isLoaded && isSignedIn,
    staleTime: 1000 * 60 * 5,
  });

  return {
    user: query.data ?? null,
    isLoading: !isLoaded || (isSignedIn && query.isLoading),
    isSignedIn: isSignedIn ?? false,
  };
}

/**
 * Re-export Clerk hooks for convenience.
 */
export { useUser, useClerkAuth };
