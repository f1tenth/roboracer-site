---
name: audit-scope-and-style
description: Scope boundaries and expected output style for repo-auditor runs on roboracer-site - read-only except two files, cite exact paths/line numbers, verify unmerged branches via git show/merge-tree without checkout.
metadata:
  type: feedback
---

Rules confirmed by the task harness (not just inferred) for this project's audits:

- Strictly read-only on `src/` and `public/` — the only writes are `docs/AUDIT.md` and `.claude/skills/roboracer-site-map/SKILL.md`. Never `git checkout`/switch branches, even to inspect an unmerged feature branch like `feat/assembly-viewer` — use `git show <branch>:<path>`, `git ls-tree -r --long <branch>`, and `git merge-tree <merge-base> <a> <b>` instead. This worked cleanly and is the expected technique, not a workaround.
- **Why**: audits run alongside active page-building work in other sessions/worktrees; switching branches or writing outside the two allowed files could corrupt someone else's in-progress state.
- **How to apply**: default to `git show`/`git diff`/`git merge-tree` for any "what's on branch X" question in this repo. Only recommend an actual `git worktree add` or checkout to the calling agent, never do it yourself.

- Findings must be specific: exact file paths, line numbers for anything cited as "dead" or "stale" (e.g. `src/pages/Race.tsx:30-31` for a commented-out block), byte counts from `du`/`git ls-tree --long` rather than adjectives like "large". This was explicitly required by the task instructions and matches how the seed `docs/AUDIT.md`/`SKILL.md` were already written before this run — keep matching that register.
- SKILL.md body has a hard ~150-line budget and must stay factual/compact — link out to `docs/AUDIT.md` for anything with narrative detail (e.g. full "Assembly viewer reuse proposal" reasoning belongs in AUDIT.md; SKILL.md gets the condensed, load-bearing facts only: component/prop names, file line counts, byte totals, merge-conflict verdict).
- Building `npm run build`/`npm run lint` for real (not assuming pass/fail from memory of a previous audit) is required every run — build health changes between audits (e.g. this repo went from a lint-failing state with `Events.tsx` + `@fullcalendar/*` on a prior seed to a clean `main` today). Never report build/lint status without having just run it in the current session.
