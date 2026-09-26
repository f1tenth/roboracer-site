import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { loadPaths, type EntryPath, type PathMedia } from "../../lib/data";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import Section from "./Section";
import SectionHeader from "./SectionHeader";
import Reveal from "./Reveal";

/** The section lists five ways in (Build, Learn, Race, Research, Sponsor). */
const MAX_PATHS = 5;

/** Intrinsic size of every thumb (public/media/start, 16/10). */
const THUMB_W = 480;
const THUMB_H = 300;

/** HTMLMediaElement.HAVE_FUTURE_DATA */
const HAVE_FUTURE_DATA = 3;

/**
 * The five ways in as public/data/paths.json has them, bundled: the list holds
 * its final height with them while the file loads, and shows them when the
 * file fails or does not validate, so "Start here" never lands on an empty
 * section. Keep in step with the JSON: a sentence that wraps differently here
 * shifts the section below when the file arrives (QA polish-2: CLS 0.28 at
 * 390 before this copy existed).
 */
const BUNDLED_PATHS: EntryPath[] = [
  {
    id: "build",
    n: "01",
    label: "Build",
    line: "Order the parts, build the car from the open-source guide and install its software.",
    detail: "The hardware, software and simulator are open source, so a lab builds its own cars instead of buying them.",
    href: "/build",
    linkText: "Build the car",
    media: {
      thumb: "/media/start/start-build-480.webp",
      src: "/media/platform/platform-build-poster.webp",
      width: 960,
      height: 540,
      video: "/media/platform/platform-build-960.mp4",
      alt: "Hands assembling a RoboRacer car on a workbench, tools beside it",
      caption: "assembling a car, 2x speed · build tutorial",
    },
  },
  {
    id: "learn",
    n: "02",
    label: "Learn",
    line: "Lectures and labs on perception, planning and control: 15 weeks for a full semester, or 4 weeks to get a car race ready.",
    detail: "The slides, labs and grading rubrics are public, and Penn teaches the course as ESE 6150.",
    href: "/learn",
    linkText: "Start the course",
    media: {
      thumb: "/media/start/start-learn-480.webp",
      src: "/media/platform/platform-learn-1200.webp",
      width: 1200,
      height: 750,
      alt: "Two students working on a RoboRacer car on the floor of the pit area at ICRA 2026",
      caption: "pit work on a car · ICRA 2026, Vienna",
    },
  },
  {
    id: "race",
    n: "03",
    label: "Race",
    line: "Any team can register for our races at the major robotics conferences.",
    detail: "Each race has its own site with its rules and results.",
    href: "/race",
    linkText: "Find the next race",
    media: {
      thumb: "/media/start/start-race-480.webp",
      src: "/media/platform/platform-race-poster.webp",
      width: 960,
      height: 540,
      video: "/media/platform/platform-race-960.mp4",
      alt: "A RoboRacer car with blue lights taking a corner between yellow track barriers at ICRA 2025",
      caption: "a car through the corner · ICRA 2025, Atlanta",
    },
  },
  {
    id: "research",
    n: "04",
    label: "Research",
    line: "A shared car for autonomy research, referenced by more than 1,000 publications.",
    detail: "Papers are sorted by topic, such as planning, reinforcement learning and education, and you can submit yours.",
    href: "/research",
    linkText: "Browse the research",
    media: {
      thumb: "/media/start/start-research-480.webp",
      src: "/media/platform/platform-research-mppi-poster.webp",
      width: 960,
      height: 600,
      video: "/media/platform/platform-research-mppi-960.mp4",
      alt: "Simulator view of a car overtaking with MPPI, its sampled paths fanning out ahead of it",
      caption: "MPPI overtaking in the simulator · UPenn",
    },
  },
  {
    id: "sponsor",
    n: "05",
    label: "Sponsor",
    line: "Reach the students and researchers who use the car at 90+ universities in 20+ countries.",
    detail: "The races run at conferences such as ICRA, IROS and IV.",
    href: "mailto:contact@roboracer.ai?subject=RoboRacer%20sponsorship",
    linkText: "Write to contact@roboracer.ai",
    media: {
      thumb: "/media/start/start-ifac2026-field-480.webp",
      src: "/media/news/news-ifac2026-group-1080.webp",
      width: 1080,
      height: 531,
      alt: "The IFAC 2026 field in Busan, arms raised in front of the 29th RoboRacer competition screen",
      caption: "the field · IFAC 2026, Busan",
    },
  },
];

const str = (v: unknown): v is string => typeof v === "string" && v.length > 0;
const num = (v: unknown): v is number => typeof v === "number" && v > 0;

function readMedia(v: unknown): PathMedia | undefined {
  if (typeof v !== "object" || v === null) return undefined;
  const m = v as Record<string, unknown>;
  if (![m.thumb, m.src, m.alt, m.caption].every(str) || !num(m.width) || !num(m.height)) return undefined;
  return {
    thumb: m.thumb as string,
    src: m.src as string,
    width: m.width as number,
    height: m.height as number,
    video: str(m.video) ? m.video : undefined,
    alt: m.alt as string,
    caption: m.caption as string,
  };
}

/** A path with every field the list renders, or null. The media is optional:
 * a path without it keeps its frame as a neutral surface. */
function readPath(v: unknown): EntryPath | null {
  if (typeof v !== "object" || v === null) return null;
  const p = v as Record<string, unknown>;
  if (![p.id, p.n, p.label, p.line, p.href, p.linkText].every(str)) return null;
  return {
    id: p.id as string,
    n: p.n as string,
    label: p.label as string,
    line: p.line as string,
    detail: str(p.detail) ? p.detail : undefined,
    href: p.href as string,
    linkText: p.linkText as string,
    media: readMedia(p.media),
  };
}

const isExternal = (href: string) => /^(https?:)?\/\//.test(href) || href.startsWith("mailto:");

/** Stroke arrow in the link's colour: right for a page on this site, up and
 * out for anything that leaves it (a mail client, another site). */
function Arrow({ out }: { out: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className="ml-2 inline-block h-[0.8em] w-[0.8em] align-[-0.05em] transition-transform duration-[var(--duration-fast)] ease-[var(--ease-out-expo)] motion-safe:group-hover:translate-x-1 motion-safe:group-focus-visible:translate-x-1"
    >
      <path
        d={out ? "M4.5 11.5l7-7M6 4.5h5.5V10" : "M2.5 8h11M9 3.5 13.5 8 9 12.5"}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * The row's one link, stretched over the whole row by its ::after, so the
 * picture, the label and the sentence all click through while keyboard and
 * screen reader users meet a single link named by its verb ("Build the car"),
 * described by the sentence. The row is the touch target, so the link needs
 * no padding of its own. Focus draws the ring around the row, not the words.
 * The site's link contract: a hairline underline at rest that turns violet
 * and 2px on hover or focus, anywhere on the row. Inline, not flex: a link
 * that wraps on a phone ("Write to / contact@roboracer.ai") keeps its arrow
 * after the last word.
 */
function PathAction({ path, describedBy }: { path: EntryPath; describedBy: string }) {
  const out = isExternal(path.href);
  const cls = `group font-semibold text-text-strong underline decoration-ink-950/25 decoration-1 underline-offset-4 after:absolute after:inset-0 after:rounded-card after:content-[''] hover:decoration-rr-violet hover:decoration-2 focus-visible:decoration-rr-violet focus-visible:decoration-2 focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-rr-violet`;
  // The last word and the arrow never part: a wrapped link keeps its arrow
  // after the word rather than alone on a line.
  const cut = path.linkText.lastIndexOf(" ");
  const body = (
    <>
      {cut > 0 ? `${path.linkText.slice(0, cut)} ` : ""}
      <span className="whitespace-nowrap">
        {path.linkText.slice(cut + 1)}
        <Arrow out={out} />
      </span>
    </>
  );
  if (out) {
    const web = !path.href.startsWith("mailto:");
    return (
      <a
        href={path.href}
        aria-describedby={describedBy}
        className={cls}
        {...(web ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {body}
      </a>
    );
  }
  return (
    <Link to={path.href} aria-describedby={describedBy} className={cls}>
      {body}
    </Link>
  );
}

/** The small inline picture of a compact row: the 480x300 thumb in a 16/10
 * frame, so the row's height never waits for the file. */
function Thumb({ media }: { media?: PathMedia }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="aspect-[16/10] overflow-hidden rounded-media border border-ink-950/10 bg-paper-100">
      {media && !failed && (
        <img
          src={media.thumb}
          alt={media.alt}
          width={THUMB_W}
          height={THUMB_H}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

/**
 * /about's frame: the still, with the path's clip over it. The clip mounts
 * after the first paint, loads only once the frame is within 200px of the
 * viewport and plays only while it is on screen (four clips are 2.6 MB; a
 * reader who stops at People never pays for them). Under reduced motion no
 * video is created: the still is the media (CLAUDE.md rule 6). A clip that
 * errors falls back to its still; a still that errors leaves the neutral
 * frame.
 */
function FullMedia({ media, label }: { media?: PathMedia; label: string }) {
  const holderRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduced = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [near, setNear] = useState(false);
  const [inView, setInView] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const hasVideo = Boolean(media?.video);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const el = holderRef.current;
    if (!el || reduced || !hasVideo) return;
    if (typeof IntersectionObserver === "undefined") {
      setNear(true);
      setInView(true);
      return;
    }
    // Two observers: a wide one decides when the clip may load, a tight one
    // whether it plays.
    const load = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          load.disconnect();
        }
      },
      { rootMargin: "200px 0px" },
    );
    const play = new IntersectionObserver((entries) => setInView(entries.some((e) => e.isIntersecting)), {
      threshold: 0.15,
    });
    load.observe(el);
    play.observe(el);
    return () => {
      load.disconnect();
      play.disconnect();
    };
  }, [reduced, hasVideo]);

  const isVideo = hasVideo && mounted && near && !reduced && !videoFailed;

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !isVideo) return;
    if (!inView) {
      v.pause();
      return;
    }
    const start = () => {
      v.play()?.catch((err: unknown) => {
        // AbortError is the normal "paused before it started" case.
        if (import.meta.env.DEV && !(err instanceof DOMException && err.name === "AbortError")) {
          console.warn(`[StartHere] ${label}: play() rejected`, err);
        }
      });
    };
    if (v.readyState >= HAVE_FUTURE_DATA) {
      start();
      return;
    }
    v.addEventListener("canplay", start, { once: true });
    return () => v.removeEventListener("canplay", start);
  }, [isVideo, inView, label]);

  return (
    <div
      ref={holderRef}
      className="aspect-[16/10] overflow-hidden rounded-media border border-ink-950/10 bg-paper-100"
    >
      {media && isVideo ? (
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          src={media.video}
          poster={media.src}
          width={media.width}
          height={media.height}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={media.alt}
          onError={() => setVideoFailed(true)}
        />
      ) : (
        media &&
        !imgFailed && (
          <img
            src={media.src}
            alt={media.alt}
            width={media.width}
            height={media.height}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
            onError={() => setImgFailed(true)}
          />
        )
      )}
    </div>
  );
}

/** Landing row: the small picture in line with the label, the sentence and
 * the link. Phones keep the picture beside the text, a table of contents. */
function CompactRow({ path }: { path: EntryPath }) {
  // Per instance, not per path: /styleguide shows both densities at once.
  const lineId = `${useId()}-line`;
  return (
    <>
      <Thumb media={path.media} />
      <div className="min-w-0">
        <h3 className="flex items-baseline gap-3 font-display text-display-s font-semibold text-text-strong">
          <span aria-hidden="true" className="font-mono text-small font-normal tracking-normal text-text-muted">
            {path.n}
          </span>
          {path.label}
        </h3>
        <p id={lineId} className="mt-1.5 max-w-[52ch] text-body text-text-body lg:text-lead">
          {path.line}
        </p>
        <p className="mt-2 text-small lg:text-body">
          <PathAction path={path} describedBy={lineId} />
        </p>
      </div>
    </>
  );
}

/** /about row: the frame and its caption on the left, the label, the
 * sentence, the second sentence and the link on the right. Phones get the
 * landing's small picture beside the text instead (five full-width frames
 * ran about 1,100 px of a 390 screen). The copy that is hidden at a size is
 * display: none, and neither a lazy image nor an observed clip is ever
 * requested there. */
function FullRow({ path }: { path: EntryPath }) {
  const lineId = `${useId()}-line`;
  return (
    <>
      <div className="md:hidden">
        <Thumb media={path.media} />
      </div>
      <figure className="max-md:hidden md:col-span-4">
        <FullMedia media={path.media} label={path.id} />
        {path.media && (
          <figcaption className="mt-2 font-mono text-small text-text-muted">{path.media.caption}</figcaption>
        )}
      </figure>
      <div className="min-w-0 md:col-span-8">
        <p aria-hidden="true" className="flex items-center gap-2 font-mono text-small text-text-muted">
          <span className="h-1 w-1 bg-ink-950" />
          {path.n}
        </p>
        <h3 className="mt-2 font-display text-display-m font-semibold text-text-strong md:mt-3">{path.label}</h3>
        <p id={lineId} className="mt-3 max-w-[60ch] text-lead text-text-body">
          {path.line}
        </p>
        {path.detail && <p className="mt-3 max-w-[60ch] text-body text-text-body">{path.detail}</p>}
        <p className="mt-5 text-body">
          <PathAction path={path} describedBy={lineId} />
        </p>
      </div>
    </>
  );
}

type StartHereProps = {
  /** "compact" (landing): small pictures in line with one sentence, beside
   * the header from lg. "full" (/about): the bigger frame with its clip and
   * caption, plus the second sentence. */
  density?: "compact" | "full";
  /** Two-digit section index ("00" on the landing, "01" on /about). */
  index: string;
  /** The section's own id; the landing's is START_ID, the nav's target. */
  id?: string;
  /** The h2's id, which labels the section. */
  headingId: string;
  subtitle?: ReactNode;
  /** One line on what RoboRacer is, for a first-time visitor. */
  lead?: ReactNode;
  /** Rendered between the header and the list (/about's story and photo). */
  intro?: ReactNode;
};

/**
 * "Start here": one line on what RoboRacer is, then the ways in (Build,
 * Learn, Race, Research, Sponsor), each with its picture, one plain sentence
 * and one link. It replaced the landing's entry-path row and its pinned
 * Platform chapter, and /about's "What RoboRacer is" and "The platform"
 * (Cedric, 2026-09-25: "they're both repetitive together right now"). Serves
 * the newbie and interested beginner (build, learn), the student and, without
 * addressing them, faculty (a semester course with labs, teams register for
 * races, research), the competitor (race) and the sponsor (who they reach,
 * where to write). Motion is one stagger reveal of the rows, which reduced
 * motion drops; the content is public/data/paths.json.
 */
export default function StartHere({
  density = "compact",
  index,
  id,
  headingId,
  subtitle,
  lead,
  intro,
}: StartHereProps) {
  const [paths, setPaths] = useState<EntryPath[]>([]);
  const [loading, setLoading] = useState(true);
  const full = density === "full";

  useEffect(() => {
    let live = true;
    // The read gives up after eight seconds (lib/data READ_TIMEOUT_MS), so a
    // request that never answers ends on the bundled five, not on a list that
    // stays invisible.
    loadPaths()
      .then((f) => {
        const valid = Array.isArray(f?.paths)
          ? f.paths.map(readPath).filter((p): p is EntryPath => p !== null)
          : [];
        if (live) setPaths(valid.length > 0 ? valid.slice(0, MAX_PATHS) : BUNDLED_PATHS);
      })
      .catch(() => {
        if (live) setPaths(BUNDLED_PATHS);
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, []);

  const rowClass = full
    ? "relative grid grid-cols-[6.5rem_minmax(0,1fr)] items-start gap-x-4 border-b border-ink-950/10 py-6 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-x-6 md:grid-cols-12 md:gap-x-10 md:py-10"
    : "relative grid grid-cols-[6.5rem_minmax(0,1fr)] items-start gap-x-4 border-b border-ink-950/10 py-4 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-x-6 lg:grid-cols-[12rem_minmax(0,1fr)] lg:py-5";

  // aria-busy until the paths arrive: the "Start here" jump waits for it
  // (hooks/useScrollToHash). Meanwhile the bundled five stand in, invisible
  // and out of the accessibility tree, so the list already has its final
  // height and nothing below it jumps when the file lands.
  const list = (
    <div aria-busy={loading}>
      <Reveal stagger as="ul" className="border-t border-ink-950/10">
        {(loading ? BUNDLED_PATHS : paths).map((path) =>
          loading ? (
            <li key={path.id} aria-hidden="true" className={`invisible ${rowClass}`}>
              {full ? <FullRow path={path} /> : <CompactRow path={path} />}
            </li>
          ) : (
            <li key={path.id} data-path={path.id} className={rowClass}>
              {full ? <FullRow path={path} /> : <CompactRow path={path} />}
            </li>
          ),
        )}
      </Reveal>
    </div>
  );

  if (full) {
    return (
      // The scroll margin covers what the section's own top padding does not
      // (phones: 7vh of padding under a 4.5rem bar), so a jump to the section
      // (the nav's "Start here" on /about) shows its eyebrow under the bar.
      <Section
        width="page"
        id={id}
        rule
        aria-labelledby={headingId}
        className="scroll-mt-[max(0rem,calc(var(--spacing-nav)+1rem-var(--spacing-section)))] focus:outline-none"
      >
        <SectionHeader index={index} id={headingId} title="Start here" subtitle={subtitle} lead={lead} />
        {intro}
        <div className={intro ? "mt-16" : undefined}>{list}</div>
      </Section>
    );
  }

  // Landing: the header and its one line beside the list from lg (a 5/7
  // split), stacked above it below. The top padding clears the fixed nav
  // when the nav's "Start here" scrolls this section to the top of the
  // window (the bar is --spacing-nav tall at every size).
  return (
    <Section
      tight
      width="page"
      id={id}
      aria-labelledby={headingId}
      className="pt-[calc(var(--spacing-nav)+2rem)]! focus:outline-none"
    >
      <div className="grid lg:grid-cols-12 lg:gap-x-12">
        {/* From lg the header stays beside the list while it scrolls by. */}
        <div className="lg:sticky lg:top-[calc(var(--spacing-nav)+2rem)] lg:col-span-5 lg:self-start">
          <SectionHeader index={index} id={headingId} title="Start here" subtitle={subtitle} lead={lead} className="lg:mb-0!" />
        </div>
        <div className="lg:col-span-7">{list}</div>
      </div>
    </Section>
  );
}
