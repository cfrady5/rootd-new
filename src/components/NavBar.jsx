// src/components/NavBar.jsx
import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider.jsx";
import logo from "../assets/rootd-logo.png";

export default function NavBar() {
  const { session } = useAuth() ?? {};

  const navLinks = [
    { to: "/demo", label: "Demo" },
    { to: "/pricing", label: "Pricing" },
    { to: "/about", label: "About" },
    { to: "/director/overview", label: "Director" },
    { to: "/dashboard/profile", label: "Profile" },
  ];

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 60,
        background: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "var(--apple-blur-md)",
        borderBottom: "1px solid var(--apple-border-light)",
        height: "88px",
        display: "flex",
        alignItems: "center"
      }}
    >
      <div
        className="apple-container"
        style={{
          height: "100%",
          padding: "0 var(--apple-space-6)",
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          alignItems: "center",
          gap: "var(--apple-space-6)",
        }}
      >
        {/* Logo as Home button */}
        <Link
          to="/"
          aria-label="Home"
          className="apple-flex apple-items-center"
          style={{ gap: "var(--apple-space-2)", textDecoration: "none", cursor: "pointer" }}
        >
          <img
            src={logo}
            alt="Rootd logo"
            decoding="async"
            loading="eager"
            className="brand-mark"
          />
        </Link>

        {/* Navigation */}
        <nav
          role="navigation"
          aria-label="Primary"
          className="apple-flex"
          style={{ justifySelf: "center", gap: 24 }}
        >
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className="apple-btn apple-btn-ghost"
              style={({ isActive }) => ({
                textDecoration: "none",
                fontWeight: "var(--apple-font-medium)",
                padding: "10px 14px",
                transition: "background-color 180ms ease-out, color 180ms ease-out",
                color: isActive ? "var(--apple-text-primary)" : "var(--apple-text-secondary)",
                backgroundColor: isActive ? "rgba(60,60,67,0.08)" : "transparent",
                borderRadius: 10,
              })}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Auth Actions */}
        <div className="apple-flex apple-gap-3 apple-items-center" style={{ justifySelf: "end" }}>
          {session ? (
            <>
              {/* Compact avatar with tooltip to avoid shifting nav center */}
              <Link to="/dashboard/profile" title={session.user.email} aria-label="Profile">
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background: "var(--apple-gray-200)",
                    color: "var(--apple-text-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                  }}
                >
                  {String(session.user.email || "U").charAt(0).toUpperCase()}
                </div>
              </Link>
              <Link 
                to="/auth" 
                className="apple-btn apple-btn-ghost"
                style={{
                  fontSize: "var(--apple-text-sm)",
                  padding: "var(--apple-space-2) var(--apple-space-4)",
                  border: "1px solid var(--apple-border-medium)",
                }}
              >
                Sign Out
              </Link>
            </>
          ) : (
            <Link 
              to="/dashboard/profile" 
              className="apple-btn apple-btn-primary"
              style={{
                fontSize: "var(--apple-text-sm)",
                padding: "var(--apple-space-2) var(--apple-space-4)"
              }}
            >
              Dashboard
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
