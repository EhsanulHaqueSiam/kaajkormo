# KaajKormo — Deployment Guide

## Quick Start (Any VPS)

Works on: **DigitalOcean**, **Hetzner**, **Linode**, **Vultr**, **AWS EC2**, **Hostinger VPS**, **Namecheap VPS**, or any Ubuntu/Debian server.

### 1. Prepare your VPS

SSH into your server and run the setup script:

```bash
ssh root@your-server.com 'bash -s' < deploy/setup-vps.sh
```

This installs Docker, Docker Compose, and configures the firewall.

### 2. Configure environment

```bash
# On the VPS
cp .env.production.example /opt/kaajkormo/.env
nano /opt/kaajkormo/.env
```

Fill in your real values:
- `DB_PASSWORD` — strong random password
- `CLERK_ISSUER` — your Clerk issuer URL
- `CLERK_PUBLISHABLE_KEY` — your Clerk publishable key
- `RESEND_API_KEY` — your Resend API key
- `MEILISEARCH_KEY` — strong random key

### 3. Deploy

From your local machine:

```bash
DEPLOY_HOST=your-server.com DEPLOY_USER=root mise run deploy:vps
```

That's it. Your app is live at `http://your-server.com`.

### 4. Add SSL (HTTPS)

```bash
ssh root@your-server.com

# Install certbot
apt install -y certbot python3-certbot-nginx nginx

# Copy and edit the nginx config
cp /opt/kaajkormo/deploy/nginx-ssl.conf /etc/nginx/sites-available/kaajkormo
# Edit server_name to your domain
nano /etc/nginx/sites-available/kaajkormo
ln -s /etc/nginx/sites-available/kaajkormo /etc/nginx/sites-enabled/

# Get SSL certificate
certbot --nginx -d your-domain.com -d www.your-domain.com

# Update FRONTEND_PORT in .env to avoid conflict
# Change docker-compose frontend port to 3000:80 and proxy via nginx
```

---

## Deployment Options

### Option A: Docker Compose (Recommended)

Best for: VPS, dedicated servers, cloud VMs.

```bash
# Build and start everything
mise run docker:build
mise run docker:up

# Check status
mise run docker:ps

# View logs
mise run docker:logs

# Restart after config changes
mise run docker:restart
```

**Services included:**
- Frontend (Nginx + React SPA)
- Backend (Rust binary)
- PostgreSQL 17
- Redis 7 (for caching/sessions)
- Meilisearch (for full-text search)

### Option B: Bare Metal (No Docker)

For servers where Docker isn't available.

**Backend:**
```bash
# Build on server (needs Rust toolchain)
cd backend
cargo build --release

# Or cross-compile locally and scp the binary
cross build --target x86_64-unknown-linux-gnu --release
scp target/x86_64-unknown-linux-gnu/release/kaajkormo-backend user@server:/opt/kaajkormo/

# Run with systemd (see deploy/kaajkormo.service)
sudo cp deploy/kaajkormo.service /etc/systemd/system/
sudo systemctl enable kaajkormo
sudo systemctl start kaajkormo
```

**Frontend:**
```bash
cd frontend
bun run build
# Upload dist/ contents to your web server root
scp -r dist/* user@server:/var/www/kaajkormo/
```

### Option C: Shared Hosting (cPanel/Hostinger/Namecheap)

**Frontend only** — shared hosting can serve the static SPA.

1. Build locally: `mise run build:frontend`
2. Upload `frontend/dist/` contents to `public_html/`
3. Create `.htaccess` for SPA routing:

```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

4. Set `VITE_API_URL` to your backend URL before building
5. Host the backend on a VPS or cloud service separately

---

## Scaling Path

### Phase 1: Single VPS (Current)
- Docker Compose with all services on one server
- Good for up to ~10K concurrent users
- Cost: ~$10-20/month

### Phase 2: Managed Services
Replace self-hosted services with managed alternatives:

| Service | Self-Hosted | Managed Alternative |
|---------|-------------|---------------------|
| Database | PostgreSQL container | **Neon**, Supabase, AWS RDS |
| Cache | Redis container | **Upstash Redis**, AWS ElastiCache |
| Search | Meilisearch container | **Meilisearch Cloud**, Algolia |
| Storage | Local disk | **Cloudflare R2**, AWS S3 |
| Email | Resend API | Already managed |

### Phase 3: AWS / Cloud Scale

**AWS EC2 + RDS + ElastiCache:**
```
                    ┌─── EC2 (Frontend + Nginx) ──┐
Internet → ALB ─────┤                               │
                    └─── EC2 (Backend Cluster) ────┘
                              │
                    ┌─────────┼──────────┐
                    RDS       ElastiCache  S3
                 (Postgres)   (Redis)    (Uploads)
```

**To migrate:**
1. Spin up RDS PostgreSQL, import data with `pg_dump`/`pg_restore`
2. Point `DATABASE_URL` to RDS endpoint
3. Set up ElastiCache Redis, point `REDIS_URL`
4. Use S3/R2 for file uploads (change `UPLOAD_DIR` to S3 path)
5. Add ALB for load balancing multiple backend instances

### Phase 4: Event Streaming (Kafka)

When you need real-time processing at scale:

```
Backend → Kafka Topics → Consumers
  │
  ├── job.posted      → Notification Service, Search Indexer
  ├── application.new → Email Service, Analytics
  ├── status.changed  → Notification Service, Email Service
  └── user.activity   → Recommendation Engine
```

**To add Kafka:**
1. Add `rdkafka` crate to backend
2. Create a `KafkaProducer` service (similar to `EmailService`)
3. Publish events from route handlers
4. Create consumer services for each topic
5. Use Confluent Cloud or self-host with Docker

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `CLERK_ISSUER` | Yes | — | Clerk issuer URL |
| `CLERK_PUBLISHABLE_KEY` | Yes | — | Clerk frontend key |
| `RESEND_API_KEY` | No | — | Resend email API key |
| `REDIS_URL` | No | `redis://127.0.0.1:6379` | Redis connection |
| `MEILISEARCH_URL` | No | `http://127.0.0.1:7700` | Meilisearch endpoint |
| `MEILISEARCH_KEY` | No | — | Meilisearch master key |
| `UPLOAD_DIR` | No | `./uploads` | File upload directory |
| `PORT` | No | `8080` | Backend port |
| `RUST_LOG` | No | `info` | Log level |
| `FRONTEND_PORT` | No | `80` | Frontend exposed port |
| `DB_USER` | No | `kaajkormo` | Database user |
| `DB_PASSWORD` | No | `kaajkormo` | Database password |
| `DB_NAME` | No | `kaajkormo` | Database name |

---

## Monitoring

### Health Check
```bash
curl http://your-domain.com/api/health
```

### Docker Logs
```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f backend
```

### Resource Usage
```bash
docker stats
```

---

## Backup

### Database
```bash
# Backup
docker compose -f docker-compose.prod.yml exec postgres \
  pg_dump -U kaajkormo kaajkormo > backup_$(date +%Y%m%d).sql

# Restore
cat backup_20260303.sql | docker compose -f docker-compose.prod.yml exec -T postgres \
  psql -U kaajkormo kaajkormo
```

### Uploads
```bash
# Backup uploads volume
docker run --rm -v kaajkormo_uploads:/data -v $(pwd):/backup \
  alpine tar czf /backup/uploads_$(date +%Y%m%d).tar.gz -C /data .
```
