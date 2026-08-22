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

## Drift check against the code (director, 2026-08-21, HEAD 7e3acb1)

Written from a read-only clone; corrected here after reading the working tree.
Where this section conflicts with the text above, this section wins.

- The page top padding `pt-[68px] md:pt-[85px]` is on the root div of
  `src/pages/Landing.tsx` (and `Styleguide.tsx`), NOT in `Layout.tsx`. Builder A does
  not touch `Layout.tsx`; F removes the padding from `Landing.tsx`. `NavBar.tsx` decides
  "landing or not" from `useLocation().pathname === "/"`.
- `NavBar.tsx` is `src/components/NavBar.tsx` (legacy `.navbar` / `.nav-link` /
  `.nav-cta` / `.mobile-menu` rules in the unlayered LEGACY block of `src/index.css`;
  measured height 68 px mobile / 85 px desktop; logo `h-10`). Logo assets:
  `/logos/logo-black-gradient.png` (2736x491) and `/logos/logo-white-gradient.svg`.
  New nav CSS must be layered (`@layer components`) or scoped to a class; an unlayered
  rule silently beats every Tailwind utility (two shipped bugs).
- Car files live in `src/components/`: `RacecarAssembly.tsx`, `racecarAssemblyData.ts`,
  `racecarMaterials.ts`; the chapter is `src/components/ui/ExplodedModel.tsx` +
  `ExplodedModelScene.tsx`. The scene already has ACES tone mapping, `StudioLighting`
  (drei `Environment preset="studio"` with a neutral fallback) plus one directional,
  `ContactShadows opacity 0.4`; canvas `h-[55svh]`, grid `md:grid-cols-[1fr_20rem]`,
  camera rest distance 0.72 (wide). The `#82878f` chassis multiplier is at
  `racecarMaterials.ts` as described.
- LiDAR facts for the diagnosis: `racecar_mesh.xacro` `base_to_laser_model` origin is
  `xyz` only (no rpy) and `laser_model/visual` has no `<origin>`; the LiDAR GLB node
  carries only `scale 0.046187`; the chassis GLB node carries `translation
  [0.203053, 0.001068, 0.072273]` + `scale 0.224685`; the assembly root group applies
  `rotation [-PI/2, 0, 0]` (Z-up source to Y-up). Source of truth:
  `/home/cedric/Documents/UPenn/xLAB/Roboracer/f1tenth_gym_ros/meshes/roboracer.usd`
  and `scripts/usd_to_mesh.py` there. The assembled position in the part table
  (`0.095512 = 0.266962 - 0.17145`) matches the xacro.
- `src/lib/data.ts` had no owner. F adds, in a prep commit on `revamp/integration`
  BEFORE the worktrees branch: `Highlight.event/href` (optional), `Publication.thumbnail/
  arxiv/pdf` (optional; `data/publications.schema.json` already has them), `EventsMap`
  + `loadEventsMap()`, `Community` + `loadCommunity()`. Nobody else edits `data.ts`.
- `.gitignore` ignores `public/media/**/*.mp4|webm` except the hero loop. The prep commit
  re-includes `public/media/highlights/` and `public/media/platform/` clips; the 1.5 MB
  rule is enforced by `scripts/media.sh report public/media`, not by the ignore file.
- `_harvest/drive/2026-iv/Photos` is EMPTY (0 files). The IV 2026 Drive folder holds only
  orientation recordings, banners, shirts, certificates: no race photos. IV 2026 podium
  photos must come from Cedric (see the closing report).
- Tools on this machine: `ffmpeg`, `ffprobe`, `pdftoppm`, ImageMagick 6 `convert` (WebP
  delegate present), Python PIL 10. NOT present: `cwebp`, `magick`, `heif-convert`.
  `scripts/paper_thumbs.py` and the media commands must use `convert` or PIL.
- `highlights.json` already carries `event` and `href` (15 entries, 1 live).
  `events_map.json` and `world-land.svg` are already generated and committed; the
  devDependencies are installed.
- `publications.json`: 67 items, newest year 2024, two items with `year: 0` (fix or hide).
- `StatCounter` today: `start: "bottom bottom"`, 1.8 s. Marquee logos today: `max-h-9
  max-w-32`, gap 12.
- `TeamGrid` already renders a country mono line (section 8 is satisfied; the aliasing
  flag stands).
- `Styleguide.tsx` is owned by A (HeroChapter + nav demo); F adds the remaining demos at
  integration. Nobody else touches it.
- Dev ports: A 5181, B 5182, C 5183, E 5185, F 5186. Worktrees under
  `../roboracer-site-wt/v3-<name>`, branched from `revamp/integration` after the prep
  commit. `_harvest/` is symlinked into every worktree.
- Reserved media filenames (D produces, F wires):
  `public/media/highlights/highlight-<event>-<subject>-NN-960.mp4` + `-poster.webp`,
  `highlight-<event>-<subject>-NN-1200.webp`;
  `public/media/race/race-iros2026-hero-1920.webp`;
  `public/media/car/car-photo-01-1200.webp`, `car-photo-02-1200.webp`;
  `public/media/platform/platform-build-960.mp4` + `platform-build-poster.webp`,
  `platform-learn-1200.webp`, `platform-race-960.mp4` + `platform-race-poster.webp`,
  `platform-research-mppi-960.mp4` + `platform-research-mppi-poster.webp`;
  `public/media/join/join-icra2026-crowd-1200.webp`;
  `public/media/team/team-<slug>-800.webp` (slug = teams.json name lowercased,
  non-alphanumerics to hyphens).

## Final motion numbers (director, 2026-08-21, as shipped on revamp/v3-page)

Hero chapter (`HeroChapter.tsx`, p = progress over the 320vh pin, scrub 0.6, sticky
CSS pin so `anticipatePin` is a no-op):
- video `scale 1 -> 1.12` over p 0-1; `brightness 1 -> 0.38`, `saturate 1 -> 0.75` over
  p 0.08-0.45; `brightness -> 0.12` over p 0.82-1.00; blur OFF (`blurPx = 0`: under
  software GL the video pipeline alone costs 130-180 ms/frame so the blur delta could
  not be measured; white on brightness 0.38 is 6.2:1, AAA; re-test on a GPU by setting
  `SCHEDULE.video.blurPx = 10`).
- p 0.00-0.08 video only; p 0.10-0.42 assembly, 7 units (line 1 as one unit, then
  built / and / raced / in / the / open), each `yPercent 110 -> 0`, opacity 0 -> 1,
  duration 0.11, ease-in-out-quart, starts 0.035 apart (spec said 0.06: seven units
  at 0.06 cannot land by 0.42), last lands at 0.42.
- p 0.42-0.82 block `scale 1 -> 1.30` (1.25 under 768 px) with `power2.in`, so
  0.42-0.55 reads as the hold (scale <= 1.03) and the zoom is obvious by 0.70 (1.13).
- p 0.82-0.957 exit, last line first, starts 0.012 apart, `y 0 -> -1.2 x innerHeight`
  over 0.12 `power2.out`, opacity 1 -> 0 over 0.05 starting 0.015 after each throw;
  scale 1.30 -> 1.55 (1.25 -> 1.49 mobile) over 0.82-0.95.
- Type `clamp(2rem, 8.5vw, 8.5rem)` (2.4rem floor clipped at 390 x 1.30), leading
  0.95, tracking -0.03em; line 1 gradient `--color-rr-cyan -> --color-rr-grad-start`
  clipped to text; line 1 = 76vw at rest and 99vw at the ceiling at 1440.
- Nav: `--nav-alpha = clamp((p - 0.72) / 0.23, 0, 1)` from the chapter's own
  ScrollTrigger (transparent through assembly, hold and zoom; fills in during the
  throw; paper by 0.95). Type/CTA/ring flip ink at alpha 0.45; shadow above 0.9;
  alpha fixed at 1 on non-hero routes and while the mobile menu is open. Reduced
  motion: static ramp over the poster `data-nav-fill="0.1 0.6"`.

Car chapter (`ExplodedModel.tsx` / `ExplodedModelScene.tsx`): 140vh pin unchanged,
explosion 0 -> 0.5 over the first 65% then hold; lens fov 26, azimuth 45, pitch 17;
camera distance solved so the car spans FILL = 0.78 of the canvas width at rest
(0.49 m span) and stays in frame at the ceiling (0.74 m span); canvas 72svh, grid
7/5. LiDAR root cause: transforms were correct end to end (part table = xacro = GLB,
pivot on the bbox center); the 40-degree lens pitched about 20 degrees down made
the one tall vertical lean and flip its lean as it crossed the frame. See
`docs/design/CAR_CHAPTER.md`.

Map chapter (`WorldMapChapter.tsx`): 260vh pin, scrub 0.6; phase 1 country discs p
0.05-0.40 (ISO codes fade out 0.35-0.42); phase 2 pins chronological p 0.35-0.85,
`attr r 0 -> 7` `back.out`, 0.03 each, counter capped at 30 (content skill) and
holding while CDC 2025, ICRA 2026, IV 2026, IFAC, VTC pop; IROS 2026 violet with a
pulsing ring; "31st / coming up · Pittsburgh" at the end; phase 3 hold. Map fills
the 7-column width (826 px at 1440).

StatCounter: time mode starts only when fully in view (`start: "bottom bottom"`,
once), 3.2 s, `power2.out`, `delay` 0.15 s per tile; progress mode via
`StatCounterHandle.setProgress` inside the map chapter.

Partner ribbon: logo box 112 px desktop / 84 px mobile, logos max-h 80 / 56,
gap 64 px, 55 s loop; pause on hover and focus-within; clones `inert`.
