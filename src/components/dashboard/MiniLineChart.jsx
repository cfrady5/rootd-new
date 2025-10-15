import React from "react";

export default function MiniLineChart({ data = [] }) {
  const max = Math.max(1, ...data.map(d => d.y || 0));
  const pts = data.map((p, i) => `${(i / Math.max(1, data.length - 1)) * 160},${48 - ((p.y || 0) / max) * 48}`).join(" ");
  return (
    <svg width="100%" height="48" viewBox="0 0 160 48" preserveAspectRatio="none">
      <polyline fill="none" stroke="#10B981" strokeWidth="2" points={pts} />
    </svg>
  );
}
