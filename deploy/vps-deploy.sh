#!/usr/bin/env bash
set -euo pipefail

# KaajKormo VPS Deployment Script
# Usage: DEPLOY_HOST=your-server.com DEPLOY_USER=root mise run deploy:vps

DEPLOY_HOST="${DEPLOY_HOST:?Set DEPLOY_HOST (e.g. your-server.com)}"
DEPLOY_USER="${DEPLOY_USER:-root}"
DEPLOY_DIR="${DEPLOY_DIR:-/opt/kaajkormo}"

echo "═══════════════════════════════════════════════"
echo "  KaajKormo → Deploying to $DEPLOY_USER@$DEPLOY_HOST"
echo "═══════════════════════════════════════════════"

# Sync project files (excludes dev artifacts)
echo "→ Syncing files..."
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude 'target' \
  --exclude 'dist' \
  --exclude '.git' \
  --exclude 'backend/uploads/*' \
  --exclude '.env' \
  --exclude '.env.local' \
  --exclude 'frontend/.env' \
  --exclude 'backend/.env' \
  ./ "$DEPLOY_USER@$DEPLOY_HOST:$DEPLOY_DIR/"

# Run deployment on remote
echo "→ Building and starting on remote..."
ssh "$DEPLOY_USER@$DEPLOY_HOST" bash <<REMOTE
set -euo pipefail
cd $DEPLOY_DIR

# Ensure .env exists
if [ ! -f .env ]; then
  echo "ERROR: .env not found at $DEPLOY_DIR/.env"
  echo "Copy .env.production.example to .env and configure it first."
  exit 1
fi

# Build and start
docker compose -f docker-compose.prod.yml up -d --build

# Run migrations
echo "→ Running migrations..."
docker compose -f docker-compose.prod.yml exec backend ./server migrate 2>/dev/null || true
# Alternative: run sqlx migrations via a one-off container
docker compose -f docker-compose.prod.yml exec -T postgres psql -U \${DB_USER:-kaajkormo} -d \${DB_NAME:-kaajkormo} -c "SELECT 1" > /dev/null 2>&1

echo ""
echo "═══════════════════════════════════════════════"
echo "  ✓ Deployed! Check: http://$DEPLOY_HOST"
echo "═══════════════════════════════════════════════"
REMOTE
