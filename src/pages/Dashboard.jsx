// src/pages/Dashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthProvider.jsx";
import {
  getProfile,
  upsertProfileBasics,
  getSocials,
  upsertSocials,
  getLatestQuizResponse,
} from "../lib/api.js";
// PDF builder
import { jsPDF } from "jspdf";
;

/* ---------- Local persistence so Athlete/Director share demo state ---------- */
const LS_KEY = "rootd_demo_profile_v3";
function loadDemo() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "{}"); } catch { return {}; }
}
function saveDemo(profile, socials) {
  try { localStorage.setItem(LS_KEY, JSON.stringify({ profile, socials })); } catch {}
}

/* ---------- UI tokens ---------- */
const surface = {
  background: "#ffffff",
  border: "1px solid #e9edf1",
  boxShadow: "0 12px 30px rgba(15,23,42,.07)",
  borderRadius: 16,
};
const pill = {
  padding: "8px 12px",
  borderRadius: 12,
  border: "1px solid #111827",
  background: "#111827",
  color: "#fff",
  cursor: "pointer",
};
const ghost = {
  padding: "8px 12px",
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  background: "#fff",
  color: "#111827",
  cursor: "pointer",
};
const tabBtn = (active) => ({
  padding: "8px 12px",
  borderRadius: 10,
  border: "1px solid #E5E7EB",
  background: active ? "#111827" : "#fff",
  color: active ? "#fff" : "#111827",
  cursor: "pointer",
  fontWeight: 600,
});

/* ---------- Heuristics to auto-pull profile from quiz + socials ---------- */
function synthesizeProfileFromQuiz({ quiz, authEmail, currentProfile }) {
  if (!quiz?.responses) return {};
  const r = quiz.responses;
  const full_name = typeof r[0] === "string" ? r[0] : currentProfile?.full_name;
  const school = typeof r[1] === "string" ? r[1] : currentProfile?.school;
  const sport = typeof r[2] === "string" ? r[2] : currentProfile?.sport;
  const class_year = typeof r[3] === "string" ? r[3] : currentProfile?.class_year;
  const preferred_radius_miles = Number(r[10]) > 0 ? Number(r[10]) : currentProfile?.preferred_radius_miles;

  let photo_url = currentProfile?.photo_url;
  if (!photo_url) {
    if (typeof r[12] === "string" && r[12].startsWith("http")) {
      photo_url = r[12];
    } else if (sport) {
      const map = {
        Football: "https://images.unsplash.com/photo-1602071797486-4578a0948c3f?q=80&w=800&auto=format&fit=crop",
        Basketball: "https://images.unsplash.com/photo-1519861531473-9200262188bf?q=80&w=800&auto=format&fit=crop",
        Swimming: "https://images.unsplash.com/photo-1519315901367-f34ff9154487?q=80&w=800&auto=format&fit=crop",
        Soccer: "https://images.unsplash.com/photo-1486286701208-1d58e9338013?q=80&w=800&auto=format&fit=crop",
      };
      photo_url = map[sport] || "https://images.unsplash.com/photo-1521417531039-95e097c6bd66?q=80&w=800&auto=format&fit=crop";
    }
  }
  const email = currentProfile?.email || authEmail || "demo@rootd.app";
  return { full_name, school, sport, class_year, preferred_radius_miles, photo_url, email };
}
function mergeProfile(current, inferred) {
  const next = { ...current };
  for (const [k, v] of Object.entries(inferred)) {
    if (v === undefined || v === null || v === "") continue;
    if (next[k] === undefined || next[k] === null || next[k] === "") next[k] = v;
  }
  return next;
}

/* ---------- Social URL helpers ---------- */
const PLATFORM_URLS = {
  instagram: (h) => `https://instagram.com/${h}`,
  tiktok: (h) => `https://www.tiktok.com/@${h}`,
  youtube: (h) => /^https?:\/\//i.test(h) ? h : `https://www.youtube.com/@${h}`,
  twitter: (h) => `https://twitter.com/${h}`,
  facebook: (h) => `https://www.facebook.com/${h}`,
  linkedin: (h) => `https://www.linkedin.com/in/${h}`,
};
function handleToUrl(key, handle) {
  if (!handle) return null;
  if (/^https?:\/\//i.test(handle)) return handle;
  const clean = handle.replace(/^@/, "").trim();
  const fn = PLATFORM_URLS[key];
  return fn ? fn(clean) : null;
}

/* ---------- Matches helper (demo logic) ---------- */
function generateMatchesFromQuiz({ quiz, profile, socials }) {
  const interests = Array.isArray(quiz?.responses?.[8]) ? quiz.responses[8] : [];
  const radius = Number(profile?.preferred_radius_miles || 10);
  const sport = profile?.sport || "Athlete";
  const fol = Object.values(socials || {}).reduce((n, v) => n + (Number(v?.followers) || 0), 0);

  // toy catalog
  const catalog = [
    { name: "FuelUp Smoothies", category: "Food & Beverage", tags: ["health", "smoothie", "fitness"] },
    { name: "Stride Kicks", category: "Retail", tags: ["shoes", "apparel", "running"] },
    { name: "Campus Coffee Co.", category: "Cafe", tags: ["coffee", "study", "breakfast"] },
    { name: "Hydra Gym", category: "Fitness", tags: ["gym", "training", "wellness"] },
    { name: "Peak Nutrition", category: "Supplements", tags: ["health", "nutrition", "protein"] },
    { name: "City Sports PT", category: "Healthcare", tags: ["recovery", "rehab", "mobility"] },
    { name: "Local Auto Group", category: "Auto", tags: ["cars", "dealership"] },
  ];

  const scored = catalog
    .map((c) => {
      const overlap = c.tags.filter((t) => interests.map((s) => String(s).toLowerCase()).includes(String(t).toLowerCase())).length;
      const score = overlap * 3 + (fol > 5000 ? 2 : 0) + (sport?.toLowerCase().includes("basket") && c.category === "Retail" ? 1 : 0);
      const distance = Math.max(1, Math.min(radius, Math.floor(Math.random() * radius) + 1));
      return { ...c, score, distance };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((m, i) => ({
      id: `${m.name}-${i}`,
      name: m.name,
      category: m.category,
      distance: `${m.distance} mi`,
      reason: `Matched on ${m.tags.slice(0, 2).join(", ") || "local fit"}`,
      suggestedOffer: i < 2 ? "$250 post + product" : "$100 story + product",
    }));

  return scored;
}

/* ---------- Media Kit PDF ---------- */
function buildMediaKitPDF({ profile, socials }) {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const margin = 48;
  const line = (y) => doc.line(margin, y, 612 - margin, y);

  const totalFollowers = Object.values(socials || {}).reduce(
    (n, v) => n + (Number(v?.followers) || 0),
    0
  );
  const interests =
    Array.isArray(profile?.interests) && profile.interests.length
      ? profile.interests
      : [];

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(profile?.full_name || "Athlete", margin, 72);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(
    `${profile?.school || ""}${profile?.sport ? " • " + profile.sport : ""}${
      profile?.class_year ? " • " + profile.class_year : ""
    }`,
    margin,
    92
  );
  line(108);

  // Bio
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Bio", margin, 132);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const bio =
    profile?.bio ||
    "Student-athlete available for local partnerships. Community-focused and brand-safe.";
  const wrapText = (t, maxWidth) => doc.splitTextToSize(t, maxWidth);
  doc.text(wrapText(bio, 612 - margin * 2), margin, 150);

  // Socials
  let y = 210;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Audience", margin, y);
  y += 12;
  line(y);
  y += 16;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Total followers: ${totalFollowers.toLocaleString()}`, margin, y);
  y += 18;

  PLATFORMS.forEach((p) => {
    const v = socials?.[p.key] || {};
    const handle = v.handle ? (v.handle.startsWith("@") ? v.handle : "@" + v.handle) : "";
    doc.text(
      `${p.label}: ${handle || "—"} • ${Number(v.followers || 0).toLocaleString()} followers`,
      margin,
      y
    );
    y += 16;
  });

  // Interests
  y += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Interests", margin, y);
  y += 12;
  line(y);
  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(
    interests.length ? interests.join(", ") : "Add interests in your profile.",
    margin,
    y
  );

  // Contact
  y += 28;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Contact", margin, y);
  y += 12;
  line(y);
  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`${profile?.email || "email@school.edu"}`, margin, y);

  const filename = `${(profile?.full_name || "media_kit").replace(/\s+/g, "_")}_Media_Kit.pdf`;
  doc.save(filename);
}

/* ============================== COMPONENT ============================== */
export default function Dashboard() {
  const { session, signOut } = useAuth?.() ?? { session: null, signOut: () => {} };
  const userId = session?.user?.id || null;
  const isDemo = !userId;

  const seed = loadDemo();
  const [profile, setProfile] = useState(
    seed.profile || {
      id: userId || "demo-user",
      email: session?.user?.email || "demo@rootd.app",
      full_name: "Demo Athlete",
      school: "",
      preferred_radius_miles: 10,
      photo_url:
        "https://images.unsplash.com/photo-1521417531039-95e097c6bd66?q=80&w=640&auto=format&fit=crop",
      interests: [], // for media kit
    }
  );
  const [socials, setSocials] = useState(
    seed.socials || {
      instagram: { handle: "", followers: 0 },
      tiktok: { handle: "", followers: 0 },
      youtube: { handle: "", followers: 0 },
      twitter: { handle: "", followers: 0 },
      facebook: { handle: "", followers: 0 },
      linkedin: { handle: "", followers: 0 },
    }
  );
  const [lastQuiz, setLastQuiz] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [loading, setLoading] = useState(true);

  // Tabs: Overview | Profile Builder | My Profile | My Matches | Media Kit
  const [tab, setTab] = useState("Overview");
  const [builderDraft, setBuilderDraft] = useState(null);
  const [autoPulled, setAutoPulled] = useState(false);

  // Matches state
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    (async () => {
      setLoading(true);

      if (isDemo) {
        const q = null;
        setLastQuiz(q);
        setBuilderDraft(profile);
        setAutoPulled(true);
        setLoading(false);
        return;
      }

      const [p, s, q] = await Promise.all([
        getProfile(userId),
        getSocials(userId),
        getLatestQuizResponse(userId),
      ]);

      const nextProfile =
        p || {
          id: userId,
          email: session?.user?.email || "demo@rootd.app",
          full_name: "Demo Athlete",
          school: "",
          preferred_radius_miles: 10,
          photo_url:
            "https://images.unsplash.com/photo-1521417531039-95e097c6bd66?q=80&w=640&auto=format&fit=crop",
        };
      const nextSocials = { ...socials, ...(s || {}) };

      setProfile(nextProfile);
      setSocials(nextSocials);
      setLastQuiz(q || null);

      const inferred = synthesizeProfileFromQuiz({
        quiz: q,
        authEmail: session?.user?.email,
        currentProfile: nextProfile,
      });
      const merged = mergeProfile(nextProfile, inferred);
      setBuilderDraft(merged);
      setAutoPulled(true);
      saveDemo(merged, nextSocials);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, isDemo, session?.user?.email]);

  const totalFollowers = useMemo(
    () =>
      Object.values(socials).reduce(
        (sum, v) => sum + (Number(v?.followers) || 0),
        0
      ),
    [socials]
  );

  const saveAll = async (patchBasics, patchSocials) => {
    setSaving(true);
    setSavedMsg("");
    try {
      const nextBasics = {
        ...(editing ? profile : builderDraft || profile),
        ...(patchBasics || {}),
      };
      const nextSocials = patchSocials || socials;

      if (isDemo) {
        setProfile(nextBasics);
        setSocials(nextSocials);
        saveDemo(nextBasics, nextSocials);
        setEditing(false);
        setTab("My Profile");
        setSavedMsg("Saved locally (Demo Mode)");
        return;
      }

      const savedBasics = await upsertProfileBasics(userId, nextBasics);
      const savedSocials = await upsertSocials(userId, nextSocials);
      setProfile(savedBasics);
      setSocials(savedSocials);
      saveDemo(savedBasics, savedSocials);
      setEditing(false);
      setTab("My Profile");
      setSavedMsg("Saved");
    } catch (err) {
      console.error("[saveAll]", err);
      setSavedMsg("Save failed");
    } finally {
      setSaving(false);
      setTimeout(() => setSavedMsg(""), 2500);
    }
  };

  const viewing = editing ? profile : builderDraft || profile;

  // Actions
  const handleGenerateMatches = () => {
    const base = editing ? profile : builderDraft || profile;
    const m = generateMatchesFromQuiz({ quiz: lastQuiz, profile: base, socials });
    setMatches(m);
  };

  const handleBuildMediaKit = () => {
    const base = editing ? profile : builderDraft || profile;
    // hydrate interests from quiz if profile missing
    const quizInterests = Array.isArray(lastQuiz?.responses?.[8]) ? lastQuiz.responses[8] : [];
    const enriched = {
      ...base,
      interests:
        Array.isArray(base?.interests) && base.interests.length ? base.interests : quizInterests,
    };
    buildMediaKitPDF({ profile: enriched, socials });
  };

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <div className="subtle">Loading your dashboard…</div>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: 1200, margin: "0 auto" }}>
      {/* Demo banner */}
      {isDemo && (
        <div
          style={{
            marginBottom: 10,
            padding: "8px 10px",
            borderRadius: 10,
            border: "1px solid #e5e7eb",
            background: "#EFF6FF",
            color: "#1D4ED8",
            fontSize: 13,
          }}
        >
          Demo Mode: changes save to your browser only.
        </div>
      )}

      {/* Header */}
      <section
        style={{
          ...surface,
          padding: 20,
          background:
            "radial-gradient(1200px 400px at 20% -10%, #eef2ff 0%, rgba(238,242,255,0) 70%) #fff",
          position: "relative",
        }}
      >
        {savedMsg && (
          <div
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              background: "#111827",
              color: "#fff",
              padding: "6px 10px",
              borderRadius: 8,
              fontSize: 12,
            }}
          >
            {savedMsg}
          </div>
        )}

        <div style={{ display: "flex", gap: 16 }}>
          <Avatar photoUrl={viewing?.photo_url} name={viewing?.full_name} />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h2 style={{ margin: 0, color: "#0f172a" }}>
                {viewing?.full_name || "—"}
              </h2>
              <StatusPill
                label={
                  editing
                    ? "Edit Mode"
                    : tab === "Profile Builder"
                    ? "Profile Builder"
                    : "View Mode"
                }
                tone={editing || tab === "Profile Builder" ? "amber" : "slate"}
              />
            </div>
            <div style={{ color: "#64748b", marginTop: 4, fontSize: 14 }}>
              {viewing?.school || "Add school"} • Pref radius:{" "}
              {viewing?.preferred_radius_miles ?? 10} miles
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {!editing ? (
              <button
                style={pill}
                onClick={() => {
                  setEditing(true);
                  setTab("My Profile");
                }}
              >
                ✏️ Edit
              </button>
            ) : (
              <>
                <button style={pill} onClick={() => saveAll()} disabled={saving}>
                  {saving ? "Saving…" : "Save All"}
                </button>
                <button style={ghost} onClick={() => setEditing(false)}>
                  Cancel
                </button>
              </>
            )}
            {!isDemo && (
              <button
                style={ghost}
                onClick={() => {
                  try { signOut?.(); } catch {}
                }}
              >
                Sign Out
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          <button style={tabBtn(tab === "Overview")} onClick={() => setTab("Overview")}>
            Overview
          </button>
          <button style={tabBtn(tab === "Profile Builder")} onClick={() => setTab("Profile Builder")}>
            Profile Builder
          </button>
          <button style={tabBtn(tab === "My Profile")} onClick={() => setTab("My Profile")}>
            My Profile
          </button>
          <button style={tabBtn(tab === "My Matches")} onClick={() => setTab("My Matches")}>
            My Matches
          </button>
          <button style={tabBtn(tab === "Media Kit")} onClick={() => setTab("Media Kit")}>
            Media Kit
          </button>
        </div>
      </section>

      {/* Overview */}
      {tab === "Overview" && (
        <>
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 16,
              marginTop: 16,
            }}
          >
            <StatCard label="Active Deals" value="2" />
            <StatCard label="Compliance" value="All Clear" />
            <StatCard label="Total Followers" value={totalFollowers.toLocaleString()} />
          </section>

          <section style={{ ...surface, padding: 20, marginTop: 16 }}>
            {!editing ? (
              <BasicsReadOnly profile={profile} />
            ) : (
              <EditBasics
                profile={profile}
                onSave={(patch) => saveAll(patch)}
                onCancel={() => setEditing(false)}
                onLocalChange={(patch) => setProfile((p) => ({ ...p, ...patch }))}
                saving={saving}
              />
            )}
          </section>
        </>
      )}

      {/* Profile Builder */}
      {tab === "Profile Builder" && (
        <section style={{ ...surface, padding: 20, marginTop: 16 }}>
          <h3 style={{ margin: "0 0 8px", color: "#0f172a" }}>Auto-pulled Profile</h3>
          {autoPulled && (
            <div
              style={{
                marginBottom: 12,
                padding: "8px 10px",
                borderRadius: 10,
                border: "1px solid #e5e7eb",
                background: "#FFFBEB",
                color: "#92400E",
                fontSize: 13,
              }}
            >
              Prefilled from your latest quiz and socials. Review and save to publish.
            </div>
          )}

          <BuilderForm
            draft={builderDraft}
            socials={socials}
            onDraft={(patch) => setBuilderDraft((d) => ({ ...(d || {}), ...patch }))}
            onSocials={(k, patch) =>
              setSocials((s) => ({ ...s, [k]: { ...(s[k] || {}), ...patch } }))
            }
            onSave={() => saveAll(builderDraft, socials)}
            saving={saving}
          />

          {lastQuiz?.responses && (
            <div style={{ marginTop: 14, fontSize: 13, color: "#64748b" }}>
              <strong>From your quiz:</strong>{" "}
              {Array.isArray(lastQuiz.responses[8])
                ? lastQuiz.responses[8].slice(0, 3).join(", ")
                : "You’re set—feel free to retake anytime."}
            </div>
          )}
        </section>
      )}

      {/* My Profile */}
      {tab === "My Profile" && (
        <section style={{ ...surface, padding: 20, marginTop: 16 }}>
          <h3 style={{ margin: "0 0 10px", color: "#0f172a" }}>My Profile</h3>
          <BasicsReadOnly profile={profile} />
          <div style={{ marginTop: 16 }}>
            <SocialsReadOnly socials={socials} />
          </div>
        </section>
      )}

      {/* My Matches */}
      {tab === "My Matches" && (
        <section style={{ ...surface, padding: 20, marginTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, color: "#0f172a" }}>My Matches</h3>
            <button style={pill} onClick={handleGenerateMatches}>Generate new matches</button>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 12,
              marginTop: 12,
            }}
          >
            {matches.length === 0 ? (
              <div className="subtle" style={{ color: "#64748b" }}>
                No matches yet. Generate to see suggested partners.
              </div>
            ) : (
              matches.map((m) => (
                <div key={m.id} style={{ padding: 12, borderRadius: 12, border: "1px solid #eef2f6", background: "#f9fbfc" }}>
                  <div style={{ fontWeight: 800 }}>{m.name}</div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>{m.category} • {m.distance}</div>
                  <div style={{ marginTop: 6 }}>{m.reason}</div>
                  <div style={{ marginTop: 8, fontSize: 12, color: "#334155" }}>
                    Suggested offer: <strong>{m.suggestedOffer}</strong>
                  </div>
                  <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                    <button style={ghost}>Save</button>
                    <button style={ghost}>Contact</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {/* Media Kit */}
      {tab === "Media Kit" && (
        <section style={{ ...surface, padding: 20, marginTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, color: "#0f172a" }}>Media Kit</h3>
            <button style={pill} onClick={handleBuildMediaKit}>Build Report (PDF)</button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
            <KV k="Name" v={viewing?.full_name || "—"} />
            <KV k="Email" v={viewing?.email || "—"} />
            <KV k="School" v={viewing?.school || "—"} />
            <KV k="Sport" v={viewing?.sport || "—"} />
            <KV k="Class Year" v={viewing?.class_year || "—"} />
            <KV
              k="Preferred radius"
              v={`${viewing?.preferred_radius_miles ?? 10} miles`}
            />
          </div>

          <div style={{ marginTop: 12 }}>
            <h4 style={{ margin: "0 0 6px" }}>Social Summary</h4>
            <SocialsReadOnly socials={socials} />
          </div>

          <div style={{ marginTop: 12 }}>
            <h4 style={{ margin: "0 0 6px" }}>Interests</h4>
            <div
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid #eef2f6",
                background: "#f9fbfc",
                color: "#0f172a",
              }}
            >
              {Array.isArray(viewing?.interests) && viewing.interests.length
                ? viewing.interests.join(", ")
                : Array.isArray(lastQuiz?.responses?.[8]) && lastQuiz.responses[8].length
                ? lastQuiz.responses[8].join(", ")
                : "Add interests via Profile Builder or the quiz."}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

/* ============================== Subcomponents ============================== */
function Avatar({ photoUrl, name }) {
  const initials =
    (name || "")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2) || "A";
  return (
    <div
      style={{
        width: 72,
        height: 72,
        borderRadius: "50%",
        overflow: "hidden",
        border: "2px solid #e5e7eb",
        background: "#f8fafc",
        display: "grid",
        placeItems: "center",
      }}
    >
      {photoUrl ? (
        <img
          src={photoUrl}
          alt={name || "profile"}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <span style={{ fontWeight: 800, color: "#0f172a" }}>{initials}</span>
      )}
    </div>
  );
}
function StatusPill({ label, tone = "slate" }) {
  const tones = {
    amber: { bg: "#FEF3C7", fg: "#92400E" },
    slate: { bg: "#E2E8F0", fg: "#334155" },
  };
  const t = tones[tone];
  return (
    <span
      style={{
        padding: "2px 8px",
        borderRadius: 999,
        background: t.bg,
        color: t.fg,
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {label}
    </span>
  );
}
function BasicsReadOnly({ profile }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      <KV k="Name" v={profile?.full_name || "—"} />
      <KV k="Email" v={profile?.email || "—"} />
      <KV k="School" v={profile?.school || "—"} />
      <KV
        k="Preferred radius"
        v={`${profile?.preferred_radius_miles ?? 10} miles`}
      />
      {profile?.sport && <KV k="Sport" v={profile.sport} />}
      {profile?.class_year && <KV k="Class Year" v={profile.class_year} />}
    </div>
  );
}
function EditBasics({ profile, saving, onSave, onCancel, onLocalChange }) {
  const [full_name, setName] = useState(profile?.full_name || "");
  const [school, setSchool] = useState(profile?.school || "");
  const [preferred_radius_miles, setMiles] = useState(
    Number(profile?.preferred_radius_miles || 10)
  );
  const [photo_url, setPhoto] = useState(profile?.photo_url || "");

  useEffect(() => {
    onLocalChange?.({ full_name, school, preferred_radius_miles, photo_url });
  }, [full_name, school, preferred_radius_miles, photo_url]); // eslint-disable-line

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(220px, 1fr))",
          gap: 12,
        }}
      >
        <Labeled label="Full name">
          <input
            className="input"
            value={full_name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </Labeled>
        <Labeled label="School">
          <input
            className="input"
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            placeholder="e.g. Stanford University"
          />
        </Labeled>
        <Labeled label="Preferred radius (miles)">
          <input
            className="input"
            type="number"
            min="1"
            value={preferred_radius_miles}
            onChange={(e) => setMiles(Number(e.target.value) || 1)}
          />
        </Labeled>
        <Labeled label="Profile photo URL">
          <input
            className="input"
            value={photo_url}
            onChange={(e) => setPhoto(e.target.value)}
            placeholder="https://…"
          />
        </Labeled>
      </div>

      <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
        <button
          style={pill}
          onClick={() =>
            onSave({ full_name, school, preferred_radius_miles, photo_url })
          }
          disabled={saving}
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button style={ghost} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ---- Builder form ---- */
function BuilderForm({ draft, socials, onDraft, onSocials, onSave, saving }) {
  const d = draft || {};
  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(220px, 1fr))",
          gap: 12,
        }}
      >
        <Labeled label="Full name">
          <input
            className="input"
            value={d.full_name || ""}
            onChange={(e) => onDraft({ full_name: e.target.value })}
            placeholder="Your name"
          />
        </Labeled>
        <Labeled label="Email">
          <input
            className="input"
            value={d.email || ""}
            onChange={(e) => onDraft({ email: e.target.value })}
            placeholder="you@school.edu"
          />
        </Labeled>
        <Labeled label="School">
          <input
            className="input"
            value={d.school || ""}
            onChange={(e) => onDraft({ school: e.target.value })}
            placeholder="e.g. Stanford University"
          />
        </Labeled>
        <Labeled label="Sport">
          <input
            className="input"
            value={d.sport || ""}
            onChange={(e) => onDraft({ sport: e.target.value })}
            placeholder="e.g. Swimming"
          />
        </Labeled>
        <Labeled label="Class Year">
          <input
            className="input"
            value={d.class_year || ""}
            onChange={(e) => onDraft({ class_year: e.target.value })}
            placeholder="e.g. Senior"
          />
        </Labeled>
        <Labeled label="Preferred radius (miles)">
          <input
            className="input"
            type="number"
            min="1"
            value={Number(d.preferred_radius_miles || 10)}
            onChange={(e) =>
              onDraft({ preferred_radius_miles: Number(e.target.value) || 1 })
            }
          />
        </Labeled>
        <Labeled label="Profile photo URL">
          <input
            className="input"
            value={d.photo_url || ""}
            onChange={(e) => onDraft({ photo_url: e.target.value })}
            placeholder="https://…"
          />
        </Labeled>
      </div>

      <h4 style={{ margin: "14px 0 6px", fontSize: 14, fontWeight: 700 }}>
        Social Accounts
      </h4>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(260px, 1fr))",
          gap: 12,
        }}
      >
        {PLATFORMS.map((p) => (
          <div
            key={p.key}
            style={{
              padding: 12,
              borderRadius: 12,
              border: "1px solid #eef2f6",
              background: "#f9fbfc",
              display: "grid",
              gridTemplateColumns: "1fr 140px",
              gap: 10,
            }}
          >
            <Labeled label={`${p.label} handle`}>
              <input
                className="input"
                value={socials?.[p.key]?.handle || ""}
                onChange={(e) => onSocials(p.key, { handle: e.target.value })}
                placeholder={`@your_${p.key}`}
              />
            </Labeled>
            <Labeled label="Followers">
              <input
                className="input"
                type="number"
                min="0"
                value={Number(socials?.[p.key]?.followers || 0)}
                onChange={(e) =>
                  onSocials(p.key, { followers: Number(e.target.value) || 0 })
                }
              />
            </Labeled>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
        <button className="btn btn-primary" style={pill} onClick={onSave} disabled={saving}>
          {saving ? "Saving…" : "Save Profile"}
        </button>
        <div className="subtle" style={{ alignSelf: "center" }}>
          Total followers:{" "}
          <strong>
            {PLATFORMS.reduce(
              (n, p) => n + (Number(socials?.[p.key]?.followers) || 0),
              0
            ).toLocaleString()}
          </strong>
        </div>
      </div>
    </>
  );
}

/* ---- Read-only socials (clickable) ---- */
function SocialsReadOnly({ socials }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(260px, 1fr))",
        gap: 12,
      }}
    >
      {PLATFORMS.map((p) => {
        const v = socials?.[p.key] || {};
        const url = handleToUrl(p.key, v.handle);
        const display = v.handle || "";
        return (
          <div
            key={p.key}
            style={{
              padding: 12,
              borderRadius: 12,
              border: "1px solid #eef2f6",
              background: "#f9fbfc",
            }}
          >
            <div style={{ fontSize: 12, color: "#6b7280" }}>{p.label}</div>
            <div style={{ fontWeight: 700 }}>
              {url ? (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#0f172a", textDecoration: "underline" }}
                >
                  {display}
                </a>
              ) : display ? (
                display
              ) : (
                <span style={{ color: "#94a3b8" }}>@handle</span>
              )}
            </div>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
              Followers: <strong>{Number(v.followers || 0).toLocaleString()}</strong>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---- Small atoms ---- */
function KV({ k, v }) {
  return (
    <div
      style={{
        padding: "10px 12px",
        borderRadius: 12,
        border: "1px solid #eef2f6",
        background: "#f9fbfc",
      }}
    >
      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>{k}</div>
      <div style={{ fontSize: 15, color: "#0f172a" }}>{v}</div>
    </div>
  );
}
function StatCard({ label, value }) {
  return (
    <div style={{ ...surface, padding: 16 }}>
      <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 900, color: "#0f172a" }}>{value}</div>
    </div>
  );
}
function Labeled({ label, children }) {
  return (
    <label style={{ fontSize: 13, color: "#475569", display: "grid", gap: 6 }}>
      <span>{label}</span>
      {children}
    </label>
  );
}

const PLATFORMS = [
  { key: "instagram", label: "Instagram" },
  { key: "tiktok", label: "TikTok" },
  { key: "youtube", label: "YouTube" },
  { key: "twitter", label: "X (Twitter)" },
  { key: "facebook", label: "Facebook" },
  { key: "linkedin", label: "LinkedIn" },
];
