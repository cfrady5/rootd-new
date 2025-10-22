// /src/pages/Dashboard.jsx — updated to show matches with MatchCard and actions
import React, { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../auth/AuthProvider.jsx";
import supabase from "../lib/supabaseClient.js";
import { getMatches } from "../lib/api.js";
import MatchCard from "../components/MatchCard.jsx";
import HeaderBar from "../components/dashboard/HeaderBar.jsx";
import ProfileOverview from "../components/dashboard/ProfileOverview.jsx";
import AchievementsTimeline from "../components/dashboard/AchievementsTimeline.jsx";
import SocialAnalytics from "../components/dashboard/SocialAnalytics.jsx";
import BusinessMatches from "../components/dashboard/BusinessMatches.jsx";
import BrandSummary from "../components/dashboard/BrandSummary.jsx";
import GoalsPreferences from "../components/dashboard/GoalsPreferences.jsx";
import SidebarPanel from "../components/dashboard/SidebarPanel.jsx";
import { StatCard } from "../components/PremiumComponents";
import { TrendingUp, Target, Award } from "lucide-react";
// Toasts are provided in DashboardLayout

  // hair color constant unused; remove to satisfy lint

export default function Dashboard() {
  const { state } = useLocation();
  const navScore = state?.rootd_score;

  const { session } = (useAuth?.() ?? {});
  const athleteId = session?.user?.id || null;

  // const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(typeof navScore === "number" ? navScore : null);
  const [matches, setMatches] = useState([]);
  const [profileData, setProfileData] = useState(null);
  // const [error, setError] = useState("");
  const [pitchModal, setPitchModal] = useState(null); // { business, pitch, isGenerating }
  const [refreshMatchesFn, setRefreshMatchesFn] = useState(null);

  // Callback to capture refresh function from BusinessMatches
  const handleRefreshAvailable = useCallback((refreshFn) => {
    setRefreshMatchesFn(() => refreshFn);
  }, []);

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
  if (!cancelled) console.warn(e.message || "Failed to load score.");
      }
    })();
    return () => { cancelled = true; };
  }, [athleteId, score]);

  const fetchMatches = useCallback(async () => {
    if (!athleteId) {
      console.log("fetchMatches: No athleteId");
      return;
    }
  console.log("fetchMatches: Starting refresh...");
    try {
      const data = await getMatches(supabase, athleteId);
      console.log("fetchMatches: Got", data?.length || 0, "matches");
      setMatches(data || []);
    } catch (e) {
      console.error("fetchMatches error:", e);
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
      } catch (err) { console.error(err); }
    })();
    return () => { mounted = false; };
  }, [athleteId]);

  return (
    <ToastProvider>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{ 
        background: "#f9fafb",
        minHeight: "100vh",
        padding: "24px"
      }}
    >
      <div style={{
        maxWidth: "1400px",
        margin: "0 auto"
      }}>

        <HeaderBar onRefreshMatches={refreshMatchesFn} />

        {/* Stats Section - Premium StatCards with Real Data */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "20px",
          marginBottom: "32px"
        }}>
          <StatCard
            label="Total Matches"
            value={matches.length}
            icon={TrendingUp}
          />

          <StatCard
            label="High-Quality Matches"
            value={matches.filter(m => m.match_score > 0.7).length}
            icon={Target}
          />

          <StatCard
            label="Avg Match Score"
            value={`${matches.length > 0 ? Math.round((matches.reduce((sum, m) => sum + (m.match_score || 0), 0) / matches.length) * 100) : 0}%`}
            icon={Award}
          />
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
            <BusinessMatches onRefreshAvailable={handleRefreshAvailable} />
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
              background: "linear-gradient(135deg, var(--primary) 0%, #1e4f26 100%)",
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
                    border: "4px solid var(--border)",
                    borderTop: "4px solid var(--primary)",
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
                              background: "linear-gradient(135deg, var(--primary) 0%, #1e4f26 100%)",
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
    </motion.div>
    </ToastProvider>
  );
}
