---
name: ship
description: Open the pull request for a finished page or content branch after Cedric has reviewed it on localhost - final checks, PR body from the template, labels, reviewers. Never merges and never touches main.
argument-hint: "<page-or-topic>"
disable-model-invocation: true
allowed-tools: Bash(git *), Bash(gh pr *), Bash(npm run *), Bash(python3 scripts/validate-publications.py*), Read
---

# /ship $ARGUMENTS

Branch: !`git rev-parse --abbrev-ref HEAD`
Status: !`git status --short | head -20`

1. Refuse if the branch is `main` or `gh-pages`. Refuse if `docs/qa/$ARGUMENTS.md` is missing or its verdict is FIX (run `/qa-page` first). Refuse if `git status` shows uncommitted changes (commit or stash them first, ask Cedric).
2. Final gates: `npm run lint`, `npm run build`, `python3 scripts/validate-publications.py` (if the data file exists). All green or stop.
3. Rebase check: `git fetch origin && git log --oneline HEAD..origin/main | head` and report whether `main` moved; if it did, merge `origin/main` into the branch (never rebase, history rewriting is blocked) and rebuild.
4. Push the branch: `git push -u origin $(git rev-parse --abbrev-ref HEAD)`.
5. Create the PR with `gh pr create --base main --title "<type>(<scope>): <summary>" --body-file -` using this body:

```
## What
<2 to 4 lines: what this page/branch changes and why>

## Review on localhost
git fetch origin && git switch <branch> && npm ci && npm run dev   (or scripts/rr.sh page <name>)
Look at: <route>, desktop and mobile, reduced motion on (macOS: System Settings > Accessibility > Display > Reduce motion)

## Screenshots
<paths under docs/qa/<page>/, or drag the PNGs into the PR>

## Checks
- [x] lint, build
- [x] 1440 / 768 / 390 screenshots reviewed
- [x] axe: 0 serious/critical
- [x] reduced motion verified
- [x] links checked
- [x] no file > 1.5 MB, videos have posters
- [ ] Cedric reviewed on localhost
- [ ] Ayagoz design review

## Content changes
<JSON files touched and the TODO(content) items still open>

## Deploy
Merging to main triggers .github/workflows/build_to_pages.yml -> roboracer.ai within a few minutes. Verify the live page and the 404.html SPA fallback after deploy.
```
6. `gh pr edit --add-label revamp` (create the label once with `gh label create revamp` if missing) and request Ayagoz as reviewer if her GitHub handle is known (ask Cedric once, then remember it in `docs/PLAN.md`).
7. Report the PR URL and what Cedric needs to do to merge. Never run `gh pr merge`.
