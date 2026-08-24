import { useEffect, useMemo, useState } from "react";
import Section from "../components/ui/Section";
import SectionHeader from "../components/ui/SectionHeader";
import Button from "../components/ui/Button";
import StatCounter from "../components/ui/StatCounter";
import Reveal from "../components/ui/Reveal";
import TagFilter from "../components/ui/TagFilter";
import NewsCard from "../components/news/NewsCard";
import NewsLead from "../components/news/NewsLead";
import NewsEmpty from "../components/news/NewsEmpty";
import { eventLabel, formatIsoDate, loadNewsFeed, type NewsFeed, type NewsItem } from "../components/news/newsData";

const SLACK_URL =
  "https://join.slack.com/t/robo-racer/shared_invite/zt-42lsbf50y-_3YPNLl_d3s~wPylAOMg0g";
const MAILTO = "mailto:contact@roboracer.ai?subject=RoboRacer%20news";
const INSTAGRAM_URL = "https://www.instagram.com/roboracer.ai/";
// Site-wide link contract (landing-v2): ink text, hairline underline, violet on hover.
const LINK =
  "underline underline-offset-4 decoration-ink-950/25 hover:decoration-rr-violet hover:decoration-2";

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

  return (
    <div className="pt-[68px] md:pt-[85px]">
      {/* Masthead: what the page is, the ledger, and the lead story */}
      <Section width="page" aria-labelledby="news-title">
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
              What the teams have been racing
            </h1>
            <p className="mt-6 max-w-[60ch] text-lead text-text-body">
              Race reports, results and posts from the teams who build and run the cars.
            </p>
          </div>
          {/* The ledger counts what is on the page; with no feed there is
              nothing to count and it stays out of the way. */}
          {items.length > 0 && (
            <dl className="grid grid-cols-2 gap-x-6 gap-y-7 border-t border-ink-950/10 pt-6 font-mono text-small text-text-muted md:col-span-4">
              <StatCounter
                key={`items-${items.length}`}
                as="dl"
                size="l"
                tone="accent"
                duration={2.5}
                value={items.length}
                label="Items"
              />
              <StatCounter
                key={`events-${events.length}`}
                as="dl"
                size="l"
                tone="accent"
                duration={2.5}
                delay={0.12}
                value={events.length}
                label="Competitions"
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
        </div>

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
            title="Every year so far"
            lead="Every item we have, newest first."
          />
          {events.length > 1 && (
            <TagFilter
              tags={events}
              selected={tag}
              onChange={setTag}
              label="Filter news by competition"
            />
          )}
          <p className="mt-8 font-mono text-small text-text-muted" aria-live="polite">
            {tag ? `${filtered.length} of ${rest.length} items · ${selected?.label}` : `${rest.length} items`}
          </p>
          {filtered.length === 0 ? (
            <p className="mt-6 max-w-[60ch] text-body text-text-body">
              Nothing from {selected?.label ?? "that competition"} is in the archive yet. The lead
              story above and the other competitions cover the rest of the season.
            </p>
          ) : (
            <div className="mt-6 divide-y divide-ink-950/10 border-t border-ink-950/10">
              {/* The year was a sticky two-column rail; it cost every card a
                  sixth of the page and the pictures were the part that paid
                  (Cedric, 2026-08-23). Heading now, cards full width. */}
              {byYear.map(([year, group]) => (
                <section key={year} aria-labelledby={`news-year-${year}`} className="py-10">
                  <h3
                    id={`news-year-${year}`}
                    className="mb-6 font-display text-display-m font-semibold tabular-nums text-text-strong md:sticky md:top-24 md:z-10 md:bg-paper-100/95 md:py-2 md:backdrop-blur-sm"
                  >
                    {year}
                  </h3>
                  <Reveal
                    key={`${year}-${tag ?? "all"}`}
                    stagger
                    className="grid gap-6 md:grid-cols-2"
                  >
                    {group.map((item) => (
                      <NewsCard key={item.id} item={item} titleAs="h4" />
                    ))}
                  </Reveal>
                </section>
              ))}
            </div>
          )}
        </Section>
      )}

      {/* Send us your news: the one solid CTA on the page */}
      <Section width="page" rule aria-labelledby="contribute">
        <div className="grid gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <SectionHeader
              eyebrow="Contribute"
              id="contribute"
              title="Send us your news"
              lead={
                <>
                  Posted about your team, your car or a race you ran? Tag us at{" "}
                  <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className={LINK}>
                    @roboracer.ai
                  </a>{" "}
                  and send us the link. It will go here, with your name and your credit on it!
                </>
              }
            />
          </div>
          <div className="flex flex-col items-start gap-4 md:col-span-5 md:items-end">
            <Button href={MAILTO}>Send us a link</Button>
            <p className="font-mono text-small text-text-muted">contact@roboracer.ai</p>
            <p className="text-small text-text-body">
              Feel free to reach out on{" "}
              <a href={SLACK_URL} target="_blank" rel="noopener noreferrer" className={LINK}>
                Slack
              </a>
              .
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
}
