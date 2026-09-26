# QA: Start here grid (p3-start-grid, 2026-09-26)

Cedric's note (2026-09-26): the landing's "00 Start here" should play its
clips the way /about does, and stop leaving the left half empty on a laptop.

## What changed

- `src/components/ui/StartHere.tsx`, compact density only (the landing).
  The header (00, "Start here", the one line) now runs full width with the
  default SectionHeader margin, like every other landing section. The old 5/7
  split with its sticky header is gone. Below it the five ways in form a
  grid of tiles from `desktop:` (at least 48rem wide and 34rem tall). Each
  tile is /about's clip frame (`FullMedia`: the still first, the muted
  looping clip mounting within 200px of the viewport and playing only while
  on screen, the still under reduced motion or if the clip fails, no
  controls), then the "01 Build" label, the sentence, and the link pinned to
  the tile's foot so a row's links line up. The link's `::after` stretches
  over the tile, so the whole tile is one link and the focus ring goes
  around it.
- Phones in either orientation (`compact:`) keep the stacked rows with the
  480x300 thumbs. Each tile carries both media copies, and the one hidden at
  a given size is `display: none`, so its lazy image and observed clip are
  never requested.
- No captions on the tiles: the tile is one link, and five caption lines
  under five pictures get noisy. /about keeps its captions.
- Learn and Sponsor have photos only in `paths.json`, so they show their
  still. Only Build, Race and Research have clips: 0.54 + 0.75 + 1.29 MB,
  2.57 MB in total.
- `src/pages/Styleguide.tsx`: the compact spec label and comment now describe
  the grid.

## Grid per viewport (measured, tile width x height)

| Viewport | Root | Arrangement | Tiles |
|---|---|---|---|
| 1920x1080 | 16px | 5 across | 331x386 px (20.7rem) |
| 1536x730 | 12.8px | 5 across, whole section in the first screen (tiles end at y 573) | 265x309 px (20.7rem) |
| 1366x650 | 12px | 5 across | 248x289 px (20.7rem) |
| 1180x800 | | 3 + 2 on six columns | 369x346, then 563x467 |
| 1024x768 | | 3 + 2 on six columns | 317x332, then 485x418 |
| 768x1024 | 16px | 2 + 2, then Sponsor across both columns with its picture beside the text | 348x389 / 348x363, Sponsor 720x218 |
| 844x390 | 16px | stacked thumb rows (not `desktop:`, too short) | 796 wide, 123 to 144 tall |
| 390x844 | 16px | stacked thumb rows, unchanged | 342 wide, 170 to 221 tall |

From lg up there is no empty column: at 1536 the header's left edge and the
first tile's both sit at x 67, and the last tile ends at the page edge.

## Checks

| Check | Result |
|---|---|
| Screenshots | `docs/qa/p3-start-grid/start-{1536x730,1366x650,1920x1080,768x1024,390x844,844x390,1180x800,1024x768}.png`, `reduced-1536x730.png` (git-ignored). 1536 and 768 reviewed by eye. |
| Clip requests | fresh load of `/` at every desktop viewport: no platform mp4 in the first 2.5 s at the top. After scrolling to #start the three clips load and play (`paused: false`, readyState 4, `controls: false`). Phones: no clips requested. |
| Reduced motion | 1536 and 390: zero mp4 requests, no `<video>` created, every still loaded, tiles at opacity 1 |
| Layout shift | 0 while the section scrolls in and the clips arrive, at all six viewports (the still holds the 16/10 box) |
| Keyboard | from the h2, five Tabs land on Build the car, Start the course, Find the next race, Browse the research, Write to contact@roboracer.ai. Each is `:focus-visible` with the violet 2px ring on the tile-sized `::after`, at all six viewports |
| axe on `/` | zero serious or critical at all six viewports |
| Console | zero errors at all six viewports, with and without reduced motion |
| h1 | one |
| /about | Start here row boxes at 1536x730 and 390x844 are identical before and after (position, size, class) |
| Lint / build | `npm run lint` clean; `npm run build` passes |

## Left open

- Nothing blocking. Cedric may want captions on the tiles after all. They
  would fit as one mono line under the picture at 20rem, but they would sit
  inside the tile's link.
