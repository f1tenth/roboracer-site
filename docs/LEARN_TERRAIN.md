# Learn terrain: two tracks for the Build and Learn rebuild

Status 2026-09-24, branch `revamp/p2-wayfinding`. `/build` and `/learn` stay
iframes this cycle (CLAUDE.md rule 9). This page and the `tracks` in
`public/data/paths.json` prepare the rebuild; nothing renders the tracks yet.
Every link below was opened on 2026-09-24 and answered 200
(`docs/qa/wayfinding/links.txt`).

The two ends Cedric named:

- **Get the car running** (simulate, build, system). Home: `/build`.
- **Learn the theory** (the course). Home: `/learn`.

The landing only shows the four top-level paths (`00 / Start here`: Build a
car, Learn autonomy, Race with us, Sponsor a race), and the nav's violet
"Start here" button leads there from every route. The tracks are the next
layer down, for the rebuilt pages.

## Track 1: Get the car running

| # | Stage | Step | Goes to |
|---|---|---|---|
| 01 | Simulate | Run the simulator | [f1tenth_gym_ros](https://github.com/f1tenth/f1tenth_gym_ros) (the gym behind a ROS 2 bridge). Also: the course's [simulator tutorial](https://f1tenth-coursekit.readthedocs.io/en/latest/lectures/ModuleA/tutorial2.html), [f1tenth_gym](https://github.com/f1tenth/f1tenth_gym) on its own, [AutoDRIVE](https://autodrive-ecosystem.github.io/) for the Sim Racing League |
| 02 | Build | Order the parts | [Bill of materials](https://f1tenth.readthedocs.io/en/main/getting_started/build_car/bom.html) |
| 03 | Build | Build the car | [Building the car](https://f1tenth.readthedocs.io/en/main/getting_started/build_car/index.html) (lower chassis, autonomy elements, upper chassis, wiring); on this site, [/assembly](/assembly) shows every part in 3D |
| 04 | System | Set up the Jetson | [Configure Jetson and peripherals](https://f1tenth.readthedocs.io/en/main/getting_started/software_setup/index.html) |
| 05 | System | Install the driver stack | [Driver stack](https://f1tenth.readthedocs.io/en/main/getting_started/firmware/index.html) (VESC, ROS 2 Humble, LiDAR) |
| 06 | System | Drive it | [Driving the car](https://f1tenth.readthedocs.io/en/main/getting_started/driving/index.html) (manual, odometry calibration, your own autonomous node) |

Help: the [build FAQ](https://f1tenth.readthedocs.io/en/main/getting_started/faq.html) and Slack.
The build docs quote 10 to 15 hours for steps 02 to 06, intermediate to
advanced. It sits in the JSON as `estimate` with `status: "verify"`: not on
the site until Cedric says it may be.

## Track 2: Learn the theory

| # | Step | Goes to | Labs |
|---|---|---|---|
| 00 | Pick a plan: 4 weeks (A, B, labs 1 to 4, "race ready"), 10 weeks (A to D, labs 1 to 6), 15 weeks (everything) | [Start Here](https://f1tenth-coursekit.readthedocs.io/en/latest/getting_started/index.html), [syllabus](https://f1tenth-coursekit.readthedocs.io/en/latest/introduction/syllabus.html) | |
| A | ROS 2, the car and the simulator | [Module A](https://f1tenth-coursekit.readthedocs.io/en/latest/lectures/ModuleA/index.html) | 1 ROS 2, 2 emergency braking |
| B | Reactive methods: PID, follow the gap, vehicle dynamics | [Module B](https://f1tenth-coursekit.readthedocs.io/en/latest/lectures/ModuleB/index.html) | 3 wall following, 4 follow the gap |
| C | Mapping and localization: filtering, particle filter, graph SLAM | [Module C](https://f1tenth-coursekit.readthedocs.io/en/latest/lectures/ModuleC/index.html) | 5 SLAM and pure pursuit |
| D | Planning and control: pure pursuit, RRT, splines | [Module D](https://f1tenth-coursekit.readthedocs.io/en/latest/lectures/ModuleD/index.html) | 6 motion planning |
| E | Vision: classical and learned perception | [Module E](https://f1tenth-coursekit.readthedocs.io/en/latest/lectures/ModuleE/index.html) | 7 perception and vision, 8 perception and planning |
| F | Special topics: detection, raceline optimization, MPC, moral decision making | [Module F](https://f1tenth-coursekit.readthedocs.io/en/latest/lectures/ModuleF/index.html) | 9 robot ethics |
| G | The Grand Prix: demos, race prep, the final race | [Module G](https://f1tenth-coursekit.readthedocs.io/en/latest/lectures/ModuleG/index.html), [races](https://f1tenth-coursekit.readthedocs.io/en/latest/assignments/races/index.html), [final project](https://f1tenth-coursekit.readthedocs.io/en/latest/assignments/final_project.html) | |
| LB | Check the class leaderboard | [roboracer-class.github.io/leaderboard](https://roboracer-class.github.io/leaderboard/): Penn ESE 6150, best clean lap in the grading simulator, rebuilt from graded submissions | |

Also: [all labs](https://f1tenth-coursekit.readthedocs.io/en/latest/assignments/labs/index.html),
[slides and downloads](https://f1tenth-coursekit.readthedocs.io/en/latest/lectures/index.html),
[grading rubrics](https://f1tenth-coursekit.readthedocs.io/en/latest/assignments/grading.html).

## What exists today

- **`/build`** frames `f1tenth.readthedocs.io/en/main` ("RoboRacer - Build
  Documentation"): four sequential sections (build, Jetson, driver stack,
  drive), a Simulate section, Autoware, FAQ.
- **`/learn`** frames `f1tenth-coursekit.readthedocs.io/en/latest` ("RoboRacer -
  Course Documentation"): Start Here, overview, syllabus, modules A to G, labs
  1 to 9, three races, final project, grading, downloads. It has no build
  instructions and sends readers to the Build docs.
- **`/course`** redirects to `/learn` since 2026-08-24 (Ahmad: one set of
  teaching material). The old ESE 6150 site it framed,
  `ahmadamine998.github.io/ESE6150-Website/`, still answers.
- **The nav's "Simulator"** goes to AutoDRIVE, where the Sim Racing League
  runs, not to the simulator the course teaches with.
- **On this site:** the landing's Platform chapter (`platform.json`: Build,
  Learn, Race, Research, with media) explains the pillars; the new Start here
  row routes. They stay separate: Platform has Research and media, the paths
  have Sponsor and no media. `/assembly` is the 3D car.

Gaps found while mapping:

1. The Build docs' simulator page documents the **deprecated ROS 1**
   simulator and points to `f1tenth_gym_ros` for ROS 2.
2. `f1tenth_gym_ros`'s README targets Ubuntu 20.04 and ROS 2 Foxy; the driver
   stack installs ROS 2 **Humble**. Worth one check before a page tells a
   newcomer to install both.
3. The iframe titles still say "F1Tenth Documentation" and "F1Tenth Course Kit
   Documentation" (`Build.tsx`, `Learn.tsx`), not RoboRacer.
4. The leaderboard only takes submissions from enrolled ESE 6150 students;
   for everyone else it is read-only.

## What the rebuild needs

1. **Two native pages that render `tracks`**, one per home route: a stage
   strip (Simulate, Build, System) or module strip (00, A to G, LB), each step
   a short body and a link into the docs. The docs stay the deep content; the
   site does not copy them. Each page keeps a "full docs" link, which is the
   iframe's job today.
2. **Decisions from Cedric (and Rahul or Ahmad):** which simulator is step 01
   (`f1tenth_gym_ros` or AutoDRIVE), and whether the nav's "Simulator" should
   follow; whether the 10 to 15 hour estimate may be shown; whether the
   coursekit stays the course (the content skill still says "Spring 2024
   ESE6150 site until Rahul answers", but `/course` was merged into `/learn`);
   how the leaderboard should be described to people outside Penn.
3. **Media:** the build docs mention a recorded build (a video walkthrough is
   what the faculty persona asks for); a poster per stage or module.
4. **Deep links** such as `/build#sim` or `/learn#module-c`, so the landing
   paths, the nav and outside posts can point at a step. `hooks/useScrollToHash`
   already handles hash targets on a page that calls it.
5. **Link checks:** add `paths.json` to the QA link check; every step is an
   external link that can move when the docs are reorganised.
