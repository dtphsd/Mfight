import type { CSSProperties } from "react";
import { combatBuildPresets } from "@/orchestration/combat/combatSandboxConfigs";

export function PresetChooser({
  title,
  selectedPresetId,
  locked,
  onSelect,
  description,
  presetChooserStyle,
  sectionHeadStyle,
  eyebrowStyle,
  chipStyle,
  presetGridStyle,
  presetSelectedButtonStyle,
  presetButtonStyle,
  presetMetaStyle,
  helperTextStyle,
}: {
  title: string;
  selectedPresetId: string;
  locked: boolean;
  onSelect: (presetId: string) => void;
  description: string;
  presetChooserStyle: CSSProperties;
  sectionHeadStyle: CSSProperties;
  eyebrowStyle: CSSProperties;
  chipStyle: CSSProperties;
  presetGridStyle: CSSProperties;
  presetSelectedButtonStyle: CSSProperties;
  presetButtonStyle: CSSProperties;
  presetMetaStyle: CSSProperties;
  helperTextStyle: CSSProperties;
}) {
  return (
    <div style={presetChooserStyle}>
      <div style={sectionHeadStyle}>
        <span style={eyebrowStyle}>{title}</span>
        <span style={chipStyle}>{locked ? "Locked for this room" : "Pick before match"}</span>
      </div>
      <div style={presetGridStyle}>
        {combatBuildPresets.map((preset) => {
          const selected = preset.id === selectedPresetId;
          return (
            <button
              key={preset.id}
              type="button"
              style={selected ? presetSelectedButtonStyle : presetButtonStyle}
              onClick={() => onSelect(preset.id)}
              disabled={locked}
            >
              <strong style={{ fontSize: 13 }}>{preset.label}</strong>
              <span style={presetMetaStyle}>{preset.archetype}</span>
            </button>
          );
        })}
      </div>
      <p style={{ ...helperTextStyle, marginTop: 10 }}>{description}</p>
    </div>
  );
}
