import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { starterItems } from "@/content/items/starterItems";
import type { CombatSkill } from "@/modules/combat";
import type { Item } from "@/modules/inventory";
import type { CombatBuildPreset } from "@/orchestration/combat/combatSandboxConfigs";
import rushChipFigure from "@/assets/combat/Rush-Chip.jpg";
import kitsuneBitFigure from "@/assets/combat/Kitsune-Bit.jpg";
import quackCoreFigure from "@/assets/combat/Quack-Core.jpg";
import neoScopeFigure from "@/assets/combat/Neo-Scope.jpg";
import razorBoarFigure from "@/assets/combat/Razor-Boar.jpg";
import houndDriveFigure from "@/assets/combat/Hound-Drive.jpg";
import trashFluxFigure from "@/assets/combat/Trash-Flux.jpg";
import { ActionButton } from "@/ui/components/shared/ActionButton";
import { ModalOverlay } from "@/ui/components/shared/ModalOverlay";
import { ModalSurface } from "@/ui/components/shared/ModalSurface";
import { PanelCard } from "@/ui/components/shared/PanelCard";

interface BuildPresetsPopoverProps {
  buildPresets: CombatBuildPreset[];
  onApplyBuild: (presetId: string) => void;
  onApplyItemsOnly: (presetId: string) => void;
  onApplySkillsOnly: (presetId: string) => void;
  onClose: () => void;
}

const figureByPresetId: Record<string, string> = {
  "sword-bleed": rushChipFigure,
  "shield-guard": quackCoreFigure,
  "dagger-crit": kitsuneBitFigure,
  "mace-control": neoScopeFigure,
  "axe-pressure": razorBoarFigure,
  "heavy-two-hand": houndDriveFigure,
  "sustain-regen": trashFluxFigure,
};

const presetToneByArchetype: Record<string, { accent: string; border: string; soft: string }> = {
  Pressure: { accent: "#f0a286", border: "rgba(229,115,79,0.34)", soft: "rgba(229,115,79,0.14)" },
  Defense: { accent: "#b7d5ff", border: "rgba(92,149,227,0.34)", soft: "rgba(92,149,227,0.14)" },
  Burst: { accent: "#ee9abb", border: "rgba(216,93,145,0.34)", soft: "rgba(216,93,145,0.14)" },
  Control: { accent: "#ccc0ff", border: "rgba(130,111,213,0.34)", soft: "rgba(130,111,213,0.14)" },
  Tempo: { accent: "#ffcf8a", border: "rgba(214,177,95,0.34)", soft: "rgba(214,177,95,0.14)" },
  Heavy: { accent: "#f2c3a7", border: "rgba(176,126,96,0.34)", soft: "rgba(176,126,96,0.14)" },
  Sustain: { accent: "#87e2cf", border: "rgba(92,199,178,0.34)", soft: "rgba(92,199,178,0.14)" },
};

const zoneStyles = {
  equipment: {
    border: "rgba(164, 138, 112, 0.24)",
    background: "linear-gradient(180deg, rgba(57,45,37,0.34), rgba(26,22,19,0.4))",
    glow: "rgba(214,177,95,0.08)",
  },
  skills: {
    border: "rgba(118, 124, 198, 0.24)",
    background: "linear-gradient(180deg, rgba(34,36,62,0.34), rgba(20,21,34,0.4))",
    glow: "rgba(130,111,213,0.10)",
  },
  consumables: {
    border: "rgba(184, 144, 74, 0.24)",
    background: "linear-gradient(180deg, rgba(64,48,26,0.34), rgba(30,24,15,0.42))",
    glow: "rgba(214,177,95,0.10)",
  },
  insight: {
    border: "rgba(109, 127, 160, 0.24)",
    background: "linear-gradient(180deg, rgba(29,35,45,0.34), rgba(18,22,30,0.42))",
    glow: "rgba(92,149,227,0.08)",
  },
};

const statToneByName: Record<string, { label: string; color: string; glow: string }> = {
  strength: { label: "STR", color: "#f0a286", glow: "rgba(229,115,79,0.22)" },
  agility: { label: "AGI", color: "#87e2cf", glow: "rgba(92,199,178,0.22)" },
  rage: { label: "RAG", color: "#ee9abb", glow: "rgba(216,93,145,0.22)" },
  endurance: { label: "END", color: "#ebcf8b", glow: "rgba(214,177,95,0.22)" },
};

const closeButtonStyle: CSSProperties = {
  padding: "6px 10px",
  borderRadius: "999px",
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.04)",
  color: "#fff6ea",
  cursor: "pointer",
  fontSize: "10px",
  fontWeight: 800,
};

export function BuildPresetsPopover({
  buildPresets,
  onApplyBuild,
  onApplyItemsOnly,
  onApplySkillsOnly,
  onClose,
}: BuildPresetsPopoverProps) {
  void onApplyItemsOnly;
  void onApplySkillsOnly;
  const [selectedPresetId, setSelectedPresetId] = useState(buildPresets[0]?.id ?? "");
  const [hoveredSkillId, setHoveredSkillId] = useState<string | null>(null);
  const [hoveredConsumableCode, setHoveredConsumableCode] = useState<string | null>(null);

  const itemByCode = useMemo(() => new Map(starterItems.map((entry) => [entry.item.code, entry.item])), []);
  const skillById = useMemo(() => {
    const pairs: Array<[string, CombatSkill]> = [];

    for (const entry of starterItems) {
      for (const skill of entry.item.skills ?? []) {
        pairs.push([skill.id, skill]);
      }
    }

    return new Map(pairs);
  }, []);

  const activePreset = buildPresets.find((preset) => preset.id === selectedPresetId) ?? buildPresets[0] ?? null;
  const activeTone = getPresetTone(activePreset?.archetype);
  const activeSkill = activePreset ? skillById.get(hoveredSkillId ?? activePreset.skillLoadout[0] ?? "") ?? null : null;
  const activeConsumable = activePreset ? itemByCode.get(hoveredConsumableCode ?? activePreset.consumables[0] ?? "") ?? null : null;

  return (
    <ModalOverlay onClose={onClose} closeLabel="Close build presets popover" zIndex={45} backdrop="rgba(7, 8, 12, 0.76)">
      <ModalSurface
        style={{
          width: "min(1180px, 100%)",
          maxHeight: "min(760px, calc(100vh - 24px))",
          display: "grid",
          gridTemplateRows: "auto minmax(0, 1fr)",
          background:
            "linear-gradient(180deg, rgba(24,20,19,0.985), rgba(12,11,10,0.985)), radial-gradient(circle at top, rgba(255,188,118,0.10), transparent 30%)",
          boxShadow: "0 28px 72px rgba(0,0,0,0.5)",
          fontFamily: "'Trebuchet MS', 'Segoe UI', sans-serif",
        }}
      >
        <div
          style={{
            padding: "10px 14px 9px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            background: "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
            display: "grid",
            gap: "8px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "start", flexWrap: "wrap" }}>
            <div style={{ display: "grid", gap: "4px" }}>
              <div style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: "#d8c7b1" }}>
                Curated Presets
              </div>
              <div style={{ fontSize: "20px", fontWeight: 900, color: "#fff7ea", lineHeight: 0.98 }}>Arena Archetypes</div>
              <div style={{ fontSize: "10px", lineHeight: 1.28, color: "#cabfb0", maxWidth: "760px" }}>
                One-page build sheet with compact gear, mini previews, and quick action buttons for applying the full setup or only parts of it.
              </div>
            </div>
            <button type="button" onClick={onClose} style={closeButtonStyle}>
              Close
            </button>
          </div>

          {activePreset ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "74px minmax(0, 1fr) auto",
                gap: "10px",
                alignItems: "center",
                padding: "8px 10px",
                borderRadius: "16px",
                background: `linear-gradient(180deg, ${activeTone.soft}, rgba(255,255,255,0.03))`,
                border: `1px solid ${activeTone.border}`,
              }}
            >
              <img
                src={figureByPresetId[activePreset.id] ?? rushChipFigure}
                alt={activePreset.label}
                style={{
                  width: "74px",
                  height: "74px",
                  objectFit: "cover",
                  borderRadius: "14px",
                  border: `1px solid ${activeTone.border}`,
                  boxShadow: `0 16px 32px rgba(0,0,0,0.24), 0 0 0 2px ${activeTone.soft}`,
                }}
              />
              <div style={{ display: "grid", gap: "5px", minWidth: 0 }}>
                <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                  <div style={{ fontSize: "16px", fontWeight: 900, color: "#fff4e7", lineHeight: 1.02 }}>{activePreset.label}</div>
                  <span
                    style={{
                      borderRadius: "999px",
                      padding: "3px 7px",
                      fontSize: "8px",
                      fontWeight: 800,
                      color: activeTone.accent,
                      background: activeTone.soft,
                      border: `1px solid ${activeTone.border}`,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {activePreset.archetype}
                  </span>
                </div>
                <div style={{ fontSize: "10px", lineHeight: 1.22, color: "#dacbbb" }}>{clampText(activePreset.description, 112)}</div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {activePreset.tags.map((tag) => (
                    <span
                      key={`header-${tag}`}
                      style={{
                        borderRadius: "999px",
                        padding: "2px 6px",
                        fontSize: "7px",
                        border: `1px solid ${activeTone.border}`,
                        background: `linear-gradient(180deg, ${activeTone.soft}, rgba(255,255,255,0.03))`,
                        color: "#efe2d3",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ display: "grid", gap: "6px", justifyItems: "end", alignSelf: "stretch" }}>
                <SummaryPill label="Fight" value={activePreset.targetFightLength} />
                <SummaryPill label="Loadout" value={`${activePreset.loadout.length} items`} />
              </div>
            </div>
          ) : null}
        </div>
        <div
          style={{
            overflowY: "auto",
            padding: "10px 14px 12px",
            display: "grid",
            gridTemplateColumns: "404px minmax(0, 1fr)",
            gap: "10px",
            alignItems: "start",
          }}
        >
          <div style={{ display: "grid", gap: "8px" }}>
            <MiniSectionTitle title="Presets" note="Compact selector" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "8px" }}>
            {buildPresets.map((preset) => {
              const tone = getPresetTone(preset.archetype);
              const selected = preset.id === activePreset?.id;

              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setSelectedPresetId(preset.id);
                    setHoveredSkillId(null);
                    setHoveredConsumableCode(null);
                  }}
                  aria-pressed={selected}
                  aria-label={preset.label}
                  style={{
                    textAlign: "left",
                    display: "grid",
                    gridTemplateColumns: "48px minmax(0, 1fr)",
                    gap: "8px",
                    padding: "7px",
                    borderRadius: "14px",
                    cursor: "pointer",
                    border: `2px solid ${selected ? tone.border : "rgba(255,255,255,0.1)"}`,
                    background: selected
                      ? `linear-gradient(180deg, ${tone.soft}, rgba(255,255,255,0.05) 54%, rgba(0,0,0,0.12))`
                      : "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
                    color: "#fff6ea",
                    minHeight: "88px",
                    boxShadow: selected
                      ? `0 0 0 1px rgba(255,255,255,0.04) inset, 0 12px 24px rgba(0,0,0,0.24), 0 0 28px ${tone.soft}`
                      : "0 10px 18px rgba(0,0,0,0.18)",
                  }}
                >
                  <img
                    src={figureByPresetId[preset.id] ?? rushChipFigure}
                    alt=""
                    aria-hidden="true"
                    style={{
                      width: "42px",
                      height: "42px",
                      objectFit: "cover",
                      borderRadius: "10px",
                      border: `1px solid ${selected ? tone.border : "rgba(255,255,255,0.14)"}`,
                      boxShadow: selected ? `0 0 0 2px ${tone.soft}` : "none",
                    }}
                  />
                  <div style={{ display: "grid", gap: "5px", minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "start" }}>
                      <div style={{ display: "grid", gap: "2px", minWidth: 0 }}>
                        <div style={{ fontSize: "11px", fontWeight: 900, lineHeight: 1.02 }}>{preset.label}</div>
                        <div
                          style={{
                            fontSize: "8px",
                            fontWeight: 800,
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            color: tone.accent,
                          }}
                        >
                          {preset.archetype}
                        </div>
                      </div>
                      <span style={{ fontSize: "8px", color: "#cbb8a5", whiteSpace: "nowrap" }}>{shortFightLength(preset.targetFightLength)}</span>
                    </div>
                    <div style={{ fontSize: "8px", lineHeight: 1.14, color: "#ccbcae" }}>{clampText(preset.description, 44)}</div>
                    <div style={{ display: "grid", gap: "3px" }}>
                      {Object.entries(preset.allocations).map(([statName, value]) => (
                        <CompactStatBar key={`${preset.id}-${statName}`} statName={statName} value={value} />
                      ))}
                    </div>
                  </div>
                </button>
              );
            })}
            </div>
          </div>

          <div style={{ display: "grid", gap: "8px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: "8px", alignItems: "start" }}>
              <div style={{ display: "grid", gap: "7px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(108px, 1fr))", gap: "6px" }}>
                  <MetricCard label="Damage Plan" value={activePreset ? resolveDamagePlan(activePreset) : "None"} tone={activeTone.accent} />
                  <MetricCard label="Defense" value={activePreset ? resolveDefensePlan(activePreset) : "None"} tone="#b7d5ff" />
                  <MetricCard label="Skill Kit" value={activePreset ? `${activePreset.skillLoadout.length} equipped` : "0 equipped"} tone="#ee9abb" />
                  <MetricCard label="Consumables" value={activePreset ? `${activePreset.consumables.length} slots` : "0 slots"} tone="#ebcf8b" />
                </div>
                {activePreset ? (
                  <PanelCard
                    style={{
                      padding: "7px 8px",
                      background: "rgba(255,255,255,0.025)",
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                      gap: "6px",
                    }}
                  >
                    <InlineListBlock title="Strengths" items={activePreset.strengths} accent="#87e2cf" />
                    <InlineListBlock title="Weaknesses" items={activePreset.weaknesses} accent="#f0a286" />
                  </PanelCard>
                ) : null}
              </div>
              <div style={{ display: "grid", gap: "8px", justifyItems: "end" }}>
                <ActionButton type="button" tone="primary" onClick={() => activePreset && onApplyBuild(activePreset.id)} style={{ minWidth: "118px", fontSize: "10px", padding: "7px 10px" }}>
                  Apply Build
                </ActionButton>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.1fr) minmax(280px, 0.9fr)", gap: "10px", alignItems: "start" }}>
              <div style={{ display: "grid", gap: "6px" }}>
                <PanelCard
                  style={{
                    padding: "8px",
                    display: "grid",
                    gap: "6px",
                    background: zoneStyles.equipment.background,
                    border: `1px solid ${zoneStyles.equipment.border}`,
                    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.03), 0 0 24px ${zoneStyles.equipment.glow}`,
                  }}
                >
                  <MiniSectionTitle title="Equipment" note="Compact loadout" />
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "6px" }}>
                    {activePreset?.loadout.map((itemCode) => <CompactItemCard key={itemCode} item={itemByCode.get(itemCode) ?? null} />)}
                  </div>
                </PanelCard>

                <PanelCard
                  style={{
                    padding: "8px",
                    display: "grid",
                    gap: "6px",
                    background: zoneStyles.skills.background,
                    border: `1px solid ${zoneStyles.skills.border}`,
                    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.03), 0 0 24px ${zoneStyles.skills.glow}`,
                  }}
                >
                  <MiniSectionTitle title="Skills" note="Combat strip" />
                  <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                    {activePreset?.skillLoadout.map((skillId) => {
                      const skill = skillById.get(skillId) ?? null;
                      const active = (hoveredSkillId ?? activePreset.skillLoadout[0]) === skillId;

                      return (
                        <button
                          key={skillId}
                          type="button"
                          onMouseEnter={() => setHoveredSkillId(skillId)}
                          onFocus={() => setHoveredSkillId(skillId)}
                          onMouseLeave={() => setHoveredSkillId(null)}
                          style={{
                            display: "grid",
                            gap: "1px",
                            textAlign: "left",
                            minWidth: "94px",
                            padding: "5px 7px",
                            borderRadius: "12px",
                            border: `1px solid ${active ? activeTone.border : "rgba(255,255,255,0.08)"}`,
                            background: active
                              ? `linear-gradient(180deg, ${activeTone.soft}, rgba(255,255,255,0.04))`
                              : "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                            color: "#fff7ea",
                            cursor: "pointer",
                            boxShadow: active ? `0 0 16px ${activeTone.soft}` : "none",
                          }}
                        >
                          <span style={{ fontSize: "9px", fontWeight: 800, lineHeight: 1.02 }}>{skill?.name ?? formatIdLabel(skillId)}</span>
                        </button>
                      );
                    })}
                  </div>
                </PanelCard>

                <PanelCard
                  style={{
                    padding: "8px",
                    display: "grid",
                    gap: "6px",
                    background: zoneStyles.consumables.background,
                    border: `1px solid ${zoneStyles.consumables.border}`,
                    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.03), 0 0 24px ${zoneStyles.consumables.glow}`,
                  }}
                >
                  <MiniSectionTitle title="Consumables" note="Shrunk to quick slots" />
                  <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                    {activePreset?.consumables.map((itemCode) => {
                      const item = itemByCode.get(itemCode) ?? null;
                      const active = (hoveredConsumableCode ?? activePreset.consumables[0]) === itemCode;

                      return (
                        <button
                          key={itemCode}
                          type="button"
                          onMouseEnter={() => setHoveredConsumableCode(itemCode)}
                          onFocus={() => setHoveredConsumableCode(itemCode)}
                          onMouseLeave={() => setHoveredConsumableCode(null)}
                          style={{
                            display: "flex",
                            gap: "6px",
                            alignItems: "center",
                            padding: "5px 7px",
                            borderRadius: "12px",
                            border: `1px solid ${active ? "rgba(214,177,95,0.46)" : "rgba(255,255,255,0.08)"}`,
                            background: active
                              ? "linear-gradient(180deg, rgba(214,177,95,0.16), rgba(255,255,255,0.03))"
                              : "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                            color: "#fff7ea",
                            cursor: "pointer",
                            boxShadow: active ? "0 0 18px rgba(214,177,95,0.16)" : "none",
                          }}
                        >
                          <span
                            style={{
                              width: "20px",
                              height: "20px",
                              borderRadius: "999px",
                              display: "grid",
                              placeItems: "center",
                              fontSize: "10px",
                              background: "rgba(255,255,255,0.08)",
                              border: "1px solid rgba(255,255,255,0.08)",
                            }}
                          >
                            {getConsumableIcon(item)}
                          </span>
                          <span style={{ fontSize: "9px", fontWeight: 800 }}>{item?.name ?? formatIdLabel(itemCode)}</span>
                        </button>
                      );
                    })}
                  </div>
                </PanelCard>
              </div>

              <div style={{ display: "grid", gap: "6px" }}>
                <HoverCard
                  title={activeSkill?.name ?? "Preset skill"}
                  subtitle={activeSkill ? `${formatResource(activeSkill.resourceType)} cost ${activeSkill.cost}` : "Hover a skill chip"}
                  accent={activeTone.accent}
                  body={
                    activeSkill ? (
                      <>
                        <div>{activeSkill.description}</div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "6px" }}>
                          <MiniInfo label="Damage" value={`x${activeSkill.damageMultiplier.toFixed(2)}`} />
                          <MiniInfo label="Crit" value={`+${activeSkill.critChanceBonus}%`} />
                          <MiniInfo label="States" value={String(activeSkill.effects?.length ?? 0)} />
                        </div>
                      </>
                    ) : (
                      <div>Move the pointer over a recommended skill to inspect the mini tooltip card.</div>
                    )
                  }
                />

                <HoverCard
                  title={activeConsumable?.name ?? "Preset consumable"}
                  subtitle={activeConsumable ? formatUsageMode(activeConsumable) : "Hover a consumable chip"}
                  accent="#ebcf8b"
                  body={
                    activeConsumable ? (
                      <>
                        <div>{activeConsumable.description}</div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "6px" }}>
                          <MiniInfo label="Heal" value={String(activeConsumable.consumableEffect?.heal ?? 0)} />
                          <MiniInfo label="Resource" value={formatResourceRestore(activeConsumable)} />
                          <MiniInfo label="Mode" value={formatUsageModeShort(activeConsumable)} />
                        </div>
                      </>
                    ) : (
                      <div>Hover a consumable chip to inspect its quick info card.</div>
                    )
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </ModalSurface>
    </ModalOverlay>
  );
}

function MiniSectionTitle({ title, note }: { title: string; note: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "baseline", flexWrap: "wrap" }}>
      <div style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#dbc5ae" }}>{title}</div>
      <div style={{ fontSize: "9px", color: "#aa9888" }}>{note}</div>
    </div>
  );
}

function SummaryPill({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "grid",
        gap: "2px",
        minWidth: "94px",
        padding: "6px 8px",
        borderRadius: "12px",
        background: "rgba(12,11,10,0.32)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div style={{ fontSize: "8px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#cdb9a4" }}>{label}</div>
      <div style={{ fontSize: "10px", fontWeight: 800, color: "#fff6ea" }}>{value}</div>
    </div>
  );
}

function MetricCard({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <PanelCard
      style={{
        padding: "7px 8px",
        display: "grid",
        gap: "2px",
        background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.025))",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
      }}
    >
      <div style={{ fontSize: "8px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#cdb9a4" }}>{label}</div>
      <div style={{ fontSize: "11px", fontWeight: 900, color: tone }}>{value}</div>
    </PanelCard>
  );
}

function InlineListBlock({ title, items, accent }: { title: string; items: string[]; accent: string }) {
  return (
    <div style={{ display: "grid", gap: "4px" }}>
      <div style={{ fontSize: "8px", textTransform: "uppercase", letterSpacing: "0.1em", color: accent }}>{title}</div>
      <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
        {items.map((item) => (
          <span
            key={`${title}-${item}`}
            style={{
              borderRadius: "999px",
              padding: "4px 7px",
              fontSize: "9px",
              lineHeight: 1.2,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.04)",
              color: "#f1e4d5",
            }}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function CompactStatBar({ statName, value }: { statName: string; value: number }) {
  const statTone = statToneByName[statName];
  const width = `${Math.max(16, Math.min(100, value * 20))}%`;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "32px 1fr 18px", gap: "6px", alignItems: "center" }}>
      <div style={{ fontSize: "7px", fontWeight: 800, letterSpacing: "0.08em", color: statTone?.color ?? "#fff7ea" }}>{statTone?.label ?? statName}</div>
      <div style={{ height: "5px", borderRadius: "999px", background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
        <div style={{ width, height: "100%", borderRadius: "999px", background: `linear-gradient(90deg, ${statTone?.glow ?? "rgba(255,255,255,0.2)"}, ${statTone?.color ?? "#fff7ea"})` }} />
      </div>
      <div style={{ fontSize: "8px", color: "#d7c2ae", textAlign: "right" }}>{value}</div>
    </div>
  );
}

function CompactItemCard({ item }: { item: Item | null }) {
  if (!item) {
    return <PanelCard style={{ padding: "8px 9px", background: "rgba(255,255,255,0.02)", color: "#bfae9d" }}>Missing item</PanelCard>;
  }

  return (
    <PanelCard
      style={{
        padding: "6px 7px",
        display: "grid",
        gap: "3px",
        background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "start" }}>
        <div style={{ display: "grid", gap: "2px" }}>
          <div style={{ fontSize: "10px", fontWeight: 800, color: "#fff6ea", lineHeight: 1.02 }}>{item.name}</div>
          <div style={{ fontSize: "7px", textTransform: "uppercase", letterSpacing: "0.08em", color: "#cdb9a4" }}>
            {item.equip ? formatSlot(item.equip.slot) : item.type}
          </div>
        </div>
        <span
          style={{
            borderRadius: "999px",
            padding: "2px 5px",
            fontSize: "7px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#ead9c8",
          }}
        >
          {getItemIcon(item)}
        </span>
      </div>
      <div style={{ fontSize: "8px", lineHeight: 1.08, color: "#cab8a6" }}>{clampText(item.description, 42)}</div>
    </PanelCard>
  );
}

function HoverCard({
  title,
  subtitle,
  accent,
  body,
}: {
  title: string;
  subtitle: string;
  accent: string;
  body: ReactNode;
}) {
  return (
    <PanelCard
      style={{
        padding: "9px",
        display: "grid",
        gap: "6px",
        background: zoneStyles.insight.background,
        border: `1px solid ${zoneStyles.insight.border}`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.03), 0 0 24px ${zoneStyles.insight.glow}`,
      }}
    >
      <div style={{ display: "grid", gap: "3px" }}>
        <div style={{ fontSize: "12px", fontWeight: 900, color: "#fff7ea", lineHeight: 1.04 }}>{title}</div>
        <div style={{ fontSize: "8px", textTransform: "uppercase", letterSpacing: "0.1em", color: accent }}>{subtitle}</div>
      </div>
      <div style={{ fontSize: "10px", lineHeight: 1.28, color: "#d7c8b8", display: "grid", gap: "6px" }}>{body}</div>
    </PanelCard>
  );
}

function MiniInfo({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "grid",
        gap: "2px",
        padding: "6px 7px",
        borderRadius: "10px",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div style={{ fontSize: "7px", textTransform: "uppercase", letterSpacing: "0.08em", color: "#b9a791" }}>{label}</div>
      <div style={{ fontSize: "10px", fontWeight: 800, color: "#fff4e7" }}>{value}</div>
    </div>
  );
}

function getPresetTone(archetype?: string | null) {
  return presetToneByArchetype[archetype ?? ""] ?? {
    accent: "#ffe2c2",
    border: "rgba(255,171,97,0.24)",
    soft: "rgba(255,171,97,0.10)",
  };
}

function clampText(text: string, maxLength: number) {
  return text.length <= maxLength ? text : `${text.slice(0, maxLength - 1).trimEnd()}...`;
}

function resolveDamagePlan(preset: CombatBuildPreset) {
  if (preset.tags.includes("Crit")) {
    return "Crit spike";
  }
  if (preset.tags.includes("Bleed")) {
    return "Bleed ramp";
  }
  if (preset.tags.includes("Heavy")) {
    return "Heavy punish";
  }
  if (preset.tags.includes("Control")) {
    return "Control drain";
  }

  return "Stable tempo";
}

function resolveDefensePlan(preset: CombatBuildPreset) {
  if (preset.archetype === "Defense" || preset.archetype === "Sustain") {
    return "High stability";
  }
  if (preset.loadout.includes("oak-shield")) {
    return "Shield cover";
  }
  if (preset.archetype === "Burst") {
    return "Light defense";
  }

  return "Balanced cover";
}

function shortFightLength(value: string) {
  return value.replace(" rounds", "r");
}

function getItemIcon(item: Item) {
  if (item.type === "weapon") {
    return "ATK";
  }
  if (item.type === "shield") {
    return "DEF";
  }
  if (item.type === "consumable") {
    return "USE";
  }
  if (item.type === "accessory") {
    return "MOD";
  }

  return "GEAR";
}

function getConsumableIcon(item: Item | null) {
  if (!item) {
    return "+";
  }
  if ((item.consumableEffect?.heal ?? 0) > 0) {
    return "HP";
  }

  return "FX";
}

function formatSlot(slot: string) {
  switch (slot) {
    case "mainHand":
      return "Main Hand";
    case "offHand":
      return "Off Hand";
    case "helmet":
      return "Helmet";
    case "armor":
      return "Armor";
    case "gloves":
      return "Gloves";
    case "boots":
      return "Boots";
    case "accessory":
      return "Accessory";
    default:
      return formatIdLabel(slot);
  }
}

function formatIdLabel(value: string) {
  return value
    .split("-")
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatResource(resource: CombatSkill["resourceType"]) {
  switch (resource) {
    case "momentum":
      return "Momentum";
    case "focus":
      return "Focus";
    case "rage":
      return "Rage";
    default:
      return formatIdLabel(resource);
  }
}

function formatResourceRestore(item: Item) {
  const restore = item.consumableEffect?.resourceRestore;

  if (!restore) {
    return "None";
  }

  const first = Object.entries(restore).find(([, value]) => typeof value === "number" && value > 0);

  if (!first) {
    return "None";
  }

  return `${formatResource(first[0] as CombatSkill["resourceType"])} +${String(first[1])}`;
}

function formatUsageMode(item: Item) {
  const usageMode = item.consumableEffect?.usageMode;

  if (usageMode === "with_attack") {
    return "Used with attack";
  }
  if (usageMode === "replace_attack") {
    return "Replaces attack";
  }

  return "Preset consumable";
}

function formatUsageModeShort(item: Item) {
  const usageMode = item.consumableEffect?.usageMode;

  if (usageMode === "with_attack") {
    return "Linked";
  }
  if (usageMode === "replace_attack") {
    return "Stand-alone";
  }

  return "Basic";
}
