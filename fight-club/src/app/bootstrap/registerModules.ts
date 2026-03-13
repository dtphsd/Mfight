import type { EventBus } from "@/core/event-bus/EventBus";
import type { AppEventMap } from "@/core/event-bus/eventTypes";
import type { Logger } from "@/core/logger/Logger";
import type { Random } from "@/core/rng/Random";
import type { SaveRepository } from "@/core/storage/SaveRepository";
import type { Clock } from "@/core/time/Clock";
import type { StateStore } from "@/core/state/StateStore";

export interface AppServices {
  eventBus: EventBus<AppEventMap>;
  logger: Logger;
  random: Random;
  saveRepository: SaveRepository;
  clock: Clock;
  stateStore: StateStore;
}

export function registerModules(services: AppServices) {
  services.logger.info("Modules registered");
}
