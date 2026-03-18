import { zeroCharacterStats } from "@/modules/character";
import {
  createEquipment,
  equipItem,
  getEquipmentBonuses,
  unequipItem,
  type EquipmentSlot,
} from "@/modules/equipment";
import {
  createStarterInventory,
  zeroArmorProfile,
  zeroCombatBonuses,
  zeroDamageProfile,
  type Item,
} from "@/modules/inventory";

const testAccessory: Item = {
  id: "test-ring",
  code: "test-ring",
  name: "Test Ring",
  category: "accessory",
  type: "ring2",
  rarity: "rare",
  description: "Test accessory",
  value: 20,
  stackable: false,
  maxStack: 1,
  equip: {
    slot: "ring2",
    armorClass: "ring2",
  },
  baseDamage: zeroDamageProfile,
  baseArmor: zeroArmorProfile,
  combatBonuses: {
    ...zeroCombatBonuses,
    critChance: 4,
  },
  statBonuses: {
    strength: 0,
    agility: 1,
    rage: 2,
    endurance: 0,
  },
  flatBonuses: {
    strength: 0,
    agility: 1,
    rage: 2,
    endurance: 0,
  },
  percentBonuses: {
    strength: 0,
    agility: 10,
    rage: 0,
    endurance: 0,
  },
};

describe("equipment module", () => {
  it("creates empty equipment slots", () => {
    const equipment = createEquipment();

    expect(Object.values(equipment.slots)).toEqual(new Array(13).fill(null));
  });

  it("equips a Battle Kings weapon into mainHand", () => {
    const inventory = createStarterInventory();
    const result = equipItem(createEquipment(), inventory, "bk-item-6");

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }

    expect(result.data.slots.mainHand).toBe("bk-item-6");
  });

  it("equips armor pieces into their dedicated slots", () => {
    const inventory = createStarterInventory();
    const withHelmet = equipItem(createEquipment(), inventory, "bk-item-366");
    if (!withHelmet.success) {
      throw new Error(withHelmet.reason);
    }

    const withBelt = equipItem(withHelmet.data, inventory, "bk-item-411");
    if (!withBelt.success) {
      throw new Error(withBelt.reason);
    }

    expect(withBelt.data.slots.helmet).toBe("bk-item-366");
    expect(withBelt.data.slots.belt).toBe("bk-item-411");
  });

  it("rejects equipping a non-equippable item", () => {
    const inventory = createStarterInventory();
    const result = equipItem(createEquipment(), inventory, "small-potion");

    expect(result).toEqual({
      success: false,
      reason: "item_not_equippable",
    });
  });

  it("rejects equipping an item code that is not present", () => {
    const inventory = createStarterInventory();
    const result = equipItem(createEquipment(), inventory, "bk-item-missing");

    expect(result).toEqual({
      success: false,
      reason: "item_not_found",
    });
  });

  it("unequips a slot", () => {
    const inventory = createStarterInventory();
    const equipped = equipItem(createEquipment(), inventory, "bk-item-6");
    if (!equipped.success) {
      throw new Error(equipped.reason);
    }

    const nextEquipment = unequipItem(equipped.data, "mainHand");

    expect(nextEquipment.slots.mainHand).toBeNull();
  });

  it("collects flat and percent bonuses from equipped items", () => {
    const inventory = {
      entries: [{ item: testAccessory, quantity: 1 }],
      maxSlots: 20,
    };
    const equipment = createEquipment();
    const equipped = equipItem(equipment, inventory, "test-ring");
    if (!equipped.success) {
      throw new Error(equipped.reason);
    }

    const bonuses = getEquipmentBonuses(equipped.data, inventory);

    expect(bonuses.flatBonuses).toEqual([testAccessory.flatBonuses]);
    expect(bonuses.percentBonuses).toEqual([testAccessory.percentBonuses]);
    expect(bonuses.statBonuses).toEqual(testAccessory.statBonuses);
    expect(bonuses.combatBonuses.critChance).toBe(4);
    expect(bonuses.preferredDamageType).toBeNull();
    expect(bonuses.mainHandWeaponClass).toBeNull();
    expect(bonuses.armorBySlot).toEqual({});
  });

  it("derives preferred damage type from Battle Kings dagger metadata", () => {
    const inventory = createStarterInventory();
    const equipped = equipItem(createEquipment(), inventory, "bk-item-103");
    if (!equipped.success) {
      throw new Error(equipped.reason);
    }

    const bonuses = getEquipmentBonuses(equipped.data, inventory);

    expect(bonuses.preferredDamageType).toBe("pierce");
    expect(bonuses.mainHandWeaponClass).toBe("dagger");
    expect(bonuses.armorBySlot.mainHand).toBeUndefined();
  });

  it("tracks armor contributions by equipped slot", () => {
    const inventory = createStarterInventory();
    const withHelmet = equipItem(createEquipment(), inventory, "bk-item-366");
    if (!withHelmet.success) {
      throw new Error(withHelmet.reason);
    }

    const withBelt = equipItem(withHelmet.data, inventory, "bk-item-411");
    if (!withBelt.success) {
      throw new Error(withBelt.reason);
    }

    const bonuses = getEquipmentBonuses(withBelt.data, inventory);

    expect(bonuses.armorBySlot.helmet).toEqual({
      slash: 3,
      pierce: 3,
      blunt: 3,
      chop: 3,
    });
    expect(bonuses.armorBySlot.belt).toEqual({
      slash: 3,
      pierce: 3,
      blunt: 3,
      chop: 3,
    });
  });

  it("keeps starter skill carriers neutral in damage profiles and preserves weapon damage typing", () => {
    const inventory = createStarterInventory();
    let equipment = createEquipment();

    for (const itemCode of ["bk-item-206", "starter-sigil-pressure"]) {
      const result = equipItem(equipment, inventory, itemCode);
      if (!result.success) {
        throw new Error(result.reason);
      }

      equipment = result.data;
    }

    const bonuses = getEquipmentBonuses(equipment, inventory);

    expect(bonuses.baseDamage).toEqual({
      slash: 7,
      pierce: 0,
      blunt: 0,
      chop: 0,
    });
    expect(bonuses.preferredDamageType).toBe("slash");
    expect(bonuses.mainHandWeaponClass).toBe("sword");
  });

  it("ignores equipped codes missing from inventory", () => {
    const equipment = {
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
        ring2: "missing-ring",
        earring: null,
      } satisfies Record<EquipmentSlot, string | null>,
    };

    const bonuses = getEquipmentBonuses(equipment, createStarterInventory());

    expect(bonuses.flatBonuses).toEqual([]);
    expect(bonuses.percentBonuses).toEqual([]);
    expect(zeroCharacterStats.strength).toBe(0);
  });
});
