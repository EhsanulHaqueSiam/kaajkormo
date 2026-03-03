.PHONY: dev dev-frontend dev-backend build lint format check clean setup db-up db-down

# ─── Development ──────────────────────────────────────────────────────

dev: ## Start both frontend and backend in parallel
	@echo "Starting frontend and backend..."
	@$(MAKE) dev-frontend & $(MAKE) dev-backend & wait

dev-frontend: ## Start frontend dev server
	cd frontend && bun run dev

dev-backend: ## Start backend dev server
	cd backend && cargo run

dev-mock: ## Start frontend with mock API (no backend needed)
	cd frontend && VITE_MOCK_API=true bun run dev

# ─── Build ────────────────────────────────────────────────────────────

build: build-frontend build-backend ## Build everything

build-frontend:
	cd frontend && bun run build

build-backend:
	cd backend && cargo build --release

# ─── Quality ──────────────────────────────────────────────────────────

lint: lint-frontend lint-backend ## Lint everything

lint-frontend:
	cd frontend && bun run lint

lint-backend:
	cd backend && cargo clippy -- -D warnings

format: format-frontend format-backend ## Format everything

format-frontend:
	cd frontend && bun run format

format-backend:
	cd backend && cargo fmt

check: check-frontend check-backend ## Run all checks (CI equivalent)

check-frontend:
	cd frontend && bun run check && bunx tsc --noEmit

check-backend:
	cd backend && cargo fmt --check && cargo clippy -- -D warnings && cargo check

# ─── Setup ────────────────────────────────────────────────────────────

setup: ## Initial project setup
	@echo "Setting up frontend..."
	cd frontend && bun install
	@echo "Setting up backend..."
	cd backend && cargo build
	@echo "Setting up git hooks..."
	cp hooks/pre-commit .git/hooks/pre-commit 2>/dev/null || true
	chmod +x .git/hooks/pre-commit 2>/dev/null || true
	@echo "Done! Copy .env.example files to .env and fill in values."

# ─── Database ─────────────────────────────────────────────────────────

db-up: ## Start PostgreSQL via Docker
	docker compose up -d postgres

db-down: ## Stop PostgreSQL
	docker compose down

db-migrate: ## Run database migrations
	cd backend && sqlx migrate run

db-reset: ## Reset database (drop + migrate)
	cd backend && sqlx database reset -y

# ─── Clean ────────────────────────────────────────────────────────────

clean: ## Clean build artifacts
	cd frontend && rm -rf dist node_modules/.vite
	cd backend && cargo clean

# ─── Help ─────────────────────────────────────────────────────────────

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help
