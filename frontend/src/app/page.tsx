import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Risk-Flux — Energy Trading Risk & Technology",
  description: "Deep-dive knowledge hub for Energy Trading Risk Management and modern Technology for quant finance professionals.",
};

const DOMAIN_TOPICS = [
  { label: "Market Risk",       href: "/domain/market-risk",    desc: "VaR, PnL attribution, sensitivity analysis" },
  { label: "Credit Risk",       href: "/domain/credit-risk",    desc: "CVA, DVA, counterparty risk, collateral" },
  { label: "Cross Commodity",    href: "/domain/cross-commodity",desc: "Spread risk, basis risk, diversification" },
  { label: "FX Risk",           href: "/domain/fx-risk",        desc: "FX exposure, cross-currency hedging" },
  { label: "Market Data",       href: "/domain/market-data",    desc: "Curve construction, data quality" },
  { label: "Risk Reporting",    href: "/domain/risk-reporting", desc: "Daily reports, backtesting, compliance" },
  { label: "Calculations",      href: "/domain/calculations",   desc: "Pricing, simulation, quant models" },
];

const TECH_TOPICS = [
  { label: "Python",           href: "/technology/python",           desc: "Quant finance & data engineering" },
  { label: "R",                href: "/technology/r",                desc: "Statistical computing & analytics" },
  { label: "Frontend",         href: "/technology/frontend",         desc: "Dashboards & interactive UIs" },
  { label: "VBA & Excel",      href: "/technology/vba-excel",        desc: "Spreadsheet modelling & automation" },
  { label: "C#",               href: "/technology/csharp",           desc: "Trading applications & pricing libs" },
  { label: "Databricks on AWS", href: "/technology/databricks-aws",   desc: "Spark, Delta Lake, cloud infra" },
];

const AI_TOPICS = [
  { label: "Skills",           href: "/ai/skills",          desc: "Prompt engineering, RAG, fine-tuning" },
  { label: "Pet Projects",      href: "/ai/pet-projects",    desc: "Chatbots, signal generators, tools" },
  { label: "Agents",           href: "/ai/agents",          desc: "Autonomous agents, multi-agent systems" },
];

export default function HomePage() {
  return (
    <>
      <section style={{ padding: "5rem 0 4rem", textAlign: "center" }}>
        <div className="container-narrow animate-fade-in-up">
          <h1 style={{ marginBottom: "1rem", lineHeight: 1.15 }}>
            Risk Management.<br />
            <span style={{ color: "var(--accent)" }}>Technology. AI. Hacks.</span>
          </h1>
          <p style={{ fontSize: "1rem", color: "var(--text-muted)", maxWidth: "480px", margin: "0 auto 2rem", lineHeight: 1.7 }}>
            Deep-dives into market risk, credit risk, FX, calculations, tech stacks, AI agents, and practical blog posts.
          </p>
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/domain" id="hero-explore-domain" className="btn btn-primary btn-lg">
              Explore Domain <ArrowRight size={15} />
            </Link>
            <Link href="/blog" id="hero-read-blog" className="btn btn-outline btn-lg">
              <FileText size={15} /> Blog
            </Link>
            <Link href="/ai" id="hero-ai" className="btn btn-outline btn-lg">
              AI <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Domain Topics ─────────────────────────────────── */}
      <section style={{ padding: "4rem 0" }}>
        <div className="container">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div className="section-label">Domain</div>
              <h2 style={{ color: "var(--text)" }}>Risk Management</h2>
              <p style={{ color: "var(--text-muted)", marginTop: "0.3rem", fontSize: "0.9rem" }}>Market risk, credit risk, FX, and quantitative models</p>
            </div>
            <Link href="/domain" className="btn btn-outline btn-sm">
              All topics <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "0.75rem" }}>
            {DOMAIN_TOPICS.map((topic, i) => (
              <Link
                key={topic.href}
                href={topic.href}
                id={`domain-card-${topic.label.toLowerCase().replace(/\s+/g, "-")}`}
                style={{ textDecoration: "none", animationDelay: `${i * 0.05}s` }}
                className="animate-fade-in-up"
              >
                <div className="card" style={{ height: "100%", cursor: "pointer", padding: "1.25rem" }}>
                  <h3 style={{ fontSize: "0.9375rem", marginBottom: "0.35rem", color: "var(--text)" }}>{topic.label}</h3>
                  <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.6 }}>{topic.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Technology Topics ──────────────────────────────── */}
      <section style={{ padding: "4rem 0", background: "var(--bg-subtle)" }}>
        <div className="container">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div className="section-label">Technology</div>
              <h2 style={{ color: "var(--text)" }}>Tech Stack</h2>
              <p style={{ color: "var(--text-muted)", marginTop: "0.3rem", fontSize: "0.9rem" }}>Languages, frameworks, and infrastructure</p>
            </div>
            <Link href="/technology" className="btn btn-outline btn-sm">
              All topics <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "0.75rem" }}>
            {TECH_TOPICS.map((topic, i) => (
              <Link
                key={topic.href}
                href={topic.href}
                id={`tech-card-${topic.label.toLowerCase().replace(/\s+/g, "-")}`}
                style={{ textDecoration: "none", animationDelay: `${i * 0.05}s` }}
                className="animate-fade-in-up"
              >
                <div className="card" style={{ height: "100%", cursor: "pointer", padding: "1.25rem" }}>
                  <h3 style={{ fontSize: "0.9375rem", marginBottom: "0.35rem", color: "var(--text)" }}>{topic.label}</h3>
                  <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.6 }}>{topic.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Topics ──────────────────────────────────────── */}
      <section style={{ padding: "4rem 0" }}>
        <div className="container">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div className="section-label">AI</div>
              <h2 style={{ color: "var(--text)" }}>Artificial Intelligence</h2>
              <p style={{ color: "var(--text-muted)", marginTop: "0.3rem", fontSize: "0.9rem" }}>Skills, experiments, and agents</p>
            </div>
            <Link href="/ai" className="btn btn-outline btn-sm">
              All topics <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "0.75rem" }}>
            {AI_TOPICS.map((topic, i) => (
              <Link
                key={topic.href}
                href={topic.href}
                id={`ai-card-${topic.label.toLowerCase().replace(/\s+/g, "-")}`}
                style={{ textDecoration: "none", animationDelay: `${i * 0.05}s` }}
                className="animate-fade-in-up"
              >
                <div className="card" style={{ height: "100%", cursor: "pointer", padding: "1.25rem" }}>
                  <h3 style={{ fontSize: "0.9375rem", marginBottom: "0.35rem", color: "var(--text)" }}>{topic.label}</h3>
                  <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.6 }}>{topic.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features strip ────────────────────────────────── */}
      <section style={{ padding: "4rem 0", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", background: "var(--bg-subtle)" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
            {[
              { title: "Expert Content", desc: "Sole-authored articles from an energy trading risk practitioner." },
              { title: "Reading Time", desc: "Every article shows estimated reading time upfront." },
              { title: "Community", desc: "Registered users can comment and reply in nested threads." },
            ].map((f) => (
              <div key={f.title} style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <h3 style={{ fontSize: "0.875rem", margin: 0, fontWeight: 600 }}>{f.title}</h3>
                <p style={{ fontSize: "0.8125rem", color: "var(--text-subtle)", margin: 0, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────── */}
      <section style={{ padding: "4rem 0", textAlign: "center" }}>
        <div className="container-narrow">
          <h2 style={{ marginBottom: "0.75rem" }}>Start exploring</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem", fontSize: "0.9375rem" }}>
            Sign up to comment, like posts, and join the conversation.
          </p>
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/signup" id="cta-signup" className="btn btn-primary btn-lg">
              Create account <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
