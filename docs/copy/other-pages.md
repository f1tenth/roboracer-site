# Rules chrome, iframe pages, error page, index.html

Files: `src/pages/Rules.tsx` (chrome only; `public/rules.md` is verbatim from
the rules repository and was not touched), `src/pages/Build.tsx`,
`src/pages/Learn.tsx`, `src/pages/Chat.tsx`, `src/components/RouteBoundary.tsx`,
`index.html`.

| Location | Before | After | Rule broken |
|---|---|---|---|
| index.html, `<meta name="description">` | (none) | RoboRacer (formerly F1TENTH) is an open-source 1/10-scale autonomous race car, the course that teaches it, and an international race series since 2016. | added: the page had no description. 151 characters. Uses the one "formerly F1TENTH" the content skill allows in SEO metadata. No counts, so it does not go stale after IROS |
| index.html, noscript paragraph | This site renders in the browser, so it cannot show you anything with JavaScript turned off. Everything below works without it. | Turn on JavaScript to see this site. These links work without it. | 1 (22 words), 2 ("renders in the browser") |
| RouteBoundary.tsx, body after a redeploy | This usually means the site was updated while the tab was open, so part of the page is no longer available — reloading fetches the current version. If reloading does not help, a content or ad blocker may be blocking one of the page's files; allowing roboracer.ai will fix it. | The site was updated while this tab was open. If reloading doesn't help, allow roboracer.ai in your ad or content blocker. | 1 (47 words), 2 (em dash), 4 |
| RouteBoundary.tsx, body on other errors | The rest of the site still works — use the navigation above, or reload to try this page again. | The rest of the site still works. Use the menu above, or reload to try again. | 2 (em dash) |
| RouteBoundary.tsx, button | Reload | Reload the page | 6 (verb + object) |
| Build.tsx, iframe `title` (screen readers) | F1Tenth Documentation | RoboRacer build documentation | 7 (name, and "F1Tenth" is misspelled) |
| Learn.tsx, iframe `title` | F1Tenth Course Kit Documentation | RoboRacer course material | 7, 2 |
| Chat.tsx, iframe `title` | Build | RoboRacer build documentation | the frame shows the build docs; "Build" alone tells a screen reader nothing |

Left alone on purpose:

- index.html `<title>RoboRacer</title>`: every route sets its own title in
  `src/components/Layout.tsx` (out of scope for this pass), so this only shows
  before the app mounts.
- The noscript h1 "RoboRacer needs JavaScript" and its four links ("Course
  material and lectures", "Build the car: bill of materials and assembly",
  "Source code and simulator on GitHub", "Join the community on Slack").
- Rules.tsx: the source note ("The general rules for in-person competitions,
  from the official rules repository. Each competition adds its own rules on
  its own site. Marked text is new or changed in this draft."), the load error
  and "Loading the rules." are plain and every sentence carries a fact.
- RouteBoundary eyebrows and headings ("This page was updated", "Reload to get
  the new version", "Something went wrong on this page", "This page did not
  load").

Count: 22 strings reviewed (Rules 5, Build 1, Learn 1, Chat 1, RouteBoundary 7,
index.html 7), 7 changed, 15 left, plus 1 added (the meta description).
