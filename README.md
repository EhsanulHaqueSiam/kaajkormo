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
| **Dev Tooling** | [mise](https://mise.jdx.dev/) (task runner + version manager) |
| **CI/CD** | GitHub Actions |
| **Deploy** | Docker Compose, Nginx, systemd |
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
├── deploy/                    # Deployment scripts & configs
│   ├── vps-deploy.sh          # One-command VPS deploy
│   ├── setup-vps.sh           # Fresh VPS provisioning
│   ├── nginx-ssl.conf         # Production Nginx + SSL
│   └── kaajkormo.service      # systemd service file
├── .github/workflows/ci.yml   # CI pipeline
├── docker-compose.yml          # Local PostgreSQL (dev)
├── docker-compose.prod.yml     # Full production stack
├── mise.toml                   # Dev tooling (tasks + tool versions)
├── DEPLOY.md                   # Deployment guide
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
- [mise](https://mise.jdx.dev/) — manages Rust, Bun, Node versions + runs all tasks
- [Docker](https://www.docker.com/) — for PostgreSQL (and production deployment)
- [Clerk](https://clerk.com) account — for auth

### 1. Install mise and clone
```bash
# Install mise (if not already installed)
curl https://mise.jdx.dev/install.sh | sh

git clone https://github.com/EhsanulHaqueSiam/kaajkormo.git
cd kaajkormo
mise install       # Installs Rust 1.86, Bun 1.3, Node 22
mise run setup     # Installs deps, builds, configures hooks
```

### 2. Configure environment
```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
# Fill in your Clerk keys, database URL, etc.
```

### 3. Start database
```bash
mise run db:up          # Start PostgreSQL via Docker
mise run db:migrate     # Run migrations
```

### 4. Run development
```bash
mise run dev            # Start both frontend + backend
# OR
mise run dev:mock       # Frontend only with mock API data (no backend needed)
```

### 5. Open
- Frontend: http://localhost:5173
- Backend API: http://localhost:8080
- Health check: http://localhost:8080/api/health

---

## Development Commands

All commands use `mise run <task>`. Run `mise tasks` to see the full list.

```bash
# Development
mise run dev              # Start frontend + backend in parallel
mise run dev:mock         # Frontend with mock API (no backend)
mise run dev:frontend     # Frontend only
mise run dev:backend      # Backend only

# Build
mise run build            # Build everything for production
mise run build:frontend   # Build frontend SPA
mise run build:backend    # Build backend release binary

# Quality
mise run lint             # Lint frontend (Biome) + backend (Clippy)
mise run format           # Auto-format everything
mise run check            # Full CI check locally
mise run fix              # Auto-fix all lint/format issues

# Database
mise run db:up            # Start PostgreSQL via Docker
mise run db:migrate       # Run migrations
mise run db:reset         # Drop + recreate database
mise run db:status        # Show migration status

# Docker (Production)
mise run docker:build     # Build production images
mise run docker:up        # Start all production services
mise run docker:down      # Stop production services
mise run docker:logs      # Tail logs
mise run docker:restart   # Rebuild and restart

# Deploy
mise run deploy:vps       # Deploy to VPS via SSH

# Utilities
mise run clean            # Clean build artifacts
mise run clean:all        # Deep clean (removes node_modules too)
```

---

## Screenshots

### Landing Page
![Landing Page](screenshots/01-landing.png)

### Browse Jobs
![Jobs Listing](screenshots/02-jobs-listing.png)

### Job Detail
![Job Detail](screenshots/02b-job-detail.png)

### Discover — Swipe to Apply
![Discover Swipe](screenshots/03-discover-swipe.png)

### Candidate Dashboard
![Candidate Dashboard](screenshots/04-candidate-dashboard.png)

### Candidate Profile Editor
![Candidate Profile](screenshots/05-candidate-profile.png)

### Application Tracker
![Applications](screenshots/06-candidate-applications.png)

### Job Alerts
![Job Alerts](screenshots/07-candidate-alerts.png)

### Notifications
![Notifications](screenshots/09-notifications.png)

### Employer Dashboard
![Employer Dashboard](screenshots/10-employer-dashboard.png)

### Post a Job (Multi-Step Form)
![Post Job](screenshots/11-employer-post-job.png)

### CV Bank — Candidate Search
![Candidates](screenshots/12-employer-candidates.png)

### Interview Management
![Interviews](screenshots/13-employer-interviews.png)

### Applicant Kanban Board
![Kanban Board](screenshots/14-employer-kanban.png)

### Company Profile Editor
![Company Profile](screenshots/15-employer-company-profile.png)

### Admin Dashboard
![Admin Dashboard](screenshots/16-admin-dashboard.png)

### Admin — Job Moderation
![Admin Jobs](screenshots/17-admin-jobs.png)

### Admin — User Management
![Admin Users](screenshots/18-admin-users.png)

### Mobile — Landing Page
![Mobile Landing](screenshots/19-mobile-landing.png)

### Mobile — Discover
![Mobile Discover](screenshots/20-mobile-discover.png)

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
