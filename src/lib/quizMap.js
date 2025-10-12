// /src/lib/quizMap.js
export function normalizeForScorer(answers) {
  const get = (id, def = null) => (answers?.[id] ?? def);
  const num = (x, d = 0) => (Number.isFinite(Number(x)) ? Number(x) : d);

  // Q3 followers
  const f = get(3, {});
  const following = {
    ig: num(f.instagram, 0),
    tiktok: num(f.tiktok, 0),
    yt: num(f.youtube, 0),
    x: num(f.twitter, 0),
    linkedin: num(f.linkedin, 0),
    facebook: num(f.facebook, 0),
  };

  // Engagement heuristic
  const sum = Object.values(following).reduce((a, b) => a + Number(b || 0), 0) || 1;
  const storyBands = { "<500": 250, "500–1k": 750, "1k–3k": 2000, "3k–10k": 6500, "10k+": 15000 };
  const shortBands = { "<1k": 500, "1k–5k": 3000, "5k–20k": 12000, "20k–100k": 60000, "100k+": 150000 };
  const estStory = storyBands[get(5, "<500")] || 250;
  const estShort = shortBands[get(6, "<1k")] || 500;
  const engagement_rate = Math.max(0, Math.min(1, (estStory * 0.4 + estShort * 0.6) / sum));

  // Hours per week (Q8) → 1..5
  const hours = num(get(8, 0), 0);
  const time_commitment = Math.max(1, Math.min(5, Math.round((hours / 10) * 5) || 1));

  const content_types = Array.isArray(get(10, [])) ? get(10, []) : [];
  const categories = Array.isArray(get(13, [])) ? get(13, []).slice(0, 3) : [];
  const preferred_radius_miles = num(get(23, 15), 15);
  const school = String(get(1, "")).trim() || null;

  return {
    athlete_tier: "d1",
    time_commitment,
    content_types,
    categories,
    audience_locality: 0.5,
    following,
    engagement_rate,
    school,
    preferred_radius_miles,
  };
}
