/** Classes and helpers the three course pages share (/learn/courses,
 * /learn/courses/:id, /learn/teach). Kept out of the component files so fast
 * refresh keeps working (react-refresh/only-export-components). */

/** The site-wide text link: ink text, hairline underline, violet on hover. */
export const LINK =
  "text-text-strong underline decoration-ink-950/25 underline-offset-4 hover:decoration-rr-violet hover:decoration-2";

/** A 2.75rem hit area on touch screens that leaves the line box alone. */
export const TAP = "coarse:inline-block coarse:-my-3 coarse:py-3";

/** A jump lands under the fixed bar, not behind it. */
export const UNDER_NAV = "scroll-mt-[calc(var(--spacing-nav)+1rem)]";

/** The fold summary /research and /race use: no marker, the chevron turns. */
export const FOLD_SUMMARY =
  "flex cursor-pointer list-none items-baseline gap-x-4 gap-y-1 py-5 text-text-strong transition-colors hover:text-rr-violet [&::-webkit-details-marker]:hidden";

/** A sub-block heading inside a section (course page columns, teach steps). */
export const BLOCK_TITLE = "font-display text-display-s font-semibold text-text-strong";

/** Mono small annotation. */
export const MONO_NOTE = "font-mono text-small text-text-muted";

export const isExternal = (href: string) => /^(https?:)?\/\//.test(href) || href.startsWith("mailto:");

/** A string still waiting on Cedric is never rendered (COURSES_CONTENT.md). */
export const isTodo = (s: string | null | undefined) => !s || s.startsWith("TODO(content)");

/** "A and B", "A to D": a plan's modules read as a range once there are more
 * than two in a row, as the course site's Start Here page names them. */
export function moduleRange(ids: string[]): string {
  if (ids.length === 0) return "";
  if (ids.length === 1) return ids[0];
  if (ids.length === 2) return `${ids[0]} and ${ids[1]}`;
  return `${ids[0]} to ${ids[ids.length - 1]}`;
}

/** "1 to 4" for a run of lab numbers, "1, 3" otherwise. */
export function numberRange(ns: number[]): string {
  if (ns.length === 0) return "";
  if (ns.length === 1) return String(ns[0]);
  const run = ns.every((n, i) => i === 0 || n === ns[i - 1] + 1);
  if (run && ns.length > 2) return `${ns[0]} to ${ns[ns.length - 1]}`;
  return ns.length === 2 ? `${ns[0]} and ${ns[1]}` : `${ns.slice(0, -1).join(", ")} and ${ns[ns.length - 1]}`;
}

/** "Modules E, F and G". */
export function listWords(words: string[]): string {
  if (words.length <= 1) return words.join("");
  return `${words.slice(0, -1).join(", ")} and ${words[words.length - 1]}`;
}

export const pad2 = (n: number) => String(n).padStart(2, "0");

/** What a feature may claim today (docs/learn/COURSES_CONTENT.md): `available`
 * always, `platform` once the course platform is public, `verify` never. */
export function visibleFeatures<T extends { status: "available" | "platform" | "verify" }>(
  features: T[],
  lmsUrl: string | null,
): T[] {
  return features.filter((f) => f.status === "available" || (f.status === "platform" && !!lmsUrl));
}
