"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";
import { Sun, Moon, Search, Menu, X, Zap, User, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth/context";

const NAV_LINKS = [
  { href: "/domain",     label: "Domain" },
  { href: "/technology", label: "Tech" },
  { href: "/ai",         label: "AI" },
  { href: "/blog",       label: "Blog" },
];

function ProfileDropdown({ user, signOut }: { user: { email?: string | null }; signOut: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const initial = (user.email?.charAt(0) || "?").toUpperCase();

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        id="nav-profile"
        className="btn btn-ghost btn-sm"
        onClick={() => setOpen(!open)}
        aria-label="Profile menu"
        style={{
          width: 32, height: 32, borderRadius: "50%", padding: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "var(--bg-muted)", fontWeight: 600, fontSize: "0.8125rem",
        }}
      >
        {initial}
      </button>
      {open && (
        <div
          style={{
            position: "absolute", right: 0, top: "calc(100% + 6px)",
            minWidth: 180, background: "var(--bg)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)", boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
            padding: "0.25rem", zIndex: 60,
          }}
        >
          <div style={{ padding: "0.5rem 0.75rem", borderBottom: "1px solid var(--border)", marginBottom: "0.25rem" }}>
            <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text)" }}>{user.email}</div>
          </div>
          <Link
            href="/profile"
            className="btn btn-ghost"
            style={{ width: "100%", justifyContent: "flex-start", gap: "0.5rem", fontSize: "0.8125rem" }}
            onClick={() => setOpen(false)}
          >
            <User size={14} /> Profile
          </Link>
          <Link
            href="/settings"
            className="btn btn-ghost"
            style={{ width: "100%", justifyContent: "flex-start", gap: "0.5rem", fontSize: "0.8125rem" }}
            onClick={() => setOpen(false)}
          >
            <Settings size={14} /> Settings
          </Link>
          <hr style={{ margin: "0.25rem 0" }} />
          <button
            className="btn btn-ghost"
            style={{ width: "100%", justifyContent: "flex-start", gap: "0.5rem", fontSize: "0.8125rem", color: "var(--red, #ef4444)" }}
            onClick={() => { signOut(); setOpen(false); }}
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        height: 64,
        display: "flex",
        alignItems: "center",
        background: scrolled ? "var(--bg)" : "transparent",
        borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        transition: "all 0.2s ease",
      }}
    >
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Logo */}
        <Link
          href="/"
          id="nav-logo"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontWeight: 700,
            fontSize: "1.125rem",
            color: "var(--text)",
            letterSpacing: "-0.03em",
            textDecoration: "none",
          }}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 28,
              height: 28,
              background: "var(--text)",
              borderRadius: 8,
              color: "var(--bg)",
            }}
          >
            <Zap size={15} strokeWidth={2.5} />
          </span>
          <span>Risk‑Flux</span>
        </Link>

        {/* Desktop nav */}
        <nav
          style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}
          className="desktop-nav"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              id={`nav-${link.label.toLowerCase()}`}
              style={{
                padding: "0.4rem 0.875rem",
                borderRadius: "var(--radius-md)",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "var(--text-muted)",
                textDecoration: "none",
                transition: "color 0.15s, background 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.color = "var(--text)";
                (e.target as HTMLElement).style.background = "var(--bg-muted)";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.color = "var(--text-muted)";
                (e.target as HTMLElement).style.background = "transparent";
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Link href="/search" id="nav-search" className="btn btn-ghost btn-sm" aria-label="Search">
            <Search size={16} />
          </Link>

          {mounted && (
            <button
              id="theme-toggle"
              className="btn btn-ghost btn-sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          )}

          {user ? (
            <ProfileDropdown user={user} signOut={signOut} />
          ) : (
            <>
              <Link href="/login" id="nav-login" className="btn btn-outline btn-sm" style={{ display: menuOpen ? "none" : undefined }}>
                Sign in
              </Link>
              <Link href="/signup" id="nav-signup" className="btn btn-primary btn-sm" style={{ display: menuOpen ? "none" : undefined }}>
                Get started
              </Link>
            </>
          )}

          {/* Mobile menu toggle */}
          <button
            className="btn btn-ghost btn-sm mobile-menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          style={{
            position: "fixed",
            inset: "64px 0 0 0",
            background: "var(--bg)",
            borderTop: "1px solid var(--border)",
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            zIndex: 40,
          }}
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="btn btn-ghost"
              style={{ justifyContent: "flex-start", fontSize: "1rem" }}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <hr />
          {user ? (
            <>
              <Link href="/profile" className="btn btn-ghost" style={{ justifyContent: "flex-start" }} onClick={() => setMenuOpen(false)}>Profile</Link>
              <button className="btn btn-outline" style={{ justifyContent: "flex-start" }} onClick={() => { signOut(); setMenuOpen(false); }}>Sign out</button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-outline" onClick={() => setMenuOpen(false)}>Sign in</Link>
              <Link href="/signup" className="btn btn-primary" onClick={() => setMenuOpen(false)}>Get started</Link>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          #nav-login, #nav-signup { display: none !important; }
        }
        @media (min-width: 769px) {
          .mobile-menu-btn { display: none !important; }
        }
      `}</style>
    </header>
  );
}
