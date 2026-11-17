// Does the post writer's Markdown read back as written?
//
// src/components/news/write/markdown.ts turns a visitor's draft (Tiptap JSON)
// into the site's post format, and the draft is written by strangers. This
// bundles it with parsePost (postData.ts, the reader the post page uses) and,
// for a table of drafts, checks three things:
//
//   1. Round trip: the blocks parsePost finds are the draft's blocks, with
//      the same heading levels, the same text with the same marks, and the
//      same figures (file, alt text, caption, media entry).
//   2. Hostile text stays text: nothing a writer types becomes HTML, an
//      image, a link the writer did not make, or a heading or list.
//   3. The caption trap, both ways: an italic paragraph under a figure with
//      no caption stays a paragraph, and an empty caption writes nothing.
//
// The expected side is worked out from the draft alone, by the rules the
// serializer promises (whitespace at the edges of a line is layout, a link
// survives only to http, https or mailto, alt text is one plain line).
//
//   node scripts/check-post-writer.mjs     one line per case; exit 1 with a diff on failure
//
// Plain Node 20 and the esbuild that Vite already ships; nothing is written.

import { build } from "esbuild";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const bundle = await build({
  stdin: {
    contents: [
      'export { docToMarkdown, plainText } from "./src/components/news/write/markdown.ts";',
      'export { parsePost } from "./src/components/news/postData.ts";',
    ].join("\n"),
    resolveDir: ROOT,
    loader: "ts",
    sourcefile: "check-post-writer-entry.ts",
  },
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node20",
  write: false,
  logLevel: "silent",
  // loadPost reads import.meta.env, which only Vite provides; it never runs here.
  define: { "import.meta.env": "{}" },
});
const { docToMarkdown, plainText, parsePost } = await import(
  `data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`
);

/* ---------------------------------------------------------- draft builders */

const t = (text, ...marks) => ({
  type: "text",
  text,
  ...(marks.length ? { marks: marks.map((m) => (typeof m === "string" ? { type: m } : m)) } : {}),
});
const link = (href) => ({ type: "link", attrs: { href } });
const p = (...content) => ({ type: "paragraph", content });
const h = (level, ...content) => ({ type: "heading", attrs: { level }, content });
const ul = (...items) => ({ type: "bulletList", content: items });
const ol = (start, ...items) => ({ type: "orderedList", attrs: { start }, content: items });
const li = (...blocks) => ({ type: "listItem", content: blocks });
const quote = (...blocks) => ({ type: "blockquote", content: blocks });
const code = (language, text) => ({ type: "codeBlock", attrs: { language }, content: text ? [t(text)] : [] });
const hr = { type: "horizontalRule" };
const br = { type: "hardBreak" };
const fig = (attrs) => ({ type: "figure", attrs: { imageId: "img1", alt: "A picture", caption: "", size: "column", zoom: false, ...attrs } });
const vid = (attrs) => ({ type: "video", attrs: { videoId: "cEtLJ8aXSXk", title: "A video", caption: "", portrait: false, ...attrs } });
const doc = (...content) => ({ type: "doc", content });

const IMAGES = {
  img1: { path: "/media/news/news-test-1.webp", width: 1600, height: 900 },
  img2: { path: "/media/news/news-test-2.webp", width: 900, height: 1200 },
  img3: { path: "/media/news/news-test-3.jpg", width: 640, height: 480 },
  img4: { path: "/media/news/news-test-4.webp", width: 1200, height: 800 },
  img5: { path: "/media/news/news-test-5.webp", width: 1200, height: 1500 },
};

/* ------------------------------------------- the oracle: from the draft alone */

const SEPARATOR = "<!-- -->";
const LINK_OK = /^(?:https?:\/\/[^\s/?#\\]|mailto:\S)/i;
const isControl = (ch) => {
  const n = ch.codePointAt(0);
  return (n < 0x20 && ch !== "\t" && ch !== "\n") || n === 0x7f;
};
const noControls = (s) => Array.from(s).filter((ch) => !isControl(ch)).join("");
const plain = (s) => noControls(typeof s === "string" ? s : "").replace(/\s+/g, " ").trim();

/** The href as the serializer promises to write it: trimmed, and encoded
 * where it could break out of the Markdown destination. */
function expectHref(raw) {
  if (typeof raw !== "string" || !LINK_OK.test(raw.trim())) return null;
  return Array.from(raw.trim())
    .map((ch) => {
      if (ch === "(") return "%28";
      if (ch === ")") return "%29";
      const n = ch.codePointAt(0);
      return n < 0x21 || n === 0x7f || /[\s<>\\`]/u.test(ch) ? encodeURIComponent(ch) : ch;
    })
    .join("");
}

function expectAlt(raw) {
  let alt = plain(raw).replace(/`/g, "'");
  for (let prev = ""; prev !== alt; ) {
    prev = alt;
    alt = alt.replace(/\\+(?=[[\]]|$)/g, "").trim();
  }
  return alt;
}

/** Marks a case expects the serializer to give up (and say so). */
let without = [];

function marksOf(list, inherited) {
  const m = { ...inherited };
  for (const mark of list ?? []) {
    if (["bold", "italic", "strike", "code"].includes(mark.type) && !without.includes(mark.type)) m[mark.type] = true;
    if (mark.type === "link") {
      const href = expectHref(mark.attrs?.href);
      if (href) m.href = href;
    }
  }
  return m;
}

/** Lines of { ch, m }: what a reader should see in one paragraph. */
function expectLines(nodes, oneLine = false, extra = {}) {
  const lines = [[]];
  const walk = (list, inherited) => {
    for (const node of list ?? []) {
      const m = marksOf(node.marks, inherited);
      if (node.type === "hardBreak") {
        if (oneLine) lines[lines.length - 1].push({ ch: " ", m });
        else lines.push([]);
      } else if (typeof node.text === "string") {
        node.text.split(/\r\n|\r|\n/).forEach((part, i) => {
          if (i > 0) {
            if (oneLine || m.code) lines[lines.length - 1].push({ ch: " ", m });
            else lines.push([]);
          }
          for (const ch of noControls(part)) lines[lines.length - 1].push({ ch: ch === "\t" ? " " : ch, m });
        });
      } else walk(node.content, m);
    }
  };
  walk(nodes, extra);
  const blank = (c) => !c.m.code && (c.ch === " " || c.ch === "\t");
  const out = lines.map((line) => {
    let a = 0;
    let b = line.length;
    while (a < b && blank(line[a])) a += 1;
    while (b > a && blank(line[b - 1])) b -= 1;
    return line.slice(a, b);
  });
  while (out.length && !out[0].length) out.shift();
  while (out.length && !out[out.length - 1].length) out.pop();
  return out;
}

const isInline = (n) => n && (n.type === "text" || n.type === "hardBreak" || typeof n.text === "string");

function expectBlocks(nodes, media, nested) {
  const out = [];
  const para = (lines) => lines.length && out.push({ type: "p", lines });
  for (const node of nodes ?? []) {
    switch (node.type) {
      case "paragraph":
        para(expectLines(node.content));
        break;
      case "heading":
        if (nested) para(expectLines(node.content, false, { bold: true }));
        else {
          const lines = expectLines(node.content, true);
          if (lines.length) out.push({ type: "h", depth: Number(node.attrs?.level) >= 3 ? 3 : 2, lines });
        }
        break;
      case "bulletList":
      case "orderedList": {
        const items = (node.content ?? [])
          .map((item) => expectBlocks(item.type === "listItem" ? item.content : [item], media, true))
          .filter((b) => b.length);
        const ordered = node.type === "orderedList";
        if (items.length) out.push({ type: "list", ordered, start: ordered ? Number(node.attrs?.start ?? 1) : null, items });
        break;
      }
      case "blockquote": {
        const blocks = expectBlocks(node.content, media, true);
        if (blocks.length) out.push({ type: "quote", blocks });
        break;
      }
      case "codeBlock": {
        const text = noControls((node.content ?? []).map((n) => n.text ?? "").join("").replace(/\r\n?/g, "\n"));
        const lang = String(node.attrs?.language ?? "").trim();
        if (text.trim()) out.push({ type: "code", lang: /^[A-Za-z0-9+#-]{1,32}$/.test(lang) ? lang : "", text });
        break;
      }
      case "horizontalRule":
        out.push({ type: "hr" });
        break;
      case "figure": {
        const image = Object.prototype.hasOwnProperty.call(IMAGES, node.attrs.imageId) ? IMAGES[node.attrs.imageId] : null;
        if (nested || !image) break;
        const entry = { kind: "image", width: image.width, height: image.height };
        if (node.attrs.wrap === "left" || node.attrs.wrap === "right") {
          entry.wrap = node.attrs.wrap;
          entry.span = Math.round(Math.min(0.65, Math.max(0.25, Number(node.attrs.span) || 0.42)) * 100) / 100;
        } else if (node.attrs.size === "narrow") entry.size = "narrow";
        if (node.attrs.zoom === true) entry.zoom = true;
        media[image.path] ??= entry;
        out.push({ type: "figure", src: image.path, alt: expectAlt(node.attrs.alt), caption: plain(node.attrs.caption) || null, media: media[image.path] });
        break;
      }
      case "video": {
        const id = String(node.attrs.videoId ?? "").trim();
        if (nested || !/^[A-Za-z0-9_-]{11}$/.test(id)) break;
        const portrait = node.attrs.portrait === true;
        const key = `youtube:${id}`;
        media[key] ??= portrait
          ? { kind: "youtube", video_id: id, url: `https://www.youtube.com/shorts/${id}`, width: 1080, height: 1920, poster: `https://i.ytimg.com/vi/${id}/oardefault.jpg`, size: "narrow" }
          : { kind: "youtube", video_id: id, url: `https://www.youtube.com/watch?v=${id}`, width: 1280, height: 720, poster: `https://i.ytimg.com/vi/${id}/hqdefault.jpg` };
        out.push({ type: "figure", src: key, alt: expectAlt(node.attrs.title), caption: plain(node.attrs.caption) || null, media: media[key] });
        break;
      }
      default:
        if (typeof node.text === "string") para(expectLines([node]));
        else if ((node.content ?? []).some(isInline)) para(expectLines(node.content));
        else out.push(...expectBlocks(node.content, media, nested));
    }
  }
  return out;
}

/* ------------------------------------------------- the reading: parsePost */

/** marked's inline tokens as lines of { ch, m }. Anything PostBody would
 * drop or a writer cannot have made is a violation. */
function flat(tokens, bad, m = {}, lines = [[]]) {
  for (const token of tokens ?? []) {
    switch (token.type) {
      case "text":
      case "escape":
        if (token.tokens?.length) flat(token.tokens, bad, m, lines);
        else for (const ch of token.text) lines[lines.length - 1].push({ ch, m });
        break;
      case "strong":
        flat(token.tokens, bad, { ...m, bold: true }, lines);
        break;
      case "em":
        flat(token.tokens, bad, { ...m, italic: true }, lines);
        break;
      case "del":
        flat(token.tokens, bad, { ...m, strike: true }, lines);
        break;
      case "codespan":
        for (const ch of token.text) lines[lines.length - 1].push({ ch, m: { ...m, code: true } });
        break;
      case "br":
        lines.push([]);
        break;
      case "link":
        if (!/^(?:https?:|mailto:)/i.test(token.href)) bad.push(`link to ${JSON.stringify(token.href)} from ${JSON.stringify(token.raw)}`);
        // A bare URL marked links on its own is fine: its text is unchanged.
        flat(token.tokens, bad, token.raw.startsWith("[") ? { ...m, href: token.href } : m, lines);
        break;
      default:
        bad.push(`inline ${token.type} token from ${JSON.stringify(token.raw)}`);
    }
  }
  return lines;
}

function readTokens(tokens, bad) {
  const out = [];
  for (const token of tokens ?? []) {
    switch (token.type) {
      case "space":
        break;
      case "paragraph":
      case "text":
        out.push({ type: "p", lines: flat(token.tokens ?? [{ type: "text", text: token.text }], bad) });
        break;
      case "list":
        out.push({
          type: "list",
          ordered: token.ordered,
          start: token.ordered ? token.start : null,
          items: token.items.map((item) => readTokens(item.tokens, bad)),
        });
        break;
      case "blockquote":
        out.push({ type: "quote", blocks: readTokens(token.tokens, bad) });
        break;
      case "code":
        out.push({ type: "code", lang: token.lang ?? "", text: token.text });
        break;
      case "hr":
        out.push({ type: "hr" });
        break;
      case "html":
        if (token.text.trim() !== SEPARATOR) bad.push(`html block ${JSON.stringify(token.raw)}`);
        break;
      default:
        // A heading inside a list or a quote, a table: PostBody drops or the
        // writer cannot have made them.
        bad.push(`${token.type} block from ${JSON.stringify(token.raw)}`);
    }
  }
  return out;
}

function readPost(parsed, bad) {
  const out = [];
  for (const block of parsed.blocks) {
    if (block.type === "heading") out.push({ type: "h", depth: block.depth, lines: flat(block.tokens, bad) });
    else if (block.type === "figures") {
      for (const f of block.items) {
        const caption = f.caption ? flat(f.caption, bad) : null;
        out.push({ type: "figure", src: f.src, alt: f.alt, caption: caption ? canonLine(caption[0] ?? [], false) + (caption.length > 1 ? " [+lines]" : "") : null, media: f.media ?? null });
      }
    } else out.push(...readTokens([block.token], bad));
  }
  return out;
}

/* ------------------------------------------------------------- comparing */

const sig = (m) => [m.bold && "b", m.italic && "i", m.strike && "s", m.code && "c", m.href && `a(${m.href})`].filter(Boolean).join("+");

/** A line as text with its marks shown, e.g. "a {b}bold{/} word". Whitespace
 * outside code (and, for lenient cases, punctuation) takes its marks from
 * the characters on both sides, since Markdown cannot say otherwise. */
function canonLine(line, lenient) {
  const loose = (c) => !c.m.code && (/\s/u.test(c.ch) || (lenient && /[\p{P}\p{S}]/u.test(c.ch)));
  const sigs = line.map((c) => (loose(c) ? null : sig(c.m)));
  for (let i = 0; i < sigs.length; i += 1) {
    if (sigs[i] !== null) continue;
    let j = i;
    while (j < sigs.length && sigs[j] === null) j += 1;
    const fill = i > 0 && j < sigs.length && sigs[i - 1] === sigs[j] ? sigs[j] : "";
    for (let k = i; k < j; k += 1) sigs[k] = fill;
    i = j - 1;
  }
  let out = "";
  let open = "";
  line.forEach((c, i) => {
    if (sigs[i] !== open) {
      if (open) out += "{/}";
      if (sigs[i]) out += `{${sigs[i]}}`;
      open = sigs[i];
    }
    out += c.ch.replace(/[{}]/g, "$&$&");
  });
  return open ? `${out}{/}` : out;
}

function canon(blocks, lenient) {
  return blocks.map((b) => {
    if (b.lines) return { ...b, lines: b.lines.map((line) => canonLine(line, lenient)) };
    if (b.items) return { ...b, items: b.items.map((item) => canon(item, lenient)) };
    if (b.blocks) return { ...b, blocks: canon(b.blocks, lenient) };
    return b;
  });
}

function diff(expected, actual) {
  const a = expected.split("\n");
  const b = actual.split("\n");
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i += 1;
  const from = Math.max(0, i - 4);
  return [
    `    first difference at line ${i + 1} (- expected, + actual):`,
    ...a.slice(from, i + 4).map((l, k) => `    ${from + k === i ? "-" : " "} ${l}`),
    "    ---",
    ...b.slice(from, i + 4).map((l, k) => `    ${from + k === i ? "+" : " "} ${l}`),
  ].join("\n");
}

/* ----------------------------------------------------------------- cases */

const HOSTILE = [
  "<script>alert(1)</script>",
  "<img src=x onerror=alert(1)>",
  "[x](javascript:alert(1))",
  "![x](https://evil.example/a.png)",
  "*not italic*",
  "# not a heading",
  "1. not a list",
  "1) not a list either",
  "+ not a bullet",
  "- not a bullet",
  "> not a quote",
  "`tick`",
  "``double`` and ```fence```",
  "```js",
  "~~~",
  "---",
  "=====",
  ":-:",
  "a | b",
  "| a | b |",
  "&lt;",
  "&amp; &#65; &#x41; AT&T",
  "\\",
  "C:\\path\\to\\",
  "ends with a backslash \\",
  "text with trailing spaces   ",
  "    four spaces of indent",
  "[a]",
  "[ref]: https://evil.example",
  "[^1] footnote",
  "unbalanced * star and _ underscore",
  "_lone and **open",
  "**",
  "~~not struck~~",
  "<!-- a comment -->",
  "<https://evil.example>",
  "https://example.com/a_b*c*~d~ and www.example.com/x_y and someone@example.com",
  "Wow!",
  "tab\tinside and \u0000nul",
  "two\nlines # in one text node",
  "C# and issue #",
];

const CASES = [
  {
    name: "structure",
    doc: doc(
      h(1, t("A level-one heading becomes h2")),
      h(2, t("Why we built it")),
      h(3, t("A smaller heading")),
      h(4, t("Level four becomes h3")),
      p(t("Plain words, "), t("bold", "bold"), t(", "), t("italic", "italic"), t(", "), t("struck", "strike"), t(", "), t("code()", "code"), t(" and a "), t("link", link("https://example.com/docs")), t(".")),
      ul(li(p(t("first")), ol(1, li(p(t("nested one"))), li(p(t("nested two"))))), li(p(t("second")))),
      ol(3, li(p(t("third")), ol(5, li(p(t("fifth, nested"))))), li(p(t("fourth")), p(t("a second paragraph in the item")))),
      quote(p(t("A quote")), ul(li(p(t("with a list"))))),
      code("c++", "int main() {\n  // ``` inside the code\n  return 0;\n}"),
      code("py; rm -rf /", "print('language dropped')"),
      ul(li(p(t("code in an item")), code("sh", "echo one\n\necho two"))),
      ul(li(p(), hr, p(t("after a rule")))),
      hr,
      p(t("line one"), br, t("line two"), br, br, t("after a blank line")),
      p(br, t("leading and trailing breaks"), br),
      p(),
      p(t("   ")),
    ),
  },
  {
    name: "marks",
    doc: doc(
      p(t("bold and italic", "bold", "italic"), t(" then "), t("bold ", "bold"), t("then italic", "bold", "italic"), t(" plain")),
      p(t("a link around "), t("bold", "bold", link("https://example.com/a")), t(" words", link("https://example.com/a")), t(" and bold around a ", "bold"), t("link", "bold", link("https://example.com/b")), t(" end", "bold")),
      p(t("edge spaces:"), t(" bold ", "bold"), t("and"), t(" italic ", "italic"), t("|")),
      p(t("split ", "bold"), t("nodes", "bold"), t(" stay one span", "bold")),
      p(t("adjacent"), t("bold", "bold"), t("italic", "italic"), t("plain")),
      p(t("a ", "italic"), t("b", "italic", "bold"), t(" c", "italic")),
      p(t("code ", "bold"), t("inside", "bold", "code"), t(" bold", "bold")),
      p(t("a"), t("`tick` in code", "code"), t("b"), t(" padded ", "code"), t("c")),
      p(t("paren href", link("https://example.com/a b)c<d>e\\f")), t(" and "), t("mail", link("mailto:someone@example.com?subject=Hi there"))),
      p(
        t("js", link("javascript:alert(1)")), t(" "), t("JS", link(" JavaScript:alert(1)")), t(" "),
        t("data", link("data:text/html,<script>alert(1)</script>")), t(" "), t("proto", link("//evil.example")), t(" "),
        t("site", link("/news")), t(" "), t("noslash", link("https:evil.example")), t(" "), t("trimmed", link("  https://ok.example/x  ")),
      ),
      p(t("underlined", { type: "underline" }), t(" and "), t("highlighted", { type: "highlight" })),
      p(t("Wow!"), t("link", link("https://example.com/c"))),
    ),
    checks: [
      (r) => !r.markdown.includes("****") || "four stars in a row",
      (r) => !/javascript|data:|evil/i.test(r.markdown) || "a rejected href reached the Markdown",
      (r) => r.markdown.includes("https://example.com/a%20b%29c%3Cd%3Ee%5Cf") || "href not encoded as promised",
      (r) => r.markdown.includes("**split nodes stay one span**") || "split bold nodes did not join",
    ],
  },
  {
    name: "hostile text",
    doc: doc(
      ...HOSTILE.map((s) => p(t(s))),
      p(t("each at the start of a line"), ...HOSTILE.flatMap((s) => [br, t(s)])),
      ...HOSTILE.map((s) => h(2, t(s))),
      ul(...HOSTILE.map((s) => li(p(t(s))))),
      ol(1, ...HOSTILE.map((s) => li(p(t(s)), p(t("and"), br, t(s))))),
      quote(...HOSTILE.map((s) => p(t(s), br, t(s)))),
      ...HOSTILE.flatMap((s) => [
        p(t("x "), t(s, "bold"), t(" y")),
        p(t("x "), t(s, "italic"), t(" y")),
        p(t("x "), t(s, "strike"), t(" y")),
        p(t("x "), t(s, "code"), t(" y")),
        p(t("x "), t(s, link("https://example.com/ok")), t(" y")),
        p(t("x "), t(s, "bold", link("https://example.com/ok")), t(" y")),
      ]),
    ),
  },
  {
    // marked hides emphasis between two literal backticks, or between < and
    // >, even escaped ones (its blockSkip mask), so such a paragraph keeps
    // its words and loses its emphasis, and the writer is told.
    name: "emphasis marked cannot read",
    doc: doc(
      p(t("1 < 2 and "), t("bold", "bold"), t(" and 3 > 2")),
      p(t("a ` b "), t("italic", "italic"), t(" c ` d")),
    ),
    without: ["bold", "italic", "strike"],
    problems: [/starts "1 < 2 and bold and 3 > 2" has bold, italic/, /starts "a ` b italic c ` d" has bold, italic/],
  },
  {
    name: "punctuation at emphasis edges",
    lenient: true,
    doc: doc(
      p(t("a.", "bold"), t("b")),
      p(t("x"), t(".y", "italic")),
      p(t("say "), t("\"hi\"", "bold"), t("now")),
      p(t("the "), t("[1]", "italic"), t("th")),
    ),
  },
  {
    name: "figures and videos",
    doc: doc(
      p(t("Before the pictures.")),
      fig({ imageId: "img2", alt: "A narrow, zoomable one", caption: "Its caption", size: "narrow", zoom: true }),
      fig({ imageId: "img3", alt: "A second narrow one", size: "narrow" }),
      p(t("A normal paragraph under a figure with no caption.")),
      fig({ imageId: "img4", alt: "Beside the text, on the left", caption: "Wrapped", wrap: "left", span: 0.5, size: "narrow" }),
      p(t("The text that flows around the picture on the left.")),
      fig({ imageId: "img5", alt: "Beside the text, on the right, too wide", wrap: "right", span: 3 }),
      p(t("The text that flows around the picture on the right.")),
      vid({ title: "A landscape video", caption: "Watch it" }),
      vid({ videoId: "dQw4w9WgXcQ", title: "A Short", portrait: true }),
      fig({ imageId: "nope", alt: "Missing file" }),
      vid({ videoId: "javascript:alert(1)", title: "Bad id" }),
      vid({ videoId: "short", title: "Too short" }),
      fig({ imageId: "constructor", alt: "Prototype key" }),
      fig({ imageId: "img1", alt: "<img src=x onerror=alert(1)> [a](b) ![c](d) `e` f\\ \\[g\\] *h* _i_", caption: "<script>alert(1)</script> *not* [x](javascript:y) ** \\" }),
      fig({ imageId: "img1", alt: "Same file, other size", size: "narrow" }),
      fig({ imageId: "img1", alt: "Trailing backslash \\", caption: "# not a heading\n- not a list" }),
    ),
    problems: [/Picture 5 \("Missing file"\) has no picture file/, /Video 3 \("Bad id"\) is not a YouTube video/, /Video 4 \("Too short"\)/, /Picture 6 \("Prototype key"\) has no picture file/, /Picture 8 .* same file as an earlier one/],
    checks: [
      (r) => (r.markdown.match(/^!\[/gm) ?? []).length === 9 || "expected nine figure lines",
      // Beside the text: the side and a share of the column, clamped; never a size as well.
      (r) => JSON.stringify(r.media["/media/news/news-test-4.webp"]) === '{"kind":"image","width":1200,"height":800,"wrap":"left","span":0.5}' || "left-wrapped figure's media",
      (r) => JSON.stringify(r.media["/media/news/news-test-5.webp"]) === '{"kind":"image","width":1200,"height":1500,"wrap":"right","span":0.65}' || "right-wrapped figure's span is clamped",
      (r) => !r.markdown.includes(SEPARATOR) || "no separator was needed here",
    ],
  },
  {
    name: "caption trap",
    doc: doc(
      fig({ imageId: "img1", alt: "No caption" }),
      p(t("An italic paragraph that is not a caption", "italic")),
      vid({ title: "No caption either" }),
      p(t("Bold italic, also not a caption", "bold", "italic")),
      fig({ imageId: "img2", alt: "With a caption", caption: "The real caption" }),
      p(t("Italic after a captioned figure", "italic")),
      fig({ imageId: "img3", alt: "Blank caption", caption: "   \n  " }),
      p(t("A normal paragraph")),
      fig({ imageId: "img1", alt: "Italic with a break" }),
      p(t("one", "italic"), br, t("two", "italic")),
    ),
    checks: [
      (r) => (r.markdown.match(/<!-- -->/g) ?? []).length === 2 || "expected exactly two separators",
      (r) => !/^\s*(\*\*|\*\s*\*|__|_\s*_)\s*$/m.test(r.markdown) || "an empty caption line was written",
      (r) => r.markdown.includes("![No caption](/media/news/news-test-1.webp)\n\n<!-- -->\n\n*An italic") || "separator not between the figure and the paragraph",
    ],
  },
  {
    name: "adjacent lists",
    doc: doc(
      ul(li(p(t("list one")))),
      ul(li(p(t("list two")))),
      ol(1, li(p(t("list three")))),
      ol(1, li(p(t("list four")))),
      ul(li(p(t("item")), ul(li(p(t("nested a")))), ul(li(p(t("nested b")))))),
    ),
  },
  {
    name: "unknown nodes and marks",
    doc: doc(
      { type: "callout", content: [p(t("inside a callout"))] },
      { type: "details", content: [t("inline text in an unknown block")] },
      p(t("a "), { type: "mention", attrs: { id: "x" } }, t("b "), { type: "wrapper", content: [t("kept", "bold")] }, t(" c")),
      quote(fig({ imageId: "img1", alt: "Nested" }), h(2, t("A heading in a quote"))),
      ul(li(p(t("item")), h(3, t("A heading in an item")))),
    ),
    problems: [/inside a list or a quote cannot be shown/],
  },
  {
    name: "excerpt and words",
    doc: doc(
      h(2, t("A heading first")),
      p(t("RoboRacer is an open platform for autonomous racing at one tenth scale. "), t("Students build", "bold"), t(" the car, write the stack, and race it against other teams at conferences around the world, from Atlanta to Vienna and beyond, every season.")),
      code("sh", "not counted at all"),
      fig({ imageId: "img1", alt: "Not counted", caption: "Not counted either" }),
      ul(li(p(t("six seven")))),
    ),
    checks: [
      (r) => r.excerpt.length <= 200 || `excerpt is ${r.excerpt.length} characters`,
      (r) => r.excerpt.endsWith("...") || "a cut excerpt ends with three dots",
      (r) => r.excerpt === "RoboRacer is an open platform for autonomous racing at one tenth scale. Students build the car, write the stack, and race it against other teams at conferences around the world, from Atlanta to..." || `excerpt: ${JSON.stringify(r.excerpt)}`,
      (r) => r.words === 43 || `words: ${r.words}`,
      (r) => !r.words || plainText(r.doc).split(/\s+/).filter(Boolean).length === r.words || "words disagree with plainText",
    ],
  },
  {
    name: "short excerpt",
    doc: doc(p(t("Short and "), t("whole", "italic"), br, t("on two lines."))),
    checks: [(r) => r.excerpt === "Short and whole on two lines." || `excerpt: ${JSON.stringify(r.excerpt)}`, (r) => r.words === 6 || `words: ${r.words}`],
  },
  {
    name: "empty draft",
    doc: doc(p(), p(t("  ")), ul(li(p()))),
    checks: [(r) => r.markdown === "\n" || `markdown: ${JSON.stringify(r.markdown)}`, (r) => r.excerpt === "" && r.words === 0 || "excerpt or words not empty"],
  },
];

/* ------------------------------------------------------------------- run */

let failed = 0;
const width = Math.max(...CASES.map((c) => c.name.length));
for (const c of CASES) {
  const out = docToMarkdown(c.doc, IMAGES);
  const issues = [];
  const bad = [];
  const parsed = parsePost(out.markdown, out.media);
  const media = {};
  without = c.without ?? [];
  const expected = JSON.stringify(canon(expectBlocks(c.doc.content, media, false), c.lenient), null, 2);
  const actual = JSON.stringify(canon(readPost(parsed, bad), c.lenient), null, 2);

  if (expected !== actual) issues.push(`round trip differs\n${diff(expected, actual)}`);
  for (const b of bad) issues.push(`hostile: ${b}`);
  if (JSON.stringify(out.media) !== JSON.stringify(media)) issues.push(`media differs\n${diff(JSON.stringify(media, null, 2), JSON.stringify(out.media, null, 2))}`);
  if (!out.markdown.endsWith("\n") || out.markdown.endsWith("\n\n")) issues.push("markdown does not end with exactly one newline");
  const wanted = c.problems ?? [];
  for (const re of wanted) if (!out.problems.some((pr) => re.test(pr))) issues.push(`missing problem ${re}`);
  for (const pr of out.problems) if (!wanted.some((re) => re.test(pr))) issues.push(`unexpected problem: ${pr}`);
  for (const check of c.checks ?? []) {
    const result = check({ ...out, doc: c.doc });
    if (result !== true) issues.push(result);
  }

  const figures = parsed.blocks.reduce((n, b) => n + (b.type === "figures" ? b.items.length : 0), 0);
  const summary = `${parsed.blocks.length} blocks, ${figures} figures, ${Object.keys(out.media).length} media, ${out.problems.length} problems, ${out.words} words`;
  if (issues.length) {
    failed += 1;
    console.log(`FAIL  ${c.name.padEnd(width)}  ${summary}`);
    for (const issue of issues) console.log(`  ${issue}`);
    console.log("  markdown:");
    console.log(out.markdown.replace(/^/gm, "    | "));
  } else {
    console.log(`ok    ${c.name.padEnd(width)}  ${summary}`);
  }
}

if (failed) {
  console.log(`\n${failed} of ${CASES.length} cases failed`);
  process.exit(1);
}
console.log(`\nall ${CASES.length} cases pass`);
