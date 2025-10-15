// Generates personalized pitch messages for business collaborations
// deno-lint-ignore-file no-explicit-any
// edge runtime types provided by Supabase during deployment
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "authorization,apikey,content-type",
};

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { "content-type": "application/json", ...CORS } });
A
const SUPABASE_URL = Deno.env.get("PROJECT_SUPABASE_URL") || Deno.env.get("SUPABASE_URL") || "";
const SERVICE_ROLE = Deno.env.get("PROJECT_SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

function generatePitch(businessData: any, userProfile: any) {
  const businessName = businessData.name || "this business";
  const category = businessData.category || "business";
  const address = businessData.address ? ` in ${businessData.address}` : "";
  
  // Get user info
  const userName = userProfile?.full_name || userProfile?.name || "an athlete";
  const sport = userProfile?.sport || "athletics";
  const followers = userProfile?.total_followers || 0;
  
  // Generate follower description
  let followerDesc = "";
  if (followers > 100000) {
    followerDesc = `with over ${Math.floor(followers / 1000)}K followers`;
  } else if (followers > 10000) {
    followerDesc = `with ${Math.floor(followers / 1000)}K+ followers`;
  } else if (followers > 1000) {
    followerDesc = `with ${followers}+ followers`;
  } else {
    followerDesc = "with a growing social media presence";
  }

  // Category-specific pitch elements
  const categoryPitches: Record<string, string> = {
    cafe: "I'd love to feature your coffee and atmosphere in my content, showcasing how it fits into my training routine and daily life.",
    restaurant: "I'd be excited to create content around your delicious food, showing how proper nutrition plays a role in my athletic performance.",
    gym: "As a dedicated athlete, I'd love to train at your facility and share my workout experience with my audience.",
    fitness: "I believe your fitness services would be perfect to feature in my training content and wellness journey.",
    food: "Your food would be perfect to showcase as part of my nutrition and training lifestyle content.",
    health: "I'd love to collaborate and show how your health services support my athletic goals.",
  };

  const categoryPitch = categoryPitches[category.toLowerCase()] || 
    `I'd love to collaborate with ${businessName} and feature your ${category} in my content.`;

  const pitch = `Hi ${businessName}!

My name is ${userName}, and I'm ${sport === "athletics" ? "an athlete" : `a ${sport} athlete`} ${followerDesc}${address}. 

${categoryPitch}

I believe we could create authentic, engaging content together that showcases your brand to my dedicated audience. My followers are interested in fitness, lifestyle, and quality local businesses like yours.

I'd love to discuss a potential partnership that would be mutually beneficial. Would you be open to exploring collaboration opportunities?

Looking forward to hearing from you!

Best regards,
${userName}`;

  return pitch;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  if (req.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405);
  if (!SUPABASE_URL || !SERVICE_ROLE) return json({ ok: false, error: "missing_supabase_env" }, 500);

  const auth = req.headers.get("authorization") || "";
  if (!auth.startsWith("Bearer ")) return json({ ok: false, error: "missing_jwt" }, 401);
  
  let userId: string | null = null;
  try {
    const payload = JSON.parse(atob((auth.split(".")[1] || "").trim() || "e30="));
    userId = typeof payload?.sub === "string" ? payload.sub : null;
  } catch (_e) { /* ignore parse errors */ }
  if (!userId) return json({ ok: false, error: "invalid_jwt" }, 401);

  let body: any = {};
  try { 
    body = await req.json(); 
  } catch (_e) { 
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

  try {
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (profileError && profileError.code !== "PGRST116") {
      return json({ ok: false, error: "profile_fetch_failed", detail: profileError.message }, 500);
    }

    // Get latest quiz data for additional context
    const { data: quizData, error: quizError } = await supabase
      .from("quiz_responses")
      .select("normalized")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Combine profile with quiz data
    const userProfile = {
      ...profile,
      ...quizData?.normalized,
      total_followers: quizData?.normalized?.total_followers || profile?.total_followers || 0
    };

    // Generate the pitch
    const pitch = generatePitch(body, userProfile);

    return json({
      ok: true,
      pitch,
      business: {
        name: body.name || "Business",
        category: body.category || "business"
      },
      user: {
        name: userProfile?.full_name || userProfile?.name || "Athlete",
        sport: userProfile?.sport,
        followers: userProfile?.total_followers || 0
      }
    });

  } catch (e) {
    return json({ ok: false, error: "pitch_generation_failed", detail: String(e) }, 500);
  }
});