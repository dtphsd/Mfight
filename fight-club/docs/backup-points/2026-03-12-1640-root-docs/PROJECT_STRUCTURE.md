# PROJECT_STRUCTURE - Fight Club

> Last updated: 2026-03-12 16:40 MSK

**Project root:** `c:/Users/dtphs/.vscode/Project/fight-club`

---

## Top Level

```text
fight-club/
|-- docs/                  # Local project notes and backup points
|-- node_modules/          # Installed packages
|-- scripts/               # Helper scripts
|-- src/                   # App source
|-- tests/                 # Unit and UI tests
|-- dist/                  # Generated production build output
|-- package.json
|-- package-lock.json
|-- eslint.config.js
|-- index.html
|-- tsconfig*.json
|-- vite.config.*
|-- vitest.config.*
`-- README.md
```

Notes:

- `dist/` is generated output, never source
- `vite.config.js` / `vitest.config.js` and matching `.d.ts` files are generated beside the TypeScript sources

---

## `src/`

```text
src/
|-- app/                   # Bootstrap and providers
|-- content/               # Static game data
|-- core/                  # Technical primitives
|-- modules/               # Domain logic
|-- orchestration/         # Cross-module assembly
|-- ui/                    # React UI
|-- main.tsx
|-- styles.css
`-- styles.backup-2026-03-11-ui-polish.css
```

---

## `src/app`

- `App.tsx` - screen switcher for menu, rules, and sandbox
- `providers/AppProviders.tsx` - React provider shell
- `config/gameConfig.ts` - gameplay/save config
- `bootstrap/createGameApp.ts` - logger, RNG, storage, and app services
- `bootstrap/registerModules.ts` - bootstrap stub
- `bootstrap/wireDependencies.ts` - bootstrap stub

---

## `src/content`

- `items/starterItems.ts` - all starter weapons, armor, accessories, consumables, and materials
- `commentator/phrases.ts` - phrase pools for battle log flavor
- `combat/balance.ts` - compatibility export layer
- `hunting/zones.ts` - unfinished hunting data

Important current fact:

- `starterItems.ts` now includes item skills, timed status effects, and consumables that can also apply combat effects

---

## `src/core`

- `event-bus/` - event bus
- `ids/` - local ID generation
- `logger/` - logger contract
- `rng/` - seeded RNG
- `state/` - state store primitives
- `storage/` - save repository, localStorage adapter, schema
- `time/` - clock abstraction

Storage fact:

- persistence is still browser `localStorage`
- `saveSchema.ts` exists, but `load()` still does not validate through Zod on read

---

## `src/modules`

### `character`

- character models and stat allocation logic

### `combat`

- combat state, snapshots, zones, resources, skills, round actions, round results
- `model/CombatEffect.ts` - timed buffs/debuffs and periodic combat effects
- `application/startCombat.ts` - creates runtime combatants
- `application/resolveRound.ts` - main combat resolver
- `config/combatConfig.ts` - central combat constants and profiles
- `services/combatFormulas.ts` - raw formula helpers

Combat facts:

- combat actions are explicit typed variants
- combatants now hold active timed effects
- consumables and skills can both apply combat effects

### `inventory`

- inventory entries and quantity logic
- item model
- starter inventory creation

Current item model supports:

- `baseDamage`
- `baseArmor`
- `combatBonuses`
- `skills[]`
- `consumableEffect`

### `equipment`

- slot-based equipment
- equip / unequip
- hand rules
- equipment-derived combat bonuses and skill aggregation

### Stub modules

- `arena`
- `shop`
- `hunting`
- `commentator`

These still contain partial contracts/models/events with stub application logic.

---

## `src/orchestration`

- `startNewGame.ts` - initial game state
- `saveGame.ts` - writes through `SaveRepository`
- `combat/buildCombatSnapshot.ts` - builds final runtime snapshot
- `combat/combatSnapshot.ts` - snapshot types/helpers
- `combat/combatSandboxController.ts` - round flow orchestration
- `combat/combatSandboxMetrics.ts` - derived metrics and battle-log-driven view state
- `combat/combatSandboxSupport.ts` - loadout, preset, and reconciliation helpers
- `combat/roundDraft.ts` - pending selected action state
- `combat/combatStateMachine.ts` - combat phase transitions
- `combat/botRoundPlanner.ts` - bot round planning
- `combat/combatPressure.ts` - pressure preview helpers
- `combat/combatLoadouts.ts` - sandbox loadouts
- `combat/combatSandboxConfigs.ts` - presets and bot difficulty configs

---

## `src/ui`

### `components/combat`

- `CombatSilhouette.tsx` - silhouette, body zones, equipment slot buttons, status effects above HP
- `BattleLogPanel.tsx` - battle log UI
- `battleLogFormatting.ts` - battle log formatter
- `BuilderPopover.tsx` - build and matchup panel
- `InventoryPopover.tsx` - inventory browser
- `EquipmentSlotPopover.tsx` - slot gear manager
- `ItemPresentationCard.tsx` - full item card
- `ItemHoverPreview.tsx` - smart hover card positioning for item previews

Backup artifacts intentionally kept:

- `CombatSilhouette.backup-2026-03-11.tsx`
- `BattleLogPanel.backup-2026-03-11.tsx`
- `CombatSandboxScreen.backup-2026-03-11.tsx`
- `CombatSandboxScreen.backup-2026-03-11-ui-polish.tsx`
- `MainMenuScreen.backup-2026-03-11-ui-polish.tsx`

### `hooks`

- `useGameApp.ts` - app context access
- `useCombatSandbox.ts` - React adapter between UI and orchestration/combat runtime

### `screens`

- `MainMenu/MainMenuScreen.tsx`
- `Combat/CombatSandboxScreen.tsx`
- `CombatRules/CombatRulesScreen.tsx`

Current UI facts:

- skills are manually selected into a 5-slot loadout
- consumables come from inventory
- status effects live above HP to avoid spending extra vertical space
- hover popups for items and effects are now part of the real live UI contract

---

## Runtime Flow

1. `index.html`
2. `src/main.tsx`
3. `AppProviders`
4. `createGameApp`
5. `App.tsx`
6. chosen screen

Combat sandbox branch:

`CombatSandboxScreen`
-> `useCombatSandbox`
-> `orchestration/combat/*`
-> `modules/combat | character | inventory | equipment`
-> `content/items/starterItems.ts`

---

## Tests

Current test files cover:

- core event bus
- character
- combat
- combat formulas
- combat snapshot builder
- bot round planner
- inventory
- equipment
- combat sandbox controller
- combat sandbox metrics
- combat pressure
- combat sandbox support
- combat state machine
- round draft
- battle log formatting
- combat rules screen
- combat sandbox screen

Current status:

- `npm run build` passes
- `npm run test` passes
- `npm run lint` passes

---

## Structural Notes

- this is still one frontend project, not a monorepo
- no backend/API tree exists
- `registerModules.ts` and `wireDependencies.ts` are still scaffolding, not a full runtime graph

---

> Last updated: 2026-03-12 16:40 MSK
