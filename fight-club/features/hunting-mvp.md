# Hunting MVP

> Last updated: 2026-03-14 22:40 MSK

**Feature:** Hunting MVP  
**Status:** IN PROGRESS

---

## Зачем

Сделать модуль `hunting` отдельной "игрой в игре": автономный idle-loop с собственной прогрессией, собственной симуляцией и контролируемым экспортом наград в основную игру.

---

## Проблема

Сейчас `hunting` существует только как каркас:

- `src/modules/hunting/application/startHunt.ts`
- `src/modules/hunting/application/resolveHunt.ts`
- `src/modules/hunting/model/HuntingZone.ts`

Логики охоты, прогрессии, наград, снаряжения охотника, питомцев и UI-слоя пока нет.

---

## Root Cause

- охота изначально была заведена как будущий модуль, но не получила отдельного bounded context
- сильные модули проекта сейчас сосредоточены вокруг `combat`, `inventory`, `equipment`, `character`
- если развивать охоту без чёткой границы, она быстро смешается с основной боёвкой и сломает автономность

---

## Решение

Сделать `hunting` как отдельный доменный контекст:

- собственная hunting simulation
- собственная hunting progression
- собственные сущности охотника, питомца, охоты и наград
- controlled bridge в основной проект через `inventory` и save-state

Не использовать напрямую:

- `resolveRound.ts`
- combat resources
- combat skill runtime
- основной equipment-bonus pipeline

---

## Влияет на

- `src/modules/hunting/*`
- `src/orchestration/hunting/*`
- `src/ui/screens/Hunting/*`
- `src/content/hunting/*`
- `src/modules/inventory/*`
- `src/core/storage/*`
- `fight-club/docs/architecture/*`
- `fight-club/MASTER-PLAN.md`

---

## Статус

`IN PROGRESS`

`HUNT-001` through `HUNT-008` are effectively landed, and `HUNT-009` is now active. The hunting bounded context now has first-pass runtime contracts for:

- `HunterProfile`
- `HunterStats`
- `HuntState`
- `HuntReward`
- `HuntEncounterProfile`
- `HuntingPet`
- `HuntingTool`
- `HuntingGear`
- upgraded `HuntingZone`
- starter hunting zones in `src/content/hunting/zones.ts`
- `createHunterProfile(...)`
- `createEmptyHuntingGearLoadout()`
- deterministic `startHunt(...)`
- deterministic `resolveHunt(...)`
- `claimHuntRewards(...)`
- `addHunterExperience(...)`
- `allocateHunterStatPoint(...)`
- `equipHuntingGear(...)`
- `equipHuntingTool(...)`
- `setHuntingRouteStance(...)`
- `assignPetToHunter(...)`
- `useHuntingSandbox()`
- `loadHuntingState(...)`
- `saveHuntingState(...)`
- first module tests in `tests/modules/hunting.test.ts`
- dedicated persistence tests in `tests/modules/huntingPersistence.test.ts`
- a dedicated hunting reward item catalog in `src/content/hunting/rewardItems.ts`
- starter hunting gear and pet catalogs in `src/content/hunting/`
- a first hunting tool catalog in `src/content/hunting/tools.ts`
- a first hunting route-stance catalog in `src/content/hunting/routeStances.ts`
- a first hunting screen shell in `src/ui/screens/Hunting/HuntingScreen.tsx`

---

## Следующий шаг

Use the stabilized persistence and compact hunting UI from `HUNT-008` as the base for the next gameplay layers after `HUNT-009`, with tool focus now acting as the first real route-planning decision beyond pure gear and pet bonuses.

---

## Hunting MVP Scope

Входит в v1:

- 3 hunting zones
- автономный hunter profile
- idle/offline hunt resolution
- hunter level + exp
- 4 hunter stats
- 5 hunting gear slots
- 3 pet archetypes
- базовый loot bridge в общий inventory
- мягкий failure rule
- один основной hunting screen

Не входит в v1:

- полноценные профессии и инструменты
- durability
- крафт-миниигры
- weekly bosses
- daily quests
- social / leaderboard / trade
- monetization
- сложная talent tree
- глубокая pet evolution

---

## Hunting MVP Tasks

- `HUNT-001` - define hunting domain model and save boundaries
- `HUNT-002` - implement autonomous hunt loop and idle resolution
- `HUNT-003` - add reward bridge into shared inventory
- `HUNT-004` - implement hunter progression and base hunting stats
- `HUNT-005` - implement hunting gear and pet-lite layer
- `HUNT-006` - build first hunting UI shell and claim flow
- `HUNT-007` - document hunting architecture, verification flow, and integration rules

---

## MVP Architecture Rules

- Hunting must remain a separate bounded context.
- Main combat runtime must not be reused as the hunt resolver.
- Shared integration should happen through rewards, inventory, and save state only.
- Hunting stats must not reuse the main combat stat model directly.
- Idle progress must be deterministic and capped.
- Rewards exported into the main game must be controlled to avoid economy collapse.

---

## Current Landed Slice

Implemented hunting foundation and first progression slice across:

- `HunterProfile.ts`
- `HunterStats.ts`
- `HuntState.ts`
- `HuntReward.ts`
- `HuntEncounterProfile.ts`
- `HuntingPet.ts`
- `HuntingGear.ts`
- upgraded `HuntingZone.ts`
- `src/modules/hunting/application/startHunt.ts`
- `src/modules/hunting/application/resolveHunt.ts`
- `src/modules/hunting/application/claimHuntRewards.ts`
- `src/modules/hunting/application/addHunterExperience.ts`
- `src/modules/hunting/application/allocateHunterStatPoint.ts`
- `src/content/hunting/zones.ts`
- `src/content/hunting/rewardItems.ts`

Module exports were also updated in `src/modules/hunting/index.ts`.

The progression slice now covers:

- hunter EXP gain
- level-step progression
- stat point rewards
- stat allocation into hunting-specific stats
- zone unlock progression for `rocky-hills` and `ruined-trail`
- a verified unlock-timing fix so zones unlock at the intended hunter level threshold rather than one level early or late

The new systems slice now also covers:

- starter hunting gear catalog with autonomous hunting-only bonuses
- starter pet catalog with light passive traits by species
- gear equip flow at the profile layer
- pet assignment flow at the profile layer
- `resolveHunt(...)` support for gear speed, loot, survival, and rare-drop bonuses
- `resolveHunt(...)` support for active-pet hunt traits
- test coverage confirming a geared hunter with an active pet resolves more encounters and better rewards than a baseline hunter
- a first hunting tool catalog with focused route bonuses for wood and herbs, hide and bone, or ore and relic style routes
- profile-level tool equip flow through `equipHuntingTool(...)`
- `resolveHunt(...)` support for tool-driven hunt speed, quantity, rare-drop, and targeted-yield bonuses
- compact tool selection directly inside the hunting profile tab so the player can change route focus without leaving the lodge
- test coverage confirming that a focused tool loadout boosts matching route resources compared to a baseline hunt
- legacy hunting-save normalization so the profile tab remains safe for saves created before the tool layer existed
- regression coverage confirming that old saves without `profile.tool` still load into a valid empty tool loadout
- a second route-planning lever through `Steady`, `Greedy`, and `Cautious` hunt stances
- resolver support for stance-driven pace, safety, and payout tradeoffs
- compact stance selection in the hunting profile tab so route risk can be tuned without leaving the lodge
- test coverage confirming that greedier stances can convert route risk into heavier payouts

The new UI slice now also covers:

- a menu entry into the hunting module
- a first `HuntingScreen` route inside the app shell
- live zone selection in the UI
- a visible `start -> resolve -> claim` loop
- hunter profile summary
- pet summary
- shared inventory summary after claims
- first `useHuntingSandbox()` screen-state bridge above the hunting module runtime

The new persistence slice now also covers:

- save and load of hunting state through the shared save envelope
- merge-safe writes that preserve unrelated save branches
- restoration of profile, hunt state, inventory, pets, selected zone, and last claimed reward on reload
- dedicated persistence test coverage
- restored-session UX guidance in the hunting screen
- a clearer step-strip for the live `choose -> run -> review -> claim` route flow
- real elapsed and remaining route timers in the live hunting screen
- resolve gating so an active route can only be resolved once the saved timer is actually finished
- a stronger route console with reverse countdown bar and more game-like route-state messaging
- a mini inventory strip in the lodge snapshot area for fast resource scanning
- MMO-style loot popup feedback after claims so the reward bridge feels more alive
- a persist-backed recent route ledger so the lodge keeps a short history of claimed runs instead of only the last haul
- richer route cards with payout, threat, and loot-profile hints so zone selection is more readable and game-like
- a dedicated HUD rail for active route state, companion status, quick stash, and latest haul so the right side of the screen feels like a real game HUD
- atmospheric route icons and richer loot-preview chips so zone cards feel more like destination choices than plain data rows
- ready, resolve, and claim micro-interactions so the hunting flow feels more alive and state changes are easier to notice
- a compact-mode layout pass with fewer duplicate panels and more tooltip-driven secondary details so the lodge can sit much closer to a single-screen view
- a tabbed lower panel plus compact ledger column so route, status, and profile detail no longer need three full-height sections at once
- a more aggressive no-scroll pass with shorter copy and tighter tabbed panels so the lodge is pushed further toward a one-screen footprint
- an extra compact pass on the right-side HUD so companion and latest-haul cards consume less vertical space
- a first tool-focus gameplay layer with route-specific yield bonuses and compact tool selection in the profile tab

Verification:

- `npm run test -- tests/modules/hunting.test.ts`
- `npm run build`

---

## Save Boundary Draft

Recommended save keys:

- `state.hunting.profile`
- `state.hunting.huntState`
- `state.hunting.pets`
- `state.hunting.meta`

Purpose:

- keep hunting isolated from combat save shape
- allow the reward bridge to update shared inventory only on claim
- avoid leaking combat-specific runtime data into hunting state
