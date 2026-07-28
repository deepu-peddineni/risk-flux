import { Clock, Heart, Eye, Tag, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import LikeButton from "@/components/LikeButton";
import CommentSection from "@/components/CommentSection";

export async function generateStaticParams() {
  return Object.keys(POSTS).map((slug) => ({ slug }));
}

const POSTS: Record<string, { title: string; excerpt: string; category: string; subcategory: string; tags: string[]; reading_time: number; content: React.ReactNode }> = {
  "understanding-var-in-energy-markets": {
    title: "Understanding Value at Risk in Energy Markets",
    excerpt: "A comprehensive guide to VaR models — historical simulation, variance-covariance, and Monte Carlo — applied to power and gas portfolios.",
    category: "Domain", subcategory: "Market Risk",
    tags: ["VaR", "Risk Management", "Energy Trading", "Python"],
    reading_time: 12,
    content: (
      <>
        <p><strong>Value at Risk (VaR)</strong> is one of the most widely used risk metrics in energy trading. It quantifies the maximum potential loss on a portfolio over a given time horizon at a given confidence level.</p>
        <h2>What is VaR?</h2>
        <p>Formally, the VaR at confidence level α (e.g. 99%) over horizon T is defined as:</p>
        <div style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "1rem 1.5rem", margin: "1.5rem 0", fontFamily: "var(--font-mono)", fontSize: "0.9rem", color: "var(--text-muted)", textAlign: "center" }}>P(Loss &gt; VaR) = 1 − α</div>
        <h2>Three Main Approaches</h2>
        <h3>1. Historical Simulation</h3>
        <p>Historical simulation uses actual historical returns to estimate the loss distribution. No distributional assumptions are required, making it robust to fat tails common in energy markets.</p>
        <pre><code>{`import numpy as np\n\ndef historical_var(returns: np.ndarray, confidence: float = 0.99) -> float:\n    """Historical simulation VaR."""\n    return np.percentile(returns, (1 - confidence) * 100)`}</code></pre>
        <h3>2. Variance-Covariance (Parametric)</h3>
        <p>Assumes returns are normally distributed. Fast to compute, but underestimates tail risk in energy markets due to skewness and kurtosis.</p>
        <h3>3. Monte Carlo Simulation</h3>
        <p>Simulates thousands of price paths using a stochastic model (e.g. mean-reverting Ornstein-Uhlenbeck for power prices) and computes the portfolio loss distribution.</p>
        <h2>Energy Market Specifics</h2>
        <p>Energy markets exhibit unique characteristics that make standard VaR models challenging:</p>
        <ul><li><strong>Price spikes</strong> — especially in power markets due to grid constraints</li><li><strong>Seasonality</strong> — heating demand, summer cooling, hydro availability</li><li><strong>Mean reversion</strong> — commodity prices tend to revert to marginal cost</li><li><strong>Non-linear payoffs</strong> — options, tolling agreements, virtual power plants</li></ul>
        <blockquote>A VaR model that ignores energy market seasonality will systematically underestimate risk during peak demand periods.</blockquote>
      </>
    ),
  },
};

const FALLBACK_POST = {
  title: "Blog Post",
  excerpt: "",
  category: "Blog", subcategory: "",
  tags: [] as string[],
  reading_time: 5,
  content: <p style={{ color: "var(--text-muted)" }}>This post is being written. Check back soon.</p>,
};

const ALL_POSTS_META: Record<string, { published_at: string; author: { username: string; display_name: string }; likes_count: number; views_count: number }> = {
  "understanding-var-in-energy-markets": {
    published_at: "July 20, 2026",
    author: { username: "riskflux", display_name: "Risk-Flux" },
    likes_count: 47,
    views_count: 1240,
  },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = POSTS[slug];
  return { title: post?.title ?? "Blog Post", description: post?.excerpt ?? "" };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = POSTS[slug] || FALLBACK_POST;
  const meta = ALL_POSTS_META[slug] || { published_at: "TBD", author: { username: "riskflux", display_name: "Risk-Flux" }, likes_count: 0, views_count: 0 };
  return (
    <div style={{ padding: "3rem 0" }}>
      <div className="container">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: "4rem", alignItems: "start" }}>
          {/* Main content */}
          <article>
            {/* Back */}
            <Link href="/blog" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.875rem", color: "var(--text-muted)", textDecoration: "none", marginBottom: "2rem", transition: "color 0.15s" }}
              className="hover-text"
            >
              <ArrowLeft size={14} /> Back to blog
            </Link>

            {/* Tags */}
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
              <span className="badge badge-accent">{post.category}</span>
              {post.subcategory && <span className="badge">{post.subcategory}</span>}
              {post.tags.map((t) => <span key={t} className="badge">#{t}</span>)}
            </div>

            {/* Title */}
            <h1 style={{ marginBottom: "1rem", lineHeight: 1.2 }}>{post.title}</h1>

            {/* Meta row */}
            <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap", marginBottom: "2rem", paddingBottom: "1.5rem", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>By <strong>{meta.author.display_name}</strong></span>
              <span style={{ fontSize: "0.8125rem", color: "var(--text-subtle)" }}>{meta.published_at}</span>
              <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8125rem", color: "var(--text-subtle)" }}><Clock size={13} /> {post.reading_time} min read</span>
              <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8125rem", color: "var(--text-subtle)" }}><Eye size={13} /> {meta.views_count} views</span>
              <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8125rem", color: "var(--text-subtle)" }}><Heart size={13} /> {meta.likes_count}</span>
            </div>

            {/* Article body */}
            <div className="prose" style={{ maxWidth: "none" }}>
              {post.content}
            </div>

            {/* Like button */}
            <div style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid var(--border)" }}>
              <LikeButton postSlug={slug} initialLikes={meta.likes_count} />
            </div>

            {/* Comments section */}
            <CommentSection postId={slug} />
          </article>

          {/* Sidebar — Table of contents */}
          <aside style={{ position: "sticky", top: "80px" }}>
            <div className="card" style={{ padding: "1.25rem" }}>
              <h3 style={{ fontSize: "0.8125rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: "1rem" }}>Table of Contents</h3>
              <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {["What is VaR?", "Three Main Approaches", "Historical Simulation", "Variance-Covariance", "Monte Carlo", "Energy Market Specifics"].map((item) => (
                  <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                    style={{ fontSize: "0.8125rem", color: "var(--text-muted)", textDecoration: "none", paddingLeft: item.startsWith("  ") ? "1rem" : 0, transition: "color 0.15s" }}
                    className="hover-accent"
                  >
                    {item}
                  </a>
                ))}
              </nav>
            </div>

            {/* Tags sidebar */}
            <div className="card" style={{ padding: "1.25rem", marginTop: "1rem" }}>
              <h3 style={{ fontSize: "0.8125rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: "1rem" }}>
                <Tag size={13} style={{ marginRight: "0.3rem" }} />Tags
              </h3>
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                {post.tags.map((t) => <span key={t} className="badge" style={{ cursor: "pointer" }}>#{t}</span>)}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
