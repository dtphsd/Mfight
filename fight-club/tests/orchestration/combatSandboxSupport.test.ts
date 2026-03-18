import { createCharacter } from "@/modules/character";
import { createEquipment, equipItem } from "@/modules/equipment";
import { createStarterInventory } from "@/modules/inventory";
import {
  createRoundDraft,
  getRoundDraftSelectedConsumableCode,
  getRoundDraftSelectedSkillId,
  type RoundDraft,
} from "@/orchestration/combat/roundDraft";
import {
  applySandboxAllocations,
  buildSandboxPresetState,
  fitSandboxAllocationsToBudget,
  getSandboxEquippedItems,
  getSandboxAllocationBudget,
  getSandboxInventoryOptionsForSlot,
  maxSandboxEquippedSkills,
  reconcileSandboxRoundDraftSelections,
  reconcileSandboxEquippedSkillIds,
  requireSandboxCharacter,
  toggleSandboxEquippedSkillId,
} from "@/orchestration/combat/combatSandboxSupport";

describe("combatSandboxSupport", () => {
  it("creates a required sandbox character and throws on invalid input", () => {
    const character = requireSandboxCharacter("Player");

    expect(character.name).toBe("Player");
    expect(() => requireSandboxCharacter("")).toThrow();
  });

  it("applies stat allocations to the base character", () => {
    const created = createCharacter("Allocator");

    if (!created.success) {
      throw new Error(created.reason);
    }

    const allocated = applySandboxAllocations(created.data, {
      strength: 2,
      agility: 1,
      rage: 0,
      endurance: 0,
    });

    expect(allocated.baseStats).toEqual({
      strength: 5,
      agility: 4,
      rage: 3,
      endurance: 3,
    });
    expect(allocated.unspentStatPoints).toBe(2);
  });

  it("reconciles invalid skill and consumable selections out of the round draft", () => {
    const draft: RoundDraft = {
      ...createRoundDraft(),
      selectedAction: { kind: "skill_attack", skillId: "missing-skill" },
    };

    const reconciled = reconcileSandboxRoundDraftSelections(
      draft,
      [{ id: "available-skill" }],
      [{ item: { code: "available-consumable" } }]
    );

    expect(getRoundDraftSelectedSkillId(reconciled)).toBeNull();
    expect(getRoundDraftSelectedConsumableCode(reconciled)).toBeNull();
  });

  it("switches an unaffordable selected skill back to basic attack when resources are too low", () => {
    const draft: RoundDraft = {
      ...createRoundDraft(),
      selectedAction: { kind: "skill_attack", skillId: "available-skill" },
    };

    const reconciled = reconcileSandboxRoundDraftSelections(
      draft,
      [{ id: "available-skill", resourceType: "momentum", cost: 20 }],
      [],
      { rage: 0, guard: 0, momentum: 10, focus: 0 }
    );

    expect(getRoundDraftSelectedSkillId(reconciled)).toBeNull();
    expect(reconciled.selectedAction).toEqual({ kind: "basic_attack" });
  });

  it("maps equipped items and filters inventory options by slot", () => {
    const inventory = createStarterInventory();
    const withSword = equipItem(createEquipment(), inventory, "bk-item-6");

    if (!withSword.success) {
      throw new Error(withSword.reason);
    }

    const withHelmet = equipItem(withSword.data, inventory, "bk-item-366");

    if (!withHelmet.success) {
      throw new Error(withHelmet.reason);
    }

    const equippedItems = getSandboxEquippedItems(withHelmet.data, inventory);
    const mainHand = equippedItems.find((entry) => entry.slot === "mainHand");
    const helmetOptions = getSandboxInventoryOptionsForSlot(inventory, "helmet");

    expect(mainHand?.item?.code).toBe("bk-item-6");
    expect(helmetOptions.some((entry) => entry.item.code === "bk-item-366")).toBe(true);
    expect(helmetOptions.every((entry) => entry.item.equip?.slot === "helmet")).toBe(true);
  });

  it("builds preset equipment and allocations from sandbox preset data", () => {
    const inventory = createStarterInventory();

    const result = buildSandboxPresetState({
      inventory,
      preset: {
        loadout: ["bk-item-6", "bk-item-366", "bk-item-411"],
        allocations: {
          strength: 2,
          agility: 0,
          rage: 1,
          endurance: 0,
        },
      },
    });

    expect(result.equipment.slots.mainHand).toBe("bk-item-6");
    expect(result.equipment.slots.helmet).toBe("bk-item-366");
    expect(result.equipment.slots.belt).toBe("bk-item-411");
    expect(result.playerAllocations).toEqual({
      strength: 2,
      agility: 0,
      rage: 1,
      endurance: 0,
    });
  });

  it("keeps only unlocked preset skills when the loadout includes a skill carrier item", () => {
    const inventory = createStarterInventory();

    const result = buildSandboxPresetState({
      inventory,
      preset: {
        loadout: ["bk-item-206", "starter-sigil-pressure"],
        allocations: {
          strength: 2,
          agility: 0,
          rage: 1,
          endurance: 0,
        },
        skillLoadout: ["opening-sense", "execution-arc", "missing-skill"],
      },
    });

    expect(result.equipment.slots.mainHand).toBe("bk-item-206");
    expect(result.equipment.slots.earring).toBe("starter-sigil-pressure");
    expect(result.equippedSkillIds).toEqual(["opening-sense", "execution-arc"]);
  });

  it("reconciles equipped skill ids and limits the manual skill loadout to five slots", () => {
    const availableSkills = [
      { id: "skill-1" },
      { id: "skill-2" },
      { id: "skill-3" },
      { id: "skill-4" },
      { id: "skill-5" },
      { id: "skill-6" },
    ];

    expect(reconcileSandboxEquippedSkillIds(["skill-1", "missing", "skill-2"], availableSkills)).toEqual([
      "skill-1",
      "skill-2",
    ]);

    let equippedSkillIds: string[] = [];
    for (const skill of availableSkills) {
      equippedSkillIds = toggleSandboxEquippedSkillId(equippedSkillIds, skill.id, availableSkills);
    }

    expect(equippedSkillIds).toHaveLength(maxSandboxEquippedSkills);
    expect(equippedSkillIds).toEqual(["skill-1", "skill-2", "skill-3", "skill-4", "skill-5"]);

    expect(toggleSandboxEquippedSkillId(equippedSkillIds, "skill-2", availableSkills)).toEqual([
      "skill-1",
      "skill-3",
      "skill-4",
      "skill-5",
    ]);
  });

  it("fits bot allocations to the current player budget", () => {
    const playerBudget = getSandboxAllocationBudget({
      strength: 2,
      agility: 1,
      rage: 0,
      endurance: 0,
    });

    expect(
      fitSandboxAllocationsToBudget(
        {
          strength: 2,
          agility: 0,
          rage: 1,
          endurance: 2,
        },
        playerBudget
      )
    ).toEqual({
      strength: 2,
      agility: 0,
      rage: 1,
      endurance: 0,
    });
  });
});
