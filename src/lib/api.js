export async function runProcessQuiz(token, answers) {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-quiz`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(answers),
  });
  // Capture response body for better client-side diagnostics
  const text = await r.text();
  if (!r.ok) {
    let parsed = text;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      // keep raw text if not JSON
    }
    throw new Error(`process-quiz ${r.status} ${typeof parsed === "string" ? parsed : JSON.stringify(parsed)}`);
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    return {}; // unexpected empty/invalid body
  }
}

export async function getLatestQuiz(supabase) {
  const { data, error } = await supabase
    .from("quiz_responses")
    .select("id,rootd_score,created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error && error.code !== "PGRST116") throw error;
  return data || null;
}

export async function getMatches(supabase, athleteId = null) {
  let q = supabase.from("business_matches").select("*").order("match_score", { ascending: false }).limit(20);
  if (athleteId) q = q.eq("athlete_id", athleteId);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

export async function getProfile(supabase) {
  const uid = (await supabase.auth.getUser()).data.user?.id;
  if (!uid) return null;
  const { data } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
  return data || null;
}

export async function saveProfile(supabase, patch) {
  const uid = (await supabase.auth.getUser()).data.user?.id;
  if (!uid) throw new Error("Not signed in");
  const { data, error } = await supabase.from("profiles").upsert({ id: uid, ...patch }).select("*").single();
  if (error) throw error;
  return data;
}
