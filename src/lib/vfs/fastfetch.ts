/**
 * Fake fastfetch / neofetch easter egg.
 *
 * Produces a colored system-info splash that mirrors the real fastfetch
 * output, pulling live values from the virtual shell session.
 */

import type { UserSession } from "./types";

// CentOS ASCII logo — classic four-segment diamond, compact
// Each line is tagged with ANSI color codes:
//  \x1b[33m = yellow   \x1b[32m = green
//  \x1b[35m = magenta  \x1b[34m = blue
//  \x1b[0m  = reset
const CENTOS_LOGO = [
  "\x1b[33m         ..          \x1b[32m..\x1b[0m",
  "\x1b[33m       .NMMN.      \x1b[32m.NMN.\x1b[0m",
  "\x1b[33m      .MMMMMM.    \x1b[32m.MMMM.\x1b[0m",
  "\x1b[33m      MMMMMMMM   \x1b[32mNMMMMMM\x1b[0m",
  "\x1b[33m     .MMMMMMMM. \x1b[32m.MMMMMM.\x1b[0m",
  "\x1b[33m     MMMMMMMMMMMNMMMMMMMMM\x1b[0m",
  "\x1b[33m     MMMMMMMMMMMMMMMMMMMMM\x1b[0m",
  "\x1b[35m     MMMMMMMMMMMMMMMMMMMMM\x1b[0m",
  "\x1b[35m     MMMMMMMMMMMNMMMMMMMMM\x1b[0m",
  "\x1b[35m     .MMMMMMMM. \x1b[34m.MMMMMM.\x1b[0m",
  "\x1b[35m      MMMMMMMM   \x1b[34mNMMMMMM\x1b[0m",
  "\x1b[35m      .MMMMMM.    \x1b[34m.MMMM.\x1b[0m",
  "\x1b[35m       .NMMN.      \x1b[34m.NMN.\x1b[0m",
  "\x1b[35m         ..          \x1b[34m..\x1b[0m",
];

/**
 * Build the right-hand info lines using session state.
 */
function buildInfoLines(session: UserSession): string[] {
  const user = session.username;
  const host = session.hostname;
  const sep = "\x1b[0m-".repeat((`${user}@${host}`).length);

  return [
    `\x1b[1;33m${user}\x1b[0m@\x1b[1;33m${host}\x1b[0m`,
    sep,
    `\x1b[1;33mOS\x1b[0m: CentOS Stream 9 x86_64`,
    `\x1b[1;33mHost\x1b[0m: KVM/QEMU Virtual Machine`,
    `\x1b[1;33mKernel\x1b[0m: 5.14.0-362.el9.x86_64`,
    `\x1b[1;33mUptime\x1b[0m: 3 days, 4 hours, 12 mins`,
    `\x1b[1;33mPackages\x1b[0m: 487 (rpm)`,
    `\x1b[1;33mShell\x1b[0m: bash 5.1.8`,
    `\x1b[1;33mTerminal\x1b[0m: Bashist WebTerm`,
    `\x1b[1;33mCPU\x1b[0m: QEMU Virtual CPU (2) @ 2.40 GHz`,
    `\x1b[1;33mMemory\x1b[0m: 1225 MiB / 7934 MiB`,
    "",
    // Color palette blocks
    "\x1b[30m███\x1b[31m███\x1b[32m███\x1b[33m███\x1b[34m███\x1b[35m███\x1b[36m███\x1b[37m███\x1b[0m",
    "\x1b[90m███\x1b[91m███\x1b[92m███\x1b[93m███\x1b[94m███\x1b[95m███\x1b[96m███\x1b[97m███\x1b[0m",
  ];
}

/**
 * Generate full fastfetch output string with ANSI color codes.
 */
export function generateFastfetch(session: UserSession): string {
  const info = buildInfoLines(session);
  const maxLogoWidth = 26; // visual width of logo lines (padded)
  const gap = "   ";
  const lines: string[] = [];
  const total = Math.max(CENTOS_LOGO.length, info.length);

  for (let i = 0; i < total; i++) {
    const logo = i < CENTOS_LOGO.length ? CENTOS_LOGO[i] : " ".repeat(maxLogoWidth);
    const infoLine = i < info.length ? info[i] : "";
    lines.push(`${logo}${gap}${infoLine}`);
  }

  return lines.join("\n") + "\n";
}
