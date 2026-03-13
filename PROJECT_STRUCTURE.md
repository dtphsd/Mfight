# PROJECT_STRUCTURE - Fight Club

> Last updated: 2026-03-14 00:53 MSK

**Project root:** `c:/Users/dtphs/.vscode/Project`

---

## Top Level

Repo root helper files:

- `RULES.md` - root documentation rules and safe-change workflow
- `PROJECT-INFO.md` - current repo-level reality and workflow notes
- `PROJECT_STRUCTURE.md` - current documented structure and key files
- `push-git.ps1` - short repo command for staging, committing, and pushing the current repo state
- `publish-github.ps1` - underlying publish helper used by `push-git.ps1`
- `start-fight-club-dev.ps1` - local dev launcher for the Vite app

Main app tree:

```text
fight-club/
|-- features/              # Feature-level task and change tracking docs
|-- MASTER-PLAN.md         # Global master plan for active tasks and sprint history
|-- docs/                  # Local project notes, backup points, and balance artifacts
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
- `docs/balance/` stores generated preset matchup reports
- `docs/backup-points/` now stores both documentation markers and restorable UI baseline snapshots
- `docs/README.md` is the GitBook-style documentation landing page
- `docs/index.md` is the VitePress landing page
- `features/` stores per-feature tracking docs used together with `MASTER-PLAN.md`

---

## Planning Docs

- `MASTER-PLAN.md` - project-wide task tracker with statuses and sprint history
- `features/_TEMPLATE.md` - base template for feature tracking files
- `features/ui-ux-refactor.md` - current tracked refactor thread for UI / UX audit and planning
- `features/combat-design-reference.md` - tracked combat-system documentation and safety workstream
- `docs/README.md` - docs home page for GitBook-style navigation
- `docs/SUMMARY.md` - GitBook navigation tree for the primary documentation flow
- `docs/gitbook-publish-setup.md` - operational guide for connecting and validating GitBook publishing
- `docs/.vitepress/config.mts` - VitePress static-site configuration
- `docs/.vitepress/theme/` - VitePress theme entry and custom site styling
- `docs/index.md` - VitePress root page
- `docs/gameplay/index.md` - gameplay-oriented entry point for balance and player-facing combat behavior
- `docs/systems/index.md` - systems-oriented entry point for runtime boundaries, refactors, and engineering workflow
- `docs/architecture/README.md` - architecture section landing page
- `docs/architecture/index.md` - VitePress architecture landing page
- `docs/decisions/README.md` - architecture decisions landing page
- `docs/decisions/index.md` - VitePress decisions landing page
- `docs/architecture/combat-design-reference.md` - live combat-system reference based on the current runtime

---

## `scripts/`

- `generate-module.mjs` - helper generator for new module scaffolding
- `run-build-matrix.cjs` - standalone balance runner with sandbox-style stat-budget parity for the right-side preset
- `run-build-matrix.ts` - TypeScript helper version of the same balance matrix logic

---

## Repo Root Helpers

- `push-git.ps1` - repo-level command wrapper for the standard git push workflow
- `publish-github.ps1` - repo-level publish helper that runs `git add -A`, `git commit -m`, and `git push origin <current-branch>`
- `start-fight-club-dev.ps1` - repo-level PowerShell launcher for local development

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
- `config/combatWeaponPassives.ts` - weapon-class passive definitions and preview helpers
- `services/combatFormulas.ts` - raw formula helpers

Combat facts:

- combat actions are explicit typed variants
- combatants now hold active timed effects
- active effects can now stack up to per-effect caps
- consumables and skills can both apply combat effects
- weapon classes can apply passive effects on hit or crit

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

Current preset fact:

- `combatSandboxConfigs.ts` now holds 7 curated build presets with recommended skill panels and consumables
- `combatSandboxSupport.ts` now clips bot stat allocations to the current player allocation budget in sandbox flow

---

## `src/ui`

### `components/combat`

- `CombatSilhouette.tsx` - silhouette, body zones, equipment slot buttons, status effects above HP
- `BattleLogPanel.tsx` - battle log UI
- `battleLogFormatting.ts` - battle log formatter
- `BuilderPopover.tsx` - build and matchup panel
- `BuildPresetsPopover.tsx` - dedicated curated build browser and preset applier
- `InventoryPopover.tsx` - inventory browser
- `EquipmentSlotPopover.tsx` - slot gear manager
- `ItemPresentationCard.tsx` - full item card with prominent `Weapon Passive` and `Signature Skill` blocks
- `ItemHoverPreview.tsx` - smart hover card positioning for item previews

### `components/shared`

- `ActionButton.tsx` - shared pill-button primitive for combat modal actions
- `ModalOverlay.tsx` - shared close-backdrop and positioning shell for modal popovers
- `ModalSurface.tsx` - shared elevated modal container with default visual treatment
- `PanelCard.tsx` - shared bordered panel surface for compact metric and summary cards
- `ItemPreviewPopover.tsx` - shared item-preview shell built on top of preview surface and tag primitives
- `PreviewSurface.tsx` - shared hover-preview and anchored item-preview shell
- `PreviewTag.tsx` - shared compact tag used inside preview headers

Backup artifacts intentionally kept:

- `CombatSilhouette.backup-2026-03-11.tsx`
- `BattleLogPanel.backup-2026-03-11.tsx`
- `CombatSandboxScreen.backup-2026-03-11.tsx`
- `CombatSandboxScreen.backup-2026-03-11-ui-polish.tsx`
- `MainMenuScreen.backup-2026-03-11-ui-polish.tsx`

### `hooks`

- `useGameApp.ts` - app context access
- `useCombatSandbox.ts` - React adapter between UI and orchestration/combat runtime
- `useAnchoredPopup.ts` - shared viewport-aware popup positioning for hover previews and anchored equipment popovers

### `screens`

- `MainMenu/MainMenuScreen.tsx`
- `Combat/CombatSandboxScreen.tsx`
- `CombatRules/CombatRulesScreen.tsx`
- `CombatRules/combatRulesContent.ts` - localized Combat Codex content
- `CombatRules/combatRulesFacts.ts` - generated item/skill facts from live starter content

Current UI facts:

- skills are manually selected into a 5-slot loadout
- consumables come from inventory
- status effects live above HP to avoid spending extra vertical space
- hover popups for items and effects are now part of the real live UI contract
- item cards and preset equipment previews surface weapon passives and key item skills as primary feature blocks
- `src/ui/components/shared/` now exists as the first extracted UI-foundation layer for `UI-002`
- `src/ui/hooks/useAnchoredPopup.ts` is the first shared infrastructure piece for `UI-004`
- preview chrome and preview item shell are now unified through `PreviewSurface.tsx`, `PreviewTag.tsx`, and `ItemPreviewPopover.tsx`

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
- `npm run balance:matrix` writes current matchup artifacts to `docs/balance/`

---

## Structural Notes

- this is still one frontend project, not a monorepo
- no backend/API tree exists
- `registerModules.ts` and `wireDependencies.ts` are still scaffolding, not a full runtime graph

---

> Last updated: 2026-03-14 00:53 MSK
