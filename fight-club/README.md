# Fight Club

React + TypeScript skeleton for a modular browser fighting game.

Last updated: 2026-03-12

## Commands

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run test`
- `npm run lint`
- `npm run generate:module -- module-name`

## Architecture

- `src/core` contains shared technical primitives.
- `src/modules` contains domain modules with a stable internal layout.
- `src/content` stores static gameplay data.
- `src/orchestration` coordinates cross-module use cases.
- `src/ui` renders React screens without owning canonical game state.

## Combat Sandbox Orchestration

- The playable combat loop now has an explicit lifecycle layer above raw damage formulas.
- `src/modules/combat/model/CombatPhase.ts`
  - shared combat phase type for setup, round resolution, and finished states
- `src/orchestration/combat/combatStateMachine.ts`
  - legal combat phase transitions and UI-facing phase labels
- `src/orchestration/combat/roundDraft.ts`
  - single source of truth for the player's pending round action
- `src/orchestration/combat/combatPressure.ts`
  - reusable preview and zone-pressure helpers used by both UI metrics and AI planning
- `src/orchestration/combat/botRoundPlanner.ts`
  - bot decision layer that plans attack/defense zones from matchup pressure instead of pure random picks
- `src/ui/hooks/useCombatSandbox.ts`
  - current orchestration entry point that wires snapshots, phases, round draft, planner, and round resolution together
- Long-term combat refactor and gameplay roadmap:
  - `docs/architecture/combat-system-roadmap.md`

## Current Sandbox Build

- The starter inventory is no longer minimal:
  - multiple weapon classes
  - armor across several slots
  - accessory-driven skills
  - consumables with different usage rules
- The combat sandbox currently ships with four playable preset archetypes:
  - `Warden`
  - `Duelist`
  - `Breaker`
  - `Executioner`
- Bot difficulty is now configurable:
  - `Recruit`
  - `Veteran`
  - `Champion`
- Bot loadout and planning change with difficulty instead of only changing raw stats.
- Skills are no longer weapon-only:
  - weapons
  - shield
  - armor
  - helmet
  - gloves
  - boots
  - accessory
  can all contribute active combat skills if the item data defines them.
- Consumables now have explicit usage modes:
  - `replace_attack`
  - `with_attack`
  and the round resolution layer already supports combined attack + consumable turns for the second case.

## Combat Rules Page

- The combat-system reference page lives in `src/ui/screens/CombatRules`.
- The screen is split into small parts:
  - `CombatRulesScreen.tsx` assembles the page.
  - `components/CombatRulesHero.tsx` renders the hero and contents navigation.
  - `components/CombatRulesSection.tsx` renders sections, callouts, steps, and tables.
  - `combatRulesContent.ts` stores human-written RU/EN explanatory copy.
  - `combatRulesFacts.ts` derives item and skill facts from real gameplay data.
  - `combatRulesRichText.tsx` owns term highlighting.
  - `combatRulesTheme.ts` owns section/tone helpers.

## Documentation Maintenance

- After changing combat formulas, starter items, or combat resources, review the Combat Rules page.
- Item tables and skill cards already derive from `src/content/items/starterItems.ts`; prefer extending those generators instead of hardcoding duplicate values in page copy.
- Formula explanations, resource gains, and round-resolution text are still human-maintained and must be checked when combat logic changes.
- After changing combat flow, also review:
  - `src/orchestration/combat/combatStateMachine.ts`
  - `src/orchestration/combat/roundDraft.ts`
  - `src/orchestration/combat/botRoundPlanner.ts`
  - `src/orchestration/combat/combatPressure.ts`
- After changing consumables, also review:
  - `src/modules/inventory/model/Item.ts`
  - `src/modules/combat/model/RoundAction.ts`
  - `src/modules/combat/application/resolveRound.ts`
  - `src/ui/components/combat/ItemPresentationCard.tsx`
  - `src/ui/screens/Combat/CombatSandboxScreen.tsx`
- Keep lifecycle/orchestration rules out of `resolveRound.ts`; that module should stay focused on combat math and per-round resolution.
