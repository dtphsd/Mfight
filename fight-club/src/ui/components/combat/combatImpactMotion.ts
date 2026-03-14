export type CombatImpactVariant = "hit" | "crit" | "block" | "block_break" | "dodge";

export const COMBAT_IMPACT_LINGER_DURATION_MS = 5000;

export function getCombatImpactMotionDurationMs(impactVariant: CombatImpactVariant) {
  switch (impactVariant) {
    case "crit":
      return 380;
    case "block_break":
      return 460;
    case "block":
      return 420;
    case "dodge":
      return 520;
    case "hit":
    default:
      return 300;
  }
}

export function getCombatImpactLabel(impactVariant: CombatImpactVariant) {
  switch (impactVariant) {
    case "crit":
      return "CRIT";
    case "block_break":
      return "BLOCK BREAK";
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
    impactVariant === "block_break"
  );
}
