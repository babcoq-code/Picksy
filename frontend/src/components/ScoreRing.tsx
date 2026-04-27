"use client";

import * as React from "react";

type ScoreRingSize = "sm" | "md" | "lg";

export interface ScoreRingProps {
  score: number;
  size?: ScoreRingSize | number;
  label?: string;
  showLabel?: boolean;
  className?: string;
  duration?: number;
  strokeWidth?: number;
}

const SIZE_CONFIG = {
  sm: { pixels: 40, strokeWidth: 4, fontSize: 14 },
  md: { pixels: 64, strokeWidth: 6, fontSize: 22 },
  lg: { pixels: 120, strokeWidth: 9, fontSize: 36 },
};

function getScoreColor(score: number): string {
  if (score < 40) return "#FF6B5F";
  if (score < 60) return "#FFB347";
  if (score < 80) return "#4257FF";
  return "#3ED6A3";
}

export function ScoreRing({ score, size = "md", className }: ScoreRingProps): React.JSX.Element {
  const safeScore = Math.min(100, Math.max(0, Math.round(isNaN(score) ? 0 : score)));
  const config = typeof size === "number"
    ? { pixels: size, strokeWidth: Math.max(4, Math.round(size / 14)), fontSize: Math.max(12, Math.round(size / 3.5)) }
    : SIZE_CONFIG[size];
  const radius = (config.pixels - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safeScore / 100) * circumference;
  const color = getScoreColor(safeScore);
  const id = `score-${safeScore}-${size}`;

  return (
    <div
      role="img"
      aria-label={`Score Troviio : ${safeScore}/100`}
      style={{ position: "relative", width: config.pixels, height: config.pixels, display: "inline-grid", placeItems: "center" }}
      className={className}
    >
      <svg width={config.pixels} height={config.pixels} viewBox={`0 0 ${config.pixels} ${config.pixels}`} style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={color} stopOpacity="0.7" />
          </linearGradient>
        </defs>
        <circle
          cx={config.pixels / 2}
          cy={config.pixels / 2}
          r={radius}
          fill="none"
          stroke="#EFE3D6"
          strokeWidth={config.strokeWidth}
          opacity="0.3"
        />
        <circle
          cx={config.pixels / 2}
          cy={config.pixels / 2}
          r={radius}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transformOrigin: "50% 50%", transform: "rotate(-90deg)" }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
        <span style={{ color, fontFamily: "'Inter', sans-serif", fontSize: config.fontSize, fontWeight: 800, lineHeight: 1 }}>
          {safeScore}
        </span>
      </div>
    </div>
  );
}

export default ScoreRing;
