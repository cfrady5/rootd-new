// /src/pages/Dashboard.jsx — updated to show matches with MatchCard and actions
import React, { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider.jsx";
import supabase from "../lib/supabaseClient.js";
import { runProcessQuiz, getMatches } from "../lib/api.js";
import MatchCard from "../components/MatchCard.jsx";
import HeaderBar from "../components/dashboard/HeaderBar.jsx";
import MetricCards from "../components/dashboard/MetricCards.jsx";
import ProfileOverview from "../components/dashboard/ProfileOverview.jsx";
import AchievementsTimeline from "../components/dashboard/AchievementsTimeline.jsx";
import SocialAnalytics from "../components/dashboard/SocialAnalytics.jsx";
import BusinessMatches from "../components/dashboard/BusinessMatches.jsx";
import BrandSummary from "../components/dashboard/BrandSummary.jsx";
import GoalsPreferences from "../components/dashboard/GoalsPreferences.jsx";
import SidebarPanel from "../components/dashboard/SidebarPanel.jsx";
import ToastProvider from "../components/dashboard/Toasts.jsx";

  // hair color constant unused; remove to satisfy lint

export default function Dashboard() {
  const { state } = useLocation();
  const navScore = state?.rootd_score;

  const { session } = (useAuth?.() ?? {});
  const athleteId = session?.user?.id || null;

  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(typeof navScore === "number" ? navScore : null);
  const [matches, setMatches] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState("");
  const [pitchModal, setPitchModal] = useState(null); // { business, pitch, isGenerating }

  // Load latest score if not passed via navigation
  useEffect(() => {
    if (!athleteId || score !== null) return;
    let cancelled = false;
    (async () => {
      try {
        const { data, error: err } = await supabase
          .from("quiz_responses")
          .select("rootd_score, created_at")
          .eq("user_id", athleteId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (err) throw err;
        if (!cancelled && typeof data?.rootd_score === "number") setScore(data.rootd_score);
      } catch (e) {
        if (!cancelled) setError(e.message || "Failed to load score.");
      }
    })();
    return () => { cancelled = true; };
  }, [athleteId, score]);

  const fetchMatches = useCallback(async () => {
    if (!athleteId) return;
    setLoading(true);
    setError("");
    try {
      const data = await getMatches(supabase, athleteId);
      setMatches(data || []);
    } catch (e) {
      setError(e.message || "Failed to load matches.");
    } finally {
      setLoading(false);
    }
  }, [athleteId]);

  useEffect(() => { if (athleteId) fetchMatches(); }, [athleteId, fetchMatches]);

  // fetch profile
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!athleteId) return;
      try {
        const { data } = await supabase.from("profiles").select("*").eq("id", athleteId).maybeSingle();
        if (mounted) setProfileData(data || null);
      } catch (err) {
        console.error(err);
      }
    })();
    return () => { mounted = false; };
  }, [athleteId]);

  // Run matching by reusing latest normalized row through process-quiz (works even with empty body if you added fallback)
  const runMatch = async () => {
    if (!athleteId) return;
    setLoading(true);
    setError("");
    try {
      // try to get user location and call process-quiz with location and default categories
      const geo = await new Promise((res) => {
        if (!navigator.geolocation) return res(null);
        navigator.geolocation.getCurrentPosition((p) => res(p.coords), () => res(null));
      });

      const { data: { session: fresh } } = await supabase.auth.getSession();
      const jwt = fresh?.access_token;
      const payload = {};
      if (geo) {
        payload.lat = geo.latitude;
        payload.lng = geo.longitude;
        payload.preferred_radius_miles = 10;
        payload.categories = ["coffee", "gym", "restaurant", "fitness", "food"];
      } else {
        // Fallback with mock location (San Francisco) for testing
        payload.lat = 37.7749;
        payload.lng = -122.4194;
        payload.preferred_radius_miles = 10;
        payload.categories = ["coffee", "gym", "restaurant", "fitness", "food"];
      }
      
      const out = await runProcessQuiz(jwt, { answers: payload });
      
      if (!out || !out.ok) throw new Error(out?.error || "Match failed");
      
      // Insert matches directly from client (temporary until server functions are deployed)
      if (out.matches && out.matches.length > 0) {
        console.log("Inserting", out.matches.length, "matches...");
        try {
          // Clean matches to only include columns that exist in the database
          const cleanMatches = out.matches.map(match => ({
            athlete_id: match.athlete_id,
            business_place_id: match.business_place_id,
            name: match.name,
            source: match.source,
            match_score: match.match_score
          }));

          const { data: _data, error } = await supabase
            .from("business_matches")
            .upsert(cleanMatches, { onConflict: "athlete_id,business_place_id" });

          if (error) {
            console.error("Matches insert error:", error);
          } else {
            console.log("Successfully inserted", cleanMatches.length, "matches");
          }
        } catch (insertError) {
          console.error("Insert failed:", insertError);
        }
      }
      
      await fetchMatches();
    } catch (err) {
      console.error("Match run error:", err);
      setError(err.message || "Match run failed.");
    } finally {
      setLoading(false);
    }
  };

  // Save match (idempotent upsert). Safe if you added a boolean 'saved' column. If not present, the update will no-op or error silently.
  const handleSave = async ({ athlete_id, business_place_id, name }) => {
    try {
      await supabase
        .from("business_matches")
        .upsert([{ athlete_id, business_place_id, name, saved: true }], { onConflict: "athlete_id,business_place_id" });
      await fetchMatches();
    } catch {
      // non-fatal
    }
  };

  // Pitch action via Edge Function
  const handlePitch = async (payload) => {
    // Open modal with loading state
    setPitchModal({
      business: payload,
      pitch: null,
      isGenerating: true
    });

    try {
      const { data: { session: fresh } } = await supabase.auth.getSession();
      const jwt = fresh?.access_token;
      const base = import.meta.env.VITE_SUPABASE_URL;
      
      const res = await fetch(`${base}/functions/v1/generate-pitch`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${jwt}` },
        body: JSON.stringify(payload),
      });
      
      const out = await res.json().catch(() => ({}));
      if (!res.ok || !out.ok) {
        throw new Error(out.error || `Pitch error ${res.status}`);
      }
      
      // Update modal with generated pitch
      setPitchModal(prev => ({
        ...prev,
        pitch: out.pitch || "Pitch generated successfully!",
        isGenerating: false
      }));
      
    } catch (e) {
      // Fallback to mock pitch if function fails
      console.error("Pitch generation failed, using fallback:", e);
      const businessName = payload.name || "this business";
      const fallbackPitch = `Hi ${businessName}! I'm an athlete with a growing social media presence and I'd love to collaborate with you. I believe we could create great content together that showcases your brand to my engaged audience. Let's discuss a potential partnership!`;
      
      setPitchModal(prev => ({
        ...prev,
        pitch: fallbackPitch,
        isGenerating: false,
        isFallback: true
      }));
    }
  };

  return (
    <ToastProvider>
    <div style={{ 
      minHeight: "100vh",
      background: "linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)",
      padding: "20px"
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        <HeaderBar />

        <div style={{ height: 32 }} />

        <MetricCards />

        <div style={{ height: 32 }} />
        {/* Header Section */}
        <div style={{
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          borderRadius: "24px",
          padding: "32px",
          marginBottom: "24px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "24px"
          }}>
            <div>
              <h1 style={{ 
                margin: 0, 
                fontSize: "14px",
                color: "#064E3B"
              }}>
                Welcome back! 👋
              </h1>
              <p style={{ 
                margin: "8px 0 0 0", 
                fontSize: "16px", 
                color: "var(--muted)",
                fontWeight: "500"
              }}>
                Find your perfect brand partnerships
              </p>
            </div>
            
            {typeof score === "number" && (
              <div style={{
                background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                color: "white",
                padding: "16px 24px",
                borderRadius: "16px",
                textAlign: "center",
                minWidth: "140px",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
              }}>
                <div style={{ fontSize: "24px", fontWeight: "800", marginBottom: "4px" }}>
                  {score.toFixed(2)}
                </div>
                <div style={{ fontSize: "12px", opacity: 0.9, fontWeight: "600" }}>
                  ROOTD SCORE
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ 
            display: "flex", 
            gap: "12px", 
            flexWrap: "wrap",
            marginBottom: error ? "20px" : "0"
          }}>
            <button 
              onClick={runMatch} 
              disabled={loading || !athleteId}
              style={{
                background: loading ? "#9CA3AF" : "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                color: "white",
                border: "none",
                padding: "14px 28px",
                borderRadius: "12px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 4px 14px 0 rgba(16, 185, 129, 0.25)",
                transform: loading ? "none" : "translateY(0)",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
              onMouseOver={e => {
                if (!loading) {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 8px 25px 0 rgba(16, 185, 129, 0.32)";
                }
              }}
              onMouseOut={e => {
                if (!loading) {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 4px 14px 0 rgba(16, 185, 129, 0.25)";
                }
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: "16px",
                    height: "16px",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTop: "2px solid white",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite"
                  }} />
                  Finding Matches...
                </>
              ) : (
                <>
                  🎯 Find New Matches
                </>
              )}
            </button>
            
            <button 
              onClick={fetchMatches}
              disabled={loading}
              style={{
                background: "white",
                color: "var(--muted-2)",
                border: "2px solid #E5E7EB",
                padding: "12px 24px",
                borderRadius: "12px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.2s ease"
              }}
              onMouseOver={e => {
                if (!loading) {
                  e.target.style.borderColor = "#9CA3AF";
                  e.target.style.background = "#F9FAFB";
                }
              }}
              onMouseOut={e => {
                if (!loading) {
                  e.target.style.borderColor = "#E5E7EB";
                  e.target.style.background = "white";
                }
              }}
            >
              🔄 Refresh
            </button>
            
            <a 
              href="/quiz"
              style={{
                background: "white",
                color: "#374151",
                border: "2px solid #E5E7EB",
                padding: "12px 24px",
                borderRadius: "12px",
                fontSize: "16px",
                fontWeight: "600",
                textDecoration: "none",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center"
              }}
              onMouseOver={e => {
                e.target.style.borderColor = "#9CA3AF";
                e.target.style.background = "#F9FAFB";
              }}
              onMouseOut={e => {
                e.target.style.borderColor = "#E5E7EB";
                e.target.style.background = "white";
              }}
            >
              📝 Retake Quiz
            </a>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              background: "linear-gradient(135deg, #FEFFFA 0%, #F0FFF4 100%)",
              border: "1px solid #BBF7D0",
              color: "#991B1B",
              padding: "16px",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Stats Section */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "24px"
        }}>
          <div style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
          }}>
            <div style={{ fontSize: "32px", fontWeight: "800", color: "#1F2937", marginBottom: "8px" }}>
              {matches.length}
            </div>
            <div style={{ fontSize: "14px", color: "#6B7280", fontWeight: "600" }}>
              Total Matches
            </div>
          </div>
          
          <div style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
          }}>
            <div style={{ fontSize: "32px", fontWeight: "800", color: "#1F2937", marginBottom: "8px" }}>
              {matches.filter(m => m.match_score > 0.7).length}
            </div>
            <div style={{ fontSize: "14px", color: "#6B7280", fontWeight: "600" }}>
              High-Quality Matches
            </div>
          </div>

          <div style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
          }}>
            <div style={{ fontSize: "32px", fontWeight: "800", color: "#1F2937", marginBottom: "8px" }}>
              {matches.length > 0 ? Math.round((matches.reduce((sum, m) => sum + (m.match_score || 0), 0) / matches.length) * 100) : 0}%
            </div>
            <div style={{ fontSize: "14px", color: "#6B7280", fontWeight: "600" }}>
              Avg Match Score
            </div>
          </div>
        </div>

        {/* Dashboard main layout: responsive 3/2/1 columns */}
        <div className="dashboard-grid" style={{ marginBottom: 18 }}>
          <aside className="left-col">
            <ProfileOverview profile={profileData || {}} onSave={fetchMatches} />
            <div style={{ height: 16 }} />
            <GoalsPreferences athleteId={athleteId} initial={{}} />
            <div style={{ height: 16 }} />
            <AchievementsTimeline />
          </aside>

          <main className="center-col">
            <BusinessMatches />
          </main>

          <aside className="right-col">
            <SocialAnalytics />
            <div style={{ height: 16 }} />
            <BrandSummary persona={{ traits: ["Authentic", "Community-first", "Driven"] }} />
            <div style={{ height: 16 }} />
            <SidebarPanel />
          </aside>
        </div>
      </div>
      
      {/* Pitch Modal */}
      {pitchModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px",
          animation: "modalFadeIn 0.3s ease-out"
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) setPitchModal(null);
        }}>
          <div style={{
            background: "white",
            borderRadius: "24px",
            maxWidth: "600px",
            width: "100%",
            maxHeight: "80vh",
            overflow: "hidden",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            animation: "modalSlideIn 0.3s ease-out"
          }}>
            {/* Modal Header */}
            <div style={{
              background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
              color: "white",
              padding: "24px 32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <div>
                <h2 style={{ 
                  margin: 0, 
                  fontSize: "24px", 
                  fontWeight: "700",
                  marginBottom: "4px"
                }}>
                  Generated Pitch
                </h2>
                <p style={{ 
                  margin: 0, 
                  fontSize: "16px", 
                  fontWeight: "500", 
                  color: "var(--text)"
                }}>
                  {pitchModal.business?.name || "Business Partnership"}
                </p>
              </div>
              <button
                onClick={() => setPitchModal(null)}
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  border: "none",
                  color: "white",
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontSize: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease"
                }}
                onMouseOver={e => e.target.style.background = "rgba(255, 255, 255, 0.3)"}
                onMouseOut={e => e.target.style.background = "rgba(255, 255, 255, 0.2)"}
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ 
              padding: "32px",
              maxHeight: "60vh",
              overflowY: "auto"
            }}>
              {pitchModal.isGenerating ? (
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "40px 20px",
                  textAlign: "center"
                }}>
                  <div style={{
                    width: "48px",
                    height: "48px",
                    border: "4px solid #E5E7EB",
                    borderTop: "4px solid #10B981",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                    marginBottom: "24px"
                  }} />
                  <h3 style={{ 
                    fontSize: "20px", 
                    fontWeight: "600", 
                    color: "#374151",
                    margin: "0 0 8px 0"
                  }}>
                    Generating Your Pitch...
                  </h3>
                  <p style={{ 
                    color: "#6B7280", 
                    fontSize: "16px",
                    margin: 0
                  }}>
                    Creating a personalized message for {pitchModal.business?.name}
                  </p>
                </div>
              ) : (
                <>
                  {/* Business Info Card */}
                  <div style={{
                    background: "#F9FAFB",
                    border: "1px solid #E5E7EB",
                    borderRadius: "16px",
                    padding: "20px",
                    marginBottom: "24px"
                  }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "12px"
                    }}>
                      <div style={{
                              width: "48px",
                              height: "48px",
                              background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                              borderRadius: "12px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                              fontSize: "20px"
                            }}>
                        🏢
                      </div>
                      <div>
                        <h3 style={{ 
                          margin: 0, 
                          fontSize: "18px", 
                          fontWeight: "700", 
                          color: "#1F2937"
                        }}>
                          {pitchModal.business?.name}
                        </h3>
                        <p style={{ 
                          margin: 0, 
                          fontSize: "14px", 
                          color: "#6B7280",
                          textTransform: "capitalize"
                        }}>
                          {pitchModal.business?.category} • {Math.round((pitchModal.business?.match_score || 0) * 100)}% Match
                        </p>
                      </div>
                    </div>
                    {pitchModal.business?.address && (
                      <p style={{ 
                        margin: 0, 
                        fontSize: "14px", 
                        color: "#6B7280",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}>
                        📍 {pitchModal.business.address}
                      </p>
                    )}
                  </div>

                  {/* Pitch Content */}
                  <div style={{
                    marginBottom: "24px"
                  }}>
                    <h4 style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#374151",
                      marginBottom: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px"
                    }}>
                      💬 Your Personalized Pitch
                      {pitchModal.isFallback && (
                        <span style={{
                          background: "#FEF3C7",
                          color: "#92400E",
                          fontSize: "12px",
                          padding: "4px 8px",
                          borderRadius: "6px",
                          fontWeight: "500"
                        }}>
                          Fallback Version
                        </span>
                      )}
                    </h4>
                    <div style={{
                      background: "white",
                      border: "2px solid #E5E7EB",
                      borderRadius: "12px",
                      padding: "20px",
                      fontSize: "15px",
                      lineHeight: "1.6",
                      color: "#374151",
                      whiteSpace: "pre-wrap",
                      fontFamily: "system-ui, -apple-system, sans-serif"
                    }}>
                      {pitchModal.pitch}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{
                    display: "flex",
                    gap: "12px",
                    flexWrap: "wrap"
                  }}>
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(pitchModal.pitch);
                          // Show temporary success feedback
                          const btn = event.target;
                          const originalText = btn.textContent;
                          btn.textContent = "✓ Copied!";
                          btn.style.background = "#10B981";
                          setTimeout(() => {
                            btn.textContent = originalText;
                            btn.style.background = "linear-gradient(135deg, #10B981 0%, #059669 100%)";
                          }, 2000);
                        } catch (err) {
                          console.error('Failed to copy text: ', err);
                        }
                      }}
            style={{
              flex: 1,
              background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
              color: "white",
                        border: "none",
                        padding: "14px 20px",
                        borderRadius: "12px",
                        fontSize: "16px",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px"
                      }}
                    >
                      📋 Copy to Clipboard
                    </button>
                    <button
                      onClick={() => setPitchModal(null)}
                      style={{
                        background: "white",
                        color: "#6B7280",
                        border: "2px solid #E5E7EB",
                        padding: "14px 20px",
                        borderRadius: "12px",
                        fontSize: "16px",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                    >
                      Close
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add CSS animations for modal */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalSlideIn {
          from { 
            opacity: 0;
            transform: translateY(-50px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
    </ToastProvider>
  );
}
