# PROJECT_STRUCTURE - Fight Club

> Last updated: 2026-03-22 15:12 MSK

**Project root:** `c:/Users/dtphs/.vscode/Project/fight-club`

---

## Top Level

App-root helper files:

- `RULES.md` - project documentation rules and safe-change workflow
- `PROJECT-INFO.md` - current project reality and workflow notes
- `PROJECT_STRUCTURE.md` - current documented structure and key files
- `start-fight-club-dev.ps1` - local dev launcher for the Vite app
- `start-online-pvp-quicktunnel.ps1` - one-click local PvP quick-tunnel bootstrap with launcher summary and runtime manifest output
- `start-online-pvp-quicktunnel.bat` - Windows wrapper for the quick-tunnel PvP launcher
- `stop-online-pvp-quicktunnel.ps1` - stops the local PvP quick-tunnel stack and clears runtime manifest state
- `stop-online-pvp-quicktunnel.bat` - Windows wrapper for the quick-tunnel PvP stop script
- `runtime-logs/` - launcher, backend, tunnel, and summary logs
- `project-analysis/` - prompt and helper scripts for local project audit runs

Main app tree:

```text
fight-club/
|-- Art/                   # Raw art source files for avatars and future visual assets
|-- BazaBK/                # Local Battle Kings HTML dump, images, parsed catalogs, and normalized sources
|-- TAMA_start/            # Specialist-agent journals, patch notes, workflow rules, and visualizer
|-- features/              # Feature-level task and change tracking docs
|-- MASTER-PLAN.md         # Global master plan for active tasks and sprint history
|-- RULES.md               # Project-specific documentation and safe-change rules
|-- PROJECT-INFO.md        # Current project reality and workflow notes
|-- PROJECT_STRUCTURE.md   # Current structure and key-file map
|-- SECURITY_ARCHITECTURE.md
|-- DATABASE_ARCHITECTURE.md
|-- docs/                  # Local project notes, backup points, and balance artifacts
|-- node_modules/          # Installed packages
|-- runtime-logs/          # Local launcher and tunnel logs kept inside the app folder
|-- project-analysis/      # Audit prompt, README, and helper launchers for project analysis
|-- scripts/               # Helper scripts
|-- server/                # Local online-duel HTTP authority runtime
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
- `Art/Avatars/` now stores the raw `.png` source portraits; `src/assets/combat/*.jpg` are the compressed runtime silhouettes
- `BazaBK/` now stores raw library dump, normalized pages, item images, and generated parsed JSON artifacts
- Vite and Vitest now keep the TypeScript config sources only; generated JS sidecars and `tsbuildinfo` files are not part of the tracked project structure
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
- `features/backend-agent.md` - tracked backend specialist setup and online-architecture memory surface
- `features/online-duel-1v1.md` - tracked backend-authoritative roadmap and phased implementation plan for real `1v1 online`
- `features/hunting-mvp.md` - tracked MVP scope and implementation roadmap for the autonomous hunting module
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
- `docs/architecture/hunting-mvp-blueprint.md` - original architecture blueprint for the hunting bounded context
- `docs/architecture/hunting-runtime-reference.md` - live hunting runtime reference, reward bridge map, and verification checklist

---

## `scripts/`

- `generate-module.mjs` - helper generator for new module scaffolding
- `run-build-matrix.cjs` - standalone balance runner with sandbox-style stat-budget parity for the right-side preset
- `run-build-matrix.ts` - TypeScript helper version of the same balance matrix logic
- `parse-bazakbk-pages.mjs` - parses normalized local Battle Kings HTML pages into item catalogs
- `generate-bazakbk-starter-items.mjs` - generates the live starter item pool from parsed Battle Kings data
- `generate-specialist-entry.mjs` - prints the next specialist journal / patch-note templates for combat, UI, or backend masters

---

## Parent Repo Helpers

- `../push-git.ps1` - parent-repo command wrapper for the standard git push workflow
- `../publish-github.ps1` - parent-repo publish helper that runs `git add -A`, `git commit -m`, and `git push origin <current-branch>`

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
`-- styles.css
```

---

## `src/app`

- `App.tsx` - screen switcher for menu, rules, combat, hunting, agents, admin dashboard, `PvP` lobby, and the backend-driven PvP room screen
- `providers/AppProviders.tsx` - React provider shell
- `config/gameConfig.ts` - gameplay/save config
- `bootstrap/createGameApp.ts` - logger, RNG, storage, and app services bootstrap

---

## `src/content`

- `items/starterItems.ts` - all starter weapons, armor, accessories, consumables, and materials
- `items/generatedBattleKingsStarterItems.ts` - generated Battle Kings-derived combat item catalog
- `commentator/phrases.ts` - phrase pools for battle log flavor
- `combat/balance.ts` - compatibility export layer
- `hunting/zones.ts` - live hunting zone catalog
- `hunting/rewardItems.ts` - claimable hunting reward item catalog
- `hunting/gear.ts` - starter hunting gear catalog
- `hunting/pets.ts` - starter hunting pet catalog
- `hunting/tools.ts` - starter hunting tool catalog for route-focused yield bonuses

Important current fact:

- `starterItems.ts` now re-exports the generated Battle Kings combat pool
- generated Battle Kings items now carry raw source metadata, zone-armor data, and cleaned preview text for UI cards

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

### `profile`

- local profile meta, battle record, showcase content, and lightweight mailbox helpers

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
- combatants now also hold runtime skill cooldown state
- block now uses a `40-70%` reduction roll with stronger results biased by `Endurance`
- crit multiplier now scales from both `Rage` and `Endurance`
- zone armor is now part of the real mitigation layer, not just generic per-type armor

### `inventory`

- inventory entries and quantity logic
- item model
- starter inventory creation

Current item model supports:

- `baseDamage`
- `baseArmor`
- `baseZoneArmor`
- `combatBonuses`
- `skills[]`
- `consumableEffect`

### `equipment`

- slot-based equipment
- equip / unequip
- hand rules
- equipment-derived combat bonuses and skill aggregation

### `hunting`

- autonomous hunting model, progression, reward bridge, and route resolver
- gear, tool, and pet-lite modifiers
- first module tests for start, resolve, claim, progression, and loadout bonuses

### Future and expanding modules

- `arena` - now hosts the first authority-ready `1v1 online` duel-room domain and transport contracts
- `shop`
- `commentator`

`shop` and `commentator` still remain mostly future-facing. `arena` is no longer only a stub: it now owns the first backend-safe room lifecycle layer for online duels.

### `server`

- `onlineDuelHttpServer.ts` - local HTTP authority service for online-duel messages and SSE room updates
- `onlineDuelServer.ts` - Node entrypoint used by `npm run online:server`

Current backend facts:

- the frontend now prefers this local HTTP/SSE authority runtime when it is reachable
- the UI falls back to the in-memory duel authority only when the local server is unavailable
- live verification now includes dedicated server tests and a two-client end-to-end room validation

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
- `BuildPresetsPopover.tsx` now renders those presets in a compact one-page `2 x 3` browser with avatar previews and color-zoned details
- the active preset and builder item pool now resolve against generated `bk-item-*` content instead of the removed legacy training set

---

## `src/ui`

### `components/combat`

- `CombatSilhouette.tsx` - silhouette, body zones, expanded equipment slot buttons, status effects above HP, and latched one-shot impact overlays
- `BattleLogPanel.tsx` - battle log UI
- `battleLogFormatting.ts` - battle log formatter
- `BuilderPopover.tsx` - build and matchup panel with locally extracted builder sections
- `builderPopoverTypes.ts` - shared builder popover prop and matchup types
- `BuildPresetsPopover.tsx` - dedicated curated build browser and preset applier with compact `2 x 3` layout and styled detail zones
- `InventoryPopover.tsx` - MMO-style inventory browser with tabs, bag grid, and paper-doll equipment layout
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

Backup policy:

- runtime source no longer keeps backup files inside `src/`
- restorable checkpoints belong under `docs/backup-points/`

### `hooks`

- `useGameApp.ts` - app context access
- `useCombatSandboxActions.ts` - extracted sandbox action wiring for presets, loadout changes, and round-action selection
- `useCombatSandbox.ts` - React adapter between UI and orchestration/combat runtime
- `useCombatSandboxData.ts` - extracted pure sandbox data assembly for snapshots, bot preset resolution, and available actions
- `useCombatSandboxFlow.ts` - extracted fight lifecycle wiring for start, prepare-next-round, and resolve-round transitions
- `useHuntingSandbox.ts` - React adapter for the live hunting loop and reward-claim flow
- `useAnchoredPopup.ts` - shared viewport-aware popup positioning for hover previews and anchored equipment popovers

### `screens`

- `MainMenu/MainMenuScreen.tsx`
- `Combat/CombatSandboxScreen.tsx`
- `Combat/combatSandboxScreenActionRail.tsx` - extracted action-rail and action-button UI primitives used by combat screen sections
- `Combat/combatSandboxScreenActions.tsx` - extracted combat action section wiring for skills and consumables
- `Combat/combatSandboxScreenControls.tsx` - extracted fight controls and round-advance controls
- `Combat/combatSandboxScreenHelpers.ts` - extracted formatter, icon, and visual helper layer for combat screen display logic
- `Combat/combatSandboxScreenLayout.tsx` - extracted battle-log and side-panel layout primitives
- `Combat/combatSandboxScreenPanels.tsx` - extracted player and bot side panels, equipment-slot overlay, and related panel widgets
- `Combat/combatSandboxScreenPopovers.tsx` - extracted bot build preset popover and its display-tone helpers
- `Combat/combatSandboxScreenResourceGrid.tsx` - shared combat resource meter grid used across screen sections and side panels
- `Combat/combatSandboxScreenTargeting.tsx` - extracted attack-target and defense-zone selection UI
- `CombatRules/CombatRulesScreen.tsx`
- `Hunting/HuntingScreen.tsx`
- `CombatAgent/CombatAgentScreen.tsx`
- `AdminDashboard/AdminDashboardScreen.tsx` - live operator dashboard for PvP backend health, current browser/runtime endpoints, launcher manifest sync, tunnel notes, backend override, and remote-match launch checklist
- `PvpLobby/PvpLobbyScreen.tsx` - separate `PvP` pre-match screen that reuses the player build stack before entering the backend-driven room flow
- `components/profile/ProfileModal.tsx` - local profile card with mailbox mini modal, reply flow, and direct letters
- `CombatRules/combatRulesContent.ts` - localized Combat Codex content
- `CombatRules/combatRulesFacts.ts` - generated item/skill facts from live starter content

Current UI facts:

- skills are manually selected into a 5-slot loadout
- consumables come from inventory
- hunting is now accessible from the main menu through `Hunting Lodge`
- hunting has its own live UI shell, separate from combat sandbox
- `Ecosystem Agents` now includes `Combat Master`, `UI Master`, and `Backend Master`
- `Admin Dashboard` is now accessible from the main menu for operator-facing PvP launch monitoring and tunnel-note tracking
- `PvP` is now accessible from the main menu through a separate pre-match lobby screen
- that lobby reuses the normal player-side silhouette, `Builder`, `Builds`, and `Inventory` stack before entering the room flow
- the backend-driven PvP fight screen now uses the combat-stage shell more directly instead of a separate room-dashboard layout
- the normal player-facing PvP route now centers on a combat-like `Combat Arena` stage where the second player replaces the bot-side opponent surface
- round submission now goes through an on-screen planner for attack zone plus two defense zones
- disconnect/reconnect/session reset controls are now hidden in `Debug Tools` instead of the main player flow
- the room flow now includes server-owned `Leave Room` and `Play Another Match`
- lobby-launched PvP now requires the live backend instead of falling back to a local share-code illusion when `online:server` is offline
- round-submit buttons and zone selectors now lock immediately when the local player submits an action, which reduces duplicate `already_submitted` race errors
- the screen still includes a safe timeout trigger for stale-room verification against the local authority layer
- status effects live above HP to avoid spending extra vertical space
- combat impact text and block/crit/break visuals now use one-shot pulse wiring plus fade-safe CSS so overlays do not reappear after their animation ends
- hover popups for items and effects are now part of the real live UI contract
- item cards and preset equipment previews surface weapon passives and key item skills as primary feature blocks
- `src/ui/components/shared/` now exists as the first extracted UI-foundation layer for `UI-002`
- `src/ui/hooks/useAnchoredPopup.ts` is the first shared infrastructure piece for `UI-004`
- preview chrome and preview item shell are now unified through `PreviewSurface.tsx`, `PreviewTag.tsx`, and `ItemPreviewPopover.tsx`
- silhouette impact overlays now include a dedicated `PIERCE` treatment for penetration events
- `CombatSandboxScreen.tsx` is now mostly a coordinator over extracted sibling modules rather than a single monolithic screen file

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
- hunting
- hunting persistence
- online duel arena domain
- online duel HTTP server
- live two-client online duel validation
- live PvP scenario matrix
- live PvP preset matchup smoke
- live PvP soak validation
- live PvP fuzz validation
- combat-agent progression

Current status:

- `npm run build` passes
- `npm run test` passes
- `npm run lint` passes
- `npm run docs:validate` passes
- `npm run balance:matrix` writes current matchup artifacts to `docs/balance/`
- dedicated live PvP commands now also exist:
  - `npm run test:pvp`
  - `npm run test:pvp:matrix`
  - `npm run test:pvp:soak`
  - `npm run test:pvp:fuzz`
- current coverage is `37` test files / `280` tests

---

## Structural Notes

- this is still one frontend project, not a monorepo
- the repo now also contains a small local backend tree under `server/` for the backend-driven `PvP` room flow
- bootstrap is currently minimal and direct through `createGameApp.ts`, not a full dependency-registration graph
- the online PvP screen is no longer a single monolith:
  - `OnlineDuelScreen.tsx` now delegates arena rendering, session orchestration, and debug tooling to sibling modules under `src/ui/screens/OnlineDuel/`

---

> Last updated: 2026-03-22 17:40 MSK
