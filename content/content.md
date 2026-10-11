# Bashist: ITSO 2026 Linux Administration Trainer

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

### LX-BASIC-06 · Easy · 5 pts
**Task:** Create a symbolic link at `/usr/local/bin/sysreport` pointing to `/root/sysinfo.sh`. Verify that the symbolic link resolves correctly.

**Hints**
1. `ln -s` creates symbolic links.
2. The syntax is `ln -s TARGET LINK_NAME`.
3. `ln -s /root/sysinfo.sh /usr/local/bin/sysreport`

**Solution**
```bash
ln -s /root/sysinfo.sh /usr/local/bin/sysreport
```
**Verify**
```bash
ls -l /usr/local/bin/sysreport
```
**Watch out:** Forgetting `-s` creates a hard link instead of a soft symbolic link.

---

### LX-BASIC-07 · Average · 10 pts
**Task:** Search recursively across `/etc` for regular files containing the string `student` (case-insensitive). Export only the matching filenames to `/tmp/student_configs.txt`, discarding permission errors.

**Hints**
1. `grep` has flags to recurse directories and print filenames only.
2. `-r` recurses, `-i` ignores case, `-l` outputs matching filenames.
3. `grep -ril "student" /etc 2>/dev/null > /tmp/student_configs.txt`

**Solution**
```bash
grep -ril "student" /etc 2>/dev/null > /tmp/student_configs.txt
```
**Verify**
```bash
cat /tmp/student_configs.txt
```
**Watch out:** Without `2>/dev/null`, standard error messages will contaminate the output file.

---

### LX-BASIC-08 · Average · 10 pts
**Task:** Extract group names and their GIDs (colon-delimited fields 1 and 3) from `/etc/group`. Convert all lowercase characters to uppercase using `tr` and save the formatted list to `/tmp/groups_upper.txt`.

**Hints**
1. `cut` selects delimited fields from a file.
2. Pipe the cut output into `tr` with character sets.
3. `cut -d: -f1,3 /etc/group | tr '[:lower:]' '[:upper:]' > /tmp/groups_upper.txt`

**Solution**
```bash
cut -d: -f1,3 /etc/group | tr '[:lower:]' '[:upper:]' > /tmp/groups_upper.txt
```
**Verify**
```bash
cat /tmp/groups_upper.txt
```
**Watch out:** Using quotes inside `tr` without character sets can replace individual characters literally.

---

### LX-BASIC-09 · Average · 10 pts
**Task:** Create a gzip-compressed tar archive at `/tmp/systemd_backup.tar.gz` containing `/etc/systemd`. Then verify the archive by listing its contents without extracting.

**Hints**
1. `tar` with `-c`, `-z`, and `-f` creates compressed gzip tar archives.
2. List archive contents using `-t` instead of `-c`.
3. `tar -czf /tmp/systemd_backup.tar.gz /etc/systemd` and `tar -tzf /tmp/systemd_backup.tar.gz`

**Solution**
```bash
tar -czf /tmp/systemd_backup.tar.gz /etc/systemd
tar -tzf /tmp/systemd_backup.tar.gz
```
**Verify**
```bash
ls -lh /tmp/systemd_backup.tar.gz
```
**Watch out:** Always place the target archive name immediately after the `-f` flag.

---

### LX-BASIC-10 · Difficult · 50 pts
**Task:** Analyze web server access logs in `/var/log/httpd/access_log`:
1. Parse the HTTP status codes (field 9 in standard combined log format).
2. Count the occurrences of each status code.
3. Rank them from most frequent to least frequent.
4. Export the formatted output (`COUNT STATUS`) to `/root/http_status_report.txt`.
5. Secure `/root/http_status_report.txt` with permissions `640`.

**Setup**
```bash
mkdir -p /var/log/httpd
cat > /var/log/httpd/access_log <<'EOF'
192.168.1.10 - - [10/Oct/2026:13:55:36 -0400] "GET /index.html HTTP/1.1" 200 2326
192.168.1.11 - - [10/Oct/2026:13:55:37 -0400] "GET /about.html HTTP/1.1" 200 1204
192.168.1.12 - - [10/Oct/2026:13:55:38 -0400] "GET /missing.html HTTP/1.1" 404 312
192.168.1.10 - - [10/Oct/2026:13:55:39 -0400] "GET /login HTTP/1.1" 200 4501
192.168.1.14 - - [10/Oct/2026:13:55:40 -0400] "POST /api/auth HTTP/1.1" 401 180
192.168.1.15 - - [10/Oct/2026:13:55:41 -0400] "GET /private HTTP/1.1" 403 245
192.168.1.10 - - [10/Oct/2026:13:55:42 -0400] "GET /logo.png HTTP/1.1" 200 8920
192.168.1.16 - - [10/Oct/2026:13:55:43 -0400] "GET /error HTTP/1.1" 500 523
EOF
```

**Hints**
1. Extract column 9 using `awk '{print $9}'`.
2. Sort before grouping duplicates with `uniq -c`.
3. Pipe into `sort -rn` and redirect to the target file, then `chmod 640`.

**Solution**
```bash
awk '{print $9}' /var/log/httpd/access_log | sort | uniq -c | sort -rn > /root/http_status_report.txt
chmod 640 /root/http_status_report.txt
```
**Verify**
```bash
cat /root/http_status_report.txt
ls -l /root/http_status_report.txt
```
**Watch out:** `uniq -c` requires sorted input; running `uniq` on unsorted input misses non-consecutive duplicates.

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

### LX-USER-06 · Easy · 5 pts
**Task:** Create a dedicated system daemon service user `prometheus` with system account flag, home directory `/var/lib/prometheus`, and login shell disabled (`/sbin/nologin`).

**Hints**
1. `useradd -r` creates a system user.
2. `-d` specifies the home directory and `-s` sets the shell.
3. `useradd -r -d /var/lib/prometheus -s /sbin/nologin prometheus`

**Solution**
```bash
useradd -r -d /var/lib/prometheus -s /sbin/nologin prometheus
```
**Verify**
```bash
getent passwd prometheus
```
**Watch out:** Do not omit `-s /sbin/nologin`; system accounts should never have an interactive login shell.

---

### LX-USER-07 · Average · 10 pts
**Task:** Customize the default new-user skeleton directory `/etc/skel` by adding a greeting file `/etc/skel/WELCOME.txt` containing the exact line `Welcome to Olympic CentOS Server`. Then create user `david` with a home directory and verify that `WELCOME.txt` is automatically populated in `/home/david/WELCOME.txt`.

**Hints**
1. Files in `/etc/skel` are copied into new user home directories when created with `-m`.
2. Write the file into `/etc/skel/WELCOME.txt`.
3. Run `useradd -m david`.

**Solution**
```bash
echo "Welcome to Olympic CentOS Server" > /etc/skel/WELCOME.txt
useradd -m david
```
**Verify**
```bash
cat /home/david/WELCOME.txt
```
**Watch out:** If user `david` is created with `useradd` without `-m`, the home directory and skeleton files will not be created.

---

### LX-USER-08 · Average · 10 pts
**Task:** Configure a team collaboration directory:
1. Create system group `qa_team`.
2. Add user `alice` and user `bob` as supplementary members of `qa_team`.
3. Create directory `/opt/qa_data`.
4. Change group ownership of `/opt/qa_data` to `qa_team`.
5. Set permissions on `/opt/qa_data` to `770` so only the owner and `qa_team` members can access it.

**Solution**
```bash
groupadd qa_team
usermod -aG qa_team alice
usermod -aG qa_team bob
mkdir -p /opt/qa_data
chown :qa_team /opt/qa_data
chmod 770 /opt/qa_data
```
**Verify**
```bash
ls -ld /opt/qa_data
id alice; id bob
```
**Watch out:** Always use `-aG` with `usermod`. Forgetting `-a` removes the user from all their other supplementary groups.

---

### LX-USER-09 · Average · 10 pts
**Task:** Enforce strict password aging rules for user `david`:
1. Minimum days between password changes: 7 days.
2. Maximum password validity: 60 days.
3. Expiration warning period: 14 days before expiration.

**Hints**
1. `chage` manages user password aging and expiration parameters.
2. Flags: `-m` minimum days, `-M` maximum days, `-W` warning days.
3. `chage -m 7 -M 60 -W 14 david`

**Solution**
```bash
chage -m 7 -M 60 -W 14 david
```
**Verify**
```bash
chage -l david
```
**Watch out:** Pay attention to capitalization: lowercase `-m` is minimum days, uppercase `-M` is maximum days.

---

### LX-USER-10 · Difficult · 50 pts
**Task:** Configure privileged delegation via sudoers:
1. Create a drop-in sudoers file at `/etc/sudoers.d/developers`.
2. Grant all members of group `%developers` the privilege to execute `/usr/bin/systemctl restart httpd` and `/usr/bin/systemctl status httpd` as root without entering a password (`NOPASSWD:`).
3. Set permissions of `/etc/sudoers.d/developers` to `0440`.

**Hints**
1. Sudoers drop-in files reside in `/etc/sudoers.d/`.
2. Group specifications begin with `%`. Format: `%group ALL=(ALL) NOPASSWD: /path/to/cmd1, /path/to/cmd2`.
3. Sudo requires strict `0440` or `0400` permissions on files in `/etc/sudoers.d/`.

**Solution**
```bash
cat > /etc/sudoers.d/developers <<'EOF'
%developers ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart httpd, /usr/bin/systemctl status httpd
EOF
chmod 0440 /etc/sudoers.d/developers
```
**Verify**
```bash
cat /etc/sudoers.d/developers
ls -l /etc/sudoers.d/developers
```
**Watch out:** Sudo ignores drop-in files with world-writable or group-writable permissions. Ensure `chmod 0440` is applied.

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

### LX-PKG-06 · Easy · 5 pts
**Task:** Remove the package `httpd` completely using `dnf` or `yum` without interactive prompts, then verify that `rpm -q httpd` confirms package absence.

**Hints**
1. `dnf remove` or `yum remove` uninstalls packages.
2. The `-y` option answers yes to confirmation prompts.
3. `dnf remove -y httpd` and check with `rpm -q httpd`.

**Solution**
```bash
dnf remove -y httpd
rpm -q httpd
```
**Verify**
```bash
rpm -q httpd
```
**Watch out:** Always test exit status; `rpm -q` returns non-zero when a package is not installed.

---

### LX-PKG-07 · Average · 10 pts
**Task:** Query the RPM database for package `bash` metadata, summary, and architecture details using `rpm -qi bash`, and write the full package details to `/tmp/bash_info.txt`.

**Hints**
1. `rpm -q` queries packages; `-i` displays descriptive info.
2. Redirect stdout with `> /tmp/bash_info.txt`.
3. `rpm -qi bash > /tmp/bash_info.txt`

**Solution**
```bash
rpm -qi bash > /tmp/bash_info.txt
```
**Verify**
```bash
cat /tmp/bash_info.txt
```
**Watch out:** Do not specify the `.rpm` extension when querying an already-installed package by name.

---

### LX-PKG-08 · Average · 10 pts
**Task:** Verify the file integrity of all installed files belonging to package `coreutils` using `rpm -V coreutils`. Export the verification output to `/tmp/coreutils_verify.txt`.

**Hints**
1. `rpm -V` verifies installed package file checksums, sizes, and permissions.
2. Redirect output to `/tmp/coreutils_verify.txt`.
3. `rpm -V coreutils > /tmp/coreutils_verify.txt`

**Solution**
```bash
rpm -V coreutils > /tmp/coreutils_verify.txt
```
**Verify**
```bash
cat /tmp/coreutils_verify.txt
```
**Watch out:** An empty file is normal if all files pass verification without discrepancies.

---

### LX-PKG-09 · Average · 10 pts
**Task:** Configure a third-party software repository:
1. Create repository configuration file `/etc/yum.repos.d/custom.repo`.
2. Define repository section `[custom-tools]` with `name=Custom Tools Repository`.
3. Set `baseurl=http://repo.internal/centos/`.
4. Enable the repository (`enabled=1`) and disable GPG signature checking (`gpgcheck=0`).
5. Purge the repository metadata cache and verify with `dnf repolist` (or `yum repolist`).

**Solution**
```bash
cat > /etc/yum.repos.d/custom.repo <<'EOF'
[custom-tools]
name=Custom Tools Repository
baseurl=http://repo.internal/centos/
enabled=1
gpgcheck=0
EOF
dnf clean all
dnf repolist
```
**Verify**
```bash
cat /etc/yum.repos.d/custom.repo
dnf repolist
```
**Watch out:** All repo definition files in `/etc/yum.repos.d/` must end in `.repo` to be recognized by DNF/YUM.

---

### LX-PKG-10 · Difficult · 50 pts
**Task:** Enforce strict package security and GPG signature verification:
1. In repository file `/etc/yum.repos.d/local.repo`, configure `gpgcheck=1`.
2. Specify the official key location `gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-centosofficial`.
3. Clean all repository metadata caches with `dnf clean all` and verify active repolist.

**Hints**
1. Edit or overwrite `/etc/yum.repos.d/local.repo`.
2. Add both `gpgcheck=1` and `gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-centosofficial`.
3. Clean the cache and test repository availability.

**Solution**
```bash
cat > /etc/yum.repos.d/local.repo <<'EOF'
[local-base]
name=CentOS Local Repository
baseurl=file:///mnt/cdrom/BaseOS
enabled=1
gpgcheck=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-centosofficial
EOF
dnf clean all
dnf repolist
```
**Verify**
```bash
grep -E "gpgcheck|gpgkey" /etc/yum.repos.d/local.repo
dnf repolist
```
**Watch out:** When `gpgcheck=1` is enabled without a valid `gpgkey` path, package installations from that repository will abort with signature verification failures.

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

### LX-NET-06 · Easy · 5 pts
**Task:** Inspect the Linux kernel routing table using `ip route show` and export the entire routing configuration to `/tmp/default_route.txt`.

**Hints**
1. `ip route` or `ip r` displays routing table entries.
2. Redirect output to `/tmp/default_route.txt`.
3. `ip route show > /tmp/default_route.txt`

**Solution**
```bash
ip route show > /tmp/default_route.txt
```
**Verify**
```bash
cat /tmp/default_route.txt
```
**Watch out:** Do not confuse `ip addr show` (interfaces and IPs) with `ip route show` (gateways and next hops).

---

### LX-NET-07 · Average · 10 pts
**Task:** Assign a secondary static IP address `192.168.122.150/24` to interface `ens33` using the `ip` utility, and verify that both IP addresses are visible on `ens33`.

**Hints**
1. `ip addr add` attaches additional IP addresses to an interface.
2. Syntax: `ip addr add IP/PREFIX dev INTERFACE`.
3. `ip addr add 192.168.122.150/24 dev ens33`

**Solution**
```bash
ip addr add 192.168.122.150/24 dev ens33
```
**Verify**
```bash
ip addr show ens33
```
**Watch out:** Addresses added directly via `ip addr add` are ephemeral and will not persist across a network restart unless saved in NetworkManager configuration.

---

### LX-NET-08 · Average · 10 pts
**Task:** Configure local static DNS name resolution in `/etc/hosts`:
1. Add entry mapping `192.168.122.10` to FQDN `master.cluster.local` and alias `master`.
2. Add entry mapping `192.168.122.11` to FQDN `worker1.cluster.local` and alias `worker1`.

**Hints**
1. Format for `/etc/hosts` lines: `IP_ADDRESS FQDN ALIAS`.
2. Append entries with `>>` to preserve existing `127.0.0.1` localhost mappings.
3. `echo "192.168.122.10 master.cluster.local master" >> /etc/hosts`

**Solution**
```bash
cat >> /etc/hosts <<'EOF'
192.168.122.10 master.cluster.local master
192.168.122.11 worker1.cluster.local worker1
EOF
```
**Verify**
```bash
grep "cluster.local" /etc/hosts
```
**Watch out:** Never overwrite `/etc/hosts` with `>`; doing so destroys the default `localhost` loopback resolution.

---

### LX-NET-09 · Average · 10 pts
**Task:** Reconfigure NetworkManager connection `ens33`:
1. Set DNS servers to `1.1.1.1` and `8.8.8.8`.
2. Ensure connection autoconnect is set to `yes`.
3. Activate the updated connection profile immediately.

**Hints**
1. Use `nmcli connection modify` or `nmcli con mod`.
2. Properties: `ipv4.dns "1.1.1.1 8.8.8.8"`, `connection.autoconnect yes`.
3. Activate with `nmcli con up ens33`.

**Solution**
```bash
nmcli con mod ens33 ipv4.dns "1.1.1.1 8.8.8.8" connection.autoconnect yes
nmcli con up ens33
```
**Verify**
```bash
nmcli con show ens33
```
**Watch out:** Changes made with `nmcli con mod` take effect only after running `nmcli con up` to reload the connection runtime state.

---

### LX-NET-10 · Difficult · 50 pts
**Task:** Create an isolated private host-only network profile:
1. Create a new Ethernet connection profile named `internal-net` bound to interface `ens33`.
2. Configure static IPv4 address `10.0.0.50/24` with default gateway `10.0.0.1`.
3. Configure DNS resolver `10.0.0.1`.
4. Ensure autoconnect is enabled and activate the profile.

**Hints**
1. `nmcli connection add type ethernet con-name internal-net ifname ens33 ...`
2. Specify `ip4 10.0.0.50/24 gw4 10.0.0.1`.
3. Modify DNS and bring the interface up.

**Solution**
```bash
nmcli connection add type ethernet con-name internal-net ifname ens33 ip4 10.0.0.50/24 gw4 10.0.0.1
nmcli con mod internal-net ipv4.dns "10.0.0.1" connection.autoconnect yes
nmcli con up internal-net
```
**Verify**
```bash
nmcli connection show internal-net
ip addr show ens33
```
**Watch out:** Specifying wrong interface names will cause NetworkManager to fail activating the profile.

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

### LX-FS-06 · Easy · 5 pts
**Task:** Create a shared drop-box directory `/shared/public_dropbox` with group ownership `developers` and permissions `1777` (read/write/execute for all, with the **sticky bit** set so users cannot delete files created by others).

**Hints**
1. `mkdir -p` creates directory paths.
2. The sticky bit octal prefix is `1` (e.g. `chmod 1777`).
3. Set group with `chgrp developers` or `chown :developers`.

**Solution**
```bash
mkdir -p /shared/public_dropbox
chown :developers /shared/public_dropbox
chmod 1777 /shared/public_dropbox
```
**Verify**
```bash
ls -ld /shared/public_dropbox
```
**Watch out:** Without the sticky bit (`1777`), any user with write permissions in the directory can delete any other user's files.

---

### LX-FS-07 · Average · 10 pts
**Task:** Search `/var` for all regular files larger than 10MB, format their sizes with `find` or `du`, and write the matching file list to `/tmp/large_var_files.txt`.

**Hints**
1. Use `find /var -type f -size +10M`.
2. Suppress permission denied errors with `2>/dev/null`.
3. Redirect stdout to `/tmp/large_var_files.txt`.

**Solution**
```bash
find /var -type f -size +10M 2>/dev/null > /tmp/large_var_files.txt
```
**Verify**
```bash
cat /tmp/large_var_files.txt
```
**Watch out:** File size units: `+10M` for megabytes, `+10G` for gigabytes. Lowercase `m` means minutes, not megabytes!

---

### LX-FS-08 · Average · 10 pts
**Task:** Configure default POSIX ACL inheritance on `/data/projects`:
1. Ensure directory `/data/projects` exists.
2. Set a default ACL granting group `developers` read, write, and execute permissions (`rwx`) on all newly created files and subdirectories.

**Hints**
1. Default ACLs are configured using the `-d` option in `setfacl`.
2. Syntax: `setfacl -d -m g:GROUP:PERMS PATH`.
3. `setfacl -d -m g:developers:rwx /data/projects`

**Solution**
```bash
mkdir -p /data/projects
setfacl -d -m g:developers:rwx /data/projects
```
**Verify**
```bash
getfacl /data/projects
```
**Watch out:** Setting an access ACL without `-d` only affects existing items; `-d` ensures future child items automatically inherit the ACL.

---

### LX-FS-09 · Average · 10 pts
**Task:** Configure a persistent mount point:
1. Create directory `/mnt/data`.
2. Add a persistent filesystem mount entry in `/etc/fstab` for device `/dev/vdb1` at mount point `/mnt/data` with filesystem type `xfs`, options `defaults`, dump `0`, pass `0`.
3. Test mount persistence with `mount -a`.

**Hints**
1. Append entry to `/etc/fstab`. Format: `<device> <mount_point> <type> <options> <dump> <pass>`.
2. Always test fstab changes immediately with `mount -a` to catch syntax errors before rebooting.

**Solution**
```bash
mkdir -p /mnt/data
echo "/dev/vdb1 /mnt/data xfs defaults 0 0" >> /etc/fstab
mount -a
```
**Verify**
```bash
grep "/mnt/data" /etc/fstab
mount | grep "/mnt/data"
```
**Watch out:** A syntax typo in `/etc/fstab` can cause Linux systems to drop into emergency recovery shell during boot.

---

### LX-FS-10 · Difficult · 50 pts
**Task:** Perform LVM storage expansion and filesystem resizing:
1. Extend existing logical volume `/dev/data_vg/data_lv` by `+500M`.
2. Ensure the volume is formatted with XFS and persistently mounted at `/mnt/reports` in `/etc/fstab`.

**Setup**
```bash
mkdir -p /mnt/reports
pvcreate /dev/sdb1
vgcreate data_vg /dev/sdb1
lvcreate -L 1G -n data_lv data_vg
mkfs.xfs /dev/data_vg/data_lv
mount /dev/data_vg/data_lv /mnt/reports
echo "/dev/data_vg/data_lv /mnt/reports xfs defaults 0 0" >> /etc/fstab
```

**Hints**
1. `lvextend -L +500M` extends the logical volume.
2. The `-r` flag resizes the underlying filesystem in the same operation.
3. `lvextend -L +500M /dev/data_vg/data_lv -r`

**Solution**
```bash
lvextend -L +500M /dev/data_vg/data_lv -r
```
**Verify**
```bash
lvs data_vg/data_lv
df -h /mnt/reports
```
**Watch out:** Extending an LVM volume without resizing the filesystem leaves the new capacity inaccessible until resized with `xfs_growfs` or `lvextend -r`.

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

### LX-SVC-06 · Easy · 5 pts
**Task:** Immediately stop service `postfix` and disable it from auto-starting on system boot using a single `systemctl` command.

**Hints**
1. `systemctl disable` prevents service startup at boot.
2. The `--now` flag stops the service immediately as well.
3. `systemctl disable --now postfix`

**Solution**
```bash
systemctl disable --now postfix
```
**Verify**
```bash
systemctl is-active postfix
systemctl is-enabled postfix
```
**Watch out:** Running `systemctl disable postfix` without `--now` leaves the service actively running in memory until the next reboot.

---

### LX-SVC-07 · Average · 10 pts
**Task:** Query all currently failed systemd units on the system using `systemctl --failed` and save the diagnostic summary to `/tmp/failed_services.txt`.

**Hints**
1. `systemctl --failed` lists all units in a degraded or failed state.
2. Redirect output to `/tmp/failed_services.txt`.
3. `systemctl --failed > /tmp/failed_services.txt`

**Solution**
```bash
systemctl --failed > /tmp/failed_services.txt
```
**Verify**
```bash
cat /tmp/failed_services.txt
```
**Watch out:** In competitive troubleshooting, `systemctl --failed` should be one of the very first commands run to pinpoint broken daemons.

---

### LX-SVC-08 · Average · 10 pts
**Task:** Inspect the dependency hierarchy for `sshd.service` using `systemctl list-dependencies sshd` and save the output tree to `/tmp/sshd_deps.txt`.

**Hints**
1. `systemctl list-dependencies UNIT` displays target dependencies and requisites.
2. Redirect stdout with `> /tmp/sshd_deps.txt`.
3. `systemctl list-dependencies sshd > /tmp/sshd_deps.txt`

**Solution**
```bash
systemctl list-dependencies sshd > /tmp/sshd_deps.txt
```
**Verify**
```bash
cat /tmp/sshd_deps.txt
```
**Watch out:** Systemd dependency ordering issues frequently prevent services from starting if network or storage targets fail to activate first.

---

### LX-SVC-09 · Average · 10 pts
**Task:** Configure a systemd service drop-in configuration override:
1. Create drop-in configuration directory `/etc/systemd/system/httpd.service.d`.
2. Create drop-in file `/etc/systemd/system/httpd.service.d/override.conf` defining `[Service]` with environment variable `Environment="PORT=8080"`.
3. Reload systemd manager configuration and restart `httpd`.

**Hints**
1. Drop-in directories follow the convention `/etc/systemd/system/<unit>.d/`.
2. Always run `systemctl daemon-reload` after altering unit files or drop-ins.
3. Restart the service to apply updated environment variables.

**Solution**
```bash
mkdir -p /etc/systemd/system/httpd.service.d
cat > /etc/systemd/system/httpd.service.d/override.conf <<'EOF'
[Service]
Environment="PORT=8080"
EOF
systemctl daemon-reload
systemctl restart httpd
```
**Verify**
```bash
cat /etc/systemd/system/httpd.service.d/override.conf
systemctl status httpd
```
**Watch out:** Editing packaged units in `/usr/lib/systemd/system/` directly can be overwritten during package updates. Always use `/etc/systemd/system/` drop-ins.

---

### LX-SVC-10 · Difficult · 50 pts
**Task:** Implement an automated scheduled maintenance task using systemd timers:
1. Create service unit `/etc/systemd/system/logclean.service` executing `/usr/bin/find /var/log -type f -name "*.tmp" -delete`.
2. Create accompanying timer unit `/etc/systemd/system/logclean.timer` set to run every day (`OnCalendar=daily`).
3. Reload systemd daemon, then enable and start the timer unit immediately (`systemctl enable --now logclean.timer`).

**Hints**
1. The service unit needs `[Unit]` and `[Service]` sections with `ExecStart`.
2. The timer unit needs `[Timer]` section with `OnCalendar=daily` and `[Install]` section with `WantedBy=timers.target`.
3. Enable and activate the `.timer` unit, not the `.service` unit.

**Solution**
```bash
cat > /etc/systemd/system/logclean.service <<'EOF'
[Unit]
Description=Log Cleanup Maintenance

[Service]
Type=oneshot
ExecStart=/usr/bin/find /var/log -type f -name "*.tmp" -delete
EOF

cat > /etc/systemd/system/logclean.timer <<'EOF'
[Unit]
Description=Daily Log Cleanup Timer

[Timer]
OnCalendar=daily
Persistent=true

[Install]
WantedBy=timers.target
EOF

systemctl daemon-reload
systemctl enable --now logclean.timer
```
**Verify**
```bash
systemctl is-enabled logclean.timer
systemctl list-timers
```
**Watch out:** Timers will not trigger automatically unless their unit contains a valid `[Install]` section with `WantedBy=timers.target`.

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

### LX-SEC-06 · Easy · 5 pts
**Task:** Permanently open inbound firewall access for both `http` and `https` services in the active firewall zone, reload firewalld, and verify that both services appear in the active firewall configuration.

**Hints**
1. Use `firewall-cmd --permanent --add-service=SERVICE`.
2. Add both `http` and `https`.
3. Reload firewalld with `firewall-cmd --reload`.

**Solution**
```bash
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --reload
```
**Verify**
```bash
firewall-cmd --list-services
```
**Watch out:** Rules added without `--permanent` are lost when the firewall reloads or the server restarts.

---

### LX-SEC-07 · Average · 10 pts
**Task:** Configure a permanent port forwarding rule in `firewalld` redirecting external incoming traffic on port `8080/tcp` to internal web server port `80/tcp`, and reload the firewall.

**Hints**
1. `firewall-cmd` has a `--add-forward-port` flag.
2. Syntax: `--add-forward-port=port=PORT:proto=tcp:toport=TARGET_PORT`.
3. Don't forget `--permanent` and `--reload`.

**Solution**
```bash
firewall-cmd --permanent --add-forward-port=port=8080:proto=tcp:toport=80
firewall-cmd --reload
```
**Verify**
```bash
firewall-cmd --list-all
```
**Watch out:** Forgetting to reload the firewall leaves the permanent configuration file saved on disk but inactive in runtime.

---

### LX-SEC-08 · Average · 10 pts
**Task:** Configure an IP-restricted firewall rich rule:
1. Allow incoming SSH traffic (service `ssh` or port `22/tcp`) ONLY from subnet `192.168.122.0/24`.
2. Save the rule permanently and reload the firewall.

**Hints**
1. Use `firewall-cmd --permanent --add-rich-rule='...'`.
2. Syntax: `rule family="ipv4" source address="192.168.122.0/24" service name="ssh" accept`.
3. Run `firewall-cmd --reload`.

**Solution**
```bash
firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="192.168.122.0/24" service name="ssh" accept'
firewall-cmd --reload
```
**Verify**
```bash
firewall-cmd --list-all
```
**Watch out:** Quotation mismatches inside rich rules will cause `firewall-cmd` to abort with syntax validation errors.

---

### LX-SEC-09 · Average · 10 pts
**Task:** Configure custom web server document root directory security:
1. Create directory `/srv/www/html` and create test file `/srv/www/html/index.html` with content `CentOS Production Web`.
2. Set directory permissions to `755` and ownership to `root:root`.
3. Ensure SELinux enforcement mode is active (`Enforcing`).

**Hints**
1. `mkdir -p` and `chmod 755`.
2. Check SELinux status with `getenforce` and ensure it is `Enforcing`.
3. Verify `/etc/selinux/config` has `SELINUX=enforcing`.

**Solution**
```bash
mkdir -p /srv/www/html
echo "CentOS Production Web" > /srv/www/html/index.html
chmod 755 /srv/www/html
setenforce 1
sed -i 's/^SELINUX=.*/SELINUX=enforcing/' /etc/selinux/config
```
**Verify**
```bash
ls -ld /srv/www/html
getenforce
```
**Watch out:** Web servers fail to serve files if parent directory permissions prevent traversal (`+x`).

---

### LX-SEC-10 · Difficult · 50 pts
**Task:** Harden the OpenSSH daemon configuration in `/etc/ssh/sshd_config`:
1. Limit failed login attempts: set `MaxAuthTries 3`.
2. Set client inactivity keep-alive timeout: `ClientAliveInterval 300` and `ClientAliveCountMax 2`.
3. Disable graphical X11 forwarding: `X11Forwarding no`.
4. Validate configuration syntax with `sshd -t` and restart `sshd`.

**Hints**
1. Append or modify parameters in `/etc/ssh/sshd_config`.
2. Always validate configuration syntax with `sshd -t` before restarting the service to avoid lockouts.
3. Reload or restart sshd with `systemctl restart sshd`.

**Solution**
```bash
cat >> /etc/ssh/sshd_config <<'EOF'
MaxAuthTries 3
ClientAliveInterval 300
ClientAliveCountMax 2
X11Forwarding no
EOF
sshd -t
systemctl restart sshd
```
**Verify**
```bash
grep -E "MaxAuthTries|ClientAlive|X11Forwarding" /etc/ssh/sshd_config
systemctl is-active sshd
```
**Watch out:** A bad configuration directive in `sshd_config` can crash the SSH daemon upon restart, cutting off remote access to the host.

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

### LX-SCR-06 · Easy · 5 pts
**Task:** Create an executable health-check script at `/root/check_service.sh`:
1. It accepts a service name as argument `$1`.
2. If the service is active, it prints `UP` and exits with code 0.
3. If the service is inactive or not found, it prints `DOWN` and exits with code 1.
4. Make the script executable (`chmod +x`).

**Hints**
1. `systemctl is-active "$1"` returns exit code 0 if running.
2. Use an `if ...; then ...; else ...; fi` block.
3. Print `UP` or `DOWN` and exit accordingly.

**Solution**
```bash
cat > /root/check_service.sh <<'EOF'
#!/bin/bash
if systemctl is-active "$1" >/dev/null 2>&1; then
  echo "UP"
  exit 0
else
  echo "DOWN"
  exit 1
fi
EOF
chmod +x /root/check_service.sh
```
**Verify**
```bash
/root/check_service.sh sshd; echo "exit=$?"
/root/check_service.sh nonexistent; echo "exit=$?"
```
**Watch out:** Remember to add `chmod +x` so the script can be directly executed.

---

### LX-SCR-07 · Average · 10 pts
**Task:** Create an automated password provisioning script at `/root/reset_passwords.sh`:
1. It reads colon-separated user account pairs (`username:password`) from `/root/users.txt`.
2. For each line, it applies the updated password using `chpasswd`.
3. Make the script executable (`chmod +x`).

**Setup**
```bash
cat > /root/users.txt <<'EOF'
alice:NewPass@2026
bob:SecureKey#99
carol:Winter$2026
EOF
```

**Hints**
1. `chpasswd` reads `username:password` pairs directly from standard input.
2. The script can pipe or redirect `/root/users.txt` into `chpasswd`.
3. `chpasswd < /root/users.txt`

**Solution**
```bash
cat > /root/reset_passwords.sh <<'EOF'
#!/bin/bash
chpasswd < /root/users.txt
EOF
chmod +x /root/reset_passwords.sh
/root/reset_passwords.sh
```
**Verify**
```bash
ls -l /root/reset_passwords.sh
```
**Watch out:** Passing cleartext passwords as command line arguments leaves them visible in process tables (`ps aux`); `chpasswd` reads via stdin securely.

---

### LX-SCR-08 · Average · 10 pts
**Task:** Create an automated log rotation cleanup script at `/root/clean_old_logs.sh`:
1. It finds and deletes all `.log` files in `/tmp/test_logs` that are modified more than 7 days ago (`-mtime +7`).
2. Make the script executable (`chmod +x`).

**Setup**
```bash
mkdir -p /tmp/test_logs
touch -d "10 days ago" /tmp/test_logs/old1.log /tmp/test_logs/old2.log
touch /tmp/test_logs/fresh.log
```

**Hints**
1. Use `find /tmp/test_logs -name "*.log" -mtime +7 -delete`.
2. Wrap in script with `#!/bin/bash`.
3. Make executable with `chmod +x /root/clean_old_logs.sh`.

**Solution**
```bash
cat > /root/clean_old_logs.sh <<'EOF'
#!/bin/bash
find /tmp/test_logs -name "*.log" -mtime +7 -delete
EOF
chmod +x /root/clean_old_logs.sh
/root/clean_old_logs.sh
```
**Verify**
```bash
ls -l /tmp/test_logs
```
**Watch out:** Testing `find` with `-print` before using `-delete` prevents accidental file deletion.

---

### LX-SCR-09 · Average · 10 pts
**Task:** Create a report extraction script at `/root/csv_report.sh`:
1. It parses employee records in `/root/employees.csv` (format: `Name,Department,Salary`).
2. It filters employees in department `IT`, calculates the count of IT employees, and outputs `IT Department Count: N` to `/root/it_summary.txt`.
3. Make the script executable (`chmod +x`).

**Setup**
```bash
cat > /root/employees.csv <<'EOF'
John,IT,75000
Sarah,HR,62000
Michael,IT,82000
Elena,Finance,71000
David,IT,68000
EOF
```

**Hints**
1. Use `grep ",IT,"` or `awk -F, '$2=="IT"'` to filter lines.
2. Count lines with `wc -l`.
3. Output `IT Department Count: <count>` into `/root/it_summary.txt`.

**Solution**
```bash
cat > /root/csv_report.sh <<'EOF'
#!/bin/bash
count=$(awk -F, '$2=="IT"' /root/employees.csv | wc -l)
echo "IT Department Count: $count" > /root/it_summary.txt
EOF
chmod +x /root/csv_report.sh
/root/csv_report.sh
```
**Verify**
```bash
cat /root/it_summary.txt
```
**Watch out:** Trailing whitespace or commas in CSV files can shift field numbers if delimiters are not specified accurately.

---

### LX-SCR-10 · Difficult · 50 pts
**Task:** Build an automated system resource monitor and alert script at `/root/sysmonitor.sh`:
1. Collect current timestamp (`date "+%F %T"`).
2. Collect root filesystem usage percentage from `df -h /`.
3. If root disk usage exceeds threshold 80% (or pass threshold parameter `$1`), append an alert entry formatted as `[ALERT] <timestamp> Root disk usage at <percent>%` to log file `/var/log/sysalert.log`.
4. Make the script executable (`chmod +x`) and execute it with threshold test `1`.

**Hints**
1. Extract usage integer with `df / | awk 'NR==2 {print $5}' | tr -d '%'`.
2. Compare with `if [ "$usage" -ge "$threshold" ]; then ...; fi`.
3. Ensure log directory exists and write the formatted alert.

**Solution**
```bash
cat > /root/sysmonitor.sh <<'EOF'
#!/bin/bash
THRESHOLD=${1:-80}
USAGE=$(df / | awk 'NR==2 {print $5}' | tr -d '%')
STAMP=$(date '+%F %T')

if [ "$USAGE" -ge "$THRESHOLD" ]; then
  mkdir -p /var/log
  echo "[ALERT] $STAMP Root disk usage at $USAGE%" >> /var/log/sysalert.log
fi
EOF
chmod +x /root/sysmonitor.sh
/root/sysmonitor.sh 1
```
**Verify**
```bash
cat /var/log/sysalert.log
```
**Watch out:** `df` prints percentage with a `%` symbol; strip it with `tr -d '%'` before numeric comparisons in bash `[ "$USAGE" -ge "$THRESHOLD" ]`.

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