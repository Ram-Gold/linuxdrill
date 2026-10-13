import { useState } from "react";
import { Sparkles, ChevronRight, Check, LayoutGrid, Layers, PanelsTopLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavbarPrototype, type NavbarPrototypeId, NAVBAR_PROTOTYPES } from "../lib/useNavbarPrototype";

export function NavbarPrototypeSwitcher() {
  const { prototype, setPrototype, activeMeta } = useNavbarPrototype();
  const [isOpen, setIsOpen] = useState(false);

  const getIcon = (id: NavbarPrototypeId) => {
    switch (id) {
      case "dock":
        return <Layers className="w-4 h-4" />;
      case "workspace":
        return <PanelsTopLeft className="w-4 h-4" />;
      case "glass":
        return <LayoutGrid className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="mb-2 w-80 p-3 rounded-2xl bg-[var(--surface-base)]/95 backdrop-blur-2xl border border-[var(--border-subtle)] shadow-2xl space-y-2 text-[var(--text-main)]"
          >
            <div className="flex items-center justify-between pb-1.5 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-1.5 text-xs font-semibold tracking-tight">
                <Sparkles className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                <span>Vertical Navbar Prototypes</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--surface-subtle)] text-[var(--text-tertiary)]">
                3 options
              </span>
            </div>

            <div className="space-y-1.5">
              {NAVBAR_PROTOTYPES.map((p) => {
                const isActive = p.id === prototype;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setPrototype(p.id);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer flex items-start gap-3 group ${
                      isActive
                        ? "bg-[var(--surface-active)] text-[var(--text-main)] ring-1 ring-[var(--accent-primary)]/40 shadow-xs"
                        : "hover:bg-[var(--surface-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg shrink-0 transition-colors ${
                        isActive
                          ? "bg-[var(--accent-primary)] text-white shadow-xs"
                          : "bg-[var(--surface-subtle)] text-[var(--text-muted)] group-hover:text-[var(--text-main)]"
                      }`}
                    >
                      {getIcon(p.id)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold tracking-tight text-[var(--text-main)]">
                          {p.name}
                        </span>
                        {isActive && (
                          <Check className="w-3.5 h-3.5 text-[var(--accent-primary)] shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-[var(--text-tertiary)] line-clamp-2 mt-0.5 leading-snug">
                        {p.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-1 text-[10px] font-mono text-[var(--text-tertiary)] text-center flex items-center justify-center gap-1">
              <span>Points on top</span> • <span>Actions bottom left</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating pill launcher */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-2 rounded-full bg-[var(--surface-base)]/90 hover:bg-[var(--surface-base)] text-[var(--text-main)] shadow-xl border border-[var(--border-subtle)] hover:border-[var(--accent-primary)]/50 backdrop-blur-xl transition-all cursor-pointer group mimo-press"
        title="Switch between the 3 Vertical Navbar Prototypes"
      >
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--accent-primary)]/15 text-[var(--accent-primary)]">
          <Sparkles className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
        </span>
        <span className="text-xs font-medium tracking-tight">
          {activeMeta.shortName}
        </span>
        <ChevronRight
          className={`w-3.5 h-3.5 text-[var(--text-tertiary)] transition-transform duration-200 ${
            isOpen ? "rotate-90 text-[var(--text-main)]" : "group-hover:translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
