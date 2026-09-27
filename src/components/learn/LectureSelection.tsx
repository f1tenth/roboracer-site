import { Link } from "react-router-dom";
import { lectureSelection, type CoursesFile } from "../../lib/data";
import Reveal from "../ui/Reveal";
import { LINK, MONO_NOTE } from "./learnStyles";

/**
 * The teach page's "Choose your lectures" table: one row per module, its
 * required labs, and a mark under each plan that includes it. Straight from
 * lectureSelection(), so it can never disagree with `plans`. Below lg the
 * labs move under the module name; on a phone the plan headings shorten to
 * the number of weeks.
 */
export default function LectureSelection({ courses }: { courses: CoursesFile }) {
  const rows = lectureSelection(courses);
  const { plans } = courses;
  return (
    <Reveal>
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">Modules and required labs in each plan</caption>
        <thead>
          <tr className="border-b border-ink-950/15">
            <th scope="col" className={`py-3 pr-4 font-normal ${MONO_NOTE}`}>
              Module
            </th>
            <th scope="col" className={`hidden py-3 pr-4 font-normal lg:table-cell ${MONO_NOTE}`}>
              Required labs
            </th>
            {plans.map((p) => (
              <th key={p.id} scope="col" className="w-10 py-3 text-center font-normal sm:w-24 lg:w-28">
                <Link to={`/learn/courses/${p.id}`} className={`font-mono text-small font-semibold ${LINK}`}>
                  {p.weeks}
                  <span className="max-sm:sr-only"> weeks</span>
                </Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.module.id} className="border-b border-ink-950/10">
              <th scope="row" className="py-4 pr-4 text-left align-top font-normal">
                <span className="flex gap-3">
                  <span className="w-5 shrink-0 font-mono text-body font-semibold text-text-strong">{r.module.id}</span>
                  <span className="min-w-0">
                    <span className="block text-body text-text-strong">{r.module.title}</span>
                    {r.labs.length > 0 && (
                      <span className={`mt-1 block lg:hidden ${MONO_NOTE}`}>
                        {r.labs.map((l) => l.label).join(", ")}
                      </span>
                    )}
                  </span>
                </span>
              </th>
              <td className="hidden py-4 pr-4 align-top lg:table-cell">
                {r.labs.length > 0 ? (
                  <ul className="flex flex-col gap-1 font-mono text-small text-text-body">
                    {r.labs.map((l) => (
                      <li key={l.id}>
                        {l.label}: {l.title}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className={MONO_NOTE}>none</span>
                )}
              </td>
              {plans.map((p) => {
                const on = r.plans.includes(p.id);
                return (
                  <td key={p.id} className="py-4 align-top">
                    {/* One line box tall, so the mark sits level with the
                        module name whichever it is. */}
                    <span aria-hidden="true" className="mx-auto flex h-[1.6em] w-3 items-center justify-center">
                      {on ? (
                        <span className="block h-2.5 w-2.5 bg-ink-950" />
                      ) : (
                        <span className="block h-px w-3 bg-ink-950/30" />
                      )}
                    </span>
                    <span className="sr-only">{on ? "included" : "not included"}</span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </Reveal>
  );
}
