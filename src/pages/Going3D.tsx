import { useEffect, useState } from "react";
import Section from "../components/ui/Section";
import SectionHeader from "../components/ui/SectionHeader";
import Button from "../components/ui/Button";
import TerrainScene from "../components/going3d/TerrainScene";
import Turntable from "../components/going3d/Turntable";
import LoopTile from "../components/going3d/LoopTile";
import { useScrollToHash } from "../hooks/useScrollToHash";
import { useLenis } from "../lib/motion";
import { loadGoing3D, type Going3DFile } from "../lib/data";

const EXTERNAL = { target: "_blank", rel: "noopener noreferrer" } as const;

/**
 * /3d: "RoboRacer is going 3D", the first teaser. One idea per screen, on
 * ink until the last-but-one section:
 *   hero     the car perched on a hump, headline rising out of the photo
 *   01       the dimension shift: a line that is a flat track seen edge-on, opening
 *            into 3D as the camera rises, then bumps growing out of it (TerrainScene)
 *   02       the car turns once as it scrolls (Turntable), four keywords
 *   03       what comes next: a first glimpse of the simulator, stack and car (paper)
 *   04       the first 3D race: ICRA 2027, Seoul
 * Copy and media paths: public/data/going3d.json. Motion is scroll-scrubbed
 * and explains the two ideas (flat to 3D, a first look at the car); under
 * reduced motion both render as their end state.
 */
export default function Going3D() {
  const [data, setData] = useState<Going3DFile | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    loadGoing3D()
      .then((d) => live && setData(d))
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, []);

  useScrollToHash();
  useLenis();

  if (failed) {
    return (
      <Section width="page" className="pt-[calc(var(--spacing-nav)+3rem)]">
        <h1 className="font-display text-display-m font-semibold text-text-strong">RoboRacer is going 3D</h1>
        <p className="mt-4 text-lead">This page could not load. Reload to try again.</p>
      </Section>
    );
  }

  // Ink until the copy lands, so the footer never flashes at the top.
  if (!data) return <div className="min-h-[100svh] bg-ink-900" />;

  const { hero, terrain, car, next, race } = data;
  const { banner } = hero;
  const wide = [...banner.wide].sort((a, b) => a.width - b.width);
  const largest = wide[wide.length - 1];

  return (
    <>
      {/* Hero: the photo first, the headline rising out of its fade. The fade
          covers only the bottom third, under the headline, so the car above it
          (wheels at about 70% of the banner's height) stays in full light. */}
      <section aria-labelledby="g3d-title" className="relative bg-ink-900 pt-nav text-text-on-ink-muted">
        <div className="relative">
          <picture>
            <source
              media="(max-width: 47.99rem)"
              srcSet={hero.portrait.src}
              width={hero.portrait.width}
              height={hero.portrait.height}
            />
            <img
              src={largest.src}
              srcSet={wide.map((w) => `${w.src} ${w.width}w`).join(", ")}
              sizes="100vw"
              alt={banner.alt}
              width={largest.width}
              height={Math.round(largest.width * banner.ratio)}
              fetchPriority="high"
              decoding="async"
              className="block h-auto w-full"
            />
          </picture>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[32%] bg-linear-to-b from-transparent via-ink-900/70 to-ink-900"
          />
        </div>
        <div className="relative mx-auto -mt-[clamp(4rem,11vw,10.5rem)] max-w-page px-6 pb-section-tight">
          <h1 id="g3d-title" className="max-w-[16ch] font-display text-display-xl font-semibold text-text-on-ink">
            {hero.title_lead}{" "}
            <span className="text-gradient-logo inline-block pr-[0.06em]">{hero.title_accent}</span>
          </h1>
          <p className="mt-5 max-w-[40ch] text-lead text-text-on-ink">{hero.tagline}</p>
          <p className="mt-3 font-mono text-small text-text-on-ink-muted">{hero.meta.join("  ·  ")}</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Button href={hero.cta_primary.href} on="ink" {...EXTERNAL}>
              {hero.cta_primary.label}
            </Button>
            <Button href={hero.cta_secondary.href} variant="ghost" on="ink">
              {hero.cta_secondary.label}
            </Button>
          </div>
        </div>
      </section>

      {/* 01: the dimension shift, full screen (pinned on desktop). */}
      <section aria-labelledby="g3d-terrain" className="relative border-t border-text-on-ink/10 bg-ink-900 text-text-on-ink-muted">
        <TerrainScene
          variant="pinned"
          header={
            <SectionHeader on="ink" index={terrain.index} id="g3d-terrain" title={terrain.title} lead={terrain.lead} className="mb-0!" />
          }
          label={{
            before: terrain.label_before,
            after: terrain.label_after,
            noteBefore: terrain.label_before_note,
            noteAfter: terrain.label_after_note,
          }}
        />
      </section>

      {/* 02: a first look at the car, turning as it scrolls. */}
      <section id="car-section" aria-labelledby="car" className="relative border-t border-text-on-ink/10 bg-ink-900 text-text-on-ink-muted">
        <Turntable
          frames={car.frames}
          alt={car.alt}
          callouts={car.callouts}
          hint={car.hint}
          header={<SectionHeader on="ink" index={car.index} id="car" title={car.title} lead={car.lead} className="mb-0!" />}
        />
      </section>

      {/* 03: what comes next, a first glimpse of each. */}
      <Section width="page" aria-labelledby="g3d-next">
        <SectionHeader index={next.index} id="g3d-next" title={next.title} subtitle={next.subtitle} lead={next.lead} />
        {/* Three across from lg. On tablets each item is a row (picture, then its
            text beside it), so the one-line bodies keep their one line. */}
        <ol className="grid gap-x-8 gap-y-12 lg:grid-cols-3">
          {next.items.map((item, i) => (
            <li
              key={item.id}
              className="border-t border-ink-950/10 pt-5 md:max-lg:grid md:max-lg:grid-cols-2 md:max-lg:items-center md:max-lg:gap-8"
            >
              <div className="relative overflow-hidden rounded-media bg-paper-100">
                {item.video ? (
                  <LoopTile poster={item.image} video={item.video} />
                ) : (
                  <img
                    src={item.image.src}
                    alt={item.image.alt}
                    width={item.image.width}
                    height={item.image.height}
                    loading="lazy"
                    decoding="async"
                    className="block h-auto w-full"
                  />
                )}
                <span className="absolute left-3 top-3 rounded-pill bg-ink-950/75 px-3 py-1 font-mono text-small text-text-on-ink">
                  {next.tag}
                </span>
              </div>
              <div className="mt-5 md:max-lg:mt-0">
                <p className="font-mono text-small text-text-muted">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-1 font-display text-lead font-semibold text-text-strong">{item.title}</h3>
                <p className="mt-2 max-w-[36ch] text-body text-text-body">{item.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      {/* 04: the first 3D race. */}
      <Section variant="ink" width="page" aria-labelledby="g3d-race">
        {/* Desktop: the words on the left, the track mark large on the right
            across both their rows. Narrower: the mark between them, full width. */}
        <div className="grid items-center gap-x-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div>
            <p className="mb-4 flex items-center gap-2 font-mono text-small text-text-on-ink-muted">
              <span aria-hidden="true" className="h-1 w-1 bg-text-on-ink" />
              <span>{race.index}</span>
              <span aria-hidden="true">/</span>
              <span>{race.eyebrow}</span>
            </p>
            <p className="font-display text-display-xl font-semibold text-text-on-ink">
              {race.event}
            </p>
            <p className="mt-3 font-mono text-lead text-text-on-ink-muted">{race.place}</p>
          </div>
          {/* The finished 3D track again, as a still: where the shift ends up. */}
          <TerrainScene
            variant="inline"
            className="mt-8 w-full max-w-[40rem] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0 lg:max-w-none"
          />
          <div className="mt-10 lg:col-start-1 lg:row-start-2">
            <h2 id="g3d-race" className="font-display text-display-m font-semibold text-text-on-ink">
              {race.title}
            </h2>
            <p className="mt-4 max-w-[52ch] text-lead text-text-on-ink-muted">{race.lead}</p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Button href={race.cta.href} on="ink" {...EXTERNAL}>
                {race.cta.label}
              </Button>
              <Button href={race.event_link.href} variant="ghost" on="ink" {...EXTERNAL}>
                {race.event_link.label}
              </Button>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
