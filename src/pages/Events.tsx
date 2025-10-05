import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import About from "./sections/About";
import Rules from "./sections/Rules";
import Resources from "./sections/Resources";
import Timeline from "./sections/Timeline";
import GettingStarted from "./sections/GettingStarted";
import Registration from "./sections/Registration";
import bgImage from "./sections/assets/bg.jpeg";
import heroImage from "./sections/assets/bg.jpeg";

const tabs = [
  { id: "about", label: "About" },
  { id: "timeline", label: "Timeline" },
  { id: "raceResources", label: "Race Resources" },
  { id: "gettingStarted", label: "Getting Started" },
  { id: "registration", label: "Registration" },
];

const Events = () => {
  const [tab, setTab] = useState("about");
  const [opacity, setOpacity] = useState(1);
  const infoRef = useRef<HTMLDivElement | null>(null);

  const handleClick = () => {
    infoRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const fadePoint = window.innerHeight / 1.2;
      setOpacity(Math.max(1 - scrollY / fadePoint, 0));
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const renderTabContent = () => {
    switch (tab) {
      case "about":
        return <About />;
      case "timeline":
        return <Timeline />;
      case "rules":
        return <Rules />;
      case "raceResources":
        return <Resources />;
      case "gettingStarted":
        return <GettingStarted />;
      case "registration":
        return <Registration />;
      default:
        return null;
    }
  };

  return (
    <main className="relative w-full overflow-x-hidden font-sans">
      {/* Fixed Background */}
      <div
        className="fixed top-0 left-0 w-full h-screen bg-cover bg-center -z-10"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundAttachment: "fixed",
          filter: "brightness(0.6)",
        }}
      />

      {/* Hero Section */}
      <section className="relative h-screen flex justify-center items-center">
        <motion.div
          onClick={handleClick}
          className="cursor-pointer flex justify-center items-center w-3/4 md:w-1/2 h-1/2 rounded-3xl shadow-2xl relative overflow-hidden"
          style={{
            opacity,
            backgroundImage: `url(${heroImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.5 }}
        >
          {/* Overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/70 backdrop-blur-sm flex items-center justify-center rounded-3xl"
            style={{ opacity }}
            initial={{ opacity: 0 }}
            animate={{ opacity: opacity }}
          >
            <motion.h1
              className="text-white text-2xl md:text-4xl font-extrabold text-center px-4"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              26th Roboracer&apos;s Competition
              <br />
              Techfest, IIT Bombay
            </motion.h1>
          </motion.div>
        </motion.div>

        {/* Scroll Down Arrow */}
        <motion.div
          onClick={handleClick}
          className="absolute bottom-8 cursor-pointer"
          initial={{ y: 0 }}
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </motion.div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-white/80 to-transparent" />
      </section>

      {/* Info Section with Tabs */}
      <section
        ref={infoRef}
        className="min-h-screen px-6 py-12 my-12 bg-white/95 rounded-3xl shadow-2xl max-w-6xl mx-auto relative z-10"
      >
        {/* Tabs */}
        <div className="relative flex justify-center mb-8 border-b pb-2 flex-wrap">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-6 py-3 mx-2 my-1 rounded-t-lg transition-all duration-300 font-medium ${
                tab === t.id
                  ? "bg-black text-white shadow-lg scale-105"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {t.label}
            </button>
          ))}
          {/* Tab Indicator */}
          <motion.div
            layoutId="tabIndicator"
            className="absolute bottom-0 h-1 rounded-full bg-black"
            style={{
              width: `${100 / tabs.length}%`,
              left: `${
                tabs.findIndex((t) => t.id === tab) * (100 / tabs.length)
              }%`,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </section>
    </main>
  );
};

export default Events;
