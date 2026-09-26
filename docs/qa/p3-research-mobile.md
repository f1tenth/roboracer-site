# /research on phones: larger figures, a few papers per year (p3, 2026-09-25)

Cedric's note: "For the research page on mobile make the images larger and the
paper info below the image; also just show a few when we start going through the
years and then show an option to display more (just like we had for the races) so
people can quickly go to the end of the page where we have 'Submit your paper'."

Branch `revamp/p3-research-mobile`. Captures (git-ignored PNGs) and metrics JSON in
`docs/qa/p3-research-mobile/`: `before-*` and `after-*` per viewport (`-top`,
`-featured`, `-list`, `-control`, `-expanded`, `-search`, `-submit`, `-full`), plus
`after-*-jump-*`, `after-*-summary-focus`, `after-*-reduced-*`, `crop-390-2023.png`.

## What changed

- **Phones, both orientations (`compact:`)**: list rows and featured cards show the
  figure at the full column width with title, authors, venue and topics under it
  (it was a 5rem thumb beside the text). Two across from `sm` on a phone, so a
  landscape phone gets 384x240 figures instead of one taller than the screen.
  Featured cards without a figure show the generated venue tile again, as on desktop.
- **Every viewport**: each year shows its first **4** papers (/race opens its
  recent years with 4 and 5 races) and folds the rest behind a native `<details>`,
  the race timeline's pattern: "Show 19 more papers from 2026" / "Hide 19 papers
  from 2026" (race: "Show 30 earlier events, 2016 to 2024" / "Hide the 2016 to 2024
  events"). Each year heading carries its count ("23 papers").
- A mono jump row under the counter: every year on the list, then "Submit your
  paper ↓". Built from the data (a topic or search lists only its years).
- Within a year, papers with a figure come first (stable sort; file order otherwise,
  so the xLAB papers still lead). The four shown are pictures wherever the year has
  four; 7 placeholders show instead of 15.
- A topic or a search shows every match with no fold; clearing it re-folds.
  The counts ("137 of 137 papers", header ledger) always count every paper.
- Featured fold wording now matches: "Show 13 more featured papers" / "Hide 13
  featured papers" (was "13 more featured"). Still phone-only, first 4 shown.
- The phone-only "2017 to 2025 · 114 papers" fold is gone (replaced by the per-year
  folds; the years stay on the page).
- Row figures link to the paper like the featured card's figure (hidden from AT and
  the tab order, so each row still announces one link).

## Numbers (page height / "Submit your paper" top, px)

| Viewport | Before | After | Rows shown | Figure |
|---|---|---|---|---|
| 390x844 | 9,642 / 8,540 | 19,309 / 18,207 | 31 of 137 | 78x49 -> 340x213 |
| 844x390 | 7,600 / 6,737 | 12,496 / 11,633 | 31 | 222x139 -> 384x240 |
| 768x1024 | 37,082 / 36,158 | 16,420 / 15,497 | 31 | 222x139 (unchanged) |
| 1536x730 | 34,946 / 34,355 | 13,501 / 12,910 | 31 | 254x159 (unchanged) |

Phones got longer: before, 2017 to 2025 sat in one fold; now every year is on the
page with four large figures each. The jump row (y about 3,300 at 390) reaches
Submit in one tap.

## Checks

- `npm run lint` clean; `npm run build` passes (the RacecarAssembly chunk-size
  warning is pre-existing).
- Keyboard: the summary is a native control with a 2px focus ring; Enter opens it,
  focus stays on it, the next Tab lands on the first revealed paper's title (the
  figure link is `tabIndex=-1`); Enter again closes. Screen readers get
  expanded/collapsed from `<details>`, as on /race.
- No layout shift on expanding: the summary's document y and `scrollY` are identical
  before and after at all four viewports; the papers open below it.
- Jump links land the target 1rem under the fixed bar (88 px at 390, 72 at 844x390,
  80 at 1536).
- axe (wcag2a, 2aa, 21a, 21aa, 22aa, best-practice): **0 violations** at all four
  viewports, with the folds closed and with one open.
- Console: 0 errors at every viewport. No horizontal overflow.
- Images: every image has width/height; every figure is `loading="lazy"`.
- Load CLS 0.0001 to 0.0035. 768x1024 sometimes reads 0.09 on load from the header
  stat ledger; the same 0.09 shows on the unchanged page (pre-existing, not touched).
- Reduced motion: every card and row fully visible, nothing below opacity 1.
- Re-checked after the laptop reboot on a fresh dev server (`recheck-*` captures,
  `recheck-metrics.json`): same heights, folds, focus order, jump offsets, 0 axe
  violations and 0 console errors at all four viewports.
- Search "MPC": 28 rows, no folds, counter "28 of 137 papers"; cleared: folds back.
  Topic "Planning": 3 featured with no fold, 21 rows with no fold, jump row lists
  2026 to 2022.

## Left open

- **Row figures are 320x200 files.** At full phone width they show at 340 to 384 CSS
  px; on a 3x iPhone that is soft (diagram labels do not read; see
  `after-390x844-dpr3-2025.png`). Crisp needs a 640x400 re-extraction of the 77 row
  figures (sources logged in `docs/media/THUMBS.md`) and a `srcset` in `RowThumb`.
- The 6 papers in 2021, 2019, 2018 and 2017 have no figure; on a phone their logo
  placeholder is a 340x213 plate.
- Not tested on a real iPhone (WebKit does not launch here).
