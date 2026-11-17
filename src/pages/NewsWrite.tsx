import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type DragEvent as ReactDragEvent,
} from "react";
import type { JSONContent } from "@tiptap/core";
import type { Slice } from "@tiptap/pm/model";
import { NodeSelection } from "@tiptap/pm/state";
import { EditorContent, useEditor } from "@tiptap/react";
import Button from "../components/ui/Button";
import Section from "../components/ui/Section";
import SectionHeader from "../components/ui/SectionHeader";
import { formatIsoDate } from "../components/news/newsData";
import { WRAP_SPAN } from "../components/news/postData";
import { PostCrumbs } from "../components/news/PostArticle";
import { blockEdgeNear, insertMedia, nextSide } from "../components/news/write/blockMoves";
import CoverField from "../components/news/write/CoverField";
import { clearDraft, loadDraft, pruneImages, putImage, saveDraft } from "../components/news/write/draftStore";
import FactsEditor from "../components/news/write/FactsEditor";
import { allImages, forgetAllImages, imagesVersion, registerImage, subscribeImages } from "../components/news/write/imageRegistry";
import { encodeImage, imageFilesFrom, newImageId } from "../components/news/write/images";
import { checkDraft, usedImageIds } from "../components/news/write/package";
import { cleanPastedHTML, looksLikeMarkdown, markdownToHTML } from "../components/news/write/paste";
import PostPreview from "../components/news/write/PostPreview";
import { writerExtensions } from "../components/news/write/schema";
import SubmitDialog from "../components/news/write/SubmitDialog";
import { EMPTY_META, MAX_IMAGES, type DraftMeta } from "../components/news/write/types";
import { WriterContext, type WriterContextValue } from "../components/news/write/writerContext";
import WriterToolbar from "../components/news/write/WriterToolbar";
import { parseYouTube, type YouTubeRef } from "../components/news/write/youtube";
import "../components/news/write/write.css";

const EMPTY_DOC: JSONContent = { type: "doc", content: [{ type: "paragraph" }] };
const WORDS_PER_MINUTE = 220;
/** Where a jump inside the page lands: under the nav and the two sticky bars. */
const UNDER_BARS = "scroll-mt-[calc(var(--spacing-nav)+8rem)]";

const pad = (n: number) => String(n).padStart(2, "0");
const clock = (ms: number) => {
  const d = new Date(ms);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const today = () => {
  const d = new Date();
  return formatIsoDate(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
};

/** A draft closed while a pasted picture was still being copied in holds a
 * figure that names no stored picture: start that copy again on load. */
function restartPending(doc: JSONContent): JSONContent {
  const walk = (node: JSONContent): JSONContent => {
    if (node.type === "figure" && node.attrs?.src) return { ...node, attrs: { ...node.attrs, imageId: "" } };
    return node.content ? { ...node, content: node.content.map(walk) } : node;
  };
  return walk(doc);
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  invalid,
  autoComplete = "off",
  inputMode,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  maxLength: number;
  invalid?: boolean;
  autoComplete?: string;
  inputMode?: "url";
}) {
  return (
    <label htmlFor={id} className="grid gap-1">
      <span className="font-mono text-eyebrow uppercase tracking-[0.14em] text-text-muted">{label}</span>
      <input
        id={id}
        type="text"
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        autoComplete={autoComplete}
        aria-invalid={invalid || undefined}
        className={`${UNDER_BARS} w-full border-b border-ink-950/20 bg-transparent py-1.5 text-body font-semibold text-text-strong placeholder:font-normal placeholder:text-text-muted/70 focus:border-rr-violet focus:outline-none aria-[invalid=true]:border-rr-magenta-deep coarse:min-h-11`}
      />
    </label>
  );
}

/**
 * /news/write: write a post for the news page. A sheet that looks like the
 * published post (headline and byline beside the cover, then the text in the
 * reading column), a formatting bar that offers only what a post can carry,
 * pictures that are dropped in, dragged around and resized, a Preview that
 * is the real post page, and Send post.
 *
 * Nothing on this page talks to a server. The draft lives in this browser
 * (IndexedDB); sending is a file the writer downloads and proposes from
 * their own GitHub account (SubmitDialog).
 */
export default function NewsWrite() {
  const [extensions] = useState(writerExtensions);
  const [meta, setMetaState] = useState<DraftMeta>(EMPTY_META);
  const [loaded, setLoaded] = useState(false);
  const [storage, setStorage] = useState<"ok" | "off">("ok");
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [mode, setMode] = useState<"write" | "preview">("write");
  const [showProblems, setShowProblems] = useState(false);
  const [sending, setSending] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [notice, setNotice] = useState<{ id: number; text: string } | null>(null);
  /** Steps (a few times a second at most) when the text changes. */
  const [tick, setTick] = useState(0);

  const fileRef = useRef<HTMLInputElement>(null);
  const headlineRef = useRef<HTMLTextAreaElement>(null);
  const metaRef = useRef(meta);
  const dirty = useRef(false);
  const tickTimer = useRef<number | undefined>(undefined);

  const bump = useCallback(() => {
    dirty.current = true;
    if (tickTimer.current !== undefined) return;
    tickTimer.current = window.setTimeout(() => {
      tickTimer.current = undefined;
      setTick((t) => t + 1);
    }, 200);
  }, []);
  useEffect(() => () => window.clearTimeout(tickTimer.current), []);

  const setMeta = useCallback((patch: Partial<DraftMeta>) => {
    dirty.current = true;
    setMetaState((m) => {
      const next = { ...m, ...patch };
      metaRef.current = next;
      return next;
    });
  }, []);

  const notify = useCallback((text: string) => setNotice({ id: Date.now(), text }), []);
  useEffect(() => {
    if (!notice) return;
    const t = window.setTimeout(() => setNotice(null), 9000);
    return () => window.clearTimeout(t);
  }, [notice]);

  /** Every picture enters the draft here: re-encoded, shown, kept. */
  const addImage = useCallback<WriterContextValue["addImage"]>(async (source, name) => {
    const image = await encodeImage(source, name);
    registerImage(image);
    putImage(image).catch(() => setStorage("off"));
    return image;
  }, []);

  // The editor's own paste and drop hooks are set once; they reach the
  // current page state through this ref.
  const hooks = useRef<{
    paste: (event: ClipboardEvent) => boolean;
    drop: (event: DragEvent, moved: boolean, slice: Slice) => boolean;
  }>({ paste: () => false, drop: () => false });

  const editor = useEditor({
    extensions,
    content: EMPTY_DOC,
    editorProps: {
      attributes: {
        id: "post-text",
        class: "rr-write-body",
        role: "textbox",
        "aria-multiline": "true",
        "aria-label": "The post's text",
      },
      // Keep a selected picture clear of the nav and the two bars above.
      scrollMargin: { top: 220, bottom: 80, left: 0, right: 0 },
      scrollThreshold: { top: 220, bottom: 80, left: 0, right: 0 },
      transformPastedHTML: cleanPastedHTML,
      handlePaste: (_view, event) => hooks.current.paste(event),
      handleDrop: (_view, event, slice, moved) => hooks.current.drop(event, moved, slice),
    },
    onUpdate: bump,
  });

  const addFiles = useCallback(
    async (files: File[], pos: number) => {
      if (!editor || files.length === 0) return;
      const room = Math.max(0, MAX_IMAGES - usedImageIds({ meta: metaRef.current, doc: editor.getJSON() }).length);
      if (files.length > room) notify(`A post can carry up to ${MAX_IMAGES} pictures.`);
      let at = pos;
      for (const file of files.slice(0, room)) {
        try {
          const image = await addImage(file, file.name);
          // A new picture sits beside the text, on the other side from the
          // one before it. `size` is what it becomes if the writer takes it
          // out of the text: a portrait or a small picture is narrow.
          const size = image.height > image.width * 1.1 || image.width < 720 ? "narrow" : "column";
          at = Math.min(at, editor.state.doc.content.size);
          insertMedia(editor, at, "figure", {
            imageId: image.id,
            alt: "",
            caption: "",
            wrap: nextSide(editor, at),
            span: WRAP_SPAN,
            size,
            zoom: false,
          });
          at += 1;
        } catch (err) {
          notify(err instanceof Error ? err.message : "That picture could not be read.");
        }
      }
    },
    [editor, addImage, notify],
  );

  const addVideo = useCallback(
    (video: YouTubeRef) => {
      if (!editor) return;
      insertMedia(editor, blockEdgeNear(editor, editor.state.selection.from), "video", {
        videoId: video.videoId,
        title: "",
        caption: "",
        portrait: video.portrait,
      });
    },
    [editor],
  );

  hooks.current.paste = (event) => {
    const data = event.clipboardData;
    if (!data || !editor) return false;
    const html = data.getData("text/html");
    const text = data.getData("text/plain");
    const files = imageFilesFrom(data);
    // A copied picture arrives as a file, sometimes with a scrap of HTML
    // that only points back at it: take the file.
    if (files.length > 0 && (!html || !new DOMParser().parseFromString(html, "text/html").body.textContent?.trim())) {
      event.preventDefault();
      void addFiles(files, blockEdgeNear(editor, editor.state.selection.from));
      return true;
    }
    if (!html && text) {
      const single = text.trim();
      const video = /^\S+$/.test(single) ? parseYouTube(single) : null;
      if (video && editor.state.selection.$from.parent.content.size === 0) {
        event.preventDefault();
        addVideo(video);
        return true;
      }
      if (looksLikeMarkdown(text)) {
        event.preventDefault();
        editor.chain().focus().insertContent(markdownToHTML(text)).run();
        return true;
      }
    }
    return false;
  };

  hooks.current.drop = (event, moved, slice) => {
    if (!editor) return false;
    if (moved) {
      // A picture dragged within the text: the editor moves it. If it sits
      // beside the text, the half of the column it was dropped on is the
      // side it takes, so one drag places it.
      const dragged = slice.content.firstChild;
      if (dragged?.type.name === "figure" && dragged.attrs.wrap !== "none") {
        const box = editor.view.dom.getBoundingClientRect();
        const side = event.clientX < box.left + box.width / 2 ? "left" : "right";
        window.setTimeout(() => {
          const { selection } = editor.state;
          if (!(selection instanceof NodeSelection) || selection.node.type.name !== "figure") return;
          if (selection.node.attrs.wrap === "none" || selection.node.attrs.wrap === side) return;
          editor.view.dispatch(editor.state.tr.setNodeAttribute(selection.from, "wrap", side));
        }, 0);
      }
      return false;
    }
    const types = event.dataTransfer?.types ?? [];
    if (!types.includes("Files")) return false;
    event.preventDefault();
    const files = imageFilesFrom(event.dataTransfer);
    if (files.length === 0) {
      notify("Only pictures can be dropped into a post (JPEG, PNG, WebP).");
      return true;
    }
    const hit = editor.view.posAtCoords({ left: event.clientX, top: event.clientY });
    void addFiles(files, blockEdgeNear(editor, hit ? hit.pos : editor.state.doc.content.size, event.clientY));
    return true;
  };

  // ---- The draft: back from this browser on open, saved as it changes ----
  useEffect(() => {
    if (!editor) return;
    let live = true;
    forgetAllImages();
    loadDraft()
      .then(({ draft, images }) => {
        if (!live) return;
        images.forEach(registerImage);
        if (draft) {
          const restored = { ...EMPTY_META, ...draft.meta };
          metaRef.current = restored;
          setMetaState(restored);
          try {
            editor.commands.setContent(restartPending(draft.doc), { emitUpdate: false });
          } catch {
            // A draft this editor cannot read is left behind, not fatal.
          }
          setSavedAt(draft.updatedAt);
        }
        // Pictures no draft names any more (removed in an earlier session).
        pruneImages(new Set(draft ? usedImageIds(draft) : [])).catch(() => undefined);
      })
      .catch(() => live && setStorage("off"))
      .finally(() => {
        if (!live) return;
        setLoaded(true);
        setTick((t) => t + 1);
      });
    return () => {
      live = false;
      forgetAllImages();
    };
  }, [editor]);

  const save = useCallback(async () => {
    if (!editor || !loaded || !dirty.current) return;
    dirty.current = false;
    const now = Date.now();
    try {
      await saveDraft({ version: 1, updatedAt: now, meta: metaRef.current, doc: editor.getJSON() });
      setStorage("ok");
      setSavedAt(now);
    } catch {
      dirty.current = true;
      setStorage("off");
    }
  }, [editor, loaded]);

  useEffect(() => {
    if (!loaded) return;
    const t = window.setTimeout(() => void save(), 700);
    return () => window.clearTimeout(t);
  }, [meta, tick, loaded, save]);

  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden") void save();
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onHide);
    };
  }, [save]);

  // ---- Pictures that came inside pasted text: fetch, re-encode, adopt ----
  useEffect(() => {
    if (!editor) return;
    const jobs: { key: string; src: string }[] = [];
    const tr = editor.state.tr;
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name !== "figure" || !node.attrs.src || node.attrs.imageId) return;
      const key = `pending:${newImageId()}`;
      tr.setNodeAttribute(pos, "imageId", key);
      jobs.push({ key, src: String(node.attrs.src) });
    });
    if (jobs.length === 0) return;
    editor.view.dispatch(tr.setMeta("addToHistory", false));

    const settle = (key: string, attrs: Record<string, unknown> | null) => {
      let at = -1;
      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === "figure" && node.attrs.imageId === key) at = pos;
      });
      if (at < 0) return;
      const node = editor.state.doc.nodeAt(at);
      if (!node) return;
      const next = attrs
        ? editor.state.tr.setNodeMarkup(at, undefined, { ...node.attrs, ...attrs })
        : editor.state.tr.delete(at, at + node.nodeSize);
      editor.view.dispatch(next.setMeta("addToHistory", false));
    };

    let failed = 0;
    void Promise.all(
      jobs.map(async ({ key, src }) => {
        try {
          const res = await fetch(
            src,
            src.startsWith("data:") ? undefined : { mode: "cors", credentials: "omit", referrerPolicy: "no-referrer" },
          );
          if (!res.ok) throw new Error(String(res.status));
          const image = await addImage(await res.blob(), "pasted picture");
          const size = image.height > image.width * 1.1 || image.width < 720 ? "narrow" : "column";
          settle(key, { imageId: image.id, src: null, size });
        } catch {
          failed += 1;
          settle(key, null);
        }
      }),
    ).then(() => {
      if (failed > 0)
        notify(
          `${failed === 1 ? "A picture" : `${failed} pictures`} in the pasted text could not be copied in. Save ${
            failed === 1 ? "it" : "them"
          } to your computer and drop ${failed === 1 ? "it" : "them"} here.`,
        );
    });
  }, [tick, editor, addImage, notify]);

  // ---- What the page shows about the draft ----
  useSyncExternalStore(subscribeImages, imagesVersion);
  const pictureVersion = imagesVersion();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- the picture set is read from the registry; its version is the dependency
  const images = useMemo(() => allImages(), [pictureVersion]);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- the editor is one object for the page's life; `tick` is what says its text changed
  const doc = useMemo(() => editor?.getJSON() ?? EMPTY_DOC, [editor, tick]);
  const draft = useMemo(() => ({ meta, doc }), [meta, doc]);
  const words = useMemo(() => {
    const text = editor?.getText({ blockSeparator: " " }) ?? "";
    return text.split(/\s+/).filter(Boolean).length;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- as above
  }, [editor, tick]);
  const minutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE));
  const pictures = useMemo(() => usedImageIds(draft).filter((id) => images.has(id)).length, [draft, images]);
  const outline = useMemo(() => {
    const items: { index: number; label: string }[] = [];
    (doc.content ?? []).forEach((node, index) => {
      if (node.type !== "heading" || node.attrs?.level !== 2) return;
      const label = (node.content ?? [])
        .map((n) => (n as { text?: string }).text ?? "")
        .join("")
        .trim();
      if (label) items.push({ index, label });
    });
    return items;
  }, [doc]);
  const { errors, notes } = useMemo(() => checkDraft(draft, images, words), [draft, images, words]);

  // The headline grows with its text, and again when its lines rewrap (a
  // narrower window, the display font arriving).
  useLayoutEffect(() => {
    const el = headlineRef.current;
    if (!el) return;
    const fit = () => {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    };
    fit();
    const watch = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(fit);
    watch?.observe(el.parentElement ?? el);
    void document.fonts?.ready.then(fit);
    return () => watch?.disconnect();
  }, [meta.title, mode, loaded]);

  const context = useMemo<WriterContextValue>(() => ({ addImage, showProblems, notify }), [addImage, showProblems, notify]);

  const jumpToBlock = (index: number) => {
    if (!editor) return;
    let pos = 0;
    for (let i = 0; i < index; i += 1) pos += editor.state.doc.child(i).nodeSize;
    editor.chain().focus().setTextSelection(pos + 1).scrollIntoView().run();
  };

  /** From the send dialog: take the writer to what still needs them. */
  const goTo = (target: string) => {
    setSending(false);
    setMode("write");
    window.setTimeout(() => {
      if (target === "post-text" && editor) {
        let at = -1;
        editor.state.doc.descendants((node, pos) => {
          if (at >= 0) return false;
          const figure = node.type.name === "figure" && (!images.has(String(node.attrs.imageId)) || !String(node.attrs.alt).trim());
          const video = node.type.name === "video" && !String(node.attrs.title).trim();
          if (figure || video) at = pos;
          return true;
        });
        if (at >= 0) {
          editor.view.dispatch(editor.state.tr.setSelection(NodeSelection.create(editor.state.doc, at)).scrollIntoView());
          editor.view.focus();
        } else {
          editor.commands.focus("start");
        }
        return;
      }
      const el = document.getElementById(target);
      el?.scrollIntoView({ block: "center" });
      el?.focus({ preventScroll: true });
    }, 50);
  };

  const startOver = () => {
    setConfirmReset(false);
    clearDraft().catch(() => undefined);
    forgetAllImages();
    metaRef.current = EMPTY_META;
    setMetaState(EMPTY_META);
    editor?.commands.setContent(EMPTY_DOC, { emitUpdate: false });
    dirty.current = false;
    setSavedAt(null);
    setShowProblems(false);
    setMode("write");
    setTick((t) => t + 1);
    headlineRef.current?.focus();
  };

  // A file dropped anywhere else on the page would make the browser leave
  // it to open that file. The text and the cover take their own drops.
  const guardDrop = (e: ReactDragEvent) => {
    if (e.dataTransfer.types.includes("Files")) e.preventDefault();
  };

  const saveLine =
    storage === "off"
      ? "This browser is not keeping drafts (private window?). Send the post before you close the tab."
      : savedAt
        ? `Draft saved in this browser at ${clock(savedAt)}`
        : "Your draft is kept in this browser as you type";
  const empty = words === 0 && !meta.title && pictures === 0;

  return (
    <WriterContext.Provider value={context}>
      <div className="rr-write pt-nav" onDragOver={guardDrop} onDrop={guardDrop}>
        {mode === "write" && (
          <Section width="page" tight className="compact:pt-4 pb-8 desktop:pb-10" aria-labelledby="write-title">
            <div className="grid gap-8 md:grid-cols-12 md:items-end">
              <div className="md:col-span-8">
                <PostCrumbs label="Write a post" />
                <h1 id="write-title" className="max-w-[16ch] font-display text-display-l font-semibold text-text-strong">
                  Write your own post
                </h1>
                <p className="mt-5 max-w-[60ch] text-lead text-text-body">
                  Tell the community what you built, raced or learned. Write or paste your text, drop in your pictures,
                  and send it to us. A maintainer reads it, then it goes on the news page under your name.
                </p>
              </div>
              <dl className="grid grid-cols-3 gap-x-6 border-t border-ink-950/10 pt-6 font-mono text-small text-text-muted md:col-span-4">
                <div>
                  <dt>Words</dt>
                  <dd className="mt-1 font-display text-display-s font-semibold tabular-nums text-rr-violet">{words}</dd>
                </div>
                <div>
                  <dt>Read</dt>
                  <dd className="mt-1 font-display text-display-s font-semibold tabular-nums text-rr-violet">
                    {words === 0 ? 0 : minutes}
                    <span className="ml-1 font-mono text-small font-normal text-text-muted">min</span>
                  </dd>
                </div>
                <div>
                  <dt>Pictures</dt>
                  <dd className="mt-1 font-display text-display-s font-semibold tabular-nums text-rr-violet">{pictures}</dd>
                </div>
              </dl>
            </div>
          </Section>
        )}

        {/* The two bars that stay on screen: what to do with the post, and
            (while writing) how to shape the text. */}
        <div className="sticky top-nav z-30">
          <div className="border-t border-ink-950/10 bg-paper-50/95 backdrop-blur-sm">
            <div className="mx-auto flex max-w-page flex-wrap items-center gap-x-5 gap-y-2 px-6 py-2">
              <div role="group" aria-label="View" className="flex rounded-btn border border-ink-950/20 p-0.5">
                {(["write", "preview"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    aria-pressed={mode === m}
                    onClick={() => setMode(m)}
                    className={`h-9 cursor-pointer rounded-[3px] px-4 text-small font-semibold transition-colors duration-[var(--duration-fast)] motion-reduce:transition-none coarse:h-11 ${
                      mode === m ? "bg-rr-violet text-white" : "text-text-strong hover:bg-ink-950/[0.06]"
                    }`}
                  >
                    {m === "write" ? "Write" : "Preview"}
                  </button>
                ))}
              </div>
              {/* On a phone the bar is the two things a thumb needs (the
                  view and Send); the save line sits under the sheet. */}
              <p role="status" className="mr-auto min-w-0 font-mono text-small text-text-muted max-sm:hidden">
                {mode === "preview" ? "This is the post as roboracer.ai will show it. The date is set when it is published." : saveLine}
              </p>
              {confirmReset ? (
                <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-small text-text-strong">
                  <span>Delete this draft from this browser?</span>
                  <button type="button" onClick={startOver} className="rr-text-button font-semibold coarse:min-h-11">
                    Delete it
                  </button>
                  <button type="button" onClick={() => setConfirmReset(false)} className="rr-text-button coarse:min-h-11">
                    Keep writing
                  </button>
                </p>
              ) : (
                <>
                  {!empty && (
                    <button type="button" onClick={() => setConfirmReset(true)} className="rr-text-button text-small max-sm:hidden coarse:min-h-11">
                      Start over
                    </button>
                  )}
                  <Button
                    className="max-sm:ml-auto coarse:min-h-11"
                    size="sm"
                    onClick={() => {
                      setShowProblems(true);
                      void save();
                      setSending(true);
                    }}
                  >
                    Send post
                  </Button>
                </>
              )}
            </div>
          </div>
          {mode === "write" && editor && (
            <WriterToolbar editor={editor} onPickImages={() => fileRef.current?.click()} onAddVideo={addVideo} />
          )}
        </div>

        {/* The sheet: the post page's own layout, with fields where the
            published page has text. Kept mounted under Preview so the
            cursor, the undo history and half-typed captions survive. */}
        <div hidden={mode !== "write"} className="bg-paper-100 px-4 pb-section-tight pt-6 sm:px-6 sm:pt-8">
          <div className="relative mx-auto max-w-page rounded-[0.75rem] border border-ink-950/10 bg-paper-50 shadow-card">
            <div
              aria-hidden="true"
              className="h-0.5 rounded-t-[0.75rem] bg-[linear-gradient(90deg,var(--color-rr-cyan),var(--color-rr-grad-start),var(--color-rr-grad-end))]"
            />
            <div className="grid gap-10 p-6 sm:p-10 lg:grid-cols-12 lg:items-end lg:gap-12">
              <div className="lg:col-span-7">
                <p className="mb-6 flex items-center gap-2 font-mono text-small text-text-muted">
                  <span aria-hidden="true" className="h-1 w-1 bg-ink-950" />
                  <span>News</span>
                  <span aria-hidden="true">/</span>
                  <span>Guest post</span>
                </p>
                <textarea
                  ref={headlineRef}
                  id="post-headline"
                  rows={1}
                  value={meta.title}
                  onChange={(e) => setMeta({ title: e.target.value.replace(/\n/g, " ") })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      document.getElementById("post-author")?.focus();
                    }
                  }}
                  placeholder="Your headline"
                  aria-label="Headline"
                  aria-invalid={(showProblems && !meta.title.trim()) || undefined}
                  maxLength={160}
                  className={`rr-headline ${UNDER_BARS} max-w-[20ch] font-display text-display-l font-semibold text-text-strong`}
                />
                <div className="mt-8 grid gap-x-8 gap-y-5 border-t border-ink-950/10 pt-6 sm:grid-cols-2">
                  <Field
                    id="post-author"
                    label="Your name"
                    value={meta.authorName}
                    onChange={(authorName) => setMeta({ authorName })}
                    placeholder="First and last name"
                    maxLength={160}
                    autoComplete="name"
                    invalid={showProblems && !meta.authorName.trim()}
                  />
                  <Field
                    id="post-author-role"
                    label="Role"
                    value={meta.authorRole}
                    onChange={(authorRole) => setMeta({ authorRole })}
                    placeholder="PhD student and team lead"
                    maxLength={160}
                    autoComplete="organization-title"
                  />
                  <Field
                    id="post-affiliation"
                    label="Team or university"
                    value={meta.affiliation}
                    onChange={(affiliation) => setMeta({ affiliation })}
                    placeholder="Where you race or study"
                    maxLength={160}
                    autoComplete="organization"
                  />
                  <Field
                    id="post-author-url"
                    label="Your page (optional)"
                    value={meta.authorUrl}
                    onChange={(authorUrl) => setMeta({ authorUrl })}
                    placeholder="https://github.com/you"
                    maxLength={500}
                    autoComplete="url"
                    inputMode="url"
                    invalid={showProblems && !!meta.authorUrl.trim() && !/^https?:\/\/\S+\.\S+/i.test(meta.authorUrl.trim())}
                  />
                </div>
                <p className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1 font-mono text-small text-text-muted">
                  <span>{today()}</span>
                  <span aria-hidden="true">·</span>
                  <span>{minutes} min read</span>
                </p>
              </div>
              <div className="lg:col-span-5">
                <CoverField cover={meta.cover} onChange={(cover) => setMeta({ cover })} />
              </div>
            </div>

            <div className="border-t border-ink-950/10 p-6 sm:p-10">
              <div className="grid gap-x-12 gap-y-12 xl:grid-cols-[minmax(12.5rem,1fr)_minmax(0,46rem)_minmax(12.5rem,1fr)]">
                <nav
                  aria-label="Outline"
                  className="sticky top-[calc(var(--spacing-nav)+8rem)] hidden self-start xl:block"
                >
                  <p className="mb-3 text-eyebrow font-semibold uppercase tracking-[0.12em] text-text-muted">On this page</p>
                  {outline.length > 0 ? (
                    <ol className="border-l border-ink-950/10">
                      {outline.map((item) => (
                        <li key={item.index}>
                          <button
                            type="button"
                            onClick={() => jumpToBlock(item.index)}
                            className="-ml-px block w-full cursor-pointer border-l-2 border-transparent py-1.5 pl-4 text-left text-small text-text-body hover:border-rr-violet hover:text-text-strong"
                          >
                            {item.label}
                          </button>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="max-w-[22ch] text-small text-text-muted">Your headings show up here, as they will beside the post.</p>
                  )}
                </nav>

                <div className="mx-auto w-full min-w-0 max-w-[46rem]">
                  <EditorContent editor={editor} />
                  <label htmlFor="post-credit" className="mt-8 grid gap-1 border-t border-ink-950/10 pt-6">
                    <span className="font-mono text-eyebrow uppercase tracking-[0.14em] text-text-muted">Picture credit (optional)</span>
                    <input
                      id="post-credit"
                      type="text"
                      value={meta.credit}
                      onChange={(e) => setMeta({ credit: e.target.value })}
                      placeholder="Photos courtesy of ..."
                      maxLength={300}
                      autoComplete="off"
                      className="w-full border-b border-dashed border-ink-950/20 bg-transparent py-1 font-mono text-small text-text-muted placeholder:text-text-muted/70 focus:border-solid focus:border-rr-violet focus:outline-none coarse:min-h-11"
                    />
                  </label>
                </div>

                <div className="mx-auto w-full max-w-[46rem] xl:sticky xl:top-[calc(var(--spacing-nav)+8rem)] xl:mx-0 xl:max-w-[19rem] xl:self-start xl:justify-self-end">
                  <FactsEditor facts={meta.facts} onChange={(facts) => setMeta({ facts })} />
                </div>
              </div>
            </div>
          </div>

          <p className="mx-auto mt-4 flex max-w-page flex-wrap items-baseline justify-between gap-x-6 gap-y-2 px-2 font-mono text-small text-text-muted sm:hidden">
            <span>{saveLine}</span>
            {!empty && (
              <button type="button" onClick={() => setConfirmReset(true)} className="rr-text-button coarse:min-h-11">
                Start over
              </button>
            )}
          </p>
        </div>

        {mode === "preview" && <PostPreview draft={draft} />}

        {mode === "write" && (
          <Section width="page" rule tight aria-labelledby="write-how">
            <SectionHeader eyebrow="How it works" id="write-how" title="From this page to the news page" />
            <ol className="grid gap-x-10 gap-y-8 md:grid-cols-3">
              {[
                {
                  title: "Write",
                  body: "Your draft is saved in this browser as you type. There is no account, and nothing is uploaded while you write.",
                },
                {
                  title: "Send",
                  body: "Send post packs your text and pictures into one file. You propose it from your own GitHub account as a pull request, or email it to us.",
                },
                {
                  title: "We publish",
                  body: "A maintainer reads every post before it is published and may suggest edits. Then it goes on the news page under your name.",
                },
              ].map((step, i) => (
                <li key={step.title} className="border-t border-ink-950/10 pt-5">
                  <p className="font-mono text-small text-rr-violet">0{i + 1}</p>
                  <h3 className="mt-2 font-display text-display-s font-semibold text-text-strong">{step.title}</h3>
                  <p className="mt-3 max-w-[40ch] text-body text-text-body">{step.body}</p>
                </li>
              ))}
            </ol>
          </Section>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            const files = [...(e.target.files ?? [])];
            e.target.value = "";
            if (editor) void addFiles(files, blockEdgeNear(editor, editor.state.selection.from));
          }}
        />

        {notice && (
          <p
            key={notice.id}
            role="status"
            className="fixed bottom-6 left-1/2 z-40 w-[min(36rem,calc(100vw-2rem))] -translate-x-1/2 rounded-btn bg-ink-950 px-5 py-3 text-small text-text-on-ink shadow-card-hover"
          >
            {notice.text}
          </p>
        )}

        <SubmitDialog
          open={sending}
          onClose={() => setSending(false)}
          draft={draft}
          images={images}
          errors={errors}
          notes={notes}
          words={words}
          onGoTo={goTo}
        />
      </div>
    </WriterContext.Provider>
  );
}
