# Backend Patch Notes

> Last updated: 2026-03-20 01:00 MSK

Use this file as the canonical running log only for backend-system changes connected to the Backend Systems Agent.

Include here:

- backend architecture changes
- service-boundary decisions
- online duel authority changes
- sync and reconnect design changes
- backend safety and deployment changes

Do not include here:

- unrelated combat balance work
- unrelated UI-only work
- hunting-only tuning
- generic app notes with no backend impact

Patch note rule for backend work:

- if a change is measurable, include exact numbers
- use `old -> new` format when ports, limits, timers, retries, or payload shapes change
- do not write vague notes like "cleaned up backend a bit"

---

## 2026-03-19 - Backend Master Console Introduced

- Added a third specialist agent based on the same `Ecosystem Agents` shell as `Combat Master` and `UI Master`.
- Introduced dedicated backend memory surfaces:
  - `backend_agent_journal.md`
  - `backend_patch_notes.md`
- Wired `Backend Master` into the in-app specialist tab flow instead of creating a separate disconnected screen.
- Extended specialist helper expectations so backend work can evolve through the same journal and patch-note discipline.

## 2026-03-19 - Online Duel Phase 1 Authority Contracts Started

- Added a dedicated feature track and execution roadmap for real `1v1 online`:
  - `MASTER-PLAN.md`
  - `features/online-duel-1v1.md`
- Turned `src/modules/arena/` from a placeholder into the first backend-safe duel domain slice.
- Added authority-ready room lifecycle code:
  - `waiting_for_players -> planning -> ready_to_resolve -> finished`
- Added pure application functions for:
  - room creation
  - second-player join
  - round action submission
  - authority-side round resolution through the existing combat core
- Added first realtime transport contracts for future client/server sync:
  - `join_duel`
  - `submit_round_action`
  - `request_duel_sync`
  - `duel_state_sync`
  - `round_ready`
  - `round_resolved`
  - `duel_error`
- Added backend verification coverage:
  - `arenaOnlineDuel.test.ts: 4 tests passed`

## 2026-03-19 - In-Memory Duel Authority Service Added

- Added a real backend-like authority wrapper around duel rooms:
  - `createInMemoryOnlineDuelService(...)`
- The service now owns:
  - room registry
  - `createRoom(...)`
  - `getRoom(...)`
  - `joinRoom(...)`
  - `submitAction(...)`
  - `resolveRound(...)`
  - `buildStateSync(...)`
- Added sync payload generation through `createOnlineDuelStateSync(...)`
- Expanded backend verification coverage:
  - `arenaOnlineDuel.test.ts: 4 -> 5 tests`

## 2026-03-19 - First Duel Transport Adapter Added

- Added transport-facing handling for:
  - `create_duel`
  - `join_duel`
  - `request_duel_sync`
  - `submit_round_action`
- Added matching server-side messages:
  - `duel_created`
  - `duel_state_sync`
  - `round_ready`
  - `round_resolved`
  - `duel_error`
- The transport adapter now auto-resolves the round once both player submissions are present.
- Expanded backend verification coverage:
  - `arenaOnlineDuel.test.ts: 5 -> 7 tests`

## 2026-03-19 - Local Online Duel Client Added

- Added a frontend-facing local transport seam:
  - `createLocalOnlineDuelTransport(...)`
  - `createOnlineDuelClient(...)`
- The local client now wraps:
  - `createDuel(...)`
  - `joinDuel(...)`
  - `requestSync(...)`
  - `submitRoundAction(...)`
  - `getLastSync()`
- This lets future UI work talk to an online-style client surface instead of raw room or authority-service objects.
- Expanded backend verification coverage:
  - `arenaOnlineDuel.test.ts: 7 -> 8 tests`

## 2026-03-19 - Online Duel Lab Wired To The Local Backend Seam

- Added the first UI-safe online host/join surface:
  - `OnlineDuelLabScreen.tsx`
- The screen now talks through:
  - local duel client
  - local transport
  - duel transport adapter
  - in-memory authority service
- This keeps the online backend flow visible in the app without coupling early multiplayer work to the main `Combat Sandbox`.

## 2026-03-19 - Pre-Fight Lobby Ready Gate Added

- Added a real `lobby` phase between join and active round planning.
- Added readiness control to the backend contracts:
  - `set_ready`
  - `readiness_updated`
  - `duel_ready`
- Added explicit readiness state into sync payloads for both seats.
- Round submission is now blocked in `lobby` until both sides are ready.
- Expanded backend verification coverage:
  - `arenaOnlineDuel.test.ts: 8 -> 9 tests`

## 2026-03-19 - Room Code And Reconnect State Entered The Duel Authority Layer

- Added a dedicated room identity field:
  - `sync payload fields: 5 -> 6`
  - `duel_created payload fields: 2 -> 3`
  - `roomCode` is now part of duel sync instead of being inferred only from raw room id
- Added first-pass participant connection control:
  - `client actions: 5 -> 6`
  - `client message types: 5 -> 6`
  - `server message types: 7 -> 8`
- Added authority-side connection updates through:
  - `setOnlineDuelConnectionState(...)`
  - `connection_updated`
- Disconnects now pause the room safely:
  - `planning/connected -> lobby/offline`
  - pending round submissions reset when the room is paused before resolution
- Expanded backend verification coverage:
  - `arenaOnlineDuel.test.ts + onlineDuelLabScreen.test.tsx: 10 -> 11 tests`

## 2026-03-19 - Stale Room Timeout Sweep Entered The Authority Service

- Added authority-side timeout hardening through:
  - `hardenOnlineDuelTimeouts(...)`
  - `expireStaleRooms(now?)`
- Added first timeout policy defaults:
  - `lobbyTimeoutMs: 300000`
  - `planningTimeoutMs: 180000`
  - `reconnectGraceMs: 120000`
- Stale rooms now resolve to:
  - `active states -> abandoned`
  - `ready flags -> cleared`
  - `pending submissions -> cleared`
- Expanded backend verification coverage:
  - `arenaOnlineDuel.test.ts + onlineDuelLabScreen.test.tsx: 11 -> 12 tests`

## 2026-03-19 - Online Duel Flow Graduated From Lab Wiring To Room-Code Match Flow

- The frontend integration target is now the product-facing `Online Duel` screen instead of `Online Duel Lab`.
- The backend seam now supports the full local room-code flow the UI actually uses:
  - host creates room
  - guest joins by `roomCode`
  - disconnected guest can rejoin through the same code
- The frontend-safe authority contract is now exercised through:
  - `Host Side` / `Guest Side` views
  - ready-state gate
  - planner-driven round submit instead of hardcoded attack payloads
- Debug-only lifecycle controls remain available, but the visible default flow is now much closer to a real room UX.
- Expanded backend verification coverage:
  - `arenaOnlineDuel.test.ts: 12 -> 13 tests`
  - `onlineDuelScreen.test.tsx: 0 -> 1 test`

## 2026-03-20 - Backend Docs And Specialist Progression Re-Synced

- Re-synced backend-facing docs with the real current online slice:
  - local HTTP authority service
  - SSE room updates
  - session handoff and reconnect recovery
  - server-owned rematch and leave-room flow
- Re-synced `Backend Master` specialist docs to the shared `1 -> 100` TAMA progression ladder.
- Current documented backend snapshot:
  - `Total XP: 99`
  - `Level: 17`
  - `Next Level XP: 100`
