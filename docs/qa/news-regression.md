# /news regression review (2026-08-23)

Independent review of the director's post-builder edits. Baseline: `git show 58c6a8c:src/pages/News.tsx`
plus the builder's own intent in `docs/qa/news.md`. Evidence captured from the live dev server on
:4180 at 1440, 1600 and 390; screenshots in `docs/qa/news-regression/`.

**First correction to the brief: the cards did not get smaller.** Builder layout was `md:grid-cols-2`
inside `md:col-span-10` of a 1152px container = **448px** cards. Current layout is `md:grid-cols-3`
inside 1600px = **501px** cards (568px once the 1800px cap is reached). Pictures are 12 to 27 percent
wider than the builder shipped. The width change delivered exactly what Cedric asked for. The damage
is elsewhere: **row completeness, the lead block, and heading hierarchy.**

---

## 1. Four orphan grid cells where there were zero. REVERT the column count.

The archive holds 20 items across four year groups: 2026 (14), 2024 (2), 2023 (2), 2020 (2).

| year | items | 2-up (builder) | 3-up (now) |
|---|---|---|---|
| 2026 | 14 | 7 full rows, 0 empty cells | 4 full rows + 2 of 3, **1 empty cell** |
| 2024 | 2 | 1 full row | 2 of 3, **1 empty cell** |
| 2023 | 2 | 1 full row | 2 of 3, **1 empty cell** |
| 2020 | 2 | 1 full row | 2 of 3, **1 empty cell** |

Evidence: `news-1600-04.png` (2026 tail, 501x578 hole on the right), `news-1600-05.png` (2024 and 2023
back to back, the right third of the page empty for ~1500px of scroll). The data shape is three
consecutive two-item years. A three-column grid is the one column count that breaks on every single
one of them. Two columns fits all four groups perfectly, and always did.

**Fix:** `md:grid-cols-2 lg:grid-cols-3` is not enough, it just moves the hole to large screens.
Either go back to `md:grid-cols-2` at full page width (cards become ~764px, pictures bigger still than
the 3-up ones, and every row is full), or keep 3-up and accept it only for 2026 by letting the short
years fall back: `className={group.length % 3 === 0 || group.length > 6 ? "md:grid-cols-3" : "md:grid-cols-2"}`.
My recommendation is the first: **2-up at page width**. It gives Cedric bigger pictures *and* full rows.

## 2. The lead story is a 1552px x 343px band, not a lead. ADJUST.

`news-1600-00.png`. The featured item (IROS registration) has no image, so `NewsLead` renders its
no-picture branch. The builder wrote in `docs/qa/news.md` #5: *"A lead story with no picture was a thin
text column. It is a ruled panel"* - the panel was engineered to work at 1152px. Stretched to 1552px
(1752px at the cap) the same panel is 4.5:1 and reads as a notice bar or a cookie banner, not as the
top story. Its 7/5 split leaves the headline ending at x=880 and the body starting at x=948, with the
excerpt capped at `max-w-[52ch]`, so the panel's right 5 percent is dead.

**Fix:** cap the lead. `NewsLead`'s no-image branch should sit in a `max-w-content` (72rem) wrapper, or
the masthead `<Section>` should stay at the default `content` width. Do not widen a block whose own
content is capped at 52ch.

## 3. The archive `h3` year is the same size as the archive `h2`. ADJUST.

Measured: `h2 "Every year so far"` = **44px**, `h3 "2026"` = **44px** (`news-1600-metrics.json`,
`news-1440-metrics.json`). Both `text-display-m`, both `font-display font-semibold`, both flush left,
~150px apart vertically (`news-1600-01.png`). The year does not read as a subordinate index, it reads
as a second section title, and the reader briefly thinks the page started a new chapter.

**Fix:** keep the bigger year Cedric asked for but stop the tie. Cheapest: give the archive
`SectionHeader` a `lead` line (it currently has eyebrow + title and nothing else, unlike Research which
has a lead *and* a search field, which is why the same 44px year does not collide there). Second
option: year at `text-display-m` in `text-text-muted` with `font-mono`, which also matches the site's
"data and captions in mono" rule.

## 4. Losing the sticky rail cost real wayfinding in the 2026 group only. ADJUST.

Four year groups, every card already carries a date, so the rail was not load-bearing for 2024/2023/2020.
But 2026 holds 14 of the 20 items and runs ~2900px at 1600 (five card rows). The sticky rail held "2026"
in view for that whole run; the heading now scrolls out after the first row and never comes back.

**Fix:** do not restore the two-column rail (it did cost a sixth of the page, the director was right
about that). Make the full-width heading sticky instead: `md:sticky md:top-24 z-10 bg-paper-100 py-2`
on the `h3` inside the `edge` section. Same wayfinding, none of the width cost.

## 5. Vertical whitespace between the lead and the first card. ADJUST (pre-existing, amplified).

`news-1440-01.png` is a near-empty viewport: masthead `py-section` bottom + archive `py-section` top +
`SectionHeader mb-12` + chips + count line + `py-10` + the 44px year. Roughly 640px of low-density page
at 1440 between the last word of the lead and the first card. Widening did not cause this, but at
1552px the empty band is 2.4x the area it was at 1152px, so it now reads as a mistake.

**Fix:** `tight` on the archive `<Section>`, and drop the year block's `py-10` to `pt-6 pb-10`.

## 6. The masthead at page width. KEEP.

`news-1600-00.png`. The h1 wraps to two lines ending at x=866 (`max-w-[18ch]`, 88px), the ledger sits
right-aligned in `md:col-span-4` from x=1085. The 219px gulf between them is the same asymmetric
5/7-ish split Research uses, and it holds. The h1 does look bare now that the deck paragraph is gone
(builder had one, `docs/qa/news.md` line 11), but that is a content gap, not a width failure: **do not
revert the copy, add one deck line under the h1** or nothing at all. It is the weakest of the six items.

---

## What is genuinely better now

- Pictures are 12 to 27 percent larger and start at the left page edge, which is exactly the request.
- The text cards hold up fine at 3-up: excerpt measure is 451px at 14px, about 62ch, inside the
  comfortable band and unchanged from the builder's 448px cards. The "text cards look broken" worry
  is not supported by the captures; what looks broken is the empty cell next to them.
- The mono year rail was genuinely weak wayfinding for a four-year feed. A real heading is the right
  instinct; only the size collision is wrong.
- Mobile (390) is untouched by all of this: `grid-cols-3` never applies, the page is identical to the
  builder's. `news-390-*.png`.

## Why Research survived the identical change

Three structural reasons, in order of importance:

1. **Research's year groups are `<ul>` rows, not a card grid.** `PaperRow` spans the full container,
   so there is no column count and therefore no orphan cell. Every row is full by construction at any
   width. News put a 3-column grid under the same heading and inherited a remainder problem.
2. **Research's card grid (Selected papers) is `md:grid-cols-2 lg:grid-cols-3` over ~25 featured items
   with a figure on every one** - uniform 627px cards, no ragged bottoms, and the remainder is one row
   out of nine rather than one row out of two. `research-1600-04.png` vs `news-1600-05.png`.
3. **Research's archive `SectionHeader` carries a lead paragraph and a search input**, so the header
   block outweighs the 44px year beneath it. News's archive header is a bare title, so the year ties it.

Same tokens, same widths, different content shape. The change was correct for a list of papers and
wrong for a sparse grid of dated cards.

---

**Verdict: the width is right and the pictures are right; revert the archive to two columns, cap the
lead panel, and break the h2/h3 size tie - three edits, no redesign.**
