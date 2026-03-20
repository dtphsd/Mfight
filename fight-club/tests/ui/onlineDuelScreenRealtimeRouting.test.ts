import { describe, expect, it } from "vitest";
import {
  resolveOnlineActionClientMode,
  resolveOnlineRealtimeClientModes,
} from "@/ui/screens/OnlineDuel/OnlineDuelScreen";

describe("OnlineDuelScreen realtime routing", () => {
  it("uses only the active player client for lobby-launched PvP realtime sync", () => {
    expect(
      resolveOnlineRealtimeClientModes({
        launchedFromLobby: true,
        playerMode: "host",
      })
    ).toEqual(["host"]);

    expect(
      resolveOnlineRealtimeClientModes({
        launchedFromLobby: true,
        playerMode: "guest",
      })
    ).toEqual(["guest"]);
  });

  it("respects an explicit realtime override for the active lobby player", () => {
    expect(
      resolveOnlineRealtimeClientModes({
        launchedFromLobby: true,
        playerMode: "host",
        modeOverride: "guest",
      })
    ).toEqual(["guest"]);
  });

  it("keeps both debug clients active outside the lobby-launched PvP flow", () => {
    expect(
      resolveOnlineRealtimeClientModes({
        launchedFromLobby: false,
        playerMode: "host",
      })
    ).toEqual(["host", "guest"]);

    expect(
      resolveOnlineRealtimeClientModes({
        launchedFromLobby: false,
        playerMode: "guest",
        modeOverride: "guest",
      })
    ).toEqual(["host", "guest"]);
  });

  it("routes rematch and other player actions through the current player mode", () => {
    expect(resolveOnlineActionClientMode("host")).toBe("host");
    expect(resolveOnlineActionClientMode("guest")).toBe("guest");
  });
});
