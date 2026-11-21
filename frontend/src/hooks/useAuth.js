import { useState, useEffect, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "../supabase.js";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const isConfigured = isSupabaseConfigured();

  const fetchProfile = useCallback(async (userId) => {
    if (!supabase || !userId) return null;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (!error && data) {
        setProfile(data);
        return data;
      }
    } catch (e) {
      console.warn("Could not fetch user profile:", e);
    }
    return null;
  }, []);

  useEffect(() => {
    if (!isConfigured || !supabase) {
      // Check for local demo session if available
      const localDemo = localStorage.getItem("habit_ml_demo_user");
      if (localDemo) {
        try {
          const parsed = JSON.parse(localDemo);
          setUser(parsed);
          setProfile(parsed);
        } catch (e) {}
      }
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [isConfigured, fetchProfile]);

  const signUp = async ({ email, password, fullName }) => {
    if (!isConfigured || !supabase) {
      // Local Demo User Registration
      const demoUser = {
        id: "demo-user-" + Date.now(),
        email,
        full_name: fullName || email.split("@")[0],
        created_at: new Date().toISOString(),
      };
      localStorage.setItem("habit_ml_demo_user", JSON.stringify(demoUser));
      setUser(demoUser);
      setProfile(demoUser);
      return { data: { user: demoUser }, error: null };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    return { data, error };
  };

  const signIn = async ({ email, password }) => {
    if (!isConfigured || !supabase) {
      // Local Demo User Login
      const demoUser = {
        id: "demo-user-1",
        email,
        full_name: email.split("@")[0],
        created_at: new Date().toISOString(),
      };
      localStorage.setItem("habit_ml_demo_user", JSON.stringify(demoUser));
      setUser(demoUser);
      setProfile(demoUser);
      return { data: { user: demoUser }, error: null };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { data, error };
  };

  const signOut = async () => {
    if (supabase && isConfigured) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem("habit_ml_demo_user");
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  return {
    user,
    profile,
    session,
    loading,
    isConfigured,
    signUp,
    signIn,
    signOut,
  };
}
