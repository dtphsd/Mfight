export interface AppEventMap {
  "character.created": { characterId: string; name: string };
  "character.levelUp": { characterId: string; level: number };
  "inventory.changed": { ownerId: string };
  "combat.started": { combatId: string };
  "combat.roundResolved": { combatId: string; round: number };
  "commentator.spoke": { phrase: string };
}

