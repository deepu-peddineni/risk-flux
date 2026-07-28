"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Zap, Mail, Lock, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", username: "", display_name: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const supabase = createClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            username: form.username,
            display_name: form.display_name || form.username,
          },
          email_redirect_to: `${window.location.origin}/auth/callback`,
        },
      });
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      // Profile auto-created by the trigger (migration 004)
      setDone(true);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
    } catch {
      setError("Failed to start Google sign-in");
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", maxWidth: 400, padding: "2rem" }}>
          <h1 style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>Check your email</h1>
          <p style={{ color: "var(--text-muted)" }}>
            We sent a confirmation link to <strong>{form.email}</strong>. Click it to activate your account.
          </p>
          <Link href="/login" className="btn btn-outline" style={{ marginTop: "1.5rem" }}>Back to sign in</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", fontWeight: 700, color: "var(--text)", textDecoration: "none", marginBottom: "1.5rem" }}>
            <span style={{ background: "var(--text)", color: "var(--bg)", borderRadius: 8, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap size={14} strokeWidth={2.5} />
            </span>
            Risk‑Flux
          </Link>
          <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Create your account</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
            Already have one?{" "}
            <Link href="/login" style={{ color: "var(--accent)" }}>Sign in</Link>
          </p>
        </div>

        {/* Google OAuth */}
          <button
            id="google-signup"
            className="btn btn-outline"
            style={{ width: "100%", justifyContent: "center", marginBottom: "1.25rem", gap: "0.625rem" }}
            onClick={handleGoogle}
            disabled={loading}
          >
          <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/><path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/></svg>
          Continue with Google
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
          <hr style={{ flex: 1, margin: 0 }} />
          <span style={{ fontSize: "0.75rem", color: "var(--text-subtle)" }}>or with email</span>
          <hr style={{ flex: 1, margin: 0 }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--text)", display: "block", marginBottom: "0.4rem" }}>Display name</label>
            <div style={{ position: "relative" }}>
              <User size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-subtle)" }} />
              <input id="signup-displayname" type="text" placeholder="Jane Smith" style={{ paddingLeft: "2.25rem" }}
                value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--text)", display: "block", marginBottom: "0.4rem" }}>Username <span style={{ color: "var(--error)" }}>*</span></label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-subtle)", fontSize: "0.875rem" }}>@</span>
              <input id="signup-username" type="text" placeholder="janesmith" required style={{ paddingLeft: "2rem" }}
                value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--text)", display: "block", marginBottom: "0.4rem" }}>Email <span style={{ color: "var(--error)" }}>*</span></label>
            <div style={{ position: "relative" }}>
              <Mail size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-subtle)" }} />
              <input id="signup-email" type="email" placeholder="jane@example.com" required style={{ paddingLeft: "2.25rem" }}
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--text)", display: "block", marginBottom: "0.4rem" }}>Password <span style={{ color: "var(--error)" }}>*</span></label>
            <div style={{ position: "relative" }}>
              <Lock size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-subtle)" }} />
              <input id="signup-password" type={show ? "text" : "password"} placeholder="Min. 8 characters" required style={{ paddingLeft: "2.25rem", paddingRight: "2.5rem" }}
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} minLength={8} />
              <button type="button" onClick={() => setShow(!show)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-subtle)", padding: 0 }}>
                {show ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && <div style={{ fontSize: "0.8125rem", color: "var(--red, #ef4444)" }}>{error}</div>}

          <button id="signup-submit" type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }} disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: "0.75rem", color: "var(--text-subtle)", marginTop: "1.5rem" }}>
          By signing up you agree to the{" "}
          <Link href="/terms" style={{ color: "var(--text-muted)" }}>Terms of Service</Link>{" "}
          and{" "}
          <Link href="/privacy" style={{ color: "var(--text-muted)" }}>Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
