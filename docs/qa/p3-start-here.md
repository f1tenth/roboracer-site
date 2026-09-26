# QA: Start here (p3-start-here, 2026-09-25)

Cedric's note (2026-09-25): small images in line with the Start here
descriptions; merge the landing's Platform chapter into Start here so the two
stop repeating; /about's opening becomes "Start here", clear for students and
sponsors, and good for professors without addressing them.

## What changed

- **Landing.** One "00 Start here" under the hero replaces the entry-path row
  (old 00) and the pinned Platform chapter (old 03). Header and one line on
  what RoboRacer is on the left (sticky beside the list from lg), five rows on
  the right: small 16/10 picture, "01 Build" label, one sentence, one link.
  Stacked below lg, picture beside the text on phones. Sections renumber:
  00 Start here, 01 Highlights, 02 The car, 03 Community, 04 Our partners,
  05 Next race, 06 Teams, 07 Research, 08 Join.
- **/about.** Hero unchanged, then "01 Start here" (the story and scale beside
  the ICRA group photo, then the same five rows, fuller: the bigger frame with
  its clip and caption, and a second sentence), 02 People, 03 Our partners,
  04 Spinoffs, 05 Videos, 06 Join. Phones get the small pictures instead of
  five full-width frames.
- **One component, one file.** `ui/StartHere.tsx` (`density="compact" | "full"`)
  renders both; `public/data/paths.json` drives both, with the platform media
  folded in. Deleted: `ui/PlatformPanel.tsx`, `about/PlatformList.tsx`,
  `ui/EntryPaths.tsx`, `public/data/platform.json`.
- **Media.** Five 480x300 thumbs in `public/media/start/` (92 KB together), cut
  from media the site already carries (manifest ST-01 to ST-05). The Sponsor
  row uses the IFAC 2026 field photo (NEWS-01); the thumb's file name avoids
  the word "sponsor", which ad blockers match.

## Checks

| Check | Result |
|---|---|
| Viewports | 1536x730, 1366x650, 1920x1080, 390x844, 844x390, 768x1024, both routes: `docs/qa/p3-start-here/after-*.png` (before: `before-*.png`) |
| Console errors | none on `/` or `/about`, any viewport |
| h1 | one per page |
| Layout shift | Start here section: none. Page CLS 0 to 0.009, all from the hero text and /about's stat tickers (pre-existing; one 1536 landing run measured 0.064, all four shifts in `rr-hero-block`) |
| Images | every image in the section has width, height and alt; thumbs lazy |
| Media requested | landing: the five thumbs only. /about desktop: the posters and three clips, no thumbs. /about phone: the thumbs only, no clips or posters (display: none copies are never fetched) |
| Reduced motion | rows static and visible; /about requests no clip, the posters stand in (`after-*-reduced.png`) |
| Keyboard | nav "Start here" from /about lands on `/#start`, top 0, section focused; Tab then walks Build the car, Start the course, Find the next race, Browse the research, Write to contact@roboracer.ai; focus ring draws around the whole row (`after-keyboard-focus-*.png`) |
| axe | zero serious or critical on `/` and `/about` at 1536x730 and 390x844 |
| Seam | car chapter (ink) into Community 03 (paper) with no gap where Platform was (`after-seam-car-map-*.png`) |
| Lint, build | pass |

## Copy (every new sentence)

Landing lead: "RoboRacer is a self-driving race car at one-tenth scale that 90+
universities use for teaching, research and racing."

| Row | Sentence (both pages) | Second sentence (/about only) | Link |
|---|---|---|---|
| Build | Order the parts, build the car from the open-source guide and install its software. | The hardware, software and simulator are open source, so a lab builds its own cars instead of buying them. | Build the car |
| Learn | Lectures and labs on perception, planning and control: 15 weeks for a full semester, or 4 weeks to get a car race ready. | The slides, labs and grading rubrics are public, and Penn teaches the course as ESE 6150. | Start the course |
| Race | Any team can register for our races at the major robotics conferences. | Each race has its own site with its rules and results. | Find the next race |
| Research | A shared car for autonomy research, referenced by more than 1,000 publications. | Papers are sorted by topic, such as planning, reinforcement learning and education, and you can submit yours. | Browse the research |
| Sponsor | Reach the students and researchers who use the car at 90+ universities in 20+ countries. | The races run at conferences such as ICRA, IROS and IV. | Write to contact@roboracer.ai |

/about intro: kept its story paragraph as it was; the scale paragraph lost
its last sentence ("The next one is at IROS 2026 in Pittsburgh, September 28
to 30"), which goes stale on October 1; the "open source, so a lab builds its
own" line moved into the Build row; "It also covers moral decision making in
autonomous systems" was dropped.

## Left for Cedric

- The Learn row's picture is still the ICRA pit-work photo (the old platform
  poster, as briefed); a classroom or lab shot would say "course" better.
- Sponsor still mails contact@roboracer.ai (paths.json `todo`: no flyer or
  sponsor block exists yet).
