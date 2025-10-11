// src/pages/AboutPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";

/** Google Maps API key (same demo key you shared) */
const GOOGLE_MAPS_KEY = "AIzaSyA-eOIl5NRe7Jju6uiGo1FvJpAWsNE_ZKY";

/** Default partner schools (demo data). Add more as needed. */
const PARTNER_SCHOOLS = [
  {
    name: "Stanford University",
    city: "Stanford",
    state: "CA",
    lat: 37.4275,
    lng: -122.1697,
    website: "https://www.stanford.edu",
    tags: ["Community", "Local SMB", "Student-first", "Brand safety"],
  },
  {
    name: "University of Southern California",
    city: "Los Angeles",
    state: "CA",
    lat: 34.0224,
    lng: -118.2851,
    website: "https://www.usc.edu",
    tags: ["Community", "Local SMB", "Student-first", "Brand safety"],
  },
  {
    name: "UCLA",
    city: "Los Angeles",
    state: "CA",
    lat: 34.0689,
    lng: -118.4452,
    website: "https://www.ucla.edu",
    tags: ["Community", "Local SMB", "Student-first", "Brand safety"],
  },
  {
    name: "UC Berkeley",
    city: "Berkeley",
    state: "CA",
    lat: 37.8719,
    lng: -122.2585,
    website: "https://www.berkeley.edu",
    tags: ["Community", "Local SMB", "Student-first", "Brand safety"],
  },
  {
    name: "Santa Clara University",
    city: "Santa Clara",
    state: "CA",
    lat: 37.3496,
    lng: -121.9390,
    website: "https://www.scu.edu",
    tags: ["Community", "Local SMB", "Student-first", "Brand safety"],
  },
  {
    name: "San José State University",
    city: "San José",
    state: "CA",
    lat: 37.3362,
    lng: -121.8811,
    website: "https://www.sjsu.edu",
    tags: ["Community", "Local SMB", "Student-first", "Brand safety"],
  },
];

export default function AboutPage() {
  const schools = PARTNER_SCHOOLS;
  const [q, setQ] = useState("");
  const [stateFilter, setStateFilter] = useState("All");

  const states = useMemo(
    () => ["All", ...Array.from(new Set(PARTNER_SCHOOLS.map((s) => s.state)))],
    []
  );

  const filtered = useMemo(() => {
    return schools
      .filter((s) =>
        q.trim()
          ? `${s.name} ${s.city} ${s.state}`.toLowerCase().includes(q.toLowerCase())
          : true
      )
      .filter((s) => (stateFilter === "All" ? true : s.state === stateFilter));
  }, [schools, q, stateFilter]);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 18px", color: "#0f172a" }}>
      {/* Header + Story */}
      <section style={{ ...card, padding: 20 }}>
        <h1 style={{ fontSize: 34, fontWeight: 800, margin: 0 }}>About Rootd</h1>
        <p style={{ color: "#4b5563", margin: "10px 0 0" }}>
          We connect small businesses with student-athletes who would not otherwise find the right NIL fit.
          Rootd reduces hassle for compliance teams, gives athletes a guided path to tell their story, and
          unlocks local partnerships that compound value for campuses and communities.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 16 }}>
          <Stat label="Campuses served" value={schools.length} />
          <Stat label="Local SMB categories" value="15+" />
          <Stat label="Avg. time to match" value="<14 days" />
        </div>
      </section>

      {/* Dynamic Partners Directory */}
      <section style={{ ...card, padding: 20, marginTop: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Partner Schools</h2>
        <p style={{ color: "#64748b", marginTop: 6 }}>
          Live directory for demo. Search or filter by state. Tags are defaults for now.
        </p>

        {/* Controls */}
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 0.7fr", gap: 10, marginTop: 10 }}>
          <div style={searchWrap}>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by school, city, or state…"
              style={input}
            />
          </div>
          <Dropdown label="State" value={stateFilter} setValue={setStateFilter} options={states} />
        </div>

        {/* List */}
        <div style={{ marginTop: 12, border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
          {filtered.map((s, i) => (
            <div key={s.name} style={{ ...row, borderBottom: i === filtered.length - 1 ? "none" : "1px solid #f1f5f9" }}>
              <div style={{ display: "grid", gap: 2 }}>
                <div style={{ fontWeight: 700 }}>{s.name}</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>
                  {s.city}, {s.state} • <a href={s.website} target="_blank" rel="noreferrer" style={link}>Website</a>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                {s.tags.map((t) => (
                  <Tag key={t} text={t} />
                ))}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: 16, textAlign: "center", color: "#64748b" }}>No schools match the current filters.</div>
          )}
        </div>
      </section>

      {/* Map */}
      <section style={{ ...card, padding: 20, marginTop: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Partner Schools Map</h2>
        <p style={{ color: "#64748b", marginTop: 6 }}>
          Pins show current demo partners. This section updates with your filters.
        </p>
        <div style={{ height: 420 }}>
          <SchoolMap markers={filtered} />
        </div>
      </section>
    </div>
  );
}

/* -------------------- Components -------------------- */

function Stat({ label, value }) {
  return (
    <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 14 }}>
      <div style={{ fontSize: 12, color: "#6b7280" }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 900 }}>{value}</div>
    </div>
  );
}

function Tag({ text }) {
  return (
    <span
      style={{
        fontSize: 12,
        fontWeight: 600,
        background: "#eef2ff",
        color: "#3730a3",
        border: "1px solid #e0e7ff",
        borderRadius: 999,
        padding: "4px 10px",
      }}
    >
      {text}
    </span>
  );
}

function Dropdown({ label, value, setValue, options }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen((v) => !v)} style={ddBtn}>
        {label}: {value} <span style={{ marginLeft: 6 }}>▾</span>
      </button>
      <div
        style={{
          ...ddMenu,
          maxHeight: open ? 220 : 0,
          padding: open ? "6px 0" : 0,
          borderWidth: open ? 1 : 0,
        }}
      >
        {options.map((o) => (
          <div key={o} style={ddItem} onClick={() => { setValue(o); setOpen(false); }}>
            {o}
          </div>
        ))}
      </div>
    </div>
  );
}

function SchoolMap({ markers }) {
  const mapRef = useRef(null);

  useEffect(() => {
    const id = "gmaps-sdk";
    if (!document.getElementById(id)) {
      const s = document.createElement("script");
      s.id = id;
      s.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}`;
      s.async = true;
      document.body.appendChild(s);
      s.onload = init;
    } else {
      init();
    }

    function init() {
      if (!window.google || !mapRef.current) return;

      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 36.7783, lng: -119.4179 }, // CA center for demo
        zoom: 6,
        mapTypeControl: false,
        streetViewControl: false,
      });

      const bounds = new window.google.maps.LatLngBounds();
      markers.forEach((m) => {
        const marker = new window.google.maps.Marker({
          map,
          position: { lat: m.lat, lng: m.lng },
          title: m.name,
        });
        const info = new window.google.maps.InfoWindow({
          content: `
            <div style="font-weight:700">${m.name}</div>
            <div style="font-size:12px;color:#6B7280">${m.city}, ${m.state}</div>
            <div style="margin-top:4px">
              ${(m.tags || []).map((t) => `<span style="display:inline-block;margin:2px 4px 0 0;padding:2px 6px;border-radius:999px;background:#EEF2FF;border:1px solid #E0E7FF;color:#3730A3;font-size:11px;font-weight:600">${t}</span>`).join("")}
            </div>
          `,
        });
        marker.addListener("click", () => info.open({ map, anchor: marker }));
        bounds.extend(marker.getPosition());
      });
      if (markers.length) map.fitBounds(bounds);
    }
  }, [markers]);

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height: "100%",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
      }}
    />
  );
}

/* -------------------- Styles -------------------- */
const card = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  boxShadow: "0 10px 28px rgba(15,23,42,.06)",
};

const searchWrap = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  background: "#F8FAFC",
  border: "1px solid #E5E7EB",
  padding: "10px 12px",
  borderRadius: 10,
};

const input = {
  border: "none",
  outline: "none",
  background: "transparent",
  width: "100%",
  fontSize: 14,
  color: "#0f172a",
};

const row = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 14px",
  background: "#fff",
};

const link = { color: "#2563EB", textDecoration: "none" };

const ddBtn = {
  background: "#F8FAFC",
  border: "1px solid #E5E7EB",
  padding: "10px 12px",
  borderRadius: 10,
  fontSize: 13,
  cursor: "pointer",
  width: "100%",
  textAlign: "left",
};

const ddMenu = {
  position: "absolute",
  top: 46,
  left: 0,
  right: 0,
  overflow: "hidden",
  background: "#fff",
  border: "1px solid #E5E7EB",
  borderRadius: 10,
  transition: "all .18s ease",
  zIndex: 10,
  boxShadow: "0 8px 20px rgba(0,0,0,.06)",
};

const ddItem = {
  padding: "8px 10px",
  cursor: "pointer",
  fontSize: 14,
};
