# 006 — Polish Typing Drill Feedback and Completion Modal Motion

- **Status**: DONE
- **Commit**: aafaadc
- **Severity**: HIGH
- **Category**: Missed Opportunities / Physicality & Origin
- **Estimated scope**: 3 files, ~40 lines

## Problem

1. **DrillCompletionModal has No Motion**:
   In `src/components/drills/DrillCompletionModal.tsx:81-83`:
   ```tsx
   /* src/components/drills/DrillCompletionModal.tsx:81-83 — current */
   return (
     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
       <div className="w-full max-w-xl rounded-3xl bg-[var(--surface-base)] border border-white/10 shadow-2xl p-6 sm:p-8 flex flex-col gap-6 text-[var(--text-main)] max-h-[90vh] overflow-y-auto">
   ```
   The class `animate-fadeIn` does not exist in Tailwind v4 or `index.css`. The completion celebration modal pops onto the screen with 0ms transition, with zero scale, and without an exit transition when the user presses `Enter` or `Escape`. This directly conflicts with the celebratory delight allowed for milestone achievements (AUDIT.md Category 1: "Rare / first-time (onboarding, feedback, celebrations) — Can add delight").

2. **Syntax Lock Banner Snaps Instantly**:
   In `src/components/drills/DrillPrompt.tsx:149-160`:
   ```tsx
   {isLocked && (
     <div className="mt-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--accent-red-bg)] text-[var(--accent-red)] text-xs font-medium animate-fadeIn select-none border border-[var(--accent-red)]/20">
       <AlertCircle className="w-4 h-4 shrink-0" />
       ...
     </div>
   )}
   ```
   The error lock notification uses the same non-existent `animate-fadeIn` class. It abruptly teleports onto the screen when an error occurs and vanishes instantaneously on Backspace, feeling abrasive.

3. **Jarring 44px Translation on MinimalStatsCard**:
   In `src/components/drills/MinimalStatsCard.tsx:65`:
   ```tsx
   initial={{ opacity: 0, y: 44, scale: 0.96 }}
   animate={{ opacity: 1, y: 0, scale: 1 }}
   exit={{ opacity: 0, y: 24, scale: 0.96 }}
   ```
   A 44px vertical offset on a centered dialog card creates an excessive, distracting travel distance.

## Target

1. `src/components/drills/DrillCompletionModal.tsx`:
   Wrap in `<AnimatePresence>` and convert to `motion/react`:
   ```tsx
   /* target */
   return (
     <motion.div
       key="drill-completion-backdrop"
       initial={{ opacity: 0 }}
       animate={{ opacity: 1 }}
       exit={{ opacity: 0 }}
       transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
       className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
     >
       <motion.div
         initial={{ opacity: 0, scale: 0.96, y: 12 }}
         animate={{ opacity: 1, scale: 1, y: 0 }}
         exit={{ opacity: 0, scale: 0.96, y: 8 }}
         transition={{ type: "spring", stiffness: 400, damping: 28 }}
         className="w-full max-w-xl rounded-3xl bg-[var(--surface-base)] border border-white/10 shadow-2xl p-6 sm:p-8 flex flex-col gap-6 text-[var(--text-main)] max-h-[90vh] overflow-y-auto"
       >
         {/* Dialog content */}
       </motion.div>
     </motion.div>
   );
   ```

2. `src/components/drills/DrillPrompt.tsx`:
   Wrap the error notification in `<AnimatePresence>` with a crisp 120ms spring or ease-out:
   ```tsx
   /* target */
   <AnimatePresence>
     {isLocked && (
       <motion.div
         key="syntax-lock-banner"
         initial={{ opacity: 0, y: -6, scale: 0.98 }}
         animate={{ opacity: 1, y: 0, scale: 1 }}
         exit={{ opacity: 0, y: -4, scale: 0.98 }}
         transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
         className="mt-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--accent-red-bg)] text-[var(--accent-red)] text-xs font-medium select-none border border-[var(--accent-red)]/20"
       >
         <AlertCircle className="w-4 h-4 shrink-0" />
         <span>
           <strong>Syntax Lock:</strong> Incorrect key struck! Press{' '}
           <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-base)] text-white font-mono text-[11px] border border-white/10 shadow-xs">
             Backspace
           </kbd>{' '}
           to clear the mistake and resume.
         </span>
       </motion.div>
     )}
   </AnimatePresence>
   ```

3. `src/components/drills/MinimalStatsCard.tsx:65`:
   Tame the entrance offset from 44px to 12px:
   ```tsx
   /* target */
   initial={{ opacity: 0, y: 12, scale: 0.96 }}
   animate={{ opacity: 1, y: 0, scale: 1 }}
   exit={{ opacity: 0, y: 8, scale: 0.96 }}
   transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
   ```

## Repo conventions to follow

- Uses `motion` and `AnimatePresence` from `motion/react`.
- Celebratory modal uses subtle spring (`stiffness: 400, damping: 28`).
- Error banner uses fast 140ms ease-out.

## Steps

1. In `src/components/drills/DrillCompletionModal.tsx`:
   - Import `motion` from `'motion/react'`.
   - Update return JSX: wrap the modal in `<motion.div>` backdrop and `<motion.div>` card with the target properties above.

2. In `src/components/drills/DrillPrompt.tsx`:
   - Import `motion, AnimatePresence` from `'motion/react'`.
   - Wrap line 150 in `<AnimatePresence>` and convert to `<motion.div>` as shown in target.

3. In `src/components/drills/MinimalStatsCard.tsx`:
   - Update line 65 to change `y: 44` to `y: 12`, `y: 24` to `y: 8`, and `duration: 0.22`.

## Boundaries

- Do NOT alter drill scoring, WPM calculation, or keyboard shortcut handling.
- Do NOT alter confetti trigger in `DrillCompletionModal`.

## Verification

- **Mechanical**: Run `npm run build` and `npm run lint`.
- **Feel check**:
  - Start a typing drill in `/drills`. Type an incorrect character: confirm the red Syntax Lock alert slides in smoothly from above. Hit Backspace: confirm it vanishes cleanly without snapping.
  - Complete the drill: confirm the completion modal springs gently into view with the confetti rather than teleporting in. Press Enter to proceed: confirm it fades and scales out gracefully.
- **Done when**: No teleporting dialogs or alerts exist in the drill experience.
