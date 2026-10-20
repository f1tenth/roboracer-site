# QA: Dzik Autonomous Racing under Related platforms (/about)

Branch `revamp/platform-dzik`, from `main` at 1b5b953. Requested by Cedric on 2026-10-20: add Dzik
Autonomous Racing (https://dzik.racing/) to section 04 "Related platforms" on /about, with their autonomous lap
video playing in the feature, an unmute control, a clear line that the car drives itself, and a short
mention of their results. Dev server for this QA: http://localhost:4192/about#about-spinoffs.

## What was built

- **Entry** (`public/data/spinoffs.json`, third in `entries`): kind `team`, label "independent team", since
  2018 (the year the team gives for its start).
  - what: "A two-person team from Warsaw, Poland. Since 2025 its 1/8-scale cars race professional RC
    drivers on asphalt: human against AI."
  - and RoboRacer: "A competitor team. Won the 21st competition, at IROS 2024 in Abu Dhabi, after second
    places at ICRA 2022, the Lausitzring in 2022 and ICRA 2024."
  - Both lines are our own words, drafted from dzik.racing (no copy taken). The entry's `results` field (not
    rendered) records all six results from Cedric's screenshot and how each checks against our data (below).
- **Video stage.** The lap video (`_RUCcjT7fVQ`, 26 s) takes the slot where the other cards show their car.
  It is a new `YouTubeLoop` in `src/components/ui/YouTubeFacade.tsx`, built on the existing
  `YouTubePlayer` (the poster with the play disc used on /news and the About video library), so there is
  still one YouTube component, not two:
  - the box is `aspect-video` from first paint; the poster (our local WebP) shows until the frame is a third
    on screen, then an IntersectionObserver mounts the youtube-nocookie.com iframe with
    `autoplay=1&mute=1&playsinline=1&loop=1&playlist=_RUCcjT7fVQ&controls=0&enablejsapi=1&origin=...`;
  - YouTube's control bar is off. The page draws its own controls under the frame: **Pause** (the existing
    `PauseToggle`, given an `always` prop so it shows with a mouse too; WCAG 2.2.2) and **Sound**, a real
    `<button aria-pressed>` (false while muted) that reads "Sound off" / "Sound on" with a speaker icon. The
    accessible name stays "Sound"; the state is `aria-pressed` (a pressed button whose label also flipped
    between "Unmute" and "Mute" would announce the state twice, and the repo's `PauseToggle` notes the same
    trap). Both use the paper tokens; the pressed Sound button takes the TagFilter's pressed style (ink
    fill);
  - the controls talk to the player over the IFrame API's postMessage channel, no API script, no new
    dependency: "listening" on the iframe's load (repeated every 250 ms until YouTube answers), then
    `{"event":"command","func":"unMute"|"mute"|"playVideo"|"pauseVideo","args":[]}`; the button states
    follow the player's own `infoDelivery` (`muted`, `playerState`) and `onStateChange` messages, checked
    against YouTube's origin and the iframe's window;
  - the loop pauses while scrolled off screen and resumes when back, unless the reader paused it;
  - under reduced motion, with Data Saver, or before the frame is in view: the poster with the click-to-play
    disc, nothing starts until a click (which then plays with sound, Sound pressed); if the player never
    answers within 12 s or reports `onError`, the poster comes back as a link to the video on YouTube;
  - the caption strip under the frame carries the "drives itself" line next to the controls: eyebrow
    "autonomous lap · Ruda Śląska, Poland · Oct 4, 2026", line "The car drives itself. No driver, no remote
    control." The controls keep their space while hidden (visibility), so nothing moves when they appear.
- **Layout.** Three cards in the two-column grid: the odd last card spans both columns
  (`desktop:[&>*:last-child:nth-child(odd)]:col-span-2`). From a 90rem card width (1280 and up on a laptop)
  the spanning card puts the video beside the text and window, so a 16:9 stage never runs the page width;
  narrower it stacks (video, caption strip, then text beside the window from 40rem). The site window never
  climbs into a video. The section subtitle now reads "Other small-scale cars, and how they relate to
  RoboRacer" (Dzik races 1/8 scale now). The loading placeholder's min-heights were re-measured for three
  cards.
- Text link under the copy: "Watch the lap on YouTube" (the video's page), in place of "See the <car>".

## Media and provenance

All Cedric-directed, 2026-10-20; team not yet asked. Adding Dzik to this section extends the rule 8
exception Cedric made for Neobotics and Quanser (2026-09-25); CLAUDE.md and the media skill still name only
those two. Manifest rows SP-08 to SP-10 in `docs/ASSET_MANIFEST.md`.

| file | size | source |
|---|---|---|
| `public/media/spinoffs/spinoff-dzik-icon-96.webp` (106x96) | 4,124 B | `https://dzik.racing/images/logo.png` |
| `public/media/spinoffs/spinoff-dzik-site-960.webp` (960x600) | 17,684 B | our Playwright capture of `https://dzik.racing/` at 1280x800 |
| `public/media/spinoffs/spinoff-dzik-lap-poster-960.webp` (960x540) | 148,254 B | `https://i.ytimg.com/vi/_RUCcjT7fVQ/maxresdefault.jpg` (the 1280 encode was 177 KB at q70, over the 150 KB poster budget) |

The video is not re-hosted; it streams from YouTube. A low-resolution copy was pulled to the scratchpad only
to check what it shows (one car lapping an outdoor asphalt RC track, filmed from trackside) and was not kept.

## Results: Cedric's screenshot against our data

| result (dzik.racing/#about) | our data | on the page |
|---|---|---|
| 2024 1st, IROS, Abu Dhabi | confirmed: news.json `iros2024-abudhabi-dzik-ultimate-wins` (organizers' newsletter: gold Dzik Ultimate) | yes |
| 2024 2nd, ICRA, Yokohama | consistent: VAUL won; Dzik won the other semi-final (news.json `icra2024-yokohama-vaul-wins`); no source names the runner-up outright | yes |
| 2022 2nd, ADAC event, Lausitzring | consistent: our record of the race (`germany2022`, "F1TENTH Autonomous Grand Prix Germany 2022") has only ETH's post that ForzaETH won; no runner-up recorded | yes |
| 2022 2nd, ICRA, Philadelphia | confirmed: archived race-site bracket, ScatterBrain beat Dzik 2-0 in the final | yes |
| 2019 1st, ES Week, New York | **TODO(content)**: our record (Columbia 2019, `f1tenth.github.io/columbia2019.html`) has time trials only; Dzik is ranked 1 in the Open class as its only car (5.84 s); SeoulTech and Unimore topped the ten-car Restricted class; no head-to-head result exists | left out |
| 2018 1st, ES Week, Turin | **TODO(content)**: our record credits team CALVIN from Warsaw (Maciej Dziubiński and Karol Majek on the old race page; Łukasz Sztyber named in Karol Majek's video). Dzik counts it as its own | left out |

Also not rendered: dzik.racing says its RoboRacer years end in 2024, while the Teams DB lists "Dzik One" at
ICRA 2025 and IV 2025. `past_races.json` holds race names and links only, no placings, so the checks above use
`news.json`, `events_map.json` and the old race pages.

## Checks

- `scripts/rr.sh check` (lint + build): green.
- Player, Playwright at 1440x900 reading the player's own messages: no iframe before scrolling; after
  scrolling to the card the iframe mounts with the URL above and reports `muted: true, playerState: 1`
  (playing). Sound click: `muted: false`, still `playerState: 1`, `aria-pressed="true"`. Pause: state 2;
  Play: state 1; Sound again: `muted: true`, `aria-pressed="false"`. Scrolled to the top: state 2; back on the
  card: state 1.
- Reduced motion: no iframe, the poster with "Play ... on YouTube", controls hidden; Enter on the poster
  mounts the player without `mute=1`, it plays with sound and Sound reads pressed.
- Embed blocked (requests to youtube-nocookie.com aborted): after 12 s the iframe is gone and the poster is a
  link to `https://www.youtube.com/watch?v=_RUCcjT7fVQ`; no console warnings.
- Focus: poster button, Pause and Sound all show the 2px violet ring (`dzik-focus-sound.png`).
- Layout shift: none on /about while the player mounts (PerformanceObserver at 1440, 768, 390); the card's box
  is identical before and after (421, 865, 1018 px tall).
- axe on /about at 1440, 390 and 1440 reduced motion: zero violations of any impact.
- Console on /about: no errors. One warning, "No available adapters.", comes from inside the YouTube player
  (its WebGPU probe in headless Chromium); the About hero reel logs the same.
- Links: https://dzik.racing/, the video page and https://www.youtube.com/@dzik.racing answer 200.
- /news still shows its 34 YouTube posters, and the About video library its 7 play buttons, after the
  `YouTubePlayer` change.

Screenshots (git-ignored) in `docs/qa/platform-dzik/`: `section-{desktop-1440x900,tablet-768x1024,mobile-390x844}.png`
and `-reduced` variants, the same for the card alone (`dzik-*.png`), plus `dzik-desktop-1440x900-reduced-after-click.png`,
`dzik-desktop-1440x900-embed-blocked.png` and `dzik-focus-sound.png`.

## Open questions for Cedric

1. The 2018 Turin win (credited to team CALVIN in our record) and the 2019 New York "1st place" (Open class
   time trials, one car): count them as Dzik's? With both, the line could read "three wins and three second
   places"; now it names one win and three second places.
2. The video starts by itself on phones and tablets too (muted), as asked. The About hero reel waits for a
   tap on phones (ABOUT-06). Keep it playing on phones?
3. Order: Dzik is last, spanning the grid's width under Neobotics and Quanser. Move it first?
4. CLAUDE.md rule 8 and the media skill name only Neobotics and Quanser in the exception; extend the wording
   to Dzik?
5. Permission: Dzik has not been asked about the logo, the homepage capture and the poster (SP-08 to SP-10).
