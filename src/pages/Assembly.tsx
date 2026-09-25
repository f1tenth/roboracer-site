import {
  Component,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import Button from "../components/ui/Button";
import {
  BUILD_GUIDE_URL,
  CAR_PARTS,
  WIRING_GUIDE_URL,
  type CarPartEntry,
  type RacecarPartId,
} from "../components/racecarAssemblyData";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { lazyWithRetry } from "../lib/lazyWithRetry";

// three.js, R3F and the part meshes load in their own chunk, so the heading
// and the part list paint first (design system: three.js never in the
// critical path).
const AssemblyCanvas = lazyWithRetry("AssemblyViewer", () =>
  import("../components/RacecarAssembly").then((module) => ({ default: module.RacecarAssemblyCanvas })),
);

const ENTRY_BY_PART = new Map<RacecarPartId, CarPartEntry>(
  CAR_PARTS.flatMap((entry) => entry.parts.map((part) => [part, entry] as const)),
);
const PARTS_BY_ENTRY = new Map<string, ReadonlySet<RacecarPartId>>(
  CAR_PARTS.map((entry) => [entry.id, new Set(entry.parts)]),
);
const NO_PARTS: ReadonlySet<RacecarPartId> = new Set();

/** One line centred in the 3D frame: loading, or why the view is missing. */
function FrameMessage({ children }: { children: ReactNode }) {
  return (
    <p
      role="status"
      className="absolute inset-0 flex items-center justify-center p-6 text-center font-mono text-small text-text-muted"
    >
      {children}
    </p>
  );
}

/** No WebGL, or the 3D chunk would not load: the frame says so and the part
 * list keeps working on its own. */
class ViewerBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("3D viewer unavailable", error);
  }

  render() {
    return this.state.failed ? (
      <FrameMessage>The 3D view did not start in this browser. The part list works without it.</FrameMessage>
    ) : (
      this.props.children
    );
  }
}

function ExternalMark() {
  return (
    <>
      <span aria-hidden="true">↗</span>
      <span className="sr-only"> (opens in a new tab)</span>
    </>
  );
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * /assembly: the car, part by part. A newcomer sees what is in a RoboRacer,
 * what each part does, and which section of the build guide covers it
 * (docs/assembly/PLAN.md). The list is the page: it is ordered like the build,
 * carries every fact the 3D view shows, and works from the keyboard and
 * without WebGL. The 3D view mirrors it both ways: a row lights its part, a
 * part lights its row, and either one selects (focus mode: the rest goes grey
 * and the camera glides in). Reduced motion keeps every pose and camera move,
 * without the glide.
 */
export default function Assembly() {
  const reduced = usePrefersReducedMotion();
  const [exploded, setExploded] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const listRef = useRef<HTMLOListElement>(null);

  const focusParts = (selectedId && PARTS_BY_ENTRY.get(selectedId)) || NO_PARTS;
  const highlightParts = (hoveredId && PARTS_BY_ENTRY.get(hoveredId)) || NO_PARTS;

  const toggleEntry = (id: string) => setSelectedId((current) => (current === id ? null : id));

  const selectPart = useCallback((part: RacecarPartId | null) => {
    const id = part ? (ENTRY_BY_PART.get(part)?.id ?? null) : null;
    setSelectedId((current) => (id !== null && current !== id ? id : null));
  }, []);

  const hoverPart = useCallback((part: RacecarPartId, over: boolean) => {
    const id = ENTRY_BY_PART.get(part)?.id ?? null;
    setHoveredId((current) => (over ? id : current === id ? null : current));
  }, []);

  const resetView = () => {
    setSelectedId(null);
    setResetKey((key) => key + 1);
  };

  // A part picked on the canvas brings its row into view (the list scrolls
  // on its own under the canvas on a phone).
  useEffect(() => {
    if (!selectedId) return;
    listRef.current
      ?.querySelector(`[data-row="${selectedId}"]`)
      ?.scrollIntoView({ block: "nearest", behavior: reduced ? "auto" : "smooth" });
  }, [reduced, selectedId]);

  useEffect(() => {
    if (!selectedId) return;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedId]);

  // Up and down arrows move between rows; Tab still visits every one.
  const onListKeyDown = (event: KeyboardEvent<HTMLOListElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    const rows = Array.from(listRef.current?.querySelectorAll<HTMLButtonElement>("button[data-entry]") ?? []);
    const index = rows.indexOf(document.activeElement as HTMLButtonElement);
    if (index < 0) return;
    event.preventDefault();
    const step = event.key === "ArrowDown" ? 1 : -1;
    rows[(index + step + rows.length) % rows.length]?.focus();
  };

  const views = [
    { label: "Assembled", value: false },
    { label: "Exploded", value: true },
  ] as const;

  return (
    // A workspace like /build: one window tall under the fixed nav, no footer.
    <div className="flex h-[100svh] flex-col pt-nav">
      <div className="mx-auto flex min-h-0 w-full max-w-page flex-1 flex-col gap-4 px-6 pb-4 pt-4 md:landscape:flex-row md:landscape:gap-6 lg:flex-row lg:gap-8 lg:pb-6">
        {/* The panel comes first in the document (heading, then the list),
            and sits right of the view, or under it on a portrait screen.
            `relative`: it is the containing block of the links' sr-only
            spans, which otherwise hang off the body and scroll the page. */}
        <section
          aria-labelledby="assembly-title"
          className="relative order-2 -mx-1.5 flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-1.5 md:landscape:w-[24rem] md:landscape:flex-none lg:w-[30rem] lg:flex-none"
        >
          <header className="pr-2">
            <p className="mb-3 flex items-center gap-2 font-mono text-small text-text-muted">
              <span aria-hidden="true" className="h-1 w-1 bg-ink-950" />
              <span>Build</span>
            </p>
            <h1
              id="assembly-title"
              className="text-balance font-display text-display-m font-semibold text-text-strong"
            >
              The car, part by part
            </h1>
            <p className="mt-3 max-w-[44ch] text-pretty text-body text-text-body">
              Select a part to see what it does and how to build it.
            </p>
            <div className="mt-4">
              <Button
                href={BUILD_GUIDE_URL}
                size="sm"
                target="_blank"
                rel="noopener noreferrer"
                className="relative scroll-my-2 [@media(pointer:coarse)]:min-h-11"
              >
                Open the build guide
                <ExternalMark />
              </Button>
            </div>
          </header>

          <ol
            ref={listRef}
            aria-label="Parts, in build order"
            onKeyDown={onListKeyDown}
            className="mt-5 border-t border-ink-950/10"
          >
            {CAR_PARTS.map((entry, index) => {
              const selected = selectedId === entry.id;
              const lit = hoveredId === entry.id;
              const detail = selected && (entry.note || entry.guide);
              return (
                <li
                  key={entry.id}
                  data-row={entry.id}
                  className={`border-b border-ink-950/10 ${
                    selected ? "bg-paper-100 shadow-[inset_0.125rem_0_0_var(--color-ink-950)]" : ""
                  }`}
                >
                  <button
                    type="button"
                    data-entry={entry.id}
                    aria-pressed={selected}
                    aria-labelledby={`part-${entry.id}-name`}
                    aria-describedby={`part-${entry.id}-role`}
                    onClick={() => toggleEntry(entry.id)}
                    onPointerEnter={() => setHoveredId(entry.id)}
                    onPointerLeave={() => setHoveredId((current) => (current === entry.id ? null : current))}
                    onFocus={() => setHoveredId(entry.id)}
                    onBlur={() => setHoveredId((current) => (current === entry.id ? null : current))}
                    className={`grid w-full scroll-my-2 grid-cols-[2.25rem_1fr] items-baseline px-2 py-2 text-left transition-colors duration-[var(--duration-fast)] ${
                      lit && !selected ? "bg-paper-100" : ""
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`font-mono text-small ${selected ? "text-text-strong" : "text-text-muted"}`}
                    >
                      {pad(index + 1)}
                    </span>
                    <span id={`part-${entry.id}-name`} className="flex flex-wrap items-baseline gap-x-2">
                      <span className="font-display font-semibold text-text-strong">{entry.name}</span>
                      {entry.product && (
                        <span className="font-mono text-small text-text-muted">{entry.product}</span>
                      )}
                    </span>
                    <span id={`part-${entry.id}-role`} className="col-start-2 text-small text-text-body">
                      {entry.role}
                    </span>
                  </button>
                  {detail && (
                    <div className="flex flex-col items-start gap-1 pb-3 pl-[2.75rem] pr-2">
                      {entry.note && <p className="text-small text-text-muted">{entry.note}</p>}
                      {entry.guide && (
                        <a
                          href={entry.guide.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="relative block scroll-my-2 py-1 text-small font-semibold [@media(pointer:coarse)]:-my-2 [@media(pointer:coarse)]:py-3 text-text-strong underline decoration-ink-950/25 underline-offset-4 hover:decoration-rr-violet hover:decoration-2"
                        >
                          {/* Text flow, not flex: a wrapped label keeps the
                              arrow on its last word (no-break space). */}
                          Build guide: {entry.guide.label}
                          {"\u00a0"}
                          <ExternalMark />
                        </a>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>

          {/* pb-3: room below the last link for its focus ring and, on touch,
              for its 44 px tap area; scroll margin cannot scroll past the end. */}
          <p className="mt-3 px-2 pb-3 text-small text-text-body">
            Last step:{" "}
            <a
              href={WIRING_GUIDE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="relative inline-flex scroll-my-2 items-center gap-1 font-semibold [@media(pointer:coarse)]:-my-3 [@media(pointer:coarse)]:py-3 text-text-strong underline decoration-ink-950/25 underline-offset-4 hover:decoration-rr-violet hover:decoration-2"
            >
              wire it all together
              <ExternalMark />
            </a>
          </p>
        </section>

        <div className="relative order-1 h-[44svh] flex-none overflow-hidden rounded-media border border-ink-950/10 bg-paper-100 md:landscape:h-auto md:landscape:flex-1 lg:h-auto lg:flex-1">
          <ViewerBoundary>
            <Suspense fallback={<FrameMessage>Loading the 3D model</FrameMessage>}>
              <AssemblyCanvas
                explosion={exploded ? 1 : 0}
                focusParts={focusParts}
                highlightParts={highlightParts}
                resetKey={resetKey}
                instant={reduced}
                onSelect={selectPart}
                onHover={hoverPart}
              />
            </Suspense>
          </ViewerBoundary>

          <p className="pointer-events-none absolute left-3 top-3 font-mono text-eyebrow text-text-muted">
            <span className="[@media(pointer:coarse)]:hidden">Drag to turn · Scroll to zoom</span>
            <span className="hidden [@media(pointer:coarse)]:inline">Drag to turn · Pinch to zoom</span>
          </p>

          {/* One row at 360: the buttons tighten below 390 (ASM-01). */}
          <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-2 max-[24.375rem]:gap-1.5">
            <div
              role="group"
              aria-label="View"
              className="inline-flex rounded-btn border border-ink-950/15 bg-paper-50 p-0.5"
            >
              {views.map((view) => {
                const pressed = exploded === view.value;
                return (
                  <button
                    key={view.label}
                    type="button"
                    aria-pressed={pressed}
                    onClick={() => setExploded(view.value)}
                    className={`min-h-11 rounded-btn px-3 text-small font-semibold transition-colors duration-[var(--duration-fast)] max-[24.375rem]:px-2.5 [@media(pointer:fine)]:min-h-8 ${
                      pressed ? "bg-ink-950 text-text-on-ink" : "text-text-body hover:text-text-strong"
                    }`}
                  >
                    {view.label}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={resetView}
              className="min-h-11 rounded-btn border border-ink-950/15 bg-paper-50 px-3 text-small font-semibold text-text-strong transition-colors duration-[var(--duration-fast)] hover:border-ink-950/40 max-[24.375rem]:px-2.5 [@media(pointer:fine)]:min-h-9"
            >
              Reset view
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
