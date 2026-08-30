# Race photos, 2024 and later (A1)

One photo per `public/data/events_map.json` event from 2024 onward. Originals are
uncompressed in `_harvest/pick/race/<event_id>.<ext>`; the Race page builder runs
`scripts/media.sh photo` on them. `none found` is a real answer: the builder renders the
designed `public/logo-square.svg` tile for those rows.

Search order used: `_harvest/drive/` -> `_harvest/cedric-media/` -> `_harvest/repos/`
(the race-site repos) -> `_harvest/wayback/` -> f1tenth.github.io -> open web.

Status: pass 1 (2026-08-23).

| event_id | event | date | picked file | credit | source URL | notes |
|---|---|---|---|---|---|---|
| course2024 | Spring 2024 course race, Philadelphia | 2024 (spring) | none found | - | - | No course-race photo in the Drive mirror, Cedric's folder or the org repos; the old site's course gallery is the 2018 ESE 680 set, not 2024. |
| icra2024 | ICRA 2024, Yokohama | 2024-05-13/17 | none found | - | - | `_harvest/repos/icra2024-race_website/images/bg3.jpg` is the shared template hero (the same studio car photo used on every race site, with an ICRA2024 logo burned in), not a Yokohama photo. Nothing else in the repo or the archive capture. |
| icra2024-madgames | ICRA 2024 Mad Games, Yokohama | 2024-05 | none found | - | - | `icra2024_madgames_website` holds speaker headshots and posters only. |
| cpsweek2024 | CPS-IoT Week 2024, Hong Kong | 2024-05-14/16 | none found | - | - | The three repo-unique images (`May14.jpg`, `May15.jpg`, `May16.jpg`) are schedule tables, not photos. |
| iv2024 | IV 2024, Jeju | 2024-06 | none found | - | - | Template imagery only. |
| sm2024 | IEEE SM 2024, Niagara Falls | 2024-09 | none found | - | - | `website_background.jpg` is the shared template hero. |
| itsc2024 | ITSC 2024, Edmonton | 2024-09-24/27 | none found | - | - | Template imagery only. |
| iros2024 | IROS 2024, Abu Dhabi | 2024-10-14/18 | none found | - | - | Template imagery only; the live site is gone, the map already points at a Wayback capture. |
| korea2024 | Korea Championship 2024, Jeju | 2024 | none found | - | - | `korea_race3-website` (the Jeju 2024 site) carries template imagery only. |
| bu2024 | BU 2024, Boston | 2024 | none found | - | - | Template imagery only. |
| cdc2024 | CDC 2024, Milan | 2024-12-16/19 | none found | - | - | `BG_CDC.png` is the shared template hero with a CDC logo. |
| icra2025 | ICRA 2025, Atlanta | 2025-05 | `_harvest/pick/race/icra2025.jpg` (1920x1080) | Video: The Robotics Club (YouTube @madeautonomous) | https://www.youtube.com/watch?v=wPHYLAnpMOU | Frame at 92.0 s of the "24th Race Highlights" reel in `_harvest/cedric-media/`: two cars head to head on the yellow-tube track with the hall crowd behind. The reel carries a burned-in "YouTube/@madeautonomous" watermark in the lower-left; crop it out at encode time or keep the credit visible. |
| iv2025 | IV 2025, Cluj-Napoca | 2025-06 | none found | - | - | `IV2025.png` is the conference logo. |
| techfest2025 | Techfest IIT Bombay 2025, Mumbai | 2025 | none found | - | - | No local material; Techfest's own page is the only lead. |
| iccas2025 | ICCAS 2025, Incheon | 2025-11-04 | `_harvest/pick/race/iccas2025.jpg` (4000x2252) | Photo: RoboRacer organizers (via Cedric Hollande) | `_harvest/cedric-media/The4thF1TenthCompetitionKorea.jpg` | Full-hall group shot of the 4th RoboRacer Korea competition; EXIF Galaxy, 2025-11-04, Incheon Songdo Convensia, which matches ICCAS 2025. Picked in an earlier pass, kept. |
| cdc2025 | CDC 2025, Rio de Janeiro | 2025-12 | none found | - | - | Virtual race, no in-person photo exists. |
| icra2026 | ICRA 2026, Vienna | 2026-06-01/05 | `_harvest/pick/race/icra2026.jpg` (6000x4000) | Photo: Felix Jahncke | `_harvest/drive/2026-icra/Media/Felix Jahncke/` | DSLR original from the organizer media set. Kept from the earlier pass. |
| iv2026 | IV 2026, Detroit | 2026-06-22/25 | `_harvest/pick/race/iv2026.jpg` (1600x642) | Photo: RoboRacer organizers (via Cedric Hollande) | `_harvest/cedric-media/IV_Group_Picture.jpeg` | The only IV 2026 Detroit image anywhere in the harvest: a wide group panorama on track. 1600x642, so it crops to a letterbox tile, not a 4:3 one. |
| ifac2026 | IFAC 2026, Busan | 2026-08-24/27 | none found | - | - | Race starts 2026-08-24, no photo can exist yet. |
| vtc2026 | VTC 2026 Fall, Boston | 2026-09-06/09 | none found | - | - | Upcoming. `vtc2026-race/images/bg-hero.jpg` is the template hero, not a Boston photo. |
| iros2026 | IROS 2026, Pittsburgh | 2026-09-28/30 | none found | - | - | Upcoming. |
