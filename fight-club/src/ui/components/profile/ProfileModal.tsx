import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import type { CharacterStats } from "@/modules/character";
import type { ActiveCombatEffect } from "@/modules/combat";
import type { EquipmentSlot } from "@/modules/equipment";
import type { Item } from "@/modules/inventory";
import type { ProfileMeta } from "@/modules/profile";
import type { ProfileActorId, ProfileMailEntry } from "@/modules/profile";
import type { CombatFigureId } from "@/ui/components/combat/CombatSilhouette";
import { CombatSilhouette } from "@/ui/components/combat/CombatSilhouette";
import { ActionButton } from "@/ui/components/shared/ActionButton";
import { ModalOverlay } from "@/ui/components/shared/ModalOverlay";
import { ModalSurface } from "@/ui/components/shared/ModalSurface";

interface ProfileModalProps {
  onClose: () => void;
  name: string;
  level: number;
  figure: CombatFigureId;
  mirrored?: boolean;
  currentHp: number;
  maxHp: number;
  activeEffects: ActiveCombatEffect[];
  equipmentSlots: Array<{ slot: EquipmentSlot; item: Item | null }>;
  profile: ProfileMeta;
  baseStats: CharacterStats;
  derivedStats: Array<{ label: string; value: string; helper?: string }>;
  skillLabels: string[];
  isOwnProfile?: boolean;
  onNameChange?: (value: string) => void;
  onMottoChange?: (value: string) => void;
  mailboxActorId: ProfileActorId;
  mailboxEntries: ProfileMailEntry[];
  unreadMailCount?: number;
  directMessageTarget?: {
    actorId: ProfileActorId | "system";
    name: string;
  } | null;
  onOpenMailbox?: () => void;
  onSendMail?: (input: {
    toActorId: ProfileActorId | "system";
    toName: string;
    subject: string;
    body: string;
  }) => void;
}

const cardStyle: CSSProperties = {
  borderRadius: "18px",
  border: "1px solid rgba(255,255,255,0.08)",
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.025)), radial-gradient(circle at top right, rgba(255,192,128,0.08), transparent 34%)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
};

const statToneByKey: Record<keyof CharacterStats, { label: string; accent: string; tint: string }> = {
  strength: { label: "Strength", accent: "#f09b79", tint: "rgba(240,155,121,0.12)" },
  agility: { label: "Agility", accent: "#85dfd3", tint: "rgba(133,223,211,0.12)" },
  rage: { label: "Rage", accent: "#f0a2c5", tint: "rgba(240,162,197,0.12)" },
  endurance: { label: "Endurance", accent: "#ecd08a", tint: "rgba(236,208,138,0.12)" },
};

export function ProfileModal({
  onClose,
  name,
  level,
  figure,
  mirrored = false,
  currentHp,
  maxHp,
  activeEffects,
  equipmentSlots,
  profile,
  baseStats,
  derivedStats,
  skillLabels,
  isOwnProfile = false,
  onNameChange,
  onMottoChange,
  mailboxActorId,
  mailboxEntries,
  unreadMailCount = 0,
  directMessageTarget = null,
  onOpenMailbox,
  onSendMail,
}: ProfileModalProps) {
  const [identityEditorOpen, setIdentityEditorOpen] = useState(false);
  const [clanModalOpen, setClanModalOpen] = useState(false);
  const [mailModalOpen, setMailModalOpen] = useState(false);
  const [selectedMailId, setSelectedMailId] = useState<string | null>(mailboxEntries[0]?.id ?? null);
  const [composerSubject, setComposerSubject] = useState("");
  const [composerBody, setComposerBody] = useState("");
  const [composerMode, setComposerMode] = useState<"reply" | "new">(
    isOwnProfile && mailboxEntries.length > 0 ? "reply" : "new"
  );

  const sortedMailboxEntries = useMemo(
    () => [...mailboxEntries].sort((left, right) => right.sentAt - left.sentAt),
    [mailboxEntries]
  );
  const selectedMail =
    sortedMailboxEntries.find((entry) => entry.id === selectedMailId) ?? sortedMailboxEntries[0] ?? null;
  const replyTarget = selectedMail ? resolveReplyTarget(selectedMail, mailboxActorId) : null;
  const activeMailTarget = composerMode === "reply" ? replyTarget : directMessageTarget;

  useEffect(() => {
    if (!sortedMailboxEntries.some((entry) => entry.id === selectedMailId)) {
      setSelectedMailId(sortedMailboxEntries[0]?.id ?? null);
    }
  }, [selectedMailId, sortedMailboxEntries]);

  useEffect(() => {
    if (composerMode === "reply" && selectedMail) {
      setComposerSubject(buildReplySubject(selectedMail.subject));
      setComposerBody("");
      return;
    }

    if (composerMode === "new" && directMessageTarget) {
      setComposerSubject(`Message for ${directMessageTarget.name}`);
      setComposerBody("");
    }
  }, [composerMode, directMessageTarget, selectedMail]);

  function openMailbox(mode: "reply" | "new") {
    onOpenMailbox?.();
    setComposerMode(mode);
    setMailModalOpen(true);
  }

  function handleSendMail() {
    if (!activeMailTarget || !onSendMail) {
      return;
    }

    onSendMail({
      toActorId: activeMailTarget.actorId,
      toName: activeMailTarget.name,
      subject: composerSubject,
      body: composerBody,
    });
    setComposerBody("");
    setComposerSubject(
      composerMode === "reply" && selectedMail ? buildReplySubject(selectedMail.subject) : `Message for ${activeMailTarget.name}`
    );
  }

  return (
    <ModalOverlay onClose={onClose} closeLabel="Close profile modal" zIndex={60} padding="18px">
      <ModalSurface
        style={{
          width: "min(1080px, calc(100vw - 28px))",
          maxHeight: "min(760px, calc(100vh - 28px))",
          display: "grid",
          gridTemplateRows: "auto 1fr",
        }}
      >
        <div
          style={{
            padding: "8px 12px 6px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            justifyContent: "flex-end",
            gap: "16px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {!isOwnProfile ? <ActionButton tone="primary">Gift Placeholder</ActionButton> : null}
            <ActionButton onClick={onClose}>Close</ActionButton>
          </div>
        </div>

        <div style={{ padding: "10px", overflow: "auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(420px, 1.08fr) minmax(260px, 0.92fr)", gap: "10px" }}>
            <div style={{ display: "grid", gap: "10px" }}>
              <section style={{ ...cardStyle, padding: "4px 8px 8px", position: "relative", overflow: "hidden" }}>
                <div style={{ display: "grid", gap: "4px" }}>
                  <div
                    style={{
                      position: "absolute",
                      top: "4px",
                      left: "10px",
                      right: "10px",
                      zIndex: 8,
                      pointerEvents: "none",
                      display: "grid",
                      gap: "2px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "flex-start" }}>
                      <div style={{ minWidth: 0, display: "grid", gap: "1px" }}>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            alignItems: "baseline",
                            gap: "8px",
                            minWidth: 0,
                          }}
                        >
                          <span
                            style={{
                              fontSize: "24px",
                              fontWeight: 900,
                              lineHeight: 0.92,
                              letterSpacing: "-0.045em",
                              color: "#fff3e1",
                              textShadow: "0 2px 14px rgba(0,0,0,0.42), 0 0 16px rgba(255,171,97,0.16)",
                            }}
                          >
                            {name}
                          </span>
                          <span
                            title="Exp 0/1000"
                            style={{
                              fontSize: "11px",
                              textTransform: "uppercase",
                              letterSpacing: "0.16em",
                              fontWeight: 900,
                              color: "#ffcf9a",
                              textShadow: "0 1px 8px rgba(0,0,0,0.28), 0 0 12px rgba(255,171,97,0.18)",
                              transform: "translateY(1px)",
                            }}
                          >
                            Lv. {level}
                          </span>
                        </div>
                      </div>
                      {isOwnProfile ? (
                        <button
                          type="button"
                          aria-label={identityEditorOpen ? "Close profile identity editor" : "Edit profile identity"}
                          onClick={() => setIdentityEditorOpen((current) => !current)}
                          style={{
                            pointerEvents: "auto",
                            width: "16px",
                            height: "16px",
                            borderRadius: "0",
                            border: "none",
                            backgroundColor: "transparent",
                            backgroundImage:
                              "linear-gradient(135deg, transparent 38%, rgba(246,216,181,0.86) 38%, rgba(246,216,181,0.86) 57%, transparent 57%), linear-gradient(135deg, transparent 68%, rgba(246,216,181,0.56) 68%, rgba(246,216,181,0.56) 82%, transparent 82%)",
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "center",
                            backgroundSize: "11px 11px",
                            color: "transparent",
                            cursor: "pointer",
                            fontSize: 0,
                            fontWeight: 800,
                            display: "grid",
                            placeItems: "center",
                          }}
                        >
                          ✎
                        </button>
                      ) : null}
                    </div>
                    <div
                      style={{
                        minWidth: 0,
                        maxWidth: "52%",
                        fontSize: "10px",
                        lineHeight: 1.14,
                        color: "#ddc8b6",
                        fontStyle: "italic",
                        textShadow: "0 1px 8px rgba(0,0,0,0.34)",
                      }}
                    >
                      "{profile.motto}"
                    </div>
                    {isOwnProfile && identityEditorOpen ? (
                      <div
                        style={{
                          pointerEvents: "auto",
                          justifySelf: "start",
                          width: "214px",
                          borderRadius: "12px",
                          padding: "7px",
                          border: "1px solid rgba(255,255,255,0.08)",
                          background: "linear-gradient(180deg, rgba(14,15,20,0.94), rgba(10,11,16,0.92))",
                          boxShadow: "0 16px 28px rgba(0,0,0,0.24)",
                          display: "grid",
                          gap: "5px",
                        }}
                      >
                        <input
                          aria-label="Profile name"
                          value={name}
                          onChange={(event) => onNameChange?.(event.target.value)}
                          style={compactInputStyle}
                        />
                        <input
                          aria-label="Profile motto"
                          value={profile.motto}
                          onChange={(event) => onMottoChange?.(event.target.value)}
                          style={compactInputStyle}
                        />
                      </div>
                    ) : null}
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "minmax(210px, 0.88fr) minmax(260px, 1.12fr)",
                      gap: "8px",
                      alignItems: "start",
                      paddingTop: "48px",
                    }}
                  >
                    <div style={{ display: "grid", gap: "6px", paddingLeft: "2px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "5px" }}>
                        {(Object.keys(baseStats) as Array<keyof CharacterStats>).map((key) => (
                          <div
                            key={key}
                            style={{
                              borderRadius: "11px",
                              padding: "6px 7px",
                              background: statToneByKey[key].tint,
                              border: `1px solid ${statToneByKey[key].accent}30`,
                              display: "grid",
                              gap: "2px",
                            }}
                          >
                            <div
                              style={{
                                fontSize: "7px",
                                textTransform: "uppercase",
                                letterSpacing: "0.12em",
                                color: statToneByKey[key].accent,
                              }}
                            >
                              {statToneByKey[key].label}
                            </div>
                            <div style={{ fontSize: "14px", fontWeight: 800, color: "#fff0dd" }}>{baseStats[key]}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: "grid", gap: "4px" }}>
                        {derivedStats.map((stat) => (
                          <div
                            key={stat.label}
                            title={stat.helper}
                            style={{
                              borderRadius: "10px",
                              padding: "6px 7px",
                              border: "1px solid rgba(255,255,255,0.07)",
                              background: "rgba(255,255,255,0.025)",
                              display: "flex",
                              justifyContent: "space-between",
                              gap: "8px",
                              alignItems: "baseline",
                            }}
                          >
                            <div style={{ fontSize: "9px", color: "#d9c7b2", lineHeight: 1.1 }}>{stat.label}</div>
                            <div style={{ fontSize: "11px", fontWeight: 800, color: "#fff0dd", textAlign: "right" }}>{stat.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: "grid", justifyItems: "end", marginTop: "-30px", marginRight: "-10px" }}>
                      <CombatSilhouette
                        title={name}
                        currentHp={currentHp}
                        maxHp={maxHp}
                        activeEffects={activeEffects}
                        equipmentSlots={equipmentSlots}
                        figure={figure}
                        mirrored={mirrored}
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section style={{ ...cardStyle, padding: "10px" }}>
                <div style={{ display: "grid", gap: "8px" }}>
                  <BlockHeader title="Loadout" note="Current skills and combat approach" />
                  <div style={{ display: "grid", gap: "8px" }}>
                    <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.12em", color: "#d7b58d", opacity: 0.76 }}>
                      Skill loadout
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {skillLabels.length > 0 ? skillLabels.map((label) => (
                        <span
                          key={label}
                          style={{
                            borderRadius: "999px",
                            padding: "4px 8px",
                            background: "rgba(255,171,97,0.1)",
                            border: "1px solid rgba(255,171,97,0.2)",
                            color: "#ffe2c2",
                            fontSize: "10px",
                            lineHeight: 1.2,
                          }}
                        >
                          {label}
                        </span>
                      )) : (
                        <div style={{ fontSize: "11px", color: "rgba(255,244,231,0.56)" }}>No active skills selected.</div>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div style={{ display: "grid", gap: "10px" }}>
              <section style={{ ...cardStyle, padding: "10px" }}>
                <div style={{ display: "grid", gap: "8px" }}>
                  <BlockHeader title="About" note="Public record and identity" />
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "6px" }}>
                    <InfoStat label="Battles" value={String(profile.battles.total)} />
                    <InfoStat label="Win Rate" value={`${profile.battles.winRate}%`} tone="warm" />
                    <InfoStat label="Wins" value={String(profile.battles.wins)} tone="good" />
                    <InfoStat label="Losses" value={String(profile.battles.losses)} tone="danger" />
                  </div>
                  <div
                    style={{
                      borderRadius: "12px",
                      padding: "10px",
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "rgba(255,255,255,0.03)",
                      display: "grid",
                      gap: "8px",
                      position: "relative",
                    }}
                  >
                    <button
                      type="button"
                      aria-label={isOwnProfile ? "Open personal mail" : `Write a letter to ${name}`}
                      onClick={() => openMailbox(isOwnProfile ? "reply" : "new")}
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        width: "34px",
                        height: "34px",
                        borderRadius: "999px",
                        border: "1px solid rgba(255,255,255,0.14)",
                        background: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))",
                        color: "#fff1df",
                        cursor: "pointer",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      <MailIcon />
                      {isOwnProfile && unreadMailCount > 0 ? (
                        <span
                          style={{
                            position: "absolute",
                            top: "-2px",
                            right: "-2px",
                            minWidth: "18px",
                            height: "18px",
                            borderRadius: "999px",
                            padding: "0 5px",
                            background: "#cf6a32",
                            color: "#fff8ed",
                            fontSize: "10px",
                            fontWeight: 800,
                            display: "grid",
                            placeItems: "center",
                            boxShadow: "0 8px 16px rgba(207,106,50,0.28)",
                          }}
                        >
                          {unreadMailCount}
                        </span>
                      ) : null}
                    </button>
                    <InfoLine label="Motto" value={`"${profile.motto}"`} />
                    <InfoLine
                      label="Clan"
                      value={
                        <button
                          type="button"
                          onClick={() => setClanModalOpen(true)}
                          style={{
                            border: "none",
                            background: "transparent",
                            padding: 0,
                            color: "#9fd0ff",
                            textDecoration: "underline",
                            cursor: "pointer",
                            textAlign: "left",
                            font: "inherit",
                          }}
                        >
                          {profile.clanName && profile.clanTag ? `${profile.clanName} [${profile.clanTag}]` : "Unaffiliated"}
                        </button>
                      }
                    />
                    <InfoLine label="Status" value={profile.wall.statusLine} />
                  </div>
                  <div style={{ display: "grid", gap: "8px" }}>
                    <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.12em", color: "#d7b58d", opacity: 0.76 }}>
                      Badge
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {profile.medals.map((medal) => (
                        <div
                          key={medal.id}
                          title={medal.label}
                          style={{
                            width: "44px",
                            height: "44px",
                            borderRadius: "14px",
                            display: "grid",
                            placeItems: "center",
                            border: `1px solid ${resolveMedalTone(medal.tone).border}`,
                            background: resolveMedalTone(medal.tone).background,
                            color: resolveMedalTone(medal.tone).color,
                            fontSize: "12px",
                            fontWeight: 800,
                            boxShadow: `0 10px 24px ${resolveMedalTone(medal.tone).glow}`,
                          }}
                        >
                          {medal.shortLabel}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section style={{ ...cardStyle, padding: "10px" }}>
                <div style={{ display: "grid", gap: "8px" }}>
                  <BlockHeader title="Wall" note="Gifts, status line, future public notes" />
                  <div style={{ display: "grid", gap: "8px" }}>
                    <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.12em", color: "#d7b58d", opacity: 0.76 }}>
                      Gift showcase
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {profile.gifts.map((gift) => (
                        <div
                          key={gift.id}
                          title={`${gift.label} from ${gift.from}`}
                          style={{
                            minWidth: "82px",
                            borderRadius: "12px",
                            padding: "8px 10px",
                            border: `1px solid ${resolveGiftTone(gift.tone).border}`,
                            background: resolveGiftTone(gift.tone).background,
                            display: "grid",
                            gap: "4px",
                          }}
                        >
                          <div style={{ fontSize: "12px", fontWeight: 700, color: "#fff1df" }}>{gift.label}</div>
                          <div style={{ fontSize: "10px", color: "rgba(255,244,231,0.58)" }}>{gift.from}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div
                    style={{
                      borderRadius: "16px",
                      padding: "14px",
                      border: "1px solid rgba(255,255,255,0.08)",
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02)), radial-gradient(circle at top right, rgba(122,187,255,0.08), transparent 30%)",
                      display: "grid",
                      gap: "6px",
                    }}
                  >
                    <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.12em", color: "#b9d6ff", opacity: 0.8 }}>
                      Pinned note
                    </div>
                    <div style={{ fontSize: "11px", lineHeight: 1.4, color: "#e7dbc9" }}>{profile.wall.pinnedNote}</div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </ModalSurface>
      {mailModalOpen ? (
        <ModalOverlay onClose={() => setMailModalOpen(false)} closeLabel="Close mailbox" zIndex={61} padding="28px">
          <ModalSurface
            style={{
              width: "min(860px, calc(100vw - 32px))",
              maxHeight: "min(640px, calc(100vh - 36px))",
              display: "grid",
              gridTemplateRows: "auto 1fr auto",
            }}
          >
            <div
              style={{
                padding: "16px 18px 12px",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                justifyContent: "space-between",
                gap: "12px",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "grid", gap: "4px" }}>
                <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.14em", color: "#d7b58d", opacity: 0.8 }}>
                  Personal Mail
                </div>
                <div style={{ fontSize: "22px", fontWeight: 900, color: "#f5e7d4" }}>
                  {isOwnProfile ? "Inbox and replies" : `Write to ${name}`}
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                {isOwnProfile ? (
                  <ActionButton
                    onClick={() => setComposerMode("reply")}
                    disabled={!selectedMail}
                    tone={composerMode === "reply" ? "primary" : "secondary"}
                  >
                    Reply
                  </ActionButton>
                ) : null}
                <ActionButton
                  onClick={() => setComposerMode("new")}
                  tone={composerMode === "new" ? "primary" : "secondary"}
                >
                  New Letter
                </ActionButton>
                <ActionButton onClick={() => setMailModalOpen(false)}>Close</ActionButton>
              </div>
            </div>

            <div
              style={{
                padding: "14px 16px",
                overflow: "auto",
                display: "grid",
                gridTemplateColumns: isOwnProfile ? "minmax(240px, 0.95fr) minmax(0, 1.05fr)" : "minmax(0, 1fr)",
                gap: "12px",
              }}
            >
              {isOwnProfile ? (
                <div
                  style={{
                    borderRadius: "16px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.03)",
                    overflow: "hidden",
                    display: "grid",
                    alignContent: "start",
                  }}
                >
                  {sortedMailboxEntries.length > 0 ? (
                    sortedMailboxEntries.map((entry) => {
                      const incoming = entry.toActorId === mailboxActorId;
                      const selected = entry.id === selectedMail?.id;

                      return (
                        <button
                          key={entry.id}
                          type="button"
                          onClick={() => {
                            setSelectedMailId(entry.id);
                            setComposerMode("reply");
                          }}
                          style={{
                            border: "none",
                            borderBottom: "1px solid rgba(255,255,255,0.06)",
                            padding: "12px 14px",
                            background: selected ? "rgba(255,171,97,0.1)" : "transparent",
                            color: "#f6ead8",
                            textAlign: "left",
                            cursor: "pointer",
                            display: "grid",
                            gap: "4px",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center" }}>
                            <span style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.12em", color: incoming ? "#9fd0ff" : "#ffcf9a" }}>
                              {incoming ? `From ${entry.fromName}` : `To ${entry.toName}`}
                            </span>
                            {incoming && entry.readAt === null ? (
                              <span style={{ fontSize: "10px", color: "#ff9a7a", fontWeight: 800 }}>Unread</span>
                            ) : null}
                          </div>
                          <div style={{ fontSize: "13px", fontWeight: 800 }}>{entry.subject}</div>
                          <div style={{ fontSize: "11px", color: "rgba(255,244,231,0.62)", lineHeight: 1.35 }}>
                            {truncateMailText(entry.body, 96)}
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div style={{ padding: "18px", fontSize: "12px", color: "rgba(255,244,231,0.62)" }}>
                      No letters yet.
                    </div>
                  )}
                </div>
              ) : null}

              <div style={{ display: "grid", gap: "12px" }}>
                {isOwnProfile && selectedMail ? (
                  <div
                    style={{
                      borderRadius: "16px",
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "rgba(255,255,255,0.03)",
                      padding: "14px",
                      display: "grid",
                      gap: "8px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                      <div>
                        <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.12em", color: "#9fd0ff", opacity: 0.84 }}>
                          {selectedMail.toActorId === mailboxActorId ? `From ${selectedMail.fromName}` : `Sent to ${selectedMail.toName}`}
                        </div>
                        <div style={{ fontSize: "18px", fontWeight: 900, color: "#f5e7d4" }}>{selectedMail.subject}</div>
                      </div>
                      <div style={{ fontSize: "11px", color: "rgba(255,244,231,0.6)" }}>{formatMailTimestamp(selectedMail.sentAt)}</div>
                    </div>
                    <div style={{ fontSize: "12px", lineHeight: 1.55, color: "#e7dbc9", whiteSpace: "pre-wrap" }}>{selectedMail.body}</div>
                  </div>
                ) : null}

                <div
                  style={{
                    borderRadius: "16px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.025)), radial-gradient(circle at top right, rgba(159,208,255,0.08), transparent 32%)",
                    padding: "14px",
                    display: "grid",
                    gap: "10px",
                  }}
                >
                  <div style={{ display: "grid", gap: "4px" }}>
                    <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.12em", color: "#d7b58d", opacity: 0.82 }}>
                      Composer
                    </div>
                    <div style={{ fontSize: "12px", color: "rgba(255,244,231,0.72)" }}>
                      {activeMailTarget ? `Recipient: ${activeMailTarget.name}` : "Select a letter to reply or choose a direct message target."}
                    </div>
                  </div>
                  <input
                    aria-label="Mail subject"
                    value={composerSubject}
                    onChange={(event) => setComposerSubject(event.target.value)}
                    style={compactInputStyle}
                  />
                  <textarea
                    aria-label="Mail body"
                    value={composerBody}
                    onChange={(event) => setComposerBody(event.target.value)}
                    rows={7}
                    style={{
                      ...compactInputStyle,
                      resize: "vertical",
                      minHeight: "136px",
                      fontFamily: "inherit",
                    }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ fontSize: "11px", color: "rgba(255,244,231,0.56)" }}>
                      Short, local, and profile-driven. No backend needed for this MVP.
                    </div>
                    <ActionButton onClick={handleSendMail} tone="primary" disabled={!activeMailTarget || !composerSubject.trim() || !composerBody.trim()}>
                      Send Letter
                    </ActionButton>
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                padding: "12px 16px 16px",
                borderTop: "1px solid rgba(255,255,255,0.08)",
                fontSize: "11px",
                color: "rgba(255,244,231,0.58)",
              }}
            >
              {isOwnProfile
                ? "Open a letter to reply fast, or switch to a fresh message from another profile."
                : `This service opens a direct letter to ${name} from the current local profile.`}
            </div>
          </ModalSurface>
        </ModalOverlay>
      ) : null}
      {clanModalOpen ? (
        <ModalOverlay onClose={() => setClanModalOpen(false)} closeLabel="Close clan modal" zIndex={61} padding="28px">
          <ModalSurface
            style={{
              width: "min(380px, calc(100vw - 32px))",
              padding: "18px",
              display: "grid",
              gap: "12px",
            }}
          >
            <div style={{ display: "grid", gap: "4px" }}>
              <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.14em", color: "#9fd0ff", opacity: 0.82 }}>
                Clan
              </div>
              <div style={{ fontSize: "22px", fontWeight: 900, color: "#f4e7d4" }}>
                {profile.clanName && profile.clanTag ? `${profile.clanName} [${profile.clanTag}]` : "No Clan Yet"}
              </div>
            </div>
            <div style={{ fontSize: "13px", lineHeight: 1.5, color: "rgba(255,244,231,0.7)" }}>
              Clan profile modal is reserved here. We can wire roster, description and join flow next.
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <ActionButton onClick={() => setClanModalOpen(false)}>Close</ActionButton>
            </div>
          </ModalSurface>
        </ModalOverlay>
      ) : null}
    </ModalOverlay>
  );
}

const compactInputStyle: CSSProperties = {
  width: "100%",
  borderRadius: "8px",
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.04)",
  color: "#fff2de",
  padding: "6px 8px",
  fontSize: "10px",
  lineHeight: 1.2,
  outline: "none",
};

function BlockHeader({ title, note }: { title: string; note: string }) {
  return (
    <div style={{ display: "grid", gap: "3px" }}>
      <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.14em", color: "#d7b58d", opacity: 0.78 }}>
        {title}
      </div>
      <div style={{ fontSize: "10px", color: "rgba(255,244,231,0.52)" }}>{note}</div>
    </div>
  );
}

function InfoStat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "warm" | "good" | "danger";
}) {
  const toneStyle =
    tone === "warm"
      ? { color: "#ffcf9a", background: "rgba(255,171,97,0.08)", border: "rgba(255,171,97,0.18)" }
      : tone === "good"
        ? { color: "#9de9c9", background: "rgba(91,184,146,0.08)", border: "rgba(91,184,146,0.18)" }
        : tone === "danger"
          ? { color: "#f3a0a0", background: "rgba(209,90,90,0.08)", border: "rgba(209,90,90,0.18)" }
          : { color: "#fff0dd", background: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.08)" };

  return (
    <div
      style={{
        borderRadius: "12px",
        padding: "8px 9px",
        border: `1px solid ${toneStyle.border}`,
        background: toneStyle.background,
        display: "grid",
        gap: "3px",
      }}
    >
      <div style={{ fontSize: "8px", textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,244,231,0.54)" }}>
        {label}
      </div>
      <div style={{ fontSize: "15px", fontWeight: 800, color: toneStyle.color }}>{value}</div>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div style={{ display: "grid", gap: "3px" }}>
      <div style={{ fontSize: "8px", textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,244,231,0.54)" }}>
        {label}
      </div>
      <div style={{ fontSize: "11px", lineHeight: 1.35, color: "#f4e7d4" }}>{value}</div>
    </div>
  );
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <rect x="2.2" y="4" width="13.6" height="10" rx="2.2" fill="rgba(255,255,255,0.04)" stroke="currentColor" strokeWidth="1.3" />
      <path d="M3.6 5.4L9 9.4L14.4 5.4" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function resolveReplyTarget(
  entry: ProfileMailEntry,
  mailboxActorId: ProfileActorId
): { actorId: ProfileActorId | "system"; name: string } {
  if (entry.fromActorId === mailboxActorId) {
    return {
      actorId: entry.toActorId,
      name: entry.toName,
    };
  }

  return {
    actorId: entry.fromActorId,
    name: entry.fromName,
  };
}

function buildReplySubject(subject: string) {
  return subject.startsWith("Re: ") ? subject : `Re: ${subject}`;
}

function formatMailTimestamp(timestamp: number) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp);
}

function truncateMailText(value: string, maxLength: number) {
  return value.length <= maxLength ? value : `${value.slice(0, maxLength - 1)}...`;
}

function resolveMedalTone(tone: ProfileMeta["medals"][number]["tone"]) {
  switch (tone) {
    case "silver":
      return {
        border: "rgba(177,198,223,0.42)",
        background: "rgba(177,198,223,0.12)",
        color: "#e8f1ff",
        glow: "rgba(177,198,223,0.14)",
      };
    case "gold":
      return {
        border: "rgba(234,192,95,0.42)",
        background: "rgba(234,192,95,0.12)",
        color: "#ffe8a2",
        glow: "rgba(234,192,95,0.18)",
      };
    case "legendary":
      return {
        border: "rgba(243,129,98,0.48)",
        background: "rgba(243,129,98,0.13)",
        color: "#ffd0b5",
        glow: "rgba(243,129,98,0.2)",
      };
    case "bronze":
    default:
      return {
        border: "rgba(193,126,94,0.4)",
        background: "rgba(193,126,94,0.11)",
        color: "#f8ceb6",
        glow: "rgba(193,126,94,0.14)",
      };
  }
}

function resolveGiftTone(tone: ProfileMeta["gifts"][number]["tone"]) {
  switch (tone) {
    case "rare":
      return {
        border: "rgba(122,187,255,0.22)",
        background: "rgba(122,187,255,0.09)",
      };
    case "epic":
      return {
        border: "rgba(208,130,255,0.26)",
        background: "rgba(208,130,255,0.1)",
      };
    case "common":
    default:
      return {
        border: "rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.03)",
      };
  }
}
