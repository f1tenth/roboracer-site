# QA: p3-news-media (YouTube videos on /news)

Branch `revamp/p3-news-media`, 2026-09-26, taskmap n338. Checked on `vite preview` (port 4196) of the production build.

## What changed

- `src/components/news/newsData.ts`: `NewsEmbed` is now `NewsLinkedInEmbed | NewsYouTubeEmbed` (`{ provider: "youtube", id, title, poster? }`); new optional `video` for an item whose `embed` is its LinkedIn post; `youTubePoster()` picks the item's `image`, else `poster`, else `i.ytimg.com/vi/<id>/maxresdefault.jpg`.
- `src/components/ui/YouTubeFacade.tsx`: the poster/iframe frame extracted as `YouTubePlayer` (used by the About facade, unchanged in behaviour, and by the news components). 4:3 YouTube thumbnails are zoomed 1.12x past their letterbox bars.
- `src/components/news/NewsCard.tsx`: a video card shows the poster with a play disc in the picture slot; "Play the video" (becomes "Close the video") under the text, or a click on the poster, mounts the player there. The poster button is a mouse-only duplicate (aria-hidden, tabindex -1), like the card's picture link. LinkedIn cards unchanged.
- `src/components/news/NewsLead.tsx`: a YouTube embed renders in the picture layout; a LinkedIn lead with a `video` shows it under its links (wide column); the LinkedIn embed still loads as the reader nears it.
- `src/components/news/LinkedInEmbed.tsx`: type rename only.
- `public/data/news.json`: 33 plan items get a video (30 `embed`, 3 `video`), credits gain `Video: <channel> · YouTube`; new item `icra2026-sim-league-monacof1-wins` (status verify).

## Checks

| check | result |
|---|---|
| news.json parses; 76 items; every item has id, date, date_display, date_precision, title, kind, link, publisher, image | pass |
| 34 YouTube ids, all unique, all 200 on `youtube.com/oembed` (embedding allowed) | pass |
| maxresdefault thumbnails: 30 answer 200; 4 do not (lE_Dk1iJHHg, YMzm2oCc_4w, zkMelEB3-PY, VlE2Wb_XhoQ) and carry `poster: sddefault` (VlE2Wb_XhoQ shows its item's photo anyway) | pass |
| `npm run lint` | pass (no output) |
| `npm run build` | pass |
| 1536x730 and 390x844, normal and reduced motion: console errors | 0 |
| one h1 | pass (1) |
| YouTube iframes at load, and after scrolling the whole page with every year unfolded | 0 and 0 |
| "Play the video" buttons (all years open) | 33 |
| click "Play the video": one iframe in that card, `title` = the video's title, `youtube-nocookie.com/embed/<id>?autoplay=1&playsinline=1&rel=0`, not muted; button reads "Close the video"; closing removes it | pass (both viewports) |
| click a card's poster | iframe mounts in that card only (pass) |
| lead (Busan, LinkedIn): LinkedIn frame mounts near the viewport as before (1 at load on desktop, 0 at load and 1 after scrolling on the phone); its recap video only on click | pass |
| axe serious/critical | 0 at both viewports |
| reduced motion: posters only, no iframe, nothing self-starts | pass |
| broken i.ytimg posters, images without alt | 0, 0 |

Lead layout, measured: at 1536 the recap video sits under the links at 461x259 (the lead grew to 734 px, the LinkedIn column is 490); at 390 it is 342x192 above the LinkedIn frame.

Screenshots (git-ignored): `docs/qa/p3-news-media/news-1536x730-video-cards.png`, `news-390x844-video-cards.png`.

## Notes and what is left

- On click the player starts (autoplay=1) with sound: the click is the request, under reduced motion too; nothing plays without one.
- The 11 photo and 4 poster items are the photo pass (`docs/news/MEDIA_IMAGES.json`); 17 items stay without media until it lands.
- The fifth Sim Racing League item comes from AutoDRIVE's ICRA 2026 league page and video only (not in the content skill): VERIFY with Cedric.
- The i.ytimg.com thumbnails are hotlinked (the brief's choice); cutting local WebP posters would keep the page free of third-party requests until a click.
