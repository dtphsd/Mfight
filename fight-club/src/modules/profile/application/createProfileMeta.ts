import type { ProfileBattleResult, ProfileMeta } from "@/modules/profile/model/Profile";

interface CreateProfileMetaInput {
  side?: "player" | "bot";
}

export function createProfileMeta(input: CreateProfileMetaInput = {}): ProfileMeta {
  if (input.side === "bot") {
    return {
      motto: "Built for the arena and tuned for pressure.",
      clanName: "Iron Pit",
      clanTag: "PIT",
      battles: {
        total: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        winRate: 0,
      },
      medals: [
        { id: "pit-veteran", label: "Pit Veteran", shortLabel: "PV", tone: "silver" },
        { id: "crusher-loop", label: "Crusher Loop", shortLabel: "CL", tone: "bronze" },
      ],
      gifts: [
        { id: "bot-token", label: "Spare Parts", from: "Arena Staff", tone: "common" },
      ],
      wall: {
        statusLine: "Current stance: ready for the next challenger.",
        pinnedNote: "Arena bots use this panel as a compact scouting card until the full public-profile system exists.",
      },
    };
  }

  return {
    motto: "Hit first, read the counter, finish clean.",
    clanName: null,
    clanTag: null,
    battles: {
      total: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      winRate: 0,
    },
    medals: [
      { id: "starter-ring", label: "Starter Ring", shortLabel: "SR", tone: "bronze" },
      { id: "sand-veteran", label: "Sand Veteran", shortLabel: "SV", tone: "silver" },
      { id: "crit-mark", label: "Critical Mark", shortLabel: "CM", tone: "gold" },
    ],
    gifts: [
      { id: "ration-pack", label: "Ration Pack", from: "Lodge", tone: "common" },
      { id: "crow-token", label: "Crow Token", from: "Spectator", tone: "rare" },
    ],
    wall: {
      statusLine: "Open for duels, scouting, and gear checks.",
      pinnedNote: "Public gifts, wall posts, and clan links stay placeholder-only until the project grows a real shared profile layer.",
    },
  };
}

export function addProfileBattleResult(profile: ProfileMeta, result: ProfileBattleResult): ProfileMeta {
  const total = profile.battles.total + 1;
  const wins = profile.battles.wins + (result === "win" ? 1 : 0);
  const losses = profile.battles.losses + (result === "loss" ? 1 : 0);
  const draws = profile.battles.draws + (result === "draw" ? 1 : 0);

  return {
    ...profile,
    battles: {
      total,
      wins,
      losses,
      draws,
      winRate: total > 0 ? Math.round((wins / total) * 100) : 0,
    },
  };
}
