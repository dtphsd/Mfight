import { useMemo, useState, type CSSProperties } from "react";

import { starterItems } from "@/content/items/starterItems";
import { getWeaponClassPassivePreview } from "@/modules/combat/config/combatWeaponPassives";
import type { CombatBuildPreset } from "@/orchestration/combat/combatSandboxConfigs";

interface BuildPresetsPopoverProps {
  buildPresets: CombatBuildPreset[];
  onApplyBuild: (presetId: string) => void;
  onApplyItemsOnly: (presetId: string) => void;
  onApplySkillsOnly: (presetId: string) => void;
  onClose: () => void;
}

const buttonStyle: CSSProperties = {
  padding: "8px 12px",
  borderRadius: "999px",
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.04)",
  color: "#fff2df",
  cursor: "pointer",
  fontSize: "10px",
  fontWeight: 700,
};

export function BuildPresetsPopover({
  buildPresets,
  onApplyBuild,
  onApplyItemsOnly,
  onApplySkillsOnly,
  onClose,
}: BuildPresetsPopoverProps) {
  const [selectedPresetId, setSelectedPresetId] = useState(buildPresets[0]?.id ?? "");

  const itemByCode = useMemo(
    () => new Map(starterItems.map((entry) => [entry.item.code, entry.item])),
    []
  );
  const skillById = useMemo(
    () =>
      new Map(
        starterItems.flatMap((entry) =>
          (entry.item.skills ?? []).map((skill) => [skill.id, { skill, item: entry.item }] as const)
        )
      ),
    []
  );

  const selectedPreset = buildPresets.find((preset) => preset.id === selectedPresetId) ?? buildPresets[0] ?? null;

  if (!selectedPreset) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 45,
        display: "grid",
        placeItems: "center",
        padding: "22px",
      }}
    >
      <button
        type="button"
        aria-label="Close build presets popover"
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          border: "none",
          background: "rgba(7, 8, 12, 0.76)",
          cursor: "pointer",
        }}
      />
      <div
        style={{
          position: "relative",
          width: "min(1180px, 100%)",
          maxHeight: "min(820px, calc(100vh - 36px))",
          borderRadius: "24px",
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.12)",
          background:
            "linear-gradient(180deg, rgba(23,20,18,0.98), rgba(11,10,9,0.98)), radial-gradient(circle at top, rgba(255,188,118,0.08), transparent 28%)",
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
              <div style={{ fontSize: "9px", fontWeight: 800, letterSpacing: "0.18em", color: "#d8c7b1", textTransform: "uppercase" }}>
                Build Presets
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                <div
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "12px",
                    display: "grid",
                    placeItems: "center",
                    fontSize: "22px",
                    background: "linear-gradient(180deg, rgba(255,171,97,0.18), rgba(207,106,50,0.08))",
                    border: "1px solid rgba(255,171,97,0.22)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
                  }}
                >
                  ♞
                </div>
                <div style={{ display: "grid", gap: "2px" }}>
                  <div style={{ fontSize: "24px", fontWeight: 900, color: "#fff7ea", lineHeight: 0.96, letterSpacing: "0.01em" }}>
                    Arena Archetypes
                  </div>
                  <div style={{ fontSize: "10px", color: "#d7c3ad", textTransform: "uppercase", letterSpacing: "0.12em" }}>
                    curated starter builds
                  </div>
                </div>
              </div>
              <div style={{ fontSize: "11px", lineHeight: 1.35, color: "#cabfb0", maxWidth: "760px" }}>
                Six moderated presets tuned for readable fights, clearer matchup testing, and a target pace around fifteen rounds.
              </div>
            </div>
            <button type="button" onClick={onClose} style={buttonStyle}>
              Close
            </button>
          </div>
        </div>

        <div style={{ overflowY: "auto", padding: "12px 16px 16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "290px minmax(0, 1fr)", gap: "12px", alignItems: "start" }}>
            <div style={{ display: "grid", gap: "8px" }}>
              {buildPresets.map((preset) => {
                const selected = preset.id === selectedPreset.id;
                const tone = getArchetypeTone(preset.archetype);
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedPresetId(preset.id)}
                    style={{
                      borderRadius: "16px",
                      padding: "10px",
                      border: selected ? `1px solid ${tone.border}` : "1px solid rgba(255,255,255,0.08)",
                      background: selected
                        ? `linear-gradient(180deg, ${tone.surface}, rgba(255,255,255,0.03))`
                        : "rgba(255,255,255,0.03)",
                      textAlign: "left",
                      color: "#fff2df",
                      cursor: "pointer",
                      display: "grid",
                      gap: "6px",
                      boxShadow: selected ? `0 10px 24px ${tone.shadow}` : "none",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "start" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "34px minmax(0, 1fr)", gap: "8px", alignItems: "start", flex: 1 }}>
                        <div
                          style={{
                            width: "34px",
                            height: "34px",
                            borderRadius: "11px",
                            display: "grid",
                            placeItems: "center",
                            fontSize: "18px",
                            background: selected ? tone.surface : "rgba(255,255,255,0.05)",
                            border: `1px solid ${selected ? tone.border : "rgba(255,255,255,0.08)"}`,
                          }}
                        >
                          {getPresetIcon(preset.id, preset.archetype)}
                        </div>
                        <div style={{ display: "grid", gap: "2px" }}>
                          <div style={{ fontSize: "14px", fontWeight: 900, lineHeight: 1.02 }}>{preset.label}</div>
                          <div style={{ fontSize: "9px", opacity: 0.72, textTransform: "uppercase", letterSpacing: "0.12em", color: selected ? tone.text : "#d5c2ad" }}>
                            {preset.archetype}
                          </div>
                          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "1px" }}>
                            {preset.tags.slice(0, 2).map((tag) => (
                              <span
                                key={`${preset.id}-${tag}-compact`}
                                style={{
                                  borderRadius: "999px",
                                  padding: "2px 6px",
                                  fontSize: "8px",
                                  background: "rgba(255,255,255,0.05)",
                                  border: "1px solid rgba(255,255,255,0.08)",
                                  color: "#efe2d3",
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          borderRadius: "999px",
                          padding: "3px 7px",
                          fontSize: "8px",
                          fontWeight: 800,
                          background: selected ? tone.surface : "rgba(255,171,97,0.10)",
                          border: `1px solid ${selected ? tone.border : "rgba(255,171,97,0.24)"}`,
                          color: selected ? tone.text : "#ffd9b1",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {preset.targetFightLength}
                      </div>
                    </div>
                    <div style={{ fontSize: "10px", lineHeight: 1.3, color: "#d9cbbb" }}>{preset.description}</div>
                    <PresetBarRow presetId={preset.id} archetype={preset.archetype} compact />
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      {preset.tags.map((tag) => (
                        <span
                          key={`${preset.id}-${tag}`}
                          style={{
                            borderRadius: "999px",
                            padding: "3px 7px",
                            fontSize: "8px",
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            color: "#efe2d3",
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>

            <div style={{ display: "grid", gap: "10px" }}>
              <div
                style={{
                  borderRadius: "16px",
                  padding: "12px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  display: "grid",
                  gap: "8px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "start", flexWrap: "wrap" }}>
                  <div style={{ display: "grid", gap: "4px" }}>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                      <div
                        style={{
                          width: "38px",
                          height: "38px",
                          borderRadius: "12px",
                          display: "grid",
                          placeItems: "center",
                          fontSize: "20px",
                          background: getArchetypeTone(selectedPreset.archetype).surface,
                          border: `1px solid ${getArchetypeTone(selectedPreset.archetype).border}`,
                        }}
                      >
                        {getPresetIcon(selectedPreset.id, selectedPreset.archetype)}
                      </div>
                      <div style={{ display: "grid", gap: "1px" }}>
                        <div style={{ fontSize: "24px", fontWeight: 900, color: "#fff6e7", lineHeight: 0.98 }}>{selectedPreset.label}</div>
                        <div style={{ fontSize: "9px", letterSpacing: "0.14em", textTransform: "uppercase", color: getArchetypeTone(selectedPreset.archetype).text }}>
                          {selectedPreset.archetype}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: "10px", color: "#d8c7b1", lineHeight: 1.3, maxWidth: "640px" }}>{selectedPreset.description}</div>
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <button type="button" onClick={() => onApplyItemsOnly(selectedPreset.id)} style={buttonStyle}>
                      Apply Items Only
                    </button>
                    <button type="button" onClick={() => onApplySkillsOnly(selectedPreset.id)} style={buttonStyle}>
                      Apply Skills Only
                    </button>
                    <button
                      type="button"
                      onClick={() => onApplyBuild(selectedPreset.id)}
                      style={{
                        ...buttonStyle,
                        border: "1px solid rgba(255,171,97,0.34)",
                        background: "linear-gradient(180deg, rgba(221,122,68,0.32), rgba(207,106,50,0.14))",
                        color: "#ffe2c2",
                      }}
                    >
                      Apply Build
                    </button>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "6px" }}>
                  <PresetMetric label="Archetype" value={selectedPreset.archetype} />
                  <PresetMetric label="Fight Length" value={selectedPreset.targetFightLength} />
                  <PresetMetric label="Skills" value={`${selectedPreset.skillLoadout.length}/5`} />
                  <PresetMetric label="Consumables" value={String(selectedPreset.consumables.length)} />
                </div>
                <PresetBarRow presetId={selectedPreset.id} archetype={selectedPreset.archetype} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.08fr) minmax(0, 0.92fr)", gap: "10px" }}>
                <div
                  style={{
                    borderRadius: "16px",
                    padding: "12px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    display: "grid",
                    gap: "10px",
                  }}
                >
                  <SectionLabel label="Equipment" icon="⚒" />
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "6px" }}>
                    {selectedPreset.loadout.map((itemCode) => {
                      const item = itemByCode.get(itemCode);
                      const passive = getWeaponClassPassivePreview(item?.equip?.weaponClass ?? null);
                      const signatureSkill = item?.skills?.[0] ?? null;
                      return (
                        <div
                          key={`${selectedPreset.id}-${itemCode}`}
                          style={{
                            borderRadius: "12px",
                            padding: "9px",
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            display: "grid",
                            gridTemplateColumns: "30px minmax(0, 1fr)",
                            gap: "8px",
                          }}
                        >
                          <div
                            style={{
                              width: "30px",
                              height: "30px",
                              borderRadius: "10px",
                              display: "grid",
                              placeItems: "center",
                              fontSize: "16px",
                              background: "rgba(255,255,255,0.04)",
                              border: "1px solid rgba(255,255,255,0.08)",
                            }}
                          >
                            {getItemIcon(itemCode)}
                          </div>
                          <div style={{ display: "grid", gap: "2px" }}>
                            <div style={{ fontSize: "10px", fontWeight: 800, color: "#fff1df", lineHeight: 1.15 }}>{item?.name ?? formatTitle(itemCode)}</div>
                            <div style={{ fontSize: "8px", opacity: 0.68, textTransform: "uppercase", letterSpacing: "0.08em" }}>{formatTitle(item?.equip?.slot ?? itemCode)}</div>
                            <div style={{ fontSize: "9px", color: "#d8c7b1", lineHeight: 1.22 }}>{item?.description ?? "No item description."}</div>
                            {passive ? (
                              <div
                                style={{
                                  marginTop: "4px",
                                  borderRadius: "10px",
                                  padding: "6px 7px",
                                  background: "rgba(229,115,79,0.10)",
                                  border: "1px solid rgba(255,171,97,0.20)",
                                  display: "grid",
                                  gap: "2px",
                                }}
                              >
                                <div style={{ fontSize: "8px", fontWeight: 800, color: "#ffd4b0", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                                  Passive: {passive.name}
                                </div>
                                <div style={{ fontSize: "9px", color: "#f0dec9", lineHeight: 1.22 }}>{passive.effect}</div>
                                <div style={{ fontSize: "8px", color: "#d9c0a7", lineHeight: 1.22 }}>
                                  {passive.trigger} • {passive.duration} • {passive.stacks}
                                </div>
                              </div>
                            ) : null}
                            {signatureSkill ? (
                              <div
                                style={{
                                  marginTop: "4px",
                                  borderRadius: "10px",
                                  padding: "6px 7px",
                                  background: "rgba(92,199,178,0.10)",
                                  border: "1px solid rgba(92,199,178,0.20)",
                                  display: "grid",
                                  gap: "2px",
                                }}
                              >
                                <div style={{ fontSize: "8px", fontWeight: 800, color: "#b8f4e8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                                  Skill: {signatureSkill.name}
                                </div>
                                <div style={{ fontSize: "9px", color: "#e2fbf5", lineHeight: 1.22 }}>{signatureSkill.description}</div>
                                <div style={{ fontSize: "8px", color: "#c4e8e0", lineHeight: 1.22 }}>
                                  {signatureSkill.cost} {formatResource(signatureSkill.resourceType)} • Damage x{signatureSkill.damageMultiplier.toFixed(2)}
                                  {signatureSkill.effects?.length ? ` • ${signatureSkill.effects[0].name} ${signatureSkill.effects[0].durationTurns}T` : ""}
                                </div>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <SectionLabel label="Recommended Skills" icon="✦" />
                  <div style={{ display: "grid", gap: "6px" }}>
                    {selectedPreset.skillLoadout.map((skillId, index) => {
                      const entry = skillById.get(skillId);
                      return (
                        <div
                          key={`${selectedPreset.id}-${skillId}`}
                          style={{
                            borderRadius: "12px",
                            padding: "9px",
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            display: "grid",
                            gap: "4px",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "start" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "22px minmax(0, 1fr)", gap: "8px", flex: 1, alignItems: "start" }}>
                              <div style={{ fontSize: "14px", lineHeight: 1 }}>{getItemIcon(entry?.item.code ?? skillId)}</div>
                              <div style={{ fontSize: "10px", fontWeight: 800, color: "#fff1df", lineHeight: 1.15 }}>
                                Slot {index + 1}: {entry?.skill.name ?? formatTitle(skillId)}
                              </div>
                            </div>
                            <div style={{ fontSize: "8px", opacity: 0.7, whiteSpace: "nowrap" }}>
                              {entry ? `${entry.skill.cost} ${formatResource(entry.skill.resourceType)}` : "Unavailable"}
                            </div>
                          </div>
                          <div style={{ fontSize: "8px", opacity: 0.72, textTransform: "uppercase", letterSpacing: "0.08em" }}>{entry?.item.name ?? "Unknown source"}</div>
                          <div style={{ fontSize: "9px", color: "#d8c7b1", lineHeight: 1.22 }}>
                            {entry?.skill.description ?? "Recommended preset skill."}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: "grid", gap: "12px" }}>
                  <div
                    style={{
                      borderRadius: "16px",
                      padding: "12px",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      display: "grid",
                      gap: "8px",
                    }}
                  >
                    <SectionLabel label="Consumables" icon="🧪" />
                    <div style={{ display: "grid", gap: "6px" }}>
                      {selectedPreset.consumables.map((itemCode) => {
                        const item = itemByCode.get(itemCode);
                        return (
                          <div
                            key={`${selectedPreset.id}-${itemCode}`}
                            style={{
                              borderRadius: "12px",
                              padding: "9px",
                              background: "rgba(255,255,255,0.03)",
                              border: "1px solid rgba(255,255,255,0.08)",
                              display: "grid",
                              gridTemplateColumns: "28px minmax(0, 1fr)",
                              gap: "8px",
                            }}
                          >
                            <div style={{ fontSize: "16px", lineHeight: 1, display: "grid", placeItems: "center" }}>{getItemIcon(itemCode)}</div>
                            <div style={{ display: "grid", gap: "2px" }}>
                              <div style={{ fontSize: "10px", fontWeight: 800, color: "#fff1df" }}>{item?.name ?? formatTitle(itemCode)}</div>
                              <div style={{ fontSize: "8px", opacity: 0.68, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                                {item?.consumableEffect ? formatUsageMode(item.consumableEffect.usageMode) : "Support item"}
                              </div>
                              <div style={{ fontSize: "9px", color: "#d8c7b1", lineHeight: 1.22 }}>{item?.description ?? "Recommended consumable."}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div
                    style={{
                      borderRadius: "16px",
                      padding: "12px",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      display: "grid",
                      gap: "8px",
                    }}
                  >
                    <SectionLabel label="Strengths" icon="▲" />
                    <ListBlock items={selectedPreset.strengths} tone="good" />
                    <SectionLabel label="Weaknesses" icon="▼" />
                    <ListBlock items={selectedPreset.weaknesses} tone="risk" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PresetMetric({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        borderRadius: "12px",
        padding: "8px 9px",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        display: "grid",
        gap: "3px",
      }}
    >
      <div style={{ fontSize: "8px", opacity: 0.68, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
      <div style={{ fontSize: "13px", fontWeight: 800, color: "#fff1df", lineHeight: 1.05 }}>{value}</div>
    </div>
  );
}

function PresetBarRow({
  presetId,
  archetype,
  compact = false,
}: {
  presetId: string;
  archetype: string;
  compact?: boolean;
}) {
  const stats = getPresetStatProfile(presetId, archetype);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: compact ? "1fr 1fr" : "repeat(4, minmax(0, 1fr))",
        gap: compact ? "4px 8px" : "6px",
      }}
    >
      {stats.map((entry) => (
        <PresetBar key={`${presetId}-${entry.label}`} label={entry.label} value={entry.value} compact={compact} />
      ))}
    </div>
  );
}

function PresetBar({
  label,
  value,
  compact = false,
}: {
  label: string;
  value: number;
  compact?: boolean;
}) {
  return (
    <div style={{ display: "grid", gap: compact ? "2px" : "3px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "6px", alignItems: "center" }}>
        <span style={{ fontSize: compact ? "8px" : "9px", opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {label}
        </span>
        <span style={{ fontSize: compact ? "8px" : "9px", fontWeight: 800, color: "#f3e2cf" }}>{value}/5</span>
      </div>
      <div
        style={{
          height: compact ? "5px" : "6px",
          borderRadius: "999px",
          overflow: "hidden",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          style={{
            width: `${Math.max(0, Math.min(5, value)) * 20}%`,
            height: "100%",
            background: resolveBarGradient(label),
            boxShadow: "0 0 12px rgba(255,171,97,0.16)",
          }}
        />
      </div>
    </div>
  );
}

function SectionLabel({ label, icon }: { label: string; icon?: string }) {
  return (
    <div style={{ display: "flex", gap: "6px", alignItems: "center", fontSize: "9px", textTransform: "uppercase", opacity: 0.78, letterSpacing: "0.12em" }}>
      {icon ? <span style={{ fontSize: "11px", opacity: 0.92 }}>{icon}</span> : null}
      <span>{label}</span>
    </div>
  );
}

function ListBlock({ items, tone }: { items: string[]; tone: "good" | "risk" }) {
  const colors =
    tone === "good"
      ? { border: "rgba(92,199,178,0.2)", bg: "rgba(92,199,178,0.06)", dot: "#87e2cf" }
      : { border: "rgba(229,115,79,0.2)", bg: "rgba(229,115,79,0.06)", dot: "#f0a286" };

  return (
    <div style={{ display: "grid", gap: "6px" }}>
      {items.map((item) => (
        <div
          key={item}
          style={{
            borderRadius: "11px",
            padding: "8px 9px",
            border: `1px solid ${colors.border}`,
            background: colors.bg,
            display: "grid",
            gridTemplateColumns: "8px minmax(0, 1fr)",
            gap: "8px",
            alignItems: "start",
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "999px",
              marginTop: "4px",
              background: colors.dot,
            }}
          />
          <span style={{ fontSize: "9px", lineHeight: 1.28, color: "#e9dccd" }}>{item}</span>
        </div>
      ))}
    </div>
  );
}

function getPresetIcon(presetId: string, archetype: string) {
  if (presetId.includes("shield") || archetype.toLowerCase().includes("defense")) {
    return "🛡";
  }
  if (presetId.includes("dagger") || archetype.toLowerCase().includes("burst")) {
    return "🗡";
  }
  if (presetId.includes("mace") || archetype.toLowerCase().includes("control")) {
    return "🔨";
  }
  if (presetId.includes("axe") || archetype.toLowerCase().includes("tempo")) {
    return "🪓";
  }
  if (presetId.includes("heavy") || archetype.toLowerCase().includes("heavy")) {
    return "⚔";
  }
  if (presetId.includes("sustain")) {
    return "🧪";
  }
  return "⚔";
}

function getPresetStatProfile(presetId: string, archetype: string) {
  const normalizedId = presetId.toLowerCase();
  const normalizedArchetype = archetype.toLowerCase();

  if (normalizedId.includes("shield") || normalizedArchetype.includes("defense")) {
    return [
      { label: "Damage", value: 2 },
      { label: "Armor", value: 5 },
      { label: "Control", value: 4 },
      { label: "Sustain", value: 4 },
    ];
  }

  if (normalizedId.includes("dagger") || normalizedArchetype.includes("burst")) {
    return [
      { label: "Damage", value: 4 },
      { label: "Armor", value: 2 },
      { label: "Burst", value: 5 },
      { label: "Tempo", value: 4 },
    ];
  }

  if (normalizedId.includes("mace") || normalizedArchetype.includes("control")) {
    return [
      { label: "Damage", value: 3 },
      { label: "Armor", value: 4 },
      { label: "Control", value: 5 },
      { label: "Sustain", value: 3 },
    ];
  }

  if (normalizedId.includes("axe") || normalizedArchetype.includes("tempo")) {
    return [
      { label: "Damage", value: 4 },
      { label: "Armor", value: 2 },
      { label: "Burst", value: 3 },
      { label: "Tempo", value: 5 },
    ];
  }

  if (normalizedId.includes("heavy") || normalizedArchetype.includes("heavy")) {
    return [
      { label: "Damage", value: 5 },
      { label: "Armor", value: 2 },
      { label: "Burst", value: 4 },
      { label: "Tempo", value: 2 },
    ];
  }

  if (normalizedId.includes("sustain")) {
    return [
      { label: "Damage", value: 2 },
      { label: "Armor", value: 4 },
      { label: "Control", value: 2 },
      { label: "Sustain", value: 5 },
    ];
  }

  return [
    { label: "Damage", value: 4 },
    { label: "Armor", value: 3 },
    { label: "Control", value: 2 },
    { label: "Sustain", value: 3 },
  ];
}

function resolveBarGradient(label: string) {
  switch (label) {
    case "Damage":
    case "Burst":
      return "linear-gradient(90deg, #e5734f, #f4b48f)";
    case "Armor":
      return "linear-gradient(90deg, #6e9de8, #b8d4ff)";
    case "Control":
      return "linear-gradient(90deg, #8b77e5, #cbc1ff)";
    case "Tempo":
      return "linear-gradient(90deg, #56c8ab, #95f0d7)";
    case "Sustain":
      return "linear-gradient(90deg, #d6b15f, #f0d89c)";
    default:
      return "linear-gradient(90deg, #d48b61, #efc4a6)";
  }
}

function getArchetypeTone(archetype: string) {
  const normalized = archetype.toLowerCase();
  if (normalized.includes("defense")) {
    return { surface: "rgba(92,149,227,0.14)", border: "rgba(92,149,227,0.28)", text: "#b7d5ff", shadow: "rgba(92,149,227,0.12)" };
  }
  if (normalized.includes("burst")) {
    return { surface: "rgba(216,93,145,0.14)", border: "rgba(216,93,145,0.28)", text: "#ee9abb", shadow: "rgba(216,93,145,0.12)" };
  }
  if (normalized.includes("control")) {
    return { surface: "rgba(130,111,213,0.14)", border: "rgba(130,111,213,0.28)", text: "#cdc1ff", shadow: "rgba(130,111,213,0.12)" };
  }
  if (normalized.includes("tempo")) {
    return { surface: "rgba(92,199,178,0.14)", border: "rgba(92,199,178,0.28)", text: "#87e2cf", shadow: "rgba(92,199,178,0.12)" };
  }
  if (normalized.includes("heavy")) {
    return { surface: "rgba(214,177,95,0.14)", border: "rgba(214,177,95,0.28)", text: "#ebcf8b", shadow: "rgba(214,177,95,0.12)" };
  }
  if (normalized.includes("sustain")) {
    return { surface: "rgba(126,171,222,0.14)", border: "rgba(126,171,222,0.28)", text: "#cae0ff", shadow: "rgba(126,171,222,0.12)" };
  }
  return { surface: "rgba(229,115,79,0.14)", border: "rgba(229,115,79,0.28)", text: "#f0a286", shadow: "rgba(229,115,79,0.12)" };
}

function getItemIcon(itemCode: string) {
  const normalized = itemCode.toLowerCase();
  if (normalized.includes("shield")) return "🛡";
  if (normalized.includes("dagger")) return "🗡";
  if (normalized.includes("axe")) return "🪓";
  if (normalized.includes("mace")) return "🔨";
  if (normalized.includes("great") || normalized.includes("sword")) return "⚔";
  if (normalized.includes("cap") || normalized.includes("helmet")) return "⛑";
  if (normalized.includes("vest") || normalized.includes("jacket") || normalized.includes("armor")) return "🦺";
  if (normalized.includes("gloves")) return "🧤";
  if (normalized.includes("boots")) return "🥾";
  if (normalized.includes("charm") || normalized.includes("earring") || normalized.includes("medallion")) return "💠";
  if (normalized.includes("potion")) return "🧪";
  if (normalized.includes("bandage")) return "🩹";
  return "◈";
}

function formatTitle(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/-/g, " ")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatResource(resource: string) {
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
      return formatTitle(resource);
  }
}

function formatUsageMode(mode: "replace_attack" | "with_attack") {
  return mode === "with_attack" ? "Use With Attack" : "Use Instead Of Attack";
}
