"use client";

import Link from "next/link";
import { Zap } from "lucide-react";

const DOMAIN_LINKS = [
  { href: "/domain/market-risk", label: "Market Risk" },
  { href: "/domain/credit-risk", label: "Credit Risk" },
  { href: "/domain/cross-commodity", label: "Cross Commodity" },
  { href: "/domain/fx-risk", label: "FX Risk" },
  { href: "/domain/risk-reporting", label: "Risk Reporting" },
];

const TECH_LINKS = [
  { href: "/technology/python", label: "Python" },
  { href: "/technology/r", label: "R" },
  { href: "/technology/frontend", label: "Frontend" },
  { href: "/technology/vba-excel", label: "VBA & Excel" },
  { href: "/technology/csharp", label: "C#" },
  { href: "/technology/databricks-aws", label: "Databricks on AWS" },
];

const AI_LINKS = [
  { href: "/ai/skills", label: "Skills" },
  { href: "/ai/pet-projects", label: "Pet Projects" },
  { href: "/ai/agents", label: "Agents" },
];

const SITE_LINKS = [
  { href: "/blog",    label: "Blog" },
  { href: "/search",  label: "Search" },
  { href: "/login",   label: "Sign in" },
  { href: "/signup",  label: "Get started" },
];

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--border)",
        padding: "3rem 0 2rem",
        marginTop: "4rem",
        background: "var(--bg-subtle)",
      }}
    >
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "2.5rem",
            marginBottom: "3rem",
          }}
        >
          {/* Brand */}
          <div style={{ gridColumn: "span 1" }}>
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontWeight: 700,
                fontSize: "1rem",
                color: "var(--text)",
                textDecoration: "none",
                marginBottom: "0.75rem",
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 24,
                  height: 24,
                  background: "var(--text)",
                  borderRadius: 6,
                  color: "var(--bg)",
                }}
              >
                <Zap size={13} strokeWidth={2.5} />
              </span>
              Risk‑Flux
            </Link>
            <p style={{ fontSize: "0.8125rem", color: "var(--text-subtle)", lineHeight: 1.6, maxWidth: 200 }}>
              Deep knowledge for Energy Trading Risk & Technology professionals.
            </p>
          </div>

          {/* Domain */}
          <div>
            <h4 style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text)", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Domain</h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {DOMAIN_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} style={{ fontSize: "0.8125rem", color: "var(--text-muted)", textDecoration: "none" }}
                    onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "var(--text)")}
                    onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "var(--text-muted)")}
                  >{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Technology */}
          <div>
            <h4 style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text)", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Technology</h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {TECH_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} style={{ fontSize: "0.8125rem", color: "var(--text-muted)", textDecoration: "none" }}
                    onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "var(--text)")}
                    onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "var(--text-muted)")}
                  >{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* AI */}
          <div>
            <h4 style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text)", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>AI</h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {AI_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} style={{ fontSize: "0.8125rem", color: "var(--text-muted)", textDecoration: "none" }}
                    onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "var(--text)")}
                    onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "var(--text-muted)")}
                  >{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Site */}
          <div>
            <h4 style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text)", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Site</h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {SITE_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} style={{ fontSize: "0.8125rem", color: "var(--text-muted)", textDecoration: "none" }}
                    onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "var(--text)")}
                    onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "var(--text-muted)")}
                  >{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border)" }}>
          <p style={{ fontSize: "0.8125rem", color: "var(--text-subtle)", margin: 0 }}>
            © {new Date().getFullYear()} Risk-Flux. Built for energy trading professionals.
          </p>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub"
              style={{ color: "var(--text-subtle)", transition: "color 0.15s" }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "var(--text)")}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "var(--text-subtle)")}
            >
              <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter"
              style={{ color: "var(--text-subtle)", transition: "color 0.15s" }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "var(--text)")}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "var(--text-subtle)")}
            >
              <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
