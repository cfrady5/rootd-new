// src/components/NavBar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider.jsx";
import logo from "../assets/rootd-logo.png";

export default function NavBar() {
  const { session } = useAuth() ?? {};
  useNavigate();

  const navLinks = [
    { to: "/demo", label: "Demo" },
    { to: "/pricing", label: "Pricing" },
    { to: "/about", label: "About" },
    { to: "/director/overview", label: "Director" },
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

        {/* Nav links */}
        <nav style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {navLinks.map((l) => (
            <Link key={l.to} to={l.to} style={{ textDecoration: "none", color: "var(--text)", fontWeight: 600, padding: "8px 12px" }}>{l.label}</Link>
          ))}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {!session ? (
            <>
              <Link to="/login" className="btn">Log In</Link>
              <Link to="/signup" className="btn btn-primary">Sign Up</Link>
            </>
          ) : (
            <Link to="/dashboard/profile" className="btn">Dashboard</Link>
          )}
        </div>
      </div>
    </header>
  );
}
