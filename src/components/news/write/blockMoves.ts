// Moving a picture or a video without a mouse: dragging is the quick way,
// these are the buttons beside it, and the only way on a touch screen (HTML
// drag and drop does not exist there) or a keyboard.

import type { Editor } from "@tiptap/core";
import { NodeSelection } from "@tiptap/pm/state";

/** Whether the block at `pos` has a neighbour in that direction. */
export function canMove(editor: Editor, pos: number | undefined, dir: -1 | 1): boolean {
  if (pos === undefined) return false;
  const index = editor.state.doc.resolve(pos).index(0);
  return dir === -1 ? index > 0 : index < editor.state.doc.childCount - 1;
}

/** Swap the top-level block at `pos` with the one before or after it, and
 * keep it selected so the same button can be pressed again. */
export function moveBlock(editor: Editor, pos: number | undefined, dir: -1 | 1): void {
  if (pos === undefined || !canMove(editor, pos, dir)) return;
  const { state, view } = editor;
  const index = state.doc.resolve(pos).index(0);
  const node = state.doc.child(index);
  const neighbour = state.doc.child(index + dir);
  const target = dir === -1 ? pos - neighbour.nodeSize : pos + neighbour.nodeSize;
  const tr = state.tr.delete(pos, pos + node.nodeSize).insert(target, node);
  tr.setSelection(NodeSelection.create(tr.doc, target));
  view.dispatch(tr.scrollIntoView());
}

/** The position just after the top-level block that holds `pos`: where a
 * dropped or chosen picture goes, so it never lands inside a sentence. */
export function afterBlockAt(editor: Editor, pos: number): number {
  const { doc } = editor.state;
  const $pos = doc.resolve(Math.min(Math.max(pos, 0), doc.content.size));
  if ($pos.depth === 0) return $pos.pos;
  // An empty paragraph is replaced by the picture rather than left above it.
  const block = $pos.node(1);
  if (block.type.name === "paragraph" && block.content.size === 0) return $pos.before(1);
  return $pos.after(1);
}

/** Put a media node at a top-level position and select it. Replaces an empty
 * paragraph sitting exactly there. */
export function insertMedia(editor: Editor, pos: number, type: "figure" | "video", attrs: Record<string, unknown>): void {
  const { state, view } = editor;
  const node = state.schema.nodes[type].create(attrs);
  const at = Math.min(Math.max(pos, 0), state.doc.content.size);
  const here = state.doc.nodeAt(at);
  const tr =
    here && here.type.name === "paragraph" && here.content.size === 0 && state.doc.resolve(at).depth === 0
      ? state.tr.replaceWith(at, at + here.nodeSize, node)
      : state.tr.insert(at, node);
  tr.setSelection(NodeSelection.create(tr.doc, at));
  view.dispatch(tr.scrollIntoView());
}
