# Hero cinematic v2: the four-act film (morning round, 2026-08-30)

Cedric's brief (08:43 and 08:57): third person behind our racecar racing fast and overtaking the
Unicorn car; the camera moves to the side like a drone; the whole background changes like in a
movie into a parallel dimension, bland or dark, to visualize the car's CAD explosion well; more
scroll, and the front page may be redesigned around the film so content shows as it scrolls.
Budget for the round: spend down to a 170 balance. Spent 47.5 (220.5 -> 173).

## Storyboard (`acts-sheet.jpg`, stills on Nano Banana Pro, 2 credits each)

| key frame | what | how it was made |
|---|---|---|
| KF1 chase | third-person chase camera 20 cm behind our car (the Traxxas Slash build with the orange Hokuyo, red shocks, black wheels, as in Cedric's AI car image and P1023020) racing down the straight, the Unicorn car (black tower, white wheels, blue LED, from Cedric's Unicorn photos) a length ahead on the right | `stills/kf1-chase.txt`, 9 photo references (`_harvest/higgsfield/refs-v2/`) |
| KF2 side | the drone at wheel height beside our car just after the pass, the Unicorn car half a length behind at the right edge | `stills/kf2-side.txt`, anchored on KF1 |
| KF4 void | our car alone in a bland dark studio void at the CAD hero angle (three-quarter front, low), rim-lit | `stills/kf4-void.txt`, anchored on KF1/KF2 plus the real CAD render `cad-assembled-3q-front.png` |
| KF5 exploded | the same car in the same void as an exploded engineering view laid out like the real CAD: one LiDAR lifted above the front, the compute and power boards stacked above the chassis, servo out, four wheels out on their axles, bumper detached | `stills/kf5-exploded.txt` + a one-LiDAR / eleven-parts constraint (the first draw put two LiDARs on the car), anchored on KF4 and the CAD exploded renders |

The real CAD references (`cad-refs-sheet.jpg`, `CAD_REFS.md`) were rendered from the site's own
three.js assembly at the chapter's lens by an agent: 12 views, the explosion at 0 / 0.33 / 0.66 / 1.

## Clips (Seedance 2.0 Mini, 720p, 5 s, start image + end image, 12.5 credits each)

| clip | from -> to | prompt | verdict |
|---|---|---|---|
| A1 chase | KF1 -> KF2 | `takes/a1-chase.txt` | the pass lands around 3 s, the camera swings to the side and ends on KF2; both cars keep their shape; the bridge and boxes stay coherent (`takes/a1-sheet.jpg`) |
| A23 side + dimension | KF2 -> KF4 | `takes/a2-slowmo.txt` + "the hall dissolves like a scene change" | the camera circles from the side to a three-quarter view as the Unicorn car drops away, the hall dissolves into the void between 3.0 and 3.7 s, ends on KF4; the car is unchanged throughout (`takes/a23-sheet.jpg`) |
| A4 explosion | KF4 -> KF5 | `takes/a4-explode.txt` + the CAD sequence renders as references | parts lift and slide out smoothly along their axes into KF5's layout by 1.7 s, then hold; trimmed to 2.5 s for the film (`takes/a4-sheet.jpg`) |

Film: `scripts/film-assemble.sh` joins A1 + A23 + A4[0:2.5 s] + a 0.5 s hold into 314 frames at 24
fps (`_harvest/higgsfield/v2-film.mp4`, local); `scripts/frames.sh` cuts 200 desktop frames
(1280x720, 15.3 fps, 7.56 MB) and 80 mobile frames (960x540, 2.07 MB); posters are KF1.

## Schedule shipped (`HeroCinematic` `film` prop, chapter 700vh, frames over p 0.04..0.90)

| act | set frames | p | what the visitor sees |
|---|---|---|---|
| chase | 0-77 | 0.04-0.37 | the chase and the pass; line 1 lands from frame 25 (mid-chase), line 2 from 51 (the pass), line 3 from 70 (settled at the side) |
| side | 77-122 | 0.37-0.56 | the drone move around the car in slow motion; the full headline and the description stand |
| dip | 122-138 | 0.56-0.63 | the hall dissolves into the void; the words fade out in place, the footage filter returns to 1 |
| explode | 138-200 | 0.63-0.90 | the car alone, then the explosion, no text; hold to 1.00 on the exploded view |

Glide: 2 s idle at the top glides to just after line 1 (p about 0.20). Nav fills over 0.90-0.98.

## For Cedric

1. Direction check: is this the wavelength? The chase (A1) and the dimension change (A23) are the
   two clips to judge; A4 shows the CAD explosion can be generated close to the real parts.
2. Act 4, generated or real: the generated explosion (A4) matches the CAD's layout and keeps the
   photographic car; the alternative is handing over to the real three.js `ExplodedModel` right after
   the void, which is exact by construction and scrubbable with part callouts. Both can coexist: the
   film explodes, then the real model chapter follows lower on the page as it does today.
3. Front-page redesign around the film (your 08:57 note): the schedule already displays the
   headline over the chase and the side move and clears it for the void; the next step is content
   beats inside the film (e.g. part callouts during the explosion, a stat line during the side move,
   the description as a card), and moving the car chapter directly after the hero so the story is
   film -> CAD -> the rest. Not started; needs your yes on the direction first.
4. Tuning knobs you may want moved: the dissolve is quick (0.7 s of film, 0.07 of p); the explosion
   is front-loaded; the beats; the mobile crop (focusX 0.45 follows our car).
5. Next credit tranche, if the direction holds: a re-take of A23 with a slower dissolve (12.5), an
   alternative chase angle (12.5), the real-CAD hand-off polish (0), 1080p sources on a plan that
   allows Seedance 2.0 std or Kling 3.0 pro.
