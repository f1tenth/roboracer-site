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

const SCHOLAR_URL =
  "https://scholar.google.com/scholar?hl=en&as_sdt=0%2C39&q=f1tenth+%7C+roboracer+&btnG=";
const SUBMIT_MAILTO = "mailto:contact@roboracer.ai?subject=RoboRacer%20publication";
// Site-wide link contract (landing-v2): ink text, hairline underline, violet on hover.
const LINK =
  "underline underline-offset-4 decoration-ink-950/25 hover:decoration-rr-violet hover:decoration-2";

/** True on a phone in either orientation (the `compact:` variant): the one
 * place the list folds its earlier years away. */
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

function YearGroup({ year, items, labels }: { year: number; items: Publication[]; labels: Record<string, string> }) {
  return (
    <section aria-labelledby={`year-${year}`} className="py-8">
      <h3
        id={`year-${year}`}
        className="mb-4 font-display text-display-m font-semibold tabular-nums text-text-strong"
      >
        {year}
      </h3>
      <ul className="divide-y divide-ink-950/10 border-t border-ink-950/10">
        {items.map((p) => (
          <PaperRow key={p.id} publication={p} tagLabels={labels} />
        ))}
      </ul>
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
  const [earlierOpen, setEarlierOpen] = useState(false);
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
  const byYear = useMemo(() => {
    const groups = new Map<number, Publication[]>();
    for (const p of listed) groups.set(p.year, [...(groups.get(p.year) ?? []), p]);
    return [...groups.entries()].sort((a, b) => b[0] - a[0]);
  }, [listed]);
  const selectedTag = pubs?.tags.find((t) => t.id === tag);
  const scholarUrl = pubs?.scholar_query_url ?? SCHOLAR_URL;
  const trimmed = query.trim();

  // On a phone the list was 39,000px of rows (47 screens at 390), so every
  // year before the newest one folds into one native <details>, the race
  // timeline's pattern: it opens without React, from the keyboard, and to
  // find-in-page. A topic or a search shows every year open, so no match is
  // ever behind the fold. Desktop and tablets keep every year open.
  const newestYear = published.reduce((y, p) => Math.max(y, p.year), 0);
  const folded = compact && !tag && !needle;
  const recent = folded ? byYear.filter(([year]) => year >= newestYear) : byYear;
  const earlier = folded ? byYear.filter(([year]) => year < newestYear) : [];
  const earlierCount = earlier.reduce((n, [, items]) => n + items.length, 0);

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
              Google Scholar returns more than a thousand papers on F1TENTH and RoboRacer. This is a
              selection, by topic.
            </p>
            <div className="mt-8">
              <Button href={scholarUrl} variant="secondary" target="_blank" rel="noopener noreferrer">
                Search Google Scholar
              </Button>
            </div>
          </div>
          {/* The counts are the argument this page makes, so they run big and
              in violet and tick up over two and a half seconds (Cedric,
              2026-08-23: five felt slow).
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
                  duration={2.5}
                  value={published.length}
                  label="Papers listed"
                />
                <StatTicker
                  key={`featured-${featuredAll.length}`}
                  as="dl"
                  size="l"
                  tone="accent"
                  duration={2.5}
                  value={featuredAll.length}
                  label="Featured"
                />
                <StatTicker
                  key={`topics-${pubs.tags.length}`}
                  as="dl"
                  size="l"
                  tone="accent"
                  duration={2.5}
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
              <Reveal key={tag ?? "all"} stagger className="mt-6 grid gap-6 compact:gap-4 md:grid-cols-2 lg:grid-cols-3">
                {featured.map((p) => (
                  <PaperCard key={p.id} publication={p} tagLabels={labels} />
                ))}
              </Reveal>
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
            <p className="mb-2 font-mono text-small text-text-muted" aria-live="polite">
              {listed.length} of {published.length} papers
              {selectedTag ? ` · ${selectedTag.label}` : ""}
              {trimmed ? ` · “${trimmed}”` : ""}
            </p>
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
                {recent.map(([year, items]) => (
                  <YearGroup key={year} year={year} items={items} labels={labels} />
                ))}
                {earlier.length > 0 && (
                  <details
                    open={earlierOpen}
                    onToggle={(e) => setEarlierOpen(e.currentTarget.open)}
                    className="group"
                  >
                    {/* Built from the data: the folded years and how many
                        papers they hold, in the year headings' own type. */}
                    <summary className="flex cursor-pointer list-none flex-wrap items-baseline gap-x-3 gap-y-1 py-8 text-text-strong transition-colors hover:text-rr-violet [&::-webkit-details-marker]:hidden">
                      <span
                        aria-hidden="true"
                        className="inline-block font-display text-display-m leading-none transition-transform duration-[var(--duration-fast)] group-open:rotate-90 motion-reduce:transition-none"
                      >
                        &#8250;
                      </span>
                      <span className="font-display text-display-m font-semibold tabular-nums">
                        {earlier[earlier.length - 1][0]} to {earlier[0][0]}
                      </span>
                      <span className="sr-only">,</span>
                      <span className="font-mono text-small text-text-muted">
                        {earlierCount} {earlierCount === 1 ? "paper" : "papers"}
                      </span>
                    </summary>
                    <div className="divide-y divide-ink-950/10 border-t border-ink-950/10">
                      {earlier.map(([year, items]) => (
                        <YearGroup key={year} year={year} items={items} labels={labels} />
                      ))}
                    </div>
                  </details>
                )}
              </div>
            )}
          </>
        )}
      </Section>

      {/* Submit: the one solid CTA on the page */}
      <Section width="page" rule aria-labelledby="submit">
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
