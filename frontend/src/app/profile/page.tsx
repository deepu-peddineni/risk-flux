"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Calendar, ArrowLeft, Camera, Save, Loader2, Globe, MapPin, Phone, Info } from "lucide-react";
import { useAuth } from "@/lib/auth/context";

export default function ProfilePage() {
  const { user, profile: contextProfile, loading, signOut, getAccessToken } = useAuth();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    display_name: "",
    bio: "",
    phone: "",
    website: "",
    location: "",
  });

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
            const data = await res.json();
            setProfile(data);
            setForm({
              display_name: data.display_name || "",
              bio: data.bio || "",
              phone: data.phone || "",
              website: data.website || "",
              location: data.location || "",
            });
          } catch {}
        }
      }
    })();
  }, [user, loading, router, getAccessToken]);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const token = await getAccessToken();
      const res = await fetch(`${API}/api/v1/users/me`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          display_name: form.display_name || null,
          bio: form.bio || null,
          phone: form.phone || null,
          website: form.website || null,
          location: form.location || null,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        setMessage("Saved");
      } else {
        setMessage("Failed to save");
      }
    } catch {
      setMessage("Network error");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMessage("");
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const token = await getAccessToken();
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API}/api/v1/users/me/avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        const { url } = await res.json();
        setProfile((p: any) => ({ ...p, avatar_url: url }));
        setMessage("Photo uploaded");
      } else {
        const err = await res.json();
        setMessage(err.detail || "Upload failed");
      }
    } catch {
      setMessage("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const avatarUrl = profile?.avatar_url || contextProfile?.avatar_url;

  if (loading || !user) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--text-muted)" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "3rem 0" }}>
      <div className="container" style={{ maxWidth: 640 }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.875rem", color: "var(--text-muted)", textDecoration: "none", marginBottom: "2rem" }}>
          <ArrowLeft size={14} /> Back to home
        </Link>

        <div className="card" style={{ padding: "2rem" }}>
          {/* Avatar */}
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "2rem" }}>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              style={{
                position: "relative", width: 80, height: 80, borderRadius: "50%", padding: 0, border: "none", cursor: "pointer",
                background: "var(--bg-muted)", display: "flex", alignItems: "center", justifyContent: "center",
                overflow: "hidden", flexShrink: 0,
              }}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="" style={{ width: 80, height: 80, objectFit: "cover" }} />
              ) : (
                <span style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--text-muted)" }}>
                  {(form.display_name || user.email || "?").charAt(0).toUpperCase()}
                </span>
              )}
              <div style={{
                position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)",
                display: "flex", alignItems: "center", justifyContent: "center", opacity: 1,
                transition: "opacity 0.15s",
              }}>
                {uploading ? <Loader2 size={20} className="spin" style={{ color: "#fff" }} /> : <Camera size={20} style={{ color: "#fff" }} />}
              </div>
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatar} />
            <div>
              <h1 style={{ fontSize: "1.25rem", margin: 0 }}>{profile?.display_name || user.email}</h1>
              {profile?.username && <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", margin: "0.25rem 0 0" }}>@{profile.username}</p>}
              {profile?.role === "admin" && <span className="badge badge-accent" style={{ marginTop: "0.375rem" }}>Admin</span>}
            </div>
          </div>

          {/* Editable fields */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--text)", display: "block", marginBottom: "0.375rem" }}>Display name</label>
              <input type="text" value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} placeholder="Your name" />
            </div>
            <div>
              <label style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--text)", display: "block", marginBottom: "0.375rem" }}>
                <Info size={13} style={{ verticalAlign: "middle", marginRight: 4 }} /> Bio
              </label>
              <textarea rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Tell us about yourself" style={{ resize: "vertical" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--text)", display: "block", marginBottom: "0.375rem" }}>
                  <Globe size={13} style={{ verticalAlign: "middle", marginRight: 4 }} /> Website
                </label>
                <input type="url" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://yoursite.com" />
              </div>
              <div>
                <label style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--text)", display: "block", marginBottom: "0.375rem" }}>
                  <MapPin size={13} style={{ verticalAlign: "middle", marginRight: 4 }} /> Location
                </label>
                <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="City, Country" />
              </div>
            </div>
            <div>
              <label style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--text)", display: "block", marginBottom: "0.375rem" }}>
                <Phone size={13} style={{ verticalAlign: "middle", marginRight: 4 }} /> Phone
              </label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 (555) 000-0000" />
            </div>
          </div>

          {/* Save */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "1.5rem" }}>
            <button onClick={handleSave} className="btn btn-primary" disabled={saving} style={{ gap: "0.375rem" }}>
              {saving ? <Loader2 size={14} className="spin" /> : <Save size={14} />}
              {saving ? "Saving..." : "Save changes"}
            </button>
            {message && <span style={{ fontSize: "0.8125rem", color: message === "Saved" || message === "Photo uploaded" ? "var(--green, #22c55e)" : "var(--red, #ef4444)" }}>{message}</span>}
          </div>

          {/* Metadata */}
          <hr style={{ margin: "1.5rem 0" }} />

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>
              <Mail size={15} /> {user.email}
            </div>
            {profile?.created_at && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>
                <Calendar size={15} /> Joined {new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </div>
            )}
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