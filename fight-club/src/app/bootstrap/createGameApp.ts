import { createEventBus } from "@/core/event-bus/createEventBus";
import { createLogger } from "@/core/logger/Logger";
import { SeededRandom } from "@/core/rng/SeededRandom";
import { LocalStorageSaveRepository } from "@/core/storage/LocalStorageSaveRepository";
import { SystemClock } from "@/core/time/SystemClock";
import { StateStore } from "@/core/state/StateStore";

export function createGameApp() {
  const eventBus = createEventBus();
  const logger = createLogger();
  const random = new SeededRandom(42);
  const clock = new SystemClock();
  const saveRepository = new LocalStorageSaveRepository("fight-club-save");
  const stateStore = new StateStore();

  return {
    eventBus,
    logger,
    random,
    clock,
    saveRepository,
    stateStore,
  };
}
