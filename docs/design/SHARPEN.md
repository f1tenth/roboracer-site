# SHARPEN - landing de-AI pass (2026-08-21)

Trigger: Cedric's verdict - "looks like an AI-generated neon game site, not a
professional autonomous racing community." Method: dual-agent /impeccable
critique (A: design review, B: detector + browser evidence) on the pre-sharpen
landing, then the direction change below. Before screenshots:
`docs/qa/sharpen/before-*.png` (23 files, desktop + mobile; local-only, gitignored).

## What read as template/AI (combined critique, score 20/32)

1. **Stock neon-on-dark accent scheme.** The accent is literally Tailwind
   fuchsia-500/violet-600 as fills and glows on near-black - the most
   recognizable generated-site palette. Detector: `ai-color-palette` x17
   (eyebrows, chips), `gradient-text` x2, `dark-glow` x1.
2. **Gradient text in the hero** ("in the open") - the canonical AI hero move.
3. **The identical section scaffold repeated 8x**: magenta all-caps eyebrow ->
   display title -> lead -> cards, over alternating dark/light bands.
   Detector: `kicker-above-heading` x8.
4. **The 2x2 icon+heading+text pillar grid** - the banned SaaS card wall.
5. **Big-digit countdown blocks** - launch-hype/esports register, not IEEE.
6. **Almost no physical evidence on screen.** No people, podiums, halls,
   hardware close-ups; one blurry clip used twice (one mislabeled "Vienna" on
   Detroit footage) and an underlit 3D model. Neon + countdown + absence of
   the real world = "game site".
7. Stat numbers repeated up to 4x across copy; two sections shared the same
   eyebrow; 1.25rem radii + shadowed cards read soft/consumer.
8. Detector false positives noted for the record: `wide-tracking` on uppercase
   eyebrows (rule exempts them), `tight-leading` on a display heading.
   `ai-color-palette` fired on the then-approved palette - a doctrine
   collision that Cedric's verdict resolved against the old doctrine.

## Direction change (Cedric, 2026-08-21 - now normative in DESIGN.md + skill)

- **Paper is the default surface.** Ink only for hero, car chapter, footer.
- **Accent as hairline, not fill.** Max one solid magenta CTA per viewport;
  magenta otherwise only as 1px rules, a 4px index marker, chips, link
  underlines. No gradient text anywhere; gradient lives in the logo only.
  Icons are ink-900 strokes.
- **Sharp shapes.** Cards/panels 4px, media 6px, pills stay. On ink no
  border+fill panels - type, rules, and media only.
- **Visible structure.** 12-col grid with optional hairline column guides;
  numbered mono section eyebrows ("01 / Next race"); captions and data in
  mono; asymmetric 5/7 splits; display type at line-height 0.98,
  tracking -0.03em against small mono captions.
- **Feel references** (patterns, no assets): neobotics.org (cinematic
  sections), mclaren.com/racing + formula-e.com (accent discipline,
  photography-first), linear.app (hairlines, density), ForzaETH's site
  (engineering seriousness).
- **Photography in**: ICRA 2026 group photo full-bleed in highlights, IV 2026
  podium in next-race/teams - pending files from Cedric (_harvest/drive is
  empty on this machine). Until then: one correctly-captioned real clip and
  explicitly-labeled empty slots, no fake media.

## Fixes folded in from Cedric's review

ExplodedModel: pin 230vh -> 120vh, scrub 0.6, chapter explosion ceiling 0.5
(offsets halved in the chapter only; /assembly keeps its full range),
assembled by 70% of the pin. Hero re-encoded from FPV_IV.mp4 at NATIVE 1280
(no upscaling): capped-crf 22 @ maxrate 1800k = 7.6 MB (8 MB budget for this
file recorded in CLAUDE.md rule 3; literal crf 22 measured 16.2 MB), mobile
960 = 2.97 MB, poster regraded. Teams render every entry with a mono
"unverified" tag - nothing hidden on localhost. Deadline displayed plainly.

## After (same dual-agent method, rebuilt landing)

| Measure | Before | After |
|---|---|---|
| Nielsen total (H7/H10 n/a) | 20/32 | **27/32** |
| Detector findings (browser, full ruleset) | 36 (23 groups) | **8** |
| Specificity verdict | "partially AI-dark-SaaS" | **"Authored - nobody would call this an AI neon game site"** |

Detector delta: ai-color-palette -17, kicker-above-heading -8, wide-tracking
-4, gradient-text -2, dark-glow/layout-transition/marquee -3. The 8 that
remain: 6x nested-cards (5 judged false-positive-shaped - dashed slot,
segmented team cells, bare column parents; SponsorCTA is the one honest
match), tight-leading on a display heading, overused-font on the approved
display face.

What the after-critique still flagged, fixed before merge: mobile team-cell
clipping (min-w-0 + per-cell hairlines instead of the gap-px backdrop, which
also kills the empty-cell gray slab), column guides scoped away from running
text, visible "05 / Scale" index (numbered documents invite counting), a
mono pause/play control on the hero loop (WCAG 2.2.2), spotlight ledger
wrapping at 390px.

Still open by design: the four-column legacy footer (Phase 3.5), Space
Grotesk share-of-text (approved face), SponsorCTA panel nesting (accepted -
it is the section's one framed object). Assessment A's suggestion worth a
decision from Cedric: fill the teams grid's last empty cell with a dashed
"your team here - register" slot as a conversion hook.

## Photos still needed from Cedric

1. ICRA 2026 Vienna group photo -> full-bleed in 02 / Highlights (slot reserved).
2. IV 2026 Detroit podium photo(s) -> next-race or teams area with mono caption + credit.
3. Any 2026 race-action stills -> additional highlight tiles (slots render honestly until then).
_harvest/drive is empty on this machine; drop files there or give paths in chat.
