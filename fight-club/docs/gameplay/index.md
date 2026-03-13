---
title: Gameplay
---

# Gameplay

> Last updated: 2026-03-14 12:26 MSK

This section is the fastest path for understanding how the game is meant to feel and what player-facing combat behavior currently exists.

Use it when you are balancing, tuning combat clarity, reviewing rules text, or checking whether runtime behavior still matches the product experience.

---

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

> Last updated: 2026-03-14 12:26 MSK
