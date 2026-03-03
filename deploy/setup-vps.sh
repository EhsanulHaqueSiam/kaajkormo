#!/usr/bin/env bash
set -euo pipefail

# KaajKormo VPS Initial Setup Script
# Run this ONCE on a fresh Ubuntu/Debian VPS to install prerequisites
# Usage: ssh root@your-server.com 'bash -s' < deploy/setup-vps.sh

echo "═══════════════════════════════════════════════"
echo "  KaajKormo → VPS Setup"
echo "═══════════════════════════════════════════════"

# Update system
apt-get update && apt-get upgrade -y

# Install Docker
if ! command -v docker &> /dev/null; then
  echo "→ Installing Docker..."
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker
  systemctl start docker
else
  echo "→ Docker already installed"
fi

# Install Docker Compose plugin
if ! docker compose version &> /dev/null; then
  echo "→ Installing Docker Compose plugin..."
  apt-get install -y docker-compose-plugin
else
  echo "→ Docker Compose already installed"
fi

# Create app directory
mkdir -p /opt/kaajkormo
cd /opt/kaajkormo

# Setup firewall (if ufw is available)
if command -v ufw &> /dev/null; then
  echo "→ Configuring firewall..."
  ufw allow 22/tcp   # SSH
  ufw allow 80/tcp   # HTTP
  ufw allow 443/tcp  # HTTPS
  ufw --force enable
fi

echo ""
echo "═══════════════════════════════════════════════"
echo "  ✓ VPS ready!"
echo ""
echo "  Next steps:"
echo "  1. Copy .env.production.example to /opt/kaajkormo/.env"
echo "  2. Edit .env with your real values"
echo "  3. Run: DEPLOY_HOST=your-server.com mise run deploy:vps"
echo "═══════════════════════════════════════════════"
