import type { CombatZone } from "@/modules/combat";

export interface CommentatorActorPhraseSet {
  attack: Record<CombatZone, string[]>;
  dodge: string[];
  block: string[];
  penetration: string[];
  crit: string[];
  knockout: string[];
}

export interface CommentatorPhraseSet {
  player: CommentatorActorPhraseSet;
  bot: CommentatorActorPhraseSet;
  system: string[];
}
