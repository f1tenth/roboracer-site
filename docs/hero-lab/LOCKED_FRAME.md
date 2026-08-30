# Locked frame (gate G1): round 3, still b

Self-approved by rubric, unattended (contract section 3, 2026-08-30 02:27). Cedric was asleep; the
reasoning is here for the morning review, the three contact sheets are `stills/round-1.jpg`,
`stills/round-2.jpg`, `stills/round-3.jpg`, and a 1200 px copy of the frame is
`locked-frame-1200.jpg` (the 2752x1536 original is git-ignored).

| | |
|---|---|
| file | `_harvest/higgsfield/locked-frame.png` (copy of `_harvest/higgsfield/20260830-022145-nano_banana_2-keep-the-exact-composition-camera-positi/result.png`, 2752x1536 PNG; `result.webp` is the same frame as the API's preview) |
| model | `nano_banana_2` as typed, which the CLI resolves to Nano Banana Pro (`nano_banana_pro`), `--aspect_ratio 16:9 --resolution 2k`, 2 credits |
| job id | `e089addb-c052-4044-aa1e-3eb5a65db2b3` (Nano Banana Pro; `create.stdout.txt` in that directory) |
| round / letter | 3b (composition from 1b, light from 2b, pose from 3b) |
| references | the nine of `REFS.md` plus 2b's result (`20260830-021548-.../result.webp`) as the composition anchor |
| prompt | `stills/round-3-b.txt` |

## What it shows

A very low camera (about 15 cm) on the straight of the ICRA 2026 hall track, the two cars coming
towards it almost side by side with a clear gap: the lead car in the left third (black chassis,
white wheels, the sensor tower with the blue LiDAR glow, mocap markers, the green antenna), the
second car on the right with its white box cover and LiDAR puck. Orange tube barriers and white
KNAPP boxes on both sides, the OSB bridge and the tube ring behind, the hall wall and ceiling
practicals in soft focus across the upper half, a dark glossy floor with crisp reflections. No
people; the only readable text is the KNAPP branding on the boxes, which is in the references.

## Rubric (contract section 3, in order)

1. Fidelity checklist (geometry, LiDAR, wheels, no text, no people): **5**. Both cars match the
   reference chassis; four wheels each; the tower and the LiDAR are where the references put them.
2. The overtake reads at a glance at 390 px wide: **4**. The two cars are almost level with the
   gap between them; a 9:16 crop keeps about a quarter of the width, so `focusX` around 0.45 shows
   the lead car's right half and the second car. Tuned from the mobile capture.
3. Room for three headline lines over the upper-middle without covering the lead car: **4**. The
   hall wall fills the upper half; the block's lower edge touches the lead car's tower at full scale.
4. One light logic, no neon: **5**. Cool ceiling practicals, dark floor bounce, the LiDAR's blue
   glow as the only accent (present in ref-01).
5. Reads as a photograph at 1600 wide: **5**.

Total 23/25 (1b scored 22, 2b 22, everything else lower or out). Rounds: 4 + 3 + 3 = 10 stills,
20 credits, 2 per still; balance 278 -> 258.

## Why this one for the film

A side-by-side first frame gives the take an overtake to perform (beat B) instead of one that has
already happened; the low camera on the straight lets the cars drive at the lens (take B) or the
camera glide back with them (take A) without leaving the composition of the poster.
