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
  return (
    <details className="group border border-[var(--border-subtle)] rounded-xl bg-[var(--surface-base)] shadow-[var(--card-shadow)] overflow-hidden transition-colors">
      <summary className="flex items-center justify-between px-3.5 py-2.5 text-xs font-mono text-[var(--text-muted)] cursor-pointer select-none hover:text-[var(--text-main)] transition-colors list-none [&::-webkit-details-marker]:hidden apple-press">
        <span className="flex items-center gap-2">
          <ChevronRight className="w-3.5 h-3.5 text-[var(--text-tertiary)] group-open:rotate-90 group-open:text-[var(--accent-amber)] transition-transform duration-200" />
          <span className="font-medium text-[var(--text-main)]">Hint {String(idx + 1).padStart(2, "0")}</span>
        </span>
        <span className="text-[var(--text-tertiary)] text-[10px] group-open:hidden">click to reveal</span>
      </summary>

      <AnimatePresence initial={false}>
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: "spring", damping: 26, stiffness: 320 }}
          className="overflow-hidden border-t border-[var(--border-subtle)] bg-[var(--surface-subtle)]"
        >
          <div className="px-3.5 py-3 text-xs text-[var(--text-main)] font-sans leading-relaxed select-text">
            <Markdown>{hint}</Markdown>
          </div>
        </motion.div>
      </AnimatePresence>
    </details>
  );
}
