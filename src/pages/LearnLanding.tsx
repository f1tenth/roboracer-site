import { Link } from "react-router-dom";

export default function LearnLanding() {
  return (
    <div className="min-h-screen bg-white pt-[68px] md:pt-[85px]">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-green-50 to-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="inline-block px-4 py-2 bg-green-100 text-green-900 rounded-full text-sm font-semibold mb-6">
            📚 Learn & Educate
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Master Autonomous Racing
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Comprehensive educational materials covering perception, planning, control, and multi-agent systems. Used by 90+ universities worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/learn/coursekit"
              className="inline-flex items-center justify-center gap-2 bg-green-700 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-600 transition-colors shadow-lg hover:shadow-xl"
            >
              Browse Course Materials
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
            <Link
              to="/course"
              className="inline-flex items-center justify-center gap-2 bg-white text-green-700 border-2 border-green-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-50 transition-colors"
            >
              View Full Course
            </Link>
          </div>
        </div>
      </section>

      {/* Topics Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            What You'll Learn
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="text-4xl mb-4">👁️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Perception</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Computer vision, LIDAR processing, sensor fusion, and object detection for autonomous vehicles.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="text-4xl mb-4">🗺️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Mapping & Localization</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                SLAM algorithms, particle filters, and state estimation techniques for robot localization.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Motion Planning</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Path planning, trajectory optimization, and navigation algorithms for autonomous racing.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="text-4xl mb-4">🎮</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Control Systems</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                PID control, model predictive control, and safe control strategies for high-speed racing.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Multi-Agent Systems</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Coordination, communication, and strategic decision-making for multi-vehicle scenarios.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Safety & Verification</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Safety-critical systems, formal verification, and testing strategies for autonomous vehicles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Learning Resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold text-gray-900 mb-2">📖 Course Materials</h3>
              <p className="text-gray-600 text-sm mb-4">
                Lecture slides, labs, assignments, and projects used at leading universities worldwide.
              </p>
              <Link to="/learn/coursekit" className="text-green-700 hover:text-green-600 font-medium text-sm inline-flex items-center gap-1">
                View Course Kit →
              </Link>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold text-gray-900 mb-2">🎓 Full Course</h3>
              <p className="text-gray-600 text-sm mb-4">
                Complete semester-long course on autonomous racing systems and robotics.
              </p>
              <Link to="/course" className="text-green-700 hover:text-green-600 font-medium text-sm inline-flex items-center gap-1">
                Start Learning →
              </Link>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold text-gray-900 mb-2">📄 Research Papers</h3>
              <p className="text-gray-600 text-sm mb-4">
                60+ publications on autonomous racing, perception, planning, and control.
              </p>
              <Link to="/research" className="text-green-700 hover:text-green-600 font-medium text-sm inline-flex items-center gap-1">
                Browse Research →
              </Link>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold text-gray-900 mb-2">🎮 Hands-on Labs</h3>
              <p className="text-gray-600 text-sm mb-4">
                Interactive simulator-based exercises to practice algorithms and techniques.
              </p>
              <a href="https://autodrive-ecosystem.github.io/" target="_blank" rel="noopener noreferrer" className="text-green-700 hover:text-green-600 font-medium text-sm inline-flex items-center gap-1">
                Launch Simulator →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-green-700 mb-2">90+</div>
              <div className="text-gray-600 font-medium">Universities Using Our Materials</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-green-700 mb-2">20+</div>
              <div className="text-gray-600 font-medium">Countries Worldwide</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-green-700 mb-2">60+</div>
              <div className="text-gray-600 font-medium">Research Publications</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-700 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Start Learning Today
          </h2>
          <p className="text-lg md:text-xl text-green-100 mb-8">
            Access world-class educational materials on autonomous racing and robotics.
          </p>
          <Link
            to="/learn/coursekit"
            className="inline-flex items-center justify-center gap-2 bg-white text-green-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-50 transition-colors shadow-lg"
          >
            Browse Course Materials
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
