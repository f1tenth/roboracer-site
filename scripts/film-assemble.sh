#!/usr/bin/env bash
# Concatenate the v2 act clips into one film for the frame pipeline (hero cinematic v2).
#
#   scripts/film-assemble.sh <out.mp4> <clip1.mp4> <clip2.mp4> ... [--hold 1.0] [--fps 24]
#
# Clips are re-encoded to one stream (1280x720 or the first clip's size, `--fps`, H.264, no audio),
# joined back to back (each clip's last frame is the next clip's first frame when they were
# generated with matching end/start images, so no crossfade is needed), and the last frame is held
# for `--hold` seconds so the scroll hold has a still to sit on. Prints the act boundaries in
# output frames, which go into Landing.tsx's HERO_CINE.film.acts.
set -euo pipefail
out=$1; shift
hold=1.0; fps=24; clips=()
while [ $# -gt 0 ]; do case "$1" in
  --hold) hold=$2; shift 2;; --fps) fps=$2; shift 2;;
  *) clips+=("$1"); shift;;
esac; done
[ ${#clips[@]} -ge 1 ] || { echo "no clips" >&2; exit 1; }
w=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of csv=p=0 "${clips[0]}")
h=$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of csv=p=0 "${clips[0]}")
tmp=$(mktemp -d)
list="$tmp/list.txt"; : > "$list"
frame=0
echo "act boundaries (output frames at ${fps} fps):"
for i in "${!clips[@]}"; do
  c=${clips[$i]}
  ffmpeg -v error -y -i "$c" -an -vf "scale=${w}:${h}:flags=lanczos,fps=${fps},format=yuv420p" -c:v libx264 -preset medium -crf 16 -r "$fps" "$tmp/part$i.mp4"
  n=$(ffprobe -v error -select_streams v:0 -count_frames -show_entries stream=nb_read_frames -of csv=p=0 "$tmp/part$i.mp4")
  echo "  clip $i $(basename "$(dirname "$c")"): frames $frame..$((frame + n))"
  frame=$((frame + n))
  echo "file '$tmp/part$i.mp4'" >> "$list"
done
if [ "$(python3 -c "print(1 if $hold > 0 else 0)")" = "1" ]; then
  last=${clips[$((${#clips[@]} - 1))]}
  ffmpeg -v error -y -sseof -0.05 -i "$last" -frames:v 1 -y "$tmp/last.png"
  ffmpeg -v error -y -loop 1 -i "$tmp/last.png" -t "$hold" -vf "scale=${w}:${h},fps=${fps},format=yuv420p" -c:v libx264 -preset medium -crf 16 -r "$fps" "$tmp/hold.mp4"
  nh=$(ffprobe -v error -select_streams v:0 -count_frames -show_entries stream=nb_read_frames -of csv=p=0 "$tmp/hold.mp4")
  echo "  hold: frames $frame..$((frame + nh))"
  frame=$((frame + nh))
  echo "file '$tmp/hold.mp4'" >> "$list"
fi
mkdir -p "$(dirname "$out")"
ffmpeg -v error -y -f concat -safe 0 -i "$list" -c copy "$out"
echo "film: $out ($(ffprobe -v error -select_streams v:0 -count_frames -show_entries stream=nb_read_frames -of csv=p=0 "$out") frames, ${w}x${h}, ${fps} fps)"
rm -rf "$tmp"
