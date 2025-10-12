// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  Vary: "Origin",
};

const GOOGLE_API_KEY = Deno.env.get("GOOGLE_MAPS_API_KEY") || "";

type Nearby = {
  business_status?: string;
  name?: string;
  place_id?: string;
  rating?: number;
  user_ratings_total?: number;
  types?: string[];
  vicinity?: string;
  formatted_address?: string;
  opening_hours?: { open_now?: boolean };
  photos?: { photo_reference: string; width: number; height: number }[];
  geometry?: { location?: { lat: number; lng: number } };
};

function j(body: unknown, init: ResponseInit = {}) {
  const headers = new Headers({ "content-type": "application/json", ...CORS, ...(init.headers ?? {}) });
  return new Response(JSON.stringify(body), { ...init, headers });
}

function photoUrl(ref: string, maxWidth = 400) {
  const u = new URL("https://maps.googleapis.com/maps/api/place/photo");
  u.searchParams.set("maxwidth", String(maxWidth));
  u.searchParams.set("photo_reference", ref);
  u.searchParams.set("key", GOOGLE_API_KEY);
  return u.toString();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: new Headers(CORS) });
  if (req.method !== "POST") return j({ ok: false, error: "Method not allowed" }, { status: 405 });
  if (!GOOGLE_API_KEY) return j({ ok: false, error: "GOOGLE_MAPS_API_KEY missing" }, { status: 500 });

  let body: any;
  try { body = await req.json(); } catch { return j({ ok: false, error: "Invalid JSON" }, { status: 400 }); }

  const lat = Number(body.lat);
  const lng = Number(body.lng);
  const radiusMiles = Number(body.radiusMiles ?? body.radius_miles ?? 10);
  const topics: string[] = Array.isArray(body.topics) ? body.topics : [];
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return j({ ok: false, error: "lat,lng required" }, { status: 400 });
  }

  // Build a Nearby Search with simple keyword from topics
  const keywords = topics.slice(0, 5).join(" ");
  const radiusMeters = Math.round(radiusMiles * 1609.344);
  const nearbyUrl = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
  nearbyUrl.searchParams.set("location", `${lat},${lng}`);
  nearbyUrl.searchParams.set("radius", String(Math.min(radiusMeters, 50000))); // API cap
  if (keywords) nearbyUrl.searchParams.set("keyword", keywords);
  // Optional: type bias; leave broad for demo
  nearbyUrl.searchParams.set("key", GOOGLE_API_KEY);

  const res = await fetch(nearbyUrl);
  if (!res.ok) return j({ ok: false, error: `Google error ${res.status}` }, { status: 502 });
  const data = await res.json();

  const results: Nearby[] = Array.isArray(data?.results) ? data.results : [];
  // Map to normalized candidate objects
  const out = results.slice(0, 50).map((r) => {
    const pr = r.photos && r.photos[0]?.photo_reference;
    return {
      source: "google_places",
      is_verified: true,
      business_place_id: r.place_id ?? null,
      place_id: r.place_id ?? null,
      name: r.name ?? "Business",
      category: Array.isArray(r.types) && r.types.length ? r.types[0] : null,
      types: r.types ?? [],
      rating: typeof r.rating === "number" ? r.rating : null,
      address: r.formatted_address ?? r.vicinity ?? null,
      website: null, // not in nearby payload; can be enriched via Place Details
      distance_meters: null, // optional: compute haversine if you want
      photo_url: pr ? photoUrl(pr, 400) : null,
      city: null, // optional: extract from formatted_address if needed
    };
  });

  return j({ ok: true, results: out, debug: { next_page_token: data?.next_page_token ?? null } });
});
