import { createEventBus } from "@/core/event-bus/createEventBus";
import { createLogger } from "@/core/logger/Logger";
import { SeededRandom } from "@/core/rng/SeededRandom";
import { LocalStorageSaveRepository } from "@/core/storage/LocalStorageSaveRepository";
import { SystemClock } from "@/core/time/SystemClock";
import { StateStore } from "@/core/state/StateStore";
import { registerModules } from "@/app/bootstrap/registerModules";

export function createGameApp() {
  const eventBus = createEventBus();
  const logger = createLogger();
  const random = new SeededRandom(42);
  const clock = new SystemClock();
  const saveRepository = new LocalStorageSaveRepository("fight-club-save");
  const stateStore = new StateStore();

  registerModules({ eventBus, logger, random, clock, saveRepository, stateStore });

  return {
    eventBus,
    logger,
    random,
    clock,
    saveRepository,
    stateStore,
  };
}

