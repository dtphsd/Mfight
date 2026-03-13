import { createId } from "@/core/ids/createId";
import { createCharacterEntity, type CharacterResult } from "@/modules/character/model/Character";

export function createCharacter(name: string): CharacterResult<ReturnType<typeof createCharacterEntity>> {
  const normalizedName = name.trim();

  if (normalizedName.length === 0) {
    return {
      success: false,
      reason: "invalid_name",
    };
  }

  return {
    success: true,
    data: createCharacterEntity(createId("character"), normalizedName),
  };
}
