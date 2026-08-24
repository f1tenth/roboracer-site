# /news - second opinion (independent)

2026-08-23. Read-only pass on `http://localhost:4180/news`, judged as a reader
first, then against `/research`, `/race` and the `roboracer-design-system` skill.
Written without reading the regression diff.
Captures: `/tmp/.../scratchpad/so/news{1440,1600,390}-*.png`, `res1440-*.png`.
Measurements: `news1440.json`, `m2.py` output (quoted inline).

## The reader's version first

The page opens with a very good headline, a clean mono ledger, and then makes a
reader scroll **1,603 px past a page with 13 photographs on it before showing
one**. The archive under it is a three-up card grid that this feed cannot fill:
8 of the 21 items have no picture, and three of the four year groups have
exactly two items. So the page keeps making the same shape and keeps leaving a
hole where the third one should be. That, not the 1800 px container, is why it
reads worse than `/research` - `/research` uses the same width and the same
display-m year, but **never renders a holed row**.

---

## 1. The archive grid is a shape this feed cannot fill

**Measured, 1440 (`m2.py`, `yearGroups`):**

| Year | Items | Section height | Card bottom edges (page px) |
|---|---|---|---|
| 2026 | 14 | 3031 px | 1846 / **2147 / 2147** - first row ragged by **301 px** |
| 2024 | 2 | 453 px | 4874 / 4937 - ragged by 63 px, **third column empty (472 px)** |
| 2023 | 2 | 453 px | 5390 / 5374 - **third column empty** |
| 2020 | 2 | 384 px | 5775 / 5774 - **third column empty** |

Card width is 448 px at 1440 and 501 px at 1600, so the empty column is 472 px
and 525 px of dead paper, repeated three times. **1,290 px - 19 % of the
6,906 px document - is spent presenting six links.** The rag comes from
`NewsCard.tsx:99` (`image ? "h-full" : "self-start"`), which is the right call
inside a row but guarantees the row has no bottom edge, so the mono credit lines
float at 361 px vs 424 px in the 2024 row (`news1440-5.png`).

`/research` solved the same "half our items have no picture" problem twice and
both answers guarantee a picture: `PaperCard` falls back to a generated venue
tile, and `PaperRow` (`src/components/research/PaperRow.tsx:31-60`) carries a
`w-[120px] … lg:w-[320px]` 16:10 thumb with a `/logo-square.svg` placeholder at
25 % opacity - explicitly so the list "reads as one quiet repeated shape".

**Fix, in the existing system.** Make the archive the `/research` all-curated
list, not a card grid.
- `src/pages/News.tsx:176-177`: replace `<Reveal … className="grid gap-6
  md:grid-cols-3">` with `<Reveal … as="ul" className="divide-y
  divide-ink-950/10 border-t border-ink-950/10">` - the exact wrapper
  `Research.tsx:253` already uses.
- `src/components/news/NewsCard.tsx:99-129`: render the `<li>` shape of
  `PaperRow.tsx:79` (`grid gap-3 py-7 md:grid-cols-[1fr_auto] md:gap-8`) and
  reuse its `RowThumb` box verbatim, with the same `/logo-square.svg` fallback
  for the 8 picture-less items. No new token, no new card, no new colour.
- This is the only proposal here that survives the feed doubling: `/research`
  runs ~100 rows through it (43,665 px doc) and never rags.

## 2. A news page for a racing community shows no photograph until 1,603 px

**Measured:** `firstImgTop = 1603`, `firstImgSrc = post-knapp-538432-800.webp`,
`imgCount = 13`. At 900 px tall that is **1.8 full viewports of pure type**
before the first picture. The masthead alone is `mastheadH = 1002 px`.

The cause is the lead-story selector, not the design: `News.tsx:46` is
`items.find((i) => i.featured) ?? items[0]`. Four items carry `featured: true`;
`find` returns whichever is first in file order, which today is the IROS
registration deadline - **no picture, and the same fact `/race` already leads
with**. The two `featured` items that do have pictures (Thunderbolt winning IV
2026; the ICRA 2026 results) sit at index 5 and 14. `NewsLead.tsx:64-79` then
does its job well and renders the correct picture-less panel - it is being
handed the wrong story.

**Fix:** `src/pages/News.tsx:46` -> prefer a featured item that has a picture,
falling back to the current behaviour:
`const lead = items.find(i => i.featured && i.image) ?? items.find(i => i.featured) ?? items[0];`
One line, no new component, and `NewsLead`'s picture-less branch stays as the
safety net it was built to be. First image then lands inside the first viewport.

## 3. The masthead is the `/research` masthead with its two best parts removed

Same slot, same grid (`md:col-span-8` + `md:col-span-4` ledger), different
primitives - which is precisely why the page does not feel like a sibling:

| | `/research` | `/news` |
|---|---|---|
| Under the h1 | `text-lead max-w-[60ch]` + secondary `Button` | **nothing** - h1, then a rule |
| Ledger numbers | `StatCounter size="l" tone="accent"` - violet, display-l, counts up 2.5 s | hand-rolled `<dl>`, `font-display text-display-m`, flat ink (`News.tsx:93-116`) |

Measured: the only `text-lead` in the news masthead belongs to the lead story's
excerpt (`m2.py` `leadParas`), and the ledger numbers render at 43.2 px ink -
the *same size and weight as the year heading "2020"* over two items
(`News.tsx:170`) and as the lead story's own h2. Nothing in the top 1,000 px
tells the reader what the page is or ranks anything above anything else.
`/race:141` also carries a `max-w-[60ch] text-lead` under its h1, so news is the
only one of the three without.

**Fix:** `src/pages/News.tsx:83-91` - add the missing `<p className="mt-6
max-w-[60ch] text-lead text-text-body">` (one sentence: what the feed is, where
it comes from, that teams can send theirs). `News.tsx:93-116` - swap the two
counted terms for `<StatCounter as="dl" size="l" tone="accent" duration={2.5}
value={items.length} label="Items" />` and the same for Competitions, keeping
Latest/Oldest as the plain `dt/dd` pair they already are. Identical call site to
`Research.tsx:99-125`.

---

## One change nobody asked for

**Merge the "Contribute" section into the masthead's empty right column, and
give the archive the `/research` search input instead.**

The single solid magenta CTA currently sits at 6,300 px - past the fold on every
viewport, after the reader has already decided to leave. Its own copy ("Tag us
and send us the link, it will go here with your credit on it") is the most
persuasive sentence on the page and it is the last thing anyone sees. `/research`
puts its secondary CTA at 1,000 px, in the masthead, and keeps the solid one at
the bottom - the same two-CTA pattern would work here unchanged.

Worth it because news is the one page whose value compounds with contributions:
21 items over six years is roughly three a year, and 15 of the 21 are from 2026
alone. The page's real job is not to display the feed, it is to grow it. And the
search input (`Research.tsx:216-232`) becomes necessary the moment this feed
doubles - the four competition chips already cannot reach 6 of the 21 items,
which carry no `event` at all.

## Verdict

**Below** `/race` and `/research`: the masthead and the lead are the right
skeleton with the wrong parts in them, but the archive is a three-up card grid
that this feed structurally cannot fill, and `/research` already ships the row
list that solves it.
