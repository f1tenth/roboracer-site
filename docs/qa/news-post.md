# QA: /news/aurorus (the first post hosted on the site)

Branch `revamp/blog-aurorus`, 2026-11-17. Verdict: **PASS**. Cedric reviewed the draft on the preview, gave three notes (below) and asked for it to ship, 2026-11-17.
Checked on the production build (`npm run build`, `vite preview`), Chromium new headless.

| Check | Result |
|---|---|
| `npm run lint`, `npm run build` | pass; `NewsPost` chunk 15.5 kB (5.4 kB gzip), `marked` shared with `/rules` |
| Screens | 1440x900, 1536x730, 1920x1080, 768x1024, 390x844: no horizontal overflow; reading column centred between "On this page" and the links card from xl, one column below |
| Console and network | no page errors, no failed request; after Play, YouTube's own player frame logs a warning ("No available adapters") and a permissions-policy notice (compute-pressure); neither is site code |
| axe | 0 violations on `/news/aurorus` (desktop and phone) and on `/news`; "incomplete": video-caption (the clips are silent loops with a text alternative and a caption) and one colour-contrast on the gradient title word |
| Layout shift | CLS 0.0001 on load and after a full scroll; every image and clip carries width and height |
| Clips | nothing but the posters loads until a clip nears the screen (the first clip is in the first screens and loads at once); they play in view, hold off screen, Pause and Play work |
| Reduced motion | no clip loads or plays; each stays on its poster with a Play button; pressing it plays |
| YouTube | only the thumbnail (i.ytimg.com) before a click; then `youtube-nocookie.com/embed/cEtLJ8aXSXk` in a 9:16 box |
| Code block | Copy puts the eight lines on the clipboard and announces it; the block is keyboard focusable and scrolls sideways on a phone |
| Routing | the lead card on `/news`, its picture and its "Read the post" open the post in place (no new tab); the breadcrumb returns; a direct load of `/news/aurorus` works through `404.html`; an unknown slug says "There is no post here"; the News nav item is marked as the current section |
| Links | all 17 external links answer 200 (the AuRoRus repository and its tutorials folder, 12 GitHub profiles, the benchmark page, the YouTube Short) |
| Media | 13 files, 2.55 MB together, the largest 1.32 MB (`news-aurorus-real-world-360.mp4`); manifest NEWS-27 to NEWS-39 |
| Copy | the text is Enrico's README with its H1 dropped and the media paths changed, nothing else; no `TODO(content)`; the card excerpt is 23 words |

## Cedric's notes, 2026-11-17 (applied)

1. The title reads "AuRoRus: a RoboRacer stack, open-sourced and written in Rust" (the README says "our").
2. The card text on `/news`: "The University of Bologna team that won ICRA 2025 and placed 2nd at ICRA 2026 opens its race stack."
3. The flagship picture is the Atlanta team photo with the cheque, cropped to landscape (`news-aurorus-team-atlanta-wide-964.webp`): the lead picture on `/news`, where it now links to the post, and the post's cover. The README's own cover photo (the car and the trophy) moved into the text, after the introduction.

4. The post's name carries the logo gradient in the lead headline on `/news` too, as in the post's own title (`title_accent` on the news item; a follow-up the same day).

## What differs from Enrico's README

1. The title is printed by the page (from `posts.json`), with "a" for "our" (note 1); the README's H1 line is not in the body file.
2. The eight media paths point at the site's encodes; the three GIFs are silent video loops.
3. The cover is a crop of his Atlanta team photo (note 3). His cover photo is a figure after the introduction, captioned "UBM-Atlas with the second-place Master Cup trophy from ICRA 2026 in Vienna." The uncropped Atlanta photo stays where he put it, in "The team behind it", so the page shows it twice (cropped on top, whole there).
4. Added, between the Atlanta and the Vienna team photos: his own YouTube Short of the ICRA 2025 final, with the caption "The ICRA 2025 final in Atlanta: UniBo against UNICORN (South Korea)." (the video's own title, reworded).
5. Added around the text: the cover caption ("The University of Bologna team after winning at ICRA 2025 in Atlanta."), the byline role ("PhD student and leader of the 1:10 Scale Driverless division, University of Bologna"), the links card (code, tutorials, language, license) and the credit line.

## Still open

With Enrico (he had not commented when the post shipped):
- The captions and the byline role above, and the video's place and caption: his wording wins.
- His email address is printed in the conclusion, as he wrote it.
- The photo credit reads "courtesy of Enrico Mannocci and the University of Bologna team". Name the photographers if he prefers.

With Cedric:
- The post leads `/news` (`featured: true`). Drop the flag and IFAC 2026 leads again, with the post as the first 2026 card.
- With the post as the lead, the IFAC 2026 story is a card again, so 2026 opens with 15 cards (`NEWEST_YEAR_OPEN`), still ending at UPenn's ICRA 2026 post; the last row holds one card.
- The author's voice is kept as written (exclamation marks, first person), which the site's own voice rules would not allow in our copy.
- The YouTube Short is click-to-play. It can autoplay muted in view like the Dzik card (`YouTubeLoop`) if preferred.
