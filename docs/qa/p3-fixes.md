# QA: p3-fixes (items from docs/qa/p3-integration-review.md), 2026-09-26

Branch `revamp/p3-fixes`, dev server on 4191 (stopped). Captures (git-ignored) in `docs/qa/p3-fixes/`.
Lint: pass. Build: pass (only the known >500 kB RacecarAssembly chunk warning).

| Item | Status | Notes / evidence |
|---|---|---|
| 2 Past crew disclaimer | done (70340df) | lead is "Earlier team members, from the old F1TENTH about page."; "confirmed yet" absent from /about at 1536 and 390 |
| 3 nav Start here on /about | done (854481d) | /about nav hrefs `/about#about-start` (both buttons), `/#start` elsewhere. After a click from y 3000: section top 0, eyebrow at 129 px under a 67 px bar (1536), 121/63 (1366), 89/72 (390, 29 px scroll margin), 93/72 (768); focus on the section. useScrollToHash now honours scroll-margin-top. `about-navstart-{1536,1366,390}.png` |
| 4 30+ -> 30 | done (b2bb331) | lead "Moments from 30 competitions since 2016."; map counter = last held series number from events_map.json (30 now, 31 after IROS ends), reads 30 in the reduced-motion and 390 renders; no "30+" on / |
| 6 Join glyphs in ink | done (37f9828) | gradient path and prop removed from SocialGlyph; glyphs take text-strong; 0 linearGradient in #join |
| 7 /about Start here intro | done (854481d) | copy 7/12, photo 5/12 cropped 2:1, text centred beside it; photo 565x283 at 1536, 530x265 at 1366. `about-intro-1366x650.png` |
| 9 replay poster controls | done (135710f) | re-captured with `.rr-full, .rr-close, .rr-bar` hidden (same frame, crop, moment); sizes unchanged (1960x1350 41 KB, 804x1294 30 KB), so LeaderboardReplay needs no new dims. Box before/after load: 804x554 / 804x554 (1536), 342x550 / 342x550 (390). Manifest RACE-LB-01/02 updated. `race-poster-*.png`, `race-loaded-*.png` |
| 10 partner logo width/height | done (40eb1da) | partners.json width/height = the tint/colour WebP's size (PIL); `logoAttrs(p, h)` gives a numeric width at each fixed height (ribbon, clones, wall, LogoCloud, styleguide marquee). 0 images without numeric width/height on / and /about |
| 11 Neobotics capture, Quanser card | done (af536f0) | preview re-captured past the FPV hero on their red "NEO RACER" panel (37 KB); their header menu cannot be legible at 295 px from a 1280 capture, so the frame is the product panel. SP-04 and alt updated. Car link no longer `mt-auto`: it sits under the text on both cards |
| 13 scale tokens | done (6b9ff74) | carousel title text-display-s, abstract text-small; play disc rounded-pill shadow-card |
| 14 caption_verify | done (40eb1da) | removed from data.ts and community.json |
| 15 StartHere on /styleguide | done (40eb1da) | both densities; row ids via useId, all ids unique. axe on /styleguide: one moderate `landmark-unique` (two regions both named "Start here"), not serious |
| 17 lab closes row | done (ad68c42) | row only while the board's due date is ahead (useNow, 60 s); shown at 03:58Z before the 03:59Z due; hidden while the date is unknown |
| 18 Race row alt/caption | done (40eb1da) | alt "...taking a corner between yellow track barriers...", caption "a car through the corner · ICRA 2025, Atlanta" (paths.json and BUNDLED_PATHS) |
| 19 http partner links | done (40eb1da) | clemson, gzu, kaist, katech (200 in Chromium; curl lacks its intermediate cert), plus mit, nagoya-u, ucla now https; pan.pl answers 500 on both schemes, left http |
| 20 hero flash on /#start | not done | context budget; untouched. Next step: in useScrollToHash, on a first-visit arrival run the jump in a useLayoutEffect when the target exists at mount, else hide the landing (visibility) until `go()` lands; keep holdAt and the reduced-motion path |
| 12 tablet map seam (optional) | not done | not attempted (budget) |
| A Related platforms (Cedric 2026-09-26) | not done | the permission classifier refused the edit as instruction poisoning (content change relayed by an agent message); needs Cedric's own go or a permission rule. /about still shows "Spinoffs" / "Companies that grew out of the car" |
| B Slack invite renewal | not done | refused by the classifier for the same reason. New URL checked: 302 to robo-racer.slack.com/join/shared_invite/zt-47c2yt7if-..., page title "Slack". Old invite remains in index.html, paths.json, NavBar, Footer, CommunityJoin, Race, the content skill (and News.tsx / NewsEmpty.tsx, owned by the /news branch) |

## Checks (dev server, Playwright + CDP)
- Console: zero errors on /, /about, /styleguide at 1536x730 and 390x844, with and without reduced motion. /race after the replay loads: a 404 on `roboracer-class.github.io/leaderboard/data/archive/index.json` and "Blocked autofocusing" both come from the board's own iframe.
- axe on / and /about at 1536 and 390: zero violations at every impact level.
- Reduced motion on / and /about (1536, 390): static, readable, counter 30; `about-start-reduced-*.png`.
- Not re-run after this pass: 1366x650 and 768x1024 full walks of / (only /about at those sizes).
