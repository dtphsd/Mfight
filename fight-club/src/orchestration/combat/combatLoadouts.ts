import { createEquipment, equipItem, type Equipment } from "@/modules/equipment";
import type { Inventory } from "@/modules/inventory";

export function createEquipmentFromLoadout(inventory: Inventory, loadout: string[]): Equipment {
  let equipment = createEquipment();

  for (const itemCode of loadout) {
    const result = equipItem(equipment, inventory, itemCode);

    if (!result.success) {
      throw new Error(result.reason);
    }

    equipment = result.data;
  }

  return equipment;
}
