import type { CharacterStatName } from "@/modules/character";
import type { CombatSkill } from "@/modules/combat";
import type { ArmorProfile, DamageProfile } from "@/modules/inventory";

export interface BuilderPopoverProps {
  buildPresets: Array<{ id: string; label: string; description?: string }>;
  unlockedSkills?: CombatSkill[];
  equippedSkillIds?: string[];
  maxEquippedSkills?: number;
  playerCharacter: {
    unspentStatPoints: number;
    baseStats: Record<CharacterStatName, number>;
  };
  metrics: {
    maxHp: number;
    baseAttackDamage: number;
    weaponDamage: number;
    totalDamage: number;
    totalArmor: number;
    baseDodgeChance: number;
    dodgeVsBot: number;
    baseCritChance: number;
    critVsBot: number;
    critChanceBonus: number;
    dodgeChanceBonus: number;
    blockChanceBonus: number;
    blockPowerBonus: number;
    baseBlockPenetration: number;
    blockPenetrationVsBot: number;
    totalCritMultiplier: number;
    preferredDamageType: string | null;
    weaponClass: string | null;
    damageProfile: DamageProfile;
    armorProfile: ArmorProfile;
    armorBySlot: Record<string, ArmorProfile>;
    armorPenetrationFlat: DamageProfile;
    armorPenetrationPercent: DamageProfile;
    mainHandLabel: string | null;
    offHandLabel: string | null;
    weaponHandedness: string | null;
    weaponDamageType: string | null;
    opponentMaxHp: number;
    opponentTotalDamage: number;
    opponentTotalArmor: number;
    opponentWeaponDamageType: string | null;
    matchup: {
      playerPrimaryType: string | null;
      playerPrimaryDamage: number;
      botArmorVsPlayer: number;
      playerPenFlat: number;
      playerPenPercent: number;
      playerCritVsBot: number;
      playerDodgeVsBot: number;
      playerBlockPenVsBot: number;
      botPrimaryType: string | null;
      botPrimaryDamage: number;
      playerArmorVsBot: number;
      botPenFlat: number;
      botPenPercent: number;
      botCritVsPlayer: number;
      botDodgeVsPlayer: number;
      botBlockPenVsPlayer: number;
      playerZonePressure: ZonePressure;
      botZonePressure: ZonePressure;
    };
  };
  increaseStat: (statName: CharacterStatName) => void;
  decreaseStat: (statName: CharacterStatName) => void;
  applyPreset: (presetId: string) => void;
  resetBuild: () => void;
  toggleEquippedSkill: (skillId: string) => void;
  onOpenBuildPresets: () => void;
  onClose: () => void;
}

export type ZonePressure = {
  bestOpen: ZoneOutlook;
  worstOpen: ZoneOutlook;
  bestGuarded: ZoneOutlook;
  worstGuarded: ZoneOutlook;
};

export type ZoneOutlook = {
  zone: string;
  openDamage: number;
  guardedDamage: number;
};
