import type { OutlineItem, OutlineLabels } from "../../lib/data";
import { YouTubePlayer } from "../ui/YouTubeFacade";
import { Arrow } from "./LearnLink";
import { LINK, fill } from "./learnStyles";

/** "Lecture 3: Rigid body transformations": how a control names its lecture. */
const lectureName = (item: OutlineItem) => `${item.label}: ${item.title}`;

/** The YouTube thumbnail sizes that exist for every lecture recording:
 * mqdefault is 16:9 (320x180); hqdefault is 4:3 (480x360) with the 16:9
 * picture letterboxed, which object-cover crops back to the picture. */
const thumb = (id: string, size: "mq" | "hq") => `https://i.ytimg.com/vi/${id}/${size}default.jpg`;

/** Stroke play triangle and close cross, in the control's colour (no emoji). */
function Glyph({ close = false }: { close?: boolean }) {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true" focusable="false" className="h-3.5 w-3.5 shrink-0">
      <path
        d={close ? "M4 4l8 8M12 4l-8 8" : "M5 3.2v9.6L12.8 8 5 3.2Z"}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type ThumbProps = {
  item: OutlineItem;
  open: boolean;
  onToggle: () => void;
};

/**
 * The picture beside a lecture row. A recorded lecture shows its own YouTube
 * thumbnail (from i.ytimg.com, lazy, sized; the player itself loads only
 * after a click) with a play disc, and a click on it does what Watch does.
 * It is a second mouse target only: out of the tab order and hidden from
 * assistive tech, so the row announces one Watch control (the /news card
 * pattern). A lecture without a recording gets a type tile with its number in
 * the same box, so the pictures line up down the module.
 */
export function LectureThumb({ item, open, onToggle }: ThumbProps) {
  const box = "relative block aspect-video w-full overflow-hidden rounded-media";
  if (!item.video_id) {
    const number = item.label.replace(/^(Lectures?|Tutorial)\s+/, "");
    return (
      <div aria-hidden="true" className={`${box} flex flex-col justify-between bg-rr-violet/[0.07] p-2.5 @md:p-3`}>
        <span className="font-mono text-eyebrow uppercase text-rr-violet-deep">{item.kind}</span>
        <span className="font-display text-lead font-semibold leading-none text-rr-violet-deep @md:text-display-s">
          {number}
        </span>
      </div>
    );
  }
  return (
    <button
      type="button"
      tabIndex={-1}
      aria-hidden="true"
      onClick={onToggle}
      className={`${box} group/thumb cursor-pointer bg-ink-900`}
    >
      <img
        src={thumb(item.video_id, "mq")}
        srcSet={`${thumb(item.video_id, "mq")} 320w, ${thumb(item.video_id, "hq")} 480w`}
        sizes="(min-width: 48rem) 11rem, (min-width: 30rem) 9rem, 6.5rem"
        alt=""
        width={320}
        height={180}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)] group-hover/thumb:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover/thumb:scale-100"
      />
      {/* The disc sits in the corner so the slide's own title stays legible;
          its ring and fill keep it legible over a bright slide. */}
      <span className="absolute bottom-1.5 right-1.5 @md:bottom-2 @md:right-2">
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-full border shadow-card transition-colors duration-[var(--duration-fast)] @md:h-8 @md:w-8 ${
            open
              ? "border-rr-violet bg-rr-violet text-white"
              : "border-ink-950/10 bg-paper-50/95 text-rr-violet-deep group-hover/thumb:border-rr-violet group-hover/thumb:bg-rr-violet group-hover/thumb:text-white"
          }`}
        >
          <Glyph close={open} />
        </span>
      </span>
    </button>
  );
}

type WatchButtonProps = {
  item: OutlineItem;
  /** courses.json outline.ui */
  labels: OutlineLabels;
  open: boolean;
  panelId: string;
  onToggle: () => void;
};

/** The one keyboard and screen-reader control for a recording: a violet
 * outlined pill with a stroke play glyph, filled while its video is open. */
export function WatchButton({ item, labels, open, panelId, onToggle }: WatchButtonProps) {
  const name = lectureName(item);
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-controls={open ? panelId : undefined}
      onClick={onToggle}
      className={`inline-flex items-center gap-2 rounded-pill border border-rr-violet px-3.5 py-1.5 font-mono text-small font-semibold transition-colors duration-[var(--duration-fast)] coarse:min-h-11 coarse:px-4 ${
        open ? "bg-rr-violet text-white hover:bg-rr-violet-deep" : "text-rr-violet-deep hover:bg-rr-violet hover:text-white"
      }`}
    >
      <Glyph close={open} />
      {open ? labels.close : labels.watch}
      <span className="sr-only">{` ${fill(open ? labels.close_name : labels.watch_name, { name })}`}</span>
    </button>
  );
}

/** "Slides" to the lecture's Google Slides deck, in a new tab. */
export function SlidesLink({ item, labels }: { item: OutlineItem; labels: OutlineLabels }) {
  if (!item.slides_url) return null;
  return (
    <a
      href={item.slides_url}
      target="_blank"
      rel="noopener noreferrer"
      className={`${LINK} inline-flex items-center font-mono text-small coarse:min-h-11`}
    >
      {labels.slides}
      <span className="sr-only">{` ${fill(labels.slides_name, { name: lectureName(item) })} (opens in a new tab)`}</span>
      <Arrow out />
    </a>
  );
}

/**
 * The opened recording, under its row: the privacy-enhanced YouTube player,
 * mounted only now (the reader asked for it with a click), so it plays with
 * sound at once; the thumbnail was its poster. Closing the row unmounts it,
 * which stops it. Fades in where @starting-style is supported, instantly
 * under reduced motion.
 */
export function LecturePlayer({ item, labels, id }: { item: OutlineItem; labels: OutlineLabels; id: string }) {
  if (!item.video_id) return null;
  const name = lectureName(item);
  return (
    <div
      id={id}
      className="col-span-full transition-opacity duration-[var(--duration-base)] starting:opacity-0 motion-reduce:transition-none"
    >
      <div className="relative aspect-video overflow-hidden rounded-media bg-ink-950">
        <YouTubePlayer
          videoId={item.video_id}
          title={fill(labels.player_title, { name })}
          poster={{ src: thumb(item.video_id, "mq"), width: 320, height: 180 }}
          playing="click"
          onPlay={() => {}}
        />
      </div>
      <p className="mt-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 font-mono text-small text-text-muted">
        <span>{labels.recorded_note}</span>
        <a
          href={`https://www.youtube.com/watch?v=${item.video_id}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`${LINK} inline-flex items-center coarse:min-h-11`}
        >
          {labels.on_youtube}
          <span className="sr-only"> (opens in a new tab)</span>
          <Arrow out />
        </a>
      </p>
    </div>
  );
}

/**
 * A closed module's preview: its recordings' thumbnails overlapped in a short
 * stack with "4 recorded" under them, so the folded outline already shows
 * which modules can be watched. Decorative (each recording has its own Watch
 * control inside); hidden once the module is open and where the outline is
 * narrower than 48rem.
 */
export function RecordingStack({ items, labels }: { items: OutlineItem[]; labels: OutlineLabels }) {
  const recorded = items.filter((i) => i.video_id);
  if (recorded.length === 0) return null;
  const shown = recorded.slice(0, 4);
  return (
    <span aria-hidden="true" className="hidden shrink-0 flex-col items-end gap-1.5 pt-1 @3xl:flex group-open:hidden">
      <span className="flex">
        {shown.map((i, n) => (
          <img
            key={i.href}
            src={thumb(i.video_id as string, "mq")}
            alt=""
            width={320}
            height={180}
            loading="lazy"
            decoding="async"
            className={`h-10 w-[4.5rem] rounded-media object-cover shadow-card ring-2 ring-paper-50 @5xl:h-[4.5rem] @5xl:w-32 ${n > 0 ? "-ml-5 @5xl:-ml-12" : ""}`}
          />
        ))}
      </span>
      <span className="font-mono text-small text-text-muted">{fill(labels.recorded_count, { n: recorded.length })}</span>
    </span>
  );
}
