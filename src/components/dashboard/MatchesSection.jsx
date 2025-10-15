import React, { useState, useEffect } from "react";
import supabase from "../../lib/supabaseClient.js";
import ProposeDealModal from "./ProposeDealModal.jsx";

export default function MatchesSection({ athleteId, onSelect, onSave }) {
  const [matches, setMatches] = useState([]);
  const [filter, setFilter] = useState({ distance: 50, category: "all", newOnly: false });
  const [selected, setSelected] = useState(null);

  // loader handled in useEffect (no separate load function required)

  useEffect(() => {
    if (!athleteId) return;
    let mounted = true;
    (async () => {
      try {
        const { data } = await supabase.from("business_matches").select("*").eq("athlete_id", athleteId).order("match_score", { ascending: false }).limit(50);
        if (mounted) setMatches(data || []);
      } catch (err) { console.error(err); }
    })();
    return () => { mounted = false; };
  }, [athleteId]);

  const filtered = matches.filter(m => (filter.category === "all" ? true : m.category === filter.category));

  return (
    <div className="card" style={{ padding: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0 }}>Business Matches</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <select value={filter.category} onChange={(e) => setFilter(f => ({...f, category: e.target.value}))} className="input">
            <option value="all">All categories</option>
            <option value="food">Food</option>
            <option value="gym">Gym</option>
            <option value="retail">Retail</option>
          </select>
        </div>
      </div>
      <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
        {filtered.length === 0 ? (
          <div style={{ color: "var(--muted)" }}>No matches yet. Try running Find Matches.</div>
        ) : filtered.map(m => (
          <div key={m.business_place_id || m.id} style={{ border: "1px solid var(--border)", padding: 12, borderRadius: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div style={{ fontWeight: 800 }}>{m.name}</div>
              <div style={{ fontWeight: 800 }}>{Math.round((m.match_score || 0) * 100)}%</div>
            </div>
            <div style={{ color: "var(--muted)", fontSize: 13 }}>{m.category} • {m.distance_miles ? `${m.distance_miles} mi` : "—"}</div>
            <div className="match-actions" style={{ marginTop: 8 }}>
              <button className="btn" onClick={() => { setSelected(m); }}>{"Propose Deal"}</button>
              <button className="btn" onClick={() => onSave ? onSave(m) : null}>Save</button>
              <button className="btn" onClick={() => onSelect ? onSelect(m) : null}>Generate Pitch</button>
            </div>
          </div>
        ))}
      </div>

      {selected && <ProposeDealModal match={selected} onClose={() => setSelected(null)} athleteId={athleteId} />}
    </div>
  );
}
