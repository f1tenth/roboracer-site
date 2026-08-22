# Landing v4 (session 7): Cedric's localhost review of v3, traced to code

Status: contract. Supersedes `landing-v3.md` where they differ; everything not
mentioned here stays as v3 shipped (`028b31a`). Director owns this file and records
the final numbers in section 12 when the session ends.

Cedric's verdict on v3: "starting to come together", highlights "quite impressive",
next race "pretty good, keep", partners "great", publications "quite good", the rest
"quite good". The list below is everything he wants changed, with the cause in the
code and the exact change. Reference stays https://neobotics.org (patterns, never
assets).

## 0. Session rules (cost and speed, from Cedric's usage dashboard)

The last two sessions spent 98 percent of his quota on subagents, 82 percent above
150k context, and 22 percent on the impeccable and superpowers plugins. This session:

- Four streams plus the director, not six. Ownership in section 11 is disjoint.
- Builders read only the files they own, this contract's section for their stream,
  and `CLAUDE.md`. No skill browsing, no repo tours, no reading media files into
  context (contact sheets and review JPGs only).
- No `/impeccable`, no superpowers brainstorming or planning. One `/qa-page landing`
  at the end; the director walks section 13 from the builders' captures.
- Captures: at most 6 per builder (1440x900 and 390x844, changed sections only),
  at most 12 for the director. Video playback is proven by two captures 1.5 s apart
  that differ, never by reading the JSON.
- Two review rounds per stream, then stop and report what is left. No loops.
- `_harvest/` stays out of git; never `git add -A` from a worktree (see the v3 hand-off).

## 1. Hero chapter (`HeroChapter.tsx`): zoom with the words, fade instead of throw

Cause: `S.zoom` runs 0.42-0.82 (after the last word lands at 0.42), and `S.exit`
throws the words to -120vh. Cedric: scale during the pop-in, at max when the last word
lands, then a slower opacity fade, no movement.

New schedule in pin progress p (keep the existing `S` object, change the numbers):

| p | what |
|---|---|
| 0.00-0.08 | video only (unchanged) |
| 0.08-0.45 | scrim: brightness 1 -> 0.38, saturate 1 -> 0.75 (unchanged) |
| 0.10-0.42 | assembly, 7 units, unchanged; AND block scale 1 -> 1.30 (1.20 under 768) over the same window, ease `power1.inOut`, so scale hits its max exactly as the last unit lands |
| 0.42-0.54 | hold: full text, no transforms |
| 0.54-0.84 | fade: block opacity 1 -> 0, ease `power1.in`; no y, no scale change, no stagger (the block fades as one) |
| 0.72-0.95 | nav fill (unchanged) |
| 0.84-1.00 | video brightness -> 0.12 (unchanged target, now starting at the end of the fade) |

Delete the `exit` y tweens and `scaleMultiplier`. If the last 16 percent of the
chapter reads as dead scroll on a dark video, shorten `HEIGHT` from 320vh to 300vh
and scale every breakpoint above proportionally; record the choice in section 12.
Reduced motion and the static layout are unchanged.

## 2. 01 Highlights (`highlights.json`, media only, no component change)

Cedric's replacement list, by current caption (tile ids in parentheses):

| # | current tile | change |
|---|---|---|
| 1 | off the line (icra2026-start-01) | replace clip |
| 2 | on the grid (icra2026-grid-01) | replace clip |
| 3 | through the corner (icra2026-corner-01) | replace clip |
| 4 | two cars, one corner (icra2026-corner-02) | replace clip |
| 5 | the chase (icra2026-chase-01) | replace clip |
| 6 | track-level lap (iv2026-lap, the hero loop) | keep the clip, caption becomes `1st Thunderbolt, UPenn · IV 2026, Detroit` |
| 7 | head-to-head (icra2026-headtohead) | replace clip |
| 8 | 1st Thunderbolt placeholder (iv2026-podium) | becomes a different image with its own caption (the line now lives on tile 6) |
| 9 | on track (icra2026-car-closeup) | replace photo |
| 10 | over the bridge (icra2026-bridge) | replace with Cedric's photo |
| 11 | pit work (icra2026-pitwork) | replace photo |

Group photo, pit table, trophies and award ceremony stay. Sources, in order:
Cedric's folder (section 9), then cuts from the ICRA 2025 reel and the IROS reel,
then the Drive mirror. Clip standard: race pace, cars filling the frame, 3-6 s, no
practice crawl, no crash as the subject. At least three events represented across
the two rows (ICRA 2026, IV 2026, ICRA 2025, plus Korea if his folder has it). Every
tile keeps `credit`, `event`, `href`; captions exactly as Cedric wrote them; he will
retouch captions later, so keep the ids stable.

## 3. 02 Next race: the hall photo becomes Ezio Bartocci's video

Replace `public/media/race/race-iros2026-hero-1920.webp` in the 21/9 frame with the
video from https://lnkd.in/p/e6gNw-d8 (Ezio Bartocci, ICRA 2026 organizer): muted,
looping, poster, same frame, same ledger below. Encode 1600 wide, 21/9 crop, 6-10 s,
up to 2.5 MB (second and last video exception after the hero; record the size).
Credit line under the frame: `Video: Ezio Bartocci · LinkedIn ↗` linking the post.
Download: `yt-dlp --cookies-from-browser chrome <full post url>` first (resolve the
short link in a browser; the curator cannot fetch lnkd.in), else ask Cedric to drop
the file into `_harvest/cedric-media/linkedin/`. If neither lands, keep the photo and
report. Permission: the content skill says LinkedIn media needs the author's OK;
Cedric decided to use it and owns asking Ezio. Note it in `docs/ASSET_MANIFEST.md`.

## 4. 03 The car (`ExplodedModel*.tsx`, `racecarAssemblyData.ts`, `racecarMaterials.ts`)

Cedric: "needs an upgrade, this isn't it"; wheels stick out too far; the LiDAR is
wrong again; the plate should be cyan (or magenta); "more information about the
LiDAR and stuff". Ground truth: his photos in `_harvest/cedric-media/car/` (use them
before touching materials; if the folder is empty, report and use the Drive DSLR
close-ups of a car).

Changes:

1. Explosion magnitude. Cause: `explosion` y of 0.35 m on every wheel against a
   0.26 m track. New ceilings: wheels lateral 0.11 (one wheel width beyond the hub),
   front x 0.05, rear x -0.04, z 0.03; LiDAR `[0.02, 0, 0.14]`; accent `[0, 0, 0.07]`.
   Re-solve `SPAN.exploded` in `ExplodedModelScene.tsx` so the exploded car still
   fills FILL of the canvas; the car gets bigger on screen as a result. The hold
   pose is this modest explosion, rotating slowly.
2. Plate. The accent STL (`FINISH.graphite`) becomes anodized cyan: base
   `#00D1DA`, metalness 0.55, roughness 0.32, envMapIntensity 0.9, clearcoat 0.3 if
   the material supports it. Provide `ACCENT_VARIANT = "cyan" | "magenta"`
   (`#FC00FF`, same finish) and capture both at the hold pose at 1440; the director
   picks one and records it. This is Cedric's third accent exception (after the
   headline gradient and the map); body text and buttons stay as they are.
3. LiDAR. Same test as the photos: a Hokuyo UST-10LX reads as a black cylinder with
   an amber window band just under the cap, upright on the front plate. Capture the
   full car at the hold pose at yaw 0/90/180/270 (not the part alone) and once
   mid-explosion; the band must sit at the top in all five. If the mesh is upside
   down or tilted, fix the mesh (re-export) or the part transform, and replace the
   "lens pitch" explanation in `docs/design/CAR_CHAPTER.md` with what was actually
   wrong. The `lidarWindow` color stays amber `#e8641b`; do not paint it cyan.
4. Callouts. At the hold pose, five labels with hairline leaders anchored to 3D
   points (drei `Html`, projected, `occlude` off, pointer-events none), staggered
   in over 0.4 s after the explosion settles and out when the chapter releases:
   LiDAR, compute, motor controller, motor, chassis. Copy: mono eyebrow caps,
   `text-on-ink/80`, one line each, e.g. `Hokuyo UST-10LX · 2D LiDAR`,
   `NVIDIA Jetson · compute`, `VESC · motor controller`, `brushless motor`,
   `1/10 scale 4WD chassis`. Names come from the build docs (`/build` data or
   `f1tenth_doc`); any name the docs do not confirm carries ` · verify` and goes in
   the report. Under `md`, the callouts render as a five-line list under the canvas.
5. Photos. Keep the two close-up slots; if `_harvest/cedric-media/car/` has better
   images than the Drive close-ups, swap them (same encode budget).

Evidence to leave: the five LiDAR captures, the two plate variants, one 390 capture,
all in `docs/qa/landing-v4/`; `CAR_CHAPTER.md` updated in place (no new doc).

## 5. 04 Platform (`PlatformPanel.tsx`, `platform.json`): pinned, scroll-driven, no hover

Cause: `hovered ?? scrolled` (rows swap on `onMouseEnter`/`onFocus`), and the active
row is picked by distance to the viewport middle while the figure is sticky, which
stutters under Lenis. Cedric: hovering must not swap; the section should pin and let
scroll drive it; Race should visibly be a video; Research's video does not play.

New behavior (desktop, `md` and up):

- The section pins for 300vh (wrapper height 100vh + 200vh of scroll; use the
  `PinnedChapter` sticky pattern, not a layout hijack). Progress 0-1 maps to the four
  rows in equal bands with a 0.04 crossfade at each boundary; the active row is a
  function of progress only. `onMouseEnter`/`onFocus` no longer change `active`;
  row links still work; keyboard users reach all four by scrolling.
- Media crossfade stays opacity-only. The active layer plays; the next layer
  preloads `auto`; inactive layers pause. On activation call `play()` after
  `canplay` if `readyState < 3`; surface `video.error` in the console in dev. The
  builder reads `readyState`, `paused`, `error` for the Research layer in the browser
  and fixes the real cause; the encodes are fine (`yuv420p`, High, 30 fps).
- Under `md`: unchanged (posters inline, no pin).
- Proof: two captures of the Race state and two of the Research state 1.5 s apart,
  each pair differing.

Media per row (curator fills, builder reserves paths):

| row | media |
|---|---|
| Build | Cedric's build photo or clip from `_harvest/cedric-media/platform/` if present, else keep the pit-work photo |
| Learn | `assembling_car.mp4` from Cedric's folder at 4x (`setpts=0.25*PTS`, drop audio), 960 wide, 8-12 s, loop |
| Race | a race-pace clip (ICRA 2026 or ICRA 2025 reel); must play |
| Research | Cedric's MPPI clip (already encoded); must play |

## 6. 05 Community map (`WorldMapChapter.tsx`, `build-world-map.mjs`, `events_map.json`)

Cedric: bigger, more width, more color, regions highlighted, concentration visible,
cyan and the accents, tidy. Reference render: `docs/design/map-choropleth-preview.png`
(built from the committed data; match it, then refine).

Data: `scripts/build-world-map.mjs` now emits `regions` in `events_map.json`: one
path per country that hosted a competition or fields a partner, with `held`,
`upcoming`, `partner`, `verified`. Run `node scripts/build-world-map.mjs` (the output
is committed too). `events_map.source.json` carries `ends` dates for the three
upcoming 2026 races; the script flips them to `held` after the date on the next build.

Layout (`md` and up): the map takes the full `max-w-wide` container width (about
1,280 px at 1440; the old grid gave it 7 of 12 columns). The header (eyebrow, h2, lead,
max 38ch) overlays the top-left ocean; the four StatCounters overlay the bottom-left
ocean as one row; a two-item mono legend sits bottom-right. Nothing overlays land or
a city label at 1440x900 or 1920x1080. Under `md`: header, map, counters stacked.
Chapter stays 260vh pinned; the map's on-screen height must stay under 62vh at
1440x900 (scale the width down if not).

Color (ink background `ink-950`, base land `text-on-ink` at 0.10 fill, 0.18 stroke):

| layer | fill | stroke |
|---|---|---|
| region, held >= 4 | `#00D1DA` 0.60 | `#00D1DA` 0.85 |
| region, held 2-3 | `#00D1DA` 0.40 | 0.65 |
| region, held 1 | `#00D1DA` 0.22 | 0.47 |
| region, partner only | `rr-violet` 0.22 | 0.47 |
| glow under each held race pin | radial `#00D1DA` 0.35 -> 0, r 48 viewBox units | none |
| held pin | `text-on-ink` r 6 | none |
| unverified or upcoming pin | none | `text-on-ink` 1.25 |
| IROS 2026 | `rr-violet` r 8 + pulse (unchanged) | |

Motion: regions fade in with the old country step (0.05-0.40, in `held` order,
biggest first), glows pop with their pins, counters as before. Drop the country
discs and ISO codes (the regions replace them); keep city labels and the label
placer. Reduced motion: final state static. Contrast: region fills never exceed 0.60
so the pins stay the brightest thing on the map.

## 7. Partner ribbon (`index.css` only)

Cause: `.rr-marquee:focus-within .rr-marquee-track { animation-play-state: paused }`;
a clicked logo keeps focus after the new tab opens, so the ribbon stays paused until
the next click. Change the selector to `.rr-marquee:has(a:focus-visible) .rr-marquee-track`
(keyboard focus still holds the ribbon still; pointer clicks do not). Proof: click a
logo, close the tab, move the pointer off: the ribbon moves.

## 8. 08 Join (`CommunityJoin.tsx`, `community.json`, new `SocialButton` in `ui/`)

- Button row: Slack stays the primary violet button with a white Slack glyph. Next to
  it, LinkedIn, Instagram and GitHub as secondary buttons (ink hairline, paper fill)
  with the brand glyph drawn in the logo gradient `#00D1DA -> #FC00FF`
  (`<linearGradient>` inside the inline SVG) and the label in ink. Glyph paths from
  Simple Icons (CC0), inlined, no icon dependency. Instagram is a placeholder
  (`href="#"`, `aria-disabled`, mono tag `soon`) until Ayagoz has the handle.
  LinkedIn points at the RoboRacer page URL in the content skill; if it is still
  `VERIFY`, use the f1tenth LinkedIn page if one exists, else a placeholder like
  Instagram, and report.
- Photo: replace the ICRA 2026 crowd with Cedric's Korea photo from
  `_harvest/cedric-media/` (caption from his file name or note, e.g.
  `ICCAS 2025, Korea · verify`).
- "From the community" row under the buttons, two cards side by side at `md`:
  1. LinkedIn post card: the video from https://lnkd.in/p/eASS6kzr encoded 960 wide
     under 1.5 MB, autoplay muted loop with poster, author line, one-sentence excerpt
     in Cedric's words (not the post text), `View on LinkedIn ↗` to the full post URL.
     Native `<video>`, no iframe, no LinkedIn script.
  2. YouTube card: poster frame cut from the downloaded reel (`_harvest/cedric-media/`,
     "Autonomous RC Racing (The RoboRacer Foundation 24th Race Highlights)"), play
     glyph, caption `ICRA 2025, Atlanta · video by The Robotics Club`. Click swaps in
     `https://www.youtube-nocookie.com/embed/wPHYLAnpMOU?autoplay=1` (facade; nothing
     third-party loads before the click). Credit and link to the channel.
  Both cards use `MediaFrame` and the paper surface; same hairline system as the
  publications. Under `md` they stack.

## 9. Media intake (`@media-curator`)

Cedric's folder is mirrored or symlinked at `_harvest/cedric-media/` (git-ignored).
Expected inside, any layout: clips and photos for the highlight slots, `assembling_car.mp4`,
the ICRA 2025 reel (1080p mp4, The Robotics Club), an IROS reel mp4, a Korea photo,
car photos, and possibly the LinkedIn videos. Procedure:

1. Inventory every file (name, duration, resolution, a 6x6 contact sheet per video,
   a 1200 px review JPG per photo) into `docs/media/INTAKE.md`. Never read the
   originals into context.
2. Map files to slots: section 2 (11 slots), section 3, section 5 (4 rows), section 8
   (photo, post card, YouTube poster). Use his file names first, the contact sheets
   second. Write the mapping table (file -> slot -> caption) before encoding.
3. Slots his folder does not cover: cut from the ICRA 2025 reel and the IROS reel
   (4-6 clips each is plenty), then the Drive mirror.
4. Encode with `scripts/media.sh` budgets: clips 960 wide, 30 fps, under 1.5 MB;
   photos 1200 WebP under 220 KB; the next-race video per section 3; posters per clip.
5. Write `highlights.json`, `platform.json` media fields, the join photo path and
   the post-card files; add `docs/ASSET_MANIFEST.md` rows with credits: Cedric's
   files `Photo: Cedric Hollande` / `Video: Cedric Hollande` unless the file name or a
   note says otherwise; LinkedIn videos credit the author and link the post; the reel
   credits The Robotics Club.
6. Report: the mapping table, the three best new frames, and every slot still
   unfilled with what would fill it.

## 10. Not in scope

Next race ledger copy, teams, research cards, the legacy footer, captions beyond
Cedric's list, any new page. The hand-off's "facts to confirm" list stays open and
does not block this session.

## 11. Ownership (disjoint; Landing.tsx is the director's)

| stream | owns | model |
|---|---|---|
| director | `Landing.tsx`, `HeroChapter.tsx`, `index.css` (marquee selector), `CommunityJoin.tsx`, new `ui/SocialButton.tsx`, `ui/MediaFrame.tsx` if it needs a prop, this file | Fable, max |
| B car | `ExplodedModel.tsx`, `ExplodedModelScene.tsx`, `RacecarAssembly.tsx`, `racecarAssemblyData.ts`, `racecarMaterials.ts`, `Assembly.tsx`, `public/models/**`, `docs/design/CAR_CHAPTER.md` | Fable, max |
| C map | `WorldMapChapter.tsx`, `StatCounter.tsx`, `scripts/build-world-map.mjs`, `data/events_map.source.json`, `public/data/events_map.json`, `public/media/map/**` | Fable, high |
| D platform | `PlatformPanel.tsx`, `PinnedChapter.tsx` if reused, `src/lib/data.ts` (platform types only) | Fable, high |
| E media-curator | `public/media/**` (except models and map), `highlights.json`, `platform.json` media fields, `community.json` photo field if added, `docs/media/INTAKE.md`, `docs/ASSET_MANIFEST.md` | Fable, high |

D and E touch `platform.json`: E writes media fields, D reads them; D reserves the
paths in section 5 and does not edit the JSON.

## 12. Final numbers (director fills at the end)

- Hero: chapter height 320vh (kept: the fade now runs to the release, so there
  is no dead scroll to cut); zoom 0.10-0.42 `power1.inOut` to 1.30 (1.20 under
  768), at its max as the last unit lands at 0.42; hold 0.42-0.54; fade
  0.54-1.00 `power1.in` on the block (Cedric mid-session, 2026-08-22: "way
  slower, get to 0 once we are basically off that page" replaces the 0.54-0.84
  draft: opacity 0.58 at 0.84, 0.21 at 0.95, 0 at release); video dim to 0.12
  runs 0.84-1.00 under the tail of the fade; nav fill unchanged 0.72-0.95.
  Measured on the dev server: scale 1.30 at p 0.42, translate 0 throughout.
- Car: TODO(director) explosion ceilings, plate variant chosen, LiDAR finding in one sentence.
- Map: SVG 1392 x 520 px at 1440x900 (57.8vh; land about 1,076 px wide, v3
  was 826), 1392 x 520 at 1920x1080 (48.2vh). Region opacities as the table;
  one addition: an unverified partner-only country (Belgium) at half fill
  0.11. Two reasoned deviations: the ocean-overlay layout starts at `xl`
  (1280), md-lg shows header beside the 2x2 counters with the map below
  (capped at 35svh so landscape tablets fit the pin); and the viewBox is
  extended 450 units of ocean to the left (`-450 0 2050 766`) so the header
  and counters sit on water, which is why land is 1,076 px, not the full
  1,392. The ordinal ticker became a one-line mono flash ("label · city");
  Torino's label yields to Milan.
- Platform: the section header renders inside the pinned composition (left
  column, above the frame; top-aligned) after Cedric's "big white gap" note;
  wrapper `min-h-[300vh]` with a sticky `min-h-svh` child (200vh of
  travel; ScrollTrigger "top top" to "bottom bottom"); bands Build 0-0.25,
  Learn 0.25-0.50, Race 0.50-0.75, Research 0.75-1.00; crossfade 0.04 centred
  on each boundary, opacity only. Root cause of the silent Research row: the
  `<video>` elements were never mounted (the in-view observer subscribed
  before the rows had loaded), not the encodes.
- Next-race video: `race-iros2026-hero-1272.mp4` 816 KB (1272x720 full frame,
  8 s; poster 106 KB). The contract's 21/9 band cut the bottom strip of Ezio's
  composite off (Cedric, 2026-08-22: "short on the bottom, we need to see more
  of the bottom"), so the frame now takes the video's own aspect; native
  1272-wide source, so not 1600. The credit line reads `Video: Ezio Bartocci ·
  our post on LinkedIn ↗` and links RoboRacer's own post (Cedric, 2026-08-22). Post-card video:
  `join-openrobotics-post-960.mp4` 1.0 MB (960x540, 10 s of Open Robotics'
  post, Cedric's mid-session swap for the Foundation's own race-day post;
  poster 80 KB). The assembling clip runs at 2x (5.9 s) because `assembling_car.mp4` is 11.8 s
  (4x would give 3 s); Cedric moved it from the Learn row to the Build row
  ("we are literally building a car"), so Learn now carries the pit-work photo
  (`platform-learn-1200.webp`, ex Build) and the clip is `platform-build-960.mp4`.
- Ribbon: `.rr-marquee:has(a:focus-visible)` replaces `:focus-within`; proven
  with a pointer click on a logo (new tab closed, pointer moved off: running;
  Tab onto the link: paused).

## 13. Acceptance (director walks it from captures; one `/qa-page landing` after)

1. Headline scale reaches 1.30 as the last word lands; fades as one block over at
   least 0.28 of the pin; no vertical movement at any point.
2. Eleven highlight tiles changed per section 2; tile 6 carries the Thunderbolt
   caption; no tile shows a practice crawl or a crash; three events represented.
3. Next race plays Ezio's video in the 21/9 frame with credit and link, or the photo
   is still there and the report says why.
4. Car: wheels within one wheel width of the hubs at the hold pose; plate in the
   chosen accent; LiDAR band on top in all five captures; five callouts readable at
   1440, listed at 390.
5. Platform: hovering rows changes nothing; scrolling through the pinned section
   walks Build, Learn, Race, Research in order; Race and Research playback proven.
6. Map: full container width; regions tinted per the table; glows show the
   clusters (Northeast US, Central Europe, Korea and Japan); counters and header
   overlay ocean only; one violet pin.
7. Ribbon moves again after a logo click.
8. Join: four buttons with gradient glyphs (Instagram tagged `soon`), Korea photo, two
   community cards; nothing third-party loads before a click on the YouTube card.
9. `npm run lint`, `npm run build`, `/qa-page landing` PASS, `scripts/media.sh report
   public/media` shows only the hero and the next-race video above 1.5 MB.
10. Reduced motion and 390 px captures for every changed section.
