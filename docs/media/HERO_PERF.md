# Hero start-up on a slow link, and the FPV encode

Cedric, 2026-09-24: on mid-quality wifi the opening hero video starts slowly;
and can the FPV clip look better. Branch `revamp/p2-media`. Before = the
landing at `e82e747`; after = this branch.

## How it was measured

- Production build (`npm run build`, so `mediaUrl` resolves to the r2.dev
  bucket), served by `npx vite preview` (gzip on). Before and after ran
  interleaved from two preview servers of the two builds.
- Google Chrome 153 headless through Playwright (Python), `channel="chrome"`
  for H.264, flags `--use-gl=angle --use-angle=swiftshader
  --enable-unsafe-swiftshader`. A new browser per run, so every run is a cold
  first visit.
- Throttle: CDP `Network.emulateNetworkConditions`, 5 Mbit/s down, 2 Mbit/s up,
  40 ms latency (plus a 2 Mbit/s case). Viewports 1440x900 and 390x844 (DPR 3,
  touch).
- **First frame** = the first `requestVideoFrameCallback` on a `hero-*` clip,
  in ms from navigation start. **Poster** = when `hero-fpv-poster.webp`
  finished downloading. **Frozen** = time the visible hero clip was playing
  but not advancing, sampled every 250 ms over the first 55 s.
- Caveats. DevTools throttling splits the bandwidth evenly between open
  requests, which punishes many small parallel requests harder than real TCP
  does. The machine was shared with other agents, so a few runs were slow
  across the board (their first contentful paint was late too); medians carry
  the result. Unthrottled, the first frame still takes 1.5 to 1.9 s in this
  setup (software GL, busy main thread), so about 1.4 s at 5 Mbit/s is close
  to the floor here.

## What was wrong

1. The opening clip is `hero-iv-start-1280.mp4` (1.84 MB, 5 s) from R2, not
   the committed FPV loop. The loop only plays if a cycle clip fails.
2. Faststart is fine: every encode has `moov` before `mdat`. Playback started
   after about 140 KB of the opening clip (open-ended Range request, streamed,
   not fetched whole).
3. The poster was set on the video, but its request only went out when React
   created the element, at about 0.6 s; it finished at about 0.72 s.
4. Encode choice was width only (`min-width: 768px` gets the desktop encode).
   The 1920 race clips run 5.7 to 7.3 Mbit/s, so on a 5 Mbit/s link they can
   never stream.
5. Both hero video elements were `preload="auto"`: the second one pulled
   `hero-race-01-1920.mp4` (9.1 MB) from the same instant as the opening clip.
6. The rest of the page competed from the first second: about 180 image
   requests (partner logos, rest and hover; 11 community post images; research
   figures of 100 to 300 KB each), the next-race clip and the join clip (four
   times, one per marquee copy) autoplaying although thousands of pixels down
   (`autoPlay` ignores `preload="metadata"`), and the three.js chunk plus the
   car meshes warmed at the first idle moment.
7. Result at 5 Mbit/s: first frame at 2.6 s, then the opening clip froze again
   and again (its buffer grew about 0.35 s per second). Over the first 55 s the
   hero was frozen for 17.5 to 18.2 s and only reached 3 of its 5 clips.

## What changed

- **Clip sequencer** (`HeroChapter.tsx`). The next clip starts downloading once
  the playing one is fully buffered, or 3 s before its end. A crossfade waits
  until the next clip can play instead of fading to an empty element.
- **Encode per clip, per link** (`linkCanStream` in `src/lib/media.ts`). Each
  clip carries its desktop encode's bitrate (`mbps`); the 960 encode plays on
  Save-Data, on anything slower than `4g`, or when `navigator.connection.downlink`
  is under 1.3 times that bitrate. Checked when each clip loads, so a link
  that slows down drops the next clips to 960. Safari and Firefox have no
  such API and keep the width rule. Note: Chrome with no history for the
  current network reports a low default (1.65 Mbit/s in a fresh headless
  profile), so such a first visit gets the 960 clips.
- **The landing holds its off-screen media** (`MediaHoldContext`). Marquee
  images, research figures and the carousel's neighbour prefetch, video frame
  posters and the car scene warm-up wait until the opening clip has fully
  downloaded, or 4 s at most. Released on the
  full download, not on `canplaythrough`: Chrome fired that with 1.2 s of the
  5 s clip buffered, and the flood of images froze the clip.
- **`MediaFrame` videos mount near the viewport** (half a viewport ahead);
  until then the poster stands in, same box. This also fixes the join clip
  downloading four times on `/about`.
- **Poster and connection early** (`index.html`, `/` only): an inline script
  preloads the poster and preconnects to `VITE_MEDIA_BASE`.
- Reduced motion is unchanged: the static layout renders the poster image and
  no video; it releases the held media at once.

## Before and after

Final build of this branch (v2 IV clips, all holds in place) against
`e82e747`, interleaved, cold cache each run. First frame, median (range):

| Case | Before | After |
|---|---|---|
| Desktop 1440, 5 Mbit/s (n=10 each) | 2.66 s (2.60 to 2.77) | **1.39 s** (1.35 to 2.22) |
| Mobile 390, 5 Mbit/s (n=8 each) | 1.87 s (1.86 to 2.60) | **1.36 s** (1.28 to 2.08) |
| Desktop 1440, 2 Mbit/s (n=3 each) | 5.78 s (5.78 to 5.83) | **2.52 s** (2.50 to 2.53), 960 opening clip |

The after runs over 2 s were the ones where the shared machine was loaded
(their first contentful paint came at 1.6 to 1.8 s instead of 1.1 s).

| Other measures, desktop 5 Mbit/s | Before | After |
|---|---|---|
| Poster downloaded | 0.72 s | 0.32 s |
| Image requests started before the first frame | 181 | 1 (the poster) |
| Hero frozen in the first 55 s | 17.5 s, 18.2 s | 2.0 s, 2.8 s |
| Clips reached in 55 s | 3 of 5 | 5 of 5 |

The target (first frame within 2 s at 5 Mbit/s) is met on desktop and mobile.
The freeze left is all in `hero-race-01-960`, the clip that is loading when
the held images are released. Under real TCP (images on the site's
connection, the clip on R2's) that contention is milder than under the
DevTools split.

## The FPV encode

### Which part of the source each file is

Frame matching (grey thumbnails, then full-resolution MSE) against
`~/Downloads/FPV_IV.mp4` (1280x720, 29.97 fps, 1567 frames):

| File | Source frames | Notes |
|---|---|---|
| `hero-fpv-loop-1280.mp4` (committed) | 91, then 91 to 1080 | 3.00 to 36.07 s; frame 0 duplicates frame 1 |
| `hero-iv-start-1280.mp4` (R2, v1) | 90 to 239 | the cycle's opening 5 s |
| `hero-iv-rest-1280.mp4` (R2, v1) | 270 to 1079 | converted to 30 fps: one duplicated frame at 230 |

### Quality against the source

VMAF (libvmaf, default model; BtbN static ffmpeg) and SSIM, frame-paired by
index against the matching source frames. 960 encodes are scored against the
source scaled to 960 with lanczos.

| Encode | Size | Mbit/s | VMAF mean | VMAF 5th pct | SSIM |
|---|---|---|---|---|---|
| iv-start 1280, v1 (crf 20, from an earlier generation) | 1,837,828 B | 2.94 | 91.64 | 85.19 | 0.9739 |
| **iv-start 1280, v2 (crf 25 from source)** | 1,753,434 B | 2.80 | **99.78** | 98.10 | 0.9868 |
| iv-start 1280, crf 23 from source | 2,154,155 B | 3.44 | 99.95 | 100.00 | 0.9896 |
| iv-rest 1280, v1 | 10,104,517 B | 2.99 | 93.1 (93.53 / 92.95 per half) | 86 to 88 | 0.972 |
| **iv-rest 1280, v2 (crf 25)** | 9,881,466 B | 2.92 | **99.93** | 100.00 | 0.9865 |
| iv-start 960, v1 (crf 24) | 1,157,235 B | 1.85 | 94.05 | 87.41 | 0.9715 |
| **iv-start 960, v2 (crf 26)** | 980,959 B | 1.56 | **98.68** | 94.21 | 0.9777 |
| iv-rest 960, v1 | 6,496,629 B | 1.92 | 95.3 (95.62 / 95.20) | 89 to 90 | 0.970 |
| **iv-rest 960, v2 (crf 26)** | 5,521,840 B | 1.63 | **99.24** | 95.76 | 0.9769 |
| loop 1280, committed (crf 22 capped at 1800k) | 7,612,616 B | 1.84 | 95.90 | 89.07 | 0.9767 |
| loop 1280, crf 20 / 21 / 22 / 23 from source | 19.4 / 17.8 / 16.2 / 14.8 MB | 4.69 / 4.30 / 3.92 / 3.57 | 99.99 each | 100.00 | 0.992 to 0.989 |
| loop 1280, crf 24 / 25 / 26 | 13.4 / 12.0 / 10.8 MB | 3.23 / 2.91 / 2.62 | 99.98 / 99.92 / 99.74 | 100 / 99.8 / 98.0 | 0.988 / 0.986 / 0.985 |
| loop 1280, two-pass veryslow at 1800k (fits 8 MB) | 7,463,106 B | 1.80 | 96.97 | 91.09 | 0.9776 |
| loop 960, committed (crf 26 capped at 700k) | 2,969,014 B | 0.72 | 79.94 | 69.59 | 0.9503 |
| loop 960, two-pass veryslow at 690k (fits 3 MB) | 2,876,247 B | 0.70 | 80.82 | 73.65 | 0.9516 |

All candidates: libx264, preset slow (unless noted), high profile, yuv420p,
`+faststart`, no audio, native 1280x720 at the source's 29.97 fps, cut by
frame (`trim=start_frame=..:end_frame=..`).

### Decision

- **The cycle's IV clips are replaced** (what visitors see). Encoding straight
  from the source gains 6.8 to 8.1 VMAF at 1280 and 3.9 to 4.6 at 960, with
  2 to 15% fewer bytes. The v1 files came from an earlier lossy generation:
  crf 20 at only 2.94 Mbit/s scores below a from-source crf 26. crf 20 to 23
  all saturate at 99.99 and cost 3.4 to 4.7 Mbit/s; crf 25 scores 99.8 to 99.9
  at the old bitrate, so the slow-link behaviour above does not change.
  Uploaded to R2 under new names (files are immutable by name; the live site
  keeps playing v1 until this merges): `media/hero/hero-iv-start-v2-1280.mp4`,
  `hero-iv-start-v2-960.mp4`, `hero-iv-rest-v2-1280.mp4`,
  `hero-iv-rest-v2-960.mp4`. Checksums match the local files.
- **The committed loop stays as it is.** A crf 25 re-encode would gain 4.0
  VMAF but weighs 12 MB, over the 8 MB git cap, and this file is the fallback
  for when an R2 clip fails, so moving it to R2 would make it fail together
  with the clips it backs up. The best encode that fits 8 MB gains 1.1
  (two-pass veryslow). The 960 loop under its 3 MB cap gains 0.9. Both
  marginal: the budgets, not the encoder, set that quality.
- Resolution cannot go up: the source is 1280x720 (CLAUDE.md rule 3).

### Localhost

The v2 clips are not in git (only on R2). A dev server without
`VITE_MEDIA_BASE` looks for them under `public/media/hero/` and, missing
them, falls back to the committed loop. To see the cycle on localhost:

```
for n in hero-iv-start-v2-1280 hero-iv-start-v2-960 hero-iv-rest-v2-1280 hero-iv-rest-v2-960; do
  curl -so public/media/hero/$n.mp4 https://pub-1174c726236842f08529a0a5cc0c68fb.r2.dev/media/hero/$n.mp4
done
```
