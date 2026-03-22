// @vitest-environment node

import { get } from "node:http";
import {
  createHttpOnlineDuelTransport,
  createOnlineDuelClient,
  type OnlineDuelActionSelection,
  type OnlineDuelClient,
  type OnlineDuelParticipantLoadout,
  type OnlineDuelServerMessage,
  type OnlineDuelStateSync,
} from "@/modules/arena";
import type { CombatResources, CombatSnapshot, CombatZone } from "@/modules/combat";
import { createOnlineBuildSelection } from "@/ui/screens/OnlineDuel/onlineDuelScreenSupport";
import {
  startOnlineDuelHttpServer,
  type OnlineDuelHttpServerHandle,
} from "../../../server/onlineDuelHttpServer";

export interface StreamEnvelope {
  eventId?: string;
  message: OnlineDuelServerMessage;
}

export interface PreparedFighter {
  snapshot: CombatSnapshot;
  loadout: OnlineDuelParticipantLoadout;
}

export interface LiveDuelContext {
  baseUrl: string;
  duelId: string;
  roomCode: string;
  hostSeat: "playerA";
  guestSeat: "playerB";
  hostClient: OnlineDuelClient;
  guestClient: OnlineDuelClient;
  hostStream: Awaited<ReturnType<typeof openEventStream>>;
  guestStream: Awaited<ReturnType<typeof openEventStream>>;
}

export function createBasicSelection(
  attackZone: CombatZone,
  defenseZones: [CombatZone, CombatZone]
): OnlineDuelActionSelection {
  return {
    attackZone,
    defenseZones,
    intent: "neutral",
    selectedAction: { kind: "basic_attack" },
  };
}

export function createSkillSelection(
  skillId: string,
  attackZone: CombatZone,
  defenseZones: [CombatZone, CombatZone]
): OnlineDuelActionSelection {
  return {
    attackZone,
    defenseZones,
    intent: "neutral",
    selectedAction: { kind: "skill_attack", skillId },
  };
}

export function createConsumableSelection(
  consumableCode: string,
  usageMode: "replace_attack" | "with_attack",
  attackZone: CombatZone,
  defenseZones: [CombatZone, CombatZone]
): OnlineDuelActionSelection {
  return {
    attackZone,
    defenseZones,
    intent: "neutral",
    selectedAction: { kind: "consumable", consumableCode, usageMode },
  };
}

export function createPresetFighter(
  presetId: string,
  fighterName: string,
  options?: { maxHp?: number }
): PreparedFighter {
  const selection = createOnlineBuildSelection(presetId, fighterName);
  const snapshot =
    options?.maxHp === undefined
      ? selection.snapshot
      : {
          ...selection.snapshot,
          maxHp: options.maxHp,
        };

  return {
    snapshot,
    loadout: {
      equipmentState: selection.equipmentState,
      inventory: selection.inventory,
      equippedSkillIds: selection.equippedSkillIds,
    },
  };
}

export function quantityForItem(sync: OnlineDuelStateSync | null, itemCode: string) {
  return sync?.yourLoadout?.inventory.entries.find((entry) => entry.item.code === itemCode)?.quantity ?? 0;
}

export function combatantResource(sync: OnlineDuelStateSync | null, resource: keyof CombatResources) {
  const yourCombatantId = sync?.yourSnapshot?.characterId;
  return sync?.combatState?.combatants.find((combatant) => combatant.id === yourCombatantId)?.resources[resource];
}

export function latestRoundLogEntries(sync: OnlineDuelStateSync | null) {
  const latestRound = sync?.lastResolvedRound?.round ?? 0;
  return sync?.combatState?.log.filter((entry) => entry.round === latestRound) ?? [];
}

export function createOnlineDuelLiveHarness() {
  const runningServers: OnlineDuelHttpServerHandle[] = [];

  async function closeAll() {
    while (runningServers.length > 0) {
      const server = runningServers.pop();
      if (!server) {
        continue;
      }

      await server.close();
    }
  }

  async function startServer(seed = 9) {
    const server = await startOnlineDuelHttpServer({
      port: 0,
      host: "127.0.0.1",
      seed,
      staleSweepIntervalMs: 1_000,
    });
    runningServers.push(server);
    return server;
  }

  async function createLiveDuel(
    hostFighter: PreparedFighter,
    guestFighter: PreparedFighter,
    options?: {
      hostIdentity?: { playerId: string; sessionId: string; displayName: string };
      guestIdentity?: { playerId: string; sessionId: string; displayName: string };
      seed?: number;
    }
  ): Promise<LiveDuelContext> {
    const server = await startServer(options?.seed ?? 9);
    const baseUrl = `http://${server.host}:${server.port}`;
    const transport = createHttpOnlineDuelTransport({ baseUrl });
    const hostIdentity = options?.hostIdentity ?? {
      playerId: "scenario-host",
      sessionId: "scenario-host-session",
      displayName: "Scenario Host",
    };
    const guestIdentity = options?.guestIdentity ?? {
      playerId: "scenario-guest",
      sessionId: "scenario-guest-session",
      displayName: "Scenario Guest",
    };
    const hostClient = createOnlineDuelClient(transport, hostIdentity);
    const guestClient = createOnlineDuelClient(transport, guestIdentity);

    const created = await hostClient.createDuel(hostFighter.snapshot, undefined, undefined, hostFighter.loadout);
    const duelCreated = created.find((message) => message.type === "duel_created");
    if (!duelCreated || duelCreated.type !== "duel_created") {
      throw new Error("duel_was_not_created");
    }

    const hostSync = hostClient.getLastSync();
    if (hostSync?.yourSeat !== "playerA" || !hostSync.resumeToken) {
      throw new Error("host_sync_missing");
    }

    await guestClient.joinDuelByCode(
      duelCreated.roomCode,
      guestFighter.snapshot,
      undefined,
      undefined,
      guestFighter.loadout
    );
    const guestSync = guestClient.getLastSync();
    if (guestSync?.yourSeat !== "playerB" || !guestSync.resumeToken) {
      throw new Error("guest_sync_missing");
    }

    const hostStream = await openEventStream(
      `${baseUrl}/api/online-duel/events?duelId=${duelCreated.duelId}&playerId=${hostClient.identity.playerId}&resumeToken=${hostSync.resumeToken}`
    );
    const guestStream = await openEventStream(
      `${baseUrl}/api/online-duel/events?duelId=${duelCreated.duelId}&playerId=${guestClient.identity.playerId}&resumeToken=${guestSync.resumeToken}`
    );

    hostClient.acceptServerMessage((await hostStream.readMessage()).message);
    guestClient.acceptServerMessage((await guestStream.readMessage()).message);

    return {
      baseUrl,
      duelId: duelCreated.duelId,
      roomCode: duelCreated.roomCode,
      hostSeat: "playerA",
      guestSeat: "playerB",
      hostClient,
      guestClient,
      hostStream,
      guestStream,
    };
  }

  async function readyBoth(context: LiveDuelContext) {
    await context.hostClient.setReady(context.duelId, context.hostSeat, true);
    await context.guestClient.setReady(context.duelId, context.guestSeat, true);

    const [hostReady, guestReady] = await Promise.all([
      drainClientUntil(context.hostClient, context.hostStream, (sync, events) => {
        return sync?.status === "planning" && events.some((event) => event.message.type === "duel_ready");
      }),
      drainClientUntil(context.guestClient, context.guestStream, (sync, events) => {
        return sync?.status === "planning" && events.some((event) => event.message.type === "duel_ready");
      }),
    ]);

    return {
      host: hostReady.sync,
      guest: guestReady.sync,
    };
  }

  async function playRound(
    context: LiveDuelContext,
    selections: {
      host: OnlineDuelActionSelection;
      guest: OnlineDuelActionSelection;
    }
  ) {
    const roundBefore = context.hostClient.getLastSync()?.round ?? 1;

    await context.hostClient.submitRoundAction(context.duelId, context.hostSeat, selections.host);
    await context.guestClient.submitRoundAction(context.duelId, context.guestSeat, selections.guest);

    const [hostResolved, guestResolved] = await Promise.all([
      drainClientUntil(context.hostClient, context.hostStream, (sync, events) => {
        return roundSettled(sync, roundBefore, events);
      }),
      drainClientUntil(context.guestClient, context.guestStream, (sync, events) => {
        return roundSettled(sync, roundBefore, events);
      }),
    ]);

    return {
      host: hostResolved.sync,
      guest: guestResolved.sync,
      hostEvents: hostResolved.events,
      guestEvents: guestResolved.events,
    };
  }

  return {
    closeAll,
    createLiveDuel,
    readyBoth,
    playRound,
  };
}

function roundSettled(
  sync: OnlineDuelStateSync | null,
  expectedRoundBeforeResolve: number,
  events: StreamEnvelope[]
) {
  const resolved = events.some((event) => event.message.type === "round_resolved");
  if (!resolved || !sync) {
    return false;
  }

  return (
    sync.lastResolvedRound?.round === expectedRoundBeforeResolve ||
    sync.status === "finished" ||
    (sync.status === "planning" && sync.round === expectedRoundBeforeResolve + 1)
  );
}

async function drainClientUntil(
  client: OnlineDuelClient,
  stream: Awaited<ReturnType<typeof openEventStream>>,
  predicate: (sync: OnlineDuelStateSync | null, events: StreamEnvelope[]) => boolean,
  timeoutMs = 10_000
) {
  const events: StreamEnvelope[] = [];
  const timeoutAt = Date.now() + timeoutMs;

  while (Date.now() < timeoutAt) {
    const remaining = timeoutAt - Date.now();
    const nextMessage = await Promise.race([
      stream.readMessage(),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("event_stream_timeout")), remaining);
      }),
    ]);
    events.push(nextMessage);
    client.acceptServerMessage(nextMessage.message);
    const sync = client.getLastSync();
    if (predicate(sync, events)) {
      return { events, sync };
    }
  }

  throw new Error(`event_stream_timeout:${events.map((event) => event.message.type).join(",")}`);
}

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
