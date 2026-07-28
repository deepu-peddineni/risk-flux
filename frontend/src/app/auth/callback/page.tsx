"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");

      if (code) {
        // PKCE flow — exchange code for session (sets cookies + triggers onAuthStateChange)
        const supabase = createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          router.replace("/login?error=" + encodeURIComponent(error.message));
          return;
        }
        // Session is now stored in cookies by @supabase/ssr.
        // Also stash tokens in localStorage as a fallback for the AuthProvider.
        const { data } = await supabase.auth.getSession();
        if (data.session?.access_token) {
          localStorage.setItem("access_token", data.session.access_token);
          localStorage.setItem("refresh_token", data.session.refresh_token);
        }
        router.replace("/");
      } else {
        router.replace("/login");
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "var(--text-muted)" }}>Signing you in...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--text-muted)" }}>Signing you in...</p>
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  );
}
