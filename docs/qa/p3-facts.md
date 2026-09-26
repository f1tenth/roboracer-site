# QA: p3-facts (Cedric's notes 2026-09-25)

Branch `revamp/p3-facts`. Three notes: no verify tags anywhere, team facts from
the RoboRacer_Teams_DB sheet, and the /news h1.

## What changed

- **Verify tags gone.** `VerifyTag.tsx` deleted. People cards (/about) show the
  project role without a tag and no tag on role-less cards; the /news "unverified"
  pill (cards and lead) is gone; TeamGrid drops its "unverified" line and the
  "institution tbc" fallback; the car callout reads "Steering servo"; the People,
  landing Teams and /race "Who competes" leads lose their verify sentence. JSON
  `status` / `project_role_verify` stay as bookkeeping; nothing renders them.
- **Not touched here (other owners):** the /about Spinoffs block and
  `SpinoffGrid.tsx` (only its `VerifyTag` import and tag line were removed so this
  branch builds), `CommunityJoin.tsx` (same two lines), and the `caption_verify`
  type in `src/lib/data.ts`. The Spinoffs lead still says "A verify tag means..."
  on this branch until that owner's branch merges.
- **Teams.** `public/data/teams.json` takes name, institution and country from
  `docs/content/teams.sheet.json`; no `TODO(content)` institution is left.
  Content skill has a new "Teams" section; `docs/CONTENT.md` marks the team
  questions resolved. The world map's Germany note now cites LAMARRacing (UNICORN
  moved to South Korea).
- **/news h1** "News from the Community".

## Checked

- `npm run lint` clean; `npm run build` passes (only the known >500 kB chunk warning).
- Preview on 127.0.0.1:4181, Playwright (Python, CDP captures, stitched walks) at
  1536x730 and 390x844: `/` Teams, `/about` People, `/news` top, `/race` Who
  competes. PNGs in `docs/qa/p3-facts/` (git-ignored).
- Zero console errors or page errors on all four routes at both sizes.
- One h1 per page (landing, About, News "News from the Community", Race).
- Rendered text scan (`document.body.innerText` after a full scroll walk) for
  `verif|unverified|tbc|TODO`: no hit on /news or /race; on / only the
  publication topic "Safety and verification" (a research tag, not a marker);
  on /about only the Spinoffs lead (other owner, see above).
- All ten team cards show institution and country on / and /race, e.g.
  "UNICORN_Racing | Ulsan National Institute of Science and Technology (UNIST) ·
  South Korea"; the long UNIST line wraps to two lines on desktop and three on a
  phone, no overflow.
- Built bundle: the only rendered "verify" string left is that Spinoffs lead; the
  rest are JSON bookkeeping values in the bundled people.json.

## Left

- Spinoffs lead and SpinoffGrid's empty `<p>` (the tag line was removed, the
  wrapper stays for the owner's merge).
- `caption_verify` on `JoinPhoto` (`src/lib/data.ts`) is now unused; the
  CommunityJoin owner should drop it.
- The world map's dashed ring still means "to come or venue to be confirmed" (a
  map encoding, not a tag); untouched.
