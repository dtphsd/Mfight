export interface ArenaTeamMember {
  playerId: string;
  position: "front" | "back";
}

export interface ArenaTeam {
  id: string;
  members: ArenaTeamMember[];
}

