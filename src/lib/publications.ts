// Pure helpers shared by PublicationCard and the research page (no React,
// no fetching; the loader and types live in data.ts).
import type { Publication, PublicationTag } from "./data";

export const SCHOLAR_BASE = "https://scholar.google.com/scholar?hl=en&as_sdt=0%2C39&q=";

/** "A, B, C et al." after three names. */
export function authorLine(authors: string[]): string {
  if (authors.length <= 3) return authors.join(", ");
  return `${authors.slice(0, 3).join(", ")} et al.`;
}

/** "Jane Q. Public" -> "Public"; "Public, Jane" -> "Public". */
export function surname(author: string): string {
  const a = author.trim();
  if (a.includes(",")) return a.split(",")[0].trim();
  const parts = a.split(/\s+/);
  return parts[parts.length - 1] ?? a;
}

/** Credit line under a thumbnail: "Figure: Baumann et al." */
export function figureCredit(authors: string[]): string {
  const first = surname(authors[0] ?? "");
  return authors.length > 1 ? `Figure: ${first} et al.` : `Figure: ${first}`;
}

/** Landing page for a paper: url, else the DOI resolver, else arXiv. */
export function paperHref(p: Publication): string | undefined {
  if (p.url) return p.url;
  if (p.doi) return `https://doi.org/${p.doi}`;
  if (p.arxiv) return `https://arxiv.org/abs/${p.arxiv}`;
  return undefined;
}

/** The secondary links a paper carries beyond `paperHref`, deduplicated
 * against it: arXiv, DOI, PDF, in that order. */
export function paperExtras(p: Publication): { label: string; href: string }[] {
  const main = paperHref(p);
  const all = [
    p.arxiv ? { label: "arXiv", href: `https://arxiv.org/abs/${p.arxiv}` } : undefined,
    p.doi ? { label: "DOI", href: `https://doi.org/${p.doi}` } : undefined,
    p.pdf ? { label: "PDF", href: p.pdf } : undefined,
  ];
  return all.filter((x): x is { label: string; href: string } => !!x && x.href !== main);
}

const TYPE_LABEL: Record<string, string> = {
  conference: "Conference paper",
  journal: "Journal article",
  preprint: "Preprint",
  thesis: "Thesis",
  report: "Report",
  other: "Paper",
};

/** "conference" -> "Conference paper". Unknown types render capitalised. */
export function typeLabel(p: Publication): string {
  const t = (p.type ?? "").trim().toLowerCase();
  return TYPE_LABEL[t] ?? (t ? t[0].toUpperCase() + t.slice(1) : "Paper");
}

/** Content of the generated tile that stands in for a missing figure: the
 * venue, at display size (an acronym on one line, a full name wrapped) until
 * it is long enough to outgrow the plate, where `long` drops it to lead
 * size. Falls back to the publication type so a tile is never empty. */
export function venueTile(p: Publication): { token: string; long: boolean } {
  const raw = (p.venue_short?.trim() || p.venue?.trim() || "").replace(/[\s.,;:]*(?:\.\.\.|…)$/, "");
  const token = raw || typeLabel(p);
  return { token, long: token.length > 26 };
}

/** Scholar deep link for a topic: (f1tenth | roboracer) plus the tag's extra terms. */
export function scholarTagUrl(tag: PublicationTag): string {
  const q = tag.scholar_query ? `(f1tenth | roboracer) (${tag.scholar_query})` : "f1tenth | roboracer";
  return SCHOLAR_BASE + encodeURIComponent(q);
}

/** Scholar link for a free-text search scoped to the platform. */
export function scholarSearchUrl(query: string): string {
  return SCHOLAR_BASE + encodeURIComponent(`(f1tenth | roboracer) ${query}`);
}

/** Published papers that carry a `featured_order`, ascending: the landing
 * research carousel (landing v5 section 5). Eight expected; renders N. */
export function featuredForLanding(items: Publication[]): Publication[] {
  return items
    .filter((p) => p.status === "published" && typeof p.featured_order === "number" && p.featured_order > 0)
    .sort((a, b) => (a.featured_order ?? 0) - (b.featured_order ?? 0));
}

/** The paper's own abstract, verbatim from publications.json (`abstract`),
 * or undefined. Read through here until `abstract?: string` lands on the
 * Publication type in data.ts (landing v5). */
export function abstractOf(p: Publication): string | undefined {
  const a = (p as { abstract?: unknown }).abstract;
  return typeof a === "string" && a.trim() ? a : undefined;
}

/** "RLPP: A Residual Method for ..." -> "RLPP"; otherwise the first words.
 * For alt text ("Figure from <short title>") and labels that must stay short. */
export function shortTitle(title: string, maxWords = 8): string {
  const head = title.split(/:\s+/)[0]?.trim() ?? "";
  if (head && head.length < title.length && head.split(/\s+/).length <= maxWords) return head;
  const words = title.trim().split(/\s+/);
  return words.length <= maxWords ? title.trim() : `${words.slice(0, maxWords).join(" ")}…`;
}

const VENUE_STOP = new Set(["of", "on", "and", "the", "in", "for", "to", "at", "a", "an", "&"]);

/** Venue initials for a figure-less placeholder: venue_short as is ("ICRA",
 * "RA-L"), else the capitals of the venue's main words, at most four. */
export function venueInitials(p: Publication): string {
  const short = p.venue_short?.trim();
  if (short) return short.slice(0, 8);
  const words = p.venue
    .replace(/[()]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !VENUE_STOP.has(w.toLowerCase()));
  const initials = words.map((w) => w[0]?.toUpperCase() ?? "").join("");
  return initials.slice(0, 4) || "—";
}

/** Lowercase with accents stripped, for search matching. */
export function fold(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}
