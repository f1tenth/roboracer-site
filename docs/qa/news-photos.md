# QA: LinkedIn pictures on two 2026 news items (content/news-linkedin-photos, 2026-09-26)

Cedric, 2026-09-26: `iros2026-sim-league-siga-siga-wins` and `vtc2026-boston-neobotics` showed only a LinkedIn embed; their posts carry pictures and he wants them on the items.

## Fetched

Public post pages read with curl and a browser user agent (HTTP 200). Every image URL in each page (`og:image`, the `application/ld+json` block, the `feedshare-shrink_*` URLs) collected and downloaded at the largest size LinkedIn serves; the `feedshare-shrink_2048_1536` variant answers 403 for these posts, and the embed pages (`/embed/feed/update/<urn>`) list the same files. Raw downloads are in the main checkout's git-ignored `_harvest/linkedin/{siga,vtc}/`.

- AutoDRIVE Ecosystem, results post (activity 7508752923695194113): **1 image**, an 800x266 banner ("6th RoboRacer Sim Racing League" over a simulated car, IROS 2026 Pittsburgh, AutoDRIVE and RoboRacer marks).
- Neobotics Foundation, recap post (activity 7507891143662145538): **9 photos**, one 1080x1165, one 673x967, seven 800 wide. The Roboracer Foundation's repost (activity 7507935046394376192) carries the same nine.

## Chosen

| item | file | dims | size | why |
|---|---|---|---|---|
| `iros2026-sim-league-siga-siga-wins` | `public/media/news/news-iros2026-sim-league-800.webp` | 800x266 | 22 KB (22,472 B) | the post's only image; a title graphic, acceptable for a sim race with no photographs |
| `vtc2026-boston-neobotics` | `public/media/news/news-vtc2026-group-800.webp` | 800x525 | 80 KB (81,752 B) | the post's lead image: the whole field with their cars behind the duct track; landscape, so it fills the 16:10 card frame with little crop. The portrait car shot (1080x1165) would lose most of its height to the frame |

Pillow WebP q80, method 6, native size (no upscaling; both sources are 800 wide, so the names end in `-800` like `news-iv2024-post-800.webp`). Manifest rows NEWS-25 and NEWS-26 in `docs/ASSET_MANIFEST.md`; permission: third-party organisation's own post, added at Cedric's request on 2026-09-26, permission not yet requested. `docs/news/MEDIA_IMAGES.json` has both entries; `apply_media_images.py` reports them as already applied.

`public/data/news.json`: only the two items' `image` (null -> {src, width, height, alt}) and the top-level `updated` (2026-09-25 -> 2026-09-26) changed; the file round-trips byte-identical otherwise (checked before writing). The item `credit` lines already name the post owner ("Post: AutoDRIVE Ecosystem · LinkedIn", "Post: Neobotics Foundation · LinkedIn") and were left as they are.

## Rendering

Neither item is the lead (the lead is the featured `ifac2026-busan-largest-race`), so both render as `NewsCard`. A card with a LinkedIn `embed` and an `image` already showed the picture in the 16:10 frame with the "Show the LinkedIn post" toggle under the text: no change was needed to make the pictures appear.

One change: the 3:1 banner under `object-cover` in the 16:10 frame lost its lettering ("BORACER SIM RACING L") and both logos. `NewsCard` now shows an image wider than 2.5:1 whole (`object-contain` on the `bg-ink-950` ground the video cards use). Only this item crosses 2.5:1 (the next widest is 2.03:1, the IFAC lead, which `NewsLead` renders). No motion added; `loading="lazy"`, `decoding="async"`, `width`/`height` and the decorative `alt=""` (the card's image link is `aria-hidden`, the headline carries the link) are unchanged.

## Render check (Playwright, dev server on :4191, /news)

| viewport | item | `<img>` src | natural | rendered box | loading |
|---|---|---|---|---|---|
| 1440x900 | Siga Siga | `/media/news/news-iros2026-sim-league-800.webp` | 800x266 | 646x403 | lazy |
| 1440x900 | VTC 2026 | `/media/news/news-vtc2026-group-800.webp` | 800x525 | 646x403 | lazy |
| 390x844 | Siga Siga | same | 800x266 | 340x212 | lazy |
| 390x844 | VTC 2026 | same | 800x525 | 340x212 | lazy |

Same result at 1440x900 with `prefers-reduced-motion: reduce` (card opacity 1, image visible). No console errors at either size. Both are in the first four 2026 cards, so they show without opening a fold. Screenshots (git-ignored, in the worktree `docs/qa/news-photos/`): `siga-card-1440.png`, `vtc-card-1440.png`, `siga-card-390.png`, `vtc-card-390.png`, `year2026-1440.png`, `year2026-390.png`.

`npm run lint` and `npm run build` pass.
