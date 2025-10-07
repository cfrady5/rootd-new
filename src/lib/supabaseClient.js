// src/lib/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

// Some envs were saved with surrounding quotes. Strip them.
const strip = (s) => (s || "").trim().replace(/^['"]|['"]$/g, "");

const url = strip(import.meta.env.VITE_SUPABASE_URL);
const key = strip(import.meta.env.VITE_SUPABASE_ANON_KEY);

export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: { headers: { "x-application-name": "rootd-app" } },
});

export const isSupabaseReady = !!(url && key);

if (import.meta.env.DEV) {
  console.log("[Supabase env check]", {
    url,
    keyStartsWith: key ? key.slice(0, 10) : "",
    keyLength: key?.length || 0,
  });
}
