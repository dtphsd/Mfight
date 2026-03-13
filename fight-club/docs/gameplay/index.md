---
title: Gameplay
---

# Gameplay

> Last updated: 2026-03-14 12:41 MSK

This section is the fastest path for understanding how the game is meant to feel and what player-facing combat behavior currently exists.

Use it when you are balancing, tuning combat clarity, reviewing rules text, or checking whether runtime behavior still matches the product experience.

---

## Who This Section Is For

<div class="docs-hub-grid">
  <div class="docs-hub-card">
    <h3>Balance Work</h3>
    <p>Use this section when you are tuning numbers, pacing, risk-reward, and archetype feel.</p>
  </div>
  <div class="docs-hub-card">
    <h3>Combat Clarity</h3>
    <p>Use it when player-facing rules, labels, battle log language, or combat readability need to stay aligned with runtime truth.</p>
  </div>
  <div class="docs-hub-card">
    <h3>Bot And Difficulty</h3>
    <p>Use it when you need to review whether the sandbox bot still behaves coherently against the live combat model.</p>
  </div>
</div>

## Start Here

- [Combat Design Reference](../architecture/combat-design-reference.md)
  - live combat rules, formulas, sequencing, resources, passives, and verification rules
- [Combat System Roadmap](../architecture/combat-system-roadmap.md)
  - where the combat system is going next and which gameplay layers are still planned

---

## Recommended Reading Paths

### For Balance Work

1. [Combat Design Reference](../architecture/combat-design-reference.md)
2. `docs/balance/latest-build-matrix.md`
3. [Combat System Roadmap](../architecture/combat-system-roadmap.md)

### For Player-Facing Rule Clarity

1. [Combat Design Reference](../architecture/combat-design-reference.md)
2. `src/ui/screens/CombatRules/`
3. [Architecture Overview](../architecture/overview.md)

### For Bot And Difficulty Tuning

1. [Combat Design Reference](../architecture/combat-design-reference.md)
2. [Combat System Roadmap](../architecture/combat-system-roadmap.md)
3. `src/orchestration/combat/botRoundPlanner.ts`

---

## Common Gameplay Tasks

- checking whether combat rules text still matches live runtime behavior
- validating whether a balance change should also update `Combat Rules`
- reviewing whether the bot still feels fair after formula or content changes
- tracing player-facing confusion back to runtime sequencing or resource rules

---

## Main Gameplay Sources Of Truth

- runtime combat:
  - `src/modules/combat/`
- sandbox orchestration:
  - `src/orchestration/combat/`
- player-facing rules:
  - `src/ui/screens/CombatRules/`
- content and presets:
  - `src/content/items/`
  - `src/orchestration/combat/combatSandboxConfigs.ts`

---

## Related Docs

- [Docs Home](../)
- [Systems](../systems/)
- [Architecture](../architecture/)

---

> Last updated: 2026-03-14 12:41 MSK
