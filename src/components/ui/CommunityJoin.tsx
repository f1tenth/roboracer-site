import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { loadCommunity, type Community, type JoinPost, type JoinYouTube } from "../../lib/data";
import Section from "./Section";
import SectionHeader from "./SectionHeader";
import SocialButton from "./SocialButton";
import MediaFrame from "./MediaFrame";

// Links from the content skill (Slack invite confirmed by Cedric, 2026-08-20;
// GitHub org). LinkedIn: the content skill still says VERIFY; the page at this
// URL is titled "The Roboracer Foundation" (2,579 followers, 2026-08-22).
// TODO(content): Cedric confirms the LinkedIn page; Ayagoz provides the
// Instagram handle (placeholder until then).
const SLACK_URL =
  "https://join.slack.com/t/robo-racer/shared_invite/zt-42lsbf50y-_3YPNLl_d3s~wPylAOMg0g";
const GITHUB_URL = "https://github.com/f1tenth";
const LINKEDIN_URL = "https://www.linkedin.com/company/roboracer-foundation";
const INSTAGRAM_URL = "";
const CONTACT_EMAIL = "contact@roboracer.ai";

// Site-wide text-link contract (landing v2): hairline underline, violet on hover.
const LINK =
  "text-text-strong underline underline-offset-4 decoration-ink-950/25 hover:decoration-rr-violet hover:decoration-2";

// Same paper surface and hairline system as the publications.
const CARD =
  "rounded-card border border-ink-950/10 bg-paper-50 transition-colors duration-[var(--duration-fast)] hover:border-ink-950/30";

type CommunityJoinProps = {
  className?: string;
};

/**
 * Landing section 08 / Join (serves everyone, audiences skill): the live
 * Slack numbers from community.json, Cedric's Korea photo, the four channels
 * (Slack is the one solid violet CTA of the viewport; LinkedIn, Instagram and
 * GitHub carry the logo gradient in their glyphs), and two "from the
 * community" cards: a LinkedIn post re-hosted as a native video and the
 * ICRA 2025 reel behind a click-to-load YouTube facade. All media paths come
 * from community.json (written by the media curator, landing v4 section 9).
 */
export default function CommunityJoin({ className = "" }: CommunityJoinProps) {
  const [community, setCommunity] = useState<Community | null>(null);

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
  const photo = community?.join?.photo;
  const post = community?.join?.post;
  const youtube = community?.join?.youtube;

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
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <SocialButton network="slack" variant="primary" href={SLACK_URL}>
              Join the Slack
            </SocialButton>
            <SocialButton network="linkedin" href={LINKEDIN_URL}>
              LinkedIn
            </SocialButton>
            <SocialButton network="instagram" href={INSTAGRAM_URL} soon={INSTAGRAM_URL === ""}>
              Instagram
            </SocialButton>
            <SocialButton network="github" href={GITHUB_URL}>
              GitHub
            </SocialButton>
          </div>
          <p className="mt-6 font-mono text-small text-text-muted">
            <a className={`inline-block py-2 ${LINK}`} href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>
          </p>
        </div>
        <figure className="order-first md:order-none md:col-span-7">
          {photo ? (
            <MediaFrame
              src={photo.src}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              aspect="4 / 3"
            />
          ) : (
            <div
              aria-hidden="true"
              className="w-full rounded-media border border-ink-950/10 bg-paper-50"
              style={{ aspectRatio: "4 / 3" }}
            />
          )}
          <figcaption className="mt-3 font-mono text-small text-text-muted">
            {photo ? photo.caption : "photo pending"}
            {photo?.credit && <span className="text-text-muted"> · {photo.credit}</span>}
          </figcaption>
        </figure>
      </div>

      {(post || youtube) && (
        <div className="mt-14 border-t border-ink-950/10 pt-8">
          <h3 className="font-mono text-eyebrow uppercase tracking-[0.14em] text-text-muted">
            From the community
          </h3>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {post && <PostCard post={post} />}
            {youtube && <YouTubeCard yt={youtube} />}
          </div>
        </div>
      )}
    </Section>
  );
}

/** A LinkedIn post as a native muted loop: no iframe, no LinkedIn script. */
function PostCard({ post }: { post: JoinPost }) {
  return (
    <article className={`flex h-full flex-col overflow-hidden ${CARD}`}>
      <div className="border-b border-ink-950/10 bg-ink-950">
        <MediaFrame
          src={post.poster}
          video={post.video}
          alt={`Video from ${post.author}'s LinkedIn post`}
          width={post.width}
          height={post.height}
          radius="none"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <p className="font-mono text-small text-text-muted">
          {post.author_url ? (
            <a href={post.author_url} target="_blank" rel="noopener noreferrer" className={LINK}>
              {post.author}
            </a>
          ) : (
            post.author
          )}
          <span> · LinkedIn</span>
        </p>
        {post.excerpt && <p className="text-body text-text-body">{post.excerpt}</p>}
        <p className="mt-auto pt-1 text-small">
          <a href={post.post_url} target="_blank" rel="noopener noreferrer" className={LINK}>
            View on LinkedIn ↗
          </a>
        </p>
      </div>
    </article>
  );
}

/** Our poster and a play glyph until the card is mostly in view; then the
 * privacy-enhanced embed loads and plays muted on its own (Cedric,
 * 2026-08-22: "automatically play ... start it with volume muted"). Under
 * reduced motion it stays a click-to-play facade, and nothing from YouTube
 * loads before that click. */
function YouTubeCard({ yt }: { yt: JoinYouTube }) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const [playing, setPlaying] = useState(false);
  const embed = `https://www.youtube-nocookie.com/embed/${yt.video_id}?autoplay=1&mute=1&playsinline=1&rel=0`;

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced || playing) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.intersectionRatio >= 0.6)) {
          setPlaying(true);
          io.disconnect();
        }
      },
      { threshold: [0.6] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced, playing]);

  return (
    <article ref={ref} className={`flex h-full flex-col overflow-hidden ${CARD}`}>
      <div className="relative aspect-video border-b border-ink-950/10 bg-ink-950">
        {playing ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={embed}
            title={yt.title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Play "${yt.title}" on YouTube`}
            className="group/play absolute inset-0 block h-full w-full cursor-pointer text-left"
          >
            <MediaFrame
              src={yt.poster}
              alt=""
              width={yt.width}
              height={yt.height}
              aspect="16 / 9"
              radius="none"
              className="h-full"
            />
            <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full border border-ink-950/10 bg-paper-50/90 text-ink-950 transition-colors duration-[var(--duration-fast)] group-hover/play:bg-paper-50 group-focus-visible/play:bg-paper-50">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                  <path d="M5.5 3.2v11.6L15 9 5.5 3.2Z" />
                </svg>
              </span>
            </span>
          </button>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <p className="font-mono text-small text-text-muted">{yt.caption}</p>
        <p className="mt-auto pt-1 text-small">
          <a href={yt.channel_url} target="_blank" rel="noopener noreferrer" className={LINK}>
            {yt.channel} on YouTube ↗
          </a>
        </p>
      </div>
    </article>
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
