# QA - /research

Date: 2026-08-23. Branch: `revamp/pages-v1`. Stream 4 (pages v2 section 8).
Scope: a fix list on the page rebuilt in `6d566b0`, not a rebuild. Dev server
`http://localhost:4180`, shared tree, no production build run (three builders
share `dist/`; the director runs it).

## What changed

| Node | Change |
|---|---|
| n151 | Every featured paper now carries a picture. New `src/components/research/` owns the research card, the row and the generated venue tile. The figure falls back thumbnail -> figure -> tile, so a card is never an empty frame. |
| n152 | 49 papers had no reachable link. 48 got one; 1 renders as unlinked text with a mono tag and a Scholar search. |
| n153 | General LaTeX/HTML unescape and normalise sweep over every text field of all 133 records, plus nine restorations from the authoritative source record (CTU DSpace, Crossref, OpenAlex). |

Files: `src/pages/Research.tsx`, `src/components/research/{figures.ts,VenueTile.tsx,PaperCard.tsx,PaperRow.tsx}`,
`src/lib/publications.ts`, `public/data/publications.json`.

## n151 - one picture per featured paper

14 featured papers: **13 render a real figure, 1 renders the generated tile**
(`horvath-2024-teaching`, "Teaching Aspects of ROS 2 and Autonomous Vehicles" -
`docs/media/THUMBS.md` records it as "NONE - needs a manual image").

The tile is a miniature section header built from the page's own structural
language, not a graphic: the 4px index marker and a mono `2024 · Journal
article` eyebrow over the venue set in display type, laid on `paper-100` with
the hairline column guides `Section guides` already uses. It is
`aria-hidden` because the card states the same three facts in text, so a
screen reader hears one card, not a duplicate. Reviewed on screen at 1440,
768 and 390 (`research-tile-*.png`): the venue fills the plate at every width
(display size, wrapping to two lines; a venue over 26 characters drops to lead
size so it cannot outgrow the box).

Three records point `thumbnail` at a file that is not on disk
(`wachter-2026-spatially`, `trumpp-2024-racemop`, `loetscher-2023-assessing` -
the files are named `-fig-1200.webp`, the records say `-1200.webp`). The
fallback chain means all three still show their `figure`, so nothing is
broken on screen; the data fix is logged for the director in
`docs/qa/requests-research.md`.

**Every one of the 10 topic chips was clicked and checked. None lands on an
empty grid.** Featured per chip: reinforcement learning 4, planning 2,
raceline optimization 2, control and MPC 4, perception and state estimation 1,
sim-to-real 2, multi-agent 3, safety 2, systems and platform 5, education 1.

## n152 - a resolvable link for every paper

Reused the sources in `scripts/resolve_paper.py` (Crossref bibliographic
search, OpenAlex, Semantic Scholar) under a strict gate: folded title
similarity >= 0.90 **and** year within 1 **and** the first author's surname
present in the candidate. 40 of the 41 automatic hits matched at similarity
1.0.

| Route | Count |
|---|---|
| Automatic, strict gate | 41 |
| Second pass with a corrected query | 4 (`w-kegrzynowski`, `joglekar`, `agnihotri`, `almeida`) |
| CTU DSpace handle | 3 (`vajnar`, `dusil`, `kerner`) |
| **Linked** | **48** |
| Unlinked, renders with the mono tag | 1 |

The one that stays unlinked is `tanmay-vilas-samak-2024-ea`, "A Scalable and
Parallelizable Digital Twin Framework for Sustainable Sim2Real Transition of
Multi-Agent Reinforcement Learning Systems". It is absent from Crossref,
OpenAlex, arXiv and Semantic Scholar as of 2026-08-23, and its upstream
bibtex entry is corrupt (it reuses the key `raman2018empowering` and copies
the ASME volume and page numbers from the entry above it). **No link was
invented.** It renders as plain text with a mono `no link on file` tag and a
`find on Scholar` search, in both the card and the row, so the entry is not a
dead end.

Reachability, all 209 distinct external URLs the page renders: **0 broken.**
184 answered 2xx/3xx to a scripted request; 25 answered 403 (ACM, MDPI,
Wiley/IET, ScienceDirect, handle.net, and doi.org for those DOIs) because
they challenge non-browser clients. A dozen of those were re-checked in
headless Chromium: the handles resolve to the exact records
(`hdl.handle.net/10400.22/15485` -> recipp.ipp.pt -> "Implementing and Tuning
an Autonomous Racing Car Testbed"; `hdl.handle.net/10467/68472` ->
dspace.cvut.cz -> "Model car for the F1/10 autonomous car racing
competition") and the publisher DOIs land on their own article pages behind a
Cloudflare interstitial. Evidence: `s4-linkcheck.json` in the session
scratchpad.

## n153 - the scrape artifacts

A general pass, not a whitelist: LaTeX accent commands (including `\k`
ogonek and the `\i` dotless form the old table missed), ligature and escaped
characters, `$...$` math with its font macros unwrapped, HTML entities and
tags, stray braces, the LaTeX `~` non-breaking space, Scholar's trailing
truncation ellipsis, whitespace and NFC normalisation, and a leading
publisher `Abstract` label.

**14 records changed under the sweep, 15 fields**: 3 titles (the OPSEC
distribution statement on `joglekar-2023-data`, plus `watson-2025-scenario`
and `preto-2025-follow` carrying raw tabs, newlines or `~`), 2 author lists
(`Jan W\kegrzynowski` -> `Jan Węgrzynowski`, `Bc Jiř\'\i Kerner` ->
`Jiří Kerner`), 2 venues, and 8 abstracts carrying LaTeX math. Three of those
abstracts took a second corrective pass: `trumpp-2026-efficient` was
re-fetched verbatim from arXiv 2603.12960 and re-swept after the math spacing
rule was fixed (`$α$-RPO` had become `α -RPO`), and `mao-2026-overtaking` and
`chandra-2025-deadlock` lost a leading publisher `Abstract` label. A residue
scan over all 133 records for `\ { } $`, HTML entities and HTML tags now
returns **0 hits**.

Counting the restorations and the link patches below, **57 of the 133 records
changed**. Titles changed in total: **8** (3 from the sweep, 5 restored).

**Nine records were restored from their source record** on top of the sweep,
each with the source written into `notes`:

| id | restored | source |
|---|---|---|
| `vajnar-2017-model` | title "Model car for the **F1/10** autonomous car racing competition", venue, link | CTU DSpace handle 10467/68472, dc.type master thesis, issued 2017-05-26 |
| `dusil-2019-slip` | title "Slip detection for **F1/10** model car", venue, type, link | CTU DSpace handle 10467/82910, dc.type bachelor thesis, issued 2019-06-12 |
| `kerner-2017-software` | author, venue, type, link | CTU DSpace handle 10467/68602 |
| `joglekar-2023-data` | title (OPSEC statement removed), 9 authors, DOI | Crossref 10.1109/iros55552.2023.10341797 |
| `agnihotri-2020-teaching` | title, authors, venue, type, DOI | Crossref 10.1145/3328778.3366796 (SIGCSE '20) |
| `almeida-2019-implementing` | title ("Tesbed" -> "Testbed"), type, link | OpenAlex, hdl 10400.22/15485 |
| `guedes-2019-robotic` | type, link | OpenAlex, hdl 10400.22/15647 |
| `w-kegrzynowski-2024-learning` | authors, DOI | Crossref 10.1109/iros58592.2024.10802481 |
| `tanmay-vilas-samak-2024-ea` | title (stray leading "E", missing "Reinforcement Learning"), author order | upstream `pub.bibtex` field |

**The two CTU theses.** The upstream `f1tenth/roborace_publications/pub.bibtex`
is itself wrong: the rename to RoboRacer was applied to it retroactively, so
the bibtex is not the source record. CTU's own repository is. Both English
titles above come from `dc.title` on the DSpace record, confirmed a second
time by loading the handle in a browser.

`scripts/validate-publications.py` and `--strict` both pass:
133 items, 133 published, 14 featured, 0 candidates, OK.

## Definition of done

| Check | Result |
|---|---|
| `npx tsc --noEmit -p tsconfig.app.json` | pass |
| `npx eslint src/pages/Research.tsx src/components/research src/lib/publications.ts` | pass, 0 problems |
| `npm run build` | not run - three builders share `dist/` this session; the director runs it |
| 1440 / 768 / 390 reviewed | yes, plus the tile at each width |
| Landscape | yes, 844x390 |
| Console errors | 0 at every viewport, with and without reduced motion |
| axe (4.10.2) | 0 violations at 1440, 768 and 390 - not just 0 serious or critical |
| Reduced motion | verified: same page height (21610 px) as motion-ok, all content present, `Reveal` is the only motion and it degrades to static |
| JS disabled | the site-wide `<noscript>` block in `index.html` renders and is readable; the SPA itself cannot render without JS. See the request below |
| One `h1` and a document title | 1 `h1`, `Research - RoboRacer`; heading order h1 -> h2 -> h3 -> h4 with no skips |
| Images lazy with dimensions | 15 images, 0 without `width`/`height`, 0 broken, 13 lazy (the 2 eager are the footer logos, not this page) |
| Layout shift | CLS 0.000034 |
| Anchors | 0 without `href`, 0 `target="_blank"` without `rel="noopener"` |
| External links resolve | 209 checked, 0 broken |
| Data validated | `scripts/validate-publications.py` and `--strict`: OK |

## Screenshots

`/home/cedric/Documents/UPenn/xLAB/Roboracer/roboracer-site/docs/qa/research/`
(`docs/qa/**/*.png` is git-ignored, so these stay on this machine)

- `research-desktop-1440.png` (1440 x 21610)
- `research-tablet-768.png` (768 x 24533)
- `research-mobile-390.png` (390, capped at 30000)
- `research-landscape-844x390.png` (844 x 24185)
- `research-reduced-motion-1440.png`
- `research-nojs-1440.png`
- `research-tile-1440.png`, `research-tile-768.png`, `research-tile-390.png` - the Education chip, where the generated tile is the only card
- `axe-1440.json`, `axe-768.json`, `axe-390-education.json`

## Decisions taken alone

1. **The research card lives in `src/components/research/`, not in
   `src/components/ui/`.** `ui/PublicationCard.tsx` is director-owned this
   session, and the card needed three research-specific changes (a picture on
   every card, the runtime figure fallback, the unlinked case). That leaves
   `ui/PublicationCard.tsx` used only by `/styleguide`, which CLAUDE.md rule
   10 does not allow to stand. `docs/qa/requests-research.md` asks the
   director to delete it and repoint the styleguide.
2. **The all-curated list keeps its rows and gets no pictures.** Cedric's note
   is scoped to curated *featured* papers in the pages v2 plan, there is no
   media for the other 119, and 133 thumbnails would bury the list. The rows
   keep the mono venue and topic line.
3. **The unlinked case gets a Scholar search next to the tag.** The brief asks
   for unlinked text plus a mono tag; a row whose only affordance is its link
   is otherwise a dead end. `find on Scholar` is a search, never a claim about
   where the paper lives.
4. **The tile repeats the venue that the card meta line also states.** Cedric
   asked for venue and year on the tile. The repetition is what makes it read
   as a catalogue plate rather than a caption; flagged here rather than
   silently dropped.
5. **`almeida-2019-implementing` and `guedes-2019-robotic` keep an empty
   venue.** Their handles resolve to IPP's repository, but the degree-granting
   school is not in the metadata, so nothing was asserted. The row falls back
   to "Thesis".
6. **`tanmay-vilas-samak-2024-ea` keeps its id** even though the id is built
   from the wrong first author. Ids are slugs, not facts, and other files
   reference them.

## Known gaps, for the director

- Three `thumbnail` paths point at files that are not on disk (table in
  `docs/qa/requests-research.md`). Harmless on screen, wrong crop rendered.
- `src/components/ui/ResearchCarousel.tsx:162` uses `text-display-s`, which is
  not declared in `src/index.css`. Director-owned file, landing page.
- The `<noscript>` block in `index.html` lists the docs, the code and Slack.
  For `/research` the useful no-JS destination is the Scholar query; one extra
  `<li>` would cover it. Director-owned file.
