# Fight Club Docs

> Last updated: 2026-03-20 01:00 MSK

This folder is the GitBook-ready documentation set for the `Fight Club` project.

Use it as the main reading path when onboarding, reviewing architecture, planning safe changes, or checking live combat behavior against the code.

The current docs baseline now reflects:

- Battle Kings item imports through `BazaBK/`
- zone-based armor and roll-based block
- cooldown-aware combat skills
- synchronized `Combat Rules` content and verification guidance
- the current backend-first `Online Duel` host/join flow with room code, SSE sync, and live two-client verification

---

## Recommended Reading Order

1. [Gameplay](./gameplay/index.md)
2. [Systems](./systems/index.md)
3. [Architecture Overview](./architecture/overview.md)
4. [Combat Design Reference](./architecture/combat-design-reference.md)
5. [ADR-001: Modular Headless Core](./decisions/ADR-001-architecture.md)
6. [GitBook Publish Setup](./gitbook-publish-setup.md)

For GitBook navigation, use [SUMMARY.md](./SUMMARY.md).

---

## Sections

### Gameplay

- [Gameplay](./gameplay/index.md)
- [Combat Design Reference](./architecture/combat-design-reference.md)
- [Combat System Roadmap](./architecture/combat-system-roadmap.md)

### Systems

- [Systems](./systems/index.md)
- [Architecture Overview](./architecture/overview.md)
- [GitBook Publish Setup](./gitbook-publish-setup.md)

### Architecture

- [Architecture Overview](./architecture/overview.md)
- [Combat Design Reference](./architecture/combat-design-reference.md)
- [Combat System Roadmap](./architecture/combat-system-roadmap.md)
- [Hunting Runtime Reference](./architecture/hunting-runtime-reference.md)

### Decisions

- [ADR-001: Modular Headless Core](./decisions/ADR-001-architecture.md)

### Generated And Operational Artifacts

- `balance/`
  - generated balance reports such as `latest-build-matrix.md`
- `backup-points/`
  - recovery checkpoints and preserved rollback artifacts
- `../BazaBK/`
  - local source pages, images, parsed catalogs, and generation inputs for combat item imports

These operational folders are useful for engineering work, but they are not the primary GitBook reading flow.

---

## Documentation Rules

- Code is always the source of truth.
- If documentation diverges from runtime behavior, update the docs from real code.
- Combat-system changes must keep the combat reference synchronized.
- UI and player-facing rule explanations must stay aligned with runtime and generated facts.
- online-duel screen flow and docs must use the current product names, not retired `Lab` wording.
- specialist-master docs should derive visible level progression from `Total XP`, not from stale hardcoded level values.

---

## Main Sources Of Truth

- runtime combat:
  - `src/modules/combat/`
  - `src/orchestration/combat/`
- UI contract:
  - `src/ui/hooks/useCombatSandbox.ts`
  - `src/ui/screens/Combat/CombatSandboxScreen.tsx`
- player-facing rules:
  - `src/ui/screens/CombatRules/`
- source-data pipeline:
  - `BazaBK/`
  - `scripts/parse-bazakbk-pages.mjs`
  - `scripts/generate-bazakbk-starter-items.mjs`

---

> Last updated: 2026-03-20 01:00 MSK
