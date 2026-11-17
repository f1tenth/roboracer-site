import { useEffect } from "react";
import { NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import { canMove, moveBlock } from "./blockMoves";
import { ALT_FIELD, AttrField, BarButton, BarRule, CAPTION_FIELD, MediaBar } from "./MediaParts";
import { IconDown, IconGrip, IconTrash, IconUp } from "./WriterIcons";
import { useWriter } from "./writerContext";
import { probeHd, youTubeThumb } from "./youtube";
import type { VideoAttrs } from "./types";

/**
 * A YouTube video in the text. While writing it is its thumbnail and a play
 * mark: nothing else loads from YouTube here, and the published page keeps
 * the same rule until a reader presses play. The title is the player's name
 * for screen readers, so it is required like a picture's description.
 */
export default function VideoView({ node, updateAttributes, selected, editor, getPos, deleteNode }: ReactNodeViewProps) {
  const attrs = node.attrs as VideoAttrs;
  const { showProblems } = useWriter();
  const editable = editor.isEditable;
  const pos = getPos();
  const titleMissing = showProblems && attrs.title.trim() === "";

  // Ask once whether this video has a full-size thumbnail, and remember the
  // answer on the block (outside the undo history: it is not an edit).
  useEffect(() => {
    if (attrs.hd || attrs.portrait || !editor.isEditable) return;
    let live = true;
    void probeHd(attrs.videoId).then((hd) => {
      const at = getPos();
      if (!live || !hd || at === undefined) return;
      const node = editor.state.doc.nodeAt(at);
      if (node?.type.name !== "video" || node.attrs.videoId !== attrs.videoId) return;
      editor.view.dispatch(editor.state.tr.setNodeAttribute(at, "hd", true).setMeta("addToHistory", false));
    });
    return () => {
      live = false;
    };
  }, [attrs.videoId, attrs.hd, attrs.portrait, editor, getPos]);
  // A Short is shown narrow, like a portrait photo (and pairs like one).
  const cap = attrs.portrait ? "24rem" : undefined;

  return (
    <NodeViewWrapper as="figure" className="rr-figure" data-selected={selected || undefined}>
      <div className="relative mx-auto" style={{ maxWidth: cap }}>
        <div
          data-drag-handle
          className={`rr-figure-frame relative overflow-hidden rounded-media border border-ink-950/10 bg-ink-950 ${
            editable ? "cursor-grab active:cursor-grabbing" : ""
          }`}
          style={{ aspectRatio: attrs.portrait ? "9 / 16" : "16 / 9" }}
        >
          <img
            src={youTubeThumb(attrs.videoId, attrs.portrait, attrs.hd)}
            alt=""
            draggable={false}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-pill bg-ink-950/75"
          >
            <svg viewBox="0 0 20 20" className="ml-0.5 h-6 w-6 fill-text-on-ink">
              <path d="M6 4v12l10-6z" />
            </svg>
          </span>
        </div>
        {editable && (
          <MediaBar label="Video">
            <span aria-hidden="true" className="flex h-9 w-7 items-center justify-center text-text-on-ink-muted coarse:hidden">
              <IconGrip />
            </span>
            <BarButton label="A wide video (16:9)" pressed={!attrs.portrait} onClick={() => updateAttributes({ portrait: false })}>
              Wide
            </BarButton>
            <BarButton
              label="A vertical video (a Short): shown narrow, like a portrait photo"
              pressed={attrs.portrait}
              onClick={() => updateAttributes({ portrait: true })}
            >
              Vertical
            </BarButton>
            <BarRule />
            <BarButton label="Move up" disabled={!canMove(editor, pos, -1)} onClick={() => moveBlock(editor, getPos(), -1)}>
              <IconUp />
            </BarButton>
            <BarButton label="Move down" disabled={!canMove(editor, pos, 1)} onClick={() => moveBlock(editor, getPos(), 1)}>
              <IconDown />
            </BarButton>
            <BarRule />
            <BarButton label="Remove the video" onClick={deleteNode}>
              <IconTrash />
            </BarButton>
          </MediaBar>
        )}
      </div>

      {editable ? (
        <figcaption className="mx-auto mt-2 grid gap-1" style={{ maxWidth: cap }}>
          <AttrField
            value={attrs.caption}
            onCommit={(caption) => updateAttributes({ caption })}
            label="Caption"
            placeholder="Add a caption (optional)"
            maxLength={400}
            className={CAPTION_FIELD}
          />
          <span className="flex items-baseline gap-3">
            <span className="shrink-0 font-mono text-eyebrow uppercase tracking-[0.14em] text-text-muted">Title</span>
            <AttrField
              value={attrs.title}
              onCommit={(title) => updateAttributes({ title })}
              label="The video's title"
              placeholder={titleMissing ? "Needed before you send: the video's title" : "The video's title, as on YouTube"}
              maxLength={200}
              missing={titleMissing}
              className={ALT_FIELD}
            />
          </span>
        </figcaption>
      ) : (
        attrs.caption && <figcaption className="mt-3 font-mono text-small text-text-muted">{attrs.caption}</figcaption>
      )}
    </NodeViewWrapper>
  );
}
