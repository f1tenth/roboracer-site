---
name: roboracer-media
description: Where roboracer.ai media lives and how it is processed - asset manifest format, provenance and permission tracking, naming, compression commands (ffmpeg, cwebp, magick), size budgets, poster frames, Cloudflare hosting for video and large GIFs. Load before adding, replacing, or referencing any image, video, GIF, or logo in src/ or public/.
user-invocable: false
---

# Media pipeline

## Budgets (hard)
- Nothing over 1.5 MB in git, with ONE standing exception (Cedric, 2026-08-20): the landing hero loop encodes in `public/media/hero/` are committed (each under 3 MB; desktop 1920 wide, mobile 960 wide). There is no Cloudflare account for site media; do not reference media.roboracer.ai. Images: WebP (AVIF where quality allows), max 1920 px long edge for full-bleed, 1200 px for cards, 400 px for headshots, 320 px for logos (SVG preferred). Every `<video>` has a `poster` (WebP, under 150 KB). Every image has explicit `width` and `height`.
- Total first-load transfer for the landing page under 2.5 MB on desktop and 1.2 MB on mobile (video poster counts, the video stream does not).

## Locations
- `_harvest/` (git-ignored): raw material. `_harvest/repos/` (old site and race-site sources), `_harvest/wayback/` (web.archive.org pulls with timestamps), `_harvest/drive/` (folders Cedric syncs from Google Drive: Logo, Posters 2026, Old Banners Flyers Shirts Stickers, 2026 ICRA Media, 2026 ICRA Logos), `_harvest/community/` (media received from LinkedIn authors after permission).
- `public/media/<section>/` for processed images (`hero/`, `race/`, `about/`, `partners/`, `sponsors/`, `team/`, `research/`, `news/`). Keep the existing `public/partners`, `public/crew`, `public/testimonials` until a page migrates, then move and delete.
- Video hosting decision (Cedric, 2026-08-20): NO Cloudflare. The hero loop is committed under `public/media/hero/` (see Budgets); any OTHER video or large GIF must be cut to fit the 1.5 MB git rule, converted to a poster + link, or dropped. `.gitignore` re-includes only `public/media/hero/hero-fpv-loop-*` files.
- `docs/ASSET_MANIFEST.md`: the catalog (written by the asset-harvester agent). Columns: `id | file/URL | type | WxH | size | what it shows | provenance | license/permission | candidate use | notes`.

## Provenance and permission
- Allowed without asking: RoboRacer's own media (old f1tenth.org site sources and archive, Drive folders, race sites we run, photos taken by organizers), partner logos already on the site.
- Ask first: anything from a participant's LinkedIn post, team photos with identifiable students, university photography. Track in the manifest with `permission: not-asked | asked <date> | granted <date, by whom, scope> | declined`. Use only `granted`.
- Never: neobotics.org assets, stock sites without license records, screenshots of other people's websites.
- Credit line convention for community media: `Photo: <Name>, <Team>` in a caption or the page footer credits block.

## Naming
`<section>-<subject>-<variant>.<ext>`, lowercase, hyphens: `hero-icra2026-pack-1920.webp`, `hero-icra2026-pack-poster.webp`, `race-iros2026-hall.webp`, `team-cedric-hollande-400.webp`, `partner-eth-zurich.svg`. Videos: `hero-fpv-loop-1920.mp4`, `hero-fpv-loop-960.mp4`.

## Commands (`scripts/media.sh` wraps these)
```bash
# video: H.264 for compatibility, loop-friendly, no audio, fast start
ffmpeg -i in.mov -an -vf "scale=1920:-2:flags=lanczos,fps=30" -c:v libx264 -preset slow -crf 24 -pix_fmt yuv420p -movflags +faststart out-1920.mp4
ffmpeg -i in.mov -an -vf "scale=960:-2:flags=lanczos,fps=30" -c:v libx264 -preset slow -crf 26 -pix_fmt yuv420p -movflags +faststart out-960.mp4
# optional webm/AV1 (smaller, include as first <source>)
ffmpeg -i in.mov -an -vf "scale=1920:-2" -c:v libsvtav1 -crf 34 -preset 6 out-1920.webm
# poster at 1.5 s
ffmpeg -ss 1.5 -i out-1920.mp4 -frames:v 1 -q:v 2 poster.jpg && cwebp -q 80 poster.jpg -o out-poster.webp
# gif -> mp4 loop
ffmpeg -i in.gif -movflags +faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" out.mp4
# images
cwebp -q 82 -resize 1920 0 in.jpg -o out-1920.webp
magick in.png -resize 400x400^ -gravity center -extent 400x400 -quality 85 out-400.webp
# inspect
ffprobe -v error -show_entries stream=width,height,duration,bit_rate -of default=nw=1 file.mp4
magick identify -format "%wx%h %b\n" image.png
```

## Markup conventions
```tsx
<video className="..." autoPlay muted loop playsInline preload="metadata" poster="/media/hero/hero-fpv-poster.webp" aria-hidden="true">
  <source src="https://media.roboracer.ai/hero/hero-fpv-loop-1920.webm" type="video/webm" media="(min-width: 768px)" />
  <source src="https://media.roboracer.ai/hero/hero-fpv-loop-1920.mp4" type="video/mp4" media="(min-width: 768px)" />
  <source src="https://media.roboracer.ai/hero/hero-fpv-loop-960.mp4" type="video/mp4" />
</video>
```
Under `prefers-reduced-motion: reduce`, render the poster `<img>` instead of `<video>` (check with `matchMedia` in a small hook `usePrefersReducedMotion`). Images below the fold: `loading="lazy" decoding="async"`. Logos: `<img>` with `height` set and `width="auto"` inside a fixed-height box so the marquee never shifts.

## Community media list (from Rahul, Aug 16; permission status starts at not-asked)
LinkedIn posts by: Amr El-Wakeel (3rd place), Milan Manoj, Seif Eldaby (Assiut Motorsport), William Hecoin (IEEE IV 2026, Autoware), Jooncheol Park (TU Wien), Mattia Dal Bo, Cedric Hollande (ICRA/IV 2026), Elias Eckermann, Luis Denninger (Team Unicorn), Nayeem Islam Shanto, F. Pomerleau, Megha J. Kabra, Maninder Kaur, plus three activity URLs without author names. Full URLs are in the Slack thread of Aug 16 (xlab-upenn #general); Cedric keeps them in the Drive media folder. Outreach template: see `templates/permission-request.md` next to this file.

## Hero video (landing)
Source on Cedric's machine: `/home/cedric/Documents/UPenn/xLAB/Roboracer/IROS2026/iros2026_race/images/Roboracer/roboracer_fpv.mp4`. Copy it to `_harvest/hero/` and run `scripts/media.sh video _harvest/hero/roboracer_fpv.mp4 _harvest/hero/hero-fpv-loop` (1920 and 960 encodes, webm if available, poster). Target under 3 MB for the 1920 encode; if the clip is long, cut the best 10 to 20 s loop first (`ffmpeg -ss <start> -t <dur> -i in.mp4 -c copy cut.mp4`) and pick a poster frame with the car in motion. The encodes go to Cloudflare; only the poster (`public/media/hero/hero-fpv-poster.webp`) is committed. Until Cloudflare is set up, place the mp4 in `public/media/hero/` locally (git-ignored by the setup step) so the page works on localhost.

## 3D model (done Aug 20: /assembly viewer, Codex)
- Meshes live in `public/models/racecar/` (chassis, accent, LiDAR, four wheels), copied from `../f1tenth_gym_ros/meshes` by `npm run sync:racecar` (`scripts/sync-racecar-assets.mjs`). Transforms come from `../f1tenth_gym_ros/urdf/racecar_mesh.xacro` and are mirrored by hand in `src/components/racecarAssemblyData.ts` (F1TENTH: s=1.0, lr=0.171450; F1FIFTH: s=1.656456, lr=0.258500; full scale: s=7.449941, lr=1.508760; chassis origin -lr, other X = s*sourceX - lr, Y/Z = s*source, mesh scale s, per-wheel alignment rotations). Never multiply existing positions by s blindly; lr changes independently. Preferred upgrade: make the sync script emit a viewer manifest from the xacro instead of the hand table.
- Budget: run `scripts/media.sh report public/models` before committing; Draco-compress (`npx gltf-transform optimize in.glb out.glb --compress draco`) or move to Cloudflare anything over 1.5 MB. Keep `/assembly` and the landing chapter lazy-loaded so three.js never enters the hero's critical path.
- The viewer's download button exports `f1tenth-xacro-assembly.gltf` (~3 MB, meters, Y-up, canonical assembled pose). Onshape imports it as mesh reference only; the editable OnShape model stays a separate effort and replaces the meshes when ready (export GLB from OnShape, drop into `public/models/racecar/`, update the part table or manifest).
- The old `public/models/anim_2.glb` (2.6 MB) is now a deletion candidate once nothing references it.
