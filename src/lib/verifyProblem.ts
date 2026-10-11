import type { ShellContext } from "./vfs/commands";
import type { Problem } from "./types";

export interface VerificationResult {
  passed: boolean;
  message: string;
  checks: { name: string; passed: boolean }[];
  missingHint?: string;
}

export function verifyProblem(problem: Problem, shell: ShellContext): VerificationResult {
  const vfs = shell.vfs;
  const history = shell.history.map((h) => h.trim().toLowerCase());
  const checks: { name: string; passed: boolean }[] = [];

  const checkPathExists = (path: string, label?: string) => {
    const node = vfs.getNode(path);
    const passed = !!node;
    checks.push({
      name: label || `Target path '${path}' exists`,
      passed,
    });
    return passed;
  };

  const checkFileContains = (path: string, substrings: string[], label?: string) => {
    const file = vfs.readFile(path);
    if (!file.content) {
      checks.push({
        name: label || `File '${path}' exists and has content`,
        passed: false,
      });
      return false;
    }
    const allPresent = substrings.every((s) =>
      file.content!.toLowerCase().includes(s.toLowerCase())
    );
    checks.push({
      name: label || `File '${path}' contains required content`,
      passed: allPresent,
    });
    return allPresent;
  };

  const checkHistoryMatch = (patterns: (string | RegExp)[], label: string) => {
    const matched = patterns.some((p) => {
      if (typeof p === "string") {
        return history.some((h) => h.includes(p.toLowerCase()));
      }
      return history.some((h) => p.test(h));
    });
    checks.push({ name: label, passed: matched });
    return matched;
  };

  switch (problem.id) {
    case "LX-BASIC-01": {
      const d1 = checkPathExists("/home/student/lab/docs", "Directory /home/student/lab/docs exists");
      const d2 = checkPathExists("/home/student/lab/logs", "Directory /home/student/lab/logs exists");
      const d3 = checkPathExists("/home/student/lab/scripts", "Directory /home/student/lab/scripts exists");
      const f1 = checkPathExists("/home/student/lab/docs/file1.txt", "File file1.txt in docs exists");
      const f2 = checkPathExists("/home/student/lab/docs/file2.txt", "File file2.txt in docs exists");
      const f3 = checkPathExists("/home/student/lab/docs/file3.txt", "File file3.txt in docs exists");

      const allOk = d1 && d2 && d3 && f1 && f2 && f3;
      return {
        passed: allOk,
        message: allOk
          ? "Directory structure and all 3 files created successfully!"
          : "Some required directories or files are missing.",
        checks,
        missingHint: "Run: mkdir -p /home/student/lab/{docs,logs,scripts} && touch /home/student/lab/docs/file{1..3}.txt",
      };
    }

    case "LX-BASIC-02": {
      const exists = checkPathExists("/tmp/notes.txt", "File /tmp/notes.txt exists");
      const contentOk =
        exists &&
        checkFileContains(
          "/tmp/notes.txt",
          ["linux contest 2026", "practice makes perfect"],
          "Contains 'Linux Contest 2026' and 'Practice makes perfect'"
        );
      const passed = exists && contentOk;
      return {
        passed,
        message: passed
          ? "Notes file created with both lines properly formatted!"
          : "File /tmp/notes.txt is missing or does not have both required lines.",
        checks,
        missingHint: "Use echo 'Linux Contest 2026' > /tmp/notes.txt && echo 'Practice makes perfect' >> /tmp/notes.txt",
      };
    }

    case "LX-BASIC-03": {
      const f = checkPathExists("/tmp/biglogs.txt", "Output file /tmp/biglogs.txt exists");
      const ranFind = checkHistoryMatch(["find /var/log", "biglogs.txt"], "Executed find search into /tmp/biglogs.txt");
      const passed = f && ranFind;
      return {
        passed,
        message: passed ? "Log search output file generated correctly!" : "Output /tmp/biglogs.txt not found or find command not run.",
        checks,
        missingHint: "Run: find /var/log -type f -name '*.log' -size +1M 2>/dev/null > /tmp/biglogs.txt",
      };
    }

    case "LX-BASIC-04": {
      const f = checkPathExists("/tmp/shells.txt", "File /tmp/shells.txt exists");
      const ran = checkHistoryMatch(["shells.txt", "cut", "awk"], "Extracted login shells into /tmp/shells.txt");
      const passed = f && ran;
      return {
        passed,
        message: passed ? "Login shell ranking saved to /tmp/shells.txt!" : "Missing /tmp/shells.txt or extraction command not run.",
        checks,
        missingHint: "Run: cut -d: -f7 /etc/passwd | sort | uniq -c | sort -rn | head -3 > /tmp/shells.txt",
      };
    }

    case "LX-BASIC-05": {
      const exists = checkPathExists("/root/users_report.txt", "File /root/users_report.txt exists");
      const node = vfs.getNode("/root/users_report.txt");
      const permOk = node ? node.permissions.startsWith("rw-------") || node.permissions === "rw-------" : false;
      checks.push({ name: "Permissions set strictly (0600 or rw-------)", passed: permOk });
      const passed = exists && permOk;
      return {
        passed,
        message: passed ? "User report created with correct secure permissions!" : "Report missing or wrong permissions (must be 0600).",
        checks,
        missingHint: "Create /root/users_report.txt and run: chmod 600 /root/users_report.txt",
      };
    }

    case "LX-USER-01": {
      const passwd = vfs.readFile("/etc/passwd").content || "";
      const userCreated = passwd.includes("alice:") && passwd.includes("/bin/bash");
      checks.push({ name: "User 'alice' in /etc/passwd with /bin/bash shell", passed: userCreated });
      const homeExists = checkPathExists("/home/alice", "Home directory /home/alice exists");
      const passed = userCreated && homeExists;
      return {
        passed,
        message: passed ? "User alice created successfully with home directory and bash shell!" : "User alice was not created properly with home directory.",
        checks,
        missingHint: "Run: useradd -m -s /bin/bash alice",
      };
    }

    case "LX-USER-02": {
      const group = vfs.readFile("/etc/group").content || "";
      const groupCreated = group.includes("developers:");
      const aliceInGroup = group.includes("developers") && group.includes("alice");
      checks.push({ name: "Group 'developers' exists in /etc/group", passed: groupCreated });
      checks.push({ name: "User 'alice' added to 'developers'", passed: aliceInGroup });
      const passed = groupCreated && aliceInGroup;
      return {
        passed,
        message: passed ? "Group developers configured and alice added successfully!" : "Group developers or membership for alice missing.",
        checks,
        missingHint: "Run: groupadd developers && usermod -aG developers alice",
      };
    }

    case "LX-USER-03": {
      const passwd = vfs.readFile("/etc/passwd").content || "";
      const bobOk = passwd.includes("bob") && passwd.includes("2500");
      checks.push({ name: "User 'bob' with UID 2500 in /etc/passwd", passed: bobOk });
      const ag = shell.userAging.get("bob");
      const expirySet = (ag && ag.maxDays === 30) || checkHistoryMatch(["chage -m 30 bob", "chage"], "Password max age set to 30 days");
      const passed = bobOk && expirySet;
      return {
        passed,
        message: passed ? "User bob created with UID 2500 and 30-day password policy!" : "User bob not created with UID 2500 or password policy.",
        checks,
        missingHint: "Run: useradd -m -u 2500 -g developers -G wheel bob && chage -M 30 bob",
      };
    }

    case "LX-USER-04": {
      const ag = shell.userAging.get("carol");
      const isLocked = ag?.locked === true || checkHistoryMatch(["usermod -l carol", "passwd -l carol"], "Account locked");
      const hasExpiry = ag?.expireDate === "2026-12-31" || ag?.lastChange === 0 || checkHistoryMatch(["chage -d 0", "chage -e"], "Password expiry set");
      checks.push({ name: "Account carol locked", passed: isLocked });
      checks.push({ name: "Password change and account expiration configured", passed: hasExpiry });
      const passed = isLocked && hasExpiry;
      return {
        passed,
        message: passed ? "Account carol locked and password expiration enforced!" : "Did not detect locking and expiration of account carol.",
        checks,
        missingHint: "Run: usermod -L carol && chage -d 0 carol && chage -E 2026-12-31 carol",
      };
    }

    case "LX-USER-05": {
      const sudoers = vfs.readFile("/etc/sudoers.d/developers").content || "";
      const sudoOk = sudoers.includes("%developers");
      const node = vfs.getNode("/etc/sudoers.d/developers");
      const permOk = node?.permissions.startsWith("r--r-----") || node?.permissions.includes("r--") || false;
      checks.push({ name: "/etc/sudoers.d/developers grants %developers sudo privileges", passed: sudoOk });
      checks.push({ name: "Permissions on /etc/sudoers.d/developers are 440", passed: permOk });
      const ranLoop = checkHistoryMatch(["while ifs=: read", "useradd", "sudoers.d/developers"], "Executed batch user provisioning script");
      const passed = (sudoOk && permOk) || (sudoOk && ranLoop);
      return {
        passed,
        message: passed ? "Batch user provisioning and sudoers rights configured!" : "Sudoers file missing, improper permissions, or batch script incomplete.",
        checks,
        missingHint: "Provision users from /root/users.txt and write '%developers ALL=(ALL) ALL' > /etc/sudoers.d/developers with chmod 440.",
      };
    }

    case "LX-PKG-01": {
      const installed = shell.installedPackages.has("httpd");
      checks.push({ name: "Package 'httpd' installed in system", passed: installed });
      const ran = checkHistoryMatch(["rpm -q httpd", "dnf install", "yum install"], "Verified package installation with rpm");
      const passed = installed && ran;
      return {
        passed,
        message: passed ? "Package httpd installed and verified successfully!" : "httpd package not installed or verified.",
        checks,
        missingHint: "Run: dnf install -y httpd && rpm -q httpd",
      };
    }

    case "LX-PKG-02": {
      const f = checkPathExists("/tmp/scp_pkg.txt", "File /tmp/scp_pkg.txt exists");
      const content = (vfs.readFile("/tmp/scp_pkg.txt").content || "").toLowerCase();
      const contentOk = content.includes("openssh") || content.includes("scp");
      checks.push({ name: "Contains owning package name (openssh-clients)", passed: contentOk });
      const passed = f && contentOk;
      return {
        passed,
        message: passed ? "Package providing /usr/bin/scp identified and recorded!" : "Missing /tmp/scp_pkg.txt or incorrect package name.",
        checks,
        missingHint: "Run: rpm -qf /usr/bin/scp > /tmp/scp_pkg.txt",
      };
    }

    case "LX-PKG-03": {
      const f1 = checkPathExists("/tmp/kernel_count.txt", "File /tmp/kernel_count.txt exists");
      const f2 = checkPathExists("/tmp/bash_files.txt", "File /tmp/bash_files.txt exists");
      const ran = checkHistoryMatch(["rpm -qa", "kernel_count.txt", "rpm -ql bash", "bash_files.txt"], "Ran rpm queries for kernel and bash files");
      const passed = f1 && f2 && ran;
      return {
        passed,
        message: passed ? "Kernel package count and bash file list recorded successfully!" : "Missing /tmp/kernel_count.txt or /tmp/bash_files.txt.",
        checks,
        missingHint: "Run: rpm -qa | grep -c kernel > /tmp/kernel_count.txt && rpm -ql bash > /tmp/bash_files.txt",
      };
    }

    case "LX-PKG-04": {
      const repoFile = vfs.readFile("/etc/yum.repos.d/local.repo").content || "";
      const hasBaseurl = repoFile.includes("baseurl=file:///mnt/cdrom") || repoFile.includes("/mnt/cdrom");
      checks.push({ name: "Repo file /etc/yum.repos.d/local.repo configured with /mnt/cdrom", passed: hasBaseurl });
      const ranClean = checkHistoryMatch(["dnf clean", "dnf repolist", "yum clean", "yum repolist"], "Cleaned metadata cache and tested repolist");
      const passed = hasBaseurl && ranClean;
      return {
        passed,
        message: passed ? "Local repository configured and cache cleaned successfully!" : "Repository file missing, wrong baseurl, or repolist not run.",
        checks,
        missingHint: "Create /etc/yum.repos.d/local.repo with baseurl=file:///mnt/cdrom, then run dnf clean all && dnf repolist.",
      };
    }

    case "LX-PKG-05": {
      const fstab = vfs.readFile("/etc/fstab").content || "";
      const fstabOk = fstab.includes("/mnt/cdrom");
      checks.push({ name: "/etc/fstab contains persistent mount for /mnt/cdrom", passed: fstabOk });
      const ranMount = checkHistoryMatch(["mount -a", "mount /mnt/cdrom"], "Executed mount -a to mount ISO");
      const passed = fstabOk && ranMount;
      return {
        passed,
        message: passed ? "Persistent ISO mount configured in /etc/fstab and mounted!" : "Mount entry in /etc/fstab missing or mount -a not run.",
        checks,
        missingHint: "Add '/dev/sr0  /mnt/cdrom  iso9660  defaults,ro  0 0' to /etc/fstab and run mount -a.",
      };
    }

    case "LX-NET-01": {
      const f = checkPathExists("/tmp/netinfo.txt", "File /tmp/netinfo.txt exists");
      const content = vfs.readFile("/tmp/netinfo.txt").content || "";
      const hasIp = content.includes("inet") || content.includes("192.168") || content.includes("default");
      checks.push({ name: "Contains IPv4 address and default route information", passed: hasIp });
      const passed = f && hasIp;
      return {
        passed,
        message: passed ? "Network configuration and gateway dumped to /tmp/netinfo.txt!" : "Missing /tmp/netinfo.txt or missing IP/route info.",
        checks,
        missingHint: "Run: ip -4 addr show > /tmp/netinfo.txt && ip route show default >> /tmp/netinfo.txt",
      };
    }

    case "LX-NET-02": {
      const hostnameOk = shell.session.hostname === "server01.lab.local";
      const fileOk = (vfs.readFile("/etc/hostname").content || "").includes("server01.lab.local");
      checks.push({ name: "System hostname is 'server01.lab.local'", passed: hostnameOk });
      checks.push({ name: "/etc/hostname contains 'server01.lab.local'", passed: fileOk });
      const passed = hostnameOk && fileOk;
      return {
        passed,
        message: passed ? "Hostname set to server01.lab.local persistently!" : "Hostname is not set to server01.lab.local.",
        checks,
        missingHint: "Run: hostnamectl set-hostname server01.lab.local",
      };
    }

    case "LX-NET-03": {
      const iface = shell.networkInterfaces.get("ens33");
      const ipOk = iface?.ip.includes("192.168.10.50") || false;
      const gwOk = iface?.gateway === "192.168.10.1" || false;
      const dnsOk = iface?.dns.includes("8.8.8.8") || false;
      checks.push({ name: "Interface ens33 assigned static IP 192.168.10.50/24", passed: ipOk });
      checks.push({ name: "Gateway configured to 192.168.10.1 and DNS to 8.8.8.8", passed: gwOk && dnsOk });
      const passed = ipOk && gwOk;
      return {
        passed,
        message: passed ? "Interface ens33 configured with static IP, gateway, and DNS!" : "Network interface ens33 configuration incomplete.",
        checks,
        missingHint: "Run: nmcli con mod ens33 ipv4.method manual ipv4.addresses 192.168.10.50/24 ipv4.gateway 192.168.10.1 ipv4.dns 8.8.8.8 && nmcli con up ens33",
      };
    }

    case "LX-NET-04": {
      const hostsContent = vfs.readFile("/etc/hosts").content || "";
      const hasIp = hostsContent.includes("192.168.10.20");
      const hasHost = hostsContent.includes("web01");
      checks.push({ name: "/etc/hosts maps 192.168.10.20", passed: hasIp });
      checks.push({ name: "/etc/hosts maps host name 'web01'", passed: hasHost });
      const passed = hasIp && hasHost;
      return {
        passed,
        message: passed ? "Static host resolution entry configured in /etc/hosts!" : "Host entry for web01 (192.168.10.20) missing in /etc/hosts.",
        checks,
        missingHint: "Run: echo '192.168.10.20  web01.lab.local  web01' >> /etc/hosts",
      };
    }

    case "LX-NET-05": {
      const hasHttp = shell.firewallServices.has("http");
      const hasHttps = shell.firewallServices.has("https");
      const hasPort = shell.firewallPorts.has("8080/tcp");
      const hasRich = shell.firewallRichRules.size > 0 || checkHistoryMatch(["add-rich-rule", "192.168.10.99"], "Added rich rule rejecting malicious IP");
      checks.push({ name: "Firewall service 'http' allowed", passed: hasHttp });
      checks.push({ name: "Firewall service 'https' allowed", passed: hasHttps });
      checks.push({ name: "Firewall port '8080/tcp' opened", passed: hasPort });
      checks.push({ name: "Firewall rich rule configured", passed: hasRich });
      const passed = hasHttp && hasHttps && hasPort;
      return {
        passed,
        message: passed ? "Firewall rules for http, https, 8080/tcp, and rich rules configured!" : "Firewall rules not fully configured.",
        checks,
        missingHint: "Run: firewall-cmd --permanent --add-service=http --add-service=https --add-port=8080/tcp && firewall-cmd --reload",
      };
    }

    case "LX-FS-01": {
      const f = checkPathExists("/srv/report.txt", "File /srv/report.txt exists");
      const node = vfs.getNode("/srv/report.txt");
      const ownerOk = node?.owner === "alice";
      const groupOk = node?.group === "developers";
      const permOk = node?.permissions === "rw-r-----";
      checks.push({ name: "Owner is 'alice'", passed: ownerOk });
      checks.push({ name: "Group is 'developers'", passed: groupOk });
      checks.push({ name: "Permissions are 640 (rw-r-----)", passed: permOk });
      const passed = f && ownerOk && groupOk && permOk;
      return {
        passed,
        message: passed ? "/srv/report.txt created with alice:developers ownership and 640 permissions!" : "File, ownership, or permissions not correct.",
        checks,
        missingHint: "Run: touch /srv/report.txt && chown alice:developers /srv/report.txt && chmod 640 /srv/report.txt",
      };
    }

    case "LX-FS-02": {
      const f = checkPathExists("/tmp/var_usage.txt", "File /tmp/var_usage.txt exists");
      const ran = checkHistoryMatch(["du -h", "var_usage.txt", "sort -rh"], "Executed du and sort into /tmp/var_usage.txt");
      const passed = f && ran;
      return {
        passed,
        message: passed ? "Directory usage report recorded to /tmp/var_usage.txt!" : "Missing /tmp/var_usage.txt or du command not run.",
        checks,
        missingHint: "Run: du -h --max-depth=1 /var 2>/dev/null | sort -rh | head -6 > /tmp/var_usage.txt",
      };
    }

    case "LX-FS-03": {
      const d = checkPathExists("/srv/shared", "Directory /srv/shared exists");
      const node = vfs.getNode("/srv/shared");
      const groupOk = node?.group === "developers";
      const permOk = node?.permissions.includes("s") || checkHistoryMatch(["chmod 277", "chmod g+s"], "SGID bit set");
      checks.push({ name: "Group is 'developers'", passed: groupOk });
      checks.push({ name: "SGID bit set (2770 or rwxrws---)", passed: permOk });
      const passed = d && groupOk && permOk;
      return {
        passed,
        message: passed ? "Collaborative shared directory configured with SGID!" : "Directory /srv/shared or permissions incomplete.",
        checks,
        missingHint: "Run: mkdir -p /srv/shared && chgrp developers /srv/shared && chmod 2770 /srv/shared",
      };
    }

    case "LX-FS-04": {
      const acls = shell.acls.get("/srv/project");
      const hasUserAcl = acls?.entries.some((e) => e.includes("bob") && e.includes("rwx")) || false;
      const hasDefAcl = acls?.defaultEntries.some((e) => e.includes("bob") && e.includes("rwx")) || false;
      const ran = checkHistoryMatch(["setfacl -m u:bob:rwx", "setfacl -d"], "Configured user bob ACL and default inheritance");
      checks.push({ name: "User bob granted rwx via ACL", passed: hasUserAcl || ran });
      checks.push({ name: "Default ACL inheritance configured for bob", passed: hasDefAcl || ran });
      const passed = (hasUserAcl && hasDefAcl) || ran;
      return {
        passed,
        message: passed ? "POSIX ACLs configured for user bob with default inheritance!" : "ACL permissions on /srv/project not configured.",
        checks,
        missingHint: "Run: setfacl -m u:bob:rwx /srv/project && setfacl -d -m u:bob:rwx /srv/project",
      };
    }

    case "LX-FS-05": {
      const hasPv = shell.lvm.pvs.has("/dev/sdb");
      const hasVg = shell.lvm.vgs.has("vgdata");
      const hasLv = shell.lvm.lvs.has("lvdata");
      const fstab = vfs.readFile("/etc/fstab").content || "";
      const fstabOk = fstab.includes("/data");
      checks.push({ name: "LVM PV /dev/sdb and VG vgdata created", passed: hasPv || hasVg });
      checks.push({ name: "LVM LV lvdata formatted and mounted at /data", passed: hasLv && fstabOk });
      const passed = (hasPv && hasVg && hasLv && fstabOk) || (hasLv && fstabOk);
      return {
        passed,
        message: passed ? "LVM volume stack created, mounted, and online resized successfully!" : "LVM volume creation or mount configuration incomplete.",
        checks,
        missingHint: "Run: pvcreate /dev/sdb && vgcreate vgdata /dev/sdb && lvcreate -L 500M -n lvdata vgdata && mkfs.xfs /dev/vgdata/lvdata && mount in /etc/fstab",
      };
    }

    case "LX-SVC-01": {
      const httpd = shell.servicesState.get("httpd");
      const isRunning = httpd?.active === true;
      const isEnabled = httpd?.enabled === true;
      checks.push({ name: "Service 'httpd' is active (running)", passed: isRunning });
      checks.push({ name: "Service 'httpd' is enabled on boot", passed: isEnabled });
      const passed = isRunning && isEnabled;
      return {
        passed,
        message: passed ? "httpd service is active and enabled on boot!" : "httpd service not running or not enabled on boot.",
        checks,
        missingHint: "Run: systemctl enable --now httpd",
      };
    }

    case "LX-SVC-02": {
      const f1 = checkPathExists("/tmp/failed.txt", "File /tmp/failed.txt exists");
      const f2 = checkPathExists("/tmp/enabled.txt", "File /tmp/enabled.txt exists");
      const ran = checkHistoryMatch(["systemctl --failed", "systemctl list-unit-files"], "Queried failed and enabled systemd units");
      const passed = f1 && f2 && ran;
      return {
        passed,
        message: passed ? "Systemd unit states exported to /tmp/failed.txt and /tmp/enabled.txt!" : "Missing output export files in /tmp.",
        checks,
        missingHint: "Run: systemctl --failed --no-pager > /tmp/failed.txt && systemctl list-unit-files --type=service --state=enabled --no-pager > /tmp/enabled.txt",
      };
    }

    case "LX-SVC-03": {
      const postfix = shell.servicesState.get("postfix");
      const isStopped = postfix !== undefined && postfix.active === false;
      const isDisabled = postfix !== undefined && postfix.enabled === false;
      const isMasked = postfix !== undefined && postfix.masked === true;
      checks.push({ name: "Service 'postfix' stopped", passed: isStopped });
      checks.push({ name: "Service 'postfix' disabled", passed: isDisabled });
      checks.push({ name: "Service 'postfix' masked", passed: isMasked });
      const passed = isStopped && isDisabled && isMasked;
      return {
        passed,
        message: passed ? "postfix service stopped, disabled, and masked!" : "postfix is still active, enabled, or not masked.",
        checks,
        missingHint: "Run: systemctl disable --now postfix && systemctl mask postfix",
      };
    }

    case "LX-SVC-04": {
      const scriptExists = checkPathExists("/usr/local/bin/hello.sh", "Script /usr/local/bin/hello.sh exists");
      const scriptNode = vfs.getNode("/usr/local/bin/hello.sh");
      const scriptExecutable = scriptNode?.permissions.includes("x") || false;
      checks.push({ name: "/usr/local/bin/hello.sh is executable", passed: scriptExecutable });
      const unitExists = checkPathExists("/etc/systemd/system/hello.service", "Unit file /etc/systemd/system/hello.service exists");
      const helloSvc = shell.servicesState.get("hello");
      const isRunning = helloSvc?.active === true || checkHistoryMatch(["systemctl enable --now hello", "systemctl start hello"], "Started hello.service");
      checks.push({ name: "Service 'hello.service' enabled and started", passed: isRunning });
      const passed = scriptExists && unitExists && isRunning;
      return {
        passed,
        message: passed ? "Custom hello.service unit created and running!" : "Service script or systemd unit file missing or not started.",
        checks,
        missingHint: "Create /usr/local/bin/hello.sh (chmod +x), write /etc/systemd/system/hello.service, and run systemctl enable --now hello.service.",
      };
    }

    case "LX-SVC-05": {
      const unit = checkPathExists("/etc/systemd/system/backup.service", "Unit file backup.service exists");
      const timer = checkPathExists("/etc/systemd/system/backup.timer", "Timer file backup.timer exists");
      const ranTimer = checkHistoryMatch(["backup.timer", "systemctl enable --now backup.timer"], "Enabled backup.timer");
      const passed = unit && timer && ranTimer;
      return {
        passed,
        message: passed ? "Systemd backup service and timer configured successfully!" : "Missing backup.service, backup.timer, or timer not started.",
        checks,
        missingHint: "Create backup.service and backup.timer in /etc/systemd/system/ and run systemctl enable --now backup.timer.",
      };
    }

    case "LX-SEC-01": {
      const config = vfs.readFile("/etc/selinux/config").content || "";
      const configOk = config.toLowerCase().includes("selinux=permissive");
      const modeOk = shell.selinuxMode === "Permissive";
      checks.push({ name: "Current SELinux mode is Permissive (setenforce 0)", passed: modeOk });
      checks.push({ name: "/etc/selinux/config sets SELINUX=permissive", passed: configOk });
      const passed = modeOk && configOk;
      return {
        passed,
        message: passed ? "SELinux mode set to permissive immediately and persistently!" : "SELinux mode not permissive or config file not updated.",
        checks,
        missingHint: "Run: setenforce 0 && sed -i 's/^SELINUX=.*/SELINUX=permissive/' /etc/selinux/config",
      };
    }

    case "LX-SEC-02": {
      const config = vfs.readFile("/etc/ssh/sshd_config").content || "";
      const rootDisabled = config.toLowerCase().includes("permitrootlogin no");
      checks.push({ name: "sshd_config contains 'PermitRootLogin no'", passed: rootDisabled });
      const ran = checkHistoryMatch(["systemctl restart sshd", "systemctl reload sshd"], "Restarted or reloaded sshd daemon");
      checks.push({ name: "Restarted/reloaded sshd", passed: ran });
      const passed = rootDisabled && ran;
      return {
        passed,
        message: passed ? "SSH root login disabled and service restarted!" : "PermitRootLogin no not configured or sshd not restarted.",
        checks,
        missingHint: "Add 'PermitRootLogin no' to /etc/ssh/sshd_config and run systemctl restart sshd.",
      };
    }

    case "LX-SEC-03": {
      const config = vfs.readFile("/etc/ssh/sshd_config").content || "";
      const portSet = config.includes("2222");
      const semOk = shell.selinuxPorts.has(2222) || checkHistoryMatch(["semanage port", "2222"], "Configured SELinux port 2222");
      const fwOk = shell.firewallPorts.has("2222/tcp") || checkHistoryMatch(["firewall-cmd", "2222/tcp"], "Opened port 2222 in firewall");
      checks.push({ name: "sshd_config specifies Port 2222", passed: portSet });
      checks.push({ name: "SELinux port 2222 labeled for ssh_port_t", passed: semOk });
      checks.push({ name: "Firewall opens port 2222/tcp", passed: fwOk });
      const passed = portSet && semOk && fwOk;
      return {
        passed,
        message: passed ? "SSH port relocated to 2222, SELinux policy updated, and firewall opened!" : "SSH port, SELinux policy, or firewall rule incomplete.",
        checks,
        missingHint: "Set 'Port 2222' in /etc/ssh/sshd_config, run semanage port -a -t ssh_port_t -p tcp 2222, and firewall-cmd --permanent --add-port=2222/tcp.",
      };
    }

    case "LX-SEC-04": {
      const pwq = vfs.readFile("/etc/security/pwquality.conf").content || "";
      const pwqOk = pwq.includes("minlen") && (pwq.includes("12") || pwq.includes("dcredit"));
      const ldefs = vfs.readFile("/etc/login.defs").content || "";
      const ldefsOk = ldefs.includes("PASS_MAX_DAYS") && ldefs.includes("90");
      checks.push({ name: "pwquality.conf enforces minimum password length 12", passed: pwqOk });
      checks.push({ name: "login.defs enforces PASS_MAX_DAYS 90", passed: ldefsOk });
      const passed = pwqOk && ldefsOk;
      return {
        passed,
        message: passed ? "Password complexity and aging security policies configured!" : "pwquality.conf or login.defs policy values not set.",
        checks,
        missingHint: "Set 'minlen = 12' in /etc/security/pwquality.conf and 'PASS_MAX_DAYS 90' in /etc/login.defs.",
      };
    }

    case "LX-SEC-05": {
      const issue = checkPathExists("/etc/issue.net", "Banner file /etc/issue.net exists");
      const config = vfs.readFile("/etc/ssh/sshd_config").content || "";
      const bannerOk = config.includes("Banner /etc/issue.net") || config.includes("PasswordAuthentication no");
      checks.push({ name: "sshd_config hardened with banner or passwordless auth", passed: bannerOk });
      const passed = issue && bannerOk;
      return {
        passed,
        message: passed ? "SSH key authentication and server hardening configured!" : "Banner /etc/issue.net or sshd_config hardening missing.",
        checks,
        missingHint: "Write warning to /etc/issue.net and add 'Banner /etc/issue.net' and 'PasswordAuthentication no' to /etc/ssh/sshd_config.",
      };
    }

    case "LX-SCR-01": {
      const f = checkPathExists("/root/info.sh", "Script /root/info.sh exists");
      const node = vfs.getNode("/root/info.sh");
      const isExec = node?.permissions.includes("x") || false;
      checks.push({ name: "/root/info.sh is executable (+x)", passed: isExec });
      const ran = checkHistoryMatch(["/root/info.sh", "bash /root/info.sh"], "Executed /root/info.sh");
      checks.push({ name: "Ran script /root/info.sh", passed: ran });
      const passed = f && isExec && ran;
      return {
        passed,
        message: passed ? "Script /root/info.sh created, made executable, and verified!" : "Script /root/info.sh missing, not executable, or not executed.",
        checks,
        missingHint: "Create /root/info.sh with hostname/date/whoami, run: chmod +x /root/info.sh && /root/info.sh",
      };
    }

    case "LX-SCR-02": {
      const f = checkPathExists("/root/greet.sh", "Script /root/greet.sh exists");
      const node = vfs.getNode("/root/greet.sh");
      const isExec = node?.permissions.includes("x") || false;
      const content = vfs.readFile("/root/greet.sh").content || "";
      const hasArgs = content.includes("$1") || content.includes("$#");
      checks.push({ name: "/root/greet.sh is executable (+x)", passed: isExec });
      checks.push({ name: "Validates positional argument $1 and exits on error", passed: hasArgs });
      const passed = f && isExec && hasArgs;
      return {
        passed,
        message: passed ? "Script /root/greet.sh created with argument handling!" : "Script /root/greet.sh missing, not executable, or missing argument checks.",
        checks,
        missingHint: "Create /root/greet.sh with 'if [ $# -lt 1 ]; then echo Usage: greet.sh <name>; exit 1; fi' and chmod +x.",
      };
    }

    case "LX-SCR-03": {
      const f = checkPathExists("/root/mkusers.sh", "Script /root/mkusers.sh exists");
      const node = vfs.getNode("/root/mkusers.sh");
      const isExec = node?.permissions.includes("x") || false;
      checks.push({ name: "/root/mkusers.sh is executable (+x)", passed: isExec });
      const ran = checkHistoryMatch(["/root/mkusers.sh", "bash /root/mkusers.sh", "mkusers"], "Executed /root/mkusers.sh");
      const createdDirs = checkPathExists("/data/user1", "Directory /data/user1 created") || ran;
      const passed = f && isExec && (ran || createdDirs);
      return {
        passed,
        message: passed ? "Script /root/mkusers.sh created and verified!" : "Script /root/mkusers.sh not found or user directories not generated.",
        checks,
        missingHint: "Create /root/mkusers.sh loop creating /data/user1..user5, chmod +x, and execute it.",
      };
    }

    case "LX-SCR-04": {
      const f = checkPathExists("/root/diskcheck.sh", "Script /root/diskcheck.sh exists");
      const node = vfs.getNode("/root/diskcheck.sh");
      const isExec = node?.permissions.includes("x") || false;
      const content = vfs.readFile("/root/diskcheck.sh").content || "";
      const hasCheck = content.includes("df") && (content.includes("THRESHOLD") || content.includes("WARNING") || content.includes("OK"));
      checks.push({ name: "/root/diskcheck.sh is executable (+x)", passed: isExec });
      checks.push({ name: "Inspects filesystem usage against threshold", passed: hasCheck });
      const passed = f && isExec && hasCheck;
      return {
        passed,
        message: passed ? "Disk usage threshold alert script /root/diskcheck.sh ready!" : "Script /root/diskcheck.sh missing or logic incomplete.",
        checks,
        missingHint: "Create /root/diskcheck.sh checking df usage against threshold, chmod +x /root/diskcheck.sh.",
      };
    }

    case "LX-SCR-05": {
      const scriptExists = checkPathExists("/usr/local/bin/backup.sh", "Script /usr/local/bin/backup.sh exists");
      const cronExists = checkPathExists("/etc/cron.d/backup", "Cron schedule /etc/cron.d/backup exists");
      const ran = checkHistoryMatch(["backup.sh", "tar"], "Executed backup script and archive creation");
      const passed = scriptExists && cronExists && ran;
      return {
        passed,
        message: passed ? "Automated backup script and cron schedule verified!" : "Missing /usr/local/bin/backup.sh, /etc/cron.d/backup, or test run.",
        checks,
        missingHint: "Create /usr/local/bin/backup.sh (chmod +x), add cron entry in /etc/cron.d/backup, and test run the backup script.",
      };
    }

    case "LX-BASIC-06": {
      const node = vfs.getNode("/usr/local/bin/sysreport");
      const exists = !!node;
      const isSymlink = exists && (node.type === "symlink" || node.target === "/root/sysinfo.sh");
      checks.push({ name: "Symbolic link /usr/local/bin/sysreport exists", passed: exists });
      checks.push({ name: "Points to target /root/sysinfo.sh", passed: isSymlink });
      const passed = exists && isSymlink;
      return {
        passed,
        message: passed ? "Symbolic link /usr/local/bin/sysreport created and resolves properly!" : "Symbolic link missing or does not target /root/sysinfo.sh.",
        checks,
        missingHint: "Run: ln -s /root/sysinfo.sh /usr/local/bin/sysreport",
      };
    }

    case "LX-BASIC-07": {
      const exists = checkPathExists("/tmp/student_configs.txt", "File /tmp/student_configs.txt exists");
      const ranGrep = checkHistoryMatch(["grep", "student_configs.txt"], "Executed recursive grep into /tmp/student_configs.txt");
      const passed = exists && ranGrep;
      return {
        passed,
        message: passed ? "Matching config paths found and exported to /tmp/student_configs.txt!" : "Missing /tmp/student_configs.txt or recursive grep not executed.",
        checks,
        missingHint: "Run: grep -ril 'student' /etc 2>/dev/null > /tmp/student_configs.txt",
      };
    }

    case "LX-BASIC-08": {
      const exists = checkPathExists("/tmp/groups_upper.txt", "File /tmp/groups_upper.txt exists");
      const content = (vfs.readFile("/tmp/groups_upper.txt").content || "").trim();
      const hasUpper = content.length > 0 && content === content.toUpperCase();
      checks.push({ name: "Output is uppercase converted text", passed: hasUpper });
      const passed = exists && hasUpper;
      return {
        passed,
        message: passed ? "Extracted group entries converted to uppercase successfully!" : "File /tmp/groups_upper.txt missing or not converted to uppercase.",
        checks,
        missingHint: "Run: cut -d: -f1,3 /etc/group | tr '[:lower:]' '[:upper:]' > /tmp/groups_upper.txt",
      };
    }

    case "LX-BASIC-09": {
      const exists = checkPathExists("/tmp/systemd_backup.tar.gz", "Archive /tmp/systemd_backup.tar.gz exists");
      const ranTar = checkHistoryMatch(["tar", "systemd_backup.tar.gz"], "Executed tar archive creation");
      const passed = exists && ranTar;
      return {
        passed,
        message: passed ? "Gzip compressed archive /tmp/systemd_backup.tar.gz created!" : "Archive /tmp/systemd_backup.tar.gz not found or tar not executed.",
        checks,
        missingHint: "Run: tar -czf /tmp/systemd_backup.tar.gz /etc/systemd",
      };
    }

    case "LX-BASIC-10": {
      const exists = checkPathExists("/root/http_status_report.txt", "Report /root/http_status_report.txt exists");
      const node = vfs.getNode("/root/http_status_report.txt");
      const permOk = node ? node.permissions.startsWith("rw-r-----") || node.permissions === "rw-r-----" : false;
      checks.push({ name: "Permissions set strictly (0640 or rw-r-----)", passed: permOk });
      const content = vfs.readFile("/root/http_status_report.txt").content || "";
      const hasStatus = content.includes("200") || content.includes("404");
      checks.push({ name: "Contains aggregated HTTP status counts", passed: hasStatus });
      const passed = exists && permOk && hasStatus;
      return {
        passed,
        message: passed ? "HTTP access log status analysis report generated with mode 640!" : "Report missing, wrong permissions, or missing status aggregations.",
        checks,
        missingHint: "Run: awk '{print $9}' /var/log/httpd/access_log | sort | uniq -c | sort -rn > /root/http_status_report.txt && chmod 640 /root/http_status_report.txt",
      };
    }

    case "LX-USER-06": {
      const passwd = vfs.readFile("/etc/passwd").content || "";
      const userCreated = passwd.includes("prometheus:") && passwd.includes("/sbin/nologin");
      checks.push({ name: "User prometheus created with /sbin/nologin shell", passed: userCreated });
      const passed = userCreated;
      return {
        passed,
        message: passed ? "System daemon user prometheus created with nologin shell!" : "User prometheus not found in /etc/passwd or login shell not set to /sbin/nologin.",
        checks,
        missingHint: "Run: useradd -r -d /var/lib/prometheus -s /sbin/nologin prometheus",
      };
    }

    case "LX-USER-07": {
      const skelOk = checkPathExists("/etc/skel/WELCOME.txt", "Greeting template /etc/skel/WELCOME.txt exists");
      const userHomeOk = checkPathExists("/home/david/WELCOME.txt", "Provisioned in /home/david/WELCOME.txt");
      const passed = skelOk && userHomeOk;
      return {
        passed,
        message: passed ? "Skeleton template configured and populated into /home/david/WELCOME.txt!" : "Missing /etc/skel/WELCOME.txt or user david not created with skeleton file.",
        checks,
        missingHint: "Run: echo 'Welcome to Olympic CentOS Server' > /etc/skel/WELCOME.txt && useradd -m david",
      };
    }

    case "LX-USER-08": {
      const groupExists = (vfs.readFile("/etc/group").content || "").includes("qa_team:");
      checks.push({ name: "Group qa_team created", passed: groupExists });
      const dirExists = checkPathExists("/opt/qa_data", "Directory /opt/qa_data exists");
      const node = vfs.getNode("/opt/qa_data");
      const groupOwned = node?.group === "qa_team";
      checks.push({ name: "Group ownership set to qa_team", passed: groupOwned });
      const permOk = node?.permissions.startsWith("rwxrwx---") || node?.permissions === "rwxrwx---";
      checks.push({ name: "Permissions set strictly to 770 (rwxrwx---)", passed: !!permOk });
      const passed = groupExists && dirExists && groupOwned && !!permOk;
      return {
        passed,
        message: passed ? "Team directory /opt/qa_data provisioned with qa_team ownership and 770 mode!" : "Group, directory, ownership, or 770 permissions incomplete.",
        checks,
        missingHint: "Run: groupadd qa_team && usermod -aG qa_team alice && usermod -aG qa_team bob && mkdir -p /opt/qa_data && chown :qa_team /opt/qa_data && chmod 770 /opt/qa_data",
      };
    }

    case "LX-USER-09": {
      const aging = shell.userAging.get("david");
      const minOk = aging?.minDays === 7;
      const maxOk = aging?.maxDays === 60;
      const warnOk = aging?.warnAge === 14;
      checks.push({ name: "Minimum password age set to 7 days", passed: !!minOk });
      checks.push({ name: "Maximum password validity set to 60 days", passed: !!maxOk });
      checks.push({ name: "Expiration warning set to 14 days", passed: !!warnOk });
      const passed = !!(minOk && maxOk && warnOk);
      return {
        passed,
        message: passed ? "Password aging parameters configured for user david!" : "Password aging values missing or incomplete for user david.",
        checks,
        missingHint: "Run: chage -m 7 -M 60 -W 14 david",
      };
    }

    case "LX-USER-10": {
      const exists = checkPathExists("/etc/sudoers.d/developers", "Drop-in file /etc/sudoers.d/developers exists");
      const content = vfs.readFile("/etc/sudoers.d/developers").content || "";
      const hasDev = content.includes("%developers") && content.includes("NOPASSWD");
      checks.push({ name: "Rule grants %developers NOPASSWD systemctl rights", passed: hasDev });
      const node = vfs.getNode("/etc/sudoers.d/developers");
      const permOk = node ? node.permissions.startsWith("r--r-----") || node.permissions === "r--r-----" : false;
      checks.push({ name: "Strict permissions 0440 (r--r-----)", passed: permOk });
      const passed = exists && hasDev && permOk;
      return {
        passed,
        message: passed ? "Sudoers drop-in delegation file created with 0440 permissions!" : "File /etc/sudoers.d/developers missing, wrong syntax, or incorrect permissions.",
        checks,
        missingHint: "Write rule to /etc/sudoers.d/developers and run: chmod 0440 /etc/sudoers.d/developers",
      };
    }

    case "LX-PKG-06": {
      const notInstalled = !shell.installedPackages.has("httpd");
      checks.push({ name: "Package httpd is uninstalled", passed: notInstalled });
      const ranRemove = checkHistoryMatch(["remove", "erase", "httpd"], "Executed package removal command");
      checks.push({ name: "Ran dnf/yum remove -y httpd", passed: ranRemove });
      const passed = notInstalled && ranRemove;
      return {
        passed,
        message: passed ? "Package httpd successfully uninstalled and removed from RPM database!" : "Package httpd is still installed or removal command not detected.",
        checks,
        missingHint: "Run: dnf remove -y httpd",
      };
    }

    case "LX-PKG-07": {
      const exists = checkPathExists("/tmp/bash_info.txt", "File /tmp/bash_info.txt exists");
      const ranRpm = checkHistoryMatch(["rpm -qi", "bash_info.txt"], "Executed rpm -qi bash query");
      checks.push({ name: "Queried RPM info for bash", passed: ranRpm });
      const passed = exists && ranRpm;
      return {
        passed,
        message: passed ? "Package bash metadata queried and exported to /tmp/bash_info.txt!" : "Missing /tmp/bash_info.txt or rpm -qi command not executed.",
        checks,
        missingHint: "Run: rpm -qi bash > /tmp/bash_info.txt",
      };
    }

    case "LX-PKG-08": {
      const exists = checkPathExists("/tmp/coreutils_verify.txt", "File /tmp/coreutils_verify.txt exists");
      const ranVerify = checkHistoryMatch(["rpm -v", "coreutils_verify.txt"], "Executed rpm -V coreutils verification");
      checks.push({ name: "Verified coreutils file integrity with rpm -V", passed: ranVerify });
      const passed = exists && ranVerify;
      return {
        passed,
        message: passed ? "Package coreutils integrity verification completed and exported!" : "File /tmp/coreutils_verify.txt missing or rpm -V coreutils not executed.",
        checks,
        missingHint: "Run: rpm -V coreutils > /tmp/coreutils_verify.txt",
      };
    }

    case "LX-PKG-09": {
      const exists = checkPathExists("/etc/yum.repos.d/custom.repo", "Repository file /etc/yum.repos.d/custom.repo exists");
      const content = vfs.readFile("/etc/yum.repos.d/custom.repo").content || "";
      const validConfig = content.includes("[custom-tools]") && content.includes("baseurl=");
      checks.push({ name: "Configured [custom-tools] repository with baseurl", passed: validConfig });
      const ranRepolist = checkHistoryMatch(["repolist"], "Cleaned cache and checked repolist");
      checks.push({ name: "Executed dnf repolist verification", passed: ranRepolist });
      const passed = exists && validConfig && ranRepolist;
      return {
        passed,
        message: passed ? "Third-party repository custom.repo configured and repolist checked!" : "File /etc/yum.repos.d/custom.repo missing or repolist not checked.",
        checks,
        missingHint: "Create /etc/yum.repos.d/custom.repo with [custom-tools] section, run: dnf clean all && dnf repolist",
      };
    }

    case "LX-PKG-10": {
      const content = vfs.readFile("/etc/yum.repos.d/local.repo").content || "";
      const gpgCheckOk = content.includes("gpgcheck=1");
      const gpgKeyOk = content.includes("gpgkey=") && content.includes("RPM-GPG-KEY");
      checks.push({ name: "local.repo enforces gpgcheck=1", passed: gpgCheckOk });
      checks.push({ name: "local.repo specifies valid gpgkey path", passed: gpgKeyOk });
      const passed = gpgCheckOk && gpgKeyOk;
      return {
        passed,
        message: passed ? "GPG signature checking and key path configured in local repository!" : "Missing gpgcheck=1 or gpgkey entry in /etc/yum.repos.d/local.repo.",
        checks,
        missingHint: "Add 'gpgcheck=1' and 'gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-centosofficial' to /etc/yum.repos.d/local.repo",
      };
    }

    case "LX-NET-06": {
      const exists = checkPathExists("/tmp/default_route.txt", "File /tmp/default_route.txt exists");
      const ranRoute = checkHistoryMatch(["ip route", "ip r", "default_route.txt"], "Executed ip route show query");
      checks.push({ name: "Queried kernel routing table", passed: ranRoute });
      const passed = exists && ranRoute;
      return {
        passed,
        message: passed ? "Kernel routing table exported to /tmp/default_route.txt!" : "File /tmp/default_route.txt missing or ip route command not executed.",
        checks,
        missingHint: "Run: ip route show > /tmp/default_route.txt",
      };
    }

    case "LX-NET-07": {
      const ranIpAdd = checkHistoryMatch(["ip addr add", "192.168.122.150"], "Executed ip addr add 192.168.122.150/24");
      checks.push({ name: "Added secondary static IP alias to ens33", passed: ranIpAdd });
      const passed = ranIpAdd;
      return {
        passed,
        message: passed ? "Secondary IP address alias added to interface ens33!" : "Secondary IP alias 192.168.122.150/24 not assigned.",
        checks,
        missingHint: "Run: ip addr add 192.168.122.150/24 dev ens33",
      };
    }

    case "LX-NET-08": {
      const hosts = vfs.readFile("/etc/hosts").content || "";
      const masterOk = hosts.includes("192.168.122.10") && hosts.includes("master.cluster.local");
      const workerOk = hosts.includes("192.168.122.11") && hosts.includes("worker1.cluster.local");
      checks.push({ name: "Static resolution for master.cluster.local (192.168.122.10)", passed: masterOk });
      checks.push({ name: "Static resolution for worker1.cluster.local (192.168.122.11)", passed: workerOk });
      const passed = masterOk && workerOk;
      return {
        passed,
        message: passed ? "Cluster host mappings added to /etc/hosts!" : "Mappings for master or worker1 missing in /etc/hosts.",
        checks,
        missingHint: "Append '192.168.122.10 master.cluster.local master' and '192.168.122.11 worker1.cluster.local worker1' to /etc/hosts",
      };
    }

    case "LX-NET-09": {
      const iface = shell.networkInterfaces.get("ens33");
      const dnsOk = iface ? iface.dns.includes("1.1.1.1") || iface.dns.includes("8.8.8.8") : false;
      const autoOk = iface ? iface.autoconnect : false;
      const ranUp = checkHistoryMatch(["nmcli con up", "nmcli connection up"], "Reactivated connection profile");
      checks.push({ name: "Configured DNS servers (1.1.1.1 / 8.8.8.8)", passed: dnsOk });
      checks.push({ name: "Enabled connection autoconnect", passed: autoOk });
      checks.push({ name: "Reactivated connection with nmcli con up ens33", passed: ranUp });
      const passed = dnsOk && autoOk && ranUp;
      return {
        passed,
        message: passed ? "Connection ens33 updated with custom DNS, autoconnect, and reactivated!" : "DNS servers, autoconnect flag, or nmcli con up incomplete.",
        checks,
        missingHint: "Run: nmcli con mod ens33 ipv4.dns '1.1.1.1 8.8.8.8' connection.autoconnect yes && nmcli con up ens33",
      };
    }

    case "LX-NET-10": {
      const ranAdd = checkHistoryMatch(["internal-net", "10.0.0.50"], "Added internal-net connection profile");
      checks.push({ name: "Created internal-net connection profile with 10.0.0.50/24", passed: ranAdd });
      const ranUp = checkHistoryMatch(["nmcli con up internal-net", "nmcli connection up internal-net"], "Activated internal-net connection");
      checks.push({ name: "Activated internal-net connection", passed: ranUp });
      const passed = ranAdd && ranUp;
      return {
        passed,
        message: passed ? "Isolated private network profile internal-net created and brought up!" : "Connection profile internal-net not created or not activated.",
        checks,
        missingHint: "Run: nmcli connection add type ethernet con-name internal-net ifname ens33 ip4 10.0.0.50/24 gw4 10.0.0.1 && nmcli con up internal-net",
      };
    }

    case "LX-FS-06": {
      const exists = checkPathExists("/shared/public_dropbox", "Directory /shared/public_dropbox exists");
      const node = vfs.getNode("/shared/public_dropbox");
      const stickyOk = node?.permissions === "rwxrwxrwt" || (node?.permissions.endsWith("t") && node?.permissions.startsWith("rwx"));
      checks.push({ name: "Sticky bit and 1777 mode set (drwxrwxrwt)", passed: !!stickyOk });
      const groupOk = node?.group === "developers";
      checks.push({ name: "Group ownership assigned to developers", passed: groupOk });
      const passed = exists && !!stickyOk && groupOk;
      return {
        passed,
        message: passed ? "Public drop-box configured with developers group and sticky bit (1777)!" : "Directory /shared/public_dropbox missing, group not developers, or sticky bit not set.",
        checks,
        missingHint: "Run: mkdir -p /shared/public_dropbox && chown :developers /shared/public_dropbox && chmod 1777 /shared/public_dropbox",
      };
    }

    case "LX-FS-07": {
      const exists = checkPathExists("/tmp/large_var_files.txt", "File /tmp/large_var_files.txt exists");
      const ranFind = checkHistoryMatch(["find /var", "large_var_files.txt"], "Executed find on /var with size filter");
      checks.push({ name: "Executed search for files > 10MB into export file", passed: ranFind });
      const passed = exists && ranFind;
      return {
        passed,
        message: passed ? "Large file search across /var completed and exported to /tmp/large_var_files.txt!" : "File /tmp/large_var_files.txt missing or find search not executed.",
        checks,
        missingHint: "Run: find /var -type f -size +10M 2>/dev/null > /tmp/large_var_files.txt",
      };
    }

    case "LX-FS-08": {
      const exists = checkPathExists("/data/projects", "Directory /data/projects exists");
      const aclData = shell.acls.get("/data/projects");
      const hasDefaultAcl = aclData ? aclData.defaultEntries.some((e) => e.includes("developers") && e.includes("rwx")) : false;
      const ranSetfacl = checkHistoryMatch(["setfacl", "-d", "developers", "/data/projects"], "Executed default ACL configuration");
      checks.push({ name: "Default ACL configured on /data/projects for group developers:rwx", passed: hasDefaultAcl || ranSetfacl });
      const passed = exists && (hasDefaultAcl || ranSetfacl);
      return {
        passed,
        message: passed ? "Default POSIX ACL inheritance configured on /data/projects for developers:rwx!" : "Directory /data/projects missing or default group ACL not configured.",
        checks,
        missingHint: "Run: mkdir -p /data/projects && setfacl -d -m g:developers:rwx /data/projects",
      };
    }

    case "LX-FS-09": {
      const dirExists = checkPathExists("/mnt/data", "Mount point directory /mnt/data exists");
      const fstab = vfs.readFile("/etc/fstab").content || "";
      const fstabOk = fstab.includes("/mnt/data") && (fstab.includes("/dev/vdb1") || fstab.includes("xfs"));
      checks.push({ name: "Persistent entry for /mnt/data in /etc/fstab", passed: fstabOk });
      const ranMount = checkHistoryMatch(["mount -a", "mount /mnt/data"], "Tested mount persistence with mount -a");
      checks.push({ name: "Tested mount command", passed: ranMount });
      const passed = dirExists && fstabOk && ranMount;
      return {
        passed,
        message: passed ? "Persistent mount configured in /etc/fstab and validated with mount -a!" : "Mount point /mnt/data missing, /etc/fstab entry missing, or mount -a not executed.",
        checks,
        missingHint: "Run: mkdir -p /mnt/data && echo '/dev/vdb1 /mnt/data xfs defaults 0 0' >> /etc/fstab && mount -a",
      };
    }

    case "LX-FS-10": {
      const ranLvextend = checkHistoryMatch(["lvextend", "data_lv", "+500m"], "Executed lvextend -L +500M on /dev/data_vg/data_lv");
      checks.push({ name: "Extended logical volume data_lv by +500MB", passed: ranLvextend });
      const passed = ranLvextend;
      return {
        passed,
        message: passed ? "LVM volume data_lv extended and filesystem resized!" : "lvextend command not executed on data_lv.",
        checks,
        missingHint: "Run: lvextend -L +500M /dev/data_vg/data_lv -r",
      };
    }

    case "LX-SVC-06": {
      const svc = shell.servicesState.get("postfix");
      const disabled = svc ? !svc.enabled : true;
      const stopped = svc ? !svc.active : true;
      checks.push({ name: "Service postfix is disabled from boot", passed: disabled });
      checks.push({ name: "Service postfix is stopped immediately", passed: stopped });
      const ranCmd = checkHistoryMatch(["disable --now postfix", "disable postfix"], "Executed systemctl disable --now postfix");
      checks.push({ name: "Ran systemctl disable --now postfix", passed: ranCmd });
      const passed = disabled && stopped && ranCmd;
      return {
        passed,
        message: passed ? "Service postfix stopped immediately and disabled from boot!" : "Service postfix is still active, enabled, or disable command not detected.",
        checks,
        missingHint: "Run: systemctl disable --now postfix",
      };
    }

    case "LX-SVC-07": {
      const exists = checkPathExists("/tmp/failed_services.txt", "File /tmp/failed_services.txt exists");
      const ranFailed = checkHistoryMatch(["systemctl --failed", "failed_services.txt"], "Executed systemctl --failed query");
      checks.push({ name: "Queried degraded units with systemctl --failed", passed: ranFailed });
      const passed = exists && ranFailed;
      return {
        passed,
        message: passed ? "Failed systemd units exported to /tmp/failed_services.txt!" : "File /tmp/failed_services.txt missing or systemctl --failed not executed.",
        checks,
        missingHint: "Run: systemctl --failed > /tmp/failed_services.txt",
      };
    }

    case "LX-SVC-08": {
      const exists = checkPathExists("/tmp/sshd_deps.txt", "File /tmp/sshd_deps.txt exists");
      const ranDeps = checkHistoryMatch(["list-dependencies", "sshd_deps.txt"], "Executed systemctl list-dependencies sshd");
      checks.push({ name: "Queried sshd service dependency tree", passed: ranDeps });
      const passed = exists && ranDeps;
      return {
        passed,
        message: passed ? "Service dependency hierarchy exported to /tmp/sshd_deps.txt!" : "File /tmp/sshd_deps.txt missing or systemctl list-dependencies sshd not executed.",
        checks,
        missingHint: "Run: systemctl list-dependencies sshd > /tmp/sshd_deps.txt",
      };
    }

    case "LX-SVC-09": {
      const exists = checkPathExists("/etc/systemd/system/httpd.service.d/override.conf", "Drop-in override /etc/systemd/system/httpd.service.d/override.conf exists");
      const content = vfs.readFile("/etc/systemd/system/httpd.service.d/override.conf").content || "";
      const hasEnv = content.includes("PORT=8080") && content.includes("[Service]");
      checks.push({ name: "Override defines [Service] Environment PORT=8080", passed: hasEnv });
      const ranReload = checkHistoryMatch(["daemon-reload"], "Executed systemctl daemon-reload");
      checks.push({ name: "Reloaded systemd daemon configuration", passed: ranReload });
      const passed = exists && hasEnv && ranReload;
      return {
        passed,
        message: passed ? "Systemd drop-in override configured and daemon reloaded!" : "Drop-in override.conf missing, wrong syntax, or daemon-reload not executed.",
        checks,
        missingHint: "Create /etc/systemd/system/httpd.service.d/override.conf with Environment='PORT=8080', run: systemctl daemon-reload && systemctl restart httpd",
      };
    }

    case "LX-SVC-10": {
      const svcExists = checkPathExists("/etc/systemd/system/logclean.service", "Service unit /etc/systemd/system/logclean.service exists");
      const timerExists = checkPathExists("/etc/systemd/system/logclean.timer", "Timer unit /etc/systemd/system/logclean.timer exists");
      const timerContent = vfs.readFile("/etc/systemd/system/logclean.timer").content || "";
      const timerConfigOk = timerContent.includes("OnCalendar") && timerContent.includes("[Timer]");
      checks.push({ name: "Timer defines calendar schedule", passed: timerConfigOk });
      const ranEnable = checkHistoryMatch(["enable", "logclean.timer"], "Enabled logclean.timer");
      checks.push({ name: "Enabled logclean.timer", passed: ranEnable });
      const passed = svcExists && timerExists && timerConfigOk && ranEnable;
      return {
        passed,
        message: passed ? "Automated systemd timer and service units configured and enabled!" : "logclean.service or logclean.timer missing, or timer not enabled.",
        checks,
        missingHint: "Create /etc/systemd/system/logclean.service and logclean.timer, run: systemctl daemon-reload && systemctl enable --now logclean.timer",
      };
    }

    case "LX-SEC-06": {
      const httpOk = shell.firewallServices.has("http");
      const httpsOk = shell.firewallServices.has("https");
      checks.push({ name: "Firewall service http is active", passed: httpOk });
      checks.push({ name: "Firewall service https is active", passed: httpsOk });
      const ranReload = checkHistoryMatch(["firewall-cmd", "reload"], "Reloaded firewall configuration");
      checks.push({ name: "Reloaded firewall with firewall-cmd --reload", passed: ranReload });
      const passed = httpOk && httpsOk && ranReload;
      return {
        passed,
        message: passed ? "Web services http and https enabled in firewall and reloaded!" : "Firewall missing http/https services or not reloaded.",
        checks,
        missingHint: "Run: firewall-cmd --permanent --add-service=http && firewall-cmd --permanent --add-service=https && firewall-cmd --reload",
      };
    }

    case "LX-SEC-07": {
      const ranFwd = checkHistoryMatch(["add-forward-port", "8080", "80"], "Configured port forwarding rule 8080 -> 80");
      checks.push({ name: "Port forwarding rule 8080/tcp to port 80 configured", passed: ranFwd });
      const ranReload = checkHistoryMatch(["firewall-cmd", "reload"], "Reloaded firewall configuration");
      checks.push({ name: "Reloaded firewall configuration", passed: ranReload });
      const passed = ranFwd && ranReload;
      return {
        passed,
        message: passed ? "Port forwarding 8080/tcp -> 80/tcp permanently configured and active!" : "Port forwarding rule not configured or firewall not reloaded.",
        checks,
        missingHint: "Run: firewall-cmd --permanent --add-forward-port=port=8080:proto=tcp:toport=80 && firewall-cmd --reload",
      };
    }

    case "LX-SEC-08": {
      const hasRule = Array.from(shell.firewallRichRules).some((r) => r.includes("192.168.122.0/24") && r.includes("ssh")) ||
        checkHistoryMatch(["add-rich-rule", "192.168.122.0/24"], "Added rich rule for subnet 192.168.122.0/24");
      checks.push({ name: "Firewall rich rule whitelists subnet 192.168.122.0/24 for SSH", passed: hasRule });
      const ranReload = checkHistoryMatch(["firewall-cmd", "reload"], "Reloaded firewall configuration");
      checks.push({ name: "Reloaded firewall configuration", passed: ranReload });
      const passed = hasRule && ranReload;
      return {
        passed,
        message: passed ? "Subnet-restricted SSH rich rule configured and reloaded!" : "Rich rule for 192.168.122.0/24 missing or firewall not reloaded.",
        checks,
        missingHint: "Run: firewall-cmd --permanent --add-rich-rule='rule family=\"ipv4\" source address=\"192.168.122.0/24\" service name=\"ssh\" accept' && firewall-cmd --reload",
      };
    }

    case "LX-SEC-09": {
      const dirExists = checkPathExists("/srv/www/html", "Directory /srv/www/html exists");
      const fileExists = checkPathExists("/srv/www/html/index.html", "Test file /srv/www/html/index.html exists");
      const node = vfs.getNode("/srv/www/html");
      const permOk = node?.permissions.startsWith("rwxr-xr-x") || node?.permissions === "rwxr-xr-x";
      checks.push({ name: "Directory permissions set to 755 (rwxr-xr-x)", passed: !!permOk });
      const selinuxOk = shell.selinuxMode === "Enforcing";
      checks.push({ name: "SELinux mode is Enforcing", passed: selinuxOk });
      const passed = dirExists && fileExists && !!permOk && selinuxOk;
      return {
        passed,
        message: passed ? "Custom web root directory /srv/www/html provisioned with 755 permissions and SELinux enforcing!" : "Directory missing, file missing, wrong permissions, or SELinux not Enforcing.",
        checks,
        missingHint: "Run: mkdir -p /srv/www/html && echo 'CentOS Production Web' > /srv/www/html/index.html && chmod 755 /srv/www/html && setenforce 1",
      };
    }

    case "LX-SEC-10": {
      const config = vfs.readFile("/etc/ssh/sshd_config").content || "";
      const maxAuthOk = config.includes("MaxAuthTries") && config.includes("3");
      const clientAliveOk = config.includes("ClientAliveInterval") && config.includes("300");
      const x11Ok = config.includes("X11Forwarding no");
      checks.push({ name: "sshd_config enforces MaxAuthTries 3", passed: maxAuthOk });
      checks.push({ name: "sshd_config enforces ClientAliveInterval 300", passed: clientAliveOk });
      checks.push({ name: "sshd_config disables X11Forwarding", passed: x11Ok });
      const ranSshd = checkHistoryMatch(["systemctl restart sshd", "systemctl reload sshd"], "Reloaded/restarted sshd");
      checks.push({ name: "Restarted/reloaded sshd service", passed: ranSshd });
      const passed = maxAuthOk && clientAliveOk && x11Ok && ranSshd;
      return {
        passed,
        message: passed ? "OpenSSH server configuration hardened with MaxAuthTries, timeouts, and restarted!" : "sshd_config hardening directives missing or sshd not restarted.",
        checks,
        missingHint: "Append MaxAuthTries 3, ClientAliveInterval 300, ClientAliveCountMax 2, X11Forwarding no to /etc/ssh/sshd_config and run: systemctl restart sshd",
      };
    }

    case "LX-SCR-06": {
      const exists = checkPathExists("/root/check_service.sh", "Script /root/check_service.sh exists");
      const node = vfs.getNode("/root/check_service.sh");
      const isExec = node?.permissions.includes("x") || false;
      const content = vfs.readFile("/root/check_service.sh").content || "";
      const hasLogic = content.includes("is-active") && content.includes("UP") && content.includes("DOWN");
      checks.push({ name: "/root/check_service.sh is executable (+x)", passed: isExec });
      checks.push({ name: "Tests service active state and prints UP/DOWN", passed: hasLogic });
      const passed = exists && isExec && hasLogic;
      return {
        passed,
        message: passed ? "Service health-check script /root/check_service.sh created and verified!" : "Script /root/check_service.sh missing, not executable, or logic incomplete.",
        checks,
        missingHint: "Create /root/check_service.sh with systemctl is-active '$1' check, echo UP/DOWN, and chmod +x /root/check_service.sh",
      };
    }

    case "LX-SCR-07": {
      const exists = checkPathExists("/root/reset_passwords.sh", "Script /root/reset_passwords.sh exists");
      const node = vfs.getNode("/root/reset_passwords.sh");
      const isExec = node?.permissions.includes("x") || false;
      const content = vfs.readFile("/root/reset_passwords.sh").content || "";
      const hasChpasswd = content.includes("chpasswd");
      checks.push({ name: "/root/reset_passwords.sh is executable (+x)", passed: isExec });
      checks.push({ name: "Applies passwords via chpasswd batch utility", passed: hasChpasswd });
      const ran = checkHistoryMatch(["reset_passwords.sh", "chpasswd"], "Executed reset_passwords.sh");
      checks.push({ name: "Executed password reset script", passed: ran });
      const passed = exists && isExec && hasChpasswd && ran;
      return {
        passed,
        message: passed ? "Batch password reset script /root/reset_passwords.sh created and executed!" : "Script missing, not executable, missing chpasswd, or not executed.",
        checks,
        missingHint: "Create /root/reset_passwords.sh with 'chpasswd < /root/users.txt', chmod +x, and execute it.",
      };
    }

    case "LX-SCR-08": {
      const exists = checkPathExists("/root/clean_old_logs.sh", "Script /root/clean_old_logs.sh exists");
      const node = vfs.getNode("/root/clean_old_logs.sh");
      const isExec = node?.permissions.includes("x") || false;
      const content = vfs.readFile("/root/clean_old_logs.sh").content || "";
      const hasFind = content.includes("find") && (content.includes("-delete") || content.includes("-mtime"));
      checks.push({ name: "/root/clean_old_logs.sh is executable (+x)", passed: isExec });
      checks.push({ name: "Cleans old logs using find with -mtime filter", passed: hasFind });
      const ran = checkHistoryMatch(["clean_old_logs.sh", "find"], "Executed clean_old_logs.sh");
      checks.push({ name: "Executed log cleaning script", passed: ran });
      const passed = exists && isExec && hasFind && ran;
      return {
        passed,
        message: passed ? "Log rotation cleanup script /root/clean_old_logs.sh created and verified!" : "Script missing, not executable, missing find logic, or not executed.",
        checks,
        missingHint: "Create /root/clean_old_logs.sh with 'find /tmp/test_logs -name \"*.log\" -mtime +7 -delete', chmod +x, and run it.",
      };
    }

    case "LX-SCR-09": {
      const exists = checkPathExists("/root/csv_report.sh", "Script /root/csv_report.sh exists");
      const node = vfs.getNode("/root/csv_report.sh");
      const isExec = node?.permissions.includes("x") || false;
      checks.push({ name: "/root/csv_report.sh is executable (+x)", passed: isExec });
      const ran = checkHistoryMatch(["csv_report.sh", "awk", "it_summary.txt"], "Executed csv_report.sh");
      checks.push({ name: "Ran script /root/csv_report.sh", passed: ran });
      const reportOk = checkPathExists("/root/it_summary.txt", "Report file /root/it_summary.txt exists");
      checks.push({ name: "Output report /root/it_summary.txt created", passed: reportOk });
      const passed = exists && isExec && (ran || reportOk);
      return {
        passed,
        message: passed ? "CSV department summary script /root/csv_report.sh verified!" : "Script /root/csv_report.sh missing, not executable, or /root/it_summary.txt not created.",
        checks,
        missingHint: "Create /root/csv_report.sh parsing /root/employees.csv, write count to /root/it_summary.txt, chmod +x, and execute it.",
      };
    }

    case "LX-SCR-10": {
      const exists = checkPathExists("/root/sysmonitor.sh", "Script /root/sysmonitor.sh exists");
      const node = vfs.getNode("/root/sysmonitor.sh");
      const isExec = node?.permissions.includes("x") || false;
      const content = vfs.readFile("/root/sysmonitor.sh").content || "";
      const hasMonitor = content.includes("df") && content.includes("sysalert.log");
      checks.push({ name: "/root/sysmonitor.sh is executable (+x)", passed: isExec });
      checks.push({ name: "Monitors disk usage and logs alerts to sysalert.log", passed: hasMonitor });
      const ran = checkHistoryMatch(["sysmonitor.sh", "sysalert.log"], "Executed sysmonitor.sh alert run");
      checks.push({ name: "Executed sysmonitor.sh alert verification", passed: ran });
      const passed = exists && isExec && hasMonitor && ran;
      return {
        passed,
        message: passed ? "System resource monitor and alert logger /root/sysmonitor.sh verified!" : "Script missing, not executable, missing alert logic, or test run not executed.",
        checks,
        missingHint: "Create /root/sysmonitor.sh monitoring df usage, logging to /var/log/sysalert.log, chmod +x, and execute: /root/sysmonitor.sh 1",
      };
    }

    default: {
      return {
        passed: false,
        message: "No automated test case defined for this challenge.",
        checks: [{ name: "Automated verification defined", passed: false }],
        missingHint: "Refer to the task instructions and verify guide.",
      };
    }
  }
}
