import type { Item } from "@/modules/inventory/model/Item";

export const starterItems: Array<{ item: Item; quantity: number }> = [
  {
    item: {
      id: "bk-item-6",
      code: "bk-item-6",
      name: "Молодой Меч",
      category: "weapon",
      type: "weapon",
      rarity: "common",
      description: "Урон: 2 - 7",
      value: 8,
      stackable: false,
      maxStack: 1,
      equip: {
        slot: "mainHand",
        handedness: "one_hand",
        weaponClass: "sword"
      },
      baseDamage: {
        slash: 5,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseArmor: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseZoneArmor: {
        head: 0,
        chest: 0,
        belly: 0,
        waist: 0,
        legs: 0
      },
      combatBonuses: {
        critChance: 0,
        critMultiplier: 0,
        dodgeChance: 0,
        blockChance: 0,
        blockPower: 0,
        outgoingDamageFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        outgoingDamagePercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        }
      },
      statBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      flatBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      percentBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      sourceMeta: {
        mass: 8,
        durability: {
          current: 0,
          max: 50
        },
        requirements: [
          "Уровень: 1",
          "Сила: 4",
          "Выносливость: 4",
          "Мастерство владения мечами: 1"
        ],
        effects: [
          "Мф. против критического удара (%): +5"
        ],
        properties: [
          "Урон: 2 - 7",
          "Минимальный урон: +2",
          "Максимальный урон: +7",
          "Второе оружие"
        ],
        features: [
          "Колющие атаки: Малы",
          "Рубящие атаки: Малы",
          "Дробящие атаки: Редки",
          "Режущие атаки: Временами"
        ],
        imageFileName: "sword97.gif",
        imageSrc: "https://img.battlekings.club/i/items/sword97.gif"
      }
    },
    quantity: 1
  },
  {
    item: {
      id: "bk-item-7",
      code: "bk-item-7",
      name: "Меч Ученика",
      category: "weapon",
      type: "weapon",
      rarity: "common",
      description: "Урон: 4 - 9",
      value: 11,
      stackable: false,
      maxStack: 1,
      equip: {
        slot: "mainHand",
        handedness: "one_hand",
        weaponClass: "sword"
      },
      baseDamage: {
        slash: 7,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseArmor: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseZoneArmor: {
        head: 0,
        chest: 0,
        belly: 0,
        waist: 0,
        legs: 0
      },
      combatBonuses: {
        critChance: 0,
        critMultiplier: 0,
        dodgeChance: 0,
        blockChance: 0,
        blockPower: 0,
        outgoingDamageFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        outgoingDamagePercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        }
      },
      statBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      flatBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      percentBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      sourceMeta: {
        mass: 6,
        durability: {
          current: 0,
          max: 20
        },
        requirements: [
          "Уровень: 1",
          "Сила: 4",
          "Выносливость: 4",
          "Мастерство владения мечами: 1"
        ],
        effects: [],
        properties: [
          "Урон: 4 - 9",
          "Минимальный урон: +4",
          "Максимальный урон: +9"
        ],
        features: [
          "Колющие атаки: Малы",
          "Рубящие атаки: Малы",
          "Дробящие атаки: Редки",
          "Режущие атаки: Временами"
        ],
        imageFileName: "sword53.gif",
        imageSrc: "https://img.battlekings.club/i/items/sword53.gif"
      }
    },
    quantity: 1
  },
  {
    item: {
      id: "bk-item-833",
      code: "bk-item-833",
      name: "Sword of Truth",
      category: "weapon",
      type: "weapon",
      rarity: "common",
      description: "Урон: 3 - 7",
      value: 11,
      stackable: false,
      maxStack: 1,
      equip: {
        slot: "mainHand",
        handedness: "one_hand",
        weaponClass: "sword"
      },
      baseDamage: {
        slash: 5,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseArmor: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseZoneArmor: {
        head: 0,
        chest: 0,
        belly: 0,
        waist: 0,
        legs: 0
      },
      combatBonuses: {
        critChance: 0,
        critMultiplier: 0,
        dodgeChance: 0,
        blockChance: 0,
        blockPower: 0,
        outgoingDamageFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        outgoingDamagePercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        }
      },
      statBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      flatBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      percentBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      sourceMeta: {
        mass: 5,
        durability: {
          current: 0,
          max: 20
        },
        requirements: [
          "Уровень: 1",
          "Сила: 4",
          "Выносливость: 4",
          "Мастерство владения мечами: 1"
        ],
        effects: [],
        properties: [
          "Урон: 3 - 7",
          "Минимальный урон: +3",
          "Максимальный урон: +7",
          "Мф. критического удара (%): +15",
          "Мф. против увертывания (%): +10"
        ],
        features: [
          "Колющие атаки: Малы",
          "Рубящие атаки: Временами",
          "Дробящие атаки: Редки",
          "Режущие атаки: Малы"
        ],
        imageFileName: "sword200.gif",
        imageSrc: "https://img.battlekings.club/i/items/sword200.gif"
      }
    },
    quantity: 1
  },
  {
    item: {
      id: "bk-item-4126",
      code: "bk-item-4126",
      name: "Короткий готический меч",
      category: "weapon",
      type: "weapon",
      rarity: "common",
      description: "",
      value: 10,
      stackable: false,
      maxStack: 1,
      equip: {
        slot: "mainHand",
        handedness: "one_hand",
        weaponClass: "sword"
      },
      baseDamage: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseArmor: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseZoneArmor: {
        head: 0,
        chest: 0,
        belly: 0,
        waist: 0,
        legs: 0
      },
      combatBonuses: {
        critChance: 0,
        critMultiplier: 0,
        dodgeChance: 0,
        blockChance: 0,
        blockPower: 0,
        outgoingDamageFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        outgoingDamagePercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        }
      },
      statBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      flatBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      percentBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      sourceMeta: {
        mass: 3,
        durability: {
          current: 0,
          max: 30
        },
        requirements: [
          "Уровень: 1",
          "Сила: 8",
          "Выносливость: 7"
        ],
        effects: [
          "Минимальный урон: +4",
          "Максимальный урон: +8"
        ],
        properties: [],
        features: [
          "Режущие атаки: Всегда"
        ],
        imageFileName: "sword2.gif",
        imageSrc: "https://img.battlekings.club/i/items/old/sword2.gif"
      }
    },
    quantity: 1
  },
  {
    item: {
      id: "bk-item-206",
      code: "bk-item-206",
      name: "Меч Безумного Богатыря",
      category: "weapon",
      type: "weapon",
      rarity: "common",
      description: "Урон: 5 - 9",
      value: 20,
      stackable: false,
      maxStack: 1,
      equip: {
        slot: "mainHand",
        handedness: "one_hand",
        weaponClass: "sword"
      },
      baseDamage: {
        slash: 7,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseArmor: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseZoneArmor: {
        head: 0,
        chest: 0,
        belly: 0,
        waist: 0,
        legs: 0
      },
      combatBonuses: {
        critChance: 0,
        critMultiplier: 0,
        dodgeChance: 0,
        blockChance: 0,
        blockPower: 0,
        outgoingDamageFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        outgoingDamagePercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        }
      },
      statBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      flatBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      percentBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      sourceMeta: {
        mass: 6,
        durability: {
          current: 0,
          max: 50
        },
        requirements: [
          "Уровень: 2",
          "Сила: 7",
          "Ловкость: 9",
          "Интуиция: 7",
          "Выносливость: 7",
          "Мастерство владения мечами: 2"
        ],
        effects: [
          "Мф. против критического удара (%): -10",
          "Мф. увертывания (%): -5"
        ],
        properties: [
          "Урон: 5 - 9",
          "Минимальный урон: +5",
          "Максимальный урон: +9",
          "Мф. критического удара (%): +28",
          "Второе оружие"
        ],
        features: [
          "Колющие атаки: Малы",
          "Рубящие атаки: Малы",
          "Дробящие атаки: Редки",
          "Режущие атаки: Временами"
        ],
        imageFileName: "sword75.gif",
        imageSrc: "https://img.battlekings.club/i/items/sword75.gif"
      }
    },
    quantity: 1
  },
  {
    item: {
      id: "bk-item-103",
      code: "bk-item-103",
      name: "Нож Довольных",
      category: "weapon",
      type: "weapon",
      rarity: "common",
      description: "Урон: 1 - 5",
      value: 5,
      stackable: false,
      maxStack: 1,
      equip: {
        slot: "mainHand",
        handedness: "one_hand",
        weaponClass: "dagger"
      },
      baseDamage: {
        slash: 0,
        pierce: 3,
        blunt: 0,
        chop: 0
      },
      baseArmor: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseZoneArmor: {
        head: 0,
        chest: 0,
        belly: 0,
        waist: 0,
        legs: 0
      },
      combatBonuses: {
        critChance: 0,
        critMultiplier: 0,
        dodgeChance: 0,
        blockChance: 0,
        blockPower: 0,
        outgoingDamageFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        outgoingDamagePercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        }
      },
      statBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      flatBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      percentBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      sourceMeta: {
        mass: 1,
        durability: {
          current: 0,
          max: 20
        },
        requirements: [
          "Уровень: 1",
          "Сила: 5",
          "Интуиция: 2",
          "Выносливость: 4",
          "Мастерство владения ножами, кинжалами: 1"
        ],
        effects: [],
        properties: [
          "Урон: 1 - 5",
          "Минимальный урон: +1",
          "Максимальный урон: +5",
          "Мф. критического удара (%): +3",
          "Второе оружие"
        ],
        features: [
          "Колющие атаки: Малы",
          "Рубящие атаки: Редки",
          "Дробящие атаки: Ничтожно редки",
          "Режущие атаки: Временами"
        ],
        imageFileName: "knife63.gif",
        imageSrc: "https://img.battlekings.club/i/items/knife63.gif"
      }
    },
    quantity: 1
  },
  {
    item: {
      id: "bk-item-104",
      code: "bk-item-104",
      name: "Сломанный Нож",
      category: "weapon",
      type: "weapon",
      rarity: "common",
      description: "Урон: 1 - 5",
      value: 6,
      stackable: false,
      maxStack: 1,
      equip: {
        slot: "mainHand",
        handedness: "one_hand",
        weaponClass: "dagger"
      },
      baseDamage: {
        slash: 0,
        pierce: 3,
        blunt: 0,
        chop: 0
      },
      baseArmor: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseZoneArmor: {
        head: 0,
        chest: 0,
        belly: 0,
        waist: 0,
        legs: 0
      },
      combatBonuses: {
        critChance: 0,
        critMultiplier: 0,
        dodgeChance: 0,
        blockChance: 0,
        blockPower: 0,
        outgoingDamageFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        outgoingDamagePercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        }
      },
      statBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      flatBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      percentBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      sourceMeta: {
        mass: 3,
        durability: {
          current: 0,
          max: 30
        },
        requirements: [
          "Уровень: 1",
          "Сила: 4",
          "Ловкость: 2",
          "Выносливость: 4",
          "Мастерство владения ножами, кинжалами: 1"
        ],
        effects: [
          "Уровень жизни (HP): +3"
        ],
        properties: [
          "Урон: 1 - 5",
          "Минимальный урон: +1",
          "Максимальный урон: +5",
          "Второе оружие"
        ],
        features: [
          "Колющие атаки: Временами",
          "Рубящие атаки: Редки",
          "Дробящие атаки: Ничтожно редки",
          "Режущие атаки: Временами"
        ],
        imageFileName: "knife59.gif",
        imageSrc: "https://img.battlekings.club/i/items/knife59.gif"
      }
    },
    quantity: 1
  },
  {
    item: {
      id: "bk-item-600",
      code: "bk-item-600",
      name: "Battle Knife",
      category: "weapon",
      type: "weapon",
      rarity: "common",
      description: "Урон: 1 - 6",
      value: 4,
      stackable: false,
      maxStack: 1,
      equip: {
        slot: "mainHand",
        handedness: "one_hand",
        weaponClass: "dagger"
      },
      baseDamage: {
        slash: 0,
        pierce: 4,
        blunt: 0,
        chop: 0
      },
      baseArmor: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseZoneArmor: {
        head: 0,
        chest: 0,
        belly: 0,
        waist: 0,
        legs: 0
      },
      combatBonuses: {
        critChance: 0,
        critMultiplier: 0,
        dodgeChance: 0,
        blockChance: 0,
        blockPower: 0,
        outgoingDamageFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        outgoingDamagePercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationPercent: {
          slash: 0,
          pierce: 5,
          blunt: 0,
          chop: 0
        }
      },
      statBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      flatBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      percentBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      sourceMeta: {
        mass: 5,
        durability: {
          current: 0,
          max: 20
        },
        requirements: [
          "Уровень: 1",
          "Сила: 3",
          "Ловкость: 4",
          "Интуиция: 4",
          "Выносливость: 3",
          "Мастерство владения ножами, кинжалами: 2"
        ],
        effects: [
          "Мф. против увертывания (%): +5"
        ],
        properties: [
          "Урон: 1 - 6",
          "Минимальный урон: +1",
          "Максимальный урон: +6",
          "Второе оружие"
        ],
        features: [
          "Колющие атаки: Малы",
          "Рубящие атаки: Редки",
          "Режущие атаки: Временами"
        ],
        imageFileName: "knife200.gif",
        imageSrc: "https://img.battlekings.club/i/items/knife200.gif"
      }
    },
    quantity: 1
  },
  {
    item: {
      id: "bk-item-4058",
      code: "bk-item-4058",
      name: "Кастет -Когти медведя-",
      category: "weapon",
      type: "weapon",
      rarity: "common",
      description: "",
      value: 3,
      stackable: false,
      maxStack: 1,
      equip: {
        slot: "mainHand",
        handedness: "one_hand",
        weaponClass: "dagger"
      },
      baseDamage: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseArmor: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseZoneArmor: {
        head: 0,
        chest: 0,
        belly: 0,
        waist: 0,
        legs: 0
      },
      combatBonuses: {
        critChance: 0,
        critMultiplier: 0,
        dodgeChance: 0,
        blockChance: 0,
        blockPower: 0,
        outgoingDamageFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        outgoingDamagePercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        }
      },
      statBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      flatBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      percentBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      sourceMeta: {
        mass: 2,
        durability: {
          current: 0,
          max: 20
        },
        requirements: [
          "Уровень: 1",
          "Сила: 4",
          "Ловкость: 4"
        ],
        effects: [],
        properties: [
          "Минимальный урон: +2",
          "Максимальный урон: +4"
        ],
        features: [
          "Колющие атаки: Всегда"
        ],
        imageFileName: "kastet2.gif",
        imageSrc: "https://img.battlekings.club/i/items/old/kastet2.gif"
      }
    },
    quantity: 1
  },
  {
    item: {
      id: "bk-item-4059",
      code: "bk-item-4059",
      name: "Нож -Убийцы-",
      category: "weapon",
      type: "weapon",
      rarity: "common",
      description: "",
      value: 3,
      stackable: false,
      maxStack: 1,
      equip: {
        slot: "mainHand",
        handedness: "one_hand",
        weaponClass: "dagger"
      },
      baseDamage: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseArmor: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseZoneArmor: {
        head: 0,
        chest: 0,
        belly: 0,
        waist: 0,
        legs: 0
      },
      combatBonuses: {
        critChance: 0,
        critMultiplier: 0,
        dodgeChance: 0,
        blockChance: 0,
        blockPower: 0,
        outgoingDamageFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        outgoingDamagePercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        }
      },
      statBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      flatBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      percentBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      sourceMeta: {
        mass: 2,
        durability: {
          current: 0,
          max: 20
        },
        requirements: [
          "Уровень: 1",
          "Сила: 4",
          "Ловкость: 5"
        ],
        effects: [
          "Минимальный урон: +1",
          "Максимальный урон: +5"
        ],
        properties: [],
        features: [
          "Колющие атаки: Всегда"
        ],
        imageFileName: "knife2.gif",
        imageSrc: "https://img.battlekings.club/i/items/old/knife2.gif"
      }
    },
    quantity: 1
  },
  {
    item: {
      id: "bk-item-139",
      code: "bk-item-139",
      name: "Дубина",
      category: "weapon",
      type: "weapon",
      rarity: "common",
      description: "Урон: 2 - 9",
      value: 7,
      stackable: false,
      maxStack: 1,
      equip: {
        slot: "mainHand",
        handedness: "one_hand",
        weaponClass: "mace"
      },
      baseDamage: {
        slash: 0,
        pierce: 0,
        blunt: 6,
        chop: 0
      },
      baseArmor: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseZoneArmor: {
        head: 0,
        chest: 0,
        belly: 0,
        waist: 0,
        legs: 0
      },
      combatBonuses: {
        critChance: 0,
        critMultiplier: 0,
        dodgeChance: 0,
        blockChance: 0,
        blockPower: 0,
        outgoingDamageFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        outgoingDamagePercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        }
      },
      statBonuses: {
        strength: 0,
        agility: -1,
        rage: 0,
        endurance: 0
      },
      flatBonuses: {
        strength: 0,
        agility: -1,
        rage: 0,
        endurance: 0
      },
      percentBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      sourceMeta: {
        mass: 12,
        durability: {
          current: 0,
          max: 20
        },
        requirements: [
          "Уровень: 1",
          "Сила: 5",
          "Ловкость: 5",
          "Выносливость: 5",
          "Мастерство владения дубинами, молотами: 1"
        ],
        effects: [
          "Ловкость: -1"
        ],
        properties: [
          "Урон: 2 - 9",
          "Минимальный урон: +2",
          "Максимальный урон: +9"
        ],
        features: [
          "Колющие атаки: Редки",
          "Дробящие атаки: Часты"
        ],
        imageFileName: "dubina1.gif",
        imageSrc: "https://img.battlekings.club/i/items/dubina1.gif"
      }
    },
    quantity: 1
  },
  {
    item: {
      id: "bk-item-140",
      code: "bk-item-140",
      name: "Шипованная Дубина",
      category: "weapon",
      type: "weapon",
      rarity: "common",
      description: "Урон: 1 - 12",
      value: 11,
      stackable: false,
      maxStack: 1,
      equip: {
        slot: "mainHand",
        handedness: "one_hand",
        weaponClass: "mace"
      },
      baseDamage: {
        slash: 0,
        pierce: 0,
        blunt: 7,
        chop: 0
      },
      baseArmor: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseZoneArmor: {
        head: 0,
        chest: 0,
        belly: 0,
        waist: 0,
        legs: 0
      },
      combatBonuses: {
        critChance: 0,
        critMultiplier: 0,
        dodgeChance: 0,
        blockChance: 0,
        blockPower: 0,
        outgoingDamageFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        outgoingDamagePercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        }
      },
      statBonuses: {
        strength: 0,
        agility: -1,
        rage: 0,
        endurance: 0
      },
      flatBonuses: {
        strength: 0,
        agility: -1,
        rage: 0,
        endurance: 0
      },
      percentBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      sourceMeta: {
        mass: 11,
        durability: {
          current: 0,
          max: 20
        },
        requirements: [
          "Уровень: 1",
          "Сила: 6",
          "Ловкость: 6",
          "Выносливость: 6",
          "Мастерство владения дубинами, молотами: 1"
        ],
        effects: [
          "Ловкость: -1"
        ],
        properties: [
          "Урон: 1 - 12",
          "Минимальный урон: +1",
          "Максимальный урон: +12"
        ],
        features: [
          "Колющие атаки: Редки",
          "Дробящие атаки: Часты"
        ],
        imageFileName: "dubina2.gif",
        imageSrc: "https://img.battlekings.club/i/items/dubina2.gif"
      }
    },
    quantity: 1
  },
  {
    item: {
      id: "bk-item-824",
      code: "bk-item-824",
      name: "Wooden Club",
      category: "weapon",
      type: "weapon",
      rarity: "common",
      description: "Урон: 2 - 9",
      value: 15,
      stackable: false,
      maxStack: 1,
      equip: {
        slot: "mainHand",
        handedness: "one_hand",
        weaponClass: "mace"
      },
      baseDamage: {
        slash: 0,
        pierce: 0,
        blunt: 6,
        chop: 0
      },
      baseArmor: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseZoneArmor: {
        head: 0,
        chest: 0,
        belly: 0,
        waist: 0,
        legs: 0
      },
      combatBonuses: {
        critChance: 0,
        critMultiplier: 0,
        dodgeChance: 0,
        blockChance: 0,
        blockPower: 0,
        outgoingDamageFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        outgoingDamagePercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        }
      },
      statBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      flatBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      percentBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      sourceMeta: {
        mass: 3,
        durability: {
          current: 0,
          max: 10
        },
        requirements: [
          "Уровень: 1",
          "Сила: 5",
          "Ловкость: 5",
          "Выносливость: 5",
          "Мастерство владения дубинами, молотами: 1"
        ],
        effects: [],
        properties: [
          "Урон: 2 - 9",
          "Минимальный урон: +2",
          "Максимальный урон: +9",
          "Мф. критического удара (%): +15",
          "Мф. мощности дробящего урона: +2"
        ],
        features: [
          "Рубящие атаки: Редки",
          "Дробящие атаки: Часты"
        ],
        imageFileName: "mace202.gif",
        imageSrc: "https://img.battlekings.club/i/items/mace202.gif"
      }
    },
    quantity: 1
  },
  {
    item: {
      id: "bk-item-4096",
      code: "bk-item-4096",
      name: "Дубина",
      category: "weapon",
      type: "weapon",
      rarity: "common",
      description: "",
      value: 10,
      stackable: false,
      maxStack: 1,
      equip: {
        slot: "mainHand",
        handedness: "one_hand",
        weaponClass: "mace"
      },
      baseDamage: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseArmor: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseZoneArmor: {
        head: 0,
        chest: 0,
        belly: 0,
        waist: 0,
        legs: 0
      },
      combatBonuses: {
        critChance: 0,
        critMultiplier: 0,
        dodgeChance: 0,
        blockChance: 0,
        blockPower: 0,
        outgoingDamageFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        outgoingDamagePercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        }
      },
      statBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      flatBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      percentBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      sourceMeta: {
        mass: 4,
        durability: {
          current: 0,
          max: 20
        },
        requirements: [
          "Уровень: 1",
          "Сила: 5",
          "Ловкость: 5",
          "Выносливость: 5"
        ],
        effects: [
          "Минимальный урон: +1",
          "Максимальный урон: +9"
        ],
        properties: [],
        features: [
          "Дробящие атаки: Всегда"
        ],
        imageFileName: "dubina1.gif",
        imageSrc: "https://img.battlekings.club/i/items/old/dubina1.gif"
      }
    },
    quantity: 1
  },
  {
    item: {
      id: "bk-item-4098",
      code: "bk-item-4098",
      name: "Шипованная Дубина",
      category: "weapon",
      type: "weapon",
      rarity: "common",
      description: "",
      value: 11,
      stackable: false,
      maxStack: 1,
      equip: {
        slot: "mainHand",
        handedness: "one_hand",
        weaponClass: "mace"
      },
      baseDamage: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseArmor: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseZoneArmor: {
        head: 0,
        chest: 0,
        belly: 0,
        waist: 0,
        legs: 0
      },
      combatBonuses: {
        critChance: 0,
        critMultiplier: 0,
        dodgeChance: 0,
        blockChance: 0,
        blockPower: 0,
        outgoingDamageFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        outgoingDamagePercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        }
      },
      statBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      flatBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      percentBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      sourceMeta: {
        mass: 12,
        durability: {
          current: 0,
          max: 20
        },
        requirements: [
          "Уровень: 1",
          "Сила: 6",
          "Ловкость: 6",
          "Выносливость: 6"
        ],
        effects: [
          "Минимальный урон: +1",
          "Максимальный урон: +12"
        ],
        properties: [],
        features: [
          "Дробящие атаки: Всегда"
        ],
        imageFileName: "dubina2.gif",
        imageSrc: "https://img.battlekings.club/i/items/old/dubina2.gif"
      }
    },
    quantity: 1
  },
  {
    item: {
      id: "bk-item-115",
      code: "bk-item-115",
      name: "Красочный Топор",
      category: "weapon",
      type: "weapon",
      rarity: "common",
      description: "Урон: 3 - 5",
      value: 5,
      stackable: false,
      maxStack: 1,
      equip: {
        slot: "mainHand",
        handedness: "one_hand",
        weaponClass: "axe"
      },
      baseDamage: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 4
      },
      baseArmor: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseZoneArmor: {
        head: 0,
        chest: 0,
        belly: 0,
        waist: 0,
        legs: 0
      },
      combatBonuses: {
        critChance: 0,
        critMultiplier: 0,
        dodgeChance: 0,
        blockChance: 0,
        blockPower: 0,
        outgoingDamageFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        outgoingDamagePercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        }
      },
      statBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      flatBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      percentBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      sourceMeta: {
        mass: 5,
        durability: {
          current: 0,
          max: 50
        },
        requirements: [
          "Уровень: 1",
          "Сила: 4",
          "Ловкость: 4",
          "Выносливость: 4",
          "Мастерство владения топорами, секирами: 1"
        ],
        effects: [],
        properties: [
          "Урон: 3 - 5",
          "Минимальный урон: +3",
          "Максимальный урон: +5",
          "Второе оружие"
        ],
        features: [
          "Колющие атаки: Редки",
          "Рубящие атаки: Временами",
          "Дробящие атаки: Редки",
          "Режущие атаки: Ничтожно редки"
        ],
        imageFileName: "axe50.gif",
        imageSrc: "https://img.battlekings.club/i/items/axe50.gif"
      }
    },
    quantity: 1
  },
  {
    item: {
      id: "bk-item-116",
      code: "bk-item-116",
      name: "Церемониальный Топор",
      category: "weapon",
      type: "weapon",
      rarity: "common",
      description: "Урон: 3 - 5",
      value: 8,
      stackable: false,
      maxStack: 1,
      equip: {
        slot: "mainHand",
        handedness: "one_hand",
        weaponClass: "axe"
      },
      baseDamage: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 4
      },
      baseArmor: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseZoneArmor: {
        head: 0,
        chest: 0,
        belly: 0,
        waist: 0,
        legs: 0
      },
      combatBonuses: {
        critChance: 0,
        critMultiplier: 0,
        dodgeChance: 0,
        blockChance: 0,
        blockPower: 0,
        outgoingDamageFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        outgoingDamagePercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        }
      },
      statBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      flatBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      percentBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      sourceMeta: {
        mass: 6,
        durability: {
          current: 0,
          max: 50
        },
        requirements: [
          "Уровень: 1",
          "Сила: 4",
          "Ловкость: 4",
          "Выносливость: 4",
          "Мастерство владения топорами, секирами: 1"
        ],
        effects: [
          "Мф. увертывания (%): +5"
        ],
        properties: [
          "Урон: 3 - 5",
          "Минимальный урон: +3",
          "Максимальный урон: +5"
        ],
        features: [
          "Колющие атаки: Редки",
          "Рубящие атаки: Временами",
          "Дробящие атаки: Редки",
          "Режущие атаки: Ничтожно редки"
        ],
        imageFileName: "axe61.gif",
        imageSrc: "https://img.battlekings.club/i/items/axe61.gif"
      }
    },
    quantity: 1
  },
  {
    item: {
      id: "bk-item-611",
      code: "bk-item-611",
      name: "Handy Axe",
      category: "weapon",
      type: "weapon",
      rarity: "common",
      description: "Урон: 4 - 8",
      value: 13,
      stackable: false,
      maxStack: 1,
      equip: {
        slot: "mainHand",
        handedness: "one_hand",
        weaponClass: "axe"
      },
      baseDamage: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 6
      },
      baseArmor: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseZoneArmor: {
        head: 0,
        chest: 0,
        belly: 0,
        waist: 0,
        legs: 0
      },
      combatBonuses: {
        critChance: 0,
        critMultiplier: 0,
        dodgeChance: 0,
        blockChance: 0,
        blockPower: 0,
        outgoingDamageFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        outgoingDamagePercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 5
        }
      },
      statBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      flatBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      percentBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      sourceMeta: {
        mass: 5,
        durability: {
          current: 0,
          max: 20
        },
        requirements: [
          "Уровень: 1",
          "Сила: 4",
          "Ловкость: 4",
          "Выносливость: 4",
          "Мастерство владения топорами, секирами: 1"
        ],
        effects: [
          "Мф. увертывания (%): +15",
          "Мф. против увертывания (%): +5"
        ],
        properties: [
          "Урон: 4 - 8",
          "Минимальный урон: +4",
          "Максимальный урон: +8",
          "Второе оружие"
        ],
        features: [
          "Колющие атаки: Редки",
          "Рубящие атаки: Временами",
          "Дробящие атаки: Редки",
          "Режущие атаки: Ничтожно редки"
        ],
        imageFileName: "axe200.gif",
        imageSrc: "https://img.battlekings.club/i/items/axe200.gif"
      }
    },
    quantity: 1
  },
  {
    item: {
      id: "bk-item-4070",
      code: "bk-item-4070",
      name: "Церемониальный топор",
      category: "weapon",
      type: "weapon",
      rarity: "common",
      description: "",
      value: 10,
      stackable: false,
      maxStack: 1,
      equip: {
        slot: "mainHand",
        handedness: "one_hand",
        weaponClass: "axe"
      },
      baseDamage: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseArmor: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseZoneArmor: {
        head: 0,
        chest: 0,
        belly: 0,
        waist: 0,
        legs: 0
      },
      combatBonuses: {
        critChance: 0,
        critMultiplier: 0,
        dodgeChance: 0,
        blockChance: 0,
        blockPower: 0,
        outgoingDamageFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        outgoingDamagePercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        }
      },
      statBonuses: {
        strength: 0,
        agility: 1,
        rage: 0,
        endurance: 0
      },
      flatBonuses: {
        strength: 0,
        agility: 1,
        rage: 0,
        endurance: 0
      },
      percentBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      sourceMeta: {
        mass: 3,
        durability: {
          current: 0,
          max: 30
        },
        requirements: [
          "Уровень: 1",
          "Сила: 5",
          "Ловкость: 6",
          "Выносливость: 6"
        ],
        effects: [
          "Ловкость: +1",
          "Минимальный урон: +1",
          "Максимальный урон: +6"
        ],
        properties: [],
        features: [
          "Рубящие атаки: Всегда"
        ],
        imageFileName: "axe2.gif",
        imageSrc: "https://img.battlekings.club/i/items/old/axe2.gif"
      }
    },
    quantity: 1
  },
  {
    item: {
      id: "bk-item-4071",
      code: "bk-item-4071",
      name: "Столярный топор",
      category: "weapon",
      type: "weapon",
      rarity: "common",
      description: "",
      value: 13,
      stackable: false,
      maxStack: 1,
      equip: {
        slot: "mainHand",
        handedness: "one_hand",
        weaponClass: "axe"
      },
      baseDamage: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseArmor: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseZoneArmor: {
        head: 0,
        chest: 0,
        belly: 0,
        waist: 0,
        legs: 0
      },
      combatBonuses: {
        critChance: 0,
        critMultiplier: 0,
        dodgeChance: 0,
        blockChance: 0,
        blockPower: 0,
        outgoingDamageFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        outgoingDamagePercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        }
      },
      statBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      flatBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      percentBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      sourceMeta: {
        mass: 3,
        durability: {
          current: 0,
          max: 20
        },
        requirements: [
          "Уровень: 1",
          "Ловкость: 6",
          "Выносливость: 6"
        ],
        effects: [
          "Минимальный урон: +4",
          "Максимальный урон: +6"
        ],
        properties: [],
        features: [
          "Рубящие атаки: Всегда"
        ],
        imageFileName: "axe5.gif",
        imageSrc: "https://img.battlekings.club/i/items/old/axe5.gif"
      }
    },
    quantity: 1
  },
  {
    item: {
      id: "bk-item-366",
      code: "bk-item-366",
      name: "Кабассет",
      category: "armor",
      type: "helmet",
      rarity: "common",
      description: "Броня головы: 2-4",
      value: 7,
      stackable: false,
      maxStack: 1,
      equip: {
        slot: "helmet",
        armorClass: "helmet"
      },
      baseDamage: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseArmor: {
        slash: 3,
        pierce: 3,
        blunt: 3,
        chop: 3
      },
      baseZoneArmor: {
        head: 3,
        chest: 0,
        belly: 0,
        waist: 0,
        legs: 0
      },
      combatBonuses: {
        critChance: 0,
        critMultiplier: 0,
        dodgeChance: 0,
        blockChance: 0,
        blockPower: 0,
        outgoingDamageFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        outgoingDamagePercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        }
      },
      statBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      flatBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      percentBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      sourceMeta: {
        mass: 3,
        durability: {
          current: 0,
          max: 20
        },
        requirements: [
          "Уровень: 1",
          "Сила: 6",
          "Выносливость: 6"
        ],
        effects: [
          "Уровень жизни (HP): +6",
          "Броня головы: 2-4"
        ],
        properties: [],
        features: [],
        imageFileName: "helmet27.gif",
        imageSrc: "https://img.battlekings.club/i/items/helmet27.gif"
      }
    },
    quantity: 1
  },
  {
    item: {
      id: "bk-item-367",
      code: "bk-item-367",
      name: "Каска Новобранца",
      category: "armor",
      type: "helmet",
      rarity: "common",
      description: "Броня головы: 1-3",
      value: 7,
      stackable: false,
      maxStack: 1,
      equip: {
        slot: "helmet",
        armorClass: "helmet"
      },
      baseDamage: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseArmor: {
        slash: 2,
        pierce: 2,
        blunt: 2,
        chop: 2
      },
      baseZoneArmor: {
        head: 2,
        chest: 0,
        belly: 0,
        waist: 0,
        legs: 0
      },
      combatBonuses: {
        critChance: 3,
        critMultiplier: 0,
        dodgeChance: 0,
        blockChance: 0,
        blockPower: 0,
        outgoingDamageFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        outgoingDamagePercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        }
      },
      statBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      flatBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      percentBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      sourceMeta: {
        mass: 3,
        durability: {
          current: 0,
          max: 20
        },
        requirements: [
          "Уровень: 1",
          "Сила: 4",
          "Выносливость: 4"
        ],
        effects: [
          "Уровень жизни (HP): +3",
          "Мф. критического удара (%): +3",
          "Мф. против критического удара (%): +2",
          "Броня головы: 1-3"
        ],
        properties: [],
        features: [],
        imageFileName: "helmet31.gif",
        imageSrc: "https://img.battlekings.club/i/items/helmet31.gif"
      }
    },
    quantity: 1
  },
  {
    item: {
      id: "bk-item-368",
      code: "bk-item-368",
      name: "Крылатый Шлем",
      category: "armor",
      type: "helmet",
      rarity: "common",
      description: "Броня головы: 1-3",
      value: 7,
      stackable: false,
      maxStack: 1,
      equip: {
        slot: "helmet",
        armorClass: "helmet"
      },
      baseDamage: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseArmor: {
        slash: 2,
        pierce: 2,
        blunt: 2,
        chop: 2
      },
      baseZoneArmor: {
        head: 2,
        chest: 0,
        belly: 0,
        waist: 0,
        legs: 0
      },
      combatBonuses: {
        critChance: 0,
        critMultiplier: 0,
        dodgeChance: 0,
        blockChance: 0,
        blockPower: 0,
        outgoingDamageFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        outgoingDamagePercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        }
      },
      statBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      flatBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      percentBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      sourceMeta: {
        mass: 4,
        durability: {
          current: 0,
          max: 10
        },
        requirements: [
          "Уровень: 1",
          "Сила: 6",
          "Выносливость: 6"
        ],
        effects: [
          "Мф. против критического удара (%): +10",
          "Броня головы: 1-3"
        ],
        properties: [],
        features: [],
        imageFileName: "helmet42.gif",
        imageSrc: "https://img.battlekings.club/i/items/helmet42.gif"
      }
    },
    quantity: 1
  },
  {
    item: {
      id: "bk-item-369",
      code: "bk-item-369",
      name: "Проволочный Шлем",
      category: "armor",
      type: "helmet",
      rarity: "common",
      description: "Броня головы: 2-4",
      value: 8,
      stackable: false,
      maxStack: 1,
      equip: {
        slot: "helmet",
        armorClass: "helmet"
      },
      baseDamage: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseArmor: {
        slash: 3,
        pierce: 3,
        blunt: 3,
        chop: 3
      },
      baseZoneArmor: {
        head: 3,
        chest: 0,
        belly: 0,
        waist: 0,
        legs: 0
      },
      combatBonuses: {
        critChance: 0,
        critMultiplier: 0,
        dodgeChance: 0,
        blockChance: 0,
        blockPower: 0,
        outgoingDamageFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        outgoingDamagePercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        }
      },
      statBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      flatBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      percentBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      sourceMeta: {
        mass: 3,
        durability: {
          current: 0,
          max: 20
        },
        requirements: [
          "Уровень: 1",
          "Сила: 6",
          "Выносливость: 6"
        ],
        effects: [
          "Минимальный урон: +1",
          "Максимальный урон: +1",
          "Броня головы: 2-4"
        ],
        properties: [],
        features: [],
        imageFileName: "helmet71.gif",
        imageSrc: "https://img.battlekings.club/i/items/helmet71.gif"
      }
    },
    quantity: 1
  },
  {
    item: {
      id: "bk-item-4154",
      code: "bk-item-4154",
      name: "Рогатый шлем",
      category: "armor",
      type: "helmet",
      rarity: "common",
      description: "Броня головы: 3-3",
      value: 6,
      stackable: false,
      maxStack: 1,
      equip: {
        slot: "helmet",
        armorClass: "helmet"
      },
      baseDamage: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseArmor: {
        slash: 3,
        pierce: 3,
        blunt: 3,
        chop: 3
      },
      baseZoneArmor: {
        head: 3,
        chest: 0,
        belly: 0,
        waist: 0,
        legs: 0
      },
      combatBonuses: {
        critChance: 0,
        critMultiplier: 0,
        dodgeChance: 0,
        blockChance: 0,
        blockPower: 0,
        outgoingDamageFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        outgoingDamagePercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        }
      },
      statBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      flatBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      percentBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      sourceMeta: {
        mass: 3,
        durability: {
          current: 0,
          max: 20
        },
        requirements: [
          "Уровень: 1",
          "Сила: 6",
          "Выносливость: 6"
        ],
        effects: [
          "Уровень жизни (HP): +3",
          "Мф. против критического удара (%): +1",
          "Броня головы: 3-3"
        ],
        properties: [],
        features: [],
        imageFileName: "helmet2.gif",
        imageSrc: "https://img.battlekings.club/i/items/old/helmet2.gif"
      }
    },
    quantity: 1
  },
  {
    item: {
      id: "bk-item-268",
      code: "bk-item-268",
      name: "Перчатки Молотобойца",
      category: "armor",
      type: "gloves",
      rarity: "common",
      description: "",
      value: 10,
      stackable: false,
      maxStack: 1,
      equip: {
        slot: "gloves",
        armorClass: "gloves"
      },
      baseDamage: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseArmor: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseZoneArmor: {
        head: 0,
        chest: 0,
        belly: 0,
        waist: 0,
        legs: 0
      },
      combatBonuses: {
        critChance: 0,
        critMultiplier: 0,
        dodgeChance: 0,
        blockChance: 0,
        blockPower: 0,
        outgoingDamageFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        outgoingDamagePercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        }
      },
      statBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      flatBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      percentBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      sourceMeta: {
        mass: 2,
        durability: {
          current: 0,
          max: 20
        },
        requirements: [
          "Уровень: 1",
          "Сила: 12",
          "Ловкость: 7"
        ],
        effects: [
          "Мастерство владения дубинами, молотами: +1"
        ],
        properties: [],
        features: [],
        imageFileName: "naruchi69.gif",
        imageSrc: "https://img.battlekings.club/i/items/naruchi69.gif"
      }
    },
    quantity: 1
  },
  {
    item: {
      id: "bk-item-269",
      code: "bk-item-269",
      name: "Перчатки Разбойника",
      category: "armor",
      type: "gloves",
      rarity: "common",
      description: "",
      value: 10,
      stackable: false,
      maxStack: 1,
      equip: {
        slot: "gloves",
        armorClass: "gloves"
      },
      baseDamage: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseArmor: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseZoneArmor: {
        head: 0,
        chest: 0,
        belly: 0,
        waist: 0,
        legs: 0
      },
      combatBonuses: {
        critChance: 0,
        critMultiplier: 0,
        dodgeChance: 0,
        blockChance: 0,
        blockPower: 0,
        outgoingDamageFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        outgoingDamagePercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        }
      },
      statBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      flatBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      percentBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      sourceMeta: {
        mass: 1,
        durability: {
          current: 0,
          max: 20
        },
        requirements: [
          "Уровень: 1",
          "Сила: 7",
          "Ловкость: 10"
        ],
        effects: [
          "Мастерство владения топорами, секирами: +1"
        ],
        properties: [],
        features: [],
        imageFileName: "naruchi50.gif",
        imageSrc: "https://img.battlekings.club/i/items/naruchi50.gif"
      }
    },
    quantity: 1
  },
  {
    item: {
      id: "bk-item-270",
      code: "bk-item-270",
      name: "Перчатки Стражника",
      category: "armor",
      type: "gloves",
      rarity: "common",
      description: "",
      value: 10,
      stackable: false,
      maxStack: 1,
      equip: {
        slot: "gloves",
        armorClass: "gloves"
      },
      baseDamage: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseArmor: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseZoneArmor: {
        head: 0,
        chest: 0,
        belly: 0,
        waist: 0,
        legs: 0
      },
      combatBonuses: {
        critChance: 0,
        critMultiplier: 0,
        dodgeChance: 0,
        blockChance: 0,
        blockPower: 0,
        outgoingDamageFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        outgoingDamagePercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        }
      },
      statBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      flatBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      percentBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      sourceMeta: {
        mass: 2,
        durability: {
          current: 0,
          max: 20
        },
        requirements: [
          "Уровень: 1",
          "Сила: 8",
          "Ловкость: 8"
        ],
        effects: [
          "Мастерство владения мечами: +1"
        ],
        properties: [],
        features: [],
        imageFileName: "naruchi52.gif",
        imageSrc: "https://img.battlekings.club/i/items/naruchi52.gif"
      }
    },
    quantity: 1
  },
  {
    item: {
      id: "bk-item-4115",
      code: "bk-item-4115",
      name: "Перчатки крестоносца",
      category: "armor",
      type: "gloves",
      rarity: "common",
      description: "",
      value: 20,
      stackable: false,
      maxStack: 1,
      equip: {
        slot: "gloves",
        armorClass: "gloves"
      },
      baseDamage: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseArmor: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseZoneArmor: {
        head: 0,
        chest: 0,
        belly: 0,
        waist: 0,
        legs: 0
      },
      combatBonuses: {
        critChance: 0,
        critMultiplier: 0,
        dodgeChance: 0,
        blockChance: 0,
        blockPower: 0,
        outgoingDamageFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        outgoingDamagePercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        }
      },
      statBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      flatBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      percentBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      sourceMeta: {
        mass: 3,
        durability: {
          current: 0,
          max: 50
        },
        requirements: [
          "Уровень: 1"
        ],
        effects: [
          "Мастерство владения ножами, кинжалами: +1",
          "Мастерство владения топорами, секирами: +1",
          "Мастерство владения дубинами, молотами: +1",
          "Мастерство владения мечами: +1"
        ],
        properties: [],
        features: [],
        imageFileName: "naruchi1.gif",
        imageSrc: "https://img.battlekings.club/i/items/old/naruchi1.gif"
      }
    },
    quantity: 1
  },
  {
    item: {
      id: "bk-item-661",
      code: "bk-item-661",
      name: "Leather Gloves",
      category: "armor",
      type: "gloves",
      rarity: "common",
      description: "",
      value: 80,
      stackable: false,
      maxStack: 1,
      equip: {
        slot: "gloves",
        armorClass: "gloves"
      },
      baseDamage: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseArmor: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseZoneArmor: {
        head: 0,
        chest: 0,
        belly: 0,
        waist: 0,
        legs: 0
      },
      combatBonuses: {
        critChance: 0,
        critMultiplier: 0,
        dodgeChance: 0,
        blockChance: 0,
        blockPower: 0,
        outgoingDamageFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        outgoingDamagePercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        }
      },
      statBonuses: {
        strength: 0,
        agility: 1,
        rage: 0,
        endurance: 0
      },
      flatBonuses: {
        strength: 0,
        agility: 1,
        rage: 0,
        endurance: 0
      },
      percentBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      sourceMeta: {
        mass: 3,
        durability: {
          current: 0,
          max: 20
        },
        requirements: [
          "Уровень: 2",
          "Сила: 7",
          "Ловкость: 10"
        ],
        effects: [
          "Ловкость: +1",
          "Мастерство владения мечами: +1"
        ],
        properties: [],
        features: [],
        imageFileName: "gloves200.gif",
        imageSrc: "https://img.battlekings.club/i/items/gloves200.gif"
      }
    },
    quantity: 1
  },
  {
    item: {
      id: "bk-item-7526",
      code: "bk-item-7526",
      name: "Грубые наручи",
      category: "armor",
      type: "bracers",
      rarity: "common",
      description: "",
      value: 1,
      stackable: false,
      maxStack: 1,
      equip: {
        slot: "bracers",
        armorClass: "bracers"
      },
      baseDamage: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseArmor: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseZoneArmor: {
        head: 0,
        chest: 0,
        belly: 0,
        waist: 0,
        legs: 0
      },
      combatBonuses: {
        critChance: 0,
        critMultiplier: 0,
        dodgeChance: 0,
        blockChance: 0,
        blockPower: 0,
        outgoingDamageFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        outgoingDamagePercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        }
      },
      statBonuses: {
        strength: 1,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      flatBonuses: {
        strength: 1,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      percentBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      sourceMeta: {
        mass: 1,
        durability: {
          current: 0,
          max: 20
        },
        requirements: [
          "Уровень: 0"
        ],
        effects: [
          "Сила: +1",
          "Мастерство владения оружием: +1",
          "Уровень жизни (HP): +2",
          "Предметы",
          "Амуниция",
          "&middot; Костыли",
          "&middot; Эликсиры и еда",
          "Заклинания",
          "&middot; Заклинания",
          "Одежда",
          "&middot; Тяжелая броня",
          "&middot; Легкая броня",
          "&middot; Венки",
          "&middot; Наручи",
          "&middot; Обувь",
          "&middot; Перчатки",
          "&middot; Плащи",
          "&middot; Поножи",
          "&middot; Пояса",
          "&middot; Рубахи",
          "&middot; Шлемы",
          "Оружие",
          "&middot; Ёлки",
          "&middot; Дубины",
          "&middot; Кинжалы",
          "&middot; Мечи",
          "&middot; Топоры",
          "&middot; Посохи",
          "&middot; Цветы и Букеты",
          "Разное",
          "&middot; Компоненты",
          "Магические предметы",
          "->",
          "&middot; Подарки",
          "&middot; Руны",
          "&middot; Прочие предметы",
          "Щиты",
          "&middot; Щиты",
          "Ювелирные товары",
          "&middot; Кольца",
          "&middot; Ожерелья",
          "&middot; Серьги",
          "Copyright © 2026 «www.battlekings.club»",
          "/*",
          "$( document ).ready(function() {",
          "$('#libFilterName').keypress(function() {",
          "$('.libItem').show();",
          "$('.libItem').each(function () {",
          "console.log($(this).find('.itemName'));",
          "});",
          "});",
          "});",
          "/",
          "function hideshow() {",
          "document.getElementById(\"mmoves\").style.visibility = \"hidden\"",
          "}",
          "function fastshow(a, event) {",
          "var b = document.getElementById(\"mmoves\"), d = (typeof(event)!= 'undefined'? event.target: window.event.srcElement);",
          "if (a!= \"\" && b.style.visibility!= \"visible\")",
          "b.innerHTML = \"\" + a + \"\";",
          "a = (typeof(event)!= 'undefined'? event.clientY: window.event.clientY) + document.documentElement.scrollTop + document.body.scrollTop + 5;",
          "b.style.left = (typeof(event)!= 'undefined'? event.clientX: window.event.clientX) + document.documentElement.scrollLeft + document.body.scrollLeft + 10 + \"px\";",
          "b.style.top = a + \"px\";",
          "if (b.style.visibility!= \"visible\")",
          "b.style.visibility = \"visible\"",
          "}"
        ],
        properties: [],
        features: [],
        imageFileName: "naruchi200.gif",
        imageSrc: "https://img.battlekings.club/i/items/naruchi200.gif"
      }
    },
    quantity: 1
  },
  {
    item: {
      id: "bk-item-399",
      code: "bk-item-399",
      name: "Браслет Укола",
      category: "armor",
      type: "bracers",
      rarity: "common",
      description: "",
      value: 5,
      stackable: false,
      maxStack: 1,
      equip: {
        slot: "bracers",
        armorClass: "bracers"
      },
      baseDamage: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseArmor: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseZoneArmor: {
        head: 0,
        chest: 0,
        belly: 0,
        waist: 0,
        legs: 0
      },
      combatBonuses: {
        critChance: 0,
        critMultiplier: 0,
        dodgeChance: 0,
        blockChance: 0,
        blockPower: 0,
        outgoingDamageFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        outgoingDamagePercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        }
      },
      statBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      flatBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      percentBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      sourceMeta: {
        mass: 2,
        durability: {
          current: 0,
          max: 10
        },
        requirements: [
          "Уровень: 2",
          "Сила: 12",
          "Выносливость: 12"
        ],
        effects: [
          "Максимальный урон: +2"
        ],
        properties: [],
        features: [],
        imageFileName: "braslet1.gif",
        imageSrc: "https://img.battlekings.club/i/items/braslet1.gif"
      }
    },
    quantity: 1
  },
  {
    item: {
      id: "bk-item-400",
      code: "bk-item-400",
      name: "Металлический Браслет",
      category: "armor",
      type: "bracers",
      rarity: "common",
      description: "Броня головы: 1-6",
      value: 13,
      stackable: false,
      maxStack: 1,
      equip: {
        slot: "bracers",
        armorClass: "bracers"
      },
      baseDamage: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseArmor: {
        slash: 4,
        pierce: 4,
        blunt: 4,
        chop: 4
      },
      baseZoneArmor: {
        head: 4,
        chest: 4,
        belly: 6,
        waist: 4,
        legs: 4
      },
      combatBonuses: {
        critChance: 0,
        critMultiplier: 0,
        dodgeChance: 0,
        blockChance: 0,
        blockPower: 0,
        outgoingDamageFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        outgoingDamagePercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        }
      },
      statBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      flatBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      percentBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      sourceMeta: {
        mass: 1,
        durability: {
          current: 0,
          max: 30
        },
        requirements: [
          "Уровень: 2",
          "Сила: 10",
          "Выносливость: 10"
        ],
        effects: [
          "Броня головы: 1-6",
          "Броня корпуса: 1-6",
          "Броня пояса: 1-6",
          "Броня ног: 1-6"
        ],
        properties: [],
        features: [],
        imageFileName: "braslet13.gif",
        imageSrc: "https://img.battlekings.club/i/items/braslet13.gif"
      }
    },
    quantity: 1
  },
  {
    item: {
      id: "bk-item-401",
      code: "bk-item-401",
      name: "Браслет Удержания",
      category: "armor",
      type: "bracers",
      rarity: "common",
      description: "",
      value: 14,
      stackable: false,
      maxStack: 1,
      equip: {
        slot: "bracers",
        armorClass: "bracers"
      },
      baseDamage: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseArmor: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseZoneArmor: {
        head: 0,
        chest: 0,
        belly: 0,
        waist: 0,
        legs: 0
      },
      combatBonuses: {
        critChance: 0,
        critMultiplier: 0,
        dodgeChance: 0,
        blockChance: 0,
        blockPower: 0,
        outgoingDamageFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        outgoingDamagePercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        }
      },
      statBonuses: {
        strength: 1,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      flatBonuses: {
        strength: 1,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      percentBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      sourceMeta: {
        mass: 1,
        durability: {
          current: 0,
          max: 20
        },
        requirements: [
          "Уровень: 2",
          "Сила: 8",
          "Ловкость: 6",
          "Выносливость: 8"
        ],
        effects: [
          "Сила: +1",
          "Мф. против увертывания (%): +10"
        ],
        properties: [],
        features: [],
        imageFileName: "braslet20.gif",
        imageSrc: "https://img.battlekings.club/i/items/braslet20.gif"
      }
    },
    quantity: 1
  },
  {
    item: {
      id: "bk-item-586",
      code: "bk-item-586",
      name: "Wrist Bands of Strength",
      category: "armor",
      type: "bracers",
      rarity: "common",
      description: "",
      value: 19,
      stackable: false,
      maxStack: 1,
      equip: {
        slot: "bracers",
        armorClass: "bracers"
      },
      baseDamage: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseArmor: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseZoneArmor: {
        head: 0,
        chest: 0,
        belly: 0,
        waist: 0,
        legs: 0
      },
      combatBonuses: {
        critChance: 0,
        critMultiplier: 0,
        dodgeChance: 0,
        blockChance: 0,
        blockPower: 0,
        outgoingDamageFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        outgoingDamagePercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        }
      },
      statBonuses: {
        strength: 1,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      flatBonuses: {
        strength: 1,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      percentBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      sourceMeta: {
        mass: 2,
        durability: {
          current: 0,
          max: 20
        },
        requirements: [
          "Уровень: 2",
          "Сила: 9",
          "Выносливость: 9"
        ],
        effects: [
          "Сила: +1",
          "Мф. против критического удара (%): +10",
          "Мф. против увертывания (%): +15"
        ],
        properties: [],
        features: [],
        imageFileName: "naruchi200.gif",
        imageSrc: "https://img.battlekings.club/i/items/naruchi200.gif"
      }
    },
    quantity: 1
  },
  {
    item: {
      id: "bk-item-411",
      code: "bk-item-411",
      name: "Пояс Новобранца",
      category: "armor",
      type: "belt",
      rarity: "common",
      description: "Броня пояса: 2-4",
      value: 3,
      stackable: false,
      maxStack: 1,
      equip: {
        slot: "belt",
        armorClass: "belt"
      },
      baseDamage: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseArmor: {
        slash: 3,
        pierce: 3,
        blunt: 3,
        chop: 3
      },
      baseZoneArmor: {
        head: 0,
        chest: 0,
        belly: 1,
        waist: 3,
        legs: 0
      },
      combatBonuses: {
        critChance: 0,
        critMultiplier: 0,
        dodgeChance: 0,
        blockChance: 0,
        blockPower: 0,
        outgoingDamageFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        outgoingDamagePercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        }
      },
      statBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      flatBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      percentBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      sourceMeta: {
        mass: 2,
        durability: {
          current: 0,
          max: 20
        },
        requirements: [
          "Уровень: 1",
          "Сила: 4"
        ],
        effects: [
          "Броня пояса: 2-4"
        ],
        properties: [],
        features: [],
        imageFileName: "belt17.gif",
        imageSrc: "https://img.battlekings.club/i/items/belt17.gif"
      }
    },
    quantity: 1
  },
  {
    item: {
      id: "bk-item-412",
      code: "bk-item-412",
      name: "Пояс Силы",
      category: "armor",
      type: "belt",
      rarity: "common",
      description: "",
      value: 7,
      stackable: false,
      maxStack: 1,
      equip: {
        slot: "belt",
        armorClass: "belt"
      },
      baseDamage: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseArmor: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseZoneArmor: {
        head: 0,
        chest: 0,
        belly: 0,
        waist: 0,
        legs: 0
      },
      combatBonuses: {
        critChance: 0,
        critMultiplier: 0,
        dodgeChance: 0,
        blockChance: 0,
        blockPower: 0,
        outgoingDamageFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        outgoingDamagePercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        }
      },
      statBonuses: {
        strength: 1,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      flatBonuses: {
        strength: 1,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      percentBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      sourceMeta: {
        mass: 1,
        durability: {
          current: 0,
          max: 10
        },
        requirements: [
          "Уровень: 2",
          "Сила: 9",
          "Выносливость: 9"
        ],
        effects: [
          "Сила: +1"
        ],
        properties: [],
        features: [],
        imageFileName: "belt1.gif",
        imageSrc: "https://img.battlekings.club/i/items/belt1.gif"
      }
    },
    quantity: 1
  },
  {
    item: {
      id: "bk-item-413",
      code: "bk-item-413",
      name: "Широкий Пояс",
      category: "armor",
      type: "belt",
      rarity: "common",
      description: "Броня пояса: 3-8",
      value: 10,
      stackable: false,
      maxStack: 1,
      equip: {
        slot: "belt",
        armorClass: "belt"
      },
      baseDamage: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseArmor: {
        slash: 6,
        pierce: 6,
        blunt: 6,
        chop: 6
      },
      baseZoneArmor: {
        head: 0,
        chest: 0,
        belly: 3,
        waist: 6,
        legs: 0
      },
      combatBonuses: {
        critChance: 0,
        critMultiplier: 0,
        dodgeChance: 0,
        blockChance: 0,
        blockPower: 0,
        outgoingDamageFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        outgoingDamagePercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        }
      },
      statBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      flatBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      percentBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      sourceMeta: {
        mass: 2,
        durability: {
          current: 0,
          max: 20
        },
        requirements: [
          "Уровень: 2",
          "Сила: 8",
          "Выносливость: 8"
        ],
        effects: [
          "Уровень жизни (HP): +6",
          "Мф. против критического удара (%): +2",
          "Броня пояса: 3-8"
        ],
        properties: [],
        features: [],
        imageFileName: "belt16.gif",
        imageSrc: "https://img.battlekings.club/i/items/belt16.gif"
      }
    },
    quantity: 1
  },
  {
    item: {
      id: "bk-item-624",
      code: "bk-item-624",
      name: "Pure Leather Belt",
      category: "armor",
      type: "belt",
      rarity: "common",
      description: "Броня пояса: 2-4",
      value: 10,
      stackable: false,
      maxStack: 1,
      equip: {
        slot: "belt",
        armorClass: "belt"
      },
      baseDamage: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseArmor: {
        slash: 3,
        pierce: 3,
        blunt: 3,
        chop: 3
      },
      baseZoneArmor: {
        head: 0,
        chest: 0,
        belly: 1,
        waist: 3,
        legs: 0
      },
      combatBonuses: {
        critChance: 0,
        critMultiplier: 0,
        dodgeChance: 0,
        blockChance: 0,
        blockPower: 0,
        outgoingDamageFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        outgoingDamagePercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        }
      },
      statBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      flatBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      percentBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      sourceMeta: {
        mass: 1,
        durability: {
          current: 0,
          max: 20
        },
        requirements: [
          "Уровень: 2",
          "Сила: 7"
        ],
        effects: [
          "Уровень жизни (HP): +12",
          "Броня пояса: 2-4"
        ],
        properties: [],
        features: [],
        imageFileName: "belt200.gif",
        imageSrc: "https://img.battlekings.club/i/items/belt200.gif"
      }
    },
    quantity: 1
  },
  {
    item: {
      id: "bk-item-414",
      code: "bk-item-414",
      name: "Пояс Рекрута",
      category: "armor",
      type: "belt",
      rarity: "common",
      description: "Броня пояса: 4-12",
      value: 16,
      stackable: false,
      maxStack: 1,
      equip: {
        slot: "belt",
        armorClass: "belt"
      },
      baseDamage: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseArmor: {
        slash: 8,
        pierce: 8,
        blunt: 8,
        chop: 8
      },
      baseZoneArmor: {
        head: 0,
        chest: 0,
        belly: 4,
        waist: 8,
        legs: 0
      },
      combatBonuses: {
        critChance: 0,
        critMultiplier: 0,
        dodgeChance: 0,
        blockChance: 0,
        blockPower: 0,
        outgoingDamageFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        outgoingDamagePercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        }
      },
      statBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      flatBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      percentBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      sourceMeta: {
        mass: 3,
        durability: {
          current: 0,
          max: 30
        },
        requirements: [
          "Уровень: 3",
          "Сила: 12",
          "Выносливость: 12"
        ],
        effects: [
          "Уровень жизни (HP): +12",
          "Броня пояса: 4-12"
        ],
        properties: [],
        features: [],
        imageFileName: "belt19.gif",
        imageSrc: "https://img.battlekings.club/i/items/belt19.gif"
      }
    },
    quantity: 1
  },
  {
    item: {
      id: "bk-item-7525",
      code: "bk-item-7525",
      name: "Сапоги из коры",
      category: "armor",
      type: "boots",
      rarity: "common",
      description: "Броня ног: 1-1",
      value: 2,
      stackable: false,
      maxStack: 1,
      equip: {
        slot: "boots",
        armorClass: "boots"
      },
      baseDamage: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseArmor: {
        slash: 1,
        pierce: 1,
        blunt: 1,
        chop: 1
      },
      baseZoneArmor: {
        head: 0,
        chest: 0,
        belly: 0,
        waist: 0,
        legs: 1
      },
      combatBonuses: {
        critChance: 0,
        critMultiplier: 0,
        dodgeChance: 0,
        blockChance: 0,
        blockPower: 0,
        outgoingDamageFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        outgoingDamagePercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        }
      },
      statBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 1
      },
      flatBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 1
      },
      percentBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      sourceMeta: {
        mass: 1,
        durability: {
          current: 0,
          max: 40
        },
        requirements: [
          "Уровень: 0"
        ],
        effects: [
          "Выносливость: +1",
          "Мастерство владения ножами, кинжалами: +2",
          "Мастерство владения топорами, секирами: +2",
          "Мастерство владения дубинами, молотами: +2",
          "Мастерство владения мечами: +2",
          "Уровень жизни (HP): +2",
          "Броня ног: 1-1",
          "Предметы",
          "Амуниция",
          "&middot; Костыли",
          "&middot; Эликсиры и еда",
          "Заклинания",
          "&middot; Заклинания",
          "Одежда",
          "&middot; Тяжелая броня",
          "&middot; Легкая броня",
          "&middot; Венки",
          "&middot; Наручи",
          "&middot; Обувь",
          "&middot; Перчатки",
          "&middot; Плащи",
          "&middot; Поножи",
          "&middot; Пояса",
          "&middot; Рубахи",
          "&middot; Шлемы",
          "Оружие",
          "&middot; Ёлки",
          "&middot; Дубины",
          "&middot; Кинжалы",
          "&middot; Мечи",
          "&middot; Топоры",
          "&middot; Посохи",
          "&middot; Цветы и Букеты",
          "Разное",
          "&middot; Компоненты",
          "Магические предметы",
          "->",
          "&middot; Подарки",
          "&middot; Руны",
          "&middot; Прочие предметы",
          "Щиты",
          "&middot; Щиты",
          "Ювелирные товары",
          "&middot; Кольца",
          "&middot; Ожерелья",
          "&middot; Серьги",
          "Copyright © 2026 «www.battlekings.club»",
          "/*",
          "$( document ).ready(function() {",
          "$('#libFilterName').keypress(function() {",
          "$('.libItem').show();",
          "$('.libItem').each(function () {",
          "console.log($(this).find('.itemName'));",
          "});",
          "});",
          "});",
          "/",
          "function hideshow() {",
          "document.getElementById(\"mmoves\").style.visibility = \"hidden\"",
          "}",
          "function fastshow(a, event) {",
          "var b = document.getElementById(\"mmoves\"), d = (typeof(event)!= 'undefined'? event.target: window.event.srcElement);",
          "if (a!= \"\" && b.style.visibility!= \"visible\")",
          "b.innerHTML = \"\" + a + \"\";",
          "a = (typeof(event)!= 'undefined'? event.clientY: window.event.clientY) + document.documentElement.scrollTop + document.body.scrollTop + 5;",
          "b.style.left = (typeof(event)!= 'undefined'? event.clientX: window.event.clientX) + document.documentElement.scrollLeft + document.body.scrollLeft + 10 + \"px\";",
          "b.style.top = a + \"px\";",
          "if (b.style.visibility!= \"visible\")",
          "b.style.visibility = \"visible\"",
          "}"
        ],
        properties: [],
        features: [],
        imageFileName: "boots200.gif",
        imageSrc: "https://img.battlekings.club/i/items/boots200.gif"
      }
    },
    quantity: 1
  },
  {
    item: {
      id: "bk-item-739",
      code: "bk-item-739",
      name: "Biting Boots",
      category: "armor",
      type: "boots",
      rarity: "common",
      description: "Броня ног: 1-3",
      value: 10,
      stackable: false,
      maxStack: 1,
      equip: {
        slot: "boots",
        armorClass: "boots"
      },
      baseDamage: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseArmor: {
        slash: 2,
        pierce: 2,
        blunt: 2,
        chop: 2
      },
      baseZoneArmor: {
        head: 0,
        chest: 0,
        belly: 0,
        waist: 0,
        legs: 2
      },
      combatBonuses: {
        critChance: 5,
        critMultiplier: 0,
        dodgeChance: 0,
        blockChance: 0,
        blockPower: 0,
        outgoingDamageFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        outgoingDamagePercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        }
      },
      statBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      flatBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      percentBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      sourceMeta: {
        mass: 3,
        durability: {
          current: 0,
          max: 20
        },
        requirements: [
          "Уровень: 1",
          "Сила: 7",
          "Выносливость: 6"
        ],
        effects: [
          "Уровень жизни (HP): +6",
          "Мф. критического удара (%): +5",
          "Мф. против критического удара (%): +3",
          "Броня ног: 1-3"
        ],
        properties: [],
        features: [],
        imageFileName: "boots200.gif",
        imageSrc: "https://img.battlekings.club/i/items/boots200.gif"
      }
    },
    quantity: 1
  },
  {
    item: {
      id: "bk-item-4052",
      code: "bk-item-4052",
      name: "Кожаные сапоги",
      category: "armor",
      type: "boots",
      rarity: "common",
      description: "Броня ног: 3-3",
      value: 7,
      stackable: false,
      maxStack: 1,
      equip: {
        slot: "boots",
        armorClass: "boots"
      },
      baseDamage: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseArmor: {
        slash: 3,
        pierce: 3,
        blunt: 3,
        chop: 3
      },
      baseZoneArmor: {
        head: 0,
        chest: 0,
        belly: 0,
        waist: 0,
        legs: 3
      },
      combatBonuses: {
        critChance: 0,
        critMultiplier: 0,
        dodgeChance: 0,
        blockChance: 0,
        blockPower: 0,
        outgoingDamageFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        outgoingDamagePercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        }
      },
      statBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      flatBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      percentBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      sourceMeta: {
        mass: 2,
        durability: {
          current: 0,
          max: 20
        },
        requirements: [
          "Уровень: 1",
          "Сила: 6",
          "Выносливость: 6"
        ],
        effects: [
          "Уровень жизни (HP): +3",
          "Броня ног: 3-3"
        ],
        properties: [],
        features: [],
        imageFileName: "boots1.gif",
        imageSrc: "https://img.battlekings.club/i/items/old/boots1.gif"
      }
    },
    quantity: 1
  },
  {
    item: {
      id: "bk-item-257",
      code: "bk-item-257",
      name: "Зубастые Ботинки",
      category: "armor",
      type: "boots",
      rarity: "common",
      description: "Броня ног: 1-6",
      value: 24,
      stackable: false,
      maxStack: 1,
      equip: {
        slot: "boots",
        armorClass: "boots"
      },
      baseDamage: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseArmor: {
        slash: 4,
        pierce: 4,
        blunt: 4,
        chop: 4
      },
      baseZoneArmor: {
        head: 0,
        chest: 0,
        belly: 0,
        waist: 0,
        legs: 4
      },
      combatBonuses: {
        critChance: 10,
        critMultiplier: 0,
        dodgeChance: 0,
        blockChance: 0,
        blockPower: 0,
        outgoingDamageFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        outgoingDamagePercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        }
      },
      statBonuses: {
        strength: 2,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      flatBonuses: {
        strength: 2,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      percentBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      sourceMeta: {
        mass: 3,
        durability: {
          current: 0,
          max: 20
        },
        requirements: [
          "Уровень: 2",
          "Сила: 9",
          "Выносливость: 9"
        ],
        effects: [
          "Сила: +2",
          "Мф. критического удара (%): +10",
          "Броня ног: 1-6"
        ],
        properties: [],
        features: [],
        imageFileName: "boots9.gif",
        imageSrc: "https://img.battlekings.club/i/items/boots9.gif"
      }
    },
    quantity: 1
  },
  {
    item: {
      id: "bk-item-258",
      code: "bk-item-258",
      name: "Статные Ботинки",
      category: "armor",
      type: "boots",
      rarity: "common",
      description: "Броня ног: 2-7",
      value: 30,
      stackable: false,
      maxStack: 1,
      equip: {
        slot: "boots",
        armorClass: "boots"
      },
      baseDamage: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseArmor: {
        slash: 5,
        pierce: 5,
        blunt: 5,
        chop: 5
      },
      baseZoneArmor: {
        head: 0,
        chest: 0,
        belly: 0,
        waist: 0,
        legs: 5
      },
      combatBonuses: {
        critChance: 0,
        critMultiplier: 0,
        dodgeChance: 0,
        blockChance: 0,
        blockPower: 0,
        outgoingDamageFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        outgoingDamagePercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        }
      },
      statBonuses: {
        strength: 1,
        agility: 1,
        rage: 1,
        endurance: 0
      },
      flatBonuses: {
        strength: 1,
        agility: 1,
        rage: 1,
        endurance: 0
      },
      percentBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      sourceMeta: {
        mass: 5,
        durability: {
          current: 0,
          max: 20
        },
        requirements: [
          "Уровень: 2",
          "Сила: 9",
          "Выносливость: 9"
        ],
        effects: [
          "Сила: +1",
          "Ловкость: +1",
          "Интуиция: +1",
          "Уровень жизни (HP): +6",
          "Броня ног: 2-7"
        ],
        properties: [],
        features: [],
        imageFileName: "boots8.gif",
        imageSrc: "https://img.battlekings.club/i/items/boots8.gif"
      }
    },
    quantity: 1
  },
  {
    item: {
      id: "bk-item-428",
      code: "bk-item-428",
      name: "Воинские Штаны",
      category: "armor",
      type: "pants",
      rarity: "rare",
      description: "Броня пояса: 1-12",
      value: 40,
      stackable: false,
      maxStack: 1,
      equip: {
        slot: "pants",
        armorClass: "pants"
      },
      baseDamage: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseArmor: {
        slash: 7,
        pierce: 7,
        blunt: 7,
        chop: 7
      },
      baseZoneArmor: {
        head: 0,
        chest: 0,
        belly: 3,
        waist: 7,
        legs: 7
      },
      combatBonuses: {
        critChance: 5,
        critMultiplier: 0,
        dodgeChance: 0,
        blockChance: 0,
        blockPower: 0,
        outgoingDamageFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        outgoingDamagePercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        }
      },
      statBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      flatBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      percentBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      sourceMeta: {
        mass: 2,
        durability: {
          current: 0,
          max: 30
        },
        requirements: [
          "Уровень: 4",
          "Сила: 15",
          "Выносливость: 15"
        ],
        effects: [
          "Уровень жизни (HP): +27",
          "Мф. критического удара (%): +5",
          "Мф. против критического удара (%): +5",
          "Мф. увертывания (%): +5",
          "Мф. против увертывания (%): +5",
          "Броня пояса: 1-12",
          "Броня ног: 1-12"
        ],
        properties: [],
        features: [],
        imageFileName: "leg18.gif",
        imageSrc: "https://img.battlekings.club/i/items/leg18.gif"
      }
    },
    quantity: 1
  },
  {
    item: {
      id: "bk-item-4955",
      code: "bk-item-4955",
      name: "Раритетные Хоккейные Поножи",
      category: "armor",
      type: "pants",
      rarity: "rare",
      description: "",
      value: 0,
      stackable: false,
      maxStack: 1,
      equip: {
        slot: "pants",
        armorClass: "pants"
      },
      baseDamage: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseArmor: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseZoneArmor: {
        head: 0,
        chest: 0,
        belly: 0,
        waist: 0,
        legs: 0
      },
      combatBonuses: {
        critChance: 0,
        critMultiplier: 0,
        dodgeChance: 0,
        blockChance: 0,
        blockPower: 0,
        outgoingDamageFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        outgoingDamagePercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        }
      },
      statBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      flatBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      percentBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      sourceMeta: {
        mass: 3,
        durability: {
          current: 0,
          max: 50
        },
        requirements: [
          "Уровень: 4",
          "Свободные распределения:",
          "Возможных распределений: 1"
        ],
        effects: [],
        properties: [],
        features: [],
        imageFileName: "leg2008_2.gif",
        imageSrc: "https://img.battlekings.club/i/items/leg2008_2.gif"
      }
    },
    quantity: 1
  },
  {
    item: {
      id: "small-potion",
      code: "small-potion",
      name: "Small Potion",
      category: "consumable",
      type: "consumable",
      rarity: "common",
      description: "Restores health and a little focus.",
      value: 8,
      stackable: true,
      maxStack: 5,
      equip: null,
      consumableEffect: {
        usageMode: "replace_attack",
        heal: 24,
        resourceRestore: {
          focus: 8
        }
      },
      baseDamage: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseArmor: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseZoneArmor: {
        head: 0,
        chest: 0,
        belly: 0,
        waist: 0,
        legs: 0
      },
      combatBonuses: {
        critChance: 0,
        critMultiplier: 0,
        dodgeChance: 0,
        blockChance: 0,
        blockPower: 0,
        outgoingDamageFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        outgoingDamagePercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        }
      },
      statBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      flatBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      percentBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      }
    },
    quantity: 2
  },
  {
    item: {
      id: "bandage",
      code: "bandage",
      name: "Bandage",
      category: "consumable",
      type: "consumable",
      rarity: "common",
      description: "Short sustain consumable with guard restore.",
      value: 3,
      stackable: true,
      maxStack: 10,
      equip: null,
      consumableEffect: {
        usageMode: "with_attack",
        heal: 12,
        resourceRestore: {
          guard: 6
        }
      },
      baseDamage: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseArmor: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseZoneArmor: {
        head: 0,
        chest: 0,
        belly: 0,
        waist: 0,
        legs: 0
      },
      combatBonuses: {
        critChance: 0,
        critMultiplier: 0,
        dodgeChance: 0,
        blockChance: 0,
        blockPower: 0,
        outgoingDamageFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        outgoingDamagePercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        }
      },
      statBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      flatBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      percentBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      }
    },
    quantity: 3
  },
  {
    item: {
      id: "regen-potion",
      code: "regen-potion",
      name: "Regen Potion",
      category: "consumable",
      type: "consumable",
      rarity: "rare",
      description: "Regeneration over the next turns.",
      value: 14,
      stackable: true,
      maxStack: 3,
      equip: null,
      consumableEffect: {
        usageMode: "replace_attack",
        heal: 0,
        resourceRestore: {},
        effects: [
          {
            id: "regen-potion-regeneration",
            name: "Regeneration",
            description: "Restores health at the start of each turn.",
            kind: "buff",
            target: "self",
            trigger: "on_use",
            durationTurns: 3,
            periodic: {
              heal: 4
            }
          }
        ]
      },
      baseDamage: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseArmor: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseZoneArmor: {
        head: 0,
        chest: 0,
        belly: 0,
        waist: 0,
        legs: 0
      },
      combatBonuses: {
        critChance: 0,
        critMultiplier: 0,
        dodgeChance: 0,
        blockChance: 0,
        blockPower: 0,
        outgoingDamageFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        outgoingDamagePercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        }
      },
      statBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      flatBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      percentBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      }
    },
    quantity: 1
  },
  {
    item: {
      id: "arena-token",
      code: "arena-token",
      name: "Arena Token",
      category: "material",
      type: "material",
      rarity: "rare",
      description: "Arena material for future reward systems.",
      value: 5,
      stackable: true,
      maxStack: 20,
      equip: null,
      consumableEffect: null,
      baseDamage: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseArmor: {
        slash: 0,
        pierce: 0,
        blunt: 0,
        chop: 0
      },
      baseZoneArmor: {
        head: 0,
        chest: 0,
        belly: 0,
        waist: 0,
        legs: 0
      },
      combatBonuses: {
        critChance: 0,
        critMultiplier: 0,
        dodgeChance: 0,
        blockChance: 0,
        blockPower: 0,
        outgoingDamageFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        outgoingDamagePercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationFlat: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        },
        armorPenetrationPercent: {
          slash: 0,
          pierce: 0,
          blunt: 0,
          chop: 0
        }
      },
      statBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      flatBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      },
      percentBonuses: {
        strength: 0,
        agility: 0,
        rage: 0,
        endurance: 0
      }
    },
    quantity: 5
  }
];
