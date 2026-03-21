---
title: Architecture
---

# Architecture

> Last updated: 2026-03-21 13:10 MSK

This section is the engineering map for `Fight Club`.

Use it when you need to understand where logic belongs before making code changes or when you need to trace how the runtime, orchestration, UI, and docs depend on each other.

---

## Who This Section Is For

<div class="docs-hub-grid">
  <div class="docs-hub-card">
    <h3>Maintainers</h3>
    <p>Use this section to keep the project shape legible as features, docs, and UI layers keep evolving.</p>
  </div>
  <div class="docs-hub-card">
    <h3>Feature Work</h3>
    <p>Use it before touching combat, orchestration, or screens that depend on multiple layers at once.</p>
  </div>
  <div class="docs-hub-card">
    <h3>Code Review</h3>
    <p>Use it to sanity-check whether a change belongs in the right layer and whether adjacent modules are being respected.</p>
  </div>
</div>

## Reading Paths

### Start Here

1. [Architecture Overview](./overview)
2. [Combat Design Reference](./combat-design-reference)
3. [Combat System Roadmap](./combat-system-roadmap)
4. [Hunting Runtime Reference](./hunting-runtime-reference)
5. [Online Duel Ops Runbook](./online-duel-ops-runbook)

### If You Are Changing Combat

- read the [Combat Design Reference](./combat-design-reference)
- check the [Combat System Roadmap](./combat-system-roadmap)
- use the runtime and test traceability notes before editing formulas or sequencing

### If You Are Reviewing Structure

- use [Architecture Overview](./overview)
- then check [ADR-001: Modular Headless Core](../decisions/ADR-001-architecture)

---

## Common Architecture Tasks

- deciding whether a rule belongs in `modules`, `orchestration`, or `ui`
- checking whether a docs change must accompany a runtime change
- planning a refactor without breaking adjacent systems
- reviewing how combat behavior flows into player-facing surfaces
- tracing how hunting resolves, claims rewards, and bridges into shared inventory
- verifying how the live PvP HTTP/SSE service should be started and exposed safely

---

## Pages In This Section

- [Architecture Overview](./overview)
- [Combat Design Reference](./combat-design-reference)
- [Hunting Runtime Reference](./hunting-runtime-reference)
- [Online Duel Ops Runbook](./online-duel-ops-runbook)
- [Hunting MVP Blueprint](./hunting-mvp-blueprint)
- [Combat System](./combat/)
- [Combat Model And Flow](./combat/model-and-flow)
- [Combat Round Walkthrough](./combat/round-walkthrough)
- [Combat Formulas And Effects](./combat/formulas-and-effects)
- [Combat Integrations And Verification](./combat/integrations-and-verification)
- [Combat Verification And Tests](./combat/tests-and-traceability)
- [Combat System Roadmap](./combat-system-roadmap)

---

## Related Docs

- [Docs Home](../)
- [Systems](../systems/)
- [Decisions](../decisions/)

---

> Last updated: 2026-03-21 13:10 MSK
