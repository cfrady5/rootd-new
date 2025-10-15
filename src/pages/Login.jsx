import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider.jsx";

export default function Login() {
  const auth = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [debugResp, setDebugResp] = useState(null);
  const [debugLoading, setDebugLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await auth.signIn(email, password);
      nav("/quiz", { replace: true });
    } catch (e) {
      setErr(e.message || "Login failed");
    }
  };

  // Debug: call the token endpoint directly and show raw response body
  const debugLogin = async () => {
    setDebugResp(null);
    setDebugLoading(true);
    try {
      const base = import.meta.env.VITE_SUPABASE_URL;
      const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const res = await fetch(`${base}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: anon },
        body: JSON.stringify({ email, password }),
      });
      const j = await res.text();
      setDebugResp({ status: res.status, ok: res.ok, body: j });
    } catch (e) {
      setDebugResp({ error: e.message || String(e) });
    } finally {
      setDebugLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <form onSubmit={submit} style={{ maxWidth: 420, margin: "0 auto", display: "grid", gap: 12 }}>
        <h2>Log in</h2>
        {err && <div style={{ color: "#9b1c1c" }}>{err}</div>}
        <input className="input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary" type="submit">Log In</button>
          <button type="button" className="btn" onClick={() => nav('/signup')}>
            Sign up
          </button>
          <button type="button" className="btn" style={{ marginLeft: 8 }} onClick={debugLogin} disabled={debugLoading}>
            {debugLoading ? "Checking" : "Debug login"}
          </button>
        </div>
      </form>
      {debugResp && (
        <pre style={{ maxWidth: 680, margin: "12px auto", whiteSpace: "pre-wrap", background: "#f7f7f8", padding: 12, borderRadius: 8 }}>
          {JSON.stringify(debugResp, null, 2)}
        </pre>
      )}
    </div>
  );
}
