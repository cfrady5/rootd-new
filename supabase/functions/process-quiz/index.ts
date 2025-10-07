/// <reference lib="dom" />
/// <reference lib="deno.ns" />

import { createClient } from "https://esm.sh/@supabase/supabase-js@2?target=deno";
import OpenAI from "https://esm.sh/openai@4.59.0?target=deno";

type ReqBody = {
  user_id: string;
  quiz_response_id?: string;
  lat?: number;
  lng?: number;
  radius_m?: number;
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY")!;
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;
const GOOGLE_MAPS_API_KEY = Deno.env.get("GOOGLE_MAPS_API_KEY")!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...corsHeaders } });

function milesToMeters(mi: number) { return Math.max(0, Number(mi || 0)) * 1609.34; }

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    if (req.method !== "POST") return json({ error: "POST required" }, 405);

    const body: ReqBody = await req.json();
    const { user_id, quiz_response_id } = body;
    if (!user_id) return json({ error: "user_id is required" }, 400);

    // --- Load quiz row deterministically ---
    let quizRow: any | null = null;
    if (quiz_response_id) {
      const { data, error } = await supabase
        .from("quiz_responses")
        .select("*")
        .eq("id", quiz_response_id)
        .eq("user_id", user_id)
        .maybeSingle();
      if (error) return json({ error: "quiz_responses select by id failed", details: error }, 500);
      if (!data) return json({ error: "quiz_response_id not found for user" }, 404);
      quizRow = data;
    } else {
      const { data, error } = await supabase
        .from("quiz_responses")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) return json({ error: "quiz_responses select failed", details: error }, 500);
      if (!data) return json({ error: "no quiz for user" }, 404);
      quizRow = data;
    }

    // `answers` column is canonical; support legacy shapes too
    const answers = (quizRow.answers?.responses ?? quizRow.answers ?? quizRow.responses) || {};
    const system = `You generate concise NIL athlete profiles. Return JSON with keys:
- summary (string, <= 1200 chars)
- traits (string[])
- interests (string[])
- suggested_categories (string[])`;
    const prompt = `Athlete quiz answers JSON:\n${JSON.stringify(answers, null, 2)}\nReturn JSON only.`;

    const chat = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: system }, { role: "user", content: prompt }],
      temperature: 0.5,
      response_format: { type: "json_object" as const },
    });

    const content = chat.choices?.[0]?.message?.content || "{}";
    let parsed: any = {};
    try { parsed = JSON.parse(content); } catch { parsed = {}; }

    // Save athlete profile snapshot
    const { data: profile, error: insErr } = await supabase
      .from("athlete_profiles")
      .insert([{
        user_id,
        summary: parsed.summary ? String(parsed.summary).slice(0, 1200) : null,
        traits: Array.isArray(parsed.traits) ? parsed.traits : [],
        interests: Array.isArray(parsed.interests) ? parsed.interests : [],
        suggested_categories: Array.isArray(parsed.suggested_categories) ? parsed.suggested_categories : [],
        source_quiz_id: quizRow.id,
      }])
      .select("*")
      .single();
    if (insErr) return json({ error: "athlete_profiles insert failed", details: insErr }, 500);

    // --- Google Places matching pass ---
    const seeds = [
      ...(profile?.suggested_categories ?? []),
      ...(profile?.interests ?? []),
    ].filter(Boolean).map((s: unknown) => String(s).toLowerCase());

    const searchTerms = seeds.length
      ? Array.from(new Set(seeds)).slice(0, 8)
      : ["coffee", "gym", "restaurant", "wellness", "fashion", "barber", "physical therapy", "bookstore"];

    // Choose location & radius
    const radius_m =
      typeof body.radius_m === "number"
        ? body.radius_m
        : milesToMeters(Number(answers?.responses?.preferred_radius_miles ?? answers?.preferred_radius_miles ?? 10));
    const lat = typeof body.lat === "number" ? body.lat : 39.7684;
    const lng = typeof body.lng === "number" ? body.lng : -86.1581;

    async function fetchJson(url: string) {
      const r = await fetch(url);
      const text = await r.text();
      let data: any;
      try { data = JSON.parse(text); } catch { data = { raw: text }; }
      if (!r.ok) throw new Error(`HTTP ${r.status} ${data?.status || ""} ${data?.error_message || ""}`);
      return data;
    }

    const prelim: any[] = [];
    async function runNearby(term: string) {
      const url =
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
        `keyword=${encodeURIComponent(term)}&location=${lat},${lng}&radius=${radius_m}&key=${GOOGLE_MAPS_API_KEY}`;
      const resp = await fetchJson(url);
      if (Array.isArray(resp.results)) {
        for (const r of resp.results) {
          prelim.push({
            place_id: r.place_id,
            name: r.name,
            rating: r.rating,
            address: r.vicinity,
            latitude: r.geometry?.location?.lat,
            longitude: r.geometry?.location?.lng,
            category: term,
            raw: r,
          });
        }
      }
    }

    for (const term of searchTerms) await runNearby(term);
    if (prelim.length === 0) {
      for (const term of ["bakery", "cafe", "pizza", "ice cream", "pharmacy", "hardware", "auto repair", "hair salon"]) {
        await runNearby(term);
      }
    }

    const dedup = Array.from(new Map(prelim.map((r) => [r.place_id, r])).values()).slice(0, 20);

    if (dedup.length) {
      const rows = dedup.map((r) => ({
        user_id,
        place_id: r.place_id,
        name: r.name,
        category: r.category,
        rating: r.rating,
        address: r.address,
        latitude: r.latitude,
        longitude: r.longitude,
        website: null,
        phone: null,
        match_reason: `Matched by "${r.category}" within ${(radius_m / 1609.34).toFixed(1)} mi`,
        raw: r.raw,
      }));
      await supabase.from("business_matches").insert(rows);
    }

    return json({
      profile,
      matches_found: dedup.length,
      debug: { usedTerms: searchTerms.slice(0, 8), lat, lng, radius_m },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return json({ error: msg }, 500);
  }
});
