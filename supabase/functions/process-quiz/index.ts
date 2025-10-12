// supabase/functions/process-quiz/index.ts
// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/* ========= env ========= */
const SUPABASE_URL =
  Deno.env.get("PROJECT_SUPABASE_URL") || Deno.env.get("SUPABASE_URL") || "";
const SERVICE_ROLE =
  Deno.env.get("PROJECT_SUPABASE_SERVICE_ROLE_KEY") ||
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
  "";

/* ========= cors / responses ========= */
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, apikey, content-type, x-client-info, x-application-name, x-requested-with, accept, origin, referer",
  "Access-Control-Expose-Headers": "content-type, content-length",
  Vary: "Origin",
};
function J(body: unknown, init: ResponseInit = {}) {
  const headers = new Headers({ "content-type": "application/json", ...CORS, ...(init.headers ?? {}) });
  return new Response(JSON.stringify(body), { ...init, headers });
}
const ok = (data: unknown) => J({ ok: true, ...((typeof data === "object" && data) || { data }) });
const err = (message: string, detail?: unknown, status = 400) => J({ ok: false, error: message, detail }, { status });

/* ========= math helpers ========= */
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const log10 = (x: number) => Math.log(x) / Math.LN10;

/* ========= scoring ========= */
type Norm = {
  athlete_tier: string;
  time_commitment: number;          // 1..5
  content_types: string[];
  categories: string[];
  audience_locality: number;        // 0..1
  following: Record<string, number>;
  engagement_rate: number;          // 0..1
  school?: string | null;
  preferred_radius_miles?: number | null;
  lat?: number | null;
  lng?: number | null;
};

function calcScore(norm: Norm) {
  const totalFollowers = Object.values(norm.following || {}).reduce((a, b) => a + (Number(b) || 0), 0);
  const reach = clamp01(log10(totalFollowers + 1) / 6);

  const engagement = clamp01(Number(norm.engagement_rate || 0));
  const locality = clamp01(Number(norm.audience_locality ?? 0.5));

  const tier = String(norm.athlete_tier || "d1").toLowerCase();
  const tierWeight: Record<string, number> = { hs: 0.2, juco: 0.3, d3: 0.4, d2: 0.5, naia: 0.45, d1: 0.7 };
  const tWeight = tierWeight[tier] ?? 0.5;

  const t = Number(norm.time_commitment || 3); // 1..5
  const timeFactor = clamp01((6 - t) / 5);

  const reliability = clamp01(tWeight * 0.7 + timeFactor * 0.3);

  const ct = Array.isArray(norm.content_types) ? new Set(norm.content_types).size : 0;
  const content_diversity = clamp01(ct / 5);

  const rootd =
    0.30 * reach +
    0.25 * engagement +
    0.20 * locality +
    0.15 * reliability +
    0.10 * content_diversity;

  return {
    components: { reach, engagement, locality, reliability, content_diversity },
    rootd: clamp01(rootd),
  };
}

/* ========= normalization guard ========= */
function mergeNorm(input: any): Norm {
  const n = (v: any, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);
  const sArr = (v: any) => (Array.isArray(v) ? [...new Set(v)].slice(0, 20) : []);
  const followingObj = typeof input?.following === "object" && input.following ? input.following : {};
  const following: Record<string, number> = {};
  for (const k of ["ig", "tiktok", "yt", "x", "linkedin", "facebook"]) {
    following[k] = n(followingObj[k], 0);
  }

  return {
    athlete_tier: String(input?.athlete_tier || "d1").toLowerCase(),
    time_commitment: Math.max(1, Math.min(5, n(input?.time_commitment, 3))),
    content_types: sArr(input?.content_types),
    categories: sArr(input?.categories).slice(0, 10),
    audience_locality: clamp01(n(input?.audience_locality, 0.5)),
    following,
    engagement_rate: clamp01(n(input?.engagement_rate, 0.05)),
    school: typeof input?.school === "string" ? input.school : null,
    preferred_radius_miles: Number.isFinite(Number(input?.preferred_radius_miles))
      ? Number(input.preferred_radius_miles)
      : null,
    lat: Number.isFinite(Number(input?.lat)) ? Number(input.lat) : null,
    lng: Number.isFinite(Number(input?.lng)) ? Number(input.lng) : null,
  };
}

/* ========= main ========= */
const QUIZ_VERSION = 1;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: new Headers(CORS) });
  if (req.method !== "POST") return err("Method not allowed", undefined, 405);
  if (!SUPABASE_URL || !SERVICE_ROLE) return err("Missing Supabase env");

  // auth: user JWT required
  const auth = req.headers.get("authorization") || "";
  const jwt = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!jwt) return err("Unauthorized", undefined, 401);

  // user-scoped client (RLS enforced via Authorization header)
  const supa = createClient(SUPABASE_URL, SERVICE_ROLE, {
    global: { headers: { Authorization: `Bearer ${jwt}` } },
  });
  const { data: userRes } = await supa.auth.getUser();
  const uid = userRes?.user?.id;
  if (!uid) return err("Unauthorized", undefined, 401);

  // body
  let body: any = null;
  try { body = await req.json(); } catch { return err("Bad JSON"); }
  const raw = body?.answers ?? body; // support {answers:{...}} or plain

  // normalize and score
  const normalized = mergeNorm(raw || {});
  const { components, rootd } = calcScore(normalized);

  // persist
  const { data, error } = await supa
    .from("quiz_responses")
    .insert([{
      user_id: uid,
      answers: raw || {},
      normalized,
      version: QUIZ_VERSION,
      rootd_score: Number(rootd),
      school: normalized.school,
      preferred_radius_miles: normalized.preferred_radius_miles,
      lat: normalized.lat,
      lng: normalized.lng,
    }])
    .select("id, created_at")
    .single();

  if (error) return err("insert_failed", error.message, 400);

  // respond
  return ok({
    quiz_response_id: data.id,
    version: QUIZ_VERSION,
    rootd_score: Number(rootd),
    components,
    normalized,
  });
});
