// Is public/rules.md still the official ruleset?
//
// The page is not updated automatically: public/rules.md is a committed copy,
// so a change to the rules is reviewed like any other change to the site.
// Since 2026-09-21 (Cedric) that copy is verbatim: rules_v3.md on the dev-2026
// branch of github.com/f1tenth/roboracer_rules, nothing added and nothing
// removed. Competition-specific rules live on each competition's own site.
//
//   node scripts/check-rules-drift.mjs           report; exit 1 if the texts differ
//   node scripts/check-rules-drift.mjs --write   replace the copy with upstream
//
// Run it before a competition, or from CI on a schedule. When the ruleset
// moves to another branch or file, change UPSTREAM here and SOURCE_URL in
// src/pages/Rules.tsx together.
import { readFileSync, renameSync, writeFileSync } from "node:fs";

const UPSTREAM =
  "https://raw.githubusercontent.com/f1tenth/roboracer_rules/dev-2026/rules_v3.md";
const LOCAL = "public/rules.md";

const headings = (md) =>
  md
    // a heading inside an HTML comment is not in force
    .replace(/<!--[\s\S]*?-->/g, "")
    .split("\n")
    .filter((l) => /^#{1,3} /.test(l))
    .map((l) => l.replace(/^#+\s*/, "").trim());

const res = await fetch(UPSTREAM);
if (!res.ok) {
  console.error(`rules-drift: upstream fetch failed (${res.status})`);
  process.exit(2);
}
const upstream = await res.text();
const local = readFileSync(LOCAL, "utf8");

if (upstream === local) {
  console.log(`no drift: ${LOCAL} matches upstream (${headings(local).length} headings).`);
  process.exit(0);
}

if (process.argv.includes("--write")) {
  // Rename over the original: Vite must never read a half-written file.
  writeFileSync(`${LOCAL}.tmp`, upstream);
  renameSync(`${LOCAL}.tmp`, LOCAL);
  console.log(`${LOCAL} replaced with upstream. Review the diff, then check /rules in a browser.`);
  process.exit(0);
}

const up = headings(upstream);
const here = headings(local);
const missing = up.filter((s) => !here.includes(s));
const extra = here.filter((s) => !up.includes(s));
const upLines = upstream.split("\n");
const hereLines = local.split("\n");
const changed = upLines.filter((l, i) => l !== hereLines[i]).length + Math.abs(upLines.length - hereLines.length);

console.log(`drift: about ${changed} lines differ (upstream ${upLines.length} lines, site ${hereLines.length}).`);
if (missing.length) console.log(`\nin the official ruleset but NOT on the site:\n  - ${missing.join("\n  - ")}`);
if (extra.length) console.log(`\non the site but not upstream:\n  - ${extra.join("\n  - ")}`);
console.log("\nrun again with --write to take the upstream text.");
process.exit(1);
