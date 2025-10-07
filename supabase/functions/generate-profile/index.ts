/// <reference lib="dom" />
/// <reference lib="deno.ns" />

import { createClient } from "https://esm.sh/@supabase/supabase-js@2?target=deno";
import OpenAI from "https://esm.sh/openai@4.59.0?target=deno";

type ReqBody = { user_id: string; quiz_response_id?: string; lat?: number; lng?: number; radius_m?: number };
type QuizRow = { id: string; user_id: string; answers: any; created_at: string };

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY")!;
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...corsHeaders } });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    if (req.method !== "POST") return json({ error: "POST required" }, 405);

    const body: ReqBody = await req.json();
    const { user_id, quiz_response_id, lat, lng, radius_m } = body;
    if (!user_id) return json({ error: "user_id is required" }, 400);

    // Load quiz
    let quiz: QuizRow | null = null;
    if (quiz_response_id) {
      const { data } = await supabase.from("quiz_responses").select("*").eq("id", quiz_response_id).eq("user_id", user_id).maybeSingle();
      if (!data) return json({ error: "quiz_responses row not found for user" }, 400);
      quiz = data as QuizRow;
    } else {
      const { data } = await supabase
        .from("quiz_responses").select("*").eq("user_id", user_id)
        .order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (!data) return json({ error: "no quiz found for user" }, 400);
      quiz = data as QuizRow;
    }
    const answers = (quiz.answers?.responses ?? quiz.answers) || {};

    // LLM
    const system = `You generate concise NIL athlete profiles. Return JSON: summary, traits[], interests[], suggested_categories[].`;
    const userPrompt = `Answers JSON:\n${JSON.stringify(answers, null, 2)}\nReturn JSON only.`;

    const chat = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: system }, { role: "user", content: userPrompt }],
      temperature: 0.7,
      response_format: { type: "json_object" as const },
    });

    const content = chat.choices?.[0]?.message?.content || "{}";
    const parsed = JSON.parse(content);

    // Save
    const { data: inserted, error: insertErr } = await supabase
      .from("athlete_profiles")
      .insert([{
        user_id,
        summary: parsed.summary?.slice(0, 1200) ?? null,
        traits: parsed.traits ?? [],
        interests: parsed.interests ?? [],
        suggested_categories: parsed.suggested_categories ?? [],
      }]).select("*").single();
    if (insertErr) return json({ error: insertErr.message }, 500);

    // Trigger business matching with optional location & radius
    try {
      fetch(`${SUPABASE_URL}/functions/v1/find-businesses`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${SERVICE_ROLE_KEY}` },
        body: JSON.stringify({
          user_id,
          profile_id: inserted.id,
          lat: typeof lat === "number" ? lat : undefined,
          lng: typeof lng === "number" ? lng : undefined,
          radius_m: typeof radius_m === "number" ? radius_m : undefined,
        }),
      }).catch(() => {});
    } catch {}

    return json({ profile: inserted }, 200);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return json({ error: msg }, 500);
  }
});
