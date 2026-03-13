import type { EquipmentResult } from "@/modules/equipment/application/equipItem";
import type { Equipment } from "@/modules/equipment/model/Equipment";
import type { EquipmentSlot } from "@/modules/equipment/model/EquipmentSlot";
import type { Inventory } from "@/modules/inventory";

export interface EquipmentPublicApi {
  equipItem(equipment: Equipment, inventory: Inventory, itemCode: string): EquipmentResult<Equipment>;
  unequipItem(equipment: Equipment, slot: EquipmentSlot): Equipment;
}
