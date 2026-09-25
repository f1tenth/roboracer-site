import { Link, useLocation } from "react-router-dom";

const SPONSOR_MAILTO = "mailto:contact@roboracer.ai?subject=RoboRacer%20sponsorship";
const LINK = "text-text-on-ink-muted hover:text-text-on-ink text-sm transition-colors";

export default function Footer() {
  const location = useLocation();
  const isAltFooter = location.pathname === "/learn" || location.pathname === "/build";
  
  if (isAltFooter) return null;

  return (
    <footer className="bg-ink-950 text-text-on-ink">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto responsive-padding py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Company Info */}
          <div className="lg:col-span-1 space-y-4">
            <img
              src="/logos/logo-white-gradient.svg"
              alt="RoboRacer"
              width={151}
              height={26}
              className="h-10 w-auto"
            />
            <p className="text-text-on-ink-muted text-sm leading-relaxed">
              Open-source autonomous racing since 2016.
            </p>
            <a 
              href="mailto:contact@roboracer.ai" 
              className="text-text-on-ink-muted hover:text-text-on-ink hover:underline underline-offset-2 text-sm transition-colors duration-200 inline-block"
            >
              contact@roboracer.ai
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-text-on-ink mb-4">Quick links</h3>
            <ul className="space-y-3">
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
            <h3 className="font-semibold text-text-on-ink mb-4">Resources</h3>
            <ul className="space-y-3">
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
          <div>
            <h3 className="font-semibold text-text-on-ink mb-4">Community</h3>
            <a
              href="https://join.slack.com/t/robo-racer/shared_invite/zt-42lsbf50y-_3YPNLl_d3s~wPylAOMg0g"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 border border-ink-700 bg-ink-800 hover:bg-ink-700 rounded-md transition-colors duration-200 text-sm font-medium mb-4"
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
            <p className="text-text-on-ink-muted text-sm leading-relaxed">
              Ask questions and get race news first.
            </p>
            {/* Sponsors read the footer for a contact; same mailto as the
                landing's "Sponsor a race" path (public/data/paths.json). */}
            <a href={SPONSOR_MAILTO} className={`mt-4 inline-block ${LINK} underline underline-offset-4`}>
              Sponsor a race
            </a>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-text-on-ink/15">
        <div className="max-w-7xl mx-auto responsive-padding py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-text-on-ink-muted text-sm">
              © 2026 RoboRacer Foundation. All rights reserved.
            </p>
            <p className="text-text-on-ink-muted text-sm">
              Creative Commons License
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}