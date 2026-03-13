import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const docsRoot = path.join(projectRoot, "docs");
const summaryPath = path.join(docsRoot, "SUMMARY.md");
const docsHomePath = path.join(docsRoot, "README.md");

const requiredFiles = [
  docsHomePath,
  summaryPath,
  path.join(docsRoot, "architecture", "README.md"),
  path.join(docsRoot, "architecture", "overview.md"),
  path.join(docsRoot, "architecture", "combat-design-reference.md"),
  path.join(docsRoot, "architecture", "combat-system-roadmap.md"),
  path.join(docsRoot, "decisions", "README.md"),
  path.join(docsRoot, "decisions", "ADR-001-architecture.md"),
];

const errors = [];

for (const filePath of requiredFiles) {
  if (!existsSync(filePath)) {
    errors.push(`Missing required docs file: ${relative(filePath)}`);
  }
}

if (existsSync(summaryPath)) {
  const summary = readFileSync(summaryPath, "utf8");
  const summaryLinks = [...summary.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)].map((match) => match[1]);

  if (summaryLinks.length === 0) {
    errors.push("SUMMARY.md does not contain any navigation links.");
  }

  for (const link of summaryLinks) {
    if (link.startsWith("http://") || link.startsWith("https://") || link.startsWith("#")) {
      continue;
    }

    const resolved = path.resolve(docsRoot, link);
    if (!existsSync(resolved)) {
      errors.push(`Broken SUMMARY.md link: ${link}`);
    }
  }
}

if (existsSync(docsHomePath)) {
  const docsHome = readFileSync(docsHomePath, "utf8");

  if (!docsHome.includes("[SUMMARY.md](./SUMMARY.md)")) {
    errors.push("docs/README.md must link to ./SUMMARY.md for GitBook navigation.");
  }
}

if (errors.length > 0) {
  console.error("Docs validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Docs validation passed.");

function relative(filePath) {
  return path.relative(projectRoot, filePath).replaceAll("\\", "/");
}
