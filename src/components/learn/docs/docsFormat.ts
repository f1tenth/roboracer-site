import type { DocsNavItem, DocsSession, DocsSessionKind, LearnDocsFile } from "../../../lib/data";

/** The preview of the rebuilt course docs lives under this path; /learn is
 * still the framed Sphinx docs until the rebuild is approved. */
export const ROOT = "/learn-new";

const utc = (iso: string) => new Date(`${iso}T00:00:00Z`);

/** "Wed, Aug 26". The weekday is computed from the date: the sheet's own
 * day letters are ambiguous (T for both Tuesday and Thursday). */
export const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" }).format(utc(iso));

/** "Aug 26". */
export const fmtDay = (iso: string) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(utc(iso));

export const KIND_TAG: Record<DocsSessionKind, string | null> = {
  lecture: null,
  session: null,
  recitation: "Recitation",
  race: "Race",
  break: "Break",
  "office-hours": "Office hours",
  project: "Project",
};

export const sessionsOf = (docs: LearnDocsFile, moduleId: string) => docs.schedule.filter((s) => s.module === moduleId);

export const numberedLectures = (sessions: DocsSession[]) => sessions.filter((s) => s.lecture !== null);

export type DocsLab = { number: number; title: string; optional: boolean; out: string; due: string | null };

/** Labs a module hands out, read from the "Assignments out" column; the due
 * date is the first later session whose "Assignments due" names the lab. */
export function labsOf(docs: LearnDocsFile, sessions: DocsSession[]): DocsLab[] {
  const labs: DocsLab[] = [];
  for (const s of sessions) {
    const m = /^(Optional )?Lab (\d+): (.+)$/.exec(s.out);
    if (!m) continue;
    const n = Number(m[2]);
    const dueRow = docs.schedule.find((d) => d.date > s.date && new RegExp(`\\bLab ${n}\\b`).test(d.due));
    labs.push({ number: n, title: m[3], optional: !!m[1], out: s.date, due: dueRow ? dueRow.date : null });
  }
  return labs;
}

/** Every page in reading order (module lectures with their tutorials), for
 * Previous / Next. External entries are left out. */
export function flatNav(docs: LearnDocsFile): DocsNavItem[] {
  const out: DocsNavItem[] = [];
  const add = (it: DocsNavItem) => {
    if (it.to.startsWith(ROOT)) out.push(it);
    // Hash links (the grading page's own sections) are not pages.
    it.children?.filter((c) => !c.to.includes("#")).forEach(add);
  };
  docs.nav.forEach((g) => g.items.forEach(add));
  return out.filter((it, i) => out.findIndex((o) => o.to === it.to) === i);
}

/** The module letter a path belongs to, if any. */
export function moduleOfPath(pathname: string, docs: LearnDocsFile): string | null {
  if (pathname === `${ROOT}/module-a` || pathname.startsWith(`${ROOT}/module-a/`)) return "A";
  const key = pathname.startsWith(`${ROOT}/doc/`) ? pathname.slice(`${ROOT}/doc/`.length) : null;
  return key ? (docs.pages[key]?.module ?? null) : null;
}

const labNorm = (t: string) =>
  t.toLowerCase().replace(/^(optional )?lab \d+\s*[-:]?\s*/, "").replace(/&/g, "and").replace(/[^a-z0-9]+/g, " ").trim();

/** The docs page for "Lab N". The sheet numbers the later labs differently
 * from the older docs (its Lab 9 is the docs' Lab 10), so a lab the schedule
 * names is matched by title first; a bare number falls back to the same page
 * number only through Lab 8, where the two agree. */
function labPage(docs: LearnDocsFile, n: number): string | null {
  const named = docs.schedule
    .flatMap((s) => entriesOf(s.out))
    .find((e) => new RegExp(`^(?:Optional )?Lab ${n}:`).test(e));
  const keys = Object.keys(docs.pages).filter((k) => /^assignments\/labs\/lab\d+$/.test(k));
  if (named) {
    const want = labNorm(named);
    const hit = keys.find((k) => labNorm(docs.pages[k].title) === want);
    if (hit) return hit;
  }
  const byNumber = `assignments/labs/lab${n}`;
  return n <= 8 && docs.pages[byNumber] ? byNumber : null;
}

/** The page a schedule entry (a lab, race or the project) points to, or null
 * where the docs have no page for it. Only pages that exist are linked. */
export function entryHref(docs: LearnDocsFile, text: string): string | null {
  const page = (key: string | null) => (key && docs.pages[key] ? `${ROOT}/doc/${key}` : null);
  const lab = /^(?:Optional )?Lab (\d+)\b/.exec(text);
  if (lab) return page(labPage(docs, Number(lab[1])));
  const race = /^Race (\d)\b/.exec(text);
  if (race) return page(`assignments/races/race${race[1]}`);
  if (/^Final Race/.test(text)) return page("assignments/races/race3");
  if (/^Final Project\b/.test(text)) return page("assignments/final_project");
  return null;
}

/** A comma-separated schedule cell ("Lab 4, Lab 5") as separate entries. */
export const entriesOf = (cell: string) => cell.split(/,\s*/).filter(Boolean);
