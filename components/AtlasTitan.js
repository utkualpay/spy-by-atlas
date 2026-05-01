"use client";
// components/AtlasTitan.js
//
// The Atlas mythology mark — the titan carrying the globe on his shoulders.
// Stylised in line-art form to read at any size. Used:
//   • PublicFooter — small inline mark
//   • Login page — backdrop watermark
//   • 404 page — the figure shrugging off a missing world
//   • Email templates (future) — letterhead
//
// The shape is hand-drawn in SVG paths to preserve the mythological gesture
// (figure kneeling, arms raised, supporting a celestial sphere). Pure black
// or pure gold — never both. Color controlled by the `color` prop.

export default function AtlasTitan({
  size = 120,
  color = "#c4a265",
  opacity = 1,
  showRings = true,
  className = "",
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", opacity }}
      className={className}
      aria-label="Atlas carrying the globe"
    >
      {/* The globe — a thin-line sphere Atlas supports */}
      <circle cx="100" cy="55" r="42" stroke={color} strokeWidth="1.2" fill="none" />

      {/* Globe meridians — three latitude lines, three longitude lines */}
      <ellipse cx="100" cy="55" rx="42" ry="14" stroke={color} strokeWidth="0.8" fill="none" opacity="0.65" />
      <ellipse cx="100" cy="55" rx="42" ry="28" stroke={color} strokeWidth="0.6" fill="none" opacity="0.4" />
      <ellipse cx="100" cy="55" rx="14" ry="42" stroke={color} strokeWidth="0.8" fill="none" opacity="0.65" />
      <ellipse cx="100" cy="55" rx="28" ry="42" stroke={color} strokeWidth="0.6" fill="none" opacity="0.4" />

      {/* Optional outer rings */}
      {showRings && (
        <>
          <circle cx="100" cy="55" r="48" stroke={color} strokeWidth="0.4" fill="none" opacity="0.3" strokeDasharray="2 4" />
          <circle cx="100" cy="55" r="54" stroke={color} strokeWidth="0.3" fill="none" opacity="0.2" strokeDasharray="1 6" />
        </>
      )}

      {/* Atlas's hands — curved palms supporting the globe at its bottom */}
      <path
        d="M 64 90 Q 70 96 78 100 L 80 105 Q 78 102 72 98 Q 66 94 62 92 Z"
        fill={color}
        opacity="0.85"
      />
      <path
        d="M 136 90 Q 130 96 122 100 L 120 105 Q 122 102 128 98 Q 134 94 138 92 Z"
        fill={color}
        opacity="0.85"
      />

      {/* Atlas's arms — raised, angular, supporting the burden */}
      <path
        d="M 70 100 Q 62 110 58 130 L 65 132 Q 70 116 76 105 Z"
        fill={color}
        opacity="0.92"
      />
      <path
        d="M 130 100 Q 138 110 142 130 L 135 132 Q 130 116 124 105 Z"
        fill={color}
        opacity="0.92"
      />

      {/* Atlas's torso — broad shoulders, kneeling form */}
      <path
        d="M 64 130 L 60 155 Q 62 162 68 165 L 76 162 L 80 145 L 80 130 Z M 120 130 L 124 145 L 124 162 L 132 165 Q 138 162 140 155 L 136 130 Z"
        fill={color}
        opacity="0.92"
      />

      {/* The chest — connects torso elements */}
      <path
        d="M 80 130 L 80 145 L 88 148 L 112 148 L 120 145 L 120 130 Q 116 128 100 128 Q 84 128 80 130 Z"
        fill={color}
        opacity="0.85"
      />

      {/* Bowed head — small, between the raised arms */}
      <ellipse cx="100" cy="118" rx="10" ry="11" fill={color} opacity="0.92" />

      {/* The body's central line / muscular detail */}
      <line x1="100" y1="148" x2="100" y2="170" stroke={color} strokeWidth="0.6" opacity="0.5" />

      {/* Lower body — kneeling, knees drawn up */}
      <path
        d="M 68 165 Q 62 178 60 195 L 70 198 Q 78 188 82 175 Z"
        fill={color}
        opacity="0.88"
      />
      <path
        d="M 132 165 Q 138 178 140 195 L 130 198 Q 122 188 118 175 Z"
        fill={color}
        opacity="0.88"
      />

      {/* Knees / planted feet — anchored to the earth */}
      <path
        d="M 60 195 Q 56 205 60 215 L 80 215 Q 78 208 76 200 Z"
        fill={color}
        opacity="0.92"
      />
      <path
        d="M 140 195 Q 144 205 140 215 L 120 215 Q 122 208 124 200 Z"
        fill={color}
        opacity="0.92"
      />

      {/* Ground line — the earth Atlas kneels upon */}
      <line x1="40" y1="218" x2="160" y2="218" stroke={color} strokeWidth="0.8" opacity="0.5" />
      <line x1="55" y1="222" x2="145" y2="222" stroke={color} strokeWidth="0.4" opacity="0.3" />
    </svg>
  );
}
