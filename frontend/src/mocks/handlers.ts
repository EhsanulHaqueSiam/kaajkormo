/**
 * Mock API handlers for frontend development without backend.
 * Enable by setting VITE_MOCK_API=true in .env or running `mise run dev:mock`
 */

import {
  mockJobs,
  mockApplications,
  mockCandidateProfile,
  mockNotifications,
  mockInterviews,
  mockApplicationEvents,
  mockCompanies,
} from "./data";

type MockHandler = {
  match: (method: string, url: string) => boolean;
  handle: (url: string, body?: unknown) => { status: number; data: unknown };
};

const handlers: MockHandler[] = [
  // ─── Auth ────────────────────────────────────────────────────────
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

  // ─── Jobs ────────────────────────────────────────────────────────
  {
    match: (m, u) => m === "GET" && u.includes("/api/jobs") && u.includes("featured"),
    handle: () => ({
      status: 200,
      data: { data: mockJobs.slice(0, 6), total: 6, page: 1, per_page: 6, total_pages: 1 },
    }),
  },
  {
    match: (m, u) => m === "GET" && /\/api\/jobs\/[^?]/.test(u),
    handle: (u) => {
      const slug = u.split("/api/jobs/")[1]?.split("?")[0];
      const job = mockJobs.find((j) => j.slug === slug || j.id === slug);
      return { status: job ? 200 : 404, data: job || { error: "Not found" } };
    },
  },
  {
    match: (m, u) => m === "GET" && u.includes("/api/jobs"),
    handle: () => ({
      status: 200,
      data: { data: mockJobs, total: mockJobs.length, page: 1, per_page: 20, total_pages: 1 },
    }),
  },

  // ─── Candidate Profile ──────────────────────────────────────────
  {
    match: (m, u) => m === "GET" && (u.includes("/api/profile") || u.includes("/api/candidate/profile")),
    handle: () => ({ status: 200, data: mockCandidateProfile }),
  },
  {
    match: (m, u) => (m === "PUT" || m === "PATCH") && (u.includes("/api/profile") || u.includes("/api/candidate/profile")),
    handle: (_u, body) => ({ status: 200, data: { ...mockCandidateProfile, ...(body as object) } }),
  },

  // ─── Applications ───────────────────────────────────────────────
  {
    match: (m, u) => m === "GET" && u.includes("/api/applications/") && u.includes("/events"),
    handle: () => ({ status: 200, data: mockApplicationEvents }),
  },
  {
    match: (m, u) => m === "GET" && u.includes("/api/applications"),
    handle: () => ({
      status: 200,
      data: { data: mockApplications, total: mockApplications.length, page: 1, per_page: 20, total_pages: 1 },
    }),
  },
  {
    match: (m, u) => m === "POST" && u.includes("/api/applications"),
    handle: () => ({ status: 201, data: { id: "a-new", status: "pending" } }),
  },
  {
    match: (m, u) => m === "PATCH" && u.includes("/api/applications/"),
    handle: (_u, body) => ({ status: 200, data: { ...mockApplications[0], ...(body as object) } }),
  },

  // ─── Discover / Swipe ──────────────────────────────────────────
  {
    match: (m, u) => m === "GET" && u.includes("/api/discover/jobs"),
    handle: () => ({ status: 200, data: mockJobs }),
  },
  {
    match: (m, u) => m === "POST" && u.includes("/api/discover/swipe"),
    handle: () => ({ status: 200, data: { success: true } }),
  },

  // ─── Saved Jobs ─────────────────────────────────────────────────
  {
    match: (m, u) => m === "GET" && u.includes("/api/saved-jobs"),
    handle: () => ({
      status: 200,
      data: { data: mockJobs.slice(0, 3), total: 3, page: 1, per_page: 20, total_pages: 1 },
    }),
  },
  {
    match: (m, u) => m === "POST" && u.includes("/api/saved-jobs"),
    handle: () => ({ status: 200, data: { success: true } }),
  },

  // ─── Job Alerts ─────────────────────────────────────────────────
  {
    match: (m, u) => m === "GET" && u.includes("/api/job-alerts"),
    handle: () => ({
      status: 200,
      data: {
        data: [
          { id: "ja1", user_id: "u1", name: "React Jobs in Dhaka", criteria: { skills: ["React"], location: "Dhaka" }, frequency: "daily", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-03-01T00:00:00Z" },
          { id: "ja2", user_id: "u1", name: "Remote Rust Positions", criteria: { skills: ["Rust"], is_remote: true }, frequency: "weekly", is_active: true, created_at: "2026-02-01T00:00:00Z", updated_at: "2026-02-15T00:00:00Z" },
          { id: "ja3", user_id: "u1", name: "Startup Design Roles", criteria: { skills: ["Figma", "UI/UX"], location: "Dhaka" }, frequency: "instant", is_active: false, created_at: "2026-02-10T00:00:00Z", updated_at: "2026-02-20T00:00:00Z" },
        ],
        total: 3, page: 1, per_page: 20, total_pages: 1,
      },
    }),
  },
  {
    match: (m, u) => m === "POST" && u.includes("/api/job-alerts"),
    handle: (_u, body) => ({ status: 201, data: { id: "ja-new", ...(body as object) } }),
  },

  // ─── Interviews ─────────────────────────────────────────────────
  {
    match: (m, u) => m === "GET" && u.includes("/api/interviews"),
    handle: () => ({
      status: 200,
      data: { data: mockInterviews, total: mockInterviews.length, page: 1, per_page: 20, total_pages: 1 },
    }),
  },

  // ─── Notifications ──────────────────────────────────────────────
  {
    match: (m, u) => m === "GET" && u.includes("/api/notifications/unread-count"),
    handle: () => ({ status: 200, data: { count: mockNotifications.filter((n) => !n.is_read).length } }),
  },
  {
    match: (m, u) => m === "GET" && u.includes("/api/notifications"),
    handle: () => ({
      status: 200,
      data: { data: mockNotifications, total: mockNotifications.length, page: 1, per_page: 20, total_pages: 1 },
    }),
  },
  {
    match: (m, u) => m === "PATCH" && u.includes("/api/notifications/") && u.includes("/read"),
    handle: () => ({ status: 200, data: { success: true } }),
  },
  {
    match: (m, u) => m === "POST" && u.includes("/api/notifications/read-all"),
    handle: () => ({ status: 200, data: { success: true } }),
  },

  // ─── Employer ───────────────────────────────────────────────────
  {
    match: (m, u) => m === "GET" && u.includes("/api/employer/jobs"),
    handle: () => ({
      status: 200,
      data: { data: mockJobs.slice(0, 3), total: 3, page: 1, per_page: 20, total_pages: 1 },
    }),
  },
  {
    match: (m, u) => m === "GET" && (u.includes("/api/employer/company") || u.includes("/api/company")),
    handle: () => ({ status: 200, data: mockCompanies[0] }),
  },
  {
    match: (m, u) => m === "PUT" && (u.includes("/api/employer/company") || u.includes("/api/company")),
    handle: (_u, body) => ({ status: 200, data: { ...mockCompanies[0], ...(body as object) } }),
  },
  {
    match: (m, u) => m === "GET" && u.includes("/api/candidates"),
    handle: () => ({
      status: 200,
      data: {
        data: [
          { id: "u1", full_name: "Arif Rahman", email: "arif@example.com", role: "candidate", avatar_url: "https://ui-avatars.com/api/?name=AR&background=2563eb&color=fff", profile: mockCandidateProfile },
          { id: "u8", full_name: "Fatima Akter", email: "fatima@example.com", role: "candidate", avatar_url: "https://ui-avatars.com/api/?name=FA&background=7c3aed&color=fff", profile: { ...mockCandidateProfile, id: "cp2", user_id: "u8", headline: "UI/UX Designer | Figma Expert", skills: ["Figma", "UI/UX", "Adobe XD", "Prototyping"], experience_years: 3, education: "BFA in Design, DU" } },
          { id: "u9", full_name: "Kamal Hossain", email: "kamal@example.com", role: "candidate", avatar_url: "https://ui-avatars.com/api/?name=KH&background=059669&color=fff", profile: { ...mockCandidateProfile, id: "cp3", user_id: "u9", headline: "DevOps Engineer | AWS Certified", skills: ["AWS", "Docker", "Kubernetes", "Terraform"], experience_years: 5, education: "BSc in IT, KUET" } },
        ],
        total: 3, page: 1, per_page: 20, total_pages: 1,
      },
    }),
  },

  // ─── Admin ──────────────────────────────────────────────────────
  {
    match: (m, u) => m === "GET" && u.includes("/api/admin/stats"),
    handle: () => ({
      status: 200,
      data: { total_users: 1250, total_jobs: 486, total_applications: 3847, total_companies: 189, active_users_30d: 876, new_users_7d: 42 },
    }),
  },
  {
    match: (m, u) => m === "GET" && u.includes("/api/admin/jobs"),
    handle: () => ({
      status: 200,
      data: { data: mockJobs, total: mockJobs.length, page: 1, per_page: 20, total_pages: 1 },
    }),
  },
  {
    match: (m, u) => m === "GET" && u.includes("/api/admin/users"),
    handle: () => ({
      status: 200,
      data: {
        data: [
          { id: "u1", email: "arif@example.com", full_name: "Arif Rahman", role: "candidate", is_active: true, created_at: "2025-06-01T00:00:00Z" },
          { id: "u2", email: "hr@grameenphone.com", full_name: "Nadia Sultana", role: "employer", is_active: true, created_at: "2025-05-01T00:00:00Z" },
          { id: "u8", email: "fatima@example.com", full_name: "Fatima Akter", role: "candidate", is_active: true, created_at: "2025-08-15T00:00:00Z" },
          { id: "u9", email: "kamal@example.com", full_name: "Kamal Hossain", role: "candidate", is_active: false, created_at: "2025-09-01T00:00:00Z" },
          { id: "u10", email: "admin@kaajkormo.com", full_name: "Admin User", role: "admin", is_active: true, created_at: "2024-01-01T00:00:00Z" },
        ],
        total: 5, page: 1, per_page: 20, total_pages: 1,
      },
    }),
  },

  // ─── Ratings ────────────────────────────────────────────────────
  {
    match: (m, u) => m === "GET" && u.includes("/api/ratings"),
    handle: () => ({ status: 200, data: { rating: 4, notes: "Strong technical skills" } }),
  },

  // ─── Companies ──────────────────────────────────────────────────
  {
    match: (m, u) => m === "GET" && u.includes("/api/companies/"),
    handle: () => ({ status: 200, data: mockCompanies[0] }),
  },

  // ─── Fallback ───────────────────────────────────────────────────
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
    await new Promise((r) => setTimeout(r, 100 + Math.random() * 150));

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
