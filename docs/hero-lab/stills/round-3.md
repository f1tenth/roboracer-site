# Round 3: car pose and motion cues (on 2b's light)

Same model and flags, 2b's result attached as the tenth reference with "keep the exact composition,
camera position, framing, lighting and track ... change only the position and motion of the two
cars". Sheet: `round-3.jpg`. Prompts: `round-3-<letter>.txt`; only the cars' sentence differs.

| letter | pose | job dir (`_harvest/higgsfield/`) | result |
|---|---|---|---|
| 3a | lead car half a length ahead, slight lean, wheels spinning | `20260830-022008-nano_banana_2-keep-the-exact-composition-camera-positi` | The anchor slipped: the camera moved to a different straight, a crowd of people stands along the back barrier (rule: no people), the lead car shows a green LED it did not have. Out. |
| 3b | side by side with a clear gap, slight lean, wheels spinning | `20260830-022145-nano_banana_2-keep-the-exact-composition-camera-positi` | 2b's frame held. The lead car (left, white wheels, sensor tower, blue LiDAR glow, mocap markers) and the second car (right, white box cover, LiDAR puck) sit almost level with a clear gap, both slightly leaning, faint blur on the floor. No people; the only readable text is KNAPP on the boxes, as in the references. |
| 3c | lead car a full length ahead, stronger blur, second car softened | `20260830-022320-nano_banana_2-keep-the-exact-composition-camera-positi` | The second car goes soft and small, the floor streaks hard, a "TU" logo appears on a box at the back centre (invented text). The lead car is sharp. Out on text. |

## Verdict: 3b, locked

Rubric: (1) fidelity 5; (2) the overtake at 390 px 4 (two cars almost level, the gap between them
lands under a crop anchored at about 0.45); (3) headline room 4 (the hall wall fills the upper
half, the cars sit in the lower half); (4) one light logic 5; (5) photograph at 1600 wide 5.
Total 23/25, the best of the ten stills. A side-by-side first frame also gives the film an overtake
to perform (beat B) instead of one that has already happened. See `../LOCKED_FRAME.md`.
