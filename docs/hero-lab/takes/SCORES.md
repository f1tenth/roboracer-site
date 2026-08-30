# Take scores (fidelity bar, `.claude/skills/hero-cinematic/references/higgsfield-prompts.md`)

Model for every take: `seedance_2_0_mini`, 720p, 5 s, 16:9, no audio, the locked frame as the
start image plus ref-01, ref-02, ref-04 and ref-06 as references, 12.5 credits a take (the pick
`seedance_2_0` and the fallback `kling3_0 --mode pro` were both refused on the Starter plan; see
`../MODEL_PICK.md`). Sheets: `take-<L>-sheet.jpg` (every 10th of the 121 frames, times burned in).
Prompts: `take-<L>.txt`. Scores 1 to 5 per line; a 2 on line 1 or 3 puts the take out.

| line | A: drone tracking, camera glides back | B: wheel height, lead car passes the lens | C: slow push-in |
|---|---|---|---|
| 1. Car geometry stable (wheel count, LiDAR, proportions) | 4: both cars keep the tower, the blue LiDAR glow, the white wheels and the second car's box cover through all 121 frames; the lead car's bumper widens a little around f45 | 4: both cars correct while they approach (f20-f60); the close pass (f70-f90) blurs the lead car's chassis as a real lens would, the second car's box cover stays boxy | 5: four wheels, the tower, the LiDAR dome and glow, the markers and the second car's box cover hold in every frame, sharp to the last (f115: the lead car's front wheel fills the lower left, crisp) |
| 2. Track coherent (barriers, floor, no invented objects) | 5: tubes and KNAPP boxes stay put, the floor grate strip appears and passes as a real floor would, no new objects | 5: fixed camera, the tubes, boxes and bridge never move, the floor reflections hold | 5: the tubes, boxes and the bridge drift past exactly as a slow push-in would move them; floor reflections consistent |
| 3. No text, logos, people appearing | 5: KNAPP on the boxes only (in the references), nobody in the hall | 5: KNAPP only, nobody | 5: KNAPP only, nobody |
| 4. First frame matches the locked still | 5: f0 is the locked frame | 2: f0 is a different framing, both cars far down the straight (the prompt's "race towards the lens" made the model pre-roll the scene); the locked composition never appears | 5: f0 is the locked frame |
| 5. Camera motion smooth, no flicker, no exposure pumping | 3: no flicker or pumping, but the camera pulls back too far at 1.7-2.5 s (the cars shrink to the centre) and then lets them approach again; the overtake reads only as the lead car edging ahead at the end | 5: fixed camera, smooth approach, no flicker; but the clip ends on a blurred close-up of the second car's box (f110-f120), unusable as the hold frame under the headline | 5: one slow continuous push-in, no flicker, no pumping; the lead car edges half a length ahead between 2.5 and 3.8 s (the overtake beat) and both cars settle large and sharp for the last second |
| total | 22 | 21 | **25** |

## Notes per take

- A (`_harvest/higgsfield/20260830-023449-seedance_2_0_mini-slow-motion-drone-tracking-shot-the-came/result.mp4`,
  job `d53c8ebf-dc10-4b19-a708-6b0133570fb3`): 1280x720, 24 fps, 5.04 s, 121 frames, 3.2 MB, no
  audio stream. Usable hold frame at the end (f110-f120: the lead car large lower-left, the second
  car right, boxes on both sides). Cut into the provisional frame set at 02:39.
- B (`_harvest/higgsfield/20260830-023837-seedance_2_0_mini-camera-fixed-at-wheel-height-on-the-trac/result.mp4`,
  job `363c49e4-3b2b-44bd-b382-dd588fa5779e`): 1280x720, 24 fps, 5.04 s, 121 frames, 2.0 MB. The
  most cinematic motion of the three (the lead car sweeps past the lens at 2.9-3.3 s) but neither
  end of the clip serves the hero: the poster would not be the locked frame and the hold frame is
  a blur. Kept for the Highlights strip idea (a slow-motion encode) rather than the hero.
- C (`_harvest/higgsfield/20260830-024330-seedance_2_0_mini-very-slow-push-in-towards-the-two-one-te/result.mp4`,
  job `59c31927-9c62-4817-aa32-3f52b278c7ed`): 1280x720, 24 fps, 5.04 s, 121 frames, 2.7 MB.

## Chosen: take C (25/25; A 22, B 21)

C is the film: it is the only take that both starts on the locked frame and ends on a usable hold
frame, and it passes every fidelity line at 4 or better, which is the contract's stop condition
(section 5), so no take D. Beats read off `take-C-sheet.jpg`: A at f45 (the lead car large, p 0.33),
B at f80 (half a length ahead, p 0.55), C at f104 (both settled, p 0.70); the last frame is the hold
frame, `SCRUB_END` stays 0.80. Frames cut from C into `public/media/hero-cine/` (the provisional
set from A was replaced).
