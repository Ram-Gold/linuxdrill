# 005 — Establish Unified Motion Tokens, Purge `ease-in`, and Refine Reduced Motion

- **Status**: DONE
- **Commit**: aafaadc
- **Severity**: MEDIUM
- **Category**: Cohesion & Tokens / Easing & Duration / Accessibility
- **Estimated scope**: 3 files, ~45 lines

## Problem

1. **Disparate Easings and Lack of Tokens**:
   The repository has no shared motion token system. Different files hardcode slightly different curves and strings:
   - `GlideSelect.css` defines `--gs-ease-out: cubic-bezier(0.23, 1, 0.32, 1);`
   - `Navbar.tsx`, `HomeHero.tsx`, `TerminalGuideDrawer.tsx` inline `[0.16, 1, 0.3, 1]`
   - `ProblemPage.tsx` and `CuratedRoadmap.tsx` inline `cubic-bezier(0.25, 1, 0.5, 1)`
   - Modals use built-in string `'easeOut'`
   - `index.css` line 461 uses `ease-in`

2. **`ease-in` on Active UI**:
   - In `src/index.css:461`: `body { ... transition: background-color 150ms ease-in, color 150ms ease-in; }`
   - In `src/components/CuratedRoadmap.tsx:296-297`:
     ```tsx
     opacity: {
       duration: 0.18,
       ease: "easeIn",
     }
     ```
   As established in AUDIT.md ("ease-in on UI is always a finding — it starts slow, delaying the exact moment the user is watching"), entering or exiting UI must use `ease-out`.

3. **Brute-Force Reduced Motion Destroys Feedback**:
   In `src/index.css:609-621`:
   ```css
   @media (prefers-reduced-motion: reduce) {
     *, ::before, ::after {
       animation-duration: 0.01ms !important;
       animation-iteration-count: 1 !important;
       transition-duration: 0.01ms !important;
       scroll-behavior: auto !important;
     }
   ```
   Brute-forcing `transition-duration: 0.01ms !important` on every element obliterates essential state feedback like button color changes, focus highlights, and background transitions. Per AUDIT.md: "Reduced motion means fewer and gentler animations, not zero — keep transitions that aid comprehension, remove position changes."

## Target

1. Define global motion tokens in `src/index.css`:
   ```css
   @theme {
     --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
     --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
     --ease-spring: cubic-bezier(0.23, 1, 0.32, 1);
   }

   :root {
     --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
     --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
     --ease-spring: cubic-bezier(0.23, 1, 0.32, 1);
     --duration-fast: 150ms;
     --duration-base: 220ms;
   }
   ```

2. Purge `ease-in`:
   - `src/index.css`: `transition: background-color 150ms var(--ease-out), color 150ms var(--ease-out);`
   - `src/components/CuratedRoadmap.tsx:296`: Change `ease: "easeIn"` to `ease: "easeOut"`.

3. Create `src/lib/motion.ts` with reusable Motion curves:
   ```ts
   export const TRANSITION_FLUID = {
     duration: 0.22,
     ease: [0.16, 1, 0.3, 1],
   } as const;

   export const TRANSITION_BACKDROP = {
     duration: 0.18,
     ease: [0.16, 1, 0.3, 1],
   } as const;

   export const TRANSITION_SPRING = {
     type: 'spring',
     stiffness: 420,
     damping: 32,
   } as const;
   ```

4. Refine `@media (prefers-reduced-motion: reduce)` in `src/index.css`:
   Strip movement/translation but preserve subtle opacity and color transitions:
   ```css
   @media (prefers-reduced-motion: reduce) {
     *, ::before, ::after {
       animation-duration: 0.01ms !important;
       animation-iteration-count: 1 !important;
       scroll-behavior: auto !important;
       transform: none !important;
     }

     .mimo-press:active {
       transform: none !important;
     }
   }
   ```

## Repo conventions to follow

- Tokens live in `src/index.css`.
- Shared Motion parameters exported from `src/lib/motion.ts`.
- Exemplar: `src/components/GlideSelect.css:17` (`--gs-ease-out: cubic-bezier(0.23, 1, 0.32, 1);`).

## Steps

1. In `src/index.css`:
   - Add `--ease-out`, `--ease-in-out`, `--ease-spring`, `--duration-fast`, `--duration-base` inside `@theme` and `:root`.
   - Update line 461 to replace `ease-in` with `var(--ease-out)`.
   - Update reduced-motion block (lines 609–621) according to the target above.

2. Create `src/lib/motion.ts`:
   - Export `TRANSITION_FLUID`, `TRANSITION_BACKDROP`, and `TRANSITION_SPRING`.

3. In `src/components/CuratedRoadmap.tsx`:
   - Line 296: Replace `ease: "easeIn"` with `ease: "easeOut"`.

## Boundaries

- Do NOT break existing Tailwind v4 utilities.
- Do NOT alter circular reveal `@keyframes theme-circle-reveal`.

## Verification

- **Mechanical**: Run `npm run build` and `npm run lint`.
- **Feel check**:
  - Switch themes with Palette or Sun/Moon button. Verify background color transitions smoothly with fast ease-out instead of sluggish ease-in.
  - In DevTools Rendering panel, emulate `prefers-reduced-motion: reduce`. Verify that transforms and movements are disabled, but button hover background transitions and focus rings remain responsive.
- **Done when**: No `ease-in` exists on UI transitions, shared motion tokens are in place, and reduced-motion behaves gently rather than destructively.
