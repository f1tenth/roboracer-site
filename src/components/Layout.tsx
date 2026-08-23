import { useLayoutEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./NavBar";
import Footer from "./Footer";
import RouteBoundary from "./RouteBoundary";
import { ScrollTrigger } from "../lib/motion";

export default function Layout() {
  const location = useLocation();
  const currentPath = location.pathname;
  const isAltLayout =
    currentPath === "/learn" ||
    currentPath === "/build" ||
    currentPath === "/course" ||
    currentPath === "/chat" ||
    currentPath === "/assembly";
  const isHiddenRoute = currentPath === "/chat" || currentPath === "/assembly";

  // A client-side navigation keeps the window's scroll position and the
  // ScrollTrigger starts measured against the page that just left. Put the
  // reader at the top of the new page, then re-measure once it has painted.
  // The landing's Lenis instance is created and destroyed with the landing
  // itself, so plain window scrolling is the right reset here.
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    const frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(frame);
  }, [currentPath]);

  return (
    <div className={`flex flex-col ${isAltLayout ? "h-[100svh] overflow-hidden" : "min-h-[100svh]"}`}>
      {!isHiddenRoute && <Navbar />}
      <main className={isHiddenRoute ? "h-full" : undefined}>
        {/* Keyed on the path: one broken page can never blank the shell, and
            the fallback clears itself as soon as the reader navigates away. */}
        <RouteBoundary resetKey={currentPath}>
          <Outlet />
        </RouteBoundary>
      </main>
      {!isHiddenRoute && <Footer />}
    </div>
  );
}
