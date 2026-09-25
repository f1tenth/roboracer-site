# Copy brief: how roboracer.ai talks

Read this before writing or rewriting any text on the site: JSX strings, `title` /
`subtitle` / `lead` / `caption` / `label` / `alt` props, and every field in
`public/data/*.json`. Facts still come only from `.claude/skills/roboracer-content`
or from Cedric; this brief is about how to say them.

## Who reads it, who speaks

The reader is smart and does not know us yet: a sophomore who saw a race clip, a
professor deciding whether to teach with the car, a sponsor, a journalist.
The speaker is a race organizer talking to that visitor at the track between
heats. Direct, warm, specific, brief. Confident without selling.

## Rules

1. **Short.** A section lead is one sentence, two at most, under 20 words.
   A caption is under 10 words. A card body is under 25 words. Cut a sentence
   before you cut a fact.
2. **Plain words.** Say build, race, learn, car, course, team, lap, sensor, code.
   Never: ecosystem, leverage, empower, unlock, seamless, cutting-edge,
   state-of-the-art, world-class, journey, robust, holistic, vibrant, synergy,
   elevate, harness, foster, transformative, next-generation, innovative,
   curated, comprehensive, unparalleled, showcase, dive into, delve, landscape,
   passion, mission-driven, at scale. Never the shapes "whether you're X or Y",
   "not just X, it's Y", "where X meets Y", "more than a ...", "from X to Y" as
   decoration, or three nouns/adjectives in a row for rhythm. No rhetorical
   questions. No "Imagine". No em dashes; use a period or a comma.
3. **Concrete beats abstract.** Numbers, names, places, dates. "30 competitions
   since 2016", not "a long-running series". No fact available? Say less. Never pad.
4. **One idea per sentence.** Verb early, active voice, no stacked adjectives,
   no noun piles ("autonomous racing research platform" becomes "the car, the
   course and the races").
5. **Don't narrate the page.** No "In this section", no "Below you'll find", no
   restating what the photo already shows, no telling the reader how to feel
   ("exciting", "thrilling", "incredible"). The video does that.
6. **Headlines** are 2 to 5 words, sentence case, no period. **Subtitles** make
   one clear claim. **Buttons and links** are verb + object ("Build the car",
   "Read the rules"), never "Learn more", "Explore", "Discover" or "Get started"
   on their own.
7. **Names.** "RoboRacer (formerly F1TENTH)" at most once per page, then
   RoboRacer. xLAB in caps. Teams and institutions spelled as the content skill
   spells them. Missing fact: write `TODO(content): ...`, never invent.
8. **The test.** Read it aloud. If the race director would not say it to a
   student at the track, rewrite it. If the sentence could sit on any robotics
   site, cut it or make it specific to us.

## Before and after

| Before | After |
|---|---|
| A vibrant global community of researchers, students and enthusiasts pushing the boundaries of autonomous racing. | Teams from 20 countries. Most started with one car and a course. |
| Whether you're a seasoned roboticist or just getting started, RoboRacer offers a comprehensive platform to learn, build and compete. | Build the car in a weekend. Race it at IROS in the fall. |
| Explore our cutting-edge research ecosystem. | Papers that used the car. |
| Dive into the theory behind autonomy with our curated course materials. | The course: perception, localization, planning, control. |
| Join us on this journey. | Come race. |
| An open-source vehicle system that empowers anyone to build and race. | The car is open source. Anyone can build one and race it. |

## For the rewrite agents

For each page, list every user-visible string with its location, rewrite the
ones that break a rule, keep the facts, and write a before/after table to
`docs/copy/<page>.md` so the reviewer reads the table, not the code. Alt text
stays descriptive (it may exceed the length limits) but follows rule 2.
