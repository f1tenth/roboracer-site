# Site chrome copy pass, phase 2: nav, footer, page titles

Files: `src/components/NavBar.tsx`, `src/components/Footer.tsx`,
`src/components/Layout.tsx` (the per-route document titles). Rules are
numbered as in `docs/copy/BRIEF.md`.

| Location | Before | After | Rule broken |
|---|---|---|---|
| NavBar.tsx, the outlined nav button (desktop bar and phone menu) | Join Community | Join the Slack | 6 (title case), 3 (says where the link goes: it opens the Slack invite). Same character count, so the bar keeps its width. Matches "Join the Slack" in the Join block |
| Footer.tsx, line under the logo | Advancing autonomous racing through innovation, education, and competition. | Open-source autonomous racing since 2016. | 2 ("advancing … through innovation", three nouns for rhythm), 8 (could sit on any robotics site). Same words as the /about h1 |
| Footer.tsx, column heading | Quick Links | Quick links | 6 (sentence case) |
| Footer.tsx, line under "Join Slack" | Connect with our community to get started and ask questions. | Ask questions and get race news first. | 2 ("connect with our community", "get started"). Race news going to Slack first is the phase 1 NewsEmpty line |

Left alone on purpose:

- Nav links ("About", "Build", "Learn", "Race", "Rules", "Research", "News",
  "Simulator"), "Start here", "Open menu" / "Close menu", "RoboRacer home".
- Footer links and headings ("Resources", "Community", "Class leaderboard",
  "Join Slack", "Sponsor a race", contact@roboracer.ai).
- "© 2026 RoboRacer Foundation. All rights reserved." and "Creative Commons
  License" are legal lines, not copy. They also contradict each other ("all
  rights reserved" next to a Creative Commons license that names no license
  and links nowhere). That's a question for Cedric, not a rewrite.
- Layout.tsx titles: all eleven are a page name plus " - RoboRacer" and the
  landing's is the hero headline ("RoboRacer - autonomous racing, built and
  raced in the open"). Short, plain, no rule broken.

Not there: Layout.tsx sets only `document.title`. No route sets its own meta
description; the only one is the site-wide description in `index.html`
(phase 1). Per-route descriptions need a small piece of code in Layout (update
the `<meta name="description">` tag with the title), so they're out of scope
for a strings-only pass. If the lead wants them, the eleven lines can be
written from the section leads in these tables.

Count: 46 strings reviewed (NavBar 14, Footer 21, Layout 11 titles), 4 changed
(the nav button counts once though it appears twice), 42 left.
