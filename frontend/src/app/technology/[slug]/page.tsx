import Link from "next/link";
import type { Metadata } from "next";

const TECH_DATA: Record<string, { title: string; description: string; articles: { slug: string; title: string; excerpt: string; date: string }[] }> = {
  python: {
    title: "Python",
    description: "Python for quantitative finance — NumPy, pandas, SciPy, FastAPI, and production-ready trading systems.",
    articles: [
      { slug: "python-for-energy-trading", title: "Python for Energy Trading: A Practical Guide", excerpt: "Setting up your Python environment for quant finance work.", date: "2026-07-15" },
      { slug: "building-fastapi-backend-trading-desk", title: "Building a FastAPI Backend for a Trading Desk", excerpt: "Step-by-step guide to designing a REST API with FastAPI and Supabase.", date: "2026-07-15" },
    ],
  },
  r: {
    title: "R",
    description: "Statistical computing in R — time series analysis, risk model calibration, and portfolio analytics.",
    articles: [
      { slug: "r-time-series-analysis", title: "Time Series Analysis in R for Energy Markets", excerpt: "Using R's forecast and quantmod packages for price analysis.", date: "2026-07-08" },
    ],
  },
  frontend: {
    title: "Frontend",
    description: "Next.js, React, and interactive dashboards for trading analytics and risk visualization.",
    articles: [
      { slug: "building-risk-dashboards", title: "Building Interactive Risk Dashboards with Next.js", excerpt: "Real-time VaR and PnL visualization using React and WebSockets.", date: "2026-07-01" },
    ],
  },
  "vba-excel": {
    title: "VBA & Excel",
    description: "Excel automation, VBA macros, advanced formulas, and spreadsheet modelling for trading desks.",
    articles: [
      { slug: "excel-modelling-trading", title: "Excel Modelling for Energy Trading Desks", excerpt: "Spreadsheet best practices for PnL tracking and risk reporting.", date: "2026-06-25" },
    ],
  },
  csharp: {
    title: "C#",
    description: "C# for trading applications, .NET pricing libraries, and Windows-based trading tools.",
    articles: [
      { slug: "csharp-pricing-library", title: "Building a Pricing Library in C#", excerpt: "Object-oriented design for derivative pricing models in .NET.", date: "2026-06-20" },
    ],
  },
  "databricks-aws": {
    title: "Databricks on AWS",
    description: "Data engineering on Databricks, Spark, Delta Lake, and AWS infrastructure for big data analytics.",
    articles: [
      { slug: "databricks-energy-analytics", title: "Databricks for Energy Trading Analytics", excerpt: "Large-scale market data processing with Spark and Delta Lake on AWS.", date: "2026-07-05" },
    ],
  },
};

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const tech = TECH_DATA[params.slug];
  return { title: tech?.title ?? "Technology", description: tech?.description ?? "" };
}

export default function TechSlugPage({ params }: { params: { slug: string } }) {
  const tech = TECH_DATA[params.slug];
  if (!tech) {
    return (
      <div style={{ padding: "3rem 0", textAlign: "center" }}>
        <h1>Topic not found</h1>
        <Link href="/technology" className="btn btn-outline" style={{ marginTop: "1rem" }}>Back to Technology</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: "3rem 0" }}>
      <div className="container">
        <Link href="/technology" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.875rem", color: "var(--text-muted)", textDecoration: "none", marginBottom: "2rem", transition: "color 0.15s" }} className="hover-text">
          ← Back to Technology
        </Link>
        <h1 style={{ marginBottom: "0.5rem" }}>{tech.title}</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>{tech.description}</p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {tech.articles.map((a) => (
            <Link key={a.slug} href={`/blog/${a.slug}`} style={{ textDecoration: "none" }}>
              <article className="card" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <h2 style={{ fontSize: "1rem", margin: 0 }}>{a.title}</h2>
                <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", margin: 0 }}>{a.excerpt}</p>
                <span style={{ fontSize: "0.75rem", color: "var(--text-subtle)" }}>{a.date}</span>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
