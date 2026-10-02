# 🐧 LinuxDrill — POSIX & Linux Systems Mastery

> **Enterprise Linux System Administration & POSIX Mastery Platform**  
> An interactive, browser-based hands-on trainer designed for sysadmins, competition competitors, and certification candidates (RHCSA, LPIC-1, CompTIA Linux+).

[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Oxlint](https://img.shields.io/badge/Linter-Oxlint-F28B24)](https://oxc.rs/)
[![Verification Accuracy](https://img.shields.io/badge/Challenges_Audit-40%2F40_Passing_(100%25)-success)](scripts/test-all-problems.ts)

---

## 📖 Table of Contents

- [About The Project](#-about-the-project)
- [Key Features](#-key-features)
- [The Curriculum & Domains](#-the-curriculum--domains)
- [Architecture & Simulation Engine](#-architecture--simulation-engine)
- [Getting Started & Local Setup](#-getting-started--local-setup)
- [Available Scripts](#-available-scripts)
- [Running Automated Audits](#-running-automated-audits)
- [Project Directory Structure](#-project-directory-structure)
- [Adding or Modifying Challenges](#-adding-or-modifying-challenges)
- [License](#-license)

---

## 🎯 About The Project

**LinuxDrill** (also known as *Linux-SysAd-Trainer*) is a full-featured, zero-installation web application that simulates a live CentOS / Enterprise Linux workstation right inside your browser.

Originally engineered as an intensive training simulator for the **15th IT Skills Olympics (ITSO 2026) Linux Administration Category** (CentOS on VMware, individual on-site contest), LinuxDrill solves the friction of provisioning virtual machines by delivering an authentic, low-latency POSIX command environment directly through the web.

Whether preparing for timed competitive sysadmin olympiads, studying for Red Hat Certified System Administrator (RHCSA), LPIC-1, or sharpening command-line reflexes, LinuxDrill offers real-world task verification, multi-stage hints, and instant feedback.

---

## ✨ Key Features

### 🖥️ In-Browser POSIX & CentOS Shell
- **Zero Configuration**: No virtual machines, Docker containers, or cloud compute instances required.
- **Rich Command Parsing**: Full support for pipelines (`|`), input/output redirections (`>`, `>>`, `<`), heredocs (`<< 'EOF'`), multi-line scripts, and command chaining (`&&`, `||`, `;`).
- **In-Memory Virtual File System (VFS)**: Persistent file metadata, POSIX permissions (`rwxr-xr-x`), symlinks, directory trees, ownership (`chown`), and access control lists (`getfacl` / `setfacl`).
- **Simulated Linux Subsystems**:
  - **User & Auth**: `useradd`, `usermod`, `passwd`, `chage`, group memberships, `/etc/passwd`, `/etc/shadow`, and `su -` root escalation.
  - **Storage & LVM**: Physical Volumes (`pvcreate`), Volume Groups (`vgcreate`), Logical Volumes (`lvcreate`, `lvextend`), file system creation (`mkfs.xfs`), and mount operations (`mount`, `/etc/fstab`).
  - **Systemd & Daemons**: `systemctl start|stop|restart|enable|disable|status`, daemon states, and unit management.
  - **Networking & Firewall**: `ip`, `nmcli` connection profiles, `firewall-cmd --permanent --add-port|--add-service`, rich rules, and reload cycles.
  - **SELinux Management**: Enforcing / Permissive modes and port labeling via `semanage port`.
  - **Text Manipulation**: `grep`, `sed`, `awk`, `find`, `cut`, `sort`, `uniq`, `tar`, and bash scripting.
  - **80+ Authentic Manual Pages**: Built-in interactive pager (`man`, `less`) with standard sections (`NAME`, `SYNOPSIS`, `DESCRIPTION`, `OPTIONS`) and `--help` text.

### 🧪 Automated Verification Engine
- Real-time evaluation against the live Virtual File System and shell execution history.
- Verifies directory structures, file contents, file permissions, daemon states, firewall entries, and command invocations.
- 100% verified accuracy across all 40 core challenges with zero false positives.

### 💡 Multi-Tiered Progressive Hint System
- **Level 1 (Concept Nudge)**: Guides your conceptual approach without giving away commands.
- **Level 2 (Command Pointer)**: Identifies the relevant utility and syntax flags.
- **Level 3 (Command Skeleton)**: Provides structured templates to complete the task.

### ⌨️ Enthusiast Mechanical Keyboard Audio Engine
- Built on the Web Audio API with ultra-low latency key acoustics.
- Physical key positioning and downstroke/upstroke mechanical modeling.
- Curated switch soundpacks: *Holy Panda*, *NovelKeys Cream*, *Cherry MX Red*, *IBM Model M*, *Topre*, and more.
- Volume mixer and instant previews in the Sound Settings modal.

### 🎨 Modern Terminal Aesthetic & Theming
- Built-in theme presets: **Default**, **Catppuccin Mocha**, **Kanagawa Wave**, **Tokyo Night**, and **Gruvbox**.
- Light and dark mode support with instant switching and anti-FOUC initialization.
- Resizable split-screen layout for challenge specifications and terminal sessions.
- Tab-close protection and navigation confirmation modals so students never lose in-progress terminal work.

### 🕹️ Standalone Terminal Playground (`/terminal`)
- Freeform sandbox for ad-hoc experimentation, testing shell commands, reading man pages, and debugging scripts outside of problem constraints.

---

## 📚 The Curriculum & Domains

LinuxDrill includes **40 rigorous challenges** grouped into 8 official competency domains:

| Code | Domain | Description | Count | Point Tier |
|---|---|---|:---:|:---:|
| `BASIC` | **Basic Shell** | File navigation, globbing, pipelines, output streams, and text wrangling | 5 | 5 - 10 pts |
| `USER` | **User & Auth** | User creation, group assignment, password aging, sudoers, and POSIX permissions | 5 | 5 - 10 pts |
| `PKG` | **Package Manager** | `dnf` / `rpm` / `apt` repositories, queries, package installation, and verification | 5 | 5 - 10 pts |
| `NET` | **Networking** | Static IP configuration with `nmcli`, DNS, interface control, and route tables | 5 | 5 - 10 pts |
| `FS` | **Filesystems & LVM** | Partitions, LVM volume creation & extension, XFS formatting, mounts, `/etc/fstab` | 5 | 5 - 50 pts |
| `SVC` | **Service Management** | Systemd unit administration, auto-start enablement, journal logs, and signal handling | 5 | 5 - 10 pts |
| `SEC` | **Security** | `firewalld` rule management, rich rules, port forwarding, SELinux enforcement, and SSH | 5 | 5 - 50 pts |
| `SCR` | **Batch Scripting** | Bash automation, loops, argument parsing, automated reporting, and cron jobs | 5 | 10 - 50 pts |

### Scoring & Time Management
- **Easy**: 5 pts (Fundamental single-utility operations)
- **Average**: 10 pts (Multi-command workflows and configuration edits)
- **Difficult**: 50 pts (Complex multi-stage system setups, LVM expansion, security hardening)

---

## 🏗️ Architecture & Simulation Engine

```mermaid
flowchart LR
    A[content/content.md] -->|scripts/build-content.mjs| B[src/data/problems.json]
    B --> C[React UI / Router]
    
    subgraph Browser Client
      C --> D[Problem Workspace / Playground]
      D --> E[Terminal Component]
      E <--> F[VirtualFileSystem (VFS)]
      E <--> G[POSIX Command Parser]
      E <--> H[ShellContext Engine]
      E -.-> I[Web Audio Soundpack Engine]
      D --> J[Realtime Verification Engine]
      J <--> F
      J <--> H
    end
```

- **Content Pipeline**: The single source of truth for challenges, tasks, solutions, hints, and judge verifications is [`content/content.md`](file:///home/ram/Projects/Web%20Development/Linux-SysAd-Trainer/content/content.md). The build script parses this markdown file into a strongly-typed JSON dataset consumed by the frontend.
- **In-Memory VFS**: Fast tree-based data structure modeling POSIX directories, regular files, symlinks, file modes, owners, and sizes.
- **Stateful ShellContext**: Tracks working directories, user session (`student` vs `root`), background service states, network interfaces, firewall tables, SELinux ports, and command history.
- **Verification Engine**: Compares the student's resulting system state against declarative checks to award points without requiring external judge intervention.

---

## 🚀 Getting Started & Local Setup

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: `v18.0.0` or higher (Node.js 20+ recommended)
- **npm**: `v9.0.0` or higher (or `pnpm` / `yarn`)
- **Git**

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Ram-Gold/linuxdrill.git
   cd linuxdrill
   ```

2. **Install project dependencies**:
   ```bash
   npm install
   ```

3. **Compile the challenge curriculum**:
   ```bash
   npm run content
   ```
   *(This parses `content/content.md` and generates `src/data/problems.json`)*

4. **Launch the development server**:
   ```bash
   npm run dev
   ```

5. **Open in browser**:  
   Visit [`http://localhost:5173`](http://localhost:5173) to start practicing!

---

## 🛠️ Available Scripts

In the project root, you can execute:

| Command | Action |
|---|---|
| `npm run dev` | Compiles content and starts the Vite development server with HMR |
| `npm run build` | Compiles content, performs TypeScript typecheck (`tsc -b`), and builds for production |
| `npm run preview` | Locally serves the production build in `./dist` for validation |
| `npm run content` | Parses `content/content.md` into `src/data/problems.json` |
| `npm run lint` | Runs the high-performance `oxlint` linter across all source files |

---

## 🧪 Running Automated Audits

LinuxDrill comes with comprehensive automated audit suites to ensure simulation authenticity and verification accuracy:

### 1. Challenge & Verification Accuracy Audit
Runs all 40 challenge scenarios through three test stages:
- Tests for **zero false positives** on blank terminal environments.
- Tests for **zero false positives** on trivial/unrelated commands (`ls`, `pwd`, `whoami`).
- Runs the official solution against the live VFS to guarantee **100% solution pass rate**.

```bash
npx tsx scripts/test-all-problems.ts
```

### 2. Manual Pages & Help System Test
Validates that all registered commands provide authentic man pages, standard section headings (`NAME`, `SYNOPSIS`, `DESCRIPTION`, `OPTIONS`), interactive pager support, search (`man -k`), and GNU-compliant `--help` output:

```bash
npx tsx scripts/test-man-help.ts
```

---

## 📁 Project Directory Structure

```text
linuxdrill/
├── content/
│   └── content.md               # Master curriculum, challenges, hints, and solutions
├── public/                      # Static assets and icons
├── scripts/
│   ├── build-content.mjs        # Markdown to JSON parser for challenge curriculum
│   ├── test-all-problems.ts     # Automated accuracy & false-positive audit suite
│   └── test-man-help.ts         # Man pages and GNU help validation suite
├── src/
│   ├── components/              # UI components (Navbar, Terminal, Modals, Roadmap)
│   ├── data/                    # Generated problems.json and problemMeta.json
│   ├── lib/
│   │   ├── vfs/                 # Core engine: VirtualFileSystem, Parser, Commands, Manpages
│   │   ├── soundpack.ts         # Web Audio mechanical switch sound engine
│   │   ├── soundSprite.ts       # Sound sprite timings & acoustic frequency modeling
│   │   ├── keyechoPacks.ts      # Switch sound profiles (Holy Panda, Cream, Cherry MX, etc.)
│   │   ├── verifyProblem.ts     # Automated challenge validation logic
│   │   ├── useProgress.ts       # LocalStorage progress and score persistence
│   │   ├── useThemePreset.ts    # Theme preset manager (Catppuccin, Gruvbox, etc.)
│   │   └── types.ts             # TypeScript domain and problem types
│   ├── pages/
│   │   ├── Home.tsx             # Challenge dashboard, progress overview & track roadmap
│   │   ├── ProblemPage.tsx      # Split-screen challenge workbench with live terminal
│   │   └── TerminalPlayground.tsx # Unconstrained sandbox terminal
│   ├── App.tsx                  # Root layout and persistent navigation
│   ├── main.tsx                 # Client entry point and router definitions
│   └── index.css                # Tailwind CSS v4 styling & theme color variables
├── package.json                 # Project dependencies and script runner
├── tsconfig.json                # TypeScript compiler configuration
├── vercel.json                  # Production SPA rewrite routing configuration
└── vite.config.ts               # Vite bundler configuration
```

---

## ✍️ Adding or Modifying Challenges

To add a new problem or modify an existing one, edit [`content/content.md`](file:///home/ram/Projects/Web%20Development/Linux-SysAd-Trainer/content/content.md) using the standard format:

```markdown
### LX-TOPIC-## · [Easy|Average|Difficult] · [5|10|50] pts

**Task**
What the participant must accomplish on the machine.

**Setup** (Optional)
```bash
# Preparation commands to initialize files or services before start
```

**Hints**
1. First nudge explaining the concept.
2. Second nudge identifying the utility or file path.
3. Third nudge providing a command skeleton.

**Solution**
```bash
# Full working command or set of commands
```

**Verify**
```bash
# Verification commands used to test success
```

**Watch out**
Common pitfall or syntax mistake to avoid.

---
```

After modifying [`content/content.md`](file:///home/ram/Projects/Web%20Development/Linux-SysAd-Trainer/content/content.md):
1. Add verification logic in [`src/lib/verifyProblem.ts`](file:///home/ram/Projects/Web%20Development/Linux-SysAd-Trainer/src/lib/verifyProblem.ts).
2. Run `npm run content`.
3. Verify your changes pass the test suite:
   ```bash
   npx tsx scripts/test-all-problems.ts
   ```

---

## 📜 License

This project is created for educational, training, and competition preparation purposes. See repository headers and package files for licensing details.
