# QA - /about

Stream 2, 2026-08-23, against the shared dev server on http://localhost:4180.
Captures and raw runs in `docs/qa/about/` (PNG + `run-<label>.json` +
`axe-<label>.json` per breakpoint). Requests that belong to files this stream
does not own are in `docs/qa/requests-about.md`; the provenance of every fact on
the page is in `docs/content/about.sources.md`.

## What the page is now

Hero (ink, the one `h1`) / 01 What RoboRacer is / 02 The platform /
03 People / 04 Our Partners / 05 Join.

| | |
|---|---|
| `h1` | 1 - "Open-source autonomous racing since 2016" |
| `h2` | 5 - What RoboRacer is · The platform · People · Our Partners · Join |
| document title | "About - RoboRacer" (already in `Layout.tsx`) |
| people groups | Faculty and advisors **11** · Developers **13** · Contributors **49** (13 active, 36 earlier) · Past crew **51** |
| partners | **80** - 65 universities, 8 industry, 7 organizations |
| verify tags | 62 |
| images | 248, **202 lazy**, **0 without width/height** |
| external links | 227 unique |

The 46 eager images are all inside the shared `CommunityJoin` marquee, which
cannot lazy-load its children (a lazy logo pops in mid-loop). Everything About
itself renders is lazy.

## Results

| Check | Result |
|---|---|
| `npx tsc --noEmit -p tsconfig.app.json` | pass |
| `npx eslint src/pages/About.tsx src/components/about` | pass, 0 problems |
| axe (wcag2a/aa, wcag21a/aa) 1440 / 768 / 390 / 844x390 / reduced | **0 violations** at every one |
| console errors | 0 at 1440, 768, 844x390 and reduced motion. See "YouTube" below for 390. |
| page errors | 0 everywhere |
| 404s | **0** - 284 responses, none >= 400, no `requestfailed`, 0 broken `<img>` (`naturalWidth === 0`) |
| reduced motion | verified, see below |
| layout shift | none observed; every image and video carries intrinsic `width`/`height` and its box carries the matching `aspect-ratio` |

Full-page heights: 1440 **18,636px** · 768 18,457px · 390 23,500px ·
844x390 (landscape) 18,611px · reduced motion 18,636px / 23,562px.

## The contrast fix, measured at rest

`bg-brand-radial` was never defined in `src/index.css`, so the old hero panel had
no background: its text sat on the page background and only became legible on
`:hover` (`hover:bg-white/90`). The hero is now a real `Section variant="ink"`.
Measured with `getComputedStyle` on the painted page, **no hover, no focus**:

| Element | Colour | On | Ratio |
|---|---|---|---|
| `h1` | `#f5f5fa` | `#0e0f1a` (ink-900) | **17.54:1** |
| hero lead paragraph, 20px | `#a8acc4` | `#0e0f1a` | **8.50:1** |
| ledger terms (mono, 14px) | `#a8acc4` | `#0e0f1a` | **8.50:1** |
| ledger values (mono, 14px) | `#f5f5fa` | `#0e0f1a` | **17.54:1** |
| section titles | `#0b0c14` | `#fbfbfd` (paper-50) | **18.87:1** |

AA needs 4.5:1. `document.querySelectorAll('.bg-brand-radial').length` is **0**,
and axe's `color-contrast` rule reports nothing on any breakpoint, which covers
the small mono text (`verify` tags, captions, affiliations) as well.

## Weight, before and after

The audit measured the old page at **15.33 MB of eager originals** - three camera
JPEGs up to 1.68 MB behind a carousel, and twenty crew photos served from
originals (a 2.9 MB PNG drawn at 100x100). Measured now on the dev server:

| | bytes on the wire |
|---|---|
| first paint, no scroll | **3.13 MB** - of which images **480 KB** across 9 requests |
| whole page scrolled to the footer | 13.04 MB |
| ...of that, **About's own media** | **5.39 MB**, all lazy |
| ...of that, the shared `CommunityJoin` block | 5.08 MB |
| ...of that, dev-server JS (unminified + `@vite/client`) | 2.49 MB |

About's own media, in full:

| | size | requests |
|---|---|---|
| platform clips + posters (`/media/platform/`) | 2.67 MB | 7 |
| partner logos (colour WebP) | 1.47 MB | 80 |
| people headshots | 839 KB | 63 |
| page photos | 318 KB | 3 |
| GitHub avatars (`?s=80`) | 229 KB | 49 |

The platform clips are 2.67 MB of that total and were added on 2026-08-23 when
the poster-only decision was overruled. They are the encodes the landing already
ships - no new files - at `preload="metadata"`, mounted only within 200px of the
viewport, so a reader who stops at People never downloads them.

### On disk

| | before | after |
|---|---|---|
| `public/about/` | 3,724,791 B (3 JPEGs, largest 1.68 MB) | **325,252 B** (3 WebP, 1200 wide, 95-128 KB) |
| `public/crew/` (the 20 files About rendered) | 10,581,516 B | **859,252 B** across **63** square 400px WebP, 4-34 KB each |

`public/crew/` measures 1,847,584 B in total because it still holds
`WilliamHoganson.jpg` (869,737 B), `Nalamwar.png` and `Kalluraya.jpeg` - three
testimonial photos referenced only by the unused `testimonies.json`. They are
not About's and were left alone.

The three files that broke the 1.5 MB rule are gone from the tree, replaced not
duplicated: `public/about/image-2.JPG` (1,675,116 B), `public/crew/billy.png`
(2,985,691 B), `public/crew/Roshan_Benefo.jpeg` (2,235,735 B). Nothing this
stream added exceeds 34 KB.

## Motion

Only three things move, and each degrades to the static layout:

| Pattern | Reduced motion |
|---|---|
| `Reveal` (section bodies, people grids, partner grids) | `gsap.from` runs inside `gsap.matchMedia(MOTION_OK_QUERY)`; nothing hides without it |
| platform clips (`autoPlay muted loop playsInline preload="metadata"`) | **no `<video>` is created at all**; the poster `<img>` is the media |
| `StatCounter` on the partner count | final number is in the markup from first render |

Measured with `reduced_motion: "reduce"`, at 1440 and 390: `document.querySelectorAll('video').length === 0` in both.
With motion allowed, the clips report `paused: false`, `readyState: 4`,
`error: null`, `muted`, `loop`, `playsInline`, and rows outside the viewport
report `paused: true`. No autoplay was blocked - verified in a plain Chromium
with no `--autoplay-policy` override, console clean.

There are no pinned sections and no `ScrollTrigger` pins on this page, so the
landscape pass (844x390) is the desktop layout at a short height with nothing
clipped.

## Findings and what was done

1. **`bg-brand-radial` undefined** - fixed, see above.
2. **15.33 MB of eager originals** - fixed, see above. 52 headshots were promoted
   from `_harvest/pick/crew/` and the race sites and encoded to 400px WebP, so
   the page shows more people at a twelfth of the bytes.
3. **`embla-carousel-react`** - the import is gone; `src/` has no importer left.
   The `.embla*` CSS still sits in `src/index.css` (request 4).
4. **The truncated sentence at `About.tsx:137`** ("...in the design of
   autonomous.") is finished in section 01: "...in the design of autonomous
   systems." Not rewritten, completed.
5. **`Marquee` never wraps under reduced motion** - found while checking the
   partner ribbon: `flex-wrap: wrap` cannot take effect against
   `flex-shrink: 0`, so a reduced-motion reader would have seen four of the
   twenty logos. About no longer uses a marquee for partners, so it is not
   exposed; filed for the shared component (request 5).
6. **`CommunityJoin` downloads a 1.05 MB clip four times before any scroll**
   (4.10 MB at first paint) - `Marquee` renders each child four times and
   `PostCard` is a real `<video>`. About gates the whole block on
   `NearViewport`, which takes first paint from 7.86 MB back to 3.13 MB. The fix
   belongs in the shared component (request 1).
7. **A broken partner-page URL**: `people.crew.json` linked Venkat Krovi to
   `.../people/Venkat-Krovi.html` (and before that `Venkat%20Krovi.html`); both
   404. Clemson's own path is `venkat-krovi.html` and answers 200. Corrected in
   the generator and reported.
8. **Slack copy** - section 05 is the shared `CommunityJoin`, whose lead is
   "Join N people building and racing" with the Slack button beside it. No
   banned phrase appears in any file this stream owns: no "on the grid", no
   "Four steps between...", no "everything else can be sorted out on Slack".
   ("Crew Chief" and "Team Principal" do appear - as Madhur Behl's and Rahul
   Mangharam's archived project roles, sourced data carrying a `verify` tag, not
   this stream's prose.)

## Known, not fixed here

- **JavaScript disabled: the page is blank.** So is `/`, `/race` and every other
  route - the site is a client-rendered SPA with no prerender and no `<noscript>`
  in `index.html`. `document.body.innerText.length === 0` on all three. This is
  a shell-level gap, not an About one; `index.html` and the build config belong
  to the director.
- **The YouTube embed in `CommunityJoin`** mounts itself at 60% visibility
  despite being described as click-to-load. When it does, the page logs one
  error and two warnings, all from YouTube's own player
  (`compute-pressure` permissions policy, `No available adapters`, a
  `postMessage` origin mismatch), and pulls roughly 10 MB of player and stream.
  It fired in the 390 run and not in the others, which is why the console result
  is "0 except at 390". Nothing on the page emits these. Request 2.
- **LinkedIn profile links cannot be machine-verified.** 52 of the 74 URLs this
  stream renders are LinkedIn profiles carried over from the archived roster;
  LinkedIn answers 429 or 999 to scripted requests and to a headless browser,
  so "resolves" is unproven for them either way. Of the rest, 21 answer 200 and
  one - `engineering.virginia.edu/faculty/madhur-behl`, the co-founder source -
  answers 403 behind a Cloudflare challenge ("Just a moment..."), which is a bot
  block, not a dead page.
- **Rahul Mangharam's headshot** now comes from the IROS 2026 race site at
  400x400. The copy that was in `public/crew/` was 200x200; it was deleted.

## TODO(content)

Everything below renders with a mono `verify` tag rather than a guess, and is in
`docs/content/people.gaps.csv` for Cedric's form:

- **Ayagoz Smagulova** - no role, no affiliation, no public page. Monogram tile,
  name only, not a link.
- **Johnny Tian**, **Dhruv Jaiswal** - CMU, no role. Monogram tiles.
- **Francesco Gatti** - no institutional role; his archived project role
  ("Organizer") carries the tag.
- **21 project roles from the archived F1TENTH about page** - authored in HTML
  comments, never displayed there. Rendered with the tag per the director's
  ruling; one confirmation pass kills or keeps all of them.
- **50 of 51 Past crew entries** have no role at all: name, photo where one
  exists, link, tag.
