#!/usr/bin/env bash
# rr.sh - roboracer-site helper. Run from the repo root (or any worktree of it).
#   scripts/rr.sh setup                 npm ci + playwright chromium + python deps for the publication tools
#   scripts/rr.sh dev [--port N|0]      vite dev server (0 = pick a free port), prints the URL
#   scripts/rr.sh preview [--port N|0]  build (if needed) + vite preview
#   scripts/rr.sh check                 lint + build + publications validation
#   scripts/rr.sh page <name>           create worktree ../roboracer-site-wt/<name> on branch revamp/<name> from origin/main, npm ci
#   scripts/rr.sh wt                    list worktrees
#   scripts/rr.sh wt-rm <name>          remove a worktree (branch is kept)
#   scripts/rr.sh free-port             print a free TCP port
set -euo pipefail
ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
cd "$ROOT"
free_port() { python3 -c 'import socket; s=socket.socket(); s.bind(("127.0.0.1",0)); print(s.getsockname()[1]); s.close()'; }
port_arg() { # echo the port to use from "--port N" (0 -> free)
  local p=5173
  while [ $# -gt 0 ]; do case "$1" in --port) p=$2; shift;; --port=*) p=${1#--port=};; esac; shift; done
  [ "$p" = "0" ] && p=$(free_port); echo "$p"; }
case "${1:-help}" in
  setup)
    npm ci
    npx playwright install chromium >/dev/null 2>&1 || echo "playwright chromium install skipped (npx playwright not available yet)"
    python3 -m pip install --quiet --user pypdf jsonschema playwright 2>/dev/null || true
    python3 -m playwright install chromium >/dev/null 2>&1 || true
    grep -q '^_harvest/' .gitignore 2>/dev/null || printf '\n# revamp tooling\n_harvest/\ndocs/qa/**/*.png\npublic/media/**/*.mp4\npublic/media/**/*.webm\ndata/.discover-cache.json\n' >> .gitignore
    echo "setup done. next: claude  (then /discover)";;
  dev)     shift; P=$(port_arg "$@"); echo "dev server: http://localhost:$P  (branch $(git rev-parse --abbrev-ref HEAD), $(basename "$ROOT"))"; exec npx vite --port "$P" --strictPort --host 127.0.0.1;;
  preview) shift; P=$(port_arg "$@"); [ -d dist ] || npm run build; echo "preview: http://localhost:$P"; exec npx vite preview --port "$P" --strictPort --host 127.0.0.1;;
  check)   npm run lint && npm run build && { [ -f public/data/publications.json ] && python3 scripts/validate-publications.py || true; } && echo "CHECK OK";;
  page)
    NAME=${2:?usage: rr.sh page <name>}; WT="$ROOT/../roboracer-site-wt/$NAME"; BR="revamp/$NAME"
    git fetch -q origin
    if git show-ref --verify --quiet "refs/heads/$BR"; then git worktree add "$WT" "$BR"; else git worktree add -b "$BR" "$WT" origin/main; fi
    (cd "$WT" && npm ci --silent && [ -f .claude/settings.json ] || true)
    echo "worktree ready: cd $WT   (branch $BR)"; echo "start:          cd $WT && scripts/rr.sh dev --port 0";;
  wt)      git worktree list;;
  wt-rm)   NAME=${2:?usage: rr.sh wt-rm <name>}; git worktree remove "$ROOT/../roboracer-site-wt/$NAME"; echo "removed worktree (branch revamp/$NAME kept)";;
  free-port) free_port;;
  *) sed -n '2,11p' "$0";;
esac
