# The hero from the 4K GoPro lap, with a quality ladder

Cedric, 2026-10-20: a much better FPV clip (4K, 120 fps, `GX010088.mp4`,
778.9 MB) replaces the hero footage; make it smaller for Cloudflare, let the
quality follow the connection (low on bad wifi, as close to the source as the
link allows), and keep the other clips swapping through the hero. Branch
`revamp/hero-4k`.

## The source and the cuts

`~/Downloads/GX010088.mp4`: 3840x2160, HEVC Main, 119.88 fps (GoPro's
120), full-range (`yuvj420p`, bt709), 52.1 s, 119 Mbit/s, AAC audio
(dropped). Contact sheets at 1 s and 0.25 s steps (scratchpad `src-frames/`):

| Source time | What happens |
|---|---|
| 0.0 to 2.0 s | At the start line; two people standing close by in the first second |
| 2.0 s | Start line (striped tape, black barrier), people far off: **opening clip and poster start here** |
| 2.5 to 7 s | The car launches along the black barrier to the orange section |
| 7 to 34.5 s | One clean lap: orange barriers, the long straight, the far end with the crowd |
| 34.5 s | Back over the start line |
| 34.5 to 40 s | A second lap begins |
| 40.5 to 48 s | The car runs into the orange barrier and sits against it (excluded) |
| 49 to 52 s | Back on the track at the start (excluded) |

Cuts, in source seconds, mirroring the v2 structure (opening 5 s, the rest
of the lap after the race cuts):

| Clip | Cut | Length | Role |
|---|---|---|---|
| `hero-fpv-v3-start` | 2.0 +5.0 | 5.0 s | opens the cycle, once per visit |
| `hero-fpv-v3-rest` | 7.0 +29.5 | 29.5 s | the lap after the three race cuts; the cycle loops from race cut 1 |
| `hero-fpv-loop` (committed) | 2.0 +18.0 | 18 s | fallback when an R2 clip fails to load; `/styleguide` |

The poster is the opening clip's first frame (the start line), so the first
video frame lands on it without a jump. The loop is 18 s rather than the
whole lap: the git caps (8 MB at 1280, 3 MB at 960) buy 3.3 and 1.2 Mbit/s
over 18 s instead of 1.9 and 0.7 over 32.5, and the fallback is rarely seen.

## The ladder

Four rungs per FPV clip, about a factor of two apart in bitrate. The two
lower rungs stay at 30 fps (the width is the limit there); the two upper
ones run at 60 fps, which is where the 120 fps source shows: FPV motion at
60 fps is the visible difference on a laptop. The race cuts (a 30 fps
highlights video) keep their existing 960 and 1920 encodes.

| Rung | Size | fps | crf | VBV cap | Who gets it |
|---|---|---|---|---|---|
| 960x540 | 960 | 29.97 | 26 | 2.8 Mbit/s | Save-Data, cellular, under 4g, links under about 2 Mbit/s |
| 1280x720 | 1280 | 29.97 | 24 | 5 Mbit/s | phones (both orientations), links of 4 to 10 Mbit/s |
| 1920x1080 | 1920 | 59.94 | 24 | 13 Mbit/s | desktops on links from about 11 Mbit/s, or with no estimate yet |
| 2560x1440 | 2560 | 59.94 | 25 | 20 Mbit/s | screens over 2300 physical px wide, once a download measured 15+ Mbit/s |

Encoder: libx264 preset slow, high profile, lanczos downscale from 4K, the
GoPro's full range converted to limited (`in_range=pc:out_range=tv`,
tagged bt709), `fps=` to 30000/1001 or 60000/1001, keyframe every 2 s,
`+faststart`, no audio. A crf sweep on the busiest 6 s (20 to 26 s) set the
rungs; crf 25 at 1920p60 and crf 26 at 2560p60 scored VMAF 92.7 and 90.9,
one step lower was taken for both. Decode through NVDEC (`-hwaccel cuda`,
about 220 fps at 4K); the whole ladder encodes in about four minutes.

```bash
# one rung (start clip, 1920p60); see scratchpad encode.sh / encode2.sh for the set
ffmpeg -hwaccel cuda -ss 2.0 -t 5.0 -i GX010088.mp4 -an \
  -vf "fps=60000/1001,scale=1920:-2:flags=lanczos:in_range=pc:out_range=tv,format=yuv420p" \
  -c:v libx264 -preset slow -profile:v high -crf 24 -maxrate 13000k -bufsize 26000k -g 120 \
  -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -movflags +faststart hero-fpv-v3-start-1920.mp4
# committed fallback: two-pass to the git cap
ffmpeg -hwaccel cuda -ss 2.0 -t 18.0 -i GX010088.mp4 -an -vf "fps=30000/1001,scale=1280:-2:flags=lanczos:in_range=pc:out_range=tv,format=yuv420p" \
  -c:v libx264 -preset slow -profile:v high -b:v 3300k -maxrate 4400k -bufsize 8800k -g 60 -pass 1 -f mp4 /dev/null
ffmpeg ... -pass 2 -movflags +faststart hero-fpv-loop-1280.mp4
# poster: the opening clip's first frame
ffmpeg -i hero-fpv-v3-start-1920.mp4 -frames:v 1 poster.png && ffmpeg -i poster.png -c:v libwebp -q:v 82 hero-fpv-poster.webp
```

## Results

Sizes and bitrates from ffprobe; VMAF (libvmaf default model, BtbN static
ffmpeg) frame-paired against the source cut, decoded and scaled with the
same filter chain as the encode, at each rung's own size and frame rate.
So the rows are not comparable across rungs: a 30 fps rung is scored
against a softer, slower reference. The 1920 and 2560 rows are the honest
numbers for a viewer at that size; the lower rows say each rung is as good
as its size allows. p5 is the 5th percentile frame.

| File | Size | Length | Mbit/s | VMAF mean | p5 | min |
|---|---|---|---|---|---|---|
| `hero-fpv-v3-start-960.mp4` | 979,877 B | 5.0 s | 1.57 | 98.62 | 94.30 | 88.27 |
| `hero-fpv-v3-start-1280.mp4` | 1,984,079 B | 5.0 s | 3.17 | 99.65 | | 90.65 |
| `hero-fpv-v3-start-1920.mp4` (60 fps) | 4,939,005 B | 5.0 s | 7.90 | 94.84 | 90.52 | 87.53 |
| `hero-fpv-v3-start-2560.mp4` (60 fps) | 7,132,201 B | 5.0 s | 11.41 | 92.93 | 88.54 | 85.42 |
| `hero-fpv-v3-rest-960.mp4` | 6,433,173 B | 29.5 s | 1.74 | 99.29 | 96.02 | 87.58 |
| `hero-fpv-v3-rest-1280.mp4` | 12,887,260 B | 29.5 s | 3.49 | 99.92 | | 89.91 |
| `hero-fpv-v3-rest-1920.mp4` (60 fps) | 31,871,819 B | 29.5 s | 8.64 | 96.15 | 91.62 | 87.65 |
| `hero-fpv-v3-rest-2560.mp4` (60 fps) | 45,254,937 B | 29.5 s | 12.27 | 94.19 | 89.33 | 84.83 |
| `hero-fpv-loop-1280.mp4` (committed, two-pass 3300k) | 7,469,292 B | 18.0 s | 3.32 | 99.85 | | 93.02 |
| `hero-fpv-loop-960.mp4` (committed, two-pass 1200k) | 2,725,455 B | 18.0 s | 1.21 | 94.75 | 89.29 | 84.17 |
| `hero-fpv-poster.webp` (1920x1080, q 82) | 73,536 B | | | | | |

The whole ladder on R2 is 111 MB for 34.5 s of footage, against 779 MB for
the 52 s source: a visitor on a fast desktop link downloads 37 MB for the
two FPV clips (1920p60), a phone 15 MB (1280p30), a slow link 7.4 MB. The
first encodes of the 60 fps rungs (crf 25 and 26) scored 93.1 / 94.4 and
90.9 / 92.2; one crf step bought about 2 VMAF for 14% more bytes.

What was tried and not kept: AV1/WebM (not on this ladder; H.264 decodes in
hardware everywhere and the race clips are H.264); a 1280p60 middle rung
(the 30 fps rung at 3.2 Mbit/s is the phone and mid-link workhorse, and
60 fps there would have cost the links it serves); a portrait crop for
phones (`docs/mobile/VERIFY.md` LANDING-12 stays deferred: a 9:16 centre
crop loses the barrier that makes the FPV read as a track).

## On the bucket

Uploaded 2026-10-20 with wrangler 4 (`r2 object put --remote`, content type
`video/mp4`, `cache-control: public, max-age=31536000, immutable`; the
names are new, so the live site keeps playing the v2 clips until this
merges). Every file answers 200 on
`https://pub-1174c726236842f08529a0a5cc0c68fb.r2.dev/media/hero/<name>`
with the local size, and the cache header comes back (the v2 uploads had
none, `docs/media/HOSTING.md`). The v1 and v2 IV clips are to be deleted
from the bucket once the deploy serves the v3 hero (the commands are in
`docs/media/HOSTING.md`; the agent's tooling refuses cloud deletes); the
master `GX010088.mp4` moved from Downloads to `_harvest/hero/`
(git-ignored) until the opening cut is settled.

## How the hero picks a rung (`src/lib/media.ts`, `HeroChapter.tsx`)

Every clip carries its ladder (`sources`: `src`, `width`, `mbps`, `bytes`,
`fps`). `pickSource` runs when a clip is about to load, so each clip of the
cycle can land on a different rung:

1. **Hard caps.** Save-Data, a cellular link (`navigator.connection.type`)
   or an effective type under "4g": the lowest rung. A phone in either
   orientation (not `DESKTOP_QUERY`): at most 1280.
2. **Screen cap.** The footage covers the viewport (`object-fit: cover`),
   so the rung needed is the viewport's 16:9 cover width times the device
   pixel ratio (capped at 2). The first rung at 90% of that or wider is the
   ceiling: a 1920x1080 window gets at most 1920, a 1440x900 at 2x may reach
   2560, nothing is upscaled more than it has to be.
3. **Link.** The highest rung under the caps whose bitrate times 1.3 (the
   next clip preloads while this one plays) fits the link estimate. The
   estimate is, in order: measured downloads (below); the browser's
   `downlink` (Chromium; its cap of 10 reads as 12, "ten or more"); or 9
   Mbit/s when the browser says nothing (Safari, Firefox: the 1280 opening
   and the lighter race cuts, until the opening clip's download says
   more; at 12 a 1920p60 opening stuttered for 14 s on a 5 Mbit/s link).
   So a first visit starts at 1920p60 on a desktop Chrome that reports a
   fast link, at 1280 on Safari, at 960 when Chrome reports a slow link,
   and the 2560 rung is only ever reached by measurement.
4. **Learning the link.** `HeroChapter` times each clip's first download
   burst from `loadstart`, and samples it at the first of: the whole file
   down, the first `suspend` (Chrome stops fetching once it has buffered
   enough ahead, then resumes as playback needs it: on localhost a 6 MB
   clip took 17 s to finish, so the time to the whole file says nothing
   about the link), or 1.5 s elapsed (so the figure is in before the next
   clip is queued, 3 s before the current one ends). Bytes are the file,
   or the buffered share of it; under 1.5 s of footage it waits for more,
   or is dropped if the fetch paused. `recordTransfer(bytes, ms)` folds the
   throughput into a running estimate (EWMA, weight 0.5), kept in
   `sessionStorage` (`rr-link`) so it survives a route change. Each file
   counts once per session: the cycle plays the same files again from the
   cache, and in QA the second cycle read as a 54 Mbit/s link on a 5 Mbit/s
   throttle and stepped a race cut up to 1920. Samples under 200 KB are
   dropped; one under 400 ms counts as a lower bound over 400 ms and only
   raises the estimate, capped at 60 Mbit/s. A clip that preloads while the
   previous one is still downloading measures a lower bound, which errs on
   the safe side; a cached clip in a new tab can still unlock a rung the
   link cannot carry, which the stall watch (5) steps down.
5. **Stalls.** A clip that waits for data over 1.5 s, in one wait or added
   up over the last 10 s (its start-up wait aside), or a finished clip
   holding its last frame that long for the next one, calls
   `markStall(mbps)`: that rung and every rung above it are out for the
   rest of the tab's session (a ceiling), and the estimate drops to 0.6 of
   the stalled bitrate so the next pick fits. The queued clip reloads in
   the lower rung at once if it has not started. Added up, because a clip
   just over what the link carries stutters in short waits that each end
   before a single-gap watch fires: the old single-gap rule caught none of
   14 s frozen in QA. At the lowest rung there is nothing to step down to,
   so no stall is recorded.

What did not change: the sequencer (two stacked elements, crossfade,
preload once the current clip is buffered or 3 s before its end), the hold
on the rest of the landing's media until the opening clip is down, the
pause control, reduced motion (poster and static headline), and the
fallback to the committed loop when a clip errors.

One sequencer fix on the way (pre-existing): the outgoing clip reaches its
end as the crossfade timer fires, and when its `ended` event landed just
after the flip it advanced the clip that had just come in (the second
cycle's first race cut played for one second in the first QA run). `ended`
now only advances the clip on screen.

## QA

`docs/qa/hero-4k.md`: throttled Chrome runs (with and without the
connection API), one cycle each. Unthrottled desktop: first frame 0.74 s,
nothing frozen, 1920 throughout; retina at 20 Mbit/s reaches 2560 for the
lap; 12 Mbit/s gives 1920 for the race cuts and 1280 for the lap; 5 Mbit/s
opens at 1280 in 1.4 s and runs the rest at 960 with 0.5 s frozen in 70 s,
with or without the API. The first matrix found three problems the fixes
above address (a no-API browser opening at 1920p60 and stuttering 14.5 s,
the cached second cycle stepping up, short waits escaping the stall watch)
and one pre-existing race in the sequencer. Screens at 1440, 768 and 390
and the reduced-motion layout (the new 1920x1080 poster) are clean.
