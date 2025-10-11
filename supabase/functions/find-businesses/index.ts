// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
};

const MAPS_KEY = Deno.env.get("GOOGLE_MAPS_API_KEY") || "";
const PLACES_NEARBY = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
const PLACES_DETAILS = "https://maps.googleapis.com/maps/api/place/details/json";

type Body = {
  lat: number;
  lng: number;
  radiusMiles?: number;
  topics?: string[];
  categories?: string[];
  industries?: string[];
  keywords?: string[];
  city?: string | null;
  school?: string | null;
  sport?: string | null;
};

type Place = {
  place_id: string;
  name?: string;
  rating?: number;
  user_ratings_total?: number;
  business_status?: string;
  types?: string[];
  vicinity?: string;
  geometry?: { location?: { lat: number; lng: number } };
  photos?: { photo_reference: string }[];
};

function r(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { "Content-Type": "application/json", ...CORS, ...(init.headers || {}) },
  });
}
const fail = (error: string, detail?: unknown, status = 400) => r({ ok: false, error, detail }, { status });
const ok = (data: unknown) => r({ ok: true, results: data });

function milesToMeters(m: number | undefined) {
  if (!m || !Number.isFinite(m)) return 16093; // 10 miles default
  return Math.min(Math.max(m, 1), 31) * 1609.34; // clamp 1–31mi (Nearby max ~50km)
}

function buildKeyword(b: Body) {
  const bag = [
    ...(b.topics || []),
    ...(b.categories || []),
    ...(b.industries || []),
    ...(b.keywords || []),
    b.sport || "",
    b.school || "",
    b.city || "",
  ]
    .filter(Boolean)
    .map((s) => String(s).toLowerCase());
  return Array.from(new Set(bag)).slice(0, 6).join(" ");
}

function photoUrl(ref?: string) {
  if (!ref || !MAPS_KEY) return null;
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=640&photo_reference=${encodeURIComponent(ref)}&key=${MAPS_KEY}`;
}

async function details(place_id: string) {
  const fields = [
    "place_id",
    "website",
    "url",
    "formatted_address",
    "vicinity",
    "rating",
    "user_ratings_total",
    "types",
    "business_status",
  ].join(",");
  const u = `${PLACES_DETAILS}?place_id=${encodeURIComponent(place_id)}&fields=${fields}&key=${MAPS_KEY}`;
  const res = await fetch(u);
  if (!res.ok) return null;
  const j = await res.json();
  if (j?.status !== "OK") return null;
  return j.result as {
    website?: string;
    formatted_address?: string;
    vicinity?: string;
    rating?: number;
    user_ratings_total?: number;
    business_status?: string;
    types?: string[];
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  if (req.method !== "POST") return fail("Method not allowed", undefined, 405);
  if (!MAPS_KEY) return fail("Missing GOOGLE_MAPS_API_KEY");

  let body: Body;
  try { body = await req.json(); } catch { return fail("Invalid JSON body"); }
  if (typeof body.lat !== "number" || typeof body.lng !== "number") return fail("lat/lng required");

  const radius_m = Math.round(milesToMeters(body.radiusMiles));
  const keyword = buildKeyword(body);

  const url = new URL(PLACES_NEARBY);
  url.searchParams.set("location", `${body.lat},${body.lng}`);
  url.searchParams.set("radius", String(radius_m));
  if (keyword) url.searchParams.set("keyword", keyword);
  url.searchParams.set("key", MAPS_KEY);

  const resp = await fetch(url);
  if (!resp.ok) return fail("nearbysearch failed", await resp.text(), resp.status);
  const j = await resp.json();
  if (!Array.isArray(j?.results)) return ok([]);

  const base: Place[] = j.results as Place[];

  // Filter to real, open businesses with an id and some signal
  const filtered = base.filter(
    (p) =>
      p?.place_id &&
      p.name &&
      (p.business_status === "OPERATIONAL" || !p.business_status) &&
      (typeof p.rating === "number" ? p.rating >= 3.8 : true)
  );

  // Fetch details for top 20 to enrich website/address
  const topForDetails = filtered.slice(0, 20);
  const detailMap = new Map<string, any>();
  await Promise.all(
    topForDetails.map(async (p) => {
      const d = await details(p.place_id);
      if (d) detailMap.set(p.place_id, d);
    })
  );

  const results = filtered.slice(0, 50).map((p) => {
    const d = detailMap.get(p.place_id) || {};
    const addr = d.formatted_address || p.vicinity || null;
    const website = d.website || null;
    return {
      source: "google_places",
      is_verified: true,
      business_place_id: p.place_id,
      place_id: p.place_id,
      name: p.name || null,
      category: (p.types && p.types[0]) || null,
      address: addr,
      city: null,
      website,
      rating: typeof (d.rating ?? p.rating) === "number" ? (d.rating ?? p.rating) : null,
      types: d.types || p.types || null,
      distance_meters: null,
      photo_url: photoUrl(p.photos?.[0]?.photo_reference),
    };
  });

  return ok(results);
});
