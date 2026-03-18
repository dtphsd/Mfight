import type { CombatSkill } from "@/modules/combat/model/CombatSkill";
import { armorRange, damageRange } from "@/modules/combat/services/combatFormulas";
import type { DamageType, Item } from "@/modules/inventory";

const damageTypes: DamageType[] = ["slash", "pierce", "blunt", "chop"];

export function getDamageTypes() {
  return damageTypes;
}

export function formatConsumableUsageMode(usageMode: NonNullable<Item["consumableEffect"]>["usageMode"]) {
  switch (usageMode) {
    case "replace_attack":
      return "Separate Action";
    case "with_attack":
      return "With Attack";
  }
}

export function formatEquipSlot(slot: NonNullable<Item["equip"]>["slot"]) {
  switch (slot) {
    case "mainHand":
      return "Main Hand";
    case "offHand":
      return "Off Hand";
    case "helmet":
      return "Helmet";
    case "shirt":
      return "Shirt";
    case "armor":
      return "Armor";
    case "bracers":
      return "Bracers";
    case "belt":
      return "Belt";
    case "pants":
      return "Pants";
    case "boots":
      return "Boots";
    case "gloves":
      return "Gloves";
    case "ring":
      return "Ring";
    case "ring2":
      return "Ring II";
    case "earring":
      return "Earring";
  }
}

export function formatWeaponClass(weaponClass: NonNullable<NonNullable<Item["equip"]>["weaponClass"]>) {
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

export function formatHandedness(handedness: NonNullable<NonNullable<Item["equip"]>["handedness"]>) {
  switch (handedness) {
    case "one_hand":
      return "One-Handed";
    case "two_hand":
      return "Two-Handed";
    case "off_hand_only":
      return "Off-Hand Only";
  }
}

export function formatRarity(rarity: Item["rarity"]) {
  return rarity.charAt(0).toUpperCase() + rarity.slice(1);
}

export function formatStatName(stat: string) {
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

export function formatDamageType(type: DamageType) {
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

export function formatSignedValue(value: number) {
  return value > 0 ? `+${value}` : `${value}`;
}

export function formatRangeValue(value: number) {
  const range = damageRange(value);
  return `${range.min}-${range.max}`;
}

export function formatArmorRangeValue(value: number) {
  const range = armorRange(value);
  return `${range.min}-${range.max}`;
}

export function formatResourceLabel(resourceType: CombatSkill["resourceType"]) {
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

export function buildSkillFeatureTags(skill: CombatSkill) {
  const tags = [`Damage x${skill.damageMultiplier.toFixed(2)}`];

  if (skill.roles?.length) {
    tags.push(...skill.roles.map((role) => formatSkillRole(role)));
  }

  if (skill.preferredZones?.length) {
    tags.push(`Zones: ${skill.preferredZones.map((zone) => formatZoneLabel(zone)).join(" / ")}`);
  }

  if (skill.critChanceBonus > 0) {
    tags.push(`Crit +${skill.critChanceBonus}%`);
  }

  if (typeof skill.cooldownTurns === "number") {
    tags.push(`CD ${skill.cooldownTurns}T`);
  }

  if (typeof skill.requirements?.minLevel === "number") {
    tags.push(`Lv ${skill.requirements.minLevel}+`);
  }

  if (skill.unlock?.kind === "book") {
    tags.push(skill.unlock.sourceName ? `Book: ${skill.unlock.sourceName}` : "Book Skill");
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

function formatSkillRole(role: NonNullable<CombatSkill["roles"]>[number]) {
  switch (role) {
    case "setup":
      return "Setup";
    case "payoff":
      return "Payoff";
    case "counter":
      return "Counter";
    case "tempo":
      return "Tempo";
    case "sustain":
      return "Sustain";
    case "control":
      return "Control";
  }
}

function formatZoneLabel(zone: NonNullable<CombatSkill["preferredZones"]>[number]) {
  switch (zone) {
    case "head":
      return "Head";
    case "chest":
      return "Chest";
    case "belly":
      return "Belly";
    case "waist":
      return "Waist";
    case "legs":
      return "Legs";
  }
}

export function getDamageTypeIcon(type: DamageType) {
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

export function ShieldGlyph({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M12 3 6 5.5v5.2c0 4.2 2.3 7.2 6 9.3 3.7-2.1 6-5.1 6-9.3V5.5L12 3Z" fill="#81baff" stroke="#eff7ff" strokeWidth="1.1" />
    </svg>
  );
}

export function CritGlyph({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M12 4c2.8 4.4 5 6.8 5 9.4a5 5 0 1 1-10 0C7 10.8 9.2 8.4 12 4Z" fill="#ff8d98" stroke="#ffe8ec" strokeWidth="1.1" />
    </svg>
  );
}

export function BootsGlyph({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M8 5h4v6c0 1.5 1.2 2.7 2.7 2.7H19V16H5v-2.5L8 12V5Z" fill="#d8bb96" stroke="#fff0da" strokeWidth="1.1" />
    </svg>
  );
}

export function StatsGlyph({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M12 4 18 8v8l-6 4-6-4V8l6-4Z" fill="#dbc16d" stroke="#fff4cd" strokeWidth="1.1" />
      <path d="M12 7v10M8.5 10l7 4" stroke="#7e6322" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function SwordGlyph({ size }: { size: number }) {
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

export function AxeGlyph({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M14 4c4 0 6 3 6 5s-1 3-4 4c-2 .7-3 2-4 4l-2-2c1.4-2.2 1.8-4.2.8-6.6C10 6 11.5 4 14 4Z" fill="#dfe6ed" stroke="#fff7ef" strokeWidth="1.1" />
      <path d="M8 6 13 19" stroke="#c99964" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
