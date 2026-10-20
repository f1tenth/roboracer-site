import {
  lectureSelection,
  type CoursesFile,
  type CoursePlan,
  type OutlineItem,
  type OutlineLab,
  type OutlineModule,
  type OutlineRace,
} from "./data";
import { listWords, numberRange } from "../components/learn/learnStyles";

/**
 * The teach page's plan builder as pure functions: a set of module ids in,
 * everything the page shows and sends out. Every figure is counted from
 * `outline` and `plans` in courses.json, and the labs come from
 * lectureSelection(), so a plan picked here can never disagree with the
 * catalog's table. A custom selection gets no weeks, hours or dates: only a
 * selection equal to a plan names that plan (and so its weeks).
 */

/**
 * Every micro-label the builder introduces (stage 3 moves them into
 * courses.json). `{name}` slots are filled by fill(). The count labels that
 * courses.json already holds (`stats[].label`) are read from there instead.
 */
export const LABELS = {
  startLegend: "Start from a plan",
  weeksOption: "{n} weeks",
  modulesLegend: "Modules",
  moduleSr: "Module {id}: ",
  lectureOne: "{n} lecture",
  lectureMany: "{n} lectures",
  tutorialOne: "{n} tutorial",
  tutorialMany: "{n} tutorials",
  labOne: "Lab {list}",
  labMany: "Labs {list}",
  summaryHeading: "Your plan",
  matches: "Matches the {plan}",
  custom: "Custom selection",
  customShort: "Custom",
  customNote: "The course site gives weeks only for its three plans.",
  empty: "No modules selected",
  emptyShort: "No modules",
  emptyNote: "Choose at least one module to copy, share or email a plan.",
  seePlan: "See the {plan}",
  tutorials: "tutorials",
  detailModules: "Modules",
  detailLabs: "Labs",
  detailRaces: "Races",
  detailOptional: "Optional",
  detailProject: "Final project",
  projectIncluded: "Included, Modules {modules}",
  none: "none",
  email: "Email it to us",
  copy: "Copy plan",
  share: "Share link",
  copied: "Plan copied.",
  linkCopied: "Link copied.",
  copyFailed: "Your browser blocked the clipboard. The link below can be selected and copied by hand.",
  shareLabel: "Link to this plan",
  stored: "Nothing is stored or sent; Email opens your own mail app.",
  railLabel: "On this page",
  textTitle: "RoboRacer course plan",
  textLink: "Link",
  textModule: "Module {id}: {title}",
  textRecorded: "recorded",
  textMaterial: "Course material",
  textLicense: "License",
  mailGreeting: "Hello RoboRacer team,",
  mailIntro: "We would like to teach the RoboRacer course with this plan.",
  mailFields: ["University:", "Your names:"],
} as const;

/** "{n} weeks" + { n: 4 } -> "4 weeks". */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => (k in vars ? String(vars[k]) : `{${k}}`));
}

/** Known module ids, deduped, in the outline's order. */
export function normalizeModules(c: CoursesFile, ids: Iterable<string>): string[] {
  const want = new Set(Array.from(ids, (id) => id.trim().toUpperCase()));
  return c.outline.modules.map((m) => m.id).filter((id) => want.has(id));
}

/**
 * `?modules=A,B,D` -> ["A", "B", "D"]. null when the parameter is absent (the
 * page then starts from its default plan); an empty or all-unknown value is an
 * empty selection. Commas, spaces and plus signs all separate.
 */
export function parseModules(c: CoursesFile, param: string | null): string[] | null {
  if (param === null) return null;
  return normalizeModules(c, param.split(/[\s,+]+/).filter(Boolean));
}

/** The query string for a selection, commas left readable: "?modules=A,B,D". */
export function modulesSearch(ids: string[]): string {
  return `?modules=${ids.join(",")}`;
}

/** Add or drop one module, keeping the outline's order. */
export function toggleModule(c: CoursesFile, ids: string[], id: string): string[] {
  return normalizeModules(c, ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]);
}

/** The plan whose modules are exactly this selection, or null. */
export function matchPlan(c: CoursesFile, ids: string[]): CoursePlan | null {
  const sel = normalizeModules(c, ids);
  return (
    c.plans.find((p) => {
      const mods = normalizeModules(c, p.modules);
      return mods.length === sel.length && mods.every((id, i) => id === sel[i]);
    }) ?? null
  );
}

export type PlanSummary = {
  ids: string[];
  modules: OutlineModule[];
  /** Lecture pages, optional ones apart ("Lectures 23 to 25" is one page, as
   * the catalog's "23 lectures" counts them). */
  lectures: OutlineItem[];
  tutorials: OutlineItem[];
  optional: OutlineItem[];
  /** Lecture pages with a recording, optional ones included (the catalog's
   * "12 recorded lectures" counts them the same way). */
  recordedLectures: OutlineItem[];
  recordedTutorials: OutlineItem[];
  /** Required labs of the selected modules, straight from lectureSelection(). */
  labs: OutlineLab[];
  races: OutlineRace[];
  /** The final project runs through E to G: in only when all of them are. */
  project: boolean;
  match: CoursePlan | null;
};

export function planSummary(c: CoursesFile, ids: string[]): PlanSummary {
  const sel = normalizeModules(c, ids);
  const rows = lectureSelection(c).filter((r) => sel.includes(r.module.id));
  const modules = rows.map((r) => r.module);
  const items = modules.flatMap((m) => m.items);
  const raceIds = new Set(modules.flatMap((m) => m.races));
  return {
    ids: sel,
    modules,
    lectures: items.filter((i) => i.kind === "lecture" && !i.optional),
    tutorials: items.filter((i) => i.kind === "tutorial" && !i.optional),
    optional: items.filter((i) => i.optional),
    recordedLectures: items.filter((i) => i.kind === "lecture" && i.video),
    recordedTutorials: items.filter((i) => i.kind === "tutorial" && i.video),
    labs: rows.flatMap((r) => r.labs).sort((a, b) => a.number - b.number),
    races: c.outline.races.filter((r) => raceIds.has(r.id)).sort((a, b) => a.number - b.number),
    project: sel.length > 0 && c.outline.final_project.modules.every((id) => sel.includes(id)),
    match: matchPlan(c, sel),
  };
}

/** A stat label from courses.json (the hero ledger's words), or the fallback. */
function statLabel(c: CoursesFile, id: string, fallback: string): string {
  return c.stats.find((s) => s.id === id)?.label ?? fallback;
}

export type PlanCount = { id: string; label: string; value: number };

/** The live ledger: for the full course these equal the catalog's stats. */
export function planCounts(c: CoursesFile, s: PlanSummary): PlanCount[] {
  return [
    { id: "modules", label: statLabel(c, "modules", "modules"), value: s.modules.length },
    { id: "lectures", label: statLabel(c, "lectures", "lectures"), value: s.lectures.length },
    { id: "tutorials", label: LABELS.tutorials, value: s.tutorials.length },
    { id: "recorded", label: statLabel(c, "recorded", "recorded lectures"), value: s.recordedLectures.length },
    { id: "labs", label: statLabel(c, "labs", "labs"), value: s.labs.length },
    { id: "races", label: statLabel(c, "races", "races"), value: s.races.length },
  ];
}

/** "A to D" for a run of three or more in the outline's order, "A, B and D" otherwise. */
export function moduleList(c: CoursesFile, ids: string[]): string {
  const all = c.outline.modules.map((m) => m.id);
  const sel = normalizeModules(c, ids);
  if (sel.length > 2) {
    const start = all.indexOf(sel[0]);
    if (sel.every((id, i) => all[start + i] === id)) return `${sel[0]} to ${sel[sel.length - 1]}`;
  }
  return listWords(sel);
}

/** "Matches the 10-week course", "Custom selection" or "No modules selected". */
export function planStatus(s: PlanSummary): string {
  if (s.ids.length === 0) return LABELS.empty;
  return s.match ? fill(LABELS.matches, { plan: s.match.title }) : LABELS.custom;
}

/** "1 course race", "3 course races": the labels are plural, so one drops the s. */
export const countPhrase = (n: PlanCount) => `${n.value} ${n.value === 1 ? n.label.replace(/s$/, "") : n.label}`;

/** One line for the live region, the phone status bar and the texts. */
export function planCountsLine(c: CoursesFile, s: PlanSummary): string {
  return planCounts(c, s).map(countPhrase).join(", ");
}

/** The link that restores this selection, landing on the builder. */
export function shareUrl(origin: string, path: string, ids: string[], hash = ""): string {
  return `${origin}${path}${modulesSearch(ids)}${hash ? `#${hash}` : ""}`;
}

const itemLine = (i: OutlineItem) => `${i.label}: ${i.title}`;

/** Copy plan: the selection as plain text, every module, lecture, tutorial,
 * lab and race with its course-site link. */
export function planText(c: CoursesFile, s: PlanSummary, link: string): string {
  const rows = lectureSelection(c);
  const lines: string[] = [LABELS.textTitle, planStatus(s), `${planCountsLine(c, s)}.`, `${LABELS.textLink}: ${link}`];
  for (const m of s.modules) {
    lines.push("", fill(LABELS.textModule, { id: m.id, title: m.title }), m.href);
    for (const i of m.items) {
      lines.push(`  ${itemLine(i)}${i.video ? ` (${LABELS.textRecorded})` : ""}`, `    ${i.href}`);
    }
    for (const l of rows.find((r) => r.module.id === m.id)?.labs ?? []) {
      lines.push(`  ${l.label}: ${l.title}`, `    ${l.href}`);
    }
    for (const r of s.races.filter((r) => r.module === m.id)) {
      lines.push(`  ${r.title}: ${r.body}`, `    ${r.href}`);
    }
  }
  if (s.project) {
    const p = c.outline.final_project;
    lines.push("", `${p.title}: ${p.body}`, p.href);
  }
  lines.push(
    "",
    `${LABELS.textMaterial}: ${c.meta.coursekit_url}`,
    `${LABELS.textLicense}: ${c.meta.license.name}. ${c.meta.license.summary}`,
  );
  return lines.join("\n");
}

/** The email body: short enough for every mail client's mailto limit once
 * URL-encoded (checked against MAIL_BODY_MAX for every possible selection). */
export function mailBody(c: CoursesFile, s: PlanSummary, link: string): string {
  const lines = [
    LABELS.mailGreeting,
    "",
    LABELS.mailIntro,
    "",
    ...LABELS.mailFields,
    "",
    `${LABELS.textTitle}: ${planStatus(s)}`,
    `${LABELS.detailModules}: ${s.modules.map((m) => `${m.id} ${m.title}`).join("; ")}`,
    `${planCountsLine(c, s)}.`,
    `${LABELS.detailLabs}: ${numberRange(s.labs.map((l) => l.number)) || LABELS.none}`,
    `${LABELS.detailRaces}: ${numberRange(s.races.map((r) => r.number)) || LABELS.none}`,
    `${LABELS.textLink}: ${link}`,
  ];
  return lines.join("\r\n");
}

/** The ceiling for the URL-encoded body (about 1,800 characters keeps the whole
 * mailto under the 2,000 some clients accept). */
export const MAIL_BODY_MAX = 1800;

export function mailtoUrl(c: CoursesFile, s: PlanSummary, link: string): string {
  const subject = encodeURIComponent(c.meta.teach_subject);
  const body = encodeURIComponent(mailBody(c, s, link));
  return `mailto:${c.meta.contact}?subject=${subject}&body=${body}`;
}
