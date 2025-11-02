// src/pages/HomePage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FooterCTA from "../components/FooterCTA.jsx";

function MetricCard({ label, value, hint }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div
      style={{
        padding: "32px 28px",
        borderRadius: 18,
        background: "#fff",
        border: "1px solid #e9edf1",
        boxShadow: isHovered ? "0 12px 32px rgba(15,23,42,.08)" : "0 8px 24px rgba(15,23,42,.05)",
        flex: "1 1 0",
        minWidth: 260,
        textAlign: "center",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: isHovered ? "translateY(-4px)" : "translateY(0)",
        cursor: "default"
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 12, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
      <div style={{ fontSize: 48, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em", lineHeight: 1 }}>
        {value}
      </div>
      {hint && <div style={{ marginTop: 12, fontSize: 13, color: "#9ca3af", fontWeight: 400 }}>{hint}</div>}
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
  <div className="page-container" style={{ background: "#f5f7fa" }}>
      {/* HERO */}
      <section
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          /* Avoid forcing near-full viewport height so footer spacing remains consistent */
          background: "#f5f7fa",
          padding: "80px 24px 80px",
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
          <div style={{ 
            fontSize: 18, 
            color: "#6b7280", 
            marginBottom: 32,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            fontWeight: 600
          }}>
            <span style={{ color: "var(--accent-500)", fontWeight: 700 }}>Rootd</span> in Community. Driven by{" "}
            <strong>athletes</strong>
          </div>

          <h1
            style={{
              fontSize: 64,
              fontWeight: 900,
              color: "#0f172a",
              margin: "0 auto 32px",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              whiteSpace: "nowrap",
              textAlign: "center",
            }}
          >
            Turn your story into real NIL opportunities
          </h1>

          <p
            style={{
              marginTop: 0,
              marginBottom: 48,
              fontSize: 28,
              color: "#64748b",
              lineHeight: 1.6,
              whiteSpace: "nowrap",
              textAlign: "center",
              fontWeight: 400
            }}
          >
            Take a smart, 30-question quiz and get matched with local businesses that fit your brand
            and values.
          </p>

          <div style={{ display: "flex", gap: 20, justifyContent: "center", marginTop: 0 }}>
            <button
              onClick={() => navigate("/quiz")}
                style={{
                  padding: "18px 40px",
                  borderRadius: 14,
                  background: "var(--accent-500)",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 17,
                  border: "none",
                  boxShadow: "0 4px 16px rgba(44, 95, 52, 0.25)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  cursor: "pointer"
                }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(44, 95, 52, 0.35)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(44, 95, 52, 0.25)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Take the Quiz
            </button>

            <Link
              to="/demo"
              style={{
                padding: "18px 40px",
                borderRadius: 14,
                background: "transparent",
                color: "#0f172a",
                fontWeight: 600,
                fontSize: 17,
                border: "2px solid #e5e7eb",
                boxShadow: "none",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                cursor: "pointer"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f9fafb";
                e.currentTarget.style.borderColor = "#d1d5db";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "#e5e7eb";
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
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 40px 100px",
          display: "flex",
          justifyContent: "center",
          gap: 32,
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

      {/* Footer CTA */}
      <FooterCTA />
    </div>
  );
}
