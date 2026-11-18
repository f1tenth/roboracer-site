# QA: Vendors band on /build, and where to buy the power board (/assembly)

Branch `revamp/build-vendors`, from `main` at be44473. Asked for by Rahul Mangharam in Slack (pasted by
Cedric, 2026-11-17): "we can add the powerboard under vendors: buy a powerboard from certified RoboRacer
vendors", with a link to one listing in Ambimat's shop. Cedric, the same day: put it on the build page
for now (the page is not rebuilt yet; whoever picks that up should have something to work with), or a
better spot if there is one, and ship it to roboracer.ai directly. Review server for this QA:
http://localhost:4198/build.

## Where it went, and why

- **/build, above the docs frame: a "Vendors" band.** Rahul's word is "vendors" and the site had no such
  place. A builder meets the power board while ordering parts, which is this page (its docs hold the bill
  of materials). The Ambimat card on /about stays the company feature; this band is the part.
- **/assembly, the power board row: "Where to buy: Ambimat Electronics".** It is the one place on the site
  that names the power board as a part, so the link sits where the part is explained.
- Not added to the landing or to /about: the card there already links the shop ("Order the power board").

## What was built

- **Data** (`public/data/vendors.json`): one vendor (Ambimat Electronics), one product (the power board,
  `part: "pcb"`). Rendered fields: `heading` ("Vendors"), `summary`, the product's `name`, `line`, `order`,
  `links` and `image`. `sources` holds the picture's provenance, the shop's eight listings on 2026-11-17
  (Rahul's is flagged) and the evidence for each statement; it is not rendered and not bundled.
  - line: "Powers the Jetson and the LiDAR. Made by Ambimat Electronics, an official RoboRacer vendor."
    (14 words; "an official vendor" is Cedric's wording for the /about card; "powers the Jetson and the
    LiDAR" is the /assembly part list's own line, from the build guide)
  - button: "Order the power board", to https://orders.ambimat.com/ (the address the /about card and the
    build docs note use). Text link: "Get the design files", to
    https://github.com/f1tenth/f1tenth_powerboard_v10 (our own public repository: manual, schematics,
    bill of materials, layout and manufacturing files).
  - No price, as on the /about card: the shop's prices change.
- **`src/lib/vendors.ts`** imports the file at build time (named imports, so the bookkeeping stays out of
  the bundle: the shared chunk is 825 B) and gives `VENDORS`, the heading, the summary and
  `sellerOfPart(id)`.
- **`src/components/build/VendorBand.tsx`**: the logo gradient as a 3 px top rule, the heading as a
  disclosure button (`aria-expanded`, `aria-controls`), then per product its picture, name, line, the
  solid violet button and the text link. One row from 64rem; stacked below that. Folding it leaves a slim
  bar ("Vendors", and from 40rem "Where to buy the power board"); the choice is remembered in the browser
  (`rr-build-vendors`). On `compact` screens the page's "Open the docs" link rides in the band's heading
  row, so the band replaced the old strip rather than stacking on it.
- **`src/pages/Assembly.tsx`**: a row whose part a vendor sells gets a second link under its build-guide
  link. Both links share one class constant (`ROW_LINK`).

## Media and provenance

| file | size | source |
|---|---|---|
| `public/media/build/build-power-board-360.webp` (360x240) | 20,278 B | Figure 3 ("PCB top view", 762x384) of `Powerboard_v10_1_User_Manual.pdf` in `f1tenth/f1tenth_powerboard_v10`, cropped to its right three quarters (the axis marker in the lower left corner is outside the crop), Lanczos to 360x240, WebP q84 |

The manual is the F1TENTH team's own (PDF author "University of Pennsylvania", June 2024, F1TENTH and
Ambimat logos and a CC BY-SA badge on its first page). Manifest row BV-01. Nothing was taken from
Ambimat's sites for this band.

## What the band costs the docs frame

| window | band open | band folded | frame open / folded |
|---|---|---|---|
| 1440x900 | 76 px | 30 px | 760 / 807 px |
| 1024x768 | 80 px | 30 px | 624 / 675 px |
| 768x1024 | 163 px | 45 px | 789 / 907 px |
| 390x844 | 219 px (was a 45 px strip) | 45 px | 553 / 727 px |
| 360x740 | 240 px | 45 px | 428 / 623 px |

## Checks

- `npm run lint` and `npm run build`: green.
- Layout, Playwright (new-headless Chromium) at 1440x900, 1024x768, 768x1024 and 390x844, and 1920x1080
  for the full-size root: no horizontal overflow, the page stays one window tall, the picture loads at
  every size.
- axe on /build (our own document; the framed docs are Read the Docs' page) at 1440x900, 390x844 and
  1440x900 reduced motion with the band folded, and on /assembly at 1440x900 and 390x844 with the power
  board row open: zero violations of any impact. One `h1` on each.
- Console on /build and /assembly: no errors or warnings from site code; no request to this origin
  answers 400 or above.
- Layout shift on /build over five seconds: 0.0004 at 1440x900 and 390x844 (the band is in the first
  paint).
- Keyboard: Tab goes heading button, "Order the power board", "Get the design files"; Enter and Space
  fold and unfold, focus stays on the button, the fold survives a reload. Every control takes the 2 px
  violet focus ring.
- Links: https://orders.ambimat.com/ and https://github.com/f1tenth/f1tenth_powerboard_v10 answer 200;
  both open in a new tab with `rel="noopener noreferrer"` and say so to a screen reader.
- Reduced motion: the only motion is the chevron's turn and colour transitions; the turn is
  `motion-safe` only.
- Image: `width` and `height` set, alt text present. Not lazy-loaded: it sits at the top of the page.
- Touch: the heading button, the violet button and the text link are 44 px tall on coarse pointers.

Screenshots (git-ignored) in `docs/qa/build-vendors/`: `build-{1440x900,1024x768,768x1024,390x844}.png`,
`build-folded-{1440x900,390x844}.png`, `build-reduced-1440x900.png` and
`assembly-power-board-{1440x900,390x844}.png`.

## Open questions for Cedric

1. The button goes to the shop's front page, where the eight power board listings are (one board or
   three, RoHS or not, standard or high current). Rahul's link was one of them, the three-board Non-RoHS
   pack. Sending every builder to a three-board pack seemed wrong; say so if his exact listing is wanted
   (one line in `vendors.json`, `order.href`).
2. "Certified" (Rahul's word in this thread) or "official" (your ruling for the /about card)? The band
   says "an official RoboRacer vendor".
3. On a phone the open band takes 219 px above the docs. It folds and stays folded; should it start
   folded on phones?
4. The band's violet button sits under the nav's violet "Start here": two solid violet buttons in one
   viewport, the same open point as on the other pages (HANDOFF section 2, item 1).
5. The /assembly row still says "Both take 12 V from its terminals"; the board's manual gives the Jetson
   a 19 V jack. Not changed here.
