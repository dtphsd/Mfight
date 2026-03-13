import type { HighlightMode, RuleSection, RuleTone } from "./types";

export function getCombatRulesHighlightMode(section: RuleSection): HighlightMode {
  return section.id === "resources" || section.id === "skills" || section.id === "items"
    ? "resource"
    : "default";
}

export function getCombatRulesCalloutClass(tone?: RuleTone) {
  return `combat-rules-library__callout${tone ? ` combat-rules-library__callout--${tone}` : ""}`;
}
