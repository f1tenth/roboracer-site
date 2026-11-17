# QA: Ambimat Electronics under Related platforms (/about)

Branch `revamp/platform-ambimat`, from `main` at 9e63ae0. Asked for by Rahul Mangharam in Slack (pasted by
Cedric, 2026-11-17): "Let's list Ambimat in Related Platforms in the About page ... You are the official
vendor for RoboRacer. List at the top." Neel Shah of Ambimat then gave orders.ambimat.com as the shop and
asked that the official BOM point there for the power board. Cedric, the same day: make the card look as
good as the other three, with their website featured. Review server for this QA:
http://localhost:4196/about#about-spinoffs.

## What was built

- **Entry** (`public/data/spinoffs.json`, first in `entries`): kind `company`, label "official vendor", no
  `since` (beside that label "since 1982" would date the vendor role, not the company).
  - what: "An electronics company in Ahmedabad, India, since 1982. Its RoboRacer Core Kit is the car,
    assembled and tested. Its shop sells the power board." (24 words)
  - and RoboRacer: "The official vendor for RoboRacer. Ambimat designed the car's power board with Penn's
    xLAB in 2024."
  - Both are our own words from the pages in the entry's `evidence` (ambimat.com, roboracer.ambimat.com,
    orders.ambimat.com, the power board repo and our own 2024 news item). No price on the card: the shop's
    prices change, and the news item left them out too.
- **Three slots, like the other cards:** Ambimat's mark beside the name, its kit photo as the stage, and a
  window onto roboracer.ambimat.com (their RoboRacer homepage) that links there.
- **Two text links:** "See the RoboRacer Core Kit" (their kit guide) and "Order the power board"
  (https://orders.ambimat.com/). The second comes from a new optional field, `links` (label and url), on
  any entry; `SpinoffGrid` draws the car or video link and then each of `links` through one small
  `OutLink`, so the existing link markup is not duplicated. The other three cards are unchanged.
- **Kit photo fit.** The stage is 16:9 on a wide card with the site window overlapping its lower right, and
  3:2 when the card stacks. The photo's canvas is 1260x700 with the car centred in its left 3:2, and the
  stage image is now `object-left`: wide, the whole canvas shows and the car sits left of centre, clear of
  the window; stacked, the left 3:2 shows and the car is centred. The other two cars' canvases are exactly
  3:2 (1200x800), so nothing of theirs overflows sideways in either stage and `object-left` moves nothing.
- **Section.** Four cards now sit two by two from `desktop:`, so Dzik no longer spans the grid. Subtitle:
  "The official vendor, and how other small-scale cars relate to RoboRacer" (was "Other small-scale cars,
  and how they relate to RoboRacer"; Ambimat sells the RoboRacer car itself). The loading placeholder's
  min-heights were re-measured for four cards: 122rem (768x1024), 108rem (1024x768), 112.5rem (1440x900),
  228.5rem (390x844), in the root's own rem (12px at the two middle sizes).

## Media and provenance

Requested by Rahul with Ambimat in the thread; Neel has not been asked for these files by name. Manifest
rows SP-11 to SP-13 in `docs/ASSET_MANIFEST.md`.

| file | size | source |
|---|---|---|
| `public/media/spinoffs/spinoff-ambimat-icon-48.webp` (53x48) | 972 B | the red mark cropped from `https://ambimat.com/wp-content/uploads/2017/07/ambimat-logo.png` (209x48), native size |
| `public/media/spinoffs/spinoff-ambimat-kit-1260.webp` (1260x700) | 80,104 B | `https://roboracer.ambimat.com/assets/img/roboracer-core-kit-cutout.png` (600x800), the car at native size on a clear canvas, with a soft ground shadow added |
| `public/media/spinoffs/spinoff-ambimat-site-960.webp` (960x600) | 58,776 B | our Playwright capture of `https://roboracer.ambimat.com/` at 1280x800 |

Two limits of what is public today:

- The only Ambimat logo online is 48 px tall, so the mark is 48 px where the other cards' marks are 96. It
  draws at 24 to 32 px, which is sharp at 1x and a little soft on a 3x phone. A vector logo fixes it.
- Ambimat's own page captions the kit photo "Reference image, earlier RoboRacer chassis shown"; current
  kits use the Traxxas Slash 4X4 Brushless. The alt text describes what the picture shows and does not
  call it the current kit. A landscape photo of the current kit would replace it.

## The BOM

- The official BOM is not a file in a repo. The build docs page
  (`getting_started/build_car/bom.rst` in `f1tenth/f1tenth_doc`, live at
  https://f1tenth.readthedocs.io/en/main/getting_started/build_car/bom.html) frames a published Google
  Sheet, `Master BOM.xlsx` (Drive id `1WT-UdjLTnyrb7CvHcuCxKLnRIN8DWroQ`, shared drive, last edited by Ahmad
  Amine on 2026-10-23). Cedric's Drive account opens it read-only.
- Its `Powerboard` row (tab `Rally + Orin Nano`, section Electronics, $125.00) already links Ambimat's
  shop, through an old address: `https://orders.ambimat.com/product/f1tenth-power-board-rohs-com-multipliant/`.
  That address answers 301 to the pack of three RoHS boards. **To do by someone who can edit the sheet:**
  change the link to `https://orders.ambimat.com/`, and check the price ($125.00 is today's per-board price
  in the RoHS pack of three; one board is $145 non-RoHS or $165 RoHS).
- Done here: https://github.com/f1tenth/f1tenth_doc/pull/86 adds one note to the BOM page, above the
  table: Ambimat is the official RoboRacer vendor, order the Powerboard from orders.ambimat.com, and the
  car is sold assembled as the RoboRacer Core Kit. The page parses with docutils without warnings. Nothing
  else in the docs links a place to buy the board.
- Seen, not changed: the README of `f1tenth/f1tenth_powerboard_v10` links
  `https://orders.ambimat.com/product/f1tenth-power-board/`, which also redirects (to the non-RoHS pack of
  three).

## Checks

- `npm run lint` and `npm run build`: green.
- Layout, Playwright (new-headless Chromium) at 1440x900, 1024x768, 768x1024 and 390x844: Ambimat is the
  first card, eyebrow "official vendor"; no horizontal overflow; every image in the section loads. Card
  sizes at 1440: four of 648 px wide, rows 639 and 691 px tall. The window clears the kit at 1440; at 1024
  its corner covers the last few pixels of the front bumper.
- axe on /about at 1440x900, 390x844 and 1440x900 reduced motion: zero violations of any impact. One `h1`.
- Console on /about: no errors. The only warning, "No available adapters.", comes from inside the YouTube
  player on Dzik's card (its WebGPU probe in headless Chromium), as before. No request answers 400 or
  above.
- Layout shift on /about through a full scroll: 0.0014 (1440), 0.002 (390), 0.0003 (reduced motion).
- Keyboard: both text links take the 2px violet focus ring (`ambimat-focus-board.png`); all three links
  open in a new tab with `rel="noopener noreferrer"` and say so to a screen reader.
- Images: `width` and `height` set, `loading="lazy"`, alt text on all three.
- Links: https://roboracer.ambimat.com/, https://roboracer.ambimat.com/autonomous-racing-robotics-kit.html
  and https://orders.ambimat.com/ answer 200.
- Reduced motion: the card has no motion of its own beyond the shared reveal and the hover scale, both
  already gated (`section-1440x900-reduced.png`).

Screenshots (git-ignored) in `docs/qa/platform-ambimat/`: `section-{1440x900,1024x768,768x1024,390x844}.png`,
`section-1440x900-reduced.png`, the same for the card alone (`ambimat-*.png`) and `ambimat-focus-board.png`.
The fixed nav is hidden in these captures only, so it is not painted across the card.

## Open questions for Cedric

1. Two links on the card: the kit guide and the shop. Should the window go to the shop
   (orders.ambimat.com) instead of roboracer.ambimat.com?
2. The subtitle now names the vendor. Keep it, or go back to the old line?
3. Ambimat is the first of four, so the grid is two by two. Give it the full width as a lead card instead?
4. Permission: ask Neel to confirm the logo, kit photo and homepage capture, and for a vector logo and a
   landscape photo of the current kit (the reply drafted for Neel asks).
5. CLAUDE.md rule 8 and the media skill still name only Neobotics and Quanser in the exception; this
   section now carries Dzik and Ambimat on the same terms. Extend the wording?
6. The sheet's Powerboard cell needs an editor (Ahmad, or you from an account with edit rights).
7. The power board repo's README link: fix it in a small PR?
