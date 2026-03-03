import { useAuth } from "@clerk/clerk-react";
import { useEffect } from "react";
import { setTokenGetter } from "../lib/api";

/**
 * Syncs Clerk's getToken function with our API client.
 * Must be rendered inside ClerkProvider.
 */
export function ClerkTokenSync() {
  const { getToken } = useAuth();

  useEffect(() => {
    setTokenGetter(() => getToken());
  }, [getToken]);

  return null;
}
