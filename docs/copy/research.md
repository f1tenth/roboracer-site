# /research copy pass

Files: `src/pages/Research.tsx`, `src/components/research/*` (PaperCard, PaperRow,
VenueTile, figures), plus the labels those components pull from
`src/lib/publications.ts`. Paper metadata in `publications.json` was not touched.
Rules are numbered as in `docs/copy/BRIEF.md`.

| Location | Before | After | Rule broken |
|---|---|---|---|
| Research.tsx, header lead | A Google Scholar search for F1TENTH or RoboRacer returns more than a thousand results. Here is a selection by topic, and every paper we track. The rest are one search away. | Google Scholar returns more than a thousand papers on F1TENTH and RoboRacer. This is a selection, by topic. | 1 (3 sentences, 31 words), 5 ("Here is"); wording per lead review, keeps the thousand |
| Research.tsx, header button | See the Scholar query | Search Google Scholar | 2 ("query") |
| Research.tsx, ledger label (live + loading) | Curated papers | Papers listed | 2 ("curated") |
| Research.tsx, Featured lead | Recent work on the platform, newest first. Filter by topic; each topic also links to its own Scholar search. | Papers that build on RoboRacer. Filter by topic, and each topic links to its own Scholar search. | 3 ("the platform"), fact: the featured grid is not newest first (xLAB papers lead, AV4EV 2024 is second) |
| Research.tsx, load error | The publication list could not load. The Scholar query above covers everything. | The list didn't load. Try the Google Scholar search above. | 2 ("query"), 8 |
| Research.tsx, empty topic | No featured paper is tagged {topic} yet. The full list below and the Scholar search cover it. | No featured paper on {topic} yet. Try the full list or the Scholar search. | 5 ("below"), 8 |
| Research.tsx, list eyebrow | All curated | All papers | 2 ("curated") |
| Research.tsx, list title | All curated publications | Every paper we track | 2 ("curated") |
| Research.tsx, list lead | Every paper we track, grouped by year. The topic filter above applies here too. | By year, newest first. The topic filter above works here too. | title now says "every paper we track"; kept the one fact the lead adds (order) |
| Research.tsx, no search match | No curated paper matches. Try a shorter term, or search Scholar for "…". | No paper matches. Try a shorter word, or search Scholar for "…". | 2 ("curated") |
| Research.tsx, Submit lead | Published something that builds on the platform? Send the DOI or arXiv link and we add it to the curated list. | Send us the DOI or arXiv link for your RoboRacer paper. We'll add it to the list. | 2 (question, "curated"), 3 ("the platform") |

Layout note: the header lead drops from two lines to about one at desktop. The
header grid aligns to the bottom (`md:items-end`), so the ledger on the right
still lines up; nothing depends on the lead's length.

Left alone on purpose:

- h1 "1,000+ publications reference the platform" is the wording the content
  skill prescribes for this message, so "the platform" stays there.
- "no link on file" / "find on Scholar" (card and row), "Figure: X et al.",
  the type labels ("Conference paper", "Preprint", ...) and "arXiv / DOI / PDF"
  are short, plain and already verb + object where they are links.
- Tag labels ("Control and MPC", "Sim-to-real and simulation", ...) live in
  `publications.json`, which is out of scope.

Count: 44 strings reviewed (28 in Research.tsx, 16 in the research components
and the labels they render), 11 changed (all in Research.tsx), 33 left.
