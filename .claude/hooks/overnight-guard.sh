#!/usr/bin/env bash
# PreToolUse guard (Bash) for the overnight hero run. Runs next to guard-git.sh, which still
# blocks main/gh-pages/force pushes/history rewrites. This one adds the night's rules:
#   * generation jobs only through scripts/hf.sh (the budget wrapper)
#   * no Soul training, websites, marketing studio, games, workflows (all cost credits or time)
#   * git push only to revamp/hero-cinematic
#   * no Cloudflare tonight (wrangler), no sudo, no rm -rf outside the worktree, no logout
# Exit 2 = block with the reason on stderr. Exit 0 = allow.
INPUT=$(cat)
CMD=$(printf '%s' "$INPUT" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("tool_input",{}).get("command",""))' 2>/dev/null)
[ -z "$CMD" ] && exit 0
block() { echo "Blocked by .claude/hooks/overnight-guard.sh: $1" >&2; exit 2; }

# Higgsfield: jobs only through the wrapper (the wrapper's own command line never contains this pattern).
echo "$CMD" | grep -Eq '(^|[;&|[:space:]/])(higgsfield|higgs|hf)[[:space:]]+generate[[:space:]]+(create|workflow)' \
  && block "generation jobs go through scripts/hf.sh (cost estimate + ledger + ceilings); never call generate create directly"
echo "$CMD" | grep -Eq '(^|[;&|[:space:]/])(higgsfield|higgs|hf)[[:space:]]+(soul-id[[:space:]]+create|website|marketing-studio|product-photoshoot|game)' \
  && block "not tonight: Soul training, websites, marketing studio, games cost credits and are out of scope"
echo "$CMD" | grep -Eq '(^|[;&|[:space:]/])(higgsfield|higgs|hf)[[:space:]]+auth[[:space:]]+logout' && block "never log the CLI out during the run"
echo "$CMD" | grep -Eq '(^|[;&|[:space:]/])(higgsfield|higgs|hf)[[:space:]]+auth[[:space:]]+login' && block "auth login needs a browser and Cedric; if the session expired, stop generating, note it in LOG.md and continue the build"

# git push: only the trial branch.
if echo "$CMD" | grep -Eq '(^|[;&|[:space:]])git[[:space:]]+push'; then
  CUR=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
  [ "$CUR" = "revamp/hero-cinematic" ] || block "git push only from revamp/hero-cinematic (you are on $CUR)"
  ARGS=$(echo "$CMD" | sed -E 's/.*git[[:space:]]+push//' | sed -E 's/[;&|].*$//')
  for tok in $ARGS; do
    case "$tok" in
      -u|--set-upstream|origin|revamp/hero-cinematic|HEAD|HEAD:revamp/hero-cinematic|--no-verify) ;;
      *) block "git push argument '$tok' is not allowed; use: git push -u origin revamp/hero-cinematic";;
    esac
  done
fi

# Environment traps from docs/HANDOFF.md and the run state.
echo "$CMD" | grep -Eq '(^|[;&|[:space:]])pkill[[:space:]]+-f' && block "never pkill -f (it kills the tool shell); use fuser -k <port>/tcp"
echo "$CMD" | grep -Eq -- '--port[[:space:]=]+(5173|4242)([^0-9]|$)' && block "5173 is Cedric's dev server and 4242 the taskmap dashboard; use scripts/rr.sh dev --port 0 or preview --port 0"
if echo "$CMD" | grep -Eq 'overnight\.sh[[:space:]]+(disarm|arm)'; then
  PH=$(python3 -c 'import json;print(json.load(open(".overnight/state.json")).get("phase",""))' 2>/dev/null)
  [ "$PH" = "unattended" ] && block "the run does not disarm or re-arm itself; only Cedric does"
fi
echo "$CMD" | grep -Eq '(>|>>|tee|sed -i|python3?)[^|]*\.overnight/state\.json' && block "state.json is written by scripts/overnight.sh only"
echo "$CMD" | grep -Eq '(>|>>|tee|sed -i)[^|]*budget\.json' && block "budget.json is written by scripts/hf.sh only"

# Cloud, privilege, destruction.
echo "$CMD" | grep -Eq '(^|[;&|[:space:]])(npx[[:space:]]+)?wrangler([[:space:]]|$)' && block "no Cloudflare tonight (R2 upload and Pages deploy are morning follow-ups)"
echo "$CMD" | grep -Eq '(^|[;&|[:space:]])sudo([[:space:]]|$)' && block "no sudo"
echo "$CMD" | grep -Eq '(^|[;&|[:space:]])(shutdown|reboot|poweroff|systemctl)([[:space:]]|$)' && block "no system control"
echo "$CMD" | grep -Eq 'rm[[:space:]]+(-[a-zA-Z]*r[a-zA-Z]*[[:space:]]+)+(/|~|\$HOME|\.\.)([[:space:]]|/|$)' && block "rm -r outside the worktree"
echo "$CMD" | grep -Eq 'git[[:space:]]+worktree[[:space:]]+(remove|prune)' && block "leave the worktrees alone"
echo "$CMD" | grep -Eq 'git[[:space:]]+branch[[:space:]]+(-D|-d|--delete)' && block "no branch deletion tonight"
echo "$CMD" | grep -Eq 'curl[^|]*\|[[:space:]]*(sh|bash)([[:space:]]|$)' && block "no curl | sh"
echo "$CMD" | grep -Eq '(^|[;&|[:space:]])npm[[:space:]]+publish' && block "no npm publish"
exit 0
