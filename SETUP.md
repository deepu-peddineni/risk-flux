# Risk-Flux — Local Development Setup Guide

> Complete guide to set up, run, and develop Risk-Flux locally.

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| **Python** | 3.11+ | `brew install python@3.13` or [python.org](https://python.org) |
| **uv** | latest | `brew install uv` or `curl -LsSf https://astral.sh/uv/install.sh \| sh` |
| **Node.js** | 18+ | `brew install node` or [nodejs.org](https://nodejs.org) |
| **Git** | any | `brew install git` |
| **Docker** (optional) | 20+ | [docker.com/get-started](https://docker.com/get-started) |

---

## Step 1 — Create a Supabase Project (Free)

1. Go to **[supabase.com](https://supabase.com)** → **Start your project** → Sign up with GitHub
2. Click **New Project**
   - **Organization**: Create one (e.g. `risk-flux`)
   - **Project name**: `risk-flux`
   - **Database password**: Choose a strong password (save it!)
   - **Region**: Choose closest to you (e.g. `US East` or `EU West`)
3. Wait ~2 minutes for the project to spin up

### Get Your Keys

Once the project is ready, go to **Settings → API** (gear icon):

#### New API Keys (Recommended)

Go to **Publishable and secret API keys** tab:

| Key | Where | Format |
|-----|-------|--------|
| **Publishable Key** | `Settings → API → Publishable and secret API keys` | `sb_publishable_xxx` |
| **Secret Key** | `Settings → API → Publishable and secret API keys` | `sb_secret_xxx` |

> Legacy `anon` and `service_role` keys are deprecated and will be removed by end of 2026. Use the new keys.

#### JWT Secret

Go to **Settings → API → JWT Settings** (or **JWT Signing Keys** if migrated):

| Key | Where |
|-----|-------|
| **JWT Secret** | `Settings → API → JWT Settings → JWT Secret` |

---

## Step 2 — Run Database Migrations

1. In Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **New query**
3. Copy the entire contents of `backend/migrations/001_initial_schema.sql`
4. Paste it into the SQL Editor and click **Run**
5. You should see "Success. No rows returned"

This creates all tables: `profiles`, `categories`, `subcategories`, `posts`, `tags`, `comments`, `likes`, plus RLS policies and seed data.

### Create Your Admin User

After migration, you need to create an admin user:

1. Go to **Authentication** → **Users** → **Add user**
2. Enter email and password (e.g. `admin@riskflux.dev` / `admin123`)
3. After creating, copy the **User UUID** from the users list
4. Go back to **SQL Editor** and run:
   ```sql
   INSERT INTO profiles (id, username, display_name, email, role)
   VALUES ('YOUR_USER_UUID_HERE', 'admin', 'Risk-Flux Admin', 'admin@riskflux.dev', 'admin');
   ```
   Replace `YOUR_USER_UUID_HERE` with the actual UUID.

### Set Up Google OAuth Provider (Optional)

To enable "Continue with Google" on login/signup:

#### 1. Create a Google Cloud OAuth Client

1. Go to **[Google Cloud Console](https://console.cloud.google.com/)**
2. Create a new project (e.g. `risk-flux`) or select an existing one
3. Go to **APIs & Services → Credentials**
4. Click **+ Create Credentials → OAuth client ID**
5. If prompted, configure the **OAuth consent screen** first:
   - User type: **External**
   - App name: `Risk-Flux`
   - User support email: your email
   - Developer contact: your email
   - Save and continue through the scopes step (use default)
   - Add your email as a test user (required while in "Testing" status)
6. Back at **Create OAuth client ID**:
   - Application type: **Web application**
   - Name: `Risk-Flux`
   - **Authorized JavaScript origins**: `http://localhost:3000`
   - **Authorized redirect URIs**: `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`
7. Click **Create**
8. Copy the **Client ID** and **Client Secret**

#### 2. Configure Google Provider in Supabase

1. In Supabase dashboard, go to **Authentication → Providers**
2. Find **Google** and click to expand
3. Toggle **Enable Sign in with Google** → ON
4. Paste your **Client ID** (from Google Cloud Console)
5. Paste your **Client Secret** (from Google Cloud Console)
6. Click **Save**

#### 3. Add Redirect URI to Google Cloud (for local dev)

1. Go back to **[Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)**
2. Click on your OAuth client
3. Under **Authorized redirect URIs**, add:
   ```
   http://localhost:3000/auth/callback
   ```
4. Click **Save**

> **Note:** Google requires your app to be in "Testing" mode during local dev. Only emails you add as test users (in the OAuth consent screen) can sign in. To let anyone sign in, publish the app (requires Google verification for production use).

---

## Step 3 — Set Up Environment Variables

### Backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and fill in:

```bash
# App
DEBUG=true
SECRET_KEY=any-random-string-here

# Supabase — Project URL
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co

# Supabase — New API keys (from Settings → API → Publishable and secret API keys)
SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxx
SUPABASE_SECRET_KEY=sb_secret_xxxxxxx

# JWT — from Supabase Settings → API → JWT Settings → JWT Secret
JWT_SECRET=your_jwt_secret_here

# Email — Resend (optional, can leave empty for now)
RESEND_API_KEY=
RESEND_FROM_EMAIL=noreply@risk-flux.is-a.dev

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Frontend

```bash
cd frontend
cp .env.example .env.local
```

Edit `frontend/.env.local` and fill in:

```bash
# Supabase (same URL + publishable key as backend)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key_here

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Step 4 — Run the Backend (uv)

```bash
cd backend

# Install uv (first time only)
# brew install uv
# OR
# curl -LsSf https://astral.sh/uv/install.sh | sh

# Install dependencies and create .venv (first time only)
uv sync --python 3.13

# Start the server
uv run uvicorn app.main:app --reload --port 8000
```

The API is now running at **http://localhost:8000**

### Verify

- Root: `http://localhost:8000` — shows API info and available endpoints
- Health check: `http://localhost:8000/health`
- API docs (dev mode): `http://localhost:8000/docs`
- Search endpoint: `http://localhost:8000/api/v1/search/?q=test`
- Posts endpoint: `http://localhost:8000/api/v1/posts/`

---

## Step 5 — Run the Frontend

Open a **new terminal**:

```bash
cd frontend

# Install dependencies (first time only)
npm install

# Start the dev server
npm run dev
```

The app is now running at **http://localhost:3000**

### Pages to visit

| URL | Description |
|-----|------------|
| `http://localhost:3000` | Home page |
| `http://localhost:3000/blog` | Blog listing |
| `http://localhost:3000/domain` | Domain knowledge hub |
| `http://localhost:3000/technology` | Technology stack hub |
| `http://localhost:3000/search` | Search page |
| `http://localhost:3000/login` | Login (with Google SSO) |
| `http://localhost:3000/signup` | Signup (with Google SSO) |

---

## Running with Docker (Alternative)

If you prefer Docker (uses uv inside the container too):

```bash
# From project root
cp backend/.env.example backend/.env   # fill in values
cp frontend/.env.example frontend/.env.local  # fill in values

docker compose up --build
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`

To stop: `docker compose down`

---

## uv — Quick Reference

| Command | What it does |
|---------|-------------|
| `uv sync --python 3.13` | Install all dependencies into `.venv` (pinned to Python 3.13) |
| `uv run <cmd>` | Run a command inside the managed venv |
| `uv add <pkg>` | Add a new dependency |
| `uv remove <pkg>` | Remove a dependency |
| `uv lock` | Update `uv.lock` without installing |
| `uv sync --frozen` | Install from lockfile without updating it (CI/Docker) |
| `uv python list` | List available Python versions |
| `uv python pin 3.13` | Pin Python version for the project |

---

## Project Structure

```
risk-flux/
├── backend/                    # FastAPI Python backend
│   ├── app/
│   │   ├── api/v1/endpoints/   # Route handlers (auth, posts, search, etc.)
│   │   ├── core/               # Config, auth, Supabase client
│   │   ├── services/           # Business logic (search, reading_time)
│   │   └── main.py             # FastAPI app entry point
│   ├── migrations/             # SQL migrations
│   ├── pyproject.toml          # Python project config (uv)
│   ├── uv.lock                 # Locked dependency versions
│   └── Dockerfile
│
├── frontend/                   # Next.js 16 React frontend
│   ├── src/
│   │   ├── app/                # Pages (App Router)
│   │   │   ├── page.tsx        # Home
│   │   │   ├── blog/           # Blog listing + [slug] detail
│   │   │   ├── domain/         # Domain hub + [slug] detail
│   │   │   ├── technology/     # Technology hub + [slug] detail
│   │   │   ├── search/         # Search page
│   │   │   ├── login/          # Auth pages
│   │   │   ├── signup/
│   │   │   └── auth/callback/  # OAuth redirect handler
│   │   └── components/         # Reusable components
│   │       ├── layout/         # Navbar, Footer
│   │       └── search/         # SearchBar
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml          # Docker orchestration
├── SETUP.md                    # This file
└── riskkernel_architecture.md  # Full architecture doc
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/health` | No | Health check |
| `GET` | `/docs` | No | Swagger docs (dev only) |
| **Auth** | | | |
| `POST` | `/api/v1/auth/signup` | No | Register new user |
| `POST` | `/api/v1/auth/login` | No | Login, returns JWT |
| `POST` | `/api/v1/auth/logout` | Yes | Logout |
| `GET` | `/api/v1/auth/google` | No | Google OAuth URL |
| **Posts** | | | |
| `GET` | `/api/v1/posts/` | No | List published posts |
| `GET` | `/api/v1/posts/{slug}` | No | Get single post |
| `POST` | `/api/v1/posts/` | Admin | Create post |
| `PUT` | `/api/v1/posts/{id}` | Admin | Update post |
| `DELETE` | `/api/v1/posts/{id}` | Admin | Delete post |
| **Search** | | | |
| `GET` | `/api/v1/search/?q={query}` | No | Full-text search |
| **Comments** | | | |
| `GET` | `/api/v1/comments/post/{id}` | No | Get comments |
| `POST` | `/api/v1/comments/post/{id}` | Yes | Add comment |
| **Likes** | | | |
| `POST` | `/api/v1/likes/post/{id}` | Yes | Like a post |
| `DELETE` | `/api/v1/likes/post/{id}` | Yes | Unlike a post |
| **Tags** | | | |
| `GET` | `/api/v1/tags/` | No | List all tags |

---

## Common Development Tasks

### Add a new API endpoint

1. Create file in `backend/app/api/v1/endpoints/your_feature.py`
2. Add router in `backend/app/api/v1/router.py`
3. Restart backend (auto-reloads with `--reload`)

### Add a new page

1. Create `frontend/src/app/your-page/page.tsx`
2. Add nav link in `frontend/src/components/layout/Navbar.tsx`

### Database changes

1. Create new migration SQL in `backend/migrations/`
2. Run it in Supabase SQL Editor
3. Update schemas in `backend/app/schemas/` if needed

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Backend: `SUPABASE_URL Field required` | Fill in `backend/.env` with your Supabase keys (publishable + secret) |
| Backend: `401 Unauthorized` on auth routes | JWT_SECRET must match Supabase's JWT secret |
| Frontend: `Failed to fetch results` | Make sure backend is running on port 8000 |
| Frontend: Blank page / hydration error | Check `NEXT_PUBLIC_API_URL` in `.env.local` |
| Docker: build fails | Run `docker compose build --no-cache` |
| Search returns empty | Run the migration SQL to create tables + seed data |
| `uv` not found | Install: `curl -LsSf https://astral.sh/uv/install.sh \| sh` |
| Google SSO: "redirect_uri_mismatch" | Add `http://localhost:3000/auth/callback` to Google Cloud → Credentials → Authorized redirect URIs |
| Google SSO: "Access Denied" | Your email must be added as a test user in Google Cloud → OAuth consent screen → Test users |
| Google SSO: button does nothing | Check `NEXT_PUBLIC_API_URL` is set in `.env.local` and backend is running |

---

## Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | Yes | Your Supabase project URL |
| `SUPABASE_PUBLISHABLE_KEY` | Yes* | New publishable key (`sb_publishable_xxx`) — replaces `anon` |
| `SUPABASE_SECRET_KEY` | Yes* | New secret key (`sb_secret_xxx`) — replaces `service_role` |
| `SUPABASE_ANON_KEY` | No | Legacy anon key (fallback if publishable not set) |
| `SUPABASE_SERVICE_KEY` | No | Legacy service_role key (fallback if secret not set) |
| `JWT_SECRET` | Yes | Supabase JWT secret (for verifying user access tokens) |
| `RESEND_API_KEY` | No | For email (leave empty to skip) |
| `DEBUG` | No | Show Swagger docs (default: false) |
| `FRONTEND_URL` | No | OAuth redirect URL (default: localhost:3000) |

> *Or use legacy keys — the config supports both. New projects should use `sb_publishable_*` / `sb_secret_*`.

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | Publishable key (`sb_publishable_xxx`) |
| `NEXT_PUBLIC_API_URL` | Yes | Backend API URL (default: http://localhost:8000) |
