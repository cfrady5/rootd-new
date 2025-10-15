import React from "react";

export default function BrandSummary({ persona }) {
  const traits = persona?.traits || [];
  return (
    <div className="card" style={{ padding: 18 }}>
      <h3 style={{ margin: 0 }}>Brand & Personality</h3>
      <div style={{ marginTop: 12 }}>
        {traits.length === 0 ? (
          <div style={{ color: "var(--muted)" }}>No persona data available.</div>
        ) : (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
            {traits.map((t, i) => (
              <div key={i} style={{ padding: "6px 10px", borderRadius: 999, background: "#F0FDF4", color: "#065F46", fontWeight: 800 }}>{t}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
