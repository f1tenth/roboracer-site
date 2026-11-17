// The draft lives in this browser until it is sent: there is no server, so a
// closed tab or a crash must not cost the writer their post. IndexedDB holds
// it because it stores the pictures as Blobs (localStorage takes strings and
// a few megabytes at most). One record is the draft itself; each picture is
// its own record, so typing a word rewrites a few kilobytes, not every photo.
//
// Storage can be missing or refuse at any time: a private window, blocked site
// data, a full disk, another tab upgrading the database. Every function here
// rejects with a plain Error in that case, never throws synchronously and
// never waits forever, so the page can say "this draft is not being kept"
// and carry on.

import type { Draft, DraftFact, DraftImage, DraftMeta } from "./types";

const DB_NAME = "roboracer-post-writer";
const DB_VERSION = 1;
const DRAFT_STORE = "draft";
const IMAGE_STORE = "images";
const DRAFT_KEY = "current";
/** Safari has been known to leave an open request unanswered forever. */
const OPEN_TIMEOUT_MS = 3000;
/** A transaction that has not finished by then never will. */
const TRANSACTION_TIMEOUT_MS = 10000;

const UNAVAILABLE = "This browser is not letting the page keep a draft (a private window or blocked site data).";
const BLOCKED = "Another tab of this page holds the draft storage open; close it and reload this page.";
const TIMED_OUT = "The browser's storage did not answer in time.";
const FULL = "This browser has no room left to keep the draft.";
const FAILED = "The browser's storage refused to keep the draft.";
const OUTDATED = "A newer version of this page changed how the draft is kept; reload this page.";

/** A plain Error with the browser's own error attached, for the console. */
const storeError = (message: string, cause?: unknown) => Object.assign(new Error(message), { cause });

const fromDomError = (err: unknown) => {
  const name = err && typeof err === "object" && "name" in err ? String((err as { name: unknown }).name) : "";
  if (name === "QuotaExceededError") return storeError(FULL, err);
  if (name === "VersionError") return storeError(OUTDATED, err);
  if (name === "InvalidStateError" || name === "SecurityError") return storeError(UNAVAILABLE, err);
  return storeError(FAILED, err);
};

/** The one connection this page shares; null until opened, and again after
 * the browser or another tab closes it. */
let connection: Promise<IDBDatabase> | null = null;

function open(): Promise<IDBDatabase> {
  if (connection) return connection;
  const opening = new Promise<IDBDatabase>((resolve, reject) => {
    let settled = false;
    let timer = 0;
    const fail = (err: Error) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      reject(err);
    };
    let request: IDBOpenDBRequest;
    try {
      // Reading the indexedDB property itself throws in a sandboxed frame.
      if (typeof indexedDB === "undefined" || !indexedDB) throw new Error("no indexedDB");
      request = indexedDB.open(DB_NAME, DB_VERSION);
    } catch (err) {
      fail(storeError(UNAVAILABLE, err));
      return;
    }
    timer = window.setTimeout(() => fail(storeError(TIMED_OUT)), OPEN_TIMEOUT_MS);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(DRAFT_STORE)) db.createObjectStore(DRAFT_STORE);
      if (!db.objectStoreNames.contains(IMAGE_STORE)) db.createObjectStore(IMAGE_STORE, { keyPath: "id" });
    };
    request.onsuccess = () => {
      const db = request.result;
      if (settled) {
        // It answered after the timeout or a block: nobody holds this one.
        db.close();
        return;
      }
      settled = true;
      window.clearTimeout(timer);
      const forget = () => {
        if (connection === opening) connection = null;
      };
      // A newer version of the page wants to upgrade: let it, and reopen on
      // the next call (which then fails plainly if this page is out of date).
      db.onversionchange = () => {
        db.close();
        forget();
      };
      // The browser closed it (site data cleared, storage evicted).
      db.onclose = forget;
      resolve(db);
    };
    request.onerror = (event) => {
      // Handled here: without preventDefault Firefox also reports it globally.
      event.preventDefault();
      fail(fromDomError(request.error));
    };
    request.onblocked = () => fail(storeError(BLOCKED));
  });
  connection = opening;
  opening.catch(() => {
    if (connection === opening) connection = null;
  });
  return opening;
}

type StoreName = typeof DRAFT_STORE | typeof IMAGE_STORE;

/**
 * One transaction: `work` queues its requests and returns a function that
 * reads the result once everything has committed. Resolves on complete, so a
 * write that resolves is on disk as far as the browser will say.
 */
async function transact<T>(
  stores: StoreName[],
  mode: IDBTransactionMode,
  work: (tx: IDBTransaction) => () => T,
): Promise<T> {
  for (let attempt = 0; ; attempt += 1) {
    const pending = open();
    const db = await pending;
    let tx: IDBTransaction;
    try {
      tx = db.transaction(stores, mode);
    } catch (err) {
      // The connection closed between open() and here (another tab's
      // upgrade, storage cleared): drop it and open a fresh one, once.
      if (connection === pending) connection = null;
      try {
        db.close();
      } catch {
        // Already closed.
      }
      if (attempt === 0 && err instanceof DOMException && err.name === "InvalidStateError") continue;
      throw fromDomError(err);
    }
    return await new Promise<T>((resolve, reject) => {
      let settled = false;
      const timer = window.setTimeout(() => {
        if (settled) return;
        settled = true;
        try {
          tx.abort();
        } catch {
          // Already finished or aborted.
        }
        reject(storeError(TIMED_OUT));
      }, TRANSACTION_TIMEOUT_MS);
      const fail = (err: Error) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        reject(err);
      };
      let read: () => T;
      tx.oncomplete = () => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        try {
          resolve(read());
        } catch (err) {
          reject(err instanceof Error ? err : storeError(FAILED, err));
        }
      };
      // A failed request aborts the whole transaction (no preventDefault
      // here, which would let the rest of it commit).
      tx.onerror = (event) => fail(fromDomError(tx.error ?? (event.target as IDBRequest | null)?.error));
      tx.onabort = () => fail(fromDomError(tx.error));
      try {
        read = work(tx);
      } catch (err) {
        // A value the store cannot clone (DataCloneError) throws right here.
        try {
          tx.abort();
        } catch {
          // Nothing to undo.
        }
        fail(fromDomError(err));
      }
    });
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const text = (value: unknown) => (typeof value === "string" ? value : "");

/** The fields of the meta that are well formed, the empty value for the
 * rest: a field this version did not write must not cost the writer the
 * whole post. */
function readMeta(value: Record<string, unknown>): DraftMeta {
  const cover = isRecord(value.cover) && typeof value.cover.imageId === "string" && value.cover.imageId
    ? { imageId: value.cover.imageId, alt: text(value.cover.alt), caption: text(value.cover.caption) }
    : null;
  const facts: DraftFact[] = Array.isArray(value.facts)
    ? value.facts.filter(isRecord).map((f) => ({ label: text(f.label), value: text(f.value), href: text(f.href) }))
    : [];
  return {
    title: text(value.title),
    authorName: text(value.authorName),
    authorUrl: text(value.authorUrl),
    authorRole: text(value.authorRole),
    affiliation: text(value.affiliation),
    cover,
    credit: text(value.credit),
    facts,
  };
}

/** The draft as stored, or null for anything that is not a version 1 draft
 * with a Tiptap document in it. */
function readDraft(value: unknown): Draft | null {
  if (!isRecord(value) || value.version !== 1) return null;
  const { updatedAt, meta, doc } = value;
  if (typeof updatedAt !== "number" || !Number.isFinite(updatedAt)) return null;
  if (!isRecord(meta) || !isRecord(doc) || doc.type !== "doc") return null;
  if (doc.content !== undefined && !Array.isArray(doc.content)) return null;
  return { version: 1, updatedAt, meta: readMeta(meta), doc: doc as Draft["doc"] };
}

const isSize = (value: unknown): value is number =>
  typeof value === "number" && Number.isInteger(value) && value > 0;

function readImage(value: unknown): DraftImage | null {
  if (!isRecord(value)) return null;
  const { id, blob, type, width, height, name } = value;
  if (typeof id !== "string" || !id || !(blob instanceof Blob) || blob.size === 0) return null;
  if (type !== "image/webp" && type !== "image/jpeg") return null;
  if (!isSize(width) || !isSize(height)) return null;
  return { id, blob, type, width, height, bytes: blob.size, name: text(name) };
}

/** The draft and its pictures as this browser last kept them. A record that
 * is not well formed is left out, never returned: the page must load even
 * if an older version of it wrote something else. */
export async function loadDraft(): Promise<{ draft: Draft | null; images: DraftImage[] }> {
  return transact([DRAFT_STORE, IMAGE_STORE], "readonly", (tx) => {
    const draft = tx.objectStore(DRAFT_STORE).get(DRAFT_KEY);
    const images = tx.objectStore(IMAGE_STORE).getAll();
    return () => ({
      draft: readDraft(draft.result),
      images: (Array.isArray(images.result) ? images.result : [])
        .map(readImage)
        .filter((image): image is DraftImage => image !== null),
    });
  });
}

/** Keep the draft's text and details (the pictures are kept one by one). */
export async function saveDraft(draft: Draft): Promise<void> {
  if (!readDraft(draft)) throw new Error("saveDraft: not a version 1 draft.");
  return transact([DRAFT_STORE], "readwrite", (tx) => {
    tx.objectStore(DRAFT_STORE).put(draft, DRAFT_KEY);
    return () => undefined;
  });
}

export async function putImage(image: DraftImage): Promise<void> {
  if (!readImage(image)) throw new Error("putImage: not a draft picture.");
  return transact([IMAGE_STORE], "readwrite", (tx) => {
    tx.objectStore(IMAGE_STORE).put(image);
    return () => undefined;
  });
}

export async function deleteImage(id: string): Promise<void> {
  return transact([IMAGE_STORE], "readwrite", (tx) => {
    tx.objectStore(IMAGE_STORE).delete(id);
    return () => undefined;
  });
}

/** Drop the pictures the draft no longer names (removed from the text,
 * replaced as the cover). */
export async function pruneImages(keep: ReadonlySet<string>): Promise<void> {
  return transact([IMAGE_STORE], "readwrite", (tx) => {
    const store = tx.objectStore(IMAGE_STORE);
    const keys = store.getAllKeys();
    keys.onsuccess = () => {
      for (const key of keys.result) {
        if (typeof key !== "string" || !keep.has(key)) store.delete(key);
      }
    };
    return () => undefined;
  });
}

/** Forget the draft and every picture: after a send, or "start over". */
export async function clearDraft(): Promise<void> {
  return transact([DRAFT_STORE, IMAGE_STORE], "readwrite", (tx) => {
    tx.objectStore(DRAFT_STORE).clear();
    tx.objectStore(IMAGE_STORE).clear();
    return () => undefined;
  });
}
