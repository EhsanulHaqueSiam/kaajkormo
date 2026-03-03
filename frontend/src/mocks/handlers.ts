/**
 * Mock API handlers for frontend development without backend.
 * Enable by setting VITE_MOCK_API=true in .env or running `make dev-mock`
 */

import {
  mockJobs,
  mockApplications,
  mockCandidateProfile,
  mockNotifications,
  mockInterviews,
  mockApplicationEvents,
} from "./data";

type MockHandler = {
  match: (method: string, url: string) => boolean;
  handle: (url: string, body?: unknown) => { status: number; data: unknown };
};

const handlers: MockHandler[] = [
  // Jobs
  {
    match: (m, u) => m === "GET" && u.includes("/api/jobs"),
    handle: () => ({
      status: 200,
      data: { data: mockJobs, total: mockJobs.length, page: 1, per_page: 20, total_pages: 1 },
    }),
  },
  // Featured jobs
  {
    match: (m, u) => m === "GET" && u.includes("/api/jobs") && u.includes("featured"),
    handle: () => ({
      status: 200,
      data: { data: mockJobs.slice(0, 6), total: 6, page: 1, per_page: 6, total_pages: 1 },
    }),
  },
  // Candidate profile
  {
    match: (m, u) => m === "GET" && u.includes("/api/profile"),
    handle: () => ({ status: 200, data: mockCandidateProfile }),
  },
  {
    match: (m, u) => m === "PUT" && u.includes("/api/profile"),
    handle: (_u, body) => ({ status: 200, data: { ...mockCandidateProfile, ...(body as object) } }),
  },
  // Applications
  {
    match: (m, u) => m === "GET" && u.includes("/api/applications"),
    handle: () => ({ status: 200, data: mockApplications }),
  },
  {
    match: (m, u) => m === "GET" && u.includes("/api/applications/") && u.includes("/events"),
    handle: () => ({ status: 200, data: mockApplicationEvents }),
  },
  // Discover
  {
    match: (m, u) => m === "GET" && u.includes("/api/discover/jobs"),
    handle: () => ({ status: 200, data: mockJobs }),
  },
  {
    match: (m, u) => m === "POST" && u.includes("/api/discover/swipe"),
    handle: () => ({ status: 200, data: { success: true } }),
  },
  // Interviews
  {
    match: (m, u) => m === "GET" && u.includes("/api/interviews"),
    handle: () => ({ status: 200, data: mockInterviews }),
  },
  // Notifications
  {
    match: (m, u) => m === "GET" && u.includes("/api/notifications/unread-count"),
    handle: () => ({ status: 200, data: { count: mockNotifications.filter((n) => !n.is_read).length } }),
  },
  {
    match: (m, u) => m === "GET" && u.includes("/api/notifications"),
    handle: () => ({ status: 200, data: mockNotifications }),
  },
  // Auth
  {
    match: (m, u) => m === "GET" && u.includes("/api/auth/me"),
    handle: () => ({
      status: 200,
      data: {
        id: "u1",
        email: "arif@example.com",
        full_name: "Arif Rahman",
        role: "candidate",
        avatar_url: "https://ui-avatars.com/api/?name=AR&background=2563eb&color=fff",
        is_active: true,
        created_at: "2025-06-01T00:00:00Z",
        updated_at: "2026-03-01T00:00:00Z",
      },
    }),
  },
  // Saved jobs
  {
    match: (m, u) => m === "GET" && u.includes("/api/saved-jobs"),
    handle: () => ({
      status: 200,
      data: { data: mockJobs.slice(0, 3), total: 3, page: 1, per_page: 20, total_pages: 1 },
    }),
  },
  // Job alerts
  {
    match: (m, u) => m === "GET" && u.includes("/api/job-alerts"),
    handle: () => ({
      status: 200,
      data: [
        { id: "ja1", user_id: "u1", name: "React Jobs in Dhaka", criteria: { skills: ["React"], location: "Dhaka" }, frequency: "daily", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-03-01T00:00:00Z" },
        { id: "ja2", user_id: "u1", name: "Remote Rust Positions", criteria: { skills: ["Rust"], is_remote: true }, frequency: "weekly", is_active: false, created_at: "2026-02-01T00:00:00Z", updated_at: "2026-02-15T00:00:00Z" },
      ],
    }),
  },
  // Fallback
  {
    match: () => true,
    handle: (_u) => ({ status: 200, data: {} }),
  },
];

/**
 * Install mock fetch interceptor. Call once at app startup when VITE_MOCK_API=true.
 */
export function installMockApi() {
  const originalFetch = window.fetch;

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const method = init?.method ?? "GET";

    // Only intercept API calls
    if (!url.includes("/api/")) {
      return originalFetch(input, init);
    }

    // Simulate network delay
    await new Promise((r) => setTimeout(r, 200 + Math.random() * 300));

    let body: unknown;
    if (init?.body && typeof init.body === "string") {
      try {
        body = JSON.parse(init.body);
      } catch {
        body = init.body;
      }
    }

    for (const handler of handlers) {
      if (handler.match(method, url)) {
        const result = handler.handle(url, body);
        console.log(`[Mock API] ${method} ${url.replace(/.*\/api/, "/api")}`, result.data);
        return new Response(JSON.stringify(result.data), {
          status: result.status,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
  };

  console.log("[Mock API] Installed - API calls will return mock data");
}
