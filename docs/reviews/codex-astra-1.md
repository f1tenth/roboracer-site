# Codex review 1 (gpt-6-astra), 2026-09-25, branch revamp/polish-2 at 95ff8d7

Read-only review of origin/main..HEAD: copy, product decisions, correctness.
Triage by the lead (Fable): items 2-13, 15, 16, 19, 20 accepted and fixed on
revamp/p2-qafix (see docs/qa/polish-2-fixes.md, batch 2); item 17 handed to the
mobile pass; items 1 (remove the spinoffs section), 14 (the 4 s media hold),
18 (paths above the hero), 21, 22 (delete the leads), 23 (Frenet rewording),
24 (five-word news headlines), 25 skipped as taste or against Cedric's asks.
Item 1 was met halfway: an entry with no stated origin is not rendered.

1. **[P1] [src/pages/About.tsx:348]src/pages/About.tsx:348** — All three `verify` entries render as organizations that “grew out of the car,” even though Quanser’s origin is explicitly unresolved and its [own history](https://www.quanser.com/about/) predates RoboRacer. Render only confirmed, published relationships; omit the section until those exist, and remove the public verification explanation and “Three so far” claim.

2. **[P1] [src/components/ui/HeroChapter.tsx:355]src/components/ui/HeroChapter.tsx:355** — Pausing while the next clip buffers does not prevent its `canplay` callback from calling `advance()` and starting playback; I reproduced this with the sequencer code. Track the user’s pause intent in a ref, check it before every playback/advance, and remove pending `canplay` listeners during cleanup.

3. **[P2] [src/components/race/leaderboardData.ts:104]src/components/race/leaderboardData.ts:104** — The validator accepts malformed fields subsequently used during rendering: for example, an object-valued `metric.extras` passes validation and throws at `.find()`, taking down the race page. Validate configuration, board metadata, extras and rows before setting state, and contain rendering failures within the leaderboard.

4. **[P2] [src/components/ui/EntryPaths.tsx:113]src/components/ui/EntryPaths.tsx:113** — A failed or malformed `paths.json` leaves an empty “Start here” section while the prominent nav button continues sending visitors there. Bundle validated fallback paths; also add race and sponsorship destinations to the static `noscript` links so those new entry points remain available without JavaScript.

5. **[P2] [public/data/paths.json:35]public/data/paths.json:35** — “Reach students at 90+ universities” converts platform adoption into an unsupported sponsorship-reach promise. Replace it with **“Support a RoboRacer competition. Contact us about sponsorship.”**

6. **[P2] [src/components/racecarAssemblyData.ts:247]src/components/racecarAssemblyData.ts:247** — The instructional viewer identifies a Jetson Orin but links to Xavier NX mounting instructions, and its VESC placement differs from the [linked build guide](https://f1tenth.readthedocs.io/en/main/getting_started/build_car/upper_level_chassis.html). Identify the illustrated configuration and add **“This model shows a Jetson Orin; the guide uses a Xavier NX”** and **“Follow the guide for mounting locations; this model’s layout differs.”**

7. **[P2] [src/components/ui/ExplodedModel.tsx:91]src/components/ui/ExplodedModel.tsx:91** — “Every part” broadens the original placement claim beyond the components mirrored from the design, while “The whole car is open source” overstates what the content source establishes. Replace these with **“An illustrated RoboRacer assembly”** and **“The hardware designs, software and simulator are open source”**; use the latter in [About.tsx:228](/home/cedric/Documents/UPenn/xLAB/Roboracer/roboracer-site/src/pages/About.tsx:228), removing the unsupported inference that labs therefore build instead of buy.

8. **[P2] [src/pages/Research.tsx:79]src/pages/Research.tsx:79** — The rewrite turns Scholar search results into a verified count of papers “on” both names; the landing’s “See every paper” also overpromises a selected bibliography. Use **“A Google Scholar search for F1TENTH or RoboRacer returns more than a thousand results”** and change [Landing.tsx:419](/home/cedric/Documents/UPenn/xLAB/Roboracer/roboracer-site/src/pages/Landing.tsx:419) to **“Browse selected papers.”**

9. **[P2] [public/data/news.json:414]public/data/news.json:414** — The rewritten excerpt says the Global Camp supports 76 universities; the [cited article](https://autoware.org/f1tenth-korea-delegation-at-upenn/) assigns that scope to LINC 3.0, which supported the camp. Replace it with **“LINC 3.0 supported the camp and involved 76 Korean universities. Eight joined the F1TENTH education and competition program in 2023.”**

10. **[P2] [src/pages/Race.tsx:50]src/pages/Race.tsx:50** — “No more than ten people in the race area” loses the original per-team scope and reads as a total occupancy limit. Replace it with **“Register once per team. Teams can have any number of members; at most ten per team may enter the race area.”**

11. **[P2] [src/components/ui/WorldMapChapter.tsx:584]src/components/ui/WorldMapChapter.tsx:584** — “Every team builds and races the same … car” introduces a universal claim absent from the source and obscures different builds and configurations. Replace it with **“Teams around the world build and race RoboRacer cars.”**

12. **[P2] [src/pages/Landing.tsx:102]src/pages/Landing.tsx:102** — “Rendered view” does not disclose that this is AI-generated and can suggest an accurate engineering rendering beside the actual model. Use caption **“AI-generated illustration”** and alt **“AI-generated illustration of a RoboRacer-style car”**, or replace it with a documented photograph.

13. **[P2] [src/lib/media.ts:36]src/lib/media.ts:36** — Missing connection information is treated as proof that the desktop clips can stream, leaving unsupported browsers exposed to the same high-bitrate stalls this change addresses. Default unknown connections to a lower-bitrate clip, respond to observed buffering, and use a poster with **“Play race footage”** when Save-Data is enabled.

14. **[P2] [src/pages/Landing.tsx:140]src/pages/Landing.tsx:140** — The global hold releases all eager media after four seconds even if the hero still needs bandwidth, while also withholding images visitors reach immediately through navigation. Gate sections by viewport proximity, prioritize visible content, and release background requests gradually instead of opening every request at one deadline.

15. **[P2] [src/components/race/Leaderboard.tsx:104]src/components/race/Leaderboard.tsx:104** — If the local leaderboard configuration fails, `cfg` stays null and the promised external escape link disappears; that initial fetch also has no timeout. Provide a bundled fallback configuration and apply the same bounded timeout to the configuration request.

16. **[P2] [src/components/race/Leaderboard.tsx:62]src/components/race/Leaderboard.tsx:62** — The “live” leaderboard fetches only on mount, and cached board selections never refresh, so an open race page can show superseded rankings indefinitely. Revalidate periodically while visible and on return to the tab, retaining the last successful results when refreshes fail.

17. **[P2] [src/components/NavBar.tsx:330]src/components/NavBar.tsx:330** — Below 390px, the only “Start here” button moves beneath nine menu links; on short screens it falls below the viewport, and the fixed menu has no scrolling constraint. Give the menu a viewport-bounded `max-height` and `overflow-y:auto`, or put the primary action first.

18. **[P2] [src/pages/Landing.tsx:198]src/pages/Landing.tsx:198** — The new fast-entry paths sit after a 320vh hero, so ordinary scrolling requires more than three screens before reaching them; the narrowest phones also hide the shortcut in the menu. Put the paths within the first viewport or expose the four direct destinations alongside the opening description.

19. **[P2] [src/hooks/useScrollToHash.ts:90]src/hooks/useScrollToHash.ts:90** — An invalid percent escape such as `/#%` throws in `decodeURIComponent`, sending the landing page into its error boundary. Catch decoding errors and ignore invalid fragments without disrupting the page.

20. **[P3] [public/data/news.json:150]public/data/news.json:150** — Removing supposedly redundant excerpts loses the 28th-competition detail from the 404 Racers card and Vienna from the UNICORN card’s visible text. Restore **“Second at the 28th competition, IEEE IV 2026”** here and **“First place in Vienna”** at [news.json:270](/home/cedric/Documents/UPenn/xLAB/Roboracer/roboracer-site/public/data/news.json:270).

21. **[P3] [src/pages/About.tsx:266]src/pages/About.tsx:266** — The people lead describes links and editorial verification, while the partners lead describes sorting; both still narrate the page. Use **“Meet the RoboRacer team”** and, at [About.tsx:334](/home/cedric/Documents/UPenn/xLAB/Roboracer/roboracer-site/src/pages/About.tsx:334), **“Universities and companies use RoboRacer for teaching and research.”**

22. **[P3] [src/pages/Research.tsx:156]src/pages/Research.tsx:156** — The featured and bibliography leads still explain filters and page organization, as do the race-entry and history leads. Delete the redundant research leads at lines 156 and 203 and race-history lead at [Race.tsx:294](/home/cedric/Documents/UPenn/xLAB/Roboracer/roboracer-site/src/pages/Race.tsx:294); replace the entry lead at line 213 with **“Check entry requirements on the competition’s site.”**

23. **[P3] [public/data/news.json:198]public/data/news.json:198** — “A Frenet-frame MPC” and “digital twins … Autoware Core/Universe stack” remain unexplained jargon for the brief’s newcomer audience. Use **“They used model predictive control in track-relative coordinates (a Frenet frame), plus an overtaking planner”** here and **“Simulated cars at different scales help develop and deploy Autoware Core/Universe software”** at [news.json:433](/home/cedric/Documents/UPenn/xLAB/Roboracer/roboracer-site/public/data/news.json:433).

24. **[P3] [public/data/news.json:101]public/data/news.json:101** — Several rewritten news headlines still exceed the brief’s five-word limit. Use **“Racing and warehouse logistics”** (101), **“Carnegie Mellon finishes fifth”** (125), **“404 Racers finish second”** (197), **“Roboracer @ Purdue finishes tenth”** (221), **“LAMARRacing tops the time trials”** (245), **“UNICORN Racing wins ICRA 2026”** (269), **“Ingenuity Labs Racing debuts”** (293), and **“UPenn takes fifth overall”** (365), retaining displaced counts, locations and first-race details in their excerpts.

25. **[P3] [public/data/community.json:27]public/data/community.json:27** — “On how far the community has come” remains vague promotional filler without a concrete development. Replace it with **“Open Robotics features RoboRacer racing.”**

Codex session ID: 01a0d6b2-157b-7951-9910-47157447ca63
Resume in Codex: codex resume 01a0d6b2-157b-7951-9910-47157447ca63
