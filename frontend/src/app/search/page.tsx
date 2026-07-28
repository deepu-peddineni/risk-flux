"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useReducer, Suspense, useRef } from "react";
import Link from "next/link";
import { Clock, Heart, Eye, ArrowRight, Search, Loader2 } from "lucide-react";
import SearchBar from "@/components/search/SearchBar";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface SearchHit {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  type: string;
  reading_time: number | null;
  likes_count: number;
  views_count: number;
  published_at: string | null;
  categories: { name: string; slug: string } | null;
  subcategories: { name: string; slug: string } | null;
  profiles: { username: string; display_name: string; avatar_url: string } | null;
}

interface SearchResponse {
  hits: SearchHit[];
  nbHits: number;
  page: number;
  hitsPerPage: number;
  nbPages: number;
}

const DEMO_POSTS = [
  { id: "1", slug: "understanding-var-in-energy-markets", title: "Understanding Value at Risk in Energy Markets", excerpt: "A comprehensive guide to VaR models — historical simulation, variance-covariance, and Monte Carlo.", category: "Domain", subcategory: "Market Risk", reading_time: 12, likes_count: 47, views_count: 1240, published_at: "2026-07-20" },
  { id: "2", slug: "building-fastapi-backend-trading-desk", title: "Building a FastAPI Backend for a Trading Desk", excerpt: "Step-by-step guide to designing a high-performance REST API with FastAPI, Supabase, and JWT auth.", category: "Technology", subcategory: "Python", reading_time: 8, likes_count: 31, views_count: 890, published_at: "2026-07-15" },
  { id: "3", slug: "pnl-attribution-energy-trading", title: "PnL Attribution in Energy Trading Explained", excerpt: "How to decompose daily P&L into its market risk drivers with worked examples in Python.", category: "Domain", subcategory: "Market Risk", reading_time: 15, likes_count: 62, views_count: 2100, published_at: "2026-07-10" },
  { id: "4", slug: "time-series-analysis-power-prices", title: "Time Series Analysis of Power Prices with Python", excerpt: "Using statsmodels and pandas to model seasonality and mean-reversion in electricity spot prices.", category: "Domain", subcategory: "Market Data", reading_time: 10, likes_count: 28, views_count: 760, published_at: "2026-07-05" },
  { id: "5", slug: "postgres-timeseries-trading-data", title: "PostgreSQL for Time-Series Trading Data", excerpt: "Best practices for storing, querying, and partitioning high-frequency trading data.", category: "Technology", subcategory: "Databricks on AWS", reading_time: 7, likes_count: 19, views_count: 540, published_at: "2026-06-28" },
  { id: "6", slug: "volatility-surface-construction-energy", title: "Volatility Surface Construction in Energy Markets", excerpt: "Building implied volatility surfaces using SABR, SVI, and interpolation techniques with Python.", category: "Domain", subcategory: "Calculations", reading_time: 18, likes_count: 54, views_count: 1680, published_at: "2026-06-20" },
  { id: "7", slug: "fx-risk-commodity-trading", title: "FX Risk in Commodity Trading", excerpt: "Managing currency exposure in international energy portfolios.", category: "Domain", subcategory: "FX Risk", reading_time: 9, likes_count: 15, views_count: 420, published_at: "2026-06-15" },
  { id: "8", slug: "databricks-energy-analytics", title: "Databricks for Energy Trading Analytics", excerpt: "Large-scale market data processing with Spark and Delta Lake on AWS.", category: "Technology", subcategory: "Databricks on AWS", reading_time: 11, likes_count: 23, views_count: 680, published_at: "2026-07-05" },
  { id: "9", slug: "prompt-engineering-financial-analysis", title: "Prompt Engineering for Financial Analysis", excerpt: "Crafting effective prompts for LLMs to analyze market data and risk reports.", category: "AI", subcategory: "Skills", reading_time: 6, likes_count: 34, views_count: 890, published_at: "2026-07-18" },
  { id: "10", slug: "building-rag-pipelines-trading-docs", title: "Building RAG Pipelines for Trading Docs", excerpt: "Retrieval-augmented generation over research papers, trade blotters, and risk manuals.", category: "AI", subcategory: "Skills", reading_time: 10, likes_count: 27, views_count: 650, published_at: "2026-07-12" },
];

const CATEGORY_COLORS: Record<string, string> = {
  Domain: "var(--accent)",
  Technology: "#10b981",
  AI: "#a855f7",
};

type State = { data: SearchResponse | null; loading: boolean; error: string | null };

type Action =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: SearchResponse }
  | { type: "FETCH_ERROR"; msg: string }
  | { type: "RESET" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return { data: action.payload, loading: false, error: null };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.msg };
    case "RESET":
      return { data: null, loading: false, error: null };
  }
}

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") ?? "";
  const pageParam = parseInt(searchParams.get("page") ?? "0", 10);

  const [state, dispatch] = useReducer(reducer, { data: null, loading: false, error: null });
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      dispatch({ type: "RESET" });
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    dispatch({ type: "FETCH_START" });

    const q = query.toLowerCase();
    const localHits = DEMO_POSTS
      .filter((p) =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.subcategory.toLowerCase().includes(q)
      )
      .slice(pageParam * 10, (pageParam + 1) * 10);

    const localResponse: SearchResponse = {
      hits: localHits.map((p) => ({
        id: p.id, title: p.title, slug: p.slug, excerpt: p.excerpt,
        type: "post", reading_time: p.reading_time, likes_count: p.likes_count,
        views_count: p.views_count, published_at: p.published_at,
        categories: { name: p.category, slug: p.category.toLowerCase() },
        subcategories: { name: p.subcategory, slug: p.subcategory.toLowerCase().replace(/\s+/g, "-") },
        profiles: null,
      })),
      nbHits: DEMO_POSTS.filter((p) =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.subcategory.toLowerCase().includes(q)
      ).length,
      page: pageParam,
      hitsPerPage: 10,
      nbPages: Math.ceil(DEMO_POSTS.filter((p) =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.subcategory.toLowerCase().includes(q)
      ).length / 10),
    };

    // Try backend first, fall back to local
    fetch(`${API_URL}/api/v1/search/?q=${encodeURIComponent(query)}&page=${pageParam}`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Search failed");
        return res.json();
      })
      .then((json: SearchResponse) => {
        if (!controller.signal.aborted) {
          if (json.hits && json.hits.length > 0) {
            dispatch({ type: "FETCH_SUCCESS", payload: json });
          } else {
            dispatch({ type: "FETCH_SUCCESS", payload: localResponse });
          }
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError" && !controller.signal.aborted) {
          dispatch({ type: "FETCH_SUCCESS", payload: localResponse });
        }
      });

    return () => controller.abort();
  }, [query, pageParam]);

  const goToPage = (p: number) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (p > 0) params.set("page", String(p));
    router.push(`/search?${params}`);
  };

  return (
    <div style={{ padding: "3rem 0" }}>
      <div className="container" style={{ maxWidth: 800, margin: "0 auto" }}>
        <div style={{ marginBottom: "2rem" }}>
          <div className="section-label" style={{ marginBottom: "0.5rem" }}>Search</div>
          <h1 style={{ marginBottom: "0.5rem" }}>Search</h1>
          <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
            Find articles across Domain, Technology, and AI topics.
          </p>
          <SearchBar />
        </div>

        {state.loading && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "4rem 0", color: "var(--text-muted)", gap: "0.5rem" }}>
            <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
            Searching...
          </div>
        )}

        {state.error && (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--error)" }}>
            {state.error}
          </div>
        )}

        {!state.loading && !state.error && query && state.data && state.data.hits.length === 0 && (
          <div style={{ padding: "4rem 0", textAlign: "center" }}>
            <Search size={40} style={{ color: "var(--text-subtle)", marginBottom: "1rem" }} />
            <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>No results found</h2>
            <p style={{ color: "var(--text-muted)" }}>
              Try a different search term or browse the{" "}
              <Link href="/blog" style={{ color: "var(--accent)" }}>blog</Link>.
            </p>
          </div>
        )}

        {!state.loading && !state.error && state.data && state.data.hits.length > 0 && (
          <>
            <p style={{ fontSize: "0.8125rem", color: "var(--text-subtle)", marginBottom: "1.5rem" }}>
              {state.data.nbHits} result{state.data.nbHits !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {state.data.hits.map((hit) => (
                <article key={hit.id} className="card" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                    {hit.categories && (
                      <span
                        className="badge"
                        style={{ color: CATEGORY_COLORS[hit.categories.name] || "var(--accent)", borderColor: "transparent", background: "var(--bg-subtle)" }}
                      >
                        {hit.categories.name}
                      </span>
                    )}
                    {hit.subcategories && (
                      <>
                        <span style={{ color: "var(--text-subtle)", fontSize: "0.75rem" }}>→</span>
                        <span className="badge">{hit.subcategories.name}</span>
                      </>
                    )}
                  </div>

                  <h2 style={{ fontSize: "1.0625rem", margin: 0 }}>
                    <Link
                      href={`/blog/${hit.slug}`}
                      style={{ color: "var(--text)", textDecoration: "none" }}
                      onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "var(--accent)")}
                      onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "var(--text)")}
                    >
                      {hit.title}
                    </Link>
                  </h2>

                  {hit.excerpt && (
                    <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.65, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {hit.excerpt}
                    </p>
                  )}

                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "auto", paddingTop: "0.5rem", borderTop: "1px solid var(--border-muted)" }}>
                    {hit.published_at && (
                      <span style={{ fontSize: "0.75rem", color: "var(--text-subtle)" }}>
                        {new Date(hit.published_at).toLocaleDateString()}
                      </span>
                    )}
                    {hit.reading_time && (
                      <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.75rem", color: "var(--text-subtle)" }}>
                        <Clock size={12} /> {hit.reading_time} min
                      </span>
                    )}
                    <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.75rem", color: "var(--text-subtle)" }}>
                      <Heart size={12} /> {hit.likes_count}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.75rem", color: "var(--text-subtle)" }}>
                      <Eye size={12} /> {hit.views_count}
                    </span>
                    <Link
                      href={`/blog/${hit.slug}`}
                      style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.8125rem", color: "var(--accent)", textDecoration: "none", fontWeight: 500 }}
                    >
                      Read <ArrowRight size={13} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {state.data.nbPages > 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginTop: "2rem" }}>
                <button className="btn btn-outline btn-sm" disabled={pageParam === 0} onClick={() => goToPage(pageParam - 1)}>
                  Previous
                </button>
                <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                  Page {pageParam + 1} of {state.data.nbPages}
                </span>
                <button className="btn btn-outline btn-sm" disabled={pageParam >= state.data.nbPages - 1} onClick={() => goToPage(pageParam + 1)}>
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {!query && !state.loading && (
          <div style={{ padding: "4rem 0", textAlign: "center" }}>
            <Search size={40} style={{ color: "var(--text-subtle)", marginBottom: "1rem" }} />
            <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Search the knowledge base</h2>
            <p style={{ color: "var(--text-muted)", maxWidth: 400, margin: "0 auto" }}>
              Type a keyword above to search across all articles — VaR, PnL, Python, FastAPI, and more.
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "6rem 0", color: "var(--text-muted)" }}>
          Loading...
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  );
}
