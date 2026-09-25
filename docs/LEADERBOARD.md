# Class leaderboard on roboracer.ai

The ESE 6150 class leaderboard (<https://roboracer-class.github.io/leaderboard/>)
is a static site on GitHub Pages, rebuilt every five minutes from graded
submissions. It ranks each lab's best clean lap **in the grading simulator**
(not the physical car). roboracer.ai now shows the top of it on `/race` and
links to the rest. Written 2026-09-24, branch `revamp/p2-leaderboard`.

## What is wired

| Piece | File |
|---|---|
| Section 05 "Leaderboard", the last section of `/race`, anchor `/race#leaderboard` | `src/pages/Race.tsx` |
| The section body: fetch, board choice, table, states | `src/components/race/Leaderboard.tsx` |
| Types, fetch with timeout, board choice, formatting | `src/components/race/leaderboardData.ts` |
| Where the board lives and what to feature (data, not code) | `public/data/leaderboard.json` |

**Why at the end of /race.** The page answers a competitor's questions in
order: how to enter, what runs this season, the history, who races. The class
board is a side door, simulator laps from one course and not a competition, so
it sits after everything a team needs to enter, as "who is fastest in class
right now". It does not push the season or the entry steps down.

## Checks on the live board (2026-09-24)

- **CORS:** `access-control-allow-origin: *` on `data/index.json` and on the
  per-board files (checked with `curl -sI`, also with an `Origin:
  https://roboracer.ai` header). The browser reads them from roboracer.ai
  directly; no proxy.
- **Framing:** no `X-Frame-Options`, no `Content-Security-Policy` header, no
  CSP `<meta>`, and no frame-busting script in `docs/index.html` or
  `replay.js`. An `<iframe>` of the board would work. We render the data in
  the site's own type instead: it matches the page, it has no second scroll
  area, and it costs one small JSON read.
- **roboracer.ai** sends no CSP either, so nothing blocks the fetch.
- **Ad blockers:** EasyList, EasyPrivacy, Fanboy Annoyances, uBlock filters
  and AdGuard Base were grepped for `leaderboard`. Every generic rule is an ad
  slot name (`#ad-leaderboard`, `.leaderboard-ad`, ...); none matches
  `/data/leaderboard.json`, the board's URL, or the `#leaderboard` anchor. If
  a blocker ever does stop the read, the section shows its error line and the
  link.
- **Size:** `index.json` about 5 KB; a board file 11 KB gzipped (65 KB raw for
  lab 3 with 51 drivers, most of it the `players` history we do not use).

## Fetch and fallback

1. On mount: `public/data/leaderboard.json` (same origin), then
   `<url>data/index.json`, then the featured board's file. Every read gives
   up after 8 s; the cross-origin ones use `cache: "no-cache"` (revalidates by
   ETag; GitHub Pages would otherwise let a browser keep a copy for 10
   minutes). If the config fails or does not validate, a bundled copy of it
   (`FALLBACK_CONFIG`, same url and label) is used, so the board still loads
   and the link still works. Every field read from the board is validated
   first (`readBoardIndex`, `readBoardFile`): a malformed board entry or row is
   dropped, malformed `extras` are ignored, and anything that still throws at
   render lands in an error boundary that shows the error line and the link.
   When the tab becomes visible again more than a minute after the last good
   read, the board is read again; a failed refresh keeps the laps on screen.
2. **Loading:** the table is drawn with the real row count, cell sizes and
   hairlines, grey bars in place of values, `aria-busy="true"`. Measured at
   1536x730: the section is 865 px tall loading and 865 px tall loaded, so
   nothing below moves. On a phone the chips carry short labels ("Clean lap",
   "Clean obstacle lap"; `shortBoardLabel`) so a two-board switch stays one
   row: 1126 px loading and loaded at 390.
3. **Error or offline** (network error, timeout, HTTP error, unexpected
   shape): one line, "The lap times did not load here.", and the link to the
   full board. Never an empty table.
4. **Empty** (no board of the term has a ranked lap yet, e.g. the first days
   of a new term): "No clean laps on the board yet this term." and the link.
5. **Switch:** when the featured lab has more than one board with ranked laps
   (lab 4 has a lap board and an obstacle board), two chips switch between
   them (`aria-pressed` buttons in a labelled group, keyboard operable). The
   other board's file is read on first click. Boards of other labs stay on
   the board's own site.
6. **Link:** "See the full leaderboard" (secondary button, new tab) opens the
   board on the lab shown here (`?lab=<slug>`, the board's own deep link;
   `?term=<label>` too when a term is pinned). It is present in every state
   once the config has loaded.

Nothing animates. Reduced motion changes nothing because there is no motion.
The table has a screen-reader caption ("Lab 4: Follow the Gap, Fastest clean
lap: the top 5 of 7 teams"), column headers with `scope="col"`, and the team or
alias as the row header.

## Which board is featured

`featured: null` (the default) picks, among boards that have opened and have
at least one ranked row (`rows > 0` in the index), the **most recently opened
lab** (latest `available_from`), and within that lab its first board in the
index's order, which is also what the board's own page opens on. A lab that
has opened with no clean lap yet is skipped, so an older lab with results is
shown instead of an empty table. On 2026-09-24 that is Lab 4: Follow the Gap,
"Fastest clean lap", with the obstacle board on the second chip; Lab 5 opened
Sep 23 with no ranked lap yet. Lab 5 takes over by itself once it has one.

Set `featured` to a board slug from `index.json` (for example
`"lab-3-wall-following"`) to pin one; if that board has no rows the automatic
choice applies.

## `public/data/leaderboard.json`

| Field | Meaning |
|---|---|
| `label` | Shown as the "source" line next to the table |
| `url` | The board's site; data is read from `<url>data/` |
| `term` | `null` = current term (`data/`). An archived term's label pins `data/archive/<label>/` (the list is `data/archive/index.json`, which does not exist yet: nothing has been archived) |
| `featured` | `null` = automatic (above), or a board slug |
| `extra` | The one extra column, a key of `metric.extras` (`top_mps`, shown as "Top speed"); hidden below 40rem wide where it does not fit; `null` for none |
| `limit` | Rows shown (5) |

If the board moves (a subdomain, below), only `url` changes.

## The JSON shape relied on

Schema string `ese6150/leaderboard/v1`. Only these fields are read; anything
else can change without touching the site.

`index.json`: `labs[]`, each with `slug`, `file`, `assignment` (boards of one
lab share it), `title`, `lab_title`, `board_title`, `anonymous` (false on team
boards, absent or true for racing aliases), `available_from`, `due`, `rows`
(count of ranked rows), `metric` { `key`, `label`, `unit`, `direction`,
`extras[]` { `key`, `label`, `unit` } }.

A board file (`<file>`): the same header fields, `generated_at` (shown as
"updated N min ago"), and `rows[]` { `alias` ("Team 8" or "Dawn Gecko 23"),
`rank`, `metric` (the lap in seconds), `extras` { `top_mps`, `avg_mps` } }.
Not used: `players`, `late`, `unranked`, `reference_submissions`, `replay`.

The shape is checked (`labs` is an array; a board has `rows` and
`metric.key`); a mismatch is the error state, not a broken table.

## Copy on the section

| Where | Text |
|---|---|
| Title | Leaderboard |
| Subtitle | The fastest laps in class at Penn |
| Lead | Students in ESE 6150 race each lab in the grading simulator. These are their best clean laps. |
| Link | See the full leaderboard |
| Error | The lap times did not load here. |
| Empty | No clean laps on the board yet this term. |
| Switch fails | This board did not load here. |

Lab names, board names, column labels ("Best lap", "Lap time", "Top speed")
and "Team"/"Driver" come from the board's data, so they match what students
see on the board.

## QA (2026-09-24, dev server on 4194)

- `npm run lint` and `npm run build` green.
- Screenshots in `docs/qa/leaderboard/` (git-ignored, local evidence):
  `race-leaderboard-1536x730.png` (+ `-b`), `-768x1024.png` (+ `-b`),
  `-390x844.png` (+ `-b`); states `-1536x730-loading.png`,
  `-1536x730-error.png`, `-390x844-error.png`, `-1536x730-empty.png`;
  `-1536x730-switched.png` and `-1536x730-focus.png` (switch by keyboard,
  focus ring on the link); `-390x844-reduced.png`; a pinned anonymous board
  (lab 3, "Driver", "51 drivers", "lab closed") at 390 and 1536.
- Console: zero errors on the live board at all three sizes and on the
  production build. The simulated-offline run logs only the browser's own
  `net::ERR_FAILED` for the blocked request.
- axe on `#leaderboard`: zero violations at all three sizes. No horizontal
  overflow at any size.

## Questions for Cedric

1. **A roboracer.ai subdomain?** Possible and cheap: a `CNAME` record on
   Porkbun, for example `leaderboard` (or `class`) pointing to
   `roboracer-class.github.io`, then the custom domain set in the leaderboard
   repo's Pages settings (it writes `docs/CNAME`), "Enforce HTTPS" once the
   certificate is issued, and ideally the domain verified for the
   `RoboRacer-Class` org so nobody else can claim it. The board uses relative
   paths, so it works at a root domain as is. Here only `url` in
   `leaderboard.json` changes. Want it, and which name?
2. **The future public leaderboard and prizes.** Nothing on the site mentions
   either. When it opens to the public, what should the section say, who can
   enter, and is there a prize to name? Until then the copy says only what is
   true now: a Penn course, simulator laps.
3. **Which board to feature.** Automatic (the newest lab with a ranked lap)
   or a fixed board? And keep the two-chip switch when a lab has two boards,
   or always show one?
4. **Naming the course.** The copy says "ESE 6150" and "at Penn". Fine to
   publish, or would you rather say "the Penn course" without the number?
5. **Pointers to it.** `/race#leaderboard` is ready as an anchor if the nav
   or the landing should link here (those files belong to another branch).
