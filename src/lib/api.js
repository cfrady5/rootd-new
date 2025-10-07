// src/lib/api.js
import { supabase } from "./supabaseClient.js";

/* Utility: remove undefined to avoid schema errors */
function compact(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
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
  // Your table doesn't have class_year or sport. Keep to known columns.
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

/** Insert a quiz response (answers must be an object; the table enforces NOT NULL). */
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
export async function getBusinessMatches(userId, limit = 10) {
  const { data, error } = await supabase
    .from("business_matches")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

/* ---------------------- Edge: process-quiz ------------------ */
/**
 * Invoke the edge function that:
 *   - reads the latest quiz for user_id (or quiz_response_id)
 *   - uses OpenAI to analyze
 *   - calls Google Places within radius
 *   - stores results in business_matches
 */
export async function processQuiz(userId, opts = {}) {
  if (!userId) throw new Error("processQuiz: userId required");

  const { quizResponseId, lat, lng, radiusMiles } = opts;
  const body = compact({
    user_id: userId,
    quiz_response_id: quizResponseId,
    lat: typeof lat === "number" ? lat : undefined,
    lng: typeof lng === "number" ? lng : undefined,
    radius_m: typeof radiusMiles === "number" ? Math.round(radiusMiles * 1609.34) : undefined,
  });

  const { data, error } = await supabase.functions.invoke("process-quiz", { body });
  if (error) {
    throw new Error(`process-quiz ${error.status || ""}: ${JSON.stringify(error)} | body=${JSON.stringify(body)}`);
  }
  return data;
}
