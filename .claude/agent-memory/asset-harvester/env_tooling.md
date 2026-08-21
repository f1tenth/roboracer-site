---
name: env-tooling
description: Which media/harvest tools are actually installed in this sandbox vs. assumed by scripts/skill docs
metadata:
  type: project
---

As of 2026-08-20, this environment has `ffmpeg`/`ffprobe` (with `libx264`, `libsvtav1`, `libwebp`) and `curl`/`python3`, but is **missing** `gh` CLI, `cwebp`, and ImageMagick (`magick`).

**Why it matters**: `scripts/harvest-org-repos.sh` requires `gh` and cannot run as-is. Worked around it by hitting `api.github.com` directly with `curl` (repo list endpoint + `git/trees/<branch>?recursive=1` for recursive file listing with sizes) — gets the same inventory info as `gh repo clone` + `find` without actually cloning. For image dimensions, ImageMagick's `magick identify` is unavailable; `ffprobe -select_streams v:0 -show_entries stream=width,height -of csv=p=0 <file>` works fine on JPG/PNG/GIF/WebP stills, not just video. For image compression, `cwebp` is unavailable; `ffmpeg -i in.jpg -q:v 80 out.webp` (libwebp encoder) is a working substitute for the skill's `cwebp -q 80` step.

**How to apply**: Before assuming any `scripts/media.sh` or `scripts/harvest-org-repos.sh` invocation will work, check `which gh cwebp magick` first. If missing, use the curl/ffmpeg fallbacks above rather than stopping — they produce equivalent output. Re-check at the start of each session since the environment may change.

Related: [[hero-video-encode-notes]] for the specific ffmpeg crf/duration tuning this produced.
