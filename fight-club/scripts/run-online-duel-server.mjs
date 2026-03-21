import { spawn } from "node:child_process";

const args = process.argv.slice(2);
const profileArg = args.find((arg) => arg.startsWith("--profile="));
const profile = profileArg?.slice("--profile=".length)?.trim();

const childEnv = { ...process.env };
if (profile && !childEnv.ONLINE_DUEL_DEPLOY_PROFILE) {
  childEnv.ONLINE_DUEL_DEPLOY_PROFILE = profile;
}

const child = spawn(
  process.execPath,
  ["./node_modules/vite-node/vite-node.mjs", "./server/onlineDuelServer.ts"],
  {
    cwd: process.cwd(),
    env: childEnv,
    stdio: "inherit",
  }
);

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
