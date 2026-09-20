import type { NodeType, VFSNode } from "./types";

export class VirtualFileSystem {
  public root: VFSNode;

  constructor() {
    this.root = this.createDefaultTree();
  }

  private createNode(
    name: string,
    type: NodeType,
    options: {
      content?: string;
      permissions?: string;
      owner?: string;
      group?: string;
      target?: string;
    } = {}
  ): VFSNode {
    return {
      name,
      type,
      content: options.content ?? (type === "file" ? "" : undefined),
      permissions: options.permissions ?? (type === "dir" ? "rwxr-xr-x" : "rw-r--r--"),
      owner: options.owner ?? "root",
      group: options.group ?? "root",
      size: options.content ? options.content.length : 4096,
      modified: new Date(),
      target: options.target,
      children: type === "dir" ? new Map<string, VFSNode>() : undefined,
    };
  }

  public createDefaultTree(): VFSNode {
    const root = this.createNode("/", "dir", { permissions: "rwxr-xr-x", owner: "root", group: "root" });

    // Helper to create directory path
    const ensureDir = (parts: string[], owner = "root", group = "root", perms = "rwxr-xr-x"): VFSNode => {
      let current = root;
      for (const part of parts) {
        if (!current.children) current.children = new Map();
        if (!current.children.has(part)) {
          const dir = this.createNode(part, "dir", { owner, group, permissions: perms });
          current.children.set(part, dir);
        }
        current = current.children.get(part)!;
      }
      return current;
    };

    const addFile = (
      dirPath: string[],
      name: string,
      content: string,
      owner = "root",
      group = "root",
      perms = "rw-r--r--"
    ) => {
      const parent = ensureDir(dirPath);
      if (!parent.children) parent.children = new Map();
      parent.children.set(
        name,
        this.createNode(name, "file", { content, owner, group, permissions: perms })
      );
    };

    // Standard directories
    ensureDir(["bin"]);
    ensureDir(["sbin"]);
    ensureDir(["dev"]);
    ensureDir(["etc"]);
    ensureDir(["etc", "systemd", "system"]);
    ensureDir(["etc", "ssh"]);
    ensureDir(["etc", "security"]);
    ensureDir(["home"]);
    ensureDir(["home", "student"], "student", "student", "rwxr-xr-x");
    ensureDir(["root"], "root", "root", "rwxr-x---");
    ensureDir(["var"]);
    ensureDir(["var", "log"]);
    ensureDir(["var", "log", "nginx"]);
    ensureDir(["var", "www", "html"]);
    ensureDir(["usr"]);
    ensureDir(["usr", "bin"]);
    ensureDir(["usr", "sbin"]);
    ensureDir(["usr", "local", "bin"]);
    ensureDir(["tmp"], "root", "root", "rwxrwxrwt");
    ensureDir(["backup"]);
    ensureDir(["opt"]);
    ensureDir(["mnt"]);

    // Configuration files in /etc
    addFile(
      ["etc"],
      "passwd",
      `root:x:0:0:root:/root:/bin/bash\nbin:x:1:1:bin:/bin:/sbin/nologin\ndaemon:x:2:2:daemon:/sbin:/sbin/nologin\nadm:x:3:4:adm:/var/adm:/sbin/nologin\nlp:x:4:7:lp:/var/spool/lpd:/sbin/nologin\nsync:x:5:0:sync:/sbin:/bin/sync\nshutdown:x:6:0:shutdown:/sbin:/sbin/shutdown\nhalt:x:7:0:halt:/sbin:/sbin/halt\nmail:x:8:12:mail:/var/spool/mail:/sbin/nologin\noperator:x:11:0:operator:/root:/sbin/nologin\ngames:x:12:100:games:/usr/games:/sbin/nologin\nftp:x:14:50:FTP User:/var/ftp:/sbin/nologin\nnobody:x:65534:65534:Kernel Overflow User:/:/sbin/nologin\nsystemd-coredump:x:999:997:systemd Core Dumper:/:/sbin/nologin\nsystemd-resolve:x:193:193:systemd Resolver:/:/sbin/nologin\ntss:x:59:59:Account used by the trousers package to accept cache push:/dev/null:/sbin/nologin\npolkitd:x:998:996:User for polkitd:/:/sbin/nologin\ngeoclue:x:997:995:User for geoclue:/var/lib/geoclue:/sbin/nologin\nrtkit:x:172:172:RealtimeKit:/proc:/sbin/nologin\npipewire:x:996:992:PipeWire System Daemon:/var/run/pipewire:/sbin/nologin\npulse:x:171:171:PulseAudio System Daemon:/var/run/pulse:/sbin/nologin\nsshd:x:74:74:Privilege-separated SSH:/usr/share/empty.sshd:/sbin/nologin\nchrony:x:995:991:chrony system user:/var/lib/chrony:/sbin/nologin\ndnsmasq:x:994:990:Dnsmasq DHCP and DNS server:/var/lib/dnsmasq:/sbin/nologin\ntcpdump:x:72:72::/:/sbin/nologin\nstudent:x:1000:1000:Student User:/home/student:/bin/bash\nnginx:x:993:989:Nginx web server:/var/lib/nginx:/sbin/nologin\n`
    );

    addFile(
      ["etc"],
      "group",
      `root:x:0:\nbin:x:1:\ndaemon:x:2:\nsys:x:3:\nadm:x:4:\ntty:x:5:\ndisk:x:6:\nlp:x:7:\nmem:x:8:\nkmem:x:9:\nwheel:x:10:student\nmail:x:12:\ngames:x:20:\nftp:x:50:\nlock:x:54:\naudio:x:63:\nnobody:x:65534:\nusers:x:100:\nsystemd-journal:x:190:\nstudent:x:1000:\nnginx:x:989:\n`
    );

    addFile(
      ["etc"],
      "hosts",
      `127.0.0.1   localhost localhost.localdomain\n::1         localhost localhost.localdomain\n192.168.122.100 centos-trainer centos-trainer.local\n`
    );

    addFile(["etc"], "hostname", "centos-trainer\n");
    addFile(["etc"], "resolv.conf", "nameserver 8.8.8.8\nnameserver 1.1.1.1\n");
    addFile(
      ["etc"],
      "os-release",
      `NAME="CentOS Stream"\nVERSION="9"\nID="centos"\nID_LIKE="rhel fedora"\nVERSION_ID="9"\nPRETTY_NAME="CentOS Stream 9"\nANSI_COLOR="0;31"\nCPE_NAME="cpe:/o:centos:centos:9"\nHOME_URL="https://centos.org/"\nBUG_REPORT_URL="https://issues.redhat.com/"\n`
    );
    addFile(["etc"], "redhat-release", "CentOS Stream release 9\n");
    addFile(
      ["etc", "ssh"],
      "sshd_config",
      `# OpenSSH Daemon Configuration\nPort 22\nPermitRootLogin yes\nPasswordAuthentication yes\nAuthorizedKeysFile .ssh/authorized_keys\nSubsystem sftp /usr/libexec/openssh/sftp-server\n`
    );

    // Files in /home/student
    addFile(
      ["home", "student"],
      ".bashrc",
      `# .bashrc\n[ -f /etc/bashrc ] && . /etc/bashrc\nalias ll='ls -la --color=auto'\n`,
      "student",
      "student"
    );

    // Files in /var/log
    addFile(
      ["var", "log"],
      "messages",
      `Sep 21 00:00:01 centos-trainer systemd[1]: Started System Logging Service.\nSep 21 00:00:02 centos-trainer kernel: Linux version 5.14.0-362.el9.x86_64\nSep 21 00:00:03 centos-trainer systemd[1]: Reached target Network.\nSep 21 00:00:04 centos-trainer sshd[842]: Server listening on 0.0.0.0 port 22.\n`
    );

    addFile(
      ["var", "log"],
      "secure",
      `Sep 21 00:00:05 centos-trainer sshd[842]: Accepted password for student from 192.168.122.1 port 54322 ssh2\n`
    );

    return root;
  }

  public reset(): void {
    this.root = this.createDefaultTree();
  }

  public resolvePath(target: string, cwd: string): string {
    let cleanTarget = target.trim();
    if (!cleanTarget) return cwd;

    if (cleanTarget.startsWith("~")) {
      cleanTarget = "/home/student" + cleanTarget.slice(1);
    }

    const isAbsolute = cleanTarget.startsWith("/");
    const basePath = isAbsolute ? cleanTarget : `${cwd}/${cleanTarget}`;

    const segments = basePath.split("/").filter(Boolean);
    const resolved: string[] = [];

    for (const segment of segments) {
      if (segment === ".") continue;
      if (segment === "..") {
        if (resolved.length > 0) resolved.pop();
      } else {
        resolved.push(segment);
      }
    }

    return "/" + resolved.join("/");
  }

  public getNode(path: string, cwd = "/"): VFSNode | null {
    const resolved = this.resolvePath(path, cwd);
    if (resolved === "/") return this.root;

    const parts = resolved.split("/").filter(Boolean);
    let current = this.root;

    for (const part of parts) {
      if (!current.children || current.type !== "dir") return null;
      const next = current.children.get(part);
      if (!next) return null;
      current = next;
    }

    return current;
  }

  public mkdir(
    path: string,
    cwd = "/",
    options: { recursive?: boolean; owner?: string; group?: string; permissions?: string } = {}
  ): { success: boolean; error?: string } {
    const resolved = this.resolvePath(path, cwd);
    const parts = resolved.split("/").filter(Boolean);
    if (parts.length === 0) return { success: false, error: "Cannot create root directory" };

    let current = this.root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;

      if (!current.children) current.children = new Map();

      if (current.children.has(part)) {
        const existing = current.children.get(part)!;
        if (isLast) {
          if (!options.recursive) {
            return { success: false, error: `File exists: '${part}'` };
          }
          return { success: true };
        }
        if (existing.type !== "dir") {
          return { success: false, error: `Not a directory: '${part}'` };
        }
        current = existing;
      } else {
        if (!isLast && !options.recursive) {
          return { success: false, error: `No such file or directory: '${parts.slice(0, i + 1).join("/")}'` };
        }
        const dir = this.createNode(part, "dir", {
          owner: options.owner ?? "student",
          group: options.group ?? "student",
          permissions: options.permissions ?? "rwxr-xr-x",
        });
        current.children.set(part, dir);
        current = dir;
      }
    }

    return { success: true };
  }

  public writeFile(
    path: string,
    content: string,
    cwd = "/",
    options: { append?: boolean; owner?: string; group?: string; permissions?: string } = {}
  ): { success: boolean; error?: string } {
    const resolved = this.resolvePath(path, cwd);
    const parts = resolved.split("/").filter(Boolean);
    if (parts.length === 0) return { success: false, error: "Invalid path" };

    const fileName = parts.pop()!;
    const parentPath = "/" + parts.join("/");
    const parent = this.getNode(parentPath);

    if (!parent) {
      return { success: false, error: `No such file or directory: '${parentPath}'` };
    }
    if (parent.type !== "dir" || !parent.children) {
      return { success: false, error: `Not a directory: '${parentPath}'` };
    }

    if (parent.children.has(fileName)) {
      const existing = parent.children.get(fileName)!;
      if (existing.type === "dir") {
        return { success: false, error: `Is a directory: '${fileName}'` };
      }
      existing.content = options.append ? (existing.content ?? "") + content : content;
      existing.size = existing.content.length;
      existing.modified = new Date();
    } else {
      parent.children.set(
        fileName,
        this.createNode(fileName, "file", {
          content,
          owner: options.owner ?? "student",
          group: options.group ?? "student",
          permissions: options.permissions ?? "rw-r--r--",
        })
      );
    }

    return { success: true };
  }

  public readFile(path: string, cwd = "/"): { content?: string; error?: string } {
    const node = this.getNode(path, cwd);
    if (!node) return { error: `No such file or directory: '${path}'` };
    if (node.type === "dir") return { error: `Is a directory: '${path}'` };
    return { content: node.content ?? "" };
  }

  public remove(path: string, cwd = "/", recursive = false): { success: boolean; error?: string } {
    const resolved = this.resolvePath(path, cwd);
    if (resolved === "/") return { success: false, error: "Cannot remove root directory" };

    const parts = resolved.split("/").filter(Boolean);
    const name = parts.pop()!;
    const parentPath = "/" + parts.join("/");
    const parent = this.getNode(parentPath);

    if (!parent || !parent.children || !parent.children.has(name)) {
      return { success: false, error: `No such file or directory: '${path}'` };
    }

    const target = parent.children.get(name)!;
    if (target.type === "dir" && !recursive) {
      return { success: false, error: `Is a directory: '${path}'` };
    }

    parent.children.delete(name);
    return { success: true };
  }

  public readdir(path: string, cwd = "/"): { nodes?: VFSNode[]; error?: string } {
    const node = this.getNode(path, cwd);
    if (!node) return { error: `No such file or directory: '${path}'` };
    if (node.type !== "dir" || !node.children) return { error: `Not a directory: '${path}'` };

    return { nodes: Array.from(node.children.values()) };
  }

  public chmod(path: string, mode: string, cwd = "/"): { success: boolean; error?: string } {
    const node = this.getNode(path, cwd);
    if (!node) return { success: false, error: `No such file or directory: '${path}'` };

    // Convert octal mode e.g. "755", "644", "0750"
    const cleanMode = mode.replace(/^0+/, "");
    if (/^[0-7]{3}$/.test(cleanMode)) {
      const permsMap = ["---", "--x", "-w-", "-wx", "r--", "r-x", "rw-", "rwx"];
      const u = permsMap[parseInt(cleanMode[0], 10)];
      const g = permsMap[parseInt(cleanMode[1], 10)];
      const o = permsMap[parseInt(cleanMode[2], 10)];
      node.permissions = `${u}${g}${o}`;
      return { success: true };
    }

    return { success: false, error: `Invalid mode: '${mode}'` };
  }

  public chown(path: string, ownerStr: string, cwd = "/"): { success: boolean; error?: string } {
    const node = this.getNode(path, cwd);
    if (!node) return { success: false, error: `No such file or directory: '${path}'` };

    const [owner, group] = ownerStr.split(":");
    if (owner) node.owner = owner;
    if (group) node.group = group;

    return { success: true };
  }
}
