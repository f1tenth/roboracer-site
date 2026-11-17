// From a draft to the package a writer sends: the checks that must pass
// first, and the zip itself (post.md, post.json and the pictures, flat).
// Everything in the package is in the site's own post format, so publishing
// it is a move, not a rewrite (scripts/publish-post.mjs), and the same
// functions feed the preview, so what a writer previews is what is sent.

import type { JSONContent } from "@tiptap/core";
import type { Post, PostMedia } from "../postData";
import { formatIsoDate } from "../newsData";
import { docToMarkdown } from "./markdown";
import { LINK_OK } from "./schema";
import {
  MAX_IMAGES,
  PACKAGE_FORMAT,
  PACKAGE_MANIFEST_FILE,
  PACKAGE_TEXT_FILE,
  type Draft,
  type DraftImage,
  type PostPackageManifest,
  type PublishedImages,
} from "./types";
import { zipStore, type ZipEntry } from "./zip";

/** The repo a post is proposed to, and where its package is uploaded. */
export const REPO = "f1tenth/roboracer-site";
export const REPO_NAME = "roboracer-site";
export const SUBMISSIONS_DIR = "submissions";

/** "AuRoRus: our stack, in Rust" -> "aurorus-our-stack-in-rust". The slug is
 * the post's address (/news/<slug>) and part of every file name, so it is
 * plain ASCII and never longer than 60 characters. */
export function slugify(title: string): string {
  const slug = title
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
  // "write" is this page's own address.
  return slug === "write" ? "write-up" : slug;
}

/** Every figure in the text, in reading order. */
function figureIds(doc: JSONContent): string[] {
  const ids: string[] = [];
  const walk = (node: JSONContent) => {
    if (node.type === "figure" && typeof node.attrs?.imageId === "string") ids.push(node.attrs.imageId);
    node.content?.forEach(walk);
  };
  walk(doc);
  return ids;
}

/** The pictures a draft names (cover first), for pruning and counting. */
export function usedImageIds(draft: Pick<Draft, "meta" | "doc">): string[] {
  const ids = figureIds(draft.doc);
  if (draft.meta.cover) ids.unshift(draft.meta.cover.imageId);
  return [...new Set(ids)];
}

export type Issue = {
  /** What is wrong, as a sentence for the writer. */
  message: string;
  /** Where to send them: an element id on the page. */
  target: string;
};

const validUrl = (text: string) => {
  if (!/^https?:\/\//i.test(text)) return false;
  try {
    return !!new URL(text).hostname;
  } catch {
    return false;
  }
};

/**
 * What stands between a draft and a post that can be sent. `errors` block
 * the send; `notes` are worth a look and do not.
 */
export function checkDraft(
  draft: Pick<Draft, "meta" | "doc">,
  images: ReadonlyMap<string, DraftImage>,
  words: number,
): { errors: Issue[]; notes: Issue[] } {
  const errors: Issue[] = [];
  const notes: Issue[] = [];
  const { meta, doc } = draft;

  if (!meta.title.trim()) errors.push({ message: "Give the post a headline.", target: "post-headline" });
  else if (!slugify(meta.title)) errors.push({ message: "The headline needs at least one letter or number.", target: "post-headline" });
  if (!meta.authorName.trim()) errors.push({ message: "Add your name, so the post has a byline.", target: "post-author" });
  if (meta.authorUrl.trim() && !validUrl(meta.authorUrl.trim()))
    errors.push({ message: "Your link should be a full web address (https://...).", target: "post-author-url" });
  if (words === 0) errors.push({ message: "The post has no text yet.", target: "post-text" });
  else if (words < 80) notes.push({ message: `The post is short (${words} words).`, target: "post-text" });

  let noAlt = 0;
  let lost = 0;
  let noTitle = 0;
  let pending = 0;
  const walk = (node: JSONContent) => {
    if (node.type === "figure") {
      const id = String(node.attrs?.imageId ?? "");
      if (node.attrs?.src) pending += 1;
      else if (!images.has(id)) lost += 1;
      else if (!String(node.attrs?.alt ?? "").trim()) noAlt += 1;
    }
    if (node.type === "video" && !String(node.attrs?.title ?? "").trim()) noTitle += 1;
    node.content?.forEach(walk);
  };
  walk(doc);
  if (pending > 0) errors.push({ message: "A pasted picture is still being copied in. Wait a moment, or remove it.", target: "post-text" });
  if (lost > 0)
    errors.push({
      message: `${lost === 1 ? "A picture is" : `${lost} pictures are`} missing from this browser. Choose the file again or remove it.`,
      target: "post-text",
    });
  if (noAlt > 0)
    errors.push({
      message: `Describe ${noAlt === 1 ? "the picture that has" : `the ${noAlt} pictures that have`} no description yet (for readers who cannot see ${noAlt === 1 ? "it" : "them"}).`,
      target: "post-text",
    });
  if (noTitle > 0)
    errors.push({ message: `Give ${noTitle === 1 ? "the video its title" : "each video its title"}.`, target: "post-text" });

  if (meta.cover) {
    if (!images.has(meta.cover.imageId)) errors.push({ message: "The cover picture is missing from this browser. Choose it again.", target: "post-cover" });
    else if (!meta.cover.alt.trim()) errors.push({ message: "Describe the cover picture.", target: "post-cover-alt" });
  } else {
    notes.push({ message: "No cover picture: the post's card on the news page will be text only.", target: "post-cover" });
  }
  if (usedImageIds(draft).length > MAX_IMAGES)
    errors.push({ message: `A post can carry up to ${MAX_IMAGES} pictures.`, target: "post-text" });

  meta.facts.forEach((fact, i) => {
    const any = fact.label.trim() || fact.value.trim() || fact.href.trim();
    if (!any) return;
    if (!fact.label.trim() || !fact.value.trim())
      errors.push({ message: `Link ${i + 1} on the links card needs both a Link title and a Link display.`, target: "post-facts" });
    else if (fact.href.trim() && !validUrl(fact.href.trim()))
      errors.push({ message: `Link ${i + 1} on the links card: the Link should be a full web address (https://...).`, target: "post-facts" });
  });

  return { errors, notes };
}

export type BuiltPost = {
  slug: string;
  post: Post;
  markdown: string;
  excerpt: string;
  words: number;
  /** id -> published path, for showing the draft's pictures in a preview. */
  paths: PublishedImages;
  /** Problems found while writing the Markdown (a figure without its file). */
  problems: string[];
};

const isoDay = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/**
 * The draft as a post entry and its Markdown: what the preview renders and
 * what the package carries. Pure and synchronous, so the preview can run it
 * on every change.
 */
export function buildPost(draft: Pick<Draft, "meta" | "doc">, images: ReadonlyMap<string, DraftImage>, now = new Date()): BuiltPost {
  const { meta, doc } = draft;
  const slug = slugify(meta.title) || "untitled";
  const ext = (image: DraftImage) => (image.type === "image/jpeg" ? "jpg" : "webp");

  // File names are the published ones: news-<slug>-cover, then the figures
  // numbered in reading order. A picture used twice is one file.
  const paths: PublishedImages = {};
  const cover = meta.cover ? images.get(meta.cover.imageId) : undefined;
  if (meta.cover && cover) {
    paths[meta.cover.imageId] = {
      path: `/media/news/news-${slug}-cover.${ext(cover)}`,
      width: cover.width,
      height: cover.height,
    };
  }
  let n = 0;
  for (const id of figureIds(doc)) {
    const image = images.get(id);
    if (!image || paths[id]) continue;
    n += 1;
    paths[id] = { path: `/media/news/news-${slug}-${n}.${ext(image)}`, width: image.width, height: image.height };
  }

  const text = docToMarkdown(doc, paths);
  const date = isoDay(now);
  const media: Record<string, PostMedia> = text.media;
  const clean = (s: string) => s.trim().replace(/\s+/g, " ");
  const facts = meta.facts
    .filter((f) => f.label.trim() && f.value.trim())
    .slice(0, 4)
    .map((f) => ({
      label: clean(f.label),
      value: clean(f.value),
      ...(LINK_OK.test(f.href.trim()) ? { href: f.href.trim() } : {}),
    }));

  const post: Post = {
    slug,
    label: "Guest post",
    title: clean(meta.title),
    date,
    date_display: formatIsoDate(date),
    author: {
      name: clean(meta.authorName),
      url: /^https?:\/\//i.test(meta.authorUrl.trim()) ? meta.authorUrl.trim() : null,
      role: clean(meta.authorRole) || null,
      affiliation: clean(meta.affiliation) || null,
    },
    cover:
      meta.cover && cover
        ? {
            src: paths[meta.cover.imageId].path,
            width: cover.width,
            height: cover.height,
            alt: clean(meta.cover.alt),
            caption: clean(meta.cover.caption) || null,
          }
        : null,
    body: `posts/${slug}.md`,
    ...(facts.length > 0 ? { facts } : {}),
    credit: clean(meta.credit) || null,
    media,
  };

  return { slug, post, markdown: text.markdown, excerpt: text.excerpt, words: text.words, paths, problems: text.problems };
}

export type BuiltPackage = BuiltPost & {
  /** roboracer-post-<slug>.zip */
  fileName: string;
  zip: Blob;
  manifest: PostPackageManifest;
};

/** The package a writer downloads and sends. */
export async function buildPackage(
  draft: Pick<Draft, "meta" | "doc">,
  images: ReadonlyMap<string, DraftImage>,
  now = new Date(),
): Promise<BuiltPackage> {
  const built = buildPost(draft, images, now);
  const encoder = new TextEncoder();
  const entries: ZipEntry[] = [];
  const files: PostPackageManifest["files"] = [];

  for (const [id, published] of Object.entries(built.paths)) {
    const image = images.get(id);
    if (!image) continue;
    const name = published.path.slice(published.path.lastIndexOf("/") + 1);
    entries.push({ name, data: new Uint8Array(await image.blob.arrayBuffer()) });
    files.push({ name, bytes: image.bytes, width: image.width, height: image.height, type: image.type });
  }

  const manifest: PostPackageManifest = {
    format: PACKAGE_FORMAT,
    created: now.toISOString(),
    post: built.post,
    excerpt: built.excerpt,
    files,
    consent: { rights: true, at: now.toISOString() },
  };

  const zip = zipStore(
    [
      { name: PACKAGE_TEXT_FILE, data: encoder.encode(built.markdown) },
      { name: PACKAGE_MANIFEST_FILE, data: encoder.encode(`${JSON.stringify(manifest, null, 2)}\n`) },
      ...entries,
    ],
    now,
  );

  return { ...built, fileName: `roboracer-post-${built.slug}.zip`, zip, manifest };
}

/** A GitHub username: letters, digits and single hyphens, up to 39. */
export const isGithubUser = (name: string) => /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/.test(name);

/** "https://github.com/octocat" -> "octocat"; anything else -> "". */
export function githubUserFrom(url: string): string {
  const m = url.trim().match(/^https?:\/\/(?:www\.)?github\.com\/([^/?#]+)\/?$/i);
  return m && isGithubUser(m[1]) ? m[1] : "";
}

/** GitHub's own pages do the sending: the writer forks the repository and
 * uploads the package into the quarantined submissions/ folder of their
 * fork, which GitHub turns into a pull request from their account. (GitHub
 * only lets someone upload to a repository they can push to, so the fork
 * comes first.) Nothing of ours takes part: no server, no token, no bot. */
export const forkUrl = () => `https://github.com/${REPO}/fork`;
export const uploadUrl = (user: string) => `https://github.com/${user}/${REPO_NAME}/upload/main/${SUBMISSIONS_DIR}`;

export const MAIL_TO = "contact@roboracer.ai";
export const mailUrl = (title: string) =>
  `mailto:${MAIL_TO}?subject=${encodeURIComponent(`Post for roboracer.ai: ${title}`)}&body=${encodeURIComponent(
    "The post package (a .zip file) is attached.\n",
  )}`;
