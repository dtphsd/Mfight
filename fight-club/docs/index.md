---
layout: home

hero:
  name: "Fight Club Docs"
  text: "A repo-native wiki for gameplay, systems, combat runtime, and item-data flow"
  tagline: "Read the project by role: gameplay, systems, architecture, decisions, docs workflow, and Battle Kings data imports all ship with the same codebase."
  actions:
    - theme: brand
      text: Start With Gameplay
      link: /gameplay/
    - theme: alt
      text: Explore Systems
      link: /systems/
    - theme: alt
      text: Read Architecture
      link: /architecture/

features:
  - title: Gameplay
    details: Follow the player-facing combat model, balance logic, Battle Kings item baseline, and combat reference without digging through source files first.
  - title: Systems
    details: Trace the runtime from modules to orchestration to UI boundaries, documentation workflow, and generated item data.
  - title: Architecture
    details: Read the project from high-level structure down into combat sequencing and long-term system direction.
  - title: Decisions
    details: Keep architectural rationale and major tradeoffs discoverable next to live runtime docs.
  - title: Data Pipeline
    details: Keep local Battle Kings HTML sources, parsed catalogs, and generated starter items aligned with live combat behavior.
  - title: Publishing
    details: The same markdown source supports local reading, GitHub Pages, and GitBook-style handoff.
---

## Choose Your Entry Point

### Gameplay

- [Gameplay Hub](./gameplay/)
- [Combat Design Reference](./architecture/combat-design-reference)
- [Combat System Roadmap](./architecture/combat-system-roadmap)

### Systems

- [Systems Hub](./systems/)
- [Architecture Overview](./architecture/)
- [ADR-001: Modular Headless Core](./decisions/ADR-001-architecture)

### Architecture

- [Architecture Hub](./architecture/)
- [Architecture Overview](./architecture/overview)
- [Combat Design Reference](./architecture/combat-design-reference)

### Publishing And Docs Workflow

- [GitBook Publish Setup](./gitbook-publish-setup)
- `docs/.vitepress/config.mts`
- `scripts/validate-content.mjs`

## Quick Paths By Role

### Designer / Balance

1. [Gameplay Hub](./gameplay/)
2. [Combat Design Reference](./architecture/combat-design-reference)
3. `docs/balance/latest-build-matrix.md`
4. `BazaBK/parsed/summary.json`

### Engineer

1. [Systems Hub](./systems/)
2. [Architecture Overview](./architecture/overview)
3. [ADR-001: Modular Headless Core](./decisions/ADR-001-architecture)

### Data / Content

1. [Systems Hub](./systems/)
2. [Combat Design Reference](./architecture/combat-design-reference)
3. `BazaBK/`
4. `scripts/parse-bazakbk-pages.mjs`

### Maintainer / Publisher

1. [GitBook Publish Setup](./gitbook-publish-setup)
2. `docs/.vitepress/config.mts`
3. [Architecture Hub](./architecture/)

## Core Sources Of Truth

- gameplay runtime:
  - `src/modules/combat/`
  - `src/orchestration/combat/`
- UI contract:
  - `src/ui/hooks/useCombatSandbox.ts`
  - `src/ui/screens/Combat/CombatSandboxScreen.tsx`
- player-facing rules:
  - `src/ui/screens/CombatRules/`
- docs and publishing:
  - `docs/`
  - `.github/workflows/deploy-docs-pages.yml`
