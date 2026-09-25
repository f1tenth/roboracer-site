# Fix round 3 (and batch 2)

Branch `revamp/p2-round3`, from the integration head `5c0f31c` ("Merge
revamp/p2-mobile"). One commit per item. `npm run lint` and `npm run build`
pass at the head.

## Method

- Two production builds with local media (`VITE_MEDIA_BASE=`, the hero clips
  copied in): **before** = `5c0f31c`, **after** = this branch. Both served by
  `vite preview` on 4202 and driven by the same Python Playwright scripts
  (Google Chrome, headless; SwiftShader GL where WebGL is needed).
- Hero checks fake a fast link (`navigator.connection.downlink = 10`): headless
  Chrome reports 1.6 Mbit/s, which picks the 960 encodes from the start.
- Touch sizes use touch contexts (`pointer: coarse`, mobile UA). Hit areas are
  `elementFromPoint` scans through each target's centre, target centred in
  the window.
- Captures: `docs/qa/polish-2-round3/` in this worktree (git-ignored PNGs).

## Round 3

| # | Item | Before (`5c0f31c`) | After | Commit |
|---|---|---|---|---|
| 1 | Leaderboard: switch during a refresh | Refresh (tab back after 61 s) with the lap board's file held; switch to the obstacle board; release: the page **jumps back to the lap board** | Stays on the obstacle board; switching back shows the refreshed lap times from the cache (no third fetch). Same with `index.json` held instead | aeebb12 |
| 2 | Leaderboard: valid empty refresh | A valid `index.json` with no ranked board: the **old lap times stay** | "No clean laps on the board yet this term.", no table, no chips. A refresh that fails (HTTP 500) still keeps the laps | 5746f88 |
| 3 | Hero: stall between clips | Next clip (`race-01-1920`) held at 1440x900: clip 0 ends at 5.6 s and the hero **holds its last frame for good**, no stall recorded | Stall recorded 1.5 s after clip 0 ends (7.2 s), `race-01` reloads as the 960 encode and plays; the clips after load as 960 | 0a979d5 |
| 4 | Hero: pause survives an effect restart | Pause, reduced motion on, then off: control says "Play footage" while the clip **plays** (0 -> 4.3 s) | Clip stays at 0 and paused until Play; then it plays | 26e5cb2 |
| 5 | Registration closes under reduced motion | Clock 90 s before the deadline, +150 s, reduced motion, /race: still **"Register your team"**, "closes in 0d 00h 01m" | "See the race site", "registration closed" without a reload. Motion on: same result as before (unchanged). A held "starts in" row also hides once the race starts | cce9ddd |
| 6 | Hanging data reads | Request never answered, checked at 4, 10, 12.5 s: Start here row **invisible** (aria-busy), /news **blank**, /about spinoffs placeholder **forever** | At 10 s: the bundled four paths show; /news shows "The feed did not load"; /about's placeholders clear (existing failure handlers). One 8 s AbortController bound in `lib/data` (`fetchJson`), also used by news, contributors and the leaderboard | ede268e |
| 7 | Hero bandwidth out of view | 30 s at the footer, 1440x900: **2 new clips requested** (`race-03-1920`, `iv-rest-v2-1280`, 14.2 MB), the cycle kept playing | **0 requests** in 30 s; both videos paused at the footer; back at the top the clip resumes where it stopped (2.35 s -> 3.05 -> 5.05). A next clip still downloading when the reader leaves is dropped and queued again on return (checked with its request held). Reduced motion: static poster, nothing changes | b2cffa9 |
| 8 | /assembly controls cover the car | 844x390: the control row sat over the canvas (front wheel covered, `assembly-before-844x390.png`); 667x375 the same | Short windows only: 844x390 the row sits under the model (canvas 398x234, controls below it); 667x375 the controls stack at the frame's right (canvas 415x163). No overlap at either; 390x844 and 1440x900 unchanged | a329cce |
| 9 | Past crew names break at 1024 | Names broken mid-word: **4** (1024 mouse), **33** (1024 touch), 11 (1180 touch), 4 (1366 touch) | **0** at 320, 360, 390, 640, 768, 844x390, 1024 (both), 1100, 1180, 1200, 1280, 1366 (both), 1440, 1536, 1920. From lg the column count follows the grid's width in rem (7 to 12, 8.5rem tiles): 9 at 1024 mouse, 7 on a landscape iPad, 12 from about 1260 mouse; last row always complete. Grid height at 1024: 966 -> 1,234 px (mouse), 1,404 -> 2,125 (touch); 1280+ with a mouse unchanged | 4a934db |
| 10 | Near-miss tap targets (VERIFY "Still open") | Past crew names 41 px tall (37 of 51); rules contents "Track" 38 px wide; ribbon partner logos 27 px wide (22 of 82); research DOI links: already 44.5 px (86 links, not reproduced) | 390x844, 360x740, 844x390: Past crew 45 px, rules contents 44.5 px wide, ribbon logos 44 px wide, research unchanged at 44.5. Also the reduced-motion partner grid cells (34 px tall) now 44, with the row gap cut so the grid is 10 px taller in total | d7f6b92 |

## Batch 2

| # | Item | Before | After | Commit |
|---|---|---|---|---|
| B1 | `/rules#%` | Route error fallback ("Something went wrong on this page"), no rulebook | Rulebook renders (16 h2), no page error; `/rules#kill-switch` still lands 176 px from the top | f3e6075 |
| B2 | Menu scroll lock vs programmatic scroll | 900x800 mouse: a Lenis scroll in flight when the menu opens **runs on ~1,150 px** under the menu; the hero glide (menu opened 0.1 s into the last clip) **scrolls the page to 787 px** behind the menu | Lenis stops as the menu opens (scrollY frozen, unchanged after close); the glide stands down while locked (scrollY 0 through 4 s open and 3.5 s after close; it retries on the next cycle). Shared `lockScroll()` in `lib/motion` | 98ac6fc |
| B3 | Menu focus loop | 390x844 and 900x800: Tab after "Join the Slack" **left for the browser (body)** | Tab and Shift+Tab loop over bar and menu, never leave the nav; panel `role="dialog" aria-modal="true" aria-label="Menu"`; Escape returns focus to the toggle | f41d704 |
| B4 | svh fallbacks | Built CSS had svh/lvh only | vh declared plainly, svh/lvh under `@supports (height: 1svh)` (html/body min-height, menu max-height, scrim height, phone section tokens). Checked in the built CSS: a plain second declaration was dropped by the minifier, the `@supports` form survives. No browser without svh here to render it | 08830a5 |
| B5 | Car chapter after a breakpoint change | Scroll the car through at 700x900 (compact), resize to 1440x900, chapter top 40% down (pin not started): **car exploded, 7 of 7 callouts open** (`car-resize-before.png`) | Assembled, 0 callouts (`car-resize-after.png`) | b518f4c |
| B6 | Hero clips after desktop -> compact | Resize 1440 -> 700 wide 2.5 s in: `race-02-1920`, `race-03-1920`, `iv-rest-v2-1280` still requested | `race-01` (queued, not started) reloads as 960, then `race-02-960`, `race-03-960`, `iv-rest-v2-960`; playback never restarted | c703ccf |

## Sweep

`/`, `/about`, `/race`, `/news`, `/research`, `/rules`, `/assembly`, `/build`,
`/learn` at 1440x900, 390x844 (touch) and 844x390 (touch): no console errors
from site code (LinkedIn's frame still throws `getInstalledRelatedApps` on
/news), no horizontal overflow.

## For Cedric

- **New string:** `Menu` (the menu dialog's accessible name, not visible).
- **aria-modal on the menu panel** was asked for. The bar's close toggle sits
  outside that panel, so a screen reader that honours aria-modal (VoiceOver)
  may treat the bar as inert while Tab still reaches it. If that shows up on
  an iPhone, the fix is a close button inside the panel (a new label).
- **Past crew at lg** now has 7 to 12 columns instead of a fixed 12, so the
  section is taller between 1024 and about 1260 wide (and on touch laptops and
  iPads). This was your call per VERIFY; the change is the smallest that keeps
  every surname whole.
- Not verified here: a browser without svh (B4), iOS Safari.
