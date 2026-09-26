# QA: spinoffs on /about (revamp/p3-spinoffs, 2026-09-25)

Brief: Cedric's notes of 2026-09-25 (Neobotics with its car, logo and website
preview; Quanser featured the same way; LAMARRacing out; verify tags gone),
plus his later direction the same day: rule 8 is lifted for these features,
which should read as a summarized, framed preview of each company's website.

## What changed

- `public/data/spinoffs.json`: LAMARRacing removed from `entries` (still in
  teams.json). Quanser renders; its origin stays `TODO(content)` and is not
  shown. Each entry carries `logo`, `car` (with the car's name and page) and
  `preview` objects with width, height, alt and source. Quanser's `url` is now
  the homepage; the QCar 2 page moved to `car.url`.
- `src/components/about/SpinoffGrid.tsx`: rewritten as a feature per company:
  the car photo as the stage; the homepage as a browser window (three ink
  dots, the domain in a mono address pill, "Visit ↗") rising 4.5rem out of
  the stage's lower edge; mono kind line, the company's mark and name (h3),
  what it makes, the "with RoboRacer" line when there is one, and "See the
  <car> ↗". Two across from `desktop:`, stacked on `compact:`; inside a card a
  container query (40rem) switches between text beside the window and one
  column with the window last. VerifyTag import and usage gone.
- `src/lib/data.ts`: `SpinoffImage` type, image slots on `Spinoff`,
  `spinoffShown` deleted (nothing hides an entry without an origin any more).
- `src/pages/About.tsx`: no filter; subtitle "Companies that grew out of the
  car" (no team is left); lead "Two so far." (verify sentence dropped);
  loading placeholder re-measured.
- `public/media/spinoffs/`: six WebP files, 2 to 39 KB. Provenance rows
  SP-01 to SP-07 in `docs/ASSET_MANIFEST.md` (section "About: spinoff
  features"), including the missing row for `public/partners/neobotics.webp`.

## Checked

- `npm run lint` clean; `npm run build` passes.
- `npm run preview` on 4182, `/about`, section `#about-spinoffs`, stitched CDP
  captures in `docs/qa/p3-spinoffs/` (git-ignored):
  `spinoffs-1536x730.png`, `-1366x650`, `-1920x1080`, `-768x1024`,
  `-390x844`, `-844x390`, plus `-1536x730-reduced` and `-390x844-reduced`.
  All six images load (`complete`, natural width as encoded) at every size;
  no console errors, warnings, failed requests or 4xx on the page.
- Wide cards (1366, 1536, 1920, and 1024): text left, window right,
  overlapping the photo without covering either car. 768: two narrow cards,
  one column inside each, window last. 390: stacked, window last. 844x390
  (landscape phone): stacked; the 16:9 stage is taller than the short
  screen, as every full-width photo on the site is there.
- Reduced motion: everything visible and static; the car zoom on hover and
  the window lift only run under `motion-safe`, the Reveal is skipped.
- Keyboard: four stops in order (See the NeoRacer, neobotics.org window, See
  the QCar 2, quanser.com window), each with the 2px violet focus ring
  (`focus-1..4.png`). Window links are named "Visit <domain>, the <name>
  website (opens in a new tab)".
- axe (axe-playwright-python) on `/about` at 1536x730: zero violations.
- External links: neobotics.org, neobotics.org/kits, quanser.com and the
  QCar 2 page all return 200.
- One h1 on the page (unchanged); every image has width, height, alt and
  `loading="lazy"`.

## Left for Cedric

- Quanser's connection to RoboRacer (the origin line) is still a
  TODO(content) question.
- Neither company has been asked about the use of its logo, photos or the
  homepage capture; the manifest says "Cedric-directed 2026-09-25; not yet
  asked".
- The homepage captures are a moment in time (2026-09-25); if either site
  changes, re-capture with the steps in the manifest.
