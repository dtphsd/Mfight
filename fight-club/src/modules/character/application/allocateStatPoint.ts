import type { Character, CharacterResult } from "@/modules/character/model/Character";
import type { CharacterStatName } from "@/modules/character/model/CharacterStats";

export function allocateStatPoint(
  character: Character,
  stat: CharacterStatName,
  amount = 1
): CharacterResult<Character> {
  if (!Object.hasOwn(character.baseStats, stat)) {
    return {
      success: false,
      reason: "invalid_stat",
    };
  }

  if (amount < 1) {
    return {
      success: false,
      reason: "invalid_allocation_amount",
    };
  }

  if (character.unspentStatPoints < amount) {
    return {
      success: false,
      reason: "not_enough_stat_points",
    };
  }

  return {
    success: true,
    data: {
      ...character,
      unspentStatPoints: character.unspentStatPoints - amount,
      baseStats: {
        ...character.baseStats,
        [stat]: character.baseStats[stat] + amount,
      },
    },
  };
}

