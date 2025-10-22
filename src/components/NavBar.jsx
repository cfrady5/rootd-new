// src/components/NavBar.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider.jsx";
import logo from "../assets/rootd-logo.png";

export default function NavBar() {
  const { session } = useAuth() ?? {};
  useNavigate();
  const [open, setOpen] = useState(false);

  const navLinks = [
    { to: "/demo", label: "Demo" },
    { to: "/pricing", label: "Pricing" },
    { to: "/about", label: "About" },
  ];

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 60,
        background: "rgba(255,255,255,0.9)",
        backdropFilter: "saturate(1.2) blur(8px)",
        borderBottom: "1px solid rgba(15,23,42,0.06)",
      }}
    >
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "10px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 10 }} aria-label="Rootd home">
            <img src={logo} alt="Rootd" style={{ height: 36 }} />
          </Link>
        </div>

        {/* Desktop nav */}
        <nav style={{ display: "flex", alignItems: "center", gap: 12 }} className="nav-desktop">
          {navLinks.map((l) => (
            <Link key={l.to} to={l.to} style={{ textDecoration: "none", color: "var(--text)", fontWeight: 600, padding: "8px 12px" }}>{l.label}</Link>
          ))}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {!session ? (
            <>
              <Link to="/login" className="btn nav-desktop">Log In</Link>
              <Link to="/signup" className="btn btn-primary">Sign Up</Link>
            </>
          ) : (
            <Link to="/dashboard/profile" className="btn">Dashboard</Link>
          )}

          {/* Mobile hamburger */}
          <button
            className="mobile-hamburger"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            style={{ background: "transparent", border: 0, fontSize: 22 }}
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {open && (
        <div id="mobile-menu" className={`mobile-menu ${open ? "open" : ""}`} aria-hidden={!open}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 16 }}>
            {navLinks.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="mobile-link">
                {l.label}
              </Link>
            ))}
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
              {!session ? (
                <>
                  <Link to="/login" className="btn" onClick={() => setOpen(false)}>
                    Log In
                  </Link>
                  <Link to="/signup" className="btn btn-primary" onClick={() => setOpen(false)}>
                    Sign Up
                  </Link>
                </>
              ) : (
                <Link to="/dashboard" className="btn" onClick={() => setOpen(false)}>
                  Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
