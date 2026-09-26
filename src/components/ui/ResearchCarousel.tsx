import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { Publication } from "../../lib/data";
import { abstractOf, authorLine, figureCredit, paperHref, shortTitle, venueInitials } from "../../lib/publications";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { DESKTOP_QUERY } from "../../lib/motion";
import { useMediaHold } from "../../lib/media";

/*
 * Landing research carousel (landing v5 section 5, round two: coverflow).
 *
 * Desktop (wide and tall enough): a full-width stage with every card in one
 * track. The current paper is a two-pane card 35rem tall whose figure pane
 * is 16:10, the shape of every figure canvas, so the figure fills it; the
 * text pane takes the rest, never under 26rem. Its neighbours are narrow
 * cover strips; the strips the row cannot fit beside that card are dropped
 * from the edges inward. A row too narrow for the two panes (a portrait
 * tablet) stacks the figure over the text instead, when the window is tall
 * enough to show that card whole. Width and height changes animate over
 * STRIP_MS. A 6 s rAF timer fills the strip under the stage and pauses
 * only while the pointer is over the current card, keyboard focus is
 * inside, the tab is hidden, or the carousel is fully out of view.
 * Under md: a horizontal scroll-snap row of stacked cards at 86vw, strip as
 * static indicators, no timer. Reduced motion: no timer, no transforms,
 * the current card alone with a 180 ms opacity swap; arrows still work.
 * A landscape phone (wide but not desktop) gets the two-pane card at the
 * window's height under the bar, so a card is never taller than the screen
 * and nothing is read by scrolling inside a sideways row (mobile pass,
 * LANDING-08). The strip and the arrows are 2.75rem tall on touch screens.
 */
const INTERVAL_MS = 6000;
/** Expanding strip (Cedric, v5 round two: "one image grows wider when we
 * are viewing it, the other ones on the side move, and it's dynamic"): the
 * active card takes the row minus the side strips; a side strip is
 * --rc-i wide (clamp(72px, 6vw, 120px)); every width and height change
 * animates over STRIP_MS with an in-out curve so the whole row visibly
 * moves on each change. A side strip is SIDE_RATIO of the active card's
 * height (the active paper is taller as well as wider). */
const STRIP_MS = 700;
const STRIP_EASE = "cubic-bezier(0.76, 0, 0.24, 1)";
/** The design numbers below are px at a 16px root; the stage is drawn in rem
 * so it follows the fluid root size (index.css), and the fit measurement
 * scales them by the live root. Full stage height: 35rem. */
const ACTIVE_H = 560;
const SIDE_RATIO = 440 / 560;
/** Every figure is a 16:10 canvas (scripts/paper_thumbs.py letterboxes the
 * paper's figure on paper-50), so the pane that holds it is 16:10 too and
 * object-contain fills it edge to edge. The pane used to be a share of a
 * card barely wider than tall, and a 16:10 figure drawn at that pane's width
 * filled a third of its height, grey above and below (Cedric, 2026-09-25). */
const FIG_ASPECT = 1.6;
/** Side by side, the text pane never goes under 26rem: title, authors, seven
 * abstract lines, the link and two chip rows fit in it at the full height.
 * The strips the row cannot fit beside the figure pane and this are dropped
 * from the edges inward (Cedric, v1.0: "always a certain min aspect ratio
 * on the article of interest, if not the ones on the edges get cut out"). */
const TEXT_MIN = 416;
/** A row too narrow for the two panes stacks the figure over a 25rem text
 * block, keeps STACK_RATIO of the row and gives the rest to strips... */
const STACK_TEXT = 400;
const STACK_RATIO = 0.86;
/** ...when the window has room for that card, its credit line and its strip
 * (STAGE_CHROME, 6rem) under the bar. Otherwise the two panes stay side by
 * side and the card gets shorter, never under 22rem. */
const STAGE_CHROME = 96;
const MIN_H = 352;
const rem = (px: number) => `${px / 16}rem`;
const STAGE_QUERY = DESKTOP_QUERY; // wide AND tall enough for the 560px stage
/** A frame gap longer than this (throttled or frozen tab) counts as a pause. */
const MAX_FRAME_MS = 1000;

const CARD = "rounded-card border border-ink-950/10 bg-paper-50";
const CREDIT = "mt-2 font-mono text-eyebrow tracking-normal text-text-muted";
// Site-wide link contract: ink text, underline, violet underline on hover.
const LINK =
  "text-small font-semibold text-text-strong underline decoration-1 underline-offset-4 hover:decoration-rr-violet hover:decoration-2";
/** A 2.75rem hit area on touch screens that leaves the line box alone. */
const TAP = "coarse:inline-block coarse:-my-3 coarse:py-3";
const CHIP = "rounded-pill border border-ink-950/10 px-2.5 py-1 font-mono text-eyebrow tracking-normal text-text-muted";
/** Credit line and strip run the full row width, 24 px side padding. */
const RAIL = "px-6";

export type ResearchCarouselProps = {
  /** Featured papers, already sorted by featured_order (featuredForLanding). */
  items: Publication[];
  /** id -> label map, tagLabelMap(publications.tags). */
  tagLabels?: Record<string, string>;
  /** Time per paper on the stage; 6 s. */
  intervalMs?: number;
  className?: string;
};

function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

function resolve(path: string): string {
  return path.startsWith("/") ? path : `${import.meta.env.BASE_URL}${path}`;
}

type ImageSource = { src: string; width: number; height: number };

/** Fallback chain: the 1600 px figure, then the 1200x750 card thumbnail.
 * Figure heights vary per paper; the boxes that hold them are fixed or
 * aspect-locked, so the nominal sizes never move layout. */
function figureChain(p: Publication): ImageSource[] {
  const chain: ImageSource[] = [];
  if (p.figure) chain.push({ src: resolve(p.figure), width: 1600, height: 1000 });
  if (p.thumbnail) chain.push({ src: resolve(p.thumbnail), width: 1200, height: 750 });
  return chain;
}

/** "Reinforcement learning" -> "reinforcement learning"; acronyms untouched. */
function lowerFirst(s: string): string {
  return s.length > 1 && s[1] === s[1].toLowerCase() ? s[0].toLowerCase() + s.slice(1) : s;
}

type FigureProps = { p: Publication; eager?: boolean };

/** Never a broken image: figure, then thumbnail, then a paper-100 block
 * with the venue initials. */
function Figure({ p, eager = false }: FigureProps) {
  const chain = useMemo(() => figureChain(p), [p]);
  // The landing holds its figures until the hero's opening clip has loaded
  // (MediaHoldContext): 100 to 300 KB each.
  const hold = useMediaHold();
  const [failed, setFailed] = useState(0);
  const img = chain[failed];
  if (!img) {
    return (
      <div className="flex h-full w-full items-center justify-center" aria-hidden="true">
        <span className="font-display text-display-m font-semibold text-text-muted">{venueInitials(p)}</span>
      </div>
    );
  }
  return (
    <img
      key={img.src}
      src={hold ? undefined : img.src}
      alt={`Figure from ${shortTitle(p.title)}`}
      width={img.width}
      height={img.height}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailed((f) => f + 1)}
      className="block h-full w-full object-contain"
    />
  );
}

/** Distance rank of card i from the active one, circular: 1 and 2 for the
 * papers just before and after it, 3 and 4 for the next pair, and so on.
 * Every card gets its own rank, so keeping the ranks up to `strips` shows
 * exactly that many strips (the old |i - current| version gave the first
 * and last cards the same rank, one strip too many or too few at the ends). */
function rankOf(i: number, current: number, n: number): number {
  const after = (i - current + n) % n;
  const before = n - after;
  return before < after ? before * 2 - 1 : after * 2;
}

/** Side-strip figure: object-cover so the strip reads as an image band. */
function CoverFigure({ p }: { p: Publication }) {
  const chain = useMemo(() => figureChain(p), [p]);
  const [failed, setFailed] = useState(0);
  const img = chain[failed];
  if (!img) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <span className="font-display text-display-s font-semibold text-text-muted">{venueInitials(p)}</span>
      </div>
    );
  }
  return (
    <img
      key={img.src}
      src={img.src}
      alt=""
      width={img.width}
      height={img.height}
      loading="lazy"
      decoding="async"
      onError={() => setFailed((f) => f + 1)}
      className="block h-full w-full object-cover"
    />
  );
}

type SlideProps = {
  p: Publication;
  position: number;
  count: number;
  tagLabels: Record<string, string>;
  /** row: the stage card, the 16:10 figure pane at the card's full height
   * (--rc-h) and the text beside it. stack: the stage on a narrow row, the
   * figure full width on top and a 25rem text block under it. compact: the
   * scroll row under desktop, stacked in portrait; in landscape the two
   * panes side by side at the card's height, the figure pane 16:10 up to 58%
   * of the card (on paper-50, the canvas's own margin colour, so the thin
   * band a capped pane leaves above and below the figure does not read as a
   * grey frame), with a shorter title, abstract and no chip row (the meta
   * line carries the topics). */
  layout?: "row" | "stack" | "compact";
  /** A row card below the full height: a shorter abstract, no chip row. */
  short?: boolean;
  eager?: boolean;
  /** False for side cards: the link leaves the tab order. */
  interactive?: boolean;
};

/** The card's inner layout. The figure pane is always the figure's own 16:10
 * shape, so the figure fills it; a hairline parts it from the text. The
 * 35rem height is the text pane's budget: a one-line mono meta (truncated,
 * the chips repeat the tags), a three-line title, two author lines, seven
 * abstract lines, the link and two rows of chips at p-6 (the text pane is
 * never under 26rem, so the lines stay long). */
function Slide({ p, position, count, tagLabels, layout = "row", short = false, eager = false, interactive = true }: SlideProps) {
  const stacked = layout === "compact";
  const href = paperHref(p);
  const venue = p.venue_short?.trim() || p.venue;
  const meta = [
    `${position} / ${count}`,
    `${venue} ${p.year || ""}`.trim(),
    ...p.tags.map((t) => lowerFirst(tagLabels[t] ?? t)),
  ].join(" · ");
  return (
    <div
      className={
        layout === "row" ? "flex h-full" : `flex h-full flex-col ${stacked ? "landscape:flex-row" : ""}`
      }
    >
      <div
        className={
          layout === "row"
            ? "h-full flex-none border-r border-ink-950/10 bg-paper-100"
            : `aspect-[16/10] flex-none border-b border-ink-950/10 bg-paper-100 ${stacked ? "landscape:h-full landscape:max-w-[58%] landscape:border-r landscape:border-b-0 landscape:bg-paper-50" : ""}`
        }
        style={
          layout === "row"
            ? // 16:10 of the card's inner height (the border takes 2px), but
              // never so wide that the text pane drops under TEXT_MIN.
              { width: `min(calc((var(--rc-h) - 2px) * ${FIG_ASPECT}), calc(100% - ${rem(TEXT_MIN)}))` }
            : undefined
        }
      >
        <Figure p={p} eager={eager} />
      </div>
      <div
        className={`flex min-w-0 flex-1 flex-col ${
          layout === "row"
            ? "min-h-0 overflow-hidden p-6"
            : layout === "stack"
              ? "min-h-0 overflow-hidden p-5"
              : "p-5 landscape:min-h-0 landscape:overflow-hidden landscape:p-4"
        }`}
      >
        <p
          className={`font-mono text-eyebrow tracking-normal text-text-muted ${stacked ? "landscape:line-clamp-2" : "truncate"}`}
        >
          {meta}
        </p>
        <h3
          className={`mt-3 line-clamp-3 font-display text-display-s font-semibold text-text-strong ${stacked ? "landscape:mt-2 landscape:line-clamp-2" : ""}`}
        >
          {p.title}
        </h3>
        <p className={`mt-2 line-clamp-2 text-small text-text-body ${stacked ? "landscape:mt-1.5 landscape:line-clamp-1" : ""}`}>
          {authorLine(p.authors)}
        </p>
        {/* The abstract field verbatim; an empty area when it is missing. */}
        <p
          className={`mt-2 text-small text-text-body ${
            stacked
              ? "line-clamp-5 landscape:line-clamp-3"
              : layout === "stack"
                ? "line-clamp-4"
                : short
                  ? "line-clamp-3"
                  : "line-clamp-7"
          }`}
        >
          {abstractOf(p) ?? ""}
        </p>
        <div className={`mt-auto pt-4 ${stacked ? "landscape:pt-3" : ""}`}>
          {href && (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={interactive ? undefined : -1}
              className={`${TAP} ${LINK}`}
            >
              Read the paper ↗
            </a>
          )}
          {p.tags.length > 0 && (
            <ul className={`mt-3 flex flex-wrap gap-2 ${stacked ? "landscape:hidden" : short ? "hidden" : ""}`}>
              {p.tags.map((t) => (
                <li key={t} className={CHIP}>
                  {tagLabels[t] ?? t}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

type ArrowProps = { direction: -1 | 1; onClick: () => void };

/** 32 px hairline arrow (44 on touch screens); icons are ink strokes, never
 * glyphs. */
function Arrow({ direction, onClick }: ArrowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction < 0 ? "Previous paper" : "Next paper"}
      className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-card border border-ink-950/15 text-text-strong transition-colors duration-[var(--duration-fast)] hover:border-ink-950/30 coarse:h-11 coarse:w-11"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {direction < 0 ? <path d="M13 8H3M7 4L3 8l4 4" /> : <path d="M3 8h10M9 4l4 4-4 4" />}
      </svg>
    </button>
  );
}

type Move = { dir: -1 | 1; steps: number };
/** The stage's shape (see the fit effect); h is the active card's height in rem. */
type Fit = { layout: "row" | "stack"; strips: number; h: number };

export default function ResearchCarousel({
  items,
  tagLabels = {},
  intervalMs = INTERVAL_MS,
  className = "",
}: ResearchCarouselProps) {
  const n = items.length;
  const reduced = usePrefersReducedMotion();
  const stage = useMediaQuery(STAGE_QUERY);
  const [rawIndex, setIndex] = useState(0);
  const [focusIn, setFocusIn] = useState(false);
  // Optimistic: the loop runs from mount; the observer's first callback
  // (next frame) pauses it if the carousel is out of view.
  const [inView, setInView] = useState(true);
  const [hidden, setHidden] = useState(() => typeof document !== "undefined" && document.hidden);

  const rootRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const fillRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const moveRef = useRef<Move>({ dir: 1, steps: 1 });
  const indexRef = useRef(0);
  const elapsedRef = useRef(0); // ms spent on the current paper, pauses excluded
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const scrollRaf = useRef(0);
  const rowRef2 = useRef<HTMLDivElement>(null);
  /** The stage's shape, recomputed on resize: the card layout, how many side
   * strips the row shows beside it, and the active card's height in rem. */
  const [fit, setFit] = useState<Fit>(() => ({ layout: "row", strips: 0, h: ACTIVE_H / 16 }));

  const index = n > 0 ? Math.min(rawIndex, n - 1) : 0;
  const autoplay = stage && !reduced && n > 1;
  const running = autoplay && !focusIn && inView && !hidden;

  /** Manual move on the stage. `dir` forces the slide direction (arrows and
   * keys); without it the shorter way round wins (strip, side cards). The
   * 6 s restart from zero. */
  const goTo = useCallback(
    (target: number, dir?: -1 | 1) => {
      if (n < 2) return;
      const t = ((target % n) + n) % n;
      const cur = indexRef.current;
      if (t === cur) return;
      const fwd = (t - cur + n) % n;
      const bwd = (cur - t + n) % n;
      const d = dir ?? (fwd <= bwd ? 1 : -1);
      moveRef.current = { dir: d, steps: d === 1 ? fwd : bwd };
      elapsedRef.current = 0;
      setIndex(t);
    },
    [n],
  );

  /** Arrows, strip and keys: the stage slides, the under-md row scrolls. */
  const select = useCallback(
    (target: number, dir?: -1 | 1) => {
      if (stage) {
        goTo(target, dir);
        return;
      }
      const row = rowRef.current;
      const card = row?.children[((target % n) + n) % n] as HTMLElement | undefined;
      if (row && card) row.scrollTo({ left: card.offsetLeft - 24, behavior: reduced ? "auto" : "smooth" });
    },
    [stage, goTo, n, reduced],
  );

  // Focus never stays inside a card that has left the centre (ArrowRight
  // from its link, or the timer moving on after a mouse click on it): it
  // follows to the current card's link.
  useEffect(() => {
    if (!stage) return;
    const active = document.activeElement;
    const root = rootRef.current;
    if (!active || !root || !root.contains(active)) return;
    const card = active.closest("[role=\"group\"]");
    const currentCard = cardRefs.current[index];
    if (!card || !currentCard || card === currentCard) return;
    currentCard.querySelector<HTMLElement>("a[href]")?.focus({ preventScroll: true });
  }, [index, stage]);

  // Strip state per paper: done = full, current = timer-driven (or full
  // without a timer), upcoming = track only. Imperative so the rAF loop and
  // React never fight over the same transform. On wrap everything resets.
  useLayoutEffect(() => {
    indexRef.current = index;
    fillRefs.current.forEach((el, i) => {
      if (!el) return;
      const done = i < index || (i === index && !autoplay);
      el.style.transform = done ? "scaleX(1)" : "scaleX(0)";
    });
  }, [index, autoplay, n]);

  // The timer: one requestAnimationFrame loop summing frame deltas into
  // elapsedRef. Frames under the pointer (last pointer position inside the
  // current card's live box) add nothing, so hovering pauses and a card
  // sliding under a resting pointer pauses too; a gap over MAX_FRAME_MS is
  // a throttled tab and adds nothing either. Focus, a hidden tab and an
  // out-of-view carousel stop the loop; elapsedRef survives, so the strip
  // resumes exactly where it paused. Never setInterval.
  useEffect(() => {
    if (!running) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      const card = cardRefs.current[indexRef.current];
      const pt = pointerRef.current;
      let hovered = false;
      if (card && pt) {
        const r = card.getBoundingClientRect();
        hovered = pt.x >= r.left && pt.x <= r.right && pt.y >= r.top && pt.y <= r.bottom;
      }
      if (!hovered && dt < MAX_FRAME_MS) elapsedRef.current += dt;
      const fill = fillRefs.current[indexRef.current];
      if (fill) fill.style.transform = `scaleX(${Math.min(1, elapsedRef.current / intervalMs)})`;
      if (elapsedRef.current >= intervalMs) {
        elapsedRef.current = 0;
        moveRef.current = { dir: 1, steps: 1 };
        setIndex((i) => (i + 1) % n);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, n, intervalMs]);

  // Fit: measure the row, then pick the card layout and keep only as many
  // side strips as leave the active card its figure pane and text pane.
  useLayoutEffect(() => {
    const row = rowRef2.current;
    if (!row || !stage) return;
    const measure = () => {
      const html = getComputedStyle(document.documentElement);
      const rootPx = parseFloat(html.fontSize) || 16;
      const k = rootPx / 16;
      const cs = getComputedStyle(row);
      // The content box: clientWidth counts the row's px-6 padding too (it
      // used to, which let every strip fit and left the card at its minimum).
      const rowW = row.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      // --rc-i is clamp(4.5rem, 6vw, 7.5rem) and --rc-gap 0.75rem (rootClass).
      const step = Math.min(120 * k, Math.max(72 * k, window.innerWidth * 0.06)) + 12 * k;
      const stripsFor = (spare: number) => Math.max(0, Math.min(n - 1, Math.floor(spare / step)));
      const fullH = ACTIVE_H * k;
      const textMin = TEXT_MIN * k;
      const beside = fullH * FIG_ASPECT + textMin;
      let next: Fit;
      if (rowW >= beside) {
        next = { layout: "row", strips: stripsFor(rowW - beside), h: ACTIVE_H / 16 };
      } else {
        const strips = stripsFor(rowW * (1 - STACK_RATIO));
        const stackH = (rowW - strips * step) / FIG_ASPECT + STACK_TEXT * k;
        // --spacing-nav is in rem (index.css).
        const nav = (parseFloat(html.getPropertyValue("--spacing-nav")) || 0) * rootPx;
        next =
          stackH <= window.innerHeight - nav - STAGE_CHROME * k
            ? { layout: "stack", strips, h: stackH / rootPx }
            : {
                layout: "row",
                strips: 0,
                h: Math.max(MIN_H * k, Math.min(fullH, (rowW - textMin) / FIG_ASPECT)) / rootPx,
              };
      }
      setFit((f) =>
        f.layout === next.layout && f.strips === next.strips && Math.abs(f.h - next.h) < 0.01 ? f : next,
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(row);
    // A height change alone can switch the layout (the stacked card's room).
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [stage, n]);

  // Only a carousel with no pixel in the viewport pauses.
  useEffect(() => {
    const el = rootRef.current;
    if (!el || !autoplay) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.intersectionRatio > 0), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, [autoplay]);

  // A hidden tab pauses (rAF would stall anyway; this keeps elapsed honest).
  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Warm the figures two slots out so a card never slides in blank (not
  // while the landing holds media for its hero clip).
  const holdMedia = useMediaHold();
  useEffect(() => {
    if (n < 3 || holdMedia) return;
    [2, -2].forEach((d) => {
      const src = figureChain(items[(index + d + n) % n])[0];
      if (src) new Image().src = src.src;
    });
  }, [index, items, n, holdMedia]);

  // Keyboard focus inside pauses; a mouse click on an arrow must not (the
  // button keeps focus after the click and would freeze the carousel).
  const onFocus = (e: FocusEvent<HTMLDivElement>) => {
    setFocusIn((e.target as HTMLElement).matches(":focus-visible"));
  };
  const onBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocusIn(false);
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") select(index + 1, 1);
    else if (e.key === "ArrowLeft") select(index - 1, -1);
    else if (e.key === "Home") select(0);
    else if (e.key === "End") select(n - 1);
    else return;
    e.preventDefault();
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    pointerRef.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerLeave = () => {
    pointerRef.current = null;
  };

  /** A click anywhere on a side card moves to it and never follows its link. */
  const onCardClick = (i: number) => (e: ReactMouseEvent<HTMLElement>) => {
    if (i === index) return;
    e.preventDefault();
    goTo(i);
  };

  // Under md the scroll position picks the current paper.
  const onRowScroll = () => {
    if (scrollRaf.current) return;
    scrollRaf.current = requestAnimationFrame(() => {
      scrollRaf.current = 0;
      const row = rowRef.current;
      if (!row) return;
      let best = 0;
      let bestDistance = Infinity;
      Array.from(row.children).forEach((child, i) => {
        const d = Math.abs((child as HTMLElement).offsetLeft - 24 - row.scrollLeft);
        if (d < bestDistance) {
          bestDistance = d;
          best = i;
        }
      });
      setIndex(best);
    });
  };
  useEffect(() => () => cancelAnimationFrame(scrollRaf.current), []);

  const strip = (
    <div className={`mt-2.5 flex items-center gap-6 coarse:mt-1 ${RAIL}`}>
      {/* On touch screens the segments are 2.75rem tall and touch each other
          (no dead gap between targets); the drawn lines keep their 0.5rem
          gaps through the inset. Eleven papers in a 342 px row still leaves
          each target about 31 px wide. */}
      <div className="flex min-w-0 flex-1 gap-2 coarse:gap-0">
        {items.map((p, i) => (
          <button
            key={p.id}
            type="button"
            aria-label={`Go to paper ${i + 1}: ${p.title}`}
            aria-current={i === index ? "true" : undefined}
            onClick={() => select(i)}
            className="relative h-8 min-w-0 flex-1 cursor-pointer coarse:h-11"
          >
            <span className="absolute inset-x-0 top-[0.9375rem] h-0.5 bg-ink-950/10 coarse:inset-x-1 coarse:top-[calc(50%-1px)]" />
            <span
              ref={(el) => {
                fillRefs.current[i] = el;
              }}
              className="absolute inset-x-0 top-[0.9375rem] h-0.5 origin-left bg-ink-950/90 coarse:inset-x-1 coarse:top-[calc(50%-1px)]"
            />
          </button>
        ))}
      </div>
      {n > 1 && (
        <div className="hidden gap-2 md:flex">
          <Arrow direction={-1} onClick={() => select(index - 1, -1)} />
          <Arrow direction={1} onClick={() => select(index + 1, 1)} />
        </div>
      )}
    </div>
  );

  const rootClass = `w-full [--rc-i:clamp(4.5rem,6vw,7.5rem)] [--rc-gap:0.75rem] ${className}`;

  if (n === 0) {
    // The section is never hidden: an empty stage at the populated height.
    return (
      <div
        ref={rootRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="Featured publications"
        className={rootClass}
      >
        <p className="sr-only">No featured papers yet.</p>
        <div className="px-6" style={{ height: rem(ACTIVE_H) }} aria-hidden="true">
          <div className={`h-full ${CARD}`} />
        </div>
        <p className={`${CREDIT} ${RAIL}`} aria-hidden="true">
          &nbsp;
        </p>
        <div className="mt-2.5 h-8" aria-hidden="true" />
      </div>
    );
  }

  const current = items[index];

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured publications"
      className={`relative ${rootClass}`}
      data-running={running ? "true" : "false"}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
    >
      {/* Silent while rotating (APG), polite once paused or under md. */}
      <p className="sr-only" aria-live={running ? "off" : "polite"} aria-atomic="true">
        {`Paper ${index + 1} of ${n}: ${current.title}`}
      </p>

      {stage ? (
        <>
          <div
            ref={rowRef2}
            className="flex w-full items-center gap-[var(--rc-gap)] px-6"
            style={{ ["--rc-h" as string]: `${fit.h}rem`, height: "var(--rc-h)" } as CSSProperties}
            onPointerMove={onPointerMove}
            onPointerDown={onPointerMove}
            onPointerLeave={onPointerLeave}
            onPointerCancel={onPointerLeave}
          >
            {items.map((p, i) => {
              const isCurrent = i === index;
              // Strips nearest the active card survive; the outermost are
              // dropped (width 0) until the active card has its minimum.
              const rank = rankOf(i, index, n);
              const shown = isCurrent || rank <= fit.strips;
              const motion = reduced ? "none" : `width ${STRIP_MS}ms ${STRIP_EASE}, height ${STRIP_MS}ms ${STRIP_EASE}, opacity ${STRIP_MS}ms ${STRIP_EASE}, border-color var(--duration-fast)`;
              return (
                <div
                  key={p.id}
                  ref={(el) => {
                    cardRefs.current[i] = el;
                  }}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${i + 1} of ${n}`}
                  aria-hidden={!isCurrent || undefined}
                  onClick={onCardClick(i)}
                  className={`relative shrink-0 overflow-hidden hover:border-ink-950/30 ${CARD} ${isCurrent ? "" : "cursor-pointer"} ${shown ? "" : "pointer-events-none border-0"}`}
                  style={{
                    width: isCurrent
                      ? `calc(100% - ${fit.strips} * (var(--rc-i) + var(--rc-gap)))`
                      : shown
                        ? "var(--rc-i)"
                        : 0,
                    height: isCurrent ? "var(--rc-h)" : `calc(var(--rc-h) * ${SIDE_RATIO})`,
                    opacity: shown ? 1 : 0,
                    marginRight: shown ? undefined : `calc(-1 * var(--rc-gap))`,
                    transition: motion,
                  }}
                >
                  {/* Side state: the figure as a cover strip with the paper's
                      index; active state: the full card. Both layers stay
                      mounted and crossfade, the card content arriving once
                      the width has mostly grown. */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-paper-100"
                    style={{ opacity: isCurrent ? 0 : 1, transition: reduced ? "none" : `opacity 250ms ease ${isCurrent ? "0ms" : "200ms"}` }}
                  >
                    <CoverFigure p={p} />
                    <span className="absolute bottom-3 left-3 rounded-card border border-ink-950/10 bg-paper-50/90 px-1.5 py-0.5 font-mono text-eyebrow tracking-normal text-text-muted">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div
                    className="absolute inset-0"
                    style={{
                      opacity: isCurrent ? 1 : 0,
                      pointerEvents: isCurrent ? "auto" : "none",
                      transition: reduced ? "none" : `opacity 300ms ease ${isCurrent ? "300ms" : "0ms"}`,
                    }}
                  >
                    <Slide
                      p={p}
                      position={i + 1}
                      count={n}
                      tagLabels={tagLabels}
                      layout={fit.layout}
                      short={fit.layout === "row" && fit.h < (ACTIVE_H / 16) * 0.9}
                      eager={isCurrent}
                      interactive={isCurrent}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <p className={`${CREDIT} ${RAIL}`}>{figureCredit(current.authors)}</p>
        </>
      ) : (
        <>
          <div
            ref={rowRef}
            onScroll={onRowScroll}
            className="relative flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 [scroll-padding-inline:1.5rem] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {items.map((p, i) => (
              <div
                key={p.id}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${n}`}
                className={`w-[86vw] shrink-0 snap-start overflow-hidden landscape:h-[min(calc(100svh-var(--spacing-nav)-2rem),30rem)] ${CARD}`}
              >
                <Slide p={p} position={i + 1} count={n} tagLabels={tagLabels} layout="compact" eager={i === 0} />
              </div>
            ))}
          </div>
          <p className={`${CREDIT} ${RAIL}`}>{figureCredit(current.authors)}</p>
        </>
      )}

      {strip}
    </div>
  );
}
