import { useEffect } from "react";
import { useAppUser } from "../lib/auth";
import { posthog } from "../lib/posthog";

export function PostHogIdentify() {
  const { user, isSignedIn } = useAppUser();

  useEffect(() => {
    if (isSignedIn && user) {
      posthog.identify(user.id, {
        email: user.email,
        name: user.full_name,
        role: user.role,
      });
    } else {
      posthog.reset();
    }
  }, [isSignedIn, user]);

  return null;
}
