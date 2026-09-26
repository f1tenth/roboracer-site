# Class leaderboard on roboracer.ai

The ESE 6150 class leaderboard (<https://roboracer-class.github.io/leaderboard/>)
is a static site on GitHub Pages, rebuilt every five minutes from graded
submissions. It ranks each lab's best clean lap **in the grading simulator**
(not the physical car). roboracer.ai now shows the top of it on `/race` and
links to the rest. Written 2026-09-24, branch `revamp/p2-leaderboard`; the
board is pinned to lab 4 and the board's own replay of the top 5 sits beside
the table since 2026-09-25 (branch `revamp/p3-leaderboard`, section "The
replay" below).

## What is wired

| Piece | File |
|---|---|
| Section 05 "Leaderboard", the last section of `/race`, anchor `/race#leaderboard` | `src/pages/Race.tsx` |
| The section body: fetch, board choice, table, states | `src/components/race/Leaderboard.tsx` |
| Types, fetch with timeout, board choice, formatting | `src/components/race/leaderboardData.ts` |
| The replay beside the table: poster, loads itself near the viewport (click under reduced motion), clipped frame | `src/components/race/LeaderboardReplay.tsx` |
| Its two posters | `public/media/race/race-leaderboard-replay-{wide,narrow}.webp` |
| Where the board lives, what to feature, the replay's copy (data, not code) | `public/data/leaderboard.json` |

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
  `replay.js` (re-checked 2026-09-25 on `?lab=...&compare=top5`). The table is
  still rendered in the site's own type (it matches the page, no second
  scroll area, one small JSON read); only the replay is framed (below).
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

The table does not animate. The only motion in the section is the board's
replay, which loads by itself once its box is near the viewport (below; Cedric, 2026-09-26).
The table has a screen-reader caption ("Lab 4: Follow the Gap, Fastest clean
lap: the top 5 of 7 teams"), column headers with `scope="col"`, and the team or
alias as the row header.

## Which board is featured

Pinned since 2026-09-25 (Cedric: "let's have it stay on follow the gap"):
`featured: "lab-4-follow-the-gap-lap"` in `leaderboard.json` and in the
bundled `FALLBACK_CONFIG`, with the obstacle board on the second chip. A
pinned board that has no ranked row (a new term's reset) falls back to the
automatic choice.

`featured: null` picks, among boards that have opened and have
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
| `replay` | The replay beside the table: `label` (its heading, "Top 5, follow the gap"), `note` (the line under it), `compare` (`top5` or `top3`). `null`, absent or malformed: no replay, and the table and its details take the row as before |

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
`rank`, `metric` (the lap in seconds), `extras` { `top_mps`, `avg_mps` },
`replay` (read only as "this run has a recording") }.
Not used: `players`, `late`, `unranked`, `reference_submissions`.

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
| Replay heading | Top 5, follow the gap (`replay.label`) |
| Replay line | The best clean laps in the grading simulator, replayed. (`replay.note`) |
| Replay links | Open the replay ↗ / Restart the replay (after a load) |

Lab names, board names, column labels ("Best lap", "Lap time", "Top speed")
and "Team"/"Driver" come from the board's data, so they match what students
see on the board.

## The replay (2026-09-25)

Cedric: "we need the live sim preview that shows the top 5 cars, and let's
have it stay on follow the gap:
<https://roboracer-class.github.io/leaderboard/?lab=lab-4-follow-the-gap-lap&compare=top5>".

### How the board's player works (read from `docs/index.html`, `docs/replay.js`, `docs/replay.css` and the README of the public repo `RoboRacer-Class/leaderboard`, 2026-09-25)

- **The URL scheme.** The board's own script reads `?lab=<board slug>` (the
  board shown), `?term=<label>` (an archived term) and `?me=<alias>`.
  `replay.js` reads, once the board has rendered, `?watch=<alias or team>`
  (one run) or `?compare=top3|top5|<name>,<name>,...` (2 to 5 cars; a comma
  inside a name escaped as `\,`), either with `&race=best` (the ranked lap
  alone instead of all three timed laps). `compare=top5` races the board's
  first five **ranked rows that have a recording**, never the TA reference or
  a run graded late. It applies to whichever board `?lab=` names, so
  `?lab=lab-4-follow-the-gap-obstacles&compare=top5` works too (all 13 lap
  rows and all 12 obstacle rows have recordings).
- **No embed mode.** No query or hash hides the board. The player is a
  `<dialog>` opened with `showModal()` over the full board page (backdrop
  `rgb(7 7 13 / .72)`). Its Close button, Escape and a click on the backdrop
  close it and strip `watch`/`race`/`compare` from the URL
  (`history.replaceState`), which leaves the board's own page in view.
- **How it sizes itself.** Dialog `width: min(980px, 100% - 1.5rem)`,
  `max-height: calc(100% - 1.5rem)`, and the browser's own modal-dialog
  `max-width: calc(100% - 6px - 2em)` (100% - 38 px), centred. The canvas is
  as wide as the dialog and `min(width x the track's aspect, 58% of the
  window's height)` tall, at least 200 px (the track is framed on the first
  car's path: lab 4's Levine box is about half as tall as wide); in full screen it takes what the header and controls leave. Below
  700 px of window width it switches to a phone layout: the readout becomes a
  strip under the canvas, the standings one column, the seek bar its own row.
  The player also redraws on `resize`.
- **Autoplay.** It plays on open unless `prefers-reduced-motion: reduce`,
  checked inside the frame. The OS setting reaches a cross-origin frame
  (verified: the framed player opens paused under reduced motion). Its colour
  scheme follows the OS; the embedding iframe's `color-scheme` does not
  change it in Chromium (tested).
- **Framing.** `curl -sI` on the exact URL: 200, `access-control-allow-origin:
  *`, no `X-Frame-Options`, no CSP header; no CSP `<meta>` and no
  `top`/`parent` check in the page. The player runs in a sandbox with
  `allow-scripts` alone (tested); we also give it `allow-same-origin` (its own
  origin for its data cache, its "Paths" choice in localStorage and
  `history.replaceState`) and `allow-popups allow-popups-to-escape-sandbox`
  (its links open real tabs). `allow="fullscreen; clipboard-write"` lets its
  Full screen and Copy link work.
- **Console noise from the frame** (only after a click; not the site's
  code, but it shows in DevTools): a 404 on `data/archive/index.json` (the
  board asks for the archived-terms list, which exists only once a term has
  been archived) and Chrome's "Blocked autofocusing on a <button> element in a
  cross-origin subframe" (`replay.js` sets `autofocus` on Play). Both are
  one-line fixes in the board repo (below, question 6).

### What the section does with it

- **Placement.** From `lg` the row is the table (5 of 12 columns, its
  details and "See the full leaderboard" under it) beside the replay (7 of
  12); below `lg` the replay comes after the table's details. Heading "Top 5,
  follow the gap", one line "The best clean laps in the grading simulator,
  replayed.", the player, then "Open the replay ↗" (new tab, same URL) and,
  once loaded, "Restart the replay".
- **Loads near the viewport** (Cedric, 2026-09-26: no button to press). The frame mounts when its box comes within 200 px of the viewport; under reduced motion only a click (or Enter/Space) loads it. Until then only a poster ships: a
  capture of the player itself, its buttons hidden before the capture (so
  the poster draws no control that does nothing), paused mid-race (Team 10 on lap 2, Team 8
  0.19 s behind, the other three out of the first corner), in the exact box the player will fill, with
  a play disc over the track. Nothing loads from the board's site for the
  replay before that, for anyone, and never by itself under reduced motion
  (the player then opens paused, its own Play to start). The iframe has a
  `title`, `loading="lazy"`, the sandbox above, and `scrolling="no"` (no
  scrollbar in its window, so the dialog is the same size on every platform,
  and a wheel over it scrolls the page).
- **Showing only the player.** The frame is given a window the dialog fits
  in without scrolling, and a clip shows only the dialog's box; the frame is
  scaled to the column (`transform: scale`, never above 1). Two fits, chosen
  by the column's width:

  | Column | Frame window | Dialog shown (crop) | Poster |
  |---|---|---|---|
  | 640 px and wider | 1040 x 720 | 980 x 675 at (30, 22.5) | `race-leaderboard-replay-wide.webp`, 1960x1350 |
  | narrower (phones, lg below ~1155 px) | 440 x 720, phone layout | 402 x 647 at (19, 36.4) | `race-leaderboard-replay-narrow.webp`, 804x1294 |

  The phone dialog's height follows the first car's track box: 643 with Team 8
  leading, 647 with Team 10 (since 2026-09-26 02:30Z), 649 on the obstacle
  board; the clip trims or shows at most 2 px at each end. If the board changes its player's CSS, the worst case
  is a sliver of the dimmed board at an edge or a scrollbar inside the player;
  the numbers live in `WIDE`/`NARROW` in `LeaderboardReplay.tsx`.
- **Loading.** The poster stays over the frame, with "Loading the replay…",
  until 900 ms after the frame's `load` (measured: the dialog opens 130-160
  ms after `load` and has drawn its cars within 450 ms, so the board's page is
  not seen first).
- **Chips.** The replay follows the board chips (`lab=<slug>&compare=top5`):
  the frame is replaced, not re-pointed (a new `src` on the same iframe adds
  an entry to the page's history). A board with fewer than two recorded ranked
  rows has nothing to race; the replay is then left out and the table and its
  details take the row as before.
- **Closed player.** Close or Escape inside the frame leaves the board's page
  in the clip (text cut at the edges); "Restart the replay" loads a fresh
  frame with the player open. Full screen works through the iframe's `allow`;
  where a browser refuses element full screen (iPhone), the player fills the
  frame's window instead and the clip cuts its edges until Restart.
- **Keyboard.** Tab order: chips, See the full leaderboard, the poster's play
  button ("Play the replay: Top 5, follow the gap"), Open the replay. Enter on
  the poster moves focus to the frame; Tab walks the player's controls and
  leaves the frame for the page (no trap).

## QA (2026-09-24, dev server on 4194)

The replay's QA (2026-09-25) is `docs/qa/p3-leaderboard.md`.

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
3. **Which board to feature.** Answered 2026-09-25: fixed, lab 4 follow the
   gap. The two-chip switch stays, and the replay follows it.
4. **Naming the course.** The copy says "ESE 6150" and "at Penn". Fine to
   publish, or would you rather say "the Penn course" without the number?
5. **Pointers to it.** `/race#leaderboard` is ready as an anchor if the nav
   or the landing should link here (those files belong to another branch).
6. **Board-side fixes (the leaderboard repo, not this site).** (a) Commit
   `docs/data/archive/index.json` as `{"terms": []}` so the board stops
   logging a 404; (b) skip `autofocus` on the player's Play when framed
   (`window.top !== window`); (c) best, an `?embed=1` mode that hides the
   board and opens the player non-modal, without Close, filling its window:
   the section could then drop its measured clip. Recommended: (a) and (b) now,
   (c) when someone next touches the player.
7. **The replay on phones.** It loads the board's phone layout (a 200 px tall
   track above the readout, standings and controls, 550 px tall at 390 wide).
   Keep it inline, or on phones show the poster linking out to the board?
   Recommended: keep it inline, as briefed.
