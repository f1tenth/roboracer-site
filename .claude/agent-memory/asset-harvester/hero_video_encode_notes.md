---
name: hero-video-encode-notes
description: ffmpeg settings that actually hit the 3 MB hero-video budget for the roboracer_fpv.mp4 source, and why the skill's literal default crf values don't
metadata:
  type: project
---

Source `_harvest/hero/roboracer_fpv.mp4` (from `iros2026-race.roboracer.ai/images/Roboracer/roboracer_fpv.mp4`, byte-identical) is native **1280x720**, 38 s, h264/aac, ~1.6 Mbps. The `roboracer-media` skill's example command (`scale=1920:-2, crf 24`) assumes a higher-res source; applied literally here it upscales 720p to 1080p and produces ~11.5 MB for an 18 s clip — 3.8x over the 3 MB budget.

**What worked**: shorten the loop to 12 s (not the skill's 10-20 s range's midpoint, the low end) and raise crf. At 12 s: crf 24 -> way over, crf 34 -> 2.94 MB (fits, best quality that still fits). For the AV1/webm variant, the skill's example crf 34 came out *larger* than the h264 mp4 (4.7 MB) — SVT-AV1's default PSNR tune handles this grainy, motion-blurred FPV footage poorly at moderate crf; had to go to crf 44 with `-preset 8` (faster preset, matches the higher crf's lower quality target) to get 2.64 MB.

**Why it matters**: don't trust the skill's example crf values as literal defaults for FPV/GoPro-style source footage — they were probably tuned against cleaner static camera footage. Always do a crf sweep (try 4-5 values) against the actual source before committing to numbers, and check whether shortening the loop buys enough headroom to keep crf lower (better quality) rather than pushing crf higher on a longer clip.

**How to apply**: next time a hero/background video needs encoding, start with a crf sweep script (loop over candidate crf values, print output size) instead of running the skill's literal command once and being surprised it's over budget. Also worth flagging to Cedric: ask whoever shot the FPV footage whether a higher-resolution source exists, since 720p-native footage upscaled to 1920 wastes bits without adding real detail.

Related: [[env-tooling]] for why `cwebp`/`magick` weren't used for the poster frame instead.
