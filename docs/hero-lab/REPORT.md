# Hero cinematic v1: morning report (overnight trial, 2026-08-30)

## Verdict

Worth continuing: the scroll-scrubbed film works end to end on real generated footage, the take
holds the car geometry through all 121 frames, and the whole chapter passes the section 10 checks.
The footage is 720p (Starter refused every 1080p model that takes a start image), so the desktop
set is 1280 wide, the same as the hero loop you approved for v5; the film itself is quiet, a slow
push-in with the lead car edging ahead, closer to "two cars on the grid" than to a chase.
Decide on localhost: `/` (film) against `/?hero=classic` (the clip cycle); 57.5 of the 278
credits went, 220.5 remain.

Draft PR: https://github.com/f1tenth/roboracer-site/pull/18 (into `revamp/landing-v1`; nothing on
that branch changed).

## Credits

| | |
|---|---|
| balance at start | 278 |
| balance at the end | 220.5 |
| spent (balance-based) | **57.5** of the 250 cap, unattended ceiling 200 |
| jobs | 13 created: 10 stills completed, 2 video jobs refused by the plan (nothing charged), 3 video takes completed; 0 wrapper refusals |

Per job (`docs/hero-lab/budget.json`, balance after each):

| # | job | model | credits | balance after |
|---|---|---|---|---|
| 1-4 | stills round 1 a-d (composition) | `nano_banana_2` = Nano Banana Pro, 2k 16:9, 9 refs | 2 each | 270 |
| 5-7 | stills round 2 a-c (light, anchored on 1b) | same + 1b as 10th ref | 2 each | 264 |
| 8-10 | stills round 3 a-c (pose, anchored on 2b) | same + 2b as 10th ref | 2 each | 258 |
| 11 | take A | `seedance_2_0` std 720p | refused: `"Pro" or "Ultimate" plan required` | 258 |
| 12 | take A | `kling3_0 --mode pro` | refused: same message | 258 |
| 13 | take A | `seedance_2_0_mini` 720p, start image + 4 refs | 12.5 | 245.5 |
| 14 | take B | `seedance_2_0_mini` | 12.5 | 233 |
| 15 | take C | `seedance_2_0_mini` | 12.5 | 220.5 |

The ledger's `spent_est` (88.75) counts the two refused jobs' estimates; the account balance is
the truth (57.5).

## The locked frame and the take

**Locked frame: round 3, still b** (`docs/hero-lab/LOCKED_FRAME.md`, 23/25 on the section 3
rubric, self-approved unattended). Composition from 1b (a 15 cm camera on the straight, the cars
coming at it), light from 2b (cooler key, dark glossy floor), pose from 3b (side by side with a
gap). Ten stills in three rounds, one variable per round, the winner of each round attached as an
extra reference to the next so the composition held.

![locked frame](https://raw.githubusercontent.com/f1tenth/roboracer-site/revamp/hero-cinematic/docs/hero-lab/locked-frame-1200.jpg)

Sheets: [round 1](https://raw.githubusercontent.com/f1tenth/roboracer-site/revamp/hero-cinematic/docs/hero-lab/stills/round-1.jpg) (composition) ·
[round 2](https://raw.githubusercontent.com/f1tenth/roboracer-site/revamp/hero-cinematic/docs/hero-lab/stills/round-2.jpg) (light) ·
[round 3](https://raw.githubusercontent.com/f1tenth/roboracer-site/revamp/hero-cinematic/docs/hero-lab/stills/round-3.jpg) (pose); prompts and verdicts in `docs/hero-lab/stills/round-N.md`.

**Take: C, the slow push-in** (`docs/hero-lab/takes/SCORES.md`, 25/25 on the fidelity bar; A 22,
B 21). Seedance 2.0 Mini, 1280x720, 24 fps, 5.04 s, 121 frames, job
`59c31927-9c62-4817-aa32-3f52b278c7ed`. It starts on the locked frame, both cars keep the sensor
tower, the LiDAR glow, the markers and the white wheels to the last frame, the lead car pulls half a
length ahead between 2.5 and 3.8 s, and the last second holds both cars large and sharp under the
headline. A had the camera pull back and return (22); B is the most cinematic clip (the lead car
sweeps past the lens) but does not start on the locked frame and ends on a blur (21).

![take C](https://raw.githubusercontent.com/f1tenth/roboracer-site/revamp/hero-cinematic/docs/hero-lab/takes/take-C-sheet.jpg)

[take A sheet](https://raw.githubusercontent.com/f1tenth/roboracer-site/revamp/hero-cinematic/docs/hero-lab/takes/take-A-sheet.jpg) ·
[take B sheet](https://raw.githubusercontent.com/f1tenth/roboracer-site/revamp/hero-cinematic/docs/hero-lab/takes/take-B-sheet.jpg).
A 0.5x slow-motion encode of C (48 fps, 9.9 s, 2.9 MB) sits in `_harvest/higgsfield/slowmo/` for
the Highlights idea; B is worth the same treatment if you like the pass.

## What was built

| file | what |
|---|---|
| `src/lib/frameSequence.ts` | framework-free frame engine: `FrameLoader` (coarse pass every 6th frame, then the rest, 6 in flight, `decode()` with a fallback for frames Chrome declines to keep decoded, nearest-loaded lookup) and `FrameCanvas` (cover-fit drawer, DPR capped at 2, one paint per animation frame, `focusX` anchor, painted/skipped counters); `frameAt(p)` shared with the glide and the QA |
| `src/components/ui/HeroCinematic.tsx` | the chapter: 400vh pin, sticky 100svh viewport, poster `<picture>` (LCP, 1280 from 768px / 960 below) under a canvas that fades in when the coarse pass is done, one scrubbed GSAP timeline (proxy frame tween, dim, per-line beats with word stagger, zoom, description, caption), the HeroChapter scroll-out copied, idle glide, scroll cue, static fallback, `will-change` while pinned, `caption` prop, dev-only `window.__heroCine` for the QA |
| `src/pages/Landing.tsx` | `HERO_CINE` (frame sets through `mediaUrl`, posters, beats, focusX); `?hero=classic` renders `HeroChapter`, anything else `HeroCinematic`; same `HEADLINE_LINES` and `HERO_DESCRIPTION` |
| `public/media/hero-cine/` | `manifest.json`, `poster-1280.webp` (56 KB), `poster-960.webp` (36 KB) committed; `d/` 121 frames 1280x720 q74 (5.93 MB) and `m/` 80 frames 960x540 q60 (2.41 MB) git-ignored, local only |
| `scripts/hf.py` | fix: result URLs are collected outside the echoed request params (the first still re-downloaded its nine references as results) |
| `scripts/stills-sheet.py`, `scripts/qa-hero-cine.py` | the still tiler (480 px tiles, under 400 KB) and the QA capture/measurement script |
| `docs/hero-lab/*` | REFS, LOCKED_FRAME, MODEL_PICK, stills rounds, takes/SCORES, LOG, this report |
| `docs/qa/hero-cinematic.md` | the QA report, Verdict: PASS |
| `docs/ASSET_MANIFEST.md` | rows HC-01..06, provenance `AI-generated (Higgsfield seedance_2_0_mini, job 59c31927...) from RoboRacer organizer references (Felix Jahncke DSLR, Cedric's clips), ICRA 2026 Vienna` |
| `docs/HANDOFF.md` | section 8, a pointer to this trial |

`HeroChapter.tsx` is untouched.

## The schedule numbers shipped (section 12)

| | |
|---|---|
| chapter height | 400vh (`h-[400vh]`), sticky 100svh viewport |
| `SCRUB_START` / `SCRUB_END` | 0.05 / 0.80, `scrub: 0.8` |
| `BEATS` | [0.33, 0.55, 0.70]: A frame 45 (the lead car large), B frame 80 (half a length ahead), C frame 104 (both settled); each line lands over 0.10 of p, words inside a line staggered so the last stands at beat + 0.10 |
| block scale | 1 -> 1.30 (1.12 under 768px) over p 0.27..0.70, power1.inOut |
| footage filter | brightness 1 -> 0.42, saturate 1 -> 0.8 over p 0.28..0.70; scroll-out 0.42 -> 0.12 over q 0..0.6 |
| description | fades in over 0.08 from p 0.72 |
| hold | p 0.80..1.00 on frame 120, no transforms |
| scroll-out fade | q 0.22..0.62, power2.inOut, the block as one (HeroChapter's numbers) |
| nav fill | `data-nav-fill="0.80 0.97"` (static layout 0.1 0.6) |
| frame sets | desktop 121 x 1280x720 WebP q74, 5.93 MB, 24 fps; mobile 80 x 960x540 q60, 2.41 MB, 15.9 fps; posters 56 / 36 KB |
| `focusX` | 0.35 (the lead car; a phone crop keeps about a quarter of the width) |
| glide | 2 s after the coarse pass, only if still at the top, to p 0.55 over max(1.5 s, frames covered / 24) = 3.3 s desktop, 2.2 s mobile; cancelled by wheel, touch, key or pointer; never under reduced motion |
| poster push-in | scale 1 -> 1.06 over 12 s on the footage layer (the canvas inherits it) |
| take / model / flags | take C, `seedance_2_0_mini --start-image locked-frame.png --image ref-01,02,04,06 --duration 5 --aspect_ratio 16:9 --resolution 720p --generate_audio false`, 12.5 credits; stills `nano_banana_2 --aspect_ratio 16:9 --resolution 2k` + 9 refs, 2 credits |
| caption | `rendered from ICRA 2026 photographs`, mono eyebrow, bottom-left, from p 0.05; `caption={null}` removes it |

## QA summary (`docs/qa/hero-cinematic.md`, Verdict: PASS)

Lint and build green. Captures at 1440x900, 768x1024 and 390x844 at p = 0, 0.30, 0.55, 0.80, 1.00
and q = 0.4 (24 PNGs under `docs/qa/hero-cinematic/`, git-ignored; `run.json` committed). Film at
1440 and 768 with 121/121 frames loaded, the mobile set at 390 with 80/80; 0 console errors, 0
warnings, 0 failed requests, one `h1` everywhere. The state read off the DOM at each stop matches
the schedule (line 1 in by p 0.55, all three and the description at 0.80, block scale 1.30 and
unchanged through the hold, brightness 0.42; q 0.4 block opacity 0.629 on the film and 0.629 on
the classic hero). Reduced motion: `data-hero-cine="static"`, no canvas, no video, zero frame
requests, the poster then the headline on paper. `/?hero=classic`: the video hero, 320vh,
untouched. axe at 1440 with the headline standing: 0 violations. Frame timing under software GL,
record only: 361 rAF frames in a 6 s scripted scroll, 16.7 ms mean / 16.8 ms max (the swiftshader
vsync), the drawer painted 128 frames and coalesced 68 requests away. The captures: the poster is
the locked frame under the transparent nav; the phone crop follows the lead car; the words fade in
place under the Highlights strip exactly as the classic hero does.

Throttled network (dev server, record only): at 6 Mbps the poster shows 0.2 s after the chapter
mounts, the canvas takes over at 22 s and the full set is in at 32 s; at 1.5 Mbps the poster leads
by 2 s, a scroll at 27 s already lands line 1 over the poster, the coarse pass arrives at 104 s and
only 56 of 121 frames were in after two minutes. The design holds (nothing waits on the network);
the frames compete with the rest of the landing after `load`, which the R2 host and AVIF would ease.

## Decisions taken without you (all in `docs/hero-lab/LOG.md`)

1. Stills on `nano_banana_2`, which the CLI resolves to Nano Banana Pro, at 2k: same price as 1k
   and as Nano Banana 2 at 2k, and generating the rounds at 2k makes the winner the locked frame
   itself (no seed control, a re-render would differ).
2. Reference set of 7 photos + 2 clip frames (`REFS.md`); P1022921 rejected for the McDonald's box
   cover, `startline_eth.png` for the readable team placard, `Unicorn-speed.jpg` for the people.
3. Round winners 1b, 2b, 3b; the lock on 3b at 23/25 after round 3 (no still scored 5/5 before).
4. Model pick by the contract's order: Seedance 2.0 std 720p (22.5) with Kling 3.0 pro as fallback;
   took the full Seedance over Mini although the tie-break says cheaper, for fidelity.
5. Both the pick and the fallback were refused by the plan; walked the measured list in the same
   order (Mini first because it takes references) and stopped at the first the plan accepted,
   Seedance 2.0 Mini, which became the one model for all takes. Kling 3.0 turbo, Wan 2.7, MiniMax
   H3, Kling 2.6 and Veo 3.1 Lite were never tried (their availability is unknown).
6. Take C chosen at 25/25 and generation stopped there (stop condition met), no take D; 13 jobs.
7. Beats [0.33, 0.55, 0.70] read off C's sheet; `focusX` 0.35 so phones follow the lead car
   rather than the gap between the cars.
8. The wrapper fix in `scripts/hf.py` (input references collected as results), committed.
9. The QA walk waits for a still page: the idle glide runs 2 to 5 s after load and the first dry
   run's captures were taken inside it. Verified separately that a real wheel after the glide
   scrolls smoothly on both heroes.
10. A pointer section in `docs/HANDOFF.md` and the manifest rows, since the morning session starts
    from those files.

## Follow-ups (section 9 plus tonight's)

- Upload `public/media/hero-cine/` to R2 (`npx wrangler r2 object put roboracer-media/media/hero-cine/...`
  per file, or rclone with an R2 remote); until then a GitHub build ships manifest and posters only
  and the hero degrades to the poster with the headline schedule running over it.
- The caption: keep, reword or remove (`caption` prop, default on).
- AVIF frames (about half the bytes) once `avifenc` is available.
- The first-load budget exception: the poster (56 KB) is the LCP element; the 5.9 MB desktop set
  streams after `load` like the clip cycle does today (2.4 MB on phones). Yours to accept.
- Whether the slow-motion encode of C (or B's close pass) replaces highlight tile 1.
- Mobile focus with you: 0.35 shows the lead car alone; 0.5 shows the gap and slivers of both.
- 1080p footage needs a plan with Seedance 2.0 std or Kling 3.0 pro, or a test of Kling 3.0 turbo /
  Wan 2.7 / MiniMax H3 on Starter (each refused job is free); the desktop set would then be 1600 wide.
- Real-GPU frame timing and Safari; a throttled-network check of the coarse-pass fade.
- The ledger rows of the first four stills list the stray reference copies among their files
  (cosmetic, the files were deleted).

## How to review

```
cd ../roboracer-site-wt/hero-cinematic && scripts/rr.sh dev
```

then `/` (the film: scroll slowly, or wait two seconds for the glide) and `/?hero=classic`. If the
frames 404, restart the dev server: it caches `public/` at start-up and the frames were cut after
the run began. The frame set is local only; a production build points `mediaUrl` at R2 where the
frames are not yet.
