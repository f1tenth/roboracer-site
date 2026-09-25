# public/data/platform.json copy pass, phase 2

The four pillars. Rendered twice: the landing's pinned dial (03 Platform,
`ui/PlatformPanel`) and the flat list on /about (02 The platform,
`about/PlatformList`). Visible fields: `title`, `body`, `linkText` and
`media.caption`. `media.credit` stays in the JSON and is not rendered.

| Location | Before | After | Rule broken |
|---|---|---|---|
| build, body | An open-source vehicle system: hardware designs and software anyone can build and race. | Open-source hardware and software. Anyone can build the car and race it. | 2, 4 ("vehicle system" is a noun pile; the brief's own example) |
| learn, body | Course materials on perception, localization, planning, and safe control. | Lectures and labs on perception, localization, planning and safe control. | 3 ("course materials" is vague; the course is lectures and labs, per paths.json). Oxford comma dropped to match the rest of the site |
| race, body | An international competition series at the major robotics conferences. | Races at the major robotics conferences. Any team can enter. | 4 (noun pile "international competition series"), 3 (says who can race, as /race does) |
| research, body | A common, citable platform for autonomy research. | A shared car for autonomy research. More than a thousand papers reference it. | 3 (abstract; the thousand papers is the content skill's number for this message), 4 (stacked adjectives) |
| research, media caption | MPPI overtaking in the gym · UPenn | MPPI overtaking in the simulator · UPenn | 2 ("the gym" is the F1TENTH gym, which a newcomer can't know is the simulator) |

Layout note: on the landing only the active pillar's body shows, in a fixed
block under the dial; every new body is one or two lines, like the old ones. On
/about the body sits in the 8-column text beside a 4-column clip that sets
the row height, so a shorter body changes nothing.

Left alone on purpose: the titles ("Build", "Learn", "Race", "Research"), the
links ("Build the car", "Start the course", "See the races", "Browse the
research", all verb + object) and the other three captions ("assembling a car,
2x speed · build tutorial", "pit work on a car · ICRA 2026, Vienna", "two cars
through the corner · ICRA 2025, Atlanta").

Count: 16 strings reviewed (4 titles, 4 bodies, 4 links, 4 captions),
5 changed, 11 left.
