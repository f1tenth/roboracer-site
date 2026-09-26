# News candidates from LinkedIn

Research for the News page (Cedric, 2026-09-25: "The news section is missing a lot of content from the earlier days"). Source: public LinkedIn pages only, no login. Machine-readable version: `docs/news/candidates-linkedin.json` (same order, same ids). Nothing here is on the site yet; the merge agent picks from this list and dedupes against the web and Drive sweeps.

## How this was built

- The Foundation's LinkedIn page is the old F1Tenth Foundation page, renamed: `/company/f1tenth-foundation` redirects to `/company/roboracer-foundation`. Its public page shows only the ten newest activities, so older posts were found with about 60 web searches restricted to linkedin.com (organizers, teams, events), then each post page was read with curl for its structured data (date, author, text, images) and its own share/ugcPost URN.
- About 110 posts and articles were read; slide and poster images of text-light posts were viewed (in the scratchpad, none kept). 49 were kept as candidates; 37 more are listed as leads with the reason they were not selected.
- Every candidate was checked against `public/data/news.json` by link and by URN: no candidate duplicates an existing item. Stories about events that already have a news item (ICRA 2026, IV 2026, IFAC 2026) are listed under *Enrichments* instead.
- Titles and excerpts are our own words. Facts list only what the post shows, with where it shows it. Dates: event date for results and race recaps (post date kept in `post_date`), post date for everything else. Event dates missing from a post come from `docs/EVENTS_VERIFICATION.md` and are named in the notes.

## Counts

| Period | Candidates | Priority A |
|---|---|---|
| 2016-2019 | 3 | 1 |
| 2020-2023 | 14 | 6 |
| 2024 | 15 | 8 |
| 2025 | 11 | 6 |
| 2026 | 6 | 4 |
| **Total** | **49** | **25** |

By kind: announcement 15, post 14, result 12, milestone 8. Priority: A = lead item, B = supporting, C = filler or context.

## The ten strongest

1. **F1TENTH is now RoboRacer** (2025-02-19, Rahul Mangharam) `f1tenth-is-now-roboracer`
2. **NSF funds F1/10 as a community platform for safe autonomy** (2019-08-15, Rahul Mangharam) `nsf-community-platform-award-2019`
3. **VAUL keeps its title at IEEE Smart Mobility 2024 in Niagara Falls** (2024-09-18, François Pomerleau) `sm2024-vaul-keeps-title`
4. **ForzaETH third at the 21st Grand Prix, IROS 2024** (2024-10-18, ForzaETH by Autonomous Racing Zürich) `iros2024-forzaeth-third`
5. **ForzaETH wins the ICRA 2023 competition in London** (2023-06-01, Rahul Mangharam) `icra2023-forzaeth-wins`
6. **Scuderia Segfault takes silver at ICRA 2023, a fourth straight podium** (2023-06-01, TTTech Auto) `icra2023-scuderia-segfault-silver`
7. **ForzaETH wins the 2022 F1TENTH Grand Prix Germany** (2022-08-21, ETH Zurich, Department of Information Technology and Electrical Engineering) `germany2022-forzaeth-gold`
8. **Scuderia Segfault takes third of 38 teams at ICRA 2022** (2022-05-25, TU Wien Informatics) `icra2022-scuderia-segfault-third`
9. **Looking back at the 30th competition in Boston** (2026-09-06, Neobotics Foundation Inc.) `vtc2026-boston-recap`
10. **Siga Siga Racing wins the 6th Sim Racing League at IROS 2026** (2026-09-24, AutoDRIVE Ecosystem) `iros2026-sim-league-results`

## Flags for Cedric before anything ships

- **Sponsors.** `iros2026-autoware-tier-iv-sponsors` is the Foundation's own post naming the Autoware Foundation and TIER IV as IROS 2026 sponsors; the content skill still says no sponsor is confirmed. `icra2024-tier-iv-sponsor` makes TIER IV a historical sponsor. Both need your OK.
- **Unconfirmed winners.** VTC 2026 (Firebird, George Mason) comes from a competitor's post; IROS 2024's winner (Lukasz Sztyber) is implied, not stated. Check the race results pages.
- **Numbers that conflict with the site.** Top speed (50 mph in 2019, 40 mph in 2024), 'teaching F1Tenth since 2015' (site says founded 2016), '50+ papers in four years' (site says 1,000+), ICRA 2026 team count (36 in ForzaETH's post vs about 30 in the Foundation's), IFAC 2026 (55 teams implied vs 56). None of these numbers are in excerpts.
- **Rename date.** The clearest public line is Rahul's "F1Tenth is now RoboRacer.AI" (2025-02-19). The exact rename date is TODO(content).
- **Photos.** Image URLs are listed for reference only. Nothing was downloaded into the repo; each photo needs the author's permission (media manifest) before use.

## Candidates

### 2016-2019

#### The F1/10 racing simulator goes open source

`f110-simulator-open-source-2019` · 2019-03-01 · milestone · event: none · priority B · confidence high

Madhur Behl announced that the F1/10 autonomous racing simulator was open source and packaged as a Docker image. It ships with perception, planning and control algorithms so a team can start racing before it owns the hardware.

- Author: [Madhur Behl](https://www.linkedin.com/in/madhurbehl) (Organizer, University of Virginia (Link Lab))
- Post: https://www.linkedin.com/posts/madhurbehl_f1tenth-linklab-autonomousdriving-activity-6507312215958310912-8ZO_
- Embed: `urn:li:ugcPost:6507312117417340928`
- Images: 1
- Facts: The F1/10 Autonomous Racing simulator is open source and available as a Docker image (text); It provides several perception, planning and control algorithms to start racing without the F1/10 hardware (text)
- Notes: Video post; the image URL is the video cover. Earliest organizer post about the platform found on LinkedIn.

#### A Philadelphia audience meets the 1/10-scale autonomous race cars

`venture-cafe-talk-writeup-2019` · 2019-05-05 · post · event: none · priority C · confidence medium

Michael Coraluzzi wrote up Rahul Mangharam's late-April 2019 talk at Venture Cafe Philadelphia on safe self-driving cars and F1/10 racing. He explains the series as a fully autonomous race where students learn perception, planning and control, and notes that Matthew O'Kelly of Penn demonstrated a car.

- Author: [Michael Coraluzzi](https://www.linkedin.com/in/michael-coraluzzi) (Community)
- Post: https://www.linkedin.com/pulse/how-1-tenth-size-f1-autonomous-car-racing-rapidly-michael-coraluzzi
- Embed: none (link out)
- Images: 1
- Facts: Rahul Mangharam presented 'Safe Self-Driving Cars and F1/10 Autonomous Racing' at Venture Cafe Philadelphia in late April (article text); Matthew O'Kelly, University of Pennsylvania, demonstrated an autonomous F1-tenth car (article text)
- Notes: LinkedIn Pulse article, not a feed post: there is no feed embed, link out instead. Third-party write-up; the talk month is 'late April', year from the article date (2019-05-05).

#### NSF funds F1/10 as a community platform for safe autonomy

`nsf-community-platform-award-2019` · 2019-08-15 · milestone · event: none · priority A · confidence high

Rahul Mangharam announced a $1.5M National Science Foundation award to grow F1/10 into shared infrastructure for autonomy research and teaching. Penn, Oregon State and Clemson lead the effort, with more than 35 partner universities in the community.

- Author: [Rahul Mangharam](https://www.linkedin.com/in/mangharam) (Organizer, University of Pennsylvania)
- Post: https://www.linkedin.com/pulse/f110-autonomous-racing-community-platforms-safe-agile-rahul-mangharam
- Embed: none (link out)
- Images: 0
- Facts: NSF funded $1.5MM to develop community platforms for Safe, Agile and Coordinated Autonomy (article text); Collaboration of the University of Pennsylvania, Oregon State University and Clemson University (article text); Over 35 partner universities in the F1/10 community (article text); Cars are 1/10th the size of a Formula 1 car and can reach 50 mph (article text)
- Notes: LinkedIn Pulse article (no feed embed). The '50 mph' top speed conflicts with the 2024 Penn video ('up to 40 miles per hour'); do not publish a top speed without Cedric. '35 partner universities' is a 2019 count, not today's '90+'.

### 2020-2023

#### Online tutorial: learn to drive and race scaled autonomous cars

`learn-to-drive-tutorial-2022` · 2022-03-22 · announcement · event: none · priority C · confidence high

Venkat Krovi shared a free online tutorial on driving and racing scaled autonomous vehicles, held on Zoom on March 25, 2022, from 10 am to 2 pm EDT. The post linked the registration page and the agenda.

- Author: [Venkat N. Krovi](https://www.linkedin.com/in/venkatnkrovi) (Organizer, Clemson University)
- Post: https://www.linkedin.com/posts/venkatnkrovi_f1tenth-activity-6911826048028430336-97CT
- Embed: `urn:li:share:6911826047353147392`
- Images: 1
- Facts: Tutorial 'Learn to Drive (and Race!) Scaled Autonomous Vehicles', Friday March 25, 2022, 10 am to 2 pm EDT, on Zoom (text)
- Notes: Thin news value; one of very few 2022 organizer posts. Tagged #F1tenth only.

#### ICRA 2022 workshop on autonomous racing comes to Philadelphia

`icra2022-racing-workshop` · 2022-05-16 · announcement · event: icra2022 · priority B · confidence high

Johannes Betz announced a full-day ICRA 2022 workshop in Philadelphia on the opportunities and challenges of autonomous racing. The program had nine invited speakers and 14 contributed papers, co-organized with Madhur Behl and Venkat Krovi.

- Author: [Johannes Betz](https://www.linkedin.com/in/johannes-betz-254049107) (Organizer)
- Post: https://www.linkedin.com/posts/johannes-betz-254049107_autonomousdriving-autonomousracing-motorsports-activity-6932031511042908160-mteV
- Embed: `urn:li:share:6932031507356106752`
- Images: 3
- Facts: Full-day IEEE ICRA 2022 workshop 'Opportunities and Challenges with Autonomous Racing' in Philadelphia, one week after the post (text); 9 speakers and 14 contributed papers (text); Co-organized with Madhur Behl (UVA) and Venkat N. Krovi (Clemson) (text)
- Notes: Workshop, not the race itself. Three images attached (speaker cards, not reviewed in detail).

#### An FPV drone's view of the ICRA 2022 track

`icra2022-fpv-drone-view` · 2022-05-25 (posted 2022-05-31) · post · event: icra2022 · priority C · confidence high

Between practice sessions at ICRA 2022, Davide Lanzoni of the University of Bologna's UNIBO Racing F1Tenth team flew an FPV racing drone over the track. Madhur Behl shared the footage.

- Author: [Madhur Behl](https://www.linkedin.com/in/madhurbehl) (Organizer, University of Virginia)
- Post: https://www.linkedin.com/posts/madhurbehl_f1tenth-autonomousracing-drones-activity-6937393624192098304-0oh-
- Embed: `urn:li:ugcPost:6937393534496894977`
- Images: 1
- Facts: FPV drone footage of the F1Tenth track between practice sessions (text); Pilot Davide Lanzoni (LanzoFPV) from the University of Bologna's UNIBO Racing F1Tenth team (text); Tagged #icra2022 (text)
- Notes: Video post. Date is the ICRA 2022 race end date (May 23 to 25, per docs/EVENTS_VERIFICATION.md, icra2022-race.f1tenth.org); the post is dated 2022-05-31.

#### Scuderia Segfault takes third of 38 teams at ICRA 2022

`icra2022-scuderia-segfault-third` · 2022-05-25 (posted 2022-06-02) · result · event: icra2022 · priority A · confidence high

TU Wien's Scuderia Segfault finished third at the 10th F1TENTH Autonomous Grand Prix in Philadelphia. Thirty-eight teams from around the world took part.

- Author: [TU Wien Informatics](https://www.linkedin.com/company/tu-wien-informatics) (Team: Scuderia Segfault, TU Wien)
- Post: https://www.linkedin.com/posts/tu-wien-informatics_3rd-place-at-the-f1tenth-autonomous-grand-activity-6938036574127345664-73fb
- Embed: `urn:li:share:6938036572999073792`
- Images: 1
- Facts: Scuderia Segfault placed 3rd of 38 teams (text); 10th F1TENTH Autonomous Grand Prix in Philadelphia (text)
- Notes: Post dated 2022-06-02; event date from docs/EVENTS_VERIFICATION.md (ICRA 2022, May 23 to 25). Winner of ICRA 2022 is not in any LinkedIn post found.

#### A semester of autonomous racing in Penn's course

`penn-course-race-semester-2022` · 2022-06-24 · post · event: none · priority C · confidence high

Rahul Mangharam closed out a semester of course races at Penn that pushed student cars on perception, planning and control. He thanked Johannes Betz, Hongrui Zheng and Zirui Zang.

- Author: [Rahul Mangharam](https://www.linkedin.com/in/mangharam) (Organizer, University of Pennsylvania)
- Post: https://www.linkedin.com/posts/mangharam_teaching-autonomous-racing-is-fun-we-had-activity-6946109948502167552-xnBK
- Embed: `urn:li:ugcPost:6946109859117359104`
- Images: 1
- Facts: A semester of races in the autonomous racing course (text); Team thanked: Johannes Betz, Hongrui Zheng, Zirui Zang (text)
- Notes: Video post. Course race, not a numbered competition.

#### ForzaETH wins the 2022 F1TENTH Grand Prix Germany

`germany2022-forzaeth-gold` · 2022-08-21 (posted 2022-08-24) · result · event: germany2022 · priority A · confidence high

ETH Zurich's ForzaETH, a student team from the Center for Project-Based Learning and the Institute of Neuroinformatics, won the Germany 2022 Grand Prix. The team raced at two F1TENTH events that season.

- Author: [ETH Zurich, Department of Information Technology and Electrical Engineering](https://www.linkedin.com/company/eth-zurich-department-of-information-technology-and-electrical-engineering) (Team: ForzaETH, ETH Zurich)
- Post: https://www.linkedin.com/posts/eth-zurich-department-of-information-technology-and-electrical-engineering_team-racingcars-winners-activity-6968168515782459393-FZSx
- Embed: `urn:li:share:6968168514989789184`
- Images: 0
- Facts: ForzaETH finished first at the 2022 F1TENTH Autonomous Grand Prix Germany (text); Team from the Center for Project-Based Learning at D-ITET (PBL) and the Institute of Neuroinformatics (INI), ETH Zurich and University of Zurich (text); Competed at two F1TENTH autonomous racing challenges (text); Team: Edoardo Ghignone, Nicolas Baumann, Jonas Kühne, Nadine Imholz, Luca Schwarzenbach, Florian Bolli, Jonathan Becker, Daniel Pfister, Xiang Deng, Marcin Paluch (text)
- Notes: Post dated 2022-08-24; event date from docs/EVENTS_VERIFICATION.md (Lausitzring, August 20 to 21, 2022). Embed URN read from the reshare card on Tommaso Polonelli's post (the ETH page itself did not expose it). Text-only post.

#### Where to start: free lectures, labs and a simulator

`getting-started-kit-2022` · 2022-10-10 · post · event: none · priority B · confidence high

Rahul Mangharam pointed newcomers to a free starting path: a tutorial to take before building a car, the 2022 course lectures, labs 1 to 4 and 6, and the simulator and track files on GitHub. He named f1tenth.org as the home for courses, competitions and the community.

- Author: [Rahul Mangharam](https://www.linkedin.com/in/mangharam) (Organizer, University of Pennsylvania)
- Post: https://www.linkedin.com/posts/mangharam_f1tenth-autonomousvehicles-autoware-activity-6985040585644507136-t2m1
- Embed: `urn:li:share:6985040584725905408`
- Images: 1
- Facts: Start with a tutorial before building the car (text); 2022 Autonomous Racing Course lectures online (text); Do labs 1-4 and 6 to get ready to race (text); Simulator, racetrack files and a reading list on github.com/f1tenth (text); f1tenth.org is the main source for courses, competitions and the community (text)
- Notes: Good 'Learn' history item. Links in the post are lnkd.in short links (not resolved).

#### Winners crowned at the 12th competition, CPS-IoT Week 2023

`cps2023-12th-winners` · 2023-05-09 (posted 2023-05-27) · result · event: cps2023 · priority A · confidence medium

Rahul Mangharam congratulated the winners of the 12th F1TENTH Autonomous Racing Competition at CPS-IoT Week in Texas: Jason Xie, Chandravaran Kunjeti, Rohit Bhikule and Zheming Zhang. He thanked organizers Joydeep Biswas and Xuesu Xiao.

- Author: [Rahul Mangharam](https://www.linkedin.com/in/mangharam) (Organizer, University of Pennsylvania)
- Post: https://www.linkedin.com/posts/mangharam_f1tenth-cpsweek-autonomousdriving-activity-7068234768298987520-Xbad
- Embed: `urn:li:share:7068234767267192832`
- Images: 1
- Facts: Winners of the 12th F1TENTH Autonomous Racing Competition at Cyber-Physical Systems IoT Week in Texas (text); Winners named: Jason Xie, Chandravaran Kunjeti, Rohit Bhikule, Zheming Zhang (text); Organizers thanked: Joydeep Biswas, Xuesu Xiao and their teams (text); Photo: four team members with a car carrying a Penn sticker (image 1)
- Notes: Post dated 2023-05-27; event date from docs/EVENTS_VERIFICATION.md (San Antonio, May 8 to 9, 2023). The post names people, not a team or institution; tagged #upenn. TODO(content): team name and institution. A related post (2023-05-11, https://www.linkedin.com/posts/mangharam_f1tenth-autonomousracing-autonomousvehicles-activity-7062420311786315776-Gq5g) mentions NC State teams.

#### ForzaETH wins the ICRA 2023 competition in London

`icra2023-forzaeth-wins` · 2023-06-01 (posted 2023-06-13) · result · event: icra2023 · priority A · confidence high

ETH Zurich's ForzaETH won the F1TENTH Autonomous Racing Competition at ICRA 2023. Rahul Mangharam shared the result alongside the team's paper on its model- and acceleration-based pursuit controller.

- Author: [Rahul Mangharam](https://www.linkedin.com/in/mangharam) (Organizer, University of Pennsylvania)
- Post: https://www.linkedin.com/posts/mangharam_model-and-acceleration-based-pursuit-controller-activity-7074191619058462720-Cebb
- Embed: `urn:li:share:7074191618345443328`
- Images: 1
- Facts: ETHz's ForzaETH team won the ICRA 2023 F1TENTH Autonomous Racing Competition (text); Post reshares the 'Model- and Acceleration-based Pursuit Controller' paper (link card title)
- Notes: Post dated 2023-06-13; event date from docs/EVENTS_VERIFICATION.md (ExCeL London, May 29 to June 1, 2023). news.json already has 'eth-pbl-map-controller' (the controller video), which is a different story.

#### Scuderia Segfault takes silver at ICRA 2023, a fourth straight podium

`icra2023-scuderia-segfault-silver` · 2023-06-01 (posted 2023-06-13) · result · event: icra2023 · priority A · confidence high

TU Wien's Scuderia Segfault won silver at the 11th F1TENTH Autonomous Grand Prix at ICRA 2023 in London. Team sponsor TTTech Auto noted it was the team's fourth podium in a row.

- Author: [TTTech Auto](https://www.linkedin.com/company/tttech-auto) (Partner (Scuderia Segfault sponsor))
- Post: https://www.linkedin.com/posts/tttech-auto_tttech-auto-celebrates-tu-wiens-scuderia-activity-7074311454002143232-_wo2
- Embed: `urn:li:share:7074311453184286720`
- Images: 1
- Facts: Scuderia Segfault (TU Wien Informatics) won silver at the 11th F1TENTH Autonomous Grand Prix (text); At IEEE ICRA 2023 in London (text); Fourth consecutive podium placement (text)
- Notes: Post dated 2023-06-13. Numbering: ICRA 2023 is the 11th and CPS-IoT 2023 the 12th although CPS ran first; this matches the race sites. 'Fourth consecutive podium' implies podiums at the three races before (IROS 2021 win and ICRA 2022 third are consistent), not verified here.

#### MAD-Games workshop on multi-agent racing opens IROS 2023

`iros2023-madgames-workshop` · 2023-10-01 · announcement · event: iros2023-madgames · priority C · confidence high

The first MAD-Games workshop on multi-agent dynamic games ran on Sunday, October 1, 2023 at IROS, with a Zoom link for remote attendees. Rahul Mangharam listed a speaker line-up that included Peter Stone and Panagiotis Tsiotras.

- Author: [Rahul Mangharam](https://www.linkedin.com/in/mangharam) (Organizer, University of Pennsylvania)
- Post: https://www.linkedin.com/posts/mangharam_mad-games-workshop-oct-1-2023-activity-7114071772483780608-S69D
- Embed: `urn:li:ugcPost:7114071771569418240`
- Images: 0
- Facts: MAD Games, Multi-Agent Dynamic Games Workshop at IROS'23, Sunday Oct 1, 8:30 am US ET, on Zoom (text); Tagged people include Hongrui Zheng, Johannes Betz, Venkat N. Krovi, Peter Stone, Panagiotis Tsiotras (text)
- Notes: The post lists names without roles; 'speaker line-up' is our reading, confirm before using. past_races.json has 'IROS 2023 Mad Games'.

#### The 14th Grand Prix at IROS 2023 streams live

`iros2023-14th-grand-prix-livestream` · 2023-10-05 (posted 2023-10-04) · post · event: iros2023 · priority B · confidence medium

Venkat Krovi shared the live Twitch stream of the 14th F1TENTH Autonomous Grand Prix at IROS 2023 in Detroit. The post carries no result.

- Author: [Venkat N. Krovi](https://www.linkedin.com/in/venkatnkrovi) (Organizer, Clemson University)
- Post: https://www.linkedin.com/posts/venkatnkrovi_14th-f1tenth-autonomous-grand-prix-activity-7115357729652707328-8Ck0
- Embed: `urn:li:share:7115357729069666304`
- Images: 1
- Facts: 'The twitch stream is live now' (text); Link card titled '14th F1TENTH Autonomous Grand Prix' (card title)
- Notes: Post dated 2023-10-04, during IROS 2023 (Oct 1 to 5, Huntington Place, Detroit, per docs/EVENTS_VERIFICATION.md). No result in the post. Search snippets and autoware.org say VAUL won with Autoware entrants Po-Jen Wang 2nd and Tejas Agarwal 3rd; no LinkedIn post with that result could be read, so leave the result to the web agent.

#### TUM launches a hands-on F1TENTH course

`tum-f1tenth-course-2023` · 2023-10-20 · milestone · event: none · priority A · confidence high

Johannes Betz and Felix Jahncke started a practical course at TUM called F1TENTH: Autonomous Driving Hands-on, where students code and tune software for a small-scale autonomous car. The first cohort had 15 students from six countries.

- Author: [Johannes Betz](https://www.linkedin.com/in/johannes-betz-254049107) (Organizer, Technical University of Munich)
- Post: https://www.linkedin.com/posts/johannes-betz-254049107_my-next-ride-is-a-robot-together-with-activity-7121155857114968064-ocCj
- Embed: `urn:li:ugcPost:7121155856179617792`
- Images: 3
- Facts: New practical course 'F1TENTH: Autonomous Driving Hands-on' at TUM, winter semester (text); 15 students from six nations (text); Betz credits Rahul Mangharam for introducing him to F1TENTH (text)
- Notes: Three classroom photos attached.

#### UVA students program their first autonomous car

`uva-course-first-autonomous-laps-2023` · 2023-11-01 · post · event: none · priority C · confidence high

Madhur Behl shared assignment demos from his F1Tenth course at UVA, where students use ROS, LIDAR data and a PID controller to lap the track on their own. Later assignments build up to cars racing each other for the final exam.

- Author: [Madhur Behl](https://www.linkedin.com/in/madhurbehl) (Organizer, University of Virginia)
- Post: https://www.linkedin.com/posts/madhurbehl_f1tenth-ros-autonomousracing-activity-7125480966826913792-O9SM
- Embed: `urn:li:ugcPost:7125480895242743808`
- Images: 1
- Facts: Students program an autonomous vehicle with ROS, a PID controller and LIDAR data (text); Course ends with multiple cars racing for the final exam (text); Behl: 'Since its inception in 2015, I've had the pleasure of teaching F1Tenth' (text)
- Notes: Video post. The '2015' in the post conflicts with the site's 'founded 2016'; do not repeat the year without Cedric.

### 2024

#### A new crowd-sourced power board for the car

`power-distribution-board-2024` · 2024-02-14 · milestone · event: none · priority A · confidence high

The community pooled an order for a new power distribution board designed and built by Ambimat Electronics. Past 120 boards the price would fall below $100 each, and five international competitions were planned for 2024.

- Author: [Rahul Mangharam](https://www.linkedin.com/in/mangharam) (Organizer, University of Pennsylvania)
- Post: https://www.linkedin.com/posts/mangharam_f1tenth-autonomousvehicles-autonomousracing-activity-7163339430689239041-V0Ss
- Embed: `urn:li:share:7163339429900718080`
- Images: 1
- Facts: Crowd-sourcing the new power distribution board; sign-up for a ready-made PCB (text); Crossing 120 boards gives a price break below $100 per board; order finalized Feb 23 (text); 5 international competitions in 2024 (text); Design and production by Ambimat Electronics (text); Photo of the board, silkscreen 'AE170_PDU_01.01 JAN-24' (image 1)
- Notes: The same author wrote '7 International Competitions this year' on 2024-05-11; the count grew during the year.

#### The 15th competition heads to ICRA 2024 in Yokohama

`icra2024-15th-announced` · 2024-04-16 · announcement · event: icra2024 · priority A · confidence high

The F1Tenth Foundation posted the poster for the 15th F1TENTH Autonomous Racing Competition at ICRA 2024 in Yokohama, Japan, May 13 to 17, 2024. The poster pointed teams to icra2024-race.f1tenth.org.

- Author: [The Roboracer Foundation (then F1Tenth Foundation)](https://www.linkedin.com/company/roboracer-foundation) (Organizer)
- Post: https://www.linkedin.com/posts/roboracer-foundation_f1tenth-autonomous-autonomousracing-activity-7185950717939994625-MhQH
- Embed: `urn:li:share:7185950717151444992`
- Images: 1
- Facts: 15th F1TENTH Autonomous Racing Competition, May 13-17, 2024 (poster); ICRA 2024, Yokohama, Japan (poster); Site icra2024-race.f1tenth.org (poster)
- Notes: Post text is hashtags only; facts are on the poster. Alternative with more text: Rahul Mangharam 2024-02-25 (https://www.linkedin.com/posts/mangharam_f1tenth-autonomous-racing-competition-at-activity-7167654499124240384-cByi), which gives May 14-16 race days and hosts UPenn, Clemson and TUM. The ICRA 2024 winner (VAUL per search snippets) has no readable LinkedIn post.

#### Penn, CMU and Lehigh students race in Philadelphia

`penn-cmu-lehigh-grand-prix-2024` · 2024-04-27 · announcement · event: none · priority C · confidence high

Three universities that teach the same 1/10-scale racing course, Penn, Carnegie Mellon and Lehigh, set up a friendly Grand Prix in Philadelphia. Rahul Mangharam announced it for the following Monday.

- Author: [Rahul Mangharam](https://www.linkedin.com/in/mangharam) (Organizer, University of Pennsylvania)
- Post: https://www.linkedin.com/posts/mangharam_penn-cmu-lehigh-autonomous-racing-grand-activity-7189971586496520192-UeN2
- Embed: `urn:li:share:7189800656742883328`
- Images: 1
- Facts: Penn + CMU + Lehigh Autonomous Racing Grand Prix on Monday in Philly (text); All three teach the same course with 1/10th scale cars (text)
- Notes: Course race, not numbered. The post says 'on Monday' only.

#### TIER IV sponsors the ICRA 2024 Grand Prix

`icra2024-tier-iv-sponsor` · 2024-04-29 · announcement · event: icra2024 · priority B · confidence high

TIER IV announced its sponsorship of the F1TENTH Autonomous Grand Prix at ICRA 2024 at PACIFICO Yokohama. The company invited visitors to watch engineers race autonomous cars there.

- Author: [TIER IV](https://www.linkedin.com/company/tier-iv-inc) (Partner (sponsor))
- Post: https://www.linkedin.com/posts/tier-iv-inc_15th-f1tenth-autonomous-grand-prix-activity-7190590790182604801-GGS4
- Embed: `urn:li:share:7190590789511458816`
- Images: 1
- Facts: TIER IV sponsors the F1TENTH Autonomous Grand Prix at ICRA 2024 (text); Venue PACIFICO Yokohama (text)
- Notes: Historical sponsor, stated by the sponsor itself. Content skill: historical sponsors are TODO(content); Cedric decides before the site names TIER IV as a past sponsor. TIER IV's race-week post (2024-05-15) adds: race day and award ceremony May 16, Exhibition Hall C.

#### More than 100 racers from 19 teams at ICRA 2024

`icra2024-19-teams` · 2024-05-15 · post · event: icra2024 · priority A · confidence high

On the eve of the ICRA 2024 Grand Prix in Yokohama, Rahul Mangharam counted more than 100 participants from 19 teams ready to race head to head. He called it a battle of perception, planning and control algorithms.

- Author: [Rahul Mangharam](https://www.linkedin.com/in/mangharam) (Organizer, University of Pennsylvania)
- Post: https://www.linkedin.com/posts/mangharam_f1tenth-at-icra-is-rocking-the-grand-prix-activity-7196512343537713153-CBT6
- Embed: `urn:li:share:7196512342694576128`
- Images: 1
- Facts: >100 participants from 19 teams will race head-to-head (text); The Grand Prix is on Thursday (text)
- Notes: Reshares TIER IV's race-week post. Related: 2024-05-11 post 'Join over 100 participants ... 7 International Competitions this year' (https://www.linkedin.com/posts/mangharam_f1tenth-autonomous-racing-competitions-2024-activity-7195044996926898176-r0Go).

#### A trophy for Lukasz Sztyber at ICRA 2024

`icra2024-lukasz-sztyber-trophy` · 2024-05-16 · post · event: icra2024 · priority C · confidence medium

The F1Tenth Foundation posted a photo of Lukasz Sztyber with a trophy and his car beside the F1TENTH banner at ICRA 2024. The post does not state his placing.

- Author: [The Roboracer Foundation (then F1Tenth Foundation)](https://www.linkedin.com/company/roboracer-foundation) (Organizer)
- Post: https://www.linkedin.com/posts/roboracer-foundation_icra2024-engineering-activity-7196811928927621122-9cMs
- Embed: `urn:li:share:7196811928092966914`
- Images: 1
- Facts: Text: 'Lukasz Sztyber #ICRA2024 #Engineering' (text); Photo: Sztyber with a trophy, his car and the F1TENTH banner (image 1)
- Notes: Placing unknown; confirm on the ICRA 2024 results before writing one. ForzaETH's IROS 2024 post names Lukasz Sztyber ahead of Scuderia Segfault.

#### The 18th Grand Prix goes to IEEE IV 2024 on Jeju Island

`iv2024-18th-announced` · 2024-05-30 · announcement · event: iv2024 · priority A · confidence high

The F1Tenth Foundation announced the 18th F1Tenth Grand Prix at IEEE IV 2024, the 35th Intelligent Vehicles Symposium, June 2 to 5 at Jeju Shinhwa World in Korea. The card sent teams to iv2024-race.f1tenth.org.

- Author: [The Roboracer Foundation (then F1Tenth Foundation)](https://www.linkedin.com/company/roboracer-foundation) (Organizer)
- Post: https://www.linkedin.com/posts/roboracer-foundation_f1tenth-autonomousracing-autonomousmobility-activity-7201984268267372544-vxh3
- Embed: `urn:li:share:7201984267638161408`
- Images: 1
- Facts: The 18th F1Tenth Grand Prix (image card); IEEE IV 2024, 35th IEEE Intelligent Vehicles Symposium (image card); June 2-5, 2024, Jeju Shinhwa World, Jeju Island, Korea (image card); Site iv2024-race.f1tenth.org (image card)
- Notes: Card is Autoware Foundation branded. The race site says June 3 to 5 (docs/EVENTS_VERIFICATION.md); the card gives the conference span. No IV 2024 result post found.

#### Penn Engineering students race the cars they program

`penn-students-race-video-2024` · 2024-08-06 · post · event: none · priority B · confidence high

A University of Pennsylvania video follows students who design, build and race self-driving cars in the F1TENTH and AV4EV projects. Rahul Mangharam describes the jump from textbook theory to watching your own code drive.

- Author: [University of Pennsylvania](https://www.linkedin.com/school/university-of-pennsylvania) (Institution)
- Post: https://www.linkedin.com/posts/university-of-pennsylvania_f1tenth-activity-7226622408026132481-_DEs
- Embed: `urn:li:ugcPost:7226622407195697152`
- Images: 1
- Facts: Students design, build and compete with self-driving cars through the F1TENTH and AV4EV projects (text); Quote from Professor Rahul Mangharam on seeing code come to life (text); Cars are about a tenth the size of a Formula 1 car and navigate at up to 40 miles per hour (text)
- Notes: Video post by the university's main page. '40 mph' conflicts with the 2019 article's 50 mph; skip speeds unless Cedric confirms.

#### IROS 2024 adds the first simulated racing league

`iros2024-first-sim-league` · 2024-08-21 · milestone · event: iros2024 · priority A · confidence high

From IROS 2024 the competition added a first Simulated Racing and Digital Twin League next to the 21st Autonomous Racing Grand Prix held at the conference. Venkat Krovi invited the community to help grow the ecosystem.

- Author: [Venkat N. Krovi](https://www.linkedin.com/in/venkatnkrovi) (Organizer, Clemson University)
- Post: https://www.linkedin.com/posts/venkatnkrovi_starting-iros2024-the-f1tenth-racing-will-activity-7232141737446547456-5QM7
- Embed: `urn:li:share:7232141736595091457`
- Images: 1
- Facts: Starting IROS2024, F1tenth Racing includes the 1st Simulated Racing/Digital Twin League (text); In addition to the 21st Autonomous Racing Grand Prix, in-conference racing (text); Organizers tagged: Rahul Mangharam, Johannes Betz, Madhur Behl, Hongrui Zheng, Ahmad Amine, Chinmay Samak, Tanmay Samak, Venkat N. Krovi (text)
- Notes: Start of the Sim Racing League, which reached its 6th edition at IROS 2026 (see iros2026-sim-league-results).

#### VAUL keeps its title at IEEE Smart Mobility 2024 in Niagara Falls

`sm2024-vaul-keeps-title` · 2024-09-18 · result · event: sm2024 · priority A · confidence high

Université Laval's VAUL won the race at IEEE Smart Mobility 2024, averaging an estimated 25 km/h with about 40 km/h on the straight. West Virginia University's WV Mountaineers placed second and The Roaring Phenix, from St. Stephen's Episcopal School in Austin, third.

- Author: [François Pomerleau](https://www.linkedin.com/in/fpomerleau) (Organizer, Université Laval)
- Post: https://www.linkedin.com/posts/fpomerleau_racing-results-for-the-f1tenth-foundation-activity-7242288003233062912-FVy2
- Embed: `urn:li:ugcPost:7242287722860621825`
- Images: 1
- Facts: 1st Laval University Autonomous Vehicle (VAUL), keeps its international title; estimated 25 km/h average and 40 km/h top speed on the straight (text); 2nd WV Mountaineers, West Virginia University (Amr El-Wakeel) (text); 3rd The Roaring Phenix, St. Stephen's Episcopal School, Austin, Texas (text); Honorable mention: Justin Barrada, first participation (text); Video: VAUL overtaking in the final round (video)
- Notes: Post dated 2024-09-18, the last race day (SM 2024, Niagara Falls, September 16 to 18 per docs/EVENTS_VERIFICATION.md; the 19th competition per the race site, the post gives no number). Rahul Mangharam's reshare (2024-09-27) names organizers François Pomerleau, Zeinab El-Sayegh, Ahmad Amine, Khalid Elgazzar and Ammar Elmoghazy: https://www.linkedin.com/posts/mangharam_amazing-f1tenth-autonomous-racing-competition-activity-7245455430498271233-iZ_U

#### The 22nd Grand Prix is set for CDC 2024

`cdc2024-22nd-announced` · 2024-09-19 · announcement · event: cdc2024 · priority B · confidence high

IEEE CDC announced the 22nd F1TENTH Autonomous Grand Prix for December 16 to 19, 2024, with time-trial seeding followed by a head-to-head knockout. Cars and hardware are standardized, so the race is decided by perception, planning and control software.

- Author: [IEEE CDC](https://www.linkedin.com/company/ieee-cdc-social) (Partner (host conference))
- Post: https://www.linkedin.com/posts/ieee-cdc-social_22nd-f1tenth-autonomous-grand-prix-activity-7242563142902329345--0R-
- Embed: `urn:li:share:7242563142264717312`
- Images: 1
- Facts: 22nd F1TENTH Autonomous Grand Prix at #CDC2024, December 16-19, 2024 (text); Qualification by time trials, then a head-to-head knockout (text); Vehicles and hardware are standardized (text)
- Notes: The post does not name Milan; Rahul Mangharam's 2024-10-22 post says 'CDC'24 Milan'. Results of CDC 2024 not found on LinkedIn beyond one team post (cdc2024-team-fifth-fastest).

#### Scuderia Segfault second at IROS 2024 in Abu Dhabi

`iros2024-scuderia-segfault-second` · 2024-10-18 (posted 2024-10-25) · result · event: iros2024 · priority A · confidence high

TU Wien's Scuderia Segfault finished second at the F1Tenth Foundation Autonomous Grand Prix at IROS 2024 in Abu Dhabi. The university credited its students for racing well in challenging conditions.

- Author: [TU Wien Informatics](https://www.linkedin.com/company/tu-wien-informatics) (Team: Scuderia Segfault, TU Wien)
- Post: https://www.linkedin.com/posts/tu-wien-informatics_scuderiasegfault-f1tenth-autonomousracing-activity-7255597729664434176-mBu-
- Embed: `urn:li:share:7255550448982495232`
- Images: 1
- Facts: Scuderia Segfault 2nd at the F1Tenth Foundation Autonomous Grand Prix at IROS 2024 in Abu Dhabi (text); Photo credit © TU Wien, Moritz Christamentl (text)
- Notes: Post dated 2024-10-25; event date from docs/EVENTS_VERIFICATION.md (IROS 2024, October 14 to 18, the 21st competition). Scuderia Segfault's own 2024-11-13 post shows the TU Wien rector celebrating the result.

#### ForzaETH third at the 21st Grand Prix, IROS 2024

`iros2024-forzaeth-third` · 2024-10-18 (posted 2024-10-30) · result · event: iros2024 · priority A · confidence high

ForzaETH qualified second at IROS 2024 with a 7.14 s lap of a roughly 35 m carpet track, about 18 km/h on average. A crash in the head-to-head rounds left the team third, behind Lukasz Sztyber and Scuderia Segfault.

- Author: [ForzaETH by Autonomous Racing Zürich](https://www.linkedin.com/company/forzaeth-arzh) (Team: ForzaETH, ETH Zurich)
- Post: https://www.linkedin.com/posts/forzaeth-arzh_last-week-the-forzaeth-race-team-participated-activity-7257415887622672384-4BJw
- Embed: `urn:li:ugcPost:7257415884846043136`
- Images: 3
- Facts: 21st F1TENTH Autonomous Grand Prix at IROS (text); Very grippy carpet floor (text); 7.14 s lap over a roughly 35 m track, about 5 m/s (18 km/h) average; qualified 2nd (text); Crashed out in head-to-head, finished 3rd behind Lukasz Sztyber and Scuderia Segfault (text); Organizers thanked: Rahul Mangharam, François Pomerleau, Chinmay Samak, Tanmay Samak (text)
- Notes: Post dated 2024-10-30 ('last week'). Read with the TU Wien post, the IROS 2024 podium is Lukasz Sztyber 1st, Scuderia Segfault 2nd, ForzaETH 3rd; the post does not say 'won', so confirm with the results page before stating a winner.

#### 20 teams qualify for the 2nd Sim Racing League at CDC 2024

`cdc2024-sim-league-qualifiers` · 2024-12-02 · announcement · event: cdc2024 · priority B · confidence high

AutoDRIVE published the qualifying results of the second F1TENTH Sim Racing League at CDC 2024. Twenty teams from around the world moved on to the competition round.

- Author: [AutoDRIVE Ecosystem](https://www.linkedin.com/company/autodrive-ecosystem) (Partner (Sim Racing League organizer))
- Post: https://www.linkedin.com/posts/autodrive-ecosystem_cdc2024-autodrive-f1tenth-activity-7269403467759108096-Lawp
- Embed: `urn:li:share:7269403466291101696`
- Images: 1
- Facts: Qualification round results of the 2nd F1TENTH Sim Racing League @ CDC 2024 (text); 20 teams qualified for the competition round (text)
- Notes: IEEE CDC (2024-10-29) reported 37 registered teams before the deadline: https://www.linkedin.com/posts/ieee-cdc-social_cdc2024-f1tenth-perception-activity-7256959957219078144-dlcV . AutoDRIVE held a winners' celebration at CDC on December 16, 2024: https://www.linkedin.com/posts/autodrive-ecosystem_cdc2024-autodrive-f1tenth-activity-7274413681344483328-euAK . Sim league winners not found.

#### Fifth-fastest of 12 at the 22nd Grand Prix in Milan

`cdc2024-team-fifth-fastest` · 2024-12-19 (posted 2024-12-20) · post · event: cdc2024 · priority C · confidence high

Anthony Garcia's team set an 8.46 s best lap in time trials at CDC 2024, fifth of 12 teams, before going out midway through the head-to-head bracket. The team raced an MPPI controller on an Intel NUC.

- Author: [Anthony Garcia](https://www.linkedin.com/in/wontothree) (Team (name not given))
- Post: https://www.linkedin.com/posts/wontothree_cdc-f1tenth-activity-7275996075893604355-uPQk
- Embed: `urn:li:ugcPost:7275996021258665984`
- Images: 1
- Facts: 22nd F1TENTH Autonomous Grand Prix at CDC Milan 2024 (text); Fastest lap 8.46 s, 5th of 12 teams in the time trial (text); Knocked out midway through the head-to-head tournament (text); MPPI controller on an Intel NUC (text)
- Notes: Post dated 2024-12-20. Useful mainly for the field size (12 teams). Team and institution not named in the post.

### 2025

#### US Transportation Secretary meets the RoboRacer cars

`dot-secretary-meets-roboracer-2025` · 2025-01-13 · milestone · event: none · priority B · confidence high

Rahul Mangharam showed RoboRacer autonomous race cars to US Transportation Secretary Pete Buttigieg and DOT Chief Science Officer Robert C. Hampshire. He called racing an effective way to train the next generation of transportation engineers.

- Author: [Rahul Mangharam](https://www.linkedin.com/in/mangharam) (Organizer, University of Pennsylvania)
- Post: https://www.linkedin.com/posts/mangharam_great-to-see-the-roboracer-foundation-autonomous-activity-7284385707119239168-RGQO
- Embed: `urn:li:ugcPost:7284385706234249216`
- Images: 3
- Facts: RoboRacer autonomous racecars shown to DoT Secretary Pete Buttigieg and DoT Chief Science Officer Robert C. Hampshire (text); RoboRacer is an effective way to train the next generation of transportation engineers (text); Three photos (images 1-3)
- Notes: Photos show public officials; ask Rahul before using the photos on the site.

#### F1TENTH is now RoboRacer

`f1tenth-is-now-roboracer` · 2025-02-19 · milestone · event: none · priority A · confidence high

Opening the 2025 season at ICRA, Rahul Mangharam wrote that F1Tenth is now RoboRacer.AI. The post tagged the wider organizing group, including Johannes Betz, Madhur Behl, Venkat Krovi, Joydeep Biswas, Hyungpil Moon, Xuesu Xiao and Marko Bertogna.

- Author: [Rahul Mangharam](https://www.linkedin.com/in/mangharam) (Organizer, University of Pennsylvania)
- Post: https://www.linkedin.com/posts/mangharam_icra2025-activity-7297995364735856640-TT6l
- Embed: `urn:li:share:7297995363527897089`
- Images: 1
- Facts: 'F1Tenth is now RoboRacer.AI' (text); Launch of the 2025 competition at ICRA (text); Tagged: Johannes Betz, Madhur Behl, Venkat N. Krovi, Joydeep Biswas, Hyungpil Moon, Xuesu Xiao, Marko Bertogna (text)
- Notes: Clearest public statement of the rename found. Two weeks earlier (2025-02-03) he posted 'Join us at RoboRacer.AI' with the Autoware Foundation and a plan to scale from 1/10 to 1/5, 1/2 and full-size vehicles: https://www.linkedin.com/posts/mangharam_join-us-at-roboracerai-the-roboracer-foundation-activity-7292127209262071808-KL78 . The company page itself was renamed: https://www.linkedin.com/company/f1tenth-foundation now redirects to /company/roboracer-foundation. Exact rename date: TODO(content), ask Cedric or Rahul.

#### Registration opens for the 24th competition at ICRA 2025 in Atlanta

`icra2025-24th-registration-open` · 2025-02-19 · announcement · event: icra2025 · priority A · confidence high

The Roboracer Foundation opened registration for the 24th Roboracer Autonomous Racing Competition at ICRA 2025, May 19 to 23 at the Georgia World Congress Center in Atlanta. The season brought new rule adjustments and a first orientation session on March 18.

- Author: [The Roboracer Foundation](https://www.linkedin.com/company/roboracer-foundation) (Organizer)
- Post: https://www.linkedin.com/posts/roboracer-foundation_2025icra-autonomousracing-icra2025-activity-7297948638578692096-_Kzv
- Embed: `urn:li:share:7297948637324541953`
- Images: 1
- Facts: 24th edition of the Roboracer Autonomous Racing Competition at ICRA 2025, Georgia World Congress Center (text); New rule adjustments; first orientation session March 18 (text); May 19-23, 2025; site icra2025-race.roboracer.ai (poster); First poster with the RoboRacer wordmark and 'Simple / Fast / Open Source' (poster)
- Notes: First Foundation post found under the RoboRacer name.

#### TUM releases a 3D LiDAR kit for the car

`tum-3d-lidar-kit-2025` · 2025-03-12 · post · event: none · priority B · confidence high

Felix Jahncke, Moritz Wagner and Johannes Betz at TUM published an open repository that adds a Livox MID-360 3D LiDAR and a working SLAM pipeline to the car with a single install command. It includes drivers, a mount CAD file, demo videos and ROS bags.

- Author: [Felix Jahncke](https://www.linkedin.com/in/felix-jahncke) (Research lab, TUM Autonomous Vehicle Systems Lab)
- Post: https://www.linkedin.com/posts/felix-jahncke_ever-dreamed-of-a-3d-lidar-for-your-roboracer-activity-7305504821309001729-dUUT
- Embed: `urn:li:share:7305504819941658625`
- Images: 1
- Facts: Repository integrating the Livox MID-360 3D LiDAR into the F1Tenth platform (text); Drivers, a proven SLAM algorithm, CAD files for a mounting adapter, videos and ROSbags (text); By Felix Jahncke, Moritz Wagner and Johannes Betz, TUM AVS Lab (text); Plans with Ahmad Amine and Rahul Mangharam to bring it into the native RoboRacer stack (text)
- Notes: Build-page material too.

#### A new non-profit for autonomous vehicle education: Neobotics Foundation

`neobotics-foundation-founded-2025` · 2025-03-18 · milestone · event: none · priority C · confidence high

Koneshka Dey, who led Boston University's F1TenthBU racing club, announced the Neobotics Foundation, a non-profit to standardize autonomous vehicle education. Its stated mission is to make robotics and autonomy accessible to students of all backgrounds.

- Author: [Koneshka Dey](https://www.linkedin.com/in/koneshka-dey-90437311b) (Partner (Neobotics Foundation))
- Post: https://www.linkedin.com/posts/koneshka-dey-90437311b_im-very-excited-to-announce-a-new-chapter-activity-7307572444368658434-DwTU
- Embed: `urn:li:share:7307572441663336448`
- Images: 1
- Facts: Founding of Neobotics Foundation Inc., a non-profit for standardizing autonomous vehicle education (text); Dey previously led the F1TenthBU Autonomous Racing Organization (text); Mentor Renato Mancuso; co-founders named (text)
- Notes: Context for VTC 2026, which Neobotics co-organized. CLAUDE.md: neobotics.org is a pattern reference only; this item is about the organization as a partner, and no assets from it may be copied. Low priority.

#### Call for teams: the Grand Prix comes to IEEE IV 2025 in Cluj-Napoca

`iv2025-call-for-teams` · 2025-04-09 · announcement · event: iv2025 · priority A · confidence high

Bassam Alrifaee announced the F1TENTH Autonomous Grand Prix at IEEE IV 2025 in Cluj-Napoca, Romania, with solo time trials followed by a head-to-head knockout. Teams of up to four paid 10 EUR per participant and brought their own car.

- Author: [Bassam Alrifaee](https://www.linkedin.com/in/bassam-alrifaee-5b592aa6) (Organizer)
- Post: https://www.linkedin.com/posts/bassam-alrifaee-5b592aa6_call-for-f1tenth-teams-ieee-iv-2025-activity-7315783741040201728-mYlf
- Embed: `urn:li:share:7315783737772826627`
- Images: 1
- Facts: F1TENTH Autonomous Grand Prix at IEEE IV 2025, Cluj-Napoca, Romania, June 22-25, 2025 (text); Two challenges: collision avoidance and lap time minimization; qualification time trials then knockout (text); Up to 4 members per team, 10 EUR per participant; teams bring their own car (text); Organized with Julius Beerwerth, Ahmad Amine, Mircea Paul Muresan, Ahmed Hussein, Johannes Betz, Rahul Mangharam (text)
- Notes: The post gives the conference span; the race site says June 22 to 23 (25th competition). The post mentions monetary prizes without amounts; the content skill bans prize amounts anyway. ForzaETH won IV 2025 per forzaeth.ch and search snippets; no LinkedIn result post could be read.

#### 58 teams in the 3rd Sim Racing League at ICRA 2025

`icra2025-sim-league-58-teams` · 2025-05 (posted 2025-07-21) · post · event: icra2025 · priority B · confidence high

An Autoware Foundation blog by Tanmay and Chinmay Samak looked back on the third RoboRacer Sim Racing League at ICRA 2025, run on the AutoDRIVE simulator. The league drew 58 teams and several zero-collision runs.

- Author: [Autoware Foundation](https://www.linkedin.com/company/the-autoware-foundation) (Partner)
- Post: https://www.linkedin.com/posts/the-autoware-foundation_autoware-opensource-coeblog-activity-7353118395388649474-i4au
- Embed: `urn:li:share:7353118393668984832`
- Images: 1
- Facts: 3rd Sim Racing League @ ICRA 2025: 58 teams, zero-collision runs (text); Powered by the AutoDRIVE Ecosystem (text); Blog authored by Tanmay Samak and Chinmay Samak (text)
- Notes: Post dated 2025-07-21. The sim league winner (VAUL, 111.46 s per search snippets) was not readable in any fetched post.

#### UCF's senior design team finishes 9th of 25 at ICRA 2025

`icra2025-ucf-ninth-of-25` · 2025-05-23 (posted 2026-02-24) · result · event: icra2025 · priority B · confidence high

A University of Central Florida team that began as a senior design project placed ninth of 25 teams at the ICRA 2025 competition, racing against graduate teams. Team member Israel Charles went on to found F1Tenth@UCF.

- Author: [Rahul Mangharam](https://www.linkedin.com/in/mangharam) (Organizer, University of Pennsylvania)
- Post: https://www.linkedin.com/posts/mangharam_roboracer-autonomousracing-robotics-activity-7432122168936919040-dans
- Embed: `urn:li:share:7431863295663382529`
- Images: 1
- Facts: UCF team (Israel Charles, Devin R. Hunter and team) finished 9th out of 25 teams at ICRA'25 (text); Started as a senior design project; undergraduates (text); Israel Charles founded F1Tenth@UCF (text)
- Notes: Post dated 2026-02-24; event date from docs/EVENTS_VERIFICATION.md (ICRA 2025, May 19 to 23). Gives the ICRA 2025 field size: 25 teams. The ICRA 2025 podium is not in any LinkedIn post read (ForzaETH 3rd per forzaeth.ch, not LinkedIn).

#### Six competitions on three continents for 2025-26

`season-2025-26-six-competitions` · 2025-10-03 · announcement · event: none · priority A · confidence high

The Roboracer Foundation published its 2025-26 calendar: ICCAS 2025 in Incheon, CDC 2025 in Rio de Janeiro, Techfest at IIT Bombay, ICRA 2026 in Vienna, IV 2026 in Detroit and VTC 2026 in Boston. It billed the season as racing across Asia, Europe and the Americas.

- Author: [The Roboracer Foundation](https://www.linkedin.com/company/roboracer-foundation) (Organizer)
- Post: https://www.linkedin.com/posts/roboracer-foundation_roboracer-autonomousracing-ai-activity-7379907884333031424-er5M
- Embed: `urn:li:share:7379907882953224192`
- Images: 1
- Facts: 6 global competitions (text and image); Nov 4-6, 2025 IEEE ICCAS 2025, Incheon (text); Dec 9-12, 2025 IEEE CDC 2025, Rio de Janeiro (text); Dec 22-24, 2025 Techfest, IIT Bombay (text); Jun 1-5, 2026 ICRA 2026, Vienna (text); Jun 22-25, 2026 IEEE IV 2026, Detroit (text); Sep 6-9, 2026 IEEE VTC 2026, Boston (text)
- Notes: Dates are conference spans; the CDC 2025 race site says December 10 to 12. IFAC 2026 and IROS 2026 were added later (see season-2026-four-competitions and the IROS items). The image has a group photo from an earlier race.

#### The 26th competition heads to Techfest at IIT Bombay

`techfest2025-26th-announced` · 2025-10-06 · announcement · event: techfest2025 · priority A · confidence high

The Roboracer Foundation announced the 26th Roboracer Autonomous Racing Competition at Techfest, IIT Bombay, December 22 to 24, 2025, on the IIT Bombay campus in Mumbai. Registration opened with the announcement.

- Author: [The Roboracer Foundation](https://www.linkedin.com/company/roboracer-foundation) (Organizer)
- Post: https://www.linkedin.com/posts/roboracer-foundation_roboracer-autonomousracing-ai-activity-7380971173129453568-dr7S
- Embed: `urn:li:share:7380971171753922560`
- Images: 1
- Facts: December 22-24, 2025, TechFest, IIT Bombay, India (text); 26th Roboracer Autonomous Racing Competition (poster); IIT Bombay Campus, Mumbai (poster)
- Notes: The only number for Techfest 2025 found anywhere (26th). Autoware Foundation (2025-12-16) confirms the 26th at Techfest and a parallel 4th RoboRacer Sim Racing League with IEEE CDC 2025: https://www.linkedin.com/posts/the-autoware-foundation_autoware-at-techfest-iit-bombay-2025-activity-7406483205341462528-4ebA . Results (Peaky Path Finders 1st, PulpFriction 2nd, both BITS Pilani Hyderabad; Sedrica-IITB 3rd) appear only in search snippets of a BITS Pilani faculty post that could not be opened; TODO(content) until the Techfest results are confirmed.

#### VAUL wins the virtual CDC 2025 race

`cdc2025-virtual-vaul-wins` · 2025-12 (posted 2025-12-16) · result · event: cdc2025 · priority A · confidence high

Université Laval's veteran VAUL team won the virtual competition held for CDC 2025, with a 7.74 s best lap and 78.19 s total time. The club's rookie team finished tenth.

- Author: [Laval University Autonomous Vehicle (VAUL)](https://www.linkedin.com/company/vaul) (Team: VAUL, Université Laval)
- Post: https://www.linkedin.com/posts/vaul_vaul-wins-autodrive-fastest-lap-774s-activity-7406716530094190592-29zl
- Embed: `urn:li:share:7406716528802336768`
- Images: 1
- Facts: First place in the virtual CDC 2025 competition (text, French and English); Best lap 7.74 s, total 78.19 s (text); Rookie team finished 10th (text)
- Notes: Post dated 2025-12-16. This is the simulation league (the 4th RoboRacer Sim Racing League per the Autoware post), not the 25th physical race in Rio. Link given as fr.linkedin.com by LinkedIn; www form used here.

### 2026

#### RoboRacer's 2026 season: Vienna, Detroit, Busan and Boston

`season-2026-four-competitions` · 2026-03-05 · announcement · event: none · priority B · confidence high

The Roboracer Foundation posted its 2026 calendar of four competitions: ICRA 2026 in Vienna, IV 2026 in Detroit, IFAC 2026 in Busan and VTC 2026 in Boston. The post framed each race as a real-world test bed for AI.

- Author: [The Roboracer Foundation](https://www.linkedin.com/company/roboracer-foundation) (Organizer)
- Post: https://www.linkedin.com/posts/roboracer-foundation_ai-robotics-autonomoussystems-activity-7435174596582150144-Ybmq
- Embed: `urn:li:share:7435174595575324672`
- Images: 1
- Facts: ICRA 2026 Vienna June 1-5; IV 2026 Detroit June 22-25; IFAC 2026 Busan Aug 24-27; VTC 2026 Boston Sep 6-9 (image); Competitions across Europe, North America and Asia (text); Link roboracer.ai/race (text and image)
- Notes: IROS 2026 is not on this calendar; it was added later. Rahul Mangharam posted the same image the same day: https://www.linkedin.com/posts/mangharam_2026-is-an-exciting-year-for-the-roboracer-activity-7435290477278531584-LVYx . Low priority because every 2026 race already has its own news item.

#### RoboRacer research in Germany

`roboracer-research-germany-2026` · 2026-04-06 · post · event: none · priority C · confidence medium

Rahul Mangharam highlighted RoboRacer-based research in Germany, pointing to work on extreme autonomy by Johannes Betz and Mattia Piccinini. He counted more than 50 papers using RoboRacer/F1Tenth in four years.

- Author: [Rahul Mangharam](https://www.linkedin.com/in/mangharam) (Organizer, University of Pennsylvania)
- Post: https://www.linkedin.com/posts/mangharam_great-to-see-the-roboracer-foundation-based-activity-7446737955701809152-kOd9
- Embed: `urn:li:share:7446737954779172864`
- Images: 1
- Facts: 'In 4 years there have been 50+ research papers using RoboRacer/F1Tenth' (text); Johannes Betz and Mattia Piccinini, extreme autonomy (text)
- Notes: The 50+ count is ambiguous (Germany only or overall) and far below the site's '1,000+ publications reference the platform'. Do not use the number.

#### Firebird from George Mason wins the 30th competition at VTC 2026

`vtc2026-firebird-wins` · 2026-09-06 (posted 2026-09-10) · result · event: vtc2026 · priority A · confidence medium

Competitor Connor McGovern congratulated Firebird from George Mason University on first place at the RoboRacer competition at IEEE VTC 2026 in Boston. His own team raced a map-free stack and thanked Neobotics Foundation and MIT Beaver Works Summer Institute for getting them on the grid.

- Author: [Connor McGovern](https://www.linkedin.com/in/connor-mcgovern-215153431) (Team (name not given))
- Post: https://www.linkedin.com/posts/connor-mcgovern-215153431_just-wrapped-up-a-great-weekend-at-ieee-vtc-activity-7503610769708756992-xdIy
- Embed: `urn:li:ugcPost:7503610768341532673`
- Images: 2
- Facts: 'Big congratulations to Firebird from George Mason University on first place' (text); RoboRacer competition at IEEE VTC, hosted by IEEE Vehicular Technology Society, The Roboracer Foundation and Neobotics Foundation (text); His team ran map-free algorithms (text)
- Notes: Original post dated 2026-09-10; the Foundation reposted it (https://www.linkedin.com/posts/roboracer-foundation_activity-7503625295988523008-PAsr). Race date from the event poster in the Neobotics post (Sunday 6 September 2026). A Neobotics award photo shows a 'P1 ... Trials' slide with 'Firebi...' on it. Winner comes from a competitor, not an organizer: confirm on https://vtc2026-race.roboracer.ai before publishing. news.json has no VTC 2026 item.

#### Looking back at the 30th competition in Boston

`vtc2026-boston-recap` · 2026-09-06 (posted 2026-09-21) · post · event: vtc2026 · priority A · confidence high

Neobotics Foundation, which organized the race with the Roboracer Foundation, shared photos from the 30th RoboRacer Autonomous Racing Competition at IEEE VTC 2026-Fall, held at the Hilton Boston Park Plaza on September 6, 2026. The event poster lists teams from Buffalo, Boston University, Florida, Northeastern, Victoria, Wisconsin-Madison and GIU, among others.

- Author: [Neobotics Foundation Inc.](https://www.linkedin.com/company/neobotics-foundation-inc) (Organizer (co-host))
- Post: https://www.linkedin.com/posts/neobotics-foundation-inc_roboracer-neobotics-f1tenth-activity-7507891143662145538-xHdb
- Embed: `urn:li:ugcPost:7507891142504521730`
- Images: 9
- Facts: Roboracer Competition at IEEE VTC2026-Fall Boston at Hilton Park Plaza; Neobotics organized it with The Roboracer Foundation (text); '30th Autonomous Racing Competition' on the screen (photo 6); '30th Autonomous Grand Prix' shirt (photo 9); Poster: Sunday 6 September 2026, Hilton Boston Park Plaza, 8:00 am to 5:00 pm (photo 8); Participating team logos: University at Buffalo, Boston University, University of Florida, Northeastern, University of Victoria, University of Wisconsin-Madison, GIU, one unidentified (photo 8)
- Notes: Original post dated 2026-09-21; Foundation repost: https://www.linkedin.com/posts/roboracer-foundation_activity-7507935046394376192-Bbo1 . Nine photos (group shots, award, cars, poster). Photos need permission from Neobotics before any download. Pair with vtc2026-firebird-wins for the result.

#### Siga Siga Racing wins the 6th Sim Racing League at IROS 2026

`iros2026-sim-league-results` · 2026-09-24 · result · event: iros2026 · priority A · confidence high

Siga Siga Racing Team from K. Smirnov Robotics in Cyprus won the sixth RoboRacer Sim Racing League in 71.82 s with no collisions, after qualifying 28th of 32. NTU DeepSpeed from Singapore finished second in 72.26 s and rulim from MIPT third in 73.97 s.

- Author: [AutoDRIVE Ecosystem](https://www.linkedin.com/company/autodrive-ecosystem) (Partner (Sim Racing League organizer))
- Post: https://www.linkedin.com/posts/autodrive-ecosystem_iros2026-autodrive-roboracer-activity-7508752923695194113-2hxc
- Embed: `urn:li:share:7508752921769992192`
- Images: 1
- Facts: 1st Siga Siga Racing Team (K. Smirnov Robotics LTD, Cyprus), 71.82 s, zero collisions, fastest lap 7.16 s, top speed above 11 m/s, 28th of 32 in qualifying (text); 2nd NTU DeepSpeed (Nanyang Technological University Singapore), 72.26 s, best lap 7.19 s, 1st in qualifying (text); 3rd rulim (MIPT, Russia), 73.97 s, best lap 7.33 s (text); Special mention: Light Year, a solo high-school team from Panther Creek High School (text)
- Notes: Results announced 2026-09-24; the sim final date is not stated. Registration post (2026-09-11): 55 teams, 132 participants, 28 organizations, 23 countries: https://www.linkedin.com/posts/autodrive-ecosystem_iros2026-autodrive-roboracer-activity-7504214063921487874-5zIG . The Foundation's sponsor post links the same final results. Distinct from the physical 31st race (September 28 to 30).

#### Autoware Foundation and TIER IV sponsor the 31st competition at IROS 2026

`iros2026-autoware-tier-iv-sponsors` · 2026-09-24 · announcement · event: iros2026 · priority A · confidence high

The Roboracer Foundation thanked the Autoware Foundation and TIER IV for sponsoring the 31st competition at IROS 2026 in Pittsburgh, support that keeps entry affordable and helps teams travel. New this year, four cars race at once in the knockout stages.

- Author: [The Roboracer Foundation](https://www.linkedin.com/company/roboracer-foundation) (Organizer)
- Post: https://www.linkedin.com/posts/roboracer-foundation_autoware-opensource-tieriv-activity-7508923533272510464-eCUX
- Embed: `urn:li:share:7508923532169584641`
- Images: 1
- Facts: Autoware Foundation and TIER IV sponsor the 31st RoboRacer Autonomous Racing Competition at IROS 2026 in Pittsburgh (text and image); Support goes to the teams: affordable entry and travel help (text); New: 4 cars race at once in knockout stages (text); Image: 'Race at IROS 2026', 'Pittsburgh, PA / 27-30 Sept 2026', 'Sponsored by The Autoware Foundation, TIER IV' (image)
- Notes: SPONSOR RULE: the content skill says no IROS 2026 sponsor was confirmed as of Aug 18 and never list one without written confirmation. This is the Foundation's own public post (2026-09-24), but Cedric must approve before the site names sponsors. Do not reuse the post's '27 to 30 September' range; public copy is September 28 to 30 with check-in September 27. news.json already has an iros2026 registration item; this is a separate story.

## Enrichments for existing news items

Posts about events that already have an item in `news.json`. Not candidates; they can supply an embed, a better link or detail.

- **iv2026-detroit-thunderbolt-wins**: Cedric Hollande, 2026-06-25, https://www.linkedin.com/posts/cedric-hollande_speed-came-in-1st-at-the-ieee-iv-2026-the-activity-7475947301207891968-x9TB (embed `urn:li:ugcPost:7475947238351941632`). The winner's own LinkedIn post; can serve as the item's embed (the news item links only to the race site). Facts: High-friction carpet surface, 30+ km/h, cars on two wheels in fast turns (text); MPPI controller sampling 1.3M trajectories per second at 40 Hz on the Jetson GPU (text)
- **post-roboracer-foundation-197760**: The Roboracer Foundation, 2026-06-12, https://www.linkedin.com/posts/roboracer-foundation_thrilling-races-vivid-discussions-and-activity-7471115155716841472-fPAj (embed `urn:li:ugcPost:7471115152382197760`). Same post as the news item (same ugcPost); this is its canonical company-slug URL. The text adds details the excerpt could use. Facts: New: a bridge on the track, open track borders, Classic Cup and Master Cup, a Friday community workshop (text); Award ceremony at TU Wien; organizers thanked: Felix Resch, Andreas Brandstätter, Jaroslav Klapálek, Moritz Christamentl (text)
- **icra2026 items**: The Roboracer Foundation, 2026-05-31, https://www.linkedin.com/posts/roboracer-foundation_we-are-thrilled-to-kick-off-the-27th-activity-7466949775771230208-gJfg (embed `urn:li:ugcPost:7466949740635709440`). Race-eve kickoff post for ICRA 2026 (video). Facts: Partners thanked: KNAPP, TU Wien, TU Wien Informatics, HTU Wien, Qualisys, Magna International, FFG, Bundesministerium für Innovation, Mobilität und Infrastruktur (text)
- **icra2026 items**: ForzaETH by Autonomous Racing Zürich, 2026-06-08, https://www.linkedin.com/posts/forzaeth-arzh_autonomousracing-icra2026-roboracer-activity-7469738117688619008-xBGr (embed `urn:li:ugcPost:7469738115558125569`). Team post; possible extra ICRA 2026 team story. Facts: 3rd in time trials, 9th overall of 36 teams (text); 40 x 20 m track with different grip and a 3D bridge (text) Conflict: 36 teams here vs 'about 30 teams' in the Foundation post and '35 registered teams' (VERIFY) in the content skill.
- **ifac2026-busan-largest-race**: Mingguang Zhou (reposted by The Roboracer Foundation), 2026-09-23, https://www.linkedin.com/posts/roboracer-foundation_activity-7508551761700282368-6Ztz (embed `urn:li:ugcPost:7508530134199574528`). Candid team retrospective from IFAC 2026. Facts: 'Competing alongside 54 other teams', one of only two institution-independent entries (text) Conflict: 54 other teams = 55 in total, vs 56 teams on the Foundation's slide 1.
- **iv2026 items**: The Roboracer Foundation, 2026-03-11, https://www.linkedin.com/posts/roboracer-foundation_iv2026-ieeeiv-roboracer-activity-7437441572218224640-3Nvc (embed `urn:li:share:7437441569131048960`). The IV 2026 call for teams, if the page wants the announcement next to the result. Facts: 28th Roboracer Autonomous Grand Prix at IEEE IV 2026, June 22-25, 2026, Detroit Marriott at the Renaissance Center (text)
- **autodrive-digital-twin-first-look**: Open Robotics, 2023-11-08, https://www.linkedin.com/posts/open-source-robotics-foundation_digital-twin-of-f1tenth-in-autodrive-simulator-activity-7128160732004679680-UZjJ (embed `urn:li:share:7128160731069349888`). LinkedIn copy of the same video; the news item is dated 2023-10-13, this repost is 2023-11-08 (it reshares an activity from early November). Facts: Title 'Digital Twin of F1TENTH in AutoDRIVE Simulator - A First Look' (text)

## Leads not selected

- 2018-10-12 Luca Bartoli: https://www.linkedin.com/posts/lucabart97_mfr18-f1tenth-hipert-activity-6456468606527119360-kSg7 (Video with no caption, tags #mfr18 #f1tenth #hipert (likely a Maker Faire Rome 2018 demo by HiPeRT Modena). Only pre-2019 post found; not a race.)
- 2023-04-25 Rahul Mangharam: https://www.linkedin.com/posts/mangharam_upenn-activity-7056438050184200192-TcBX (Penn course final races video; the 2022 course post was kept instead.)
- 2023-05-11 Rahul Mangharam: https://www.linkedin.com/posts/mangharam_f1tenth-autonomousracing-autonomousvehicles-activity-7062420311786315776-Gq5g (CPS-IoT Week 2023 photos, NC State teams; folded into cps2023-12th-winners.)
- 2023-05-30 François Pomerleau: https://www.linkedin.com/posts/fpomerleau_icra2023-activity-7069432079746224128-3gTd (VAUL 4th in qualifying at ICRA 2023; minor.)
- 2023-06-09 Rahul Mangharam: https://www.linkedin.com/posts/mangharam_iros-robotics-autonomoussystems-activity-7072954461417037824-0D4h (MAD-Games IROS 2023 call for papers; the event-day post was kept.)
- 2023-09-25 Venkat N. Krovi: https://www.linkedin.com/posts/venkatnkrovi_looking-forward-to-seeing-everyone-at-1st-activity-7111864481487454208-Zezk (MAD-Games reminder; duplicate topic.)
- 2023-12-15 Madhur Behl: https://www.linkedin.com/posts/madhurbehl_autonomousracing-robotics-autonomousvehicles-activity-7141456897244614657-4BD9 (UVA class race day photos; course item already kept.)
- 2024-02-25 Rahul Mangharam: https://www.linkedin.com/posts/mangharam_f1tenth-autonomous-racing-competition-at-activity-7167654499124240384-cByi (ICRA 2024 announcement with hosts; the Foundation poster post was preferred.)
- 2024-05-11 Rahul Mangharam: https://www.linkedin.com/posts/mangharam_f1tenth-autonomous-racing-competitions-2024-activity-7195044996926898176-r0Go ('Over 100 participants ... 7 International Competitions this year'; folded into icra2024-19-teams.)
- 2024-05-12 Rahul Mangharam: https://www.linkedin.com/posts/mangharam_join-us-in-the-2nd-mad-games-multi-agent-activity-7195407420716711936-gK23 (2nd MAD-Games workshop, ICRA 2024, May 13.)
- 2024-05-15 TIER IV: https://www.linkedin.com/posts/tier-iv-inc_tieriv-icra2024-f1tenth-activity-7196434400274714624-S1Dt (Race-week post: race day and award ceremony May 16, Exhibition Hall C.)
- 2024-05-17 TU Wien Informatics: https://www.linkedin.com/posts/tu-wien-informatics_andreas-brandst%C3%A4tter-scuderia-segfault-activity-7197279720902668288-PLVb (Team profile of Scuderia Segfault; no result.)
- 2024-09-27 Rahul Mangharam: https://www.linkedin.com/posts/mangharam_amazing-f1tenth-autonomous-racing-competition-activity-7245455430498271233-iZ_U (Reshare of the SM 2024 results with organizer names; alternative link for sm2024-vaul-keeps-title.)
- 2024-10-16 Rahul Mangharam: https://www.linkedin.com/posts/mangharam_f1tenth-autonomous-racing-competition-at-activity-7252107239212101633-Ule_ (IROS 2024 race video, one-line caption.)
- 2024-10-22 Rahul Mangharam: https://www.linkedin.com/posts/mangharam_f1tenth-autonomous-racing-competition-at-activity-7254334638398042112-hSAw (CDC 2024 Milan sign-up, virtual and physical, plus the racing workshop.)
- 2024-10-29 IEEE CDC: https://www.linkedin.com/posts/ieee-cdc-social_cdc2024-f1tenth-perception-activity-7256959957219078144-dlcV (Sim Racing League at CDC 2024: 37 teams registered, deadline October 31.)
- 2024-11-08 ForzaETH: https://www.linkedin.com/posts/forzaeth-arzh_overtaking-demo-video-forzaeth-f1tenth-activity-7260656638565519360-Kb12 (Overtaking demo video (Predictive Spliner); research, not news.)
- 2024-11-13 Scuderia Segfault: https://www.linkedin.com/posts/scuderia-segfault_scuderiasegfault-autonomousdriving-activity-7262443348987203584-ihNn (TU Wien rector celebrates the IROS 2024 second place.)
- 2024-12-16 AutoDRIVE Ecosystem: https://www.linkedin.com/posts/autodrive-ecosystem_cdc2024-autodrive-f1tenth-activity-7274413681344483328-euAK (Sim Racing League celebration event at CDC 2024, December 16.)
- 2025-01-26 Rahul Mangharam: https://www.linkedin.com/posts/mangharam_roboracer-welcomes-iit-bombay-to-the-exciting-activity-7289340372562964480-4GlQ ('IIT-B did a fantastic job in their very first competition'; which competition is not said. 63 images.)
- 2025-02-03 Rahul Mangharam: https://www.linkedin.com/posts/mangharam_join-us-at-roboracerai-the-roboracer-foundation-activity-7292127209262071808-KL78 ('Join us at RoboRacer.AI' with the Autoware Foundation; folded into f1tenth-is-now-roboracer.)
- 2025-02-25 AutoDRIVE Ecosystem: https://www.linkedin.com/posts/autodrive-ecosystem_ai-racing-robotics-activity-7299994278745784320-PNqw (Announces the 3rd RoboRacer Sim Racing League at ICRA 2025.)
- 2025-04-07 Foxglove: https://www.linkedin.com/posts/foxglovedev_ros-activity-7314987407483850753-z3po (Vendor article on the sim league.)
- 2025-04-09 Rahul Mangharam: https://www.linkedin.com/posts/mangharam_sign-up-for-the-roboracer-sim-racing-league-activity-7315554051717300224-ct2_ (Sim league sign-up, one line.)
- 2025-04-27 Rahul Mangharam: https://www.linkedin.com/posts/mangharam_reinforcement-learning-for-roboracer-racing-activity-7322321583090384897-8lP8 (ForzaETH lecture on RL for racing; Learn material.)
- 2025-06-17 Koneshka Dey: https://www.linkedin.com/posts/koneshka-dey-90437311b_support-neobotics-foundation-activity-7340805920785862657-Hn6O (Neobotics fundraising.)
- 2025-12-16 Autoware Foundation: https://www.linkedin.com/posts/the-autoware-foundation_autoware-at-techfest-iit-bombay-2025-activity-7406483205341462528-4ebA (Confirms the 26th at Techfest and the 4th Sim Racing League with CDC 2025; cited in notes.)
- 2026-01-24 Scuderia Segfault: https://www.linkedin.com/posts/scuderia-segfault_icr2026-activity-7420815613536780288-Tovu (Co-organizing ICRA 2026; event already covered.)
- 2026-03-05 Rahul Mangharam: https://www.linkedin.com/posts/mangharam_2026-is-an-exciting-year-for-the-roboracer-activity-7435290477278531584-LVYx (Same 2026 calendar image as the Foundation post.)
- 2026-03-20 Piotr Kicki: https://www.linkedin.com/posts/piotrkicki_icra2026-icra-mppi-activity-7440688515098636288-TPVk (LP-MPPI paper at ICRA 2026, tested on F1/10 racing; a research-page candidate.)
- 2026-04-08 Rahul Mangharam: https://www.linkedin.com/posts/mangharam_great-to-see-the-roboracer-foundation-in-activity-7447467004308938752-313G (RoboRacer at IIT Bombay; 'hoping to host ICRA 2030 in Hyderabad'. Speculative.)
- 2026-05-03 Scuderia Segfault: https://www.linkedin.com/posts/scuderia-segfault_scideria-roboracer-autonomousracing-activity-7456741669418287104-qtW9 (Penn Engineering course race day, 2026.)
- 2026-05-25 flyby racing: https://www.linkedin.com/posts/flyby-racing_roboracer-f1tenth-icra2026-activity-7464571111234486272-rqyZ (TU Wien team's RL agent before ICRA 2026; covered event.)
- 2026-09-08 The Roboracer Foundation: https://www.linkedin.com/posts/roboracer-foundation_iros2026-roboracer-racing-activity-7502906705052307457--kon (IROS 2026 teaser video 'No driver. No controller. Just code.' Possible embed for the IROS spotlight.)
- 2026-09-11 AutoDRIVE Ecosystem: https://www.linkedin.com/posts/autodrive-ecosystem_iros2026-autodrive-roboracer-activity-7504214063921487874-5zIG (6th Sim Racing League registrations: 55 teams, 132 participants, 28 organizations, 23 countries; cited in notes.)
- 2026-09-24 Abdullah Bin Naeem (reposted by the Foundation): https://www.linkedin.com/feed/update/urn:li:activity:7508928876723494912 (Barq Racing, the only team from Pakistan, 5th in the IROS 2026 sim league (4th of 55 in qualifying). Read on the Foundation page; the post page returned no structured data.)
- 2026-09-22 Cedric Hollande (reposted by the Foundation): https://www.linkedin.com/feed/update/urn:li:activity:7508243147387490304 (Pointer to RoboRacer work in the GRASP Summer Review.)

## Could not reach

- https://www.linkedin.com/company/roboracer-foundation/posts/ and /company/f1tenth/posts/ redirect to the login page. The public page /company/roboracer-foundation shows only the ten most recent activities (September 2026), so older Foundation posts were found through search.
- /company/f1tenth answers 404; /company/f1tenth-foundation redirects to /company/roboracer-foundation (same page, renamed). /company/lamarracing answers 404 (real slug unknown). /company/bu-f1tenth shows no public posts.
- DuckDuckGo HTML search returns a bot challenge; Bing via curl returns unrelated, bot-filtered results. Discovery ran through the WebSearch tool restricted to linkedin.com (about 60 queries); many hits were profile pages whose Experience text mentions results but are not posts.
- Posts that search snippets describe but whose URL could not be found or opened: VAUL's IROS 2023 and ICRA 2024 wins (only in team members' profiles), the Techfest 2025 podium (a BITS Pilani faculty post), ForzaETH's IV 2025 win (team members' posts), UNICORN's ICRA 2025 second place, NTU DeepSpeed at ICCAS 2025, MechaByte (GIU Berlin) third at IV 2025, BU F1Tenth P5 at VTC 2026, an ICRA 2024 'solo hobbyist' second place (Pawel Nazarewski, profile text), Johannes Betz's ICRA 2021 workshop recordings post, Scuderia Segfault's IROS 2021 win (profile text).
- Profile activity feeds (/in/<name>/recent-activity/) need a login; they were not tried with browser cookies. lnkd.in short links inside posts were not resolved. No media was downloaded to the repo (slide images were read in the scratchpad only, all under 2 MB); yt-dlp was not needed.

## Gaps that remain

- 2016 to 2018: nothing on LinkedIn. The first races (ESWeek 2016 Pittsburgh, CPS Week 2018 Porto, ESWeek 2018 Torino) predate the community's LinkedIn use; use the old f1tenth.github.io race pages instead.
- 2019: no race post (CPS-IoT Week 2019 Montreal, Columbia 2019); only the simulator release and two Pulse articles.
- 2020 to 2021: nothing found for IFAC 2020 and IROS 2020 (virtual), the ICRA 2021 workshop, or IROS 2021 Prague (Scuderia Segfault won per iros2021.f1tenth.org).
- 2022: ESWeek 2022 Shanghai and the 1st Korea Championship (Jeju); the ICRA 2022 winner.
- 2023: IV 2023 Anchorage, the 2nd Korea Championship (ICCAS 2023), and a readable IROS 2023 result post (VAUL won per autoware.org).
- 2024: winner posts for ICRA 2024 (VAUL per snippets) and IV 2024; CPS-IoT 2024 Hong Kong (17th), ITSC 2024 Edmonton (20th), 3rd Korea Championship, BU 2024, the CDC 2024 podium.
- 2025: podium posts for ICRA 2025, IV 2025 (ForzaETH per forzaeth.ch), ICCAS 2025 (4th Korea Championship), CDC 2025 Rio (25th, physical) and Techfest 2025 (26th).
- 2026: all races covered; the VTC 2026 winner (Firebird, George Mason) comes from a competitor's post and needs the race site's results page.
