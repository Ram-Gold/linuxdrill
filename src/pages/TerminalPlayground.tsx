import { Terminal as TerminalIcon, Cpu, Check } from "lucide-react";
import Terminal from "../components/Terminal";

export default function TerminalPlayground() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-sans flex items-center gap-2.5">
            <span>Terminal Sandbox</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
              Interactive
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            In-browser CentOS Linux shell environment powered by an in-memory Virtual File System. Freeform practice, experimentation, and command testing.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <Terminal
            title="CentOS Stream 9 (Trainer Playground)"
            defaultHeight="620px"
          />
        </div>

        <div className="lg:col-span-4 space-y-4 text-sm text-slate-300">
          <div className="rounded-xl border border-slate-800 bg-[#0f172a] p-5 shadow-sm">
            <h3 className="font-bold text-white font-sans text-sm mb-3 flex items-center gap-2">
              <TerminalIcon className="w-4 h-4 text-cyan-400" />
              <span>Quick Commands</span>
            </h3>
            <ul className="space-y-2 text-xs font-mono text-slate-400">
              <li className="flex items-center justify-between bg-[#090d16] p-2 rounded border border-slate-800">
                <span className="text-slate-300">Root shell:</span>
                <code className="text-rose-300 font-bold">su -</code>
              </li>
              <li className="flex items-center justify-between bg-[#090d16] p-2 rounded border border-slate-800">
                <span className="text-slate-300">View users:</span>
                <code className="text-cyan-300 font-bold">cat /etc/passwd</code>
              </li>
              <li className="flex items-center justify-between bg-[#090d16] p-2 rounded border border-slate-800">
                <span className="text-slate-300">Nested dir:</span>
                <code className="text-cyan-300 font-bold">mkdir -p /app/data</code>
              </li>
              <li className="flex items-center justify-between bg-[#090d16] p-2 rounded border border-slate-800">
                <span className="text-slate-300">Service state:</span>
                <code className="text-cyan-300 font-bold">systemctl status sshd</code>
              </li>
              <li className="flex items-center justify-between bg-[#090d16] p-2 rounded border border-slate-800">
                <span className="text-slate-300">Firewall rules:</span>
                <code className="text-cyan-300 font-bold">firewall-cmd --list-all</code>
              </li>
              <li className="flex items-center justify-between bg-[#090d16] p-2 rounded border border-slate-800">
                <span className="text-slate-300">Network IPs:</span>
                <code className="text-cyan-300 font-bold">ip a</code>
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#0f172a] p-5 shadow-sm">
            <h3 className="font-bold text-white font-sans text-sm mb-3 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>Simulator Architecture</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-400 font-sans leading-relaxed">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Full Virtual File System with standard POSIX tree</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Pipe chains (<code className="font-mono text-cyan-400">| grep</code>) & Redirection (<code className="font-mono text-cyan-400">&gt;</code>, <code className="font-mono text-cyan-400">&gt;&gt;</code>)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Command autocompletion (<kbd className="font-mono text-slate-300">Tab</kbd>) & command history (<kbd className="font-mono text-slate-300">↑/↓</kbd>)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>100% Client-side sandbox, zero external latency</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
