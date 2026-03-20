import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
  OnlineDuelClientMessage,
  OnlineDuelServerMessage,
  OnlineDuelStateSync,
} from "@/modules/arena";
import { createCharacter } from "@/modules/character";
import { createEquipment } from "@/modules/equipment";
import { createStarterInventory } from "@/modules/inventory";
import { buildCombatSnapshot } from "@/orchestration/combat/buildCombatSnapshot";
import { OnlineDuelScreen } from "@/ui/screens/OnlineDuel/OnlineDuelScreen";

class MockEventSource {
  static instances: MockEventSource[] = [];

  readonly url: string;
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent<string>) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  closed = false;

  constructor(url: string | URL) {
    this.url = String(url);
    MockEventSource.instances.push(this);
  }

  close() {
    this.closed = true;
  }

  emitOpen() {
    this.onopen?.(new Event("open"));
  }

  emitMessage(message: OnlineDuelServerMessage, eventId = "evt-1") {
    this.onmessage?.({
      data: JSON.stringify(message),
      lastEventId: eventId,
    } as MessageEvent<string>);
  }

  static reset() {
    MockEventSource.instances = [];
  }
}

describe("OnlineDuelScreen EventSource integration", () => {
  const originalFetch = globalThis.fetch;
  const originalUserAgent = window.navigator.userAgent;

  beforeEach(() => {
    MockEventSource.reset();
    vi.stubGlobal("EventSource", MockEventSource);
    Object.defineProperty(window.navigator, "userAgent", {
      configurable: true,
      value: "VitestBrowser",
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    globalThis.fetch = originalFetch;
    Object.defineProperty(window.navigator, "userAgent", {
      configurable: true,
      value: originalUserAgent,
    });
    MockEventSource.reset();
  });

  function createPreparedFighter(name: string) {
    const created = createCharacter(name);
    if (!created.success) {
      throw new Error("failed to create prepared fighter");
    }

    return {
      snapshot: buildCombatSnapshot({
        character: created.data,
        flatBonuses: [],
        percentBonuses: [],
      }),
      figure: "rush-chip" as const,
      playerName: name,
      equipment: [{ slot: "mainHand" as const, item: null }],
      equipmentState: createEquipment(),
      inventory: createStarterInventory(),
      equippedSkillIds: [],
    };
  }

  function createSync({
    duelId,
    roomCode,
    revision,
    yourSeat,
    resumeToken,
    participants,
    status = "lobby",
  }: {
    duelId: string;
    roomCode: string;
    revision: number;
    yourSeat: "playerA" | "playerB";
    resumeToken: string;
    participants: OnlineDuelStateSync["participants"];
    status?: OnlineDuelStateSync["status"];
  }): OnlineDuelStateSync {
    return {
      duelId,
      roomCode,
      revision,
      status,
      round: 1,
      winnerSeat: null,
      yourSeat,
      resumeToken,
      participants,
    };
  }

  function jsonResponse(messages: OnlineDuelServerMessage[]) {
    return Promise.resolve({
      ok: true,
      json: async () => ({ messages }),
    } as Response);
  }

  it("subscribes only the host client and applies SSE state updates for lobby create flow", async () => {
    const duelId = "duel-create-1";
    const roomCode = "ABC123";
    const requestTypes: string[] = [];

    globalThis.fetch = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
      if (url.endsWith("/health")) {
        return {
          ok: true,
          json: async () => ({}),
        } as Response;
      }

      const message = JSON.parse(String(init?.body ?? "{}")) as OnlineDuelClientMessage;
      requestTypes.push(message.type);

      if (message.type === "create_duel") {
        return jsonResponse([
          {
            type: "duel_created",
            duelId,
            roomCode,
            yourSeat: "playerA",
          },
          {
            type: "duel_state_sync",
            payload: createSync({
              duelId,
              roomCode,
              revision: 1,
              yourSeat: "playerA",
              resumeToken: "resume-host",
              status: "waiting_for_players",
              participants: [
                {
                  seat: "playerA",
                  displayName: "Lobby Hero",
                  connected: true,
                  ready: false,
                },
              ],
            }),
          },
        ]);
      }

      if (message.type === "request_duel_sync") {
        return jsonResponse([
          {
            type: "duel_state_sync",
            payload: createSync({
              duelId,
              roomCode,
              revision: 1,
              yourSeat: "playerA",
              resumeToken: "resume-host",
              status: "waiting_for_players",
              participants: [
                {
                  seat: "playerA",
                  displayName: "Lobby Hero",
                  connected: true,
                  ready: false,
                },
              ],
            }),
          },
        ]);
      }

      throw new Error(`unexpected_message:${message.type}`);
    }) as typeof fetch;

    render(
      <OnlineDuelScreen
        onBack={() => {}}
        initialEntryMode="create"
        preparedPlayer={createPreparedFighter("Lobby Hero")}
      />
    );

    await waitFor(() => {
      expect(MockEventSource.instances).toHaveLength(1);
    });

    const hostStream = MockEventSource.instances[0];
    expect(hostStream?.url).toContain(`duelId=${duelId}`);
    expect(hostStream?.url).toContain("playerId=player-host");
    expect(hostStream?.url).toContain("resumeToken=resume-host");

    await act(async () => {
      hostStream.emitOpen();
    });

    await waitFor(() => {
      expect(requestTypes).toEqual(["create_duel", "request_duel_sync"]);
    });

    await act(async () => {
      hostStream.emitMessage({
        type: "duel_state_sync",
        payload: createSync({
          duelId,
          roomCode,
          revision: 2,
          yourSeat: "playerA",
          resumeToken: "resume-host",
          participants: [
            {
              seat: "playerA",
              displayName: "Lobby Hero",
              connected: true,
              ready: false,
            },
            {
              seat: "playerB",
              displayName: "Remote Rival",
              connected: true,
              ready: true,
            },
          ],
        }),
      });
    });

    await waitFor(() => {
      expect(screen.getAllByText("Remote Rival").length).toBeGreaterThan(0);
      expect(
        screen.getAllByText("Both fighters are here. Ready up to signal that you want to begin the round setup.")
          .length
      ).toBeGreaterThan(0);
    });
  });

  it("subscribes only the guest client for lobby join flow", async () => {
    const duelId = "duel-join-1";
    const roomCode = "JOIN99";
    const requestTypes: string[] = [];

    globalThis.fetch = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
      if (url.endsWith("/health")) {
        return {
          ok: true,
          json: async () => ({}),
        } as Response;
      }

      const message = JSON.parse(String(init?.body ?? "{}")) as OnlineDuelClientMessage;
      requestTypes.push(message.type);

      if (message.type === "join_duel_by_code") {
        return jsonResponse([
          {
            type: "duel_state_sync",
            payload: createSync({
              duelId,
              roomCode,
              revision: 3,
              yourSeat: "playerB",
              resumeToken: "resume-guest",
              participants: [
                {
                  seat: "playerA",
                  displayName: "Host Hero",
                  connected: true,
                  ready: true,
                },
                {
                  seat: "playerB",
                  displayName: "Guest Hero",
                  connected: true,
                  ready: false,
                },
              ],
            }),
          },
        ]);
      }

      if (message.type === "request_duel_sync") {
        return jsonResponse([
          {
            type: "duel_state_sync",
            payload: createSync({
              duelId,
              roomCode,
              revision: 3,
              yourSeat: "playerB",
              resumeToken: "resume-guest",
              participants: [
                {
                  seat: "playerA",
                  displayName: "Host Hero",
                  connected: true,
                  ready: true,
                },
                {
                  seat: "playerB",
                  displayName: "Guest Hero",
                  connected: true,
                  ready: false,
                },
              ],
            }),
          },
        ]);
      }

      throw new Error(`unexpected_message:${message.type}`);
    }) as typeof fetch;

    render(
      <OnlineDuelScreen
        onBack={() => {}}
        initialEntryMode="join"
        initialJoinCode={roomCode}
        preparedPlayer={createPreparedFighter("Guest Hero")}
      />
    );

    await waitFor(() => {
      expect(MockEventSource.instances).toHaveLength(1);
    });

    const guestStream = MockEventSource.instances[0];
    expect(guestStream?.url).toContain(`duelId=${duelId}`);
    expect(guestStream?.url).toContain("playerId=player-guest");
    expect(guestStream?.url).toContain("resumeToken=resume-guest");

    await act(async () => {
      guestStream.emitOpen();
    });

    await waitFor(() => {
      expect(requestTypes).toEqual(["join_duel_by_code", "request_duel_sync"]);
    });
  });
});
