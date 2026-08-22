import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

// Route-level code splitting: every page is its own chunk so no route pays
// for another route's JS (three.js stays out of the critical path).
const Landing = lazy(() => import("./pages/Landing"));
const About = lazy(() => import("./pages/About"));
const Build = lazy(() => import("./pages/Build"));
const Course = lazy(() => import("./pages/Course"));
const Learn = lazy(() => import("./pages/Learn"));
const News = lazy(() => import("./pages/News"));
const RaceCalendar = lazy(() => import("./pages/Race"));
const Research = lazy(() => import("./pages/Research"));
const Rules = lazy(() => import("./pages/Rules"));
const Chat = lazy(() => import("./pages/Chat"));
const Assembly = lazy(() => import("./pages/Assembly"));
const Styleguide = lazy(() => import("./pages/Styleguide"));

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
