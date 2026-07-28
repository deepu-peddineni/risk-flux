"use client";

import Link from "next/link";
import { Clock, Heart, Eye, ArrowRight } from "lucide-react";

const CATEGORY_COLORS: Record<string, string> = {
  Domain: "var(--accent)",
  Technology: "#10b981",
  AI: "#a855f7",
  Blog: "var(--text-muted)",
};

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  subcategory: string;
  tags: string[];
  reading_time: number;
  likes_count: number;
  views_count: number;
  published_at: string;
}

export default function PostCard({ post }: { post: Post }) {
  return (
    <article className="card" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
        <span className="badge" style={{ color: CATEGORY_COLORS[post.category] || "var(--accent)", borderColor: "transparent", background: "var(--bg-subtle)" }}>
          {post.category}
        </span>
        <span style={{ color: "var(--text-subtle)", fontSize: "0.75rem" }}>→</span>
        <span className="badge">{post.subcategory}</span>
      </div>

      <h2 style={{ fontSize: "1.0625rem", margin: 0 }}>
        <Link href={`/blog/${post.slug}`} style={{ color: "var(--text)", textDecoration: "none" }}
          onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "var(--accent)")}
          onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "var(--text)")}
        >
          {post.title}
        </Link>
      </h2>

      <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.65, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        {post.excerpt}
      </p>

      <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
        {post.tags.map((tag) => (
          <Link key={tag} href={`/tags/${tag.toLowerCase().replace(/\s+/g, "-")}`} className="badge" style={{ textDecoration: "none", fontSize: "0.7rem" }}>
            #{tag}
          </Link>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "auto", paddingTop: "0.5rem", borderTop: "1px solid var(--border-muted)" }}>
        <span style={{ fontSize: "0.75rem", color: "var(--text-subtle)" }}>{post.published_at}</span>
        <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.75rem", color: "var(--text-subtle)" }}>
          <Clock size={12} /> {post.reading_time} min
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.75rem", color: "var(--text-subtle)" }}>
          <Heart size={12} /> {post.likes_count}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.75rem", color: "var(--text-subtle)" }}>
          <Eye size={12} /> {post.views_count}
        </span>
        <Link href={`/blog/${post.slug}`} style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.8125rem", color: "var(--accent)", textDecoration: "none", fontWeight: 500 }}>
          Read <ArrowRight size={13} />
        </Link>
      </div>
    </article>
  );
}
