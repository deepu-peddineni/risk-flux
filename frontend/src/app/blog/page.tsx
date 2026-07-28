import Link from "next/link";
import { Clock, Heart, Eye, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import PostCard from "@/components/PostCard";

export const metadata: Metadata = {
  title: "Blog",
  description: "Latest articles on energy trading risk management and technology from Risk-Flux.",
};

// Placeholder posts for UI demonstration
const DEMO_POSTS = [
  {
    id: "1", slug: "understanding-var-in-energy-markets", title: "Understanding Value at Risk in Energy Markets",
    excerpt: "A comprehensive guide to VaR models — historical simulation, variance-covariance, and Monte Carlo — applied to power and gas portfolios.",
    category: "Domain", subcategory: "Value at Risk", tags: ["VaR", "Risk Management", "Energy Trading"],
    reading_time: 12, likes_count: 47, views_count: 1240, published_at: "2026-07-20",
  },
  {
    id: "2", slug: "building-fastapi-backend-trading-desk", title: "Building a FastAPI Backend for a Trading Desk",
    excerpt: "Step-by-step guide to designing a high-performance REST API with FastAPI, Supabase, and JWT auth for real-time trading applications.",
    category: "Technology", subcategory: "FastAPI", tags: ["FastAPI", "Python", "API"],
    reading_time: 8, likes_count: 31, views_count: 890, published_at: "2026-07-15",
  },
  {
    id: "3", slug: "pnl-attribution-energy-trading", title: "PnL Attribution in Energy Trading Explained",
    excerpt: "How to decompose daily P&L into its market risk drivers — price, volume, curve, and theta effects — with worked examples in Python.",
    category: "Domain", subcategory: "PnL & MtM", tags: ["PnL", "Risk Management", "Python"],
    reading_time: 15, likes_count: 62, views_count: 2100, published_at: "2026-07-10",
  },
  {
    id: "4", slug: "time-series-analysis-power-prices", title: "Time Series Analysis of Power Prices with Python",
    excerpt: "Using statsmodels and pandas to model seasonality, mean-reversion, and spike dynamics in electricity spot prices.",
    category: "Domain", subcategory: "Time Series", tags: ["Time Series", "Python", "Energy Trading"],
    reading_time: 10, likes_count: 28, views_count: 760, published_at: "2026-07-05",
  },
  {
    id: "5", slug: "postgres-timeseries-trading-data", title: "PostgreSQL for Time-Series Trading Data",
    excerpt: "Best practices for storing, querying, and partitioning high-frequency trading data in PostgreSQL — including TimescaleDB extensions.",
    category: "Technology", subcategory: "Databases", tags: ["PostgreSQL", "Databases", "DevOps"],
    reading_time: 7, likes_count: 19, views_count: 540, published_at: "2026-06-28",
  },
  {
    id: "6", slug: "volatility-surface-construction-energy", title: "Volatility Surface Construction in Energy Markets",
    excerpt: "Building implied volatility surfaces for gas and power options using SABR, SVI, and interpolation techniques — with Python code.",
    category: "Domain", subcategory: "Volatility", tags: ["Volatility", "Options", "Python"],
    reading_time: 18, likes_count: 54, views_count: 1680, published_at: "2026-06-20",
  },
];

export default function BlogPage() {
  return (
    <div style={{ padding: "3rem 0" }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: "3rem" }}>
          <div className="section-label" style={{ marginBottom: "0.5rem" }}>Blog</div>
          <h1 style={{ marginBottom: "0.5rem" }}>Articles</h1>
          <p style={{ color: "var(--text-muted)" }}>
            Posts on risk management, technology, AI, and practical hacks.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "3rem", alignItems: "start" }}>
          {/* Posts grid */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {DEMO_POSTS.map((post) => <PostCard key={post.id} post={post} />)}
          </div>

          {/* Sidebar */}
          <aside style={{ position: "sticky", top: "80px", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Categories */}
            <div className="card" style={{ padding: "1.25rem" }}>
              <h3 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>Browse by Category</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {["Domain", "Technology", "AI"].map((cat) => (
                  <Link key={cat} href={`/${cat.toLowerCase()}`} className="btn btn-ghost btn-sm" style={{ justifyContent: "flex-start" }}>
                    {cat}
                  </Link>
                ))}
              </div>
            </div>

            {/* Popular tags */}
            <div className="card" style={{ padding: "1.25rem" }}>
              <h3 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>Popular Tags</h3>
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                {["VaR", "PnL", "Python", "FastAPI", "Volatility", "Time Series", "Hedging", "PostgreSQL"].map((tag) => (
                  <Link key={tag} href={`/tags/${tag.toLowerCase().replace(/\s+/g, "-")}`} className="badge" style={{ textDecoration: "none", cursor: "pointer" }}>
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
