// /src/lib/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Helpful runtime debug: log the VITE_SUPABASE_URL the bundle was built with.
// This prints only the URL (no secrets) and helps confirm what value was embedded
// into the client during the Vercel build. Remove after debugging.
/* eslint-disable no-console */
console.info('[env] VITE_SUPABASE_URL =', url);
/* eslint-enable no-console */

export const HAS_SUPABASE = Boolean(url && key);

let supabase;

if (!url || !key) {
  // Warn and create a graceful stub so imports don't crash the app at module load.
  // This keeps the UI mountable in dev while providing actionable errors when
  // the app actually tries to use Supabase functionality.
  console.warn("[Supabase env check] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY", { url, key });

  const msg = "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Add them to .env.local and restart the dev server.";

  // Minimal safe stub implementations used by the app to avoid runtime crashes.
  const authStub = {
    async getSession() {
      // return shape compatible with supabase.auth.getSession()
      return { data: { session: null }, error: null };
    },
    onAuthStateChange() {
      // return an object with unsubscribe to match Supabase API
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
    async signInWithPassword() {
      throw new Error(msg);
    },
    async signUp() {
      throw new Error(msg);
    },
    async signOut() {
      throw new Error(msg);
    },
  };

  const fromStub = () => ({
    select: async () => ({ data: [], error: null }),
    maybeSingle: async () => ({ data: null, error: null }),
    insert: async () => ({ data: null, error: new Error(msg) }),
    upsert: async () => ({ data: null, error: new Error(msg) }),
  });

  const functionsStub = {
    async invoke() {
      throw new Error(msg);
    },
  };

  supabase = {
    auth: authStub,
    from: fromStub,
    functions: functionsStub,
  };

} else {
  supabase = createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
}

export { supabase };
export default supabase;
