import { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import { lazyWithRetry } from "./lib/lazyWithRetry";

// Route-level code splitting: every page is its own chunk so no route pays
// for another route's JS (three.js stays out of the critical path). Every
// deploy renames those chunks, so a reader holding the previous index.html
// asks for a file that is already gone: lazyWithRetry recovers that instead of
// letting the route die.
const Landing = lazyWithRetry("Landing", () => import("./pages/Landing"));
const About = lazyWithRetry("About", () => import("./pages/About"));
const Build = lazyWithRetry("Build", () => import("./pages/Build"));
const Course = lazyWithRetry("Course", () => import("./pages/Course"));
const Learn = lazyWithRetry("Learn", () => import("./pages/Learn"));
const News = lazyWithRetry("News", () => import("./pages/News"));
const RaceCalendar = lazyWithRetry("Race", () => import("./pages/Race"));
const Research = lazyWithRetry("Research", () => import("./pages/Research"));
const Rules = lazyWithRetry("Rules", () => import("./pages/Rules"));
const Chat = lazyWithRetry("Chat", () => import("./pages/Chat"));
const Assembly = lazyWithRetry("Assembly", () => import("./pages/Assembly"));
const Styleguide = lazyWithRetry("Styleguide", () => import("./pages/Styleguide"));

function App() {
  return (
    <Router>
      <Suspense fallback={null}>
        <Routes>
          {/* Wrap all routes inside Layout */}
          <Route element={<Layout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<About />} />
            <Route path="/build" element={<Build />} />
            <Route path="/course" element={<Course />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/news" element={<News />} />
            <Route path="/race" element={<RaceCalendar />} />
            <Route path="/research" element={<Research />} />
            <Route path="/rules" element={<Rules />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/assembly" element={<Assembly />} />
            <Route path="/styleguide" element={<Styleguide />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
