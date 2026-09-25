# public/data/spinoffs.json copy pass, phase 2

The /about Spinoffs cards (`about/SpinoffGrid`). Only `entries` render.
Visible fields: `label` (or `kind`), `since`, `name`, `what`, and `origin`
unless it is a `TODO(content)`. Per the brief for this phase only `what` and
`origin` were edited; `status`, `source`, `note`, `named_by` and `evidence`
are untouched, and no fact was added or dropped.

| Location | Before | After | Rule broken |
|---|---|---|---|
| Neobotics, what | A Massachusetts nonprofit that builds the NeoRacer, an open autonomous race car, sold ready to run, for high schools and colleges. | A Massachusetts nonprofit. Its NeoRacer is an open autonomous race car for high schools and colleges, sold ready to run. | 4 (three nested clauses in one sentence). Keeps the lead's "sold ready to run" (75b3e5b) |
| Neobotics, origin | The NeoRacer is built to RoboRacer race rules, and Neobotics co-organized the 30th RoboRacer competition, at VTC 2026 in Boston. | The NeoRacer is built to RoboRacer race rules. Neobotics co-organized the 30th RoboRacer competition, at VTC 2026 in Boston. | 4 (two facts, now two sentences) |
| Quanser, what | An engineering-education company whose Self-Driving Car Studio is built around the QCar 2, a 1/10-scale research car. | An engineering education company. Its Self-Driving Car Studio is built around the QCar 2, a 1/10-scale research car. | 4 ("whose" clause carrying the second idea) |
| LAMARRacing, what | A University of Bonn student team, with the Lamarr Institute, that races a RoboRacer car it built itself. | A University of Bonn student team, with the Lamarr Institute. It races a RoboRacer car it built itself. | 4 (the "with …" aside splits the sentence) |

Left alone on purpose:

- LAMARRacing origin ("It tested its raceline research on its own RoboRacer
  car, then won Best Performance Overall at ICRA 2026 in Vienna."): one story
  in order, 20 words.
- Quanser origin: a `TODO(content)` the card hides until Cedric says what the
  connection is.
- Labels "nonprofit", "company", "team".
- `candidates` (ForzaETH Race Stack, RoboRacer Sim Racing League, Cavalier
  Autonomous Racing): they don't render. Read, not edited, so the lead's open
  questions in their `note` fields stay next to the wording they refer to.

Count: 8 visible strings reviewed (3 labels, 3 what, 2 origin shown), 4 changed,
4 left; plus 6 candidate what/origin lines read and left.
