import type { OnlineDuelServerMessage } from "@/modules/arena/contracts/arenaPublicApi";

interface SubscribeToOnlineDuelEventsOptions {
  baseUrl: string;
  duelId: string;
  playerId: string;
  resumeToken: string;
  afterEventId?: string;
  onMessage: (message: OnlineDuelServerMessage, eventId?: string) => void;
  onOpen?: () => void;
  onError?: () => void;
}

export interface OnlineDuelEventSubscription {
  close(): void;
}

export function subscribeToOnlineDuelEvents(
  options: SubscribeToOnlineDuelEventsOptions
): OnlineDuelEventSubscription | null {
  if (typeof EventSource === "undefined") {
    return null;
  }

  const baseUrl = options.baseUrl.replace(/\/+$/, "");
  const eventUrl = new URL(`${baseUrl}/api/online-duel/events`);
  eventUrl.searchParams.set("duelId", options.duelId);
  eventUrl.searchParams.set("playerId", options.playerId);
  eventUrl.searchParams.set("resumeToken", options.resumeToken);
  if (options.afterEventId) {
    eventUrl.searchParams.set("afterEventId", options.afterEventId);
  }

  const source = new EventSource(eventUrl.toString());
  source.onopen = () => {
    options.onOpen?.();
  };
  source.onmessage = (event) => {
    try {
      const payload = JSON.parse(event.data) as OnlineDuelServerMessage;
      options.onMessage(payload, event.lastEventId || undefined);
    } catch {
      options.onError?.();
    }
  };
  source.onerror = () => {
    options.onError?.();
  };

  return {
    close() {
      source.close();
    },
  };
}
