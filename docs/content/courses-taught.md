# Where the RoboRacer course is taught, and the clubs around the car

Research for the "Taught on campus" section of `/learn/courses` (Cedric,
2026-10-20: "Taught on campus is missing universities ... there are so many
clubs and courses, way more"). Branch `content/courses-taught`, 2026-10-20.
Nothing here is published. Penn is the only offering on the site today; every
other row is a candidate for Cedric to approve. Machine-readable candidates:
`docs/content/courses-taught.candidates.json` (shaped like the `offerings` in
`public/data/courses.json`, plus `programs` and `clubs`).

## At a glance

- **70 university course rows** at 63 institutions in 18 countries:
  **34 confirmed** (32 institutions, 11 countries), 23 likely, 13 weak.
  Of the confirmed rows, 10 teach the full coursekit, 9 are courses
  built on the car, and 14 use it as a lab, project or capstone.
- **12 programs, camps and events** (Korea's LINC 3.0 joint education
  program and RoboRacer Korea, a pre-college camp, short courses), kept out of the course count.
- **78 clubs and student teams** at 75 institutions in 23 countries:
  49 confirmed, 19 likely, 10 weak. By kind: 33 clubs,
  32 lab teams, 7 course teams, 6 where no page says which.
- **Teams DB cross-check:** 95 teams in `docs/content/teams.sheet.json`
  attended at least one competition (2024 to 2026); 26 of them match a
  club row above, and the other 69 are listed in the appendix.
- **First-party totals worth knowing** (not yet site facts): the Safety21 /
  USDOT final report by Rahul Mangharam (2024-10-29) says "32 University
  Courses taught worldwide" and "89+ Universities worldwide have adopted
  F1Tenth for research, teaching and competing"; the old f1tenth.org homepage,
  still served at https://f1tenth.github.io/, says "Over 90 universities,
  including the University of Pennsylvania, UC San Diego, Clemson University,
  and more, use these resources".

### The TUM and UC San Diego question

Both cards in the LMS mock trace back to **2021 course runs on the old F1TENTH
Open edX platform** (`courses.f1tenth.org`, offline now, recovered from the
Wayback Machine): "F1Tenth - TUM" (15 weeks, staff Markus Lienkamp and Florian
Sauerbeck) and "F1Tenth - UC San Diego" (10 weeks, staff Jack Silberman, 10
hours a week). The mock's "Tesla or Google" paragraph is that platform's
course description. The same platform held runs for 14 other universities
(see the rows citing `web.archive.org/.../courses.f1tenth.org`). A run proves
the course was set up for that school, not that it was taught, so those rows
are "likely" unless another source confirms them.

- **TUM: confirmed.** The Professorship of Autonomous Vehicle Systems teaches
  "F1TENTH: Autonomous Driving Hands-on" (number 0000001440, Johannes Betz and
  Felix Jahncke) every winter semester since 2023/24.
- **UC San Diego: not confirmed as a course.** Only RoboRacer's own pages and
  the 2021 platform run name it. ECE/MAE 148 runs UCSD's own car stack; the
  Triton AI student club does run F1TENTH (clubs table). Keep it `verify`, or
  show Triton AI as a club instead.

## Confidence levels

- **confirmed**: a first-party page that was fetched and that ties the course
  to F1TENTH / F1/10 / RoboRacer: a university catalog, course site or
  syllabus, a department or university news story, the instructor's own page
  or public post, the course's own GitHub organization, or a paper written by
  the instructors that says they taught it.
- **likely**: specific but second-hand: a student repo or post naming the
  course and the university, a press story, or a course run on the 2021
  F1TENTH platform with a named instructor.
- **weak**: indirect: a fork by a faculty member, a list of adopters, a search
  snippet, an inference.
- **Kind**: full coursekit (teaches the F1TENTH / RoboRacer course), adapted
  (the school's own course built on the car, labs or simulator), lab or module
  (one lab, project or capstone inside another course), program (camps,
  bootcamps, events).

## (a) University courses

Ordered by confidence, then institution. Evidence shows up to three links; the
candidates JSON has every source with a one-line quote.

| # | Institution | Country | Course | Instructor(s) | Terms or years seen | Kind | Evidence | Confidence | Notes |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Binghamton University (State University of New York) | United States | ECD 507 "ML Based Autonomous Race Car (engineering design project)" | Douglas Summerville (faculty advisor) | 2024-2025, Spring 2025 | lab or module | [github.com](https://github.com/Binghamton-University-Roboracer/ECD507-F1Tenth-System) [github.com](https://github.com/Binghamton-University-Roboracer) | confirmed | ECD 507 looks like a Watson College engineering-design (capstone) project number, not a lecture course; no university page found. |
| 2 | Carnegie Mellon University | United States | 16-663 "F1Tenth Autonomous Racing" | John Dolan | Fall 2023, Spring 2024, spring 2024, Spring 2025, Spring 2026 | full coursekit | [ri.cmu.edu](https://www.ri.cmu.edu/education/academic-programs/master-of-science-computer-vision/curriculum/) [github.com](https://github.com/f1tenth-cmu/course-resources) [ppms.cit.cmu.edu](https://ppms.cit.cmu.edu/projects/detail/608) | confirmed | Uses the Penn coursekit labs. |
| 3 | Clemson University | United States | AuE 8360 "Scaled Autonomous Vehicle" | Venkat Krovi | 2017, 2021 (course run 2021_01 on courses.f1tenth.org), by 2022, Fall 2023 | adapted | [github.com](https://github.com/TongshenH/F1tenth) [arxiv.org](https://arxiv.org/pdf/2209.11181) [web.engr.oregonstate.edu](https://web.engr.oregonstate.edu/~abbasho/) | confirmed | Krovi taught the course (instructors' paper, confirmed); the code AuE 8360 comes from one student repo (likely). Clemson taught the F1/10 material from 2017 (platform paper) and Krovi taught 'the course' (Betz et al.). AuE 8360 code and Fall 2023 term only ... |
| 4 | Duke University | United States | "MEMS Experiment Design and Research Methods (master's capstone), F1Tenth project" | George Delagrammatikas | Fall 2023, Spring 2024 | lab or module | [sites.duke.edu](https://sites.duke.edu/memscapstone/2023-fall-f1tenth/) [github.com](https://github.com/qh65/F1-Tenth-Duke) | confirmed | Project inside a MEMS master's capstone course; course number not on the page. Spring 2024 continuation stated as a plan. |
| 5 | ETH Zürich | Switzerland | 227-0085-58L "P&S: Autonomous Cars and Robots (Projekte & Seminare)" | M. Magno | Autumn 2022, Autumn 2023, Autumn 2024, Autumn 2025, Spring 2026, Autumn 2026 | adapted | [vvz.ethz.ch](https://www.vvz.ethz.ch/Vorlesungsverzeichnis/lerneinheit.view?lerneinheitId=192809&semkez=2025W&ansicht=ALLE&lang=en) [vvz.ethz.ch](https://www.vvz.ethz.ch/Vorlesungsverzeichnis/sucheLehrangebot.view?lang=en&search=on&semkez=2023W&katalogdaten=F1TENTH) [vvz.ethz.ch](https://www.vvz.ethz.ch/Vorlesungsverzeichnis/sucheLehrangebot.view?lang=en&search=on&semkez=2022W&lerneinheitscode=227-0085-58L) | confirmed | D-ITET 'Projects & Seminars' lab for bachelor students, run by the Center for Project-Based Learning (Michele Magno, listed as 'M. Magno'), the home of ForzaETH. F1TENTH content checked for 2023W-2026S; for 2022W only the title was checked. |
| 6 | FAMU-FSU College of Engineering (Florida A&M University and Florida State University) | United States | "Mechanical Engineering Senior Design, Team 503 'Formula 1/10th Vehicle'" | - | 2023-24 | lab or module | [web1.eng.famu.fsu.edu](https://web1.eng.famu.fsu.edu/me/senior_design/2024/team503/) | confirmed | Single senior-design project; site has an incomplete TLS chain (fetched with -k). |
| 7 | Friedrich-Alexander-Universität Erlangen-Nürnberg | Germany | "Autonomy Technology Team Project: Getting Started: Roboracer" | Lars Ullrich, Philipp Hartmann | Winter 2025/26 (student repo), 2025, 2025 (announced March 2025) | lab or module | [ac.tf.fau.eu](https://www.ac.tf.fau.eu/files/2025/03/AuT_Team_Project_Roboracer.pdf) [github.com](https://github.com/farhadvaseghi/RoboRacer-Shiran) [ac.tf.fau.eu](https://ac.tf.fau.eu/files/2025/03/AuT_Team_Project_Roboracer.pdf) | confirmed | Team project inside the M.Sc. Autonomy Technology; listed names are contacts on the announcement, not necessarily formal instructors. / M.Sc. Autonomy Technology; student repo farhadvaseghi/RoboRacer-Shiran shows the result. |
| 8 | Georgia Institute of Technology | United States | VIP (CRN 85476) "Autonomous Racing and Self-Driving (Vertically Integrated Projects)" | Panagiotis Tsiotras | Fall 2026 | adapted | [syllabus.gatech.edu](https://syllabus.gatech.edu/sites/default/files/2026-04/Fall-2026-85476-Tsiotras-2601-VVB_3.pdf) [github.com](https://github.com/AlexBailey11/Autonomous-Racing-VIP) | confirmed | Multi-semester VIP course (VIP numbers vary by level; file name suggests 2601 section VVB). Earlier terms likely (repo Mar 2026 = Spring 2026) but not documented. |
| 9 | KTH Royal Institute of Technology | Sweden | "Automatic Control Project Course" | - | 2017 | lab or module | [kth.se](https://www.kth.se/dcs/research/control-of-transport/smart-mobility-lab/projects/ac-project-course/2017-f1tenth-trajectory-following-1.705189) [kth.se](https://www.kth.se/dcs/research/control-of-transport/smart-mobility-lab/projects/ac-project-course/2017-f1tenth-path-planning-1.705179) | confirmed | Division of Decision and Control Systems. Page does not give a course code; KTH's catalog lists EL2425 'Automatic Control, Project Course, Smaller Course' (the code link is an inference, not stated). Only 2017 projects found. |
| 10 | Lehigh University | United States | ECE 306 / ECE 406 "Autonomous Driving and Robotic Racing" | Yahong Rosa Zheng | 2021 (course run 2021_01 on courses.f1tenth.org), 2021-2023, Spring 2022, spring 2022 (survey), spring 2024 (Philly Friendly race) | full coursekit | [catalog.lehigh.edu](https://catalog.lehigh.edu/coursesprogramsandcurricula/engineeringandappliedscience/electricalandcomputerengineering/) [engineering.lehigh.edu](https://engineering.lehigh.edu/research/resolve/volume-1-2023/making-splash) [engineering.lehigh.edu](https://engineering.lehigh.edu/news/article/envisioning-future-autonomous-vehicles) | confirmed | Earlier (2021) F1TENTH use was inside the Robotic Perception and Computer Vision course. Course code tie (ECE 306/406 = the Robotic Racing class) is by matching title; per-term schedule not opened. / course run created on the F1TENTH course platform in 2021; ... |
| 11 | McMaster University | Canada | "Mechatronics Engineering Capstone (Group 6 'Formula-Tron')" | Martin v. Mohrenschildt (advisor) | 2025-26 | lab or module | [eng.mcmaster.ca](https://www.eng.mcmaster.ca/research-innovation/student-research-innovation/capstone/2026-capstone-project-overview/) [github.com](https://github.com/ysnawara/formula-tron-capstone-project) | confirmed | Single capstone team; capstone course number not given. |
| 12 | Oregon State University | United States | ECE 499/599, CS 419/519 "F1/10: Autonomous Racing" | Houssam Abbas | 2019-2020, Spring 2020 | full coursekit | [web.engr.oregonstate.edu](https://web.engr.oregonstate.edu/~abbasho/teaching/index.html) [docs.google.com](https://docs.google.com/document/d/1ENqmIPH4m39HwI1il-7E6voprFPkWwLWzBFevFpRhBw/edit) [web.engr.oregonstate.edu](https://web.engr.oregonstate.edu/~abbasho/) | confirmed | Student repos zabrock/Need4Speed-F110-2020 match. Homepage also mentions a 'Spring 2019' registration call, date ambiguous; only Spring 2020 is documented on the teaching page. |
| 13 | Poznan University of Technology | Poland | not found | Krzysztof Walas | Spring 2022 (approx.), by 2022 | full coursekit | [arxiv.org](https://arxiv.org/pdf/2209.11181) [arxiv.org](https://arxiv.org/abs/2209.11181) | confirmed | Confirmed only by the instructors' own paper (arXiv 2209.11181); no PUT catalog page found. |
| 14 | Pusan National University | South Korea | "F1Tenth course (F1Tenth 교과목), planned Fall 2024; plus F1Tenth PNU Camp (Future Car program)" | - | Summer 2024 camp, Fall 2024 (planned) | unknown | [mse.pusan.ac.kr](https://mse.pusan.ac.kr/mse/38585/subview.do?enc=Zm5jdDF8QEB8JTJGYmJzJTJGbXNlJTJGODk3MiUyRjE1NDIwNDglMkZhcnRjbFZpZXcuZG8lM0Y%3D) | confirmed | Course title and code not found yet. |
| 15 | Seoul National University | South Korea | "미래모빌리티 자율주행 운영 실습 (Future Mobility Autonomous Driving Operation Practice)" | 이동준 (responsible professor), 한상명, 서다빈 (guest lecturer) | 2025 (first run), 2026-06-29 to 2026-07-03 (30 h), winter camp 2027-01-04 to 01-08 announced | full coursekit | [pnuenv.pusan.ac.kr](https://pnuenv.pusan.ac.kr/bbs/pnuenv/525/1529454/download.do) [gnu.ac.kr](https://www.gnu.ac.kr/car/na/ntt/selectNttInfo.do?mi=5865&nttSn=8797482) | confirmed | Run by the SNU University-Alliance Regional Talent program for students of Kyungpook, Chonnam and Gyeongsang National Universities. Intensive 5-day course at SNU Siheung campus (FMTC); labs follow the F1TENTH coursekit sequence. |
| 16 | Technical University of Munich | Germany | 0000000225 "Der Fahrsimulator im Entwicklungsprozess (The driving simulator in the development process)" | Frank Diermeyer, Damaris Fischl | Summer 2026 | lab or module | [mos.ed.tum.de](https://www.mos.ed.tum.de/en/ftm/teaching/courses/the-driving-simulator-in-the-development-process/) | confirmed | Second TUM course, separate from the AVS practical course; the F1TENTH car is the test vehicle for a teleoperation user study, not an autonomy course. |
| 17 | Technical University of Munich | Germany | 0000001440 "F1TENTH: Autonomous Driving Hands-on" | Johannes Betz, Felix Jahncke | Winter 2023/24, Winter 2024/25, Winter 2025/26, Winter 2026/27 | adapted | [mos.ed.tum.de](https://www.mos.ed.tum.de/en/avs/teaching/f1tenth-autonomous-driving-hands-on/) [mos.ed.tum.de](https://www.mos.ed.tum.de/en/avs/news/article/new-practical-course-f1tenth/) [web.archive.org](https://web.archive.org/web/20250122035339/https://www.mos.ed.tum.de/en/avs/teaching/f1tenth-autonomous-driving-hands-on/) | confirmed | Practical course (Praktikum) of the Professorship of Autonomous Vehicle Systems, TUM School of Engineering and Design; registration via TUM central practical-course matching. 'Number 0000001440' is the course number shown on the chair page (TUMonline module ... |
| 18 | Technion – Israel Institute of Technology | Israel | "CRML lab project 'Technion F1Tenth Autonomous Racing Team' (Faculty of Electrical and Computer Engineering)" | Kiril Solovey | Winter 2022 (one semester) | lab or module | [crml.eelabs.technion.ac.il](https://crml.eelabs.technion.ac.il/?p=5047) [github.com](https://github.com/Technion-F1Tenth/F1Tech) [github.com](https://github.com/Yomaster10/ARMP-Project) | confirmed | Project-based (lab project semester), not a lecture course; ARMP item is a single student project (weak on its own). |
| 19 | The University of Texas at Austin | United States | CS 378 "Introduction to Cyber-physical Systems" | Aloysius K. Mok | 2016 (likely), Spring 2019 | adapted | [utdirect.utexas.edu](https://utdirect.utexas.edu/apps/student/coursedocs/nlogon/download/9468121/) [arxiv.org](https://arxiv.org/pdf/1901.08567) [par.nsf.gov](https://par.nsf.gov/servlets/purl/10221877) | confirmed | Separate from Biswas's CS 378 F1/10 Autonomous Driving (CS 378 is a topics number). The 2016 UT Austin offering named in the F1/10 paper predates Biswas (joined UT 2019), so it is probably this course; not confirmed. SIGCSE 2020 paper: module inside a ... |
| 20 | The University of Texas at Austin | United States | CS 378 / CS 378H "F1/10 Autonomous Driving (Honors section from Spring 2022)" | Joydeep Biswas | Spring 2020, Spring 2021, Spring 2022, by 2022, Fall 2023 | adapted | [amrl.cs.utexas.edu](https://amrl.cs.utexas.edu/CS378-F1Tenth-Autonomous-Driving-S20/) [amrl.cs.utexas.edu](https://amrl.cs.utexas.edu/CS378-F1Tenth-Autonomous-Driving-S21/) [amrl.cs.utexas.edu](https://amrl.cs.utexas.edu/CS378H-S22/) | confirmed | Uses UT's own UT-AUTOmata 1/10 cars; course title carries F1/10. Reference binaries repo ut-amrl/f1tenth_reference_binaries ('for F1/10 course', Dec 2019). |
| 21 | Trine University | United States | "ECE Senior Design, F1Tenth Autonomous Car" | Kevin Woolverton | 2023-24 | lab or module | [trine.edu](https://trine.edu/design-expo/documents/2024/Senior%20Design%20Trifold%20F1%20Tenth%20ECE.pdf) | confirmed | Multi-year senior design project (at least 2022-23 and 2023-24). |
| 22 | TU Dortmund University | Germany | "Projektgruppe (PG) Autonomous Racing: PG 629 'F1/10 Autonomous Racing: Head to Head Capabilities' (2019/20), 'Autonomous Racing: Tracking ... | Kuan-Hsun Chen, Niklas Ueter | WS2018/19, WS2019/20, WS2021/22, WS2022/23 | adapted | [daes.cs.tu-dortmund.de](https://daes.cs.tu-dortmund.de/newsdetail/pg-629-f1-10-autonomous-racing-head-to-head-capabilities-receives-p5-award-7746/) [daes.cs.tu-dortmund.de](https://daes.cs.tu-dortmund.de/teaching/courses/ws2021/2022/project-group-autonomous-racing/) [daes.cs.tu-dortmund.de](https://daes.cs.tu-dortmund.de/teaching/courses/ws2022/2023/project-group-autonomous-racing-cooperative-racing/) | confirmed | Project group number PG 629 is given for the award-winning group only. Design Automation for Embedded Systems (LS12, Prof. Jian-Jia Chen). Year-long Projektgruppe for CS master students. Code on GitHub tu-dortmund-ls12-rt/ar-tu-do. Written up as Ueter, Chen, ... |
| 23 | TU Wien | Austria | 191.119 "Autonomous Racing Cars" | Radu Grosu, Andreas Brandstätter | 2020-, Summer 2020, Summer 2021, Summer 2022, Summer 2023, Summer 2024, Summer 2025, Summer 2026 | full coursekit | [tuwien.at](https://www.tuwien.at/inf/scuderia-segfault/teaching/) [informatics.tuwien.ac.at](https://informatics.tuwien.ac.at/news/2258) [tuwien.at](https://www.tuwien.at/inf/scuderia-segfault/teaching/lab-exercises/) | confirmed | TISS records exist for every summer semester 2020S-2026S (VU, Institute of Computer Engineering, Cyber-Physical Systems unit). 2020S syllabus follows the UPenn F1/10 course structure (modules, three races). TISS lists lecturer ids only (3 lecturers in 2026S); ... |
| 24 | Ulsan National Institute of Science and Technology (UNIST) | South Korea | MEN491 "Creating Autonomous Vehicle (자율주행 자동차 만들기; POL project-oriented course)" | Cheolhyeon Kwon | 2021, 2023, 2026 (ROS 2 Jazzy repo) | adapted | [unist.ac.kr](https://www.unist.ac.kr/unist/center/news.do?mode=view&articleNo=244351&article.offset=0&articleLimit=9) [github.com](https://github.com/HMCL-UNIST/MEN491_2023) [github.com](https://github.com/HMCL-UNIST/creating_autonomous_car) | confirmed | Course code MEN491 from lab GitHub; Korean title from UNIST news. Course feeds team HMcar/UNICORN Racing (ICRA 2026 RoboRacer Master Cup winner per press 2026-06-12). |
| 25 | University of Bonn | Germany | MA-INF 4214 "Lab Course Humanoid Robots (topic: Autonomous racing)" | Maren Bennewitz, Nils Dengler | Winter 2024/25, Winter 2025/26, Summer 2025, Winter 2026/27 | lab or module | [hrl.uni-bonn.de](https://www.hrl.uni-bonn.de/teaching/ws2425/lab-humanoid-robots) [hrl.uni-bonn.de](https://www.hrl.uni-bonn.de/teaching/ws2526/lab-humanoid-robots) [hrl.uni-bonn.de](https://www.hrl.uni-bonn.de/teaching/ss25/lab-humanoid-robots-ma-inf-4214) | confirmed | Humanoid Robots Lab (Prof. Maren Bennewitz), Institute for Computer Science. Racing is one project topic inside the MA-INF 4214 lab course; WS 26/27 supervisors are Subham Agrawal and Shahram Khorshidi. Feeds the LAMARRacing team. |
| 26 | University of California, Santa Barbara | United States | ECE 188 "Senior capstone (ECE 188A/B/C sequence), F1TENTH project" | Ilan Ben-Yaacov, Chris Cheney | 2020-21, 2023-24, 2024-2025, 2024-25, 2025-2026, 2025-26 | lab or module | [courses.ece.ucsb.edu](https://courses.ece.ucsb.edu/ECE188/188_F25Ilan/projects_offered.htm) [courses.ece.ucsb.edu](https://courses.ece.ucsb.edu/ECE188/188_F25Ilan/Projects%20Offered/F1TENTH_2025-26.pdf) [courses.ece.ucsb.edu](https://courses.ece.ucsb.edu/ECE188/188_F24Ilan/Projects%20Offered/F1TENTH_2024-25.pdf) | confirmed | Capstone project track sponsored by Hespanha lab, not a lecture course; recurring since at least 2020-21 (ITC 2023 paper also from a UCSB F1TENTH capstone). / A 2024-25 version of the PDF also exists (188_F24Ilan, not opened). |
| 27 | University of California, Santa Cruz | United States | "Formula F1/10: Slugbotics (Introduction to Autonomous Vehicles & ROS module)" | - | c. 2021-2023 | lab or module | [web.archive.org](https://web.archive.org/web/20230626041052/https://slab.sites.ucsc.edu/ros/) | confirmed | Workshop-style training module feeding a student Formula 1/10th team; not shown as a catalog course. Live page now returns HTTP 410. |
| 28 | University of Illinois Urbana-Champaign | United States | ECE 484 "Principles of Safe Autonomy" | - | Spring 2025, Spring 2026 | lab or module | [courses.grainger.illinois.edu](https://courses.grainger.illinois.edu/ece484/) [github.com](https://github.com/hyoungju03/f1tenth_SP25) [github.com](https://github.com/arjunchainani/ece-484-f1tenth) | confirmed | Main lab platform is the Polaris GEM car; F1tenth cars are a final-project option. Instructors per term not taken from the page (only 'Related Faculty' listed). |
| 29 | University of Nevada, Las Vegas | United States | CS 489/689 "Autonomous Racing: A Cyber-Physical Perspective" | Corey Tessler, Prashant Modekurthy | Fall 2023, 2024, 2024-2026, Spring 2024 | full coursekit | [unlv.edu](https://www.unlv.edu/news/article/course-autonomous-racing) [github.com](https://github.com/unlv-f1) [github.com](https://github.com/ProjectZuki/GalacticRacing) | confirmed | Later terms inferred from the lab org and student repos. / Student repo; lab sequence matches the coursekit. |
| 30 | University of Pennsylvania | United States | ESE 6150 "RoboRacer Autonomous Racing Cars" | Rahul Mangharam, Houssam Abbas | 2016-present, Fall 2018, Fall 2019, Spring 2020, 2021 (course run 2021_01 on courses.f1tenth.org), Spring 2023, Fall 2023, Spring 2024, ... | full coursekit | [catalog.upenn.edu](https://catalog.upenn.edu/courses/ese/) [grasp.upenn.edu](https://www.grasp.upenn.edu/academics/masters-degree-program/current-students/robotics-graduate-courses-fall/) [me.upenn.edu](https://www.me.upenn.edu/from-the-roboracer-course-to-the-roboracer-track/) | confirmed | Already published on /learn/courses (offering id penn). Penn MEAM news dates the course to 2016. Earlier numbers: ESE 680 "Autonomous Vehicles F110" (syllabus by Abbas and Mangharam; skeleton repos Fall 2018, Fall 2019) and ESE 615 "F1/10 Autonomous Racing" ... |
| 31 | University of Southern Denmark (SDU) | Denmark | T390016101 (internal EB-ARSP5) "Autonomous F1-tenth Racing Student Project - 5 ECTS" | Emad Samuel Malki Ebeid, Tim McRae | Autumn (approved 02-05-2025) | adapted | [odin.sdu.dk](https://odin.sdu.dk/sitecore/index.php?a=fagbesk&id=176592&listid=21433&lang=en) [sdu.dk](https://www.sdu.dk/en/forskning/sdu-digital-and-high-frequency-electronics/competitions) | confirmed | Catalog version marked 'Archive'; page mentions a separate 5 ECTS elective and an alternative to 'Experts in Team Innovation'; a 10 ECTS variant is reported by search snippets but not opened. Focus is electronics (sensing units, hardware accelerators). |
| 32 | University of Virginia | United States | CS 4501 "F1/10 Autonomous Racing: Perception, Planning, and Control" | Madhur Behl | Spring 2018, spring 2018, Spring 2019, by 2022, Fall 2023, Fall 2024 | full coursekit | [f1tenth.racing](https://www.f1tenth.racing/course) [madhurbehl.com](https://www.madhurbehl.com/teaching.html) [news.virginia.edu](https://news.virginia.edu/content/racing-students-unique-course-put-self-driving-cars-final-test) | confirmed | Search snippets also give cross-listing SYS 4582 (Spring 2018/2019) but that UVA page returned 403, not verified. Fall 2023 inferred from the Nov 2023 post. Behl co-founded F1TENTH. Fall 2023 also supported by a student team org. |
| 33 | Weber State University | United States | not found | - | 2025-2026, Spring 2025, Spring 2026 | full coursekit | [weber-agv.github.io](https://weber-agv.github.io/f1tenth_coursekit/) [github.com](https://github.com/Weber-AGV/lab6a_waypoint_logger) [github.com](https://github.com/Weber-AGV) | confirmed | Course code and instructor not on the site. Terms inferred from lab-template fork dates. Possible instructor Scott Hadzik (forked the coursekit 2021) but not named as instructor on any page. / Institution inferred from the org name; looks like course ... |
| 34 | École Polytechnique | France | CSC_42M02_EP (earlier INF472R) "Modal Robots et drones" | David Filliat, Eric Goubault, Sylvie Putot | 2023-24 (student repo, as INF472R), 2025-26 (Période 2) | lab or module | [moodle.ip-paris.fr](https://moodle.ip-paris.fr/pluginfile.php/270362/coursecat/description/Modal-INF-2025-26.pdf) [github.com](https://github.com/Andrey-Shcherbakov/Modal_ROS_2024) | confirmed | Bachelor/engineering-cycle 'modal' (project-based module): 4 two-hour lectures plus programming, simulation and experiments; F1TENTH is one of several platforms (TurtleBots, Crazyflie drones). Old code INF472R matches the student repo; the code mapping is ... |
| 35 | California State Polytechnic University, Pomona | United States | "Senior Design Project, F1TENTH" | - | 2023-24, 2024-25 | lab or module | [github.com](https://github.com/CPP-F1TENTH-SDP/Labs) | likely | Student senior-design group working through the coursekit labs; no university page found. |
| 36 | Carnegie Mellon University | United States | "F1TENTH course run on courses.f1tenth.org (2021)" | Ragunathan Rajkumar | 2021 (course run 2021-01 on courses.f1tenth.org) | full coursekit | [web.archive.org](https://web.archive.org/web/20220624232347/https://courses.f1tenth.org/courses/course-v1:Carnegie-Mellon-University+15weeks+2021-01/about) | likely | course run created on the F1TENTH course platform in 2021; the page shows no class dates, so it proves a run was set up, not that it was taught. |
| 37 | Czech Technical University in Prague | Czech Republic | "SafeAV course packages (F1/10 lab exercises) and F1Tenth student projects at CIIRC" | - | SafeAV project, 2025- | lab or module | [ciirc.cvut.cz](https://www.ciirc.cvut.cz/en/zapojeni-ciirc-cvut-do-evropskeho-projektu-safeav-vyuka-bezpecnosti-autonomnich-technologii-na-vysokych-skolach-2/) [imr.ciirc.cvut.cz](https://imr.ciirc.cvut.cz/Education/StudentTopics) [iid.ciirc.cvut.cz](https://iid.ciirc.cvut.cz/students/) | likely | Course material is described in future tense (under development in SafeAV); no KOS/catalog course code found. Otherwise F1/10 at CTU runs as student projects and theses (Sojka, Klapálek, Zahrádka). |
| 38 | Halla University | South Korea | "Adventure Design (어드벤쳐디자인), Dept. of Future Mobility Engineering" | - | Spring 2024 | lab or module | [donga.com](https://www.donga.com/news/Society/article/all/20240703/125755967/1) [veritas-a.com](http://www.veritas-a.com/news/articleView.html?idxno=511135) | likely | Own F1TENTH-compatible platform (with company Divine), not the coursekit. |
| 39 | Inha University | South Korea | not found | Kwangki Kim | 2021 (course run 2021_01 on courses.f1tenth.org) | full coursekit | [web.archive.org](https://web.archive.org/web/20220624232809/https://courses.f1tenth.org/courses/course-v1:Inha-University+15weeks+2021_01/about) | likely | course run created on the F1TENTH course platform in 2021; the page shows no class dates, so it proves a run was set up, not that it was taught. |
| 40 | Korea Aerospace University | South Korea | "Likely 'AI SW Project' (Fall 2024) / 'SW Design Project II' (Fall 2025), Dept. of AI Autonomous Driving Systems Engineering" | Inmo Jang (likely) | Fall 2024, Fall 2025 | adapted | [github.com](https://github.com/InMOLab/LEC_F1Tenth_coursekit) [kau.ac.kr](https://kau.ac.kr/kaulife/bid.php?mode=read&seq=8303) [github.com](https://github.com/boss123516/f1tenth-racing) | likely | Course names come from student repo names only; no KAU catalog page found. Lab fork + teaching-kit purchase make a taught course likely. |
| 41 | Massachusetts Institute of Technology | United States | not found | Luca Carlone | 2021 (course run 2021_01 on courses.f1tenth.org) | full coursekit | [web.archive.org](https://web.archive.org/web/20220624215735/https://courses.f1tenth.org/courses/course-v1:Massachusetts-Institute-of-Technology+15weeks+2021_01/about) | likely | course run created on the F1TENTH course platform in 2021; the page shows no class dates, so it proves a run was set up, not that it was taught. |
| 42 | Nanyang Technological University | Singapore | not found | - | 2021 (Sep), 2021 (course run 2021-01 on courses.f1tenth.org) | unknown | [github.com](https://github.com/reubenwong97/f1tenth-course) [web.archive.org](https://web.archive.org/web/20230815093339/https://courses.f1tenth.org/courses/course-v1:NTU-Singapore+15weeks+2021-01/about) | likely | No NTU catalog page found; course code and instructor unknown. NTU DeepSpeed team (founded 2022) is listed under clubs. / course run created on the F1TENTH course platform in 2021; the page shows no class dates, so it proves a run was set up, not that it was ... |
| 43 | Pusan National University | South Korea | "Autonomous-driving education in the Hyunsong AI Mobility Lab (RoboRacer/F1TENTH)" | - | 2024-2026 | unknown | [pusan.ac.kr](https://www.pusan.ac.kr/kor/CMS/Board/Board.do?mCode=MN109&mode=view&board_seq=1507196) | likely | Supports the PNU row above (F1Tenth course planned Fall 2024); merge if you prefer one PNU row. |
| 44 | Széchenyi István University | Hungary | GKNB_AUTM078 "Autonomous robots and vehicles software engineering (Autonóm járművek és robotok programozása)" | Ernő Horváth, Áron Ballagi, Rudolf Krecht, Miklós Unger, Gergő Ignéczi, Norbert Markó | - | lab or module | [sze-info.github.io](https://sze-info.github.io/avr/) [sze-info.github.io](https://sze-info.github.io/avr/simulation/f1tenth_sim_a/) [sze-info.github.io](https://sze-info.github.io/avr/workshops/f1tenth_real_a/) | likely | The course uses an F1/10-like Wheeltec Roboworks car, not the official F1TENTH build; F1/10 appears as simulation and workshop material. Paper: Horváth et al., 'Teaching Aspects of ROS 2 and Autonomous Vehicles', Eng. Proc. 2024 (full text 403 to curl; ... |
| 45 | Technical University of Munich | Germany | "F1TENTH course run on courses.f1tenth.org (2021)" | Markus Lienkamp, Florian Sauerbeck | 2021 (course run 2021_01 on courses.f1tenth.org) | full coursekit | [web.archive.org](https://web.archive.org/web/20220624224435/https://courses.f1tenth.org/courses/course-v1:Technical-University-of-Munich+15weeks+2021_01/about) | likely | course run created on the F1TENTH course platform in 2021; the page shows no class dates, so it proves a run was set up, not that it was taught. staff from the Chair of Automotive Technology; the page misspells 'Lienkmap'; estimated effort 20 hours per week |
| 46 | University at Buffalo (State University of New York) | United States | CSE 468/568 "Robotics Algorithms" | Karthik Dantu | 2021 (course run 2021_01 on courses.f1tenth.org), Spring 2024 | lab or module | [github.com](https://github.com/imalhotra15/F1Tenth_GapFollow) [github.com](https://github.com/imalhotra15/Autonomous-Racer-F1Tenth) [cse.buffalo.edu](https://cse.buffalo.edu/ubcms/auto/profiles/teaching/kdantu.php) | likely | Instructor tie by course listing; which term used F1Tenth assignments inferred from repo dates (2023-24). / course run created on the F1TENTH course platform in 2021; the page shows no class dates, so it proves a run was set up, not that it was taught. 15 ... |
| 47 | University of California San Diego | United States | not found | - | 2021 (course run 2021_01 on courses.f1tenth.org), Winter 2023 | unknown | [github.com](https://github.com/Girish-Krishnan/ECE-148-Autonomous-Driving-and-Mapping) [f1tenth.github.io](https://f1tenth.github.io/) [web.archive.org](https://web.archive.org/web/20220624230009/https://courses.f1tenth.org/courses/course-v1:UC-SanDiego+10weeks+2021_01/about) | likely | Only RoboRacer's own statements name UC San Diego as a user or teacher of the material. ECE/MAE 148 (Jack Silberman) is the closest course, but its F1TENTH link rests on one student report whose stack is the course's own (weak). The Triton AI club ran a ... |
| 48 | University of California, Davis | United States | ECS 193A/B (inferred) "Senior design project: Davis Autonomous Race Car" | - | 2024-25 | lab or module | [github.com](https://github.com/UCD-193AB-ws24/DavisAutonomousRaceCar) [github.com](https://github.com/ian-chuang/darc_f1tenth_system) | likely | Org name '193AB' matches UC Davis CS senior design ECS 193A/B (code inferred, not seen on a UCD page); sibling repos are other capstone teams. |
| 49 | University of California, Irvine | United States | not found | Yasser Shoukry | 2021 (course run 2021_01 on courses.f1tenth.org) | full coursekit | [web.archive.org](https://web.archive.org/web/20220624214153/https://courses.f1tenth.org/courses/course-v1:UC-Irvine+10weeks+2021_01/about) | likely | course run created on the F1TENTH course platform in 2021; the page shows no class dates, so it proves a run was set up, not that it was taught. 10 weeks |
| 50 | University of California, Santa Barbara | United States | "F1TENTH course run on courses.f1tenth.org (2021)" | João Hespanha | 2021 (course run 2021_01 on courses.f1tenth.org) | full coursekit | [web.archive.org](https://web.archive.org/web/20220624223613/https://courses.f1tenth.org/courses/course-v1:UC-SantaBarbara+15weeks+2021_01/about) | likely | course run created on the F1TENTH course platform in 2021; the page shows no class dates, so it proves a run was set up, not that it was taught. 15 weeks |
| 51 | University of Central Florida | United States | "Senior Design (F1Tenth@UCF effort)" | - | 2024-2025, 2024-25 | lab or module | [github.com](https://github.com/F1Tenth-UCF/Senior-Design-Software) [cecs.ucf.edu](https://www.cecs.ucf.edu/ece-masters-student-drives-innovation-with-ai-racer-club/) | likely | Senior-design team inside the UCF F1Tenth club/CAVREL effort; course number not given. / Senior design team preceded the AI Racer club. |
| 52 | University of Florida | United States | EGN 4912 "Reliable and Safe Autonomous Racing" | Ivan Ruchkin | Spring 2024 | adapted | [ivan.ece.ufl.edu](https://ivan.ece.ufl.edu/blog/2024/01/12/egn4912-reliable-and-safe-autonomous-racing-spring-2024/) [github.com](https://github.com/caoeltjen/TEALab_f1tenth) [iot.institute.ufl.edu](https://iot.institute.ufl.edu/2025/02/f1tenth-driving-1st-place-demo/) | likely | Course page does not say F1TENTH; the tie is via the same TEA Lab's F1Tenth cars. |
| 53 | University of Louisville | United States | "Capstone project (F1TENTH)" | - | 2022-23, Spring 2023 | lab or module | [github.com](https://github.com/ESMarks/uofl-f1tenth) [github.com](https://github.com/dlnicholson/f1tenth-capstone) | likely | Student repos only; no Louisville page found. |
| 54 | University of Lübeck | Germany | "Praktikum Autonomes Fahren" | - | Winter 2023/24 (repo Oct-Nov 2023) | adapted | [git.ime.uni-luebeck.de](https://git.ime.uni-luebeck.de/public-projects/asl/praktikum-autonomes-fahren-labs/-/blob/public/README.md) | likely | Hosted on the university's own GitLab (git.ime.uni-luebeck.de); no course catalog page found, institute behind 'ASL' not identified. Attribution to University of Lübeck is from the uni-luebeck.de domain. |
| 55 | University of Modena and Reggio Emilia (UNIMORE) | Italy | not found | Marko Bertogna | 2021 (course run 2021_01 on courses.f1tenth.org) | full coursekit | [web.archive.org](https://web.archive.org/web/20220624230834/https://courses.f1tenth.org/courses/course-v1:University-of-Modena+10weeks+2021_01/about) | likely | course run created on the F1TENTH course platform in 2021; the page shows no class dates, so it proves a run was set up, not that it was taught. 10 weeks |
| 56 | University of Nebraska–Lincoln | United States | not found | Dung Hoang Tran | 2021 (course run 2021_01 on courses.f1tenth.org) | full coursekit | [web.archive.org](https://web.archive.org/web/20220624225946/https://courses.f1tenth.org/courses/course-v1:University-of-Nebraska-Lincoln+10weeks+2021_01/about) | likely | course run created on the F1TENTH course platform in 2021; the page shows no class dates, so it proves a run was set up, not that it was taught. 10 weeks |
| 57 | West Virginia University | United States | CPE 493 "Special Topics (Intelligent Safe Robotics)" | Amr El-Wakeel | Fall 2024 | adapted | [github.com](https://github.com/craftjohn/F1Tenth-Labs) [catalog.wvu.edu](https://catalog.wvu.edu/search/?P=CPE%20493) [mybuckhannon.com](https://www.mybuckhannon.com/wvu-roboracer-team-builds-race-cars-that-have-minds-of-their-own/) | likely | Linking CPE 493 to 'Intelligent Safe Robotics' is an inference (CPE 493 is the special-topics number). RoboRacer senior capstone also exists (module). WVU RoboRacer team is a club/lab team since 2024. |
| 58 | Boston University | United States | CS 654 "Embedded Systems Development" | - | Fall 2025 | lab or module | [github.com](https://github.com/iyervarsha12/avoidant-f1tenthcar) [bu.edu](https://www.bu.edu/academics/cas/courses/cas-cs-654/) | weak | Single student final project on an F1tenth car; no BU page ties CS 654 to F1TENTH. |
| 59 | Budapest University of Technology and Economics | Hungary | not found | István Harmati | - | lab or module | [iit.bme.hu](https://www.iit.bme.hu/users/dr-harmati-istv%C3%A1n?language=en) | weak | Project/thesis topic only, not a course. |
| 60 | California State University, Chico | United States | not found | - | 2021 | unknown | [github.com](https://github.com/chicostate-mmem/f1tenth_coursekit) | weak | Fork only; no course found. |
| 61 | Gyeongsang National University | South Korea | not found | - | 2021 (course run 2021_01 on courses.f1tenth.org) | full coursekit | [web.archive.org](https://web.archive.org/web/20220624223540/https://courses.f1tenth.org/courses/course-v1:Gyeongsang-National-University+15weeks+2021_01/about) | weak | course run created on the F1TENTH course platform in 2021; the page shows no class dates, so it proves a run was set up, not that it was taught. course staff on the page is Rahul Mangharam (Penn), a template default |
| 62 | Harvard University | United States | not found | - | 2021 (course run 2021_01 on courses.f1tenth.org) | full coursekit | [web.archive.org](https://web.archive.org/web/20220624233726/https://courses.f1tenth.org/courses/course-v1:Harvard-University+15weeks+2021_01/about) | weak | course run created on the F1TENTH course platform in 2021; the page shows no class dates, so it proves a run was set up, not that it was taught. course staff field reads only 'Prof. Dr. Brian' (incomplete) |
| 63 | Indian Institute of Technology Bombay | India | not found | - | - | unknown | [rosap.ntl.bts.gov](https://rosap.ntl.bts.gov/view/dot/78691/dot_78691_DS1.pdf) | weak | Teams DB: SeDriCa-UMIC (CDC 2024) and e-Yantra. No IIT course page found. |
| 64 | Khalifa University | United Arab Emirates | not found | - | - | unknown | [rosap.ntl.bts.gov](https://rosap.ntl.bts.gov/view/dot/78691/dot_78691_DS1.pdf) [ppms.cit.cmu.edu](https://ppms.cit.cmu.edu/projects/detail/445) | weak | Adoption claim does not separate teaching from research/competition. Teams DB lists 'KU F1tenth Team' (IROS 2024). |
| 65 | Northeastern University | United States | CS 5180 "Reinforcement Learning and Sequential Decision Making" | - | Spring 2026 | lab or module | [github.com](https://github.com/polagoni-m/f1tenth-rl) [github.com](https://github.com/ananth-ta/racing-line-learner) | weak | Student-chosen final projects in the F1TENTH Gym simulator only; not an F1TENTH course. |
| 66 | Soongsil University | South Korea | "2024 Summer AI Convergence Special Lecture (Autonomous Driving) (AI융합특강(자율주행))" | 홍윤호 (Dr.) | Summer 2024 | lab or module | [aix.ssu.ac.kr](https://aix.ssu.ac.kr/notice_view.html?idx=1455) | weak | Could not open the page (connection refused/timeout); evidence is the search snippet only. Kim Kanghee (Soongsil) is in the RoboRacer Korea Academy. |
| 67 | The University of Texas at Austin | United States | CS 393R "Autonomous Robots" | Joydeep Biswas | Fall 2020, Fall 2021, Spring 2024 | adapted | [amrl.cs.utexas.edu](https://amrl.cs.utexas.edu/CS393R-S24/) [joydeepb.com](https://www.joydeepb.com/teaching.html) | weak | Same 1/10 car fleet as the F1/10 course but the page does not name F1TENTH; the 'RoboRacer Autonomous Robots course at UT Austin' testimonial probably refers to this or CS 378. |
| 68 | Tsinghua University; Shanghai Jiao Tong University | China | not found | - | - | unknown | [csee.hnu.edu.cn](https://csee.hnu.edu.cn/info/1061/13336.htm) | weak | Third-party claim; no Tsinghua/SJTU course page found (Baidu blocked with a captcha). |
| 69 | University of Delaware | United States | "Autonomous Driving Academy (pre-college) / Introduction to Autonomous Driving" | - | Fall 2025 | unknown | [github.com](https://github.com/thecarlab/CARKit) [thecarlab.org](https://www.thecarlab.org/courses/autonomous-driving) | weak | F1TENTH stack is used in the pre-college academy kit; whether the Fall 2025 UD course uses it is not shown. |
| 70 | University of Seoul | South Korea | "컴퓨터과학종합설계 (Computer Science Capstone Design), project 'F1T'" | - | Spring 2026 | lab or module | [abeek.uos.ac.kr](https://abeek.uos.ac.kr/kr/center/center/view/6791/page/1?search_cate=58) | weak | Only the title is visible; 'F1T' presumably F1TENTH, unverified. |

### Programs, camps, short courses and events

Not counted as university courses.

| # | Institution | Country | Course | Instructor(s) | Terms or years seen | Kind | Evidence | Confidence | Notes |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Dong-A University | South Korea | "2024 F1 Tenth Boot Camp (LINC 3.0)" | - | 2024-09-26 to 2024-09-28 | program | [ee.donga.ac.kr](http://ee.donga.ac.kr/kor/CMS/Board/Board.do?mCode=MN174&mode=view&board_seq=8375350) [dhnews.co.kr](http://dhnews.co.kr/news/view/1065579199145221) | confirmed | Extracurricular camp, not a credit course. |
| 2 | ESWeek 2021 (with Penn and TUM lecturers) | online | "Education Class Lecture A3 'Learn to Drive (and Race!) Autonomous Vehicles'" | Johannes Betz, Rahul Mangharam | October 2021 | program | [github.com](https://github.com/f1tenth/ESweek2021_educationclassA3) | confirmed | conference education class, not a university course |
| 3 | Gyeongsang National University (GNU) and LINC 3.0 consortium | South Korea | "F1 Tenth Boot Camp / F1 Tenth autonomous-driving joint education program (LINC 3.0 AI-Robot ICC inter-university joint education program)" | Jin Hyun Kim | 2023, 2024 | program | [gnu.ac.kr](https://www.gnu.ac.kr/main/na/ntt/selectNttInfo.do?mi=1070&nttSn=2196312) [autoware.org](https://autoware.org/f1tenth-korea-delegation-at-upenn/) [web.archive.org](https://web.archive.org/web/20231206163206/http://korea-race.f1tenth.org/ko/program.html) | confirmed | National program row: short bootcamps + joint education + Korea Championship + Penn Global Camp, funded through LINC 3.0 (government university-industry cooperation program; ministry not named on these pages). |
| 4 | Inje University | South Korea | "Winter Capstone Design at Penn xLab (동계 캡스톤디자인)" | Rahul Mangharam (host) | 2024-01-08 to 2024-01-18 | program | [cms.inje.ac.kr](https://cms.inje.ac.kr/ev/life/gallery.do?mode=view&articleNo=66848&article.offset=6&articleLimit=6) | confirmed | Same trip as the LINC 3.0 Global Camp (Prof. Changjun Seo). Inje RISE also ran the '2025 F1 TENTH 자율주행자동차 경진대회' with pre-training (ROS 2, F1 TENTH platform) per press. |
| 5 | Nagoya University (TMI, Suzuki lab) with MODECO LLC; 4th edition at Gifu University | Japan | "F1-tenth JAPAN / MAGP (Minicar Autonomous Grand Prix)" | - | 2024-2026 | program | [suzlab.mae.nagoya-u.ac.jp](https://www.suzlab.mae.nagoya-u.ac.jp/topics/f1-tenth-japan-cup%E9%96%8B%E5%82%AC%E6%B1%BA%E5%AE%9A%EF%BC%81/) [f1tenth-japan.org](https://f1tenth-japan.org/) | confirmed | National education-oriented competition series, not a credit course. No Japanese university course found. (event or competition series, moved from clubs) |
| 6 | RoboRacer Korea (Roboracer Foundation Korea, formerly F1TENTH Korea) | South Korea | "RoboRacer beginner course (3-day) and intermediate course (3-day); RoboRacer Academy network curriculum (Modules A-G)" | Academy network: Kang Kyungtae (Hanyang), Kim Kanghee (Soongsil), Kim Gunwoo (GNU), Kim Kyong Hoon (Kyungpook), Kim Baekgyu (DGIST), Kim Jongwook (Dong-A), Kim ... | ongoing (2026 site) | program | [roboracer.or.kr](https://www.roboracer.or.kr/organization) [roboracer.or.kr](https://www.roboracer.or.kr/community.html) [roboracer.or.kr](https://www.roboracer.or.kr/edu) | confirmed | National umbrella for the Korean program; evolved from the LINC 3.0 F1 Tenth consortium; runs the Korea Championship (5th edition with IFAC 2026, Busan). Instructor names are my romanization of the Korean page. |
| 7 | Universidad de San Buenaventura Cali | Colombia | "1st RoboRacer Colombia Championship (host)" | - | - | program | [eventos.usbcali.edu.co](https://eventos.usbcali.edu.co/?p=2677) | confirmed | Competition host, not a team; no course mentioned. (event or competition series, moved from clubs) |
| 8 | University of Stuttgart | Germany | "School-for-Talents project: Einstieg in das Autonomous RC Racing" | Miralem Saljanin, Sören Fuchs, Victor Mappes | Oct 2023 - Sep 2024 | program | [ifs.uni-stuttgart.de](https://www.ifs.uni-stuttgart.de/aktuelles/news/School-for-Talents-Einstieg-in-das-Autonomous-RC-Racing/) | confirmed | Extracurricular talent-programme project (School for Talents, DFG Excellence Strategy), not a catalogued course; names are contact persons. |
| 9 | University of the Pacific | United States | "F1TENTH Racing Camp (pre-college summer program)" | Don Lee | summer 2025 | program | [admissions.pacific.edu](https://www.admissions.pacific.edu/about-pacific/summer/precollege-summer-program/learning/f1tenth-summer-camp) [pacific.jumbula.com](https://pacific.jumbula.com/Summer2025/F1tenthRacing) | confirmed | High-school summer camp, not a degree course. No year on the page (only the footer copyright 2026). / outreach for high-school students, not a university course; team AIR UOP raced IV 2026 |
| 10 | University of Victoria | Canada | "IEEE UVic F1TENTH Autonomous Racing Challenge (event)" | - | 2026 | program | [events.vtools.ieee.org](https://events.vtools.ieee.org/m/549833) | confirmed | one-off event, not a course (event or competition series, moved from clubs) |
| 11 | University of Victoria | Canada | "AI Velocity Cup: F1Tenth Autonomous Racing Challenge (PACRIM 2024)" | - | 2024 | program | [ece.uvic.ca](https://www.ece.uvic.ca/~cai/rules.html) | confirmed | conference competition, not a course (event or competition series, moved from clubs) |
| 12 | Yonam Institute of Technology | South Korea | "LINC 3.0 AI-Robot ICC inter-university joint education program (F1 Tenth Jeju Grand Prix)" | - | 2024-06-03 to 2024-06-05 | program | [yc.ac.kr](https://www.yc.ac.kr/smartsw/notice.do?mode=view&articleNo=31259&article.offset=90&articleLimit=10) | confirmed | Joint education program within the LINC 3.0 F1 Tenth consortium. |

## (b) Clubs and student teams

| # | Name | Institution | Country | Kind | Years active | Evidence | Confidence | Notes |
|---|---|---|---|---|---|---|---|---|
| 1 | Aarhus University F1Tenth Autonomous Racing Team | Aarhus University | Denmark | lab team | 2022- | [ece.au.dk](https://ece.au.dk/en/collaboration/collaboration-with-engineering-students/autonomous-racing-team-f1tenth) [github.com](https://github.com/LukasEsterle/AUF1Tenth) | confirmed | No course found; project and thesis work only / Faculty-led student team in the ECE department; listed under collaboration with engineering students. |
| 2 | Integra AGH | AGH University of Krakow | Poland | club | 2022 | [agh.edu.pl](https://www.agh.edu.pl/en/students/news/detail/integra-agh-on-the-podium-of-the-autonomous-driving-competition-in-south-korea) | confirmed | Integra AGH is a student organization (science club); the 'club' reading rests on 'members of Integra AGH' and 'student projects'. Event = 2022 F1TENTH Korea Championship, Jeju. |
| 3 | ASURT F1TENTH | Ain Shams University | Egypt | club | 2025-2026 | [asuf1tenth.pages.dev](https://asuf1tenth.pages.dev/) [github.com](https://github.com/ASUF1tenth) | confirmed | Part of Ain Shams University Racing Team (ASURT). / ASURT = Ain Shams University Racing Team, a student racing team; F1TENTH is its sub-team. |
| 4 | F1TENTH Student Club (SMART Centre) | Amrita Vishwa Vidyapeetham | India | club | - | [amrita.edu](https://www.amrita.edu/?p=688162) [amrita.edu](https://www.amrita.edu/center/sustainable-mobility-and-automotive-research-technology-centre-smart/student-club/) | confirmed | Sustainable Mobility and Automotive Research Technology Centre (SMART). / Club housed in a research centre (SMART). Campus not stated in the fetched excerpt. |
| 5 | Assiut Motorsport (RoboRacer sim) | Assiut University | Egypt | club | 2025 | [aun.edu.eg](https://aun.edu.eg/engineering/node/39867) [aun.edu.eg](https://www.aun.edu.eg/engineering/node/40045) | confirmed | Sim league only. / Student motorsport team; simulation (AutoDRIVE) entries only, no physical car shown. |
| 6 | Binghamton University Roboracer (ECD507) | Binghamton University (SUNY) | USA | course team | 2024-2025 | [github.com](https://github.com/Binghamton-University-Roboracer) | confirmed | Senior capstone (Engineering Design, ECD) team. Course fact: Binghamton ECD capstone project ECD507 2024-25 built on F1TENTH. |
| 7 | FSM Speed | City University of Hong Kong | Hong Kong SAR, China | lab team | 2024 | [cs.cityu.edu.hk](https://www.cs.cityu.edu.hk/~jianwang/news/competition/index.html) | confirmed | No CityU course found. / Race winner 2024 (CPS-IoT Week, Hong Kong). |
| 8 | Columbia University Robotics Club (CURC) Roboracer team | Columbia University | USA | club | 2019-2026 | [columbiarobotics.club](https://www.columbiarobotics.club/) [github.com](https://github.com/columbia-university-robotics/self-driving-car) [github.com](https://github.com/columbia-university-robotics/roboracer-2025) | confirmed | Sub-team of a student club. Earlier 'auto-car' repo (2019-2020) is the same project lineage; F1/10 explicit from 2021. |
| 9 | F1/10 team CTU (Industrial Informatics Department, CIIRC) | Czech Technical University in Prague | Czech Republic | lab team | 2017-2021 | [iid.ciirc.cvut.cz](https://iid.ciirc.cvut.cz/projects/f1tenth/) [rtime.ciirc.cvut.cz](https://rtime.ciirc.cvut.cz/~sojka/students/F3-DP-2017-Vajnar-Martin-Thesis.pdf) | confirmed | No CTU course found; work runs through theses and student projects (Sojka, Hanzálek). / Race winner 2018 (Porto). |
| 10 | ForzaETH | ETH Zürich | Switzerland | club | 2022-2026 | [forzaeth.ch](https://www.forzaeth.ch/) | confirmed | Began as an ETH Center for Project-Based Learning (PBL, D-ITET) research project, now a student association team; lab and club hybrid. Start year from ForzaETH race-stack paper era, not stated on page. |
| 11 | FAU Autonomy Technology Team Project: Roboracer (RoboRacer-Shiran) | Friedrich-Alexander-Universität Erlangen-Nürnberg (FAU) | Germany | course team | 2025-2026 | [ac.tf.fau.eu](https://ac.tf.fau.eu/files/2025/03/AuT_Team_Project_Roboracer.pdf) [github.com](https://github.com/farhadvaseghi/RoboRacer-Shiran) | confirmed | Course fact: FAU M.Sc. Autonomy Technology team project on RoboRacer (2025). |
| 12 | King's College London F1TENTH team | King's College London | United Kingdom | lab team | 2023 | [kcl.ac.uk](https://www.kcl.ac.uk/kings-students-build-self-driving-cars-at-the-11th-f1tenth-autonomous-grand-prix) | confirmed | team of a postdoc, a PhD student and an undergraduate; no module named / One-off research-group entry. |
| 13 | Team PL400 | Lehigh University | USA | lab team | 2022 | [engineering.lehigh.edu](https://engineering.lehigh.edu/news/article/lehigh-student-team-wins-f1tenth-virtual-race-icra-2022) | confirmed | Virtual head-to-head winner, 10th F1TENTH GP 2022. The brief's 'Lehigh Mountain Hawks (2024)' was not found separately; Rosa Zheng also authored the F1TENTH teaching-module paper. |
| 14 | MIT Driverless (F1Tenth program) | Massachusetts Institute of Technology | USA | club | 2022-2025 | [edgerton.mit.edu](https://edgerton.mit.edu/for-MIT-students/clubs-teams/mit-driverless) | confirmed | Student team (Edgerton Center) best known for full-scale driverless racing; F1Tenth is a side program. |
| 15 | Team Suzlab | Nagoya University | Japan | lab team | 2023-2024 | [suzlab.mae.nagoya-u.ac.jp](https://www.suzlab.mae.nagoya-u.ac.jp/topics_en/f1tenth-foundation-2023-iv3%E4%BD%8D%E3%83%BBicra4%E4%BD%8D/) | confirmed | Lab news also mentions ICRA2024 participation (search snippet). |
| 16 | NTU DeepSpeed | Nanyang Technological University | Singapore | club | 2022-2026 | [github.com](https://github.com/NTUDeepSpeed/NTUDeepSpeed.github.io) [github.com](https://github.com/NTUDeepSpeed/F1Tenth_Hackathon_Evaluation) [ntudeepspeed.github.io](https://ntudeepspeed.github.io/) | confirmed | Ran the NTU F1Tenth Hackathon 2024 (sim, wall-follow/gap-follow). / Undergraduate student team with recruitment; club vs. CCA status not stated explicitly. Also known as NTU-Autonomous-Racing-Team on GitHub. |
| 17 | Embedded Machine Learning Club | North Carolina State University | USA | club | 2023 | [ece.ncsu.edu](https://ece.ncsu.edu/general-news/undergraduate-students/page/3/) [ece.ncsu.edu](https://ece.ncsu.edu/student-org/eml/) | confirmed | Student club advised by Edgar Lobaton. Teams DB lists it; the brief's NC State car 'Derek' not verified. |
| 18 | NPU-FSD-TianRacer | Northwestern Polytechnical University (NPU IUS Lab) | China | lab team | 2022-2026 | [github.com](https://github.com/npu-ius-lab/Roboracer_China_2025) [github.com](https://github.com/npu-ius-lab/f1tenth) [github.com](https://github.com/npu-ius-lab/Roboracer_China_2026) | confirmed | China has a national 'Roboracer China' track inside the 智能无人系统应用挑战赛 and an F1TENTH event at ICAUS 2022; the NPU course 智能无人系统综合设计 uses tianbot_mini, not F1TENTH. / Team of the NPU Intelligent Unmanned Systems Laboratory ... |
| 19 | PUT team (Institute of Robotics and Machine Intelligence) | Poznan University of Technology | Poland | lab team | 2023 | [put.poznan.pl](https://put.poznan.pl/en/artykul/trzecie-miejsce-politechniki-poznanskiej-na-miedzynarodowych-zawodach-formuly-110) | confirmed | Later raced as PUT IDEAS (ICRA 2024, per lead; not verified here) / Supervised student team; 'IDEAS' name from the Teams DB not on the page. |
| 20 | Boiler Autonomy | Purdue University | USA | team (kind not stated) | 2026 | [engineering.purdue.edu](https://engineering.purdue.edu/CCE/AboutUs/News/Transportation_Features/purdue-team-places-7th-in-maiden-entry-at-28th-international-roboracer-competition) | confirmed | Faculty-advised, two students (intern + grad); club vs lab not stated. Teams DB also lists 'Roboracer @ Purdue', not found. |
| 21 | Roboracer @ Purdue | Purdue University in Indianapolis | United States | club | 2025-2026 | [github.com](https://github.com/Roboracer-Purdue/roboracer-purdue) | confirmed | Club README: 'Autonomous racing club, Purdue University in Indianapolis', advised by Lingxi Li, P10 at IV 2026; probably the RacingJags entry in the Teams DB (Purdue University Indianapolis, IV 2026). |
| 22 | 무인질주 (Mu-in Jil-ju) | Pusan National University | South Korea | club | 2026 | [pusan.ac.kr](https://www.pusan.ac.kr/kor/CMS/Board/Board.do?mCode=MN109&mode=view&board_seq=1507196) | confirmed | - |
| 23 | Ingenuity Labs Racing | Queen's University | Canada | lab team | 2025-2026 | [ingenuitylabs.queensu.ca](https://ingenuitylabs.queensu.ca/research/student-activities/ingenuity-labs-racing) | confirmed | Queen's graduate lab team; no course / Graduate-student team under the Ingenuity Labs Research Institute 'Student Activities'. |
| 24 | C.A.T | Seoul National University | South Korea | course team | 2020 | [ece.snu.ac.kr](https://ece.snu.ac.kr/ece/news?md=v&bbsidx=50704) [github.com](https://github.com/Creative-Autonomous-Tractor/team_cat) | confirmed | '담당조교' (TA in charge) hints at a course but none is named. / Org links an SNU ECE news item that returned 404. |
| 25 | SFU Racerbot | Simon Fraser University | Canada | club | 2026 | [github.com](https://github.com/sfu-racerbot) [sfuracerbot.ca](https://sfuracerbot.ca/) [github.com](https://github.com/sfu-racerbot/racerbot-docs) | confirmed | club teaches the RoboRacer labs internally / Uses the RoboRacer coursekit labs for member onboarding. |
| 26 | Technion F1Tenth Robotics Team (F1Tech) | Technion - Israel Institute of Technology | Israel | lab team | 2022-2023 | [crml.eelabs.technion.ac.il](https://crml.eelabs.technion.ac.il/projects/technion-f1tenth-autonomous-racing-team/) [github.com](https://github.com/Technion-F1Tenth/F1Tech) | confirmed | Student team hosted as a CRML lab project (student projects lab). |
| 27 | Atlas Autoware | Thomas Jefferson High School for Science and Technology (TJHSST) | USA | club | 2022-2026 | [atlasautoware.org](https://atlasautoware.org/) [github.com](https://github.com/AtlasAutoware/carv2) | confirmed | High-school club (Northern Virginia); George Mason University listed as lab sponsor. |
| 28 | TMU Velocity | Toronto Metropolitan University | Canada | club | 2026 | [github.com](https://github.com/povolom/TMU-Velocity-Labs) [torontomu.ca](https://www.torontomu.ca/autonomous-vehicles-lab/velocity/) [github.com](https://github.com/eleanortien/TMU_Velocity_Application) | confirmed | club onboarding uses coursekit labs / Started as lab initiative (AVL), now MUES design team. Uses coursekit labs as admission/onboarding. tmuvelocity.ca did not resolve. |
| 29 | Scuderia Segfault | TU Wien | Austria | lab team | 2024-2026 | [tuwien.at](https://www.tuwien.at/inf/scuderia-segfault/) | confirmed | years = span of news items on the page; team may be older |
| 30 | HMcar / UNICORN Racing | UNIST | South Korea | lab team | 2022-2026 | [unist.ac.kr](https://www.unist.ac.kr/unist/center/news.do?mode=view&articleNo=244351&article.offset=0&articleLimit=9) [kpinews.kr](https://kpinews.kr/newsView/1065574828996021) [metroseoul.co.kr](https://www.metroseoul.co.kr/article/20260612500106) | confirmed | HMC lab also organized the 3rd F1Tenth Korea Championship 2024 (hmc.unist.ac.kr/?p=2090). / Press article based on a UNIST release; UNIST news pages redirected to the homepage. Earlier 2nd at ICRA 2025 per search ... |
| 31 | UniBo Motorsport (UBM Racing) autonomous 1:10 team | University of Bologna | Italy | club | 2025-2026 | [magazine.unibo.it](https://magazine.unibo.it/it/articoli/doppio-podio-per-lalma-mater-ai-mondiali-di-guida-autonoma-di-vienna) [apisito.ubm.zone](https://apisito.ubm.zone/api/articles?filters[title][$containsi]=tenth) [motorsport.unibo.it](https://motorsport.unibo.it/?p=10381) | confirmed | No Unibo course found / UniBo Motorsport is the university's student Formula Student team; F1 Tenth is its driverless sub-project. Search snippet claims a 2025 Atlanta win, not verified. |
| 32 | LAMARRacing | University of Bonn | Germany | lab team | 2024-2026 | [uni-bonn.de](https://www.uni-bonn.de/en/news/bonner-studierende-gewinnen-mit-autonomem-rennwagen) [hrl.uni-bonn.de](https://www.hrl.uni-bonn.de/research/lamarracing-autonomous-racing-research-and-education-at-the-hrl) | confirmed | supported by the Lamarr Institute / Lab-hosted student team that grew out of a study project (course-like). Funded by the Lamarr Institute. |
| 33 | Triton AI F1Tenth Team | University of California San Diego | USA | club | 2024-2026 | [tritonai.org](https://tritonai.org/teams/f1tenth) [tritonai.org](https://tritonai.org/) [github.com](https://github.com/Triton-AI-Training) | confirmed | Club trains members with F1TENTH lab 1 via GitHub Classroom (fa24). Teams DB lists 'UCSD Triton-AI'. / Club also ran fa24 training via GitHub Classroom on the f1tenth lab1 template (lead from caller, not re-verified) |
| 34 | F1Tenth @ UCI | University of California, Irvine | USA | club | 2024-2026 | [zotspot.uci.edu](https://zotspot.uci.edu/F1T/club_signup) [uci-f1tenth.github.io](https://uci-f1tenth.github.io/) [github.com](https://github.com/uci-f1tenth) | confirmed | Teams DB team 'AutoZots (UC Irvine)' is probably this club; not confirmed on the site. / UCI EECS senior project 'F1/10 Autonomous Racing' existed (srproj.eecs.uci.edu/node/296, portal retired, 503) Not opened (search ... |
| 35 | UCSB EE senior design RoboRacer teams | University of California, Santa Barbara | USA | course team | 2024-2026 | [ece.ucsb.edu](https://www.ece.ucsb.edu/news/all/2025/jun-2-mon-see-4-teams-ee-senior-designed-110th-scale-f1-vehicles-race) | confirmed | Course fact: UCSB ECE 188 senior capstone offers an F1TENTH project (search result courses.ece.ucsb.edu ECE188 'F1TENTH_2025-26.pdf', not opened); a 2026 RoboRacer flyer also exists. |
| 36 | F1Tenth UCF (CAVREL RoboRacer team) | University of Central Florida | United States | club | 2024-2025 | [github.com](https://github.com/F1Tenth-UCF/F1Tenth-UCF.github.io) [cecs.ucf.edu](https://www.cecs.ucf.edu/ece-masters-student-drives-innovation-with-ai-racer-club/) [airacer.cecs.ucf.edu](https://airacer.cecs.ucf.edu/about-us/) | confirmed | Now 'AI Racer'. Race entries as UCF-CAVREL (Fallah's lab), so club + lab hybrid; a senior-design course team came first. Article says formed 'last fall' (i.e. 2025) but the GitHub org dates from Aug 2024. ... |
| 37 | F1Tenth project, Ruchkin lab (TEA Lab) | University of Florida | United States | lab team | 2021-2025 | [iot.institute.ufl.edu](https://iot.institute.ufl.edu/2025/02/f1tenth-driving-1st-place-demo/) [github.com](https://github.com/mustafapoonawala95/F1TENTH-University-Of-Florida) | confirmed | No UF course found |
| 38 | Gator Autonomous Racing (GAR) | University of Florida | USA | club | 2025-2026 | [tea.ece.ufl.edu](https://tea.ece.ufl.edu/ece-showcases-new-club-gator-autonomous-racing/) [tea.ece.ufl.edu](https://tea.ece.ufl.edu/demos-at-hwcoe-celebration-and-deans-tailgate/) [tea.ece.ufl.edu](https://tea.ece.ufl.edu/) | confirmed | Club spun off from UF TEA Lab (Ivan Ruchkin). The lab itself (Trustworthy-Engineered-Autonomy-Lab GitHub) races/researches on RoboRacers as a lab team. |
| 39 | Zancle E-Drive | University of Messina | Italy | club | 2024 | [unime.it](https://www.unime.it/notizie/f1tenth-unime-11esima-posizione-ad-una-competizione-internazionale-sullai-e-guida-autonoma) | confirmed | - |
| 40 | HiPeRT Lab racing team (UNIMORE Racing) | University of Modena and Reggio Emilia (UNIMORE) | Italy | lab team | 2019-2026 | [hipert.unimore.it](https://hipert.unimore.it/) [github.com](https://github.com/HiPeRT/unimore_roboracer) [github.com](https://github.com/HiPeRT/ifac2020_f1tenth_submission) | confirmed | Brief lists HiPeRT as 2020 winner; the lab page itself says it won the New York 2019 edition. Teams DB name 'UNIMORE Racing'. / No Unimore course page tying a course to F1TENTH found. |
| 41 | LoboRacers (UNM MARHES Lab) | University of New Mexico | USA | lab team | 2016 | [marhes.unm.edu](https://marhes.unm.edu/2016/01/01/f1-10-racing/) [ece.unm.edu](https://ece.unm.edu/news/2017/01/ece-loboracers-place-2nd-at-esweek.html) | confirmed | Teams DB 'Lobo Racers (University of New Mexico)': no evidence found of the current team beyond 2016. / Sandia-supported student team; no course |
| 42 | UNC Chapel Hill CS F1TENTH team | University of North Carolina at Chapel Hill | USA | lab team | 2019 | [cs.unc.edu](https://cs.unc.edu/news-article/unc-cs-team-wins-f1-10-autonomous-racing-challenge/) [web.archive.org](https://web.archive.org/web/20260515201552/https://endeavors.unc.edu/the-fast-and-the-autonomous/) | confirmed | Race winner 2019 (Montreal). Article also lists 2019 entrants: UT Arlington, UCF, Vanderbilt, Modena, SeoulTech, UPenn. / Research/lab team, no UNC course found; endeavors.unc.edu unreachable live, read via Wayback Not ... |
| 43 | Penn RoboRacer Club (IEEE @ Penn RoboRacer) | University of Pennsylvania | USA | club | 2026 | [ieee.engineering.upenn.edu](https://ieee.engineering.upenn.edu/roboracer/) [github.com](https://github.com/keshav1304/roboracer-club) [ieee.engineering.upenn.edu](https://ieee.engineering.upenn.edu/roboracer/) | confirmed | Club evidence is a member repo with the club site source (2026); the IEEE @ Penn page shows a student-branch RoboRacer project with the same organizer. Deployed site roboracer-mini.vercel.app returned 404. |
| 44 | Pitt RAS F1Tenth | University of Pittsburgh | United States | club | 2021-2022 | [github.com](https://github.com/Pitt-RAS/ras-f1tenth) [raspitt.org](http://raspitt.org/) | confirmed | Project team of the student RAS club; Teams DB 'PITT' may be a later team, not verified as the same. |
| 45 | URI Autonomous Racing Club | University of Rhode Island | USA | club | - | [web.uri.edu](https://web.uri.edu/engineering/autonomous-racing-club/) | confirmed | Not in the leads list; found by search. |
| 46 | Cavalier Autonomous Racing (UVA F1/10 team) | University of Virginia | USA | lab team | 2015- | [autonomousracing.dev](https://autonomousracing.dev/who-we-are) | confirmed | Now mainly a full-scale (IAC) team; F1TENTH roots via Madhur Behl's lab. Course fact: linklab-uva/f1tenth-course-labs repo 'F1/10 Autonomous Racing Course at the University of Virginia' (2020). |
| 47 | WATonomous Micro Autonomy (F1Tenth team) | University of Waterloo | Canada | club | 2025-2026 | [watonomous.ca](https://www.watonomous.ca/projects/micro) [github.com](https://github.com/WATonomous/wato_f1tenth) | confirmed | WATonomous is Waterloo's student autonomous-vehicle design team; the 'student design team' wording was not on the fetched pages. / Waterloo design team; research use also via CL2-UWaterloo/f1tenth_ws; no Waterloo course ... |
| 48 | VAUL (Véhicule autonome de l'Université Laval) | Université Laval | Canada | club | 2022-2024 | [crti.ift.ulaval.ca](https://crti.ift.ulaval.ca/wp-content/uploads/2024/09/VAUL-Presentation_DinerDesClubs_A24.pdf) [nouvelles.ulaval.ca](https://nouvelles.ulaval.ca/2023/10/13/premier-a-la-course-automobile-en-format-reduit-f1-tenth-a:834640e1-9b78-4e37-bc0f-c32916724659) | confirmed | Student club supervised by Norlab. Racing car since 2022. Later results (ICRA 2024 win) seen only in search snippets. |
| 49 | WVU F1Tenth / RoboRacer team (WVU Mountaineer) | West Virginia University | USA | lab team | 2024-2026 | [mybuckhannon.com](https://www.mybuckhannon.com/wvu-roboracer-team-builds-race-cars-that-have-minds-of-their-own/) [media.statler.wvu.edu](https://media.statler.wvu.edu/news/2024/09/24/wvu-f1tenth-team-places-second-in-international-competition) [mybuckhannon.com](https://www.mybuckhannon.com/wvu-roboracer-team-places-third-overall-at-roboracer-autonomous-racing-international-competition-in-michigan/) | confirmed | 30+ members; feeds from course and capstone |
| 50 | CMU MRSD Team E PatrolKnight | Carnegie Mellon University | USA | course team | 2026 | [github.com](https://github.com/patrol-knight/f1tenth_demo) [mrsdprojects.ri.cmu.edu](https://mrsdprojects.ri.cmu.edu/2026teame/) | likely | Capstone team using an F1TENTH car as its robot base, not a racing team. |
| 51 | TaYo Eagles | Chungbuk National University | South Korea | lab team | 2024-2025 | [cbnu.ac.kr](https://www.cbnu.ac.kr/www/selectBbsNttView.do?key=549&bbsNo=14&nttNo=162661) | likely | - |
| 52 | Team iCart | Clemson University (International Center for Automotive Research) | USA | team (kind not stated) | 2020 | [github.com](https://github.com/BhooshanDeshpande/IROS2020-TeamiCart) | likely | Student repo; virtual race only. |
| 53 | Dong-A University Smart Mobility team | Dong-A University | South Korea | course team | 2024 | [dhnews.co.kr](http://dhnews.co.kr/news/view/1065579199145221) | likely | Team name per article: 확불살라삔다. Press source. |
| 54 | F1 Tenth team, Duke MEMS | Duke University | United States | lab team | 2024 | [github.com](https://github.com/qh65/F1-Tenth-Duke) | likely | Could be tied to a Duke robotics MEng course; not verified |
| 55 | Polito's Racing (AIROS Club) | Escuela Superior Politécnica del Litoral (ESPOL) | Ecuador | club | 2026 | [github.com](https://github.com/hector-la/politos-racing-roboracer-ecuador-2026) [github.com](https://github.com/RAMEL-ESPOL/Roboracer) [github.com](https://github.com/hector-la/AutoDRIVE_DevKit_Starter) | likely | Student repo + lab org; RoboRacer Ecuador event at IRO Ecuador 2026. / Member repo, not the club's own page. IRO Ecuador 2026 is a national RoboRacer event (rules hosted by UCSG). |
| 56 | IDEA_LAB team | Gyeongsang National University | South Korea | lab team | 2024 | [gnu.ac.kr](https://www.gnu.ac.kr/cse/na/ntt/selectNttInfo.do?mi=17233&nttSn=2239987) [dhnews.co.kr](https://www.dhnews.co.kr/news/view/1065572301594248) | likely | GitHub miroo4517/2025-Q4-GNU-F1TENTH-* repos are a later GNU project. / Press article from a university release; Teams DB 'IDEA LAB (Gyeongsang)'. |
| 57 | MIRU (Mobile Intelligent Robotics Union) | Hanyang University | South Korea | club | 2025 | [engr.hanyang.ac.kr](https://engr.hanyang.ac.kr/news/students.php?ptype=view&idx=5955) | likely | Page itself not opened. |
| 58 | AiMotionLab F1TENTH (HUN-REN SZTAKI) | HUN-REN Institute for Computer Science and Control (SZTAKI) | Hungary | lab team | - | [github.com](https://github.com/AIMotionLab-SZTAKI/AIMotionLab-F1TENTH) | likely | Research-institute lab, not a university; Teams DB lists 'HUN-REN SZTAKI' as a competition team. |
| 59 | VILAB | Kookmin University | South Korea | lab team | 2024 | [cms.kookmin.ac.kr](https://cms.kookmin.ac.kr/vilab/menu/gallery.do?mode=view&articleNo=5915697) | likely | Kim Jongchan (Kookmin) is in the RoboRacer Korea Academy. |
| 60 | RoboRedBacks | RMIT University | Australia | club | 2025 | [github.com](https://github.com/roboredbacks2025/F1TENTH2025) | likely | Only Oceania lead found; no Australian/NZ course found. / Team account with one placeholder repo; no club or course page found by search. |
| 61 | SeoulTech MSDE f1tenth team | Seoul National University of Science and Technology (SeoulTech) | South Korea | team (kind not stated) | 2019-2020 | [github.com](https://github.com/msde-f1-10/msde_fgm) [cs.unc.edu](https://cs.unc.edu/news-article/unc-cs-team-wins-f1-10-autonomous-racing-challenge/) | likely | MSDE likely a department/lab; kind not stated. |
| 62 | HUMDA-SZE 1 and HUMDA-SZE 2 | Széchenyi István University | Hungary | lab team | 2023 | [web.archive.org](https://web.archive.org/web/20251212034035/https://iros2023-race.f1tenth.org/results.html) | likely | institution inferred from 'SZE'; see Horváth et al. 2024 (Széchenyi) teaching ROS 2 and AVs |
| 63 | TUM Faster Than Real-Time | Technical University of Munich | Germany | lab team | 2026 | [github.com](https://github.com/raphajaner/TUM_FTRT_simulator) | likely | personal repo, not an org page / Only a simulator fork; no evidence of racing. TUM AVS organized the ICRA 2023 F1TENTH race (search snippet). |
| 64 | UCI ECPS F1TENTH Team (Resilient CPS Lab) | University of California, Irvine | United States | lab team | 2023 | [github.com](https://github.com/ECPS-F1TENTH-Team) | likely | - |
| 65 | Team Galactic Racing (UNLV CS 489) | University of Nevada, Las Vegas | USA | course team | 2024 | [github.com](https://github.com/ProjectZuki/GalacticRacing) | likely | Student repo. Course fact: UNLV CS 489 used the F1TENTH labs (2024). |
| 66 | SDU F1/10th Autonomous Racing Car student teams | University of Southern Denmark (SDU) | Denmark | club | - | [sdu.dk](https://www.sdu.dk/en/forskning/sdu-digital-and-high-frequency-electronics/competitions) | likely | page ties the teams to Formula Student Driverless; kind is student project teams run by the section |
| 67 | UVic Connected and Autonomous Vehicle Club | University of Victoria | Canada | club | 2024-2026 | [uvic.ca](https://www.uvic.ca/ecs/ece/current/graduate/events/event.php?id=1297) [events.vtools.ieee.org](https://events.vtools.ieee.org/m/549833) | likely | Club named only in a seminar abstract; no club page found. |
| 68 | Vanderbilt F1Tenth (VeriVITAL lab) | Vanderbilt University | United States | lab team | 2019-2024 | [github.com](https://github.com/verivital/F1TenthVanderbilt) | likely | - |
| 69 | MMS Autonomous |  |  | team (kind not stated) | 2025 | [github.com](https://github.com/engarafa55/F1TENTH-ICRA2025-MMS) | weak | Likely a sim-racing (AutoDRIVE) entry; institution unknown. |
| 70 | Team CALVIN (Warsaw) |  | Poland | team (kind not stated) | 2018 | [ieeetv.ieee.org](https://ieeetv.ieee.org/technology/f1-10-autonomous-racing-competition-2018) | weak | Page names the winners but not the team name 'CALVIN' or an institution; the brief's name is unverified. |
| 71 | Team Defianz Racing (TDR-SDC) | Delhi Technological University (inferred from defianz-dtusdc.com) | India | club | 2022 | [github.com](https://github.com/TDR-SDC/F1tenth_simulator-ASSIGNMENT) | weak | Formula Student Driverless team that uses the F1TENTH simulator only as a recruiting assignment; no evidence it builds or races F1TENTH cars. Team site did not respond. |
| 72 | Drexel F1TENTH | Drexel University | United States | club | 2020 | [github.com](https://github.com/drexel-f1tenth/docs) | weak | Club vs senior design unknown |
| 73 | Schmalkalden Autonomous Racing (SAR) | Hochschule Schmalkalden (inferred) | Germany | team (kind not stated) | 2026 | [github.com](https://github.com/Daino666/blip) | weak | Member repo only; institution inferred from the team name; web search found nothing. |
| 74 | Khalifa University AV Lab RoboRacer team | Khalifa University | United Arab Emirates | lab team | 2026 | [github.com](https://github.com/AV-Lab/roboracer) | weak | Shows lab RoboRacer sim work only; Teams DB 'KU F1tenth Team (Khalifa University)' not confirmed as this lab. |
| 75 | Newcastle University F1TENTH initiative | Newcastle University | United Kingdom | lab team | 2024-2026 | [github.com](https://github.com/tsakman23/f1tenth-ros2-newcastleuniversity) | weak | student repo; no course or module named |
| 76 | RTEC F1Tenth (Real-Time Control Systems Lab) | San Diego State University | United States | lab team | 2025 | [github.com](https://github.com/rtecf1tenth) [github.com](https://github.com/cs496-f1tenth/f1tenth) | weak | SDSU course tie unverified |
| 77 | SIGRobotics F1Tenth | University of Illinois Urbana-Champaign | United States | club | - | [github.com](https://github.com/Udog-ILLINOIS/f1tenth_workspace) | weak | - |
| 78 | F1Tenth at University of Maine | University of Maine | United States | lab team | 2026 | [github.com](https://github.com/le-manchot-UMO/f1tenth-umo) | weak | no course named |

### Appendix: other competition teams in the Teams DB

Teams that attended at least one RoboRacer competition (2024 to 2026) per the
RoboRacer_Teams_DB sheet (2026-09-25 export) and have no club row above. Their
affiliation comes from the sheet; no page was found that says whether they
are clubs, course teams or lab teams. Six TU Wien entries at ICRA 2026
(404_DriverNotFound, ARC RIDERS, Brake Check Buddies, Min Verstappen,
Quicksilver, SummerArcBoys) fit the TU Wien course: the TISS record for the
2026 summer term of 191.119 says its final race would be at ICRA 2026. Several Penn entries
(Upenn Team 1 to 4, 404 Racers, Lyapunov FC, Penn McQueen, UPenn Bit
Shifters) look like ESE 6150 teams, but no page says so.

| # | Team | Affiliation (Teams DB) | Country | Events attended |
|---|---|---|---|---|
| 1 | Binblur | Binblur Inc | - | ICRA 2025 |
| 2 | Blue Rabbit | California State University of Long Beach (CSULB) | United States | IV 2024 |
| 3 | Tartan Racing | Carnegie Mellon University | United States | IV 2026 |
| 4 | JKU-ITS | Department Intelligent Transport Systems, JKU | Austria | ICRA 2026 |
| 5 | Yellow Jacket Racers | Georgia Tech | United States | ICRA 2025, IV 2025 |
| 6 | Celeritas | German International University in Berlin (GIU Berlin) | Germany | ICRA 2026 |
| 7 | iASL-Gifu | Gifu University | Japan | ICRA 2024 |
| 8 | CSLab | Gyeongsang National University | South Korea | IV 2024 |
| 9 | Success-aMAP | Halla University | South Korea | IV 2024 |
| 10 | BREATH | Handong Global University | South Korea | IV 2024 |
| 11 | Watchmybutt | Huzhou Institute, Zhejiang University, Huzhou 313000, China. and Xi'an Jiaotong University | China | ICRA 2024 |
| 12 | Drunken Driving | Incheon National University | South Korea | IV 2024 |
| 13 | UNITA | Incheon National University | South Korea | IV 2024 |
| 14 | Dzik One | Independent | Poland | ICRA 2025, IV 2025, IROS 2024, ICRA 2024 |
| 15 | JRacer | Independent | United States | ICRA 2025 |
| 16 | SeDriCa-UMIC | Indian Institute of Technology Bombay | India | CDC 2024 |
| 17 | Quick-Witted | Individual | Netherlands | ICRA 2026 |
| 18 | Same Mess Again | Individual | India | ICRA 2026 |
| 19 | RCV-FORMULA | INHA University from South Korea | South Korea | ICRA 2026, ICRA 2025 |
| 20 | 338 | Inje University | South Korea | IV 2024 |
| 21 | F1T_Lab | Inje University | South Korea | IV 2024 |
| 22 | SpreeSpeed | Just representing myself | - | CDC 2024 |
| 23 | SAI | Kangwon National University | South Korea | IV 2024 |
| 24 | 빐른놈들 (Fast guys) | Kangwon National University | South Korea | IV 2024 |
| 25 | KGXepRacing | KGiSL Institute of Technology | India | IV 2024 |
| 26 | KU F1tenth Team | Khalifa University | United Arab Emirates | IROS 2024 |
| 27 | Buffalo Wheel | Korea Maritime & Ocean University (KMOU) | South Korea | IV 2024 |
| 28 | AutoFlux | Mount Hebron High School | United States | ICRA 2025, IV 2025 |
| 29 | JUS10 | N/A | - | ICRA 2025 |
| 30 | SAGOL | N/A | South Korea | ICRA 2026, IROS 2024 |
| 31 | RacingJags | Purdue University Indianapolis | United States | IV 2026 |
| 32 | F1NESSE - Formula 1 Neuro-Enhanced System for Smart Execution | Radboud University | Netherlands | CDC 2024 |
| 33 | flyby | robo4you / TU Wien / Flyby Racing GesbR | Austria | ICRA 2026 |
| 34 | tron racing | RobotX Workshops | Germany | ICRA 2026 |
| 35 | A^2RT | San Diego State University | United States | ICRA 2025 |
| 36 | CIRL | Seoul National University of Science and Technology | South Korea | IV 2024 |
| 37 | RILy Fast | Singapore University of Technology and Design | Singapore | ICRA 2024 |
| 38 | GROMIT | Sookmyung Women's University | South Korea | IV 2024 |
| 39 | Dallas Formula Racing | The University of Texas at Dallas | United States | IV 2026 |
| 40 | Phoenix Racing | TU Dortmund University | Germany | ICRA 2026 |
| 41 | 404_DriverNotFound | TU Wien | Austria | ICRA 2026 |
| 42 | ARC RIDERS | TU Wien | Austria | ICRA 2026 |
| 43 | Brake Check Buddies | TU Wien | Austria | ICRA 2026 |
| 44 | Min Verstappen | TU Wien | Austria | ICRA 2026 |
| 45 | Quicksilver | TU Wien | Austria | ICRA 2026 |
| 46 | SummerArcBoys | TU Wien | Austria | ICRA 2026 |
| 47 | AutoZots | UC Irvine | United States | IV 2026 |
| 48 | Mi3 - UC Merced | University of California, Merced | United States | IV 2026 |
| 49 | Riverside Racers | University of California, Riverside | United States | IV 2026, ICRA 2025 |
| 50 | KU-CSL | University of Kansas | United States | IROS 2024 |
| 51 | KUF1Tenth | University of Kansas | United States | IV 2025 |
| 52 | 404 Racers | University of Pennsylvania | United States | IV 2026 |
| 53 | Lyapunov FC | University of Pennsylvania | United States | ICRA 2024 |
| 54 | Thunderbolt UPenn | University Of Pennsylvania | United States | IV 2026 |
| 55 | UPenn Autonomous Racing | University of Pennsylvania | United States | ICRA 2026, IV 2026 |
| 56 | Turtleship | University of Seoul (South Korea) | South Korea | CDC 2024 |
| 57 | AIR UOP | University of the Pacifc | United States | IV 2026 |
| 58 | Arcus | Université de Sherbrooke | Canada | ICRA 2026 |
| 59 | INIvincible | UZH / ETHZ | Switzerland | CDC 2024 |
| 60 | 머스탱 (Mustang) | Yonam Institute of Technology | South Korea | IV 2024 |
| 61 | 역대급 에이스 (Legendary Ace) | Yonam Institute of Technology | South Korea | IV 2024 |
| 62 | DDRX | Zhejiang University | China | IV 2024 |
| 63 | DEOXSYS UPenn | - | United States | IV 2025 |
| 64 | Penn McQueen | - | United States | IV 2025 |
| 65 | UPenn Bit Shifters | - | United States | IV 2025 |
| 66 | Upenn Team 1 | - | United States | ICRA 2025 |
| 67 | Upenn Team 2 | - | United States | ICRA 2025 |
| 68 | Upenn Team 3 | - | United States | ICRA 2025 |
| 69 | Upenn Team 4 | - | United States | IV 2025 |

## (c) Counts

| | confirmed | likely | weak | total |
|---|---|---|---|---|
| University course rows | 34 | 23 | 13 | 70 |
| Clubs and student teams | 49 | 19 | 10 | 78 |

- Institutions with at least one confirmed course: 32 (11 countries).
  With confirmed or likely: 51. Any confidence: 63.
- Programs, camps and events: 12.
- Teams DB teams that attended an event: 95 (26 matched to a club row,
  69 in the appendix).

## (d) What could not be reached or confirmed

Pages that would not open (bot walls, logins, dead hosts, rate limits):

- http://archive.org/wayback/available: HTTP 429 rate-limited most of the session (old f1tenth.org course pages not checked); individual Wayback snapshots did load.
- http://ece.snu.ac.kr/community/news?bm=v&bbsidx=50704: 404 (SNU Team C.A.T. news).
- http://f1tenth.cecs.ucf.edu/: connection timed out twice (search results show it exists: 'Welcome to F1Tenth @ UCF').
- http://web.archive.org/: Wayback rate-limited (429) and then 'Temporarily Offline' late in the session; SDU live page and courses.f1tenth.org could not be checked against archives.
- http://www.defianz-dtusdc.com/: no response (Team Defianz Racing).
- https://abeek.uos.ac.kr/kr/center/center/view/6791/page/1?search_cate=58: JS cookie challenge (slowAES), no content without a browser.
- https://aix.ssu.ac.kr/notice_view.html?idx=1455: connection timeout / ECONNREFUSED from this network.
- https://api.github.com/search/repositories: GitHub search API rate limit exhausted (shared); core API still used.
- https://archive.org/wayback/available: 429 rate limit; CDX API worked.
- https://catalog.clemson.edu/: acalog search returned HTTP 202 empty body (bot challenge).
- https://cecas.clemson.edu/armlab/: connection failed.
- https://courses.f1tenth.org/courses/course-v1:Technical-University-of-Munich+15weeks+2021_01/about: courses.f1tenth.org no longer resolves (search index shows an 'F1Tenth - TUM' 15-week course run 2021_01 on the old Open edX); Wayback rate-limited at the time.
- https://endeavors.unc.edu/the-fast-and-the-autonomous/: connection failed live; Wayback copy used.
- https://engineering.virginia.edu/news-events/news/racing-learn: HTTP 403 to curl, TLS error in WebFetch (UVA 2023 article naming CS4501 and SYS 4582 cross-list).
- https://events.vtools.ieee.org/m/480399: JS-rendered; Pre-University Student RoboRacer (F1Tenth) competition at TEDx Nijmegen, May 2025 (search snippet only).
- https://f1tenth-ucf.github.io/: 404.
- https://home.roboticlab.eu/en/safeav/handson/uc/f1tenth: SafeAV 'Use Case #2 F1TENTH' hands-on page (Erasmus+ network) requires login.
- https://news.unist.ac.kr/?p=32088: old UNIST news WordPress now redirects to the homepage; Wayback throttled (429).
- https://news.unist.ac.kr/?p=37108: UNIST news pages redirect to the homepage (UNICORN / HMcar articles).
- https://penntoday.upenn.edu/news/penn-engineering-grasp-lab-roboracer-course-roboracer-track: HTTP 403; same story read on me.upenn.edu.
- https://repository.upenn.edu/bitstreams/9daff9b4-a015-4fc7-b94d-d65b886e3da9/download: SIGCSE 2020 full text behind a JS page; abstract read via OpenAlex.
- https://robo4you.at/: JavaScript-rendered site; no course text in the HTML.
- https://roboracer-mini.vercel.app/: 404 (Penn RoboRacer Club site).
- https://rosap.ntl.bts.gov/view/dot/78691/dot_78691_DS1.pdf: returns an HTML bot page, not the PDF; same report read via ppms.cit.cmu.edu Mangharam_Rahul_445.pdf.
- https://slab.sites.ucsc.edu/?p=2193: 410 Gone (UCSC Slugbotics 'Formula F1/10' sister project).
- https://slab.sites.ucsc.edu/ros/: HTTP 410; read via Wayback.
- https://srproj.eecs.uci.edu/node/296: UCI senior projects portal retired (HTTP 503); page titled 'F1/10 Autonomous Racing'.
- https://tiss.tuwien.ac.at/course/courseDetails.xhtml?courseNr=191119&semester=2026S: TISS HTML needs a session (error page); used the public TISS XML API instead; lecturer names not resolvable from API oids.
- https://web.archive.org/: Wayback availability API and some captures returned 429 (rate limited, shared with other agents).
- https://web1.eng.famu.fsu.edu/me/senior_design/2024/team503/: no response (FAMU-FSU Team 503 'Formula 1/10th Vehicle' senior design, 2024).
- https://www.baidu.com/s: Baidu search returns a security captcha after one query; Chinese course pages not searchable from here.
- https://www.mdpi.com/2673-4591/79/1/49: HTTP 403 to curl and WebFetch; abstract read via OpenAlex.
- https://www.seas.upenn.edu/~rahulm/papers/Mangharam-Teaching-2023.pdf: returns HTML instead of PDF (Mangharam teaching statement listing adopting universities).
- https://www.tmuvelocity.ca/: did not resolve.

Gaps that remain:

- **courses.f1tenth.org** is offline, but the Wayback Machine holds its 2021
  course pages (captured 2021 to 2024); the 16 university runs above were read
  from those captures. None of them shows class dates.
- **No first-party page** for these competition teams' kind or campus home:
  Tartan Racing (CMU), Yellow Jacket Racers (Georgia Tech), Riverside Racers
  (UC Riverside), A^2RT (San Diego State), KU-CSL and KUF1Tenth (Kansas), AIR
  UOP (Pacific), Dallas Formula Racing (UT Dallas), Mi3 (UC Merced), Arcus
  (Sherbrooke), Phoenix Racing (TU Dortmund), Celeritas (GIU Berlin), JKU-ITS,
  SeDriCa-UMIC (IIT Bombay), Turtleship (University of Seoul), F1NESSE
  (Radboud), iASL-Gifu, RILy Fast (SUTD), the two São Paulo teams, and most
  registered-only teams.
- **Course codes not found**: Poznan (only the instructors' paper), Weber
  State (course site without a code), Clemson (AuE 8360 from one student repo;
  the Clemson catalog is behind a bot wall), WVU (CPE 493 is a special-topics
  number), Korea Aerospace University.
- **Chinese course pages** were not searchable (Baidu captcha); Tsinghua and
  SJTU rest on one seminar notice. Japanese searches found competitions
  (F1-tenth JAPAN / MAGP) but no credit course.
- **GitHub search** hit its rate limit mid-run for three agents; the coursekit
  forks and 30 searches (598 repos) were read before that.
- **Wayback** rate-limited the agents; the f1tenth.org pages from 2016 to 2023
  name no list of teaching universities beyond the homepage paragraph above.

## (e) Suggested wording for "Taught on campus"

Uses confirmed rows only, and only courses that teach the full coursekit or
are built on the car. Short names are labels for the page; the JSON keeps the
full names. Facts in this copy still need Cedric's approval (content skill).

**Heading:** Taught on campus

**Lead (one line):** Universities teach RoboRacer for credit, under their own
course numbers. Here are the courses we can point to.

**Cards or rows (institution, course, years seen):**

- University of Pennsylvania: ESE 6150 RoboRacer Autonomous Racing Cars (since 2016)
- Carnegie Mellon University: 16-663 F1Tenth Autonomous Racing (2023 to 2026)
- University of Virginia: CS 4501 F1/10 Autonomous Racing (2018 to 2024)
- Lehigh University: ECE 306 / ECE 406 Autonomous Driving and Robotic Racing (2021 to 2023)
- The University of Texas at Austin: CS 378 F1/10 Autonomous Driving (2020 to 2023)
- Oregon State University: F1/10: Autonomous Racing, ECE 499/599 and CS 419/519 (2020)
- University of Nevada, Las Vegas: CS 489/689 Autonomous Racing: A Cyber-Physical Perspective (since 2023)
- TU Wien: 191.119 Autonomous Racing Cars (every summer since 2020)
- Technical University of Munich: F1TENTH: Autonomous Driving Hands-on (every winter since 2023)
- ETH Zürich: 227-0085-58L P&S: Autonomous Cars and Robots (since 2022)
- UNIST: MEN491 Creating Autonomous Vehicle (since 2021)
- University of Southern Denmark: Autonomous F1-tenth Racing Student Project (2025)
- Seoul National University: Future Mobility Autonomous Driving Operation Practice (2025 to 2026)
- Clemson University, Weber State University, TU Dortmund, Georgia Tech (VIP): shown without a code or with "project course"

**Closing line, if a count is wanted (pick one, Cedric):** "Taught at
32 universities we can name, and used in many more." (this table) or "32
university courses worldwide" (Safety21 / USDOT report, 2024).

**Also on campus (optional second line):** Student clubs build RoboRacer cars at
Columbia, MIT, UC Irvine, UCF, Waterloo, Simon Fraser, Toronto Metropolitan,
Laval, ETH Zürich, NTU Singapore and more. See the clubs table for the list.

## Questions for Cedric

1. **Threshold.** Publish confirmed rows only (recommended), and only the
   full and adapted courses as cards, with capstones and modules left out or
   in one "also used in" line?
2. **TUM card.** Switch TUM to `published` with the course title "F1TENTH:
   Autonomous Driving Hands-on" and no code (0000001440 is an internal TUM
   number)? Drop the UC San Diego card, or keep it `verify`?
3. **Counts.** Show a count at all? Options: this table's confirmed
   institutions, the USDOT report's "32 university courses" (2024), or nothing
   until Rahul answers the "90+ universities" question.
4. **Old numbers at Penn.** Mention that ESE 6150 was ESE 680 (2018, 2019)
   and ESE 615 (2020 to 2022) before, or keep only ESE 6150?
5. **Korea.** Feature the Korean joint education program (LINC 3.0, eight
   universities, now RoboRacer Korea) as a program on `/learn/courses` or
   `/learn/teach`?
6. **Clubs.** Where should a clubs list live: `/learn/courses`, `/race`
   ("who competes"), or the About page? It needs a logo-permission pass if
   logos are wanted.
7. **Likely rows.** Should someone email the instructors behind the 2021
   platform runs (MIT, UC Irvine, Nebraska-Lincoln, Inha, UNIMORE, Buffalo,
   UC Santa Barbara) to confirm they taught it?

## Method and the sources that gave the most

Four research agents (US and Canada, Europe, Asia and the rest of the world,
clubs) plus the lead, 2026-10-20. Downloads stayed in the session scratchpad.
The sources that gave the most rows:

- **GitHub**: the coursekit's 32 forks, 30 repository searches (598 repos),
  course organizations (f1tenth-cmu, linklab-uva, unlv-f1, Weber-AGV,
  f1tenth-class, RoboRacer-Class), club organizations. Only public repos are
  cited.
- **University catalogs and course sites**: catalog.upenn.edu, Lehigh
  catalog, ri.cmu.edu, amrl.cs.utexas.edu, f1tenth.racing (UVA), TU Wien TISS
  API and teaching page, mos.ed.tum.de, vvz.ethz.ch, odin.sdu.dk,
  daes.cs.tu-dortmund.de, syllabus.gatech.edu, unlv.edu.
- **Instructors' papers and reports**: arXiv 2209.11181 (Betz et al., 2022;
  IEEE T-IV 2024): Rosa Zheng (Lehigh), Joydeep Biswas (UT Austin), Krzysztof
  Walas (Poznan), Madhur Behl (UVA) and Venkat Krovi (Clemson) "taught the
  course at their universities"; the Safety21 / USDOT final report (2024);
  SIGCSE 2020 (Oregon State and Penn).
- **The 2021 F1TENTH Open edX platform** via the Wayback Machine: 16
  university course runs with named staff.
- **RoboRacer's own channels**: the F1TENTH newsletter (2024-07-25: "UPenn,
  Carnegie Mellon University, and Lehigh University ... all teach the same
  course"), the old f1tenth.org homepage, `public/data/news.json` and
  `testimonies.json`.
- **Korean university notices and press** (gnu.ac.kr, ee.donga.ac.kr,
  yc.ac.kr, pusan.ac.kr, roboracer.or.kr, unist.ac.kr), fetched with curl and
  Naver because the web search tool rarely finds Korean pages.
- **Club pages and campus directories** (UCI ZotSpot, UCF, TMU, SFU, URI,
  Amrita, MIT Edgerton, Columbia), and team news on university sites.
