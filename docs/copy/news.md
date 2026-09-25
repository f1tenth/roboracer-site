# /news copy pass

Files: `src/pages/News.tsx`, `src/components/news/*` (NewsLead, NewsCard,
NewsEmpty, LinkedInEmbed, newsData). The feed items themselves are in
`public/data/news.json`; that table is `docs/copy/data-news.md`.

| Location | Before | After | Rule broken |
|---|---|---|---|
| News.tsx, header lead | Race reports, results and posts from the teams who build and run the cars. | Results and posts from the teams who build and race the cars. | 2 (three nouns for rhythm; "race reports" and "posts" overlap) |
| News.tsx, ledger label | Items | Stories | 2 ("items" is CMS language) |
| News.tsx, archive count | {n} of {m} items · {event} / {m} items | {n} of {m} stories · {event} / {m} stories | 2, matches the ledger |
| News.tsx, Contribute lead | Posted about your team, your car or a race you ran? Tag us at @roboracer.ai and send us the link. It will go here, with your name and your credit on it! | Tag us at @roboracer.ai in your post and send us the link. We add it here with your name and credit. | 1 (34 words), 2 (question, three nouns), voice (exclamation mark) |
| News.tsx, Slack line | Feel free to reach out on Slack. | Or message us on Slack. | 2 ("feel free to reach out" is filler) |
| NewsEmpty.tsx, empty title | The feed is quiet | No news yet | 8 (cute; say it plainly) |
| NewsEmpty.tsx, empty body | Nothing is in the feed right now. Race news lands in the RoboRacer Slack first. | Race news is posted in the RoboRacer Slack first. | 5 (first sentence repeats the title) |
| NewsEmpty.tsx, error body | Reload the page to try again. Race news lands in the RoboRacer Slack first. | Reload the page to try again. Race news is posted in the RoboRacer Slack first. | 2 ("lands") |

Unsure, changed anyway: the Contribute lead came in with "Cedric's review
round" (58c6a8c, 2026-08-23). The commit credits Cedric with the request to
tag @roboracer.ai, not clearly with the wording. If the wording is his, revert
that row. The @roboracer.ai Instagram handle itself was not touched.

The NewsEmpty strings only show when news.json fails to load or is empty.

Left alone on purpose: h1 "News from the races", "All news, by year" and
"Newest first." (Cedric's wording from 2026-09-21), the ledger labels
"Competitions / Latest / Oldest", the lead-story links ("Read the post on
LinkedIn", "Watch the video on …", "Listen to the episode on …"), the
"unverified" pill, "Send us a link", "Open the RoboRacer Slack".

Count: 33 strings reviewed (20 in News.tsx, 13 in the news components),
8 changed, 25 left.
