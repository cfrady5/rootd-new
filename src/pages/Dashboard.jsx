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

/* ---------- Local persistence so Athlete/Director share demo state ---------- */
const LS_KEY = "rootd_demo_profile_v2";
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

  // Heuristic fields (adjust indexes to your quiz schema)
  // Example assumptions:
  // r[0] = full name, r[1] = school, r[2] = primary sport, r[3] = class year,
  // r[8] = interests array, r[10] = preferred radius miles, r[12] = profile photo url
  const full_name = r[0] && typeof r[0] === "string" ? r[0] : currentProfile?.full_name;
  const school = r[1] && typeof r[1] === "string" ? r[1] : currentProfile?.school;
  const preferred_radius_miles = Number(r[10]) > 0 ? Number(r[10]) : currentProfile?.preferred_radius_miles;
  const sport = r[2] && typeof r[2] === "string" ? r[2] : undefined;
  const class_year = r[3] && typeof r[3] === "string" ? r[3] : undefined;

  let photo_url = currentProfile?.photo_url;
  if (!photo_url) {
    if (typeof r[12] === "string" && r[12].startsWith("http")) {
      photo_url = r[12];
    } else if (sport) {
      // simple themed placeholder by sport
      const map = {
        Football:
          "https://images.unsplash.com/photo-1602071797486-4578a0948c3f?q=80&w=800&auto=format&fit=crop",
        Basketball:
          "https://images.unsplash.com/photo-1519861531473-9200262188bf?q=80&w=800&auto=format&fit=crop",
        Swimming:
          "https://images.unsplash.com/photo-1519315901367-f34ff9154487?q=80&w=800&auto=format&fit=crop",
        Soccer:
          "https://images.unsplash.com/photo-1486286701208-1d58e9338013?q=80&w=800&auto=format&fit=crop",
      };
      photo_url =
        map[sport] ||
        "https://images.unsplash.com/photo-1521417531039-95e097c6bd66?q=80&w=800&auto=format&fit=crop";
    }
  }

  // Email fallback
  const email = currentProfile?.email || authEmail || "demo@rootd.app";

  return {
    full_name,
    school,
    preferred_radius_miles,
    sport,
    class_year,
    photo_url,
    email,
  };
}

function mergeProfile(current, inferred) {
  // Only fill missing fields so we never overwrite user-entered basics
  const next = { ...current };
  for (const [k, v] of Object.entries(inferred)) {
    if (v === undefined || v === null || v === "") continue;
    if (next[k] === undefined || next[k] === null || next[k] === "") {
      next[k] = v;
    }
  }
  return next;
}

/* ============================== COMPONENT ============================== */

export default function Dashboard() {
  const { session } = useAuth?.() ?? { session: null };
  const userId = session?.user?.id || "demo-user";

  const seed = loadDemo();
  const [profile, setProfile] = useState(
    seed.profile || {
      id: userId,
      email: session?.user?.email || "demo@rootd.app",
      full_name: "Demo Athlete",
      school: "",
      preferred_radius_miles: 10,
      photo_url:
        "https://images.unsplash.com/photo-1521417531039-95e097c6bd66?q=80&w=640&auto=format&fit=crop",
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
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("Overview"); // "Overview" | "Profile Builder" | "My Profile"

  // Auto-pulled draft for the Profile Builder
  const [builderDraft, setBuilderDraft] = useState(null);
  const [autoPulled, setAutoPulled] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
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

      // Build a draft from quiz the first time
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
  }, [userId, session?.user?.email]);

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
    try {
      const nextBasics = { ...(editing ? profile : builderDraft || profile), ...(patchBasics || {}) };
      const cleanedSocials = Object.fromEntries(
        Object.entries(patchSocials ? patchSocials : socials).map(([k, v]) => [
          k,
          { handle: v.handle || "", followers: Number(v.followers) || 0 },
        ])
      );
      await Promise.all([
        upsertProfileBasics(userId, nextBasics),
        upsertSocials(userId, cleanedSocials),
      ]);
      setProfile(nextBasics);
      setSocials(cleanedSocials);
      saveDemo(nextBasics, cleanedSocials);
      setEditing(false);
      setTab("My Profile");
    } finally {
      setSaving(false);
    }
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
      {/* Header */}
      <section
        style={{
          ...surface,
          padding: 20,
          background:
            "radial-gradient(1200px 400px at 20% -10%, #eef2ff 0%, rgba(238,242,255,0) 70%) #fff",
        }}
      >
        <div style={{ display: "flex", gap: 16 }}>
          <Avatar photoUrl={(editing ? profile : builderDraft || profile)?.photo_url} name={(editing ? profile : builderDraft || profile)?.full_name} />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h2 style={{ margin: 0, color: "#0f172a" }}>
                {(editing ? profile : builderDraft || profile)?.full_name || "—"}
              </h2>
              <StatusPill
                label={editing ? "Edit Mode" : tab === "Profile Builder" ? "Profile Builder" : "View Mode"}
                tone={editing || tab === "Profile Builder" ? "amber" : "slate"}
              />
            </div>
            <div style={{ color: "#64748b", marginTop: 4, fontSize: 14 }}>
              {(editing ? profile : builderDraft || profile)?.school || "Add school"} • Pref radius:{" "}
              {(editing ? profile : builderDraft || profile)?.preferred_radius_miles ?? 10} miles
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {!editing ? (
              <button style={pill} onClick={() => { setEditing(true); setTab("My Profile"); }}>
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
        </div>
      </section>

      {/* Tabs content */}
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
                saving={saving}
                onSave={(patch) => saveAll(patch)}
                onCancel={() => setEditing(false)}
                onLocalChange={(patch) => setProfile((p) => ({ ...p, ...patch }))}
              />
            )}
          </section>
        </>
      )}

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
            onSocials={(k, patch) => setSocials((s) => ({ ...s, [k]: { ...(s[k] || {}), ...patch } }))}
            onSave={() => saveAll(builderDraft, socials)}
            saving={saving}
          />

          {/* Quiz context hint */}
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

      {tab === "My Profile" && (
        <section style={{ ...surface, padding: 20, marginTop: 16 }}>
          <h3 style={{ margin: "0 0 10px", color: "#0f172a" }}>My Profile</h3>
          <BasicsReadOnly profile={profile} />
          <div style={{ marginTop: 16 }}>
            <SocialsReadOnly socials={socials} />
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
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 12,
      }}
    >
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

/* ---- Edit basics for Overview tab ---- */
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

/* ---- Builder form with auto-pulled values ---- */
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
                onChange={(e) =>
                  onSocials(p.key, { handle: e.target.value })
                }
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
