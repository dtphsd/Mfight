import { SeededRandom } from "@/core/rng/SeededRandom";
import {
  createHttpOnlineDuelTransport,
  createInMemoryOnlineDuelService,
  createLocalOnlineDuelTransport,
  createOnlineDuelClient,
  type OnlineDuelClient,
  type OnlineDuelServerMessage,
  type OnlineDuelTransport,
} from "@/modules/arena";
import type { TransportSource } from "@/ui/screens/OnlineDuel/onlineDuelScreenSupport";

export interface OnlineDuelSetup {
  transportLabel: "backend" | "local";
  hostClient: OnlineDuelClient;
  guestClient: OnlineDuelClient;
  resetHostClient(): void;
  resetGuestClient(): void;
  expireRooms?: (now?: number) => void;
}

interface OnlineSetupClientIdentityOverride {
  playerId: string;
  sessionId: string;
  displayName: string;
}

export const ONLINE_DUEL_BACKEND_OVERRIDE_STORAGE_KEY = "fight-club-online-duel-backend-override";

export function createOnlineSetupForScreen({
  mode,
  baseUrl,
  matchmakingIdentity,
}: {
  mode: "backend" | "local";
  baseUrl: string;
  matchmakingIdentity?: OnlineSetupClientIdentityOverride;
}) {
  return mode === "backend"
    ? createHttpOnlineSetup(baseUrl, matchmakingIdentity)
    : createLocalOnlineSetup(matchmakingIdentity);
}

export function getOnlineDuelBackendBaseUrl() {
  const runtimeOverride = readOnlineDuelBackendBaseUrlOverride();
  if (runtimeOverride) {
    return runtimeOverride;
  }

  const configuredBaseUrl =
    typeof import.meta !== "undefined" ? import.meta.env.VITE_ONLINE_DUEL_BASE_URL?.trim() : undefined;
  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/+$/, "");
  }

  if (typeof window === "undefined") {
    return "http://127.0.0.1:3001";
  }

  const protocol = window.location.protocol === "https:" ? "https:" : "http:";
  const hostname = window.location.hostname || "127.0.0.1";
  return `${protocol}//${hostname}:3001`;
}

export function readOnlineDuelBackendBaseUrlOverride() {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.localStorage.getItem(ONLINE_DUEL_BACKEND_OVERRIDE_STORAGE_KEY)?.trim();
  return value ? value.replace(/\/+$/, "") : null;
}

export function setOnlineDuelBackendBaseUrlOverride(baseUrl: string) {
  if (typeof window === "undefined") {
    return;
  }

  const trimmed = baseUrl.trim().replace(/\/+$/, "");
  if (!trimmed) {
    window.localStorage.removeItem(ONLINE_DUEL_BACKEND_OVERRIDE_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(ONLINE_DUEL_BACKEND_OVERRIDE_STORAGE_KEY, trimmed);
}

export function clearOnlineDuelBackendBaseUrlOverride() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(ONLINE_DUEL_BACKEND_OVERRIDE_STORAGE_KEY);
}

export function isLoopbackOnlineDuelBackendBaseUrl(baseUrl: string) {
  try {
    const parsedUrl = new URL(baseUrl);
    return ["127.0.0.1", "localhost", "::1"].includes(parsedUrl.hostname);
  } catch {
    return false;
  }
}

export async function canReachOnlineDuelBackend(baseUrl: string) {
  if (typeof navigator !== "undefined" && /jsdom/i.test(navigator.userAgent)) {
    return false;
  }

  try {
    const response = await fetch(`${baseUrl}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

export function describeTransportIssue(issue: string) {
  switch (issue) {
    case "missing_resume_token":
      return "the match link needs to refresh before updates can continue.";
    case "event_stream_error":
      return "live updates dropped for a moment. Trying to reconnect now.";
    case "online_duel_transport_error":
      return "the match service did not answer.";
    case "invalid_status":
      return "the match is not in the right phase for that action yet.";
    case "combat_not_active":
      return "the round already moved on. Syncing the room again can get you back in step.";
    case "stale_sync":
      return "your match state is out of date. Refresh the room and try again.";
    case "invalid_action":
      return "that action payload was invalid for this round.";
    case "combatant_not_found":
      return "the fighter for that action could not be matched in the live combat state.";
    case "duplicate_defense_zones":
      return "the same guard zone was selected twice. Pick two different guard zones.";
    case "dead_combatant_action":
      return "that fighter is already down, so the round cannot accept another action.";
    case "insufficient_resources":
      return "that move needs more combat resources before it can be used.";
    case "skill_on_cooldown":
      return "that skill is still on cooldown.";
    case "displaced_session":
      return "this session was replaced by a newer one for the same fighter.";
    case "participant_disconnected":
      return "that fighter is disconnected right now.";
    case "seat_mismatch":
      return "that action was sent for the wrong side.";
    case "duel_not_found":
      return "that match could not be found.";
    case "live_service_required":
      return "the live match service is offline. Start online:server before creating or joining a PvP fight.";
    case "room_full":
      return "that match already has two fighters.";
    default:
      return issue.replaceAll("_", " ");
  }
}

export function transportBadgeLabel(source: TransportSource) {
  switch (source) {
    case "backend":
      return "Live room";
    case "local":
      return "Local room";
    default:
      return "Checking room";
  }
}

export function shouldRecoverFromSubmitError(messages: OnlineDuelServerMessage[]) {
  return messages.some(
    (message) =>
      message.type === "duel_error" &&
      (
        message.reason === "already_submitted" ||
        message.reason === "stale_sync" ||
        message.reason === "combat_resolution_failed" ||
        message.reason === "combat_not_active" ||
        message.reason === "invalid_action" ||
        message.reason === "combatant_not_found" ||
        message.reason === "duplicate_defense_zones" ||
        message.reason === "dead_combatant_action" ||
        message.reason === "insufficient_resources" ||
        message.reason === "skill_on_cooldown"
      )
  );
}

export function shouldRefreshClientsAfterRoundResolution(messages: OnlineDuelServerMessage[]) {
  return messages.some((message) => message.type === "round_resolved");
}

function createLocalOnlineSetup(matchmakingIdentity?: OnlineSetupClientIdentityOverride): OnlineDuelSetup {
  const service = createInMemoryOnlineDuelService(new SeededRandom(21));
  const transport = createLocalOnlineDuelTransport(service);
  return createOnlineSetupFromTransport({
    transportLabel: "local",
    transport,
    hostIdentityOverride: matchmakingIdentity,
    expireRooms(now) {
      service.expireStaleRooms(now);
    },
  });
}

function createHttpOnlineSetup(
  baseUrl: string,
  matchmakingIdentity?: OnlineSetupClientIdentityOverride
): OnlineDuelSetup {
  const transport = createHttpOnlineDuelTransport({ baseUrl });
  return createOnlineSetupFromTransport({
    transportLabel: "backend",
    transport,
    hostIdentityOverride: matchmakingIdentity,
  });
}

function createOnlineSetupFromTransport({
  transportLabel,
  transport,
  hostIdentityOverride,
  expireRooms,
}: {
  transportLabel: "backend" | "local";
  transport: OnlineDuelTransport;
  hostIdentityOverride?: OnlineSetupClientIdentityOverride;
  expireRooms?: (now?: number) => void;
}): OnlineDuelSetup {
  let hostSessionVersion = 1;
  let guestSessionVersion = 1;

  const createHostClient = () =>
    createOnlineDuelClient(transport, {
      playerId: hostIdentityOverride?.playerId ?? "player-host",
      sessionId: hostIdentityOverride?.sessionId ?? `session-host-${hostSessionVersion}`,
      displayName: hostIdentityOverride?.displayName ?? "Host",
    });
  const createGuestClient = () =>
    createOnlineDuelClient(transport, {
      playerId: "player-guest",
      sessionId: `session-guest-${guestSessionVersion}`,
      displayName: "Guest",
    });

  const setup: OnlineDuelSetup = {
    transportLabel,
    hostClient: createHostClient(),
    guestClient: createGuestClient(),
    resetHostClient() {
      hostSessionVersion += 1;
      setup.hostClient = createHostClient();
    },
    resetGuestClient() {
      guestSessionVersion += 1;
      setup.guestClient = createGuestClient();
    },
  };

  if (expireRooms) {
    setup.expireRooms = expireRooms;
  }

  return setup;
}
