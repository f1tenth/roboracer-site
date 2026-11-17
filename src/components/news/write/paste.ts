// Tidying what a writer pastes before the editor reads it. The editor's
// schema already drops everything a post cannot contain (fonts, colours,
// scripts, frames); this only reshapes what would otherwise be kept wrongly:
// heading levels, Word's fake lists, and Markdown pasted as plain text.
//
// The HTML is parsed into a detached document, which runs no script and
// loads no image, and goes back to the editor as a string for its own parser.

import { marked } from "marked";

function rename(el: Element, tag: string): Element {
  const next = el.ownerDocument.createElement(tag);
  while (el.firstChild) next.appendChild(el.firstChild);
  el.replaceWith(next);
  return next;
}

/** A post has two heading levels under its title. Whatever levels a pasted
 * document uses, its top level becomes a heading and everything below it a
 * subheading, so a document outlined with Heading 1 and 2 keeps its shape. */
function fitHeadings(body: HTMLElement) {
  const headings = [...body.querySelectorAll("h1, h2, h3, h4, h5, h6")];
  if (headings.length === 0) return;
  const top = Math.min(...headings.map((h) => Number(h.tagName[1])));
  for (const h of headings) {
    const level = Math.min(3, 2 + Number(h.tagName[1]) - top);
    if (h.tagName !== `H${level}`) rename(h, `h${level}`);
  }
}

/** Word writes a list as paragraphs with the bullet typed in as text. Runs of
 * those become real lists, with the typed bullets and numbers removed. */
function fixWordLists(body: HTMLElement) {
  const isItem = (el: Element | null): el is HTMLElement =>
    !!el && el.tagName === "P" && (/mso-list/i.test(el.getAttribute("style") ?? "") || /^MsoListParagraph/.test(el.className));
  for (const first of [...body.querySelectorAll("p")]) {
    if (!first.isConnected || !isItem(first) || isItem(first.previousElementSibling)) continue;
    const run: HTMLElement[] = [];
    for (let el: Element | null = first; isItem(el); el = el.nextElementSibling) run.push(el);
    const marker = first.querySelector('[style*="mso-list" i]')?.textContent ?? first.textContent ?? "";
    const list = body.ownerDocument.createElement(/^\s*(\d+|[a-z])[.)]/i.test(marker) ? "ol" : "ul");
    first.before(list);
    for (const p of run) {
      p.querySelectorAll('[style*="mso-list" i]').forEach((m) => m.remove());
      const li = body.ownerDocument.createElement("li");
      const inner = body.ownerDocument.createElement("p");
      while (p.firstChild) inner.appendChild(p.firstChild);
      li.appendChild(inner);
      list.appendChild(li);
      p.remove();
    }
  }
}

const BLOCKS = new Set(["P", "H1", "H2", "H3", "H4", "H5", "H6", "UL", "OL", "LI", "BLOCKQUOTE", "PRE", "DIV", "TABLE", "HR", "FIGURE"]);

/** Line breaks and indentation between two blocks are the source's
 * formatting, not text. Left in, each run becomes an empty paragraph. */
function dropGapsBetweenBlocks(body: HTMLElement) {
  const walker = body.ownerDocument.createTreeWalker(body, NodeFilter.SHOW_TEXT);
  const gaps: Node[] = [];
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.nodeValue?.trim()) continue;
    const beside = [node.previousSibling, node.nextSibling].filter((n): n is ChildNode => n !== null);
    if (beside.length > 0 && beside.every((n) => n.nodeType === 1 && BLOCKS.has((n as Element).tagName))) gaps.push(node);
  }
  gaps.forEach((node) => node.parentNode?.removeChild(node));
}

/** Pasted HTML, reshaped for the editor's parser. */
export function cleanPastedHTML(html: string): string {
  let doc: Document;
  try {
    doc = new DOMParser().parseFromString(html, "text/html");
  } catch {
    return html;
  }
  doc.body
    .querySelectorAll("script, style, meta, link, title, iframe, object, embed, svg, form, noscript, template")
    .forEach((el) => el.remove());
  fixWordLists(doc.body);
  fitHeadings(doc.body);
  dropGapsBetweenBlocks(doc.body);
  return doc.body.innerHTML;
}

/** Plain text that is really Markdown source (a README, a draft from a
 * notes app): a heading, list, quote or fence at a line start, or a link or
 * bold run in the text. One hit is not enough for a sentence with an
 * asterisk in it; two different marks, or a heading, are. */
export function looksLikeMarkdown(text: string): boolean {
  if (/^#{1,6} \S/m.test(text) || /^```/m.test(text)) return true;
  const marks = [
    /^\s*[-*+] \S/m,
    /^\s*\d+\. \S/m,
    /^> \S/m,
    /\[[^\]\n]+\]\(https?:\/\/[^)\s]+\)/,
    /\*\*[^*\n]+\*\*/,
    /!\[[^\]\n]*\]\([^)\s]+\)/,
  ];
  return marks.filter((re) => re.test(text)).length >= 2;
}

/** Markdown source as HTML for the editor's parser. Whatever HTML the
 * Markdown itself carries goes through the same schema as any other paste. */
export function markdownToHTML(text: string): string {
  const html = marked.parse(text, { async: false, gfm: true });
  return cleanPastedHTML(html);
}
