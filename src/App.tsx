import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import About from "./pages/About";
import BuildLanding from "./pages/BuildLanding";
import BuildDocs from "./pages/BuildDocs";
import Course from "./pages/Course";
import LearnLanding from "./pages/LearnLanding";
import LearnCourseKit from "./pages/LearnCourseKit";
import News from "./pages/News";
import RaceLanding from "./pages/RaceLanding";
import RaceEvents from "./pages/RaceEvents";
import Research from "./pages/Research";
import Rules from "./pages/Rules";
// import Events from "./pages/Events";

function App() {
  return (
    <Router>
      <Routes>
        {/* Wrap all routes inside Layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          
          {/* Build routes */}
          <Route path="/build" element={<BuildLanding />} />
          <Route path="/build/docs" element={<BuildDocs />} />
          
          {/* Learn routes */}
          <Route path="/learn" element={<LearnLanding />} />
          <Route path="/learn/coursekit" element={<LearnCourseKit />} />
          
          {/* Race routes */}
          <Route path="/race" element={<RaceLanding />} />
          <Route path="/race/events" element={<RaceEvents />} />
          
          <Route path="/course" element={<Course />} />
          <Route path="/news" element={<News />} />
          <Route path="/research" element={<Research />} />
          <Route path="/rules" element={<Rules />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
