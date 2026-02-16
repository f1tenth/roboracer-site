import { Link } from "react-router-dom";

export default function RaceLanding() {
  return (
    <div className="min-h-screen bg-white pt-[68px] md:pt-[85px]">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-red-50 to-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="inline-block px-4 py-2 bg-red-100 text-red-900 rounded-full text-sm font-semibold mb-6">
            🏁 Compete & Race
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Compete in Autonomous Racing
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Join international competitions, test your algorithms against the best, and push the boundaries of autonomous racing technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/race/events"
              className="inline-flex items-center justify-center gap-2 bg-red-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-red-500 transition-colors shadow-lg hover:shadow-xl"
            >
              View Upcoming Events
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
            <Link
              to="/rules"
              className="inline-flex items-center justify-center gap-2 bg-white text-red-600 border-2 border-red-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-red-50 transition-colors"
            >
              Competition Rules
            </Link>
          </div>
        </div>
      </section>

      {/* Competition Types Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Competition Formats
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Time Trials</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Race against the clock to achieve the fastest lap times on challenging tracks with tight corners and obstacles.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="text-4xl mb-4">🏎️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Head-to-Head Racing</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Compete directly against other autonomous vehicles, requiring strategic overtaking and defensive driving.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="text-4xl mb-4">🌐</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Multi-Agent Scenarios</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Coordinate with teammates or compete in complex scenarios with multiple vehicles on track.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Event Highlights Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Racing Opportunities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold text-gray-900 mb-2">📅 Upcoming Events</h3>
              <p className="text-gray-600 text-sm mb-4">
                View the schedule of upcoming competitions, workshops, and racing events worldwide.
              </p>
              <Link to="/race/events" className="text-red-600 hover:text-red-500 font-medium text-sm inline-flex items-center gap-1">
                See Schedule →
              </Link>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold text-gray-900 mb-2">📋 Competition Rules</h3>
              <p className="text-gray-600 text-sm mb-4">
                Learn about race formats, technical requirements, and competition guidelines.
              </p>
              <Link to="/rules" className="text-red-600 hover:text-red-500 font-medium text-sm inline-flex items-center gap-1">
                Read Rules →
              </Link>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold text-gray-900 mb-2">🏆 Past Results</h3>
              <p className="text-gray-600 text-sm mb-4">
                Browse results and highlights from previous competitions around the world.
              </p>
              <Link to="/race/events" className="text-red-600 hover:text-red-500 font-medium text-sm inline-flex items-center gap-1">
                View Results →
              </Link>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold text-gray-900 mb-2">🎯 Practice</h3>
              <p className="text-gray-600 text-sm mb-4">
                Test your algorithms in simulation before competing in real-world events.
              </p>
              <a href="https://autodrive-ecosystem.github.io/" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-500 font-medium text-sm inline-flex items-center gap-1">
                Launch Simulator →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Global Racing Community
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-red-600 mb-2">24+</div>
              <div className="text-gray-600 font-medium">International Events</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-red-600 mb-2">20+</div>
              <div className="text-gray-600 font-medium">Countries</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-red-600 mb-2">100+</div>
              <div className="text-gray-600 font-medium">Racing Teams</div>
            </div>
          </div>
        </div>
      </section>

      {/* Locations Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Race Around the World
          </h2>
          <p className="text-gray-600 mb-8">
            We've hosted competitions in major cities including New York, Pittsburgh, Portugal, South Korea, Italy, Canada, and more.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {['🇺🇸 USA', '🇵🇹 Portugal', '🇰🇷 South Korea', '🇮🇹 Italy', '🇨🇦 Canada', '🇬🇧 UK', '🇩🇪 Germany', '🇯🇵 Japan'].map((location) => (
              <span key={location} className="px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-700 shadow-sm">
                {location}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-red-600 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Race?
          </h2>
          <p className="text-lg md:text-xl text-red-100 mb-8">
            Join our next competition and test your autonomous racing skills against the world's best.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/race/events"
              className="inline-flex items-center justify-center gap-2 bg-white text-red-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-red-50 transition-colors shadow-lg"
            >
              View Upcoming Events
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
            <a
              href="https://join.slack.com/t/robo-racer/shared_invite/zt-2pq4fuyjq-gTUflzeZDKDDGjuVoeZqNg"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-red-700 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-red-800 transition-colors border-2 border-white"
            >
              Join Community
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
