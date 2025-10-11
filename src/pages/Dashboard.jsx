// src/pages/Dashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthProvider.jsx";
import {
  getProfile,
  upsertProfileBasics,
  getSocials,
  upsertSocials,
  getLatestQuizResponse,
  getBusinessMatches,
  processQuiz,
} from "../lib/api.js";
import { supabase } from "../lib/supabaseClient.js";
import MatchCard from "../components/MatchCard.jsx";

/* Local storage */
const LS_KEY = "rootd_demo_profile_v3";
function loadDemo() { try { return JSON.parse(localStorage.getItem(LS_KEY) || "{}"); } catch { return {}; } }
function saveDemo(profile, socials) { try { localStorage.setItem(LS_KEY, JSON.stringify({ profile, socials })); } catch {} }

/* Helpers */
const dedupeAndLimit = (rows = [], n = 10) => {
  const seen = new Set();
  const out = [];
  for (const r of rows) {
    const k = r.business_place_id || r.place_id || r.id || `${r.name}|${r.address}`;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(r);
    if (out.length >= n) break;
  }
  return out;
};

/* UI tokens */
const surface = { background: "#ffffff", border: "1px solid #e9edf1", boxShadow: "0 12px 30px rgba(15,23,42,.07)", borderRadius: 16 };
const pill = { padding: "8px 12px", borderRadius: 12, border: "1px solid #111827", background: "#111827", color: "#fff", cursor: "pointer" };
const ghost = { padding: "8px 12px", borderRadius: 12, border: "1px solid #e5e7eb", background: "#fff", color: "#111827", cursor: "pointer" };
const tabBtn = (active) => ({ padding: "8px 12px", borderRadius: 10, border: "1px solid #E5E7EB", background: active ? "#111827" : "#fff", color: active ? "#fff" : "#111827", cursor: "pointer", fontWeight: 600 });

function socialUrl(key, handle) {
  const h = String(handle || "").replace(/^@/, "");
  const map = {
    instagram: `https://instagram.com/${h}`,
    tiktok: `https://tiktok.com/@${h}`,
    youtube: `https://youtube.com/@${h}`,
    twitter: `https://twitter.com/${h}`,
    facebook: `https://facebook.com/${h}`,
    linkedin: `https://www.linkedin.com/in/${h}`,
  };
  return map[key] || "#";
}

export default function Dashboard() {
  const { session } = useAuth?.() ?? { session: null };
  const userId = session?.user?.id || null;
  const isDemo = !userId;
  const seed = loadDemo();

  const [profile, setProfile] = useState(seed.profile || {
    id: userId || "demo-user",
    email: session?.user?.email || "demo@rootd.app",
    full_name: "Demo Athlete",
    school: "",
    preferred_radius_miles: 10,
    photo_url: "https://images.unsplash.com/photo-1521417531039-95e097c6bd66?q=80&w=640&auto=format&fit=crop",
  });
  const [socials, setSocials] = useState(seed.socials || {
    instagram: { handle: "", followers: 0 },
    tiktok: { handle: "", followers: 0 },
    youtube: { handle: "", followers: 0 },
    twitter: { handle: "", followers: 0 },
    facebook: { handle: "", followers: 0 },
    linkedin: { handle: "", followers: 0 },
  });

  const [matches, setMatches] = useState([]);
  const [lastQuiz, setLastQuiz] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("Profile");
  const [builderDraft, setBuilderDraft] = useState(null);
  const [autoPulled, setAutoPulled] = useState(false);
  const [genLoading, setGenLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        if (isDemo) {
          setLastQuiz(null);
          setBuilderDraft(profile);
          setAutoPulled(true);
          setLoading(false);
          return;
        }

        const [p, s] = await Promise.all([
          getProfile(userId).catch(() => null),
          getSocials(userId).catch(() => null),
        ]);

        const nextProfile = p || {
          id: userId,
          email: session?.user?.email || "demo@rootd.app",
          full_name: "Demo Athlete",
          school: "",
          preferred_radius_miles: 10,
          photo_url: "https://images.unsplash.com/photo-1521417531039-95e097c6bd66?q=80&w=640&auto=format&fit=crop",
        };
        const nextSocials = { ...socials, ...(s || {}) };
        setProfile(nextProfile);
        setSocials(nextSocials);
        setBuilderDraft(nextProfile);
        setAutoPulled(true);
        saveDemo(nextProfile, nextSocials);

        const q = await getLatestQuizResponse(userId).catch(() => null);
        setLastQuiz(q);

        const rows = await getBusinessMatches(userId, 10).catch(() => []);
        setMatches(dedupeAndLimit(rows, 10));
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, isDemo, session?.user?.email]);

  const totalFollowers = useMemo(
    () => Object.values(socials).reduce((sum, v) => sum + (Number(v?.followers) || 0), 0),
    [socials]
  );

  const saveAll = async (patchBasics, patchSocials) => {
    setSaving(true);
    setSavedMsg("");
    try {
      const nextBasics = { ...(editing ? profile : builderDraft || profile), ...(patchBasics || {}) };
      const nextSocials = patchSocials || socials;

      if (isDemo) {
        setProfile(nextBasics);
        setSocials(nextSocials);
        saveDemo(nextBasics, nextSocials);
        setEditing(false);
        setTab("Profile");
        setSavedMsg("Saved locally (Demo Mode)");
        return;
      }

      const savedBasics = await upsertProfileBasics(userId, nextBasics);
      const savedSocials = await upsertSocials(userId, nextSocials);
      setProfile(savedBasics);
      setSocials(savedSocials);
      saveDemo(savedBasics, savedSocials);
      setEditing(false);
      setTab("Profile");
      setSavedMsg("Saved");
    } catch (err) {
      console.error("[saveAll]", err);
      setSavedMsg("Save failed");
    } finally {
      setSaving(false);
      setTimeout(() => setSavedMsg(""), 2500);
    }
  };

  const getGeo = () =>
    new Promise((resolve) => {
      if (!("geolocation" in navigator)) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve(null),
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 600000 }
      );
    });

  async function handleGenerateMatches() {
    if (!userId) return;
    setGenLoading(true);
    try {
      const latest = await getLatestQuizResponse(userId).catch(() => null);
      if (!latest?.id) {
        alert("Complete the quiz first.");
        return;
      }

      const geo = await getGeo();
      const radiusMiles = Number((builderDraft || profile)?.preferred_radius_miles || 10);

      const res = await processQuiz(userId, {
        quizResponseId: latest.id,
        lat: geo?.lat,
        lng: geo?.lng,
        radiusMiles,
      });

      if (res?.error) {
        console.warn("[processQuiz]", res.error, res.detail);
        throw new Error(res.error);
      }

      // Pull fresh matches
      const rows = await getBusinessMatches(userId, 10).catch(async () => {
        const { data, error } = await supabase
          .from("business_matches")
          .select("*")
          .eq("athlete_id", userId)
          .order("created_at", { ascending: false });
        if (error) throw error;
        return data || [];
      });

      setMatches(dedupeAndLimit(rows, 10));
      setTab("My Matches");
      setSavedMsg("New matches loaded");
      setTimeout(() => setSavedMsg(""), 2500);
    } catch (e) {
      console.error("[handleGenerateMatches]", e);
      alert("Could not generate matches. Check Edge Function logs.");
    } finally {
      setGenLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <div className="subtle">Loading your dashboard…</div>
      </div>
    );
  }

  const viewing = editing ? profile : builderDraft || profile;

  return (
    <div style={{ padding: "24px", maxWidth: 1200, margin: "0 auto" }}>
      {isDemo && (
        <div style={{ marginBottom: 10, padding: "8px 10px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#EFF6FF", color: "#1D4ED8", fontSize: 13 }}>
          Demo Mode: changes save to your browser only.
        </div>
      )}

      <section style={{ ...surface, padding: 20, background: "radial-gradient(1200px 400px at 20% -10%, #eef2ff 0%, rgba(238,242,255,0) 70%) #fff", position: "relative" }}>
        {savedMsg && (
          <div style={{ position: "absolute", top: 12, right: 12, background: "#111827", color: "#fff", padding: "6px 10px", borderRadius: 8, fontSize: 12 }}>
            {savedMsg}
          </div>
        )}

        <div style={{ display: "flex", gap: 16 }}>
          <Avatar photoUrl={viewing?.photo_url} name={viewing?.full_name} />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h2 style={{ margin: 0, color: "#0f172a" }}>{viewing?.full_name || "—"}</h2>
              <StatusPill label={editing ? "Edit Mode" : tab === "Profile Builder" ? "Profile Builder" : "View Mode"} tone={editing || tab === "Profile Builder" ? "amber" : "slate"} />
            </div>
            <div style={{ color: "#64748b", marginTop: 4, fontSize: 14 }}>
              {viewing?.school || "Add school"} • Pref radius: {viewing?.preferred_radius_miles ?? 10} miles
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {!editing ? (
              <>
                <button style={pill} onClick={() => { setEditing(true); setTab("Profile"); }}>✏️ Edit</button>
                <button style={ghost} onClick={async () => { await supabase.auth.signOut(); window.location.href = "/login"; }}>Sign out</button>
              </>
            ) : (
              <>
                <button style={pill} onClick={() => saveAll()} disabled={saving}>{saving ? "Saving…" : "Save All"}</button>
                <button style={ghost} onClick={() => setEditing(false)}>Cancel</button>
              </>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          <button style={tabBtn(tab === "Profile")} onClick={() => setTab("Profile")}>Profile</button>
          <button style={tabBtn(tab === "Profile Builder")} onClick={() => setTab("Profile Builder")}>Profile Builder</button>
          <button style={tabBtn(tab === "My Matches")} onClick={() => setTab("My Matches")}>My Matches</button>
        </div>
      </section>

      {tab === "Profile" && (
        <>
          <section style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 16 }}>
            <StatCard label="Active Deals" value="2" />
            <StatCard label="Compliance" value="All Clear" />
            <StatCard label="Total Followers" value={totalFollowers.toLocaleString()} />
          </section>

          <section style={{ ...surface, padding: 20, marginTop: 16 }}>
            {!editing ? (
              <>
                <h3 style={{ margin: "0 0 10px", color: "#0f172a" }}>My Profile</h3>
                <BasicsReadOnly profile={profile} />
                <div style={{ marginTop: 16 }}>
                  <SocialsReadOnly socials={socials} />
                </div>
              </>
            ) : (
              <>
                <h3 style={{ margin: "0 0 10px", color: "#0f172a" }}>Edit Profile</h3>
                <EditBasics
                  profile={profile}
                  onSave={(patch) => saveAll(patch)}
                  onCancel={() => setEditing(false)}
                  onLocalChange={(patch) => setProfile((p) => ({ ...p, ...patch }))}
                  saving={saving}
                />
              </>
            )}
          </section>
        </>
      )}

      {tab === "Profile Builder" && (
        <section style={{ ...surface, padding: 20, marginTop: 16 }}>
          <h3 style={{ margin: "0 0 8px", color: "#0f172a" }}>Auto-pulled Profile</h3>
          {autoPulled && (
            <div style={{ marginBottom: 12, padding: "8px 10px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#FFFBEB", color: "#92400E", fontSize: 13 }}>
              Prefilled from your latest quiz and socials. Review and save to publish.
            </div>
          )}
          <BuilderForm
            draft={builderDraft}
            socials={socials}
            onDraft={(patch) => setBuilderDraft((d) => ({ ...(d || {}), ...patch }))}
            onSocials={(k, patch) => setSocials((s) => ({ ...s, [k]: { ...(s[k] || {}), ...patch } }))}
            onSave={() => saveAll(builderDraft, socials)}
            saving={saving}
          />
        </section>
      )}

      {tab === "My Matches" && (
        <section style={{ ...surface, padding: 20, marginTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, color: "#0f172a" }}>My Matches</h3>
            <button style={{ ...pill, opacity: genLoading ? 0.7 : 1 }} onClick={handleGenerateMatches} disabled={genLoading}>
              {genLoading ? "Generating…" : "Generate new matches"}
            </button>
          </div>

          <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
            {matches.length === 0 ? (
              <div className="subtle" style={{ color: "#64748b" }}>
                No matches yet. Click “Generate new matches”.
              </div>
            ) : (
              matches.map((m, i) => (
                <MatchCard
                  key={`${m.business_place_id || m.place_id || m.id || i}-${m.created_at || i}`}
                  m={normalizeMatch(m)}          // includes identifiers
                  athleteId={userId || "demo-user"}
                />
              ))
            )}
          </div>
        </section>
      )}
    </div>
  );
}

/* Normalizer — now preserves identifiers used by MatchCard → generate-pitch */
function normalizeMatch(m) {
  return {
    id: m.id || m.place_id || m.business_place_id || `${m.name}|${m.address}`,
    name: m.name || "Business",
    rating: typeof m.business_rating === "number" ? m.business_rating : m.rating,
    category: m.category || "local",
    address: m.address || m.vicinity || "",
    website: m.website || null,
    reason: m.reason || (typeof m.match_score === "number" ? `Match score ${(m.match_score * 100).toFixed(0)}%` : null),

    // ✅ preserve identifiers so MatchCard can send them to the function
    business_place_id: m.business_place_id ?? m.place_id ?? null,
    place_id: m.place_id ?? null,
    business_id: m.business_id ?? null,
  };
}

/* Subcomponents */
function Avatar({ photoUrl, name }) {
  const initials = (name || "").split(" ").map((n) => n[0]).join("").slice(0, 2) || "A";
  return (
    <div style={{ width: 72, height: 72, borderRadius: "50%", overflow: "hidden", border: "2px solid #e5e7eb", background: "#f8fafc", display: "grid", placeItems: "center" }}>
      {photoUrl ? (<img src={photoUrl} alt={name || "profile"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />) : (<span style={{ fontWeight: 800, color: "#0f172a" }}>{initials}</span>)}
    </div>
  );
}
function StatusPill({ label, tone = "slate" }) {
  const tones = { amber: { bg: "#FEF3C7", fg: "#92400E" }, slate: { bg: "#E2E8F0", fg: "#334155" } };
  const t = tones[tone];
  return (<span style={{ padding: "2px 8px", borderRadius: 999, background: t.bg, color: t.fg, fontSize: 12, fontWeight: 600 }}>{label}</span>);
}
function BasicsReadOnly({ profile }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      <KV k="Name" v={profile?.full_name || "—"} />
      <KV k="Email" v={profile?.email || "—"} />
      <KV k="School" v={profile?.school || "—"} />
      <KV k="Preferred radius" v={`${profile?.preferred_radius_miles ?? 10} miles`} />
      {profile?.sport && <KV k="Sport" v={profile.sport} />}
      {profile?.class_year && <KV k="Class Year" v={profile.class_year} />}
    </div>
  );
}
function EditBasics({ profile, saving, onSave, onCancel, onLocalChange }) {
  const [full_name, setName] = useState(profile?.full_name || "");
  const [school, setSchool] = useState(profile?.school || "");
  const [preferred_radius_miles, setMiles] = useState(Number(profile?.preferred_radius_miles || 10));
  const [photo_url, setPhoto] = useState(profile?.photo_url || "");
  useEffect(() => { onLocalChange?.({ full_name, school, preferred_radius_miles, photo_url }); }, [full_name, school, preferred_radius_miles, photo_url]); // eslint-disable-line
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(220px, 1fr))", gap: 12 }}>
        <Labeled label="Full name"><input className="input" value={full_name} onChange={(e) => setName(e.target.value)} placeholder="Your name" /></Labeled>
        <Labeled label="School"><input className="input" value={school} onChange={(e) => setSchool(e.target.value)} placeholder="e.g. Stanford University" /></Labeled>
        <Labeled label="Preferred radius (miles)"><input className="input" type="number" min="1" value={preferred_radius_miles} onChange={(e) => setMiles(Number(e.target.value) || 1)} /></Labeled>
        <Labeled label="Profile photo URL"><input className="input" value={photo_url} onChange={(e) => setPhoto(e.target.value)} placeholder="https://…" /></Labeled>
      </div>
      <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
        <button style={pill} onClick={() => onSave({ full_name, school, preferred_radius_miles, photo_url })} disabled={saving}>{saving ? "Saving…" : "Save"}</button>
        <button style={ghost} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
function BuilderForm({ draft, socials, onDraft, onSocials, onSave, saving }) {
  const d = draft || {};
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(220px, 1fr))", gap: 12 }}>
        <Labeled label="Full name"><input className="input" value={d.full_name || ""} onChange={(e) => onDraft({ full_name: e.target.value })} placeholder="Your name" /></Labeled>
        <Labeled label="Email"><input className="input" value={d.email || ""} onChange={(e) => onDraft({ email: e.target.value })} placeholder="you@school.edu" /></Labeled>
        <Labeled label="School"><input className="input" value={d.school || ""} onChange={(e) => onDraft({ school: e.target.value })} placeholder="e.g. Stanford University" /></Labeled>
        <Labeled label="Sport"><input className="input" value={d.sport || ""} onChange={(e) => onDraft({ sport: e.target.value })} placeholder="e.g. Swimming" /></Labeled>
        <Labeled label="Class Year"><input className="input" value={d.class_year || ""} onChange={(e) => onDraft({ class_year: e.target.value })} placeholder="e.g. Senior" /></Labeled>
        <Labeled label="Preferred radius (miles)"><input className="input" type="number" min="1" value={Number(d.preferred_radius_miles || 10)} onChange={(e) => onDraft({ preferred_radius_miles: Number(e.target.value) || 1 })} /></Labeled>
        <Labeled label="Profile photo URL"><input className="input" value={d.photo_url || ""} onChange={(e) => onDraft({ photo_url: e.target.value })} placeholder="https://…" /></Labeled>
      </div>
      <h4 style={{ margin: "14px 0 6px", fontSize: 14, fontWeight: 700 }}>Social Accounts</h4>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(260px, 1fr))", gap: 12 }}>
        {PLATFORMS.map((p) => (
          <div key={p.key} style={{ padding: 12, borderRadius: 12, border: "1px solid #eef2f6", background: "#f9fbfc", display: "grid", gridTemplateColumns: "1fr 140px", gap: 10 }}>
            <Labeled label={`${p.label} handle`}>
              <input className="input" value={socials?.[p.key]?.handle || ""} onChange={(e) => onSocials(p.key, { handle: e.target.value })} placeholder={`@your_${p.key}`} />
            </Labeled>
            <Labeled label="Followers">
              <input className="input" type="number" min="0" value={Number(socials?.[p.key]?.followers || 0)} onChange={(e) => onSocials(p.key, { followers: Number(e.target.value) || 0 })} />
            </Labeled>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
        <button className="btn btn-primary" style={pill} onClick={onSave} disabled={saving}>{saving ? "Saving…" : "Save Profile"}</button>
        <div className="subtle" style={{ alignSelf: "center" }}>
          Total followers: <strong>{PLATFORMS.reduce((n, p) => n + (Number(socials?.[p.key]?.followers) || 0), 0).toLocaleString()}</strong>
        </div>
      </div>
    </>
  );
}
function SocialsReadOnly({ socials }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(260px, 1fr))", gap: 12 }}>
      {PLATFORMS.map((p) => {
        const v = socials?.[p.key] || {};
        const handleText = v.handle ? (v.handle.startsWith("@") ? v.handle : "@" + v.handle) : "";
        return (
          <div key={p.key} style={{ padding: 12, borderRadius: 12, border: "1px solid #eef2f6", background: "#f9fbfc" }}>
            <div style={{ fontSize: 12, color: "#6b7280" }}>{p.label}</div>
            <div style={{ fontWeight: 700 }}>
              {v.handle ? <a href={socialUrl(p.key, v.handle)} target="_blank" rel="noreferrer">{handleText}</a> : <span style={{ color: "#94a3b8" }}>@handle</span>}
            </div>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>Followers: <strong>{Number(v.followers || 0).toLocaleString()}</strong></div>
          </div>
        );
      })}
    </div>
  );
}
function KV({ k, v }) {
  return (<div style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid #eef2f6", background: "#f9fbfc" }}><div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>{k}</div><div style={{ fontSize: 15, color: "#0f172a" }}>{v}</div></div>);
}
function StatCard({ label, value }) { return (<div style={{ ...surface, padding: 16 }}><div style={{ fontSize: 13, color: "#6b7280", marginBottom: 6 }}>{label}</div><div style={{ fontSize: 28, fontWeight: 900, color: "#0f172a" }}>{value}</div></div>); }
function Labeled({ label, children }) { return (<label style={{ fontSize: 13, color: "#475569", display: "grid", gap: 6 }}><span>{label}</span>{children}</label>); }

const PLATFORMS = [
  { key: "instagram", label: "Instagram" },
  { key: "tiktok", label: "TikTok" },
  { key: "youtube", label: "YouTube" },
  { key: "twitter", label: "X (Twitter)" },
  { key: "facebook", label: "Facebook" },
  { key: "linkedin", label: "LinkedIn" },
];
