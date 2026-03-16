# Combat Design Reference

> Last updated: 2026-03-16 02:35 MSK

**Project:** Fight Club  
**Status:** structured reference from live runtime

---

## Purpose

This page is now the top-level reference hub for the live combat runtime in `fight-club/`.

It exists to make combat changes safer without forcing readers through one oversized page. If the code and these docs diverge, the code is the source of truth and the docs must be updated.

---

## Read This With

- [Architecture Overview](./overview.md)
- [Combat System Roadmap](./combat-system-roadmap.md)
- [ADR-001: Modular Headless Core](../decisions/ADR-001-architecture.md)

---

## What This Reference Covers

<div class="docs-hub-grid">
  <div class="docs-hub-card">
    <h3>Model &amp; Flow</h3>
    <p>Combat state, zones, turn order, validation rules, the main resolution pipeline, and edge-case sequencing.</p>
  </div>
  <div class="docs-hub-card">
    <h3>Formulas &amp; Effects</h3>
    <p>Damage math, dodge, crit, roll-based block, zone armor, resources, passives, effects, consumables, and runtime outputs.</p>
  </div>
  <div class="docs-hub-card">
    <h3>Integrations</h3>
    <p>Sandbox orchestration, bot assumptions, Combat Rules alignment, and safe-change guidance.</p>
  </div>
  <div class="docs-hub-card">
    <h3>Verification</h3>
    <p>Coverage, traceability, regression targets, and the combat verification checklist.</p>
  </div>
</div>

## Core Runtime Files

- `src/modules/combat/application/startCombat.ts`
- `src/modules/combat/application/resolveRound.ts`
- `src/modules/combat/model/CombatantState.ts`
- `src/modules/combat/model/CombatEffect.ts`
- `src/modules/combat/model/RoundAction.ts`
- `src/modules/combat/model/RoundResult.ts`
- `src/modules/combat/config/combatConfig.ts`
- `src/modules/combat/config/combatWeaponPassives.ts`
- `src/modules/combat/services/combatFormulas.ts`
- `src/orchestration/combat/buildCombatSnapshot.ts`
- `src/orchestration/combat/combatSandboxController.ts`

## Current Live Baseline

The current combat baseline is no longer the old handcrafted training sandbox.

It now includes:

- generated Battle Kings starter items as the live item pool
- expanded equipment slots across combat UI and snapshot assembly
- zone-based armor as part of the real mitigation model
- random damage and armor ranges
- roll-based block reduction in the `40-70%` band, biased by `Endurance`
- crit multiplier scaling from both `Rage` and `Endurance`
- runtime skill cooldown tracking
- synchronized `Combat Rules` content in both `ru` and `en`

---

## Structured Reading Paths

### Learn The Runtime

1. [Combat System](./combat/)
2. [Combat Model And Flow](./combat/model-and-flow.md)
3. [Combat Formulas And Effects](./combat/formulas-and-effects.md)

### Change Combat Safely

1. [Combat Integrations And Verification](./combat/integrations-and-verification.md)
2. [Combat Verification And Tests](./combat/tests-and-traceability.md)
3. [Combat System Roadmap](./combat-system-roadmap.md)

### Review Combat Architecture

1. [Architecture Overview](./overview.md)
2. [Combat System](./combat/)
3. [ADR-001: Modular Headless Core](../decisions/ADR-001-architecture.md)

---

## Pages In This Reference

- [Combat System](./combat/)
- [Combat Model And Flow](./combat/model-and-flow.md)
- [Combat Formulas And Effects](./combat/formulas-and-effects.md)
- [Combat Integrations And Verification](./combat/integrations-and-verification.md)
- [Combat Verification And Tests](./combat/tests-and-traceability.md)

---

## Related Docs

- [Docs Home](../)
- [Architecture Index](./)
- [Combat System Roadmap](./combat-system-roadmap.md)

---

> Last updated: 2026-03-16 02:35 MSK
