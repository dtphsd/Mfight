import type { CSSProperties } from "react";

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
