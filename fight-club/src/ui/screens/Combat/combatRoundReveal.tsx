type CombatRoundRevealEntry = {
  attackerName: string;
  defenderName?: string | null;
  skillName?: string | null;
  consumableName?: string | null;
  finalDamage?: number | null;
  healedHp?: number | null;
  blocked?: boolean;
  blockedPercent?: number | null;
  dodged?: boolean;
  crit?: boolean;
  knockoutCommentary?: string | null;
  commentary?: string | null;
};

type GroupedCombatRoundRevealEntry = CombatRoundRevealEntry & {
  skillNames: string[];
  consumableNames: string[];
};

export function CombatRoundReveal({
  title,
  tone = "round",
  entries = [],
}: {
  title: string | null;
  tone?: "round" | "finish";
  entries?: CombatRoundRevealEntry[];
}) {
  if (!title) {
    return null;
  }

  const groupedEntries = groupRoundRevealEntries(entries);
  const actorTones = createActorToneMap(groupedEntries);
  const visibleEntries = groupedEntries.slice(0, 2);
  const showTitle = Boolean(title) && !(visibleEntries.length > 0 && title.includes("|"));

  return (
    <div
      key={`${tone}:${title}`}
      className="combat-round-reveal"
      style={{
        width: "100%",
        boxSizing: "border-box",
        borderRadius: 16,
        border: "1px solid rgba(255,180,108,0.32)",
        background:
          tone === "finish"
            ? "linear-gradient(180deg, rgba(104,62,28,0.94), rgba(28,18,11,0.98))"
            : "linear-gradient(180deg, rgba(78,44,24,0.92), rgba(18,14,10,0.97))",
        padding: "7px 10px",
        boxShadow: "0 20px 44px rgba(0,0,0,0.34), 0 0 24px rgba(255,171,97,0.1), inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      <div style={{ display: "grid", gap: 5 }}>
        {showTitle ? (
          <span
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: "#fff1e3",
              lineHeight: 1.1,
            }}
          >
            {title}
          </span>
        ) : null}
        {visibleEntries.length > 0 ? (
          <div style={{ display: "grid", gap: 4 }}>
            {visibleEntries.map((entry, index) => {
              const actorTone = actorTones.get(entry.attackerName) ?? fallbackActorTone;
              const outcomeBadges = buildOutcomeBadges(entry);
              const actorLabel = actorTone.label;

              return (
                <div
                  key={`${entry.attackerName}-${entry.defenderName ?? "target"}-${index}`}
                  style={{
                    display: "grid",
                    gap: 3,
                    padding: "6px 7px",
                    borderRadius: 11,
                    border: `1px solid ${actorTone.border}`,
                    background: actorTone.surface,
                    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05), 0 0 0 1px ${actorTone.ring}, 0 8px 20px rgba(0,0,0,0.18)`,
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      minWidth: 0,
                      flexWrap: "nowrap",
                      overflowX: "auto",
                      scrollbarWidth: "none",
                    }}
                  >
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, minWidth: 0, flex: "0 0 auto" }}>
                      <span
                        style={{
                          width: 9,
                          height: 9,
                          borderRadius: "999px",
                          flex: "0 0 auto",
                          background: actorTone.dot,
                          boxShadow: `0 0 16px ${actorTone.glow}`,
                        }}
                      />
                      <span
                        style={{
                          fontSize: 10,
                          lineHeight: 1,
                          fontWeight: 800,
                          color: actorTone.text,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {entry.attackerName}
                      </span>
                      {actorLabel ? (
                        <span
                          style={{
                            borderRadius: "999px",
                            padding: "2px 5px",
                            fontSize: 6.5,
                            lineHeight: 1,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            fontWeight: 800,
                            color: actorTone.text,
                            border: `1px solid ${actorTone.border}`,
                            background: actorTone.badge,
                          }}
                        >
                          {actorLabel}
                        </span>
                      ) : null}
                      {entry.defenderName ? (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: 8,
                            color: "#e5d6c6",
                            opacity: 0.74,
                            whiteSpace: "nowrap",
                          }}
                        >
                          <span style={{ opacity: 0.5 }}>vs</span>
                          {entry.defenderName}
                        </span>
                      ) : null}
                    </div>
                    <div
                      style={{
                        position: "absolute",
                        top: 6,
                        right: 7,
                        borderRadius: "999px",
                        padding: "3px 9px",
                        fontSize: "11px",
                        lineHeight: 1,
                        fontWeight: 900,
                        color: resolveDamageColor(entry),
                        background: resolveDamageBackground(entry),
                        border: `1px solid ${resolveDamageBorder(entry)}`,
                        boxShadow: `0 0 26px ${resolveDamageGlow(entry)}, inset 0 1px 0 rgba(255,255,255,0.08)`,
                        display: "inline-grid",
                        placeItems: "center",
                        minWidth: 34,
                        textAlign: "center",
                      }}
                    >
                      {formatDamageValue(entry.finalDamage ?? 0)}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                      minWidth: 0,
                      flexWrap: "nowrap",
                      overflowX: "auto",
                      scrollbarWidth: "none",
                    }}
                  >
                    {outcomeBadges.map((badge) => (
                      <span
                        key={`${entry.attackerName}-${badge.label}`}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          flex: "0 0 auto",
                          whiteSpace: "nowrap",
                          borderRadius: "999px",
                          padding: "2px 5px",
                          fontSize: "7px",
                          lineHeight: 1.1,
                          fontWeight: 800,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          color: badge.color,
                          border: `1px solid ${badge.border}`,
                          background: badge.background,
                        }}
                      >
                        <span
                          style={{
                            width: 13,
                            height: 13,
                            borderRadius: "999px",
                            display: "inline-grid",
                            placeItems: "center",
                            fontSize: "7px",
                            lineHeight: 1,
                            color: badge.iconColor,
                            background: badge.iconBackground,
                            border: `1px solid ${badge.iconBorder}`,
                          }}
                        >
                          <OutcomeIcon kind={badge.icon} color={badge.iconColor} />
                        </span>
                        {badge.label}
                      </span>
                    ))}
                    {entry.skillNames.map((skillName) => (
                      <ActionNameChip key={`${entry.attackerName}-skill-${skillName}`} kind="skill" label={skillName} />
                    ))}
                    {entry.consumableNames.map((consumableName) => (
                      <ActionNameChip
                        key={`${entry.attackerName}-consumable-${consumableName}`}
                        kind="consumable"
                        label={consumableName}
                      />
                    ))}
                    {(entry.healedHp ?? 0) > 0 ? <ActionNameChip kind="heal" label={`+${entry.healedHp} HP`} /> : null}
                  </div>
                  <div
                    style={{
                      fontSize: "8px",
                      lineHeight: 1.15,
                      color: "#f4e7da",
                      opacity: 0.82,
                    }}
                  >
                    {renderCommentary(entry)}
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}

const fallbackActorTone = {
  dot: "#f3c58c",
  glow: "rgba(243,197,140,0.34)",
  text: "#fff1e3",
  border: "rgba(243,197,140,0.18)",
  ring: "rgba(243,197,140,0.08)",
  surface: "linear-gradient(180deg, rgba(72,45,23,0.34), rgba(255,255,255,0.03))",
  badge: "rgba(243,197,140,0.08)",
  label: null as string | null,
};

function createActorToneMap(entries: GroupedCombatRoundRevealEntry[]) {
  const tones = new Map<string, typeof fallbackActorTone>();
  const palette = [
    {
      dot: "#ff9f6e",
      glow: "rgba(255,159,110,0.34)",
      text: "#ffd7bf",
      border: "rgba(255,159,110,0.2)",
      ring: "rgba(255,159,110,0.08)",
      surface: "linear-gradient(180deg, rgba(88,48,27,0.44), rgba(255,255,255,0.03))",
      badge: "rgba(255,159,110,0.1)",
      label: "P1",
    },
    {
      dot: "#8fd0ff",
      glow: "rgba(143,208,255,0.34)",
      text: "#dff1ff",
      border: "rgba(143,208,255,0.2)",
      ring: "rgba(143,208,255,0.08)",
      surface: "linear-gradient(180deg, rgba(27,50,68,0.44), rgba(255,255,255,0.03))",
      badge: "rgba(143,208,255,0.1)",
      label: "P2",
    },
  ];
  let paletteIndex = 0;

  for (const entry of entries) {
    if (tones.has(entry.attackerName)) {
      continue;
    }

    if (/bot/i.test(entry.attackerName)) {
      tones.set(entry.attackerName, {
        dot: "#f3c58c",
        glow: "rgba(243,197,140,0.34)",
        text: "#fff1df",
        border: "rgba(243,197,140,0.18)",
        ring: "rgba(243,197,140,0.08)",
        surface: "linear-gradient(180deg, rgba(76,50,26,0.44), rgba(255,255,255,0.03))",
        badge: "rgba(243,197,140,0.1)",
        label: "BOT",
      });
      continue;
    }

    tones.set(entry.attackerName, palette[paletteIndex] ?? fallbackActorTone);
    paletteIndex += 1;
  }

  return tones;
}

function groupRoundRevealEntries(entries: CombatRoundRevealEntry[]): GroupedCombatRoundRevealEntry[] {
  const grouped = new Map<string, GroupedCombatRoundRevealEntry>();

  for (const entry of entries) {
    const existing = grouped.get(entry.attackerName);
    if (!existing) {
      grouped.set(entry.attackerName, {
        ...entry,
        skillNames: entry.skillName ? [entry.skillName] : [],
        consumableNames: entry.consumableName ? [entry.consumableName] : [],
      });
      continue;
    }

    existing.defenderName = existing.defenderName ?? entry.defenderName ?? null;
    existing.finalDamage = (existing.finalDamage ?? 0) + (entry.finalDamage ?? 0);
    existing.healedHp = (existing.healedHp ?? 0) + (entry.healedHp ?? 0);
    existing.blocked = Boolean(existing.blocked || entry.blocked);
    existing.blockedPercent = Math.max(existing.blockedPercent ?? 0, entry.blockedPercent ?? 0) || null;
    existing.dodged = Boolean(existing.dodged || entry.dodged);
    existing.crit = Boolean(existing.crit || entry.crit);
    existing.knockoutCommentary = entry.knockoutCommentary ?? existing.knockoutCommentary ?? null;
    existing.commentary = entry.commentary ?? existing.commentary ?? null;

    if (entry.skillName && !existing.skillNames.includes(entry.skillName)) {
      existing.skillNames.push(entry.skillName);
    }

    if (entry.consumableName && !existing.consumableNames.includes(entry.consumableName)) {
      existing.consumableNames.push(entry.consumableName);
    }
  }

  const orderedNames = Array.from(
    new Set(
      entries.flatMap((entry) =>
        [entry.attackerName, entry.defenderName ?? null].filter((value): value is string => Boolean(value))
      )
    )
  );

  const fallbackTargetName =
    entries.find((entry) => entry.defenderName && entry.defenderName !== entry.attackerName)?.defenderName ?? null;

  return orderedNames.map((name) => {
    const existing = grouped.get(name);
    if (existing) {
      return existing;
    }

    const counterpartName =
      orderedNames.find((candidate) => candidate !== name) ??
      entries.find((entry) => entry.attackerName === name)?.defenderName ??
      fallbackTargetName;

    return {
      attackerName: name,
      defenderName: counterpartName ?? null,
      skillName: null,
      consumableName: null,
      finalDamage: 0,
      healedHp: 0,
      blocked: false,
      blockedPercent: null,
      dodged: false,
      crit: false,
      knockoutCommentary: null,
      commentary: "Holding position.",
      skillNames: [],
      consumableNames: [],
    };
  });
}

function isBigCrit(entry: CombatRoundRevealEntry) {
  return Boolean(entry.crit && (entry.finalDamage ?? 0) >= 25);
}

function formatDamageValue(value: number) {
  return value > 0 ? `-${value}` : "0";
}

function resolveDamageColor(entry: CombatRoundRevealEntry) {
  if (entry.dodged) return "#d9f2ff";
  if (entry.blocked) return "#dfe9ff";
  if (isBigCrit(entry)) return "#ffe1df";
  if (entry.crit) return "#ffc9c4";
  return "#ffe3ca";
}

function resolveDamageBackground(entry: CombatRoundRevealEntry) {
  if (entry.dodged) return "rgba(28,61,84,0.3)";
  if (entry.blocked) return "linear-gradient(180deg, rgba(41,60,106,0.38), rgba(18,31,67,0.3))";
  if (isBigCrit(entry)) return "linear-gradient(180deg, rgba(138,28,22,0.46), rgba(92,16,16,0.36))";
  if (entry.crit) return "linear-gradient(180deg, rgba(122,26,34,0.36), rgba(79,16,25,0.3))";
  return "rgba(98,58,26,0.32)";
}

function resolveDamageBorder(entry: CombatRoundRevealEntry) {
  if (entry.dodged) return "rgba(135,217,255,0.28)";
  if (entry.blocked) return "rgba(163,199,255,0.38)";
  if (isBigCrit(entry)) return "rgba(255,151,138,0.48)";
  if (entry.crit) return "rgba(255,120,120,0.36)";
  return "rgba(255,171,97,0.34)";
}

function resolveDamageGlow(entry: CombatRoundRevealEntry) {
  if (entry.dodged) return "rgba(135,217,255,0.14)";
  if (entry.blocked) return "rgba(120,170,255,0.24)";
  if (isBigCrit(entry)) return "rgba(255,98,88,0.28)";
  if (entry.crit) return "rgba(255,102,102,0.2)";
  return "rgba(255,171,97,0.18)";
}

function buildOutcomeBadges(entry: CombatRoundRevealEntry) {
  const badges: Array<{
    label: string;
    icon: OutcomeIconKind;
    color: string;
    border: string;
    background: string;
    iconColor: string;
    iconBackground: string;
    iconBorder: string;
  }> = [];

  if (entry.dodged) {
    badges.push(createBadge("Dodge", "dodge", "#d9f2ff", "rgba(135,217,255,0.24)", "rgba(28,61,84,0.24)"));
  } else if (entry.blocked) {
    badges.push(
      createBadge(
        entry.blockedPercent !== null && entry.blockedPercent !== undefined ? `Block ${entry.blockedPercent}%` : "Block",
        "block",
        "#dfe9ff",
        "rgba(183,213,255,0.24)",
        "rgba(44,57,89,0.24)"
      )
    );
  } else {
    badges.push(createBadge("Hit", "hit", "#ffe4c8", "rgba(255,171,97,0.22)", "rgba(88,52,24,0.22)"));
  }

  if (entry.crit) {
    badges.push(createBadge("Crit", "crit", "#ffd4e5", "rgba(255,128,171,0.26)", "rgba(120,37,66,0.26)"));
  }

  if (entry.knockoutCommentary) {
    badges.push(createBadge("Finisher", "finisher", "#dcffe4", "rgba(102,224,138,0.24)", "rgba(33,84,47,0.24)"));
  }

  return badges;
}

type OutcomeIconKind = "hit" | "block" | "dodge" | "crit" | "finisher" | "skill" | "consumable" | "heal";

function createBadge(label: string, icon: OutcomeIconKind, color: string, border: string, background: string) {
  return {
    label,
    icon,
    color,
    border,
    background,
    iconColor: color,
    iconBackground: "rgba(255,255,255,0.06)",
    iconBorder: border,
  };
}

function OutcomeIcon({ kind, color }: { kind: OutcomeIconKind; color: string }) {
  const shared = {
    width: 9,
    height: 9,
    viewBox: "0 0 12 12",
    fill: "none",
    stroke: color,
    strokeWidth: 1.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (kind === "block") {
    return (
      <svg {...shared}>
        <path d="M6 1.5 9.5 3v2.6c0 2.2-1.4 3.9-3.5 4.9-2.1-1-3.5-2.7-3.5-4.9V3L6 1.5Z" />
      </svg>
    );
  }

  if (kind === "dodge") {
    return (
      <svg {...shared}>
        <path d="M2 8.5c2.2-4.4 5.8-5.2 8-5" />
        <path d="M7.8 2.6 10 3.5 8.9 5.8" />
      </svg>
    );
  }

  if (kind === "crit") {
    return (
      <svg {...shared}>
        <path d="M6 1.6c1.8 2.6 3.7 4.6 3.7 6.9a3.7 3.7 0 1 1-7.4 0C2.3 6.2 4.2 4.2 6 1.6Z" />
      </svg>
    );
  }

  if (kind === "finisher") {
    return (
      <svg {...shared}>
        <path d="M3 6.2 5.1 8.3 9 3.8" />
      </svg>
    );
  }

  if (kind === "skill") {
    return (
      <svg {...shared}>
        <path d="M6 2.1 7.2 4.7 10 5.1 7.9 7 8.4 9.8 6 8.4 3.6 9.8 4.1 7 2 5.1l2.8-.4L6 2.1Z" />
      </svg>
    );
  }

  if (kind === "consumable") {
    return (
      <svg {...shared}>
        <path d="M4 2.2h4" />
        <path d="M4.6 2.2 4 4.1l1.9 5.7c.1.3.4.5.7.5h.8c.3 0 .6-.2.7-.5L10 4.1l-.6-1.9" />
      </svg>
    );
  }

  if (kind === "heal") {
    return (
      <svg {...shared}>
        <path d="M6 2.5v7" />
        <path d="M2.5 6h7" />
      </svg>
    );
  }

  return (
    <svg {...shared}>
      <path d="M2.4 9.2 9.4 2.2" />
      <path d="M7 2.2h2.4v2.4" />
      <path d="m2.8 6.6 2.6 2.6" />
    </svg>
  );
}

function renderCommentary(entry: CombatRoundRevealEntry) {
  const text = entry.knockoutCommentary ?? entry.commentary ?? "Impact lands.";
  const normalized = text.toLowerCase();
  const highlights = [
    { phrase: "clean strike", style: commentaryHighlightStyle("#ffd6a8", "rgba(255,171,97,0.14)") },
    { phrase: "critical hit", style: commentaryHighlightStyle("#ffd4e5", "rgba(255,128,171,0.14)") },
    { phrase: "clean hit", style: commentaryHighlightStyle("#ffd6a8", "rgba(255,171,97,0.14)") },
    { phrase: "direct hit", style: commentaryHighlightStyle("#ffd6a8", "rgba(255,171,97,0.14)") },
    { phrase: "finishing blow", style: commentaryHighlightStyle("#dcffe4", "rgba(102,224,138,0.14)") },
  ];
  const dynamicHighlights = [
    entry.skillName
      ? { phrase: entry.skillName.toLowerCase(), style: commentaryHighlightStyle("#ffd8ef", "rgba(255,128,171,0.14)") }
      : null,
    entry.consumableName
      ? { phrase: entry.consumableName.toLowerCase(), style: commentaryHighlightStyle("#bdf6d0", "rgba(88,180,120,0.14)") }
      : null,
    (entry.healedHp ?? 0) > 0
      ? { phrase: `+${entry.healedHp} hp`, style: commentaryHighlightStyle("#bdf6d0", "rgba(88,180,120,0.14)") }
      : null,
    (entry.healedHp ?? 0) > 0
      ? { phrase: "heals", style: commentaryHighlightStyle("#bdf6d0", "rgba(88,180,120,0.14)") }
      : null,
    (entry.healedHp ?? 0) > 0
      ? { phrase: "restores", style: commentaryHighlightStyle("#bdf6d0", "rgba(88,180,120,0.14)") }
      : null,
  ].filter(Boolean) as Array<{ phrase: string; style: ReturnType<typeof commentaryHighlightStyle> }>;

  const allHighlights = [...dynamicHighlights, ...highlights];
  const match = allHighlights
    .map((item) => ({ item, index: normalized.indexOf(item.phrase) }))
    .filter((item) => item.index >= 0)
    .sort((left, right) => left.index - right.index)[0];

  if (!match) return text;

  const startIndex = match.index;
  const endIndex = startIndex + match.item.phrase.length;

  return (
    <>
      {text.slice(0, startIndex)}
      <span style={match.item.style}>{text.slice(startIndex, endIndex)}</span>
      {text.slice(endIndex)}
    </>
  );
}

function commentaryHighlightStyle(color: string, background: string) {
  return {
    color,
    fontWeight: 800,
    padding: "0 3px",
    borderRadius: 6,
    background,
  } as const;
}

function ActionNameChip({
  kind,
  label,
}: {
  kind: "skill" | "consumable" | "heal";
  label: string;
}) {
  const tone =
    kind === "skill"
      ? {
          color: "#ffd8ef",
          border: "rgba(255,128,171,0.28)",
          background: "linear-gradient(180deg, rgba(120,37,66,0.34), rgba(62,20,39,0.3))",
          glow: "rgba(255,128,171,0.12)",
          iconKind: "skill" as const,
        }
      : kind === "consumable"
        ? {
            color: "#bfe7ff",
            border: "rgba(135,217,255,0.28)",
            background: "linear-gradient(180deg, rgba(28,61,84,0.34), rgba(18,32,44,0.3))",
            glow: "rgba(135,217,255,0.12)",
            iconKind: "consumable" as const,
          }
        : {
            color: "#bdf6d0",
            border: "rgba(102,224,138,0.28)",
            background: "linear-gradient(180deg, rgba(33,84,47,0.34), rgba(18,44,27,0.3))",
            glow: "rgba(102,224,138,0.12)",
            iconKind: "heal" as const,
          };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        flex: "0 0 auto",
        whiteSpace: "nowrap",
        borderRadius: "999px",
        padding: "2px 6px",
        fontSize: "7px",
        lineHeight: 1.1,
        fontWeight: 800,
        letterSpacing: "0.06em",
        color: tone.color,
        border: `1px solid ${tone.border}`,
        background: tone.background,
        boxShadow: `0 0 14px ${tone.glow}`,
      }}
    >
      <span
        style={{
          width: 13,
          height: 13,
          borderRadius: "999px",
          display: "inline-grid",
          placeItems: "center",
          background: "rgba(255,255,255,0.06)",
          border: `1px solid ${tone.border}`,
        }}
      >
        <OutcomeIcon kind={tone.iconKind} color={tone.color} />
      </span>
      {label}
    </span>
  );
}
