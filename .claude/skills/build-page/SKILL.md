---
name: build-page
description: Build or rebuild one page of roboracer.ai in the current session on its own revamp/<page> branch - plan, implement with the design system and content skill, QA at three viewports, and hand off for localhost review. Use when Cedric says "build the landing page", "redo the race page", "rebuild about", etc.
argument-hint: "<landing | race | about | research | news | rules | nav-footer>"
disable-model-invocation: true
---

# /build-page $ARGUMENTS

Preconditions (check, do not assume): `docs/AUDIT.md`, `docs/DESIGN.md`, `docs/CONTENT.md`, `docs/ASSET_MANIFEST.md` exist; `src/index.css` contains the approved `@theme` tokens; `src/components/ui/` has the shared primitives. If the design system is not in place, stop and propose running the design-system phase first (see docs/PLAN.md Phase 2).

Branch: !`git rev-parse --abbrev-ref HEAD`

## Procedure
1. Branch. If not already on `revamp/$ARGUMENTS`, run `scripts/rr.sh page $ARGUMENTS` (creates a worktree at `../roboracer-site-wt/$ARGUMENTS` from `main` and prints the `cd`), or `git switch -c revamp/$ARGUMENTS` if Cedric prefers to stay in this checkout. Never build on `main`.
2. Load context: the page's section in `docs/CONTENT.md`, the component catalog in `docs/DESIGN.md`, candidate media for this page in `docs/ASSET_MANIFEST.md`, and the skills `roboracer-design-system`, `roboracer-content`, `roboracer-media`, `frontend-design`, `gsap-scrolltrigger`, `gsap-react`.
3. Plan: write `docs/plans/$ARGUMENTS.md` (under 60 lines): sections in scroll order with the one idea each explains, primitives reused versus added, data files touched (with proposed JSON diffs), media with their manifest ids and permission status, motion per section with reduced-motion fallback, open questions. Show the plan to Cedric and wait for a go unless he said "just build it".
4. Implement section by section. After each section: `npm run lint && npm run build`. Keep the dev server running (`scripts/rr.sh dev`) and tell Cedric the URL so he can watch.
5. Media: only assets with permission `allowed` or `granted` in the manifest; process with `scripts/media.sh` into `public/media/<section>/`; videos are referenced from the Cloudflare URL or kept out of git. Check `scripts/media.sh report public` before committing.
6. Self-QA: run `/qa-page $ARGUMENTS` (screenshots, axe, console, reduced motion). Fix blockers. Then ask `@qa-reviewer` for an independent pass and address its blockers.
7. Hand off: commit in logical chunks, push the branch, and summarize for Cedric: what to look at on localhost, what changed in JSON, the `TODO(content)` items, and decisions you made that he should confirm. Do not open the PR yet; `/ship $ARGUMENTS` does that after his review.

## Rules of thumb while building
- Hero: one headline under 8 words, one sub-line, one primary CTA, one secondary. Video or a single strong still; never a slideshow.
- Next race block appears on landing and race pages with identical facts pulled from `upcoming_events.json` plus a `spotlight` entry (add the fields rather than hardcoding).
- Chapters: 3 to 5 per page maximum. Each pinned chapter must read as a static stack when unpinned.
- Logo strips: height-locked, grayscale on paper with color on hover, full color on ink.
- Every external link: `target="_blank" rel="noopener noreferrer"`.
- Type: display sizes via the `--text-display-*` tokens only; no arbitrary `text-[..]` sizes.
- If something is not in the design system and you need it three times, add it to `src/components/ui/` with props; if once, keep it local to the page.
