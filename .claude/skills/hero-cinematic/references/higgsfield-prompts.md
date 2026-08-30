# Higgsfield prompt recipes for the RoboRacer hero (stills first, then one video model)

All jobs go through `scripts/hf.sh` (estimate, ledger, ceilings). Flags per model are in the CLI's
`MODELS.md` (`higgsfield model get <job_type>` prints the live schema; flag names accept `_` or `-`).
Media flags take a local path (auto-uploaded) or a UUID from a previous job.

## What the frame has to be

One frame from a film, not a render. RoboRacer 1/10-scale cars exactly as in the reference photos:
same chassis, the LiDAR puck up front, exposed electronics, real tyres. The ICRA 2026 track as in the
references: orange tube barriers on a convention-hall floor, white boxes, the KNAPP bridge, sponsor
banners far back and unreadable. Camera low and close, drone-like, long-lens compression, shallow
depth of field, one light logic (hall practicals from above, cool key, warm floor bounce), floor
reflections. No people, no readable text, no logos beyond those on the cars in the references, no
neon, no lens flare, no sparks, no smoke. 16:9. The lead car in the left third mid-overtake, the
second car half a length back on the right, both leaning into the corner, faint motion blur on the
floor and background, cars sharp.

## Stills: `nano_banana_2` (fallbacks `seedream_v5_lite --quality high`, `image_auto`; neither takes `--resolution`)

```bash
scripts/hf.sh --cost-only nano_banana_2 --prompt "test" --aspect_ratio 16:9 --resolution 2k \
  --image _harvest/higgsfield/refs/ref-01.jpg
scripts/hf.sh nano_banana_2 \
  --prompt "$(cat docs/hero-lab/stills/round-1-a.txt)" \
  --aspect_ratio 16:9 --resolution 2k \
  --image _harvest/higgsfield/refs/ref-01.jpg --image _harvest/higgsfield/refs/ref-02.jpg \
  --image _harvest/higgsfield/refs/ref-03.jpg --image _harvest/higgsfield/refs/ref-04.jpg \
  --image _harvest/higgsfield/refs/ref-05.jpg --image _harvest/higgsfield/refs/ref-06.jpg
```

Prompt skeleton (one paragraph, in this order: shot, subject, place, light, lens, negatives):

> Cinematic still from a low drone-style tracking camera, 30 cm above the floor, looking slightly
> up the track. Two RoboRacer one-tenth-scale autonomous race cars exactly like the ones in the
> reference photos (same chassis, LiDAR sensor up front, exposed electronics, rubber tyres): the
> lead car in the left third, three-quarter front view, mid-overtake; the second car half a length
> behind on the right, both leaning into the corner. The ICRA 2026 indoor track from the
> references: orange tube barriers, white box walls, grey convention-hall floor with soft
> reflections, banners far back and out of focus. Lighting: hall practicals from above, cool key,
> warm bounce off the floor. 85 mm lens look, shallow depth of field, cars sharp, faint motion
> blur on the floor. Photographic, natural colour, 16:9. No people, no readable text, no extra
> logos, no neon, no lens flare, no smoke, no sparks.

Round plan (one variable per round, 3 or 4 candidates; rounds at `--resolution 1k` when the model
offers it, 2k only for the final pick, so the example above is the final-pick form):

| round | variable | candidates |
|---|---|---|
| 1 composition | camera height and position | (a) 30 cm, corner exit; (b) 15 cm, straight, cars towards camera; (c) 60 cm, three-quarter high; (d) inside the corner looking out |
| 2 light | key and grade | (a) as the hall; (b) cooler key, deeper shadows; (c) warmer floor bounce |
| 3 pose | lean, gap, motion cues | (a) lead car half a length ahead; (b) side by side; (c) lead car one length ahead, more blur |
| 4 (if asked) | Cedric's own variable | |

Save each prompt as `docs/hero-lab/stills/round-N-<letter>.txt` and the sheet as `round-N.jpg`,
tiled at 480 px per still so the 4-up stays under 400 KB (`scripts/frames.sh` has no still tiler;
use `ffmpeg -i a.png -i b.png -i c.png -i d.png -filter_complex "[0]scale=480:-2[a];[1]scale=480:-2[b];[2]scale=480:-2[c];[3]scale=480:-2[d];[a][b][c][d]xstack=inputs=4:layout=0_0|w0_0|0_h0|w0_h0" -q:v 4 round-N.jpg`
or PIL from the ML venv for labels). The originals stay under `_harvest/higgsfield/`.

## Video: one model, chosen from measured costs (docs/hero-lab/MODEL_PICK.md)

Cost the shortlist with the locked frame (all four commands are free):

```bash
L=$(ls _harvest/higgsfield/locked-frame.* | head -1)   # keeps the downloaded extension
scripts/hf.sh --cost-only kling3_0 --prompt "x" --start-image $L --duration 5 --mode std --sound off
scripts/hf.sh --cost-only kling3_0 --prompt "x" --start-image $L --duration 5 --mode pro --sound off
scripts/hf.sh --cost-only kling3_0_turbo --prompt "x" --start-image $L --duration 5 --resolution 1080p
scripts/hf.sh --cost-only seedance_2_0 --prompt "x" --start-image $L --image _harvest/higgsfield/refs/ref-01.jpg --duration 5 --resolution 720p --mode fast --generate_audio false
scripts/hf.sh --cost-only seedance_2_0 --prompt "x" --start-image $L --image _harvest/higgsfield/refs/ref-01.jpg --duration 5 --resolution 1080p --mode std --generate_audio false
scripts/hf.sh --cost-only wan2_6 --prompt "x" --image $L --image _harvest/higgsfield/refs/ref-01.jpg --duration 5 --quality 1080p
scripts/hf.sh --cost-only wan2_7 --prompt "x" --duration 5 --resolution 1080p   # add --image $L if `higgsfield model get wan2_7` lists image references
scripts/hf.sh --cost-only veo3_1 --prompt "x" --start-image $L --duration 6 --quality basic --variant veo-3-1-fast
scripts/hf.sh --cost-only cinematic_studio_3_0 --prompt "x" --start-image $L --image _harvest/higgsfield/refs/ref-01.jpg --duration 5 --resolution 1080p --speedramp slowmo --generate_audio false
```

Video prompt skeleton (the start image carries the look; the prompt carries the motion):

> Slow-motion drone tracking shot, the camera glides low along the track at the cars' speed,
> holding both one-tenth-scale autonomous race cars in frame as the lead car completes the
> overtake through the corner. Subtle parallax on the orange barriers and white boxes, consistent
> hall lighting, gentle floor reflections. The cars keep their exact shape and details from the
> first frame, wheels turning, small suspension movement, no morphing. Smooth continuous camera
> motion, no shake, no cuts, no zoom bursts. No people, no text, no added objects.

Takes (each one call, each under the per-job cap):

- A: the skeleton as is (the literal shot).
- B: "camera at wheel height, the lead car passes close to the lens on the left, the second car
  follows through the frame" (closer, more speed).
- C: "very slow push-in from behind the second car as it closes on the leader through the corner"
  (tension, less camera travel, safer for fidelity).
- D only if A to C all fail the fidelity bar and the ledger allows it.

`--duration 5` everywhere (10 s costs about double and the scrub does not need it). Sound off.
Never `--resolution 4k` (cost, and the frame set is 1600 wide at most).

## Fidelity bar (score each take 1 to 5 per line in docs/hero-lab/takes/SCORES.md)

1. Car geometry stable across the clip: wheel count, LiDAR, proportions.
2. Track coherent: barriers do not melt, floor stays a floor, no invented objects.
3. No text, logos, people appearing.
4. First frame matches the locked still.
5. Camera motion smooth, no flicker, no exposure pumping.

A take with a 2 on line 1 or 3 is out whatever the rest says. Pick the highest total among the
rest; ties go to the slower camera.

## Recording

Every job's `request.json` and `create.stdout.txt` are kept under `_harvest/higgsfield/<job>/`
(git-ignored). The manifest row for anything that ships: `docs/ASSET_MANIFEST.md`, provenance
`AI-generated (Higgsfield <model>, job <id>) from RoboRacer organizer references (Felix Jahncke DSLR,
Cedric's clips), ICRA 2026 Vienna`, permission `granted (own media)`.
