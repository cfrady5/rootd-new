// src/pages/HomePage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function MetricCard({ label, value, hint }) {
  return (
    <div
      style={{
        padding: "22px 22px 18px",
        borderRadius: 16,
        background: "#fff",
        border: "1px solid #e9edf1",
        boxShadow: "0 10px 28px rgba(15,23,42,.06)",
        flex: "1 1 0",
        minWidth: 260,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 36, fontWeight: 900, color: "var(--text)", letterSpacing: "-.02em" }}>
        {value}
      </div>
      {hint && <div style={{ marginTop: 10, fontSize: 12, color: "var(--muted)" }}>{hint}</div>}
    </div>
  );
}

const TESTIMONIALS = [
  {
    quote: (
      <>
        <span style={{ color: "var(--accent-500)", fontWeight: 800 }}>Rootd</span> in Community. Driven by{" "}
        <strong>athletes</strong>.
      </>
    ),
    name: "Jordan M.",
    role: "Women’s Basketball • Stanford",
  },
  {
    quote:
      "The quiz nailed my interests. I’ve already closed two deals with small businesses near campus.",
    name: "Chris R.",
    role: "Track & Field • Oregon",
  },
  {
    quote:
      "Finally a platform that respects athletes and helps us build long-term partnerships, not just posts.",
    name: "Alana P.",
    role: "Volleyball • Texas",
  },
];

function Carousel() {
  const [i, setI] = useState(0);
  const count = TESTIMONIALS.length;
  const go = (n) => setI((prev) => (prev + n + count) % count);
  const set = (n) => setI(n);

  const active = useMemo(() => TESTIMONIALS[i], [i]);

  return (
    <section
      aria-label="Testimonials"
      tabIndex={0}
      style={{
        maxWidth: 1120,
        margin: "60px auto 90px",
        padding: "0 24px",
        outline: "none",
      }}
    >
      <div
        style={{
          position: "relative",
          borderRadius: 18,
          background: "#0b1220",
          color: "#fff",
          border: "1px solid #121a2b",
          padding: "38px 26px",
          boxShadow: "0 16px 48px rgba(2,6,23,.45)",
          overflow: "hidden",
          textAlign: "center",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(1200px 300px at 50% -20%, rgba(22,163,74,.18), transparent 60%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ display: "grid", gap: 12, placeItems: "center" }}>
          <div style={{ fontSize: 14, color: "var(--accent-300)" }}>What athletes are saying</div>
          <blockquote
            style={{
              margin: 0,
              fontSize: 24,
              lineHeight: 1.4,
              letterSpacing: "-.01em",
              fontWeight: 700,
              maxWidth: 750,
            }}
          >
            “{active.quote}”
          </blockquote>
          <div style={{ display: "flex", gap: 10, alignItems: "baseline", marginTop: 6 }}>
            <div style={{ fontWeight: 800 }}>{active.name}</div>
            <div style={{ color: "var(--muted)", fontSize: 14 }}>{active.role}</div>
          </div>
        </div>

        {/* Controls */}
        <div
          style={{
            position: "absolute",
            right: 16,
            top: 16,
            display: "flex",
            gap: 8,
          }}
        >
          <button onClick={() => go(-1)} style={navBtnStyle}>
            ‹
          </button>
          <button onClick={() => go(1)} style={navBtnStyle}>
            ›
          </button>
        </div>

        {/* Dots */}
        <div style={{ marginTop: 22, display: "flex", gap: 8, justifyContent: "center" }}>
          {TESTIMONIALS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => set(idx)}
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                border: "none",
                background: idx === i ? "#86efac" : "rgba(255,255,255,.25)",
                cursor: "pointer",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

const navBtnStyle = {
  width: 36,
  height: 36,
  borderRadius: 10,
  background: "rgba(255,255,255,.10)",
  border: "1px solid rgba(255,255,255,.18)",
  color: "#fff",
  fontSize: 20,
  lineHeight: "20px",
  display: "grid",
  placeItems: "center",
  cursor: "pointer",
  backdropFilter: "blur(6px)",
};

export default function HomePage() {
  const navigate = useNavigate();

  const [schools, setSchools] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [deals, setDeals] = useState(0);

  useEffect(() => {
    const targets = { s: 128, r: 412000, d: 1790 };
    const start = performance.now();
    const dur = 900;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / dur);
      setSchools(Math.floor(p * targets.s));
      setRevenue(Math.floor(p * targets.r));
      setDeals(Math.floor(p * targets.d));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, []);

  const money = (n) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  return (
    <div style={{ background: "#f5f7fa" }}>
      {/* HERO */}
      <section
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          minHeight: "65vh",
          background: "#f5f7fa",
          padding: "80px 24px 40px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "1200px",
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 18, color: "var(--muted)", marginBottom: 12 }}>
            <span style={{ color: "var(--accent-500)", fontWeight: 800 }}>Rootd</span> in Community. Driven by{" "}
            <strong>athletes</strong>.
          </div>

          <h1
            style={{
              fontSize: 56,
              fontWeight: 900,
              color: "#0f172a",
              margin: "0 auto",
              lineHeight: 1.05,
              whiteSpace: "nowrap",
              textAlign: "center",
            }}
          >
            Turn your story into real NIL opportunities.
          </h1>

          <p
            style={{
              marginTop: 18,
              fontSize: 20,
              color: "#475569",
              lineHeight: 1.5,
              whiteSpace: "nowrap",
              textAlign: "center",
            }}
          >
            Take a smart, 30-question quiz and get matched with local businesses that fit your brand
            and values.
          </p>

          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 32 }}>
            <button
              onClick={() => navigate("/quiz")}
                style={{
                  padding: "14px 28px",
                  borderRadius: 14,
                  background: "var(--accent-500)",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: 16,
                  border: "none",
                  boxShadow: "0 8px 24px rgba(22,163,74,.25)",
                  transition: "all .2s ease",
                }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow = "0 10px 28px rgba(22,163,74,.35)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.boxShadow = "0 8px 24px rgba(22,163,74,.25)")
              }
            >
              Take the Quiz
            </button>

            <Link
              to="/demo"
              style={{
                padding: "14px 28px",
                borderRadius: 14,
                background: "#fff",
                color: "#0f172a",
                fontWeight: 800,
                fontSize: 16,
                border: "1px solid #e5e7eb",
                boxShadow: "0 2px 8px rgba(0,0,0,.04)",
              }}
            >
              View Demo
            </Link>
          </div>
        </div>
      </section>

      {/* KPI Section */}
      <section
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 24px 70px",
          display: "flex",
          justifyContent: "center",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <MetricCard label="Partner Schools" value={schools} hint="Universities using Rootd" />
        <MetricCard
          label="Revenue Generated"
          value={money(revenue)}
          hint="Estimated NIL value facilitated"
        />
        <MetricCard label="Deals Completed" value={deals} hint="Closed campaigns" />
      </section>

      {/* Testimonials */}
      <Carousel />
    </div>
  );
}
