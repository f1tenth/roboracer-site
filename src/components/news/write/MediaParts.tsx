import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * A text field inside a figure or a video block. It keeps its own text while
 * the writer types and hands it to the document a moment later (and at once
 * on leaving the field), so a caption is one step to undo, not one per
 * letter, and a draft saved mid-word still has the caption.
 */
export function AttrField({
  value,
  onCommit,
  label,
  placeholder,
  className,
  maxLength,
  missing = false,
  describedBy,
}: {
  value: string;
  onCommit: (value: string) => void;
  /** The field's accessible name. */
  label: string;
  placeholder: string;
  className: string;
  maxLength: number;
  /** Required and still empty, after the writer asked to submit. */
  missing?: boolean;
  describedBy?: string;
}) {
  const [text, setText] = useState(value);
  const focused = useRef(false);
  const timer = useRef<number | undefined>(undefined);
  const latest = useRef(onCommit);
  latest.current = onCommit;

  // The document changed under the field (undo, a paste): follow it, unless
  // the writer is typing in it right now.
  useEffect(() => {
    if (!focused.current) setText(value);
  }, [value]);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const commit = (next: string) => {
    window.clearTimeout(timer.current);
    if (next !== value) latest.current(next);
  };

  return (
    <input
      type="text"
      value={text}
      aria-label={label}
      aria-invalid={missing || undefined}
      aria-describedby={describedBy}
      placeholder={placeholder}
      maxLength={maxLength}
      autoComplete="off"
      spellCheck
      className={className}
      onFocus={() => {
        focused.current = true;
      }}
      onChange={(e) => {
        const next = e.target.value;
        setText(next);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => commit(next), 500);
      }}
      onBlur={() => {
        focused.current = false;
        commit(text);
      }}
      onKeyDown={(e) => {
        // Enter finishes the field; it never submits or adds a line.
        if (e.key === "Enter") {
          e.preventDefault();
          e.currentTarget.blur();
        }
      }}
    />
  );
}

/** One control on a block's own bar. */
export function BarButton({
  label,
  onClick,
  pressed,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  /** A toggle or a choice: violet-filled while on. */
  pressed?: boolean;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      disabled={disabled}
      className={`inline-flex h-9 min-w-9 cursor-pointer items-center justify-center gap-1.5 rounded-btn px-2 font-mono text-small transition-colors duration-[var(--duration-fast)] focus-visible:outline-text-on-ink disabled:cursor-default disabled:opacity-35 motion-reduce:transition-none coarse:h-11 coarse:min-w-11 ${
        pressed ? "bg-rr-violet text-white" : "text-text-on-ink hover:bg-text-on-ink/15"
      }`}
    >
      {children}
    </button>
  );
}

/** A selected picture's or video's own bar. It sits just above the block
 * (never on the picture, which would hide what is being placed), on the side
 * the block is on, and is ink so it reads over the text it covers meanwhile.
 * The padding under it bridges the gap, so the pointer can travel from the
 * picture to a button without the bar going away. */
export function MediaBar({ label, align = "left", children }: { label: string; align?: "left" | "right"; children: ReactNode }) {
  return (
    <div className={`rr-media-bar absolute bottom-full z-20 pb-1.5 ${align === "right" ? "right-0" : "left-0"}`}>
      <div
        role="toolbar"
        aria-label={label}
        className="flex w-max max-w-[min(30rem,calc(100vw-3rem))] flex-wrap items-center gap-0.5 rounded-btn bg-ink-950/95 p-1 shadow-card-hover"
      >
        {children}
      </div>
    </div>
  );
}

export const BarRule = () => <span aria-hidden="true" className="mx-1 h-5 w-px bg-text-on-ink/20" />;

/** The classes the caption and description fields share: they read as the
 * published caption does, with a hairline that shows they can be typed in. */
export const CAPTION_FIELD =
  "w-full border-b border-dashed border-ink-950/20 bg-transparent py-1 font-mono text-small text-text-muted placeholder:text-text-muted/70 focus:border-solid focus:border-rr-violet focus:outline-none coarse:min-h-11";
export const ALT_FIELD =
  "w-full min-w-0 border-b border-dashed border-ink-950/20 bg-transparent py-1 text-small text-text-body placeholder:text-text-muted/70 focus:border-solid focus:border-rr-violet focus:outline-none aria-[invalid=true]:border-solid aria-[invalid=true]:border-rr-magenta-deep coarse:min-h-11";
