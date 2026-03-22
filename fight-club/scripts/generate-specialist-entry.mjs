import fs from "node:fs";
import path from "node:path";

const rootDir = path.resolve(import.meta.dirname, "..");

const specialistConfig = {
  combat: {
    journalPath: path.join(rootDir, "TAMA_start", "combat_agent_journal.md"),
    patchNotesPath: path.join(rootDir, "TAMA_start", "combat_patch_notes.md"),
    entryPrefix: "CMB",
    headingPrefix: "CMB",
    entryTitle: "Title",
    trackLine: "Formula Mastery | AI Tactics | Balance Analysis | Systems Design | Combat Safety",
    typeLine: "Bug Fix | Balance Fix | Combat Economy | Planner Fix | Docs Sync | Systems Design",
    achievementLine: "optional",
    patchBullets: [
      "- Summary line for the combat-system change.",
      "- If formulas changed, include exact numeric deltas in `old -> new` format.",
      "- Add verification line if tests, build, audit, or matrix were run.",
    ],
  },
  ui: {
    journalPath: path.join(rootDir, "TAMA_start", "ui_agent_journal.md"),
    patchNotesPath: path.join(rootDir, "TAMA_start", "ui_patch_notes.md"),
    entryPrefix: "UI",
    headingPrefix: "UI",
    entryTitle: "Title",
    trackLine: "Visual Systems | Interaction Design | UX Clarity | Design Consistency | UI Safety",
    typeLine: "Bug Fix | UX Improvement | UI Systems | Docs Sync | Design Pattern | Accessibility",
    achievementLine: "optional",
    patchBullets: [
      "- Summary line for the UI or UX change.",
      "- Name the screen, flow, or interaction that changed.",
      "- Add verification line if build, review, or UI check was completed.",
    ],
  },
  backend: {
    journalPath: path.join(rootDir, "TAMA_start", "backend_agent_journal.md"),
    patchNotesPath: path.join(rootDir, "TAMA_start", "backend_patch_notes.md"),
    entryPrefix: "BE",
    headingPrefix: "BE",
    entryTitle: "Title",
    trackLine: "API Design | State Authority | Realtime Sync | Service Safety | Deployment Readiness",
    typeLine: "Architecture | Backend Planning | Infrastructure | Docs Sync | Safety Rule | Systems Design",
    achievementLine: "optional",
    patchBullets: [
      "- Summary line for the backend or service-architecture change.",
      "- Name the contract, authority rule, transport layer, or deployment surface that changed.",
      "- Add verification line if build, docs review, or backend validation was completed.",
    ],
  },
};

function printUsageAndExit() {
  console.log("Usage: npm run specialist:entry -- <combat|ui|backend>");
  process.exit(1);
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function findNextId(markdown, prefix) {
  const regex = new RegExp(`###\\s+${prefix}-(\\d{3})\\s+-`, "g");
  let maxId = 0;
  let match = regex.exec(markdown);

  while (match) {
    maxId = Math.max(maxId, Number(match[1]));
    match = regex.exec(markdown);
  }

  return `${prefix}-${String(maxId + 1).padStart(3, "0")}`;
}

function createJournalTemplate(config, nextId, date) {
  return [
    `### ${nextId} - ${config.entryTitle}`,
    `**Date**: ${date}`,
    "**Impact**: X/10",
    "**XP**: +N",
    `**Track**: ${config.trackLine}`,
    `**Type**: ${config.typeLine}`,
    `**Achievement**: ${config.achievementLine}`,
    "",
    "#### What happened",
    "Short factual summary.",
    "",
    "#### Why it mattered",
    "Why this changed understanding, safety, or quality.",
    "",
    "#### Lesson",
    "What the specialist should remember next time.",
    "",
    "#### Pattern",
    "Reusable pattern or anti-pattern.",
    "",
    "<!-- CMB_JSON",
    `{"id":"${nextId}","date":"${date}","impact":0,"xp":0,"track":"","achievement":"none","type":"","title":"Title"}`,
    "-->",
  ].join("\n");
}

function createPatchTemplate(config, date) {
  return [
    `## ${date} - Title`,
    "",
    ...config.patchBullets,
  ].join("\n");
}

const specialist = process.argv[2];

if (!specialist || !(specialist in specialistConfig)) {
  printUsageAndExit();
}

const config = specialistConfig[specialist];
const journal = fs.readFileSync(config.journalPath, "utf8");
const nextId = findNextId(journal, config.entryPrefix);
const today = formatDate(new Date());

console.log(`Specialist: ${specialist}`);
console.log(`Journal: ${path.relative(rootDir, config.journalPath)}`);
console.log(`Patch Notes: ${path.relative(rootDir, config.patchNotesPath)}`);
console.log("");
console.log("Journal Entry Template");
console.log("----------------------");
console.log(createJournalTemplate(config, nextId, today));
console.log("");
console.log("Patch Notes Template");
console.log("--------------------");
console.log(createPatchTemplate(config, today));
