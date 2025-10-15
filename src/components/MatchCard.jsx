import React from "react";

export default function MatchCard({ m, onSelect }) {
  const rating =
    typeof m.business_rating === "number" ? `${m.business_rating.toFixed(1)}★` :
    typeof m.rating === "number" ? `${Number(m.rating).toFixed(1)}★` : null;

  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, background: "#fff", display: "grid", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ fontWeight: 700 }}>{m.name || "Business"}</div>
        <div style={{ fontSize: 12, color: "#64748b" }}>
          {typeof m.match_score === "number" ? `${Math.round(m.match_score * 100)}%` : ""}
        </div>
      </div>
      <div style={{ fontSize: 14, color: "#475569" }}>
        {m.category || (Array.isArray(m.types) && m.types[0]) || "Local"}
        {rating ? ` · ${rating}` : ""}{m.city ? ` · ${m.city}` : ""}
      </div>
      {m.address && <div style={{ fontSize: 12, color: "#6b7280" }}>{m.address}</div>}
      {m.reason && <div style={{ fontSize: 12, color: "#6b7280" }}>{m.reason}</div>}
      <div style={{ marginTop: 6 }}>
        <button
          onClick={() => onSelect?.(m)}
          style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #111827", background: "#111827", color: "#fff" }}
        >
          Pitch
        </button>
      </div>
    </div>
  );
}
