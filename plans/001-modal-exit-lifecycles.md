# 001 — Fix Modal and Drawer Exit Animations Across Application

- **Status**: DONE
- **Commit**: aafaadc
- **Severity**: HIGH
- **Category**: Interruptibility & Physicality
- **Estimated scope**: 8 files, ~120 lines

## Problem

Across the entire application, every modal dialog fails to play its exit animation when closed. The dialog instantly pops out of the DOM without running `exit={{ opacity: 0, scale: 0.96, y: 8 }}` on the modal card or `exit={{ opacity: 0 }}` on the backdrop.

This happens because `<AnimatePresence>` only intercepts and delays the unmounting of direct child elements that are `motion` components. In all modals in this codebase, the direct child of `<AnimatePresence>` is a standard, un-animated HTML `<div>`:

```tsx
/* src/components/terminal/TerminalSettingsModal.tsx:61-68 — current */
<AnimatePresence>
  {isOpen && (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="terminal-settings-title"
    >
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} ... />
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 8 }} ... />
    </div>
  )}
</AnimatePresence>
```

When `isOpen` becomes `false`, React unmounts `<div className="fixed inset-0...">` immediately, causing the backdrop and modal card to vanish in 0ms without running their exit transitions.

Additionally:
1. `src/components/terminal/TerminalGuideDrawer.tsx:104` has `if (!isOpen) return null;` at the top of the component. When `Terminal.tsx` closes the drawer inside `<AnimatePresence>`, `TerminalGuideDrawer` immediately returns `null`, preventing the `<motion.aside exit={{ x: '100%', opacity: 0 }}>` slide-out transition from playing.
2. `src/pages/ProblemPage.tsx:768` renders `{showConfirmation && <SuccessConfirmation ... />}` without wrapping it in `<AnimatePresence>`, so `SuccessConfirmation.tsx`'s defined exit animation (`exit={{ opacity: 0, scale: 0.96, y: 8 }}`) never runs.

## Target

All modals and drawers smoothly animate in and out.
The outer overlay container becomes a `<motion.div>` that serves as the backdrop and coordinates the presence lifecycle with `<AnimatePresence>`:

```tsx
/* src/components/terminal/TerminalSettingsModal.tsx — target */
<AnimatePresence>
  {isOpen && (
    <motion.div
      key="terminal-settings-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="terminal-settings-title"
    >
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[540px] bg-[var(--surface-base)] rounded-3xl shadow-2xl shadow-black/40 z-10 text-[var(--text-main)] p-7 sm:p-8 select-none overflow-visible"
      >
        {/* Modal content */}
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
```

For `TerminalGuideDrawer.tsx`:
Remove `if (!isOpen) return null;` so `<AnimatePresence>` in `Terminal.tsx` controls mounting and allows `motion.aside` exit animation to execute.

For `ProblemPage.tsx`:
Wrap `<SuccessConfirmation />` in `<AnimatePresence>`.

## Repo conventions to follow

- Modals use `motion` and `AnimatePresence` from `motion/react`.
- Easing: Apple fluid motion curve `[0.16, 1, 0.3, 1]` or `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`.
- Duration: 200–240ms for panels, 180ms for backdrop overlay.
- Exemplar: `src/components/GlideSelect.tsx` for consistent timing and transform cleanup.

## Steps

1. In `src/components/terminal/TerminalSettingsModal.tsx`:
   - Replace the outer static `<div className="fixed inset-0...">` and inner backdrop `<motion.div>` with a single parent `<motion.div key="terminal-settings-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }} onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50">`.
   - Update the modal panel `<motion.div>` to add `onClick={(e) => e.stopPropagation()}` and `transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}`.

2. In `src/components/SoundSettingsModal.tsx`:
   - Apply the same pattern to lines 220–245: promote the outer `div` to a `<motion.div key="sound-settings-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }} onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50">`.
   - On the inner card, add `onClick={(e) => e.stopPropagation()}` and update duration to `0.22s`.

3. In `src/components/ExitConfirmationModal.tsx`:
   - Apply the same pattern to lines 35–59: promote the outer wrapper to a `<motion.div key="exit-confirmation-modal">` with backdrop styling `bg-black/50 backdrop-blur-xs`, `initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}`.
   - On the inner card, add `onClick={(e) => e.stopPropagation()}` and update transition curve to `[0.16, 1, 0.3, 1]`.

4. In `src/components/drills/DrillSettingsModal.tsx`:
   - Apply the same pattern to lines 100–123: promote outer wrapper to `<motion.div key="drill-settings-modal">` with `initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}`.
   - Update inner panel transition curve to `[0.16, 1, 0.3, 1]`.

5. In `src/components/drills/CompetencyDecksModal.tsx`:
   - Apply the same pattern to lines 62–85: promote outer wrapper to `<motion.div key="competency-decks-modal">` with `initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}`.
   - Update inner panel transition curve to `[0.16, 1, 0.3, 1]`.

6. In `src/pages/DrillsPage.tsx`:
   - Lines 257–271: Replace the static `<div className="fixed inset-0 ...">` around `MinimalStatsCard` with `<motion.div key="drill-stats-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }} onClick={() => setLastResult(null)} className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs">`.
   - In `MinimalStatsCard.tsx`, add `onClick={(e) => e.stopPropagation()}` to the root `<motion.div>`.

7. In `src/components/terminal/TerminalGuideDrawer.tsx`:
   - Remove line 104 (`if (!isOpen) return null;`).
   - The drawer is already conditionally rendered inside `<AnimatePresence>` by `src/components/Terminal.tsx:955-967`. Without the premature `return null`, Motion will now execute the slide-out `exit={{ x: '100%', opacity: 0 }}` transition.

8. In `src/pages/ProblemPage.tsx`:
   - Lines 767–777: Wrap `{showConfirmation && <SuccessConfirmation ... />}` inside `<AnimatePresence>`:
     ```tsx
     <AnimatePresence>
       {showConfirmation && (
         <SuccessConfirmation ... />
       )}
     </AnimatePresence>
     ```

## Boundaries

- Do NOT change modal inner layouts, state hooks, or button handlers.
- Do NOT alter keyboard shortcuts (Escape, Enter).
- Do NOT add new dependencies.

## Verification

- **Mechanical**: Run `npm run build` and `npm run lint` — confirm zero errors.
- **Feel check**:
  - Open and close `TerminalSettingsModal` (click Gear icon in terminal header, then press Escape or click outside). Verify in 10% DevTools animation speed that the backdrop fades out smoothly (180ms) and the modal card scales down to 0.96 and drops opacity seamlessly.
  - Open `TerminalGuideDrawer` (click Help in terminal header) and close it. Confirm the drawer slides cleanly off the right edge of the screen rather than vanishing instantaneously.
  - Complete a problem in `ProblemPage` to trigger `SuccessConfirmation`. Press Escape or click Close: confirm modal card scales down and fades out cleanly.
- **Done when**: Every modal and drawer plays both entrance AND exit animations without snapping.
