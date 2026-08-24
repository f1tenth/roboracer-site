# xLAB recent papers on the research page

Requested by Cedric, 2026-08-23: *"Let's analyze the xLAB recent papers like SIT-LMPC
etc. They should be in the featured papers (or selected) both in the research page and
in the about page, and be the first paper that comes up."* Source: the lab's own
project index, <https://xlab.upenn.edu/research/>, plus the five per-project pages the
director sent. xLAB is Rahul Mangharam's Safe Autonomous Systems Lab at Penn, the lab
RoboRacer/F1TENTH came out of, so its recent racing work leads the featured set.

Spelling: **xLAB**, never "xLab".

## What is on the lab page

The index at `/research/` lists 26 project pages (not a publication list), newest first,
from *STL-SVPIO* (Aug 6, 2026) back to building-energy and cardiac work from 2023-2024.
Each project page carries the abstract, the contributor list, and usually a hero figure
or video chosen by the authors; several carry the paper link or the BibTeX.

## Added to `public/data/publications.json` (5, all new — none were already on the site)

Checked against all 133 existing records on DOI, arXiv id and normalised title
(`pubs_lib.dedupe_keys`) before adding: zero collisions. They now sit at the head of
`items[]`, which is what makes them render first (see "How they sort" below).

| # | id | paper | year | venue | link | xLAB page |
|---|---|---|---|---|---|---|
| 1 | `wang-2026-ai` | AI Coaching for Accelerating Human Skill Development with Reinforcement Learning | 2026 | arXiv preprint | arXiv 2606.25337 | `/AI-Coaching/` |
| 2 | `amine-2026-nonplanar` | Nonplanar Model Predictive Control for Autonomous Vehicles with Recursive Sparse Gaussian Process Dynamics | 2026 | IEEE IV 2026 | doi 10.1109/iv66570.2026.11623981, arXiv 2602.16206 | `/nonplanar-racing/` |
| 3 | `zang-2026-sit` | SIT-LMPC: Safe Information-Theoretic Learning Model Predictive Control for Iterative Tasks | 2026 | IEEE RA-L 11(1) 986-993 | doi 10.1109/lra.2025.3634881, arXiv 2602.16187 | `/SIT-LMPC/` |
| 4 | `le-2025-hybrid` | A Hybrid Learning-to-Optimize Framework for Mixed-Integer Quadratic Programming | 2025 | arXiv preprint | arXiv 2511.19383 | `/L2OCA/` |
| 5 | `qiao-2024-av4ev` | AV4EV: Open-Source Modular Autonomous Electric Vehicle Platform for Making Mobility Research Accessible | 2024 | IEEE IV 2024 | doi 10.1109/iv55156.2024.10588611, arXiv 2312.00951 | `/av4ev/` |

Order is newest first by paper date, per the brief. Two of the five carried no paper
link on the xLAB page at all:

- **AI Coaching** — matched to arXiv 2606.25337 on an identical abstract, title and
  author list (Wang, Gu, Loquercio, Hu, Mangharam). Found through the arXiv search UI;
  it is not yet in OpenAlex or Crossref.
- **Nonplanar MPC** — the page gives the BibTeX (IEEE IV 2026) but no URL. DOI from
  OpenAlex, arXiv preprint 2602.16206 whose comment reads "Accepted to IEEE Intelligent
  Vehicles Symposium (IV), 2026".

Abstracts are verbatim from the arXiv abstract pages or from Crossref/OpenAlex through
`scripts/resolve_paper.py`. Nothing here was written by hand.

## How they sort first

`src/pages/Research.tsx` builds the featured grid as
`pubs.items.filter(status === "published").filter(p => p.featured)` — **no sort at
all**, so the featured grid is the order of `items[]` in the JSON. Putting the five
records at the head of the array is what makes them come first, and nothing in `src/`
had to change.

`featured_order` is a different key: `src/lib/publications.ts` `featuredForLanding()`
uses it, ascending, and only the **landing** research carousel reads it. The five xLAB
papers were given `featured_order` 1-5 and the eight pre-existing ordered papers were
shifted +5 (to 6-13) so the landing carousel leads with xLAB too. Each shifted record
records the shift in its `notes`.

**The About page does not render publications.** `src/pages/About.tsx` only carries a
stat line, "publications 1,000+", linking to the Google Scholar query
(`SCHOLAR_URL`); there is no publication list or card there. Nothing on About needed a
data change, and nothing in the data can put a paper there. If Cedric wants the xLAB
papers visible on About, that is a component change and belongs in a separate request.

## Pictures

Every one of the five carries `thumbnail` (1200x750), `figure` (1600x1000) and
`row_thumbnail` (320x200), all real figures from the papers themselves, all logged with
source URL and licence in `docs/media/THUMBS.md`. No placeholders were needed.

- `wang-2026-ai` — figure 1 (pre/post-coaching drone trajectories) as thumbnail,
  figure 5 (drone-racing simulation overview) as figure.
- `amine-2026-nonplanar` — the xLAB project page's own hero,
  `img/posts/nonplanar_racing/IsaacSim_resize.png` (the paper's figure 2, the Isaac Sim
  nonplanar track with the car on it). `scripts/paper_thumbs.py` fell back to a PDF
  page-1 crop here because every arXiv HTML raster is under 400 px; the authors' hero at
  1705x899 is the better and more honest picture, so it was used for both sizes.
- `zang-2026-sit` — figure 1 (the SIT-LMPC architecture, the same diagram the project
  page uses) as thumbnail, figure 5a (the real off-road RoboRacer-class vehicle) as
  figure.
- `le-2025-hybrid` — figure 1, the hybrid L2O architecture (also the project page's
  hero, `img/posts/L2OCA/model.png`). The paper's other two figures are box plots.
- `qiao-2024-av4ev` — figure 4, the raceline optimisation at the Purdue Grand Prix
  track, for both sizes; figure 1 (mechatronics block diagram) is unreadable at card
  size. The xLAB page carries no images of its own for this project.

## Judged not racing-relevant, not added

- **STL-SVPIO: Signal Temporal Logic guided Stein Variational Path Integral
  Optimization** (arXiv 2603.13333, Aug 2026) — Hongrui Zheng, Zirui Zang, Ahmad Amine,
  Cristian-Ioan Vasile, Rahul Mangharam. By the RoboRacer core authors, but the paper
  itself is STL task planning demonstrated on multi-agent coordination, 7-DoF
  manipulation and a half-cheetah backflip. No racing, no vehicle. Newest xLAB paper, so
  worth a second look if Cedric wants it in anyway.
- **Failure-Aware Iterative Learning of State-Control Invariant Sets** (arXiv
  2604.06776, Apr 2026, submitted to CDC 2026) — Amine, Kokolakis, Rosolia, Nghiem,
  Mangharam. Invariant-set theory validated on a double integrator; no vehicle
  experiment.
- **Social Influence Games**, **RetroLifts** (warehouse forklifts), **Learning-to-Optimize
  for MIQP** as a standalone `/L4DC/` page (same paper as `le-2025-hybrid`, already
  added once — deliberately not duplicated), **Conformal Prediction for Robotics**,
  **AutoPlug**, **Fly-by-Logic**, **Protodrive**, **Learning Adaptive Safety**,
  **Learning-to-Fly**, the cardiac-modelling projects, and the building-energy projects
  (MLE+, Green Scheduling, IMpACT, DPC, IAX) — none are about autonomous racing, the
  RoboRacer platform, or the stack that runs on it.

## People named on these project pages

Recorded only; no people file was touched. Several of these names appear on the About
page, and the link between a person and the work they published may be wanted later.

- **AI Coaching** — Wei Wang, Enlin Gu, Antonio Loquercio, Rahul Mangharam, Haimin Hu.
- **Nonplanar MPC** — Ahmad Amine, Kabir Puri, Viet-Anh Le, Rahul Mangharam.
- **SIT-LMPC** — Zirui Zang, Ahmad Amine, Nick-Marios T. Kokolakis, Truong X. Nghiem
  (NxT Lab), Ugo Rosolia, Rahul Mangharam.
- **L2OCA / hybrid L2O** — Viet-Anh Le, Mu Xie, Rahul Mangharam.
- **AV4EV** — Zhijie Qiao, Mingyan Zhou, Zhijun Zhuang, Tejas Agarwal, Felix Jahncke,
  Po-Jen Wang, Jason Friedman, Hongyi Lai, Divyanshu Sahu, Tomáš Nagy, Martin Endler,
  Jason Schlessman, Rahul Mangharam. Felix Jahncke also appears on
  `piccinini-2026-trajectory`, already featured.
- **STL-SVPIO** (not added) — Hongrui Zheng, Zirui Zang, Ahmad Amine, Cristian-Ioan
  Vasile (Lehigh), Rahul Mangharam. Hongrui Zheng is first author of the F1TENTH gym.
