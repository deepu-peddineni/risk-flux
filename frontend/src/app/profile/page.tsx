"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Calendar, ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth/context";

export default function ProfilePage() {
  const { user, loading, signOut, getAccessToken } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<{ username: string; display_name: string; role: string; phone: string; bio: string } | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
      return;
    }
    (async () => {
      if (user) {
        const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const token = await getAccessToken();
        if (token) {
          try {
            const res = await fetch(`${API}/api/v1/users/me`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setProfile(await res.json());
          } catch {}
        }
      }
    })();
  }, [user, loading, router, getAccessToken]);

  if (loading || !user) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--text-muted)" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "3rem 0" }}>
      <div className="container" style={{ maxWidth: 600 }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.875rem", color: "var(--text-muted)", textDecoration: "none", marginBottom: "2rem" }}>
          <ArrowLeft size={14} /> Back to home
        </Link>

        <div className="card" style={{ padding: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--bg-muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <User size={24} style={{ color: "var(--text-muted)" }} />
            </div>
            <div>
              <h1 style={{ fontSize: "1.25rem", margin: 0 }}>{profile?.display_name || user.email}</h1>
              {profile?.role === "admin" && <span className="badge badge-accent">Admin</span>}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>
              <Mail size={15} /> {user.email}
            </div>
            {profile?.username && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>
                <User size={15} /> @{profile.username}
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>
              <Calendar size={15} /> Joined {new Date(user.created_at!).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </div>
          </div>

          <hr style={{ margin: "1.5rem 0" }} />

          <button onClick={signOut} className="btn btn-outline" style={{ width: "100%", justifyContent: "center" }}>
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
