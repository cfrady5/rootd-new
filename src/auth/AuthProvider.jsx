/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from "react";
import supabase, { HAS_SUPABASE } from "../lib/supabaseClient.js";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export default function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      setLoading(false);
    });
    const subRes = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    const unsubscribe = subRes?.data?.subscription?.unsubscribe;
    return () => { if (typeof unsubscribe === 'function') unsubscribe(); };
  }, []);

  const value = {
    supabase,
    session,
    loading,
    token: session?.access_token || null,
    signIn: async (email, password) => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // refresh session
        const sess = (await supabase.auth.getSession()).data.session || data.session;
        setSession(sess ?? null);
        return { data, session: sess };
      } catch (e) {
        // Normalize supabase-js error shape
        const msg = e?.message || e?.error_description || JSON.stringify(e);
        throw new Error(msg);
      }
    },
    signUp: async (email, password) => {
      try {
        const r = await supabase.auth.signUp({ email, password });
        if (r.error) throw r.error;
        if (r.data?.user?.id) {
          await supabase.from("profiles").upsert({ id: r.data.user.id }).select("id");
        }
        // try to set session if available
        const sess = (await supabase.auth.getSession()).data.session || r.data?.session || null;
        setSession(sess);
        return r;
      } catch (e) {
        const msg = e?.message || e?.error_description || JSON.stringify(e);
        throw new Error(msg);
      }
    },
    signOut: async () => {
      try {
        await supabase.auth.signOut();
        setSession(null);
      } catch {
        // ignore
      }
    },
  };

  if (loading) return null;
  return (
    <>
      {!HAS_SUPABASE && (
        <div style={{ background: "#FFF8E5", color: "#7A5A00", padding: 8, textAlign: "center", fontWeight: 700 }}>
          Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — check your `.env.local` and restart the dev server.
        </div>
      )}
      <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
    </>
  );
}
