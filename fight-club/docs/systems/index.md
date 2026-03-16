---
title: Systems
---

# Systems

> Last updated: 2026-03-16 02:42 MSK

This section is the engineering entry point for understanding how Fight Club is assembled from runtime modules, orchestration layers, UI contracts, documentation, and the local data-ingestion pipeline.

Use it when you need to trace dependencies, plan safe refactors, or quickly locate the right layer before editing code.

---

## Who This Section Is For

<div class="docs-hub-grid">
  <div class="docs-hub-card">
    <h3>Refactoring</h3>
    <p>Use this section before changing code that has dependencies across runtime modules, orchestration, UI, and docs.</p>
  </div>
  <div class="docs-hub-card">
    <h3>UI Contract Work</h3>
    <p>Use it when a screen or hook depends on combat state, orchestration outputs, or documentation alignment.</p>
  </div>
  <div class="docs-hub-card">
    <h3>Docs And Release Flow</h3>
    <p>Use it when the repo-native docs site, publishing workflow, and source-of-truth pages need to stay in sync.</p>
  </div>
  <div class="docs-hub-card">
    <h3>Data Pipeline</h3>
    <p>Use it when Battle Kings source pages, parsed catalogs, and generated combat items need to stay aligned with runtime code.</p>
  </div>
</div>

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
3. `src/ui/screens/CombatRules/combatRulesContent.ts`
4. `src/ui/screens/Combat/CombatSandboxScreen.tsx`

### For Release And Docs Workflow

1. [GitBook Publish Setup](../gitbook-publish-setup.md)
2. `docs/.vitepress/config.mts`
3. `scripts/validate-content.mjs`

### For Data And Content Pipeline Work

1. [Combat Design Reference](../architecture/combat-design-reference.md)
2. `BazaBK/`
3. `scripts/parse-bazakbk-pages.mjs`
4. `scripts/generate-bazakbk-starter-items.mjs`

---

## Common Systems Tasks

- locating the correct layer before making a change
- tracing data flow from module logic into UI state or presentation
- checking whether a docs change also needs code or workflow updates
- reviewing architecture boundaries before deep refactors
- keeping Battle Kings source data, generated items, and live combat runtime in sync

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
- `BazaBK/`
  - local source-data layer for imported item pages, images, and parsed catalogs

---

## Related Docs

- [Docs Home](../)
- [Gameplay](../gameplay/)
- [Architecture](../architecture/)

---

> Last updated: 2026-03-16 02:42 MSK
