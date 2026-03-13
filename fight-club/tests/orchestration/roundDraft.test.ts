import {
  buildPlayerRoundAction,
  clearRoundDraftConsumable,
  clearRoundDraftSelections,
  createRoundDraft,
  getRoundDraftSelectedConsumableCode,
  getRoundDraftSelectedSkillId,
  setRoundDraftAttackZone,
  setRoundDraftConsumable,
  setRoundDraftSkill,
  toggleRoundDraftDefenseZone,
} from "@/orchestration/combat/roundDraft";

describe("roundDraft", () => {
  it("creates a basic-attack draft by default", () => {
    const draft = createRoundDraft();

    expect(draft.attackZone).toBe("head");
    expect(draft.defenseZones).toEqual(["chest", "belly"]);
    expect(draft.selectedAction).toEqual({ kind: "basic_attack" });
    expect(getRoundDraftSelectedSkillId(draft)).toBeNull();
    expect(getRoundDraftSelectedConsumableCode(draft)).toBeNull();
  });

  it("updates attack zone and rotates defense selections", () => {
    const draft = createRoundDraft();
    const withAttackZone = setRoundDraftAttackZone(draft, "legs");
    const withDefenseToggle = toggleRoundDraftDefenseZone(withAttackZone, "head");

    expect(withAttackZone.attackZone).toBe("legs");
    expect(withDefenseToggle.defenseZones).toEqual(["belly", "head"]);
  });

  it("switches between skill, consumable, and basic attack selection", () => {
    const draft = createRoundDraft();
    const skillDraft = setRoundDraftSkill(draft, "feint");
    const comboConsumableDraft = setRoundDraftConsumable(skillDraft, "bandage", "with_attack");
    const soloConsumableDraft = setRoundDraftConsumable(comboConsumableDraft, "small-potion", "replace_attack");
    const clearedConsumableDraft = clearRoundDraftConsumable(soloConsumableDraft);
    const clearedDraft = clearRoundDraftSelections(clearedConsumableDraft);

    expect(skillDraft.selectedAction).toEqual({ kind: "skill_attack", skillId: "feint" });
    expect(getRoundDraftSelectedSkillId(skillDraft)).toBe("feint");

    expect(comboConsumableDraft.selectedAction).toEqual({
      kind: "consumable",
      consumableCode: "bandage",
      usageMode: "with_attack",
    });
    expect(getRoundDraftSelectedConsumableCode(comboConsumableDraft)).toBe("bandage");
    expect(getRoundDraftSelectedSkillId(comboConsumableDraft)).toBeNull();

    expect(soloConsumableDraft.selectedAction).toEqual({
      kind: "consumable",
      consumableCode: "small-potion",
      usageMode: "replace_attack",
    });
    expect(clearedConsumableDraft.selectedAction).toEqual({ kind: "basic_attack" });
    expect(clearedDraft.selectedAction).toEqual({ kind: "basic_attack" });
  });

  it("builds the correct explicit round action variant from the draft", () => {
    const basicAction = buildPlayerRoundAction({
      attackerId: "player-1",
      draft: createRoundDraft(),
      skill: null,
      consumable: null,
    });
    const skillAction = buildPlayerRoundAction({
      attackerId: "player-1",
      draft: setRoundDraftSkill(createRoundDraft(), "feint"),
      skill: {
        id: "feint",
        name: "Feint",
        description: "Test skill",
        sourceItemCode: "training-sword",
        resourceType: "momentum",
        cost: 20,
        damageMultiplier: 1.2,
        critChanceBonus: 5,
        armorPenetrationPercentBonus: {
          slash: 10,
          pierce: 0,
          blunt: 0,
          chop: 0,
        },
      },
      consumable: null,
    });
    const consumableAction = buildPlayerRoundAction({
      attackerId: "player-1",
      draft: setRoundDraftConsumable(createRoundDraft(), "small-potion", "replace_attack"),
      skill: null,
      consumable: {
        itemCode: "small-potion",
        itemName: "Small Potion",
        effect: {
          usageMode: "replace_attack",
          heal: 20,
          resourceRestore: {},
        },
      },
    });
    const consumableAttackAction = buildPlayerRoundAction({
      attackerId: "player-1",
      draft: setRoundDraftConsumable(createRoundDraft(), "bandage", "with_attack"),
      skill: null,
      consumable: {
        itemCode: "bandage",
        itemName: "Bandage",
        effect: {
          usageMode: "with_attack",
          heal: 12,
          resourceRestore: { guard: 6 },
        },
      },
    });

    expect(basicAction.kind).toBe("basic_attack");
    expect(skillAction.kind).toBe("skill_attack");
    expect(consumableAction.kind).toBe("consumable");
    expect(consumableAttackAction.kind).toBe("consumable_attack");
  });
});
