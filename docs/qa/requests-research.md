# Requests from Stream 4 (Research) to the director

Files the director owns; Stream 4 did not touch any of them.

## 1. `src/components/ui/PublicationCard.tsx` is now used only by `/styleguide`

`/research` renders `src/components/research/PaperCard.tsx` instead. The
research card does three things `PublicationCard` cannot, and all three are
research-page contracts rather than shared-primitive behaviour:

- a picture on **every** featured card (the paper's figure, else the generated
  `research/VenueTile`) instead of an optional thumbnail;
- a runtime fallback chain thumbnail -> figure -> tile, so a `thumbnail` path
  that 404s never leaves an empty frame (three records point at files that are
  not on disk right now, see item 4);
- the unlinked case: title as plain text plus a mono `no link on file` tag and
  a Scholar search.

CLAUDE.md rule 10 says no parallel v2 component survives a page shipping. The
one-line resolution, whichever the director prefers:

- **A (preferred): delete `src/components/ui/PublicationCard.tsx`** and point
  `src/pages/Styleguide.tsx:30,278` at `../components/research/PaperCard`
  (same props: `publication`, `tagLabels`). Nothing else imports it.
- **B:** hand `ui/PublicationCard.tsx` to Stream 4 and the research card moves
  back into `ui/` with the figure fallback and the unlinked tag folded in.

Stream 4 has no write access to `ui/` or `Styleguide.tsx`, so this is the
director's call either way.

## 2. `text-display-s` is not a token (landing bug, not research)

`src/components/ui/ResearchCarousel.tsx:162` sets
`font-display text-display-s font-semibold` on the side-strip venue initials.
`--text-display-s` is not declared in `src/index.css` (the scale is
`display-xl`, `display-l`, `display-m`, then `lead`), so that utility resolves
to nothing and the text inherits its parent size. Either add the token or use
`text-lead`. Found while checking which type scale the research tile could
reuse.

## 3. One extra line in the `index.html` `<noscript>` block

The no-JS fallback lists the docs, the build guide, GitHub and Slack. The
useful no-JS destination for `/research` is the Scholar query itself:

```html
<li><a href="https://scholar.google.com/scholar?hl=en&amp;as_sdt=0%2C39&amp;q=f1tenth+%7C+roboracer+&amp;btnG=" style="color:#0b0c14">Publications that reference the platform (Google Scholar)</a></li>
```

## 4. Data follow-up, now that `publications.json` is Stream 4's

Fixed by Stream 4 already: 48 of the 49 missing links, the LaTeX sweep, the two
CTU thesis titles. Still open and **not** fixed, because it is a media naming
question rather than a data one:

Three featured records point `thumbnail` at a file that is not on disk. The
research page survives it (the fallback chain uses `figure` instead), but the
intended 1200x750 crop is not what renders:

| id | `thumbnail` in the record | on disk instead |
|---|---|---|
| `wachter-2026-spatially` | `research-wachter-2026-spatially-1200.webp` | `research-wachter-2026-spatially-fig-1200.webp` |
| `trumpp-2024-racemop` | `research-trumpp-2024-racemop-1200.webp` | `research-trumpp-2024-racemop-fig-1200.webp` |
| `loetscher-2023-assessing` | `research-loetscher-2023-assessing-1200.webp` | `research-loetscher-2023-assessing-fig-1200.webp` |

Either the three files get renamed to what the records say, or the records get
repointed at the `-fig-1200` files. Stream 4 did not guess which, because
`docs/media/THUMBS.md` documents the two names as different crops.

Also `research-trumpp-2024-racemop-fig-1600.webp` is on disk and referenced by
nothing.

## 5. Nothing else

No token, layout, nav, footer or route change was needed. `src/index.css` is
untouched; the tile is built from existing tokens only (`bg-paper-100`,
`border-ink-950/[0.07]`, `text-display-m`, `text-lead`,
`font-mono text-eyebrow`, `bg-ink-950` for the 4px index marker).
