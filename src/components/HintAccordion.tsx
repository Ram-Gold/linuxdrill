import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Lightbulb, ChevronRight } from "lucide-react";
import Markdown from "./Markdown";

interface HintAccordionProps {
  hints: string[];
}

export default function HintAccordion({ hints }: HintAccordionProps) {
  if (!hints || hints.length === 0) return null;

  return (
    <div className="space-y-2 select-none">
      <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider font-semibold flex items-center gap-1.5">
        <Lightbulb className="w-3.5 h-3.5 text-[var(--accent-amber)]" />
        <span>Hints ({hints.length})</span>
      </p>
      <div className="space-y-1.5">
        {hints.map((hint, idx) => (
          <HintItem key={idx} idx={idx} hint={hint} />
        ))}
      </div>
    </div>
  );
}

function HintItem({ idx, hint }: { idx: number; hint: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-[var(--border-subtle)] rounded-xl bg-[var(--surface-base)] overflow-hidden transition-colors">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-mono text-[var(--text-muted)] cursor-pointer select-none hover:text-[var(--text-main)] transition-colors mimo-press focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-primary)]"
      >
        <span className="flex items-center gap-2">
          <ChevronRight
            className={`w-3.5 h-3.5 transition-transform duration-200 ease-out ${
              isOpen
                ? "rotate-90 text-[var(--accent-amber)]"
                : "rotate-0 text-[var(--text-tertiary)]"
            }`}
          />
          <span className="font-medium text-[var(--text-main)]">
            Hint {String(idx + 1).padStart(2, "0")}
          </span>
        </span>
        <span className="text-[var(--text-tertiary)] text-[10px] transition-opacity duration-150">
          {isOpen ? "click to hide" : "click to reveal"}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
              opacity: { duration: 0.16, ease: "easeOut" },
            }}
            className="overflow-hidden border-t border-[var(--border-subtle)] bg-[var(--surface-subtle)]"
          >
            <div className="px-3.5 py-3 text-sm text-[var(--text-main)] font-sans leading-relaxed select-text">
              <Markdown>{hint}</Markdown>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
