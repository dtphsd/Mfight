// @vitest-environment node

import { get } from "node:http";
import { afterEach, describe, expect, it } from "vitest";
import type {
  OnlineDuelActionSelection,
  OnlineDuelStateSync,
} from "@/modules/arena/contracts/arenaPublicApi";
import { createCharacter } from "@/modules/character";
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

  function createBasicSelection(
    attackZone: "head" | "chest" | "belly" | "legs" | "waist",
    defenseZones: [
      "head" | "chest" | "belly" | "legs" | "waist",
      "head" | "chest" | "belly" | "legs" | "waist",
    ]
  ): OnlineDuelActionSelection {
    return {
      attackZone,
      defenseZones,
      intent: "neutral",
      selectedAction: { kind: "basic_attack" },
    };
  }

  function isSyncEnvelope(
    event: { eventId?: string; message: Record<string, unknown> }
  ): event is {
    eventId?: string;
    message: { type: "duel_state_sync"; payload: OnlineDuelStateSync };
  } {
    return event.message.type === "duel_state_sync";
  }

  it("responds to health checks", async () => {
    const server = await startServer();
    const response = await fetch(`${createBaseUrl(server)}/health`);

    expect(response.status).toBe(200);
    expect(response.headers.get("access-control-allow-origin")).toBe("*");
    await expect(response.json()).resolves.toMatchObject({
      status: "ok",
      transport: "http",
      uptimeMs: expect.any(Number),
      rooms: {
        subscribed: 0,
        trackedEventStreams: 0,
        replayBuffers: 0,
      },
      config: {
        deployProfile: "default",
        staleSweepIntervalMs: 1_000,
        bodyLimitBytes: 262144,
        corsOrigin: "*",
        rateLimitWindowMs: 10_000,
        messageRateLimitMax: 60,
        eventRateLimitMax: 20,
        trustProxy: false,
      },
    });
  });

  it("respects custom cors origin and body limit options", async () => {
    const server = await startOnlineDuelHttpServer({
      port: 0,
      host: "127.0.0.1",
      seed: 9,
      staleSweepIntervalMs: 1_000,
      corsOrigin: "https://duel.example",
      bodyLimitBytes: 64,
      logLevel: "silent",
    });
    runningServers.push(server);

    const healthResponse = await fetch(`${createBaseUrl(server)}/health`);
    expect(healthResponse.headers.get("access-control-allow-origin")).toBe("https://duel.example");
    await expect(healthResponse.json()).resolves.toMatchObject({
      config: {
        deployProfile: "default",
        bodyLimitBytes: 64,
        corsOrigin: "https://duel.example",
        trustProxy: false,
      },
    });

    const createResponse = await fetch(`${createBaseUrl(server)}/api/online-duel/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "create_duel",
        playerId: "player-alpha",
        sessionId: "session-alpha",
        displayName: "Alpha With A Very Long Name That Blows Past The Tiny Test Body Limit",
        snapshot: createSnapshot("Alpha"),
      }),
    });

    expect(createResponse.status).toBe(413);
    await expect(createResponse.json()).resolves.toEqual({
      error: "request_body_too_large",
    });
  });

  it("rate limits message spam per client", async () => {
    const server = await startOnlineDuelHttpServer({
      port: 0,
      host: "127.0.0.1",
      seed: 9,
      staleSweepIntervalMs: 1_000,
      messageRateLimitMax: 1,
      rateLimitWindowMs: 60_000,
      logLevel: "silent",
    });
    runningServers.push(server);

    const payload = {
      type: "request_duel_sync",
      duelId: "duel-missing",
    };

    const firstResponse = await fetch(`${createBaseUrl(server)}/api/online-duel/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Forwarded-For": "203.0.113.10",
      },
      body: JSON.stringify(payload),
    });
    expect(firstResponse.status).toBe(200);

    const secondResponse = await fetch(`${createBaseUrl(server)}/api/online-duel/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Forwarded-For": "203.0.113.10",
      },
      body: JSON.stringify(payload),
    });
    expect(secondResponse.status).toBe(429);
    expect(secondResponse.headers.get("retry-after")).toBeTruthy();
    await expect(secondResponse.json()).resolves.toEqual({
      error: "rate_limited",
      scope: "message",
    });
  });

  it("ignores forwarded client IPs unless trust proxy is enabled", async () => {
    const server = await startOnlineDuelHttpServer({
      port: 0,
      host: "127.0.0.1",
      seed: 9,
      staleSweepIntervalMs: 1_000,
      messageRateLimitMax: 1,
      rateLimitWindowMs: 60_000,
      logLevel: "silent",
      trustProxy: false,
    });
    runningServers.push(server);

    const payload = {
      type: "request_duel_sync",
      duelId: "duel-missing",
    };

    const firstResponse = await fetch(`${createBaseUrl(server)}/api/online-duel/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Forwarded-For": "203.0.113.10",
      },
      body: JSON.stringify(payload),
    });
    expect(firstResponse.status).toBe(200);

    const secondResponse = await fetch(`${createBaseUrl(server)}/api/online-duel/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Forwarded-For": "198.51.100.77",
      },
      body: JSON.stringify(payload),
    });
    expect(secondResponse.status).toBe(429);
  });

  it("uses forwarded client IPs when trust proxy is enabled", async () => {
    const server = await startOnlineDuelHttpServer({
      port: 0,
      host: "127.0.0.1",
      seed: 9,
      staleSweepIntervalMs: 1_000,
      messageRateLimitMax: 1,
      rateLimitWindowMs: 60_000,
      logLevel: "silent",
      trustProxy: true,
    });
    runningServers.push(server);

    const payload = {
      type: "request_duel_sync",
      duelId: "duel-missing",
    };

    const firstResponse = await fetch(`${createBaseUrl(server)}/api/online-duel/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Forwarded-For": "203.0.113.10",
      },
      body: JSON.stringify(payload),
    });
    expect(firstResponse.status).toBe(200);

    const secondResponse = await fetch(`${createBaseUrl(server)}/api/online-duel/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Forwarded-For": "198.51.100.77",
      },
      body: JSON.stringify(payload),
    });
    expect(secondResponse.status).toBe(200);
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
    await expect(joinResponse.json()).resolves.toMatchObject({
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

  it("does not reuse an abandoned queued matchmaking room for the next HTTP matchmaking search", async () => {
    const server = await startServer();
    const alpha = createSnapshot("Alpha");
    const beta = createSnapshot("Beta");

    const queuedResponse = await fetch(`${createBaseUrl(server)}/api/online-duel/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "find_matchmaking_duel",
        playerId: "http-queue-alpha",
        sessionId: "http-queue-session-alpha",
        displayName: "Alpha",
        snapshot: alpha,
      }),
    });

    expect(queuedResponse.status).toBe(200);
    const queuedPayload = (await queuedResponse.json()) as {
      messages: Array<Record<string, unknown>>;
    };
    const queuedCreate = queuedPayload.messages.find(
      (message) => message.type === "duel_created"
    ) as { type: "duel_created"; duelId: string } | undefined;
    expect(queuedCreate?.type).toBe("duel_created");
    if (!queuedCreate) {
      return;
    }

    server.authorityService.expireStaleRooms(Date.now() + 10 * 60 * 1000);

    const nextResponse = await fetch(`${createBaseUrl(server)}/api/online-duel/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "find_matchmaking_duel",
        playerId: "http-queue-beta",
        sessionId: "http-queue-session-beta",
        displayName: "Beta",
        snapshot: beta,
      }),
    });

    expect(nextResponse.status).toBe(200);
    const nextPayload = (await nextResponse.json()) as {
      messages: Array<Record<string, unknown>>;
    };

    const nextCreate = nextPayload.messages.find(
      (message) => message.type === "duel_created"
    ) as { type: "duel_created"; duelId: string } | undefined;
    expect(nextCreate?.type).toBe("duel_created");
    if (!nextCreate) {
      return;
    }

    expect(nextCreate.duelId).not.toBe(queuedCreate.duelId);

    const nextSync = nextPayload.messages.find(
      (message) => message.type === "duel_state_sync"
    ) as
      | {
          type: "duel_state_sync";
          payload: {
            duelId: string;
            status: string;
            yourSeat: string | null;
          };
        }
      | undefined;
    expect(nextSync?.type).toBe("duel_state_sync");
    if (!nextSync) {
      return;
    }

    expect(nextSync.payload.duelId).toBe(nextCreate.duelId);
    expect(nextSync.payload.status).toBe("waiting_for_players");
    expect(nextSync.payload.yourSeat).toBe("playerA");
  });

  it("plays through matchmaking pause, resume, match found, and the first resolved round over live HTTP and SSE", async () => {
    const server = await startServer();
    const alpha = createSnapshot("Alpha");
    const beta = createSnapshot("Beta");

    const firstSearchResponse = await fetch(`${createBaseUrl(server)}/api/online-duel/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "find_matchmaking_duel",
        playerId: "match-alpha",
        sessionId: "match-alpha-session",
        displayName: "Alpha",
        snapshot: alpha,
      }),
    });

    expect(firstSearchResponse.status).toBe(200);
    const firstSearchPayload = (await firstSearchResponse.json()) as {
      messages: Array<Record<string, unknown>>;
    };
    const firstQueuedSync = firstSearchPayload.messages.find(
      (message) => message.type === "duel_state_sync"
    ) as
      | {
          type: "duel_state_sync";
          payload: OnlineDuelStateSync;
        }
      | undefined;
    expect(firstQueuedSync?.type).toBe("duel_state_sync");
    if (!firstQueuedSync || typeof firstQueuedSync.payload.resumeToken !== "string") {
      throw new Error("expected queued matchmaking sync");
    }

    const firstLeaveResponse = await fetch(`${createBaseUrl(server)}/api/online-duel/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "leave_duel",
        duelId: firstQueuedSync.payload.duelId,
        playerId: "match-alpha",
        sessionId: "match-alpha-session",
      }),
    });

    expect(firstLeaveResponse.status).toBe(200);
    await expect(firstLeaveResponse.json()).resolves.toMatchObject({
      messages: [
        {
          type: "duel_state_sync",
          payload: {
            duelId: firstQueuedSync.payload.duelId,
            status: "abandoned",
          },
        },
      ],
    });

    const resumedSearchResponse = await fetch(`${createBaseUrl(server)}/api/online-duel/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "find_matchmaking_duel",
        playerId: "match-alpha",
        sessionId: "match-alpha-session",
        displayName: "Alpha",
        snapshot: alpha,
      }),
    });

    expect(resumedSearchResponse.status).toBe(200);
    const resumedSearchPayload = (await resumedSearchResponse.json()) as {
      messages: Array<Record<string, unknown>>;
    };
    const resumedQueuedSync = resumedSearchPayload.messages.find(
      (message) => message.type === "duel_state_sync"
    ) as
      | {
          type: "duel_state_sync";
          payload: OnlineDuelStateSync;
        }
      | undefined;
    expect(resumedQueuedSync?.type).toBe("duel_state_sync");
    if (!resumedQueuedSync || typeof resumedQueuedSync.payload.resumeToken !== "string") {
      throw new Error("expected resumed matchmaking sync");
    }

    expect(resumedQueuedSync.payload.duelId).not.toBe(firstQueuedSync.payload.duelId);
    expect(resumedQueuedSync.payload.status).toBe("waiting_for_players");

    const alphaStream = await openEventStream(
      `${createBaseUrl(server)}/api/online-duel/events?duelId=${resumedQueuedSync.payload.duelId}&playerId=match-alpha&resumeToken=${resumedQueuedSync.payload.resumeToken}`
    );
    expect(alphaStream.statusCode).toBe(200);

    const baselineAlphaEvent = await alphaStream.readMessage();
    expect(baselineAlphaEvent.message).toMatchObject({
      type: "duel_state_sync",
      payload: {
        duelId: resumedQueuedSync.payload.duelId,
        status: "waiting_for_players",
      },
    });

    const betaSearchResponse = await fetch(`${createBaseUrl(server)}/api/online-duel/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "find_matchmaking_duel",
        playerId: "match-beta",
        sessionId: "match-beta-session",
        displayName: "Beta",
        snapshot: beta,
      }),
    });

    expect(betaSearchResponse.status).toBe(200);
    const betaSearchPayload = (await betaSearchResponse.json()) as {
      messages: Array<Record<string, unknown>>;
    };
    const betaSync = betaSearchPayload.messages.find(
      (message) => message.type === "duel_state_sync"
    ) as
      | {
          type: "duel_state_sync";
          payload: OnlineDuelStateSync;
        }
      | undefined;
    expect(betaSync?.type).toBe("duel_state_sync");
    if (!betaSync) {
      throw new Error("expected joined matchmaking sync");
    }

    expect(betaSync.payload.duelId).toBe(resumedQueuedSync.payload.duelId);
    expect(betaSync.payload.status).toBe("lobby");
    expect(betaSync.payload.yourSeat).toBe("playerB");

    const lobbyMessages = await readUntilMessages(
      alphaStream,
      (messages) =>
        messages.some(
          (event) =>
            isSyncEnvelope(event) &&
            event.message.payload.status === "lobby" &&
            event.message.payload.participants.filter((participant) => participant.connected).length === 2
        ),
      2_000
    );
    expect(
      lobbyMessages.some(
        (event) =>
          isSyncEnvelope(event) &&
          event.message.payload.status === "lobby" &&
          event.message.payload.yourSeat === "playerA"
      )
    ).toBe(true);

    const alphaReadyResponse = await fetch(`${createBaseUrl(server)}/api/online-duel/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "set_ready",
        duelId: resumedQueuedSync.payload.duelId,
        seat: "playerA",
        playerId: "match-alpha",
        sessionId: "match-alpha-session",
        ready: true,
      }),
    });
    expect(alphaReadyResponse.status).toBe(200);

    const betaReadyResponse = await fetch(`${createBaseUrl(server)}/api/online-duel/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "set_ready",
        duelId: resumedQueuedSync.payload.duelId,
        seat: "playerB",
        playerId: "match-beta",
        sessionId: "match-beta-session",
        ready: true,
      }),
    });
    expect(betaReadyResponse.status).toBe(200);
    const betaReadyPayload = (await betaReadyResponse.json()) as {
      messages: Array<Record<string, unknown>>;
    };
    expect(
      betaReadyPayload.messages.some(
        (message) => message.type === "duel_ready" && message.duelId === resumedQueuedSync.payload.duelId
      )
    ).toBe(true);
    expect(
      betaReadyPayload.messages.some(
        (message) =>
          message.type === "duel_state_sync" &&
          (message.payload as { duelId?: string; status?: string } | undefined)?.duelId ===
            resumedQueuedSync.payload.duelId &&
          (message.payload as { duelId?: string; status?: string } | undefined)?.status === "planning"
      )
    ).toBe(true);

    const alphaSubmitResponse = await fetch(`${createBaseUrl(server)}/api/online-duel/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "submit_round_action",
        duelId: resumedQueuedSync.payload.duelId,
        seat: "playerA",
        playerId: "match-alpha",
        sessionId: "match-alpha-session",
        selection: createBasicSelection("head", ["chest", "waist"]),
        expectedRound: 1,
      }),
    });
    expect(alphaSubmitResponse.status).toBe(200);

    const betaSubmitResponse = await fetch(`${createBaseUrl(server)}/api/online-duel/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "submit_round_action",
        duelId: resumedQueuedSync.payload.duelId,
        seat: "playerB",
        playerId: "match-beta",
        sessionId: "match-beta-session",
        selection: createBasicSelection("legs", ["head", "belly"]),
        expectedRound: 1,
      }),
    });

    expect(betaSubmitResponse.status).toBe(200);
    const betaSubmitPayload = (await betaSubmitResponse.json()) as {
      messages: Array<Record<string, unknown>>;
    };
    expect(
      betaSubmitPayload.messages.some(
        (message) =>
          message.type === "round_resolved" &&
          message.duelId === resumedQueuedSync.payload.duelId
      )
    ).toBe(true);
    expect(
      betaSubmitPayload.messages.some(
        (message) =>
          message.type === "duel_state_sync" &&
          (message.payload as { duelId?: string; round?: number } | undefined)?.duelId ===
            resumedQueuedSync.payload.duelId &&
          (message.payload as { duelId?: string; round?: number } | undefined)?.round === 2
      )
    ).toBe(true);

    const resolvedMessages = await readUntilMessages(
      alphaStream,
      (messages) => messages.some((event) => event.message.type === "round_resolved"),
      2_000
    );
    expect(resolvedMessages.some((event) => event.message.type === "round_resolved")).toBe(true);

    alphaStream.close();
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
        selection: createBasicSelection("head", ["chest", "belly"]),
      }),
    });

    const firstSubmitPayload = (await firstSubmitResponse.json()) as {
      messages: Array<Record<string, unknown>>;
    };

    expect(firstSubmitPayload.messages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "duel_state_sync",
          payload: expect.objectContaining({
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
          }),
        }),
      ])
    );
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
        selection: createBasicSelection("head", ["chest", "belly"]),
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
        selection: createBasicSelection("legs", ["head", "waist"]),
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
    await expect(rematchResponse.json()).resolves.toMatchObject({
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

  it("replays a fresh lobby sync when a player reconnects after rematch", async () => {
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
    const createdSync = createPayload.messages[1] as
      | {
          type?: string;
          payload?: { resumeToken?: string };
        }
      | undefined;
    if (
      created?.type !== "duel_created" ||
      createdSync?.type !== "duel_state_sync" ||
      typeof created.duelId !== "string" ||
      typeof created.roomCode !== "string" ||
      typeof createdSync.payload?.resumeToken !== "string"
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

    const baselineStream = await openEventStream(
      `${createBaseUrl(server)}/api/online-duel/events?duelId=${created.duelId}&playerId=player-alpha&resumeToken=${createdSync.payload.resumeToken}`
    );
    const baselineEvent = await baselineStream.readMessage();
    expect(baselineEvent.message.type).toBe("duel_state_sync");
    baselineStream.close();

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
    const rematchPayload = (await rematchResponse.json()) as {
      messages: Array<Record<string, unknown>>;
    };
    const rematchSync = rematchPayload.messages.find(
      (message) => message.type === "duel_state_sync"
    ) as
      | {
          type: "duel_state_sync";
          payload: {
            duelId: string;
            roomCode: string;
            status: string;
            round: number;
            resumeToken?: string;
          };
        }
      | undefined;
    expect(rematchSync?.type).toBe("duel_state_sync");
    if (!rematchSync || typeof rematchSync.payload.resumeToken !== "string") {
      return;
    }

    const replayStream = await openEventStream(
      `${createBaseUrl(server)}/api/online-duel/events?duelId=${created.duelId}&playerId=player-alpha&resumeToken=${rematchSync.payload.resumeToken}&afterEventId=${baselineEvent.eventId ?? ""}`
    );
    const replayedMessages = await readUntilMessages(
      replayStream,
      (events) =>
        events.some(
          (event) =>
            isSyncEnvelope(event) &&
            event.message.payload.status === "lobby" &&
            event.message.payload.round === 1 &&
            event.message.payload.yourSeat === "playerA"
        ),
      10_000
    );

    const latestReplaySync = [...replayedMessages]
      .reverse()
      .find(isSyncEnvelope);

    expect(latestReplaySync?.message.payload).toMatchObject({
      status: "lobby",
      round: 1,
      yourSeat: "playerA",
      roomCode: created.roomCode,
    });

    replayStream.close();
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
    await expect(leaveResponse.json()).resolves.toMatchObject({
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
