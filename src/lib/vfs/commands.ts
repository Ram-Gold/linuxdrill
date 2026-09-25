import { VirtualFileSystem } from "./VirtualFileSystem";
import type { CommandOutput, UserSession, VFSNode } from "./types";
import { parseCommandLine, type ParsedCommand } from "./commandParser";
import {
  formatHelp,
  formatManPage,
  getManPage,
  getUnknownManError,
  MAN_PAGES,
} from "./manpages";

export class ShellContext {
  public vfs: VirtualFileSystem;
  public session: UserSession;
  public history: string[] = [];
  public previousDir = "/home/student";
  public servicesState: Map<string, { active: boolean; enabled: boolean; masked?: boolean }> = new Map();
  public firewallPorts: Set<string> = new Set(["22/tcp"]);
  public firewallServices: Set<string> = new Set(["ssh", "dhcpv6-client"]);
  public firewallRichRules: Set<string> = new Set();
  public selinuxMode: "Enforcing" | "Permissive" = "Enforcing";
  public selinuxPorts: Map<number, string> = new Map();
  public networkInterfaces: Map<
    string,
    { method: string; ip: string; gateway: string; dns: string; autoconnect: boolean; up: boolean }
  > = new Map();
  public userAging: Map<
    string,
    { maxDays?: number; minDays?: number; warnAge?: number; lastChange?: number; expireDate?: string; locked?: boolean }
  > = new Map();
  public acls: Map<string, { entries: string[]; defaultEntries: string[] }> = new Map();
  public lvm: {
    pvs: Set<string>;
    vgs: Map<string, string>;
    lvs: Map<string, { vg: string; size: string; xfs: boolean; mounted?: string }>;
  } = {
    pvs: new Set(),
    vgs: new Map(),
    lvs: new Map(),
  };
  public mounts: Map<string, { device: string; fstype: string; options: string }> = new Map();
  public installedPackages: Set<string> = new Set([
    "coreutils",
    "bash",
    "grep",
    "sed",
    "gawk",
    "findutils",
    "tar",
    "iproute",
    "firewalld",
    "systemd",
    "openssh-server",
    "openssh-clients",
    "chrony",
    "shadow-utils",
    "passwd",
  ]);

  constructor() {
    this.vfs = new VirtualFileSystem();
    this.session = {
      username: "student",
      uid: 1000,
      gid: 1000,
      group: "student",
      groups: ["student", "wheel"],
      cwd: "/home/student",
      homeDir: "/home/student",
      hostname: "centos-trainer",
      env: {
        USER: "student",
        HOME: "/home/student",
        SHELL: "/bin/bash",
        TERM: "xterm-256color",
        PATH: "/usr/local/bin:/usr/bin:/usr/local/sbin:/usr/sbin:/home/student/.local/bin:/home/student/bin",
      },
    };

    this.initDefaultStates();
  }

  private initDefaultStates(): void {
    // Services
    this.servicesState.set("sshd", { active: true, enabled: true, masked: false });
    this.servicesState.set("chronyd", { active: true, enabled: true, masked: false });
    this.servicesState.set("firewalld", { active: true, enabled: true, masked: false });
    this.servicesState.set("postfix", { active: true, enabled: true, masked: false });
    this.servicesState.set("nginx", { active: false, enabled: false, masked: false });
    this.servicesState.set("httpd", { active: false, enabled: false, masked: false });
    this.servicesState.set("named", { active: false, enabled: false, masked: false });

    // Firewall & Networking
    this.firewallPorts = new Set(["22/tcp"]);
    this.firewallServices = new Set(["ssh", "dhcpv6-client"]);
    this.firewallRichRules = new Set();
    this.networkInterfaces.set("ens33", {
      method: "auto",
      ip: "192.168.122.100/24",
      gateway: "192.168.122.1",
      dns: "8.8.8.8",
      autoconnect: true,
      up: true,
    });

    // SELinux
    this.selinuxMode = "Enforcing";
    this.selinuxPorts = new Map();

    // Default mounts
    this.mounts.clear();
  }

  public reset(): void {
    this.vfs.reset();
    this.session.username = "student";
    this.session.uid = 1000;
    this.session.gid = 1000;
    this.session.group = "student";
    this.session.groups = ["student", "wheel"];
    this.session.cwd = "/home/student";
    this.session.homeDir = "/home/student";
    this.session.hostname = "centos-trainer";
    this.session.env.USER = "student";
    this.session.env.HOME = "/home/student";
    this.session.env.HOSTNAME = "centos-trainer";

    this.userAging.clear();
    this.acls.clear();
    this.lvm = { pvs: new Set(), vgs: new Map(), lvs: new Map() };
    this.initDefaultStates();
  }

  public execute(rawInput: string): CommandOutput {
    const trimmed = rawInput.trim();
    if (!trimmed) {
      return { stdout: "", stderr: "", exitCode: 0 };
    }

    this.history.push(trimmed);

    const processedInput = this.processWhileLoops(trimmed);
    const steps = parseCommandLine(processedInput);
    let lastOutput: CommandOutput = { stdout: "", stderr: "", exitCode: 0 };
    let lastExitCode = 0;

    for (const step of steps) {
      if (step.prevOp === "&&" && lastExitCode !== 0) {
        continue;
      }
      if (step.prevOp === "||" && lastExitCode === 0) {
        continue;
      }

      lastOutput = this.executePipeline(step.cmd, "");
      lastExitCode = lastOutput.exitCode;
    }

    return lastOutput;
  }

  private processWhileLoops(input: string): string {
    const whileRegex = /while\s+(?:IFS=([^\s]+)\s+)?read(?:\s+-[a-zA-Z]+)*\s+([a-zA-Z0-9_\s]+);\s*do([\s\S]*?)done\s*<\s*([^\s;\n]+)/g;
    let match;
    let result = input;

    while ((match = whileRegex.exec(input)) !== null) {
      const fullMatch = match[0];
      const ifs = match[1] || " ";
      const varNames = match[2].trim().split(/\s+/);
      const body = match[3];
      const sourceFile = match[4].trim();

      const fileRes = this.vfs.readFile(sourceFile, this.session.cwd);
      if (fileRes.content) {
        const lines = fileRes.content.split("\n").filter((l) => l.trim().length > 0);
        const unrolledCommands: string[] = [];

        for (const line of lines) {
          const parts = ifs === " " ? line.trim().split(/\s+/) : line.split(ifs);
          varNames.forEach((name, idx) => {
            if (parts[idx] !== undefined) {
              this.session.env[name] = parts[idx];
            }
          });

          let unrolledBody = body;
          varNames.forEach((name, idx) => {
            const val = parts[idx] ?? "";
            unrolledBody = unrolledBody
              .replace(new RegExp(`"\\$${name}"`, "g"), `"${val}"`)
              .replace(new RegExp(`\\$${name}\\b`, "g"), val)
              .replace(new RegExp(`\\$\\{${name}\\}`, "g"), val);
          });

          unrolledBody = unrolledBody.replace(/\$([a-zA-Z_][a-zA-Z0-9_]*)\b/g, (_, v) => this.session.env[v] ?? "");

          unrolledCommands.push(unrolledBody.trim());
        }

        result = result.replace(fullMatch, unrolledCommands.join("\n"));
      }
    }

    return result;
  }

  private expandSubstitutions(input: string): string {
    let result = input;

    // 1. Evaluate inner command substitutions $(...) (not $((...)))
    let cmdSubMatch: RegExpMatchArray | null;
    let iterations = 0;
    while ((cmdSubMatch = result.match(/\$\(([^()]+)\)/)) !== null && iterations < 10) {
      iterations++;
      const full = cmdSubMatch[0];
      const innerCmd = cmdSubMatch[1];
      if (full.startsWith("$((") && full.endsWith("))")) {
        break;
      }
      const out = this.execute(innerCmd);
      result = result.replace(full, out.stdout.trim());
    }

    // 2. Evaluate arithmetic expressions $(( expr ))
    let arithMatch: RegExpMatchArray | null;
    iterations = 0;
    while ((arithMatch = result.match(/\$\(\(\s*([0-9+\-*/ ()]+)\s*\)\)/)) !== null && iterations < 10) {
      iterations++;
      const full = arithMatch[0];
      const expr = arithMatch[1];
      try {
        const val = Function(`'use strict'; return (${expr})`)();
        result = result.replace(full, String(val));
      } catch {
        result = result.replace(full, "0");
      }
    }

    // 3. Expand variables $VAR and ${VAR}
    result = result.replace(/\$\{?([a-zA-Z_][a-zA-Z0-9_]*)\}?/g, (match, varName) => {
      if (this.session.env[varName] !== undefined) {
        return this.session.env[varName];
      }
      return match;
    });

    return result;
  }

  private executePipeline(cmd: ParsedCommand, stdinInput: string): CommandOutput {
    let effectiveStdin = stdinInput;

    if (cmd.heredoc !== undefined) {
      effectiveStdin = cmd.heredoc;
    } else if (cmd.stdinFile) {
      const read = this.vfs.readFile(cmd.stdinFile, this.session.cwd);
      if (read.error) {
        return { stdout: "", stderr: `bash: ${cmd.stdinFile}: ${read.error}`, exitCode: 1 };
      }
      effectiveStdin = read.content ?? "";
    }

    const expandedCommand = this.expandSubstitutions(cmd.command);
    const expandedArgs = cmd.args.map((a) => this.expandSubstitutions(a));
    const processedCmd: ParsedCommand = {
      ...cmd,
      command: expandedCommand,
      args: expandedArgs,
    };

    let out = this.dispatch(processedCmd, effectiveStdin);

    if (cmd.redirect) {
      const res = this.vfs.writeFile(cmd.redirect.file, out.stdout, this.session.cwd, {
        append: cmd.redirect.append,
        owner: this.session.username,
        group: this.session.group,
      });
      if (!res.success) {
        return { stdout: "", stderr: `bash: ${cmd.redirect.file}: ${res.error}`, exitCode: 1 };
      }
      out = { stdout: "", stderr: out.stderr, exitCode: out.exitCode };
    }

    if (cmd.pipeNext) {
      return this.executePipeline(cmd.pipeNext, out.stdout);
    }

    return out;
  }

  private dispatch(cmd: ParsedCommand, stdin: string): CommandOutput {
    let commandName = cmd.command;
    let args = [...cmd.args];

    // Handle variable assignments: VAR=val
    const assignMatch = commandName.match(/^([a-zA-Z_][a-zA-Z0-9_]*)=(.*)$/);
    if (assignMatch) {
      const varName = assignMatch[1];
      let val = assignMatch[2];
      if (args.length > 0) {
        val = [val, ...args].join(" ");
      }
      this.session.env[varName] = val.replace(/^["']|["']$/g, "");
      return { stdout: "", stderr: "", exitCode: 0 };
    }

    if (commandName === "export") {
      for (const a of args) {
        const eq = a.indexOf("=");
        if (eq !== -1) {
          const k = a.slice(0, eq);
          const v = a.slice(eq + 1).replace(/^["']|["']$/g, "");
          this.session.env[k] = v;
        }
      }
      return { stdout: "", stderr: "", exitCode: 0 };
    }

    // Handle sudo
    if (commandName === "sudo") {
      if (args[0] === "-i" || args[0] === "-s" || args[0] === "su") {
        commandName = "su";
        args = ["-"];
      } else {
        commandName = args[0] ?? "";
        args = args.slice(1);
      }
    }

    // Check script execution e.g. /root/info.sh or ./greet.sh
    if (commandName.startsWith("./") || commandName.startsWith("/") || commandName.endsWith(".sh")) {
      return this.handleScriptExecution(commandName, args);
    }
    if (commandName === "bash" && args[0]?.endsWith(".sh")) {
      return this.handleScriptExecution(args[0], args.slice(1));
    }

    // Universal GNU --help interceptor
    if (
      args.includes("--help") ||
      (args.length === 1 && args[0] === "-h" && !["ls", "df", "du", "free", "tar", "grep"].includes(commandName))
    ) {
      const help = formatHelp(commandName);
      if (help) {
        return { stdout: help, stderr: "", exitCode: 0 };
      }
    }

    switch (commandName) {
      case "pwd":
        return { stdout: `${this.session.cwd}\n`, stderr: "", exitCode: 0 };

      case "cd":
        return this.handleCd(args[0]);

      case "ls":
        return this.handleLs(args);

      case "mkdir":
        return this.handleMkdir(args);

      case "touch":
        return this.handleTouch(args);

      case "rm":
        return this.handleRm(args);

      case "cp":
        return this.handleCp(args);

      case "mv":
        return this.handleMv(args);

      case "cat":
        return this.handleCat(args, stdin);

      case "head":
        return this.handleHead(args, stdin);

      case "tail":
        return this.handleTail(args, stdin);

      case "grep":
        return this.handleGrep(args, stdin);

      case "sed":
        return this.handleSed(args, stdin);

      case "cut":
        return this.handleCut(args, stdin);

      case "awk":
        return this.handleAwk(args, stdin);

      case "sort":
        return this.handleSort(args, stdin);

      case "uniq":
        return this.handleUniq(args, stdin);

      case "du":
        return this.handleDu(args);

      case "find":
        return this.handleFind(args);

      case "echo":
        return this.handleEcho(args);

      case "chmod":
        return this.handleChmod(args);

      case "chown":
        return this.handleChown(args);

      case "chgrp":
        return this.handleChgrp(args);

      case "chage":
        return this.handleChage(args);

      case "tree":
        return this.handleTree(args[0]);

      case "wc":
        return this.handleWc(args, stdin);

      case "tr":
        return this.handleTr(args, stdin);

      case "stat":
        return this.handleStat(args[0]);

      case "df":
        return this.handleDf(args);

      case "free":
        return {
          stdout:
            "               total        used        free      shared  buff/cache   available\nMem:         8124800     1254320     5621400       34500     1249080     6540200\nSwap:        4194304           0     4194304\n",
          stderr: "",
          exitCode: 0,
        };

      case "uname":
        if (args.includes("-r")) {
          return { stdout: "5.14.0-362.el9.x86_64\n", stderr: "", exitCode: 0 };
        }
        return {
          stdout: "Linux centos-trainer 5.14.0-362.el9.x86_64 #1 SMP PREEMPT_DYNAMIC CentOS 5.14.0 x86_64 GNU/Linux\n",
          stderr: "",
          exitCode: 0,
        };

      case "whoami":
        return { stdout: `${this.session.username}\n`, stderr: "", exitCode: 0 };

      case "id": {
        const targetUser = args.find((a) => !a.startsWith("-"));
        if (!targetUser) {
          return {
            stdout: `uid=${this.session.uid}(${this.session.username}) gid=${this.session.gid}(${this.session.group}) groups=${this.session.groups.map((g, i) => `${1000 + i}(${g})`).join(",")}\n`,
            stderr: "",
            exitCode: 0,
          };
        }
        const passwd = this.vfs.readFile("/etc/passwd").content || "";
        const userLine = passwd.split("\n").find((l) => l.startsWith(`${targetUser}:`));
        if (!userLine) {
          return { stdout: "", stderr: `id: ‘${targetUser}’: no such user\n`, exitCode: 1 };
        }
        const parts = userLine.split(":");
        const uid = parts[2] || "1000";
        const gid = parts[3] || "1000";
        return {
          stdout: `uid=${uid}(${targetUser}) gid=${gid}(${targetUser}) groups=${gid}(${targetUser})\n`,
          stderr: "",
          exitCode: 0,
        };
      }

      case "groups":
        return {
          stdout: `${this.session.groups.join(" ")}\n`,
          stderr: "",
          exitCode: 0,
        };

      case "su":
        return this.handleSu(args[0]);

      case "useradd":
        return this.handleUseradd(args);

      case "usermod":
        return this.handleUsermod(args);

      case "userdel":
        return this.handleUserdel(args);

      case "groupadd":
        return this.handleGroupadd(args);

      case "groupdel":
        return this.handleGroupdel(args);

      case "chpasswd":
        return this.handleChpasswd(args, stdin);

      case "getent":
        return this.handleGetent(args);

      case "passwd":
        if (args.includes("-l")) {
          const user = args.find((a) => !a.startsWith("-")) || "";
          if (user) {
            const ag = this.userAging.get(user) || {};
            ag.locked = true;
            this.userAging.set(user, ag);
          }
          return { stdout: `passwd: password expiry information changed.\n`, stderr: "", exitCode: 0 };
        }
        return { stdout: "passwd: all authentication tokens updated successfully.\n", stderr: "", exitCode: 0 };

      case "hostnamectl":
        return this.handleHostnamectl(args);

      case "hostname":
        if (args[0]) {
          return this.handleHostnamectl(["set-hostname", args[0]]);
        }
        return { stdout: `${this.session.hostname}\n`, stderr: "", exitCode: 0 };

      case "nmcli":
        return this.handleNmcli(args);

      case "systemctl":
        return this.handleSystemctl(args);

      case "service":
        return this.handleService(args);

      case "journalctl":
        return this.handleJournalctl(args);

      case "ip":
        return this.handleIp(args);

      case "ifconfig":
        return {
          stdout: `ens33: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500\n        inet 192.168.122.100  netmask 255.255.255.0  broadcast 192.168.122.255\n        inet6 fe80::5054:ff:fe12:3456  prefixlen 64  scopeid 0x20<link>\n        ether 52:54:00:12:34:56  txqueuelen 1000  (Ethernet)\n`,
          stderr: "",
          exitCode: 0,
        };

      case "ping":
        return {
          stdout: `PING ${args[0] ?? "127.0.0.1"} (127.0.0.1) 56(84) bytes of data.\n64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.045 ms\n64 bytes from 127.0.0.1: icmp_seq=2 ttl=64 time=0.038 ms\n--- ${args[0] ?? "localhost"} ping statistics ---\n2 packets transmitted, 2 received, 0% packet loss, time 1001ms\n`,
          stderr: "",
          exitCode: 0,
        };

      case "curl":
        return {
          stdout: `<!DOCTYPE html>\n<html>\n<head><title>Test Server</title></head>\n<body><h1>CentOS Test Server</h1></body>\n</html>\n`,
          stderr: "",
          exitCode: 0,
        };

      case "ss":
      case "netstat":
        return {
          stdout: `State      Recv-Q Send-Q Local Address:Port               Peer Address:Port              Process\nLISTEN     0      128          0.0.0.0:22                      0.0.0.0:*                  users:(("sshd",pid=842,fd=3))\nLISTEN     0      511          0.0.0.0:80                      0.0.0.0:*                  users:(("httpd",pid=991,fd=4))\nLISTEN     0      128             [::]:22                         [::]:*                  users:(("sshd",pid=842,fd=4))\n`,
          stderr: "",
          exitCode: 0,
        };

      case "firewall-cmd":
        return this.handleFirewallCmd(args);

      case "yum":
      case "dnf":
        return this.handleYum(args);

      case "rpm":
        return this.handleRpm(args);

      case "tar":
        return this.handleTar(args);

      case "getenforce":
        return this.handleGetenforce();

      case "setenforce":
        return this.handleSetenforce(args);

      case "semanage":
        return this.handleSemanage(args);

      case "setfacl":
        return this.handleSetfacl(args);

      case "getfacl":
        return this.handleGetfacl(args);

      case "lsblk":
        return this.handleLsblk(args);

      case "blkid":
        return this.handleBlkid(args);

      case "pvcreate":
        return this.handlePvcreate(args);

      case "vgcreate":
        return this.handleVgcreate(args);

      case "lvcreate":
        return this.handleLvcreate(args);

      case "lvextend":
        return this.handleLvextend(args);

      case "mkfs.xfs":
        return this.handleMkfsXfs(args);

      case "mount":
        return this.handleMount(args);

      case "sshd":
        return this.handleSshd(args);

      case "visudo":
        return this.handleVisudo(args);

      case "diff":
        return this.handleDiff(args);

      case "sleep":
        return this.handleSleep(args);

      case "xargs":
        return this.handleXargs(args, stdin);

      case "date": {
        const d = new Date();
        const dArg = args.find((_a, i) => i > 0 && args[i - 1] === "-d");
        if (dArg && dArg.includes("90 days")) {
          d.setDate(d.getDate() + 90);
        }
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const fDate = `${year}-${month}-${day}`;
        if (args.some((a) => a.includes("%F"))) {
          return { stdout: `${fDate}\n`, stderr: "", exitCode: 0 };
        }
        return { stdout: `${d.toUTCString()}\n`, stderr: "", exitCode: 0 };
      }

      case "uptime":
        return {
          stdout: " 02:45:10 up 3 days,  4:12,  2 users,  load average: 0.08, 0.03, 0.01\n",
          stderr: "",
          exitCode: 0,
        };

      case "clear":
        return { stdout: "", stderr: "", exitCode: 0, clear: true };

      case "history":
        return {
          stdout: this.history.map((h, i) => `  ${(i + 1).toString().padStart(4, " ")}  ${h}`).join("\n") + "\n",
          stderr: "",
          exitCode: 0,
        };

      case "which":
        return { stdout: `/usr/bin/${args[0] ?? ""}\n`, stderr: "", exitCode: 0 };

      case "help":
        if (args[0]) {
          const page = getManPage(args[0]);
          if (page) {
            return { stdout: formatHelp(args[0]) || formatManPage(page), stderr: "", exitCode: 0 };
          }
          return {
            stdout: "",
            stderr: `bash: help: no help topics match \`${args[0]}'. Try \`help help' or \`man -k ${args[0]}' or \`info ${args[0]}'.\n`,
            exitCode: 1,
          };
        }
        return {
          stdout: `GNU bash, version 5.1.8(1)-release (x86_64-redhat-linux-gnu)\nThese shell commands are defined internally. Type 'help' to see this list.\nType 'help name' to find out more about the function 'name'.\nUse 'man -k' or 'info' to find out more about commands not in this list.\n\n job_spec [&]                            history [-c] [-d offset] [n]\n (( expression ))                        if COMMANDS; then COMMANDS; [ elif ..\n . filename [arguments]                 jobs [-lnprs] [job_spec ...] or ...\n :                                       kill [-s sigspec | -n signum | ...] \n [ arg... ]                              let arg [arg ...]\n [[ expression ]]                        local [option] name[=value] ...\n alias [-p] [name[=value] ...]          logout [n]\n bg [job_spec ...]                       popd [-n] [+N | -N]\n cd [-L|[-P [-e]] [-@]] [dir]           pwd [-LP]\n exit [n]                                ulimit [-SHabcdefiklmnpqrstuvxPT] ..\n`,
          stderr: "",
          exitCode: 0,
        };

      case "man":
        return this.handleMan(args);

      case "less":
      case "more":
        return this.handleLess(args, stdin);

      case "exit":
        if (this.session.username !== "student") {
          return this.handleSu("student");
        }
        return { stdout: "exit: cannot exit root shell\n", stderr: "", exitCode: 0 };

      default:
        return {
          stdout: "",
          stderr: `bash: ${commandName}: command not found`,
          exitCode: 127,
        };
    }
  }

  private handleMan(args: string[]): CommandOutput {
    if (args.length === 0) {
      return {
        stdout: "",
        stderr: "What manual page do you want?\nFor example, try 'man man'.\n",
        exitCode: 1,
      };
    }

    // Handle apropos: man -k <keyword>
    if (args[0] === "-k" || args[0] === "--apropos") {
      const keyword = (args[1] || "").toLowerCase();
      if (!keyword) {
        return { stdout: "", stderr: "man: option requires an argument -- 'k'\n", exitCode: 1 };
      }
      const matches = Object.values(MAN_PAGES).filter(
        (m) => m.name.toLowerCase().includes(keyword) || m.description.toLowerCase().includes(keyword)
      );
      if (matches.length === 0) {
        return { stdout: `${keyword}: nothing appropriate.\n`, stderr: "", exitCode: 0 };
      }
      const lines = matches.map((m) => `${m.name} (${m.section}) - ${m.description.split(".")[0]}`).join("\n");
      return { stdout: lines + "\n", stderr: "", exitCode: 0 };
    }

    let target = args[0];
    let section: number | null = null;
    if (/^[1-8]$/.test(args[0]) && args[1]) {
      section = parseInt(args[0], 10);
      target = args[1];
    } else if (args[1] && /^[1-8]$/.test(args[1])) {
      target = args[0];
      section = parseInt(args[1], 10);
    }

    const page = getManPage(target);
    if (!page || (section !== null && page.section !== section)) {
      return {
        stdout: "",
        stderr: getUnknownManError(target),
        exitCode: 16,
      };
    }

    const formatted = formatManPage(page);
    return {
      stdout: formatted,
      stderr: "",
      exitCode: 0,
      pager: {
        title: `Manual page ${page.name}(${page.section})`,
        content: formatted,
      },
    };
  }

  private handleLess(args: string[], stdin?: string): CommandOutput {
    if (args.length === 0) {
      if (stdin) {
        return {
          stdout: stdin,
          stderr: "",
          exitCode: 0,
          pager: {
            title: "Standard Input",
            content: stdin,
          },
        };
      }
      return {
        stdout: "",
        stderr: "Missing filename (\"less --help\" for help)\n",
        exitCode: 1,
      };
    }

    const target = args[0];
    const resolved = this.vfs.resolvePath(target, this.session.cwd);
    const node = this.vfs.getNode(resolved);

    if (!node) {
      return {
        stdout: "",
        stderr: `${target}: No such file or directory\n`,
        exitCode: 1,
      };
    }

    if (node.type === "dir") {
      return {
        stdout: "",
        stderr: `${target} is a directory\n`,
        exitCode: 1,
      };
    }

    const content = node.content || "";
    return {
      stdout: content,
      stderr: "",
      exitCode: 0,
      pager: {
        title: target,
        content,
      },
    };
  }

  private handleCd(target?: string): CommandOutput {
    const dest = target && target !== "~" ? target : this.session.homeDir;
    if (dest === "-") {
      const prev = this.previousDir;
      this.previousDir = this.session.cwd;
      this.session.cwd = prev;
      return { stdout: `${this.session.cwd}\n`, stderr: "", exitCode: 0 };
    }

    const resolved = this.vfs.resolvePath(dest, this.session.cwd);
    const node = this.vfs.getNode(resolved);

    if (!node) {
      return { stdout: "", stderr: `cd: ${target}: No such file or directory`, exitCode: 1 };
    }
    if (node.type !== "dir") {
      return { stdout: "", stderr: `cd: ${target}: Not a directory`, exitCode: 1 };
    }

    this.previousDir = this.session.cwd;
    this.session.cwd = resolved;
    return { stdout: "", stderr: "", exitCode: 0 };
  }

  private handleLs(args: string[]): CommandOutput {
    let showAll = false;
    let longFormat = false;
    let recursive = false;
    let target = "";

    for (const arg of args) {
      if (arg.startsWith("-")) {
        if (arg.includes("a")) showAll = true;
        if (arg.includes("l")) longFormat = true;
        if (arg.includes("R")) recursive = true;
      } else if (!target) {
        target = arg;
      }
    }

    const targetPath = target || this.session.cwd;
    const resolved = this.vfs.resolvePath(targetPath, this.session.cwd);
    const node = this.vfs.getNode(resolved);

    if (!node) {
      return { stdout: "", stderr: `ls: cannot access '${target}': No such file or directory`, exitCode: 2 };
    }

    if (node.type === "file") {
      return {
        stdout: longFormat ? `${node.permissions} 1 ${node.owner} ${node.group} ${node.size} Sep 21 00:00 ${node.name}\n` : `${node.name}\n`,
        stderr: "",
        exitCode: 0,
      };
    }

    if (recursive) {
      return this.handleLsRecursive(resolved, showAll, longFormat);
    }

    const entries = Array.from(node.children?.values() || []);
    const filtered = entries.filter((e) => showAll || !e.name.startsWith("."));

    if (longFormat) {
      let output = `total ${filtered.length * 4}\n`;
      for (const entry of filtered) {
        const typeChar = entry.type === "dir" ? "d" : entry.type === "symlink" ? "l" : "-";
        const symlinkTarget = entry.target ? ` -> ${entry.target}` : "";
        output += `${typeChar}${entry.permissions} 1 ${entry.owner} ${entry.group} ${entry.size} Sep 21 00:00 ${entry.name}${symlinkTarget}\n`;
      }
      return { stdout: output, stderr: "", exitCode: 0 };
    }

    const names = filtered.map((e) => (e.type === "dir" ? `${e.name}/` : e.name));
    return { stdout: names.length > 0 ? `${names.join("  ")}\n` : "", stderr: "", exitCode: 0 };
  }

  private handleLsRecursive(basePath: string, showAll: boolean, longFormat: boolean): CommandOutput {
    let output = "";
    const traverse = (path: string) => {
      const node = this.vfs.getNode(path);
      if (!node || node.type !== "dir" || !node.children) return;

      output += `${path}:\n`;
      const entries = Array.from(node.children.values()).filter((e) => showAll || !e.name.startsWith("."));

      if (longFormat) {
        for (const entry of entries) {
          const typeChar = entry.type === "dir" ? "d" : "-";
          output += `${typeChar}${entry.permissions} 1 ${entry.owner} ${entry.group} ${entry.size} ${entry.name}\n`;
        }
      } else {
        output += entries.map((e) => e.name).join("  ") + "\n";
      }
      output += "\n";

      for (const entry of entries) {
        if (entry.type === "dir") {
          const subPath = path === "/" ? `/${entry.name}` : `${path}/${entry.name}`;
          traverse(subPath);
        }
      }
    };

    traverse(basePath);
    return { stdout: output, stderr: "", exitCode: 0 };
  }

  private handleMkdir(args: string[]): CommandOutput {
    let recursive = false;
    const targets: string[] = [];

    for (const arg of args) {
      if (arg === "-p" || arg === "--parents") recursive = true;
      else if (!arg.startsWith("-")) targets.push(arg);
    }

    if (targets.length === 0) {
      return { stdout: "", stderr: "mkdir: missing operand", exitCode: 1 };
    }

    for (const target of targets) {
      const res = this.vfs.mkdir(target, this.session.cwd, {
        recursive,
        owner: this.session.username,
        group: this.session.group,
      });
      if (!res.success) {
        return { stdout: "", stderr: `mkdir: cannot create directory '${target}': ${res.error}`, exitCode: 1 };
      }
    }

    return { stdout: "", stderr: "", exitCode: 0 };
  }

  private handleTouch(args: string[]): CommandOutput {
    if (args.length === 0) {
      return { stdout: "", stderr: "touch: missing file operand", exitCode: 1 };
    }

    for (const target of args) {
      if (target.startsWith("-")) continue;
      this.vfs.writeFile(target, "", this.session.cwd, {
        owner: this.session.username,
        group: this.session.group,
      });
    }

    return { stdout: "", stderr: "", exitCode: 0 };
  }

  private handleRm(args: string[]): CommandOutput {
    let recursive = false;
    let force = false;
    const targets: string[] = [];

    for (const arg of args) {
      if (arg.startsWith("-")) {
        if (arg.includes("r") || arg.includes("R")) recursive = true;
        if (arg.includes("f")) force = true;
      } else {
        targets.push(arg);
      }
    }

    for (const target of targets) {
      const res = this.vfs.remove(target, this.session.cwd, recursive);
      if (!res.success && !force) {
        return { stdout: "", stderr: `rm: cannot remove '${target}': ${res.error}`, exitCode: 1 };
      }
    }

    return { stdout: "", stderr: "", exitCode: 0 };
  }

  private handleCp(args: string[]): CommandOutput {
    const cleanArgs = args.filter((a) => !a.startsWith("-"));
    if (cleanArgs.length < 2) {
      return { stdout: "", stderr: "cp: missing destination file operand", exitCode: 1 };
    }
    const [src, dest] = cleanArgs;
    const read = this.vfs.readFile(src, this.session.cwd);
    if (read.error) {
      return { stdout: "", stderr: `cp: cannot stat '${src}': ${read.error}`, exitCode: 1 };
    }
    this.vfs.writeFile(dest, read.content ?? "", this.session.cwd, {
      owner: this.session.username,
      group: this.session.group,
    });
    return { stdout: "", stderr: "", exitCode: 0 };
  }

  private handleMv(args: string[]): CommandOutput {
    const cleanArgs = args.filter((a) => !a.startsWith("-"));
    if (cleanArgs.length < 2) {
      return { stdout: "", stderr: "mv: missing destination file operand", exitCode: 1 };
    }
    const [src, dest] = cleanArgs;

    // Check if dest is an existing directory
    const destNode = this.vfs.getNode(dest, this.session.cwd);
    let finalDest = dest;
    if (destNode && destNode.type === "dir") {
      const srcName = src.split("/").pop() || src;
      finalDest = `${dest.replace(/\/$/, "")}/${srcName}`;
    }

    const read = this.vfs.readFile(src, this.session.cwd);
    if (!read.error) {
      this.vfs.writeFile(finalDest, read.content ?? "", this.session.cwd, {
        owner: this.session.username,
        group: this.session.group,
      });
      this.vfs.remove(src, this.session.cwd, false);
      return { stdout: "", stderr: "", exitCode: 0 };
    }

    // Move directory
    const srcNode = this.vfs.getNode(src, this.session.cwd);
    if (srcNode && srcNode.type === "dir") {
      this.vfs.mkdir(finalDest, this.session.cwd, { recursive: true });
      this.vfs.remove(src, this.session.cwd, true);
      return { stdout: "", stderr: "", exitCode: 0 };
    }

    return { stdout: "", stderr: `mv: cannot stat '${src}': No such file or directory`, exitCode: 1 };
  }

  private handleCat(args: string[], stdin: string): CommandOutput {
    if (args.length === 0) {
      return { stdout: stdin, stderr: "", exitCode: 0 };
    }

    const outputs: string[] = [];
    for (const file of args) {
      if (file.startsWith("-")) continue;
      const read = this.vfs.readFile(file, this.session.cwd);
      if (read.error) {
        return { stdout: "", stderr: `cat: ${file}: ${read.error}`, exitCode: 1 };
      }
      outputs.push(read.content ?? "");
    }

    return { stdout: outputs.join(""), stderr: "", exitCode: 0 };
  }

  private handleHead(args: string[], stdin: string): CommandOutput {
    let count = 10;
    let file = "";
    for (let i = 0; i < args.length; i++) {
      if (args[i] === "-n" && args[i + 1]) {
        count = parseInt(args[i + 1], 10) || 10;
        i++;
      } else if (!args[i].startsWith("-")) {
        file = args[i];
      }
    }

    let text = stdin;
    if (file) {
      const read = this.vfs.readFile(file, this.session.cwd);
      if (read.error) return { stdout: "", stderr: `head: cannot open '${file}': ${read.error}`, exitCode: 1 };
      text = read.content ?? "";
    }

    const lines = text.split("\n").slice(0, count).join("\n");
    return { stdout: lines ? `${lines}\n` : "", stderr: "", exitCode: 0 };
  }

  private handleTail(args: string[], stdin: string): CommandOutput {
    let count = 10;
    let file = "";
    for (let i = 0; i < args.length; i++) {
      if (args[i] === "-n" && args[i + 1]) {
        const val = args[i + 1];
        if (val.startsWith("+")) {
          count = parseInt(val.slice(1), 10) || 1;
        } else {
          count = parseInt(val, 10) || 10;
        }
        i++;
      } else if (!args[i].startsWith("-")) {
        file = args[i];
      }
    }

    let text = stdin;
    if (file) {
      const read = this.vfs.readFile(file, this.session.cwd);
      if (read.error) return { stdout: "", stderr: `tail: cannot open '${file}': ${read.error}`, exitCode: 1 };
      text = read.content ?? "";
    }

    const allLines = text.split("\n").filter((l) => l.length > 0);
    const lines = allLines.slice(Math.max(0, allLines.length - count)).join("\n");
    return { stdout: lines ? `${lines}\n` : "", stderr: "", exitCode: 0 };
  }

  private handleGrep(args: string[], stdin: string): CommandOutput {
    let ignoreCase = false;
    let invertMatch = false;
    let countOnly = false;
    let pattern = "";
    let file = "";

    for (const arg of args) {
      if (arg.startsWith("-")) {
        if (arg.includes("i")) ignoreCase = true;
        if (arg.includes("v")) invertMatch = true;
        if (arg.includes("c")) countOnly = true;
      } else if (!pattern) {
        pattern = arg;
      } else if (!file) {
        file = arg;
      }
    }

    let text = stdin;
    if (file) {
      const read = this.vfs.readFile(file, this.session.cwd);
      if (read.error) return { stdout: "", stderr: `grep: ${file}: ${read.error}`, exitCode: 2 };
      text = read.content ?? "";
    }

    const lines = text.split("\n");
    const matched = lines.filter((l) => {
      if (!l) return false;
      const match = ignoreCase
        ? l.toLowerCase().includes(pattern.toLowerCase())
        : l.includes(pattern);
      return invertMatch ? !match : match;
    });

    if (countOnly) {
      return { stdout: `${matched.length}\n`, stderr: "", exitCode: 0 };
    }

    return {
      stdout: matched.length > 0 ? `${matched.join("\n")}\n` : "",
      stderr: "",
      exitCode: matched.length > 0 ? 0 : 1,
    };
  }

  private handleSed(args: string[], stdin: string): CommandOutput {
    let inPlace = false;
    let silent = false;
    let expr = "";
    let file = "";

    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      if (a === "-i") {
        inPlace = true;
      } else if (a === "-n") {
        silent = true;
      } else if (!expr) {
        expr = a;
      } else if (!file && !a.startsWith("-")) {
        file = a;
      }
    }

    let content = stdin;
    if (file) {
      const read = this.vfs.readFile(file, this.session.cwd);
      if (read.error) {
        return { stdout: "", stderr: `sed: can't read ${file}: ${read.error}`, exitCode: 2 };
      }
      content = read.content ?? "";
    }

    const printLineMatch = expr.match(/^(\d+)p$/);
    if (silent && printLineMatch) {
      const lineNum = parseInt(printLineMatch[1], 10);
      const lines = content.split("\n");
      const targetLine = lines[lineNum - 1] ?? "";
      return { stdout: targetLine ? `${targetLine}\n` : "", stderr: "", exitCode: 0 };
    }

    const subMatch = expr.match(/^s([^\w\s])(.*?)\1(.*?)(?:\1([gipI]*))?$/);
    if (subMatch) {
      const patternStr = subMatch[2];
      const replacementStr = subMatch[3];
      const flags = (subMatch[4] || "").includes("g") ? "g" : "";

      try {
        const jsPattern = patternStr.replace(/\\([?+{}()])/g, "$1");
        const regex = new RegExp(jsPattern, flags);
        const lines = content.split("\n");
        const replaced = lines.map((line) => line.replace(regex, replacementStr)).join("\n");

        if (inPlace && file) {
          this.vfs.writeFile(file, replaced, this.session.cwd);
          return { stdout: "", stderr: "", exitCode: 0 };
        }
        return { stdout: `${replaced}\n`, stderr: "", exitCode: 0 };
      } catch {
        return { stdout: "", stderr: `sed: invalid regex '${patternStr}'`, exitCode: 1 };
      }
    }

    return { stdout: content, stderr: "", exitCode: 0 };
  }

  private handleCut(args: string[], stdin: string): CommandOutput {
    let delim = "\t";
    let field = 1;
    let file = "";

    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      if (a.startsWith("-d")) {
        delim = a.length > 2 ? a.slice(2) : args[++i] || "\t";
      } else if (a.startsWith("-f")) {
        field = parseInt(a.length > 2 ? a.slice(2) : args[++i] || "1", 10) || 1;
      } else if (!a.startsWith("-") && !file) {
        file = a;
      }
    }

    let content = stdin;
    if (file) {
      const read = this.vfs.readFile(file, this.session.cwd);
      if (read.error) return { stdout: "", stderr: `cut: ${file}: ${read.error}`, exitCode: 1 };
      content = read.content ?? "";
    }

    const lines = content.split("\n").filter((l) => l.length > 0);
    const output = lines.map((l) => {
      const parts = l.split(delim);
      return parts[field - 1] ?? "";
    });

    return { stdout: output.join("\n") + (output.length > 0 ? "\n" : ""), stderr: "", exitCode: 0 };
  }

  private handleAwk(args: string[], stdin: string): CommandOutput {
    let delim = /\s+/;
    let field = 1;
    let file = "";

    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      if (a.startsWith("-F")) {
        const d = a.length > 2 ? a.slice(2) : args[++i] || ":";
        delim = new RegExp(d === ":" ? ":" : d);
      } else if (a.includes("$")) {
        const m = a.match(/\$(\d+)/);
        if (m) field = parseInt(m[1], 10);
      } else if (!a.startsWith("-") && !file) {
        file = a;
      }
    }

    let content = stdin;
    if (file) {
      const read = this.vfs.readFile(file, this.session.cwd);
      if (read.error) return { stdout: "", stderr: `awk: ${file}: ${read.error}`, exitCode: 1 };
      content = read.content ?? "";
    }

    const lines = content.split("\n").filter((l) => l.length > 0);
    const output = lines.map((l) => {
      const parts = l.split(delim);
      return parts[field - 1] ?? "";
    });

    return { stdout: output.join("\n") + (output.length > 0 ? "\n" : ""), stderr: "", exitCode: 0 };
  }

  private handleSort(args: string[], stdin: string): CommandOutput {
    let reverse = false;
    let numeric = false;
    let file = "";

    for (const a of args) {
      if (a.startsWith("-")) {
        if (a.includes("r")) reverse = true;
        if (a.includes("n") || a.includes("h")) numeric = true;
      } else if (!file) {
        file = a;
      }
    }

    let content = stdin;
    if (file) {
      const read = this.vfs.readFile(file, this.session.cwd);
      if (read.error) return { stdout: "", stderr: `sort: cannot read: ${file}: ${read.error}`, exitCode: 2 };
      content = read.content ?? "";
    }

    const lines = content.split("\n").filter((l) => l.trim().length > 0);
    lines.sort((a, b) => {
      if (numeric) {
        const numA = parseFloat(a.replace(/[^0-9.-]/g, "")) || 0;
        const numB = parseFloat(b.replace(/[^0-9.-]/g, "")) || 0;
        return reverse ? numB - numA : numA - numB;
      }
      return reverse ? b.localeCompare(a) : a.localeCompare(b);
    });

    return { stdout: lines.join("\n") + (lines.length > 0 ? "\n" : ""), stderr: "", exitCode: 0 };
  }

  private handleUniq(args: string[], stdin: string): CommandOutput {
    const count = args.includes("-c");
    const file = args.find((a) => !a.startsWith("-"));

    let content = stdin;
    if (file) {
      const read = this.vfs.readFile(file, this.session.cwd);
      if (read.error) return { stdout: "", stderr: `uniq: ${file}: ${read.error}`, exitCode: 1 };
      content = read.content ?? "";
    }

    const lines = content.split("\n").filter((l) => l.trim().length > 0);
    const result: string[] = [];
    let prev = "";
    let tally = 0;

    for (const l of lines) {
      if (l === prev) {
        tally++;
      } else {
        if (tally > 0) {
          result.push(count ? `   ${tally} ${prev}` : prev);
        }
        prev = l;
        tally = 1;
      }
    }
    if (tally > 0) {
      result.push(count ? `   ${tally} ${prev}` : prev);
    }

    return { stdout: result.join("\n") + (result.length > 0 ? "\n" : ""), stderr: "", exitCode: 0 };
  }

  private handleDu(args: string[]): CommandOutput {
    const target = args.find((a) => !a.startsWith("-")) || this.session.cwd;
    if (target.includes("/var")) {
      return {
        stdout: `512M\t/var/log\n256M\t/var/cache\n128M\t/var/lib\n64M\t/var/spool\n16M\t/var/tmp\n976M\t/var\n`,
        stderr: "",
        exitCode: 0,
      };
    }
    return {
      stdout: `4.0K\t${target}\n`,
      stderr: "",
      exitCode: 0,
    };
  }

  private handleTr(args: string[], stdin: string): CommandOutput {
    let deleteChars = false;
    let complement = false;
    let pattern = "";

    for (let i = 0; i < args.length; i++) {
      if (args[i] === "-d") deleteChars = true;
      else if (args[i] === "-c") complement = true;
      else if (args[i] === "-dc" || args[i] === "-cd") {
        deleteChars = true;
        complement = true;
      } else if (!pattern) {
        pattern = args[i];
      }
    }

    if (deleteChars && complement && pattern.includes("0-9")) {
      const digitsOnly = stdin.replace(/[^0-9]/g, "");
      return { stdout: `${digitsOnly}\n`, stderr: "", exitCode: 0 };
    }

    return { stdout: stdin, stderr: "", exitCode: 0 };
  }

  private handleDf(args: string[]): CommandOutput {
    if (args.includes("--output=pcent")) {
      return { stdout: "Use%\n 15%\n", stderr: "", exitCode: 0 };
    }
    return {
      stdout:
        "Filesystem              Size  Used Avail Use% Mounted on\n/dev/mapper/cs-root      50G  7.5G   42G  15% /\ndevtmpfs                3.8G     0  3.8G   0% /dev\ntmpfs                   3.9G     0  3.9G   0% /dev/shm\n/dev/sda1               960M  280M  680M  30% /boot\n",
      stderr: "",
      exitCode: 0,
    };
  }

  private handleFind(args: string[]): CommandOutput {
    const searchDir = args[0] && !args[0].startsWith("-") ? args[0] : this.session.cwd;
    let namePattern: RegExp | undefined;

    for (let i = 0; i < args.length; i++) {
      if (args[i] === "-name" && args[i + 1]) {
        const p = args[i + 1].replace(/\*/g, ".*").replace(/\?/g, ".");
        namePattern = new RegExp(`^${p}$`);
      }
    }

    const results: string[] = [];
    const traverse = (path: string) => {
      const node = this.vfs.getNode(path);
      if (!node) return;

      if (!namePattern || namePattern.test(node.name)) {
        results.push(path);
      }

      if (node.type === "dir" && node.children) {
        for (const child of node.children.values()) {
          const childPath = path === "/" ? `/${child.name}` : `${path}/${child.name}`;
          traverse(childPath);
        }
      }
    };

    const resolved = this.vfs.resolvePath(searchDir, this.session.cwd);
    traverse(resolved);

    // Realistic find fallback for /var/log queries
    if (results.length === 0 && searchDir.includes("/var/log")) {
      return {
        stdout: `/var/log/messages\n/var/log/audit/audit.log\n/var/log/secure\n`,
        stderr: "",
        exitCode: 0,
      };
    }

    return { stdout: results.join("\n") + (results.length > 0 ? "\n" : ""), stderr: "", exitCode: 0 };
  }

  private handleEcho(args: string[]): CommandOutput {
    let noNewline = false;
    let cleanArgs = [...args];
    if (cleanArgs[0] === "-n") {
      noNewline = true;
      cleanArgs = cleanArgs.slice(1);
    }
    const text = cleanArgs
      .join(" ")
      .replace(/\$USER/g, this.session.username)
      .replace(/\$HOME/g, this.session.homeDir)
      .replace(/\$HOSTNAME/g, this.session.hostname)
      .replace(/\$PATH/g, this.session.env.PATH);

    return { stdout: text + (noNewline ? "" : "\n"), stderr: "", exitCode: 0 };
  }

  private handleChmod(args: string[]): CommandOutput {
    if (args.length < 2) return { stdout: "", stderr: "chmod: missing operand", exitCode: 1 };
    const [mode, file] = args;
    const res = this.vfs.chmod(file, mode, this.session.cwd);
    if (!res.success) return { stdout: "", stderr: `chmod: ${res.error}`, exitCode: 1 };
    return { stdout: "", stderr: "", exitCode: 0 };
  }

  private handleChown(args: string[]): CommandOutput {
    if (args.length < 2) return { stdout: "", stderr: "chown: missing operand", exitCode: 1 };
    const [owner, file] = args;
    const res = this.vfs.chown(file, owner, this.session.cwd);
    if (!res.success) return { stdout: "", stderr: `chown: ${res.error}`, exitCode: 1 };
    return { stdout: "", stderr: "", exitCode: 0 };
  }

  private handleChgrp(args: string[]): CommandOutput {
    if (args.length < 2) return { stdout: "", stderr: "chgrp: missing operand", exitCode: 1 };
    const [group, file] = args;
    const res = this.vfs.chown(file, `:${group}`, this.session.cwd);
    if (!res.success) return { stdout: "", stderr: `chgrp: ${res.error}`, exitCode: 1 };
    return { stdout: "", stderr: "", exitCode: 0 };
  }

  private handleTree(target = "."): CommandOutput {
    const root = this.vfs.getNode(target, this.session.cwd);
    if (!root) return { stdout: "", stderr: `${target} [error opening dir]`, exitCode: 1 };

    const lines: string[] = [target];
    let dirCount = 0;
    let fileCount = 0;

    const buildTree = (node: VFSNode, prefix: string) => {
      if (node.type !== "dir" || !node.children) return;
      const items = Array.from(node.children.values()).sort((a, b) => a.name.localeCompare(b.name));

      items.forEach((item, index) => {
        const isLast = index === items.length - 1;
        const branch = isLast ? "└── " : "├── ";
        lines.push(`${prefix}${branch}${item.name}`);

        if (item.type === "dir") {
          dirCount++;
          buildTree(item, prefix + (isLast ? "    " : "│   "));
        } else {
          fileCount++;
        }
      });
    };

    buildTree(root, "");
    lines.push(`\n${dirCount} directories, ${fileCount} files`);
    return { stdout: lines.join("\n") + "\n", stderr: "", exitCode: 0 };
  }

  private handleWc(args: string[], stdin: string): CommandOutput {
    const linesOnly = args.includes("-l");
    const file = args.find((a) => !a.startsWith("-"));

    let text = stdin;
    if (file) {
      const read = this.vfs.readFile(file, this.session.cwd);
      if (read.error) return { stdout: "", stderr: `wc: ${file}: ${read.error}`, exitCode: 1 };
      text = read.content ?? "";
    }

    let lineCount = 0;
    for (let i = 0; i < text.length; i++) {
      if (text[i] === "\n") lineCount++;
    }
    if (lineCount === 0 && text.trim().length > 0) {
      lineCount = text.split("\n").filter(Boolean).length;
    }

    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const bytes = text.length;

    if (linesOnly) {
      return { stdout: `${lineCount}${file ? ` ${file}` : ""}\n`, stderr: "", exitCode: 0 };
    }
    return { stdout: ` ${lineCount}  ${words} ${bytes}${file ? ` ${file}` : ""}\n`, stderr: "", exitCode: 0 };
  }

  private handleStat(target: string): CommandOutput {
    if (!target) return { stdout: "", stderr: "stat: missing operand", exitCode: 1 };
    const node = this.vfs.getNode(target, this.session.cwd);
    if (!node) return { stdout: "", stderr: `stat: cannot stat '${target}': No such file or directory`, exitCode: 1 };

    return {
      stdout: `  File: ${node.name}\n  Size: ${node.size}        Blocks: 8          IO Block: 4096   ${node.type === "dir" ? "directory" : "regular file"}\nDevice: fd00h/64768d    Inode: 1048576     Links: 1\nAccess: (${node.permissions})  Uid: (${node.owner})   Gid: (${node.group})\nAccess: 2026-09-21 00:00:00.000000000 +0800\nModify: 2026-09-21 00:00:00.000000000 +0800\nChange: 2026-09-21 00:00:00.000000000 +0800\n`,
      stderr: "",
      exitCode: 0,
    };
  }

  private handleSu(targetUser = "root"): CommandOutput {
    const cleanUser = targetUser.replace(/^-+/, "") || "root";
    if (cleanUser === "root") {
      this.session.username = "root";
      this.session.uid = 0;
      this.session.gid = 0;
      this.session.group = "root";
      this.session.groups = ["root"];
      this.session.homeDir = "/root";
      this.session.cwd = "/root";
      this.session.env.USER = "root";
      this.session.env.HOME = "/root";
    } else {
      this.session.username = cleanUser;
      this.session.uid = 1000;
      this.session.gid = 1000;
      this.session.group = cleanUser;
      this.session.groups = [cleanUser];
      this.session.homeDir = `/home/${cleanUser}`;
      this.session.cwd = `/home/${cleanUser}`;
      this.session.env.USER = cleanUser;
      this.session.env.HOME = `/home/${cleanUser}`;
    }
    return { stdout: "", stderr: "", exitCode: 0 };
  }

  private handleUseradd(args: string[]): CommandOutput {
    let group = "users";
    const supplementaryGroups: string[] = [];
    let createHome = true;
    let username = "";
    let uid = 1000 + Math.floor(Math.random() * 8000);
    let shell = "/bin/bash";
    let comment = "";

    for (let i = 0; i < args.length; i++) {
      if (args[i] === "-u" && args[i + 1]) {
        uid = parseInt(args[++i], 10);
      } else if (args[i] === "-g" && args[i + 1]) {
        group = args[++i];
      } else if (args[i] === "-G" && args[i + 1]) {
        supplementaryGroups.push(...args[++i].split(","));
      } else if (args[i] === "-s" && args[i + 1]) {
        shell = args[++i];
      } else if (args[i] === "-c" && args[i + 1]) {
        comment = args[++i];
      } else if (args[i] === "-M") {
        createHome = false;
      } else if (!args[i].startsWith("-")) {
        username = args[i];
      }
    }

    if (!username) return { stdout: "", stderr: "useradd: missing username", exitCode: 1 };

    const entry = `${username}:x:${uid}:${uid}:${comment}:/home/${username}:${shell}\n`;
    this.vfs.writeFile("/etc/passwd", entry, "/", { append: true });
    this.vfs.writeFile("/etc/group", `${username}:x:${uid}:\n`, "/", { append: true });

    // Add to supplementary groups in /etc/group
    if (supplementaryGroups.length > 0) {
      const groupContent = this.vfs.readFile("/etc/group").content || "";
      const lines = groupContent.split("\n");
      const updated = lines.map((l) => {
        const [gName, gPass, gGid, gMembers] = l.split(":");
        if (supplementaryGroups.includes(gName)) {
          const members = gMembers ? `${gMembers},${username}` : username;
          return `${gName}:${gPass}:${gGid}:${members}`;
        }
        return l;
      });
      this.vfs.writeFile("/etc/group", updated.join("\n"), "/");
    }

    if (createHome) {
      this.vfs.mkdir(`/home/${username}`, "/", { owner: username, group, permissions: "rwxr-x---" });
    }

    return { stdout: "", stderr: "", exitCode: 0 };
  }

  private handleUsermod(args: string[]): CommandOutput {
    const appendGroups: string[] = [];
    let username = "";
    let lock = false;

    for (let i = 0; i < args.length; i++) {
      if ((args[i] === "-aG" || args[i] === "-G") && args[i + 1]) {
        appendGroups.push(...args[++i].split(","));
      } else if (args[i] === "-L" || args[i] === "-l") {
        lock = true;
      } else if (!args[i].startsWith("-")) {
        username = args[i];
      }
    }

    if (!username) return { stdout: "", stderr: "usermod: missing username", exitCode: 1 };

    if (lock) {
      const ag = this.userAging.get(username) || {};
      ag.locked = true;
      this.userAging.set(username, ag);
    }

    if (appendGroups.length > 0) {
      const groupContent = this.vfs.readFile("/etc/group").content || "";
      const lines = groupContent.split("\n");
      const updated = lines.map((l) => {
        const [gName, gPass, gGid, gMembers] = l.split(":");
        if (appendGroups.includes(gName)) {
          const members = gMembers ? `${gMembers},${username}` : username;
          return `${gName}:${gPass}:${gGid}:${members}`;
        }
        return l;
      });
      this.vfs.writeFile("/etc/group", updated.join("\n"), "/");
    }

    return { stdout: "", stderr: "", exitCode: 0 };
  }

  private handleUserdel(args: string[]): CommandOutput {
    const user = args.find((a) => !a.startsWith("-"));
    if (!user) return { stdout: "", stderr: "userdel: missing username", exitCode: 1 };
    return { stdout: "", stderr: "", exitCode: 0 };
  }

  private handleGroupadd(args: string[]): CommandOutput {
    const group = args.find((a) => !a.startsWith("-"));
    if (!group) return { stdout: "", stderr: "groupadd: missing group name", exitCode: 1 };
    const curGroup = this.vfs.readFile("/etc/group").content || "";
    if (curGroup.includes(`${group}:`)) {
      if (args.includes("-f")) return { stdout: "", stderr: "", exitCode: 0 };
      return { stdout: "", stderr: `groupadd: group '${group}' already exists`, exitCode: 9 };
    }
    const gid = 1000 + Math.floor(Math.random() * 8000);
    this.vfs.writeFile("/etc/group", `${group}:x:${gid}:\n`, "/", { append: true });
    return { stdout: "", stderr: "", exitCode: 0 };
  }

  private handleGroupdel(args: string[]): CommandOutput {
    const group = args.find((a) => !a.startsWith("-"));
    if (!group) return { stdout: "", stderr: "groupdel: missing group name", exitCode: 1 };
    return { stdout: "", stderr: "", exitCode: 0 };
  }

  private handleChage(args: string[]): CommandOutput {
    let user = "";
    const meta: { maxDays?: number; minDays?: number; warnAge?: number; lastChange?: number; expireDate?: string } = {};

    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      if (a === "-M" && args[i + 1]) meta.maxDays = parseInt(args[++i], 10);
      else if (a === "-m" && args[i + 1]) meta.minDays = parseInt(args[++i], 10);
      else if (a === "-W" && args[i + 1]) meta.warnAge = parseInt(args[++i], 10);
      else if (a === "-d" && args[i + 1]) meta.lastChange = parseInt(args[++i], 10);
      else if (a === "-E" && args[i + 1]) meta.expireDate = args[++i];
      else if (!a.startsWith("-")) user = a;
    }

    if (!user) return { stdout: "", stderr: "chage: missing user argument", exitCode: 1 };

    const existing = this.userAging.get(user) || { maxDays: 99999, minDays: 0, warnAge: 7, lastChange: 19500 };
    Object.assign(existing, meta);
    this.userAging.set(user, existing);

    if (args.includes("-l")) {
      return {
        stdout: `Last password change\t\t\t\t\t: ${existing.lastChange === 0 ? "password must be changed" : "Sep 21, 2026"}\nPassword expires\t\t\t\t\t: never\nPassword inactive\t\t\t\t\t: never\nAccount expires\t\t\t\t\t\t: ${existing.expireDate || "never"}\nMinimum number of days between password change\t\t: ${existing.minDays ?? 0}\nMaximum number of days between password change\t\t: ${existing.maxDays ?? 99999}\nNumber of days of warning before password expires\t: ${existing.warnAge ?? 7}\n`,
        stderr: "",
        exitCode: 0,
      };
    }
    return { stdout: "", stderr: "", exitCode: 0 };
  }

  private handleChpasswd(_args: string[], stdin: string): CommandOutput {
    const lines = stdin.split("\n").filter((l) => l.includes(":"));
    for (const l of lines) {
      const [u] = l.split(":");
      if (u) {
        const ag = this.userAging.get(u) || { maxDays: 99999, minDays: 0, warnAge: 7 };
        ag.lastChange = 19500;
        this.userAging.set(u, ag);
      }
    }
    return { stdout: "", stderr: "", exitCode: 0 };
  }

  private handleGetent(args: string[]): CommandOutput {
    const db = args[0];
    const key = args[1];
    if (db === "group") {
      const grp = this.vfs.readFile("/etc/group").content || "";
      const match = grp.split("\n").find((l) => l.startsWith(`${key}:`));
      if (match) return { stdout: `${match}\n`, stderr: "", exitCode: 0 };
      return { stdout: "", stderr: "", exitCode: 2 };
    }
    if (db === "passwd") {
      const pwd = this.vfs.readFile("/etc/passwd").content || "";
      const match = pwd.split("\n").find((l) => l.startsWith(`${key}:`));
      if (match) return { stdout: `${match}\n`, stderr: "", exitCode: 0 };
      return { stdout: "", stderr: "", exitCode: 2 };
    }
    return { stdout: "", stderr: "", exitCode: 0 };
  }

  private handleHostnamectl(args: string[]): CommandOutput {
    if (args[0] === "set-hostname" && args[1]) {
      const newHost = args[1].trim();
      this.session.hostname = newHost;
      this.session.env.HOSTNAME = newHost;
      this.vfs.writeFile("/etc/hostname", `${newHost}\n`, "/");
      return { stdout: "", stderr: "", exitCode: 0 };
    }
    return {
      stdout: ` Static hostname: ${this.session.hostname}\n       Icon name: computer-vm\n         Chassis: vm\n      Machine ID: e9823f6e80b24050a4bf91295b927ac0\n         Boot ID: 41bfa491741e428c9ce9394bf34a9ef1\n  Virtualization: vmware\nOperating System: CentOS Stream 9\n     CPE OS Name: cpe:/o:centos:centos:9\n          Kernel: Linux 5.14.0-362.el9.x86_64\n    Architecture: x86-64\n`,
      stderr: "",
      exitCode: 0,
    };
  }

  private handleNmcli(args: string[]): CommandOutput {
    const sub = args[0] || "";
    if (sub === "con" || sub === "connection") {
      const act = args[1] || "show";
      if (act === "show") {
        return {
          stdout: `NAME   UUID                                  TYPE      DEVICE\nens33  2b6510f8-e9f8-4e3a-9694-55bf3dfb52b2  ethernet  ens33\nlo     4a123bc4-1234-5678-9abc-def012345678  loopback  lo\n`,
          stderr: "",
          exitCode: 0,
        };
      }
      if (act === "mod" || act === "modify") {
        const iface = args[2] || "ens33";
        const cfg = this.networkInterfaces.get(iface) || {
          method: "auto",
          ip: "192.168.10.50/24",
          gateway: "192.168.10.1",
          dns: "8.8.8.8",
          autoconnect: true,
          up: true,
        };
        for (let i = 3; i < args.length; i++) {
          if (args[i] === "ipv4.method" && args[i + 1]) cfg.method = args[++i];
          else if (args[i] === "ipv4.addresses" && args[i + 1]) cfg.ip = args[++i];
          else if (args[i] === "ipv4.gateway" && args[i + 1]) cfg.gateway = args[++i];
          else if (args[i] === "ipv4.dns" && args[i + 1]) cfg.dns = args[++i];
          else if (args[i] === "connection.autoconnect" && args[i + 1]) cfg.autoconnect = args[++i] === "yes";
        }
        this.networkInterfaces.set(iface, cfg);
        return { stdout: "", stderr: "", exitCode: 0 };
      }
      if (act === "up" || act === "down") {
        return {
          stdout: `Connection successfully ${act === "up" ? "activated" : "deactivated"} (D-Bus active path: /org/freedesktop/NetworkManager/ActiveConnection/1)\n`,
          stderr: "",
          exitCode: 0,
        };
      }
    }
    return { stdout: "", stderr: "", exitCode: 0 };
  }

  private handleSystemctl(args: string[]): CommandOutput {
    if (args.includes("--failed")) {
      return {
        stdout: `  UNIT LOAD ACTIVE SUB DESCRIPTION\n0 loaded units listed.\n`,
        stderr: "",
        exitCode: 0,
      };
    }
    if (args.includes("list-unit-files")) {
      return {
        stdout: `UNIT FILE                                  STATE           VENDOR PRESET\nchronyd.service                            enabled         enabled\nfirewalld.service                          enabled         enabled\nhttpd.service                              ${this.servicesState.get("httpd")?.enabled ? "enabled" : "disabled"}        disabled\nnginx.service                              ${this.servicesState.get("nginx")?.enabled ? "enabled" : "disabled"}        disabled\nsshd.service                               enabled         enabled\npostfix.service                            ${this.servicesState.get("postfix")?.enabled ? "enabled" : "disabled"}        enabled\n\n6 unit files listed.\n`,
        stderr: "",
        exitCode: 0,
      };
    }

    const action = args[0] ?? "";
    if (action === "daemon-reload") {
      return { stdout: "", stderr: "", exitCode: 0 };
    }

    const cleanArgs = args.filter((a) => !a.startsWith("-"));
    const serviceName = (cleanArgs[1] ?? "").replace(/\.(service|timer)$/, "");
    const isNow = args.includes("--now");

    if (!action) return { stdout: "", stderr: "systemctl: missing action", exitCode: 1 };
    if (!serviceName && action !== "daemon-reload") {
      return { stdout: "", stderr: "systemctl: missing service name", exitCode: 1 };
    }

    const state = this.servicesState.get(serviceName) ?? { active: false, enabled: false, masked: false };

    switch (action) {
      case "status": {
        const activeText = state.active ? "active (running)" : state.masked ? "masked" : "inactive (dead)";
        const colorIndicator = state.active ? "●" : "○";
        return {
          stdout: `${colorIndicator} ${serviceName}.service - ${serviceName.toUpperCase()} Server Daemon\n     Loaded: loaded (/usr/lib/systemd/system/${serviceName}.service; ${state.enabled ? "enabled" : "disabled"}; preset: disabled)\n     Active: ${activeText} since Sun 2026-09-21 00:00:04 PHT; 2h 45min ago\n   Main PID: ${state.active ? 842 : 0} (${serviceName})\n      Tasks: 1 (limit: 4684)\n     Memory: 6.8M\n        CPU: 12ms\n     CGroup: /system.slice/${serviceName}.service\n             └─842 /usr/sbin/${serviceName} -D\n`,
          stderr: "",
          exitCode: state.active ? 0 : 3,
        };
      }
      case "start":
        if (state.masked) {
          return { stdout: "", stderr: `Failed to start ${serviceName}.service: Unit ${serviceName}.service is masked.`, exitCode: 1 };
        }
        state.active = true;
        this.servicesState.set(serviceName, state);
        return { stdout: "", stderr: "", exitCode: 0 };
      case "stop":
        state.active = false;
        this.servicesState.set(serviceName, state);
        return { stdout: "", stderr: "", exitCode: 0 };
      case "restart":
        if (state.masked) {
          return { stdout: "", stderr: `Failed to restart ${serviceName}.service: Unit ${serviceName}.service is masked.`, exitCode: 1 };
        }
        state.active = true;
        this.servicesState.set(serviceName, state);
        return { stdout: "", stderr: "", exitCode: 0 };
      case "enable":
        state.enabled = true;
        if (isNow) state.active = true;
        this.servicesState.set(serviceName, state);
        return {
          stdout: `Created symlink /etc/systemd/system/multi-user.target.wants/${serviceName}.service → /usr/lib/systemd/system/${serviceName}.service.\n`,
          stderr: "",
          exitCode: 0,
        };
      case "disable":
        state.enabled = false;
        if (isNow) state.active = false;
        this.servicesState.set(serviceName, state);
        return {
          stdout: `Removed /etc/systemd/system/multi-user.target.wants/${serviceName}.service.\n`,
          stderr: "",
          exitCode: 0,
        };
      case "mask":
        state.masked = true;
        state.enabled = false;
        state.active = false;
        this.servicesState.set(serviceName, state);
        return {
          stdout: `Created symlink /etc/systemd/system/${serviceName}.service → /dev/null.\n`,
          stderr: "",
          exitCode: 0,
        };
      case "unmask":
        state.masked = false;
        this.servicesState.set(serviceName, state);
        return {
          stdout: `Removed /etc/systemd/system/${serviceName}.service.\n`,
          stderr: "",
          exitCode: 0,
        };
      case "is-active":
        return { stdout: `${state.active ? "active" : "inactive"}\n`, stderr: "", exitCode: state.active ? 0 : 3 };
      case "is-enabled":
        return { stdout: `${state.enabled ? "enabled" : "disabled"}\n`, stderr: "", exitCode: state.enabled ? 0 : 1 };
      default:
        return { stdout: "", stderr: `Unknown systemctl command: ${action}`, exitCode: 1 };
    }
  }

  private handleService(args: string[]): CommandOutput {
    const [name, action] = args;
    if (!name || !action) return { stdout: "", stderr: "Usage: service <name> <action>", exitCode: 1 };
    return this.handleSystemctl([action, name]);
  }

  private handleJournalctl(args: string[]): CommandOutput {
    const lines = [
      "Sep 21 00:00:01 centos-trainer systemd[1]: Starting System Logging Service...",
      "Sep 21 00:00:02 centos-trainer systemd[1]: Started System Logging Service.",
      "Sep 21 00:00:03 centos-trainer kernel: Linux version 5.14.0-362.el9.x86_64",
      "Sep 21 00:00:04 centos-trainer systemd[1]: Reached target Network.",
      "Sep 21 00:00:05 centos-trainer sshd[842]: Server listening on 0.0.0.0 port 22.",
    ];
    if (args.includes("-u")) {
      const uIdx = args.indexOf("-u");
      const unit = args[uIdx + 1] ?? "httpd";
      return {
        stdout: `-- Logs begin at Sun 2026-09-21 00:00:00 PHT. --\nSep 21 00:00:05 centos-trainer ${unit}[842]: Starting daemon service...\nSep 21 00:00:06 centos-trainer ${unit}[842]: Started service successfully.\n`,
        stderr: "",
        exitCode: 0,
      };
    }
    return { stdout: lines.join("\n") + "\n", stderr: "", exitCode: 0 };
  }

  private handleIp(args: string[]): CommandOutput {
    const sub = args[0] ?? "";
    if (sub === "a" || sub === "addr" || sub === "address" || (sub === "-4" && args[1]?.startsWith("addr"))) {
      return {
        stdout: `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000\n    inet 127.0.0.1/8 scope host lo\n       valid_lft forever preferred_lft forever\n2: ens33: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000\n    inet 192.168.122.100/24 brd 192.168.122.255 scope global dynamic noprefixroute ens33\n       valid_lft 86123sec preferred_lft 86123sec\n`,
        stderr: "",
        exitCode: 0,
      };
    }
    if (sub === "r" || sub === "route") {
      return {
        stdout: `default via 192.168.122.1 dev ens33 proto dhcp src 192.168.122.100 metric 100\n192.168.122.0/24 dev ens33 proto kernel scope link src 192.168.122.100 metric 100\n`,
        stderr: "",
        exitCode: 0,
      };
    }
    return { stdout: "", stderr: `Object "${sub}" is unknown, try "ip help".`, exitCode: 1 };
  }

  private handleFirewallCmd(args: string[]): CommandOutput {
    if (args.includes("--state")) {
      return { stdout: "running\n", stderr: "", exitCode: 0 };
    }
    if (args.includes("--list-all")) {
      let richRulesText = "";
      if (this.firewallRichRules.size > 0) {
        richRulesText = "\n  rich rules:\n\t" + Array.from(this.firewallRichRules).join("\n\t");
      }
      return {
        stdout: `public (active)\n  target: default\n  icmp-block-inversion: no\n  interfaces: ens33\n  sources:\n  services: ${Array.from(this.firewallServices).join(" ")}\n  ports: ${Array.from(this.firewallPorts).join(" ")}\n  protocols:\n  forward: yes\n  masquerade: no\n  forward-ports:\n  source-ports:\n  icmp-blocks:${richRulesText}\n`,
        stderr: "",
        exitCode: 0,
      };
    }

    const portArg = args.find((a) => a.startsWith("--add-port="));
    if (portArg) {
      const port = portArg.split("=")[1];
      this.firewallPorts.add(port);
      return { stdout: "success\n", stderr: "", exitCode: 0 };
    }

    const serviceArg = args.find((a) => a.startsWith("--add-service="));
    if (serviceArg) {
      const svc = serviceArg.split("=")[1];
      // Expand possible comma or brace list e.g. {http,https}
      const svcs = svc.replace(/[{}]/g, "").split(",");
      svcs.forEach((s) => this.firewallServices.add(s.trim()));
      return { stdout: "success\n", stderr: "", exitCode: 0 };
    }

    const removeServiceArg = args.find((a) => a.startsWith("--remove-service="));
    if (removeServiceArg) {
      const svc = removeServiceArg.split("=")[1];
      this.firewallServices.delete(svc);
      return { stdout: "success\n", stderr: "", exitCode: 0 };
    }

    const richRuleArg = args.find((a) => a.startsWith("--add-rich-rule="));
    if (richRuleArg) {
      const rule = richRuleArg.slice("--add-rich-rule=".length).replace(/^['"]|['"]$/g, "");
      this.firewallRichRules.add(rule);
      return { stdout: "success\n", stderr: "", exitCode: 0 };
    }

    return { stdout: "success\n", stderr: "", exitCode: 0 };
  }

  private handleYum(args: string[]): CommandOutput {
    const action = args[0] ?? "";
    const cleanArgs = args.filter((a) => !a.startsWith("-"));
    const pkg = cleanArgs[1] ?? "";

    if (action === "install") {
      this.installedPackages.add(pkg || "package");
      return {
        stdout: `CentOS Stream 9 - BaseOS                         12 MB/s | 6.8 MB     00:00\nCentOS Stream 9 - AppStream                      18 MB/s |  14 MB     00:00\nDependencies resolved.\n================================================================================\n Package          Architecture    Version                  Repository      Size\n================================================================================\nInstalling:\n ${pkg || "package"}      x86_64          1.2.0-1.el9              appstream      2.4 M\n\nTransaction Summary\n================================================================================\nInstall  1 Package\n\nTotal download size: 2.4 M\nInstalled size: 7.8 M\nDownloading Packages:\nRunning transaction check\nRunning transaction test\nTransaction test succeeded.\nRunning transaction\n  Preparing        :                                                        1/1\n  Installing       : ${pkg}-1.2.0-1.el9.x86_64                              1/1\n  Verifying        : ${pkg}-1.2.0-1.el9.x86_64                              1/1\n\nInstalled:\n  ${pkg}-1.2.0-1.el9.x86_64\n\nComplete!\n`,
        stderr: "",
        exitCode: 0,
      };
    }

    if (action === "repolist") {
      return {
        stdout: `repo id                               repo name\nappstream                             CentOS Stream 9 - AppStream\nbaseos                                CentOS Stream 9 - BaseOS\nlocal                                 Local Repo\n`,
        stderr: "",
        exitCode: 0,
      };
    }

    if (action === "clean") {
      return { stdout: "0 files removed\n", stderr: "", exitCode: 0 };
    }

    return { stdout: "Complete!\n", stderr: "", exitCode: 0 };
  }

  private handleRpm(args: string[]): CommandOutput {
    if (args.includes("-qa")) {
      let out = "";
      for (const p of this.installedPackages) {
        out += `${p}-1.0.0-1.el9.x86_64\n`;
      }
      out += "kernel-5.14.0-362.el9.x86_64\nkernel-core-5.14.0-362.el9.x86_64\nkernel-modules-5.14.0-362.el9.x86_64\n";
      return { stdout: out, stderr: "", exitCode: 0 };
    }
    if (args.includes("-qf")) {
      const file = args.find((a) => a.startsWith("/"));
      if (file?.includes("scp")) {
        return { stdout: "openssh-clients-8.7p1-34.el9.x86_64\n", stderr: "", exitCode: 0 };
      }
      return { stdout: "coreutils-8.32-34.el9.x86_64\n", stderr: "", exitCode: 0 };
    }
    if (args.includes("-ql")) {
      const pkg = args.find((a) => !a.startsWith("-")) || "bash";
      return {
        stdout: `/usr/bin/${pkg}\n/usr/share/man/man1/${pkg}.1.gz\n/usr/share/doc/${pkg}/README\n/etc/${pkg}rc\n`,
        stderr: "",
        exitCode: 0,
      };
    }
    if (args.includes("-q")) {
      const pkg = args.find((a) => !a.startsWith("-")) || "";
      if (this.installedPackages.has(pkg)) {
        return { stdout: `${pkg}-1.0.0-1.el9.x86_64\n`, stderr: "", exitCode: 0 };
      }
      return { stdout: `package ${pkg} is not installed\n`, stderr: "", exitCode: 1 };
    }
    return { stdout: `${args[1] ?? "package"}-1.0.0-1.el9.x86_64\n`, stderr: "", exitCode: 0 };
  }

  private handleTar(args: string[]): CommandOutput {
    const fIdx = args.findIndex((a) => a.includes("f"));
    const archiveName = fIdx !== -1 ? args[fIdx + 1] : "archive.tar.gz";

    if (args.some((a) => a.includes("c"))) {
      this.vfs.writeFile(archiveName, "[GZIP_TAR_ARCHIVE_DATA]", this.session.cwd);
      return { stdout: "", stderr: "", exitCode: 0 };
    }
    if (args.some((a) => a.includes("t"))) {
      return {
        stdout: "etc/\netc/passwd\netc/group\netc/hostname\netc/hosts\n",
        stderr: "",
        exitCode: 0,
      };
    }
    return { stdout: "", stderr: "", exitCode: 0 };
  }

  private handleGetenforce(): CommandOutput {
    return { stdout: `${this.selinuxMode}\n`, stderr: "", exitCode: 0 };
  }

  private handleSetenforce(args: string[]): CommandOutput {
    const val = args[0];
    if (val === "0" || val?.toLowerCase() === "permissive") {
      this.selinuxMode = "Permissive";
      return { stdout: "", stderr: "", exitCode: 0 };
    }
    if (val === "1" || val?.toLowerCase() === "enforcing") {
      this.selinuxMode = "Enforcing";
      return { stdout: "", stderr: "", exitCode: 0 };
    }
    return { stdout: "", stderr: `setenforce: invalid mode '${val}'`, exitCode: 1 };
  }

  private handleSemanage(args: string[]): CommandOutput {
    if (args[0] === "port") {
      if (args[1] === "-a" || args[1] === "--add") {
        let port = 0;
        let type = "";
        for (let i = 2; i < args.length; i++) {
          if (args[i] === "-t" && args[i + 1]) type = args[++i];
          else if (args[i] === "-p") i++;
          else if (/^\d+$/.test(args[i])) port = parseInt(args[i], 10);
        }
        if (port) this.selinuxPorts.set(port, type || "ssh_port_t");
        return { stdout: "", stderr: "", exitCode: 0 };
      }
      if (args[1] === "-l" || args[1] === "--list") {
        let out = "SELinux Port       Type       Protocol   Port Number\nssh_port_t         tcp        22";
        for (const [p] of this.selinuxPorts.entries()) {
          out += `, ${p}`;
        }
        return { stdout: `${out}\n`, stderr: "", exitCode: 0 };
      }
    }
    return { stdout: "", stderr: "", exitCode: 0 };
  }

  private handleSetfacl(args: string[]): CommandOutput {
    let isDefault = false;
    let spec = "";
    let target = "";

    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      if (a === "-d" || a === "--default") isDefault = true;
      else if ((a === "-m" || a === "--modify") && args[i + 1]) spec = args[++i];
      else if (!a.startsWith("-")) target = a;
    }

    if (!target) return { stdout: "", stderr: "setfacl: missing operand", exitCode: 1 };

    const resolved = this.vfs.resolvePath(target, this.session.cwd);
    const existing = this.acls.get(resolved) || { entries: [], defaultEntries: [] };
    if (isDefault) {
      if (spec && !existing.defaultEntries.includes(spec)) existing.defaultEntries.push(spec);
    } else {
      if (spec && !existing.entries.includes(spec)) existing.entries.push(spec);
    }
    this.acls.set(resolved, existing);
    return { stdout: "", stderr: "", exitCode: 0 };
  }

  private handleGetfacl(args: string[]): CommandOutput {
    const target = args.find((a) => !a.startsWith("-")) || "";
    if (!target) return { stdout: "", stderr: "getfacl: missing operand", exitCode: 1 };
    const resolved = this.vfs.resolvePath(target, this.session.cwd);
    const node = this.vfs.getNode(resolved);
    if (!node) return { stdout: "", stderr: `getfacl: ${target}: No such file or directory`, exitCode: 1 };

    const existing = this.acls.get(resolved) || { entries: [], defaultEntries: [] };
    let out = `# file: ${resolved.replace(/^\//, "")}\n# owner: ${node.owner}\n# group: ${node.group}\nuser::${node.permissions.slice(0, 3)}\n`;
    for (const e of existing.entries) {
      out += `${e}\n`;
    }
    out += `group::${node.permissions.slice(3, 6)}\nmask::rwx\nother::${node.permissions.slice(6, 9)}\n`;
    for (const d of existing.defaultEntries) {
      out += `default:${d}\n`;
    }
    return { stdout: out, stderr: "", exitCode: 0 };
  }

  private handleLsblk(_args: string[]): CommandOutput {
    let out = `NAME                  MAJ:MIN RM  SIZE RO TYPE MOUNTPOINTS\nsda                     8:0    0   20G  0 disk \n├─sda1                  8:1    0    1G  0 part /boot\n└─sda2                  8:2    0   19G  0 part \n  ├─cs-root           253:0    0   17G  0 lvm  /\n  └─cs-swap           253:1    0    2G  0 lvm  [SWAP]\nsdb                     8:16   0    1G  0 disk \n`;
    for (const [lv, info] of this.lvm.lvs.entries()) {
      out += `└─${info.vg}-${lv}        253:2    0  ${info.size}  0 lvm  ${info.mounted || ""}\n`;
    }
    out += `sr0                    11:0    1  1.2G  0 rom  /mnt/cdrom\n`;
    return { stdout: out, stderr: "", exitCode: 0 };
  }

  private handleBlkid(args: string[]): CommandOutput {
    const dev = args[0] || "";
    if (dev.includes("lvdata") || dev.includes("vgdata")) {
      return {
        stdout: `/dev/mapper/vgdata-lvdata: UUID="4f8a12e3-b9c1-482a-a92c-882df31c99a1" BLOCK_SIZE="512" TYPE="xfs"\n`,
        stderr: "",
        exitCode: 0,
      };
    }
    return {
      stdout: `/dev/sda1: UUID="3a2b1c0d-4e5f-6a7b-8c9d-0e1f2a3b4c5d" TYPE="xfs"\n/dev/sda2: UUID="f9e8d7c6-b5a4-3210-fedc-ba9876543210" TYPE="LVM2_member"\n/dev/sdb: UUID="e4a2d8f1-9b3c-4e7a-a1b2-c3d4e5f60718" TYPE="LVM2_member"\n/dev/mapper/cs-root: UUID="11223344-5566-7788-99aa-bbccddeeff00" TYPE="xfs"\n`,
      stderr: "",
      exitCode: 0,
    };
  }

  private handlePvcreate(args: string[]): CommandOutput {
    const dev = args.find((a) => !a.startsWith("-")) || "/dev/sdb";
    this.lvm.pvs.add(dev);
    return { stdout: `  Physical volume "${dev}" successfully created.\n`, stderr: "", exitCode: 0 };
  }

  private handleVgcreate(args: string[]): CommandOutput {
    const vg = args[0];
    const pv = args[1] || "/dev/sdb";
    if (!vg) return { stdout: "", stderr: "vgcreate: missing volume group name", exitCode: 1 };
    this.lvm.vgs.set(vg, pv);
    return { stdout: `  Volume group "${vg}" successfully created\n`, stderr: "", exitCode: 0 };
  }

  private handleLvcreate(args: string[]): CommandOutput {
    let size = "500M";
    let name = "lvdata";
    let vg = "vgdata";
    for (let i = 0; i < args.length; i++) {
      if (args[i] === "-L" && args[i + 1]) size = args[++i];
      else if (args[i] === "-n" && args[i + 1]) name = args[++i];
      else if (!args[i].startsWith("-")) vg = args[i];
    }
    this.lvm.lvs.set(name, { vg, size, xfs: false });
    return { stdout: `  Logical volume "${name}" created.\n`, stderr: "", exitCode: 0 };
  }

  private handleLvextend(args: string[]): CommandOutput {
    let resizeFs = args.includes("-r");
    let target = "lvdata";
    for (let i = 0; i < args.length; i++) {
      if (args[i] === "-L" && args[i + 1]) i++;
      else if (!args[i].startsWith("-")) target = args[i];
    }
    const lvName = target.split("/").pop() || "lvdata";
    const lv = this.lvm.lvs.get(lvName);
    if (lv) {
      lv.size = "700M";
    }
    let msg = `  Size of logical volume ${target} changed from 500.00 MiB to 700.00 MiB.\n  Logical volume ${target} successfully resized.\n`;
    if (resizeFs) {
      msg += `meta-data=/dev/mapper/vgdata-lvdata isize=512    agcount=4, agsize=32000 blks\ndata     =                       bsize=4096   blocks=179200, imaxpct=25\n`;
    }
    return { stdout: msg, stderr: "", exitCode: 0 };
  }

  private handleMkfsXfs(args: string[]): CommandOutput {
    const dev = args[0] || "";
    const lvName = dev.split("/").pop() || "lvdata";
    const lv = this.lvm.lvs.get(lvName);
    if (lv) lv.xfs = true;
    return {
      stdout: `meta-data=${dev} isize=512    agcount=4, agsize=32000 blks\n         =                       sectsz=512   attr=2, projid32bit=1\ndata     =                       bsize=4096   blocks=128000, imaxpct=25\n`,
      stderr: "",
      exitCode: 0,
    };
  }

  private handleMount(args: string[]): CommandOutput {
    if (args.includes("-a")) {
      const fstab = this.vfs.readFile("/etc/fstab").content || "";
      if (fstab.includes("/mnt/cdrom")) {
        this.vfs.mkdir("/mnt/cdrom", "/", { recursive: true });
        this.mounts.set("/mnt/cdrom", { device: "/dev/sr0", fstype: "iso9660", options: "ro" });
      }
      if (fstab.includes("/data")) {
        this.vfs.mkdir("/data", "/", { recursive: true });
        this.mounts.set("/data", { device: "/dev/vgdata/lvdata", fstype: "xfs", options: "defaults" });
        const lv = this.lvm.lvs.get("lvdata");
        if (lv) lv.mounted = "/data";
      }
      return { stdout: "", stderr: "", exitCode: 0 };
    }
    let out = `/dev/mapper/cs-root on / type xfs (rw,relatime,seclabel,attr2,inode64,logbufs=8,logbsize=32k,noquota)\n/dev/sda1 on /boot type xfs (rw,relatime,seclabel,attr2,inode64,logbufs=8,logbsize=32k,noquota)\n`;
    for (const [mp, m] of this.mounts.entries()) {
      out += `${m.device} on ${mp} type ${m.fstype} (${m.options})\n`;
    }
    return { stdout: out, stderr: "", exitCode: 0 };
  }

  private handleSshd(args: string[]): CommandOutput {
    if (args.includes("-t")) {
      return { stdout: "", stderr: "", exitCode: 0 };
    }
    return { stdout: "OpenSSH_8.7p1, OpenSSL 3.0.7 1 Nov 2022\n", stderr: "", exitCode: 0 };
  }

  private handleVisudo(args: string[]): CommandOutput {
    if (args.includes("-c") || args.includes("-cf")) {
      const file = args.find((a) => a.includes("/") || a.includes("sudoers")) || "/etc/sudoers";
      return { stdout: `${file}: parsed OK\n`, stderr: "", exitCode: 0 };
    }
    return { stdout: "", stderr: "", exitCode: 0 };
  }

  private handleDiff(_args: string[]): CommandOutput {
    return { stdout: "", stderr: "", exitCode: 0 };
  }

  private handleSleep(_args: string[]): CommandOutput {
    return { stdout: "", stderr: "", exitCode: 0 };
  }

  private handleXargs(args: string[], stdin: string): CommandOutput {
    const cleanArgs = args.filter((a) => !a.startsWith("-"));
    const cmd = cleanArgs[0];
    const rest = cleanArgs.slice(1);
    if (!cmd) return { stdout: "", stderr: "", exitCode: 0 };
    const items = stdin.trim().split(/\s+/).filter(Boolean);
    if (items.length === 0) return { stdout: "", stderr: "", exitCode: 0 };
    return this.execute(`${cmd} ${rest.join(" ")} ${items.join(" ")}`);
  }

  private handleScriptExecution(scriptPath: string, args: string[]): CommandOutput {
    const node = this.vfs.getNode(scriptPath, this.session.cwd);
    if (!node) {
      return { stdout: "", stderr: `bash: ${scriptPath}: No such file or directory`, exitCode: 127 };
    }

    if (scriptPath.includes("info.sh")) {
      return {
        stdout: `Host: ${this.session.hostname}\nDate: ${new Date().toUTCString()}\nUser: ${this.session.username}\n`,
        stderr: "",
        exitCode: 0,
      };
    }
    if (scriptPath.includes("greet.sh")) {
      if (args.length === 0) {
        return { stdout: "Usage: greet.sh <name>\n", stderr: "", exitCode: 1 };
      }
      return { stdout: `Hello, ${args[0]}!\n`, stderr: "", exitCode: 0 };
    }
    if (scriptPath.includes("mkusers.sh")) {
      for (let i = 1; i <= 5; i++) {
        this.vfs.mkdir(`/data/user${i}`, "/", { recursive: true });
        this.vfs.writeFile(`/data/user${i}/welcome.txt`, `Welcome, user${i}\n`, "/");
      }
      return { stdout: "Created user directories 1 through 5\n", stderr: "", exitCode: 0 };
    }
    if (scriptPath.includes("diskcheck.sh")) {
      const threshold = parseInt(args[0] || "80", 10);
      const usage = 15;
      if (usage >= threshold) {
        return { stdout: `WARNING: / is at ${usage}%\n`, stderr: "", exitCode: 1 };
      }
      return { stdout: `OK: / is at ${usage}%\n`, stderr: "", exitCode: 0 };
    }
    if (scriptPath.includes("backup.sh")) {
      const stamp = new Date().toISOString().replace(/[-:T.]/g, "").slice(0, 14);
      this.vfs.mkdir("/backup", "/", { recursive: true });
      this.vfs.writeFile(`/backup/etc_${stamp}.tar.gz`, "BACKUP_DATA", "/");
      this.vfs.writeFile(
        "/var/log/backup.log",
        `2026-09-21 02:00:00 SUCCESS /backup/etc_${stamp}.tar.gz\n`,
        "/",
        { append: true }
      );
      return { stdout: "", stderr: "", exitCode: 0 };
    }

    return { stdout: "", stderr: "", exitCode: 0 };
  }
}
