import { Outlet } from "react-router-dom";
import Navbar from "./NavBar";
import Footer from "./Footer";
import { useLocation } from "react-router-dom";

export default function Layout() {
  const location = useLocation();
  const currentPath = location.pathname;
  const isAltLayout = currentPath === "/learn/coursekit" || currentPath === "/build/docs" || currentPath === "/course";
  return (
    <div className={`flex flex-col ${isAltLayout ? "h-[100svh] overflow-hidden" : "min-h-screen"}`}>
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      {!isAltLayout && <Footer />}
    </div>
  );
}
