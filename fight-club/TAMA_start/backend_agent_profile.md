# Backend Agent Profile

> Last updated: 2026-03-20 01:00 MSK

This file defines the dedicated gamified progression profile for the future `backend-agent`.

It exists to give backend work its own:

- XP and rank structure
- mastery tracks
- achievement logic
- backend-safe memory boundaries

---

## Purpose

`Backend Master` is the specialist profile responsible for backend architecture and service truth as the project grows toward online duel play.

It should focus on:

- authoritative combat state
- API and transport contracts
- room and session lifecycle
- reconnect and timeout behavior
- safe backend evolution and deployment readiness

The specialist console uses the same shared progression shape as the other masters:

- levels run from `1` to `100`
- backend level is derived from journal `Total XP`
- `Next Level XP` should reflect the next threshold on that ladder instead of a fixed rank checkpoint

---

## Mastery Tracks

- `API Design`
- `State Authority`
- `Realtime Sync`
- `Service Safety`
- `Deployment Readiness`

---

## Supporting Files

- [backend_agent_journal.md](/c:/Users/dtphs/.vscode/Project/fight-club/TAMA_start/backend_agent_journal.md)
- [backend_patch_notes.md](/c:/Users/dtphs/.vscode/Project/fight-club/TAMA_start/backend_patch_notes.md)

---

> Last updated: 2026-03-20 01:00 MSK
