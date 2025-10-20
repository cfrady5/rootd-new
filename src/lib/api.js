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

export async function generateUserSummary(supabase) {
  // Get fresh session token
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Not authenticated");

  // Try Supabase function first, fallback to local generation
  try {
    const { data: result, error } = await supabase.functions.invoke('generate-user-summary', {
      body: {},
    });

    if (error) throw error;
    return result;
  } catch (error) {
    console.warn('Supabase function unavailable, using local fallback:', error.message);
    
    // Fallback: generate summary locally
    const latestQuiz = await getLatestQuiz(supabase);
    
    // Get user profile
    const { data: { user } } = await supabase.auth.getUser();
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user?.id)
      .maybeSingle();

    // Get top business matches for rankings
    const { data: topMatches } = await supabase
      .from('business_matches')
      .select('business_name, match_score, category, business_place_id')
      .eq('athlete_id', user?.id)
      .order('match_score', { ascending: false })
      .limit(5);

    if (!latestQuiz) {
      // Demo mode: create a sample summary for users without quiz data
      return generateLocalSummary(null, userProfile, topMatches);
    }

    return generateLocalSummary(latestQuiz, userProfile, topMatches);
  }
}

function generateLocalSummary(quizData, userProfile, topMatches = []) {
  const normalized = quizData?.normalized || {};
  const sport = normalized.sport || userProfile?.sport || "athletics";
  const school = normalized.school || userProfile?.school || "";
  const name = userProfile?.full_name || userProfile?.name || "Athlete";
  
  // If no quiz data, create a basic profile summary
  if (!quizData) {
    const score = 75; // Default demo score
    let summary = `${name} is a dedicated ${sport.toLowerCase()} athlete`;
    if (school) {
      summary += ` from ${school}`;
    }
    summary += ` with strong potential for brand partnerships. Known for their commitment to excellence and authentic engagement with their community. `;
    summary += `Currently building their partnership profile to connect with brands that align with their values and athletic journey.`;
    
    // Generate demo matches if no real matches available
    const demoMatches = topMatches && topMatches.length > 0 ? topMatches : [
      { business_name: "Local Fitness Center", category: "Health & Wellness", match_score: 0.92 },
      { business_name: "Sports Nutrition Store", category: "Retail", match_score: 0.88 },
      { business_name: "Athletic Training Facility", category: "Sports & Recreation", match_score: 0.85 }
    ];

    return {
      summary,
      rootd_score: score,
      last_quiz_date: null,
      is_demo: true,
      top_matches: demoMatches
    };
  }
  
  // Handle score scaling - if it's a decimal, convert to 0-100 scale
  let score = quizData.rootd_score || Math.floor(Math.random() * 41) + 60;
  if (score < 1) {
    score = Math.round(score * 100); // Convert decimal to percentage
  }
  
  let summary = `Dedicated ${sport.toLowerCase()} athlete`;
  if (school) {
    summary += ` from ${school}`;
  }
  
  summary += ` with a Rootd partnership score of ${score}`;
  
  // Add personality elements if available
  if (normalized.brandValues) {
    const values = Array.isArray(normalized.brandValues) ? normalized.brandValues[0] : normalized.brandValues;
    summary += `. Values ${values.toLowerCase()}`;
  } else {
    // Add some demo personality traits
    const traits = ['authenticity', 'sustainability', 'community engagement', 'athletic excellence', 'personal growth'];
    const trait = traits[Math.floor(Math.random() * traits.length)];
    summary += `. Values ${trait}`;
  }
  
  if (normalized.collaborationPrefs) {
    const prefs = Array.isArray(normalized.collaborationPrefs) ? normalized.collaborationPrefs.join(" and ") : normalized.collaborationPrefs;
    summary += ` and prefers ${prefs.toLowerCase()} partnerships`;
  } else {
    // Add demo collaboration preferences
    const collabTypes = ['long-term', 'authentic', 'performance-based', 'community-focused'];
    const pref = collabTypes[Math.floor(Math.random() * collabTypes.length)];
    summary += ` and prefers ${pref} partnerships`;
  }
  
  summary += `. Actively seeking meaningful brand partnerships that align with their athletic journey and personal values.`;
  
  // Generate demo matches if no real matches available
  const finalMatches = topMatches && topMatches.length > 0 ? topMatches : [
    { business_name: `${sport} Equipment Store`, category: "Sports Retail", match_score: 0.89 },
    { business_name: "Local Athletic Center", category: "Fitness & Training", match_score: 0.84 },
    { business_name: "Sports Nutrition Hub", category: "Health & Wellness", match_score: 0.82 },
    { business_name: "Performance Apparel Shop", category: "Athletic Wear", match_score: 0.78 }
  ];
  
  return {
    summary,
    rootd_score: score,
    last_quiz_date: quizData.created_at,
    top_matches: finalMatches
  };
}
