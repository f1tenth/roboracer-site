# Media intake, landing v4 (media-curator, 2026-08-22)

Source folder: `_harvest/cedric-media/` (git-ignored symlink). Review artifacts (contact sheets, 1200 px
review JPGs, LinkedIn downloads) live in the session scratchpad, prefixed `e_`; they are not committed.
Nothing from the originals was read into context; decisions were made from contact sheets and review JPGs.

## 1. Inventory (all files present at 2026-08-22 00:40)

| file | type | WxH | duration | size | what it shows | provenance | review artifact |
|---|---|---|---|---|---|---|---|
| `assembling_car.mp4` | mp4 h264 30p | 1920x1080 | 11.8 s | 6.1 MB | hands assembling a car on a bench, burned-in label "Hex Standoff - 45 mm" for the first 6 s, then the chassis is flipped and wired | Cedric (build tutorial footage) | `e_assembling_car-sheet.jpg` |
| `Autonomous RC Racing (The RoboRacer Foundation 24th Race Highlights) - The Robotics Club (1080p).mp4` | mp4 h264 60p | 1920x1080 | 215.2 s | 130.4 MB | the ICRA 2025 Atlanta reel (yellow-duct track): race cuts 0-127 s, leaderboard/cheque/awards 127-200 s, credits and group photo 200-215 s; watermark "YouTube/@madeautonomous" bottom-left on every frame | The Robotics Club (YouTube wPHYLAnpMOU), downloaded by Cedric | `e_reel-sheet-{1,2,3}.jpg`, strips `e_strips-{1..4}.jpg` |
| `ICRA_Crowd_and_Race.mp4` | mp4 h264 30p | 1024x576 | 20.4 s | 4.4 MB | handheld pan over the ICRA 2026 crowd (0-6 s), then the hall wide over the heads with the track and a small car (6-20 s) | Cedric, ICRA 2026 Vienna | `e_ICRA_Crowd_and_Race-sheet.jpg` |
| `timetrials.mp4` | mp4 h264 VFR | 1024x576 | 21.8 s | 4.8 MB | wide shot of the track during time trials, one car, close to the camera only at 1.5-3.5 s and 16.5-19 s; soft (downscaled source) | Cedric, ICRA 2026 Vienna | `e_timetrials-sheet.jpg`, `e_timetrials-fine.jpg` |
| `intense_race_moment.MOV` (new, 00:34) | MOV hevc 30p | 1920x1080 | 9.8 s | 11.8 MB | marshals walking and running along the orange track, crowd behind; no car readable in any sampled frame | Cedric, ICRA 2026 Vienna | `e_intense_race_moment-sheet.jpg`, `e_intense-frames.jpg` |
| `RedCarFastICRA.MOV` (new, 00:33) | MOV hevc 30p | 1920x1080 | 5.5 s | 6.5 MB | red car arrives down the straight (1.9 s), whip pan as it passes (3.2 s), then takes the corner onto the blue ramp toward the KNAPP straight | Cedric, ICRA 2026 Vienna | `e_RedCarFastICRA-sheet.jpg` |
| `LamarrRacingFollowUp.MOV` (new, 00:35) | MOV hevc 30p | 1920x1080 | 6.0 s | 7.3 MB | two cars nose to tail through the white-box chicane, crowd behind; cars mid-distance | Cedric, ICRA 2026 Vienna | `e_lamarr-sheet.jpg` |
| `over-the-bridge.jpg` | jpg | 2048x1365 (3/2) | - | 259 KB | black car airborne off the KNAPP bridge, shallow depth of field, no EXIF | Cedric's folder; looks like a DSLR frame (not identical to Felix Jahncke's P1033212, RMSE 0.22) | `e_over-the-bridge.jpg` |
| `The4thF1TenthCompetitionKorea.jpg` | jpg | 4000x2252 (16/9) | - | 3.7 MB | ~150 people under the banner "The 4th F1tenth Korea Championship", Incheon Songdo Convensia, date line 2025.11.4; EXIF Galaxy S24 Ultra 2025-11-04 | Cedric's folder (photographer unknown) | `e_The4thF1TenthCompetitionKorea.jpg`, `e_korea-banner.jpg` |
| `UnicornRacingTeamPic.jpg` | jpg | 2048x1536 (4/3) | - | 658 KB | seven team members holding a car on the ICRA 2026 track (KNAPP boxes, orange ducts); no EXIF | Cedric's folder | `e_UnicornRacingTeamPic.jpg` |
| `IV_Group_Picture.jpeg` | jpg | 1600x642 (2.5/1) | - | 209 KB | all IV 2026 Detroit participants behind the black-duct track with their cars, checkered flag left; low resolution | Cedric's folder | `e_IV_Group_Picture.jpg` |
| `troubleshooting.jpeg` | jpg | 1600x1200 (4/3) | - | 378 KB | UPenn Autonomous Racing table at ICRA 2026: car with a cardboard box on the table, placard "46 UPenn Autonomous Racing", a student soldering a blue car at right | Cedric's folder | `e_troubleshooting.jpg` |
| `f1tenth_learn_overview-addtooverviewofthecar.png` | png | 960x540 | - | 266 KB | the F1TENTH platform overview diagram (chassis design, system integration, software architecture, research enabled) | F1TENTH paper figure; file name says "add to overview of the car" | `e_f1tenth_learn_overview-addtooverviewofthecar.jpg` |
| `car/` | dir | - | - | empty | - | - | - |
| `linkedin/links.txt` | txt | - | - | 391 B | two LinkedIn post URLs (see section 2) | Cedric | - |

No file in the folder is an IROS reel. New since the plan was written (`find -newer docs/plans/landing-v4.md`):
`RedCarFastICRA.MOV`, `intense_race_moment.MOV`, `LamarrRacingFollowUp.MOV`.

## 2. LinkedIn downloads (`yt-dlp --cookies-from-browser chrome`, yt-dlp 2026.08.19)

| post | result | file | content |
|---|---|---|---|
| Ezio Bartocci, `ugcPost-7468278615458115584` (short link e6gNw-d8) | downloaded, 9.4 MB, 1272x720, 30 fps, 87.0 s | `e_li_ezio.mp4` | a broadcast-style composite for the whole 87 s: bird's-eye of the chicane (top left), elevated view of the bridge (right), two small views, Qualisys track map, "roboracer Master Cup @ ICRA 2026" badge (bottom left). Post text credits the track design to Andreas Brandstätter, Felix Resch, Jaroslav Klapálek |
| "Today was our first race day at IEEE ICRA", `ugcPost-7468073672411336704` (short link eASS6kzr) | downloaded, 1.66 MB, 1280x720, 30 fps, 8.9 s | `e_li_firstday.mp4` | static elevated view of the ICRA 2026 hall with the track, teams and crowd. yt-dlp title ends with "| The Roboracer Foundation": the post is by the RoboRacer Foundation page, not by a participant |

yt-dlp warned "secretstorage not available" and decrypted 190 of 312 Chrome cookies; both downloads still succeeded on the first try.

## 3. Mapping (decided before encoding)

Captions keep Cedric's subject phrase; the event suffix names the event the media really comes from.

| slot | tile id / row | source, in-out | caption | output |
|---|---|---|---|---|
| 2.1 off the line | `icra2026-start-01` | reel 0.33-3.27 s (two cars launch toward the camera at the start area) | off the line · ICRA 2025, Atlanta | `highlights/highlight-icra2025-start-01-960.mp4` + poster |
| 2.2 on the grid | `icra2026-grid-01` | reel 8.30-10.47 s (ForzaETH car on the grid line, red LEDs; 60p source played at 0.7x = 3.1 s, no duplicated frames) | on the grid · ICRA 2025, Atlanta | `highlights/highlight-icra2025-grid-01-960.mp4` + poster |
| 2.3 through the corner | `icra2026-corner-01` | `RedCarFastICRA.MOV` 1.8-5.4 s | through the corner · ICRA 2026, Vienna | `highlights/highlight-icra2026-corner-03-960.mp4` + poster |
| 2.4 two cars, one corner | `icra2026-corner-02` | reel 23.07-28.23 s (one shot: blue-placard car through the corner, whip pan, amag car through the same corner) | two cars, one corner · ICRA 2025, Atlanta | `highlights/highlight-icra2025-corner-01-960.mp4` + poster |
| 2.5 the chase | `icra2026-chase-01` | `LamarrRacingFollowUp.MOV` 0.3-4.5 s | the chase · ICRA 2026, Vienna | `highlights/highlight-icra2026-chase-02-960.mp4` + poster |
| 2.6 track-level lap | `iv2026-lap` | unchanged hero loop | 1st Thunderbolt, UPenn · IV 2026, Detroit | unchanged |
| 2.7 head-to-head | `icra2026-headtohead` | reel 91.0-94.0 s (two cars side by side toward the camera, pass at 92.7 s) | head-to-head · ICRA 2025, Atlanta | `highlights/highlight-icra2025-headtohead-01-960.mp4` + poster |
| 2.8 former Thunderbolt placeholder | `iv2026-podium` | `IV_Group_Picture.jpeg`, 3/2 crop 963x642+180+0 scaled to 1200x800 (25 percent upscale; the panorama cannot fit 3/2 without cutting the ends) | group photo · IV 2026, Detroit | `highlights/highlight-iv2026-group-01-1200.webp` |
| 2.9 on track | `icra2026-car-closeup` | Drive `Felix Jahncke/P1022894.JPG` (ETH car at speed on the black floor, amag placard), 3/2 crop 4000x2667+0+1800 after auto-orient | on track · ICRA 2026, Vienna | `highlights/highlight-icra2026-car-02-1200.webp` |
| 2.10 over the bridge | `icra2026-bridge` | `over-the-bridge.jpg` full frame | over the bridge · ICRA 2026, Vienna | `highlights/highlight-icra2026-bridge-02-1200.webp` |
| 2.11 pit work | `icra2026-pitwork` | `troubleshooting.jpeg`, 3/2 crop 1600x1067+0+66 | pit work · ICRA 2026, Vienna | `highlights/highlight-icra2026-pitwork-02-1200.webp` |
| 3 next race | `race/` | Ezio Bartocci video 30-38 s, 21/9 crop 1272x544 at the top of the composite (bird's-eye + bridge view), native width (1272 -> 1280; 1600 would be a 1.26x upscale of a 720p source) | - | `race/race-iros2026-hero-1280.mp4` + `race-iros2026-hero-poster.webp` |
| 5 Build | `platform.json` build | no `_harvest/cedric-media/platform/` folder: keep the pit-work photo | unchanged | unchanged |
| 5 Learn | `platform.json` learn | `assembling_car.mp4` full, 2x (`setpts=0.5*PTS`), no audio, 5.9 s loop. The contract's 4x would give 2.97 s from this 11.8 s file, not 8-12 s; 2x is the closest fit, see section 4 | car assembly, 2x · build tutorial | `platform/platform-learn-960.mp4` + `platform-learn-poster.webp` |
| 5 Race | `platform.json` race | reel 78.37-83.17 s (one handheld shot: LED car passes close, then the Liquid car passes close) | two cars through the corner · ICRA 2025, Atlanta | `platform/platform-race-960.mp4` + `platform-race-poster.webp` (same names, new content) |
| 5 Research | `platform.json` research | unchanged MPPI encode | unchanged | unchanged |
| 8 photo | `community.json` join.photo | `The4thF1TenthCompetitionKorea.jpg`, 4/3 crop 3003x2252+498+0 (cuts one or two people at each edge; 16/9 would keep everyone) | 4th F1TENTH Korea Championship · Incheon, Nov 2025 · verify | `join/join-korea2025-group-1200.webp` |
| 8 post card | `community.json` join.post | RoboRacer Foundation post video, full 8.9 s | - | `join/join-icra2026-post-960.mp4` + `join-icra2026-post-poster.webp` |
| 8 YouTube card | `community.json` join.youtube | reel frame at 92.6 s (two cars side by side) | ICRA 2025, Atlanta · video by The Robotics Club | `join/join-youtube-icra2025-poster-1200.webp` |
| extra, unassigned by the contract | `team/` | `UnicornRacingTeamPic.jpg`, square crop 1536x1536+257+0 | team square, status verify (team identity not confirmed) | `team/team-unicorn-racing-800.webp` |
| extra, unassigned by the contract | `car/` | `f1tenth_learn_overview-addtooverviewofthecar.png`, native 960 | car chapter / about diagram, director decides | `car/car-overview-diagram-960.webp` |

Replaced v3 files (deleted): `highlight-icra2026-{start-01,grid-01,corner-01,corner-02,chase-01,headtohead-01}-960.mp4` and their posters,
`highlight-icra2026-{car-01,bridge-01,pitwork-01}-1200.webp`, `platform-learn-1200.webp`, `race-iros2026-hero-1920.webp`,
`join-icra2026-crowd-1200.webp` (if unreferenced). `highlight-icra2026-overtake-01` ("nose to tail") is not in Cedric's table and stays.

## 4. Not used, and why

- `intense_race_moment.MOV`: no car readable in the sampled frames (marshals on the track); fails "race pace, cars filling the frame".
- `timetrials.mp4`, `ICRA_Crowd_and_Race.mp4`: 1024x576 and soft; one car far away or crowd only. Candidates for the race page, not for a 960 highlight tile.
- reel spares if Cedric wants swaps: 30.33-33.80 s (white/yellow-placard car approaching close), 50.03-53.50 s (LED car through the corner into a blur), 35.5-38.0 s (two cars in sequence), 75.43-78.37 s (a team reacting, hands on heads), 8.30-10.47 s (ForzaETH on the grid, used), group photo 207.5-211 s.
- `assembling_car.mp4` speeds: 1x 11.8 s, 2x 5.9 s (chosen), 4x 2.97 s. If Cedric meant a longer assembly video, drop it in and re-encode at 4x.
- Events across the two highlight rows after this pass: ICRA 2025 (4 clips), ICRA 2026 (3 clips, 6 photos), IV 2026 (hero loop, group photo).

## 5. Produced (2026-08-22, all budgets met)

Clips (960x540, 30 fps, H.264 crf 27): start-01 481 KB, grid-01 210 KB, corner-03 652 KB, corner-01 782 KB, chase-02 677 KB,
headtohead-01 533 KB, platform-race 729 KB, platform-learn 528 KB, join post 1.04 MB; next-race video 1280x548 886 KB (crf 24, 8 s).
Posters 20-93 KB. Photos 49-207 KB. `scripts/media.sh report public/media`: 0 files over the git rule (hero exception only).
Verification strips: `e_verify-clips-{1,2}.jpg`, `e_verify-photos.jpg` in the scratchpad.

## 6. Landing v5 pass (2026-08-22)

Cedric's named files: `ICRA26_Group_Replacae.JPG` (6000x4000, DC-S5M2), `UPennAutonomousRacingTeam.jpeg` (1600x1200), `UnicornRacingTeamPic.jpg` (2048x1536, already cut as V4-17), `AI_Generated_Car_ICRA26.png` (1376x768), and the LaMar file `LamaRRacing_team_pic.JPG` (6000x4000, DC-S5M2, 18:33:45, same series as Felix Jahncke's awards photos).

| step | decision | output |
|---|---|---|
| A1 | group photo replaced, mild 3/2 crop (5400x3600+300+400) so the crowd fills more of the tile | `highlights/highlight-icra2026-group-02-1200.webp`, 1200x800, 123 KB |
| A2 | six captions rewritten verbatim from the contract | `highlights.json` |
| A4 | Thunderbolt entry deleted; UPenn Autonomous Racing now leads with IV 2026 1st, keeps both ICRA 2026 results, photo from Cedric's file (square 1200x1200+232+0, q62 for the 120 KB budget) | `teams.json`, `team/team-upenn-autonomous-racing-800.webp` 800x800 115 KB |
| A5 | `VAUL 2` renamed `VAUL`; source note records that VAUL 1 is the same lab; a Felix pit photo (P1022968) shows Universite Laval / NORLab signage on a car, noted as a hint only | `teams.json` |
| A6 | UNICORN_Racing -> existing `team-unicorn-racing-800.webp`; LAMARRacing -> `team-lamarracing-800.webp` (square 4000x4000+1090+0 of the LaMar file) | `teams.json`, `team/` |
| A7 | tenth team: Brake Check Buddies, 2nd Classic Cup at ICRA 2026 (the next podium place not yet listed; the Master Cup's next unlisted place is 6th flyby) | `teams.json` |
| A8 | Brake Check Buddies photo from its team-intro video (frame 12.0 s, crop 780x740+700+120, label cropped out). No photo for 404 Racers, West Virginia University (no IV 2026 per-team media) or UBM-Tom (no labelled photo; see manifest V5 note) | `team/team-brake-check-buddies-800.webp` 800x759 |
| A9 | AI car image: 1376x768 = 43:24 (1.79:1, about 16/9), encoded full frame at 1200x670. The 16/10 car slot will letterbox or crop 6 percent vertically | `car/car-photo-02-1200.webp` 74 KB |
| A10 | Open Robotics logo from their press kit SVG (openrobotics.org did not block; the squarespace PNG on the home page is only 170x46), cleaned to 3.9 KB; LinkedIn author URL read from the post page: https://www.linkedin.com/company/open-source-robotics-foundation | `join/openrobotics-logo.svg`, `community.json` author_url + author_logo |

Tool note: ImageMagick 6's `-quality` had no effect on this WebP write (identical bytes at q82/q74/q72); ffmpeg libwebp `-quality` works and was used for the two budget-sensitive team files.

## Round two (landing v5, media-curator, 2026-08-22)

Scratch artifacts are prefixed `a2-` in the session scratchpad (post pages `a2-page-N.html`, downloaded post images `a2-img-N-i.jpg`, per-post contact sheets `a2-sheet-N.jpg`, review JPGs `a2-rev-*.jpg`, check montages `a2-posters-check.jpg`, `a2-t2-check.jpg`). Nothing from the originals was read at full size.

### Community posts (task n80)

`yt-dlp --cookies-from-browser chrome` decrypted no `li_at` cookie this time (secretstorage missing) and reported "Unable to extract video" for all eleven URLs, which is expected: none of them is a video post. All eleven pages load logged-out (`curl -L` with a Chrome UA, HTTP 200, no auth wall), and every post's images are in the page as `feedshare-*` URLs; the largest variant served to guests is 800 px on the long side (two posts also expose 1152x1536 and 900x1600 variants, and several expose animated GIFs at 480-1000 px which were sampled but not chosen). Posters were cut from the downloaded images at native size, so most are 800 px wide rather than the 960 the brief named; no upscaling. Author and date come from the page title suffix / actor block and `datePublished`; the JSON-LD `author` field on these pages is the first commenter, not the poster, and was ignored.

| n | author | chosen image | why |
|---|---|---|---|
| 1 | Samir Shehadeh | 4th image: car with the KNAPP Performance Challenge trophy | the only clean object shot in the set; the cornering GIF is credited to Felix Jahncke |
| 2 | Cédric Hollande | 2nd image: Cedric and Dhyey with the car on the track | people plus car plus hall; the group photo is already used elsewhere |
| 3 | KNAPP | 1st image: crowd behind the KNAPP bridge | the only image in the post that shows the race; the rest are KNAPP boxes, banner, marshal shirt |
| 4 | UNICORN Racing | 1st image (1152x1536): team with car at the ICRA sign, 4/5 crop | largest and sharpest; the bridge shot duplicates post 5 |
| 5 | The Roboracer Foundation | 4th image: two cars at the bridge with marshals | race action; the hall-wide shots are flatter |
| 6 | Dhruv Jaiswal | 3rd image: pit table with laptop and car | the group photo is 800x321 and the GIF frames are soft |
| 7 | Milan Manoj | 1st image: car, 2nd place plaque, name badge | reads as a podium without faces |
| 8 | Mateus Karvat Camara | 1st image: Ingenuity Labs Racing team with car | team identity is in the post text |
| 9 | Lukas Kutsch | 1st image: two members with the trophy | the trophy car duplicates post 1; photo credited to Felix Jahncke in the post |
| 10 | Meghaj Kabra | 1st image: Purdue team with certificate and car at the track | team at the race, not the skyline shots |
| 11 | Manasi Shrekhar | 2nd image (900x1600): award handshake, 4/5 crop 900x1125+0+400 | the only still; the GIF is track only |

Note for the content owner: UNICORN Racing's own post carries the hashtag #UNIST, while `teams.json` lists UNICORN_Racing under University of Bonn (from the skill's candidate list). LAMARRacing is the Bonn team per Samir Shehadeh's post. Verify the UNICORN_Racing institution before publishing.

### Teams (task n82) and car photo 1

Review JPGs of `scuderia-segfault.jpg`, `forzaethteam.jpg` and `startline_eth.png` at 1200 px were read once each; crops are recorded in `docs/ASSET_MANIFEST.md` (V5b-T1, V5b-T2, V5b-C1). The ETH car in `startline_eth.png` is the front car: its placard reads "amag / ForzaETH" with the red-white checkered ForzaETH livery; the rear car carries a plain white placard.
