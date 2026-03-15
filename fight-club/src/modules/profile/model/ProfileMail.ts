export type ProfileActorId = "player" | "bot";

export interface ProfileMailEntry {
  id: string;
  fromActorId: ProfileActorId | "system";
  fromName: string;
  toActorId: ProfileActorId | "system";
  toName: string;
  subject: string;
  body: string;
  sentAt: number;
  readAt: number | null;
}

export interface ProfileMailbox {
  entries: ProfileMailEntry[];
}

export interface ProfileMailboxes {
  player: ProfileMailbox;
  bot: ProfileMailbox;
}
