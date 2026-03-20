// @vitest-environment node

import { get } from "node:http";
import { afterEach, describe, expect, it } from "vitest";
import {
  createHttpOnlineDuelTransport,
  createOnlineDuelClient,
  type OnlineDuelServerMessage,
  type OnlineDuelStateSync,
} from "@/modules/arena";
import { createCharacter } from "@/modules/character";
import { createBasicAttackAction } from "@/modules/combat";
import { buildCombatSnapshot } from "@/orchestration/combat/buildCombatSnapshot";
import {
  startOnlineDuelHttpServer,
  type OnlineDuelHttpServerHandle,
} from "../../server/onlineDuelHttpServer";

interface StreamEnvelope {
  eventId?: string;
  message: OnlineDuelServerMessage;
}

function isSyncEnvelope(
  event: StreamEnvelope
): event is StreamEnvelope & { message: { type: "duel_state_sync"; payload: OnlineDuelStateSync } } {
  return event.message.type === "duel_state_sync";
}

describe("online duel live two-client validation", () => {
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

  it("runs a full live room flow across two independent HTTP clients and SSE streams", async () => {
    const server = await startServer();
    const baseUrl = createBaseUrl(server);
    const hostSnapshot = createSnapshot("Host");
    const guestSnapshot = createSnapshot("Guest");
    const transport = createHttpOnlineDuelTransport({ baseUrl });
    const hostClient = createOnlineDuelClient(transport, {
      playerId: "player-host",
      sessionId: "session-host",
      displayName: "Host",
    });
    const guestClient = createOnlineDuelClient(transport, {
      playerId: "player-guest",
      sessionId: "session-guest",
      displayName: "Guest",
    });

    const created = await hostClient.createDuel(hostSnapshot);
    const duelCreated =
      created[0]?.type === "duel_created"
        ? created[0]
        : (() => {
            throw new Error("duel was not created");
          })();
    const hostSync = hostClient.getLastSync();
    expect(hostSync?.yourSeat).toBe("playerA");
    expect(hostSync?.resumeToken).toBeTruthy();

    await guestClient.joinDuelByCode(duelCreated.roomCode, guestSnapshot);
    const guestSync = guestClient.getLastSync();
    expect(guestSync?.yourSeat).toBe("playerB");
    expect(guestSync?.resumeToken).toBeTruthy();

    const hostStream = await openEventStream(
      `${baseUrl}/api/online-duel/events?duelId=${duelCreated.duelId}&playerId=${hostClient.identity.playerId}&resumeToken=${hostSync?.resumeToken ?? ""}`
    );
    const guestStream = await openEventStream(
      `${baseUrl}/api/online-duel/events?duelId=${duelCreated.duelId}&playerId=${guestClient.identity.playerId}&resumeToken=${guestSync?.resumeToken ?? ""}`
    );

    await hostStream.readMessage();
    await guestStream.readMessage();

    await hostClient.setReady(duelCreated.duelId, "playerA", true);
    await guestClient.setReady(duelCreated.duelId, "playerB", true);

    const hostReadyEvents = await readUntilMessages(
      hostStream,
      (events) =>
        events.some((event) => event.message.type === "duel_ready") &&
        events.some(
          (event) =>
            event.message.type === "duel_state_sync" &&
            event.message.payload.status === "planning"
        ),
      10_000
    );
    expect(hostReadyEvents.some((event) => event.message.type === "duel_ready")).toBe(true);

    await hostClient.submitRoundAction(
      duelCreated.duelId,
      "playerA",
      createBasicAttackAction({
        attackerId: hostSnapshot.characterId,
        attackZone: "head",
        defenseZones: ["chest", "belly"],
      })
    );
    await guestClient.submitRoundAction(
      duelCreated.duelId,
      "playerB",
      createBasicAttackAction({
        attackerId: guestSnapshot.characterId,
        attackZone: "legs",
        defenseZones: ["head", "waist"],
      })
    );

    const hostRoundEvents = await readUntilMessages(
      hostStream,
      (events) => {
        const latestSync = [...events].reverse().find(isSyncEnvelope);

        return (
          events.some((event) => event.message.type === "round_ready") &&
          events.some((event) => event.message.type === "round_resolved") &&
          latestSync?.message.payload.round === 2 &&
          latestSync.message.payload.status === "planning"
        );
      },
      10_000
    );
    expect(hostRoundEvents.some((event) => event.message.type === "round_resolved")).toBe(true);

    await guestClient.leaveDuel(duelCreated.duelId);

    const hostLeaveEvents = await readUntilMessages(
      hostStream,
      (events) =>
        events.some(
          (event) =>
            isSyncEnvelope(event) &&
            event.message.payload.status === "abandoned" &&
            event.message.payload.participants.some(
              (participant) => participant.seat === "playerB" && participant.connected === false
            )
        ),
      10_000
    );
    const abandonedSync = [...hostLeaveEvents].reverse().find(isSyncEnvelope);
    expect(abandonedSync?.message.payload.status).toBe("abandoned");

    hostStream.close();
    guestStream.close();
  }, 20_000);
});

async function openEventStream(url: string) {
  return new Promise<{
    statusCode: number;
    contentType: string;
    readMessage(): Promise<StreamEnvelope>;
    close(): void;
  }>((resolve, reject) => {
    const request = get(url, (response) => {
      const statusCode = response.statusCode ?? 0;
      const contentType = response.headers["content-type"] ?? "";
      let buffer = "";
      const queuedMessages: StreamEnvelope[] = [];
      const pendingResolvers: Array<(value: StreamEnvelope) => void> = [];

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
          const payload = JSON.parse(dataLine.slice(6)) as OnlineDuelServerMessage;
          const envelope: StreamEnvelope = {
            eventId: eventIdLine?.slice(4),
            message: payload,
          };
          const nextResolver = pendingResolvers.shift();
          if (nextResolver) {
            nextResolver(envelope);
          } else {
            queuedMessages.push(envelope);
          }
        }
      });
      response.on("error", reject);

      resolve({
        statusCode,
        contentType: Array.isArray(contentType) ? contentType.join(", ") : contentType,
        readMessage() {
          return new Promise<StreamEnvelope>((messageResolve) => {
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
  predicate: (messages: StreamEnvelope[]) => boolean,
  timeoutMs: number
) {
  const messages: StreamEnvelope[] = [];
  const timeoutAt = Date.now() + timeoutMs;

  while (Date.now() < timeoutAt) {
    const remaining = timeoutAt - Date.now();
    let nextMessage: StreamEnvelope;
    try {
      nextMessage = await Promise.race([
        stream.readMessage(),
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error("event_stream_timeout")), remaining);
        }),
      ]);
    } catch {
      throw new Error(`event_stream_timeout:${messages.map((event) => event.message.type).join(",")}`);
    }

    messages.push(nextMessage);
    if (predicate(messages)) {
      return messages;
    }
  }

  throw new Error(`event_stream_timeout:${messages.map((event) => event.message.type).join(",")}`);
}
