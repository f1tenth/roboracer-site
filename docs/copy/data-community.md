# public/data/community.json copy pass

Rendered by `CommunityJoin` on the landing page and on /about: the Join photo,
the featured Open Robotics post, and the marquee of eleven community posts.
The marquee cards show no headline, so each excerpt is the card's only line of
copy.

| Location | Before | After | Rule broken |
|---|---|---|---|
| join.post.excerpt (Open Robotics) | Featured by Open Robotics: how far the community has come in a few short years. | Open Robotics on how far the community has come. | 2 ("in a few short years" is filler) |
| join.posts, post-knapp-538432, excerpt | On the parallels between autonomous motorsport and intralogistics. | What autonomous racing has in common with warehouse logistics. | 2 ("intralogistics", "motorsport") |
| join.posts, post-meghaj-kabra-054784, excerpt | Roboracer @ Purdue placed P10 at IV 2026, its first competition. | Roboracer @ Purdue placed 10th at IV 2026, its first competition. | 2 ("P10") |
| join.posts, post-mateus-karvat-541826, excerpt | A first RoboRacer competition with Ingenuity Labs Racing at ICRA 2026 in Vienna. | Ingenuity Labs Racing's first RoboRacer competition, at ICRA 2026 in Vienna. | 8 (awkward word order) |
| join.posts, post-cedric-hollande-699200, alt | Cédric Hollande and Dhyey Shah hold their car … | Cedric Hollande and Dhyey Shah hold their car … | 7 (the site spells the name Cedric, per the content skill; `author` and `credit` keep the LinkedIn account name) |

Kept as they are:

- `join.post.excerpt_note` still says `TODO(content): one sentence in Cedric's
  words`. The new excerpt is shorter but still ours, not Cedric's.
- The Join photo caption keeps its visible `verify` tag ("4th F1TENTH Korea
  Championship · Incheon, Nov 2025 · verify").
- "Second place at IV 2026 with a Frenet-frame MPC and an overtaking planner."
  keeps the technical terms. They are the specific part of that post, and a
  race director would say them to a student.
- "Two years with LAMARRacing, from CDC Milan 2024 to 1st in time trials at ICRA
  2026." is a literal two-year span, not the decorative "from X to Y".
- The YouTube title ("Autonomous RC Racing (The RoboRacer Foundation 24th Race
  Highlights)") is the video's real title. Author names and affiliations are
  names.

Count: 49 strings reviewed (Join photo alt and caption, the Open Robotics
excerpt and credit, the YouTube caption, and alt, excerpt, affiliation and
credit on each of the 11 posts), 5 changed, 44 left.
