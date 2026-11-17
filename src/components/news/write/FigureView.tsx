import { useId, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import { canMove, moveBlock } from "./blockMoves";
import { ALT_FIELD, AttrField, BarButton, BarRule, CAPTION_FIELD, MediaBar } from "./MediaParts";
import { IconDown, IconGrip, IconTrash, IconUp } from "./WriterIcons";
import { useDraftImage, useWriter } from "./writerContext";
import type { FigureAttrs } from "./types";

/** A narrow figure's cap on the published page (PostBody NARROW_REM). */
const NARROW_REM = 24;

/**
 * A picture in the text, as the published page will show it, with what a
 * writer does to one: drag it somewhere else (or step it up and down), make
 * it narrow or column-wide (the corner handle, or the two buttons), swap the
 * file, caption it and describe it. The description is the picture's alt
 * text and the one thing a figure must have before the post can be sent.
 */
export default function FigureView({ node, updateAttributes, selected, editor, getPos, deleteNode }: ReactNodeViewProps) {
  const attrs = node.attrs as FigureAttrs & { src: string | null };
  const found = useDraftImage(attrs.imageId);
  const { addImage, showProblems, notify } = useWriter();
  const fileRef = useRef<HTMLInputElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [dragWidth, setDragWidth] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const altHelp = useId();
  const editable = editor.isEditable;
  const narrow = attrs.size === "narrow";
  const pos = getPos();

  const replace = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      const image = await addImage(file, file.name);
      updateAttributes({ imageId: image.id, src: null });
    } catch (err) {
      notify(err instanceof Error ? err.message : "That picture could not be read.");
    } finally {
      setBusy(false);
    }
  };

  // The corner handle: the picture follows the pointer while it is dragged
  // and settles on the nearer of the two widths the post page has.
  const startResize = (e: ReactPointerEvent<HTMLSpanElement>) => {
    const frame = frameRef.current;
    if (!frame) return;
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startWidth = frame.getBoundingClientRect().width;
    const column = frame.closest(".rr-write-body")?.getBoundingClientRect().width ?? startWidth;
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    let width = startWidth;
    const move = (ev: PointerEvent) => {
      // The picture is centred, so it grows on both sides: twice the travel.
      width = Math.min(column, Math.max(8 * rem, startWidth + (ev.clientX - startX) * 2));
      setDragWidth(width);
    };
    const end = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
      setDragWidth(null);
      const threshold = (NARROW_REM * rem + column) / 2;
      const next = width < threshold ? "narrow" : "column";
      if (next !== attrs.size) updateAttributes({ size: next });
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
  };

  if (!found) {
    // Either a picture from pasted text that is still being copied in, or one
    // this browser no longer holds.
    const pending = !attrs.imageId && !!attrs.src;
    return (
      <NodeViewWrapper as="figure" className="rr-figure" data-selected={selected || undefined}>
        <div className="flex min-h-32 flex-col items-center justify-center gap-3 rounded-media border border-dashed border-ink-950/25 bg-paper-100 p-6 text-center">
          <p className="font-mono text-small text-text-muted" role="status">
            {pending || busy ? "Copying the picture in..." : "This picture is not in this browser any more."}
          </p>
          {editable && !pending && !busy && (
            <p className="flex flex-wrap justify-center gap-4 font-mono text-small">
              <button type="button" className="rr-text-button" onClick={() => fileRef.current?.click()}>
                Choose the file again
              </button>
              <button type="button" className="rr-text-button" onClick={deleteNode}>
                Remove
              </button>
            </p>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            void replace(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </NodeViewWrapper>
    );
  }

  const { image, url } = found;
  const altMissing = showProblems && attrs.alt.trim() === "";

  return (
    <NodeViewWrapper as="figure" className="rr-figure" data-selected={selected || undefined}>
      {/* Never wider than the file itself, as on the published page. */}
      <div
        ref={frameRef}
        className="relative mx-auto"
        style={{ maxWidth: `${image.width / 16}rem`, width: dragWidth !== null ? `${dragWidth}px` : undefined }}
      >
        <div
          data-drag-handle
          className={`rr-figure-frame overflow-hidden rounded-media border border-ink-950/10 bg-paper-100 ${
            editable ? "cursor-grab active:cursor-grabbing" : ""
          }`}
        >
          <img
            src={url}
            alt={attrs.alt}
            width={image.width}
            height={image.height}
            draggable={false}
            decoding="async"
            className={`block h-auto w-full ${busy ? "opacity-50" : ""}`}
          />
        </div>
        {editable && (
          <>
            <MediaBar label="Picture">
              <span aria-hidden="true" className="flex h-9 w-7 items-center justify-center text-text-on-ink-muted coarse:hidden">
                <IconGrip />
              </span>
              <BarButton label="Column width" pressed={!narrow} onClick={() => updateAttributes({ size: "column" })}>
                Wide
              </BarButton>
              <BarButton
                label="Narrow: two narrow pictures in a row share a line"
                pressed={narrow}
                onClick={() => updateAttributes({ size: "narrow" })}
              >
                Narrow
              </BarButton>
              <BarRule />
              <BarButton label="Move up" disabled={!canMove(editor, pos, -1)} onClick={() => moveBlock(editor, getPos(), -1)}>
                <IconUp />
              </BarButton>
              <BarButton label="Move down" disabled={!canMove(editor, pos, 1)} onClick={() => moveBlock(editor, getPos(), 1)}>
                <IconDown />
              </BarButton>
              <BarRule />
              <BarButton
                label="Let readers open this picture full size (for a screenshot with small text)"
                pressed={attrs.zoom}
                onClick={() => updateAttributes({ zoom: !attrs.zoom })}
              >
                Zoom
              </BarButton>
              <BarButton label="Replace the picture" onClick={() => fileRef.current?.click()}>
                Replace
              </BarButton>
              <BarButton label="Remove the picture" onClick={deleteNode}>
                <IconTrash />
              </BarButton>
            </MediaBar>
            <span
              aria-hidden="true"
              onPointerDown={startResize}
              className="rr-resize-handle absolute -bottom-1.5 -right-1.5 z-10 h-4 w-4 cursor-nwse-resize rounded-[2px] border-2 border-paper-50 bg-rr-violet coarse:hidden"
            />
          </>
        )}
      </div>

      {editable ? (
        <figcaption className="mx-auto mt-2 grid gap-1" style={{ maxWidth: `${image.width / 16}rem` }}>
          <AttrField
            value={attrs.caption}
            onCommit={(caption) => updateAttributes({ caption })}
            label="Caption"
            placeholder="Add a caption (optional)"
            maxLength={400}
            className={CAPTION_FIELD}
          />
          <span className="flex items-baseline gap-3">
            <span id={altHelp} className="shrink-0 font-mono text-eyebrow uppercase tracking-[0.14em] text-text-muted">
              Describe it
            </span>
            <AttrField
              value={attrs.alt}
              onCommit={(alt) => updateAttributes({ alt })}
              label="Describe the picture for readers who cannot see it"
              placeholder={altMissing ? "Needed before you send: what does the picture show?" : "What the picture shows, for readers who cannot see it"}
              maxLength={500}
              missing={altMissing}
              className={ALT_FIELD}
            />
          </span>
        </figcaption>
      ) : (
        attrs.caption && <figcaption className="mt-3 font-mono text-small text-text-muted">{attrs.caption}</figcaption>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          void replace(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </NodeViewWrapper>
  );
}
