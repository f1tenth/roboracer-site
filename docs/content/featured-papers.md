# Featured publications — proposed shortlist

Source: `public/data/publications.json` (67 entries, `updated: 2026-08-20`). This file does not carry citation counts, so citation data was fetched by title match against the OpenAlex Works API (`api.openalex.org/works?search=...`, polite pool, `mailto` set), with a Semantic Scholar Graph API cross-check attempted in parallel (`api.semanticscholar.org/graph/v1/paper/search`) that was rate-limited (HTTP 429) for most of the 39 2023+ items during this session; where both returned data they agreed. All citation counts below are current as of 2026-08-21 and will drift over time — re-pull before publishing if this list sits for more than a few weeks.

Method: filtered `publications.json` to `year >= 2023` (39 items), matched each title to OpenAlex by fuzzy string match (only accepted matches with a similarity score >= 0.85; two low-confidence/no-match titles were retried with a cleaned query), ranked by citation count descending, ties broken by venue priority (RA-L > ICRA > IROS > CoRL > CDC > everything else), then alphabetically by title. Picked the top 16 (within the requested 12-20 range). The 2020 F1TENTH platform paper is pinned separately below, outside the ranking, per the task instruction.

Do not edit `public/data/publications.json` from this file; a human (Rahul/Billy per the skill) still needs to set `"featured": true` on the chosen ids in the actual data file.

## The original paper (pinned)

- **`okelly-2020-f1tenth`** — "F1TENTH: An Open-source Evaluation Environment for Continuous Control and Reinforcement Learning," O'Kelly, Zheng, Karthik, Mangharam, 2020. Citations: **23** (OpenAlex, exact title match). This is the platform's founding paper; pin it first on the Research page regardless of its citation rank among 2023+ work, labeled "the original paper."

## Featured shortlist, 2023 and later (ranked)

| # | id | title | year | venue | citations (source) | reason |
|---|---|---|---|---|---|---|
| 1 | `evans-2023-high` | High-speed autonomous racing using trajectory-aided deep reinforcement learning | 2023 | IEEE Robotics and Automation Letters | 33 (OpenAlex) | Highest-cited 2023+ paper and in RA-L, the top venue tier; a clean, oft-cited RL racing result. |
| 2 | `becker-2023-model` | Model- and acceleration-based pursuit controller for high-performance autonomous racing | 2023 | 2023 IEEE ICRA | 26 (OpenAlex) | Second-highest citation count, ICRA venue, strong classical-control counterpoint to the RL-heavy list. |
| 3 | `baumann-2024-forzaeth` | ForzaETH Race Stack: Scaled Autonomous Head-to-Head Racing on Fully Commercial off-the-Shelf Hardware | 2024 | arXiv preprint | 22 (OpenAlex) | The full open-source race stack behind ForzaETH's competition results (see `docs/content/teams.proposed.json`); ties research directly to a team the site already features. |
| 4 | `evans-2023-safe` | Safe reinforcement learning for high-speed autonomous racing | 2023 | Cognitive Robotics | 14 (OpenAlex) | Covers the safety tag, a category the research page must represent per the skill's topic list. |
| 5 | `honda-2023-stein` | Stein Variational Guided Model Predictive Path Integral Control | 2023 | arXiv preprint | 13 (OpenAlex) | Strong MPC/MPPI contribution, the control family Cedric's own IV 2026-winning controller used. |
| 6 | `evans-2023-comparing` | Comparing deep reinforcement learning architectures for autonomous racing | 2023 | Machine Learning with Applications | 11 (OpenAlex) | Comparative RL study, useful as a survey-style entry point for newcomers to the RL tag. |
| 7 | `ghignone-2023-tc` | TC-Driver: A Trajectory Conditioned Reinforcement Learning Approach to Zero-Shot Autonomous Racing | 2023 | Field Robotics | 11 (OpenAlex) | Zero-shot generalization result from the ForzaETH group, complements pick #3. |
| 8 | `trumpp-2023-residual` | Residual policy learning for vehicle control of autonomous racing cars | 2023 | 2023 IEEE IV | 10 (OpenAlex) | IV venue, residual-RL approach; broadens the RL tag beyond pure end-to-end policies. |
| 9 | `loetscher-2023-assessing` | Assessing the Robustness of LiDAR, Radar and Depth Cameras Against Ill-Reflecting Surfaces | 2023 | arXiv preprint | 9 (OpenAlex) | Only strong perception/state-estimation candidate in the top tier; the skill requires that topic represented. |
| 10 | `fazekas-2024-evaluation` | Evaluation of local planner-based Stanley control in autonomous RC car racing series | 2024 | 2024 IEEE IV | 9 (OpenAlex) | Covers planning plus control/MPC jointly, IV venue, tied at 9 citations and ranked above pick 9 within its own tier is not needed (already ordered by year/venue after citation tie). |
| 11 | `berducci-2024-learning` | Learning adaptive safety for multi-agent systems | 2024 | 2024 IEEE ICRA | 8 (OpenAlex) | ICRA venue, covers both multi-agent and safety tags in one paper — efficient for a curated grid. |
| 12 | `heetmeyer-2023-rpgd` | RPGD: A Small-Batch Parallel Gradient Descent Optimizer for Nonlinear MPC | 2023 | 2023 IEEE ICRA | 7 (OpenAlex) | ICRA venue, adds a GPU-parallel optimization angle to the control/MPC tag. |
| 13 | `joglekar-2023-data` | Data-Driven Modeling and Experimental Validation of Autonomous Vehicles Using Koopman Operator | 2023 | 2023 IEEE/RSJ IROS | 7 (OpenAlex, retried with cleaned title — the `publications.json` title has a scrape artifact suffix, "Distribution A: Approved for Public Release...", stripped before searching) | IROS venue, systems/platform tag, Koopman-operator modeling is a distinct technique not otherwise represented. |
| 14 | `hell-2024-lidar` | A lidar-based approach to autonomous racing with model-free reinforcement learning | 2024 | 2024 IEEE IV | 7 (OpenAlex) | IV venue, joins RL and perception tags; recent (2024) and above the general 5-6 citation cluster. |
| 15 | `evans-2023-bypassing` | Bypassing the Simulation-to-reality Gap: Online Reinforcement Learning using a Supervisor | 2023 | 2023 ICAR | 6 (OpenAlex) | Only strong sim-to-real-tagged candidate at this citation level; the skill requires that topic represented. |
| 16 | `w-kegrzynowski-2024-learning` | Learning dynamics models for velocity estimation in autonomous racing | 2024 | 2024 IEEE/RSJ IROS | 5 (OpenAlex) | IROS venue; top of a five-way tie at 5 citations by venue priority and title order; rounds the list out to 16 with a systems/platform-tagged, recent (2024) IROS paper. |

## Runner-up cluster (5 citations, not selected, for reference)

`gonultas-2023-system` (IROS, systems), `zarrar-2024-tinylidarnet` (IROS, RL/perception, TinyLidarNet — could swap in if Rahul/Billy want an embedded-systems/education-flavored pick), `elmoghazy-2024-real`, `betz-2024-f1tenth` (IEEE Trans. Intelligent Vehicles — this is the F1TENTH education paper by Betz, arguably worth a manual override for the education tag if 16 is expanded to 17+), `trumpp-2024-racemop`, `horvath-2024-teaching` (only other education-tagged 2023+ paper). All tied at 5 citations; any could replace #16 without changing the character of the list. Flagging `betz-2024-f1tenth` in particular since it is the only 2023+ paper carrying the education framing the skill's topic list asks for beyond `horvath-2024-teaching`.

## Title-match failures (flagged, not guessed)

- **`zou-2023-constrained`** ("Constrained Residual Race: An Efficient Hybrid Controller for Autonomous Racing," 2023 China Automation Congress) — no confident match (best OpenAlex candidate was an unrelated 2018 survey). Citation count unknown; excluded from ranking rather than assumed 0.
- **`tanmay-vilas-samak-2024-ea`** ("EA Scalable and Parallelizable Digital Twin Framework...") — the closest OpenAlex candidate, "Mixed-Reality Digital Twins: Leveraging the Physical and Virtual Worlds for Hybrid Sim2Real Transition of Multi-Agent Reinforcement Learning Policies" (2024, 2 citations), shares authors' likely topic but not the title; this may be a retitled/renamed version of the same work or a different paper by the same lab. Not used. If it is the same paper, its citation count (2) would not have changed its rank (would sit below pick #16).
- **`moualhi-2024-experimental`** ("Experimental Evaluation of Deep Neural Networks for Vehicle Model Identification") — no OpenAlex match found under several query phrasings; not yet indexed or under a different venue/title. Citation count unknown.

All three excluded papers had `venue` fields (China Automation Congress, IDETC-CIE, and a blank field respectively) that put them at the bottom of the venue-priority tiebreak in any case, so their omission is unlikely to change the shortlist even once citation counts are confirmed.
