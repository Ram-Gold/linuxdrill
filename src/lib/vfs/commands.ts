import { VirtualFileSystem } from "./VirtualFileSystem";
import type { CommandOutput, UserSession, VFSNode } from "./types";
import { parseCommandLine, type ParsedCommand } from "./commandParser";

export class ShellContext {
  public vfs: VirtualFileSystem;
  public session: UserSession;
  public history: string[] = [];
  public previousDir = "/home/student";
  public servicesState: Map<string, { active: boolean; enabled: boolean }> = new Map();
  public firewallPorts: Set<string> = new Set(["22/tcp"]);
  public firewallServices: Set<string> = new Set(["ssh", "dhcpv6-client"]);

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

    // Initialize default service states
    this.servicesState.set("sshd", { active: true, enabled: true });
    this.servicesState.set("chronyd", { active: true, enabled: true });
    this.servicesState.set("firewalld", { active: true, enabled: true });
    this.servicesState.set("nginx", { active: false, enabled: false });
    this.servicesState.set("httpd", { active: false, enabled: false });
    this.servicesState.set("named", { active: false, enabled: false });
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
    this.session.env.USER = "student";
    this.session.env.HOME = "/home/student";
    this.servicesState.set("sshd", { active: true, enabled: true });
    this.servicesState.set("nginx", { active: false, enabled: false });
    this.servicesState.set("httpd", { active: false, enabled: false });
    this.firewallPorts = new Set(["22/tcp"]);
  }

  public execute(rawInput: string): CommandOutput {
    const trimmed = rawInput.trim();
    if (!trimmed) {
      return { stdout: "", stderr: "", exitCode: 0 };
    }

    this.history.push(trimmed);

    // Parse into command chains (&& and ;)
    const chains = parseCommandLine(trimmed);
    let lastOutput: CommandOutput = { stdout: "", stderr: "", exitCode: 0 };

    for (const chain of chains) {
      // Execute each pipeline in the chain
      for (const cmd of chain) {
        lastOutput = this.executePipeline(cmd, "");
        if (lastOutput.exitCode !== 0) {
          // Stop chain on error
          return lastOutput;
        }
      }
    }

    return lastOutput;
  }

  private executePipeline(cmd: ParsedCommand, stdinInput: string): CommandOutput {
    // Run the current command with stdin
    let out = this.dispatch(cmd, stdinInput);

    // If redirected to file
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

    // If piped to next command
    if (cmd.pipeNext) {
      return this.executePipeline(cmd.pipeNext, out.stdout);
    }

    return out;
  }

  private dispatch(cmd: ParsedCommand, stdin: string): CommandOutput {
    let commandName = cmd.command;
    let args = [...cmd.args];

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

    switch (commandName) {
      case "pwd":
        return { stdout: this.session.cwd, stderr: "", exitCode: 0 };

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

      case "tree":
        return this.handleTree(args[0]);

      case "wc":
        return this.handleWc(args, stdin);

      case "stat":
        return this.handleStat(args[0]);

      case "df":
        return {
          stdout:
            "Filesystem              Size  Used Avail Use% Mounted on\n/dev/mapper/cs-root      50G  4.2G   46G   9% /\ndevtmpfs                3.8G     0  3.8G   0% /dev\ntmpfs                   3.9G     0  3.9G   0% /dev/shm\n/dev/sda1               960M  280M  680M  30% /boot\n",
          stderr: "",
          exitCode: 0,
        };

      case "free":
        return {
          stdout:
            "               total        used        free      shared  buff/cache   available\nMem:         8124800     1254320     5621400       34500     1249080     6540200\nSwap:        4194304           0     4194304\n",
          stderr: "",
          exitCode: 0,
        };

      case "uname":
        if (args.includes("-r")) {
          return { stdout: "5.14.0-362.el9.x86_64", stderr: "", exitCode: 0 };
        }
        return {
          stdout: "Linux centos-trainer 5.14.0-362.el9.x86_64 #1 SMP PREEMPT_DYNAMIC CentOS 5.14.0 x86_64 GNU/Linux",
          stderr: "",
          exitCode: 0,
        };

      case "whoami":
        return { stdout: this.session.username, stderr: "", exitCode: 0 };

      case "id":
        return {
          stdout: `uid=${this.session.uid}(${this.session.username}) gid=${this.session.gid}(${this.session.group}) groups=${this.session.groups.map((g, i) => `${1000 + i}(${g})`).join(",")}`,
          stderr: "",
          exitCode: 0,
        };

      case "groups":
        return { stdout: this.session.groups.join(" "), stderr: "", exitCode: 0 };

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

      case "passwd":
        return { stdout: `passwd: all authentication tokens updated successfully.`, stderr: "", exitCode: 0 };

      case "systemctl":
        return this.handleSystemctl(args);

      case "service":
        return this.handleService(args);

      case "journalctl":
        return {
          stdout:
            "-- Logs begin at Sun 2026-09-21 00:00:01 PHT. --\nSep 21 00:00:01 centos-trainer systemd[1]: Started System Logging Service.\nSep 21 00:00:02 centos-trainer kernel: Linux version 5.14.0-362.el9.x86_64\nSep 21 00:00:03 centos-trainer systemd[1]: Reached target Network.\nSep 21 00:00:04 centos-trainer sshd[842]: Server listening on 0.0.0.0 port 22.\nSep 21 00:00:05 centos-trainer systemd[1]: Started OpenSSH server daemon.\n",
          stderr: "",
          exitCode: 0,
        };

      case "ip":
        return this.handleIp(args);

      case "ifconfig":
        return {
          stdout:
            "ens33: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500\n        inet 192.168.122.100  netmask 255.255.255.0  broadcast 192.168.122.255\n        inet6 fe80::20c:29ff:fe4b:8a1c  prefixlen 64  scopeid 0x20<link>\n        ether 00:0c:29:4b:8a:1c  txqueuelen 1000  (Ethernet)\n        RX packets 12401  bytes 9410291 (8.9 MiB)\n        TX packets 8532  bytes 1294821 (1.2 MiB)\n\nlo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536\n        inet 127.0.0.1  netmask 255.0.0.0\n        inet6 ::1  prefixlen 128  scopeid 0x10<host>\n        loop  txqueuelen 1000  (Local Loopback)\n",
          stderr: "",
          exitCode: 0,
        };

      case "hostname":
        if (args.length > 0) {
          this.session.hostname = args[0];
          return { stdout: "", stderr: "", exitCode: 0 };
        }
        return { stdout: this.session.hostname, stderr: "", exitCode: 0 };

      case "ping":
        return {
          stdout: `PING ${args[0] ?? "localhost"} (127.0.0.1) 56(84) bytes of data.\n64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.042 ms\n64 bytes from 127.0.0.1: icmp_seq=2 ttl=64 time=0.038 ms\n--- ${args[0] ?? "localhost"} ping statistics ---\n2 packets transmitted, 2 received, 0% packet loss, time 1002ms`,
          stderr: "",
          exitCode: 0,
        };

      case "curl":
        return {
          stdout: "<!DOCTYPE html>\n<html>\n<head><title>CentOS Server</title></head>\n<body><h1>Welcome to CentOS Stream</h1></body>\n</html>",
          stderr: "",
          exitCode: 0,
        };

      case "netstat":
      case "ss":
        return {
          stdout:
            "Netid  State   Recv-Q  Send-Q   Local Address:Port   Peer Address:Port  Process\ntcp    LISTEN  0       128            0.0.0.0:22          0.0.0.0:*      users:((\"sshd\",pid=842,fd=3))\ntcp    LISTEN  0       128            0.0.0.0:80          0.0.0.0:*      users:((\"nginx\",pid=1024,fd=6))\ntcp    LISTEN  0       128               [::]:22             [::]:*      users:((\"sshd\",pid=842,fd=4))\n",
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

      case "date":
        return { stdout: new Date().toUTCString(), stderr: "", exitCode: 0 };

      case "uptime":
        return {
          stdout: " 02:45:10 up 3 days,  4:12,  2 users,  load average: 0.08, 0.03, 0.01",
          stderr: "",
          exitCode: 0,
        };

      case "clear":
        return { stdout: "", stderr: "", exitCode: 0, clear: true };

      case "history":
        return {
          stdout: this.history.map((h, i) => `  ${(i + 1).toString().padStart(4, " ")}  ${h}`).join("\n"),
          stderr: "",
          exitCode: 0,
        };

      case "which":
        return { stdout: `/usr/bin/${args[0] ?? ""}`, stderr: "", exitCode: 0 };

      case "help":
      case "man":
        return {
          stdout: `LinuxDrill CentOS Mock Terminal\nAvailable contest commands:\n  Files & Dirs: pwd, cd, ls, mkdir, touch, rm, cp, mv, cat, head, tail, grep, find, echo, chmod, chown, chgrp, tree, wc, stat, tar\n  Users/Groups: whoami, id, groups, su, sudo, useradd, usermod, userdel, groupadd, groupdel, passwd\n  Services/Logs: systemctl (status/start/stop/restart/enable/disable), journalctl, service\n  Network:      ip (a/route), ifconfig, hostname, ping, curl, netstat, ss, firewall-cmd\n  Packages:     yum/dnf (install/remove/list), rpm (-qa/-q)\n  Utilities:    clear, history, uname, df, free, date, uptime, which`,
          stderr: "",
          exitCode: 0,
        };

      case "exit":
        if (this.session.username !== "student") {
          return this.handleSu("student");
        }
        return { stdout: "exit: cannot exit root shell", stderr: "", exitCode: 0 };

      default:
        return {
          stdout: "",
          stderr: `bash: ${commandName}: command not found`,
          exitCode: 127,
        };
    }
  }

  private handleCd(target?: string): CommandOutput {
    const dest = target && target !== "~" ? target : this.session.homeDir;
    if (dest === "-") {
      const prev = this.previousDir;
      this.previousDir = this.session.cwd;
      this.session.cwd = prev;
      return { stdout: this.session.cwd, stderr: "", exitCode: 0 };
    }

    const resolved = this.vfs.resolvePath(dest, this.session.cwd);
    const node = this.vfs.getNode(resolved);

    if (!node) {
      return { stdout: "", stderr: `bash: cd: ${dest}: No such file or directory`, exitCode: 1 };
    }
    if (node.type !== "dir") {
      return { stdout: "", stderr: `bash: cd: ${dest}: Not a directory`, exitCode: 1 };
    }

    this.previousDir = this.session.cwd;
    this.session.cwd = resolved;
    return { stdout: "", stderr: "", exitCode: 0 };
  }

  private handleLs(args: string[]): CommandOutput {
    let showAll = false;
    let longFormat = false;
    let targetPath = this.session.cwd;

    for (const arg of args) {
      if (arg.startsWith("-")) {
        if (arg.includes("a")) showAll = true;
        if (arg.includes("l")) longFormat = true;
      } else {
        targetPath = arg;
      }
    }

    const node = this.vfs.getNode(targetPath, this.session.cwd);
    if (!node) {
      return { stdout: "", stderr: `ls: cannot access '${targetPath}': No such file or directory`, exitCode: 2 };
    }

    if (node.type === "file") {
      return { stdout: node.name, stderr: "", exitCode: 0 };
    }

    const entries = Array.from(node.children?.values() ?? []);
    let filtered = entries;
    if (!showAll) {
      filtered = entries.filter((e) => !e.name.startsWith("."));
    }

    filtered.sort((a, b) => a.name.localeCompare(b.name));

    if (longFormat) {
      const lines = filtered.map((e) => {
        const typeChar = e.type === "dir" ? "d" : "-";
        const dateStr = "Sep 21 00:00";
        return `${typeChar}${e.permissions}  1 ${e.owner} ${e.group}  ${e.size.toString().padStart(6, " ")} ${dateStr} ${e.name}${e.type === "dir" ? "/" : ""}`;
      });
      return { stdout: `total ${filtered.length * 4}\n` + lines.join("\n"), stderr: "", exitCode: 0 };
    }

    return {
      stdout: filtered.map((e) => (e.type === "dir" ? `${e.name}/` : e.name)).join("  "),
      stderr: "",
      exitCode: 0,
    };
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
    const read = this.vfs.readFile(src, this.session.cwd);
    if (read.error) {
      return { stdout: "", stderr: `mv: cannot stat '${src}': ${read.error}`, exitCode: 1 };
    }
    this.vfs.writeFile(dest, read.content ?? "", this.session.cwd, {
      owner: this.session.username,
      group: this.session.group,
    });
    this.vfs.remove(src, this.session.cwd, true);
    return { stdout: "", stderr: "", exitCode: 0 };
  }

  private handleCat(args: string[], stdin: string): CommandOutput {
    if (args.length === 0) {
      return { stdout: stdin, stderr: "", exitCode: 0 };
    }

    const outputs: string[] = [];
    for (const file of args) {
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
    return { stdout: lines, stderr: "", exitCode: 0 };
  }

  private handleTail(args: string[], stdin: string): CommandOutput {
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
      if (read.error) return { stdout: "", stderr: `tail: cannot open '${file}': ${read.error}`, exitCode: 1 };
      text = read.content ?? "";
    }

    const allLines = text.split("\n");
    const lines = allLines.slice(Math.max(0, allLines.length - count)).join("\n");
    return { stdout: lines, stderr: "", exitCode: 0 };
  }

  private handleGrep(args: string[], stdin: string): CommandOutput {
    let ignoreCase = false;
    let invertMatch = false;
    let pattern = "";
    let file = "";

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg === "-i") ignoreCase = true;
      else if (arg === "-v") invertMatch = true;
      else if (!pattern) pattern = arg;
      else if (!file) file = arg;
    }

    if (!pattern) return { stdout: "", stderr: "grep: missing pattern", exitCode: 2 };

    let text = stdin;
    if (file) {
      const read = this.vfs.readFile(file, this.session.cwd);
      if (read.error) return { stdout: "", stderr: `grep: ${file}: ${read.error}`, exitCode: 2 };
      text = read.content ?? "";
    }

    const regex = new RegExp(pattern, ignoreCase ? "i" : undefined);
    const lines = text
      .split("\n")
      .filter((line) => (invertMatch ? !regex.test(line) : regex.test(line)))
      .join("\n");

    return { stdout: lines, stderr: "", exitCode: lines.length > 0 ? 0 : 1 };
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

    return { stdout: results.join("\n"), stderr: "", exitCode: 0 };
  }

  private handleEcho(args: string[]): CommandOutput {
    const text = args
      .join(" ")
      .replace(/\$USER/g, this.session.username)
      .replace(/\$HOME/g, this.session.homeDir)
      .replace(/\$HOSTNAME/g, this.session.hostname)
      .replace(/\$PATH/g, this.session.env.PATH);

    return { stdout: text, stderr: "", exitCode: 0 };
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
    return { stdout: lines.join("\n"), stderr: "", exitCode: 0 };
  }

  private handleWc(args: string[], stdin: string): CommandOutput {
    let linesOnly = args.includes("-l");
    let file = args.find((a) => !a.startsWith("-"));

    let text = stdin;
    if (file) {
      const read = this.vfs.readFile(file, this.session.cwd);
      if (read.error) return { stdout: "", stderr: `wc: ${file}: ${read.error}`, exitCode: 1 };
      text = read.content ?? "";
    }

    const lines = text.split("\n").length - 1;
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const bytes = text.length;

    if (linesOnly) {
      return { stdout: `${lines}${file ? ` ${file}` : ""}`, stderr: "", exitCode: 0 };
    }
    return { stdout: ` ${lines}  ${words} ${bytes}${file ? ` ${file}` : ""}`, stderr: "", exitCode: 0 };
  }

  private handleStat(target: string): CommandOutput {
    if (!target) return { stdout: "", stderr: "stat: missing operand", exitCode: 1 };
    const node = this.vfs.getNode(target, this.session.cwd);
    if (!node) return { stdout: "", stderr: `stat: cannot stat '${target}': No such file or directory`, exitCode: 1 };

    return {
      stdout: `  File: ${node.name}\n  Size: ${node.size}        Blocks: 8          IO Block: 4096   ${node.type === "dir" ? "directory" : "regular file"}\nDevice: fd00h/64768d    Inode: 1048576     Links: 1\nAccess: (${node.permissions})  Uid: (${node.owner})   Gid: (${node.group})\nAccess: 2026-09-21 00:00:00.000000000 +0800\nModify: 2026-09-21 00:00:00.000000000 +0800\nChange: 2026-09-21 00:00:00.000000000 +0800`,
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
    let createHome = true;
    let username = "";

    for (let i = 0; i < args.length; i++) {
      if (args[i] === "-g" && args[i + 1]) {
        group = args[i + 1];
        i++;
      } else if (args[i] === "-M") {
        createHome = false;
      } else if (!args[i].startsWith("-")) {
        username = args[i];
      }
    }

    if (!username) return { stdout: "", stderr: "useradd: missing username", exitCode: 1 };

    // Update /etc/passwd
    const uid = 1000 + Math.floor(Math.random() * 8000);
    const entry = `${username}:x:${uid}:${uid}::/home/${username}:/bin/bash\n`;
    this.vfs.writeFile("/etc/passwd", entry, "/", { append: true });

    // Update /etc/group
    this.vfs.writeFile("/etc/group", `${username}:x:${uid}:\n`, "/", { append: true });

    if (createHome) {
      this.vfs.mkdir(`/home/${username}`, "/", { owner: username, group, permissions: "rwxr-x---" });
    }

    return { stdout: "", stderr: "", exitCode: 0 };
  }

  private handleUsermod(args: string[]): CommandOutput {
    let appendGroups: string[] = [];
    let username = "";

    for (let i = 0; i < args.length; i++) {
      if ((args[i] === "-aG" || args[i] === "-G") && args[i + 1]) {
        appendGroups = args[i + 1].split(",");
        i++;
      } else if (!args[i].startsWith("-")) {
        username = args[i];
      }
    }

    if (!username) return { stdout: "", stderr: "usermod: missing username", exitCode: 1 };

    if (username === this.session.username) {
      for (const g of appendGroups) {
        if (!this.session.groups.includes(g)) {
          this.session.groups.push(g);
        }
      }
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
    const gid = 1000 + Math.floor(Math.random() * 8000);
    this.vfs.writeFile("/etc/group", `${group}:x:${gid}:\n`, "/", { append: true });
    return { stdout: "", stderr: "", exitCode: 0 };
  }

  private handleGroupdel(args: string[]): CommandOutput {
    const group = args.find((a) => !a.startsWith("-"));
    if (!group) return { stdout: "", stderr: "groupdel: missing group name", exitCode: 1 };
    return { stdout: "", stderr: "", exitCode: 0 };
  }

  private handleSystemctl(args: string[]): CommandOutput {
    const action = args[0] ?? "";
    const serviceName = (args[1] ?? "").replace(/\.service$/, "");

    if (!action) return { stdout: "", stderr: "systemctl: missing action", exitCode: 1 };

    const state = this.servicesState.get(serviceName) ?? { active: false, enabled: false };

    switch (action) {
      case "status": {
        const activeText = state.active ? "active (running)" : "inactive (dead)";
        const colorIndicator = state.active ? "●" : "○";
        return {
          stdout: `${colorIndicator} ${serviceName}.service - ${serviceName.toUpperCase()} Server Daemon\n     Loaded: loaded (/usr/lib/systemd/system/${serviceName}.service; ${state.enabled ? "enabled" : "disabled"}; preset: disabled)\n     Active: ${activeText} since Sun 2026-09-21 00:00:04 PHT; 2h 45min ago\n   Main PID: ${state.active ? 842 : 0} (${serviceName})\n      Tasks: 1 (limit: 4684)\n     Memory: 6.8M\n        CPU: 12ms\n     CGroup: /system.slice/${serviceName}.service\n             └─842 /usr/sbin/${serviceName} -D`,
          stderr: "",
          exitCode: state.active ? 0 : 3,
        };
      }
      case "start":
        state.active = true;
        this.servicesState.set(serviceName, state);
        return { stdout: "", stderr: "", exitCode: 0 };
      case "stop":
        state.active = false;
        this.servicesState.set(serviceName, state);
        return { stdout: "", stderr: "", exitCode: 0 };
      case "restart":
        state.active = true;
        this.servicesState.set(serviceName, state);
        return { stdout: "", stderr: "", exitCode: 0 };
      case "enable":
        state.enabled = true;
        this.servicesState.set(serviceName, state);
        return {
          stdout: `Created symlink /etc/systemd/system/multi-user.target.wants/${serviceName}.service → /usr/lib/systemd/system/${serviceName}.service.`,
          stderr: "",
          exitCode: 0,
        };
      case "disable":
        state.enabled = false;
        this.servicesState.set(serviceName, state);
        return {
          stdout: `Removed /etc/systemd/system/multi-user.target.wants/${serviceName}.service.`,
          stderr: "",
          exitCode: 0,
        };
      case "is-active":
        return { stdout: state.active ? "active" : "inactive", stderr: "", exitCode: state.active ? 0 : 3 };
      case "is-enabled":
        return { stdout: state.enabled ? "enabled" : "disabled", stderr: "", exitCode: state.enabled ? 0 : 1 };
      default:
        return { stdout: "", stderr: `Unknown systemctl command: ${action}`, exitCode: 1 };
    }
  }

  private handleService(args: string[]): CommandOutput {
    const [name, action] = args;
    if (!name || !action) return { stdout: "", stderr: "Usage: service <name> <action>", exitCode: 1 };
    return this.handleSystemctl([action, name]);
  }

  private handleIp(args: string[]): CommandOutput {
    const sub = args[0] ?? "addr";
    if (sub === "a" || sub === "addr" || sub === "address") {
      return {
        stdout:
          "1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000\n    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00\n    inet 127.0.0.1/8 scope host lo\n       valid_lft forever preferred_lft forever\n    inet6 ::1/128 scope host\n       valid_lft forever preferred_lft forever\n2: ens33: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000\n    link/ether 00:0c:29:4b:8a:1c brd ff:ff:ff:ff:ff:ff\n    altname enp2s1\n    inet 192.168.122.100/24 brd 192.168.122.255 scope global dynamic noprefixroute ens33\n       valid_lft 85310sec preferred_lft 85310sec\n    inet6 fe80::20c:29ff:fe4b:8a1c/64 scope link noprefixroute\n       valid_lft forever preferred_lft forever",
        stderr: "",
        exitCode: 0,
      };
    }
    if (sub === "r" || sub === "route") {
      return {
        stdout: "default via 192.168.122.1 dev ens33 proto dhcp src 192.168.122.100 metric 100\n192.168.122.0/24 dev ens33 proto kernel scope link src 192.168.122.100 metric 100",
        stderr: "",
        exitCode: 0,
      };
    }
    return { stdout: "", stderr: `Object "${sub}" is unknown, try "ip help".`, exitCode: 1 };
  }

  private handleFirewallCmd(args: string[]): CommandOutput {
    if (args.includes("--state")) {
      return { stdout: "running", stderr: "", exitCode: 0 };
    }
    if (args.includes("--list-all")) {
      return {
        stdout: `public (active)\n  target: default\n  icmp-block-inversion: no\n  interfaces: ens33\n  sources:\n  services: ${Array.from(this.firewallServices).join(" ")}\n  ports: ${Array.from(this.firewallPorts).join(" ")}\n  protocols:\n  forward: yes\n  masquerade: no\n  forward-ports:\n  source-ports:\n  icmp-blocks:\n  rich rules:`,
        stderr: "",
        exitCode: 0,
      };
    }

    const portArg = args.find((a) => a.startsWith("--add-port="));
    if (portArg) {
      const port = portArg.split("=")[1];
      this.firewallPorts.add(port);
      return { stdout: "success", stderr: "", exitCode: 0 };
    }

    const serviceArg = args.find((a) => a.startsWith("--add-service="));
    if (serviceArg) {
      const svc = serviceArg.split("=")[1];
      this.firewallServices.add(svc);
      return { stdout: "success", stderr: "", exitCode: 0 };
    }

    if (args.includes("--reload")) {
      return { stdout: "success", stderr: "", exitCode: 0 };
    }

    return { stdout: "success", stderr: "", exitCode: 0 };
  }

  private handleYum(args: string[]): CommandOutput {
    const action = args[0] ?? "";
    const pkg = args[1] ?? "";

    if (action === "install") {
      return {
        stdout: `CentOS Stream 9 - BaseOS                         12 MB/s | 6.8 MB     00:00\nCentOS Stream 9 - AppStream                      18 MB/s |  14 MB     00:00\nDependencies resolved.\n================================================================================\n Package          Architecture    Version                  Repository      Size\n================================================================================\nInstalling:\n ${pkg || "package"}      x86_64          1.2.0-1.el9              appstream      2.4 M\n\nTransaction Summary\n================================================================================\nInstall  1 Package\n\nTotal download size: 2.4 M\nInstalled size: 7.8 M\nDownloading Packages:\nRunning transaction check\nRunning transaction test\nTransaction test succeeded.\nRunning transaction\n  Preparing        :                                                        1/1\n  Installing       : ${pkg}-1.2.0-1.el9.x86_64                              1/1\n  Verifying        : ${pkg}-1.2.0-1.el9.x86_64                              1/1\n\nInstalled:\n  ${pkg}-1.2.0-1.el9.x86_64\n\nComplete!`,
        stderr: "",
        exitCode: 0,
      };
    }

    return { stdout: `Complete!`, stderr: "", exitCode: 0 };
  }

  private handleRpm(args: string[]): CommandOutput {
    if (args.includes("-qa")) {
      return {
        stdout:
          "kernel-5.14.0-362.el9.x86_64\nsystemd-252-18.el9.x86_64\nbash-5.1.8-6.el9.x86_64\nopenssh-server-8.7p1-34.el9.x86_64\ncoreutils-8.32-34.el9.x86_64\nfirewalld-1.2.5-2.el9.noarch\nchrony-4.3-1.el9.x86_64\niproute-5.18.0-1.el9.x86_64\nnginx-1.20.1-14.el9.x86_64\n",
        stderr: "",
        exitCode: 0,
      };
    }
    return { stdout: `${args[1] ?? "package"}-1.0.0-1.el9.x86_64`, stderr: "", exitCode: 0 };
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
}
