# QA: Start here fits one laptop screen (p3-start-fit, 2026-09-26)

Cedric's note (2026-09-26): "Ideally the Start here should be visible on a
laptop in the entire screen (which is why it's a good idea to stack 1/2 in the
same row). I'm not sure what's the best layout, but play around with it."

Target: the whole of section 00 (its top padding under the nav, the header,
the five ways in, its bottom padding) no taller than the window at 1366x650
and 1536x730. The section's top padding is the nav height plus 2rem (the
nav's "Start here" scrolls it to the top of the window), so "fits" means
section height <= window height, i.e. section height minus nav <= window
minus nav.

## Candidates (measured with Playwright, section scrolled to the top)

| Candidate | 1366x650 section | 1536x730 section | Clip frame at 1366 | Verdict |
|---|---|---|---|---|
| Baseline (p3-start-grid): header full width, five 16:10 tiles in one row | 610 (fits, 40 spare) | 650 (fits, 80 spare) | 248x155 | Already fits, but the header takes a full band and the clips are small |
| A: 3x2, header in the first cell, landscape tiles (picture 40% left, 16:10) | 416 (234 spare) | 444 | 164x103 | Pictures too small to read; the header (150 tall) is taller than the first row (119) and ran into Race; half the screen left empty |
| B: 2x3, header in the first cell, landscape tiles (picture 40%, 16:10), default padding | 670 (20 over) | 715 (fits) | 253x158 | Does not fit at 1366 |
| B': 2x3, picture 45% cropped to 16:9, row gap 1.25rem, bottom padding 4rem | 646 (4 spare) | 690 | 285x160 | Fits, but 4 px is no margin for browser chrome |
| **B'' (chosen)**: 2x3, picture 3/7 (43%) cropped to 16:9, row gap 1.25rem, bottom padding 4rem | **624 (26 spare)** | **665 (65 spare)** | **271x153** | Fits both with room; clips 9% wider than the baseline |

The one-row grid with a 16:9 crop and tighter type was not built: the
baseline already fits, and cropping it would only shrink the clips further
(248x140).

## What changed (src/components/ui/StartHere.tsx, landing grid only)

- From `desktop:` + `lg` (1024 up): two columns. The SectionHeader shares a
  wrapper grid cell with the list and is half the width; the list's first
  tile starts in column 2, so the header fills the empty first cell (a `ul`
  can only hold `li`, so the header cannot be one of the list's cells). The
  header is `relative z-10` so the list's box does not cover it.
- Each laptop tile is a grid of the clip frame (3fr, cropped to 16:9 via the
  wrapper, `aspect-video`) and the text (4fr): label, sentence, link pinned to
  the frame's foot. The 16:9 crop showed the build clip's encode edge (a 16px
  dark band on the right, 8px at the foot, found with ffmpeg cropdetect), so
  the laptop frame zooms its still and clip by 4%; the band is gone (pixel
  sample of the right edge: 184-190 luma, was dark).
- Section bottom padding on laptops: 4rem instead of section-tight (6rem at
  these widths). Highlights below keeps its tint, rule and 6rem top padding,
  so the boundary still reads.
- 1024 to 1279 used to be 3 + 2 on six columns (about 1,000 px tall at
  1024x768); it now takes the laptop layout too (511 px).
- Tablets (768, 2 + 2 + Sponsor across) and phones (thumb rows) unchanged.
- `src/pages/Styleguide.tsx`: the spec label describes the new grid.
- Merged revamp/polish-2 (the About branch that removed the `full`
  density); the conflict was resolved by keeping the deletions and the grid.

## Measurements of the chosen layout

| Viewport | Root | Nav | Section height / window | Tile (w x h) | Clip frame |
|---|---|---|---|---|---|
| 1366x650 | 12px | 64 | 624 / 650 fits | 648x153 | 271x153 |
| 1536x730 | 12.8px | 68 | 665 / 730 fits | 691x163 | 290x163 |
| 1440x900 | 12px | 64 | 624 / 900 | 648x153 | 271x153 |
| 1920x1080 | 16px | 85 | 831 / 1080 | 864x203 | 362x203 |
| 1024x768 | 12px | 64 | 511 / 768 | 485x113-119 | 201x113 |
| 768x1024 | 16px | 72 | 1393 (unchanged) | 348x389 / 348x363, Sponsor 720x218 | 348x218 |
| 390x844 | 16px | 72 | 1291 (unchanged) | 342 x 170-221 | thumb |
| 844x390 | 16px | 56 | 998 (unchanged) | 796 x 123-144 | thumb |

## Checks

| Check | Result |
|---|---|
| Clips | Fresh load: no platform mp4 before scrolling. At #start the three clips mount and play (`paused: false`, no controls) at every desktop viewport; phones request none |
| Reduced motion | 1366x650 and 390x844: no `<video>`, every still loaded, tiles at opacity 1 |
| Layout shift | CLS 0 while the section scrolls in and the clips arrive, all eight viewports |
| Keyboard | From the h2, five Tabs: Build the car, Start the course, Find the next race, Browse the research, Write to contact@roboracer.ai; each `:focus-visible` with the 2px violet ring on the tile-sized `::after` (648x153 at 1366), all eight viewports |
| axe on `/` | zero serious or critical, all eight viewports and both reduced runs |
| Console | zero errors, all runs |
| h1 | one |
| Lint / build | `npm run lint` clean; `npm run build` passes |
| Screenshots | `docs/qa/p3-start-fit/start-*.png` (git-ignored); 1366x650 reviewed by eye |

## Left open

- The fit at 1366x650 has 26 px to spare. A window shorter than about 624 px
  at that width (a second toolbar, a download bar) will cut the last row's
  foot. Tightening further would mean smaller clips.
- The build clip's dark encode edge would be better fixed by re-encoding
  `platform-build-960.mp4` and its poster with the 944x532 crop; the 4% zoom
  hides it here only.
