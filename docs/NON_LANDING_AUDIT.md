# Non-landing page audit — About, Race, Research, News

Date: 2026-08-23. Branch: `revamp/v1.0`. Read-only audit; no source was changed.
Method: four parallel read-only agents, one per page, each checking the page
source, its imported components, the `roboracer-content` skill, the design
system, every `public/data/*.json` file and every referenced asset on disk.
Quantitative claims below were re-verified by script in the main session.

Per-page detail: `docs/NON_LANDING_AUDIT_full.md`.

## The headline

**Research is already revamped and largely correct. About, Race and News are
pre-revamp legacy pages** — purple/pink gradient cards, `text-gray-*`, zero
design-system primitives, zero `prefers-reduced-motion` handling. They violate
CLAUDE.md rules 5, 6 and 7 as they stand.

**Two rows of `docs/HANDOFF.md` are themselves stale.** `HANDOFF.md:62` calls
`/research` "old design" — it was rebuilt in `6d566b0`. `HANDOFF.md:64` lists
`/race` as an iframe — it is a real React page (`src/pages/Race.tsx`). Only
Build/Learn/Course are iframes.

## Ranked findings

### Blockers — factually wrong or contractually exposed

1. **`/rules` serves the 24th competition's rules; IROS 2026 is the 31st.**
   `public/rules.md:20`. Wrong registration form (`forms.gle/FdfY9sKXREdu772u6`
   vs the skill's `nhDytwxKEy4EpUHa6`), wrong venue (Georgia World Congress
   Center / Atlanta, not Pittsburgh), wrong Slack channel, and no mention of the
   4-car multi-agent format. A team registering from `/rules` registers for the
   wrong race. `/rules` is also unreachable from the nav — its only inbound link
   is the About page's gradient button (`src/pages/About.tsx:148`).

2. **About publishes a roster the content skill explicitly calls stale.**
   20 people from `team_developers.json` (8) + `team_alumni.json` (12), none
   with roles (`src/pages/About.tsx:151-152`). The skill names five active
   people and says "never publish a person without a role and a photo" and
   "until then the roster renders only in dev/styleguide contexts."

3. **11 of 34 past-race links are broken.** Verified: 7 relative `*.html` paths
   that resolve against `/race` and hit the SPA 404 (`iros2020.html`,
   `ifac2020.html`, `columbia2019.html`, `montreal2019.html`, `torino2018.html`,
   `porto2018.html`, `pittsburgh2016.html`), 1 empty `href` that reloads the
   page, plus 3 dead domains already logged in `docs/EVENTS_VERIFICATION.md`.

4. **`/race` does not feature IROS 2026 at all** — it is card 3 of 3, with no
   spotlight, deadline or CTA, while every needed field (`spotlight`,
   `dates_headline`, `registration_deadline: "September 5, 2026"`,
   `register_url`) sits unused in `public/data/upcoming_events.json`. The skill
   requires it featured on the race page.

5. **News is 2.5 years dead** — newest item Feb 2024. Missing ICRA 2026,
   IV 2026, IFAC 2026 (starts 2026-08-24) and IROS 2026, whose registration
   closes 2026-09-05.

6. **49 of 133 papers have no reachable link** (48 with no PDF either) — their
   titles render as dead plain text. Only 6 papers are `featured` where the
   skill asks for 10-25, so 4 of the 10 topic chips show an empty grid.

### Major

7. **About ships 15.33 MB of eager images** (measured): `crew/billy.png` 2.9 MB
   and `crew/Roshan_Benefo.jpeg` 2.2 MB rendered at 100x100; `partners/duke.png`
   1.0 MB at 150x80; `about/image-2.JPG` 1.6 MB, over the rule-3 ceiling. No
   `loading="lazy"`, no dimensions. `partners.json` already carries optimized
   `image_rest`/`image_hover` WebPs that the page ignores.

8. **`rules.css` leaks globally and paints bullets red.** `.rules ol, ul` at
   `src/pages/rules.css:55` is unscoped *and* unlayered — once `/rules` is
   visited in the SPA that chunk never unloads, so it outranks Tailwind
   utilities site-wide. `color: red` at `rules.css:66`. `public/rules.md` also
   injects a raw `<style>` block through `dangerouslySetInnerHTML`.

9. **`bg-brand-radial` is undefined.** `src/pages/About.tsx:106` is the only
   occurrence in the repo, so the hero panel has no background: dark text sits
   over a darkened photo and is legible only on hover. The `hover:bg-white/90`
   reads as an acknowledgement that it fails contrast at rest.

10. **Broken sentence in production copy**: "...in the design of autonomous."
    (`src/pages/About.tsx:137`).

11. **Heading structure fails rule 7**: About has two `<h1>`s and no page title
    (`About.tsx:150,154`); Race has two (`Race.tsx:37,54`); Rules has none.

12. **Research renders LaTeX scrape artifacts verbatim** (`OPSEC\# 7248`,
    `Jan W\kegrzynowski`), and two CTU theses from 2017/2019 carry titles
    containing "RoboRacer" — a name that did not exist then.

## Data coverage

| File | Consumed by | Ready and unused |
|---|---|---|
| `publications.json` | Research | `abstract` (68), `citations` (73), `figure` (8) |
| `partners.json` | About (heavy originals) | 47 more logos on disk; `docs/content/partners.proposed.json` staged |
| `highlights.json` | Landing only | 16 entries, all `status: live`, all files verified present |
| `events_map.json` | Landing only | 40 numbered, source-cited, geolocated events |
| `teams.json` | Landing only | 10 entries, all 10 photos present — but all `status: verify` |
| `community.json` | Landing only | 11 sourced 2026 LinkedIn posts — exactly the news the feed lacks |
| `platform.json` | Landing only | The data-driven version of About's hardcoded, broken `<ol>` |
| `testimonies.json` | nobody | `loadTestimonies()` is dead code; the component was deleted |
| `news.json` | News | Unsortable — three different date formats |

**The recurring pattern: the media and data are already produced.**
`media/race/race-iros2026-hero-1272.mp4`, all 16 highlights, all 10 team photos
and `media/join/` exist on disk and are wired only into the landing.

## Blocked on Cedric, not on engineering

- All 10 `teams.json` entries are `status: verify`; the skill says unsourced
  entries are not rendered. A "who competes" section cannot ship until these
  are sourced.
- The five active team members have no roles and, except Billy Zheng, no
  headshots on disk. About's team section cannot ship until those arrive.
- `public/rules.md` needs replacing for the 31st competition before `/race`
  links to `/rules`.
