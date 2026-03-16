import type { CSSProperties } from "react";
import type { DamageProfile } from "@/modules/inventory";
import { formatMaybeTitle, formatResourceLabel, formatSkillDetailLines, getActionVisual, getSkillIcon, splitDetailLine, type CombatRuleEffectSummary } from "./combatSandboxScreenHelpers";

export function BotBuildPresetsPopover({
  panelStyle,
  buttonStyle,
  buildPresets,
  selectedPresetId,
  onApplyBuild,
  onClose,
}: {
  panelStyle: CSSProperties;
  buttonStyle: CSSProperties;
  buildPresets: Array<{
    id: string;
    label: string;
    archetype: string;
    description: string;
    targetFightLength: string;
    tags: string[];
  }>;
  selectedPresetId: string;
  onApplyBuild: (presetId: string) => void;
  onClose: () => void;
}) {
  const activePreset = buildPresets.find((preset) => preset.id === selectedPresetId) ?? buildPresets[0] ?? null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 45,
        display: "grid",
        placeItems: "center",
        padding: "20px",
      }}
    >
      <button
        type="button"
        aria-label="Close bot build presets popover"
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          border: "none",
          background: "rgba(7, 8, 12, 0.72)",
          cursor: "pointer",
        }}
      />
      <div
        style={{
          position: "relative",
          width: "min(760px, 100%)",
          maxHeight: "min(720px, calc(100vh - 36px))",
          overflow: "hidden",
          borderRadius: "24px",
          border: "1px solid rgba(255,255,255,0.12)",
          background:
            "linear-gradient(180deg, rgba(24,20,19,0.98), rgba(12,11,10,0.98)), radial-gradient(circle at top, rgba(255,188,118,0.08), transparent 30%)",
          boxShadow: "0 28px 72px rgba(0,0,0,0.48)",
          display: "grid",
          gridTemplateRows: "auto minmax(0, 1fr)",
          fontFamily: "'Trebuchet MS', 'Segoe UI', sans-serif",
        }}
      >
        <div
          style={{
            padding: "14px 16px 12px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            background: "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
            display: "grid",
            gap: "8px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "start", flexWrap: "wrap" }}>
            <div style={{ display: "grid", gap: "4px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "34px minmax(0, 1fr)", gap: "10px", alignItems: "center" }}>
                <div
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "11px",
                    display: "grid",
                    placeItems: "center",
                    fontSize: "11px",
                    fontWeight: 900,
                    background: "linear-gradient(180deg, rgba(255,171,97,0.16), rgba(207,106,50,0.08))",
                    border: "1px solid rgba(255,171,97,0.22)",
                    color: "#ffe2c2",
                  }}
                >
                  BOT
                </div>
                <div style={{ display: "grid", gap: "2px" }}>
                  <div style={{ fontSize: "9px", fontWeight: 800, letterSpacing: "0.16em", color: "#d8c7b1", textTransform: "uppercase", lineHeight: 1 }}>
                    Arena Bot
                  </div>
                  <div style={{ fontSize: "22px", fontWeight: 900, color: "#fff7ea", lineHeight: 0.98 }}>Bot Builds</div>
                  <div style={{ fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#d7c3ad" }}>curated opponent presets</div>
                </div>
              </div>
              <div style={{ fontSize: "10px", lineHeight: 1.32, color: "#cabfb0", maxWidth: "620px" }}>
                Swap the bot into one of the same curated archetypes the player can use. This changes gear, skills, and consumables without bloating the side column.
              </div>
            </div>
            <button type="button" onClick={onClose} style={{ ...buttonStyle, padding: "6px 10px", fontSize: "10px" }}>
              Close
            </button>
          </div>

          {activePreset ? (
            <div
              style={{
                ...panelStyle,
                padding: "10px 11px",
                display: "grid",
                gap: "7px",
                background: "linear-gradient(180deg, rgba(255,171,97,0.10), rgba(255,255,255,0.025))",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "start", flexWrap: "wrap" }}>
                <div style={{ display: "grid", gap: "3px" }}>
                  <div style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.14em", color: "#d7c3ad" }}>Active Now</div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                    <span
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "10px",
                        display: "grid",
                        placeItems: "center",
                        background: getBotBuildTone(activePreset.archetype).surface,
                        border: `1px solid ${getBotBuildTone(activePreset.archetype).border}`,
                        color: getBotBuildTone(activePreset.archetype).text,
                        fontSize: "10px",
                        fontWeight: 900,
                      }}
                    >
                      {getBotPresetIcon(activePreset.id, activePreset.archetype)}
                    </span>
                    <div style={{ display: "grid", gap: "2px" }}>
                      <div style={{ fontSize: "14px", fontWeight: 900, color: "#fff4e7", lineHeight: 1.04 }}>{activePreset.label}</div>
                      <div style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.12em", color: getBotBuildTone(activePreset.archetype).text }}>
                        {activePreset.archetype}
                      </div>
                    </div>
                  </div>
                </div>
                <span
                  style={{
                    borderRadius: "999px",
                    padding: "4px 8px",
                    fontSize: "8px",
                    fontWeight: 800,
                    background: "rgba(255,171,97,0.12)",
                    border: "1px solid rgba(255,171,97,0.24)",
                    color: "#ffd9b1",
                    whiteSpace: "nowrap",
                  }}
                >
                  {activePreset.targetFightLength}
                </span>
              </div>
              <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                {activePreset.tags.slice(0, 3).map((tag) => (
                  <span
                    key={`active-${tag}`}
                    style={{
                      borderRadius: "999px",
                      padding: "3px 7px",
                      fontSize: "8px",
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "rgba(255,255,255,0.05)",
                      color: "#efe2d3",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div style={{ overflowY: "auto", padding: "12px 16px 16px", display: "grid", gap: "8px" }}>
          {buildPresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onApplyBuild(preset.id)}
              style={{
                borderRadius: "16px",
                padding: "10px 11px",
                background: preset.id === selectedPresetId ? `linear-gradient(180deg, ${getBotBuildTone(preset.archetype).surface}, rgba(255,255,255,0.03))` : "rgba(255,255,255,0.03)",
                border: preset.id === selectedPresetId ? `1px solid ${getBotBuildTone(preset.archetype).border}` : "1px solid rgba(255,255,255,0.08)",
                display: "grid",
                gap: "6px",
                textAlign: "left",
                color: "#fff2df",
                cursor: "pointer",
                boxShadow: preset.id === selectedPresetId ? `0 10px 24px ${getBotBuildTone(preset.archetype).shadow}` : "none",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "start" }}>
                <div style={{ display: "grid", gridTemplateColumns: "32px minmax(0, 1fr)", gap: "8px", alignItems: "start", flex: 1 }}>
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "10px",
                      display: "grid",
                      placeItems: "center",
                      background: preset.id === selectedPresetId ? getBotBuildTone(preset.archetype).surface : "rgba(255,255,255,0.05)",
                      border: `1px solid ${preset.id === selectedPresetId ? getBotBuildTone(preset.archetype).border : "rgba(255,255,255,0.08)"}`,
                      color: preset.id === selectedPresetId ? getBotBuildTone(preset.archetype).text : "#ffd9b1",
                      fontSize: "10px",
                      fontWeight: 900,
                    }}
                  >
                    {getBotPresetIcon(preset.id, preset.archetype)}
                  </div>
                  <div style={{ display: "grid", gap: "2px" }}>
                    <div style={{ fontSize: "13px", fontWeight: 900, color: "#fff6e7", lineHeight: 1.04 }}>{preset.label}</div>
                    <div
                      style={{
                        fontSize: "8px",
                        textTransform: "uppercase",
                        letterSpacing: "0.12em",
                        color: preset.id === selectedPresetId ? getBotBuildTone(preset.archetype).text : "#d7c6b2",
                        opacity: 0.86,
                      }}
                    >
                      {preset.archetype} / {preset.targetFightLength}
                    </div>
                  </div>
                </div>
                <span
                  style={{
                    borderRadius: "999px",
                    padding: "5px 8px",
                    fontSize: "8px",
                    fontWeight: 800,
                    border: preset.id === selectedPresetId ? "1px solid rgba(255,171,97,0.34)" : "1px solid rgba(255,255,255,0.12)",
                    background: preset.id === selectedPresetId ? "linear-gradient(180deg, rgba(221,122,68,0.28), rgba(207,106,50,0.12))" : "rgba(255,255,255,0.04)",
                    color: preset.id === selectedPresetId ? "#ffe2c2" : "#efe6da",
                    whiteSpace: "nowrap",
                  }}
                >
                  {preset.id === selectedPresetId ? "Selected" : "Use Build"}
                </span>
              </div>
              <div style={{ fontSize: "9px", lineHeight: 1.32, color: "#d7cbbc" }}>{preset.description}</div>
              <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                {preset.tags.map((tag) => (
                  <span
                    key={`${preset.id}-${tag}`}
                    style={{
                      borderRadius: "999px",
                      padding: "3px 7px",
                      fontSize: "8px",
                      background: preset.id === selectedPresetId ? getBotTagTone(tag).surface : "rgba(255,255,255,0.05)",
                      border: `1px solid ${preset.id === selectedPresetId ? getBotTagTone(tag).border : "rgba(255,255,255,0.08)"}`,
                      color: "#efe2d3",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SkillLoadoutPopover({
  buttonStyle,
  unlockedSkills,
  equippedSkillIds,
  maxEquippedSkills,
  onToggleSkill,
  onClose,
}: {
  buttonStyle: CSSProperties;
  unlockedSkills: Array<{
    id: string;
    name: string;
    description: string;
    sourceItemCode: string;
    resourceType: string;
    cost: number;
    damageMultiplier: number;
    critChanceBonus: number;
    cooldownTurns?: number;
    requirements?: {
      minLevel?: number;
      notes?: string[];
    };
    unlock?: {
      kind: "item" | "book" | "trainer" | "quest" | "default";
      sourceName?: string;
      note?: string;
    };
    armorPenetrationPercentBonus: DamageProfile;
    effects?: CombatRuleEffectSummary[];
  }>;
  equippedSkillIds: string[];
  maxEquippedSkills: number;
  onToggleSkill: (skillId: string) => void;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 45,
        display: "grid",
        placeItems: "center",
        padding: "20px",
      }}
    >
      <button
        type="button"
        aria-label="Close skill loadout popover"
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          border: "none",
          background: "rgba(7, 8, 12, 0.72)",
          cursor: "pointer",
        }}
      />
      <div
        style={{
          position: "relative",
          width: "min(760px, 100%)",
          maxHeight: "min(720px, calc(100vh - 36px))",
          overflow: "hidden",
          borderRadius: "22px",
          border: "1px solid rgba(255,255,255,0.12)",
          background:
            "linear-gradient(180deg, rgba(25,22,27,0.98), rgba(14,13,18,0.98)), radial-gradient(circle at top, rgba(255,214,164,0.08), transparent 32%)",
          boxShadow: "0 28px 72px rgba(0,0,0,0.48)",
          display: "grid",
          gridTemplateRows: "auto minmax(0, 1fr)",
        }}
      >
        <div
          style={{
            padding: "14px 16px 12px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            display: "grid",
            gap: "8px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "start" }}>
            <div style={{ display: "grid", gap: "3px" }}>
              <div style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.08em", color: "#d8c7b1", textTransform: "uppercase" }}>
                Combat Actions
              </div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "#fff7ea", lineHeight: 1.05 }}>
                Equipped Skills
              </div>
              <div style={{ fontSize: "11px", lineHeight: 1.35, color: "#cabfb0" }}>
                Choose up to {maxEquippedSkills} active skills from all equipped items. These are the skills shown in the battle panel.
              </div>
            </div>
            <button type="button" onClick={onClose} style={{ ...buttonStyle, padding: "6px 10px", fontSize: "10px" }}>
              Close
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${maxEquippedSkills}, minmax(0, 1fr))`, gap: "6px" }}>
            {Array.from({ length: maxEquippedSkills }, (_, index) => {
              const skillId = equippedSkillIds[index] ?? null;
              const skill = unlockedSkills.find((entry) => entry.id === skillId) ?? null;

              return (
                <div
                  key={`equipped-skill-slot-${index + 1}`}
                  style={{
                    borderRadius: "16px",
                    padding: "10px",
                    minHeight: "96px",
                    background: skill ? "rgba(207,106,50,0.10)" : "rgba(255,255,255,0.03)",
                    border: skill ? "1px solid rgba(255,171,97,0.28)" : "1px dashed rgba(255,255,255,0.14)",
                    display: "grid",
                    gap: "6px",
                    alignContent: "start",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "start" }}>
                    <div style={{ fontSize: "8px", textTransform: "uppercase", opacity: 0.68 }}>Slot {index + 1}</div>
                    {skill ? <div style={{ fontSize: "20px", lineHeight: 1 }}>{getSkillIcon(skill.name, skill.sourceItemCode)}</div> : null}
                  </div>
                  <div style={{ fontSize: "11px", fontWeight: 800, lineHeight: 1.2 }}>{skill?.name ?? "Empty"}</div>
                  <div style={{ fontSize: "9px", opacity: 0.68, lineHeight: 1.25 }}>
                    {skill ? formatMaybeTitle(skill.sourceItemCode.replace(/-/g, " ")) : "Assign a skill below"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ overflowY: "auto", padding: "12px 16px 16px", display: "grid", gap: "8px" }}>
          {unlockedSkills.length === 0 ? (
            <div style={{ fontSize: "11px", opacity: 0.66, lineHeight: 1.4 }}>
              Equip items with `skills[]` to unlock combat actions here.
            </div>
          ) : (
            unlockedSkills.map((skill) => {
              const equippedIndex = equippedSkillIds.indexOf(skill.id);
              const isEquipped = equippedIndex >= 0;
              const canEquip = isEquipped || equippedSkillIds.length < maxEquippedSkills;

              return (
                <div
                  key={skill.id}
                  style={{
                    borderRadius: "15px",
                    padding: "12px",
                    background: isEquipped ? "rgba(207,106,50,0.08)" : "rgba(255,255,255,0.03)",
                    border: isEquipped ? "1px solid rgba(255,171,97,0.28)" : "1px solid rgba(255,255,255,0.08)",
                    display: "grid",
                    gap: "6px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "start" }}>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <div
                        style={{
                          width: "34px",
                          height: "34px",
                          borderRadius: "12px",
                          display: "grid",
                          placeItems: "center",
                          background: getActionVisual(skill.name, skill.sourceItemCode).innerBackground,
                          border: `1px solid ${getActionVisual(skill.name, skill.sourceItemCode).ring}`,
                          fontSize: "18px",
                        }}
                      >
                        {getSkillIcon(skill.name, skill.sourceItemCode)}
                      </div>
                      <div style={{ display: "grid", gap: "3px" }}>
                        <div style={{ fontSize: "11px", fontWeight: 800 }}>{skill.name}</div>
                        <div style={{ fontSize: "9px", opacity: 0.68 }}>
                          {formatMaybeTitle(skill.sourceItemCode.replace(/-/g, " "))}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "grid", gap: "4px", justifyItems: "end" }}>
                      <div
                        style={{
                          fontSize: "10px",
                          fontWeight: 800,
                          color: "#ffd9b1",
                          borderRadius: "999px",
                          padding: "4px 8px",
                          background: "linear-gradient(180deg, rgba(255,200,132,0.18), rgba(214,129,63,0.08))",
                          border: "1px solid rgba(255,200,132,0.28)",
                        }}
                      >
                        {skill.cost} {formatResourceLabel(skill.resourceType)}
                      </div>
                      {typeof skill.cooldownTurns === "number" ? (
                        <div
                          style={{
                            fontSize: "9px",
                            fontWeight: 700,
                            color: "#b8cbff",
                            borderRadius: "999px",
                            padding: "3px 7px",
                            background: "rgba(115,149,230,0.12)",
                            border: "1px solid rgba(115,149,230,0.22)",
                          }}
                        >
                          CD {skill.cooldownTurns}T
                        </div>
                      ) : null}
                      <button
                        type="button"
                        aria-label={isEquipped ? `Remove ${skill.name} from panel skills` : `Add ${skill.name} to panel skills`}
                        onClick={() => onToggleSkill(skill.id)}
                        disabled={!canEquip}
                        style={{
                          ...buttonStyle,
                          padding: "5px 8px",
                          fontSize: "9px",
                          opacity: canEquip ? 1 : 0.5,
                          cursor: canEquip ? "pointer" : "not-allowed",
                        }}
                      >
                        {isEquipped ? `Slot ${equippedIndex + 1}` : "Add To Panel"}
                      </button>
                    </div>
                  </div>
                  <FactList rows={formatSkillDetailLines(skill)} />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function FactList({ rows }: { rows: string[] }) {
  return (
    <div
      style={{
        display: "grid",
        gap: "4px",
        borderRadius: "12px",
        padding: "8px 9px",
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {rows.map((line) => {
        const entry = splitDetailLine(line);
        return (
          <div
            key={`${entry.label}-${entry.value}`}
            style={{
              display: "grid",
              gridTemplateColumns: "54px minmax(0, 1fr)",
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
              {entry.label}
            </div>
            <div style={{ fontSize: "8px", color: "#f4e8d9", lineHeight: 1.28, fontWeight: 700 }}>{entry.value}</div>
          </div>
        );
      })}
    </div>
  );
}

function getBotPresetIcon(presetId: string, archetype: string) {
  const normalizedId = presetId.toLowerCase();
  const normalizedArchetype = archetype.toLowerCase();

  if (normalizedId.includes("shield") || normalizedArchetype.includes("defense")) return "SH";
  if (normalizedId.includes("dagger") || normalizedArchetype.includes("burst")) return "DG";
  if (normalizedId.includes("mace") || normalizedArchetype.includes("control")) return "MC";
  if (normalizedId.includes("axe") || normalizedArchetype.includes("tempo")) return "AX";
  if (normalizedId.includes("heavy") || normalizedArchetype.includes("heavy")) return "HV";
  if (normalizedId.includes("sustain")) return "RG";
  return "SW";
}

function getBotBuildTone(archetype: string) {
  const normalized = archetype.toLowerCase();
  if (normalized.includes("defense")) return { surface: "rgba(92,149,227,0.14)", border: "rgba(92,149,227,0.28)", text: "#b7d5ff", shadow: "rgba(92,149,227,0.12)" };
  if (normalized.includes("burst")) return { surface: "rgba(216,93,145,0.14)", border: "rgba(216,93,145,0.28)", text: "#ee9abb", shadow: "rgba(216,93,145,0.12)" };
  if (normalized.includes("control")) return { surface: "rgba(130,111,213,0.14)", border: "rgba(130,111,213,0.28)", text: "#cdc1ff", shadow: "rgba(130,111,213,0.12)" };
  if (normalized.includes("tempo")) return { surface: "rgba(92,199,178,0.14)", border: "rgba(92,199,178,0.28)", text: "#87e2cf", shadow: "rgba(92,199,178,0.12)" };
  if (normalized.includes("heavy")) return { surface: "rgba(214,177,95,0.14)", border: "rgba(214,177,95,0.28)", text: "#ebcf8b", shadow: "rgba(214,177,95,0.12)" };
  if (normalized.includes("sustain")) return { surface: "rgba(126,171,222,0.14)", border: "rgba(126,171,222,0.28)", text: "#cae0ff", shadow: "rgba(126,171,222,0.12)" };
  return { surface: "rgba(229,115,79,0.14)", border: "rgba(229,115,79,0.28)", text: "#f0a286", shadow: "rgba(229,115,79,0.12)" };
}

function getBotTagTone(tag: string) {
  const normalized = tag.toLowerCase();
  if (normalized.includes("guard") || normalized.includes("tank") || normalized.includes("stability")) return { surface: "rgba(92,149,227,0.12)", border: "rgba(92,149,227,0.22)" };
  if (normalized.includes("crit") || normalized.includes("high line")) return { surface: "rgba(216,93,145,0.12)", border: "rgba(216,93,145,0.22)" };
  if (normalized.includes("control") || normalized.includes("resource")) return { surface: "rgba(130,111,213,0.12)", border: "rgba(130,111,213,0.22)" };
  if (normalized.includes("tempo") || normalized.includes("pressure") || normalized.includes("waist") || normalized.includes("legs")) return { surface: "rgba(92,199,178,0.12)", border: "rgba(92,199,178,0.22)" };
  if (normalized.includes("heavy") || normalized.includes("finisher")) return { surface: "rgba(214,177,95,0.12)", border: "rgba(214,177,95,0.22)" };
  if (normalized.includes("sustain") || normalized.includes("midrange")) return { surface: "rgba(126,171,222,0.12)", border: "rgba(126,171,222,0.22)" };
  return { surface: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.08)" };
}
