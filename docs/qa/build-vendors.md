# QA: Vendors band on /build (cars and the power board), and where to buy the power board (/assembly)

Branches `revamp/build-vendors` (PR #48, merged 2026-11-17 as 26e5590) and `revamp/build-vendors-cars`
(the follow-up below), both from `main`. Asked for by Rahul Mangharam in Slack (pasted by Cedric,
2026-11-17): "we can add the powerboard under vendors: buy a powerboard from certified RoboRacer
vendors", with a link to one listing in Ambimat's shop. Cedric, the same day: put it on the build page
for now (the page is not rebuilt yet; whoever picks that up should have something to work with), or a
better spot if there is one, and ship it to roboracer.ai directly. After seeing the first version live:
"It should not just be power board but cars and powerboard in that notification". Review server for this
QA: http://localhost:4198/build.

## Where it went, and why

- **/build, above the docs frame: a "Vendors" band.** Rahul's word is "vendors" and the site had no such
  place. A builder meets the power board while ordering parts, which is this page (its docs hold the bill
  of materials). The Ambimat card on /about stays the company feature.
- **/assembly, the power board row: "Where to buy: Ambimat Electronics"** and "Get the design files". It
  is the one place on the site that names the power board as a part.
- Not added to the landing or to /about: the card there already links the kit and the shop.

## What was built

- **Data** (`public/data/vendors.json`): one vendor, Ambimat Electronics, with its `standing` ("An
  official RoboRacer vendor.", Cedric's wording for the /about card), and two products in this order:
  - **Ready-built car**: "Sold ready-built as the RoboRacer Core Kit." (the /about card's approved
    wording: Ambimat "sells ready-built cars as the RoboRacer Core Kit"). Button "See the Core Kit", to
    https://roboracer.ambimat.com/autonomous-racing-robotics-kit.html, the page the /about card links.
  - **Power board** (`part: "pcb"`): "Powers the Jetson and the LiDAR." (the /assembly part list's own
    line, from the build guide). Button "Order the power board" ("Order the board" on a phone), to
    https://orders.ambimat.com/, the address the /about card and the build docs note use. `links` holds
    "Get the design files" (https://github.com/f1tenth/f1tenth_powerboard_v10, our own public
    repository), shown on /assembly only.
  - No price, as on the /about card: the shop's prices change.
  - `sources` holds each picture's provenance, the shop's eight power board listings on 2026-11-17
    (Rahul's is flagged) and the evidence for each statement; it is not rendered and not bundled.
- **`src/lib/vendors.ts`** imports the file at build time (named imports, so the bookkeeping stays out of
  the bundle) and gives `VENDORS`, the heading, the summary and `sellerOfPart(id)`.
- **`src/components/build/VendorBand.tsx`**: the logo gradient as a 3 px top rule, the heading as a
  disclosure button (`aria-expanded`, `aria-controls`), the vendor's name and standing once, then one
  tile per product: picture, name, line, and a solid violet button. From 80rem everything is one row;
  from 64rem the vendor's name sits over its two tiles; below that the heading has its own row and the
  tiles are two across from 40rem. On a phone a tile is one line (picture, name, button) and the
  product's line is left out. Folding leaves a slim bar ("Vendors", and from 40rem "Where to buy a
  ready-built car or the power board"); the choice is remembered in the browser (`rr-build-vendors`). On
  `compact` screens the page's "Open the docs" link rides in the band's heading row.
- **`src/pages/Assembly.tsx`**: a row whose part a vendor sells gets "Where to buy: <vendor>" and the
  product's `links` under its build-guide link. All share one class constant (`ROW_LINK`).

## Media and provenance

| file | size | source |
|---|---|---|
| `public/media/build/build-car-360.webp` (360x240) | 8,782 B | our own capture of the /assembly 3D viewer (the site's model of the car, assembled view, default camera, 1600x1000 window), cropped to 720x480 around the car, Lanczos to 360x240, WebP q86 |
| `public/media/build/build-power-board-360.webp` (360x240) | 20,278 B | Figure 3 ("PCB top view", 762x384) of `Powerboard_v10_1_User_Manual.pdf` in `f1tenth/f1tenth_powerboard_v10`, cropped to its right three quarters (the axis marker in the lower left corner is outside the crop), Lanczos to 360x240, WebP q84 |

Manifest rows BV-01 and BV-02. Nothing was taken from Ambimat's sites for this band: rule 8's exception
covers the spinoff features on /about only, so the car tile shows the site's own 3D model and not
Ambimat's kit photo (the alt text says it is a render of a RoboRacer car and does not call it the kit).
The power board's manual is the F1TENTH team's own (PDF author "University of Pennsylvania", June 2024,
F1TENTH and Ambimat logos and a CC BY-SA badge on its first page).

## What the band costs the docs frame

| window | band open | band folded | frame open / folded |
|---|---|---|---|
| 1920x1080 | 100 px | not measured | 895 px open |
| 1440x900 | 76 px | 30 px | 760 / 807 px |
| 1280x800 | 76 px | not measured | 660 px open |
| 1024x768 | 107 px | not measured | 598 px open |
| 768x1024 | 220 px | not measured | 732 px open |
| 390x844 | 200 px (was a 45 px strip) | 45 px | 572 / 727 px |
| 360x740 | 221 px | not measured | 447 px open |
| 320x640 | 243 px | not measured | 325 px open |

## Checks (re-run with both products)

- `npm run lint` and `npm run build`: green.
- Layout, Playwright (new-headless Chromium) at the eight sizes above: no horizontal overflow, the page
  stays one window tall, both pictures load at every size.
- axe on /build (our own document; the framed docs are Read the Docs' page) at 1440x900, 390x844 and
  1440x900 reduced motion with the band folded, and on /assembly at 1440x900 and 390x844 with the power
  board row open: zero violations of any impact. One `h1` on each.
- Console on /build and /assembly: no errors or warnings from site code; no request to this origin
  answers 400 or above.
- Layout shift on /build over five seconds: 0.0004 at 1440x900, 0.0003 at 390x844 (the band is in the
  first paint).
- Keyboard: Tab goes heading button, "See the Core Kit", "Order the power board"; Enter and Space fold
  and unfold, focus stays on the button, the fold survives a reload. Every control takes the 2 px violet
  focus ring (measured on the first version; the classes are unchanged).
- Links: https://roboracer.ambimat.com/autonomous-racing-robotics-kit.html, https://orders.ambimat.com/
  and https://github.com/f1tenth/f1tenth_powerboard_v10 answer 200; all open in a new tab with
  `rel="noopener noreferrer"` and say so to a screen reader.
- Reduced motion: the only motion is the chevron's turn and colour transitions; the turn is
  `motion-safe` only.
- Images: `width` and `height` set, alt text present. Not lazy-loaded: they sit at the top of the page.
- Touch: the heading button and both violet buttons are 44 px tall on coarse pointers (768, 390, 360 and
  320 wide).

Screenshots (git-ignored) in `docs/qa/build-vendors/`: `build-{1440x900,1024x768,768x1024,390x844}.png`,
`build-folded-{1440x900,390x844}.png`, `build-reduced-1440x900.png` and
`assembly-power-board-{1440x900,390x844}.png`.

## Open questions for Cedric

1. The car's picture is the site's own 3D model. Ambimat's kit photo (already on the /about card) would
   show the product itself; using it here needs rule 8's exception extended beyond /about.
2. The power board button goes to the shop's front page, where the eight power board listings are (one
   board or three, RoHS or not, standard or high current). Rahul's link was one of them, the three-board
   Non-RoHS pack. Say so if his exact listing is wanted (one line in `vendors.json`, `order.href`).
3. "Certified" (Rahul's word in this thread) or "official" (your ruling for the /about card)? The band
   says "An official RoboRacer vendor."
4. On a phone the open band takes 200 px above the docs. It folds and stays folded; should it start
   folded on phones?
5. Two solid violet buttons in the band, under the nav's violet "Start here": the one-solid-button rule
   is stretched here on purpose (each product needs its own action), on top of the open point about the
   nav (HANDOFF section 2, item 1).
6. The /assembly row still says "Both take 12 V from its terminals"; the board's manual gives the Jetson
   a 19 V jack. Not changed here.
