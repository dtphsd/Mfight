export interface ProfileBattleStats {
  total: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
}

export interface ProfileMedalShowcase {
  id: string;
  label: string;
  shortLabel: string;
  tone: "bronze" | "silver" | "gold" | "legendary";
}

export interface ProfileGiftShowcase {
  id: string;
  label: string;
  from: string;
  tone: "common" | "rare" | "epic";
}

export interface ProfileWallShowcase {
  statusLine: string;
  pinnedNote: string;
}

export interface ProfileMeta {
  motto: string;
  clanName: string | null;
  clanTag: string | null;
  battles: ProfileBattleStats;
  medals: ProfileMedalShowcase[];
  gifts: ProfileGiftShowcase[];
  wall: ProfileWallShowcase;
}

export type ProfileBattleResult = "win" | "loss" | "draw";
