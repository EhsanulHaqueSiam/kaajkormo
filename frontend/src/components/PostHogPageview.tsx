import { useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { posthog } from "../lib/posthog";

export function PostHogPageview() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally fire on pathname change
  useEffect(() => {
    posthog.capture("$pageview");
  }, [pathname]);

  return null;
}
