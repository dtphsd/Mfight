import type { CombatState } from "@/modules/combat";
import { zeroArmorProfile, zeroDamageProfile } from "@/modules/inventory";
import { createBattleLogEntries, getBattleLogVisibleTags, getUniquePhrase } from "@/ui/components/combat/battleLogFormatting";

describe("battle log phrase selection", () => {
  it("avoids immediate repeats while the pool still has alternatives", () => {
    const recentPhrasesByKey = new Map<string, string[]>();
    const phrases = ["first", "second", "third"];

    const firstPick = getUniquePhrase("crit", phrases, recentPhrasesByKey);
    const secondPick = getUniquePhrase("crit", phrases, recentPhrasesByKey);
    const thirdPick = getUniquePhrase("crit", phrases, recentPhrasesByKey);

    expect(firstPick).toBe("first");
    expect(secondPick).toBe("second");
    expect(thirdPick).toBe("third");
  });

  it("falls back gracefully when all phrases are already in recent history", () => {
    const recentPhrasesByKey = new Map<string, string[]>();
    const phrases = ["only"];

    const firstPick = getUniquePhrase("dodge", phrases, recentPhrasesByKey);
    const secondPick = getUniquePhrase("dodge", phrases, recentPhrasesByKey);

    expect(firstPick).toBe("only");
    expect(secondPick).toBe("only");
  });

  it("keeps anti-repeat history isolated between different keys", () => {
    const recentPhrasesByKey = new Map<string, string[]>();
    const phrases = ["first", "second"];

    const playerPick = getUniquePhrase("player:crit", phrases, recentPhrasesByKey);
    const botPick = getUniquePhrase("bot:crit", phrases, recentPhrasesByKey);

    expect(playerPick).toBe("first");
    expect(botPick).toBe("first");
  });

  it("includes resource gains in battle log entries", () => {
    const state: CombatState = {
      id: "combat-1",
      round: 2,
      status: "active",
      winnerId: null,
      combatants: [
        {
          id: "player-1",
          name: "Player",
          stats: { strength: 3, agility: 3, rage: 3, endurance: 3 },
          maxHp: 100,
          currentHp: 90,
          resources: { rage: 10, guard: 0, momentum: 0, focus: 0 },
          damage: zeroDamageProfile,
          armor: zeroArmorProfile,
          armorBySlot: {},
          critChanceBonus: 0,
          critMultiplierBonus: 0,
          dodgeChanceBonus: 0,
          blockChanceBonus: 0,
          blockPowerBonus: 0,
          armorPenetrationFlat: zeroDamageProfile,
          armorPenetrationPercent: zeroDamageProfile,
          preferredDamageType: null,
          weaponClass: null,
          attackZone: null,
          defenseZones: [],
          activeEffects: [],
        },
        {
          id: "bot-1",
          name: "Arena Bot",
          stats: { strength: 3, agility: 3, rage: 3, endurance: 3 },
          maxHp: 100,
          currentHp: 90,
          resources: { rage: 0, guard: 12, momentum: 0, focus: 0 },
          damage: zeroDamageProfile,
          armor: zeroArmorProfile,
          armorBySlot: {},
          critChanceBonus: 0,
          critMultiplierBonus: 0,
          dodgeChanceBonus: 0,
          blockChanceBonus: 0,
          blockPowerBonus: 0,
          armorPenetrationFlat: zeroDamageProfile,
          armorPenetrationPercent: zeroDamageProfile,
          preferredDamageType: null,
          weaponClass: null,
          attackZone: null,
          defenseZones: [],
          activeEffects: [],
        },
      ],
      log: [
        {
          round: 1,
          timestamp: 1,
          type: "crit",
          attackerId: "player-1",
          attackerName: "Player",
          defenderId: "bot-1",
          defenderName: "Arena Bot",
          attackZone: "head",
          damageType: "slash",
          skillName: null,
          dodged: false,
          blocked: false,
          penetrated: false,
          crit: true,
          damage: 12,
          finalDamage: 12,
          healedHp: 0,
          blockedPercent: null,
          defenderHpAfter: 88,
          attackerHpAfter: 90,
          attackerResourceGain: { rage: 14 },
          defenderResourceGain: {},
          appliedEffects: [
            {
              targetId: "bot-1",
              targetName: "Arena Bot",
              effectName: "Bleeding Line",
              kind: "debuff",
              turnsRemaining: 1,
            },
          ],
          messages: [],
          commentary: "fallback-player",
          knockoutCommentary: null,
        },
      ],
    };

    const entries = createBattleLogEntries(state, "player-1", "bot-1");

    expect(entries[0].attackerResourceGain).toEqual({ rage: 14 });
    expect(entries[0].headline).toContain("Player");
    expect(entries[0].explanation).toContain("Zone: Head");
    expect(entries[0].explanation).toContain("Type: Slash");
    expect(entries[0].explanation).toContain("Gain: Rage +14");
    expect(entries[0].explanation).toContain("Debuff: Bleeding Line on Arena Bot");
    expect(entries[0].tagGroups.outcome).toContain("Critical");
    expect(entries[0].tagGroups.context).toContain("Zone: Head");
    expect(entries[0].tagGroups.context).toContain("Type: Slash");
    expect(entries[0].tagGroups.effects).toContain("Gain: Rage +14");
    expect(entries[0].tagGroups.effects).toContain("Debuff: Bleeding Line on Arena Bot");
    expect(getBattleLogVisibleTags(entries[0])).toEqual(["Critical", "Zone: Head", "Type: Slash", "Gain: Rage +14"]);
  });

  it("adds compact reason tags for defense outcomes", () => {
    const state: CombatState = {
      id: "combat-2",
      round: 4,
      status: "active",
      winnerId: null,
      combatants: [
        {
          id: "player-1",
          name: "Player",
          stats: { strength: 3, agility: 3, rage: 3, endurance: 3 },
          maxHp: 100,
          currentHp: 90,
          resources: { rage: 0, guard: 0, momentum: 0, focus: 0 },
          damage: zeroDamageProfile,
          armor: zeroArmorProfile,
          armorBySlot: {},
          critChanceBonus: 0,
          critMultiplierBonus: 0,
          dodgeChanceBonus: 0,
          blockChanceBonus: 0,
          blockPowerBonus: 0,
          armorPenetrationFlat: zeroDamageProfile,
          armorPenetrationPercent: zeroDamageProfile,
          preferredDamageType: null,
          weaponClass: null,
          attackZone: null,
          defenseZones: [],
          activeEffects: [],
        },
        {
          id: "bot-1",
          name: "Arena Bot",
          stats: { strength: 3, agility: 3, rage: 3, endurance: 3 },
          maxHp: 100,
          currentHp: 90,
          resources: { rage: 0, guard: 0, momentum: 0, focus: 0 },
          damage: zeroDamageProfile,
          armor: zeroArmorProfile,
          armorBySlot: {},
          critChanceBonus: 0,
          critMultiplierBonus: 0,
          dodgeChanceBonus: 0,
          blockChanceBonus: 0,
          blockPowerBonus: 0,
          armorPenetrationFlat: zeroDamageProfile,
          armorPenetrationPercent: zeroDamageProfile,
          preferredDamageType: null,
          weaponClass: null,
          attackZone: null,
          defenseZones: [],
          activeEffects: [],
        },
      ],
      log: [
        {
          round: 2,
          timestamp: 2,
          type: "block",
          attackerId: "player-1",
          attackerName: "Player",
          defenderId: "bot-1",
          defenderName: "Arena Bot",
          attackZone: "chest",
          damageType: "slash",
          skillName: null,
          dodged: false,
          blocked: true,
          penetrated: false,
          crit: false,
          damage: 10,
          finalDamage: 4,
          healedHp: 0,
          blockedPercent: 60,
          defenderHpAfter: 96,
          attackerHpAfter: 90,
          attackerResourceGain: {},
          defenderResourceGain: {},
          messages: [],
          commentary: "fallback-block",
          knockoutCommentary: null,
        },
        {
          round: 3,
          timestamp: 3,
          type: "penetration",
          attackerId: "player-1",
          attackerName: "Player",
          defenderId: "bot-1",
          defenderName: "Arena Bot",
          attackZone: "belly",
          damageType: "pierce",
          skillName: null,
          dodged: false,
          blocked: false,
          penetrated: true,
          crit: false,
          damage: 11,
          finalDamage: 11,
          healedHp: 0,
          blockedPercent: null,
          defenderHpAfter: 85,
          attackerHpAfter: 90,
          attackerResourceGain: {},
          defenderResourceGain: {},
          messages: [],
          commentary: "fallback-pen",
          knockoutCommentary: null,
        },
        {
          round: 4,
          timestamp: 4,
          type: "dodge",
          attackerId: "player-1",
          attackerName: "Player",
          defenderId: "bot-1",
          defenderName: "Arena Bot",
          attackZone: "head",
          damageType: "slash",
          skillName: null,
          dodged: true,
          blocked: false,
          penetrated: false,
          crit: false,
          damage: 0,
          finalDamage: 0,
          healedHp: 0,
          blockedPercent: null,
          defenderHpAfter: 85,
          attackerHpAfter: 90,
          attackerResourceGain: {},
          defenderResourceGain: {},
          messages: [],
          commentary: "fallback-dodge",
          knockoutCommentary: null,
        },
      ],
    };

    const entries = createBattleLogEntries(state, "player-1", "bot-1");

    expect(entries.find((entry) => entry.type === "block")?.tagGroups.reasons).toContain("Guard Held");
    expect(entries.find((entry) => entry.type === "penetration")?.tagGroups.reasons).toContain("Guard Broken");
    expect(entries.find((entry) => entry.type === "dodge")?.tagGroups.reasons).toContain("Clean Evade");
    expect(entries.find((entry) => entry.type === "block")?.headline).toContain("blocks Player's attack");
  });

  it("formats zero-damage blocked hits as a full block instead of a critical zero hit", () => {
    const state: CombatState = {
      id: "combat-2b",
      round: 5,
      status: "active",
      winnerId: null,
      combatants: [
        {
          id: "player-1",
          name: "Player",
          stats: { strength: 3, agility: 3, rage: 3, endurance: 3 },
          maxHp: 100,
          currentHp: 100,
          resources: { rage: 14, guard: 0, momentum: 0, focus: 0 },
          damage: zeroDamageProfile,
          armor: zeroArmorProfile,
          armorBySlot: {},
          critChanceBonus: 0,
          critMultiplierBonus: 0,
          dodgeChanceBonus: 0,
          blockChanceBonus: 0,
          blockPowerBonus: 0,
          armorPenetrationFlat: zeroDamageProfile,
          armorPenetrationPercent: zeroDamageProfile,
          preferredDamageType: null,
          weaponClass: null,
          attackZone: null,
          defenseZones: [],
          activeEffects: [],
        },
        {
          id: "bot-1",
          name: "Arena Bot",
          stats: { strength: 3, agility: 3, rage: 3, endurance: 3 },
          maxHp: 100,
          currentHp: 100,
          resources: { rage: 0, guard: 0, momentum: 0, focus: 0 },
          damage: zeroDamageProfile,
          armor: zeroArmorProfile,
          armorBySlot: {},
          critChanceBonus: 0,
          critMultiplierBonus: 0,
          dodgeChanceBonus: 0,
          blockChanceBonus: 0,
          blockPowerBonus: 0,
          armorPenetrationFlat: zeroDamageProfile,
          armorPenetrationPercent: zeroDamageProfile,
          preferredDamageType: null,
          weaponClass: null,
          attackZone: null,
          defenseZones: [],
          activeEffects: [],
        },
      ],
      log: [
        {
          round: 5,
          timestamp: 5,
          type: "crit",
          attackerId: "player-1",
          attackerName: "Player",
          defenderId: "bot-1",
          defenderName: "Arena Bot",
          attackZone: "head",
          damageType: "slash",
          skillName: null,
          consumableName: "Bandage",
          dodged: false,
          blocked: true,
          penetrated: false,
          crit: true,
          damage: 0,
          finalDamage: 0,
          healedHp: 12,
          blockedPercent: 100,
          defenderHpAfter: 100,
          attackerHpAfter: 100,
          attackerResourceGain: { rage: 14 },
          defenderResourceGain: {},
          appliedEffects: [],
          expiredEffects: [],
          messages: ["consumable", "block", "crit"],
          commentary: "fallback-zero",
          knockoutCommentary: null,
        },
      ],
    };

    const [entry] = createBattleLogEntries(state, "player-1", "bot-1");

    expect(entry.headline).toBe("Arena Bot blocked all damage from Player's attack");
    expect(entry.tagGroups.outcome).toContain("Full Block");
    expect(entry.tagGroups.reasons).toContain("Blocked All Damage");
  });

  it("prioritizes visible tags by semantic group order", () => {
    const entry = {
      id: "entry-1",
      sequence: 1,
      timestamp: 1,
      round: 1,
      type: "crit" as const,
      attackerId: "player-1",
      attackerName: "Player",
      defenderId: "bot-1",
      defenderName: "Bot",
      attackZone: "head" as const,
      damageType: "slash",
      damage: 18,
      healedHp: 0,
      blockedPercent: null,
      attackerResourceGain: { rage: 10 },
      defenderResourceGain: { guard: 4 },
      isEffectTick: false,
      headline: "test",
      explanation: "test",
      tagGroups: {
        outcome: ["Critical"],
        context: ["Skill: Feint Slash", "Zone: Head"],
        reasons: ["Guard Broken"],
        effects: ["Gain: Rage +10", "Def: Guard +4"],
      },
    };

    expect(getBattleLogVisibleTags(entry)).toEqual([
      "Critical",
      "Skill: Feint Slash",
      "Zone: Head",
      "Guard Broken",
    ]);
  });

  it("uses an ASCII explanation separator for factual sublines", () => {
    const state: CombatState = {
      id: "combat-3",
      round: 1,
      status: "active",
      winnerId: null,
      combatants: [
        {
          id: "player-1",
          name: "Player",
          stats: { strength: 3, agility: 3, rage: 3, endurance: 3 },
          maxHp: 100,
          currentHp: 100,
          resources: { rage: 0, guard: 0, momentum: 0, focus: 6 },
          damage: zeroDamageProfile,
          armor: zeroArmorProfile,
          armorBySlot: {},
          critChanceBonus: 0,
          critMultiplierBonus: 0,
          dodgeChanceBonus: 0,
          blockChanceBonus: 0,
          blockPowerBonus: 0,
          armorPenetrationFlat: zeroDamageProfile,
          armorPenetrationPercent: zeroDamageProfile,
          preferredDamageType: null,
          weaponClass: null,
          attackZone: null,
          defenseZones: [],
          activeEffects: [],
        },
        {
          id: "bot-1",
          name: "Arena Bot",
          stats: { strength: 3, agility: 3, rage: 3, endurance: 3 },
          maxHp: 100,
          currentHp: 100,
          resources: { rage: 0, guard: 0, momentum: 0, focus: 0 },
          damage: zeroDamageProfile,
          armor: zeroArmorProfile,
          armorBySlot: {},
          critChanceBonus: 0,
          critMultiplierBonus: 0,
          dodgeChanceBonus: 0,
          blockChanceBonus: 0,
          blockPowerBonus: 0,
          armorPenetrationFlat: zeroDamageProfile,
          armorPenetrationPercent: zeroDamageProfile,
          preferredDamageType: null,
          weaponClass: null,
          attackZone: null,
          defenseZones: [],
          activeEffects: [],
        },
      ],
      log: [
        {
          round: 1,
          timestamp: 1,
          type: "consumable",
          attackerId: "player-1",
          attackerName: "Player",
          defenderId: "bot-1",
          defenderName: "Arena Bot",
          attackZone: "head",
          damageType: "slash",
          skillName: null,
          consumableName: "Bandage",
          dodged: false,
          blocked: false,
          penetrated: false,
          crit: false,
          damage: 0,
          finalDamage: 0,
          healedHp: 0,
          blockedPercent: null,
          defenderHpAfter: 100,
          attackerHpAfter: 100,
          attackerResourceGain: { focus: 6 },
          defenderResourceGain: {},
          messages: [],
          commentary: "fallback-item",
          knockoutCommentary: null,
        },
      ],
    };

    const [entry] = createBattleLogEntries(state, "player-1", "bot-1");

    expect(entry.headline).toBe("Player uses Bandage");
    expect(entry.explanation).toContain("Item: Bandage | Zone: Head | Type: Slash | Gain: Focus +6");
  });

  it("shows healing from effect ticks in the battle log explanation", () => {
    const state: CombatState = {
      id: "combat-4",
      round: 2,
      status: "active",
      winnerId: null,
      combatants: [
        {
          id: "player-1",
          name: "Player",
          stats: { strength: 3, agility: 3, rage: 3, endurance: 3 },
          maxHp: 100,
          currentHp: 88,
          resources: { rage: 0, guard: 0, momentum: 0, focus: 0 },
          damage: zeroDamageProfile,
          armor: zeroArmorProfile,
          armorBySlot: {},
          critChanceBonus: 0,
          critMultiplierBonus: 0,
          dodgeChanceBonus: 0,
          blockChanceBonus: 0,
          blockPowerBonus: 0,
          armorPenetrationFlat: zeroDamageProfile,
          armorPenetrationPercent: zeroDamageProfile,
          preferredDamageType: null,
          weaponClass: null,
          attackZone: null,
          defenseZones: [],
          activeEffects: [],
        },
        {
          id: "bot-1",
          name: "Arena Bot",
          stats: { strength: 3, agility: 3, rage: 3, endurance: 3 },
          maxHp: 100,
          currentHp: 100,
          resources: { rage: 0, guard: 0, momentum: 0, focus: 0 },
          damage: zeroDamageProfile,
          armor: zeroArmorProfile,
          armorBySlot: {},
          critChanceBonus: 0,
          critMultiplierBonus: 0,
          dodgeChanceBonus: 0,
          blockChanceBonus: 0,
          blockPowerBonus: 0,
          armorPenetrationFlat: zeroDamageProfile,
          armorPenetrationPercent: zeroDamageProfile,
          preferredDamageType: null,
          weaponClass: null,
          attackZone: null,
          defenseZones: [],
          activeEffects: [],
        },
      ],
      log: [
        {
          round: 2,
          timestamp: 2,
          type: "consumable",
          attackerId: "player-1",
          attackerName: "Player",
          defenderId: "player-1",
          defenderName: "Player",
          attackZone: "head",
          damageType: "blunt",
          skillName: null,
          consumableName: null,
          dodged: false,
          blocked: false,
          penetrated: false,
          crit: false,
          damage: 0,
          finalDamage: 0,
          healedHp: 6,
          blockedPercent: null,
          defenderHpAfter: 94,
          attackerHpAfter: 94,
          attackerResourceGain: {},
          defenderResourceGain: {},
          appliedEffects: [],
          expiredEffects: [],
          messages: ["effects"],
          commentary: "Recovers 6 HP from regeneration",
          knockoutCommentary: null,
        },
      ],
    };

    const [entry] = createBattleLogEntries(state, "player-1", "bot-1");

    expect(entry.headline).toBe("Player recovers 6 HP from active effects");
    expect(entry.explanation).toBe("Heal: +6 HP");
    expect(entry.tagGroups.effects).toContain("Heal: +6 HP");
    expect(entry.isEffectTick).toBe(true);
  });
});
