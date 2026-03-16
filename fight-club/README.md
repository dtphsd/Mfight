# Fight Club

Browser-only combat sandbox built with React, TypeScript, and Vite.

Last updated: 2026-03-16

## Current State

The project is no longer a minimal skeleton.

It now includes:

- live `Combat Sandbox`
- live `Hunting Lodge`
- generated Battle Kings combat items
- zone-based armor and defended-zone weighting
- random damage and armor ranges
- roll-based block reduction in the `40-70%` band
- cooldown-aware combat skills
- item-driven combat effects, passives, and consumables
- local docs site with architecture, systems, gameplay, and balance references

## Main Commands

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run test`
- `npm run lint`
- `npm run docs:validate`
- `npm run balance:matrix`
- `npm run baza:parse`
- `npm run baza:generate-items`

## Runtime Shape

- `src/core`
  - shared technical primitives
- `src/modules`
  - headless gameplay domains such as combat, inventory, equipment, hunting, and profile
- `src/content`
  - static and generated gameplay data
- `src/orchestration`
  - cross-module runtime assembly for combat and hunting flows
- `src/ui`
  - React screens, hooks, and presentational components
- `docs`
  - repo-native documentation, architecture references, and balance artifacts
- `BazaBK`
  - local Battle Kings source pages, item images, parsed catalogs, and generation inputs

## Combat Sandbox

The live combat flow supports:

- manual attack zone and two defense zones
- 7 curated build presets
- manual 5-slot skill loadout selection
- MMO-style inventory with bag grid and paper-doll equipment
- silhouette equipment previews
- consumables in combat flow
- battle log, status effects, and combat impact overlays

Current curated presets:

- `Sword / Bleed`
- `Shield / Guard`
- `Dagger / Crit`
- `Mace / Control`
- `Axe / Pressure`
- `Heavy / Two-Hand`
- `Sustain / Regen`

## Combat Runtime Facts

- initiative is driven by `agility`
- combat uses typed damage profiles:
  - `slash`
  - `pierce`
  - `blunt`
  - `chop`
- defended hits use:
  - zone armor
  - penetration
  - roll-based block reduction
- crit multiplier now scales from both `Rage` and `Endurance`
- combatants now track skill cooldown state
- penetration has its own `PIERCE` impact feedback lane

## Item And Data Pipeline

The active starter combat pool now comes from local Battle Kings source data.

Workflow:

1. normalize / collect source pages inside `BazaBK/`
2. parse them with `npm run baza:parse`
3. generate live starter items with `npm run baza:generate-items`
4. consume them through `src/content/items/starterItems.ts`

Important files:

- `BazaBK/README.md`
- `scripts/parse-bazakbk-pages.mjs`
- `scripts/generate-bazakbk-starter-items.mjs`
- `src/content/items/generatedBattleKingsStarterItems.ts`

## Docs And Source Of Truth

Start here:

- `docs/README.md`
- `docs/gameplay/index.md`
- `docs/systems/index.md`
- `docs/architecture/combat-design-reference.md`

Rules:

- code is the source of truth
- if combat behavior changes, update docs in the same pass
- if Battle Kings source data changes, rerun parse and generation before calling the state final

## Verification

Current regular checks:

- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run docs:validate`
- `npm run balance:matrix`

For item-pool changes also run:

- `npm run baza:parse`
- `npm run baza:generate-items`
