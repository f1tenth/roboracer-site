---
name: qa-page
description: Run the objective quality checks for a roboracer.ai page or route - lint, build, Playwright screenshots at desktop/tablet/mobile, console and network errors, axe accessibility scan, reduced-motion and JS-disabled renders, link check, asset size check - and write docs/qa/<page>.md. Use after building a page, before /ship, and when Cedric reports a visual bug.
argument-hint: "<page> [route, default from page name]"
allowed-tools: Bash(python3 *), Bash(npx playwright *), Bash(npm run *), Bash(scripts/rr.sh *), Bash(scripts/media.sh *), Bash(curl *), Read, Write
---

# /qa-page $ARGUMENTS

Route map: landing -> `/`, race -> `/race`, about -> `/about`, research -> `/research`, news -> `/news`, rules -> `/rules`. A second argument overrides the route.

1. `npm run lint && npm run build`. Record warnings and the three largest chunks from the Vite output.
2. Start the app on a free port: `scripts/rr.sh preview --port 0` (production build; falls back to dev if no `dist/`). Note the URL.
3. With the `webapp-testing` skill's Playwright helpers (Python, `playwright` installed via `scripts/rr.sh setup`), for the route capture into `docs/qa/$ARGUMENTS/`:
   - full-page screenshots at 1440x900, 768x1024, 390x844 (`desktop.png`, `tablet.png`, `mobile.png`)
   - the same three with `reduce_motion="reduce"` (`*-rm.png`)
   - above-the-fold at 1440 with JavaScript disabled (`desktop-nojs.png`)
   - console messages (errors and warnings) and failed network requests to `console.json`
   - an axe run (`npx playwright` project or `@axe-core/playwright` via a small Node script; if unavailable, `pip install axe-playwright-python`) to `axe.json`; count serious/critical
4. Links: extract every `href` on the page, `curl -sIL -o /dev/null -w "%{http_code} %{url_effective}\n"` each external one (skip mailto and Scholar which rate-limits; mark them manual).
5. Assets: `scripts/media.sh report public` and list any file over 1.5 MB or any `<img>` without width/height, any `<video>` without poster (grep the built `dist/` HTML and the page component).
6. Motion: confirm `prefers-reduced-motion` renders a complete static page (compare `desktop.png` to `desktop-rm.png`: same content, no empty pinned sections). Confirm no section scrolls more than 250 vh while pinned.
7. Content: grep the page component and its JSON for `TODO(content)`, `lorem`, `placeholder`, and em dashes in copy (`\u2014`).
8. Write `docs/qa/$ARGUMENTS.md`: verdict (PASS / FIX), table of checks with results, screenshot links, exact console errors, axe rule ids with element selectors, link failures, asset offenders, and the list of fixes applied if you fixed anything (only trivial fixes: alt text, dimensions, rel attributes; anything structural goes back to /build-page).
9. Return the verdict and the blockers in 10 lines; point Cedric to the screenshots.
