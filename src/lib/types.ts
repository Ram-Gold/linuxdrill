export type Category = "BASIC" | "USER" | "PKG" | "NET" | "FS" | "SVC" | "SEC" | "SCR";
export type Difficulty = "Easy" | "Average" | "Difficult";

export interface Problem {
  id: string;
  topic: string;
  topicName: string;
  category?: Category;
  title: string;
  description: string;
  difficulty: Difficulty;
  points: number;
  task: string;
  setup: string;
  hints: string[];
  solution: string;
  verify: string;
  watchOut: string;
}

export const CATEGORY_INFO: Record<Category, { name: string; description: string }> = {
  BASIC: { name: "Basic Shell", description: "Core file manipulations, directory navigation & output streams" },
  USER: { name: "User & Auth", description: "User accounts, group memberships, sudoers & POSIX permissions" },
  PKG: { name: "Package Mgr", description: "dnf, rpm, apt repository configuration and software management" },
  NET: { name: "Networking", description: "IP routing, socket inspection, DNS resolution & netfilter rules" },
  FS: { name: "Filesystems", description: "Mount points, LVM volumes, inode analysis & disk partitioning" },
  SVC: { name: "Services", description: "Systemd units, journalctl logs, process signals & daemons" },
  SEC: { name: "Security", description: "SELinux policies, SSH hardening, firewalld & auditing" },
  SCR: { name: "Scripting", description: "Bash logic, positional arguments, sed/awk parsing & cron jobs" },
};
