import React from "react";

const LOGO_SRC = "/soru-venumaa-logo.jpeg";

/**
 * Brand logo for "Soru_Venumaa".
 * The supplied channel artwork is used as the actual logo image.
 */
export default function Logo({ size = 38, ring = true, className = "" }) {
  return (
    <div
      className={`brand-logo ${ring ? "brand-logo--ring" : ""} ${className}`}
      style={{ width: size, height: size }}
    >
      <img src={LOGO_SRC} alt="Soru_Venumaa logo" />
    </div>
  );
}
