---
name: roboracer-audiences
description: Who visits roboracer.ai and what each of them needs - the eight visitor personas, the page plan, and the team/velocity targets from the Rahul / Ayagoz / Cedric website meeting (2026-08-21). Load before designing or reviewing any page so every section can name who it serves.
user-invocable: false
---

# Audiences and page plan (meeting notes, Fri 21 Aug 2026)

Use these to decide what a section is FOR. Every section on every page should name the
persona it serves in its code comment. Rahul's content is available page by page on
request (Ayagoz asks); AI-drafted copy is hand-tuned afterwards to be punchier.

## Eight visitor personas

1. Newbie: no prior knowledge; wants to know if RoboRacer is exciting. Show motion first
   (Stephen Gong's three videos when they land; until then the hero loop and highlights).
   Taglines: "Build, Code, Race".
2. Interested beginner: saw a race online; needs a "how do I get started" landing.
3. Builder: ready to build a car; needs a simple 3-step guide with BOM and time estimate.
4. Student / learner: lectures, labs, course materials (Learn page).
5. Competitor: upcoming events and how to participate (dates, registration, rules).
6. Faculty: nervous about teaching with it; needs reassurance and video walkthroughs.
7. Corporate sponsor: sponsorship info and company value beyond recruiting (reach, scale,
   countries, institutions, media exposure).
8. Press / media: a PR kit (logos, photos, one-paragraph description, contacts).

"Join our Slack" and GitHub links are prominent on every page.

## Page plan (Rahul)

- Front page: highest priority, push to completion first. Hero with auto-playing race
  videos (many available; Cloudflare hosting was mentioned, but the repo rule is still
  no Cloudflare until Cedric says otherwise).
- History / map page: 35+ events across Italy, Nigeria, Korea, Abu Dhabi and more; an
  interactive map of all event locations; 2024 alone had 9 events. (The landing carries a
  compact version: the community map chapter. Nigeria is not in our event list yet:
  verify with Rahul before it becomes a pin.)
- Research page: curated featured papers, not just a Scholar link. 50-100+ papers over
  6-7 years (Scholar shows 1,000+ results for the query). Ahmad's YAML-based event
  manager is the model for adding papers via a structured form (link, PDF, embedded
  video); our `publications.json` + `/add-paper` is the equivalent. Front page shows
  featured papers, deeper link to the full list.
- Rankings page: winners per competition (ICRA, IROS); no cross-competition comparison.
- Blog page: community posts ("this is how I raced, this is what I learned").
- Social aggregator: LinkedIn, Instagram and other updates on one page.
- Contact page: Slack first, then contact@roboracer.ai (Ayagoz is admin).

## Team, roles, velocity

- Ayagoz: page design, wireframes, brainstorming; builds the sitemap first (pages,
  purpose, visitor flows), then wireframes page by page, low fidelity, fast iteration.
- Cedric: programming support; not to be overloaded (research commitments).
- Kathleen (undergrad, Penn Electric marketing): joining; made the sponsorship flyer.
- Metric: pages shipped per week. Target about 3 pages/week across three people; full
  site live in 3 weeks from 2026-08-21.

## Competitive framing (Cedric)

neobotics.org is the comparison. The goal is a site at least as good that shows
RoboRacer is the organization and community, with Neobotics as one platform vendor
within it. Patterns and proportions only; never their assets.
