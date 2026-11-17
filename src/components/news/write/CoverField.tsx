import { useRef, useState } from "react";
import { imageFilesFrom } from "./images";
import { ALT_FIELD, CAPTION_FIELD } from "./MediaParts";
import { IconPicture } from "./WriterIcons";
import { useDraftImage, useWriter } from "./writerContext";
import type { DraftMeta } from "./types";

type Cover = NonNullable<DraftMeta["cover"]>;

/**
 * The post's cover: the picture beside the headline, and the one its card
 * on the news page shows. An empty well to drop a file on (or press, for a
 * file picker), then the picture with its caption and description.
 */
export default function CoverField({ cover, onChange }: { cover: Cover | null; onChange: (cover: Cover | null) => void }) {
  const { addImage, notify, showProblems } = useWriter();
  const found = useDraftImage(cover?.imageId ?? "");
  const fileRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);

  const take = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      const image = await addImage(file, file.name);
      onChange({ imageId: image.id, alt: cover?.alt ?? "", caption: cover?.caption ?? "" });
    } catch (err) {
      notify(err instanceof Error ? err.message : "That picture could not be read.");
    } finally {
      setBusy(false);
    }
  };

  const drop = {
    onDragOver: (e: React.DragEvent) => {
      if (!e.dataTransfer.types.includes("Files")) return;
      e.preventDefault();
      setOver(true);
    },
    onDragLeave: () => setOver(false),
    onDrop: (e: React.DragEvent) => {
      const file = imageFilesFrom(e.dataTransfer)[0];
      if (!file) return;
      e.preventDefault();
      e.stopPropagation();
      setOver(false);
      void take(file);
    },
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
        void take(e.target.files?.[0]);
        e.target.value = "";
      }}
    />
  );

  if (!cover || !found) {
    const lost = !!cover && !found;
    return (
      <div id="post-cover" className="scroll-mt-[calc(var(--spacing-nav)+8rem)]">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          {...drop}
          className={`flex aspect-[4/3] w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-media border border-dashed px-6 text-center transition-colors duration-[var(--duration-fast)] motion-reduce:transition-none ${
            over ? "border-rr-violet bg-rr-violet/10" : "border-ink-950/25 bg-rr-violet/[0.04] hover:border-rr-violet hover:bg-rr-violet/[0.07]"
          }`}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-pill bg-rr-violet/10 text-rr-violet">
            <IconPicture />
          </span>
          <span className="font-display text-[1.125rem] font-semibold text-text-strong">
            {busy ? "Adding the picture..." : lost ? "Choose the cover again" : "Add a cover picture"}
          </span>
          <span className="max-w-[32ch] text-small text-text-muted">
            {lost
              ? "This browser no longer holds the file."
              : "Drop a picture here or press to choose one. It sits beside the headline and on the post's card."}
          </span>
        </button>
        {picker}
      </div>
    );
  }

  const altMissing = showProblems && cover.alt.trim() === "";
  return (
    <figure id="post-cover" className="group/cover scroll-mt-[calc(var(--spacing-nav)+8rem)]" {...drop}>
      <div className={`relative overflow-hidden rounded-media border bg-paper-100 ${over ? "border-rr-violet" : "border-ink-950/10"}`}>
        <img
          src={found.url}
          alt={cover.alt}
          width={found.image.width}
          height={found.image.height}
          decoding="async"
          className={`block h-auto w-full ${busy ? "opacity-50" : ""}`}
        />
        <div className="absolute left-2 top-2 flex gap-0.5 rounded-btn bg-ink-950/90 p-1 font-mono text-small text-text-on-ink opacity-0 transition-opacity duration-[var(--duration-fast)] focus-within:opacity-100 group-hover/cover:opacity-100 motion-reduce:transition-none [@media(hover:none)]:opacity-100">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="h-9 cursor-pointer rounded-btn px-2 hover:bg-text-on-ink/15 focus-visible:outline-text-on-ink coarse:h-11"
          >
            Replace
          </button>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="h-9 cursor-pointer rounded-btn px-2 hover:bg-text-on-ink/15 focus-visible:outline-text-on-ink coarse:h-11"
          >
            Remove
          </button>
        </div>
      </div>
      <figcaption className="mt-2 grid gap-1">
        <input
          type="text"
          value={cover.caption}
          onChange={(e) => onChange({ ...cover, caption: e.target.value })}
          aria-label="Cover caption"
          placeholder="Add a caption (optional)"
          maxLength={400}
          autoComplete="off"
          className={CAPTION_FIELD}
        />
        <span className="flex items-baseline gap-3">
          <span className="shrink-0 font-mono text-eyebrow uppercase tracking-[0.14em] text-text-muted">Describe it</span>
          <input
            id="post-cover-alt"
            type="text"
            value={cover.alt}
            onChange={(e) => onChange({ ...cover, alt: e.target.value })}
            aria-label="Describe the cover picture for readers who cannot see it"
            aria-invalid={altMissing || undefined}
            placeholder={altMissing ? "Needed before you send: what does the picture show?" : "What the picture shows, for readers who cannot see it"}
            maxLength={500}
            autoComplete="off"
            className={ALT_FIELD}
          />
        </span>
      </figcaption>
      {picker}
    </figure>
  );
}
