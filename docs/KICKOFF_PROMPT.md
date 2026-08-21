# Kickoff prompts for Claude Code

Paste these into Claude Code, one phase at a time, from the repo root. Use `/model opus` (or the best model you have) for the main session; the agents pick their own models.

## Session 1: discovery (paste as the first message)

```
You are running the roboracer.ai revamp. Read CLAUDE.md and docs/PLAN.md first, then confirm in five lines that you understand: the stack lock, the branch rules, the quality gates, and the phase we are in (Phase 1: discovery).

Then run /discover all. Let the four subagents work in parallel in the background; do not do their work yourself. When all four have returned, write docs/DISCOVERY_SUMMARY.md as the skill instructs, open the infra/discovery PR, and stop. Give me: the decisions I need to make before design work starts, the questions for Rahul (ready to paste into Slack), and the three biggest risks you found.
```

Before pasting it, copy the hero video into the harvest folder:
```bash
mkdir -p _harvest/hero && cp /home/cedric/Documents/UPenn/xLAB/Roboracer/IROS2026/iros2026_race/images/Roboracer/roboracer_fpv.mp4 _harvest/hero/
```
and add this line to the prompt: "Also: the asset-harvester must encode _harvest/hero/roboracer_fpv.mp4 per the media skill and report mesh sizes in public/models/racecar; the repo-auditor must document the /assembly viewer (src/pages/Assembly.tsx, src/components/RacecarAssembly.tsx, racecarAssemblyData.ts) and propose how the landing ExplodedModel chapter reuses its scene; the content-auditor must seed public/data/teams.json candidates from past results pages per the content skill."

Expected duration: 30 to 60 minutes of agent time. If an agent fails on network access (archive.org, gh auth), tell it to skip that source, note it in the report, and continue.

## Session 2: design system (new session, after you answered the decisions)

```
Read CLAUDE.md, docs/PLAN.md (Phase 2), docs/DESIGN.md, docs/design/tokens.proposed.css and the roboracer-design-system skill. My decisions: <paste your answers to DISCOVERY_SUMMARY.md here>. Ayagoz's notes: <paste or "none yet">.

The design system is not a page, so do not use /build-page. Create the branch revamp/design-system with scripts/rr.sh page design-system, then implement Phase 2 from docs/PLAN.md: tokens into src/index.css @theme, fonts, src/components/ui primitives, src/lib/data.ts, src/lib/motion.ts (GSAP + ScrollTrigger + @gsap/react + lenis), usePrefersReducedMotion, and a /styleguide route that renders every primitive in ink and paper variants with sample content from the JSON files. Update the roboracer-design-system skill so it documents the final tokens and primitives (replace the DRAFT header). Run /qa-page styleguide /styleguide. Then stop and tell me what to look at on localhost.
```

## Session 3+: one page per session

```
Read CLAUDE.md and docs/PLAN.md. We are building the <landing> page. Run /build-page <landing>. Show me the plan before implementing. I will review on localhost and give feedback in this session; do not open the PR until I say /ship.
```

Feedback loop examples you can type:
- "hero: headline is two lines on mobile, cut it to six words"
- "chapter 2 pins for too long, halve it"
- "use manifest asset icra2026-podium-03 for the race spotlight background"
- "the counter animation runs every time I scroll back, make it once"
- "run @qa-reviewer on this branch"
- "/qa-page landing" then "/ship landing"

## Utility prompts
- Re-audit after a big merge: `/discover audit`
- Content only changed (new event, new date): `Create branch content/<topic>, update public/data/<file>.json per the roboracer-content skill, run npm run build, /ship <topic>.`
- New paper: `/add-paper https://arxiv.org/abs/2408.12345` or `/add-paper ~/Downloads/paper.pdf --featured`
- Weekly sweep by hand: `/discover-papers`
- Improve a skill with evidence: `evaluate the add-paper skill with skill-creator` (after installing the plugin)
