import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { loadPublications, tagLabelMap, type Publication, type PublicationsFile } from "../lib/data";
import { fold, scholarSearchUrl, scholarTagUrl } from "../lib/publications";
import { DESKTOP_QUERY } from "../lib/motion";
import Section from "../components/ui/Section";
import SectionHeader from "../components/ui/SectionHeader";
import Button from "../components/ui/Button";
import StatTicker from "../components/ui/StatTicker";
import Reveal from "../components/ui/Reveal";
import TagFilter from "../components/ui/TagFilter";
import PaperCard from "../components/research/PaperCard";
import PaperRow from "../components/research/PaperRow";
import { rowThumb } from "../components/research/figures";

const SCHOLAR_URL =
  "https://scholar.google.com/scholar?hl=en&as_sdt=0%2C39&q=f1tenth+%7C+roboracer+&btnG=";
const SUBMIT_MAILTO = "mailto:contact@roboracer.ai?subject=RoboRacer%20publication";
// Site-wide link contract (landing-v2): ink text, hairline underline, violet on hover.
const LINK =
  "underline underline-offset-4 decoration-ink-950/25 hover:decoration-rr-violet hover:decoration-2";
/** Featured papers a phone shows before the rest fold away. */
const FEATURED_ON_PHONE = 4;
/** Papers each year shows before the rest fold away, at every size. /race
 * opens its recent years with four and five races (2026, 2025) and folds the
 * rest; four also fills two rows where a phone sets the list two across. */
const PER_YEAR = 4;
/** On a phone only the newest years open with their four; every older year
 * is its heading, its count and a closed fold (the page was 19,300px at 390
 * with every year showing four large figures). */
const OPEN_YEARS_ON_PHONE = 2;
// Two across from sm on a phone (a landscape phone, a small tablet held
// upright): a full-width figure there would be taller than the screen.
const FEATURED_GRID = "grid gap-6 compact:gap-4 sm:grid-cols-2 lg:grid-cols-3";
const YEAR_LIST = "compact:sm:grid compact:sm:grid-cols-2 compact:sm:gap-x-6";
// Touch screens get 2.75rem jump targets; the row takes the growth back.
const TAP = "coarse:inline-flex coarse:min-h-11 coarse:min-w-11 coarse:items-center";
// A jump lands under the fixed bar, not behind it.
const UNDER_NAV = "scroll-mt-[calc(var(--spacing-nav)+1rem)]";

/** The chevron summary every fold on the page shares (the race timeline's
 * pattern, the About page's mono label). */
const FOLD_SUMMARY =
  "flex cursor-pointer list-none flex-wrap items-baseline gap-x-3 gap-y-1 py-6 text-text-strong transition-colors hover:text-rr-violet [&::-webkit-details-marker]:hidden";

function papers(n: number): string {
  return `${n} ${n === 1 ? "paper" : "papers"}`;
}

function FoldChevron() {
  return (
    <span
      aria-hidden="true"
      className="inline-block font-display text-display-m leading-none transition-transform duration-[var(--duration-fast)] group-open:rotate-90 motion-reduce:transition-none"
    >
      &#8250;
    </span>
  );
}

/** True on a phone in either orientation (the `compact:` variant): where the
 * featured grid folds and the older years close. */
function useCompact(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(DESKTOP_QUERY);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => !window.matchMedia(DESKTOP_QUERY).matches,
    () => false,
  );
}

/**
 * One year of the list: its first PER_YEAR papers, then the rest behind a
 * native <details>, the race timeline's pattern (Cedric, 2026-09-25: "just
 * show a few ... and then show an option to display more, just like we had
 * for the races", so the submit section is not ages away). The summary is a
 * native control: it opens from the keyboard and without React, screen
 * readers announce it expanded or collapsed, focus stays on it and the next
 * Tab lands on the first paper it revealed, and find-in-page opens it. It
 * stays put while the papers open under it, so nothing above moves.
 * `open` is how many papers show before the fold: PER_YEAR, none for an
 * older year on a phone, every one while a topic or a search is set (every
 * match shows).
 */
function YearGroup({
  year,
  items,
  labels,
  open,
}: {
  year: number;
  items: Publication[];
  labels: Record<string, string>;
  open: number;
}) {
  const shown = items.slice(0, open);
  const rest = items.slice(open);
  return (
    <section aria-labelledby={`year-${year}`} className="py-8">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h3
          id={`year-${year}`}
          className={`font-display text-display-m font-semibold tabular-nums text-text-strong ${UNDER_NAV}`}
        >
          {year}
        </h3>
        <p className="font-mono text-small text-text-muted">{papers(items.length)}</p>
      </div>
      {shown.length > 0 && (
        <ul className={YEAR_LIST}>
          {shown.map((p) => (
            <PaperRow key={p.id} publication={p} tagLabels={labels} />
          ))}
        </ul>
      )}
      {rest.length > 0 && (
        <details className="group">
          {/* Built from the data, in /race's words: "Show 30 earlier events,
              2016 to 2024" / "Hide the 2016 to 2024 events". */}
          <summary className={`${FOLD_SUMMARY} border-t border-ink-950/10`}>
            <FoldChevron />
            <span className="font-mono text-small group-open:hidden">
              Show {rest.length}
              {shown.length > 0 ? " more" : ""} {rest.length === 1 ? "paper" : "papers"} from {year}
            </span>
            <span className="hidden font-mono text-small group-open:inline">
              Hide {papers(rest.length)} from {year}
            </span>
          </summary>
          <ul className={YEAR_LIST}>
            {rest.map((p) => (
              <PaperRow key={p.id} publication={p} tagLabels={labels} />
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}

function matches(p: Publication, needle: string, labels: Record<string, string>): boolean {
  if (!needle) return true;
  const hay = fold(
    [p.title, p.authors.join(" "), p.venue, p.venue_short ?? "", String(p.year), ...p.tags.map((t) => labels[t] ?? t)].join(" "),
  );
  return needle.split(/\s+/).every((w) => hay.includes(w));
}

/**
 * /research on the paper surface: the 1,000+ message with the Scholar query,
 * a topic filter over the featured grid (a figure or a generated venue tile
 * on every card), every curated paper grouped by year with search, and the
 * submit CTA. Renders from public/data/publications.json (content is data).
 */
export default function Research() {
  const [pubs, setPubs] = useState<PublicationsFile | null>(null);
  const [failed, setFailed] = useState(false);
  const [tag, setTag] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [featuredOpen, setFeaturedOpen] = useState(false);
  const compact = useCompact();

  useEffect(() => {
    loadPublications().then(setPubs).catch(() => setFailed(true));
  }, []);

  const labels = useMemo(() => (pubs ? tagLabelMap(pubs.tags) : {}), [pubs]);
  const published = useMemo(() => pubs?.items.filter((p) => p.status === "published") ?? [], [pubs]);
  const featuredAll = useMemo(() => published.filter((p) => p.featured), [published]);
  const featured = useMemo(() => featuredAll.filter((p) => !tag || p.tags.includes(tag)), [featuredAll, tag]);
  const needle = fold(query.trim());
  const listed = useMemo(
    () => published.filter((p) => (!tag || p.tags.includes(tag)) && matches(p, needle, labels)),
    [published, tag, needle, labels],
  );
  // Within a year, papers with a figure come first (a stable sort, so file
  // order holds otherwise and the xLAB papers that head the file still lead
  // their year): the four a year shows are then pictures wherever the year
  // has four, and the logo placeholders wait behind the fold.
  const byYear = useMemo(() => {
    const groups = new Map<number, Publication[]>();
    for (const p of listed) groups.set(p.year, [...(groups.get(p.year) ?? []), p]);
    const pictured = (p: Publication) => (rowThumb(p) ? 0 : 1);
    return [...groups.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([year, items]) => [year, items.sort((a, b) => pictured(a) - pictured(b))] as const);
  }, [listed]);
  const selectedTag = pubs?.tags.find((t) => t.id === tag);
  const scholarUrl = pubs?.scholar_query_url ?? SCHOLAR_URL;
  const trimmed = query.trim();

  // The list was 35,000px at 1536 and 37,000px at 768 before the submit
  // section, and 39,000px at 390 with every year open. Each year now shows
  // its first four papers and folds the rest (YearGroup); the year headings
  // all stay on the page. On a phone that was still 19,300px at 390, so
  // there only the two newest years open and every older year is a closed
  // fold under its heading. A topic or a search shows every match: nothing
  // it found is ever behind a fold, and the counts above never change.
  const paged = !tag && !needle;
  const openCount = (index: number, total: number) =>
    !paged ? total : compact && index >= OPEN_YEARS_ON_PHONE ? 0 : PER_YEAR;

  // The featured cards were 17 rows ahead of the search, which sat 7 screens
  // down at 390 (RESEARCH-01). On a phone the first four show and the rest
  // fold the same way. A topic shows all of its featured papers, as today. A
  // search leaves this fold alone: it does not filter the featured cards, and
  // unfolding thirteen of them above the box would push it off the screen
  // while the reader types.
  const featuredFolded = compact && !tag && featured.length > FEATURED_ON_PHONE;
  const featuredFirst = featuredFolded ? featured.slice(0, FEATURED_ON_PHONE) : featured;
  const featuredRest = featuredFolded ? featured.slice(FEATURED_ON_PHONE) : [];

  return (
    <div className="pt-nav">
      {/* Header: the Scholar message, one secondary CTA, a mono data ledger.
          On a phone it starts a rem under the bar, like the About and Race
          heroes. */}
      <Section width="page" className="compact:pt-4" aria-labelledby="research-title">
        <div className="grid gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <p className="mb-4 flex items-center gap-2 font-mono text-small text-text-muted">
              <span aria-hidden="true" className="h-1 w-1 bg-ink-950" />
              <span>Research</span>
            </p>
            <h1
              id="research-title"
              className="max-w-[16ch] font-display text-display-xl font-semibold text-text-strong"
            >
              1,000+ publications reference the platform
            </h1>
            <p className="mt-6 max-w-[60ch] text-lead text-text-body">
              A Google Scholar search for F1TENTH or RoboRacer returns more than a thousand results.
              This is a selection, by topic.
            </p>
            <div className="mt-8">
              <Button href={scholarUrl} variant="secondary" target="_blank" rel="noopener noreferrer">
                Search Google Scholar
              </Button>
            </div>
          </div>
          {/* The counts are the argument this page makes, so they run big and
              in violet and tick up (Cedric, 2026-08-23: five seconds felt
              slow; StatTicker now caps every count at the design system's
              1.2 s).
              Violet, not the logo gradient: gradient text is ink-only, its
              cyan stop being 1.9:1 on paper. Keyed on the fetch so the tween
              starts from the real number rather than from the "…" placeholder. */}
          <dl className="grid grid-cols-2 gap-x-6 gap-y-7 border-t border-ink-950/10 pt-6 font-mono text-small text-text-muted md:col-span-4">
            {pubs ? (
              <>
                <StatTicker
                  key={`curated-${published.length}`}
                  as="dl"
                  size="l"
                  tone="accent"
                  value={published.length}
                  label="Papers listed"
                />
                <StatTicker
                  key={`featured-${featuredAll.length}`}
                  as="dl"
                  size="l"
                  tone="accent"
                  value={featuredAll.length}
                  label="Featured"
                />
                <StatTicker
                  key={`topics-${pubs.tags.length}`}
                  as="dl"
                  size="l"
                  tone="accent"
                  delay={0.15}
                  value={pubs.tags.length}
                  label="Topics"
                />
              </>
            ) : (
              <>
                <div>
                  <dt className="font-mono text-small text-text-muted">Papers listed</dt>
                  <dd className="mt-1 font-mono text-display-l font-semibold text-text-muted">…</dd>
                </div>
                <div>
                  <dt className="font-mono text-small text-text-muted">Featured</dt>
                  <dd className="mt-1 font-mono text-display-l font-semibold text-text-muted">…</dd>
                </div>
                <div>
                  <dt className="font-mono text-small text-text-muted">Topics</dt>
                  <dd className="mt-1 font-mono text-display-l font-semibold text-text-muted">…</dd>
                </div>
              </>
            )}
            <div>
              <dt className="font-mono text-small text-text-muted">Updated</dt>
              <dd className="mt-1 font-mono text-body text-text-strong">{pubs ? pubs.updated : "…"}</dd>
            </div>
          </dl>
        </div>
      </Section>

      {/* Featured grid with the topic filter */}
      <Section width="page" rule aria-labelledby="featured">
        <SectionHeader
          eyebrow="Featured"
          id="featured"
          title="Selected papers"
          lead="Papers that build on RoboRacer. Filter by topic, and each topic links to its own Scholar search."
        />
        {failed && (
          <p className="max-w-[60ch] text-body text-text-body">
            The list didn't load. Try the Google Scholar search above.
          </p>
        )}
        {pubs && (
          <>
            <TagFilter tags={pubs.tags} selected={tag} onChange={setTag} label="Filter publications by topic" />
            <div className="mt-8 flex flex-wrap items-baseline justify-between gap-4 font-mono text-small text-text-muted">
              <p aria-live="polite">
                {featured.length} featured{selectedTag ? ` · ${selectedTag.label}` : ""}
              </p>
              {selectedTag && (
                <a
                  href={scholarTagUrl(selectedTag)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-text-strong ${LINK} coarse:-my-3 coarse:inline-flex coarse:min-h-11 coarse:items-center`}
                >
                  Scholar: {selectedTag.label} ↗
                </a>
              )}
            </div>
            {featured.length > 0 ? (
              <>
                <Reveal key={tag ?? "all"} stagger className={`mt-6 ${FEATURED_GRID}`}>
                  {featuredFirst.map((p) => (
                    <PaperCard key={p.id} publication={p} tagLabels={labels} />
                  ))}
                </Reveal>
                {featuredRest.length > 0 && (
                  <details
                    open={featuredOpen}
                    onToggle={(e) => setFeaturedOpen(e.currentTarget.open)}
                    className="group"
                  >
                    {/* Built from the data: how many featured papers wait. */}
                    <summary className={FOLD_SUMMARY}>
                      <FoldChevron />
                      <span className="font-mono text-small group-open:hidden">
                        Show {featuredRest.length} more featured {featuredRest.length === 1 ? "paper" : "papers"}
                      </span>
                      <span className="hidden font-mono text-small group-open:inline">
                        Hide {featuredRest.length} featured {featuredRest.length === 1 ? "paper" : "papers"}
                      </span>
                    </summary>
                    <div className={FEATURED_GRID}>
                      {featuredRest.map((p) => (
                        <PaperCard key={p.id} publication={p} tagLabels={labels} />
                      ))}
                    </div>
                  </details>
                )}
              </>
            ) : (
              <p className="mt-6 max-w-[60ch] text-body text-text-body">
                No featured paper on {selectedTag?.label ?? "this topic"} yet. Try the full list or the
                Scholar search.
              </p>
            )}
          </>
        )}
      </Section>

      {/* Every curated paper, grouped by year, with search */}
      <Section width="page" edge rule aria-labelledby="all-curated">
        <SectionHeader
          eyebrow="All papers"
          id="all-curated"
          title="Every paper we track"
          lead="By year, newest first. The topic filter above works here too."
          action={
            <form role="search" onSubmit={(e) => e.preventDefault()} className="w-full md:w-80">
              <label htmlFor="publication-search" className="eyebrow mb-2 block text-text-muted">
                Search
              </label>
              <input
                id="publication-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Title, author, venue"
                autoComplete="off"
                className="w-full rounded-btn border border-ink-950/20 bg-paper-50 px-4 py-3 text-body text-text-strong placeholder:text-text-muted hover:border-ink-950/50"
              />
            </form>
          }
        />
        {pubs && (
          <>
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
              <p className="font-mono text-small text-text-muted" aria-live="polite">
                {listed.length} of {published.length} papers
                {selectedTag ? ` · ${selectedTag.label}` : ""}
                {trimmed ? ` · “${trimmed}”` : ""}
              </p>
              {/* The years on the list and the way past it, so a reader can
                  skip to a year or to the submit section without scrolling
                  through the rest (Cedric, 2026-09-25). Built from the data:
                  a topic or a search lists only the years it matched. */}
              {byYear.length > 0 && (
                <nav aria-label="Jump to">
                  <ul className="flex flex-wrap items-baseline gap-x-4 gap-y-1 font-mono text-small coarse:-my-3 coarse:gap-x-1">
                    {byYear.map(([year]) => (
                      <li key={year}>
                        <a href={`#year-${year}`} className={`tabular-nums text-text-strong ${LINK} ${TAP}`}>
                          {year}
                        </a>
                      </li>
                    ))}
                    <li>
                      <a href="#contribute" className={`text-text-strong ${LINK} ${TAP}`}>
                        Submit your paper
                        <span aria-hidden="true"> ↓</span>
                      </a>
                    </li>
                  </ul>
                </nav>
              )}
            </div>
            {byYear.length === 0 ? (
              <p className="max-w-[60ch] border-t border-ink-950/10 py-8 text-body text-text-body">
                No paper matches. Try a shorter word, or{" "}
                <a
                  href={scholarSearchUrl(trimmed)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-text-strong ${LINK}`}
                >
                  search Scholar for “{trimmed}”
                </a>
                .
              </p>
            ) : (
              <div className="divide-y divide-ink-950/10 border-t border-ink-950/10">
                {/* The year was a sticky two-column rail, which pushed every
                    figure a sixth of the page in from the left and kept the
                    pictures small (Cedric, 2026-08-23). It is a heading now,
                    and the rows run the full width. */}
                {byYear.map(([year, items], i) => (
                  <YearGroup
                    key={year}
                    year={year}
                    items={items}
                    labels={labels}
                    open={openCount(i, items.length)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </Section>

      {/* Submit: the one solid CTA on the page */}
      <Section width="page" rule id="contribute" className={UNDER_NAV} aria-labelledby="submit">
        <div className="grid gap-6 desktop:gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <SectionHeader
              eyebrow="Contribute"
              id="submit"
              className="max-md:mb-2"
              title="Submit your paper"
              lead="Send us the DOI or arXiv link for your RoboRacer paper. We'll add it to the list."
            />
          </div>
          <div className="flex flex-col items-start gap-4 md:col-span-5 md:items-end">
            <Button href={SUBMIT_MAILTO}>Submit your paper</Button>
            <p className="font-mono text-small text-text-muted">contact@roboracer.ai</p>
          </div>
        </div>
      </Section>
    </div>
  );
}
