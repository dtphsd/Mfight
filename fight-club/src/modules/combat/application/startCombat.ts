import { createId } from "@/core/ids/createId";
import { zeroCombatResources } from "@/modules/combat/model/CombatResources";
import type { CombatSnapshot } from "@/modules/combat/model/CombatSnapshot";
import type { CombatState } from "@/modules/combat/model/CombatState";
import type { CombatantState } from "@/modules/combat/model/CombatantState";

export function startCombat(snapshotA: CombatSnapshot, snapshotB: CombatSnapshot): CombatState {
  return {
    id: createId("combat"),
    round: 1,
    status: "active",
    combatants: [createCombatant(snapshotA), createCombatant(snapshotB)],
    winnerId: null,
    log: [],
  };
}

function createCombatant(snapshot: CombatSnapshot): CombatantState {
  return {
    id: snapshot.characterId,
    name: snapshot.name,
    stats: snapshot.stats,
    maxHp: snapshot.maxHp,
    currentHp: snapshot.maxHp,
    resources: { ...zeroCombatResources },
    damage: snapshot.damage,
    armor: snapshot.armor,
    armorBySlot: snapshot.armorBySlot,
    critChanceBonus: snapshot.critChanceBonus,
    critMultiplierBonus: snapshot.critMultiplierBonus,
    dodgeChanceBonus: snapshot.dodgeChanceBonus,
    blockChanceBonus: snapshot.blockChanceBonus,
    blockPowerBonus: snapshot.blockPowerBonus,
    armorPenetrationFlat: snapshot.armorPenetrationFlat,
    armorPenetrationPercent: snapshot.armorPenetrationPercent,
    preferredDamageType: snapshot.preferredDamageType,
    weaponClass: snapshot.weaponClass,
    attackZone: null,
    defenseZones: [],
    activeEffects: [],
  };
}
