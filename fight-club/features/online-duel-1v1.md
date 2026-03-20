# Online Duel 1v1

> Last updated: 2026-03-20 18:50 MSK

**Feature:** online-duel-1v1  
**Status:** IN PROGRESS

---

## Why

The project wants to evolve from a local combat sandbox into a real `1v1 online` duel mode.

That requires a backend-authoritative architecture instead of a purely client-side combat loop.

---

## Problem

The current game has:

- no backend runtime
- no room lifecycle
- no realtime sync contract
- no reconnect model
- no server-side authority boundary

The combat core itself is reusable, but it still lives inside a local-only app shell.

---

## Root Cause

Combat logic already exists as pure domain code, but there is no duel domain wrapped around it.

Missing layers:

- duel room state
- participant/session contracts
- round submission contract
- authority-side round resolution flow
- transport-level message schema

Without those layers, any future online implementation would either duplicate combat logic or trust the client too much.

---

## Solution

Build `1v1 online` in phases.

### Phase 1 - Authority-ready duel domain

Create a shared domain layer that works both in local tests and in a future backend service:

- duel room model
- participant/session model
- round submission model
- server-intent lifecycle: `waiting_for_players -> lobby -> planning -> ready_to_resolve -> finished`
- pure application functions to create a room, join it, submit actions, and resolve a round through the existing combat core
- transport contracts for future websocket/http sync

### Phase 2 - Local adapter and verification

Add a local adapter that can simulate backend-authoritative duel flow without network transport:

- create duel rooms in memory
- feed player actions as if they came from remote clients
- verify room state transitions and round sequencing

### Phase 3 - Real backend service

Add the first backend runtime:

- room registry
- session identity
- first HTTP authority endpoint
- realtime transport
- authoritative round resolution
- reconnect-safe state sync

### Phase 4 - Client integration

Connect the frontend to the backend duel runtime:

- `PvP` menu entry instead of a duel-lab naming surface
- dedicated `PvP` pre-match screen
- left side reuses the normal player build stack:
  - silhouette
  - `Builder`
  - `Builds`
  - `Inventory`
- right side becomes room-entry and matchmaking:
  - create game
  - join by code
  - ready
  - matchmaking
- after room entry, transition into the standard combat screen
- replace the bot-side runtime with the connected remote player
- reconnect and timeout feedback

### Phase 5 - Hardening

Add production safety around:

- disconnect handling
- stale action rejection
- idempotent round resolution
- match cleanup
- deployment and observability

---

## Architecture Direction

The core rule is:

- frontend chooses actions
- backend owns duel state
- backend resolves rounds
- frontend renders synced duel state

The existing combat runtime should stay reusable, but it must be consumed by the duel authority layer instead of being trusted as final client truth.

---

## Phase 1 Scope

Phase 1 is intentionally limited.

It should include:

- pure duel models and contracts
- authority-side application functions
- tests for room join, action submission, and round resolution

It should not yet include:

- real sockets
- real server process
- auth accounts
- persistence
- matchmaking UI

---

## Risks

- trusting client-computed combat results instead of server-resolved rounds
- coupling duel state too tightly to sandbox UI state
- introducing transport assumptions before room/domain contracts are stable
- skipping reconnect/time authority concerns until too late

---

## Affects

- `src/modules/arena/*`
- `src/modules/combat/*`
- `MASTER-PLAN.md`
- `TAMA_start/backend_*`

---

## Status

`TODO | IN PROGRESS | DONE | DEFERRED`

Current state:

Phases 1 through 4 are partially live. The duel room domain is live, the in-memory authority service wraps room creation and round resolution, the local and HTTP transports are wired, the Node authority service exposes HTTP plus SSE, and the product flow now goes through a real `PvP` lobby into a combat-like fight screen instead of staying inside a duel-lab-only surface.

Current frontend-safe state now goes further than the original lab milestone:

- the menu and lobby language is now `PvP`, not `Online Duel Lab`
- room entry is driven by `roomCode`, not internal duel id
- the main match surface now centers on a combat-like `PvP Fight` stage instead of a room dashboard
- the screen still includes live match-status summaries for room creation, join, ready check, and action phase
- round submission now goes through a small attack/defense planner instead of hardcoded submit actions
- the main room flow now also has explicit match-finish UX with `Leave Room` and `Play Another Match`, so players can exit a closed room or reset into a fresh create/join state without using debug-only controls
- `Match Status` now surfaces product-facing outcome text too, so the room can clearly report `winner`, `Room closed`, or `In progress`
- `Play Another Match` is now server-owned too: the room can reset into a fresh `lobby` with the same participants and room code instead of relying on a frontend-only reset
- `Leave Room` is now server-owned as well: leaving is treated as a real room-closing action, not just a local UI exit
- the default match surface is cleaner now: session ids and manual refresh controls no longer sit in the player-facing flow and instead live under `Debug Tools`
- the default online view now centers on `Your Side` instead of opening with `Host Side / Guest Side` toggles, so the product surface reads more like one player's room than a two-seat operator console
- room setup now starts with a `Create Match / Join Match` choice instead of exposing host-create and guest-join forms side by side by default
- only the currently chosen room-entry intent is visible now, so the setup area no longer asks the player to read both onboarding roles at once
- the active match panel now stays neutral too: normal play goes through one `Your Side` card with role and opponent context, while host/guest switching survives only inside `Debug Tools`
- disconnect, reconnect, session reset, and timeout controls are still available, but only under `Debug Tools`

The first backend-safe runtime slice is now also in place:

- `npm run online:server` starts a real Node HTTP process around the arena authority layer
- `GET /health` exposes a simple health check for the service
- `POST /api/online-duel/message` accepts the same `OnlineDuelClientMessage` contract already used by the local transport seam
- backend verification now covers health, room creation, room-code join, and malformed request rejection through a live HTTP test
- the transport seam is now async end to end, so the same duel client can talk to either the local adapter or the HTTP authority slice
- the `Online Duel` screen now prefers the live backend automatically and falls back to local authority when the service is not available
- the backend contract now exposes a compact server-owned round summary with commentary, damage outcome, and fighter HP state
- the `Online Duel` screen renders that summary as a post-round result card instead of relying on raw debug messages alone
- duel sync now carries an explicit `revision` marker for freshness tracking
- the authority rejects stale round submissions when a client tries to act on an old round, instead of silently accepting outdated combat intent
- the live HTTP service now also exposes `GET /api/online-duel/events`, so active players can receive pushed `duel_state_sync` updates over server-sent events
- the online duel client seam can now accept inbound server messages, and the screen subscribes to the event stream while a backend-backed room is active
- pushed sync now respects `revision` freshness in the client seam, so a stale event cannot roll the room state backward after reconnect
- the online screen now performs an authoritative sync when the event stream opens or errors, giving the current SSE transport a first state-resume recovery path without introducing a second backend channel
- sync recovery is now bound to a server-issued `resumeToken` per seat, so `requestSync` and SSE reattach no longer trust `playerId` alone
- when a player rejoins with a fresh session, the server rotates that seat's `resumeToken`, which invalidates stale recovery channels and gives reconnect ownership a clearer backend source of truth
- pushed SSE room updates now carry event ids, and the HTTP service keeps a short per-seat room-event history for reconnect recovery
- reconnecting clients can now pass `afterEventId`, so the backend can replay missed seat-specific sync events instead of always forcing a blind fresh snapshot
- live duel mutations now also validate `sessionId`, so seat ownership is enforced for `ready`, `submit`, and connection changes instead of only sync recovery
- a newer live same-player join can now hand off the seat to a fresh session, and the displaced older session is rejected with `displaced_session` if it tries to keep mutating the room
- SSE replay now restores the core round lifecycle too, so reconnect can receive `round_ready` and `round_resolved` in addition to the latest synced room state
- the online screen now keeps reconnect cursors fresh across non-sync SSE events, so replay can resume from the real latest round event instead of lagging behind on the last room snapshot only
- the authority now accepts a dedicated `rematch_duel` message, so closed or abandoned rooms can restart a clean round-1 match inside the same room without re-creating the duel
- backend verification now covers that rematch flow through the live HTTP endpoint as well as the pure arena service
- the authority now also accepts `leave_duel`, which closes the room into `abandoned` immediately instead of overloading temporary disconnect for deliberate exit semantics
- the online screen now routes `Leave Room` through that backend policy before returning to a clean create/join state
- the backend now has a dedicated live two-client validation test, so one real server process is exercised by two independent HTTP clients and two SSE subscriptions instead of only single-surface lab interactions
- the online screen itself is now less lab-heavy too: product-facing panels no longer expose raw session identity or manual sync buttons by default, while the debug section still preserves those tools for development and verification
- the active fight panel is now presented as `Your Side`, while explicit host/guest side switching survives only as a debug affordance for local two-seat verification
- the room-entry layer now also reflects that product direction: players choose one entry intent first, then see only the create or join flow that matches it
- the current online setup flow now goes one step further and hides the unselected onboarding path entirely, which keeps room setup focused on one player's immediate action instead of showing both branches at once
- the dedicated `PvP` lobby is now real too:
  - it reuses the normal player build stack
  - it supports create, join by code, and matchmaking
  - it hands a prepared fighter into the backend-driven fight flow
- the player-facing PvP fight screen now mirrors the bot-fight layout much more closely:
  - left side is the local player
  - center is the combat-like ready / planning / round-result flow
  - right side is the second player instead of the bot
- lobby-launched PvP now requires the live backend; if `online:server` is unavailable, the screen surfaces an explicit `live_service_required` warning instead of silently creating a fake local room code
- action submission is now protected by immediate local lock state as well as authority-side submit ownership, which reduces accidental duplicate `already_submitted` errors during live play

---

## Product Target

The intended player-facing flow is now explicit:

1. Main menu offers two separate modes:
   - bot mode
   - `PvP`
2. `PvP` opens a dedicated pre-match screen, not a separate duel-lab combat UI.
3. That pre-match screen keeps the existing player build experience on the left:
   - silhouette
   - `Builder`
   - `Builds`
   - `Inventory`
4. The right side is a room-entry panel:
   - create game
   - join by code
   - ready
   - matchmaking
5. Once the player creates, joins, or is matched into a room, the app transitions into the standard combat screen.
6. In that combat screen, the remote player replaces the bot while the normal combat layout stays intact.

## Remaining Work

The project now has a playable local-network PvP flow, but it is not yet a fully complete online fighting product.

High-priority remaining work:

1. Harden round-to-round live sync beyond the current happy path.
   - verify several consecutive live rounds, reconnect mid-fight, and stale-action edge cases against the real HTTP/SSE service
2. Finish the player-facing combat parity pass.
   - remove remaining room-language and any residual lab/debug feel from the normal PvP route
3. Harden live matchmaking.
   - validate queue pairing, cancellation, timeout, and reconnect behavior through the actual backend path
4. Improve disconnect and rejoin UX.
   - make recovery states, seat ownership, and wait-for-opponent states clearer for real players
5. Add deployment-ready backend work.
   - the service is still local-only; there is no public host, account identity, or production session boundary yet
6. Add fuller regression coverage for real PvP product flows.
   - especially multi-round UI behavior, rematch loops, and live two-client screen parity
7. Decide the first production boundary.
   - local LAN-style prototype only, or a public hosted PvP slice with real accounts and operational visibility

## Full Online Fight Definition

For this project, `full online fight` should mean all of the following are true at once:

- two real players can create, join, or matchmake into the same fight through the backend path
- the fight can play through multiple rounds without manual recovery
- disconnect and rejoin are understandable and recoverable in normal UX
- the product-facing PvP screen is the standard combat screen with the second player replacing the bot
- rematch, leave-room, and matchmaking are server-owned and reliable
- the backend is no longer only a local developer service
- there is a real identity and trust model instead of anonymous local sessions only

---

> Last updated: 2026-03-20 18:50 MSK
