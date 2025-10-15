import React, { useState, useEffect, useCallback } from "react";
import supabase from "../../lib/supabaseClient.js";
import MiniLineChart from "./MiniLineChart.jsx";

export default function SocialPanel({ athleteId }) {
  const [socials, setSocials] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await supabase.from("socials").select("platform,handle,followers,history").eq("athlete_id", athleteId);
      setSocials(data || []);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  }, [athleteId]);

  useEffect(() => { if (athleteId) load(); }, [athleteId, load]);

  const refresh = async () => {
    // placeholder: call an API or function to refresh followers
    try {
      setLoading(true);
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/refresh-socials`, { method: "POST" });
      await load();
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <div className="card" style={{ padding: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0 }}>Social Accounts</h3>
        <button className="btn" onClick={refresh} disabled={loading}>{loading ? "Refreshing…" : "Refresh Stats"}</button>
      </div>
      <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
        {socials.length === 0 ? (
          <div style={{ color: "var(--muted)" }}>No connected accounts. Connect handles to see analytics.</div>
        ) : socials.map((s) => (
          <div key={s.platform} style={{ display: "flex", gap: 12, alignItems: "center", border: "1px solid var(--border)", padding: 12, borderRadius: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 8, background: "#F3F4F6", display: "grid", placeItems: "center", fontWeight: 800 }}>{s.platform[0]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800 }}>{s.platform} • @{s.handle}</div>
              <div style={{ color: "var(--muted)", fontSize: 13 }}>{s.followers?.toLocaleString() || 0} followers</div>
            </div>
            <div style={{ width: 160 }}>
              <MiniLineChart data={(s.history || []).map((p, i) => ({ x: i, y: p }))} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
