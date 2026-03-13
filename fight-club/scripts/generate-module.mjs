import fs from "node:fs";
import path from "node:path";

const moduleName = process.argv[2];

if (!moduleName) {
  console.error("Usage: npm run generate:module -- module-name");
  process.exit(1);
}

const root = path.resolve("src", "modules", moduleName);
const parts = ["model", "application", "events", "contracts"];

for (const part of parts) {
  fs.mkdirSync(path.join(root, part), { recursive: true });
}

fs.writeFileSync(
  path.join(root, "index.ts"),
  `export * from "./contracts/${moduleName}PublicApi";\n`
);

fs.writeFileSync(
  path.join(root, "contracts", `${moduleName}PublicApi.ts`),
  `export interface ${toPascalCase(moduleName)}PublicApi {}\n`
);

console.log(`Module created: ${moduleName}`);

function toPascalCase(value) {
  return value
    .split(/[-_]/g)
    .filter(Boolean)
    .map((segment) => segment[0].toUpperCase() + segment.slice(1))
    .join("");
}

