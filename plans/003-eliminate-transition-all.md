# 003 — Eliminate `transition-all` on Core Containers and Cards

- **Status**: DONE
- **Commit**: aafaadc
- **Severity**: HIGH
- **Category**: Performance
- **Estimated scope**: 5 files, ~25 lines

## Problem

Multiple high-traffic containers and interactive components use generic `transition: all` or Tailwind's `transition-all`. As established in AUDIT.md ("Performance: transition: all animates unintended properties off-GPU — always a finding"):

```tsx
/* src/components/Terminal.tsx:559 — current */
className={`relative flex flex-col font-mono transition-all select-none ${embedded ...

/* src/pages/ProblemPage.tsx:474 & 748 — current */
isDragging
  ? "transition-none select-none pointer-events-none"
  : "transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]"

/* src/components/CuratedRoadmap.tsx:194 & 248 — current */
className="rounded-2xl transition-all duration-200 overflow-hidden bg-[var(--surface-base)]"
className={`h-full transition-all duration-300 ${isCompleted ? ...

/* src/components/ProblemCard.tsx:43 — current */
className={`group relative rounded-2xl p-4 sm:p-5 flex flex-col justify-between cursor-pointer mimo-press transition-all duration-200 bg-[var(--surface-card)] hover:bg-[var(--surface-card-hover)] hover:-translate-y-0.5`}

/* src/index.css:756 — current */
.chip-mimo { ... transition: all 100ms ease; }
```

In `Terminal.tsx`, applying `transition-all` to the outer terminal shell causes any state update (e.g. font size change, guide toggle, focus state) to trigger off-GPU transitions on padding, border, and layout sizing. In `ProblemPage.tsx`, applying `transition-all` to resizable column panels forces layout recalculations on every intermediate flex property. In `CuratedRoadmap.tsx`, the progress bar only modifies `width`, but transitions all properties. In `ProblemCard.tsx`, only background and transform hover should animate.

## Target

Explicitly target the exact CSS properties that animate, keeping them hardware accelerated where possible:

1. `Terminal.tsx`: Replace `transition-all` with `transition-colors`.
2. `ProblemPage.tsx`: Replace `transition-all duration-300` on column panels with `transition-[flex-basis,width] duration-300`.
3. `CuratedRoadmap.tsx`:
   - Track container (line 194): Replace `transition-all duration-200` with `transition-colors duration-150`.
   - Progress bar (line 248): Replace `transition-all duration-300` with `transition-[width] duration-300 ease-out`.
4. `ProblemCard.tsx`: Replace `transition-all duration-200` with `transition-[transform,background-color,box-shadow] duration-180 ease-out`.
5. `src/index.css`: Replace `transition: all 100ms ease;` in `.chip-mimo` with `transition: background-color 100ms ease, color 100ms ease;`.

## Repo conventions to follow

- Duration budgets: 150–200ms for hovers and small layout shifts.
- Easing: standard `ease-out` for exits and simple feedback.
- Exemplar: `src/components/GlideSelect.css:49-51`:
  ```css
  transition:
    background-color 100ms ease,
    transform 160ms var(--gs-ease-out);
  ```

## Steps

1. In `src/components/Terminal.tsx:559`:
   - Replace `transition-all` with `transition-colors`.

2. In `src/pages/ProblemPage.tsx`:
   - Lines 474 and 748: Replace `"transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]"` with `"transition-[flex-basis,width] duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]"`.
   - Line 709: Replace `"transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] hover:bg-[var(--accent-primary)]/20"` with `"transition-colors duration-200 hover:bg-[var(--accent-primary)]/20"`.

3. In `src/components/CuratedRoadmap.tsx`:
   - Line 194: Replace `transition-all duration-200` with `transition-colors duration-150`.
   - Line 248: Replace `transition-all duration-300` with `transition-[width] duration-300 ease-out`.

4. In `src/components/ProblemCard.tsx:43`:
   - Replace `transition-all duration-200` with `transition-[transform,background-color,box-shadow] duration-180 ease-out`.

5. In `src/index.css:756`:
   - In `.chip-mimo`, change `transition: all 100ms ease;` to `transition: background-color 100ms ease, color 100ms ease;`.

## Boundaries

- Do NOT remove transitions that users depend on for visual continuity.
- Do NOT alter flex layout structure or column resize math.

## Verification

- **Mechanical**: Run `npm run build` and `npm run lint`.
- **Feel check**:
  - Drag the column divider on `ProblemPage`. Confirm no jank or stuttering on column resize.
  - Hover over problem cards on the home page and category chips in `FilterActionBar`. Confirm responsive, clean color/transform feedback without dropped frames.
- **Done when**: No instances of untargeted `transition-all` remain on high-traffic containers and components.
