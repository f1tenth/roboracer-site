# People candidates for the About page

Generated 2026-08-23. **Nothing here is published content.** Every entry needs
Cedric's approval, and the standing rule from `roboracer-content` still applies:
*never publish a person without a role and a photo.*

Machine-readable version: `docs/content/people.candidates.json`.

## Headline

**85 candidates.**

| Proposed category | Count |
|---|---|
| Faculty and advisors | 30 |
| Crew (active organisers) | 22 |
| Past crew | 33 |

By confidence: 16 high, 41 medium, 28 low.
**22 of the 85 have no sourced role** (list at the bottom — that section is the forwardable ask).

Contributors are deliberately absent: that category is built from commit history by another agent.

## Where the evidence actually came from

The task's source order did not survive contact with the data. What each source gave:

| Source | Yield |
|---|---|
| `public/data/publications.json` | **Good.** 133 papers, 408 distinct authors, 32 with 3+ papers. Gives research leads and their years, but the `institutions` field is per-paper, not per-author, so an affiliation read off it is an inference, never a fact. |
| `public/data/events_map.json` | **Nothing.** 40 events, 40 source strings, and not one organiser name. The only institutional hints in the whole file are "(Ontario Tech University organizers)" on IEEE SM 2024 and a TUM logo on the Germany 2022 banner. |
| The race sites themselves | **The real organiser source.** 17 committees were read: 16 race sites (`icra2026-race.roboracer.ai`, `iros2026-race.roboracer.ai`, … back to `icra2023-race.f1tenth.org`) plus the RoboRacer Sim Racing League page. Each publishes a full organising committee with verbatim titles and departments. This is where the crew roster comes from. |
| `public/data/teams.json` | **Nothing usable.** No `lead` field. Four people are named only inside result strings (Milan Manoj, Manasi Shrekhar, Cedric Hollande, Dhyey Shah) and they are drivers, not organisers. |
| `.claude/skills/roboracer-content` | Cross-checked. All five named active people are in the file. Two people it names (Johnny Tian, Dhruv Jaiswal, both CMU) appear on **no** public source I could reach. |
| `team_developers.json` / `team_alumni.json` | Stale but valuable: 20 names, 17 with photos already sitting in `public/crew/`. Used for the Past crew tier and for Madhur Behl, Marko Bertogna and Mike Coraluzzi. |

## Top 15 by evidence

1. **Rahul Mangharam** — faculty, high. On **all 17** organising committees checked, 2023–2026, plus 12 papers 2020–2026 (248 citations). Penn's own directory now says **Professor**, Electrical and Systems Engineering; every race site still says "Associate Professor". Use the directory wording.
2. **Ahmad Amine** — crew, high. 12 committees, unbroken 2024–2026. "Ph.D. Candidate, Department of Electrical and Systems Engineering, University of Pennsylvania". The busiest organiser after Rahul.
3. **Johannes Betz** — faculty, high. 9 committees 2023–2025, 6 papers. Now **Rudolf Mößbauer Professor, Chair of Autonomous Vehicle Systems, TUM** — the race sites' "Assistant Professor, Mobility Systems Engineering" is out of date. Absent from every 2026 committee; confirm he is still involved.
4. **Venkat Krovi** — faculty, high. 9 committees 2023–2026. "Michelin SmartState Chair Professor of Vehicle Automation", Clemson, directs ARMLab. Photo already at `public/crew/venkatK.jpg`.
5. **Chinmay Samak** — crew, high. 7 committees 2024–2026 plus the Sim Racing League. Clemson CU-ICAR PhD candidate.
6. **Tanmay Samak** — crew, high. Same record as Chinmay; the two always appear together.
7. **Hongrui "Billy" Zheng** — crew, high. 3 committees 2023–2024, 8 papers 2020–2024, 248 citations (the platform paper). On the skill's active five, and the photo exists (`public/crew/billy.png`).
8. **Michele Magno** — faculty, high. **14 papers 2023–2026, the largest single output in the corpus.** Privatdozent at ETH Zurich D-ITET, heads the Center for Project-Based Learning — the group behind ForzaETH, already a featured team. No organising role: he is a research lead, not crew.
9. **Edoardo Ghignone** — 13 papers 2023–2026, ForzaETH. No role sourced, no committee. See "could not classify".
10. **Nicolas Baumann** — 12 papers 2023–2025, ForzaETH, and an author of one of the site's existing testimonials. Same problem as Ghignone.
11. **Radu Grosu** — faculty, high. Full Professor and Head of the Cyber-Physical Systems research unit, TU Wien. ICRA 2026 Vienna host-side lead, 3 papers.
12. **Amr El-Wakeel** — faculty, high. Assistant Professor and Director of the Intelligent Cyber-Physical Systems Lab, WVU. IROS 2026 and IV 2026 committees; in the skill's IROS list.
13. **Felix Jahncke** — crew, high. TUM PhD candidate, IV 2025 and ICRA 2026 committees, 2 papers.
14. **Mohamed Elgouhary** — crew, medium. WVU. In the skill's IROS 2026 list; first author of a 2026 RA-L paper. **The two race sites give him two different titles** ("Graduate Research Assistant" at IROS 2026, "PH.D. CANDIDATE" at IV 2026) — pick one.
15. **Lei Xie** — 7 papers 2025–2026, the fastest-growing group in the corpus (Zhejiang University, co-publishing with ETH). No role sourced.

### Two names worth reading even though they rank lower

- **Madhur Behl** (faculty, high) — UVA's own faculty page says he *"co-founded the F1Tenth autonomous racing platform and the international F1Tenth (now Roboracer) Grand Prix competitions."* That is a sourced **co-founder** claim, and he already has a photo at `public/crew/madhur.jpg`. He appears in no committee 2023–2026 and in no paper in `publications.json`, so this is an origin-story entry, not an active one.
- **Cedric Hollande** (crew, high) — the IROS 2026 site lists him as "Researcher, Department of Electrical and Systems Engineering, University of Pennsylvania". **"Race Director" appears only in the internal content skill, on no public page**, and he is not on the xLAB members page. Decide which title goes on the site.

## Could not classify

- **Edoardo Ghignone, Nicolas Baumann** (ETH, ForzaETH) — ranked 9th and 10th on evidence and would look wrong in any of the three tiers. They are prolific *community researchers* with no organising role and no RoboRacer job. Their `proposed_category` in the JSON is a placeholder. Either give the About page a fourth tier for community research leads, or drop them and let ForzaETH represent them under featured teams.
- **Koneshka Bandyopadhyay** — "Founder & CEO, Neobotics Foundation Inc.", on the VTC 2026-Fall committee. Partner-side co-host, not RoboRacer staff. Probably belongs under partners rather than crew.
- **The 2023–2024 local-host blocks** (HiPeRT Modena ×5 for CDC 2024, Ontario Tech ×3 for SM 2024, Boston University ×3, CUHK ×3, Korea ×2, Brazil ×3 for the cancelled CDC 2025). Each organised exactly one race. I filed them as Past crew, but they may be better represented as "hosted by" credits on the race timeline than as people on the About page. That is 20 of the 33 Past crew entries.
- **Johannes Betz** — 9 committees but nothing in 2026. Faculty or past crew depends on a fact only Cedric has.

## Roles or affiliations that could not be sourced — the ask

Nobody below can be published as-is under the "role and a photo" rule. Grouped by who can answer.

**Ask Cedric (internal, no public page exists):**

| Name | What is missing | What we do know |
|---|---|---|
| Ayagoz Smagulova | Role and affiliation | On the skill's active five; CLAUDE.md says she co-owns design. No committee, no paper, no public page. |
| Johnny Tian | Role and affiliation | Named in the skill's IROS 2026 committee (CMU). Not on the IROS 2026 site. |
| Dhruv Jaiswal | Role and affiliation | Named in the skill's IROS 2026 committee (CMU). Not on the IROS 2026 site. |
| Yon Vanommeslaeghe | **Conflict, not a gap** | xLAB members page says "Postdoc @ University of Pennsylvania"; the skill says "Visiting Researcher, UPenn, co-organizer". |
| Cedric Hollande | **Conflict, not a gap** | IROS 2026 site says "Researcher"; the skill says "Race Director". |
| Mohamed Elgouhary | **Conflict, not a gap** | "Graduate Research Assistant" (IROS 2026) vs "PH.D. CANDIDATE" (IV 2026). |
| Rahul Mangharam | **Conflict, not a gap** | Penn directory "Professor" vs every race site "Associate Professor". |
| Johannes Betz | **Conflict, not a gap** | TUM "Rudolf Mößbauer Professor, Chair of Autonomous Vehicle Systems" vs race sites' "Assistant Professor". |

**Ask Rahul (the old f1tenth.org rosters — no role was ever recorded for any of these):**

Mike Coraluzzi (developers roster, photo exists) · Jayanth Bhargav · Xinlong Zheng · Xiaozhou Zhang · Wesley Yee · Lejun Jiang · Ravi Konkimalla · Tom Jose · Malavika Manoj · Junfan Pan · Karel Smejkal · Roshan Benefo (all from `team_alumni.json`; 7 of the 12 have photos in `public/crew/`, 5 render as the avatar placeholder).

**Research leads whose role I could not confirm from a public professional page:**

| Name | Papers | Inferred affiliation (from `publications.json`, unconfirmed) |
|---|---|---|
| Lei Xie | 7 (2025–2026) | Zhejiang University |
| Hongye Su | 4 (2025–2026) | Zhejiang University |
| Edoardo Ghignone | 13 (2023–2026) | ETH Zurich, Center for Project-Based Learning |
| Nicolas Baumann | 12 (2023–2025) | ETH Zurich, Center for Project-Based Learning |
| Krzysztof Walas | 3 (2024–2025) | tagged "IDEA of Development Foundation"; likely Poznań University of Technology |
| Roland Tóth | 3 (2024–2026) | HUN-REN Institute for Computer Science and Control |
| Herman Arnold Engelbrecht | 3 (2023–2024) | Stellenbosch University (inferred from the author group only) |

**Also verify before publishing:** Tobi Delbruck — ETH's master-robotics page lists him as "Prof. em."; confirm emeritus status. Andreas Brandstätter, François Pomerleau, Borja Pérez López — the race sites strip accents; check the spellings.

## Method notes

- Every `role_source` in the JSON quotes the source's own wording. Where I could not confirm a role from a public professional page, `role` is `null` — no title was inferred, ever.
- Only public professional pages were consulted: university directories, lab group pages, and the RoboRacer race sites. No personal contact details, no personal-life sources.
- Four pages refused automated fetches (403/404): UT Austin `~joydeepb`, `hipert.unimore.it/people/`, `engineering.virginia.edu/faculty/madhur-behl`, WVU's Statler directory. For those, the role text comes from a search index over the same domain and is marked `medium`.
- Ranking is `20 × committees + 6 × papers + 4 × (last active year − 2018)`.
