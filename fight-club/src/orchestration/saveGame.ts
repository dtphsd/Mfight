import type { SaveRepository } from "@/core/storage/SaveRepository";

export function saveGame(saveRepository: SaveRepository, state: Record<string, unknown>) {
  saveRepository.save({
    version: "1.0.0",
    timestamp: Date.now(),
    state,
  });
}

