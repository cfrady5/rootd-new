// /src/pages/QuizPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import quizQuestions, { quizQuestions as namedQuiz } from "../data/quizQuestions.js";
import { useAuth } from "../auth/AuthProvider.jsx";
import supabase from "../lib/supabaseClient.js";
import { normalizeForScorer } from "../lib/quizMap.js";
import { runProcessQuiz } from "../lib/api.js";

const green = "var(--accent-500)";
const hair = "var(--border)";
const muted = "var(--muted)";
const QUESTIONS = quizQuestions || namedQuiz;
const LS_KEY = "rootd_quiz_v2";

function Progress({ current, total }) {
  const pct = Math.round(((current + 1) / total) * 100);
  return (
    <div>
      <div aria-hidden style={{ height: 10, borderRadius: 999, background: "#EEF4F7", border: `1px solid ${hair}`, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: green, transition: "width .2s ease" }} />
      </div>
      <div className="subtle" style={{ marginTop: 6, fontWeight: 800 }}>
        {pct}% complete · {current + 1} of {total}
      </div>
    </div>
  );
}
function CategoryChip({ text }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 10px",
        borderRadius: 999,
        border: `1px solid ${hair}`,
        background: "#F7FAFC",
        color: muted,
        fontWeight: 800,
        fontSize: 12,
      }}
    >
      {text}
    </span>
  );
}
function Pill({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="btn"
      style={{
        borderRadius: 999,
        padding: "10px 14px",
        borderColor: active ? "transparent" : "#D8E4EC",
        background: active ? green : "#F8FAFB",
        color: active ? "#fff" : "#0D1113",
        fontWeight: 800,
        height: 42,
      }}
    >
      {children}
    </button>
  );
}
function CheckPill({ checked, onToggle, children }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="btn"
      style={{
        borderRadius: 999,
        padding: "10px 14px",
        borderColor: checked ? "transparent" : "#D8E4EC",
        background: checked ? "#E9F8EF" : "#F8FAFB",
        color: "#0D1113",
        fontWeight: 800,
        height: 42,
      }}
    >
      <span
        style={{
          display: "inline-grid",
          placeItems: "center",
          width: 18,
          height: 18,
          borderRadius: 4,
          marginRight: 8,
          background: checked ? green : "#fff",
          border: `1px solid ${checked ? green : hair}`,
        }}
        aria-hidden
      >
        {checked ? (
          <svg width="12" height="12" viewBox="0 0 20 20">
            <path d="M5 10l3 3 7-7" fill="none" stroke="#fff" strokeWidth="2" />
          </svg>
        ) : null}
      </span>
      {children}
    </button>
  );
}

export default function QuizPage() {
  const navigate = useNavigate();
  const { session } = (useAuth?.() ?? {});
  const total = QUESTIONS.length;

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [previewReach, setPreviewReach] = useState(0);

  useEffect(() => {
    if (useAuth && session === null) {
      const t = setTimeout(() => navigate("/login"), 200);
      return () => clearTimeout(t);
    }
  }, [session, navigate]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
      if (saved.answers) setAnswers(saved.answers);
      if (Number.isFinite(saved.step)) setStep(saved.step);
    } catch {
      // ignore localStorage parse errors
    }
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ step, answers }));
    } catch {
      // ignore localStorage write errors
    }
  }, [step, answers]);

  const q = useMemo(() => QUESTIONS[step], [step]);

  // (keydown handler moved below after canContinue is declared)

  // Attempt geolocation once on mount to prefill answers lat/lng
  useEffect(() => {
    let mounted = true;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (!mounted) return;
          setAnswers((a) => ({ ...(a || {}), lat: pos.coords.latitude, lng: pos.coords.longitude, preferred_radius_miles: 10 }));
        },
        () => {
          // ignore geolocation permission errors
        },
        { maximumAge: 1000 * 60 * 5 }
      );
    }
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    try {
      const norm = normalizeForScorer(answers);
      const totalFollowers = Object.values(norm.following || {}).reduce((a, b) => a + Number(b || 0), 0);
      const reach = Math.max(0, Math.min(1, Math.log10(totalFollowers + 1) / 6));
      setPreviewReach(reach);
    } catch {
      // normalization failed; default previewReach to 0
      setPreviewReach(0);
    }
  }, [answers]);

  const setValue = (val) =>
    setAnswers((prev) => ({
      ...prev,
      [q.id]: val,
    }));

  const toggleRanked = (opt) => {
    const v = Array.isArray(answers[q.id]) ? answers[q.id] : [];
    if (v.includes(opt)) {
      setValue(v.filter((x) => x !== opt));
    } else {
      const max = q.max || 3;
      setValue(v.length >= max ? [...v.slice(1), opt] : [...v, opt]);
    }
  };
  const clearRanked = () => setValue([]);

  const canContinue = useMemo(() => {
    if (!q) return false;
    const v = answers[q.id];
    if (q.type === "text") return Boolean(String(v ?? "").trim());
    if (q.type === "single") return !!v;
    if (q.type === "multiple") return Array.isArray(v) && v.length > 0;
    if (q.type === "slider") return typeof v === "number";
    if (q.type === "multiNumber") {
      const obj = v || {};
      return Object.values(obj).some((n) => Number(n) > 0);
    }
    if (q.type === "ranked") {
      const max = q.max || 3;
      return Array.isArray(v) && v.length > 0 && v.length <= max;
    }
    return false;
  }, [answers, q]);

  // keydown handler (ArrowLeft/ArrowRight). Runs after `canContinue` is computed.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight" && canContinue && step < total - 1) setStep((s) => s + 1);
      if (e.key === "ArrowLeft" && step > 0) setStep((s) => s - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [canContinue, step, total]);

  const handleNext = () => setStep((s) => Math.min(total - 1, s + 1));
  const handleBack = () => setStep((s) => Math.max(0, s - 1));

  const submit = async () => {
    setSaving(true);
    setError("");
    try {
      for (const item of QUESTIONS) {
        const v = answers[item.id];
        if (item.type === "text" && !(v && String(v).trim())) throw new Error(`Please answer question ${item.id}.`);
        if (item.type === "single" && !v) throw new Error(`Please answer question ${item.id}.`);
        if (item.type === "multiple" && (!Array.isArray(v) || v.length === 0)) throw new Error(`Please answer question ${item.id}.`);
        if (item.type === "slider" && typeof v !== "number") throw new Error(`Please answer question ${item.id}.`);
        if (item.type === "multiNumber") {
          const obj = v || {};
          if (!Object.values(obj).some((n) => Number(n) > 0)) throw new Error(`Please enter at least one follower count for question ${item.id}.`);
        }
        if (item.type === "ranked") {
          const arr = Array.isArray(v) ? v : [];
          if (arr.length === 0) throw new Error(`Please choose at least one option for question ${item.id}.`);
          if (item.max && arr.length > item.max) throw new Error(`Select up to ${item.max} items for question ${item.id}.`);
        }
      }
      if (!session?.user?.id) throw new Error("You must be signed in to submit the quiz.");

      const normalized = normalizeForScorer(answers);
      const { data: { session: fresh } } = await supabase.auth.getSession();
      const jwt = fresh?.access_token;
      if (!jwt) throw new Error("Auth expired. Sign in again.");

      // Use centralized helper which calls the process-quiz function
      const out = await runProcessQuiz(jwt, { answers: normalized, ...normalized });
      if (!out || !out.ok) throw new Error(out?.error || "Function error");

  try { localStorage.removeItem(LS_KEY); } catch { /* ignore */ }
      navigate("/dashboard/matches", { state: { rootd_score: out.rootd_score, components: out.components } });
    } catch (e) {
      setError(e.message || "There was a problem submitting your answers.");
    } finally {
      setSaving(false);
    }
  };

  if (!q) return null;

  const renderQuestion = () => {
    if (q.type === "single") {
      const v = answers[q.id];
      return (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
          {q.options.map((opt) => (
            <Pill key={opt} active={v === opt} onClick={() => setValue(opt)}>
              {opt}
            </Pill>
          ))}
        </div>
      );
    }

    if (q.type === "multiple") {
      const v = Array.isArray(answers[q.id]) ? answers[q.id] : [];
      const toggle = (opt) => setValue(v.includes(opt) ? v.filter((x) => x !== opt) : [...v, opt]);
      return (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
          {q.options.map((opt) => (
            <CheckPill key={opt} checked={v.includes(opt)} onToggle={() => toggle(opt)}>
              {opt}
            </CheckPill>
          ))}
        </div>
      );
    }

    if (q.type === "slider") {
      const min = Number.isFinite(q.min) ? q.min : 0;
      const max = Number.isFinite(q.max) ? q.max : 250;
      const step = Number.isFinite(q.step) ? q.step : 5;
      const unit = q.unit || "";
      const v = typeof answers[q.id] === "number" ? answers[q.id] : min;
      return (
        <div style={{ marginTop: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontWeight: 800 }}>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={v}
              onChange={(e) => setValue(Number(e.target.value))}
              style={{ width: "100%" }}
            />
            <span style={{ minWidth: 64, textAlign: "right" }}>
              {v}
              {unit ? ` ${unit}` : ""}
            </span>
          </div>
          <div className="subtle" style={{ marginTop: 6 }}>
            Range: {min}–{max}
            {unit ? ` ${unit}` : ""}, step {step}
          </div>
        </div>
      );
    }

    if (q.type === "multiNumber") {
      const val = answers[q.id] || {};
      return (
        <div className="grid gap-3" style={{ marginTop: 8 }}>
          {q.fields.map((f) => (
            <label key={f.key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 140, fontWeight: 800 }}>{f.label}</span>
              <input
                type="number"
                min="0"
                value={val[f.key] ?? ""}
                onChange={(e) =>
                  setAnswers((a) => ({
                    ...a,
                    [q.id]: { ...(a[q.id] || {}), [f.key]: Number(e.target.value) || 0 },
                  }))
                }
                className="input"
                style={{ border: `1px solid ${hair}`, borderRadius: 10, padding: "8px 10px", width: 180 }}
              />
            </label>
          ))}
          <div className="subtle">Enter at least one platform if you use social media.</div>
        </div>
      );
    }

    if (q.type === "ranked") {
      const v = Array.isArray(answers[q.id]) ? answers[q.id] : [];
      return (
        <div style={{ marginTop: 8 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
            {q.options.map((opt) => {
              const idx = v.indexOf(opt);
              const active = idx >= 0;
              return (
                <Pill key={opt} active={active} onClick={() => toggleRanked(opt)}>
                  {active ? `${idx + 1}. ${opt}` : opt}
                </Pill>
              );
            })}
          </div>
          <button type="button" className="btn" onClick={clearRanked}>
            Clear selection
          </button>
          {q.max ? (
            <div className="subtle" style={{ marginTop: 6 }}>
              Select up to {q.max}. Click again to remove. Order = priority.
            </div>
          ) : null}
        </div>
      );
    }

    // text
    return (
      <div style={{ marginTop: 10 }}>
        <textarea
          className="input"
          rows={5}
          placeholder={q.placeholder || "Type your answer…"}
          value={answers[q.id] || ""}
          onChange={(e) => setValue(e.target.value)}
          style={{ resize: "vertical" }}
        />
      </div>
    );
  };

  return (
    <div className="page-container">
      <div className="page-content" style={{ maxWidth: 900 }}>
      <div style={{ marginBottom: 16 }}>
        <h1 className="h1" style={{ margin: 0 }}>NIL Intelligence Quiz</h1>
        <div className="subtle" style={{ marginTop: 6 }}>
          Tell us about your goals, personality, and interests so we can match you with the best opportunities.
        </div>
      </div>

      <div className="card" style={{ padding: 16, marginBottom: 14 }}>
        <Progress current={step} total={total} />
      </div>

      <section className="card" style={{ padding: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "space-between", marginBottom: 8 }}>
          <CategoryChip text={q.category} />
          <div className="subtle" style={{ fontWeight: 800 }}>
            Q{q.id} / {total}
          </div>
        </div>

        <h2 className="h2" style={{ margin: "4px 0 6px" }}>{q.question}</h2>

        {renderQuestion()}

        {/* live mini preview */}
        <div className="card" style={{ marginTop: 14, padding: 12 }}>
          <div className="subtle" style={{ fontWeight: 800 }}>Rootd score preview</div>
          <div style={{ fontWeight: 900, fontSize: 20 }}>
            {previewReach.toFixed(2)}
            <span style={{ fontSize: 12, marginLeft: 6 }}>/ reach component</span>
          </div>
          <div className="subtle">Final score computed server-side on submit.</div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, gap: 8, flexWrap: "wrap" }}>
          <button className="btn" onClick={handleBack} disabled={step === 0}>← Back</button>
          {step < total - 1 ? (
            <button className="btn btn-primary" onClick={handleNext} disabled={!canContinue}>Next →</button>
          ) : (
            <button className="btn btn-primary" onClick={submit} disabled={!canContinue || saving}>
              {saving ? "Submitting…" : "Submit Quiz"}
            </button>
          )}
        </div>

        {error && (
          <div
            role="alert"
            style={{ marginTop: 12, padding: 12, borderRadius: 12, border: `1px solid ${hair}`, background: "#FFF6F6", color: "#9B1C1C", fontWeight: 700 }}
          >
            {error}
          </div>
        )}
      </section>
    </div>
    </div>
  );
}
// geolocation handled in mount effect
