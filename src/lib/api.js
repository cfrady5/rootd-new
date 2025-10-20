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
    } catch {
      // keep raw text if not JSON
    }
    throw new Error(`process-quiz ${r.status} ${typeof parsed === "string" ? parsed : JSON.stringify(parsed)}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    return {}; // unexpected empty/invalid body
  }
}

export async function getLatestQuiz(supabase) {
  // Scope to current user to avoid cross-user leakage
  const { data: u } = await supabase.auth.getUser();
  const uid = u?.user?.id;
  if (!uid) return null;

  const { data, error } = await supabase
    .from("quiz_responses")
    .select("id,rootd_score,created_at,normalized,user_id,athlete_id")
    .or(`user_id.eq.${uid},athlete_id.eq.${uid}`)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error && error.code !== "PGRST116") throw error;
  return data || null;
}

export async function findNewMatches(supabase) {
  // Get the latest quiz response to use existing quiz data
  const latestQuiz = await getLatestQuiz(supabase);
  if (!latestQuiz || !latestQuiz.normalized) {
    throw new Error("No quiz data found. Please take the quiz first.");
  }

  // Get fresh session token
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  if (!token) {
    throw new Error("Not authenticated");
  }

  // Call process-quiz with existing normalized answers to find new businesses
  const result = await runProcessQuiz(token, { answers: latestQuiz.normalized });
  return result;
}

export async function getMatches(supabase, athleteId = null) {
  let q = supabase.from("business_matches").select("*").order("match_score", { ascending: false }).limit(20);
  if (athleteId) q = q.eq("athlete_id", athleteId);
  const { data, error } = await q;
  if (error) throw error;
  
  // Convert distance_meters to distance_miles for frontend display
  const matches = (data || []).map(match => ({
    ...match,
    distance_miles: match.distance_meters ? (match.distance_meters / 1609.34).toFixed(1) : null
  }));
  
  return matches;
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
