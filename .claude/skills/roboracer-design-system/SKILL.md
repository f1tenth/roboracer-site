---
name: roboracer-design-system
description: The visual and motion system for the roboracer.ai revamp - tokens, type, spacing, motion vocabulary, component catalog, and anti-patterns. Load before writing any JSX, CSS, or animation. Status DRAFT until docs/DESIGN.md is produced by the design-extractor agent and approved by Cedric and Ayagoz; until then treat every token here as a proposal and never invent new ones.
user-invocable: false
---

# RoboRacer design system (DRAFT v0, 2026-08-20)

Direction in one line: the confidence and scroll choreography of neobotics.org, the hierarchy and calm of cedrichollande.com, RoboRacer's purple-to-pink energy, on a dark ink base for the cinematic sections and a light base for reading.

## Principles
0. One theme, whole site. Landing, about, race, research, news, rules share the same tokens, nav, section rhythm, cards, and motion. A visitor should never feel a page switch.
1. One idea per viewport. Sections are chapters; each has a headline, one visual, one action.
2. Motion explains, it does not decorate. A pin, scrub, or reveal must reveal structure (a stack, a sequence, a comparison). If you cannot say what the motion explains, cut it.
3. Real media beats illustration. Race footage, cars, tracks, people, podiums. Line art only as an overlay that resolves into a photo or render.
4. Data-driven everywhere. Cards render from JSON; design the empty and overflow states.
5. Performance is a design feature: first paint under 1.5 s on a mid-range phone, hero video under 3 MB with a poster, no layout shift.

## Tokens (proposed Tailwind v4 `@theme`, paste into `src/index.css`; extractor may adjust values)
```css
@theme {
  /* brand */
  --color-rr-magenta: #d946ef;      /* pink-500 family, the RoboRacer accent */
  --color-rr-violet: #7c3aed;       /* violet-600, gradient partner */
  --color-rr-grad-start: #fb00ff;   /* existing site accent, use only inside gradients */
  --color-rr-grad-end: #6d28d9;
  /* ink base (cinematic sections) */
  --color-ink-950: #07070d;
  --color-ink-900: #0e0f1a;
  --color-ink-800: #171a2b;
  --color-ink-700: #242841;
  /* paper base (reading sections) */
  --color-paper-50: #fbfbfd;
  --color-paper-100: #f3f4f8;
  --color-paper-200: #e6e8f0;
  /* text */
  --color-text-strong: #0b0c14;
  --color-text-body: #3b3f55;
  --color-text-muted: #6b7089;
  --color-text-on-ink: #f5f5fa;
  --color-text-on-ink-muted: #a8acc4;
  /* type */
  --font-display: "Space Grotesk", ui-sans-serif, system-ui, sans-serif;
  --font-sans: "Manrope", ui-sans-serif, system-ui, sans-serif;
  --font-mono: ui-monospace, "JetBrains Mono", monospace;
  --text-display-xl: clamp(2.75rem, 6vw, 5.5rem);
  --text-display-l: clamp(2.25rem, 4.5vw, 4rem);
  --text-display-m: clamp(1.75rem, 3vw, 2.75rem);
  --text-lead: clamp(1.125rem, 1.4vw, 1.375rem);
  /* spacing rhythm */
  --spacing-section: clamp(5rem, 12vw, 10rem);
  --spacing-section-tight: clamp(3rem, 7vw, 6rem);
  --container-content: 72rem;
  --container-wide: 90rem;
  /* shape */
  --radius-card: 1.25rem;
  --radius-pill: 999px;
  /* motion */
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out-quart: cubic-bezier(0.76, 0, 0.24, 1);
  --duration-fast: 180ms;
  --duration-base: 420ms;
  --duration-slow: 900ms;
}
```
Usage rules: gradient text only on display sizes and only with the magenta to violet pair; CTAs are solid magenta on ink or solid ink on paper, never gradient buttons; gray text never below `text-muted` contrast on paper (AA); on ink, body text is `text-on-ink-muted`, headlines `text-on-ink`.

## Type scale
Display XL (hero, one per page), Display L (chapter titles), Display M (section titles), Lead (section intro, max 60ch), Body 1rem/1.6, Small 0.875rem, Eyebrow 0.75rem uppercase tracking 0.14em in `text-muted` or magenta. Space Grotesk 600 for display, Manrope 400/600 for body and UI. Never center more than two lines of body text.

## Layout
- Sections: `padding-block: var(--spacing-section)`; hero and chapters `min-height: 100svh`; content width `--container-content`, media and marquee may break out to `--container-wide` or full bleed.
- Grid: 12 columns desktop, 6 tablet, 4 mobile, 1.5rem gutter. Cards max 3 per row; a 2-up with one large media beats a 4-up grid.
- Nav: transparent over the ink hero, becomes `paper-50/90` + backdrop blur after 40 px scroll; height 68 px mobile, 85 px desktop (existing offsets).

## Motion vocabulary (GSAP + ScrollTrigger, `useGSAP`, all inside `gsap.matchMedia()`)
| Name | What it explains | Spec | Reduced-motion fallback |
|---|---|---|---|
| Reveal | content enters as you arrive | y 24px to 0, opacity 0 to 1, 0.6 s, ease-out-expo, stagger 60 ms, `once: true`, start `top 80%` | static, opacity 1 |
| Pinned chapter | a sequence or a transformation | section pinned for 150 to 250 vh, scrub 0.8, 2 to 4 states (e.g. line art to render, stack of layers) | unpinned, all states laid out vertically with captions |
| Parallax | depth between media and text | media `yPercent -10..10`, scrub true, desktop only | none |
| Scrub video | process or lap shown by scrolling | `currentTime` driven by progress, only for under 8 s clips with keyframes every frame | poster image |
| Counter | scale (universities, countries, publications) | count up once when in view, 1.2 s, ease out | final number rendered |
| Marquee | many peers (partners, sponsors) | CSS `@keyframes` translateX, 40 to 60 s loop, pause on hover, duplicated track | static wrapped grid |
| Hero video | the feeling of racing | `<video muted autoplay loop playsinline preload="metadata" poster>`; mobile gets a lighter or cropped encode | poster image only |
Rules: nothing animates longer than 1.2 s per reveal; never animate `width/height/top/left`, only transform and opacity; `will-change` only while animating; kill ScrollTriggers on unmount (`useGSAP` scope does this); test with `prefers-reduced-motion: reduce` before calling a section done.

## Component catalog (`src/components/ui/`)
`Section` (variant ink | paper, width content | wide | bleed), `SectionHeader` (eyebrow, title, lead, action), `VideoHero`, `NextRaceSpotlight` (title, dates, city, countdown, register CTA, secondary link), `PinnedChapter` (states[], captions), `Reveal`, `Marquee`, `StatCounter`, `EventCard` (upcoming vs past variants), `SponsorTier` (tier name, logos, CTA for empty tier), `TeamGrid` (photo, name, role, link, graceful avatar fallback), `PublicationCard` (title, authors, venue, year, tags, links), `TagFilter` (chips, keyboard accessible), `Button` (primary, secondary, ghost, sizes), `LogoCloud`, `MediaFrame` (aspect, poster, lazy), `Footer`.

## Anti-patterns (reject in review)
Emoji as icons; four identical cards as the first thing after the hero; gradient buttons; centered paragraphs longer than two lines; text over busy photos without a scrim; animations that block reading; pinned sections shorter than the viewport; carousels for anything that is not a gallery; Inter/Roboto/Arial; stock-photo energy; "Welcome to our website"; walls of logos at equal size regardless of tier; placeholder images in shipped pages.

## Neobotics patterns worth replicating (patterns, not assets)
Hero video with a scroll cue; events row right under the hero; pinned chapters where a line-art car resolves into a render; capability list with a single accent and a "learn more" per row; "Backed by" logo strip; project cards with a status chip and date; tight footer with mission, docs, and a single primary CTA. Our version swaps kit marketing for: next race first, then platform, then community scale, then research, then build/learn.

## 3D car chapter: ExplodedModel (landing, "what is RoboRacer")
- Intent: as you scroll, the car's parts fly inward from scattered positions and assemble into the complete vehicle (implode, not explode), with captions naming the subsystems (LiDAR, compute, VESC/motor, chassis, battery). Pinned chapter, 200 to 250 vh, scrub 0.8. Three states: scattered, converging with labels, assembled and slowly rotating.
- Tech: React Three Fiber + drei (`useGLTF`, `Environment`, `ContactShadows`), GSAP ScrollTrigger drives a `progress` value; each part has a precomputed offset vector (from its bounding-box center relative to the model center, scaled 2 to 4x) and position = assembled + offset * (1 - eased(progress)). Materials: one matte dark body, magenta accent on one part (LiDAR), studio-style environment, no bloom. Lazy-load the chunk (React.lazy) so it never blocks first paint; the hero must not wait for three.js.
- Model and scene already exist: reuse `src/components/RacecarAssembly.tsx` and the part table in `src/components/racecarAssemblyData.ts` (seven parts with explosion vectors, meshes in `public/models/racecar/`). Do not build a second loader. Refactor the scene so the explosion amount is a prop (0 to 1) driven by ScrollTrigger for the landing chapter and by the slider on `/assembly`; implode = explosion 1 -> 0 as the section scrolls. Keep `/assembly` as the full interactive viewer and link to it from the chapter ("Explore the car"). Check mesh sizes with `scripts/media.sh report public/models`; anything over 1.5 MB gets Draco-compressed (`npx gltf-transform optimize`) or hosted on Cloudflare.
- Reduced motion: assembled model rendered once as a static canvas (or a poster image) with the captions listed below it. Mobile: lower-res GLB or poster if GPU is weak (`navigator.hardwareConcurrency < 4` heuristic).
- New primitives: `ExplodedModel`, `TeamCard` and `TeamGrid` (logo, name, institution, country flag as text not emoji, best result chip, link), `HighlightReel` (2 to 4 short muted loops in a staggered masonry with captions, posters required).
