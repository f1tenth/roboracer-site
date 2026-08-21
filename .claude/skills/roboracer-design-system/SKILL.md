---
name: roboracer-design-system
description: The visual and motion system for the roboracer.ai revamp - final tokens, type, spacing, motion vocabulary, component catalog, and anti-patterns. Load before writing any JSX, CSS, or animation. Status FINAL (approved by Cedric 2026-08-20; Ayagoz may still revise the font pairing, card radius, and gradient budget). The implementation is src/index.css @theme + src/components/ui/*; review every primitive live on /styleguide.
user-invocable: false
---

# RoboRacer design system (FINAL v2 "sharpen", 2026-08-21)

v2 direction (Cedric, after reviewing v1 on localhost: "AI-generated neon game site" - corrected):
- Paper is the DEFAULT surface; ink only for the hero, the car chapter, and the footer.
- Accent as hairline, not fill: max ONE solid magenta CTA per viewport; magenta otherwise only as 1px rules, the 4px index marker, chips, and link underlines. NO gradient text (logo only). Icons are ink-900 strokes.
- Radii: card/button 4px, media 6px, pills unchanged. On ink: type, rules, media - never border+fill panels.
- Structure made visible: optional hairline 12-col guides (Section `guides`), numbered mono eyebrows via SectionHeader `index` ("01 / Next race"), data and captions in mono, asymmetric 5/7 splits, display type lh 0.98 / tracking -0.03em.
- Hero media: native-resolution encodes only (1280 desktop, 8 MB ceiling for that one file; 960 mobile under 3 MB).
- TeamGrid renders every entry; non-published entries carry a mono "unverified" tag (nothing hidden on localhost).

Direction in one line: an engineering publication about racing - paper-first, hairline-ruled, mono-annotated, with cinematic ink reserved for the hero and the car, and magenta rationed to one CTA per viewport.

Normative sources, in order: Cedric > this skill > docs/DESIGN.md (rationale and migration analysis). The tokens live in `src/index.css` `@theme`; the primitives in `src/components/ui/`; `/styleguide` renders all of them with real data in both bases.

## Decisions locked 2026-08-20 (Cedric)
- D1: `rr-magenta #d946ef` is THE interactive accent; `rr-cyan #00d1da` is reserved for the logo and telemetry/data accents. Violet only as the gradient partner.
- D2: the navy blue-900 CTA is retired; buttons are solid magenta-on-ink / ink-on-paper, never gradient.
- D3: ink base for landing, race, about; paper base for research, news, rules. Footer always ink.
- D4: Space Grotesk (display, 600) + Manrope (body 400/600) + JetBrains Mono (telemetry); radius-card 1.25rem; gradient ONLY on display text and the logo. Ayagoz may override any of D4 later.

## Principles
0. One theme, whole site (CLAUDE.md rule 5). A visitor should never feel a page switch.
1. One idea per viewport: each section has a headline, one visual, one action.
2. Motion explains, it does not decorate. If you cannot say what a motion explains, cut it.
3. Real media beats illustration.
4. Data-driven everywhere: cards render from `public/data/*.json` via `src/lib/data.ts`.
5. Performance is a design feature: hero video budgeted, three.js never in the critical path, no layout shift.

## Tokens (implemented in `src/index.css` `@theme` - the single source; never redeclare)
- Accent: `rr-magenta`, `rr-violet`, `rr-cyan`, gradient stops `rr-grad-start #fb00ff` -> `rr-grad-end #6d28d9`.
- Ink surfaces: `ink-950` (page edge), `ink-900` (section), `ink-800` (cards), `ink-700` (borders). Elevation on ink = lighter surface + border, never shadow.
- Paper surfaces: `paper-50` (section), `paper-100` (tint/cards), `paper-200` (borders). Elevation on paper = `shadow-card` / `shadow-card-hover` only.
- Text: `text-strong`/`text-body`/`text-muted` on paper (muted is the AA floor); `text-on-ink`/`text-on-ink-muted` on ink.
- Type scale (fluid clamps): `text-display-xl` (the one h1), `text-display-l` (chapter titles), `text-display-m` (section titles), `text-lead` (max 60ch), `text-body`, `text-small`, `text-eyebrow` (via the `eyebrow` utility), `font-mono` for lap times/specs.
- Rhythm: `py-section`, `py-section-tight`; containers `max-w-content` (72rem), `max-w-wide` (90rem).
- Shape: `rounded-card` 1.25rem, `rounded-media` 0.75rem, `rounded-btn` 0.5rem, `rounded-pill`.
- Motion tokens: `--ease-out-expo`, `--ease-in-out-quart`, durations 180/420/900ms (1.2s per-element cap). GSAP mirrors them in `src/lib/motion.ts` (`EASE_OUT_EXPO`, `EASE_IN_OUT_QUART`, `DURATION`).
- Utilities defined for the system: `eyebrow`, `text-gradient-brand` (display sizes only, at most once per viewport).
- AA accent-text variants (QA 2026-08-21): `rr-magenta-bright #e879f9` for accent text/chips on ink and magenta tints; `rr-magenta-deep #a21caf` for accent text on magenta-tinted paper chips. Plain `rr-magenta` text is AA on ink-950/900 but NOT on `bg-rr-magenta/15` tints or paper - use the variants there.

## Motion vocabulary (GSAP + ScrollTrigger via `src/lib/motion.ts`; every pattern inside `gsap.matchMedia(MOTION_OK_QUERY)`)
| Pattern | Primitive | Spec | reduced-motion fallback |
|---|---|---|---|
| Reveal | `Reveal` | y 24->0, opacity 0->1, 0.6s ease-out-expo, stagger 60ms, once, start "top 80%" | static, visible |
| Pin | `PinnedChapter` | sticky viewport over a 150-250vh wrapper, scrub 0.8, 2-4 crossfaded states | states stacked vertically with captions |
| Scrub | `ExplodedModel` | ScrollTrigger progress -> explosionRef (1 scattered -> 0 assembled) | static assembled render + stacked captions |
| Counter | `StatCounter` | count up once in view, 1.2s; final number always in the markup | final number only |
| Marquee | `Marquee` | CSS keyframes, duplicated aria-hidden track, pause on hover | static wrapped grid, clone hidden |
| Hero video | `VideoHero` | muted autoplay loop playsinline, poster mandatory, committed encodes in `public/media/hero/` | poster image instead of video |
| Micro | `Button` etc. | hover -2px translateY + shadow step, 180ms | color/underline change only |
Rules: animate only transform and opacity; `will-change` only while animating; triggers die with the component (`useGSAP` scope); lenis is opt-in per page via `useLenis()` (desktop pointers, motion-ok only) and NOT mounted globally yet.

## Component catalog (`src/components/ui/`, all reviewed on `/styleguide`)
- `Section` (variant ink|paper, width content|wide|bleed, tight, edge) - owns rhythm and surface.
- `SectionHeader` (eyebrow, title, lead, action, on) - the only sanctioned section top.
- `Button` (primary|secondary|ghost, sm|md|lg, on ink|paper; renders Link for internal hrefs).
- `Reveal`, `Marquee` (label required), `StatCounter` (value, suffix, label, on), `MediaFrame` (src, alt, width, height, aspect, priority).
- `EventCard` (upcoming|past chip, ink|paper), `LogoCloud` (partners, alphabetical, untiered), `TagFilter` (aria-pressed chips + All).
- `PinnedChapter` (states[{caption, body, node}], heightVh), `VideoHero` (headline is the page h1, video sources per the media skill, credit line, scroll cue).
- `HighlightReel` (2-4 muted loops, posters mandatory, staggered 2-col), `TeamGrid` (published only unless showUnverified; initials avatar fallback; country as text), `PublicationCard` (paper only, tagLabels from publications.json), `SponsorCTA` (zero-sponsor state: CTA only, no empty tiers), `NextRaceSpotlight` (D8 dates copy, countdown in mono, register + rules CTAs).
- `ExplodedModel` + `ExplodedModelScene`: the landing 3D chapter. Reuses `RacecarAssemblyParts` from `src/components/RacecarAssembly.tsx` (the ONE shared scene graph - never build a second loader). Scroll drives `explosionRef` 1 -> 0 (implode), assembled car spins slowly; three.js chunk lazy-loads behind an IntersectionObserver (rootMargin 600px); weak devices (`hardwareConcurrency < 4`) and reduced motion get a static layout. `/assembly` stays the full interactive viewer and is linked as "Explore the car".

## Data and 3D facts
- Meshes: `public/models/racecar/` - six GLBs meshopt-compressed (EXT_meshopt_compression + KHR_mesh_quantization, done 2026-08-21, 2.04 MB -> 0.49 MB; STL accent 152 KB). drei `useGLTF` decodes meshopt by default. Re-run `npx @gltf-transform/cli optimize <f> <f> --compress meshopt --simplify false --texture-compress false` after any mesh sync.
- Hero media: committed under `public/media/hero/` (the one 1.5 MB exception, CLAUDE.md rule 3). Produce with `scripts/media.sh video`.
- Part transforms: `src/components/racecarAssemblyData.ts` mirrors `racecar_mesh.xacro` (see roboracer-media skill for the scale formulas).

## Anti-patterns (reject in review)
Emoji as icons; four identical cards after the hero; gradient buttons; centered paragraphs over two lines; text over photos without a scrim; pinned sections shorter than the viewport; carousels without a narrative purpose; Inter/Roboto/Arial; walls of equal-size logos presented as sponsors (partners are untiered by design, sponsors are tiered); placeholder media in shipped pages; a second h1; new tokens invented outside `src/index.css`.

## Open with Ayagoz
Font pairing final call (Space Grotesk kept vs Archivo display); card radius 1.25 vs 0.75rem; gradient budget beyond display text + logo; ink ramp warmth. Any change lands as a token edit in `src/index.css` plus a styleguide review - never as per-component overrides.
