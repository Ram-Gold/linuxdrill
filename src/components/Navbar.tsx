import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Menu, X, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import BashistLogo from "./BashistLogo";
import { useNavbarPrototype } from "../lib/useNavbarPrototype";
import { PrototypeDock } from "./navbar/PrototypeDock";
import { PrototypeWorkspace } from "./navbar/PrototypeWorkspace";
import { PrototypeGlass } from "./navbar/PrototypeGlass";

export interface NavbarProps {
  solvedCount: number;
  totalCount: number;
  totalPoints: number;
}

export default function Navbar({
  solvedCount,
  totalCount,
  totalPoints,
}: NavbarProps) {
  const { prototype } = useNavbarPrototype();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Test mode check: completely hidden during challenge tests (/p/:id)
  const isProblem = location.pathname.startsWith("/p/");
  if (isProblem) {
    return null;
  }

  // Render the selected desktop vertical navbar prototype (default Pro Workspace)
  const renderPrototype = () => {
    switch (prototype) {
      case "dock":
        return (
          <PrototypeDock
            solvedCount={solvedCount}
            totalCount={totalCount}
            totalPoints={totalPoints}
          />
        );
      case "glass":
        return (
          <PrototypeGlass
            solvedCount={solvedCount}
            totalCount={totalCount}
            totalPoints={totalPoints}
          />
        );
      case "workspace":
      default:
        return (
          <PrototypeWorkspace
            solvedCount={solvedCount}
            totalCount={totalCount}
            totalPoints={totalPoints}
          />
        );
    }
  };

  return (
    <>
      {/* ── Desktop: Left-Side Vertical Navbar ── */}
      <div className="hidden md:flex shrink-0">
        {renderPrototype()}
      </div>

      {/* ── Mobile: Compact Top Header with Slide-out Vertical Drawer ── */}
      <header className="md:hidden sticky top-0 z-40 w-full h-14 px-4 bg-[var(--surface-base)]/95 backdrop-blur-xl border-b border-[var(--border-subtle)] flex items-center justify-between shadow-xs">
        {/* Left: Logo */}
        <div className="flex items-center gap-2">
          <BashistLogo className="w-7 h-7" />
          <span className="text-sm font-semibold tracking-tight text-[var(--text-main)] font-heading">
            Bash<span className="text-[var(--accent-primary)]">ist</span>
          </span>
        </div>

        {/* Center: Points chip at top */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--surface-subtle)] border border-[var(--border-subtle)]/70 text-xs font-mono font-bold text-[var(--accent-amber)]">
          <Sparkles className="w-3 h-3 fill-[var(--accent-amber)]" />
          <span>{totalPoints} pts</span>
          <span className="text-[var(--text-tertiary)] font-normal text-[10px]">
            ({solvedCount}/{totalCount})
          </span>
        </div>

        {/* Right: Hamburger button */}
        <button
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          className="w-9 h-9 rounded-xl bg-[var(--surface-subtle)] flex items-center justify-center text-[var(--text-main)] transition-colors cursor-pointer"
          aria-label={isMobileMenuOpen ? "Close menu" : "Open navigation menu"}
        >
          {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </header>

      {/* Mobile Drawer (animates in from left) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 32 }}
              className="md:hidden fixed top-0 bottom-0 left-0 z-50 overflow-y-auto"
            >
              <div onClick={() => setIsMobileMenuOpen(false)}>
                {renderPrototype()}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
