// src/pages/AuthPage.jsx
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";
import { useAuth } from "../auth/useAuth.js";

export default function AuthPage() {
  const auth = useAuth();
  const setSession = auth?.setSession ?? (() => {});
  const nav = useNavigate();
  const loc = useLocation();

  const [mode, setMode] = useState(new URLSearchParams(loc.search).get("mode") === "signup" ? "signup" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");
    setBusy(true);
    try {
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const session = (await supabase.auth.getSession()).data.session || data.session;
        if (!session) throw new Error("Login failed.");
        setSession(session);
        nav("/quiz", { replace: true }); // go straight to quiz
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user?.id) {
          await supabase.from("profiles").upsert(
            { id: data.user.id, email, full_name: fullName },
            { onConflict: "id" }
          );
        }
        setMsg("Account created. Check your email if confirmation is required, then log in.");
        setMode("login");
      }
    } catch (err) {
      setMsg(err?.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ padding: "24px 0 64px" }}>
      <div className="container" style={{ display: "grid", placeItems: "center", minHeight: "calc(100vh - 120px)" }}>
        <div
          className="card"
          style={{
            width: "min(560px, 92vw)",
            background: "linear-gradient(180deg, #0D1113 0%, #0A0F12 100%)",
            border: "1px solid #1F2A33",
            color: "white",
            borderRadius: 20,
            boxShadow: "0 20px 50px rgba(0,0,0,.5)",
          }}
        >
          <div className="card-pad" style={{ padding: 28 }}>
            <h1 className="h1" style={{ color: "#fff", margin: 0, fontSize: 32 }}>
              {mode === "login" ? "Welcome Back" : "Create Your Account"}
            </h1>
            <p className="subtle" style={{ color: "#B5C3CF", marginTop: 8 }}>
              {mode === "login"
                ? "Log in to access your Rootd athlete dashboard."
                : "Sign up to start your NIL journey with Rootd."}
            </p>

            {msg && (
              <div
                role="alert"
                style={{
                  marginTop: 14,
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid #1F3B2A",
                  background: "rgba(15,169,88,.12)",
                  color: "#B8F0CF",
                  fontWeight: 700,
                }}
              >
                {msg}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ marginTop: 16, display: "grid", gap: 14 }}>
              {mode === "signup" && (
                <div>
                  <label className="subtle" style={{ color: "#C7D3DC", fontSize: 13 }}>Full Name</label>
                  <input
                    className="input"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jane Athlete"
                    required
                    style={{ marginTop: 6, background: "#0F1417", color: "#DDE7EE", borderColor: "#26333E" }}
                  />
                </div>
              )}

              <div>
                <label className="subtle" style={{ color: "#C7D3DC", fontSize: 13 }}>Email</label>
                <input
                  className="input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@school.edu"
                  required
                  autoComplete="email"
                  style={{ marginTop: 6, background: "#0F1417", color: "#DDE7EE", borderColor: "#26333E" }}
                />
              </div>

              <div>
                <label className="subtle" style={{ color: "#C7D3DC", fontSize: 13 }}>Password</label>
                <input
                  className="input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  style={{ marginTop: 6, background: "#0F1417", color: "#DDE7EE", borderColor: "#26333E" }}
                />
              </div>

              <button
                type="submit"
                disabled={busy}
                className="btn btn-primary"
                style={{
                  height: 48,
                  fontSize: 16,
                  borderRadius: 14,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: busy ? "translateY(1px)" : "none",
                  transition: "transform .08s ease, filter .12s ease",
                  filter: busy ? "saturate(.7) brightness(.95)" : "none",
                }}
              >
                {busy ? (mode === "login" ? "Logging in…" : "Creating…") : mode === "login" ? "Log In" : "Create Account"}
              </button>
            </form>

            <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8, color: "#B5C3CF", fontSize: 14, flexWrap: "wrap" }}>
              {mode === "login" ? (
                <>
                  <span>New here?</span>
                  <button
                    className="btn"
                    onClick={() => { setMsg(""); setMode("signup"); }}
                    style={{ padding: "8px 10px", borderRadius: 10, background: "transparent", border: "1px solid #2B3945", color: "#DDE7EE" }}
                  >
                    Create an account
                  </button>
                </>
              ) : (
                <>
                  <span>Already have an account?</span>
                  <button
                    className="btn"
                    onClick={() => { setMsg(""); setMode("login"); }}
                    style={{ padding: "8px 10px", borderRadius: 10, background: "transparent", border: "1px solid #2B3945", color: "#DDE7EE" }}
                  >
                    Log in
                  </button>
                </>
              )}
            </div>

            <div className="subtle" style={{ marginTop: 12, display: "flex", gap: 16, flexWrap: "wrap", color: "#8CA1AF", fontSize: 13 }}>
              <Link to="/demo" style={linkStyle}>View Demo</Link>
              <span>·</span>
              <Link to="/" style={linkStyle}>Back to Home</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const linkStyle = {
  textDecoration: "none",
  color: "#CFE8DA",
  fontWeight: 700,
  background: "rgba(15,169,88,.12)",
  padding: "6px 10px",
  borderRadius: 10,
  border: "1px solid #1F3B2A",
};
