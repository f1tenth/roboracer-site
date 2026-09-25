# Fixes for the polish-2 QA review

Branch `revamp/p2-qafix`, from the integration head `95ff8d7` (after the media
merge). The review is `docs/qa/polish-2-review.md` on the `p2-leaderboard`
worktree (run on `cd25d85`). One commit per item. `npm run lint` and
`npm run build` pass at the head.

## Method

- Production build served with `vite preview` on port 4201. "Before" is a
  build of `95ff8d7` (the same head the fixes start from), measured the same
  way, so the before and after numbers compare like with like.
- Playwright (Python, `~/.venvs/ml`), Chromium with SwiftShader GL.
- **CLS, delayed JSON** (the review's method): every `**/data/*.json` request
  held 1.2 s by a route, then the sum of `layout-shift` entries without recent
  input, read about 4.5 s after the data lands, no scrolling. Two runs per
  cell, identical to 4 decimals.
- **Held-block probes**: one request held indefinitely, the block scrolled to
  the top of the window, its height read, the request released, the height
  and the layout shifts after release read 3.5 s later.
- **Links**: `curl -sIL` with a Chrome user agent, a GET retry when HEAD is
  not 2xx.

## Batch 1 (the review's items), before and after

| # | Review item | Before (`95ff8d7`) | After | Commit |
|---|---|---|---|---|
| 1 | /race dead race-site links | 19 of the timeline's links dead (404 or TLS), plus 7 relative paths in `past_races.json` | 0 dead links on the page: the 19 now go to Wayback captures (`archive` field, "archived page" tag); the relative paths point at the live `f1tenth.github.io` pages | 339e3a2 |
| 2 | /news CLS, 1536 / 768 / 390 | 0.4805 / 0.6861 / 0.4894 | **0.0001 / 0 / 0.0001** | 7b8d9fb |
| 3 | /about CLS, 1536 / 768 / 390 | 0.2166 / 0.2682 / 0.0437 | **0.0026 / 0.0012 / 0.0060** (what is left is the ledger's counters changing text width) | 9690dac |
| - | / (landing) CLS, 1536 / 768 / 390 | 0.0001 / 0 / 0.0001 | 0.0001 / 0 / 0.0001 | |
| 4 | Landing "Eight papers to start with." over 11 | wrong count | "Eleven papers to start with.", counted from the featured list | b442774 |
| 5 | Registration shown as open and closed at once | /race: "closes September 9, 2026" and "closed" above a solid "Register your team"; landing: future tense and the same button | Both spotlights: one row, "registration closed"; primary button "See the race site" (to `site_url`), "Read the rules" stays secondary on /race. /race's Enter block follows the same rule. Dates unchanged | 294d5f9 |
| 6 | Start here row with paths.json held, reader at #start | 199 -> 360 px, CLS 0.0768 (1536); 242 -> 731 px, CLS 0.4137 (390) | **360 -> 360 px, 0 (1536); 731 -> 731 px, 0 (390)** | 61c50bb |
| 7 | Leaderboard with the board held, 390 | 1126 -> 1172 px, shift 0.0221 | **1126 -> 1126 px, 0** (1536: 865 -> 865 px, 0, unchanged) | dbdf0ea |
| 8 | Car chapter LiDAR callout at 768 | label ran to x=512, 5 px from the step column at x=517 | labels that fit neither side flip to the roomier one and wrap; every label ends inside the canvas, at least 52 px from the step copy (checked at three scroll points; 1024 and 1536 unchanged, one line each) | b11478b |
| 9 | Fact conflicts | see review | LAMARRacing origin uses the results-page wording ("fastest in the time trials and fourth overall"); "Cédric" -> "Cedric" in two author and two credit fields; "on four continents" dropped from the /race lead. 404 Racers stays "institution tbc" (the content skill names no institution) | 0188dbd |
| 10 | Marquee video clones | after the media merge no clone loads at first paint, but in a 110 s loop at 1536 one aria-hidden clone mounted its own autoplaying video | clones render the poster only (eager, low priority); over the same loop only the visible card plays | 2ed9847 |
| 11 | Footer off-token grays | `bg-gray-900`, `text-gray-400`, `border-gray-800`, `bg-white/10` | `bg-ink-950`, `text-text-on-ink(-muted)`, a `text-on-ink/15` rule, an `ink-800` chip with an `ink-700` border | 62f77a0 |
| 12 | About counters | ticking 0.8 -> 3.2 s after navigation, a beat on "999+" | ticking 0.55 -> 1.91 s (1.2 s per tile plus the 0.12 s stagger); the count rounds up, so "999+" passes in two frames and the tail sits on "1,000+" | 3f9c1e9 |
| 13 | New-tab links without the sr-only note | leaderboard link, spinoff names | "(opens in a new tab)" on both; the race timeline says "(archived copy, opens in a new tab)" where it links a capture | 180fbb1, 339e3a2 |

Also fixed on the way: dropping "on four continents" left a /race lead that
fit one line in Manrope and two in the fallback face, so the font swap moved
the hero 27 px on a normal load (CLS 0.0226 at 1536; 0.0006 on `95ff8d7`). The
lead is now 44ch wide: normal-load CLS on /race 0.0006 / 0.0007 / 0.0015 at
1536 / 768 / 390 (a5f3080).

### Race links, detail

- The 19 sites all have their repo in the f1tenth GitHub org set to private
  with Pages on; the list is in `docs/CONTENT.md` for Cedric.
- Every capture was chosen with the Wayback availability API (the CDX API
  where the availability API answered empty), checked to be a 200 capture of
  the site root, and its page title read (for example "Roboracer VTC2026-Fall",
  "F1TENTH ICRA 2024"). The latest Korea 2024 capture was a redirect page, so
  that entry keeps its earlier capture.
- Final re-check, 2026-09-25: every live link on the timeline answers 200.
  web.archive.org rate-limits this machine after a burst of requests
  (connection refused, the long-standing captures included), so the captures
  were checked one by one: 19 of 24 answered 200 before the refusals came
  back; the other five (CDC 2024, ICRA 2025, IV 2025, CDC 2025, VTC 2026) had
  answered 200 with the right page title earlier the same day, and VTC 2026
  answered 200 again a minute before the last pass. Worth one click each in a
  browser.

### Left alone, as decided

- Item 9 of the review (two solid violet buttons in a viewport) and item 12
  (the servo "verify" callout) are Cedric's decisions.
- The registration dates are unchanged. Four dates disagree (Sep 5 in the
  content skill and the Aug 23 news item, Sep 9 in `upcoming_events.json`,
  Sep 12 struck and replaced by Sep 18 on the live timeline); listed in
  `docs/CONTENT.md`.

## Batch 2 (review of the code by Codex, triaged by the lead)

| # | Change | Check | Commit |
|---|---|---|---|
| 1 | Hero: the reader's pause lives in a ref the clip sequencer checks before every advance and play; the pending `canplay` listener is removed on cleanup; resume moves on from an ended clip instead of replaying it | Next clip held, pause, release: both clips stay paused; play: crossfades and plays the next clip | 436b446 |
| 2 | Leaderboard: config, board summaries, board file, extras and rows validated before state (malformed entries dropped); error boundary with the one-line fallback and the link; 8 s timeout on the config; bundled fallback config; re-read when the tab comes back after a minute, keeping the last good laps on failure | Config 500, config malformed, object-valued extras plus a bad row, malformed index: no page errors, the board or the error line, the link every time | 9a700b2 |
| 3 | Start here falls back to the bundled four paths on a failed or malformed `paths.json`; noscript links the IROS 2026 site and the sponsor mailto | paths.json 404, malformed, missing `paths`: the four rows render | af80640 |
| 4 | Sponsor line: "Teams at 90+ universities. Write to contact@roboracer.ai." | | e54182e |
| 5 | /assembly Computer entry: "The build guide shows a Jetson Xavier NX; this model shows the Orin." (guide link kept) | | 70bc52c |
| 6 | Car chapter step 03: "The hardware, software and simulator are open source." | | e5ab709 |
| 7 | /research lead: "A Google Scholar search for F1TENTH or RoboRacer returns more than a thousand results. This is a selection, by topic."; landing link "Browse the papers" | | dbdfcfe |
| 8 | Korea delegation excerpt: "LINC 3.0 supported the camp and involved 76 Korean universities. Eight joined the F1TENTH education and competition program in 2023." | The Autoware article says "In 2023, eight of these universities participated", so the year stays | 2095d35 |
| 9 | /race register step: "at most ten people per team in the race area during the event" | | 618d9a4 |
| 10 | Community lead: "Teams around the world build and race RoboRacer cars." | | d7353a9 |
| 11 | Car photo 2: caption "AI-generated illustration", matching alt | | 69f70de |
| 12 | Hero: a clip in `waiting` for over 1.5 s marks the link as stalled for the tab (sessionStorage); every clip loaded after it, a queued one included, is the 960 encode. Without `navigator.connection` the desktop pick is unchanged until then | 1.5 Mbit/s, `navigator.connection` removed: the opening clip stalls, the flag is set, the next request is `hero-race-01-960.mp4` | ba87e54 |
| 13 | `useScrollToHash`: `decodeURIComponent` wrapped; a malformed fragment is ignored | `/#%` loads the landing with no page error | c6d5def |
| 14 | News excerpts restored: 404 Racers "Second at the 28th competition, IEEE IV 2026."; UNICORN Racing "First place in Vienna." | | 51b4894 |
| 15 | A spinoff whose origin is missing or TODO(content) does not render (Quanser today, JSON kept); count line "Two so far"; the loading reserve re-measured for two cards | /about shows Neobotics and LAMARRacing | 1dda0fa |

Batch 2 moved no layout: the delayed-JSON CLS and both held-block probes above
were re-run after it and are the "After" column.

## Side effects to know

- StatTicker's cap applies everywhere it counts by time: the /news and
  /research ledgers also finish in 1.2 s now (they were set to 2.5 s after
  Cedric found 5 s slow on 2026-08-23).
- The /race Enter block's primary button follows the spotlight: "See the race
  site" once the deadline has passed.
- Observed while testing the marquee, not changed: the hero keeps cycling and
  downloading clips while the reader is far down the landing (five more clip
  requests during a two-minute stay at the community section).
