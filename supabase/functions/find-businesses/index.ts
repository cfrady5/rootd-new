// Minimal Google Places → normalized results
// edge runtime types provided by Supabase during deployment

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "authorization,apikey,content-type",
};

type Body = { lat?: number; lng?: number; radiusMiles?: number; topics?: string[] };
type GooglePlace = {
  place_id?: string;
  name?: string;
  types?: string[];
  rating?: number;
  vicinity?: string;
  formatted_address?: string;
  geometry?: { location?: { lat?: number; lng?: number } };
};

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { "content-type": "application/json", ...CORS } });

// Calculate distance between two lat/lng points using Haversine formula
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  if (req.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405);

  let body: Body = {};
  try { body = await req.json(); } catch { /* ignore json parse errors */ }
  const { lat, lng } = body;
  const radius = Math.max(200, Math.round(((body.radiusMiles ?? 5) * 1609.34) || 1600));
  const topics = Array.isArray(body.topics) && body.topics.length ? body.topics : ["coffee"];

  if (typeof lat !== "number" || typeof lng !== "number")
    return json({ ok: false, error: "location_required", detail: { lat, lng } }, 400);

  const KEY = Deno.env.get("GOOGLE_MAPS_API_KEY");
  // If the Google API key is missing, return mock data to keep local/dev flows working
  if (!KEY) {
    const mockResults = [
      {
        source: "mock_data",
        is_verified: false,
        business_place_id: "mock_coffee_1",
        place_id: "mock_coffee_1",
        name: "Blue Bottle Coffee",
        category: "cafe",
        address: "123 Main St",
        city: "San Francisco",
        website: null,
        rating: 4.2,
        types: ["cafe", "food", "establishment"],
        distance_meters: 500,
        photo_url: null,
      },
      {
        source: "mock_data",
        is_verified: false,
        business_place_id: "mock_gym_1",
        place_id: "mock_gym_1",
        name: "Fitness First",
        category: "gym",
        address: "456 Oak St",
        city: "San Francisco",
        website: null,
        rating: 4.5,
        types: ["gym", "health", "establishment"],
        distance_meters: 800,
        photo_url: null,
      },
      {
        source: "mock_data",
        is_verified: false,
        business_place_id: "mock_restaurant_1",
        place_id: "mock_restaurant_1",
        name: "The Local Bistro",
        category: "restaurant",
        address: "789 Pine St",
        city: "San Francisco",
        website: null,
        rating: 4.0,
        types: ["restaurant", "food", "establishment"],
        distance_meters: 1200,
        photo_url: null,
      }
    ];
    return json({ ok: true, results: mockResults, meta: { count: mockResults.length, topicUsed: topics[0], mock: true } });
  }

  const keyword = encodeURIComponent(topics[0]);
  const url =
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}` +
    `&radius=${radius}&keyword=${keyword}&key=${KEY}`;

  try {
    const resp = await fetch(url);
    const data = await resp.json();
    if (!resp.ok) {
      // If Google API fails, return mock data for development
      console.log("Google API failed, using mock data");
      const mockResults = [
        {
          source: "mock_data",
          is_verified: false,
          business_place_id: "mock_coffee_1",
          place_id: "mock_coffee_1",
          name: "Blue Bottle Coffee",
          category: "cafe",
          address: "123 Main St",
          city: "San Francisco",
          website: null,
          rating: 4.2,
          types: ["cafe", "food", "establishment"],
          distance_meters: 500,
          photo_url: null,
        },
        {
          source: "mock_data",
          is_verified: false,
          business_place_id: "mock_gym_1",
          place_id: "mock_gym_1",
          name: "Fitness First",
          category: "gym",
          address: "456 Oak St",
          city: "San Francisco",
          website: null,
          rating: 4.5,
          types: ["gym", "health", "establishment"],
          distance_meters: 800,
          photo_url: null,
        },
        {
          source: "mock_data",
          is_verified: false,
          business_place_id: "mock_restaurant_1",
          place_id: "mock_restaurant_1",
          name: "The Local Bistro",
          category: "restaurant",
          address: "789 Pine St",
          city: "San Francisco",
          website: null,
          rating: 4.0,
          types: ["restaurant", "food", "establishment"],
          distance_meters: 1200,
          photo_url: null,
        }
      ];
      return json({ ok: true, results: mockResults, meta: { count: mockResults.length, topicUsed: topics[0], mock: true } });
    }
    
    const st = data?.status;
    if (st !== "OK" && st !== "ZERO_RESULTS") {
      // If Google API returns error status, also use mock data
      console.log("Google API status error, using mock data:", st);
      const mockResults = [
        {
          source: "mock_data",
          is_verified: false,
          business_place_id: "mock_coffee_1",
          place_id: "mock_coffee_1",
          name: "Blue Bottle Coffee",
          category: "cafe",
          address: "123 Main St",
          city: "San Francisco",
          website: null,
          rating: 4.2,
          types: ["cafe", "food", "establishment"],
          distance_meters: 500,
          photo_url: null,
        },
        {
          source: "mock_data",
          is_verified: false,
          business_place_id: "mock_gym_1",
          place_id: "mock_gym_1",
          name: "Fitness First",
          category: "gym",
          address: "456 Oak St",
          city: "San Francisco",
          website: null,
          rating: 4.5,
          types: ["gym", "health", "establishment"],
          distance_meters: 800,
          photo_url: null,
        }
      ];
      return json({ ok: true, results: mockResults, meta: { count: mockResults.length, topicUsed: topics[0], mock: true } });
    }

  const results = ((data?.results as GooglePlace[]) || []).slice(0, 20).map((p: GooglePlace) => {
      // Calculate distance if geometry location is available
  let distance_meters: number | null = null;
  const plat = p.geometry?.location?.lat as number | undefined;
  const plng = p.geometry?.location?.lng as number | undefined;
      const hasPlat = typeof plat === 'number' && !Number.isNaN(plat);
      const hasPlng = typeof plng === 'number' && !Number.isNaN(plng);
      if (hasPlat && hasPlng) {
        distance_meters = Math.round(calculateDistance(lat, lng, plat, plng));
        console.log(`Distance calculated for ${p.name}: ${distance_meters}m (${(distance_meters / 1609.34).toFixed(1)}mi)`);
      } else {
        console.log(`No geometry data for ${p.name}`);
      }
      
      return {
        source: "google_places",
        is_verified: true,
        business_place_id: p.place_id,
        place_id: p.place_id,
        name: p.name,
        category: Array.isArray(p.types) ? p.types[0] ?? null : null,
        address: p.vicinity ?? p.formatted_address ?? null,
        city: null,
        website: null,
        rating: typeof p.rating === "number" ? p.rating : null,
        types: Array.isArray(p.types) ? p.types : null,
        distance_meters,
        lat: hasPlat ? plat : null,
        lng: hasPlng ? plng : null,
        photo_url: null,
      };
    });

    return json({ ok: true, results, meta: { count: results.length, topicUsed: topics[0] } });
  } catch (e) {
    // network or parse error - use mock data
    console.log("Network/parse error, using mock data:", e);
    const mockResults = [
      {
        source: "mock_data",
        is_verified: false,
        business_place_id: "mock_coffee_1",
        place_id: "mock_coffee_1",
        name: "Blue Bottle Coffee",
        category: "cafe",
        address: "123 Main St",
        city: "San Francisco",
        website: null,
        rating: 4.2,
        types: ["cafe", "food", "establishment"],
        distance_meters: 500,
        photo_url: null,
      }
    ];
    return json({ ok: true, results: mockResults, meta: { count: mockResults.length, topicUsed: topics[0], mock: true } });
  }
});
