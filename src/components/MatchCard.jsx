// src/components/MatchCard.jsx
import React from "react";

export default function MatchCard({ m, athleteId, onSelect, onSave }) {
  const name = m?.name || "Business";
  const placeId = m?.business_place_id || m?.place_id || null;
  const rating =
    typeof m?.rating === "number"
      ? m.rating
      : m?.business_rating != null
      ? Number(m.business_rating)
      : null;
  const ratingText = rating != null ? `${Number(rating).toFixed(1)}★` : null;

  const matchPct =
    typeof m?.match_score === "number"
      ? Math.round(Math.max(0, Math.min(1, m.match_score)) * 100)
      : null;

  const category =
    m?.category || (Array.isArray(m?.types) && m.types[0]) || "Local";

  const city = m?.city || null;
  const address = m?.address || null;
  const website = m?.website || null;
  const photo = m?.photo_url || null;
  const isGoogle = Boolean(placeId);
  const distanceMeters =
    typeof m?.distance_meters === "number" ? m.distance_meters : null;

  const chips = [
    category,
    ratingText,
    city,
    distanceMeters != null ? formatDistance(distanceMeters) : null,
  ].filter(Boolean);

  const reason = m?.reason || null;

  const handlePitch = () =>
    onSelect?.({
      athlete_id: athleteId,
      business_place_id: placeId,
      business_id: m?.business_id || null,
      name,
      category,
      address,
    });

  const handleSave = () =>
    onSave?.({
      athlete_id: athleteId,
      business_place_id: placeId,
      name,
      saved: true,
    });

  const mapsUrl = buildMapsUrl({ name, address });

  return (
    <div
      role="article"
      aria-label={`Match ${name}`}
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        background: "#fff",
        display: "grid",
        gridTemplateColumns: photo ? "96px 1fr" : "1fr",
        gap: 12,
        padding: 12,
      }}
    >
      {photo ? (
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: 12,
            overflow: "hidden",
            border: "1px solid #e5e7eb",
            background: "#f8fafc",
          }}
        >
          {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
          <img
            src={photo}
            alt={`${name} photo`}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            loading="lazy"
          />
        </div>
      ) : null}

      <div style={{ display: "grid", gap: 8 }}>
        {/* header row */}
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
          <div style={{ minWidth: 0 }}>
            <div
              title={name}
              style={{
                fontWeight: 750,
                color: "#0f172a",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {name}
            </div>
            {/* chips */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
              {chips.map((t) => (
                <span
                  key={t}
                  style={{
                    border: "1px solid #e5e7eb",
                    background: "#f8fafc",
                    borderRadius: 999,
                    padding: "4px 8px",
                    fontSize: 12,
                    color: "#475569",
                    fontWeight: 700,
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* score pill */}
          {matchPct != null ? (
            <div
              aria-label={`Match score ${matchPct}%`}
              title={`Match score ${matchPct}%`}
              style={{
                alignSelf: "flex-start",
                fontWeight: 800,
                fontSize: 12,
                color: "#0f172a",
                background: "#eef2ff",
                border: "1px solid #e5e7eb",
                borderRadius: 999,
                padding: "6px 10px",
                minWidth: 52,
                textAlign: "center",
              }}
            >
              {matchPct}%
            </div>
          ) : null}
        </div>

        {/* address and links */}
        {(address || website || mapsUrl) && (
          <div style={{ fontSize: 13, color: "#64748b", display: "flex", gap: 8, flexWrap: "wrap" }}>
            {address ? <span style={{ whiteSpace: "nowrap" }}>{address}</span> : null}
            {website ? (
              <SeparatorDot />
            ) : null}
            {website ? (
              <a href={website} target="_blank" rel="noreferrer" style={{ color: "#0ea5e9", textDecoration: "none" }}>
                website
              </a>
            ) : null}
            {mapsUrl ? (
              <>
                <SeparatorDot />
                <a href={mapsUrl} target="_blank" rel="noreferrer" style={{ color: "#0ea5e9", textDecoration: "none" }}>
                  map
                </a>
              </>
            ) : null}
          </div>
        )}

        {/* reason */}
        {reason ? (
          <div style={{ fontSize: 12, color: "#6b7280" }}>{reason}</div>
        ) : null}

        {/* actions */}
        <div style={{ marginTop: 2, display: "flex", gap: 8, alignItems: "center" }}>
          <button
            type="button"
            onClick={handlePitch}
            aria-label={`Pitch ${name}`}
            style={primaryBtn}
          >
            Pitch
          </button>

          {onSave ? (
            <button
              type="button"
              onClick={handleSave}
              aria-label={`Save ${name}`}
              style={ghostBtn}
            >
              Save
            </button>
          ) : null}

          <span style={{ marginLeft: "auto", fontSize: 12, color: "#94a3b8" }}>
            {isGoogle ? "Google Place" : "Custom"}
          </span>
        </div>

        {/* visual score bar */}
        {matchPct != null ? (
          <div aria-hidden style={{ marginTop: -2 }}>
            <div
              style={{
                height: 8,
                borderRadius: 999,
                background: "#f1f5f9",
                border: "1px solid #e5e7eb",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${matchPct}%`,
                  height: "100%",
                  background: barColor(matchPct),
                  transition: "width .25s ease",
                }}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */
function formatDistance(meters) {
  if (!Number.isFinite(meters)) return null;
  const miles = meters / 1609.344;
  if (miles < 0.2) return `${Math.round(meters)} m`;
  return `${miles.toFixed(miles < 10 ? 1 : 0)} mi`;
}

function buildMapsUrl({ name, address }) {
  const q = encodeURIComponent([name, address].filter(Boolean).join(" "));
  return q ? `https://www.google.com/maps/search/?api=1&query=${q}` : null;
}

function barColor(pct) {
  if (pct >= 80) return "#16a34a";
  if (pct >= 60) return "#22c55e";
  if (pct >= 40) return "#84cc16";
  if (pct >= 20) return "#f59e0b";
  return "#ef4444";
}

const primaryBtn = {
  padding: "8px 10px",
  borderRadius: 10,
  border: "1px solid #111827",
  background: "#111827",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 750,
};

const ghostBtn = {
  padding: "8px 10px",
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  background: "#fff",
  color: "#0f172a",
  cursor: "pointer",
  fontWeight: 750,
};

function SeparatorDot() {
  return <span aria-hidden style={{ color: "#cbd5e1" }}>·</span>;
}
