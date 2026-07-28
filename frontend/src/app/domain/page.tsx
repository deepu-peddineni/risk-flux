import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Domain Knowledge",
  description: "Deep-dive into energy trading risk management — PnL, VaR, Volatility, Time Series, and Curve Building.",
};

const DOMAINS = [
  {
    slug: "market-risk",
    title: "Market Risk",
    description: "VaR, PnL attribution, sensitivity analysis, and risk factor modelling for energy trading portfolios.",
    articles: 14,
  },
  {
    slug: "credit-risk",
    title: "Credit Risk",
    description: "Counterparty risk, CVA, DVA, credit limits, and collateral management in energy markets.",
    articles: 8,
  },
  {
    slug: "cross-commodity",
    title: "Cross Commodity Risk",
    description: "Spread risk, cross-commodity hedging, basis risk, and portfolio diversification across power, gas, coal, and emissions.",
    articles: 6,
  },
  {
    slug: "fx-risk",
    title: "FX Risk",
    description: "Foreign exchange exposure in commodity trading, FX VaR, and cross-currency hedging strategies.",
    articles: 5,
  },
  {
    slug: "market-data",
    title: "Market Data",
    description: "Market data sourcing, curve construction, forward price modelling, and data quality management.",
    articles: 10,
  },
  {
    slug: "risk-reporting",
    title: "Market & Credit Risk Reporting",
    description: "Daily risk reports, VaR backtesting, limit monitoring, and regulatory reporting (EMIR, MiFID II, CFTC).",
    articles: 9,
  },
  {
    slug: "calculations",
    title: "Calculations & Models",
    description: "Derivatives pricing, scenario analysis, Monte Carlo simulation, and quantitative model implementation.",
    articles: 11,
  },
];

export default function DomainPage() {
  return (
    <div style={{ padding: "3rem 0" }}>
      <div className="container">
        <div style={{ marginBottom: "2.5rem" }}>
          <div className="section-label">Domain</div>
          <h1 style={{ marginBottom: "0.5rem" }}>Risk Management</h1>
          <p style={{ color: "var(--text-muted)", maxWidth: 600 }}>
            Market risk, credit risk, FX, quantitative models, and reporting.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
          {DOMAINS.map((d) => (
            <Link key={d.slug} href={`/domain/${d.slug}`} style={{ textDecoration: "none" }}>
              <article className="card" style={{ height: "100%", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                <h2 style={{ fontSize: "1rem", margin: 0 }}>{d.title}</h2>
                <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.65, flex: 1 }}>
                  {d.description}
                </p>
                <span style={{ fontSize: "0.75rem", color: "var(--text-subtle)" }}>{d.articles} articles</span>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
