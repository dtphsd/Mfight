# Fight Club Docs

> Last updated: 2026-03-14 00:41 MSK

This folder is the GitBook-ready documentation set for the `Fight Club` project.

Use it as the main reading path when onboarding, reviewing architecture, or planning safe changes.

---

## Recommended Reading Order

1. [Architecture Overview](./architecture/overview.md)
2. [Combat Design Reference](./architecture/combat-design-reference.md)
3. [Combat System Roadmap](./architecture/combat-system-roadmap.md)
4. [ADR-001: Modular Headless Core](./decisions/ADR-001-architecture.md)
5. [GitBook Publish Setup](./gitbook-publish-setup.md)

For GitBook navigation, use [SUMMARY.md](./SUMMARY.md).

---

## Sections

### Architecture

- [Architecture Overview](./architecture/overview.md)
- [Combat Design Reference](./architecture/combat-design-reference.md)
- [Combat System Roadmap](./architecture/combat-system-roadmap.md)

### Decisions

- [ADR-001: Modular Headless Core](./decisions/ADR-001-architecture.md)

### Publishing

- [GitBook Publish Setup](./gitbook-publish-setup.md)

### Generated And Operational Artifacts

- `balance/`
  - generated balance reports such as `latest-build-matrix.md`
- `backup-points/`
  - recovery checkpoints and preserved rollback artifacts

These operational folders are useful for engineering work, but they are not the primary GitBook reading flow.

---

## Documentation Rules

- Code is always the source of truth.
- If documentation diverges from runtime behavior, update the docs from real code.
- Combat-system changes must keep the combat reference synchronized.
- UI and player-facing rule explanations must stay aligned with runtime and generated facts.

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

---

> Last updated: 2026-03-14 00:41 MSK
