# public/data/news.json copy pass

Every item on /news. Rows are keyed by item `id`. Dates, names, places,
numbers and links are unchanged. "(cut)" means the excerpt is now `null`
because it only repeated the headline; the card renders without it.

| Location | Before | After | Rule broken |
|---|---|---|---|
| ifac2026-busan-largest-race, `more.label` | Full results | See the full results | 6 (link is verb + object) |
| iros2026-registration-closes-sep-5, excerpt | The 31st RoboRacer Autonomous Racing Competition runs September 28 to 30, 2026 at the David L. Lawrence Convention Center in Pittsburgh, with check-in and practice on September 27. The format is multi-agent racing with up to four cars on track. Register your team by September 5. | The competition runs September 28 to 30, 2026 at the David L. Lawrence Convention Center in Pittsburgh. Check-in and practice are on September 27. Up to four cars race at once. Register your team by September 5. | 1 (48 words; the headline already names the 31st and IROS), 2 ("multi-agent"), 4 |
| ifac2026-busan-opens, excerpt | The 29th RoboRacer Autonomous Racing Competition runs August 24 to 27, 2026 at BEXCO in Busan, Republic of Korea. Teams bring their own 1/10-scale car and their own software. | The competition runs August 24 to 27, 2026 at BEXCO in Busan, Republic of Korea. Teams bring their own 1/10-scale car and software. | 1 (headline already says "29th competition") |
| post-knapp-538432, title | KNAPP on what autonomous racing shares with intralogistics | KNAPP on what autonomous racing shares with warehouse logistics | 2 ("intralogistics") |
| post-knapp-538432, excerpt | On the parallels between autonomous motorsport and intralogistics. | (cut) | 5 (repeats the headline), 2 |
| post-dhruv-jaiswal-498753, title | Carnegie Mellon finish 5th of 17 teams at IV 2026 | Carnegie Mellon finishes 5th of 17 teams in Detroit | American grammar (content skill); Detroit moved up from the excerpt, IV 2026 is on the card's tag |
| post-dhruv-jaiswal-498753, excerpt | 5th of 17 teams at IV 2026 in Detroit, representing Carnegie Mellon University. | (cut) | 5 (repeats the headline) |
| post-manasi-shrekhar-990273, excerpt | 2nd place at the 28th RoboRacer competition at IEEE IV 2026 in Detroit. | (cut) | 5 (repeats the headline; "28th" is in the Thunderbolt headline) |
| iv2026-detroit-thunderbolt-wins, excerpt | Cedric Hollande from the University of Pennsylvania (UPenn) took first place at IEEE IV 2026 with Thunderbolt and an MPPI controller, ahead of 404 Racers also from UPenn in second and West Virginia University in third. | Cedric Hollande (UPenn) won with an MPPI controller. 404 Racers, also from UPenn, came second and West Virginia University third. | 1 (37 words), 4 (one sentence with four ideas) |
| post-milan-manoj-110976, title | A Frenet-frame MPC and an overtaking planner, second at IV 2026 | How 404 Racers finished second at IV 2026 | 4 (noun pile as a headline), 2 |
| post-milan-manoj-110976, excerpt | Second place at IV 2026 with a Frenet-frame MPC and an overtaking planner. | A Frenet-frame MPC and an overtaking planner. | 5 (repeated the result); the method stays, it is the specific part |
| post-meghaj-kabra-054784, title | Roboracer @ Purdue place 10th in their first competition | Roboracer @ Purdue places 10th in its first competition | American grammar |
| post-meghaj-kabra-054784, excerpt | Roboracer @ Purdue placed P10 at IV 2026, its first competition. | (cut) | 5 (repeats the headline), 2 ("P10") |
| post-samir-shehadeh-344832, title | LAMARRacing set the fastest car of ICRA 2026 | LAMARRacing had the fastest car at ICRA 2026 | 8 ("set the fastest car" is not English) |
| post-samir-shehadeh-344832, excerpt | Fastest car in time trials and fourth overall at ICRA 2026. | Fastest in time trials, fourth overall. | 1 (keeps only what the headline does not say) |
| post-unicorn-racing-344833, title | UNICORN Racing win the RoboRacer competition at ICRA 2026 | UNICORN Racing wins the RoboRacer competition at ICRA 2026 | American grammar |
| post-unicorn-racing-344833, excerpt | 1st place at the RoboRacer competition at ICRA 2026, Vienna. | (cut) | 5 (repeats the headline) |
| post-mateus-karvat-541826, title | Ingenuity Labs Racing race for the first time in Vienna | Ingenuity Labs Racing's first RoboRacer competition, in Vienna | American grammar ("Racing race"); "RoboRacer competition" moved up from the excerpt |
| post-mateus-karvat-541826, excerpt | A first RoboRacer competition with Ingenuity Labs Racing at ICRA 2026 in Vienna. | (cut) | 5 (repeats the headline) |
| post-lukas-kutsch-701952, title | From CDC Milan 2024 to first in time trials at ICRA 2026 | Two years with LAMARRacing | 6 (11-word headline) |
| post-lukas-kutsch-701952, excerpt | Two years with LAMARRacing, from CDC Milan 2024 to 1st in time trials at ICRA 2026. | From CDC Milan 2024 to first in time trials at ICRA 2026. | 5 (the first half is now the headline); "from X to Y" is literal here, a two-year span |
| post-roboracer-foundation-197760, excerpt | About 200 people and 30 teams from more than 12 countries, the largest competition yet. | About 200 people and 30 teams from more than 12 countries. | 5 ("largest" is already in the headline) |
| post-cedric-hollande-699200, title | UPenn take 2nd in time trials and 5th head to head at ICRA 2026 | UPenn takes 2nd in time trials and 5th head to head at ICRA 2026 | American grammar |
| post-cedric-hollande-699200, excerpt | 2nd in time trials and 5th in head-to-head at ICRA 2026, out of about 30 teams. | Cedric Hollande and Dhyey Shah raced against about 30 teams. | 5 (repeated the headline); the two names are from the content skill and this item's own alt text |
| post-cedric-hollande-699200, `image.alt` | Cédric Hollande and Dhyey Shah hold their car … | Cedric Hollande and Dhyey Shah hold their car … | 7 (the site spells the name Cedric, per the content skill) |
| icra2026-vienna-results, excerpt | LAMARRacing set the fastest lap of the time trial at 14.590 s, ahead of UPenn Autonomous Racing and ForzaETH. Time trial, classic cup and master cup brackets are all published. | LAMARRacing set the fastest time-trial lap at 14.590 s, ahead of UPenn Autonomous Racing and ForzaETH. Classic Cup and Master Cup results are online too. | 1 (30 words), 2 ("brackets"); cup names capitalized as the results page and teams.json write them |
| f1tenth-korea-delegation-upenn, excerpt | The F1TENTH Global Camp is a government-funded university support project involving 76 universities in South Korea. Eight of them ran the F1TENTH education and competition program. | The F1TENTH Global Camp is a government-funded project that supports 76 universities in South Korea. Eight of them ran the F1TENTH education and competition program. | 4 (noun pile "university support project") |
| autodrive-f1tenth-autoware-integration, excerpt | Autonomy-oriented digital twins of vehicles across scales and configurations, supporting development and deployment of the Autoware Core/Universe stack. | Digital twins of cars at different scales and setups, used to develop and deploy the Autoware Core/Universe stack. | 2 ("autonomy-oriented", "configurations"), 4 |
| autodrive-digital-twin-first-look, excerpt | AutoDRIVE is an integrated ecosystem for autonomous driving research and education. This first look puts the 1/10-scale car in simulation. | AutoDRIVE builds tools for autonomous driving research and teaching. This first look puts the 1/10-scale car in its simulator. | 2 ("ecosystem", "integrated") |
| eth-pbl-map-controller, excerpt | How the MAP controller differs from standard pure pursuit, from the team behind ForzaETH. | How the MAP controller differs from standard pure pursuit, by the team behind ForzaETH. | 8 ("from … from") |
| medium-adventures-in-autonomous-vehicles, excerpt | A chronicle of the autonomous vehicle work coming out of Penn Engineering's mLab. | A blog about the autonomous vehicle work at Penn Engineering's mLab. | 2 ("chronicle") |

Layout note: six LinkedIn cards lose their excerpt (knapp, dhruv-jaiswal,
manasi-shrekhar, meghaj-kabra, unicorn-racing, mateus-karvat). Picture cards in
the two-column archive stretch to their row partner and the byline is pinned to
the bottom (`mt-auto`), so a card without an excerpt next to one with an
excerpt shows a little more space between headline and byline. Nothing breaks.
`community.json` keeps its own excerpts for these posts; the landing marquee
shows no headline, so the excerpt is needed there.

Unsure, left alone:

- ifac2026-busan-largest-race excerpt (42 words, the lead story): Cedric asked
  for this item and its wording on 2026-09-21, and every sentence is a fact.
  If it should shrink, the candidate cut is the full competition name ("The
  29th RoboRacer Autonomous Racing Competition" becomes "The 29th competition").
- Titles like "274 racers and 56 teams in Busan: the largest race in RoboRacer
  history" run past the 2-to-5-word headline rule. I read rule 6 as applying to
  section headlines, not to news headlines, which need the facts.
- unc-the-fast-and-the-autonomous: the headline is the article's own title and
  the excerpt paraphrases the article; `status: verify`.
- Registration date, for Cedric: this item says IROS registration closes
  September 5; `upcoming_events.json` has `registration_deadline:
  "September 9, 2026"` (with a note that still says to show Sep 5). Dates are
  outside this pass, so neither was touched.

Count: 104 strings reviewed (titles, excerpts, credits, affiliations, alt text,
embed title and poster alt, stat labels, the results link; author and publisher
names not counted), 31 changed, 73 left. The `author` and `credit` fields
of post-cedric-hollande-699200 still read "Cédric Hollande": that is the
LinkedIn account name the credit points to, so it was left as a name.
