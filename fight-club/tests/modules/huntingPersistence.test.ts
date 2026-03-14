import {
  createHunterProfile,
  createIdleHuntState,
  loadHuntingState,
  saveHuntingState,
  type HuntingSaveState,
} from "@/modules/hunting";
import { createInventory } from "@/modules/inventory";
import type { SaveRepository } from "@/core/storage/SaveRepository";

class InMemorySaveRepository implements SaveRepository {
  private payload: unknown = null;

  save<TValue>(payload: TValue) {
    this.payload = payload;
  }

  load<TValue>() {
    return this.payload as TValue | null;
  }

  clear() {
    this.payload = null;
  }
}

describe("hunting persistence", () => {
  it("saves and loads hunting state through the shared save envelope", () => {
    const saveRepository = new InMemorySaveRepository();
    const huntingState: HuntingSaveState = {
      profile: createHunterProfile("Scout"),
      inventory: createInventory(),
      huntState: createIdleHuntState(),
      pets: [],
      selectedZoneId: "forest-edge",
      lastClaimed: null,
    };

    saveHuntingState(saveRepository, huntingState);
    const loaded = loadHuntingState(saveRepository);

    expect(loaded).toEqual(huntingState);
  });

  it("preserves non-hunting save state when writing hunting progress", () => {
    const saveRepository = new InMemorySaveRepository();
    saveRepository.save({
      version: "1.0.0",
      timestamp: 123,
      state: {
        combat: {
          mode: "sandbox",
        },
      },
    });

    saveHuntingState(saveRepository, {
      profile: createHunterProfile("Scout"),
      inventory: createInventory(),
      huntState: createIdleHuntState(),
      pets: [],
      selectedZoneId: "forest-edge",
      lastClaimed: null,
    });

    const raw = saveRepository.load<{
      state: Record<string, unknown>;
    }>();

    expect(raw?.state.combat).toEqual({
      mode: "sandbox",
    });
    expect(raw?.state.hunting).toBeDefined();
  });

  it("normalizes legacy hunting saves that do not have a tool loadout yet", () => {
    const saveRepository = new InMemorySaveRepository();
    const legacyProfile = createHunterProfile("Scout") as unknown as Record<string, unknown>;
    delete legacyProfile.tool;

    saveRepository.save({
      version: "1.0.0",
      timestamp: 123,
      state: {
        hunting: {
          profile: legacyProfile,
          inventory: createInventory(),
          huntState: createIdleHuntState(),
          pets: [],
          selectedZoneId: "forest-edge",
          lastClaimed: null,
        },
      },
    });

    const loaded = loadHuntingState(saveRepository);

    expect(loaded?.profile.tool).toEqual({
      slot: "kit",
      item: null,
    });
  });
});
