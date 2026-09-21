# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: competition teams — student and research groups deciding whether to enter (or return to) a RoboRacer race, starting with the 31st competition at IROS 2026, Pittsburgh. When two audiences pull a page in different directions, teams win by default (Cedric, 2026-08-21).

Secondary, in rough order: researchers and faculty evaluating the platform for their lab; students and self-learners building a car through the courses; prospective sponsors and partner institutions.

## Product Purpose

roboracer.ai is the public home of RoboRacer (formerly F1TENTH): an international community around a 1/10-scale open-source autonomous racing platform — the vehicle, the sim, the courses, the race series, and the research built on it. Founded 2016 at the University of Pennsylvania (faculty lead Rahul Mangharam, Penn ESE / xLab).

Success for the revamped site over the next year (Cedric, 2026-08-21):

1. IROS 2026 team registrations — teams find the spotlight and register by Sep 5, 2026.
2. Community growth — Slack joins, GitHub engagement, new universities adopting the platform.
3. Research visibility — the "1,000+ publications" message lands; the platform reads as research infrastructure; labs submit papers.
4. Partner relationships that mature into sponsorships — there are currently partners, not sponsors; the site should start real conversations with companies of NVIDIA's caliber. Never present partners as sponsors.

## Positioning

The full ecosystem, and a decade of it: the only open-source platform combining a real 1/10-scale vehicle, a simulator, university courses, an international competition series (30 competitions held since 2016), and 1,000+ publications that reference it. No neighboring platform can truthfully claim the combination.

## Operating Context

- Teams discover a race, check dates/rules/registration, and prepare via the docs; each competition has its own site at `https://{conference}{year}-race.roboracer.ai` (IFAC 2026 excepted). The main site funnels to those.
- Four pillars structure the product: Build (open-source vehicle system), Learn (courses, f1tenth-coursekit), Race (competition series), Research (publications platform).
- Content is data: facts live in `public/data/*.json` and the `roboracer-content` skill; fact precedence is Cedric > IROS Competitions Handbook > iros2026-race.roboracer.ai > the skill.
- The revamp ships page-by-page (branch per page, Cedric reviews on localhost, Ayagoz Smagulova co-owns design) with the site live before IROS 2026 (Sep 28); race spotlight and research page land first.

## Capabilities and Constraints

- Stack (fixed by decision, 2026-08-20): Vite 6 + React 19 + TS 5.7 + Tailwind v4, react-router v7 SPA, GSAP/ScrollTrigger/lenis for motion, three/@react-three/fiber for the 3D car. GitHub Pages deploy, custom domain roboracer.ai. No Next.js migration.
- No binary over 1.5 MB in git except the landing hero loop encodes under `public/media/hero/` (desktop 1280 encode ≤ 8 MB, mobile 960 < 3 MB, poster required, native resolution only). No Cloudflare account exists.
- `/build`, `/learn`, `/course` stay iframes in v1. Existing routes must keep working.
- Facts (dates, fees, venues, names, counts) are never invented; missing facts become `TODO(content)` plus a question to Cedric. Facts marked VERIFY in the content skill need Cedric's confirmation before going live.
- Google Scholar cannot be embedded; it is linked out (the 1,000+ query).
- Terminology: "RoboRacer" everywhere; "formerly F1TENTH" once on About and in SEO metadata. Partners (institutions using the platform) are distinct from sponsors (currently zero — correct state, render "Become a sponsor", never an empty tier).

## Brand Commitments

- Names and marks: RoboRacer wordmark and gradient logo (magenta `#FB00FF` → cyan `#00D1DA` in the logo SVGs). Cyan is reserved for logo and telemetry accents; magenta `#D946EF` is the interactive accent (Cedric, Phase 2 decisions).
- Voice (binding, from `roboracer-content`): confident, concrete, international, engineering-minded. Short sentences, numbers over adjectives, address the reader as a builder or team. American spelling. No exclamation marks, no em dashes, no "cutting-edge" / "leverage" / "seamless" / "unleash" / "revolutionize".
- Neobotics.org and cedrichollande.com are pattern references only; no third-party assets or copy ever. Community media only with recorded permission.
- Design authority: `docs/DESIGN.md` + the `roboracer-design-system` skill (status FINAL, approved 2026-08-20; Ayagoz may still revise font pairing, card radius, gradient budget).

## Evidence on Hand

- 1,000+ Google Scholar results for `f1tenth | roboracer` (linkable query); 67-entry curated BibTeX migrated to `public/data/publications.json`.
- Scale stats in use: 90+ universities, 20+ countries, 30 competitions held (until IROS makes it 31). University/country counts pending re-verification by Rahul.
- ICRA 2026 Vienna: biggest competition to date, 180+ competitors / 35 teams (VERIFY until written source); group photo exists. IV 2026 Detroit podium confirmed (1st Thunderbolt/UPenn, 2nd 404 Racers, 3rd WVU — team name TODO). Podium photos exist.
- ~70 partner logos in `public/partners/`; 20 institutions in `partners.json`.
- Hero footage: `/home/cedric/Downloads/FPV_IV.mp4` (organizer-owned, 720p source, loop cut 3s–36s); encodes committed under `public/media/hero/`.
- 30-entry past-races history in `past_races.json`.
- Absences that must not be fabricated: zero confirmed sponsors (LiveTime and MyLaps declined; Traxxas pending); team roster roles and headshots pending Rahul; featured-paper list pending Rahul; social handles for the footer unverified; no testimonial or press quotes beyond what `testimonials.json` holds.

## Product Principles

1. Teams first: every ambiguous call resolves toward the visitor who might register a car for the next race.
2. The race is the door, the ecosystem is the house: lead with racing energy, then show that courses, research, and community make it more than an event.
3. Numbers over adjectives: scale claims (1,000+ papers, 90+ universities, 30 competitions) do the persuading; nothing unverifiable ships.
4. Partners become sponsors by being treated seriously: show institutional scale honestly today so companies like NVIDIA see a relationship worth funding.
5. Everything is open and data-driven: content is JSON, the platform is open source, and the site should feel like the community owns it.

## Accessibility & Inclusion

WCAG AA contrast, semantic landmarks, one h1 per page, alt text everywhere, visible focus states, keyboard-reachable nav and CTAs (CLAUDE.md rule 7). Every animation respects `prefers-reduced-motion` and degrades to a static, fully readable layout; content must survive JavaScript-disabled rendering (rule 6). International audience: dates written unambiguously ("September 28 to 30, 2026" in prose, "Sep 28-30, 2026" in cards).
