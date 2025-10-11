// supabase/functions/process-quiz/index.ts
// deno-lint-ignore-file no-explicit-any no-unversioned-import
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Json = Record<string, any> | any[] | string | number | boolean | null;

interface QuizRow {
  id: string;
  athlete_id?: string | null;
  user_id?: string | null; // legacy
  created_at?: string;
  response: Json | null;
}

interface BusinessMatchInput {
  place_id?: string | null;
  business_place_id?: string | null;
  name?: string | null;
  category?: string | null;
  address?: string | null;
  city?: string | null;
  website?: string | null;
  rating?: number | null;
  types?: string[] | null;
}

interface BusinessMatchRow extends Required<Pick<BusinessMatchInput, "name">> {
  athlete_id: string;
  business_place_id: string | null;
  category: string | null;
  address: string | null;
  city: string | null;
  website: string | null;
  business_rating: number | null;
  types: string[] | null;
  match_score: number | null;
  reason: string | null;
}

const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  Vary: "Origin",
};

const SUPABASE_URL =
  Deno.env.get("PROJECT_SUPABASE_URL") ||
  Deno.env.get("SUPABASE_URL") ||
  "";
const SERVICE_ROLE =
  Deno.env.get("PROJECT_SUPABASE_SERVICE_ROLE_KEY") ||
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
  "";
const OPENAI = Deno.env.get("OPENAI_API_KEY") || ""; // optional (scoring/explanations)

function r(body: unknown, init: ResponseInit = {}) {
  const headers = new Headers({
    "Content-Type": "application/json",
    ...CORS,
    ...(init.headers ?? {}),
  });
  return new Response(JSON.stringify(body), { ...init, headers });
}
const ok = (data: unknown) => r({ ok: true, ...((typeof data === "object" && data) || { data }) });
const fail = (error: string, detail?: unknown, status = 400) =>
  r({ ok: false, error, detail }, { status });

/* ----------------------------- helpers ----------------------------- */

function str(v: unknown): string | undefined {
  if (v == null) return undefined;
  const s = String(v).trim();
  return s.length ? s : undefined;
}
function asArr<T = unknown>(v: unknown): T[] {
  if (Array.isArray(v)) return v as T[];
  if (v == null) return [];
  try {
    if (typeof v === "string") {
      const j = JSON.parse(v);
      return Array.isArray(j) ? j : [];
    }
  } catch {}
  return [];
}
function num(v: unknown): number | undefined {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}
function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr.filter((x) => x != null)));
}

/** NEW QUIZ SCHEMA NORMALIZER
 * Handles both old and new quiz payloads.
 * We try a series of likely paths and merge.
 */
function normalizeQuiz(response: any) {
  // flat helpers
  const pick = (obj: any, ...paths: string[]) =>
    paths
      .map((p) => p.split(".").reduce((acc, k) => (acc ? acc[k] : undefined), obj))
      .find((x) => x !== undefined);

  // Common fields in new schema
  const prefs = pick(
    response,
    "preferences",
    "answers.preferences",
    "data.preferences",
    "quiz.preferences"
  ) || {};

  const location = pick(
    response,
    "location",
    "answers.location",
    "meta.location",
    "preferences.location"
  ) || {};

  const categories =
    asArr<string>(
      pick(
        response,
        "preferences.categories",
        "preferences.categories_selected",
        "answers.categories",
        "answers.selected_categories",
        "data.categories"
      )
    ) || [];

  const industries =
    asArr<string>(
      pick(
        response,
        "preferences.industries",
        "answers.industries",
        "data.industries"
      )
    ) || [];

  const keywords =
    asArr<string>(
      pick(
        response,
        "preferences.keywords",
        "answers.keywords",
        "data.keywords",
        "quiz.keywords"
      )
    ) || [];

  const budget = num(
    pick(
      response,
      "preferences.budget",
      "answers.budget.min",
      "answers.budget",
      "data.budget"
    )
  );

  const radius =
    num(
      pick(
        response,
        "preferences.radius_miles",
        "preferences.radius",
        "answers.radius_miles",
        "answers.radius",
        "data.radius_miles"
      )
    ) ?? 10;

  const school = str(
    pick(
      response,
      "athlete.school",
      "profile.school",
      "answers.school",
      "user.school"
    )
  );

  const sport = str(
    pick(
      response,
      "athlete.sport",
      "profile.sport",
      "answers.sport",
      "user.sport"
    )
  );

  const persona = str(
    pick(
      response,
      "athlete.persona_summary",
      "answers.persona_summary",
      "profile.persona_summary"
    )
  );

  // location
  const lat = num(location?.lat ?? location?.latitude);
  const lng = num(location?.lng ?? location?.longitude);
  const city = str(location?.city || location?.locality);

  // Merge & dedupe topic signals
  const topicSignals = uniq([
    ...categories,
    ...industries,
    ...keywords,
    str(prefs?.niche),
    str(prefs?.primary_category),
  ].filter(Boolean) as string[]);

  return {
    categories,
    industries,
    keywords,
    topics: topicSignals,
    budget,
    radiusMiles: radius,
    lat,
    lng,
    city,
    school,
    sport,
    persona,
  };
}

/** Score a candidate business vs. quiz prefs (lightweight, local) */
function scoreBusiness(biz: BusinessMatchInput, prefs: ReturnType<typeof normalizeQuiz>) {
  let score = 0;

  const cat = (biz.category || "").toLowerCase();
  const name = (biz.name || "").toLowerCase();
  const types = (biz.types || []).map((t) => (t || "").toLowerCase());
  const topicSet = new Set(prefs.topics.map((t) => t.toLowerCase()));

  if (cat && topicSet.has(cat)) score += 0.35;
  if (types.some((t) => topicSet.has(t))) score += 0.25;
  if ([...topicSet].some((t) => name.includes(t))) score += 0.15;

  // slight boost for city match
  if (prefs.city && biz?.address && biz.address.toLowerCase().includes(prefs.city.toLowerCase())) {
    score += 0.1;
  }

  // rating signal
  if (typeof biz.rating === "number") {
    score += Math.min(0.15, Math.max(0, (biz.rating - 3.5) * 0.05)); // 4.5 ~ +0.05, cap 0.15
  }

  return Math.max(0, Math.min(1, score));
}

/* ------------------------------- main ------------------------------- */

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: new Headers(CORS) });
  }
  if (req.method !== "POST") return fail("Method not allowed", undefined, 405);

  if (!SUPABASE_URL || !SERVICE_ROLE) return fail("Missing Supabase env");

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

  let body: {
    quizResponseId?: string;
    athleteId?: string;
    lat?: number;
    lng?: number;
    radiusMiles?: number;
  };
  try {
    body = await req.json();
  } catch {
    return fail("Invalid JSON body");
  }

  // Prefer explicit athleteId from body; else derive from auth (if present)
  const auth = req.headers.get("authorization") || "";
  const jwt = auth.startsWith("Bearer ") ? auth.slice(7) : undefined;
  let athleteId = body.athleteId;
  if (!athleteId && jwt) {
    try {
      // decode WITHOUT verifying to read sub (Edge runtime has no jose by default)
      const payload = JSON.parse(atob(jwt.split(".")[1] || ""));
      athleteId = payload?.sub;
    } catch {}
  }

  // Load quiz row
  if (!body?.quizResponseId) return fail("quizResponseId is required");
  const { data: quiz, error: qErr } = await supabase
    .from("quiz_responses")
    .select("id, athlete_id, user_id, response, created_at")
    .eq("id", body.quizResponseId)
    .maybeSingle<QuizRow>();
  if (qErr) return fail("quiz_responses lookup failed", qErr.message);
  if (!quiz) return fail("quiz response not found");

  // Resolve athlete id (prefer quiz row)
  const resolvedAthleteId =
    quiz.athlete_id ||
    quiz.user_id || // legacy
    athleteId;
  if (!resolvedAthleteId) return fail("athlete_id missing (supply athleteId or ensure quiz.athlete_id)");

  // Normalize quiz (NEW SCHEMA SUPPORT)
  const prefs = normalizeQuiz(quiz.response || {});
  const lat = body.lat ?? prefs.lat;
  const lng = body.lng ?? prefs.lng;
  const radiusMiles = body.radiusMiles ?? prefs.radiusMiles ?? 10;

  // Call internal finder (your existing function) to get candidates
  // It should accept a flexible payload; we pass topics/categories/industries and location.
  const finderUrl = `${SUPABASE_URL}/functions/v1/find-businesses`;
  const finderPayload = {
    lat,
    lng,
    radiusMiles,
    topics: prefs.topics,
    categories: prefs.categories,
    industries: prefs.industries,
    keywords: prefs.keywords,
    city: prefs.city,
    school: prefs.school,
    sport: prefs.sport,
  };

  let candidates: BusinessMatchInput[] = [];
  try {
    const resp = await fetch(finderUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SERVICE_ROLE,
        Authorization: `Bearer ${SERVICE_ROLE}`,
      },
      body: JSON.stringify(finderPayload),
    });
    if (!resp.ok) {
      const text = await resp.text();
      return fail("find-businesses error", { status: resp.status, body: text });
    }
    const j = await resp.json();
    const arr = Array.isArray(j?.results) ? j.results : Array.isArray(j) ? j : [];
    candidates = arr as BusinessMatchInput[];
  } catch (e) {
    // If the finder is unavailable, proceed with empty -> nothing to insert
    console.warn("find-businesses request failed:", (e as Error)?.message);
    candidates = [];
  }

  // Score & prepare rows
  const rows: BusinessMatchRow[] = candidates.slice(0, 50).map((c) => {
    const score = scoreBusiness(c, prefs);
    const reasonBits: string[] = [];
    if (prefs.city && (c.address || "").toLowerCase().includes(prefs.city.toLowerCase())) {
      reasonBits.push(`near ${prefs.city}`);
    }
    if (c.category && prefs.topics?.map((t) => t.toLowerCase()).includes(c.category.toLowerCase())) {
      reasonBits.push(`category match: ${c.category}`);
    }
    if (typeof c.rating === "number" && c.rating >= 4.2) reasonBits.push(`high rating ${c.rating.toFixed(1)}`);

    const reason = reasonBits.length
      ? `Matched on ${reasonBits.join(", ")}`
      : `Match score ${(score * 100).toFixed(0)}%`;

    return {
      athlete_id: resolvedAthleteId!,
      business_place_id: c.business_place_id || c.place_id || null,
      name: c.name || "Business",
      category: c.category || (Array.isArray(c.types) ? c.types?.[0] ?? null : null),
      address: c.address || null,
      city: c.city || null,
      website: c.website || null,
      business_rating: typeof c.rating === "number" ? c.rating : null,
      types: c.types || null,
      match_score: score,
      reason,
    };
  });

  // Upsert into business_matches (wipe recent batch for this athlete to keep list fresh)
  // Assumes table columns: athlete_id, business_place_id, name, category, address, city, website,
  //                        business_rating, types, match_score, reason, created_at
  // If you have a composite unique key on (athlete_id, business_place_id), we can upsert on conflict.
  if (rows.length > 0) {
    const { error: upErr } = await supabase
      .from("business_matches")
      .upsert(rows, { onConflict: "athlete_id,business_place_id" });
    if (upErr) return fail("business_matches upsert failed", upErr.message);
  }

  // Return top 10 back to client
  const top = rows
    .sort((a, b) => (b.match_score ?? 0) - (a.match_score ?? 0))
    .slice(0, 10);

  return ok({
    athlete_id: resolvedAthleteId,
    used_location: { lat, lng, radiusMiles },
    topics: prefs.topics,
    count_saved: rows.length,
    matches: top,
  });
});
