import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthProvider.jsx";

export default function Profile() {
  const { supabase } = useAuth();
  const [profile, setProfile] = useState({ 
    full_name: "", 
    school: "", 
    sport: "", 
    avatar_url: "",
    bio: "",
    location: "",
    // Social media
    instagram: "",
    tiktok: "",
    youtube: "",
    x: "",
    linkedin: "",
    facebook: "",
    // Quiz-derived data
    engagement_rate: 0,
    time_commitment: 0,
    content_types: [],
    categories: [],
    total_followers: 0,
    rootd_score: 0
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id;
      if (!uid) return;
      
      // Get profile data
      const { data: p } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
      
      // Get latest quiz data
      const { data: latestQuiz } = await supabase
        .from("quiz_responses")
        .select("rootd_score,normalized")
        .eq("user_id", uid)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (!mounted) return;
      
      // Merge fetched profile with quiz-derived data (do not reference outer `profile` state)
      const mergedProfile = {
        ...(p || {}),
        ...(latestQuiz?.normalized || {}),
        rootd_score: latestQuiz?.rootd_score || 0,
        instagram: latestQuiz?.normalized?.following?.instagram || "",
        tiktok: latestQuiz?.normalized?.following?.tiktok || "",
        youtube: latestQuiz?.normalized?.following?.youtube || "",
        x: latestQuiz?.normalized?.following?.x || "",
        linkedin: latestQuiz?.normalized?.following?.linkedin || "",
        facebook: latestQuiz?.normalized?.following?.facebook || "",
      };
      
      setProfile(mergedProfile);
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
      
      // Prepare profile data (exclude quiz-derived fields that shouldn't be saved to profiles table)
      const profileData = {
        id: uid,
        full_name: profile.full_name,
        school: profile.school,
        sport: profile.sport,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        location: profile.location,
        // Store social media handles
        instagram: profile.instagram,
        tiktok: profile.tiktok,
        youtube: profile.youtube,
        x: profile.x,
        linkedin: profile.linkedin,
        facebook: profile.facebook,
        total_followers: profile.total_followers
      };
      
      const { error } = await supabase.from("profiles").upsert(profileData).select("id").single();
      if (error) throw error;
      setMsg("Profile saved successfully!");
      
      // Clear message after 3 seconds
      setTimeout(() => setMsg(""), 3000);
    } catch (e) {
      setMsg(e.message || "Save failed");
    }
  };

  return (
    <div className="page-container">
      <div className="page-content">
      <h2>Athlete Profile</h2>
      {msg && (
        <div style={{ 
          padding: 12, 
          marginBottom: 16, 
          borderRadius: 8, 
          background: msg.includes("success") ? "var(--accent-100)" : "#FFE6E6",
          color: msg.includes("success") ? "#16532B" : "#C53030"
        }}>
          {msg}
        </div>
      )}
      {loading ? <div>Loading…</div> : (
        <div style={{ maxWidth: 800, display: "grid", gap: 24 }}>
          {/* Basic Info Section */}
          <section style={{ border: "1px solid #E2E8F0", borderRadius: 8, padding: 20 }}>
            <h3 style={{ margin: "0 0 16px 0", color: "#2D3748" }}>Basic Information</h3>
            <div style={{ display: "grid", gap: 12 }}>
              <div>
                <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>Full Name</label>
                <input 
                  className="input" 
                  value={profile.full_name || ""} 
                  onChange={(e) => setProfile(p => ({...p, full_name: e.target.value}))} 
                  placeholder="Your full name"
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>School</label>
                  <input 
                    className="input" 
                    value={profile.school || ""} 
                    onChange={(e) => setProfile(p => ({...p, school: e.target.value}))} 
                    placeholder="University/School"
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>Sport</label>
                  <input 
                    className="input" 
                    value={profile.sport || ""} 
                    onChange={(e) => setProfile(p => ({...p, sport: e.target.value}))} 
                    placeholder="Your sport"
                  />
                </div>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>Location</label>
                <input 
                  className="input" 
                  value={profile.location || ""} 
                  onChange={(e) => setProfile(p => ({...p, location: e.target.value}))} 
                  placeholder="City, State"
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>Bio</label>
                <textarea 
                  className="input" 
                  value={profile.bio || ""} 
                  onChange={(e) => setProfile(p => ({...p, bio: e.target.value}))} 
                  placeholder="Tell us about yourself..."
                  rows="3"
                />
              </div>
            </div>
          </section>

          {/* Social Media Section */}
          <section style={{ border: "1px solid #E2E8F0", borderRadius: 8, padding: 20 }}>
            <h3 style={{ margin: "0 0 16px 0", color: "#2D3748" }}>Social Media</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 12 }}>
              <div>
                <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>Instagram Followers</label>
                <input 
                  className="input" 
                  type="number"
                  value={profile.instagram || ""} 
                  onChange={(e) => setProfile(p => ({...p, instagram: Number(e.target.value) || 0}))} 
                  placeholder="0"
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>TikTok Followers</label>
                <input 
                  className="input" 
                  type="number"
                  value={profile.tiktok || ""} 
                  onChange={(e) => setProfile(p => ({...p, tiktok: Number(e.target.value) || 0}))} 
                  placeholder="0"
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>YouTube Subscribers</label>
                <input 
                  className="input" 
                  type="number"
                  value={profile.youtube || ""} 
                  onChange={(e) => setProfile(p => ({...p, youtube: Number(e.target.value) || 0}))} 
                  placeholder="0"
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>X (Twitter) Followers</label>
                <input 
                  className="input" 
                  type="number"
                  value={profile.x || ""} 
                  onChange={(e) => setProfile(p => ({...p, x: Number(e.target.value) || 0}))} 
                  placeholder="0"
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>LinkedIn Connections</label>
                <input 
                  className="input" 
                  type="number"
                  value={profile.linkedin || ""} 
                  onChange={(e) => setProfile(p => ({...p, linkedin: Number(e.target.value) || 0}))} 
                  placeholder="0"
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>Facebook Followers</label>
                <input 
                  className="input" 
                  type="number"
                  value={profile.facebook || ""} 
                  onChange={(e) => setProfile(p => ({...p, facebook: Number(e.target.value) || 0}))} 
                  placeholder="0"
                />
              </div>
            </div>
            <div style={{ marginTop: 12, padding: 12, background: "#F7FAFC", borderRadius: 6 }}>
              <strong>Total Followers: {(
                Number(profile.instagram || 0) + 
                Number(profile.tiktok || 0) + 
                Number(profile.youtube || 0) + 
                Number(profile.x || 0) + 
                Number(profile.linkedin || 0) + 
                Number(profile.facebook || 0)
              ).toLocaleString()}</strong>
            </div>
          </section>

          {/* Quiz Stats Section (Read-only) */}
          {profile.rootd_score > 0 && (
            <section style={{ border: "1px solid #E2E8F0", borderRadius: 8, padding: 20, background: "#F8FAFC" }}>
              <h3 style={{ margin: "0 0 16px 0", color: "#2D3748" }}>Quiz Results</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                <div>
                  <label style={{ display: "block", marginBottom: 4, fontWeight: 600, color: "#4A5568" }}>Rootd Score</label>
                  <div style={{ padding: 8, background: "#EDF2F7", borderRadius: 4, fontWeight: 600 }}>
                    {profile.rootd_score?.toFixed(2) || "0.00"}
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 4, fontWeight: 600, color: "#4A5568" }}>Engagement Rate</label>
                  <div style={{ padding: 8, background: "#EDF2F7", borderRadius: 4 }}>
                    {((profile.engagement_rate || 0) * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 4, fontWeight: 600, color: "#4A5568" }}>Time Commitment</label>
                  <div style={{ padding: 8, background: "#EDF2F7", borderRadius: 4 }}>
                    {profile.time_commitment || 0} hrs/week
                  </div>
                </div>
              </div>
              {profile.content_types && profile.content_types.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <label style={{ display: "block", marginBottom: 4, fontWeight: 600, color: "#4A5568" }}>Content Types</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {profile.content_types.map((type, i) => (
                      <span key={i} style={{ 
                        padding: "4px 8px", 
                        background: "#CBD5E0", 
                        borderRadius: 12, 
                        fontSize: 12,
                        color: "#2D3748"
                      }}>
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          <div style={{ marginTop: 20 }}>
            <button className="btn btn-primary" onClick={save} style={{ marginRight: 12 }}>
              Save Profile
            </button>
            <button 
              className="btn" 
              onClick={() => window.location.href = '/quiz'}
              style={{ background: "#EDF2F7", color: "#4A5568" }}
            >
              Retake Quiz
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
