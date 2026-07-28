import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Technology",
  description: "Modern technology stack for energy trading — Python, FastAPI, Data Engineering, Machine Learning, and Databases.",
};

const TECHNOLOGIES = [
  {
    slug: "python",
    title: "Python",
    description: "Python for quantitative finance — NumPy, pandas, SciPy, FastAPI, and production-ready trading systems.",
    articles: 15,
  },
  {
    slug: "r",
    title: "R",
    description: "Statistical computing in R — time series analysis, risk model calibration, and portfolio analytics.",
    articles: 5,
  },
  {
    slug: "frontend",
    title: "Frontend",
    description: "Next.js, React, and interactive dashboards for trading analytics and risk visualization.",
    articles: 7,
  },
  {
    slug: "vba-excel",
    title: "VBA & Excel",
    description: "Excel automation, VBA macros, advanced formulas, and spreadsheet modelling for trading desks.",
    articles: 6,
  },
  {
    slug: "csharp",
    title: "C#",
    description: "C# for trading applications, .NET pricing libraries, and Windows-based trading tools.",
    articles: 4,
  },
  {
    slug: "databricks-aws",
    title: "Databricks on AWS",
    description: "Data engineering on Databricks, Spark, Delta Lake, and AWS infrastructure for big data analytics.",
    articles: 8,
  },
];

export default function TechnologyPage() {
  return (
    <div style={{ padding: "3rem 0" }}>
      <div className="container">
        <div style={{ marginBottom: "2.5rem" }}>
          <div className="section-label">Technology</div>
          <h1 style={{ marginBottom: "0.5rem" }}>Tech Stack</h1>
          <p style={{ color: "var(--text-muted)", maxWidth: 600 }}>
            Languages, frameworks, and infrastructure for trading and risk systems.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
          {TECHNOLOGIES.map((t) => (
            <Link key={t.slug} href={`/technology/${t.slug}`} style={{ textDecoration: "none" }}>
              <article className="card" style={{ height: "100%", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                <h2 style={{ fontSize: "1rem", margin: 0 }}>{t.title}</h2>
                <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.65, flex: 1 }}>
                  {t.description}
                </p>
                <span style={{ fontSize: "0.75rem", color: "var(--text-subtle)" }}>{t.articles} articles</span>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
