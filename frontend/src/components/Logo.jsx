import React from "react";

/**
 * Circular brand logo for "Soru venumaa".
 * size: diameter in px. ring: show soft outer ring (used in headers).
 */
export default function Logo({ size = 38, ring = true, className = "" }) {
  return (
    <div
      className={`brand-logo ${ring ? "brand-logo--ring" : ""} ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 64 64" width="100%" height="100%" role="img" aria-label="Soru venumaa logo">
        <defs>
          <linearGradient id="soruLogoGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#93aeff" />
            <stop offset="55%" stopColor="#7b93f8" />
            <stop offset="100%" stopColor="#b89cff" />
          </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="32" fill="url(#soruLogoGrad)" />
        {/* fork */}
        <g stroke="#fff" strokeWidth="2.6" strokeLinecap="round" fill="none">
          <line x1="22" y1="16" x2="22" y2="30" />
          <line x1="18" y1="16" x2="18" y2="26" />
          <line x1="26" y1="16" x2="26" y2="26" />
          <path d="M18 26c0 2.2 1.8 4 4 4s4-1.8 4-4" />
          <line x1="22" y1="30" x2="22" y2="48" />
          {/* spoon */}
          <path d="M42 16c4 0 6 3.4 6 7.2 0 4.4-3 7.8-6 7.8s-6-3.4-6-7.8c0-3.8 2-7.2 6-7.2z" />
          <line x1="42" y1="31" x2="42" y2="48" />
        </g>
      </svg>
    </div>
  );
}
