import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import ProblemPage from "./pages/ProblemPage";
import TerminalPlayground from "./pages/TerminalPlayground";
import Navbar from "./components/Navbar";
import { problems } from "./lib/problems";
import { useProgress } from "./lib/useProgress";

export default function App() {
  const { solved } = useProgress();
  const solvedCount = solved.length;
  const totalCount = problems.length;
  const totalPoints = problems
    .filter((p) => solved.includes(p.id))
    .reduce((sum, p) => sum + p.points, 0);

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navbar
        solvedCount={solvedCount}
        totalCount={totalCount}
        totalPoints={totalPoints}
      />

      <main className="mx-auto w-full max-w-[1536px] flex-1 px-4 lg:px-6 py-5">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/p/:id" element={<ProblemPage />} />
          <Route path="/terminal" element={<TerminalPlayground />} />
        </Routes>
      </main>

      <footer className="border-t border-slate-800/80 bg-[#090d16] py-5 text-center text-xs text-slate-500 font-mono">
        LinuxDrill · ITSO 2026 POSIX & Linux Systems Administration Training Platform
      </footer>
    </div>
  );
}
