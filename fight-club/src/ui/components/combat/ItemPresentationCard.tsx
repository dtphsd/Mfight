import type { CSSProperties, ReactNode } from "react";
import type { CharacterStats } from "@/modules/character";
import type { CombatSkill } from "@/modules/combat/model/CombatSkill";
import type {
  ArmorProfile,
  CombatBonuses,
  DamageProfile,
  InventoryEntry,
  Item,
  ZoneArmorProfile,
} from "@/modules/inventory";
import { getWeaponClassPassivePreview } from "@/modules/combat/config/combatWeaponPassives";
import {
  AxeGlyph,
  BootsGlyph,
  buildSkillFeatureTags,
  CritGlyph,
  formatArmorRangeValue,
  formatConsumableUsageMode,
  formatDamageType,
  formatEquipSlot,
  formatHandedness,
  formatRarity,
  formatRangeValue,
  formatResourceLabel,
  formatSignedValue,
  formatStatName,
  formatWeaponClass,
  getDamageTypeIcon,
  getDamageTypes,
  ShieldGlyph,
  SwordGlyph,
  StatsGlyph,
} from "./itemPresentationCardHelpers";

interface ItemPresentationCardProps {
  entry: InventoryEntry;
  footer?: ReactNode;
  compact?: boolean;
  showQuantityTag?: boolean;
}

type SectionTone = "offense" | "defense" | "attributes" | "utility";
type ItemInfoRow = { label: string; value: string; icon?: ReactNode };
type ItemSectionDefinition = { tone: SectionTone; title?: string; rows: ItemInfoRow[] };
type TagTone = { background: string; border: string; text: string };

const tonePalette: Record<SectionTone, { label: string; accent: string; text: string; background: string }> = {
  offense: {
    label: "Offense",
    accent: "#ff9f7a",
    text: "#ffd6c7",
    background: "rgb(49, 31, 28)",
  },
  defense: {
    label: "Defense",
    accent: "#7fb9ff",
    text: "#d8ebff",
    background: "rgb(26, 34, 48)",
  },
  attributes: {
    label: "Attributes",
    accent: "#dabb6f",
    text: "#f5e4af",
    background: "rgb(47, 39, 24)",
  },
  utility: {
    label: "Utility",
    accent: "#7fd3c7",
    text: "#d7fff8",
    background: "rgb(23, 41, 38)",
  },
};

const rarityPalette: Record<Item["rarity"], { background: string; text: string; border: string }> = {
  common: {
    background: "rgb(56, 52, 48)",
    text: "#e8e0d4",
    border: "rgb(98, 92, 84)",
  },
  rare: {
    background: "rgb(39, 53, 71)",
    text: "#bfe3ff",
    border: "rgb(74, 104, 137)",
  },
  epic: {
    background: "rgb(54, 38, 71)",
    text: "#dcc3ff",
    border: "rgb(102, 74, 135)",
  },
  legendary: {
    background: "rgb(72, 51, 27)",
    text: "#ffe0b3",
    border: "rgb(144, 108, 60)",
  },
};

const itemTypePalette: Record<Item["type"], TagTone> = {
  weapon: { background: "rgb(66, 38, 32)", border: "rgb(119, 70, 59)", text: "#f0a286" },
  shield: { background: "rgb(33, 46, 66)", border: "rgb(66, 94, 134)", text: "#b7d5ff" },
  helmet: { background: "rgb(67, 55, 31)", border: "rgb(123, 101, 58)", text: "#ebcf8b" },
  shirt: { background: "rgb(68, 56, 34)", border: "rgb(121, 99, 65)", text: "#e9d1a2" },
  armor: { background: "rgb(63, 45, 37)", border: "rgb(108, 77, 63)", text: "#f2c3a7" },
  bracers: { background: "rgb(26, 58, 53)", border: "rgb(58, 109, 102)", text: "#9ce6d8" },
  belt: { background: "rgb(68, 49, 35)", border: "rgb(111, 83, 58)", text: "#e0bd96" },
  pants: { background: "rgb(34, 45, 66)", border: "rgb(68, 92, 135)", text: "#c6d8ff" },
  boots: { background: "rgb(34, 45, 66)", border: "rgb(70, 90, 133)", text: "#b8cbff" },
  gloves: { background: "rgb(26, 51, 46)", border: "rgb(57, 106, 97)", text: "#87e2cf" },
  ring: { background: "rgb(52, 42, 78)", border: "rgb(92, 77, 141)", text: "#d8ccff" },
  ring2: { background: "rgb(58, 46, 84)", border: "rgb(103, 86, 152)", text: "#e0d6ff" },
  earring: { background: "rgb(38, 48, 76)", border: "rgb(78, 99, 146)", text: "#d2e1ff" },
  consumable: { background: "rgb(26, 51, 46)", border: "rgb(57, 106, 97)", text: "#87e2cf" },
  material: { background: "rgb(48, 48, 52)", border: "rgb(88, 88, 96)", text: "#ddd3c5" },
};

const cardStyle: CSSProperties = {
  borderRadius: "16px",
  padding: "12px",
  background: "rgb(24,21,18)",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 14px 28px rgba(0,0,0,0.28)",
  display: "grid",
  gap: "12px",
  opacity: 1,
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
              {item.description ? (
                <div style={{ marginTop: "4px", fontSize: "12px", lineHeight: 1.45, color: "#d7cbbc" }}>
                  {item.description}
                </div>
              ) : null}
            </div>
            <ItemTag label={formatRarity(item.rarity)} palette={rarityPalette[item.rarity]} />
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {showQuantityTag ? <MutedTag label={`Quantity: ${quantity}`} /> : null}
            <MutedTag label={`Value: ${item.value}`} />
            {item.equip?.weaponClass ? <MutedTag label={formatWeaponClass(item.equip.weaponClass)} palette={itemTypePalette.weapon} /> : null}
            {!item.equip?.weaponClass && item.equip?.slot ? (
              <MutedTag label={formatEquipSlot(item.equip.slot)} palette={getSlotPalette(item.equip.slot)} />
            ) : null}
            {item.equip?.handedness ? <MutedTag label={`Hands: ${formatHandedness(item.equip.handedness)}`} /> : null}
            {item.sourceMeta?.mass ? <MutedTag label={`Mass: ${item.sourceMeta.mass}`} /> : null}
            {item.sourceMeta?.durability ? (
              <MutedTag label={`Durability: ${item.sourceMeta.durability.current}/${item.sourceMeta.durability.max}`} />
            ) : null}
          </div>
        </div>
      </div>

      {weaponPassive ? <WeaponPassiveFeature preview={weaponPassive} compact={compact} /> : null}
      {signatureSkill ? <ItemSkillFeature skill={signatureSkill} compact={compact} /> : null}

      <div style={{ display: "grid", gap: "8px" }}>
        {sections.map((section) => (
          <ItemSection key={`${section.tone}-${section.title ?? "default"}`} tone={section.tone} title={section.title} rows={section.rows} compact={compact} />
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
  title,
  rows,
  compact,
}: {
  tone: SectionTone;
  title?: string;
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
        background: resolveOpaqueSectionBackground(tone),
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
        {title ?? palette.label}
      </div>
      <div style={{ display: "grid", gap: "6px" }}>
        {rows.map((row) => {
          const factLine = !row.value;

          return (
            <div
              key={`${tone}-${row.label}`}
              style={{
                display: "flex",
                justifyContent: factLine ? "flex-start" : "space-between",
                gap: "10px",
                alignItems: factLine ? "flex-start" : "center",
              }}
            >
              <div style={{ display: "flex", alignItems: factLine ? "flex-start" : "center", gap: "7px", minWidth: 0, width: factLine ? "100%" : undefined }}>
                {row.icon ? (
                  <span
                    style={{
                      width: "18px",
                      height: "18px",
                      borderRadius: "999px",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgb(56, 52, 48)",
                      border: "1px solid rgb(78, 74, 70)",
                      flexShrink: 0,
                    }}
                  >
                    {row.icon}
                  </span>
                ) : null}
                <span
                  style={{
                    color: factLine ? palette.text : palette.accent,
                    fontSize: compact ? "11px" : "12px",
                    fontWeight: factLine ? 600 : 700,
                    lineHeight: 1.35,
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                    display: "block",
                    width: factLine ? "100%" : undefined,
                  }}
                >
                  {row.label}
                </span>
              </div>
              {row.value ? (
                <span style={{ color: palette.text, fontSize: compact ? "11px" : "12px", textAlign: "right", lineHeight: 1.25 }}>
                  {row.value}
                </span>
              ) : null}
            </div>
          );
        })}
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
        background: palette?.background ?? "rgb(48, 48, 52)",
        border: `1px solid ${palette?.border ?? "rgb(88, 88, 96)"}`,
      }}
    >
      {label}
    </span>
  );
}

function buildSections(item: Item): ItemSectionDefinition[] {
  const sourceSections = buildSourceSections(item);
  if (sourceSections.length > 0) {
    return sourceSections;
  }

  return [
    {
      tone: "offense" as const,
      title: "Offense",
      rows: [
        ...buildDamageRows(item.baseDamage),
        ...buildOffenseBonusRows(item.combatBonuses),
      ],
    },
    {
      tone: "defense" as const,
      title: "Defense",
      rows: [
        ...buildZoneArmorRows(item.baseZoneArmor ?? { head: 0, chest: 0, belly: 0, waist: 0, legs: 0 }),
        ...buildDefenseBonusRows(item.combatBonuses),
      ],
    },
    {
      tone: "attributes" as const,
      title: "Attributes",
      rows: buildAttributeRows(item.flatBonuses, item.percentBonuses),
    },
    {
      tone: "utility" as const,
      title: "Utility",
      rows: buildUtilityRows(item),
    },
  ].filter((section) => section.rows.length > 0);
}

function buildSourceSections(item: Item): ItemSectionDefinition[] {
  const source = item.sourceMeta;
  if (!source) {
    return [];
  }

  return [
    {
      tone: "offense" as const,
      title: "Properties",
      rows: source.properties?.map((line) => ({ label: line, value: "" })) ?? [],
    },
    {
      tone: "defense" as const,
      title: "Effects",
      rows: source.effects?.map((line) => ({ label: line, value: "" })) ?? [],
    },
    {
      tone: "attributes" as const,
      title: "Requirements",
      rows: source.requirements?.map((line) => ({ label: line, value: "" })) ?? [],
    },
    {
      tone: "utility" as const,
      title: "Features",
      rows: source.features?.map((line) => ({ label: line, value: "" })) ?? [],
    },
  ].filter((section) => section.rows.length > 0);
}

function buildDamageRows(profile: DamageProfile): ItemInfoRow[] {
  return getDamageTypes()
    .filter((type) => profile[type] !== 0)
    .map((type) => ({
      label: `${formatDamageType(type)} Damage`,
      value: formatRangeValue(profile[type]),
      icon: getDamageTypeIcon(type),
    }));
}

function buildZoneArmorRows(profile: ZoneArmorProfile): ItemInfoRow[] {
  return ([
    ["Head Armor", profile.head],
    ["Chest Armor", profile.chest],
    ["Belly Armor", profile.belly],
    ["Waist Armor", profile.waist],
    ["Leg Armor", profile.legs],
  ] as Array<[string, number]>)
    .filter(([, value]) => value > 0)
    .map(([label, value]) => ({
      label,
      value: formatArmorRangeValue(value),
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
        background: "rgb(58, 35, 29)",
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
            background: "rgb(86, 47, 36)",
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
        background: "rgb(27, 49, 45)",
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
            background: "rgb(35, 70, 64)",
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
  const entries = getDamageTypes()
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
    case "shirt":
    case "bracers":
    case "belt":
    case "pants":
    case "boots":
    case "gloves":
    case "ring":
    case "earring":
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

function resolveOpaqueSectionBackground(tone: SectionTone) {
  switch (tone) {
    case "offense":
      return "rgb(47, 30, 28)";
    case "defense":
      return "rgb(25, 34, 47)";
    case "attributes":
      return "rgb(46, 39, 25)";
    case "utility":
      return "rgb(22, 40, 37)";
  }
}

function getSlotPalette(slot: NonNullable<Item["equip"]>["slot"]): TagTone {
  switch (slot) {
    case "mainHand":
      return itemTypePalette.weapon;
    case "offHand":
      return itemTypePalette.shield;
    case "helmet":
      return itemTypePalette.helmet;
    case "shirt":
      return itemTypePalette.shirt;
    case "armor":
      return itemTypePalette.armor;
    case "bracers":
      return itemTypePalette.bracers;
    case "belt":
      return itemTypePalette.belt;
    case "pants":
      return itemTypePalette.pants;
    case "boots":
      return itemTypePalette.boots;
    case "gloves":
      return itemTypePalette.gloves;
    case "ring":
      return itemTypePalette.ring;
    case "ring2":
      return itemTypePalette.ring2;
    case "earring":
      return itemTypePalette.earring;
  }
}
