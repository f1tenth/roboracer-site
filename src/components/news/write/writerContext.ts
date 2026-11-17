// What the writer page hands to the pieces inside the editor (the figure and
// video blocks are rendered by the editor, not by the page's own JSX, so they
// reach the page through this context).

import { createContext, useContext, useSyncExternalStore } from "react";
import { imageById, imagesVersion, imageUrl, subscribeImages } from "./imageRegistry";
import type { DraftImage } from "./types";

export type WriterContextValue = {
  /** Add a dropped or chosen picture to the draft: re-encoded, kept in this
   * browser, ready to show. Rejects with a sentence for the writer. */
  addImage: (source: Blob, name?: string) => Promise<DraftImage>;
  /** After Submit was pressed once: fields that still need filling say so. */
  showProblems: boolean;
  /** One line for the writer (a picture that could not be read, ...). */
  notify: (message: string) => void;
};

export const WriterContext = createContext<WriterContextValue | null>(null);

export function useWriter(): WriterContextValue {
  const value = useContext(WriterContext);
  if (!value) throw new Error("useWriter outside the writer page");
  return value;
}

/** A draft picture and the URL that shows it; re-renders when it arrives. */
export function useDraftImage(id: string): { image: DraftImage; url: string } | null {
  useSyncExternalStore(subscribeImages, imagesVersion);
  const image = imageById(id);
  const url = imageUrl(id);
  return image && url ? { image, url } : null;
}
