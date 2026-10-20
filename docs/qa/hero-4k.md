# QA: the hero from the 4K GoPro lap (`revamp/hero-4k`)

2026-10-20. What changed: `docs/media/HERO_4K.md`. Build and lint green
(`tsc -b`, `eslint .`). Preview: the worktree's `dist-preview` built with
`VITE_MEDIA_BASE=` (clips served from `public/`) on `127.0.0.1:4180`.

## Method

Google Chrome through Playwright (Python, `channel="chrome"` for H.264,
`--use-gl=angle --use-angle=swiftshader`), a fresh profile per run, CDP
`Network.emulateNetworkConditions` for the throttled cases (40 ms latency,
2 Mbit/s up). `navigator.connection` is overridden per run (the headless
profile otherwise reports 1.65 Mbit/s, "3g"): `{downlink: 10,
effectiveType: "4g"}` is what desktop Chrome reports on a fast link, `none`
removes the API as in Safari and Firefox. An init script logs `loadstart`,
`suspend`, `playing`, `waiting`, `error` and the first `requestVideoFrameCallback`
on both hero elements; the visible clip's `currentTime` is sampled every
250 ms (frozen = playing but not advancing, as in `docs/media/HERO_PERF.md`).
Runs of 60 to 70 s, which is one cycle: opening, three race cuts, the lap.

## Throttled runs

Rungs are listed in cycle order: opening, race cut 1, 2, 3, the lap, then
the second cycle's race cuts where the run reached them. "First frame" is
the first video frame after navigation start; "frozen" the time the visible
clip was playing but not advancing, over the run.

First matrix (before the three fixes below; it is what found them):

| Case | Connection API | First frame | Frozen | Rungs picked | Notes |
|---|---|---|---|---|---|
| 1440x900 1x, unthrottled | downlink 10, 4g | 0.79 s | 0 s | 1920 throughout | localhost measured as 60 Mbit/s (the cap) |
| 1440x900 2x, unthrottled | downlink 10, 4g | 0.79 s | 0 s | 1920, 1920 x3, **2560** | the retina screen unlocks the top rung once a download is measured |
| 1440x900 2x, 20 Mbit/s | downlink 10, 4g | 0.91 s | 0.25 s | 1920, 1920 x3, **2560** | estimate 18.8 Mbit/s; one short wait on the 2560 clip |
| 1440x900 1x, 12 Mbit/s | downlink 10, 4g | 1.09 s | 0.75 s | 1920, 1920, 960, 1920, 1280 | the lap at 8.6 Mbit/s needs 11.2 with headroom; DevTools throttling splits the link between the playing and the preloading clip, so the estimate wobbles |
| 1440x900 1x, 5 Mbit/s | downlink 5, 4g | 1.45 s | 1.25 s | 1280, 960 x3, 960, then 960, **1920** | the second cycle's cached clips read as 54 Mbit/s and stepped race cut 2 up: fix 1 |
| 1440x900 1x, 5 Mbit/s | none (Safari, Firefox) | 1.45 s | **14.5 s** | 1920, 1920, 1920, 960, 960 | the 12 Mbit/s default put the 1920p60 opening on a 5 Mbit/s link; it stuttered in waits under 1.5 s each, which the single-gap stall watch never caught: fixes 2 and 3 |
| 1440x900 1x, 2 Mbit/s | downlink 2, 4g | 2.68 s | 20.3 s | 960 throughout | as before this branch: the race cuts' 960 encodes run 1.9 to 2.1 Mbit/s, so a 2 Mbit/s link cannot stream them while the next clip preloads (HERO_PERF measured 2.52 s to the first frame here) |
| 390x844 3x, 5 Mbit/s | downlink 5, 4g | 1.39 s | 0.75 s | 1280, 960 x3, 960 | the phone cap (1280) and the link |

Fixes from the first matrix: (1) each file is measured once per session
(`recordTransfer` key); (2) a browser with no connection API starts from
9 Mbit/s, not 12 (`NO_API_MBPS`): the 1280 opening and the lighter race
cuts, then the measured download decides; (3) the stall watch adds up the
waits of the last 10 s (start-up aside) instead of needing one 1.5 s gap;
(4) a download still running after 1.5 s is sampled on what it has
buffered, so the figure is in before the next clip is queued (3 s before
the current one ends): with the whole-file sample the first race cut was
still picked on the default at 5 Mbit/s and stuttered for 7 s. Plus the
`ended` guard (a late `ended` from the outgoing clip cut the incoming clip
to one second in the second cycle of the first run).

Second matrix (with the fixes):

| Case | Connection API | First frame | Frozen | Rungs picked | Notes |
|---|---|---|---|---|---|
| 1440x900 1x, 5 Mbit/s | none | 1.43 s | **0.5 s** | 1280, 960 x3, 960, then 960 | was 14.5 s frozen; estimate 4.4 Mbit/s from the opening clip's first 1.5 s of download |
| 1440x900 1x, 5 Mbit/s, 90 s | downlink 5, 4g | 1.40 s | 0.5 s | 1280, 960 x3, 960, then 960 x3, 960 | two full cycles; the cached second cycle no longer steps up |
| 1440x900 1x, 12 Mbit/s | none | 0.98 s | 0 s | 1280, 1920, 960, 1920, 1280 | estimate 11.0; race cut 2 took the pessimistic early sample (the preload shares the throttle) |
| 1440x900 1x, unthrottled | downlink 10, 4g | 0.74 s | 0 s | 1920 throughout, second cycle 1920 | race cut 1 now plays its full 11 s in the second cycle (`ended` guard) |
| 1440x900 2x, 20 Mbit/s | downlink 10, 4g | 0.87 s | 0 s | 1920, 1920 x3, **2560** | estimate 18.7 |

The 2 Mbit/s and phone cases were not re-run: nothing in the fixes
changes a link that reports 2 or 5 Mbit/s to Chrome (they pick the 960
and 1280 rungs from the reported figure), and the phone cap is untouched.

Target from `docs/media/HERO_PERF.md` (first frame within 2 s at
5 Mbit/s): met on desktop (1.40 to 1.45 s) and phone (1.39 s), with or
without the connection API.

## Visual checks (`qa-shots.py`, first batch)

| Case | Result |
|---|---|
| 1440x900, 1x | New footage under the transparent nav, one `h1`, no console errors; both hero elements in place (the second preloading the first race cut) |
| 768x1024, 2x | Same; the 16:9 frame covers the portrait tablet |
| 390x844, 3x | Same; the cover crop shows the middle of the frame (the portrait encode stays deferred, `docs/mobile/VERIFY.md` LANDING-12) |
| 1440x900, reduced motion | No `<video>`; the poster `<img>` is the new 1920x1080 file with `width`/`height` set, the static headline on paper below |

Captures (git-ignored) in the session scratchpad `qa/`: `desktop-1440.jpg`,
`tablet-768.jpg`, `mobile-390.jpg`, `reduced-1440.jpg`.

## Budgets

`scripts/media.sh report public/media`: the two committed loops are under
their caps (7,469,292 B at 1280, 2,725,455 B at 960; hero exception), the
poster 73,536 B (under 150 KB), the new highlight clip 1,273,508 B (under
1.5 MB). The v3 rungs and the race clips in `public/media/hero/` are
git-ignored (`.gitignore`: `public/media/**/*.mp4`) and live on R2.

## For Cedric

- A bystander walks close past the orange barrier at about 5 s of the
  opening clip (source 5.0 to 5.75 s), upper body in frame, face too small
  to read at 1920 and under. The rest of the lap only has people far off.
  To avoid it the opening would start at 7.0 s (the orange sweep) and lose
  the start line; a ten-second re-encode and upload.
- The poster (the start line at 2.0 s) has a person's legs at the top-left
  edge, under the logo.
- The event and videographer of `GX010088.mp4` are not recorded
  (manifest H-11, TODO(content)).
- The committed loop files were replaced in place, as rule 3 allows; git
  carries both the old and the new pair in history (about 10 MB more).
