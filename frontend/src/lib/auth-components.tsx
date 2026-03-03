/**
 * Auth-aware component wrappers.
 * In mock mode without Clerk, SignedIn always renders, SignedOut never renders,
 * and UserButton shows a mock avatar.
 */

import {
  SignedIn as ClerkSignedIn,
  SignedOut as ClerkSignedOut,
  UserButton as ClerkUserButton,
} from "@clerk/clerk-react";
import type { ReactNode } from "react";

const IS_MOCK = import.meta.env.VITE_MOCK_API === "true";
const HAS_CLERK = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const MOCK_MODE = IS_MOCK && !HAS_CLERK;

export function SignedIn({ children }: { children: ReactNode }) {
  if (MOCK_MODE) return <>{children}</>;
  return <ClerkSignedIn>{children}</ClerkSignedIn>;
}

export function SignedOut({ children }: { children: ReactNode }) {
  if (MOCK_MODE) return null;
  return <ClerkSignedOut>{children}</ClerkSignedOut>;
}

export function UserButton(props: {
  afterSignOutUrl?: string;
  appearance?: Record<string, unknown>;
}) {
  if (MOCK_MODE) {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
        AR
      </div>
    );
  }
  return <ClerkUserButton {...props} />;
}
