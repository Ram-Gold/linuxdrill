import { ShellContext } from "../src/lib/vfs/commands";
import { verifyProblem } from "../src/lib/verifyProblem";
import { problems } from "../src/lib/problems";

console.log("=================================================");
console.log("RUNNING SUITE: ALL 40 PROBLEMS ACCURACY AUDIT");
console.log("=================================================");

// Test 1: Blank shell false positives
console.log("\n--- TEST 1: Checking for false positives on a blank shell ---");
let blankFalsePositives = 0;
for (const p of problems) {
  const shell = new ShellContext();
  const res = verifyProblem(p, shell);
  if (res.passed) {
    console.error(`❌ FALSE POSITIVE on blank shell: ${p.id} (${p.title})`);
    blankFalsePositives++;
  }
}
if (blankFalsePositives === 0) {
  console.log("✅ Passed: 0/40 false positives on blank shell!");
}

// Test 2: Trivial commands false positives
console.log("\n--- TEST 2: Checking for false positives with unrelated commands (ls, pwd, whoami) ---");
let trivialFalsePositives = 0;
for (const p of problems) {
  const shell = new ShellContext();
  shell.execute("ls");
  shell.execute("pwd");
  shell.execute("whoami");
  const res = verifyProblem(p, shell);
  if (res.passed) {
    console.error(`❌ FALSE POSITIVE with trivial commands: ${p.id} (${p.title})`);
    trivialFalsePositives++;
  }
}
if (trivialFalsePositives === 0) {
  console.log("✅ Passed: 0/40 false positives with trivial commands!");
}

// Test 3: Official solutions accuracy
console.log("\n--- TEST 3: Executing official solution for all 40 challenges ---");
let failedCount = 0;
const failureDetails: { id: string; title: string; message: string; failedChecks: string[] }[] = [];

for (const p of problems) {
  const shell = new ShellContext();

  // Run setup if any
  if (p.setup) {
    const cleanSetup = p.setup.replace(/```[a-z]*\n/g, "").replace(/```/g, "");
    shell.execute(cleanSetup);
  }

  // Clean solution markdown and run
  const cleanSolution = p.solution.replace(/```[a-z]*\n/g, "").replace(/```/g, "");
  shell.execute(cleanSolution);

  const res = verifyProblem(p, shell);
  if (!res.passed) {
    failedCount++;
    failureDetails.push({
      id: p.id,
      title: p.title,
      message: res.message,
      failedChecks: res.checks.filter((c) => !c.passed).map((c) => c.name),
    });
  }
}

console.log(`\nResults: ${40 - failedCount}/40 passed`);
if (failedCount > 0) {
  console.error(`❌ ${failedCount} problems failed their solution verification!`);
  failureDetails.forEach((f) => {
    console.error(`\n- [${f.id}] ${f.title}`);
    console.error(`  Message: ${f.message}`);
    console.error(`  Failed checks:`, f.failedChecks);
  });
  process.exit(1);
} else {
  console.log("🎉 ALL 40 PROBLEMS PASSED WITH 100% ACCURACY!");
}
