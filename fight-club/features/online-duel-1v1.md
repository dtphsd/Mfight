# Online Duel 1v1

> Last updated: 2026-03-22 22:05 MSK

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
  - center is the live combat flow with ready / planning / intent / skills / consumables
  - right side is the second player instead of the bot
- the live PvP combat flow now shows a real combat log instead of relying only on a round-summary card
- most of the earlier room-dashboard copy has been removed from the normal lobby-launched fight route, so the standard product path reads like combat rather than transport debug
- lobby-launched PvP now requires the live backend; if `online:server` is unavailable, the screen surfaces an explicit `live_service_required` warning instead of silently creating a fake local room code
- action submission is now protected by immediate local lock state as well as authority-side submit ownership, which reduces accidental duplicate `already_submitted` errors during live play
- live room recovery is now single-player-safe:
  - SSE attach and sync recovery use the active player session instead of assuming both local debug seats exist on one screen
  - guest rematch now uses the correct active client instead of always routing through the host seam
  - multi-round regressions now cover repeated round resolution after the second exchange instead of only the first happy-path round
- authority ownership is now much stronger than the original prototype:
  - room participants now keep server-owned baseline snapshot and loadout data
  - reconnect no longer mutates those baselines silently
  - rematch now restores the original baseline build instead of reusing runtime-spent consumables
  - clients submit only combat selections, while the server rebuilds the real `RoundAction`
  - consumables are now decremented from server-owned runtime loadout after successful round resolution
- opponent-facing combat presentation is now closer to full server truth:
  - synced room state now carries player and opponent snapshots for the active seat
  - PvP stat cards and combat summaries no longer rely as heavily on local fallback data
- the PvP screen itself is now partially decomposed:
  - transport/setup helpers live in sibling modules
  - major panels, cards, and lobby UI moved out of `OnlineDuelScreen`
  - the remaining screen is much closer to an orchestration shell than the earlier monolith
- matchmaking UX is now more player-facing:
  - queued search can be paused or resumed from the live lobby
  - stale search can surface an explicit timeout state instead of looking frozen
  - recovery CTA now guides the player back into search instead of leaving the room in an unclear queue state
- regression coverage now goes beyond the original happy path:
  - stale queued matchmaking rooms are covered
  - `abandoned -> rematch -> reconnect SSE` is covered
  - `search -> stop -> resume -> match found -> first round resolve` is covered through the live HTTP plus SSE path

Today's milestone moves the feature from "LAN-playable prototype" into "first remote-playable prototype":

- the repo root now has launcher scripts for quick remote bootstrap:
  - `start-online-pvp-quicktunnel.ps1`
  - `start-online-pvp-quicktunnel.bat`
  - `stop-online-pvp-quicktunnel.ps1`
  - `stop-online-pvp-quicktunnel.bat`
- the launcher now writes `public/online-duel-runtime.json`, and the `Admin Dashboard` reads it to prefill tunnel URLs and operator readiness state
- the `Admin Dashboard` can also apply the backend tunnel as the browser runtime PvP URL before opening the fight screen
- one real remote quick-tunnel match is now confirmed playable end to end
- the player-facing fight screen now exposes:
  - compact `Match Code` inside `Fight Controls`
  - `Round Progress`
  - `Wait Status`
  - a single toggle-style `Ready Up / Cancel Ready` control
- online combat presentation now also restores:
  - impact effects for hit / crit / block / dodge / penetration-style outcomes
  - profile-modal access from the PvP screen
- the live authority and UI bugs closed in this pass include:
  - unique online combatant ids when both seats use the same fighter template
  - correct winner/result lookup for same-name fighters
  - skill submission validation against the active synced loadout instead of stale local fallback
- regression coverage now includes a dedicated live PvP program:
  - `npm run test:pvp`
  - `npm run test:pvp:matrix`
  - `npm run test:pvp:soak`
  - `npm run test:pvp:fuzz`

Remaining highest-value gap after today's work:

- public-host hardening is still incomplete:
  - stronger authority validation
  - clearer reconnect and stale-sync semantics
  - safer ops/deployment defaults
- PvP UI parity is still incomplete:
  - freshest-state selection should prefer `revision`
  - opponent resource presentation should come from live truth instead of fallback
  - online-specific UI tests should cover animation/result/profile parity more directly
  - a longer live two-client lifecycle now covers `finished -> rematch -> leave`
  - the local player-facing screen now also covers `resolve round -> room closed -> rematch -> leave`

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
   - align final spacing, silhouette positioning, and panel rhythm even more closely with the bot-fight screen
   - keep the normal PvP route free of empty wrapper cards and debug-only framing
3. Harden live matchmaking.
   - validate queue pairing, cancellation, timeout, and reconnect behavior through the actual backend path
   - continue from the new pause/resume and timeout baseline toward a fuller player-facing search lifecycle
4. Improve disconnect and rejoin UX.
   - make recovery states, seat ownership, and wait-for-opponent states clearer for real players
   - keep polishing finish-state and opponent-offline paths so they read like product UX instead of transport recovery
5. Add deployment-ready backend work.
   - the service now has deploy profiles, health diagnostics, proxy guidance, env examples, and basic rate limiting, but it is still pre-production
   - there is still no auth, persistence, or full production session boundary
   - the current public-network prototype still needs stronger abuse resistance and real operational rollout validation
6. Add fuller regression coverage for real PvP product flows.
   - especially longer two-client UI behavior, matchmaking timeout loops, and more end-to-end parity checks
   - the newest UI lifecycle coverage now protects post-round rematch and return-to-create behavior, but more real backend-backed screen parity is still desirable
7. Decide the first production boundary.
   - local LAN-style prototype only, or a public hosted PvP slice with real accounts and operational visibility

## PvP Improvement Plan

This is the recommended execution order for the next PvP pass.

### Phase 1 - Final Combat-Screen Parity

Goal: make the normal PvP fight screen feel visually identical to the bot-fight screen unless multiplayer state truly requires a difference.

- finish the remaining layout polish around silhouette placement, stage proportions, and panel density
- remove any remaining room-code, room-state, or onboarding phrasing from the active fight surface
- keep debug and transport diagnostics available only behind explicit developer affordances
- add one visual regression checklist for:
  - combat log visible
  - intent visible and color-coded
  - player card reacts to selected intent
  - skills and consumables visible in live PvP

### Phase 2 - Reconnect And Match-State UX

Goal: make real-player failures understandable instead of looking like a frozen fight.

- surface clearer `waiting`, `reconnecting`, `opponent left`, and `room closed` states
- make round-lock and round-resolve transitions feel explicit in the UI
- improve rematch, leave-room, and return-to-lobby handling after finished or abandoned rooms
- verify reconnect across:
  - before ready
  - mid-planning
  - after round resolve
  - after rematch reset

Current progress in this phase:

- the PvP screen now shows explicit live-state banners for reconnect, stale room sync, opponent disconnect, displaced session, and closed room cases
- battle actions are now suppressed when the session is displaced, the room is closed, or the seat is temporarily offline, and the screen shows explicit recovery CTAs instead
- matchmaking search now also has explicit player-facing `paused` and `timeout` states instead of silently staying queued forever
- recovery CTAs are wired into the combat surface:
  - `Refresh Room` for recoverable sync/reconnect states
  - `Leave Fight` for displaced or closed-room states
- battle status and finish-state text now reflect opponent disconnect and session replacement instead of using one generic transport warning

### Phase 3 - Authority And Fairness Hardening

Goal: prevent the public PvP path from trusting too much client-owned state.

- validate consumable ownership, quantity, and usage mode on the backend
- validate selected skill and loadout legality on the backend
- reject impossible client actions with explicit recoverable errors plus forced sync
- document the server-owned truth boundary for:
  - loadout
  - room ownership
  - action legality
  - rematch reset

### Phase 4 - Public Deployment Slice

Goal: move from local-network prototype to a safe hosted slice.

- define the deploy target:
  - home-hosted prototype
  - VPS/reverse-proxy prototype
  - first managed public environment
- formalize env config for frontend/backend base URLs and public port exposure
- add health, startup, and minimal runtime logging guidance for operators
- decide whether the first public slice stays anonymous or introduces lightweight identity/session controls

Current progress in this phase:

- the live backend now supports explicit runtime env config for:
  - host / port
  - stale sweep interval
  - body size limit
  - CORS origin
  - log level
  - message and SSE rate limits
- `/health` now reports runtime config plus lightweight room diagnostics for operators
- the HTTP/SSE service now has basic in-memory abuse protection through per-client rate limiting
- the backend now supports optional trusted reverse-proxy mode for `X-Forwarded-For`, so rate limiting can follow the real client IP only when the host is explicitly deployed behind a trusted proxy
- the next ops hardening step is deployment-path documentation and a concrete operator runbook for direct-host vs reverse-proxy setups

### Phase 5 - Regression And Operations Safety

Goal: make PvP changes safe to keep evolving.

- extend server and UI regression coverage for several consecutive rounds, reconnect, rematch, and matchmaking cancellation
- add smoke-check guidance for live dev verification against the actual HTTP/SSE service
- add a short operational checklist for:
  - start server
  - verify health
  - verify SSE
  - verify two-client room creation/join
  - verify rematch and leave-room

## PvP Debt Backlog

Ниже зафиксирован рабочий backlog следующего PvP-прохода.

### PVP-010 - Перенести truth по loadout на сервер

- сервер должен хранить разрешенные скиллы, расходку, экипировку и боевой snapshot участника
- клиентский UI больше не должен быть источником истины для легальности действия

### PVP-011 - Перестроить submit action в server-authoritative flow

- клиент отправляет только намерение и выбор:
  - `intent`
  - атакующая зона
  - защитные зоны
  - `skillId`
  - `consumableCode`
- сервер сам собирает итоговый `RoundAction` и валидирует его

### PVP-012 - Ввести server-side расход расходки и валидацию скиллов

- проверять количество расходки
- проверять наличие скилла в loadout
- проверять кулдаун
- проверять ресурсы
- списывать расходку только на стороне authority

### PVP-013 - Зафиксировать правила snapshot/reconnect/rematch

- reconnect не должен незаметно подменять build
- rematch должен стартовать из явно определенного server-owned состояния
- нужно четко определить, когда build можно менять, а когда матч уже зафиксирован

### PVP-014 - Перевести PvP UI на полный server truth для соперника

- экран должен отображать соперника из синхронизированного server state
- локальные fallback/build данные должны остаться только резервом для dev/debug-сценариев

### PVP-015 - Разбить `OnlineDuelScreen` на transport / state / ui слои

- выделить transport/recovery слой
- выделить state/view-model слой
- выделить чистые UI-компоненты
- убрать из одного файла смесь orchestration, debug, rendering и networking

### PVP-016 - Доделать reconnect/disconnect UX для реальных игроков

- отдельные состояния:
  - переподключение
  - соперник вышел
  - сессия вытеснена
  - матч закрыт
  - ожидание следующего шага

### PVP-017 - Подготовить PvP backend к публичному хостингу

- env-конфиги
- health/ops checklist
- логирование
- reverse proxy / VPS path
- базовая защита от abuse

### PVP-018 - Расширить регрессионное покрытие реального PvP flow

- reconnect
- rematch loops
- matchmaking cancel / timeout
- authority validation
- несколько раундов подряд в live HTTP/SSE flow

## PvP Debt Execution Order

## Progress Update - 2026-03-21

Свежий PvP-прогресс поверх исходного backlog-снимка:

- `PVP-015` уже идет в реальном коде, а не только в плане:
  - `OnlineDuelScreen` уже разрезан на `onlineDuelScreenSetup`, `onlineDuelScreenSupport`, `onlineDuelScreenPanels`, `onlineDuelScreenCards` и `onlineDuelScreenLobby`
  - fight-stage rendering вынесен в `onlineDuelScreenArena.tsx`
  - session / transport orchestration вынесены в `onlineDuelScreenSession.ts`
  - debug / operator tooling вынесены в `onlineDuelScreenDebug.tsx`
  - derived state и view-model сборка вынесены в `onlineDuelScreenState.ts`
  - `OnlineDuelScreen.tsx` теперь работает как orchestration-shell, а не как смешанный transport/state/ui монолит
- `PVP-016` тоже уже в активной работе:
  - live PvP уже показывает явные live-state статусы `Reconnecting`, `Opponent offline`, `Session replaced`, `Match closed`, `Live service offline` и `Syncing room`
  - экран уже показывает recovery CTA вроде `Refresh Room` и `Leave Fight`
  - небезопасные боевые действия уже блокируются, когда текущее состояние матча больше не должно принимать ход
- `PVP-017` тоже уже в активной работе:
  - runtime env-конфиги backend уже live для host, port, CORS, body limits, логирования, rate limiting и trusted-proxy режима
  - `/health` уже отдает runtime config и lightweight room diagnostics
  - следующий шаг: операторская документация по deployment-path и reverse-proxy runbook

1. `PVP-010`
2. `PVP-011`
3. `PVP-012`
4. `PVP-013`
5. `PVP-014`
6. `PVP-015`
7. `PVP-016`
8. `PVP-018`
9. `PVP-017`

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
