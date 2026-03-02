"use client";
import FloatingTestimonials from "../components/FloatingTestimonials";
import VideoSlider from "../components/VideoSlider";

// ============================================
// CONFIGURATION
// ============================================

const STATS = [
  { number: '90+', label: 'Universities' },
  { number: '20+', label: 'Countries' },
  { number: '2000+', label: 'Community Members' },
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

const VIDEOS = [
  'https://www.youtube.com/watch?v=wPHYLAnpMOU',
  'https://youtu.be/zuyOdaQ2xuw',
  'https://youtu.be/R87Qlq_wSY8',
  'https://www.youtube.com/watch?v=_RB63z6lUEE',
];

// ============================================
// COMPONENT
// ============================================

export default function Landing() {

  return (
    <div className="min-h-screen bg-white pt-[68px] md:pt-[85px]">
      
      {/* ==================== HERO SECTION ==================== */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 w-full h-full">
          <video 
            autoPlay 
            muted 
            loop 
            playsInline 
            preload="metadata"
            poster="https://xlab.upenn.edu/img/xlab_logo_colors_wide.gif"
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          >
            <source src="https://pub-6191ce2447d545b0ba681f0dc19a861c.r2.dev/f110_fpv.mp4" type="video/mp4" />
          </video>
        </div>
        
        {/* Solid Background Fallback */}
        <div className="absolute inset-0 bg-white -z-10" />
        
        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          {/* Animated Logo */}
          <div className="mb-8 flex justify-center">
            <img 
              src="/logos/Logo_Gradient.gif" 
              alt="RoboRacer Logo" 
              className="w-64 md:w-80 lg:w-96 h-auto"
            />
          </div>
          
          {/* Tagline */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
            Join the future of autonomous racing
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-700 mb-6">
            Fast, simple and open source
          </p>
          
          {/* Headline */}
          <p className="text-base md:text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
            The leading platform for autonomous racing education and research. Open-source hardware, global competitions, and comprehensive learning resources powering the next generation of robotics innovators.
          </p>
          
          {/* CTA Button */}
          <a
            href="https://join.slack.com/t/robo-racer/shared_invite/zt-3r2d2fe4k-6pvIKjwJH_M28DTyEuR5uQ"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-blue-900 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
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
      <section className="py-10 bg-gray-50">
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
      <section className="py-10 bg-white">
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
              href="https://join.slack.com/t/robo-racer/shared_invite/zt-3r2d2fe4k-6pvIKjwJH_M28DTyEuR5uQ"
            </div>
            
            {/* Right Column: Image */}
            <div className="relative h-64 md:h-96 rounded-lg overflow-hidden bg-gray-100 shadow-md">
              <img 
                src="/landing/car-inside.png" 
                alt="RoboRacer Community" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ==================== TESTIMONIALS ==================== */}
      <section className="py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          {/* <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            What Our Community Says
          </h2> */}
          <FloatingTestimonials />
        </div>
      </section>

      {/* ==================== VIDEOS ==================== */}
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
            See RoboRacer in Action
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Watch highlights from our autonomous racing competitions and educational events
          </p>
          <VideoSlider videos={VIDEOS} />
        </div>
      </section>

    </div>
  );
}