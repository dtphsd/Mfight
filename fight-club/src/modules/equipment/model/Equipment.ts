import type { EquipmentSlot } from "@/modules/equipment/model/EquipmentSlot";

export interface Equipment {
  slots: Record<EquipmentSlot, string | null>;
}
