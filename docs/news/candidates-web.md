# News candidates from the web, 2016 to 2025

Research for roboracer.ai /news: the community's history from 2016 to 2025, which the feed (22 items, all but six from 2026) does not show. Branch `revamp/p3-news-web`, 2026-09-25. Nothing here is published; every item is a candidate for Cedric to pick, and the site copy would still go through the content rules (TODO(content) for anything unconfirmed).

**Sources, in the order used.** (1) The old f1tenth.org site, still served from `f1tenth.github.io` (race pages 2016 to 2020 with results, the NEWS tab of `research.html`, race banners and flyers), and its Wayback captures (CDX of `f1tenth.org*`, homepage captures 2016 to 2026). (2) The race-site repos of the `f1tenth` org (harvested copies in `_harvest/repos`, checked against `gh api` commit history; most are private and their domains are dead, so every link is a Wayback capture). Their `results.html` pages carry Challonge brackets; Challonge answers 403 to scripts, but the Wayback captures of `challonge.com/<id>/module` embed the full bracket JSON, which is how the ICRA 2022, CPS-IoT 2023, IROS 2023 and IV 2024 finals were read. (3) YouTube: the real channel is xLAB for Safe Autonomous Systems (@RealTimemLAB, 478 videos; @f1tenth and @Roboracer are empty), plus Madhur Behl's channel (2016 to 2019 recaps), CTU's industrialinformatics (Columbia 2019 and IROS 2021 streams), TU Wien TV, AutoDRIVE (Sim Racing League recaps). (4) The F1TENTH/RoboRacer Mailchimp newsletter archive (10 issues, May 2024 to Jul 2025; RSS `https://us13.campaign-archive.com/feed?u=a91a25f4c1fbc0c9896af9a20&id=b5caf3bccb`), which carries results and photos for most 2024 races. (5) Team and university news: TU Wien (Scuderia Segfault), ForzaETH blog, Penn Engineering, Lehigh, UNC, NC State, BU CISE, WVU, UNIST, Daily Hankooki, Stiripesurse, Foxglove, InDro Robotics, Wired, UVA Today, The Daily Pennsylvanian. (6) This repo: `public/data/events_map.json` (dates, venues, numbering), `past_races.json`, `docs/CONTENT.md`, `docs/EVENTS_VERIFICATION.md`, and the git history of `news.json` (the 2025 seed carried the old site's last seven news items; six are on the site today, 'Engineering Out Loud' was dropped with its dead Stitcher link).

**How to read an item.** `date` has the precision the sources support; `date_display` is the range. `event` uses `events_map.json` ids (the Sim Racing League has none, so it borrows the host event). `facts` quote the source and name it; `notes` hold the caveats, flags and contradictions for that item. Image sizes were measured from the files (downloaded to the scratchpad and deleted, nothing entered git). Third-party photos (universities, teams, press) are listed so Cedric can ask for permission; only the old f1tenth.org gallery, race banners and RoboRacer's own newsletter images are ours.

**Not repeated here.** Items already on /news (UNC Endeavors 2020, the mLab Medium blog 2020, the MAP controller video 2023, the two AutoDRIVE videos 2023-2024, the Korea delegation 2024, and everything from 2026) are left out; `build` checks that no candidate links a URL already in `news.json`.

## Coverage by year

| Year | Candidates | Results | Announcements | Milestones | Videos |
|---|---|---|---|---|---|
| 2016 | 3 | 1 | 0 | 1 | 1 |
| 2018 | 4 | 2 | 2 | 0 | 0 |
| 2019 | 5 | 2 | 0 | 1 | 2 |
| 2020 | 4 | 2 | 0 | 2 | 0 |
| 2021 | 4 | 1 | 1 | 1 | 1 |
| 2022 | 4 | 1 | 2 | 0 | 1 |
| 2023 | 6 | 3 | 3 | 0 | 0 |
| 2024 | 13 | 9 | 2 | 2 | 0 |
| 2025 | 8 | 5 | 2 | 1 | 0 |
| **All** | **51** | 26 | 12 | 8 | 5 |

## The ten strongest

1. **PRECISE Racing wins the first race, at ESWeek 2016 in Pittsburgh** (Oct 1-2, 2016, `esweek2016-precise-racing-wins-first-race`): where it all started: five teams, one Penn winner, three videos.
2. **It started as a course: building a 1/10-scale autonomous race car, from March 2016** (Feb 28, 2016, `course-2016-open-source-course-launch`): the course that came before the races, dated by its own trailer.
3. **Czech Technical University wins the second race, in Porto** (Apr 10-11, 2018, `cpsweek2018-porto-ctu-wins`): full ranked podium and a real photo gallery.
4. **UNC Chapel Hill wins at CPS-IoT Week 2019 in Montreal** (Apr 15-16, 2019, `cpsiot2019-montreal-unc-wins`): winner, lap time, field, and the first autonomous overtake clip.
5. **Wired: an NSF grant puts 80 cars in research labs** (Oct 5, 2019, `press-wired-2019-nsf-fleet`): national press, an NSF grant and 80 cars.
6. **Scuderia Segfault wins the 9th Grand Prix at IROS 2021 in Prague** (Sep 27-Oct 1, 2021, `iros2021-prague-scuderia-segfault-wins`): first in-person race after COVID, full results table, stream.
7. **ForzaETH wins the ICRA 2023 Grand Prix in London** (May 29-31, 2023, `icra2023-london-forzaeth-wins`): 41 registered teams, a detailed first-hand account.
8. **The first Sim Racing League draws 58 teams** (Oct 7, 2024, `iros2024-first-sim-racing-league`): a new format: 58 teams race a digital twin.
9. **F1TENTH becomes RoboRacer** (Nov 13, 2024, `migration-f1tenth-to-roboracer`): the rename, in the organizers' own words.
10. **UniBo Motorsport wins the 24th competition at ICRA 2025 in Atlanta** (May 19-23, 2025, `icra2025-atlanta-unibo-motorsport-wins`): the first race under the RoboRacer name, three independent sources.

## Candidates

Each entry: id, dates, kind, event id, confidence; the excerpt as drafted; the link; then the facts with their sources. The JSON holds the same records.

### 2016

#### It started as a course: building a 1/10-scale autonomous race car, from March 2016

`course-2016-open-source-course-launch` · Feb 28, 2016 · milestone · event `None` · confidence **high**

> The project began as a course. Its trailer, posted in February 2016, describes an open-source class on designing, building and testing a fully autonomous 1/10-scale race car, starting that March. The first lecture went online on March 11, 2016.

- Link: <https://www.youtube.com/watch?v=vgEyvazwrU8>
- Video: <https://www.youtube.com/watch?v=vgEyvazwrU8>, <https://www.youtube.com/watch?v=zkMelEB3-PY>
- Facts:
  - 'F1/10 autonomous racing is an open source course (starting in March 2016) which involves designing, building and testing a fully autonomous 1/10-scale model F-1 race car': Madhur Behl, 'F1/10 Autonomous Racing', YouTube, uploaded 2016-02-28, https://www.youtube.com/watch?v=vgEyvazwrU8
  - '[F1/10] Lecture 1.1 : Course Overview', first video of the 'F1/10: Week1 Lectures and Tutorials' series: xLAB for Safe Autonomous Systems, YouTube, 2016-03-11, https://www.youtube.com/watch?v=zkMelEB3-PY
  - 'originally founded at the University of Pennsylvania in 2016': archived f1tenth.org about page, https://web.archive.org/web/20240109144454/https://f1tenth.org/about.html
  - The earliest Wayback capture of f1tenth.org is 2016-05-03 (CDX)
- Notes: The earliest dated public trace of the platform found. The trailer is on Madhur Behl's channel (UVA; co-founder per his UVA faculty page). A natural lead for a '2016: where it started' block.

#### The Build: a video series on assembling the car

`build-2016-the-build-video-series` · Jun 15, 2016 · video · event `None` · confidence **high**

> In June 2016 the team published F1/10: The Build, a step-by-step video series on assembling the car. Build instructions have been part of the platform ever since, most recently in the 2026 RoboRacer Assembly video.

- Link: <https://www.youtube.com/watch?v=yukt8mVi7sg>
- Video: <https://www.youtube.com/watch?v=yukt8mVi7sg>, <https://www.youtube.com/watch?v=yV1RzYJPdy4>
- Facts:
  - 'F1/10: The Build Part 1', first of the 'F1/10: The Build' playlist: xLAB for Safe Autonomous Systems, YouTube, 2016-06-15, https://www.youtube.com/watch?v=yukt8mVi7sg
  - 'RoboRacer Assembly' (7 min build video): xLAB, YouTube, 2026-08-22, https://www.youtube.com/watch?v=yV1RzYJPdy4
- Notes: Could merge into the 2016 course item. The 2026 video may belong on /build instead.

#### PRECISE Racing wins the first race, at ESWeek 2016 in Pittsburgh

`esweek2016-precise-racing-wins-first-race` · Oct 1-2, 2016 · result · event `esweek2016` · confidence **high**

> Five teams raced the first F1/10 competition on October 1 and 2, 2016, on an 812-foot track in Wean Hall at Carnegie Mellon, during Embedded Systems Week. PRECISE Racing from the University of Pennsylvania set the fastest time, 63.78 seconds. Arizona State, ETH Zurich, New Mexico and Temple also took part.

- Link: <https://f1tenth.github.io/pittsburgh2016.html>
- Video: <https://www.youtube.com/watch?v=fyFycjFaLC4>, <https://www.youtube.com/watch?v=3rOCWnScEFw>, <https://www.youtube.com/watch?v=IE5CwKK5YhQ>
- Facts:
  - 'Oct. 2 - 7, 2016 / Pittsburgh, Pennsylvania / Embedded Systems Week': https://f1tenth.github.io/race.html
  - Results table: rank 1, PRECISE Racing, University of Pennsylvania, 63.78 seconds (the only row): https://f1tenth.github.io/pittsburgh2016.html
  - Participating Teams: Arizona State University, University of Pennsylvania, ETH Zurich, University of New Mexico, Temple University: https://f1tenth.github.io/pittsburgh2016.html
  - 'The inaugural F1/10 autonomous racing competition was held on October 1-2, in Pittsburgh, USA. 5 teams competed to set the fastest time around a 812 feet track on CMU's campus (at Wean Hall).': Madhur Behl, 'The 1st F1/10 Autonomous Racing Competition 2016', YouTube, uploaded 2016-11-06, https://www.youtube.com/watch?v=fyFycjFaLC4
  - 'Jump onboard the fastest car (Team PRECISE) ... completed a 812 ft track in about 64 seconds ... Congratulations to team PRECISE (University of Pennsylvania)!': 'Fastest Lap : 1st F1/10 Autonomous Racing Competition 2016', Madhur Behl, YouTube, 2016-11-14, https://www.youtube.com/watch?v=3rOCWnScEFw
  - Race number 1 by the series' own count (the Columbia 2019 race is the '5th F1/10 Autonomous Racing Grand Prix' with four races before it): events_map.json esweek2016
- Notes: DATE: the race ran October 1-2 (Behl's video); race.html and events_map.json give the conference week, Oct 2-7. No photo gallery was ever published for 2016 (docs/media/RACE_PHOTOS.web.md); the three videos (recap, fastest lap, crash compilation) are the media. Only a winner and a time are published; no second or third place.

### 2018

#### Czech Technical University wins the second race, in Porto

`cpsweek2018-porto-ctu-wins` · Apr 10-11, 2018 · result · event `cpsweek2018` · confidence **high**

> The second competition ran on April 10 and 11, 2018, in the Palacio da Bolsa in Porto, during Cyber Physical Systems Week. Czech Technical University in Prague won, ahead of the University of Connecticut and the University of Modena and Reggio Emilia.

- Link: <https://f1tenth.github.io/porto2018.html>
- Archive: <https://web.archive.org/web/20241101194628/https://f1tenth.org/porto2018.html>
- Image: <https://f1tenth.github.io/gallery/porto2018/porto9.jpg> 2048x1365 (old-site Porto gallery, 10 photos porto1-porto10, all 2048x1365; porto9 is the one /race already uses)
- Video: <https://www.youtube.com/watch?v=ZwRGtrXYgmI>, <https://www.youtube.com/watch?v=YWdDvWgeaZM>
- Facts:
  - 'Apr. 10 - 13, 2018 / Porto, Portugal / Cyber Physical Systems Week': https://f1tenth.github.io/race.html
  - Results: 1 Czech Technical University in Prague, 2 University of Connecticut, 3 University of Modena and Reggio Emilia, 4 Seoul National University, 5 University of Virginia, 6 Korea Advanced Institute of Science and Technology, 7 KTH Royal Institute of Technology: https://f1tenth.github.io/porto2018.html
  - 'The second F1/10 Autonomous Racing Competition was held on April 10-11, 2018 in Porto, Portugal 8 teams competed ... at the historical Palacio de Bolsa palace. Congratulations to the winners Team Rericha - Czech Technical University, Prague': Madhur Behl, YouTube, 2018-04-27, https://www.youtube.com/watch?v=ZwRGtrXYgmI
  - 'held in Porto, Portugal on 11 April ... Seven teams from around the world ... qualified for the race'; CTU ran the course in 9.1 seconds: CTU (industrialinformatics), YouTube, 2018-07-05, https://www.youtube.com/watch?v=sPplXMcxFNc
  - 'Collection of code from the F1tenth Porto Grand Prix held at CPSWeek 2018': https://github.com/f1tenth/F110CPSWeek2018
- Notes: TEAM COUNT DIFFERS: the old-site page ranks 7 teams and CTU says seven qualified; Behl's recap says 8 teams competed. The excerpt gives no count. CTU's team name was Řeřicha. A pre-season webinar (YouTube gIBZVFRCVXk, 2018-03-02) calls it the '2nd International F1/10 Autonomous Racing Competition'.

#### At Virginia, the final exam is a race

`press-uva-2018-racing-for-an-a` · May 14, 2018 · announcement · event `None` · confidence **high**

> UVA Today followed 32 University of Virginia engineering students who spent the last week of the spring 2018 semester tuning 1/10-scale autonomous cars. Their final exam was a race.

- Link: <https://news.virginia.edu/content/racing-students-unique-course-put-self-driving-cars-final-test>
- Facts:
  - 'Racing for an A: Students in Unique Course Put Self-Driving Cars to Final Test', UVA Today, Fariss Samarrai, published 2018-05-14 (page metadata): 'While most students last week were studying late for final exams, 32 University of Virginia engineering students were staying up late for a different reason: They were testing miniature cars in preparation for an autonomous vehicle race that was their final exam.': https://news.virginia.edu/content/racing-students-unique-course-put-self-driving-cars-final-test (HTTP 200 on 2026-09-25)
  - Listed on the old f1tenth.org news tab: https://f1tenth.github.io/research.html
- Notes: Press item, course race at UVA (Madhur Behl's course). No og:image found in the page head; the article has photos inline, not measured.

#### Team CALVIN from Warsaw wins the third race, in Torino

`esweek2018-torino-calvin-wins` · Oct 1, 2018 · result · event `esweek2018` · confidence **high**

> The third competition ran on October 1, 2018, at Torino Incontra during Embedded Systems Week. Maciej Dziubiński, Łukasz Sztyber and Karol Majek from Poland won, racing as team CALVIN. Penn, Virginia, Connecticut, Modena and Reggio Emilia, Czech Technical University and SeoulTech were in the field.

- Link: <https://f1tenth.github.io/torino2018.html>
- Archive: <https://web.archive.org/web/20240619061753/https://f1tenth.org/torino2018.html>
- Image: <https://f1tenth.github.io/gallery/torino2018/torino1.png> 981x737 (the only Torino image on the old site)
- Video: <https://www.youtube.com/watch?v=VlE2Wb_XhoQ>, <https://www.youtube.com/watch?v=8NSKLdjGp7I>
- Facts:
  - 'The 3rd F1/10 International Autonomous Racing Competition was held on October 1st, 2018 in Torino, Italy. 9 teams competed ... at the Torino Incontra. Congratulations to the winners Maciej Dziubiński, Lukasz Sztyber, and Karol Majek from Poland': Madhur Behl, YouTube, 2018-10-07, https://www.youtube.com/watch?v=VlE2Wb_XhoQ
  - 'At ESWEEK 2018 in Turin, Italy 1st place: CALVIN Team - Warsaw, Poland - Karol Majek, Łukasz Sztyber, Maciej Dziubiński': Karol Majek, 'Calvin F1/10 - 1st at ESWEEK 2018', YouTube, 2018-10-10, https://www.youtube.com/watch?v=8NSKLdjGp7I
  - 'Sept. 30 - Oct. 5, 2018 / Torino, Italy / Embedded Systems Week': https://f1tenth.github.io/race.html
  - Results: rank 1, crew 'Maciej Dziubinski, Karol Majek' (the only row): https://f1tenth.github.io/torino2018.html
  - Participating Teams: University of Warsaw, Czech Technical University, Seoul National University of Science and Technology, University of Pennsylvania, University of Virginia, University of Connecticut, Dafcode, University of Modena and Reggio Emilia: https://f1tenth.github.io/torino2018.html
  - 'Collection of code from the F1tenth Torino Grand Prix held at EPSWeek 2018' (sic): https://github.com/f1tenth/F110ESWeek2018
- Notes: CONTRADICTIONS: the old-site page names two of the three winners and lists 8 teams; Behl's recap says 9 teams and names all three; Majek's video names the team CALVIN (Warsaw). race.html gives the conference week; the race day was Oct 1. The same crew later races as Dzik (Columbia 2019 Open class, IFAC 2020, ICRA 2022 runner-up, IROS 2024 winner as Dzik Ultimate). Dziubiński's own write-up is a separate press candidate.

#### Self-driving cars race through a Penn dining hall

`press-dp-2018-new-college-house-demo` · Nov 7, 2018 · announcement · event `None` · confidence **high**

> The Daily Pennsylvanian watched students race small self-driving cars through the New College House dining pavilion at Penn, a demonstration that invited any student to explore autonomous vehicles by building a 1/10-scale race car.

- Link: <https://www.thedp.com/article/2018/11/autonomous-racing-self-driving-car-automobile-competition-penn-engineering-upenn-philadelphia>
- Image: <https://snworksceo.imgix.net/dpn/6edc8727-ccbb-457e-90a3-2864daad0112.sized-1000x1000.jpg?w=800&h=600> 800x519 (Daily Pennsylvanian photo (og:image))
- Facts:
  - 'At New College House, small self-driving cars race each other', The Daily Pennsylvanian, Daniel Wang, November 7, 2018: 'On Wednesday night, students across the Penn community watched a self-driving car fly through a racetrack in the New College House Dining Pavilion ... an initiative that encourages students to explore self-driving vehicles by developing a F1 race car at 1/10th of its regular scale.' (quoted from the old f1tenth.org news tab; HTTP 200 on 2026-09-25)
  - Old-site gallery pages of the same term: 'Mid-Semester-Race-11-6-18.html', 'Levine-Track-12-4-18-Testing.html', 'Final-Race-12-10-18.html' (f1tenth.github.io/gallery/)
- Notes: Press item. The old site's copy of the excerpt was rewritten to 'RoboRacer' in January 2025; quote the article, not the old site. Photo is the paper's; link, do not copy.

### 2019

#### UNC Chapel Hill wins at CPS-IoT Week 2019 in Montreal

`cpsiot2019-montreal-unc-wins` · Apr 15-16, 2019 · result · event `cpsiot2019` · confidence **high**

> The fourth competition ran at CPS-IoT Week in Montreal in April 2019, with seven teams. The University of North Carolina at Chapel Hill won the time trials with a fastest lap of 11.5 seconds, more than a second ahead of the next car, and no crashes in 11 minutes. The same race produced what the organizers called possibly the first fully autonomous high-speed overtake.

- Link: <https://cs.unc.edu/news/unc-cs-team-wins-f1tenth-autonomous-racing-challenge/>
- Archive: <https://web.archive.org/web/20210723181207/https://cs.unc.edu/news/unc-cs-team-wins-f1tenth-autonomous-racing-challenge/>
- Image: <https://f1tenth.github.io/gallery/montreal2019/montreal2.jpg> 4032x3024 (old-site Montreal gallery (montreal1-4, all 4032x3024))
- Video: <https://www.youtube.com/watch?v=Dw_Fg_JLcNg>, <https://www.youtube.com/watch?v=ctTJHueaTcY>
- Facts:
  - 'possibly the world's first fully autonomous high-speed overtake ... during the 4th F1/10 International Autonomous Racing Competition ... in Montreal this year. The winning team was University of North Carolina, Chapel Hill. They set a fastest lap time of 11.5 [seconds]': Madhur Behl, YouTube, 2019-04-22, https://www.youtube.com/watch?v=Dw_Fg_JLcNg
  - 'UNC Chapel Hill team describes their approach ... They won the 4th F1/10 Autonomous Racing Grand Prix (April, 2019 in Montreal)': xLAB, YouTube, 2019-08-25, https://www.youtube.com/watch?v=ctTJHueaTcY
  - Webinar: 'Information for F1/10 Grand Prix Montreal April 15 and 16 2019': xLAB, YouTube, 2019-03-02, https://www.youtube.com/watch?v=myA9qrCcj6U
  - 'Apr. 15 - 18, 2019 / Montreal, Canada / Cyber Physical Systems and Internet-of-Things Week': https://f1tenth.github.io/race.html
  - UNC CS, 'UNC CS team wins F1/10 autonomous racing challenge', 2019-04-26 (page now 404; Wayback 2021-07-23): 'took first place at F1/10 ... held during Cyber-Physical Systems and Internet-of-Things (CPS-IoT) Week 2019'; 'The UNC team's car completed its fastest lap more than a second faster than the second-fastest entry, all while avoiding any crashes during 11 minutes of time trials'; team Nathan Otterness, Charlotte Dorn, Tanya Amert, Abel Karimi, Manish Goyal, assistant professor Sridhar Duggirala; it 'beat entries from the University of Texas at Arlington, the University of Central Florida, Vanderbilt University, the University of Modena (Spain) [sic], the Seoul National University of Science and Technology (South Korea) and even contest organizers from the University of Pennsylvania'
  - Old-site news tab, Nathan Otterness, 'The "Disparity Extender" Algorithm, and F1/Tenth', April 22, 2019: 'Recently, my team from UNC-Chapel Hill won an F1/Tenth competition, held at CPSWeek 2019, in Montreal.': https://www.nathanotterness.com/2019/04/the-disparity-extender-algorithm-and.html
- Notes: The UNC page is 404 today; link the Wayback capture (archive). The old-site Montreal page has no results table. Seven teams = UNC plus the six UNC lists (UT Arlington, UCF, Vanderbilt, Modena, SeoulTech, Penn); UNC wrongly places Modena in Spain. Second and third place: not found. Race days Apr 15-16 per the webinar; race.html gives the conference week.

#### Possibly the first fully autonomous high-speed overtake, filmed in Montreal

`montreal2019-first-autonomous-overtake-video` · Apr 22, 2019 · video · event `cpsiot2019` · confidence **high**

> During the fourth competition in Montreal, one car passed another at speed with no human input. The organizers posted the clip as possibly the world's first fully autonomous high-speed racing overtake. UNC Chapel Hill won that race.

- Link: <https://www.youtube.com/watch?v=Dw_Fg_JLcNg>
- Video: <https://www.youtube.com/watch?v=Dw_Fg_JLcNg>, <https://www.youtube.com/watch?v=RC6t4cgV_yY>
- Facts:
  - 'possibly the world's first fully autonomous high-speed overtake ... during the 4th F1/10 International Autonomous Racing Competition ... in Montreal this year. The winning team was University of North Carolina, Chapel Hill.': Madhur Behl, 'World's first high speed fully autonomous racing overtake. [F1/10]', YouTube, 2019-04-22, https://www.youtube.com/watch?v=Dw_Fg_JLcNg
  - Re-posted by the Indy Autonomous Challenge channel, 2020-07-30 ('World's 1st F1/10 High-Speed Fully Autonomous Racing Overtake'), whose description adds 'Since 2015, University of Virginia's Cavalier Autonomous Racing has organized and competed in all five seasons of the F1/10 International Autonomous Racing Competition': https://www.youtube.com/watch?v=RC6t4cgV_yY
- Notes: 38-second clip. Keep the source's hedge 'possibly'. Overlaps the Montreal result item; publish one or pair them. The IAC description's 'Since 2015' conflicts with the 2016 start in the content skill; do not quote it.

#### Wired: an NSF grant puts 80 cars in research labs

`press-wired-2019-nsf-fleet` · Oct 5, 2019 · milestone · event `None` · confidence **high**

> In October 2019 Wired reported a $1.5 million National Science Foundation grant to Oregon State, Penn and Clemson. Over three years it would send 80 of the 1/10-scale cars to 33 researchers working on safety, energy efficiency, cybersecurity and robotics, with the aim of making the platform the go-to open-source testbed for autonomous vehicle research.

- Link: <https://www.wired.com/story/small-cars-help-drive-autonomous-future/>
- Image: <https://media.wired.com/photos/5d9656ab01e4a40008261383/191:100/w_1280,c_limit/Transpo_AVmini_20190523_HoussamAbbas_HO-7597.jpg> 1280x670 (Wired og:image, photo Hannah O'Leary/Oregon State University)
- Facts:
  - 'These Small Cars Can Help Drive the Autonomous Future', Aarian Marshall, Wired, 2019-10-05: 'Over the next three years, Houssam Abbas will carefully send 80 modified Traxxas RC rally cars ... to research facilities around the country'; 'In August, the group won a $1.5 million grant from the National Science Foundation'; 'the NSF grant will allow Abbas and colleagues at the University of Pennsylvania and Clemson University to send mini-cars to 33 collaborators in a variety of disciplines: safety systems, energy efficiency, cybersecurity, and robotics. The researchers are hoping their mini-car, which comes out of a larger project called "F1tenth" (get it?), will become the go-to open source platform for autonomous vehicle researchers worldwide.': https://www.wired.com/story/small-cars-help-drive-autonomous-future/ (HTTP 200)
  - Penn Engineering (Medium), 'Mini Autonomous Vehicles Race for Community-Driven Research', Izzy Lopez, Oct 22, 2019: 'In 2015, while a postdoctoral researcher in Rahul Mangharam's lab ... Abbas was one of the core developers of the F1 Tenth Autonomous Racing project. He co-taught the pilot course': https://medium.com/penn-engineering/mini-autonomous-vehicles-race-for-community-driven-research-18118c7ffcd5 (Medium blocks scripts; Wayback https://web.archive.org/web/20241204165202/https://medium.com/penn-engineering/mini-autonomous-vehicles-race-for-community-driven-research-18118c7ffcd5)
  - FutureCar, 'Researchers Are Using Model Cars to Perfect Autonomous Vehicles', Oct 19, 2019 (retells the Wired piece; live URL answers 522): https://web.archive.org/web/20230927152030/https://m.futurecar.com/3554/Researchers-Are-Using-Model-Cars-to-Perfect-Autonomous-Vehicles
  - Oregon State's Engineering Out Loud podcast, 'The age of autonomous vehicles' (S9E7), features Houssam Abbas using tiny race cars (old news tab date Feb 12, 2020; the old Stitcher link is dead): https://engineeringoutloud.libsyn.com/the-age-of-autonomous-vehicles-s9e7
- Notes: One item for four linked press pieces (Wired, Penn Engineering, FutureCar, the podcast); pick Wired as the link. CONTRADICTION: Penn Engineering dates the project and pilot course to 2015; the content skill and the old about page say founded 2016 (the course trailer says the course started March 2016). Wired says the model-car idea started at MIT in 2015, not F1TENTH.

#### The 5th Grand Prix at Columbia: SeoulTech and Modena tie for the fastest lap

`columbia2019-fifth-grand-prix` · Oct 14, 2019 · result · event `columbia2019` · confidence **high**

> Ten cars ran the Restricted class time trials at Columbia University in New York on October 14, 2019. SeoulTech and the University of Modena and Reggio Emilia shared the fastest time, 8.4 seconds, ahead of Czech Technical University. In the Open class, Dzik from the Polish Academy of Sciences set 5.84 seconds.

- Link: <https://f1tenth.github.io/columbia2019.html>
- Image: <https://f1tenth.github.io/gallery/columbia2019/columbia5.jpg> 3227x2124 (old-site Columbia gallery; columbia1-3 are 4032x3024, columbia6-8 4608x3456)
- Video: <https://www.youtube.com/watch?v=fevOWV0qbu8>, <https://www.youtube.com/watch?v=Iq2r2OOWbkE>
- Facts:
  - 'Oct. 13 - 18, 2019 / New York City, New York / Columbia University': https://f1tenth.github.io/race.html
  - 'Compete at the 5th ... Autonomous Racing Grand Prix at Columbia University this October 2019.' and 'Race Day is Monday October 14, 2019 from 8 AM - 2 PM': f1tenth.github.io/race-old.html (old-site page, harvested copy)
  - Timed Trials Results, Restricted Class: 1 SeoulTech (SeoulTech) 8.4 s; 1 Unimore (University of Modena and Reggio Emilia) 8.4 s; 2 Přeslička (Czech Technical University) 9.61 s; 3 Canny Valley Racing (Matthew O'Kelly) 9.91 s; then GoHeelsRacing (UNC), VULCAN (Penn), ZIX (Penn), Knight Rider (UCF), TUNERCAR (Hongrui Zheng), VandyCPS (Vanderbilt): https://f1tenth.github.io/columbia2019.html
  - Open Class: 1 Dzik, Polish Academy of Sciences, 5.84 seconds: https://f1tenth.github.io/columbia2019.html
  - Columbia Video Network highlights, YouTube, 2019-10-22 (old site: 'Highlights from the 5th ... Autonomous Grand Prix'): https://www.youtube.com/watch?v=fevOWV0qbu8; full race-day stream by CTU, 3 h 56 min: https://www.youtube.com/watch?v=Iq2r2OOWbkE
- Notes: Only timed-trial tables are published; no head-to-head result. Classes: Restricted and Open (race-old.html).

#### The F1/10 racing simulator at ROSCon 2019

`roscon2019-f110-simulator-talk` · Nov 1, 2019 · video · event `None` · confidence **medium**

> The open-source ROS simulator for F1/10 racing was presented at ROSCon 2019 in Macau. It let teams develop and test racing code without a car.

- Link: <https://www.youtube.com/watch?v=tZeA7ykIYwA>
- Video: <https://www.youtube.com/watch?v=tZeA7ykIYwA>
- Facts:
  - 'presents our work on the Open Source ROS F1/10 Autonomous Racing Simulator at ROSCon 2019, held in Macau': 'ROSCon '19 Talk: ROS F1/10 Autonomous Racing Simulator', Madhur Behl, YouTube, 2019-11-01, https://www.youtube.com/watch?v=tZeA7ykIYwA
  - Related: repo f1tenth_simulator (created 2020-06-08) and f1tenth_gym (created 2020-03-16), gh api
- Notes: Speaker not named in the notes; watch the video before crediting.

### 2020

#### The project starts signing as the F1TENTH Foundation

`f1tenth-foundation-named-2020` · May 2020 · milestone · event `None` · confidence **medium**

> In early 2020 the footer of f1tenth.org read 'Copyright 2019 PRECISE', after Penn's PRECISE Center. By May 9, 2020 it read 'Copyright 2020 F1TENTH Foundation'. The foundation, now the RoboRacer Foundation, gives 2020 as its founding year.

- Link: <https://web.archive.org/web/20200509220330/http://f1tenth.org/>
- Facts:
  - Homepage capture of 2020-02-02: 'Copyright ©2019 PRECISE': https://web.archive.org/web/20200202140228/http://f1tenth.org/
  - Homepage capture of 2020-05-09: 'Copyright ©2020 F1TENTH Foundation': https://web.archive.org/web/20200509220330/http://f1tenth.org/
  - Old-site repo (github.com/f1tenth/f1tenth.github.io, private) commit of 2020-05-08: 'Change Precise to F1tenth Foundation' (gh api, read 2026-09-25)
  - LinkedIn company page (linkedin.com/company/f1tenth-foundation now redirects here): 'The RoboRacer Foundation will be a 501(c)(3) non-profit organization providing an open-source AV community platform supporting research on autonomous systems ... Nonprofit, Founded 2020': https://www.linkedin.com/company/roboracer-foundation
  - Race-site footers: '© 2023 F1TENTH Foundation' (iv2023_race, iros2023-race_website); newsletter May 2024: 'F1Tenth Foundation and Autoware Foundation are growing in nationally funded programs in South Korea!'
- Notes: This dates the name, not a legal entity: the LinkedIn page says the foundation 'will be' a 501(c)(3). Whether and when it was incorporated is TODO(content), ask Rahul. Low reader interest alone; could be one line in the rename story.

#### TUfast TUfurious wins the 7th Grand Prix, run online for IFAC 2020

`ifac2020-virtual-tufast-wins` · Jul 15-16, 2020 · result · event `ifac2020` · confidence **high**

> COVID-19 moved the IFAC 2020 race online, July 15 and 16, 2020. Thirteen teams qualified in simulation. TU Wien's TUfast TUfurious won the head-to-head final, ahead of Lehigh's LU Potential and HiPeRT Modena from the University of Modena and Reggio Emilia.

- Link: <https://f1tenth.github.io/ifac2020.html>
- Archive: <https://web.archive.org/web/20241013000340/https://f1tenth.org/ifac2020.html>
- Image: <https://f1tenth.github.io/Brackets/bracket-ifac2020.png> 5581x3010 (bracket graphic, not a photo)
- Image: <https://f1tenth.github.io/race/berlinbanner.png> 5036x1798 (event banner graphic)
- Video: <https://www.youtube.com/watch?v=YMzm2oCc_4w>
- Facts:
  - 'Due to COVID-19, ... @ IFAC2020 will be going virtual'; '7th ... Autonomous Grand Prix / July 15-16, 2020': https://f1tenth.github.io/ifac2020.html
  - Results: 1 TUfast TUfurious (Thomas Pintaric, Mathias Lechner, Bernhard Schlögl, Axel Brunnbauer, Andreas Brandstätter), 2 LU Potential, 3 HiPeRT Modena: https://f1tenth.github.io/ifac2020.html
  - Qualification table: 13 teams; fastest 2-lap time LU Potential (Lehigh University) 18.92 s; TUfast TUfurious = TU Wien, HiPeRT Modena = University of Modena and Reggio Emilia: https://f1tenth.github.io/ifac2020.html
  - TU Wien TV, 'TU fast TU Furious gewinnt F1/TENTH-Grand Prix in Berlin' (TU Wien's team took first place at the Grand Prix of the IFAC World Congress 2020), YouTube, 2020-07-21, https://www.youtube.com/watch?v=YMzm2oCc_4w
- Notes: Numbered 7th on its own page; the 6th race is unnamed anywhere found (gap). DATE: Clemson's team video (tMG5udZq7tw, 2020-09-21) says the online race was in August 2020; the race page says July 15-16. The page's own race video (Vimeo 438853722) needs a login. Every qualifying run has a YouTube replay link on the page (26 links).

#### The full F1TENTH course, recorded and free online

`course-2020-recorded-course-online` · Sep 29, 2020 · milestone · event `None` · confidence **high**

> In September 2020 Rahul Mangharam introduced the recorded F1TENTH course, free on YouTube. By then, he said, the community counted over 60 universities, seven international competitions and course offerings at more than a dozen institutions.

- Link: <https://www.youtube.com/watch?v=hXmGTKom4O8>
- Video: <https://www.youtube.com/watch?v=hXmGTKom4O8>, <https://www.youtube.com/watch?v=zENhppcxwzY>
- Facts:
  - 'F1TENTH has a growing community of over 60 universities, 7 international autonomous racing competitions and hands-on course offerings in over a dozen institutions': 'F1TENTH Course Introduction by Rahul Mangharam', xLAB, YouTube, 2020-09-29, https://www.youtube.com/watch?v=hXmGTKom4O8
  - 'F1TENTH Autonomous Racing: Course Introduction' (Lecture 1 of the 18-video 2020 course): xLAB, YouTube, 2020-11-30, https://www.youtube.com/watch?v=zENhppcxwzY; race sites link it as the 'F1TENTH Autonomous Racing Course on Youtube' (e.g. esweek2022-race.f1tenth.org)
  - Course materials repo f1tenth_coursekit created 2020-03-13; F1TENTH Gym repo created 2020-03-16 (gh api)
- Notes: '7 international competitions' in September 2020 matches the numbering: IFAC 2020 was the 7th, IROS 2020 (8th) came a month later. A good scale-over-time datapoint next to today's '90+ universities'.

#### HiPeRT Modena wins the 8th Grand Prix, online for IROS 2020

`iros2020-virtual-hipert-wins` · Oct 27, 2020 · result · event `iros2020` · confidence **high**

> The IROS 2020 race was virtual too, with race day on October 27, 2020. Seventeen teams set qualifying laps. HiPeRT Modena won, C.A.T. from Seoul National University came second and UCSD's Siddharth Saha third.

- Link: <https://f1tenth.github.io/iros2020.html>
- Archive: <https://web.archive.org/web/20240809080757/https://f1tenth.org/iros2020.html>
- Image: <https://f1tenth.github.io/Brackets/irosbracket.png> 5692x3200 (bracket graphic, not a photo)
- Facts:
  - 'The 8th ... Autonomous Grand Prix is a virtual race': https://f1tenth.github.io/iros2020.html
  - Results: 1 HiPeRT Modena (Ayoub Raji, Federico Gavioli), 2 C.A.T. (Jihoon Seo, SungKyung Kim, Beomjoon Chae, Jaewon Lee), 3 UCSD-Sid (Siddharth Saha); 'With support from miniNodes': https://f1tenth.github.io/iros2020.html
  - Qualification table: 17 teams, first Vandy (Vanderbilt) 108.73 s; team list: C.A.T = Seoul National University: https://f1tenth.github.io/iros2020.html
  - Schedule graphic 'IROS 2020 Las Vegas Prix', race day Oct 27, 2020: https://f1tenth.github.io/iros2020/iros2020-schedule.png (events_map.json source)

### 2021

#### A course platform on f1tenth.org and a new hardware build series

`openedx-2021-course-platform-and-build-series` · Feb 4, 2021 · milestone · event `None` · confidence **medium**

> In February 2021 the course moved onto its own learning platform, built on Open edX and integrated into f1tenth.org. A four-part series showed how to build that year's car, a Traxxas Slash with an NVIDIA Jetson NX.

- Link: <https://www.youtube.com/watch?v=W535kjKRLU0>
- Video: <https://www.youtube.com/watch?v=W535kjKRLU0>, <https://www.youtube.com/watch?v=iyOtTtlHcvw>
- Facts:
  - 'we have a new learning management system (LMS) based on openEdX integrated in https://f1tenth.org': 'F1TENTH openEDX Course - Overview', xLAB, YouTube, 2021-02-04, https://www.youtube.com/watch?v=W535kjKRLU0
  - 'F1TENTH Autonomous Racing: Build the Hardware ... Vehicle: Traxxas Slash + Nvidia Jetson NX': xLAB, YouTube, 2021-02-04, https://www.youtube.com/watch?v=iyOtTtlHcvw
  - Repos edx-theme and edx-configuration (private) created 2020-07-30; edx-platform fork created 2020-12-24 (gh api)
- Notes: Whether the Open edX platform is still online is unknown; do not link it.

#### The first workshop on Opportunities and Challenges with Autonomous Racing, at ICRA 2021

`icra2021-workshop-autonomous-racing` · May 31, 2021 · announcement · event `icra2021-workshop` · confidence **high**

> ICRA 2021 hosted a full-day online workshop on autonomous racing on May 31, 2021, chaired by Madhur Behl, Johannes Betz, Rahul Mangharam and Venkat Krovi. The series returned at ICRA 2022 in Philadelphia and ICRA 2023 in London.

- Link: <https://linklab-uva.github.io/icra-autonomous-racing/>
- Video: <https://www.youtube.com/watch?v=SI0pB6cimoo>
- Facts:
  - '2021 ICRA Full-Day Workshop, May 31, 2021, held online': https://linklab-uva.github.io/icra-autonomous-racing/ (events_map.json source)
  - 'Opening remarks from the ICRA 2021 Full-Day workshop on Opportunities and Challenges with Autonomous Racing', chairs Behl, Betz, Mangharam, Krovi: Madhur Behl, YouTube, 2021-06-10, https://www.youtube.com/watch?v=SI0pB6cimoo (first of about 15 workshop videos)
  - ICRA 2022 workshop site: '2nd Workshop on Opportunities and Challenges with Autonomous Racing', May 23rd 2022, Philadelphia, Room 121B, hybrid; organizers Johannes Betz, Madhur Behl, Venkat Krovi, Rahul Mangharam: harvested repo icra2022_website (https://web.archive.org/web/20260616180207/https://icra2022.f1tenth.org/)
  - ICRA 2023 workshop site: '3nd [sic] Workshop on Opportunities and Challenges with Autonomous Racing', May 29 - June 2, 2023, ExCeL London, hybrid: harvested repo icra2023_website (https://web.archive.org/web/20250226171812/https://icra2023.f1tenth.org/)
- Notes: Not a race. The old f1tenth.org race page links it (banner race/irs-workshop.png).

#### Scuderia Segfault wins the 9th Grand Prix at IROS 2021 in Prague

`iros2021-prague-scuderia-segfault-wins` · Sep 27-Oct 1, 2021 · result · event `iros2021` · confidence **high**

> Four teams raced in person at Czech Technical University in Prague during IROS 2021. TU Wien's Scuderia Segfault won with a best lap of 18.70 seconds, ahead of Ředkvičky from Czech Technical University, HiPeRT Modena and Formula Trinity Autonomous from Trinity College Dublin. In the virtual competition, Tianracer won the final.

- Link: <https://web.archive.org/web/20250126061349/https://iros2021.f1tenth.org/results.html>
- Image: <https://f1tenth.github.io/race/iros2021.png> 1100x500 (event banner graphic)
- Video: <https://www.youtube.com/watch?v=CmTkiBiMnk4>, <https://www.youtube.com/watch?v=KLOceDeegVs>, <https://www.youtube.com/watch?v=xUehXiDY3cs>
- Facts:
  - '9th F1TENTH Autonomous Grand Prix / September 27th - October 1st 2021 / Location: Prague, Czech Republic': iros2021.f1tenth.org (events_map.json source)
  - In-person results: 1 Scuderia Segfault (TU Wien) best lap 18.70 s, 12 points total; 2 Ředkvičky (ČVUT) 18.95 s, 8; 3 HiPeRT Modena (UNIMORE) 19.63 s, 7; 4 Formula Trinity Autonomous (Trinity College Dublin) 19.94 s, 2: iros2021.f1tenth.org/results.html (harvested repo iros2021_website; Wayback 2025-01-26)
  - Participants page: 4 in-person teams, 31 virtual teams: iros2021.f1tenth.org/registration.html (Wayback 2025-08-24)
  - Virtual head-to-head bracket (Challonge urgyz5kl, Wayback 2024-10-14): final Tianracer beat AudUBon Racing 2-1; semi-finalists RAIL and HMCar; 17 teams in the bracket. Registration: Tianracer = Tianbot Robotics
  - 'F1tenth competition organized within IROS 2021 conference at the Czech Technical University in Prague.': industrialinformatics (CTU), 8 h 50 min stream, YouTube, 2021-09-29, https://www.youtube.com/watch?v=KLOceDeegVs; highlights 2021-10-01, https://www.youtube.com/watch?v=CmTkiBiMnk4
  - 'recording from the 9th F1TENTH Autonomous Grand Prix Virtual Competition at this years IROS 2021': xLAB, YouTube, 2021-09-30, https://www.youtube.com/watch?v=xUehXiDY3cs
- Notes: The race-site domain is dead (repo private); link the Wayback capture. events_map.json flipped this race from virtual to held on 2026-08-22 pending Cedric; the results page and CTU's stream support 'held'. Could be split into an in-person and a virtual item.

#### An education class at ESWeek 2021: learn to drive and race autonomous vehicles

`esweek2021-learn-to-drive-and-race-lecture` · Oct 2021 · video · event `None` · confidence **high**

> Johannes Betz and Rahul Mangharam taught an education class on autonomous driving and racing at Embedded Systems Week 2021. The seven lecture videos and the code are public.

- Link: <https://github.com/f1tenth/ESweek2021_educationclassA3>
- Video: <https://www.youtube.com/watch?v=cb2ogjrp6u4>
- Facts:
  - 'the code material for the ESweek 2021 for the Education Class Lecture A3 "Learn to Drive (and Race!) Autonomous Vehicles"'; lecturers Johannes Betz, Rahul Mangharam; 'Lecture videos: Youtube Playlist': https://github.com/f1tenth/ESweek2021_educationclassA3 (README)
  - 'ESWeek 2021 - Education Lecture - Learn to Drive (and Race!) Autonomous Vehicles - Part I', xLAB, YouTube, 2021-10-27, https://www.youtube.com/watch?v=cb2ogjrp6u4 (7-video playlist)
- Notes: The class's own title carries an exclamation mark; our title paraphrases it (voice rule). Low news value; optional.

### 2022

#### Penn's ScatterBrain wins the 10th Grand Prix at ICRA 2022 in Philadelphia

`icra2022-philadelphia-scatterbrain-wins` · May 23-25, 2022 · result · event `icra2022` · confidence **medium**

> ICRA 2022 in Philadelphia brought the race back in person, with a virtual option. Twenty teams made the in-person bracket, and Penn's ScatterBrain beat Dzik from the Polish Academy of Sciences in the final. ETH Zurich's Forza PBL and TU Wien's Scuderia Segfault reached the semi-finals. Lehigh's PL400 won the virtual race from the ninth seed.

- Link: <https://web.archive.org/web/20250315141512/https://icra2022-race.f1tenth.org/results.html>
- Image: <https://f1tenth.github.io/race/icra2022.png> 1024x538 (event banner graphic)
- Image: <https://engineering.lehigh.edu/sites/engineering.lehigh.edu/files/Team%20PL400.jpg> 1600x1200 (Lehigh news photo of team PL400 (virtual winners))
- Video: <https://www.youtube.com/watch?v=gk_lNKmZX4I>, <https://www.youtube.com/watch?v=TBlyWdtQD9k>
- Facts:
  - '10th F1TENTH Autonomous Grand Prix / May 23th - May 25th 2022 / Location: Philadelphia, USA': icra2022-race.f1tenth.org (events_map.json source)
  - In-person bracket (Challonge jf88sqbk, embedded on results.html; Wayback 2022-10-16 and 2024-10-08): final ScatterBrain beat Dzik 2-0; semi-finals ScatterBrain beat Forza PBL 2-0, Dzik beat Scuderia Segfault 2-0; 20 teams in the bracket; bracket state 'awaiting_review' in the capture
  - Participants page: ScatterBrained, University of Pennsylvania (Jiatong Sun, Kedar Prasad Karpe, Griffon McMahon); Dzik, Polish Academy of Sciences; ForzaPBL, ETH; Scuderia Segfault, Vienna University of Technology; 38 in-person and 40 virtual teams listed: icra2022-race.f1tenth.org/registration.html (Wayback 2025-08-22)
  - Virtual bracket (Challonge i52dzqqr): final PL400 beat ACE 2-1; 17 teams; logs: https://github.com/f1tenth/icra_2022_logs ('F1TENTH ICRA 2022 Virtual Competition Head-to-Head Results')
  - 'A team of Lehigh University students recently won the F1TENTH Virtual Competition Head-to-Head Race ... part of the 10th F1TENTH Autonomous Grand Prix, held May 23-27 ... PL400 ... started the competition as the 9th seed in an international field of 17 qualifying teams ... defeat[ed] the 5th seed, team DSplay (Korea University), in the semifinal, and the 2nd seed, team ACE (Gyeongsang National University), in the final': Lehigh Engineering, 2022-06-09, https://engineering.lehigh.edu/node/163424
  - CTU (CIIRC), 2022-06-03: the CTU team beat UCF and IIT Kharagpur in the virtual head-to-head, lost to Gyeongsang National University and Korea University and finished 4th: https://www.ciirc.cvut.cz/ctu-team-placed-4th-in-the-f1tenth-autonomous-grand-prix/
  - TU Wien TV: 'Die Scuderia Segfault ... konnte sich beim Grand Prix in Philadelphia (USA) über Platz 3 freuen' (took 3rd place in Philadelphia), YouTube, 2022-06-09, https://www.youtube.com/watch?v=gk_lNKmZX4I
  - Same week: '2nd Workshop on Opportunities and Challenges with Autonomous Racing', May 23, 2022: icra2022.f1tenth.org
- Notes: The bracket says 'ScatterBrain', the participants page 'ScatterBrained'; same Penn team. THIRD PLACE: the bracket has no third-place match, but TU Wien says Scuderia Segfault finished 3rd; Forza PBL was the other semi-finalist. The excerpt names both semi-finalists and no third place. Medium only because the winner comes from a bracket widget; a Penn news item would make it high.

#### ETH Zurich explains autonomous racing on the 1/10-scale car

`eth-pbl-f1tenth-explainer-2022` · Jun 3, 2022 · video · event `None` · confidence **high**

> ETH Zurich's Center for Project-Based Learning, home of the ForzaETH team, published a short film on its racing work with the car. It describes an open-source, community-driven platform whose races are hosted at robotics conferences such as IROS and ICRA.

- Link: <https://www.youtube.com/watch?v=TBlyWdtQD9k>
- Video: <https://www.youtube.com/watch?v=TBlyWdtQD9k>
- Facts:
  - 'F1TENTH is an open source community driven autonomous racing platform, organizing semi-annual races hosted at robotics conferences such as IROS and ICRA.': D-ITET Center for Project-Based Learning (ETH Zurich), 'F1TENTH autonomous racing', YouTube, 2022-06-03, https://www.youtube.com/watch?v=TBlyWdtQD9k (about 38k views when read)
- Notes: The ETH team raced as ForzaPBL in 2022 and as ForzaETH from 2024. The MAP controller video by the same center is already on /news.

#### The ESWeek 2022 race runs in person in Shanghai

`esweek2022-shanghai-in-person-race` · Oct 10-12, 2022 · announcement · event `esweek2022` · confidence **medium**

> Embedded Systems Week 2022 held an in-person race at East China Normal University in Shanghai, October 10 to 12, with race day on October 12. The virtual option was cancelled, and the organizers offered a loan car to teams without one.

- Link: <https://web.archive.org/web/20250308053750/https://esweek2022-race.f1tenth.org/>
- Facts:
  - 'ESWEEK 2022 F1-TENTH CAR RACE / October 10th - October 12th 2022 / Location: Shanghai, China'; 'will be an in-person competition. The virtual competition is cancelled.'; 'If there are interested teams but do not have a car we are able to provide a loan car.'; 'Oct 12th: Race Day (9:00 am BJT)'; 'part of the ESWEEK 2022 Student Competition': esweek2022-race.f1tenth.org (harvested repo esweek2022-race)
  - Venue map embed: East China Normal University; contact f1tenth@tianbot.com: same page
  - Results were published as two Challonge widgets (time trial nvcuqksv, head-to-head 21927d68); neither is in the Wayback Machine and Challonge answers 403 to scripts
- Notes: No result found. It becomes a result item if the two Challonge brackets can be read in a normal browser (challonge.com/nvcuqksv, challonge.com/21927d68). No ordinal on the site.

#### The 1st Korea Championship runs in Jeju

`korea2022-first-korea-championship` · Dec 12-13, 2022 · announcement · event `korea2022` · confidence **high**

> The first national championship in Korea ran with KSMTE 2022 at the Ramada Plaza in Jeju, December 12 and 13, 2022. It started a yearly Korean series that reached its fourth edition at ICCAS 2025.

- Link: <https://web.archive.org/web/20251206063348/http://korea-race.f1tenth.org/>
- Image: <https://f1tenth.github.io/race/korea-race.png> 1900x844 (event banner graphic)
- Video: <https://www.youtube.com/watch?v=Iy5M5hh4gFk>
- Facts:
  - 'The 1st F1TENTH Korea Championship / KSMTE 2022 / 2022, Dec 12th - Dec 13th / Location: 66 Tapdong-ro, Ramada Plaza by Wyndham Jeju': korea-race.f1tenth.org (events_map.json source)
  - 'The 1st F1Tenth Korea Championship 2022 Dec 12-13, Ramada Plaza Hotel, Jeju, Korea.': AiX, YouTube, 2022-12-30, https://www.youtube.com/watch?v=Iy5M5hh4gFk
  - 2025.iccas.org program lists '2025 The 4th F1Tenth Korea Championship' (events_map.json iccas2025 source)
- Notes: Results not found (repo korea-race has only a deprecated results template).

### 2023

#### ASSEMBLY magazine on Penn's scaled-down autonomous racing

`press-assembly-2023-penn-program` · Jan 25, 2023 · announcement · event `None` · confidence **medium**

> ASSEMBLY magazine profiled the competition and the Penn course behind it in January 2023: every team starts from the same chassis, adds cameras, LiDAR and other sensors, and learns to write self-driving code that works at the limit of the car.

- Link: <https://www.assemblymag.com/articles/97571-penn-program-promotes-scaled-down-autonomous-vehicle-racing>
- Image: <https://www.assemblymag.com/ext/resources/Issues/2023/jan/campus/asb0123campus1.jpg?height=635&t=1674666606&width=1200> 900x550 (photo courtesy University of Pennsylvania)
- Facts:
  - 'Penn Program Promotes Scaled-Down Autonomous Vehicle Racing', Austin Weber, ASSEMBLY, January 25, 2023: 'Thanks to a big-time collegiate competition called F1TENTH, some of those breakthroughs are occurring on a small scale'; captions: 'Each F1TENTH team uses a standardized chassis that includes a battery, controller, motor, drivetrain and wheels'; 'Students add cameras, lidar and other sensors that enable autonomous operation'; 'By focusing on a racing environment, students learn how to develop self-driving algorithms that operate on the edge of vehicle dynamics': https://www.assemblymag.com/articles/97571-penn-program-promotes-scaled-down-autonomous-vehicle-racing
- Notes: Trade-press profile; only the lead and captions were read. Low priority.

#### Penn wins at CPS-IoT Week 2023 in San Antonio

`cps2023-san-antonio-penn-wins` · May 8-9, 2023 · result · event `cps2023` · confidence **high**

> Thirteen schools raced in San Antonio during CPS-IoT Week, and the final ran on May 9, 2023. A Penn Engineering team racing as Bercedes Menz Foxglove Racing Team beat NC State's car Derek in the final. The winners credited a data-driven strategy: map the track with the LiDAR, plan an optimal race line, then tune from telemetry.

- Link: <https://www.seas.upenn.edu/stories/penn-engineering-students-win-the-12th-annual-f1tenth-autonomous-grand-prix/>
- Archive: <https://web.archive.org/web/20250623030417/https://cps2023-race.f1tenth.org/results.html>
- Image: <https://www.engineering.upenn.edu/wp-content/uploads/2023/06/F1-Tenth-Car-Final.jpeg> 600x400 (Penn story photo of the car, small)
- Image: <https://ece.ncsu.edu/wp-content/uploads/2023/05/IMG_3818-1024x768.jpg> 1024x768 (NC State news photo)
- Image: <https://f1tenth.github.io/race/cps2023.png> 1996x1217 (event banner graphic)
- Video: <https://www.youtube.com/watch?v=BWRscx68Dl0>
- Facts:
  - '12th F1TENTH Autonomous Grand Prix / May 8th - 9th 2023 / Location: San Antonio, Texas USA': cps2023-race.f1tenth.org (events_map.json source; Cedric renumbered it 11th on 2026-08-23)
  - Results page embeds Challonge f1tenth_cps_iot_2023 ('Link to full standings'); capture of 2024-10-10: final Bercedes Menz Foxglove Racing Team beat Derek 2-0; semi-finals Foxglove beat KU-CSL 20-14, Derek beat Carnegie Autonomous Racing 20-17; 13 teams; state 'complete'
  - 'F1Tenth Competition at CPS-IoT Week 2023' (4.5 min), xLAB, YouTube, 2023-05-11, https://www.youtube.com/watch?v=BWRscx68Dl0
  - 'On May 9, a group of Penn Engineering students won the 12th Annual F1Tenth Autonomous Grand Prix in San Antonio, Texas ... Penn Engineering beat out 12 other schools to assume the title.' Team: Jimmy Zhang, Rohit Bhikule, Chandravaran Kunjeti, Jason Xie; advisor Rahul Mangharam. Xie: 'Our team's victory during this event came down to our data-driven strategy': Penn Engineering, 2023-06-16, https://www.seas.upenn.edu/stories/penn-engineering-students-win-the-12th-annual-f1tenth-autonomous-grand-prix/
  - 'The Embedded Machine Learning Club won second place in the 2023 F1Tenth Autonomous Vehicle Race down in San Antonio in May!'; cars named Derek and Darius; race on May 9th: NC State ECE, 2023-05-19, https://ece.ncsu.edu/2023/embedded-machine-learning-club-wins-second-place-in-f1tenth-race/
- Notes: NUMBERING CONFLICT: the race site and Penn Engineering both call San Antonio the 12th; events_map.json says 11th (Cedric 2026-08-23: San Antonio ran before London); TUM and TU Wien call London the 11th. The title avoids an ordinal until Cedric rules. The Penn-to-Foxglove match is by the bracket winner plus Penn's own claim (13 schools = 13 bracket entrants); the team members are not listed on the race site. Confidence high on the winner.

#### ForzaETH wins the ICRA 2023 Grand Prix in London

`icra2023-london-forzaeth-wins` · May 29-31, 2023 · result · event `icra2023` · confidence **high**

> Forty-one teams registered for the Grand Prix at ICRA 2023 at ExCeL London, organized with TUM and King's College London. ETH Zurich's ForzaETH won the grand final against TU Wien's Scuderia Segfault. Suzlab from Nagoya University reached the semi-finals, and HiPeRT Modena lost to TU Wien by centimeters in a tie-break race.

- Link: <https://informatics.tuwien.ac.at/news/2442>
- Archive: <https://web.archive.org/web/20251004060537/https://icra2023-race.f1tenth.org/>
- Image: <https://informatics.tuwien.ac.at/news/2442/pictures/1905/hero-2x> 1540x1100 (TU Wien team photo, picture credit mlcontests.com)
- Video: <https://www.youtube.com/watch?v=GiXn8uKrcSk>, <https://www.youtube.com/watch?v=k4_4MZIakvo>
- Facts:
  - 'After three thrilling competition days, team Scuderia Segfault from TU Wien secured Silver at the 11th F1Tenth Autonomous GPRX. This competition with 41 registered teams from universities and research institutes from all over the world took place at IEEE International Conference on Robotics and Automation (ICRA) 2023 from May 29th - May 31th 2023 in London'; semi-final 'against team Suzlab from Nagoya University, Japan'; 'The Grand Final Race was against team ForzaETH from ETH Zürich ... ETH's team was faster in the end, taking a deserved win.': TU Wien Informatics, 'Silver at 11th F1TENTH Autonomous Grand Prix', 2023-06-02, https://informatics.tuwien.ac.at/news/2442
  - 'Together with our partners from the University of Pennsylvania (Rahul Mangahram, Hongrui Zheng) and Kings College London (Nicola Paoletti), we are organising the 11th F1TENTH Autonomous Grand Prix': TUM AVS, 2023-03-30, https://www.mos.ed.tum.de/en/avs/news/article/icra-2023-avs-organizes-f1tenth-race/
  - '11th F1TENTH Autonomous Grand Prix / May 29th - June 1st 2023 / Location: Excel London, UK': icra2023-race.f1tenth.org (events_map.json; Cedric renumbered it 12th)
  - TU Wien TV: 'Ein zweiter Platz beim Grand Prix 2023 in London ist bereits der vierte Podestplatz in Folge' (second place in London, the fourth podium in a row), YouTube, 2023-06-09, https://www.youtube.com/watch?v=GiXn8uKrcSk
  - Same week: '3nd [sic] Workshop on Opportunities and Challenges with Autonomous Racing', ExCeL London, hybrid (harvested repo icra2023_website)
- Notes: NUMBERING CONFLICT: TUM, TU Wien and the race site call London the 11th; events_map.json calls it the 12th (Cedric, 2026-08-23), so the title carries no ordinal. The race site's results page was never filled in. TU Wien's list of earlier podiums in the same article has two slips ('8th ... IFAC Berlin 2020' is the 7th on the race page; 'Philadelphia 2023' was 2022). Third place not stated (no small final mentioned).

#### Université Laval's VAUL wins the 14th Grand Prix at IROS 2023 in Detroit

`iros2023-detroit-vaul-wins` · Oct 1-5, 2023 · result · event `iros2023` · confidence **high**

> Nine teams qualified at Huntington Place in Detroit during IROS 2023. VAUL from Université Laval took the top seed with 24 laps and a best lap of 11.82 seconds, then beat Autoware Aces in the final. Autoware Rocket and HUMDA-SZE 2 reached the semi-finals.

- Link: <https://web.archive.org/web/20251212034035/https://iros2023-race.f1tenth.org/results.html>
- Image: <https://indrorobotics.ca/wp-content/uploads/2023/10/DSCF4383-scaled.webp> 2560x1707 (InDro Robotics article photo)
- Video: <https://www.youtube.com/watch?v=KHUE3kbSOCE>, <https://www.youtube.com/watch?v=HRmYaZ_l3KI>
- Facts:
  - '14th F1TENTH Autonomous Grand Prix / Oct 1st - 5th 2023 / Location: Huntington Place, Detroit, MI, USA': iros2023-race.f1tenth.org (events_map.json source)
  - Qualification results: seeds 1 VAUL (24 laps, 11.82 s), 2 Autoware Rocket (23, 12.64), 3 Autoware Aces (20, 13.87), 4 HUMDA-SZE 1, 5 HUMDA-SZE 2, 6 Audubon Bisons, 7 Technion, 8 Audubon Bulls, 9 Speed Cardinals: iros2023-race.f1tenth.org/results.html
  - Final results (Challonge w6qar708, Wayback 2025-06-23): final VAUL beat Autoware Aces 2-0; semis VAUL beat HUMDA-SZE2 2-0, Autoware Aces beat Autoware Rocket 2-1; state 'complete'
  - 'participation at the 14th F1TENTH Grand Prix at IROS 2023 in Detroit, USA, where we won the first place !': Véhicule Autonome UL (Université Laval), 'Recap F1TENTH Detroit 2023', YouTube, 2024-03-01, https://www.youtube.com/watch?v=KHUE3kbSOCE
  - InDro Robotics, 'Engineers put skills to the test in F1tenth autonomous challenge', 2023-10-05 (Hongrui Zheng: winning is '90 per cent software, and 10 per cent hardware'; a car with a 2D LiDAR costs about $2,500-2,800): https://indrorobotics.ca/engineers-put-skills-to-the-test-in-f1tenth-autonomous-challenge/
- Notes: The results page's title still says 'F1TENTH ICRA 2023' (template leftover). Start of VAUL's run: IROS 2023, ICRA 2024 and SM 2024 wins, plus three Sim Racing League titles. Same week: the 1st MAD-Games workshop (separate candidate).

#### The first MAD-Games workshop on multi-agent dynamic games, at IROS 2023

`iros2023-madgames-first-workshop` · Oct 1, 2023 · announcement · event `iros2023-madgames` · confidence **high**

> The race organizers opened a workshop on multi-agent dynamic games at IROS 2023 in Detroit on October 1. It asked how autonomous agents can compete safely against opponents whose strategies they cannot see. The second edition followed at ICRA 2024 in Yokohama.

- Link: <https://web.archive.org/web/20250713222618/https://iros2023-madgames.f1tenth.org/>
- Image: <https://f1tenth.github.io/race/MAD-GAMES1-LOGO.png> 3795x1855 (workshop logo graphic)
- Facts:
  - '1st Workshop on MAD-Games: Multi-Agent Dynamic Games / IROS 2023 / October 1, 2023 / Detroit, Michigan, USA, Huntington Place, Room 252A / only in In-Person'; contact rahulm@seas.upenn.edu: harvested repo iros2023_madgames_website
  - '2nd Workshop on MAD-Games / May 13th 2024 / F201, Annex Hall, PACIFICO Yokohama': icra2024-madgames.f1tenth.org; talks playlist: 'MAD Games workshop ... at ICRA 2024 was organized by Rahul Mangharam, Hongrui Zheng, Shuo Yang, Johannes Betz and Venkat Krovi', xLAB, YouTube, 2024-06-18, https://www.youtube.com/watch?v=TimT2Y3iNvU
  - Contributed session video (titled 'IROS'24' but uploaded 2023-10-10 and linking the 2023 site): https://www.youtube.com/watch?v=yGT0o1N7pqY
  - '3rd Workshop on MAD-Games / 2025 IEEE ICRA' with date and location TBD: private repo icra2025_madgames_website (never linked from the site)
- Notes: Whether a 3rd edition ran at ICRA 2025 is not confirmed by any page read.

#### The 2nd Korea Championship runs at ICCAS 2023 in Yeosu

`korea2023-second-korea-championship` · Oct 17-19, 2023 · announcement · event `korea2023` · confidence **high**

> The Korean championship moved to the ICCAS conference for its second edition, October 17 to 19, 2023, at SonoCalm Yeosu. Thirty-one teams registered and 29 raced.

- Link: <https://korea-race23.f1tenth.org/>
- Image: <https://f1tenth.github.io/race/korea_2.png> 1817x811 (event banner graphic)
- Video: <https://www.youtube.com/watch?v=dmZCUUcmzzE>
- Facts:
  - 'The 2nd F1Tenth Korea Championship / ICCAS 2023 / 2023, Oct 17th - Oct 19th / Location: SonoCalm Yeosu at Yeosu, Korea': https://korea-race23.f1tenth.org/ (live, events_map.json source)
  - '2023 F1Tenth Korea Championship Oct 17-19, 2023, Yeosu, Korea 31 Teams registered, and 29 teams were racing actually.': AiX, YouTube, 2023-10-24, https://www.youtube.com/watch?v=dmZCUUcmzzE
- Notes: Winner not found.

### 2024

#### Penn teams take first and second in a three-university race in Philadelphia

`course2024-penn-cmu-lehigh-friendly-race` · Apr 29, 2024 · result · event `course2024` · confidence **high**

> Penn, Carnegie Mellon and Lehigh, three Pennsylvania universities that teach the same course, raced outside Skirkanich Hall in Philadelphia on April 29, 2024. Penn's Teams 6 and 9 took first and second, and Carnegie Mellon's Team 3 finished third.

- Link: <https://mailchi.mp/b7136669240c/f1tenth-summer-newsletter>
- Image: <https://mcusercontent.com/a91a25f4c1fbc0c9896af9a20/images/a66af0cf-94c0-5c02-f7fc-6a1d2ef9c80f.jpg> 4032x3024 (newsletter photo of the race)
- Image: <https://mcusercontent.com/a91a25f4c1fbc0c9896af9a20/images/de065534-1fc6-3479-624f-dc8477b50649.jpg> 4032x3024 (second newsletter photo)
- Image: <https://f1tenth.github.io/race/Penn%20Home%20Race%20Apr%2029.png> 1414x2000 (event flyer graphic)
- Facts:
  - 'UPenn, Carnegie Mellon University, and Lehigh University are all located in Pennsylvania, USA and this "friendly" race took place on April 29 in Philadelphia. The three Universities all teach the same course with 1/10th scale autonomous racecars. First and second places went to UPenn Teams 6 and 9 with third place went to Carnegie Mellon Team 3.': F1TENTH summer newsletter, 2024-07-25, https://mailchi.mp/b7136669240c/f1tenth-summer-newsletter
  - Flyer on the old race page: 'F1TENTH Autonomous Racing Competition - Spring 2024 Course / April 29, 12-3PM / Venue: Outside Skirkanich Hall, Philadelphia / Teams: UPenn, CMU, and Lehigh': https://f1tenth.github.io/race/Penn%20Home%20Race%20Apr%2029.png
  - past_races.json entry 'RoboRacer Autonomous Racing Competition - Spring 2024 Course' (no URL)
- Notes: Settles events_map.json course2024 (venue outside Skirkanich Hall on the Penn campus; it can become verified). No ordinal anywhere; nothing says it is the 16th. The newsletter photos are RoboRacer's own; confirm reuse with Cedric.

#### CityU's FSM Speed wins the 17th Grand Prix at CPS-IoT Week 2024 in Hong Kong

`cpsweek2024-hongkong-fsm-speed-wins` · May 14-16, 2024 · result · event `cpsweek2024` · confidence **high**

> Eight teams from six countries and regions registered for the 17th Grand Prix at the Hong Kong Science and Technology Park, and five raced. FSM Speed from City University of Hong Kong won, ahead of Mobinets from UESTC and AART from San Diego State University. AART also took a new award for the most autonomous car.

- Link: <https://mailchi.mp/b7136669240c/f1tenth-summer-newsletter>
- Image: <https://mcusercontent.com/a91a25f4c1fbc0c9896af9a20/images/a85e393f-34ac-a029-ed41-b83806bab76f.jpg> 1908x1272 (newsletter photo)
- Image: <https://mcusercontent.com/a91a25f4c1fbc0c9896af9a20/images/3df34eba-5b35-1f1b-14f2-7008e7f7f3e0.jpg> 1908x1272 (newsletter photo)
- Facts:
  - 'The 17th F1TENTH Autonomous Grand Prix took place successfully from May 14 to 16 during the 2024 Cyber-Physical Systems and Internet-of-Things Week (CPS-IoT Week 2024) in Hong Kong. The event had registrations from eight teams from six different countries and regions, with five teams actually participating ... the champions, runners-up, and third-place winners were Team FSM Speed from CityU, Team Mobinets from UESTC, and Team AART from SDSU': F1TENTH summer newsletter, 2024-07-25 ('As directly contributed by Shuyao Shi'), https://mailchi.mp/b7136669240c/f1tenth-summer-newsletter
  - '17th F1TENTH Autonomous Grand Prix / May 14th - 16th 2024 / Location: Hong Kong Science and Technology Park': cpsweek2024-race.f1tenth.org (events_map.json)
- Notes: The race site's results page only ever said 'TBD'. The newsletter heading says 'CPS Week 2024 in China'; write Hong Kong. UESTC = University of Electronic Science and Technology of China.

#### Université Laval's VAUL wins the 15th Grand Prix at ICRA 2024 in Yokohama

`icra2024-yokohama-vaul-wins` · May 13-17, 2024 · result · event `icra2024` · confidence **high**

> VAUL from Université Laval won the 15th Grand Prix at ICRA 2024 in Yokohama, its second win in a row after IROS 2023. ETH Zurich's ForzaETH won the small final against TU Wien's Scuderia Segfault for third. The second MAD-Games workshop on multi-agent dynamic games ran the same week.

- Link: <https://foxglove.dev/blog/spotlight-building-a-championship-autonomous-f1-racecar-for-f1tenth>
- Archive: <https://web.archive.org/web/20250908153518/https://icra2024-race.f1tenth.org/>
- Image: <https://informatics.tuwien.ac.at/news/2646/pictures/2355/zoom-2x> 2800x1860 (TU Wien news photo)
- Image: <https://assets.foxglove.dev/website/blog/spotlight-building-a-championship-autonomous-f1-racecar-for-f1tenth/hero.jpeg> 1538x865 (Foxglove blog hero)
- Image: <https://f1tenth.github.io/race/ICRA%202024%20May%2013-17.png> 1414x2000 (event flyer graphic)
- Video: <https://www.youtube.com/watch?v=QBgdusf7fDU>
- Facts:
  - 'Recently, the Véhicule Autonome Université Laval (VAUL) team took home first place at the 15th Grand Prix in Yokohama, Japan during ICRA 2024.': Foxglove blog, 2024-06-27, https://foxglove.dev/blog/spotlight-building-a-championship-autonomous-f1-racecar-for-f1tenth
  - 'we qualified in 3rd place out of 18 teams ... we faced the VAUL Blitz team from Laval University ... relegating us to the small final ... we emerged victorious, securing 3rd place': ForzaETH blog, 2024-05-19, https://www.forzaeth.ch/blog/icra_24/
  - TU Wien: Scuderia Segfault lost its semi-final to 'Dzik Team of the Polish Academy of Sciences, which won only by a hair's breadth'; 'over 20 teams': https://informatics.tuwien.ac.at/news/2646
  - '15th F1TENTH Autonomous Racing Competition / May 13-17, 2024 / ICRA 2024 / Yokohama, Japan': old-site flyer https://f1tenth.github.io/race/ICRA%202024%20May%2013-17.png
  - 2nd MAD-Games workshop, May 13, 2024, PACIFICO Yokohama: icra2024-madgames.f1tenth.org (events_map.json)
- Notes: SECOND PLACE is inferred (Dzik Team won the other semi-final; no source states the final), so the excerpt names no runner-up. TEAM COUNT DIFFERS: 18 in time trials (ForzaETH) vs 'over 20' (TU Wien); Rahul's LinkedIn (2024-05-11) says 'over 100 participants'. The race site is dead (NXDOMAIN); archive is the Wayback capture. Sponsor Tier IV per the fork (not verified here).

#### VAUL wins again at IEEE Smart Mobility 2024 in Niagara Falls

`sm2024-niagara-vaul-retains-title` · Sep 16-18, 2024 · result · event `sm2024` · confidence **high**

> Université Laval's VAUL won the 19th Grand Prix at IEEE Smart Mobility 2024 in Niagara Falls, averaging 25 km/h with a top speed of 40 km/h. West Virginia University's WV Mountaineers came second in their first race, and The Roaring Phoenix from St. Stephen's Episcopal School in Austin third.

- Link: <https://mailchi.mp/ae2a4b322d10/f1tenth-summer-newsletter-6742377>
- Image: <https://mcusercontent.com/a91a25f4c1fbc0c9896af9a20/images/4c96f97a-c96b-a311-f1a4-c7faa4ff4953.jpg> 800x533 (newsletter photo)
- Image: <https://pbs.twimg.com/media/GZSPZKnWMAAuIXE.jpg> 1200x676 (photo in the @f1tenth post on X)
- Facts:
  - 'Laval University's Autonomous Vehicle (VAUL) retained its international title with an impressive average speed of 25 km/h and a top speed of 40 km/h on straightaways! The WV Mountaineers (West Virginia University, led by Amr El-Wakeel) showcased exceptional durability and performance. The Roaring Phoenix (St. Stephen's Episcopal School, Austin, Texas ...)': newsletter '2024 IEEE Smart Mobility F1tenth Race Results', 2024-10-07, https://mailchi.mp/ae2a4b322d10/f1tenth-summer-newsletter-6742377
  - WVU: 'placing second against teams from USA, Canada and China'; 'coming in second to the reigning champions of the IEEE IROS and IEEE ICRA': https://media.statler.wvu.edu/news/2024/09/24/wvu-f1tenth-team-places-second-in-international-competition (photo 876x493)
  - '19th F1TENTH Autonomous Grand Prix / SM 2024 / September 16th - 18th 2024 / Niagara Falls, Ontario': sm2024-race.f1tenth.org (events_map.json)
  - Post on X: https://x.com/f1tenth/status/1843255812736635194
- Notes: Team count not stated. St. Stephen's Episcopal School is a school, not a university; confirm how the team wants to be described. WVU's first podium: good back-story for the WVU team card (3rd at IV 2026).

#### A new power board for the car, designed with Ambimat Electronics

`ambimat-power-board-2024` · Sep 24, 2024 · announcement · event `None` · confidence **medium**

> Ambimat Electronics and Penn's xLAB designed a power supply board for the car, announced in September 2024.

- Link: <https://mailchi.mp/f826ff366817/f1tenth-summer-newsletter-6742133>
- Facts:
  - 'F1tenth is now collaborating with Ambimat Electronics! Ambimat Electronics in collaboration with University of Pennsylvania-X Lab has designed the Power Supply Board for the autonomous systems.': newsletter 'Announcing the Boston U F1tenth Race + Ambimat Electronics Collaboration', 2024-09-24, https://mailchi.mp/f826ff366817/f1tenth-summer-newsletter-6742133
  - Product page: https://ambimat.com/f1tenth/; public repo f1tenth_powerboard_v10 created 2024-12-18 (gh api)
- Notes: COMMERCIAL PARTNER: Ambimat sells the board. The content skill forbids naming a sponsor without written confirmation; this is a collaboration, but ask Cedric first. Low reader interest.

#### Eight competitions on the 2024 calendar

`season2024-eight-competitions` · 2024 season · announcement · event `None` · confidence **medium**

> The 2024 season was the busiest yet. The race page's banner listed competitions at ICRA in Yokohama, CPS-IoT Week in Hong Kong, IEEE IV in Jeju, IEEE Smart Mobility in Ontario, IROS in Abu Dhabi, ICCAS in Jeju, Boston University and CDC in Milan. The newsletter put the community at 60 partner universities.

- Link: <https://f1tenth.github.io/race/Multi%20Race%20Website%20Banner%2024Sept2024%20FINAL.jpg>
- Image: <https://f1tenth.github.io/race/Multi%20Race%20Website%20Banner%2024Sept2024%20FINAL.jpg> 4001x2251 (season banner with a group photo and two race photos inset; the event of the photos is not stated)
- Image: <https://f1tenth.github.io/race/IMG_3407.png> 3000x1688 (the previous banner (Aug 29, 2024), same photos, lists ITSC instead of BU)
- Facts:
  - Banner on the race page from 2024-09-30: 'F1Tenth Autonomous Racing Competitions 2024 in eight top robotics, transportation, and control systems conferences, events and workshops worldwide': MAY 14-16 ICRA 2024 Yokohama; MAY 13-16 CPS Week 2024 Hong Kong; JUN 2-5 IEEE IV Jeju Island; SEP 16-18 IEEE Smart Mobility Ontario; OCT 14-18 IROS 2024 Abu Dhabi; OCT 29-NOV 1 ICCAS 2024 Jeju Island; NOV 22 Learning Autonomy Workshop Boston University; DEC 16-19 CDC 2024 Milan: https://f1tenth.github.io/race/Multi%20Race%20Website%20Banner%2024Sept2024%20FINAL.jpg
  - Banner on the race page 2024-08-29 to 2024-09-30: 'in seven top robotics, transportation and control systems conferences worldwide', same list minus BU plus 'SEP 24-7: IEEE ITSC 2024 in Edmonton / Canada': https://f1tenth.github.io/race/IMG_3407.png; commits 2024-08-29 'Update race banner', 2024-09-30 'Update banner with boston race' (private repo, gh api)
  - 'Over the past six years we have developed the F1TENTH Autonomous Racing Community, Curriculum, and Competitions with partnerships across 60 universities': newsletter 'F1tenth Autonomous Racing Events 2024', 2024-05-16, https://us13.campaign-archive.com/?u=a91a25f4c1fbc0c9896af9a20&id=b1f91eb898
  - 'Can't come to Japan? We have 7 International Competitions this year': Rahul Mangharam, LinkedIn, 2024-05-11, https://www.linkedin.com/posts/mangharam_f1tenth-autonomous-racing-competitions-2024-activity-7195044996926898176-r0Go
- Notes: FLAG: the banner that went up during ITSC 2024 drops the ITSC race, which events_map.json counts as the 20th; no results for ITSC 2024 exist anywhere. Ask Cedric/Rahul whether it ran. The banner's ICRA dates (May 14-16) differ from the ICRA flyer (May 13-17). 'Six years' in the newsletter does not match the 2016 start. The inset photos could serve if their event is identified.

#### The first Sim Racing League draws 58 teams

`iros2024-first-sim-racing-league` · Oct 7, 2024 · milestone · event `iros2024` · confidence **high**

> Alongside IROS 2024, the first Sim Racing League let teams race a digital twin of the car in the AutoDRIVE simulator, with no hardware needed. Fifty-eight teams with more than 160 people registered and nine qualified for the final. TURTLEBOT from Singapore won, ahead of IDEA_LAB from Gyeongsang National University and KU F1TENTH from the University of Kansas.

- Link: <https://autodrive-ecosystem.github.io/competitions/roboracer-sim-racing-iros-2024/>
- Image: <https://autodrive-ecosystem.github.io/assets/images/banners/RoboRacer%20Sim%20Racing%20%40%20IROS%202024.png> 4400x1467 (league banner graphic, 3.9 MB)
- Video: <https://www.youtube.com/watch?v=bctpfSjyjXs>
- Facts:
  - 'we are organizing the first ever RoboRacer Sim Racing League, which leverages AutoDRIVE Ecosystem to model and simulate the digital twin of a RoboRacer racecar within a virtual racetrack'; results 1 TURTLEBOT 141.59 s, 2 IDEA_LAB 186.58 s, 3 KU F1TENTH 244.88 s; final Oct 5-6, results Oct 7, 2024: https://autodrive-ecosystem.github.io/competitions/roboracer-sim-racing-iros-2024/
  - '1st F1TENTH Sim Racing League, which took place at ... IROS 2024 ... a total of 58 teams (160+ participants) registering': AutoDRIVE Ecosystem, YouTube, 2024-10-12, https://www.youtube.com/watch?v=bctpfSjyjXs
  - Autoware Foundation blog, 2025-07-21, 'How sim racing is expanding access to autonomy' (Tanmay and Chinmay Samak): 'The very first deployment at IROS 2024 in Abu Dhabi, UAE witnessed 58 teams (160+ participants)': https://autoware.org/how-sim-racing-is-expanding-access-to-autonomy/
- Notes: TURTLEBOT is Jit Ern Lim (Singapore) per the results table. The page says 'RoboRacer' throughout now; in Oct 2024 it was the 'F1TENTH Sim Racing League' (video title). Run with Clemson's AutoDRIVE (Samak brothers, Venkat Krovi). The league has no id in events_map.json; event reuses iros2024.

#### Dzik Ultimate wins the 21st Grand Prix at IROS 2024 in Abu Dhabi

`iros2024-abudhabi-dzik-ultimate-wins` · Oct 14-18, 2024 · result · event `iros2024` · confidence **high**

> Dzik Ultimate, an independent team from Poland, won both the time trials and the head-to-head races at IROS 2024 in Abu Dhabi, with no collisions and a lap under seven seconds. TU Wien's Scuderia Segfault finished second and ETH Zurich's ForzaETH third. SAGOL took a special award as the best first-time team.

- Link: <https://mailchi.mp/20e93a8ea541/f1tenth-summer-newsletter-6742752>
- Archive: <https://web.archive.org/web/20241107140818/https://iros2024-race.f1tenth.org/>
- Image: <https://www.tuwien.at/inf/scuderia-segfault/wp-content/uploads/2024/11/group-picture-iros2024.jpg> 2400x1668 (group photo, (c) TU Wien, Moritz Christamentl)
- Image: <https://mcusercontent.com/a91a25f4c1fbc0c9896af9a20/images/ab00e70a-8d47-31d4-df88-e034b33d1062.jpg> 2048x1536 (newsletter photo)
- Image: <https://www.forzaeth.ch/blog/iros_24/cover.jpg> 4288x2848 (ForzaETH blog cover, 6 MB)
- Video: <https://www.youtube.com/watch?v=1gvmPCMo1rc>
- Facts:
  - 'Dzik Ultimate took the gold, dominating the leaderboard in both time-trials and head-to-head races. Their flawless runs with zero collisions and record-setting lap time (under 7 seconds) secured their victory. Scuderia Segfault earned silver ... ForzaETH took home the bronze ... SAGOL received a special award for the best first-timer': newsletter '21st F1tenth Autonomous Grand Prix Race Results from IROS 2024', 2024-10-21 (quoting Chinmay Samak), https://mailchi.mp/20e93a8ea541/f1tenth-summer-newsletter-6742752
  - TU Wien, '2nd place at RoboRacer Autonomous Grand Prix in Abu Dhabi', 2024-10-17: https://www.tuwien.at/inf/scuderia-segfault/news-detail/2nd-place-at-roboracer-autonomous-grand-prix-in-abu-dhabi/
  - ForzaETH: 'our team placed 2nd out of 6 teams in qualification, slotting behind Dzik Ultimate (6.6s)': https://www.forzaeth.ch/blog/iros_24/
  - Participants page lists 12 teams (Dzik Ultimate 'Independent', Lukasz and Monika Sztyber; SAGOL 'Independent'): iros2024-race.f1tenth.org/registration.html (Wayback 2024-12-09)
  - '21st F1TENTH Autonomous Racing Competition / Oct 14-18, 2024 / IROS 2024 / Abu Dhabi, UAE': old-site flyer (events_map.json)
- Notes: 12 registered, 6 in qualification. The dash inside the newsletter quote became parentheses (voice rule). The Dzik line goes back to Torino 2018.

#### Dong-A University's Hwakbul team wins the 3rd Korea Championship

`korea2024-third-korea-championship` · Oct 29-31, 2024 · result · event `korea2024` · confidence **medium**

> The third Korea Championship ran with ICCAS 2024 at Jeju Shinhwa World, with 37 teams and 169 participants. Dong-A University's Hwakbul team won, and Chungbuk National University's Tayo Eagles were runners-up.

- Link: <https://daily.hankooki.com/news/articleView.html?idxno=1144287>
- Image: <https://cdn.daily.hankooki.com/news/photo/202411/1144287_1360361_2027.jpg> 600x373 (press photo credited to Gyeongsang National University, small)
- Image: <https://f1tenth.github.io/race/3rd%20Korea%20F1tenth%20Race%20Flyer.png> 1414x2000 (event flyer graphic)
- Video: <https://www.youtube.com/watch?v=LD_JWum5L_I>
- Facts:
  - '대회에는 총 37개 팀, 169명이 참가 ... 최종 우승은 동아대학교의 확불팀 ... 충북대학교의 타요이글 팀이 준우승' (37 teams and 169 participants; winner Dong-A University's Hwakbul team; runner-up Chungbuk National University's Tayo Eagle team), held Oct 29-31 at Jeju Shinhwa World: Daily Hankooki, 2024-11-06, https://daily.hankooki.com/news/articleView.html?idxno=1144287
  - 'The 2024 3rd F1Tenth Korea Championship was held from October 28 to 30 at Jeju Shinhwa World, in conjunction with ... ICCAS 2024. The event featured 37 teams and 160 participants': AiX, YouTube, 2024-11-14, https://www.youtube.com/watch?v=LD_JWum5L_I
  - Flyer: 'The 3rd F1TENTH Korea Championship / Oct 29 - Nov 1, 2024 / ICCAS 2024 / Jeju Shinhwa World': old-site race page (events_map.json)
  - Organizers named in the 2024-08-12 newsletter: Cheolhyeon Kwon, Dong Sung Pae, Jin Hyun Kim, Kang Hee Kim, Joo Yong Sim: https://mailchi.mp/e7fc98406180/f1tenth-summer-newsletter-6741430
- Notes: DATES DIFFER: Oct 29-31 (press), Oct 28-30 (video), Oct 29-Nov 1 (flyer = conference). PARTICIPANTS DIFFER: 169 (press) vs 160 (video). 'Hwakbul' is our romanization of 확불; ask the team. Tayo Eagles were also second at IV 2024 and at the 2025 Korea Championship.

#### F1TENTH becomes RoboRacer

`migration-f1tenth-to-roboracer` · Nov 13, 2024 · milestone · event `None` · confidence **high**

> On November 13, 2024 the organizers announced that F1TENTH was moving to RoboRacer.ai. The community was ready, they wrote, to go beyond 1/10-scale cars, with new platform scales and harder competitions. By April 2025 the transition was complete.

- Link: <https://mailchi.mp/cf1734d5a686/f1tenth-summer-newsletter-6743291>
- Archive: <https://web.archive.org/web/20250130150109/https://roboracer.ai/>
- Image: <https://mcusercontent.com/a91a25f4c1fbc0c9896af9a20/images/007d865c-53de-fae0-e1ad-41db078965fa.png> 6912x3456 (newsletter header graphic)
- Facts:
  - 'Over the last 5 years, F1Tenth has enjoyed tremendous growth and community support. The organization has grown up and we are ready to go beyond just the 1/10th-scale vehicles for broader community-driven engagements. This includes new platform scales and more challenging competitions for a modern AI-enabled autonomy. ... Stay tuned as we migrate F1Tenth.org to RoboRacer.ai': newsletter 'Announcing F1tenth Autonomous Racing is Migrating to RoboRacer.ai', 2024-11-13, https://mailchi.mp/cf1734d5a686/f1tenth-summer-newsletter-6743291
  - Wayback: f1tenth.org answers 200 through 2024-10-02 and 302 to roboracer.ai from 2024-11-09; roboracer.ai is titled 'RoboRacer' from the 2025-01-30 capture: https://web.archive.org/web/20250130150109/https://roboracer.ai/
  - Old-site repo commits (private, gh api): 2025-01-25 'changed non-URL/functional instances of F1Tenth to RoboRacer'; 2025-02-03 'replace all non research instances of f1/10 & f1/tenth & f1tenth email with roboracer'
  - Newsletter 2025-04-21: 'Roboracer Autonomous Racing is fully transitioned': https://mailchi.mp/2c877d5672e9/f1tenth-summer-newsletter-6746426
  - IEEE IV 2025 call: 'the RoboRacer Autonomous Grand Prix (previously known as F1TENTH)': https://ieee-iv.org/2025/call-for-roboracer-teams/
  - GitHub org name today: 'RoboRacer (formerly F1Tenth) Autonomous Racing Community' (gh api orgs/f1tenth)
- Notes: The key milestone for the timeline. The newsletter's 'Over the last 5 years' does not match the 2016 start; the excerpt avoids it. The CDC 2024 race in December still ran as F1TENTH; ICRA 2025 (24th) was the first race named RoboRacer at the time.

#### Lehigh's Mountain Hawks win the 23rd competition at Boston University

`bu2024-lehigh-mountain-hawks-win` · Nov 22, 2024 · result · event `bu2024` · confidence **high**

> Boston University hosted the 23rd competition during its Learning to Trust Autonomy workshop on November 22, 2024. Teams from BU, Lehigh, Penn and MIT raced. Lehigh's Mountain Hawks won, ahead of BU's F1TenthBU Acro and Penn's xLAB team.

- Link: <https://www.bu.edu/cise/cise-hosts-learning-to-trust-autonomy-workshop-to-foster-collaboration-in-autonomous-systems>
- Archive: <https://web.archive.org/web/20250623043629/http://bu2024-race.f1tenth.org/>
- Image: <https://www.bu.edu/cise/files/2024/12/Screenshot-2024-12-06-at-2.39.26%E2%80%AFPM.png> 2724x1806 (BU CISE news image (a screenshot))
- Image: <https://f1tenth.github.io/race/23rd%20F1tenth%20Race%20Website%20Banner%20-%20Boston%20U%20-%20QR.png> 1200x500 (event banner graphic)
- Facts:
  - 'Teams from Boston University, Lehigh University, University of Pennsylvania, and Massachusetts Institute of Technology built autonomous race cars ... The standings for the F1TENTH Autonomous Grand Prix were: 1st Place: Lehigh University, The Mountain Hawks 2nd Place: Boston University, F1TenthBU Acro 3rd Place: University of Pennsylvania, XLab': BU CISE news, https://www.bu.edu/cise/cise-hosts-learning-to-trust-autonomy-workshop-to-foster-collaboration-in-autonomous-systems
  - 'Announcing the 23rd F1tenth Autonomous Racing Competition! ... Boston University is hosting the Competition on Nov 22, 2024': newsletter, 2024-09-24, https://mailchi.mp/f826ff366817/f1tenth-summer-newsletter-6742133
  - 'BU F1TENTH Autonomous Grand Prix / November 22nd, 2024 / Location: Boston University': bu2024-race.f1tenth.org (events_map.json)
- Notes: The source spells Penn's team 'XLab'; site style is xLAB. NUMBERING: the 23rd (Nov 22) ran before the 22nd (CDC, Dec 16-19). The BU post has no date on the page (images uploaded Dec 2024). Neobotics' founders are BU people (docs/CONTENT.md spinoffs question); this race may be part of that story.

#### VAUL wins the 2nd Sim Racing League

`cdc2024-second-sim-racing-league` · Dec 9, 2024 · result · event `cdc2024` · confidence **high**

> The second Sim Racing League, run for CDC 2024, drew 51 teams and more than 170 people. Twenty qualified, and Université Laval's VAUL won ahead of Baby Driver and the first league's winner, TURTLEBOT. The winners were celebrated at the conference in Milan on December 16.

- Link: <https://autodrive-ecosystem.github.io/competitions/roboracer-sim-racing-cdc-2024/>
- Image: <https://autodrive-ecosystem.github.io/assets/images/banners/RoboRacer%20Sim%20Racing%20%40%20CDC%202024.png> 4400x1467 (league banner graphic)
- Video: <https://www.youtube.com/watch?v=Q-WTcTOld08>, <https://www.youtube.com/watch?v=HtmRKE3Jres>
- Facts:
  - Results 1 VAUL 103.84 s, 2 Baby Driver 136.63 s, 3 TURTLEBOT 145.99 s; final Dec 7-8, results Dec 9, 2024; 'celebration event of the 2nd RoboRacer Sim Racing League @ CDC 2024 on Monday (Dec 16, 2024)': https://autodrive-ecosystem.github.io/competitions/roboracer-sim-racing-cdc-2024/
  - '2nd F1TENTH Sim Racing League ... CDC 2024 ... a total of 51 teams (170+ participants)': AutoDRIVE Ecosystem, YouTube, 2024-12-29, https://www.youtube.com/watch?v=Q-WTcTOld08
- Notes: Baby Driver is Mason Notz (USA) per the table. The four league editions could be merged into one 'Sim Racing League' story.

#### Scuderia Segfault wins the 22nd Grand Prix at CDC 2024 in Milan

`cdc2024-milan-scuderia-segfault-wins` · Dec 16-19, 2024 · result · event `cdc2024` · confidence **high**

> TU Wien's Scuderia Segfault won the 22nd Grand Prix at the Conference on Decision and Control in Milan. It set the best time trial, 42 laps with a best lap of 7.126 seconds, then beat HiPeRT UNIMORE Racing in a best-of-three final. UniBo Motorsport beat ForzaETH for third.

- Link: <https://www.tuwien.at/inf/scuderia-segfault/news-detail/victory-at-roboracer-autonomous-grand-prix-in-milano/>
- Archive: <https://web.archive.org/web/20250714000527/http://cdc2024-race.f1tenth.org/>
- Image: <https://www.tuwien.at/inf/scuderia-segfault/wp-content/uploads/2024/12/img-20241219-175706-cut.jpg> 2400x1808 (header photo credited (c) CDC2024 event team)
- Image: <https://www.forzaeth.ch/blog/cdc_24/cover2.jpeg> 1272x1106 (ForzaETH blog cover)
- Facts:
  - 'Team Scuderia Segfault from TU Wien delivers incredible performance and wins the 22nd RoboRacer Autonomous Grand Prix, held from December 16th to 19th ... The finale against HiPeRT UNIMORE Racing was executed as a best-of-three race, resulting in an ultimate win for Scuderia Segfault.'; best time trial 7.126 s, 42 laps: TU Wien, 2024-12-19, https://www.tuwien.at/inf/scuderia-segfault/news-detail/victory-at-roboracer-autonomous-grand-prix-in-milano/
  - 'In a hard-fought final against UniBo Motorsport, we narrowly missed the podium, ultimately securing a respectable fourth place.': ForzaETH, 2024-12-20, https://www.forzaeth.ch/blog/cdc_24/
  - CDC 2024 conference page calls it 'The 22nd F1tenth Autonomous Grand Prix'; race site: '22nd F1TENTH Autonomous Grand Prix / December 16th - 19th 2024 / Allianz MiCo, Milan' (events_map.json)
  - LAMARRacing's first race was CDC Milan 2024 (Lukas Kutsch's LinkedIn post, already on /news)
- Notes: Third place (UniBo Motorsport) follows from ForzaETH's 'final ... fourth place'. Team count not found. TU Wien's 'RoboRacer' wording may be a later edit; at the time the race was F1TENTH.

### 2025

#### RoboRacer becomes a regular event at IEEE Intelligent Vehicles

`iv2025-regular-event-announced` · Apr 2025 · announcement · event `iv2025` · confidence **medium**

> IEEE IV announced that the RoboRacer Autonomous Grand Prix would become a regular event at the symposium, starting with IV 2025 in Cluj-Napoca, Romania.

- Link: <https://ieee-iv.org/2025/call-for-roboracer-teams/>
- Facts:
  - 'We are thrilled to announce that the RoboRacer Autonomous Grand Prix (previously known as F1TENTH) is becoming a regular event at the IEEE Intelligent Vehicles Symposium, beginning with IV 2025, taking place June 22-25, 2025, in Cluj-Napoca, Romania!': https://ieee-iv.org/2025/call-for-roboracer-teams/
- Notes: No page date in its metadata; the flyer was uploaded 2025/04. Better folded into the IV 2025 result. The flyer image (IEEE-IV-2025-RoboRacer-Flyer.jpg) was not measured.

#### 58 teams from 24 countries in the 3rd Sim Racing League

`icra2025-third-sim-racing-league` · May 14, 2025 · result · event `icra2025` · confidence **high**

> The third Sim Racing League, run for ICRA 2025, registered 58 teams with about 150 people from 32 organizations in 24 countries. Twenty-one qualified. VAUL won again, ahead of Autoware Aces and Kanka from the University of Minnesota.

- Link: <https://autodrive-ecosystem.github.io/competitions/roboracer-sim-racing-icra-2025/>
- Image: <https://autodrive-ecosystem.github.io/assets/images/banners/RoboRacer%20Sim%20Racing%20%40%20ICRA%202025.png> 4400x1467 (league banner graphic)
- Video: <https://www.youtube.com/watch?v=oObgg_MCU4U>
- Facts:
  - '58 teams (150 participants) from all over the world (32 organizations, 24 countries) have officially registered for the 3rd RoboRacer Sim Racing League at ICRA 2025!': newsletter, 2025-04-21, https://mailchi.mp/2c877d5672e9/f1tenth-summer-newsletter-6746426
  - Results 1 VAUL 111.46 s, 2 Autoware Aces 122.16 s, 3 Kanka 129.28 s; final May 11-13, results May 14, 2025: https://autodrive-ecosystem.github.io/competitions/roboracer-sim-racing-icra-2025/
- Notes: COUNTRY COUNT DIFFERS: 24 (newsletter) vs 25 (Autoware blog, 2025-07-21).

#### UniBo Motorsport wins the 24th competition at ICRA 2025 in Atlanta

`icra2025-atlanta-unibo-motorsport-wins` · May 19-23, 2025 · result · event `icra2025` · confidence **high**

> The 24th competition, the first under the RoboRacer name, ran at ICRA 2025 in Atlanta with 25 teams. UniBo Motorsport from the University of Bologna won, UNICORN from UNIST in Korea came second and ETH Zurich's ForzaETH third. TU Wien's Scuderia Segfault had the most reliable time-trial run, 30 laps without a crash.

- Link: <https://www.forzaeth.ch/blog/icra_25/>
- Archive: <https://web.archive.org/web/20260313000800/https://icra2025-race.roboracer.ai/>
- Image: <https://www.tuwien.at/inf/scuderia-segfault/wp-content/uploads/2025/06/group-picture-icra2025.jpg> 2112x1433 (group photo from TU Wien)
- Image: <https://www.forzaeth.ch/blog/icra_25/cover.png> 2048x1536 (ForzaETH blog cover, 5.7 MB)
- Video: <https://www.youtube.com/watch?v=wPHYLAnpMOU>, <https://www.youtube.com/watch?v=Ukox0IPqGNA>
- Facts:
  - 'This week, ForzaETH secured 3rd place at the Roboracer Competition at ICRA25 in Atlanta USA! ... UniBo Motorsport, UNICORN, ForzaETH' (podium in medal order): ForzaETH, 2025-05-22, https://www.forzaeth.ch/blog/icra_25/
  - 'Out of 25 teams, Scuderia Segfault was able to deliver the most reliable run at the time-trials ... The last race was against UNICORN from Ulsan National Institute of Science & Technology (UNIST), which resulted in the overall fourth place': TU Wien, 2025-05-23, https://www.tuwien.at/inf/scuderia-segfault/
  - '2025 ICRA Roboracer World Championship (ICRA, Atlanta) - Team Unicorn 2nd Place': Unicorn Racing, YouTube, uploaded 2026-01-31, https://www.youtube.com/watch?v=Ukox0IPqGNA
  - 'The RoboRacer Foundation hosted their 24th racing compeition at the ICRA2025': The Robotics Club, YouTube, 2025-05-30, https://www.youtube.com/watch?v=wPHYLAnpMOU
  - '24th Roboracer Autonomous Racing Competition / May 19th - 23rd 2025 / Location: Georgia World Congress Center, Atlanta': icra2025-race.roboracer.ai (events_map.json)
  - Participants page: 26 teams (UNICORN = Ulsan National Institute of Science & Technology; Unibo Motorsport = University of Bologna): harvested repo icra2025_race registration.html (Wayback 2025-08-07)
- Notes: TEAM COUNTS DIFFER: 25 (TU Wien), 26 listed (participants page), 19 rows in registrants_table.html, '20 teams with 70 participants' (pre-race newsletter 2025-05-12). 'First under the RoboRacer name' is our inference from the rename timeline. UNICORN here is UNIST's team (see contradictions: the content skill says Bonn).

#### ForzaETH wins the 25th competition at IEEE IV 2025 in Cluj-Napoca

`iv2025-cluj-forzaeth-wins` · Jun 22-23, 2025 · result · event `iv2025` · confidence **high**

> Eight teams entered the 25th competition at the UTCN HUB in Cluj-Napoca, the first as a regular event at IEEE Intelligent Vehicles. ForzaETH from ETH Zurich won. SZEnergy from Széchenyi István University in Győr came second and MechaByte from the German International University third.

- Link: <https://www.forzaeth.ch/blog/iv_25/>
- Archive: <https://web.archive.org/web/20260121200545/http://iv2025-race.roboracer.ai/>
- Image: <https://www.forzaeth.ch/blog/iv_25/group.jpg> 1920x1440 (ForzaETH blog group photo)
- Facts:
  - 'Of the eight teams having entered the competition, the FORZAETH team from ETH Zurich in Switzerland ranked first ... Second place went to the SZEnergy team from Szechenyi Istvan University of Gyor in Hungary, and third place went to the MechaByte team from German International University, Germany.': Stiripesurse (Agerpres), 2025-06-24, https://www.stiripesurse.ro/most-advanced-technologies-for-autonomous-vehicles-at-international-roboracer-autonomous-racing-competition-in-cluj_3732112.html
  - 'we secured the first place': ForzaETH blog, 2025-07-22, https://www.forzaeth.ch/blog/iv_25/
  - '25th Roboracer Autonomous Racing Competition / June 22nd - 23rd 2025 / Location: UTCN HUB, Cluj-Napoca, Romania': iv2025-race.roboracer.ai (events_map.json)
- Notes: The Stiripesurse og:image is a stock 2024 image; do not use it. The '25th' collides with CDC 2025's own '25th' label. Confirm German International University's location before adding a country.

#### The race rules move to one public, versioned rulebook

`roboracer-rules-repo-2025` · Oct 13, 2025 · milestone · event `None` · confidence **medium**

> The official RoboRacer rules now live in a public GitHub repository, standardized and updated for every competition. Teams can read the same ruleset, and every change to it, before any race.

- Link: <https://github.com/f1tenth/roboracer_rules>
- Facts:
  - Repo description: 'Official ruleset for roboracer competitions, standardized and updated every competition.', created 2025-10-13: https://github.com/f1tenth/roboracer_rules (gh api)
- Notes: The date is the repo's creation date, not an announcement. Check the first competition that used it before publishing a date.

#### UNIST wins the 4th Korea Championship at ICCAS 2025

`iccas2025-fourth-korea-championship-unist-wins` · Nov 4-7, 2025 · result · event `iccas2025` · confidence **medium**

> The fourth Korea Championship ran with ICCAS 2025 at Songdo ConvensiA in Incheon, with the head-to-head tournament and awards on November 6. A UNIST team took first prize, and Chungbuk National University's Tayo Eagles were second.

- Link: <https://faculty.unist.ac.kr/hmc/gallery-59/>
- Image: <http://faculty.unist.ac.kr/hmc/wp-content/uploads/sites/423/2025/11/Banquet.jpg> 1600x901 (UNIST lab gallery photo)
- Video: <https://www.youtube.com/watch?v=6zJHxksklwE>, <https://www.youtube.com/watch?v=tnn4isfdUCE>
- Facts:
  - 'We won 1st prize at the F1-Tenth Korea Championship 2025 in Songdo, Incheon!': UNIST High-assurance Mobility Control Lab, gallery 'November 2025', https://faculty.unist.ac.kr/hmc/gallery-59/
  - '2025 The 4th F1tenth Korea Championship (now called as Roboracer) ... With active use in over 89 universities worldwide ... Nov 6 (Thursday): Head-to-head tournament and award ceremony': ICCAS 2025, https://2025.iccas.org/?page_id=5104
  - '2025 The 4th RoboRacer Korea Championship Tayo Eagles highlight (Second place)': YouTube, 2025-11-10, https://www.youtube.com/watch?v=6zJHxksklwE
  - 'November 4 (Tue)~7 (Fri), 2025, Songdo ConvensiA, Incheon, Korea': https://2025.iccas.org/ (events_map.json)
- Notes: The UNIST team is UNICORN only by photo file names ('UNICORN_vs_...'); the excerpt says 'a UNIST team'. Tayo Eagles' second place rests on a video title. Team count not found. ICCAS's '89 universities' is a dated scale figure next to the site's '90+'.

#### CDC 2025 goes virtual, and VAUL wins the 4th Sim Racing League

`cdc2025-race-cancelled-fourth-sim-league` · Dec 8, 2025 · result · event `cdc2025` · confidence **high**

> The in-person race planned for CDC 2025 in Rio de Janeiro was cancelled for low registrations, and entrants moved to the virtual race. The 4th Sim Racing League, shared by CDC 2025 and Techfest 2025, drew 40 teams. VAUL won for the third league in a row, ahead of Mamba and TU Dortmund's Phoenix Racing.

- Link: <https://autodrive-ecosystem.github.io/competitions/roboracer-sim-racing-cdc-tf-2025/>
- Archive: <https://web.archive.org/web/20260305115547/https://cdc2025-race.roboracer.ai/>
- Image: <https://autodrive-ecosystem.github.io/assets/images/banners/RoboRacer%20Sim%20Racing%20%40%20CDC%20Techfest%202025.png> 4400x1467 (league banner graphic)
- Video: <https://www.youtube.com/watch?v=7Y2jeoHyvWA>
- Facts:
  - 'Due to the low number of registrations, the Roboracer event will unfortunately not be held at CDC 2025. All interested people are encouraged to enroll in the Virtual Race.': https://cdc2025.ieeecss.org/events/competitions (read 2026-09-25; notice date unknown)
  - Results 1 VAUL - Old but Gold 78.19 s, 2 Mamba 87.82 s, 3 Phoenix Racing 99.33 s; final Dec 6-7, results Dec 8, 2025: https://autodrive-ecosystem.github.io/competitions/roboracer-sim-racing-cdc-tf-2025/
  - '4th RoboRacer Sim Racing League ... CDC 2025 and the 2025 IIT Bombay Techfest (TF 2025) ... a total of 40 teams (160+ participants)': AutoDRIVE Ecosystem, YouTube, 2026-02-01, https://www.youtube.com/watch?v=7Y2jeoHyvWA
- Notes: 'Third in a row' is our count from the three result tables (CDC 2024, ICRA 2025, CDC-TF 2025). Mamba is Hariharan Ravichandran (USA). events_map.json keeps cdc2025 as 'virtual' with a TODO to confirm the cancellation; this source confirms it. There was no IROS 2025 race or league.

#### Techfest at IIT Bombay hosts its first international RoboRacer competition

`techfest2025-iit-bombay-first-roboracer` · Dec 22-24, 2025 · announcement · event `techfest2025` · confidence **low**

> Techfest, IIT Bombay's technology festival, hosted its first International RoboRacer Autonomous Racing Competition in December 2025, with the RoboRacer Foundation. It counts as the 26th competition.

- Link: <https://techbullion.com/speed-meets-innovation-at-techfest-iit-bombay-three-international-racing-championships-take-center-stage/>
- Facts:
  - 'For the first time ever, Techfest, IIT Bombay hosts the International RoboRacer Autonomous Racing Competition in collaboration with the RoboRacer Foundation.': TechBullion, 2025-12-26 (preview piece)
  - 'The teams participating in the 25th and 26th RoboRacer Autonomous Racing Competitions at CDC 2025 and Techfest 2025': https://autodrive-ecosystem.github.io/competitions/roboracer-sim-racing-cdc-tf-2025/
- Notes: No results found: techfest.org is a JavaScript app with no readable text and no Wayback capture. Dates Dec 22-24 come from a search result only. Publish only with a result from Cedric or the Techfest team.

## Contradictions and flags

1. **Numbering of the 11th and 12th (2023).** The CPS-IoT 2023 race site and Penn Engineering (2023-06-16) call San Antonio the 12th; the ICRA 2023 race site, TUM (2023-03-30) and TU Wien (2023-06-02) call London the 11th. `events_map.json` swaps them (Cedric, 2026-08-23: San Antonio ran May 8-9, London May 29-31, so San Antonio is the 11th). Every source written at the time disagrees with the map. The two candidates carry no ordinal in their titles until Cedric decides.
2. **ITSC 2024 (the 20th in `events_map.json`) may not have run.** No result exists anywhere; the race repo stops at 2024-07-09; the old race-page banner that went up on 2024-09-30 (during ITSC) lists eight 2024 races without ITSC, replacing it with BU; the October 2024 newsletters go from Smart Mobility straight to IROS. No candidate was written for it. Ask Cedric/Rahul; if it did not run, 'held' and the ordinal both need a look.
3. **The 23rd before the 22nd.** BU (the 23rd, announced as such in the 2024-09-24 newsletter) ran on Nov 22, 2024; CDC Milan (the 22nd) on Dec 16-19. Ordinals were assigned when races were announced, not in date order.
4. **Two '25th' competitions.** IV 2025 and the CDC 2025 site both say 25th; AutoDRIVE says CDC 2025 = 25th and Techfest 2025 = 26th. The CDC 2025 race was cancelled (conference page), so IV 2025 is the 25th that ran. No source names a 6th or a 16th race (the Spring 2024 Penn race has no ordinal anywhere; neither do the ICRA 2024 MAD-Games or the Germany, ESWeek and Korea races).
5. **The first race's dates.** Behl's recap: October 1-2, 2016, at Wean Hall on the CMU campus; `race.html` and `events_map.json`: Oct 2-7 (the ESWeek conference week). Similar for Porto (race Apr 10-11 vs week Apr 10-13), Torino (race Oct 1 vs week Sep 30-Oct 5), Montreal (Apr 15-16 vs Apr 15-18).
6. **Team counts.** Porto 2018: 7 ranked on the old page, 7 qualified per CTU, 8 per Behl. Torino 2018: 8 listed vs 9 per Behl. ICRA 2024: 18 in time trials (ForzaETH) vs 'over 20' (TU Wien). ICRA 2025: 25 (TU Wien), 26 listed, 19 in the registrants table, 20 in the pre-race newsletter. Korea 2024: 169 (press) vs 160 (video) participants, Oct 29-31 vs Oct 28-30. Sim league ICRA 2025: 24 vs 25 countries.
7. **When it started.** The content skill and the archived about page say founded at Penn in 2016, and the course trailer dates the first course to March 2016. Penn Engineering's 2019 story says Houssam Abbas was a core developer of the project 'in 2015' and co-taught the pilot course then; the Indy Autonomous Challenge channel says UVA's team has raced 'since 2015'. The newsletter of 2024-11-13 says 'over the last 5 years' and the one of 2024-05-16 'over the past six years'. Keep 2016 unless Rahul says otherwise.
8. **IFAC 2020 date.** The race page says July 15-16, 2020; Clemson's team video says the online race was in August 2020.
9. **UNICORN is UNIST, not Bonn.** The ICRA 2025 participants page, TU Wien (2025) and xLAB's ICRA 2026 clip all place UNICORN / UNICORN_Racing at the Ulsan National Institute of Science and Technology, Korea. The content skill's seed list says 'Team Unicorn (University of Bonn)'. The Bonn team is LAMARRacing. (teams.json and /news already say UNICORN; only the skill's line is off.)
10. **'RoboRacer' on pre-2025 pages is often a later edit.** The old site was rewritten F1TENTH -> RoboRacer on 2025-01-25 (its news excerpts, race pages and the 'RoboRacer Columbia 2019' style labels), the IV 2024 race site on 2025-10-31, and the AutoDRIVE league pages since. Sources from the time say F1TENTH or F1/10. Candidate titles use no brand for pre-2025 races; if one is needed, 'F1TENTH (now RoboRacer)'.
11. **The foundation.** The site footer changed from 'Copyright 2019 PRECISE' to '2020 F1TENTH Foundation' in May 2020; LinkedIn says 'Founded 2020' but also that the RoboRacer Foundation 'will be' a 501(c)(3). No public record of incorporation was found.
12. **Scale figures over time.** Sep 2020: 'over 60 universities, 7 international autonomous racing competitions'; May 2024: '60 universities'; Nov 2025 (ICCAS): 'over 89 universities'; the site today: '90+'. Consistent in direction, but the 2024 figure is lower than the 2020 one.
13. **ICRA 2022 third place.** The bracket had no third-place match; TU Wien says Scuderia Segfault finished 3rd (the other semi-finalist was Forza PBL).
14. **Small slips in sources** (do not repeat): UNC puts the University of Modena in Spain; TU Wien calls IFAC 2020 the 8th and dates Philadelphia to 2023; the ICRA 2023 workshop site says '3nd'; the IROS 2023 results page is titled 'F1TENTH ICRA 2023'; the xLAB MAD-Games video from 2023 is titled 'IROS'24'.

## Gaps

Events in `events_map.json` with no result found (winner unknown):

- **6th competition (2019-2020)**: never named in any source; the numbering jumps from Columbia 2019 (5th) to IFAC 2020 (7th).
- **Germany 2022, Lausitzring (Aug 20-21, TUM)**: only the old race-page banner; `germany-race2022.f1tenth.org` never had a repo; no TUM news found.
- **ESWeek 2022, Shanghai (Oct 10-12)**: results were two Challonge widgets (time trial `nvcuqksv`, head-to-head `21927d68`) with no Wayback capture; a person opening challonge.com in a browser could read them in a minute.
- **1st and 2nd Korea Championships (Dec 2022 Jeju, Oct 2023 Yeosu)**: dates, venues and 2023 counts (31 registered, 29 raced) only; no winner.
- **IV 2023, Anchorage (Jun 4-7)**: 8 teams on the participants page; no result anywhere (results.html is the ICRA 2022 template).
- **ITSC 2024, Edmonton**: see contradiction 2; possibly not held.
- **ICRA 2024 second place**: Dzik Team won the other semi-final, but no source states the final; the candidate names no runner-up.
- **Techfest 2025, IIT Bombay (the 26th)**: only a preview article; techfest.org is a JavaScript app with no readable results and no capture.
- **Podium places 2-3** missing for Pittsburgh 2016 (single winner published), Torino 2018, Montreal 2019, ICRA 2023 (third), CPS-IoT 2023 (third; bracket semi-finalists KU-CSL and Carnegie Autonomous Racing), IROS 2023 (third).
- **Team counts** missing for SM 2024, CDC 2024, ICCAS 2025.
- **ICRA 2021 workshop** and the **ICRA 2025 MAD-Games** (3rd edition): no evidence it ran.
- **Photos 2020-2023**: virtual races have none; the race sites only ever carried template images (docs/media/RACE_PHOTOS.web.md). Team and university posts (TU Wien, ETH, Lehigh, NC State, InDro) have photos, all third-party.

## Dead ends

- **Challonge** answers 403 to curl and to WebFetch; only Wayback captures of the `/module` pages work (bracket JSON in `window._initialStoreState['TournamentStore']`). ESWeek 2022's two brackets were never captured.
- **Race-site results pages 2023-2025** were never filled in: `results.html` on ICRA 2023, ICRA 2024, SM 2024, ITSC 2024, IROS 2024, Korea 2024, BU 2024, CDC 2024, ICRA 2025, IV 2025 and CDC 2025 is the template, often still embedding ICRA 2022's or IV 2024's bracket. The registration pages are also copied between sites (IV 2024's list sits on ITSC, Korea, BU and CDC); only IROS 2021, ICRA 2022, IV 2023, IV 2024, IROS 2024 and ICRA 2025 lists are usable.
- **f1tenth.org before 2020** is not in the harvested repo (its GitHub history starts 2020-03-09); Wayback captures from 2016-05-03 exist but were not mined page by page for this pass (the 2016-2021 press slice was cut short by the laptop reboot).
- **YouTube**: @f1tenth and @Roboracer have no public videos; Twitch roboracer_ai keeps no saved streams (2023-2026 race streams there are gone); the IFAC 2020 Vimeo videos need a login.
- **Dead press links**: cs.unc.edu (404, Wayback 2021-07-23), m.futurecar.com (522, Wayback 2023-09-27), the Stitcher podcast link (the episode is on libsyn), endeavors.unc.edu (already handled on /news). Medium blocks scripts (403) but works in a browser; Wayback copies exist.
- **No IEEE Spectrum coverage** of F1TENTH/RoboRacer was found for any year.
- **1,000 publications**: no dated public source states it; only the Scholar query the content skill cites. arXiv 2506.15899 (June 2025, a survey of the platform) gives no count. No candidate written.
- **Techfest** (JS app), **f1tenthkorea.com** (does not resolve), **icra2024-race / iros2024-race / korea-race24** domains (NXDOMAIN; Wayback captures used).
- **Penn Today** (`penntoday.upenn.edu/news/penn-engineering-racing-cars-f1tenth`) answers 403 to scripts; not read. Worth a browser look: it may cover a Penn race.
