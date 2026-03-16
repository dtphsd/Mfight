import type { ReactNode } from "react";
import type { ActiveCombatEffect } from "@/modules/combat";
import type { EquipmentSlot } from "@/modules/equipment";

export function shortenItemName(itemName: string) {
  return itemName.length > 14 ? `${itemName.slice(0, 12)}...` : itemName;
}

export function renderEquipmentSlotIcon(slot: EquipmentSlot, size: number): ReactNode {
  switch (slot) {
    case "mainHand":
      return <SwordIcon size={size} />;
    case "offHand":
      return <ShieldIcon size={size} />;
    case "helmet":
      return <HelmetIcon size={size} />;
    case "shirt":
      return <ArmorIcon size={size} />;
    case "armor":
      return <ArmorIcon size={size} />;
    case "bracers":
      return <GlovesIcon size={size} />;
    case "belt":
      return <ArmorIcon size={size} />;
    case "pants":
      return <BootsIcon size={size} />;
    case "boots":
      return <BootsIcon size={size} />;
    case "gloves":
      return <GlovesIcon size={size} />;
    case "ring":
      return <RingIcon size={size} />;
    case "ring2":
      return <RingIcon size={size} />;
    case "earring":
      return <RingIcon size={size} />;
    default:
      return null;
  }
}

export function formatEquipmentSlotLabel(slot: EquipmentSlot) {
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
    default:
      return slot;
  }
}

export function getEffectAccent(kind: ActiveCombatEffect["kind"]) {
  if (kind === "buff") {
    return {
      ring: "rgba(92,199,178,0.3)",
      background: "linear-gradient(180deg, rgba(92,199,178,0.2), rgba(92,199,178,0.08))",
      kindBackground: "linear-gradient(180deg, rgba(92,199,178,0.22), rgba(92,199,178,0.12))",
      text: "#baf1dd",
      halo: "radial-gradient(circle, rgba(92,199,178,0.24), rgba(92,199,178,0.04) 58%, transparent 78%)",
      icon: "▲",
    };
  }

  return {
    ring: "rgba(229,115,79,0.3)",
    background: "linear-gradient(180deg, rgba(229,115,79,0.2), rgba(229,115,79,0.08))",
    kindBackground: "linear-gradient(180deg, rgba(229,115,79,0.22), rgba(229,115,79,0.12))",
    text: "#ffc4bd",
    halo: "radial-gradient(circle, rgba(229,115,79,0.24), rgba(229,115,79,0.04) 58%, transparent 78%)",
    icon: "▼",
  };
}

export function formatEffectLines(effect: ActiveCombatEffect) {
  const lines: string[] = [];

  if (effect.modifiers.critChanceBonus !== 0) {
    lines.push(`Crit ${formatSignedNumber(effect.modifiers.critChanceBonus)}%`);
  }
  if (effect.modifiers.dodgeChanceBonus !== 0) {
    lines.push(`Dodge ${formatSignedNumber(effect.modifiers.dodgeChanceBonus)}%`);
  }
  if (effect.modifiers.blockChanceBonus !== 0) {
    lines.push(`Block ${formatSignedNumber(effect.modifiers.blockChanceBonus)}%`);
  }
  if (effect.modifiers.blockPowerBonus !== 0) {
    lines.push(`Block Power ${formatSignedNumber(effect.modifiers.blockPowerBonus)}%`);
  }
  if (effect.modifiers.outgoingDamagePercent !== 0) {
    lines.push(`Outgoing Damage ${formatSignedNumber(effect.modifiers.outgoingDamagePercent)}%`);
  }
  if (effect.modifiers.incomingDamagePercent !== 0) {
    lines.push(`Incoming Damage ${formatSignedNumber(effect.modifiers.incomingDamagePercent)}%`);
  }

  lines.push(...formatSignedDamageProfile(effect.modifiers.damageFlatBonus, "Damage"));
  lines.push(...formatSignedDamageProfile(effect.modifiers.armorFlatBonus, "Armor"));
  lines.push(...formatSignedDamageProfile(effect.modifiers.armorPenetrationPercentBonus, "Pen", true));

  if (effect.periodic.heal > 0) {
    lines.push(`Tick Heal +${effect.periodic.heal} HP`);
  }
  if (effect.periodic.damage > 0) {
    lines.push(`Tick Damage ${effect.periodic.damage} HP`);
  }

  lines.push(
    ...Object.entries(effect.periodic.resourceDelta)
      .filter(([, value]) => (value ?? 0) !== 0)
      .map(([resource, value]) => `Tick ${formatTitle(resource)} ${formatSignedNumber(value ?? 0)}`)
  );

  return lines.length > 0 ? lines : ["No direct stat changes"];
}

export function getHpColor(hpPercent: number) {
  if (hpPercent > 60) {
    return { from: "#1fba4c", to: "#7bf26d" };
  }

  if (hpPercent > 30) {
    return { from: "#d1a62e", to: "#f2df72" };
  }

  return { from: "#c43b2a", to: "#ff7a60" };
}

function formatSignedDamageProfile(
  profile: ActiveCombatEffect["modifiers"]["damageFlatBonus"] | ActiveCombatEffect["modifiers"]["armorFlatBonus"] | ActiveCombatEffect["modifiers"]["armorPenetrationPercentBonus"],
  suffix: string,
  percent = false
) {
  return Object.entries(profile)
    .filter(([, value]) => value !== 0)
    .map(([type, value]) => `${formatTitle(type)} ${suffix} ${formatSignedNumber(value)}${percent ? "%" : ""}`);
}

function formatSignedNumber(value: number) {
  return value > 0 ? `+${value}` : `${value}`;
}

function formatTitle(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function SwordIcon({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M14.5 3.5 20 4l-.5 5.5-7.1 7.1-4.9-4.9 7-7.2Z" fill="#ffd79b" stroke="#fff1d8" strokeWidth="1" />
      <path d="m8 13-2.5 2.5M6.2 17.3 4.7 18.8M9.6 14.6l-1.7 1.7" stroke="#f4b35e" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M3.8 20.2 2.5 18.9l2-2 1.3 1.3-2 2Z" fill="#8a5a2e" />
    </svg>
  );
}

function HelmetIcon({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path
        d="M6 12c0-4 2.8-7 6-7s6 3 6 7v2h-2v4H8v-4H6v-2Z"
        fill="#d6dce7"
        stroke="#f6f7fb"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M9 12h6" stroke="#8a96a7" strokeWidth="1.2" />
    </svg>
  );
}

function ArmorIcon({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path
        d="m8 4 4 2 4-2 2 3-1 3v9H7v-9L6 7l2-3Z"
        fill="#b9c4d3"
        stroke="#eef3f7"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M12 6v13" stroke="#8d99aa" strokeWidth="1.2" />
    </svg>
  );
}

function GlovesIcon({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path
        d="M8 6c1 0 1.8.7 1.8 1.7V11h.7V6.8c0-.9.7-1.6 1.6-1.6s1.6.7 1.6 1.6V11h.7V8.5c0-.9.7-1.6 1.6-1.6s1.6.7 1.6 1.6v5.3c0 2.8-1.8 4.7-4.7 4.7H12c-3 0-5-2-5-5v-4.7C7 7 7.4 6 8 6Z"
        fill="#d7c8ae"
        stroke="#fff3de"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BootsIcon({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path
        d="M8 5h4v7c0 1.5 1.2 2.8 2.8 2.8H19v2.2H5v-3.2l3-1.5V5Z"
        fill="#d4b592"
        stroke="#fff0d6"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M5 17h14" stroke="#8b6544" strokeWidth="1.2" />
    </svg>
  );
}

function RingIcon({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <circle cx="12" cy="14" r="4.5" fill="none" stroke="#f0d79b" strokeWidth="2" />
      <path d="m12 4 2 3-2 2-2-2 2-3Z" fill="#7dc4ff" stroke="#d8f0ff" strokeWidth="1" />
    </svg>
  );
}

function ShieldIcon({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path
        d="M12 2 5 5v6c0 5.1 2.8 8.7 7 11 4.2-2.3 7-5.9 7-11V5l-7-3Z"
        fill="#60d7bf"
        stroke="#d9fff8"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M12 4.4v14.8" stroke="#d9fff8" strokeWidth="1.2" opacity="0.7" />
    </svg>
  );
}
