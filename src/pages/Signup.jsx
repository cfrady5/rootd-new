import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider.jsx";

export default function Signup() {
  const auth = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await auth.signUp(email, password);
      // After signup, user should confirm via email in some setups. Redirect to quiz anyway.
      nav("/quiz", { replace: true });
    } catch (e) {
      setErr(e.message || "Signup failed");
    }
  };

  return (
    <div className="page-container">
      <div className="page-content">
        <form onSubmit={submit} style={{ maxWidth: 420, margin: "0 auto", display: "grid", gap: 12 }}>
          <h2>Sign up</h2>
          {err && <div style={{ color: "#9b1c1c" }}>{err}</div>}
          <input className="input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className="input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button className="btn btn-primary" type="submit">Create Account</button>
        </form>
      </div>
    </div>
  );
}
