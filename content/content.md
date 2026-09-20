# LinuxDrill: ITSO 2026 Linux Administration Trainer

> Practice content for the 15th IT Skills Olympics, Linux Administration (CentOS on VMware, individual, on-site).
> **Practice only.** AI tools are prohibited during the real contest. Use this material to train, then go in with your own hands and memory.

---

## 0. How this file is organised (for the website)

Every problem uses the same fields so the site can parse it:

| Field | Meaning |
|---|---|
| `ID` | Unique code, e.g. `LX-USER-03` |
| `Difficulty` / `Points` | Easy = 5, Average = 10, Difficult = 50 (same as the contest) |
| `Task` | What you must do (what a judge would read to you) |
| `Setup` | Commands to prepare the machine before you start (optional) |
| `Hints` | 3 levels: 1 = concept nudge, 2 = which command, 3 = command skeleton |
| `Solution` | Full working answer |
| `Verify` | How the judge checks it, so you can check yourself |
| `Watch out` | The classic mistake that loses points |

**Suggested site features**
- Filter by topic and difficulty, with a solved / unsolved tracker.
- Hints unlock one at a time; using a hint costs "practice points" (not real points).
- A timer per problem, because ties are decided by fastest time.
- A "Mock Contest" mode: 120-minute countdown, random mix of problems, score out of a total.
- A "Verify" panel with a copy button for each check command.

---

## 1. Contest facts (from the official sheet)

| Item | Detail |
|---|---|
| Format | Individual, on-site, 1 participant per school |
| Machine | CentOS installed through VMware |
| Duration | 3 hours: **2 hours contest proper + 1 hour checking** |
| Scoring | Easy 5 pts, Average 10 pts, Difficult 50 pts |
| Judging | Points only if the judges deem the output correct |
| Tie-breaker | Shortest total time |
| Finishing a problem | Say "Done" and raise both hands; marshal records the time |
| Forbidden | AI tools, chatbots, outside help. Immediate disqualification |

**Topics covered:** Basic Commands, User & Group Management, Package Management, Networking, File System Management, Service Management, Security, Batch Scripting.
The intro also mentions firewall, systemd, performance tuning, and backup and recovery, so they are included below.

**Score maths worth remembering:** one Difficult problem (50) equals ten Easy problems (5 each). Do not skip Difficult ones, but do bank the Easy points first.

---

## 2. Read this first: CentOS version differences

The contest says "CentOS" without a version. Learn both.

| Task | CentOS 7 | CentOS Stream 8/9 |
|---|---|---|
| Package manager | `yum` | `dnf` (`yum` still works as an alias) |
| Networking tool | `nmcli`, `ifcfg-*` files, `ifconfig` may exist | `nmcli` (ifcfg files deprecated) |
| Show IPs | `ip a` | `ip a` |
| Firewall | `firewalld` | `firewalld` |
| SELinux tools package | `policycoreutils-python` | `policycoreutils-python-utils` |
| Default filesystem | XFS | XFS |

Tip: on the contest day, run `cat /etc/os-release` first (5 seconds) and know which column you are in.

---

## 3. Contest strategy (2 hours)

1. **Minute 0-5:** Read *all* problems. Mark each Easy / Average / Difficult.
2. **Minute 5-35:** Finish every Easy problem. Say "Done" right away, since time is your tie-breaker.
3. **Minute 35-75:** Do Average problems.
4. **Minute 75-115:** Attack Difficult problems. Do them in *small verified steps*.
5. **Last 5 minutes:** Re-run your verify commands. Make sure everything survives a reboot (`enabled`, `/etc/fstab`, `--permanent`).

**Golden rules**
- Anything that must survive a reboot needs a **persistent** form: `systemctl enable`, `firewall-cmd --permanent`, `/etc/fstab`, config file edits.
- Always **verify** before saying "Done".
- Before risky edits (`sshd_config`, `fstab`, `sudoers`), keep a second terminal open or make a backup: `cp file file.bak`.
- Snapshot your practice VM before training. Some drills (disks, SSH, firewall) can lock you out.

---

# PART A: PROBLEMS

---

## Topic 1: Basic Linux Commands

### LX-BASIC-01 · Easy · 5 pts
**Task:** As root, create the directory tree `/home/student/lab/docs`, `/home/student/lab/logs`, and `/home/student/lab/scripts` using a single command. Then create empty files `file1.txt`, `file2.txt`, `file3.txt` inside `docs`.

**Hints**
1. Some `mkdir` option creates missing parent directories automatically.
2. Curly braces `{a,b,c}` expand into several names (brace expansion).
3. `mkdir -p /path/{x,y,z}` and `touch dir/file{1..3}.txt`

**Solution**
```bash
mkdir -p /home/student/lab/{docs,logs,scripts}
touch /home/student/lab/docs/file{1..3}.txt
```
**Verify**
```bash
ls -R /home/student/lab
```
**Watch out:** Without `-p`, `mkdir` fails because `/home/student/lab` does not exist yet.

---

### LX-BASIC-02 · Easy · 5 pts
**Task:** Create `/tmp/notes.txt` containing the line `Linux Contest 2026`. Append a second line `Practice makes perfect`. Then print only the **second line** and the **number of lines**.

**Hints**
1. `>` overwrites a file, `>>` appends to it.
2. `sed -n` can print a specific line, and `wc` counts things.
3. `sed -n '2p' file` and `wc -l < file`

**Solution**
```bash
echo "Linux Contest 2026" > /tmp/notes.txt
echo "Practice makes perfect" >> /tmp/notes.txt
sed -n '2p' /tmp/notes.txt
wc -l < /tmp/notes.txt
```
**Verify:** Output shows `Practice makes perfect` and `2`.
**Watch out:** Using `>` twice destroys the first line.

---

### LX-BASIC-03 · Average · 10 pts
**Task:** Find all regular files ending in `.log` under `/var/log` that are **larger than 1 MB** and **modified in the last 7 days**. Save the list of paths to `/tmp/biglogs.txt` (hide permission errors).

**Hints**
1. `find` can filter by name, type, size, and modification time.
2. Options: `-type`, `-name`, `-size`, `-mtime`.
3. `find DIR -type f -name "*.log" -size +1M -mtime -7 2>/dev/null`

**Solution**
```bash
find /var/log -type f -name "*.log" -size +1M -mtime -7 2>/dev/null > /tmp/biglogs.txt
```
**Verify**
```bash
cat /tmp/biglogs.txt
```
**Watch out:** `-mtime -7` means *less than* 7 days. `-mtime 7` means exactly 7 days. `2>/dev/null` sends errors (stream 2) away so they do not clutter the file.

---

### LX-BASIC-04 · Average · 10 pts
**Task:** From `/etc/passwd`, list the **top 3 most common login shells**, each with its count, most common first. Save the result to `/tmp/shells.txt`.

**Hints**
1. Each line of `/etc/passwd` has 7 fields separated by `:`. The shell is the last one.
2. Chain `cut`, `sort`, `uniq -c`, `sort -rn`, `head`.
3. `uniq` only merges *adjacent* duplicates, so sort first.

**Solution**
```bash
cut -d: -f7 /etc/passwd | sort | uniq -c | sort -rn | head -3 > /tmp/shells.txt
```
**Verify**
```bash
cat /tmp/shells.txt
```
**Watch out:** Forgetting the first `sort` gives wrong counts.

---

### LX-BASIC-05 · Difficult · 50 pts
**Task:** Create `/root/users_report.txt` with these requirements:
1. First line is exactly `USER:HOME:SHELL`.
2. Then one line per **regular user** (UID >= 1000 and < 65534) in the format `username:home:shell`, sorted alphabetically.
3. The final line is `TOTAL: N` where N is the number of users listed.
4. File permissions are `600`.

**Hints**
1. Build the file in pieces: header, data, total, permissions.
2. `awk -F:` lets you test the UID field (`$3`) and print chosen fields.
3. Group the header and data with `{ ...; ...; } > file`. Compute the total using `wc -l` minus 1 (for the header).

**Solution**
```bash
{ echo "USER:HOME:SHELL"
  awk -F: '$3>=1000 && $3<65534 {print $1":"$6":"$7}' /etc/passwd | sort
} > /root/users_report.txt

echo "TOTAL: $(( $(wc -l < /root/users_report.txt) - 1 ))" >> /root/users_report.txt
chmod 600 /root/users_report.txt
```
**Verify**
```bash
cat /root/users_report.txt
ls -l /root/users_report.txt      # -rw-------
```
**Watch out:** Counting the header line as a user makes TOTAL off by one. Excluding UID 65534 skips the `nobody`-type accounts.

---

## Topic 2: User and Group Management

### LX-USER-01 · Easy · 5 pts
**Task:** Create user `alice` with a home directory, `/bin/bash` shell, and password `Pass@123`.

**Hints**
1. `useradd` creates users. One option makes the home directory.
2. `-m` for home, `-s` for shell.
3. Set the password with `passwd` or `chpasswd`.

**Solution**
```bash
useradd -m -s /bin/bash alice
echo "alice:Pass@123" | chpasswd
```
**Verify**
```bash
id alice
getent passwd alice
ls -ld /home/alice
```
**Watch out:** On CentOS, `useradd` makes a home directory by default, but always add `-m` so you never depend on defaults.

---

### LX-USER-02 · Easy · 5 pts
**Task:** Create a group `developers` and add `alice` to it **without removing her from other groups**.

**Hints**
1. Groups are made with `groupadd`.
2. To add a user to an extra group, use `usermod` with two options that mean "append" and "groups".
3. `usermod -aG GROUP USER`

**Solution**
```bash
groupadd developers
usermod -aG developers alice
```
**Verify**
```bash
id alice
getent group developers
```
**Watch out:** `-G` **without** `-a` *replaces* all of the user's supplementary groups. This is the most common mistake in this topic.

---

### LX-USER-03 · Average · 10 pts
**Task:** Create user `bob` with **UID 2500**, primary group `developers`, secondary group `wheel`, comment `Bob Builder`, and a password that must be changed at least every **30 days**.

**Hints**
1. `useradd` has separate options for UID, primary group, and secondary groups.
2. `-u`, `-g` (primary), `-G` (secondary), `-c` (comment).
3. Password ageing is handled by `chage`, with `-M` for max days.

**Solution**
```bash
useradd -m -u 2500 -g developers -G wheel -c "Bob Builder" bob
echo "bob:Pass@123" | chpasswd
chage -M 30 bob
```
**Verify**
```bash
id bob
chage -l bob
```
**Watch out:** `-g` = primary group (one), `-G` = supplementary groups (a list). Do not mix them up.

---

### LX-USER-04 · Average · 10 pts
**Task:** User `carol` exists. (a) Lock her account. (b) Force a password change at next login. (c) Set the account to expire on `2026-12-31`.

**Setup**
```bash
useradd -m carol && echo "carol:Pass@123" | chpasswd
```
**Hints**
1. Locking adds a `!` in front of the password hash.
2. `usermod` locks, `chage` handles expiry and forced changes.
3. `usermod -L`, `chage -d 0`, `chage -E DATE`

**Solution**
```bash
usermod -L carol
chage -d 0 carol
chage -E 2026-12-31 carol
```
**Verify**
```bash
passwd -S carol       # shows LK (locked)
chage -l carol
```
**Watch out:** Locking the password does not stop SSH key login. `usermod -L -e 1 carol` also expires the account.

---

### LX-USER-05 · Difficult · 50 pts
**Task:** A file `/root/users.txt` contains lines in the form `username:groupname`. For every line:
1. Create the group if it does not exist.
2. Create the user with that group as primary group and a home directory (skip if the user already exists).
3. Set the password to `Welcome@123` and force a change at first login.
4. Make the account expire **90 days from today**.

Then allow members of `developers` to use `sudo`.

**Setup**
```bash
cat > /root/users.txt <<'EOF'
dave:developers
erin:testers
frank:developers
EOF
```
**Hints**
1. You need a loop that reads a file line by line and splits at `:`.
2. `while IFS=: read -r user group; do ... done < file`
3. Use `getent group` and `id` to test existence. Use `date -d "+90 days" +%F` for the expiry date. For sudo, use a file in `/etc/sudoers.d/`.

**Solution**
```bash
EXP=$(date -d "+90 days" +%F)
while IFS=: read -r u g; do
  getent group "$g" >/dev/null || groupadd "$g"
  id "$u" &>/dev/null || useradd -m -g "$g" "$u"
  echo "$u:Welcome@123" | chpasswd
  chage -d 0 -E "$EXP" "$u"
done < /root/users.txt

echo '%developers ALL=(ALL) ALL' > /etc/sudoers.d/developers
chmod 440 /etc/sudoers.d/developers
visudo -cf /etc/sudoers.d/developers
```
**Verify**
```bash
id dave; id erin; id frank
chage -l dave
sudo -l -U dave
```
**Watch out:** Sudoers files must be mode `440` and syntax-checked with `visudo -cf`. A broken sudoers file can lock you out of sudo.

---

## Topic 3: Package Management

### LX-PKG-01 · Easy · 5 pts
**Task:** Install the `httpd` package, then confirm it is installed and show its version.

**Hints**
1. Use the system package manager with the `install` action.
2. `dnf` (or `yum` on CentOS 7). Add `-y` to skip the confirmation prompt.
3. `rpm -q` queries installed packages.

**Solution**
```bash
dnf install -y httpd        # CentOS 7: yum install -y httpd
rpm -q httpd
```
**Verify**
```bash
rpm -q httpd
httpd -v
```
**Watch out:** If installation fails with a repo error, do task `LX-PKG-05` first (local repo).

---

### LX-PKG-02 · Easy · 5 pts
**Task:** Find which package provides the file `/usr/bin/scp`, and save only the package name to `/tmp/scp_pkg.txt`.

**Hints**
1. The package manager can search "which package owns/provides this file".
2. For an installed file, `rpm` has a query for it.
3. `rpm -qf /usr/bin/scp`

**Solution**
```bash
rpm -qf /usr/bin/scp > /tmp/scp_pkg.txt
```
**Verify**
```bash
cat /tmp/scp_pkg.txt        # openssh-clients-...
```
**Watch out:** For a file that is *not* installed, use `dnf provides '*/filename'` instead.

---

### LX-PKG-03 · Average · 10 pts
**Task:** Count how many installed packages have `kernel` in their name and save the number to `/tmp/kernel_count.txt`. Also list the package `bash` file list into `/tmp/bash_files.txt`.

**Hints**
1. `rpm -qa` lists every installed package.
2. `grep -c` counts matching lines. `rpm -ql` lists a package's files.
3. `rpm -qa | grep -c kernel`

**Solution**
```bash
rpm -qa | grep -c kernel > /tmp/kernel_count.txt
rpm -ql bash > /tmp/bash_files.txt
```
**Verify**
```bash
cat /tmp/kernel_count.txt
head /tmp/bash_files.txt
```
**Watch out:** `-c` prints the count instead of the matching lines, so you do not need `wc -l`.

---

### LX-PKG-04 · Average · 10 pts
**Task:** A DVD/ISO is mounted at `/mnt/cdrom`. Create a repository file `/etc/yum.repos.d/local.repo` that uses it, then clean the cache and confirm the repo is listed.

**Hints**
1. A `.repo` file has a section name in brackets and a few key = value lines.
2. Needed keys: `name`, `baseurl`, `enabled`, `gpgcheck`.
3. A local path uses `file:///` (three slashes).

**Solution (CentOS 7 layout)**
```bash
cat > /etc/yum.repos.d/local.repo <<'EOF'
[local]
name=Local Repo
baseurl=file:///mnt/cdrom
enabled=1
gpgcheck=0
EOF
```
**Solution (CentOS Stream 8/9 layout, two repos)**
```bash
cat > /etc/yum.repos.d/local.repo <<'EOF'
[local-baseos]
name=Local BaseOS
baseurl=file:///mnt/cdrom/BaseOS
enabled=1
gpgcheck=0

[local-appstream]
name=Local AppStream
baseurl=file:///mnt/cdrom/AppStream
enabled=1
gpgcheck=0
EOF
```
```bash
dnf clean all
dnf repolist
```
**Verify:** `dnf repolist` lists your repo IDs with a package count above 0.
**Watch out:** Use `file:///` with three slashes (two for the scheme plus one for the root `/`).

---

### LX-PKG-05 · Difficult · 50 pts
**Task:** Set up an **offline, persistent** local repository from the installation ISO:
1. Mount the ISO/DVD at `/mnt/cdrom` so it is mounted again after a reboot.
2. Disable all other repositories.
3. Create the local repo file.
4. Install `tree` and `vim-enhanced` using only this repo.

**Hints**
1. Persistent mounts live in `/etc/fstab`. Test them with `mount -a`.
2. Other `.repo` files can be moved out of `/etc/yum.repos.d/` into a backup folder.
3. A physical or virtual DVD is usually `/dev/sr0`. An ISO file needs the `loop` option.

**Solution**
```bash
mkdir -p /mnt/cdrom

# Persistent mount (DVD device). For an ISO file use: /root/CentOS.iso /mnt/cdrom iso9660 loop,ro 0 0
echo "/dev/sr0  /mnt/cdrom  iso9660  defaults,ro  0 0" >> /etc/fstab
mount -a

# Disable the other repos by moving them away
mkdir -p /etc/yum.repos.d/backup
mv /etc/yum.repos.d/*.repo /etc/yum.repos.d/backup/ 2>/dev/null

# Create local.repo (see LX-PKG-04 for the correct layout for your version)
# ... then:
dnf clean all
dnf repolist
dnf install -y tree vim-enhanced
```
**Verify**
```bash
findmnt /mnt/cdrom
dnf repolist
rpm -q tree vim-enhanced
```
**Watch out:** Run `mount -a` after editing `fstab`. A typo can stop the system booting normally, so check for errors immediately.

---

## Topic 4: Networking

### LX-NET-01 · Easy · 5 pts
**Task:** Save the IPv4 address information and the default gateway of the machine into `/tmp/netinfo.txt`.

**Hints**
1. The modern tool is `ip`, not `ifconfig`.
2. `ip` has subcommands for addresses and routes.
3. `ip -4 addr show` and `ip route show default`

**Solution**
```bash
ip -4 addr show > /tmp/netinfo.txt
ip route show default >> /tmp/netinfo.txt
```
**Verify**
```bash
cat /tmp/netinfo.txt
```
**Watch out:** Use `>>` for the second command or you erase the first result.

---

### LX-NET-02 · Easy · 5 pts
**Task:** Set the hostname to `server01.lab.local` persistently.

**Hints**
1. There is a systemd tool for hostnames.
2. It is `hostnamectl`.
3. `hostnamectl set-hostname NAME`

**Solution**
```bash
hostnamectl set-hostname server01.lab.local
```
**Verify**
```bash
hostname
cat /etc/hostname
hostnamectl
```
**Watch out:** The plain `hostname NAME` command changes the name only until reboot.

---

### LX-NET-03 · Average · 10 pts
**Task:** Configure the interface `ens33` with a **static** IP `192.168.10.50/24`, gateway `192.168.10.1`, and DNS `8.8.8.8`. It must persist after reboot.

**Hints**
1. Find the exact connection name first.
2. `nmcli con show` lists names. `nmcli con mod` changes them. `nmcli con up` applies.
3. Properties: `ipv4.method manual`, `ipv4.addresses`, `ipv4.gateway`, `ipv4.dns`.

**Solution**
```bash
nmcli con show
nmcli con mod ens33 ipv4.method manual \
  ipv4.addresses 192.168.10.50/24 \
  ipv4.gateway 192.168.10.1 \
  ipv4.dns 8.8.8.8 \
  connection.autoconnect yes
nmcli con down ens33; nmcli con up ens33
```
**Verify**
```bash
ip -4 addr show ens33
ip route show default
nmcli -f ipv4.addresses,ipv4.gateway,ipv4.dns con show ens33
```
**Watch out:** The connection name and the interface name can differ (for example, connection `System ens33`). Use quotes if the name has a space. Setting the address without `ipv4.method manual` will fail.

---

### LX-NET-04 · Average · 10 pts
**Task:** Add a static host entry so that `web01` and `web01.lab.local` resolve to `192.168.10.20`. Prove it resolves.

**Hints**
1. Local name resolution is a file in `/etc`.
2. The file is `/etc/hosts`. Format: `IP  fullname  alias`.
3. Test with `getent hosts` (it uses the same resolution path as programs).

**Solution**
```bash
echo "192.168.10.20  web01.lab.local  web01" >> /etc/hosts
```
**Verify**
```bash
getent hosts web01
ping -c 1 web01
```
**Watch out:** `ping` may fail if that host does not exist, but the name should still resolve to the correct IP.

---

### LX-NET-05 · Difficult · 50 pts
**Task:** Configure `firewalld` **permanently**:
1. Allow the services `http` and `https`.
2. Allow TCP port `8080`.
3. Remove the `dhcpv6-client` service.
4. Reject SSH from the single address `192.168.10.99` using a rich rule.
5. Reload and show the final active configuration.

**Hints**
1. Make sure the daemon is running before you configure it.
2. `firewall-cmd` with `--permanent` writes to disk, but rules are not active until `--reload`.
3. Rich rule syntax: `rule family="ipv4" source address="IP" service name="ssh" reject`

**Solution**
```bash
systemctl enable --now firewalld

firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --permanent --add-port=8080/tcp
firewall-cmd --permanent --remove-service=dhcpv6-client
firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="192.168.10.99" service name="ssh" reject'
firewall-cmd --reload
```
**Verify**
```bash
firewall-cmd --list-all
firewall-cmd --list-rich-rules
```
**Watch out:** Without `--permanent`, the rule disappears at reload or reboot. With `--permanent` only, it is not active until `--reload`. Do both.

---

## Topic 5: File System Management

### LX-FS-01 · Easy · 5 pts
**Task:** Create `/srv/report.txt`. Set the owner to `alice`, the group to `developers`, and permissions so the owner can read/write, the group can read, and others get nothing.

**Setup**
```bash
groupadd -f developers; id alice &>/dev/null || useradd -m alice
```
**Hints**
1. Read = 4, Write = 2, Execute = 1. Add them per role (owner, group, others).
2. Owner rw = 6, group r = 4, others none = 0.
3. `chown USER:GROUP file` and `chmod 640 file`

**Solution**
```bash
touch /srv/report.txt
chown alice:developers /srv/report.txt
chmod 640 /srv/report.txt
```
**Verify**
```bash
ls -l /srv/report.txt        # -rw-r----- 1 alice developers
```
**Watch out:** `chmod 640` is octal. Symbolic equivalent: `chmod u=rw,g=r,o= file`.

---

### LX-FS-02 · Easy · 5 pts
**Task:** Save the 5 largest **first-level** directories under `/var` (largest first) to `/tmp/var_usage.txt`, in human-readable sizes.

**Hints**
1. `du` measures directory usage. Limit the depth.
2. `--max-depth=1`, `-h` for human-readable, then `sort -rh`.
3. The first line is `/var` itself, so ask for one extra line with `head`.

**Solution**
```bash
du -h --max-depth=1 /var 2>/dev/null | sort -rh | head -6 > /tmp/var_usage.txt
```
**Verify**
```bash
cat /tmp/var_usage.txt
```
**Watch out:** `sort -h` understands `K`, `M`, `G` suffixes. Plain `sort -n` does not.

---

### LX-FS-03 · Average · 10 pts
**Task:** Create the shared directory `/srv/shared` for group `developers` such that: only the owner and group have access, and **new files automatically belong to the group `developers`**.

**Hints**
1. There is a special permission bit on directories that makes new files inherit the directory's group.
2. It is called SGID (Set Group ID), value `2` in the leading octal digit.
3. `chmod 2770 dir`

**Solution**
```bash
mkdir -p /srv/shared
chgrp developers /srv/shared
chmod 2770 /srv/shared
```
**Verify**
```bash
ls -ld /srv/shared              # drwxrws---  (note the 's')
sudo -u alice touch /srv/shared/test
ls -l /srv/shared/test          # group should be developers
```
**Watch out:** Capital `S` instead of `s` means SGID is set but group execute is missing.

---

### LX-FS-04 · Average · 10 pts
**Task:** Give user `bob` read/write/execute on `/srv/project` using an **ACL** (do not change the owner or group), and make new files created inside inherit the same permission for `bob`.

**Setup**
```bash
mkdir -p /srv/project
```
**Hints**
1. Standard permissions allow only one user owner. ACLs allow extra users.
2. `setfacl` sets ACLs, `getfacl` shows them. The default ACL option is `-d`.
3. `setfacl -m u:USER:rwx dir` and `setfacl -d -m u:USER:rwx dir`

**Solution**
```bash
setfacl -m u:bob:rwx /srv/project
setfacl -d -m u:bob:rwx /srv/project
```
**Verify**
```bash
getfacl /srv/project
ls -ld /srv/project             # a '+' appears at the end of the permissions
```
**Watch out:** Without the `-d` (default) entry, new files do not inherit the ACL.

---

### LX-FS-05 · Difficult · 50 pts
**Task:** A new empty 1 GB disk `/dev/sdb` is attached. Using **LVM**:
1. Create a volume group `vgdata` and a **500 MB** logical volume `lvdata`.
2. Format it with XFS.
3. Mount it at `/data`, **persistent using the UUID** in `/etc/fstab`.
4. Then **extend** the logical volume by 200 MB **and** grow the filesystem online.

**Hints**
1. LVM order: physical volume, then volume group, then logical volume.
2. `pvcreate`, `vgcreate`, `lvcreate`, then `mkfs.xfs`, then `blkid`.
3. `lvextend -r` resizes the filesystem together with the volume.

**Solution**
```bash
lsblk                                   # confirm the disk name first
pvcreate /dev/sdb
vgcreate vgdata /dev/sdb
lvcreate -L 500M -n lvdata vgdata
mkfs.xfs /dev/vgdata/lvdata

mkdir -p /data
blkid /dev/vgdata/lvdata                # copy the UUID
echo "UUID=<paste-uuid-here>  /data  xfs  defaults  0 0" >> /etc/fstab
mount -a

# Extend
lvextend -L +200M -r /dev/vgdata/lvdata
```
**Verify**
```bash
lsblk
df -h /data                             # about 700M
lvs
findmnt /data
```
**Watch out:** XFS can be **grown but never shrunk**. `lvextend` alone does not grow the filesystem, so use `-r` (or run `xfs_growfs /data`). If the task requires a partition instead of the whole disk, create one first with `fdisk /dev/sdb` (type `8e` Linux LVM).

---

## Topic 6: Service Management (systemd)

### LX-SVC-01 · Easy · 5 pts
**Task:** Start the `httpd` service **now** and make it start **automatically on boot**. Show that it is active.

**Hints**
1. Two different things: "now" and "at boot".
2. `systemctl start` = now. `systemctl enable` = boot. One command does both.
3. `systemctl enable --now NAME`

**Solution**
```bash
systemctl enable --now httpd
```
**Verify**
```bash
systemctl is-active httpd       # active
systemctl is-enabled httpd      # enabled
curl -I localhost
```
**Watch out:** `start` alone does not survive a reboot, and `enable` alone does not start it right now.

---

### LX-SVC-02 · Easy · 5 pts
**Task:** Save the list of **failed** units to `/tmp/failed.txt` and the list of all **enabled** service unit files to `/tmp/enabled.txt`.

**Hints**
1. `systemctl` has a "failed" filter and a "list unit files" mode.
2. `--failed` and `list-unit-files --state=enabled`.
3. Add `--type=service` to only see services.

**Solution**
```bash
systemctl --failed --no-pager > /tmp/failed.txt
systemctl list-unit-files --type=service --state=enabled --no-pager > /tmp/enabled.txt
```
**Verify**
```bash
cat /tmp/failed.txt
wc -l /tmp/enabled.txt
```
**Watch out:** Use `--no-pager` when redirecting so paging does not interfere.

---

### LX-SVC-03 · Average · 10 pts
**Task:** Stop and disable the `postfix` service (or any service the judge names), then **mask** it so that it cannot be started even manually. Prove that starting it fails.

**Hints**
1. Disabled still allows manual start. Masked does not.
2. Masking links the unit to `/dev/null`.
3. `systemctl mask NAME`

**Solution**
```bash
systemctl disable --now postfix
systemctl mask postfix
```
**Verify**
```bash
systemctl is-enabled postfix    # masked
systemctl start postfix         # Failed: Unit is masked
```
**Watch out:** Undo with `systemctl unmask postfix`.

---

### LX-SVC-04 · Average · 10 pts
**Task:** Create a custom systemd service `hello.service` that runs `/usr/local/bin/hello.sh`. The script appends the date to `/var/log/hello.log` every 60 seconds. The service must **restart automatically** if it fails and **start at boot**.

**Hints**
1. You need two things: the script and the unit file.
2. Unit files live in `/etc/systemd/system/`. After creating one, systemd must re-read its files.
3. Sections: `[Unit]`, `[Service]` (with `ExecStart` and `Restart`), `[Install]` (with `WantedBy`).

**Solution**
```bash
cat > /usr/local/bin/hello.sh <<'EOF'
#!/bin/bash
while true; do
  echo "hello $(date)" >> /var/log/hello.log
  sleep 60
done
EOF
chmod +x /usr/local/bin/hello.sh

cat > /etc/systemd/system/hello.service <<'EOF'
[Unit]
Description=Hello logger
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/hello.sh
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now hello.service
```
**Verify**
```bash
systemctl status hello.service
tail /var/log/hello.log
```
**Watch out:** Forgetting `systemctl daemon-reload` after creating the unit means "Unit not found". Forgetting `chmod +x` gives status `203/EXEC`.

---

### LX-SVC-05 · Difficult · 50 pts
**Task:** Schedule a backup with a **systemd timer**. A working script `/usr/local/bin/backup.sh` exists (see `LX-SCR-05`).
1. Create `backup.service` (runs once).
2. Create `backup.timer` to run **every day at 02:00**, and to run at next boot if the machine was off at that time.
3. Enable and start the timer.
4. Prove that the timer is scheduled and that the service can run.

**Hints**
1. A timer never runs a script directly. It triggers a **service** with the same name.
2. The service needs `Type=oneshot`. The timer needs `OnCalendar` and `Persistent`.
3. Enable the **timer** unit, not the service.

**Solution**
```bash
cat > /etc/systemd/system/backup.service <<'EOF'
[Unit]
Description=Daily backup job

[Service]
Type=oneshot
ExecStart=/usr/local/bin/backup.sh
EOF

cat > /etc/systemd/system/backup.timer <<'EOF'
[Unit]
Description=Run backup daily at 02:00

[Timer]
OnCalendar=*-*-* 02:00:00
Persistent=true

[Install]
WantedBy=timers.target
EOF

systemctl daemon-reload
systemctl enable --now backup.timer
systemctl start backup.service          # test run
```
**Verify**
```bash
systemctl list-timers --all | grep backup
systemctl status backup.service
journalctl -u backup.service --no-pager | tail
```
**Watch out:** `systemctl enable backup.service` does nothing useful here. Enable the `.timer`. Check your calendar syntax with `systemd-analyze calendar "*-*-* 02:00:00"`.

---

## Topic 7: Security

### LX-SEC-01 · Easy · 5 pts
**Task:** Show the current SELinux mode. Switch to **permissive** immediately **and** make it persist across reboots.

**Hints**
1. There is a runtime change and a config-file change.
2. `getenforce`, `setenforce`, and `/etc/selinux/config`.
3. `setenforce 0` = permissive. The config key is `SELINUX=`.

**Solution**
```bash
getenforce
setenforce 0
sed -i 's/^SELINUX=.*/SELINUX=permissive/' /etc/selinux/config
```
**Verify**
```bash
getenforce                              # Permissive
grep ^SELINUX= /etc/selinux/config
```
**Watch out:** `setenforce` is temporary, and the config file change takes effect at next boot. Do both. Never set `SELINUX=disabled` unless the task says so (it requires a reboot and relabeling to turn back on).

---

### LX-SEC-02 · Easy · 5 pts
**Task:** Disable SSH login for `root`.

**Hints**
1. The SSH server configuration lives in `/etc/ssh/`.
2. Look for the `PermitRootLogin` directive.
3. Check syntax before restarting: `sshd -t`.

**Solution**
```bash
sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
sshd -t
systemctl restart sshd
```
**Verify**
```bash
grep ^PermitRootLogin /etc/ssh/sshd_config
sshd -T | grep -i permitrootlogin
```
**Watch out:** Always run `sshd -t` first. A syntax error plus a restart can lock you out.

---

### LX-SEC-03 · Average · 10 pts
**Task:** Move the SSH server to **port 2222** and make sure it actually works (firewall and SELinux both allow it).

**Hints**
1. Three layers must agree: SSH config, firewall, and SELinux.
2. `Port` in `sshd_config`, `firewall-cmd`, and `semanage port`.
3. Open the new port **before** restarting sshd.

**Solution**
```bash
# SELinux tool (if semanage is missing)
dnf install -y policycoreutils-python-utils      # CentOS 7: policycoreutils-python

sed -i 's/^#\?Port .*/Port 2222/' /etc/ssh/sshd_config
semanage port -a -t ssh_port_t -p tcp 2222
firewall-cmd --permanent --add-port=2222/tcp
firewall-cmd --reload
sshd -t
systemctl restart sshd
```
**Verify**
```bash
ss -tlnp | grep 2222
semanage port -l | grep ssh
ssh -p 2222 localhost
```
**Watch out:** If SELinux is enforcing and you skip `semanage`, sshd silently fails to bind to 2222. That is the classic trap here.

---

### LX-SEC-04 · Average · 10 pts
**Task:** Enforce a password policy: minimum length **12**, at least one digit and one uppercase letter. New users must have maximum password age **90 days**, minimum age **1 day**, warning **7 days**.

**Hints**
1. Complexity rules and ageing rules live in two different files.
2. `/etc/security/pwquality.conf` and `/etc/login.defs`.
3. In `pwquality.conf`, negative `dcredit` / `ucredit` values mean "at least this many".

**Solution**
```bash
sed -i 's/^#\? *minlen.*/minlen = 12/'   /etc/security/pwquality.conf
sed -i 's/^#\? *dcredit.*/dcredit = -1/' /etc/security/pwquality.conf
sed -i 's/^#\? *ucredit.*/ucredit = -1/' /etc/security/pwquality.conf

sed -i 's/^PASS_MAX_DAYS.*/PASS_MAX_DAYS   90/' /etc/login.defs
sed -i 's/^PASS_MIN_DAYS.*/PASS_MIN_DAYS   1/'  /etc/login.defs
sed -i 's/^PASS_WARN_AGE.*/PASS_WARN_AGE   7/'  /etc/login.defs
```
**Verify**
```bash
grep -E '^(minlen|dcredit|ucredit)' /etc/security/pwquality.conf
grep -E '^PASS_(MAX|MIN|WARN)' /etc/login.defs
```
**Watch out:** `/etc/login.defs` only affects **new** users. Existing users need `chage` (for example `chage -M 90 alice`).

---

### LX-SEC-05 · Difficult · 50 pts
**Task:** Harden SSH for user `alice`:
1. Generate an **ed25519 key pair** for `alice` and install the public key for key login.
2. Disable password authentication and root login.
3. Only `alice` may log in over SSH.
4. Limit authentication attempts to 3 and show a login banner from `/etc/issue.net`.
5. Verify that key login works **before** closing your session.

**Hints**
1. Do the key setup first, then disable passwords. Otherwise you lock yourself out.
2. `ssh-keygen`, `ssh-copy-id`, then the directives `PasswordAuthentication`, `AllowUsers`, `MaxAuthTries`, `Banner`.
3. Test with a *second* terminal and `sshd -t` before restarting.

**Solution**
```bash
# 1. Keys (as alice)
su - alice -c 'ssh-keygen -t ed25519 -N "" -f ~/.ssh/id_ed25519'
su - alice -c 'ssh-copy-id -i ~/.ssh/id_ed25519.pub alice@localhost'

# 2-4. Server config
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak
cat >> /etc/ssh/sshd_config <<'EOF'
PasswordAuthentication no
PermitRootLogin no
AllowUsers alice
MaxAuthTries 3
Banner /etc/issue.net
EOF
echo "Authorized access only." > /etc/issue.net

sshd -t && systemctl reload sshd
```
**Verify**
```bash
sshd -T | grep -Ei 'passwordauthentication|permitrootlogin|allowusers|maxauthtries|banner'
ssh -o PasswordAuthentication=no alice@localhost 'echo key login OK'
ssh bob@localhost          # should be denied
```
**Watch out:** If a directive appears twice, sshd uses the **first** one it reads. If the file has an earlier `PasswordAuthentication yes` line, edit it instead of appending, and confirm with `sshd -T`.

---

## Topic 8: Batch Scripting (Bash)

### LX-SCR-01 · Easy · 5 pts
**Task:** Write `/root/info.sh` that prints the hostname, current date, and logged-in user, then make it executable and run it.

**Hints**
1. A script starts with a "shebang" line that names its interpreter.
2. Commands: `hostname`, `date`, `whoami`.
3. `chmod +x` makes it runnable.

**Solution**
```bash
cat > /root/info.sh <<'EOF'
#!/bin/bash
echo "Host: $(hostname)"
echo "Date: $(date)"
echo "User: $(whoami)"
EOF
chmod +x /root/info.sh
/root/info.sh
```
**Verify:** Three lines print with the right values.
**Watch out:** Without `chmod +x` you get `Permission denied`. Use `./` or the full path to run it.

---

### LX-SCR-02 · Easy · 5 pts
**Task:** Write `/root/greet.sh` that takes a name as an argument and prints `Hello, <name>!`. If no argument is given, print `Usage: greet.sh <name>` and exit with status **1**.

**Hints**
1. The first argument is `$1`, and the number of arguments is `$#`.
2. Use an `if` test on `$#`.
3. `exit 1` sets a failure status. You can see it with `echo $?`.

**Solution**
```bash
cat > /root/greet.sh <<'EOF'
#!/bin/bash
if [ $# -lt 1 ]; then
  echo "Usage: greet.sh <name>"
  exit 1
fi
echo "Hello, $1!"
EOF
chmod +x /root/greet.sh
```
**Verify**
```bash
/root/greet.sh Ram        # Hello, Ram!
/root/greet.sh            # usage message
echo $?                   # 1
```
**Watch out:** Spaces matter inside `[ ... ]`. `[ $# -lt 1 ]` works, `[$# -lt 1]` does not.

---

### LX-SCR-03 · Average · 10 pts
**Task:** Write `/root/mkusers.sh` that creates directories `/data/user1` through `/data/user5`. Inside each, create a file `welcome.txt` containing `Welcome, userN`. Skip a directory that already exists and print a message for it.

**Hints**
1. Use a `for` loop with a sequence.
2. `for i in {1..5}` and test with `[ -d dir ]`.
3. `mkdir -p` and `echo ... > file`.

**Solution**
```bash
cat > /root/mkusers.sh <<'EOF'
#!/bin/bash
for i in {1..5}; do
  dir="/data/user$i"
  if [ -d "$dir" ]; then
    echo "$dir already exists, skipping"
    continue
  fi
  mkdir -p "$dir"
  echo "Welcome, user$i" > "$dir/welcome.txt"
done
EOF
chmod +x /root/mkusers.sh
/root/mkusers.sh
```
**Verify**
```bash
ls -R /data
cat /data/user3/welcome.txt
```
**Watch out:** Use `"$dir"` (quoted) so names with spaces do not break the script.

---

### LX-SCR-04 · Average · 10 pts
**Task:** Write `/root/diskcheck.sh` that checks the usage of `/`. If usage is at or above a threshold (default **80%**, overridable by the first argument), print `WARNING: / is at X%` and exit **1**. Otherwise print `OK: / is at X%` and exit **0**.

**Hints**
1. You need the usage number without the `%` sign.
2. `df / --output=pcent` prints the percent. Remove non-digits with `tr`.
3. `${1:-80}` means "argument 1, or 80 if missing".

**Solution**
```bash
cat > /root/diskcheck.sh <<'EOF'
#!/bin/bash
THRESHOLD=${1:-80}
USAGE=$(df / --output=pcent | tail -1 | tr -dc '0-9')
if [ "$USAGE" -ge "$THRESHOLD" ]; then
  echo "WARNING: / is at ${USAGE}%"
  exit 1
else
  echo "OK: / is at ${USAGE}%"
  exit 0
fi
EOF
chmod +x /root/diskcheck.sh
```
**Verify**
```bash
/root/diskcheck.sh; echo "exit=$?"
/root/diskcheck.sh 1; echo "exit=$?"     # should warn
```
**Watch out:** Inside `[ ]`, use `-ge` for numbers. Using `>=` compares text and gives wrong results.

---

### LX-SCR-05 · Difficult · 50 pts
**Task:** Build a complete **backup and recovery** solution:
1. `/usr/local/bin/backup.sh` creates a compressed archive of `/etc` at `/backup/etc_YYYYMMDD_HHMMSS.tar.gz`.
2. It logs `SUCCESS` or `FAILED` with a timestamp to `/var/log/backup.log`, and exits non-zero on failure.
3. It keeps only the **5 newest** backups.
4. It is scheduled with **cron** every day at 02:00.
5. Prove recovery: restore the newest backup to `/tmp/restore` and compare it with `/etc`.

**Hints**
1. Build it in the order: archive, log, rotate, schedule, restore.
2. `tar -czf`, `date +%Y%m%d_%H%M%S`, and `ls -1t | tail -n +6` lists everything except the 5 newest.
3. Cron format: `minute hour day month weekday user command`.

**Solution**
```bash
cat > /usr/local/bin/backup.sh <<'EOF'
#!/bin/bash
SRC=/etc
DEST=/backup
LOG=/var/log/backup.log
KEEP=5
STAMP=$(date +%Y%m%d_%H%M%S)
FILE="$DEST/etc_$STAMP.tar.gz"

mkdir -p "$DEST"

if tar -czf "$FILE" "$SRC" 2>/dev/null; then
  echo "$(date '+%F %T') SUCCESS $FILE" >> "$LOG"
else
  echo "$(date '+%F %T') FAILED $FILE" >> "$LOG"
  exit 1
fi

# Rotation: delete everything except the newest $KEEP
ls -1t "$DEST"/etc_*.tar.gz | tail -n +$((KEEP+1)) | xargs -r rm -f
EOF
chmod +x /usr/local/bin/backup.sh

# Cron (system-wide file, includes the user column)
echo '0 2 * * * root /usr/local/bin/backup.sh' > /etc/cron.d/backup

# Test run 7 times to prove rotation
for i in {1..7}; do /usr/local/bin/backup.sh; sleep 1; done

# Recovery test
mkdir -p /tmp/restore
tar -xzf "$(ls -1t /backup/etc_*.tar.gz | head -1)" -C /tmp/restore
diff -rq /etc /tmp/restore/etc | head
```
**Verify**
```bash
ls -l /backup                    # exactly 5 archives
tail /var/log/backup.log
cat /etc/cron.d/backup
```
**Watch out:** `tar` strips the leading `/`, so the files are restored to `/tmp/restore/etc/`, not `/tmp/restore/`. Files in `/etc/cron.d/` need the **user** field (`root`), unlike `crontab -e`. Small `diff` differences are normal because `/etc` changes while you work.

---

# PART B: QUICK REFERENCE (Cheat Sheet)

## Permissions
| Octal | Symbolic | Meaning |
|---|---|---|
| 7 | rwx | read + write + execute |
| 6 | rw- | read + write |
| 5 | r-x | read + execute |
| 4 | r-- | read only |
| 0 | --- | nothing |

Special bits: `4xxx` SUID, `2xxx` SGID, `1xxx` sticky. Example: `chmod 2770 dir`.

## Command map by topic
| Topic | Commands to know cold |
|---|---|
| Basic | `ls cd pwd mkdir -p touch cp mv rm cat less head tail grep find sed awk cut sort uniq wc tar` |
| Users | `useradd usermod userdel groupadd gpasswd passwd chage chpasswd id getent visudo` |
| Packages | `dnf/yum install remove update search provides repolist clean`, `rpm -q -qa -ql -qf` |
| Network | `ip a`, `ip r`, `nmcli`, `hostnamectl`, `ss -tlnp`, `ping`, `curl`, `/etc/hosts`, `firewall-cmd` |
| File system | `lsblk fdisk parted pvcreate vgcreate lvcreate lvextend mkfs.xfs blkid mount umount findmnt df du chmod chown setfacl getfacl` |
| Services | `systemctl start stop enable disable mask status is-active list-timers`, `journalctl -u` |
| Security | `getenforce setenforce semanage restorecon sshd -t firewall-cmd chage` |
| Scripting | `#!/bin/bash`, `$1 $# $?`, `if`, `for`, `while`, `case`, `read`, `exit`, `cron` |

## "Make it persistent" checklist
| You did this | Make it survive reboot with |
|---|---|
| Started a service | `systemctl enable` |
| Opened a firewall port | `firewall-cmd --permanent` + `--reload` |
| Mounted a disk | Entry in `/etc/fstab`, tested with `mount -a` |
| Set hostname | `hostnamectl set-hostname` |
| Set IP address | `nmcli con mod` (not just `ip addr add`) |
| Changed SELinux mode | Edit `/etc/selinux/config` |
| Wrote a cron job | Put it in `crontab -e` or `/etc/cron.d/` |

---

# PART C: TRAINING PLAN

## 7-day plan (about 1.5 hours per day)
| Day | Focus | Problems |
|---|---|---|
| 1 | Basic Commands + Users | `BASIC-01` to `05`, `USER-01` to `03` |
| 2 | Users (advanced) + Packages | `USER-04`, `USER-05`, `PKG-01` to `05` |
| 3 | Networking + Firewall | `NET-01` to `05` |
| 4 | File Systems | `FS-01` to `05` |
| 5 | Services (systemd) | `SVC-01` to `05` |
| 6 | Security + Scripting | `SEC-01` to `05`, `SCR-01` to `03` |
| 7 | **Mock contest** | Timed, random mix, 120 minutes, no hints |

## Mock contest scoring
| Level | Suggested problems | Points |
|---|---|---|
| Easy | 8 random | 8 x 5 = 40 |
| Average | 6 random | 6 x 10 = 60 |
| Difficult | 3 random | 3 x 50 = 150 |
| **Total** | 17 problems | **250** |

## Self-check before contest day
- [ ] I can do every Easy problem without hints in under 3 minutes.
- [ ] I can write a systemd unit file from memory.
- [ ] I can create an LVM volume and a persistent mount from memory.
- [ ] I always verify with a command before saying "Done".
- [ ] I know which CentOS version the lab uses (`cat /etc/os-release`).
- [ ] I know how to undo my mistakes (`.bak` files, `systemctl unmask`, `umount`).

---

## Ideas for more problems (to add later)
- Performance tuning: `top`, `vmstat`, `free`, `iostat`, `nice`/`renice`, `kill`, `ps aux --sort=-%mem`
- Cron and `at` jobs; log rotation with `logrotate`
- NFS or Samba share setup
- Swap creation (`mkswap`, `swapon`, `/etc/fstab`)
- `rsync` backups and `dd` disk images
- Boot troubleshooting: reset the root password via GRUB (`rd.break`)
- `journalctl` filtering and log analysis with `grep`/`awk`