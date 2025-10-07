/// <reference lib="dom" />
/// <reference lib="deno.ns" />

import { createClient } from "https://esm.sh/@supabase/supabase-js@2?target=deno";

type ReqBody = {
  // Preferred: pass response_id right after quiz insert
  response_id?: string;

  // Backward-compat: can also pass user/coords directly
  user_id?: string;
  profile_id?: string;
  lat?: number;
  lng?: number;
  radius_m?: number;
  max_results?: number;
};

type AthleteProfile = {
  suggested_categories: string[] | null;
  interests: string[] | null;
};

type QuizRow = {
  id: string;
  user_id: string;
  responses: Record<string, unknown> | null;
  created_at: string;
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY")!;
const GOOGLE_MAPS_API_KEY = Deno.env.get("GOOGLE_MAPS_API_KEY")!;
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") ?? ""; // optional

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });

async function fetchJson(url: string) {
  const r = await fetch(url);
  const text = await r.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }
  if (!r.ok) throw new Error(`HTTP ${r.status} ${data?.status || ""} ${data?.error_message || ""}`);
  return data;
}

async function geocodeSchool(school: string) {
  if (!school) return null;
  const url =
    "https://maps.googleapis.com/maps/api/place/textsearch/json?" +
    `query=${encodeURIComponent(school)}&key=${GOOGLE_MAPS_API_KEY}`;
  const resp = await fetchJson(url);
  const p = Array.isArray(resp.results) ? resp.results[0] : null;
  if (!p?.geometry?.location) return null;
  return {
    lat: p.geometry.location.lat as number,
    lng: p.geometry.location.lng as number,
  };
}

async function placeDetailsBatch(placeIds: string[]) {
  const out: Record<
    string,
    { website?: string | null; phone?: string | null }
  > = {};
  // Cap to a sensible number to avoid quota spikes
  const ids = placeIds.slice(0, 30);
  for (const id of ids) {
    try {
      const url =
        "https://maps.googleapis.com/maps/api/place/details/json?" +
        `place_id=${encodeURIComponent(id)}&fields=website,formatted_phone_number&key=${GOOGLE_MAPS_API_KEY}`;
      const resp = await fetchJson(url);
      out[id] = {
        website: resp?.result?.website ?? null,
        phone: resp?.result?.formatted_phone_number ?? null,
      };
    } catch {
      out[id] = { website: null, phone: null };
    }
  }
  return out;
}

async function getLatestQuiz(user_id: string): Promise<QuizRow | null> {
  const { data, error } = await supabase
    .from("quiz_responses")
    .select("id,user_id,responses,created_at")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data as QuizRow) ?? null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    if (req.method !== "POST") return json({ error: "POST required" }, 405);
    const body: ReqBody = await req.json();

    // Resolve quiz row / user
    let quiz: QuizRow | null = null;
    if (body.response_id) {
      const { data, error } = await supabase
        .from("quiz_responses")
        .select("id,user_id,responses,created_at")
        .eq("id", body.response_id)
        .single();
      if (error) throw error;
      quiz = data as QuizRow;
    }

    let user_id = quiz?.user_id ?? body.user_id ?? "";
    if (!user_id) return json({ error: "user_id or response_id required" }, 400);

    // Pull athlete profile seeds
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

    // Pull latest quiz if not provided
    if (!quiz) quiz = await getLatestQuiz(user_id);

    const r = (quiz?.responses ?? {}) as Record<string, unknown>;

    // Seeds from quiz
    // industries: from v2 set we used Q25 or Q33 depending on versioning
    const quizIndustries = ((r["25"] ?? r["33"]) as string[] | undefined) ?? [];
    const school = (r["1"] as string) ?? ""; // "Where do you go to school?"
    const radiusMiles = Number(r["35"] ?? NaN); // slider in miles
    const radius_m_from_quiz = Number.isFinite(radiusMiles) ? Math.max(0, radiusMiles) * 1609.34 : undefined;

    // Merge seeds (profile + quiz)
    const seeds = Array.from(
      new Set(
        [
          ...(ap?.suggested_categories ?? []),
          ...(ap?.interests ?? []),
          ...quizIndustries,
        ]
          .filter(Boolean)
          .map((s) => String(s).toLowerCase())
      )
    ).slice(0, 12);

    // Optionally enrich categories with OpenAI
    let enrichedCats: string[] = [];
    if (OPENAI_API_KEY && seeds.length < 6 && (quiz || ap)) {
      try {
        const prompt = {
          school,
          industries: seeds,
          responses: r,
        };
        const ai = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            temperature: 0.2,
            messages: [
              {
                role: "system",
                content:
                  "Suggest up to 6 concise local business category keywords for Google Places nearbysearch. Return JSON array only.",
              },
              { role: "user", content: JSON.stringify(prompt) },
            ],
            response_format: { type: "json_object" },
          }),
        }).then((r) => r.json());
        const parsed = JSON.parse(ai?.choices?.[0]?.message?.content ?? "{}");
        if (Array.isArray(parsed?.categories)) {
          enrichedCats = parsed.categories
            .map((x: any) => String(x).toLowerCase())
            .slice(0, 6);
        }
      } catch {
        enrichedCats = [];
      }
    }

    let searchTerms =
      seeds.length > 0 ? seeds : (enrichedCats.length > 0 ? enrichedCats : []);
    if (searchTerms.length === 0) {
      searchTerms = [
        "coffee",
        "gym",
        "restaurant",
        "wellness",
        "fashion",
        "barber",
        "physical therapy",
        "bookstore",
      ];
    }

    // Coords
    let lat =
      typeof body.lat === "number" ? body.lat : undefined;
    let lng =
      typeof body.lng === "number" ? body.lng : undefined;

    if (lat === undefined || lng === undefined) {
      const geo = await geocodeSchool(school);
      if (geo) {
        lat = geo.lat;
        lng = geo.lng;
      }
    }

    // Fallback center (Indianapolis) if no geocode and none provided
    if (lat === undefined || lng === undefined) {
      lat = 39.7684;
      lng = -86.1581;
    }

    // Radius
    const radius_m =
      typeof body.radius_m === "number"
        ? body.radius_m
        : radius_m_from_quiz ?? 15000; // 15km default

    const max_results = typeof body.max_results === "number" ? body.max_results : 20;

    // Nearby search
    const prelim: any[] = [];
    const runNearby = async (term: string) => {
      const url =
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
        `keyword=${encodeURIComponent(term)}&location=${lat},${lng}&radius=${radius_m}&key=${GOOGLE_MAPS_API_KEY}`;
      const resp = await fetchJson(url);

      console.log("NearbySearch", {
        term,
        status: resp.status,
        results: resp.results?.length || 0,
        error: resp.error_message,
      });

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

    for (const term of searchTerms) {
      await runNearby(term);
    }

    if (prelim.length === 0) {
      const backup = ["bakery", "cafe", "pizza", "ice cream", "pharmacy", "hardware", "auto repair", "hair salon"];
      for (const term of backup) await runNearby(term);
    }

    // Dedup
    const dedupMap = new Map<string, any>();
    for (const r of prelim) if (!dedupMap.has(r.place_id)) dedupMap.set(r.place_id, r);
    const dedup = Array.from(dedupMap.values()).slice(0, max_results);

    // Details (website/phone)
    const details = await placeDetailsBatch(dedup.map((d) => d.place_id));

    // Upsert matches
    if (dedup.length) {
      const rows = dedup.map((r) => ({
        user_id,
        place_id: r.place_id,
        name: r.name,
        category: r.category,
        rating: r.rating ?? null,
        address: r.address ?? null,
        latitude: r.latitude ?? null,
        longitude: r.longitude ?? null,
        website: details[r.place_id]?.website ?? null,
        phone: details[r.place_id]?.phone ?? null,
        match_reason: `Matched by "${r.category}" within ${(radius_m / 1609.34).toFixed(1)} mi`,
        raw: r.raw,
      }));

      // If you have a unique constraint (user_id, place_id), use upsert with onConflict
      const { error: upErr } = await supabase
        .from("business_matches")
        .upsert(rows, { onConflict: "user_id,place_id" });
      if (upErr) {
        // fallback to insert if your table does not support conflict target
        await supabase.from("business_matches").insert(rows);
      }
    }

    // Return latest matches
    const { data: final } = await supabase
      .from("business_matches")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false })
      .limit(max_results);

    return json({
      count: final?.length || 0,
      items: final || [],
      debug: {
        usedTerms: searchTerms,
        lat,
        lng,
        radius_m,
        school,
        from_quiz: Boolean(quiz),
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("find-businesses error:", msg);
    return json({ error: msg }, 500);
  }
});
