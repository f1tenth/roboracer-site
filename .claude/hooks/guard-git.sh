#!/usr/bin/env bash
# PreToolUse guard for Bash: block anything that could damage main or rewrite history.
# Exit 2 = block and tell Claude why. Exit 0 = allow.
INPUT=$(cat)
CMD=$(printf '%s' "$INPUT" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("tool_input",{}).get("command",""))' 2>/dev/null)
[ -z "$CMD" ] && exit 0

block() { echo "Blocked by .claude/hooks/guard-git.sh: $1" >&2; exit 2; }

# force pushes
echo "$CMD" | grep -Eq 'git push[^|;&]*(--force|[[:space:]]-f([[:space:]]|$)|[[:space:]]\+)' && block "force push is not allowed"
# pushing to main / gh-pages as a standalone ref ("origin main", "HEAD:main", ":gh-pages")
echo "$CMD" | grep -Eq 'git push[^|;&]*[[:space:]:](main|gh-pages)([[:space:]]|$)' && block "pushing directly to main/gh-pages is not allowed; push the feature branch and open a PR"
# deleting protected branches
echo "$CMD" | grep -Eq 'git (branch -D|branch --delete --force|push[^|;&]*--delete)[^|;&]*[[:space:]](main|gh-pages)([[:space:]]|$)' && block "deleting main/gh-pages is not allowed"
# history rewriting
echo "$CMD" | grep -Eq 'git (rebase|filter-branch|filter-repo|reflog expire|gc --prune|reset --hard)' && block "history rewriting / hard reset is not allowed in this repo; use git revert or a new branch"
# manual gh-pages deploys
echo "$CMD" | grep -Eq '(npx|npm run)[[:space:]]+(gh-pages|deploy)' && block "manual deploys are disabled; deploys happen from main via GitHub Actions"

# committing while on main
if echo "$CMD" | grep -Eq '(^|[;&|[:space:]])git commit([[:space:]]|$)'; then
  CUR=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
  [ "$CUR" = "main" ] && block "you are on main; create a branch first (scripts/rr.sh page <name>)"
fi
exit 0
