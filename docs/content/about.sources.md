# Sources behind the /about page

Written by the About builder, 2026-08-23. Every fact rendered on `/about` traces
back to one of the rows below or to the `roboracer-content` skill. Nothing on the
page is inferred.

## The co-founder line (Cedric, pages-v2 section 1.3)

Section 01 says, with the clause itself linking to the source:

> Madhur Behl, now at the University of Virginia, **co-founded the platform and
> the competition series**.

**Source:** UVA Engineering faculty page,
<https://engineering.virginia.edu/faculty/madhur-behl> — *"co-founded the F1Tenth
autonomous racing platform and the international F1Tenth (now Roboracer) Grand
Prix competitions"*. Recorded independently in
`docs/content/people.candidates.json` (Madhur Behl, `role_source`) and
`docs/content/people.crew.json`. The same URL is his card's `link`, so his name
on the page points at it.

## The rest of section 01

| Sentence | Source |
|---|---|
| Started at the University of Pennsylvania in 2016, formerly F1TENTH | `roboracer-content` skill, Identity |
| Rahul Mangharam leads it from Penn's xLAB | `roboracer-content` (faculty lead); Penn Engineering directory for the title |
| One-tenth-scale, open-source hardware, software and simulator | `roboracer-content`, Identity and the four pillars |
| "the foundations of autonomy and the analytical skills to recognize and reason about situations with moral content in the design of autonomous systems" | the previous roboracer.ai About page's own Learn paragraph, which was **truncated mid-sentence** at `About.tsx:137` ("...in the design of autonomous."). Completed, not rewritten. |
| 90+ universities, 20+ countries, 1,000+ publications, 30 competitions held | `roboracer-content`, Scale statements. Publications link to the Scholar query the number comes from. |
| Next race: IROS 2026, Pittsburgh, September 28 to 30 | `roboracer-content`, Next race (public copy, FINAL) |

The old page's mission sentence ("foster interest, excitement, and critical
thinking...") was **deleted, not rewritten**: it carries nothing a reader needs in
order to act (pages-v2 section 2).

## People

`src/components/about/people.json` is generated from the harvest agents' files;
it is data, not prose, and it is the only place a person's words live.

- **In:** `docs/content/people.crew.json` (agent A4) and
  `docs/content/people.past.json` (agent A5).
- **Groups:** `Faculty and advisors` (11) · `Developers` (13) · `Contributors`
  (49, from `public/data/contributors.json`) · `Past crew` (51). The word
  "Alumni" appears nowhere.
- **The name is the link**, to the `link` of that record — an institutional page
  where one exists, otherwise the organizing committee of the race the person
  runs, otherwise the LinkedIn profile the old roster carried.

### Transforms applied to the harvest wording

Only these, and only these:

1. **A trailing institution is dropped from `role`** when `affiliation` already
   carries it. "Ph.D. Student, University of Pennsylvania" + affiliation
   "University of Pennsylvania (xLAB)" renders as role "Ph.D. Student". No title
   changes meaning; nothing moves between people.
2. **A `"; ..."` tail becomes `note`.** "Professor, ...; faculty lead of
   RoboRacer" renders the title on one line and "Faculty lead of RoboRacer." on
   the next.
3. **"Rudolf Moessbauer Professor" -> "Rudolf Mößbauer Professor"** — TUM's own
   spelling on <https://www.professoren.tum.de/en/betz-johannes>.
4. **"xLab" -> "xLAB"** everywhere (director, 2026-08-23).

Nothing else. No role is shortened in meaning, capitalised differently, or
invented. A person with no sourced role has **no** `role` field and renders a
mono `verify` tag.

### Project roles carry their own verify tag

`project_role` is the role inside RoboRacer. Twenty-one of them come from the
archived F1TENTH about page
(<https://web.archive.org/web/20240109144454/https://f1tenth.org/about.html>),
where they sit in **HTML comments**: authored by the team, never displayed to a
reader. Director's ruling, 2026-08-23: render them **with** the mono `verify`
tag, because a role on the project's own page is unconfirmed, not invented, and
nothing is hidden for being unverified (pages-v2 section 0). They are in
`docs/content/people.gaps.csv` for Cedric's form to confirm or kill in one pass.

One project role is **not** tagged: Cedric Hollande, "Race Director, IROS 2026",
sourced from <https://iros2026-race.roboracer.ai/>, a live page.

`position_2024` (the archive's 2024 employer lines) is **never rendered** — one
of them describes the platform paper's co-author as a mechanical engineer at
Priority Designs. No email from the archive is rendered anywhere.

### Photos

| Set | Count | Provenance |
|---|---|---|
| Race-site organizer headshots | 12 | `iros2026-race.roboracer.ai/images/organizer/`, `icra2026-race.roboracer.ai/images/organizer/` — RoboRacer's own race sites; `docs/ASSET_MANIFEST.md` R-03 / R-08 record permission as granted |
| Old roboracer.ai crew photos | 16 | already in `public/crew/`, re-encoded in place |
| Archived F1TENTH about page | 37 | staged by agent A5 in `_harvest/pick/crew/`, from the site's own archive |

All are square 400x400 WebP under `public/crew/<person-name>-400.webp`, EXIF
applied, centre-cropped (portraits anchored 42% from the top; Xiaozhou Zhang
needed a face-anchored override, his source is a wide sky shot). Every original
they replaced was deleted, never duplicated. Two sources are smaller than 400px
and were not upscaled: Amr El-Wakeel (290) and Felix Jahncke (229).

Image-to-name pairing on the race sites was checked by position, not by filename
alone: both sites lay out organizer photos in blocks of four followed by the four
names, so `FelixJ.jpg` is Felix Jahncke (TUM) and `Felix.jpg` is Felix Resch
(TU Wien), and `Radu.png` is Radu Grosu.

## Page photos

`public/about/` — `docs/ASSET_MANIFEST.md` L-13 and the two beside it,
provenance site-owner, permission granted. Captions describe what is visible and
claim no event, because none is recorded for them:

| File | Was | Caption |
|---|---|---|
| `about-penn-lab-1200.webp` | `upenn-ppl-min.jpg`, 582,675 B | "the group at Penn, with the cars" |
| `about-competition-field-1200.webp` | `image-2.JPG`, 1,675,116 B | "the field at a competition, behind the barriers" |
| `about-teams-pits-1200.webp` | `image-3.JPG`, 1,467,000 B | "teams in the pits, between runs" |

## Partners

`public/data/partners.json`, 80 records: 65 university, 8 industry, 7
organization. The wall renders `category` groups, alphabetical inside each, and
the count. Industry and organization records are historical per-competition
sponsors and are shown here as partners; the sponsors block stays at zero until
Cedric confirms one in writing (`roboracer-content`, Partners and sponsors).

## What is deliberately not on the page

- **Michele Magno** (ETH, 14 papers, the largest output in `publications.json`)
  and the other prolific community researchers. They hold no organizing or
  advisory role that any source states, so putting them under "Faculty and
  advisors" would assert one. ForzaETH represents that group under featured
  teams instead.
- **The twenty past event organizers** in `people.past.json`
  (`past_event_organizers`). A5 filed them separately for the same reason: each
  organized one conference's race as a local host and is not project crew. They
  belong on the race timeline as "hosted by" credits.
