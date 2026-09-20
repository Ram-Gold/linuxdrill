export type NodeType = "file" | "dir" | "symlink";

export interface VFSNode {
  name: string;
  type: NodeType;
  content?: string;
  permissions: string; // e.g. "rwxr-xr-x"
  owner: string;
  group: string;
  size: number;
  modified: Date;
  target?: string; // for symlinks
  children?: Map<string, VFSNode>;
}

export interface UserSession {
  username: string;
  uid: number;
  gid: number;
  group: string;
  groups: string[];
  cwd: string;
  homeDir: string;
  hostname: string;
  env: Record<string, string>;
}

export interface CommandOutput {
  stdout: string;
  stderr: string;
  exitCode: number;
  clear?: boolean;
}

export interface HistoryItem {
  id: string;
  command: string;
  user: string;
  cwd: string;
  output?: CommandOutput;
  timestamp: Date;
}
