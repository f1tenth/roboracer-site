#!/usr/bin/env bash
# Stop hook for the overnight hero run. While .overnight/state.json says phase == "unattended"
# and done == false, and the deadline and iteration cap are not reached, exit 2 with the next
# instruction on stderr: Claude Code then keeps working instead of ending the session.
# Attended (Cedric at the keyboard), done, past the deadline, or over the cap: exit 0, let it stop.
INPUT=$(cat)
ROOT=${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}
STATE="$ROOT/.overnight/state.json"
[ -f "$STATE" ] || exit 0

RESULT=$(python3 - "$STATE" "$INPUT" <<'PY'
import json, sys, time
state = json.load(open(sys.argv[1]))
try:
    hook = json.loads(sys.argv[2]) if sys.argv[2].strip() else {}
except Exception:
    hook = {}
if state.get("phase") != "unattended" or state.get("done"):
    print("allow"); sys.exit(0)
now = time.time()
if now >= float(state.get("deadline_epoch", 0)):
    print("allow deadline"); sys.exit(0)
it = int(state.get("iterations", 0)); mx = int(state.get("max_iterations", 12))
if it >= mx:
    print("allow cap"); sys.exit(0)
left_min = int((float(state["deadline_epoch"]) - now) / 60)
print(f"block {it + 1} {mx} {left_min}")
PY
)
set -- $RESULT
case "$1" in
  allow)
    if [ "${2:-}" = "deadline" ] || [ "${2:-}" = "cap" ]; then
      printf -- '- %s Stop hook: %s reached, session may end. Finish REPORT.md and the PR if not done.\n' "$(date +'%Y-%m-%d %H:%M')" "${2}" >> "$ROOT/docs/hero-lab/LOG.md" 2>/dev/null
    fi
    exit 0;;
  block)
    NEXT=$2; MAX=$3; LEFT=$4
    (cd "$ROOT" && scripts/overnight.sh tick "Stop hook iteration $NEXT/$MAX, $LEFT min to the deadline" >/dev/null 2>&1)
    if [ ! -f "$ROOT/docs/hero-lab/takes/SCORES.md" ]; then
      cat >&2 <<EOF
Overnight run: not done yet (iteration $NEXT of $MAX, $LEFT minutes to the deadline) and no take has been scored. Keep working: follow docs/plans/hero-cinematic-v1.md sections 5 to 8 in order (takes through scripts/hf.sh within the ledger, contact sheets, SCORES.md, frames, HeroCinematic.tsx, integration), logging each step in docs/hero-lab/LOG.md. If generation is impossible (ceiling reached, auth expired, wrapper refusals), say so in LOG.md and build the component on the best material on disk. Never ask Cedric anything; decide, note it, move on.
EOF
      exit 2
    fi
    cat >&2 <<EOF
Overnight run: not done yet (iteration $NEXT of $MAX, $LEFT minutes to the deadline). Keep working. Do this now, in order:
1. Re-read docs/hero-lab/LOG.md (tail), docs/hero-lab/budget.json and section 10 of docs/plans/hero-cinematic-v1.md.
2. Run the acceptance checks: npm run lint, npm run build, the capture set at 1440/768/390 for p = 0, 0.30, 0.55, 0.80, 1.00, console errors, reduced motion, frame timing. Look at the captures.
3. Fix the weakest failing item. If everything passes, improve the choreography one change at a time (beat timing, scale, glide), captured before and after, kept only if better.
4. Update docs/qa/hero-cinematic.md and docs/hero-lab/REPORT.md, commit, push, refresh the draft PR body.
5. When section 10 is fully met, run scripts/overnight.sh done (it verifies the evidence) and end the turn with the three-line verdict.
Never re-generate video in an iteration. Never ask Cedric anything; decide, note it in LOG.md, move on.
EOF
    exit 2;;
  *) exit 0;;
esac
