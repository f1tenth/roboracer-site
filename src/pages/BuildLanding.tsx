import { Link } from "react-router-dom";

export default function BuildLanding() {
  return (
    <div className="min-h-screen bg-white pt-[68px] md:pt-[85px]">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-blue-50 to-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="inline-block px-4 py-2 bg-blue-100 text-blue-900 rounded-full text-sm font-semibold mb-6">
            🔧 Build Your Own
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Build Your Autonomous Racing Platform
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Complete open-source hardware and software documentation to build your own 1/10th scale autonomous racing car. From assembly to deployment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/build/docs"
              className="inline-flex items-center justify-center gap-2 bg-blue-900 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              View Documentation
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
            <a
              href="https://join.slack.com/t/robo-racer/shared_invite/zt-2pq4fuyjq-gTUflzeZDKDDGjuVoeZqNg"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white text-blue-900 border-2 border-blue-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Get Help on Slack
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            What You'll Build
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="text-4xl mb-4">🏎️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Hardware Platform</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Complete bill of materials, CAD files, and assembly instructions for building a 1/10th scale autonomous racing car with LIDAR, cameras, and compute.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="text-4xl mb-4">💻</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Software Stack</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                ROS2-based perception, planning, and control software with ready-to-use algorithms for mapping, localization, and path planning.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="text-4xl mb-4">🔬</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Research Platform</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Extensible architecture perfect for testing new algorithms in perception, planning, control, and multi-agent racing scenarios.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Build Resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold text-gray-900 mb-2">📦 Hardware Guide</h3>
              <p className="text-gray-600 text-sm mb-4">
                Step-by-step assembly instructions, component specifications, and sourcing information.
              </p>
              <Link to="/build/docs" className="text-blue-600 hover:text-blue-700 font-medium text-sm inline-flex items-center gap-1">
                Get Started →
              </Link>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold text-gray-900 mb-2">⚙️ Software Setup</h3>
              <p className="text-gray-600 text-sm mb-4">
                Installation guides, dependencies, and configuration for the complete software stack.
              </p>
              <Link to="/build/docs" className="text-blue-600 hover:text-blue-700 font-medium text-sm inline-flex items-center gap-1">
                View Docs →
              </Link>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold text-gray-900 mb-2">🎮 Simulator</h3>
              <p className="text-gray-600 text-sm mb-4">
                Test your algorithms in simulation before deploying to hardware.
              </p>
              <a href="https://autodrive-ecosystem.github.io/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-medium text-sm inline-flex items-center gap-1">
                Launch Simulator →
              </a>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold text-gray-900 mb-2">👥 Community Support</h3>
              <p className="text-gray-600 text-sm mb-4">
                Join our Slack community for help, tips, and collaboration with other builders.
              </p>
              <a href="https://join.slack.com/t/robo-racer/shared_invite/zt-2pq4fuyjq-gTUflzeZDKDDGjuVoeZqNg" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-medium text-sm inline-flex items-center gap-1">
                Join Slack →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-900 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Build?
          </h2>
          <p className="text-lg md:text-xl text-blue-100 mb-8">
            Access complete documentation, CAD files, bill of materials, and software packages.
          </p>
          <Link
            to="/build/docs"
            className="inline-flex items-center justify-center gap-2 bg-white text-blue-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg"
          >
            Access Build Documentation
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
