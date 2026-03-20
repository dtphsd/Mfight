import { startOnlineDuelHttpServer } from "./onlineDuelHttpServer";

const port = parsePort(process.env.PORT);
const host = process.env.HOST?.trim() || "0.0.0.0";
const seed = parseOptionalInteger(process.env.ONLINE_DUEL_SEED);

const handle = await startOnlineDuelHttpServer({
  port,
  host,
  seed,
});

console.log(`Online Duel HTTP server listening on http://${handle.host}:${handle.port}`);

const shutdown = async () => {
  await handle.close();
  process.exit(0);
};

process.on("SIGINT", () => {
  void shutdown();
});

process.on("SIGTERM", () => {
  void shutdown();
});

function parsePort(rawValue: string | undefined): number {
  const parsed = parseOptionalInteger(rawValue);
  if (parsed === undefined) {
    return 3001;
  }

  return parsed;
}

function parseOptionalInteger(rawValue: string | undefined): number | undefined {
  const value = rawValue?.trim();
  if (!value) {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid integer value: ${rawValue}`);
  }

  return parsed;
}
