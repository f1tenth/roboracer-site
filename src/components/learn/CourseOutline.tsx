import { useId, useState } from "react";
import type { CourseOutline as Outline, OutlineItem, OutlineModule } from "../../lib/data";
import { useLectureProgress } from "../../hooks/useLectureProgress";
import LearnLink, { FoldChevron } from "./LearnLink";
import { LecturePlayer, LectureThumb, RecordingStack, SlidesLink, WatchButton } from "./LectureWatch";
import { FOLD_SUMMARY, MONO_NOTE, listWords, moduleRange } from "./learnStyles";

/** Micro-labels this unit introduces (stage 3 moves them into courses.json).
 * `{done}`, `{total}` and `{label}` are filled in at render. */
const LABELS = {
  expandAll: "Expand all",
  collapseAll: "Collapse all",
  meter: "{done} of {total} done in this outline",
  moduleDone: "{done} of {total} done",
  mark: "Mark {label} as done",
  done: "Done",
  local: "Ticks are saved in this browser only. Nothing is sent.",
  blocked: "This browser is blocking storage, so these ticks will not be kept. Nothing is sent.",
  clear: "Clear ticks",
  recorded: "recorded",
  assigns: "assigns {labs}",
};

const fill = (s: string, values: Record<string, string | number>) =>
  s.replace(/\{(\w+)\}/g, (_, k: string) => String(values[k] ?? ""));

type CourseOutlineProps = {
  outline: Outline;
  /** The modules to list, in order: all seven on the catalog, a plan's own on
   * its course page. */
  modules: OutlineModule[];
  /** The course site's overview links (Start here, Syllabus, All labs ...). */
  showLinks?: boolean;
};

/** A small control on the outline's toolbar: mono, ink hairline, 2.75rem on
 * touch screens. */
const TOOL =
  "inline-flex items-center gap-2 rounded-btn border border-ink-950/20 px-3 py-1.5 font-mono text-small text-text-strong transition-colors duration-[var(--duration-fast)] hover:border-rr-violet hover:text-rr-violet-deep disabled:cursor-default disabled:border-ink-950/10 disabled:text-text-muted coarse:min-h-11";

/** The ink-stroke tick inside a checked box and a completed module chip. */
function Tick({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true" focusable="false" className={className}>
      <path d="M3 8.5 6.5 12 13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** A real checkbox, 2.75rem square to the finger (the padding is taken back
 * by the negative margin), filled violet with a white tick when done. */
function DoneBox({ item, checked, onChange }: { item: OutlineItem; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="-m-3 inline-flex shrink-0 cursor-pointer items-center gap-2 p-3 font-mono text-small text-text-muted">
      <span className="relative inline-flex h-5 w-5">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.currentTarget.checked)}
          aria-label={fill(LABELS.mark, { label: item.label })}
          className="peer h-5 w-5 cursor-pointer appearance-none rounded-btn border-[1.5px] border-ink-950/35 bg-paper-50 transition-colors duration-[var(--duration-fast)] checked:border-rr-violet checked:bg-rr-violet hover:border-rr-violet motion-reduce:transition-none"
        />
        <Tick className="pointer-events-none absolute inset-0 m-auto h-3.5 w-3.5 scale-50 text-white opacity-0 transition-[opacity,scale] duration-[var(--duration-fast)] ease-[var(--ease-out-expo)] peer-checked:scale-100 peer-checked:opacity-100 motion-reduce:transition-none" />
      </span>
      <span className={`max-sm:sr-only ${checked ? "text-rr-violet-deep" : ""}`}>{LABELS.done}</span>
    </label>
  );
}

/** "2 of 3 done": neutral at zero, a magenta-tint chip once something is
 * ticked, filled violet with a tick when the module is complete. */
function DoneChip({ done, total }: { done: number; total: number }) {
  const all = total > 0 && done === total;
  const tone = all
    ? "border-rr-violet bg-rr-violet text-white"
    : done > 0
      ? "border-rr-magenta/25 bg-rr-magenta/10 text-rr-magenta-deep"
      : "border-ink-950/10 bg-paper-100 text-text-muted";
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-pill border px-2.5 py-0.5 font-mono text-small transition-colors duration-[var(--duration-fast)] motion-reduce:transition-none ${tone}`}
    >
      {all && <Tick className="h-3 w-3" />}
      {fill(LABELS.moduleDone, { done, total })}
    </span>
  );
}

/**
 * The course, module by module, as native <details> folds (the /research
 * pattern), made something to work through: a violet letter badge and a
 * "2 of 3 done" chip on every module head; inside, each lecture and tutorial
 * is a tile with its recording's thumbnail (or a type tile with its number),
 * a link to its coursekit page, a Watch pill that opens the recording inline
 * (one at a time), a Slides link and a real "done" checkbox. Above the folds:
 * Expand / Collapse all, a meter of what is ticked, and the note that ticks
 * stay in this browser, with Clear. Shared by the catalog (03) and the course
 * page (Outline); the props are the same as before the ticks.
 */
export default function CourseOutline({ outline, modules, showLinks = false }: CourseOutlineProps) {
  const uid = useId();
  const { done, persistent, setDone, clear } = useLectureProgress();
  // The first module starts open so the outline shows its pictures at once.
  const [openIds, setOpenIds] = useState<ReadonlySet<string>>(() => new Set(modules.slice(0, 1).map((m) => m.id)));
  // href of the one recording playing, if any.
  const [watching, setWatching] = useState<string | null>(null);

  const labsById = new Map(outline.labs.map((l) => [l.id, l]));
  const racesById = new Map(outline.races.map((r) => [r.id, r]));
  const labLabel = (id: string) => labsById.get(id)?.label ?? id;
  const shownIds = modules.map((m) => m.id);
  // The final project runs through E to G: list it only where all of them are.
  const project = outline.final_project;
  const hasProject = project.modules.every((id) => shownIds.includes(id));

  const hrefs = modules.flatMap((m) => m.items.map((i) => i.href));
  const doneCount = hrefs.filter((h) => done.has(h)).length;
  const allOpen = modules.length > 0 && modules.every((m) => openIds.has(m.id));

  const setOpen = (m: OutlineModule, open: boolean) => {
    setOpenIds((prev) => {
      if (prev.has(m.id) === open) return prev;
      const next = new Set(prev);
      if (open) next.add(m.id);
      else next.delete(m.id);
      return next;
    });
    // A closed fold must not keep playing out of sight.
    if (!open && watching && m.items.some((i) => i.href === watching)) setWatching(null);
  };

  const toggleAll = () => {
    if (allOpen) {
      setOpenIds(new Set());
      setWatching(null);
    } else {
      setOpenIds(new Set(shownIds));
    }
  };

  return (
    <div>
      {/* Toolbar: the meter, Expand / Collapse all, the local-only note and
          Clear. Its height never depends on the count (no shift on a tick). */}
      <div className="mb-6 grid gap-x-8 gap-y-3 rounded-card border border-ink-950/10 bg-paper-100 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-5">
        <div className="min-w-0">
          <p className="font-mono text-small text-text-strong" aria-live="polite" aria-atomic="true">
            {LABELS.meter.split("{done}").map((part, n) => (
              <span key={n}>
                {n > 0 && (
                  <span className="mr-1 font-display text-display-s font-semibold tabular-nums text-rr-violet-deep">
                    {doneCount}
                  </span>
                )}
                {fill(part, { total: hrefs.length })}
              </span>
            ))}
          </p>
          <div aria-hidden="true" className="mt-2 h-2 overflow-hidden rounded-pill bg-paper-200">
            <div
              className="h-full origin-left rounded-pill bg-rr-violet transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)] motion-reduce:transition-none"
              style={{ transform: `scaleX(${hrefs.length ? doneCount / hrefs.length : 0})` }}
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={toggleAll} className={TOOL}>
            <span aria-hidden="true" className="font-display text-lead leading-none">
              {allOpen ? "−" : "+"}
            </span>
            {allOpen ? LABELS.collapseAll : LABELS.expandAll}
          </button>
          <button type="button" onClick={() => clear(hrefs)} disabled={doneCount === 0} className={TOOL}>
            {LABELS.clear}
          </button>
        </div>
        <p className={`${MONO_NOTE} sm:col-span-2`}>{persistent ? LABELS.local : LABELS.blocked}</p>
      </div>

      <div className="border-t border-ink-950/10">
        {modules.map((m) => {
          const labs = m.labs.map((id) => labsById.get(id)).filter((l) => l !== undefined);
          const races = m.races.map((id) => racesById.get(id)).filter((r) => r !== undefined);
          const meta = [
            labs.length ? listWords(labs.map((l) => l.label)) : "",
            races.length ? listWords(races.map((r) => r.title)) : "",
          ]
            .filter(Boolean)
            .join(" · ");
          const moduleDone = m.items.filter((i) => done.has(i.href)).length;
          return (
            <details
              key={m.id}
              open={openIds.has(m.id)}
              onToggle={(e) => setOpen(m, e.currentTarget.open)}
              className="group border-b border-ink-950/10"
            >
              <summary className={`${FOLD_SUMMARY} items-start`}>
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-btn bg-rr-violet font-mono text-lead font-semibold text-white md:h-12 md:w-12 md:text-display-s"
                >
                  {m.id}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-lead font-semibold">
                    <span className="sr-only">Module {m.id}: </span>
                    {m.title}
                  </span>
                  <span className="mt-1 block max-w-[62ch] text-body text-text-body">{m.summary}</span>
                  <span className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
                    {meta && <span className={MONO_NOTE}>{meta}</span>}
                    <DoneChip done={moduleDone} total={m.items.length} />
                  </span>
                </span>
                <RecordingStack items={m.items} />
                <span className="pt-[0.1em]">
                  <FoldChevron />
                </span>
              </summary>
              <div className="grid gap-8 pb-8 transition-opacity duration-[var(--duration-base)] starting:opacity-0 motion-reduce:transition-none md:pl-16 lg:grid-cols-12 lg:gap-x-10">
                <ol className="flex flex-col gap-3 lg:col-span-8">
                  {m.items.map((item, n) => {
                    const checked = done.has(item.href);
                    const open = watching === item.href;
                    const panelId = `${uid}-${m.id}-${n}`;
                    const toggleWatch = () => setWatching(open ? null : item.href);
                    const recordedNote = item.video && !item.video_id;
                    return (
                      <li
                        key={item.href}
                        className={`grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-3 gap-y-3 rounded-card border p-2.5 transition-[translate,box-shadow,border-color,background-color] duration-[var(--duration-fast)] sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-x-4 sm:p-3 lg:grid-cols-[11rem_minmax(0,1fr)] motion-reduce:transition-none ${
                          checked ? "border-rr-violet/45 bg-rr-violet/[0.04]" : "border-ink-950/10 bg-paper-50"
                        } ${open ? "shadow-card" : "hover:shadow-card-hover motion-safe:hover:-translate-y-0.5"}`}
                      >
                        <LectureThumb item={item} open={open} onToggle={toggleWatch} />
                        <div className="flex min-w-0 flex-col">
                          <div className="flex items-start justify-between gap-3">
                            <span className={`${MONO_NOTE} pt-0.5`}>{item.label}</span>
                            <DoneBox item={item} checked={checked} onChange={(v) => setDone(item.href, v)} />
                          </div>
                          <span className="mt-1 text-body font-semibold leading-snug">
                            <LearnLink href={item.href}>{item.title}</LearnLink>
                          </span>
                          {(item.labs?.length || recordedNote) && (
                            <span className={`mt-1 block ${MONO_NOTE}`}>
                              {[
                                recordedNote ? LABELS.recorded : "",
                                item.labs?.length ? fill(LABELS.assigns, { labs: listWords(item.labs.map(labLabel)) }) : "",
                              ]
                                .filter(Boolean)
                                .join(" · ")}
                            </span>
                          )}
                          {(item.video_id || item.slides_url) && (
                            <span className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-3">
                              {item.video_id && (
                                <WatchButton item={item} open={open} panelId={panelId} onToggle={toggleWatch} />
                              )}
                              <SlidesLink item={item} />
                            </span>
                          )}
                        </div>
                        {open && <LecturePlayer item={item} id={panelId} />}
                      </li>
                    );
                  })}
                </ol>
                <div className="flex flex-col gap-6 sm:flex-row sm:flex-wrap sm:gap-x-10 lg:col-span-4 lg:flex-col lg:flex-nowrap">
                  {labs.length > 0 && (
                    <div>
                      <p className={MONO_NOTE}>Labs</p>
                      <ul className="mt-2 flex flex-col gap-2 text-body">
                        {labs.map((l) => (
                          <li key={l.id} className="border-l-2 border-rr-violet/40 pl-3">
                            <LearnLink href={l.href}>{`${l.label}: ${l.title}`}</LearnLink>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {races.length > 0 && (
                    <div>
                      <p className={MONO_NOTE}>Race</p>
                      <ul className="mt-2 flex flex-col gap-2 text-body">
                        {races.map((r) => (
                          <li key={r.id} className="border-l-2 border-rr-magenta/50 pl-3">
                            <LearnLink href={r.href}>{r.title}</LearnLink>
                            <span className="block text-small text-text-body">{r.body}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <p className="text-body">
                    <LearnLink href={m.href}>{`Module ${m.id} on the course site`}</LearnLink>
                  </p>
                </div>
              </div>
            </details>
          );
        })}
      </div>

      {hasProject && (
        <div className="grid gap-x-10 gap-y-2 border-b border-ink-950/10 py-6 md:grid-cols-12">
          <p className={`${MONO_NOTE} md:col-span-3`}>
            {project.weeks} weeks · Modules {moduleRange(project.modules)}
          </p>
          <div className="md:col-span-9">
            <p className="font-display text-lead font-semibold text-text-strong">
              <LearnLink href={project.href}>{project.title}</LearnLink>
            </p>
            <p className="mt-1 max-w-[62ch] text-body text-text-body">{project.body}</p>
          </div>
        </div>
      )}

      {showLinks && outline.links.length > 0 && (
        <div className="mt-8 flex flex-wrap items-baseline gap-x-6 gap-y-2">
          <p className={MONO_NOTE}>On the course site</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-small font-semibold">
            {outline.links.map((l) => (
              <li key={l.href}>
                <LearnLink href={l.href}>{l.label}</LearnLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
