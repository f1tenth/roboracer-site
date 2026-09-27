import Section from "../ui/Section";
import LearnLink from "./LearnLink";

/** The course material itself, for when courses.json does not load. */
const COURSEKIT_URL = "https://f1tenth-coursekit.readthedocs.io/en/latest/";

/**
 * The state of a course page before courses.json arrives (a window-tall
 * placeholder, so the footer does not flash up) and if it fails (one line
 * and the course site, which holds everything the page lists).
 */
export default function CoursesUnavailable({ failed }: { failed: boolean }) {
  if (!failed) return <div aria-busy="true" className="min-h-[100svh] pt-nav" />;
  return (
    <div className="pt-nav">
      <Section width="page" className="compact:pt-4">
        <h1 className="font-display text-display-l font-semibold text-text-strong">Courses</h1>
        <p className="mt-6 max-w-[60ch] text-lead text-text-body">
          The course list did not load. Everything it lists is on the course site.
        </p>
        <p className="mt-6 text-body font-semibold">
          <LearnLink href={COURSEKIT_URL}>Open the course site</LearnLink>
        </p>
      </Section>
    </div>
  );
}
