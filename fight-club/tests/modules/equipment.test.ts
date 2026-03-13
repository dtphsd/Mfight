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
  type: "accessory",
  rarity: "rare",
  description: "Test accessory",
  value: 20,
  stackable: false,
  maxStack: 1,
  equip: {
    slot: "accessory",
    armorClass: "accessory",
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

    expect(Object.values(equipment.slots)).toEqual([null, null, null, null, null, null, null]);
  });

  it("equips an equippable inventory item into its slot", () => {
    const inventory = createStarterInventory();
    const result = equipItem(createEquipment(), inventory, "training-sword");

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }

    expect(result.data.slots.mainHand).toBe("training-sword");
  });

  it("rejects equipping a non-equippable item", () => {
    const inventory = createStarterInventory();
    const result = equipItem(createEquipment(), inventory, "small-potion");

    expect(result).toEqual({
      success: false,
      reason: "item_not_equippable",
    });
  });

  it("equips a shield into offHand", () => {
    const inventory = createStarterInventory();
    const result = equipItem(createEquipment(), inventory, "oak-shield");

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }

    expect(result.data.slots.offHand).toBe("oak-shield");
  });

  it("rejects equipping a two-hand weapon while offHand is occupied", () => {
    const inventory = createStarterInventory();
    const withShield = equipItem(createEquipment(), inventory, "oak-shield");
    if (!withShield.success) {
      throw new Error(withShield.reason);
    }

    const result = equipItem(withShield.data, inventory, "great-training-sword");

    expect(result).toEqual({
      success: false,
      reason: "offhand_occupied",
    });
  });

  it("rejects equipping offHand item while two-hand weapon is equipped", () => {
    const inventory = createStarterInventory();
    const withTwoHand = equipItem(createEquipment(), inventory, "great-training-sword");
    if (!withTwoHand.success) {
      throw new Error(withTwoHand.reason);
    }

    const result = equipItem(withTwoHand.data, inventory, "oak-shield");

    expect(result).toEqual({
      success: false,
      reason: "two_hand_conflict",
    });
  });

  it("unequips a slot", () => {
    const inventory = createStarterInventory();
    const equipped = equipItem(createEquipment(), inventory, "training-sword");
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

  it("derives preferred damage type from main hand weapon class", () => {
    const inventory = createStarterInventory();
    const equipped = equipItem(createEquipment(), inventory, "training-dagger");
    if (!equipped.success) {
      throw new Error(equipped.reason);
    }

    const bonuses = getEquipmentBonuses(equipped.data, inventory);

    expect(bonuses.preferredDamageType).toBe("pierce");
    expect(bonuses.mainHandWeaponClass).toBe("dagger");
    expect(bonuses.armorBySlot.mainHand).toBeUndefined();
  });

  it("collects skills from multiple equipped item slots", () => {
    const inventory = createStarterInventory();
    const withWeapon = equipItem(createEquipment(), inventory, "training-sword");
    if (!withWeapon.success) {
      throw new Error(withWeapon.reason);
    }

    const withHelmet = equipItem(withWeapon.data, inventory, "leather-cap");
    if (!withHelmet.success) {
      throw new Error(withHelmet.reason);
    }

    const withAccessory = equipItem(withHelmet.data, inventory, "arena-earring");
    if (!withAccessory.success) {
      throw new Error(withAccessory.reason);
    }

    const bonuses = getEquipmentBonuses(withAccessory.data, inventory);

    expect(bonuses.skills.map((skill) => skill.id)).toEqual([
      "training-sword-feint",
      "training-sword-expose-guard",
      "leather-cap-head-slip",
      "arena-earring-killer-focus",
    ]);
  });

  it("tracks armor contributions by equipped slot", () => {
    const inventory = createStarterInventory();
    const withShield = equipItem(createEquipment(), inventory, "oak-shield");
    if (!withShield.success) {
      throw new Error(withShield.reason);
    }

    const withArmor = equipItem(withShield.data, inventory, "leather-vest");
    if (!withArmor.success) {
      throw new Error(withArmor.reason);
    }

    const bonuses = getEquipmentBonuses(withArmor.data, inventory);

    expect(bonuses.armorBySlot.offHand).toEqual({
      slash: 6,
      pierce: 8,
      blunt: 10,
      chop: 7,
    });
    expect(bonuses.armorBySlot.armor).toEqual({
      slash: 10,
      pierce: 5,
      blunt: 3,
      chop: 6,
    });
  });

  it("ignores equipped codes missing from inventory", () => {
    const equipment = {
      slots: {
        mainHand: null,
        offHand: null,
        helmet: null,
        armor: null,
        boots: null,
        gloves: null,
        accessory: "missing-ring",
      } satisfies Record<EquipmentSlot, string | null>,
    };

    const bonuses = getEquipmentBonuses(equipment, createStarterInventory());

    expect(bonuses.flatBonuses).toEqual([]);
    expect(bonuses.percentBonuses).toEqual([]);
    expect(zeroCharacterStats.strength).toBe(0);
  });
});
