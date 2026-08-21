# Plan: landing (/, revamp/landing off revamp/integration)

Mode: "just build it" (Cedric, 2026-08-21). Scroll order per roboracer-content
"Landing page structure (Cedric, Aug 20)"; one idea per section.

| # | Section | Idea it explains | Primitives (all existing) | Data |
|---|---|---|---|---|
| 1 | VideoHero (ink, bleed) | the feeling of racing | VideoHero | copy only |
| 2 | Next race (ink edge) | come race at IROS 2026 | NextRaceSpotlight, Section | upcoming_events.json `spotlight` fields |
| 3 | Highlights (ink) | 30 competitions, one community | SectionHeader, HighlightReel, Reveal | hero clip as placeholder x2 |
| 4 | The car (ink 950) | open source, 1/10 scale, real engineering | ExplodedModel (pinned scrub) | racecar meshes |
| 5 | Four pillars (paper) | build / learn / race / research | SectionHeader, Reveal + local PillarCard | copy from old pillars, de-emoji, voice pass |
| 6 | Scale (ink tight) | 90+ / 20+ / 1,000+ / 30 | StatCounter | numbers per content skill |
| 7 | Partners (paper tight) | who uses the platform | Marquee (grayscale->color hover per skill) | partners.json |
| 8 | Sponsors (ink edge) | become a sponsor (zero is correct) | SponsorCTA | none |
| 9 | Teams (ink edge, below sponsors) | who competes | TeamGrid | teams.json - renders ONLY published; all 10 are `verify`, so section stays hidden until Cedric flips statuses. Flagged in handoff. |
| 10 | Research teaser (paper) | 1,000+ publications build on this | SectionHeader, PublicationCard x3, Button | publications.json featured |
| 11 | Get started (ink) | build it, learn it, join Slack | Section + local EntryCard x2, Button (Slack CTA) | copy only |

Data edits (data-driven, no hardcoded facts):
- upcoming_events.json <- docs/content/upcoming_events.proposed.json (IV 2026 removed)
  + IROS entry gains spotlight fields {spotlight:true, dates_headline, dates_secondary,
  starts_at, registration_deadline, rules_url} per D8 (drop the proposed TODO note - answered).
- past_races.json <- docs/content/past_races.proposed.json (IV + ICRA 2026 at top,
  keep auditor TODO notes out of rendered fields).

Media: committed hero set only (`/media/hero/*`, provenance ours). No LinkedIn media
(nothing `granted`). HighlightReel tile 2 caption = TODO(content) until Cedric's ICRA clip.

Motion (all matchMedia-gated, reduced-motion fallbacks already in primitives):
hero video->poster; spotlight static; reel autoplay->posters; ExplodedModel scrub->static
assembled + stacked captions; Reveal->static; counters->final numbers; marquee->wrapped grid.

Deletes with the page (rule 10): FloatingTestimonials (only Landing used it; testimonials
move to About in Phase 3.4), old Landing pillar/hero code, `public/landing/hero-bg.jpg`
reference (file stays for About until its pass).

Open (calm options taken, flagged for Cedric): teams section hidden until statuses flip;
hero headline "Autonomous racing, built and raced in the open." (CONTENT.md proposal);
UC San Diego dropped from pillar copy (no partner entry exists - copy follows data).
