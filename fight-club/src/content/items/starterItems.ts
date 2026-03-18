import { starterSkillItems } from "@/content/combat/starterSkillItems";

import { starterItems as generatedStarterItems } from "./generatedBattleKingsStarterItems";

export const starterItems = [...generatedStarterItems, ...starterSkillItems];
