export const combatIntentOptions = ["neutral", "aggressive", "guarded", "precise"] as const;

export type CombatIntent = (typeof combatIntentOptions)[number];

export const combatIntentLabels: Record<CombatIntent, string> = {
  neutral: "Neutral",
  aggressive: "Aggressive",
  guarded: "Guarded",
  precise: "Precise",
};

export const combatIntentDescriptions: Record<CombatIntent, string> = {
  neutral: "No modifier.",
  aggressive: "DMG +8% | Crit +4 | Dodge -6 | Block -8 | Block Power -6",
  guarded: "DMG -6% | Dodge +8 | Block +10 | Block Power +8",
  precise: "DMG -4% | Crit +2 | Dodge -2 | Block -2 | Block Power -2 | Suppress +8 | State +30%",
};

export function formatCombatIntentLabel(intent: CombatIntent) {
  return combatIntentLabels[intent];
}
