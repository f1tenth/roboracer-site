import { Link, useLocation } from "react-router-dom";

const SPONSOR_MAILTO = "mailto:contact@roboracer.ai?subject=RoboRacer%20sponsorship";
// On a touch screen every footer link is a 2.75rem row (mobile audit
// CHROME-08); the mouse layout keeps its 14px lines.
const TAP = "coarse:flex coarse:min-h-11 coarse:w-fit coarse:items-center";
const LINK = `text-sm text-text-on-ink-muted transition-colors hover:text-text-on-ink ${TAP}`;
const LIST = "space-y-3 coarse:space-y-0";

/** Column heading: the mono section index the pages use (ui/SectionHeader). */
function FooterHeading({ children }: { children: string }) {
  return (
    <h3 className="mb-4 flex items-center gap-2 font-mono text-small font-normal text-text-on-ink-muted coarse:mb-1">
      <span aria-hidden="true" className="h-1 w-1 bg-text-on-ink" />
      {children}
    </h3>
  );
}

export default function Footer() {
  const location = useLocation();
  const isAltFooter = location.pathname === "/learn" || location.pathname === "/build";

  if (isAltFooter) return null;

  // Below lg the footer sits on the 24px page edge, the nav's and every
  // section's above it; from lg it keeps its desktop container.
  const edge = "mx-auto max-w-7xl px-6 lg:px-16 xl:px-24 2xl:px-32";

  return (
    <footer className="bg-ink-950 text-text-on-ink">
      {/* Main Footer Content */}
      <div className={`${edge} py-12 md:py-16`}>
        {/* Phones: the two link lists side by side, brand and community full
            width, about half the old single column's height. */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:gap-10 lg:grid-cols-4">
          {/* Company Info */}
          <div className="col-span-2 space-y-4 md:col-span-1">
            <img
              src="/logos/logo-white-gradient.svg"
              alt="RoboRacer"
              width={151}
              height={26}
              className="h-10 w-auto"
            />
            <p className="text-sm leading-relaxed text-text-on-ink-muted">
              Open-source autonomous racing since 2016.
            </p>
            <a
              href="mailto:contact@roboracer.ai"
              className={`inline-block underline-offset-2 duration-200 hover:underline ${LINK}`}
            >
              contact@roboracer.ai
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <FooterHeading>Quick links</FooterHeading>
            <ul className={LIST}>
              {/* Client-side links: a plain href reloaded the whole app. */}
              <li><Link to="/about" className={LINK}>About</Link></li>
              <li><Link to="/race" className={LINK}>Race</Link></li>
              <li><Link to="/rules" className={LINK}>Rules</Link></li>
              <li><Link to="/news" className={LINK}>News</Link></li>
              <li><Link to="/research" className={LINK}>Research</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <FooterHeading>Resources</FooterHeading>
            <ul className={LIST}>
              <li><Link to="/learn" className={LINK}>Learn</Link></li>
              <li><Link to="/build" className={LINK}>Build</Link></li>
              <li>
                <a
                  href="https://autodrive-ecosystem.github.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={LINK}
                >
                  Simulator
                </a>
              </li>
              <li>
                <a
                  href="https://roboracer-class.github.io/leaderboard/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={LINK}
                >
                  Class leaderboard
                </a>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div className="col-span-2 md:col-span-1">
            <FooterHeading>Community</FooterHeading>
            <a
              href="https://join.slack.com/t/robo-racer/shared_invite/zt-42lsbf50y-_3YPNLl_d3s~wPylAOMg0g"
              target="_blank"
              rel="noopener noreferrer"
              className="mb-4 inline-flex items-center gap-2 rounded-md border border-ink-700 bg-ink-800 px-4 py-2 text-sm font-medium transition-colors duration-200 hover:bg-ink-700 coarse:min-h-11"
            >
              <img
                src="/logos/slack-logo.svg"
                alt="Slack"
                width={20}
                height={20}
                className="h-5 w-5"
              />
              Join Slack
            </a>
            <p className="text-sm leading-relaxed text-text-on-ink-muted">
              Ask questions and get race news first.
            </p>
            {/* Sponsors read the footer for a contact; same mailto as the
                landing's "Sponsor a race" path (public/data/paths.json). */}
            <a href={SPONSOR_MAILTO} className={`mt-4 inline-block underline underline-offset-4 ${LINK} coarse:mt-2`}>
              Sponsor a race
            </a>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-text-on-ink/15">
        <div className={`${edge} py-6`}>
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <p className="text-sm text-text-on-ink-muted">
              © 2026 RoboRacer Foundation. All rights reserved.
            </p>
            <p className="text-sm text-text-on-ink-muted">
              Creative Commons License
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
