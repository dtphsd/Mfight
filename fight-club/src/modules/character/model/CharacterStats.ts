export interface CharacterStats {
  strength: number;
  agility: number;
  rage: number;
  endurance: number;
}

export type CharacterStatName = keyof CharacterStats;

export const defaultCharacterStats: CharacterStats = {
  strength: 3,
  agility: 3,
  rage: 3,
  endurance: 3,
};

export const zeroCharacterStats: CharacterStats = {
  strength: 0,
  agility: 0,
  rage: 0,
  endurance: 0,
};
