import { Link, NavLink, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import ProblemPage from "./pages/ProblemPage";
import TerminalPlayground from "./pages/TerminalPlayground";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 lg:px-8 py-3.5">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2 text-xl font-black tracking-tight text-white hover:opacity-90 transition">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 font-mono font-bold text-white text-base shadow-lg shadow-cyan-900/30">
                &gt;_
              </span>
              <span>LinuxDrill</span>
            </Link>
            <span className="hidden sm:inline-block rounded-full border border-slate-800 bg-slate-900 px-2.5 py-0.5 text-[11px] font-semibold text-slate-400">
              ITSO 2026 CentOS Trainer
            </span>
          </div>

          <nav className="flex items-center space-x-1 sm:space-x-2 text-sm font-medium">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `rounded-lg px-3 py-1.5 transition ${
                  isActive ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                }`
              }
              end
            >
              Problems
            </NavLink>
            <NavLink
              to="/terminal"
              className={({ isActive }) =>
                `flex items-center space-x-1.5 rounded-lg px-3 py-1.5 transition ${
                  isActive ? "bg-cyan-950 text-cyan-300 border border-cyan-800" : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                }`
              }
            >
              <span className="font-mono text-cyan-400">&gt;_</span>
              <span>Terminal</span>
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 lg:px-8 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/p/:id" element={<ProblemPage />} />
          <Route path="/terminal" element={<TerminalPlayground />} />
        </Routes>
      </main>

      <footer className="border-t border-slate-800/60 py-4 text-center text-xs text-slate-500">
        LinuxDrill · Practice content for the 15th IT Skills Olympics (ITSO 2026) Linux Administration Category
      </footer>
    </div>
  );
}
