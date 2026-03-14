# Hunting Runtime Reference

> Last updated: 2026-03-14 22:20 MSK

This page is the source-of-truth reference for the live `hunting` module as it exists today.

It explains what is already implemented, what the module owns, how rewards cross into the main game, and what must be verified before changing hunting logic.

---

## Purpose

`Hunting` is now a live autonomous idle-sim bounded context inside `Fight Club`.

Its job is to provide:

- a separate non-combat progression loop
- deterministic hunt resolution
- hunting-only stats, gear, and pet traits
- a controlled reward bridge into shared inventory

Core loop:

`Choose zone -> Start hunt -> Resolve completed route -> Claim rewards -> Apply hunter EXP -> Repeat`

---

## Live Scope

Currently implemented:

- 3 zones:
  - `forest-edge`
  - `rocky-hills`
  - `ruined-trail`
- autonomous hunter profile
- autonomous hunting stat model:
  - `power`
  - `speed`
  - `survival`
  - `fortune`
- deterministic `startHunt(...)`
- deterministic `resolveHunt(...)`
- explicit reward-claim handoff through `claimHuntRewards(...)`
- hunter EXP and level-step progression
- zone unlock thresholds
- hunting gear bonuses
- pet-lite passive traits
- first UI shell in `HuntingScreen.tsx`
- first tool-focus layer with targeted route-yield bonuses

Still deferred:

- professions
- tools and durability
- crafting
- bosses
- quests
- seasonal events
- deep pet evolution
- backend-backed idle validation

---

## Ownership Boundaries

### Hunting Owns

- hunter progression
- hunt session state
- hunt outcome simulation
- hunting-only gear bonuses
- hunting pet traits
- pending rewards before claim

### Shared With The Main Game

- claimed inventory items
- global save container
- app-level navigation and shell

### Explicitly Not Shared

- `resolveRound.ts`
- combat round actions
- combat resources
- combat equipment bonus pipeline
- combat stat model

Important rule:

Do not solve hunting problems by reusing the combat engine. Hunting is intentionally a separate simulation model.

---

## Runtime Files

### Domain Model

- `src/modules/hunting/model/HunterProfile.ts`
- `src/modules/hunting/model/HunterStats.ts`
- `src/modules/hunting/model/HuntState.ts`
- `src/modules/hunting/model/HuntReward.ts`
- `src/modules/hunting/model/HuntEncounterProfile.ts`
- `src/modules/hunting/model/HuntingGear.ts`
- `src/modules/hunting/model/HuntingPet.ts`
- `src/modules/hunting/model/HuntingTool.ts`
- `src/modules/hunting/model/HuntingZone.ts`

### Application Layer

- `src/modules/hunting/application/startHunt.ts`
- `src/modules/hunting/application/resolveHunt.ts`
- `src/modules/hunting/application/claimHuntRewards.ts`
- `src/modules/hunting/application/addHunterExperience.ts`
- `src/modules/hunting/application/allocateHunterStatPoint.ts`
- `src/modules/hunting/application/equipHuntingGear.ts`
- `src/modules/hunting/application/equipHuntingTool.ts`
- `src/modules/hunting/application/assignPetToHunter.ts`
- `src/modules/hunting/application/huntingPersistence.ts`

### Content Layer

- `src/content/hunting/zones.ts`
- `src/content/hunting/rewardItems.ts`
- `src/content/hunting/gear.ts`
- `src/content/hunting/pets.ts`
- `src/content/hunting/tools.ts`

### UI Layer

- `src/ui/hooks/useHuntingSandbox.ts`
- `src/ui/screens/Hunting/HuntingScreen.tsx`
- `src/app/App.tsx`
- `src/ui/screens/MainMenu/MainMenuScreen.tsx`

---

## Runtime Flow

### Start

`HuntingScreen`
-> `useHuntingSandbox`
-> `startHunt(...)`
-> `HuntState(status="hunting")`

### Resolve

`HuntingScreen`
-> `useHuntingSandbox`
-> `resolveHunt(...)`
-> `HuntState(status="claimable", pendingReward=...)`

### Claim

`HuntingScreen`
-> `useHuntingSandbox`
-> `claimHuntRewards(...)`
-> `inventory.addItem(...)`
-> `addHunterExperience(...)`
-> `HuntState(status="idle")`

Important:

Rewards only cross into shared inventory on claim.

They do not drip into shared state while the hunt is still running.

---

## Resolution Model

The live resolver is deterministic and batch-based.

It currently uses:

- elapsed time capped by route duration
- encounter interval derived from:
  - hunter `speed`
  - zone `dangerRating`
  - hunting gear speed bonuses
  - active pet speed traits
- success rate derived from:
  - hunter `power`
  - hunter `speed`
  - effective `survival`
  - zone `dangerRating`
- rewards derived from:
  - zone base reward
  - `fortune`
  - hunting gear loot bonuses
  - pet reward traits
  - rare-drop bonuses

This is intentionally not a live replay combat sim.

That keeps hunting:

- cheap to compute
- deterministic
- easy to test
- independent from combat sequencing

---

## Gear And Pet Layer

### Hunting Gear

The resolver now reads equipped hunting gear through:

- `getEquippedHuntingGearBonuses(...)`

Live bonus families:

- `huntSpeedPercent`
- `lootQuantityPercent`
- `survivalFlat`
- `survivalPercent`
- `rareDropPercent`

### Hunting Pets

The resolver now reads the active pet traits through:

- `profile.activePetId`
- optional `pets[]` passed into `resolveHunt(...)`

Live pet trait families:

- `huntSpeedPercent`
- `survivalPercent`
- `rareDropPercent`
- `rewardQuantityPercent`

Important rule:

Pet-lite traits are passive modifiers, not a second combat runtime.

### Hunting Tools

The resolver now also reads the equipped tool loadout through:

- `profile.tool`
- `getEquippedHuntingToolBonuses(...)`

Live tool bonus families:

- `huntSpeedPercent`
- `rewardQuantityPercent`
- `rareDropPercent`
- `targetedYieldPercent`

Design intent:

- tools are the first route-planning lever after baseline gear and pet choice
- tool focus should change what a route is best at, not replace the whole hunting economy

---

## Save Boundary

Current recommended save shape:

- `state.hunting.profile`
- `state.hunting.huntState`
- `state.hunting.pets`
- `state.hunting.meta`

Design intent:

- keep hunting isolated from combat save shape
- keep reward transfer explicit
- avoid leaking combat runtime state into hunting
- normalize legacy hunting saves when new bounded-context fields are added

Current migration rule:

- older saves that predate the tool system are normalized into an empty tool loadout on read so the `Profile` tab and resolver remain safe

---

## UI Contract

The first hunting UI shell now guarantees:

- zone selection
- current hunt status
- hunter summary
- pet summary
- visible reward summary before claim
- shared inventory feedback after claim

The screen currently prioritizes:

- proving the bounded context works end-to-end
- proving the reward bridge works
- exposing the first complete route loop

It does not yet provide:

- advanced loadout editing
- rich pet management
- long-term progression UI
- professions or crafting

---

## Verification Checklist

Whenever hunting logic changes, verify all of the following:

1. `startHunt(...)` still rejects locked zones and double-starts.
2. `resolveHunt(...)` still requires an active matching zone.
3. Completed routes transition to `claimable`.
4. `claimHuntRewards(...)` resets the hunt state back to `idle`.
5. Claimed rewards still reach shared inventory through `inventory.addItem(...)`.
6. Hunter EXP still increases after a successful claim flow.
7. Zone unlock thresholds still match intended level gates.
8. Gear and pet bonuses still affect resolver outcomes.
9. Hunting changes do not touch combat runtime files unless explicitly intended.

Current automated verification:

- `npm run test -- tests/modules/hunting.test.ts`
- `npm run build`

---

## Safe Change Rules

If a hunting behavior changes, edit the correct layer:

1. Zone data or reward tags:
   edit `src/content/hunting/*`
2. Hunt timing, success math, or reward math:
   edit `resolveHunt.ts`
3. Leveling or unlock logic:
   edit `addHunterExperience.ts`
4. Gear or pet modifier rules:
   edit `HuntingGear.ts`, `HuntingPet.ts`, and related application helpers
5. Screen flow only:
   edit `useHuntingSandbox.ts` and `HuntingScreen.tsx`

Do not route hunting logic through combat modules for convenience.

---

## Related Docs

- [Architecture Overview](./overview.md)
- [Hunting MVP Blueprint](./hunting-mvp-blueprint.md)
- [Architecture Index](./index.md)

---

> Last updated: 2026-03-14 18:08 MSK
