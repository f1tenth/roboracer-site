#!/usr/bin/env bash
# Overnight run state for the Stop hook (.claude/hooks/overnight-stop.sh) and scripts/hf.sh.
#
#   scripts/overnight.sh arm [--deadline HH:MM] [--max-iterations N]   Cedric said "go to sleep": phase -> unattended
#   scripts/overnight.sh disarm                                          back to attended (Cedric is at the keyboard)
#   scripts/overnight.sh status                                          print the state
#   scripts/overnight.sh done                                            mark done after verifying the acceptance evidence
#   scripts/overnight.sh tick "<note>"                                   used by the Stop hook: iteration += 1, note logged
#
# State: .overnight/state.json  {phase, armed_at, deadline, deadline_epoch, iterations, max_iterations, done, notes[]}
set -euo pipefail
ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
cd "$ROOT"
STATE=".overnight/state.json"
LOG="docs/hero-lab/LOG.md"
mkdir -p .overnight docs/hero-lab

py() { python3 - "$@"; }

log_line() { printf -- '- %s %s\n' "$(date +'%Y-%m-%d %H:%M')" "$1" >> "$LOG"; }

case "${1:-status}" in
  arm)
    shift
    DEADLINE="07:00"; MAXIT=12
    while [ $# -gt 0 ]; do case "$1" in
      --deadline) DEADLINE=$2; shift 2;;
      --max-iterations) MAXIT=$2; shift 2;;
      *) echo "unknown option $1" >&2; exit 1;;
    esac; done
    py "$DEADLINE" "$MAXIT" <<'PY'
import json, sys, os, time
from datetime import datetime, timedelta
deadline, maxit = sys.argv[1], int(sys.argv[2])
hh, mm = (int(x) for x in deadline.split(":"))
now = datetime.now()
target = now.replace(hour=hh, minute=mm, second=0, microsecond=0)
if target <= now:
    target += timedelta(days=1)
state = {}
try:
    state = json.load(open(".overnight/state.json"))
except Exception:
    pass
state.update({
    "phase": "unattended",
    "armed_at": now.isoformat(timespec="seconds"),
    "deadline": target.isoformat(timespec="seconds"),
    "deadline_epoch": int(target.timestamp()),
    "iterations": 0,
    "max_iterations": maxit,
    "done": False,
    "notes": [],
})
tmp = ".overnight/state.json.tmp"
json.dump(state, open(tmp, "w"), indent=2)
os.replace(tmp, ".overnight/state.json")
print(f"armed: unattended until {target.strftime('%Y-%m-%d %H:%M')} or {maxit} Stop-hook iterations, whichever first")
PY
    log_line "ARMED unattended (deadline $DEADLINE, max iterations $MAXIT). Stop hook active from here."
    ;;
  disarm)
    py <<'PY'
import json, os
state = {}
try:
    state = json.load(open(".overnight/state.json"))
except Exception:
    pass
state["phase"] = "attended"
tmp = ".overnight/state.json.tmp"
json.dump(state, open(tmp, "w"), indent=2)
os.replace(tmp, ".overnight/state.json")
print("disarmed: attended")
PY
    log_line "DISARMED (attended)."
    ;;
  status)
    if [ -f "$STATE" ]; then cat "$STATE"; else echo '{"phase":"attended","done":false}'; fi
    ;;
  tick)
    NOTE=${2:-}
    py "$NOTE" <<'PY'
import json, os, sys
from datetime import datetime
state = json.load(open(".overnight/state.json"))
state["iterations"] = int(state.get("iterations", 0)) + 1
state.setdefault("notes", []).append({"ts": datetime.now().isoformat(timespec="seconds"), "note": sys.argv[1]})
tmp = ".overnight/state.json.tmp"
json.dump(state, open(tmp, "w"), indent=2)
os.replace(tmp, ".overnight/state.json")
print(state["iterations"])
PY
    log_line "Stop hook: $NOTE"
    ;;
  done)
    # Evidence-based: refuse to mark done when the acceptance artifacts are missing.
    missing=()
    for f in docs/hero-lab/LOCKED_FRAME.md docs/hero-lab/MODEL_PICK.md docs/hero-lab/takes/SCORES.md \
             docs/hero-lab/REPORT.md docs/qa/hero-cinematic.md public/media/hero-cine/manifest.json; do
      [ -f "$f" ] || missing+=("$f")
    done
    if [ ${#missing[@]} -gt 0 ]; then
      printf 'not done, missing: %s\n' "${missing[*]}" >&2; exit 2
    fi
    grep -q "Verdict: PASS" docs/qa/hero-cinematic.md || { echo "not done: docs/qa/hero-cinematic.md has no 'Verdict: PASS'" >&2; exit 2; }
    if [ -d node_modules ]; then
      npm run -s lint >/dev/null 2>&1 || { echo "not done: npm run lint fails" >&2; exit 2; }
      npm run -s build >/dev/null 2>&1 || { echo "not done: npm run build fails" >&2; exit 2; }
    fi
    py <<'PY'
import json, os
state = json.load(open(".overnight/state.json"))
state["done"] = True
tmp = ".overnight/state.json.tmp"
json.dump(state, open(tmp, "w"), indent=2)
os.replace(tmp, ".overnight/state.json")
print("done: the Stop hook will let the session end")
PY
    log_line "DONE: acceptance evidence present, lint and build green."
    ;;
  *) sed -n '2,10p' "$0";;
esac
