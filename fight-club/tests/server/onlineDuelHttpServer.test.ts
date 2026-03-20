// @vitest-environment node

import { get } from "node:http";
import { afterEach, describe, expect, it } from "vitest";
import { createCharacter } from "@/modules/character";
import { createBasicAttackAction } from "@/modules/combat";
import { buildCombatSnapshot } from "@/orchestration/combat/buildCombatSnapshot";
import { startOnlineDuelHttpServer, type OnlineDuelHttpServerHandle } from "../../server/onlineDuelHttpServer";

describe("online duel http server", () => {
  const runningServers: OnlineDuelHttpServerHandle[] = [];

  afterEach(async () => {
    while (runningServers.length > 0) {
      const server = runningServers.pop();
      if (!server) {
        continue;
      }

      await server.close();
    }
  });

  function createSnapshot(name: string) {
    const character = createCharacter(name);
    if (!character.success) {
      throw new Error("character creation failed");
    }

    return buildCombatSnapshot({
      character: character.data,
      flatBonuses: [],
      percentBonuses: [],
    });
  }

  async function startServer() {
    const server = await startOnlineDuelHttpServer({
      port: 0,
      host: "127.0.0.1",
      seed: 9,
      staleSweepIntervalMs: 1_000,
    });
    runningServers.push(server);
    return server;
  }

  function createBaseUrl(server: OnlineDuelHttpServerHandle) {
    return `http://${server.host}:${server.port}`;
  }

  it("responds to health checks", async () => {
    const server = await startServer();
    const response = await fetch(`${createBaseUrl(server)}/health`);

    expect(response.status).toBe(200);
    expect(response.headers.get("access-control-allow-origin")).toBe("*");
    await expect(response.json()).resolves.toEqual({
      status: "ok",
      transport: "http",
    });
  });

  it("creates a room and joins it by room code over HTTP", async () => {
    const server = await startServer();
    const alpha = createSnapshot("Alpha");
    const beta = createSnapshot("Beta");

    const createResponse = await fetch(`${createBaseUrl(server)}/api/online-duel/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "create_duel",
        playerId: "player-alpha",
        sessionId: "session-alpha",
        displayName: "Alpha",
        snapshot: alpha,
      }),
    });

    expect(createResponse.status).toBe(200);
    const createPayload = (await createResponse.json()) as {
      messages: Array<Record<string, unknown>>;
    };

    expect(createPayload.messages[0]).toMatchObject({
      type: "duel_created",
      duelId: expect.any(String),
      roomCode: expect.any(String),
      yourSeat: "playerA",
    });

    const created = createPayload.messages[0];
    if (
      created?.type !== "duel_created" ||
      typeof created.roomCode !== "string" ||
      typeof created.duelId !== "string"
    ) {
      throw new Error("room was not created");
    }

    const joinResponse = await fetch(`${createBaseUrl(server)}/api/online-duel/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "join_duel_by_code",
        roomCode: created.roomCode,
        playerId: "player-beta",
        sessionId: "session-beta",
        displayName: "Beta",
        snapshot: beta,
      }),
    });

    expect(joinResponse.status).toBe(200);
    await expect(joinResponse.json()).resolves.toEqual({
      messages: [
        {
          type: "duel_state_sync",
          payload: {
            duelId: created.duelId,
            roomCode: created.roomCode,
            revision: 2,
            status: "lobby",
            round: 1,
            winnerSeat: null,
            yourSeat: "playerB",
            resumeToken: expect.any(String),
            participants: [
              { seat: "playerA", displayName: "Alpha", connected: true, ready: false },
              { seat: "playerB", displayName: "Beta", connected: true, ready: false },
            ],
          },
        },
      ],
    });
  });

  it("rejects malformed online duel messages", async () => {
    const server = await startServer();
    const response = await fetch(`${createBaseUrl(server)}/api/online-duel/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "set_ready",
        duelId: "duel-1",
      }),
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "invalid_online_duel_message",
    });
  });

  it("pushes duel sync updates over the event stream", async () => {
    const server = await startServer();
    const alpha = createSnapshot("Alpha");
    const beta = createSnapshot("Beta");

    const createResponse = await fetch(`${createBaseUrl(server)}/api/online-duel/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "create_duel",
        playerId: "player-alpha",
        sessionId: "session-alpha",
        displayName: "Alpha",
        snapshot: alpha,
      }),
    });
    const createPayload = (await createResponse.json()) as {
      messages: Array<Record<string, unknown>>;
    };
    const createdSync = createPayload.messages[1] as
      | {
          type?: string;
          payload?: { resumeToken?: string };
        }
      | undefined;
    const created = createPayload.messages[0];
    if (
      created?.type !== "duel_created" ||
      createdSync?.type !== "duel_state_sync" ||
      typeof created.duelId !== "string" ||
      typeof created.roomCode !== "string" ||
      typeof createdSync.payload?.resumeToken !== "string"
    ) {
      throw new Error("room was not created");
    }

    const eventStream = await openEventStream(
      `${createBaseUrl(server)}/api/online-duel/events?duelId=${created.duelId}&playerId=player-alpha&resumeToken=${createdSync.payload.resumeToken}`
    );
    expect(eventStream.statusCode).toBe(200);
    expect(eventStream.contentType).toContain("text/event-stream");

    const initialEvent = await eventStream.readMessage();
    expect(initialEvent.message).toMatchObject({
      type: "duel_state_sync",
      payload: {
        duelId: created.duelId,
        roomCode: created.roomCode,
        revision: 1,
        yourSeat: "playerA",
        resumeToken: createdSync.payload.resumeToken,
      },
    });

    await fetch(`${createBaseUrl(server)}/api/online-duel/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "join_duel_by_code",
        roomCode: created.roomCode,
        playerId: "player-beta",
        sessionId: "session-beta",
        displayName: "Beta",
        snapshot: beta,
      }),
    });

    const pushedEvent = await eventStream.readMessage();
    expect(pushedEvent.message).toMatchObject({
      type: "duel_state_sync",
      payload: {
        duelId: created.duelId,
        roomCode: created.roomCode,
        revision: 2,
        status: "lobby",
        yourSeat: "playerA",
        participants: [
          { seat: "playerA", displayName: "Alpha", connected: true, ready: false },
          { seat: "playerB", displayName: "Beta", connected: true, ready: false },
        ],
      },
    });

    eventStream.close();
  }, 15_000);

  it("includes per-seat round submission state in sync after one action is locked", async () => {
    const server = await startServer();
    const alpha = createSnapshot("Alpha");
    const beta = createSnapshot("Beta");

    const createResponse = await fetch(`${createBaseUrl(server)}/api/online-duel/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "create_duel",
        playerId: "player-alpha",
        sessionId: "session-alpha",
        displayName: "Alpha",
        snapshot: alpha,
      }),
    });
    const createPayload = (await createResponse.json()) as {
      messages: Array<Record<string, unknown>>;
    };
    const created = createPayload.messages[0];
    if (
      created?.type !== "duel_created" ||
      typeof created.duelId !== "string" ||
      typeof created.roomCode !== "string"
    ) {
      throw new Error("room was not created");
    }

    await fetch(`${createBaseUrl(server)}/api/online-duel/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "join_duel_by_code",
        roomCode: created.roomCode,
        playerId: "player-beta",
        sessionId: "session-beta",
        displayName: "Beta",
        snapshot: beta,
      }),
    });

    await fetch(`${createBaseUrl(server)}/api/online-duel/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "set_ready",
        duelId: created.duelId,
        seat: "playerA",
        playerId: "player-alpha",
        sessionId: "session-alpha",
        ready: true,
      }),
    });
    await fetch(`${createBaseUrl(server)}/api/online-duel/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "set_ready",
        duelId: created.duelId,
        seat: "playerB",
        playerId: "player-beta",
        sessionId: "session-beta",
        ready: true,
      }),
    });

    const firstSubmitResponse = await fetch(`${createBaseUrl(server)}/api/online-duel/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "submit_round_action",
        duelId: created.duelId,
        seat: "playerA",
        playerId: "player-alpha",
        sessionId: "session-alpha",
        action: createBasicAttackAction({
          attackerId: alpha.characterId,
          attackZone: "head",
          defenseZones: ["chest", "belly"],
        }),
      }),
    });

    const firstSubmitPayload = (await firstSubmitResponse.json()) as {
      messages: Array<Record<string, unknown>>;
    };

    expect(firstSubmitPayload.messages).toContainEqual({
      type: "duel_state_sync",
      payload: {
        duelId: created.duelId,
        roomCode: created.roomCode,
        revision: 5,
        status: "planning",
        round: 1,
        winnerSeat: null,
        yourSeat: "playerA",
        resumeToken: expect.any(String),
        participants: [
          { seat: "playerA", displayName: "Alpha", connected: true, ready: true },
          { seat: "playerB", displayName: "Beta", connected: true, ready: true },
        ],
        currentRoundState: {
          round: 1,
          submittedSeats: ["playerA"],
          yourActionSubmitted: true,
          opponentActionSubmitted: false,
          readyToResolve: false,
        },
      },
    });
  }, 15_000);

  it("replays the latest duel sync when a player reattaches to the event stream", async () => {
    const server = await startServer();
    const alpha = createSnapshot("Alpha");
    const beta = createSnapshot("Beta");

    const createResponse = await fetch(`${createBaseUrl(server)}/api/online-duel/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "create_duel",
        playerId: "player-alpha",
        sessionId: "session-alpha",
        displayName: "Alpha",
        snapshot: alpha,
      }),
    });
    const createPayload = (await createResponse.json()) as {
      messages: Array<Record<string, unknown>>;
    };
    const createdSync = createPayload.messages[1] as
      | {
          type?: string;
          payload?: { resumeToken?: string };
        }
      | undefined;
    const created = createPayload.messages[0];
    if (
      created?.type !== "duel_created" ||
      createdSync?.type !== "duel_state_sync" ||
      typeof created.duelId !== "string" ||
      typeof created.roomCode !== "string" ||
      typeof createdSync.payload?.resumeToken !== "string"
    ) {
      throw new Error("room was not created");
    }

    await fetch(`${createBaseUrl(server)}/api/online-duel/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "join_duel_by_code",
        roomCode: created.roomCode,
        playerId: "player-beta",
        sessionId: "session-beta",
        displayName: "Beta",
        snapshot: beta,
      }),
    });

    const reattachedStream = await openEventStream(
      `${createBaseUrl(server)}/api/online-duel/events?duelId=${created.duelId}&playerId=player-alpha&resumeToken=${createdSync.payload.resumeToken}`
    );
    expect(reattachedStream.statusCode).toBe(200);

    const resumedEvent = await reattachedStream.readMessage();
    expect(resumedEvent.message).toMatchObject({
      type: "duel_state_sync",
      payload: {
        duelId: created.duelId,
        roomCode: created.roomCode,
        revision: 2,
        status: "lobby",
        yourSeat: "playerA",
        resumeToken: createdSync.payload.resumeToken,
        participants: [
          { seat: "playerA", displayName: "Alpha", connected: true, ready: false },
          { seat: "playerB", displayName: "Beta", connected: true, ready: false },
        ],
      },
    });

    reattachedStream.close();
  }, 15_000);

  it("replays missed room events when the client reconnects with an event cursor", async () => {
    const server = await startServer();
    const alpha = createSnapshot("Alpha");
    const beta = createSnapshot("Beta");

    const createResponse = await fetch(`${createBaseUrl(server)}/api/online-duel/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "create_duel",
        playerId: "player-alpha",
        sessionId: "session-alpha",
        displayName: "Alpha",
        snapshot: alpha,
      }),
    });
    const createPayload = (await createResponse.json()) as {
      messages: Array<Record<string, unknown>>;
    };
    const createdSync = createPayload.messages[1] as
      | {
          type?: string;
          payload?: { resumeToken?: string };
        }
      | undefined;
    const created = createPayload.messages[0];
    if (
      created?.type !== "duel_created" ||
      createdSync?.type !== "duel_state_sync" ||
      typeof created.duelId !== "string" ||
      typeof created.roomCode !== "string" ||
      typeof createdSync.payload?.resumeToken !== "string"
    ) {
      throw new Error("room was not created");
    }

    const initialStream = await openEventStream(
      `${createBaseUrl(server)}/api/online-duel/events?duelId=${created.duelId}&playerId=player-alpha&resumeToken=${createdSync.payload.resumeToken}`
    );
    const firstEvent = await initialStream.readMessage();
    expect(firstEvent.message).toMatchObject({
      type: "duel_state_sync",
      payload: {
        revision: 1,
      },
    });
    initialStream.close();

    await fetch(`${createBaseUrl(server)}/api/online-duel/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "join_duel_by_code",
        roomCode: created.roomCode,
        playerId: "player-beta",
        sessionId: "session-beta",
        displayName: "Beta",
        snapshot: beta,
      }),
    });

    const replayStream = await openEventStream(
      `${createBaseUrl(server)}/api/online-duel/events?duelId=${created.duelId}&playerId=player-alpha&resumeToken=${createdSync.payload.resumeToken}&afterEventId=${firstEvent.eventId ?? ""}`
    );
    const replayedEvent = await replayStream.readMessage();
    expect(replayedEvent.eventId).toBeTruthy();
    expect(replayedEvent.message).toMatchObject({
      type: "duel_state_sync",
      payload: {
        duelId: created.duelId,
        roomCode: created.roomCode,
        revision: 2,
        yourSeat: "playerA",
      },
    });

    replayStream.close();
  }, 15_000);

  it("replays round lifecycle events after reconnect, not only the final sync", async () => {
    const server = await startServer();
    const alpha = createSnapshot("Alpha");
    const beta = createSnapshot("Beta");

    const createResponse = await fetch(`${createBaseUrl(server)}/api/online-duel/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "create_duel",
        playerId: "player-alpha",
        sessionId: "session-alpha",
        displayName: "Alpha",
        snapshot: alpha,
      }),
    });
    const createPayload = (await createResponse.json()) as {
      messages: Array<Record<string, unknown>>;
    };
    const createdSync = createPayload.messages[1] as
      | {
          type?: string;
          payload?: { resumeToken?: string };
        }
      | undefined;
    const created = createPayload.messages[0];
    if (
      created?.type !== "duel_created" ||
      createdSync?.type !== "duel_state_sync" ||
      typeof created.duelId !== "string" ||
      typeof created.roomCode !== "string" ||
      typeof createdSync.payload?.resumeToken !== "string"
    ) {
      throw new Error("room was not created");
    }

    await fetch(`${createBaseUrl(server)}/api/online-duel/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "join_duel_by_code",
        roomCode: created.roomCode,
        playerId: "player-beta",
        sessionId: "session-beta",
        displayName: "Beta",
        snapshot: beta,
      }),
    });

    const baselineStream = await openEventStream(
      `${createBaseUrl(server)}/api/online-duel/events?duelId=${created.duelId}&playerId=player-alpha&resumeToken=${createdSync.payload.resumeToken}`
    );
    const baselineEvent = await baselineStream.readMessage();
    baselineStream.close();

    await fetch(`${createBaseUrl(server)}/api/online-duel/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "set_ready",
        duelId: created.duelId,
        seat: "playerA",
        playerId: "player-alpha",
        sessionId: "session-alpha",
        ready: true,
      }),
    });
    await fetch(`${createBaseUrl(server)}/api/online-duel/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "set_ready",
        duelId: created.duelId,
        seat: "playerB",
        playerId: "player-beta",
        sessionId: "session-beta",
        ready: true,
      }),
    });
    await fetch(`${createBaseUrl(server)}/api/online-duel/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "submit_round_action",
        duelId: created.duelId,
        seat: "playerA",
        playerId: "player-alpha",
        sessionId: "session-alpha",
        action: createBasicAttackAction({
          attackerId: alpha.characterId,
          attackZone: "head",
          defenseZones: ["chest", "belly"],
        }),
      }),
    });
    await fetch(`${createBaseUrl(server)}/api/online-duel/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "submit_round_action",
        duelId: created.duelId,
        seat: "playerB",
        playerId: "player-beta",
        sessionId: "session-beta",
        action: createBasicAttackAction({
          attackerId: beta.characterId,
          attackZone: "legs",
          defenseZones: ["head", "waist"],
        }),
      }),
    });

    const replayStream = await openEventStream(
      `${createBaseUrl(server)}/api/online-duel/events?duelId=${created.duelId}&playerId=player-alpha&resumeToken=${createdSync.payload.resumeToken}&afterEventId=${baselineEvent.eventId ?? ""}`
    );
    const replayedMessages = await readUntilMessages(
      replayStream,
      (events) => {
        const latestSync = [...events]
          .reverse()
          .find(
            (
              event
            ): event is { eventId?: string; message: { type: "duel_state_sync"; payload: { round?: number } } } =>
              event.message.type === "duel_state_sync"
          );
        return (
          events.some((event) => event.message.type === "round_ready") &&
          events.some((event) => event.message.type === "round_resolved") &&
          latestSync?.message.type === "duel_state_sync" &&
          latestSync.message.payload?.round === 2
        );
      },
      10_000
    );
    const replayedTypes = replayedMessages.map((event) => event.message.type);

    expect(replayedTypes).toContain("round_ready");
    expect(replayedTypes).toContain("round_resolved");
    const latestSync = [...replayedMessages]
      .reverse()
      .find((event): event is { eventId?: string; message: { type: "duel_state_sync"; payload: { round?: number } } } =>
        event.message.type === "duel_state_sync"
      );
    expect(latestSync?.message).toMatchObject({
      type: "duel_state_sync",
      payload: {
        duelId: created.duelId,
        round: 2,
        yourSeat: "playerA",
      },
    });

    replayStream.close();
  }, 15_000);

  it("resets an abandoned room into a fresh lobby through the rematch endpoint", async () => {
    const server = await startServer();
    const alpha = createSnapshot("Alpha");
    const beta = createSnapshot("Beta");

    const createResponse = await fetch(`${createBaseUrl(server)}/api/online-duel/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "create_duel",
        playerId: "player-alpha",
        sessionId: "session-alpha",
        displayName: "Alpha",
        snapshot: alpha,
      }),
    });
    const createPayload = (await createResponse.json()) as {
      messages: Array<Record<string, unknown>>;
    };
    const created = createPayload.messages[0];
    if (
      created?.type !== "duel_created" ||
      typeof created.duelId !== "string" ||
      typeof created.roomCode !== "string"
    ) {
      throw new Error("room was not created");
    }

    await fetch(`${createBaseUrl(server)}/api/online-duel/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "join_duel_by_code",
        roomCode: created.roomCode,
        playerId: "player-beta",
        sessionId: "session-beta",
        displayName: "Beta",
        snapshot: beta,
      }),
    });

    server.authorityService.expireStaleRooms(Date.now() + 10 * 60 * 1000);

    const rematchResponse = await fetch(`${createBaseUrl(server)}/api/online-duel/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "rematch_duel",
        duelId: created.duelId,
        playerId: "player-alpha",
        sessionId: "session-alpha",
      }),
    });

    expect(rematchResponse.status).toBe(200);
    await expect(rematchResponse.json()).resolves.toEqual({
      messages: [
        {
          type: "duel_state_sync",
          payload: {
            duelId: created.duelId,
            roomCode: created.roomCode,
            revision: 3,
            status: "lobby",
            round: 1,
            winnerSeat: null,
            yourSeat: "playerA",
            resumeToken: expect.any(String),
            participants: [
              { seat: "playerA", displayName: "Alpha", connected: true, ready: false },
              { seat: "playerB", displayName: "Beta", connected: true, ready: false },
            ],
          },
        },
      ],
    });
  });

  it("abandons the room when a participant leaves through the live endpoint", async () => {
    const server = await startServer();
    const alpha = createSnapshot("Alpha");
    const beta = createSnapshot("Beta");

    const createResponse = await fetch(`${createBaseUrl(server)}/api/online-duel/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "create_duel",
        playerId: "player-alpha",
        sessionId: "session-alpha",
        displayName: "Alpha",
        snapshot: alpha,
      }),
    });
    const createPayload = (await createResponse.json()) as {
      messages: Array<Record<string, unknown>>;
    };
    const created = createPayload.messages[0];
    if (
      created?.type !== "duel_created" ||
      typeof created.duelId !== "string" ||
      typeof created.roomCode !== "string"
    ) {
      throw new Error("room was not created");
    }

    await fetch(`${createBaseUrl(server)}/api/online-duel/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "join_duel_by_code",
        roomCode: created.roomCode,
        playerId: "player-beta",
        sessionId: "session-beta",
        displayName: "Beta",
        snapshot: beta,
      }),
    });

    const leaveResponse = await fetch(`${createBaseUrl(server)}/api/online-duel/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "leave_duel",
        duelId: created.duelId,
        playerId: "player-beta",
        sessionId: "session-beta",
      }),
    });

    expect(leaveResponse.status).toBe(200);
    await expect(leaveResponse.json()).resolves.toEqual({
      messages: [
        {
          type: "duel_state_sync",
          payload: {
            duelId: created.duelId,
            roomCode: created.roomCode,
            revision: 3,
            status: "abandoned",
            round: 1,
            winnerSeat: null,
            yourSeat: "playerB",
            resumeToken: expect.any(String),
            participants: [
              { seat: "playerA", displayName: "Alpha", connected: true, ready: false },
              { seat: "playerB", displayName: "Beta", connected: false, ready: false },
            ],
          },
        },
      ],
    });
  });
});

async function openEventStream(url: string) {
  return new Promise<{
    statusCode: number;
    contentType: string;
    readMessage(): Promise<{ eventId?: string; message: Record<string, unknown> }>;
    close(): void;
  }>((resolve, reject) => {
    const request = get(url, (response) => {
      const statusCode = response.statusCode ?? 0;
      const contentType = response.headers["content-type"] ?? "";
      let buffer = "";
      const queuedMessages: Array<{ eventId?: string; message: Record<string, unknown> }> = [];
      const pendingResolvers: Array<
        (value: { eventId?: string; message: Record<string, unknown> }) => void
      > = [];

      response.setEncoding("utf8");
      response.on("data", (chunk: string) => {
        buffer += chunk;

        while (true) {
          const separatorIndex = buffer.indexOf("\n\n");
          if (separatorIndex === -1) {
            break;
          }

          const eventChunk = buffer.slice(0, separatorIndex);
          buffer = buffer.slice(separatorIndex + 2);
          const dataLine = eventChunk
            .split("\n")
            .find((line) => line.startsWith("data: "));
          if (!dataLine) {
            continue;
          }

          const eventIdLine = eventChunk
            .split("\n")
            .find((line) => line.startsWith("id: "));
          const payload = JSON.parse(dataLine.slice(6)) as Record<string, unknown>;
          const eventEnvelope = {
            eventId: eventIdLine?.slice(4),
            message: payload,
          };
          const nextResolver = pendingResolvers.shift();
          if (nextResolver) {
            nextResolver(eventEnvelope);
          } else {
            queuedMessages.push(eventEnvelope);
          }
        }
      });
      response.on("error", reject);

      resolve({
        statusCode,
        contentType: Array.isArray(contentType) ? contentType.join(", ") : contentType,
        readMessage() {
          return new Promise<{ eventId?: string; message: Record<string, unknown> }>((messageResolve) => {
            const queued = queuedMessages.shift();
            if (queued) {
              messageResolve(queued);
              return;
            }

            pendingResolvers.push(messageResolve);
          });
        },
        close() {
          response.destroy();
          request.destroy();
        },
      });
    });

    request.on("error", reject);
  });
}

async function readUntilMessages(
  stream: Awaited<ReturnType<typeof openEventStream>>,
  predicate: (messages: Array<{ eventId?: string; message: Record<string, unknown> }>) => boolean,
  timeoutMs: number
) {
  const messages: Array<{ eventId?: string; message: Record<string, unknown> }> = [];
  const timeoutAt = Date.now() + timeoutMs;

  while (Date.now() < timeoutAt) {
    const remaining = timeoutAt - Date.now();
    let nextMessage: { eventId?: string; message: Record<string, unknown> };
    try {
      nextMessage = await Promise.race([
        stream.readMessage(),
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error("event_stream_timeout")), remaining);
        }),
      ]);
    } catch {
      throw new Error(
        `event_stream_timeout:${messages.map((event) => event.message.type).join(",")}`
      );
    }
    messages.push(nextMessage);
    if (predicate(messages)) {
      return messages;
    }
  }

  throw new Error(
    `event_stream_timeout:${messages.map((event) => event.message.type).join(",")}`
  );
}
