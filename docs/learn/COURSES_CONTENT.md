# Courses content audit: the LMS mock, cleaned

Status 2026-09-26, branch `revamp/learn-courses`; the schema, rendering rules
and questions updated 2026-10-20 (stage 3 of the interactivity build: the
interface labels and the photos joined the file). Source: Dhyey Shah's mock
"RoboRacer LMS portal" (`index.html`, `course.html`, `instructors.html`,
`assets/js/app.js`; live copy https://dhyeyshah.com/roboracer-lms/index.html,
last commit "Remove highlight blocks, vary course dates, reword how-it-works
heading"). Facts come from the coursekit
(https://f1tenth-coursekit.readthedocs.io/en/latest/, crawled 2026-09-26), the
`roboracer-content` skill and Cedric. The data lives in
`public/data/courses.json`; types and the loader in `src/lib/data.ts`
(`CoursesFile`, `loadCourses`, `findCourse`, `lectureSelection`). No asset was
copied from the mock: logos come from `public/partners/`, Rahul's photo from
`public/crew/`.

## Schema, for the page builder

Three pages render from one file:

| Key | What it is | Shown on |
|---|---|---|
| `meta` | Contact, Slack, coursekit URLs, license, class time, `lms_url` (null) and the broken slide-request form | all three |
| `catalog` | Hero and section heads for the catalog | `/learn/courses` |
| `course` | Headings, the two "About" paragraphs, the two CTAs every course page shares | `/learn/courses/:id` |
| `stats` | 8 figures, each with `value` (display string), `value_number` and `suffix` (the same figure for the count-up, 2026-10-20: 3500 and "+" for "3,500+"; the count runs only while they spell `value` exactly, and `value` is what no-JS and reduced motion show), `label`, `group` (`community` or `course`) and `source`. `members` follows `community.json` (`members`, `members_display`) once it loads | `/learn/courses` tiles, `/learn/teach` strip |
| `plans` | The three core offerings (4, 10, 15 weeks). `modules` and `labs` are ids into `outline` | cards on `/learn/courses`, one page each |
| `offerings` | University offerings. Render only `status: "published"` (Penn today). `plan` points at the plan whose outline the offering follows | cards on `/learn/courses`, one page each |
| `outline` | The real course: `modules` A to G with their lectures and tutorials (title, URL, `slides` / `video` flags, assigned labs), `labs`, `races`, `final_project`, overview `links` | `/learn/courses/:id` (filter modules by the plan), `/learn/teach` |
| `outline.modules[].items[].video_id`, `.slides_url` | The recording's YouTube id and the Google Slides deck, from the coursekit page's own embeds (see Lecture media below). Optional: set only where the flag is true and the check passed | the outline's Watch and Slides controls on `/learn/courses` and `/learn/courses/:id` |
| `learn` | "What you'll learn". Each item has a `module`; a course page shows the items whose module its plan covers | `/learn/courses/:id` |
| `prerequisites` | Level, what you need, what the course is not | `/learn/courses/:id` |
| `staff` | Rahul Mangharam. Offerings list staff by id | `/learn/courses/:id` |
| `faq` | Student logistics, five questions | `/learn/courses/:id` |
| `features` | ONE list for both pages. `pages` says where each appears | `/learn/courses`, `/learn/teach` |
| `teach` | Hero (with `pills`, feature ids), `how_it_works` (6 steps + the two portals), `features` head, `lecture_selection` head, `steps` (5-step guide), `recording` tips, `resources`, instructor `faq`, `contact` CTA | `/learn/teach` |
| `catalog.leaderboard_heading` | Section 01 (stage 4, 2026-10-20): kicker, title, lead (from Penn's offering and the `/race` board's lead, no new fact), `more` (the link to `/race#leaderboard`), and the board it features: `board` (an index.json slug, `lab-5-pure-pursuit-spielberg`), `rows` (5), `replay` (heading, note, `compare`, and `posters` with the phone dialog's `narrow_height`). Cedric chose the board; see `docs/LEADERBOARD.md`, "On /learn/courses" | `/learn/courses` |
| `catalog.stats_label`, `catalog.picker`, `catalog.ladder`, `catalog.finder` | Interface labels (2026-10-20): the stat tiles' list name; the plan picker and its summary (with the live-region sentence); the plan cards' chips and "Selected"; the topic finder (field, hint, counts, the miss panel) | `/learn/courses` |
| `course.ui` | Interface labels: the tab names and the screen-reader nouns after their counts, the chips' list name, the two prerequisite card labels ("You need", "Not covered"), Copy link and its two status lines | `/learn/courses/:id` |
| `outline.ui` | Interface labels: Expand / Collapse all, the meter and module chips, the done box, the local-storage notes, Clear, and the Watch, Close, Slides and player texts | the outline on `/learn/courses` and `/learn/courses/:id` |
| `teach.rail_label`, `teach.builder` | The section rail's name; the plan builder's labels and the lines of the email (`mail_*`) and the copied plan (`text_*`) it writes | `/learn/teach` |
| `catalog.hero.photo`, `teach.hero.photo`, `plans[].banner`, `plans[].card_photo`, `offerings[].banner` | Photos: `src` (an existing file under `public/media`), `width`, `height`, `alt`, `position` (CSS object-position) and `manifest`, the `docs/ASSET_MANIFEST.md` row for that use (CC-01 to CC-04, CP-01 to CP-04, U3-01). Optional: without one a band is plain ink and a card a violet panel | catalog hero and plan cards, course banners, teach header |

Rendering rules:

- **Route ids** are unique across `plans` and `offerings`: `4-weeks`, `10-weeks`,
  `15-weeks`, `penn`. `findCourse(file, id)` returns a plan or a published
  offering, and `undefined` for `tum` and `ucsd` (status `verify`).
- **Null dates and effort** render nothing: no "TBA", no empty sidebar row.
  `dates_note` / `effort_note` hold the question.
- **Any string starting `TODO(content)`** (`note`, `*_note`) is never rendered.
- **Features:** `available` = true on the course site today, render it.
  `platform` = true once the Open edX platform is public: render only when
  `meta.lms_url` is set. `verify` = the mock's promise with no source: never
  render.
- **The members stat** mirrors `community.json` `members_display`. When the
  page already loads community.json, render that value.
- **The lecture selection table** on `/learn/teach` comes from
  `lectureSelection(file)`: one row per module, its required labs, and which
  plans include it. The JSON holds only its heading, so it cannot disagree
  with `plans`.
- **Links:** every URL in the file answered 200 on 2026-09-26 except the two
  known cases: `meta.slide_downloads.url` (404, marked `broken`, do not link)
  and the Slack invite (403 to curl, valid per Cedric 2026-09-26). Re-checked
  2026-10-20 (stage 3): the same, plus `www.upenn.edu`, which refuses a
  browser user agent from a script and answers a plain one.
- **Interface labels** (`*.ui`, `catalog.picker` and the rest above) hold no
  facts. `{name}` slots are filled at render by `fill()` in
  `src/components/learn/learnStyles.ts`; an unknown slot shows as written, so
  a typo is visible. Each block's `note` is bookkeeping and never rendered.
  Plurals are two keys (`count_one`, `count_many`) or a `[one, many]` pair.
- **Photos** are existing site files only (CLAUDE.md rule 8), each with a
  manifest row naming its provenance row. A new photo needs a row first.

## Catalog (`index.html`)

| Mock | Decision | In courses.json |
|---|---|---|
| Eyebrow "Free & open for everyone", H1 "The largest open collection of autonomous driving lectures" | Rewritten. "Largest" is an unsourced superlative | `catalog.hero`: "Learn autonomous racing" |
| Lead "From perception to planning and control, from hardware to software stacks. Take everything for free, or teach it at your university." | Rewritten ("from X to Y" decoration) | `catalog.hero.lead` |
| Buttons "Browse courses", "Teach this course" | Rewritten, verb + object | "Pick a course", "Teach the course" |
| Stats 16 courses, 1,200 members, 12 instructors, 7 institutions | **Dropped**. None is sourced; 1,200 members is also wrong | `stats`: 3,500+ members, 90+ universities, 20+ countries, 7 modules, 23 lectures, 9 labs, 3 races, 12 recorded lectures |
| "My courses" with progress bars | **Dropped** (localStorage, needs accounts) | |
| Course cards: 3 core + Penn, TUM, UC San Diego | Kept, split into `plans` and `offerings` | see below |
| Search, institution / duration filters, sort, grid/list toggle | UI, the builder's call. The data supports weeks and institution | |
| "The platform" section, 8 features | Kept, merged with the instructor list into one `features` list | `features`, `catalog.features_heading` |
| Stat counter animation | UI, the builder's call | |

### Core plans

| Mock | Decision |
|---|---|
| "Roboracer – 4 Weeks Course" etc., codes `04weeks`/`10weeks`/`15weeks` | Titles rewritten ("4-week course"); codes dropped |
| Modules per plan (2 / 4 / 7) | Kept, now from the coursekit Start Here page: A-B + labs 1-4, A-D + labs 1-6, all + labs 1-9 |
| Blurbs | Rewritten under 25 words |
| Dates Oct 5 to Nov 2, 2026; Nov 2, 2026 to Jan 11, 2027; Sep 14 to Dec 28, 2026 | **Dropped**, placeholders (the mock's last commit "varies" them). `starts`/`ends` null + TODO |
| Effort 8 / 12 / 20 hours per week | **Dropped**. The coursekit gives class time only (two 80-minute classes a week, labs outside class). null + TODO. The class time is kept in `meta.class_time` |

### University offerings

| Mock | Decision |
|---|---|
| Penn, code "F110", 15 weeks, Jan 20 to May 5, 2027, "taught by the course authors" | Kept as `published`. Code corrected to **ESE 6150** (LEARN_TERRAIN, leaderboard.json). "F110" is the platform's old F1/10 name, not a course code (the 2019 course description on the coursekit calls it "ESE615: F1/10 Autonomous Racing Cars"). Dates dropped. Blurb: "Where RoboRacer started in 2016" (content skill). Logo `/partners/color/upenn.webp`. Links: class leaderboard, Spring 2024 course site |
| TUM, code "F110", 10 weeks, Oct 19 to Dec 28, 2026, wordmark in #0065bd | `status: "verify"`, not rendered. TUM is a partner in partners.json; nothing confirms it teaches the course. Code, length, dates null. Logo `/partners/color/munich.webp`; the mock's wordmark colour dropped |
| UC San Diego, code "10weeks", 10 weeks, Jan 4 to Mar 15, 2027 | Same as TUM. Logo `/partners/color/ucdsd.webp` (the existing file's name) |

## Course page (`course.html`)

| Mock | Decision | In courses.json |
|---|---|---|
| Header: breadcrumb, title, "weeks · effort", **Enroll now** / View course | Enroll **dropped** (no platform yet). CTAs "Open the course material" (coursekit Start Here) and "Ask in Slack" | `course.open_material`, `course.ask` |
| About: blurb + "Whether it's a well-known car manufacturer like Tesla or new technology companies like Google..." | Tesla/Google paragraph **dropped** (filler) | |
| About: "not a theory-only lecture series: hands-on and lab-centered... simulation environment, and optionally real hardware" | Kept, rewritten; audience from the 2019 course description linked on the coursekit syllabus | `course.about` |
| "What you'll learn", 12 items sliced by plan length | Kept, tagged by module so each plan shows its own. Merged "Refresh your control theory knowledge" and "Control theory and control application". Added "Map a track and localize on it" (Module C had no item). **Dropped** "GPU acceleration for machine learning" and "Differences between SIL and HIL development": neither is in the coursekit | `learn` |
| Prerequisites paragraph (graduate or senior undergraduate) | Kept, tightened, plus the coursekit's list (Linux, optimization theory, C++ or Python) and "what it is not" | `prerequisites` |
| Course outline: 8 groups, 16 lectures in the mock's own numbering ("Lecture 5 – Car Building and VESC Tuning", "Lecture 14 – GPU Acceleration for ML", "Lecture 15 – Sim-to-Real & HIL") | **Replaced** by the coursekit: modules A to G, 23 lectures + 1 optional, 5 tutorials, each with its URL, slides/video flags and assigned labs | `outline` |
| Unit checkboxes, "x of y units completed", Expand all | Progress tracking **dropped** (localStorage). Expand all is UI | |
| Staff: "Prof. Dr. Rahul Mangharam", **Associate Professor**, bio, photo `assets/logos/rahul-mangharam.png` | Name without titles; role corrected to "Professor, Department of Electrical and Systems Engineering" (people.json); bio tightened, nothing added; photo `/crew/rahul-mangharam-400.webp` (400x400). "Faculty lead, RoboRacer" from the content skill | `staff` |
| "Local instructors from X are listed in the course announcements" | **Dropped** (no announcements exist) | |
| Logistics FAQ, 5 questions | Kept, rewritten for today (below) | `faq` |
| Sidebar: course number, start, end, effort, length, "Copy link" | Fields kept (`code`, `starts`, `ends`, `effort_hours_per_week`, `weeks`); null ones render nothing. Copy link is UI | |

Student FAQ rewrites:

| Question | Mock answer | Now |
|---|---|---|
| Length and effort | "{weeks} weeks with an estimated effort of {8/12/20} hours per week" | Plans and semester length; class time from the syllabus; no hours (TODO) |
| Start, join late | "Classes start {date}... After the end date the content is archived" | Open all year, own pace; universities keep their own terms |
| Need the car? | "No. Everything can be completed in the simulator" | Not to start: the simulator comes first, but the coursekit's three races run on the car. "Everything in the simulator" was not true of the coursekit |
| Enroll and help | "Register as a student, sign in and click Enroll now" | Nothing to sign up for; the material is open; questions go to Slack; university students ask their staff first |
| Grading | "Quizzes, lab assignments and competition performance" | Self-learners are not graded; universities grade with their own weights; the coursekit publishes rubrics |

## Instructors page (`instructors.html`)

| Mock | Decision | In courses.json |
|---|---|---|
| Hero "Teach autonomous driving with a course that's ready on day one"; "Copy the complete course **without any licensing**... teach with almost no teaching assistants" | Rewritten. The material is **CC BY-NC-SA 4.0** (coursekit Material Downloads page): free with credit, no commercial use. So "no licensing" was wrong; the TA claim has no source | `teach.hero` |
| Buttons "Register as instructor", "Plan your course" | Rewritten: "Email the team" (mailto contact@roboracer.ai) and "Open the course material" | `teach.hero` |
| Pills: No licensing, Your logo & colours, Choose your lectures, Grading included | Kept as feature ids: free under CC BY-NC-SA 4.0, 4/10/15 weeks, rubrics, your logo (platform) | `teach.hero.pills` |
| How it works: Apply, Get access, Customize, Add material, Publish, Teach | Kept, tightened | `teach.how_it_works.steps` |
| Studio portal / Courses portal cards | Kept | `teach.how_it_works.portals` |
| "What you get", 10 features | Merged with the catalog's 8 into 13 unique `features`. "Choose Lectures 2–5, 8–13 and 15" used the mock's numbering: rewritten as plan-based. Statuses: 6 `available`, 4 `platform`, 3 `verify` | `features` |
| Step-by-step guide, 5 steps, checklists, tips, Open edX links | Kept. Step 1 now says to email contact@roboracer.ai. All 6 Open edX doc links resolve | `teach.steps` |
| Studio planner dashboard (course length and hours sliders, lecture checklist with hours, file uploads, branding preview, grading weights, plan export) | **Dropped** (localStorage toy). Replaced by the static lecture selection table | `teach.lecture_selection` + `lectureSelection()` |
| Recording tips (audio, 5 to 12 minute segments, 1080p, captions) | Kept, tightened | `teach.recording` |
| 9 helpful links | Kept, all 9 answer 200. "ROS documentation" relabelled "ROS 2 documentation" | `teach.resources` |
| "For Roboracer admins": create a user, add them to a course, welcome email template | **Dropped** entirely (internal ops, and the email template carried login instructions) | |
| Instructor FAQ, 9 questions | Kept, rewritten where it promised a live platform or the planner: "Register as an instructor" is now "email contact@roboracer.ai with your university, names and what you would like to teach"; "The Branding tab of the planner" and "the planner above" removed; "Nearly none [TAs]" replaced by an honest answer; "Start with the Lecturer Introduction unit" dropped (no source that it exists) | `teach.faq` |

## Site shell (`app.js`)

| Mock | Decision |
|---|---|
| Nav: Courses, Platform, For Instructors, Help | The site's own nav applies; the builder adds /learn/courses and /learn/teach under Learn |
| Sign in / Register modal (student or instructor, password fields), "Please sign in first" | **Dropped** (fake auth) |
| Theme toggle | **Dropped** (the site has one theme) |
| Footer "Powered by Open edX", "© Roboracer. All rights reserved" | **Dropped** (the site footer applies) |
| Toasts, localStorage keys (user, enrolled, done-*, plan, view, theme) | **Dropped** |
| Assets: logos, hero.jpg, car.png, rahul-mangharam.png, openedx.png | **Not copied** (CLAUDE.md rule 8); existing repo files used instead |

## Questions for Cedric (every TODO(content) in the file)

1. **LMS URL.** `meta.lms_url`: the Open edX portal URL once it is public. Until then, the 4 `platform` features stay hidden.
2. **Is the platform open to instructors now?** `/learn/teach` steps 2 to 5 and most of its FAQ describe Studio and the Courses portal. If accounts are already given by email, the page can ship; if not, should it wait for `lms_url`?
3. **Plan dates.** Do the 4, 10 and 15-week plans run as dated cohorts on the platform? If yes, the dates (`plans[].starts/ends`).
4. **Effort.** Student hours per week for each plan. The coursekit gives only class time (two 80-minute classes a week, labs outside class); the mock's 8/12/20 h have no source. Same for Penn (the 2019 description: two 3-hour lecture-and-lab sessions a week).
5. **TUM.** Does TUM teach the course? Under which course number, length and dates?
6. **UC San Diego.** Same question.
7. **Penn term dates.** Should the Penn page show the next ESE 6150 term? Confirm it follows the full 15-week plan.
8. **Slide downloads.** The coursekit's request form (https://forms.gle/4UJigTa36VAMyGheA) answers "Page Not Found". Who grants slide downloads now? (The slides stay viewable on every lecture page.)
9. **Quizzes.** Do quizzes exist for the course on the platform, or only Open edX's problem types?
10. **Lecturer notes.** The mock promises notes for lecturers; the coursekit has none. Do they exist?
11. **Background courses.** The mock promises related background courses next to the lectures. Which, and where?
12. **New content monthly.** Is there a real schedule for expert talks and research updates, and where is it published?
13. **Instructor and institution counts.** The mock showed 12 instructors and 7 institutions. If you want those on the catalog, give the numbers; they are not on the page now.
14. **Labels written by the builders** and not yet read by you. From 2026-09-27 (each with a `TODO(content)` note): `catalog.outline_heading`, `course.glance_heading`, `course.not_found`, `teach.hero.plans_link`. From 2026-10-20 (no facts, so a `note` rather than a TODO): `catalog.picker`, `catalog.ladder`, `catalog.finder`, `course.ui`, `outline.ui`, `teach.builder`, including the email the plan builder writes ("We would like to teach the RoboRacer course with this plan." and the University / Your names fields).
15. **Photo permission notes.** The 10-week banner (`plans[1].banner`, manifest CP-02 from V4-09) is credited to you with "verify: looks like a DSLR frame"; the Penn banner (CP-04 from V4-10) shows an identifiable UPenn student. The other photos are Felix Jahncke's or the Samaks' (granted) or your own.
16. **Coursekit fixes, not site fixes:** Tutorial 3's embedded deck is deleted (HTTP 410), and the Lecture 9 (optional) page carries two scan-matching lab videos the outline does not show (one `video_id` per item; show them too?).

## Found on the coursekit (worth knowing)

- **Labs renumbered 2026-10-19** (coursekit, mirrored on `main` by PR #31 and
  in `courses.json` on 2026-10-20): 7 model predictive control, 8 model
  predictive path integral control and 10 reinforcement learning in Module F,
  9 perception and vision in Module E (Lectures 13 and 18 assign it; Lecture
  21 assigns Lab 7). The old Lab 8 (perception and planning) and Lab 9 (robot
  ethics) are retired, and the optional scan-matching lab page is a 404, so
  `lab-5-optional` is gone. The Labs page now says "10 labs total"; `stats`
  says 10. (Before: on 2026-09-26 Lab 8 was filed under F, and the page said
  "8 labs total" against a list of 9.)
- **Lecture numbering** runs 1 to 13, then 17 to 28: 14 to 16 do not exist,
  and 23 to 25 are one "Special Topics" page. The public 2024 syllabus sheet
  linked from the coursekit uses yet another order (MPC and ethics before
  Module F), so the mock's numbering was not the only one in circulation.
- **Recordings** exist for 12 of 24 lecture pages (Modules A to E) and
  Tutorials 1 and 2. Module F has slides but no recordings; Module G has neither.
- **Lab repositories are off by one:** Lab 5 links `f1tenth_lab6_template`,
  Lab 6 `f1tenth_lab7_template`, Lab 7 `f1tenth_lab8_template`. courses.json
  links the lab pages, not the repos.
- The coursekit's own Slack links (overview, contact) point at the old
  `f1tenth-teams` workspace, and its Start Here page links
  `http://f1tenth.org/build.html`. Coursekit fixes, not site fixes.
- License: CC BY-NC-SA 4.0 for all course material (Material Downloads page).

## Lecture media (`video_id`, `slides_url`)

Harvested 2026-10-20 by `docs/learn/tools/harvest_lecture_media.py` (run it
with `python3 -I` from the repo root and a `--cache` directory outside the
repo; it changes nothing without `--write`). For every outline item it fetches
the item's coursekit page (`href`) and reads the embeds the page itself
carries:

- `video_id`: the `youtube.com/embed/<id>` on the page, only where `video` is
  true, kept only when YouTube oEmbed answers 200 with a title. 14 of 14:
  Lectures 1 to 8, 9 (optional), 10, 12, 13 and Tutorials 1 and 2. The
  videos' own titles use an older numbering ("F1TENTH L09 - Particle
  Filters" is Lecture 8 here); the site shows the coursekit's titles.
- `slides_url`: the embedded Google Slides deck as
  `https://docs.google.com/presentation/d/<id>`, or `.../d/e/<id>/pub` for a
  deck embedded from its "Publish to the web" copy (Lectures 9 optional, 20
  and 21), only where `slides` is true and the deck opens on
  docs.google.com without a sign-in. 24 of 25.
- **Not set:** Tutorial 3 (ROS 2 and tf2) embeds a deck that answers HTTP 410
  (deleted); the page shows a dead frame. A coursekit fix, not a site fix.
  `slides` stays true (the page does embed one); the outline shows no Slides
  link for it.
- **One video kept of three:** the Lecture 9 (optional) page embeds the
  lecture (`tuQXuTe8KK4`, "Scan Matching") and two lab walkthroughs
  (`WmoOA1XXh_o`, `wnll231Y0LY`, "Scan Matching Lab" Parts I and II);
  `video_id` holds the lecture.

The run also re-checked every URL in the file and set `checked` to
2026-10-20: 105 unique URLs, all 200 but the two known exceptions below
(`www.upenn.edu` refuses a browser user agent from a script and answers a
plain one; the script retries a 403 that way).

## Link check

81 unique URLs in courses.json, checked with curl on 2026-09-26: 79 answered
200 (the Open edX and edX docs pages were also checked by title, no soft
404s). The two exceptions are `meta.slide_downloads.url` (404, marked
`broken`) and the Slack invite (403 to curl, valid per Cedric).
