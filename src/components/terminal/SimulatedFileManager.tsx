import { useState, useMemo, useCallback } from 'react';
import {
  Folder,
  FolderOpen,
  FileText,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import type { ShellContext } from '../../lib/vfs/commands';
import type { VFSNode } from '../../lib/vfs/types';

interface SimulatedFileManagerProps {
  shell: ShellContext | null;
  refreshTrigger?: number;
  className?: string;
  fontSize?: number;
}

interface TreeNode {
  name: string;
  fullPath: string;
  node: VFSNode;
  children?: TreeNode[];
}

export default function SimulatedFileManager({
  shell,
  refreshTrigger = 0,
  className = '',
  fontSize = 12,
}: SimulatedFileManagerProps) {
  const currentCwd = shell?.session?.cwd ?? '/';

  // User manual expansion/collapse overrides
  const [collapsedPaths, setCollapsedPaths] = useState<Set<string>>(() => new Set());
  const [manualExpandedPaths, setManualExpandedPaths] = useState<Set<string>>(
    () => new Set(['/', '/etc', '/home', '/home/student', '/home/student/documents'])
  );

  const checkIsExpanded = useCallback(
    (path: string): boolean => {
      if (collapsedPaths.has(path)) return false;
      if (manualExpandedPaths.has(path)) return true;
      if (path === '/') return true;
      // Auto-expand parents of active CWD
      if (currentCwd === path || currentCwd.startsWith(path + '/')) return true;
      return false;
    },
    [collapsedPaths, manualExpandedPaths, currentCwd]
  );

  // Build hierarchical tree structure from root node
  const treeData = useMemo(() => {
    if (!shell || !shell.vfs || !shell.vfs.root) return null;
    void refreshTrigger;

    const buildTree = (node: VFSNode, currentPath: string): TreeNode => {
      const fullPath =
        currentPath === '/' ? `/${node.name === '/' ? '' : node.name}` : `${currentPath}/${node.name}`;
      const normalizedPath = fullPath === '//' ? '/' : fullPath;

      const children: TreeNode[] = [];
      if (node.type === 'dir' && node.children) {
        // Sort: directories first, then files alphabetically
        const entries = Array.from(node.children.values()).sort((a, b) => {
          if (a.type === 'dir' && b.type !== 'dir') return -1;
          if (a.type !== 'dir' && b.type === 'dir') return 1;
          return a.name.localeCompare(b.name);
        });

        for (const child of entries) {
          children.push(buildTree(child, normalizedPath === '/' ? '' : normalizedPath));
        }
      }

      return {
        name: node.name === '/' ? '/' : node.name,
        fullPath: normalizedPath,
        node,
        children,
      };
    };

    return buildTree(shell.vfs.root, '/');
  }, [shell, refreshTrigger]);

  const toggleExpand = (path: string) => {
    const currentlyExpanded = checkIsExpanded(path);
    if (currentlyExpanded) {
      setCollapsedPaths((prev) => new Set(prev).add(path));
      setManualExpandedPaths((prev) => {
        const next = new Set(prev);
        next.delete(path);
        return next;
      });
    } else {
      setCollapsedPaths((prev) => {
        const next = new Set(prev);
        next.delete(path);
        return next;
      });
      setManualExpandedPaths((prev) => new Set(prev).add(path));
    }
  };

  const renderNode = (item: TreeNode, depth = 0): React.ReactNode => {
    const isDir = item.node.type === 'dir';
    const isExpanded = checkIsExpanded(item.fullPath);
    const isCurrentCwd = currentCwd === item.fullPath;

    // Filter out internal/device clutter from top-level to keep sidebar looking like the screenshot
    if (depth === 1 && ['dev', 'sys', 'proc', 'run', 'srv', 'mnt', 'opt', 'backup'].includes(item.name)) {
      return null;
    }

    if (isDir) {
      return (
        <div key={item.fullPath} className="flex flex-col select-none">
          <div
            className={`flex items-center gap-1.5 py-0.5 px-2 rounded-lg font-mono transition-colors cursor-pointer ${
              isCurrentCwd
                ? 'bg-blue-600/25 text-blue-300 font-medium border border-blue-500/30'
                : 'hover:bg-white/5 text-slate-300 hover:text-white'
            }`}
            style={{
              paddingLeft: `${Math.max(8, depth * 14)}px`,
              fontSize: `${fontSize}px`,
            }}
            onClick={() => toggleExpand(item.fullPath)}
          >
            {/* Chevron toggle */}
            <span className="w-3.5 h-3.5 flex items-center justify-center text-slate-400 shrink-0">
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </span>

            {/* Cyan/Blue Folder icon */}
            {isExpanded ? (
              <FolderOpen className="w-3.5 h-3.5 text-[#38bdf8] shrink-0" />
            ) : (
              <Folder className="w-3.5 h-3.5 text-[#38bdf8] shrink-0" />
            )}

            {/* Folder name */}
            <span className="truncate">{item.name}</span>
          </div>

          {/* Children */}
          {isExpanded && item.children && (
            <div className="flex flex-col">
              {item.children.map((child) => renderNode(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    // File item: Completely unclickable per instructions ("You cannot interact with files and you just have to use the terminal")
    return (
      <div
        key={item.fullPath}
        className="flex items-center gap-1.5 py-0.5 px-2 font-mono text-slate-400 select-none pointer-events-none"
        style={{
          paddingLeft: `${Math.max(8, depth * 14 + 14)}px`,
          fontSize: `${fontSize}px`,
        }}
      >
        <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        <span className="truncate text-slate-300">{item.name}</span>
      </div>
    );
  };

  return (
    <div
      className={`w-full h-full flex flex-col bg-[var(--surface-base)] border-r border-white/5 select-none font-mono ${className}`}
    >
      {/* Scrollable File Tree */}
      <div
        className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5 scrollbar-thin scrollbar-thumb-white/10"
        style={{ fontSize: `${fontSize}px` }}
      >
        {treeData ? (
          renderNode(treeData)
        ) : (
          <div className="p-4 text-center text-xs text-slate-500">
            Loading Virtual File System...
          </div>
        )}
      </div>
    </div>
  );
}
