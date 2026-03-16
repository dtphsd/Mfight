export type CombatImpactVariant = "hit" | "crit" | "block" | "block_break" | "penetration" | "dodge";

export const COMBAT_IMPACT_LINGER_DURATION_MS = 6000;

export function getCombatImpactMotionDurationMs(impactVariant: CombatImpactVariant) {
  switch (impactVariant) {
    case "crit":
      return 456;
    case "block_break":
      return 552;
    case "penetration":
      return 504;
    case "block":
      return 504;
    case "dodge":
      return 624;
    case "hit":
    default:
      return 360;
  }
}

export function getCombatImpactLabel(impactVariant: CombatImpactVariant) {
  switch (impactVariant) {
    case "crit":
      return "CRIT";
    case "block_break":
      return "BLOCK BREAK";
    case "penetration":
      return "PIERCE";
    case "block":
      return "BLOCK";
    case "dodge":
      return "DODGE";
    case "hit":
    default:
      return "HIT";
  }
}

export function shouldShowCombatImpactValue(
  impactVariant: CombatImpactVariant,
  impactValue: number | null
) {
  if (impactValue === null || impactValue <= 0) {
    return false;
  }

  return (
    impactVariant === "hit" ||
    impactVariant === "crit" ||
    impactVariant === "block" ||
    impactVariant === "block_break" ||
    impactVariant === "penetration"
  );
}
