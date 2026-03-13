export type CombatResourceType = "rage" | "guard" | "momentum" | "focus";

export interface CombatResources {
  rage: number;
  guard: number;
  momentum: number;
  focus: number;
}

export const zeroCombatResources: CombatResources = {
  rage: 0,
  guard: 0,
  momentum: 0,
  focus: 0,
};

export const maxCombatResources: CombatResources = {
  rage: 100,
  guard: 100,
  momentum: 100,
  focus: 100,
};

export function addCombatResources(
  current: CombatResources,
  gains: Partial<CombatResources>
): CombatResources {
  return {
    rage: clampCombatResource(current.rage + (gains.rage ?? 0), maxCombatResources.rage),
    guard: clampCombatResource(current.guard + (gains.guard ?? 0), maxCombatResources.guard),
    momentum: clampCombatResource(current.momentum + (gains.momentum ?? 0), maxCombatResources.momentum),
    focus: clampCombatResource(current.focus + (gains.focus ?? 0), maxCombatResources.focus),
  };
}

function clampCombatResource(value: number, max: number) {
  return Math.max(0, Math.min(max, Math.floor(value)));
}
