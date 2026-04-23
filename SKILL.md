---
name: streetcar-design
description: Use this skill to generate well-branded interfaces and assets for StreetCar — the AI-powered career navigation platform for Tulane University. Contains the heritage New Orleans palette, typography system (Playfair Display / Cormorant Garamond / Cinzel), brand illustrations, logos, voice guidelines, and UI kit components for the Navigator Console and Student Portal. Use for production code OR throwaway prototypes, mockups, and decks.
user-invocable: true
---

Read the `README.md` file within this skill, and explore the other available files — `colors_and_type.css` (tokens + `@font-face`), `fonts/`, `assets/` (logos, PNG brand art, SVG engravings), `ui_kits/`, and `slides/`.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc.), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules in `README.md` to become an expert in designing with this brand.

Non-negotiables when designing for StreetCar:
- **Three serifs, never sans.** Playfair Display (display), Cormorant Garamond italic (voice/body), Cinzel small-caps (labels).
- **No rounded corners**, **no drop shadows**, **no emoji**, **no exclamation points**.
- **Cream paper backgrounds** with radial gradient + SVG grain overlay. Never solid white.
- **Thin 1px brass hairlines** for every border and rule.
- **Burgundy is the only editorial accent.** Mardi Gras purple/green/gold appear only on illustrations, one at a time.
- **Italic subtitles** in burgundy. Eyebrows in Cinzel small-caps with 0.3–0.5em letter-spacing.
- **Easing is always** `cubic-bezier(0.16, 1, 0.3, 1)`. Rise-fade entrances, no bounces.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.
