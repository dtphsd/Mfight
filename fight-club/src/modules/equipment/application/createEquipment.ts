import type { Equipment } from "@/modules/equipment/model/Equipment";

export function createEquipment(): Equipment {
  return {
    slots: {
      mainHand: null,
      offHand: null,
      helmet: null,
      shirt: null,
      armor: null,
      bracers: null,
      belt: null,
      pants: null,
      boots: null,
      gloves: null,
      ring: null,
      ring2: null,
      earring: null,
    },
  };
}
