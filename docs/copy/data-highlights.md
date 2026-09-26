# public/data/highlights.json copy pass

The landing highlight reel. Only `caption` is visible (mono, under each tile);
`credit` stays in the JSON and is not rendered.

No changes. Every caption is under 10 words and names a moment, and all of them
are Cedric's own wording: the reel shipped with his captions (31014e0) and he
renamed five of them himself (d825d3e, "Cedric's wording").

Flagged for Cedric, not changed:

| Location | Current | Possible plain version | Rule it strains |
|---|---|---|---|
| iv2026-lap, caption | 1st Place FPV MPPI Controller · IV 2026, Detroit | the winning lap, from the car · IV 2026, Detroit | 2 ("FPV", "MPPI" are jargon for a first-time visitor), 6 (title case) |
| icra2026-start-01, caption | Ready, Set, Go! · ICRA 2025, Atlanta | the start · ICRA 2025, Atlanta | voice (exclamation mark), 6 (title case) |

Count: 16 captions reviewed, 0 changed, 16 left (2 flagged above).

## Phase 2 (2026-09-24)

The lead asked for the two flagged captions to be fixed if the fix is clear.
Both break a rule outright (title case, an exclamation mark), and the fix
keeps every fact, so both changed. They are Cedric's wording (d825d3e): if he
wants either back, revert that row.

| Location | Before | After | Rule broken |
|---|---|---|---|
| iv2026-lap, caption | 1st Place FPV MPPI Controller · IV 2026, Detroit | onboard the winning car, MPPI controller · IV 2026, Detroit | 6 (title case), 2 ("FPV" is jargon; "onboard" says the same). Keeps first place (as "winning") and MPPI, the controller Cedric chose to name |
| icra2026-start-01, caption | Ready, Set, Go! · ICRA 2025, Atlanta | the start · ICRA 2025, Atlanta | voice (exclamation mark, content skill), 6 (title case). Reads next to "start line · ICRA 2025, Atlanta" on another tile; the two clips are different moments of the same start |

Count, phase 2: 2 captions reviewed, 2 changed. The other 14 stand as in phase 1.
