# QA - /news (pages v2, stream 3)

Date: 2026-08-23. Branch `revamp/pages-v1`, dev server http://localhost:4180.
Files: `src/pages/News.tsx`, `src/components/news/{newsData.ts,NewsCard.tsx,NewsLead.tsx,NewsEmpty.tsx}`.
Screenshots and run data: `docs/qa/news/`.

## What the page is now

Paper surface, same shell and type scale as `/research`.

1. **Masthead** - mono eyebrow, the page's one `h1`, a lead line, and a mono
   ledger: 21 items, 4 competitions, latest Aug 23 2026, oldest 2020.
2. **Latest** - the newest `featured` item as a lead story. With a picture it is
   a 7/5 split, picture left. With none - which is the case today, the lead is
   the IROS 2026 registration deadline - it is a ruled panel with the headline
   left and the detail, byline and source link beside it, so the top of the page
   does not depend on whether a source gave us an image.
3. **Archive** - "Everything else": competition filter chips (ICRA 2026,
   IV 2026, IFAC 2026, IROS 2026), a live count, then every remaining item
   grouped by year against a sticky mono year rail, two cards per row.
4. **Send us your news** - the page's one solid CTA (mailto), the address in
   mono, and "Feel free to reach out on Slack" with Slack linked.

Gone: the purple gradient cards, `shadow-lg`, the centred `max-w-3xl` column and
the "Loading news..." string.

**Cards.** A card with a site-hosted image is a picture card (16/10 frame,
explicit width and height, `loading="lazy"`) and fills its grid row; a card
without one is a text card that keeps its own height, with a larger headline and
the excerpt. Both carry date, publisher, competition chip, headline, author
(linked when the file records a profile), affiliation and the credit line.
No LinkedIn media is downloaded or re-hosted, and a remote thumbnail is never
hotlinked: `newsData.ts` drops any image whose src is not site-hosted and the
item renders as a text card instead.

**Empty state.** `NewsEmpty` renders a bordered panel ("The feed is quiet", or
"The feed did not load" when the fetch fails) with a secondary button to Slack.
Unreachable with the current data; tested by serving `{"items": []}` and a 500
through Playwright route interception, so no debug hook ships in the page.

## Data

`public/data/news.json` (harvest agent A6, landed mid-session) is the only
source. The page reads it through `src/components/news/newsData.ts`, which types
A6's schema (taskmap n141) and keeps the file's own order. The interim path that
merged `community.json` -> `join.posts` was deleted when the real file landed.

- **21 items, 2020-04-21 to 2026-08-23**, newest first, verified sorted.
- **13 picture cards, 8 text cards.**
- **All four 2026 competitions covered**: ICRA 2026 (8 items), IV 2026 (5),
  IROS 2026 (1), IFAC 2026 (1); 6 items carry no competition.
- 20 items `published`, 1 `verify` (renders with the mono "unverified" tag).
- Every image path resolves on disk; every rendered `<img>` has width, height
  and `loading="lazy"`; nothing failed to load.
- The four thumbnail candidates A6 staged in `_harvest/pick/news/` were **not**
  encoded: its README marks them "not cleared for publication" (Autoware
  Foundation, AutoDRIVE, ETH D-ITET own them). They stay text cards until
  permission is recorded in the media manifest. `public/media/news/` is
  therefore still empty.

**Links.** All 21 item links plus the Slack invite were resolved. One fails:
`https://endeavors.unc.edu/the-fast-and-the-autonomous/` (no response, twice,
2020 item). `medium.com` (403) and the Slack invite (403) block non-browser
requests only. A6 already dropped the dead Stitcher item.

## Checks

| Check | Result |
|---|---|
| `npx tsc --noEmit -p tsconfig.app.json` | clean |
| `npx eslint src/pages/News.tsx src/components/news` | clean |
| 1440 / 768 / 390 / 844x390 landscape | captured, reviewed |
| Console errors and warnings | none on any viewport, in either motion mode |
| axe (desktop 1440, axe-core 4.10) | 0 violations |
| `prefers-reduced-motion: reduce` | same layout, same height (8097 / 7977 / 13281 / 8018 px), no motion |
| Keyboard | chips then headline links; image anchors are `tabIndex={-1}` so a card announces one link; focus ring visible (`focus-card-1440.png`) |
| Filter | "IV 2026" -> "5 of 20 items", "All" -> "20 items"; four competition chips; `aria-live` announces the count |
| Client-side navigation | landing -> News -> Race -> back: 21 articles, scroll reset to 0, no console errors |
| Document title | "News - RoboRacer" (set by `Layout.tsx`), exactly one `h1` |
| JS disabled | body is empty - shell-level, see `docs/qa/requests-news.md` |

## Findings and fixes in this pass

1. **Heading order** (axe, moderate): the lead story's headline was an `h3`
   under the `h1`. It is the page's `h2` now; the "Latest" marker stays a mono
   label, not a heading. axe is clean.
2. **An item was being dropped** by the interim merge, which de-duplicated on
   the link while the two AutoDRIVE items share one landing URL. Fixed before
   A6 landed; the code is gone with the rest of the fallback.
3. **Text cards disappeared into the tinted archive section** when they carried
   the tint themselves. Both card kinds use the white card surface now.
4. **A text card stretched to the height of the picture card beside it**, which
   left an empty panel. Picture cards fill the row, text cards keep their own
   height.
5. **A lead story with no picture was a thin text column.** It is a ruled panel
   with a 7/5 split, which is what the IROS registration item needed.
6. **The ledger** hid nothing when the feed was empty and trusted the file's
   order for "Latest". It hides itself with no items and reads the min and max
   ISO date.
7. **Mono bylines wrapping to two lines were cramped**; they carry
   `leading-relaxed`.

## Open

- `endeavors.unc.edu` link is dead (A6's file to fix: Wayback capture or drop).
- Four legacy items could have pictures once Autoware, AutoDRIVE and ETH D-ITET
  grant permission (Cedric and Ayagoz; candidates already downloaded in
  `_harvest/pick/news/`).
- Requests to the director: `docs/qa/requests-news.md`.
