# 002 — Eliminate Pointer Latency on MinimalSlider Dragging

- **Status**: DONE
- **Commit**: aafaadc
- **Severity**: HIGH
- **Category**: Purpose & Frequency / Physicality
- **Estimated scope**: 1 file, ~20 lines

## Problem

In `src/components/terminal/MinimalSlider.tsx`, both the active track fill and the circular thumb have CSS transitions active *while dragging*:

```tsx
/* src/components/terminal/MinimalSlider.tsx:151-155 — current */
transition: isDragging
  ? 'width 150ms cubic-bezier(0.16, 1, 0.3, 1)'
  : 'width 220ms cubic-bezier(0.16, 1, 0.3, 1)',

/* src/components/terminal/MinimalSlider.tsx:186-190 — current */
transition: isDragging
  ? 'left 150ms cubic-bezier(0.16, 1, 0.3, 1), scale 280ms cubic-bezier(0.16, 1, 0.3, 1), transform 280ms cubic-bezier(0.16, 1, 0.3, 1)'
  : 'left 220ms cubic-bezier(0.16, 1, 0.3, 1), scale 280ms cubic-bezier(0.16, 1, 0.3, 1), transform 280ms cubic-bezier(0.16, 1, 0.3, 1)',
```

When the user grabs the thumb and drags across the track, `isDragging` is `true`. The 150ms transition forces the thumb and active fill to interpolate behind the mouse pointer at a 150ms delay. The thumb visibly lags behind the cursor, creating a sluggish, disconnected sensation that breaks direct manipulation.

Transitioning `left` and `width` on high-frequency `pointermove` events also continuously recalcs layout.

## Target

Dragging must feel zero-latency and physical. While `isDragging` is active, position and width update instantly (0ms transition duration). Transitions are only active when clicking directly on the track (jump transition) or adjusting via keyboard arrow keys:

```tsx
/* src/components/terminal/MinimalSlider.tsx — target */
/* Track fill style */
style={{
  width: `${percent}%`,
  backgroundColor: accentColor,
  transition: isDragging
    ? 'none'
    : 'width 200ms cubic-bezier(0.16, 1, 0.3, 1)',
}}

/* Thumb style */
style={{
  left: `calc(13px + (${percent} * (100% - 26px) / 100))`,
  transition: isDragging
    ? 'transform 200ms cubic-bezier(0.16, 1, 0.3, 1)'
    : 'left 200ms cubic-bezier(0.16, 1, 0.3, 1), transform 200ms cubic-bezier(0.16, 1, 0.3, 1)',
}}
```

Notice that `transform` (for hover scale expansion) can still animate smoothly when entering/leaving drag, but `left` and `width` lock directly to pointer coordinates without delay.

## Repo conventions to follow

- Uses custom cubic-bezier `cubic-bezier(0.16, 1, 0.3, 1)`.
- Duration budget for direct slider snaps is 200ms.
- Exemplar: `src/components/GlideSelect.tsx:125` (`instant.current ? '0ms' : ''`) which zeroes transition duration during continuous gestures.

## Steps

1. In `src/components/terminal/MinimalSlider.tsx`:
   - Replace lines 151–154 with:
     ```tsx
     transition: isDragging
       ? 'none'
       : 'width 200ms cubic-bezier(0.16, 1, 0.3, 1)',
     ```
   - Replace lines 186–189 with:
     ```tsx
     transition: isDragging
       ? 'transform 200ms cubic-bezier(0.16, 1, 0.3, 1)'
       : 'left 200ms cubic-bezier(0.16, 1, 0.3, 1), transform 200ms cubic-bezier(0.16, 1, 0.3, 1)',
     ```

## Boundaries

- Do NOT change pointer event calculation logic (`calculateValueFromPointer`).
- Do NOT change track dimensions or step calculation.
- Keep keyboard arrow key support intact.

## Verification

- **Mechanical**: Run `npm run build` and `npm run lint`.
- **Feel check**:
  - Open terminal settings modal. Click and hold the font size slider thumb and drag back and forth rapidly. Confirm the thumb sticks 1:1 to the mouse cursor with zero trailing delay.
  - Release the drag, then click anywhere on the empty track. Confirm the thumb and fill animate smoothly to the target position with the 200ms curve.
- **Done when**: Dragging is instantaneous (0ms lag), while clicks smoothly glide.
