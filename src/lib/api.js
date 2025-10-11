// src/lib/api.js
import { supabase } from "./supabaseClient.js";

/* --------------------------- Utils --------------------------- */
function compact(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
}
async function getAccessToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || "";
}

/* ------------------------- Profiles ------------------------- */
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

export async function upsertProfileBasics(userId, basics) {
  const patch = compact({
    id: userId,
    full_name: basics.full_name ?? null,
    email: basics.email ?? null,
    school: basics.school ?? null,
    preferred_radius_miles: basics.preferred_radius_miles ?? 10,
    photo_url: basics.photo_url ?? null,
  });

  const { data, error } = await supabase
    .from("profiles")
    .upsert(patch, { onConflict: "id" })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

/* -------------------------- Socials ------------------------- */
export async function getSocials(userId) {
  const { data, error } = await supabase
    .from("socials")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error && error.code !== "PGRST116") throw error;

  const row = data || {};
  return {
    instagram: { handle: row.instagram_handle || "", followers: row.instagram_followers || 0 },
    tiktok: { handle: row.tiktok_handle || "", followers: row.tiktok_followers || 0 },
    youtube: { handle: row.youtube_handle || "", followers: row.youtube_followers || 0 },
    twitter: { handle: row.twitter_handle || "", followers: row.twitter_followers || 0 },
    facebook: { handle: row.facebook_handle || "", followers: row.facebook_followers || 0 },
    linkedin: { handle: row.linkedin_handle || "", followers: row.linkedin_followers || 0 },
  };
}

export async function upsertSocials(userId, socials) {
  const payload = compact({
    user_id: userId,
    instagram_handle: socials.instagram?.handle || null,
    instagram_followers: Number(socials.instagram?.followers || 0),
    tiktok_handle: socials.tiktok?.handle || null,
    tiktok_followers: Number(socials.tiktok?.followers || 0),
    youtube_handle: socials.youtube?.handle || null,
    youtube_followers: Number(socials.youtube?.followers || 0),
    twitter_handle: socials.twitter?.handle || null,
    twitter_followers: Number(socials.twitter?.followers || 0),
    facebook_handle: socials.facebook?.handle || null,
    facebook_followers: Number(socials.facebook?.followers || 0),
    linkedin_handle: socials.linkedin?.handle || null,
    linkedin_followers: Number(socials.linkedin?.followers || 0),
  });

  const { error } = await supabase.from("socials").upsert(payload, { onConflict: "user_id" });
  if (error) throw error;
  return getSocials(userId);
}

/* --------------------------- Quiz --------------------------- */
export async function getLatestQuizResponse(userId) {
  const { data, error } = await supabase
    .from("quiz_responses")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error && error.code !== "PGRST116") throw error;
  return data || null;
}

export async function insertQuizResponse(userId, answers, meta = {}) {
  if (!userId) throw new Error("insertQuizResponse: userId required");
  if (!answers || typeof answers !== "object") {
    throw new Error("insertQuizResponse: answers (object) required");
  }

  const row = compact({
    user_id: userId,
    answers, // jsonb NOT NULL
    school: meta.school ?? null,
    preferred_radius_miles: meta.preferred_radius_miles ?? null,
    lat: meta.lat ?? null,
    lng: meta.lng ?? null,
  });

  const { data, error } = await supabase
    .from("quiz_responses")
    .insert(row)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

/* --------------------- Business Matches --------------------- */
// NOTE: process-quiz persists athlete_id
export async function getBusinessMatches(athleteId, limit = 20) {
  const { data, error } = await supabase
    .from("business_matches")
    .select("*")
    .eq("athlete_id", athleteId)
    .order("match_score", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export function subscribeBusinessMatches(athleteId, onChange) {
  const ch = supabase
    .channel(`bm_${athleteId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "business_matches", filter: `athlete_id=eq.${athleteId}` },
      () => onChange?.()
    )
    .subscribe();
  return () => supabase.removeChannel(ch);
}

export function mergeMatches(existing = [], incoming = []) {
  const key = (m) => m.business_place_id || m.place_id || m.id || m.name;
  const map = new Map(existing.map((m) => [key(m), m]));
  for (const m of incoming) map.set(key(m), m);
  return [...map.values()].sort((a, b) => (b.match_score ?? 0) - (a.match_score ?? 0));
}

/* ---------------------- Edge: process-quiz ------------------ */
export async function processQuiz(userId, opts = {}) {
  if (!userId) throw new Error("processQuiz: userId required");
  const { quizResponseId, lat, lng, radiusMiles } = opts;

  const body = {
    athleteId: userId,
    quizResponseId: quizResponseId || null,
    lat: typeof lat === "number" ? lat : null,
    lng: typeof lng === "number" ? lng : null,
    radiusMiles: typeof radiusMiles === "number" ? radiusMiles : 10,
  };

  // Invoke through functions client
  const { data, error } = await supabase.functions.invoke("process-quiz", { body });
  if (error) {
    // Try raw call for clearer JSON error
    try {
      const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-quiz`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: anon, Authorization: `Bearer ${anon}` },
        body: JSON.stringify(body),
      });
      const j = await res.json().catch(() => null);
      console.error("[process-quiz:error-body]", j);
    } catch {}
    throw new Error(`process-quiz ${error.status || ""}: ${JSON.stringify(error)} | body=${JSON.stringify(body)}`);
  }

  // Surface debug in console so you can see why count is 0
  if (data && typeof data === "object") {
    console.log("[process-quiz:resp]", {
      ok: data.ok,
      count_saved: data.count_saved,
      matches_len: Array.isArray(data.matches) ? data.matches.length : null,
      used_location: data.used_location,
      debug: data.debug || null,
    });
  }

  return data;
}

/* ------------------- Edge: enrich-business ------------------ */
export async function enrichBusiness({
  athlete_id,
  business_place_id,
  update_businesses_table = false,
  business_id = null,
}) {
  if (!athlete_id) throw new Error("enrichBusiness: athlete_id required");
  if (!business_place_id) throw new Error("enrichBusiness: business_place_id required");

  const { data, error } = await supabase.functions.invoke("enrich-business", {
    body: { athlete_id, business_place_id, update_businesses_table, business_id },
  });
  if (error) throw error;
  return data;
}

/* ------------------- Edge: generate-pitch ------------------- */
export async function generatePitchDraft({
  athlete_id,
  business_id = null,
  business_place_id = null,
  name = null,
  category = null,
  address = null,
  channel = "email",
}) {
  if (!athlete_id) throw new Error("generatePitchDraft: athlete_id required");

  const body = compact({
    athlete_id,
    business_id,
    business_place_id,
    name,
    category,
    address,
    channel,
  });

  const { data, error } = await supabase.functions.invoke("generate-pitch", { body });
  if (error) throw error;
  return data;
}
