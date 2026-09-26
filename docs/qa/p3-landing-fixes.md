# QA: p3-landing-fixes (research figure height, Join balance), 2026-09-25

Branch `revamp/p3-landing-fixes`. Dev server on 4187. Captures (git-ignored
PNGs) in `docs/qa/p3-landing-fixes/`: `research-{before,after}-<w>x<h>.png`,
`join-{before,after}-<w>x<h>.png`, `-rm` = reduced motion, `-about` = /about,
`join-after-focus-*` = keyboard focus ring.

## A. Research carousel: the figure fills its pane

Cedric: "the image doesn't take enough of the height ... a lot of grey area
on top and below ... on my laptop, not on my phone".

**Root cause.** The active card on the desktop stage was a fixed 35rem-tall
box only about 1.07x as wide as tall, and its figure pane got 5/9 of that
width (2/5 under xl): a tall, thin pane. Every figure is a 16:10 canvas
(`scripts/paper_thumbs.py`), so with `object-contain` its height was set by
the pane's width: 142 of 446 px at 1536x730. The card stayed at its minimum
width because the fit measured `row.clientWidth`, which includes the row's
px-6 padding, so all ten side strips always "fit". The root font clamp was
not the cause: it scales everything equally, so every desktop size (1366 to
1920, and the 768 tablet stage) had the same third-of-the-height figure. The
phone was fine because its pane is already `aspect-[16/10]`.

**Fix** (`src/components/ui/ResearchCarousel.tsx`). The figure pane is the
figure's own 16:10 at the card's full height, the text pane takes the rest
and never goes under 26rem, and the strips the row cannot fit beside both are
dropped from the edges inward (Cedric's earlier "min aspect on the article
of interest" rule). The fit reads the row's content box. A row too narrow for
both panes stacks the figure over a 25rem text block when the window has room
for the whole card (portrait tablet), otherwise the side-by-side card gets
shorter (never under 22rem). Phones: the figure fills its 16:10 box edge to
edge (the p-4 mat is gone); a landscape phone gets a 16:10 pane up to 58% of
the card on paper-50. `rankOf` gave the first and last papers the same rank
(one strip too many at the ends once fewer strips show); ranks are now unique.
The abstract gets seven lines in the wider text pane.

Figure height / pane height (figure drawn with object-contain), paper 1:

| viewport | before: card, pane, figure | fill | after: card, pane, figure | fill |
|---|---|---|---|---|
| 1536x730 | 480x448, 266x446, 227x142 | 0.32 | 1091x448, 714x446, 713x445 | 1.00 |
| 1366x650 | 511x420, 283x418, 247x154 | 0.37 | 1057x420, 669x418, 668x417 | 1.00 |
| 1440x900 | 450x420, 249x418, 213x133 | 0.32 | 1022x420, 669x418, 668x417 | 1.00 |
| 1920x1080 | 600x560, 332x558, 284x178 | 0.32 | 1363x560, 893x558, 892x557 | 1.00 |
| 390x844 | 335x710, 333x220, 301x188 | 0.85 | 335x699, 333x209, 333x208 | 0.99 |
| 768x1024 | 636x560, 254x558, 214x133 | 0.24 | 636x798 (stacked), 634x397, 634x396 | 1.00 |
| 844x390 | 726x302, 290x300, 258x161 | 0.54 | 726x302, 420x300, 419x262 | 0.87 |
| 1024x768 touch | not captured | | 976x352, 558x350, 557x348 | 0.99 |

Side strips shown: 4 at 1536 and 1920, 3 at 1366 and 1280x800, 9 at 2560,
1 at 768x1024, 0 at 1024x768 and 900x700 (was 10 everywhere).

Stepping through all 11 papers with the arrow (1536x730, 1366x650, 1920x1080,
768x1024, 1280x800, 1024x768, 2560x1440, 900x700): figure fill 1.00 on every
paper (0.77 only at 900x700, where the card is floored at 22rem), no document
horizontal overflow, the text pane never overflows its box, zero console
errors. ArrowLeft/ArrowRight and the arrow buttons still move the stage.
Reduced motion (1536x730, 390x844, 768x1024): same layout, no transitions,
same fill.

## B. Join: the copy column leads

Cedric: "the image is too big with respect to the text, which is basically
empty".

`src/components/ui/CommunityJoin.tsx`: the copy column now takes 7 of 12
columns and reads top-down: a header lead on who is there ("Students,
researchers and engineers at more than 90 universities in over 20 countries
build the car, race it and publish on it" - counts and roles from the content
skill), the Slack card (live members and time zones from community.json,
update date, the one solid violet CTA), "Also on" as a ruled index list
(LinkedIn, Instagram, GitHub: name, handle, glyph in the logo gradient; the
whole row is the link), then "Write to us" with the contact address. The
Korea photo is a 5-column supporting column with its caption (about half the
area it had: 562x448 vs 810x634 at 1536x730) and follows the copy on a
phone. The "From the community" strip and the ICRA reel below are unchanged.
`SocialButton.tsx` exports its glyph as `SocialGlyph` for the list.

VerifyTag: import and the `caption_verify` usage removed from
CommunityJoin.tsx (the field stays in `lib/data.ts` and community.json, as
briefed). The `index` prop API is unchanged; /about still renders it as
`index="07"` with `showYouTube={false}` (captured at 1536x730 and 390x844).

Checked at 1536x730, 1366x650, 1440x900, 1920x1080, 390x844, 768x1024,
844x390 on /, plus /about at 1536x730 and 390x844: no horizontal overflow,
one h1, zero console errors. Keyboard: Slack button -> LinkedIn row ->
Instagram row -> GitHub row -> email, each with the 2px violet focus ring;
rows are 46 px tall with a mouse, 66 px on touch. axe (wcag2a/2aa/21aa) on
`#join` and on the carousel: zero violations, / and /about, desktop and
phone with reduced motion. The channel rows carry `aria-label="LinkedIn: The
Roboracer Foundation"` etc. (the flex spans otherwise read run together).

## Lint and build

`npm run lint` clean; `npm run build` passes (only the long-standing
RacecarAssembly chunk-size warning).

## Left open

- The Korea photo caption used to carry a verify tag (`caption_verify: true`);
  it now shows plainly. Cedric to confirm the caption.
- LinkedIn handle "The Roboracer Foundation" is the page's own title; the
  existing TODO(content) to confirm that page stands.
