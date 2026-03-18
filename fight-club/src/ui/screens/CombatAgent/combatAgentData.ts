export interface CombatAgentTrack {
  label: string;
  value: number;
  note: string;
}

export interface CombatAgentTool {
  label: string;
  command: string;
  purpose: string;
}

export interface CombatAgentAchievement {
  name: string;
  note: string;
}

export interface CombatAgentProfile {
  name: string;
  role: string;
  domain: string;
  level: number;
  rank: string;
  xpCurrent: number;
  xpNext: number;
  summary: string;
  tags: string[];
  battleWins: number;
  safeFixes: number;
  bugsKilled?: number;
  achievementsUnlocked: number;
  tracks: CombatAgentTrack[];
  tools: CombatAgentTool[];
  achievements: CombatAgentAchievement[];
  operatingLoop: string[];
}

export const combatAgentProfile: CombatAgentProfile = {
  name: "Arena Systems Specialist",
  role: "Combat Systems Agent",
  domain: "Fight Club combat runtime, skills, balance and AI",
  level: 18,
  rank: "Analyst",
  xpCurrent: 62,
  xpNext: 90,
  summary:
    "A dedicated in-project agent for combat formulas, planner behavior, skill economy, balance audits and combat-safe evolution.",
  tags: [
    "Formula Mastery",
    "AI Tactics",
    "Balance Analysis",
    "Systems Design",
    "Combat Safety",
  ],
  battleWins: 14,
  safeFixes: 9,
  achievementsUnlocked: 6,
  tracks: [
    { label: "Formula Mastery", value: 82, note: "Mitigation, crit, block, penetration" },
    { label: "AI Tactics", value: 74, note: "Planner timing, zones, payoff preservation" },
    { label: "Balance Analysis", value: 88, note: "Matrix, zone audit, skill audit" },
    { label: "Systems Design", value: 63, note: "Skills, states, trauma hooks" },
    { label: "Combat Safety", value: 79, note: "Regression tests and docs truth" },
  ],
  tools: [
    {
      label: "Build Matrix",
      command: "npm run balance:matrix",
      purpose: "High-level matchup health and meta shape",
    },
    {
      label: "Zone Audit",
      command: "npm run combat:audit-zones",
      purpose: "Head, chest, belly, waist, legs in open/defended states",
    },
    {
      label: "Skill Audit",
      command: "npm run combat:audit-skills",
      purpose: "Planner rhythm, setup/payoff usage, state bonus conversion",
    },
    {
      label: "Regression Tests",
      command: "npm run test -- tests/modules/combat.test.ts",
      purpose: "Core combat runtime safety",
    },
  ],
  achievements: [
    { name: "Bug Hunter", note: "Confirms and fixes serious combat bugs" },
    { name: "Meta Breaker", note: "Invalidates false balance conclusions with evidence" },
    { name: "Planner Tuner", note: "Improves AI choice quality measurably" },
    { name: "Skill Smith", note: "Restores or creates a live skill loop" },
  ],
  operatingLoop: [
    "Read combat canon files and latest audit outputs",
    "Find direct consumers through imports and usages",
    "Run matrix or targeted audits before changing formulas",
    "Apply one narrow combat hypothesis at a time",
    "Verify with tests, build and docs sync before closing the pass",
  ],
};

export const uiAgentProfile: CombatAgentProfile = {
  name: "Interface Systems Specialist",
  role: "UI Systems Agent",
  domain: "Fight Club UI, UX, interaction flow and presentation systems",
  level: 12,
  rank: "Curator",
  xpCurrent: 34,
  xpNext: 60,
  summary:
    "A dedicated in-project agent for interface systems, UX clarity, design consistency, UI-safe iteration and specialist surface evolution.",
  tags: [
    "Visual Systems",
    "Interaction Design",
    "UX Clarity",
    "Design Consistency",
    "UI Safety",
  ],
  battleWins: 6,
  safeFixes: 4,
  bugsKilled: 3,
  achievementsUnlocked: 2,
  tracks: [
    { label: "Visual Systems", value: 68, note: "Layout rhythm, image framing, visual hierarchy" },
    { label: "Interaction Design", value: 72, note: "Tabs, modals, button flow, micro-journeys" },
    { label: "UX Clarity", value: 79, note: "Readable labels, surfaced meaning, reduced confusion" },
    { label: "Design Consistency", value: 70, note: "Shared shells, mirrored patterns, unified behavior" },
    { label: "UI Safety", value: 64, note: "UI changes that stay stable after build and review" },
  ],
  tools: [
    {
      label: "Build",
      command: "npm run build",
      purpose: "UI safety check after visual and interaction changes",
    },
    {
      label: "Combat Agent Review",
      command: "Open specialist console and inspect both tabs",
      purpose: "Check mirrored UI behavior and information density",
    },
    {
      label: "Screen Audit",
      command: "Review labels, spacing, hierarchy and scroll behavior",
      purpose: "Spot UX drift and readability regressions early",
    },
    {
      label: "Patch Sync",
      command: "Update ui_patch_notes.md and ui_agent_journal.md",
      purpose: "Keep UI memory and visible UI history aligned",
    },
  ],
  achievements: [
    { name: "Console Mirror", note: "Replicated a working specialist shell without fragmenting UX language" },
    { name: "Fox Curator", note: "Established a dedicated UI agent identity inside the shared specialist console" },
  ],
  operatingLoop: [
    "Read UI canon files and the latest specialist UI notes",
    "Find direct UI consumers through imports and usages",
    "Mirror working interaction patterns before inventing new shells",
    "Apply one narrow UI hypothesis at a time",
    "Verify with build, visual review and docs sync before closing the pass",
  ],
};
