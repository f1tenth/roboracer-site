---
name: discover
description: Kick off the discovery phase of the roboracer.ai revamp - runs the repo-auditor, design-extractor, asset-harvester, and content-auditor subagents in parallel and collects their outputs in docs/. Use once at the start and again after big structural or content changes.
disable-model-invocation: true
argument-hint: "[all | audit | design | assets | content]"
---

# /discover

Target: `$ARGUMENTS` (default `all`).

Run the selected agents as background subagents, in parallel, each with a precise task prompt. Do not do their work in the main session. While they run, tell Cedric what is running and that results land in `docs/`.

- `audit`  -> @repo-auditor: "Audit this repository per your instructions. Write docs/AUDIT.md and regenerate .claude/skills/roboracer-site-map/SKILL.md. Return the summary and top 3 risks."
- `design` -> @design-extractor: "Produce docs/DESIGN.md, docs/design/tokens.proposed.css and the open questions list. Reference sites: neobotics.org (and /kits), cedrichollande.com, the current roboracer.ai. Patterns only, no assets."
- `assets` -> @asset-harvester: "Build docs/ASSET_MANIFEST.md from the f1tenth GitHub org repos, the Wayback Machine for f1tenth.org (start with the 2024-01-09 race.html snapshot), _harvest/drive if present, and the race sites. Report gaps."
- `content` -> @content-auditor: "Audit all copy and data against the roboracer-content skill. Write docs/CONTENT.md and docs/content/*.proposed.json. Return the KEEP/CHANGE/REMOVE/TODO counts and the questions for Cedric and Rahul."

When all selected agents have returned:
1. Read the four reports' summary sections (not the whole files) and write `docs/DISCOVERY_SUMMARY.md`: 20 lines max, the decisions Cedric must make before design work starts, and the list of questions for Rahul ready to paste into Slack.
2. Commit the `docs/` outputs and the regenerated site-map skill on branch `infra/discovery` and open a PR so Ayagoz can read them. Do not merge.
3. Stop and wait for Cedric's answers. Do not start the design-system phase on your own.
