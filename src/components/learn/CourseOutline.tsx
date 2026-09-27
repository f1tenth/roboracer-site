import type { CourseOutline as Outline, OutlineItem, OutlineModule } from "../../lib/data";
import LearnLink, { FoldChevron } from "./LearnLink";
import { FOLD_SUMMARY, MONO_NOTE, listWords, moduleRange } from "./learnStyles";

type CourseOutlineProps = {
  outline: Outline;
  /** The modules to list, in order: all seven on the catalog, a plan's own on
   * its course page. */
  modules: OutlineModule[];
  /** The course site's overview links (Start here, Syllabus, All labs ...). */
  showLinks?: boolean;
};

/** The mono line under a lecture: what its course-site page carries. */
function itemFlags(item: OutlineItem, labLabel: (id: string) => string): string {
  const flags: string[] = [];
  if (item.slides) flags.push("slides");
  if (item.video) flags.push("recorded");
  if (item.labs?.length) flags.push(`assigns ${listWords(item.labs.map(labLabel))}`);
  return flags.join(" · ");
}

/**
 * The course, module by module, as native <details> folds (the /research
 * pattern): the summary is the module's letter, name, one sentence and its
 * labs and races, so the closed list already reads as an outline; opening
 * it lists every lecture and tutorial with a link to its page on the course
 * site, then the module's labs and races. Shared by the catalog (03) and the
 * course page (Outline).
 */
export default function CourseOutline({ outline, modules, showLinks = false }: CourseOutlineProps) {
  const labsById = new Map(outline.labs.map((l) => [l.id, l]));
  const racesById = new Map(outline.races.map((r) => [r.id, r]));
  const labLabel = (id: string) => labsById.get(id)?.label ?? id;
  const shownIds = modules.map((m) => m.id);
  // The final project runs through E to G: list it only where all of them are.
  const project = outline.final_project;
  const hasProject = project.modules.every((id) => shownIds.includes(id));

  return (
    <div>
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
          return (
            <details key={m.id} className="group border-b border-ink-950/10">
              <summary className={`${FOLD_SUMMARY} items-start`}>
                <span
                  aria-hidden="true"
                  className="w-8 shrink-0 font-mono text-display-s font-semibold leading-tight md:w-14"
                >
                  {m.id}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-lead font-semibold">
                    <span className="sr-only">Module {m.id}: </span>
                    {m.title}
                  </span>
                  <span className="mt-1 block max-w-[62ch] text-body text-text-body">{m.summary}</span>
                  {meta && <span className={`mt-2 block ${MONO_NOTE}`}>{meta}</span>}
                </span>
                <span className="pt-[0.1em]">
                  <FoldChevron />
                </span>
              </summary>
              <div className="grid gap-8 pb-8 md:grid-cols-12 md:gap-x-10 md:pl-[4.5rem]">
                <ol className="md:col-span-7 lg:col-span-8">
                  {m.items.map((item) => {
                    const flags = itemFlags(item, labLabel);
                    return (
                      <li
                        key={item.href}
                        className="grid gap-x-4 gap-y-1 border-t border-ink-950/10 py-3 first:border-t-0 first:pt-0 sm:grid-cols-[9rem_minmax(0,1fr)]"
                      >
                        <span className={MONO_NOTE}>{item.label}</span>
                        <span className="min-w-0 text-body">
                          <LearnLink href={item.href}>{item.title}</LearnLink>
                          {flags && <span className={`mt-1 block ${MONO_NOTE}`}>{flags}</span>}
                        </span>
                      </li>
                    );
                  })}
                </ol>
                <div className="flex flex-col gap-6 md:col-span-5 lg:col-span-4">
                  {labs.length > 0 && (
                    <div>
                      <p className={MONO_NOTE}>Labs</p>
                      <ul className="mt-2 flex flex-col gap-2 text-body">
                        {labs.map((l) => (
                          <li key={l.id}>
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
                          <li key={r.id}>
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
