// src/components/LoadingScreen.jsx
import React from "react";
import { motion } from "framer-motion";

/**
 * Reusable loading screen with motion animations
 * @param {string} message - Loading message to display (default: "Loading...")
 * @param {boolean} fullScreen - Whether to take full screen (default: true)
 */
export default function LoadingScreen({ message = "Loading...", fullScreen = true }) {
  const containerStyle = fullScreen
    ? {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
        zIndex: 100,
      }
    : {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 20px",
        minHeight: "400px",
      };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={containerStyle}
    >
      {/* Animated spinner */}
      <motion.div
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          width: "64px",
          height: "64px",
          border: "4px solid var(--border)",
          borderTop: "4px solid var(--accent-500)",
          borderRadius: "50%",
          marginBottom: "24px",
        }}
      />

      {/* Loading message with fade-in */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        style={{
          fontSize: "20px",
          fontWeight: "600",
          color: "var(--text)",
          textAlign: "center",
          maxWidth: "400px",
        }}
      >
        {message}
      </motion.div>

      {/* Pulsing dots */}
      <motion.div
        style={{
          display: "flex",
          gap: "8px",
          marginTop: "16px",
        }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
            }}
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "var(--accent-500)",
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}
