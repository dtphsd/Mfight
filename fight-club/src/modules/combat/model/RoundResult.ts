import type { CombatZone } from "@/modules/combat/model/CombatZone";
import type { CombatResources } from "@/modules/combat/model/CombatResources";
import type { DamageType } from "@/modules/inventory/model/Item";

export type CombatLogEventType = "dodge" | "hit" | "block" | "crit" | "penetration" | "consumable";
export interface RoundEffectChange {
  targetId: string;
  targetName: string;
  effectName: string;
  kind: "buff" | "debuff";
  turnsRemaining: number;
  stackCount?: number;
}

export interface RoundResult {
  round: number;
  timestamp: number;
  type: CombatLogEventType;
  attackerId: string;
  attackerName: string;
  defenderId: string;
  defenderName: string;
  attackZone: CombatZone;
  damageType: DamageType;
  skillName: string | null;
  consumableName?: string | null;
  dodged: boolean;
  blocked: boolean;
  penetrated: boolean;
  crit: boolean;
  damage: number;
  finalDamage: number;
  healedHp: number;
  blockedPercent: number | null;
  defenderHpAfter: number;
  attackerHpAfter: number | null;
  attackerResourceGain: Partial<CombatResources>;
  defenderResourceGain: Partial<CombatResources>;
  appliedEffects?: RoundEffectChange[];
  expiredEffects?: RoundEffectChange[];
  messages: string[];
  commentary: string;
  knockoutCommentary: string | null;
}
