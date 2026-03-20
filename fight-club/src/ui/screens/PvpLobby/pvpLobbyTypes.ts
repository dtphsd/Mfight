import type { CombatSnapshot } from "@/modules/combat";
import type { Equipment, EquipmentSlot } from "@/modules/equipment";
import type { Inventory, Item } from "@/modules/inventory";
import type { CombatFigureId } from "@/ui/components/combat/CombatSilhouette";

export interface PvpPreparedFighter {
  snapshot: CombatSnapshot;
  figure: CombatFigureId;
  playerName: string;
  equipment: Array<{ slot: EquipmentSlot; item: Item | null }>;
  equipmentState: Equipment;
  inventory: Inventory;
  equippedSkillIds: string[];
}
