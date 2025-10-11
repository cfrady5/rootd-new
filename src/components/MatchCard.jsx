// src/components/MatchCard.jsx
import React from "react";

export default function MatchCard({ m, athleteId, onSelect }) {
  const rating =
    typeof m.rating === "number"
      ? `${m.rating.toFixed(1)}★`
      : m.business_rating
      ? `${Number(m.business_rating).toFixed(1)}★`
      : null;

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        padding: 12,
        background: "#fff",
        display: "grid",
        gap: 6,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <div style={{ fontWeight: 700, color: "#0f172a" }}>{m.name || "Business"}</div>
        <div style={{ fontSize: 12, color: "#64748b" }}>
          {typeof m.match_score === "number"
            ? `${Math.round(m.match_score * 100)}%`
            : m.reason
            ? ""
            : ""}
        </div>
      </div>

      <div style={{ fontSize: 14, color: "#475569" }}>
        {m.category || (Array.isArray(m.types) && m.types[0]) || "Local"}
        {rating ? ` · ${rating}` : ""}
        {m.city ? ` · ${m.city}` : ""}
      </div>

      {(m.address || m.website) && (
        <div style={{ fontSize: 13, color: "#64748b" }}>
          {m.address ? m.address : ""}
          {m.website ? (
            <>
              {" "}
              ·{" "}
              <a href={m.website} target="_blank" rel="noreferrer">
                website
              </a>
            </>
          ) : null}
        </div>
      )}

      {m.reason ? (
        <div style={{ fontSize: 12, color: "#6b7280" }}>{m.reason}</div>
      ) : null}

      <div style={{ marginTop: 6, display: "flex", gap: 8 }}>
        <button
          style={{
            padding: "8px 10px",
            borderRadius: 10,
            border: "1px solid #111827",
            background: "#111827",
            color: "#fff",
            cursor: "pointer",
          }}
          onClick={() =>
            onSelect?.({
              athlete_id: athleteId,
              business_place_id: m.business_place_id || m.place_id || null,
              business_id: m.business_id || null,
              name: m.name,
              category: m.category,
              address: m.address,
            })
          }
        >
          Pitch
        </button>
        <span style={{ alignSelf: "center", fontSize: 12, color: "#94a3b8" }}>
          {m.business_place_id || m.place_id ? "Google Place" : "Custom"}
        </span>
      </div>
    </div>
  );
}
