// src/lib/api.js
// Supabase data helpers aligned with current schema:
// - Tables: profile_basics, profile_socials (normalized cols), quiz_responses(responses jsonb)

import { supabase } from "../lib/supabaseClient.js";

/* ============================================================
   QUIZ RESPONSES
============================================================ */

/** Insert a quiz submission for a user */
export async function insertQuizResponse(userId, responses) {
  const { data, error } = await supabase
    .from("quiz_responses")
    .insert([{ user_id: userId, responses, created_at: new Date().toISOString() }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Get the most recent quiz response row for a user */
export async function getLatestQuizResponse(userId) {
  const { data, error } = await supabase
    .from("quiz_responses")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
  if (error?.code === "PGRST116") return null;
  if (error) throw error;
  return data;
}

/** Generate/update profile_basics from a quiz response.
 *  Usage: generateAthleteProfile(userId, optionalResponseId)
 */
export async function generateAthleteProfile(userId, responseId = null) {
  // fetch source quiz row
  let quizRow = null;
  if (responseId) {
    const { data, error } = await supabase
      .from("quiz_responses")
      .select("*")
      .eq("id", responseId)
      .single();
    if (error) throw error;
    quizRow = data;
  } else {
    quizRow = await getLatestQuizResponse(userId);
    if (!quizRow) return null;
  }

  const r = quizRow.responses || {};

  // Accept both keyed objects and index-based arrays
  const byKey = (k, d = undefined) => (r && typeof r === "object" ? r[k] ?? d : d);
  const byIdx = (i, d = undefined) =>
    Array.isArray(r) ? (r[i] !== undefined ? r[i] : d) : d;

  const full_name =
    byKey("full_name") || byKey("name") || byIdx(0) || undefined;
  const school =
    byKey("school") || byKey("university") || byKey("selectedSchool") || byIdx(1) || undefined;
  const sport = byKey("sport") || byIdx(2) || undefined;
  const class_year = byKey("class_year") || byIdx(3) || undefined;
  const preferred_radius_miles = Number(
    byKey("preferred_radius_miles") ||
      byKey("preferred_distance_miles") ||
      byKey("radius") ||
      byKey("distance") ||
      byIdx(10)
  ) || undefined;

  let photo_url =
    byKey("photo_url") ||
    (typeof byIdx(12) === "string" && byIdx(12).startsWith("http") ? byIdx(12) : undefined);

  if (!photo_url && sport) {
    const map = {
      Football:
        "https://images.unsplash.com/photo-1602071797486-4578a0948c3f?q=80&w=800&auto=format&fit=crop",
      Basketball:
        "https://images.unsplash.com/photo-1519861531473-9200262188bf?q=80&w=800&auto=format&fit=crop",
      Swimming:
        "https://images.unsplash.com/photo-1519315901367-f34ff9154487?q=80&w=800&auto=format&fit=crop",
      Soccer:
        "https://images.unsplash.com/photo-1486286701208-1d58e9338013?q=80&w=800&auto=format&fit=crop",
    };
    photo_url =
      map[sport] ||
      "https://images.unsplash.com/photo-1521417531039-95e097c6bd66?q=80&w=800&auto=format&fit=crop";
  }

  // build patch (ignore undefined so we do not overwrite)
  const patch = { id: userId, updated_at: new Date().toISOString() };
  if (full_name !== undefined) patch.full_name = full_name;
  if (school !== undefined) patch.school = school;
  if (sport !== undefined) patch.sport = sport;
  if (class_year !== undefined) patch.class_year = class_year;
  if (preferred_radius_miles !== undefined) patch.preferred_radius_miles = preferred_radius_miles;
  if (photo_url !== undefined) patch.photo_url = photo_url;

  const { data, error } = await supabase
    .from("profile_basics")
    .upsert(patch, { onConflict: "id" })
    .select()
    .single();
  if (error) throw error;

  return data;
}

/* ============================================================
   PROFILE BASICS
============================================================ */

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from("profile_basics")
    .select("*")
    .eq("id", userId)
    .single();
  if (error?.code === "PGRST116") return null;
  if (error) throw error;
  return data;
}

export async function upsertProfileBasics(userId, basics = {}) {
  const allowed = [
    "email",
    "full_name",
    "school",
    "sport",
    "class_year",
    "preferred_radius_miles",
    "photo_url",
  ];
  const patch = { id: userId, updated_at: new Date().toISOString() };
  for (const k of allowed) if (basics[k] !== undefined) patch[k] = basics[k];

  const { data, error } = await supabase
    .from("profile_basics")
    .upsert(patch, { onConflict: "id" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/* ============================================================
   SOCIAL ACCOUNTS (normalized columns)
============================================================ */

export async function getSocials(userId) {
  const { data, error } = await supabase
    .from("profile_socials")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error?.code === "PGRST116") return null;
  if (error) throw error;
  return normalizeSocialRowToUI(data);
}

export async function upsertSocials(userId, socialsObj = {}) {
  const payload = denormalizeUISocialsToRow(userId, socialsObj);
  payload.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("profile_socials")
    .upsert(payload, { onConflict: "user_id" })
    .select()
    .single();
  if (error) throw error;
  return normalizeSocialRowToUI(data);
}

/* ============================================================
   Helpers
============================================================ */

function normalizeSocialRowToUI(row) {
  if (!row) return null;
  return {
    instagram: { handle: row.instagram_handle || "", followers: row.instagram_followers || 0 },
    tiktok:    { handle: row.tiktok_handle || "",    followers: row.tiktok_followers || 0 },
    youtube:   { handle: row.youtube_handle || "",   followers: row.youtube_followers || 0 },
    twitter:   { handle: row.twitter_handle || "",   followers: row.twitter_followers || 0 },
    facebook:  { handle: row.facebook_handle || "",  followers: row.facebook_followers || 0 },
    linkedin:  { handle: row.linkedin_handle || "",  followers: row.linkedin_followers || 0 },
  };
}

function denormalizeUISocialsToRow(user_id, ui = {}) {
  const n = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
  const g = (k) => ui?.[k] || {};
  return {
    user_id,
    instagram_handle: g("instagram").handle || "",
    instagram_followers: n(g("instagram").followers),
    tiktok_handle: g("tiktok").handle || "",
    tiktok_followers: n(g("tiktok").followers),
    youtube_handle: g("youtube").handle || "",
    youtube_followers: n(g("youtube").followers),
    twitter_handle: g("twitter").handle || "",
    twitter_followers: n(g("twitter").followers),
    facebook_handle: g("facebook").handle || "",
    facebook_followers: n(g("facebook").followers),
    linkedin_handle: g("linkedin").handle || "",
    linkedin_followers: n(g("linkedin").followers),
  };
}
