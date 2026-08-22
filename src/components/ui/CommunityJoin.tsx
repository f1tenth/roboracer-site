import { useEffect, useState } from "react";
import { loadCommunity, type Community } from "../../lib/data";
import Section from "./Section";
import SectionHeader from "./SectionHeader";
import Button from "./Button";

// Links from the content skill (Slack invite confirmed by Cedric, 2026-08-20).
const SLACK_URL =
  "https://join.slack.com/t/robo-racer/shared_invite/zt-42lsbf50y-_3YPNLl_d3s~wPylAOMg0g";
const GITHUB_URL = "https://github.com/f1tenth";
const CONTACT_EMAIL = "contact@roboracer.ai";

// Reserved by the media curator (landing-v3 drift section). Until the file
// lands at integration the frame falls back to a neutral paper-100 box.
const PHOTO = {
  src: "/media/join/join-icra2026-crowd-1200.webp",
  width: 1200,
  height: 900,
  alt: "The RoboRacer crowd at the ICRA 2026 competition in Vienna",
  caption: "ICRA 2026, Vienna",
};

// Site-wide text-link contract (landing v2): hairline underline, violet on hover.
const LINK =
  "text-text-strong underline underline-offset-4 decoration-ink-950/25 hover:decoration-rr-violet hover:decoration-2";

type CommunityJoinProps = {
  className?: string;
};

/**
 * Landing section 08 / Join (serves everyone, audiences skill): the live
 * Slack numbers from community.json, one crowd photo, and the three ways in.
 * Self-contained: loads its own data, owns its Section and header. "Join the
 * Slack" is the one solid violet CTA of the viewport.
 */
export default function CommunityJoin({ className = "" }: CommunityJoinProps) {
  const [community, setCommunity] = useState<Community | null>(null);
  const [photoFailed, setPhotoFailed] = useState(false);

  useEffect(() => {
    let live = true;
    loadCommunity()
      .then((c) => {
        if (live) setCommunity(c);
      })
      .catch(() => {
        if (live) setCommunity(null);
      });
    return () => {
      live = false;
    };
  }, []);

  const title = community
    ? `Join ${community.members_display} people building and racing`
    : "Join the community building and racing";

  return (
    <Section edge rule id="join" aria-labelledby="join-title" className={className}>
      <SectionHeader index="08" eyebrow="Join" id="join-title" title={title} />
      <div className="grid gap-10 md:grid-cols-12 md:gap-x-6">
        <div className="md:col-span-5">
          {community && (
            <>
              <dl className="flex flex-wrap gap-x-10 gap-y-6 border-y border-ink-950/10 py-6">
                <Stat value={community.members_display} label="members" />
                <Stat value={community.timezones.toLocaleString("en-US")} label="time zones" />
                <Stat value={community.continents.toLocaleString("en-US")} label="continents" />
              </dl>
              <p className="mt-3 font-mono text-small text-text-muted">updated {community.updated}</p>
            </>
          )}
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button href={SLACK_URL} target="_blank" rel="noopener noreferrer">
              Join the Slack
            </Button>
            <Button href={GITHUB_URL} variant="secondary" target="_blank" rel="noopener noreferrer">
              GitHub
            </Button>
          </div>
          <p className="mt-6 font-mono text-small text-text-muted">
            <a className={`inline-block py-2 ${LINK}`} href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>
          </p>
        </div>
        <figure className="order-first md:order-none md:col-span-7">
          {photoFailed ? (
            <div
              aria-hidden="true"
              className="w-full rounded-media border border-ink-950/10 bg-paper-50"
              style={{ aspectRatio: "4 / 3" }}
            />
          ) : (
            <img
              src={PHOTO.src}
              alt={PHOTO.alt}
              width={PHOTO.width}
              height={PHOTO.height}
              loading="lazy"
              decoding="async"
              className="w-full rounded-media object-cover"
              style={{ aspectRatio: "4 / 3" }}
              onError={() => setPhotoFailed(true)}
            />
          )}
          <figcaption className="mt-3 font-mono text-small text-text-muted">
            {photoFailed ? "photo pending" : PHOTO.caption}
          </figcaption>
        </figure>
      </div>
    </Section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    // dt precedes dd in the DOM (valid dl grouping); the value renders on top.
    <div className="flex flex-col gap-1.5">
      <dt className="order-2 font-mono text-small text-text-muted">{label}</dt>
      <dd className="order-1 font-mono text-display-m font-semibold tabular-nums text-text-strong">{value}</dd>
    </div>
  );
}
