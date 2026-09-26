# QA: p3-news-images (photos and posters for /news), 2026-09-26

Branch `revamp/p3-news-images` (off `revamp/p3-news-media` 6bb528c), taskmap n342. Scope: the photo and poster cuts only; `public/data/news.json` is untouched (the lead merges `docs/news/MEDIA_IMAGES.json`; the video pass runs in parallel).

## What was checked

- Every source was fetched (curl with a browser UA; `rclone copy rr:"Posters 2026/<file>"` for the five Drive posters) into the git-ignored `docs/news/_intake/img/`. Byte counts match `MEDIA_PLAN.json` for all 12 planned files; dimensions checked with PIL; each one looked at in a 300 px contact sheet: every poster shows the race, dates and venue the plan names (15th ICRA 2024 Yokohama, 22nd CDC 2024 Milan, 23rd BU Nov 22 2024, 25th IV 2025 Cluj, 26th Techfest IIT Bombay).
- Output: Pillow WebP q80 method 6, 1080 wide (portrait at most 1080 tall), never upscaled. All 14 files are 23 to 193 KB (limit 200 KB, none needed a lower quality). No new binary over 1.5 MB.
- `docs/news/MEDIA_IMAGES.json` parses; every `src` exists under `public/`; recorded width and height equal the encoded file; every entry has alt text and a credit line.
- Manifest rows NEWS-11 to NEWS-24 added to `docs/ASSET_MANIFEST.md` (source URL or Drive path, credit, permission, the item served).
- No build or lint run: no source file changed (images, JSON under docs/ and the manifest only). No screenshots: nothing is wired to a page yet.

## Per item

- `iv2025-cluj-forzaeth-wins`: `/media/news/news-iv2025-poster-1080.webp`, 764x1080, 108 KB, source rr:/Posters 2026/Draft 1 (6).png; done
- `cdc2024-milan-scuderia-segfault-wins`: `/media/news/news-cdc2024-poster-1080.webp`, 764x1080, 119 KB, source rr:/Posters 2026/17.png; done
- `bu2024-lehigh-wins`: `/media/news/news-bu2024-poster-1080.webp`, 764x1080, 121 KB, source rr:/Posters 2026/18.png; done
- `f1tenth-korea-delegation-upenn`: `/media/news/news-korea-delegation-poster-1080.webp`, 764x1080, 108 KB, source rr:/Posters 2026/12.png; done (plan fallback poster)
- `roboracer-rules-repository-2025`: `/media/news/news-rules-repo-poster-1080.webp`, 764x1080, 98 KB, source rr:/Posters 2026/Draft 1 (2).png; done (plan fallback poster)
- `f1tenth-to-roboracer-announced`: `/media/news/news-roboracer-rename-1080.webp`, 1080x540, 37 KB, source https://mcusercontent.com/a91a25f4c1fbc0c9896af9a20/images/007d865c-53de-fae0-e1ad-41db078965fa.png; done
- `iros2024-abudhabi-dzik-ultimate-wins`: `/media/news/news-iros2024-abudhabi-1080.webp`, 1080x810, 167 KB, source https://mcusercontent.com/a91a25f4c1fbc0c9896af9a20/images/ab00e70a-8d47-31d4-df88-e034b33d1062.jpg; done
- `icra2024-yokohama-vaul-wins`: `/media/news/news-icra2024-yokohama-1080.webp`, 578x1080, 95 KB, source media.licdn.com (Foundation post activity-7196811928927621122); done
- `course2024-three-university-race`: `/media/news/news-course2024-race-1080.webp`, 1080x810, 193 KB, source https://mcusercontent.com/a91a25f4c1fbc0c9896af9a20/images/a66af0cf-94c0-5c02-f7fc-6a1d2ef9c80f.jpg; done
- `iros2020-virtual-hipert-wins`: `/media/news/news-iros2020-bracket-1080.webp`, 1080x1063, 23 KB, source https://f1tenth.github.io/Brackets/irosbracket.png; done
- `f1tenth-foundation-2020`: `/media/news/news-foundation2020-car-1080.webp`, 477x800, 63 KB, source https://f1tenth.github.io/landing/f110-top-transparent.png; done
- `medium-adventures-in-autonomous-vehicles`: `/media/news/news-medium2020-levine-1080.webp`, 1080x607, 41 KB, source https://f1tenth.github.io/gallery/media/large/Levine%20Track%2012-4-18%20Testing/L1100185.jpg; done
- `nsf-community-platform-award-2019`: `/media/news/news-nsf2019-final-race-1080.webp`, 1080x607, 65 KB, source https://f1tenth.github.io/gallery/media/large/Final%20Race%2012-10-18/L1100823.jpg; done
- `daily-pennsylvanian-2018-dining-hall`: `/media/news/news-dp2018-midsemester-1080.webp`, 1080x720, 47 KB, source https://f1tenth.github.io/gallery/media/large/Mid-Semester%20Race%2011-6-18/L1050744.jpg; done
- `iros2026-registration-closes-sep-5`: no file; skipped. Cedric 2026-09-26: skip the IROS 2026 flyer (prints Sep 27 - Oct 1, the IROS week, not the race days); the plan names no fallback poster. No media.
- `ifac2026-busan-opens`: no file; skipped. Cedric 2026-09-26: skip the IFAC 2026 host photo (photographer unknown, permission not asked); the plan names no fallback poster (its alternative is the host's YouTube stream vGqDLhgokSY, for the video pass). No media.
- `cpsweek2024-hongkong-fsm-speed-wins`: no file; skipped. Cedric 2026-09-26: skip the CPS-IoT Week 2024 newsletter photo (the section was contributed by CityU; the photo may be theirs); the plan names no fallback poster. No media.

## Notes for the lead

- `f1tenth-korea-delegation-upenn` and `roboracer-rules-repository-2025` take the plan's fallback posters (12.png, the 15th at ICRA 2024; Draft 1 (2).png, the 26th at Techfest). The first follows Cedric's ruling (Autoware photo skipped, use the fallback poster). The second is optional: approval item 9 allowed "without a picture (or with the suggested poster)"; drop the entry if a plain type tile is preferred. Their alt text was written from the posters, since the plan has none for them.
- `iros2020-virtual-hipert-wins`: the bracket is cropped to round 3, semifinals and final (as the plan suggests; the full 5692 px bracket is unreadable at card size) and flattened on white, since its type is black on transparent. The alt text says "final rounds".
- `f1tenth-foundation-2020`: 477x800 native (not upscaled), alpha kept; set it on a surface tone.
- `icra2024-yokohama-vaul-wins`: portrait 578x1080, uncropped (a 4:5 crop cuts either the head or the car); let the card's object-position favour the centre.
- Posters carry QR codes (15th and 22nd, top left); kept, not cropped.
- Credits use "Graphic:" for the two non-photo images (newsletter banner, bracket) rather than "Photo:"/"Poster:".
- File names use `-1080` for every file as briefed, including the 477 and 578 wide ones.
