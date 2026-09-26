# QA: /news after the news merge (p3-news-merge)

Date 2026-09-25. Branch `revamp/p3-news-merge`. Production build served by
`npx vite preview --port 4188 --strictPort`; headless Chromium (Playwright, Python) at device
scale 1; phones with touch and `isMobile`, the tablet with touch. Scripts:
`docs/news/tools/qa_news_final.py` (captures, DOM checks, keyboard, axe, reduced motion) and
`docs/news/tools/linkcheck_5s.py` (links). Raw results: `docs/qa/p3-news-merge/report.json`,
`docs/news/tools/links-5s-2026-09-25.json`. Captures are git-ignored PNGs in
`docs/qa/p3-news-merge/` (the checkpoint agent's earlier captures moved to `checkpoint/`).

The data: 75 items, 2016 to 2026 (see `docs/news/MERGE.md`). The lead is
`ifac2026-busan-largest-race`; the archive holds the other 74.

## Build

- `npm run lint`: clean.
- `npm run build`: passes (`tsc -b` then Vite, 702 modules, News chunk 19.00 kB / 5.65 kB gzip).
  The only warning is the old one for the RacecarAssembly chunk (over 500 kB), not this page.

## Per viewport

| viewport | page height | h1 | console errors | horizontal overflow (default / every fold open) | axe serious+critical (default / expanded) | keyboard |
|---|---|---|---|---|---|---|
| 1536x730 | 10,438 | 1 | 2 from LinkedIn's frame (see below) | none / none | 0 / 0 | 96 tabs to the footer; 5 of 5 folds, 7 of 7 post buttons reached |
| 1366x650 | 9,778 | 1 | 0 | none / none | not run (brief: 1536 and 390) | 96 tabs; 5 of 5 folds, 7 of 7 post buttons |
| 768x1024 | 13,729 | 1 | 0 | none / none | not run | 88 tabs; 5 of 5 folds, 7 of 7 post buttons |
| 390x844 | 9,027 (was 9,219) | 1 | 2 from LinkedIn's frame (see below) | none / none | 0 / 0 | 44 tabs; 10 of 10 folds, 3 of 3 post buttons |
| 844x390 | 6,711 (was 6,903) | 1 | 0 | none / none | not run | 44 tabs; 10 of 10 folds, 3 of 3 post buttons |

"Expanded" = every year's fold open and one card's LinkedIn post loaded. axe found no violation
of any impact in either state. Overflow was measured as `scrollWidth` against the viewport and as
any element past either edge outside a scroller (the chip row scrolls on its own below `sm`).

Every focus stop had a visible ring (outline or shadow) and was inside the viewport when focused
(overlap with the fixed bar or the sticky year band was not measured).

## What each check saw

- **Lead with its embed.** At every size: the IFAC 2026 story with its LinkedIn post beside it
  (below it under `lg`), frame titled "RoboRacer Foundation on LinkedIn: IFAC 2026 in Busan",
  shown (opacity 1, not inert) once LinkedIn's document was seen in it. Captures `*-lead.png`.
- **Archive head (the first row).** The page has no separate featured row: the one featured slot is
  the lead (the first featured item with a picture). The archive opens with the filter (All plus 8
  competitions with two or more items), "74 posts", then 2026's first four cards. Captures
  `*-archive-head.png`.
- **By-year list and folds.** Desktop and tablet: every year shows four, the rest behind
  "Show N more from YEAR" (2026 13, 2025 8, 2024 11, 2023 4, 2020 2; 2022, 2021, 2019, 2018 and
  2016 have no fold). Phones: 2026 and 2025 show four; 2024 to 2016 are closed folds
  ("Show 15 from 2024"). A click opens and closes each (`*-fold-closed.png`, `*-fold-open.png`,
  phones also `*-2024-closed.png`, `*-2024-open.png`). From the keyboard, Enter opens the 2026
  fold and Space closes it.
- **Competition filter.** IROS 2024 gives "2 of 74 posts · IROS 2024", ICRA 2025 "3 of 74", both
  with no fold (every match shown); All restores the folds (5 on desktop, 10 on a phone).
- **A card's LinkedIn post, click to load only.** Before any click the page makes one request to
  a LinkedIn embed URL (the lead's) and no card holds an iframe. "Show the LinkedIn post" on the
  first card (Siga Siga Racing) sets `aria-expanded="true"`, mounts a frame titled "AutoDRIVE on
  LinkedIn: results of the sixth Sim Racing League", and adds exactly one embed request (1 to 2).
  The label becomes "Hide the LinkedIn post". From the keyboard: Enter opens it with the titled
  frame; Space closes it (panel `hidden`, frame unmounted). Captures `*-card-embed.png`.
- **Reduced motion** (390x844 and 1536x730, `reduced_motion="reduce"`). Read before any scroll,
  no card or lead is faded or offset (0 of the rendered articles), so nothing waits on a scroll
  trigger. Under reduce the fold chevrons, the post-button chevron and both LinkedIn frames have
  `transition-property: none` (with no preference: transform and opacity). No Lenis class on the
  root; `scroll-behavior: auto`. Captures `*-reduced-archive.png`, `*-reduced-card-embed.png`.
- **Images.** 23 `<img>` in the page with every fold open: all have `width`, `height` and an `alt`
  attribute; none broken; no failed local request. 20 are card photos with `alt=""` inside the
  card's duplicate picture link, which is `aria-hidden` and out of the tab order (the headline is
  the one announced link); the other three carry non-empty alt text.
- **Console.** Zero errors from the site. In the first full run two
  `requestStorageAccess: Permission denied.` errors appeared at 1366 and 844; in the final run at
  1536 and 390; eight further loads with frame locations recorded showed none. The site's source
  and bundle never call `requestStorageAccess` (grep of `src/` and `dist/assets/`), so these
  come from LinkedIn's embed frame (or its anti-bot frame, li.protechts.net) asking for storage in
  headless Chromium. Nothing to fix on our side short of not embedding.

## Links (every `link`, `archive`, `more.href` and embed `src` in news.json)

93 distinct URLs, `curl -sI -L --max-time 5` with a browser user agent; anything not 2xx retried
once with GET. 89 answer 2xx on HEAD, including all 18 embed URLs and every new item's link.
Not 2xx:

| URL | item | HEAD | GET | note |
|---|---|---|---|---|
| https://daily.hankooki.com/news/articleView.html?idxno=1144287 | `korea2024-dong-a-wins` link | 404 | 200 | refuses HEAD; the page is live |
| https://endeavors.unc.edu/the-fast-and-the-autonomous/ | `unc-the-fast-and-the-autonomous` link (kept item) | connection refused | refused | the card links the `archive` instead |
| https://web.archive.org/web/20260515201552/https://endeavors.unc.edu/the-fast-and-the-autonomous/ | same item, `archive` | timeout (5 s) | timeout | 200 in 8.0 s on a 30 s retry, 0.3 s the time after; slow, not dead |
| https://medium.com/adventures-in-autonomous-vehicles | `medium-adventures-in-autonomous-vehicles` link (kept item) | 403 | 403 | Medium blocks scripts; opens in a browser |

`author_url`s were not in this brief's list; the checkpoint's run found LinkedIn profiles answering
429 to curl (rate limit, not dead).

## Fixed in this pass

- `src/pages/News.tsx`: a year that is only its fold (2024 to 2016 on a phone) had 64px of paper
  under "Show 15 from 2024" and 24px above it, so the line floated off its own year. Such a year
  now takes `pt-10 pb-4`. The phone page is 192px shorter (390x844 9,219 to 9,027; 844x390 6,903
  to 6,711); desktop and tablet are unchanged (10,438, 9,778, 13,729).

## Noticed, not changed (facts belong to the auditor)

- The ledger says **34 "Races"** (every tagged event, including the Korea championships, Germany
  2022 and a course race) while /race says 30 competitions. Default in MERGE.md: keep "Races".
- `unc-the-fast-and-the-autonomous` (kept item, 2020) is still `status: "verify"` and renders like
  published.
- 2026's four open cards are all text cards (newest first); its photo posts sit behind the fold.

## Not checked in this pass

- 1920x1080 was not re-captured (not in this brief's list); the checkpoint's 1920 captures are in
  `docs/qa/p3-news-merge/checkpoint/`.
- LinkedIn blocked (content blocker) was not re-run; the checkpoint agent's captures
  (`checkpoint/*-embed-blocked-*.png`) show the no-poster placeholder and the poster holding the
  space, and the embed code did not change since.
- JavaScript disabled: the page is a client-rendered SPA fed by news.json, so it renders nothing
  without JS, like every route on the site.
- Real phones and Safari: headless Chromium only.
