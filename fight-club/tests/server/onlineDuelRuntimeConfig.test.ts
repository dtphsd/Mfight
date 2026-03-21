// @vitest-environment node

import { describe, expect, it } from "vitest";
import { resolveOnlineDuelRuntimeConfig } from "../../server/onlineDuelRuntimeConfig";

describe("online duel runtime config", () => {
  it("uses public profile defaults when requested", () => {
    const config = resolveOnlineDuelRuntimeConfig({
      ONLINE_DUEL_DEPLOY_PROFILE: "public",
    });

    expect(config).toMatchObject({
      deployProfile: "public",
      host: "0.0.0.0",
      trustProxy: false,
      corsOrigin: "*",
      port: 3001,
    });
    expect(config.warnings).toContain("cors_origin_wildcard_on_public_profile");
  });

  it("uses proxy profile defaults and warns if loopback is overridden", () => {
    const config = resolveOnlineDuelRuntimeConfig({
      ONLINE_DUEL_DEPLOY_PROFILE: "proxy",
      HOST: "0.0.0.0",
    });

    expect(config).toMatchObject({
      deployProfile: "proxy",
      host: "0.0.0.0",
      trustProxy: true,
    });
    expect(config.warnings).toContain("proxy_profile_exposed_beyond_loopback");
  });

  it("lets explicit env override profile defaults", () => {
    const config = resolveOnlineDuelRuntimeConfig({
      ONLINE_DUEL_DEPLOY_PROFILE: "lan",
      HOST: "127.0.0.1",
      ONLINE_DUEL_TRUST_PROXY: "true",
      ONLINE_DUEL_CORS_ORIGIN: "https://duel.example",
      PORT: "4100",
    });

    expect(config).toMatchObject({
      deployProfile: "lan",
      host: "127.0.0.1",
      trustProxy: true,
      corsOrigin: "https://duel.example",
      port: 4100,
    });
  });
});
