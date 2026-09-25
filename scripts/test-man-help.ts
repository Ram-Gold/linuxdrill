import { ShellContext } from "../src/lib/vfs/commands";
import { MAN_PAGES } from "../src/lib/vfs/manpages";

console.log("=================================================");
console.log("RUNNING SUITE: MAN & HELP SYSTEM TEST");
console.log("=================================================\n");

const shell = new ShellContext();
let passed = 0;
let total = 0;

function assert(condition: boolean, msg: string) {
  total++;
  if (condition) {
    passed++;
    console.log(`✅ PASS: ${msg}`);
  } else {
    console.error(`❌ FAIL: ${msg}`);
    process.exitCode = 1;
  }
}

// 1. Test database size
const commandNames = Object.keys(MAN_PAGES);
assert(commandNames.length >= 40, `Registry contains ${commandNames.length} commands (expected >= 40)`);

// 2. Test man command execution for core commands
const sampleCommands = [
  "ls", "cd", "pwd", "mkdir", "rm", "cp", "mv", "chmod", "chown",
  "useradd", "usermod", "passwd", "systemctl", "firewall-cmd",
  "ip", "nmcli", "tar", "find", "grep", "sed", "awk", "pvcreate",
  "vgcreate", "lvcreate", "lvextend", "mkfs.xfs", "mount", "df", "free"
];

for (const cmd of sampleCommands) {
  const res = shell.execute(`man ${cmd}`);
  assert(
    res.exitCode === 0 && res.pager !== undefined && res.pager.title.includes(cmd),
    `man ${cmd} triggers interactive pager with section title: ${res.pager?.title}`
  );
  assert(
    res.pager?.content.includes("NAME") &&
      res.pager?.content.includes("SYNOPSIS") &&
      res.pager?.content.includes("DESCRIPTION") &&
      res.pager?.content.includes("OPTIONS"),
    `man ${cmd} contains authentic standard sections (NAME, SYNOPSIS, DESCRIPTION, OPTIONS)`
  );
}

// 3. Test universal --help
for (const cmd of sampleCommands) {
  const res = shell.execute(`${cmd} --help`);
  assert(
    res.exitCode === 0 && res.stdout.includes("Usage:"),
    `${cmd} --help returns standard GNU usage text with exitCode 0`
  );
}

// 4. Test man error on nonexistent command
const unknownRes = shell.execute("man fakecommand123");
assert(
  unknownRes.exitCode === 16 && unknownRes.stderr.includes("No manual entry for fakecommand123"),
  `man fakecommand123 returns authentic Linux error and exit code 16`
);

// 5. Test man with no arguments
const emptyManRes = shell.execute("man");
assert(
  emptyManRes.exitCode === 1 && emptyManRes.stderr.includes("What manual page do you want?"),
  `man with no args returns authentic prompt 'What manual page do you want?'`
);

// 6. Test man apropos (-k)
const aproposRes = shell.execute("man -k firewall");
assert(
  aproposRes.exitCode === 0 && aproposRes.stdout.includes("firewall-cmd"),
  `man -k firewall finds matching commands`
);

// 7. Test standalone less
shell.execute("echo 'Line 1 content' > /tmp/test_pager.txt");
const lessRes = shell.execute("less /tmp/test_pager.txt");
assert(
  lessRes.exitCode === 0 && lessRes.pager !== undefined && lessRes.pager.content.includes("Line 1 content"),
  `less /tmp/test_pager.txt opens file in interactive pager`
);

console.log(`\nResults: ${passed}/${total} assertions passed!`);
if (passed === total) {
  console.log("🎉 ALL MAN & HELP VERIFICATIONS SUCCEEDED!");
} else {
  console.error("Some tests failed.");
}
