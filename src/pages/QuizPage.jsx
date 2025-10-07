// src/pages/QuizPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { quizQuestions } from "../data/quizQuestions.js";
import { useAuth } from "../auth/AuthProvider.jsx";
import { insertQuizResponse } from "../lib/api.js";

const green = "#0FA958";
const hair = "#E7EEF3";
const muted = "#5E6B77";

function Progress({ current, total }) {
  const pct = Math.round(((current + 1) / total) * 100);
  return (
    <div>
      <div
        aria-hidden
        style={{ height: 10, borderRadius: 999, background: "#EEF4F7", border: `1px solid ${hair}`, overflow: "hidden" }}
      >
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
  const total = quizQuestions.length;

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (useAuth && session === null) {
      const t = setTimeout(() => navigate("/login"), 200);
      return () => clearTimeout(t);
    }
  }, [session, navigate]);

  const q = useMemo(() => quizQuestions[step], [step]);

  const setValue = (val) =>
    setAnswers((prev) => ({
      ...prev,
      [q.id]: val,
    }));

  const canContinue = useMemo(() => {
    if (!q) return false;
    const v = answers[q.id];
    if (q.type === "text") return Boolean(String(v ?? "").trim());
    if (q.type === "single") return !!v;
    if (q.type === "multiple") return Array.isArray(v) && v.length > 0;
    if (q.type === "slider") return typeof v === "number";
    return false;
  }, [answers, q]);

  const handleNext = () => setStep((s) => Math.min(total - 1, s + 1));
  const handleBack = () => setStep((s) => Math.max(0, s - 1));

  const submit = async () => {
    setSaving(true);
    setError("");
    try {
      for (const item of quizQuestions) {
        const v = answers[item.id];
        if (item.type === "text" && !(v && String(v).trim())) throw new Error(`Please answer question ${item.id}.`);
        if (item.type === "single" && !v) throw new Error(`Please answer question ${item.id}.`);
        if (item.type === "multiple" && (!Array.isArray(v) || v.length === 0)) throw new Error(`Please answer question ${item.id}.`);
        if (item.type === "slider" && typeof v !== "number") throw new Error(`Please answer question ${item.id}.`);
      }
      if (!session?.user?.id) throw new Error("You must be signed in to submit the quiz.");

      const payload = { version: 2, completed_at: new Date().toISOString(), responses: answers };
      await insertQuizResponse(session.user.id, payload);

      navigate("/dashboard");
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
      const unit = q.unit || "mi";
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
            <span style={{ minWidth: 64, textAlign: "right" }}>{v} {unit}</span>
          </div>
          <div className="subtle" style={{ marginTop: 6 }}>
            Range: {min}–{max} {unit}, step {step}
          </div>
        </div>
      );
    }

    // text
    return (
      <div style={{ marginTop: 10 }}>
        <textarea
          className="input"
          rows={5}
          placeholder="Type your answer…"
          value={answers[q.id] || ""}
          onChange={(e) => setValue(e.target.value)}
          style={{ resize: "vertical" }}
        />
      </div>
    );
  };

  return (
    <div className="container" style={{ padding: "28px 16px", maxWidth: 900 }}>
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
        <div
          style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "space-between", marginBottom: 8 }}
        >
          <CategoryChip text={q.category} />
          <div className="subtle" style={{ fontWeight: 800 }}>
            Q{q.id} / {total}
          </div>
        </div>

        <h2 className="h2" style={{ margin: "4px 0 6px" }}>{q.question}</h2>

        {renderQuestion()}

        <div
          style={{ display: "flex", justifyContent: "space-between", marginTop: 16, gap: 8, flexWrap: "wrap" }}
        >
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
  );
}
