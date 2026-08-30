# QA: hero cinematic v2, the four-act film (`/`), 2026-08-30 09:20

Verdict: **PASS**. Branch `revamp/hero-cinematic` at the v2 film commit, dev server on port 38781
(`VITE_MEDIA_BASE` unset, frames from `public/media/hero-cine/`), `scripts/qa-hero-cine.py` as for
v1 (`docs/qa/hero-cinematic.md` has the method). Evidence: `docs/qa/hero-cinematic-v2/run.json`
(PNGs git-ignored); the act-by-act captures reviewed by eye are described below.

| # | item | result |
|---|---|---|
| 1 | lint, build | `tsc` and eslint clean on the wired files; `npm run build` green at the fork's commit (the v2 constants only change numbers) |
| 2 | frame set under budget | desktop 200 frames 1280x720 q74 **7.56 MB** / 9 MB; mobile 80 frames 960x540 q72 **2.07 MB** / 2.5 MB; posters 64 / 35 KB |
| 3 | `/` renders the film, `/?hero=classic` the old hero | `data-hero-cine="film"` at 1440, 768, 390; chapter **6300 / 7168 / 5908 px = 700vh**; classic: no `data-hero-cine`, a `<video>`, 2880 px |
| 4 | frames load, nothing waits on the network | 200/200 at 1440 and 768 (desktop set), 80/80 at 390 (mobile set), 0 failed; the poster (KF1) is the LCP element as before |
| 5 | reduced motion | static variant, no canvas, no video, 0 frame files, only the 1280 poster requested |
| 6 | console, requests, axe | 0 errors, 0 warnings, 0 page errors, 0 failed requests, 0 responses >= 400 at all three sizes and in the reduced/classic contexts; axe at 1440 with the headline standing: **0 violations** |
| 7 | timing (record only, software GL) | 6 s scripted scroll at 1440: 360 rAF frames, mean 16.7 ms, median 16.7 ms, p95 16.7 ms, max 33.4 ms; the drawer painted 161 frames and coalesced 104 requests; film index 199 at the end |
| 8 | the schedule | state at the stops below; the words never move after landing, they fade in place over the dissolve; the scroll-out runs the footage ramp only (the text is already gone) |

## State at the stops (1440x900; 768 identical; 390 on the 80-frame set)

| p | set frame | act | lines 1/2/3 | block | description | footage filter | nav |
|---|---|---|---|---|---|---|---|
| 0.00 | 0 | poster (KF1) | 0/0/0 | 1 | 0 | brightness 1 | 0 |
| 0.12 | 19 | chase | landing | 1 | 0 | 0.95 | 0 |
| 0.20 | 37 | chase, line 1 stands | 1/rising/0 | 1 | 0 | 0.76 | 0 |
| 0.30 | 60 | the pass | 1/0.01/0 | 1 | 0 | 0.52 | 0 |
| 0.45 | 95 | side drone move | 1/1/1 | 1 | 1 | 0.42 | 0 |
| 0.55 | 118 | side, end | 1/1/1 | 1 | 1 | 0.42 | 0 |
| 0.60 | 130 | the dissolve | 1/1/1 | **0.57** | 0.57 | 0.70 (returning to 1) | 0 |
| 0.66 | 144 | the void | 1/1/1 | **0** | 0 | 1 | 0 |
| 0.72 | 157 | the void, explosion starts | | 0 | 0 | 1 | 0 |
| 0.85 | 188 | exploded | | 0 | 0 | 1 | 0 |
| 0.95 | 199 | hold | | 0 | 0 | 1 | 0.63 |
| 1.00 | 199 | hold | | 0 | 0 | 1 | 1 |
| q 0.40 | 199 | scroll-out | | 0 | 0 | 0.41 (1 -> 0.12 ramp) | 1 |

(At 390 the first walk stop of the automated run landed early, set frame 6 instead of 24: the
script's stillness check ended before the idle glide fired on the fast-loading mobile set; the
manual re-check at 390 p 0.30 gave frame 23.8. The check now waits the glide's 2 s first.)

## What the captures show (`docs/qa/hero-cinematic-v2/`, plus the act captures reviewed at 1440)

- p 0.01: the chase frame, our car from behind, the Unicorn car ahead right, transparent nav.
- p 0.20-0.30: line 1 lands over the chase; the pass is under way with "built" rising.
- p 0.45-0.56: the full headline and the description stand over the slow drone move at the car's side
  (the footage at 0.42 brightness, the Unicorn car gone).
- p 0.60: the hall dissolving; the words at 0.57 opacity, leaving in place.
- p 0.66-0.72: the car alone in the dark void, no text, the caption still bottom-left.
- p 0.85-1.00: the exploded view; the last frame holds; the nav fills from 0.90.
- Reduced motion: KF1 poster at 100svh, then the headline and description on paper.
- Classic: unchanged.

## Not covered

Real-GPU timing; Safari/Firefox; the R2 path; a throttled-network re-run on the 200-frame set (the
v1 measurement stands: the poster leads, the frames stream after `load`).
