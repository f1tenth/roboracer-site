# QA: /about intro, Start here once (p3-about-intro, 2026-09-26)

Cedric's note (2026-09-26): a massive gap between the /about title and the
longer description; the /about "Start here" repeats the landing's, so have
it only once, on the landing.

## What changed

- **/about 01 What RoboRacer is** (subtitle "One open car for teaching,
  research and racing"): a plain `<Section>` + `SectionHeader` like 02 to 06,
  the story paragraph (Behl link) and the scale paragraph in 7 columns, the
  ICRA group photo (2:1 crop) in 5. The copy is top-aligned (`md:items-start`)
  instead of centred beside the photo, which was the gap. One ghost link,
  "Start here on the home page", to `/#start`: under the copy beside the photo
  from md (the photo spans two rows, the second `1fr`), under the photo on
  phones. No tiles, no rows. 02 People to 06 Join keep their numbers.
- **`ui/StartHere.tsx`**: the `full` density is gone with its row (`FullRow`),
  the `density`, `subtitle` and `intro` props, and the /about phone-thumb and
  scroll-margin logic. The clip frame stays (renamed `ClipFrame`, the tile
  uses it); `CompactTile` is `PathTile`. The landing grid renders the same.
- **Data**: nothing reads `detail` any more, so it is dropped from
  `paths.json`, the bundled copy and `EntryPath`. `caption` is no longer
  rendered anywhere; it stays in `paths.json` for the record (like `credit`),
  optional in `PathMedia`, and is no longer required by the reader.
- **Nav**: `startHrefFor` and `ABOUT_START_ID` are gone; the bar's three
  "Start here" links use `START_HREF` (`/#start`) on every route.
- `/styleguide` shows only the landing grid. HANDOFF rows for `/` and
  `/about` and the iteration-3 summary updated; Landing and data comments
  updated.

## Checks

Header-to-first-paragraph distance (header box bottom to the story
paragraph's top, after the reveal), against the header's own bottom margin,
which is the gap every other /about section has (People measured the same):

| Viewport | Header margin | Before | After |
|---|---|---|---|
| 1536x730 | 38 px | 122 px | 38 px |
| 1366x650 | 36 px | 105 px | 36 px |
| 1920x1080 | 48 px | 152 px | 48 px |
| 768x1024 | 48 px | 48 px | 48 px |
| 390x844 | 32 px | 32 px | 32 px |
| 844x390 | 32 px | 32 px | 32 px |

| Check | Result |
|---|---|
| Landing `#start` unchanged | outerHTML (useId ids normalised) and the rects of all 81 header/tile elements identical before and after at 1536x730 and 390x844 |
| h1 on /about | one, every viewport |
| Console errors | none on /about at the six viewports, none on the jumps |
| axe (serious/critical) | zero on /about at the six viewports |
| Nav "Start here" from /about scrolled halfway | 1536 and 390: href `/#start`, lands on `/#start`, section top at 0 (its padding clears the bar), `document.activeElement` is `#start` |
| Ghost link on /about | same landing: `/#start`, `#start` focused |
| Reduced motion (1536) | copy, photo and link at opacity 1, no transform; gap 38 px; no video on /about |
| Lint / build | pass |

Screenshots (git-ignored): `docs/qa/p3-about-intro/after-about-*.png`, one per
viewport plus `after-about-1536x730-reduced.png`. Measurements were DOM reads
(script in the lead's scratchpad, `aboutintro_qa.py`).

## Left

- Nothing blocked. `paths.json` keeps `caption` (unrendered, for the record);
  drop it if Cedric prefers the file to hold only what renders.
