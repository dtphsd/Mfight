export type OnlineDuelLogLevel = "silent" | "error" | "info";
export type OnlineDuelDeployProfile = "default" | "lan" | "public" | "proxy";

export interface OnlineDuelRuntimeConfig {
  deployProfile: OnlineDuelDeployProfile;
  port: number;
  host: string;
  seed?: number;
  staleSweepIntervalMs?: number;
  bodyLimitBytes?: number;
  corsOrigin: string;
  logLevel: OnlineDuelLogLevel;
  rateLimitWindowMs?: number;
  messageRateLimitMax?: number;
  eventRateLimitMax?: number;
  trustProxy: boolean;
  warnings: string[];
}

export interface OnlineDuelRuntimeEnv {
  PORT?: string;
  HOST?: string;
  ONLINE_DUEL_SEED?: string;
  ONLINE_DUEL_STALE_SWEEP_MS?: string;
  ONLINE_DUEL_BODY_LIMIT_BYTES?: string;
  ONLINE_DUEL_CORS_ORIGIN?: string;
  ONLINE_DUEL_LOG_LEVEL?: string;
  ONLINE_DUEL_RATE_LIMIT_WINDOW_MS?: string;
  ONLINE_DUEL_MESSAGE_RATE_LIMIT_MAX?: string;
  ONLINE_DUEL_EVENT_RATE_LIMIT_MAX?: string;
  ONLINE_DUEL_TRUST_PROXY?: string;
  ONLINE_DUEL_DEPLOY_PROFILE?: string;
}

export function resolveOnlineDuelRuntimeConfig(
  env: OnlineDuelRuntimeEnv = process.env
): OnlineDuelRuntimeConfig {
  const deployProfile = parseDeployProfile(env.ONLINE_DUEL_DEPLOY_PROFILE);
  const profileDefaults = resolveProfileDefaults(deployProfile);

  const port = parsePort(env.PORT);
  const host = env.HOST?.trim() || profileDefaults.host;
  const seed = parseOptionalInteger(env.ONLINE_DUEL_SEED);
  const staleSweepIntervalMs = parseOptionalInteger(env.ONLINE_DUEL_STALE_SWEEP_MS);
  const bodyLimitBytes = parseOptionalInteger(env.ONLINE_DUEL_BODY_LIMIT_BYTES);
  const corsOrigin = env.ONLINE_DUEL_CORS_ORIGIN?.trim() || profileDefaults.corsOrigin;
  const logLevel = parseLogLevel(env.ONLINE_DUEL_LOG_LEVEL);
  const rateLimitWindowMs = parseOptionalInteger(env.ONLINE_DUEL_RATE_LIMIT_WINDOW_MS);
  const messageRateLimitMax = parseOptionalInteger(env.ONLINE_DUEL_MESSAGE_RATE_LIMIT_MAX);
  const eventRateLimitMax = parseOptionalInteger(env.ONLINE_DUEL_EVENT_RATE_LIMIT_MAX);
  const trustProxy = parseOptionalBoolean(env.ONLINE_DUEL_TRUST_PROXY) ?? profileDefaults.trustProxy;

  const warnings = resolveRuntimeWarnings({
    deployProfile,
    host,
    corsOrigin,
    trustProxy,
  });

  return {
    deployProfile,
    port,
    host,
    seed,
    staleSweepIntervalMs,
    bodyLimitBytes,
    corsOrigin,
    logLevel,
    rateLimitWindowMs,
    messageRateLimitMax,
    eventRateLimitMax,
    trustProxy,
    warnings,
  };
}

interface ProfileDefaults {
  host: string;
  corsOrigin: string;
  trustProxy: boolean;
}

function resolveProfileDefaults(deployProfile: OnlineDuelDeployProfile): ProfileDefaults {
  switch (deployProfile) {
    case "lan":
      return {
        host: "0.0.0.0",
        corsOrigin: "*",
        trustProxy: false,
      };
    case "public":
      return {
        host: "0.0.0.0",
        corsOrigin: "*",
        trustProxy: false,
      };
    case "proxy":
      return {
        host: "127.0.0.1",
        corsOrigin: "*",
        trustProxy: true,
      };
    case "default":
    default:
      return {
        host: "0.0.0.0",
        corsOrigin: "*",
        trustProxy: false,
      };
  }
}

function resolveRuntimeWarnings(input: {
  deployProfile: OnlineDuelDeployProfile;
  host: string;
  corsOrigin: string;
  trustProxy: boolean;
}) {
  const warnings: string[] = [];

  if ((input.deployProfile === "public" || input.deployProfile === "proxy") && input.corsOrigin === "*") {
    warnings.push("cors_origin_wildcard_on_public_profile");
  }

  if (input.deployProfile === "proxy" && !input.trustProxy) {
    warnings.push("proxy_profile_without_trust_proxy");
  }

  if (input.deployProfile === "proxy" && input.host !== "127.0.0.1" && input.host !== "localhost") {
    warnings.push("proxy_profile_exposed_beyond_loopback");
  }

  if (input.deployProfile === "public" && input.trustProxy) {
    warnings.push("public_profile_trust_proxy_enabled");
  }

  return warnings;
}

function parseDeployProfile(rawValue: string | undefined): OnlineDuelDeployProfile {
  const value = rawValue?.trim().toLowerCase();
  if (!value) {
    return "default";
  }

  if (value === "default" || value === "lan" || value === "public" || value === "proxy") {
    return value;
  }

  throw new Error(`Invalid ONLINE_DUEL_DEPLOY_PROFILE value: ${rawValue}`);
}

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

function parseLogLevel(rawValue: string | undefined): OnlineDuelLogLevel {
  const value = rawValue?.trim().toLowerCase();
  if (!value) {
    return "info";
  }

  if (value === "silent" || value === "error" || value === "info") {
    return value;
  }

  throw new Error(`Invalid ONLINE_DUEL_LOG_LEVEL value: ${rawValue}`);
}

function parseOptionalBoolean(rawValue: string | undefined): boolean | undefined {
  const value = rawValue?.trim().toLowerCase();
  if (!value) {
    return undefined;
  }

  if (value === "true" || value === "1" || value === "yes") {
    return true;
  }

  if (value === "false" || value === "0" || value === "no") {
    return false;
  }

  throw new Error(`Invalid boolean value: ${rawValue}`);
}
