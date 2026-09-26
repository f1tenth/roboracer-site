# QA: /race#leaderboard, the top-5 replay (p3-leaderboard, 2026-09-25/26)

Cedric's note (2026-09-25): "The leaderboard is good but we need the live sim
preview that shows the top 5 cars, and let's have it stay on follow the gap."
Design and findings: `docs/LEADERBOARD.md`, "The replay".

## What changed

- The section is pinned to lab 4, follow the gap (`featured` in
  `public/data/leaderboard.json` and `FALLBACK_CONFIG`); the lap/obstacle chips stay.
- The board's own player (`?lab=<board>&compare=top5`) sits beside the table
  from `lg` (table 5/12 with its details under it, replay 7/12) and under the
  table's details below `lg`. It is a poster until a click; the frame is
  clipped to the player's dialog and scaled to the column. It follows the
  chips; "Open the replay ↗" and, once loaded, "Restart the replay" sit under it.

## Checked (dev server on 4185, headless Chromium via Playwright)

| Viewport | Fit | Replay box | Loaded: dialog in the frame | Notes |
|---|---|---|---|---|
| 1536x730 | wide, scale 0.82 | 804 x 554 | 980 x 675 at (30, 22.5), no inner scroll | box fits the 662 px under the nav |
| 1366x650 | wide, scale 0.77 | 754 x 519 | same | fits the 590 px under the nav |
| 1920x1080 | wide, scale 1 | 980 x 675 | same | |
| 1024x768 | narrow (column 564) | 402 x 647 | 402 x 647 at (19, 36.4) | phone layout of the player beside the table |
| 768x1024 (touch) | wide, scale 0.73 | 720 x 496 | 980 x 675 | under the table's details |
| 390x844 (touch) | narrow, scale 0.85 | 342 x 550 | 402 x 647 | under the table's details |
| 844x390 (touch) | wide, scale 0.81 | 796 x 548 | 980 x 675 | taller than the landscape screen (see below) |

- The poster box and the loaded box are the same size at every viewport
  (measured before and after the click): nothing moves when the player arrives.
- Before a click: no iframe in the DOM, no request to the board's site for
  the replay, zero console errors on /race.
- After a click the poster stays up with "Loading the replay…" until 900 ms
  after the frame's `load`; measured, the dialog opens 130-160 ms after
  `load` and has drawn within 450 ms.
- Reduced motion (1536x730, 390x844): only the poster until clicked; after the
  click the board's player opens paused on the start line ("Play").
- Chips: switching to "Fastest clean obstacle lap" while loaded replaces the
  frame (`lab=lab-4-follow-the-gap-obstacles&compare=top5`) with the poster
  over it until ready; the obstacle dialog lands in the same clip (980 x 675;
  402 x 649 on the phone). Both links follow the chip.
- Closed player: Escape inside the frame closes the board's dialog and shows
  the board's page in the clip; "Restart the replay" reopens the player
  (verified at 1536x730 and 390x844).
- Keyboard (1536x730): Tab order chips, See the full leaderboard, "Play the
  replay: Top 5, follow the gap" (visible focus ring inside the box), Open the
  replay, then the footer. Enter on the poster moves focus to the frame; Tab
  walks the player's seek bar, speed, race, Compare, Paths, Copy link, and
  leaves the frame for "Open the replay" (no trap).
- axe on `#leaderboard`, unloaded and loaded, 1536x730 and 390x844: zero
  violations. One h1 on /race. No horizontal overflow at any viewport.
- The iframe: `title="Top 5, follow the gap: replay player of the class
  leaderboard"`, `loading="lazy"`, `sandbox="allow-scripts allow-same-origin
  allow-popups allow-popups-to-escape-sandbox"`, `allow="fullscreen;
  clipboard-write"`, `scrolling="no"`.
- `npm run lint` and `npm run build` green (tails in the branch report).

Screenshots (git-ignored, in this worktree): `docs/qa/p3-leaderboard/`,
`race-leaderboard-<viewport>-{unloaded,poster,loaded}.png` for all seven
viewports, `-reduced-*` at 1536x730 and 390x844,
`-{1536x730,390x844}-switched-obstacles.png`, `-1536x730-focus-play.png`,
`-1536x730-closed-player.png` (the board's page after Escape, before Restart).

## Console after a click (from the board's frame, not the site)

1. `404` on `https://roboracer-class.github.io/leaderboard/data/archive/index.json`:
   the board asks for its archived-terms list, which exists only after a term
   is archived. It happens on the board's own site too.
2. `Blocked autofocusing on a <button> element in a cross-origin subframe.`:
   `replay.js` sets `autofocus` on its Play button.

Both need a one-line change in the leaderboard repo (LEADERBOARD.md, question
6); nothing on roboracer.ai can silence them.

## Left open

- The posters show the top 5 as of 2026-09-26 02:30Z (Team 10 first, 6.83 s).
  Lab 4 closes 03:59Z the same night; if the top 5 changes before then, the
  poster's standings are stale until re-captured (recipe in the manifest
  rows RACE-LB-01/02).
- On a landscape phone (844x390) the player (548 px) is taller than the screen.
- If the board changes its player's layout, the measured clip in
  `LeaderboardReplay.tsx` (`WIDE`, `NARROW`) needs new numbers; the durable fix
  is an `?embed=1` mode on the board.
- Firefox and Safari were not run (Playwright Chromium only). The clip relies
  on the spec's modal-dialog `max-width` and on `scrolling="no"`, both
  cross-browser.
