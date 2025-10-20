import React, { useState } from "react";

export default function MatchCard({ m, onSelect, onSave }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPitching, setIsPitching] = useState(false);
  
  const rating =
    typeof m.business_rating === "number" ? m.business_rating.toFixed(1) :
    typeof m.rating === "number" ? Number(m.rating).toFixed(1) : null;
    
  const matchScore = typeof m.match_score === "number" ? Math.round(m.match_score * 100) : 0;
  
  // Calculate distance if not already provided
  const distanceMiles = m.distance_miles || 
    (m.distance_meters ? (m.distance_meters / 1609.34).toFixed(1) : null);
  
  // Debug - log once per component mount
  React.useEffect(() => {
    console.log('MatchCard received:', {
      name: m.name,
      has_distance_miles: !!m.distance_miles,
      has_distance_meters: !!m.distance_meters,
      distance_miles_value: m.distance_miles,
      distance_meters_value: m.distance_meters,
      calculated: distanceMiles
    });
  }, [m.name, m.distance_miles, m.distance_meters, distanceMiles]);
  
  const getMatchScoreColor = (score) => {
    if (score >= 80) return { bg: "#DCFCE7", text: "#166534", border: "#BBF7D0" };
    if (score >= 60) return { bg: "#D1FAE5", text: "#065F46", border: "#86EFAC" };
    return { bg: "#FEEFEF", text: "#6B7280", border: "#F3F4F6" };
  };
  
  const getCategoryIcon = (category) => {
    const icons = {
      cafe: "☕", coffee: "☕", restaurant: "🍽️", food: "🍽️",
      gym: "💪", fitness: "🏋️", health: "🏥",
      retail: "🛍️", shopping: "🛍️", store: "🏪",
      beauty: "💄", salon: "✂️", spa: "🧖‍♀️"
    };
    return icons[category?.toLowerCase()] || "🏢";
  };
  
  const scoreColors = getMatchScoreColor(matchScore);
  
  const handlePitch = async () => {
    setIsPitching(true);
    try {
      await onSelect?.(m);
    } finally {
      setIsPitching(false);
    }
  };

  return (
    <div 
      style={{ 
        background: "white",
        borderRadius: "20px",
        padding: "24px",
        boxShadow: isHovered 
          ? "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
          : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        border: "1px solid #F3F4F6",
        transition: "all 0.3s ease",
        transform: isHovered ? "translateY(-4px)" : "translateY(0)",
        cursor: "pointer"
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header with Match Score */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "flex-start",
        marginBottom: "16px"
      }}>
        <div style={{ flex: 1, marginRight: "12px" }}>
            <h3 style={{ 
            margin: 0, 
            fontSize: "18px", 
            fontWeight: "700", 
            color: "var(--text)",
            lineHeight: "1.2"
          }}>
            {m.name || "Business"}
          </h3>
        </div>
        
        <div style={{
          background: scoreColors.bg,
          color: scoreColors.text,
          border: `1px solid ${scoreColors.border}`,
          padding: "6px 12px",
          borderRadius: "20px",
          fontSize: "12px",
          fontWeight: "700",
          whiteSpace: "nowrap"
        }}>
          {matchScore}% Match
        </div>
      </div>

      {/* Business Info */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "8px", 
          marginBottom: "8px",
          flexWrap: "wrap"
        }}>
          <span style={{ fontSize: "16px" }}>
            {getCategoryIcon(m.category)}
          </span>
          <span style={{ 
            fontSize: "14px", 
            color: "var(--muted)", 
            fontWeight: "600",
            textTransform: "capitalize"
          }}>
            {m.category || (Array.isArray(m.types) && m.types[0]) || "Business"}
          </span>
          {rating && (
            <>
              <span style={{ color: "#E5E7EB" }}>•</span>
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "2px",
                fontSize: "14px",
                color: "#F59E0B"
              }}>
                ⭐ {rating}
              </div>
            </>
          )}
          {distanceMiles ? (
            <>
              <span style={{ color: "#E5E7EB" }}>•</span>
              <span style={{ 
                fontSize: "14px", 
                color: "#6B7280",
                fontWeight: "500"
              }}>
                📍 {distanceMiles} mi
              </span>
            </>
          ) : (
            <>
              <span style={{ color: "#E5E7EB" }}>•</span>
              <span style={{ 
                fontSize: "12px", 
                color: "#9CA3AF",
                fontStyle: "italic"
              }}>
                Distance unavailable
              </span>
            </>
          )}
        </div>
        
        {m.address && (
          <div style={{ 
            fontSize: "13px", 
            color: "#9CA3AF",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            marginBottom: "8px"
          }}>
            📍 {m.address}
          </div>
        )}
        
        {m.reason && (
          <div style={{ 
            fontSize: "12px", 
            color: "#6B7280",
            background: "#F9FAFB",
            padding: "8px 12px",
            borderRadius: "8px",
            fontStyle: "italic"
          }}>
            {m.reason}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ 
        display: "flex", 
        gap: "8px",
        marginTop: "20px"
      }}>
        <button
          onClick={handlePitch}
          disabled={isPitching}
          style={{
            flex: 1,
            background: isPitching
              ? "#9CA3AF"
              : "linear-gradient(135deg, #10B981 0%, #059669 100%)",
            color: "white",
            border: "none",
            padding: "12px 16px",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: isPitching ? "not-allowed" : "pointer",
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px"
          }}
        >
          {isPitching ? (
            <>
                <div style={{
                width: "14px",
                height: "14px",
                border: "2px solid rgba(255,255,255,0.3)",
                borderTop: "2px solid white",
                borderRadius: "50%",
                animation: "spin 1s linear infinite"
              }} />
              Generating...
            </>
          ) : (
            <>
              💬 Generate Pitch
            </>
          )}
        </button>
        
        <button
          onClick={() => onSave?.(m)}
          style={{
            background: "white",
            color: "#6B7280",
            border: "2px solid #E5E7EB",
            padding: "12px 16px",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s ease"
          }}
          onMouseOver={e => {
            e.target.style.borderColor = "#9CA3AF";
            e.target.style.color = "#374151";
          }}
          onMouseOut={e => {
            e.target.style.borderColor = "#E5E7EB";
            e.target.style.color = "#6B7280";
          }}
        >
          💾
        </button>
      </div>
    </div>
  );
}
