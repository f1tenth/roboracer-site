#!/usr/bin/env bash
# Vendor third-party Claude Code skills into .claude/skills/ (pinned, committed, available to every
# session and subagent in this repo, including Claude Code on the web). Re-run to update.
# Usage: scripts/install-skills.sh            (from the repo root)
set -euo pipefail
ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd); cd "$ROOT"
DEST=.claude/skills; TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT
MANIFEST="$DEST/VENDORED.md"
{
  echo "# Vendored skills"; echo; echo "Installed by scripts/install-skills.sh on $(date -u +%F). Do not edit in place; re-run the script to update. Licenses: see each upstream repo (Apache-2.0 / MIT)."; echo
  echo "| skill | source | path in source | commit |"; echo "|---|---|---|---|"
} > "$MANIFEST"
vendor() { # vendor <repo-url> <subpath-in-repo> <dest-name>
  local repo=$1 sub=$2 name=$3 dir
  dir="$TMP/$(echo "$repo" | tr '/:' '__')"
  [ -d "$dir" ] || git clone -q --depth 1 "$repo" "$dir"
  if [ ! -f "$dir/$sub/SKILL.md" ]; then echo "  !! $name: $sub/SKILL.md not found in $repo (upstream layout changed?)"; return; fi
  rm -rf "$DEST/$name"; mkdir -p "$DEST/$name"; cp -R "$dir/$sub/." "$DEST/$name/"
  echo "| $name | $repo | $sub | $(git -C "$dir" rev-parse --short HEAD) |" >> "$MANIFEST"
  echo "  + $name"
}
echo "vendoring skills into $DEST ..."
# Anthropic
vendor https://github.com/anthropics/skills skills/frontend-design frontend-design
vendor https://github.com/anthropics/skills skills/webapp-testing webapp-testing
# GSAP (official)
vendor https://github.com/greensock/gsap-skills skills/gsap-core gsap-core
vendor https://github.com/greensock/gsap-skills skills/gsap-scrolltrigger gsap-scrolltrigger
vendor https://github.com/greensock/gsap-skills skills/gsap-react gsap-react
vendor https://github.com/greensock/gsap-skills skills/gsap-performance gsap-performance
# ibelick/ui-skills
vendor https://github.com/ibelick/ui-skills skills/create-design-md create-design-md
vendor https://github.com/ibelick/ui-skills skills/baseline-ui baseline-ui
vendor https://github.com/ibelick/ui-skills skills/improve-ui improve-ui
vendor https://github.com/ibelick/ui-skills skills/fixing-motion-performance fixing-motion-performance
vendor https://github.com/ibelick/ui-skills skills/fixing-accessibility fixing-accessibility
vendor https://github.com/ibelick/ui-skills skills/fixing-metadata fixing-metadata
# addyosmani/web-quality-skills
vendor https://github.com/addyosmani/web-quality-skills skills/web-quality-audit web-quality-audit
# antfu/skills (vite)
vendor https://github.com/antfu/skills skills/vite vite
# Vercek web-design-guidelines - dense review checklist, strongest on interaction details
vendor https://github.com/vercel-labs/agent-skills skills/web-design-guidelines web-design-guidelines
# UI-UX-Pro-Max Skill
vendor https://github.com/nextlevelbuilder/ui-ux-pro-max-skill .claude/skills/ui-ux-pro-max ui-ux-pro-max
echo
echo "done. Inside Claude Code also run once:"
echo "  /plugin marketplace add anthropics/claude-plugins-official   (if not already added)"
echo "  /plugin install superpowers@claude-plugins-official           (brainstorm -> plan -> verify discipline)"
echo "  /plugin install skill-creator@claude-plugins-official         (evaluate/improve our skills later)"
echo "Optional alternative to vendoring GSAP: /plugin marketplace add greensock/gsap-skills"
echo "If the skill listing gets long, hide rarely used ones with /skills (Space cycles name-only/off)."
