// Converts content/content.md into src/data/problems.json
import fs from "node:fs";

const md = fs.readFileSync("content/content.md", "utf8");

const TOPICS = {
  BASIC: "Basic Linux Commands",
  USER: "User & Group Management",
  PKG: "Package Management",
  NET: "Networking",
  FS: "File System Management",
  SVC: "Service Management",
  SEC: "Security",
  SCR: "Batch Scripting",
};

// Matches: ### LX-USER-03 · Average · 10 pts
const headerRe = /^### (LX-([A-Z]+)-\d+) · (Easy|Average|Difficult) · (\d+) pts\s*$/gm;
const headers = [...md.matchAll(headerRe)];

// Field labels inside a problem, in the order they appear
const KEYS = ["Task", "Setup", "Hints", "Solution", "Verify", "Watch out"];
const labelRe = /^\*\*(Task|Setup|Hints|Solution|Verify|Watch out)[^*\n]*\*\*/gm;

const problems = headers.map((h, i) => {
  const start = h.index + h[0].length;
  const end = i + 1 < headers.length ? headers[i + 1].index : md.length;
  let body = md.slice(start, end);

  // Stop at the next "---" line or the next big heading
  const cut = body.search(/^(?:---\s*$|##? (?:Topic|PART))/m);
  if (cut !== -1) body = body.slice(0, cut);

  // Find where each field starts (first occurrence only)
  const found = {};
  for (const m of body.matchAll(labelRe)) {
    if (!(m[1] in found)) found[m[1]] = { from: m.index, textStart: m.index + m[0].length };
  }
  const ordered = KEYS.filter((k) => k in found).sort((a, b) => found[a].from - found[b].from);

  const fields = {};
  ordered.forEach((key, idx) => {
    const nextKey = ordered[idx + 1];
    const stop = nextKey ? found[nextKey].from : body.length;
    // Solution keeps its label so variant headings like "(CentOS 7 layout)" survive
    const from = key === "Solution" ? found[key].from : found[key].textStart;
    fields[key] = body.slice(from, stop).replace(/^\*\*Solution\*\*\s*/, "").replace(/^:\s*/, "").trim();
  });

  const hints = (fields["Hints"] ?? "")
    .split(/\n(?=\d+\.\s)/)
    .map((s) => s.replace(/^\d+\.\s+/, "").trim())
    .filter(Boolean);

  return {
    id: h[1],
    topic: h[2],
    topicName: TOPICS[h[2]] ?? h[2],
    difficulty: h[3],
    points: Number(h[4]),
    task: fields["Task"] ?? "",
    setup: fields["Setup"] ?? "",
    hints,
    solution: fields["Solution"] ?? "",
    verify: fields["Verify"] ?? "",
    watchOut: fields["Watch out"] ?? "",
  };
});

fs.mkdirSync("src/data", { recursive: true });
fs.writeFileSync("src/data/problems.json", JSON.stringify(problems, null, 2));
console.log(`Parsed ${problems.length} problems -> src/data/problems.json`);
