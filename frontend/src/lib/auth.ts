import { useUser as useClerkUser, useAuth as useClerkAuth } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "./api";
import type { User } from "../types";

const IS_MOCK = import.meta.env.VITE_MOCK_API === "true";
const HAS_CLERK = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const MOCK_MODE = IS_MOCK && !HAS_CLERK;

/**
 * Mock-mode: fetches user from mock API, always "signed in".
 */
function useMockAppUser() {
  const query = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => api.get<User>("/api/auth/me"),
    staleTime: 1000 * 60 * 5,
  });

  return {
    user: query.data ?? null,
    isLoading: query.isLoading,
    isSignedIn: true,
  };
}

/**
 * Real mode: uses Clerk auth state, then fetches local DB user.
 */
function useRealAppUser() {
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
 * Hook to get the local app user.
 * In mock mode without Clerk, returns a simulated signed-in user.
 */
export const useAppUser = MOCK_MODE ? useMockAppUser : useRealAppUser;

/**
 * Re-export Clerk hooks. In mock mode, returns safe defaults.
 */
export function useUser() {
  if (MOCK_MODE) {
    return { user: { firstName: "Arif", lastName: "Rahman", imageUrl: "" }, isLoaded: true };
  }
  return useClerkUser();
}

export { useClerkAuth };
