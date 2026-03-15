import { createId } from "@/core/ids/createId";
import type { ProfileActorId, ProfileMailEntry, ProfileMailboxes } from "@/modules/profile/model/ProfileMail";

interface CreateProfileMailboxesInput {
  playerName: string;
  botName: string;
}

interface SendProfileMailInput {
  mailboxes: ProfileMailboxes;
  fromActorId: ProfileActorId;
  fromName: string;
  toActorId: ProfileActorId | "system";
  toName: string;
  subject: string;
  body: string;
}

export function createProfileMailboxes(input: CreateProfileMailboxesInput): ProfileMailboxes {
  return {
    player: {
      entries: [
        createMailEntry({
          fromActorId: "system",
          fromName: "Arena Desk",
          toActorId: "player",
          toName: input.playerName,
          subject: "Welcome to the personal mail service",
          body:
            "Use this inbox to keep short duel notes, direct replies, and local player messages in one place.",
          sentAt: Date.UTC(2026, 2, 15, 9, 0, 0),
          readAt: null,
        }),
        createMailEntry({
          fromActorId: "bot",
          fromName: input.botName,
          toActorId: "player",
          toName: input.playerName,
          subject: "Sparring request",
          body:
            "Open my profile if you want to send route notes, duel plans, or a direct reply before the next arena round.",
          sentAt: Date.UTC(2026, 2, 15, 10, 30, 0),
          readAt: null,
        }),
      ],
    },
    bot: {
      entries: [
        createMailEntry({
          fromActorId: "system",
          fromName: "Pit Control",
          toActorId: "bot",
          toName: input.botName,
          subject: "Arena queue updated",
          body: "Keep your status green and answer scouting mail from active challengers.",
          sentAt: Date.UTC(2026, 2, 15, 8, 40, 0),
          readAt: null,
        }),
      ],
    },
  };
}

export function sendProfileMail(input: SendProfileMailInput): ProfileMailboxes {
  const subject = input.subject.trim();
  const body = input.body.trim();

  if (!subject || !body) {
    return input.mailboxes;
  }

  const nextEntry = createMailEntry({
    fromActorId: input.fromActorId,
    fromName: input.fromName,
    toActorId: input.toActorId,
    toName: input.toName,
    subject,
    body,
    sentAt: Date.now(),
    readAt: input.toActorId === "system" ? Date.now() : null,
  });

  const nextMailboxes: ProfileMailboxes = {
    player: {
      entries: input.mailboxes.player.entries.map((entry) => ({ ...entry })),
    },
    bot: {
      entries: input.mailboxes.bot.entries.map((entry) => ({ ...entry })),
    },
  };

  nextMailboxes[input.fromActorId].entries = [nextEntry, ...nextMailboxes[input.fromActorId].entries];

  if (input.toActorId !== "system") {
    nextMailboxes[input.toActorId].entries = [nextEntry, ...nextMailboxes[input.toActorId].entries];
  }

  return nextMailboxes;
}

export function markMailboxEntriesAsRead(mailbox: ProfileMailboxes, actorId: ProfileActorId): ProfileMailboxes {
  const now = Date.now();
  const nextEntries = mailbox[actorId].entries.map((entry) =>
    entry.toActorId === actorId && entry.readAt === null
      ? {
          ...entry,
          readAt: now,
        }
      : entry
  );

  return {
    ...mailbox,
    [actorId]: {
      entries: nextEntries,
    },
  };
}

export function countUnreadMailboxEntries(mailbox: ProfileMailboxes, actorId: ProfileActorId) {
  return mailbox[actorId].entries.filter((entry) => entry.toActorId === actorId && entry.readAt === null).length;
}

function createMailEntry(input: Omit<ProfileMailEntry, "id">): ProfileMailEntry {
  return {
    id: createId("mail"),
    ...input,
  };
}
