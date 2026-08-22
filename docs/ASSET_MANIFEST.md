# Asset Manifest — roboracer.ai revamp

Generated 2026-08-20 by the asset-harvester agent. Raw material lives in `_harvest/` (git-ignored, not committed). This file is the catalog; nothing here has been copied into `public/` or `src/` by this pass — promotion is a page-builder/human decision after review and compression.

Budgets (from `.claude/skills/roboracer-media/SKILL.md`): nothing over 1.5 MB in git; hero video under 3 MB per encode, hosted on Cloudflare; images WebP/AVIF, 1920/1200/400/320 px tiers; every `<video>` needs a poster under 150 KB.

Tools available in this environment: `ffmpeg`/`ffprobe` (with `libx264`, `libsvtav1`, `libwebp`), `curl`, `python3`. **Not available**: `gh` CLI, `cwebp`, ImageMagick (`magick`). Org-repo inspection below was done via the GitHub REST/Git-Trees API over `curl` instead of `gh clone`; image dimensions were read with `ffprobe` instead of `magick identify` (works for raster stills too).

---

## 1. Local — `public/` (already in git, current branch)

194 files, 104,767,051 bytes (~99.9 MB) total. Breakdown by extension: 75 png, 53 jpg, 44 jpeg, 8 svg, 8 json (data, not media), 1 mp4, 1 gif, 1 glb, 1 md, 1 html, 1 CNAME.

**14 files exceed the 1.5 MB git budget today** — these are already committed and are the most urgent cleanup targets:

| id | file | type | WxH | size | what it shows | provenance | permission | candidate use | notes |
|---|---|---|---|---|---|---|---|---|---|
| L-01 | `public/crew/YashPant.jpg` | jpg | 3838x3626 | 14,501,068 B (13.8 MB) | crew headshot | site-owner (old f1tenth.org crew photo) | granted (own team member) | about/team | needs 400x400 WebP crop, ~35x over budget |
| L-02 | `public/landing/f110_fpv.mp4` | mp4 | 1280x720, 41.3 s | 13,222,373 B (12.6 MB) | old FPV racecar hero clip (predecessor of `_harvest/hero/roboracer_fpv.mp4`) | site-owner | granted | hero (legacy) | superseded by new hero encodes in §Hero task below; move off git to Cloudflare or delete |
| L-03 | `public/crew/pablo.png` | png | 2084x2085 | 7,413,737 B | crew headshot | site-owner | granted | about/team | PNG of a photo — re-export as JPG/WebP first |
| L-04 | `public/crew/achin.jpg` | jpg | 4000x4000 | 6,093,264 B | crew headshot | site-owner | granted | about/team | needs 400x400 crop |
| L-05 | `public/landing/hero-bg.jpg` | jpg | 4032x3024 | 4,508,005 B | landing hero background still | site-owner | granted | hero | resize to 1920 long edge |
| L-06 | `public/crew/susan.png` | png | 1488x1486 | 3,921,237 B | crew headshot | site-owner | granted | about/team | PNG of a photo |
| L-07 | `public/logos/Logo_Gradient.gif` | gif | 1920x842 | 3,910,117 B | animated gradient wordmark | site-owner | granted | brand/nav | convert to short MP4/WebM loop or static WebP + CSS animation |
| L-08 | `public/crew/kuk.jpg` | jpg | 2412x2412 | 3,477,113 B | crew headshot | site-owner | granted | about/team | |
| L-09 | `public/crew/billy.png` | png | 2084x2085 | 2,985,691 B | crew headshot | site-owner | granted | about/team | |
| L-10 | `public/crew/Nagarakshith_Makam_Sreenivasulu.jpg` | jpg | 4016x3971 | 2,919,664 B | crew headshot | site-owner | granted | about/team | |
| L-11 | `public/models/anim_2.glb` | glb | — | 2,632,508 B | 3D animation model (legacy, unclear referencer) | site-owner | granted | — | **deletion candidate** — flagged by skill memory as unused; confirm no reference then delete |
| L-12 | `public/crew/Roshan_Benefo.jpeg` | jpeg | 2327x2370 | 2,235,735 B | crew headshot | site-owner | granted | about/team | |
| L-13 | `public/about/image-2.JPG` | jpg | 6000x4000 | 1,675,116 B | about-page team/venue photo | site-owner | granted | about | |
| L-14 | `public/crew/Raymond_Bjorkman.jpg` | jpg | 1536x1540 | 1,646,912 B | crew headshot | site-owner | granted | about/team | |

Just under budget but still oversized for their use (headshots should be ≤400x400 WebP, ~20-60 KB): `public/crew/Brandon_McBride.jpg` (3024x3062, 1,530,357 B), `public/about/image-3.JPG` (6000x4000, 1,467,000 B), `public/crew/thejas.JPG` (1632x1632, 1,503,959 B), `public/partners/duke.png` (3208x1700, 1,045,197 B).

**Other local categories** (not individually itemized — full listing in `_harvest/` working notes if needed):

| category | dir | count | total size | notes |
|---|---|---|---|---|
| crew headshots | `public/crew/` | 76 | ~63 MB | raw phone/DSLR photos, no resizing pipeline applied yet; single biggest cleanup opportunity |
| partner/sponsor logos | `public/partners/` | 67 | ~9 MB | all raster PNG/JPG, **zero SVGs** — see §Logos |
| brand logos | `public/logos/` | 7 | ~4.3 MB | see §Logos |
| about-page photos | `public/about/` | 3 | 3.7 MB | `image-2.JPG`, `image-3.JPG` over/near budget; `upenn-ppl-min.jpg` (582,675 B) already compressed |
| testimonial headshots | `public/testimonials/` | 22 | ~1.6 MB | all reasonably sized already (12-148 KB each) |
| events | `public/events/` | 1 | 132,218 B | only a generic `placeholder.png` — **gap**, no real event photography in repo |
| buttons/icons | `public/buttons/` | 1 | 316 B | `three-lines.svg` (hamburger icon) |
| 3D models (current branch) | `public/models/` | 1 | 2,632,508 B | `anim_2.glb` only — racecar meshes are on `feat/assembly-viewer`, see Task B below |
| data (JSON, not media) | `public/data/` | 8 | ~68 KB | content, out of scope for this manifest |

---

## 2. `_harvest/` (git-ignored, this session)

| id | file | type | WxH | size | what it shows | provenance | permission | candidate use | notes |
|---|---|---|---|---|---|---|---|---|---|
| H-01 | `_harvest/hero/roboracer_fpv.mp4` | mp4 (h264+aac) | 1280x720, 38.0 s | 8,174,230 B | FPV lap of a racecar around an orange-barrier indoor track (garage/expo hall), organizer footage, people visible in some frames | organizer (Cedric's IROS2026 working dir); byte-identical file also served live at `iros2026-race.roboracer.ai/images/Roboracer/roboracer_fpv.mp4` | granted (own footage) | hero | source for encodes below |
| H-02 | `_harvest/hero/derived/hero-fpv-loop-1920.mp4` | mp4 (h264) | 1920x1080, 12.07 s | 3,086,381 B (2.94 MB) | 12 s loop (t=16-28s of source), crf 34 | derived from H-01 | granted | hero | **under 3 MB budget**; intended path `https://media.roboracer.ai/hero/hero-fpv-loop-1920.mp4` |
| H-03 | `_harvest/hero/derived/hero-fpv-loop-960.mp4` | mp4 (h264) | 960x540, 12.07 s | 2,342,992 B (2.23 MB) | same loop, mobile width, crf 26 | derived from H-01 | granted | hero (mobile) | under budget; intended path `https://media.roboracer.ai/hero/hero-fpv-loop-960.mp4` |
| H-04 | `_harvest/hero/derived/hero-fpv-loop-1920.webm` | webm (AV1/libsvtav1) | 1920x1080, 12.08 s | 2,770,280 B (2.64 MB) | same loop, AV1, crf 44 preset 8 | derived from H-01 | granted | hero (first `<source>`) | under budget; intended path `https://media.roboracer.ai/hero/hero-fpv-loop-1920.webm` |
| H-05 | `_harvest/hero/derived/hero-fpv-loop-poster.webp` | webp | 1920x1080 | 51,456 B | still frame at t=1.5 s into the loop (car + barrier in motion) | derived from H-02 | granted | hero poster | **well under 150 KB budget**; small enough to go in git — ready for a human/page-builder to copy to `public/media/hero/hero-fpv-poster.webp` (not done by this agent, see house rule) |
| H-06 | `_harvest/wayback/race-20240109144455.html` | html | — | 19,337 B | archived `f1tenth.org/race.html`, 2024-01-09 snapshot | Wayback Machine, timestamp 20240109144455 | n/a (archival page, not media) | reference | image URLs extracted below |
| H-07 | `_harvest/wayback/about-20240109144454.html` | html | — | 67,194 B | archived `f1tenth.org/about.html`, 2024-01-09 snapshot | Wayback Machine, timestamp 20240109144454 | n/a | reference | image URLs extracted below |
| H-08 | `_harvest/wayback/racesites/iros2026-race_roboracer_ai.html` | html | — | 12,629 B | live IROS 2026 race site HTML | race-site | n/a | reference | |
| H-09 | `_harvest/wayback/racesites/icra2026-race_roboracer_ai.html` | html | — | 17,808 B | live ICRA 2026 race site HTML | race-site | n/a | reference | |
| H-10 | `_harvest/wayback/racesites/iv2026-race_roboracer_ai.html` | html | — | 9,964 B | live IV 2026 race site HTML | race-site | n/a | reference | |

`_harvest/drive/` does **not exist** in this environment — Google Drive sync folders (Logo, Posters 2026, Old Banners, 2026 ICRA/Media, Logos) were not inventoried. Dead end this pass; re-run step 3 once Cedric syncs the folder locally.

---

## 3. f1tenth GitHub org repos (via GitHub REST API, no `gh` CLI available)

`gh` is not installed in this environment; repo inspection was done with `curl` against `api.github.com` (repo list + recursive git-trees), which is equivalent for cataloging purposes but did not clone working copies into `_harvest/repos/`. 51 repos in the org; only three carry meaningful media, and none matched the "site/web/race/.github.io" naming pattern the harvest script targets (that pattern only matches this `roboracer-site` repo itself).

| id | repo | count | total size | what it shows | provenance | permission | candidate use | notes |
|---|---|---|---|---|---|---|---|---|
| G-01 | `f1tenth/f1tenth_media` | 4 files | 816,531 B | `ifac2020-schedule.png` (346,748 B), `ifac2020-schedule-cet.png` (340,790 B), `berlinbanner.png` (94,987 B), `iros2020.png` (34,006 B) — old event banners/schedules | org repo, dedicated "for public media" | granted (org asset) | news/archive | small, stale (2020), low value for 2026 revamp |
| G-02 | `f1tenth/f1tenth_doc` | 291 blobs, 218 image-like | not summed (many files) | car-build step photos/GIFs (`img/buildCar.gif` 3.83 MB, Jetson setup, VESC wiring, chassis assembly) | org repo (course/build documentation) | granted (org asset) | build/course chapter | several GIFs and JPGs individually over 1.5 MB budget; would need MP4 conversion and resize before use |
| G-03 | `f1tenth/f1tenth_coursekit` | 130 blobs, 32 image-like | not summed | course lecture GIFs, race clips (`assignments/races/img/race01-04.gif`, up to 4.37 MB), syllabus graphic | org repo (course materials) | granted (org asset) | course chapter, race gallery | race GIFs (`race01.gif` 2.04 MB, `race02.gif` 3.89 MB, `race03.gif` 1.06 MB, `race04.gif` 0.50 MB) are actual race footage — convert to MP4 loops, strong race-page candidates |

Other repos checked and found to have **no media**: `roboracer_rules` (2 blobs, docs only). Remaining 47 repos are code-only (drivers, planners, simulators, lab templates) — not inspected individually for media, low expected yield given naming/description.

---

## 4. Wayback Machine — f1tenth.org, 2024-01-09 snapshot

Image `src` URLs extracted from the archived HTML (H-06, H-07). Cross-checked against `public/`: **the crew and partner sets already in `public/crew/` and `public/partners/` match this snapshot 1:1** — the current repo already carries the same files the 2024 site served, so Wayback did not surface new headshots or logos. It did surface a handful of **race-page banner images not currently in `public/`**:

| id | file/URL | type | provenance | permission | candidate use | notes |
|---|---|---|---|---|---|---|
| W-01 | `f1tenth.org/race/5thF1Ann-small.png` | png | Wayback, 20240109144455 | granted (org asset) | race/news archive | 5th anniversary banner |
| W-02 | `f1tenth.org/race/10 10 times.png` | png | Wayback, 20240109144455 | granted | race/news archive | |
| W-03 | `f1tenth.org/race/cps2023_darktext.png` | png | Wayback, 20240109144455 | granted | race archive | CPS 2023 event banner |
| W-04 | `f1tenth.org/race/GermanRace2022.png` | png | Wayback, 20240109144455 | granted | race archive | |
| W-05 | `f1tenth.org/race/icra2022.png`, `icra2022_workshop.png`, `icra2023.jpg` | png/jpg | Wayback, 20240109144455 | granted | race archive | |
| W-06 | `f1tenth.org/race/iros2020.png`, `iros2021.png` | png | Wayback, 20240109144455 | granted | race archive | |
| W-07 | `f1tenth.org/race/IROS-LOGO.svg` | **svg** | Wayback, 20240109144455 | granted | partner/event logo | one of the only SVGs found anywhere in this harvest |
| W-08 | `f1tenth.org/race/korea_2.png`, `korea-race.png` | png | Wayback, 20240109144455 | granted | race archive | |
| W-09 | `f1tenth.org/race/irs-workshop.png`, `esw2018-Italy.png`, `CPSW2018-Porto.png`, `CPS&IoTW2019-Montreal.png` | png | Wayback, 20240109144455 | granted | race archive | oldest event banners, historical value only |

Byte sizes were not fetched individually for W-01…W-09 (HTML reference only, per task scope of "record snapshot timestamp per file"); download and re-measure before use.

---

## 5. Race sites (`public/data/past_races.json` + `upcoming_events.json`, 2026 events)

URLs recorded only; nothing downloaded over 5 MB (one asset — R-06 — exceeds that and was explicitly *not* downloaded, HEAD-checked only).

| id | file/URL | type | size (HEAD) | what it shows | provenance | permission | candidate use | notes |
|---|---|---|---|---|---|---|---|---|
| R-01 | `iros2026-race.roboracer.ai/images/IROS.png` | png | 21,438 B | IROS 2026 event logo | race-site | granted (own event site) | race page | |
| R-02 | `iros2026-race.roboracer.ai/images/Roboracer/roboracer_fpv.mp4` | mp4 | 8,174,230 B | **byte-identical to H-01** — confirms hero source is the live race-site video | race-site | granted | hero | already harvested as H-01, no need to re-download |
| R-03 | `iros2026-race.roboracer.ai/images/organizer/*.jpg/.jpeg` | jpg | not measured individually | 9 organizer headshots (Ahmad, Amr El-Wakeel, Cedric, Chinmay Samak, John Dolan, Mohamed, Rahul, Tanmay Samak, Venkat, Wenshan Wang) | race-site | granted (organizers, own site) | about/race organizers | |
| R-04 | `icra2026-race.roboracer.ai/images/ICRA2026.png` | png | 12,986 B | ICRA 2026 event logo | race-site | granted | race page | |
| R-05 | `icra2026-race.roboracer.ai/images/sponsors/*.png` | png | FFG 7,665 B; Magna 43,625 B; TU Wien 68,569 B; also HTU, Knapp, BMIMI, Qualisys (not measured) | Austrian/German ICRA 2026 sponsor logos (FFG, Magna, TU Wien, HTU, Knapp, BMIMI, Qualisys) | race-site | granted (sponsors of an org-run event) | partner/sponsor | new sponsor set not yet in `public/partners/` |
| R-06 | `icra2026-race.roboracer.ai/images/Roboracer/roboracer_video.gif` | gif | **21,480,151 B (20.5 MB)** | animated hero GIF, same footage as roboracer_fpv.mp4 | race-site | granted | — | **not downloaded** (>5 MB limit); also a textbook GIF→MP4 conversion candidate per the skill, already superseded by H-02/H-03/H-04 |
| R-07 | `iv2026-race.roboracer.ai/images/IV2026.png` | png | not measured | IV 2026 event logo | race-site | granted | race page | |
| R-08 | `iv2026-race.roboracer.ai/images/organizer/*.jpg/.jpeg/.png` | jpg/png | not measured | 7 organizer headshots (overlaps with R-03; adds Amr El-Wakeel new photo, Mohamed Elgouhary) | race-site | granted | about/race organizers | |
| R-09 | `iv2026-race.roboracer.ai/images/Roboracer/roboracer_video.gif` | gif | not measured (same file as R-06 by name) | same hero GIF reused across all three 2026 race sites | race-site | granted | — | confirms the org has no other hero video yet — reinforces the need for H-02/03/04 |

---

## 6. Community media (LinkedIn) — permission not yet requested

Per `.claude/skills/roboracer-media/SKILL.md`, this agent does **not** scrape LinkedIn. The following are tracking rows only, sourced from the post-author list in the skill file (from Rahul, 2026-08-16). No files exist in `_harvest/community/` yet.

| id | file/URL | type | what it shows | provenance | permission | candidate use | notes |
|---|---|---|---|---|---|---|---|
| C-01 | LinkedIn post — Amr El-Wakeel (3rd place) | photo/video (unknown) | race result content | community/LinkedIn | **not-asked** | race/news | |
| C-02 | LinkedIn post — Milan Manoj | unknown | — | community/LinkedIn | **not-asked** | race/news | |
| C-03 | LinkedIn post — Seif Eldaby (Assiut Motorsport) | unknown | — | community/LinkedIn | **not-asked** | race/news | |
| C-04 | LinkedIn post — William Hecoin (IEEE IV 2026, Autoware) | unknown | — | community/LinkedIn | **not-asked** | race/news | |
| C-05 | LinkedIn post — Jooncheol Park (TU Wien) | unknown | — | community/LinkedIn | **not-asked** | race/news | |
| C-06 | LinkedIn post — Mattia Dal Bo | unknown | — | community/LinkedIn | **not-asked** | race/news | |
| C-07 | LinkedIn post — Cedric Hollande (ICRA/IV 2026) | unknown | — | community/LinkedIn | **not-asked** | race/news | owner is Cedric himself — fastest permission to close |
| C-08 | LinkedIn post — Elias Eckermann | unknown | — | community/LinkedIn | **not-asked** | race/news | |
| C-09 | LinkedIn post — Luis Denninger (Team Unicorn) | unknown | — | community/LinkedIn | **not-asked** | race/news | |
| C-10 | LinkedIn post — Nayeem Islam Shanto | unknown | — | community/LinkedIn | **not-asked** | race/news | |
| C-11 | LinkedIn post — F. Pomerleau | unknown | — | community/LinkedIn | **not-asked** | race/news | |
| C-12 | LinkedIn post — Megha J. Kabra | unknown | — | community/LinkedIn | **not-asked** | race/news | |
| C-13 | LinkedIn post — Maninder Kaur | unknown | — | community/LinkedIn | **not-asked** | race/news | |
| C-14 | LinkedIn activity URL #1 (author unnamed) | unknown | — | community/LinkedIn | **not-asked** | race/news | full URL in Slack #general, 2026-08-16 thread |
| C-15 | LinkedIn activity URL #2 (author unnamed) | unknown | — | community/LinkedIn | **not-asked** | race/news | ditto |
| C-16 | LinkedIn activity URL #3 (author unnamed) | unknown | — | community/LinkedIn | **not-asked** | race/news | ditto |

Use the outreach template at `.claude/skills/roboracer-media/templates/permission-request.md`. Do not use any of C-01…C-16 until status moves to `granted <date, by whom, scope>`.

---

## Task A — Hero video encode (detail)

**Superseded 2026-08-21 (this section kept for the crf tuning history below).** Final hero is encoded from the better master `/home/cedric/Downloads/FPV_IV.mp4` (1280x720, 30 fps, 52.3 s, 3.5 Mbps), loop cut 3s-36s per Cedric, via `scripts/media.sh video ... --start 3 --dur 33`. Committed to `public/media/hero/` under the CLAUDE.md rule-3 exception (no Cloudflare):

| file | size | encode |
|---|---|---|
| `hero-fpv-loop-1920.mp4` | 2,657,578 B | H.264 crf 48 (budget-fit sweep from 40), lanczos upscale of the 720p master |
| `hero-fpv-loop-960.mp4` | 2,867,927 B | H.264 crf 34 (sweep from 30) |
| `hero-fpv-poster.webp` | 58,842 B | frame at t=5s (brightest sightline) |
| AV1/WebM | dropped | at this grain it was larger than the H.264 at worse quality (2.96 MB at crf 58) |

Gap: the master is 720p - ask the videographer for a higher-resolution original; re-encode is one command.

<details><summary>2026-08-20 encode of the older roboracer_fpv.mp4 (superseded)</summary>


**Input**: `_harvest/hero/roboracer_fpv.mp4` — h264/aac, 1280x720, 30000/1001 fps, 38.005 s, video bitrate ≈1.62 Mbps, 8,174,230 B.

**Loop selection**: sampled frames at 2, 6, 10, 14, 18, 22, 26, 30, 34 s. Frames 22-34 s show clean, fast FPV motion past the orange track barrier with no faces filling the frame (frames around 6-18 s have organizers standing in the background, still usable but busier). Selected **16-28 s (12 s)** as the loop window — car in motion the whole time, loops reasonably cleanly.

Commands actually run (from `_harvest/hero/roboracer_fpv.mp4`, working dir = repo root):

```bash
ffmpeg -y -ss 16 -t 12 -i _harvest/hero/roboracer_fpv.mp4 -c copy _harvest/hero/derived/cut.mp4

# 1920 H.264 — crf raised from the skill's default 24 to 34: at crf 24 the upscaled
# (source is native 720p) 1920-wide encode came out 11.5 MB, far over the 3 MB budget.
# crf 34 was the lowest (best-quality) value that still cleared the budget on this clip.
ffmpeg -y -i _harvest/hero/derived/cut.mp4 -an -vf "scale=1920:-2:flags=lanczos,fps=30" \
  -c:v libx264 -preset slow -crf 34 -pix_fmt yuv420p -movflags +faststart \
  _harvest/hero/derived/hero-fpv-loop-1920.mp4

# 960 H.264 — skill's default crf 26 fit the budget directly, no adjustment needed
ffmpeg -y -i _harvest/hero/derived/cut.mp4 -an -vf "scale=960:-2:flags=lanczos,fps=30" \
  -c:v libx264 -preset slow -crf 26 -pix_fmt yuv420p -movflags +faststart \
  _harvest/hero/derived/hero-fpv-loop-960.mp4

# 1920 AV1/WebM — skill's crf 34 example gave 4.7 MB (larger than the mp4, AV1 psnr-tune
# struggles on this grainy/motion-blurred footage); crf 44 preset 8 fit the budget
ffmpeg -y -i _harvest/hero/derived/cut.mp4 -an -vf "scale=1920:-2" \
  -c:v libsvtav1 -crf 44 -preset 8 _harvest/hero/derived/hero-fpv-loop-1920.webm

# poster at 1.5 s into the loop
ffmpeg -ss 1.5 -i _harvest/hero/derived/hero-fpv-loop-1920.mp4 -frames:v 1 -q:v 2 \
  _harvest/hero/derived/poster.jpg
# cwebp not installed in this environment; used ffmpeg's libwebp encoder instead
ffmpeg -y -i _harvest/hero/derived/poster.jpg -vf "scale=1920:-2" -q:v 80 -compression_level 6 \
  _harvest/hero/derived/hero-fpv-loop-poster.webp
```

**Outputs** (all in `_harvest/hero/derived/`, git-ignored, not in `public/`):

| file | resolution | duration | size | vs. 3 MB budget |
|---|---|---|---|---|
| `hero-fpv-loop-1920.mp4` | 1920x1080 | 12.07 s | 3,086,381 B (2.94 MB) | **under** (98% of budget) |
| `hero-fpv-loop-960.mp4` | 960x540 | 12.07 s | 2,342,992 B (2.23 MB) | **under** |
| `hero-fpv-loop-1920.webm` (AV1) | 1920x1080 | 12.08 s | 2,770,280 B (2.64 MB) | **under** |
| `hero-fpv-loop-poster.webp` | 1920x1080 | — | 51,456 B | **under** the 150 KB poster budget |

Note on quality: the source is native 720p, so the 1920-wide encodes are an upscale, not added resolution — at the skill's default crf 24 the upscale alone produces an 11.5 MB file (crf 28 → 7.6 MB, crf 32 → 5.2 MB, crf 36 → 3.7 MB), all over budget at the original 18 s cut. Shortening the loop to 12 s bought back enough headroom to use crf 34 instead of a more aggressive crf ~40, which is the better quality/size tradeoff. Flag for Cedric: consider asking whoever shot this footage for a higher-resolution source if one exists, since a true 1080p+ source would make the budget much easier to hit at good quality.

**Intended Cloudflare paths** (not yet uploaded — Ahmad or Rahul hold account access per the skill):
- `https://media.roboracer.ai/hero/hero-fpv-loop-1920.mp4`
- `https://media.roboracer.ai/hero/hero-fpv-loop-960.mp4`
- `https://media.roboracer.ai/hero/hero-fpv-loop-1920.webm`

Only the poster (`hero-fpv-loop-poster.webp`, 51,456 B) is small enough and appropriate to eventually land in git at `public/media/hero/hero-fpv-poster.webp` — that copy was **not** performed by this agent (writing to `public/` is out of scope for asset-harvester; a human or the page-builder does the promotion).

---


</details>

## Task B — Racecar meshes on `feat/assembly-viewer` (not on this branch)

Read via `git ls-tree -r --long feat/assembly-viewer -- public/models/racecar` (working tree untouched, no checkout performed):

```
100644 blob 4c5a5792e2473fe9dff680873350c5ada9705d5f  155,684  public/models/racecar/roboracer_accent.stl
100644 blob 255089d6c47ec0e1cfa28bd19088d7b60e8f2d31  706,284  public/models/racecar/roboracer_chassis.glb
100644 blob cdbd8c70a3a0ae00dd41df23cbb0dc6b9ecd4b7c   39,696  public/models/racecar/roboracer_lidar.glb
100644 blob 0cd64202057b224cea1e00c23051d3010b50c707  331,220  public/models/racecar/roboracer_wheel_front_left.glb
100644 blob f61792a255e9b82a2d20067b97257bd326919ef7  314,576  public/models/racecar/roboracer_wheel_front_right.glb
100644 blob 123ef9edc94f0659b3f611fe940951b87f716380  331,364  public/models/racecar/roboracer_wheel_rear_left.glb
100644 blob 870ba2c9c6e002adbd7aca8bb71b283d9dddc979  314,672  public/models/racecar/roboracer_wheel_rear_right.glb
```

| file | format | size | notes |
|---|---|---|---|
| `roboracer_accent.stl` | STL | 155,684 B | only non-GLB mesh; STL carries no material/texture data, just geometry |
| `roboracer_chassis.glb` | GLB | 706,284 B | largest file, still under the 1.5 MB budget individually |
| `roboracer_lidar.glb` | GLB | 39,696 B | smallest |
| `roboracer_wheel_front_left.glb` | GLB | 331,220 B | |
| `roboracer_wheel_front_right.glb` | GLB | 314,576 B | |
| `roboracer_wheel_rear_left.glb` | GLB | 331,364 B | |
| `roboracer_wheel_rear_right.glb` | GLB | 314,672 B | |

**Total payload: 2,193,496 B (2.09 MB) across 7 files.** No single file exceeds the 1.5 MB per-file budget, so nothing here is individually flagged — but the combined 2.09 MB, loaded together for one assembled view, is worth Draco/meshopt treatment before `/assembly` ships, per the skill's own note ("run `scripts/media.sh report public/models` before committing").

**Compression estimate**: these are small CAD-derived meshes (racecar body panels + 4 wheels + LiDAR housing), not texture-heavy — geometry is the dominant payload. Draco geometry compression on GLB typically yields 60-90% reduction on this kind of low-texture mechanical mesh; meshopt (`gltf-transform optimize --compress draco`) is the tool named in the skill's own memory note. A conservative estimate: **2.09 MB -> roughly 0.4-0.8 MB** combined after Draco, well inside a single 1.5 MB budget even loaded all at once. The STL has no compressed-GLB equivalent as-is; converting it to GLB first (it's just the accent trim geometry) would let Draco apply to all 7 files uniformly. This estimate was not verified with an actual `gltf-transform` run — `npx gltf-transform` was not executed in this pass (out of scope: this task was read-only sizing, not a compression pass) — flag for whoever picks up `feat/assembly-viewer` next.

**`public/models/anim_2.glb`** — confirmed on the **current branch** (`infra/claude-harness`) at HEAD, 2,632,508 B, tracked since commit `353ebc8`. This is already in git and **already over the 1.5 MB budget** (1.67x). Per skill memory, this is a stale/unused animation asset superseded by the assembly viewer — deletion candidate once nothing in `src/` still references it (not verified in this pass; a repo grep for `anim_2` is needed before deleting).

---

## Top 20 candidates (landing + race pages)

1. **H-02/H-03/H-04** — new hero FPV loop (1920 mp4, 960 mp4, AV1 webm), all under budget — landing hero, replaces both `public/landing/f110_fpv.mp4` (L-02, over budget, in git) and the race-sites' 20 MB GIF (R-06/R-09)
2. **H-05** — hero poster WebP, 51 KB, ready to promote to `public/media/hero/hero-fpv-poster.webp`
3. **G-03 race GIFs** (`race01-04.gif` from `f1tenth_coursekit`) — real race footage, convert to MP4 loops for a race-page gallery
4. **R-03/R-08** — organizer headshots from the three live 2026 race sites (Cedric, Ahmad, Rahul, Chinmay/Tanmay Samak, Venkat, John Dolan, Amr El-Wakeel, Mohamed, Wenshan Wang) — about/race organizer grid, already granted
5. **R-05** — ICRA 2026 sponsor logo set (FFG, Magna, TU Wien, HTU, Knapp, BMIMI, Qualisys) — new sponsor row not yet on the site
6. **W-07** — `IROS-LOGO.svg`, one of the only vector logos found in this whole harvest — reuse instead of rasterizing
7. **W-01…W-09** — historical race-event banners (2018-2023) for a news/archive timeline chapter
8. **L-05** `hero-bg.jpg` (after resize) — fallback poster/backup hero still if video is disabled
9. **G-02** `f1tenth_doc` build-step photos — strong candidate for the `/build` chapter once resized
10. **L-01, L-03, L-04, L-06, L-08, L-09, L-10, L-12, L-14** — the 9 oversized crew headshots, first batch for a resize pass (about/team)
11. **public/partners/** (67 files) — entire set, once converted to consistent WebP/SVG, for the partner marquee
12. **R-04, R-01, R-07** — three 2026 event logos (ICRA2026.png, IROS.png, IV2026.png) for the race page event switcher
13. Remaining `public/testimonials/` (22 files, already reasonably sized) — testimonial carousel, low effort
14. **C-01…C-16** — once permission is granted, LinkedIn race-day photos/videos are the best source of *current* (2026) competition action shots — highest potential value, zero usable rows today

---

## Gaps

- **No 2026 team/podium photography exists anywhere in this harvest.** `public/events/` has only a placeholder; the three live 2026 race sites have no gallery, only organizer headshots and the one reused hero GIF; Wayback and org repos are all pre-2024. This is the single biggest hole for the race page.
- **No short (10-20 s) hero loop existed before this session.** Filled by H-02/H-03/H-04, but they're an upscale of a 720p source — ask whoever shot `roboracer_fpv.mp4` for a higher-resolution original if one exists.
- **No podium/awards-ceremony shot** (IROS-style stage photo) for the race page — not found in any of the five sources.
- **No 2026 team group photo.** Crew photos in `public/crew/` are individual headshots, several years old judging by the identical set appearing in the 2024-01-09 Wayback snapshot.
- **Zero SVG partner/sponsor logos.** All 67 files in `public/partners/` are raster (PNG/JPG); only two SVG logos surfaced in the *entire* harvest (`IROS-LOGO.svg` on Wayback, plus the existing `public/logos/*.svg` brand marks). Every partner logo is a rasterization candidate for replacement.
- **`_harvest/drive/` was never populated in this environment** — Cedric's Drive sync folders (Logo, Posters 2026, Old Banners, 2026 ICRA/Media, Logos) were not inventoried; likely the richest source for 2026-specific material and worth a follow-up pass once synced locally.
- **No community/LinkedIn media is usable yet** — 16 tracked rows, all `permission: not-asked`. This is probably the fastest path to real 2026 race photos; C-07 (Cedric's own post) is the lowest-friction one to clear first.
- **Race GIFs across all three 2026 race sites (`roboracer_video.gif`, R-06/R-09, 20.5 MB) are the *only* motion asset currently live on those sites** — worth telling Ahmad/Rahul the new H-02/H-03/H-04 encodes exist so the race sites themselves can swap to them, independent of the roboracer.ai revamp.

---

## Logos

| id | file/URL | background | format | size | source | flag |
|---|---|---|---|---|---|---|
| LG-01 | `public/logos/logo-black-gradient.png` | dark | raster PNG | 202,810 B | site-owner | rasterized — has an SVG sibling (LG-04) covering a similar mark, prefer that |
| LG-02 | `public/logos/Logo_Gradient.gif` | any (animated) | raster GIF | 3,910,117 B | site-owner | **rasterized + oversized**, over budget by 2.6x; convert to short MP4/WebM loop or a static WebP + CSS gradient animation |
| LG-03 | `public/logos/logo square with text.png` | light | raster PNG | 141,760 B | site-owner | rasterized, no SVG equivalent found — candidate for vectorization |
| LG-04 | `public/logos/logo-white-gradient.svg` | dark | **SVG** | 4,442 B | site-owner | good — vector, small |
| LG-05 | `public/logos/logo-white.svg` | dark | **SVG** | 4,184 B | site-owner | good |
| LG-06 | `public/logos/logo-white-vector-animated.svg` | dark | **SVG** (animated) | 61,014 B | site-owner | good, already vector+animated — check `prefers-reduced-motion` handling in the SVG itself |
| LG-07 | `public/logos/slack-logo.svg` | any | **SVG** | 1,019 B | third-party (Slack brand mark) | fine — standard brand icon usage |
| LG-08 | `public/logo-square.svg` (repo root of `public/`) | any | **SVG** | not measured | site-owner | good, vector |
| LG-09 | `public/partners/*.png` / `*.jpg` (67 files) | mostly light/white | raster PNG/JPG | ~9 MB combined | site-owner (old f1tenth.org partner set) | **all 67 rasterized**, zero SVGs — biggest logo-quality gap on the whole site; most have no transparent background (flat white square behind the mark going by file sizes/formats — JPGs like `autoware.jpg`, `cmu.jpg`, `halmstad.jpg`, `monterrey.jpg`, `polytechparis.jpg`, `unimore.jpg` cannot have transparency at all) |
| LG-10 | `R-05` ICRA 2026 sponsor logos (FFG, Magna, TU Wien, HTU, Knapp, BMIMI, Qualisys) | unknown (not fetched, HEAD-only) | raster PNG | 7.7-68.6 KB each | race-site | rasterized, new set not yet in `public/partners/` |
| LG-11 | `W-07` `f1tenth.org/race/IROS-LOGO.svg` | unknown | **SVG** | not measured | Wayback, 20240109144455 | good — one of the only vector event logos found; pull this instead of rasterizing IROS branding again |

**Recommendation for the revamp**: standardize on SVG for every partner/sponsor logo (320 px tier per the skill). Given 65 of 67 current partner logos are raster with no SVG source in any harvested location, most will need either (a) requesting official SVG marks from each partner/university's brand page, or (b) a one-time vectorization/redraw pass. This is a larger, separate effort from asset harvesting — flagging for Cedric/Ayagoz to scope.

---

## Landing v3 produced media (media-curator, 2026-08-21)

All sources are organizer media (Drive mirror `_harvest/drive/2026-icra/Media`, org repos, Cedric's own video): permission = granted (organizer media). Budgets checked with `scripts/media.sh report public/media` (nothing over 1.5 MB). Selection reasoning in `docs/media/SELECTION.md`, source inventory in `docs/media/INVENTORY.md`.

| id | file | type | WxH | size | what it shows | provenance (source, in/out) | credit | permission | use |
|---|---|---|---|---|---|---|---|---|---|
| V3-01 | `public/media/highlights/highlight-icra2026-headtohead-01-960.mp4` + `-poster.webp` | mp4 h264 30p / webp | 960x540 | 791 KB / 47 KB | two cars ("tu", "aido") down the KNAPP straight | Drive `Chinmay-Tanmay/Classic Cup/IMG_0917.MOV` 73.0-78.0 s | Video: Chinmay and Tanmay Samak | granted (organizer media) | highlights row 1 |
| V3-02 | `public/media/highlights/highlight-icra2026-overtake-01-960.mp4` + poster | mp4 / webp | 960x540 | 790 KB / 72 KB | two cars nose to tail | `Classic Cup/IMG_0912.MOV` 2.5-7.5 s | Video: Chinmay and Tanmay Samak | granted | highlights row 1 |
| V3-03 | `public/media/highlights/highlight-icra2026-start-01-960.mp4` + poster | mp4 / webp | 960x540 | 368 KB / 75 KB | two cars launch toward the camera | `Master Cup/IMG_1062.MOV` 0-3.9 s | Video: Chinmay and Tanmay Samak | granted | highlights row 1 |
| V3-04 | `public/media/highlights/highlight-icra2026-grid-01-960.mp4` + poster | mp4 / webp | 960x540 | 346 KB / 34 KB | two cars on the RoboRacer grid, launch | `Felix Jahncke/P1023022.MP4` 19-25 s, portrait source center-cropped 1080x608 | Video: Felix Jahncke | granted | highlights row 1 |
| V3-05 | `public/media/highlights/highlight-icra2026-corner-01-960.mp4` + poster | mp4 / webp | 960x540 | 722 KB / 73 KB | car through the near corner, tripod | `Felix Jahncke/P1022614.MP4` (4K) 3.5-9.0 s | Video: Felix Jahncke | granted | highlights row 1 |
| V3-06 | `public/media/highlights/highlight-icra2026-corner-02-960.mp4` + poster | mp4 / webp | 960x540 | 541 KB / 73 KB | two cars through one corner | `Felix Jahncke/P1022944.MP4` 7.5-12.5 s | Video: Felix Jahncke | granted | highlights row 1 |
| V3-07 | `public/media/highlights/highlight-icra2026-chase-01-960.mp4` + poster | mp4 / webp | 960x540 | 776 KB / 23 KB | "aido" passes, "tu" follows | `Classic Cup/IMG_0915.MOV` 15-20 s | Video: Chinmay and Tanmay Samak | granted | highlights row 1 |
| V3-08 | `public/media/highlights/highlight-icra2026-group-01-1200.webp` | webp | 1200x800 | 139 KB | all teams group photo from above | `Felix Jahncke/P1033293.JPG` | Photo: Felix Jahncke | granted | highlights row 2 |
| V3-09 | `public/media/highlights/highlight-icra2026-car-01-1200.webp` | webp | 1200x800 | 90 KB | car on the grate straight | `Felix Jahncke/P1022921.JPG` | Photo: Felix Jahncke | granted | highlights row 2 |
| V3-10 | `public/media/highlights/highlight-icra2026-bridge-01-1200.webp` | webp | 1200x800 | 58 KB | car airborne on the KNAPP bridge | `Felix Jahncke/P1033212.JPG` | Photo: Felix Jahncke | granted | highlights row 2 |
| V3-11 | `public/media/highlights/highlight-icra2026-pitwork-01-1200.webp` | webp | 1200x800 | 38 KB | student working on the UBM-Atlas car | `Felix Jahncke/P1022958.JPG` (portrait, crop y+780 at 1200 wide) | Photo: Felix Jahncke | granted | highlights row 2 |
| V3-12 | `public/media/highlights/highlight-icra2026-teamtable-01-1200.webp` | webp | 1200x800 | 79 KB | ForzaETH pit table | `Felix Jahncke/P1022635.JPG` | Photo: Felix Jahncke | granted | highlights row 2 |
| V3-13 | `public/media/highlights/highlight-icra2026-trophies-01-1200.webp` | webp | 1200x800 | 27 KB | trophies on the award table | `Felix Jahncke/P1033308.JPG` | Photo: Felix Jahncke | granted | highlights row 2 |
| V3-14 | `public/media/highlights/highlight-icra2026-awards-01-1200.webp` | webp | 1200x800 | 68 KB | team with the gold trophy at the ceremony | `Felix Jahncke/P1033414.JPG` | Photo: Felix Jahncke | granted | highlights row 2 (caption names the event only) |
| V3-15 | `public/media/race/race-iros2026-hero-1920.webp` | webp | 1920x823 | 197 KB | hall wide: track and crowd, ICRA 2026 Vienna | `Felix Jahncke/P1022956.JPG` (21/9 center crop) | Photo: Felix Jahncke | granted | next-race hero |
| V3-16 | `public/media/car/car-photo-01-1200.webp` | webp | 1200x900 | 72 KB | blue car on the OSB bridge | `Felix Jahncke/P1033064.JPG` (4/3 center crop) | Photo: Felix Jahncke | granted | car chapter |
| V3-17 | `public/media/car/car-photo-02-1200.webp` | webp | 1200x900 | 52 KB | ForzaETH car on the RoboRacer grid | `Felix Jahncke/P1023019.JPG` (portrait, crop y+60 at 1200 wide) | Photo: Felix Jahncke | granted | car chapter |
| V3-18 | `public/media/platform/platform-build-1200.webp` | webp | 1200x750 | 81 KB | two students assembling a car | `Felix Jahncke/P1022961.JPG` (16/10 crop) | Photo: Felix Jahncke | granted | platform Build (photo; reserved mp4 not produced, see SELECTION.md) |
| V3-19 | `public/media/platform/platform-learn-1200.webp` | webp | 1200x750 | 20 KB | RViz 3D view, LiDAR scan on the map (f1tenth_gym_ros) | `_harvest/repos/f1tenth_doc/img/f1tenth_autoware_sim.jpg` crop 924x578+372+100, upscaled | f1tenth_doc (org repo) | granted (org asset) | platform Learn |
| V3-20 | `public/media/platform/platform-race-960.mp4` + `platform-race-poster.webp` | mp4 / webp | 960x540 | 880 KB / 27 KB | two cars through the chicane | `Classic Cup/IMG_0917.MOV` 63.0-68.5 s | Video: Chinmay and Tanmay Samak | granted | platform Race |
| V3-21 | `public/media/platform/platform-research-mppi-960.mp4` + `platform-research-mppi-poster.webp` | mp4 (two-pass 880 kbps) / webp | 960x600 | 1.29 MB / 19 KB | MPPI multi-opponent overtaking in the gym, full 11.7 s | `_harvest/platform/multiple_opp_realistic.mp4`, 3D view crop 1352x845+284+192 | Cedric Hollande | granted (own work) | platform Research |
| V3-22 | `public/media/join/join-icra2026-crowd-1200.webp` | webp | 1200x900 | 145 KB | crowd lining the track | `Felix Jahncke/P1022954.JPG` (4/3 center crop) | Photo: Felix Jahncke | granted | Join |
| V3-23 | `public/media/team/team-upenn-autonomous-racing-800.webp` | webp | 800x800 | 78 KB | UPenn Autonomous Racing members at their table | Drive `Teams Intro/upenn_autonomous_racing_edited.mov` frame at 20 s, crop 800x800+560+0 | RoboRacer organizers | granted (organizer media) | teams |
| V3-24 | `public/media/team/team-vaul-2-800.webp` | webp | 800x800 | 49 KB | VAUL team with trophy, TU Wien backdrop | `Felix Jahncke/P1033394.JPG` | Photo: Felix Jahncke | granted | teams (VAUL 2, status verify) |
| V3-25 | `public/media/team/team-forzaeth-800.webp` | webp | 800x800 | 38 KB | ForzaETH car on the grid | `Felix Jahncke/P1023019.JPG` | Photo: Felix Jahncke | granted | teams |
| V3-26 | `public/media/team/team-ubm-atlas-800.webp` | webp | 800x800 | 32 KB | UBM-Atlas car being worked on, placard visible | `Felix Jahncke/P1022958.JPG` | Photo: Felix Jahncke | granted | teams (UBM-Atlas, status verify) |

## Research thumbnails

Generated 2026-08-21 by `scripts/paper_thumbs.py` for the six featured papers on `/research` and the landing research teaser. 1200x750 WebP, under 120 KB each, every file checked by eye; full provenance and the hand-review notes in `docs/media/THUMBS.md`. Credit line on the site: "Figure: <first author> et al."

| id | file/URL | type | WxH | size | what it shows | provenance | license/permission | candidate use | notes |
|---|---|---|---|---|---|---|---|---|---|
| RT-01 | `public/media/research/research-elgouhary-2026-learning-1200.webp` | raster WebP | 1200x750 | 38,266 B | first figure of the paper: Learning to Tune Pure Pursuit in Autonomous Racing: Joint Lookahead an (Elgouhary et al., 2026) | arXiv HTML, figure 1, https://arxiv.org/html/2602.18386v1/x1.png | http://creativecommons.org/licenses/by/4.0/ | PublicationCard thumbnail, /research featured grid and landing research teaser | checked 2026-08-21: figure 1 is the method block diagram (data, PPO, deployment), legible at card size; kept |
| RT-02 | `public/media/research/research-piccinini-2026-trajectory-1200.webp` | raster WebP | 1200x750 | 37,650 B | first figure of the paper: Trajectory Planning and Control near the Limits: an Open Experimental  (Piccinini et al., 2026) | arXiv HTML, figure 1, https://arxiv.org/html/2605.19881v1/framework_overview_new.png | http://creativecommons.org/licenses/by/4.0/ | PublicationCard thumbnail, /research featured grid and landing research teaser | checked 2026-08-21: figure 1 is the framework overview with the car and a velocity-coloured lap; wide figure letterboxed on paper; kept |
| RT-03 | `public/media/research/research-charles-2025-advancing-1200.webp` | raster WebP | 1200x750 | 120,784 B | top of page 1 (title block and teaser): Advancing Autonomous Racing: A Comprehensive Survey of the Roboracer ( (Charles et al., 2025) | PDF page 1 render, https://arxiv.org/pdf/2506.15899 | http://arxiv.org/licenses/nonexclusive-distrib/1.0/ | PublicationCard thumbnail, /research featured grid and landing research teaser | checked 2026-08-21: arXiv figure 1 (mapcollage.png) was a faint collage of track outlines that read as a blank page; replaced by the page-1 crop with --page |
| RT-04 | `public/media/research/research-li-2025-data-1200.webp` | raster WebP | 1200x750 | 55,582 B | first figure of the paper: A Data-Driven Aggressive Autonomous Racing Framework Utilizing Local T (Li et al., 2025) | arXiv HTML, figure 1, https://arxiv.org/html/2410.11570v3/teaser.png | http://arxiv.org/licenses/nonexclusive-distrib/1.0/ | PublicationCard thumbnail, /research featured grid and landing research teaser | checked 2026-08-21: figure 1 is the track photo with the two cornering trajectories; kept |
| RT-05 | `public/media/research/research-ghignone-2025-rlpp-1200.webp` | raster WebP | 1200x750 | 77,082 B | top of page 1 (title block and teaser): RLPP: A Residual Method for Zero-Shot Real-World Autonomous Racing on  (Ghignone et al., 2025) | PDF page 1 render, https://arxiv.org/pdf/2501.17311 | http://creativecommons.org/licenses/by/4.0/ | PublicationCard thumbnail, /research featured grid and landing research teaser | checked 2026-08-21: the HTML first figure is a 464x703 subfigure (below the 500x300 floor), so the page-1 crop was used; it carries the teaser photo; kept |
| RT-06 | `public/media/research/research-okelly-2020-f1tenth-1200.webp` | raster WebP | 1200x750 | 70,460 B | top of page 1 (title block and teaser): F1tenth: An open-source evaluation environment for continuous control  (O'Kelly et al., 2020) | PDF page 1 render, https://proceedings.mlr.press/v123/o-kelly20a/o-kelly20a.pdf | publisher PDF page render, attribution; remove on request | PublicationCard thumbnail, /research featured grid and landing research teaser | checked 2026-08-21: PMLR paper, no arXiv version; page-1 crop shows the title block and abstract; kept (no figure on page 1) |

## Landing v4 produced media (media-curator, 2026-08-22)

Sources: Cedric's folder `_harvest/cedric-media/` (his own footage unless noted), the ICRA 2025 reel by The Robotics Club (YouTube `wPHYLAnpMOU`, watermark "YouTube/@madeautonomous" kept in frame), two LinkedIn videos downloaded with `yt-dlp --cookies-from-browser chrome`, and one Drive photo by Felix Jahncke. Intake, contact-sheet triage and the mapping are in `docs/media/INTAKE.md`. Budgets checked with `scripts/media.sh report public/media` (only the hero encodes above 1.5 MB). Replaced v3 rows V3-03..V3-07, V3-09..V3-11, V3-15, V3-19, V3-22 and the v3 `platform-race` content are superseded by the rows below; their files were deleted.

| id | file | type | WxH | size | what it shows | provenance (source, in/out) | credit | permission | use |
|---|---|---|---|---|---|---|---|---|---|
| V4-01 | `public/media/highlights/highlight-icra2025-start-01-960.mp4` + `-poster.webp` | mp4 h264 30p / webp | 960x540 | 481 KB / 25 KB | two cars launch from the start area toward the camera, one passes close | ICRA 2025 reel 0.33-3.27 s | Video: The Robotics Club | Cedric's decision 2026-08-21 to use the public reel; credit line on the tile; not asked in writing | highlights tile "off the line" (id icra2026-start-01) |
| V4-02 | `public/media/highlights/highlight-icra2025-grid-01-960.mp4` + poster | mp4 / webp | 960x540 | 210 KB / 25 KB | ForzaETH car waiting on the grid line, red LEDs | ICRA 2025 reel 8.30-10.47 s, played at 0.7x (60p source, no duplicated frames), 3.1 s | Video: The Robotics Club | as V4-01 | highlights "on the grid" (id icra2026-grid-01) |
| V4-03 | `public/media/highlights/highlight-icra2026-corner-03-960.mp4` + poster | mp4 / webp | 960x540 | 652 KB / 62 KB | red car arrives down the straight, whip pan, takes the corner onto the blue ramp | `RedCarFastICRA.MOV` 1.8-5.4 s, HLG/BT.2020 tone-mapped to BT.709 (zscale + hable) | Video: Cedric Hollande | granted (own media) | highlights "through the corner" (id icra2026-corner-01) |
| V4-04 | `public/media/highlights/highlight-icra2025-corner-01-960.mp4` + poster | mp4 / webp | 960x540 | 782 KB / 20 KB | blue-placard car through the corner, whip pan, amag car through the same corner (one shot) | ICRA 2025 reel 23.07-28.23 s | Video: The Robotics Club | as V4-01 | highlights "two cars, one corner" (id icra2026-corner-02) |
| V4-05 | `public/media/highlights/highlight-icra2026-chase-02-960.mp4` + poster | mp4 / webp | 960x540 | 677 KB / 45 KB | two cars nose to tail through the white-box chicane | `LamarrRacingFollowUp.MOV` 0.3-4.5 s, tone-mapped as V4-03 | Video: Cedric Hollande | granted (own media) | highlights "the chase" (id icra2026-chase-01) |
| V4-06 | `public/media/highlights/highlight-icra2025-headtohead-01-960.mp4` + poster | mp4 / webp | 960x540 | 533 KB / 41 KB | two cars side by side toward the camera, pass at 1.7 s, camera tilts to the hall | ICRA 2025 reel 91.0-94.0 s | Video: The Robotics Club | as V4-01 | highlights "head-to-head" (id icra2026-headtohead) |
| V4-07 | `public/media/highlights/highlight-iv2026-group-01-1200.webp` | webp | 1200x800 | 119 KB | all IV 2026 Detroit participants behind the track with their cars, checkered flag | `IV_Group_Picture.jpeg` (1600x642), 3/2 crop 963x642+180+0, 1.25x upscale | Photo: Cedric Hollande (photographer not recorded in the file; verify) | granted (organizer media) | highlights tile id iv2026-podium, caption "group photo · IV 2026, Detroit" |
| V4-08 | `public/media/highlights/highlight-icra2026-car-02-1200.webp` | webp | 1200x800 | 120 KB | ETH car (amag placard) at speed on the black floor, orange tube behind | Drive `Felix Jahncke/P1022894.JPG`, auto-orient, crop 4000x2667+0+1800 | Photo: Felix Jahncke | granted (organizer media) | highlights "on track" (id icra2026-car-closeup) |
| V4-09 | `public/media/highlights/highlight-icra2026-bridge-02-1200.webp` | webp | 1200x800 | 49 KB | black car airborne off the KNAPP bridge | `over-the-bridge.jpg` (2048x1365, no EXIF; not Felix's P1033212) | Photo: Cedric Hollande (verify: looks like a DSLR frame) | granted (organizer media) | highlights "over the bridge" (id icra2026-bridge) |
| V4-10 | `public/media/highlights/highlight-icra2026-pitwork-02-1200.webp` | webp | 1200x800 | 155 KB | UPenn Autonomous Racing table at ICRA 2026, car with cardboard box, student soldering a blue car | `troubleshooting.jpeg`, crop 1600x1067+0+66 | Photo: Cedric Hollande | granted (own media; identifiable student, UPenn team) | highlights "pit work" (id icra2026-pitwork) |
| V4-11 | `public/media/race/race-iros2026-hero-1280.mp4` + `race-iros2026-hero-poster.webp` | mp4 h264 30p / webp | 1280x548 (21/9) | 886 KB / 93 KB | Ezio Bartocci's broadcast composite of the Master Cup at ICRA 2026: bird's-eye of the chicane and elevated view of the bridge, 8 s | LinkedIn ugcPost-7468278615458115584, 30-38 s, crop 1272x544+0+0 (top of the composite), native width (no 1600 upscale of a 720p source) | Video: Ezio Bartocci · LinkedIn (https://www.linkedin.com/posts/ezio-bartocci_facultyinformatics-tuwien-roboracer-ugcPost-7468278615458115584-VlAQ/) | NOT ASKED; Cedric decided to use it (2026-08-21) and owns asking Ezio Bartocci | next-race frame (replaces V3-15) |
| V4-12 | `public/media/platform/platform-learn-960.mp4` + `platform-learn-poster.webp` | mp4 / webp | 960x540 | 528 KB / 32 KB | hands assembling a car on a bench, 2x time-lapse, 5.9 s loop | `assembling_car.mp4` full length, `setpts=0.5*PTS`, no audio | Video: Cedric Hollande | granted (own media) | platform Learn row (replaces V3-19) |
| V4-13 | `public/media/platform/platform-race-960.mp4` + `platform-race-poster.webp` | mp4 / webp | 960x540 | 729 KB / 28 KB | LED car passes close, then the Liquid car passes close, one handheld shot, 4.8 s | ICRA 2025 reel 78.37-83.17 s | Video: The Robotics Club | as V4-01 | platform Race row (same file names as V3-20, new content) |
| V4-14 | `public/media/join/join-korea2025-group-1200.webp` | webp | 1200x900 | 207 KB | about 150 participants under the banner "The 4th F1tenth Korea Championship", Incheon Songdo Convensia | `The4thF1TenthCompetitionKorea.jpg` (Galaxy S24 Ultra, 2025-11-04), 4/3 crop 3003x2252+498+0 | Photo: Cedric Hollande (photographer not recorded; verify) | granted (organizer media) | Join photo (`community.json` join.photo; replaces V3-22) |
| V4-15 | `public/media/join/join-icra2026-post-960.mp4` + `join-icra2026-post-poster.webp` | mp4 / webp | 960x540 | 1.04 MB / 65 KB | static elevated view of the ICRA 2026 hall, track, teams and crowd, 8.8 s | LinkedIn ugcPost-7468073672411336704 ("Today was our first race day at IEEE ICRA"), full length | Video: The RoboRacer Foundation · LinkedIn (https://www.linkedin.com/posts/today-was-our-first-race-day-at-ieee-ugcPost-7468073672411336704-I1kC/) | granted (the post is by the RoboRacer Foundation page itself) | Join post card (`community.json` join.post) |
| V4-16 | `public/media/join/join-youtube-icra2025-poster-1200.webp` | webp | 1200x675 | 55 KB | two cars side by side on the yellow-duct track | ICRA 2025 reel frame at 92.6 s | Video: The Robotics Club | as V4-01 | Join YouTube facade poster (`community.json` join.youtube) |
| V4-17 | `public/media/team/team-unicorn-racing-800.webp` | webp | 800x800 | 114 KB | seven team members holding a car on the ICRA 2026 track | `UnicornRacingTeamPic.jpg`, crop 1536x1536+257+0 | Photo: Cedric Hollande | granted (organizer media; identifiable students, team identity unverified) | team square candidate, not referenced yet (status verify) |
| V4-18 | `public/media/car/car-overview-diagram-960.webp` | webp | 960x540 | 51 KB | F1TENTH platform overview diagram (chassis, system integration, software, research enabled) | `f1tenth_learn_overview-addtooverviewofthecar.png`, native size | F1TENTH paper figure (O'Kelly et al.), via Cedric | granted (own project figure) | car chapter / about candidate, not referenced yet |
