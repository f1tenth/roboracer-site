import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { loadCommunity, type Community, type CommunityPost, type JoinPost } from "../../lib/data";
import Section from "./Section";
import Marquee from "./Marquee";
import YouTubeFacade from "./YouTubeFacade";
import SectionHeader from "./SectionHeader";
import SocialButton from "./SocialButton";
import MediaFrame from "./MediaFrame";
import PauseToggle from "./PauseToggle";
import { useMediaHold } from "../../lib/media";

// Links from the content skill (Slack invite confirmed by Cedric, 2026-08-20;
// GitHub org). LinkedIn: the content skill still says VERIFY; the page at this
// URL is titled "The Roboracer Foundation" (2,579 followers, 2026-08-22).
// TODO(content): Cedric confirms the LinkedIn page. Instagram: Cedric,
// 2026-08-22 (share link's tracking parameters dropped).
const SLACK_URL =
  "https://join.slack.com/t/robo-racer/shared_invite/zt-42lsbf50y-_3YPNLl_d3s~wPylAOMg0g";
const GITHUB_URL = "https://github.com/f1tenth";
const LINKEDIN_URL = "https://www.linkedin.com/company/roboracer-foundation";
const INSTAGRAM_URL = "https://www.instagram.com/roboracer.ai/";
const CONTACT_EMAIL = "contact@roboracer.ai";

// Site-wide text-link contract (landing v2): hairline underline, violet on hover.
const LINK =
  "text-text-strong underline underline-offset-4 decoration-ink-950/25 hover:decoration-rr-violet hover:decoration-2";

/** A 2.75rem hit area on touch screens that leaves the line box alone (the
 * padding is taken back by the negative margin). */
const TAP = "coarse:inline-block coarse:-my-3 coarse:py-3";

// Same paper surface and hairline system as the publications.
const CARD =
  "rounded-card border border-ink-950/10 bg-paper-50 transition-colors duration-[var(--duration-fast)] hover:border-ink-950/30";

type CommunityJoinProps = {
  className?: string;
  /** Section number, because the same Join block closes more than one page and
   * each page counts its own sections. */
  index?: string;
  /** About shows the same reel in its hero, so it turns this copy off rather
   * than running the video twice on one page. */
  showYouTube?: boolean;
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
export default function CommunityJoin({ className = "", index = "09", showYouTube = true }: CommunityJoinProps) {
  const [community, setCommunity] = useState<Community | null>(null);
  const reduced = usePrefersReducedMotion();
  const [paused, setPaused] = useState(false);

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
  const posts: CommunityPost[] = community?.join?.posts ?? [];

  return (
    <Section edge rule width="page" id="join" aria-labelledby="join-title" className={className}>
      <SectionHeader index={index} id="join-title" title="Join" subtitle={title} />
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
            <SocialButton network="instagram" href={INSTAGRAM_URL} soon={!INSTAGRAM_URL}>
              Instagram
            </SocialButton>
            <SocialButton network="github" href={GITHUB_URL}>
              GitHub
            </SocialButton>
          </div>
          <p className="mt-6 font-mono text-small text-text-muted">
            <a className={`inline-block py-2 coarse:-my-1 coarse:py-3 ${LINK}`} href={`mailto:${CONTACT_EMAIL}`}>
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
          </figcaption>
        </figure>
      </div>

      {(post || youtube) && (
        <div className="mt-14 border-t border-ink-950/10 pt-8">
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-mono text-eyebrow uppercase tracking-[0.14em] text-text-muted">
              From the community
            </h3>
            {/* Touch screens only (it hides itself elsewhere); nothing moves
                under reduced motion. */}
            {!reduced && (post || posts.length > 0) && (
              <PauseToggle paused={paused} onToggle={() => setPaused((v) => !v)} controls="community-strip" />
            )}
          </div>
          {/* Landing v5 round two (Cedric): "way more posts from the
              community, the entire width, looping at constant speed". A
              full-bleed marquee of the featured post (with its author's mark)
              and the eleven community posts from community.json; pauses on
              hover and on keyboard focus, wraps into a static grid under
              reduced motion (Marquee). The ICRA 2025 reel keeps its own
              card below. */}
          {(post || posts.length > 0) && reduced && (
            /* Reduced motion: the same cards as a row the reader swipes (or
               scrolls, or tabs through) by hand, from the page edge to the
               screen edge, instead of twelve cards stacked into a column
               (LANDING-10). */
            <ul
              aria-label="Posts from the community"
              className="relative left-1/2 mt-6 flex w-screen -translate-x-1/2 snap-x snap-mandatory gap-5 overflow-x-auto px-[max(1.5rem,calc((100vw-var(--container-page))/2+1.5rem))] pb-4 [scroll-padding-inline:max(1.5rem,calc((100vw-var(--container-page))/2+1.5rem))] md:gap-6"
            >
              {post && (
                <li className="flex shrink-0 snap-start">
                  <PostCard post={post} />
                </li>
              )}
              {posts.map((p) => (
                <li key={p.id} className="flex shrink-0 snap-start">
                  <CommunityPostCard post={p} />
                </li>
              ))}
            </ul>
          )}
          {(post || posts.length > 0) && !reduced && (
            <div
              id="community-strip"
              data-marquee-paused={paused || undefined}
              className="relative left-1/2 mt-6 w-screen -translate-x-1/2"
            >
              <Marquee label="Posts from the community" duration={70} durationMd={110} gap="gap-5 pr-5 md:gap-6 md:pr-6">
                {({ clone }) => (
                  <>
                    {post && <PostCard post={post} clone={clone} />}
                    {posts.map((p) => (
                      <CommunityPostCard key={p.id} post={p} clone={clone} />
                    ))}
                  </>
                )}
              </Marquee>
            </div>
          )}
          {/* The ICRA 2025 reel as its own full-screen highlight (Cedric, v5
              round two: "separate, large, the whole screen"). */}
          {showYouTube && youtube && <YouTubeFacade yt={youtube} full className="mt-10" />}
        </div>
      )}
    </Section>
  );
}

/** Strip card width: 320 under md, 360 from md (the marquee sets the gaps). */
const STRIP_CARD = "w-[20rem] shrink-0 md:w-[22.5rem]";

/** Month and year of a post: "Jun 2026". */
function postDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

/** One community LinkedIn post: its poster (no re-hosted media), the author,
 * affiliation and month, Cedric's one-liner, and the link to the post. */
function CommunityPostCard({ post, clone = false }: { post: CommunityPost; clone?: boolean }) {
  // The landing holds these until its hero clip has loaded (MediaHoldContext).
  const hold = useMediaHold();
  const tab = clone ? -1 : undefined;
  const meta = [post.affiliation, postDate(post.date)].filter(Boolean).join(" · ");
  return (
    <article className={`flex h-full flex-col overflow-hidden ${CARD} ${STRIP_CARD}`}>
      <a href={post.post_url} target="_blank" rel="noopener noreferrer" tabIndex={tab} className="block aspect-[4/3] overflow-hidden border-b border-ink-950/10 bg-paper-100">
        <img
          src={hold ? undefined : post.poster}
          alt={post.alt}
          width={post.width}
          height={post.height}
          /* Not lazy: inside a marquee the browser measures the layout box
             (a track thousands of px wide), so a lazy image never loads and
             the card shows its alt text as it scrolls in. Low priority keeps
             it out of the way of the hero. */
          loading="eager"
          fetchPriority="low"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </a>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="font-mono text-small text-text-muted">
          {post.author_url ? (
            <a href={post.author_url} target="_blank" rel="noopener noreferrer" tabIndex={tab} className={LINK}>
              {post.author}
            </a>
          ) : (
            post.author
          )}
          <span> · LinkedIn</span>
        </p>
        {meta && <p className="font-mono text-eyebrow tracking-normal text-text-muted">{meta}</p>}
        {post.excerpt && <p className="text-small text-text-body">{post.excerpt}</p>}
        <p className="mt-auto pt-1 text-small">
          <a href={post.post_url} target="_blank" rel="noopener noreferrer" tabIndex={tab} className={`${TAP} ${LINK}`}>
            View on LinkedIn ↗
          </a>
        </p>
      </div>
    </article>
  );
}

/** A LinkedIn post as a native muted loop: no iframe, no LinkedIn script. */
function PostCard({ post, clone = false }: { post: JoinPost; clone?: boolean }) {
  const tab = clone ? -1 : undefined;
  return (
    <article className={`flex h-full flex-col overflow-hidden ${CARD} ${STRIP_CARD}`}>
      {/* Same 4/3 media box as the community cards (Cedric, v5 round two);
          the 16/9 loop is centre-cropped by object-cover. */}
      <div className="aspect-[4/3] overflow-hidden border-b border-ink-950/10 bg-ink-950">
        <MediaFrame
          src={post.poster}
          video={post.video}
          alt={`Video from ${post.author}'s LinkedIn post`}
          width={post.width}
          height={post.height}
          aspect="4 / 3"
          radius="none"
          className="h-full"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        {/* The author's mark in colour, big (it is their logo, not a partner
            logo; Cedric: "people will recognise the logo ... nice and big"). */}
        {post.author_logo && (
          <img
            src={post.author_logo}
            alt={post.author}
            width={200}
            height={56}
            loading="lazy"
            decoding="async"
            className="h-14 w-auto max-w-full object-contain object-left"
          />
        )}
        <p className="flex items-center gap-3 font-mono text-small text-text-muted">
          <span>
            {post.author_url ? (
              <a href={post.author_url} target="_blank" rel="noopener noreferrer" tabIndex={tab} className={LINK}>
                {post.author}
              </a>
            ) : (
              post.author
            )}
            <span> · LinkedIn</span>
          </span>
        </p>
        {post.excerpt && <p className="text-small text-text-body">{post.excerpt}</p>}
        <p className="mt-auto pt-1 text-small">
          <a href={post.post_url} target="_blank" rel="noopener noreferrer" tabIndex={tab} className={`${TAP} ${LINK}`}>
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
function Stat({ value, label }: { value: string; label: string }) {
  return (
    // dt precedes dd in the DOM (valid dl grouping); the value renders on top.
    <div className="flex flex-col gap-1.5">
      <dt className="order-2 font-mono text-small text-text-muted">{label}</dt>
      <dd className="order-1 font-mono text-display-m font-semibold tabular-nums text-text-strong">{value}</dd>
    </div>
  );
}
