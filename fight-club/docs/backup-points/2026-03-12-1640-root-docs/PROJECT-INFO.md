# PROJECT-INFO - Fight Club

> Last updated: 2026-03-12 16:40 MSK

**Project:** Fight Club  
**Type:** browser-only SPA / combat sandbox  
**Stack:** React 19, TypeScript, Vite, Vitest, ESLint, Zod  
**Current state:** working combat sandbox with item skills, consumables, timed status effects, rich combat log, and a combat rules reference screen

---

## Current Reality

The project is a single frontend app in `fight-club/`.

It has:

- no backend
- no API
- no auth
- no real database
- no router

The main implemented user flow is:

- open `Combat Sandbox`
- equip items
- manually choose up to 5 active skills from all unlocked item skills
- select consumables from inventory
- start combat
- resolve rounds
- read combat log, resources, HP, and status effects

---

## Implemented Systems

### Character And Build

- character base stats and stat allocation
- build presets
- equipment-driven combat stats
- snapshot assembly through `buildCombatSnapshot.ts`

### Inventory And Equipment

- stack / non-stack inventory
- direct equip from inventory popover
- slot-based equipment with `mainHand / offHand / helmet / armor / gloves / boots / accessory`
- support for `one_hand`, `two_hand`, and `off_hand_only`
- item-driven `skills[]`
- consumables with direct effects and timed combat effects

### Combat Runtime

- typed round actions:
  - `basic_attack`
  - `skill_attack`
  - `consumable`
  - `consumable_attack`
- zone targeting and two defense zones
- initiative by agility
- `dodge`, `block`, `penetration`, `crit`
- typed resources:
  - `rage`
  - `guard`
  - `momentum`
  - `focus`
- item skills with resource costs
- consumables inside round flow
- timed combat effects:
  - buffs
  - debuffs
  - periodic heal / damage
  - periodic resource changes

### Status Effects

The live runtime now supports active combat effects on combatants.

Current examples in real content:

- `Bleeding Line`
- `Staggered`
- `Evasive Window`
- `Braced Core`
- `Readied Guard`
- `Regeneration`

Effects are visible:

- above HP in the silhouette header
- inside effect popups
- in battle log entries when applied, expired, or healed

### Combat Sandbox UI

- `Player | Fight Setup | Bot` layout
- builder popover
- inventory popover
- equipment slot popover
- skill loadout popover
- rich hover cards for equipped items and inventory/equipment cards
- action rails for skills and consumables
- status effects embedded above HP to avoid spending vertical space
- filtered battle log with structured tags and cleaner handling for:
  - healing ticks
  - expired effects
  - full-block zero-damage outcomes

### Combat Rules Screen

- implemented reference screen
- item and combat facts rendered from current content

---

## Key Runtime Files

- `fight-club/src/modules/combat/application/resolveRound.ts`
- `fight-club/src/modules/combat/application/startCombat.ts`
- `fight-club/src/modules/combat/model/CombatEffect.ts`
- `fight-club/src/modules/combat/model/RoundAction.ts`
- `fight-club/src/modules/combat/model/RoundResult.ts`
- `fight-club/src/orchestration/combat/buildCombatSnapshot.ts`
- `fight-club/src/orchestration/combat/combatSandboxController.ts`
- `fight-club/src/orchestration/combat/combatSandboxMetrics.ts`
- `fight-club/src/orchestration/combat/combatSandboxSupport.ts`
- `fight-club/src/ui/hooks/useCombatSandbox.ts`
- `fight-club/src/ui/screens/Combat/CombatSandboxScreen.tsx`
- `fight-club/src/ui/components/combat/CombatSilhouette.tsx`
- `fight-club/src/ui/components/combat/BattleLogPanel.tsx`
- `fight-club/src/ui/components/combat/battleLogFormatting.ts`
- `fight-club/src/content/items/starterItems.ts`

---

## Constraints

- no server trust boundary
- no multiplayer
- no cooldown system
- bot still does not use item skills or consumables
- persistence still means browser `localStorage`, not a real save profile system

---

## Danger Zones

These files are the highest-risk change points:

- `fight-club/src/modules/combat/application/resolveRound.ts`
- `fight-club/src/modules/combat/model/CombatEffect.ts`
- `fight-club/src/orchestration/combat/buildCombatSnapshot.ts`
- `fight-club/src/orchestration/combat/combatSandboxController.ts`
- `fight-club/src/orchestration/combat/combatSandboxMetrics.ts`
- `fight-club/src/ui/hooks/useCombatSandbox.ts`
- `fight-club/src/ui/screens/Combat/CombatSandboxScreen.tsx`
- `fight-club/src/ui/components/combat/CombatSilhouette.tsx`
- `fight-club/src/ui/components/combat/battleLogFormatting.ts`
- `fight-club/src/content/items/starterItems.ts`

Reason:

- they control combat math, active effects, sandbox state wiring, action selection, and user-visible combat output

---

## Verification Status

Current validated state:

- `npm run build` passes
- `npm run test` passes
- `npm run lint` passes

Current automated coverage count:

- `17` test files
- `97` tests

---

## Running

From `fight-club/`:

```bash
npm install
npm run dev
npm run test
npm run lint
npm run build
```

From repo root:

```powershell
./start-fight-club-dev.ps1
```

---

> Last updated: 2026-03-12 16:40 MSK
