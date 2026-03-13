import { zeroCharacterStats } from "@/modules/character";
import {
  addItem,
  createInventory,
  createStarterInventory,
  getItemQuantity,
  removeItem,
  zeroArmorProfile,
  zeroCombatBonuses,
  zeroDamageProfile,
  type Item,
} from "@/modules/inventory";

const stackablePotion: Item = {
  id: "small-potion",
  code: "small-potion",
  name: "Small Potion",
  category: "consumable",
  type: "consumable",
  rarity: "common",
  description: "Potion",
  value: 8,
  stackable: true,
  maxStack: 5,
  equip: null,
  baseDamage: zeroDamageProfile,
  baseArmor: zeroArmorProfile,
  combatBonuses: zeroCombatBonuses,
  statBonuses: zeroCharacterStats,
  flatBonuses: zeroCharacterStats,
  percentBonuses: zeroCharacterStats,
};

const trainingSword: Item = {
  id: "training-sword",
  code: "training-sword",
  name: "Training Sword",
  category: "weapon",
  type: "weapon",
  rarity: "common",
  description: "Sword",
  value: 12,
  stackable: false,
  maxStack: 1,
  equip: {
    slot: "mainHand",
    handedness: "one_hand",
    weaponClass: "sword",
  },
  baseDamage: {
    slash: 12,
    pierce: 3,
    blunt: 0,
    chop: 0,
  },
  baseArmor: zeroArmorProfile,
  combatBonuses: zeroCombatBonuses,
  statBonuses: {
    strength: 2,
    agility: 0,
    rage: 0,
    endurance: 0,
  },
  flatBonuses: {
    strength: 2,
    agility: 0,
    rage: 0,
    endurance: 0,
  },
  percentBonuses: zeroCharacterStats,
};

describe("inventory module", () => {
  it("creates an empty inventory", () => {
    expect(createInventory()).toEqual({
      entries: [],
      maxSlots: 20,
    });
  });

  it("adds a non-stackable item as a single entry", () => {
    const result = addItem(createInventory(), trainingSword);

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }

    expect(result.data.entries).toHaveLength(1);
    expect(result.data.entries[0].quantity).toBe(1);
  });

  it("stacks stackable items into an existing entry", () => {
    const first = addItem(createInventory(), stackablePotion, 2);
    if (!first.success) {
      throw new Error(first.reason);
    }

    const second = addItem(first.data, stackablePotion, 2);

    expect(second.success).toBe(true);
    if (!second.success) {
      return;
    }

    expect(second.data.entries).toHaveLength(1);
    expect(second.data.entries[0].quantity).toBe(4);
  });

  it("splits stackable items into a new slot when a stack overflows", () => {
    const result = addItem(createInventory(), stackablePotion, 7);

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }

    expect(result.data.entries).toHaveLength(2);
    expect(result.data.entries[0].quantity).toBe(5);
    expect(result.data.entries[1].quantity).toBe(2);
  });

  it("fails when inventory runs out of slots", () => {
    const inventory = createInventory(1);
    const first = addItem(inventory, stackablePotion, 5);
    if (!first.success) {
      throw new Error(first.reason);
    }

    const second = addItem(first.data, stackablePotion, 1);

    expect(second).toEqual({
      success: false,
      reason: "inventory_full",
    });
  });

  it("removes part of a stack", () => {
    const created = addItem(createInventory(), stackablePotion, 4);
    if (!created.success) {
      throw new Error(created.reason);
    }

    const removed = removeItem(created.data, stackablePotion.code, 2);

    expect(removed.success).toBe(true);
    if (!removed.success) {
      return;
    }

    expect(removed.data.entries[0].quantity).toBe(2);
  });

  it("removes an entry when quantity reaches zero", () => {
    const created = addItem(createInventory(), stackablePotion, 2);
    if (!created.success) {
      throw new Error(created.reason);
    }

    const removed = removeItem(created.data, stackablePotion.code, 2);

    expect(removed.success).toBe(true);
    if (!removed.success) {
      return;
    }

    expect(removed.data.entries).toHaveLength(0);
  });

  it("returns not_enough_items when removing more than available", () => {
    const created = addItem(createInventory(), stackablePotion, 2);
    if (!created.success) {
      throw new Error(created.reason);
    }

    const removed = removeItem(created.data, stackablePotion.code, 3);

    expect(removed).toEqual({
      success: false,
      reason: "not_enough_items",
    });
  });

  it("returns starter inventory with mixed item types", () => {
    const inventory = createStarterInventory();

    expect(inventory.entries.length).toBeGreaterThan(0);
    expect(getItemQuantity(inventory, "small-potion")).toBe(2);
    expect(getItemQuantity(inventory, "arena-token")).toBe(5);
  });
});
