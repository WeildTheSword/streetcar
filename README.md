# StreetCar Design System

> Heritage editorial identity for an AI-powered career navigation platform — built for Tulane University.

StreetCar transforms fragmented university data (transcripts, degree audits, alumni outcomes, hiring data) into real-time, outcome-driven guidance for students and career advisors. It builds "career fingerprints" that power course planning, alumni introductions, and data-backed career decisions — inside a FERPA-safe perimeter as a school-official contractor.

This design system preserves the product's **playbill / old-world New Orleans** identity: cream paper, brass hairlines, espresso ink, burgundy italic voice, and three serifs working in concert — never sans.

---

## Tagline
> **NOLA Roots. Global Hustle.** — Bringing students to their destination.

---

## Products

1. **StreetCar Pitch Deck (Web)** — 12-slide animated narrative (1920×1080), the primary artifact so far. Cover → Problem → Truths → Tulane Already Knows → Navigator's Day → Navigator's OS → Knowledge Bank → MVP Modules → Validated → FERPA → NOLA → Ask.
2. **Navigator Console** (*envisioned*) — the career-consultant-facing product: student lookup, pre-briefs before appointments, alumni radar, session recap auto-log, geo-match.
3. **Student-facing Opt-In** (*envisioned*) — personalized course paths, alumni introductions, role-ready skill tracks.

Only product #1 has shipped code. Products #2 and #3 are mocked in `ui_kits/` as high-fidelity prototypes informed by the pitch deck's vocabulary.

---

## Sources

- **GitHub repo** — `WeildTheSword/streetcar@main`
  - `PitchDeck_Web/` — the animated 12-slide deck (index.html, style.css, app.js)
  - `BrandAssets/Professionalpngs/` — logos, generative brand PNGs (fingerprint, oak tree, band, drama masks, etc.)
  - `BrandAssets/SVG Illustrations/` — line-art engravings (cathedral, compass-rose, fleur-de-lis, gas-lantern, king-cake, mardi-gras-mask, steamboat, trumpet, streetcar-route, live-oak, magnolia, wrought-iron-balcony)
  - `Context/` — SCQA, claims-verdict, evidence base, FERPA framing, Tulane advising problems
- **Figma file** (`Untitled.fig`) — 12 pages of generative brand imagery (mostly the `Professionalpngs` source materials). UI screens are not yet in Figma.
- **Uploaded assets** — the TTF font files for Playfair Display, Cormorant Garamond, and Cinzel; PNG brand art; SVG illustrations.

---

## CONTENT FUNDAMENTALS

**Voice.** Confident, restrained, literary. Language borrows from old print advertising and private-club prospectuses — "a wager on character," "est.," "the first job is a ten-year bet." It is editorial, never startup-y.

**Sentence shape.** Short, declarative, confident. Em-dashes and single-period sentence fragments are welcome. Rhetorical pairs and triads are common: "One handshake. $160K of debt. A banking offer." or "Unified. FERPA-safe. Built for Tulane."

**Person.** Prefer the institutional third person ("Streetcar does X"). Direct address ("you") is reserved for product CTAs, rarely in editorial copy. "We" appears in the founder / ask context only.

**Casing.**
- Headlines: Title Case, Playfair 700–900.
- Eyebrows / labels / page numbers: `ALL CAPS` with ~0.3–0.5em letter-spacing (Cinzel small-caps).
- Subtitles / pull-quotes: sentence case, italic, burgundy (Cormorant Garamond italic).
- Numerals are editorial: "Three Hiring Truths," not "3 Hiring Truths." Roman numerals (I. II. III.) for numbered lists.

**Punctuation.** Em-dashes — like this — not hyphens. Curly quotes " " always. No exclamation points. No emoji, ever. No ampersands except in proper nouns. Use `·` (middle dot) as a separator in eyebrows and metadata (`Tulane University Pilot · New Orleans, LA`).

**Numbers.** Big stats are the hero — format cleanly ($5K, 42.5%, $60–70K). Use en-dashes for ranges. Always cite a source in a Cinzel small-caps caption beneath the number (`NY FED · Q4 2025`).

**Forbidden.**
- Emoji. Ever. Even in error states.
- Exclamation points.
- Startup filler: "unleash," "supercharge," "reimagine," "game-changing."
- Rounded-corner UI chrome and drop-shadow cards.
- Three Mardi Gras accents at once — use one accent color at a time, max.

**Specimen lines** (pulled from shipped copy):
- "The first job is a ten-year bet — and most graduates lose it."
- "One read-only layer above every Tulane career system."
- "Career consultants help navigate. Streetcar is the map."
- "In one school. Once a year. By hand."
- "One student. One profile. Every signal."

---

## VISUAL FOUNDATIONS

**Palette.**
Cream paper (`#F5EDE0` base, `#FAF4E8` highlight, `#E8DCC4` tint) as the *only* background color. Espresso (`#2A1A12`) and ink (`#1C120C`) for primary text. Brass (`#B8935A` / deep `#8A6B3C`) for every hairline, rule, border, Cinzel label, and numeric caption. Burgundy (`#5A1F2B`) is the single editorial accent — italic pull-quotes, big numerals, emphasis. Muted tan (`#6E5A48`) for supporting text. Mardi Gras purple / green / gold appear only on illustrations, never in UI chrome, and never more than one at a time.

**Typography.** Three serifs, in strict assignment — never sans:
- **Playfair Display 800–900** — display headlines, stat numerals. Tight tracking, letter-spacing 0.01–0.025em.
- **Cormorant Garamond italic 500** — subtitles, pull-quotes, human voice, card bodies. Line-height 1.3–1.45.
- **Cinzel 500** (small-caps) — labels, eyebrows, numeric captions, page numbers, brand marks. `text-transform: uppercase` with 0.3–0.55em letter-spacing.

**Spacing.** Generous. 4-based scale (4/8/12/16/24/32/48/64/96 px). Slide margins 110px. Between sections: 60–80px. Card padding: 22–32px. Whitespace is the compositional tool.

**Backgrounds.** Radial cream gradient: `radial-gradient(ellipse at 50% 45%, #FAF4E8 0%, #F5EDE0 55%, #E8DCC4 100%)` — every surface. A subtle SVG fractal-noise grain overlay at 0.09 opacity, `mix-blend-mode: overlay`. No solid colors. No photography, except for atmospheric PNG brand art used at 10–20% opacity as section ornaments.

**Borders.** Thin 1px brass (`#B8935A`) hairlines. Double-rule playbill frames: 60px-inset outer rule at 0.55 opacity + 72px-inset inner rule at 0.22 opacity. No rounded corners anywhere in UI chrome. No drop shadows, no inner shadows, no elevation.

**Cards.** Flat. `1px solid var(--brass)` border, `rgba(255,255,255,0.4)` white-wash fill over cream, 18–32px padding. Sharp corners. Section headers can tab out of the border with a "cartouche" — an absolutely-positioned Cinzel label overlapping the top edge, with `background: var(--cream)` and a 12–14px horizontal pad to create a cut-out effect.

**Animation.** All easing is `cubic-bezier(0.16, 1, 0.3, 1)` — the signature slow exit curve. Staggered rise-fade entrances (`translateY(18px) + opacity 0 → 1`) at 900–1200ms with 150–200ms delay increments. Ring draws from 0 to fill-percentage in 1600ms. Number counters tick over 1500ms with cubic ease-out. No bounces, no springs, no parallax.

**Hover states.** Brass arrow buttons: background → brass, foreground → cream, scale(1.08). Cards: no hover treatment (editorial surfaces, not interactive). Links in copy: underline on hover, stays burgundy. Dots in pagers: scale(1.45) + burgundy fill when active.

**Press states.** No visual feedback beyond native focus ring. The design is editorial — kinetic feedback is reserved for real controls (arrows, dots, toggles).

**Transparency & blur.** Nav chrome: `background: rgba(42,26,18,0.07)` + `backdrop-filter: blur(8px)` — used ONLY on floating overlays. Card fills: `rgba(255,255,255,0.4)`. Never used to layer UI on photography.

**Corner radii.** **Zero.** The only exception is pagination dots and the nav pill (`border-radius: 999px`), which earn their roundness by being anachronistic UI chrome the user expects.

**Imagery color vibe.** Warm, never cool. Sepia-adjacent. Line-art engravings in espresso ink with optional single-color Mardi Gras accent. PNG brand art (fingerprint, oak tree, band) is full-color but sepia-toned, used at 10–30% opacity as section ornaments.

**Layout rules.** Centered compositions dominate. Asymmetric 2-column splits (1.25fr : 1fr) for comparison layouts. Numbered sections with Roman numerals. Every slide has: chapter mark (top center), big title (center), italic subtitle (center), content, brand mark (bottom-left), page number (bottom-right, Cinzel). Fixed 1920×1080 scaled with `transform: scale()`; nav chrome lives outside the scaled canvas.

---

## ICONOGRAPHY

**Philosophy.** Icons are line-art engravings. No filled shapes, no duotone, no emoji, no rounded utility icons. Every icon reads like a copper-plate engraving from a 19th-century streetcar schedule.

**Three tiers.**
1. **Hero illustrations** — SVG engravings at 560×560 in a 600 viewBox. Espresso primary stroke (`#2A1A12`, 2.4px round cap/join), brass-deep secondary hatch (`#8A6B3C`, 1.2px), muted fine detail (`#6E5A48`, 0.9px, 4–6px spacing). Optionally wrapped in a double-rule brass cartouche. See `assets/illustrations/` — cathedral, compass-rose, fleur-de-lis, gas-lantern, king-cake, live-oak, magnolia, mardi-gras-mask, steamboat, streetcar-route, trumpet, wrought-iron-balcony.
2. **UI icons** — inline SVG, 32–52px, `stroke: currentColor`, `stroke-width: 1.5–1.6`, `stroke-linecap: round`, `stroke-linejoin: round`, no fills. Coloured with `color: var(--brass-deep)` or `color: var(--burgundy)`. Never Heroicons, never Lucide — the geometry is custom (circle + hand-ticked hatch). Samples are inline in `PitchDeck_Web/index.html` (Module, Knowledge Bank, Ask sections); the UI kits reuse them.
3. **Brand PNGs** — full-color sepia-toned illustrations (`assets/Fingerprint.png`, `assets/OakTree.png`, `assets/Band.png`, `assets/DramaMasks.png`, `assets/Flower.png`, `assets/Hearts.png`, `assets/MarriedCouple.png`, `assets/12twentylogo.png`). Used full-bleed at reduced opacity for section ornaments — never as literal product iconography.

**Logo.** `assets/StreetcarLogo.png` — engraved streetcar with "STREETCAR" wordmark in display serif, fleur-de-lis divider, tagline "BRINGING STUDENTS TO THEIR DESTINATION" in Cinzel small-caps.

**Emoji.** Never. Unicode dingbats (`◈ ∞ ⚜ ·`) are permitted as typographic ornaments in Cinzel labels when a glyph fits the editorial vocabulary (coat-of-arms lozenges, middle dots).

**Substitutions.** None needed — all icons and illustrations are first-party. If a new icon is required, hand-author SVG to the _style.md rules in `assets/illustrations/` (preserved as reference).

---

## Index — root manifest

| File / folder | Purpose |
|---|---|
| `README.md` | This file — brand, content, visual, iconography guidelines |
| `SKILL.md` | Claude Code skill manifest — invoke-ready design brief |
| `colors_and_type.css` | CSS variables + `@font-face` + semantic element styles |
| `fonts/` | Playfair Display, Cormorant Garamond, Cinzel TTFs |
| `assets/` | Logo, PNG brand art, `illustrations/` SVG engravings |
| `preview/` | Design-system review cards (registered assets) |
| `ui_kits/navigator/` | Navigator Console UI kit (consultant-facing) |
| `ui_kits/student/` | Student-facing portal UI kit |
| `slides/` | Editorial slide templates (Title, BigStat, Comparison, Quote, Modules, Ask) |

---

## Font substitutions

None. All three families (Playfair Display v40, Cormorant Garamond v21, Cinzel v26) are shipped as local TTFs in `fonts/`. On environments without local font loading, the stack falls back to Didot → Bodoni MT → Georgia (display), EB Garamond → Georgia (body), Trajan Pro → Optima → Georgia (labels).

---

## Quick-start

```html
<link rel="stylesheet" href="colors_and_type.css">
<body class="sc-body sc-paper">
  <div class="sc-eyebrow">Chapter One</div>
  <h1 class="sc-h1">The First Job Is a Ten-Year Bet</h1>
  <p class="sc-italic">And most graduates lose it.</p>
  <hr class="sc-rule">
</body>
```
