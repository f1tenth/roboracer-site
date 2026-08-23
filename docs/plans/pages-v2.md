# Pages v2 (session 10): chunk fix, Our Partners, Race media, About, News, Research

Status: contract. Written by the director chat, 2026-08-23, to be executed on
`revamp/pages-v1` (which sits on top of `revamp/v1.0`). It supersedes
`docs/plans/pages-v1.md` where the two differ; pages-v1 stays on disk as the
reason behind what already shipped.

Cedric is away for the whole session and is running it in the background. There
is **no halt in this contract**. Every decision that would otherwise wait is
made by you, recorded on the taskmap node it belongs to, and listed once in the
final report. `blocked` is only for something a human answer is genuinely
required for, and there should be close to zero of those.

---

## 0. Session rules

- **Branch.** All work on `revamp/pages-v1`. PR **#17** (`revamp/pages-v1` ->
  `revamp/v1.0`) and PR **#16** (`revamp/v1.0` -> `main`) both stay drafts.
  Nothing merges. Nothing touches `main`. `revamp/integration` is gone; do not
  try to resurrect it.
- **Commits.** Conventional commits, present tense. **No AI attribution of any
  kind**: no `Co-Authored-By: Claude`, no "Generated with Claude Code", not in
  commit messages, not in PR bodies, not in file headers. If
  `includeCoAuthoredBy` is set anywhere in your settings, it is `false`.
- **Model and effort.** Director on **opus, effort max**. Builders and harvest
  agents on **opus, effort high**. The media-curator on **opus, effort high**.
  Do not drop below high anywhere in this session.
- **Concurrency.** Wave A runs up to **six harvest agents at once**; the build
  wave runs **four builders at once** plus you. Sub-agent spawn depth stays 2.
  Parallel is encouraged; a second agent doing the same job as the first is
  not. One owner per file, always.
- **Two review rounds per stream, then report.** Never loop on a stream that is
  not converging: write down what is wrong, ship what works, move on.
- **Environment.** Playwright is Python-only
  (`/home/cedric/.venvs/ml/bin/python3`); captures go through a CDP session,
  never `full_page=True`. Never `pkill -f`. Every file write is atomic
  (`<file>.tmp` then replace) because a dev server watches the tree. **5173 is
  Cedric's dev server and 4242 is taskmap: never bind either.** Your own
  preview servers start at 4180 and up, and you kill them by port
  (`lsof -ti:<port> | xargs -r kill`), never by name.
- **Facts.** Only from the `roboracer-content` skill and the JSON in
  `public/data/`, with the precedence rule that a cited source in the data
  outranks the skill. Anything unverified renders with a small mono tag.
  Nothing is hidden because it is unverified, and nothing is hidden on
  localhost.
- **Taskmap.** Milestones are the streams, chunks are the sections of this
  file, steps are the concrete changes. The dashboard is at
  http://localhost:4242; Cedric may leave feedback there mid-run from his
  phone, so check the inbox at every checkpoint.

---

## 1. Cedric's answers to the last report's asks (closed, do not re-ask)

1. **Ayagoz Smagulova, Johnny Tian, Dhruv Jaiswal are all active.** They are
   Crew, not Past crew.
2. **Titles.** The person's own institutional page wins; where there is a
   conflict, take the institutional page and move on. Rahul Mangharam is
   **Professor**. Cedric Hollande is **Researcher**. Yon Vanommeslaeghe is
   **Postdoc**. Do the same for Betz and Elgouhary from TUM's and WVU's own
   pages. Cedric's words: these do not matter much, a form will replace them
   later. Spend no agent time on title conflicts beyond one lookup each.
3. **Madhur Behl co-founded the platform and the competition series** (UVA
   faculty page, already sourced, photo at `public/crew/madhur.jpg`). Say it on
   About, in the story, with the source recorded in `docs/content/`.
4. **The twelve old-roster names with no public source** (Mike Coraluzzi,
   Jayanth Bhargav, Xinlong Zheng, Xiaozhou Zhang, Wesley Yee, Lejun Jiang,
   Ravi Konkimalla, Tom Jose, Malavika Manoj, Junfan Pan, Karel Smejkal, Roshan
   Benefo) render as **Past crew with a monogram tile or their existing
   `public/crew/` photo, name only, no invented title**. They also go into the
   gaps file in section 4.
5. **The site is out of date and that is expected.** Placeholders are fine
   where a form will fill the gap later, as long as the placeholder looks
   deliberate.

---

## 2. Voice and copy (new, binding, applies to every page)

Cedric's note, verbatim in substance: the copy is drifting into AI filler. Two
examples he called out and what replaces them.

**Banned outright.** Grep `src/` for these and kill every one:

- "on the grid", "lining up on the grid", "Put your name on the grid", and any
  other racing metaphor standing in for a plain verb.
- "Four steps between reading this and ..." and every sentence of that shape: a
  count of steps dressed as a journey.
- "everything else can be sorted out on Slack".

**Replacements.**

- Race, section 01 header: `subtitle` becomes **"How to enter"**, `lead`
  becomes **"All the information for each competition is on that
  competition's own site. In short:"** followed by the existing four steps.
- Anywhere Slack is the answer: **"Feel free to reach out on Slack"** with the
  word Slack itself a link, or a secondary button sitting right there. Never a
  sentence that mentions Slack without a way to get to it in the same breath.
- `SponsorCTA` heading: **"Sponsor a RoboRacer competition"**. Keep the body,
  drop nothing else.

**The rule behind the rule.** If a sentence carries no information the reader
needs in order to act, delete it rather than rewrite it. Dates, deadlines,
counts, places and names are the voice. Adjectives about how exciting a race is
are not. When in doubt, the shorter version is the right one.

---

## 3. Stream 0 - director: shell and landing

You own `src/App.tsx`, `src/main.tsx`, `src/components/Layout.tsx`,
`NavBar.tsx`, `Footer.tsx`, `RouteBoundary.tsx`, `src/pages/Landing.tsx`,
`src/index.css`, `src/lib/**`, `src/components/ui/**`. No builder edits these;
a builder that needs a change here asks you for it.

### 3.1 The production build kills the landing (fix first, before anything else)

**Symptom, from Cedric.** On the production preview at 4185, clicking the
RoboRacer logo to go home renders the `RouteBoundary` fallback with
`error loading dynamically imported module: http://localhost:4185/assets/StatCounter-CllGwoO1.js`,
and a reload does not clear it. The dev server on 4180 is fine. So the boundary
is doing its job; the chunk really is not there.

**Diagnose before patching.** In order:

1. `ls dist/assets | grep -i statcounter` and grep the built Landing chunk for
   the hash it actually imports. If the hashes disagree, the `dist` being
   served was rebuilt underneath the running preview server, which is the most
   likely cause given 4180 and 4185 came from different moments.
2. `rm -rf dist && npm run build`, then `npx vite preview --port 4181
   --strictPort`, and navigate landing -> every route -> back. Record whether a
   clean build alone fixes it.
3. Record the answer in section 12 either way. Do not write "probably" in the
   report; you have the repo and the build, so you can know.

**Fix it regardless of the cause**, because GitHub Pages will do exactly this
to real readers on every deploy: a reader with yesterday's `index.html` open
asks for a chunk hash that no longer exists.

Add `src/lib/lazyWithRetry.ts` and use it for every `lazy()` in `App.tsx`:

```ts
import { lazy, type ComponentType } from "react";

const key = (name: string) => `rr:chunk-reload:${name}`;

/** sessionStorage throws in some privacy modes; a recovery path must not be the
 *  thing that crashes. */
const flag = {
  get(name: string) {
    try { return sessionStorage.getItem(key(name)) === "1"; } catch { return false; }
  },
  set(name: string) {
    try { sessionStorage.setItem(key(name), "1"); } catch { /* ignore */ }
  },
  clear(name: string) {
    try { sessionStorage.removeItem(key(name)); } catch { /* ignore */ }
  },
};

/**
 * A deployed SPA changes every asset hash on every build. A reader holding the
 * old index.html then requests a chunk that no longer exists, the dynamic
 * import rejects, and React surfaces it as a render error that takes the whole
 * route down. Same failure shape as a preview server started against a dist
 * that was rebuilt under it.
 *
 * Retry once for a transient network failure, then reload once for a stale
 * document, then give up and let RouteBoundary show the fallback. The retry is
 * cheap but not reliable on its own: the module registry can hand back the
 * same rejected promise without a second network request, which is why the
 * reload exists. The per-chunk sessionStorage flag is what makes "reload once"
 * true; without it a genuinely missing file reloads forever.
 */
export function lazyWithRetry<T extends ComponentType<never>>(
  name: string,
  factory: () => Promise<{ default: T }>,
) {
  return lazy(async () => {
    try {
      const mod = await factory();
      flag.clear(name);
      return mod;
    } catch {
      await new Promise((r) => setTimeout(r, 400));
      try {
        const mod = await factory();
        flag.clear(name);
        return mod;
      } catch (err) {
        if (!flag.get(name)) {
          flag.set(name);
          window.location.reload();
          return new Promise<never>(() => {}); // the reload wins this race
        }
        throw err;
      }
    }
  });
}
```

Then extend `RouteBoundary`: when `error.message` matches
`/dynamically imported module|Importing a module script failed|Failed to fetch dynamically imported/i`,
the fallback says the page needs a reload after an update and shows a **Reload**
button (`window.location.reload()`), instead of the generic message. Keep the
generic message for every other error.

**Verify, with evidence in the report.**

- Clean build, preview, landing -> `/race` `/about` `/news` `/research`
  `/rules` `/build` and back to `/` each time. Zero console errors, zero
  reloads.
- Force the failure: rename one hashed chunk in `dist/assets`, load the route,
  confirm it reloads exactly once and then shows the Reload fallback rather
  than looping. Restore the file.

### 3.2 Our Partners: a real section, two ribbons, opposite directions

Today the ribbon has no title, just the run-on line "across the partner
institutions below" carried over from the map counters, and one row.

- Give it a real `SectionHeader` with `title="Our Partners"`. Keep the
  institution count and "alphabetical" as the meta line on the right.
- **Do not undo the earlier fix**: Cedric asked for the ribbon to sit tight
  under the map counters because it read as detached. Keep `pt-0!`, keep the
  1800px bleed, keep the tight rhythm; add the header inside that, not a fresh
  block of whitespace above it.
- **Section numbering stays contiguous.** Partners takes the next number after
  the community map, and every section after it shifts by one (Teams, Research,
  Join - the Join index lives in `CommunityJoin.tsx`). Sweep every
  `SectionHeader index=` in `src/` afterwards and confirm no number repeats or
  skips, including the ones rendered inside the car and map chapters.

**The double ribbon.** 20 partners today.

- **Two disjoint lists, alternating**: even indices to the top row, odd to the
  bottom row. Alternating rather than first-half/second-half so both rows get a
  mix of wide and narrow logos. A partner never appears in both rows at the
  same time, which is the thing Cedric asked for.
- Top row scrolls left (as today), bottom row scrolls right. Implement with a
  `direction` prop on `Marquee` that sets `--rr-marquee-direction: normal |
  reverse` and an `animation-direction: var(--rr-marquee-direction, normal)` on
  `.rr-marquee-track` in `index.css`. Three lines of CSS, one prop. Do not
  rewrite the marquee.
- Everything else stays: 120px logos from md, the tint/colour crossfade on
  hover, the hover name pill, `:has(a:focus-visible)` pause, clones out of the
  tab order, items never lazy.
- Vertical gap between the rows on the order of the logo gap, not more.
- **Reduced motion**: each row falls back to its own static wrapped row, so the
  20 institutions still all render, once each.
- **Seams**: each row now carries half the items, so check at 1800px that a
  single track is still at least twice the container width. If it is not,
  repeat the row's list until it is, before the existing double-copy logic.

### 3.3 Copy sweep

Run section 2 across every file you own, plus `SponsorCTA.tsx`. The Race page's
own copy belongs to Stream 1 and you leave it alone.

---

## 4. Wave A: harvest agents (parallel with Stream 0, data only)

Every agent in this wave is **read-only on `src/`**. They write JSON, markdown
and files under `_harvest/` only. That is what makes six of them safe at once.

Rules that bind all of them:

- **Public professional sources only**: institutional and lab pages, published
  author lists, GitHub public profiles, conference and race sites, Wayback.
  Never a personal email, never a phone number, never anything from a personal
  or private source.
- **Every person, photo and fact carries a source URL.** Never invent a title,
  an affiliation, a date or a result.
- `WebFetch` is allow-listed to a short set of domains. For anything outside
  it, **use `WebSearch` plus `curl`** rather than parking on a permission
  prompt. If a tool call is going to need approval, find the route that does
  not.
- **LinkedIn**: link to posts and profiles freely, but do not download or
  republish LinkedIn media. Media rights there are Cedric's to ask for.

| Agent | Scope | Writes only |
|---|---|---|
| **A1 race-photos-recent** | One photo for each event in `events_map.json` from **2024 onward**, from `_harvest/drive/` then `_harvest/cedric-media/` | `docs/media/RACE_PHOTOS.drive.md`, `_harvest/pick/race/` |
| **A2 race-photos-archive** | One photo for each event **2023 and earlier**, from `f1tenth.github.io/*.html`, the archived race sites, `scripts/harvest-wayback.py`, and the open web | `docs/media/RACE_PHOTOS.web.md`, `_harvest/pick/race/` |
| **A3 paper-figures** | A figure for every curated paper; expand `featured` from 6 to **10-14** so no topic chip lands on an empty grid | `public/data/publications.json`, `public/media/research/`, `docs/media/THUMBS.md` |
| **A4 people-crew** | Faculty, advisors and active Crew: photo, role, affiliation, one link each | `docs/content/people.crew.json` |
| **A5 people-past** | Past crew and the contributor roster enrichment | `docs/content/people.past.json` |
| **A6 news-harvest** | The merged, normalised news feed | `public/data/news.json`, `_harvest/pick/news/` |
| **A7 link-check** | Runs last: `curl -sSI` every URL any agent added this session | `docs/qa/links.md` |

**A1 and A2 detail.** Cedric: "the older races are missing so just search the
internet if you can find - if you can't find have a temporary roboracer logo".
So: one image per event, priority Drive mirror > Cedric's folder > the old
f1tenth.org page for that race > Wayback > open web with a credit >
`public/logo-square.svg` placeholder. Prefer cars-in-frame action or a group
shot over a poster. Record credit and source URL per photo. **Never** stock,
never neobotics. If the Drive mirror looks stale, `scripts/drive-sync.sh` is
there, but do not let a multi-GB sync block the wave.

**A4 and A5 detail.** Start from what already exists: 19 headshots in
`public/crew/`, `public/data/contributors.json` (49 people, 13 active / 36
past), `docs/content/people.candidates.json` (85 candidates). Map those first;
only then search. For each person the record is `{ name, role, affiliation,
photo, link, source, status }` where `link` is, in order of preference, a
personal site, a lab page, a Google Scholar profile, a GitHub profile, a
LinkedIn profile. `role` is `null` rather than guessed. Contributors get their
GitHub avatar and profile and nothing else; commit history is its own evidence.

Both agents also append to one shared, **form-ready** gaps file:
`docs/content/people.gaps.csv`, columns
`name,group,has_photo,has_role,has_affiliation,has_link,what_is_missing`. That
file is what Cedric pastes into the form he is about to send out, so it is
sorted by group then name and contains every person on the site, not just the
broken ones.

**A6 detail.** Section 7 has the full spec.

---

## 5. Stream 1 - Race (`src/pages/Race.tsx`, `src/components/race/**`)

The page is a good start per Cedric. Four changes.

### 5.1 One picture per race

Every entry in the "Every race so far" timeline gets one image, wired from
A1/A2's tables. Consistent aspect across the whole timeline, images
`loading="lazy"` with explicit `width`/`height`, 800px wide WebP under 220 KB
via `scripts/media.sh`, credit in `docs/ASSET_MANIFEST.md` and never on the
tile.

The placeholder is a designed tile, not a broken frame: `public/logo-square.svg`
centred on paper inside the same hairline border, at a size that reads as
intentional. A timeline where a third of the entries are placeholders must
still look composed.

### 5.2 IFAC 2026 is Live

- Add `starts_at` and `ends_at` to all three entries in
  `public/data/upcoming_events.json`. IFAC 2026 is **Aug 24-27, 2026, BEXCO,
  Busan**; VTC 2026 Fall is Sep 6-9, Boston; IROS 2026 is Sep 28-30,
  Pittsburgh.
- The season chain computes its own state from those instants: **upcoming /
  live / concluded**. No literal "Live" in a component. IFAC therefore reads
  Live from tomorrow, and the label is correct the day after without anyone
  touching the repo.
- Live state: the word **Live**, a small solid dot, no blinking, and no
  animation at all under reduced motion.
- **Temporary stream link.** Cedric: they might stream. Check
  `https://2026ifac-roboracer.com/` and the RoboRacer YouTube and LinkedIn for
  a real stream URL. If one exists, use it. If not, link the race site itself
  and carry a mono `stream link to be confirmed` tag next to it. The link must
  never lead nowhere.
- After IFAC ends, the map dataset needs a rebuild
  (`node scripts/build-world-map.mjs`) to move it into the held set. Note that
  in the report as a recurring chore; do not try to automate it this session.

### 5.3 Copy

Apply section 2, including the section 01 header and the Slack line.

### 5.4 Keep

The hero, countdown, the thirteen repaired links, the four-section structure,
and the `unverified` tags on teams. Do not rebuild what already passed QA.

---

## 6. Stream 2 - About (`src/pages/About.tsx`, `src/components/about/**`)

The full build, placeholders included. Cedric will fill the gaps from a form
later, and `people.gaps.csv` is what he sends out.

**Structure**: hero (exactly one `h1`) / 01 What RoboRacer is / 02 The platform
/ 03 People / 04 Our Partners / 05 Join.

- **01 What RoboRacer is.** The story, from the content skill. Includes the
  sourced line that Madhur Behl co-founded the platform and the competition
  series. Finish the sentence truncated at `About.tsx:137`.
- **02 The platform** renders from `public/data/platform.json`. The hardcoded,
  broken `<ol>` goes.
- **03 People**, four groups in this order: **Faculty and advisors**, **Crew**,
  **Contributors**, **Past crew**. Never the word "Alumni".
  - Card: photo or monogram tile, name, role and affiliation when sourced, mono
    `verify` tag when not. **The name is the link** to that person's source URL
    - Cedric asked for that explicitly.
  - A card with no photo and no role still has to look deliberate: monogram
    tile, name, nothing empty, no broken image.
  - Contributors render compact - avatar, handle, link - not as full cards.
    Thirteen active and thirty-six past, from `contributors.json`.
- **04 Our Partners** reuses the director's ribbon component from 3.2. Do not
  reimplement it, and do not fork it.
- **05 Join**: Slack primary with the link right there, LinkedIn, GitHub,
  Instagram placeholder.

**Fixes that are part of done**: `bg-brand-radial` is undefined and
`About.tsx:106` is its only use in the repo, so that hero panel currently has no
background and its text is legible only on hover - give it a real surface and
measure contrast at rest. The page ships 15.33 MB of eager originals including a
2.9 MB PNG drawn at 100x100: every image lazy, dimensioned, and served from the
optimised WebP, never the original.

---

## 7. Stream 3 - News (`src/pages/News.tsx`, `src/components/news/**`)

Cedric: "You didnt do the news page and update it at all - do it now." The page
is still the original purple-gradient card list and its newest item is February
2024.

- **Sources**: `public/data/news.json` (7 items, three different date formats,
  unsortable as-is) merged with `community.json`'s `join.posts` (11 sourced 2026
  LinkedIn posts). Normalise every date to ISO `YYYY-MM-DD`, keep a display
  string, sort reverse-chronologically.
- **Coverage floor**: the feed must carry **ICRA 2026, IV 2026, IFAC 2026 and
  IROS 2026**. IV 2026 in Detroit was won by Thunderbolt / UPenn Autonomous
  Racing; ICRA 2026 Vienna was the largest event to date. If the merged sources
  do not cover an event, A6 sources one item for it from a public page and
  cites it.
- **Every item** keeps its source link, author, affiliation and credit.
- **Thumbnails** come from Drive, Cedric's folder or the org's own pages. For a
  LinkedIn-sourced item with no usable image, the card is a designed text card:
  author, affiliation, date, excerpt, link out. Never a hotlinked LinkedIn
  image, never a stretched logo.
- The gradient cards, the `shadow-lg`, the centred `max-w-3xl` column and the
  "Loading news..." string all go. Same shell, section headers and type scale as
  the other pages.
- **Empty state** is a designed panel that says the feed is quiet and links
  Slack, never a blank column. It should be unreachable with the current data,
  and it still has to exist.

---

## 8. Stream 4 - Research (`src/pages/Research.tsx`, `src/components/research/**`)

A fix list, not a rebuild. `6d566b0` already rebuilt the page.

- **One picture per curated paper.** Cedric: "All curated publications need one
  picture by them just like for the races - it can be small." Every featured
  paper gets a figure from A3. Where no figure can be extracted, a generated
  typographic tile (venue, year) - never an empty frame, never a stretched
  logo.
- **Featured goes from 6 to 10-14**, chosen so no topic chip shows an empty
  grid. 8 papers already have figures and 68 have abstracts, all currently
  unused.
- **49 of 133 papers have no reachable link.** Each gets a resolvable one (DOI,
  arXiv, OpenAlex, Semantic Scholar, publisher landing page) or renders as
  unlinked text with a mono tag. `scripts/resolve_paper.py` exists.
- **Strip the LaTeX scrape artifacts** (`OPSEC\# 7248`, `Jan W\kegrzynowski`
  and the rest) with a sweep, not a whitelist.
- **The two CTU theses from 2017 and 2019 are titled "RoboRacer"**, a name that
  did not exist then. Restore their original titles from the source record.

---

## 9. Media rules

- Budgets: clips 960 wide under 1.5 MB, photos 1200 wide WebP under 220 KB,
  timeline photos 800 wide under 220 KB. `scripts/media.sh` enforces this.
- The 1.5 MB binary cap holds. The three tracked About assets already over it
  (`public/about/image-2.JPG`, `public/crew/billy.png`,
  `public/crew/Roshan_Benefo.jpeg`) get re-encoded down this session; they are
  About's assets and About owns the fix.
- Credits in `docs/ASSET_MANIFEST.md`, never on the tile.
- `_harvest/` never enters git. Check `.gitignore` before the first commit that
  touches media.
- The media-curator runs **serially** at the encode stage, never as a parallel
  stream.
- No neobotics assets, no stock, ever.

---

## 10. Definition of done, per page

Build and lint green. 1440 / 768 / 390 reviewed plus a landscape check. Zero
console errors. axe: zero serious or critical. Reduced motion verified. JS
disabled still readable. Exactly one `h1` and a document title per route. Every
image lazy with explicit dimensions, no layout shift. Every external link
resolves (A7's table is the evidence). Copy passes section 2. QA report at
`docs/qa/<page>.md`.

Plus, once, at the end: **a production-build navigation pass**. `rm -rf dist &&
npm run build && npx vite preview --port 4181 --strictPort`, then landing to
every route and back, zero console errors, zero reloads. The bug in 3.1 only
appears in a built preview, so a dev-server pass is not evidence.

---

## 11. Order of work

1. **3.1 chunk fix** - alone, first, because everything after it is reviewed on
   a built preview.
2. **Wave A (six agents)** starts in parallel with 3.2 and 3.3.
3. **Streams 1-4** start as soon as their harvest inputs exist. If a harvest is
   slow, the builder ships layout against placeholder data and wires the real
   data when it lands. **No builder ever idles waiting on an agent.**
4. Media-curator encode pass, serially.
5. Close: lint, build, `/qa-page` on race, about, news and research, landing
   regression, production preview pass, PR #17 body and checklist updated.

---

## 12. Report to Cedric (the thing he reads when he gets back)

Keep it short and concrete, in this order:

1. **The chunk bug**: what it actually was, with the evidence, and what now
   protects against it.
2. **Per page**: what changed, one line each, with the review URL.
3. **Decisions you made alone**: numbered, one line each, with the reason.
4. **The forwardable ask**, as a pointer to `docs/content/people.gaps.csv` plus
   anything that is not about people.
5. **Not fixed**, with why.
6. Review URLs: the dev server you started (4180+) and the production preview
   (4181), plus PR #17.

No AI attribution anywhere in the commits, the PR, or the report.

---

## 13. Change log

- 2026-08-23 - Contract written by the director chat after Cedric's review of
  the pages-v1 halt.
