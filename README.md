# KaajKormo (কাজকর্ম)

**Bangladesh's next-generation job portal with Tinder-style swipe-to-apply.**

KaajKormo reimagines job hunting for the Bangladeshi market — swipe right to instantly apply, upload your CV and let AI parse it, track every application stage in real-time, and get email notifications as you progress. Employers get a Kanban board to manage applicants, schedule interviews, and rate candidates.

---

## Key Features

### For Job Seekers
- **Swipe to Apply** — Tinder-style card stack. Swipe right = instant apply, left = skip, up = save. Zero extra clicks.
- **CV Auto-Parse** — Upload your PDF resume, AI extracts name, email, phone, skills, education, and experience automatically.
- **Photo Profile** — Required profile photo for a professional, complete candidate profile.
- **Real-Time Application Tracking** — See every status change in a timeline (pending → viewed → shortlisted → interview → offered).
- **Job Alerts** — Set up keyword/skill/location filters, get notified instantly, daily, or weekly.
- **Smart Match Scores** — See how well your skills match each job as a percentage.
- **Keyboard Shortcuts** — Navigate and apply using arrow keys on desktop.

### For Employers
- **Kanban Applicant Board** — Drag-and-drop candidates across status columns (Pending → Viewed → Shortlisted → Interview → Offered → Hired).
- **Candidate Search (CV Bank)** — Search and filter all open-to-work candidates by skills, experience, location, salary.
- **Interview Scheduling** — Create, confirm, reschedule, or cancel interviews with automatic candidate notifications.
- **Candidate Ratings** — Rate applicants 1-5 stars with notes.
- **Email Notifications** — Automatic emails via Resend for status changes, interview scheduling, new applications.

### Platform
- **Glass Morphism UI** — Premium design with backdrop blur, gradient accents, smooth framer-motion animations.
- **Fully Responsive** — Mobile-first, works at 375px through 1440px+.
- **Command Palette** — Cmd+K to search anything quickly.
- **Notification Bell** — Real-time unread count with dropdown.
- **Dark Mode Ready** — CSS variables prepared for dark theme.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TanStack Router, TanStack Query, Tailwind CSS v4, Framer Motion, Vite, Bun |
| **Backend** | Rust (Axum 0.8), SQLx, Tower-HTTP |
| **Database** | PostgreSQL 17 |
| **Auth** | Clerk (JWT via JWKS) |
| **Email** | Resend API |
| **Linting** | Biome (frontend), Clippy + Rustfmt (backend) |
| **CI/CD** | GitHub Actions |
| **Icons** | Lucide React |
| **Animations** | Framer Motion |

---

## Project Structure

```
kaajkormo/
├── frontend/                 # React SPA
│   ├── src/
│   │   ├── components/       # UI, layout, feature components
│   │   │   ├── ui/           # 23 reusable UI components
│   │   │   ├── layout/       # Header, Footer, MobileNav, DashboardLayout
│   │   │   ├── discover/     # SwipeCard, CardStack
│   │   │   └── jobs/         # JobCard, JobFilters, JobSearch
│   │   ├── routes/           # File-based routing (TanStack Router)
│   │   │   ├── candidate/    # Dashboard, Discover, Profile, Applications, Alerts, Saved
│   │   │   ├── employer/     # Dashboard, Post Job, Applicants Kanban, Candidates, Interviews
│   │   │   ├── admin/        # Dashboard, Jobs, Users
│   │   │   ├── auth/         # Login, Register
│   │   │   └── jobs/         # Listing, Detail
│   │   ├── lib/              # API client, auth, utils, query hooks
│   │   ├── mocks/            # Mock API data for development
│   │   └── types/            # TypeScript interfaces
│   ├── biome.json            # Biome linter config
│   └── package.json
├── backend/                  # Rust API server
│   ├── src/
│   │   ├── routes/           # 14 route modules (REST API)
│   │   ├── models/           # 12 data models
│   │   ├── services/         # Email, file upload, resume parser, notifications
│   │   ├── middleware/       # Clerk JWT auth
│   │   └── main.rs
│   ├── migrations/           # 8 PostgreSQL migrations
│   ├── rustfmt.toml          # Rust formatter config
│   └── clippy.toml           # Clippy linter config
├── .github/workflows/ci.yml  # CI pipeline
├── docker-compose.yml         # Local PostgreSQL
├── Makefile                   # Dev commands
└── README.md
```

---

## API Endpoints

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/jobs` | Search/filter jobs (paginated) |
| GET | `/api/jobs/featured` | Featured jobs |
| GET | `/api/jobs/{id}` | Job detail |
| GET | `/api/companies/{id}` | Company detail |

### Auth Required
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/me` | Current user |
| POST | `/api/auth/set-role` | Set role (candidate/employer) |

### Candidate
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/PUT | `/api/profile` | Get/update candidate profile |
| POST | `/api/profile/parse-resume` | Upload + parse PDF resume |
| GET | `/api/discover/jobs` | Get swipeable job batch |
| POST | `/api/discover/swipe` | Record swipe action |
| POST | `/api/discover/undo` | Undo last swipe |
| GET | `/api/saved-jobs` | List saved jobs |
| POST/DELETE | `/api/saved-jobs/{id}` | Save/unsave job |
| GET | `/api/job-alerts` | List job alerts |
| POST/PUT/DELETE | `/api/job-alerts/{id}` | CRUD job alerts |

### Employer
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/jobs` | Create job |
| PUT/DELETE | `/api/jobs/{id}` | Update/close job |
| GET/PUT | `/api/company` | Company profile |
| GET | `/api/candidates` | Search candidates |
| POST | `/api/interviews` | Schedule interview |
| GET/PATCH/DELETE | `/api/interviews/{id}` | Manage interviews |
| POST | `/api/ratings` | Rate candidate |

### Shared
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/applications` | List/create applications |
| PATCH | `/api/applications/{id}` | Update status |
| GET | `/api/applications/{id}/events` | Application timeline |
| GET | `/api/notifications` | List notifications |
| PATCH | `/api/notifications/{id}/read` | Mark read |
| POST | `/api/notifications/read-all` | Mark all read |
| GET | `/api/notifications/unread-count` | Unread count |
| POST | `/api/uploads/resume\|photo\|logo` | File uploads |

---

## Getting Started

### Prerequisites
- [Bun](https://bun.sh) (v1.0+)
- [Rust](https://rustup.rs) (stable)
- [PostgreSQL](https://www.postgresql.org/) 15+ (or Docker)
- [Clerk](https://clerk.com) account (for auth)

### 1. Clone and setup
```bash
git clone https://github.com/YOUR_USERNAME/kaajkormo.git
cd kaajkormo
make setup
```

### 2. Configure environment
```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
# Fill in your Clerk keys, database URL, etc.
```

### 3. Start database
```bash
make db-up          # Start PostgreSQL via Docker
make db-migrate     # Run migrations
```

### 4. Run development
```bash
make dev            # Start both frontend + backend
# OR
make dev-mock       # Frontend only with mock API data (no backend needed)
```

### 5. Open
- Frontend: http://localhost:5173
- Backend API: http://localhost:8080
- Health check: http://localhost:8080/api/health

---

## Development Commands

```bash
make dev            # Start frontend + backend
make dev-mock       # Frontend with mock API (no backend)
make build          # Build everything for production
make lint           # Lint frontend (Biome) + backend (Clippy)
make format         # Format frontend + backend
make check          # Full CI check locally
make db-up          # Start PostgreSQL
make db-migrate     # Run migrations
make clean          # Clean build artifacts
```

---

## Screenshots

> Screenshots will be added once the application is deployed with real data.

### Landing Page
`[Coming Soon]`

### Discover (Swipe to Apply)
`[Coming Soon]`

### Candidate Dashboard
`[Coming Soon]`

### Employer Kanban Board
`[Coming Soon]`

---

## Architecture Decisions

- **Monorepo**: Single repo with independent `frontend/` and `backend/` — simple, no monorepo tooling needed.
- **Rust Backend**: Chosen for performance, type safety, and memory safety. Axum provides async web framework with tower middleware ecosystem.
- **React + TanStack**: File-based routing (TanStack Router) + server state management (TanStack Query) = minimal boilerplate.
- **Clerk Auth**: Enterprise-grade auth without building it ourselves. JWT verification via JWKS on the backend.
- **Biome**: Replaces ESLint + Prettier — single tool, 100x faster, zero config.
- **Framer Motion**: Production-quality animations for the swipe feature and UI transitions.

---

## Motivation

Bangladesh's job market is served by portals that haven't evolved in design or UX for years. KaajKormo (কাজকর্ম) brings modern product thinking:

1. **Minimum Clicks** — Swipe-to-apply eliminates the tedious multi-step application process.
2. **AI Resume Parsing** — No more filling forms manually. Upload once, auto-fill everywhere.
3. **Real-Time Tracking** — Know exactly where your application stands at every moment.
4. **Employer Efficiency** — Kanban boards, ratings, and interview scheduling replace spreadsheet chaos.
5. **World-Class Design** — Glass morphism, smooth animations, responsive — matching the best global products.

---

## License

MIT

---

Built with ❤️ for Bangladesh
