import { AnimatePresence, motion } from "motion/react";
import { Lightbulb } from "lucide-react";
import Markdown from "./Markdown";

interface HintAccordionProps {
  hints: string[];
}

export default function HintAccordion({ hints }: HintAccordionProps) {
  if (!hints || hints.length === 0) return null;

  return (
    <div className="space-y-px">
      <p className="text-[11px] font-mono text-slate-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
        <Lightbulb className="w-3 h-3 text-amber-600" />
        HINTS
      </p>
      {hints.map((hint, idx) => (
        <HintItem key={idx} idx={idx} hint={hint} />
      ))}
    </div>
  );
}

function HintItem({ idx, hint }: { idx: number; hint: string }) {
  // Use a details/summary element — native, accessible, no state needed
  return (
    <details className="group border border-slate-800/60 rounded-sm bg-[#090d16] overflow-hidden">
      <summary className="flex items-center justify-between px-3 py-2 text-[11px] font-mono text-slate-500 cursor-pointer select-none hover:text-slate-300 transition-colors list-none [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2">
          <span className="text-slate-700 group-open:text-cyan-500 transition-colors">▸</span>
          <span>Hint {String(idx + 1).padStart(2, "0")}</span>
        </span>
        <span className="text-slate-700 text-[10px]">click to reveal</span>
      </summary>

      <AnimatePresence initial={false}>
        <motion.div
          key="content"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="overflow-hidden border-t border-slate-800/60"
        >
          <div className="px-3 py-2.5 text-xs text-slate-300 font-sans leading-relaxed">
            <Markdown>{hint}</Markdown>
          </div>
        </motion.div>
      </AnimatePresence>
    </details>
  );
}
