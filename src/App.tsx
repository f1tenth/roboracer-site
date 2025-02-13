import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import About from "./pages/About";
// import Build from "./pages/Build";
// import Course from "./pages/Course";
// import Learn from "./pages/Learn";
// import News from "./pages/News";
// import Race from "./pages/Race";
// import Research from "./pages/Research";

function App() {
  return (
    <Router>
      <Routes>
        {/* Wrap all routes inside Layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          {/* <Route path="/build" element={<Build />} />
          <Route path="/course" element={<Course />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/news" element={<News />} />
          <Route path="/race" element={<Race />} />
          <Route path="/research" element={<Research />} /> */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
