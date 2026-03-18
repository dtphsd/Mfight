import { useState, type CSSProperties } from "react";
import razorBoarFigure from "@/assets/combat/Razor-Boar.jpg";
import kitsuneFigure from "@/assets/combat/Kitsune-Bit.jpg";
import { ModalOverlay } from "@/ui/components/shared/ModalOverlay";
import { ModalSurface } from "@/ui/components/shared/ModalSurface";
import { combatAgentProfile as baseCombatAgentProfile, uiAgentProfile as baseUiAgentProfile, type CombatAgentProfile } from "./combatAgentData";
import combatAgentJournalRaw from "../../../../TAMA_start/combat_agent_journal.md?raw";
import combatPatchNotesRaw from "../../../../TAMA_start/combat_patch_notes.md?raw";
import uiAgentJournalRaw from "../../../../TAMA_start/ui_agent_journal.md?raw";
import uiPatchNotesRaw from "../../../../TAMA_start/ui_patch_notes.md?raw";

interface CombatAgentScreenProps {
  onBack: () => void;
  onOpenCombatSandbox: () => void;
}

interface CombatJournalEntry {
  id: string;
  title: string;
  date: string;
  xp: number;
  impact: string;
  track: string;
  type: string;
  achievement: string;
  summary: string;
}

interface CombatJournalStatus {
  name: string;
  rank: string;
  level: number;
  totalXp: number;
  nextRankXp: number;
  bugsKilled: number;
  tracks: Record<string, number>;
}

interface CombatPatchNote {
  id: string;
  title: string;
  date: string;
  bullets: Array<{ text: string; level: number }>;
}

type AgentTab = "combat" | "ui";

const specialistScrollClassName = "ecosystem-agents__scroll";

const shellStyle: CSSProperties = {
  display: "grid",
  gap: "10px",
};

const surfaceStyle: CSSProperties = {
  borderRadius: "20px",
  border: "1px solid rgba(255,255,255,0.08)",
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02)), radial-gradient(circle at top right, rgba(255,192,128,0.08), transparent 34%)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
};

const cardStyle: CSSProperties = {
  borderRadius: "14px",
  padding: "8px 10px",
  border: "1px solid rgba(255,255,255,0.07)",
  background:
    "rgba(255,255,255,0.03)",
  boxShadow: "none",
};

const chipStyle: CSSProperties = {
  padding: "4px 7px",
  borderRadius: "999px",
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.04)",
  color: "rgba(255,244,231,0.88)",
  fontSize: "9px",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
};

const sectionLabelStyle: CSSProperties = {
  fontSize: "9px",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "#d0b498",
};

const sectionSubtleStyle: CSSProperties = {
  marginTop: "3px",
  fontSize: "11px",
  color: "rgba(244,239,227,0.64)",
};

const commandCodeStyle: CSSProperties = {
  display: "inline-flex",
  marginTop: "4px",
  padding: "5px 7px",
  borderRadius: "9px",
  background: "rgba(12,14,30,0.65)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "inherit",
  fontSize: "10px",
  wordBreak: "break-word",
  boxShadow: "none",
};

function parseAgentJournalEntries(markdown: string): CombatJournalEntry[] {
  const entriesBlock = markdown.match(/## [A-Za-z ]*Entries\s+([\s\S]*?)(?=\n---\n|\n## |\s*$)/)?.[1] ?? "";

  return entriesBlock
    .split(/\n### /)
    .slice(1)
    .map((chunk) => `### ${chunk}`)
    .map((chunk) => {
      const headerMatch = chunk.match(/^###\s+([A-Z]+-\d+)\s+-\s+([^\n]+)/);
      const dateMatch = chunk.match(/\*\*Date\*\*:\s+([^\n]+)/);
      const xpMatch = chunk.match(/\*\*XP\*\*:\s+\+?(\d+)/);
      const impactMatch = chunk.match(/\*\*Impact\*\*:\s+([^\n]+)/);
      const trackMatch = chunk.match(/\*\*Track\*\*:\s+([^\n]+)/);
      const typeMatch = chunk.match(/\*\*Type\*\*:\s+([^\n]+)/);
      const achievementMatch = chunk.match(/\*\*Achievement\*\*:\s+([^\n]+)/);
      const summaryMatch = chunk.match(/#### What happened\s+([\s\S]*?)(?=\n####|\n---|\n### |\s*$)/);

      if (!headerMatch || !dateMatch) {
        return null;
      }

      return {
        id: headerMatch[1],
        title: headerMatch[2].trim(),
        date: dateMatch[1].trim(),
        xp: Number.parseInt(xpMatch?.[1] ?? "0", 10),
        impact: impactMatch?.[1].trim() ?? "n/a",
        track: trackMatch?.[1].trim() ?? "Systems Safety",
        type: typeMatch?.[1].trim() ?? "Systems Update",
        achievement: achievementMatch?.[1].trim() ?? "none",
        summary: summaryMatch?.[1].replace(/\s+/g, " ").trim() ?? "No summary available.",
      };
    })
    .filter((entry): entry is CombatJournalEntry => entry !== null)
    .sort((left, right) => right.id.localeCompare(left.id, undefined, { numeric: true }));
}

function parseAgentJournalStatus(markdown: string, baseProfile: CombatAgentProfile): CombatJournalStatus {
  const statusMatch = markdown.match(/## Status\s+([\s\S]*?)(?=\n## |\n---|\s*$)/);
  const tracksMatch = markdown.match(/## Mastery Tracks\s+([\s\S]*?)(?=\n## |\n---|\s*$)/);

  const statusBlock = statusMatch?.[1] ?? "";
  const tracksBlock = tracksMatch?.[1] ?? "";

  const name = statusBlock.match(/- Name:\s+([^\n]+)/)?.[1]?.trim() ?? baseProfile.name;
  const rank = statusBlock.match(/- Rank:\s+([^\n]+)/)?.[1]?.trim() ?? baseProfile.rank;
  const level = Number.parseInt(statusBlock.match(/- Level:\s+(\d+)/)?.[1] ?? `${baseProfile.level}`, 10);
  const totalXp = Number.parseInt(statusBlock.match(/- Total XP:\s+(\d+)/)?.[1] ?? `${baseProfile.xpCurrent}`, 10);
  const nextRankXp = Number.parseInt(
    statusBlock.match(/- Next Rank XP:\s+(\d+)/)?.[1] ?? `${baseProfile.xpNext}`,
    10
  );

  const tracks = Object.fromEntries(
    [...tracksBlock.matchAll(/- ([^:]+):\s+(\d+)/g)].map((match) => [match[1].trim(), Number.parseInt(match[2], 10)])
  );

  return {
    name,
    rank,
    level,
    totalXp,
    nextRankXp,
    bugsKilled: Number.parseInt(markdown.match(/"bugsKilled":\s*(\d+)/)?.[1] ?? "0", 10),
    tracks,
  };
}

function parseAgentPatchNotes(markdown: string): CombatPatchNote[] {
  return markdown
    .split(/\n## /)
    .slice(1)
    .map((chunk) => `## ${chunk}`)
    .map((chunk, index) => {
      const headerMatch = chunk.match(/^##\s+(\d{4}-\d{2}-\d{2})\s+-\s+([^\n]+)/);
      if (!headerMatch) {
        return null;
      }

      const bullets = [...chunk.matchAll(/^(\s*)- (.+)$/gm)].map((match) => ({
        level: Math.floor((match[1]?.length ?? 0) / 2),
        text: match[2].trim(),
      }));

      return {
        id: `PATCH-${String(index + 1).padStart(3, "0")}`,
        date: headerMatch[1],
        title: headerMatch[2].trim(),
        bullets,
      };
    })
    .filter((entry): entry is CombatPatchNote => entry !== null)
    .sort((left, right) => right.date.localeCompare(left.date));
}

function resolveTrackTone(track: string) {
  const normalized = track.toLowerCase();

  if (normalized.includes("formula")) {
    return { accent: "#f09b79", tint: "rgba(240,155,121,0.12)" };
  }
  if (normalized.includes("ai")) {
    return { accent: "#85dfd3", tint: "rgba(133,223,211,0.12)" };
  }
  if (normalized.includes("balance")) {
    return { accent: "#f0cb88", tint: "rgba(240,203,136,0.12)" };
  }
  if (normalized.includes("systems")) {
    return { accent: "#c5a0ff", tint: "rgba(197,160,255,0.12)" };
  }

  return { accent: "#66e08a", tint: "rgba(102,224,138,0.12)" };
}

function resolveImpactTone(impact: string) {
  const score = Number.parseInt(impact, 10);

  if (Number.isNaN(score)) {
    return { accent: "#d0b498", tint: "rgba(208,180,152,0.12)" };
  }
  if (score >= 8) {
    return { accent: "#ff9f6e", tint: "rgba(255,159,110,0.14)" };
  }
  if (score >= 5) {
    return { accent: "#f0cb88", tint: "rgba(240,203,136,0.12)" };
  }

  return { accent: "#85dfd3", tint: "rgba(133,223,211,0.12)" };
}

function resolveTagTone(index: number) {
  if (index % 3 === 0) {
    return { accent: "#f0cb88", tint: "rgba(240,203,136,0.16)" };
  }
  if (index % 3 === 1) {
    return { accent: "#85dfd3", tint: "rgba(133,223,211,0.16)" };
  }
  return { accent: "#66e08a", tint: "rgba(102,224,138,0.16)" };
}

export function CombatAgentScreen({ onBack, onOpenCombatSandbox }: CombatAgentScreenProps) {
  const [activeTab, setActiveTab] = useState<AgentTab>("combat");
  const [patchNotesOpen, setPatchNotesOpen] = useState(false);
  const agentDefinition = activeTab === "combat"
    ? {
        id: "combat" as const,
        label: "Combat Master",
        portrait: razorBoarFigure,
        baseProfile: baseCombatAgentProfile,
        journalRaw: combatAgentJournalRaw,
        patchNotesRaw: combatPatchNotesRaw,
        patchLogsLabel: "Combat Logs",
        patchSummary: "Canonical running log for combat balance, formula, AI, and UX changes.",
        activitySummary: "Recent combat-agent milestones",
      }
    : {
        id: "ui" as const,
        label: "UI Master",
        portrait: kitsuneFigure,
        baseProfile: baseUiAgentProfile,
        journalRaw: uiAgentJournalRaw,
        patchNotesRaw: uiPatchNotesRaw,
        patchLogsLabel: "UI Logs",
        patchSummary: "Canonical running log for UI systems, UX, interaction, and specialist-surface changes.",
        activitySummary: "Recent UI-agent milestones",
      };
  const journalStatus = parseAgentJournalStatus(agentDefinition.journalRaw, agentDefinition.baseProfile);
  const journalEntries = parseAgentJournalEntries(agentDefinition.journalRaw);
  const patchNotes = parseAgentPatchNotes(agentDefinition.patchNotesRaw);
  const achievementCount = new Set(
    journalEntries
      .map((entry) => entry.achievement)
      .filter((achievement) => achievement && achievement.toLowerCase() !== "none")
  ).size;
  const highImpactCount = journalEntries.filter((entry) => {
    const score = Number.parseInt(entry.impact, 10);
    return !Number.isNaN(score) && score >= 7;
  }).length;
  const combatAgentProfile = {
    ...agentDefinition.baseProfile,
    name: journalStatus.name,
    rank: journalStatus.rank,
    level: journalStatus.level,
    xpCurrent: journalStatus.totalXp,
    xpNext: journalStatus.nextRankXp,
    achievementsUnlocked: achievementCount,
    battleWins: journalEntries.length,
    safeFixes: highImpactCount,
    bugsKilled: journalStatus.bugsKilled,
    tracks: agentDefinition.baseProfile.tracks.map((track) => ({
      ...track,
      value: journalStatus.tracks[track.label] ?? 0,
    })),
  };
  const xpPercent =
    combatAgentProfile.xpNext > 0
      ? Math.min(100, Math.round((combatAgentProfile.xpCurrent / combatAgentProfile.xpNext) * 100))
      : 100;
  const activityLog = journalEntries;
  const highlightedTrack = combatAgentProfile.tracks.reduce((best, current) =>
    current.value > best.value ? current : best
  );

  return (
    <section style={shellStyle}>
      <style>
        {`
          .${specialistScrollClassName} {
            scrollbar-width: thin;
            scrollbar-color: rgba(240, 203, 136, 0.56) rgba(255, 255, 255, 0.05);
          }

          .${specialistScrollClassName}::-webkit-scrollbar {
            width: 10px;
          }

          .${specialistScrollClassName}::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.04);
            border-radius: 999px;
          }

          .${specialistScrollClassName}::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, rgba(240, 203, 136, 0.82), rgba(240, 155, 121, 0.76));
            border-radius: 999px;
            border: 2px solid rgba(11, 14, 27, 0.9);
          }

          .${specialistScrollClassName}::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(180deg, rgba(255, 230, 197, 0.92), rgba(240, 155, 121, 0.86));
          }
        `}
      </style>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(210px, 0.46fr) minmax(0, 1.54fr)",
          gap: "10px",
          alignItems: "start",
        }}
      >
        <aside style={{ ...surfaceStyle, padding: "10px", display: "grid", gap: "8px", alignSelf: "start" }}>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {[
              { id: "combat" as const, label: "🛡 Combat Master" },
              { id: "ui" as const, label: "🦊 UI Master" },
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    ...chipStyle,
                    cursor: "pointer",
                    borderColor: active ? "rgba(240,203,136,0.36)" : "rgba(255,255,255,0.08)",
                    color: active ? "#fff0dc" : "rgba(255,244,231,0.76)",
                    background: active
                      ? "linear-gradient(180deg, rgba(240,203,136,0.18), rgba(255,255,255,0.04))"
                      : "rgba(255,255,255,0.04)",
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div style={{ display: "grid", gap: "2px" }}>
            <div style={sectionLabelStyle}>🫡 Ecosystem Agents</div>
            <h1 style={{ margin: 0, fontSize: "21px", lineHeight: 0.96 }}>{combatAgentProfile.name}</h1>
            <div
              style={{
                color: "#f0cb88",
                fontSize: "10px",
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              {combatAgentProfile.role}
            </div>
            <div style={{ color: "rgba(244,239,227,0.68)", fontSize: "10px", lineHeight: 1.2 }}>
              {combatAgentProfile.domain}
            </div>
          </div>

          <div
            style={{
              ...surfaceStyle,
              minHeight: "116px",
              padding: 0,
              overflow: "hidden",
              position: "relative",
              borderRadius: "16px",
            }}
          >
            <img
              src={agentDefinition.portrait}
              alt={combatAgentProfile.name}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, rgba(4,6,14,0.08) 0%, rgba(4,6,14,0.18) 38%, rgba(4,6,14,0.54) 100%)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "8px",
                right: "8px",
                ...chipStyle,
                color: "#f0cb88",
                background: "rgba(10,12,26,0.72)",
              }}
            >
              Lvl {combatAgentProfile.level}
            </div>
            <div
              style={{
                position: "absolute",
                right: "8px",
                bottom: "8px",
                width: "30px",
                height: "30px",
                borderRadius: "999px",
                display: "grid",
                placeItems: "center",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(10,12,26,0.72)",
                fontSize: "8px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                fontWeight: 800,
                color: "#ffe6c5",
              }}
            >
              {activeTab === "combat" ? "Fix" : "UI"}
            </div>
          </div>

          <div style={{ ...cardStyle, display: "grid", gap: "6px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center" }}>
              <div style={sectionLabelStyle}>Progression</div>
              <span
                style={{
                  ...chipStyle,
                  color: "#66e08a",
                  borderColor: "rgba(102,224,138,0.16)",
                  background: "linear-gradient(180deg, rgba(102,224,138,0.16), rgba(255,255,255,0.03))",
                }}
              >
                Peak {highlightedTrack.label}
              </span>
            </div>
            <div
              style={{
                color: "rgba(244,239,227,0.68)",
                fontSize: "9px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              {combatAgentProfile.rank}
            </div>
            <div
              style={{
                height: "7px",
                borderRadius: "999px",
                overflow: "hidden",
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div
                style={{
                  width: `${xpPercent}%`,
                  height: "100%",
                  borderRadius: "inherit",
                  background: "linear-gradient(90deg, #f0cb88 0%, #e28755 38%, #85dfd3 68%, #66e08a 100%)",
                  boxShadow: "0 0 14px rgba(240,203,136,0.24)",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "8px",
                fontSize: "9px",
                color: "rgba(244,239,227,0.68)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              <span>
                XP {combatAgentProfile.xpCurrent}/{combatAgentProfile.xpNext}
              </span>
              <span>{xpPercent}%</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "6px" }}>
            {[
              ["Achievements", combatAgentProfile.achievementsUnlocked, "#f0cb88"],
              ["Milestones", combatAgentProfile.battleWins, "#85dfd3"],
              ["High Impact", combatAgentProfile.safeFixes, "#66e08a"],
              ["Bugs Killed", combatAgentProfile.bugsKilled, "#f09b79"],
            ].map(([label, value, accent]) => (
              <div key={label} style={{ ...cardStyle, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: "0 auto 0 0", width: "3px", background: `${accent}` }} />
                <div style={{ fontSize: "14px", fontWeight: 800 }}>{value}</div>
                <div
                  style={{
                    marginTop: "2px",
                    fontSize: "8px",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "rgba(244,239,227,0.62)",
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
            {combatAgentProfile.tags.map((tag, index) => {
              const tone = resolveTagTone(index);

              return (
                <span
                  key={tag}
                  style={{
                    ...chipStyle,
                    color: tone.accent,
                    borderColor: `${tone.accent}33`,
                    background: `linear-gradient(180deg, ${tone.tint}, rgba(255,255,255,0.03))`,
                  }}
                >
                  {tag}
                </span>
              );
            })}
          </div>

          <div style={{ display: "grid", gap: "6px" }}>
            <button
              type="button"
              className="main-menu__cta"
              onClick={() => setPatchNotesOpen(true)}
              style={{ width: "100%", justifyContent: "center" }}
            >
              Patch Notes
            </button>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button
                type="button"
                className="main-menu__ghost"
                onClick={onOpenCombatSandbox}
                style={{ paddingInline: "14px", minHeight: "40px", fontSize: "0.84rem" }}
              >
                Combat Sandbox
              </button>
              <button type="button" className="main-menu__ghost" onClick={onBack}>
                Back to Menu
              </button>
            </div>
          </div>
        </aside>

        <div style={{ display: "grid", gap: "8px", alignSelf: "start" }}>
          <div
            style={{
              ...surfaceStyle,
              padding: "10px",
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: "8px",
            }}
          >
            <section style={{ display: "grid", gap: "6px", minWidth: 0, alignContent: "start" }}>
              <div style={{ paddingBottom: "5px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={sectionLabelStyle}>Toolkit</div>
                <div style={sectionSubtleStyle}>Core daily commands</div>
              </div>
              {combatAgentProfile.tools.map((tool) => (
                <article key={tool.command} style={{ ...cardStyle, position: "relative", overflow: "hidden" }}>
                  <div
                    style={{
                      position: "absolute",
                      inset: "0 auto 0 0",
                      width: "3px",
                      background: "#8da6b9",
                    }}
                  />
                  <div style={{ fontSize: "12px", fontWeight: 700 }}>{tool.label}</div>
                  <code style={commandCodeStyle}>{tool.command}</code>
                  <div style={{ marginTop: "4px", fontSize: "10px", lineHeight: 1.28, color: "rgba(244,239,227,0.7)" }}>
                    {tool.purpose}
                  </div>
                </article>
              ))}
            </section>

            <section style={{ display: "grid", gap: "6px", minWidth: 0, alignContent: "start" }}>
              <div style={{ paddingBottom: "5px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={sectionLabelStyle}>Achievements</div>
                <div style={sectionSubtleStyle}>Identity markers</div>
              </div>
              {combatAgentProfile.achievements.map((achievement) => (
                <article
                  key={achievement.name}
                  style={{
                    ...cardStyle,
                    background:
                      "linear-gradient(180deg, rgba(141,166,185,0.10), rgba(255,255,255,0.02)), rgba(16,19,33,0.92)",
                  }}
                >
                  <div style={{ fontSize: "12px", fontWeight: 700 }}>{achievement.name}</div>
                  <div style={{ marginTop: "4px", fontSize: "10px", lineHeight: 1.28, color: "rgba(244,239,227,0.7)" }}>
                    {achievement.note}
                  </div>
                </article>
              ))}
            </section>

            <section style={{ display: "grid", gap: "6px", minWidth: 0, alignContent: "start" }}>
              <div style={{ paddingBottom: "5px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={sectionLabelStyle}>Operating Loop</div>
                <div style={sectionSubtleStyle}>How it works</div>
              </div>
              <div style={{ ...cardStyle, padding: "8px 10px" }}>
                <ol style={{ margin: 0, paddingLeft: "16px", display: "grid", gap: "5px" }}>
                  {combatAgentProfile.operatingLoop.map((step) => (
                    <li key={step} style={{ fontSize: "10px", lineHeight: 1.28, color: "rgba(255,244,231,0.84)" }}>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              <div style={{ ...cardStyle, display: "grid", gap: "5px" }}>
                <div style={sectionLabelStyle}>Mastery</div>
                {combatAgentProfile.tracks.map((track) => {
                  const tone = resolveTrackTone(track.label);

                  return (
                    <div key={track.label} style={{ display: "grid", gap: "3px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", fontSize: "10px" }}>
                        <span>{track.label}</span>
                        <span style={{ color: tone.accent, fontWeight: 700 }}>{track.value}%</span>
                      </div>
                      <div
                        style={{
                          height: "6px",
                          borderRadius: "999px",
                          overflow: "hidden",
                          background: "rgba(255,255,255,0.07)",
                          border: "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        <div
                          style={{
                            width: `${track.value}%`,
                            height: "100%",
                            borderRadius: "inherit",
                            background: `linear-gradient(90deg, ${tone.accent} 0%, rgba(255,255,255,0.9) 100%)`,
                            boxShadow: `0 0 10px ${tone.tint}`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          <section
            style={{
              ...surfaceStyle,
              padding: "10px",
              display: "grid",
              gap: "6px",
              minWidth: 0,
            }}
          >
            <div style={{ paddingBottom: "5px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={sectionLabelStyle}>Activity Log</div>
              <div style={sectionSubtleStyle}>{agentDefinition.activitySummary}</div>
            </div>

            <div
              className={specialistScrollClassName}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                height: "420px",
                maxHeight: "420px",
                overflowY: "auto",
                scrollbarGutter: "stable",
                paddingRight: "4px",
                minWidth: 0,
              }}
            >
              {activityLog.map((entry) => {
                const trackTone = resolveTrackTone(entry.track);
                const impactTone = resolveImpactTone(entry.impact);

                return (
                  <article
                    key={entry.id}
                    style={{
                      ...cardStyle,
                      display: "grid",
                      gap: "5px",
                      position: "relative",
                      overflow: "hidden",
                      minWidth: 0,
                      flex: "0 0 auto",
                      background: `linear-gradient(180deg, ${trackTone.tint}, rgba(255,255,255,0.02)), rgba(16,19,33,0.92)`,
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        inset: "0 auto 0 0",
                        width: "4px",
                        background: trackTone.accent,
                      }}
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center", minWidth: 0 }}>
                      <span
                        style={{
                          ...chipStyle,
                          flexShrink: 0,
                          borderColor: `${trackTone.accent}33`,
                          color: trackTone.accent,
                        }}
                      >
                        {entry.id}
                      </span>
                      <span
                        style={{
                          fontSize: "9px",
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          color: "rgba(244,239,227,0.62)",
                          flexShrink: 1,
                          minWidth: 0,
                        }}
                      >
                        {entry.date}
                      </span>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: "12px", fontWeight: 700, overflowWrap: "anywhere" }}>{entry.title}</div>
                      <div
                        style={{
                          marginTop: "3px",
                          fontSize: "10px",
                          lineHeight: 1.28,
                          color: "rgba(244,239,227,0.7)",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {entry.summary}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", minWidth: 0 }}>
                      <span style={{ ...chipStyle, borderColor: `${trackTone.accent}33`, color: trackTone.accent }}>
                        {entry.track}
                      </span>
                      <span style={{ ...chipStyle, borderColor: `${impactTone.accent}33`, color: impactTone.accent }}>
                        Impact {entry.impact}
                      </span>
                      <span style={{ ...chipStyle, borderColor: "rgba(102,224,138,0.28)", color: "#66e08a" }}>
                        +{entry.xp} XP
                      </span>
                      <span style={{ ...chipStyle, borderColor: "rgba(197,160,255,0.28)", color: "#c5a0ff" }}>
                        {entry.type}
                      </span>
                    </div>
                  </article>
                );
              })}
              {activityLog.length === 0 ? (
                <article
                  style={{
                    ...cardStyle,
                    fontSize: "10px",
                    lineHeight: 1.28,
                    color: "rgba(244,239,227,0.68)",
                  }}
                >
                  No specialist journal entries found yet.
                </article>
              ) : null}
            </div>
          </section>
        </div>
      </div>

      {patchNotesOpen ? (
        <ModalOverlay onClose={() => setPatchNotesOpen(false)} closeLabel="Close combat patch notes" zIndex={60} padding="22px">
          <ModalSurface
            style={{
              width: "min(920px, 100%)",
              maxHeight: "min(82vh, 920px)",
              display: "grid",
              background:
                "linear-gradient(180deg, rgba(18,20,35,0.98), rgba(10,12,24,0.98)), radial-gradient(circle at top right, rgba(240,155,121,0.12), transparent 30%)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "12px",
                alignItems: "center",
                padding: "18px 20px 14px",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div style={{ display: "grid", gap: "3px" }}>
                <div style={sectionLabelStyle}>{agentDefinition.patchLogsLabel}</div>
                <h2 style={{ margin: 0, fontSize: "22px", lineHeight: 1.04 }}>Patch Notes</h2>
                <div style={{ fontSize: "11px", color: "rgba(244,239,227,0.64)" }}>
                  {agentDefinition.patchSummary}
                </div>
              </div>
              <button type="button" className="main-menu__ghost" onClick={() => setPatchNotesOpen(false)}>
                Close
              </button>
            </div>

            <div
              className={specialistScrollClassName}
              style={{
                maxHeight: "calc(min(82vh, 920px) - 84px)",
                overflowY: "auto",
                scrollbarGutter: "stable",
                padding: "16px 20px 20px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                minWidth: 0,
              }}
            >
              {patchNotes.map((note) => (
                <article
                  key={note.id}
                  style={{
                    ...cardStyle,
                    padding: "12px 14px",
                    display: "grid",
                    gap: "8px",
                    minWidth: 0,
                    flex: "0 0 auto",
                    background:
                      "linear-gradient(180deg, rgba(240,155,121,0.08), rgba(255,255,255,0.02)), rgba(16,19,33,0.94)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center", minWidth: 0 }}>
                    <span
                      style={{
                        ...chipStyle,
                        color: "#f09b79",
                        borderColor: "rgba(240,155,121,0.22)",
                        background: "rgba(240,155,121,0.08)",
                      }}
                    >
                      {note.date}
                    </span>
                    <span style={{ fontSize: "10px", color: "rgba(244,239,227,0.54)", letterSpacing: "0.08em" }}>
                      {note.id}
                    </span>
                  </div>
                  <div style={{ fontSize: "16px", fontWeight: 800, color: "#fff0dc", overflowWrap: "anywhere" }}>
                    {note.title}
                  </div>
                  <ul style={{ margin: 0, paddingLeft: "18px", display: "grid", gap: "6px" }}>
                    {note.bullets.map((bullet, index) => (
                      <li
                        key={`${note.id}-bullet-${index}`}
                        style={{
                          marginLeft: `${bullet.level * 16}px`,
                          fontSize: "12px",
                          lineHeight: 1.45,
                          color: "rgba(244,239,227,0.82)",
                          listStyleType: bullet.level > 0 ? "circle" : "disc",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {bullet.text}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </ModalSurface>
        </ModalOverlay>
      ) : null}
    </section>
  );
}
