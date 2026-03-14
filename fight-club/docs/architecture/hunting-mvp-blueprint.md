# Hunting MVP Blueprint

> Last updated: 2026-03-14 18:08 MSK

## Purpose

`Hunting` should become an autonomous gameplay module: a lightweight idle-sim loop with its own progression, its own simulation rules, and a controlled reward bridge into the main game.

Core formula:

`Choose zone -> Start hunt -> Resolve idle progress -> Claim rewards -> Spend rewards -> Repeat`

---

## Current Code Reality

The original blueprint started from a scaffold, but the module is now partially live.

Current live hunting runtime includes:

- `src/modules/hunting/application/startHunt.ts`
- `src/modules/hunting/application/resolveHunt.ts`
- `src/modules/hunting/application/claimHuntRewards.ts`
- `src/modules/hunting/application/addHunterExperience.ts`
- `src/modules/hunting/application/allocateHunterStatPoint.ts`
- `src/modules/hunting/application/equipHuntingGear.ts`
- `src/modules/hunting/application/assignPetToHunter.ts`
- `src/modules/hunting/model/*`
- `src/content/hunting/*`
- `src/ui/hooks/useHuntingSandbox.ts`
- `src/ui/screens/Hunting/HuntingScreen.tsx`

Current strong reusable systems are:

- `inventory`
- `character`
- `save storage`

Current systems that should not be reused directly:

- `combat resolveRound`
- combat resources
- combat skill runtime
- main-game equipment bonus pipeline

For live implementation details and verification rules, read:

- [Hunting Runtime Reference](./hunting-runtime-reference.md)

---

## MVP Scope

### Included

- 3 zones
- autonomous hunter profile
- idle/offline hunt resolution
- hunter EXP and levels
- 4 hunting stats
- 5 hunting gear slots
- 3 pet archetypes
- reward claim flow into shared inventory
- soft failure penalty
- one main hunting screen

### Deferred

- professions and tools
- durability
- crafting mini-games
- bosses
- quests and events
- social systems
- monetization
- deep pet evolution

---

## Domain Boundaries

### Hunting owns

- hunter progression
- hunt simulation
- hunt zones
- pet progression
- hunting gear
- hunt rewards before claim

### Shared with the main game

- inventory item storage
- save container
- optionally soft currency

### Explicitly not shared

- combat runtime
- combat round actions
- combat resources
- combat stats model
- combat equipment calculation

---

## Proposed Domain Model

Create:

- `src/modules/hunting/model/HunterProfile.ts`
- `src/modules/hunting/model/HunterStats.ts`
- `src/modules/hunting/model/HuntState.ts`
- `src/modules/hunting/model/HuntReward.ts`
- `src/modules/hunting/model/HuntZone.ts`
- `src/modules/hunting/model/HuntEncounterProfile.ts`
- `src/modules/hunting/model/HuntingPet.ts`
- `src/modules/hunting/model/HuntingGear.ts`

### `HunterStats`

Recommended v1 stat model:

- `power`
- `speed`
- `survival`
- `fortune`

Reason:

- easier to balance than reusing `strength/agility/rage/endurance`
- avoids semantic conflicts with main combat
- easier to explain in a standalone hunting UI

### `HunterProfile`

Suggested fields:

- `id`
- `name`
- `level`
- `totalExperience`
- `unspentStatPoints`
- `stats`
- `equippedGear`
- `activePetId`
- `unlockedZones`

### `HuntState`

Suggested fields:

- `status`
- `zoneId`
- `startedAt`
- `lastResolvedAt`
- `durationMs`
- `encountersResolved`
- `successCount`
- `failureCount`
- `pendingReward`

### `HuntReward`

Suggested fields:

- `experience`
- `currency`
- `items`
- `petExperience`
- `summary`

---

## Application Layer

Implement:

- `startHunt.ts`
- `resolveHunt.ts`
- `cancelHunt.ts`
- `claimHuntRewards.ts`
- `levelHunterUp.ts`
- `allocateHunterStat.ts`
- `equipHuntingGear.ts`
- `assignPetToHunter.ts`

### Important rule

`resolveHunt` should resolve elapsed time in batches, not by replaying a live second-by-second combat sim.

That keeps the module:

- deterministic
- cheap to compute
- easier to test
- isolated from the main combat engine

---

## Orchestration Layer

Create:

- `src/orchestration/hunting/buildHuntSnapshot.ts`
- `src/orchestration/hunting/resolveIdleHuntSession.ts`
- `src/orchestration/hunting/huntingDerivedState.ts`
- `src/orchestration/hunting/huntingLoadouts.ts`

Purpose:

- keep React thin
- compute UI-ready derived state outside the screen
- keep the simulation and reward flow testable

---

## UI Architecture

Create:

- `src/ui/screens/Hunting/HuntingScreen.tsx`
- `src/ui/components/hunting/HuntingZonePicker.tsx`
- `src/ui/components/hunting/HuntingStatusPanel.tsx`
- `src/ui/components/hunting/HuntRewardsPanel.tsx`
- `src/ui/components/hunting/HunterProfilePanel.tsx`
- `src/ui/components/hunting/PetPanel.tsx`
- `src/ui/components/hunting/HuntingGearPanel.tsx`

### First screen layout

The first release only needs:

- zone picker
- active hunt status
- hunter summary
- pet summary
- claim rewards panel

---

## Reward Bridge

The clean bridge is:

`resolveHunt -> pending HuntReward -> claimHuntRewards -> inventory.addItem(...)`

Important:

- rewards should not drip straight into shared inventory during active hunt
- rewards should be claimed through one explicit handoff

This keeps:

- save boundaries cleaner
- reward review possible
- economy easier to reason about

---

## Economy Guardrails

For v1, hunting should export only controlled reward types:

- soft currency
- basic materials
- food
- limited consumables
- rare crafting components in small amounts
- pet eggs

Do not let hunting become the best source of everything immediately.

---

## Offline / Idle Guardrails

Without backend, hunting is trust-based.

So v1 should include:

- deterministic timestamp-based resolution
- offline progress cap
- simple anti-exploit guardrails in local logic

But it should not pretend to be cheat-proof.

---

## Suggested MVP Roadmap

### `HUNT-001`

Define:

- domain entities
- save boundaries
- reward bridge contract

### `HUNT-002`

Implement:

- start hunt
- resolve elapsed hunt
- success/failure roll
- reward summary

### `HUNT-003`

Integrate:

- reward claim into inventory
- item generation rules

### `HUNT-004`

Implement:

- hunter level
- stat allocation
- zone unlock logic

### `HUNT-005`

Implement:

- hunting gear
- pet-lite bonuses

### `HUNT-006`

Build:

- first hunting screen
- active hunt status
- claim flow

### `HUNT-007`

Document:

- architecture
- verification checklist
- integration rules

---

## Key Risks

- over-coupling hunting to main combat
- inflating shared economy too early
- introducing too many systems at once
- conflating combat stats with hunting stats
- turning hunting into a second giant project before v1 proves itself

---

## Recommended Architecture Statement

`Hunting` should be an autonomous idle-sim bounded context with its own simulation and progression, connected to the main game through shared inventory and save-state integration only.
