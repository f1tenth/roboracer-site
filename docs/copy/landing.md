# / (landing) copy pass, phase 2

Files: `src/pages/Landing.tsx` and the landing components it imports with their
own text: `ui/HeroChapter`, `ui/EntryPaths`, `ui/ExplodedModel` (plus the
callout labels it reads from `racecarAssemblyData.ts`), `ui/WorldMapChapter`,
`ui/NextRaceSpotlight`, `ui/TeamGrid`, `ui/PlatformPanel`, `ui/ResearchCarousel`,
`ui/CommunityJoin`, `ui/YouTubeFacade`, `ui/SocialButton`. Data-driven text
(platform.json, paths.json, highlights.json, community.json, teams.json) has
its own table. Rules are numbered as in `docs/copy/BRIEF.md`. The hero video and
clip configuration were not touched; only the strings below changed.

| Location | Before | After | Rule broken |
|---|---|---|---|
| Landing.tsx, hero sub-line (`HERO_DESCRIPTION`) | RoboRacer is the open-source platform for learning robotics on a real one-tenth-scale car: perception, planning and control, a worldwide community that shares its work, and an international competition series at the largest robotics conferences, growing every year. | RoboRacer is an open-source race car at one-tenth scale. Program it to drive itself, then race it at the largest robotics conferences. | 1 (43 words, one sentence), 2 (a list for rhythm), 3 ("growing every year" is padding), 4. Written with Cedric (2026-08-22), changed because it breaks four rules. Kept his claims: open source, one-tenth scale, the largest robotics conferences. The community line is dropped here; section 04 carries it. If he wants his sentence back, revert this row |
| Landing.tsx, 01 Highlights lead | 30+ competitions since 2016. Podiums, overtakes, packed exhibition halls. | Moments from 30+ competitions since 2016. | 2 (three nouns for rhythm), 5 (the reel shows the podiums and the halls) |
| Landing.tsx, 03 Platform lead | A car anyone can build, courses that teach autonomy, races that test it, and research that grows on top. | All four start with the same open-source car. | 2 (four-part list for rhythm), 5 (the subtitle "Build. Learn. Race. Research." and the dial already list them) |
| Landing.tsx, 05 title | Our Partners | Our partners | 6 (sentence case) |
| Landing.tsx, 07 Teams lead | Physical AI, raced: RL policies, MPPI and MPC controllers, multi-agent overtaking strategies, all on the same car. Seeded from the results pages of recent competitions; entries are tagged until verified. | Teams from recent races, with their best result. An unverified tag means we're still checking the details. | 1 (32 words), 2 (jargon pile, "seeded"), 5 (describes how the grid was built). The controller list moves to the Research lead, where it belongs. Tag wording now matches /race |
| Landing.tsx, 08 Research lead | This is physical AI at one-tenth scale: the teams you see racing run reinforcement learning policies, MPPI and model predictive controllers on real cars, and multi-agent strategy decides the overtakes. A Google Scholar search for the platform returns more than a thousand results; eight of the papers we feature: | Teams race reinforcement learning policies and model predictive controllers on real cars. Eight papers to start with. | 1 (50 words), 4. The thousand results stay in the subtitle ("1,000+ publications build on this platform") and the Scholar button |
| Landing.tsx, 08 button | See the Scholar query | Search Google Scholar | 2 ("query"); same wording as /research |
| Landing.tsx, 08 link | All curated publications | See every paper | 2 ("curated"), 6 (verb + object). The one the brief named |
| Landing.tsx, car photo 2 alt (`CAR_PHOTOS[1]`) | Portrait view of a RoboRacer car at ICRA 2026 | Rendered image of a RoboRacer car, portrait view | fact: the image is AI-generated (code comment, landing v5 A9), so it must not read as a photo from an event. Lead's instruction |
| Landing.tsx, car photo 2 caption | portrait view · ICRA 2026 | rendered view | same |
| ExplodedModel.tsx, state 1 body ("Race-ready") | One car, assembled. Chassis, plate, LiDAR and wheels sit where the open-source URDF puts them. | Every part sits where the open-source design puts it. | 2 ("URDF" is jargon for a newcomer), 5 (the model shows the assembled car) |
| ExplodedModel.tsx, state 2 body ("What is inside") | Eleven parts: the chassis, the accent plate, the LiDAR, the Jetson Orin, the power board, the VESC, the steering servo, and four wheels. | Eleven parts: chassis, platform deck, LiDAR, Jetson Orin, power board, VESC, steering servo and four wheels. | 1 (26 words), 7 ("accent plate" is our file name; /assembly calls it the platform deck). Same eleven parts |
| ExplodedModel.tsx, state 3 body ("Build your own") | The whole assembly is open source. Pull it apart frame by frame in the interactive viewer. | The whole car is open source. Take it apart in the 3D viewer. | 2 ("frame by frame" no longer describes /assembly, which goes part by part) |
| ExplodedModel.tsx, link to /assembly | Explore the car in the interactive viewer | Open the 3D viewer | 6 ("Explore") |
| ExplodedModel.tsx, canvas loading line | Loading CAD model… | Loading the 3D model… | 2 ("CAD"); /assembly already says "Loading the 3D model" |
| WorldMapChapter.tsx, 04 lead | From Pittsburgh to Busan, students build and race the same open-source car. | Every team builds and races the same open-source car. | 2 ("from X to Y" as decoration), 5 (the map beside it shows the cities) |
| NextRaceSpotlight.tsx, rules button (external rules link, the landing's case) | Rules | Read the rules | 6 (verb + object); /race already uses "Read the rules" |

Layout notes: the hero sub-line drops from about four lines to two at desktop;
it is centered under the headline with nothing aligned to its bottom, so no
hole. The Teams and Research leads lose two to three lines each; both sit in a
`SectionHeader` whose action column aligns independently. The Platform lead
sits inside the pinned composition above the media frame and gets shorter by a
line; the frame is centered, so it moves up slightly and nothing breaks.

Left alone on purpose:

- The hero headline ("Autonomous racing / built and raced / in the open"),
  written with Cedric and inside every rule.
- 06 Next race subtitle "Come to our next race": Cedric's wording from the
  landing v5 round two. It echoes the title, but it is plain and it is his.
- "The car" / "One tenth the size, the full problem", the three state captions
  ("Race-ready", "What is inside", "Build your own"), "Studio photo · RoboRacer".
- The callout labels on the 3D car ("Hokuyo UTM-30LX · 2D LiDAR", "NVIDIA
  Jetson Orin · compute", "Steering servo · verify", ...). Product names; the
  "verify" on the servo is a status mark that stays until the servo model is
  confirmed.
- Community chapter: "Community", "Teams from around the world", the four
  counter labels, the ticker, the map key, and the map's `<desc>` (a screen
  reader description, allowed to be long).
- Partner ribbon: "{n} institutions · alphabetical" and the row labels.
- Join block ("Join", "Join {n} people building and racing", "Join the Slack",
  "From the community", "View on LinkedIn ↗", "updated", "photo pending").
- Carousel controls and states ("Read the paper ↗", "Previous paper", "Next
  paper", "No featured papers yet."), "Team site", "institution tbc",
  "unverified", "Start here", "scroll", "Play footage" / "Pause footage".
- The other media captions and alt text ("the hall · ICRA 2026, Vienna",
  "start line · ICRA 2026", "our post on LinkedIn ↗").

Question for Cedric: `CAR_PHOTOS[1]` is an AI-generated image. Its alt and
caption now say so ("rendered view"). Keep it, or swap it for a real photo of
the car?

Count: 111 strings reviewed. Landing.tsx 29; components 82: HeroChapter 3,
EntryPaths 1, ExplodedModel 13 plus 7 callout labels, WorldMapChapter 13,
NextRaceSpotlight 10, TeamGrid 4, PlatformPanel 2 (its row text is
platform.json), ResearchCarousel 9, CommunityJoin 17, YouTubeFacade 2,
SocialButton 1. 17 changed (10 in Landing.tsx, 5 in ExplodedModel, 1 each in
WorldMapChapter and NextRaceSpotlight), 94 left.
