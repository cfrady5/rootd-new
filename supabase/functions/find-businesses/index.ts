/// <reference lib="dom" />
/// <reference lib="deno.ns" />

import { createClient } from "https://esm.sh/@supabase/supabase-js@2?target=deno";

type ReqBody = {
  user_id: string;
  profile_id?: string;
  lat?: number;
  lng?: number;
  radius_m?: number;
  max_results?: number;
};
type AthleteProfile = { suggested_categories: string[] | null; interests: string[] | null };

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY")!;
const GOOGLE_MAPS_API_KEY = Deno.env.get("GOOGLE_MAPS_API_KEY")!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...corsHeaders } });

async function fetchJson(url: string) {
  const r = await fetch(url);
  const text = await r.text();
  let data: any;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  if (!r.ok) throw new Error(`HTTP ${r.status} ${data?.status || ""} ${data?.error_message || ""}`);
  return data;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    if (req.method !== "POST") return json({ error: "POST required" }, 405);
    const body: ReqBody = await req.json();
    const user_id = body.user_id;
    if (!user_id) return json({ error: "user_id required" }, 400);

    // Radius & coords (broader defaults)
    const radius_m = typeof body.radius_m === "number" ? body.radius_m : 15000; // 15km
    const max_results = typeof body.max_results === "number" ? body.max_results : 20;
    const lat = typeof body.lat === "number" ? body.lat : 39.7684;
    const lng = typeof body.lng === "number" ? body.lng : -86.1581;

    // Pull latest profile (or by id)
    let ap: AthleteProfile | null = null;
    if (body.profile_id) {
      const { data } = await supabase
        .from("athlete_profiles")
        .select("suggested_categories, interests")
        .eq("id", body.profile_id)
        .maybeSingle();
      ap = (data as AthleteProfile) ?? null;
    } else {
      const { data } = await supabase
        .from("athlete_profiles")
        .select("suggested_categories, interests")
        .eq("user_id", user_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      ap = (data as AthleteProfile) ?? null;
    }

    const seeds = [
      ...(ap?.suggested_categories ?? []),
      ...(ap?.interests ?? []),
    ]
      .filter(Boolean)
      .map((s) => String(s).toLowerCase());

    // Broad fallback search terms
    let searchTerms =
      seeds.length > 0
        ? Array.from(new Set(seeds)).slice(0, 8)
        : ["coffee", "gym", "restaurant", "wellness", "fashion", "barber", "physical therapy", "bookstore"];

    const prelim: any[] = [];
    const runNearby = async (term: string) => {
      const url =
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
        `keyword=${encodeURIComponent(term)}&location=${lat},${lng}&radius=${radius_m}&key=${GOOGLE_MAPS_API_KEY}`;
      const resp = await fetchJson(url);

      // Log status for debugging
      console.log("NearbySearch", { term, status: resp.status, results: resp.results?.length || 0, error: resp.error_message });

      if (resp.status === "REQUEST_DENIED" || resp.status === "INVALID_REQUEST") {
        return { error: resp.error_message || resp.status };
      }
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
      return {};
    };

    // First pass with chosen terms
    for (const term of searchTerms) {
      await runNearby(term);
    }

    // If still empty, do a second pass with common business types
    if (prelim.length === 0) {
      const backup = ["bakery", "cafe", "pizza", "ice cream", "pharmacy", "hardware", "auto repair", "hair salon"];
      for (const term of backup) {
        await runNearby(term);
      }
    }

    // Dedup & trim
    const dedup = Array.from(new Map(prelim.map((r) => [r.place_id, r])).values()).slice(0, max_results);

    // Save matches
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

    // Return latest matches for this user
    const { data: final } = await supabase
      .from("business_matches")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false })
      .limit(max_results);

    return json({
      count: final?.length || 0,
      items: final || [],
      debug: { seeds: seeds.slice(0, 8), usedTerms: searchTerms, lat, lng, radius_m },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("find-businesses error:", msg);
    return json({ error: msg }, 500);
  }
});
