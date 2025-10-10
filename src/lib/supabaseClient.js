// src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// Read env from Vite (build-time) or optional window fallbacks (runtime overrides)
const url =
  import.meta.env?.VITE_SUPABASE_URL ||
  (typeof window !== 'undefined' && window.__SUPABASE_URL__) ||
  ''
const anonKey =
  import.meta.env?.VITE_SUPABASE_ANON_KEY ||
  (typeof window !== 'undefined' && window.__SUPABASE_ANON_KEY__) ||
  ''

// Helpful debug in the console so you can verify values are present
// (Key is partially redacted)
console.log('[Supabase env check]', {
  url,
  keyStartsWith: anonKey ? String(anonKey).slice(0, 10) : null,
  keyLength: anonKey ? String(anonKey).length : 0,
})

// Guard: give a clear error instead of the cryptic "supabaseUrl is required"
if (!url || !anonKey) {
  throw new Error(
    [
      'Missing Supabase env.',
      'Expected VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to be defined.',
      'Fix:',
      '  1) Ensure .env.local sits at the project root (same folder as package.json).',
      '  2) Variable names must start with VITE_:',
      '       VITE_SUPABASE_URL=https://<project>.supabase.co',
      '       VITE_SUPABASE_ANON_KEY=<anon-jwt>',
      '  3) Fully restart Vite after edits: ctrl+c then `npm run dev`.',
      '  4) Hard refresh the browser (Cmd+Shift+R).',
    ].join('\n')
  )
}

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'rootd-auth',
  },
  global: {
    headers: {
      'x-application-name': 'rootd-app',
    },
  },
})

export default supabase

