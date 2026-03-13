import { gameConfig } from "@/app/config/gameConfig";
import type { Character, CharacterResult } from "@/modules/character/model/Character";

export function addExperience(character: Character, amount: number): CharacterResult<Character> {
  if (amount <= 0) {
    return {
      success: false,
      reason: "invalid_experience_amount",
    };
  }

  let nextCharacter: Character = {
    ...character,
    totalExperience: character.totalExperience + amount,
    levelProgress: character.levelProgress + amount,
  };

  while (true) {
    const curve = gameConfig.character.levelCurves.find((entry) => entry.level === nextCharacter.level);

    if (!curve) {
      return {
        success: false,
        reason: "missing_level_curve",
      };
    }

    const currentStepCost = curve.steps[nextCharacter.levelStep];

    if (currentStepCost === undefined || nextCharacter.levelProgress < currentStepCost) {
      break;
    }

    nextCharacter = {
      ...nextCharacter,
      levelProgress: nextCharacter.levelProgress - currentStepCost,
      levelStep: nextCharacter.levelStep + 1,
      unspentStatPoints: nextCharacter.unspentStatPoints + gameConfig.character.stepPointReward,
    };

    if (nextCharacter.levelStep === curve.steps.length) {
      nextCharacter = {
        ...nextCharacter,
        level: nextCharacter.level + 1,
        levelStep: 0,
        unspentStatPoints: nextCharacter.unspentStatPoints + gameConfig.character.levelPointReward,
      };
    }
  };

  return {
    success: true,
    data: nextCharacter,
  };
}
