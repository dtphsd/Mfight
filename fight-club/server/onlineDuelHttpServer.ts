import {
  createServer,
  type IncomingMessage,
  type Server,
  type ServerResponse,
} from "node:http";
import { SeededRandom } from "@/core/rng/SeededRandom";
import {
  createInMemoryOnlineDuelService,
  handleOnlineDuelClientMessage,
  type OnlineDuelAuthorityService,
  type OnlineDuelClientMessage,
  type OnlineDuelServerMessage,
} from "@/modules/arena";

const JSON_CONTENT_TYPE = "application/json; charset=utf-8";
const EVENT_STREAM_CONTENT_TYPE = "text/event-stream; charset=utf-8";
const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_SWEEP_INTERVAL_MS = 15_000;
const DEFAULT_BODY_LIMIT_BYTES = 256 * 1024;
const MAX_ROOM_EVENT_HISTORY = 24;

type KnownOnlineDuelMessageType = OnlineDuelClientMessage["type"];

export interface CreateOnlineDuelHttpHandlerOptions {
  seed?: number;
  staleSweepIntervalMs?: number;
}

export interface StartOnlineDuelHttpServerOptions extends CreateOnlineDuelHttpHandlerOptions {
  port?: number;
  host?: string;
}

export interface OnlineDuelHttpServerHandle {
  authorityService: OnlineDuelAuthorityService;
  server: Server;
  host: string;
  port: number;
  close(): Promise<void>;
}

export interface OnlineDuelHttpHandlerBundle {
  authorityService: OnlineDuelAuthorityService;
  handleRequest(request: IncomingMessage, response: ServerResponse): Promise<void>;
  dispose(): void;
}

export function createOnlineDuelHttpHandler(
  options: CreateOnlineDuelHttpHandlerOptions = {}
): OnlineDuelHttpHandlerBundle {
  const authorityService = createInMemoryOnlineDuelService(new SeededRandom(options.seed ?? 9));
  const staleSweepIntervalMs = options.staleSweepIntervalMs ?? DEFAULT_SWEEP_INTERVAL_MS;
  const roomSubscribers = new Map<
    string,
    Map<string, { response: ServerResponse; resumeToken: string; lastEventId: string | null }>
  >();
  const roomEventHistory = new Map<string, Map<string, Array<{ id: string; message: OnlineDuelServerMessage }>>>();
  const roomEventCounters = new Map<string, number>();
  let lastSweepAt = 0;

  async function handleRequest(request: IncomingMessage, response: ServerResponse) {
    applyJsonHeaders(response);

    if (request.method === "OPTIONS") {
      response.writeHead(204);
      response.end();
      return;
    }

    maybeSweepStaleRooms();

    if (request.method === "GET" && request.url === "/health") {
      writeJson(response, 200, {
        status: "ok",
        transport: "http",
      });
      return;
    }

    if (request.method === "GET" && request.url) {
      const streamRequest = tryParseEventStreamRequest(request.url);
      if (streamRequest) {
        attachEventStreamSubscriber(
          streamRequest.duelId,
          streamRequest.playerId,
          streamRequest.resumeToken,
          response,
          request
        );
        return;
      }
    }

    if (request.method === "POST" && request.url === "/api/online-duel/message") {
      try {
        const body = await readJsonBody(request);
        if (!isOnlineDuelClientMessage(body)) {
          writeJson(response, 400, {
            error: "invalid_online_duel_message",
          });
          return;
        }

        const messages = handleOnlineDuelClientMessage(authorityService, body);
        publishRoomUpdates(resolveMessageDuelId(body, messages), messages);
        writeJson(response, 200, { messages });
        return;
      } catch (error) {
        if (error instanceof InvalidRequestBodyError) {
          writeJson(response, error.statusCode, {
            error: error.message,
          });
          return;
        }

        writeJson(response, 500, {
          error: "online_duel_server_error",
        });
        return;
      }
    }

    writeJson(response, 404, {
      error: "not_found",
    });
  }

  function maybeSweepStaleRooms(now = Date.now()) {
    if (now - lastSweepAt < staleSweepIntervalMs) {
      return;
    }

    authorityService.expireStaleRooms(now);
    lastSweepAt = now;
  }

  function attachEventStreamSubscriber(
    duelId: string,
    playerId: string,
    resumeToken: string,
    response: ServerResponse,
    request: IncomingMessage
  ) {
    response.setHeader("Content-Type", EVENT_STREAM_CONTENT_TYPE);
    response.setHeader("Cache-Control", "no-cache, no-transform");
    response.setHeader("Connection", "keep-alive");
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type");
    response.writeHead(200);
    response.flushHeaders();
    response.write(": connected\n\n");

    const roomMap =
      roomSubscribers.get(duelId) ??
      new Map<string, { response: ServerResponse; resumeToken: string; lastEventId: string | null }>();
    const afterEventId = streamAfterEventId(request.url);
    roomMap.set(playerId, { response, resumeToken, lastEventId: afterEventId });
    roomSubscribers.set(duelId, roomMap);

    const sync = authorityService.buildStateSync(duelId, playerId, resumeToken);
    if (!sync.success) {
      writeEvent(response, {
        type: "duel_error",
        duelId,
        reason: sync.reason,
      });
      response.end();
      return;
    }

    const replayedHistory = replayRoomEvents(duelId, playerId, response, afterEventId);
    if (replayedHistory) {
      const subscriber = roomMap.get(playerId);
      if (subscriber) {
        subscriber.lastEventId = roomEventHistory.get(duelId)?.get(playerId)?.at(-1)?.id ?? afterEventId;
      }
      return;
    }

    if (!afterEventId) {
      const latestEvent = roomEventHistory.get(duelId)?.get(playerId)?.at(-1);
      if (latestEvent) {
        writeEvent(response, latestEvent.message, latestEvent.id);
        const subscriber = roomMap.get(playerId);
        if (subscriber) {
          subscriber.lastEventId = latestEvent.id;
        }
        return;
      }
    }

    const initialSyncEvent = {
      id: `${duelId}:${incrementRoomEventCounter(duelId)}`,
      message: {
        type: "duel_state_sync",
        payload: sync.data,
      } satisfies OnlineDuelServerMessage,
    };
    appendRoomEvent(duelId, playerId, initialSyncEvent);
    writeEvent(response, initialSyncEvent.message, initialSyncEvent.id);
    const subscriber = roomMap.get(playerId);
    if (subscriber) {
      subscriber.lastEventId = initialSyncEvent.id;
    }

    const cleanup = () => {
      const currentRoom = roomSubscribers.get(duelId);
      if (!currentRoom) {
        return;
      }

      currentRoom.delete(playerId);
      if (currentRoom.size === 0) {
        roomSubscribers.delete(duelId);
      }
    };

    request.on("close", cleanup);
    request.on("aborted", cleanup);
  }

  function publishRoomUpdates(duelId: string | null, messages: OnlineDuelServerMessage[]) {
    if (!duelId) {
      return;
    }

    const room = authorityService.getRoom(duelId);
    if (!room.success) {
      return;
    }

    const playerIds = [
      room.data.participants.playerA.playerId,
      ...(room.data.participants.playerB ? [room.data.participants.playerB.playerId] : []),
    ];
    playerIds.forEach((playerId) => {
      const nextEvents = createPlayerEventBatch(duelId, playerId, messages);
      nextEvents.forEach((event) => appendRoomEvent(duelId, playerId, event));
    });

    const subscribers = roomSubscribers.get(duelId);
    if (!subscribers || subscribers.size === 0) {
      return;
    }

    subscribers.forEach((subscriber, playerId) => {
      const playerHistory = roomEventHistory.get(duelId)?.get(playerId);
      const pendingEvents =
        playerHistory?.filter(
          (event) =>
            subscriber.lastEventId === null || compareEventIds(event.id, subscriber.lastEventId) > 0
        ) ?? [];
      if (pendingEvents.length === 0) {
        return;
      }

      const latestEvent = pendingEvents.at(-1);
      if (
        !latestEvent ||
        latestEvent.message.type === "duel_error" ||
        (latestEvent.message.type === "duel_state_sync" &&
          latestEvent.message.payload.resumeToken !== subscriber.resumeToken)
      ) {
        writeEvent(subscriber.response, {
          type: "duel_error",
          duelId,
          reason: "stale_session",
        });
        subscriber.response.end();
        subscribers.delete(playerId);
        return;
      }

      pendingEvents.forEach((event) => {
        writeEvent(subscriber.response, event.message, event.id);
      });
      subscriber.lastEventId = pendingEvents.at(-1)?.id ?? subscriber.lastEventId;
    });

    if (subscribers.size === 0) {
      roomSubscribers.delete(duelId);
    }
  }

  function replayRoomEvents(
    duelId: string,
    playerId: string,
    response: ServerResponse,
    afterEventId: string | null
  ) {
    if (!afterEventId) {
      return false;
    }

    const playerHistory = roomEventHistory.get(duelId)?.get(playerId) ?? [];
    const missedEvents = playerHistory.filter((event) => compareEventIds(event.id, afterEventId) > 0);
    if (missedEvents.length === 0) {
      return false;
    }

    missedEvents.forEach((event) => {
      writeEvent(response, event.message, event.id);
    });
    return true;
  }

  function appendRoomEvent(
    duelId: string,
    playerId: string,
    event: { id: string; message: OnlineDuelServerMessage }
  ) {
    const roomHistory = roomEventHistory.get(duelId) ?? new Map<string, Array<{ id: string; message: OnlineDuelServerMessage }>>();
    const playerHistory = roomHistory.get(playerId) ?? [];
    playerHistory.push(event);
    if (playerHistory.length > MAX_ROOM_EVENT_HISTORY) {
      playerHistory.splice(0, playerHistory.length - MAX_ROOM_EVENT_HISTORY);
    }

    roomHistory.set(playerId, playerHistory);
    roomEventHistory.set(duelId, roomHistory);
  }

  function createPlayerEventBatch(
    duelId: string,
    playerId: string,
    messages: OnlineDuelServerMessage[]
  ) {
    const batch: Array<{ id: string; message: OnlineDuelServerMessage }> = [];
    const roomMessages = messages.filter((message) =>
      message.type === "connection_updated" ||
      message.type === "readiness_updated" ||
      message.type === "duel_ready" ||
      message.type === "round_ready" ||
      message.type === "round_resolved"
    );

    roomMessages.forEach((message) => {
      batch.push({
        id: `${duelId}:${incrementRoomEventCounter(duelId)}`,
        message,
      });
    });

    const sync = authorityService.buildStateSync(duelId, playerId);
    if (sync.success) {
      batch.push({
        id: `${duelId}:${incrementRoomEventCounter(duelId)}`,
        message: {
          type: "duel_state_sync",
          payload: sync.data,
        },
      });
    }

    return batch;
  }

  function incrementRoomEventCounter(duelId: string) {
    const next = (roomEventCounters.get(duelId) ?? 0) + 1;
    roomEventCounters.set(duelId, next);
    return next;
  }

  return {
    authorityService,
    handleRequest,
    dispose() {
      roomSubscribers.forEach((subscribers) => {
        subscribers.forEach((subscriber) => {
          subscriber.response.end();
        });
      });
      roomSubscribers.clear();
      roomEventHistory.clear();
      roomEventCounters.clear();
    },
  };
}

export async function startOnlineDuelHttpServer(
  options: StartOnlineDuelHttpServerOptions = {}
): Promise<OnlineDuelHttpServerHandle> {
  const { authorityService, handleRequest, dispose } = createOnlineDuelHttpHandler(options);
  const server = createServer((request, response) => {
    void handleRequest(request, response);
  });
  const host = options.host ?? DEFAULT_HOST;
  const port = options.port ?? 0;

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => {
      server.off("error", reject);
      resolve();
    });
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("online duel server did not expose a TCP address");
  }

  return {
    authorityService,
    server,
    host,
    port: address.port,
    close() {
      return new Promise<void>((resolve, reject) => {
        dispose();
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      });
    },
  };
}

function applyJsonHeaders(response: ServerResponse) {
  response.setHeader("Content-Type", JSON_CONTENT_TYPE);
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function writeEvent(response: ServerResponse, payload: OnlineDuelServerMessage, eventId?: string) {
  if (eventId) {
    response.write(`id: ${eventId}\n`);
  }
  response.write(`data: ${JSON.stringify(payload)}\n\n`);
}

function writeJson(response: ServerResponse, statusCode: number, payload: unknown) {
  response.writeHead(statusCode);
  response.end(JSON.stringify(payload));
}

async function readJsonBody(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let totalLength = 0;

  for await (const chunk of request) {
    const bufferChunk = typeof chunk === "string" ? Buffer.from(chunk) : chunk;
    totalLength += bufferChunk.length;
    if (totalLength > DEFAULT_BODY_LIMIT_BYTES) {
      throw new InvalidRequestBodyError("request_body_too_large", 413);
    }

    chunks.push(bufferChunk);
  }

  const rawBody = Buffer.concat(chunks).toString("utf8").trim();
  if (rawBody.length === 0) {
    throw new InvalidRequestBodyError("request_body_required", 400);
  }

  try {
    return JSON.parse(rawBody) as unknown;
  } catch {
    throw new InvalidRequestBodyError("invalid_json", 400);
  }
}

function isOnlineDuelClientMessage(value: unknown): value is OnlineDuelClientMessage {
  if (!isRecord(value) || !hasString(value, "type")) {
    return false;
  }

  switch (value.type as KnownOnlineDuelMessageType) {
    case "create_duel":
    case "find_matchmaking_duel":
      return (
        hasString(value, "playerId") &&
        hasString(value, "sessionId") &&
        hasString(value, "displayName") &&
        isRecord(value.snapshot)
      );
    case "join_duel":
      return (
        hasString(value, "duelId") &&
        hasString(value, "playerId") &&
        hasString(value, "sessionId") &&
        hasString(value, "displayName") &&
        isRecord(value.snapshot)
      );
    case "join_duel_by_code":
      return (
        hasString(value, "roomCode") &&
        hasString(value, "playerId") &&
        hasString(value, "sessionId") &&
        hasString(value, "displayName") &&
        isRecord(value.snapshot)
      );
    case "set_connection":
      return (
        hasString(value, "duelId") &&
        hasString(value, "seat") &&
        hasString(value, "playerId") &&
        hasString(value, "sessionId") &&
        typeof value.connected === "boolean"
      );
    case "set_ready":
      return (
        hasString(value, "duelId") &&
        hasString(value, "seat") &&
        hasString(value, "playerId") &&
        hasString(value, "sessionId") &&
        typeof value.ready === "boolean"
      );
    case "request_duel_sync":
      return hasString(value, "duelId");
    case "leave_duel":
      return (
        hasString(value, "duelId") &&
        hasString(value, "playerId") &&
        hasString(value, "sessionId")
      );
    case "rematch_duel":
      return (
        hasString(value, "duelId") &&
        hasString(value, "playerId") &&
        hasString(value, "sessionId")
      );
    case "submit_round_action":
      return (
        hasString(value, "duelId") &&
        hasString(value, "seat") &&
        hasString(value, "playerId") &&
        hasString(value, "sessionId") &&
        isRecord(value.action)
      );
    default:
      return false;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function hasString(value: Record<string, unknown>, key: string): boolean {
  return typeof value[key] === "string" && value[key].trim().length > 0;
}

function tryParseEventStreamRequest(rawUrl: string) {
  const url = new URL(rawUrl, "http://localhost");
  if (url.pathname !== "/api/online-duel/events") {
    return null;
  }

  const duelId = url.searchParams.get("duelId")?.trim();
  const playerId = url.searchParams.get("playerId")?.trim();
  const resumeToken = url.searchParams.get("resumeToken")?.trim();
  if (!duelId || !playerId || !resumeToken) {
    return null;
  }

  return {
    duelId,
    playerId,
    resumeToken,
  };
}

function streamAfterEventId(rawUrl?: string) {
  if (!rawUrl) {
    return null;
  }

  const url = new URL(rawUrl, "http://localhost");
  return url.searchParams.get("afterEventId")?.trim() || null;
}

function compareEventIds(left: string, right: string) {
  const leftSequence = Number(left.split(":").at(-1) ?? Number.NaN);
  const rightSequence = Number(right.split(":").at(-1) ?? Number.NaN);
  if (Number.isNaN(leftSequence) || Number.isNaN(rightSequence)) {
    return left.localeCompare(right);
  }

  return leftSequence - rightSequence;
}

function resolveMessageDuelId(
  message: OnlineDuelClientMessage,
  responses: OnlineDuelServerMessage[]
): string | null {
  if ("duelId" in message && typeof message.duelId === "string") {
    return message.duelId;
  }

  const created = responses.find((response) => response.type === "duel_created");
  if (created?.type === "duel_created") {
    return created.duelId;
  }

  const synced = responses.find((response) => response.type === "duel_state_sync");
  if (synced?.type === "duel_state_sync") {
    return synced.payload.duelId;
  }

  return null;
}

class InvalidRequestBodyError extends Error {
  constructor(
    message: string,
    readonly statusCode: number
  ) {
    super(message);
  }
}
