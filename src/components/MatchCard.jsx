// src/components/MatchCard.jsx
import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient.js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export default function MatchCard({ m, athleteId }) {
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState(null);
  const [lastError, setLastError] = useState(null);

  async function handleGeneratePitch(channel = "email") {
    setLoading(true);
    setLastError(null);
    try {
      const payload = {
        athlete_id: athleteId,
        business_id: m?.business_id || m?.businessId || null,
        business_place_id: m?.business_place_id || m?.place_id || m?.placeId || null,
        name: m?.name || "Local Business",
        category: m?.category || (Array.isArray(m?.types) ? m.types[0] : "local"),
        city: m?.city || null,
        address: m?.address || m?.vicinity || null,
        channel, // 'email' | 'instagram' | 'tiktok' | 'x'
      };

      if (!payload.athlete_id) {
        const msg = "No athlete_id found. Are you signed in?";
        setLastError(msg);
        alert(msg);
        return;
      }
      if (!payload.business_id && !payload.business_place_id) {
        const msg = "This match is missing a business_place_id (or business_id).";
        setLastError(msg);
        alert(msg);
        return;
      }

      // Use a direct fetch so we ALWAYS see the server's error body.
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const resp = await fetch(`${SUPABASE_URL}/functions/v1/generate-pitch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${session?.access_token || ""}`,
        },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const ct = resp.headers.get("content-type") || "";
        const body = ct.includes("application/json") ? await resp.json() : await resp.text();
        const msg =
          (typeof body === "string" && body) ||
          body?.error ||
          body?.message ||
          JSON.stringify(body);
        console.error("[generate-pitch] HTTP", resp.status, msg, { payload });
        setLastError(msg);
        alert(msg);
        return;
      }

      const data = await resp.json();
      if (!data?.ok) {
        const msg = data?.error || "AI Pitch failed.";
        console.error("[generate-pitch] non-ok", data);
        setLastError(msg);
        alert(msg);
        return;
      }

      setDraft(data?.draft || "");
    } catch (e) {
      console.error("[AI Pitch]", e);
      const msg = e?.message || "Could not generate AI Pitch.";
      setLastError(msg);
      alert(msg);
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
          <h4 style={{ margin: 0, fontSize: 16 }}>{m?.name || "Business"}</h4>
          {typeof m?.rating === "number" && (
            <span className="subtle" style={{ color: "#0D1113" }}>
              ⭐ {m.rating.toFixed(1)}
            </span>
          )}
        </div>

        <div className="subtle" style={{ color: "#5E6B77" }}>
          {m?.category || "local"}
        </div>

        {(m?.address || m?.vicinity) && (
          <div className="subtle" style={{ color: "#5E6B77" }}>
            {m.address || m.vicinity}
          </div>
        )}

        {m?.website && (
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

        {m?.reason && (
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
          {m?.website && (
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

        {lastError && (
          <div
            style={{
              marginTop: 10,
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              padding: 10,
              borderRadius: 10,
              whiteSpace: "pre-wrap",
              fontSize: 12,
              color: "#991B1B",
            }}
          >
            <strong>Pitch error:</strong> {lastError}
          </div>
        )}

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
