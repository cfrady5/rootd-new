// src/lib/api.js
import { supabase } from "../lib/supabaseClient.js";

/* ================================
   QUIZ
================================ */

/** Insert a quiz submission for a user */
export async function insertQuizResponse(userId, payload) {
  try {
    const { data, error } = await supabase
      .from("quiz_responses")
      .insert([
        {
          user_id: userId,
          data: payload, // JSON
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("[insertQuizResponse]", error);
    return { data: null, error };
  }
}

/** Get the most recent quiz response for a user */
export async function getLatestQuizResponse(userId) {
  try {
    const { data, error } = await supabase
      .from("quiz_responses")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("[getLatestQuizResponse]", error);
    return { data: null, error };
  }
}

/** Generate/update athlete profile fields from a quiz response */
export async function generateAthleteProfile(userId, responseId) {
  try {
    const { data: resp, error: fetchErr } = await supabase
      .from("quiz_responses")
      .select("data")
      .eq("id", responseId)
      .single();
    if (fetchErr) throw fetchErr;
    if (!resp?.data) throw new Error("No quiz data found");

    // Your insert saved {version, responses}, but also support raw maps
    const answers = resp.data.responses || resp.data;

    const profileUpdate = {
      full_name: answers.full_name || answers.name || undefined,
      school_name:
        answers.school || answers.university || answers.selectedSchool || undefined,
      major:
        answers.major ||
        (Array.isArray(answers.interests) ? answers.interests.join(", ") : undefined),
      preferred_radius:
        Number(
          answers.preferred_distance_miles || answers.radius || answers.distance
        ) || undefined,
      personality_type: answers.personality || answers.traits || undefined,
      updated_at: new Date().toISOString(),
    };

    // Remove undefined keys so we don't overwrite with nulls
    Object.keys(profileUpdate).forEach(
      (k) => profileUpdate[k] === undefined && delete profileUpdate[k]
    );

    if (Object.keys(profileUpdate).length === 0) {
      return { data: null, error: null };
    }

    const { data, error: updateErr } = await supabase
      .from("profiles")
      .update(profileUpdate)
      .eq("id", userId)
      .select()
      .single();
    if (updateErr) throw updateErr;

    return { data, error: null };
  } catch (error) {
    console.error("[generateAthleteProfile]", error);
    return { data: null, error };
  }
}

/* ================================
   PROFILES (Basics)
================================ */

/** Fetch a user's full profile */
export async function getAthleteProfile(userId) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("[getAthleteProfile]", error);
    return { data: null, error };
  }
}

/** Alias for backward compatibility */
export const getProfile = getAthleteProfile;

/**
 * Upsert a safe subset of profile fields from the Dashboard "Overview" editor.
 * Keeps a whitelist to avoid accidental schema writes.
 */
export async function upsertProfileExtras(userId, patch = {}) {
  try {
    const allowed = [
      "full_name",
      "school_name",
      "major",
      "preferred_radius",
      "sport",
      "year",
      "bio",
      "social_reach",
      "active_deals",
      "compliance_status",
      "socials", // JSON object if you store socials on the same table
    ];

    const update = {};
    for (const key of allowed) {
      if (patch[key] !== undefined) update[key] = patch[key];
    }
    update.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("profiles")
      .update(update)
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("[upsertProfileExtras]", error);
    return { data: null, error };
  }
}

/**
 * Upsert a minimal set of “basic” profile fields (used by inline edit from Overview).
 * This is a convenience wrapper so the UI doesn’t need to send unrelated fields.
 */
export async function upsertProfileBasics(userId, basics = {}) {
  try {
    const allowed = ["full_name", "school_name", "preferred_radius"];
    const update = {};
    for (const k of allowed) {
      if (basics[k] !== undefined) update[k] = basics[k];
    }
    update.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("profiles")
      .update(update)
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("[upsertProfileBasics]", error);
    return { data: null, error };
  }
}

/* ================================
   SOCIAL ACCOUNTS
   Table suggested: profile_socials
   Columns: user_id (PK/FK), instagram jsonb, tiktok jsonb, youtube jsonb,
            twitter jsonb, facebook jsonb, linkedin jsonb
   Each json: { handle: string, followers: number }
================================ */

/** Read social accounts blob for a user */
export async function getSocials(userId) {
  try {
    const { data, error } = await supabase
      .from("profile_socials")
      .select("*")
      .eq("user_id", userId)
      .single();
    if (error && error.code !== "PGRST116") throw error; // tolerate not found
    return { data: data || null, error: null };
  } catch (error) {
    console.error("[getSocials]", error);
    return { data: null, error };
  }
}

/** Upsert social accounts blob for a user */
export async function upsertSocials(userId, socialsObj = {}) {
  try {
    // Coerce follower counts to numbers to keep things tidy
    const cleaned = Object.fromEntries(
      Object.entries(socialsObj).map(([k, v]) => [
        k,
        {
          handle: v?.handle || "",
          followers: Number(v?.followers) || 0,
        },
      ])
    );

    const payload = { user_id: userId, ...cleaned };

    const { data, error } = await supabase
      .from("profile_socials")
      .upsert(payload, { onConflict: "user_id" })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("[upsertSocials]", error);
    return { data: null, error };
  }
}
