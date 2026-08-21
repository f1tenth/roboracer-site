#!/usr/bin/env bash
# Media helper: encode video, make posters, convert gif, compress images, report sizes.
# Usage: scripts/media.sh video IN OUTBASE | poster IN.mp4 OUT.webp [sec] | gif IN.gif OUT.mp4 | img IN OUT.webp [maxw] | report PATH
set -euo pipefail
need() { command -v "$1" >/dev/null 2>&1 || { echo "missing: $1 (brew install $2 / apt install $2)" >&2; exit 1; }; }
case "${1:-}" in
  video)  need ffmpeg ffmpeg; in=$2; out=$3
          ffmpeg -y -i "$in" -an -vf "scale=1920:-2:flags=lanczos,fps=30" -c:v libx264 -preset slow -crf 24 -pix_fmt yuv420p -movflags +faststart "${out}-1920.mp4"
          ffmpeg -y -i "$in" -an -vf "scale=960:-2:flags=lanczos,fps=30"  -c:v libx264 -preset slow -crf 26 -pix_fmt yuv420p -movflags +faststart "${out}-960.mp4"
          ffmpeg -y -i "$in" -an -vf "scale=1920:-2" -c:v libsvtav1 -crf 34 -preset 6 "${out}-1920.webm" 2>/dev/null || echo "webm/AV1 skipped (no libsvtav1)"
          "$0" poster "${out}-1920.mp4" "${out}-poster.webp" 1.5; "$0" report "$(dirname "$out")" ;;
  poster) need ffmpeg ffmpeg; need cwebp webp; ffmpeg -y -ss "${4:-1.5}" -i "$2" -frames:v 1 -q:v 2 /tmp/_poster.jpg && cwebp -quiet -q 80 /tmp/_poster.jpg -o "$3" && echo "poster -> $3" ;;
  gif)    need ffmpeg ffmpeg; ffmpeg -y -i "$2" -an -movflags +faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" "$3" ;;
  img)    need cwebp webp; cwebp -quiet -q 82 -resize "${4:-1920}" 0 "$2" -o "$3" && echo "img -> $3 ($(du -h "$3" | cut -f1))" ;;
  report) find "${2:-public}" -type f \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.gif' -o -iname '*.webp' -o -iname '*.avif' -o -iname '*.svg' -o -iname '*.mp4' -o -iname '*.webm' -o -iname '*.glb' \) -exec du -k {} + | sort -rn | awk '{printf "%8.1f MB  %s\n", $1/1024, $2}' | head -40
          echo "--- over 1.5 MB (must not be committed):"; find "${2:-public}" -type f -size +1536k | sed 's/^/  /' ;;
  *) sed -n '2,3p' "$0"; exit 1 ;;
esac
