-- ============================================================
-- Risk-Flux Database Schema — Supabase PostgreSQL
-- Run this in the Supabase SQL Editor
-- ============================================================

-- ── Profiles (extends Supabase auth.users) ─────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id            UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username      TEXT        UNIQUE NOT NULL,
  display_name  TEXT,
  email         TEXT        NOT NULL,
  avatar_url    TEXT,
  bio           TEXT,
  role          TEXT        NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Categories ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id    SERIAL      PRIMARY KEY,
  name  TEXT        NOT NULL,
  slug  TEXT        UNIQUE NOT NULL,
  icon  TEXT
);

INSERT INTO categories (name, slug, icon) VALUES
  ('Domain',     'domain',     '📊'),
  ('Technology', 'technology', '💻'),
  ('Blog',       'blog',       '✍️')
ON CONFLICT (slug) DO NOTHING;

-- ── Subcategories ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subcategories (
  id          SERIAL PRIMARY KEY,
  category_id INT    REFERENCES categories(id) ON DELETE CASCADE,
  name        TEXT   NOT NULL,
  slug        TEXT   UNIQUE NOT NULL,
  description TEXT
);

-- Domain subcategories
INSERT INTO subcategories (category_id, name, slug, description) VALUES
  (1, 'PnL & Mark-to-Market',    'pnl',          'Profit & Loss calculation and mark-to-market valuation'),
  (1, 'Market Prices',           'prices',        'Spot, forward, futures price analysis'),
  (1, 'Time Series Analysis',    'time-series',   'Statistical analysis of price and risk time series'),
  (1, 'Value at Risk',           'var',           'VaR models, backtesting, and stress testing'),
  (1, 'Greeks & Sensitivities',  'greeks',        'Delta, gamma, vega, theta in energy options'),
  (1, 'Volatility',              'volatility',    'Vol surfaces, implied vol, and SABR models'),
  (1, 'Curve Building',          'curve-building','Forward curve construction methods'),
  (1, 'Hedging Strategies',      'hedging',       'Risk mitigation and hedging in energy markets'),
  (1, 'Settlement & Clearing',   'settlement',    'Post-trade processing and clearing')
ON CONFLICT (slug) DO NOTHING;

-- Technology subcategories
INSERT INTO subcategories (category_id, name, slug, description) VALUES
  (2, 'Python',           'python',          'Python for quant finance and data engineering'),
  (2, 'FastAPI',          'fastapi',         'Building high-performance APIs with FastAPI'),
  (2, 'Data Engineering', 'data-engineering','Pipelines, ETL, and data platform tooling'),
  (2, 'Machine Learning', 'machine-learning','ML/AI applied to trading and risk'),
  (2, 'Databases & SQL',  'databases',       'PostgreSQL, time-series DBs, and query optimisation'),
  (2, 'DevOps',           'devops',          'CI/CD, Docker, and cloud infrastructure')
ON CONFLICT (slug) DO NOTHING;

-- ── Posts ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS posts (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT        NOT NULL,
  slug            TEXT        UNIQUE NOT NULL,
  excerpt         TEXT,
  content         TEXT        NOT NULL DEFAULT '',
  cover_image_url TEXT,
  author_id       UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  category_id     INT         REFERENCES categories(id),
  subcategory_id  INT         REFERENCES subcategories(id),
  type            TEXT        NOT NULL DEFAULT 'blog' CHECK (type IN ('blog', 'doc')),
  status          TEXT        NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  version         TEXT        NOT NULL DEFAULT '1.0',
  reading_time    INT         DEFAULT 1,
  likes_count     INT         NOT NULL DEFAULT 0,
  views_count     INT         NOT NULL DEFAULT 0,
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Doc Version History ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS doc_versions (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID        REFERENCES posts(id) ON DELETE CASCADE,
  version    TEXT        NOT NULL,
  content    TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Tags ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tags (
  id   SERIAL PRIMARY KEY,
  name TEXT   UNIQUE NOT NULL,
  slug TEXT   UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS post_tags (
  post_id UUID REFERENCES posts(id)  ON DELETE CASCADE,
  tag_id  INT  REFERENCES tags(id)   ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Seed common tags
INSERT INTO tags (name, slug) VALUES
  ('VaR', 'var'), ('PnL', 'pnl'), ('Python', 'python'),
  ('FastAPI', 'fastapi'), ('Risk Management', 'risk-management'),
  ('Energy Trading', 'energy-trading'), ('Time Series', 'time-series'),
  ('Machine Learning', 'machine-learning'), ('Volatility', 'volatility'),
  ('Hedging', 'hedging'), ('PostgreSQL', 'postgresql'), ('DevOps', 'devops')
ON CONFLICT (slug) DO NOTHING;

-- ── Comments ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comments (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID        REFERENCES posts(id)     ON DELETE CASCADE,
  user_id    UUID        REFERENCES profiles(id)  ON DELETE CASCADE,
  parent_id  UUID        REFERENCES comments(id)  ON DELETE CASCADE,
  content    TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Likes ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS likes (
  post_id    UUID        REFERENCES posts(id)    ON DELETE CASCADE,
  user_id    UUID        REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (post_id, user_id)
);

-- ── Row Level Security ──────────────────────────────────────
ALTER TABLE profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes       ENABLE ROW LEVEL SECURITY;

-- Profiles: public read, owner write
CREATE POLICY "Public read profiles"   ON profiles FOR SELECT USING (true);
CREATE POLICY "Owner update profile"   ON profiles FOR UPDATE USING (auth.uid() = id);

-- Posts: public read published, admin write
CREATE POLICY "Public read posts"      ON posts FOR SELECT USING (status = 'published');
CREATE POLICY "Admin manage posts"     ON posts FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Comments: public read, auth insert, owner delete
CREATE POLICY "Public read comments"   ON comments FOR SELECT USING (true);
CREATE POLICY "Auth insert comment"    ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner delete comment"   ON comments FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Owner update comment"   ON comments FOR UPDATE USING (auth.uid() = user_id);

-- Likes: auth only
CREATE POLICY "Auth manage likes"      ON likes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public read likes"      ON likes FOR SELECT USING (true);

-- ── Indexes ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_posts_slug       ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_category   ON posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_status     ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_type       ON posts(type);
CREATE INDEX IF NOT EXISTS idx_comments_post    ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent  ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_likes_post       ON likes(post_id);
