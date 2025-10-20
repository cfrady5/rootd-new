// src/pages/AboutPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import FooterCTA from "../components/FooterCTA.jsx";

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
  const [schools, _setSchools] = useState(PARTNER_SCHOOLS);
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
  <div className="page-container">
    <div className="page-content" style={{ color: "var(--text)" }}>
      {/* Header + Story */}
      <section style={{ ...card, padding: 60 }}>
        <div style={{ 
          fontSize: 14, 
          color: "#6b7280", 
          marginBottom: 24,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          fontWeight: 600,
          textAlign: "center"
        }}>
          OUR STORY
        </div>
        <h1 style={{ 
          fontSize: 56, 
          fontWeight: 900, 
          margin: "0 auto 24px",
          textAlign: "center",
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
          color: "#0f172a",
          maxWidth: 900
        }}>About Rootd</h1>
  <p style={{ 
    color: "#64748b", 
    margin: "0 auto 48px",
    fontSize: 21,
    lineHeight: 1.6,
    textAlign: "center",
    maxWidth: 800
  }}>
          We connect small businesses with student-athletes who would not otherwise find the right NIL fit.
          Rootd reduces hassle for compliance teams, gives athletes a guided path to tell their story, and
          unlocks local partnerships that compound value for campuses and communities.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginTop: 48 }}>
          <Stat label="Campuses served" value={schools.length} />
          <Stat label="Local SMB categories" value="15+" />
          <Stat label="Avg. time to match" value="<14 days" />
        </div>
      </section>

      {/* Dynamic Partners Directory */}
      <section style={{ ...card, padding: 40, marginTop: 32 }}>
        <h2 style={{ 
          fontSize: 36, 
          fontWeight: 900, 
          margin: 0,
          letterSpacing: "-0.01em",
          color: "#0f172a"
        }}>Partner Schools</h2>
  <p style={{ color: "#64748b", marginTop: 12, fontSize: 18, lineHeight: 1.6 }}>
          Live directory for demo. Search or filter by state. Tags are defaults for now.
        </p>

        {/* Controls */}
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 0.7fr", gap: 12, marginTop: 32 }}>
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
        <div style={{ marginTop: 24, border: "1px solid #e5e7eb", borderRadius: 16, overflow: "hidden" }}>
          {filtered.map((s, i) => (
            <div key={s.name} style={{ ...row, borderBottom: i === filtered.length - 1 ? "none" : "1px solid #f1f5f9" }}>
              <div style={{ display: "grid", gap: 4 }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{s.name}</div>
                <div style={{ fontSize: 13, color: "#64748b" }}>
                  {s.city}, {s.state} • <a href={s.website} target="_blank" rel="noreferrer" style={link}>Website</a>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                {s.tags.map((t) => (
                  <Tag key={t} text={t} />
                ))}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: 32, textAlign: "center", color: "#64748b", fontSize: 16 }}>No schools match the current filters.</div>
          )}
        </div>
      </section>

      {/* Map */}
      <section style={{ ...card, padding: 40, marginTop: 32 }}>
        <h2 style={{ 
          fontSize: 36, 
          fontWeight: 900, 
          margin: 0,
          letterSpacing: "-0.01em",
          color: "#0f172a"
        }}>Partner Schools Map</h2>
        <p style={{ color: "#64748b", marginTop: 12, fontSize: 18, lineHeight: 1.6 }}>
          Pins show current demo partners. This section updates with your filters.
        </p>
        <div style={{ height: 480, marginTop: 24 }}>
          <SchoolMap markers={filtered} />
        </div>
      </section>
    </div>

    {/* Footer CTA */}
    <FooterCTA />
    </div>
  );
}

/* -------------------- Components -------------------- */

function Stat({ label, value }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      style={{ 
        background: "#ffffff", 
        border: "1px solid #e5e7eb", 
        borderRadius: 16, 
        padding: "32px 24px",
        textAlign: "center",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: isHovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: isHovered ? "0 20px 40px rgba(15,23,42,.12)" : "0 10px 28px rgba(15,23,42,.06)",
        cursor: "default"
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ 
        fontSize: 11, 
        color: "#6b7280",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        fontWeight: 600,
        marginBottom: 12
      }}>{label}</div>
      <div style={{ 
        fontSize: 48, 
        fontWeight: 900,
        color: "#0f172a",
        letterSpacing: "-0.02em"
      }}>{value}</div>
    </div>
  );
}

function Tag({ text }) {
  return (
    <span
      style={{
        fontSize: 13,
        fontWeight: 600,
        background: "#eef2ff",
        color: "#3730a3",
        border: "1px solid #e0e7ff",
        borderRadius: 999,
        padding: "6px 14px",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
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
  padding: "14px 16px",
  borderRadius: 12,
  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
};

const input = {
  border: "none",
  outline: "none",
  background: "transparent",
  width: "100%",
  fontSize: 15,
  color: "#0f172a",
};

const row = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "18px 20px",
  background: "#fff",
  transition: "background 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
};

const link = { 
  color: "#2563EB", 
  textDecoration: "none",
  transition: "color 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
};

const ddBtn = {
  background: "#F8FAFC",
  border: "1px solid #E5E7EB",
  padding: "14px 16px",
  borderRadius: 12,
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  width: "100%",
  textAlign: "left",
  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  color: "#0f172a"
};

const ddMenu = {
  position: "absolute",
  top: 50,
  left: 0,
  right: 0,
  overflow: "hidden",
  background: "#fff",
  border: "1px solid #E5E7EB",
  borderRadius: 12,
  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
  zIndex: 10,
  boxShadow: "0 10px 28px rgba(15,23,42,.1)",
};

const ddItem = {
  padding: "10px 16px",
  cursor: "pointer",
  fontSize: 15,
  transition: "background 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
  fontWeight: 500
};
