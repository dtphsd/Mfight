import type { Equipment } from "@/modules/equipment/model/Equipment";

export function createEquipment(): Equipment {
  return {
    slots: {
      mainHand: null,
      offHand: null,
      helmet: null,
      armor: null,
      boots: null,
      gloves: null,
      accessory: null,
    },
  };
}
