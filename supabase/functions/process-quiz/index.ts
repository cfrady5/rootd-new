// supabase/functions/process-quiz/index.ts
// deno-lint-ignore-file no-explicit-any no-unversioned-import
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/* ---------- types ---------- */
type Json = Record<string, any> | any[] | string | number | boolean | null;

interface QuizRow {
  id: string;
  user_id?: string | null;
  created_at?: string | null;
  [k: string]: unknown;
}

interface BusinessMatchInput {
  // from find-businesses
  business_place_id?: string | null; // preferred
  place_id?: string | null; // fallback
  name?: string | null;
  category?: string | null;
  address?: string | null;
  city?: string | null;
  website?: string | null;
  rating?: number | null;
  types?: string[] | null;

  // verification + extras
  source?: string | null;              // "google_places"
  is_verified?: boolean | null;        // true
  distance_meters?: number | null;
  photo_url?: string | null;
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

  // columns below are optional in your schema; keep if present
  source?: string | null;
  is_verified?: boolean | null;
  distance_meters?: number | null;
  photo_url?: string | null;
}

/* ---------- constants ---------- */
const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, apikey, content-type, x-client-info, x-application-name, x-requested-with, accept, origin, referer",
  "Access-Control-Expose-Headers":
    "content-type, content-length, x-client-info, x-application-name",
  Vary: "Origin",
};

const SUPABASE_URL =
  Deno.env.get("PROJECT_SUPABASE_URL") || Deno.env.get("SUPABASE_URL") || "";
const SERVICE_ROLE =
  Deno.env.get("PROJECT_SUPABASE_SERVICE_ROLE_KEY") ||
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
  "";

/* ---------- helpers ---------- */
function r(body: unknown, init: ResponseInit = {}) {
  const headers = new Headers({
    "Content-Type": "application/json",
    ...CORS,
    ...(init.headers ?? {}),
  });
  return new Response(JSON.stringify(body), { ...init, headers });
}
const ok = (data: unknown) =>
  r({ ok: true, ...((typeof data === "object" && data) || { data }) });
const fail = (error: string, detail?: unknown, status = 400) =>
  r({ ok: false, error, detail }, { status });

const J_CANDIDATES = [
  "response",
  "answers",
  "data",
  "payload",
  "result",
  "quiz",
  "form",
  "content",
];

function pickJsonPayload(row: Record<string, unknown>): Json | null {
  for (const key of J_CANDIDATES) {
    const v = row[key];
    if (v && (typeof v === "object" || typeof v === "string")) {
      try {
        if (typeof v === "string") {
          const parsed = JSON.parse(v);
          if (parsed && typeof parsed === "object") return parsed as Json;
        } else {
          return v as Json;
        }
      } catch {}
    }
  }
  return null;
}

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
      return Array.isArray(j) ? (j as T[]) : [];
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

function normalizeQuiz(response: any) {
  const pick = (obj: any, ...paths: string[]) =>
    paths
      .map((p) =>
        p.split(".").reduce((acc, k) => (acc ? (acc as any)[k] : undefined), obj)
      )
      .find((x) => x !== undefined);

  const prefs =
    pick(
      response,
      "preferences",
      "answers.preferences",
      "data.preferences",
      "quiz.preferences"
    ) || {};

  const location =
    pick(
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
    pick(response, "athlete.school", "profile.school", "answers.school", "user.school")
  );
  const sport = str(
    pick(response, "athlete.sport", "profile.sport", "answers.sport", "user.sport")
  );
  const persona = str(
    pick(response, "athlete.persona_summary", "answers.persona_summary", "profile.persona_summary")
  );

  const lat = num((location as any)?.lat ?? (location as any)?.latitude);
  const lng = num((location as any)?.lng ?? (location as any)?.longitude);
  const city = str((location as any)?.city || (location as any)?.locality);

  const topicSignals = uniq(
    [
      ...categories,
      ...industries,
      ...keywords,
      str((prefs as any)?.niche),
      str((prefs as any)?.primary_category),
    ].filter(Boolean) as string[]
  );

  return {
    categories,
    industries,
    keywords,
    topics: topicSignals,
    radiusMiles: radius,
    lat,
    lng,
    city,
    school,
    sport,
    persona,
  };
}

function scoreBusiness(
  biz: BusinessMatchInput,
  prefs: ReturnType<typeof normalizeQuiz>
) {
  let score = 0;

  const cat = (biz.category || "").toLowerCase();
  const name = (biz.name || "").toLowerCase();
  const types = (biz.types || []).map((t) => (t || "").toLowerCase());
  const topicSet = new Set(prefs.topics.map((t) => t.toLowerCase()));

  if (cat && topicSet.has(cat)) score += 0.35;
  if (types.some((t) => topicSet.has(t))) score += 0.25;
  if ([...topicSet].some((t) => name.includes(t))) score += 0.15;

  if (
    prefs.city &&
    biz?.address &&
    biz.address.toLowerCase().includes(prefs.city.toLowerCase())
  ) {
    score += 0.1;
  }
  if (typeof biz.rating === "number") {
    score += Math.min(0.15, Math.max(0, (biz.rating - 3.5) * 0.05));
  }

  return Math.max(0, Math.min(1, score));
}

/* ---------- main ---------- */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: new Headers(CORS) });
  }
  if (req.method !== "POST") return fail("Method not allowed", undefined, 405);
  if (!SUPABASE_URL || !SERVICE_ROLE) return fail("Missing Supabase env");

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

  type Body = {
    quizResponseId?: string;
    athleteId?: string;
    userId?: string; // alias
    lat?: number;
    lng?: number;
    radiusMiles?: number;
    radius_miles?: number;
  };

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return fail("Invalid JSON body");
  }
  if (!body?.quizResponseId) return fail("quizResponseId is required");

  // load quiz
  const { data: quiz, error: qErr } = await supabase
    .from("quiz_responses")
    .select("*")
    .eq("id", body.quizResponseId)
    .maybeSingle<QuizRow>();
  if (qErr) return fail("quiz_responses lookup failed", qErr.message);
  if (!quiz) return fail("quiz response not found");

  // resolve athlete_id
  const idFromBody =
    (typeof body.athleteId === "string" && body.athleteId) ||
    (typeof body.userId === "string" && body.userId) ||
    null;
  const idFromQuiz = typeof quiz?.user_id === "string" ? (quiz.user_id as string) : null;

  let idFromJwt: string | null = null;
  const auth = req.headers.get("authorization") || "";
  if (!idFromBody && !idFromQuiz && auth.startsWith("Bearer ")) {
    try {
      const payload = JSON.parse(atob((auth.split(".")[1] || "").trim() || "e30="));
      idFromJwt = typeof payload?.sub === "string" ? payload.sub : null;
    } catch {}
  }
  const athleteId = idFromBody || idFromQuiz || idFromJwt;
  if (!athleteId) {
    return fail("athlete_id missing", {
      hint: "Pass athleteId in request body or ensure quiz.user_id is set.",
      got: { bodyAthleteId: idFromBody, quizUserId: idFromQuiz },
    });
  }

  // normalize quiz
  const payload = pickJsonPayload(quiz as Record<string, unknown>);
  if (!payload) {
    return fail("quiz payload column not found", { tried: J_CANDIDATES, columns: Object.keys(quiz || {}) });
  }
  const prefs = normalizeQuiz(payload || {});

  // resolve location
  const lat = num(body.lat ?? prefs.lat);
  const lng = num(body.lng ?? prefs.lng);
  const radiusMiles = num(body.radiusMiles ?? body.radius_miles) ?? prefs.radiusMiles ?? 10;

  if (typeof lat !== "number" || typeof lng !== "number") {
    return fail("location_required", {
      message: "lat and lng are required to search for businesses",
      got: { bodyLat: body.lat, bodyLng: body.lng, quizLat: prefs.lat, quizLng: prefs.lng },
    });
  }

  // call finder
  const finderUrl = `${SUPABASE_URL}/functions/v1/find-businesses`;
  const finderPayload = {
    lat,
    lng,
    radiusMiles,
    topics: prefs.topics || [],
    categories: prefs.categories || [],
    industries: prefs.industries || [],
    keywords: prefs.keywords || [],
    city: prefs.city ?? null,
    school: prefs.school ?? null,
    sport: prefs.sport ?? null,
  };

  let candidates: BusinessMatchInput[] = [];
  let finderStatus: { ok: boolean; status?: number; error?: string } = { ok: true };

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
      finderStatus = { ok: false, status: resp.status, error: await resp.text() };
      candidates = [];
    } else {
      const j = await resp.json();
      const arr = Array.isArray(j?.results) ? j.results : Array.isArray(j) ? j : [];
      candidates = arr as BusinessMatchInput[];
    }
  } catch (e) {
    finderStatus = { ok: false, error: (e as Error)?.message || "finder request failed" };
    candidates = [];
  }

  // keep only verified Google Places with an id
  const verified = (Array.isArray(candidates) ? candidates : [])
    .filter(
      (c) =>
        c &&
        c.source === "google_places" &&
        c.is_verified === true &&
        ((c.business_place_id && c.business_place_id.length > 0) ||
          (c.place_id && c.place_id.length > 0))
    );

  if (verified.length === 0) {
    return ok({
      athlete_id: athleteId,
      used_location: { lat, lng, radiusMiles },
      topics: prefs.topics,
      count_saved: 0,
      matches: [],
      debug: { finderStatus, finderPayload },
    });
  }

  // score and build rows
  const rows: BusinessMatchRow[] = verified.slice(0, 50).map((c) => {
    const score = scoreBusiness(c, prefs);
    const reasonBits: string[] = [];
    if (prefs.city && (c.address || "").toLowerCase().includes((prefs.city || "").toLowerCase()))
      reasonBits.push(`near ${prefs.city}`);
    if (c.category && prefs.topics?.map((t) => t.toLowerCase()).includes(c.category.toLowerCase()))
      reasonBits.push(`category match: ${c.category}`);
    if (typeof c.rating === "number" && c.rating >= 4.2) reasonBits.push(`high rating ${c.rating.toFixed(1)}`);

    const reason = reasonBits.length
      ? `Matched on ${reasonBits.join(", ")}`
      : `Match score ${(score * 100).toFixed(0)}%`;

    return {
      athlete_id: athleteId,
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
      // optional columns
      source: c.source ?? "google_places",
      is_verified: c.is_verified ?? true,
      distance_meters: typeof c.distance_meters === "number" ? c.distance_meters : null,
      photo_url: c.photo_url ?? null,
    };
  });

  // persist (requires unique index on (athlete_id, business_place_id))
  const { error: upErr } = await supabase
    .from("business_matches")
    .upsert(rows, { onConflict: "athlete_id,business_place_id" });

  if (upErr) {
    return fail("business_matches upsert failed", upErr.message);
  }

  // return top and debug echo
  const top = rows
    .slice()
    .sort((a, b) => (b.match_score ?? 0) - (a.match_score ?? 0))
    .slice(0, 10);

  return ok({
    athlete_id: athleteId,
    used_location: { lat, lng, radiusMiles },
    topics: prefs.topics,
    count_saved: rows.length,
    matches: top,
    debug: { finderStatus, finderPayload },
  });
});
