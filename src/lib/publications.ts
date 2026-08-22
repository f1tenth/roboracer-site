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

/** Scholar deep link for a topic: (f1tenth | roboracer) plus the tag's extra terms. */
export function scholarTagUrl(tag: PublicationTag): string {
  const q = tag.scholar_query ? `(f1tenth | roboracer) (${tag.scholar_query})` : "f1tenth | roboracer";
  return SCHOLAR_BASE + encodeURIComponent(q);
}

/** Scholar link for a free-text search scoped to the platform. */
export function scholarSearchUrl(query: string): string {
  return SCHOLAR_BASE + encodeURIComponent(`(f1tenth | roboracer) ${query}`);
}

/** Lowercase with accents stripped, for search matching. */
export function fold(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}
