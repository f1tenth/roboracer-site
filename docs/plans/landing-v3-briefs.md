# Landing v3: builder briefs (director, 2026-08-21)

Contract: `docs/plans/landing-v3.md` (its "Drift check" section wins over the body).
Base: `revamp/integration` at the prep commit. Every builder works ONLY inside its
worktree `../roboracer-site-wt/v3-<name>` on branch `revamp/v3-<name>`; `git branch
--show-current` before every commit; never push; never touch a file outside the
ownership column; `npm run lint && npm run build` green before reporting. Screenshots
1440x900 and 390x844 with Playwright (python, CDP capture for WebGL pages; stitched
viewport walks for pinned sections, never full_page on a vh-pinned page). Facts only
from `.claude/skills/roboracer-content`; unknown facts are `TODO(content)`. Copy voice:
short, American, no em dashes, no exclamation marks. Accent rule: violet only as the
solid Button fill and hover underline; text never purple; gradient ONLY on the hero
line 1 (Cedric's exception) and the logo.

## A: hero + nav (`revamp/v3-hero-nav`, port 5181)

Owns `src/components/ui/HeroChapter.tsx` (new), `VideoHero.tsx`, `HeadlineReveal.tsx`,
`src/components/NavBar.tsx`, nav rules in `src/index.css`, `src/pages/Styleguide.tsx`.

1. `HeroChapter` per landing-v3 section 1, exactly: 320vh wrapper, sticky 100svh inner,
   one ScrollTrigger scrub 0.6, video under the nav, the p-schedule (0-0.08 video only;
   0.10-0.42 assemble, line 1 as one unit with the logo gradient `linear-gradient(90deg,
   #00D1DA 0%, #FC00FF 100%)` clipped to text, lines 2-3 word by word; 0.42-0.82 scale
   1 -> 1.30; 0.82-1.00 thrown upward y -> -120vh, stagger last line first, scale ->
   1.55, opacity -> 0 by 0.95; video brightness -> 0.12). Copy: "Autonomous racing" /
   "built and raced" / "in the open" (no comma). Type clamp(2.4rem, 8.5vw, 8.5rem),
   leading 0.95, tracking -0.03em, centered, white. Measure the blur cost in the
   Performance panel at 1440x900 and drop blur if > 4 ms/frame (document the number).
   Keep the pause control (hover/focus reveal, WCAG 2.2.2) and the 10 s idle cue.
   Reduced motion: poster + static headline on paper (today's HeadlineReveal layout).
   Weak device (`hardwareConcurrency < 4`) and no-JS: no pin. One h1 with `aria-label`
   = the full sentence; word spans `aria-hidden`. Props: `{ video: HeroVideoSources,
   lines: string[], as?: "h1" | "h2" }`.
2. Nav: transparent over the hero, filling in by the end of the chapter. `--nav-alpha`
   written by a ScrollTrigger `onUpdate` (Lenis drives scroll) = clamp(scrollY /
   (0.9 * innerHeight), 0, 1) on the landing only; fixed at 1 elsewhere (set it from
   `useLocation`). Background `rgb(251 251 253 / var(--nav-alpha))`, `backdrop-filter:
   blur(calc(var(--nav-alpha) * 12px))`, box-shadow only when alpha > 0.9. Logo: the
   white-gradient SVG and the black-gradient PNG stacked in one sized box, cross-faded
   by alpha. Link color via `color-mix(in oklab, var(--color-text-on-ink) calc((1 -
   alpha) * 100%), var(--color-text-strong))`; the CTA pill inverts the same way.
   Mobile menu unchanged in behavior, same transparency rule. Move the nav CSS you
   touch into `@layer components` (unlayered rules beat utilities; see index.css
   comments). Keep focus rings visible on both transparent and opaque states.
3. Replace the VideoHero + HeadlineReveal demos on /styleguide with a HeroChapter demo
   (`as="h2"`, styleguide keeps its sr-only h1) and remove the page's top padding on
   the styleguide too so the demo matches the landing. Delete `HeadlineReveal.tsx` and
   `VideoHero.tsx` if nothing imports them after your change (grep; Landing.tsx will be
   rewired by F, so leave Landing.tsx alone and tell F what to import).
4. Evidence: screenshots at p = 0, 0.25, 0.5, 0.7, 0.9, 1.0 at 1440 and 390 into
   `docs/qa/landing-v3/hero-*.png`; the blur measurement; a reduced-motion capture.
   Report: component API, final motion numbers, and anything you changed from the spec.

## B: the car (`revamp/v3-car`, port 5182)

Owns `src/components/ui/ExplodedModel.tsx`, `ExplodedModelScene.tsx`,
`src/components/RacecarAssembly.tsx`, `racecarMaterials.ts`, `racecarAssemblyData.ts`,
`src/pages/Assembly.tsx`, `src/pages/assembly.css`, `docs/design/CAR_CHAPTER.md`.

1. LiDAR first, as a diagnosis, not a guess. Render the LiDAR part alone (a throwaway
   route or a styleguide-free harness in your worktree is fine, delete it after) at yaw
   0/90/180/270 and screenshot each. Expected: Hokuyo upright, orange window ring near
   the top, cable exit at the rear (-X of the car). Compare: the part table (no
   rotation), the xacro (`base_to_laser_model` xyz only, no rpy; no visual origin), the
   GLB node (scale only) and the USD source at
   `/home/cedric/Documents/UPenn/xLAB/Roboracer/f1tenth_gym_ros/meshes/roboracer.usd`
   with `scripts/usd_to_mesh.py` in that repo. Also check whether the mesh's pivot sits
   at the sensor base or at its bounding-box center (a pivot offset makes the LiDAR
   orbit instead of spin when the group rotates, which reads as "the frame is wrong when
   rotating"), and whether the per-part `<primitive rotation>` is applied before or
   after the root `[-PI/2,0,0]`. Write the root cause, the evidence, and the fix in
   `docs/design/CAR_CHAPTER.md`. Fix in the part table (or a documented mesh re-export
   via `npm run sync:racecar` + gltf-transform meshopt, under 1.5 MB), verify visually.
2. Bigger: header above the grid at `text-display-m`; grid `md:grid-cols-[7fr_5fr]`;
   canvas `h-[72svh]`; camera rest distance so the car spans about 70% of the canvas
   width at 1440 (measure on a screenshot; report the number); keep the dolly-out on
   explosion so nothing crops at the ceiling. Mobile: canvas first, 56svh, captions
   below.
3. Look: remove the `#82878f` multiplier; per-material `envMapIntensity` (decks 0.5,
   aluminum 1.2), key directional at 35 degrees with a soft shadow, rim from behind-left
   at 0.6, ContactShadows 0.55, ACES exposure 1.15, no fog, no colored lights. Put a real
   photo of the car next to your render in the review screenshot (use any car photo
   from `_harvest/drive/2026-icra/Media/Felix Jahncke/` downscaled, local only) and
   tune until the render reads as the same object.
4. Photo slots: two 4/3 `MediaFrame`-style slots to the right of the canvas reading
   `/media/car/car-photo-01-1200.webp` and `-02-`; `onError` hides a missing slot (the
   files arrive from the media curator at integration; never a broken image). Mono
   captions; `loading="lazy"`, width/height set. Keep the `car-studio.webp` crossfade
   slot behavior.
5. `/assembly` gets the same materials, lighting and the LiDAR fix; every existing
   feature stays (slider, visibility, labels, wireframe, auto-rotate, reset, export).
6. Evidence: 1440 and 390 captures of the chapter at rest, mid, and ceiling, the four
   LiDAR yaw renders, and the render-vs-photo pair, in `docs/qa/landing-v3/car-*.png`.
   Report: root cause sentence, camera numbers, material table.

## C: map + community (`revamp/v3-map-community`, port 5183)

Owns `src/components/ui/WorldMapChapter.tsx` (new), `StatCounter.tsx`,
`CommunityJoin.tsx` (new), `scripts/build-world-map.mjs`, `data/events_map.source.json`,
`public/data/events_map.json`, `public/media/map/*`, `scripts/slack_stats.py`,
`.github/workflows/community-stats.yml`, `public/data/community.json`.

1. Verify venues before flipping `verified`. For every `verified: false` event, read the
   race site (past_races.json URL; `_harvest/wayback/racesites/`; or
   `_harvest/repos/<race-site repo>` once the org harvest has run in the media worktree,
   path `/home/cedric/Documents/UPenn/xLAB/Roboracer/roboracer-site/_harvest/repos`,
   read-only) and set city/lat/lng + `source`. Rules: never invent; a venue you cannot
   confirm stays unverified and renders hollow with "tbc"; `lat/lng 0,0` is skipped.
   Re-run `node scripts/build-world-map.mjs`. Keep a list of what stayed unverified and
   why for the closing report.
2. `WorldMapChapter` per section 6: 260vh wrapper, sticky inner, one ScrollTrigger
   scrub 0.6, ink surface. Left 7 cols map (the SVG via `?raw` import, `currentColor`
   on `text-text-on-ink`), right 5 cols: mono eyebrow "05 / Community", line "Teams from
   around the world", four StatCounters (90+ universities, 20+ countries, 1,000+
   publications, 30 competitions held), bound to progress. Phase 1 country discs
   (r 10, opacity 0.35, mono country name); phase 2 pins in chronological order with the
   city flashing in a mono label and a large mono counter 1 -> 30 in lockstep; upcoming
   pins last; IROS 2026 the only violet element (solid disc + pulsing ring); the counter
   ends on "31st coming up · Pittsburgh". Phase 3 hold. Pins are paper-white, hollow
   ring + "tbc" when unverified. Reduced motion: static map with every pin and the four
   numbers. Mobile: map on top (full width), numbers below, same pin schedule. Pins
   scale with the SVG (use the viewBox coordinates from events_map.json, `vector-effect:
   non-scaling-stroke`). Labels must not overlap at 1440 for the sanity set (Anchorage,
   Abu Dhabi, Rio, Jeju, Vienna, Pittsburgh); nudge with a per-event `labelDx/Dy` in the
   source file if needed.
3. `StatCounter`: two modes. Time mode (default): starts only when fully in view
   (`start: "bottom bottom"`, once), 3.2 s, `power2.out`, 0.15 s stagger via a `delay`
   prop. Progress mode: a `progress` prop in 0..1 (the chapter drives it from its
   ScrollTrigger; avoid a re-render per tick: accept a `progressRef` + a `tick()`
   callback or set text via ref). Final number in the markup from first render.
4. `CommunityJoin` per section 10 from `community.json` (`loadCommunity()` exists in
   `src/lib/data.ts`): title "Join 3,000+ people building and racing" with the live
   `members_display`; three mono stats (members, time zones, continents) + "updated
   <date>"; right: 4/3 photo `/media/join/join-icra2026-crowd-1200.webp` with
   `onError` fallback to a neutral frame (the file arrives at integration); buttons:
   primary "Join the Slack" (the Slack invite from the content skill), secondary
   "GitHub" (https://github.com/f1tenth), mono link contact@roboracer.ai. Section
   header "08 / Join". It is a self-contained section (uses `Section` +
   `SectionHeader`).
5. `scripts/slack_stats.py` + `.github/workflows/community-stats.yml`: read-only
   review; make sure the workflow is manual (`workflow_dispatch`) plus weekly, writes
   `community.json` with `"source": "slack-api"`, and skips cleanly without the token.
6. Evidence: captures at p = 0, 0.3, 0.6, 0.9 at 1440 and 390 in
   `docs/qa/landing-v3/map-*.png`, the reduced-motion capture, CommunityJoin at both
   widths. Report: component APIs, the unverified list, label nudges.

## D: media (`revamp/v3-media`, media-curator agent)

Owns `public/media/**` (new files), `public/data/highlights.json`,
`docs/ASSET_MANIFEST.md`, `docs/media/*`. No `src/` edits. Work inside
`../roboracer-site-wt/v3-media` (where `_harvest` is a symlink to the shared mirror).

1. Org harvest first: `gh auth status` is green; run `scripts/harvest-org-repos.sh`;
   then `gh repo list f1tenth --limit 500 --json name,isPrivate,url` and grep every
   cloned repo for a `CNAME` matching `*-race.*`; clone the race-site repos the pattern
   missed; inventory their `images/ img/ assets/` folders.
2. Inventory + contact sheets + scoring per the media-curator procedure
   (`docs/media/INVENTORY.md`, `docs/media/SELECTION.md` with scores). Tools: `ffmpeg`,
   `convert` (ImageMagick 6; `cwebp`/`magick` do NOT exist), PIL. HEIC: try `convert`;
   if it fails, skip HEIC.
3. Fill, in this order, with the reserved filenames from the landing-v3 drift section:
   highlights (7 clips 16/9 3-6 s 960 wide under 1.5 MB with posters under 120 KB;
   7-8 photos 3/2 1200 wide under 220 KB); race hero 21/9 1920 wide under 350 KB; two
   car close-ups 4/3; platform Build (buildCar.gif -> mp4 or an assembly photo), Learn
   (course/RViz frame), Race (head-to-head clip), Research (encode
   `_harvest/platform/multiple_opp_realistic.mp4`, 1920x1080 11.7 s, to 960 wide under
   1.5 MB + poster; cut to the best 6-8 s if needed); Join crowd 4/3; team squares
   800x800 for every team in `public/data/teams.json` the intro videos cover (slug rule
   in the drift section). `_harvest/drive/2026-iv/Photos` is empty: IV 2026 tiles stay
   placeholder and SELECTION.md says so.
4. `highlights.json`: every tile live except documented gaps; fields id, type, src,
   poster, caption (`<what> · <event, city>`), credit (`Photo: <name>`), event, href,
   aspect, status. Captions name events, not people, unless the results page confirms.
5. `scripts/media.sh report public/media` clean; commit on `revamp/v3-media`. Report:
   counts per slot, gaps, the three best frames (paths), the team slugs covered.

## E: papers (`revamp/v3-papers`, port 5185)

Owns `public/data/publications.json`, `data/publications.*.json`,
`scripts/paper_thumbs.py`, `public/media/research/*`, `docs/media/THUMBS.md`,
`src/components/ui/PublicationCard.tsx`, `src/pages/Research.tsx`.

1. `python3 scripts/discover_papers.py --days 720 --max 80` (follow the
   `/discover-papers` skill steps 1-3 but on this branch, no PR). Accept the clearly
   on-platform 2025-2026 papers with `resolve_paper.py --add`; reject noise into
   `publications.rejected.json`. Fix the two `year: 0` items (resolve or hide).
2. Featured set: 6, by recency then Semantic Scholar citations, nothing older than 2023
   except the pinned 2020 platform paper; `featured: true` only on those; order the
   JSON so the landing's first 3 are the strongest.
3. Thumbnails: patch `paper_thumbs.py` to use `convert`/PIL (no cwebp/magick here), run
   it, then LOOK at every WebP (Read the file) and replace any that is a blank page,
   a logo, or a wall of text with the page-1 crop; 1200x750 under 120 KB; record source
   and license per file in `docs/media/THUMBS.md` and a row each in
   `docs/ASSET_MANIFEST.md` (append only, under a "Research thumbnails" heading).
4. `PublicationCard`: optional 16/10 media slot on top (`thumbnail`, width/height 1200x750,
   lazy, `alt=""`), credit line "Figure: <first author> et al." under the card when a
   thumbnail exists; no thumbnail = today's card. Keep the hairline style.
5. `/research`: replace the live BibTeX fetch with `publications.json`: header with
   the 1,000+ message + Scholar CTA, TagFilter chips, featured grid with thumbnails,
   "All curated" list grouped by year with search, "Submit your paper" mailto. Paper
   surface, same primitives as the landing. `python3 scripts/validate-publications.py`
   green.
6. Evidence: 1440 and 390 captures of /research and of three cards with thumbnails in
   `docs/qa/landing-v3/papers-*.png`. Report: accepted list (id, year, venue), featured
   six with citation counts, rejected count, thumbnails replaced by hand.

## F: page (`revamp/v3-page`, director, port 5186)

Owns `src/pages/Landing.tsx`, `src/components/ui/Marquee.tsx`, `PlatformPanel.tsx`
(new), `Section.tsx`, `SectionHeader.tsx`, `src/lib/data.ts`, `public/data/teams.json`
(photo field at integration), integration of A-E, `docs/qa/landing-v3/*`.
