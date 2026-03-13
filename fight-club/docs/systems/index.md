---
title: Systems
---

# Systems

> Last updated: 2026-03-14 12:26 MSK

This section is the engineering entry point for understanding how Fight Club is assembled from runtime modules, orchestration layers, UI contracts, and documentation.

Use it when you need to trace dependencies, plan safe refactors, or quickly locate the right layer before editing code.

---

## Start Here

- [Architecture Overview](../architecture/overview.md)
  - best top-down map of the runtime and UI boundaries
- [ADR-001: Modular Headless Core](../decisions/ADR-001-architecture.md)
  - why the project keeps the gameplay core headless and modular
- [Combat Design Reference](../architecture/combat-design-reference.md)
  - detailed source of truth for the riskiest live subsystem

---

## Recommended Reading Paths

### For Safe Refactoring

1. [Architecture Overview](../architecture/overview.md)
2. [ADR-001: Modular Headless Core](../decisions/ADR-001-architecture.md)
3. [Combat Design Reference](../architecture/combat-design-reference.md)

### For UI Contract Work

1. [Architecture Overview](../architecture/overview.md)
2. `src/ui/hooks/useCombatSandbox.ts`
3. `src/ui/screens/Combat/CombatSandboxScreen.tsx`

### For Release And Docs Workflow

1. [GitBook Publish Setup](../gitbook-publish-setup.md)
2. `docs/.vitepress/config.mts`
3. `scripts/validate-content.mjs`

---

## Main System Boundaries

- `src/modules/`
  - headless gameplay modules and public contracts
- `src/orchestration/`
  - cross-module flows such as combat lifecycle and sandbox support
- `src/ui/`
  - React screens, hooks, and presentational components
- `docs/`
  - architecture, decisions, publishing, and operational reference

---

## Related Docs

- [Docs Home](../)
- [Gameplay](../gameplay/)
- [Architecture](../architecture/)

---

> Last updated: 2026-03-14 12:26 MSK
