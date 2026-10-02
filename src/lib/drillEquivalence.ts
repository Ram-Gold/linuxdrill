import { type DrillItem } from '../data/drillDecks';
import { ShellContext } from './vfs/commands';

/**
 * Normalizes a bash command line:
 * - Collapses consecutive spaces
 * - Trims leading and trailing whitespace
 */
export function normalizeCommandLine(cmd: string): string {
  return cmd.trim().replace(/\s+/g, ' ');
}

/**
 * Extract quote variations for a command (single quotes, double quotes, unquoted where safe).
 */
function getQuoteVariations(cmd: string): string[] {
  const variants = new Set<string>();
  variants.add(cmd);

  // If contains double quotes e.g. "alice:Pass@123", also add single quotes 'alice:Pass@123'
  if (cmd.includes('"')) {
    variants.add(cmd.replace(/"([^"]*)"/g, "'$1'"));
    // Unquoted if simple string without spaces or shell specials
    variants.add(cmd.replace(/"([a-zA-Z0-9_@.:-]+)"/g, '$1'));
  }
  // If contains single quotes, also add double quotes
  if (cmd.includes("'")) {
    variants.add(cmd.replace(/'([^']*)'/g, '"$1"'));
    variants.add(cmd.replace(/'([a-zA-Z0-9_@.:-]+)'/g, '$1'));
  }

  return Array.from(variants);
}

/**
 * Automatically derives equivalent command syntax variations for Linux CLI commands:
 * - Flag permutations (e.g. -m -s /bin/bash vs -s /bin/bash -m)
 * - Flag clustering (e.g. -a -G vs -aG)
 * - Equivalent tools (service vs systemctl, ip a vs ip addr show)
 * - Tar flag variations (-czvf vs -cvzf vs czvf)
 * - Octal permissions (755 vs 0755)
 */
function deriveAutomatedVariants(canonical: string): string[] {
  const derived = new Set<string>();
  const normalized = normalizeCommandLine(canonical);
  derived.add(normalized);

  // 1. useradd flag permutations
  if (normalized.startsWith('useradd ')) {
    // Omitting defaults on CentOS/our VFS (creates /home/<user> with /bin/bash)
    const userMatch = normalized.match(/useradd\s+(?:.*?\s+)?([a-zA-Z0-9_-]+)$/);
    if (userMatch) {
      const u = userMatch[1];
      derived.add(`useradd ${u}`);
      derived.add(`useradd -m ${u}`);
      derived.add(`useradd -s /bin/bash ${u}`);
      derived.add(`useradd -ms /bin/bash ${u}`);
      derived.add(`useradd -m -s /bin/bash ${u}`);
      derived.add(`useradd -s /bin/bash -m ${u}`);
    }
  }

  // 2. usermod flag permutations
  if (normalized.startsWith('usermod ')) {
    if (normalized.includes('-aG')) {
      derived.add(normalized.replace('-aG', '-a -G'));
      derived.add(normalized.replace('-aG', '-G -a'));
    } else if (normalized.includes('-a -G')) {
      derived.add(normalized.replace('-a -G', '-aG'));
    }
  }

  // 3. systemctl <-> service equivalents
  if (normalized.startsWith('systemctl ')) {
    const parts = normalized.split(' ');
    // systemctl <action> <service>
    if (parts.length === 3 && ['start', 'stop', 'restart', 'status', 'reload'].includes(parts[1])) {
      const action = parts[1];
      const svc = parts[2].replace(/\.service$/, '');
      derived.add(`service ${svc} ${action}`);
    }
    // systemctl enable --now <service> <-> systemctl enable <service> --now
    if (normalized.includes('--now')) {
      if (normalized.includes('enable --now')) {
        derived.add(normalized.replace('enable --now', 'enable') + ' --now');
      }
      const svcMatch = normalized.match(/systemctl\s+enable\s+(?:--now\s+)?([a-zA-Z0-9_-]+)/);
      if (svcMatch) {
        const s = svcMatch[1];
        derived.add(`systemctl start ${s} && systemctl enable ${s}`);
        derived.add(`systemctl enable ${s} && systemctl start ${s}`);
      }
    }
  } else if (normalized.startsWith('service ')) {
    const parts = normalized.split(' ');
    if (parts.length === 3) {
      const svc = parts[1];
      const action = parts[2];
      derived.add(`systemctl ${action} ${svc}`);
    }
  }

  // 4. ip address equivalents
  if (normalized.startsWith('ip ')) {
    const ipMatch = normalized.match(/^ip\s+(?:addr(?:ess)?|a)(?:\s+(?:show|s))?(?:\s+(.+))?$/);
    if (ipMatch) {
      const rest = ipMatch[1] ? ` ${ipMatch[1]}` : '';
      derived.add(`ip a${rest}`);
      derived.add(`ip addr${rest}`);
      derived.add(`ip addr show${rest}`);
      derived.add(`ip a show${rest}`);
      derived.add(`ip a s${rest}`);
      derived.add(`ip addr s${rest}`);
    }
  }

  // 5. chmod permissions (0755 vs 755, 0600 vs 600)
  if (normalized.startsWith('chmod ')) {
    const permMatch = normalized.match(/^chmod\s+([0-7]{3,4})\s+(.+)$/);
    if (permMatch) {
      const perm = permMatch[1];
      const target = permMatch[2];
      if (perm.length === 3) {
        derived.add(`chmod 0${perm} ${target}`);
      } else if (perm.length === 4 && perm.startsWith('0')) {
        derived.add(`chmod ${perm.slice(1)} ${target}`);
      }
    }
  }

  // 6. chown recursive (-R vs --recursive, user:group vs user.group)
  if (normalized.startsWith('chown ')) {
    if (normalized.includes(':')) {
      derived.add(normalized.replace(':', '.'));
    } else if (normalized.includes('.')) {
      derived.add(normalized.replace('.', ':'));
    }
  }

  // 7. tar flag variations (-czvf vs -cvzf vs czvf)
  if (normalized.startsWith('tar ')) {
    const tarMatch = normalized.match(/^tar\s+(-?[a-zA-Z]+)\s+(.+)$/);
    if (tarMatch) {
      const flags = tarMatch[1].replace(/^-/, '');
      const rest = tarMatch[2];
      // Generate with and without leading dash
      derived.add(`tar -${flags} ${rest}`);
      derived.add(`tar ${flags} ${rest}`);

      // Common create permutations
      if (flags.includes('c') && flags.includes('z') && flags.includes('f')) {
        derived.add(`tar -czf ${rest}`);
        derived.add(`tar czf ${rest}`);
        derived.add(`tar -czvf ${rest}`);
        derived.add(`tar -cvzf ${rest}`);
        derived.add(`tar -zcvf ${rest}`);
        derived.add(`tar czvf ${rest}`);
      }
      // Common extract permutations
      if (flags.includes('x') && flags.includes('z') && flags.includes('f')) {
        derived.add(`tar -xzf ${rest}`);
        derived.add(`tar xzf ${rest}`);
        derived.add(`tar -xzvf ${rest}`);
        derived.add(`tar -zxvf ${rest}`);
        derived.add(`tar xzvf ${rest}`);
      }
    }
  }

  return Array.from(derived);
}

/**
 * Returns all valid command string variations for a given drill item.
 * Preserves the canonical command as the first entry.
 */
export function getAllDrillVariants(drill: DrillItem): string[] {
  const result: string[] = [];
  const seen = new Set<string>();

  const addVariant = (v: string) => {
    const trimmed = normalizeCommandLine(v);
    if (trimmed && !seen.has(trimmed)) {
      seen.add(trimmed);
      result.push(trimmed);
    }
  };

  // 1. Primary canonical command
  addVariant(drill.command);

  // 2. Explicit accepted commands configured on the drill
  if (drill.acceptedCommands) {
    for (const alt of drill.acceptedCommands) {
      addVariant(alt);
    }
  }

  // 3. Automated derivatives (flag order, tool synonyms, defaults)
  const baseCommands = [...result];
  for (const cmd of baseCommands) {
    const derived = deriveAutomatedVariants(cmd);
    for (const d of derived) {
      addVariant(d);
    }
  }

  // 4. Quotation variations for all discovered variants
  const currentVariants = [...result];
  for (const cmd of currentVariants) {
    const quoteVariants = getQuoteVariations(cmd);
    for (const q of quoteVariants) {
      addVariant(q);
    }
  }

  return result;
}

/**
 * Semantic verification of a command execution against the virtual Linux VFS and state.
 */
export function evaluateDrillCommand(
  drill: DrillItem,
  rawInput: string,
  shellContext?: ShellContext
): { passed: boolean; message?: string; stdout?: string; stderr?: string } {
  const trimmed = normalizeCommandLine(rawInput);
  if (!trimmed) {
    return { passed: false, message: 'Please enter a command.' };
  }

  const allVariants = getAllDrillVariants(drill);

  // 1. Direct syntax / variant match
  const matchesVariant = allVariants.some(
    (v) => v.toLowerCase() === trimmed.toLowerCase()
  );
  if (matchesVariant) {
    return { passed: true, message: 'Correct command syntax!' };
  }

  // 2. If a ShellContext is supplied, execute and verify state
  if (shellContext) {
    // Clone or use isolated shell state
    const out = shellContext.execute(trimmed);

    // If command had syntax/runtime errors and returned stderr with exit code != 0
    if (out.exitCode !== 0 && out.stderr) {
      return {
        passed: false,
        message: out.stderr.trim(),
        stderr: out.stderr,
      };
    }

    // Check domain-specific target conditions
    const vfs = shellContext.vfs;

    // A. User domain verification
    if (drill.domain === 'USER') {
      const passwd = vfs.readFile('/etc/passwd').content || '';
      const group = vfs.readFile('/etc/group').content || '';

      if (drill.id === 'DRILL-USER-01') {
        const hasAlice = passwd.includes('alice:') && passwd.includes('/bin/bash');
        const hasHome = Boolean(vfs.getNode('/home/alice'));
        if (hasAlice && hasHome) {
          return { passed: true, message: 'User alice created with bash shell and home directory!' };
        }
      }

      if (drill.id === 'DRILL-USER-02') {
        if (trimmed.includes('chpasswd') || trimmed.includes('passwd')) {
          return { passed: true, message: 'Password updated for user alice!' };
        }
      }

      if (drill.id === 'DRILL-USER-03') {
        if (group.includes('developers:')) {
          return { passed: true, message: 'Group developers created successfully!' };
        }
      }

      if (drill.id === 'DRILL-USER-04') {
        const inDevelopers = group.includes('developers') && group.includes('alice');
        if (inDevelopers) {
          return { passed: true, message: 'User alice added to group developers!' };
        }
      }

      if (drill.id === 'DRILL-USER-05') {
        if (passwd.includes('bob') && passwd.includes('2500')) {
          return { passed: true, message: 'User bob created with UID 2500!' };
        }
      }
    }

    // B. Basic / File system domain verification
    if (drill.domain === 'BASIC' || drill.domain === 'FS') {
      if (drill.id === 'DRILL-BASIC-01') {
        const d1 = Boolean(vfs.getNode('/home/student/lab/docs'));
        const d2 = Boolean(vfs.getNode('/home/student/lab/logs'));
        const d3 = Boolean(vfs.getNode('/home/student/lab/scripts'));
        if (d1 && d2 && d3) {
          return { passed: true, message: 'Directory tree created successfully!' };
        }
      }
    }

    // C. Services verification
    if (drill.domain === 'SVC') {
      if (trimmed.includes('httpd') && (trimmed.includes('start') || trimmed.includes('enable'))) {
        const state = shellContext.servicesState.get('httpd');
        if (state && (state.active || state.enabled)) {
          return { passed: true, message: 'httpd service configured!' };
        }
      }
    }

    // If stdout contains expected string or command succeeded without errors and matches intent
    if (out.exitCode === 0) {
      // Check if command tokens match core intent
      const primaryTokens = drill.command.split(' ').filter((t) => !t.startsWith('-'));
      const inputTokens = trimmed.split(' ');
      const mainBinary = primaryTokens[0];
      if (inputTokens[0] === mainBinary || (mainBinary === 'systemctl' && inputTokens[0] === 'service')) {
        return { passed: true, stdout: out.stdout };
      }
    }

    return {
      passed: false,
      message: out.stderr || 'Command executed, but requirements for this drill were not satisfied.',
      stdout: out.stdout,
      stderr: out.stderr,
    };
  }

  return {
    passed: false,
    message: 'Command does not match accepted solutions. Try an alternative syntax or check hints.',
  };
}
