import type { ArmorProfile, DamageProfile } from "@/modules/inventory";
import type { CombatSkill } from "@/modules/combat";

export function SkillFactsCard({ skill }: { skill: CombatSkill }) {
  const rows = buildSkillFactRows(skill);

  return (
    <div
      style={{
        borderRadius: "12px",
        padding: "7px 8px",
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.08)",
        display: "grid",
        gap: "4px",
      }}
    >
      {rows.map((row) => (
        <div
          key={`${skill.id}-${row.label}-${row.value}`}
          style={{
            display: "grid",
            gridTemplateColumns: "56px minmax(0, 1fr)",
            gap: "7px",
            alignItems: "start",
          }}
        >
          <div
            style={{
              fontSize: "7px",
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              color: "#d3bfab",
              opacity: 0.82,
              fontWeight: 800,
              paddingTop: "2px",
            }}
          >
            {row.label}
          </div>
          <div style={{ fontSize: "8px", lineHeight: 1.28, color: row.color ?? "#f6ead9", fontWeight: row.strong ? 800 : 600 }}>
            {row.value}
          </div>
        </div>
      ))}
    </div>
  );
}

export function formatResourceName(resource: string) {
  switch (resource) {
    case "momentum":
      return "Momentum";
    case "focus":
      return "Focus";
    case "guard":
      return "Guard";
    case "rage":
      return "Rage";
    default:
      return resource;
  }
}

export function getSkillSlotIcon(sourceItemCode: string, skillName: string) {
  const normalizedCode = sourceItemCode.toLowerCase();
  const normalizedName = skillName.toLowerCase();

  if (normalizedCode.includes("shield") || normalizedName.includes("shield")) return "\uD83D\uDEE1";
  if (normalizedCode.includes("helmet") || normalizedCode.includes("cap") || normalizedName.includes("head")) return "\uD83E\uDE96";
  if (normalizedCode.includes("armor") || normalizedCode.includes("vest") || normalizedCode.includes("jacket")) return "\uD83E\uDDBA";
  if (normalizedCode.includes("glove") || normalizedCode.includes("gauntlet") || normalizedName.includes("grip")) return "\uD83E\uDDE4";
  if (normalizedCode.includes("boot") || normalizedName.includes("step") || normalizedName.includes("kick")) return "\uD83E\uDD7E";

  if (
    normalizedCode.includes("ring") ||
    normalizedCode.includes("charm") ||
    normalizedCode.includes("earring") ||
    normalizedCode.includes("medallion") ||
    normalizedCode.includes("accessory")
  ) {
    return "\uD83D\uDC8D";
  }

  if (normalizedCode.includes("dagger") || normalizedName.includes("pierc") || normalizedName.includes("lunge")) return "\uD83D\uDDE1";
  if (normalizedCode.includes("axe") || normalizedName.includes("cleave")) return "\uD83E\uDE93";
  if (normalizedCode.includes("mace") || normalizedCode.includes("hammer") || normalizedName.includes("bash")) return "\uD83D\uDD28";
  if (normalizedCode.includes("sword") || normalizedName.includes("slash")) return "\u2694";

  return "\u2726";
}

export function getSkillSlotTone(sourceItemCode: string) {
  const normalizedCode = sourceItemCode.toLowerCase();

  if (normalizedCode.includes("shield")) return { background: "rgba(92,149,227,0.16)", border: "rgba(92,149,227,0.36)" };
  if (normalizedCode.includes("helmet") || normalizedCode.includes("cap")) return { background: "rgba(214,177,95,0.16)", border: "rgba(214,177,95,0.36)" };
  if (normalizedCode.includes("armor") || normalizedCode.includes("vest") || normalizedCode.includes("jacket")) return { background: "rgba(176,126,96,0.16)", border: "rgba(176,126,96,0.36)" };
  if (normalizedCode.includes("glove") || normalizedCode.includes("gauntlet")) return { background: "rgba(92,199,178,0.16)", border: "rgba(92,199,178,0.36)" };
  if (normalizedCode.includes("boot")) return { background: "rgba(115,149,230,0.16)", border: "rgba(115,149,230,0.36)" };

  if (
    normalizedCode.includes("ring") ||
    normalizedCode.includes("charm") ||
    normalizedCode.includes("earring") ||
    normalizedCode.includes("medallion") ||
    normalizedCode.includes("accessory")
  ) {
    return { background: "rgba(130,111,213,0.16)", border: "rgba(130,111,213,0.36)" };
  }

  return { background: "rgba(229,115,79,0.16)", border: "rgba(229,115,79,0.36)" };
}

export function formatMaybeTitle(value: string | null) {
  if (!value) return "None";

  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function compactText(value: string) {
  return value.length > 16;
}

function formatPenetrationSummary(profile: DamageProfile) {
  return Object.entries(profile)
    .filter(([, value]) => value > 0)
    .map(([type, value]) => `${formatDamageTypeName(type)} Pen +${value}%`);
}

function buildSkillFactRows(skill: CombatSkill) {
  const rows: Array<{ label: string; value: string; strong?: boolean; color?: string }> = [
    {
      label: "Hit",
      value: `Deals x${skill.damageMultiplier.toFixed(2)} weapon damage.`,
      strong: true,
      color: "#f0a286",
    },
  ];

  if (skill.critChanceBonus) {
    rows.push({
      label: "Crit",
      value: `Adds +${skill.critChanceBonus}% crit chance.`,
      color: "#ee9abb",
    });
  }

  const penetration = formatPenetrationSummary(skill.armorPenetrationPercentBonus);
  if (penetration.length > 0) {
    rows.push({
      label: "Pen",
      value: penetration.join(" | "),
      color: "#ffaaa1",
    });
  }

  if (skill.effects?.length) {
    rows.push(
      ...skill.effects.map((effect) => ({
        label: effect.trigger === "on_hit" ? "On Hit" : "Apply",
        value: formatEffectSummary(effect),
        color: effect.kind === "buff" ? "#9ee0d2" : "#f6b1b1",
      }))
    );
  }

  if (typeof skill.cooldownTurns === "number") {
    rows.push({
      label: "Cooldown",
      value: `${skill.cooldownTurns} turn${skill.cooldownTurns === 1 ? "" : "s"}.`,
      color: "#b8cbff",
    });
  }

  if (typeof skill.requirements?.minLevel === "number") {
    rows.push({
      label: "Level",
      value: `Requires level ${skill.requirements.minLevel}.`,
      color: "#ebcf8b",
    });
  }

  if (skill.requirements?.notes?.length) {
    rows.push({
      label: "Needs",
      value: skill.requirements.notes.join(" | "),
      color: "#ebcf8b",
    });
  }

  if (skill.unlock) {
    rows.push({
      label: "Unlock",
      value: formatSkillUnlock(skill),
      color: "#87e2cf",
    });
  }

  if (rows.length === 1) {
    rows.push({
      label: "Extra",
      value: "No crit bonus, penetration bonus, or status effect.",
      color: "#d0c2b3",
    });
  }

  return rows;
}

function formatEffectSummary(effect: {
  name: string;
  kind: "buff" | "debuff";
  target: "self" | "target";
  durationTurns: number;
  modifiers?: Partial<{
    critChanceBonus: number;
    dodgeChanceBonus: number;
    blockChanceBonus: number;
    blockPowerBonus: number;
    outgoingDamagePercent: number;
    incomingDamagePercent: number;
    armorFlatBonus: ArmorProfile;
    damageFlatBonus: DamageProfile;
    armorPenetrationPercentBonus: DamageProfile;
  }>;
  periodic?: Partial<{
    heal: number;
    damage: number;
    resourceDelta: Record<string, number | undefined>;
  }>;
}) {
  const parts: string[] = [];
  const who = effect.target === "self" ? "Self" : "Target";
  const role = effect.kind === "buff" ? "buff" : "debuff";

  parts.push(`${effect.name}: ${who} ${role}, ${effect.durationTurns}t.`);
  if (effect.modifiers?.critChanceBonus) parts.push(`Crit ${formatSignedValue(effect.modifiers.critChanceBonus)}%.`);
  if (effect.modifiers?.dodgeChanceBonus) parts.push(`Dodge ${formatSignedValue(effect.modifiers.dodgeChanceBonus)}%.`);
  if (effect.modifiers?.blockChanceBonus) parts.push(`Block ${formatSignedValue(effect.modifiers.blockChanceBonus)}%.`);
  if (effect.modifiers?.blockPowerBonus) parts.push(`Block power ${formatSignedValue(effect.modifiers.blockPowerBonus)}%.`);
  if (effect.modifiers?.outgoingDamagePercent) parts.push(`Outgoing damage ${formatSignedValue(effect.modifiers.outgoingDamagePercent)}%.`);
  if (effect.modifiers?.incomingDamagePercent) parts.push(`Incoming damage ${formatSignedValue(effect.modifiers.incomingDamagePercent)}%.`);

  const damageBonus = formatProfileEntries(effect.modifiers?.damageFlatBonus);
  if (damageBonus) parts.push(`Damage ${damageBonus}.`);
  const armorBonus = formatProfileEntries(effect.modifiers?.armorFlatBonus);
  if (armorBonus) parts.push(`Armor ${armorBonus}.`);
  const penBonus = formatProfileEntries(effect.modifiers?.armorPenetrationPercentBonus, "%");
  if (penBonus) parts.push(`Pen ${penBonus}.`);
  if (effect.periodic?.heal) parts.push(`Heals ${effect.periodic.heal} HP each turn.`);
  if (effect.periodic?.damage) parts.push(`Deals ${effect.periodic.damage} HP each turn.`);

  const resourceDelta = formatResourceDelta(effect.periodic?.resourceDelta);
  if (resourceDelta) parts.push(resourceDelta);

  return parts.join(" ");
}

function formatSkillUnlock(skill: CombatSkill) {
  if (!skill.unlock) return "Default.";

  const label = formatSkillUnlockKind(skill.unlock.kind);
  const source = skill.unlock.sourceName ? ` via ${skill.unlock.sourceName}` : "";
  const note = skill.unlock.note ? ` ${skill.unlock.note}` : "";

  return `${label}${source}.${note}`.trim();
}

function formatSignedValue(value: number) {
  return value > 0 ? `+${value}` : `${value}`;
}

function formatProfileEntries(
  profile: Partial<Record<keyof DamageProfile, number>> | Partial<Record<keyof ArmorProfile, number>> | undefined,
  suffix = ""
) {
  if (!profile) return "";

  return Object.entries(profile)
    .filter(([, value]) => value && value !== 0)
    .map(([type, value]) => `${formatDamageTypeName(type)} ${formatSignedValue(Number(value))}${suffix}`)
    .join(" | ");
}

function formatResourceDelta(resourceDelta: Record<string, number | undefined> | undefined) {
  if (!resourceDelta) return "";

  return Object.entries(resourceDelta)
    .filter(([, value]) => value && value !== 0)
    .map(([resource, value]) => `${formatResourceName(resource)} ${formatSignedValue(Number(value))} each turn.`)
    .join(" ");
}

function formatSkillUnlockKind(kind: NonNullable<CombatSkill["unlock"]>["kind"]) {
  switch (kind) {
    case "item":
      return "Item";
    case "book":
      return "Book";
    case "trainer":
      return "Trainer";
    case "quest":
      return "Quest";
    case "default":
      return "Default";
  }
}

function formatDamageTypeName(name: string) {
  switch (name) {
    case "slash":
      return "Slash";
    case "pierce":
      return "Pierce";
    case "blunt":
      return "Blunt";
    case "chop":
      return "Chop";
    default:
      return name;
  }
}
