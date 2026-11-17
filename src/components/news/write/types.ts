// The shapes the post writer (/news/write) shares between its parts: the draft
// a visitor is writing, the pictures it holds, and the package Submit builds.
// The package is the site's own post format (postData.ts): the same Markdown
// dialect and the same posts.json entry the hosted posts use, so a submission
// that passes review is published by moving its files into place
// (scripts/publish-post.mjs), never by rewriting it.

import type { JSONContent } from "@tiptap/core";
import type { Post } from "../postData";

/** One picture the draft holds. Always re-encoded in the browser: the file a
 * visitor drops never leaves the page as it came (no metadata, no surprises),
 * and nothing over the repo's 1.5 MB rule can be produced. */
export type DraftImage = {
  /** Random id: the key in the browser's store and in the text's figures. */
  id: string;
  /** The encoded picture: WebP, or JPEG where the browser cannot write WebP. */
  blob: Blob;
  type: "image/webp" | "image/jpeg";
  /** The encoded file's own pixels. */
  width: number;
  height: number;
  bytes: number;
  /** The dropped file's name, shown as a label only; never written anywhere. */
  name: string;
};

/** A figure in the text (the editor's `figure` node carries exactly this). */
export type FigureAttrs = {
  imageId: string;
  /** What the picture shows, for readers who cannot see it. Required to submit. */
  alt: string;
  /** The line under the picture; empty for none. Plain text. */
  caption: string;
  /** column: the reading column's width. narrow: capped small, and two narrow
   * figures in a row share a line (PostBody's rule). */
  size: "column" | "narrow";
  /** A screenshot whose detail matters: the published figure links to the file. */
  zoom: boolean;
};

/** A YouTube video in the text (the editor's `video` node). */
export type VideoAttrs = {
  /** The 11-character YouTube id. */
  videoId: string;
  /** The video's title: the player's accessible name. Required to submit. */
  title: string;
  caption: string;
  /** A Short (9:16): shown narrow, like a portrait photo. */
  portrait: boolean;
};

export type DraftFact = { label: string; value: string; href: string };

/** Everything about the post that is not its text. Empty string = not given. */
export type DraftMeta = {
  title: string;
  authorName: string;
  /** The author's own page: GitHub, LinkedIn, a lab page. */
  authorUrl: string;
  /** "PhD student and team lead". */
  authorRole: string;
  affiliation: string;
  cover: { imageId: string; alt: string; caption: string } | null;
  /** "Photos courtesy of ...". */
  credit: string;
  /** The margin card: where the code is, the license (up to four rows). */
  facts: DraftFact[];
};

export type Draft = {
  version: 1;
  /** ms since the epoch, set on every save. */
  updatedAt: number;
  meta: DraftMeta;
  /** The text as the editor holds it (Tiptap JSON, schema in write/schema.ts). */
  doc: JSONContent;
};

export const EMPTY_META: DraftMeta = {
  title: "",
  authorName: "",
  authorUrl: "",
  authorRole: "",
  affiliation: "",
  cover: null,
  credit: "",
  facts: [],
};

/** What the Markdown serializer needs to know about each picture: where the
 * published file will live and its size. Keyed by DraftImage.id. */
export type PublishedImages = Record<string, { path: string; width: number; height: number }>;

/** post.json inside the package: what scripts/publish-post.mjs reads. */
export type PostPackageManifest = {
  format: "roboracer-post/1";
  /** ISO instant the package was built. */
  created: string;
  /** The posts.json entry, complete: body is "posts/<slug>.md" and every
   * media path is the published one ("/media/news/<file in this package>"). */
  post: Post;
  /** The card's one or two sentences: the post's first paragraph, cut short. */
  excerpt: string;
  /** Every picture file in the package, by its file name. */
  files: { name: string; bytes: number; width: number; height: number; type: string }[];
  /** The writer ticked "my own words and pictures, or I have permission". */
  consent: { rights: true; at: string };
};

/** The package is a flat zip: post.md, post.json and the picture files. */
export const PACKAGE_FORMAT = "roboracer-post/1" as const;
export const PACKAGE_TEXT_FILE = "post.md";
export const PACKAGE_MANIFEST_FILE = "post.json";
/** The repo's rule 3: no binary over 1.5 MB enters git. */
export const MAX_IMAGE_BYTES = 1_500_000;
/** A post's pictures, cover included. */
export const MAX_IMAGES = 24;
/** Twice the 46rem reading column, for dense screens. */
export const MAX_IMAGE_WIDTH = 1600;
