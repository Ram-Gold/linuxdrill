/**
 * ANSI escape code parser.
 * Converts ANSI color escape sequences in a string into an array of
 * { text, color?, bold? } segments that the terminal renderer can
 * turn into colored <span> elements.
 *
 * Supports basic 8-color foreground codes (30–37, 90–97) and bold (1).
 * Reset (0) returns to default styling.
 */

export interface AnsiSegment {
  text: string;
  color?: string;
  bold?: boolean;
}

const ANSI_COLORS: Record<number, string> = {
  30: "var(--surface-active)", // black / dark tone
  31: "var(--accent-red)",      // red
  32: "var(--accent-green)",    // green
  33: "var(--accent-amber)",    // yellow
  34: "var(--accent-blue)",     // blue
  35: "var(--accent-primary)",  // magenta / primary
  36: "var(--accent-cyan)",     // cyan
  37: "var(--text-main)",       // white / foreground
  // Bright variants
  90: "var(--text-tertiary)",   // bright black (gray)
  91: "var(--accent-red)",      // bright red
  92: "var(--accent-green)",    // bright green
  93: "var(--accent-amber)",    // bright yellow
  94: "var(--accent-blue)",     // bright blue
  95: "var(--accent-primary-soft)", // bright magenta
  96: "var(--accent-cyan-light, var(--accent-primary-soft))", // bright cyan
  97: "var(--text-main)",       // bright white
};

/**
 * Parse a string containing ANSI escape codes into styled segments.
 */
export function parseAnsi(input: string): AnsiSegment[] {
  const segments: AnsiSegment[] = [];
  // Match \x1b[...m sequences
  const regex = /\x1b\[([0-9;]*)m/g;
  let lastIndex = 0;
  let currentColor: string | undefined;
  let currentBold = false;

  let match: RegExpExecArray | null;
  while ((match = regex.exec(input)) !== null) {
    // Push text before this escape
    if (match.index > lastIndex) {
      const text = input.slice(lastIndex, match.index);
      if (text) {
        segments.push({ text, color: currentColor, bold: currentBold });
      }
    }
    lastIndex = regex.lastIndex;

    // Parse the codes
    const codes = match[1].split(";").map(Number);
    for (const code of codes) {
      if (code === 0) {
        currentColor = undefined;
        currentBold = false;
      } else if (code === 1) {
        currentBold = true;
      } else if (ANSI_COLORS[code]) {
        currentColor = ANSI_COLORS[code];
      }
    }
  }

  // Push remaining text
  if (lastIndex < input.length) {
    const text = input.slice(lastIndex);
    if (text) {
      segments.push({ text, color: currentColor, bold: currentBold });
    }
  }

  return segments;
}

/**
 * Check if a string contains any ANSI escape codes.
 */
export function hasAnsiCodes(input: string): boolean {
  return /\x1b\[/.test(input);
}
