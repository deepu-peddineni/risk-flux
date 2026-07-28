# Risk-Flux — Deployment Guide

> Step-by-step guide to deploy Risk-Flux to production.

---

## Table of Contents

1. [Pre-Deploy Checklist](#1-pre-deploy-checklist)
2. [Domain & DNS](#2-domain--dns)
3. [Supabase Production Setup](#3-supabase-production-setup)
4. [Option A — Docker (VPS / EC2 / DigitalOcean)](#option-a--docker-vps--ec2--digitalocean)
5. [Option B — Railway](#option-b--railway)
6. [Option C — Fly.io](#option-c--flyio)
7. [Option D — Vercel (Frontend) + Railway (Backend)](#option-d--vercel-frontend--railway-backend)
8. [Post-Deploy Steps](#4-post-deploy-steps)
9. [Troubleshooting](#5-troubleshooting)

---

## 1. Pre-Deploy Checklist

- [ ] Supabase project created with production database
- [ ] Migration SQL run (`backend/migrations/001_initial_schema.sql`)
- [ ] Admin user created + profile row inserted
- [ ] Google OAuth provider enabled (if using SSO)
- [ ] All env vars filled in (no placeholders)
- [ ] Backend starts locally without errors
- [ ] Frontend builds locally without errors (`npm run build`)
- [ ] Domain name purchased (if custom domain needed)

### Quick Build Test

```bash
# Backend
cd backend && uv run uvicorn app.main:app --port 8000
curl http://localhost:8000

# Frontend
cd frontend && npm run build
```

---

## 2. Domain & DNS

| Subdomain | Points To | Purpose |
|-----------|-----------|---------|
| `api.risk-flux.is-a.dev` | Your VPS / backend IP | FastAPI backend |
| `risk-flux.is-a.dev` | Vercel / frontend IP | Next.js frontend |

### DNS Records (Cloudflare / your registrar)

```
Type    Name              Value               TTL
A       risk-flux         <frontend-ip>       Auto
A       api               <backend-ip>        Auto
CNAME   www               risk-flux.is-a.dev  Auto
```

> For Vercel deployments, Vercel gives you a `*.vercel.app` URL. Add your custom domain in Vercel dashboard → Settings → Domains.

---

## 3. Supabase Production Setup

### Update CORS & Redirect URLs

In Supabase Dashboard → **Authentication → URL Configuration**:

| Field | Value |
|-------|-------|
| **Site URL** | `https://risk-flux.is-a.dev` |
| **Redirect URLs** | `https://risk-flux.is-a.dev/auth/callback` |

### Update Google OAuth (if enabled)

In Google Cloud Console → **Credentials → your OAuth client**:

| Field | Value |
|-------|-------|
| **Authorized JavaScript origins** | `https://risk-flux.is-a.dev` |
| **Authorized redirect URIs** | `https://YOUR_PROJECT.supabase.co/auth/v1/callback` |

### Create Production Secret Keys

If you want separate dev/prod keys:

1. Go to **Settings → API → Publishable and secret API keys**
2. Click **Create new API key** → name it `production`
3. Copy the new `sb_publishable_*` and `sb_secret_*` values for production env vars

---

## Option A — Docker (VPS / EC2 / DigitalOcean)

Best for: full control, cheapest long-term, self-managed servers.

### 1. Provision a Server

- **Provider**: DigitalOcean ($12/mo droplet), AWS EC2 t3.small, Hetzner
- **OS**: Ubuntu 22.04+ or Debian 12+
- **SSH in**: `ssh root@<your-ip>`

### 2. Install Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Log out and back in for group to take effect
```

### 3. Clone & Configure

```bash
git clone https://github.com/your-username/risk-flux.git
cd risk-flux
```

Create production env files:

```bash
# Backend
cat > backend/.env << 'EOF'
DEBUG=false
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxx
SUPABASE_SECRET_KEY=sb_secret_xxxxxxx
JWT_SECRET=
RESEND_API_KEY=re_xxxxxxx
RESEND_FROM_EMAIL=noreply@risk-flux.is-a.dev
FRONTEND_URL=https://risk-flux.is-a.dev
ALLOWED_ORIGINS=["https://risk-flux.is-a.dev","https://www.risk-flux.is-a.dev"]
EOF

# Frontend
cat > frontend/.env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxx
NEXT_PUBLIC_API_URL=https://api.risk-flux.is-a.dev
EOF
```

### 4. Update docker-compose.yml for Production

Edit `docker-compose.yml`:

```yaml
services:
  backend:
    build: ./backend
    restart: unless-stopped
    ports:
      - "8000:8000"
    env_file:
      - ./backend/.env
    environment:
      - DEBUG=false
    depends_on: []

  frontend:
    build:
      context: ./frontend
      args:
        NEXT_PUBLIC_API_URL: https://api.risk-flux.is-a.dev
        NEXT_PUBLIC_SUPABASE_URL: https://YOUR_PROJECT.supabase.co
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: sb_publishable_xxxxxxx
    restart: unless-stopped
    ports:
      - "3000:3000"
    env_file:
      - ./frontend/.env.local
    depends_on:
      - backend
```

### 5. Build & Run

```bash
docker compose up -d --build
```

### 6. Set Up Nginx Reverse Proxy (recommended)

```bash
sudo apt install nginx -y
```

Create `/etc/nginx/sites-available/risk-flux`:

```nginx
# Frontend
server {
    listen 80;
    server_name risk-flux.is-a.dev www.risk-flux.is-a.dev;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Backend API
server {
    listen 80;
    server_name api.risk-flux.is-a.dev;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/risk-flux /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

### 7. SSL with Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d risk-flux.is-a.dev -d www.risk-flux.is-a.dev -d api.risk-flux.is-a.dev
sudo certbot renew --dry-run
```

### 8. Verify

```bash
curl https://api.risk-flux.is-a.dev
# → {"service":"Risk-Flux API","status":"running",...}

curl https://api.risk-flux.is-a.dev/health
# → {"status":"ok","service":"risk-flux-api"}

curl -I https://risk-flux.is-a.dev
# → 200 OK
```

---

## Option B — Railway

Best for: quick deploys, zero infra management, free tier available.

### 1. Install Railway CLI

```bash
npm install -g @railway/cli
railway login
```

### 2. Initialize Project

```bash
railway init risk-flux
```

### 3. Deploy Backend

```bash
cd backend
railway login
railway init risk-flux-backend
```

Set environment variables:

```bash
railway variables set DEBUG=false
railway variables set SUPABASE_URL=https://YOUR_PROJECT.supabase.co
railway variables set SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxx
railway variables set SUPABASE_SECRET_KEY=sb_secret_xxxxxxx
railway variables set JWT_SECRET=""
railway variables set RESEND_API_KEY=re_xxxxxxx
railway variables set RESEND_FROM_EMAIL=noreply@risk-flux.is-a.dev
railway variables set FRONTEND_URL=https://risk-flux.vercel.app
railway variables set ALLOWED_ORIGINS='["https://risk-flux.vercel.app"]'
```

Deploy:

```bash
railway up
railway domain  # gives you a *.up.railway.app URL
```

### 4. Deploy Frontend

Option A — Railway (same project):

```bash
cd ../frontend
railway login
railway init risk-flux-frontend
railway variables set NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
railway variables set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxx
railway variables set NEXT_PUBLIC_API_URL=https://risk-flux-backend.up.railway.app
railway up
railway domain
```

Option B — Vercel (see Option D below).

### 5. Verify

```bash
curl https://risk-flux-backend.up.railway.app/
curl https://risk-flux-frontend.up.railway.app/
```

---

## Option C — Fly.io

Best for: global edge deployment, Docker-native, generous free tier.

### 1. Install Fly CLI

```bash
curl -L https://fly.io/install.sh | sh
fly auth login
```

### 2. Deploy Backend

```bash
cd backend
fly launch --name risk-flux-backend
```

When prompted:
- **Existing Dockerfile detected?** Yes
- **App name:** risk-flux-backend
- **Region:** choose closest to your users

Set secrets:

```bash
fly secrets set DEBUG=false
fly secrets set SUPABASE_URL=https://YOUR_PROJECT.supabase.co
fly secrets set SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxx
fly secrets set SUPABASE_SECRET_KEY=sb_secret_xxxxxxx
fly secrets set JWT_SECRET=""
fly secrets set RESEND_API_KEY=re_xxxxxxx
fly secrets set RESEND_FROM_EMAIL=noreply@risk-flux.is-a.dev
fly secrets set FRONTEND_URL=https://risk-flux.vercel.app
fly secrets set ALLOWED_ORIGINS='["https://risk-flux.vercel.app"]'
```

Deploy:

```bash
fly deploy
fly apps list  # get your app URL
```

### 3. Deploy Frontend

```bash
cd ../frontend
fly launch --name risk-flux-frontend
```

Set build args in `fly.toml`:

```toml
[build.args]
NEXT_PUBLIC_API_URL = "https://risk-flux-backend.fly.dev"
NEXT_PUBLIC_SUPABASE_URL = "https://YOUR_PROJECT.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_xxxxxxx"
```

Set runtime env:

```bash
fly secrets set NEXT_PUBLIC_API_URL=https://risk-flux-backend.fly.dev
fly secrets set NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
fly secrets set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxx
```

Deploy:

```bash
fly deploy
```

### 4. Add Custom Domain

```bash
fly certs add risk-flux.is-a.dev
fly certs add api.risk-flux.is-a.dev
```

Add the DNS records Fly shows you, then verify:

```bash
fly certs check risk-flux.is-a.dev
```

### 5. Verify

```bash
curl https://risk-flux-backend.fly.dev/
curl https://risk-flux-frontend.fly.dev/
```

---

## Option D — Vercel (Frontend) + Railway (Backend)

Best for: zero-config frontend deploys with global CDN, simple backend hosting.

### 1. Deploy Backend to Railway

Follow [Option B — Steps 1–3](#option-b--railway) above.

Note the backend URL: `https://risk-flux-backend.up.railway.app`

### 2. Deploy Frontend to Vercel

#### Connect Repo

1. Go to **[vercel.com](https://vercel.com)** → **Add New Project**
2. Import your `risk-flux` GitHub repo
3. **Framework Preset**: Next.js
4. **Root Directory**: `frontend`
5. Click **Environment Variables** and add:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://YOUR_PROJECT.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_xxxxxxx` |
| `NEXT_PUBLIC_API_URL` | `https://risk-flux-backend.up.railway.app` |

6. Click **Deploy**

Vercel auto-detects `output: "standalone"` in `next.config.ts` and builds correctly.

#### Add Custom Domain

1. Vercel dashboard → your project → **Settings → Domains**
2. Add `risk-flux.is-a.dev`
3. Add `www.risk-flux.is-a.dev`
4. Vercel gives you DNS records — add them to your registrar

### 3. Update Supabase Redirect URLs

In Supabase Dashboard → **Authentication → URL Configuration**:

| Field | Value |
|-------|-------|
| **Site URL** | `https://risk-flux.is-a.dev` |
| **Redirect URLs** | `https://risk-flux.is-a.dev/auth/callback` |

### 4. Update Google OAuth (if enabled)

In Google Cloud Console → **Credentials → OAuth client**:

| Field | Value |
|-------|-------|
| **Authorized JavaScript origins** | `https://risk-flux.is-a.dev`, `https://risk-flux.vercel.app` |
| **Authorized redirect URIs** | `https://YOUR_PROJECT.supabase.co/auth/v1/callback` |

### 5. Verify

```bash
curl https://risk-flux.is-a.dev/
curl https://risk-flux-backend.up.railway.app/health
```

---

## 4. Post-Deploy Steps

### Smoke Test Checklist

| Check | URL | Expected |
|-------|-----|----------|
| Backend root | `https://api.<domain>/` | JSON with service info |
| Health check | `https://api.<domain>/health` | `{"status":"ok"}` |
| API docs | `https://api.<domain>/docs` | Swagger UI |
| Frontend home | `https://<domain>/` | Risk-Flux homepage |
| Blog | `https://<domain>/blog` | Blog listing |
| Search | `https://<domain>/search?q=var` | Search results |
| Domain hub | `https://<domain>/domain` | Domain cards |
| Tech hub | `https://<domain>/technology` | Technology cards |
| Signup | `https://<domain>/signup` | Signup form |
| Google SSO | Click "Continue with Google" | Redirects to Google → back to `/auth/callback` |
| Login | Login with admin credentials | Redirects to `/profile` |

### Create Production Admin User

```sql
-- Run in Supabase SQL Editor
INSERT INTO profiles (id, username, display_name, email, role)
VALUES ('YOUR_UUID', 'admin', 'Risk-Flux Admin', 'admin@risk-flux.is-a.dev', 'admin');
```

### Enable Email Confirmations

In Supabase Dashboard → **Authentication → Providers → Email**:

- **Confirm email**: ON (production)
- **Double confirm email changes**: ON
- **Secure email change**: ON

### Set Up Monitoring (Optional)

**Uptime monitoring** (free):
- [UptimeRobot](https://uptimerobot.com) — monitor `https://api.risk-flux.is-a.dev/health`
- [Better Stack](https://betterstack.com) — uptime + incident management

**Error tracking** (free):
- [Sentry](https://sentry.io) — add to both frontend and backend

---

## 5. Troubleshooting

| Issue | Fix |
|-------|-----|
| `CORS` errors in browser | Add frontend domain to `ALLOWED_ORIGINS` in backend `.env` |
| `NEXT_PUBLIC_API_URL` undefined at runtime | Must be set at **build time** — Vercel/Railway inject it via build args |
| Google SSO: `redirect_uri_mismatch` | Add production frontend URL to Google Cloud redirect URIs |
| Google SSO: `Access Denied` | Add test user emails in Google Cloud OAuth consent screen (or publish the app) |
| Backend 502 on Railway/Fly | Check logs: `railway logs` / `fly logs` — usually missing env vars |
| Frontend blank page | Check Vercel build logs — usually missing `NEXT_PUBLIC_*` env vars |
| `Invalid API key` on backend | Ensure `SUPABASE_PUBLISHABLE_KEY` starts with `sb_publishable_` and is not placeholder |
| Docker: `npm run build` fails | Run `docker compose build --no-cache` — may be stale node_modules |
| SSL certificate errors | Wait 5 min after DNS propagation, then re-run certbot |
| Search returns empty | Run migration SQL to create tables + seed data |

---

## Quick Deploy Commands Reference

### Docker (VPS)

```bash
git pull
docker compose up -d --build
```

### Railway

```bash
railway up
```

### Fly.io

```bash
fly deploy
```

### Vercel

```bash
# Auto-deploys on git push to main
git push origin main
```

---

## Cost Estimate

| Provider | Free Tier | Paid Starting |
|----------|-----------|---------------|
| **Vercel** | 100 GB bandwidth/mo | $20/mo (Pro) |
| **Railway** | $5 credit/mo | $5/mo Hobby |
| **Fly.io** | 3 shared-cpu-1x + 3GB storage | $1.94/mo per VM |
| **DigitalOcean** | — | $12/mo (basic droplet) |
| **Supabase** | 500 MB DB, 1 GB storage | $25/mo (Pro) |

**Recommended combo for production**: Vercel (frontend) + Railway (backend) + Supabase (database) = **~$5/mo total**.
