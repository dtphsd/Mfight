# ADR-001: Modular Headless Core

## Status

Accepted.

## Decision

Use a headless game core with React as a separate UI layer.

## Consequences

- Gameplay logic remains testable without rendering.
- Modules communicate through contracts and events.
- Save, RNG, and time are abstracted from domain logic.

