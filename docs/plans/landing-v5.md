# Landing v5 (session 8): Cedric's final touches on v4, traced to code

Status: contract. Supersedes `landing-v4.md` where they differ; everything not
mentioned here stays as v4 shipped (`323093f`). Director owns this file and records
the final numbers in section 9 when the session ends.

Cedric's verdict on v4: "genuinely impressive, the results are now really really good."
This is his list of final touches on the landing before the other pages start. Two
remarks needed a rendered spec; they are in `docs/design/` and the streams copy the
values literally, the way the map spec was handled in v4:

- `docs/design/map-ticker-spec.svg` (section 3)
- `docs/design/research-carousel-spec.svg` (section 5)
- `docs/design/partner-tint-preview.png` + `scripts/partner-tint.py` (section 7)

## 0. Session rules (same as v4, plus the map)

- First line of the session is `/taskmap`. Map: milestones = the five streams below,
  chunks = this contract's sections, steps = the concrete changes. Blocked only when a
  human answer is truly required; otherwise decide, note it in the step, list it in
  the final report. Cedric watches http://localhost:4242 and may drop feedback or add
  tasks there mid-run: read the inbox at every checkpoint (after each stream's first
  round, before QA, before the report). The site dev server is Cedric's own Vite on
  5173, never on 4242.
- Four streams plus the director, disjoint ownership (section 8). Builders read only
  the files they own, their section here, `CLAUDE.md`, and the spec file named in
  their section. No skill browsing, no repo tours, no media files into context
  (contact sheets and review JPGs only).
- No `/impeccable`, no superpowers planning. One `/qa-page landing` at the end; the
  director walks section 10 from the builders' captures.
- Captures: at most 6 per builder (1440x900 and 390x844, changed sections only), at
  most 12 for the director. Playback proven by two captures 1.5 s apart that differ.
- Two review rounds per stream, then stop and report what is left. No loops.
- `_harvest/` stays out of git; never `git add -A` from a worktree.
- Accent rule update (Cedric, this pass): two new accepted exceptions, both slight:
  the cyan highlight under the active platform title (section 6.2) and the
  cyan-to-magenta cast on the partner logos at rest (section 7). Nothing else changes:
  buttons solid violet, magenta nowhere else.

## 1. Director pre-work (before the worktrees branch)

1. `src/lib/data.ts`: add `number?: number` to `MapEvent`; `image_rest?: string` and
   `image_hover?: string` to `Partner`; `figure?: string` and `featured_order?: number`
   to `Publication`. Nobody else edits `data.ts` this session.
2. Run `python3 scripts/partner-tint.py` once (writes `public/partners/tint/*.webp`,
   `public/partners/color/*.webp`, and the two fields into `partners.json`). Check
   `public/partners/tint/clemson.webp` against row "strength 0.04" of the preview PNG.
3. Commit both on `revamp/integration`, then branch the four worktrees from it.

## 2. Stream A, media-curator (`@media-curator`, Fable high)

Cedric's folder is at `_harvest/cedric-media/` (symlink to
`roboracer-site-wt/media-from-cedric`). Files he named, exact names:
`ICRA26_Group_Replacae.JPG`, `UPennAutonomousRacingTeam.jpeg`,
`UnicornRacingTeamPic.jpg`, `AI_Generated_Car_ICRA26.png`, and a LaMar team photo
(find it by name in the folder; report the file name). Budgets as v4: photos 1200 px
WebP under 220 KB, team photos 800 px WebP under 120 KB.

| # | change | file / data |
|---|---|---|
| A1 | Highlights tile 9 (`icra2026-group`, "group photo · ICRA 2026, Vienna"): replace the image with `ICRA26_Group_Replacae.JPG`; same id, same caption | `highlights.json` src, new `/media/highlights/highlight-icra2026-group-02-1200.webp` |
| A2 | Captions, exact strings, nothing else in the object changes: tile 2 `icra2026-headtohead` "corner overtake · ICRA 2025, Atlanta"; tile 3 `icra2026-overtake-01` "bumping and tuning during practice · ICRA 2026, Vienna"; tile 4 `icra2026-grid-01` "start line · ICRA 2025, Atlanta"; tile 5 `icra2026-start-01` "Ready, Set, Go! · ICRA 2025, Atlanta"; tile 6 `icra2026-corner-01` "riding the corner at speed · ICRA 2026, Vienna"; tile 1 `iv2026-lap` "1st UPenn Autonomous Racing · IV 2026, Detroit" | `highlights.json` |
| A3 | `credit` fields stay in the JSON for the record; the director stops rendering them on tiles (section 6.4). Do not delete them | none |
| A4 | Teams: delete the `Thunderbolt` entry; the `UPenn Autonomous Racing` entry takes its IV 2026 highlight first ("1st place, driver Cedric Hollande, MPPI controller", event "IV 2026 (Detroit)"), keeps its two ICRA 2026 results, gets `photo` from `UPennAutonomousRacingTeam.jpeg` as `media/team/team-upenn-autonomous-racing-800.webp` (Cedric supplied the photo, which is the OK the v4 hand-off was waiting for; replace the held-back file of the same name if it exists). Source note: Cedric, 2026-08-22, Thunderbolt and UPenn Autonomous Racing are the same team | `teams.json`, `public/media/team/` |
| A5 | Teams: rename `VAUL 2` to `VAUL` (Cedric: one lab that split into two cars); keep results, photo and source; add to the source note that VAUL 1 is the same lab | `teams.json` |
| A6 | Teams: `UNICORN_Racing` gets `photo` from `UnicornRacingTeamPic.jpg`; `LAMARRacing` gets `photo` from the LaMar file | `teams.json`, `public/media/team/` |
| A7 | Teams: the grid is 2x5 on lg and now has 9 entries; add one more verified team from the ICRA 2026 or IV 2026 results page (next placing not yet listed), `status: verify`, source URL, like the others | `teams.json` |
| A8 | Team photos for every cell still without one (Cedric: "we need pics of the teams"): his folder first, then `_harvest/drive/2026-icra/Media` (the 18 team intro videos: best still frame of the team with the car; the Felix Jahncke DSLR set: team at its pit table or on the podium), then `_harvest/drive/2026-iv`. Organizer media with credit in the manifest. Report every cell still without a photo and why | `teams.json`, `public/media/team/`, `docs/ASSET_MANIFEST.md` |
| A9 | Car chapter photo 2: `AI_Generated_Car_ICRA26.png` encoded to `/media/car/car-photo-02-1200.webp` (replace), long side 1200; tell the director its aspect ratio (the slot is 16/10 today; a portrait image may need the frame changed, section 6.3). Manifest row: AI-generated image supplied by Cedric, no photographer credit | `public/media/car/`, manifest |
| A10 | Open Robotics logo for the Join post card: their current wordmark or glyph from openrobotics.org (brand page or press kit), saved as `/media/join/openrobotics-logo.svg` if vector, else 256 px WebP; manifest row with the source URL. Also find the Open Robotics LinkedIn page URL from the post itself (`post_url` in `community.json`) and write it as `author_url` | `public/media/join/`, `community.json` author_url, manifest |

Report: the mapping table (file -> slot -> result), the aspect ratio of A9, the LaMar
file name, the team added in A7, and every team cell still without a photo.

## 3. Stream B, map (Fable high): competition ticker, chronological reveal, counter sync

Spec: `docs/design/map-ticker-spec.svg`; copy its values literally. Owns
`WorldMapChapter.tsx`, `StatCounter.tsx`, `scripts/build-world-map.mjs`,
`data/events_map.source.json`, `public/data/events_map.json`, `public/media/map/**`.

Cedric: "on the right side the competitions (competition number, place, conference)
appear one at a time as we scroll" and "the numbers below should be synced to end when
the countries end (same for the races on the right)".

1. Data first (facts rule, `CLAUDE.md`): every `kind: race` entry gets `number`, the
   official "Nth" from f1tenth.github.io/race.html and the race sites. The first five
   are the 2016-2019 races in order; the 6th is absent from the source file (find it,
   add it as a pin if it existed, say where you read it); `iv2025` and `cdc2025` both
   carry 25 (ICRA 2026 is the 27th, so one of them is the 26th). Anything you cannot
   verify: omit `number`, list it in the report. Rebuild `events_map.json`. The
   ticker shows the numbered series only; unnumbered race pins and the madgames,
   workshop and course pins still pop on the map.
2. Order: replace `radialTiming` with array order (the source is chronological, its
   `_readme` already says "the chapter animates them in array order"). Pin i of N pops
   at `0.06 + (0.82 - 0.06 - 0.03) * i / (N - 1)`; a region tints at its first pin as
   now; partner-only regions spread evenly over 0.40-0.79, no tail after the last
   pin. Delete the haversine and `RADIAL_EASE`. Philadelphia stays the one filled
   marker; pin, glow, label and region styling unchanged.
3. Sync: counters j = 0..3 start at `0.06 + j * 0.015` and all end at 0.82, the frame
   the last pin (IROS 2026) finishes popping (`duration_j = 0.82 - start_j`). The
   "competitions held" counter gets suffix "+" (Cedric: "it's 30+ competitions").
4. Ticker: at xl (>= 1280) a 280 px column right of the map, gap 40, items-center;
   the map cell is `min(var(--map-max), 100%)`. Block, type sizes, colours, swap
   timing exactly as the spec. It shows the latest numbered race whose pop is past
   its midpoint (the flash rule today), final state "31st · IROS 2026 · Pittsburgh ·
   upcoming". Below xl no column; the header flash line stays and shows the same
   three parts joined by " · ". Reduced motion: final state. Keep the sr-only venue
   list.
5. Captures: 1440x900 at p 0.06, 0.30, 0.60, 0.82 and 1.0 of the chapter (the last
   two must be identical except the ticker), 390x844 final state.

Report: the number table (id -> number -> source), the 6th race finding, the ticker
string for every numbered entry.

## 4. Stream C1, papers (content, Fable high): eight featured papers with real figures

Owns `public/data/publications.json`, `public/media/research/**`,
`scripts/paper_thumbs.py`, `docs/media/THUMBS.md`, `scripts/resolve_paper.py` if
abstracts need fetching. Cedric: "like 8 publications", "get some better papers in
there", "visual, one of the main figures along with the abstract".

1. Extend `scripts/paper_thumbs.py`: `--figure <n>` (the nth `<figure>` raster in the
   arXiv HTML, not only the first), `--size 1600` (1600 px wide WebP under 200 KB,
   written to the `figure` field; `thumbnail` stays for /research). Page-1 crops are
   not figures and never go in the eight.
2. Pick eight, `featured_order` 1..8, each with a real figure and an `abstract`
   (verbatim from arXiv or OpenAlex; fill the field where missing, record the source).
   Criteria: recent (2024+) except the platform anchor, recognised venues, a
   spread of tags (platform, race stack, RL sim-to-real, planning, control, limits,
   multi-agent, safety), a figure that reads at 480 px: an overview, a track with
   trajectories, a car. Start from this list and confirm each figure by eye on a
   contact sheet: `okelly-2020-f1tenth` (anchor; find the system or gym figure in the
   PMLR PDF, crop the figure region, not the page), `baumann-2024-forzaeth`,
   `ghignone-2025-rlpp`, `li-2025-data`, `elgouhary-2026-learning`,
   `piccinini-2026-trajectory`, `trumpp-2024-racemop` or `chandra-2025-deadlock`,
   `kalaria-2025-disturbance`. Swap any whose figure disappoints; say which and why.
3. The six current `featured` papers keep `featured: true` for /research; the landing
   reads `featured_order` only.
4. `docs/media/THUMBS.md`: one row per new figure file (source URL, licence, bytes,
   review note), as the existing rows.

Report: the eight (id, venue, figure source, abstract source), a contact sheet of the
eight figures at 480 px, and anything rejected.

## 5. Stream C2, carousel (component, Fable high): `ui/ResearchCarousel.tsx`

Spec: `docs/design/research-carousel-spec.svg`; copy its values literally. Owns the
new `src/components/ui/ResearchCarousel.tsx` and `src/lib/publications.ts` (additive
helpers only; `PublicationCard.tsx` is untouched, /research keeps using it).

Props: `items: Publication[]` (already sorted by `featured_order`), `tagLabels`. Build
against the current data (it renders N items, 8 expected); C1 lands the eight in
parallel. Stage, thumbs, timer, strip, swap, a11y, under-md and reduced-motion
behaviour exactly as the spec's notes. Timer is a `requestAnimationFrame` loop with
a start timestamp, paused by pointer-over, focus-within, out-of-view (IntersectionObserver,
threshold 0.5) and `visibilitychange`; no `setInterval`. Nothing third-party, no
new dependency. Captures: 1440x900 at paper 1, mid-swap, paper 3 with the strip at
about 60 percent; 390x844.

Report: the component API, the capture set, anything in the spec you changed and why.

## 6. Director (Fable max): `Landing.tsx`, `HeroChapter.tsx`, `PlatformPanel.tsx`, `CommunityJoin.tsx`, `HighlightReel.tsx`, `ExplodedModel.tsx` (photo slot only), `index.css`, `partners.json`, `data.ts`, this file

### 6.1 Hero fade (`HeroChapter.tsx`)
Cedric: "the 'autonomous racing' text still fades too quickly, it should barely fade
until it is barely gone; go halfway of what we are doing right now." One line:
`fade: { start: 0.76, end: 1.0, ease: "power2.inOut" }` (hold becomes 0.42-0.76).
Result: opacity 0.91 at 0.81, 0.50 at 0.88, 0.10 at 0.945, 0 at the release (v4 was
0.50 at 0.81). Nav fill 0.72-0.95 and the video dim 0.84-1.00 unchanged. Update the
schedule comment.

### 6.2 Platform title highlight (`PlatformPanel.tsx`)
Cedric: "the titles Build, Learn, Race, Research themselves have a very slight cyan
highlight as they are being gone over." A highlighter band behind the lit title only
(md and up, motion OK): wrap `{row.title}` in `relative inline-block`; behind it an
`absolute left-0 right-0 bottom-[0.08em] h-[0.42em]` span, background
`color-mix(in oklab, var(--color-rr-cyan) 16%, transparent)`, `origin-left`. On
activation: `scale-x-0 -> 1` over `var(--duration-base)` `var(--ease-out-expo)`
(the band sweeps in from the left as the band of scroll reaches the row). On
deactivation: opacity 1 -> 0 over `var(--duration-fast)`, transform untouched until
the next activation resets it. Text stays above the band (the title span is
`relative`). Under md and reduced motion: no band. Nothing else on the tile changes
(violet cloud stays).

### 6.3 Car chapter photos (`Landing.tsx` `CAR_PHOTOS`, `ExplodedModel.tsx` slot if the aspect changes)
Photo 1 caption "taking the bridge · ICRA 2026", credit kept. Photo 2: src stays
`/media/car/car-photo-02-1200.webp` (A9 replaces the file), alt "Portrait view of a
RoboRacer car at ICRA 2026", caption "portrait view · ICRA 2026", no credit line. If
A9 reports a portrait ratio, give the second slot that ratio (both slots may differ;
keep the column width).

### 6.4 Highlights (`Landing.tsx`, `HighlightReel.tsx`)
Lead line: "30+ competitions since 2016. Podiums, overtakes, packed exhibition halls."
Tiles: stop rendering `item.credit` (line 121); credits stay in the JSON and the
manifest (Cedric: "we don't need to know who the videos come from"). Photos lose the
credit line too, for one rule.

### 6.5 Partner ribbon (`Landing.tsx` marquee block, `index.css` if a utility is needed)
Cedric: 1.5x, and the logos get a slight cyan-to-magenta cast (section 7). md and up:
link `md:h-[168px]`, inner `md:h-[120px]`, img `md:max-h-[120px] md:max-w-[336px]`,
`gap-24 pr-24`, duration 55 -> 82 s (same px/s). Under md unchanged. Each link
renders two stacked images: `image_rest` (the tinted file) at rest and `image_hover`
(the colour file) absolutely over it at opacity 0, `group-hover` and
`group-focus-visible` to opacity 100 over `var(--duration-fast)`; drop the
`grayscale` classes. The `:has(a:focus-visible)` pause stays. The hover pill stays.

### 6.6 Join post card (`CommunityJoin.tsx`)
Cedric: "add the Open Robotics logo when we show the featured post, people will
recognise the logo." In `PostCard`, a 28 px logo (A10's file) left of the author
line, `rounded-card`, in colour (it is their mark, not a partner logo), with the
author name linking `author_url` (A10). Alt text "Open Robotics". Nothing else on the
card moves.

### 6.7 Research section (`Landing.tsx`)
Replace the three-card `Reveal` grid with `<ResearchCarousel items=... tagLabels=... />`
where `items` = published papers with `featured_order`, sorted ascending; lead copy
"A Google Scholar search for the platform returns more than a thousand results. Eight
of the papers we feature:". Until C1 lands, the carousel shows whatever has
`featured_order` (may be zero items: render the header and an empty stage, never
hide the section).

### 6.8 Integration
Merge A, B, C1, C2 in that order; resolve nothing by hand in a builder's file (send it
back for round two instead). Fill section 9. Run `/qa-page landing` once.

## 7. Partner tint recipe (reference, already decided)

`scripts/partner-tint.py`, strength 0.04, chosen from
`docs/design/partner-tint-preview.png` (row "strength 0.04"). Luminance-preserving:
OKLCH hue sweeps 195 (cyan) to 330 (magenta) across each logo's width, chroma flat
across dark marks and mid greys and zero at black and white, so white backgrounds stay
white. Rest asset `public/partners/tint/<stem>.webp`, hover asset
`public/partners/color/<stem>.webp`, both at 2x of the 120 px cell. The script writes
`image_rest` and `image_hover` into `partners.json`. Re-run it if a logo changes; never
hand-edit the outputs.

## 8. Ownership (disjoint; `Landing.tsx` is the director's)

| stream | owns | model |
|---|---|---|
| director | `Landing.tsx`, `HeroChapter.tsx`, `PlatformPanel.tsx`, `CommunityJoin.tsx`, `HighlightReel.tsx`, `ExplodedModel.tsx` (photo slot), `index.css`, `partners.json`, `src/lib/data.ts`, this file | Fable, max |
| A media-curator | `highlights.json`, `teams.json`, `community.json`, `public/media/highlights/**`, `public/media/team/**`, `public/media/car/**`, `public/media/join/**`, `docs/media/INTAKE.md`, `docs/ASSET_MANIFEST.md` | Fable, high |
| B map | `WorldMapChapter.tsx`, `StatCounter.tsx`, `scripts/build-world-map.mjs`, `data/events_map.source.json`, `public/data/events_map.json`, `public/media/map/**` | Fable, high |
| C1 papers | `public/data/publications.json`, `public/media/research/**`, `scripts/paper_thumbs.py`, `scripts/resolve_paper.py`, `docs/media/THUMBS.md` | Fable, high |
| C2 carousel | new `ui/ResearchCarousel.tsx`, `src/lib/publications.ts` (additive) | Fable, high |

A never touches `src/`. C2 never touches `publications.json`. `data.ts` changes are
done in section 1 before the worktrees exist; a builder who needs another field asks
the director in its report.

## 9. Final numbers (director, 2026-08-22)

- Hero: the 6.1 fade (start 0.76) shipped first, then Cedric's third note moved it
  off the pin entirely: the headline holds through p 1.0 and fades on the
  scroll-out trigger (`bottom bottom` -> `bottom top`), q 0.2-1.0 power2.inOut,
  measured 1.00 at q 0.2, 0.94 at 0.4, 0.50 at 0.6, 0.06 at 0.8, 0 at 1.0; the
  footage dims 0.38 -> 0.12 over q 0-0.6. New in the session: a five-clip cycle
  with 0.9 s crossfades (IV 0-5 s once, race 2:29-2:40, 1:04-1:17, 1:21-1:27, IV
  6 s-end, then from the first race cut); order and playback verified. Clip
  encodes: desktop 36 MB (race 1920x1080 30 fps CRF 22, IV 1280x720 CRF 20),
  mobile 960 15 MB; not committed (hosting decision pending, n72).
- Platform highlight: the 6.2 band shipped, then replaced on Cedric's note by
  neon letters: overlay text `color-mix(cyan 60%, ink)` = #217983 (4.9:1 on
  paper) under a cyan glow, revealed left to right by clip-path over
  `--duration-base`, the lit title scaled 1.2 (transform, origin left); dim
  titles plain, size 1; nothing under md or reduced motion.
- Car photo 2 aspect: source 1376x768 (16/9), encoded 1200x670; slot kept at
  4/3 with a centre crop (the car sits lower-middle); `CarPhoto.aspect` exists
  if a 16/9 frame is preferred. Captions and credits as 6.3.
- Ribbon: link 168 px, logos 120 px tall at md+ (max-w 336), gap 96 px, 82 s
  loop at md+ (55 s under md via `Marquee.durationMd`), tinted rest file +
  colour hover file from `scripts/partner-tint.py` at strength 0.04 (20 + 20
  WebPs, 436 + 468 KB).
- Map: 25 of 33 race pins numbered (1-5 by the series' own count, 7-12, 14,
  15, 17-31; techfest2025 = 26th from the AutoDRIVE page); omitted: 6th (not
  found anywhere: Wayback, org repos, Discourse, CPS-IoT 2020 site), 13th
  (iv2023, by elimination only), 16th, germany2022, esweek2022, the four Korea
  championships, cdc2025 (cancelled per cdc2025.ieeecss.org; set `virtual`,
  TODO(content)). Schedule: pin i of 33 at 0.06 + 0.73 i/32, last pin done at
  0.82; counters start 0.06 + 0.015 j, all end 0.82; "30+ competitions held".
  Ticker column 280 px at 1440 and 1920 (map cell 1072 / 1432 px).
- Research: okelly-2020-f1tenth, baumann-2024-forzaeth, piccinini-2026-trajectory,
  li-2025-data, elgouhary-2026-learning, ghignone-2025-rlpp, trumpp-2024-racemop,
  feng-2025-bridging (kalaria swapped out: no figure that reads at 480 px);
  timer 8 s rAF with pointer/focus-visible/50 %-view/hidden-tab pauses;
  figures 1600x1000 WebP 31-94 KB (all under the 200 KB budget).
- Teams: 10 entries, 7 with photos (UPenn Autonomous Racing, LAMARRacing,
  UNICORN_Racing, VAUL, ForzaETH, UBM-Atlas, Brake Check Buddies); 404 Racers,
  West Virginia University and UBM-Tom have no usable source photo; the team
  added is Brake Check Buddies (2nd, Classic Cup, ICRA 2026, status verify).
- Join: `/media/join/openrobotics-logo.svg` (press-kit vector, 3.9 KB),
  author_url https://www.linkedin.com/company/open-source-robotics-foundation
  (`author_logo` added to JoinPost).
- Car chapter (Cedric's mid-run notes): callouts open k/7 through the
  explosion, pin 220vh with the hold from p 0.55, plate floor 0.08, 1800
  container with an 8/4 split (canvas 901x648 at 1440, FILL 0.92), labels
  portal into the canvas cell; first load: chunk + models + HDR warmed at idle,
  HDR served locally at 512x256 (414 KB).
- QA: see docs/qa/landing.md (run once at the end of the session).

## 10. Acceptance (director walks it from captures; one `/qa-page landing` after)

1. Hero: headline opacity about 0.9 at p 0.81 and about 0.5 at 0.88; no movement.
2. Highlights: tile 9 is the new group photo; the six captions read exactly as A2;
   no tile shows a credit; lead says "30+".
3. Car: photo 2 is the new image with the "portrait view · ICRA 2026" caption, no
   credit; photo 1 says "taking the bridge · ICRA 2026".
4. Platform: the lit title carries the cyan band, swept in from the left; the dim
   titles carry none; hover changes nothing.
5. Map: pins pop in chronological order; the ticker column is present at 1440 and
   absent at 1024; the ticker reads "1st · ESWeek 2016 · Pittsburgh" first and
   "31st · IROS 2026 · Pittsburgh · upcoming" last; all four counters finish on the
   same frame as the last pin; "30+ competitions held".
6. Ribbon: logos 120 px tall at md and up; tinted at rest, colour on hover; the
   ribbon moves again after a logo click.
7. Teams: no "Thunderbolt", no "VAUL 2"; UPenn Autonomous Racing shows the IV 2026
   win first and its photo; UNICORN and LAMAR have photos; 10 cells.
8. Research: eight papers rotate every 8 s with the strip filling; prev and next
   figures peek; hover pauses; arrows work; nothing moves under reduced motion.
9. Join: Open Robotics logo on the post card, author name links their page.
10. `npm run lint`, `npm run build`, `/qa-page landing` PASS; `scripts/media.sh report
    public/media` shows only the hero and the next-race video above 1.5 MB; reduced
    motion and 390 px captures for every changed section.

## 11. Round two (Cedric's second review, 2026-08-22; director)

All on `revamp/integration`, each item one commit:

- Credits: no "Photo:" / "Video:" line rendered anywhere; data and manifest keep them.
- Car photos: photo 1 = `startline_eth.png` (4/3 crop, ForzaETH in front); photo 2
  anchored right (`object-position: 100% 50%`).
- Platform: lit tile content scales 1.2 from its column edge (index, title, body,
  link); the title letters take cyan mixed 30% into ink, revealed left to right,
  no glow, no band.
- Map ticker: a wheel, the current race centred, +-1 / +-2 rows at 0.72 / 0.5 scale
  and 0.42 / 0.16 opacity, 104 / 172 px steps, 0.45 s roll.
- Research: expanding strip (the coverflow draft from stream C3 was merged then
  reworked): one full-width row, the active paper takes the row minus the side
  strips (clamp(72px, 6vw, 120px) each) at 560 px, the others 440 px, 700 ms
  in-out width/height moves, 6 s rAF timer, pauses only on pointer-over-the-card,
  focus-visible, hidden tab, fully out of view. Research Section full-bleed.
- LiDAR explosion 0.22 (was 0.14), hold target y 0.115, FILL 0.90; callout labels
  portal into the canvas cell. "Loading CAD model…" until the parts resolve.
- Join: full-bleed marquee of 12 post cards (featured + 11 LinkedIn posts, posters
  only, 4/3 media on every card, wordmark at 56 px), the ICRA 2025 reel as a
  full-width highlight, Instagram live.
- Teams: UBM-Tom/Atlas merged, Scuderia Segfault added, ForzaETH site + photo,
  404 Racers, WVU, UNICORN (closer), VAUL (Cedric's new picture) photos; all ten
  cells have a photo.
- Next race: after the map chapter, 1800 wide, video left / registration right,
  title "Come to our next race", headline "IROS 2026, Pittsburgh", dates under it;
  sections renumbered 02 car, 03 platform, 04 community, 05 next race.
- Hero: scroll-out fade q 0.22-0.62 (timeline pinned to length 1); after the clip
  cycle returns to the IV clip, a 2.6 s glide to p 0.46 one second in, once,
  cancelled by any input; a failed clip falls back to the committed loop.
- /assembly: focus mode (selected part in colour, the rest grey at 0.38 opacity),
  hide toggles removed.
- Open: hero clip hosting (36 MB desktop + 15 MB mobile at max quality, n72).
