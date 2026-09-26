// The news feed. public/data/news.json is written by the content harvest and
// carries, per item, an ISO date, a display date, the source link, the author,
// the affiliation and the credit. Items arrive sorted newest first and are
// rendered in the order the file gives them.

import { fetchJson } from "../../lib/data";

export type NewsImage = { src: string; width: number; height: number; alt: string };

/** A third-party post shown in place: the frame URL the publisher gives for
 * embedding, and, for our own organisation's posts only, our copy of its
 * first slide, which holds the space until the frame loads. A post by
 * anyone else has no poster: its media is never re-hosted. */
export type NewsLinkedInEmbed = {
  provider: "linkedin";
  src: string;
  title: string;
  poster?: NewsImage | null;
};

/** A YouTube video behind a click-to-load facade (Cedric approved YouTube
 * embeds, 2026-09-26). `title` is the video's own title, the iframe's name.
 * The poster is the item's own `image` when it has one, else `poster`, else
 * the video's thumbnail from i.ytimg.com (maxresdefault). Nothing from
 * YouTube but that thumbnail loads before a click; the player is the
 * privacy-enhanced youtube-nocookie.com one. */
export type NewsYouTubeEmbed = {
  provider: "youtube";
  id: string;
  title: string;
  /** A thumbnail other than maxresdefault (a video without one), or our own cut. */
  poster?: NewsImage | null;
};

export type NewsEmbed = NewsLinkedInEmbed | NewsYouTubeEmbed;

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
  /** Wayback capture of `link`, which the card links instead when the source
   * no longer answers (the race timeline's rule). */
  archive?: string | null;
  archive_note?: string | null;
  author?: string | null;
  author_url?: string | null;
  affiliation?: string | null;
  /** LinkedIn, AutoDRIVE, RoboRacer, ... */
  publisher: string;
  credit?: string | null;
  image: NewsImage | null;
  /** The post or the video itself: beside the text on the lead, behind a
   * button on a card (nothing loads from LinkedIn or YouTube before a click). */
  embed?: NewsEmbed | null;
  /** A recap video for an item whose `embed` is already its LinkedIn post. */
  video?: NewsYouTubeEmbed | null;
  /** Lead story only: the two or three numbers the story turns on. */
  stats?: { value: string; label: string }[];
  /** A second link beside the source, e.g. the results page. */
  more?: { label: string; href: string } | null;
  featured?: boolean;
  /** Review bookkeeping only; nothing renders it (Cedric, 2026-09-25). */
  status?: "published" | "verify";
  /** Where every fact in the item comes from; never rendered. */
  sources?: string | null;
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

/** Series whose name is not an acronym, as the race pages write them. */
const SERIES: Record<string, string> = {
  esweek: "ESWeek",
  cpsweek: "CPS Week",
  cpsiot: "CPS-IoT Week",
  cps: "CPS-IoT Week",
  columbia: "Columbia",
  germany: "Germany",
  korea: "Korea",
  techfest: "Techfest",
  course: "Course race",
};

/** "icra2026" -> "ICRA 2026", "korea2023" -> "Korea 2023". An unknown id
 * degrades to its own text. */
export function eventLabel(id: string): string {
  const m = id.match(/^([a-z]+)[-_]?(\d{4})$/i);
  if (!m) return id;
  return `${SERIES[m[1].toLowerCase()] ?? m[1].toUpperCase()} ${m[2]}`;
}

/** Only site-hosted media renders as `image`: a remote image is never hotlinked
 * (a YouTube embed's thumbnail is the one exception, see NewsYouTubeEmbed), and
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
    // Bounded (lib/data READ_TIMEOUT_MS): a request that never answers ends
    // in the page's failure line, not an endless empty page.
    data = await fetchJson<unknown>(`${import.meta.env.BASE_URL}data/news.json`);
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

/** The poster a YouTube embed shows before a click. */
export function youTubePoster(embed: NewsYouTubeEmbed, image: NewsImage | null): NewsImage {
  if (image) return image;
  const own = embed.poster;
  if (own?.src) {
    if (own.src.startsWith("/") || /^[a-z]+:/i.test(own.src)) return own;
    return { ...own, src: `${import.meta.env.BASE_URL}${own.src}` };
  }
  return {
    src: `https://i.ytimg.com/vi/${embed.id}/maxresdefault.jpg`,
    width: 1280,
    height: 720,
    alt: "",
  };
}
