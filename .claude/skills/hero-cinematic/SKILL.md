---
name: hero-cinematic
description: How the roboracer.ai scroll-scrubbed cinematic hero is built and how Higgsfield media is generated for it under Cedric's credit rules - frame-sequence scrubbing on a canvas (Apple product-page technique), the loader and drawer reference implementation, the GSAP schedule pattern, budgets, reduced-motion and a11y rules, the stills-first / one-video-model workflow, prompt recipes, the fidelity bar, and the budget wrapper scripts/hf.sh. Load for any work on HeroCinematic.tsx, src/lib/frameSequence.ts, public/media/hero-cine, docs/hero-lab, or any higgsfield command.
user-invocable: false
---

# Cinematic hero (scroll-scrubbed film) and Higgsfield generation

Contract: `docs/plans/hero-cinematic-v1.md` (sections 5 to 10 are the build; section 1 the rules).
References next to this file: `references/frame-scrubber.md` (loader + drawer code, wiring),
`references/higgsfield-prompts.md` (recipes, rounds, fidelity bar).

## The technique in five lines

1. The take (5 s, 16:9) becomes 120 to 160 WebP frames (desktop, 1600 wide at most, never above
   the source width) and 60 to 80 (mobile, 960), extracted by `scripts/frames.sh frames`.
2. A pinned 400vh chapter keeps a 100svh sticky viewport; a canvas draws the frame that matches
   pin progress p over `SCRUB_START..SCRUB_END` (0.05..0.80), through one scrubbed GSAP timeline
   (proxy tween `{f}` with `onUpdate`), `scrub: 0.8`.
3. Frames load after `window` `load`, every 6th first (coarse), then the rest; the poster (frame 1)
   is the LCP element and the canvas fades in over it when the coarse pass is done. The drawer
   always paints the nearest loaded frame; nothing in the scroll path waits on the network.
4. The headline (same markup and copy as `HeroChapter.tsx`) lands on three footage beats
   (`BEATS`), the block scales 1 to 1.30 across them, the canvas dims to brightness 0.42 as the
   words arrive, and the scroll-out (fade 0.22..0.62 of q, dim to 0.12) is copied verbatim.
5. Reduced motion or a weak device: poster then static headline on paper, no canvas, no frames.

## Rules that are easy to break

- Never upscale (CLAUDE.md rule 3): frame width is capped at the source width; 720p sources give
  1280-wide desktop frames, and the report says so.
- `public/media/hero-cine/**` is git-ignored except `manifest.json` and the two posters (each
  under 150 KB). Frames are local for the review; the R2 upload is a follow-up.
- Budgets: desktop set under 9 MB, mobile under 2.5 MB (`scripts/frames.sh report`). The set is
  not first-load transfer (it streams after `load`, like the video does today); the report lists
  this as an exception for Cedric to accept.
- One `h1` with the full sentence as `aria-label`; animated spans `aria-hidden`; the canvas
  `aria-hidden`; the poster `<img>` carries the alt.
- Nav fill through `data-hero-chapter` and `data-nav-fill="0.80 0.97"` (NavBar reads it).
- No blur filter (measured too expensive in v4), no film grain, no letterbox bars, no vignette
  beyond the two edge gradients `HeroChapter` already has. Accent rules unchanged: line 1 in the
  logo gradient, everything else white on ink.
- The classic hero stays reachable at `/?hero=classic`; `HeroChapter.tsx` is not edited.
- Words never move after they land; the hold is transform-free; the exit is a fade.
- `will-change` only while pinned. Draws coalesced to one per animation frame. ResizeObserver
  resizes the canvas (DPR capped at 2).

## Higgsfield, in this repo

- The CLI (`higgsfield`, OAuth login done by Cedric, credentials in `~/.config/higgsfield/`),
  never the MCP, and only through `scripts/hf.sh`: `scripts/hf.sh --cost-only <job_type> ...`
  (free), `scripts/hf.sh <job_type> ...` (estimate, ledger check, create with `--wait --json`,
  download to `_harvest/higgsfield/<stamp>-<job>/result.*`, ledger row, balance re-read),
  `scripts/hf.sh status`. A PreToolUse hook blocks `higgsfield generate create` typed directly.
- Ledger `docs/hero-lab/budget.json`: cap 250, unattended ceiling 200, per-job max 40. Exit 2
  means refused; read the reason, choose a cheaper resolution, duration or mode, never retry the
  same job. Exit 5 means the session expired: stop generating, log it, continue the build.
- Stills first with the cheapest multi-reference image model (expected `nano_banana_2`, about 2
  credits); no video job before `docs/hero-lab/LOCKED_FRAME.md` exists. One video model, chosen
  from measured costs into `docs/hero-lab/MODEL_PICK.md` (pick + fallback), approved by Cedric.
- `--duration 5`, `--sound off` / `--generate_audio false`, never 4k, one job at a time.
- A job that times out in the wrapper (25 min) may still finish server-side: `higgsfield generate
  get <job_id>` / `higgsfield generate list --json` (both allowed, they create nothing) recover the
  result URL; download it into the job's folder and add the file to the ledger row by hand.
- Model flags: `higgsfield model get <job_type>` (live), or the CLI's `MODELS.md`. Flag names
  accept `-` or `_`. Media flags take a local path (auto-uploaded) or a job UUID.
- Every shipped asset gets a `docs/ASSET_MANIFEST.md` row with provenance `AI-generated
  (Higgsfield <model>, job <id>) from RoboRacer organizer references, ICRA 2026 Vienna`.

## Reading the footage (director, by eye)

`scripts/frames.sh sheet <mp4> <out.jpg>` burns source frame numbers and times into a 4x3 sheet.
Use it to: score takes (fidelity bar in the prompts reference), pick `BEATS` (A: lead car fills its
third; B: the overtake; C: both settle), pick `focusX` for the mobile crop, and choose the hold
frame (the last frame unless the clip ends badly, then set `SCRUB_END` to stop earlier).

## QA for the chapter

Captures at 1440x900, 768x1024, 390x844 for p = 0, 0.30, 0.55, 0.80, 1.00 and q = 0.4
(CDP screenshot after `scrollTo`, `page.mouse.wheel(0, 1)`, 600 ms settle), a reduced-motion
capture, console at all three, axe on `/`, a 6 s scripted scroll with frame timing in headless
Chromium (`--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader`; software GL numbers,
record only, never a threshold). Capture against `scripts/rr.sh dev --port 0` or a build made with
`VITE_MEDIA_BASE= npm run build`: `.env.production` points `mediaUrl` at R2, where the frames are not.
Report to `docs/qa/hero-cinematic.md` with `Verdict: PASS` or `FIX` and the table.
