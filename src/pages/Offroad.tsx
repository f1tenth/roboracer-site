import { useEffect, useState } from "react";
import Section from "../components/ui/Section";
import SectionHeader from "../components/ui/SectionHeader";
import Button from "../components/ui/Button";
import MediaFrame from "../components/ui/MediaFrame";
import { useScrollToHash } from "../hooks/useScrollToHash";
import { loadOffroad, type OffroadFile, type OffroadPart } from "../lib/data";

/** Same touch-target stretch as /race's inline links. */
const TAP = "coarse:-my-3 coarse:inline-flex coarse:min-h-11 coarse:items-center";

/**
 * A part's picture or loop, or until one exists the designed placeholder the
 * season chain uses for a race without a photo: the same 16/9 box, so the
 * layout does not move when the real media lands in offroad.json.
 */
function PartMedia({ part }: { part: OffroadPart }) {
  const m = part.media;
  return (
    <div className="overflow-hidden rounded-media border border-ink-950/10 bg-paper-100">
      <div className="relative" style={{ aspectRatio: "16 / 9" }}>
        {m ? (
          <MediaFrame
            src={m.src}
            video={m.video}
            alt={m.alt}
            width={m.width}
            height={m.height}
            radius="none"
            className="absolute inset-0 h-full"
          />
        ) : (
          <img
            src="/logo-square.svg"
            alt=""
            aria-hidden="true"
            width={64}
            height={64}
            loading="lazy"
            decoding="async"
            className="absolute left-1/2 top-1/2 h-[34%] w-auto -translate-x-1/2 -translate-y-1/2 opacity-25"
          />
        )}
      </div>
    </div>
  );
}

/**
 * /offroad: the teaser for RoboRacer Offroad. Three parts (platform, stack,
 * simulator) in the order offroad.json lists them, each a 5/7 split of copy
 * and media that alternates sides, then "more information soon". All copy is
 * in public/data/offroad.json. No motion: the page reads the same with
 * animations off.
 */
export default function Offroad() {
  const [data, setData] = useState<OffroadFile | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    loadOffroad()
      .then((d) => live && setData(d))
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, []);

  useScrollToHash();

  if (failed) {
    return (
      <Section width="page" className="pt-[calc(var(--spacing-nav)+3rem)]">
        <h1 className="font-display text-display-m font-semibold text-text-strong">RoboRacer Offroad</h1>
        <p className="mt-4 text-lead">This page could not load. Reload to try again.</p>
      </Section>
    );
  }

  return (
    <>
      <Section
        variant="ink"
        width="bleed"
        className="pt-[calc(var(--spacing-nav)+1rem)] lg:pt-[calc(var(--spacing-nav)+1.25rem)]"
      >
        {/* Reserved height while offroad.json is in flight, so nothing below
            the hero jumps when it lands. */}
        <div className={`mx-auto max-w-page px-6${data ? "" : " min-h-[18rem] lg:min-h-[12rem]"}`}>
          {data && (
            <div className="grid gap-12 lg:grid-cols-12 lg:items-end lg:gap-10">
              <div className="lg:col-span-7">
                <p className="mb-4 flex items-center gap-2 font-mono text-small text-text-on-ink-muted">
                  <span aria-hidden="true" className="h-1 w-1 bg-text-on-ink" />
                  <span>{data.hero.eyebrow}</span>
                </p>
                <h1 className="font-display text-display-xl font-semibold text-text-on-ink">{data.hero.title}</h1>
                <p className="mt-4 max-w-[44ch] text-lead text-text-on-ink-muted">{data.hero.lead}</p>
              </div>
              {/* The page's three parts as an index: what is coming, at a glance. */}
              <nav aria-label="On this page" className="lg:col-span-5">
                <ol className="border-t border-text-on-ink/10">
                  {data.parts.map((p, i) => (
                    <li key={p.id} className="border-b border-text-on-ink/10">
                      <a
                        href={`#${p.id}`}
                        className={`flex items-baseline gap-4 py-4 text-text-on-ink underline-offset-4 hover:underline hover:decoration-rr-violet hover:decoration-2 ${TAP}`}
                      >
                        <span className="font-mono text-small tabular-nums text-text-on-ink-muted">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="font-display text-lead font-semibold">{p.title}</span>
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </div>
          )}
        </div>
      </Section>

      {data && (
        <>
          {data.parts.map((p, i) => {
            const index = String(i + 1).padStart(2, "0");
            const flip = i % 2 === 1;
            return (
              <Section key={p.id} width="page" edge={flip} rule={i > 0} aria-labelledby={p.id}>
                <div className="grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-10">
                  <div className={`lg:col-span-5 ${flip ? "lg:order-2" : ""}`}>
                    <SectionHeader
                      index={index}
                      id={p.id}
                      title={p.title}
                      subtitle={p.subtitle}
                      lead={p.body}
                      className="mb-0!"
                    />
                  </div>
                  <div className={`lg:col-span-7 ${flip ? "lg:order-1" : ""}`}>
                    <PartMedia part={p} />
                  </div>
                </div>
              </Section>
            );
          })}

          <Section width="page" rule aria-labelledby="offroad-more">
            <SectionHeader
              id="offroad-more"
              title={data.closing.title}
              lead={data.closing.lead}
              action={
                <Button href={data.closing.cta_href} target="_blank" rel="noopener noreferrer">
                  {data.closing.cta_label}
                </Button>
              }
              className="mb-0!"
            />
          </Section>
        </>
      )}
    </>
  );
}
