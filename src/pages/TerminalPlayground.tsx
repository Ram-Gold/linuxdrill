import Terminal from "../components/Terminal";

export default function TerminalPlayground() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Linux Playground Terminal</h1>
          <p className="text-sm text-slate-400">
            A full in-browser CentOS Linux shell simulator with a Virtual File System. Practice commands, scripts, and service checks.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3">
          <Terminal
            title="CentOS Stream 9 (Trainer Playground)"
            defaultHeight="600px"
          />
        </div>

        <div className="space-y-4 text-sm text-slate-300">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <h3 className="font-semibold text-slate-100 mb-2">Quick Practice Tips</h3>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>• Switch to root: <code className="text-rose-300">su -</code> or <code className="text-rose-300">sudo su</code></li>
              <li>• Check users: <code className="text-cyan-300">cat /etc/passwd</code></li>
              <li>• Create directories: <code className="text-cyan-300">mkdir -p /backup/data</code></li>
              <li>• Test services: <code className="text-cyan-300">systemctl status sshd</code></li>
              <li>• Firewall test: <code className="text-cyan-300">firewall-cmd --list-all</code></li>
              <li>• Network check: <code className="text-cyan-300">ip a</code> or <code className="text-cyan-300">ss -tuln</code></li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <h3 className="font-semibold text-slate-100 mb-2">Features</h3>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>✓ In-Memory Virtual File System</li>
              <li>✓ Pipe (<code className="text-slate-300">| grep</code>) & Redirection (<code className="text-slate-300">&gt;</code>, <code className="text-slate-300">&gt;&gt;</code>)</li>
              <li>✓ Tab completion & history navigation</li>
              <li>✓ Zero latency, 100% client-side</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
