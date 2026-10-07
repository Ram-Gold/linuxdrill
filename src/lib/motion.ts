/**
 * Standard Motion & Animation configuration tokens
 * Sourced from Emil Kowalski's design engineering motion standards.
 */

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

export const TRANSITION_POPOVER = {
  duration: 0.2,
  ease: [0.16, 1, 0.3, 1],
} as const;

export const TRANSITION_CELEBRATION = {
  type: 'spring',
  stiffness: 400,
  damping: 28,
} as const;
