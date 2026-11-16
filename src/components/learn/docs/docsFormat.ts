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
