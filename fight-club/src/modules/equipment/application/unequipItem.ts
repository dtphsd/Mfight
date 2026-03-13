import type { Equipment } from "@/modules/equipment/model/Equipment";
import type { EquipmentSlot } from "@/modules/equipment/model/EquipmentSlot";

export function unequipItem(equipment: Equipment, slot: EquipmentSlot): Equipment {
  return {
    ...equipment,
    slots: {
      ...equipment.slots,
      [slot]: null,
    },
  };
}
