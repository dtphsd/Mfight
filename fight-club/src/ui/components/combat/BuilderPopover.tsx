import { ActionButton } from "@/ui/components/shared/ActionButton";
import { ModalOverlay } from "@/ui/components/shared/ModalOverlay";
import { ModalSurface } from "@/ui/components/shared/ModalSurface";
import { InfoBanner, PanelCard, SectionIntro } from "./builderPopoverPrimitives";
import {
  BuilderDefenseAndModifiersPanel,
  BuilderHeader,
  BuilderLoadoutPanel,
  BuilderMatchupPanel,
  BuilderSkillsPanel,
  BuilderStatsPanel,
} from "./builderPopoverPanels";
import type { BuilderPopoverProps } from "./builderPopoverTypes";

const secondaryButtonStyle = {
  padding: "8px 12px",
  borderRadius: "999px",
  border: "1px solid rgba(255,255,255,0.16)",
  background: "rgba(255,255,255,0.04)",
  color: "#fff8ed",
  cursor: "pointer",
  fontSize: "10px",
  fontWeight: 800,
} as const;

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
        <BuilderHeader metrics={metrics} resetBuild={resetBuild} onClose={onClose} />

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
                          fontSize: "11px",
                          fontWeight: 900,
                          background: "rgba(255,171,97,0.10)",
                          border: "1px solid rgba(255,171,97,0.18)",
                        }}
                      >
                        BK
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

              <BuilderStatsPanel
                playerCharacter={playerCharacter}
                increaseStat={increaseStat}
                decreaseStat={decreaseStat}
              />
            </div>

            <div style={{ display: "grid", gap: "9px" }}>
              <BuilderLoadoutPanel metrics={metrics} />
              <BuilderSkillsPanel
                unlockedSkills={unlockedSkills}
                equippedSkillIds={equippedSkillIds}
                maxEquippedSkills={maxEquippedSkills}
                toggleEquippedSkill={toggleEquippedSkill}
              />
              <BuilderDefenseAndModifiersPanel metrics={metrics} />
            </div>

            <div style={{ display: "grid", gap: "9px" }}>
              <BuilderMatchupPanel metrics={metrics} />
            </div>
          </div>
        </div>
      </ModalSurface>
    </ModalOverlay>
  );
}
