# Landing v2 plan (2026-08-21, rev 2 — parallel execution)

Director session. Base: `revamp/integration` (docs fast-forwarded onto it).
Three page-builder agents in parallel worktrees — A `revamp/v2-hero`,
B `revamp/v2-car`, C `revamp/v2-page` — each owning disjoint files; the
director reviews each on its dev server, then merges A and B into C, wires
Landing.tsx, QAs, and merges to `revamp/integration`. Cedric's session rules
override DESIGN.md and the design-system skill where they conflict. Companion
evidence: `docs/design/NEOBOTICS_STRUCTURE.md` (re-validated 2026-08-21).

## Accent decision (director; standing)

**`rr-violet #7c3aed` is THE purple.** Rationale: both verdicts ("AI neon game
site", "still not professional") indict the neon magenta family — rr-magenta
#d946ef IS Tailwind fuchsia-500, the detector's canonical AI palette hit — and
white-on-magenta fails AA (≈2.7:1) while white-on-rr-violet passes (≈5.7:1).
Consequences, everywhere on this page:

- `Button` primary = solid rr-violet fill, white text, hover darkens to
  `rr-violet-deep #6d28d9` (new token). No glow, no radial shadow, no gradient
  border, identical on ink and paper. Secondary = hairline outline (ink-950/20
  on paper, on-ink/25 on ink), text ink/white. Ghost = underlined text link.
- Global `:focus-visible` outline → rr-violet (3.5:1 on ink-950, 5.5:1 on
  paper-50 — passes non-text 3:1 on both). Components over video/imagery may
  keep a white ring.
- **Text is never purple.** Link contract (exact classes, used identically by
  all agents):
  - on paper: `underline underline-offset-4 decoration-ink-950/25
    hover:decoration-rr-violet hover:decoration-2` on `text-text-strong`
  - on ink: `underline underline-offset-4 decoration-text-on-ink/30
    hover:decoration-rr-violet hover:decoration-2` on `text-text-on-ink`
- Strong purple and cyan appear NOWHERE else except the logo. Every
  `bg-rr-magenta` marker dot, `decoration-rr-magenta`, `text-rr-magenta-*`,
  and the legacy cyan nav hover/underline (`.nav-link`, `.nav-cta` in
  index.css) becomes ink/neutral. Gradient stays logo-only. Magenta tokens
  stay defined in `@theme` (logo + later pages) but unused on this page.
- Scope: landing + shared chrome + /assembly + styleguide demos. EventCard/
  TagFilter (not rendered on landing) are deferred to their pages' passes.

## Section order (final)

1 hero video · 2 headline · 3 highlights · 4 next race · 5 the car ·
6 platform · 7 scale numbers (data line, no title) · 8 partners · 9 teams ·
10 research · 11 get started · footer. **Sponsors removed** — usage commented
out with a dated note; `SponsorCTA.tsx` stays.

## Section-by-section spec

### 1. Hero — video and nothing else (A)
- 100svh (minus nothing: keep `pt-[68px] md:pt-[85px]` page offset — video
  starts below the solid nav, as neobotics does), cover-fit, existing encodes
  untouched (no video work this session).
- Remove: headline, lead, CTAs, credit line, visible "pause footage" text,
  captions, the bottom scrim gradient (keep at most a faint bottom 15%
  darkening if the cue needs it). The page h1 moves to section 2.
- Pause control (WCAG 2.2.2): small mono icon button (pause/play glyph as
  inline SVG stroke, not emoji), bottom-right, `opacity-0` →
  `opacity-100` on `:hover` over the hero or on `:focus-visible`; always in
  the tab order; `aria-label="Pause footage"` / `"Play footage"`;
  `aria-pressed`; white focus ring. Reduced motion: poster only, no control.
- Scroll cue: appears only after **10 s without any scroll** (one-shot timer
  started on mount, cancelled by the first scroll), fades in 420ms; the first
  scroll after it appears fades it out permanently. Small mono "scroll" +
  down-arrow SVG, no pill background, reuses `.rr-scroll-cue` bounce.
  `aria-hidden`, non-interactive.
- Props after rewrite: `{ video: HeroVideoSources, className? }`. No h1 in
  the hero: the section gets `aria-label="Race footage"`.

### 2. Headline — the one loud moment (A: primitive; C: placement)
- New primitive `src/components/ui/HeadlineReveal.tsx`. Renders the page h1:
  "Autonomous racing, built and raced in the open" (exact copy, content-skill
  voice; no period).
- Type: Space Grotesk 600, `clamp(2.6rem, 9vw, 9.5rem)`, lh 0.98, tracking
  -0.03em, ink text on paper-50. Three authored lines at every viewport:
  "Autonomous racing," / "built and raced" / "in the open" (spans with
  `block`). Must not overflow at 390 or wrap differently at 1440.
- Motion (GSAP + ScrollTrigger inside `gsap.matchMedia(MOTION_OK_QUERY)`):
  pinned wrapper ~180vh, scrub 0.8. Per-word reveal driven by scroll
  progress: each word y 80→0, opacity 0→1, stagger spread across the first
  ~65% of the pin, `ease-in-out-quart` feel; fully assembled by 70%; held to
  the end. Optionally a subtle whole-block scale 0.985→1 across the pin.
  Deliberate and strong; no color tricks, no gradient, no purple.
- Reduced motion / no-JS: static headline at full size, no pin, no transform.
- API: `{ as?: "h1" | "h2", lines: string[], className? }` — Landing uses
  `as="h1"` (default) with the exact three lines; styleguide demos `as="h2"`.

### 3. Highlights — two-row counter-scrolling media strip (A)
- `HighlightReel.tsx` is REBUILT in place (name kept) as the two-row strip;
  the old staggered 2-col layout goes away.
- Two full-bleed rows, CSS-keyframe translateX like the partner marquee
  (reuse `.rr-marquee` / `rr-marquee` keyframes with a direction-reverse
  variant — component-level `<style>` or inline `animation-direction:
  reverse` on row 2; do NOT edit index.css), row 1 leftward, row 2 rightward,
  50–60s loops, duplicated `aria-hidden` track, pause on hover AND
  focus-within. Row height `clamp(160px, 22vh, 260px)`; tiles keep native
  aspect (16:9 and 3:2 mixed), 6px media radius, hairline border.
- Data: `public/data/highlights.json`:
  `{ id, type: "image" | "video", src, poster, caption, credit, aspect:
  "16/9" | "3/2", status: "placeholder" | "live" }`.
  Loader `loadHighlights()` + `Highlight` type added to `src/lib/data.ts`.
- Seed 12 entries, facts only (content skill / past_races.json titles):
  1 `live` (the IV 2026 Detroit track-level lap, reusing
  `/media/hero/hero-fpv-loop-960.mp4` + poster — cache hit, not a second
  download) and 11 `placeholder`: IV 2026 podium (Thunderbolt · UPenn, 1st;
  404 Racers, 2nd; West Virginia University, 3rd), ICRA 2026 Vienna group
  photo + race action (biggest event to date), and past-race captions taken
  verbatim from `past_races.json` venues/years. Credits "RoboRacer
  organizers" only where true; placeholders carry `credit: ""`.
- Placeholder tile render: neutral frame (`bg-paper-100` +
  `border-ink-950/10`), mono caption inside, no fake imagery, no icon soup.
  `live` tiles render the media with mono caption below. Real files land in
  `_harvest/highlights/` later and get wired by swapping `src`/`status`.
- Reduced motion: no translation — static wrapped grid of the first 6 tiles.
- Section wrapper on the page: full-bleed, small mono label ("02 /
  Highlights" style stays via SectionHeader index), one-line lead max.

### 4. Next race — the ledger moves up (C)
- Current 7/5 `NextRaceSpotlight` ledger unchanged except position (directly
  after highlights) and inherited restyles (violet primary Button, ink
  SectionHeader marker). Its "Register your team" is the viewport's ONE
  solid CTA.

### 5. The car — outward explosion, studio render (B)
- **Direction reversal: assembled at rest; parts fly OUTWARD on scroll; then
  HOLD exploded to the end of the pin.** Mapping: explosion 0→ceiling over
  the first ~65% of the pin, hold at ceiling for the rest. No reassembly.
  Ceiling stays 0.5; B may raise to at most 0.65 if the 1440 screenshot
  shows weak separation. Slow spin at rest, spin eases out as explosion
  rises (spin ∝ 1 − explosion/ceiling — inverse of current).
- Pin/scrub starts only when the section is FULLY in view: sticky wrapper
  with `start: "top top"` on the wrapper (== section bottom at viewport
  bottom for the 100svh sticky child). Nothing moves while the section is
  entering. Wrapper ~140vh (explode needs less road than the old implode).
- Re-light + re-material as a product render (shared scene graph
  `RacecarAssemblyParts` — one change serves the chapter and /assembly):
  - Materials override per part id (racecarAssemblyData): satin graphite
    body/chassis (dark neutral, metalness ~0.4, roughness ~0.5), brushed
    aluminum standoffs/mounts, rubber tires (near-black, roughness ~0.9),
    LiDAR in its real sensor colors (blue-black body, orange window ring —
    Hokuyo-style). STL accent part loses `#7151ff` → neutral graphite.
    No purple, no cyan, no emissive neon anywhere.
  - Lighting: drei `Environment` studio-style IBL. Prefer a locally bundled
    neutral studio HDR under `public/media/env/` if a good one fits well
    under 1.5 MB (rule 3); otherwise the `preset="studio"` CDN fetch inside
    `<Suspense>` with a neutral directional fallback light so the scene
    never renders black offline. Soft `ContactShadows` under the car. NO
    fog, NO `#7057ff` spotlights, no colored rim lights.
  - Hover/selected highlight = subtle brightness lift (small white emissive
    or 1.08 color multiplier), never a hue shift.
- Photo crossfade slots (Cedric is producing a Neoracer-style studio photo —
  dark studio, three-quarter rear). Reserved paths, design to them now:
  - `public/media/hero/car-studio.webp` — full studio shot.
  - `public/media/hero/car-studio-cutout.webp` — transparent cutout.
  In the chapter: the studio photo sits as a layer over/beside the canvas at
  rest and crossfades OUT over the first ~15% of the pin as the 3D takes
  over (photo opacity 1→0), so the real car hands off to the exploding
  model. If the file 404s (it will until Cedric ships it): `onError` hides
  the layer and the chapter runs 3D-only — never a broken-image icon, never
  a fake render. Reduced-motion static layout prefers the photo when
  present, else the static assembled 3D frame.
- Chapter chrome (B owns ExplodedModel.tsx): magenta marker dot → ink/on-ink
  neutral; "Explore the car" link → the ink link contract; captions rewritten
  for the outward narrative (assembled car → what's inside → build it
  yourself), facts from racecarAssemblyData/content skill only,
  `TODO(content)` note kept for final copy.
- `/assembly` re-theme in the same task: light grey/white background
  (paper-100 family — a CAD product-configurator look), light neutral grid,
  minimal mono side panel (light panel, ink text, hairline borders), part
  label dots re-mapped from neon to neutral/real part colors
  (racecarAssemblyData `color`), no neon anywhere, cyan var retired. ALL
  current features stay: explosion slider, part visibility, labels,
  wireframe, auto-rotate, reset, selection, export/URL state if present.
- Reduced motion / weak devices: static assembled render (or studio photo) +
  stacked captions, exactly as today's fallback structure.

### 6. Platform — what RoboRacer is (C)
- Keep the current hairline-row pillars (Build/Learn/Race/Research) and 5/7
  split; links move to the ink link contract; copy unchanged
  (content-skill voice). No card wall, no icons needed.

### 7. Scale numbers — a data line, not a section (C)
- No section title, no eyebrow, no marker. One horizontal mono data line:
  the four StatCounters with thin dividers (`border-y` strip stays) plus a
  short mono clause tying them to the partner wall below:
  "across the partner institutions below" (this frames section 8; counts
  stay 90+/20+/1,000+/30 per content skill).
- Placement: directly above partners, `tight`, reduced bottom padding so the
  line and the marquee read as one unit.
- StatCounter changes: trigger fires only when the strip is FULLY in view
  (`start: "bottom bottom"`, once) and duration 1.8s (1.5× slower than the
  current 1.2s). Final number stays in the markup from first render.

### 8. Partners — unchanged marquee, reframed (C)
- Marquee stays; the SectionHeader is demoted to a small mono label (no
  display title, no lead — the data line above is the section's voice).

### 9. Teams — all ten, square slots (C)
- TeamGrid cells gain a square neutral image slot on top: `aspect-square`,
  `bg-paper-200`, mono team initials centered, real logo `object-contain`
  when present. All 10 render; mono "unverified" tag stays; the result line
  (`text-rr-magenta-deep`) → `text-text-muted`; "Team site" link → link
  contract.

### 10. Research — teaser (C)
- Position + link/Button inheritance only. Secondary "See the Scholar
  query", ghost "All curated publications". No purple text.

### 11. Get started — entry points + Slack CTA (C)
- Rows keep the hairline list; links → contract. "Join the community on
  Slack" is the viewport's one solid (violet) CTA; mailto link → contract.

### Removed: sponsors (C)
- `{/* SponsorCTA removed from landing 2026-08-21 (Cedric): zero-sponsor
  state lives on /about and /race for now */}` — component file stays.

## Execution: three parallel worktrees off `revamp/integration`

| | branch | worktree | dev port | owns (nobody else touches) |
|---|---|---|---|---|
| A | `revamp/v2-hero` | `../roboracer-site-wt/v2-hero` | 5174 | `src/components/ui/VideoHero.tsx`, `src/components/ui/HeadlineReveal.tsx` (new), `src/components/ui/HighlightReel.tsx`, `src/lib/data.ts`, `public/data/highlights.json` (new), `src/pages/Styleguide.tsx` |
| B | `revamp/v2-car` | `../roboracer-site-wt/v2-car` | 5175 | `src/components/RacecarAssembly.tsx`, `src/components/racecarAssemblyData.ts`, `src/components/ui/ExplodedModel.tsx`, `src/components/ui/ExplodedModelScene.tsx`, `src/pages/Assembly.tsx`, `src/pages/assembly.css` |
| C | `revamp/v2-page` | `../roboracer-site-wt/v2-page` | 5176 | `src/pages/Landing.tsx`, `src/components/ui/Button.tsx`, `src/components/ui/Section.tsx`, `src/components/ui/SectionHeader.tsx`, `src/components/ui/StatCounter.tsx`, `src/components/ui/TeamGrid.tsx`, `src/components/ui/PinnedChapter.tsx` (marker only), `src/index.css` |

Rules that make the merge clean:
- Nobody edits a file outside their column. A is the ONLY agent touching
  Styleguide.tsx (its API changes break the current demos; it also adds the
  HeadlineReveal demo and a `sr-only` h1 since VideoHero loses the h1). C's
  primitive restyles are internal — no API changes, styleguide picks them up.
- C's Landing.tsx uses LOCAL STUBS for A's and B's components (plain
  sections, correct order, ids, `TODO(wire)` mono labels) and imports
  nothing from A/B files; the director replaces stubs at integration.
- The link contract and exact class strings above are copied literally so
  the three branches agree without a shared new utility.
- Each agent: `npm ci`, `npm run dev -- --port <port> --strictPort`,
  screenshots at 1440 and 390 (webapp-testing skill), `npm run lint` and
  `npm run build` green before reporting done. Commits stay on the agent's
  own branch inside its worktree (`git branch --show-current` before every
  commit; never push).

## Integration (director)

1. Review each branch on its dev server, screenshots 1440/390, against this
   spec + NEOBOTICS_STRUCTURE.md. Send back misses.
2. Merge A then B into `revamp/v2-page`; wire real components into
   Landing.tsx (replace stubs; hero video-only; HeadlineReveal as h1;
   HighlightReel from `loadHighlights()`; ExplodedModel chapter); fix the
   styleguide ExplodedModel spec-chip label (stale "ceiling 0.5" text) if B
   changed behavior.
3. In parallel: `/qa-page landing`, `@qa-reviewer`, `/impeccable` critique.
   Director judges first; fix; re-run until all three pass.
4. Merge `revamp/v2-page` → `revamp/integration`, push. Report: localhost
   URL, scroll order, exact media needed from Cedric (filenames + sizes).

## Out of scope this session
Video encodes/budgets; footer rebuild (Phase 3.5); nav redesign (only the
cyan hover purge); EventCard/TagFilter accent pass (their pages' sessions);
new media files.

## Media needed from Cedric (final list goes in the closing report)
- `public/media/hero/car-studio.webp` (~1920×1280, WebP q80, ≤ 350 KB) and
  `car-studio-cutout.webp` (transparent, ≤ 300 KB) — dark-studio
  three-quarter rear of the car.
- `_harvest/highlights/`: ICRA 2026 Vienna group photo + race action, IV
  2026 Detroit podium photos, any 2026 race stills/clips (each image ≤ 400
  KB WebP 1600w; clips ≤ 8 s, ≤ 2.5 MB, poster each).
