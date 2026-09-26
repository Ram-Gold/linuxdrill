import { useState } from "react";
import { Terminal as TerminalIcon, Cpu, Check, Copy } from "lucide-react";
import Terminal from "../components/Terminal";

export default function TerminalPlayground() {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const quickCommands = [
    { label: "Root shell", cmd: "su -" },
    { label: "View users", cmd: "cat /etc/passwd" },
    { label: "Nested directory", cmd: "mkdir -p /app/data" },
    { label: "Service state", cmd: "systemctl status sshd" },
    { label: "Firewall rules", cmd: "firewall-cmd --list-all" },
    { label: "Network interfaces", cmd: "ip a" },
    { label: "Disk & LVM layout", cmd: "lsblk" },
    { label: "Check answer syntax", cmd: "check" },
  ];

  const handleCopy = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 1500);
  };

  return (
    <div className="space-y-6 max-w-[1536px] mx-auto select-none">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-main)] font-sans flex items-center gap-2.5 tracking-tight">
            <span>Terminal Sandbox</span>
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-lg bg-[var(--surface-subtle)] text-[var(--accent-cyan)] border border-[var(--border-subtle)] font-semibold">
              CentOS 9 POSIX
            </span>
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1 font-sans">
            In-browser CentOS Linux shell environment powered by an in-memory Virtual File System. Freeform practice, experimentation, and command testing.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Terminal Container */}
        <div className="lg:col-span-8">
          <Terminal
            title="CentOS Stream 9 (Trainer Playground)"
            defaultHeight="640px"
          />
        </div>

        {/* Sidebar Cards */}
        <div className="lg:col-span-4 space-y-4 text-xs text-[var(--text-muted)]">
          {/* Quick Commands Card */}
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-base)] p-5 shadow-[var(--card-shadow)] space-y-3">
            <h3 className="font-semibold text-[var(--text-main)] font-sans text-xs flex items-center gap-2">
              <TerminalIcon className="w-3.5 h-3.5 text-[var(--accent-cyan)]" />
              <span>Quick Commands</span>
            </h3>
            <ul className="space-y-1.5 font-mono">
              {quickCommands.map(({ label, cmd }) => (
                <li
                  key={cmd}
                  onClick={() => handleCopy(cmd)}
                  className="flex items-center justify-between bg-[var(--surface-subtle)] hover:bg-[var(--surface-active)] p-2.5 rounded-xl border border-[var(--border-subtle)] cursor-pointer transition-colors apple-press group"
                  title="Click to copy command"
                >
                  <span className="text-[var(--text-muted)] group-hover:text-[var(--text-main)] transition-colors">{label}:</span>
                  <div className="flex items-center gap-1.5">
                    <code className="text-[var(--accent-cyan)] font-semibold">{cmd}</code>
                    {copiedCmd === cmd ? (
                      <Check className="w-3 h-3 text-[var(--accent-green)] shrink-0" />
                    ) : (
                      <Copy className="w-3 h-3 text-[var(--text-tertiary)] group-hover:text-[var(--text-main)] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Simulator Architecture Card */}
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-base)] p-5 shadow-[var(--card-shadow)] space-y-3">
            <h3 className="font-semibold text-[var(--text-main)] font-sans text-xs flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-[var(--accent-green)]" />
              <span>Simulator Architecture</span>
            </h3>
            <ul className="space-y-2 text-xs text-[var(--text-muted)] font-sans leading-relaxed">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[var(--accent-green)] shrink-0" />
                <span>Full POSIX directory tree with system users, permissions, and SGID</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[var(--accent-green)] shrink-0" />
                <span>Pipeline support (<code className="font-mono text-[var(--accent-cyan)]">| grep</code>) & redirections (<code className="font-mono text-[var(--accent-cyan)]">&gt;</code>, <code className="font-mono text-[var(--accent-cyan)]">&gt;&gt;</code>)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[var(--accent-green)] shrink-0" />
                <span>Tab auto-completion & shell history (<kbd className="font-mono text-[var(--text-secondary)] bg-[var(--surface-subtle)] px-1 py-0.5 rounded border border-[var(--border-subtle)]">↑/↓</kbd>)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[var(--accent-green)] shrink-0" />
                <span>100% Client-side sandbox with zero external network latency</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
