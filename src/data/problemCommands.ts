/**
 * Curated list of primary command binaries needed to solve each problem level.
 * Displays as subtle clue pills under the problem task without spoiling the full command flags/syntax.
 */

export const PROBLEM_COMMANDS: Record<string, string[]> = {
  // Topic 1: Basic Linux Commands
  "LX-BASIC-01": ["mkdir", "touch"],
  "LX-BASIC-02": ["echo", "sed", "wc"],
  "LX-BASIC-03": ["find"],
  "LX-BASIC-04": ["cut", "sort", "uniq", "head"],
  "LX-BASIC-05": ["awk", "sort", "wc", "chmod"],

  // Topic 2: User and Group Management
  "LX-USER-01": ["useradd", "chpasswd"],
  "LX-USER-02": ["groupadd", "usermod"],
  "LX-USER-03": ["useradd", "chpasswd", "chage"],
  "LX-USER-04": ["usermod", "chage"],
  "LX-USER-05": ["useradd", "groupadd", "chpasswd", "chage", "chmod", "visudo"],

  // Topic 3: Package Management
  "LX-PKG-01": ["dnf", "rpm"],
  "LX-PKG-02": ["rpm"],
  "LX-PKG-03": ["rpm", "grep"],
  "LX-PKG-04": ["cat", "dnf"],
  "LX-PKG-05": ["mkdir", "mount", "mv", "dnf"],

  // Topic 4: Networking
  "LX-NET-01": ["ip"],
  "LX-NET-02": ["hostnamectl"],
  "LX-NET-03": ["nmcli"],
  "LX-NET-04": ["echo"],
  "LX-NET-05": ["systemctl", "firewall-cmd"],

  // Topic 5: File System Management
  "LX-FS-01": ["touch", "chown", "chmod"],
  "LX-FS-02": ["du", "sort", "head"],
  "LX-FS-03": ["mkdir", "chgrp", "chmod"],
  "LX-FS-04": ["setfacl"],
  "LX-FS-05": ["pvcreate", "vgcreate", "lvcreate", "mkfs.xfs", "blkid", "mount", "lvextend"],

  // Topic 6: Service Management
  "LX-SVC-01": ["systemctl"],
  "LX-SVC-02": ["systemctl"],
  "LX-SVC-03": ["systemctl"],
  "LX-SVC-04": ["chmod", "systemctl"],
  "LX-SVC-05": ["systemctl"],

  // Topic 7: Security
  "LX-SEC-01": ["getenforce", "setenforce", "sed"],
  "LX-SEC-02": ["sed", "sshd", "systemctl"],
  "LX-SEC-03": ["dnf", "sed", "semanage", "firewall-cmd", "sshd", "systemctl"],
  "LX-SEC-04": ["sed"],
  "LX-SEC-05": ["ssh-keygen", "ssh-copy-id", "cp", "sshd", "systemctl"],

  // Topic 8: Batch Scripting
  "LX-SCR-01": ["hostname", "date", "whoami", "chmod"],
  "LX-SCR-02": ["chmod", "echo"],
  "LX-SCR-03": ["mkdir", "chmod"],
  "LX-SCR-04": ["df", "tail", "tr", "chmod"],
  "LX-SCR-05": ["tar", "date", "chmod", "diff"],
};

/**
 * Returns the curated list of commands needed for a specific problem level.
 */
export function getProblemCommands(problemId: string): string[] {
  return PROBLEM_COMMANDS[problemId] || [];
}
