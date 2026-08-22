---
version: alpha
name: RoboRacer
description: Design language for roboracer.ai, the open-source autonomous racing platform (formerly F1TENTH). Proposed system for the scroll-driven revamp, migrated from the current light single-palette site.
colors:
  primary: "{colors.rr-magenta}"
  rr-magenta: "#D946EF"
  rr-violet: "#7C3AED"
  rr-cyan: "#00D1DA"
  rr-grad-start: "#FB00FF"
  rr-grad-end: "#6D28D9"
  ink-950: "#07070D"
  ink-900: "#0E0F1A"
  ink-800: "#171A2B"
  ink-700: "#242841"
  paper-50: "#FBFBFD"
  paper-100: "#F3F4F8"
  paper-200: "#E6E8F0"
  text-strong: "#0B0C14"
  text-body: "#3B3F55"
  text-muted: "#6B7089"
  text-on-ink: "#F5F5FA"
  text-on-ink-muted: "#A8ACC4"
typography:
  display-xl:
    fontFamily: Space Grotesk
    fontSize: 5.5rem
    lineHeight: 1.02
    fontWeight: 600
    letterSpacing: -0.02em
  display-l:
    fontFamily: Space Grotesk
    fontSize: 4rem
    lineHeight: 1.05
    fontWeight: 600
    letterSpacing: -0.015em
  display-m:
    fontFamily: Space Grotesk
    fontSize: 2.75rem
    lineHeight: 1.1
    fontWeight: 600
  lead:
    fontFamily: Manrope
    fontSize: 1.375rem
    lineHeight: 1.55
    fontWeight: 400
  body:
    fontFamily: Manrope
    fontSize: 1rem
    lineHeight: 1.6
    fontWeight: 400
  small:
    fontFamily: Manrope
    fontSize: 0.875rem
    lineHeight: 1.5
    fontWeight: 400
  eyebrow:
    fontFamily: Space Grotesk
    fontSize: 0.75rem
    lineHeight: 1.2
    fontWeight: 500
    letterSpacing: 0.14em
  mono:
    fontFamily: JetBrains Mono
    fontSize: 0.875rem
    lineHeight: 1.5
    fontWeight: 400
rounded:
  card: 0.25rem
  media: 0.375rem
  button: 0.25rem
  pill: 999px
spacing:
  section: 10rem
  section-tight: 6rem
  gutter: 1.5rem
---

## Direction v2 - sharpen (Cedric, 2026-08-21, normative; overrides conflicting text below)

Verdict on v1: neon-on-dark accent fills read as an AI-generated game site. The correction:

- **Paper is the default surface.** Ink is reserved for the hero, the car chapter, and the footer. Stats, pillars, research, sponsors, teams, get-started live on paper-50/paper-100 with hairline rules (1px ink-950/10).
- **Accent as hairline, not fill.** At most ONE solid magenta CTA per viewport. Magenta otherwise appears only as 1px rules, a 4px index marker, chips, and link underlines. No gradient text anywhere - the gradient belongs to the logo alone. Icons are ink-900 strokes, never magenta fills.
- **Sharp shapes.** Cards and panels 4px, media 6px, pills unchanged. On ink, no border+fill panels: type, rules, and media only.
- **Visible structure.** 12-column grid with optional hairline column guides on wide sections; numbered mono section eyebrows ("01 / Next race"); captions and data in mono (lap times, counts, dates); asymmetric 5/7 splits over symmetric grids; display type at line-height 0.98 / tracking -0.03em against small mono captions.
- **Feel references** (patterns only): neobotics.org (cinematic sections), mclaren.com/racing and formula-e.com (accent discipline, photography-first), linear.app (hairlines, density), ForzaETH (engineering seriousness).
- **Photography-first evidence**: real people, podiums, halls, hardware; honest empty slots where photos are pending - never fake media.

## Overview

RoboRacer (roboracer.ai) is the public home of an open-source 1/10-scale autonomous racing platform: the car, the courses, the international race series, and the research community around them. The revamp direction is a single coherent, scroll-driven system: cinematic dark "ink" sections for the hero, race chapters, and 3D car story; calm light "paper" sections for long-form reading (research, news, rules); RoboRacer's existing magenta-to-violet gradient energy as the one brand accent. Pattern references are neobotics.org (full-bleed hero with scroll cue, events row near the top, pinned chapters, status-chipped project cards, restrained accent discipline) and cedrichollande.com (light editorial hierarchy, generous whitespace, steady card rhythm). Patterns only; no third-party assets or copy.

This document is the normative proposal (Phase 1 discovery output). Tokens ship via `docs/design/tokens.proposed.css` into `src/index.css` `@theme` after Cedric and Ayagoz approve.

## Current state (evidence, 2026-08-20)

What the shipped site actually does, so the proposal reads as a migration:

- **Palette in use.** White base everywhere (`--background: white`), gray-900/600 text, footer on `gray-900`. Brand gradient lives in the logo SVGs: magenta `#FC00FF` to cyan `#00D1DA` (`public/logos/logo-white-gradient.svg`). The same pair drives `.border-animated` (2px animated gradient border, 12px radius) and `.purple-radial-gradient` (`#fb00ff85` radial). Nav hover/active underline is cyan `#00D1DA`. Primary CTA is Tailwind `blue-900` (`#1E3A8A`) with white text — a third accent unrelated to the brand gradient.
- **Type in use.** Google Fonts: Space Grotesk 300–700 (h1–h3, `.space-font`) and Manrope 200–800 (h4+, body, links, inputs). Element-level sizes in `src/index.css`: h1 2.5rem/600, h2 1.75rem/**200**, h3 1.5rem/500, all line-height 110%. Landing overrides these with Tailwind utilities (`text-4xl..text-6xl font-bold`), so the global scale and the page scale disagree today.
- **Spacing and layout habits.** Sections `py-16`/`py-20`; containers `max-w-4xl/6xl/7xl`; `.responsive-padding` steps `px-4 → px-32`. Nav is fixed white, 68px mobile / 85px desktop (pages hard-code `pt-[68px] md:pt-[85px]`).
- **Radius and shadow habits.** `rounded-lg` (8px) on cards and CTAs, 6px on the nav CTA, 12px on the animated border. Shadows: nav `0 2px 8px rgba(0,0,0,.08)` → `0 4px 12px .12` on scroll; cards `shadow-sm` → `shadow-md` on hover.
- **Motion in use.** Framer Motion mobile-menu fade/slide (200ms); CSS underline grow 300ms; `rotateBorder` 6s gradient loop; embla carousel; hover `translateY(-1px)` on the CTA. No scroll choreography yet; GSAP/ScrollTrigger/lenis are installed but unused.
- **What already works.** The gradient-on-dark logo language; Space Grotesk + Manrope pairing; the animated gradient border as a signature; the fixed nav with scroll-aware shadow; the dark footer's 4-column structure; stat bar with thin dividers; data-driven testimonials.
- **Dead weight.** `src/App.css` is not imported anywhere (Vite scaffold leftover); the `@media (prefers-color-scheme: dark)` block re-declares white; landing pillars use emoji as icons.

## Colors

Two bases, one accent family. Sections are either **ink** (cinematic: hero, race chapters, 3D car story, footer) or **paper** (reading: research lists, news, rules, long-form about). Both appear on the same page; the seam between them is a hard section boundary, never a mid-section gradient.

- `ink-950` is the page-edge dark (hero, footer); `ink-900` the default ink section surface; `ink-800` cards on ink; `ink-700` borders/dividers on ink.
- `paper-50` is the default light surface; `paper-100` alternate section tint and cards; `paper-200` borders/dividers on paper.
- The brand accent is the magenta-to-violet gradient: `rr-grad-start → rr-grad-end` for gradient text (display sizes only) and the animated border; `rr-magenta` as the flat accent (links on ink, active states, status chips, the single accent in capability lists); `rr-violet` as its gradient partner, never alone as UI chrome.
- `rr-cyan` is the logo's second gradient stop and today's nav hover. Proposal: reserve it for logo lockups and telemetry/data accents (charts, lap times) only — not general UI. Flagged as an open question because this demotes today's nav hover color.
- Buttons: solid, never gradient. Primary on ink = `rr-magenta` fill with `text-on-ink`; primary on paper = `ink-950` fill with white text. Secondary = 1px border (`ink-700` on ink, `paper-200` on paper) with transparent fill. Ghost = text + underline. This retires the current navy `blue-900` CTA (conflict flagged below).
- Text: `text-strong` for headings on paper, `text-body` for paragraphs, `text-muted` for metadata (AA against `paper-50`, never lighter). On ink: `text-on-ink` headings, `text-on-ink-muted` body/metadata.
- Photography on ink always sits under a scrim (`ink-950` at 40–70% or a bottom-up gradient) before text goes over it.

## Typography

Frontmatter sizes are the desktop values; implementation is fluid via the clamp() ramps in `docs/design/tokens.proposed.css` (e.g. display-xl runs 2.75rem to 5.5rem).

Space Grotesk (display, weight 600 only) + Manrope (body/UI, 400 and 600) — the pairing the site already loads from Google Fonts. Keep it; it is distinctive, technical, and free to self-host as woff2 later. Load only the weights used: Space Grotesk 500/600, Manrope 400/600/700.

- Scale: `display-xl` (one per page, the h1), `display-l` (chapter titles on ink), `display-m` (section titles), `lead` (section intros, max 60ch), `body`, `small`, `eyebrow` (uppercase, tracked 0.14em, in `text-muted` or `rr-magenta`), `mono` (specs, lap times, code — JetBrains Mono, Google Fonts, load on demand).
- Gradient text (`rr-grad-start → rr-grad-end`, background-clip) only at display sizes and at most once per viewport.
- Never center more than two lines of body text. Body column max 68ch on paper.
- Kill the current h2 weight 200; display type is always 600. Element-level h1–h5 rules in `src/index.css` are replaced by the token scale + utilities so global and page scales stop disagreeing.
- Alternative pairing (proposed, not forced — Ayagoz decides): **Archivo** (SemiBold, wide/expanded axis) as display over Manrope body. Rationale: motorsport signage character via the width axis, still Google Fonts. Runner-up only; Space Grotesk stays the default recommendation because it is already the brand voice and migration-free. Avoid Inter, Roboto, Arial everywhere including fallback-first positions.

## Layout

- Section rhythm (fluid in tokens.proposed.css: section clamps 5rem to 10rem, section-tight 3rem to 6rem): `padding-block: spacing.section` for chapters, `spacing.section-tight` for supporting bands (stats, marquee). Hero and pinned chapters are `min-height: 100svh`; ordinary sections size to content. One idea per viewport: each section = eyebrow + title + one visual + one action.
- Containers: content column 72rem (`--container-content`), wide media/marquee 90rem, hero/video/marquee may go full bleed. Grid: 12 columns desktop / 6 tablet / 4 mobile, `spacing.gutter` (1.5rem) gutters. Cards max 3-up; prefer a 2-up with one large media over a 4-up grid.
- Landing section order (Neobotics-pattern, RoboRacer content): VideoHero with scroll cue → NextRaceSpotlight row → pinned "what is RoboRacer" chapter (3D car assembles on scroll) → community scale (StatCounters) → sponsors marquee → featured teams → research teaser → build/learn entry points → Slack CTA → footer.
- Nav: fixed, transparent over the ink hero, transitions to `paper-50` at 90% opacity + backdrop blur after 40px scroll; keeps 68px/85px heights so existing page offsets survive. Active link underline moves from cyan to `rr-magenta` (pending the cyan decision).
- Footer: keep the current 4-column structure (mission + contact, quick links, resources, community CTA) on `ink-950`, gradient logo, thin `ink-700` copyright rule.

## Elevation & Depth

Depth is expressed by surface steps first, shadow second. On ink, elevation = lighter surface (`ink-800` card on `ink-900` section) + 1px `ink-700` border; shadows are invisible on dark and are not used. On paper, three shadow levels only: `shadow-card` `0 1px 2px rgb(11 12 20 / 0.06), 0 4px 12px rgb(11 12 20 / 0.06)` (resting cards), `shadow-card-hover` `0 2px 4px rgb(11 12 20 / 0.08), 0 12px 28px rgb(11 12 20 / 0.10)` (interactive hover, paired with a 2px translateY), `shadow-nav` `0 2px 8px rgb(11 12 20 / 0.08)` (scrolled nav — matches today's value). No colored glows except the animated gradient border, which is the signature and appears at most once per page.

## Shapes

- `rounded.card` 1.25rem for cards, spotlight panels, media frames on paper.
- `rounded.media` 0.75rem for inline images/video inside cards.
- `rounded.button` 0.5rem for buttons and inputs (keeps today's `rounded-lg` feel).
- `rounded.pill` for chips: event status (Upcoming/Live/Past), tags, filters, sponsor tiers.
- No mixed radii inside one component; icons are stroked SVG (Lucide-style, 1.5–2px), never emoji.

## Motion vocabulary

Engine: GSAP + ScrollTrigger via `useGSAP`, wrapped in `gsap.matchMedia()`; lenis smooth scroll on desktop only. Named eases: `ease-out-expo` `cubic-bezier(0.16, 1, 0.3, 1)` (entrances), `ease-in-out-quart` `cubic-bezier(0.76, 0, 0.24, 1)` (scrubbed states). Durations: `fast` 180ms (hover, chips), `base` 420ms (reveals), `slow` 900ms (hero-scale moves). Nothing exceeds 1.2s per element. Animate only transform and opacity; `will-change` only while animating; triggers killed on unmount.

| Pattern | Explains | Spec | `prefers-reduced-motion` fallback |
|---|---|---|---|
| **Reveal** | content arriving | y 24px→0, opacity 0→1, 0.6s `ease-out-expo`, stagger 60ms, `once: true`, start `top 80%` | rendered static, opacity 1, no transform |
| **Pin** (PinnedChapter) | a sequence/transformation (line art→render, car assembly) | section pinned 150–250vh, scrub 0.8, 2–4 discrete states | unpinned; states stacked vertically with captions, fully readable |
| **Scrub** | a process tied to scroll (video `currentTime`, 3D assembly progress) | progress-driven, clips under 8s, keyframe-dense encodes | poster image / assembled final state |
| **Parallax** | depth between media and text | media `yPercent` -10..10, scrub true, desktop only | none (static) |
| **Marquee** | many peers (partners, sponsors) | CSS keyframes translateX, 40–60s loop, duplicated track, pause on hover | static wrapped logo grid |
| **Counter** (StatCounter) | scale (90+ universities, 20+ countries, 60+ publications) | count up once in view, 1.2s ease-out | final number rendered immediately |
| **Hero video** | the feeling of racing | muted autoplay loop playsinline, `preload="metadata"`, poster mandatory, ≤3MB, lighter mobile encode, scroll cue below | poster image only, video never autoplays |
| **Micro** | interactivity | hover: 2px translateY + `shadow-card-hover`, 180ms; underline grow 300ms; menu fade/slide 200ms (existing) | color/underline change only, no transform |

Every animated component reads `usePrefersReducedMotion` (or the CSS media query) and must be content-complete with JavaScript disabled.

## Components

To build in `src/components/ui/`, all consuming tokens above, all data-driven from `public/data/*.json`:

- **Section** — variant `ink | paper`, width `content | wide | bleed`; owns section padding so pages never hand-roll rhythm.
- **SectionHeader** — eyebrow + display-m title + lead + optional action; the only sanctioned section-top layout.
- **VideoHero** — full-bleed ink, poster-first video, display-xl headline, one primary CTA, scroll cue.
- **NextRaceSpotlight** — race name, dates, city, countdown (mono digits), register CTA, secondary rules link; fed by events JSON.
- **PinnedChapter** — states[] with captions; the Pin/Scrub patterns; reduced-motion stacks states.
- **Reveal** — wrapper implementing the Reveal pattern.
- **Marquee** — logo track per the Marquee pattern.
- **StatCounter** — Counter pattern; number + small uppercase label (keeps today's stat-bar layout with thin dividers).
- **EventCard** — image with scrim, pill status chip, date, venue, one link; upcoming vs past variants.
- **SponsorTier** — tier name, logo row sized by tier (never a flat wall), empty-tier CTA ("Become a sponsor").
- **TeamGrid** — photo, name, role, link; graceful initial-avatar fallback.
- **PublicationCard** — title, authors, venue, year, tag pills, links; paper variant only.
- **Button** — primary/secondary/ghost per the Colors rules; visible focus ring (2px `rr-magenta` offset 2px on paper, `text-on-ink` on ink).
- Supporting: `TagFilter`, `LogoCloud`, `MediaFrame` (aspect + poster + lazy), `Footer`.

## Do's and Don'ts

- Do keep one theme across all routes: same tokens, nav, rhythm, cards, motion (CLAUDE.md rule 5). No page-specific palettes.
- Do respect `prefers-reduced-motion` on every animated element with a static, readable layout (rule 6).
- Don't use emoji as icons (rule 5; current landing pillars violate this and get replaced).
- Don't use gradient-filled buttons; gradients live only in display text, the animated border, and the logo.
- Don't put four identical cards directly after the hero; don't use a carousel without a narrative purpose (rule 5).
- Don't set text over photos without a scrim; don't drop text contrast below AA (rule 7).
- Don't use Inter, Roboto, or Arial (revamp constraint).
- Don't copy assets or copy text from neobotics.org or any third-party site — patterns only (rule 8).
- Don't invent facts, sponsors, dates, or stats; content comes from `roboracer-content` or Cedric (rule 4).
- Don't pin a section shorter than the viewport; don't animate width/height/top/left.

## Migration conflicts (explicit decisions needed)

Flagged so Cedric can rule on each; nothing here is silently changed:

1. **Cyan demoted.** Logo gradient ends in `#00D1DA` and today's nav hover is cyan; the proposal moves UI accents to magenta/violet and reserves cyan for the logo + telemetry. Alternative: keep cyan as the interactive accent and violet never enters.
2. **Navy CTA retired.** Today's `blue-900` buttons are replaced by magenta-on-ink / ink-on-paper solids.
3. **Base flips dark for hero/chapters.** Today the whole site is white-based; ink sections are new.
4. **Global element styles replaced.** `src/index.css` h1–h5/p element rules and the h2 weight-200 go away in favor of the token scale.
5. **`src/App.css` deleted** (unused Vite scaffold) and the no-op dark-scheme media block removed.
6. **Radius grows** from 8px cards to 1.25rem — a softer, more editorial card; Ayagoz to confirm.

## Open questions

**For Cedric**

1. Cyan `#00D1DA`: logo-and-telemetry only (proposal), or keep it as the site-wide interactive accent instead of magenta?
2. Confirm retiring the navy `blue-900` CTA for magenta/ink solid buttons — this changes the most-clicked element on the site.
3. Which routes open on ink? Proposal: landing, race, about start on ink heroes; research, news, rules are paper from the nav down with only the footer on ink. OK?
4. Hero video: is `roboracer_fpv.mp4` (Cloudflare-hosted, ≤3MB encode + poster) the confirmed landing hero source?

**For Ayagoz**

5. Font pairing (open decision in docs/PLAN.md): keep Space Grotesk + Manrope, or switch display to Archivo (wide/expanded)? Either way, which exact weights do we self-host?
6. Card radius: 1.25rem (editorial, per cedrichollande-style rhythm) vs 0.75rem (more technical)?
7. Gradient budget: display text + animated border only, or also stat numbers and the nav active underline?
8. Ink family: approve the blue-black ramp (`#07070D → #242841`) or push warmer/neutral? Sample both against race photography before Phase 2.
