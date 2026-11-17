// The post writer's text (Tiptap JSON, schema in schema.ts) as the site's own
// post format: the Markdown dialect parsePost reads (postData.ts) and the
// `media` map its posts.json entry carries.
//
// A stranger writes the text and it arrives in a pull request, so everything
// a writer types is escaped until Markdown can only read it back as the same
// literal text: no raw HTML, no image, no link the writer did not make with
// the link button, no heading or list made of punctuation. Escaping alone is
// not enough for bold and italic (Markdown refuses `**a.**b`), so every
// paragraph is read back with marked, the parser the post page uses, and is
// written more plainly until it reads back as written.
//
// scripts/check-post-writer.mjs holds the cases this has to survive.

import type { JSONContent } from "@tiptap/core";
import { Lexer, type Token, type Tokens } from "marked";
import { WRAP_SPAN, type PostMedia } from "../postData";
import type { FigureAttrs, PublishedImages, VideoAttrs } from "./types";

export type SerializedPost = {
  /** The post body, ending with one newline. */
  markdown: string;
  /** posts.json `media`, keyed by the href the Markdown names. */
  media: Record<string, PostMedia>;
  /** The first paragraph as plain text, cut at a word to 200 characters. */
  excerpt: string;
  /** Words in plainText: captions and code blocks are not counted. */
  words: number;
  /** What the writer has to fix, in their words. Empty when nothing is wrong. */
  problems: string[];
};

/** Keeps two blocks apart where Markdown would join them. PostBody drops
 * HTML, and GitHub shows nothing for an empty comment. */
const SEPARATOR = "<!-- -->";
const EXCERPT_MAX = 200;
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
/** package.ts names the published pictures news-<slug>-<n>.<ext>; anything
 * else in a path could end the Markdown image early. */
const MEDIA_PATH = /^\/media\/news\/[A-Za-z0-9][A-Za-z0-9._-]*$/;
const LANGUAGE = /^[A-Za-z0-9+#-]{1,32}$/;
const PUNCTUATION = /[\p{P}\p{S}]/u;

type Marks = { bold?: true; italic?: true; strike?: true; code?: true; href?: string };
/** One character (code point) and the marks on it. Lines of these are the
 * model every paragraph is written from and compared against. */
type Char = { ch: string; marks: Marks };
type Line = Char[];
type Run = { text: string; marks: Marks };

type Ctx = {
  problems: string[];
  media: Record<string, PostMedia>;
  images: PublishedImages;
  figures: number;
  videos: number;
};

/** A written block and what its neighbours need to know about it. */
type Written = {
  md: string;
  kind: "paragraph" | "list" | "figure" | "rule" | "other";
  /** paragraph: marked reads it as one italic span, which parsePost would
   * take for the caption of a figure right above it. */
  soleEm?: boolean;
  /** figure: it has its caption line. */
  captioned?: boolean;
  list?: "bullet" | "ordered";
  /** list: it can start on the line right under a paragraph (an ordered
   * list can only when it starts at 1). */
  interrupts?: boolean;
};

const isControl = (ch: string) => {
  const code = ch.codePointAt(0) ?? 0;
  return (code < 0x20 && ch !== "\t" && ch !== "\n") || code === 0x7f;
};
const stripControls = (text: string) => Array.from(text).filter((ch) => !isControl(ch)).join("");

/** A form field (alt text, caption, title) as one line of plain text. */
const plainField = (value: unknown) => stripControls(typeof value === "string" ? value : "").replace(/\s+/g, " ").trim();

const snippet = (text: string) => (text.length > 40 ? `${text.slice(0, 40).trimEnd()}...` : text);

/* ---------------------------------------------------------------- links */

/**
 * A link survives only to the web or to an email address, the same rule as
 * the editor's (schema.ts LINK_OK) plus a host after the slashes. Anything
 * that could end the Markdown destination early or start a title is
 * percent-encoded, which leaves the address the same.
 */
function safeHref(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const href = value.trim();
  if (!/^(?:https?:\/\/[^\s/?#\\]|mailto:\S)/i.test(href)) return null;
  let out = "";
  for (const ch of href) {
    const code = ch.codePointAt(0) ?? 0;
    if (ch === "(") out += "%28";
    else if (ch === ")") out += "%29";
    else if (code < 0x21 || code === 0x7f || /[\s<>\\`]/u.test(ch)) out += encodeURIComponent(ch);
    else out += ch;
  }
  return out;
}

/* ---------------------------------------------------------- the model */

function marksOf(marks: JSONContent["marks"]): Marks {
  const out: Marks = {};
  for (const mark of marks ?? []) {
    switch (mark?.type) {
      case "bold":
        out.bold = true;
        break;
      case "italic":
        out.italic = true;
        break;
      case "strike":
        out.strike = true;
        break;
      case "code":
        out.code = true;
        break;
      case "link": {
        // A link the site would not follow keeps its words and loses the link.
        const href = safeHref(mark.attrs?.href);
        if (href) out.href = href;
        break;
      }
      default:
        // Underline, highlight and the like: the format has no word for them.
        break;
    }
  }
  return out;
}

const isInline = (node: JSONContent | undefined) =>
  !!node && (node.type === "text" || node.type === "hardBreak" || typeof node.text === "string");

/**
 * Inline content as lines of marked characters. A hard break, or a newline
 * pasted into a text node, starts a new line; a heading is one line, so
 * there it is a space. A tab is a space: the page shows it as one, and
 * marked turns it into four inside a list item. Unknown inline nodes keep
 * their text.
 */
function collectLines(nodes: JSONContent[] | undefined, oneLine: boolean, extra: Marks = {}): Line[] {
  const lines: Line[] = [[]];
  const push = (ch: string, marks: Marks) => lines[lines.length - 1].push({ ch, marks });
  const walk = (list: JSONContent[] | undefined, inherited: Marks) => {
    for (const node of list ?? []) {
      if (!node || typeof node !== "object") continue;
      const marks = { ...inherited, ...marksOf(node.marks) };
      if (node.type === "hardBreak") {
        if (oneLine) push(" ", marks);
        else lines.push([]);
      } else if (typeof node.text === "string") {
        node.text.split(/\r\n|\r|\n/).forEach((part, i) => {
          if (i > 0) {
            // Code cannot hold a line break, and neither can a heading.
            if (oneLine || marks.code) push(" ", marks);
            else lines.push([]);
          }
          for (const ch of part) if (!isControl(ch)) push(ch === "\t" ? " " : ch, marks);
        });
      } else {
        walk(node.content, marks);
      }
    }
  };
  walk(nodes, extra);
  return lines;
}

const isSpace = (c: Char) => !c.marks.code && /\s/u.test(c.ch);
const isBlank = (c: Char) => !c.marks.code && (c.ch === " " || c.ch === "\t");

/**
 * Spaces and tabs at the edges of a line are layout, not text: Markdown
 * reads four of them at the start as code, and HTML shows none of them.
 * Empty lines at the start and end of a block go too.
 */
function trimLines(lines: Line[]): Line[] {
  const out = lines.map((line) => {
    let start = 0;
    let end = line.length;
    while (start < end && isBlank(line[start])) start += 1;
    while (end > start && isBlank(line[end - 1])) end -= 1;
    return line.slice(start, end);
  });
  while (out.length && !out[0].length) out.shift();
  while (out.length && !out[out.length - 1].length) out.pop();
  return out;
}

function common(a: Marks, b: Marks, c: Marks): Marks {
  const out: Marks = {};
  if (a.bold && b.bold && c.bold) out.bold = true;
  if (a.italic && b.italic && c.italic) out.italic = true;
  if (a.strike && b.strike && c.strike) out.strike = true;
  if (a.href !== undefined && a.href === b.href && a.href === c.href) out.href = a.href;
  return out;
}

/** Whitespace keeps a mark only where the text on both sides has it: `** a**`
 * is not bold in Markdown, so the space has to stand outside the stars. */
function settleSpaces(line: Line): Line {
  for (let i = 0; i < line.length; ) {
    if (!isSpace(line[i])) {
      i += 1;
      continue;
    }
    let j = i;
    while (j < line.length && isSpace(line[j])) j += 1;
    const before = line[i - 1]?.marks ?? {};
    const after = line[j]?.marks ?? {};
    for (let k = i; k < j; k += 1) line[k] = { ch: line[k].ch, marks: common(line[k].marks, before, after) };
    i = j;
  }
  return line;
}

const EMPHASIS = ["bold", "italic", "strike"] as const;

/** Takes emphasis off punctuation, code and links at the edges of a bold,
 * italic or struck span: the delimiter next to them is what Markdown
 * refuses to read (`**a.**b`). A fallback, so only when the plain way fails. */
function expel(line: Line): void {
  const loose = (c: Char) => isSpace(c) || !!c.marks.code || c.marks.href !== undefined || PUNCTUATION.test(c.ch);
  for (const key of EMPHASIS) {
    for (let a = 0; a < line.length; ) {
      if (!line[a].marks[key]) {
        a += 1;
        continue;
      }
      let b = a;
      while (b < line.length && line[b].marks[key]) b += 1;
      let i = a;
      for (; i < b && loose(line[i]); i += 1) delete line[i].marks[key];
      for (let j = b - 1; j >= i && loose(line[j]); j -= 1) delete line[j].marks[key];
      a = b;
    }
  }
}

const sameMarks = (a: Marks, b: Marks) =>
  !!a.bold === !!b.bold && !!a.italic === !!b.italic && !!a.strike === !!b.strike && !!a.code === !!b.code && a.href === b.href;

function runsOf(line: Line): Run[] {
  const runs: Run[] = [];
  for (const c of line) {
    const last = runs[runs.length - 1];
    if (last && sameMarks(last.marks, c.marks)) last.text += c.ch;
    else runs.push({ text: c.ch, marks: c.marks });
  }
  return runs;
}

/* ------------------------------------------------------------- writing */

/**
 * Text as Markdown that reads back as the same characters. Every character
 * that can open a construct anywhere in a line is escaped; the ones that only
 * matter at the start of a line (a heading, a list, a table's rule, a setext
 * underline) are escaped there. URLs and email addresses are kept from
 * becoming links on their own: marked would show any backslash inside them.
 * Inside a link's text marked unescapes \[ and \] once before it reads the
 * text, so there "(" is escaped too, or `[x](javascript:...)` typed as text
 * would come back as a link.
 */
function escapeText(text: string, lineStart: boolean, inLink: boolean): string {
  let out = text
    .replace(inLink ? /[\\`*_[\]<>~|(]/g : /[\\`*_[\]<>~|]/g, "\\$&")
    .replace(/&(?=#?[A-Za-z0-9]+;)/g, "\\&")
    .replace(/@/g, "\\@")
    .replace(/(https?|ftp):(?=\/\/)/gi, "$1\\:")
    .replace(/(www)\./gi, "$1\\.");
  if (lineStart) out = out.replace(/^[#+=:-]/, "\\$&").replace(/^(\d+)([.)])/, "$1\\$2");
  return out;
}

/** The longest run of backticks in `text` (a reduce, not a spread: pasted
 * code can hold more runs than a function takes arguments). */
const longestTicks = (text: string) => (text.match(/`+/g) ?? []).reduce((max, run) => Math.max(max, run.length), 0);

/** Inline code: a fence longer than any run of backticks inside, padded where
 * Markdown would otherwise eat a space or a backtick at the edge. */
function codeSpan(text: string): string {
  const fence = "`".repeat(longestTicks(text) + 1);
  const pad = text.startsWith("`") || text.endsWith("`") || (text.startsWith(" ") && text.endsWith(" ") && /[^ ]/.test(text)) ? " " : "";
  return `${fence}${pad}${text}${pad}${fence}`;
}

type Italic = "*" | "_";
const opener = (key: string, italic: Italic) => (key[0] === "l" ? "[" : key === "b" ? "**" : key === "i" ? italic : "~~");
const closer = (key: string, italic: Italic) => (key[0] === "l" ? `](${key.slice(1)})` : opener(key, italic));
/** The marks as keys, outermost first when they open together: a link
 * outside bold reads back, bold outside a link next to a letter does not. */
const keysOf = (m: Marks) =>
  [m.href !== undefined ? `l${m.href}` : "", m.bold ? "b" : "", m.italic ? "i" : "", m.strike ? "s" : ""].filter(Boolean);
/** "!" right before a link's "[" would make it an image. */
const endsWithBang = (s: string) => /(?:^|[^\\])(?:\\\\)*!$/.test(s);

/**
 * One line of the model as Markdown. Marks stay open while the next run
 * still has them; marks that open together are nested so the one that runs
 * longest is outside. Whitespace at a run's edge is written outside the
 * delimiters that open or close there.
 */
function emitLine(line: Line, italic: Italic, lineStart: boolean): string {
  const runs = runsOf(line);
  const extent = (from: number, key: string) => {
    let n = 0;
    while (from + n < runs.length && keysOf(runs[from + n].marks).includes(key)) n += 1;
    return n;
  };
  const stack: string[] = [];
  let out = "";
  let pending = "";
  runs.forEach((run, i) => {
    const want = keysOf(run.marks);
    let keep = 0;
    while (keep < stack.length && want.includes(stack[keep])) keep += 1;
    while (stack.length > keep) out += closer(stack.pop() as string, italic);
    const code = !!run.marks.code;
    const lead = code ? "" : (/^\s*/u.exec(run.text)?.[0] ?? "");
    const rest = run.text.slice(lead.length);
    const trail = code ? "" : (/\s*$/u.exec(rest)?.[0] ?? "");
    const core = rest.slice(0, rest.length - trail.length);
    out += pending + lead;
    pending = trail;
    if (!core) return;
    const opening = want
      .filter((key) => !stack.includes(key))
      .sort((a, b) => extent(i, b) - extent(i, a) || want.indexOf(a) - want.indexOf(b));
    for (const key of opening) {
      if (key[0] === "l" && endsWithBang(out)) out = `${out.slice(0, -1)}\\!`;
      out += opener(key, italic);
      stack.push(key);
    }
    out += code ? codeSpan(core) : escapeText(core, lineStart && out === "", stack.some((key) => key[0] === "l"));
  });
  while (stack.length) out += closer(stack.pop() as string, italic);
  return out + pending;
}

/** marked drops a run of # that ends a heading after a space (the closing
 * sequence), so the last one is escaped. */
const headingText = (md: string) => (/(?:^|[ \t])#+$/.test(md) ? `${md.slice(0, -1)}\\#` : md);

/* ------------------------------------------------------------ reading back */

const lexBlocks = (md: string) => Lexer.lex(md).filter((token) => token.type !== "space");

/** The inline tokens of `md` when marked reads it as exactly one block of
 * the given type, else null. */
function readBack(md: string, type: "paragraph" | "heading"): Token[] | null {
  const blocks = lexBlocks(md);
  if (blocks.length !== 1 || blocks[0].type !== type) return null;
  return (blocks[0] as Tokens.Paragraph | Tokens.Heading).tokens;
}

/** marked's inline tokens back as lines of marked characters; null for
 * anything the writer cannot have made (HTML, an image, a bare URL turned
 * into a link). */
function flatten(tokens: Token[] | undefined, marks: Marks = {}, lines: Line[] = [[]]): Line[] | null {
  const push = (text: string, m: Marks) => {
    for (const ch of text) {
      if (ch === "\n") return false;
      lines[lines.length - 1].push({ ch, marks: m });
    }
    return true;
  };
  for (const token of tokens ?? []) {
    switch (token.type) {
      case "text":
      case "escape": {
        const nested = (token as Tokens.Text).tokens;
        if (nested?.length ? !flatten(nested, marks, lines) : !push((token as Tokens.Text).text, marks)) return null;
        break;
      }
      case "strong":
        if (!flatten((token as Tokens.Strong).tokens, { ...marks, bold: true }, lines)) return null;
        break;
      case "em":
        if (!flatten((token as Tokens.Em).tokens, { ...marks, italic: true }, lines)) return null;
        break;
      case "del":
        if (!flatten((token as Tokens.Del).tokens, { ...marks, strike: true }, lines)) return null;
        break;
      case "codespan":
        if (!push((token as Tokens.Codespan).text, { ...marks, code: true })) return null;
        break;
      case "br":
        lines.push([]);
        break;
      case "link": {
        const link = token as Tokens.Link;
        if (!link.raw.startsWith("[") || !flatten(link.tokens, { ...marks, href: link.href }, lines)) return null;
        break;
      }
      default:
        return null;
    }
  }
  return lines;
}

/** Whitespace outside code carries no marks worth comparing (see settleSpaces). */
const signature = (c: Char) =>
  isSpace(c)
    ? ""
    : `${c.marks.bold ? "b" : ""}${c.marks.italic ? "i" : ""}${c.marks.strike ? "s" : ""}${c.marks.code ? "c" : ""}${c.marks.href !== undefined ? `l${c.marks.href}` : ""}`;

const sameLines = (a: Line[] | null, b: Line[]) =>
  !!a &&
  a.length === b.length &&
  a.every((line, i) => line.length === b[i].length && line.every((c, j) => c.ch === b[i][j].ch && signature(c) === signature(b[i][j])));

type Attempt = { italic: Italic; expel?: boolean; drop?: "emphasis" | "all" };
/** From most faithful to plainest. The first two differ only in the italic
 * delimiter (`_` reads where `*` would touch a bold `**`); the next two give
 * up emphasis on edge punctuation; the last two give up formatting, and the
 * writer is told. */
const ATTEMPTS: Attempt[] = [
  { italic: "*" },
  { italic: "_" },
  { italic: "*", expel: true },
  { italic: "_", expel: true },
  { italic: "*", drop: "emphasis" },
  { italic: "*", drop: "all" },
];

function prepare(line: Line, attempt: Attempt): Line {
  const out = line.map((c) => {
    const marks: Marks = attempt.drop === "all" ? {} : { ...c.marks };
    if (attempt.drop === "emphasis") for (const key of EMPHASIS) delete marks[key];
    return { ch: c.ch, marks };
  });
  if (attempt.expel) expel(out);
  return settleSpaces(out);
}

/** A paragraph's or a heading's inline Markdown, kept only once marked reads
 * it back as the same text with the same marks. */
function writeInline(lines: Line[], kind: "paragraph" | "heading", ctx: Ctx): { md: string; tokens: Token[] } | null {
  const text = snippet(lines.map((line) => line.map((c) => c.ch).join("")).join(" "));
  const where = kind === "heading" ? `The heading "${text}"` : `The paragraph that starts "${text}"`;
  for (const attempt of ATTEMPTS) {
    const model = lines.map((line) => prepare(line, attempt));
    const md =
      kind === "heading"
        ? headingText(emitLine(model[0], attempt.italic, false))
        : model.map((line) => emitLine(line, attempt.italic, true)).join("\\\n");
    const tokens = readBack(kind === "heading" ? `## ${md}` : md, kind);
    if (!tokens || !sameLines(flatten(tokens), model)) continue;
    if (attempt.drop === "emphasis")
      ctx.problems.push(
        `${where} has bold, italic or crossed-out words the post format cannot hold there (backticks or < and > around them are the usual cause); they were kept as plain text.`,
      );
    if (attempt.drop === "all") ctx.problems.push(`${where} has formatting or links the post format cannot hold; it was kept as plain text.`);
    return { md, tokens };
  }
  ctx.problems.push(`${where} could not be written safely and was left out.`);
  return null;
}

/** A caption is one italic paragraph, which is what parsePost looks for. */
function writeCaption(text: string): string | null {
  const line: Line = Array.from(text, (ch) => ({ ch, marks: { italic: true as const } }));
  for (const italic of ["*", "_"] as const) {
    const md = emitLine(line, italic, true);
    const tokens = readBack(md, "paragraph");
    if (tokens?.length === 1 && tokens[0].type === "em" && sameLines(flatten(tokens), [line])) return md;
  }
  return null;
}

/**
 * Alt text and video titles become an image's label, which marked hands over
 * raw (only \[ and \] are unescaped), so they cannot be escaped like text:
 * brackets are escaped, a backtick becomes an apostrophe (a lone one ends
 * the label), and a backslash that would escape a bracket or the label's end
 * is dropped.
 */
function altText(value: unknown): string {
  let alt = plainField(value).replace(/`/g, "'");
  for (let prev = ""; prev !== alt; ) {
    prev = alt;
    alt = alt.replace(/\\+(?=[[\]]|$)/g, "").trim();
  }
  return alt;
}

/** A paragraph that is only the image, or null when marked would not read it
 * back as exactly that. */
function imageLine(alt: string, href: string): string | null {
  const md = `![${alt.replace(/[[\]]/g, "\\$&")}](${href})`;
  const tokens = readBack(md, "paragraph");
  const image = tokens?.length === 1 && tokens[0].type === "image" ? (tokens[0] as Tokens.Image) : null;
  return image && image.href === href && image.text === alt ? md : null;
}

/* -------------------------------------------------------------- blocks */

function writeParagraph(lines: Line[], ctx: Ctx): Written[] {
  const trimmed = trimLines(lines);
  if (!trimmed.length) return [];
  const written = writeInline(trimmed, "paragraph", ctx);
  if (!written) return [];
  const soleEm = written.tokens.length === 1 && written.tokens[0].type === "em";
  return [{ md: written.md, kind: "paragraph", soleEm }];
}

function finishFigure(ctx: Ctx, name: string, src: string, alt: string, media: PostMedia, caption: unknown): Written[] {
  const line = imageLine(alt, src) ?? imageLine(alt.replace(/[^\p{L}\p{N} .,'-]/gu, "").trim(), src);
  if (!line) {
    ctx.problems.push(`${name} could not be written safely and was left out. Shorten its description.`);
    return [];
  }
  const known = ctx.media[src];
  if (!known) ctx.media[src] = media;
  else if (JSON.stringify(known) !== JSON.stringify(media))
    ctx.problems.push(`${name} shows the same file as an earlier one with different settings; both will show like the first.`);
  const text = plainField(caption);
  const captionMd = text ? writeCaption(text) : null;
  if (text && !captionMd) ctx.problems.push(`The caption under ${name} could not be written safely and was left out.`);
  return [{ md: captionMd ? `${line}\n\n${captionMd}` : line, kind: "figure", captioned: !!captionMd }];
}

function writeFigure(node: JSONContent, ctx: Ctx): Written[] {
  ctx.figures += 1;
  const attrs = (node.attrs ?? {}) as Partial<FigureAttrs>;
  const alt = altText(attrs.alt);
  const name = `Picture ${ctx.figures}${alt ? ` ("${snippet(alt)}")` : ""}`;
  const id = typeof attrs.imageId === "string" ? attrs.imageId : "";
  // Own keys only: an id like "constructor" must not find Object's.
  const image = Object.prototype.hasOwnProperty.call(ctx.images, id) ? ctx.images[id] : undefined;
  if (!image) {
    ctx.problems.push(`${name} has no picture file. Choose the file again or remove the picture.`);
    return [];
  }
  const width = Math.round(Number(image.width));
  const height = Math.round(Number(image.height));
  if (typeof image.path !== "string" || !MEDIA_PATH.test(image.path) || !(width > 0) || !(height > 0)) {
    ctx.problems.push(`${name} could not be prepared for the site. Remove it and add it again.`);
    return [];
  }
  // Beside the text or on its own line, never both: a wrapped figure carries
  // its side and its share of the column, an unwrapped one its size.
  const wrap = attrs.wrap === "left" || attrs.wrap === "right" ? attrs.wrap : null;
  const span = Math.round(Math.min(0.65, Math.max(0.25, Number(attrs.span) || WRAP_SPAN)) * 100) / 100;
  const media: PostMedia = {
    kind: "image",
    width,
    height,
    ...(wrap ? { wrap, span } : attrs.size === "narrow" ? { size: "narrow" as const } : {}),
    ...(attrs.zoom === true ? { zoom: true } : {}),
  };
  return finishFigure(ctx, name, image.path, alt, media, attrs.caption);
}

function writeVideo(node: JSONContent, ctx: Ctx): Written[] {
  ctx.videos += 1;
  const attrs = (node.attrs ?? {}) as Partial<VideoAttrs>;
  const title = altText(attrs.title);
  const name = `Video ${ctx.videos}${title ? ` ("${snippet(title)}")` : ""}`;
  const id = typeof attrs.videoId === "string" ? attrs.videoId.trim() : "";
  if (!YOUTUBE_ID.test(id)) {
    ctx.problems.push(`${name} is not a YouTube video the site can show. Paste its link again.`);
    return [];
  }
  // The same shape as the hosted posts' videos (public/data/posts.json).
  const media: PostMedia =
    attrs.portrait === true
      ? {
          kind: "youtube",
          video_id: id,
          url: `https://www.youtube.com/shorts/${id}`,
          width: 1080,
          height: 1920,
          poster: `https://i.ytimg.com/vi/${id}/oardefault.jpg`,
          size: "narrow",
        }
      : {
          kind: "youtube",
          video_id: id,
          url: `https://www.youtube.com/watch?v=${id}`,
          width: 1280,
          height: 720,
          // The full-size thumbnail where the editor found one (VideoView
          // asks YouTube once); the small one every video has otherwise.
          poster: `https://i.ytimg.com/vi/${id}/${attrs.hd === true ? "maxresdefault" : "hqdefault"}.jpg`,
        };
  return finishFigure(ctx, name, `youtube:${id}`, title, media, attrs.caption);
}

/** Every line after the first lines up under the item's text. */
function indent(body: string, marker: string): string {
  const pad = " ".repeat(marker.length);
  return body
    .split("\n")
    .map((line, i) => (i === 0 ? marker + line : line ? pad + line : ""))
    .join("\n");
}

function writeList(node: JSONContent, ctx: Ctx): Written[] {
  const ordered = node.type === "orderedList";
  const given = Number(node.attrs?.start ?? 1);
  const start = Number.isInteger(given) && given >= 0 && given < 1e8 ? given : 1;
  const items = (node.content ?? [])
    .map((item) => writeBlocks(item?.type === "listItem" ? item.content : [item], ctx, true))
    .filter((blocks) => blocks.length > 0);
  if (!items.length) return [];
  // Tight (no blank lines) when every item is one paragraph, perhaps with a
  // list under it that may start on the next line.
  const tight = items.every(
    ([first, ...rest]) =>
      first.kind === "paragraph" && (rest.length === 0 || (rest.length === 1 && rest[0].kind === "list" && !!rest[0].interrupts)),
  );
  const md = items
    .map((blocks, i) => {
      const marker = ordered ? `${start + i}. ` : "- ";
      // "- ---" would be a rule on its own; "- ***" is an item holding one.
      const parts = blocks.map((block, j) => (j === 0 && block.kind === "rule" ? { ...block, md: "***" } : block));
      return indent(tight ? parts.map((block) => block.md).join("\n") : joinBlocks(parts), marker);
    })
    .join(tight ? "\n" : "\n\n");
  return [{ md, kind: "list", list: ordered ? "ordered" : "bullet", interrupts: !ordered || start === 1 }];
}

function codeText(nodes: JSONContent[] | undefined): string {
  return (nodes ?? [])
    .map((node) => (node?.type === "hardBreak" ? "\n" : typeof node?.text === "string" ? node.text : codeText(node?.content)))
    .join("");
}

function writeCode(node: JSONContent): Written[] {
  const text = stripControls(codeText(node.content).replace(/\r\n?/g, "\n"));
  if (!text.trim()) return [];
  const given = typeof node.attrs?.language === "string" ? node.attrs.language.trim() : "";
  const language = LANGUAGE.test(given) ? given : "";
  const fence = "`".repeat(Math.max(3, longestTicks(text) + 1));
  return [{ md: `${fence}${language}\n${text}\n${fence}`, kind: "other" }];
}

function writeBlock(node: JSONContent, ctx: Ctx, nested: boolean): Written[] {
  switch (node.type) {
    case "paragraph":
      return writeParagraph(collectLines(node.content, false), ctx);
    case "heading": {
      // PostBody draws headings only at the top level; inside a list or a
      // quote the words stay, in bold.
      if (nested) return writeParagraph(collectLines(node.content, false, { bold: true }), ctx);
      const level = Number(node.attrs?.level) >= 3 ? 3 : 2;
      const lines = trimLines(collectLines(node.content, true));
      if (!lines.length) return [];
      const written = writeInline(lines, "heading", ctx);
      return written ? [{ md: `${"#".repeat(level)} ${written.md}`, kind: "other" }] : [];
    }
    case "bulletList":
    case "orderedList":
      return writeList(node, ctx);
    case "blockquote": {
      const blocks = writeBlocks(node.content, ctx, true);
      if (!blocks.length) return [];
      const md = joinBlocks(blocks)
        .split("\n")
        .map((line) => (line ? `> ${line}` : ">"))
        .join("\n");
      return [{ md, kind: "other" }];
    }
    case "codeBlock":
      return writeCode(node);
    case "horizontalRule":
      return [{ md: "---", kind: "rule" }];
    case "figure":
    case "video":
      // parsePost finds figures only at the top level (the schema keeps them
      // there); one inside a list would vanish from the page.
      if (nested) {
        ctx.problems.push("A picture or video inside a list or a quote cannot be shown. Move it out.");
        return [];
      }
      return node.type === "figure" ? writeFigure(node, ctx) : writeVideo(node, ctx);
    default: {
      // An unknown block keeps its text: inline content as a paragraph, block
      // content as blocks.
      const content = node.content ?? [];
      if (typeof node.text === "string") return writeParagraph(collectLines([node], false), ctx);
      if (content.some(isInline)) return writeParagraph(collectLines(content, false), ctx);
      return writeBlocks(content, ctx, nested);
    }
  }
}

function writeBlocks(nodes: JSONContent[] | undefined, ctx: Ctx, nested: boolean): Written[] {
  const out: Written[] = [];
  for (const node of nodes ?? []) if (node && typeof node === "object") out.push(...writeBlock(node, ctx, nested));
  return out;
}

function joinBlocks(blocks: Written[]): string {
  const parts: string[] = [];
  blocks.forEach((block, i) => {
    const prev = blocks[i - 1];
    // parsePost reads an italic paragraph right under a figure as its caption.
    if (prev?.kind === "figure" && !prev.captioned && block.kind === "paragraph" && block.soleEm) parts.push(SEPARATOR);
    // Two lists of the same kind in a row would read as one list.
    else if (prev?.kind === "list" && block.kind === "list" && prev.list === block.list) parts.push(SEPARATOR);
    parts.push(block.md);
  });
  return parts.join("\n\n");
}

/* ---------------------------------------------------------- plain text */

function inlineText(nodes: JSONContent[] | undefined): string {
  return (nodes ?? [])
    .map((node) => (node?.type === "hardBreak" ? "\n" : typeof node?.text === "string" ? node.text : inlineText(node?.content)))
    .join("");
}

const NOT_TEXT = new Set(["codeBlock", "figure", "video", "horizontalRule"]);

/**
 * The words a reader reads, without pictures, captions or code blocks, one
 * blank line between blocks. Cheap enough to run on every keystroke; the
 * word count in SerializedPost is this text split on whitespace.
 */
export function plainText(doc: JSONContent): string {
  const parts: string[] = [];
  const walk = (nodes: JSONContent[] | undefined) => {
    for (const node of nodes ?? []) {
      if (!node || typeof node !== "object" || NOT_TEXT.has(node.type ?? "")) continue;
      if (typeof node.text === "string") parts.push(node.text);
      else if (node.type === "paragraph" || node.type === "heading" || (node.content ?? []).some(isInline)) parts.push(inlineText(node.content));
      else walk(node.content);
    }
  };
  walk(doc?.content);
  return parts
    .map((part) => part.trim())
    .filter(Boolean)
    .join("\n\n");
}

/** Cut at a word so the result, dots included, fits in `max`. */
function cut(text: string, max: number): string {
  if (text.length <= max) return text;
  const room = max - 3;
  let head = text.slice(0, room);
  if (!/\s/.test(text.charAt(room))) {
    const space = head.search(/\s\S*$/);
    if (space > 0) head = head.slice(0, space);
  }
  head = head.replace(/[\s,;:.\-\u2013\u2014]+$/u, "").replace(/[\uD800-\uDBFF]$/, "");
  return `${head}...`;
}

function excerptOf(doc: JSONContent): string {
  for (const node of doc?.content ?? []) {
    if (node?.type !== "paragraph") continue;
    const text = stripControls(inlineText(node.content)).replace(/\s+/g, " ").trim();
    if (text) return cut(text, EXCERPT_MAX);
  }
  return "";
}

/* ---------------------------------------------------------------- API */

/**
 * The draft's text as a post: its Markdown, the media entries the Markdown
 * names, the card's excerpt, the word count, and the problems the writer has
 * to fix. `images` maps each figure's imageId to its published file (see
 * package.ts buildPost). Pure and synchronous; a figure whose file is
 * missing, a video that is not a YouTube id, or text that cannot be written
 * safely is left out and named in `problems`.
 */
export function docToMarkdown(doc: JSONContent, images: PublishedImages): SerializedPost {
  const ctx: Ctx = { problems: [], media: {}, images: images ?? {}, figures: 0, videos: 0 };
  const body = joinBlocks(writeBlocks(doc?.content, ctx, false));
  return {
    markdown: `${body}\n`,
    media: ctx.media,
    excerpt: excerptOf(doc),
    words: plainText(doc).match(/\S+/g)?.length ?? 0,
    problems: ctx.problems,
  };
}
