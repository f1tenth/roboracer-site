import { useEffect, useMemo, useState } from "react";
import { loadPublications, tagLabelMap, type Publication, type PublicationsFile } from "../lib/data";
import { authorLine, fold, paperHref, scholarSearchUrl, scholarTagUrl } from "../lib/publications";
import Section from "../components/ui/Section";
import SectionHeader from "../components/ui/SectionHeader";
import Button from "../components/ui/Button";
import Reveal from "../components/ui/Reveal";
import TagFilter from "../components/ui/TagFilter";
import PublicationCard from "../components/ui/PublicationCard";

const SCHOLAR_URL =
  "https://scholar.google.com/scholar?hl=en&as_sdt=0%2C39&q=f1tenth+%7C+roboracer+&btnG=";
const SUBMIT_MAILTO = "mailto:contact@roboracer.ai?subject=RoboRacer%20publication";
// Site-wide link contract (landing-v2): ink text, hairline underline, violet on hover.
const LINK =
  "underline underline-offset-4 decoration-ink-950/25 hover:decoration-rr-violet hover:decoration-2";

function matches(p: Publication, needle: string, labels: Record<string, string>): boolean {
  if (!needle) return true;
  const hay = fold(
    [p.title, p.authors.join(" "), p.venue, p.venue_short ?? "", String(p.year), ...p.tags.map((t) => labels[t] ?? t)].join(" "),
  );
  return needle.split(/\s+/).every((w) => hay.includes(w));
}

function Row({ p, labels }: { p: Publication; labels: Record<string, string> }) {
  const href = paperHref(p);
  const extras: { label: string; href: string }[] = [];
  const arxivHref = p.arxiv ? `https://arxiv.org/abs/${p.arxiv}` : undefined;
  const doiHref = p.doi ? `https://doi.org/${p.doi}` : undefined;
  if (arxivHref && arxivHref !== href) extras.push({ label: "arXiv", href: arxivHref });
  if (doiHref && doiHref !== href) extras.push({ label: "DOI", href: doiHref });
  if (p.pdf && p.pdf !== href) extras.push({ label: "PDF", href: p.pdf });
  return (
    <li className="grid gap-3 py-5 md:grid-cols-[1fr_auto] md:gap-8">
      <div>
        <h4 className="font-display text-body font-semibold leading-snug text-text-strong">
          {href ? (
            <a href={href} target="_blank" rel="noopener noreferrer" className={LINK}>
              {p.title}
            </a>
          ) : (
            p.title
          )}
        </h4>
        <p className="mt-1 text-small text-text-body">{authorLine(p.authors)}</p>
        <p className="mt-1 font-mono text-eyebrow tracking-normal text-text-muted">
          {p.venue_short?.trim() || p.venue || p.type}
          {p.tags.length > 0 ? ` · ${p.tags.map((t) => labels[t] ?? t).join(", ")}` : ""}
        </p>
      </div>
      {extras.length > 0 && (
        <ul className="flex gap-4 font-mono text-small md:justify-end" aria-label="Links">
          {extras.map((x) => (
            <li key={x.label}>
              <a
                href={x.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${x.label}: ${p.title}`}
                className={`text-text-strong ${LINK}`}
              >
                {x.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

/**
 * /research on the paper surface: the 1,000+ message with the Scholar query,
 * a topic filter over the featured grid (thumbnails), every curated paper
 * grouped by year with search, and the submit CTA. Renders from
 * public/data/publications.json (content is data).
 */
export default function Research() {
  const [pubs, setPubs] = useState<PublicationsFile | null>(null);
  const [failed, setFailed] = useState(false);
  const [tag, setTag] = useState<string | null>(null);
  const [query, setQuery] = useState("");

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

  return (
    <div className="pt-[68px] md:pt-[85px]">
      {/* Header: the Scholar message, one secondary CTA, a mono data ledger */}
      <Section aria-labelledby="research-title">
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
              This page curates a featured set by topic and lists every paper we track. The rest is
              one query away.
            </p>
            <div className="mt-8">
              <Button href={scholarUrl} variant="secondary" target="_blank" rel="noopener noreferrer">
                See the Scholar query
              </Button>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-5 border-t border-ink-950/10 pt-6 font-mono text-small text-text-muted md:col-span-4">
            <div>
              <dt>Curated papers</dt>
              <dd className="mt-1 font-display text-display-m font-semibold text-text-strong">
                {pubs ? published.length : "…"}
              </dd>
            </div>
            <div>
              <dt>Featured</dt>
              <dd className="mt-1 font-display text-display-m font-semibold text-text-strong">
                {pubs ? featuredAll.length : "…"}
              </dd>
            </div>
            <div>
              <dt>Topics</dt>
              <dd className="mt-1 text-text-strong">{pubs ? pubs.tags.length : "…"}</dd>
            </div>
            <div>
              <dt>Updated</dt>
              <dd className="mt-1 text-text-strong">{pubs ? pubs.updated : "…"}</dd>
            </div>
          </dl>
        </div>
      </Section>

      {/* Featured grid with the topic filter */}
      <Section rule aria-labelledby="featured">
        <SectionHeader
          eyebrow="Featured"
          id="featured"
          title="Selected papers"
          lead="Recent work on the platform, newest first. Filter by topic; each topic also links to its own Scholar search."
        />
        {failed && (
          <p className="max-w-[60ch] text-body text-text-body">
            The publication list could not load. The Scholar query above covers everything.
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
                  className={`text-text-strong ${LINK}`}
                >
                  Scholar: {selectedTag.label} ↗
                </a>
              )}
            </div>
            {featured.length > 0 ? (
              <Reveal key={tag ?? "all"} stagger className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {featured.map((p) => (
                  <PublicationCard key={p.id} publication={p} tagLabels={labels} />
                ))}
              </Reveal>
            ) : (
              <p className="mt-6 max-w-[60ch] text-body text-text-body">
                No featured paper is tagged {selectedTag?.label ?? "this topic"} yet. The full list
                below and the Scholar search cover it.
              </p>
            )}
          </>
        )}
      </Section>

      {/* Every curated paper, grouped by year, with search */}
      <Section edge rule aria-labelledby="all-curated">
        <SectionHeader
          eyebrow="All curated"
          id="all-curated"
          title="All curated publications"
          lead="Every paper we track, grouped by year. The topic filter above applies here too."
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
                No curated paper matches. Try a shorter term, or{" "}
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
                {byYear.map(([year, items]) => (
                  <section
                    key={year}
                    aria-labelledby={`year-${year}`}
                    className="grid gap-2 py-8 md:grid-cols-12 md:gap-6"
                  >
                    <h3
                      id={`year-${year}`}
                      className="font-mono text-small text-text-muted md:sticky md:top-28 md:col-span-2 md:self-start"
                    >
                      {year}
                    </h3>
                    <ul className="divide-y divide-ink-950/10 md:col-span-10">
                      {items.map((p) => (
                        <Row key={p.id} p={p} labels={labels} />
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            )}
          </>
        )}
      </Section>

      {/* Submit: the one solid CTA on the page */}
      <Section rule aria-labelledby="submit">
        <div className="grid gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <SectionHeader
              eyebrow="Contribute"
              id="submit"
              title="Submit your paper"
              lead="Published something that builds on the platform? Send the DOI or arXiv link and we add it to the curated list."
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
