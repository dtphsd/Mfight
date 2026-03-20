import type {
  OnlineDuelClientMessage,
  OnlineDuelServerMessage,
  OnlineDuelTransport,
} from "@/modules/arena/contracts/arenaPublicApi";

interface HttpOnlineDuelTransportOptions {
  baseUrl: string;
  fetchImpl?: typeof fetch;
}

export function createHttpOnlineDuelTransport(
  options: HttpOnlineDuelTransportOptions
): OnlineDuelTransport {
  const fetchImpl = options.fetchImpl ?? fetch;
  const baseUrl = options.baseUrl.replace(/\/+$/, "");

  return {
    async send(message: OnlineDuelClientMessage): Promise<OnlineDuelServerMessage[]> {
      const response = await fetchImpl(`${baseUrl}/api/online-duel/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });

      const payload = (await response.json()) as {
        messages?: OnlineDuelServerMessage[];
        error?: string;
      };

      if (!response.ok || !Array.isArray(payload.messages)) {
        throw new Error(payload.error ?? "online_duel_transport_error");
      }

      return payload.messages;
    },
  };
}
