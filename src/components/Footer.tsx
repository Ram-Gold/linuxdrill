import { Link } from "react-router-dom";
import {
  Terminal,
  ArrowUp,
  Zap,
  BookOpen,
  Layers,
  Sparkles,
} from "lucide-react";
import BashistLogo from "./BashistLogo";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="w-full mt-auto border-t border-white/5 bg-[var(--surface-base)]/60 backdrop-blur-md transition-colors select-none">
      <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-12 lg:py-16 space-y-12">
        {/* Top Grid: Branding, Quick Navigation, Tracks */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* Column 1 & 2 (Spans 2 cols on lg): Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5 mimo-press group">
              <BashistLogo className="w-8 h-8 group-hover:scale-105 transition-transform" />
              <span className="text-xl font-bold tracking-tight text-[var(--text-main)] font-heading">
                Bash<span className="text-[var(--accent-primary)]">ist</span>
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed max-w-sm">
              An interactive, in-memory Linux administration trainer and command drill simulator.
              Master POSIX utilities, system administration, and shell muscle memory with immediate feedback.
            </p>
          </div>

          {/* Column 3: Quick Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-[var(--accent-primary-soft)] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Navigation</span>
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link
                  to="/"
                  className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors inline-flex items-center gap-1.5 hover:translate-x-0.5 duration-150"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                  <span>Curated Roadmap</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/drills"
                  className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors inline-flex items-center gap-1.5 hover:translate-x-0.5 duration-150"
                >
                  <Zap className="w-3.5 h-3.5 text-[var(--accent-amber)]" />
                  <span>Speed Drills & Decks</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/terminal"
                  className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors inline-flex items-center gap-1.5 hover:translate-x-0.5 duration-150"
                >
                  <Terminal className="w-3.5 h-3.5 text-[var(--accent-primary-soft)]" />
                  <span>Terminal Playground</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/p/1"
                  className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors inline-flex items-center gap-1.5 hover:translate-x-0.5 duration-150"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[var(--accent-green)]" />
                  <span>First Lesson (Drill 01)</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Quick Practice Tracks */}
          <div className="space-y-3">
            <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-[var(--accent-primary-soft)] flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" />
              <span>Practice Tracks</span>
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link
                  to="/p/1"
                  className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors inline-block hover:translate-x-0.5 duration-150"
                >
                  <span className="font-mono text-[var(--text-tertiary)] mr-1.5 text-xs">01.</span>
                  Basic Commands
                </Link>
              </li>
              <li>
                <Link
                  to="/p/4"
                  className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors inline-block hover:translate-x-0.5 duration-150"
                >
                  <span className="font-mono text-[var(--text-tertiary)] mr-1.5 text-xs">02.</span>
                  User Management
                </Link>
              </li>
              <li>
                <Link
                  to="/p/6"
                  className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors inline-block hover:translate-x-0.5 duration-150"
                >
                  <span className="font-mono text-[var(--text-tertiary)] mr-1.5 text-xs">03.</span>
                  Permissions & ACLs
                </Link>
              </li>
              <li>
                <Link
                  to="/p/9"
                  className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors inline-block hover:translate-x-0.5 duration-150"
                >
                  <span className="font-mono text-[var(--text-tertiary)] mr-1.5 text-xs">04.</span>
                  Process & Signals
                </Link>
              </li>
              <li>
                <Link
                  to="/p/13"
                  className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors inline-block hover:translate-x-0.5 duration-150"
                >
                  <span className="font-mono text-[var(--text-tertiary)] mr-1.5 text-xs">05.</span>
                  Networking & SSH
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Horizontal Bar: Copyright, Ram Guinto signature, and Back to Top */}
        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-tertiary)]">
          <div className="flex items-center gap-2 flex-wrap text-center sm:text-left">
            <span>© {new Date().getFullYear()} Bashist.</span>
            <span>•</span>
            <span>
              Made by{" "}
              <a
                href="https://ramguinto.tech"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[var(--text-muted)] hover:text-[var(--accent-primary-soft)] transition-colors underline underline-offset-4 decoration-white/20 hover:decoration-[var(--accent-primary)]"
              >
                Ram Guinto
              </a>
            </span>
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--surface-subtle)] hover:bg-[var(--surface-active)] text-[var(--text-muted)] hover:text-[var(--text-main)] text-xs transition-colors cursor-pointer mimo-press"
            title="Scroll back to top"
            aria-label="Scroll back to top"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
