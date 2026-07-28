"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface Profile {
  display_name: string | null;
  username: string | null;
  role: string | null;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refresh: async () => {},
  getAccessToken: async () => null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("display_name, username, role")
        .eq("id", userId)
        .single();
      if (data) setProfile(data);
    } catch {
      // profile may not exist yet
    }
  }, []);

  const refresh = useCallback(async (): Promise<void> => {
    try {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
        await fetchProfile(data.user.id);
        setLoading(false);
        return;
      }
      const accessToken = localStorage.getItem("access_token");
      const refreshToken = localStorage.getItem("refresh_token");
      if (accessToken && refreshToken) {
        const { data: sessionData } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (sessionData?.user) {
          setUser(sessionData.user);
          await fetchProfile(sessionData.user.id);
          setLoading(false);
          return;
        }
      }
      setUser(null);
      setProfile(null);
    } catch {
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [fetchProfile]);

  useEffect(() => {
    refresh();

    const supabase = createClient();
    const { data: listener } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      setLoading(false);
    });

    const onStorage = (e: StorageEvent) => {
      if (e.key === "access_token") refresh();
    };
    window.addEventListener("storage", onStorage);

    return () => {
      listener?.subscription.unsubscribe();
      window.removeEventListener("storage", onStorage);
    };
  }, [refresh, fetchProfile]);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    const stored = localStorage.getItem("access_token");
    if (stored) return stored;
    try {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token ?? null;
      if (token) localStorage.setItem("access_token", token);
      return token;
    } catch {
      return null;
    }
  }, []);

  const signOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
    setProfile(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, refresh, getAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
