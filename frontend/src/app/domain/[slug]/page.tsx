import Link from "next/link";
import type { Metadata } from "next";

const DOMAIN_DATA: Record<string, { title: string; description: string; articles: { slug: string; title: string; excerpt: string; date: string }[] }> = {
  "market-risk": {
    title: "Market Risk",
    description: "VaR, PnL attribution, sensitivity analysis, and risk factor modelling for energy trading portfolios.",
    articles: [
      { slug: "understanding-var-in-energy-markets", title: "Understanding Value at Risk in Energy Markets", excerpt: "A comprehensive guide to VaR models applied to power and gas portfolios.", date: "2026-07-20" },
      { slug: "pnl-attribution-energy-trading", title: "PnL Attribution in Energy Trading Explained", excerpt: "How to decompose daily P&L into its market risk drivers.", date: "2026-07-10" },
    ],
  },
  "credit-risk": {
    title: "Credit Risk",
    description: "Counterparty risk, CVA, DVA, credit limits, and collateral management in energy markets.",
    articles: [
      { slug: "counterparty-risk-energy", title: "Managing Counterparty Risk in Energy Trading", excerpt: "CVA, DVA, and credit limit frameworks for OTC energy derivatives.", date: "2026-07-05" },
    ],
  },
  "cross-commodity": {
    title: "Cross Commodity Risk",
    description: "Spread risk, cross-commodity hedging, basis risk, and portfolio diversification across power, gas, coal, and emissions.",
    articles: [
      { slug: "cross-commodity-hedging", title: "Cross-Commodity Hedging Strategies", excerpt: "Hedging basis risk between power, gas, and emissions markets.", date: "2026-06-28" },
    ],
  },
  "fx-risk": {
    title: "FX Risk",
    description: "Foreign exchange exposure in commodity trading, FX VaR, and cross-currency hedging strategies.",
    articles: [
      { slug: "fx-risk-commodity-trading", title: "FX Risk in Commodity Trading", excerpt: "Managing currency exposure in international energy portfolios.", date: "2026-06-20" },
    ],
  },
  "market-data": {
    title: "Market Data",
    description: "Market data sourcing, curve construction, forward price modelling, and data quality management.",
    articles: [
      { slug: "forward-curve-construction", title: "Forward Curve Construction for Energy Commodities", excerpt: "Methods for building forward curves from market data.", date: "2026-07-01" },
    ],
  },
  "risk-reporting": {
    title: "Market & Credit Risk Reporting",
    description: "Daily risk reports, VaR backtesting, limit monitoring, and regulatory reporting (EMIR, MiFID II, CFTC).",
    articles: [
      { slug: "backtesting-var-models", title: "Backtesting VaR Models", excerpt: "Kupiec test, Christoffersen test, and regulatory backtesting requirements.", date: "2026-06-15" },
    ],
  },
  calculations: {
    title: "Calculations & Models",
    description: "Derivatives pricing, scenario analysis, Monte Carlo simulation, and quantitative model implementation.",
    articles: [
      { slug: "monte-carlo-energy", title: "Monte Carlo Simulation for Energy Portfolios", excerpt: "Pricing and risk analysis using Monte Carlo methods for commodity derivatives.", date: "2026-07-12" },
    ],
  },
};

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const domain = DOMAIN_DATA[params.slug];
  return { title: domain?.title ?? "Domain", description: domain?.description ?? "" };
}

export default function DomainSlugPage({ params }: { params: { slug: string } }) {
  const domain = DOMAIN_DATA[params.slug];
  if (!domain) {
    return (
      <div style={{ padding: "3rem 0", textAlign: "center" }}>
        <h1>Domain not found</h1>
        <Link href="/domain" className="btn btn-outline" style={{ marginTop: "1rem" }}>Back to Domain</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: "3rem 0" }}>
      <div className="container">
        <Link href="/domain" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.875rem", color: "var(--text-muted)", textDecoration: "none", marginBottom: "2rem", transition: "color 0.15s" }} className="hover-text">
          ← Back to Domain
        </Link>
        <h1 style={{ marginBottom: "0.5rem" }}>{domain.title}</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>{domain.description}</p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {domain.articles.map((a) => (
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
