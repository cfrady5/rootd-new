// src/pages/DemoPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";

/* Google Maps API key */
const GOOGLE_MAPS_KEY = "AIzaSyA-eOIl5NRe7Jju6uiGo1FvJpAWsNE_ZKY";

/* Demo data */
const BASE_ATHLETES = [
  { name: "Andrew Luck", email: "andrew.luck@demo.edu", sport: "Football", classYear: "Senior" },
  { name: "Brook Lopez", email: "brook.lopez@demo.edu", sport: "Basketball", classYear: "Senior" },
  { name: "Katie Ledecky", email: "katie.ledecky@demo.edu", sport: "Swimming", classYear: "Sophomore" },
  { name: "Julie Foudy", email: "julie.foudy@demo.edu", sport: "Soccer", classYear: "Graduate" },
  { name: "Richard Sherman", email: "richard.sherman@demo.edu", sport: "Football", classYear: "Freshman" },
  { name: "Michelle Wie", email: "michelle.wie@demo.edu", sport: "Golf", classYear: "Senior" },
];

const PARTNER_BUSINESSES = [
  { name: "Blue Bottle Coffee", lat: 37.444635, lng: -122.161847, category: "Coffee Shop" },
  { name: "Shake Shack Palo Alto", lat: 37.444947, lng: -122.163861, category: "Restaurant" },
  { name: "Lululemon Palo Alto", lat: 37.443719, lng: -122.161056, category: "Apparel" },
  { name: "SoulCycle Palo Alto", lat: 37.443478, lng: -122.160259, category: "Fitness" },
];

/* Helpers */
function ri(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function seedAthletes() {
  return BASE_ATHLETES.map(a => ({ ...a, profilePct: ri(60, 98), deals: ri(0, 12) }));
}

/* Main Component */
export default function DemoPage() {
  const [tab, setTab] = useState("Director");
  const [showBanner, setShowBanner] = useState(true);

  return (
    <div style={{ padding: 20, background: "#F4F6F8", minHeight: "100vh" }}>
      {showBanner && (
        <div style={banner}>
          <div>
            <div style={{ fontWeight: 700 }}>Platform Demo</div>
            <div style={{ fontSize: 12, color: "#334155" }}>
              You are in Demo Mode. All data is for illustrative purposes only.
            </div>
          </div>
          <button style={bannerBtn} onClick={() => setShowBanner(false)}>Dismiss</button>
        </div>
      )}

      <div style={toggleWrap}>
        <button onClick={() => setTab("Director")} style={tabBtn(tab === "Director")}>Director Portal</button>
        <button onClick={() => setTab("Athlete")} style={tabBtn(tab === "Athlete")}>Athlete Portal</button>
      </div>

      {tab === "Director" ? <DirectorView /> : <AthleteView />}
    </div>
  );
}

/* Director Portal */
function DirectorView() {
  const [athletes] = useState(seedAthletes);
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () => athletes.filter(a => a.name.toLowerCase().includes(search.toLowerCase())),
    [athletes, search]
  );

  return (
    <section style={card}>
      <h2 style={h2}>Director Portal</h2>
      <p style={pSub}>Manage athletes, verify compliance, and review business partnerships.</p>
      <input
        style={input}
        placeholder="Search athletes..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <div style={{ marginTop: 16, border: "1px solid #E5E7EB", borderRadius: 10 }}>
        {filtered.map((a, i) => (
          <div key={i} style={trow}>
            <div><strong>{a.name}</strong></div>
            <div>{a.sport}</div>
            <div>{a.classYear}</div>
            <div>{a.profilePct}% Profile</div>
            <div>{a.deals} Deals</div>
          </div>
        ))}
      </div>
      <h3 style={{ marginTop: 20 }}>Local Partners near Stanford</h3>
      <Map markers={PARTNER_BUSINESSES} />
    </section>
  );
}

/* Athlete Portal */
function AthleteView() {
  const athlete = {
    name: "Jordan Carter",
    sport: "Basketball",
    classYear: "Junior",
    email: "jordan.carter@demo.edu",
    socials: { instagram: "@rootd", x: "@rootd", tiktok: "@rootd", youtube: "@rootd" },
  };

  const matches = [
    { brand: "Blue Bottle Coffee", status: "Suggested", estValue: 400 },
    { brand: "Lululemon Palo Alto", status: "Negotiating", estValue: 1200 },
    { brand: "Equinox Palo Alto", status: "Active", estValue: 1500 },
  ];

  return (
    <section style={card}>
      <h2 style={h2}>Athlete Portal</h2>
      <p style={pSub}>View your profile, matched businesses, and compliance status.</p>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ ...avatar, width: 50, height: 50 }} />
        <div>
          <div style={{ fontWeight: 700 }}>{athlete.name}</div>
          <div style={{ fontSize: 12, color: "#6B7280" }}>
            {athlete.sport} • {athlete.classYear}
          </div>
          <div style={{ fontSize: 12, color: "#6B7280" }}>{athlete.email}</div>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        {Object.entries(athlete.socials).map(([key, val]) => (
          <div key={key} style={{ fontSize: 14, marginBottom: 4 }}>
            {key.toUpperCase()}: <span style={{ fontWeight: 600 }}>{val}</span>
          </div>
        ))}
      </div>

      <h3 style={{ marginTop: 20 }}>Matched Businesses</h3>
      <div style={{ border: "1px solid #E5E7EB", borderRadius: 10 }}>
        {matches.map((m, i) => (
          <div key={i} style={trow}>
            <div>{m.brand}</div>
            <div>{m.status}</div>
            <div>${m.estValue}</div>
          </div>
        ))}
      </div>

      <h3 style={{ marginTop: 20 }}>Nearby Map</h3>
      <Map markers={PARTNER_BUSINESSES} />
    </section>
  );
}

/* Google Map Component */
function Map({ markers }) {
  const ref = useRef(null);
  useEffect(() => {
    const id = "gmaps-sdk";
    if (!document.getElementById(id)) {
      const s = document.createElement("script");
      s.id = id;
      s.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}`;
      s.async = true;
      document.body.appendChild(s);
      s.onload = init;
    } else init();

    function init() {
      if (!window.google || !ref.current) return;
      const map = new window.google.maps.Map(ref.current, {
        center: { lat: 37.4275, lng: -122.1697 },
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
      });
      const bounds = new window.google.maps.LatLngBounds();
      markers.forEach(m => {
        const marker = new window.google.maps.Marker({ map, position: { lat: m.lat, lng: m.lng }, title: m.name });
        const info = new window.google.maps.InfoWindow({
          content: `<div style="font-weight:600">${m.name}</div><div style="font-size:12px;color:#6B7280">${m.category}</div>`,
        });
        marker.addListener("click", () => info.open(map, marker));
        bounds.extend(marker.getPosition());
      });
      map.fitBounds(bounds);
    }
  }, [markers]);

  return <div ref={ref} style={{ width: "100%", height: 300, border: "1px solid #E5E7EB", borderRadius: 10, marginTop: 10 }} />;
}

/* Styles */
const banner = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "#EEF2FF", border: "1px solid #E0E7FF", borderRadius: 12, marginBottom: 12 };
const bannerBtn = { background: "#111827", color: "#fff", border: "none", borderRadius: 8, padding: "6px 10px", fontSize: 12, cursor: "pointer" };
const toggleWrap = { display: "flex", gap: 8, marginBottom: 16 };
function tabBtn(active) {
  return {
    padding: "8px 14px",
    borderRadius: 10,
    border: "1px solid #E5E7EB",
    background: active ? "#111827" : "#fff",
    color: active ? "#fff" : "#111827",
    cursor: "pointer",
    fontWeight: 600,
  };
}
const card = { background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: 16 };
const h2 = { margin: 0, fontSize: 20, fontWeight: 800 };
const pSub = { color: "#4B5563", fontSize: 14, marginBottom: 12 };
const input = { width: "100%", padding: 8, borderRadius: 8, border: "1px solid #E5E7EB", marginTop: 8 };
const trow = { display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", padding: "8px 12px", borderBottom: "1px solid #F3F4F6", fontSize: 14, alignItems: "center" };
const avatar = { width: 28, height: 28, borderRadius: "50%", background: "#E5E7EB" };
