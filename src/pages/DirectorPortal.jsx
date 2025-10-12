// /src/pages/DirectorPortal.jsx
import React, { useEffect, useState, useCallback } from "react";
import supabase from "../lib/supabaseClient.js";
import { useAuth } from "../auth/AuthProvider.jsx";

const hair = "#E7EEF3";

export default function DirectorPortal() {
  const { session } = (useAuth?.() ?? {});
  const [orgs, setOrgs] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const keyOk = Boolean(import.meta.env.VITE_GOOGLE_MAPS_API_KEY);

  const fetchOrgs = useCallback(async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    setError("");
    try {
      const { data, error: err } = await supabase
        .from("orgs")
        .select("id,name")
        .order("name", { ascending: true });
      if (err) throw err;
      setOrgs(data || []);
    } catch (e) {
      setError(e.message || "Failed to load orgs.");
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => { fetchOrgs(); }, [fetchOrgs]);

  return (
    <div style={{ padding: 16 }}>
      <div style={{ padding: 12, border: `1px solid ${hair}`, borderRadius: 12, marginBottom: 12, background: "#F7FAFC" }}>
        <strong>Environment</strong>
        <div style={{ marginTop: 6 }}>Google Maps key: {keyOk ? "configured" : "missing"}</div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button className="btn" onClick={fetchOrgs} disabled={loading || !session?.user?.id}>
          Refresh orgs
        </button>
      </div>

      {error && (
        <div style={{ marginBottom: 12, padding: 12, border: `1px solid ${hair}`, borderRadius: 12, background: "#FFF6F6", color: "#9B1C1C", fontWeight: 700 }}>
          {error}
        </div>
      )}
      {loading && <div>Loading…</div>}

      <section style={{ padding: 12, border: `1px solid ${hair}`, borderRadius: 12 }}>
        <h3 style={{ margin: 0 }}>Your organizations</h3>
        <div style={{ marginTop: 8 }}>
          {orgs.length === 0 ? "No orgs found." : (
            <ul>
              {orgs.map((o) => (
                <li key={o.id}>{o.name || o.id}</li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section style={{ padding: 12, border: `1px solid ${hair}`, borderRadius: 12, marginTop: 12 }}>
        <h3 style={{ margin: 0 }}>Status</h3>
        <ul style={{ marginTop: 8 }}>
          <li>Quiz pipeline locked</li>
          <li>Matching and pitches enabled via Dashboard</li>
        </ul>
      </section>
    </div>
  );
}
