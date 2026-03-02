import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// ============================================
// CONFIGURATION
// ============================================

// Items displayed outside hamburger menu (on desktop)
const VISIBLE_LINKS = ["build", "learn", "race"];

const links = [
  { href: "/about", text: "About" },
  { href: "/build", text: "Build" },
  { href: "/learn", text: "Learn" },
  { href: "/race", text: "Race" },
  { href: "/course", text: "Course" },
  { href: "/research", text: "Research" },
  { href: "/news", text: "News" },
];

export default function Navbar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Split links based on visibility configuration
  const visibleLinks = links.filter(link => 
    VISIBLE_LINKS.includes(link.href.replace('/', '').toLowerCase())
  );
  const hamburgerLinks = links.filter(link => 
    !VISIBLE_LINKS.includes(link.href.replace('/', '').toLowerCase())
  );

  // Detect scroll for shadow enhancement
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      {/* Logo */}
      <Link to="/" className="logo">
        <img
          src="/logos/logo-black-gradient.png"
          alt="RoboRacer"
          className="h-10 w-auto"
        />
      </Link>

      {/* Desktop Links */}
      <div className="nav-links">
        {/* Visible Links */}
        {visibleLinks.map((link) => (
          <Link
            key={link.href}
            to={link.href}
            className={`nav-link ${location.pathname === link.href ? 'active' : ''}`}
          >
            {link.text}
          </Link>
        ))}
        
        {/* Hamburger Menu Button (Desktop) */}
        <button 
          onClick={() => setMenuOpen(!menuOpen)}
          className="nav-link inline-flex items-center gap-1 cursor-pointer"
          aria-label="More menu items"
        >
          <span>More</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {menuOpen ? (
              <path d="M18 6L6 18M6 6l12 12"/>
            ) : (
              <>
                <circle cx="12" cy="12" r="1"/>
                <circle cx="12" cy="5" r="1"/>
                <circle cx="12" cy="19" r="1"/>
              </>
            )}
          </svg>
        </button>
        
        {/* CTA Buttons */}
        <a 
          href="https://autodrive-ecosystem.github.io/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="nav-link inline-flex items-center gap-1"
        >
          Simulator
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
        </a>
        
        <a 
          href="https://join.slack.com/t/robo-racer/shared_invite/zt-3r2d2fe4k-6pvIKjwJH_M28DTyEuR5uQ"
          target="_blank"
          rel="noopener noreferrer" 
          className="nav-cta"
        >
          Join Community
        </a>
      </div>

      {/* Mobile Menu Button */}
      <button 
        className="md:hidden flex items-center gap-1"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          {menuOpen ? (
            <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          ) : (
            <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          )}
        </svg>
      </button>

      {/* Dropdown Menu (Desktop & Mobile) */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="dropdown-menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Show all links on mobile, only hamburger links on desktop */}
            {hamburgerLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="dropdown-menu-link"
              >
                {link.text}
              </Link>
            ))}
            
            {/* Mobile-only: Show visible links + external links */}
            <div className="md:hidden border-t border-gray-200 pt-2 mt-2">
              {visibleLinks.map((link) => (
                <Link
                  key={`mobile-${link.href}`}
                  to={link.href}
                  className="dropdown-menu-link"
                >
                  {link.text}
                </Link>
              ))}
              <a 
                href="https://autodrive-ecosystem.github.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="dropdown-menu-link flex items-center gap-2"
              >
                Simulator
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              </a>
              <a 
                href="https://join.slack.com/t/robo-racer/shared_invite/zt-3r2d2fe4k-6pvIKjwJH_M28DTyEuR5uQ"
                target="_blank"
                rel="noopener noreferrer"
                className="dropdown-menu-link"
              >
                Join Community
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}