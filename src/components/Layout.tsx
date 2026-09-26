import { useLayoutEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./NavBar";
import Footer from "./Footer";
import RouteBoundary from "./RouteBoundary";
import { useRouteScroll } from "../hooks/useRouteScroll";

/**
 * One document title per route. An SPA keeps the index.html title forever
 * otherwise, so every page shared, bookmarked or read by a screen reader
 * announced itself as plain "RoboRacer".
 */
const TITLES: Record<string, string> = {
  "/": "RoboRacer - autonomous racing, built and raced in the open",
  "/about": "About - RoboRacer",
  "/build": "Build the car - RoboRacer",
  "/learn": "Learn - RoboRacer",
  "/news": "News - RoboRacer",
  "/race": "Race - RoboRacer",
  "/research": "Research - RoboRacer",
  "/rules": "Competition rules - RoboRacer",
  "/chat": "Chat - RoboRacer",
  "/assembly": "The car, part by part - RoboRacer",
  "/styleguide": "Style guide - RoboRacer",
};

export default function Layout() {
  const location = useLocation();
  const currentPath = location.pathname;
  const isAltLayout =
    currentPath === "/learn" ||
    currentPath === "/build" ||
    currentPath === "/chat" ||
    currentPath === "/assembly";
  const isHiddenRoute = currentPath === "/chat";
  // /assembly keeps the site nav (it used to cover it with its own bar) and,
  // being one window tall like /build, has no footer to reach.
  const hideFooter = isHiddenRoute || currentPath === "/assembly";

  useLayoutEffect(() => {
    document.title = TITLES[currentPath] ?? "RoboRacer";
  }, [currentPath]);

  // A client-side navigation keeps the window's scroll position: every route
  // opens at its top (Back/Forward inside one page restores exactly).
  useRouteScroll();

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
      {!hideFooter && <Footer />}
    </div>
  );
}
