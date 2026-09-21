# --- roboracer-site helpers (append to ~/.bashrc or ~/.zshrc, then: source ~/.bashrc) ---
export RR_SITE="$HOME/Documents/UPenn/xLAB/Roboracer/roboracer-site"
alias rr='"$RR_SITE"/scripts/rr.sh'                  # rr dev | rr check | rr page landing | rr wt
alias rr-dev='"$RR_SITE"/scripts/rr.sh dev --port 0'
alias rr-check='"$RR_SITE"/scripts/rr.sh check'
rr-page() { "$RR_SITE"/scripts/rr.sh page "$1" && cd "$RR_SITE/../roboracer-site-wt/$1" && claude; }   # new page worktree + open Claude Code there
rr-review() { cd "$RR_SITE/../roboracer-site-wt/$1" && "$RR_SITE"/scripts/rr.sh dev --port 0; }       # review a page branch on localhost
alias rr-claude='cd "$RR_SITE" && claude'
