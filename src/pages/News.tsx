import { useEffect, useMemo, useState } from "react";
import Section from "../components/ui/Section";
import SectionHeader from "../components/ui/SectionHeader";
import Button from "../components/ui/Button";
import StatTicker from "../components/ui/StatTicker";
import Reveal from "../components/ui/Reveal";
import TagFilter from "../components/ui/TagFilter";
import NewsCard from "../components/news/NewsCard";
import NewsLead from "../components/news/NewsLead";
import NewsEmpty from "../components/news/NewsEmpty";
import { eventLabel, formatIsoDate, loadNewsFeed, type NewsFeed, type NewsItem } from "../components/news/newsData";
import { useDesktop } from "../lib/motion";

const SLACK_URL =
  "https://join.slack.com/t/robo-racer/shared_invite/zt-42lsbf50y-_3YPNLl_d3s~wPylAOMg0g";
const MAILTO = "mailto:contact@roboracer.ai?subject=RoboRacer%20news";
const INSTAGRAM_URL = "https://www.instagram.com/roboracer.ai/";
// Site-wide link contract (landing-v2): ink text, hairline underline, violet on hover.
const LINK =
  "underline underline-offset-4 decoration-ink-950/25 hover:decoration-rr-violet hover:decoration-2";

/** Items each year shows before the rest fold away, at every size (the
 * /research pattern: four fills two rows of the two-column grid). */
const PER_YEAR = 4;
/** On a phone only the newest years open with their four; every older year
 * is its heading, its count and a closed fold. With the history back to 2016
 * (75 items) the phone page was far past 12,000 px with every year open. */
const OPEN_YEARS_ON_PHONE = 2;
/** The chevron summary every fold shares (/research, /race). */
const FOLD_SUMMARY =
  "flex cursor-pointer list-none flex-wrap items-baseline gap-x-3 gap-y-1 py-6 text-text-strong transition-colors hover:text-rr-violet [&::-webkit-details-marker]:hidden";

function posts(n: number): string {
  return `${n} ${n === 1 ? "post" : "posts"}`;
}

/**
 * One year of the archive: its first `open` items, then the rest behind a
 * native <details> (keyboard and screen-reader ready without React, opened by
 * find-in-page, nothing above it moves as it opens). `open` is PER_YEAR, none
 * for an older year on a phone, and every item while a competition filter is
 * set, so nothing a filter found is ever folded away. The folded cards sit
 * outside Reveal: a scroll trigger measured inside a closed <details> would
 * leave them hidden when it opens.
 */
function YearGroup({ year, items, open }: { year: string; items: NewsItem[]; open: number }) {
  const shown = items.slice(0, open);
  const rest = items.slice(open);
  return (
    <section aria-labelledby={`news-year-${year}`} className="py-10">
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 desktop:sticky desktop:top-nav desktop:z-10 desktop:bg-paper-100/95 desktop:py-2 desktop:backdrop-blur-sm">
        <h3
          id={`news-year-${year}`}
          className="font-display text-display-m font-semibold tabular-nums text-text-strong"
        >
          {year}
        </h3>
        <p className="font-mono text-small text-text-muted">{posts(items.length)}</p>
      </div>
      {shown.length > 0 && (
        <Reveal stagger className="grid gap-6 md:grid-cols-2">
          {shown.map((item) => (
            <NewsCard key={item.id} item={item} titleAs="h4" />
          ))}
        </Reveal>
      )}
      {rest.length > 0 && (
        <details className={`group ${shown.length > 0 ? "mt-6" : ""}`}>
          <summary className={`${FOLD_SUMMARY} border-t border-ink-950/10`}>
            <span
              aria-hidden="true"
              className="inline-block font-display text-display-m leading-none transition-transform duration-[var(--duration-fast)] group-open:rotate-90 motion-reduce:transition-none"
            >
              &#8250;
            </span>
            <span className="font-mono text-small group-open:hidden">
              Show {rest.length}
              {shown.length > 0 ? " more" : ""} from {year}
            </span>
            <span className="hidden font-mono text-small group-open:inline">
              Hide {posts(rest.length)} from {year}
            </span>
          </summary>
          <div className="grid gap-6 pb-2 md:grid-cols-2">
            {rest.map((item) => (
              <NewsCard key={item.id} item={item} titleAs="h4" />
            ))}
          </div>
        </details>
      )}
    </section>
  );
}

/**
 * /news on the paper surface: the newest item as a lead story, then every item
 * grouped by year with a competition filter. Each card keeps its source link,
 * author, affiliation and credit; an item whose media we do not host renders
 * as a text card rather than hotlinking someone else's image.
 */
export default function News() {
  const [feed, setFeed] = useState<NewsFeed | null>(null);
  const [failed, setFailed] = useState(false);
  const [tag, setTag] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    loadNewsFeed()
      .then((data) => {
        if (!live) return;
        if (data) setFeed(data);
        else setFailed(true);
      })
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, []);

  const items = useMemo(() => feed?.items ?? [], [feed]);
  // Prefer a featured item that actually carries a picture: `find` took file
  // order and landed on the picture-less registration notice, so the page led
  // with 1,600px of type before its first photograph.
  const lead =
    items.find((i) => i.featured && i.image) ?? items.find((i) => i.featured) ?? items[0];
  const rest = useMemo(() => items.filter((i) => i !== lead), [items, lead]);

  const events = useMemo(() => {
    const ids: string[] = [];
    for (const item of items) if (item.event && !ids.includes(item.event)) ids.push(item.event);
    return ids.map((id) => ({ id, label: eventLabel(id) }));
  }, [items]);
  // A chip for every competition since 2016 was a wall of 34; a chip that
  // finds one card is a detour the year list already covers. The filter keeps
  // the competitions with two or more items (newest first).
  const chips = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of items) if (item.event) counts.set(item.event, (counts.get(item.event) ?? 0) + 1);
    return events.filter((e) => (counts.get(e.id) ?? 0) >= 2);
  }, [items, events]);
  const compact = !useDesktop();

  const filtered = useMemo(() => (tag ? rest.filter((i) => i.event === tag) : rest), [rest, tag]);

  const byYear = useMemo(() => {
    const groups = new Map<string, NewsItem[]>();
    for (const item of filtered) {
      const year = item.date.slice(0, 4);
      groups.set(year, [...(groups.get(year) ?? []), item]);
    }
    return [...groups.entries()];
  }, [filtered]);

  // Read from the dates themselves, not from the file's order: the ledger
  // stays true even if an item is ever added in the wrong place.
  const dates = useMemo(() => items.map((i) => i.date).sort(), [items]);
  const newest = dates.length > 0 ? dates[dates.length - 1] : null;
  const oldest = dates.length > 0 ? dates[0].slice(0, 4) : null;
  const selected = events.find((e) => e.id === tag);
  // Until news.json answers, the page is the masthead plus a screen of empty
  // paper: the lead, the archive and "Contribute" mount together once the
  // feed is in, so nothing that was already on screen moves (QA polish-2:
  // CLS 0.48 to 0.69 when Contribute and the footer were pushed down).
  const loading = feed === null && !failed;

  return (
    <div className="pt-nav">
      {/* Masthead: what the page is, the ledger, and the lead story. On a
          phone it starts a rem under the bar, like the About and Race heroes,
          instead of a full section's padding down. */}
      <Section width="page" className="compact:pt-4" aria-labelledby="news-title">
        <div className="grid gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <p className="mb-4 flex items-center gap-2 font-mono text-small text-text-muted">
              <span aria-hidden="true" className="h-1 w-1 bg-ink-950" />
              <span>News</span>
            </p>
            <h1
              id="news-title"
              className="max-w-[18ch] font-display text-display-xl font-semibold text-text-strong"
            >
              News from the Community
            </h1>
            <p className="mt-6 max-w-[60ch] text-lead text-text-body">
              Results and posts from the teams who build and race the cars.
            </p>
          </div>
          {/* The ledger counts what is on the page; with no feed there is
              nothing to count and it stays out of the way. */}
          {items.length > 0 && (
            <dl className="grid grid-cols-2 gap-x-6 gap-y-7 border-t border-ink-950/10 pt-6 font-mono text-small text-text-muted md:col-span-4">
              <StatTicker
                key={`items-${items.length}`}
                as="dl"
                size="l"
                tone="accent"
                value={items.length}
                label="Posts"
              />
              {/* "Races": the tagged events include the Korea championships,
                  the Germany race and a course race, which the numbered
                  series (/race: "30 competitions") does not count. */}
              <StatTicker
                key={`events-${events.length}`}
                as="dl"
                size="l"
                tone="accent"
                delay={0.12}
                value={events.length}
                label="Races"
              />
              <div>
                <dt>Latest</dt>
                <dd className="mt-1 text-text-strong">{newest ? formatIsoDate(newest) : ""}</dd>
              </div>
              <div>
                <dt>Oldest</dt>
                <dd className="mt-1 text-text-strong">{oldest}</dd>
              </div>
            </dl>
          )}
          {/* The ledger's box, held while the feed loads so the masthead does
              not grow (on phones) or re-align (md:items-end) when it arrives. */}
          {loading && (
            <div
              aria-hidden="true"
              className="invisible grid grid-cols-2 gap-x-6 gap-y-7 border-t border-ink-950/10 pt-6 font-mono text-small md:col-span-4"
            >
              {/* Same words and widths as the real ledger, so a label or a
                  date that wraps in the narrow md column wraps here too. */}
              {["Posts", "Races"].map((label) => (
                <div key={label}>
                  <p>{label}</p>
                  <p className="mt-1 text-display-l font-semibold tabular-nums">00</p>
                </div>
              ))}
              {[
                ["Latest", "Sep 00, 2026"],
                ["Oldest", "2000"],
              ].map(([label, value]) => (
                <div key={label}>
                  <p>{label}</p>
                  <p className="mt-1">{value}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {loading && <div aria-hidden="true" className="min-h-[100svh]" />}

        {lead && (
          <div className="mt-14 border-t border-ink-950/10 pt-10">
            <p className="mb-8 flex items-center gap-2 font-mono text-small text-text-muted">
              <span aria-hidden="true" className="h-1 w-1 bg-ink-950" />
              <span>Latest</span>
            </p>
            <Reveal>
              <NewsLead item={lead} />
            </Reveal>
          </div>
        )}

        {(failed || (feed !== null && items.length === 0)) && (
          <div className="mt-10">
            <NewsEmpty variant={failed ? "error" : "empty"} id="news-empty" />
          </div>
        )}
      </Section>

      {/* Every item, grouped by year, filtered by competition */}
      {rest.length > 0 && (
        <Section width="page" edge rule aria-labelledby="all-news">
          <SectionHeader
            eyebrow="Archive"
            id="all-news"
            title="All news, by year"
            lead="Newest first."
          />
          {chips.length > 1 && (
            <TagFilter
              tags={chips}
              selected={tag}
              onChange={setTag}
              label="Filter news by competition"
            />
          )}
          <p className="mt-8 font-mono text-small text-text-muted" aria-live="polite">
            {tag ? `${filtered.length} of ${rest.length} posts · ${selected?.label}` : `${rest.length} posts`}
          </p>
          {filtered.length === 0 ? (
            <p className="mt-6 max-w-[60ch] text-body text-text-body">
              Nothing from {selected?.label ?? "that competition"} yet.
            </p>
          ) : (
            <div className="mt-6 divide-y divide-ink-950/10 border-t border-ink-950/10">
              {/* The year was a sticky two-column rail; it cost every card a
                  sixth of the page and the pictures were the part that paid
                  (Cedric, 2026-08-23). Heading now, cards full width. It
                  sticks only where the window is tall enough to spare the
                  band (a landscape phone lost 38% of its height to bar plus
                  year), flush under the bar so no card text shows between.
                  Each year opens with four and folds the rest; on a phone the
                  years before the newest two are closed folds. A filter
                  shows every match. */}
              {byYear.map(([year, group], index) => (
                <YearGroup
                  key={`${year}-${tag ?? "all"}`}
                  year={year}
                  items={group}
                  open={tag ? group.length : compact && index >= OPEN_YEARS_ON_PHONE ? 0 : PER_YEAR}
                />
              ))}
            </div>
          )}
        </Section>
      )}

      {/* Send us your news: the one solid CTA on the page */}
      {!loading && (
        <Section width="page" rule aria-labelledby="contribute">
          <div className="grid gap-6 desktop:gap-10 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <SectionHeader
                eyebrow="Contribute"
                id="contribute"
                className="max-md:mb-2"
                title="Send us your news"
                lead={
                  <>
                    Tag us at{" "}
                    <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className={LINK}>
                      @roboracer.ai
                    </a>{" "}
                    in your post and send us the link. We'll post it here and credit you.
                  </>
                }
              />
            </div>
            <div className="flex flex-col items-start gap-4 md:col-span-5 md:items-end">
              <Button href={MAILTO}>Send us a link</Button>
              <p className="font-mono text-small text-text-muted">contact@roboracer.ai</p>
              <p className="text-small text-text-body">
                Or message us on{" "}
                <a href={SLACK_URL} target="_blank" rel="noopener noreferrer" className={LINK}>
                  Slack
                </a>
                .
              </p>
            </div>
          </div>
        </Section>
      )}
    </div>
  );
}
