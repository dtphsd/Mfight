import type {
  OnlineDuelAuthorityService,
  OnlineDuelClientMessage,
  OnlineDuelServerMessage,
  OnlineDuelTransport,
} from "@/modules/arena/contracts/arenaPublicApi";
import { handleOnlineDuelClientMessage } from "@/modules/arena/application/handleOnlineDuelClientMessage";

export function createLocalOnlineDuelTransport(
  service: OnlineDuelAuthorityService
): OnlineDuelTransport {
  return {
    async send(message: OnlineDuelClientMessage): Promise<OnlineDuelServerMessage[]> {
      return handleOnlineDuelClientMessage(service, message);
    },
  };
}
