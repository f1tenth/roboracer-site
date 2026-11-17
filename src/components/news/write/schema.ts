// What a post can contain while it is being written. The schema is the
// first line of defence for pasted text: ProseMirror keeps only the nodes,
// marks and attributes named here, so fonts, colours, scripts, frames and
// styles from a pasted document never enter the draft at all.
//
// It is also exactly what the site's post page can render (PostBody):
// paragraphs, two heading levels, lists, quotes, code, rules, figures and
// YouTube videos. Nothing can be written here that would not publish.

import { Extension, Node, mergeAttributes, type Extensions } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { Placeholder } from "@tiptap/extensions";
import { ReactNodeViewRenderer } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import FigureView from "./FigureView";
import VideoView from "./VideoView";
import { imageSize } from "./imageRegistry";

/** An attribute kept in a data- attribute, so a figure cut and pasted inside
 * the editor comes back whole. `null` when absent lets a parse rule's own
 * value stand (the pasted <img> rule below). */
const dataAttr = (name: string, attr: string, fallback: string) => ({
  default: fallback,
  parseHTML: (el: HTMLElement) => el.getAttribute(attr),
  renderHTML: (attrs: Record<string, unknown>) => ({ [attr]: String(attrs[name] ?? fallback) }),
});

const flagAttr = (name: string, attr: string) => ({
  default: false,
  parseHTML: (el: HTMLElement) => (el.hasAttribute(attr) ? el.getAttribute(attr) === "true" : null),
  renderHTML: (attrs: Record<string, unknown>) => ({ [attr]: attrs[name] ? "true" : "false" }),
});

/** The document: text blocks and media side by side. Media sits only at the
 * top level, never inside a list or a quote, because that is where the post
 * page looks for figures. */
const Doc = Node.create({
  name: "doc",
  topNode: true,
  content: "(block | media)+",
});

/**
 * A picture with its caption. The node names a picture the draft holds
 * (imageId); it never carries a URL of its own. A picture arriving inside
 * pasted text is the one exception: its address is kept in `src` just long
 * enough for the page to fetch and re-encode it (NewsWrite adopts it), and is
 * never rendered, saved in the package or shown as an <img>.
 */
export const Figure = Node.create({
  name: "figure",
  group: "media",
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      imageId: dataAttr("imageId", "data-image-id", ""),
      alt: dataAttr("alt", "data-alt", ""),
      caption: dataAttr("caption", "data-caption", ""),
      size: dataAttr("size", "data-size", "column"),
      zoom: flagAttr("zoom", "data-zoom"),
      src: { default: null, rendered: false, parseHTML: () => null },
    };
  },

  parseHTML() {
    return [
      { tag: "figure[data-rr-figure]" },
      {
        tag: "img[src]",
        getAttrs: (el) => {
          const src = el.getAttribute("src") ?? "";
          // Only a picture's own bytes or an https address; anything else
          // (blob: from another page, file:, cid: from an email) cannot be read.
          if (!/^data:image\/(png|jpe?g|webp|gif|avif|bmp)[;,]/i.test(src) && !/^https:\/\//i.test(src)) return false;
          return { imageId: "", src, alt: (el.getAttribute("alt") ?? "").slice(0, 500) };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["figure", mergeAttributes({ "data-rr-figure": "" }, HTMLAttributes)];
  },

  addNodeView() {
    // The size rides on the block's outer element, where the stylesheet
    // (and the pairing marks below) can reach it.
    return ReactNodeViewRenderer(FigureView, {
      className: "rr-media",
      attrs: ({ node }) => ({ "data-size": String(node.attrs.size) }),
    });
  },
});

/** A YouTube video: its id and title only. Nothing loads from YouTube in the
 * editor but the thumbnail, as on the published page. */
export const Video = Node.create({
  name: "video",
  group: "media",
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      videoId: dataAttr("videoId", "data-video-id", ""),
      title: dataAttr("title", "data-title", ""),
      caption: dataAttr("caption", "data-caption", ""),
      portrait: flagAttr("portrait", "data-portrait"),
      hd: flagAttr("hd", "data-hd"),
    };
  },

  parseHTML() {
    return [{ tag: "div[data-rr-video]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes({ "data-rr-video": "" }, HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoView, {
      className: "rr-media",
      attrs: ({ node }) => ({ "data-size": node.attrs.portrait ? "narrow" : "column" }),
    });
  },
});

/** Width over height of a media node, for sharing a line fairly. */
function ratioOf(node: { type: { name: string }; attrs: Record<string, unknown> }): number {
  if (node.type.name === "video") return node.attrs.portrait ? 9 / 16 : 16 / 9;
  const size = imageSize(String(node.attrs.imageId));
  return size ? size.width / size.height : 1;
}

const isNarrow = (node: { type: { name: string }; attrs: Record<string, unknown> }) =>
  (node.type.name === "figure" && node.attrs.size === "narrow") ||
  (node.type.name === "video" && node.attrs.portrait === true);

/**
 * Two narrow figures in a row share a line on the published page (PostBody
 * pairs them, each column as wide as its picture's proportions, so both come
 * out the same height). The editor shows the same thing while writing: this
 * marks each pair so the stylesheet can lay it out, without changing the
 * document.
 */
const PairNarrowFigures = new Plugin({
  key: new PluginKey("rrPairNarrowFigures"),
  props: {
    decorations(state) {
      const decorations: Decoration[] = [];
      let open: { pos: number; size: number; ratio: number } | null = null;
      state.doc.forEach((node, pos) => {
        if (!isNarrow(node)) {
          open = null;
          return;
        }
        const ratio = ratioOf(node);
        if (!open) {
          open = { pos, size: node.nodeSize, ratio };
          return;
        }
        const total = open.ratio + ratio;
        decorations.push(
          Decoration.node(open.pos, open.pos + open.size, {
            class: "rr-pair rr-pair-first",
            style: `--pair-share: ${(open.ratio / total).toFixed(4)}`,
          }),
          Decoration.node(pos, pos + node.nodeSize, {
            class: "rr-pair rr-pair-second",
            style: `--pair-share: ${(ratio / total).toFixed(4)}`,
          }),
        );
        open = null;
      });
      return DecorationSet.create(state.doc, decorations);
    },
  },
});

const Pairing = Extension.create({
  name: "rrPairing",
  addProseMirrorPlugins() {
    return [PairNarrowFigures];
  },
});

/** The languages offered for a code block: the label a reader sees on the
 * published block, and the fence word written to the Markdown. */
export const CODE_LANGUAGES: { value: string; label: string }[] = [
  { value: "", label: "Plain" },
  { value: "sh", label: "Terminal" },
  { value: "python", label: "Python" },
  { value: "cpp", label: "C++" },
  { value: "rust", label: "Rust" },
  { value: "yaml", label: "YAML" },
  { value: "json", label: "JSON" },
  { value: "xml", label: "XML" },
];

export const LINK_OK = /^(https?:\/\/|mailto:)/i;

export function writerExtensions(): Extensions {
  return [
    Doc,
    StarterKit.configure({
      document: false,
      // The post page has an h1 (the title) and renders h2 and h3 in the text.
      heading: { levels: [2, 3] },
      // The post format has no underline: a link is the only underlined text.
      underline: false,
      link: {
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        defaultProtocol: "https",
        protocols: ["http", "https", "mailto"],
        HTMLAttributes: { rel: "noopener noreferrer nofollow", target: null },
        isAllowedUri: (url) => LINK_OK.test(url.trim()),
        shouldAutoLink: (url) => LINK_OK.test(url.trim()),
      },
      dropcursor: { color: "#7c3aed", width: 3, class: "rr-dropcursor" },
    }),
    Placeholder.configure({
      placeholder: ({ node }) =>
        node.type.name === "heading" ? "Heading" : "Write your story here, or paste it in. Drop pictures anywhere.",
    }),
    Figure,
    Video,
    Pairing,
  ];
}
