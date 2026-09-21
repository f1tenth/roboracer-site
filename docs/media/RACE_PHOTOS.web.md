# Race photos, 2023 and earlier (A2)

One photo per `public/data/events_map.json` event up to 2023. Originals sit uncompressed in
`_harvest/pick/race/<event_id>.<ext>`; the Race page builder runs `scripts/media.sh photo`.
`none found` is a real answer: the builder renders the designed `public/logo-square.svg`
tile for those rows.

Sources checked, in order: `_harvest/drive/`, `_harvest/cedric-media/`, `_harvest/repos/`
(38 race-site repos, all present locally), the old f1tenth.org site
(`_harvest/repos/f1tenth.github.io`, including its `gallery/` folders), and the Wayback
CDX index for every archived race host.

**The finding that shapes this table.** Every race site from 2021 to 2025 is the same
Jekyll/HTML5UP template, and the only photographic images in it are shared template assets:
one studio car photo (`bg3.jpg` and its per-event copies, with the event logo burned into
the corner), `participants.jpg`, and organizer headshots. They are byte-identical across
repos, so they cannot be attributed to any single race. The Wayback CDX listing for
`germany-race2022`, `esweek2022-race`, `icra2023-race`, `iros2023-race`, `iv2023-race`,
`korea-race`, `korea-race23` and `iros2021` confirms no gallery of race-day images was ever
published on those hosts. Photos survive only for the four 2018-2019 races, which had a
`gallery/` on the old f1tenth.org site.

Status: pass 1 (2026-08-23). Open-web search was not available in this session (the search
endpoints answered 202 / empty), so `none found` here means "not in any harvested source",
not "does not exist on the internet".

| event_id | event | date | picked file | credit | source URL | notes |
|---|---|---|---|---|---|---|
| esweek2016 | ESWeek 2016, Pittsburgh | 2016-10-02/07 | none found | - | - | The first race. `f1tenth.github.io/race/esw2016/` is an empty directory and `pittsburgh2016.html` references only the track map. No gallery was ever published. |
| cpsweek2018 | CPS Week 2018, Porto | 2018-04-10/13 | `_harvest/pick/race/cpsweek2018.jpg` (2048x1365) | Photo: F1TENTH / RoboRacer organizers | https://f1tenth.github.io/gallery/porto2018/porto9.jpg | From the old f1tenth.org Porto gallery, linked off `porto2018.html`. Kept from the earlier pass. |
| esweek2018 | ESWeek 2018, Torino | 2018-09-30/10-05 | `_harvest/pick/race/esweek2018.png` (981x737) | Photo: F1TENTH / RoboRacer organizers | https://f1tenth.github.io/gallery/torino2018/torino1.png | The only Torino image on the old site; 981x737, so it is at the limit for an 800px tile. Kept from the earlier pass. |
| cpsiot2019 | CPS-IoT Week 2019, Montreal | 2019-04-15/18 | `_harvest/pick/race/cpsiot2019.jpg` (4032x3024) | Photo: F1TENTH / RoboRacer organizers | https://f1tenth.github.io/gallery/montreal2019/montreal2.jpg | From the old f1tenth.org Montreal gallery. Kept from the earlier pass. |
| columbia2019 | Columbia 2019, New York | 2019-10-13/18 | `_harvest/pick/race/columbia2019.jpg` (3227x2124) | Photo: F1TENTH / RoboRacer organizers | https://f1tenth.github.io/gallery/columbia2019/columbia5.jpg | From the old f1tenth.org Columbia gallery. Kept from the earlier pass. |
| ifac2020 | IFAC 2020, Berlin | 2020-07-15/16 | none found | - | - | Virtual race (COVID). No in-person photo exists; `ifac2020.html` carries the banner and the bracket only. |
| iros2020 | IROS 2020, Las Vegas | 2020-10-27 | none found | - | - | Virtual race. `iros2020.html` carries the schedule graphic and the bracket only. |
| icra2021-workshop | ICRA 2021 workshop, online | 2021-05-31 | none found | - | - | Online workshop; the UVA Link Lab page has speaker headshots, not a race photo. |
| iros2021 | IROS 2021, Prague | 2021-09-27/10-01 | none found | - | - | The site repo and the Wayback capture hold the template hero, the results bracket and organizer headshots only. The results page links a live-stream recording, which is the one lead worth chasing next. |
| icra2022 | ICRA 2022, Philadelphia | 2022-05-23/25 | none found | - | - | Template imagery only. |
| germany2022 | Germany 2022, Lausitzring | 2022 | none found | - | - | No repo was harvested for this host and Wayback captured no image from it. |
| esweek2022 | ESWeek 2022, Shanghai | 2022 | none found | - | - | `main_banner.jpg` is the template hero with an ESWeek logo. |
| korea2022 | Korea Championship 2022, Jeju | 2022 | none found | - | - | `korea-race` repo: template hero, sponsor logos, staff headshots, venue map. |
| cps2023 | CPS-IoT Week 2023, San Antonio | 2023-05 | none found | - | - | Template imagery only. |
| icra2023 | ICRA 2023, London | 2023-05/06 | none found | - | - | Template imagery only. |
| iv2023 | IV 2023, Anchorage | 2023-06 | none found | - | - | `images/IV2023/bg_car.jpg` is the template hero with the IV 2023 logo, not an Anchorage photo. |
| iros2023 | IROS 2023, Detroit | 2023-10 | none found | - | - | Template imagery plus organizer headshots. |
| iros2023-madgames | IROS 2023 Mad Games, Detroit | 2023-10 | none found | - | - | Workshop site: speaker headshots and posters only. |
| korea2023 | Korea Championship 2023, Yeosu | 2023 | none found | - | - | The 2nd RoboRacer Korea Championship. `korea-race23.f1tenth.org` has no image in the Wayback index. |

## Leads for the next pass (needs an open-web search tool)

1. IROS 2021 Prague: the results page links a live-stream recording; a frame from it would
   fill the row, and TU Wien published about Scuderia Segfault's win.
2. University and lab news pages are the likeliest surviving source for 2022-2023
   (Penn Engineering for ICRA 2022 Philadelphia, UNIMORE for HiPeRT, TU Wien, ETH Zurich).
3. LinkedIn posts exist for several of these races. Link only, never download (see the
   media skill's permission rules).
4. Ask Cedric whether the organizers' own phone photos for 2022-2023 exist in a Drive
   folder that is not part of the current `_harvest/drive/` mirror. That is by far the
   cheapest way to fill fifteen rows.
