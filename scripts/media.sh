#!/usr/bin/env bash
# RoboRacer media pipeline helper (skill: roboracer-media).
#   media.sh video <in> <outbase> [--start S] [--dur S] [--crf1920 N] [--crf960 N] [--crfwebm N]
#       hero ladder: 1920+960 mp4, webm, poster (crf flags set the sweep start)
#   media.sh poster <video> <out.webp> [--at S]           poster frame, WebP, <150 KB budget
#   media.sh report <dir>                                 sizes; flags files over the 1.5 MB git rule
#   media.sh photo <in|dir>... [-o out] [--width 1200] [--budget 220k] [--suffix -800]
#       stills -> WebP, EXIF orientation applied first; --report <dir> for sizes; --help for the rest
# Budgets (hard): hero encode <= 3 MB each, poster <= 150 KB, photo <= 220 KB
# (150 KB for timeline tiles). The committed
# hero loop in public/media/hero/ is the one approved exception to the git
# rule (CLAUDE.md rule 3, Cedric 2026-08-20).
set -euo pipefail

MB3=3145728; KB150=153600; MB15=1572864
PHOTO_PY=${PHOTO_PY:-/home/cedric/.venvs/ml/bin/python3}   # the venv that has Pillow

size() { stat -c%s "$1"; }

# Encode; if over budget, raise crf (+4, three attempts) and keep the first fit.
fit_encode() { # fit_encode <budget> <out> <crf0> <ffmpeg args before -crf...>
  local budget=$1 out=$2 crf=$3; shift 3
  for _ in 1 2 3; do
    ffmpeg -v error -y "$@" -crf "$crf" "$out"
    local s; s=$(size "$out")
    if [ "$s" -le "$budget" ]; then echo "  $out: $s bytes (crf $crf) OK"; return 0; fi
    echo "  $out: $s bytes over budget at crf $crf, retrying at $((crf+4))"
    crf=$((crf+4))
  done
  echo "  WARN: $out did not fit its budget; keeping last attempt (crf $crf)"; return 0
}

cmd_video() {
  local in=$1 base=$2; shift 2
  local start="" dur="" crf1920=24 crf960=26 crfwebm=34
  while [ $# -gt 0 ]; do case $1 in
    --start) start=$2; shift 2;; --dur) dur=$2; shift 2;;
    --crf1920) crf1920=$2; shift 2;; --crf960) crf960=$2; shift 2;; --crfwebm) crfwebm=$2; shift 2;;
    *) echo "unknown option $1"; exit 1;;
  esac; done
  local seek=(); [ -n "$start" ] && seek+=(-ss "$start"); [ -n "$dur" ] && seek+=(-t "$dur")
  echo "encoding $in -> ${base}-{1920,960}.mp4, ${base}-1920.webm, ${base%-loop}-poster.webp"
  # H.264, loop-friendly, no audio, fast start (skill defaults crf 24/26)
  fit_encode $MB3 "${base}-1920.mp4" "$crf1920" "${seek[@]}" -i "$in" -an \
    -vf "scale=1920:-2:flags=lanczos,fps=30" -c:v libx264 -preset slow -pix_fmt yuv420p -movflags +faststart
  fit_encode $MB3 "${base}-960.mp4" "$crf960" "${seek[@]}" -i "$in" -an \
    -vf "scale=960:-2:flags=lanczos,fps=30" -c:v libx264 -preset slow -pix_fmt yuv420p -movflags +faststart
  # AV1/WebM, first <source> where supported (skill crf 34; grainy sources need more)
  fit_encode $MB3 "${base}-1920.webm" "$crfwebm" "${seek[@]}" -i "$in" -an \
    -vf "scale=1920:-2" -c:v libsvtav1 -preset 6
  cmd_poster "${base}-1920.mp4" "$(dirname "$base")/$(basename "$base" -loop)-poster.webp" --at 1.5
}

cmd_poster() {
  local in=$1 out=$2 at=1.5; shift 2
  [ "${1:-}" = "--at" ] && at=$2
  if command -v cwebp >/dev/null 2>&1; then
    local tmp; tmp=$(mktemp --suffix=.png)
    ffmpeg -v error -y -ss "$at" -i "$in" -frames:v 1 "$tmp"
    cwebp -quiet -q 80 "$tmp" -o "$out"; rm -f "$tmp"
  else
    # cwebp not installed on this machine; ffmpeg's libwebp is equivalent here
    ffmpeg -v error -y -ss "$at" -i "$in" -frames:v 1 -c:v libwebp -q:v 80 "$out"
  fi
  local s; s=$(size "$out")
  [ "$s" -le $KB150 ] && echo "  $out: $s bytes OK" || echo "  WARN: $out $s bytes over the 150 KB poster budget"
}

# Stills are Pillow's job: cwebp is not installed and ffmpeg ignores EXIF orientation.
cmd_photo() { "$PHOTO_PY" "$(dirname "$0")/photo.py" "$@"; }

cmd_report() {
  local dir=$1 total=0 over=0
  while IFS= read -r f; do
    local s; s=$(size "$f"); total=$((total+s))
    if [ "$s" -gt $MB15 ]; then
      case "$f" in */public/media/hero/hero-fpv-loop-*|public/media/hero/hero-fpv-loop-*)
        printf "  %10d  %s (hero exception, allowed)\n" "$s" "$f";;
      *) printf "  %10d  %s  <-- OVER 1.5 MB git rule\n" "$s" "$f"; over=$((over+1));;
      esac
    else
      printf "  %10d  %s\n" "$s" "$f"
    fi
  done < <(find "$dir" -type f | sort)
  echo "total: $total bytes; files over the git rule (excl. hero exception): $over"
  [ "$over" -eq 0 ]
}

case "${1:-}" in
  video) shift; cmd_video "$@";;
  poster) shift; cmd_poster "$@";;
  report) shift; cmd_report "$@";;
  photo) shift; cmd_photo "$@";;
  *) sed -n '2,8p' "$0"; exit 1;;
esac
