"use client";
// components/AtlasTitan.js — REVISION 3.2
//
// Classical Atlas iconography in side profile (figure facing right):
//   • Deep kneel — right knee bent and planted forward, left knee on ground
//   • Body compressed under the weight, leaning forward
//   • Both arms RAISED OVERHEAD, hands meeting at the sphere's underside
//   • Head bowed deeply, almost between the upraised arms
//   • Celestial sphere held aloft, with armillary rings
//
// Reference: Lee Lawrie's Atlas at Rockefeller Center, Farnese Atlas.

export default function AtlasTitan({
  size = 140,
  color = "#c4a265",
  opacity = 1,
  showRings = true,
  className = "",
}) {
  return (
    <svg
      width={size * (240 / 280)}
      height={size}
      viewBox="0 0 240 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", opacity }}
      className={className}
      aria-label="Atlas the Titan in classical side profile, kneeling and supporting the celestial sphere"
    >
      {/* ── CELESTIAL SPHERE ─────────────────────────────────────────
          Held aloft by Atlas's raised arms. Drawn with armillary rings
          to make it read as a celestial / cosmographic sphere rather
          than just a circle. */}
      <g transform="translate(125, 60)">
        <circle cx="0" cy="0" r="44" stroke={color} strokeWidth="1.3" fill="none" />
        {/* Equatorial ring */}
        <ellipse cx="0" cy="0" rx="44" ry="12" stroke={color} strokeWidth="0.9" fill="none" opacity="0.7" />
        {/* Tropics */}
        <ellipse cx="0" cy="-19" rx="38" ry="9" stroke={color} strokeWidth="0.6" fill="none" opacity="0.45" />
        <ellipse cx="0" cy="19" rx="38" ry="9" stroke={color} strokeWidth="0.6" fill="none" opacity="0.45" />
        {/* Ecliptic — diagonal band tilted ~23° */}
        <ellipse cx="0" cy="0" rx="44" ry="13" stroke={color} strokeWidth="0.9" fill="none" opacity="0.55" transform="rotate(-23)" />
        {/* Polar axis */}
        <line x1="0" y1="-48" x2="0" y2="48" stroke={color} strokeWidth="0.5" opacity="0.32" />

        {showRings && (
          <>
            <circle cx="0" cy="0" r="50" stroke={color} strokeWidth="0.4" fill="none" opacity="0.25" strokeDasharray="2 4" />
            <circle cx="0" cy="0" r="56" stroke={color} strokeWidth="0.3" fill="none" opacity="0.18" strokeDasharray="1 6" />
          </>
        )}
      </g>

      {/* ── ATLAS — facing RIGHT, deep kneeling pose ────────────────

          Geometry plan:
            Sphere centre:     (125, 60)
            Sphere bottom:     (125, 104)
            Hands grip sphere: y ≈ 104
            Wrists:            y ≈ 110-115
            Elbows:            y ≈ 145-155
            Shoulders:         y ≈ 165-175
            Head (bowed):      between elbows, around (110, 145)
            Torso:             y ≈ 175-210
            Hip:               y ≈ 215
            Knees / feet:      y ≈ 245-260
      */}

      {/* RIGHT ARM (FRONT) — bent at elbow, hand reaching up to sphere.
          Path traces: shoulder → upper arm rising → elbow → forearm rising
          → hand at sphere underside. */}
      <path
        d="M 138 168
           Q 145 158 148 144
           Q 150 130 145 118
           L 140 110
           Q 137 106 134 106
           L 130 110
           Q 132 116 134 124
           Q 135 134 132 144
           Q 130 156 128 168
           Z"
        fill={color}
        opacity="0.95"
      />

      {/* LEFT ARM (BACK, partially hidden) — similar shape, behind the right
          arm. Lower opacity to suggest depth. */}
      <path
        d="M 122 168
           Q 117 158 116 144
           Q 116 130 120 118
           L 122 110
           Q 124 107 126 108
           L 128 112
           Q 124 120 122 130
           Q 120 142 119 154
           Q 119 162 120 168
           Z"
        fill={color}
        opacity="0.6"
      />

      {/* HEAD — bowed deeply forward and down, almost between the arms.
          Side-profile silhouette: hair/skull at top, bowed forward, brow
          forward and chin tucked under. */}
      <path
        d="M 132 152
           Q 140 152 144 158
           Q 146 164 144 170
           Q 142 174 138 174
           L 132 172
           Q 128 168 128 162
           Q 128 156 132 152
           Z"
        fill={color}
        opacity="0.92"
      />

      {/* SHOULDER & UPPER BACK MASS — broad, the platform of muscle that
          carries the sphere's weight. Drawn as a single curving slab,
          slightly higher on the back side than the front to suggest
          the body leaning forward. */}
      <path
        d="M 116 168
           Q 116 162 122 160
           L 138 160
           Q 146 162 148 168
           Q 148 178 144 184
           L 140 192
           Q 130 192 122 188
           Q 116 180 116 168
           Z"
        fill={color}
        opacity="0.95"
      />

      {/* TORSO (CHEST → ABDOMEN) — leans forward. Side profile: visible
          line is the front of the chest curving down to the waist. */}
      <path
        d="M 122 188
           Q 116 200 116 214
           Q 120 222 130 222
           L 144 220
           Q 148 210 146 198
           Q 142 192 134 190
           Z"
        fill={color}
        opacity="0.92"
      />

      {/* PELVIS / GLUTE — connects torso to legs. Compact, taking the
          downward force from the loaded torso. */}
      <path
        d="M 118 218
           Q 114 226 116 234
           Q 122 240 134 238
           L 152 234
           Q 156 224 152 216
           Q 142 214 130 216
           Z"
        fill={color}
        opacity="0.95"
      />

      {/* RIGHT LEG (FRONT) — bent at knee, foot planted forward.
          Thigh angles down-and-forward, shin angles down to a planted foot.
          The pose says "bracing against the weight". */}
      <path
        d="M 138 232
           Q 152 240 168 252
           L 174 260
           Q 178 264 176 268
           L 168 268
           Q 156 258 144 248
           Q 134 240 130 234
           Z"
        fill={color}
        opacity="0.95"
      />

      {/* RIGHT FOOT — planted, slightly extended forward. */}
      <path
        d="M 168 264
           L 192 264
           Q 198 266 198 270
           L 196 274
           L 170 274
           Q 166 272 166 268
           Z"
        fill={color}
        opacity="0.95"
      />

      {/* LEFT THIGH (BACK) — knee on the ground behind. Drawn at
          slightly lower opacity to recede. The knee anchors at a
          point lower than the hip, the calf folds back beneath. */}
      <path
        d="M 116 232
           Q 104 238 96 250
           L 92 262
           Q 92 268 100 268
           L 110 264
           Q 116 252 122 240
           Z"
        fill={color}
        opacity="0.78"
      />

      {/* LEFT FOOT — folded back under the buttock, just visible. */}
      <path
        d="M 92 264
           L 110 264
           Q 116 268 114 272
           L 112 274
           L 92 274
           Q 88 270 92 264
           Z"
        fill={color}
        opacity="0.7"
      />

      {/* GROUND — long ellipse beneath the figure suggesting the earth */}
      <ellipse cx="135" cy="276" rx="78" ry="2.5" fill={color} opacity="0.4" />
      <line x1="40" y1="278" x2="225" y2="278" stroke={color} strokeWidth="0.5" opacity="0.25" />
    </svg>
  );
}
