// src/auth/AuthProvider.jsx
import React, { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient.js";
import { AuthContext } from "./AuthContext.js";

export default function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    setSession(data?.session ?? null);
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data?.session ?? null);
      setLoading(false);
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = { session, loading, setSession, refreshSession };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
