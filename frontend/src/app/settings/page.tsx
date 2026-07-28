"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, User, Mail, Phone, FileText, Globe, MapPin } from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const { user, loading, getAccessToken } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    display_name: "",
    username: "",
    bio: "",
    phone: "",
    website: "",
    location: "",
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
      return;
    }
    (async () => {
      if (user && !loaded) {
        const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const token = await getAccessToken();
        if (token) {
          try {
            const res = await fetch(`${API}/api/v1/users/me`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setForm({
              display_name: data.display_name || "",
              username: data.username || "",
              bio: data.bio || "",
              phone: data.phone || "",
              website: data.website || "",
              location: data.location || "",
            });
            setLoaded(true);
          } catch {}
        }
      }
    })();
  }, [user, loading, router, getAccessToken, loaded]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");

    const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const token = await getAccessToken();
    if (!token) return;

    try {
      const res = await fetch(`${API}/api/v1/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          display_name: form.display_name,
          bio: form.bio,
          phone: form.phone,
          website: form.website,
          location: form.location,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const err = await res.json();
        setError(err.detail || "Failed to save");
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  };

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
        <Link href="/profile" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.875rem", color: "var(--text-muted)", textDecoration: "none", marginBottom: "2rem" }}>
          <ArrowLeft size={14} /> Back to profile
        </Link>

        <div className="card" style={{ padding: "2rem" }}>
          <h1 style={{ fontSize: "1.25rem", marginBottom: "1.5rem" }}>Account Settings</h1>

          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--text)", display: "block", marginBottom: "0.35rem" }}>
                <Mail size={13} style={{ marginRight: "0.3rem" }} /> Email
              </label>
              <input type="email" value={user.email || ""} disabled style={{ opacity: 0.6 }} />
              <span style={{ fontSize: "0.75rem", color: "var(--text-subtle)" }}>Email cannot be changed here</span>
            </div>

            <div>
              <label style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--text)", display: "block", marginBottom: "0.35rem" }}>
                <User size={13} style={{ marginRight: "0.3rem" }} /> Display Name
              </label>
              <input
                type="text"
                value={form.display_name}
                onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                placeholder="Your display name"
              />
            </div>

            <div>
              <label style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--text)", display: "block", marginBottom: "0.35rem" }}>
                <User size={13} style={{ marginRight: "0.3rem" }} /> Username
              </label>
              <input type="text" value={form.username} disabled style={{ opacity: 0.6 }} />
              <span style={{ fontSize: "0.75rem", color: "var(--text-subtle)" }}>Username cannot be changed</span>
            </div>

            <div>
              <label style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--text)", display: "block", marginBottom: "0.35rem" }}>
                <Phone size={13} style={{ marginRight: "0.3rem" }} /> Phone
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+1 555 123 4567"
              />
            </div>

            <div>
              <label style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--text)", display: "block", marginBottom: "0.35rem" }}>
                <Globe size={13} style={{ marginRight: "0.3rem" }} /> Website
              </label>
              <input
                type="url"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="https://yoursite.com"
              />
            </div>

            <div>
              <label style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--text)", display: "block", marginBottom: "0.35rem" }}>
                <MapPin size={13} style={{ marginRight: "0.3rem" }} /> Location
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="London, UK"
              />
            </div>

            <div>
              <label style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--text)", display: "block", marginBottom: "0.35rem" }}>
                <FileText size={13} style={{ marginRight: "0.3rem" }} /> Bio
              </label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                rows={3}
                style={{ resize: "vertical" }}
              />
            </div>

            {error && (
              <div style={{ fontSize: "0.8125rem", color: "var(--red)", padding: "0.5rem 0" }}>{error}</div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", gap: "0.5rem" }} disabled={saving}>
              <Save size={15} /> {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
