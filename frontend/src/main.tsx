import { ClerkProvider } from "@clerk/clerk-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkTokenSync } from "./components/ClerkTokenSync";
import { initPostHog } from "./lib/posthog";
import { routeTree } from "./routeTree.gen";
import "./index.css";

const IS_MOCK = import.meta.env.VITE_MOCK_API === "true";

// Install mock API when VITE_MOCK_API=true (for development without backend)
if (IS_MOCK) {
  import("./mocks/handlers").then(({ installMockApi }) => installMockApi());
}

initPostHog();

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY && !IS_MOCK) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY environment variable");
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function AppContent() {
  return (
    <QueryClientProvider client={queryClient}>
      {CLERK_PUBLISHABLE_KEY && <ClerkTokenSync />}
      <RouterProvider router={router} />
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {CLERK_PUBLISHABLE_KEY ? (
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
        <AppContent />
      </ClerkProvider>
    ) : (
      <AppContent />
    )}
  </StrictMode>,
);
