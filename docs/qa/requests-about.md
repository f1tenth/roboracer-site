# Requests from the About builder to the director

Everything below is in a file the About builder does not own. Nothing here was
edited by Stream 2. Ordered by how much it costs to leave alone.

---

## 1. `CommunityJoin` downloads a 1.05 MB clip four times, before any scroll

**Files:** `src/components/ui/CommunityJoin.tsx`, `src/components/ui/Marquee.tsx`

`CommunityJoin`'s "from the community" strip puts `PostCard` inside `<Marquee>`.
`Marquee` renders each child **four times** (two tracks, each holding its items
twice so the -50% keyframe is seamless), and `PostCard` renders a real
`<video autoPlay>` pointing at `public/media/join/join-openrobotics-post-960.mp4`
(1,050,301 B). Measured on `/about` with the block mounted eagerly:

| | first paint, no scroll | full scroll |
|---|---|---|
| with the block eager | **7.86 MB** (4.10 MB of it video, 4 requests) | 21.55 MB |
| with the block gated | **2.98 MB** (0 video) | 4.85 MB |

About works around this in `src/components/about/NearViewport.tsx`: the block
mounts 800px before it reaches the viewport. That is a page-level patch, not a
fix. The fix belongs in the shared component, one of:

- render the clone copies as the poster `<img>`, not a `<video>` (only the
  non-clone copy needs to move), **or**
- `preload="none"` on the strip's videos and start them on intersection, **or**
- drop the video from the strip entirely and use `post.poster` (the eleven
  other cards in the strip are already posters).

The landing pays the same 4.1 MB the moment a reader reaches its Join section.

## 2. The YouTube embed loads without a click, and brings three console messages

**File:** `src/components/ui/CommunityJoin.tsx` (`YouTubeCard`, line ~289)

The component's own docstring calls it a "click-to-load YouTube facade", but the
`IntersectionObserver` at 0.6 sets `playing` on its own, so the iframe mounts
from scrolling alone. Once it does, the page logs, on `/` and `/about` alike:

```
error:   Permissions policy violation: compute-pressure is not allowed in this document.
warning: No available adapters.
warning: Failed to execute 'postMessage' on 'DOMWindow': the target origin
         ('http://localhost:4180') does not match the recipient window's origin
         ('https://www.youtube-nocookie.com').
```

All three come from YouTube's player, none from page code, but they are the only
console output `/about` produces and they break "zero console errors" for every
page that renders this block. It also pulls ~10 MB of player JS and stream.
Suggested: keep the poster + play button, and let the observer only *preconnect*.
`allow="compute-pressure 'none'"` silences the first message if the auto-play
behaviour is deliberate.

## 3. `team_developers.json` and `team_alumni.json` are dead — please delete them

`src/pages/About.tsx` was their only consumer and no longer reads them. They
still point at `crew/billy.png`, `crew/betz.jpeg` and 17 more originals that
Stream 2 replaced with `-400.webp` encodes, so every path in them is dangling.
Nothing renders them, so `/about` has **zero 404s** today (verified: 311 OK
responses, 0 failures, 0 broken `<img>`).

To delete: `public/data/team_developers.json`, `public/data/team_alumni.json`,
and `loadTeamDevelopers` / `loadTeamAlumni` in `src/lib/data.ts` (both exported,
neither imported anywhere).

## 4. Dead embla CSS in `src/index.css`

`embla-carousel-react` has no importer left in `src/` (the old About carousel was
its only one). `src/index.css` still carries `.embla`, `.embla__viewport`,
`.embla__container`, `.embla__slide` and `.embla__slide img` around line 556.
Safe to delete with the package.

## 5. `Marquee`'s reduced-motion fallback never wraps

**Files:** `src/index.css` (~line 191), `src/components/ui/Marquee.tsx`

```css
@media (prefers-reduced-motion: reduce) {
  .rr-marquee-track { animation: none; flex-wrap: wrap; justify-content: center; }
}
```

`flex-wrap: wrap` cannot take effect while `.rr-marquee-track` keeps
`flex-shrink: 0`: the track stays at its content width inside a container with
`overflow: hidden`, so a reduced-motion reader sees only the first few items and
no way to reach the rest. Measured at 1440 with 20 partner logos: container
height 168px in both motion modes, second track and clones correctly
`display: none`, first track still `nowrap` in effect. Adding
`flex-shrink: 1; width: 100%` (or `min-width: 0`) to the reduce block fixes it
for every marquee on the site.

## 6. Extraction, if you want it

`src/components/about/PartnerWall.tsx` is written to be moved into
`src/components/ui/` unchanged — it takes only `partners: Partner[]` and reads
`category`. Same for `NearViewport.tsx`. Neither has an About-specific import.
Stream 2 kept them under `components/about/` because that is the tree it owns.

## 7. Two smaller notes

- `src/components/ui/LogoCloud.tsx` renders `p.image`, the PNG originals: 7.26 MB
  across the 80 partners, against 1.47 MB for the same logos as `image_hover`
  (colour WebP). Preferring `image_hover ?? image` would make it usable at this
  list size. `PartnerWall` does that already.
- `SocialButton`'s `soon` branch hardcodes `buttonClasses(variant, "paper", ...)`,
  so it cannot render on an ink surface. Not needed by About (Instagram has a
  real URL now), noted for whoever puts a `soon` channel on the footer or hero.
