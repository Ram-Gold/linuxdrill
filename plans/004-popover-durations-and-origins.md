# 004 — Tune Popover Durations, Filter Blurs, and Transform Origins

- **Status**: DONE
- **Commit**: aafaadc
- **Severity**: MEDIUM
- **Category**: Easing & Duration / Physicality & Origin
- **Estimated scope**: 4 files, ~35 lines

## Problem

1. **Sluggish Popover Durations (500ms vs 200ms budget)**:
   - In `src/components/Navbar.tsx:333-335`, the Theme appearance dropdown popover animates over `0.5s` (500ms):
     ```tsx
     /* src/components/Navbar.tsx:332-335 — current */
     transition={{
       duration: 0.5,
       ease: [0.16, 1, 0.3, 1], // Apple fluid motion curve
     }}
     ```
   - In `src/components/HomeHero.tsx:141-144`, the Daily Review deck dropdown popover also animates over `0.5s` with an aggressive `filter: "blur(14px)"`:
     ```tsx
     /* src/components/HomeHero.tsx:138-145 — current */
     initial={{ opacity: 0, y: 8, scale: 0.94, filter: "blur(14px)" }}
     animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
     exit={{ opacity: 0, y: 6, scale: 0.96, filter: "blur(10px)" }}
     transition={{
       duration: 0.5,
       ease: [0.16, 1, 0.3, 1],
     }}
     ```
   As established in AUDIT.md ("Duration budgets — UI animations stay under 300ms... Dropdowns, selects: 150–250ms"), 500ms makes frequently opened menus feel heavy, delayed, and unresponsive. Furthermore, animating heavy 14px blur over half a second drops frames in WebKit/Safari.

2. **Detached Transform Origins on Dropdowns**:
   - In `src/components/FilterActionBar.tsx:167` and `245`, the Topic dropdown menu (`w-64`) and Difficulty dropdown menu (`w-48`) scale in from their geometrical center (`transform-origin: center`) because no origin class is specified. As established in AUDIT.md ("Popovers/dropdowns/tooltips scale from their trigger, not center"), dropdowns must anchor to the trigger button that summoned them.

3. **Sub-0.90 Scale on Reset Button**:
   - In `src/components/SoundSettingsModal.tsx:338`, the Floating Reset button uses `initial={{ opacity: 0, scale: 0.85, y: -4 }}`. Scale below 0.90 violates the physicality guideline ("Never scale(0)... Target: scale(0.9–0.97) + opacity: 0").

## Target

1. `src/components/Navbar.tsx`:
   Reduce Theme popover duration to `0.22s` (220ms) and exit duration to `0.16s`. Reduce entry blur to `blur(6px)` and exit blur to `blur(4px)`:
   ```tsx
   /* target */
   initial={{ opacity: 0, y: 6, scale: 0.96, filter: "blur(6px)" }}
   animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
   exit={{ opacity: 0, y: 4, scale: 0.97, filter: "blur(4px)" }}
   transition={{
     duration: 0.22,
     ease: [0.16, 1, 0.3, 1],
   }}
   ```

2. `src/components/HomeHero.tsx`:
   Reduce Daily Review deck popover duration to `0.24s` (240ms) and exit duration to `0.18s`. Reduce blur to `blur(6px)`:
   ```tsx
   /* target */
   initial={{ opacity: 0, y: 6, scale: 0.96, filter: "blur(6px)" }}
   animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
   exit={{ opacity: 0, y: 4, scale: 0.97, filter: "blur(4px)" }}
   transition={{
     duration: 0.24,
     ease: [0.16, 1, 0.3, 1],
   }}
   ```

3. `src/components/FilterActionBar.tsx`:
   Add trigger-relative origin classes:
   - Topic dropdown menu (line 167): Add `origin-top-left sm:origin-top-right`.
   - Difficulty dropdown menu (line 245): Add `origin-top-right`.
   Update transitions from bare `duration: 0.15` to `{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }`.

4. `src/components/SoundSettingsModal.tsx`:
   Update Floating Reset button (line 338):
   ```tsx
   /* target */
   initial={{ opacity: 0, scale: 0.95, y: -4 }}
   animate={{ opacity: 1, scale: 1, y: 0 }}
   exit={{ opacity: 0, scale: 0.95, y: -4 }}
   transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
   ```

## Repo conventions to follow

- Easing: Apple fluid motion curve `[0.16, 1, 0.3, 1]`.
- Durations: 180–240ms for popovers.
- Exemplar: `src/components/GlideSelect.css:16` (`--gs-origin: top left`, `--gs-pop: 180ms`).

## Steps

1. In `src/components/Navbar.tsx`:
   - Replace lines 329–335 with the target initial/animate/exit/transition values above.

2. In `src/components/HomeHero.tsx`:
   - Replace lines 138–144 with the target initial/animate/exit/transition values above.

3. In `src/components/FilterActionBar.tsx`:
   - Line 167: Add `origin-top-left sm:origin-top-right` to the `className` of the topic dropdown `<motion.div>`.
   - Line 166: Update transition to `transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}`.
   - Line 245: Add `origin-top-right` to the `className` of the difficulty dropdown `<motion.div>`.
   - Line 244: Update transition to `transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}`.

4. In `src/components/SoundSettingsModal.tsx`:
   - Line 338: Update `initial` and `exit` scale from `0.85` to `0.95`, and add `ease: [0.16, 1, 0.3, 1]` to transition.

## Boundaries

- Do NOT change menu layout, z-indices, or click outside handling.
- Do NOT remove backdrop blur where present; only reduce filter intensity.

## Verification

- **Mechanical**: Run `npm run build` and `npm run lint`.
- **Feel check**:
  - Click the Palette icon in the top navbar. Confirm the menu expands briskly (220ms) with zero sluggishness or delay.
  - Click the Daily Review button in the Home Hero. Confirm the popover opens crisply without perceptible blur lag.
  - Click the Topic and Difficulty dropdowns in FilterActionBar. Confirm the menus expand directly downwards from the trigger buttons rather than inflating from the middle.
- **Done when**: All popovers open within the 180–240ms budget with correct trigger-anchored transform origins.
