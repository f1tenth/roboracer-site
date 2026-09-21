# Requests from stream 3 (news) to the director

Everything below is in a file stream 3 does not own. Nothing here was changed by
stream 3.

## 1. `src/lib/data.ts`: `NewsItem` and `loadNews` are dead

`export type NewsItem` (title/platform/date/description/link/image) and
`export const loadNews` describe the old flat `news.json` that A6 is replacing.
Nothing imports either one: `/news` reads through its own typed loader,
`src/components/news/newsData.ts`, which mirrors A6's contracted schema (taskmap
n141). Under rule 10 both should be deleted. If you would rather keep one
loader in `src/lib/data.ts`, move the types out of `newsData.ts` and stream 3
will import them instead - say which and it is a five-line change.

## 2. `index.html` has no `<noscript>`

With JavaScript disabled the body is empty on every route, `/news` included
(verified with Playwright, `java_script_enabled=False`). The definition of done
asks for "JS disabled still readable"; that cannot be satisfied inside a page
component in a client-rendered SPA. A `<noscript>` block in `index.html` with
the site name, the one-line description and the Slack and GitHub links would at
least leave something readable and is a shell change, not a page change.

## 3. Two dead links in `public/data/news.json` (A6's file)

- `https://endeavors.unc.edu/the-fast-and-the-autonomous/` - no response at all
  (connection failure from this machine, twice).
- `https://app.stitcher.com/splayer/f/125922/67297121` - 301 to
  `https://www.stitcher.com/roadblock/index.html`; Stitcher is shut down.

Both need a replacement URL (a Wayback capture resolves for the UNC piece) or
the item drops. The page renders whatever the file holds, so this is A6's call
to make, not stream 3's.

## 4. Two coordinator messages arrived at stream 3 that belong to the About builder

Both were about `src/pages/About.tsx`, `public/data/team_developers.json`,
`public/data/team_alumni.json`, `src/lib/data.ts`, `public/crew/`,
`public/data/partners.json` and `docs/content/people.*`. Stream 3 owns none of
them and changed none of them.

- Message 1: the crew originals were replaced with `-400.webp` files while the
  two team JSON files still point at the old paths; decide between repointing
  them or moving to `docs/content/people.crew.json` / `people.past.json` and
  deleting the two loaders; confirm zero 404s on `/about`.
- Message 2: partners on About become a `LogoCloud` wall grouped by a new
  `category` field and sized for ~70 logos; A8 is mining
  `_harvest/f1tenth-about-2024/` into `docs/content/people.archive.json` with
  sourced roles for the old roster and staging headshots into
  `_harvest/pick/crew/`; plus the outstanding team JSON question above.

They need to reach whoever owns About.

- Message 3: the active people group is renamed `Developers` (order: Faculty
  and advisors, Developers, Contributors, Past crew), and Zirui
  (https://github.com/zzangupenn) is active and belongs in it. Stream 3's files
  contain no "Crew", "Alumni" or any of the banned phrases from section 2
  (checked by grep), so nothing changed here.
- Messages 4 and 5: A8's people archive with never-published roles rendered
  under a `verify` tag, the three hard rules on that data, and the partner wall
  sizing (`src/components/about/PartnerWall.tsx`, 80 records, logo box 72-80px,
  the count shown as a number). All About, none of it stream 3's.

Item 3 above is now partly closed: A6's rewritten `news.json` dropped the dead
Stitcher item. `https://endeavors.unc.edu/the-fast-and-the-autonomous/` is still
in the file and still unreachable.
