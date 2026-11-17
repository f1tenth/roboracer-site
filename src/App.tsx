import { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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
const Learn = lazyWithRetry("Learn", () => import("./pages/Learn"));
const LearnNew = lazyWithRetry("LearnNew", () => import("./pages/LearnNew"));
const LearnIntro = lazyWithRetry("LearnIntro", () => import("./pages/learn-new/LearnIntro"));
const LearnSyllabus = lazyWithRetry("LearnSyllabus", () => import("./pages/learn-new/LearnSyllabus"));
const LearnModule = lazyWithRetry("LearnModule", () => import("./pages/learn-new/LearnModule"));
const LearnLecture = lazyWithRetry("LearnLecture", () => import("./pages/learn-new/LearnLecture"));
const LearnDoc = lazyWithRetry("LearnDoc", () => import("./pages/learn-new/LearnDoc"));
const Courses = lazyWithRetry("Courses", () => import("./pages/Courses"));
const Course = lazyWithRetry("Course", () => import("./pages/Course"));
const Teach = lazyWithRetry("Teach", () => import("./pages/Teach"));
const News = lazyWithRetry("News", () => import("./pages/News"));
const NewsPost = lazyWithRetry("NewsPost", () => import("./pages/NewsPost"));
const NewsWrite = lazyWithRetry("NewsWrite", () => import("./pages/NewsWrite"));
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
            {/* Ahmad Amine, Slack 2026-08-23: Learn and Course are two sets of
                teaching material and keeping both means maintaining both. One
                page now; /course still resolves so no shared link breaks. */}
            <Route path="/course" element={<Navigate to="/learn" replace />} />
            <Route path="/learn" element={<Learn />} />
            {/* The course catalog, one page per plan or university, and the
                instructors page, rendered from public/data/courses.json (first
                ported from Dhyey Shah's LMS mock). Native again since
                2026-10-20 (Cedric): the coursekit sidebar's Courses link lands
                here. /learn itself stays the docs frame. */}
            <Route path="/learn/courses" element={<Courses />} />
            <Route path="/learn/courses/:id" element={<Course />} />
            <Route path="/learn/teach" element={<Teach />} />
            {/* Preview of the rebuilt course docs, for internal review before it
                replaces /learn. Every docs page is native; exported bodies load
                from public/data/learn-new/pages. */}
            <Route path="/learn-new" element={<LearnNew />}>
              <Route index element={<LearnIntro />} />
              <Route path="syllabus" element={<LearnSyllabus />} />
              <Route path=":moduleSlug" element={<LearnModule />} />
              <Route path=":moduleSlug/:lectureId" element={<LearnLecture />} />
              <Route path="doc/*" element={<LearnDoc />} />
            </Route>
            <Route path="/news" element={<News />} />
            {/* A post hosted here (public/data/posts.json and its Markdown
                file); its card on /news links to it. */}
            {/* The post writer: its own address under News. A static segment
                outranks :slug, so no post can ever be called "write"
                (the writer and scripts/publish-post.mjs both refuse it). */}
            <Route path="/news/write" element={<NewsWrite />} />
            <Route path="/news/:slug" element={<NewsPost />} />
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
