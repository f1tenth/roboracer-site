import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { gsap, ScrollTrigger, DURATION, REDUCED_MOTION_QUERY } from "../lib/motion";
import { START_HREF } from "../lib/wayfinding";

const links = [
  { href: "/about", text: "About" },
  { href: "/build", text: "Build" },
  { href: "/learn", text: "Learn" },
  { href: "/race", text: "Race" },
  // The rulebook used to be reachable only from a button part-way down the
  // About page; a competitor looking for it would never have found it.
  { href: "/rules", text: "Rules" },
  { href: "/research", text: "Research" },
  { href: "/news", text: "News" },
];

const SIMULATOR_URL = "https://autodrive-ecosystem.github.io/";
const SLACK_URL = "https://join.slack.com/t/robo-racer/shared_invite/zt-42lsbf50y-_3YPNLl_d3s~wPylAOMg0g";

/**
 * Routes whose first viewport is the HeroChapter: the nav starts transparent
 * over the video and fills in with the chapter's own progress. Everywhere
 * else --nav-alpha stays 1 (the paper nav). /styleguide carries the
 * HeroChapter demo under the same rule so the demo matches the landing.
 */
const HERO_ROUTES = new Set(["/", "/styleguide"]);

/** From lg the full link bar replaces the toggle (index.css .nav-links). */
const LINK_BAR_QUERY = "(min-width: 64rem)";

/**
 * The chapter publishes its ramp on the wrapper as `data-nav-fill="from to"`
 * in its own scroll progress (start "top top", end "bottom bottom"); the
 * pinned chapter says 0.72 0.95 (transparent through assembly, hold and
 * zoom, paper by the time Highlights slides over the hero). Read off the DOM
 * rather than imported so this bundle never pulls HeroChapter (and GSAP) in.
 */
const DEFAULT_NAV_FILL: readonly [number, number] = [0.72, 0.95];
const CHAPTER_SELECTOR = "[data-hero-chapter]";

function parseNavFill(value: string | undefined): readonly [number, number] {
  const parts = (value ?? "").trim().split(/\s+/).map(Number);
  return parts.length === 2 && parts.every((n) => Number.isFinite(n)) && parts[0] < parts[1]
    ? [parts[0], parts[1]]
    : DEFAULT_NAV_FILL;
}

/** Chapter progress without GSAP, for the first paint before the chunk lands. */
function chapterProgress(chapter: HTMLElement): number {
  const top = chapter.getBoundingClientRect().top + window.scrollY;
  const range = chapter.offsetHeight - window.innerHeight;
  return range > 0 ? (window.scrollY - top) / range : 1;
}

/**
 * The wordmark inline (paths from /logos/logo-white-gradient.svg, 151x26):
 * the letters take currentColor, so one element reads white over the video
 * and ink on paper through the same --nav-fg mix as the links, with nothing
 * to cross-fade and no 203 KB PNG on every route. The "bo" keeps the asset's
 * own gradient.
 */
function BrandLogo() {
  return (
    <svg viewBox="0 0 151 26" width="151" height="26" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M34.9272 0.00153762H31.2692V25.0617H34.9272V22.6154C36.6309 24.1361 38.8743 25.0617 41.3291 25.0617C44.8279 25.0617 47.8955 23.1997 49.5984 20.4196C48.8196 19.3556 48.0915 18.2393 47.3673 17.1291L47.179 16.84C46.5293 19.4578 44.1598 21.4022 41.3291 21.4022C38.0232 21.4022 35.3439 18.7075 35.3439 15.3901C35.3439 12.0726 38.0232 9.39334 41.3291 9.39334H41.3498V9.38334C44.7188 9.37643 46.8553 12.6523 49.0572 16.0282C51.9563 20.4719 54.9463 25.0548 61.149 25.0548V25.0579H61.1698C66.4869 25.0579 70.8145 20.7264 70.8145 15.3939C70.8145 10.0614 66.4869 5.72457 61.1698 5.72457C57.4057 5.72457 54.1375 7.87955 52.536 11.0178C52.9666 11.6498 53.3871 12.2956 53.8092 12.9429C54.2536 13.6233 54.701 14.3099 55.1577 14.9657C55.3783 11.8489 57.9823 9.38411 61.1698 9.38411C64.3573 9.38411 67.155 12.0788 67.155 15.3962C67.155 18.7136 64.4757 21.3914 61.1698 21.3914H61.149V21.3945C56.9152 21.3945 54.4804 17.6611 52.1193 14.0423C49.367 9.82234 46.6946 5.72688 41.3483 5.73687V5.72688H41.3275C38.8727 5.72688 36.6293 6.65099 34.9256 8.16862V0L34.9272 0.00153762Z"
        fill="url(#rr-nav-logo-grad)"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M113.305 25.6798C115.627 25.6798 117.954 24.8457 119.622 23.3734L117.404 20.4565C116.42 21.3845 114.87 22.0218 113.289 22.0218C110.102 22.0218 107.262 19.4825 107.262 15.9544C107.262 12.4555 110.086 9.88692 113.289 9.88692C114.854 9.88692 116.388 10.4935 117.341 11.4046L119.393 8.3516C117.74 6.99849 115.523 6.22738 113.289 6.22738C108.081 6.22738 103.604 10.4189 103.604 15.9544C103.604 21.5052 108.096 25.6814 113.304 25.6814L113.306 25.6798H113.305ZM3.658 22.9721V25.0633H0V14.9864H0.00999455C0.226799 9.85002 4.46603 5.72919 9.64474 5.72919C10.851 5.72919 12.0073 5.94984 13.0721 6.355C12.7715 6.60102 12.484 6.86088 12.208 7.13458C11.5191 7.82189 10.9148 8.59532 10.4136 9.43563C10.1621 9.40334 9.9046 9.38642 9.64474 9.38642C6.33885 9.38642 3.65954 12.0811 3.65954 15.3985V22.9713H3.658V22.9721ZM20.4727 25.0633C25.7898 25.0633 30.1159 20.7318 30.1159 15.3993C30.1159 10.0668 25.7882 5.72996 20.4727 5.72996C15.1571 5.72996 10.788 10.073 10.788 15.3993C10.788 20.7256 15.131 25.0633 20.4727 25.0633ZM20.4727 21.3945C17.1407 21.3945 14.4452 18.7152 14.4452 15.3993C14.4452 12.0826 17.1399 9.38719 20.4727 9.38719C23.8055 9.38719 26.4579 12.0819 26.4579 15.3993C26.4579 18.7167 23.7786 21.3945 20.4727 21.3945ZM141.584 22.9721V25.0633H137.926V14.9864H137.936C138.152 9.85002 142.392 5.72919 147.57 5.72919C148.777 5.72919 149.933 5.94984 150.998 6.355C150.697 6.60102 150.41 6.86088 150.134 7.13458C149.445 7.82189 148.84 8.59532 148.339 9.43563C148.088 9.40334 147.83 9.38642 147.57 9.38642C144.264 9.38642 141.585 12.0811 141.585 15.3985V22.9713H141.584V22.9721ZM75.8901 22.9721V25.0633H72.2321V14.9864H72.2421C72.4589 9.85002 76.6982 5.72919 81.8769 5.72919C83.0831 5.72919 84.2394 5.94984 85.3042 6.355C85.0036 6.60102 84.7161 6.86088 84.4401 7.13458C83.7512 7.82189 83.147 8.59532 82.6457 9.43563C82.3943 9.40334 82.1367 9.38642 81.8769 9.38642C78.571 9.38642 75.8917 12.0811 75.8917 15.3985V22.9713H75.8901V22.9721ZM102.332 14.9864H102.322C102.105 9.85002 97.8659 5.72919 92.6871 5.72919C87.5084 5.72919 83.0024 10.0722 83.0024 15.3985C83.0024 20.731 87.3454 25.0625 92.6871 25.0625C94.9459 25.0625 97.0271 24.2798 98.6723 22.9713V25.0625H102.33V14.9857H102.332V14.9864ZM92.6887 21.3953C89.3567 21.3953 86.6612 18.716 86.6612 15.4001C86.6612 12.0842 89.3559 9.38796 92.6887 9.38796C96.0215 9.38796 98.6739 12.0826 98.6739 15.4001C98.6739 18.7175 95.9946 21.3953 92.6887 21.3953ZM136.514 15.2286C136.514 10.5696 133.203 6.28965 127.968 6.28965C122.733 6.28965 118.759 10.389 118.759 15.9705C118.759 21.5521 122.858 25.6245 128.03 25.6245C130.337 25.6245 133.233 24.775 135.223 22.5985L132.752 20.1467C131.296 21.5206 129.502 22.0488 128.109 22.0488C125.362 22.0488 123.103 20.1782 122.481 17.442H136.09V17.4267L136.147 17.442C136.375 16.8047 136.515 16.1097 136.515 15.2294L136.513 15.2279L136.514 15.2286ZM127.985 9.85386C130.871 9.85386 132.581 11.932 132.95 14.559H122.436C122.979 11.7659 125.213 9.85386 127.986 9.85386H127.985Z"
        fill="currentColor"
      />
      <defs>
        <linearGradient
          id="rr-nav-logo-grad"
          x1="33.8023"
          y1="22.6248"
          x2="67.0782"
          y2="1.49995"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00D1DA" />
          <stop offset="1" stopColor="#FC00FF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

export default function Navbar() {
  const location = useLocation();
  const navRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  // Mount tracks `menuOpen` on the way in and lags it on the way out, so the
  // panel is still in the DOM while its close tween runs.
  const [menuMounted, setMenuMounted] = useState(false);
  // The open mobile menu needs a solid bar behind it whatever the scroll.
  const transparent = HERO_ROUTES.has(location.pathname) && !menuOpen;

  // Close the mobile menu on every navigation, including "Start here" on the
  // landing itself, which changes only the hash.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.key]);

  // The open menu behaves as a dialog on a phone (mobile audit CHROME-02):
  // the page under it neither scrolls nor takes focus (`inert` on everything
  // beside the nav, so Tab stays in the bar and the menu), Escape closes it
  // and hands focus back to the toggle, and so does a tap on the scrim.
  // Widening the window past the toggle closes it too, so the lock can never
  // outlive a menu that is no longer shown.
  useEffect(() => {
    if (!menuOpen) return;
    const nav = navRef.current;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    const inerted = Array.from(nav?.parentElement?.children ?? []).filter(
      (el): el is HTMLElement => el instanceof HTMLElement && el !== nav && !el.inert,
    );
    for (const el of inerted) el.inert = true;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      toggleRef.current?.focus();
    };
    const linkBar = window.matchMedia(LINK_BAR_QUERY);
    const onLinkBar = () => {
      if (linkBar.matches) setMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    linkBar.addEventListener("change", onLinkBar);
    return () => {
      root.style.overflow = previousOverflow;
      for (const el of inerted) el.inert = false;
      document.removeEventListener("keydown", onKeyDown);
      linkBar.removeEventListener("change", onLinkBar);
    };
  }, [menuOpen]);

  const closeFromScrim = () => {
    setMenuOpen(false);
    toggleRef.current?.focus();
  };

  // --nav-alpha = clamp((p - from) / (to - from), 0, 1) where p is the hero
  // chapter's scroll progress, written by a ScrollTrigger on the chapter's
  // wrapper (Lenis drives scroll on the landing, so this stays in the one
  // scroll pipeline) straight onto the element: no React render per scroll
  // frame. Every nav color is mixed from it in index.css. The motion module
  // is imported lazily so GSAP stays out of the shared bundle on the routes
  // that never animate; the first value is computed synchronously from the
  // chapter's geometry, so there is no opaque flash before the chunk arrives.
  useEffect(() => {
    if (menuOpen) setMenuMounted(true);
  }, [menuOpen]);

  // Open and close the mobile panel. Reduced motion gets the end state with no
  // tween at all, which also means the panel unmounts on the same frame it
  // closes rather than waiting on a tween that never runs.
  useEffect(() => {
    if (!menuMounted) return;
    const el = menuRef.current;
    const scrim = scrimRef.current;
    if (!el || !scrim) return;
    const reduce = window.matchMedia(REDUCED_MOTION_QUERY).matches;

    if (menuOpen) {
      if (reduce) {
        gsap.set(el, { opacity: 1, y: 0 });
        gsap.set(scrim, { opacity: 1 });
        return;
      }
      const tl = gsap
        .timeline()
        .fromTo(el, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: DURATION.fast, ease: "power2.out" }, 0)
        .fromTo(scrim, { opacity: 0 }, { opacity: 1, duration: DURATION.fast, ease: "power2.out" }, 0);
      return () => {
        tl.kill();
      };
    }

    if (reduce) {
      setMenuMounted(false);
      return;
    }
    const tl = gsap
      .timeline({ onComplete: () => setMenuMounted(false) })
      .to(el, { opacity: 0, y: -10, duration: DURATION.fast, ease: "power2.in" }, 0)
      .to(scrim, { opacity: 0, duration: DURATION.fast, ease: "power2.in" }, 0);
    return () => {
      tl.kill();
    };
  }, [menuOpen, menuMounted]);

  // The route chunk is lazy too: until the chapter is in the DOM the bar is
  // paper (over the blank page), and a MutationObserver attaches the ramp
  // the moment it lands, before that frame paints.
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const setAlpha = (a: number) => nav.style.setProperty("--nav-alpha", a.toFixed(3));
    if (!transparent) {
      setAlpha(1);
      return;
    }
    let cancelled = false;
    let ctx: { revert: () => void } | undefined;
    let observer: MutationObserver | undefined;

    const attach = (chapter: HTMLElement) => {
      const [from, to] = parseNavFill(chapter.dataset.navFill);
      const alphaOf = (p: number) => Math.min(1, Math.max(0, (p - from) / (to - from)));
      setAlpha(alphaOf(chapterProgress(chapter)));
      if (cancelled) return;
      ctx = gsap.context(() => {
        const trigger = ScrollTrigger.create({
          trigger: chapter,
          start: "top top",
          end: "bottom bottom",
          onUpdate: (self) => setAlpha(alphaOf(self.progress)),
          onRefresh: (self) => setAlpha(alphaOf(self.progress)),
        });
        setAlpha(alphaOf(trigger.progress));
      });
    };

    const existing = document.querySelector<HTMLElement>(CHAPTER_SELECTOR);
    if (existing) {
      attach(existing);
    } else {
      setAlpha(1);
      observer = new MutationObserver(() => {
        const chapter = document.querySelector<HTMLElement>(CHAPTER_SELECTOR);
        if (!chapter) return;
        observer?.disconnect();
        observer = undefined;
        attach(chapter);
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
    return () => {
      cancelled = true;
      observer?.disconnect();
      ctx?.revert();
    };
    // Re-attach on every route change: two hero routes in a row swap the
    // chapter element without flipping `transparent`.
  }, [transparent, location.pathname]);

  return (
    // data-lenis-prevent while open: on a narrow window with a mouse the
    // landing's Lenis would otherwise keep scrolling the locked page on wheel.
    <nav ref={navRef} className="navbar" aria-label="Main" data-lenis-prevent={menuOpen ? "" : undefined}>
      <Link to="/" className="nav-logo" aria-label="RoboRacer home">
        <BrandLogo />
      </Link>

      {/* Desktop Links */}
      <div className="nav-links">
        {links.map((link) => {
          const active = location.pathname === link.href;
          return (
            <Link
              key={link.href}
              to={link.href}
              className={`nav-link ${active ? "active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              {link.text}
            </Link>
          );
        })}

        <a
          href={SIMULATOR_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="nav-link inline-flex items-center gap-1"
        >
          Simulator
          <ExternalIcon />
        </a>

        {/* The two actions sit together, closer than the links. "Start here"
            is the bar's one solid violet button: the four ways in under the
            landing hero (ui/EntryPaths), from any route. */}
        <div className="nav-actions">
          <a href={SLACK_URL} target="_blank" rel="noopener noreferrer" className="nav-cta">
            Join the Slack
          </a>
          <Link to={START_HREF} className="nav-primary">
            Start here
          </Link>
        </div>
      </div>

      {/* Under lg: the same button beside the menu toggle, no taller than
          the wordmark (index.css .nav-primary-bar) so the bar keeps its
          height. Under 390px wide (an iPhone SE, a 360 Android) it would crowd
          the wordmark, so it moves to the top of the menu instead. */}
      <div className="flex items-center gap-4 lg:hidden">
        <Link to={START_HREF} className="nav-primary nav-primary-bar hidden min-[24.375rem]:inline-flex">
          Start here
        </Link>
        <button
          ref={toggleRef}
          type="button"
          className="nav-menu-button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="nav-mobile-menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            {menuOpen ? (
              <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            ) : (
              <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu. Kept mounted for the length of its exit tween, which is
          what AnimatePresence used to do; unmounting on the state flip alone
          would cut the close animation off at frame one. */}
      {menuMounted && (
        <div ref={scrimRef} className="mobile-menu-scrim lg:hidden" aria-hidden="true" onClick={closeFromScrim} />
      )}
      {menuMounted && (
        <div id="nav-mobile-menu" ref={menuRef} className="mobile-menu lg:hidden">
          <Link to={START_HREF} className="nav-primary mobile-menu-primary min-[24.375rem]:hidden">
            Start here
          </Link>
          {links.map((link) => {
            const active = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                className="mobile-menu-link"
                aria-current={active ? "page" : undefined}
              >
                {link.text}
              </Link>
            );
          })}
          <a
            href={SIMULATOR_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mobile-menu-link flex items-center gap-2"
          >
            Simulator
            <ExternalIcon />
          </a>
          <a href={SLACK_URL} target="_blank" rel="noopener noreferrer" className="mobile-menu-link">
            Join the Slack
          </a>
        </div>
      )}
    </nav>
  );
}
