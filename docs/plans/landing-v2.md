# Landing v2 plan (2026-08-21)

Director session. Branch `revamp/landing-v2` off `revamp/integration`; one
page-builder task at a time; director verifies each on the dev server with
screenshots before dispatching the next. Cedric's session rules override
DESIGN.md and the design-system skill where they conflict. Companion evidence:
`docs/design/NEOBOTICS_STRUCTURE.md`.

## Accent decision (director, this session)

**`rr-violet #7C3AED` is THE button purple.** Rationale: both prior verdicts
("AI neon game site", "still not it") indict the neon magenta family; neobotics
demonstrates a deep saturated accent used sparingly reads professional.
rr-violet is the deep, non-neon option. Applies everywhere a solid CTA exists
(both bases). Consequences, sitewide on this page:

- `Button` primary = solid rr-violet fill, white text, no glow, no radial
  shadow, no gradient border, both on ink and paper. Secondary/ghost stay
  ink-outline / underline styles.
- Focus rings move to rr-violet.
- **Text is never purple.** Links = ink text + ink underline; hover may switch
  the underline (only the underline) to rr-violet.
- Strong purple and cyan appear NOWHERE else: magenta/violet hairlines, 4px
  index markers, magenta eyebrows, magenta chips, magenta stat accents all
  become ink/grey. Gradient stays logo-only. (This tightens sharpen v2, which
  still allowed magenta rules/chips/underlines.)

## Section order (final)

1 hero video · 2 headline · 3 highlights · 4 next race · 5 the car ·
6 platform · 7 scale numbers (data line, no title) · 8 partners · 9 teams ·
10 research · 11 get started · footer. **Sponsors section removed** — usage
commented out, `SponsorCTA` component file kept.

## Section-by-section spec

### 1. Hero — video and nothing else
- 100svh, cover-fit, existing encodes untouched (no video work this session).
- Remove from the hero: headline, sub, CTAs, credit line, "pause footage"
  text, any caption. The page h1 moves to section 2.
- Keep a WCAG 2.2.2 pause control as a small mono icon button, visible only
  on hover or keyboard focus (`opacity-0` → visible on `:hover`/`:focus-visible`;
  always focusable, `aria-label`). Reduced motion: poster, no control needed.
- Scroll cue: appears only after **10 s without scrolling** (timer resets
  nothing; one-shot), small mono + arrow, fades out permanently on first
  scroll. No pill background.
- Nav behavior unchanged.

### 2. Headline — the one loud moment
- Text: "Autonomous racing, built and raced in the open" — this is the h1.
- Size ~9vw desktop (clamp roughly 3rem → 10rem), Space Grotesk 600,
  lh 0.98, tracking -0.03em, ink text on paper. Max 3 lines on mobile
  (390px): break as "Autonomous racing," / "built and raced" / "in the open".
- Motion: pinned wrapper ~180vh, scrub 0.8; words (or lines) enter
  sequentially — y 60→0 + opacity 0→1 per word, stagger tied to scroll
  progress, fully assembled by ~70% of the pin, held to the end. Deliberate
  and strong; ease-in-out-quart. No color tricks, no gradient, no purple.
- Reduced motion / no-JS: static headline at full size, no pin.

### 3. Highlights — two-row counter-scrolling media strip
- New `HighlightStrip` ui component (replaces the current `HighlightReel`
  usage on landing; delete the old usage; if `HighlightReel` becomes dead
  code, remove it — rule 10).
- Two full-bleed rows, translateX keyframes like the partner marquee, row 1
  leftward, row 2 rightward, ~40–60s loops, duplicated aria-hidden track,
  pause on hover (and on focus-within). Tiles: mixed aspect (16:9 and 3:2),
  fixed row height (~clamp(160px, 22vh, 260px)), 6px media radius.
- Data: `public/data/highlights.json` — `{id, type: "image"|"video",
  src, poster, caption, credit, aspect, status: "placeholder"|"live"}`.
  Seed ~12 placeholder entries with real captions from roboracer-content
  facts only (ICRA 2026 Vienna crowd, IV 2026 Detroit podium, UPenn
  Thunderbolt car, etc.). Placeholder render: neutral grey frame
  (paper-200/ink-800 depending on base), mono caption, no fake imagery.
  Cedric drops real media into `_harvest/highlights/` later.
- Reduced motion: static two-row grid, first N tiles, no translation.

### 4. Next race — keep the ledger
- Current 7/5 ledger layout moves up unchanged except: order position (now
  after highlights), accent purge (no magenta marker/chips → ink), CTA
  becomes the solid rr-violet button (this is the viewport's one CTA).

### 5. The car — outward explosion, studio render
- Direction reversal: **assembled at rest; parts fly OUTWARD as you scroll;
  then reassemble (out-and-back over the pin) or hold exploded — implement
  out-and-back: explode 0→1 over first 60% of pin, hold, reassemble in the
  last 25%.**
- Pin/scrub starts only when the section is FULLY in view: ScrollTrigger
  `start: "bottom bottom"` on the pin wrapper (bottom of section hits bottom
  of viewport), not "top top" of entry.
- Re-light + re-material (shared scene, applies to `ExplodedModelScene` and
  `/assembly` — one scene graph, `RacecarAssemblyParts`):
  - Materials: satin graphite body, brushed aluminum standoffs/mounts,
    rubber tires, LiDAR in real sensor colors (e.g. Hokuyo blue-black/
    orange window). No purple, no cyan, no emissive neon.
  - drei `Environment` preset "studio"; soft contact shadow under the car;
    no fog; neutral key light; hover highlight = subtle brightness lift
    (emissive/color multiplier), not a color change.
- Layout: 3D view + a reserved slot for a real photo of the car beside or
  behind it (`MediaFrame` with an honest grey placeholder + mono caption
  "photo: pending" until Cedric supplies `_harvest/car/…`).
- `/assembly` re-theme in the same task: light grey/white background (CAD
  product-configurator look), neutral or no grid, minimal mono side panel,
  no neon anywhere; all existing viewer features stay.
- Reduced motion / weak devices: static assembled render + photo slot.

### 6. Platform — what RoboRacer is
- Current pillars content restructured as the platform section (car, sim,
  courses, races, research entry points); paper base, 5/7 or 7/5 split,
  hairlines, ink icons; no card wall as first impression; copy from
  roboracer-content only. One ghost/secondary action max.

### 7. Scale numbers — a data line, not a section
- No section title, no eyebrow. One horizontal mono data line (the
  StatCounters with thin dividers) sitting directly above partners, framed
  as the lead-in: counters + a short clause tying them to the partner wall
  below (e.g. "across the institutions below" — exact copy from
  roboracer-content facts).
- Counters: start only when the line is FULLY in view
  (`start: "bottom bottom"` equivalent / IntersectionObserver threshold 1),
  duration 1.5x slower than current (1.2s → 1.8s). Final number always in
  markup.

### 8. Partners — unchanged marquee, reframed
- Marquee/logo wall stays; heading demoted to a small mono label so the data
  line above acts as the section's voice. No accent.

### 9. Teams — all ten, square slots
- Every team renders a square image slot: neutral grey (paper-200), team
  initials in mono, until real logos arrive. Keep all 10 visible with the
  mono "unverified" tag. No purple.

### 10. Research — teaser (position move + accent purge only)

### 11. Get started — entry points + Slack CTA
- At most one solid rr-violet CTA in the viewport; the rest ghost/outline.

### Removed: sponsors
- Comment out the `SponsorCTA` usage in Landing.tsx with a dated note;
  component file stays.

## Task sequence (one page-builder dispatch each)

- T1 foundation: accent switch (Button/focus/links per decision above),
  purple/cyan purge outside logo, hero stripped to video-only + hover pause
  + 10s scroll cue. Includes updating /styleguide affected primitives.
- T2 headline section (pinned scrub h1) + section reorder skeleton
  (order 1-11, sponsors commented out) so later tasks land in place.
- T3 highlights strip + highlights.json.
- T4 next race reposition + ledger accent pass.
- T5 car chapter (outward explosion, studio look, photo slot) + /assembly
  re-theme. Largest task; its own dispatch, nothing else in it.
- T6 platform + scale data line + partners reframe.
- T7 teams square slots + research + get started passes.
- T8 sweep: reduced motion audit, a11y, lint, build, console, then
  /impeccable critique + @qa-reviewer; director judges against
  NEOBOTICS_STRUCTURE.md + Cedric's rules; fix loop; merge to
  revamp/integration; push.

Verification after every task (director): dev server screenshots at 1440 /
768 / 390, judged against this spec before the next dispatch.

## Out of scope this session
Video encodes/budgets; footer rebuild (Phase 3.5); any new media files.

## Media needed from Cedric (final list goes in the closing report)
Car studio photo; ICRA 2026 Vienna group photo; IV 2026 Detroit podium
photos; highlight clips/photos → `_harvest/highlights/`.
