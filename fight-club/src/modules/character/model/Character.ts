import { defaultCharacterStats, type CharacterStats } from "@/modules/character/model/CharacterStats";
import { gameConfig } from "@/app/config/gameConfig";

export interface Character {
  id: string;
  name: string;
  level: number;
  totalExperience: number;
  levelProgress: number;
  levelStep: number;
  unspentStatPoints: number;
  baseStats: CharacterStats;
}

export type CharacterResult<TData> =
  | { success: true; data: TData }
  | { success: false; reason: CharacterFailureReason };

export type CharacterFailureReason =
  | "invalid_name"
  | "invalid_experience_amount"
  | "missing_level_curve"
  | "invalid_stat"
  | "invalid_allocation_amount"
  | "not_enough_stat_points";

export function createCharacterEntity(id: string, name: string): Character {
  return {
    id,
    name,
    level: 1,
    totalExperience: 0,
    levelProgress: 0,
    levelStep: 0,
    unspentStatPoints: gameConfig.character.initialUnspentStatPoints,
    baseStats: defaultCharacterStats,
  };
}
