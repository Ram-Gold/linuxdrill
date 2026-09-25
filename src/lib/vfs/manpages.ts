/**
 * LinuxDrill Authentic Man Pages & GNU --help Registry
 * Modeled after CentOS Stream 9 (x86_64) / GNU coreutils 9.x
 */

export interface ManOption {
  flag: string;
  description: string;
}

export interface ManPage {
  name: string;
  section: number;
  synopsis: string;
  description: string;
  options: ManOption[];
  examples?: string[];
  seeAlso?: string[];
  helpText?: string;
}

export const MAN_PAGES: Record<string, ManPage> = {
  ls: {
    name: "ls",
    section: 1,
    synopsis: "ls [OPTION]... [FILE]...",
    description:
      "List information about the FILEs (the current directory by default). Sort entries alphabetically if none of -cftuvSUX nor --sort is specified.",
    options: [
      { flag: "-a, --all", description: "do not ignore entries starting with ." },
      { flag: "-A, --almost-all", description: "do not list implied . and .." },
      { flag: "-l", description: "use a long listing format" },
      { flag: "-h, --human-readable", description: "with -l and -s, print sizes like 1K 234M 2G etc." },
      { flag: "-d, --directory", description: "list directories themselves, not their contents" },
      { flag: "-t", description: "sort by time, newest first; see --time" },
      { flag: "-r, --reverse", description: "reverse order while sorting" },
      { flag: "-R, --recursive", description: "list subdirectories recursively" },
      { flag: "-1", description: "list one file per line" },
      { flag: "--color[=WHEN]", description: "colorize the output; WHEN can be 'always', 'auto', or 'never'" },
      { flag: "--help", description: "display this help and exit" },
      { flag: "--version", description: "output version information and exit" },
    ],
    examples: [
      "ls -la /etc",
      "ls -lh /var/log",
      "ls -R /home/student",
    ],
    seeAlso: ["dir(1)", "vdir(1)"],
  },

  cd: {
    name: "cd",
    section: 1,
    synopsis: "cd [-L|[-P [-e]] [-@]] [dir]",
    description:
      "Change the current working directory to DIR. The default DIR is the value of the HOME shell variable. The variable CDPATH defines the search path for the directory which contains DIR. A null directory name in CDPATH is the same as the current directory.",
    options: [
      { flag: "-L", description: "force symbolic links to be followed: resolve symbolic links in DIR after processing instances of '..'" },
      { flag: "-P", description: "use the physical directory structure without following symbolic links: resolve symbolic links in DIR before processing instances of '..'" },
      { flag: "-", description: "change to the previous working directory (equivalent to $OLDPWD)" },
      { flag: "--help", description: "display this help and exit" },
    ],
    examples: [
      "cd /var/log",
      "cd ~",
      "cd -",
      "cd ..",
    ],
    seeAlso: ["pwd(1)", "bash(1)"],
  },

  pwd: {
    name: "pwd",
    section: 1,
    synopsis: "pwd [OPTION]...",
    description:
      "Print the full filename of the current working directory.",
    options: [
      { flag: "-L, --logical", description: "use PWD from environment, even if it contains symlinks" },
      { flag: "-P, --physical", description: "avoid all symlinks" },
      { flag: "--help", description: "display this help and exit" },
      { flag: "--version", description: "output version information and exit" },
    ],
    examples: ["pwd", "pwd -P"],
    seeAlso: ["cd(1)"],
  },

  mkdir: {
    name: "mkdir",
    section: 1,
    synopsis: "mkdir [OPTION]... DIRECTORY...",
    description:
      "Create the DIRECTORY(ies), if they do not already exist. Mandatory arguments to long options are mandatory for short options too.",
    options: [
      { flag: "-m, --mode=MODE", description: "set file mode (as in chmod), not a=rwx - umask" },
      { flag: "-p, --parents", description: "no error if existing, make parent directories as needed" },
      { flag: "-v, --verbose", description: "print a message for each created directory" },
      { flag: "-Z", description: "set SELinux security context of each created directory to the default type" },
      { flag: "--help", description: "display this help and exit" },
      { flag: "--version", description: "output version information and exit" },
    ],
    examples: [
      "mkdir project",
      "mkdir -p /app/deploy/logs",
      "mkdir -m 770 /shared/sales",
    ],
    seeAlso: ["rmdir(1)", "chmod(1)"],
  },

  rm: {
    name: "rm",
    section: 1,
    synopsis: "rm [OPTION]... [FILE]...",
    description:
      "rm removes each specified file. By default, it does not remove directories. When removal of a hierarchy is requested (-r or -R), files are removed recursively.",
    options: [
      { flag: "-f, --force", description: "ignore nonexistent files and arguments, never prompt" },
      { flag: "-i", description: "prompt before every removal" },
      { flag: "-r, -R, --recursive", description: "remove directories and their contents recursively" },
      { flag: "-d, --dir", description: "remove empty directories" },
      { flag: "-v, --verbose", description: "explain what is being done" },
      { flag: "--help", description: "display this help and exit" },
      { flag: "--version", description: "output version information and exit" },
    ],
    examples: [
      "rm old_file.txt",
      "rm -rf /tmp/scratch",
      "rm -f *.bak",
    ],
    seeAlso: ["rmdir(1)", "unlink(1)"],
  },

  cp: {
    name: "cp",
    section: 1,
    synopsis: "cp [OPTION]... SOURCE... DEST",
    description:
      "Copy SOURCE to DEST, or multiple SOURCE(s) to DIRECTORY. Preserves specified attributes when requested.",
    options: [
      { flag: "-a, --archive", description: "same as -dR --preserve=all" },
      { flag: "-f, --force", description: "if an existing destination file cannot be opened, remove it and try again" },
      { flag: "-i, --interactive", description: "prompt before overwrite" },
      { flag: "-p", description: "same as --preserve=mode,ownership,timestamps" },
      { flag: "-r, -R, --recursive", description: "copy directories recursively" },
      { flag: "-u, --update", description: "copy only when the SOURCE file is newer than the destination file or when the destination file is missing" },
      { flag: "-v, --verbose", description: "explain what is being done" },
      { flag: "--help", description: "display this help and exit" },
    ],
    examples: [
      "cp config.conf config.conf.bak",
      "cp -r /src/data /backup/data",
      "cp -p secret.key /etc/ssl/private/",
    ],
    seeAlso: ["mv(1)", "install(1)"],
  },

  mv: {
    name: "mv",
    section: 1,
    synopsis: "mv [OPTION]... SOURCE... DEST",
    description:
      "Rename SOURCE to DEST, or move SOURCE(s) to DIRECTORY.",
    options: [
      { flag: "-f, --force", description: "do not prompt before overwriting" },
      { flag: "-i, --interactive", description: "prompt before overwrite" },
      { flag: "-n, --no-clobber", description: "do not overwrite an existing file" },
      { flag: "-u, --update", description: "move only when the SOURCE file is newer than destination" },
      { flag: "-v, --verbose", description: "explain what is being done" },
      { flag: "--help", description: "display this help and exit" },
    ],
    examples: [
      "mv oldname.txt newname.txt",
      "mv *.log /var/log/archive/",
    ],
    seeAlso: ["cp(1)", "rename(1)"],
  },

  touch: {
    name: "touch",
    section: 1,
    synopsis: "touch [OPTION]... FILE...",
    description:
      "Update the access and modification times of each FILE to the current time. A FILE argument that does not exist is created empty, unless -c or -h is supplied.",
    options: [
      { flag: "-a", description: "change only the access time" },
      { flag: "-c, --no-create", description: "do not create any files" },
      { flag: "-m", description: "change only the modification time" },
      { flag: "-r, --reference=FILE", description: "use this file's times instead of current time" },
      { flag: "-t STAMP", description: "use [[CC]YY]MMDDhhmm[.ss] instead of current time" },
      { flag: "--help", description: "display this help and exit" },
    ],
    examples: [
      "touch newfile.txt",
      "touch -c existing_file.txt",
    ],
    seeAlso: ["stat(1)"],
  },

  cat: {
    name: "cat",
    section: 1,
    synopsis: "cat [OPTION]... [FILE]...",
    description:
      "Concatenate FILE(s) to standard output. With no FILE, or when FILE is -, read standard input.",
    options: [
      { flag: "-n, --number", description: "number all output lines" },
      { flag: "-b, --number-nonblank", description: "number nonempty output lines, overrides -n" },
      { flag: "-s, --squeeze-blank", description: "suppress repeated empty output lines" },
      { flag: "-E, --show-ends", description: "display $ at end of each line" },
      { flag: "-T, --show-tabs", description: "display TAB characters as ^I" },
      { flag: "-A, --show-all", description: "equivalent to -vET" },
      { flag: "--help", description: "display this help and exit" },
    ],
    examples: [
      "cat /etc/passwd",
      "cat -n /etc/fstab",
      "cat file1.txt file2.txt > combined.txt",
    ],
    seeAlso: ["tac(1)", "head(1)", "tail(1)"],
  },

  head: {
    name: "head",
    section: 1,
    synopsis: "head [OPTION]... [FILE]...",
    description:
      "Print the first 10 lines of each FILE to standard output. With more than one FILE, precede each with a header giving the file name. With no FILE, or when FILE is -, read standard input.",
    options: [
      { flag: "-n, --lines=[-]NUM", description: "print the first NUM lines instead of the first 10; with the leading '-', print all but the last NUM lines of each file" },
      { flag: "-c, --bytes=[-]NUM", description: "print the first NUM bytes of each file" },
      { flag: "-q, --quiet, --silent", description: "never print headers giving file names" },
      { flag: "-v, --verbose", description: "always print headers giving file names" },
      { flag: "--help", description: "display this help and exit" },
    ],
    examples: [
      "head -n 5 /etc/passwd",
      "head -n 20 /var/log/messages",
    ],
    seeAlso: ["tail(1)"],
  },

  tail: {
    name: "tail",
    section: 1,
    synopsis: "tail [OPTION]... [FILE]...",
    description:
      "Print the last 10 lines of each FILE to standard output. With more than one FILE, precede each with a header giving the file name. With no FILE, or when FILE is -, read standard input.",
    options: [
      { flag: "-n, --lines=[+]NUM", description: "output the last NUM lines, instead of the last 10; or use -n +NUM to output starting with line NUM" },
      { flag: "-c, --bytes=[+]NUM", description: "output the last NUM bytes" },
      { flag: "-f, --follow[={name|descriptor}]", description: "output appended data as the file grows" },
      { flag: "-q, --quiet, --silent", description: "never output headers giving file names" },
      { flag: "--help", description: "display this help and exit" },
    ],
    examples: [
      "tail -n 10 /var/log/messages",
      "tail -f /var/log/secure",
    ],
    seeAlso: ["head(1)"],
  },

  grep: {
    name: "grep",
    section: 1,
    synopsis: "grep [OPTION...] PATTERNS [FILE...]",
    description:
      "grep searches for PATTERNS in each FILE. PATTERNS is one or more patterns separated by newline characters, and grep prints each line that matches a pattern.",
    options: [
      { flag: "-i, --ignore-case", description: "ignore case distinctions in patterns and input data" },
      { flag: "-v, --invert-match", description: "select non-matching lines" },
      { flag: "-r, -R, --recursive", description: "read all files under each directory, recursively" },
      { flag: "-n, --line-number", description: "prefix each line of output with the 1-based line number within its input file" },
      { flag: "-c, --count", description: "suppress normal output; instead print a count of matching lines for each input file" },
      { flag: "-l, --files-with-matches", description: "suppress normal output; instead print the name of each input file from which output would normally have been printed" },
      { flag: "-E, --extended-regexp", description: "interpret PATTERNS as extended regular expressions (EREs)" },
      { flag: "-w, --word-regexp", description: "force PATTERNS to match only whole words" },
      { flag: "--help", description: "display this help and exit" },
    ],
    examples: [
      "grep 'student' /etc/passwd",
      "grep -i -r 'error' /var/log/",
      "grep -v '^#' /etc/fstab",
    ],
    seeAlso: ["egrep(1)", "fgrep(1)", "sed(1)", "awk(1)"],
  },

  chmod: {
    name: "chmod",
    section: 1,
    synopsis: "chmod [OPTION]... MODE[,MODE]... FILE...\n  or:  chmod [OPTION]... OCTAL-MODE FILE...",
    description:
      "chmod changes the file mode bits of each given file according to mode, which can be either a symbolic representation of changes to make, or an octal number representing the bit pattern for the new mode bits.",
    options: [
      { flag: "-R, --recursive", description: "change files and directories recursively" },
      { flag: "-v, --verbose", description: "output a diagnostic for every file processed" },
      { flag: "-c, --changes", description: "like verbose but report only when a change is made" },
      { flag: "-f, --silent, --quiet", description: "suppress most error messages" },
      { flag: "--help", description: "display this help and exit" },
      { flag: "--version", description: "output version information and exit" },
    ],
    examples: [
      "chmod 600 /home/student/.ssh/id_rsa",
      "chmod 755 /usr/local/bin/backup.sh",
      "chmod 2770 /shared/project  # Set SGID",
      "chmod u=rw,go=r file.txt",
      "chmod -R g+s /data/collab",
    ],
    seeAlso: ["chown(1)", "chgrp(1)", "stat(1)"],
  },

  chown: {
    name: "chown",
    section: 1,
    synopsis: "chown [OPTION]... [OWNER][:[GROUP]] FILE...",
    description:
      "chown changes the user and/or group ownership of each given FILE. If only an owner (a user name or numeric user ID) is given, that user is made the owner of each given file, and the file's group is not changed. If the owner is followed by a colon and a group name, the file's group is also changed.",
    options: [
      { flag: "-R, --recursive", description: "operate on files and directories recursively" },
      { flag: "-v, --verbose", description: "output a diagnostic for every file processed" },
      { flag: "-c, --changes", description: "like verbose but report only when a change is made" },
      { flag: "-h, --no-dereference", description: "affect symbolic links instead of any referenced file" },
      { flag: "--help", description: "display this help and exit" },
    ],
    examples: [
      "chown student /home/student/notes.txt",
      "chown student:wheel /data/reports",
      "chown -R apache:apache /var/www/html",
    ],
    seeAlso: ["chgrp(1)", "chmod(1)"],
  },

  chgrp: {
    name: "chgrp",
    section: 1,
    synopsis: "chgrp [OPTION]... GROUP FILE...",
    description:
      "chgrp changes the group ownership of each given FILE. GROUP may be either a group name or a numeric group ID.",
    options: [
      { flag: "-R, --recursive", description: "operate on files and directories recursively" },
      { flag: "-v, --verbose", description: "output a diagnostic for every file processed" },
      { flag: "-c, --changes", description: "like verbose but report only when a change is made" },
      { flag: "--help", description: "display this help and exit" },
    ],
    examples: [
      "chgrp developers /opt/project",
      "chgrp -R sales /shared/sales",
    ],
    seeAlso: ["chown(1)", "chmod(1)"],
  },

  tar: {
    name: "tar",
    section: 1,
    synopsis: "tar [OPTION...] [FILE]...",
    description:
      "GNU tar is an archiving program designed to store multiple files in a single archive file, and to manipulate such archives.",
    options: [
      { flag: "-c, --create", description: "create a new archive" },
      { flag: "-x, --extract, --get", description: "extract files from an archive" },
      { flag: "-t, --list", description: "list the contents of an archive" },
      { flag: "-f, --file=ARCHIVE", description: "use archive file or device ARCHIVE" },
      { flag: "-z, --gzip", description: "filter the archive through gzip (.tar.gz / .tgz)" },
      { flag: "-j, --bzip2", description: "filter the archive through bzip2 (.tar.bz2)" },
      { flag: "-J, --xz", description: "filter the archive through xz (.tar.xz)" },
      { flag: "-v, --verbose", description: "verbosely list files processed" },
      { flag: "-C, --directory=DIR", description: "change to DIR before performing operations" },
      { flag: "-p, --preserve-permissions", description: "extract information about file permissions" },
      { flag: "--help", description: "display this help and exit" },
    ],
    examples: [
      "tar -czvf backup.tar.gz /etc /var/log",
      "tar -xzvf backup.tar.gz -C /restore",
      "tar -tf archive.tar.gz",
    ],
    seeAlso: ["gzip(1)", "bzip2(1)", "xz(1)"],
  },

  find: {
    name: "find",
    section: 1,
    synopsis: "find [-H] [-L] [-P] [starting-point...] [expression]",
    description:
      "find searches the directory tree rooted at each given starting-point by evaluating the given expression from left to right, according to the rules of precedence.",
    options: [
      { flag: "-name PATTERN", description: "base of file name matches shell pattern PATTERN" },
      { flag: "-iname PATTERN", description: "like -name, but the match is case insensitive" },
      { flag: "-type [f|d|l]", description: "file is of type: f (regular file), d (directory), l (symbolic link)" },
      { flag: "-user USER", description: "file is owned by user USER (numeric user ID allowed)" },
      { flag: "-group GROUP", description: "file belongs to group GROUP (numeric group ID allowed)" },
      { flag: "-perm [-|/]MODE", description: "file's permission bits are exactly MODE, or match all/any bits" },
      { flag: "-size [+-]N[cwbkMG]", description: "file uses N units of space (k for KiB, M for MiB, G for GiB)" },
      { flag: "-mtime [+-]N", description: "file's data was last modified N*24 hours ago" },
      { flag: "-exec COMMAND ;", description: "execute COMMAND; returns true if 0 status is returned" },
      { flag: "--help", description: "display this help and exit" },
    ],
    examples: [
      "find /var/log -name '*.log'",
      "find /home -type f -size +10M",
      "find / -perm -4000 -type f  # Find SUID binaries",
    ],
    seeAlso: ["locate(1)", "grep(1)", "xargs(1)"],
  },

  stat: {
    name: "stat",
    section: 1,
    synopsis: "stat [OPTION]... FILE...",
    description:
      "Display file or file system status.",
    options: [
      { flag: "-c, --format=FORMAT", description: "use the specified FORMAT instead of the default; output a newline after each use of FORMAT" },
      { flag: "-L, --dereference", description: "follow links" },
      { flag: "-f, --file-system", description: "display file system status instead of file status" },
      { flag: "-t, --terse", description: "print the information in terse form" },
      { flag: "--help", description: "display this help and exit" },
    ],
    examples: [
      "stat /etc/passwd",
      "stat -c '%a %n' /etc/shadow",
    ],
    seeAlso: ["ls(1)"],
  },

  tree: {
    name: "tree",
    section: 1,
    synopsis: "tree [-acdfghilnpqrstuvxACDFJQSUZ] [-L level [-R]] [-P pattern] [-I pattern] [directory ...]",
    description:
      "tree is a recursive directory listing program that produces a depth indented listing of files.",
    options: [
      { flag: "-a", description: "all files are listed" },
      { flag: "-d", description: "list directories only" },
      { flag: "-L level", description: "max display depth of the directory tree" },
      { flag: "-p", description: "print the file type and permissions for each file" },
      { flag: "-u", description: "print the username, or UID # if no username is available" },
      { flag: "-g", description: "print the group name, or GID # if no group name is available" },
      { flag: "--help", description: "display this help and exit" },
    ],
    examples: [
      "tree /var/log",
      "tree -L 2 /etc",
    ],
    seeAlso: ["ls(1)", "find(1)"],
  },

  useradd: {
    name: "useradd",
    section: 8,
    synopsis: "useradd [options] LOGIN",
    description:
      "useradd is a low-level utility for adding users to the system. It creates a new user account using values specified on the command line plus default values from /etc/default/useradd and /etc/login.defs.",
    options: [
      { flag: "-u, --uid UID", description: "the numerical value of the user's ID" },
      { flag: "-g, --gid GROUP", description: "the name or number of the user's primary group" },
      { flag: "-G, --groups GROUPS", description: "a list of supplementary groups which the user is also a member of" },
      { flag: "-d, --home-dir HOME_DIR", description: "the new user will be created using HOME_DIR as the value for the user's login directory" },
      { flag: "-m, --create-home", description: "create the user's home directory if it does not exist" },
      { flag: "-s, --shell SHELL", description: "the name of the user's login shell (e.g. /bin/bash or /sbin/nologin)" },
      { flag: "-c, --comment COMMENT", description: "any text string (often the user's full name)" },
      { flag: "-e, --expiredate EXPIRE_DATE", description: "the date on which the user account will be disabled (YYYY-MM-DD)" },
      { flag: "-M, --no-create-home", description: "do no create the user's home directory" },
      { flag: "--help", description: "display this help and exit" },
    ],
    examples: [
      "useradd -m -s /bin/bash devuser",
      "useradd -u 2050 -g developers -G wheel,docker alex",
      "useradd -s /sbin/nologin -M svc_app",
    ],
    seeAlso: ["usermod(8)", "userdel(8)", "passwd(1)", "groupadd(8)"],
  },

  usermod: {
    name: "usermod",
    section: 8,
    synopsis: "usermod [options] LOGIN",
    description:
      "usermod modifies the system account files to reflect the changes that are specified on the command line.",
    options: [
      { flag: "-a, --append", description: "add the user to the supplementary group(s). Use only with the -G option" },
      { flag: "-G, --groups GROUPS", description: "a list of supplementary groups which the user is also a member of" },
      { flag: "-g, --gid GROUP", description: "the group name or number of the user's new initial login group" },
      { flag: "-s, --shell SHELL", description: "the name of the user's new login shell" },
      { flag: "-d, --home HOME_DIR", description: "the user's new login directory" },
      { flag: "-m, --move-home", description: "move the content of the home directory to the new location (use with -d)" },
      { flag: "-L, --lock", description: "lock a user's password" },
      { flag: "-U, --unlock", description: "unlock a user's password" },
      { flag: "-e, --expiredate EXPIRE_DATE", description: "the date on which the user account will be disabled (YYYY-MM-DD)" },
      { flag: "--help", description: "display this help and exit" },
    ],
    examples: [
      "usermod -aG wheel student",
      "usermod -s /sbin/nologin olduser",
      "usermod -L badactor",
    ],
    seeAlso: ["useradd(8)", "userdel(8)", "passwd(1)"],
  },

  userdel: {
    name: "userdel",
    section: 8,
    synopsis: "userdel [options] LOGIN",
    description:
      "userdel modifies the system account files, deleting all entries that refer to the user name LOGIN. The named user must exist.",
    options: [
      { flag: "-r, --remove", description: "files in the user's home directory will be removed along with the home directory itself and the user's mail spool" },
      { flag: "-f, --force", description: "this option forces the removal of the user account, even if the user is still logged in" },
      { flag: "--help", description: "display this help and exit" },
    ],
    examples: [
      "userdel student2",
      "userdel -r tempuser",
    ],
    seeAlso: ["useradd(8)", "usermod(8)"],
  },

  groupadd: {
    name: "groupadd",
    section: 8,
    synopsis: "groupadd [options] group",
    description:
      "groupadd creates a new group account using the values specified on the command line plus the default values from the system.",
    options: [
      { flag: "-g, --gid GID", description: "the numerical value of the group's ID" },
      { flag: "-r, --system", description: "create a system group" },
      { flag: "--help", description: "display this help and exit" },
    ],
    examples: [
      "groupadd developers",
      "groupadd -g 3000 sysadmins",
    ],
    seeAlso: ["groupdel(8)", "groupmod(8)", "useradd(8)"],
  },

  groupdel: {
    name: "groupdel",
    section: 8,
    synopsis: "groupdel [options] GROUP",
    description:
      "groupdel modifies the system account files, deleting all entries that refer to GROUP. The named group must exist.",
    options: [
      { flag: "-f, --force", description: "delete group even if it is the primary group of a user" },
      { flag: "--help", description: "display this help and exit" },
    ],
    examples: ["groupdel oldgroup"],
    seeAlso: ["groupadd(8)"],
  },

  passwd: {
    name: "passwd",
    section: 1,
    synopsis: "passwd [options] [LOGIN]",
    description:
      "passwd changes passwords for user accounts. A normal user may only change the password for their own account, while the superuser may change the password for any account.",
    options: [
      { flag: "-d, --delete", description: "delete a user's password (make it empty)" },
      { flag: "-l, --lock", description: "lock the password of the specified account" },
      { flag: "-u, --unlock", description: "unlock the password of the specified account" },
      { flag: "-e, --expire", description: "immediately expire an account's password" },
      { flag: "-S, --status", description: "display account status information" },
      { flag: "--stdin", description: "read new tokens from standard input (pipe passwords)" },
      { flag: "--help", description: "display this help and exit" },
    ],
    examples: [
      "passwd",
      "passwd student",
      "echo 'Password123' | passwd --stdin student",
    ],
    seeAlso: ["chage(1)", "useradd(8)"],
  },

  chage: {
    name: "chage",
    section: 1,
    synopsis: "chage [options] LOGIN",
    description:
      "chage modifies the number of days between password changes and the date of the last password change. This information is used by the system to determine when a user must change their password.",
    options: [
      { flag: "-l, --list", description: "show account aging information" },
      { flag: "-m, --mindays MIN_DAYS", description: "set minimum number of days before password may be changed" },
      { flag: "-M, --maxdays MAX_DAYS", description: "set maximum number of days during which a password is valid" },
      { flag: "-W, --warndays WARN_DAYS", description: "set expiration warning days to WARN_DAYS" },
      { flag: "-I, --inactive INACTIVE", description: "set password inactive after expiration to INACTIVE days" },
      { flag: "-E, --expiredate EXPIRE_DATE", description: "set account expiration date to EXPIRE_DATE (YYYY-MM-DD)" },
      { flag: "--help", description: "display this help and exit" },
    ],
    examples: [
      "chage -l student",
      "chage -M 90 -W 7 -m 1 student",
      "chage -E 2026-12-31 student",
    ],
    seeAlso: ["passwd(1)", "shadow(5)"],
  },

  setfacl: {
    name: "setfacl",
    section: 1,
    synopsis: "setfacl [-bkndRLPvh] [{-m|-x} acl_spec] [{-M|-X} acl_file] file ...",
    description:
      "setfacl sets Access Control Lists (ACLs) of files and directories. On the command line, a sequence of commands is followed by a sequence of files.",
    options: [
      { flag: "-m, --modify=acl", description: "modify the current ACL(s) of file(s)" },
      { flag: "-x, --remove=acl", description: "remove entries from the ACL(s) of file(s)" },
      { flag: "-b, --remove-all", description: "remove all extended ACL entries" },
      { flag: "-d, --default", description: "operations apply to the default ACL (directories only)" },
      { flag: "-R, --recursive", description: "apply operations to all files and directories recursively" },
      { flag: "--help", description: "display this help and exit" },
    ],
    examples: [
      "setfacl -m u:student:rwx /var/shared",
      "setfacl -m g:developers:rx /var/shared",
      "setfacl -d -m g:developers:rwx /var/shared",
      "setfacl -b /var/shared/file.txt",
    ],
    seeAlso: ["getfacl(1)", "chmod(1)"],
  },

  getfacl: {
    name: "getfacl",
    section: 1,
    synopsis: "getfacl [-aceEsRLPtpndvh] file ...",
    description:
      "For each file, getfacl displays the file name, owner, the group, and the Access Control List (ACL). If a directory has a default ACL, getfacl also displays the default ACL.",
    options: [
      { flag: "-a, --access", description: "display the file access control list" },
      { flag: "-d, --default", description: "display the default access control list" },
      { flag: "-c, --omit-header", description: "do not display the comment header" },
      { flag: "-R, --recursive", description: "recurse into subdirectories" },
      { flag: "--help", description: "display this help and exit" },
    ],
    examples: [
      "getfacl /var/shared",
      "getfacl -R /opt/project",
    ],
    seeAlso: ["setfacl(1)", "chmod(1)"],
  },

  getenforce: {
    name: "getenforce",
    section: 8,
    synopsis: "getenforce",
    description:
      "getenforce reports whether SELinux is running in Enforcing mode, Permissive mode, or Disabled.",
    options: [
      { flag: "--help", description: "display this help and exit" },
    ],
    examples: ["getenforce"],
    seeAlso: ["setenforce(8)", "selinux(8)"],
  },

  setenforce: {
    name: "setenforce",
    section: 8,
    synopsis: "setenforce [Enforcing|Permissive|1|0]",
    description:
      "setenforce modifies the current SELinux operating mode at runtime. Use 1 or Enforcing to enter enforcing mode; use 0 or Permissive to enter permissive mode. To disable permanently, edit /etc/selinux/config.",
    options: [
      { flag: "--help", description: "display this help and exit" },
    ],
    examples: [
      "setenforce 0",
      "setenforce Permissive",
      "setenforce Enforcing",
    ],
    seeAlso: ["getenforce(8)", "selinux(8)"],
  },

  semanage: {
    name: "semanage",
    section: 8,
    synopsis: "semanage {import,export,login,user,port,interface,module,node,fcontext,boolean,permissive,dontaudit} ...",
    description:
      "semanage is used to configure certain elements of SELinux policy without requiring modification to or recompilation from policy sources.",
    options: [
      { flag: "fcontext -a -t TYPE SPEC", description: "add file context rule for path SPEC (e.g. '/web(/.*)?')" },
      { flag: "fcontext -d SPEC", description: "delete file context rule" },
      { flag: "port -a -t TYPE -p PROTO PORT", description: "add port definition to SELinux policy" },
      { flag: "boolean -m --on|--off BOOL", description: "modify boolean value" },
      { flag: "-l, --list", description: "list records" },
      { flag: "--help", description: "display this help and exit" },
    ],
    examples: [
      "semanage fcontext -a -t httpd_sys_content_t '/custom(/.*)?'",
      "semanage port -a -t http_port_t -p tcp 8088",
      "semanage boolean -l",
    ],
    seeAlso: ["restorecon(8)", "chcon(1)", "selinux(8)"],
  },

  systemctl: {
    name: "systemctl",
    section: 1,
    synopsis: "systemctl [OPTIONS...] COMMAND [UNIT...]",
    description:
      "systemctl may be used to introspect and control the state of the 'systemd' system and service manager.",
    options: [
      { flag: "start UNIT...", description: "start (activate) one or more units specified on the command line" },
      { flag: "stop UNIT...", description: "stop (deactivate) one or more units" },
      { flag: "restart UNIT...", description: "stop and then start one or more units" },
      { flag: "reload UNIT...", description: "asks all units to reload their configuration" },
      { flag: "status [UNIT...]", description: "show terse runtime status information about one or more units" },
      { flag: "enable UNIT...", description: "enable one or more units to start on system boot" },
      { flag: "disable UNIT...", description: "disable one or more units from starting on boot" },
      { flag: "is-active UNIT...", description: "check whether any of the specified units are active (running)" },
      { flag: "is-enabled UNIT...", description: "check whether any of the specified units are enabled" },
      { flag: "mask UNIT...", description: "mask one or more units, linking their unit files to /dev/null" },
      { flag: "unmask UNIT...", description: "unmask one or more unit files" },
      { flag: "daemon-reload", description: "reload the systemd manager configuration and re-read all unit files" },
      { flag: "--now", description: "when enabling or disabling, also start or stop the unit immediately" },
      { flag: "--help", description: "display this help and exit" },
    ],
    examples: [
      "systemctl status sshd",
      "systemctl enable --now nginx",
      "systemctl restart chronyd",
      "systemctl is-active firewalld",
      "systemctl daemon-reload",
    ],
    seeAlso: ["journalctl(1)", "systemd(1)"],
  },

  journalctl: {
    name: "journalctl",
    section: 1,
    synopsis: "journalctl [OPTIONS...] [MATCHES...]",
    description:
      "journalctl may be used to query the contents of the systemd journal as written by systemd-journald.service.",
    options: [
      { flag: "-u, --unit=UNIT", description: "show messages for the specified systemd unit" },
      { flag: "-n, --lines=INTEGER", description: "number of journal entries to show (default 10)" },
      { flag: "-f, --follow", description: "show only the most recent journal entries, and continuously print new entries as they are appended" },
      { flag: "-p, --priority=PRIORITY", description: "filter output by message priority (e.g. err, warning, info)" },
      { flag: "-b, --boot=[ID]", description: "show messages from a specific boot (default: current boot)" },
      { flag: "-e, --pager-end", description: "immediately jump to the end of the journal in the pager" },
      { flag: "--help", description: "display this help and exit" },
    ],
    examples: [
      "journalctl -u sshd -n 20",
      "journalctl -p err -b",
      "journalctl -f",
    ],
    seeAlso: ["systemctl(1)", "systemd-journald(8)"],
  },

  ip: {
    name: "ip",
    section: 8,
    synopsis: "ip [ OPTIONS ] OBJECT { COMMAND | help }\n  where OBJECT := { link | address | addrlabel | route | rule | neigh | tunnel | maddress | mroute | mrule | monitor | xfrm | netns | l2tp | tcp_metrics }",
    description:
      "ip is used to show / manipulate routing, network devices, interfaces and tunnels.",
    options: [
      { flag: "addr show [dev IFNAME]", description: "display IP addresses on all or specified interfaces" },
      { flag: "addr add ADDR dev IFNAME", description: "assign an IP address to an interface" },
      { flag: "link show [dev IFNAME]", description: "display network interface status" },
      { flag: "link set dev IFNAME up|down", description: "bring interface online or offline" },
      { flag: "route show", description: "display the IP routing table" },
      { flag: "route add default via IP", description: "set the default gateway" },
      { flag: "-br, -brief", description: "print only essential information in a tabular format" },
      { flag: "-c, -color", description: "use color output" },
      { flag: "--help", description: "display this help and exit" },
    ],
    examples: [
      "ip a",
      "ip addr show ens33",
      "ip route show",
      "ip link set ens33 up",
      "ip -br a",
    ],
    seeAlso: ["nmcli(1)", "ss(8)", "ping(8)"],
  },

  nmcli: {
    name: "nmcli",
    section: 1,
    synopsis: "nmcli [OPTIONS] OBJECT { COMMAND | help }\n  where OBJECT := { general | networking | radio | connection | device | agent | monitor }",
    description:
      "nmcli is a command-line tool for controlling NetworkManager and getting its status. It can be utilized as a replacement for nm-applet or other graphical clients.",
    options: [
      { flag: "con show", description: "list all configured network connections" },
      { flag: "con up IFNAME", description: "activate a connection profile" },
      { flag: "con down IFNAME", description: "deactivate a connection profile" },
      { flag: "con mod IFNAME ipv4.addresses IP/MASK", description: "modify IPv4 address of connection" },
      { flag: "con mod IFNAME ipv4.gateway IP", description: "modify IPv4 gateway" },
      { flag: "con mod IFNAME ipv4.method manual|auto", description: "set IPv4 addressing method" },
      { flag: "dev status", description: "show status of all network devices" },
      { flag: "--help", description: "display this help and exit" },
    ],
    examples: [
      "nmcli con show",
      "nmcli dev status",
      "nmcli con mod ens33 ipv4.addresses 192.168.1.50/24 ipv4.method manual",
      "nmcli con up ens33",
    ],
    seeAlso: ["ip(8)"],
  },

  "firewall-cmd": {
    name: "firewall-cmd",
    section: 1,
    synopsis: "firewall-cmd [OPTIONS...]",
    description:
      "firewall-cmd is the command line client of the firewalld daemon. It provides an interface to manage the runtime and permanent configuration.",
    options: [
      { flag: "--state", description: "check whether firewalld daemon is active" },
      { flag: "--reload", description: "reload firewall rules and keep state information" },
      { flag: "--list-all", description: "list everything added for or enabled in the default or specified zone" },
      { flag: "--add-port=PORT/PROTO", description: "add the port to the zone" },
      { flag: "--remove-port=PORT/PROTO", description: "remove the port from the zone" },
      { flag: "--add-service=SERVICE", description: "add the service to the zone" },
      { flag: "--remove-service=SERVICE", description: "remove the service from the zone" },
      { flag: "--permanent", description: "use with add/remove to make configuration persist across reboots" },
      { flag: "--zone=ZONE", description: "perform operation on specified zone (e.g. public, internal)" },
      { flag: "--get-default-zone", description: "print default zone for connections and interfaces" },
      { flag: "--help", description: "display this help and exit" },
    ],
    examples: [
      "firewall-cmd --list-all",
      "firewall-cmd --add-port=80/tcp --permanent",
      "firewall-cmd --add-service=http --permanent",
      "firewall-cmd --reload",
    ],
    seeAlso: ["firewalld(1)", "iptables(8)", "nftables(8)"],
  },

  ss: {
    name: "ss",
    section: 8,
    synopsis: "ss [options] [ FILTER ]",
    description:
      "ss is used to dump socket statistics. It allows showing information similar to netstat. It can display more TCP and state information than other tools.",
    options: [
      { flag: "-t, --tcp", description: "display TCP sockets" },
      { flag: "-u, --udp", description: "display UDP sockets" },
      { flag: "-l, --listening", description: "display only listening sockets" },
      { flag: "-p, --processes", description: "show process using socket" },
      { flag: "-n, --numeric", description: "do not try to resolve service names (show port numbers)" },
      { flag: "-a, --all", description: "display both listening and non-listening sockets" },
      { flag: "--help", description: "display this help and exit" },
    ],
    examples: [
      "ss -tulpn",
      "ss -tl",
      "ss -tan",
    ],
    seeAlso: ["netstat(8)", "ip(8)"],
  },

  netstat: {
    name: "netstat",
    section: 8,
    synopsis: "netstat [options]",
    description:
      "netstat prints network connections, routing tables, interface statistics, masquerade connections, and multicast memberships. (Note: ss is the modern replacement in CentOS 9).",
    options: [
      { flag: "-t", description: "display TCP connections" },
      { flag: "-u", description: "display UDP connections" },
      { flag: "-l", description: "display listening server sockets" },
      { flag: "-p", description: "display PID/Program name for sockets" },
      { flag: "-n", description: "show numerical addresses instead of resolving hosts" },
      { flag: "-r", description: "display kernel routing tables" },
      { flag: "--help", description: "display this help and exit" },
    ],
    examples: ["netstat -tulpn", "netstat -rn"],
    seeAlso: ["ss(8)", "ip(8)"],
  },

  lsblk: {
    name: "lsblk",
    section: 8,
    synopsis: "lsblk [options] [device...]",
    description:
      "lsblk lists information about all available or the specified block devices. The lsblk command reads the sysfs filesystem and udev db to gather information.",
    options: [
      { flag: "-f, --fs", description: "output info about filesystems (FSTYPE, LABEL, UUID, FSAVAIL, FSUSE%, MOUNTPOINTS)" },
      { flag: "-m, --perms", description: "output info about device permissions" },
      { flag: "-a, --all", description: "also list empty devices" },
      { flag: "-p, --paths", description: "print complete device paths" },
      { flag: "--help", description: "display this help and exit" },
    ],
    examples: [
      "lsblk",
      "lsblk -f",
      "lsblk -p /dev/sda",
    ],
    seeAlso: ["blkid(8)", "findmnt(8)"],
  },

  blkid: {
    name: "blkid",
    section: 8,
    synopsis: "blkid [options] [device...]",
    description:
      "The blkid program is the command-line interface to working with the libblkid library. It can determine the type of content (e.g. filesystem or swap) that a block device holds, and also the attributes (tokens, NAME=value pairs) from the content metadata (e.g. UUID or LABEL).",
    options: [
      { flag: "-s <tag>", description: "show specified tag (e.g. UUID, TYPE, LABEL)" },
      { flag: "-o <format>", description: "output format (value, device, list, udev, full)" },
      { flag: "--help", description: "display this help and exit" },
    ],
    examples: [
      "blkid",
      "blkid /dev/sda1",
    ],
    seeAlso: ["lsblk(8)", "findfs(8)"],
  },

  pvcreate: {
    name: "pvcreate",
    section: 8,
    synopsis: "pvcreate [option_args] [position_args]",
    description:
      "pvcreate initializes a Physical Volume (PV) on a device so the device is recognized as belonging to LVM (Logical Volume Manager) and can be added to a Volume Group.",
    options: [
      { flag: "-f, --force", description: "force creation without confirmation" },
      { flag: "-y, --yes", description: "answer yes to all prompts" },
      { flag: "--help", description: "display this help and exit" },
    ],
    examples: [
      "pvcreate /dev/sdb1",
      "pvcreate /dev/sdc",
    ],
    seeAlso: ["vgcreate(8)", "lvcreate(8)", "pvs(8)"],
  },

  vgcreate: {
    name: "vgcreate",
    section: 8,
    synopsis: "vgcreate [option_args] VolumeGroupName PhysicalDevicePath...",
    description:
      "vgcreate creates a new volume group called VolumeGroupName using the specified physical volume devices.",
    options: [
      { flag: "-s, --physicalextentsize SIZE", description: "sets the physical extent size on physical volumes of this volume group" },
      { flag: "--help", description: "display this help and exit" },
    ],
    examples: [
      "vgcreate vg_data /dev/sdb1",
      "vgcreate vg_web /dev/sdb1 /dev/sdc1",
    ],
    seeAlso: ["pvcreate(8)", "lvcreate(8)", "vgs(8)"],
  },

  lvcreate: {
    name: "lvcreate",
    section: 8,
    synopsis: "lvcreate [option_args] [position_args]",
    description:
      "lvcreate creates a new Logical Volume (LV) in an existing Volume Group (VG).",
    options: [
      { flag: "-n, --name NAME", description: "the name of the new logical volume" },
      { flag: "-L, --size SIZE", description: "gives the size in Megabytes, Gigabytes, etc. (e.g. 500M, 4G)" },
      { flag: "-l, --extents EXTENTS", description: "gives the number of logical extents to allocate (e.g. 100%FREE)" },
      { flag: "--help", description: "display this help and exit" },
    ],
    examples: [
      "lvcreate -n lv_storage -L 2G vg_data",
      "lvcreate -n lv_opt -l 100%FREE vg_data",
    ],
    seeAlso: ["lvextend(8)", "lvdisplay(8)", "vgs(8)"],
  },

  lvextend: {
    name: "lvextend",
    section: 8,
    synopsis: "lvextend [option_args] [position_args]",
    description:
      "lvextend extends the size of a logical volume. It can also extend the underlying filesystem when using the -r option.",
    options: [
      { flag: "-L, --size [+]SIZE", description: "extend or set the logical volume size in units of Megabytes, Gigabytes, etc." },
      { flag: "-l, --extents [+]EXTENTS", description: "extend or set the logical volume size in extents (e.g. +100%FREE)" },
      { flag: "-r, --resizefs", description: "resize underlying filesystem together with the logical volume using fsadm(8)" },
      { flag: "--help", description: "display this help and exit" },
    ],
    examples: [
      "lvextend -L +500M /dev/vg_data/lv_storage",
      "lvextend -r -l +100%FREE /dev/mapper/vg_data-lv_storage",
    ],
    seeAlso: ["lvcreate(8)", "lvreduce(8)", "xfs_growfs(8)"],
  },

  "mkfs.xfs": {
    name: "mkfs.xfs",
    section: 8,
    synopsis: "mkfs.xfs [options] device",
    description:
      "mkfs.xfs constructs an XFS filesystem by writing on a special file or partition or volume.",
    options: [
      { flag: "-f", description: "force overwrite if an existing filesystem is detected" },
      { flag: "-b size=NUM", description: "set block size (default 4096)" },
      { flag: "-L label", description: "set the filesystem label (max 12 characters)" },
      { flag: "--help", description: "display this help and exit" },
    ],
    examples: [
      "mkfs.xfs /dev/vg_data/lv_storage",
      "mkfs.xfs -f -L DATA_VOL /dev/sdb1",
    ],
    seeAlso: ["mount(8)", "xfs_info(8)"],
  },

  mount: {
    name: "mount",
    section: 8,
    synopsis: "mount [-l] [-t fstype] [-o options] device dir",
    description:
      "All files accessible in a Unix system are arranged in one big tree, the file hierarchy, rooted at /. These files can be spread out over several devices. The mount command serves to attach the filesystem found on some device to the big file tree.",
    options: [
      { flag: "-a, --all", description: "mount all filesystems mentioned in fstab" },
      { flag: "-t, --types FSTYPE", description: "the argument following the -t is used to indicate the filesystem type (e.g. xfs, ext4, nfs)" },
      { flag: "-o, --options OPTIONS", description: "comma-separated list of mount options (e.g. ro, rw, noexec, defaults)" },
      { flag: "-v, --verbose", description: "verbose mode" },
      { flag: "--help", description: "display this help and exit" },
    ],
    examples: [
      "mount /dev/vg_data/lv_storage /mnt/storage",
      "mount -a",
      "mount -o ro /dev/sdb1 /mnt/backup",
    ],
    seeAlso: ["umount(8)", "fstab(5)"],
  },

  df: {
    name: "df",
    section: 1,
    synopsis: "df [OPTION]... [FILE]...",
    description:
      "df displays the amount of disk space available on the file system containing each file name argument. If no file name is given, the space available on all currently mounted file systems is shown.",
    options: [
      { flag: "-h, --human-readable", description: "print sizes in powers of 1024 (e.g., 1023M)" },
      { flag: "-T, --print-type", description: "print file system type" },
      { flag: "-i, --inodes", description: "list inode information instead of block usage" },
      { flag: "-a, --all", description: "include pseudo, duplicate, inaccessible file systems" },
      { flag: "--help", description: "display this help and exit" },
    ],
    examples: [
      "df -h",
      "df -hT",
      "df -h /home",
    ],
    seeAlso: ["du(1)", "lsblk(8)"],
  },

  free: {
    name: "free",
    section: 1,
    synopsis: "free [options]",
    description:
      "free displays the total amount of free and used physical and swap memory in the system, as well as the buffers and caches used by the kernel.",
    options: [
      { flag: "-h, --human", description: "show all output fields automatically scaled to shortest three digit unit and display the units of print" },
      { flag: "-m, --mebi", description: "display the amount of memory in mebibytes" },
      { flag: "-g, --gibi", description: "display the amount of memory in gibibytes" },
      { flag: "-w, --wide", description: "wide output mode" },
      { flag: "--help", description: "display this help and exit" },
    ],
    examples: [
      "free -h",
      "free -m",
    ],
    seeAlso: ["vmstat(8)", "top(1)"],
  },

  dnf: {
    name: "dnf",
    section: 8,
    synopsis: "dnf [options] <command> [<args>...]",
    description:
      "DNF is the next-generation version of YUM, a package manager for RPM-based Linux distributions (such as CentOS Stream 9). It has been the default package manager since CentOS 8.",
    options: [
      { flag: "install <package>...", description: "install a package or packages on your system" },
      { flag: "remove <package>...", description: "remove the specified packages from the system" },
      { flag: "update / upgrade", description: "update installed packages to the latest versions" },
      { flag: "search <keywords>...", description: "search package metadata for keywords" },
      { flag: "repolist [all|enabled|disabled]", description: "display the configured software repositories" },
      { flag: "provides <path_or_feature>", description: "find packages that provide the specified file or feature" },
      { flag: "clean all", description: "remove all cached packages and metadata" },
      { flag: "-y, --assumeyes", description: "automatically answer yes for all questions" },
      { flag: "--help", description: "display this help and exit" },
    ],
    examples: [
      "dnf install -y nginx",
      "dnf repolist",
      "dnf provides /usr/sbin/semanage",
    ],
    seeAlso: ["yum(8)", "rpm(8)"],
  },

  yum: {
    name: "yum",
    section: 8,
    synopsis: "yum [options] <command> [<args>...]",
    description:
      "YUM in CentOS Stream 9 is a symbolic link to DNF. It provides identical CLI functionality and repository management.",
    options: [
      { flag: "install <package>...", description: "install package(s)" },
      { flag: "remove <package>...", description: "remove package(s)" },
      { flag: "repolist", description: "display repositories" },
      { flag: "-y", description: "answer yes to prompts" },
      { flag: "--help", description: "display this help and exit" },
    ],
    examples: ["yum install -y httpd", "yum repolist"],
    seeAlso: ["dnf(8)", "rpm(8)"],
  },

  rpm: {
    name: "rpm",
    section: 8,
    synopsis: "rpm [OPTIONS] [PACKAGE_FILE]",
    description:
      "rpm is a powerful Package Manager, which can be used to build, install, query, verify, update, and erase individual software packages.",
    options: [
      { flag: "-i, --install", description: "install a package" },
      { flag: "-U, --upgrade", description: "upgrade or install a package" },
      { flag: "-e, --erase", description: "erase (uninstall) a package" },
      { flag: "-qa", description: "query all installed packages" },
      { flag: "-q <package>", description: "query if package is installed" },
      { flag: "-ql <package>", description: "list files owned by package" },
      { flag: "-qf <file>", description: "query what package owns the specified file" },
      { flag: "--help", description: "display this help and exit" },
    ],
    examples: [
      "rpm -qa | grep ssh",
      "rpm -qf /etc/passwd",
      "rpm -ql coreutils",
    ],
    seeAlso: ["dnf(8)", "yum(8)"],
  },

  curl: {
    name: "curl",
    section: 1,
    synopsis: "curl [options / URLs]",
    description:
      "curl is a tool for transferring data from or to a server using one of the supported protocols (HTTP, HTTPS, FTP, etc.).",
    options: [
      { flag: "-I, --head", description: "fetch the HTTP-header only" },
      { flag: "-v, --verbose", description: "make the operation more talkative" },
      { flag: "-s, --silent", description: "silent or quiet mode" },
      { flag: "-o, --output <file>", description: "write to file instead of stdout" },
      { flag: "-O, --remote-name", description: "write output to a local file named like the remote file" },
      { flag: "-k, --insecure", description: "allow insecure server connections when using SSL" },
      { flag: "--help", description: "display this help and exit" },
    ],
    examples: [
      "curl http://localhost:80",
      "curl -I https://example.com",
    ],
    seeAlso: ["wget(1)"],
  },

  ping: {
    name: "ping",
    section: 8,
    synopsis: "ping [options] destination",
    description:
      "ping uses the ICMP protocol's mandatory ECHO_REQUEST datagram to elicit an ICMP ECHO_RESPONSE from a host or gateway.",
    options: [
      { flag: "-c count", description: "stop after sending count ECHO_REQUEST packets" },
      { flag: "-i interval", description: "wait interval seconds between sending each packet" },
      { flag: "-W timeout", description: "time to wait for a response, in seconds" },
      { flag: "--help", description: "display this help and exit" },
    ],
    examples: [
      "ping -c 4 192.168.122.1",
      "ping -c 3 google.com",
    ],
    seeAlso: ["ip(8)", "traceroute(8)"],
  },

  su: {
    name: "su",
    section: 1,
    synopsis: "su [options] [-] [user [argument...]]",
    description:
      "su allows running commands with a substitute user and group ID. When called with no user specified, su defaults to running an interactive shell as root.",
    options: [
      { flag: "-, -l, --login", description: "start the shell as a login shell with an environment similar to a real login" },
      { flag: "-c, --command COMMAND", description: "pass COMMAND to the shell with the -c option" },
      { flag: "-s, --shell SHELL", description: "run the specified SHELL instead of the default" },
      { flag: "--help", description: "display this help and exit" },
    ],
    examples: [
      "su -",
      "su - student",
      "su -c 'whoami' root",
    ],
    seeAlso: ["sudo(8)", "id(1)"],
  },

  sudo: {
    name: "sudo",
    section: 8,
    synopsis: "sudo [-u user] command",
    description:
      "sudo allows a permitted user to execute a command as the superuser or another user, as specified by the security policy (the sudoers file).",
    options: [
      { flag: "-u USER, --user=USER", description: "run the command as a user other than the default target user (root)" },
      { flag: "-i, --login", description: "run the shell specified by the target user's password database entry as a login shell" },
      { flag: "-l, --list", description: "list user's privileges or check a specific command" },
      { flag: "--help", description: "display this help and exit" },
    ],
    examples: [
      "sudo systemctl restart nginx",
      "sudo -i",
      "sudo useradd newdev",
    ],
    seeAlso: ["su(1)", "visudo(8)"],
  },

  id: {
    name: "id",
    section: 1,
    synopsis: "id [OPTION]... [USER]...",
    description:
      "Print user and group information for each specified USER, or (when USER omitted) for the current process.",
    options: [
      { flag: "-u, --user", description: "print only the effective user ID" },
      { flag: "-g, --group", description: "print only the effective group ID" },
      { flag: "-G, --groups", description: "print all group IDs" },
      { flag: "-n, --name", description: "print a name instead of a number, for -ugG" },
      { flag: "-Z, --context", description: "print only the security context of the process" },
      { flag: "--help", description: "display this help and exit" },
    ],
    examples: ["id", "id student", "id -u"],
    seeAlso: ["whoami(1)", "groups(1)"],
  },

  whoami: {
    name: "whoami",
    section: 1,
    synopsis: "whoami [OPTION]...",
    description:
      "Print the user name associated with the current effective user ID. Same as id -un.",
    options: [
      { flag: "--help", description: "display this help and exit" },
      { flag: "--version", description: "output version information and exit" },
    ],
    examples: ["whoami"],
    seeAlso: ["id(1)"],
  },

  groups: {
    name: "groups",
    section: 1,
    synopsis: "groups [OPTION]... [USERNAME]...",
    description:
      "Print group memberships for each USERNAME or, if no USERNAME is specified, for the current process (which may differ if the group database has changed).",
    options: [
      { flag: "--help", description: "display this help and exit" },
    ],
    examples: ["groups", "groups student"],
    seeAlso: ["id(1)"],
  },

  uname: {
    name: "uname",
    section: 1,
    synopsis: "uname [OPTION]...",
    description:
      "Print certain system information. With no OPTION, same as -s.",
    options: [
      { flag: "-a, --all", description: "print all information in the following order: kernel name, nodename, kernel release, kernel version, machine" },
      { flag: "-s, --kernel-name", description: "print the kernel name" },
      { flag: "-n, --nodename", description: "print the network node hostname" },
      { flag: "-r, --kernel-release", description: "print the kernel release" },
      { flag: "-m, --machine", description: "print the machine hardware name (e.g. x86_64)" },
      { flag: "--help", description: "display this help and exit" },
    ],
    examples: ["uname -a", "uname -r"],
    seeAlso: ["arch(1)", "hostname(1)"],
  },

  uptime: {
    name: "uptime",
    section: 1,
    synopsis: "uptime [options]",
    description:
      "uptime gives a one line display of the following information: current time, how long the system has been running, how many users are currently logged on, and system load averages for the past 1, 5, and 15 minutes.",
    options: [
      { flag: "-p, --pretty", description: "show uptime in pretty format" },
      { flag: "-s, --since", description: "system up since" },
      { flag: "--help", description: "display this help and exit" },
    ],
    examples: ["uptime", "uptime -p"],
    seeAlso: ["w(1)", "top(1)"],
  },

  date: {
    name: "date",
    section: 1,
    synopsis: "date [OPTION]... [+FORMAT]\n  or:  date [-u|--utc|--universal] [MMDDhhmm[[CC]YY][.ss]]",
    description:
      "Display the current time in the given FORMAT, or set the system date.",
    options: [
      { flag: "-u, --utc, --universal", description: "print or set Coordinated Universal Time (UTC)" },
      { flag: "+FORMAT", description: "controls the output format (e.g. +%Y-%m-%d, +%H:%M:%S)" },
      { flag: "--help", description: "display this help and exit" },
    ],
    examples: ["date", "date +%Y-%m-%d"],
    seeAlso: ["time(1)"],
  },

  which: {
    name: "which",
    section: 1,
    synopsis: "which [options] [--] filename ...",
    description:
      "which takes one or more arguments. For each of its arguments it prints to stdout the full path of the executables that would have been executed when this argument had been entered at the shell prompt.",
    options: [
      { flag: "-a", description: "print all matching pathnames of each argument" },
      { flag: "--help", description: "display this help and exit" },
    ],
    examples: ["which bash", "which python3"],
    seeAlso: ["type(1)", "whereis(1)"],
  },

  clear: {
    name: "clear",
    section: 1,
    synopsis: "clear [options]",
    description:
      "clear clears your screen if this is possible, including its scrollback buffer if the extended 'E' capability is supported.",
    options: [
      { flag: "-x", description: "do not clear the scrollback buffer" },
      { flag: "--help", description: "display this help and exit" },
    ],
    examples: ["clear"],
    seeAlso: ["reset(1)"],
  },

  history: {
    name: "history",
    section: 1,
    synopsis: "history [-c] [-d offset] [n]\n  or:  history -anrw [filename]",
    description:
      "Display or manipulate the history list. With no options, display the history list with line numbers. Lines prefixed with a '*' have been modified.",
    options: [
      { flag: "-c", description: "clear the history list by deleting all entries" },
      { flag: "-d offset", description: "delete the history entry at position OFFSET" },
      { flag: "n", description: "list only the last N lines" },
      { flag: "--help", description: "display this help and exit" },
    ],
    examples: ["history", "history 10", "history -c"],
    seeAlso: ["bash(1)"],
  },

  less: {
    name: "less",
    section: 1,
    synopsis: "less [-[+]aABcCdeEfFgGiIJKLmMnNqQrRsSuUVwWX~] [filename]...",
    description:
      "less is a program similar to more(1), but which allows backward movement in the file as well as forward movement. Also, less does not have to read the entire input file before starting, so with large input files it starts up faster than text editors like vi(1).",
    options: [
      { flag: "-N, --LINE-NUMBERS", description: "causes a line number to be displayed at the beginning of each line in the display" },
      { flag: "-S, --chop-long-lines", description: "causes lines longer than the screen width to be chopped rather than wrapped" },
      { flag: "-i, --ignore-case", description: "causes searches to ignore case" },
      { flag: "--help", description: "display this help and exit" },
    ],
    examples: [
      "less /var/log/messages",
      "cat file.txt | less",
    ],
    seeAlso: ["more(1)", "man(1)"],
  },

  man: {
    name: "man",
    section: 1,
    synopsis: "man [man options] [[section] page ...] ...",
    description:
      "man is the system's manual pager. Each page argument given to man is normally the name of a program, utility or function. The manual page associated with each of these arguments is then found and displayed. A section, if provided, will direct man to look only in that section of the manual.",
    options: [
      { flag: "-k, --apropos", description: "search the short descriptions and manual page names for the keyword" },
      { flag: "-f, --whatis", description: "equivalent to whatis" },
      { flag: "-a, --all", description: "open all matching manual pages" },
      { flag: "1", description: "Executable programs or shell commands" },
      { flag: "5", description: "File formats and conventions (e.g. /etc/passwd, /etc/fstab)" },
      { flag: "8", description: "System administration commands (usually only for root)" },
      { flag: "--help", description: "display this help and exit" },
    ],
    examples: [
      "man ls",
      "man 5 passwd",
      "man 8 systemctl",
    ],
    seeAlso: ["apropos(1)", "whatis(1)", "less(1)"],
  },
};

// Aliases for related tools
MAN_PAGES["service"] = MAN_PAGES["systemctl"];
MAN_PAGES["hostname"] = MAN_PAGES["hostnamectl"] = {
  name: "hostnamectl",
  section: 1,
  synopsis: "hostnamectl [OPTIONS...] COMMAND ...",
  description:
    "hostnamectl may be used to introspect and set the system hostname and related metadata.",
  options: [
    { flag: "status", description: "show current hostname settings (default)" },
    { flag: "set-hostname NAME", description: "set system hostname" },
    { flag: "--static, --transient, --pretty", description: "target specific hostname type" },
    { flag: "--help", description: "display this help and exit" },
  ],
  examples: [
    "hostname",
    "hostnamectl status",
    "hostnamectl set-hostname node1.example.com",
  ],
  seeAlso: ["hostname(1)", "systemd(1)"],
};

MAN_PAGES["echo"] = {
  name: "echo",
  section: 1,
  synopsis: "echo [SHORT-OPTION]... [STRING]...",
  description: "Echo the STRING(s) to standard output.",
  options: [
    { flag: "-n", description: "do not output the trailing newline" },
    { flag: "-e", description: "enable interpretation of backslash escapes" },
    { flag: "-E", description: "disable interpretation of backslash escapes (default)" },
    { flag: "--help", description: "display this help and exit" },
  ],
  examples: ["echo 'hello world'", "echo $PATH"],
  seeAlso: ["printf(1)"],
};

MAN_PAGES["wc"] = {
  name: "wc",
  section: 1,
  synopsis: "wc [OPTION]... [FILE]...",
  description:
    "Print newline, word, and byte counts for each FILE, and a total line if more than one FILE is specified. With no FILE, or when FILE is -, read standard input.",
  options: [
    { flag: "-l, --lines", description: "print the newline counts" },
    { flag: "-w, --words", description: "print the word counts" },
    { flag: "-c, --bytes", description: "print the byte counts" },
    { flag: "-m, --chars", description: "print the character counts" },
    { flag: "--help", description: "display this help and exit" },
  ],
  examples: ["wc -l /etc/passwd", "wc file.txt"],
  seeAlso: ["cat(1)"],
};

MAN_PAGES["diff"] = {
  name: "diff",
  section: 1,
  synopsis: "diff [OPTION]... FILES",
  description: "Compare FILES line by line.",
  options: [
    { flag: "-u, -U NUM, --unified[=NUM]", description: "output NUM (default 3) lines of unified context" },
    { flag: "-i, --ignore-case", description: "ignore case differences in file contents" },
    { flag: "-w, --ignore-all-space", description: "ignore all white space" },
    { flag: "-q, --brief", description: "report only when files differ" },
    { flag: "--help", description: "display this help and exit" },
  ],
  examples: ["diff -u file1.txt file2.txt", "diff -q dir1 dir2"],
  seeAlso: ["cmp(1)", "patch(1)"],
};

MAN_PAGES["sleep"] = {
  name: "sleep",
  section: 1,
  synopsis: "sleep NUMBER[SUFFIX]...",
  description:
    "Pause for NUMBER seconds. SUFFIX may be 's' for seconds (the default), 'm' for minutes, 'h' for hours or 'd' for days.",
  options: [
    { flag: "--help", description: "display this help and exit" },
    { flag: "--version", description: "output version information and exit" },
  ],
  examples: ["sleep 1", "sleep 5s"],
  seeAlso: ["usleep(1)"],
};

MAN_PAGES["awk"] = {
  name: "gawk",
  section: 1,
  synopsis: "gawk [POSIX or GNU style options] -f program-file [--] file ...\n  or:  gawk [POSIX or GNU style options] [--] 'program-text' file ...",
  description:
    "Gawk is the GNU Project's implementation of the AWK programming language. It conforms to the definition of the language in the POSIX 1003.1 Standard.",
  options: [
    { flag: "-F fs, --field-separator fs", description: "use fs for the input field separator (the value of the FS predefined variable)" },
    { flag: "-v var=val, --assign var=val", description: "assign the value val to the variable var before execution begins" },
    { flag: "--help", description: "display this help and exit" },
  ],
  examples: [
    "awk -F: '{print $1}' /etc/passwd",
    "awk '{print $NF}' logfile.log",
  ],
  seeAlso: ["sed(1)", "grep(1)"],
};

MAN_PAGES["sed"] = {
  name: "sed",
  section: 1,
  synopsis: "sed [OPTION]... {script-only-if-no-other-script} [input-file]...",
  description:
    "sed is a stream editor. A stream editor is used to perform basic text transformations on an input stream (a file or input from a pipeline).",
  options: [
    { flag: "-i[SUFFIX], --in-place[=SUFFIX]", description: "edit files in place (makes backup if SUFFIX supplied)" },
    { flag: "-e script, --expression=script", description: "add the script to the commands to be executed" },
    { flag: "-n, --quiet, --silent", description: "suppress automatic printing of pattern space" },
    { flag: "--help", description: "display this help and exit" },
  ],
  examples: [
    "sed -i 's/SELINUX=enforcing/SELINUX=permissive/' /etc/selinux/config",
    "sed '/^#/d' /etc/fstab",
  ],
  seeAlso: ["awk(1)", "grep(1)"],
};

MAN_PAGES["cut"] = {
  name: "cut",
  section: 1,
  synopsis: "cut OPTION... [FILE]...",
  description:
    "Print selected parts of lines from each FILE to standard output. With no FILE, or when FILE is -, read standard input.",
  options: [
    { flag: "-d, --delimiter=DELIM", description: "use DELIM instead of TAB for field delimiter" },
    { flag: "-f, --fields=LIST", description: "select only these fields; also print any line that contains no delimiter character, unless the -s option is specified" },
    { flag: "-c, --characters=LIST", description: "select only these characters" },
    { flag: "--help", description: "display this help and exit" },
  ],
  examples: [
    "cut -d: -f1 /etc/passwd",
    "cut -d' ' -f2,4 file.txt",
  ],
  seeAlso: ["awk(1)", "grep(1)"],
};

MAN_PAGES["sort"] = {
  name: "sort",
  section: 1,
  synopsis: "sort [OPTION]... [FILE]...",
  description:
    "Write sorted concatenation of all FILE(s) to standard output. With no FILE, or when FILE is -, read standard input.",
  options: [
    { flag: "-r, --reverse", description: "reverse the result of comparisons" },
    { flag: "-n, --numeric-sort", description: "compare according to string numerical value" },
    { flag: "-u, --unique", description: "with -c, check for strict ordering; without -c, output only the first of an equal run" },
    { flag: "-k, --key=KEYDEF", description: "sort via a key; KEYDEF gives location and type" },
    { flag: "-t, --field-separator=SEP", description: "use SEP instead of non-blank to blank transition" },
    { flag: "--help", description: "display this help and exit" },
  ],
  examples: [
    "sort /etc/passwd",
    "sort -t: -k3 -n /etc/passwd",
    "sort -u file.txt",
  ],
  seeAlso: ["uniq(1)"],
};

MAN_PAGES["uniq"] = {
  name: "uniq",
  section: 1,
  synopsis: "uniq [OPTION]... [INPUT [OUTPUT]]",
  description:
    "Filter adjacent matching lines from INPUT (or standard input), writing to OUTPUT (or standard output). Note: 'uniq' does not detect repeated lines unless they are adjacent.",
  options: [
    { flag: "-c, --count", description: "prefix lines by the number of occurrences" },
    { flag: "-d, --repeated", description: "only print duplicate lines, one for each group" },
    { flag: "-u, --unique", description: "only print unique lines" },
    { flag: "-i, --ignore-case", description: "ignore differences in case when comparing" },
    { flag: "--help", description: "display this help and exit" },
  ],
  examples: [
    "sort list.txt | uniq",
    "sort ips.log | uniq -c | sort -nr",
  ],
  seeAlso: ["sort(1)"],
};

MAN_PAGES["xargs"] = {
  name: "xargs",
  section: 1,
  synopsis: "xargs [options] [command [initial-arguments]]",
  description:
    "xargs reads items from the standard input, delimited by blanks (which can be protected with double or single quotes or a backslash) or newlines, and executes the command one or more times with any initial-arguments followed by items read from standard input.",
  options: [
    { flag: "-I replace-str", description: "replace occurrences of replace-str in the initial-arguments with names read from standard input" },
    { flag: "-n max-args", description: "use at most max-args arguments per command line" },
    { flag: "-0, --null", description: "input items are terminated by a null character instead of by whitespace" },
    { flag: "--help", description: "display this help and exit" },
  ],
  examples: [
    "find . -name '*.bak' | xargs rm",
    "cat hosts.txt | xargs -n 1 ping -c 1",
  ],
  seeAlso: ["find(1)"],
};

MAN_PAGES["tr"] = {
  name: "tr",
  section: 1,
  synopsis: "tr [OPTION]... SET1 [SET2]",
  description:
    "Translate, squeeze, and/or delete characters from standard input, writing to standard output.",
  options: [
    { flag: "-d, --delete", description: "delete characters in SET1, do not translate" },
    { flag: "-s, --squeeze-repeats", description: "replace each sequence of a repeated character that is listed in the last specified SET, with a single occurrence of that character" },
    { flag: "--help", description: "display this help and exit" },
  ],
  examples: [
    "cat file.txt | tr 'a-z' 'A-Z'",
    "cat file.txt | tr -d '\\r'",
  ],
  seeAlso: ["sed(1)"],
};

/**
 * Lookup a man page by command name
 */
export function getManPage(cmd: string): ManPage | null {
  const clean = cmd.trim().toLowerCase();
  return MAN_PAGES[clean] || null;
}

/**
 * Format an authentic Linux man page with standard indentation and sections
 */
export function formatManPage(man: ManPage): string {
  const nameUpper = man.name.toUpperCase();
  const headerLine = `${nameUpper}(${man.section})                   CentOS Stream System Reference Manual                   ${nameUpper}(${man.section})\n\n`;

  let out = headerLine;

  // NAME
  out += "NAME\n";
  out += `       ${man.name} - ${man.description.split(".")[0] || man.name}\n\n`;

  // SYNOPSIS
  out += "SYNOPSIS\n";
  const synLines = man.synopsis.split("\n");
  for (const line of synLines) {
    out += `       ${line}\n`;
  }
  out += "\n";

  // DESCRIPTION
  out += "DESCRIPTION\n";
  out += `       ${man.description}\n\n`;

  // OPTIONS
  if (man.options && man.options.length > 0) {
    out += "OPTIONS\n";
    for (const opt of man.options) {
      out += `       ${opt.flag}\n`;
      out += `              ${opt.description}\n\n`;
    }
  }

  // EXAMPLES
  if (man.examples && man.examples.length > 0) {
    out += "EXAMPLES\n";
    for (const eg of man.examples) {
      out += `       $ ${eg}\n`;
    }
    out += "\n";
  }

  // SEE ALSO
  if (man.seeAlso && man.seeAlso.length > 0) {
    out += "SEE ALSO\n";
    out += `       ${man.seeAlso.join(", ")}\n\n`;
  }

  // FOOTER
  out += `CentOS Stream 9 (x86_64)                 Linux Reference Manual                 ${nameUpper}(${man.section})\n`;

  return out;
}

/**
 * Format authentic GNU standard --help text
 */
export function formatHelp(cmd: string): string | null {
  const man = getManPage(cmd);
  if (!man) return null;

  if (man.helpText) return man.helpText;

  let out = `Usage: ${man.synopsis.split("\n")[0]}\n`;
  out += `${man.description}\n\n`;

  if (man.options && man.options.length > 0) {
    out += `Mandatory arguments to long options are mandatory for short options too.\n`;
    for (const opt of man.options) {
      const padding = " ".repeat(Math.max(2, 28 - opt.flag.length));
      out += `  ${opt.flag}${padding}${opt.description}\n`;
    }
    out += `\n`;
  }

  if (man.examples && man.examples.length > 0) {
    out += `Examples:\n`;
    for (const eg of man.examples) {
      out += `  ${eg}\n`;
    }
    out += `\n`;
  }

  out += `GNU coreutils & CentOS Stream 9 online help: <https://www.gnu.org/software/coreutils/>\n`;
  out += `Full documentation <https://www.gnu.org/software/coreutils/${man.name}> or available locally via: man ${man.name}\n`;

  return out;
}

/**
 * Authentic Linux error when man page is missing
 */
export function getUnknownManError(cmd: string): string {
  return `No manual entry for ${cmd}\nSee 'man 7 undocumented' for help when manual pages are not available.\n`;
}
