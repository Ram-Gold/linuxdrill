import { DRILL_DECKS } from '../src/data/drillDecks';
import { getAllDrillVariants, evaluateDrillCommand } from '../src/lib/drillEquivalence';
import { ShellContext } from '../src/lib/vfs/commands';

console.log('=================================================');
console.log('TEST SUITE: DRILL FREEDOM & COMMAND EQUIVALENCE');
console.log('=================================================');

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`❌ [FAIL] ${testName}${detail ? ` - ${detail}` : ''}`);
    failedTests++;
  }
}

// 1. DRILL-USER-01 Tests (The User's Exact Prompt Example)
const userDeck = DRILL_DECKS.find((d) => d.id === 'USER')!;
const drillUser01 = userDeck.items.find((i) => i.id === 'DRILL-USER-01')!;

console.log('\n--- 1. Testing DRILL-USER-01 Alternative Variants ---');
const variantsUser01 = getAllDrillVariants(drillUser01);

assert(
  variantsUser01.includes('useradd alice'),
  'DRILL-USER-01 includes omitted default "useradd alice"'
);
assert(
  variantsUser01.includes('useradd -s /bin/bash -m alice'),
  'DRILL-USER-01 includes flag permutation "useradd -s /bin/bash -m alice"'
);
assert(
  variantsUser01.includes('useradd -m alice'),
  'DRILL-USER-01 includes "useradd -m alice"'
);

console.log('\n--- 2. Testing DRILL-USER-01 Semantic Evaluation ---');
// User's exact alternative command: useradd alice && passwd Pass@123
const shell1 = new ShellContext();
const evalResultChained = evaluateDrillCommand(drillUser01, 'useradd alice && passwd Pass@123', shell1);
assert(
  evalResultChained.passed,
  'Semantic evaluation passes "useradd alice && passwd Pass@123"',
  evalResultChained.message
);

// Standard canonical command
const shell2 = new ShellContext();
const evalResultCanonical = evaluateDrillCommand(drillUser01, 'useradd -m -s /bin/bash alice', shell2);
assert(
  evalResultCanonical.passed,
  'Semantic evaluation passes "useradd -m -s /bin/bash alice"',
  evalResultCanonical.message
);

// Minimal command on CentOS (useradd alice)
const shell3 = new ShellContext();
const evalResultMinimal = evaluateDrillCommand(drillUser01, 'useradd alice', shell3);
assert(
  evalResultMinimal.passed,
  'Semantic evaluation passes "useradd alice"',
  evalResultMinimal.message
);

// Negative test: unrelated command fails
const shellBad = new ShellContext();
const evalResultBad = evaluateDrillCommand(drillUser01, 'mkdir /home/alice', shellBad);
assert(
  !evalResultBad.passed,
  'Semantic evaluation correctly rejects invalid command "mkdir /home/alice"'
);

// 2. DRILL-USER-02 Tests (Quotation and Password Alternatives)
console.log('\n--- 3. Testing DRILL-USER-02 Alternatives ---');
const drillUser02 = userDeck.items.find((i) => i.id === 'DRILL-USER-02')!;
const variantsUser02 = getAllDrillVariants(drillUser02);

assert(
  variantsUser02.includes("echo 'alice:Pass@123' | chpasswd"),
  'DRILL-USER-02 includes single-quoted version'
);
assert(
  variantsUser02.includes('echo alice:Pass@123 | chpasswd'),
  'DRILL-USER-02 includes unquoted version'
);

const shell4 = new ShellContext();
const evalPasswd = evaluateDrillCommand(drillUser02, 'echo "Pass@123" | passwd --stdin alice', shell4);
assert(
  evalPasswd.passed,
  'Semantic evaluation passes "echo \\"Pass@123\\" | passwd --stdin alice"',
  evalPasswd.message
);

// 3. Automated Flag Permutations & Tool Synonyms Across Domains
console.log('\n--- 4. Testing Automated Equivalence Across Other Commands ---');
const drillUser04 = userDeck.items.find((i) => i.id === 'DRILL-USER-04')!;
const variantsUser04 = getAllDrillVariants(drillUser04);
assert(
  variantsUser04.includes('usermod -a -G developers alice'),
  'usermod -aG splits into -a -G'
);

const svcDeck = DRILL_DECKS.find((d) => d.id === 'SVC')!;
const drillSvc04 = svcDeck.items.find((i) => i.id === 'DRILL-SVC-04')!;
const variantsSvc04 = getAllDrillVariants(drillSvc04);
assert(
  variantsSvc04.includes('service sshd restart'),
  'systemctl restart sshd produces "service sshd restart"'
);

const netDeck = DRILL_DECKS.find((d) => d.id === 'NET')!;
const drillNet06 = netDeck.items.find((i) => i.id === 'DRILL-NET-06')!;
const variantsNet06 = getAllDrillVariants(drillNet06);
assert(
  variantsNet06.includes('ip a show eth0') && variantsNet06.includes('ip addr eth0'),
  'ip addr show eth0 includes "ip a show eth0" and "ip addr eth0"'
);

console.log('\n=================================================');
console.log(`TOTAL: ${passedTests} passed, ${failedTests} failed.`);
console.log('=================================================');

if (failedTests > 0) {
  process.exit(1);
}
