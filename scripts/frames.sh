#!/usr/bin/env bash
# Frame pipeline for the scroll-scrubbed hero (docs/plans/hero-cinematic-v1.md section 6).
#
#   scripts/frames.sh probe  <mp4>                         fps, duration, size, frame count
#   scripts/frames.sh sheet  <mp4> [out.jpg] [cols] [rows]  contact sheet, frame numbers burned in (default docs/hero-lab/takes/<name>-sheet.jpg, 4x3)
#   scripts/frames.sh frames <mp4> <outdir> [--dq 74] [--mq 72] [--dw 1600] [--mw 960] [--dmax 160] [--mmax 80] [--dbudget 9000000] [--mbudget 2500000]
#                                                           desktop set outdir/d/f_0001.webp..., mobile set outdir/m/..., posters, manifest.json
#   scripts/frames.sh slowmo <mp4> <out.mp4> [--factor 2]   minterpolated slow motion, 1080p H.264, no audio
#   scripts/frames.sh report <outdir>                       sizes per set vs budgets
#
# Only ffmpeg/ffprobe and python3 are needed (no ImageMagick, no PIL).
set -euo pipefail

probe_json() { ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate,avg_frame_rate,nb_frames,duration -show_entries format=duration,size -of json "$1"; }

fps_of() { # decimal fps from the stream (avg_frame_rate, fallback r_frame_rate)
  probe_json "$1" | python3 -c '
import json,sys
d=json.load(sys.stdin); s=d["streams"][0]
def f(x):
    a,b=x.split("/"); b=float(b) if float(b)!=0 else 1.0; return float(a)/b
r=f(s.get("avg_frame_rate","0/1")) or f(s.get("r_frame_rate","0/1"))
print(f"{r:.4f}")'
}
dur_of() { probe_json "$1" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(float(d["format"].get("duration") or d["streams"][0].get("duration") or 0))'; }

cmd_probe() {
  local f=$1
  probe_json "$f" | python3 -c '
import json,sys
d=json.load(sys.stdin); s=d["streams"][0]; fmt=d["format"]
def fr(x):
    a,b=x.split("/"); return float(a)/(float(b) or 1)
fps=fr(s.get("avg_frame_rate","0/1")) or fr(s.get("r_frame_rate","0/1"))
dur=float(fmt.get("duration") or s.get("duration") or 0)
w, h, size = s["width"], s["height"], int(fmt.get("size", 0))
print(f"{w}x{h}  {fps:.3f} fps  {dur:.2f} s  ~{int(round(fps*dur))} frames  {size/1e6:.1f} MB")'
}

cmd_sheet() {
  local f=$1 out=${2:-} cols=${3:-4} rows=${4:-3}
  [ -n "$out" ] || out="docs/hero-lab/takes/$(basename "${f%.*}")-sheet.jpg"
  local n=$((cols*rows)); local total; total=$(python3 -c "import math; print(max(1, round($(fps_of "$f") * $(dur_of "$f"))))")
  local step=$(( total / n )); [ "$step" -lt 1 ] && step=1
  mkdir -p "$(dirname "$out")"
  # Source frame number and time burned in before `select`, so labels refer to the take's own frames.
  ffmpeg -v error -y -i "$f" -vf "drawtext=text='f%{n}  %{pts\:hms}':x=12:y=12:fontsize=28:fontcolor=white:box=1:boxcolor=black@0.55:boxborderw=6,select='not(mod(n\,$step))',scale=480:-2,tile=${cols}x${rows}" -frames:v 1 -q:v 3 "$out" 2>/dev/null \
  || ffmpeg -v error -y -i "$f" -vf "select='not(mod(n\,$step))',scale=480:-2,tile=${cols}x${rows}" -frames:v 1 -q:v 3 "$out"
  echo "sheet: $out (every ${step}th frame, ${cols}x${rows})"
}

extract_set() { # extract_set <mp4> <dir> <width> <quality> <maxframes>
  local f=$1 dir=$2 w=$3 q=$4 maxn=$5
  local fps dur outfps
  fps=$(fps_of "$f"); dur=$(dur_of "$f")
  outfps=$(python3 -c "
fps=$fps; dur=$dur; maxn=$maxn
n=round(fps*dur)
print(f'{min(fps, maxn/dur):.4f}' if n>maxn else f'{fps:.4f}')")
  rm -rf "$dir"; mkdir -p "$dir"
  ffmpeg -v error -y -i "$f" -vf "fps=$outfps,scale=$w:-2:flags=lanczos" -c:v libwebp -quality "$q" -compression_level 6 -preset photo "$dir/f_%04d.webp"
  echo "$outfps"
}

set_size() { python3 -c "import os,sys; d=sys.argv[1]; print(sum(os.path.getsize(os.path.join(d,x)) for x in os.listdir(d) if x.endswith('.webp')))" "$1"; }

fit_set() { # fit_set <mp4> <dir> <width> <quality> <maxframes> <budget>  -> lowers quality by 4 (x3), then width 90%, then frames 75%
  local f=$1 dir=$2 w=$3 q=$4 maxn=$5 budget=$6 outfps size tries=0
  while :; do
    outfps=$(extract_set "$f" "$dir" "$w" "$q" "$maxn")
    size=$(set_size "$dir")
    echo "  $dir: $(ls "$dir" | wc -l) frames at ${w}px q$q = $size bytes (budget $budget)" >&2
    [ "$size" -le "$budget" ] && break
    tries=$((tries+1))
    if [ $tries -le 3 ]; then q=$((q-4))
    elif [ $tries -eq 4 ]; then w=$((w*9/10/2*2))
    elif [ $tries -eq 5 ]; then maxn=$((maxn*3/4))
    else echo "  WARN: $dir still over budget; keeping the last attempt" >&2; break; fi
  done
  echo "$outfps $w $q"
}

cmd_frames() {
  local f=$1 out=$2; shift 2
  local dq=74 mq=72 dw=1600 mw=960 dmax=160 mmax=80 dbudget=9000000 mbudget=2500000
  while [ $# -gt 0 ]; do case "$1" in
    --dq) dq=$2; shift 2;; --mq) mq=$2; shift 2;; --dw) dw=$2; shift 2;; --mw) mw=$2; shift 2;;
    --dmax) dmax=$2; shift 2;; --mmax) mmax=$2; shift 2;; --dbudget) dbudget=$2; shift 2;; --mbudget) mbudget=$2; shift 2;;
    *) echo "unknown option $1" >&2; exit 1;;
  esac; done
  mkdir -p "$out"
  # Never upscale (CLAUDE.md rule 3): the set width is capped at the source width.
  local sw; sw=$(probe_json "$f" | python3 -c 'import json,sys; print(json.load(sys.stdin)["streams"][0]["width"])')
  [ "$dw" -gt "$sw" ] && { echo "desktop width $dw capped at source width $sw" >&2; dw=$((sw/2*2)); }
  [ "$mw" -gt "$sw" ] && mw=$((sw/2*2))
  echo "desktop set" >&2; local dres; dres=$(fit_set "$f" "$out/d" "$dw" "$dq" "$dmax" "$dbudget")
  echo "mobile set" >&2;  local mres; mres=$(fit_set "$f" "$out/m" "$mw" "$mq" "$mmax" "$mbudget")
  # Posters: frame 1 of each set, re-encoded at a slightly higher quality; under 150 KB each.
  # Named after the width actually extracted (fit_set may have stepped the width down).
  local dwa mwa; dwa=$(echo "$dres" | awk '{print $2}'); mwa=$(echo "$mres" | awk '{print $2}')
  rm -f "$out"/poster-*.webp
  ffmpeg -v error -y -i "$out/d/f_0001.webp" -c:v libwebp -quality 80 "$out/poster-$dwa.webp"
  ffmpeg -v error -y -i "$out/m/f_0001.webp" -c:v libwebp -quality 78 "$out/poster-$mwa.webp"
  python3 - "$out" "$f" "$dres" "$mres" <<'PY'
import json, os, sys, subprocess
out, src, dres, mres = sys.argv[1], sys.argv[2], sys.argv[3].split(), sys.argv[4].split()
def dims(p):
    j = json.loads(subprocess.check_output(["ffprobe","-v","error","-select_streams","v:0","-show_entries","stream=width,height","-of","json",p]))
    return j["streams"][0]["width"], j["streams"][0]["height"]
def one(d, res):
    files = sorted(x for x in os.listdir(os.path.join(out, d)) if x.endswith(".webp"))
    w, h = dims(os.path.join(out, d, files[0]))
    return {"dir": d, "count": len(files), "width": w, "height": h, "pad": 4, "ext": "webp",
            "fps_extracted": float(res[0]), "quality": int(res[2]),
            "bytes": sum(os.path.getsize(os.path.join(out, d, x)) for x in files)}
manifest = {"source": os.path.basename(src), "desktop": one("d", dres), "mobile": one("m", mres),
            "posters": [x for x in os.listdir(out) if x.startswith("poster-")]}
tmp = os.path.join(out, "manifest.json.tmp")
json.dump(manifest, open(tmp, "w"), indent=2)
os.replace(tmp, os.path.join(out, "manifest.json"))
print(json.dumps(manifest, indent=2))
PY
}

cmd_slowmo() {
  local f=$1 out=$2; shift 2
  local factor=2
  while [ $# -gt 0 ]; do case "$1" in --factor) factor=$2; shift 2;; *) echo "unknown option $1" >&2; exit 1;; esac; done
  local fps; fps=$(fps_of "$f")
  local target; target=$(python3 -c "print(min(60, round($fps*$factor)))")
  # Native width only (no upscaling): 1920 at most, less when the source is smaller.
  local sw; sw=$(probe_json "$f" | python3 -c 'import json,sys; print(min(1920, json.load(sys.stdin)["streams"][0]["width"])//2*2)')
  mkdir -p "$(dirname "$out")"
  ffmpeg -v error -y -i "$f" -an -vf "minterpolate=fps=$target:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1,setpts=${factor}*PTS,scale=$sw:-2:flags=lanczos" \
    -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p -movflags +faststart "$out"
  echo "slowmo: $out ($(cmd_probe "$out"))"
}

cmd_report() {
  local out=$1
  python3 - "$out" <<'PY'
import os, sys, json
out = sys.argv[1]
m = json.load(open(os.path.join(out, "manifest.json")))
for k, budget in (("desktop", 9_000_000), ("mobile", 2_500_000)):
    s = m[k]
    ok = "OK" if s["bytes"] <= budget else "OVER"
    print(f"{k:8s} {s['count']:4d} frames {s['width']}x{s['height']} q{s['quality']} {s['bytes']/1e6:6.2f} MB / {budget/1e6:.1f} MB {ok}  avg {s['bytes']/s['count']/1e3:.0f} KB")
for p in m["posters"]:
    size = os.path.getsize(os.path.join(out, p))
    print(f"poster   {p} {size/1e3:.0f} KB {'OK' if size <= 150_000 else 'OVER 150 KB'}")
PY
}

case "${1:-help}" in
  probe)  cmd_probe "$2";;
  sheet)  cmd_sheet "$2" "${3:-}" "${4:-4}" "${5:-3}";;
  frames) shift; cmd_frames "$@";;
  slowmo) shift; cmd_slowmo "$@";;
  report) cmd_report "$2";;
  *) sed -n '2,12p' "$0";;
esac
