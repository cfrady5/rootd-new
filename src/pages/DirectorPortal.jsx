// src/pages/DirectorPortal.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";

/** Google Maps API key provided by user */
const GOOGLE_MAPS_KEY = "AIzaSyA-eOIl5NRe7Jju6uiGo1FvJpAWsNE_ZKY";

/** Demo athletes */
const BASE_ATHLETES = [
  { name: "Andrew Luck", email: "andrew.luck@demo.edu", sport: "Football", classYear: "Senior", gpa: 3.5 },
  { name: "Brook Lopez", email: "brook.lopez@demo.edu", sport: "Basketball", classYear: "Senior", gpa: 3.2 },
  { name: "Christian McCaffrey", email: "christian.mccaffrey@demo.edu", sport: "Football", classYear: "Graduate", gpa: 3.9 },
  { name: "John Elway", email: "john.elway@demo.edu", sport: "Football", classYear: "Sophomore", gpa: 3.1 },
  { name: "Julie Foudy", email: "julie.foudy@demo.edu", sport: "Soccer", classYear: "Graduate", gpa: 3.8 },
  { name: "Katie Ledecky", email: "katie.ledecky@demo.edu", sport: "Swimming", classYear: "Sophomore", gpa: 3.7 },
  { name: "Kerri Walsh Jennings", email: "kerri.walsh.jennings@demo.edu", sport: "Volleyball", classYear: "Graduate", gpa: 3.6 },
  { name: "Michelle Wie", email: "michelle.wie@demo.edu", sport: "Golf", classYear: "Senior", gpa: 3.4 },
  { name: "Richard Sherman", email: "richard.sherman@demo.edu", sport: "Football", classYear: "Freshman", gpa: 3.3 },
  { name: "Simone Manuel", email: "simone.manuel@demo.edu", sport: "Swimming", classYear: "Senior", gpa: 3.9 },
];

/** Demo Palo Alto partners near Stanford */
const PARTNER_BUSINESSES = [
  { name: "Blue Bottle Coffee", lat: 37.444635, lng: -122.161847, category: "Coffee Shop", url: "https://bluebottlecoffee.com" },
  { name: "Stanford Shopping Center", lat: 37.444046, lng: -122.171343, category: "Retail", url: "https://www.stanfordshop.com" },
  { name: "Shake Shack Palo Alto", lat: 37.444947, lng: -122.163861, category: "Restaurant", url: "https://shakeshack.com" },
  { name: "Lululemon Palo Alto", lat: 37.443719, lng: -122.161056, category: "Apparel", url: "https://shop.lululemon.com" },
  { name: "SoulCycle Palo Alto", lat: 37.443478, lng: -122.160259, category: "Fitness", url: "https://www.soul-cycle.com" },
  { name: "Trader Joe's Palo Alto", lat: 37.421993, lng: -122.126267, category: "Grocery", url: "https://www.traderjoes.com" },
  { name: "Equinox Palo Alto", lat: 37.424651, lng: -122.146428, category: "Fitness", url: "https://www.equinox.com/clubs/northern-california/paloalto" },
  { name: "Athleta Stanford", lat: 37.442885, lng: -122.161367, category: "Apparel", url: "https://athleta.gap.com" },
];

function ri(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function seedAthletes() {
  return BASE_ATHLETES.map(a => ({
    ...a,
    profilePct: ri(60, 98),
    deals: ri(0, 17),
    followers: {
      instagram: ri(800, 25000),
      x: ri(500, 15000),
      tiktok: ri(1000, 40000),
    },
    engagement: Number((Math.random() * 7 + 1).toFixed(2)), // %
    status: ["Active", "Needs Compliance", "Pending Match", "Deal In Progress"][ri(0, 3)],
    docs: { w9: Math.random() > 0.2, training: Math.random() > 0.5, disclosure: Math.random() > 0.6 },
  }));
}

/* -------------------- MAIN -------------------- */
export default function DirectorPortal() {
  const [tab, setTab] = useState("Overview");
  const [athletes] = useState(seedAthletes);

  // top KPIs (Overview)
  const totalAthletes = athletes.length;
  const activeDeals = athletes.reduce((s, a) => s + (a.deals > 0 ? 1 : 0), 0);
  const totalDealValue = 185000; // demo aggregate
  const needsCompliance = athletes.filter(a => a.status === "Needs Compliance").length;

  return (
    <div style={{ padding: 20, background: "#F4F6F8", minHeight: "100vh" }}>
      <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Director Portal</h1>
      <p style={{ marginTop: 4, color: "#64748B" }}>High-level controls with focused tabs.</p>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12, marginTop: 8 }}>
        <Metric title="Total Athletes" value={totalAthletes} />
        <Metric title="Athletes w/ Deals" value={activeDeals} />
        <Metric title="Deal Value (Sem.)" value={`$${totalDealValue.toLocaleString()}`} />
        <Metric title="Compliance Alerts" value={needsCompliance} />
      </div>

      {/* Tabs */}
      <div style={tabsRow}>
        {["Overview","Athletes","Deals","Compliance","Partners","Analytics","Comms","Admin"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={tabBtn(tab === t)}>{t}</button>
        ))}
      </div>

      {/* Panels */}
      <div style={{ marginTop: 12 }}>
        {tab === "Overview" && <OverviewTab athletes={athletes} />}
        {tab === "Athletes" && <AthletesTab athletes={athletes} />}
        {tab === "Deals" && <DealsTab athletes={athletes} />}
        {tab === "Compliance" && <ComplianceTab athletes={athletes} />}
        {tab === "Partners" && <PartnersTab />}
        {tab === "Analytics" && <AnalyticsTab athletes={athletes} />}
        {tab === "Comms" && <CommsTab />}
        {tab === "Admin" && <AdminTab athletes={athletes} />}
      </div>
    </div>
  );
}

/* -------------------- TABS -------------------- */

function OverviewTab({ athletes }) {
  const recentNotices = [
    { type: "warning", text: "Deal approval pending: Blue Bottle x J. Carter" },
    { type: "success", text: "3 disclosures filed this week" },
    { type: "error", text: "2 athletes missing W-9" },
  ];
  const topGrowth = [...athletes]
    .sort((a, b) => (b.followers.instagram + b.followers.tiktok + b.followers.x) - (a.followers.instagram + a.followers.tiktok + a.followers.x))
    .slice(0, 5);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr", gap: 12 }}>
      <section style={card}>
        <h3 style={h3}>Pipeline Snapshot</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
          <MiniStat label="Suggested" value="12" />
          <MiniStat label="Negotiating" value="7" />
          <MiniStat label="Active" value="9" />
          <MiniStat label="Completed" value="21" />
        </div>

        <h4 style={h4}>Top Social Reach</h4>
        <div style={listBox}>
          {topGrowth.map(a => (
            <div key={a.email} style={row}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={avatar} />
                <div>
                  <div style={{ fontWeight: 600 }}>{a.name}</div>
                  <div style={muted}>{a.sport} • {a.classYear}</div>
                </div>
              </div>
              <div>{(a.followers.instagram + a.followers.x + a.followers.tiktok).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={card}>
        <h3 style={h3}>Notifications</h3>
        {recentNotices.map((n, i) => <Notice key={i} type={n.type} text={n.text} />)}
        <a href="#" style={link}>View all</a>
      </section>
    </div>
  );
}

function AthletesTab({ athletes }) {
  const [search, setSearch] = useState("");
  const [sport, setSport] = useState("All");
  const [year, setYear] = useState("All");
  const [status, setStatus] = useState("All");
  const [sortCol, setSortCol] = useState({ key: "name", dir: "asc" });

  const sports = ["All", ...Array.from(new Set(athletes.map(a => a.sport)))];
  const years = ["All", "Freshman", "Sophomore", "Junior", "Senior", "Graduate"];
  const statuses = ["All","Active","Needs Compliance","Pending Match","Deal In Progress"];

  const filtered = useMemo(() => {
    return athletes
      .filter(a => a.name.toLowerCase().includes(search.toLowerCase()))
      .filter(a => (sport === "All" ? true : a.sport === sport))
      .filter(a => (year === "All" ? true : a.classYear === year))
      .filter(a => (status === "All" ? true : a.status === status))
      .sort((a, b) => {
        const dir = sortCol.dir === "asc" ? 1 : -1;
        const k = sortCol.key;
        if (["profilePct","deals","gpa","engagement"].includes(k)) return (a[k] - b[k]) * dir;
        return a[k].localeCompare(b[k]) * dir;
      });
  }, [athletes, search, sport, year, status, sortCol]);

  return (
    <section style={card}>
      <h3 style={h3}>Athlete Oversight</h3>

      <div style={filtersRow}>
        <div style={searchWrap}><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search athletes..." style={input} /></div>
        <Dropdown label="Sport" value={sport} setValue={setSport} options={sports} />
        <Dropdown label="Year" value={year} setValue={setYear} options={years} />
        <Dropdown label="Status" value={status} setValue={setStatus} options={statuses} />
      </div>

      <div style={tableWrap}>
        <div style={thead6}>
          <Th label="Name" colKey="name" sortCol={sortCol} setSortCol={setSortCol} />
          <Th label="Sport" colKey="sport" sortCol={sortCol} setSortCol={setSortCol} />
          <Th label="Year" colKey="classYear" sortCol={sortCol} setSortCol={setSortCol} />
          <Th label="GPA" colKey="gpa" sortCol={sortCol} setSortCol={setSortCol} />
          <Th label="Profile %" colKey="profilePct" sortCol={sortCol} setSortCol={setSortCol} />
          <Th label="Status" colKey="status" sortCol={sortCol} setSortCol={setSortCol} />
        </div>
        {filtered.map(a => (
          <div key={a.email} style={trow6}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={avatar} />
              <div>
                <div style={{ fontWeight: 600 }}>{a.name}</div>
                <div style={muted}>{a.email}</div>
              </div>
            </div>
            <div>{a.sport}</div>
            <div>{a.classYear}</div>
            <div>{a.gpa.toFixed(2)}</div>
            <div>{a.profilePct}%</div>
            <div><Badge status={a.status} /></div>
          </div>
        ))}
      </div>

      <h4 style={h4}>Engagement Metrics</h4>
      <div style={listBox}>
        {filtered.slice(0, 6).map(a => (
          <div key={a.name} style={row}>
            <div>{a.name}</div>
            <div style={muted}>ER: {a.engagement}% • IG {a.followers.instagram.toLocaleString()} • X {a.followers.x.toLocaleString()} • TT {a.followers.tiktok.toLocaleString()}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function DealsTab({ athletes }) {
  // Build a mock pipeline from athletes
  const pipeline = [
    { stage: "Suggested", items: mockDeals(8, "Suggested") },
    { stage: "Negotiating", items: mockDeals(5, "Negotiating") },
    { stage: "Active", items: mockDeals(6, "Active") },
    { stage: "Completed", items: mockDeals(12, "Completed") },
  ];
  const totals = {
    value: 185000,
    avgPerAthlete: Math.round(185000 / athletes.length),
    expiringSoon: 2,
  };

  return (
    <section style={card}>
      <h3 style={h3}>Deal Management</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
        <MiniStat label="Total Value" value={`$${totals.value.toLocaleString()}`} />
        <MiniStat label="Avg / Athlete" value={`$${totals.avgPerAthlete}`} />
        <MiniStat label="Expiring Soon" value={totals.expiringSoon} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginTop: 12 }}>
        {pipeline.map(col => (
          <div key={col.stage} style={{ ...kanbanCol }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>{col.stage}</div>
            {col.items.map((d,i) => (
              <div key={i} style={kanbanCard}>
                <div style={{ fontWeight: 600 }}>{d.brand}</div>
                <div style={muted}>{d.athlete} • ${d.value}</div>
                <div><Badge status={col.stage} /></div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

function ComplianceTab({ athletes }) {
  const queue = athletes
    .filter(a => !a.docs.w9 || !a.docs.disclosure || a.status === "Needs Compliance")
    .slice(0, 8)
    .map(a => ({
      athlete: a.name,
      missing: [
        !a.docs.w9 && "W-9",
        !a.docs.training && "Training",
        !a.docs.disclosure && "Disclosure",
      ].filter(Boolean),
      status: a.status,
    }));

  return (
    <section style={card}>
      <h3 style={h3}>Compliance Center</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 10 }}>
        <MiniStat label="Deals Completed" value="21" />
        <MiniStat label="In Progress" value="11" />
        <MiniStat label="Needs Review" value={queue.length} />
      </div>

      <h4 style={h4}>Review Queue</h4>
      <div style={tableWrap}>
        <div style={{ ...thead3 }}>
          <div>Athlete</div><div>Missing</div><div>Status</div>
        </div>
        {queue.map((q,i) => (
          <div key={i} style={{ ...trow3 }}>
            <div>{q.athlete}</div>
            <div>{q.missing.join(", ") || "—"}</div>
            <div><Badge status={q.status} /></div>
          </div>
        ))}
      </div>

      <h4 style={h4}>Document Vault</h4>
      <div style={listBox}>
        {athletes.slice(0,6).map(a=>(
          <div key={a.email} style={row}>
            <div>{a.name}</div>
            <div style={muted}>W-9: {a.docs.w9 ? "✔" : "✖"} • Training: {a.docs.training ? "✔" : "✖"} • Disclosure: {a.docs.disclosure ? "✔" : "✖"}</div>
          </div>
        ))}
      </div>

      <h4 style={h4}>Audit Log</h4>
      <div style={listBox}>
        {["W-9 approved for J. Foudy","Disclosure submitted by S. Manuel","Contract signed: Equinox x C. McCaffrey"].map((e,i)=>(
          <div key={i} style={row}><div>{e}</div><div style={muted}>{new Date().toLocaleDateString()}</div></div>
        ))}
      </div>
    </section>
  );
}

function PartnersTab() {
  const categories = ["All","Coffee Shop","Restaurant","Apparel","Fitness","Retail","Grocery"];
  const [cat, setCat] = useState("All");

  const filtered = PARTNER_BUSINESSES.filter(b => cat==="All" ? true : b.category===cat);

  return (
    <section style={card}>
      <h3 style={h3}>Business Partnerships</h3>
      <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
        <Dropdown label="Category" value={cat} setValue={setCat} options={categories} />
        <a href="#" style={link}>Brand Outreach Templates</a>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10 }}>
        <Map markers={filtered} />
        <div style={{ ...panel }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Directory</div>
          <div style={{ maxHeight: 360, overflowY: "auto" }}>
            {filtered.map((b,i)=>(
              <div key={i} style={{ padding: "8px 6px", borderBottom: "1px solid #F1F5F9" }}>
                <div style={{ fontWeight: 600 }}>{b.name}</div>
                <div style={muted}>{b.category}</div>
                <button style={miniBtn}>Propose Deal</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function AnalyticsTab({ athletes }) {
  const totalDeals = athletes.reduce((s,a)=>s + a.deals, 0);
  const avgDeals = (totalDeals / athletes.length).toFixed(1);
  const topER = [...athletes].sort((a,b)=>b.engagement - a.engagement).slice(0,5);

  return (
    <section style={card}>
      <h3 style={h3}>Analytics & Reports</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
        <MiniStat label="Total Deals" value={totalDeals} />
        <MiniStat label="Avg Deals / Athlete" value={avgDeals} />
        <MiniStat label="Median Profile %" value={median(athletes.map(a=>a.profilePct)) + "%"} />
        <MiniStat label="Active Athletes" value={athletes.filter(a=>a.deals>0).length} />
      </div>

      <h4 style={h4}>Top Engagement Rate</h4>
      <div style={listBox}>
        {topER.map(a=>(
          <div key={a.email} style={row}>
            <div>{a.name}</div>
            <div style={muted}>{a.engagement}% ER • {a.sport}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button style={miniBtn}>Export Summary (CSV)</button>
        <button style={miniBtn}>Generate Admin PDF</button>
      </div>
    </section>
  );
}

function CommsTab() {
  const [message, setMessage] = useState("");
  const announcements = [
    { title: "Policy Update", body: "New disclosure window this semester." },
    { title: "Opportunity", body: "Local tech startup seeking ambassadors." },
  ];
  return (
    <section style={card}>
      <h3 style={h3}>Communication</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 10 }}>
        <div style={{ ...panel }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Announcements</div>
          <div style={{ maxHeight: 260, overflowY: "auto" }}>
            {announcements.map((a,i)=>(
              <div key={i} style={{ padding: 8, borderBottom: "1px solid #F1F5F9" }}>
                <div style={{ fontWeight: 600 }}>{a.title}</div>
                <div style={muted}>{a.body}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ ...panel }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Message Athletes</div>
          <textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="Draft a message..." style={textarea} />
          <button style={miniBtn}>Send</button>
        </div>
      </div>
    </section>
  );
}

function AdminTab({ athletes }) {
  return (
    <section style={card}>
      <h3 style={h3}>Administrative Tools</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 10 }}>
        <div style={panel}>
          <div style={{ fontWeight: 700 }}>Automated Reporting</div>
          <div style={muted}>Weekly CSV + monthly PDF to admins.</div>
          <button style={miniBtn}>Configure</button>
        </div>
        <div style={panel}>
          <div style={{ fontWeight: 700 }}>Role & Access</div>
          <div style={muted}>Manage staff permissions.</div>
          <button style={miniBtn}>Open</button>
        </div>
        <div style={panel}>
          <div style={{ fontWeight: 700 }}>Data Export</div>
          <div style={muted}>{athletes.length} athlete profiles.</div>
          <button style={miniBtn}>Download CSV</button>
        </div>
      </div>
    </section>
  );
}

/* -------------------- UTIL / MOCKS -------------------- */

function mockDeals(n, stage) {
  const brands = ["Blue Bottle","Lululemon","Equinox","Shake Shack","Athleta","SoulCycle","Trader Joe's","Local Diner","Outdoor Voices"];
  const names = ["J. Carter","S. Manuel","K. Ledecky","A. Luck","B. Lopez","R. Sherman","M. Wie"];
  return Array.from({ length: n }).map(() => ({
    brand: brands[ri(0, brands.length-1)],
    athlete: names[ri(0, names.length-1)],
    value: ri(300, 3500),
    stage,
  }));
}

function median(arr) {
  const a = [...arr].sort((x,y)=>x-y);
  const mid = Math.floor(a.length/2);
  return a.length % 2 ? a[mid] : Math.round((a[mid-1]+a[mid])/2);
}

/* -------------------- SHARED COMPONENTS -------------------- */

function Metric({ title, value }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: 14 }}>
      <div style={{ fontSize: 12, color: "#64748B" }}>{title}</div>
      <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>{value}</div>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div style={{ background: "#F8FAFC", border: "1px solid #E5E7EB", borderRadius: 10, padding: 10 }}>
      <div style={{ fontSize: 12, color: "#6B7280" }}>{label}</div>
      <div style={{ fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function Dropdown({ label, value, setValue, options }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const onClick = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(v => !v)} style={ddBtn}>
        {label}: {value} <span style={{ marginLeft: 6 }}>▾</span>
      </button>
      <div style={{ ...ddMenu, maxHeight: open ? 180 : 0, padding: open ? "6px 0" : 0, borderWidth: open ? 1 : 0 }}>
        {options.map(o => (
          <div key={o} style={ddItem} onClick={() => { setValue(o); setOpen(false); }}>
            {o}
          </div>
        ))}
      </div>
    </div>
  );
}

function Th({ label, colKey, sortCol, setSortCol }) {
  const active = sortCol.key === colKey;
  const arrow = active ? (sortCol.dir === "asc" ? "↑" : "↓") : "↕";
  return (
    <div
      onClick={() => setSortCol(prev => ({ key: colKey, dir: prev.key === colKey && prev.dir === "asc" ? "desc" : "asc" }))}
      style={{ fontSize: 12, color: "#6B7280", cursor: "pointer", userSelect: "none" }}
      title="Sort"
    >
      {label} <span style={{ fontSize: 11 }}>{arrow}</span>
    </div>
  );
}

function Notice({ type, text }) {
  const color = type === "success" ? "#16A34A" : type === "error" ? "#DC2626" : "#F59E0B";
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 10px", border: "1px solid #E5E7EB", borderRadius: 8, marginTop: 8 }}>
      <div style={{ color }}>• {text}</div>
      <a href="#" style={link}>Open</a>
    </div>
  );
}

function Badge({ status }) {
  const map = {
    "Active": { bg: "#ECFDF5", fg: "#065F46" },
    "Needs Compliance": { bg: "#FEF2F2", fg: "#991B1B" },
    "Pending Match": { bg: "#EFF6FF", fg: "#1D4ED8" },
    "Deal In Progress": { bg: "#FFF7ED", fg: "#C2410C" },
    "Suggested": { bg: "#EFF6FF", fg: "#1D4ED8" },
    "Negotiating": { bg: "#FFF7ED", fg: "#C2410C" },
    "Completed": { bg: "#F3F4F6", fg: "#111827" },
  };
  const s = map[status] || { bg: "#F3F4F6", fg: "#374151" };
  return (
    <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 999, background: s.bg, color: s.fg }}>
      {status}
    </span>
  );
}

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
        const marker = new window.google.maps.Marker({
          map,
          position: { lat: m.lat, lng: m.lng },
          title: m.name,
        });
        const info = new window.google.maps.InfoWindow({
          content: `<div style="font-weight:600">${m.name}</div><div style="font-size:12px;color:#6B7280">${m.category || ""}</div>`,
        });
        marker.addListener("click", () => info.open(map, marker));
        bounds.extend(marker.getPosition());
      });
      if (markers.length) map.fitBounds(bounds);
    }
  }, [markers]);

  return <div ref={ref} style={{ width: "100%", height: 360, border: "1px solid #E5E7EB", borderRadius: 10 }} />;
}

/* -------------------- STYLES -------------------- */
const card = { background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: 16 };
const panel = { background: "#F8FAFC", border: "1px solid #E5E7EB", borderRadius: 10, padding: 10 };
const h3 = { margin: 0, marginBottom: 10, fontSize: 16, fontWeight: 800 };
const h4 = { margin: "14px 0 6px", fontSize: 14, fontWeight: 700 };
const listBox = { border: "1px solid #E5E7EB", borderRadius: 10, overflow: "hidden" };
const row = { display: "flex", justifyContent: "space-between", padding: "10px 12px", borderBottom: "1px solid #F1F5F9", fontSize: 14 };
const tabsRow = { display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" };
const link = { color: "#2563EB", fontSize: 12, textDecoration: "none" };
const muted = { fontSize: 12, color: "#6B7280" };

const filtersRow = { display: "grid", gridTemplateColumns: "1.5fr repeat(3,1fr)", gap: 10, marginBottom: 10 };
const searchWrap = { display: "flex", alignItems: "center", gap: 8, background: "#F8FAFC", border: "1px solid #E5E7EB", padding: "8px 10px", borderRadius: 8 };
const input = { border: "none", outline: "none", background: "transparent", width: "100%" };

const tableWrap = { border: "1px solid #E5E7EB", borderRadius: 10, overflow: "hidden" };
const thead6 = { display: "grid", gridTemplateColumns: "2.5fr 1fr .8fr .8fr .8fr 1.2fr", gap: 10, padding: "10px 12px", background: "#F8FAFC", borderBottom: "1px solid #E5E7EB" };
const trow6 = { display: "grid", gridTemplateColumns: "2.5fr 1fr .8fr .8fr .8fr 1.2fr", gap: 10, padding: "12px", borderBottom: "1px solid #F1F5F9", alignItems: "center" };

const thead3 = { display: "grid", gridTemplateColumns: "2fr 2fr 1fr", gap: 10, padding: "10px 12px", background: "#F8FAFC", borderBottom: "1px solid #E5E7EB" };
const trow3 = { display: "grid", gridTemplateColumns: "2fr 2fr 1fr", gap: 10, padding: "10px 12px", borderBottom: "1px solid #F1F5F9", alignItems: "center" };

const kanbanCol = { background: "#F8FAFC", border: "1px solid #E5E7EB", borderRadius: 10, padding: 8, minHeight: 120 };
const kanbanCard = { background: "#fff", border: "1px solid #E5E7EB", borderRadius: 8, padding: 8, marginBottom: 8 };

const textarea = { width: "100%", minHeight: 120, borderRadius: 8, border: "1px solid #E5E7EB", padding: 8, marginBottom: 8 };

const ddBtn = { background: "#F8FAFC", border: "1px solid #E5E7EB", padding: "8px 10px", borderRadius: 8, fontSize: 13, cursor: "pointer", width: "100%", textAlign: "left" };
const ddMenu = { position: "absolute", top: 42, left: 0, right: 0, overflow: "hidden", background: "#fff", border: "1px solid #E5E7EB", borderRadius: 8, transition: "all .18s ease", zIndex: 10, boxShadow: "0 8px 20px rgba(0,0,0,.06)" };
const ddItem = { padding: "8px 10px", cursor: "pointer" };
const avatar = { width: 28, height: 28, borderRadius: "50%", background: "#E5E7EB" };
function tabBtn(active) { return { padding: "8px 12px", borderRadius: 10, border: "1px solid #E5E7EB", background: active ? "#111827" : "#fff", color: active ? "#fff" : "#111827", cursor: "pointer", fontWeight: 600 }; }
