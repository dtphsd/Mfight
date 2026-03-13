# Architecture Overview

> Last updated: 2026-03-14 00:41 MSK

The project is split into headless domain modules and a React UI layer.

This page is the best starting point for understanding where logic belongs before making changes.

---

## Read Next

- [Combat Design Reference](./combat-design-reference.md)
- [Combat System Roadmap](./combat-system-roadmap.md)
- [ADR-001: Modular Headless Core](../decisions/ADR-001-architecture.md)

---

## System Layers

- `core` contains infrastructure-like primitives: events, logging, RNG, time, storage.
- `modules` expose public APIs and events, but do not directly mutate each other.
- `orchestration` coordinates scenarios that span multiple modules.
- `ui` reads snapshots and emits commands.

## Combat Flow Architecture

The combat sandbox is now split across three layers instead of keeping all battle flow in one UI hook:

- `modules/combat`
  - owns core battle formulas, centralized combat config, and `resolveRound`
- `orchestration/combat`
  - owns combat lifecycle, pending player decisions, planner logic, and pressure previews
- `ui/hooks/useCombatSandbox.ts`
  - assembles snapshots and delegates to orchestration helpers

Related planning document:

- [Combat System Roadmap](./combat-system-roadmap.md)
  - phased refactor and gameplay roadmap for future combat-system work

### Combat Lifecycle

- `src/modules/combat/model/CombatPhase.ts`
  - shared phase model: `idle`, `setup`, `awaiting_actions`, `resolving_round`, `round_resolved`, `finished`
- `src/modules/combat/model/CombatZone.ts`
  - canonical combat zone type and the shared `combatZones` list used by runtime, preview, planner, and UI
- `src/orchestration/combat/combatStateMachine.ts`
  - phase transitions such as start, resolve, next round, and failure fallback
- `src/orchestration/combat/roundDraft.ts`
  - pending player action state: attack zone, defense zones, and a single action-aware `selectedAction`
  - the UI still reads derived `selectedSkillId` / `selectedConsumableCode` from that state for compatibility
- `src/orchestration/combat/combatSandboxController.ts`
  - start / resolve / next-round orchestration and inventory-side consumable consumption
- `src/orchestration/combat/combatSandboxSupport.ts`
  - pure sandbox helpers for allocation application, round-draft reconciliation, preset application, and equipped item lookup
- `src/modules/combat/config/combatConfig.ts`
  - stable source for combat constants such as HP scaling, formula coefficients, zone modifiers, reward values, chance caps, defense focus weights, weapon style bias tables, preview profile weights, and bot planner heuristics

### Bot Planning And Preview Logic

- `src/orchestration/combat/combatPressure.ts`
  - reusable zone pressure and preview damage helpers
  - shared by UI matchup metrics and bot planning
  - now directly covered by dedicated tests because it reuses the same combat rules tables as runtime combat
- `src/orchestration/combat/botRoundPlanner.ts`
  - bot chooses attack and defense zones from pressure data
  - current planner is deterministic-with-variance and no longer pure random
  - difficulty changes both planner behavior and bot loadout
- `src/orchestration/combat/combatSandboxMetrics.ts`
  - builds the derived sandbox metrics object and log-derived view state used by the screen and builder popover

### Current Sandbox Content Layer

- `src/content/items/starterItems.ts`
  - now contains the live sandbox content set for weapons, armor pieces, accessories, and consumables
  - item skills are not weapon-only anymore; equipped non-weapon items may also add active skills
- `src/orchestration/combat/combatSandboxConfigs.ts`
  - owns playable build presets and bot difficulty presets
  - presets now define both stat allocations and full equipment loadouts
- `src/orchestration/combat/combatLoadouts.ts`
  - converts a loadout config into actual equipped gear using the same equipment rules as the UI

### Consumable Usage Modes

- `src/modules/inventory/model/Item.ts`
  - `ConsumableEffect` now includes `usageMode`
- current supported modes:
  - `replace_attack`
  - `with_attack`
- `src/modules/combat/application/resolveRound.ts`
  - full-action consumables still resolve as a consumable turn
  - combo consumables are applied first and then the attack continues in the same round
- `src/modules/combat/model/RoundAction.ts`
  - combat actions are now explicit variants instead of one mixed nullable shape
  - current variants are `basic_attack`, `skill_attack`, `consumable`, and `consumable_attack`
- `src/ui/components/combat/ItemPresentationCard.tsx` and `src/ui/screens/Combat/CombatSandboxScreen.tsx`
  - surface this mode in player-facing descriptions so the rule is visible before use

### Safe Editing Rule

If combat behavior changes, update the correct layer instead of stacking more logic into the hook:

1. Formula or mitigation change:
   edit `modules/combat`
2. Round lifecycle or phase transition change:
   edit `orchestration/combat/combatStateMachine.ts`
3. Player action selection contract change:
   edit `orchestration/combat/roundDraft.ts`
4. Bot decision logic or preview heuristics change:
   edit `orchestration/combat/botRoundPlanner.ts` and `combatPressure.ts`
5. Build presets, bot difficulty, or starter gear change:
   edit `starterItems.ts`, `combatSandboxConfigs.ts`, and `combatLoadouts.ts`
6. Only then adapt `useCombatSandbox.ts` if wiring or returned UI data also changed

## Combat Rules UI

The `Combat Rules` page is a UI-only reference surface for the current combat system and now follows the same modular split as the rest of the app:

- `src/ui/screens/CombatRules/CombatRulesScreen.tsx`
  - thin screen container with local locale state
- `src/ui/screens/CombatRules/components/CombatRulesHero.tsx`
  - hero, locale switch, CTA actions, table-of-contents navigation
- `src/ui/screens/CombatRules/components/CombatRulesSection.tsx`
  - reusable section renderer for bullets, callouts, steps, and tables
- `src/ui/screens/CombatRules/combatRulesContent.ts`
  - hand-authored explanatory copy for RU/EN
- `src/ui/screens/CombatRules/combatRulesFacts.ts`
  - derived facts sourced from real gameplay data such as `starterItems`
- `src/ui/screens/CombatRules/combatRulesRichText.tsx`
  - semantic inline highlighting for combat terms
- `src/ui/screens/CombatRules/combatRulesTheme.ts`
  - tone/highlight-mode helpers

## Maintenance Rule For Combat Changes

When the combat system changes, update documentation from the most stable source available:

1. Prefer deriving item, skill, and resource facts from real code/data modules.
2. Keep formula descriptions and walkthrough text in `combatRulesContent.ts`.
3. If a gameplay change alters page-visible facts, update both the code path and the matching explanatory copy in the same change.
4. If the gameplay change affects combat flow, phase behavior, or bot choices, update this architecture page as well.
5. If the gameplay change affects consumable usage rules, update both combat docs and the player-facing UI descriptions in the sandbox.

---

## Related Docs

- [Docs Home](../README.md)
- [Architecture Index](./README.md)
- [Combat Design Reference](./combat-design-reference.md)

---

> Last updated: 2026-03-14 00:41 MSK
