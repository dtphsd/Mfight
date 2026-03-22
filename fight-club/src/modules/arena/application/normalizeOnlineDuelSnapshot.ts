import type { CombatSnapshot } from "@/modules/combat";
import type { OnlineDuelSeat } from "@/modules/arena/model/OnlineDuel";

export function normalizeOnlineDuelSnapshot(
  snapshot: CombatSnapshot,
  duelId: string,
  seat: OnlineDuelSeat
): CombatSnapshot {
  return {
    ...cloneCombatSnapshot(snapshot),
    characterId: `${snapshot.characterId}::${duelId}::${seat}`,
  };
}

export function cloneCombatSnapshot(snapshot: CombatSnapshot): CombatSnapshot {
  return {
    ...snapshot,
    stats: { ...snapshot.stats },
    damage: { ...snapshot.damage },
    armor: { ...snapshot.armor },
    zoneArmor: snapshot.zoneArmor ? { ...snapshot.zoneArmor } : undefined,
    armorBySlot: Object.fromEntries(
      Object.entries(snapshot.armorBySlot).map(([slot, profile]) => [slot, profile ? { ...profile } : profile])
    ),
    zoneArmorBySlot: snapshot.zoneArmorBySlot
      ? Object.fromEntries(
          Object.entries(snapshot.zoneArmorBySlot).map(([slot, profile]) => [
            slot,
            profile ? { ...profile } : profile,
          ])
        )
      : undefined,
    armorPenetrationFlat: { ...snapshot.armorPenetrationFlat },
    armorPenetrationPercent: { ...snapshot.armorPenetrationPercent },
  };
}
