// Every picture a writer drops into /news/write is decoded and drawn again on
// a canvas before the draft keeps it. A canvas re-encode writes pixels only:
// no EXIF (camera, GPS position, capture time), no XMP, no comments, none of
// the source's metadata survives it, which is why nothing is ever kept or
// sent as it came. (Chrome tags every file it writes with its own sRGB colour
// profile, the same 456 bytes for every picture; the source's profile is
// converted away, not copied.) The same pass rotates phone photos upright,
// scales them to the reading column's needs and holds every file under the
// repo's 1.5 MB rule.
//
// The type of a file is read from its first bytes, never from its name or the
// MIME type the system guessed: a text file renamed .png says image/png.

import { MAX_IMAGE_BYTES, MAX_IMAGE_WIDTH, type DraftImage } from "./types";

/** A picture the page will not take. The message is shown to the writer as
 * is, so it is one plain sentence that says what to do. */
export class ImageError extends Error {
  readonly cause?: unknown;
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "ImageError";
    this.cause = cause;
  }
}

/** A phone photo is 5 to 15 MB; 40 MB is a raw export nobody meant to send. */
const MAX_INPUT_BYTES = 40 * 1024 * 1024;
/** Decoding costs four bytes a pixel: 60 MP is 240 MB of memory on a phone. */
const MAX_INPUT_PIXELS = 60_000_000;
/** Smaller than an icon: nothing a post could show. */
const MIN_SIDE = 16;
/** Tall screenshots stay readable, but a long scroll capture is cut down. */
const MAX_HEIGHT = 2400;

const WEBP_QUALITY = [0.82, 0.72, 0.62];
/** JPEG needs a little more quality than WebP for the same look. */
const JPEG_QUALITY = [0.86, 0.76, 0.66];
/** Each step past the quality ladder shrinks both sides by this much. */
const SHRINK = 0.85;
/** Encodes per picture, all steps together, before giving up. */
const MAX_ENCODES = 12;
/** Enough of the file to find the size in any header the page reads, a
 * JPEG's EXIF block and colour profile included. */
const HEAD_BYTES = 256 * 1024;

const EXPORT_HINT = "export it as a JPEG or PNG and drop it again";

type Format = "jpeg" | "png" | "webp" | "gif" | "avif" | "bmp";

/** Found once per page load: Safari draws WebP but cannot write it. */
let webpEncodes: Promise<boolean> | undefined;

/** Asked of a 2x2 canvas, not the first real picture: a browser without a
 * WebP encoder answers with a PNG, which at full size costs a second and
 * 10 MB for nothing. */
function canWriteWebp(): Promise<boolean> {
  webpEncodes ??= (async () => {
    const s = surface(2, 2);
    try {
      return (await s.encode("image/webp", 0.8)).type === "image/webp";
    } catch {
      return false;
    } finally {
      s.release();
    }
  })();
  return webpEncodes;
}

/** A random id for the store and the text's figures. randomUUID only exists
 * on https and localhost, and a phone on the lab network opens the dev
 * server over plain http. */
export function newImageId(): string {
  const c = typeof crypto !== "undefined" ? crypto : undefined;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  const bytes = new Uint8Array(16);
  if (c && typeof c.getRandomValues === "function") c.getRandomValues(bytes);
  else for (let i = 0; i < 16; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

const PICTURE_NAME = /\.(jpe?g|jfif|png|webp|gif|avif|bmp|heic|heif|svg|tiff?)$/i;

/**
 * The files of a drop or a paste that look like pictures. Loose on purpose:
 * an SVG or a HEIC passes here so encodeImage can say why it is refused,
 * rather than the drop doing nothing. A pasted screenshot arrives as an item
 * with no file list in some browsers, so the items are read too.
 */
export function imageFilesFrom(data: DataTransfer | null): File[] {
  if (!data) return [];
  const found: File[] = [];
  const take = (file: File | null) => {
    if (!file || found.includes(file)) return;
    if (file.type.startsWith("image/") || PICTURE_NAME.test(file.name)) found.push(file);
  };
  for (const file of Array.from(data.files)) take(file);
  if (found.length === 0 && data.items) {
    for (const item of Array.from(data.items)) {
      if (item.kind === "file") take(item.getAsFile());
    }
  }
  return found;
}

const ascii = (bytes: Uint8Array, start: number, length: number) =>
  String.fromCharCode(...bytes.subarray(start, start + length));

/** The format by its signature, or why it is refused. */
function sniff(head: Uint8Array): Format | ImageError {
  const b = head;
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpeg";
  if (b.length >= 8 && ascii(b, 0, 8) === "\x89PNG\r\n\x1a\n") return "png";
  if (b.length >= 6 && (ascii(b, 0, 6) === "GIF87a" || ascii(b, 0, 6) === "GIF89a")) return "gif";
  if (b.length >= 12 && ascii(b, 0, 4) === "RIFF" && ascii(b, 8, 4) === "WEBP") return "webp";
  if (b.length >= 14 && ascii(b, 0, 2) === "BM") return "bmp";
  if (b.length >= 12 && ascii(b, 4, 4) === "ftyp") {
    // An ISO media file: the brands say AVIF, or HEIC (iPhone photos), or video.
    const boxSize = Math.min(((b[0] << 24) | (b[1] << 16) | (b[2] << 8) | b[3]) >>> 0, b.length, 256);
    const brands: string[] = [ascii(b, 8, 4)];
    for (let i = 16; i + 4 <= boxSize; i += 4) brands.push(ascii(b, i, 4));
    if (brands.some((x) => x === "avif" || x === "avis")) return "avif";
    if (brands.some((x) => ["heic", "heix", "heim", "heis", "hevc", "hevx", "mif1", "msf1"].includes(x))) {
      return new ImageError(`This is an Apple HEIC photo, which browsers cannot read: ${EXPORT_HINT}.`);
    }
    return new ImageError(`This file is a video or another format this page cannot read: ${EXPORT_HINT}.`);
  }
  const text = new TextDecoder("utf-8", { fatal: false }).decode(b.subarray(0, 4096));
  if (/<svg[\s>]/i.test(text) || /^\s*<\?xml[^>]*>\s*(<!--[\s\S]*?-->\s*)*<!DOCTYPE svg/i.test(text)) {
    return new ImageError(`SVG drawings cannot be used as pictures here: ${EXPORT_HINT}.`);
  }
  return new ImageError(`This file is not a picture this page can read: ${EXPORT_HINT}.`);
}

const u16be = (b: Uint8Array, i: number) => (b[i] << 8) | b[i + 1];
const u16le = (b: Uint8Array, i: number) => b[i] | (b[i + 1] << 8);
const u24le = (b: Uint8Array, i: number) => b[i] | (b[i + 1] << 8) | (b[i + 2] << 16);
const u32be = (b: Uint8Array, i: number) => ((b[i] << 24) | (b[i + 1] << 16) | (b[i + 2] << 8) | b[i + 3]) >>> 0;
const i32le = (b: Uint8Array, i: number) => b[i] | (b[i + 1] << 8) | (b[i + 2] << 16) | (b[i + 3] << 24);

/**
 * The stored size from the file's header, so an oversized picture is refused
 * before the browser spends a quarter of a gigabyte decoding it. null when
 * the header is not where expected; the decoded size is checked again anyway.
 */
function headerSize(format: Format, b: Uint8Array): { width: number; height: number } | null {
  const n = b.length;
  switch (format) {
    case "png":
      return n >= 24 ? { width: u32be(b, 16), height: u32be(b, 20) } : null;
    case "gif":
      return n >= 10 ? { width: u16le(b, 6), height: u16le(b, 8) } : null;
    case "bmp": {
      if (n < 26) return null;
      const dib = b[14] | (b[15] << 8);
      if (dib === 12) return { width: u16le(b, 18), height: u16le(b, 20) };
      return { width: Math.abs(i32le(b, 18)), height: Math.abs(i32le(b, 22)) };
    }
    case "webp": {
      if (n < 30) return null;
      const chunk = ascii(b, 12, 4);
      if (chunk === "VP8 ") return { width: u16le(b, 26) & 0x3fff, height: u16le(b, 28) & 0x3fff };
      if (chunk === "VP8L") {
        return {
          width: 1 + (((b[22] & 0x3f) << 8) | b[21]),
          height: 1 + (((b[24] & 0x0f) << 10) | (b[23] << 2) | ((b[22] & 0xc0) >> 6)),
        };
      }
      if (chunk === "VP8X") return { width: 1 + u24le(b, 24), height: 1 + u24le(b, 27) };
      return null;
    }
    case "jpeg": {
      // Walk the segments to the frame header (any SOF but the DHT, JPG and
      // DAC markers that share its range).
      let i = 2;
      while (i + 9 < n) {
        if (b[i] !== 0xff) return null;
        const marker = b[i + 1];
        if (marker === 0xff) {
          i += 1;
          continue;
        }
        if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
          return { width: u16be(b, i + 7), height: u16be(b, i + 5) };
        }
        if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
          i += 2;
          continue;
        }
        if (marker === 0xda) return null;
        i += 2 + u16be(b, i + 2);
      }
      return null;
    }
    case "avif": {
      // The image spatial extent ("ispe") inside the top-level meta box; the
      // largest one is the picture, since a gridded photo also lists its
      // tiles. The search stays inside meta: the pixel data could hold the
      // same four letters by chance.
      let at = 0;
      while (at + 8 <= n) {
        const size = u32be(b, at);
        const kind = ascii(b, at + 4, 4);
        const end = size === 0 ? n : size === 1 ? -1 : at + size;
        if (end < 0 || end <= at) return null;
        if (kind === "meta") {
          let best: { width: number; height: number } | null = null;
          for (let i = at + 8; i + 16 <= Math.min(end, n); i += 1) {
            if (b[i] === 0x69 && b[i + 1] === 0x73 && b[i + 2] === 0x70 && b[i + 3] === 0x65) {
              const width = u32be(b, i + 8);
              const height = u32be(b, i + 12);
              if (!best || width * height > best.width * best.height) best = { width, height };
            }
          }
          return best;
        }
        at = end;
      }
      return null;
    }
  }
}

/** A decoded picture the canvas can draw, already turned upright. */
type Decoded = { source: CanvasImageSource; width: number; height: number; release: () => void };

async function decode(blob: Blob): Promise<Decoded> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(blob, { imageOrientation: "from-image" });
      return { source: bitmap, width: bitmap.width, height: bitmap.height, release: () => bitmap.close() };
    } catch {
      // Older engines reject the orientation option or the format; an image
      // element reads both, and it applies EXIF orientation by default.
    }
  }
  const url = URL.createObjectURL(blob);
  const img = new Image();
  const release = () => {
    URL.revokeObjectURL(url);
    img.removeAttribute("src");
  };
  try {
    img.decoding = "async";
    img.src = url;
    await img.decode();
  } catch (err) {
    release();
    throw new ImageError(`This picture could not be read and may be damaged: ${EXPORT_HINT}.`, err);
  }
  return { source: img, width: img.naturalWidth, height: img.naturalHeight, release };
}

/** A canvas to draw on: an OffscreenCanvas where the browser has one (no
 * element in the page, no layout), a detached canvas element otherwise. */
type Surface = {
  ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;
  encode: (type: string, quality: number) => Promise<Blob>;
  release: () => void;
};

function surface(width: number, height: number): Surface {
  if (typeof OffscreenCanvas !== "undefined") {
    try {
      const canvas = new OffscreenCanvas(width, height);
      const ctx = canvas.getContext("2d");
      if (ctx) {
        return {
          ctx,
          encode: (type, quality) => canvas.convertToBlob({ type, quality }),
          // A zero-size canvas hands its pixel memory back right away, which
          // Safari needs: it caps the total canvas memory of a page.
          release: () => {
            canvas.width = 0;
            canvas.height = 0;
          },
        };
      }
    } catch {
      // Fall through to an element.
    }
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new ImageError("This browser could not prepare the picture; try again in another browser.");
  return {
    ctx,
    encode: (type, quality) =>
      new Promise<Blob>((resolve, reject) =>
        canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("toBlob returned nothing"))), type, quality),
      ),
    release: () => {
      canvas.width = 0;
      canvas.height = 0;
    },
  };
}

/** The picture drawn at this size, ready to encode at any quality. JPEG has
 * no alpha, so it gets a white ground: transparent pixels would turn black. */
function draw(picture: Decoded, width: number, height: number, type: "image/webp" | "image/jpeg"): Surface {
  const s = surface(width, height);
  try {
    s.ctx.imageSmoothingEnabled = true;
    s.ctx.imageSmoothingQuality = "high";
    if (type === "image/jpeg") {
      s.ctx.fillStyle = "#ffffff";
      s.ctx.fillRect(0, 0, width, height);
    }
    s.ctx.drawImage(picture.source, 0, 0, width, height);
    return s;
  } catch (err) {
    s.release();
    throw err;
  }
}

/** The encoded file's own size in pixels, read back from its header. */
async function encodedSize(blob: Blob): Promise<{ width: number; height: number } | null> {
  const head = new Uint8Array(await blob.slice(0, HEAD_BYTES).arrayBuffer());
  const format = sniff(head);
  return format instanceof ImageError ? null : headerSize(format, head);
}

/** "IMG_2041.HEIC" for the label; the name is never written anywhere. */
const label = (name: string) => Array.from(name.trim()).slice(0, 80).join("");

/**
 * The picture as the draft keeps it: WebP (JPEG where the browser cannot
 * write WebP), upright, at most MAX_IMAGE_WIDTH by 2400 pixels and never over
 * MAX_IMAGE_BYTES. Rejects only with an ImageError.
 */
export async function encodeImage(source: Blob, name?: string): Promise<DraftImage> {
  try {
    return await encode(source, name ?? (source instanceof File ? source.name : ""));
  } catch (err) {
    if (err instanceof ImageError) throw err;
    throw new ImageError("This browser could not prepare the picture; try again, or try another browser.", err);
  }
}

async function encode(source: Blob, name: string): Promise<DraftImage> {
  if (source.size > MAX_INPUT_BYTES) {
    throw new ImageError("This picture is over 40 MB: export a smaller copy and drop it again.");
  }
  if (source.size === 0) throw new ImageError(`This file is empty: ${EXPORT_HINT}.`);
  const head = new Uint8Array(await source.slice(0, HEAD_BYTES).arrayBuffer());
  const format = sniff(head);
  if (format instanceof ImageError) throw format;
  const stored = headerSize(format, head);
  if (stored && stored.width * stored.height > MAX_INPUT_PIXELS) {
    throw new ImageError("This picture is over 60 megapixels: export a smaller copy and drop it again.");
  }

  const picture = await decode(source);
  // Typed by assertion: TypeScript would otherwise pin it to null in the loop.
  let drawn = null as { key: string; surface: Surface } | null;
  try {
    const { width: w, height: h } = picture;
    if (!w || !h) throw new ImageError(`This picture could not be read and may be damaged: ${EXPORT_HINT}.`);
    if (w * h > MAX_INPUT_PIXELS) {
      throw new ImageError("This picture is over 60 megapixels: export a smaller copy and drop it again.");
    }
    if (w < MIN_SIDE || h < MIN_SIDE) {
      throw new ImageError(`This picture is under ${MIN_SIDE} pixels on a side, too small to show in a post.`);
    }

    const fit = Math.min(1, MAX_IMAGE_WIDTH / w, MAX_HEIGHT / h);
    let width = Math.max(1, Math.round(w * fit));
    let height = Math.max(1, Math.round(h * fit));
    let type: "image/webp" | "image/jpeg" = (await canWriteWebp()) ? "image/webp" : "image/jpeg";
    let ladder = type === "image/webp" ? WEBP_QUALITY : JPEG_QUALITY;
    let step = 0;

    for (let encodes = 0; encodes < MAX_ENCODES; encodes += 1) {
      // A lower quality encodes the same drawing again; a new size or type
      // draws afresh from the decoded picture, never from a smaller copy.
      const key = `${width}x${height} ${type}`;
      if (drawn?.key !== key) {
        drawn?.surface.release();
        drawn = null;
        drawn = { key, surface: draw(picture, width, height, type) };
      }
      const blob = await drawn.surface.encode(type, ladder[step]);
      if (type === "image/webp" && blob.type !== "image/webp") {
        // The probe said yes and this canvas wrote something else anyway:
        // JPEG from here on.
        webpEncodes = Promise.resolve(false);
        type = "image/jpeg";
        ladder = JPEG_QUALITY;
        step = 0;
        continue;
      }
      if (blob.type !== type) {
        throw new ImageError("This browser cannot write pictures in a format the site uses; try another browser.");
      }

      if (blob.size <= MAX_IMAGE_BYTES) {
        const size = (await encodedSize(blob)) ?? { width, height };
        return {
          id: newImageId(),
          blob,
          type,
          width: size.width,
          height: size.height,
          bytes: blob.size,
          name: label(name),
        };
      }
      const over = blob.size / MAX_IMAGE_BYTES;
      if (step < ladder.length - 1) {
        // Far over the cap, the middle quality would not save it either.
        step = over > 2 ? ladder.length - 1 : step + 1;
        continue;
      }
      // The bytes follow the pixel count, so jump as many shrink steps as the
      // overshoot asks for instead of encoding each one.
      const needed = Math.sqrt(1 / over) * 0.95;
      const steps = Math.max(1, Math.ceil(Math.log(needed) / Math.log(SHRINK)));
      const factor = Math.pow(SHRINK, steps);
      width = Math.max(1, Math.round(width * factor));
      height = Math.max(1, Math.round(height * factor));
      if (width < MIN_SIDE || height < MIN_SIDE) break;
    }
    throw new ImageError("This picture could not be made small enough for a post: crop it or export a smaller copy, then drop it again.");
  } finally {
    drawn?.surface.release();
    picture.release();
  }
}
