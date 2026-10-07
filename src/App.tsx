import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { problems } from "./lib/problems";
import { useProgress } from "./lib/useProgress";

export default function App() {
  const location = useLocation();
  const isTerminal = location.pathname.startsWith("/terminal");
  const isProblem = location.pathname.startsWith("/p/");
  const isFullscreen = isTerminal || isProblem;
  const { solved } = useProgress();
  const solvedCount = solved.length;
  const totalCount = problems.length;
  const totalPoints = problems
    .filter((p) => solved.includes(p.id))
    .reduce((sum, p) => sum + p.points, 0);

  return (
    <div className="min-h-screen flex flex-col font-sans antialiased transition-colors duration-120" style={{ backgroundColor: 'var(--bg-canvas)', color: 'var(--text-main)' }}>
      <Navbar
        solvedCount={solvedCount}
        totalCount={totalCount}
        totalPoints={totalPoints}
      />

      <main className={`w-full flex-1 ${isTerminal ? "p-0 overflow-hidden" : "px-5 lg:px-8 py-6"}`}>
        <Outlet />
      </main>

      {!isFullscreen && <Footer />}
    </div>
  );
}

