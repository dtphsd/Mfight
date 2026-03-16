import type { EquipmentSlot } from "@/modules/equipment";
import type { Item } from "@/modules/inventory";

export function formatSlot(slot: EquipmentSlot) {
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

export function createPaperDollPlaceholderItem(slot: EquipmentSlot): Item {
  return {
    id: `paper-doll-${slot}`,
    code: `paper-doll-${slot}`,
    name: formatSlot(slot),
    category:
      slot === "ring" || slot === "ring2" || slot === "earring"
        ? "accessory"
        : slot === "mainHand" || slot === "offHand"
          ? slot === "offHand"
            ? "shield"
            : "weapon"
          : "armor",
    type:
      slot === "mainHand"
        ? "weapon"
        : slot === "offHand"
          ? "shield"
          : slot === "helmet"
            ? "helmet"
            : slot === "shirt"
              ? "shirt"
              : slot === "armor"
                ? "armor"
                : slot === "bracers"
                  ? "bracers"
                  : slot === "belt"
                    ? "belt"
                    : slot === "pants"
                      ? "pants"
                      : slot === "boots"
                        ? "boots"
                        : slot === "gloves"
                          ? "gloves"
                          : slot === "ring"
                            ? "ring"
                            : slot === "ring2"
                              ? "ring2"
                              : slot === "earring"
                                ? "earring"
                                : "ring",
    rarity: "common",
    description: "",
    value: 0,
    stackable: false,
    maxStack: 1,
    equip: null,
    consumableEffect: null,
    baseDamage: { slash: 0, pierce: 0, blunt: 0, chop: 0 },
    baseArmor: { slash: 0, pierce: 0, blunt: 0, chop: 0 },
    baseZoneArmor: { head: 0, chest: 0, belly: 0, waist: 0, legs: 0 },
    combatBonuses: {
      critChance: 0,
      critMultiplier: 0,
      dodgeChance: 0,
      blockChance: 0,
      blockPower: 0,
      outgoingDamageFlat: { slash: 0, pierce: 0, blunt: 0, chop: 0 },
      outgoingDamagePercent: { slash: 0, pierce: 0, blunt: 0, chop: 0 },
      armorFlat: { slash: 0, pierce: 0, blunt: 0, chop: 0 },
      armorPercent: { slash: 0, pierce: 0, blunt: 0, chop: 0 },
      armorPenetrationFlat: { slash: 0, pierce: 0, blunt: 0, chop: 0 },
      armorPenetrationPercent: { slash: 0, pierce: 0, blunt: 0, chop: 0 },
    },
    skills: [],
    statBonuses: { strength: 0, agility: 0, rage: 0, endurance: 0 },
    flatBonuses: { strength: 0, agility: 0, rage: 0, endurance: 0 },
    percentBonuses: { strength: 0, agility: 0, rage: 0, endurance: 0 },
  };
}

export function InventoryGlyph({ item, slot, color }: { item: Item; slot: EquipmentSlot | null; color: string }) {
  const commonProps = {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": true,
  } as const;

  if (item.type === "consumable") {
    return (
      <svg {...commonProps}>
        <path d="M9 3h6" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M10 3v4l-4 6a5 5 0 0 0 4.2 8h3.6A5 5 0 0 0 18 13l-4-6V3" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M8.5 13.5c1.2.9 2.4 1.3 3.5 1.3 1.2 0 2.4-.4 3.5-1.3" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }

  if (item.type === "material") {
    return (
      <svg {...commonProps}>
        <path d="M12 3l7 4v10l-7 4-7-4V7l7-4Z" stroke={color} strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M5 7l7 4 7-4" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M12 11v10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (slot === "offHand" || item.type === "shield") {
    return (
      <svg {...commonProps}>
        <path d="M12 3l6 2.4V11c0 4.1-2.5 7.8-6 9-3.5-1.2-6-4.9-6-9V5.4L12 3Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M12 7v8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M9 10.2h6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (slot === "helmet" || item.type === "helmet") {
    return (
      <svg {...commonProps}>
        <path d="M6 13a6 6 0 1 1 12 0v3H6v-3Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M9 16v2.2M15 16v2.2" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
        <path d="M8.5 11.2h7" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (slot === "armor" || item.type === "armor") {
    return (
      <svg {...commonProps}>
        <path d="M9 4.5 12 6l3-1.5 3 2v4.2l-2 1.6V20H8v-7.7l-2-1.6V6.5l3-2Z" stroke={color} strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M10 8.5h4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (slot === "boots" || item.type === "boots") {
    return (
      <svg {...commonProps}>
        <path d="M8 4v7c0 1.7 1.2 3 2.8 3H14l3 2.8V19H7.5A2.5 2.5 0 0 1 5 16.5V14h3V4h0Z" stroke={color} strokeWidth="1.7" strokeLinejoin="round" />
      </svg>
    );
  }

  if (slot === "gloves" || item.type === "gloves") {
    return (
      <svg {...commonProps}>
        <path d="M8 12V6.8a1 1 0 1 1 2 0V11m0-4.6a1 1 0 1 1 2 0V11m0-3.8a1 1 0 1 1 2 0v4.2m0-2.5a1 1 0 1 1 2 0V14c0 3-1.8 5-4.8 5H10c-2.2 0-4-1.8-4-4v-4a1 1 0 1 1 2 0v1Z" stroke={color} strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (slot === "shirt" || item.type === "shirt") {
    return (
      <svg {...commonProps}>
        <path d="M8 5.5 12 7l4-1.5 3 3v3.5L16.5 14V20h-9v-6L5 12V8.5l3-3Z" stroke={color} strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M9.5 10.5h5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (slot === "bracers" || item.type === "bracers") {
    return (
      <svg {...commonProps}>
        <path d="M7 7h4v10H7zM13 7h4v10h-4z" stroke={color} strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M7 10h4M13 10h4" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  }

  if (slot === "belt" || item.type === "belt") {
    return (
      <svg {...commonProps}>
        <rect x="4" y="9" width="16" height="6" rx="2" stroke={color} strokeWidth="1.8" />
        <rect x="9" y="8" width="6" height="8" rx="1.5" stroke={color} strokeWidth="1.4" />
      </svg>
    );
  }

  if (slot === "pants" || item.type === "pants") {
    return (
      <svg {...commonProps}>
        <path d="M8 4h8l1 7-3 9h-2l-1-6-1 6H8l-3-9 1-7Z" stroke={color} strokeWidth="1.7" strokeLinejoin="round" />
      </svg>
    );
  }

  if (slot === "ring" || item.type === "ring") {
    return (
      <svg {...commonProps}>
        <circle cx="12" cy="14" r="4.5" stroke={color} strokeWidth="1.8" />
        <path d="m12 5 2 2-2 2-2-2 2-2Z" stroke={color} strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    );
  }

  if (slot === "earring" || item.type === "earring") {
    return (
      <svg {...commonProps}>
        <path d="M12 5.5a3.5 3.5 0 1 1 0 7v2.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="12" cy="18" r="2.5" stroke={color} strokeWidth="1.6" />
      </svg>
    );
  }

  if (slot === "ring2" || item.type === "ring2") {
    return (
      <svg {...commonProps}>
        <circle cx="12" cy="14" r="5" stroke={color} strokeWidth="1.8" />
        <circle cx="12" cy="14" r="2.2" stroke={color} strokeWidth="1.2" />
        <path d="m12 4 1.8 2.2L12 8l-1.8-1.8L12 4Z" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <path d="M14 4 9 9l1.8 1.8L6.5 15 9 17.5l4.2-4.3L15 15l5-5-6-6Z" stroke={color} strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M6 18l-1.5 1.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function PaperDollFigure() {
  return (
    <svg width="150" height="220" viewBox="0 0 150 220" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="75" cy="28" r="18" stroke="rgba(255,255,255,0.5)" strokeWidth="1.4" />
      <path d="M56 56c4-7 13-12 19-12s15 5 19 12l9 21-11 18 4 28H54l4-28-11-18 9-21Z" stroke="rgba(255,255,255,0.42)" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M47 78 27 107l12 11 20-24M103 78l20 29-12 11-20-24" stroke="rgba(255,255,255,0.32)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M63 124 52 192l16 10 7-45 7 45 16-10-11-68" stroke="rgba(255,255,255,0.32)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
