# ADR-001: Modular Headless Core

> Last updated: 2026-03-14 12:18 MSK

---

## Status

Accepted.

## Decision

Use a headless game core with React as a separate UI layer.

## Consequences

- Gameplay logic remains testable without rendering.
- Modules communicate through contracts and events.
- Save, RNG, and time are abstracted from domain logic.

---

## Related Docs

- [Docs Home](../)
- [Architecture Overview](../architecture/overview.md)
- [Combat Design Reference](../architecture/combat-design-reference.md)

---

> Last updated: 2026-03-14 12:18 MSK
