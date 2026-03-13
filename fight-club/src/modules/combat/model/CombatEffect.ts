import type { CombatResources } from "@/modules/combat/model/CombatResources";
import type { ArmorProfile, DamageProfile } from "@/modules/inventory";

export type CombatEffectKind = "buff" | "debuff";
export type CombatEffectTarget = "self" | "target";
export type CombatEffectTrigger = "on_use" | "on_hit";

export interface CombatEffectModifiers {
  critChanceBonus: number;
  dodgeChanceBonus: number;
  blockChanceBonus: number;
  blockPowerBonus: number;
  outgoingDamagePercent: number;
  incomingDamagePercent: number;
  armorFlatBonus: ArmorProfile;
  damageFlatBonus: DamageProfile;
  armorPenetrationPercentBonus: DamageProfile;
}

export interface CombatEffectPeriodic {
  heal: number;
  damage: number;
  resourceDelta: Partial<CombatResources>;
}

export interface CombatEffectDefinition {
  id: string;
  name: string;
  description: string;
  kind: CombatEffectKind;
  target: CombatEffectTarget;
  trigger: CombatEffectTrigger;
  durationTurns: number;
  maxStacks?: number;
  modifiers?: Partial<CombatEffectModifiers>;
  periodic?: Partial<CombatEffectPeriodic>;
}

export interface ActiveCombatEffect {
  id: string;
  effectId: string;
  name: string;
  description: string;
  kind: CombatEffectKind;
  sourceName: string;
  sourceSkillName: string | null;
  turnsRemaining: number;
  stackCount: number;
  maxStacks: number;
  modifiers: CombatEffectModifiers;
  periodic: CombatEffectPeriodic;
}

export function createZeroCombatEffectModifiers(): CombatEffectModifiers {
  return {
    critChanceBonus: 0,
    dodgeChanceBonus: 0,
    blockChanceBonus: 0,
    blockPowerBonus: 0,
    outgoingDamagePercent: 0,
    incomingDamagePercent: 0,
    armorFlatBonus: { slash: 0, pierce: 0, blunt: 0, chop: 0 },
    damageFlatBonus: { slash: 0, pierce: 0, blunt: 0, chop: 0 },
    armorPenetrationPercentBonus: { slash: 0, pierce: 0, blunt: 0, chop: 0 },
  };
}

export function createZeroCombatEffectPeriodic(): CombatEffectPeriodic {
  return {
    heal: 0,
    damage: 0,
    resourceDelta: {},
  };
}

export function normalizeCombatEffectDefinition(
  definition: CombatEffectDefinition,
  stackCount = 1
): Omit<ActiveCombatEffect, "id" | "sourceName" | "sourceSkillName" | "turnsRemaining"> {
  const normalizedStackCount = Math.max(1, Math.floor(stackCount));
  const maxStacks = Math.max(1, Math.floor(definition.maxStacks ?? 1));
  const zeroModifiers = createZeroCombatEffectModifiers();
  const zeroPeriodic = createZeroCombatEffectPeriodic();

  return {
    effectId: definition.id,
    name: definition.name,
    description: definition.description,
    kind: definition.kind,
    stackCount: normalizedStackCount,
    maxStacks,
    modifiers: {
      ...zeroModifiers,
      ...definition.modifiers,
      armorFlatBonus: {
        ...zeroModifiers.armorFlatBonus,
        ...scaleArmorProfile(definition.modifiers?.armorFlatBonus, normalizedStackCount),
      },
      damageFlatBonus: {
        ...zeroModifiers.damageFlatBonus,
        ...scaleDamageProfile(definition.modifiers?.damageFlatBonus, normalizedStackCount),
      },
      armorPenetrationPercentBonus: {
        ...zeroModifiers.armorPenetrationPercentBonus,
        ...scaleDamageProfile(definition.modifiers?.armorPenetrationPercentBonus, normalizedStackCount),
      },
      critChanceBonus: (definition.modifiers?.critChanceBonus ?? 0) * normalizedStackCount,
      dodgeChanceBonus: (definition.modifiers?.dodgeChanceBonus ?? 0) * normalizedStackCount,
      blockChanceBonus: (definition.modifiers?.blockChanceBonus ?? 0) * normalizedStackCount,
      blockPowerBonus: (definition.modifiers?.blockPowerBonus ?? 0) * normalizedStackCount,
      outgoingDamagePercent: (definition.modifiers?.outgoingDamagePercent ?? 0) * normalizedStackCount,
      incomingDamagePercent: (definition.modifiers?.incomingDamagePercent ?? 0) * normalizedStackCount,
    },
    periodic: {
      ...zeroPeriodic,
      ...definition.periodic,
      heal: (definition.periodic?.heal ?? 0) * normalizedStackCount,
      damage: (definition.periodic?.damage ?? 0) * normalizedStackCount,
      resourceDelta: {
        ...zeroPeriodic.resourceDelta,
        ...scaleCombatResources(definition.periodic?.resourceDelta, normalizedStackCount),
      },
    },
  };
}

function scaleDamageProfile(profile: Partial<DamageProfile> | undefined, factor: number): DamageProfile {
  return {
    slash: (profile?.slash ?? 0) * factor,
    pierce: (profile?.pierce ?? 0) * factor,
    blunt: (profile?.blunt ?? 0) * factor,
    chop: (profile?.chop ?? 0) * factor,
  };
}

function scaleArmorProfile(profile: Partial<ArmorProfile> | undefined, factor: number): ArmorProfile {
  return {
    slash: (profile?.slash ?? 0) * factor,
    pierce: (profile?.pierce ?? 0) * factor,
    blunt: (profile?.blunt ?? 0) * factor,
    chop: (profile?.chop ?? 0) * factor,
  };
}

function scaleCombatResources(resources: Partial<CombatResources> | undefined, factor: number): Partial<CombatResources> {
  return {
    rage: (resources?.rage ?? 0) * factor,
    guard: (resources?.guard ?? 0) * factor,
    momentum: (resources?.momentum ?? 0) * factor,
    focus: (resources?.focus ?? 0) * factor,
  };
}
