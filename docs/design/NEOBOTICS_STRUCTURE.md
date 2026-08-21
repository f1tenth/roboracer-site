# neobotics.org structure study (2026-08-21)

Method: live Playwright pass at 1440x900 (headless Chromium), DOM measurements +
7 viewport screenshots at 0.75vh steps (screenshots local-only, scratchpad,
never committed). This is a PATTERN AND PROPORTION reference. Rule 8 stands:
no asset, no copy, no illustration style is ever taken from this site.

## Global facts

- Total page height: 4582px at a 900px viewport = **5.1 viewports for the
  entire landing page**. Restraint is structural, not stylistic: few sections,
  little copy, media does the persuading.
- Body font: Space Grotesk (same family we already use). Wide techno display
  face for headings, near-black on white.
- **One accent** (red `#FF0033` family) with a strict role list: nav active
  link, status chips/pills, arrow text-links, thin underline bars on cards,
  outlined-pill button borders, and exactly ONE loud full-bleed red panel
  (the NeoRacer product block). Everything else is black, white, one navy,
  and grey. No gradients anywhere. No glow anywhere.
- **No pinning, no scroll-scrub.** The only motion found: hero typewriter
  line, entrance reveals, a masked slide reveal on the giant "NEO RACER"
  display text, and the logo marquee. `position: sticky/fixed` exists only on
  the nav and the mobile menu.
- Dark is rare: the hero (near-black `#06070f`) and one navy spec panel.
  Every other surface is white. Dark surfaces are media surfaces; light
  surfaces are reading surfaces.

## Section-by-section (order, height, media share, accent)

| # | Section | Height | Surface | Media share of viewport |
|---|---|---|---|---|
| 0 | Nav | 104px, solid white, always opaque | white | — |
| 1 | Hero | 100vh | near-black | **100% video** |
| 2 | Events | ~0.6vh | photo triptych | ~100% photo under scrim |
| 3 | Who we are | ~0.65vh | white | 0% (type only) |
| 4 | NeoRacer panel | ~0.66vh | red panel + navy panel | ~50% illustration |
| 5 | Three feature cards | 0.39vh | white | 0% |
| 6 | Backed by (marquee) | 0.26vh | white | logos only |
| 7 | Active projects | 0.62vh | white | 0% |
| 8 | Footer | 0.26vh | white, hairline top rule | — |

### 1. Hero — the pattern Cedric wants

- Full-viewport `object-fit: cover` video of racing footage, stylized
  (edge-detection treatment in the brand color on black) so it reads as
  brand, not stock. **Two-video system**: a non-looping intro take plays
  once, then a seamless loop takes over. No poster attribute.
- On top of the video: NOTHING except (a) one short centered line of light
  ~28px text with a typewriter effect, (b) a small "Scroll to explore" pill +
  down arrow at bottom-center, (c) tiny mono telemetry-style text
  bottom-right ("NEOBOTICS ... LIVE"), (d) thin corner bracket rules,
  bottom-left and bottom-right. No headline block, no CTA, no credit.
- The nav stays solid white above it — the video starts below the nav, it
  does not run behind it.

### 2. Events (first thing after the hero)

- Full-bleed band of three photographs cut by diagonal seams, dark scrim,
  giant outlined ghost word "EVENTS" spanning behind/across all three.
- Per event: red pill chip (type + month), condensed white display name,
  city line, one sentence, red "Event details →" text link. That is the
  entire copy budget per event.
- Pattern: **evidence immediately after atmosphere** — real photos of real
  rooms/crowds before any mission statement.

### 3. Who we are

- 5/7-ish split: huge black display heading left, two short paragraphs
  right, one outlined pill button ("Learn More →"). Thin decorative hairline
  curves in the margins. Type carries the section alone.

### 4. NeoRacer product block (the ONE loud moment)

- A giant rounded red panel, full-width, with "NEO RACER" at roughly 12vw
  revealed with a horizontal mask/slide, and a large monochrome line-art
  illustration of the car. Below it a white interlude (name + one sentence),
  then a navy panel: line-art detail left, red mono eyebrow "CAPABILITIES",
  four bulleted big-type specs, two red arrow links.
- The page allows itself exactly one saturated, in-your-face moment, and it
  is the product. Everything before and after is quiet.

### 5–7. Cards, marquee, projects

- Three feature cards (grey/navy/red) with title + short red underline bar,
  collapsed body text — the only card grid on the page.
- "Backed by:" label + one-row logo marquee bleeding off both edges.
- "ACTIVE PROJECTS →" huge display heading, three grey cards: red status
  pill, name, two lines, mono-grey date, white pill button with red text.

### 8. Footer

- White, compact, hairline top rule: logo mark, two short link columns,
  contact email, three social squares. A quarter viewport, no drama.

## What we mirror (patterns and proportions only)

1. **Hero = video, full stop.** 100svh, cover-fit, nothing on it except a
   scroll cue and (ours) a WCAG pause control revealed on hover/focus. Mono
   corner telemetry is on-brand for us (cyan is reserved for telemetry, but
   here it stays neutral/mono).
2. **Evidence right after atmosphere.** Their diagonal photo triptych → our
   two-row highlights media strip. Real media (or honest grey placeholder
   frames) at full bleed before any self-description.
3. **One accent, role-limited.** Their red list maps to our purple list, but
   Cedric's session rules are stricter than neobotics: purple ONLY as solid
   button fill (and hover underline); chips, rules, markers, eyebrows are ink.
4. **One loud moment per page.** Theirs is the red product panel; ours is
   the pinned 8–10vw "Autonomous racing, built and raced in the open"
   headline. The car chapter stays neutral/studio — the car is a product
   render, not a neon object.
5. **Dark surfaces carry media, light surfaces carry reading.** Our ink is
   for hero + car chapter + footer only (already the v2 rule); everything
   between is paper with hairlines.
6. **Copy budget.** Per section: one heading, one short paragraph or list,
   at most one action. Their whole page is ~5 viewports; ours has more
   sections (11) so per-section brevity matters even more.
7. **Marquee for peers** (partners), label small, logos bleeding off-edge.
8. **Compact quiet footer** — already planned (Phase 3.5).

## What we do NOT copy

- The edge-detection video treatment, the diagonal seam triptych geometry,
  the line-art illustration style, the typewriter line, the ghost word
  behind photos, any copy, any image. Patterns only.
- Red text links: Cedric's rule — links are ink with underline; hover may
  turn the underline purple. Neobotics' colored-text links are out.
- Their card-grid feature section (banned SaaS pattern in our system).
- Their solid-white always-opaque nav is noted but our existing nav behavior
  (transparent over ink hero → paper after scroll) stays unless Cedric says
  otherwise.

## Deltas where Cedric's brief goes beyond neobotics

Neobotics has no pinning and no scrub. Cedric explicitly wants two scrub
moments (the giant headline; the car explosion). These are our additions,
justified because each explains something (the claim; the hardware), and both
must degrade to static per rule 6.
