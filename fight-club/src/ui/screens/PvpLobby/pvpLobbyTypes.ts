import type { CombatSnapshot } from "@/modules/combat";
import type { EquipmentSlot } from "@/modules/equipment";
import type { Item } from "@/modules/inventory";
import type { CombatFigureId } from "@/ui/components/combat/CombatSilhouette";

export interface PvpPreparedFighter {
  snapshot: CombatSnapshot;
  figure: CombatFigureId;
  playerName: string;
  equipment: Array<{ slot: EquipmentSlot; item: Item | null }>;
}
