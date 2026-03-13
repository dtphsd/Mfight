export interface CombatRulesScreenProps {
  onBack: () => void;
  onOpenCombatSandbox: () => void;
}

export type Locale = "en" | "ru";

export type RuleTone =
  | "strength"
  | "agility"
  | "rage"
  | "endurance"
  | "armor"
  | "slash"
  | "pierce"
  | "blunt"
  | "chop";

export type RuleSection = {
  id: string;
  title: string;
  intro: string;
  bullets: string[];
  callouts?: Array<{ label: string; value: string; tone?: RuleTone }>;
  steps?: string[];
  table?: {
    columns: string[];
    rows: string[][];
  };
};

export type RulePageCopy = {
  eyebrow: string;
  title: string;
  lead: string;
  openSandbox: string;
  backToMenu: string;
  contentsTitle: string;
  contents: Array<{ id: string; label: string }>;
  sections: RuleSection[];
};

export type HighlightMode = "default" | "resource";
