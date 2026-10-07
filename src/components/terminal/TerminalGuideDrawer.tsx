import { useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  BookOpen,
  Terminal as TerminalIcon,
  Cpu,
  Check,
  Copy,
  RotateCcw,
  Sparkles,
  Command,
  FileCode,
  Shield,
  HardDrive,
  Network,
  Play,
} from 'lucide-react';

interface TerminalGuideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onRunCommand?: (cmd: string) => void;
  onResetVm?: () => void;
  onCopyOutput?: () => void;
}

export default function TerminalGuideDrawer({
  isOpen: _isOpen,
  onClose,
  onRunCommand,
  onResetVm,
  onCopyOutput,
}: TerminalGuideDrawerProps) {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'quick' | 'architecture' | 'shortcuts' | 'cheatsheet'>('quick');

  const quickCommands = [
    { label: 'Root shell', cmd: 'su -', desc: 'Switch to root superuser' },
    { label: 'View users', cmd: 'cat /etc/passwd', desc: 'Inspect system user database' },
    { label: 'Nested directory', cmd: 'mkdir -p /app/data', desc: 'Create parent folders recursively' },
    { label: 'Service state', cmd: 'systemctl status sshd', desc: 'Check systemd daemon status' },
    { label: 'Firewall rules', cmd: 'firewall-cmd --list-all', desc: 'Inspect active zone rules' },
    { label: 'Network interfaces', cmd: 'ip a', desc: 'Display IP addresses & link states' },
    { label: 'Disk & LVM layout', cmd: 'lsblk', desc: 'List block storage devices & mounts' },
    { label: 'Check answer syntax', cmd: 'check', desc: 'Verify challenge criteria' },
  ];

  const adminCheatSheet = [
    {
      category: 'Files & Permissions',
      icon: <FileCode className="w-3.5 h-3.5 text-[var(--accent-primary-soft)]" />,
      items: [
        { cmd: 'chmod 755 /app', desc: 'Set rwxr-xr-x octal permissions' },
        { cmd: 'chmod g+s /data', desc: 'Set SGID for group directory inheritance' },
        { cmd: 'chown student:wheel /app', desc: 'Change file owner & group' },
        { cmd: 'ls -la /etc', desc: 'List files including hidden with perms' },
      ],
    },
    {
      category: 'System & Services',
      icon: <Shield className="w-3.5 h-3.5 text-[var(--accent-green)]" />,
      items: [
        { cmd: 'systemctl start nginx', desc: 'Start a system service unit' },
        { cmd: 'systemctl enable --now sshd', desc: 'Enable & start immediately' },
        { cmd: 'journalctl -u sshd -n 20', desc: 'View recent systemd service logs' },
        { cmd: 'ps aux | grep root', desc: 'Inspect active processes with pipe' },
      ],
    },
    {
      category: 'Storage & Disks',
      icon: <HardDrive className="w-3.5 h-3.5 text-[var(--accent-amber)]" />,
      items: [
        { cmd: 'df -h', desc: 'Disk free space in human units' },
        { cmd: 'pvcreate /dev/sdb', desc: 'Initialize LVM physical volume' },
        { cmd: 'mount -a', desc: 'Mount all filesystems from /etc/fstab' },
      ],
    },
    {
      category: 'Networking & Firewall',
      icon: <Network className="w-3.5 h-3.5 text-[var(--accent-blue)]" />,
      items: [
        { cmd: 'firewall-cmd --add-port=80/tcp', desc: 'Open port 80 in active zone' },
        { cmd: 'ping -c 3 8.8.8.8', desc: 'Test ICMP network reachability' },
        { cmd: 'ss -tulpn', desc: 'List listening sockets and ports' },
      ],
    },
  ];

  const handleCopy = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 1500);
  };

  const handleRun = (cmd: string) => {
    if (onRunCommand) {
      onRunCommand(cmd);
    } else {
      handleCopy(cmd);
    }
  };

  return (
    <motion.aside
      key="terminal-guide-drawer"
      initial={{ x: '100%', opacity: 0.2 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.24 }}
      className="absolute inset-y-0 right-0 z-30 w-full sm:w-[420px] max-w-full bg-[var(--surface-base)] border-l border-slate-200 dark:border-white/10 shadow-2xl shadow-black/60 flex flex-col overflow-hidden text-[var(--text-main)] select-none"
      role="dialog"
      aria-label="Terminal Guide"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50/90 dark:bg-[var(--surface-subtle)] shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-[var(--accent-primary-bg)] text-purple-700 dark:text-[var(--accent-primary-soft)]">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-[var(--text-main)] flex items-center gap-2">
              <span>Terminal Guide</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white dark:bg-[var(--surface-base)] text-purple-700 dark:text-[var(--accent-primary-soft)] border border-slate-200 dark:border-white/5 font-semibold">
                CentOS 9
              </span>
            </h2>
            <p className="text-[11px] text-slate-600 dark:text-[var(--text-muted)] font-mono">
              In-browser POSIX sandbox reference
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 dark:text-[var(--text-tertiary)] dark:hover:text-[var(--text-main)] dark:hover:bg-[var(--surface-base)] transition-colors cursor-pointer"
          title="Close guide (Esc)"
          aria-label="Close guide"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Segmented Tab Navigation */}
      <div className="px-4 pt-3 pb-2 bg-slate-50/50 dark:bg-[var(--surface-subtle)]/50 border-b border-slate-200/80 dark:border-white/5 shrink-0">
        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-200/70 dark:bg-[var(--surface-base)] rounded-xl border border-slate-300/60 dark:border-white/5 text-[11px] font-mono font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('quick')}
            className={`py-1.5 rounded-lg transition-colors cursor-pointer text-center ${
              activeTab === 'quick'
                ? 'bg-white text-slate-900 font-semibold shadow-xs dark:bg-[var(--surface-active)] dark:text-[var(--text-main)]'
                : 'text-slate-600 hover:text-slate-900 dark:text-[var(--text-muted)] dark:hover:text-[var(--text-main)]'
            }`}
          >
            Quick
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('shortcuts')}
            className={`py-1.5 rounded-lg transition-colors cursor-pointer text-center ${
              activeTab === 'shortcuts'
                ? 'bg-white text-slate-900 font-semibold shadow-xs dark:bg-[var(--surface-active)] dark:text-[var(--text-main)]'
                : 'text-slate-600 hover:text-slate-900 dark:text-[var(--text-muted)] dark:hover:text-[var(--text-main)]'
            }`}
          >
            Controls
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('architecture')}
            className={`py-1.5 rounded-lg transition-colors cursor-pointer text-center ${
              activeTab === 'architecture'
                ? 'bg-white text-slate-900 font-semibold shadow-xs dark:bg-[var(--surface-active)] dark:text-[var(--text-main)]'
                : 'text-slate-600 hover:text-slate-900 dark:text-[var(--text-muted)] dark:hover:text-[var(--text-main)]'
            }`}
          >
            VFS Engine
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cheatsheet')}
            className={`py-1.5 rounded-lg transition-colors cursor-pointer text-center ${
              activeTab === 'cheatsheet'
                ? 'bg-white text-slate-900 font-semibold shadow-xs dark:bg-[var(--surface-active)] dark:text-[var(--text-main)]'
                : 'text-slate-600 hover:text-slate-900 dark:text-[var(--text-muted)] dark:hover:text-[var(--text-main)]'
            }`}
          >
            Cheats
          </button>
        </div>
      </div>

      {/* Body Viewport */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-mono">
        {/* TAB 1: Quick Commands */}
        {activeTab === 'quick' && (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-purple-50/70 dark:bg-[var(--surface-subtle)] border border-purple-200/80 dark:border-white/5 text-[11px] text-purple-950 dark:text-[var(--text-muted)] flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-[var(--accent-primary-soft)] shrink-0 mt-0.5" />
              <span>
                Click any command to execute it directly in the terminal, or click the copy icon to copy to clipboard.
              </span>
            </div>

            <div className="space-y-2">
              {quickCommands.map(({ label, cmd, desc }) => (
                <div
                  key={cmd}
                  className="p-2.5 rounded-xl bg-slate-100/90 hover:bg-slate-200/80 dark:bg-[var(--surface-subtle)] dark:hover:bg-[var(--surface-active)] transition-all border border-slate-200/90 dark:border-white/5 group shadow-2xs dark:shadow-none"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[11px] font-semibold text-slate-900 dark:text-[var(--text-main)]">{label}</span>
                    <div className="flex items-center gap-1">
                      {onRunCommand && (
                        <button
                          type="button"
                          onClick={() => handleRun(cmd)}
                          className="px-2 py-0.5 rounded-md bg-purple-100 hover:bg-purple-600 dark:bg-[var(--accent-primary-bg)] dark:hover:bg-[var(--accent-primary)] text-purple-700 hover:text-white dark:text-[var(--accent-primary-soft)] dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-semibold"
                          title="Run in terminal"
                        >
                          <Play className="w-2.5 h-2.5" />
                          <span>Run</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleCopy(cmd)}
                        className="p-1 rounded-md hover:bg-slate-300/60 dark:hover:bg-white/10 text-slate-500 hover:text-slate-900 dark:text-[var(--text-tertiary)] dark:hover:text-[var(--text-main)] transition-colors cursor-pointer"
                        title="Copy command"
                      >
                        {copiedCmd === cmd ? (
                          <Check className="w-3.5 h-3.5 text-[var(--accent-green)]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <code className="block text-[11px] text-purple-700 dark:text-[var(--accent-primary-soft)] font-bold bg-white dark:bg-[var(--surface-base)] px-2 py-1 rounded-lg border border-slate-200/80 dark:border-white/5 overflow-x-auto">
                    {cmd}
                  </code>
                  <p className="text-[10px] text-slate-600 dark:text-[var(--text-tertiary)] mt-1">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: Terminal Controls & Shortcuts */}
        {activeTab === 'shortcuts' && (
          <div className="space-y-3.5">
            {/* Action Bar from Terminal */}
            <div className="p-3.5 rounded-xl bg-slate-100/90 dark:bg-[var(--surface-subtle)] border border-slate-200/90 dark:border-white/5 space-y-2.5 shadow-2xs dark:shadow-none">
              <h4 className="text-xs font-semibold text-slate-900 dark:text-[var(--text-main)] flex items-center gap-2">
                <Command className="w-3.5 h-3.5 text-purple-600 dark:text-[var(--accent-primary-soft)]" />
                <span>Quick Actions</span>
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {onResetVm && (
                  <button
                    type="button"
                    onClick={onResetVm}
                    className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 hover:text-slate-950 dark:bg-[var(--surface-base)] dark:hover:bg-[var(--surface-active)] dark:text-[var(--text-muted)] dark:hover:text-[var(--text-main)] transition-colors cursor-pointer border border-slate-200 dark:border-white/5 shadow-2xs dark:shadow-none font-medium"
                  >
                    <RotateCcw className="w-3 h-3 text-[var(--accent-red)]" />
                    <span>Reset VM</span>
                  </button>
                )}
                {onCopyOutput && (
                  <button
                    type="button"
                    onClick={onCopyOutput}
                    className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 hover:text-slate-950 dark:bg-[var(--surface-base)] dark:hover:bg-[var(--surface-active)] dark:text-[var(--text-muted)] dark:hover:text-[var(--text-main)] transition-colors cursor-pointer border border-slate-200 dark:border-white/5 shadow-2xs dark:shadow-none font-medium"
                  >
                    <Copy className="w-3 h-3 text-[var(--accent-green)]" />
                    <span>Copy Output</span>
                  </button>
                )}
              </div>
            </div>

            {/* Keyboard Shortcuts List */}
            <div className="space-y-1.5">
              <span className="text-[11px] uppercase tracking-wider text-slate-600 dark:text-[var(--text-tertiary)] font-semibold px-0.5">
                Terminal Keybindings
              </span>

              <div className="divide-y divide-slate-200/90 dark:divide-white/5 rounded-xl bg-slate-100/90 dark:bg-[var(--surface-subtle)] border border-slate-200/90 dark:border-white/5 overflow-hidden shadow-2xs dark:shadow-none">
                <div className="flex items-center justify-between p-2.5">
                  <span className="text-slate-700 dark:text-[var(--text-muted)] font-medium">Tab Autocomplete</span>
                  <kbd className="px-2 py-0.5 rounded bg-white text-slate-900 border border-slate-300 shadow-2xs dark:bg-[var(--surface-base)] dark:text-[var(--text-main)] dark:border-white/10 font-bold">
                    Tab
                  </kbd>
                </div>
                <div className="flex items-center justify-between p-2.5">
                  <span className="text-slate-700 dark:text-[var(--text-muted)] font-medium">Command History</span>
                  <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-white text-slate-900 border border-slate-300 shadow-2xs dark:bg-[var(--surface-base)] dark:text-[var(--text-main)] dark:border-white/10 font-bold">
                      ↑
                    </kbd>
                    <kbd className="px-1.5 py-0.5 rounded bg-white text-slate-900 border border-slate-300 shadow-2xs dark:bg-[var(--surface-base)] dark:text-[var(--text-main)] dark:border-white/10 font-bold">
                      ↓
                    </kbd>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2.5">
                  <span className="text-slate-700 dark:text-[var(--text-muted)] font-medium">Clear Screen</span>
                  <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-white text-slate-900 border border-slate-300 shadow-2xs dark:bg-[var(--surface-base)] dark:text-[var(--text-main)] dark:border-white/10 font-bold">
                      Ctrl + L
                    </kbd>
                    <span className="text-slate-500 dark:text-[var(--text-tertiary)] text-[10px]">or clear</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2.5">
                  <span className="text-slate-700 dark:text-[var(--text-muted)] font-medium">Cancel Line</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-white text-slate-900 border border-slate-300 shadow-2xs dark:bg-[var(--surface-base)] dark:text-[var(--text-main)] dark:border-white/10 font-bold">
                    Ctrl + C
                  </kbd>
                </div>
                <div className="flex items-center justify-between p-2.5">
                  <span className="text-slate-700 dark:text-[var(--text-muted)] font-medium">Interactive Manuals</span>
                  <span className="text-purple-700 dark:text-[var(--accent-primary-soft)] font-bold">man &lt;cmd&gt;</span>
                </div>
                <div className="flex items-center justify-between p-2.5">
                  <span className="text-slate-700 dark:text-[var(--text-muted)] font-medium">Pager Search / Quit</span>
                  <div className="flex items-center gap-1.5">
                    <kbd className="px-1 py-0.5 rounded bg-white text-slate-900 border border-slate-300 shadow-2xs dark:bg-[var(--surface-base)] dark:text-[var(--text-main)] dark:border-white/10 font-bold">
                      /
                    </kbd>
                    <span className="text-slate-500 dark:text-[var(--text-tertiary)]">search</span>
                    <kbd className="px-1 py-0.5 rounded bg-white text-slate-900 border border-slate-300 shadow-2xs dark:bg-[var(--surface-base)] dark:text-[var(--text-main)] dark:border-white/10 font-bold">
                      q
                    </kbd>
                    <span className="text-slate-500 dark:text-[var(--text-tertiary)]">quit</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Simulator Architecture */}
        {activeTab === 'architecture' && (
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-100/90 dark:bg-[var(--surface-subtle)] border border-slate-200/90 dark:border-white/5 space-y-2 shadow-2xs dark:shadow-none">
              <h3 className="font-semibold text-slate-900 dark:text-[var(--text-main)] text-xs flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-[var(--accent-green)]" />
                <span>Virtual Linux Engine</span>
              </h3>
              <p className="text-[11px] text-slate-700 dark:text-[var(--text-muted)] leading-relaxed">
                Bashist executes an in-memory Virtual File System (VFS) written in TypeScript that models CentOS Stream 9 kernel semantics directly in your browser.
              </p>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-700 dark:text-[var(--text-muted)] leading-relaxed">
              <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-100/90 dark:bg-[var(--surface-subtle)] border border-slate-200/90 dark:border-white/5 shadow-2xs dark:shadow-none">
                <Check className="w-3.5 h-3.5 text-[var(--accent-green)] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-[var(--text-main)] block text-[11px]">Hierarchical POSIX VFS</strong>
                  <span>Supports users (root, student, wheel, nginx), Unix octal & symbolic permissions, and SGID bit inheritance.</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-100/90 dark:bg-[var(--surface-subtle)] border border-slate-200/90 dark:border-white/5 shadow-2xs dark:shadow-none">
                <Check className="w-3.5 h-3.5 text-[var(--accent-green)] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-[var(--text-main)] block text-[11px]">Shell Pipelines & Redirection</strong>
                  <span>Full stream piping with <code className="text-purple-700 dark:text-[var(--accent-primary-soft)] font-bold">| grep</code>, <code className="text-purple-700 dark:text-[var(--accent-primary-soft)] font-bold">| sort</code>, and write redirects (<code className="text-purple-700 dark:text-[var(--accent-primary-soft)] font-bold">&gt;</code>, <code className="text-purple-700 dark:text-[var(--accent-primary-soft)] font-bold">&gt;&gt;</code>).</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-100/90 dark:bg-[var(--surface-subtle)] border border-slate-200/90 dark:border-white/5 shadow-2xs dark:shadow-none">
                <Check className="w-3.5 h-3.5 text-[var(--accent-green)] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-[var(--text-main)] block text-[11px]">Systemd & Daemon Emulation</strong>
                  <span>Emulated service manager with unit status verification, start/stop transitions, and journal logging.</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-100/90 dark:bg-[var(--surface-subtle)] border border-slate-200/90 dark:border-white/5 shadow-2xs dark:shadow-none">
                <Check className="w-3.5 h-3.5 text-[var(--accent-green)] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-[var(--text-main)] block text-[11px]">100% Client-Side Sandbox</strong>
                  <span>Zero network roundtrips, isolated memory state, and instant reset back to clean state.</span>
                </div>
              </li>
            </ul>
          </div>
        )}

        {/* TAB 4: Admin Cheatsheet */}
        {activeTab === 'cheatsheet' && (
          <div className="space-y-3.5">
            {adminCheatSheet.map((sec) => (
              <div key={sec.category} className="space-y-1.5">
                <div className="flex items-center gap-1.5 px-0.5">
                  {sec.icon}
                  <span className="text-[11px] font-semibold text-slate-900 dark:text-[var(--text-main)]">{sec.category}</span>
                </div>
                <div className="space-y-1.5">
                  {sec.items.map((item) => (
                    <div
                      key={item.cmd}
                      onClick={() => handleCopy(item.cmd)}
                      className="p-2 rounded-xl bg-slate-100/90 hover:bg-slate-200/80 dark:bg-[var(--surface-subtle)] dark:hover:bg-[var(--surface-active)] border border-slate-200/90 dark:border-white/5 cursor-pointer transition-colors group flex items-center justify-between gap-2 shadow-2xs dark:shadow-none"
                      title="Click to copy"
                    >
                      <div className="min-w-0">
                        <code className="text-[11px] text-purple-700 group-hover:text-purple-900 dark:text-[var(--accent-primary-soft)] dark:group-hover:text-white transition-colors font-bold">
                          {item.cmd}
                        </code>
                        <span className="block text-[10px] text-slate-600 dark:text-[var(--text-tertiary)] truncate">
                          {item.desc}
                        </span>
                      </div>
                      <Copy className="w-3 h-3 text-slate-400 group-hover:text-slate-800 dark:text-[var(--text-tertiary)] dark:group-hover:text-[var(--text-main)] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-5 py-3 border-t border-slate-200 dark:border-white/10 bg-slate-50/90 dark:bg-[var(--surface-subtle)] flex items-center justify-between text-[11px] text-slate-600 dark:text-[var(--text-tertiary)] font-mono shrink-0">
        <span className="flex items-center gap-1.5 font-medium">
          <TerminalIcon className="w-3 h-3 text-[var(--accent-green)]" />
          <span>CentOS Stream 9 x86_64</span>
        </span>
        <span className="font-semibold">Esc: Close</span>
      </div>
    </motion.aside>
  );
}
