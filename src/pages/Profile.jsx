import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthProvider.jsx";

export default function Profile() {
  const { supabase } = useAuth();
  const [profile, setProfile] = useState({ full_name: "", school: "", sport: "", avatar_url: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id;
      if (!uid) return;
      const { data: p } = await supabase.from("profiles").select("full_name,school,sport,avatar_url").eq("id", uid).maybeSingle();
      if (!mounted) return;
      setProfile(p || profile);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [supabase]);

  const save = async () => {
    setMsg("");
    try {
      const { data: user } = await supabase.auth.getUser();
      const uid = user.user?.id;
      if (!uid) throw new Error("Not signed in");
      const { error } = await supabase.from("profiles").upsert({ id: uid, ...profile }).select("id").single();
      if (error) throw error;
      setMsg("Saved");
    } catch (e) {
      setMsg(e.message || "Save failed");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Profile</h2>
      {msg && <div>{msg}</div>}
      {loading ? <div>Loading…</div> : (
        <div style={{ maxWidth: 600 }}>
          <label>Full name</label>
          <input className="input" value={profile.full_name || ""} onChange={(e) => setProfile(p => ({...p, full_name: e.target.value}))} />
          <label>School</label>
          <input className="input" value={profile.school || ""} onChange={(e) => setProfile(p => ({...p, school: e.target.value}))} />
          <label>Sport</label>
          <input className="input" value={profile.sport || ""} onChange={(e) => setProfile(p => ({...p, sport: e.target.value}))} />
          <label>Avatar URL</label>
          <input className="input" value={profile.avatar_url || ""} onChange={(e) => setProfile(p => ({...p, avatar_url: e.target.value}))} />
          <div style={{ marginTop: 12 }}>
            <button className="btn btn-primary" onClick={save}>Save</button>
          </div>
        </div>
      )}
    </div>
  );
}
