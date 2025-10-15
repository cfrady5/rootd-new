// /src/pages/Dashboard.jsx — updated to show matches with MatchCard and actions
import React, { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider.jsx";
import supabase from "../lib/supabaseClient.js";
import { runProcessQuiz, getMatches } from "../lib/api.js";
import MatchCard from "../components/MatchCard.jsx";

const hair = "#E7EEF3";

export default function Dashboard() {
  const { state } = useLocation();
  const navScore = state?.rootd_score;

  const { session } = (useAuth?.() ?? {});
  const athleteId = session?.user?.id || null;

  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(typeof navScore === "number" ? navScore : null);
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState("");

  // Load latest score if not passed via navigation
  useEffect(() => {
    if (!athleteId || score !== null) return;
    let cancelled = false;
    (async () => {
      try {
        const { data, error: err } = await supabase
          .from("quiz_responses")
          .select("rootd_score, created_at")
          .eq("user_id", athleteId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (err) throw err;
        if (!cancelled && typeof data?.rootd_score === "number") setScore(data.rootd_score);
      } catch (e) {
        if (!cancelled) setError(e.message || "Failed to load score.");
      }
    })();
    return () => { cancelled = true; };
  }, [athleteId, score]);

  const fetchMatches = useCallback(async () => {
    if (!athleteId) return;
    setLoading(true);
    setError("");
    try {
      const data = await getMatches(supabase, athleteId);
      setMatches(data || []);
    } catch (e) {
      setError(e.message || "Failed to load matches.");
    } finally {
      setLoading(false);
    }
  }, [athleteId]);

  useEffect(() => { if (athleteId) fetchMatches(); }, [athleteId, fetchMatches]);

  // Run matching by reusing latest normalized row through process-quiz (works even with empty body if you added fallback)
  const runMatch = async () => {
    if (!athleteId) return;
    setLoading(true);
    setError("");
    try {
      // try to get user location and call process-quiz with location and default categories
      const geo = await new Promise((res) => {
        if (!navigator.geolocation) return res(null);
        navigator.geolocation.getCurrentPosition((p) => res(p.coords), () => res(null));
      });

      const { data: { session: fresh } } = await supabase.auth.getSession();
      const jwt = fresh?.access_token;
      const payload = {};
      if (geo) {
        payload.lat = geo.latitude;
        payload.lng = geo.longitude;
        payload.preferred_radius_miles = 10;
        payload.categories = ["coffee", "gym"];
      }
      const out = await runProcessQuiz(jwt, { answers: payload });
      if (!out || !out.ok) throw new Error(out?.error || "Match failed");
      await fetchMatches();
    } catch (e) {
      setError(e.message || "Match run failed.");
    } finally {
      setLoading(false);
    }
  };

  // Save match (idempotent upsert). Safe if you added a boolean 'saved' column. If not present, the update will no-op or error silently.
  const handleSave = async ({ athlete_id, business_place_id, name }) => {
    try {
      await supabase
        .from("business_matches")
        .upsert([{ athlete_id, business_place_id, name, saved: true }], { onConflict: "athlete_id,business_place_id" });
      await fetchMatches();
    } catch (e) {
      // non-fatal
    }
  };

  // Pitch action via Edge Function (optional; shows an alert with basic result)
  const handlePitch = async (payload) => {
    try {
      const { data: { session: fresh } } = await supabase.auth.getSession();
      const jwt = fresh?.access_token;
      const base = import.meta.env.VITE_SUPABASE_URL;
      const res = await fetch(`${base}/functions/v1/generate-pitch`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${jwt}` },
        body: JSON.stringify(payload),
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok || !out.ok) throw new Error(out.error || `Pitch error ${res.status}`);
      // Minimal UX
      alert("Pitch generated.");
    } catch (e) {
      alert(e.message || "Pitch failed.");
    }
  };

  return (
    <div style={{ padding: 16 }}>
      {typeof score === "number" && (
        <div style={{ marginBottom: 12, padding: 12, border: `1px solid ${hair}`, borderRadius: 12, background: "#F7FAFC" }}>
          <strong>Quiz saved.</strong> Rootd score: {score.toFixed(2)}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <a className="btn" href="/quiz">Retake quiz</a>
        <button className="btn" onClick={fetchMatches} disabled={loading}>Refresh</button>
        <button className="btn btn-primary" onClick={runMatch} disabled={loading || !athleteId}>Run match</button>
      </div>

      {error && (
        <div style={{ marginBottom: 12, padding: 12, border: `1px solid ${hair}`, borderRadius: 12, background: "#FFF6F6", color: "#9B1C1C", fontWeight: 700 }}>
          {error}
        </div>
      )}
      {loading && <div>Loading…</div>}

      <section style={{ display: "grid", gap: 12 }}>
        <h3 style={{ margin: 0 }}>Your matches</h3>
        {matches.length === 0 ? (
          <div style={{ fontSize: 14, color: "#475569" }}>No matches yet. Run match to generate.</div>
        ) : (
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
            {matches.map((m) => (
              <MatchCard
                key={(m.business_place_id || m.place_id || m.business_id || m.name)}
                m={m}
                athleteId={athleteId}
                onSelect={handlePitch}
                onSave={handleSave}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
