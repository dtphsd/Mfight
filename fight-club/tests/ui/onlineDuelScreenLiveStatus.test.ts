import { describe, expect, it } from "vitest";
import {
  getMatchStatusSummary,
  resolveOnlineDuelLiveStatus,
  resolveOnlineDuelMatchmakingStatus,
  resolveOnlineDuelRecoveryAction,
} from "@/ui/screens/OnlineDuel/onlineDuelScreenSupport";

describe("OnlineDuel live status", () => {
  it("surfaces reconnecting state when live updates drop", () => {
    expect(
      resolveOnlineDuelLiveStatus({
        duelId: "DUEL123",
        transportSource: "backend",
        transportIssue: "event_stream_error",
        matchStatus: "planning",
        joinedCount: 2,
        playerConnected: true,
        opponentConnected: true,
      })
    ).toEqual({
      tone: "warning",
      badge: "Reconnecting",
      message: "Live updates dropped for a moment. The fight is trying to resync your room now.",
    });
  });

  it("surfaces displaced session as a hard stop", () => {
    expect(
      resolveOnlineDuelLiveStatus({
        duelId: "DUEL123",
        transportSource: "backend",
        transportIssue: "displaced_session",
        matchStatus: "planning",
        joinedCount: 2,
        playerConnected: true,
        opponentConnected: true,
      })
    ).toEqual({
      tone: "danger",
      badge: "Session replaced",
      message: "This fighter was opened in a newer session. Rejoin the match from the latest window to continue.",
    });
  });

  it("surfaces opponent disconnect from live participant state", () => {
    expect(
      resolveOnlineDuelLiveStatus({
        duelId: "DUEL123",
        transportSource: "backend",
        transportIssue: null,
        matchStatus: "planning",
        joinedCount: 2,
        playerConnected: true,
        opponentConnected: false,
      })
    ).toEqual({
      tone: "warning",
      badge: "Opponent disconnected",
      message: "Your opponent stepped out of the live room. Their seat can resume the same fight when they reconnect.",
    });
  });

  it("returns leave CTA for displaced or closed sessions", () => {
    expect(
      resolveOnlineDuelRecoveryAction({
        transportIssue: "displaced_session",
        matchStatus: "planning",
        playerConnected: true,
        opponentConnected: true,
        joinedCount: 2,
      })
    ).toEqual({
      kind: "leave",
      label: "Leave Fight",
    });
  });

  it("returns refresh CTA when room sync should recover", () => {
    expect(
      resolveOnlineDuelRecoveryAction({
        transportIssue: "event_stream_error",
        matchStatus: "planning",
        playerConnected: true,
        opponentConnected: true,
        joinedCount: 2,
      })
    ).toEqual({
      kind: "refresh",
      label: "Refresh Room",
    });
  });

  it("marks battle status as opponent offline when the rival disconnects", () => {
    expect(
      getMatchStatusSummary({
        duelId: "DUEL123",
        status: "planning",
        joinedCount: 2,
        readyCount: 1,
        winnerName: null,
        transportIssue: null,
        opponentConnected: false,
      })
    ).toEqual({
      badge: "Opponent offline",
      message: "Your opponent left the live room for now. Stay here if you want to wait for their reconnect.",
    });
  });

  it("marks battle status as session replaced when displaced", () => {
    expect(
      getMatchStatusSummary({
        duelId: "DUEL123",
        status: "planning",
        joinedCount: 2,
        readyCount: 2,
        winnerName: null,
        transportIssue: "displaced_session",
        opponentConnected: true,
      })
    ).toEqual({
      badge: "Session replaced",
      message: "This fighter is now controlled by a newer session. Leave this screen and continue from the latest one.",
    });
  });

  it("marks matchmaking as timed out when the queue stays empty too long", () => {
    expect(
      resolveOnlineDuelMatchmakingStatus({
        matchmakingMode: true,
        searchActive: true,
        duelId: "DUEL123",
        joinedCount: 1,
        status: "waiting_for_players",
        timedOut: true,
      })
    ).toEqual({
      tone: "warning",
      badge: "Search timeout",
      message: "No rival joined in time. You can stop searching now or keep this queue open a bit longer.",
    });
  });

  it("marks matchmaking as paused when the player stops searching", () => {
    expect(
      resolveOnlineDuelMatchmakingStatus({
        matchmakingMode: true,
        searchActive: false,
        duelId: null,
        joinedCount: 0,
        status: undefined,
        timedOut: false,
      })
    ).toEqual({
      tone: "warning",
      badge: "Search paused",
      message: "Matchmaking is paused. Start the search again when you want to look for a live rival.",
    });
  });
});
