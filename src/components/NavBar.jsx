// src/components/NavBar.jsx
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider.jsx";
import logo from "../assets/rootd-logo.png";
import { BASELINE } from "../lib/config.js";
// ...inside the component render, near the top nav:
{BASELINE && (
  <div style={{background:"#FFF4D6",border:"1px solid #E7D7A3",padding:6,borderRadius:8,marginRight:8,fontSize:12}}>
    Baseline mode: UI simplified. Matching pipeline under test.
  </div>
)}


const linkBase = {
  textDecoration: "none",
  fontWeight: 700,
  padding: "8px 12px",
  borderRadius: 12,
  color: "#0D1113",
};

export default function NavBar() {
  const { session } = useAuth() ?? {};
  const loc = useLocation();
  const nav = useNavigate();

  // consider any /director* route as Director mode
  const isDirector = loc.pathname.startsWith("/director");

  const goRole = (role) => {
    if (role === "athlete") nav("/dashboard");
    else nav("/director");
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "#FFFFFFF2",
        backdropFilter: "saturate(1.2) blur(8px)",
        borderBottom: "1px solid #E7EEF3",
      }}
      aria-label="Primary"
    >
      <div
        className="container"
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          alignItems: "center",
          gap: 16,
          padding: "10px 16px",
        }}
      >
        {/* Logo -> Home */}
        <Link to="/" style={{ display: "inline-flex", alignItems: "center" }}>
          <img src={logo} alt="Rootd" style={{ height: 32, width: "auto" }} />
        </Link>

        {/* Center: Athlete / Director slider */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div
            role="tablist"
            aria-label="Role"
            style={{
              display: "inline-grid",
              gridTemplateColumns: "1fr 1fr",
              background: "#F4F7F9",
              border: "1px solid #E2EAF0",
              borderRadius: 999,
              padding: 4,
            }}
          >
            <button
              role="tab"
              aria-selected={!isDirector}
              onClick={() => goRole("athlete")}
              style={{
                border: 0,
                background: !isDirector ? "#0FA958" : "transparent",
                color: !isDirector ? "#fff" : "#0D1113",
                padding: "8px 14px",
                fontWeight: 800,
                borderRadius: 999,
                cursor: "pointer",
                transition: "background .15s ease",
              }}
            >
              Athlete
            </button>
            <button
              role="tab"
              aria-selected={isDirector}
              onClick={() => goRole("director")}
              style={{
                border: 0,
                background: isDirector ? "#0FA958" : "transparent",
                color: isDirector ? "#fff" : "#0D1113",
                padding: "8px 14px",
                fontWeight: 800,
                borderRadius: 999,
                cursor: "pointer",
                transition: "background .15s ease",
              }}
            >
              Director
            </button>
          </div>
        </div>

        {/* Right-side nav */}
        <nav style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link to="/demo" style={linkBase}>Demo</Link>
          <Link to="/about" style={linkBase}>About</Link>
          <Link to="/quiz" style={{ ...linkBase, color: "#0FA958" }}>Quiz</Link>

          {/* Signed-out */}
          {!session && (
            <Link
              to="/login"
              style={{
                ...linkBase,
                background: "#0FA958",
                color: "#fff",
                boxShadow: "0 8px 18px rgba(15,169,88,.25)",
              }}
            >
              Sign In
            </Link>
          )}

          {/* Signed-in + Athlete mode → My Profile */}
          {session && !isDirector && (
            <Link
              to="/dashboard"
              style={{
                ...linkBase,
                background: "#0FA958",
                color: "#fff",
                boxShadow: "0 8px 18px rgba(15,169,88,.25)",
              }}
            >
              My Profile
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
