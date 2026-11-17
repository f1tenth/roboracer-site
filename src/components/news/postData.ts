// Posts hosted on the site itself (/news/<slug>). public/data/posts.json is
// the index: one entry per post with its title, author, cover and the media
// its text shows. The text is a Markdown file beside it (public/data/posts/),
// kept as its author wrote it, so an update from the author is a file copy.

import { marked, type Token, type Tokens } from "marked";
import { fetchJson } from "../../lib/data";

/** One picture, clip or video the text shows, keyed in `Post.media` by the
 * path the Markdown names. Width and height are the file's own, so the page
 * holds its box before it loads. */
export type PostMedia = {
  /** image: a still. clip: a silent loop cut from a GIF, with our poster
   * frame. youtube: a video behind a click-to-play poster. */
  kind: "image" | "clip" | "youtube";
  width: number;
  height: number;
  /** clip: our poster frame. youtube: the thumbnail shown before a click. */
  poster?: string;
  /** youtube only. */
  video_id?: string;
  url?: string;
  /** Portrait or small media: capped narrow, and two in a row share a line. */
  size?: "narrow";
  /** false for a picture that carries its own ground (a diagram on white). */
  frame?: boolean;
  /** A screenshot whose detail is lost at column width: the picture links to
   * its full-size file. */
  zoom?: boolean;
};

export type PostFact = { label: string; value: string; href?: string | null };

export type Post = {
  slug: string;
  /** "Guest post": the breadcrumb and the card's kind. */
  label: string;
  title: string;
  /** The words of the title that carry the logo gradient (once per page). */
  title_accent?: string | null;
  /** ISO YYYY-MM-DD and the same date as cards write it. */
  date: string;
  date_display: string;
  author: { name: string; url?: string | null; role?: string | null; affiliation?: string | null };
  cover?: { src: string; width: number; height: number; alt: string; caption?: string | null } | null;
  /** The Markdown file, relative to public/data/. */
  body: string;
  /** The margin card: where the code is, the license. */
  facts?: PostFact[];
  /** The one solid button, at the end of the text. */
  cta?: { label: string; href: string } | null;
  credit?: string | null;
  media?: Record<string, PostMedia>;
  /** Where the text and every added fact come from; never rendered. */
  sources?: string | null;
};

type PostsFile = { updated?: string; posts: Post[] };

/** How long the text file may take (the JSON loader has its own bound). */
const BODY_TIMEOUT_MS = 12000;

/**
 * A post and its text. `null` means no post has that slug; a file that does
 * not answer throws, so the page can tell "not here" from "did not load".
 */
export async function loadPost(slug: string): Promise<{ post: Post; markdown: string } | null> {
  const base = import.meta.env.BASE_URL;
  const file = await fetchJson<PostsFile>(`${base}data/posts.json`);
  const post = Array.isArray(file?.posts) ? file.posts.find((p) => p.slug === slug) : undefined;
  if (!post) return null;
  const ctrl = new AbortController();
  const timer = window.setTimeout(() => ctrl.abort(), BODY_TIMEOUT_MS);
  try {
    const res = await fetch(`${base}data/${post.body}`, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`${post.body}: HTTP ${res.status}`);
    const markdown = await res.text();
    // A static host answers a missing file with the app's own index.html.
    if (/^\s*<!doctype html/i.test(markdown)) throw new Error(`${post.body}: not a text file`);
    return { post, markdown };
  } finally {
    window.clearTimeout(timer);
  }
}

/** A figure in the text: the media the Markdown names, its alt text and the
 * caption line under it. */
export type PostFigure = {
  src: string;
  alt: string;
  caption: Token[] | null;
  media: PostMedia | undefined;
};

export type PostBlock =
  | { type: "heading"; depth: 2 | 3 | 4; id: string; tokens: Token[] }
  /** One figure, or two narrow ones sharing a line. */
  | { type: "figures"; items: PostFigure[] }
  | { type: "token"; token: Token };

export type ParsedPost = {
  blocks: PostBlock[];
  /** The h2 headings, for "On this page". */
  toc: { id: string; label: string }[];
  minutes: number;
};

const WORDS_PER_MINUTE = 220;

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

/** A heading's words as a reader sees them: the text of its inline tokens,
 * without the Markdown that marks them up (`heading.text` is the source
 * line, so an escaped character or a bold word would show its syntax in
 * "On this page"). */
const inlineText = (tokens: Token[] | undefined): string =>
  (tokens ?? [])
    .map((t) => {
      const kids = (t as { tokens?: Token[] }).tokens;
      if (kids && kids.length > 0) return inlineText(kids);
      return t.type === "br" ? " " : ((t as { text?: string }).text ?? "");
    })
    .join("");

const soleChild = (token: Token | undefined, type: string): Token | null => {
  if (!token || token.type !== "paragraph") return null;
  const kids = (token as Tokens.Paragraph).tokens;
  return kids.length === 1 && kids[0].type === type ? kids[0] : null;
};

/**
 * The text as the page lays it out. Three things Markdown has no word for:
 * a paragraph that is only an image is a figure, and an italic line right
 * under it is that figure's caption (the way the author's README reads on
 * GitHub); two narrow figures in a row share a line; every heading gets an
 * id so "On this page" can point at it.
 */
export function parsePost(markdown: string, media: Record<string, PostMedia> = {}): ParsedPost {
  const tokens = marked.lexer(markdown).filter((t) => t.type !== "space");
  const blocks: PostBlock[] = [];
  const toc: ParsedPost["toc"] = [];
  const used = new Set<string>();

  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    if (token.type === "heading") {
      const heading = token as Tokens.Heading;
      const label = inlineText(heading.tokens).trim() || heading.text;
      const base = slugify(label) || "section";
      let id = base;
      for (let n = 2; used.has(id); n += 1) id = `${base}-${n}`;
      used.add(id);
      // The page's h1 is the title, so a stray "# " in the text is an h2.
      const depth = Math.min(Math.max(heading.depth, 2), 4) as 2 | 3 | 4;
      if (depth === 2) toc.push({ id, label });
      blocks.push({ type: "heading", depth, id, tokens: heading.tokens });
      continue;
    }
    const image = soleChild(token, "image") as Tokens.Image | null;
    if (image) {
      const caption = soleChild(tokens[i + 1], "em") as Tokens.Em | null;
      if (caption) i += 1;
      const figure: PostFigure = {
        src: image.href,
        alt: image.text,
        caption: caption ? caption.tokens : null,
        media: media[image.href],
      };
      const last = blocks[blocks.length - 1];
      const narrow = figure.media?.size === "narrow";
      if (narrow && last?.type === "figures" && last.items.length === 1 && last.items[0].media?.size === "narrow") {
        last.items.push(figure);
      } else {
        blocks.push({ type: "figures", items: [figure] });
      }
      continue;
    }
    blocks.push({ type: "token", token });
  }

  const words = markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\]\([^)]*\)/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return { blocks, toc, minutes: Math.max(1, Math.round(words / WORDS_PER_MINUTE)) };
}
