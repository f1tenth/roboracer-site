import { useLocation } from "react-router-dom";

export default function Footer() {
  const location = useLocation();
  const isAltFooter = 
    location.pathname === "/learn" || 
    location.pathname === "/build" || 
    location.pathname === "/course";
  
  if (isAltFooter) return null;

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto responsive-padding py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Company Info */}
          <div className="lg:col-span-1 space-y-4">
            <img 
              src="/logos/logo-white-gradient.svg" 
              alt="RoboRacer" 
              className="h-10 w-auto"
            />
            <p className="text-gray-400 text-sm leading-relaxed">
              Advancing autonomous racing through innovation, education, and competition.
            </p>
            <a 
              href="mailto:contact@roboracer.ai" 
              className="text-gray-400 hover:text-white hover:underline underline-offset-2 text-sm transition-colors duration-200 inline-block"
            >
              contact@roboracer.ai
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li><a href="/about" className="text-gray-400 hover:text-white text-sm transition-colors">About</a></li>
              <li><a href="/race" className="text-gray-400 hover:text-white text-sm transition-colors">Race</a></li>
              <li><a href="/news" className="text-gray-400 hover:text-white text-sm transition-colors">News</a></li>
              <li><a href="/research" className="text-gray-400 hover:text-white text-sm transition-colors">Research</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-3">
              <li><a href="/learn" className="text-gray-400 hover:text-white text-sm transition-colors">Learn</a></li>
              <li><a href="/build" className="text-gray-400 hover:text-white text-sm transition-colors">Build</a></li>
              <li><a href="/course" className="text-gray-400 hover:text-white text-sm transition-colors">Course</a></li>
              <li>
                <a 
                  href="https://autodrive-ecosystem.github.io/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Simulator
                </a>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="font-semibold text-white mb-4">Community</h3>
            <a
              href="https://join.slack.com/t/robo-racer/shared_invite/zt-2pq4fuyjq-gTUflzeZDKDDGjuVoeZqNg"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-md transition-colors duration-200 text-sm font-medium mb-4"
            >
              <img 
                src="/logos/slack-logo.svg" 
                alt="Slack" 
                className="h-5 w-5"
              />
              Join Slack
            </a>
            <p className="text-gray-400 text-sm leading-relaxed">
              Connect with our community to get started and ask questions.
            </p>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto responsive-padding py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © 2026 RooRacer Foundation. All rights reserved.
            </p>
            <p className="text-gray-500 text-sm">
              Creative Commons License
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}