"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Calendar, ArrowLeft, Globe, MapPin, Phone, Info, Settings } from "lucide-react";
import { useAuth } from "@/lib/auth/context";

export default function ProfilePage() {
  const { user, loading, signOut, getAccessToken } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);

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

  const name = profile?.display_name || profile?.username || user?.email || "";
  const initial = name.charAt(0).toUpperCase();

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
          {/* Avatar & Name */}
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "2rem" }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: "var(--bg-muted)", display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, fontSize: "1.5rem", fontWeight: 600, color: "var(--text-muted)",
            }}>
              {initial}
            </div>
            <div>
              <h1 style={{ fontSize: "1.25rem", margin: 0 }}>{profile?.display_name || user.email}</h1>
              {profile?.username && <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", margin: "0.125rem 0 0" }}>@{profile.username}</p>}
              {profile?.role === "admin" && <span className="badge badge-accent" style={{ marginTop: "0.375rem" }}>Admin</span>}
            </div>
          </div>

          {/* Profile details */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>
              <Mail size={15} /> {user.email}
            </div>
            {profile?.bio && (
              <div style={{ display: "flex", gap: "0.75rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>
                <Info size={15} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{profile.bio}</span>
              </div>
            )}
            {profile?.website && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>
                <Globe size={15} />
                <a href={profile.website} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", textDecoration: "none" }}>{profile.website}</a>
              </div>
            )}
            {profile?.location && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>
                <MapPin size={15} /> {profile.location}
              </div>
            )}
            {profile?.phone && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>
                <Phone size={15} /> {profile.phone}
              </div>
            )}
            {profile?.created_at && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>
                <Calendar size={15} /> Joined {new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </div>
            )}
          </div>

          <hr style={{ margin: "1.5rem 0" }} />

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <Link href="/settings" className="btn btn-outline" style={{ width: "100%", justifyContent: "center", gap: "0.5rem" }}>
              <Settings size={15} /> Edit profile
            </Link>
            <button onClick={signOut} className="btn btn-ghost" style={{ width: "100%", justifyContent: "center", color: "var(--red, #ef4444)" }}>
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}