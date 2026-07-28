"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import Link from "next/link";

export default function LikeButton({ postSlug, initialLikes = 0, initialLiked = false }: { postSlug: string; initialLikes?: number; initialLiked?: boolean }) {
  const { user, getAccessToken } = useAuth();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialLikes);
  const [busy, setBusy] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const toggle = async () => {
    if (!user || busy) return;
    setBusy(true);

    const token = await getAccessToken();
    if (!token) return;

    try {
      if (liked) {
        const res = await fetch(`${API}/api/v1/likes/post/${postSlug}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setLiked(false);
          setCount((c) => Math.max(0, c - 1));
        }
      } else {
        const res = await fetch(`${API}/api/v1/likes/post/${postSlug}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setLiked(true);
          setCount((c) => c + 1);
        } else if (res.status === 409) {
          setLiked(true);
        }
      }
    } catch {
      // ignore
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
      <button
        onClick={toggle}
        className={`btn ${liked ? "btn-primary" : "btn-outline"}`}
        style={{ gap: "0.5rem" }}
        disabled={!user || busy}
      >
        <Heart size={16} fill={liked ? "currentColor" : "none"} /> {count} {liked ? "Liked" : "Like"}
      </button>
      {!user && (
        <span style={{ fontSize: "0.8125rem", color: "var(--text-subtle)" }}>
          <Link href="/login" style={{ color: "var(--accent)" }}>Sign in</Link> to like
        </span>
      )}
    </div>
  );
}
