import type { CSSProperties, ReactNode } from "react";
import type { CharacterStatName } from "@/modules/character";
import type { CombatSkill } from "@/modules/combat";
import type { ArmorProfile, DamageProfile } from "@/modules/inventory";
import { ActionButton } from "@/ui/components/shared/ActionButton";
import { ModalOverlay } from "@/ui/components/shared/ModalOverlay";
import { ModalSurface } from "@/ui/components/shared/ModalSurface";
import { PanelCard as SharedPanelCard } from "@/ui/components/shared/PanelCard";

interface BuilderPopoverProps {
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

type ZonePressure = {
  bestOpen: ZoneOutlook;
  worstOpen: ZoneOutlook;
  bestGuarded: ZoneOutlook;
  worstGuarded: ZoneOutlook;
};

type ZoneOutlook = {
  zone: string;
  openDamage: number;
  guardedDamage: number;
};

const statMeta: Record<
  CharacterStatName,
  { label: string; short: string; effect: string; color: string; tint: string }
> = {
  strength: {
    label: "Strength",
    short: "STR",
    effect: "Base damage and block penetration",
    color: "#e5734f",
    tint: "rgba(229,115,79,0.14)",
  },
  agility: {
    label: "Agility",
    short: "AGI",
    effect: "Initiative and dodge chance",
    color: "#5cc7b2",
    tint: "rgba(92,199,178,0.14)",
  },
  rage: {
    label: "Rage",
    short: "RAG",
    effect: "Critical chance and crit damage",
    color: "#d85d91",
    tint: "rgba(216,93,145,0.14)",
  },
  endurance: {
    label: "Endurance",
    short: "END",
    effect: "Max HP and stronger block rolls",
    color: "#d6b15f",
    tint: "rgba(214,177,95,0.14)",
  },
};

const secondaryButtonStyle: CSSProperties = {
  padding: "8px 12px",
  borderRadius: "999px",
  border: "1px solid rgba(255,255,255,0.16)",
  background: "rgba(255,255,255,0.04)",
  color: "#fff8ed",
  cursor: "pointer",
  fontSize: "10px",
  fontWeight: 800,
};

const tinyButtonStyle: CSSProperties = {
  width: "32px",
  height: "32px",
  borderRadius: "999px",
  border: "none",
  background: "rgba(255,255,255,0.08)",
  color: "#fff8ed",
  cursor: "pointer",
};

const metricPalette: Record<string, { bg: string; border: string; text: string }> = {
  DMG: {
    bg: "rgba(229,115,79,0.16)",
    border: "rgba(229,115,79,0.42)",
    text: "#f0a286",
  },
  HP: {
    bg: "rgba(214,177,95,0.16)",
    border: "rgba(214,177,95,0.42)",
    text: "#ebcf8b",
  },
  Dodge: {
    bg: "rgba(92,199,178,0.16)",
    border: "rgba(92,199,178,0.42)",
    text: "#87e2cf",
  },
  Crit: {
    bg: "rgba(216,93,145,0.16)",
    border: "rgba(216,93,145,0.42)",
    text: "#ee9abb",
  },
  Pen: {
    bg: "rgba(115,149,230,0.16)",
    border: "rgba(115,149,230,0.42)",
    text: "#b8cbff",
  },
  "Crit DMG": {
    bg: "rgba(130,111,213,0.16)",
    border: "rgba(130,111,213,0.42)",
    text: "#ccc0ff",
  },
};

export function BuilderPopover({
  buildPresets,
  unlockedSkills = [],
  equippedSkillIds = [],
  maxEquippedSkills = 5,
  playerCharacter,
  metrics,
  increaseStat,
  decreaseStat,
  applyPreset,
  resetBuild,
  toggleEquippedSkill,
  onOpenBuildPresets,
  onClose,
}: BuilderPopoverProps) {
  return (
    <ModalOverlay
      onClose={onClose}
      closeLabel="Close builder popover"
      zIndex={40}
      backdrop="rgba(7, 8, 12, 0.72)"
    >
      <ModalSurface
        style={{
          width: "min(1120px, 100%)",
          maxHeight: "min(780px, calc(100vh - 36px))",
          background:
            "linear-gradient(180deg, rgba(25,22,27,0.98), rgba(14,13,18,0.98)), radial-gradient(circle at top, rgba(255,214,164,0.08), transparent 32%)",
          boxShadow: "0 28px 72px rgba(0,0,0,0.48)",
          display: "grid",
          gridTemplateRows: "auto minmax(0, 1fr)",
          fontFamily: "'Trebuchet MS', 'Segoe UI', sans-serif",
        }}
      >
        <div
          style={{
            padding: "12px 14px 11px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            background: "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
            display: "grid",
            gap: "8px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "start", flexWrap: "wrap" }}>
            <div style={{ display: "grid", gap: "5px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "34px minmax(0, 1fr)", gap: "10px", alignItems: "center" }}>
                <div
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "11px",
                    display: "grid",
                    placeItems: "center",
                    fontSize: "19px",
                    background: "linear-gradient(180deg, rgba(255,171,97,0.16), rgba(207,106,50,0.08))",
                    border: "1px solid rgba(255,171,97,0.22)",
                  }}
                >
                  {"\u2692"}
                </div>
                <div style={{ display: "grid", gap: "2px" }}>
                  <div
                    style={{
                      fontSize: "9px",
                      fontWeight: 800,
                      letterSpacing: "0.16em",
                      color: "#d8c7b1",
                      textTransform: "uppercase",
                      lineHeight: 1,
                    }}
                  >
                    Build Workshop
                  </div>
                  <div style={{ fontSize: "22px", fontWeight: 900, color: "#fff7ea", lineHeight: 0.98 }}>
                    Player Builder
                  </div>
                  <div style={{ fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#d7c3ad" }}>
                    live matchup workshop
                  </div>
                </div>
              </div>
              <div style={{ fontSize: "10px", lineHeight: 1.3, color: "#cabfb0", maxWidth: "620px" }}>
                Tune stats and compare the current matchup before the next fight.
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <ActionButton type="button" onClick={resetBuild} tone="secondary" style={{ ...secondaryButtonStyle, padding: "6px 10px" }}>
                Reset Build
              </ActionButton>
              <ActionButton type="button" onClick={onClose} tone="secondary" style={{ ...secondaryButtonStyle, padding: "6px 10px" }}>
                Close
              </ActionButton>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))", gap: "5px" }}>
            <MetricCard label="DMG" value={metrics.totalDamage} highlight />
            <MetricCard label="Base DMG" value={metrics.baseAttackDamage} />
            <MetricCard label="Weapon DMG" value={metrics.weaponDamage} />
            <MetricCard label="Armor" value={metrics.totalArmor} />
            <MetricCard label="HP" value={metrics.maxHp} />
            <MetricCard label="Type" value={formatMaybeTitle(metrics.weaponDamageType)} />
            <MetricCard label="Dodge" value={`${metrics.baseDodgeChance + metrics.dodgeChanceBonus}%`} />
            <MetricCard label="Dodge Vs Bot" value={`${metrics.dodgeVsBot + metrics.dodgeChanceBonus}%`} />
            <MetricCard label="Crit" value={`${metrics.baseCritChance + metrics.critChanceBonus}%`} />
            <MetricCard label="Crit Vs Bot" value={`${metrics.critVsBot + metrics.critChanceBonus}%`} />
            <MetricCard label="Pen" value={`${metrics.baseBlockPenetration}%`} />
            <MetricCard label="Pen Vs Bot" value={`${metrics.blockPenetrationVsBot}%`} />
          </div>
        </div>

        <div style={{ overflowY: "auto", padding: "9px 13px 12px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "238px minmax(0, 1fr) minmax(0, 1fr)", gap: "9px", alignItems: "start" }}>
            <div style={{ display: "grid", gap: "9px" }}>
              <PanelCard compact>
                <SectionIntro
                  label="Presets"
                  title="Build Entry"
                  description="Jump into curated archetypes or keep tuning the current build by hand."
                />
                <div style={{ display: "grid", gap: "8px" }}>
                  <InfoBanner
                    tone="warm"
                    title="Unspent Points"
                    value={String(playerCharacter.unspentStatPoints)}
                    note="Allocate directly or apply a preset."
                  />
                  <div
                    style={{
                      borderRadius: "12px",
                      padding: "9px",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      display: "grid",
                      gap: "7px",
                    }}
                  >
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <div
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "10px",
                          display: "grid",
                          placeItems: "center",
                          fontSize: "15px",
                          background: "rgba(255,171,97,0.10)",
                          border: "1px solid rgba(255,171,97,0.18)",
                        }}
                      >
                        РІв„ўС›
                      </div>
                      <div style={{ fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#ffd8b3", fontWeight: 800 }}>
                        Curated Build Browser
                      </div>
                    </div>
                    <div style={{ fontSize: "10px", lineHeight: 1.28, color: "#d8c7b1" }}>
                      Open the dedicated build presets browser to compare six curated archetypes, inspect their five-skill panels, and apply the one you want.
                    </div>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      <ActionButton
                        type="button"
                        onClick={onOpenBuildPresets}
                        tone="secondary"
                        style={{
                          ...secondaryButtonStyle,
                          padding: "6px 10px",
                          border: "1px solid rgba(255,171,97,0.24)",
                          background: "rgba(255,171,97,0.08)",
                        }}
                      >
                        Open Build Presets
                      </ActionButton>
                      {buildPresets.slice(0, 3).map((preset) => (
                        <ActionButton
                          key={preset.id}
                          type="button"
                          onClick={() => applyPreset(preset.id)}
                          tone="secondary"
                          style={{
                            ...secondaryButtonStyle,
                            padding: "6px 8px",
                            border: "1px solid rgba(255,255,255,0.1)",
                            background: "rgba(255,255,255,0.035)",
                            textAlign: "left",
                          }}
                        >
                          {preset.label}
                        </ActionButton>
                      ))}
                    </div>
                  </div>
                </div>
              </PanelCard>

              <PanelCard compact>
                <SectionIntro
                  label="Stats"
                  title="Core Attributes"
                  description="Spend points here to shape damage, survivability, crit pressure, and dodge."
                />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "7px" }}>
                  {(Object.keys(statMeta) as CharacterStatName[]).map((statName) => (
                    <div
                      key={statName}
                      style={{
                        borderRadius: "14px",
                        padding: "7px",
                        background: statMeta[statName].tint,
                        border: `1px solid ${statMeta[statName].color}36`,
                        display: "grid",
                        gap: "5px",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center" }}>
                        <div style={{ display: "grid", gap: "2px" }}>
                          <div style={{ fontSize: "10px", color: statMeta[statName].color, fontWeight: 800 }}>
                            {statMeta[statName].short}
                          </div>
                          <div style={{ fontSize: "8px", opacity: 0.72, lineHeight: 1.2 }}>
                            {statMeta[statName].effect}
                          </div>
                        </div>
                        <div style={{ fontSize: "20px", fontWeight: 800, color: statMeta[statName].color, minWidth: "22px", textAlign: "center" }}>
                          {playerCharacter.baseStats[statName]}
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px" }}>
                        <button
                          type="button"
                          onClick={() => decreaseStat(statName)}
                          style={{
                            ...tinyButtonStyle,
                            width: "100%",
                            height: "24px",
                            fontSize: "12px",
                            border: `1px solid ${statMeta[statName].color}52`,
                            background: "rgba(255,255,255,0.04)",
                            color: statMeta[statName].color,
                          }}
                        >
                          -
                        </button>
                        <button
                          type="button"
                          onClick={() => increaseStat(statName)}
                          style={{
                            ...tinyButtonStyle,
                            width: "100%",
                            height: "24px",
                            fontSize: "12px",
                            background: statMeta[statName].color,
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </PanelCard>
            </div>

            <div style={{ display: "grid", gap: "9px" }}>
              <PanelCard compact>
                <SectionIntro
                  label="Loadout"
                  title="Current Equipment"
                  description="Read the active weapon profile before changing skills or matchup expectations."
                />
                <div style={{ display: "grid", gap: "4px", fontSize: "11px" }}>
                  <LoadoutLine label="Weapon" value={metrics.mainHandLabel ?? "Unarmed"} />
                  <LoadoutLine label="Off Hand" value={metrics.offHandLabel ?? "Empty"} />
                  <LoadoutLine label="Weapon Class" value={formatMaybeTitle(metrics.weaponClass)} />
                  <LoadoutLine label="Handedness" value={formatMaybeTitle(metrics.weaponHandedness)} />
                  <LoadoutLine label="Preferred Type" value={formatMaybeTitle(metrics.preferredDamageType)} />
                  <LoadoutLine label="Damage Type" value={formatMaybeTitle(metrics.weaponDamageType)} />
                </div>
              </PanelCard>
              <PanelCard compact>
                <SectionIntro
                  label="Skills"
                  title="Combat Action Bar"
                  description="Only the skills equipped here appear in the five combat slots."
                />
                <div
                  style={{
                    display: "grid",
                    gap: "5px",
                    borderRadius: "14px",
                    padding: "7px 9px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ display: "grid", gap: "2px" }}>
                      <div style={{ fontSize: "10px", fontWeight: 800, color: "#f6e6d0" }}>
                        Equip up to {maxEquippedSkills} active skills
                      </div>
                      <div style={{ fontSize: "9px", opacity: 0.68, lineHeight: 1.3 }}>
                        Pull from every equipped item and decide which five deserve bar space.
                      </div>
                    </div>
                    <span
                      style={{
                        borderRadius: "999px",
                        padding: "4px 8px",
                        fontSize: "9px",
                        fontWeight: 800,
                        color: "#ffd9b1",
                        background: "linear-gradient(180deg, rgba(255,200,132,0.18), rgba(214,129,63,0.08))",
                        border: "1px solid rgba(255,200,132,0.28)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {equippedSkillIds.length}/{maxEquippedSkills} selected
                    </span>
                  </div>
                </div>
                <InfoBanner
                  tone="warm"
                  title="Equipped Skills"
                  value={`${equippedSkillIds.length}/${maxEquippedSkills}`}
                  note="Manual combat loadout slots."
                />
                <div style={{ display: "grid", gridTemplateColumns: `repeat(${maxEquippedSkills}, minmax(0, 1fr))`, gap: "5px" }}>
                  {Array.from({ length: maxEquippedSkills }, (_, index) => {
                    const skillId = equippedSkillIds[index] ?? null;
                    const equippedSkill = unlockedSkills.find((skill) => skill.id === skillId) ?? null;

                    return (
                      <div
                        key={`builder-equipped-skill-slot-${index + 1}`}
                        style={{
                          borderRadius: "14px",
                          padding: "8px",
                          minHeight: "80px",
                          background: equippedSkill ? "rgba(207,106,50,0.10)" : "rgba(255,255,255,0.03)",
                          border: equippedSkill ? "1px solid rgba(255,171,97,0.28)" : "1px dashed rgba(255,255,255,0.14)",
                          display: "grid",
                          gap: "5px",
                          alignContent: "start",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "start" }}>
                          <div style={{ fontSize: "7px", textTransform: "uppercase", opacity: 0.68, letterSpacing: "0.12em" }}>Slot {index + 1}</div>
                          {equippedSkill ? <div style={{ fontSize: "20px", lineHeight: 1 }}>{getSkillSlotIcon(equippedSkill.sourceItemCode, equippedSkill.name)}</div> : null}
                        </div>
                        <div style={{ fontSize: "11px", fontWeight: 900, lineHeight: 1.12, color: equippedSkill ? "#fff5e5" : "#d9c6b0" }}>{equippedSkill?.name ?? "Empty"}</div>
                        <div style={{ fontSize: "7px", opacity: 0.66, lineHeight: 1.22, textTransform: equippedSkill ? "uppercase" : "none", letterSpacing: equippedSkill ? "0.08em" : undefined }}>
                          {equippedSkill ? formatMaybeTitle(equippedSkill.sourceItemCode.replace(/-/g, " ")) : "Assign below"}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {unlockedSkills.length === 0 ? (
                  <div
                    style={{
                      fontSize: "10px",
                      opacity: 0.72,
                      lineHeight: 1.35,
                      borderRadius: "12px",
                      padding: "10px",
                      background: "rgba(255,255,255,0.025)",
                      border: "1px dashed rgba(255,255,255,0.08)",
                    }}
                  >
                    Equip a weapon or shield with a combat skill to add active abilities to the build.
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: "6px" }}>
                    {unlockedSkills.map((skill) => {
                      const equippedIndex = equippedSkillIds.indexOf(skill.id);
                      const isEquipped = equippedIndex >= 0;
                      const canEquip = isEquipped || equippedSkillIds.length < maxEquippedSkills;

                      return (
                        <div
                          key={skill.id}
                          style={{
                            borderRadius: "14px",
                            padding: "8px 9px",
                            background: isEquipped ? "rgba(207,106,50,0.08)" : "rgba(255,255,255,0.03)",
                            border: isEquipped ? "1px solid rgba(255,171,97,0.28)" : "1px solid rgba(255,255,255,0.08)",
                            display: "grid",
                            gap: "5px",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "start" }}>
                            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                              <div
                                style={{
                                  width: "32px",
                                  height: "32px",
                                  borderRadius: "11px",
                                  display: "grid",
                                  placeItems: "center",
                                  background: getSkillSlotTone(skill.sourceItemCode).background,
                                  border: `1px solid ${getSkillSlotTone(skill.sourceItemCode).border}`,
                                  fontSize: "17px",
                                }}
                              >
                                {getSkillSlotIcon(skill.sourceItemCode, skill.name)}
                              </div>
                              <div style={{ display: "grid", gap: "2px" }}>
                                <div style={{ fontSize: "11px", fontWeight: 900, color: "#fff6e7", lineHeight: 1.08 }}>{skill.name}</div>
                                <div
                                  style={{
                                    fontSize: "7px",
                                    opacity: 0.76,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.1em",
                                    color: "#d6c5b0",
                                  }}
                                >
                                  {formatMaybeTitle(skill.sourceItemCode.replace(/-/g, " "))}
                                </div>
                              </div>
                            </div>
                            <div style={{ display: "grid", gap: "4px", justifyItems: "end" }}>
                              <div
                                style={{
                                  fontSize: "9px",
                                  fontWeight: 800,
                                  color: "#ffd9b1",
                                  borderRadius: "999px",
                                  padding: "3px 7px",
                                  background: "linear-gradient(180deg, rgba(255,200,132,0.18), rgba(214,129,63,0.08))",
                                  border: "1px solid rgba(255,200,132,0.28)",
                                }}
                              >
                                {skill.cost} {formatResourceName(skill.resourceType)}
                              </div>
                              <button
                                type="button"
                                aria-label={isEquipped ? `Remove ${skill.name} from equipped skills` : `Equip ${skill.name} to equipped skills`}
                                onClick={() => toggleEquippedSkill(skill.id)}
                                disabled={!canEquip}
                                style={{
                                  ...secondaryButtonStyle,
                                  padding: "4px 7px",
                                  fontSize: "9px",
                                  border: isEquipped ? "1px solid rgba(255,171,97,0.38)" : "1px solid rgba(255,255,255,0.12)",
                                  background: isEquipped ? "rgba(207,106,50,0.14)" : "rgba(255,255,255,0.04)",
                                  opacity: canEquip ? 1 : 0.5,
                                  cursor: canEquip ? "pointer" : "not-allowed",
                                }}
                              >
                                {isEquipped ? `Slot ${equippedIndex + 1}` : "Equip"}
                              </button>
                            </div>
                          </div>
                          <SkillFactsCard skill={skill} />
                        </div>
                      );
                    })}
                  </div>
                )}
              </PanelCard>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "9px" }}>
                <PanelCard compact>
                  <SectionIntro
                    label="Attack"
                    title="Damage Split"
                    description="Live breakdown of the outgoing damage profile."
                  />
                  <ProfileCard profile={metrics.damageProfile} accent="rgba(229,115,79,0.18)" textColor="#ffbe91" />
                </PanelCard>
                <PanelCard compact>
                  <SectionIntro
                    label="Defense"
                    title="Armor Split"
                    description="Where your current gear is absorbing the most pressure."
                  />
                  <ProfileCard profile={metrics.armorProfile} accent="rgba(92,149,227,0.16)" textColor="#b7d5ff" />
                </PanelCard>
              </div>
              <PanelCard compact>
                  <SectionIntro
                    label="Bonuses"
                    title="Combat Modifiers"
                    description="Persistent crit, dodge, block, and penetration bonuses from the full build."
                  />
                  <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                    {formatCombatBonuses(metrics).map((entry) => (
                      <StatBonusPill key={entry.label} label={entry.label} accent={entry.accent} textColor={entry.textColor} />
                    ))}
                  </div>
              </PanelCard>

              <PanelCard compact>
                <SectionIntro
                  label="Defense"
                  title="Armor By Slot"
                  description="Slot-by-slot protection, useful for checking weak coverage before the next duel."
                />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px" }}>
                  {Object.entries(metrics.armorBySlot).length === 0 ? (
                    <div style={{ fontSize: "11px", opacity: 0.66 }}>No armor-equipped slots yet.</div>
                  ) : (
                    Object.entries(metrics.armorBySlot).map(([slot, profile]) => (
                      <div
                        key={slot}
                        style={{
                          borderRadius: "12px",
                          padding: "7px",
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          display: "grid",
                          gap: "5px",
                        }}
                      >
                        <div style={{ fontSize: "10px", textTransform: "uppercase", opacity: 0.72 }}>
                          {formatMaybeTitle(slot)}
                        </div>
                        <ProfileCard profile={profile} accent="rgba(214,177,95,0.14)" textColor="#ebcf8b" compact />
                      </div>
                    ))
                  )}
                </div>
              </PanelCard>
            </div>

            <div style={{ display: "grid", gap: "9px" }}>
              <PanelCard compact>
                <SectionIntro
                  label="Matchup"
                  title="Player vs Bot"
                  description="Use these comparisons to judge penetration, crit pressure, and zone value before locking a plan."
                />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px" }}>
                  <CompareCard
                    title="Player Offense"
                    accent="rgba(229,115,79,0.16)"
                    textColor="#ffbe91"
                    lines={[
                      { label: "Type", value: formatMaybeTitle(metrics.matchup.playerPrimaryType) },
                      { label: "Type DMG", value: metrics.matchup.playerPrimaryDamage },
                      { label: "Bot Armor", value: metrics.matchup.botArmorVsPlayer },
                      { label: "Pen Flat", value: metrics.matchup.playerPenFlat },
                      { label: "Pen %", value: `${metrics.matchup.playerPenPercent}%` },
                      { label: "Base Dodge", value: `${metrics.baseDodgeChance + metrics.dodgeChanceBonus}%` },
                      { label: "Base Crit", value: `${metrics.baseCritChance + metrics.critChanceBonus}%` },
                      { label: "Crit", value: `${metrics.matchup.playerCritVsBot}%` },
                      { label: "Dodge", value: `${metrics.matchup.playerDodgeVsBot}%` },
                      { label: "Base Block Pen", value: `${metrics.baseBlockPenetration}%` },
                      { label: "Block Pen", value: `${metrics.matchup.playerBlockPenVsBot}%` },
                    ]}
                  />
                  <CompareCard
                    title="Bot Offense"
                    accent="rgba(92,149,227,0.14)"
                    textColor="#b7d5ff"
                    lines={[
                      { label: "Type", value: formatMaybeTitle(metrics.matchup.botPrimaryType) },
                      { label: "Type DMG", value: metrics.matchup.botPrimaryDamage },
                      { label: "Player Armor", value: metrics.matchup.playerArmorVsBot },
                      { label: "Pen Flat", value: metrics.matchup.botPenFlat },
                      { label: "Pen %", value: `${metrics.matchup.botPenPercent}%` },
                      { label: "Crit", value: `${metrics.matchup.botCritVsPlayer}%` },
                      { label: "Dodge", value: `${metrics.matchup.botDodgeVsPlayer}%` },
                      { label: "Block Pen", value: `${metrics.matchup.botBlockPenVsPlayer}%` },
                    ]}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px", marginTop: "7px" }}>
                  <CompareCard
                    title="Player Zone Outlook"
                    accent="rgba(216,93,145,0.14)"
                    textColor="#ee9abb"
                    lines={[
                      { label: "Best Open", value: formatZoneOutlook(metrics.matchup.playerZonePressure.bestOpen) },
                      { label: "Worst Open", value: formatZoneOutlook(metrics.matchup.playerZonePressure.worstOpen) },
                      { label: "Best Guarded", value: formatZoneOutlook(metrics.matchup.playerZonePressure.bestGuarded) },
                      { label: "Worst Guarded", value: formatZoneOutlook(metrics.matchup.playerZonePressure.worstGuarded) },
                    ]}
                  />
                  <CompareCard
                    title="Bot Zone Outlook"
                    accent="rgba(92,199,178,0.14)"
                    textColor="#87e2cf"
                    lines={[
                      { label: "Best Open", value: formatZoneOutlook(metrics.matchup.botZonePressure.bestOpen) },
                      { label: "Worst Open", value: formatZoneOutlook(metrics.matchup.botZonePressure.worstOpen) },
                      { label: "Best Guarded", value: formatZoneOutlook(metrics.matchup.botZonePressure.bestGuarded) },
                      { label: "Worst Guarded", value: formatZoneOutlook(metrics.matchup.botZonePressure.worstGuarded) },
                    ]}
                  />
                </div>
              </PanelCard>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "5px" }}>
                <MetricCard label="Bot HP" value={metrics.opponentMaxHp} />
                <MetricCard label="Bot Armor" value={metrics.opponentTotalArmor} />
                <MetricCard label="Bot DMG" value={metrics.opponentTotalDamage} />
                <MetricCard label="Bot Type" value={formatMaybeTitle(metrics.opponentWeaponDamageType)} />
              </div>
            </div>
          </div>
        </div>
      </ModalSurface>
    </ModalOverlay>
  );
}

function PanelCard({ children, compact = false }: { children: ReactNode; compact?: boolean }) {
  return (
    <SharedPanelCard
      style={{
        borderRadius: compact ? "12px" : "16px",
        padding: compact ? "9px" : "12px",
        display: "grid",
        gap: compact ? "7px" : "9px",
      }}
    >
      {children}
    </SharedPanelCard>
  );
}

function SectionIntro({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description?: string;
}) {
  return (
    <div style={{ display: "grid", gap: "3px" }}>
      <SectionLabel label={label} />
      <div style={{ fontSize: "15px", fontWeight: 900, color: "#fff6e7", lineHeight: 1.02 }}>{title}</div>
      {description ? (
        <div style={{ fontSize: "9px", lineHeight: 1.3, color: "#cdbda8", maxWidth: "48ch" }}>{description}</div>
      ) : null}
    </div>
  );
}

function InfoBanner({
  tone,
  title,
  value,
  note,
}: {
  tone: "warm";
  title: string;
  value: string;
  note: string;
}) {
  const palette = tone === "warm"
    ? { bg: "rgba(207,106,50,0.14)", border: "rgba(207,106,50,0.32)", text: "#ffd4b6" }
    : { bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.08)", text: "#fff8ed" };

  return (
    <div
      style={{
        borderRadius: "14px",
        padding: "8px 9px",
        background: palette.bg,
        border: `1px solid ${palette.border}`,
        display: "grid",
        gap: "2px",
      }}
    >
      <div style={{ fontSize: "9px", textTransform: "uppercase", opacity: 0.8, letterSpacing: "0.08em" }}>{title}</div>
      <div style={{ fontSize: "20px", fontWeight: 900, color: palette.text, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: "8px", opacity: 0.68, lineHeight: 1.24 }}>{note}</div>
    </div>
  );
}

function StatBonusPill({
  label,
  accent,
  textColor,
}: {
  label: string;
  accent: string;
  textColor: string;
}) {
  return (
    <span
      style={{
        borderRadius: "999px",
        padding: "4px 7px",
        fontSize: compactText(label) ? "9px" : "10px",
        background: accent,
        color: textColor,
      }}
    >
      {label}
    </span>
  );
}

function MetricCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number | string;
  highlight?: boolean;
}) {
  const palette = metricPalette[label] ?? {
    bg: highlight ? "rgba(207,106,50,0.16)" : "rgba(255,255,255,0.03)",
    border: highlight ? "rgba(207,106,50,0.45)" : "rgba(255,255,255,0.08)",
    text: "#fff8ed",
  };

  return (
    <div
      style={{
        borderRadius: "12px",
        padding: "7px 8px",
        background: palette.bg,
        border: `1px solid ${palette.border}`,
      }}
    >
      <div style={{ fontSize: "8px", opacity: 0.82, color: palette.text, lineHeight: 1, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
      <div style={{ marginTop: "3px", fontSize: "15px", fontWeight: 900, lineHeight: 1.02, color: "#fff7eb" }}>{value}</div>
    </div>
  );
}

function SectionLabel({ label }: { label: string }) {
  return <div style={{ fontSize: "8px", textTransform: "uppercase", opacity: 0.78, letterSpacing: "0.16em", color: "#d6c3ad", fontWeight: 800 }}>{label}</div>;
}

function LoadoutLine({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "baseline" }}>
      <span style={{ opacity: 0.62, fontSize: "8px", textTransform: "uppercase", letterSpacing: "0.12em", color: "#c8b7a4", fontWeight: 700 }}>{label}</span>
      <span style={{ fontWeight: 800, textAlign: "right", fontSize: "11px", color: "#fff4e2", lineHeight: 1.15 }}>{value}</span>
    </div>
  );
}

function ProfileCard({
  profile,
  accent,
  textColor,
  compact = false,
}: {
  profile: DamageProfile | ArmorProfile;
  accent: string;
  textColor: string;
  compact?: boolean;
}) {
  const entries = Object.entries(profile).filter(([, value]) => value !== 0);

  if (entries.length === 0) {
    return <div style={{ fontSize: compact ? "10px" : "11px", opacity: 0.66 }}>No active values.</div>;
  }

  return (
    <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
      {entries.map(([name, value]) => (
        <StatBonusPill
          key={name}
          label={`${formatDamageTypeName(name)} ${value}`}
          accent={accent}
          textColor={textColor}
        />
      ))}
    </div>
  );
}

function CompareCard({
  title,
  accent,
  textColor,
  lines,
}: {
  title: string;
  accent: string;
  textColor: string;
  lines: Array<{ label: string; value: number | string }>;
}) {
  return (
    <div
      style={{
        borderRadius: "14px",
        padding: "8px",
        background: accent,
        border: "1px solid rgba(255,255,255,0.08)",
        display: "grid",
        gap: "5px",
      }}
    >
      <div style={{ display: "grid", gap: "1px" }}>
        <div style={{ fontSize: "8px", textTransform: "uppercase", color: textColor, fontWeight: 800, letterSpacing: "0.14em", opacity: 0.82 }}>
          Outlook
        </div>
        <div style={{ fontSize: "12px", color: "#fff6e7", fontWeight: 900, lineHeight: 1.05 }}>{title}</div>
      </div>
      {lines.map((line) => (
        <LoadoutLine key={`${title}-${line.label}`} label={line.label} value={String(line.value)} />
      ))}
    </div>
  );
}

function SkillFactsCard({ skill }: { skill: CombatSkill }) {
  const rows = buildSkillFactRows(skill);

  return (
    <div
      style={{
        borderRadius: "12px",
        padding: "7px 8px",
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.08)",
        display: "grid",
        gap: "4px",
      }}
    >
      {rows.map((row) => (
        <div
          key={`${skill.id}-${row.label}-${row.value}`}
          style={{
            display: "grid",
            gridTemplateColumns: "56px minmax(0, 1fr)",
            gap: "7px",
            alignItems: "start",
          }}
        >
          <div
            style={{
              fontSize: "7px",
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              color: "#d3bfab",
              opacity: 0.82,
              fontWeight: 800,
              paddingTop: "2px",
            }}
          >
            {row.label}
          </div>
          <div style={{ fontSize: "8px", lineHeight: 1.28, color: row.color ?? "#f6ead9", fontWeight: row.strong ? 800 : 600 }}>
            {row.value}
          </div>
        </div>
      ))}
    </div>
  );
}

function hasAnyProfile(profile: DamageProfile | ArmorProfile) {
  return Object.values(profile).some((value) => value !== 0);
}

function formatProfile(profile: DamageProfile | ArmorProfile) {
  return Object.entries(profile)
    .filter(([, value]) => value !== 0)
    .map(([name, value]) => `${formatDamageTypeName(name)} ${value}`)
    .join(" | ");
}

function formatDamageTypeName(name: string) {
  switch (name) {
    case "slash":
      return "Slash";
    case "pierce":
      return "Pierce";
    case "blunt":
      return "Blunt";
    case "chop":
      return "Chop";
    default:
      return name;
  }
}

function formatZoneOutlook(entry: ZoneOutlook) {
  return `${formatMaybeTitle(entry.zone)} (${entry.openDamage}/${entry.guardedDamage})`;
}

function formatCombatBonuses(metrics: {
  critChanceBonus: number;
  dodgeChanceBonus: number;
  blockChanceBonus: number;
  blockPowerBonus: number;
  armorPenetrationFlat: DamageProfile;
  armorPenetrationPercent: DamageProfile;
}) {
  return [
    metrics.critChanceBonus
      ? { label: `Crit +${metrics.critChanceBonus}%`, accent: "rgba(216,93,145,0.16)", textColor: "#ee9abb" }
      : null,
    metrics.dodgeChanceBonus
      ? { label: `Dodge +${metrics.dodgeChanceBonus}%`, accent: "rgba(92,199,178,0.16)", textColor: "#87e2cf" }
      : null,
    metrics.blockChanceBonus
      ? { label: `Block +${metrics.blockChanceBonus}%`, accent: "rgba(115,149,230,0.16)", textColor: "#b8cbff" }
      : null,
    metrics.blockPowerBonus
      ? { label: `Block Pow +${metrics.blockPowerBonus}%`, accent: "rgba(214,177,95,0.16)", textColor: "#ebcf8b" }
      : null,
    hasAnyProfile(metrics.armorPenetrationFlat)
      ? {
          label: `Pen Flat ${formatProfile(metrics.armorPenetrationFlat)}`,
          accent: "rgba(229,115,79,0.16)",
          textColor: "#f0a286",
        }
      : null,
    hasAnyProfile(metrics.armorPenetrationPercent)
      ? {
          label: `Pen % ${formatProfile(metrics.armorPenetrationPercent)}`,
          accent: "rgba(232,72,72,0.16)",
          textColor: "#ffaaa1",
        }
      : null,
  ].filter((entry): entry is { label: string; accent: string; textColor: string } => Boolean(entry));
}

function formatResourceName(resource: string) {
  switch (resource) {
    case "momentum":
      return "Momentum";
    case "focus":
      return "Focus";
    case "guard":
      return "Guard";
    case "rage":
      return "Rage";
    default:
      return resource;
  }
}

function formatPenetrationSummary(profile: DamageProfile) {
  return Object.entries(profile)
    .filter(([, value]) => value > 0)
    .map(([type, value]) => `${formatDamageTypeName(type)} Pen +${value}%`);
}

function buildSkillFactRows(skill: CombatSkill) {
  const rows: Array<{ label: string; value: string; strong?: boolean; color?: string }> = [
    {
      label: "Hit",
      value: `Deals x${skill.damageMultiplier.toFixed(2)} weapon damage.`,
      strong: true,
      color: "#f0a286",
    },
  ];

  if (skill.critChanceBonus) {
    rows.push({
      label: "Crit",
      value: `Adds +${skill.critChanceBonus}% crit chance.`,
      color: "#ee9abb",
    });
  }

  const penetration = formatPenetrationSummary(skill.armorPenetrationPercentBonus);
  if (penetration.length > 0) {
    rows.push({
      label: "Pen",
      value: penetration.join(" | "),
      color: "#ffaaa1",
    });
  }

  if (skill.effects?.length) {
    rows.push(
      ...skill.effects.map((effect) => ({
        label: effect.trigger === "on_hit" ? "On Hit" : "Apply",
        value: formatEffectSummary(effect),
        color: effect.kind === "buff" ? "#9ee0d2" : "#f6b1b1",
      }))
    );
  }

  if (typeof skill.cooldownTurns === "number") {
    rows.push({
      label: "Cooldown",
      value: `${skill.cooldownTurns} turn${skill.cooldownTurns === 1 ? "" : "s"}.`,
      color: "#b8cbff",
    });
  }

  if (typeof skill.requirements?.minLevel === "number") {
    rows.push({
      label: "Level",
      value: `Requires level ${skill.requirements.minLevel}.`,
      color: "#ebcf8b",
    });
  }

  if (skill.requirements?.notes?.length) {
    rows.push({
      label: "Needs",
      value: skill.requirements.notes.join(" | "),
      color: "#ebcf8b",
    });
  }

  if (skill.unlock) {
    rows.push({
      label: "Unlock",
      value: formatSkillUnlock(skill),
      color: "#87e2cf",
    });
  }

  if (rows.length === 1) {
    rows.push({
      label: "Extra",
      value: "No crit bonus, penetration bonus, or status effect.",
      color: "#d0c2b3",
    });
  }

  return rows;
}

function formatEffectSummary(effect: {
  name: string;
  kind: "buff" | "debuff";
  target: "self" | "target";
  durationTurns: number;
  modifiers?: Partial<{
    critChanceBonus: number;
    dodgeChanceBonus: number;
    blockChanceBonus: number;
    blockPowerBonus: number;
    outgoingDamagePercent: number;
    incomingDamagePercent: number;
    armorFlatBonus: ArmorProfile;
    damageFlatBonus: DamageProfile;
    armorPenetrationPercentBonus: DamageProfile;
  }>;
  periodic?: Partial<{
    heal: number;
    damage: number;
    resourceDelta: Record<string, number | undefined>;
  }>;
}) {
  const parts: string[] = [];
  const who = effect.target === "self" ? "Self" : "Target";
  const role = effect.kind === "buff" ? "buff" : "debuff";

  parts.push(`${effect.name}: ${who} ${role}, ${effect.durationTurns}t.`);

  if (effect.modifiers?.critChanceBonus) {
    parts.push(`Crit ${formatSignedValue(effect.modifiers.critChanceBonus)}%.`);
  }
  if (effect.modifiers?.dodgeChanceBonus) {
    parts.push(`Dodge ${formatSignedValue(effect.modifiers.dodgeChanceBonus)}%.`);
  }
  if (effect.modifiers?.blockChanceBonus) {
    parts.push(`Block ${formatSignedValue(effect.modifiers.blockChanceBonus)}%.`);
  }
  if (effect.modifiers?.blockPowerBonus) {
    parts.push(`Block power ${formatSignedValue(effect.modifiers.blockPowerBonus)}%.`);
  }
  if (effect.modifiers?.outgoingDamagePercent) {
    parts.push(`Outgoing damage ${formatSignedValue(effect.modifiers.outgoingDamagePercent)}%.`);
  }
  if (effect.modifiers?.incomingDamagePercent) {
    parts.push(`Incoming damage ${formatSignedValue(effect.modifiers.incomingDamagePercent)}%.`);
  }

  const damageBonus = formatProfileEntries(effect.modifiers?.damageFlatBonus);
  if (damageBonus) {
    parts.push(`Damage ${damageBonus}.`);
  }
  const armorBonus = formatProfileEntries(effect.modifiers?.armorFlatBonus);
  if (armorBonus) {
    parts.push(`Armor ${armorBonus}.`);
  }
  const penBonus = formatProfileEntries(effect.modifiers?.armorPenetrationPercentBonus, "%");
  if (penBonus) {
    parts.push(`Pen ${penBonus}.`);
  }

  if (effect.periodic?.heal) {
    parts.push(`Heals ${effect.periodic.heal} HP each turn.`);
  }
  if (effect.periodic?.damage) {
    parts.push(`Deals ${effect.periodic.damage} HP each turn.`);
  }

  const resourceDelta = formatResourceDelta(effect.periodic?.resourceDelta);
  if (resourceDelta) {
    parts.push(resourceDelta);
  }

  return parts.join(" ");
}

function formatSkillUnlock(skill: CombatSkill) {
  if (!skill.unlock) {
    return "Default.";
  }

  const label = formatSkillUnlockKind(skill.unlock.kind);
  const source = skill.unlock.sourceName ? ` via ${skill.unlock.sourceName}` : "";
  const note = skill.unlock.note ? ` ${skill.unlock.note}` : "";

  return `${label}${source}.${note}`.trim();
}

function formatSignedValue(value: number) {
  return value > 0 ? `+${value}` : `${value}`;
}

function formatProfileEntries(
  profile: Partial<Record<keyof DamageProfile, number>> | Partial<Record<keyof ArmorProfile, number>> | undefined,
  suffix = ""
) {
  if (!profile) {
    return "";
  }

  return Object.entries(profile)
    .filter(([, value]) => value && value !== 0)
    .map(([type, value]) => `${formatDamageTypeName(type)} ${formatSignedValue(Number(value))}${suffix}`)
    .join(" | ");
}

function formatResourceDelta(resourceDelta: Record<string, number | undefined> | undefined) {
  if (!resourceDelta) {
    return "";
  }

  const parts = Object.entries(resourceDelta)
    .filter(([, value]) => value && value !== 0)
    .map(([resource, value]) => `${formatResourceName(resource)} ${formatSignedValue(Number(value))} each turn.`);

  return parts.join(" ");
}

function formatSkillUnlockKind(kind: NonNullable<CombatSkill["unlock"]>["kind"]) {
  switch (kind) {
    case "item":
      return "Item";
    case "book":
      return "Book";
    case "trainer":
      return "Trainer";
    case "quest":
      return "Quest";
    case "default":
      return "Default";
  }
}

function getSkillSlotIcon(sourceItemCode: string, skillName: string) {
  const normalizedCode = sourceItemCode.toLowerCase();
  const normalizedName = skillName.toLowerCase();

  if (normalizedCode.includes("shield") || normalizedName.includes("shield")) {
    return "\uD83D\uDEE1";
  }

  if (normalizedCode.includes("helmet") || normalizedCode.includes("cap") || normalizedName.includes("head")) {
    return "\uD83E\uDE96";
  }

  if (normalizedCode.includes("armor") || normalizedCode.includes("vest") || normalizedCode.includes("jacket")) {
    return "\uD83E\uDDBA";
  }

  if (normalizedCode.includes("glove") || normalizedCode.includes("gauntlet") || normalizedName.includes("grip")) {
    return "\uD83E\uDDE4";
  }

  if (normalizedCode.includes("boot") || normalizedName.includes("step") || normalizedName.includes("kick")) {
    return "\uD83E\uDD7E";
  }

  if (
    normalizedCode.includes("ring") ||
    normalizedCode.includes("charm") ||
    normalizedCode.includes("earring") ||
    normalizedCode.includes("medallion") ||
    normalizedCode.includes("accessory")
  ) {
    return "\uD83D\uDC8D";
  }

  if (normalizedCode.includes("dagger") || normalizedName.includes("pierc") || normalizedName.includes("lunge")) {
    return "\uD83D\uDDE1";
  }

  if (normalizedCode.includes("axe") || normalizedName.includes("cleave")) {
    return "\uD83E\uDE93";
  }

  if (normalizedCode.includes("mace") || normalizedCode.includes("hammer") || normalizedName.includes("bash")) {
    return "\uD83D\uDD28";
  }

  if (normalizedCode.includes("sword") || normalizedName.includes("slash")) {
    return "\u2694";
  }

  return "\u2726";
}

function getSkillSlotTone(sourceItemCode: string) {
  const normalizedCode = sourceItemCode.toLowerCase();

  if (normalizedCode.includes("shield")) {
    return { background: "rgba(92,149,227,0.16)", border: "rgba(92,149,227,0.36)" };
  }

  if (normalizedCode.includes("helmet") || normalizedCode.includes("cap")) {
    return { background: "rgba(214,177,95,0.16)", border: "rgba(214,177,95,0.36)" };
  }

  if (normalizedCode.includes("armor") || normalizedCode.includes("vest") || normalizedCode.includes("jacket")) {
    return { background: "rgba(176,126,96,0.16)", border: "rgba(176,126,96,0.36)" };
  }

  if (normalizedCode.includes("glove") || normalizedCode.includes("gauntlet")) {
    return { background: "rgba(92,199,178,0.16)", border: "rgba(92,199,178,0.36)" };
  }

  if (normalizedCode.includes("boot")) {
    return { background: "rgba(115,149,230,0.16)", border: "rgba(115,149,230,0.36)" };
  }

  if (
    normalizedCode.includes("ring") ||
    normalizedCode.includes("charm") ||
    normalizedCode.includes("earring") ||
    normalizedCode.includes("medallion") ||
    normalizedCode.includes("accessory")
  ) {
    return { background: "rgba(130,111,213,0.16)", border: "rgba(130,111,213,0.36)" };
  }

  return { background: "rgba(229,115,79,0.16)", border: "rgba(229,115,79,0.36)" };
}

function formatMaybeTitle(value: string | null) {
  if (!value) {
    return "None";
  }

  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function compactText(value: string) {
  return value.length > 16;
}
