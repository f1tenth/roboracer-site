import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

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
          src="/logos/logo-white-gradient.svg"
          alt="RoboRacer"
          className="h-10 w-auto"
        />
      </Link>

      {/* Desktop Links */}
      <div className="nav-links">
        {links.map((link) => (
          <Link
            key={link.href}
            to={link.href}
            className={`nav-link ${location.pathname === link.href ? 'active' : ''}`}
          >
            {link.text}
          </Link>
        ))}
        
        {/* CTA Buttons */}
        <a 
          href="https://autodrive-ecosystem.github.io/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="nav-link"
        >
          Simulator
        </a>
        
        <a 
          href="https://join.slack.com/t/robo-racer/shared_invite/zt-2pq4fuyjq-gTUflzeZDKDDGjuVoeZqNg"
          target="_blank"
          rel="noopener noreferrer" 
          className="nav-cta"
        >
          Join Community
        </a>
      </div>

      {/* Mobile Menu Button */}
      <button 
        className="md:hidden"
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

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mobile-menu md:hidden"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="mobile-menu-link"
              >
                {link.text}
              </Link>
            ))}
            <a 
              href="https://autodrive-ecosystem.github.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="mobile-menu-link"
            >
              Simulator
            </a>
            <a 
              href="https://join.slack.com/t/robo-racer/shared_invite/zt-2pq4fuyjq-gTUflzeZDKDDGjuVoeZqNg"
              target="_blank"
              rel="noopener noreferrer"
              className="mobile-menu-link"
            >
              Join Community
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}