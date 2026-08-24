// The news feed. public/data/news.json is written by the content harvest and
// carries, per item, an ISO date, a display date, the source link, the author,
// the affiliation and the credit. Items arrive sorted newest first and are
// rendered in the order the file gives them.

export type NewsImage = { src: string; width: number; height: number; alt: string };

export type NewsKind = "post" | "article" | "video" | "podcast" | "announcement";

/** One item in the feed. `image: null` means a text card. */
export type NewsItem = {
  id: string;
  /** ISO YYYY-MM-DD; the sort key and the <time datetime> value. */
  date: string;
  /** Human date as written on the source, e.g. "Jun 25, 2026" or "July 2023". */
  date_display: string;
  date_precision: "day" | "month";
  title: string;
  excerpt?: string | null;
  kind: NewsKind;
  /** Competition id: icra2026, iv2026, ifac2026, iros2026, ... */
  event?: string | null;
  /** Where the card sends the reader. Always external. */
  link: string;
  author?: string | null;
  author_url?: string | null;
  affiliation?: string | null;
  /** LinkedIn, AutoDRIVE, RoboRacer, ... */
  publisher: string;
  credit?: string | null;
  image: NewsImage | null;
  featured?: boolean;
  status?: "published" | "verify";
};

export type NewsFeed = {
  updated?: string;
  items: NewsItem[];
};

const SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** ISO -> "Jun 25, 2026" (cards use the short month, per the content skill). */
export function formatIsoDate(iso: string, precision: "day" | "month" = "day"): string {
  const m = iso.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?/);
  if (!m) return iso;
  const month = SHORT[Number(m[2]) - 1] ?? m[2];
  if (precision === "month" || !m[3]) return `${month} ${m[1]}`;
  return `${month} ${Number(m[3])}, ${m[1]}`;
}

/** "icra2026" -> "ICRA 2026". An unknown id degrades to its own text. */
export function eventLabel(id: string): string {
  const m = id.match(/^([a-z]+)[-_]?(\d{4})$/i);
  return m ? `${m[1].toUpperCase()} ${m[2]}` : id;
}

/** Only site-hosted media renders: a remote thumbnail is never hotlinked, and
 * media from a post is never re-hosted without recorded permission. An item
 * whose image fails this test becomes a text card. */
function siteHosted(image: NewsImage | null | undefined): NewsImage | null {
  if (!image?.src) return null;
  if (image.src.startsWith("/")) return image;
  if (/^[a-z]+:/i.test(image.src)) return null;
  return { ...image, src: `${import.meta.env.BASE_URL}${image.src}` };
}

/** The feed as the file gives it: newest first, one item per source. */
export async function loadNewsFeed(): Promise<NewsFeed | null> {
  let data: unknown;
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}data/news.json`);
    if (!res.ok) return null;
    data = await res.json();
  } catch {
    return null;
  }

  const feed = data as NewsFeed | null;
  if (!feed || !Array.isArray(feed.items)) return null;
  return {
    updated: feed.updated,
    items: feed.items
      .filter((item) => item && item.id && item.date && item.link && item.title)
      .map((item) => ({ ...item, image: siteHosted(item.image) })),
  };
}
