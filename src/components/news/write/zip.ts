// The submission package is a zip the writer downloads and sends. Its files
// are stored, not compressed: the pictures are WebP or JPEG already, and the
// two text files are a few kilobytes, so deflate would buy nothing and cost
// a dependency. The format is the plain 1989 one (no zip64), which every
// unzip tool and Node reader understands.
//
// Names are flat and plain on purpose. The reader on the other side
// (scripts/publish-post.mjs) only accepts such names, and a path inside a zip
// ("../../src/App.tsx") is the classic way to make an unzip write outside
// its folder; refusing it here means no package this page builds can try.

export type ZipEntry = { name: string; data: Uint8Array };

/** The largest value a 32-bit field can hold without meaning "see zip64". */
const MAX_U32 = 0xffffffff;
const MAX_ENTRIES = 0xffff;
const PLAIN_NAME = /^[A-Za-z0-9._-]{1,100}$/;

/** Language encoding flag: the names are UTF-8 (they are ASCII here anyway). */
const FLAG_UTF8 = 0x0800;
/** 2.0: the version every reader supports. */
const VERSION = 20;
/** Made on Unix, so the mode in the external attributes below is read. */
const MADE_BY = (3 << 8) | VERSION;
/** A regular file, rw-r--r--. */
const FILE_MODE = 0o100644;

let crcTable: Uint32Array | null = null;

/** CRC-32 (the zip and PNG one, polynomial 0xEDB88320). */
function crc32(data: Uint8Array): number {
  if (!crcTable) {
    crcTable = new Uint32Array(256);
    for (let n = 0; n < 256; n += 1) {
      let c = n;
      for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      crcTable[n] = c >>> 0;
    }
  }
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i += 1) crc = crcTable[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

/** MS-DOS time and date, in local time as zip tools expect. The format
 * starts in 1980 and counts seconds in twos. */
function dosDateTime(when: Date): { time: number; date: number } {
  const year = Math.min(Math.max(when.getFullYear(), 1980), 2107);
  const time = (when.getHours() << 11) | (when.getMinutes() << 5) | (when.getSeconds() >> 1);
  const date = ((year - 1980) << 9) | ((when.getMonth() + 1) << 5) | when.getDate();
  return { time, date };
}

/**
 * A zip of these files, stored as they are. Throws on a name that is not
 * flat and plain, on a name used twice (in any letter case: macOS and
 * Windows would write both to one file), and past what the format holds.
 */
export function zipStore(entries: ZipEntry[], modified: Date = new Date()): Blob {
  if (entries.length >= MAX_ENTRIES) throw new Error(`zip: ${entries.length} files is more than a zip without zip64 holds.`);
  const stamp = Number.isNaN(modified.getTime()) ? new Date() : modified;
  const { time, date } = dosDateTime(stamp);
  const encoder = new TextEncoder();
  const seen = new Set<string>();

  const parts: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    const { name, data } = entry;
    if (!PLAIN_NAME.test(name) || name.startsWith(".")) {
      throw new Error(`zip: "${name}" is not a plain file name (letters, digits, dot, dash, underscore; no leading dot).`);
    }
    if (seen.has(name.toLowerCase())) throw new Error(`zip: "${name}" is in the package twice.`);
    seen.add(name.toLowerCase());
    if (!(data instanceof Uint8Array)) throw new Error(`zip: "${name}" has no bytes.`);
    if (data.length >= MAX_U32) throw new Error(`zip: "${name}" is over 4 GB.`);

    const nameBytes = encoder.encode(name);
    const crc = crc32(data);

    const local = new Uint8Array(30 + nameBytes.length);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(4, VERSION, true);
    lv.setUint16(6, FLAG_UTF8, true);
    lv.setUint16(8, 0, true); // method 0: stored
    lv.setUint16(10, time, true);
    lv.setUint16(12, date, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, data.length, true); // compressed size
    lv.setUint32(22, data.length, true); // uncompressed size
    lv.setUint16(26, nameBytes.length, true);
    lv.setUint16(28, 0, true); // no extra field
    local.set(nameBytes, 30);

    const record = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(record.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, MADE_BY, true);
    cv.setUint16(6, VERSION, true);
    cv.setUint16(8, FLAG_UTF8, true);
    cv.setUint16(10, 0, true);
    cv.setUint16(12, time, true);
    cv.setUint16(14, date, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, data.length, true);
    cv.setUint32(24, data.length, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint16(30, 0, true); // extra
    cv.setUint16(32, 0, true); // comment
    cv.setUint16(34, 0, true); // disk
    cv.setUint16(36, 0, true); // internal attributes
    cv.setUint32(38, (FILE_MODE << 16) >>> 0, true);
    cv.setUint32(42, offset, true);
    record.set(nameBytes, 46);

    parts.push(local, data);
    central.push(record);
    offset += local.length + data.length;
    if (offset >= MAX_U32) throw new Error("zip: the package is over 4 GB.");
  }

  const centralSize = central.reduce((sum, r) => sum + r.length, 0);
  if (offset + centralSize + 22 >= MAX_U32) throw new Error("zip: the package is over 4 GB.");

  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(4, 0, true); // this disk
  ev.setUint16(6, 0, true); // disk where the directory starts
  ev.setUint16(8, entries.length, true);
  ev.setUint16(10, entries.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, offset, true);
  ev.setUint16(20, 0, true); // no comment

  return new Blob([...parts, ...central, end], { type: "application/zip" });
}
