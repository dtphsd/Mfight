import type { Character, CharacterResult } from "@/modules/character/model/Character";
import type { CharacterStatName } from "@/modules/character/model/CharacterStats";

export interface CharacterPublicApi {
  create(name: string): CharacterResult<Character>;
  addExperience(character: Character, amount: number): CharacterResult<Character>;
  allocateStatPoint(
    character: Character,
    stat: CharacterStatName,
    amount?: number
  ): CharacterResult<Character>;
}
