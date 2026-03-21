import { startOnlineDuelHttpServer } from "./onlineDuelHttpServer";
import { resolveOnlineDuelRuntimeConfig } from "./onlineDuelRuntimeConfig";

const runtimeConfig = resolveOnlineDuelRuntimeConfig(process.env);

const handle = await startOnlineDuelHttpServer({
  port: runtimeConfig.port,
  host: runtimeConfig.host,
  seed: runtimeConfig.seed,
  staleSweepIntervalMs: runtimeConfig.staleSweepIntervalMs,
  bodyLimitBytes: runtimeConfig.bodyLimitBytes,
  corsOrigin: runtimeConfig.corsOrigin,
  logLevel: runtimeConfig.logLevel,
  rateLimitWindowMs: runtimeConfig.rateLimitWindowMs,
  messageRateLimitMax: runtimeConfig.messageRateLimitMax,
  eventRateLimitMax: runtimeConfig.eventRateLimitMax,
  trustProxy: runtimeConfig.trustProxy,
  deployProfile: runtimeConfig.deployProfile,
});

console.log(`Online Duel HTTP server listening on http://${handle.host}:${handle.port}`);
console.log(
  JSON.stringify({
    service: "online-duel",
    deployProfile: runtimeConfig.deployProfile,
    host: handle.host,
    port: handle.port,
    corsOrigin: runtimeConfig.corsOrigin,
    staleSweepIntervalMs: runtimeConfig.staleSweepIntervalMs ?? 15_000,
    bodyLimitBytes: runtimeConfig.bodyLimitBytes ?? 262144,
    logLevel: runtimeConfig.logLevel,
    rateLimitWindowMs: runtimeConfig.rateLimitWindowMs ?? 10_000,
    messageRateLimitMax: runtimeConfig.messageRateLimitMax ?? 60,
    eventRateLimitMax: runtimeConfig.eventRateLimitMax ?? 20,
    trustProxy: runtimeConfig.trustProxy,
    warnings: runtimeConfig.warnings,
  })
);
runtimeConfig.warnings.forEach((warning) => {
  console.warn(`[online-duel][warn] ${warning}`);
});

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
