// Computes Rootd score, saves quiz_responses, fetches matches, upserts business_matches
// deno-lint-ignore-file no-explicit-any
// edge runtime types provided by Supabase during deployment
import { createClient } from "@supabase/supabase-js";

type Json = Record<string, any> | any[] | string | number | boolean | null;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "authorization,apikey,content-type",
};

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { "content-type": "application/json", ...CORS } });

const SUPABASE_URL = Deno.env.get("PROJECT_SUPABASE_URL") || Deno.env.get("SUPABASE_URL") || "";
const SERVICE_ROLE = Deno.env.get("PROJECT_SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

function normalizeAnswers(a: any = {}) {
  const f = a.following || {};
  const following = {
    instagram: Number(f.instagram ?? f.ig ?? 0) || 0,
    tiktok: Number(f.tiktok ?? 0) || 0,
    youtube: Number(f.youtube ?? f.yt ?? 0) || 0,
    x: Number(f.x ?? f.twitter ?? 0) || 0,
    linkedin: Number(f.linkedin ?? 0) || 0,
    facebook: Number(f.facebook ?? 0) || 0,
  };
  const totalFollowers = Object.values(following).reduce((s: number, n: any) => s + (Number(n) || 0), 0);

  return {
    following,
    engagement_rate: Math.max(0, Math.min(1, Number(a.engagement_rate ?? 0))),
    time_commitment: Math.max(0, Number(a.time_commitment ?? 0)),
    content_types: Array.isArray(a.content_types) ? a.content_types.slice(0, 6) : [],
    categories: Array.isArray(a.categories) ? a.categories.slice(0, 10) : [],
    audience_locality: Math.max(0, Math.min(1, Number(a.audience_locality ?? 0.5))),
    school: a.school ?? null,
    sport: a.sport ?? null,
    lat: typeof a.lat === "number" ? a.lat : null,
    lng: typeof a.lng === "number" ? a.lng : null,
    preferred_radius_miles: typeof a.preferred_radius_miles === "number" ? a.preferred_radius_miles : null,
    total_followers: totalFollowers,
  };
}

function scoreRootd(a: ReturnType<typeof normalizeAnswers>) {
  const R = Math.min(1, Math.log10((a.total_followers ?? 0) + 1) / 6);
  const E = Math.min(1, (a.engagement_rate ?? 0) / 0.10);
  const L = a.audience_locality ?? 0.5;
  const Rel = Math.min(1, 0.3 + 0.5 * Math.min(1, (a.time_commitment ?? 0) / 5) + 0.05);
  const D = Math.min(1, (new Set(a.content_types).size || 0) / 5);
  const rootd = 0.35 * R + 0.2 * E + 0.2 * L + 0.15 * Rel + 0.1 * D;
  return { rootd, components: { reach: R, engagement: E, locality: L, reliability: Rel, content_diversity: D } };
}

function scoreBusiness(b: any, topics: string[]) {
  const tset = new Set((topics || []).map((t) => String(t).toLowerCase()));
  const cat = String(b.category ?? "").toLowerCase();
  const name = String(b.name ?? "").toLowerCase();
  let s = 0;
  if (cat && tset.has(cat)) s += 0.45;
  if ([...tset].some((t) => name.includes(t))) s += 0.25;
  const rating = typeof b.rating === "number" ? b.rating : null;
  if (rating != null) s += Math.min(0.3, Math.max(0, (rating - 3.5) * 0.08));
  return Math.max(0, Math.min(1, s));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  if (req.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405);
  if (!SUPABASE_URL || !SERVICE_ROLE) return json({ ok: false, error: "missing_supabase_env" }, 500);

  const auth = req.headers.get("authorization") || "";
  if (!auth.startsWith("Bearer ")) return json({ ok: false, error: "missing_jwt" }, 401);
  let userId: string | null = null;
  try {
    const payload = JSON.parse(atob((auth.split(".")[1] || "").trim() || "e30="));
    userId = typeof payload?.sub === "string" ? payload.sub : null;
  } catch (_e) { /* ignore parse errors */ }
  if (!userId) return json({ ok: false, error: "invalid_jwt" }, 401);

  let body: { answers?: any } = {};
  try { body = await req.json(); } catch (_e) { /* ignore missing/invalid body */ }
  const normalized = normalizeAnswers(body?.answers || {});
  const { rootd, components } = scoreRootd(normalized);

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

  // Ensure a minimal profile row exists for this user so FK constraints pass.
  try {
    const { error: upsertErr } = await supabase.from("profiles").upsert({ id: userId }).select("id");
    if (upsertErr) return json({ ok: false, error: "profile_upsert_failed", detail: upsertErr.message }, 500);
  } catch (e) {
    return json({ ok: false, error: "profile_upsert_failed", detail: String(e) }, 500);
  }

  const insertPayload: Record<string, any> = {
    user_id: userId,
    version: 2,
    model_version: "athlete_v1_baseline",
    normalized: normalized as Json,
    rootd_score: rootd,
  };
  const { data: qr, error: qErr } = await supabase.from("quiz_responses").insert(insertPayload).select("id").single();
  if (qErr) return json({ ok: false, error: "quiz_insert_failed", detail: qErr.message }, 500);

  let matches: any[] = [];
  // Fallback to a default location when lat/lng are missing so users still get matches
  const hasGeo = typeof normalized.lat === "number" && typeof normalized.lng === "number";
  const origin = hasGeo ? { lat: normalized.lat, lng: normalized.lng } : { lat: 37.7749, lng: -122.4194 };
  if (hasGeo || !hasGeo) {
    const finderUrl = `${SUPABASE_URL}/functions/v1/find-businesses`;
    const finderBody = {
      lat: origin.lat,
      lng: origin.lng,
      radiusMiles: normalized.preferred_radius_miles ?? 10,
      topics: normalized.categories,
    };
    try {
      const resp = await fetch(finderUrl, {
        method: "POST",
        headers: { "content-type": "application/json", Authorization: `Bearer ${SERVICE_ROLE}`, apikey: SERVICE_ROLE },
        body: JSON.stringify(finderBody),
      });

      if (!resp.ok) {
        const text = await resp.text().catch(() => "");
        return json({ ok: false, error: "finder_failed", status: resp.status, detail: text }, 502);
      }

      const j = await resp.json().catch(() => ({}));
      const arr = Array.isArray(j?.results) ? j.results : [];
      matches = arr.map((c: any) => {
        const ms = scoreBusiness(c, normalized.categories);
        return {
          athlete_id: userId,
          business_place_id: c.business_place_id || c.place_id || null,
          name: c.name || "Business",
          category: c.category || (Array.isArray(c.types) ? c.types?.[0] ?? null : null),
          address: c.address || null,
          city: c.city || null,
          website: c.website || null,
          business_rating: typeof c.rating === "number" ? c.rating : null,
          types: c.types || null,
          match_score: ms,
          reason: `topic+rating score ${Math.round(ms * 100)}%`,
          source: c.source ?? "google_places",
          is_verified: c.is_verified ?? true,
          distance_meters: typeof c.distance_meters === "number" ? c.distance_meters : null,
          photo_url: c.photo_url ?? null,
          rootd_biz_score: ms,
          score_components: { topic_overlap: true, rating: c.rating ?? null },
          normalized: null,
        };
      });

      if (matches.length) {
        console.log("Attempting to upsert matches:", matches.length, matches);
        const { data, error } = await supabase.from("business_matches")
          .upsert(matches, { onConflict: "athlete_id,business_place_id" });
        console.log("Upsert result:", { data, error });
        if (error) {
          console.error("Upsert error:", error);
          return json({ ok: false, error: "matches_upsert_failed", detail: error.message }, 500);
        }
      }
    } catch (e) {
      return json({ ok: false, error: "finder_exception", detail: String(e) }, 500);
    }
  }

  const top = matches.slice().sort((a, b) => (b.match_score ?? 0) - (a.match_score ?? 0)).slice(0, 10);
  return json({
    ok: true,
    quiz_response_id: qr?.id ?? null,
    rootd_score: rootd,
    components,
    normalized,
    matches: top,
  });
});
