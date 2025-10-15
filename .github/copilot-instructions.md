## Quick context

This is a small React + Vite single-page app that uses Supabase (auth, Postgres, Realtime, Functions).
Key pieces live under `src/` and the backend function sources (serverless) are in `supabase/functions/`.

Top-level scripts (see `package.json`):
- `npm run dev` — start Vite dev server
- `npm run build` — produce a production build
- `npm run preview` — serve the built app locally
- `npm run lint` — run ESLint

Environment: the app expects VITE-prefixed env vars for Supabase:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

If these are missing the client throws early (see `src/lib/supabaseClient.js`).

## Big-picture architecture

- Frontend: React components in `src/` (pages under `src/pages`, UI in `src/components`).
- Auth: handled client-side with Supabase in `src/auth/AuthProvider.jsx`. Use `useAuth()` to access `session` and `loading`.
- API layer: `src/lib/api.js` contains higher-level helpers that talk to Postgres tables and Supabase Functions (`process-quiz`, `enrich-business`, `generate-pitch`).
- Supabase client: single exported client in `src/lib/supabaseClient.js`. Functions should use that client where possible.
- Data tables referenced (discoverable in `src/lib/api.js`): `profiles`, `socials`, `quiz_responses`, `business_matches`.
- Realtime: subscriptions use `supabase.channel(...).on('postgres_changes', ...)` (see `subscribeBusinessMatches`).

Why it's structured this way: frontend is authoritative for UI state but delegates heavy processing (scoring, enrichment) to Supabase Functions. The app often uses the JWT from `supabase.auth.getSession()` when calling functions directly.

## Project-specific conventions and patterns

- Use the shared `supabase` client from `src/lib/supabaseClient.js` for all DB and functions calls.
- Many `src/lib` helpers throw on errors — callers catch & show UI errors. Example: `insertQuizResponse`, `processQuiz`, `upsertProfileBasics`.
- The `api.js` helper uses a small `compact()` utility to strip undefined fields before upserting. Follow this pattern when building rows for Postgres.
- Empty-query sentinel: some selects use `.maybeSingle()` and tolerate `error.code === 'PGRST116'` as a non-fatal empty result — preserve that handling.
- Naming: codebase sometimes uses domain terms like `athleteId` (user) and `business_place_id` (external place id). Match those names in function parameters and payloads.
- Functions invocation: prefer `supabase.functions.invoke('fn-name', { body })` (returns structured `data`/`error`). When debugging, code falls back to direct fetch to `${VITE_SUPABASE_URL}/functions/v1/<name>` with Authorization headers.
- Local storage key for quiz progress: `rootd_quiz_v2` (see `src/pages/QuizPage.jsx`).
- Geolocation: `QuizPage` attempts to populate `lat`/`lng` with `navigator.geolocation` before submit.

## Common tasks & examples

- Submit quiz (pattern):

  - Normalize answers with `src/lib/quizMap.js` before sending.
  - Get a fresh access token via `const { data } = await supabase.auth.getSession(); const jwt = data.session?.access_token`.
  - Call function: `fetch(`${VITE_SUPABASE_URL}/functions/v1/process-quiz`, { method:'POST', headers: { 'content-type':'application/json', authorization: `Bearer ${jwt}` }, body: JSON.stringify(payload) })` or `supabase.functions.invoke('process-quiz', { body })`.

- Realtime subscription (example):

  - Use `supabase.channel(`bm_${athleteId}`)` and `.on('postgres_changes', { event: '*', schema: 'public', table: 'business_matches', filter: `athlete_id=eq.${athleteId}` }, handler)`.
  - Remember to unsubscribe / remove channel when component unmounts.

## Files to inspect when changing behavior

- `src/lib/supabaseClient.js` — single source of truth for client config (persistSession, autoRefreshToken, detectSessionInUrl).
- `src/lib/api.js` — API helpers and function callers. Good for adding new server interactions.
- `src/auth/AuthProvider.jsx` — session lifecycle and `useAuth()` hook used through the app.
- `src/pages/QuizPage.jsx` — illustrates frontend validation, local-storage progress, normalization, and function invocation flow.
- `supabase/functions/` — server-side function sources (deploy with Supabase CLI/console).

## Developer workflow notes

- Dev server: `npm run dev` (Vite). Watch for the custom `vite` override in `package.json` (`rolldown-vite`).
- Lint: `npm run lint`.
- No unit tests are present in the repository — add tests under a conventional test runner if needed.
- When testing function calls locally, either run Supabase Functions locally (Supabase CLI) or point env vars to an active Supabase project.

## Edge cases & gotchas

- Missing env vars cause immediate failure in `supabaseClient.js`.
- Some API helpers expect `userId` / `athleteId` present and will throw if absent — ensure the user is signed in before calling.
- When calling functions directly with fetch, ensure you set the `Authorization: Bearer <jwt>` header (not only apikey) if you need user-scoped behavior.

---

If anything is unclear or you want the instructions expanded (examples for adding a new function, running Supabase locally, or tests), tell me which area to expand and I will iterate.
