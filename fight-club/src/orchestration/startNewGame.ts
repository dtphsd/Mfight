import { createCharacter } from "@/modules/character/application/createCharacter";

export function startNewGame(playerName: string) {
  const createdCharacter = createCharacter(playerName);

  if (!createdCharacter.success) {
    throw new Error(createdCharacter.reason);
  }

  return {
    player: createdCharacter.data,
  };
}
