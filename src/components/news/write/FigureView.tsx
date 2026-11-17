import { useId, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import { canMove, moveBlock } from "./blockMoves";
import { ALT_FIELD, AttrField, BarButton, BarRule, CAPTION_FIELD, MediaBar } from "./MediaParts";
import {
  IconCentre,
  IconDown,
  IconFull,
  IconSwap,
  IconTrash,
  IconUp,
  IconWrapLeft,
  IconWrapRight,
  IconZoom,
} from "./WriterIcons";
import { useDraftImage, useWriter } from "./writerContext";
import type { FigureAttrs } from "./types";

/** A narrow figure's cap on the published page (PostBody NARROW_REM). */
const NARROW_REM = 24;
/** A wrapped figure's share of the reading column: the range PostBody lays out. */
const SPAN_MIN = 0.25;
const SPAN_MAX = 0.65;

/**
 * A picture in the text, as the published page will show it. By default it
 * sits beside the text, which flows around it; a writer drags it to another
 * place (the half of the column it is dropped on is the side it takes),
 * resizes it by its inner corner, or uses its bar: left, right, small on its
 * own line, full width, up, down, zoom, replace, remove. Under it are its
 * caption and its description (the alt text), the one thing a figure must
 * have before the post can be sent.
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
  const wrapped = attrs.wrap === "left" || attrs.wrap === "right";
  const narrow = !wrapped && attrs.size === "narrow";
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

  // The corner handle. Beside the text it sets the picture's share of the
  // column, live; on its own line the picture follows the pointer and
  // settles on the nearer of the two widths the post page has.
  const startResize = (e: ReactPointerEvent<HTMLSpanElement>) => {
    const frame = frameRef.current;
    const outer = frame?.closest<HTMLElement>(".rr-media");
    const body = frame?.closest<HTMLElement>(".rr-write-body");
    if (!frame || !outer || !body) return;
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const column = body.getBoundingClientRect().width;
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const startWidth = (wrapped ? outer : frame).getBoundingClientRect().width;
    let width = startWidth;
    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      if (wrapped) {
        // The handle is on the corner that faces the text.
        width = startWidth + (attrs.wrap === "left" ? dx : -dx);
        const span = Math.min(SPAN_MAX, Math.max(SPAN_MIN, width / column));
        outer.style.setProperty("--span", span.toFixed(3));
      } else {
        // Centred, so it grows on both sides: twice the travel.
        width = Math.min(column, Math.max(8 * rem, startWidth + dx * 2));
        setDragWidth(width);
      }
    };
    const end = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
      if (wrapped) {
        const span = Math.round(Math.min(SPAN_MAX, Math.max(SPAN_MIN, width / column)) * 100) / 100;
        if (span !== attrs.span) updateAttributes({ span });
        return;
      }
      setDragWidth(null);
      const next = width < (NARROW_REM * rem + column) / 2 ? "narrow" : "column";
      if (next !== attrs.size) updateAttributes({ size: next });
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
  };

  const picker = (
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
  );

  if (!found) {
    // Either a picture from pasted text that is still being copied in, or one
    // this browser no longer holds.
    const pending = !!attrs.src;
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
        {picker}
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
            <MediaBar label="Picture" align={attrs.wrap === "right" ? "right" : "left"}>
              <BarButton label="Left, with the text flowing around it" pressed={attrs.wrap === "left"} onClick={() => updateAttributes({ wrap: "left" })}>
                <IconWrapLeft />
              </BarButton>
              <BarButton label="Right, with the text flowing around it" pressed={attrs.wrap === "right"} onClick={() => updateAttributes({ wrap: "right" })}>
                <IconWrapRight />
              </BarButton>
              <BarButton
                label="Small, on its own line (two in a row share the line)"
                pressed={narrow}
                onClick={() => updateAttributes({ wrap: "none", size: "narrow" })}
              >
                <IconCentre />
              </BarButton>
              <BarButton
                label="Full width, on its own line"
                pressed={!wrapped && !narrow}
                onClick={() => updateAttributes({ wrap: "none", size: "column" })}
              >
                <IconFull />
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
                <IconZoom />
              </BarButton>
              <BarButton label="Replace the picture" onClick={() => fileRef.current?.click()}>
                <IconSwap />
              </BarButton>
              <BarButton label="Remove the picture" onClick={deleteNode}>
                <IconTrash />
              </BarButton>
            </MediaBar>
            <span
              aria-hidden="true"
              onPointerDown={startResize}
              className={`rr-resize-handle absolute -bottom-1.5 z-10 h-4 w-4 rounded-[2px] border-2 border-paper-50 bg-rr-violet coarse:hidden ${
                attrs.wrap === "right" ? "-left-1.5 cursor-nesw-resize" : "-right-1.5 cursor-nwse-resize"
              }`}
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
          <span className="flex flex-wrap items-baseline gap-x-3">
            <span id={altHelp} className="shrink-0 font-mono text-eyebrow uppercase tracking-[0.14em] text-text-muted">
              Describe it
            </span>
            <AttrField
              value={attrs.alt}
              onCommit={(alt) => updateAttributes({ alt })}
              label="Describe the picture for readers who cannot see it"
              placeholder={altMissing ? "Needed before you send" : "What the picture shows"}
              maxLength={500}
              missing={altMissing}
              describedBy={altHelp}
              className={`${ALT_FIELD} flex-1 basis-32`}
            />
          </span>
        </figcaption>
      ) : (
        attrs.caption && <figcaption className="mt-3 font-mono text-small text-text-muted">{attrs.caption}</figcaption>
      )}

      {picker}
    </NodeViewWrapper>
  );
}
