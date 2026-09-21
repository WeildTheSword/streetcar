/**
 * The demo's guide character — an original wave mascot drawn for Streetcar.
 *
 * Deliberately NOT Tulane's Angry Wave: that mark is university trademark and
 * should not be committed here. To swap it in for an internal presentation,
 * drop the file at src/assets/wave.png and replace this component's usage in
 * DemoGuide.jsx with an <img>.
 */
export function WaveGuide({ className }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className={className} aria-hidden>
      {/* crest spray */}
      <path
        d="M18 52 C 20 26, 46 10, 72 16 C 96 21, 110 40, 106 58 C 103 44, 90 32, 72 30 C 50 27, 30 36, 18 52 Z"
        fill="#4A9FE0"
      />
      {/* body */}
      <path
        d="M16 60 C 16 36, 38 22, 62 26 C 88 30, 104 48, 100 70 C 97 88, 80 100, 58 100 C 34 100, 16 84, 16 60 Z"
        fill="#1E7A4F"
      />
      {/* curl */}
      <path
        d="M96 72 C 106 70, 112 78, 108 86 C 104 94, 92 94, 88 86 C 92 88, 98 86, 99 81 C 100 77, 98 74, 96 72 Z"
        fill="#166141"
      />
      {/* eyes */}
      <ellipse cx="52" cy="55" rx="8" ry="9" fill="#ffffff" />
      <ellipse cx="76" cy="55" rx="8" ry="9" fill="#ffffff" />
      <circle cx="54" cy="57" r="4" fill="#12100F" />
      <circle cx="78" cy="57" r="4" fill="#12100F" />
      {/* brow + smile */}
      <path d="M44 44 C 49 40, 57 40, 61 43" stroke="#12100F" strokeWidth="3" strokeLinecap="round" />
      <path d="M69 43 C 73 40, 81 40, 85 44" stroke="#12100F" strokeWidth="3" strokeLinecap="round" />
      <path
        d="M50 74 C 58 82, 74 82, 82 73"
        stroke="#12100F"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* foam */}
      <circle cx="30" cy="92" r="7" fill="#EAF4FB" />
      <circle cx="46" cy="99" r="5" fill="#EAF4FB" />
      <circle cx="20" cy="80" r="4.5" fill="#EAF4FB" />
    </svg>
  );
}
