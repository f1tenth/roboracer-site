# QA: hero cinematic (`/`), overnight trial 2026-08-30

Verdict: **PASS**. Branch `revamp/hero-cinematic`, worktree `../roboracer-site-wt/hero-cinematic`,
run 03:00 against the Vite dev server on port 60011 (`VITE_MEDIA_BASE` unset, so the frames come
from `public/media/hero-cine/`). Script: `scripts/qa-hero-cine.py` (Playwright in the ML venv,
headless Chromium 151 with `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader`, 16
logical cores so the weak-device rule does not fire). Machine-readable evidence:
`docs/qa/hero-cinematic/run.json`; the 24 PNGs next to it are git-ignored (repo rule), the
committed contact sheets are `docs/hero-lab/stills/round-*.jpg` and `docs/hero-lab/takes/take-*-sheet.jpg`.

Capture method (contract 1.7 / 10.4): `window.scrollTo(top + p * (H - vh))`, `page.mouse.wheel(0, 1)`,
600 ms settle, CDP `Page.captureScreenshot` of the viewport. The walk starts only once the frame set
has loaded and the page has been still for a second: the idle glide runs 2 to 5 s after load and a
walk that starts inside it fights it (found in the first dry run; not a user-facing issue, see
"specific checks").

## Acceptance (contract section 10)

| # | item | result |
|---|---|---|
| 1 | `npm run lint`, `npm run build` | both clean at the QA commit; build 5.4 s, `Landing-*.js` 135 kB (was 121 kB), `motion-*.js` unchanged; Vite copies the local frames into `dist/media/hero-cine/` (8.5 MB, not deployed: the frames are git-ignored, the GitHub build ships manifest + posters only) |
| 2 | `LOCKED_FRAME.md`, `MODEL_PICK.md`, `takes/SCORES.md`, `REPORT.md` | all four under `docs/hero-lab/` |
| 3 | `public/media/hero-cine/manifest.json`, both sets under budget | desktop 121 frames 1280x720 q74 **5.93 MB** / 9 MB; mobile 80 frames 960x540 q60 **2.41 MB** / 2.5 MB (three quality steps from q72); posters 56 KB and 36 KB (under 150 KB) |
| 4 | `/` renders `HeroCinematic`, `/?hero=classic` the old hero; captures 1440x900, 768x1024, 390x844 at p = 0, 0.30, 0.55, 0.80, 1.00 | `data-hero-cine="film"` at all three sizes, `/?hero=classic` has no `data-hero-cine`, a `<video>` and a 320vh chapter; 15 p-captures plus 3 at q 0.4 in `docs/qa/hero-cinematic/` (`<vp>-p<pp>.png`, `<vp>-q040.png`); chapter 3600 / 4096 / 3376 px = 400vh at each size; desktop set at 1440 and 768 (121/121 frames loaded, 0 failed), mobile set at 390 (80/80) |
| 5 | reduced motion: poster + static headline, no canvas, no frame requests | `data-hero-cine="static"`, `hasCanvas` false, no `<video>`, one request to `/media/hero-cine/` (the 1280 poster), **0 frame files**; `reduced-motion-1440-top.png` (poster at 100svh) and `-1vh.png` (headline and description on paper) |
| 6 | console 0 errors at all three viewports; axe on `/` 0 serious or critical in the hero | 0 console errors, 0 warnings, 0 page errors, 0 failed requests, 0 responses >= 400 at 1440, 768 and 390 (also in the reduced-motion and classic contexts); axe at 1440 with the headline standing (p 0.9): **0 violations** of any impact, 0 in the hero |
| 7 | frame timing, record only | 6 s scripted scroll through the chapter at 1440x900 under software GL: **361 rAF frames, mean 16.7 ms, median 16.7 ms, p95 16.8 ms, max 16.8 ms** (the swiftshader vsync); the drawer painted **128** frames and skipped **68** coalesced draw requests, film index at the end 120 of 120 (`run.json` -> `timing`). Not a threshold; a v4 measurement on the same machine put the video hero at 130 to 180 ms a frame under the same GL, the canvas path is much lighter |
| 8 | beats land where section 7 says; words never move during the hold; scroll-out fade matches the classic hero at q 0.4 | see the state table below: line 1 in by p 0.55 (beat A 0.33 + 0.10), line 2 and 3 in by 0.80, block scale 1.30 from p 0.70 on and identical at 0.80 and 1.00 (`matrix(1.3, ...)`, no transform change through the hold), description 1.0 at 0.80; q 0.4: block and description opacity **0.629** on the film and **0.629** on the classic hero (`classic-1440-q040.png`), footage brightness 0.2195 (0.42 -> 0.12 ramp) vs 0.2062 (classic 0.38 -> 0.12) |
| 9 | this report with `Verdict: PASS` | yes |
| 10 | committed, pushed, draft PR open | see `docs/hero-lab/REPORT.md` (the PR link is there) |

## State read off the DOM at each stop (1440x900; 768 and 390 identical to three decimals except the frame index)

| stop | scrollY | film frame (of 120) | line 1 / 2 / 3 opacity | block scale | description | footage filter | nav alpha |
|---|---|---|---|---|---|---|---|
| p 0.00 | 0 | 0 | 0 / 0 / 0 | 1.00 | 0 | brightness(1) saturate(1) | 0 |
| p 0.30 | 810 | 39.97 | 0 / 0 / 0 | 1.03 | 0 | brightness(0.973) saturate(0.991) | 0 |
| p 0.55 | 1485 | 79.97 | 1 / 0 / 0 | 1.23 | 0 | brightness(0.627) saturate(0.872) | 0 |
| p 0.80 | 2160 | 119.95 | 1 / 1 / 1 | 1.30 | 0.996 | brightness(0.42) saturate(0.8) | 0.002 |
| p 1.00 | 2700 | 120 | 1 / 1 / 1 | 1.30 | 1 | brightness(0.419) saturate(0.8) | 1.000 |
| q 0.40 | 3060 | 120 | 1 / 1 / 1 | 1.30 | 0.629 | brightness(0.2195) saturate(0.8) | 1.000 |

At 390 the film index is 26.3 / 52.7 / 79 (mobile set of 80) and the block scale peaks at 1.12
(narrow). The p 0.30 stop shows the footage barely dimmed (0.973): the dim starts at pA - 0.05 = 0.28,
so the first words land on footage that still reads as footage.

## What the captures show

- `1440-p000`: the poster (frame 1, the locked composition: two cars side by side on the straight,
  KNAPP boxes and tubes both sides) under the transparent nav; the top gradient keeps the white
  links readable over the bright hall.
- `1440-p030`: frame 40, the cars closer, the caption `rendered from ICRA 2026 photographs`
  bottom-left, no words yet.
- `1440-p055`: line 1 (logo gradient) standing over the film, "built" rising, the lead car pulling
  ahead; `768-p055` the same over the tablet crop.
- `1440-p080` / `-p100`: all three lines and the description over the footage at 0.42 brightness,
  both cars large and sharp under the words; nothing moves between 0.80 and 1.00.
- `390-p055` / `390-p100`: the phone crop (`focusX` 0.35) follows the lead car (tower, LiDAR glow,
  white wheels) and the second car stays out of frame; the full headline and description are
  readable over the dimmed car at the hold. Cedric's call whether the phone should show the gap
  between the cars instead (follow-up in the report).
- `1440-q040` vs `classic-1440-q040`: the same fade in place under the Highlights strip.
- `reduced-motion-1440-*`: poster, then the ink headline on paper with the description.
- `classic-1440-top`: the clip-cycle hero unchanged.

## Specific checks

| check | result |
|---|---|
| one `h1` per page | 1 at every viewport, in both variants and under reduced motion |
| `HeroChapter.tsx` untouched | `git diff revamp/landing-v1 -- src/components/ui/HeroChapter.tsx` is empty |
| frames stream after `load`, poster first | `frame_requests` 122 at 1440/768 (121 frames + poster) and 81 at 390; the loader starts on `window` `load`; the coarse pass (every 6th frame) fades the canvas in over the poster |
| nearest-loaded-frame drawing | the timing run painted 128 frames while the 6 s scroll asked for ~360 draws: draws coalesce to one per animation frame and never wait on the network |
| idle glide | fires once, 2 s after the coarse pass, only when still at the top, and scrolls to p 0.55 over 3.3 s (80 frames at 24 fps); a wheel event during or after it scrolls normally (measured: 1485 -> 1585 for a 100 px wheel, smooth). Never under reduced motion |
| `will-change` | set to `transform` on the footage layer, block, description and units only while the pin is active (`onToggle`) |
| caption prop | `caption={null}` removes the tag; default text shown |
| assets | every `<img>` in the hero has `alt`, `width`, `height`; the poster `<picture>` serves the 1280 file from 768px and the 960 file below |

## Not covered tonight

Real-GPU frame timing (only software GL here); Safari and Firefox; a slow network throttle for the
coarse-pass fade (the loader logic is exercised, the timing of the fade is not measured); the R2
path (`VITE_MEDIA_BASE` set) until the frames are uploaded.
