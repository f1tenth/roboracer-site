import { Fragment } from "react";
import Reveal from "../ui/Reveal";
import { YouTubeLoop } from "../ui/YouTubeFacade";
import type { Spinoff, SpinoffImage } from "../../lib/data";

type SpinoffGridProps = {
  spinoffs: Spinoff[];
};

const LINK =
  "underline decoration-ink-950/25 underline-offset-4 hover:decoration-rr-violet hover:decoration-2";

/** A 2.75rem hit area on touch screens, taken back by the negative margin so
 * the line does not move (mobile pass, ABOUT-07). */
const TAP = "coarse:-my-3 coarse:py-3";

const asset = (src: string) => `${import.meta.env.BASE_URL}${src.replace(/^\//, "")}`;

/** An origin still waiting on Cedric reads "TODO(content): ..." in the JSON;
 * the feature leaves the line out rather than print the question. */
const shown = (text: string | null) => (text && !text.startsWith("TODO(content)") ? text : null);

/** Each piece on one line where it fits: a narrow strip then breaks between
 * "Ruda Śląska" and "Oct 4, 2026", or between two sentences, not inside one. */
const pieces = (parts: string[], sep: string) =>
  parts.map((part, i) => (
    <Fragment key={i}>
      {i > 0 && sep}
      <span className="inline-block">{part}</span>
    </Fragment>
  ));

/** "https://www.quanser.com/" -> "quanser.com", for the address bar. */
const domainOf = (url: string) => new URL(url).hostname.replace(/^www\./, "");

/**
 * The company's homepage as a browser window: our own 1280x800 capture under
 * a chrome bar with the domain and a Visit affordance. The whole window is
 * the link to the site. Paper tokens only: the three dots are ink hairline
 * tints, not traffic-light colours.
 */
function SiteWindow({ name, url, preview }: { name: string; url: string; preview: SpinoffImage }) {
  const domain = domainOf(url);
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Visit ${domain}, the ${name} website (opens in a new tab)`}
      className="group/site block overflow-hidden rounded-media border border-ink-950/15 bg-paper-50 shadow-card transition-[box-shadow,translate] duration-[var(--duration-fast)] hover:shadow-card-hover motion-safe:hover:-translate-y-0.5"
    >
      <span className="flex items-center gap-2.5 border-b border-ink-950/10 bg-paper-100 px-3 py-2">
        <span aria-hidden="true" className="flex shrink-0 gap-1">
          <span className="size-1.5 rounded-pill bg-ink-950/20" />
          <span className="size-1.5 rounded-pill bg-ink-950/20" />
          <span className="size-1.5 rounded-pill bg-ink-950/20" />
        </span>
        <span className="min-w-0 flex-1 truncate rounded-pill border border-ink-950/10 bg-paper-50 px-2.5 py-0.5 font-mono text-eyebrow tracking-normal text-text-muted">
          {domain}
        </span>
        <span className="shrink-0 text-small font-semibold text-text-strong underline decoration-ink-950/25 underline-offset-4 group-hover/site:decoration-rr-violet group-hover/site:decoration-2">
          Visit&nbsp;<span aria-hidden="true">&#8599;</span>
        </span>
      </span>
      <img
        src={asset(preview.src)}
        alt={preview.alt}
        width={preview.width}
        height={preview.height}
        loading="lazy"
        decoding="async"
        className="block aspect-[16/10] w-full object-cover object-top"
      />
    </a>
  );
}

/**
 * One related platform as a summarized window onto its website: the
 * company's own car photo, or a video of the car running, is the stage, its
 * homepage sits under the stage as a browser window, and the text says what
 * it makes and, when we have it, how it connects to RoboRacer.
 *
 * Layout follows the card's own width (container query), not the viewport:
 * from 40rem the text and the window sit side by side and the window overlaps
 * the photo (never a video: the window would cover the moving car and the
 * controls); narrower (phones, and the two-up tablet grid) it is one column
 * with the window last, so the visual order is the reading order. A card that
 * spans the whole grid (the odd one out, from 90rem) puts the stage beside
 * the text instead of above it, so a 16:9 stage never runs the page's width.
 */
function SpinoffFeature({ spinoff }: { spinoff: Spinoff }) {
  const { name, kind, label, what, since, url, logo, car, video, preview } = spinoff;
  const origin = shown(spinoff.origin);
  return (
    <article className="group/feature @container flex h-full min-w-0 flex-col overflow-hidden rounded-card border border-ink-950/10 bg-paper-50">
      <div className="flex flex-1 flex-col @[90rem]:grid @[90rem]:grid-cols-2">
        {/* The heading comes first in the DOM; the photo is moved above it
            with `order`, so a screen reader meets the name before the car. */}
        <div className="order-2 flex flex-1 flex-col gap-6 p-5 sm:p-6 @[40rem]:grid @[40rem]:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] @[40rem]:items-start @[40rem]:gap-x-8 @[90rem]:col-start-2 @[90rem]:row-start-1">
          <div className="flex h-full min-w-0 flex-col">
            <p className="font-mono text-eyebrow tracking-normal text-text-muted">
              {label ?? kind}
              {since && <span className="tabular-nums"> · since {since}</span>}
            </p>
            <div className="mt-3 flex items-center gap-3">
              {logo && (
                <img
                  src={asset(logo.src)}
                  alt={logo.alt}
                  width={logo.width}
                  height={logo.height}
                  loading="lazy"
                  decoding="async"
                  className="h-8 w-auto shrink-0 object-contain"
                />
              )}
              <h3 className="min-w-0 font-display text-display-s font-semibold text-text-strong">{name}</h3>
            </div>
            <p className="mt-4 max-w-[48ch] text-body text-text-body">{what}</p>
            {origin && (
              <div className="mt-5 border-t border-ink-950/10 pt-4">
                <p className="font-mono text-eyebrow tracking-normal text-text-muted">and RoboRacer</p>
                <p className="mt-1.5 max-w-[48ch] text-small text-text-body">{origin}</p>
              </div>
            )}
            {/* Under the text at one rhythm on every card, not pushed to the
                card's foot: a card without the origin line left 7rem of
                blank above its link. */}
            {(car || video) && (
              <p className="pt-6 text-small">
                <a
                  href={car ? car.url : video?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-block font-semibold text-text-strong ${TAP} ${LINK}`}
                >
                  {car ? `See the ${car.name}` : "Watch the lap on YouTube"}
                  <span aria-hidden="true">&nbsp;&#8599;</span>
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </p>
            )}
          </div>
          {preview && (
            // From 40rem the window climbs 6rem into the photo above it; not
            // into a video, and not when the stage sits beside it.
            <Reveal
              delay={0.15}
              className={`relative z-10 ${video ? "" : "@[40rem]:-mt-24 @[90rem]:mt-0"}`}
            >
              <SiteWindow name={name} url={url} preview={preview} />
            </Reveal>
          )}
        </div>
        {video ? (
          // The video is the stage: it plays muted in place, and the line
          // beside its controls says what the reader is watching.
          <YouTubeLoop
            className="order-1 border-b border-ink-950/10 @[90rem]:col-start-1 @[90rem]:row-start-1 @[90rem]:border-r @[90rem]:border-b-0"
            videoId={video.youtube_id}
            title={video.title}
            url={video.url}
            poster={video.poster}
            caption={
              <>
                <p className="font-mono text-eyebrow tracking-normal text-text-muted">
                  {pieces(video.eyebrow.split(" · "), " · ")}
                </p>
                <p className="mt-1 text-small font-semibold text-text-strong">
                  {pieces(video.caption.split(/(?<=\.) /), " ")}
                </p>
              </>
            }
          />
        ) : car && (
          <div className="order-1 aspect-[3/2] overflow-hidden @[40rem]:aspect-[16/9] border-b border-ink-950/10 bg-paper-100 @[90rem]:col-start-1 @[90rem]:row-start-1 @[90rem]:border-r @[90rem]:border-b-0">
            <img
              src={asset(car.src)}
              alt={car.alt}
              width={car.width}
              height={car.height}
              loading="lazy"
              decoding="async"
              className="size-full object-cover motion-safe:transition-transform motion-safe:duration-[var(--duration-slow)] motion-safe:ease-[var(--ease-out-expo)] motion-safe:group-hover/feature:scale-[1.03]"
            />
          </div>
        )}
      </div>
    </article>
  );
}

/**
 * The related-platform features on /about, from public/data/spinoffs.json
 * `entries` (the `candidates` there wait for Cedric). Two across from
 * `desktop:`, stacked on `compact:` (a phone either way round); an odd last
 * entry spans both columns rather than leave half a row empty.
 */
export default function SpinoffGrid({ spinoffs }: SpinoffGridProps) {
  if (spinoffs.length === 0) return null;
  return (
    <Reveal stagger className="grid gap-6 desktop:grid-cols-2 desktop:[&>*:last-child:nth-child(odd)]:col-span-2">
      {spinoffs.map((s) => (
        <SpinoffFeature key={s.name} spinoff={s} />
      ))}
    </Reveal>
  );
}
