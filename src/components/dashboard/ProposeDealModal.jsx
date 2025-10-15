import React, { useState } from "react";
import supabase from "../../lib/supabaseClient.js";

export default function ProposeDealModal({ match, onClose, athleteId }) {
  const [title, setTitle] = useState("");
  const [comp, setComp] = useState("");
  const [deliverables, setDeliverables] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    try {
      setLoading(true);
      await supabase.from("deals").insert([{ athlete_id: athleteId, business_place_id: match.business_place_id, title, compensation: comp, deliverables }]);
      onClose();
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, display: "grid", placeItems: "center", background: "rgba(0,0,0,.5)", zIndex: 1200 }} onClick={onClose}>
      <div style={{ background: "white", padding: 18, borderRadius: 12, width: 520 }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ margin: 0 }}>Propose Deal — {match.name}</h3>
        <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
          <input className="input" placeholder="Proposal title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <input className="input" placeholder="Compensation (e.g., $500)" value={comp} onChange={(e) => setComp(e.target.value)} />
          <textarea className="input" rows={4} placeholder="Deliverables" value={deliverables} onChange={(e) => setDeliverables(e.target.value)} />
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button className="btn" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={submit} disabled={loading}>{loading ? "Sending…" : "Send Proposal"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
