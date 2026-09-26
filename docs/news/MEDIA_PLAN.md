# News media plan

Generated 2026-09-26 on `revamp/p3-news-media` (taskmap n337) for Cedric's note: every news item should have a picture, and the Sim Racing League items should embed the Tinker Twins' AutoDRIVE recap videos. Research only: nothing on the site or in `public/data/news.json` has changed. The machine-readable plan is `docs/news/MEDIA_PLAN.json` (one entry per item; `checked` holds the HTTP status of every URL recorded, thumbnails and source pages included, all 2xx on 2026-09-26, and the rclone size of every Drive path).

## Counts

- Items: 75. With an image or embed today: 38. Without: 37.
- The 37 without media: **youtube 20**, **photo 11**, **poster 4**, **none 2**.
- Of the 38 with media: 7 would lead better with a video (`upgrade`), 6 gain a secondary video under today's lead (`secondary`), the rest keep what they have (`keep`).
- Sim Racing League: editions 1 to 4 get their AutoDRIVE recap (bctpfSjyjXs, Q-WTcTOld08, oObgg_MCU4U, 7Y2jeoHyvWA). The fifth (ICRA 2026, xCp1KB-JGZ4, Cedric's example) has no news item. The sixth (IROS 2026) has no recap uploaded yet.

## Sources, in the order they were tried

1. YouTube: the AutoDRIVE Ecosystem channel (the Tinker Twins, 51 uploads listed), the xLAB channel (@RealTimemLAB, 478 uploads listed), every YouTube id named in the repo's candidates and data (103 ids resolved), and searches for the gaps.
2. Photos we may use: the organizers' Mailchimp newsletters (`own archive`), the old f1tenth.org site and gallery on github.com/f1tenth/f1tenth.github.io (`own archive`; the fall 2018 course folders credit Christopher Kao), the Roboracer Foundation's own LinkedIn posts (`Foundation post`), and the Drive (`organisation-owned (Drive)`). Team, university, news-site and personal LinkedIn photos are listed in the notes only, as `needs permission`.
3. Fallback: the dated Drive poster of the same race (`rr:/Posters 2026/`, all 1414x2000 PNG, 1.7 to 6.6 MB; they need a WebP cut before use).

## Plan by year

`add` rows have no media today; `upgrade` rows have media and a better lead video; `secondary` rows keep their lead and gain a video. `keep` rows are left out of the table (see the JSON).

### 2026

| date | item | action | choice | source |
|---|---|---|---|---|
| 2026-09-12 | `ifac2026-busan-largest-race` 274 racers and 56 teams in Busan: the largest race in RoboRacer history | secondary | youtube | YouTube `vGqDLhgokSY` 부산대학교기계공학부, 2026-08-26: 29th Roboracer Autonomous Racing Competition(20260826) |
| 2026-08-23 | `iros2026-registration-closes-sep-5` Registration for the 31st competition at IROS 2026 closes September 5 | add | poster | `rr:/2026 IROS/Flyers/Vertical-Flyer-IROS2026-Roboracer.png` 1414x2000, 2,395,387 B; organisation-owned (Drive), photographer credited |
| 2026-08-23 | `ifac2026-busan-opens` The 29th competition opens in Busan on August 24 | add | photo | `rr:/2026 IFAC/Media - POST MEDIA!/29th ROBORACER AUTONOMOUS RACING COMPETITION/[사진]29th ROBORACER AUTONOMOUS RACING COMPETITION 보정사진 (3).jpg` 8192x5464, 5,850,984 B; organisation-owned (Drive), photographer credited |
| 2026-06-15 | `post-unicorn-racing-344833` UNICORN Racing wins the RoboRacer competition at ICRA 2026 | secondary | youtube | YouTube `lqsQcrROt1g` xLAB for Safe Autonomous Systems, 2026-08-14: UNICORN_Racing — Roboracer ICRA 2026 \| Autonomous Racing in Vienna |
| 2026-06-15 | `post-mateus-karvat-541826` Ingenuity Labs Racing's first RoboRacer competition, in Vienna | secondary | youtube | YouTube `e8sWPAveVKA` xLAB for Safe Autonomous Systems, 2026-08-14: Ingenuity Labs Racing — Roboracer ICRA 2026 \| Autonomous Racing in Vienna |
| 2026-06-10 | `post-cedric-hollande-699200` UPenn takes 2nd in time trials and 5th overall at ICRA 2026 | secondary | youtube | YouTube `ZY7fMINZXqQ` xLAB for Safe Autonomous Systems, 2026-08-14: UPenn Autonomous Racing — Roboracer ICRA 2026 \| Autonomous Racing in Vienna |
| 2026-06-05 | `icra2026-vienna-results` Full results from the 27th competition at ICRA 2026 | upgrade | youtube | YouTube `vlt6veE4SJI` xLAB for Safe Autonomous Systems, 2026-08-23: ICRA 2026 RoboRacer Team Interviews |

### 2025

| date | item | action | choice | source |
|---|---|---|---|---|
| 2025-12-07 | `cdc-techfest-2025-sim-league-vaul-wins` VAUL wins the fourth Sim Racing League | add | youtube | YouTube `7Y2jeoHyvWA` AutoDRIVE Ecosystem, 2026-01-31: 4th RoboRacer Sim Racing League @ CDC-TF 2025 |
| 2025-11-06 | `iccas2025-unist-wins` The fourth Korea Championship, at ICCAS 2025 | upgrade | youtube | YouTube `tnn4isfdUCE` Unicorn Racing, 2026-01-29: 2025 4th F1tenth Korea Championship (ICCAS, Incheon) - Sketch Video |
| 2025-10-13 | `roboracer-rules-repository-2025` The rules get a public, versioned home | add | none | none |
| 2025-06-23 | `iv2025-cluj-forzaeth-wins` ForzaETH wins the 25th competition, in Cluj-Napoca | add | poster | `rr:/Posters 2026/Draft 1 (6).png` 1414x2000, 4,448,961 B; organisation-owned (Drive), photographer credited |
| 2025-05-22 | `icra2025-atlanta-unibo-wins` Unibo Motorsport wins the 24th competition, in Atlanta | upgrade | youtube | YouTube `wPHYLAnpMOU` The Robotics Club, 2025-05-30: Autonomous RC Racing (The RoboRacer Foundation 24th Race Highlights) |
| 2025-05-13 | `icra2025-sim-league-vaul-wins` VAUL wins the third Sim Racing League | add | youtube | YouTube `oObgg_MCU4U` AutoDRIVE Ecosystem, 2025-06-02: 3rd RoboRacer Sim Racing League @ ICRA 2025 |

### 2024

| date | item | action | choice | source |
|---|---|---|---|---|
| 2024-12-19 | `cdc2024-milan-scuderia-segfault-wins` Scuderia Segfault wins the 22nd competition, in Milan | add | poster | `rr:/Posters 2026/17.png` 1414x2000, 5,279,692 B; organisation-owned (Drive), photographer credited |
| 2024-12-08 | `cdc2024-sim-league-vaul-wins` VAUL wins the second Sim Racing League | add | youtube | YouTube `Q-WTcTOld08` AutoDRIVE Ecosystem, 2024-12-29: 2nd F1TENTH Sim Racing League @ CDC 2024 |
| 2024-11-22 | `bu2024-lehigh-wins` Lehigh's Mountain Hawks win the 23rd competition | add | poster | `rr:/Posters 2026/18.png` 1414x2000, 6,555,534 B; organisation-owned (Drive), photographer credited |
| 2024-11-13 | `f1tenth-to-roboracer-announced` F1TENTH announces its move to RoboRacer | add | photo | `https://mcusercontent.com/a91a25f4c1fbc0c9896af9a20/images/007d865c-53de-fae0-e1ad-41db078965fa.png` 6912x3456, 497,772 B; own archive |
| 2024-10-29 | `korea2024-dong-a-wins` Dong-A University wins the third Korea Championship | add | youtube | YouTube `LD_JWum5L_I` AiX, 2024-11-14: 2024 3rd F1tenth Korea Championship (28-30 Oct, 2024) |
| 2024-10-17 | `iros2024-abudhabi-dzik-ultimate-wins` Dzik Ultimate wins the 21st competition, in Abu Dhabi | add | photo | `https://mcusercontent.com/a91a25f4c1fbc0c9896af9a20/images/ab00e70a-8d47-31d4-df88-e034b33d1062.jpg` 2048x1536, 652,106 B; own archive |
| 2024-10-06 | `iros2024-sim-league-first` TURTLEBOT wins the first Sim Racing League | add | youtube | YouTube `bctpfSjyjXs` AutoDRIVE Ecosystem, 2024-10-11: 1st F1TENTH Sim Racing League @ IROS 2024 |
| 2024-05-16 | `icra2024-yokohama-vaul-wins` VAUL wins the 15th competition, in Yokohama | add | photo | `media.licdn.com (Foundation post)` 822x1536, 228,669 B; Foundation post |
| 2024-05-16 | `cpsweek2024-hongkong-fsm-speed-wins` CityU's FSM Speed wins the 17th competition | add | photo | `https://mcusercontent.com/a91a25f4c1fbc0c9896af9a20/images/a85e393f-34ac-a029-ed41-b83806bab76f.jpg` 1908x1272, 901,231 B; own archive |
| 2024-04-29 | `course2024-three-university-race` Penn takes first and second in a three-university race | add | photo | `https://mcusercontent.com/a91a25f4c1fbc0c9896af9a20/images/a66af0cf-94c0-5c02-f7fc-6a1d2ef9c80f.jpg` 4032x3024, 1,733,337 B; own archive |
| 2024-02-15 | `f1tenth-korea-delegation-upenn` F1TENTH Korea delegation visits Penn Engineering | add | none | none |
| 2024-02-10 | `autodrive-f1tenth-autoware-integration` AutoDRIVE, F1TENTH and Autoware, integrated | add | youtube | YouTube `I-tEjVMtans` AutoDRIVE Ecosystem, 2024-02-10: Autoware on F1TENTH for Autonomous Racing \| Real World \| AutoDRIVE-Autoware Integration |

### 2023

| date | item | action | choice | source |
|---|---|---|---|---|
| 2023-10-19 | `korea2023-hmcar-wins` HMcar wins the second Korea Championship | add | youtube | YouTube `dmZCUUcmzzE` AiX, 2023-10-24: 2023 F1Tenth Korea Championship (Oct 17-19, 2023, Yeosu, Korea) |
| 2023-10-13 | `autodrive-digital-twin-first-look` A digital twin of the car in the AutoDRIVE simulator | add | youtube | YouTube `Rq7Wwcwn1uk` AutoDRIVE Ecosystem, 2023-10-12: Digital Twin of F1TENTH in AutoDRIVE Simulator - A First Look |
| 2023-10-05 | `iros2023-detroit-vaul-wins` VAUL wins the 14th competition, in Detroit | upgrade | youtube | YouTube `KHUE3kbSOCE` Véhicule Autonome UL, 2024-03-01: Recap F1TENTH Detroit 2023 |
| 2023-07-01 | `eth-pbl-map-controller` The MAP controller, a model and acceleration based pursuit | add | youtube | YouTube `lE_Dk1iJHHg` D-ITET Center for Project-Based Learning, 2023-02-28: Model- and Acceleration-based Pursuit Controller for High-Performance Autonomous Racing |
| 2023-05-31 | `icra2023-london-forzaeth-wins` ForzaETH wins at ICRA 2023 in London | secondary | youtube | YouTube `GiXn8uKrcSk` TU Wien TV, 2023-06-09: TU Wien Racing Team: F1TENTH Grand Prix autonomer Modellautos 2023 |
| 2023-05-09 | `cps2023-san-antonio-penn-wins` Penn wins in San Antonio | add | youtube | YouTube `BWRscx68Dl0` xLAB for Safe Autonomous Systems, 2023-05-11: F1Tenth Competition at CPS-IoT Week 2023 |

### 2022

| date | item | action | choice | source |
|---|---|---|---|---|
| 2022-12-13 | `korea2022-first-korea-championship` ACE2 wins the first Korea Championship | add | youtube | YouTube `Iy5M5hh4gFk` AiX, 2022-12-29: 2022' 1st F1TENTH KOREA CHAMPIONSHIP |
| 2022-05-25 | `icra2022-philadelphia-scatterbrain-wins` Penn's ScatterBrain wins the tenth competition, in Philadelphia | add | youtube | YouTube `gk_lNKmZX4I` TU Wien TV, 2022-06-09: Scuderia Segfault – TUW- Racing-Team für autonomes Fahren beim F1TENTH Grand PRIX at ICRA |

### 2021

| date | item | action | choice | source |
|---|---|---|---|---|
| 2021-10-01 | `iros2021-prague-scuderia-segfault-wins` Scuderia Segfault wins the ninth competition, in Prague | add | youtube | YouTube `CmTkiBiMnk4` industrialinformatics, 2021-10-01: F1/10 Highlights |
| 2021-05-31 | `icra2021-racing-workshop` An ICRA workshop series on autonomous racing begins | add | youtube | YouTube `SI0pB6cimoo` Madhur Behl, 2021-06-10: [ICRA21 Autonomous Racing] - Opening Remarks |

### 2020

| date | item | action | choice | source |
|---|---|---|---|---|
| 2020-10-27 | `iros2020-virtual-hipert-wins` HiPeRT Modena wins the eighth competition, online | add | photo | `https://f1tenth.github.io/Brackets/irosbracket.png` 5692x3200, 195,128 B; own archive |
| 2020-09-29 | `course-2020-recorded-online` The full course, recorded and free online | add | youtube | YouTube `hXmGTKom4O8` xLAB for Safe Autonomous Systems, 2020-09-29: F1TENTH Course Introduction by Rahul Mangharam |
| 2020-07-16 | `ifac2020-virtual-tufast-wins` TUfast TUfurious wins the seventh competition, online | add | youtube | YouTube `YMzm2oCc_4w` TU Wien TV, 2020-07-21: TU fast TU Furious gewinnt F1/TENTH-Grand Prix in Berlin |
| 2020-05-15 | `unc-the-fast-and-the-autonomous` The fast and the autonomous | add | youtube | YouTube `ctTJHueaTcY` xLAB for Safe Autonomous Systems, 2019-08-25: F1/10 Autonomous Racing - Montreal Grand Prix Winning Team |
| 2020-05-08 | `f1tenth-foundation-2020` f1tenth.org starts signing as the F1TENTH Foundation | add | photo | `https://f1tenth.github.io/landing/f110-top-transparent.png` 477x800, 611,330 B; own archive |
| 2020-04-21 | `medium-adventures-in-autonomous-vehicles` Adventures in autonomous vehicles | add | photo | `https://f1tenth.github.io/gallery/media/large/Levine%20Track%2012-4-18%20Testing/L1100185.jpg` 1778x1000, 289,234 B; own archive |

### 2019

| date | item | action | choice | source |
|---|---|---|---|---|
| 2019-10-14 | `columbia2019-fifth-competition` SeoulTech and Modena share the fastest lap at Columbia | upgrade | youtube | YouTube `fevOWV0qbu8` Columbia Video Network, 2019-10-22: F1 Tenth Autonomous Racing Competition at Columbia Engineering |
| 2019-08-15 | `nsf-community-platform-award-2019` NSF funds the car for research and teaching | add | photo | `https://f1tenth.github.io/gallery/media/large/Final%20Race%2012-10-18/L1100823.jpg` 1778x1000, 361,410 B; own archive |
| 2019-03-01 | `f110-simulator-open-source-2019` The racing simulator goes open source | secondary | youtube | YouTube `tZeA7ykIYwA` Madhur Behl, 2019-11-01: ROSCon '19 Talk: ROS F1/10 Autonomous Racing Simulator |

### 2018

| date | item | action | choice | source |
|---|---|---|---|---|
| 2018-11-07 | `daily-pennsylvanian-2018-dining-hall` A self-driving car laps a Penn dining hall | add | photo | `https://f1tenth.github.io/gallery/media/large/Mid-Semester%20Race%2011-6-18/L1050744.jpg` 1500x1000, 256,820 B; own archive |
| 2018-10-01 | `esweek2018-torino-calvin-wins` Team CALVIN from Warsaw wins the third competition | upgrade | youtube | YouTube `VlE2Wb_XhoQ` Madhur Behl, 2018-10-07: 3rd F1/10 Autonomous Racing Competition 2018 - Torino, Italy |
| 2018-05-14 | `uva-today-2018-final-exam-race` At UVA, the final exam is a race | add | youtube | YouTube `ZQg61UNbr7Q` Madhur Behl, 2018-05-13: F1/10 Undergraduate Course at The University of Virginia [Spring 2018] |
| 2018-04-11 | `cpsweek2018-porto-ctu-wins` Czech Technical University wins the second competition, in Porto | upgrade | youtube | YouTube `ZwRGtrXYgmI` Madhur Behl, 2018-04-27: 2nd F1/10 Autonomous Racing Competition 2018 - Porto, Portugal |

### 2016

| date | item | action | choice | source |
|---|---|---|---|---|
| 2016-10-02 | `esweek2016-precise-racing-wins` Penn's PRECISE Racing wins the first competition, in Pittsburgh | add | youtube | YouTube `fyFycjFaLC4` Madhur Behl, 2016-11-06: The 1st F1/10 Autonomous Racing Competition 2016 |
| 2016-03-11 | `course-2016-first-lecture` The course's first lecture goes online, March 2016 | add | youtube | YouTube `zkMelEB3-PY` xLAB for Safe Autonomous Systems, 2016-03-11: [F1/10] Lecture 1.1 : Course Overview |

## Items left without media, and why

- `roboracer-rules-repository-2025`: No photo or video exists for a repository launch. Fallback tile: the Drive poster of the first race after the repo, 'rr:/Posters 2026/Draft 1 (2).png' (26th, Techfest IIT Bombay, 4345354 bytes, 1414x2000), or a plain type tile. A GitHub social card of f1tenth/roboracer_rules is ours but reads as a screenshot; not recommended.
- `f1tenth-korea-delegation-upenn`: No video or photo of our own. The Autoware Foundation article's photo is theirs (needs permission: the cheapest ask, they are a sponsor). Fallback tile: Drive poster of the next race, 'rr:/Posters 2026/12.png' (15th, ICRA 2024 Yokohama, 4607035 bytes), or a plain type tile.

The four `poster` items also have no photo of our own: `iros2026-registration-closes-sep-5`; `iv2025-cluj-forzaeth-wins`; `cdc2024-milan-scuderia-segfault-wins`; `bu2024-lehigh-wins`. Their notes name the team or university photos that would need permission.

## For the build stage (not done here)

- `src/components/news/newsData.ts` types `embed.provider` as `"linkedin"` only. The 20 YouTube adds need a `youtube` provider; `src/components/ui/YouTubeFacade.tsx` already exists (click to load, thumbnail first) and should be reused rather than a new player.
- Thumbnails: the JSON records the i.ytimg.com URL that answers (maxresdefault where it exists, hqdefault for lE_Dk1iJHHg, YMzm2oCc_4w, zkMelEB3-PY, VlE2Wb_XhoQ). Hot-linking them or cutting local WebP posters is a build decision; a local poster keeps the page free of third-party requests until a click.
- Every photo needs a WebP cut, a manifest row in `docs/ASSET_MANIFEST.md` (source, credit, permission as recorded here) and explicit width and height. The Drive files are 2.2 to 6.6 MB, above the 2 MB intake cap of this pass, so they were checked by rclone size and PNG/EXIF headers (and a partial preview for the IROS 2026 flyer and the IV 2025 poster), not downloaded whole.
- `YouTube published` dates come from each watch page (`uploadDate`, Pacific time); yt-dlp's UTC dates differ by a day for some.

## Cedric must approve (one line each)

1. Use the organizers' newsletter photos as `own archive` for IROS 2024, CPS-IoT Week 2024 (the section was contributed by Shuyao Shi: CityU may own the photo), the spring 2024 course race, and the newsletter's "Under construction" banner for the rename item.
2. Use the Foundation's 2024 LinkedIn photo of Lukasz Sztyber for the ICRA 2024 item (he is named in the post; the card is about VAUL's win).
3. Use the IFAC 2026 host photographer's retouched photo `보정사진 (3).jpg` for `ifac2026-busan-opens`, and give the photographer's name for the credit (TODO(content)).
4. Use the IROS 2026 flyer as the registration item's tile, knowing it prints Sep 27 - Oct 1 (the IROS week), not the race days.
5. Use the 2024-dated Drive posters (IV 2025, CDC 2024, BU 2024) that carry RoboRacer branding applied in 2026 to races run as F1TENTH.
6. Use fall 2018 course gallery photos (credited to Christopher Kao) as illustrations for three non-race items: the mLab Medium blog, the 2019 NSF award, the 2018 Daily Pennsylvanian story (captioned "mid-semester race", since the place is unconfirmed).
7. Embed third-party YouTube videos (AiX, TU Wien TV, Czech Technical University, D-ITET PBL, Madhur Behl, Pusan National University, The Robotics Club, VAUL, Columbia Video Network): embedding is allowed by each video's settings (`playableInEmbed: true`), and nothing is downloaded.
8. Add a news item for the fifth Sim Racing League (ICRA 2026) to carry xCp1KB-JGZ4, and swap the sixth league's LinkedIn embed for its recap once AutoDRIVE posts it.
9. Leave `roboracer-rules-repository-2025` and `f1tenth-korea-delegation-upenn` without a picture (or with the suggested poster), or ask the Autoware Foundation for its delegation photo.
10. Lead `icra2025-atlanta-unibo-wins`, `iros2023-detroit-vaul-wins`, `columbia2019-fifth-competition`, `esweek2018-torino-calvin-wins` and `cpsweek2018-porto-ctu-wins` with their recap videos, keeping today's image as the poster.
