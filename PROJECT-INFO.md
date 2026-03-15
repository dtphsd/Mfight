# PROJECT-INFO - Fight Club

> Last updated: 2026-03-15 17:30 MSK

**Project:** Fight Club  
**Type:** browser-only SPA / combat sandbox  
**Stack:** React 19, TypeScript, Vite, Vitest, ESLint, Zod  
**Current state:** working combat sandbox with item skills, weapon passives, consumables, stackable timed status effects, a rich combat log, and a combat rules reference screen

---

## Current Reality

The project is a single frontend app in `fight-club/`.

The repository root also contains the shared documentation set plus helper scripts for local development and git push workflow.

The app root now also contains a local planning workflow:

- `fight-club/MASTER-PLAN.md` for active tasks and sprint history
- `fight-club/features/` for per-feature tracking documents
- `fight-club/features/combat-design-reference.md` for combat-system documentation and safety tasks
- `fight-club/features/hunting-mvp.md` for the planned autonomous hunting module and implementation roadmap
- `fight-club/docs/README.md` as the GitBook-style documentation landing page
- `fight-club/docs/SUMMARY.md` as the GitBook navigation tree
- `fight-club/docs/gitbook-publish-setup.md` as the operational setup guide for GitBook publishing
- `fight-club/docs/.vitepress/` and `fight-club/docs/index.md` as the static docs-site layer for VitePress and GitHub Pages
- the VitePress docs site now has a structured home page, section landing pages, sidebar navigation, local search, and branded theme styling
- the docs site is now organized into role-based reading paths for `Gameplay`, `Systems`, `Architecture`, and `Decisions`
- `fight-club/docs/architecture/combat-design-reference.md` as the current source-of-truth combat runtime reference
- `fight-club/docs/architecture/hunting-mvp-blueprint.md` as the original architecture blueprint for the autonomous hunting module
- `fight-club/docs/architecture/hunting-runtime-reference.md` as the live hunting runtime reference and verification guide
- `fight-club/ART/Avatars/` as the raw character-art source folder for combat silhouettes

It has:

- no backend
- no API
- no auth
- no real database
- no router

The main implemented user flow is:

- open `Combat Sandbox`
- equip items
- apply one of 7 curated build presets or assemble a manual build
- manually choose up to 5 active skills from all unlocked item skills
- select consumables from inventory
- start combat
- resolve rounds
- read combat log, resources, HP, and status effects

The app now also has a second live flow:

- open `Hunting Lodge`
- choose an unlocked hunting zone
- start a route
- resolve the completed session
- claim rewards into shared inventory
- gain hunter EXP and continue the hunting loop

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

### Hunting Module

- autonomous hunter profile
- deterministic idle route resolution
- hunter EXP and level-step progression
- zone unlocks
- hunting-only stats:
  - `power`
  - `speed`
  - `survival`
  - `fortune`
- hunting gear bonuses
- hunting tool focus bonuses for route-specific yields
- pet-lite passive traits
- explicit reward-claim bridge into shared inventory
- first hunting screen shell with menu navigation
- save-backed offline return and compact lodge UI

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
- weapon-class passive effects on hit or crit
- timed combat effects:
  - buffs
  - debuffs
  - periodic heal / damage
  - periodic resource changes
  - stack counts and per-effect stack caps

### Status Effects

The live runtime now supports active combat effects on combatants.

Current examples in real content:

- `Bleeding Line`
- `Open Wound`
- `Staggered`
- `Evasive Window`
- `Braced Core`
- `Readied Guard`
- `Regeneration`
- `Vital Mark`
- `Concussed Guard`
- `Rending Hook`
- `Execution Pressure`

Effects are visible:

- above HP in the silhouette header
- inside effect popups
- in battle log entries when applied, expired, or healed
- with stack counts when an effect is currently stacked

### Combat Sandbox UI

- `Player | Fight Setup | Bot` layout
- dedicated build presets popover for 7 curated archetypes
- build preset browser is now compressed into a one-page `2 x 3` selector with avatar previews, stronger active-state styling, and color-zoned detail panels
- builder popover
- inventory popover
- equipment slot popover
- first extracted shared UI primitives now live in `src/ui/components/shared/` for modal overlays, modal surfaces, action buttons, and compact panel cards
- hover preview positioning is now starting to move into shared infrastructure through `src/ui/hooks/useAnchoredPopup.ts`
- hover preview chrome is also starting to converge through `src/ui/components/shared/PreviewSurface.tsx` and `PreviewTag.tsx`
- item-based hover preview shell is now also partially unified through `src/ui/components/shared/ItemPreviewPopover.tsx`
- skill loadout popover
- local profile mail icon with a mailbox mini modal for inbox reading, quick replies, and direct letters from another profile card
- curated build presets now also switch the active combat silhouette to a matching character avatar
- combat silhouette impact overlays now use one-shot pulses plus latched active-impact rendering so damage text and block/crit/break visuals do not reappear after fading out
- rich hover cards for equipped items and inventory/equipment cards
- prominent `Weapon Passive` block on weapon cards
- prominent `Signature Skill` block on item cards and preset equipment previews
- action rails for skills and consumables
- status effects embedded above HP to avoid spending vertical space
- filtered battle log with structured tags and cleaner handling for:
  - healing ticks
  - expired effects
  - full-block zero-damage outcomes

### Curated Build Presets

The sandbox now ships with 7 moderated build presets aimed at readable matchups and mid-length fights:

- `Sword / Bleed`
- `Shield / Guard`
- `Dagger / Crit`
- `Mace / Control`
- `Axe / Pressure`
- `Heavy / Two-Hand`
- `Sustain / Regen`

Each preset includes:

- item loadout
- recommended 5-skill panel rendered as a compact strip inside the preset browser
- recommended consumables
- strengths / weaknesses and target fight length in the preset browser

There is also a dedicated balance runner:

- `npm run balance:matrix`
- writes current matchup artifacts to:
  - `fight-club/docs/balance/latest-build-matrix.md`
  - `fight-club/docs/balance/latest-build-matrix.json`
- runs ordered preset matchups with configurable `runs`, `max-rounds`, and planner difficulty
- reflects sandbox parity mode where the right preset is clipped to the left preset stat budget

### Combat Rules Screen

- implemented reference screen
- item and combat facts rendered from current content
- content is now synced with live runtime for:
  - timed effects
  - manual 5-slot skill loadout
  - consumables with lasting effects
  - updated battle log outcomes

---

## Key Runtime Files

- `fight-club/src/modules/combat/application/resolveRound.ts`
- `fight-club/src/modules/combat/application/startCombat.ts`
- `fight-club/src/modules/combat/model/CombatEffect.ts`
- `fight-club/src/modules/combat/model/RoundAction.ts`
- `fight-club/src/modules/combat/model/RoundResult.ts`
- `fight-club/src/modules/combat/config/combatWeaponPassives.ts`
- `fight-club/src/orchestration/combat/buildCombatSnapshot.ts`
- `fight-club/src/orchestration/combat/combatSandboxController.ts`
- `fight-club/src/orchestration/combat/combatSandboxMetrics.ts`
- `fight-club/src/orchestration/combat/combatSandboxSupport.ts`
- `fight-club/src/ui/hooks/useCombatSandbox.ts`
- `fight-club/src/ui/screens/Combat/CombatSandboxScreen.tsx`
- `fight-club/src/ui/components/combat/CombatSilhouette.tsx`
- `fight-club/src/ui/components/combat/BattleLogPanel.tsx`
- `fight-club/src/ui/components/combat/battleLogFormatting.ts`
- `fight-club/src/ui/components/combat/ItemPresentationCard.tsx`
- `fight-club/src/ui/components/combat/BuildPresetsPopover.tsx`
- `fight-club/src/content/items/starterItems.ts`
- `fight-club/src/modules/hunting/application/startHunt.ts`
- `fight-club/src/modules/hunting/application/resolveHunt.ts`
- `fight-club/src/modules/hunting/application/claimHuntRewards.ts`
- `fight-club/src/modules/hunting/application/addHunterExperience.ts`
- `fight-club/src/modules/hunting/application/equipHuntingGear.ts`
- `fight-club/src/modules/hunting/application/assignPetToHunter.ts`
- `fight-club/src/content/hunting/zones.ts`
- `fight-club/src/content/hunting/gear.ts`
- `fight-club/src/content/hunting/pets.ts`
- `fight-club/src/ui/hooks/useHuntingSandbox.ts`
- `fight-club/src/ui/screens/Hunting/HuntingScreen.tsx`

---

## Constraints

- no server trust boundary
- no multiplayer
- no cooldown system
- bot now uses build-aware skill planning, but still does not use consumables
- sandbox bot stat allocations are clipped to the current player allocation budget
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
- `fight-club/src/ui/components/combat/ItemPresentationCard.tsx`
- `fight-club/src/content/items/starterItems.ts`

Reason:

- they control combat math, stackable effects, sandbox state wiring, parity rules, action selection, and user-visible combat output

---

## Verification Status

Current validated state:

- `npm run build` passes
- `npm run test` passes
- `npm run docs:validate` passes
- `npm run lint` currently fails because generated `docs/.vitepress/.temp` and `docs/.vitepress/dist` artifacts are included, plus two existing source-level issues in `src/modules/hunting/application/huntingPersistence.ts` and `src/ui/screens/Hunting/HuntingScreen.tsx`
- `npm run balance:matrix` passes and writes the current matchup matrix to `fight-club/docs/balance/`

Current automated coverage count:

- `21` test files / `143` tests

---

## Running

From `fight-club/`:

```bash
npm install
npm run dev
npm run test
npm run lint
npm run build
npm run balance:matrix
```

From repo root:

```powershell
./start-fight-club-dev.ps1
./push-git.ps1 -Message "docs: update root rules"
```

---

> Last updated: 2026-03-15 16:11 MSK
