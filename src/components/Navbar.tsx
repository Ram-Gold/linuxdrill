import { Link, NavLink } from "react-router-dom";

interface NavbarProps {
  solvedCount: number;
  totalCount: number;
  totalPoints: number;
}

export default function Navbar({
  solvedCount,
  totalCount,
  totalPoints,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-[#090d16]/90 border-b border-slate-800/80 backdrop-blur-md px-4 lg:px-6 py-3 transition-colors select-none">
      <div className="max-w-[1536px] mx-auto flex items-center justify-between gap-4">
        {/* Brand logo & title */}
        <Link
          to="/"
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 font-mono font-bold text-base transition-all group-hover:border-cyan-500/60 group-hover:text-cyan-300 shadow-sm shadow-cyan-950/40">
            &gt;_
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                Linux<span className="text-cyan-400">Drill</span>
              </span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800/90 text-cyan-400 border border-slate-700/60 tracking-wider font-semibold">
                v2.4
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
              ITSO 2026 · POSIX & Linux Systems Mastery
            </span>
          </div>
        </Link>

        {/* Center navigation & context */}
        <nav className="hidden md:flex items-center gap-4">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `text-xs font-mono font-medium transition-colors px-3 py-1.5 rounded-lg border ${
                isActive
                  ? "text-cyan-300 bg-slate-800/80 border-cyan-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-transparent"
              }`
            }
          >
            Problems ({solvedCount}/{totalCount})
          </NavLink>

          <NavLink
            to="/terminal"
            className={({ isActive }) =>
              `text-xs font-mono font-medium transition-colors px-3 py-1.5 rounded-lg border flex items-center gap-1.5 ${
                isActive
                  ? "text-cyan-300 bg-slate-800/80 border-cyan-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-transparent"
              }`
            }
          >
            <span>&gt;_</span>
            <span>Terminal</span>
          </NavLink>

          <div className="h-4 w-[1px] bg-slate-800" />

          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>CentOS 9 Sandbox Ready</span>
          </div>
        </nav>

        {/* Right status & metrics */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg shadow-sm">
            <div className="flex flex-col text-right">
              <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">
                Score
              </span>
              <span className="text-xs font-mono font-bold text-cyan-400">
                {totalPoints} PTS
              </span>
            </div>
            <div className="w-[1px] h-6 bg-slate-800" />
            <div className="flex flex-col text-right">
              <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">
                Solved
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {solvedCount}/{totalCount}
              </span>
            </div>
          </div>

          <div
            className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-mono font-bold text-slate-300"
            title="Student User"
          >
            SU
          </div>
        </div>
      </div>
    </header>
  );
}
