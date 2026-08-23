# Partner harvest

`public/data/partners.json` -- **81 partners**, alphabetical by name, every record
`{ name, website, image, image_rest, image_hover, category }`.

| split | count |
| --- | --- |
| university | 65 |
| industry | 9 |
| organization | 7 |
| other | 0 |

The site shipped 20 before this pass. All 20 keep their exact name and stem; `category`
was added to each. **64** come from the old f1tenth.org about page, **17** from elsewhere.

## Provenance of the archive baseline

Two independent copies of the same page were reconciled rather than trusted:

- `_harvest/f1tenth-about-2024/partners-extracted.json` (65 records, parsed from the
  saved 2024-01-09 snapshot)
- `_harvest/repos/f1tenth.github.io/about.html` (the org's own site source, 64 partner
  cards)

They agree exactly on all 64 logo files and all 64 link URLs. The 65th record in the
extraction, `YashPant_zRiQ.jpg -> yashpant.github.io`, is a crew photo and was dropped.
No other row in either copy points at a personal homepage, a GitHub user page or a
profile. The social-link filter used on the snapshot removed nothing real -- the git
source proves the set is complete. **No Wayback refetch was needed and none was done.**

Every one of the 64 logo files was already present in `public/partners/`; nothing was
re-downloaded. Only three logos were fetched from the network in this pass (NVIDIA, WVU,
Bonn), all from Wikimedia Commons.

## Industry and organization records are historical competition sponsors

The archive page has essentially no industry partners -- 62 of its 64 entries are
universities, the other two are Autoware Foundation and the Polish Academy of Sciences.
Every `industry` record and five of the seven `organization` records therefore come from
the sponsor boards of RoboRacer's own past race sites in `_harvest/repos/`.

These are **historical, per-competition sponsors**, not confirmed current sponsors. The
`roboracer-content` skill is explicit that zero sponsors is the correct current state and
that no sponsor is listed without written confirmation -- that still holds for the
sponsors block, which must keep rendering zero. This table partially fills the skill's
open `Historical sponsors: TODO(content), ask Rahul` item.

## Table

| name | category | stem | source of the logo | link | notes |
| --- | --- | --- | --- | --- | --- |
| Arizona State University | university | `asu.png` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | https://www.asu.edu/ |  |
| Austrian Federal Ministry for Innovation, Mobility and Infrastructure (BMIMI) | organization | `bmimi.png` | `_harvest/repos/icra2026_race/index.md` "Sponsors:" -> `https://www.bmimi.gv.at/` | https://www.bmimi.gv.at/ | government ministry -> organization |
| Austrian Research Promotion Agency (FFG) | organization | `ffg.png` | `_harvest/repos/icra2026_race/index.md` "Sponsors:" -> `https://www.ffg.at/` | https://www.ffg.at/ | national funding agency -> organization |
| Autoware | organization | `autoware.jpg` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | https://www.autoware.org/ | foundation, not a company -> organization |
| Binghamton University | university | `binghamton.png` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | https://www.binghamton.edu/ |  |
| Boston University | university | `bu.png` | `_harvest/repos/bu2024_race/index.html` -- "F1TENTH BU 2024 ... Boston University (BU) will host an ..."; logo also shipped in the old site's `partners/` folder | https://www.bu.edu/ | logo was in the old site repo but never rendered on about.html |
| Carnegie Mellon University | university | `cmu.jpg` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | https://www.cmu.edu/ |  |
| City University of New York (CUNY) | university | `cuny.png` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | https://www.cuny.edu/ |  |
| Clemson University | university | `clemson.png` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | http://www.clemson.edu/ |  |
| Columbia University | university | `columbia.png` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | https://www.columbia.edu/ |  |
| Czech Technical University | university | `czech.png` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | https://www.cvut.cz/en |  |
| Duke University | university | `duke.png` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | https://duke.edu/ |  |
| ETH Zurich | university | `ethzurich.png` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | https://ethz.ch/en.html |  |
| George Mason University | university | `georgemason.png` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | https://www2.gmu.edu/ |  |
| Georgia Tech | university | `GAtech.png` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | https://www.gatech.edu/ |  |
| GM Korea | industry | `gmkorea.png` | `_harvest/repos/korea-race/_layouts/index.html` "Sponsers:" `sponsor_gm.png` alt="GM" | https://www.gm-korea.co.kr/ | Korea race sponsor board; no href on the page, URL resolved to the official GM Korea site |
| Guizhou University | university | `guizhoulogo.png` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | http://www.gzu.edu.cn/en/ |  |
| Halmstad University | university | `halmstad.jpg` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | https://www.hh.se/english.html |  |
| Hong Kong Polytechnic University | university | `hongkongpoly.png` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | https://www.polyu.edu.hk/en/ |  |
| HTU TU Wien | organization | `htu.png` | `_harvest/repos/icra2026_race/index.md` "Sponsors:" -> `https://htu.at/` | https://htu.at/ | TU Wien student union -> organization |
| Indian Institute of Technology Bombay | university | `iit.png` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | https://www.iitb.ac.in/ |  |
| Institut Polytechnique de Paris | university | `polytechparis.jpg` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | https://www.ip-paris.fr/en |  |
| KAIST | university | `kaist.png` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | http://www.kaist.edu/ |  |
| Kansas State University | university | `kansas.png` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | https://www.k-state.edu/ |  |
| Karlsruhe Institute of Technology (KIT) | university | `kit.png` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | https://www.kit.edu/english/index.php |  |
| KNAPP | industry | `knapp.png` | `_harvest/repos/icra2026_race/index.md` "Sponsors:" -> `https://www.knapp.com/en/` | https://www.knapp.com/en/ | ICRA 2026 Vienna headline sponsor |
| Korea Automotive Technology Institute (KATECH) | organization | `katech.png` | `_harvest/repos/korea-race/_layouts/index.html` `sponsor_KATECH.png` alt="KATECH" | http://www.katech.re.kr/ | government research institute -> organization |
| Korea Electronics Technology Institute (KETI) | organization | `keti.png` | `_harvest/repos/korea-race/_layouts/index.html` `sponsor_KETI.png` alt="KETI" | https://www.keti.re.kr/ | government research institute -> organization |
| KTH Royal Institute of Technology | university | `kth.png` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | https://www.kth.se/en |  |
| Kyungpook National University | university | `kyungpook.png` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | https://en.knu.ac.kr/ |  |
| Lehigh University | university | `lehigh.png` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | https://www1.lehigh.edu/ |  |
| Lund University | university | `lund.png` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | https://www.lunduniversity.lu.se/ |  |
| Magna | industry | `magna.png` | `_harvest/repos/icra2026_race/index.md` "Sponsors:" -> `https://www.magna.com/` | https://www.magna.com/ | ICRA 2026 |
| Massachusetts Institute of Technology (MIT) | university | `mit.png` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | http://www.mit.edu/ |  |
| Nagoya University | university | `nagoya.png` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | http://en.nagoya-u.ac.jp/ |  |
| New York University (NYU) | university | `nyu.png` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | https://www.nyu.edu/ |  |
| Northwestern University | university | `northwestern.png` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | https://www.northwestern.edu/ |  |
| NVIDIA | industry | `nvidia.png` | Cedric, 2026-08-23, direct instruction ("industry (like NVIDIA)") | https://www.nvidia.com/ | **NO PAGE CITATION FOUND.** NVIDIA appears in harvested sources only as a crew employer on the old about page, as one of several permitted compute examples in `public/rules.md`, and as Jetson in the BOM. Confirm or drop. |
| Oregon State University | university | `oregon.png` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | https://oregonstate.edu/ |  |
| Osaka University | university | `osaka.png` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | https://www.osaka-u.ac.jp/ |  |
| Polish Academy of Sciences | organization | `pan.png` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | http://pan.pl/ | `pan.png` -> `pan.pl` -> organization |
| Purdue University | university | `purdue.png` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | https://www.purdue.edu/ |  |
| Qualisys | industry | `qualisys.png` | `_harvest/repos/icra2026_race/index.md` "Sponsors:" -> `https://www.qualisys.com/` | https://www.qualisys.com/ | motion capture, ICRA 2026 |
| Riders.ai | industry | `riders.png` | `_harvest/repos/iros2021_website/index.html` -> `https://riders.ai/about` | https://riders.ai/ | IROS 2021 virtual race platform |
| Rutgers University | university | `rutgers.png` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | https://www.rutgers.edu/ |  |
| San Jose State University | university | `sjsu.png` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | https://www.sjsu.edu/ |  |
| Seoul National University | university | `seoulnationaluni.png` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | https://en.snu.ac.kr/ |  |
| Seoul National University of Science and Technology (SeoulTech) | university | `seoultech.png` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | https://en.seoultech.ac.kr/ |  |
| SICK AG | industry | `sick.png` | sponsor board on 15+ race sites, e.g. `_harvest/repos/icra2022-race_website/index.html` ("Sponsors" then `images/sponsor_sick.png`) | https://www.sick.com/ | historical per-competition sponsor |
| sonnet.ai | industry | `sonnetai.png` | `_harvest/repos/korea-race/_layouts/index.html` `sponsor_sonnetai.png` alt="소네트AI" | https://sonnet.ai/ | logo wordmark reads "sonnet.ai - The poetic designers" |
| Stony Brook University | university | `stonybrook.png` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | https://www.stonybrook.edu/ |  |
| Technical University of Munich (TUM) | university | `munich.png` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | https://www.tum.de/en/ |  |
| Tecnológico de Monterrey | university | `monterrey.jpg` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | https://tec.mx/es |  |
| Temple University | university | `temple.png` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | https://www.temple.edu/ |  |
| Tier IV | industry | `tier4.png` | `_harvest/repos/*/index.html` sponsor anchor -> `https://tier4.jp/en/` | https://tier4.jp/en/ | Autoware's originator |
| TU Dortmund University | university | `tu.png` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | https://www.tu-dortmund.de/en/ | the green `tu` mark; identified from its link `tu-dortmund.de` |
| TU Wien | university | `vienna.png` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | https://www.tuwien.at/en/ |  |
| Universidad de Costa Rica | university | `costarica.png` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | https://www.ucr.ac.cr/ |  |
| University of Antwerp | university | `uant.png` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | https://www.uantwerpen.be/en/ | archive shipped `antwerp.png` at 205x62; using `uant.png` (2430x782) from the same repo folder instead -- the tint script never upscales |
| University of Bonn | university | `bonn.png` | `public/data/teams.json` -- institution "University of Bonn" (Team Unicorn) | https://www.uni-bonn.de/en | logo: Wikimedia Commons `File:Universität Bonn.svg` (960px PNG render) |
| University of California, Berkeley | university | `ucb.png` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | https://www.berkeley.edu/ |  |
| University of California, Irvine | university | `uci.png` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | https://uci.edu/ |  |
| University of California, Los Angeles | university | `ucla.png` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | http://www.ucla.edu/ |  |
| University of California, Riverside | university | `ucr.png` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | https://www.ucr.edu/ |  |
| University of California, San Diego | university | `ucdsd.png` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | https://ucsd.edu/ |  |
| University of Central Florida | university | `ucf.png` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | https://www.ucf.edu/ |  |
| University of Colorado Boulder | university | `colorado.png` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | https://www.colorado.edu/ |  |
| University of Connecticut | university | `uconn.png` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | https://uconn.edu/ |  |
| University of Iowa | university | `iowa.png` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | https://uiowa.edu/ |  |
| University of Maryland | university | `maryland.png` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | https://www.umd.edu/ |  |
| University of Modena and Reggio Emilia (UNIMORE) | university | `unimore.jpg` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | https://www.unimore.it/en/ |  |
| University of Nebraska–Lincoln | university | `nebraska.png` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | https://www.unl.edu/ |  |
| University of New Mexico | university | `unm.png` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | https://www.unm.edu/ |  |
| University of North Carolina at Chapel Hill | university | `northcarolina.png` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | https://www.unc.edu/ |  |
| University of Pennsylvania | university | `upenn.png` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | https://www.upenn.edu/ |  |
| University of Southern California | university | `usc.png` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | https://www.usc.edu/ |  |
| University of Texas at Austin | university | `unitexas.png` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | https://www.utexas.edu/ |  |
| University of Toronto | university | `utoronto.png` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | https://www.utoronto.ca/ |  |
| University of Virginia | university | `virginia.png` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | https://www.virginia.edu/ |  |
| Vanderbilt University | university | `vanderbilt.png` | old f1tenth.org /about.html (2024-01-09 archive + `_harvest/repos/f1tenth.github.io/about.html`) | https://www.vanderbilt.edu/ |  |
| West Virginia University | university | `wvu.png` | `public/data/teams.json` -- institution "West Virginia University", 3rd place IV 2026 | https://www.wvu.edu/ | logo: Wikimedia Commons `File:West Virginia University logo.svg` (960px PNG render) |

## Not recovered / open

- **Nothing from the archive checklist is missing.** All 64 partners on the 2024 about
  page are in the JSON, including the four Cedric asked about by name: KAIST, Kyungpook
  National, Seoul National, SeoulTech.
- **NVIDIA has no page citation.** It is the single record sourced to Cedric's spoken
  instruction rather than a URL. Confirm it or I drop it.
- **Locomotion** -- a sponsor logo (`sponsor_locomotion.jpeg`) appears on 15+ race sites
  next to SICK, but no race site links it and the wordmark alone was not enough to
  identify the company with confidence. The file is parked at
  `public/partners/locomotion.jpeg`, **not** referenced by the JSON. Needs a URL from
  Cedric or Rahul.
- **KEMCTI** (`_harvest/repos/korea-race/images/sponsor_KEMCTI.png`, alt="LINC") and
  **LINC 3.0** (`sponsor_LINC3.png`) -- two Korean university-industry cooperation
  programme marks on the Korea race sponsor board. Not identified confidently enough to
  publish; left out.
- **NSF grants CNS 1925500 / 1925587** are credited in a commented-out block on several
  race sites ("Partial support provided by NSF Grant ..."). A funder, no logo on any
  page; not added.
- No record needed the `other` category.

## Unreferenced files left in `public/partners/`

Kept on disk, deliberately not in the JSON, so no institution has two stems:

- `antwerp.png` (205x62) -- superseded by `uant.png` (2430x782), same institution
- `binghamtonUni.png` (3059x347) -- `binghamton.png` is the shipped stem and is preserved
- `locomotion.jpeg` -- see above

## URLs that did not answer 200/301/302

Checked with `curl -sSI -L`:

- `https://www.berkeley.edu/`, `https://www.wvu.edu/`, `https://www.ffg.at/` -- **403**
  to curl, load normally in a browser. Bot blocking; left as-is.

Four dead URLs inherited from the 2024 archive were repaired:

| institution | was | now |
| --- | --- | --- |
| Indian Institute of Technology Bombay | `http://www.iitb.ac.in/` (no answer) | `https://www.iitb.ac.in/` |
| Institut Polytechnique de Paris | `https://www.ip-paris.fr/en/home-en/` (404) | `https://www.ip-paris.fr/en` |
| KATECH | `https://www.katech.re.kr/` (bad cert chain) | `http://www.katech.re.kr/` |
| UNIMORE | `http://www.international.unimore.it/` (dead host) | `https://www.unimore.it/en/` |

## Pipeline

`python3 scripts/partner-tint.py --strength 0.04` (the approved value, unchanged) was run
after the JSON was final. It wrote 81 files to `public/partners/tint/` and 81 to
`public/partners/color/` and filled `image_rest` / `image_hover` on every record. Largest
committed original is `duke.png` at 1.0 MB; everything else is well under the 1.5 MB cap.
