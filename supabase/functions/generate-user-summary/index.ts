// Generates AI-powered user summary based on quiz results
// deno-lint-ignore-file no-explicit-any
import { createClient } from "@supabase/supabase-js";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "authorization,apikey,content-type",
};

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { "content-type": "application/json", ...CORS } });

const SUPABASE_URL = Deno.env.get("PROJECT_SUPABASE_URL") || Deno.env.get("SUPABASE_URL") || "";
const SERVICE_ROLE = Deno.env.get("PROJECT_SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") || "";

async function generateUserSummary(quizData: any, userProfile: any) {
  if (!OPENAI_API_KEY) {
    console.warn("No OPENAI_API_KEY found - using fallback summary");
    return generateFallbackSummary(quizData, userProfile);
  }

  try {
    const prompt = createSummaryPrompt(quizData, userProfile);
    
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an AI assistant that creates engaging, concise athlete profiles for brand partnerships. Focus on personality, interests, and partnership potential."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || generateFallbackSummary(quizData, userProfile);
  } catch (error) {
    console.error("Error generating AI summary:", error);
    return generateFallbackSummary(quizData, userProfile);
  }
}

function createSummaryPrompt(quizData: any, userProfile: any) {
  const normalized = quizData.normalized || {};
  const sport = normalized.sport || userProfile?.sport || "athletics";
  const school = normalized.school || userProfile?.school || "";
  
  // Extract key personality traits and preferences from quiz
  const interests = [];
  const personality = [];
  
  // Analyze quiz responses for personality insights
  if (normalized.contentStyle) {
    interests.push(`creates ${normalized.contentStyle.toLowerCase()} content`);
  }
  
  if (normalized.brandValues) {
    personality.push(`values ${Array.isArray(normalized.brandValues) ? normalized.brandValues.join(", ") : normalized.brandValues}`);
  }
  
  if (normalized.collaborationPrefs) {
    interests.push(`prefers ${Array.isArray(normalized.collaborationPrefs) ? normalized.collaborationPrefs.join(" and ") : normalized.collaborationPrefs} partnerships`);
  }

  return `Create a 2-3 sentence engaging summary for this athlete based on their profile:

Sport: ${sport}
School: ${school}
Interests: ${interests.length > 0 ? interests.join(", ") : "general athletics"}
Personality: ${personality.length > 0 ? personality.join(", ") : "dedicated athlete"}
Rootd Score: ${quizData.rootd_score || "N/A"}

Write this as if introducing them to potential brand partners. Focus on what makes them unique and appealing for partnerships. Keep it professional but engaging.`;
}

function generateFallbackSummary(quizData: any, userProfile: any) {
  const normalized = quizData.normalized || {};
  const sport = normalized.sport || userProfile?.sport || "athletics";
  const school = normalized.school || userProfile?.school || "";
  const score = quizData.rootd_score || 0;
  
  let summary = `Dedicated ${sport.toLowerCase()} athlete`;
  if (school) {
    summary += ` from ${school}`;
  }
  
  summary += ` with a Rootd partnership score of ${score}`;
  
  // Add personality elements if available
  if (normalized.brandValues) {
    const values = Array.isArray(normalized.brandValues) ? normalized.brandValues[0] : normalized.brandValues;
    summary += `. Values ${values.toLowerCase()}`;
  }
  
  summary += ` and is actively seeking meaningful brand partnerships that align with their athletic journey.`;
  
  return summary;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: CORS });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    // Get user from JWT token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Missing or invalid authorization header" }, 401);
    }

    const token = authHeader.substring(7);
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
    
    // Verify and get user from token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return json({ error: "Invalid token or user not found" }, 401);
    }

    // Get latest quiz response for user
    const { data: quizData, error: quizError } = await supabase
      .from("quiz_responses")
      .select("*")
      .or(`user_id.eq.${user.id},athlete_id.eq.${user.id}`)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (quizError && quizError.code !== "PGRST116") {
      throw quizError;
    }

    if (!quizData) {
      return json({ error: "No quiz data found. Please take the quiz first." }, 404);
    }

    // Get user profile
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    // Generate summary
    const summary = await generateUserSummary(quizData, userProfile);

    return json({ 
      summary,
      rootd_score: quizData.rootd_score || 0,
      last_quiz_date: quizData.created_at
    });

  } catch (error: any) {
    console.error("generate-user-summary error:", error);
    return json({ 
      error: error.message || "Internal server error" 
    }, 500);
  }
});