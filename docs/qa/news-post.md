# QA: /news/aurorus (the first post hosted on the site)

Branch `revamp/blog-aurorus`, 2026-11-17. Verdict: **PASS**, as a draft for Enrico's and Cedric's review.
Checked on the production build (`npm run build`, `vite preview`), Chromium new headless.

| Check | Result |
|---|---|
| `npm run lint`, `npm run build` | pass; `NewsPost` chunk 15.5 kB (5.4 kB gzip), `marked` shared with `/rules` |
| Screens | 1440x900, 1536x730, 1920x1080, 768x1024, 390x844: no horizontal overflow; reading column centred between "On this page" and the links card from xl, one column below |
| Console and network | no page errors, no failed request; one warning ("No available adapters") comes from YouTube's player frame after Play |
| axe | 0 violations on `/news/aurorus` (desktop and phone) and on `/news`; "incomplete": video-caption (the clips are silent loops with a text alternative and a caption) and one colour-contrast on the gradient title word |
| Layout shift | CLS 0.0001 on load and after a full scroll; every image and clip carries width and height |
| Clips | nothing but the posters loads until a clip nears the screen (the first clip is in the first screens and loads at once); they play in view, hold off screen, Pause and Play work |
| Reduced motion | no clip loads or plays; each stays on its poster with a Play button; pressing it plays |
| YouTube | only the thumbnail (i.ytimg.com) before a click; then `youtube-nocookie.com/embed/cEtLJ8aXSXk` in a 9:16 box |
| Code block | Copy puts the eight lines on the clipboard and announces it; the block is keyboard focusable and scrolls sideways on a phone |
| Routing | the lead card on `/news` and its "Read the post" open the post in place (no new tab); the breadcrumb returns; a direct load of `/news/aurorus` works through `404.html`; an unknown slug says "There is no post here"; the News nav item is marked as the current section |
| Links | all 17 external links answer 200 (the AuRoRus repository and its tutorials folder, 12 GitHub profiles, the benchmark page, the YouTube Short) |
| Media | 13 files, 2.56 MB together, the largest 1.32 MB (`news-aurorus-real-world-360.mp4`); manifest NEWS-27 to NEWS-39 |
| Copy | the text is Enrico's README with its H1 dropped and the media paths changed, nothing else; no `TODO(content)`; the card excerpt is 23 words |

## What differs from Enrico's README

1. The title is printed by the page (from `posts.json`), so the README's H1 line is not in the body file.
2. The eight media paths point at the site's encodes; the three GIFs are silent video loops.
3. Added, between the Atlanta and the Vienna team photos: his own YouTube Short of the ICRA 2025 final, with the caption "The ICRA 2025 final in Atlanta: UniBo against UNICORN (South Korea)." (the video's own title, reworded).
4. Added around the text: the cover caption ("UBM-Atlas with the second-place Master Cup trophy from ICRA 2026 in Vienna."), the byline role ("PhD student and leader of the 1:10 Scale Driverless division, University of Bologna"), the links card (code, tutorials, language, license), the credit line, and the card excerpt on `/news`.

## Open questions

For Enrico:
- The captions and the byline role in item 4, and the video's place and caption in item 3: his wording wins.
- His email address is printed in the conclusion, as he wrote it. Confirm he wants it public on roboracer.ai.
- The photo credit reads "courtesy of Enrico Mannocci and the University of Bologna team". Name the photographers if he prefers.
- The cover caption names the car UBM-Atlas (the plate in the photo) and the second place (the trophy); the site's team data has UBM-Atlas second and UBM-Tom third.

For Cedric:
- The date is the draft's (Nov 17, 2026) in `posts.json` and `news.json`; set both to the day it goes live.
- The post leads `/news` (`featured: true`). Drop the flag and IFAC 2026 leads again, with the post as the first 2026 card.
- With the post as the lead, the IFAC 2026 story is a card again, so 2026 opens with 15 cards (`NEWEST_YEAR_OPEN`), still ending at UPenn's ICRA 2026 post; the last row holds one card.
- The author's voice is kept as written (exclamation marks, first person), which the site's own voice rules would not allow in our copy.
- The YouTube Short is click-to-play. It can autoplay muted in view like the Dzik card (`YouTubeLoop`) if preferred.
- The site's nav still says "News"; nothing on the site says "blog" except the card's publisher line ("RoboRacer blog").
