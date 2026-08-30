# Contributor harvest report

**Generated** 2026-08-23 · **Source** GitHub REST API via `gh` · **Node** `scripts/harvest-contributors.mjs`
**Outputs** `public/data/contributors.json`, `public/data/contributors.schema.json`

Regenerate with:

```
node scripts/harvest-contributors.mjs
```

It prints one summary line, validates its own output against the schema, and
writes both files atomically (`.tmp` then `rename`). No npm dependencies; it
shells out to `gh`.

---

## Headline numbers

| | |
|---|---|
| Repos in the `f1tenth` org | 203 |
| **Public repos harvested** | **49** |
| Private repos excluded | 154 |
| Repos that yielded at least one contributor | 44 |
| **Contributors** | **49** |
| Active (commit on or after 2026-02-23) | 5 |
| Past | 44 |
| Bot accounts excluded | 1 (`dependabot[bot]`) |
| Identity merges applied | 0 |

`gh auth status` at run time, verbatim:

```
github.com
  ✓ Logged in to github.com account cedrichld (keyring)
  - Active account: true
  - Git operations protocol: https
  - Token: gho_************************************
  - Token scopes: 'gist', 'read:org', 'repo', 'workflow'
```

Auth held for the whole run. Nothing was half-harvested.

---

## Three things to decide before this goes on a page

### 1. The `f1tenth` org is 76% private, and that is where 2026 lives

`gh api orgs/f1tenth/repos --paginate` returns 203 repos **because the token is
an org member with `repo` scope**. Only 49 of them are public. The harvest takes
the public 49 and nothing else: publishing names, commit counts, or activity
dates derived from a private repo would leak both the repo's existence and who
is working in it onto a public website. That is not a call a harvester should
make quietly, so it is made explicitly and flagged here.

The cost of that choice, measured (aggregates only — no private repo names, and
no list of the people involved, are recorded in this file):

- 62 distinct GitHub accounts have commits in the private repos.
- **48 of them appear in no public repo at all** — they are invisible in
  `contributors.json`. Including private repos would take the roster from 49 to
  roughly 97.
- Four more people would flip from `past` to `active`, taking the active count
  from **5 to 9**.
- Most visibly: **`hzheng40` (Hongrui "Billy" Zheng), the top contributor by a
  wide margin at 479 commits, is marked `past`.** His most recent public commit
  is 2026-02-02, three weeks before the cutoff. He has 2026 activity, but it is
  in a private repo. A contributors wall that renders him as inactive will look
  wrong to anyone who knows the project.

To see the full picture without publishing it, the script takes
`--include-private`. It refuses to write anywhere under `public/`:

```
node scripts/harvest-contributors.mjs --include-private --out /tmp/contributors-full.json
```

**Decision needed from Cedric:** stay public-only (safe, but under-counts and
mis-labels the lead contributor), or make selected repos public first and
re-run. The second option is the one that makes the data honest.

### 2. The active cutoff is 6 months, not 18

The brief said "on or after 2026-02-23 (18 months before today, 2026-08-23)".
2026-02-23 is **six** months before 2026-08-23, not eighteen. The explicit date
was used, since it was unambiguous. If 18 months was the real intent, the date
is `2025-02-23` — change `ACTIVE_SINCE` at the top of the script and re-run;
nothing else needs touching. On the public data that widens active from 5 to
**13**.

### 3. Six people have no display name

Their GitHub profile has no name and they never signed a commit with anything
other than their login or a machine name. `name` is `null` for them and the site
should fall back to the login. Nothing was guessed.

---

## Scope decisions

### Organisations

- **`f1tenth`** — harvested. The only source.
- **`roboracer`** — **does not exist as an organisation.** `gh api orgs/roboracer`
  returns `404 Not Found`. A GitHub *user* account named `roboracer` does exist
  (id 15431176, created 2015-10-30) but it has 0 public repos, no name, no bio,
  and no visible connection to this project. It was not harvested.

### Forks

Forks were included only for commits that are **both** ahead of the parent
**and** authored on or after the fork was created. Both halves matter: comparing
`f1tenth/edx-platform` against `openedx:master` reports 29 commits ahead, but 25
of those are upstream Open edX release engineering from before the fork existed.
Without the date floor, ten Open edX developers who never touched RoboRacer —
`nedbat`, `feanil`, `sarina`, `kdmccormick`, `0x29a`, `crice100`, `nizarmah`,
`farhaanbukhsh`, `Ali-D-Akbar`, `cmltaWt0` — landed in the contributor list. They
are correctly absent now.

| Fork | Parent | Original commits kept | People |
|---|---|---|---|
| `f1tenth_coursekit` | `kimnluong/f1tenth_coursekit` | 94 | 7 |
| `particle_filter` | `mit-racecar/particle_filter` | 31 | 1 |
| `range_libc` | `kctess5/range_libc` | 22 | 1 |
| `ackermann_mux` | `ros-teleop/twist_mux` | 4 | 1 |
| `teleop_tools` | `ros-teleop/teleop_tools` | 4 | 1 |
| `edx-platform` | `openedx/openedx-platform` | 4 | 1 (`lpm0073`) |
| `AutonomousRacing_Literature` | `JohannesBetz/…` | 0 | — dropped |
| `f1tenth_gym_jax` | `f1tenth/f1tenth_gym` | 0 | — dropped |
| `foxglove-onboard` | `JChunX/foxglove-onboard` | 0 | — dropped |
| `vesc-firmware` | `RacecarJ/vesc-firmware` | 0 | — dropped |

The four zero-ahead forks are exact mirrors carrying no original commits.
`f1tenth_gym_jax` is a fork of the org's own `f1tenth_gym`, so its history is
already counted there and counting it again would double-count.

### Course-lab repos

Every GitHub Classroom student-submission repo (`lab-N-<assignment>-<student>`,
`project-…-team_NN`) in this org is **private**, so none were harvested. The
schema still carries `classroom` per repo and `commits_platform` /
`platform_contributor` per person, so that if private repos are ever included
the site can separate platform work from coursework without another harvest.
On the current public data `classroom_repos` is 0 and
`commits_platform == commits` for everyone.

---

## Bots excluded

Only one automation account appeared in the public repos: **`dependabot[bot]`**.

The filter also covers, by `type: "Bot"`, by a `[bot]` login suffix, and by an
explicit list: `dependabot-preview`, `github-actions`, `github-classroom`,
`renovate`, `allcontributors`, `imgbot`, `codecov`, `greenkeeper`, `snyk-bot`,
`stale`, `mergify`, `semantic-release-bot`, `actions-user`, `web-flow`,
`invalid-email-address`, `copilot`, `pre-commit-ci`, `readthedocs-assistant`,
`netlify`. None of the others were encountered.

---

## Identity merges

**None were applied.** The `MERGE_INTO` map in the script is empty by design —
merges are declared explicitly and auditably, never inferred fuzzily. GitHub's
`stats/contributors` endpoint already keys by account, so duplicate *logins* for
one account cannot occur; the only real risk is one human with two accounts.

Candidates examined and **rejected**:

- **`zzangupenn` vs `zzjun725`** — similar-looking logins, both Penn, both in the
  lab-template repos, and `zzangupenn`'s profile has no name. Checked the commit
  author names: `zzangupenn` signs as **Zirui Zang**, `zzjun725` signs as
  **ZhijunZhuang** / `zhijunz`. Two different people. Not merged.
- **`Tinker-Twins`** — one GitHub account, but the profile states it is shared by
  two people (Tanmay Samak and Chinmay Samak, ARMLab CU-ICAR). It is a real
  account, not a bot, and there is no evidence for splitting two commits between
  them, so it stays as a single entry. Worth knowing if it is ever rendered as a
  single face with a single name.
- **`tbalch-tri`, `velinddimitrov-tri`** — the `-tri` suffix suggests a shared
  employer, but neither profile states a company, so no affiliation was recorded.
  Nothing invented.

### Where `name` comes from

`name_source` records this per contributor.

- `github_profile` — 40 people. The profile's display name.
- `commit_author` — 3 people. The profile has no display name, so the name they
  themselves signed their commits with was used: `zzangupenn` → **Zirui Zang**,
  `tbalch-tri` → **Thomas Balch**, `dianax3dh` → **Diana**. This is published
  data from the repo's own history, not a guess. Junk that git records by
  default (bare logins, `DESKTOP-XXXX\user`, email-shaped strings) is rejected.
- `null` — 6 people: `Carperis`, `velinddimitrov-tri`, `AdeebTarzi`, `excuice`,
  `hanseunghan`, `MLN-MNJ`. No name anywhere. Render the login.

---

## What the API would not give

- **`vesc-release`** — `stats/contributors` returns HTTP 202 ("computing")
  forever, never data. Its single commit has an unlinked author, so GitHub has
  nothing to attribute and never finishes. The script now falls back to walking
  the commit list; the walk confirms there is no attributable contributor. The
  repo contributes nobody, correctly.
- **Unlinked commit authors generally.** Commits whose email is not attached to
  any GitHub account come back with `author: null` and cannot be credited to a
  person. They are counted by neither the contributor totals nor the per-repo
  totals. In the private-repo scan alone this was 346 of 2,519 commits (~14%),
  so the same order of loss should be assumed here. There is no fix that does
  not involve guessing at identities from email addresses, which this harvest
  does not do.
- **Default branch only.** `stats/contributors` covers the default branch.
  Work that lives only on an unmerged branch is invisible. Squash- and
  merge-commits land on the default branch, so ordinary PR work is counted.
- **Commit dates are exact, but only at the two ends.** The stats endpoint
  returns weekly buckets (UTC week-start), not timestamps. The script recovers
  the true first and last commit date for every contributor with a targeted
  lookup against the repo that produced each extreme, so `first_commit` and
  `last_commit` are exact. Per-repo entries carry commit counts only, no dates.
- **Top 100 contributors per repo.** A documented cap on `stats/contributors`.
  No public repo in this org comes close to it.
- **`orgs/roboracer`** — 404, as above. `gh` also suggests the `admin:org` scope
  on that failure; the scope is irrelevant here, the org simply does not exist.

### One API trap worth recording

`gh api "orgs/f1tenth/repos?type=public&sort=full_name&per_page=100&page=N"`
silently returns **49 repos on page 1 and nothing on page 2**, with no error.
Drop `sort=full_name` and the same endpoint paginates correctly to 203. The
script carries a comment warning against re-adding it. Anything that quietly
truncates a list at 49 while looking successful is worth remembering.

---

## Privacy

Public professional data only: `login`, `name`, `avatar_url`, `profile_url`,
`company`, `blog`. **No email address, no phone number, no location, and nothing
from any personal-life source** is read or stored. `stripPrivate()` in the
script whitelists the six fields, so a future GitHub API change cannot introduce
a new field by accident, and the schema sets `additionalProperties: false` at
every level so an unexpected key fails validation rather than shipping. The
generated file was swept for email- and phone-shaped values: none.

---

## Output shape

`public/data/contributors.json`, validated against
`public/data/contributors.schema.json` on every run (draft 2020-12; the script
carries a small validator for the subset the schema uses, so there is no new
dependency). Contributors are sorted by total commits descending, ties broken by
login.

```json
{
  "generated_at": "2026-08-23T…Z",
  "source": "github",
  "orgs": ["f1tenth"],
  "active_since": "2026-02-23T00:00:00Z",
  "stats": { "repos_scanned": 49, "private_repos_excluded": 154, "…": 0 },
  "contributors": [
    {
      "login": "AhmadAmine998",
      "name": "Ahmad Amine",
      "name_source": "github_profile",
      "avatar_url": "https://avatars.githubusercontent.com/u/35192516?v=4",
      "profile_url": "https://github.com/AhmadAmine998",
      "company": "University of Pennsylvania",
      "blog": "https://ahmadamine998.github.io/",
      "commits": 62,
      "commits_platform": 62,
      "first_commit": "2024-09-01",
      "last_commit": "2026-07-09",
      "active": true,
      "platform_contributor": true,
      "repos": [{ "name": "f1tenth_doc", "commits": 13, "classroom": false }]
    }
  ]
}
```

Additions to the shape the brief suggested, and why:

- `active_since` — the cutoff travels with the data, so a stale file cannot be
  misread as current.
- `stats` — lets a page state its own provenance ("49 contributors across 49
  public repos") without recomputing, and makes the private-repo exclusion
  visible in the file itself.
- `name_source` — distinguishes a profile name from a commit-signature name, so
  the earlier claim that nothing was invented is checkable from the data.
- `commits_platform`, `platform_contributor`, `repos[].classroom` — inert today
  (all classroom repos are private) but ready if private repos are ever
  included, so coursework never silently inflates a contributor wall.
- `aliases` — present only on merged entries. Nothing carries it today.

---

## Full roster

49 contributors, commits descending. `*` = active.

| Commits | Login | Name | Company | First | Last |
|---:|---|---|---|---|---|
| 479 | hzheng40 | Hongrui (Billy) Zheng | — | 2019-12-08 | 2026-02-02 |
| 178 | kimnluong | Kim Luong | — | 2020-02-23 | 2020-10-19 |
| 136 | zzangupenn | Zirui Zang | — | 2022-01-09 | 2023-03-28 |
| 62 * | AhmadAmine998 | Ahmad Amine | University of Pennsylvania | 2024-09-01 | 2026-07-09 |
| 30 | Shreyas0812 | Shreyas Raorane | — | 2025-10-05 | 2026-01-20 |
| 24 | kimestelle | Eunyul Kim | — | 2025-01-26 | 2025-03-10 |
| 23 | travelbureau | Matthew O'Kelly | University of Pennsylvania | 2018-06-03 | 2021-01-22 |
| 20 | nandantumu | Nandan Tumu | — | 2018-07-22 | 2024-04-26 |
| 10 | dianax3dh | Diana | — | 2020-03-08 | 2020-07-06 |
| 9 | gundaakhil | AKHIL GUNDA | — | 2024-02-07 | 2024-03-25 |
| 7 | ameliapqy | Amelia Peng | — | 2020-11-26 | 2020-12-20 |
| 7 | luigiberducci | Luigi Berducci | TU Wien | 2024-02-04 | 2024-02-09 |
| 7 | vishnuv4 | Vishnu Venkatesh | — | 2024-12-15 | 2024-12-21 |
| 5 | jetag | Tejas Agarwal | Scout Robotics | 2023-09-03 | 2023-09-05 |
| 4 * | Amnx404 | Aman | University of Pennsylvania | 2026-04-19 | 2026-06-16 |
| 4 | Carperis | — | — | 2025-03-16 | 2025-03-22 |
| 4 | JohannesBetz | Johannes Betz | Technical University of Munich | 2021-02-14 | 2022-05-18 |
| 4 | lpm0073 | Lawrence McDaniel | — | 2020-12-24 | 2021-01-05 |
| 4 | velinddimitrov-tri | — | — | 2023-02-12 | 2023-02-12 |
| 3 | botforge | Dhruv Karthik | — | 2019-12-08 | 2019-12-12 |
| 3 | JeffersonKoumbaMoussadjiLu | Jefferson Koumba Moussadji Lu | — | 2026-01-11 | 2026-01-14 |
| 2 | Lj1212am | Lee Milburn | — | 2025-01-19 | 2025-01-24 |
| 2 | rahulmangharam | Rahul Mangharam | University of Pennsylvania | 2024-02-14 | 2024-03-18 |
| 2 | tbalch-tri | Thomas Balch | — | 2022-06-05 | 2022-06-21 |
| 2 | Tinker-Twins | Tinker Twins | ARMLab, CU-ICAR | 2025-11-09 | 2025-11-12 |
| 2 | zzjun725 | ZhijunZhuang | University of Pennsylvania | 2023-01-08 | 2023-03-01 |
| 1 | abhaybd | Abhay Deshpande | — | 2022-11-27 | 2022-12-01 |
| 1 * | AdeebTarzi | — | — | 2026-06-28 | 2026-07-01 |
| 1 | ayoubraji | Ayoub Raji | — | 2020-07-05 | 2020-07-08 |
| 1 | BDEvan5 | Benjamin Evans | InstaDeep | 2021-02-07 | 2021-02-11 |
| 1 * | cedrichld | Cedric Hollande | University of Pennsylvania | 2026-08-02 | 2026-08-08 |
| 1 | coDeWITHpsYcho | Ganesh Chandan | — | 2025-09-28 | 2025-10-01 |
| 1 | Damowerko | Damian Owerko | @Penn-Electric-Racing | 2023-01-22 | 2023-01-22 |
| 1 | eghignone | Edoardo Ghignone | — | 2021-10-17 | 2021-10-22 |
| 1 | excuice | — | — | 2022-05-08 | 2022-05-08 |
| 1 | Gongsta | Steven Gong | University of Waterloo | 2023-05-28 | 2023-05-29 |
| 1 | hanseunghan | — | — | 2018-09-30 | 2018-10-05 |
| 1 | horverno | Ernő Horváth | Szechenyi University | 2025-06-22 | 2025-06-24 |
| 1 | jara001 | Jaroslav Klapálek | — | 2022-02-20 | 2022-02-25 |
| 1 | jauckley | Joe Auckley | — | 2020-01-26 | 2020-01-28 |
| 1 | Kurtoid | Kurt Wilson | — | 2020-10-11 | 2020-10-17 |
| 1 | maforn | Matteo Fornaini | — | 2024-12-15 | 2024-12-18 |
| 1 | Maximellerbach | Maxime Ellerbach | @huggingface | 2021-02-21 | 2021-02-21 |
| 1 * | MLN-MNJ | — | — | 2026-06-21 | 2026-06-25 |
| 1 | pburgio | Paolo Burgio | @HiPeRT | 2018-06-03 | 2018-06-08 |
| 1 | snoyes | Scott Noyes | — | 2022-09-18 | 2022-09-20 |
| 1 | SophieGruenbacher | Sophie A. Neubauer (née Gruenbacher) | @DatenVorsprung | 2020-03-29 | 2020-04-02 |
| 1 | ValerioMagnago | Valerio Magnago | Magazino GmbH | 2023-02-19 | 2023-02-19 |
| 1 | varundevsukhil | Varundev Sukhil | — | 2018-07-15 | 2018-07-17 |

Note that `jara001` shows a single 2022 commit here but is one of the four
people whose recent work is private-only — another illustration of the scope
question at the top of this report.

---

## Verification performed

- The uncached run (`node scripts/harvest-contributors.mjs`, 278 API calls, no
  cache) and the cached run produce **byte-identical** output apart from
  `generated_at`.
- Output validates against `contributors.schema.json` on every run; the run
  aborts non-zero rather than writing an invalid file.
- Contributors confirmed sorted by commits descending.
- Privacy sweep for email- and phone-shaped values: clean.
- `--include-private` refuses to write under `public/`, both with no `--out`
  and with an explicit `public/` path (exit 2, verified).


---

## Director's decisions on this harvest (2026-08-23)

Two questions the harvest raised, decided in the session rather than left open.

**1. The activity window is eighteen months, not six.** The brief asked for
"a commit in the last 18 months" and then wrote 2026-02-23, which is six
months back. The words are the requirement and the date was an arithmetic
slip, so `ACTIVE_SINCE` is `2025-02-23` and the harvest was re-run.
**Active went from 5 to 13**, and Hongrui (Billy) Zheng - the top contributor
at 479 commits, whose last *public* commit is 2026-02-02 - is correctly
active again. Change the one constant in `scripts/harvest-contributors.mjs`
and re-run to move the window.

**2. Private repositories stay out.** Confirmed. 154 of the org's 203 repos
are private; the token can see them because Cedric is an org member. Deriving
a public contributors wall from them would publish both the existence of those
repos and who works in them. The public harvest is the one that ships. The
`--include-private` flag exists for Cedric's own counting and refuses to write
under `public/`.

The consequence to keep in mind: **~48 people who only commit in private repos
are absent from the published roster.** That is a deliberate privacy floor, not
an omission - if any of them should appear on the About page, they are added as
curated Crew with a public source, the way Cedric Hollande and Ahmad Amine are.
