# Landing v3: the contract (Cedric, 2026-08-21, after reviewing session 5 on localhost)

Session 5 shipped the structure. It still reads as empty: no media, a headline on a blank
paper wall, a small muddy 3D car, a thin logo strip, and a dead "Bring your car to the
grid" ending. neobotics.org always has something happening in the viewport. This session
fills the page with real media and makes the first 300vh the best thing on the site.

Rules from `docs/plans/landing-v2.md` still apply unless changed here. Changes are marked
NEW. Numbers below are starting points: the director tunes on the dev server with
screenshots at 1440x900 and 390x844, and records the final values in this file.

Audiences: read `.claude/skills/roboracer-audiences/SKILL.md` (eight personas from the
Rahul / Ayagoz / Cedric meeting, 2026-08-21). The landing must work for the newbie
("is this exciting?"), the competitor (next race, how to enter), the faculty member
(reassurance, videos), the sponsor (scale, reach), and the press (media). Every section
below names who it serves.

## Section order (NEW: the map chapter replaces the bare data line; Join replaces Get started)

1. Hero + headline (one pinned chapter, ink) - newbie
2. 01 Highlights, two-row media strip with real clips and photos - newbie, press
3. 02 Next race: IROS 2026 with a hall photo - competitor
4. 03 The car: bigger product render, photos beside it - builder, newbie
5. 04 Platform: Build / Learn / Race / Research with a live media panel - learner, faculty
6. 05 Community map (ink, pinned): countries light up, competitions pop in, counters - sponsor, press
7. Data line + partner ribbon (3x thicker, hover links) - sponsor, faculty
8. 06 Teams - competitor
9. 07 Research: 2025-2026 featured papers with thumbnails - learner, faculty
10. 08 Join: Slack with live community numbers, GitHub, contact - everyone

## 1. Hero + headline chapter (NEW, replaces VideoHero + HeadlineReveal as separate sections)

One component, `HeroChapter`, wrapper `h-[320vh]`, inner `sticky top-0 h-svh overflow-hidden`,
one ScrollTrigger (`start: "top top"`, `end: "bottom bottom"`, `scrub: 0.6`,
`anticipatePin: 1`). The video sits UNDER the nav (the landing removes its
`pt-[68px] md:pt-[85px]`; other routes keep it). p = scroll progress 0..1.

- Video: `object-cover`, full bleed, `scale 1 -> 1.12` over the whole pin (slow push-in).
  `filter: brightness(1 -> 0.38) saturate(1 -> 0.75)` from p=0.08 to p=0.45, then holds.
  `filter: blur(0 -> 10px)` from p=0.12 to p=0.45 so the text reads; measure frame time at
  1440x900 with the Performance panel; if blur costs more than 4 ms a frame, drop blur and
  keep brightness only (the scrim alone must make the text AAA-readable).
- p 0.00-0.08: video only. Nothing else on screen. No headline, no CTAs, no credit.
- p 0.10-0.42: headline assembles in front of the video. Line 1 "Autonomous racing" moves
  as ONE unit (y 120 -> 0, opacity 0 -> 1, ease quart); lines 2-3 ("built and raced" /
  "in the open") assemble word by word with the same motion, stagger 0.06 of the pin per
  word, finishing at p=0.42. Copy (NEW, no comma): "Autonomous racing built and raced
  in the open", 3 authored lines.
- Type: Space Grotesk semibold, base `clamp(2.4rem, 8.5vw, 8.5rem)`, leading 0.95,
  tracking -0.03em, centered, `text-text-on-ink` (white) for lines 2-3. Line 1 (NEW,
  Cedric's explicit exception to the accent rule): gradient text sampled from the real
  logo, `linear-gradient(90deg, #00D1DA 0%, #FC00FF 100%)` with `background-clip: text`,
  applied to the line-1 span (it animates as a unit precisely so the clip is not broken by
  per-word compositing layers). If the director judges it overbearing at 1440, fall back
  to the gradient on "racing" only; document the choice with a screenshot in docs/qa.
- p 0.42-0.55: hold, fully assembled.
- p 0.42-0.82 (NEW, the zoom): the whole block scales 1 -> 1.30 (origin center). At 8.5vw
  base, line 1 reaches about 100vw at 1.30; do not exceed that or letters clip at rest.
  Video continues its push-in. This must be obvious, not subtle: the old 0.985 -> 1 is
  the thing Cedric called "barely zooming".
- p 0.82-1.00 (NEW, the exit): words are thrown upward: y 0 -> -120vh, stagger 0.02 per
  word from the last line to the first, scale continues 1.30 -> 1.55 while fading
  opacity 1 -> 0 by p=0.95 (overflow is fine while exiting). Video brightness -> 0.12.
  The pin releases and Highlights (paper) slides over the dark hero.
- Pause control: hover/focus icon only, as before. Idle scroll cue after 10 s, as before.
- Reduced motion: poster image, then the static headline on paper (today's layout).
- No-JS / weak device (`hardwareConcurrency < 4`): no pin; poster + static headline.
- One h1, `aria-label` with the full sentence, word spans `aria-hidden`.

Nav (NEW, owned by the same builder): transparent over the hero, opaque by the time the
headline exits. `--nav-alpha = clamp(scrollY / (0.9 * innerHeight), 0, 1)` written by a
ScrollTrigger `onUpdate` (not a scroll listener: Lenis drives scroll). Nav background
`rgb(251 251 253 / var(--nav-alpha))`, `backdrop-filter: blur(calc(var(--nav-alpha) * 12px))`,
box-shadow only when alpha > 0.9. Logo: the white-gradient SVG and the black-gradient
logo stacked in one box, cross-faded by alpha (no layout shift, `width/height` set).
Link text: `color-mix(in oklab, var(--color-text-on-ink) calc((1 - alpha) * 100%), var(--color-text-strong))`.
Non-landing routes: alpha fixed at 1 (current look). Mobile: same rule.

## 2. Highlights (populated, NEW content)

`HighlightReel` stays. Populate `public/data/highlights.json` from the media-curator's
output: 14-16 tiles, row 1 mostly clips (16/9, 3-6 s loops, 960 wide, under 1.5 MB each,
poster under 120 KB), row 2 mostly photos (3/2, 1200 wide WebP, under 220 KB). Priority:
ICRA 2026 Vienna and IV 2026 Detroit, then ICRA 2025 / IROS 2024 if the media exists.
Every tile: mono caption `<what> · <event, city>`, credit `Photo: <name>` when known.
Placeholders remain only where the curator found nothing; never an empty strip.
Schema additions (NEW): `event`, `href` (optional link to the race site), `credit`.

## 3. Next race (NEW: one big image)

Keep the 7/5 ledger. Add a full-width 21/9 photo above it: the best wide hall shot of a
past competition (ICRA 2026 Vienna is the biggest; IROS 2024 Abu Dhabi if found), 1920
wide WebP under 350 KB, `loading="lazy"`, mono caption. Reserved file:
`public/media/race/race-iros2026-hero-1920.webp`. If the curator cannot find a hall shot,
use the ICRA 2026 group photo and tag the caption `placeholder`.

## 4. The car (bigger, better, LiDAR fixed)

- Layout: media first. Grid `md:grid-cols-[7fr_5fr]` at least; canvas height `72svh`
  (was 55). The header moves above the grid, smaller (display-m), so the car owns the
  viewport.
- Camera: rest distance so the car fills about 70% of the canvas width at 1440 (was a
  small object in the middle). Keep the dolly-out on explosion.
- Look: this must read as a product render. Replace the flat grey multiplier on the
  chassis (`cloned.color = "#82878f"` in `racecarMaterials.ts`) with proper tone control:
  keep the palette, set `envMapIntensity` per material (decks 0.5, aluminum 1.2), add a
  drei `Environment preset="studio"` (already in /assembly? verify) plus a key
  directional at 35 degrees with soft shadow, a rim from behind-left at 0.6, and a ground
  `ContactShadows` opacity 0.55. Tone mapping ACES, exposure 1.15. No fog, no colored
  lights. Compare with a real photo of the car side by side in the review screenshot.
- LiDAR frame bug (Cedric: "weird when we rotate, the frame is wrong"). Diagnose, do not
  guess: render the LiDAR part alone at yaw 0/90/180/270; the Hokuyo must stand upright
  with the orange window ring near the top and the cable exit at the rear. Compare
  `racecarAssemblyData.ts` (`lidar` has no `rotation`) with the `laser_model` visual
  `<origin rpy>` and the `base_to_laser_model` joint rpy in
  `../f1tenth_gym_ros/urdf/racecar_mesh.xacro`, and with the node transform baked in
  `public/models/racecar/roboracer_lidar.glb` (the chassis GLB carries a baked
  translation, the LiDAR GLB carries only a scale; a missing yaw or a Y-up/Z-up flip in
  the source DAE is the likely cause). Fix in the part table, verify visually, note the
  root cause in `docs/design/CAR_CHAPTER.md`.
- Photos beside the model (NEW): two slots to the right of the canvas, 4/3, from the
  curator's car close-ups (studio-like, clean background preferred). Reserved files:
  `public/media/car/car-photo-01-1200.webp`, `car-photo-02-1200.webp`. Cedric's own
  studio photo (`public/media/hero/car-studio.webp`) still takes the crossfade slot when
  it lands. If no clean car photo exists, the slot shows the best real car photo with a
  `placeholder` tag; the agent may not generate or stock-source a car image.
- /assembly gets the same materials and lighting; keep all features; LiDAR fix applies.

## 5. Platform (NEW: media panel)

Neobotics pattern: a 5/7 split where the left column is one large media frame (16/10,
sticky within the section on desktop) and the right column is the four hairline rows.
Hovering or focusing a row (and scroll position on mobile) swaps the media:
- Build: car assembly photo or the coursekit build GIF converted to an mp4 loop
  (`f1tenth/f1tenth_doc img/buildCar.gif`, org asset).
- Learn: a course visual (RViz LiDAR scan / lecture frame from `f1tenth_coursekit`).
- Race: a head-to-head clip from the highlights set.
- Research: Cedric's MPPI overtaking gym video. Reserved files
  `public/media/platform/platform-research-mppi-960.mp4` + `-poster.webp`; Cedric drops
  the source in `_harvest/platform/` and the curator encodes it (under 1.5 MB).
Every media frame has a mono caption. Reduced motion: the four posters as a static grid.

## 6. Community map chapter (NEW, replaces the bare data line; ink)

`WorldMapChapter`, wrapper `h-[260vh]`, sticky inner, one ScrollTrigger, scrub 0.6.
Assets: `public/media/map/world-land.svg` (generated, inlined via `?raw` import) and
`public/data/events_map.json` (generated, `x/y` already projected; see
`scripts/build-world-map.mjs` and `data/events_map.source.json`).
- Left 7 columns: the map. Right 5 columns: a mono eyebrow "05 / Community", a line
  "Teams from around the world", and four StatCounters stacked (universities, countries,
  publications, competitions) that count up during phase 2 (below).
- Phase 1 (p 0.05-0.40): country markers for partner / team countries fade in as soft
  white discs (r 10, opacity 0.35) with a small mono country name; "20+ countries".
- Phase 2 (p 0.35-0.85): competition pins pop in chronological order (scale 0 -> 1, 0.03
  pin each), a mono label flashes the city for the current pin, and a large mono counter
  ticks from 1 to 30 in lockstep with the pins. The upcoming pins (IFAC Busan, VTC
  Boston, IROS Pittsburgh) arrive last; IROS 2026 is the ONLY violet element on the map
  (solid disc with a pulsing ring); all other pins are paper-white. The counter reads
  "31st coming up · Pittsburgh" when it lands.
- Unverified entries (`verified: false`) render as hollow rings with a mono "tbc" label;
  `lat/lng 0,0` sentinels are skipped. Nothing hidden on localhost.
- Phase 3 (p 0.85-1.00): hold; the right-column numbers finish; the pin releases.
- Counters (NEW timing): start only when the chapter is pinned (not on scroll-by), run
  3.2 s, `power2.out`, staggered 0.15 s. The same timing applies wherever StatCounter is
  used; on scroll-driven chapters bind the counter to progress instead of time.
- Reduced motion: static map with all pins and the four numbers.
- Data line under the chapter stays: "across the partner institutions below".

## 7. Partner ribbon (NEW: 3x thicker, hover link)

Logo box height 36 -> 112 px (`h-28`) on desktop, 84 px on mobile; logos `max-h-20`,
gap 16, same duration. Each logo is an `<a href={website} target=_blank>` with `group`;
on hover or focus-visible the marquee pauses (already) and a mono pill appears under the
logo: "ETH Zurich ↗" (ink on paper, hairline border, no glow). Grayscale -> color on hover
stays. Keyboard: every logo tabbable, clones `aria-hidden` and `tabindex=-1`.

## 8. Teams: unchanged, plus a country flag-free "country" mono line per card; verify the
Thunderbolt / UPenn Autonomous Racing aliasing with Cedric before publishing (QA flag).

## 9. Research (NEW: 2025-2026 papers, thumbnails)

`publications.json` has no 2025 or 2026 entries. Run `/discover-papers --days 720
--max 80`, accept the clearly on-platform 2025-2026 papers, pick 6 featured by recency
then citations (Semantic Scholar counts via `resolve_paper.py`), keep the 2020 platform
paper pinned. Each featured paper gets a `thumbnail` (schema field exists): first figure
from the arXiv HTML rendering when the paper is on arXiv, else page 1 of the PDF cropped
to its top 60% (`scripts/paper_thumbs.py`), 1200x750 WebP under 120 KB, stored in
`public/media/research/`. `PublicationCard` gets a 16/10 media slot on top; the landing
shows 3 in a row with thumbnails, /research shows all. Credit line under the card:
"Figure: <first author> et al." Record source and license per thumbnail in
`docs/ASSET_MANIFEST.md` (arXiv licenses allow display with attribution; anything else
gets the page-1 render instead of a figure).

## 10. Join (NEW, replaces "Bring your car to the grid")

Section title "Join 3,000+ people building and racing" (number from
`public/data/community.json`, rendered with the live value and `+`). Left: three mono
stats from the same file (members, time zones, continents) with "updated <date>" under
them. Right: a 4/3 crowd or group photo (ICRA 2026). Buttons: solid violet "Join the
Slack" (primary), secondary "GitHub", mono link "contact@roboracer.ai". The Build and
Learn rows move into section 5; no list here. `community.json` is refreshed by
`scripts/slack_stats.py` (Slack bot token, `users:read`) via the
`community-stats` workflow once a bot token exists; until then the seed values stand
with `"source": "manual"`.

## File ownership (parallel page-builders, one worktree each, disjoint files)

| Builder | Branch | Owns |
|---|---|---|
| A hero-nav | revamp/v3-hero-nav | src/components/ui/HeroChapter.tsx (new), VideoHero.tsx, HeadlineReveal.tsx (delete or keep for styleguide), NavBar.tsx, nav rules in index.css, Layout.tsx (padding switch) |
| B car | revamp/v3-car | ExplodedModel.tsx, ExplodedModelScene.tsx, RacecarAssembly.tsx, racecarMaterials.ts, racecarAssemblyData.ts, pages/Assembly.tsx, assembly.css, docs/design/CAR_CHAPTER.md |
| C map-community | revamp/v3-map-community | WorldMapChapter.tsx (new), StatCounter.tsx, CommunityJoin.tsx (new), scripts/build-world-map.mjs, data/events_map.source.json, public/data/events_map.json, public/media/map/*, scripts/slack_stats.py, .github/workflows/community-stats.yml, public/data/community.json |
| D media (media-curator agent) | revamp/v3-media | public/media/** (new files only), public/data/highlights.json, docs/ASSET_MANIFEST.md, docs/media/SELECTION.md; no components |
| E papers | revamp/v3-papers | public/data/publications.json, data/publications.*.json, scripts/paper_thumbs.py, public/media/research/*, PublicationCard.tsx, pages/Research.tsx |
| F page (director) | revamp/v3-page | Landing.tsx, Marquee.tsx, PlatformPanel.tsx (new), Section.tsx, SectionHeader.tsx, styleguide entries, integration of A-E |

Landing.tsx is edited by F only. Everything else is a stub in F until merge.

## Acceptance (director checks all of these before /ship)

- First 320vh: video only, then the headline in front of the video, white + gradient line
  1, visible zoom, upward exit. Nav transparent at top, opaque by the end of the chapter.
- Highlights: no empty frames unless documented in SELECTION.md as "nothing found".
- Car: fills the canvas, reads as a product render, LiDAR upright at every yaw.
- Map: pins in the right places (Anchorage, Abu Dhabi, Rio, Jeju, Vienna sanity set),
  counter reaches 30 then "31st", violet only on IROS 2026.
- Ribbon 3x thicker, links work with mouse and keyboard.
- Research: 6 featured with thumbnails, newest first, nothing older than 2023 except the
  pinned platform paper.
- Join: live numbers from community.json, photo present.
- Lint, build, /qa-page landing, @qa-reviewer, impeccable critique all pass; no
  `import.meta.env.DEV` gates hiding content; 1.5 MB rule respected (hero exception only).
- Screenshots at 1440 and 390 of every section in `docs/qa/landing-v3/`.
