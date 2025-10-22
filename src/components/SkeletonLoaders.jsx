// src/components/SkeletonLoaders.jsx
import React from "react";
import { motion } from "framer-motion";

/**
 * Shimmer animation for skeleton loaders
 */
const shimmer = {
  initial: { backgroundPosition: "-200% 0" },
  animate: { backgroundPosition: "200% 0" },
};

const shimmerTransition = {
  duration: 2,
  repeat: Infinity,
  ease: "linear",
};

/**
 * Base skeleton with shimmer effect
 */
const SkeletonBase = ({ width, height, style = {} }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
    style={{
      width: width || "100%",
      height: height || "20px",
      borderRadius: "8px",
      background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
      backgroundSize: "200% 100%",
      ...style,
    }}
  >
    <motion.div
      variants={shimmer}
      initial="initial"
      animate="animate"
      transition={shimmerTransition}
      style={{
        width: "100%",
        height: "100%",
        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)",
        backgroundSize: "200% 100%",
        borderRadius: "inherit",
      }}
    />
  </motion.div>
);

/**
 * Skeleton for text lines
 */
export const SkeletonText = ({ lines = 1, width = "100%" }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "12px", width }}>
    {Array.from({ length: lines }).map((_, i) => (
      <SkeletonBase
        key={i}
        height="16px"
        width={i === lines - 1 && lines > 1 ? "70%" : "100%"}
      />
    ))}
  </div>
);

/**
 * Skeleton for a card/panel
 */
export const SkeletonCard = ({ height = "200px" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="card"
    style={{
      padding: "20px",
      height,
      display: "flex",
      flexDirection: "column",
      gap: "16px",
    }}
  >
    <SkeletonBase height="24px" width="60%" />
    <SkeletonBase height="16px" width="100%" />
    <SkeletonBase height="16px" width="85%" />
    <div style={{ marginTop: "auto" }}>
      <SkeletonBase height="40px" width="120px" style={{ borderRadius: "20px" }} />
    </div>
  </motion.div>
);

/**
 * Skeleton for match card (business card)
 */
export const SkeletonMatchCard = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
    className="card"
    style={{
      padding: "20px",
      display: "flex",
      flexDirection: "column",
      gap: "16px",
    }}
  >
    {/* Header with avatar */}
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <SkeletonBase
        width="56px"
        height="56px"
        style={{ borderRadius: "12px", flexShrink: 0 }}
      />
      <div style={{ flex: 1 }}>
        <SkeletonBase height="20px" width="70%" style={{ marginBottom: "8px" }} />
        <SkeletonBase height="14px" width="40%" />
      </div>
    </div>

    {/* Match score */}
    <SkeletonBase height="8px" width="100%" style={{ borderRadius: "4px" }} />

    {/* Description */}
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <SkeletonBase height="14px" width="100%" />
      <SkeletonBase height="14px" width="90%" />
      <SkeletonBase height="14px" width="75%" />
    </div>

    {/* Action buttons */}
    <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
      <SkeletonBase height="36px" width="100px" style={{ borderRadius: "8px" }} />
      <SkeletonBase height="36px" width="100px" style={{ borderRadius: "8px" }} />
    </div>
  </motion.div>
);

/**
 * Skeleton for profile overview
 */
export const SkeletonProfile = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="card"
    style={{
      padding: "24px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "16px",
    }}
  >
    {/* Avatar */}
    <SkeletonBase
      width="96px"
      height="96px"
      style={{ borderRadius: "50%" }}
    />

    {/* Name & sport */}
    <div style={{ textAlign: "center", width: "100%" }}>
      <SkeletonBase height="24px" width="60%" style={{ margin: "0 auto 12px" }} />
      <SkeletonBase height="16px" width="40%" style={{ margin: "0 auto" }} />
    </div>

    {/* Stats */}
    <div style={{ display: "flex", gap: "16px", width: "100%", marginTop: "8px" }}>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ flex: 1, textAlign: "center" }}>
          <SkeletonBase height="32px" width="100%" style={{ marginBottom: "8px" }} />
          <SkeletonBase height="14px" width="70%" style={{ margin: "0 auto" }} />
        </div>
      ))}
    </div>
  </motion.div>
);

/**
 * Skeleton for metric cards
 */
export const SkeletonMetricCard = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
    className="dashboard-card"
    style={{
      padding: "20px",
      textAlign: "center",
    }}
  >
    <SkeletonBase
      height="48px"
      width="80px"
      style={{ margin: "0 auto 12px" }}
    />
    <SkeletonBase
      height="16px"
      width="60%"
      style={{ margin: "0 auto" }}
    />
  </motion.div>
);

/**
 * Grid of skeleton match cards
 */
export const SkeletonMatchGrid = ({ count = 6 }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
      gap: "20px",
      padding: "20px 0",
    }}
  >
    {Array.from({ length: count }).map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.1, duration: 0.3 }}
      >
        <SkeletonMatchCard />
      </motion.div>
    ))}
  </div>
);

export default SkeletonBase;
