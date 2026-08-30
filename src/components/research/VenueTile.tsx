import type { Publication } from "../../lib/data";
import { typeLabel, venueTile } from "../../lib/publications";

/**
 * The generated tile that stands in for a figure nobody could extract.
 *
 * It has to sit next to real figures without reading as a hole, so it is
 * built from the page's own structural language rather than from a graphic:
 * a miniature section header - mono eyebrow with the 4px index marker over a
 * display-type subject - laid over hairline column guides. Decorative (the
 * card states the same facts in text), so it is hidden from assistive
 * technology exactly like a figure with an empty alt.
 */
export default function VenueTile({ publication }: { publication: Publication }) {
  const { token, long } = venueTile(publication);
  return (
    <div aria-hidden="true" className="relative h-full w-full overflow-hidden bg-paper-100">
      <div className="absolute inset-0 grid grid-cols-6">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className={i === 0 ? "" : "border-l border-ink-950/[0.07]"} />
        ))}
      </div>
      <div className="relative flex h-full flex-col justify-between p-5">
        <span className="flex items-center gap-2 font-mono text-eyebrow tracking-normal text-text-muted">
          <span className="h-1 w-1 shrink-0 bg-ink-950" />
          <span className="truncate">
            {publication.year} · {typeLabel(publication)}
          </span>
        </span>
        {/* An acronym and a full venue name both have to fill the plate: the
            long form wraps at display size, and only a very long one drops
            to lead size so it cannot outgrow the box. */}
        <span
          className={`block font-display font-semibold text-text-strong ${
            long ? "text-lead leading-tight" : "text-display-m leading-[1.02]"
          }`}
        >
          {token}
        </span>
      </div>
    </div>
  );
}
