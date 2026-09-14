/**
 * The banker portrait from the advisor hero, lifted verbatim from
 * ui_kits/navigator/NavigatorConsole.html and converted to JSX.
 */
export function BankerPortrait({ className }) {
  return (
    <svg viewBox="0 0 240 280" className={className} aria-label="Investment banker">
    <g fill="none" stroke="#2a1e14" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    {/* Hair silhouette / crown */}
    <path d="M 86 74
    C 86 52 100 40 120 40
    C 140 40 154 52 154 74"/>
    {/* Side hair sweep (classic banker part, left-sided) */}
    <path d="M 90 76 C 98 66 112 60 126 62 C 138 64 146 70 150 78"/>
    <path d="M 102 70 C 112 66 124 66 134 72"/>
    {/* Face / jaw */}
    <path d="M 88 80
    C 88 104 96 124 108 132
    L 108 146
    C 108 151 112 154 120 154
    C 128 154 132 151 132 146
    L 132 132
    C 144 124 152 104 152 80"/>
    {/* Ears */}
    <path d="M 88 98 C 84 100 82 106 84 112 C 86 115 90 115 91 113"/>
    <path d="M 152 98 C 156 100 158 106 156 112 C 154 115 150 115 149 113"/>
    {/* Brows */}
    <path d="M 100 102 C 104 100 110 100 114 102"/>
    <path d="M 126 102 C 130 100 136 100 140 102"/>
    {/* Eyes */}
    <circle cx="107" cy="110" r="1.6" fill="#2a1e14"/>
    <circle cx="133" cy="110" r="1.6" fill="#2a1e14"/>
    {/* Nose */}
    <path d="M 120 112 L 118 124 C 117 128 119 130 122 130"/>
    {/* Mouth */}
    <path d="M 112 138 C 116 140 124 140 128 138"/>
    {/* Neck sides */}
    <path d="M 108 152 C 104 156 100 160 96 164"/>
    <path d="M 132 152 C 136 156 140 160 144 164"/>
    {/* Shirt collar V */}
    <path d="M 96 164 L 120 192 L 144 164"/>
    {/* Shirt inner placket */}
    <path d="M 120 192 L 120 244"/>
    {/* Tie (knot + body) */}
    <path d="M 114 192 L 120 184 L 126 192 L 124 204 L 132 258 L 120 272 L 108 258 L 116 204 Z"
    fill="#2a1e14" stroke="#2a1e14"/>
    {/* Tie knot highlight */}
    <path d="M 118 194 L 120 198 L 122 194" stroke="#c7a565" strokeWidth="1"/>
    {/* Suit jacket lapels */}
    <path d="M 96 164
    C 78 178 66 200 60 228
    L 60 272"/>
    <path d="M 144 164
    C 162 178 174 200 180 228
    L 180 272"/>
    {/* Lapel fold lines */}
    <path d="M 102 176 C 90 188 80 208 76 228 L 76 256"/>
    <path d="M 138 176 C 150 188 160 208 164 228 L 164 256"/>
    {/* Shoulder seams */}
    <path d="M 96 164 C 84 162 72 166 60 176"/>
    <path d="M 144 164 C 156 162 168 166 180 176"/>
    {/* Jacket bottom edge */}
    <path d="M 60 272 L 180 272"/>
    {/* Breast pocket square (folded triangle) */}
    <path d="M 150 212 L 162 212 L 162 226"/>
    <path d="M 150 212 L 158 204"/>
    {/* Lapel pin — Nashville Predators shield */}
    <g transform="translate(140 196)">
    <path d="M 0 -4 L 5 -2 L 5 3 C 5 6 2.5 8 0 9 C -2.5 8 -5 6 -5 3 L -5 -2 Z"
    fill="#041E42" stroke="#FFB81C" strokeWidth="0.8"/>
    <path d="M -2 -1 L 0 3 L 2 -1" fill="#FFB81C" stroke="none"/>
    </g>
    </g>
    </svg>
  );
}
