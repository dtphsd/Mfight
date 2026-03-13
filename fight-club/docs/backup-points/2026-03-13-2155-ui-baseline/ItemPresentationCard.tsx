import type { CSSProperties, ReactNode } from "react";
import type { CharacterStats } from "@/modules/character";
import type { CombatSkill } from "@/modules/combat/model/CombatSkill";
import type {
  ArmorProfile,
  CombatBonuses,
  DamageProfile,
  DamageType,
  InventoryEntry,
  Item,
} from "@/modules/inventory";
import { getWeaponClassPassivePreview } from "@/modules/combat/config/combatWeaponPassives";

interface ItemPresentationCardProps {
  entry: InventoryEntry;
  footer?: ReactNode;
  compact?: boolean;
  showQuantityTag?: boolean;
}

type SectionTone = "offense" | "defense" | "attributes" | "utility";
type ItemInfoRow = { label: string; value: string; icon?: ReactNode };
type TagTone = { background: string; border: string; text: string };

const tonePalette: Record<SectionTone, { label: string; accent: string; text: string; background: string }> = {
  offense: {
    label: "Offense",
    accent: "#ff9f7a",
    text: "#ffd6c7",
    background: "rgba(186, 74, 46, 0.16)",
  },
  defense: {
    label: "Defense",
    accent: "#7fb9ff",
    text: "#d8ebff",
    background: "rgba(79, 128, 196, 0.16)",
  },
  attributes: {
    label: "Attributes",
    accent: "#dabb6f",
    text: "#f5e4af",
    background: "rgba(161, 126, 48, 0.16)",
  },
  utility: {
    label: "Utility",
    accent: "#7fd3c7",
    text: "#d7fff8",
    background: "rgba(55, 134, 122, 0.16)",
  },
};

const rarityPalette: Record<Item["rarity"], { background: string; text: string; border: string }> = {
  common: {
    background: "rgba(210, 203, 192, 0.1)",
    text: "#e8e0d4",
    border: "rgba(210, 203, 192, 0.2)",
  },
  rare: {
    background: "rgba(120, 189, 255, 0.12)",
    text: "#bfe3ff",
    border: "rgba(120, 189, 255, 0.24)",
  },
  epic: {
    background: "rgba(180, 116, 255, 0.14)",
    text: "#dcc3ff",
    border: "rgba(180, 116, 255, 0.26)",
  },
  legendary: {
    background: "rgba(255, 186, 107, 0.14)",
    text: "#ffe0b3",
    border: "rgba(255, 186, 107, 0.28)",
  },
};

const itemTypePalette: Record<Item["type"], TagTone> = {
  weapon: { background: "rgba(229,115,79,0.16)", border: "rgba(229,115,79,0.28)", text: "#f0a286" },
  shield: { background: "rgba(92,149,227,0.16)", border: "rgba(92,149,227,0.28)", text: "#b7d5ff" },
  helmet: { background: "rgba(214,177,95,0.16)", border: "rgba(214,177,95,0.28)", text: "#ebcf8b" },
  armor: { background: "rgba(176,126,96,0.16)", border: "rgba(176,126,96,0.28)", text: "#f2c3a7" },
  boots: { background: "rgba(115,149,230,0.16)", border: "rgba(115,149,230,0.28)", text: "#b8cbff" },
  gloves: { background: "rgba(92,199,178,0.16)", border: "rgba(92,199,178,0.28)", text: "#87e2cf" },
  accessory: { background: "rgba(130,111,213,0.16)", border: "rgba(130,111,213,0.28)", text: "#ccc0ff" },
  consumable: { background: "rgba(92,199,178,0.16)", border: "rgba(92,199,178,0.28)", text: "#87e2cf" },
  material: { background: "rgba(255,255,255,0.08)", border: "rgba(255,255,255,0.14)", text: "#ddd3c5" },
};

const cardStyle: CSSProperties = {
  borderRadius: "16px",
  padding: "12px",
  background:
    "linear-gradient(180deg, rgba(29,24,20,0.98), rgba(16,14,20,0.98)), radial-gradient(circle at top, rgba(255,214,164,0.08), transparent 32%)",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 14px 28px rgba(0,0,0,0.2)",
  display: "grid",
  gap: "12px",
};

export function ItemPresentationCard({
  entry,
  footer,
  compact = false,
  showQuantityTag = true,
}: ItemPresentationCardProps) {
  const { item, quantity } = entry;
  const sections = buildSections(item);
  const weaponPassive = getWeaponClassPassivePreview(item.equip?.weaponClass ?? null);
  const signatureSkill = item.skills?.[0] ?? null;

  return (
    <div style={{ ...cardStyle, gap: compact ? "10px" : "12px", padding: compact ? "10px" : "12px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: compact ? "88px minmax(0, 1fr)" : "104px minmax(0, 1fr)",
          gap: compact ? "10px" : "12px",
          alignItems: "start",
        }}
      >
        <ItemArtwork item={item} size={compact ? 88 : 104} />
        <div style={{ display: "grid", gap: "8px", minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", gap: "8px" }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: compact ? "15px" : "16px", fontWeight: 800, color: "#fff6e8", lineHeight: 1.15 }}>
                {item.name}
              </div>
              <div style={{ marginTop: "4px", fontSize: "12px", lineHeight: 1.45, color: "#d7cbbc" }}>
                {item.description}
              </div>
            </div>
            <ItemTag label={formatRarity(item.rarity)} palette={rarityPalette[item.rarity]} />
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            <MutedTag label={formatItemType(item.type)} palette={itemTypePalette[item.type]} />
            {showQuantityTag ? <MutedTag label={`Quantity: ${quantity}`} /> : null}
            <MutedTag label={`Value: ${item.value}`} />
            {item.equip?.slot ? <MutedTag label={`Slot: ${formatEquipSlot(item.equip.slot)}`} palette={getSlotPalette(item.equip.slot)} /> : null}
            {item.equip?.weaponClass ? <MutedTag label={`Weapon: ${formatWeaponClass(item.equip.weaponClass)}`} palette={itemTypePalette.weapon} /> : null}
            {item.equip?.armorClass ? <MutedTag label={`Armor: ${formatArmorClass(item.equip.armorClass)}`} palette={getArmorClassPalette(item.equip.armorClass)} /> : null}
            {item.equip?.handedness ? <MutedTag label={`Hands: ${formatHandedness(item.equip.handedness)}`} /> : null}
          </div>
        </div>
      </div>

      {weaponPassive ? <WeaponPassiveFeature preview={weaponPassive} compact={compact} /> : null}
      {signatureSkill ? <ItemSkillFeature skill={signatureSkill} compact={compact} /> : null}

      <div style={{ display: "grid", gap: "8px" }}>
        {sections.map((section) => (
          <ItemSection key={section.tone} tone={section.tone} rows={section.rows} compact={compact} />
        ))}
      </div>

      {footer ? <div>{footer}</div> : null}
    </div>
  );
}

export function ItemArtwork({ item, size = 96 }: { item: Item; size?: number }) {
  const palette = getArtworkPalette(item);

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "18px",
        overflow: "hidden",
        border: `1px solid ${palette.border}`,
        background: palette.background,
        boxShadow: `inset 0 0 28px ${palette.innerGlow}, 0 10px 22px rgba(0,0,0,0.22)`,
      }}
    >
      <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden="true">
        <defs>
          <linearGradient id={`panel-${item.code}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={palette.panelFrom} />
            <stop offset="100%" stopColor={palette.panelTo} />
          </linearGradient>
          <radialGradient id={`glow-${item.code}`} cx="35%" cy="28%" r="75%">
            <stop offset="0%" stopColor={palette.glow} stopOpacity="0.88" />
            <stop offset="100%" stopColor={palette.glow} stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect x="0" y="0" width="120" height="120" fill={`url(#panel-${item.code})`} />
        <rect x="0" y="0" width="120" height="120" fill={`url(#glow-${item.code})`} />
        <path d="M12 18c12-10 84-10 96 0" fill="none" stroke="rgba(255,245,226,0.18)" strokeWidth="2" strokeLinecap="round" />
        <path d="M18 102c12-8 72-8 84 0" fill="none" stroke="rgba(255,245,226,0.12)" strokeWidth="2" strokeLinecap="round" />
        <path d="M16 16h88v88H16z" fill="none" stroke="rgba(255,245,226,0.14)" strokeWidth="1.6" strokeDasharray="3 5" />
        {renderArtworkScene(item)}
      </svg>
    </div>
  );
}

function ItemSection({
  tone,
  rows,
  compact,
}: {
  tone: SectionTone;
  rows: ItemInfoRow[];
  compact: boolean;
}) {
  if (rows.length === 0) {
    return null;
  }

  const palette = tonePalette[tone];

  return (
    <div
      style={{
        borderRadius: "14px",
        padding: compact ? "8px 9px" : "10px 11px",
        background: palette.background,
        border: "1px solid rgba(255,255,255,0.08)",
        display: "grid",
        gap: compact ? "6px" : "8px",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          fontWeight: 800,
          color: palette.accent,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
        }}
      >
        {palette.label}
      </div>
      <div style={{ display: "grid", gap: "6px" }}>
        {rows.map((row) => (
          <div key={`${tone}-${row.label}`} style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "7px", minWidth: 0 }}>
              {row.icon ? (
                <span
                  style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "999px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    flexShrink: 0,
                  }}
                >
                  {row.icon}
                </span>
              ) : null}
              <span style={{ color: palette.accent, fontSize: compact ? "11px" : "12px", fontWeight: 700, lineHeight: 1.2 }}>
                {row.label}
              </span>
            </div>
            <span style={{ color: palette.text, fontSize: compact ? "11px" : "12px", textAlign: "right", lineHeight: 1.25 }}>
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ItemTag({
  label,
  palette,
}: {
  label: string;
  palette: { background: string; text: string; border: string };
}) {
  return (
    <span
      style={{
        borderRadius: "999px",
        padding: "4px 8px",
        fontSize: "10px",
        fontWeight: 700,
        background: palette.background,
        color: palette.text,
        border: `1px solid ${palette.border}`,
        textTransform: "uppercase",
        flexShrink: 0,
      }}
    >
      {label}
    </span>
  );
}

function MutedTag({ label, palette }: { label: string; palette?: TagTone }) {
  return (
    <span
      style={{
        borderRadius: "999px",
        padding: "4px 8px",
        fontSize: "10px",
        color: palette?.text ?? "#ddd3c5",
        background: palette?.background ?? "rgba(255,255,255,0.06)",
        border: `1px solid ${palette?.border ?? "rgba(255,255,255,0.08)"}`,
      }}
    >
      {label}
    </span>
  );
}

function buildSections(item: Item): Array<{ tone: SectionTone; rows: ItemInfoRow[] }> {
  return [
    {
      tone: "offense" as const,
      rows: [
        ...buildDamageRows(item.baseDamage),
        ...buildOffenseBonusRows(item.combatBonuses),
      ],
    },
    {
      tone: "defense" as const,
      rows: [
        ...buildArmorRows(item.baseArmor),
        ...buildDefenseBonusRows(item.combatBonuses),
      ],
    },
    {
      tone: "attributes" as const,
      rows: buildAttributeRows(item.flatBonuses, item.percentBonuses),
    },
    {
      tone: "utility" as const,
      rows: buildUtilityRows(item),
    },
  ].filter((section) => section.rows.length > 0);
}

function buildDamageRows(profile: DamageProfile): ItemInfoRow[] {
  return damageTypes
    .filter((type) => profile[type] !== 0)
    .map((type) => ({
      label: `${formatDamageType(type)} Damage`,
      value: `${profile[type]}`,
      icon: getDamageTypeIcon(type),
    }));
}

function buildArmorRows(profile: ArmorProfile): ItemInfoRow[] {
  return damageTypes
    .filter((type) => profile[type] !== 0)
    .map((type) => ({
      label: `${formatDamageType(type)} Armor`,
      value: `${profile[type]}`,
      icon: <ShieldGlyph size={11} />,
    }));
}

function buildOffenseBonusRows(bonuses: CombatBonuses): ItemInfoRow[] {
  return [
    bonuses.critChance ? { label: "Critical Chance", value: `${formatSignedValue(bonuses.critChance)}%`, icon: <CritGlyph size={11} /> } : null,
    bonuses.critMultiplier ? { label: "Critical Multiplier", value: `${formatSignedValue(bonuses.critMultiplier)}`, icon: <CritGlyph size={11} /> } : null,
    ...buildProfileSummaryRows("Armor Penetration", bonuses.armorPenetrationFlat, false, <AxeGlyph size={11} />),
    ...buildProfileSummaryRows("Armor Penetration", bonuses.armorPenetrationPercent, true, <AxeGlyph size={11} />),
    ...buildProfileSummaryRows("Outgoing Damage", bonuses.outgoingDamageFlat, false, <SwordGlyph size={11} />),
    ...buildProfileSummaryRows("Outgoing Damage", bonuses.outgoingDamagePercent, true, <SwordGlyph size={11} />),
  ].filter(isItemInfoRow);
}

function buildDefenseBonusRows(bonuses: CombatBonuses): ItemInfoRow[] {
  return [
    bonuses.blockChance ? { label: "Block Chance", value: `${formatSignedValue(bonuses.blockChance)}%`, icon: <ShieldGlyph size={11} /> } : null,
    bonuses.blockPower ? { label: "Block Power", value: `${formatSignedValue(bonuses.blockPower)}%`, icon: <ShieldGlyph size={11} /> } : null,
    bonuses.dodgeChance ? { label: "Dodge Chance", value: `${formatSignedValue(bonuses.dodgeChance)}%`, icon: <BootsGlyph size={11} /> } : null,
    ...buildProfileSummaryRows("Bonus Armor", bonuses.armorFlat, false, <ShieldGlyph size={11} />),
    ...buildProfileSummaryRows("Bonus Armor", bonuses.armorPercent, true, <ShieldGlyph size={11} />),
  ].filter(isItemInfoRow);
}

function buildAttributeRows(flatBonuses: CharacterStats, percentBonuses: CharacterStats): ItemInfoRow[] {
  const flatRows = Object.entries(flatBonuses)
    .filter(([, value]) => value !== 0)
    .map(([stat, value]) => ({
      label: formatStatName(stat),
      value: formatSignedValue(value),
      icon: <StatsGlyph size={11} />,
    }));
  const percentRows = Object.entries(percentBonuses)
    .filter(([, value]) => value !== 0)
    .map(([stat, value]) => ({
      label: `${formatStatName(stat)} Modifier`,
      value: `${formatSignedValue(value)}%`,
      icon: <StatsGlyph size={11} />,
    }));

  return [...flatRows, ...percentRows];
}

function buildUtilityRows(item: Item): ItemInfoRow[] {
  return [
    { label: "Category", value: formatItemCategory(item.category) },
    { label: "Stack Size", value: item.stackable ? `${item.maxStack}` : "Single Item" },
    item.consumableEffect ? { label: "Usage Mode", value: formatConsumableUsageMode(item.consumableEffect.usageMode) } : null,
    { label: "Trade Value", value: `${item.value}` },
  ].filter(isItemInfoRow);
}

function WeaponPassiveFeature({
  preview,
  compact,
}: {
  preview: NonNullable<ReturnType<typeof getWeaponClassPassivePreview>>;
  compact: boolean;
}) {
  return (
    <div
      style={{
        borderRadius: compact ? "14px" : "16px",
        padding: compact ? "10px" : "12px",
        background:
          "linear-gradient(180deg, rgba(229,115,79,0.16), rgba(229,115,79,0.08)), radial-gradient(circle at top right, rgba(255,208,158,0.18), transparent 42%)",
        border: "1px solid rgba(255,171,97,0.28)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
        display: "grid",
        gap: compact ? "6px" : "8px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "start", flexWrap: "wrap" }}>
        <div style={{ display: "grid", gap: "2px" }}>
          <div style={{ fontSize: "10px", fontWeight: 900, color: "#ffd6bd", letterSpacing: "0.14em", textTransform: "uppercase" }}>
            Weapon Passive
          </div>
          <div style={{ fontSize: compact ? "15px" : "16px", fontWeight: 900, color: "#fff4e6", lineHeight: 1.05 }}>
            {preview.name}
          </div>
        </div>
        <span
          style={{
            borderRadius: "999px",
            padding: "4px 8px",
            fontSize: "10px",
            fontWeight: 800,
            color: "#ffe2c9",
            background: "rgba(255,171,97,0.12)",
            border: "1px solid rgba(255,171,97,0.24)",
            whiteSpace: "nowrap",
          }}
        >
          {preview.trigger}
        </span>
      </div>
      <div style={{ fontSize: compact ? "11px" : "12px", lineHeight: 1.35, color: "#f6dfcd", fontWeight: 700 }}>
        {preview.effect}
      </div>
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        <MutedTag label={preview.duration} palette={itemTypePalette.weapon} />
        <MutedTag label={preview.stacks} palette={itemTypePalette.weapon} />
      </div>
    </div>
  );
}

function ItemSkillFeature({
  skill,
  compact,
}: {
  skill: CombatSkill;
  compact: boolean;
}) {
  const factTags = buildSkillFeatureTags(skill);

  return (
    <div
      style={{
        borderRadius: compact ? "14px" : "16px",
        padding: compact ? "10px" : "12px",
        background:
          "linear-gradient(180deg, rgba(92,199,178,0.14), rgba(92,199,178,0.07)), radial-gradient(circle at top right, rgba(189,255,241,0.14), transparent 42%)",
        border: "1px solid rgba(92,199,178,0.24)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
        display: "grid",
        gap: compact ? "6px" : "8px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "start", flexWrap: "wrap" }}>
        <div style={{ display: "grid", gap: "2px" }}>
          <div style={{ fontSize: "10px", fontWeight: 900, color: "#b9f4e8", letterSpacing: "0.14em", textTransform: "uppercase" }}>
            Signature Skill
          </div>
          <div style={{ fontSize: compact ? "15px" : "16px", fontWeight: 900, color: "#effffb", lineHeight: 1.05 }}>
            {skill.name}
          </div>
        </div>
        <span
          style={{
            borderRadius: "999px",
            padding: "4px 8px",
            fontSize: "10px",
            fontWeight: 800,
            color: "#d9fffa",
            background: "rgba(92,199,178,0.12)",
            border: "1px solid rgba(92,199,178,0.24)",
            whiteSpace: "nowrap",
          }}
        >
          {skill.cost} {formatResourceLabel(skill.resourceType)}
        </span>
      </div>
      <div style={{ fontSize: compact ? "11px" : "12px", lineHeight: 1.35, color: "#dff9f4", fontWeight: 700 }}>
        {skill.description}
      </div>
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {factTags.map((tag) => (
          <MutedTag key={`${skill.id}-${tag}`} label={tag} palette={itemTypePalette.consumable} />
        ))}
      </div>
    </div>
  );
}

function buildProfileSummaryRows(
  label: string,
  profile: DamageProfile | ArmorProfile,
  percent: boolean,
  icon: ReactNode
): ItemInfoRow[] {
  const entries = damageTypes
    .filter((type) => profile[type] !== 0)
    .map((type) => `${formatDamageType(type)} ${formatSignedValue(profile[type])}${percent ? "%" : ""}`);

  return entries.length > 0
    ? [
        {
          label: percent ? `${label} %` : label,
          value: entries.join(", "),
          icon,
        },
      ]
    : [];
}

function isItemInfoRow(row: ItemInfoRow | null): row is ItemInfoRow {
  return row !== null;
}

function getArtworkPalette(item: Item) {
  switch (item.type) {
    case "weapon":
      return {
        background: "linear-gradient(180deg, #37221a, #171116)",
        border: "rgba(255, 177, 123, 0.34)",
        innerGlow: "rgba(255, 163, 109, 0.18)",
        panelFrom: "#553225",
        panelTo: "#1e1619",
        glow: "#f9b47e",
      };
    case "shield":
    case "armor":
    case "helmet":
    case "boots":
    case "gloves":
      return {
        background: "linear-gradient(180deg, #1c2532, #11161d)",
        border: "rgba(124, 178, 255, 0.32)",
        innerGlow: "rgba(108, 174, 255, 0.16)",
        panelFrom: "#30455f",
        panelTo: "#161e27",
        glow: "#8dc2ff",
      };
    case "consumable":
      return {
        background: "linear-gradient(180deg, #2d2117, #181310)",
        border: "rgba(133, 214, 186, 0.32)",
        innerGlow: "rgba(113, 214, 187, 0.16)",
        panelFrom: "#4a3726",
        panelTo: "#1d1612",
        glow: "#8de0d0",
      };
    default:
      return {
        background: "linear-gradient(180deg, #28211c, #171412)",
        border: "rgba(214, 189, 132, 0.3)",
        innerGlow: "rgba(214, 189, 132, 0.14)",
        panelFrom: "#4b3f2d",
        panelTo: "#1d1714",
        glow: "#dec590",
      };
  }
}

function renderArtworkScene(item: Item) {
  switch (item.code) {
    case "training-sword":
      return (
        <>
          <path d="M38 86 80 28l8 8-58 42-4 14 12-6Z" fill="#d9dfe7" stroke="#fff5e8" strokeWidth="2" strokeLinejoin="round" />
          <path d="M32 84 42 94l-10 6-6-6 6-10Z" fill="#7f5532" stroke="#c99964" strokeWidth="2" />
          <path d="M50 76l8 8" stroke="#b87446" strokeWidth="3" strokeLinecap="round" />
        </>
      );
    case "training-dagger":
      return (
        <>
          <path d="M60 22 78 58 58 80 42 64 60 22Z" fill="#dfe5ed" stroke="#fff7ef" strokeWidth="2" strokeLinejoin="round" />
          <path d="M42 64 32 78l10 10 16-8" fill="#8f5f3a" stroke="#d9aa75" strokeWidth="2" strokeLinejoin="round" />
          <path d="M60 28 52 58" stroke="#bfd6ea" strokeWidth="2" strokeLinecap="round" />
        </>
      );
    case "oak-shield":
      return (
        <>
          <path d="M60 20 28 34v28c0 20 12 34 32 44 20-10 32-24 32-44V34L60 20Z" fill="#5f7d59" stroke="#eff7ec" strokeWidth="2.4" />
          <path d="M60 27v68" stroke="#e6f4e2" strokeWidth="2.2" opacity="0.8" />
          <path d="M38 48h44" stroke="#9dbb95" strokeWidth="2.2" opacity="0.9" />
        </>
      );
    case "great-training-sword":
      return (
        <>
          <path d="M34 90 78 18l10 10-62 54-4 18 12-10Z" fill="#e1e6ee" stroke="#fff6e8" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M26 88 40 102l-14 8-8-8 8-14Z" fill="#7b5232" stroke="#c99a63" strokeWidth="2" />
          <path d="M46 80l10 10" stroke="#b87446" strokeWidth="4" strokeLinecap="round" />
        </>
      );
    case "leather-vest":
      return (
        <>
          <path d="m42 28 18 10 18-10 10 16-6 16v34H38V60l-6-16 10-16Z" fill="#7d5739" stroke="#f3dec2" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M60 38v56" stroke="#d1ab7d" strokeWidth="2" />
          <path d="M46 54h28" stroke="#d1ab7d" strokeWidth="2" opacity="0.75" />
        </>
      );
    case "small-potion":
      return (
        <>
          <path d="M48 26h24v10l10 14v28c0 10-10 18-22 18s-22-8-22-18V50l10-14V26Z" fill="#7dd7be" stroke="#f2fff7" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M48 26h24" stroke="#c2f6e7" strokeWidth="3" />
          <path d="M42 66c8 6 28 6 36 0" stroke="#d8fff5" strokeWidth="2" opacity="0.9" />
        </>
      );
    case "bandage":
      return (
        <>
          <rect x="26" y="38" width="68" height="44" rx="16" fill="#d9c7a7" stroke="#fff0d3" strokeWidth="2.2" />
          <path d="M30 54c14-10 46-10 60 0" fill="none" stroke="#bca07f" strokeWidth="2" strokeLinecap="round" />
          <path d="M34 68c14-10 40-10 52 0" fill="none" stroke="#bca07f" strokeWidth="2" strokeLinecap="round" />
        </>
      );
    case "arena-token":
      return (
        <>
          <circle cx="60" cy="60" r="30" fill="#d3b16b" stroke="#fff0c3" strokeWidth="3" />
          <circle cx="60" cy="60" r="22" fill="none" stroke="#f8deb0" strokeWidth="2" strokeDasharray="4 4" />
          <path d="M46 66c6-10 12-16 14-20 2 4 8 10 14 20-10-4-18-4-28 0Z" fill="#7f5b2b" />
        </>
      );
    default:
      return (
        <>
          <circle cx="60" cy="60" r="26" fill="rgba(255,245,226,0.18)" stroke="rgba(255,245,226,0.42)" strokeWidth="2" />
          <path d="M46 72c8-18 18-18 28 0" fill="none" stroke="rgba(255,245,226,0.85)" strokeWidth="3" strokeLinecap="round" />
        </>
      );
  }
}

const damageTypes: DamageType[] = ["slash", "pierce", "blunt", "chop"];

function formatItemType(type: Item["type"]) {
  switch (type) {
    case "weapon":
      return "Weapon";
    case "shield":
      return "Shield";
    case "helmet":
      return "Helmet";
    case "armor":
      return "Armor";
    case "boots":
      return "Boots";
    case "gloves":
      return "Gloves";
    case "accessory":
      return "Accessory";
    case "consumable":
      return "Consumable";
    case "material":
      return "Material";
  }
}

function formatItemCategory(category: Item["category"]) {
  switch (category) {
    case "weapon":
      return "Weapon";
    case "shield":
      return "Shield";
    case "armor":
      return "Armor";
    case "accessory":
      return "Accessory";
    case "consumable":
      return "Consumable";
    case "material":
      return "Material";
  }
}

function formatConsumableUsageMode(usageMode: NonNullable<Item["consumableEffect"]>["usageMode"]) {
  switch (usageMode) {
    case "replace_attack":
      return "Separate Action";
    case "with_attack":
      return "With Attack";
  }
}

function formatEquipSlot(slot: NonNullable<Item["equip"]>["slot"]) {
  switch (slot) {
    case "mainHand":
      return "Main Hand";
    case "offHand":
      return "Off Hand";
    case "helmet":
      return "Helmet";
    case "armor":
      return "Armor";
    case "boots":
      return "Boots";
    case "gloves":
      return "Gloves";
    case "accessory":
      return "Accessory";
  }
}

function formatWeaponClass(weaponClass: NonNullable<NonNullable<Item["equip"]>["weaponClass"]>) {
  switch (weaponClass) {
    case "sword":
      return "Sword";
    case "dagger":
      return "Dagger";
    case "mace":
      return "Mace";
    case "axe":
      return "Axe";
    case "greatsword":
      return "Greatsword";
    case "greatmace":
      return "Greatmace";
    case "greataxe":
      return "Greataxe";
  }
}

function formatArmorClass(armorClass: NonNullable<NonNullable<Item["equip"]>["armorClass"]>) {
  switch (armorClass) {
    case "helmet":
      return "Helmet";
    case "armor":
      return "Body Armor";
    case "boots":
      return "Boots";
    case "gloves":
      return "Gloves";
    case "shield":
      return "Shield";
    case "accessory":
      return "Accessory";
  }
}

function formatHandedness(handedness: NonNullable<NonNullable<Item["equip"]>["handedness"]>) {
  switch (handedness) {
    case "one_hand":
      return "One-Handed";
    case "two_hand":
      return "Two-Handed";
    case "off_hand_only":
      return "Off-Hand Only";
  }
}

function formatRarity(rarity: Item["rarity"]) {
  return rarity.charAt(0).toUpperCase() + rarity.slice(1);
}

function formatStatName(stat: string) {
  switch (stat) {
    case "strength":
      return "Strength";
    case "agility":
      return "Agility";
    case "rage":
      return "Rage";
    case "endurance":
      return "Endurance";
    default:
      return stat;
  }
}

function formatDamageType(type: DamageType) {
  switch (type) {
    case "slash":
      return "Slash";
    case "pierce":
      return "Pierce";
    case "blunt":
      return "Blunt";
    case "chop":
      return "Chop";
  }
}

function formatSignedValue(value: number) {
  return value > 0 ? `+${value}` : `${value}`;
}

function formatResourceLabel(resourceType: CombatSkill["resourceType"]) {
  switch (resourceType) {
    case "momentum":
      return "Momentum";
    case "focus":
      return "Focus";
    case "guard":
      return "Guard";
    case "rage":
      return "Rage";
  }
}

function buildSkillFeatureTags(skill: CombatSkill) {
  const tags = [`Damage x${skill.damageMultiplier.toFixed(2)}`];

  if (skill.critChanceBonus > 0) {
    tags.push(`Crit +${skill.critChanceBonus}%`);
  }

  const penetrationEntries = Object.entries(skill.armorPenetrationPercentBonus)
    .filter(([, value]) => value > 0)
    .map(([type, value]) => `${formatDamageType(type as DamageType)} Pen +${value}%`);
  tags.push(...penetrationEntries);

  (skill.effects ?? []).forEach((effect) => {
    tags.push(`${effect.name} ${effect.durationTurns}T`);
  });

  return tags;
}

function getSlotPalette(slot: NonNullable<Item["equip"]>["slot"]): TagTone {
  switch (slot) {
    case "mainHand":
      return itemTypePalette.weapon;
    case "offHand":
      return itemTypePalette.shield;
    case "helmet":
      return itemTypePalette.helmet;
    case "armor":
      return itemTypePalette.armor;
    case "boots":
      return itemTypePalette.boots;
    case "gloves":
      return itemTypePalette.gloves;
    case "accessory":
      return itemTypePalette.accessory;
  }
}

function getArmorClassPalette(armorClass: NonNullable<NonNullable<Item["equip"]>["armorClass"]>): TagTone {
  switch (armorClass) {
    case "helmet":
      return itemTypePalette.helmet;
    case "armor":
      return itemTypePalette.armor;
    case "boots":
      return itemTypePalette.boots;
    case "gloves":
      return itemTypePalette.gloves;
    case "shield":
      return itemTypePalette.shield;
    case "accessory":
      return itemTypePalette.accessory;
  }
}

function getDamageTypeIcon(type: DamageType) {
  switch (type) {
    case "slash":
      return <SwordGlyph size={11} />;
    case "pierce":
      return <DaggerGlyph size={11} />;
    case "blunt":
      return <MaceGlyph size={11} />;
    case "chop":
      return <AxeGlyph size={11} />;
  }
}

function SwordGlyph({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M13.5 4 19 4.5l-.5 5.5-7.5 7.5-3.5-3.5L13.5 4Z" fill="#ffd6a2" stroke="#fff3de" strokeWidth="1.1" />
      <path d="M7.5 14.5 4 18l2 2 3.5-3.5" fill="#8f5d35" stroke="#d1a26f" strokeWidth="1" />
    </svg>
  );
}

function DaggerGlyph({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M12 3 17 12l-5 4-5-4 5-9Z" fill="#dfe6ed" stroke="#fff7ef" strokeWidth="1.1" />
      <path d="M7 12 4.5 17l2.5 2.5L12 16" fill="#8f5d35" stroke="#d1a26f" strokeWidth="1" />
    </svg>
  );
}

function MaceGlyph({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <circle cx="15" cy="8" r="4" fill="#bfc8d6" stroke="#edf3fb" strokeWidth="1.1" />
      <path d="M8 18 13 13" stroke="#c99964" strokeWidth="2.1" strokeLinecap="round" />
      <path d="M6 20 8 18" stroke="#835731" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function AxeGlyph({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M14 4c4 0 6 3 6 5s-1 3-4 4c-2 .7-3 2-4 4l-2-2c1.4-2.2 1.8-4.2.8-6.6C10 6 11.5 4 14 4Z" fill="#dfe6ed" stroke="#fff7ef" strokeWidth="1.1" />
      <path d="M8 6 13 19" stroke="#c99964" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ShieldGlyph({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M12 3 6 5.5v5.2c0 4.2 2.3 7.2 6 9.3 3.7-2.1 6-5.1 6-9.3V5.5L12 3Z" fill="#81baff" stroke="#eff7ff" strokeWidth="1.1" />
    </svg>
  );
}

function CritGlyph({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M12 4c2.8 4.4 5 6.8 5 9.4a5 5 0 1 1-10 0C7 10.8 9.2 8.4 12 4Z" fill="#ff8d98" stroke="#ffe8ec" strokeWidth="1.1" />
    </svg>
  );
}

function BootsGlyph({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M8 5h4v6c0 1.5 1.2 2.7 2.7 2.7H19V16H5v-2.5L8 12V5Z" fill="#d8bb96" stroke="#fff0da" strokeWidth="1.1" />
    </svg>
  );
}

function StatsGlyph({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M12 4 18 8v8l-6 4-6-4V8l6-4Z" fill="#dbc16d" stroke="#fff4cd" strokeWidth="1.1" />
      <path d="M12 7v10M8.5 10l7 4" stroke="#7e6322" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
