import React from "react";

/**
 * Soft decorative blobs + shapes sitting behind page content.
 * Purely visual, pointer-events disabled, matches the app's
 * indigo / lavender theme for a more polished, professional feel.
 */
export default function Decor() {
  return (
    <svg
      className="decor-bg"
      viewBox="0 0 520 900"
      preserveAspectRatio="xMidYMin slice"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="decorBlobA" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8ca8ff" />
          <stop offset="100%" stopColor="#b89cff" />
        </linearGradient>
        <linearGradient id="decorBlobB" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffd6ec" />
          <stop offset="100%" stopColor="#c9d6ff" />
        </linearGradient>
        <filter id="decorBlur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="34" />
        </filter>
      </defs>
      <circle cx="460" cy="40" r="130" fill="url(#decorBlobA)" opacity="0.35" filter="url(#decorBlur)" />
      <circle cx="-40" cy="260" r="150" fill="url(#decorBlobB)" opacity="0.4" filter="url(#decorBlur)" />
      <circle cx="500" cy="640" r="160" fill="url(#decorBlobA)" opacity="0.28" filter="url(#decorBlur)" />
      <circle cx="20" cy="860" r="140" fill="url(#decorBlobB)" opacity="0.3" filter="url(#decorBlur)" />
      {/* small crisp accent shapes for a professional finishing touch */}
      <circle cx="446" cy="128" r="5" fill="#7b93f8" opacity="0.5" />
      <circle cx="70" cy="200" r="4" fill="#b89cff" opacity="0.45" />
      <rect x="30" y="470" width="9" height="9" rx="2" fill="#7b93f8" opacity="0.35" transform="rotate(20 34 474)" />
      <rect x="470" y="560" width="8" height="8" rx="2" fill="#b89cff" opacity="0.4" transform="rotate(-15 474 564)" />
    </svg>
  );
}
