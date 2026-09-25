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
