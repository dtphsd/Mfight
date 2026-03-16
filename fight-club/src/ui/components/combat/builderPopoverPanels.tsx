import type { CSSProperties } from "react";
import type { CharacterStatName } from "@/modules/character";
import { ActionButton } from "@/ui/components/shared/ActionButton";
import {
  formatMaybeTitle,
  formatResourceName,
  getSkillSlotIcon,
  getSkillSlotTone,
  SkillFactsCard,
} from "./builderPopoverHelpers";
import {
  CompareCard,
  formatCombatBonuses,
  formatZoneOutlook,
  InfoBanner,
  LoadoutLine,
  MetricCard,
  PanelCard,
  ProfileCard,
  SectionIntro,
  StatBonusPill,
} from "./builderPopoverPrimitives";
import type { BuilderPopoverProps } from "./builderPopoverTypes";

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

export function BuilderHeader({
  metrics,
  resetBuild,
  onClose,
}: Pick<BuilderPopoverProps, "metrics" | "resetBuild" | "onClose">) {
  return (
    <div
      style={{
        padding: "12px 14px 11px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        background: "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
        display: "grid",
        gap: "8px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "start", flexWrap: "wrap" }}>
        <div style={{ display: "grid", gap: "4px" }}>
          <div style={{ display: "flex", gap: "9px", alignItems: "center" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "14px",
                display: "grid",
                placeItems: "center",
                background: "linear-gradient(180deg, rgba(255,181,112,0.24), rgba(214,129,63,0.12))",
                border: "1px solid rgba(255,181,112,0.28)",
                color: "#ffd8ad",
                fontSize: "17px",
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
  );
}

export function BuilderStatsPanel({
  playerCharacter,
  increaseStat,
  decreaseStat,
}: Pick<BuilderPopoverProps, "playerCharacter" | "increaseStat" | "decreaseStat">) {
  return (
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
  );
}

export function BuilderLoadoutPanel({ metrics }: Pick<BuilderPopoverProps, "metrics">) {
  return (
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
  );
}

export function BuilderSkillsPanel({
  unlockedSkills = [],
  equippedSkillIds = [],
  maxEquippedSkills = 5,
  toggleEquippedSkill,
}: Pick<BuilderPopoverProps, "unlockedSkills" | "equippedSkillIds" | "maxEquippedSkills" | "toggleEquippedSkill">) {
  return (
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
  );
}

export function BuilderDefenseAndModifiersPanel({ metrics }: Pick<BuilderPopoverProps, "metrics">) {
  return (
    <>
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
    </>
  );
}

export function BuilderMatchupPanel({ metrics }: Pick<BuilderPopoverProps, "metrics">) {
  return (
    <>
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
    </>
  );
}
