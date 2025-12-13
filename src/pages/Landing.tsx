"use client";
import { useState } from "react";
import FloatingTestimonials from "../components/FloatingTestimonials";

// ============================================
// CONFIGURATION
// ============================================

const HERO_CONFIG = {
  useBackgroundImage: false, // Toggle to true when you add hero image
  backgroundImage: '/landing/hero-bg.jpg',
  backgroundOpacity: 0.1,
};

const STATS = [
  { number: '90+', label: 'Universities' },
  { number: '20+', label: 'Countries' },
  { number: '60+', label: 'Publications' },
];

const PILLARS = [
  {
    id: 'educational-materials',
    title: 'Educational Materials Development',
    icon: '📚',
    description: 'We create teaching and training materials for university and K-12 courses covering robot perception, computer vision, localization, mapping, motion planning, and safe control. Over 90 universities, including the University of Pennsylvania, UC San Diego, Clemson University, and more, use these resources.',
    link: '/learn',
    linkText: 'Learn more',
  },
  {
    id: 'educational-events',
    title: 'Educational Events',
    icon: '🎓',
    description: 'We host workshops, tutorials, seminars, and panels on safe autonomous vehicle development at IEEE and ACM accredited conferences.',
    link: null, // No link in original
    linkText: null,
  },
  {
    id: 'community-events',
    title: 'Community Events',
    icon: '🏁',
    description: 'We organize international autonomous racing competitions, hosting over 24 events in locations such as New York, Pittsburgh, Portugal, South Korea, Italy, and Canada.',
    link: '/race',
    linkText: 'See details',
  },
  {
    id: 'open-source',
    title: 'Open-Source Contributions',
    icon: '🔧',
    description: 'We develop and share open-source software and hardware designs to help anyone build autonomous robotic platforms.',
    link: '/build',
    linkText: 'Explore resources',
  },
];

// ============================================
// COMPONENT
// ============================================

export default function Landing() {
  const [showBanner, setShowBanner] = useState(true);

  return (
    <div className="min-h-screen bg-white">
      
      {/* ==================== ANNOUNCEMENT BANNER ==================== */}
      {showBanner && (
        <div className="bg-red-50 border-b border-red-200">
          <div className="max-w-7xl mx-auto px-6 py-3">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm md:text-base text-red-900 flex-1">
                Over the last 5 years, RoboRacer has enjoyed tremendous growth and community support. 
                We are ready to go beyond just the 1/10th-scale vehicles for broader community-driven engagements. 
                Stay tuned as we migrate F1Tenth.org to RoboRacer.AI!
              </p>
              <button
                onClick={() => setShowBanner(false)}
                className="text-red-900 hover:text-red-700 flex-shrink-0 p-1"
                aria-label="Dismiss announcement"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* ==================== HERO SECTION ==================== */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background Image (conditional) */}
        {HERO_CONFIG.useBackgroundImage && (
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${HERO_CONFIG.backgroundImage})`,
              opacity: HERO_CONFIG.backgroundOpacity,
            }}
          />
        )}
        
        {/* Solid Background Fallback */}
        <div className="absolute inset-0 bg-white -z-10" />
        
        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            The Leading Platform for Autonomous Racing Education and Research
          </h1>
          
          {/* Subheadline */}
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Open-source hardware, global competitions, and comprehensive learning resources powering the next generation of robotics innovators.
          </p>
          
          {/* CTA Button */}
          <a
            href="https://join.slack.com/t/robo-racer/shared_invite/zt-2pq4fuyjq-gTUflzeZDKDDGjuVoeZqNg"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            <img src="/logos/slack-logo.svg" alt="" width={24} height={24} />
            Join Our Community
          </a>
        </div>
      </section>

      {/* ==================== STATS BAR ==================== */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STATS.map((stat, index) => (
              <div key={stat.label} className="text-center relative">
                {/* Stat Content */}
                <div className="flex flex-col items-center">
                  <div className="text-5xl md:text-6xl font-bold text-gray-900 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-sm uppercase tracking-wide text-gray-600 font-medium">
                    {stat.label}
                  </div>
                </div>
                
                {/* Divider (not on last item) */}
                {index < STATS.length - 1 && (
                  <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 h-16 w-px bg-gray-300" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== FOUR PILLARS ==================== */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          {/* Section Header */}
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
            What We Do
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            We advance robotics and autonomous vehicle education through the following initiatives
          </p>
          
          {/* Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PILLARS.map((pillar) => (
              <div 
                key={pillar.id}
                className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Icon */}
                <div className="text-4xl mb-4">
                  {pillar.icon}
                </div>
                
                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {pillar.title}
                </h3>
                
                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {pillar.description}
                </p>
                
                {/* Link (if exists) */}
                {pillar.link && (
                  <a 
                    href={pillar.link}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm inline-flex items-center gap-1 group"
                  >
                    {pillar.linkText}
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== COMMUNITY CTA ==================== */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left Column: CTA Content */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Join Our Global Community
              </h2>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                Connect with researchers, students, and autonomous racing enthusiasts from around the world. Get support, share insights, and collaborate on cutting-edge robotics projects.
              </p>
              <a
                href="https://join.slack.com/t/robo-racer/shared_invite/zt-2pq4fuyjq-gTUflzeZDKDDGjuVoeZqNg"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
              >
                <img src="/logos/slack-logo.svg" alt="" width={20} height={20} />
                Join on Slack
              </a>
            </div>
            
            {/* Right Column: Image */}
            <div className="relative h-64 md:h-96 rounded-lg overflow-hidden bg-gray-100 shadow-md">
              <img 
                src="/landing/car-inside.png" 
                alt="RoboRacer Community" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ==================== TESTIMONIALS ==================== */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            What Our Community Says
          </h2>
          <FloatingTestimonials />
        </div>
      </section>

    </div>
  );
}