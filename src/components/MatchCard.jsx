// src/components/MatchCard.jsx
import React from "react";

export default function MatchCard({ m }) {
  return (
    <article
      className="card"
      style={{
        borderRadius: 16,
        border: "1px solid #E9EEF3",
        background: "#fff",
        padding: 14,
      }}
    >
      <div style={{ display: "grid", gap: 4 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
          <h4 style={{ margin: 0, fontSize: 16 }}>{m.name}</h4>
          {typeof m.rating === "number" && (
            <span className="subtle" style={{ color: "#0D1113" }}>⭐ {m.rating.toFixed(1)}</span>
          )}
        </div>
        <div className="subtle" style={{ color: "#5E6B77" }}>{m.category}</div>
        {m.address && <div className="subtle" style={{ color: "#5E6B77" }}>{m.address}</div>}
        {m.reason && (
          <div
            style={{
              marginTop: 6,
              fontSize: 12,
              fontWeight: 700,
              color: "#0FA958",
              background: "rgba(15,169,88,.08)",
              border: "1px solid #CFE8DA",
              padding: "6px 8px",
              borderRadius: 10,
              width: "fit-content",
            }}
          >
            {m.reason}
          </div>
        )}
        <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
          <a
            href={m.website || "#"}
            target="_blank"
            rel="noreferrer"
            className="btn"
            style={{
              textDecoration: "none",
              padding: "8px 12px",
              borderRadius: 12,
              border: "1px solid #D8E4EC",
              color: "#0D1113",
              background: "#F8FAFB",
              fontWeight: 700,
            }}
          >
            Visit
          </a>
          <button
            className="btn btn-primary"
            style={{
              padding: "8px 12px",
              borderRadius: 12,
              fontWeight: 800,
              background: "#0FA958",
              color: "#fff",
              border: 0,
              boxShadow: "0 10px 22px rgba(15,169,88,.22)",
            }}
            onClick={() => alert("Connection request sent (demo).")}
          >
            Connect
          </button>
        </div>
      </div>
    </article>
  );
}
