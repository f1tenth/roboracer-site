---
target: the roboracer.ai landing page
total_score: 22
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 4
timestamp: 2026-08-22T01-32-12Z
slug: src-pages-landing-tsx
---
# Critique: roboracer.ai landing (revamp/v3-page), 2026-08-21

Method: dual-agent (A design review, B detector + browser). Score 22/32 (heuristics 7 and 10 n/a, Persuade surface).

| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of system status | 3 | Map counters "0+" mid-pin; city flash too fast |
| 2 | Match system / real world | 3 | Learn vs Course nav; orphan h2 "across the partner institutions below" |
| 3 | User control and freedom | 2 | 720vh pinned, no skip; ribbon keyboard walk |
| 4 | Consistency and standards | 3 | Section title sizes; three Slack labels; legacy footer |
| 5 | Error prevention | 3 | onError fallbacks; research ghost clipped at 390 |
| 6 | Recognition over recall | 3 | Vienna photo under "IROS 2026"; car captions dim |
| 7 | Flexibility and efficiency | n/a | Persuade |
| 8 | Aesthetic and minimalist | 3 | ragged highlight tiles; initials grid; legacy footer |
| 9 | Error recovery | 2 | clipped CTA on mobile; dead ribbon clones |
| 10 | Help and documentation | n/a | Persuade |

Design specificity: authored for RoboRacer (hero, credited tiles, URDF car, sourced map, paper figures); interchangeable zones: nav, team grid, legacy footer. Detector: 16 CLI findings all in index.css (2 actionable, 9 legacy CSS, 3 contract exceptions, 2 noise); browser 51 findings, 40 are the sr-only map list.

Priority issues:
- P1 Highlight tiles spaced by caption width (figcaption w-0 min-w-full)
- P1 Empty beat hero -> Highlights (tight top padding on section 01)
- P1 Mobile platform panel has no sticky range (inline posters per row under md)
- P1 Mobile scale: h1 33 px, car ~45% of canvas (10vw base with wrap; camera fill by height on portrait)
- P2 Ribbon clones inert (aria-hidden + tabIndex -1 instead)
- P2 Map counters "0+" mid-pin (common start)
- P2 Research action clipped at 390 (min-w-0 max-w-full)
- P2 Legacy footer ends the page (Phase 3.5, flagged to Cedric)
- P3 Car chapter desktop composition (car low in canvas, busy column)

Persona red flags: newbie (33 px headline, 9-row menu, engineer-speak captions); competitor (ten "unverified", Penn shield twice, Vienna photo under IROS 2026); faculty (Learn vs Course, still RViz frame, clipped ghost link); sponsor ("0+" mid-pin, dead clones, no sponsor entry point).

Minor: nav muddy at p 0.85; throw crosses lines; hall scene thrice; inert tag chips; Join column height; mobile car captions under the sticky canvas.

Questions: the nav pill on the video-only hero; verified podiums vs a ten-cell roster; which pin to cut for the phone.
