import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useEditorState, type Editor } from "@tiptap/react";
import { CODE_LANGUAGES, LINK_OK } from "./schema";
import {
  IconBullets,
  IconCode,
  IconCodeBlock,
  IconLink,
  IconNumbers,
  IconPicture,
  IconQuote,
  IconRedo,
  IconRule,
  IconUndo,
  IconVideo,
} from "./WriterIcons";
import { parseYouTube, type YouTubeRef } from "./youtube";

/** One control on the bar. Pressing it must not take the cursor out of the
 * text, so the press itself is swallowed and only the click acts. */
function Tool({
  label,
  hint,
  active,
  disabled,
  onClick,
  children,
  wide = false,
}: {
  label: string;
  /** The keyboard shortcut, shown in the tooltip. */
  hint?: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
  /** A text label rather than an icon. */
  wide?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={hint ? `${label} (${hint})` : label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`inline-flex h-9 shrink-0 cursor-pointer items-center justify-center rounded-btn transition-colors duration-[var(--duration-fast)] disabled:cursor-default disabled:opacity-35 motion-reduce:transition-none coarse:h-11 ${
        wide ? "px-3 text-small font-semibold" : "w-9 coarse:w-11"
      } ${active ? "bg-rr-violet text-white" : "text-text-strong hover:bg-ink-950/[0.06]"}`}
    >
      {children}
    </button>
  );
}

const Rule = () => <span aria-hidden="true" className="mx-1.5 h-5 w-px shrink-0 bg-ink-950/15" />;

const FIELD =
  "h-10 min-w-0 flex-1 rounded-btn border border-ink-950/20 bg-paper-50 px-3 text-small text-text-strong placeholder:text-text-muted focus:border-rr-violet focus:outline-none";
const SMALL_BUTTON =
  "inline-flex h-10 shrink-0 cursor-pointer items-center rounded-btn border border-ink-950/20 px-4 text-small font-semibold text-text-strong hover:border-ink-950/50";

/** What a writer types for a link, as an address the post may carry: a bare
 * "example.org" gets https, an email gets mailto, anything that is not web
 * or mail is refused. */
function normaliseLink(input: string): string | null {
  const text = input.trim();
  if (!text) return null;
  if (/^[^\s@/]+@[^\s@/]+\.[^\s@/]+$/.test(text)) return `mailto:${text}`;
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(text) ? text : `https://${text}`;
  if (!LINK_OK.test(withScheme)) return null;
  try {
    return new URL(withScheme).href;
  } catch {
    return null;
  }
}

type Panel = "link" | "video" | null;

/**
 * The formatting bar: what the text under the cursor is, and the buttons
 * that change it. It only offers what the published post page can show.
 * Links and videos open a one-line form under the bar instead of a browser
 * prompt, so the page never blocks.
 */
export default function WriterToolbar({
  editor,
  onPickImages,
  onAddVideo,
}: {
  editor: Editor;
  /** Open the file picker; the page adds what is chosen at the cursor. */
  onPickImages: () => void;
  onAddVideo: (video: YouTubeRef) => void;
}) {
  const [panel, setPanel] = useState<Panel>(null);
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      block: e.isActive("heading", { level: 2 }) ? "h2" : e.isActive("heading", { level: 3 }) ? "h3" : "p",
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      strike: e.isActive("strike"),
      code: e.isActive("code"),
      link: e.isActive("link"),
      href: (e.getAttributes("link").href as string | undefined) ?? "",
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      codeBlock: e.isActive("codeBlock"),
      language: (e.getAttributes("codeBlock").language as string | null | undefined) ?? "",
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  useEffect(() => {
    if (panel) inputRef.current?.focus();
  }, [panel]);

  const open = (next: Exclude<Panel, null>) => {
    setError("");
    setValue(next === "link" ? state.href : "");
    setPanel(panel === next ? null : next);
  };
  const close = () => {
    setPanel(null);
    editor.commands.focus();
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (panel === "link") {
      const href = normaliseLink(value);
      if (!href) {
        setError("Use a web address (https://...) or an email address.");
        return;
      }
      const chain = editor.chain().focus().extendMarkRange("link");
      // With nothing selected the address itself becomes the linked text.
      if (editor.state.selection.empty && !state.link) {
        chain.insertContent({ type: "text", text: value.trim(), marks: [{ type: "link", attrs: { href } }] }).run();
      } else {
        chain.setLink({ href }).run();
      }
      setPanel(null);
      return;
    }
    const video = parseYouTube(value);
    if (!video) {
      setError("Paste a YouTube link, like https://www.youtube.com/watch?v=...");
      return;
    }
    onAddVideo(video);
    setPanel(null);
  };

  const cmd = () => editor.chain().focus();

  return (
    <div className="border-y border-ink-950/10 bg-paper-50/95 backdrop-blur-sm">
      <div
        role="toolbar"
        aria-label="Text formatting"
        aria-controls="post-text"
        className="mx-auto flex max-w-page items-center gap-0.5 overflow-x-auto px-6 py-1.5 [scrollbar-width:thin]"
      >
        <Tool label="Plain text" wide active={state.block === "p" && !state.codeBlock} onClick={() => cmd().setParagraph().run()}>
          Text
        </Tool>
        <Tool label="Heading" wide active={state.block === "h2"} onClick={() => cmd().toggleHeading({ level: 2 }).run()}>
          Heading
        </Tool>
        <Tool label="Subheading" wide active={state.block === "h3"} onClick={() => cmd().toggleHeading({ level: 3 }).run()}>
          Subheading
        </Tool>
        <Rule />
        <Tool label="Bold" hint="Ctrl+B" active={state.bold} onClick={() => cmd().toggleBold().run()}>
          <span className="font-display text-[1.05rem] font-semibold">B</span>
        </Tool>
        <Tool label="Italic" hint="Ctrl+I" active={state.italic} onClick={() => cmd().toggleItalic().run()}>
          <span className="font-serif text-[1.1rem] italic">I</span>
        </Tool>
        <Tool label="Strikethrough" active={state.strike} onClick={() => cmd().toggleStrike().run()}>
          <span className="text-[1.05rem] line-through">S</span>
        </Tool>
        <Tool label="Inline code" hint="Ctrl+E" active={state.code} onClick={() => cmd().toggleCode().run()}>
          <IconCode />
        </Tool>
        <Tool label="Link" active={state.link || panel === "link"} onClick={() => open("link")}>
          <IconLink />
        </Tool>
        <Rule />
        <Tool label="Bulleted list" active={state.bullet} onClick={() => cmd().toggleBulletList().run()}>
          <IconBullets />
        </Tool>
        <Tool label="Numbered list" active={state.ordered} onClick={() => cmd().toggleOrderedList().run()}>
          <IconNumbers />
        </Tool>
        <Tool label="Quote" active={state.quote} onClick={() => cmd().toggleBlockquote().run()}>
          <IconQuote />
        </Tool>
        <Tool label="Code block" active={state.codeBlock} onClick={() => cmd().toggleCodeBlock().run()}>
          <IconCodeBlock />
        </Tool>
        {state.codeBlock && (
          <label className="ml-1 flex shrink-0 items-center gap-2 font-mono text-small text-text-muted">
            <span className="sr-only">Code language</span>
            <select
              value={CODE_LANGUAGES.some((l) => l.value === state.language) ? state.language : ""}
              onChange={(e) => editor.chain().focus().updateAttributes("codeBlock", { language: e.target.value || null }).run()}
              className="h-9 cursor-pointer rounded-btn border border-ink-950/20 bg-paper-50 px-2 text-small text-text-strong coarse:h-11"
            >
              {CODE_LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </label>
        )}
        <Tool label="Divider line" onClick={() => cmd().setHorizontalRule().run()}>
          <IconRule />
        </Tool>
        <Rule />
        <Tool label="Add pictures" wide onClick={onPickImages}>
          <span className="flex items-center gap-2">
            <IconPicture />
            Picture
          </span>
        </Tool>
        <Tool label="Add a YouTube video" wide active={panel === "video"} onClick={() => open("video")}>
          <span className="flex items-center gap-2">
            <IconVideo />
            Video
          </span>
        </Tool>
        <Rule />
        <Tool label="Undo" hint="Ctrl+Z" disabled={!state.canUndo} onClick={() => cmd().undo().run()}>
          <IconUndo />
        </Tool>
        <Tool label="Redo" hint="Ctrl+Shift+Z" disabled={!state.canRedo} onClick={() => cmd().redo().run()}>
          <IconRedo />
        </Tool>
      </div>

      {panel && (
        <form
          onSubmit={submit}
          onKeyDown={(e) => {
            if (e.key === "Escape") close();
          }}
          className="mx-auto flex max-w-page flex-wrap items-center gap-2 border-t border-ink-950/10 px-6 py-2"
        >
          <label htmlFor="writer-panel-input" className="font-mono text-small text-text-muted">
            {panel === "link" ? "Link to" : "YouTube link"}
          </label>
          <input
            ref={inputRef}
            id="writer-panel-input"
            type="text"
            inputMode="url"
            autoComplete="off"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError("");
            }}
            placeholder={panel === "link" ? "https://" : "https://www.youtube.com/watch?v=..."}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "writer-panel-error" : undefined}
            className={`${FIELD} max-w-[36rem]`}
          />
          <button type="submit" className={`${SMALL_BUTTON} border-rr-violet bg-rr-violet text-white hover:border-rr-violet-deep hover:bg-rr-violet-deep`}>
            {panel === "link" ? "Apply" : "Add video"}
          </button>
          {panel === "link" && state.link && (
            <button
              type="button"
              className={SMALL_BUTTON}
              onClick={() => {
                editor.chain().focus().extendMarkRange("link").unsetLink().run();
                setPanel(null);
              }}
            >
              Remove link
            </button>
          )}
          <button type="button" className={SMALL_BUTTON} onClick={close}>
            Cancel
          </button>
          {error && (
            <p id="writer-panel-error" role="alert" className="w-full text-small text-rr-magenta-deep">
              {error}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
