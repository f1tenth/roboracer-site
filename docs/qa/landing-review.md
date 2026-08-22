# Independent QA review: `/` (landing v3)

Reviewer: independent QA agent, separate from the builder/director sessions and from
the concurrent "impeccable critique" process. Worktree
`/home/cedric/Documents/UPenn/xLAB/Roboracer/roboracer-site-wt/v3-page`, branch
`revamp/v3-page`. Reviewed against `docs/plans/landing-v3.md` (including its "Drift
check" section, which wins over the body per the task brief) and `docs/plans/landing-v2.md`
where v3 does not override it, `docs/design/NEOBOTICS_STRUCTURE.md`, and the
`roboracer-design-system` / `roboracer-content` skills.

**Process note, read first.** This worktree was not idle during the review: a second,
sanctioned process (the "impeccable critique" pass named in landing-v3.md's own
acceptance list: "Lint, build, /qa-page landing, @qa-reviewer, impeccable critique all
pass") was actively committing to this exact branch throughout, including real source
edits (`src/index.css`, `src/components/ui/ExplodedModel.tsx`,
`public/data/partners.json`). HEAD moved five times during this review:
`0016d2e -> 6604958 -> 95d4774 -> b503f0e -> ffe7320 -> 2a4bffc`. One of those commits
(`ffe7320`, "critique fixes: ... marquee clones live for the pointer, ... phone headline
9.5vw, ... portrait car fill") fixed exactly two things I was mid-way through
investigating (mobile headline overflow, car canvas fill on mobile) while I was
investigating them. **This report is written against `HEAD 2a4bffc`**, confirmed stable
(`git status` clean, HEAD unchanged) for the ~15 minutes before this file was written.
Re-verify HEAD before merge if more commits land. This also means an early false lead I
chased and want to flag transparently: at one point I misread a screenshot capturing the
canvas before three.js had finished mounting under SwiftShader (900ms settle, not the
2s+ the task brief warns is needed near the car chapter) as "the car is too small" — a
re-capture with a full 2.5s settle showed the car at ~78% canvas width, matching the
code's own documented target. Flagging the methodology so it is not mistaken for a live
bug.

## Verdict: SHIP

Lint clean, build clean, route-split bundle with the two heaviest chunks (three.js/R3F,
BibTeX/paper tooling) correctly deferred off the landing's critical path. Zero console
errors and zero bad network responses at every viewport tested, in both normal and
`prefers-reduced-motion: reduce` modes. Zero axe violations (serious/critical or
otherwise) at 1440 and 390. Exactly one `h1`, clean heading order, zero images missing
`alt` or `width`/`height`, CLS ~0.00009 on a production build. Every acceptance item in
the plan's "Acceptance" section is true on screen: the hero is video-only for the first
beat then assembles/zooms/exits as specced, the map's counters land on 90+/20+/1,000+/30
then "31st coming up · Pittsburgh" with the documented sanity-set cities present, the
LiDAR renders upright at every yaw tested, the partner ribbon is measured 112px (3x the
old 36px) with a working hover link, and the Join section shows live (dated,
sourced-as-manual) community numbers with a real photo. Nothing here should block
merging. The items below are real but none of them are blockers.

## Blockers

None.

## Should-fix

1. **All 10 Teams cards still render "unverified."** Every entry in
   `public/data/teams.json` carries `"status": "verify"`; `TeamGrid` correctly (per its
   own design, "nothing hidden on localhost") tags every card. Same finding as the prior
   landing-v2 QA pass — the underlying data is well-sourced (each `source` field cites a
   specific results page or Cedric), so this is not fabricated content, but a full grid
   of "unverified" tags reads as unfinished to a first-time visitor and is worth Cedric's
   explicit sign-off before shipping publicly. Screenshot:
   `docs/qa/landing/review/desktop-12-y10260.png`.
2. **`contact@roboracer.ai` in the Join section is under the 24x24px touch-target
   floor** at 390px: measured 142x20px (`CommunityJoin.tsx`). Same category of issue the
   prior QA pass flagged for the old Get-started section's equivalent link. Fix: pad the
   anchor itself, same pattern already used elsewhere on this page (the pillar/platform
   rows).
3. **Slack invite link 403s to curl** (both default and full-browser User-Agent):
   `https://join.slack.com/t/robo-racer/shared_invite/zt-42lsbf50y-_3YPNLl_d3s~wPylAOMg0g`.
   Same finding as both prior QA passes under the same content-skill claim ("confirmed
   valid by Cedric, 2026-08-20"). Almost certainly Slack's own anti-automation
   challenge, not a dead invite, but automated tooling cannot resolve it either way.
   Flagging again for one manual click-through before ship.
4. **The two featured DOI links resolve to IEEE Xplore with HTTP 202, not 200**, to curl
   with a full browser User-Agent (`doi.org/10.1109/lra.2026.3669765` and
   `doi.org/10.1109/airc64931.2025.11077481`, both redirect once to `ieeexplore.ieee.org`).
   IEEE Xplore is known to serve a bot-check response to non-interactive clients; the
   arXiv-hosted third paper resolves cleanly at 200. Not confirmed broken in a real
   browser, but not positively verified either — worth one manual check alongside the
   Slack link.
5. **Four partner links still use `http://` not `https://`**: Clemson
   (`http://www.clemson.edu/`), Guizhou (`http://www.gzu.edu.cn/en/`), KAIST
   (`http://www.kaist.edu/`), MIT (`http://www.mit.edu/`) in `public/data/partners.json`.
   All four resolve fine (200, curl follows the scheme as given), so this is not a broken
   link, just hygiene — the IIT Bombay entry in the same file was already fixed to
   `https://` mid-review by the concurrent critique pass, worth doing the same for the
   other four in one pass.

## Nice-to-have

- **No-JS renders a fully blank page** at all three viewports (`body.innerText` length 0
  with `javaScriptEnabled: false`; screenshots `docs/qa/landing/review/nojs-{desktop,
  tablet,mobile}.png`). Expected and correct for the current SPA architecture (no
  `<noscript>` fallback, no SSR/prerendering) — a site-wide characteristic, not a
  landing-v3 regression, not actionable in this PR. Same finding as the prior pass.
- **The hero's zoom+exit phase (pin progress ~0.82-0.95) produces a visually messy
  transient frame under an instantaneous scroll jump**: the giant scaling headline briefly
  overlaps the nav bar before the nav finishes filling to opaque (screenshot
  `docs/qa/landing/review/desktop-02-y1710.png`, `mobile-02-y1602.png`). This is the
  plan's own explicit design ("overflow is fine while exiting," "words thrown upward...
  the impulse comes first"), and a human scrolling continuously would only see it for a
  fraction of a second, not dwell on it the way a programmatic `scrollTo` jump does — same
  methodology caveat the prior QA pass raised for a different section. Not filed as a bug;
  worth Cedric's own eyeball on a real trackpad/wheel scroll to confirm it reads as
  intentional drama.
- Footer's "Quick Links"/"Resources" columns remain ~19px-tall touch targets on mobile —
  pre-existing, out of this session's file ownership (`Footer.tsx` untouched by the
  landing-v3 worktrees), same finding as both prior passes.
- Footer "© 2026 RoboRacer Foundation" still names a legal entity not present anywhere in
  the content skill — worth a VERIFY, not a landing-v3 issue.
- axe "incomplete" (not counted as violations): `color-contrast` (serious, 11 nodes,
  desktop) — all trace to "background color could not be determined because element
  contains an image node" (the transparent-nav links over the hero video) or "partially
  overlaps other elements" (the Next Race section's hairline `guides` grid), both known
  axe tool limitations, not visually confirmed failures. `no-autoplay-audio` (moderate, 5
  nodes) on the `muted` video elements, a known axe false positive for programmatically
  muted video. Raw results: `docs/qa/landing/axe-desktop-1440.json`,
  `docs/qa/landing/axe-mobile-390.json`.
- One `em dash` exists in the codebase, inside a third-party paper abstract
  (`public/data/publications.json`, the RLSP-MPC entry) copied verbatim from its arXiv
  source — not authored RoboRacer copy, does not violate the content skill's voice rule.
  No `lorem ipsum` or other placeholder copy found anywhere in `src/` or `public/data/`.

## Evidence

**Lint / build** (branch `revamp/v3-page`, HEAD `2a4bffc`): `npm run lint` -> 0
errors, 0 warnings. `npm run build` -> `tsc -b && vite build` succeeds in ~6-7s.
Bundle vs. the pre-revamp baseline in `docs/AUDIT.md` (single unsplit chunk
`index-BAp6Q3mR.js`, 1,229.14 kB / 310.75 kB gzip, loaded on every route including the
iframe-only pages, plus one 44.00 kB / 9.64 kB gzip CSS file):
- Landing's own critical path now: shared `index-Hg4zA2DK.js` 351.33 kB/114.93 kB gzip +
  `motion-D5IqNWvp.js` (GSAP/ScrollTrigger, needed eagerly for the hero/map/car scroll
  choreography) 143.41 kB/54.95 kB gzip + `Landing-yBt_gstV.js` 93.77 kB/42.20 kB gzip +
  `index-CZc4KEJy.css` 61.67 kB/13.09 kB gzip ~= **225.2 kB gzip JS+CSS**, versus 320.39 kB
  gzip (JS+CSS) that shipped to *every* route before, including pages that use none of it.
  The GSAP chunk is a real new cost specific to landing/styleguide (not present in the old
  monolith's per-route accounting) but is justified by the scroll choreography that is the
  point of this rebuild, and unlike the old bundle it is not paid by `/build`, `/course`,
  `/learn`, `/rules`, `/chat`.
- Heavy chunks stay correctly deferred: `RacecarAssembly-BiZpv1Oz.js` (three.js/R3F,
  1,013.00 kB/280.10 kB gzip) is IntersectionObserver-gated and confirmed via live network
  capture not to load on `/` until the car chapter nears the viewport;
  `ExplodedModelScene-BTUpRYHp.js` (the thin R3F scene wrapper, 1.97 kB/1.07 kB gzip)
  loads with the same lazy gate. `Research-CJ7B0-Zg.js` (paper tooling, 8.13 kB/2.98 kB
  gzip; the old bibtex-parser-heavy bundle is gone from `/research`'s own weight since it
  now reads `publications.json` directly) and `About-Dbg4JVM3.js` etc. stay isolated to
  their own routes.
- One build warning, pre-existing pattern: chunks over 500 kB (`RacecarAssembly`,
  `index`), both already flagged as acceptable in the prior audit given lazy-loading.

**Media budget**: `scripts/media.sh report public/media` -> total 19.28 MB across 42
files; **zero files over the 1.5 MB git rule** except the two approved hero encodes
(`hero-fpv-loop-1280.mp4` 7.61 MB, `hero-fpv-loop-960.mp4` 2.97 MB, both under their 8
MB/3 MB ceilings). Every file referenced by `highlights.json` (16 entries), the race
hero photo, both car close-up photos, all four platform media slots, and the join crowd
photo exists on disk (checked programmatically, zero missing).

**Screenshots** (`docs/qa/landing/review/`, 98 files): stitched CDP
(`Page.captureScreenshot`, never `page.screenshot` on this page per the task's own
warning about the live WebGL canvas hanging it) walks at 1440x900, 768x1024, 390x844 in
both normal and `prefers-reduced-motion: reduce`, plus targeted re-checks of the hero at
multiple pin progress values, the car chapter with a full 2.5s settle, and the nav on `/`
vs `/about`. `nojs-{desktop,tablet,mobile}.png` for the JS-disabled pass (blank, expected
per Nice-to-have). Reduced-motion screenshots confirm: hero is a static poster + paper
headline (no pin, no video element), the car chapter is one static assembled `<canvas>`
frame with all three captions visible simultaneously, and the map chapter shows all pins
and the four final numbers immediately with no scrub — all matching the plan's specified
fallback exactly.

**Console / network**: zero `console.error`/`console.warning`/`pageerror` events and zero
non-2xx responses across all five full-page walks (desktop/tablet/mobile normal +
desktop/mobile reduced-motion), confirmed via `page.on("response")` and
`page.on("console")` listeners for the full scroll duration, not just at rest.

**Accessibility**: axe-core 4.10.2 injected via CDN after a full scroll-through to mount
lazy sections, `resultTypes: ['violations','incomplete']`. **0 violations at 1440x900
and 390x844.** 2 "incomplete" categories (not violations, see Nice-to-have). Heading
sequence at 390px: `H1, H2, H2, H3, H2, H2, H3x10, H2, H3x2, H2, H3x2` — no skipped
levels. Zero `<img>` missing an `alt` attribute. Zero horizontal overflow at 390px
(`scrollWidth - clientWidth === 0`). Keyboard tab order verified by pressing Tab and
reading `document.activeElement` at every stop (not inferred from the DOM): nav (9
stops) -> hero pause control at stop 11 -> next-race CTAs -> "Explore the car" ->
platform rows (Build/Learn/Race/Research action links) -> **partner ribbon: stops 19-38,
exactly 20 stops for 20 institutions, alphabetical, zero duplicates** (an earlier
DOM-only check found 4 `<a>` elements per partner name in the markup and worried the
marquee's clone track was keyboard-reachable; the live Tab test disproves that —
Chromium's sequential focus navigation skips elements under an `aria-hidden="true"`
ancestor, which is exactly how the two clone tracks are marked, so clones are pointer-live
but keyboard-inert as intended) -> research links -> "Join the Slack" at stop 44 -> footer.
Pause control, platform rows, one copy per partner logo, and the Slack button are all
confirmed reachable exactly once, per the task's explicit checklist.

**Content**: `NextRaceSpotlight` renders "September 28 to 30, 2026, Pittsburgh",
"Check-in and practice September 27", "registration closes September 5, 2026",
"multi-agent, up to 4 cars" — matches the content skill's FINAL copy. `community.json`
carries `"source": "manual (Cedric, 2026-08-21: ...)"`, dated today, not fabricated.
`highlights.json`'s one non-live entry (`iv2026-podium`) carries `"status":
"placeholder"` and a `_curator` note explaining why ("No IV 2026 race photos in the Drive
mirror... Cedric to supply the podium photo") — the only empty-looking frame in the
strip, and it is documented exactly as the task brief anticipates. Research section shows
3 featured papers, all 2025/2026 (RA-L 2026, arXiv 2026, AIRC 2025), each with a
thumbnail and a "Figure: `<author>` et al." credit line. Map chapter's counters land on
"90+ universities / 20+ countries / 1,000+ publications / 30" then "31st coming up ·
Pittsburgh", with the plan's sanity-set cities (Anchorage, Abu Dhabi, Rio de Janeiro,
Vienna, Detroit, Pittsburgh) all present on the pinned map.

**Performance** (production build via `vite preview`, not the dev server): first-load
transfer at 1440x900 = **8.37 MB across all requests**, of which the hero video
(`hero-fpv-loop-1280.mp4`) is 7.43 MB — within the approved exception. Excluding that one
file, real first-view payload is ~0.94 MB (JS + highlights posters/images that Chromium's
lazy-load distance threshold pulled in during the `networkidle` wait, plus CSS/fonts) —
no unexpected large asset. Every image on the settled page carries `width`/`height`;
the video carries `poster`, `width`, `height`. CLS measured via a pre-navigation
`PerformanceObserver({type: 'layout-shift', buffered: true})`: **0.0000894**, well within
Core Web Vitals "good." No horizontal overflow at any viewport.

**Links**: 39 unique `href`s on the rendered page. 8 internal routes all resolve.
`target="_blank"` links (6 external CTAs/logos sample-checked, all) carry
`rel="noopener noreferrer"` with zero exceptions. External, via curl `-L` with a full
browser User-Agent: all 20 partner institution sites 200 (one, IIT Bombay, was `http://`
in a stale build captured mid-review and is already `https://` -> 200 in the current
source), `autodrive-ecosystem.github.io` 200, both `iros2026-race.roboracer.ai` URLs 200,
the Google Scholar query 200, the arXiv paper 200, `github.com/f1tenth` 200. Two
exceptions, both flagged above as should-fix, not confirmed broken: the Slack invite
(403) and the two IEEE DOI redirects (202).

## Summary for Cedric

Ship it. Lint and build are clean, the bundle is properly route-split with the three.js
and paper-tooling chunks correctly deferred off landing's critical path, and every item
in the plan's own acceptance list is true on screen: the hero plays like neobotics.org
with a real zoom and an upward exit, the car fills ~78% of its canvas as a proper product
render with an upright LiDAR at every yaw, the map's counters land on 30/31st with
Pittsburgh in violet, and the partner ribbon is measured 3x thicker with a working hover
link. Zero console errors, zero axe violations, zero broken internal links, keyboard tab
order confirmed live (not inferred) to reach the pause control, the platform rows, and
exactly one copy of each of the 20 partner logos. The should-fix list is short and none
of it blocks: all 10 Teams cards still read "unverified" (data is solid, wants your
sign-off), one email link and the Slack invite are worth a manual look, and four partner
URLs are still `http://`. One process note: another sanctioned agent was actively
committing to this same worktree while I reviewed it; this report is pinned to HEAD
`2a4bffc`, confirmed stable, but worth a final `git status`/`git rev-parse HEAD` check
before you merge.
