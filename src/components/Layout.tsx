import { Outlet } from "react-router-dom";
import Navbar from "./NavBar";
import Footer from "./Footer";
import { useLocation } from "react-router-dom";

export default function Layout() {
  const location = useLocation();
  const currentPath = location.pathname;
  const isAltLayout =
    currentPath === "/learn" ||
    currentPath === "/build" ||
    currentPath === "/course" ||
    currentPath === "/chat";
  const isHiddenRoute = currentPath === "/chat";
  return (
    <div className={`flex flex-col h-[100svh] ${isAltLayout && "overflow-hidden"}`}>
      {!isHiddenRoute && <Navbar />}
      <main className={isHiddenRoute ? "h-full" : undefined}>
        <Outlet />
      </main>
      {!isHiddenRoute && <Footer />}
    </div>
  );
}
