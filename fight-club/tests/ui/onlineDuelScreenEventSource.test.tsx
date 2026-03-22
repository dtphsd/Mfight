import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
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
    round = 1,
    winnerSeat = null,
    combatState,
    yourLoadout,
    opponentLoadout,
    yourSnapshot,
    opponentSnapshot,
  }: {
    duelId: string;
    roomCode: string;
    revision: number;
    yourSeat: "playerA" | "playerB";
    resumeToken: string;
    participants: OnlineDuelStateSync["participants"];
    status?: OnlineDuelStateSync["status"];
    round?: number;
    winnerSeat?: OnlineDuelStateSync["winnerSeat"];
    combatState?: OnlineDuelStateSync["combatState"];
    yourLoadout?: OnlineDuelStateSync["yourLoadout"];
    opponentLoadout?: OnlineDuelStateSync["opponentLoadout"];
    yourSnapshot?: OnlineDuelStateSync["yourSnapshot"];
    opponentSnapshot?: OnlineDuelStateSync["opponentSnapshot"];
  }): OnlineDuelStateSync {
    return {
      duelId,
      roomCode,
      revision,
      status,
      round,
      winnerSeat,
      yourSeat,
      resumeToken,
      ...(yourLoadout ? { yourLoadout } : {}),
      ...(opponentLoadout ? { opponentLoadout } : {}),
      participants,
      ...(yourSnapshot ? { yourSnapshot } : {}),
      ...(opponentSnapshot ? { opponentSnapshot } : {}),
      ...(combatState ? { combatState } : {}),
    };
  }

  function createCombatState({
    playerId = "player-host",
    opponentId = "player-guest",
    playerCurrentHp = 124,
    opponentCurrentHp = 124,
    playerResources = { rage: 0, guard: 0, momentum: 0, focus: 0 },
    opponentResources = { rage: 0, guard: 0, momentum: 0, focus: 0 },
  }: {
    playerId?: string;
    opponentId?: string;
    playerCurrentHp?: number;
    opponentCurrentHp?: number;
    playerResources?: { rage: number; guard: number; momentum: number; focus: number };
    opponentResources?: { rage: number; guard: number; momentum: number; focus: number };
  }): NonNullable<OnlineDuelStateSync["combatState"]> {
    return {
      status: "active",
      round: 1,
      winnerId: null,
      combatants: [
        {
          id: playerId,
          name: "Lobby Hero",
          currentHp: playerCurrentHp,
          maxHp: 124,
          resources: playerResources,
          activeEffects: [],
          skillCooldowns: {},
        },
        {
          id: opponentId,
          name: "Remote Rival",
          currentHp: opponentCurrentHp,
          maxHp: 124,
          resources: opponentResources,
          activeEffects: [],
          skillCooldowns: {},
        },
      ],
      log: [],
    } as unknown as NonNullable<OnlineDuelStateSync["combatState"]>;
  }

  function jsonResponse(messages: OnlineDuelServerMessage[]) {
    return Promise.resolve({
      ok: true,
      json: async () => ({ messages }),
    } as Response);
  }

  function createSkillLoadout(skillName: string, ownerName: string) {
    const inventory = createStarterInventory();
    const skillEntry =
      inventory.entries.find((entry) => entry.item.skills?.some((skill) => skill.name === skillName) && entry.item.equip) ??
      inventory.entries.find((entry) => entry.item.skills?.length && entry.item.equip) ??
      null;

    if (!skillEntry?.item.skills?.length || !skillEntry.item.equip) {
      throw new Error(`missing_skill_entry:${ownerName}`);
    }

    const equipmentState = createEquipment();
    equipmentState.slots[skillEntry.item.equip.slot] = skillEntry.item.code;

    return {
      equipmentState,
      inventory,
      equippedSkillIds: [skillEntry.item.skills[0]!.id],
      skillName: skillEntry.item.skills[0]!.name,
      equipment: [{ slot: skillEntry.item.equip.slot, item: skillEntry.item }],
    };
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

  it("keeps the freshest revision when a stale sync arrives later over SSE", async () => {
    const duelId = "duel-stale-1";
    const roomCode = "SYNC11";
    const preparedPlayer = createPreparedFighter("Lobby Hero");
    const rivalFighter = createPreparedFighter("Remote Rival");

    globalThis.fetch = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
      if (url.endsWith("/health")) {
        return {
          ok: true,
          json: async () => ({}),
        } as Response;
      }

      const message = JSON.parse(String(init?.body ?? "{}")) as OnlineDuelClientMessage;

      if (message.type === "create_duel" || message.type === "request_duel_sync") {
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

      throw new Error(`unexpected_message:${message.type}`);
    }) as typeof fetch;

    render(
      <OnlineDuelScreen
        onBack={() => {}}
        initialEntryMode="create"
        preparedPlayer={preparedPlayer}
      />
    );

    await waitFor(() => {
      expect(MockEventSource.instances).toHaveLength(1);
    });

    const hostStream = MockEventSource.instances[0];

    await act(async () => {
      hostStream.emitOpen();
      hostStream.emitMessage({
        type: "duel_state_sync",
        payload: createSync({
          duelId,
          roomCode,
          revision: 3,
          yourSeat: "playerA",
          resumeToken: "resume-host",
          status: "planning",
          yourSnapshot: preparedPlayer.snapshot,
          opponentSnapshot: rivalFighter.snapshot,
          participants: [
            {
              seat: "playerA",
              displayName: "Lobby Hero",
              connected: true,
              ready: true,
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

    await act(async () => {
      hostStream.emitMessage({
        type: "duel_state_sync",
        payload: createSync({
          duelId,
          roomCode,
          revision: 2,
          yourSeat: "playerA",
          resumeToken: "resume-host",
          status: "waiting_for_players",
          yourSnapshot: preparedPlayer.snapshot,
          opponentSnapshot: rivalFighter.snapshot,
          participants: [
            {
              seat: "playerA",
              displayName: "Lobby Hero",
              connected: true,
              ready: false,
            },
            {
              seat: "playerB",
              displayName: "Stale Rival",
              connected: false,
              ready: false,
            },
          ],
        }),
      });
    });

    await waitFor(() => {
      expect(screen.queryByText("Waiting for rival")).toBeNull();
    });
  });

  it("renders live opponent resources from synced combat state", async () => {
    const duelId = "duel-resources-1";
    const roomCode = "RES777";
    const preparedPlayer = createPreparedFighter("Lobby Hero");
    const rivalFighter = createPreparedFighter("Remote Rival");

    globalThis.fetch = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
      if (url.endsWith("/health")) {
        return {
          ok: true,
          json: async () => ({}),
        } as Response;
      }

      const message = JSON.parse(String(init?.body ?? "{}")) as OnlineDuelClientMessage;

      if (message.type === "create_duel" || message.type === "request_duel_sync") {
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
              status: "planning",
              yourSnapshot: preparedPlayer.snapshot,
              opponentSnapshot: rivalFighter.snapshot,
              participants: [
                {
                  seat: "playerA",
                  displayName: "Lobby Hero",
                  connected: true,
                  ready: true,
                },
                {
                  seat: "playerB",
                  displayName: "Remote Rival",
                  connected: true,
                  ready: true,
                },
              ],
              combatState: createCombatState({
                playerId: preparedPlayer.snapshot.characterId,
                opponentId: rivalFighter.snapshot.characterId,
                opponentResources: { rage: 2, guard: 1, momentum: 4, focus: 0 },
              }),
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
        preparedPlayer={preparedPlayer}
      />
    );

    await waitFor(() => {
      expect(screen.getByTitle("Rage: 2")).toBeTruthy();
      expect(screen.getByTitle("Guard: 1")).toBeTruthy();
      expect(screen.getByTitle("Momentum: 4")).toBeTruthy();
      expect(screen.getAllByTitle("Focus: 0").length).toBeGreaterThan(0);
    });
  });

  it("opens the profile modal and shows finished-match winner text from synced state", async () => {
    const duelId = "duel-profile-1";
    const roomCode = "WIN321";
    const preparedPlayer = createPreparedFighter("Lobby Hero");
    const rivalFighter = createPreparedFighter("Remote Rival");

    globalThis.fetch = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
      if (url.endsWith("/health")) {
        return {
          ok: true,
          json: async () => ({}),
        } as Response;
      }

      const message = JSON.parse(String(init?.body ?? "{}")) as OnlineDuelClientMessage;

      if (message.type === "create_duel" || message.type === "request_duel_sync") {
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
              revision: 5,
              yourSeat: "playerA",
              resumeToken: "resume-host",
              status: "finished",
              round: 3,
              winnerSeat: "playerB",
              yourSnapshot: preparedPlayer.snapshot,
              opponentSnapshot: rivalFighter.snapshot,
              participants: [
                {
                  seat: "playerA",
                  displayName: "Lobby Hero",
                  connected: true,
                  ready: true,
                },
                {
                  seat: "playerB",
                  displayName: "Remote Rival",
                  connected: true,
                  ready: true,
                },
              ],
              combatState: createCombatState({
                playerId: preparedPlayer.snapshot.characterId,
                opponentId: rivalFighter.snapshot.characterId,
                playerCurrentHp: 0,
                opponentCurrentHp: 42,
              }),
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
        preparedPlayer={preparedPlayer}
      />
    );

    await waitFor(() => {
      expect(screen.getAllByText("Fight Complete").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Match over").length).toBeGreaterThan(0);
    });

    fireEvent.click(screen.getAllByRole("button", { name: "Open character profile" })[1]);

    await waitFor(() => {
      expect(screen.getByLabelText("Close profile modal")).toBeTruthy();
      expect(screen.getByText("Loadout")).toBeTruthy();
    });
  });

  it("shows opponent profile skills from synced opponent loadout instead of local fallback build", async () => {
    const duelId = "duel-opponent-loadout-1";
    const roomCode = "TRUTH14";
    const preparedPlayer = createPreparedFighter("Lobby Hero");
    const rivalFighter = createPreparedFighter("Remote Rival");
    const rivalLoadout = createSkillLoadout("Killer Focus", "Remote Rival");

    globalThis.fetch = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
      if (url.endsWith("/health")) {
        return {
          ok: true,
          json: async () => ({}),
        } as Response;
      }

      const message = JSON.parse(String(init?.body ?? "{}")) as OnlineDuelClientMessage;

      if (message.type === "create_duel" || message.type === "request_duel_sync") {
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
              revision: 3,
              yourSeat: "playerA",
              resumeToken: "resume-host",
              status: "planning",
              yourSnapshot: preparedPlayer.snapshot,
              opponentLoadout: {
                equipmentState: rivalLoadout.equipmentState,
                inventory: rivalLoadout.inventory,
                equippedSkillIds: rivalLoadout.equippedSkillIds,
              },
              opponentSnapshot: rivalFighter.snapshot,
              participants: [
                {
                  seat: "playerA",
                  displayName: "Lobby Hero",
                  connected: true,
                  ready: true,
                },
                {
                  seat: "playerB",
                  displayName: "Remote Rival",
                  connected: true,
                  ready: true,
                  fighterView: {
                    figure: "vermin-tek",
                    equipment: rivalLoadout.equipment,
                  },
                },
              ],
              combatState: createCombatState({
                playerId: preparedPlayer.snapshot.characterId,
                opponentId: rivalFighter.snapshot.characterId,
              }),
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
        preparedPlayer={preparedPlayer}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Remote Rival")).toBeTruthy();
    });

    fireEvent.click(screen.getAllByRole("button", { name: "Open character profile" })[1]);

    await waitFor(() => {
      expect(screen.getByText("Loadout")).toBeTruthy();
      expect(screen.getByText(rivalLoadout.skillName)).toBeTruthy();
    });
  });
});
