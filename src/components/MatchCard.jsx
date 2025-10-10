// src/components/MatchCard.jsx
import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient.js";

export default function MatchCard({ m, athleteId }) {
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState(null);

  async function handleGeneratePitch(channel = "email") {
    setLoading(true);
    try {
      const payload = {
        athlete_id: athleteId,
        business_id: m.business_id || m.businessId || null,
        business_place_id: m.business_place_id || m.place_id || null,
        name: m.name,
        category: m.category,
        city: m.city,
        address: m.address,
        channel,
      };

      const { data, error } = await supabase.functions.invoke("generate-pitch", {
        body: payload,
      });

      if (error) {
        alert(`⚠️ ${error.message}`);
        return;
      }
      if (!data?.ok) {
        console.error("[generate-pitch] failed:", data);
        return;
      }

      // Show generated text directly, no alert.
      setDraft(data?.draft || "");
    } catch (e) {
      console.error("[AI Pitch]", e);
    } finally {
      setLoading(false);
    }
  }

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
            <span className="subtle" style={{ color: "#0D1113" }}>
              ⭐ {m.rating.toFixed(1)}
            </span>
          )}
        </div>

        <div className="subtle" style={{ color: "#5E6B77" }}>
          {m.category}
        </div>

        {m.address && (
          <div className="subtle" style={{ color: "#5E6B77" }}>
            {m.address}
          </div>
        )}

        {m.website && (
          <div style={{ marginTop: 6 }}>
            <a
              href={m.website}
              target="_blank"
              rel="noreferrer"
              style={{
                fontSize: 13,
                color: "#0FA958",
                textDecoration: "underline",
                fontWeight: 600,
              }}
            >
              {new URL(m.website).hostname.replace("www.", "")}
            </a>
          </div>
        )}

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

        <div
          style={{
            marginTop: 10,
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          {/* Connect now links directly to business website */}
          {m.website && (
            <a
              href={m.website}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary"
              style={{
                padding: "8px 12px",
                borderRadius: 12,
                fontWeight: 800,
                background: "#0FA958",
                color: "#fff",
                border: 0,
                boxShadow: "0 10px 22px rgba(15,169,88,.22)",
                textDecoration: "none",
              }}
            >
              Connect
            </a>
          )}

          <button
            disabled={loading}
            onClick={() => handleGeneratePitch("email")}
            style={{
              padding: "8px 12px",
              borderRadius: 12,
              fontWeight: 700,
              border: "1px solid #0FA958",
              color: "#0FA958",
              background: "#fff",
            }}
          >
            {loading ? "Generating..." : "AI Pitch"}
          </button>
        </div>

        {/* Render the generated pitch inline */}
        {draft && (
          <div
            style={{
              marginTop: 10,
              background: "#F0FDF4",
              border: "1px solid #CFE8DA",
              padding: 10,
              borderRadius: 10,
              whiteSpace: "pre-wrap",
              fontSize: 13,
            }}
          >
            <strong>Generated Pitch:</strong>
            <br />
            {draft}
          </div>
        )}
      </div>
    </article>
  );
}
