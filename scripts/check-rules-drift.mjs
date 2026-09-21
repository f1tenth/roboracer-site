// Is public/rules.md still in step with the official ruleset repo?
//
// Cedric believed the page was updated automatically from
// github.com/f1tenth/roboracer_rules. It never was: there is no workflow, no
// script, and the file is a hand-maintained copy. Ahmad noticed the page
// stopped at section 2 while upstream had a section 3.
//
// This does NOT overwrite the page, and that is deliberate: upstream is
// currently STALER than the site. Its README still opens on the 24th
// competition dated 2025-02-03 and links to icra2025, while the site is
// current for the 31st at IROS 2026. A blind sync would undo that.
//
// So it reports instead: which top-level sections each side has, and whether
// upstream has moved since the last check. Run it before a competition, or
// from CI on a schedule, and act on what it prints.
import { readFileSync } from "node:fs";

const UPSTREAM =
  "https://raw.githubusercontent.com/f1tenth/roboracer_rules/main/README.md";
const LOCAL = "public/rules.md";

const sections = (md) =>
  md
    .split("\n")
    // headings inside an HTML comment are not in force upstream (3.2-3.4 are
    // commented out there), so drop commented blocks before scanning
    .join("\n")
    .replace(/<!--[\s\S]*?-->/g, "")
    .split("\n")
    .filter((l) => /^#{1,2} /.test(l))
    .map((l) => l.replace(/^#+\s*/, "").trim());

const res = await fetch(UPSTREAM);
if (!res.ok) {
  console.error(`rules-drift: upstream fetch failed (${res.status})`);
  process.exit(2);
}
const up = sections(await res.text());
const local = sections(readFileSync(LOCAL, "utf8"));

const missing = up.filter((s) => !local.includes(s));
const extra = local.filter((s) => !up.includes(s));

console.log(`upstream sections: ${up.length}, local: ${local.length}`);
if (missing.length) console.log(`\nin the official ruleset but NOT on the site:\n  - ${missing.join("\n  - ")}`);
if (extra.length) console.log(`\non the site but not upstream (usually competition-specific edits):\n  - ${extra.join("\n  - ")}`);
if (!missing.length && !extra.length) console.log("\nno drift.");

// Only a section the site is missing is a failure; site-only sections are
// expected, since the page is edited per competition.
process.exit(missing.length ? 1 : 0);
