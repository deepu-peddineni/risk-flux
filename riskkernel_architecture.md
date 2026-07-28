# Risk-Flux — Full Architecture Document

> **Risk & Technology Knowledge Hub for Energy Trading Professionals**
> Domain: `risk-flux.is-a.dev` (free via is-a.dev)

---

## 🧭 Overview

Risk-flux is a full-stack knowledge platform combining structured documentation, a chronological blog, and community comments — covering **Energy Trading Risk Management** (Domain) and **Programming/Technology** (Technology), written by a sole author with registered-user engagement.

---

## 🗺️ Tech Stack (100% Free Tier)

| Layer | Technology | Hosting | Free Tier |
|---|---|---|---|
| **Frontend** | Next.js 14 (App Router) | Vercel | 100GB bandwidth/mo |
| **Backend** | FastAPI (Python 3.11+) | Render | 750 hrs/mo |
| **Database** | PostgreSQL via Supabase | Supabase | 500MB DB + 1GB storage |
| **Auth** | Supabase Auth | Supabase | Unlimited users |
| **Email** | Resend | Resend | 3,000 emails/mo |
| **Search** | Supabase (PostgreSQL ilike) | Supabase | Included in free tier |
| **Image Storage** | Supabase Storage | Supabase | 1GB |
| **Domain** | risk-flux.is-a.dev | is-a.dev | Free forever |
| **Font** | Geist (same as uv website) | Google Fonts / Vercel | Free |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                             │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│               VERCEL — Next.js 14 Frontend                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────────┐  │
│  │  /domain │ │  /tech   │ │  /blog   │ │  /admin (editor)  │  │
│  └──────────┘ └──────────┘ └──────────┘ └───────────────────┘  │
│  SSR + SSG for docs/blog, CSR for admin/user pages              │
└──────────────────────────┬──────────────────────────────────────┘
                           │ REST API
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│               RENDER — FastAPI Backend                           │
│  Auth Middleware → Route Handlers → Business Logic              │
│  /api/v1/posts  /api/v1/comments  /api/v1/docs  /api/v1/users  │
└──────┬──────────────────────────────────────────────────────────┘
       │ PostgreSQL
┌─────────────────────┐                 ┌─────────────────────────┐
│  SUPABASE           │
│  ─ PostgreSQL DB    │
│  ─ Auth (OAuth)     │
│  ─ Storage (images) │
│  ─ Full-text search  │
│  ─ Email (Resend)   │
└─────────────────────┘
```

---

## 📂 Content Structure

```
Risk-flux
├── Domain (Energy Trading)
│   ├── PnL & Mark-to-Market
│   ├── Market Prices (Spot, Forward, Futures)
│   ├── Time Series Analysis
│   ├── Value at Risk (VaR)
│   ├── Greeks & Sensitivities
│   ├── Volatility & Vol Surfaces
│   ├── Curve Building
│   ├── Hedging Strategies
│   └── Settlement & Clearing
│
├── Technology
│   ├── Python
│   ├── FastAPI
│   ├── Data Engineering
│   ├── Machine Learning / AI
│   ├── Databases & SQL
│   └── DevOps & Infrastructure
│
└── Blog (Mixed — chronological)
    └── Any topic spanning Domain + Technology
```

Each **Domain** and **Technology** section has:
- 📄 **Docs** — versioned living documents (MDX, versioned automatically on publish)
- 📝 **Posts** — linked blog posts in that subcategory

---

## 🗃️ Database Schema

```sql
-- Users (managed by Supabase Auth + extended profile)
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id),
  username    TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url  TEXT,
  bio         TEXT,
  role        TEXT DEFAULT 'user',  -- 'admin' | 'user'
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Content Categories (Domain, Technology, Blog)
CREATE TABLE categories (
  id    SERIAL PRIMARY KEY,
  name  TEXT NOT NULL,
  slug  TEXT UNIQUE NOT NULL,
  icon  TEXT
);

-- Subcategories (PnL, VaR, Python, FastAPI...)
CREATE TABLE subcategories (
  id          SERIAL PRIMARY KEY,
  category_id INT REFERENCES categories(id),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  description TEXT
);

-- Posts (Blog posts + Doc pages)
CREATE TABLE posts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  excerpt         TEXT,
  content         TEXT NOT NULL,       -- MDX content
  cover_image_url TEXT,
  author_id       UUID REFERENCES profiles(id),
  category_id     INT REFERENCES categories(id),
  subcategory_id  INT REFERENCES subcategories(id),
  type            TEXT DEFAULT 'blog', -- 'blog' | 'doc'
  status          TEXT DEFAULT 'draft',-- 'draft' | 'published'
  version         TEXT DEFAULT '1.0',
  reading_time    INT,                 -- minutes
  likes_count     INT DEFAULT 0,
  views_count     INT DEFAULT 0,
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Doc Version History (auto-snapshot on publish)
CREATE TABLE doc_versions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID REFERENCES posts(id),
  version    TEXT NOT NULL,
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tags (cross-domain)
CREATE TABLE tags (
  id   SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL
);

CREATE TABLE post_tags (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  tag_id  INT  REFERENCES tags(id)  ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Comments (nested via parent_id)
CREATE TABLE comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES profiles(id),
  parent_id  UUID REFERENCES comments(id), -- NULL = top-level
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Likes
CREATE TABLE likes (
  post_id    UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (post_id, user_id)
);
```

---

## 🔌 FastAPI — API Design

```
/api/v1/
├── auth/
│   ├── POST   /signup           # Email + password signup
│   ├── POST   /login            # Email + password login
│   ├── POST   /logout
│   ├── POST   /refresh-token
│   └── GET    /google/callback  # Google OAuth callback
│
├── posts/
│   ├── GET    /                 # List posts (filter: category, tag, search)
│   ├── GET    /{slug}           # Get single post (increments view count)
│   ├── POST   /                 # [admin] Create post
│   ├── PUT    /{id}             # [admin] Update post (snapshots doc version)
│   └── DELETE /{id}             # [admin] Delete post
│
├── docs/
│   ├── GET    /{category}/{subcategory}           # Latest doc version
│   └── GET    /{category}/{subcategory}/versions  # All versions
│
├── comments/
│   ├── GET    /post/{post_id}   # Get comments (nested tree)
│   ├── POST   /post/{post_id}   # Add comment [registered user]
│   ├── PUT    /{comment_id}     # Edit own comment
│   └── DELETE /{comment_id}     # Delete own comment / [admin] any
│
├── likes/
│   ├── POST   /post/{post_id}   # Like a post
│   └── DELETE /post/{post_id}   # Unlike a post
│
├── users/
│   ├── GET    /me               # My profile
│   ├── PUT    /me               # Update my profile
│   └── GET    /{username}       # Public profile
│
├── search/
│   └── GET    /?q={query}       # Full-text search via Supabase ilike
│
├── tags/
│   └── GET    /                 # All tags
│
└── upload/
    └── POST   /image            # [admin] Upload image → Supabase Storage
```

---

## 🖥️ Frontend — Next.js Structure

```
src/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                    # Home page
│   │   ├── blog/
│   │   │   ├── page.tsx                # Blog listing
│   │   │   └── [slug]/page.tsx         # Blog post
│   │   ├── domain/
│   │   │   ├── page.tsx                # Domain landing
│   │   │   ├── [subcategory]/
│   │   │   │   ├── page.tsx            # Docs for subcategory
│   │   │   │   └── [slug]/page.tsx     # Individual doc/post
│   │   ├── technology/
│   │   │   └── (same as domain)
│   │   ├── search/page.tsx             # Search results
│   │   └── tags/[tag]/page.tsx         # Posts by tag
│   │
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── verify-email/page.tsx
│   │
│   ├── profile/
│   │   └── page.tsx                    # User profile
│   │
│   └── admin/
│       ├── page.tsx                    # Dashboard
│       ├── posts/
│       │   ├── page.tsx               # Manage posts
│       │   ├── new/page.tsx           # New post editor
│       │   └── [id]/edit/page.tsx     # Edit post
│       └── docs/
│           └── (same structure)
│
├── components/
│   ├── layout/  (Navbar, Footer, Sidebar)
│   ├── blog/    (PostCard, PostList, PostHeader)
│   ├── docs/    (DocNav, DocContent, VersionBadge)
│   ├── comments/(CommentTree, CommentForm, CommentItem)
│   ├── editor/  (MDXEditor, ImageUpload, TagInput)
│   ├── search/  (SearchBar, SearchResults)
│   └── ui/      (Button, Card, Badge, ThemeToggle)
│
└── lib/
    ├── supabase.ts     # Supabase client
    ├── api.ts          # FastAPI client
    ├── search.ts        # Search API client
    └── mdx.ts          # MDX rendering (Shiki + KaTeX)
```

---

## 🎨 Design System

| Token | Value |
|---|---|
| **Font** | Geist (same as uv.astral.sh) |
| **Code Font** | Geist Mono |
| **Theme** | Dark / Light toggle |
| **Accent** | `#6366F1` (Indigo-500) |
| **Style** | Minimal, clean, monospace-heavy (like uv) |
| **Animations** | Subtle fade-ins, hover lifts |
| **Math** | KaTeX (VaR formulas) |
| **Code Highlight** | Shiki (multi-language) |
| **MD Rendering** | next-mdx-remote |

---

## 🔐 Auth Flow

```
SIGNUP (Email/Password)
  1. User submits email + password
  2. Supabase creates user → sends confirmation email (via Resend)
  3. User clicks link → email verified
  4. FastAPI creates profile row in `profiles` table
  5. User redirected to profile setup

SIGNUP (Google OAuth)
  1. User clicks "Continue with Google"
  2. Supabase Google OAuth → redirects to /auth/callback
  3. FastAPI upserts profile row
  4. User redirected to home

LOGIN
  1. Supabase validates credentials → returns JWT
  2. JWT stored in httpOnly cookie
  3. FastAPI validates JWT on every protected request
```

---

## 📦 Docs Versioning Strategy

**Automatic on publish** (Option C):

```
Edit doc → Click "Publish" (Admin)
    ↓
FastAPI saves new content to `posts` table
    ↓
Auto-snapshot previous content to `doc_versions` table
    ↓
Version number increments (v1.0 → v1.1 → v2.0)
    ↓
Users always see latest version
Admin can view/restore any previous version
```

---

## 🔍 Search — Supabase Full-Text Search

- **Approach**: Supabase `ilike` queries across `title`, `excerpt`, and `content` fields
- **Endpoint**: `GET /api/v1/search/?q={query}&page={page}`
- **Frontend**: `/search` page with SearchBar component, debounced input, URL query params (`?q=...`)
- **No external service required** — all search runs against PostgreSQL via Supabase

---

## 🚀 Deployment Pipeline

```
GitHub Repository
├── /frontend   → Vercel (auto-deploy on push to main)
└── /backend    → Render (auto-deploy on push to main)
```

### Environment Variables
```bash
# Frontend (.env.local)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=              # sb_publishable_xxx
NEXT_PUBLIC_API_URL=https://risk-flux-api.onrender.com

# Backend (.env)
SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=              # sb_publishable_xxx
SUPABASE_SECRET_KEY=                   # sb_secret_xxx
RESEND_API_KEY=
JWT_SECRET=                            # for verifying user access tokens
```

---

## ⚠️ Free Tier Limitations & Mitigations

| Issue | Mitigation |
|---|---|
| Render spins down after 15min inactivity (cold start ~30s) | Use UptimeRobot (free) to ping every 10 min |
| Supabase pauses after 1 week inactivity (free) | Keep project active; upgrade to $25/mo when ready |
| Search: Supabase ilike (no external service) | Sufficient for early traffic; add tsvector index for scale |
| is-a.dev domain: less professional | Acceptable for launch; migrate to paid domain later |

---

## 🗓️ Build Phases

### Phase 1 — Foundation (Week 1-2)
- [ ] Next.js project setup with design system (Geist font, dark/light)
- [ ] FastAPI project structure with Supabase connection
- [ ] Auth: signup, login, Google OAuth, email confirmation
- [ ] Database schema + migrations

### Phase 2 — Content (Week 3-4)
- [ ] Blog post CRUD (admin editor + GitHub MDX)
- [ ] Domain/Technology docs with versioning
- [ ] Subcategory navigation + sidebar
- [ ] MDX rendering (Shiki + KaTeX)

### Phase 3 — Engagement (Week 5-6)
- [ ] Nested comments system
- [ ] Likes/upvotes
- [ ] User profile page
- [x] Search integration (Supabase ilike — no external service)

### Phase 4 — Polish & Deploy (Week 7-8)
- [ ] Seed placeholder content (lorem-ipsum for dev)
- [ ] SEO (meta tags, sitemap, OG images)
- [ ] Performance optimization
- [ ] Deploy: Vercel + Render + is-a.dev domain

---

## 📁 Repository Structure

```
risk-flux/
├── frontend/          # Next.js 14
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/           # FastAPI
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   ├── migrations/
│   └── requirements.txt
├── .github/
│   └── workflows/     # CI/CD
└── README.md
```
