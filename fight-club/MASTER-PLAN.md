# MASTER-PLAN - Fight Club

> Last updated: 2026-03-23 02:35 MSK

**Project:** Fight Club  
**Scope:** active product planning, task tracking, and sprint history

---

## How To Use

- Add every active task to the table below.
- Track sprint-sized product slices here, not every micro-task or tiny local edit.
- Use one status only: `🔴 TODO`, `🟡 IN PROGRESS`, `✅ DONE`, `⏸️ DEFERRED`.
- Keep task names short and stable.
- Link to a feature file in `features/` when the task belongs to a specific feature or refactor track.
- When a task is completed, move its final result into `Sprint History` and update the linked feature doc.

---

## Global Master Plan

| ID | Task | Area | Status | Feature Doc | Notes |
|----|------|------|--------|-------------|-------|
| UI-001 | UI and UX audit with phased refactor roadmap | UI / UX | ✅ DONE | `features/ui-ux-refactor.md` | Audit completed, roadmap formalized |
| UI-002 | Extract shared modal, panel, and action primitives | UI Architecture | ✅ DONE | `features/ui-ux-refactor.md` | Shared modal/button/panel foundation now covers inventory, slot, presets, and builder |
| UI-003 | Split `CombatSandboxScreen` into screen sections | UI Architecture | ✅ DONE | `features/ui-ux-refactor.md` | `CombatSandboxScreen` now renders through `PlayerCombatPanel`, `FightSetupPanel`, `BotCombatPanel`, and `BattleLogSection` |
| UI-004 | Unify popover and hover-preview infrastructure | UX / UI Infrastructure | ✅ DONE | `features/ui-ux-refactor.md` | Shared anchored popup, preview chrome, and item preview shell now cover the main hover-preview flows |
| UI-005 | Rework build flow into one clear UX path | UX | 🔴 TODO | `features/ui-ux-refactor.md` | Merge presets, builder, inventory, and skills into one mental model |
| UI-006 | Rework round setup into guided action flow | UX | 🔴 TODO | `features/ui-ux-refactor.md` | Make action selection procedural and easier to read |
| UI-007 | Reduce combat screen information density | UX | 🔴 TODO | `features/ui-ux-refactor.md` | Demote advanced analytics and surface key actions first |
| UI-008 | Split heavyweight combat components | UI Architecture | 🟡 IN PROGRESS | `features/ui-ux-refactor.md` | `CombatSilhouette` now has extracted header, hp bar, board shell, figure, equipment layer, status-effects layer, and a dedicated combat-motion sublayer; `CombatSandboxScreen` is now reduced to a thin orchestration shell over extracted stage, overlays, setup, state, derived, popover, layout, targeting, controls, actions, panels, and resource-grid siblings; `BuilderPopover`, `BuildPresetsPopover`, `InventoryPopover`, `ItemPresentationCard`, and `BattleLogPanel` also shed local helper, primitive, and render layers into sibling modules |
| UI-009 | Add UI contract tests for critical flows | QA / UI | 🔴 TODO | `features/ui-ux-refactor.md` | Protect build flow, action flow, and modal behavior during refactor |
| UI-010 | Run visual polish pass across combat UI | Visual Design | 🟡 IN PROGRESS | `features/ui-ux-refactor.md` | `VP-M01`, `VP-M02`, and `VP-M03` are live; combat now also ships a layered impact-motion system for `hit`, `crit`, `block`, `dodge`, and `block break`, plus post-fight silhouette freeze states, refreshed battle-log cards, and a stronger battle-log header hierarchy |
| COMBAT-001 | Create complete combat design and rules reference | Combat Design / Docs | ✅ DONE | `features/combat-design-reference.md` | Source-of-truth combat reference now covers runtime model, formulas, passives, turn-order examples, verification rules, bot assumptions, and Combat Rules alignment |
| COMBAT-002 | Document combat resolution pipeline and turn order | Combat Design / Docs | ✅ DONE | `features/combat-design-reference.md` | Combat pipeline docs now cover exact sequencing, edge cases, traceability, and a regression-test target matrix for follow-up QA work |
| COMBAT-003 | Add composition regression tests for combat rules | Combat QA | 🟡 IN PROGRESS | `features/combat-design-reference.md` | Protect combinations like skills plus consumables, effects plus death, and block plus penetration from silent regressions |
| COMBAT-004 | Safely reduce `resolveRound.ts` risk without behavior changes | Combat Refactor | 🔴 TODO | `features/combat-design-reference.md` | Remove fragile duplication and isolate rule blocks only after the design reference and regression tests exist |
| COMBAT-005 | Formalize combat change checklist and verification flow | Combat Workflow | 🔴 TODO | `features/combat-design-reference.md` | Define what must be checked whenever combat formulas, resources, effects, or loadout rules change |
| COMBAT-006 | Define first-wave combat expansion states and interaction rules | Combat Design | 🟡 IN PROGRESS | `features/combat-expansion.md` | `Exposed` and `Staggered` now power live setup/payoff loops across charm, mace, axe, shield, and greatsword skills, so the next handoff is player-facing rules/docs sync |
| COMBAT-007 | Design and implement more varied skills around setup/payoff patterns | Combat Content | ⏸️ DEFERRED | `features/combat-expansion.md` | Additional skill content is intentionally paused until the next skill wave is rebuilt around a real preset-pack foundation instead of isolated expansion buttons |
| COMBAT-008 | Deepen archetype identity through state synergy and combat loops | Combat Identity | ✅ DONE | `features/combat-expansion.md` | Warden guard loops and Duelist / Executioner finisher loops are now both readable through state-aware payoff skills like `Parry Riposte`, `Iron Brace`, `Heartseeker`, and `Execution Mark` |
| COMBAT-009 | Expand combat docs and Combat Rules for the new state and skill layer | Combat Docs / UX | ✅ DONE | `features/combat-expansion.md` | `Combat Rules` generated facts, verification docs, and reader-facing rules copy now explain `Exposed`, `Staggered`, setup/payoff windows, and short rider expiry nuances |
| COMBAT-010 | Add regression and balance coverage for combat expansion content | Combat QA / Balance | 🟡 IN PROGRESS | `features/combat-expansion.md` | Post-skill analytics uncovered and fixed a real circular-import bug in starter skill carriers that had corrupted combat snapshots with `NaN`; the new skill audit is now live too and shows the next issue clearly: planners pick a skill on 100% of affordable turns, while payoff skills like `Execution Arc`, `Heartseeker`, and `Killer Focus` almost never come online, so the next step is usage-informed retuning rather than blind balance changes |
| COMBAT-011 | Remove unfair bot defense omniscience and stabilize planning fairness | Combat Recovery | ✅ DONE | `features/combat-design-reference.md` | Bot planning no longer receives the player's announced attack zone from the sandbox flow, so veteran and champion defense planning now stays pressure-driven instead of perfectly counter-guarding the chosen target |
| COMBAT-012 | Convert mitigation truth model to per-damage-type resolution | Combat Recovery | 🟡 IN PROGRESS | `features/combat-design-reference.md` | `combatMitigation.ts` now resolves zone defense through typed armor shares instead of pooled total-damage reduction; the recovery track also repaired broken preset inputs, removed bot omniscience, and uncovered then fixed a skill-carrier import bug that was poisoning snapshots with `NaN`; the next step is verifying post-fix combat feel before another coefficient pass |
| COMBAT-013 | Unify zone-defense truth across runtime, docs, and rules screen | Combat Recovery | ✅ DONE | `features/combat-design-reference.md` | `Combat Rules`, architecture markdowns, and the combat recovery docs now describe the live `zoneArmor + zoneArmorBySlot` truth model, updated zone modifiers, current weapon passives, and the short `regen-potion` sustain pattern |
| COMBAT-014 | Add trauma hooks after core combat stabilization | Combat Recovery | 🔴 TODO | `features/combat-design-reference.md` | Introduce an injury layer only after the base hit, defense, mitigation, and crit pipeline is stable and covered by regression tests |
| COMBAT-015 | Formalize production skill architecture and role taxonomy | Combat Systems | 🟡 IN PROGRESS | `features/combat-expansion.md` | The first live slice has landed: `CombatSkill` now supports role metadata, preferred zone hints, and soft AI hints, with UI surfacing and planner scoring support; next step is applying the model to curated production packs |
| COMBAT-016 | Equip curated presets with first production skill packs | Combat Content / Balance | 🟡 IN PROGRESS | `features/combat-expansion.md` | Curated presets now run on live first-wave skill kits through accessory carriers; post-fix audits showed payoff starvation, a narrow planner hold-for-payoff pass barely moved the live roster, and the first skill-economy pass confirmed the next real bottleneck: `Mace / Control` improved once payoff access was cheaper and same-resource, while `Sword / Bleed` and `Dagger / Crit` still need more resource-cadence work |
| BACKEND-001 | Formalize 1v1 online architecture and authority boundaries | Backend / Architecture | 🟡 IN PROGRESS | `features/online-duel-1v1.md` | The project now has a dedicated online-duel roadmap; the current slice is Phase 1: room contracts, participant/session state, and authority-side round lifecycle around the existing combat core |
| BACKEND-002 | Build authority-ready duel room domain and state machine | Backend / Runtime | 🟡 IN PROGRESS | `features/online-duel-1v1.md` | Shared duel-room models and pure application functions should own join, action submission, and round resolution before any real transport is added |
| BACKEND-003 | Define transport contracts for realtime duel sync | Backend / Contracts | ???? IN PROGRESS | `features/online-duel-1v1.md` | The realtime slice now has SSE room updates, client-side stale-push guards, authoritative resync on stream attach or error, server-issued resume tokens, event-cursor replay, explicit session handoff, and replay of core round lifecycle events; the next step is deciding whether reconnect should restore deeper combat/action history beyond the current room-focused stream |
| BACKEND-004 | Add first local-authority adapter and verification flow | Backend / QA | ???? IN PROGRESS | `features/online-duel-1v1.md` | The transport seam now carries server-owned round summaries into the online screen, and the product flow now covers match-finish UX plus a server-owned `Play Another Match` reset inside the same room instead of a UI-only clear |
| BACKEND-005 | Stand up first live 1v1 online service slice | Backend / Service | ???? IN PROGRESS | `features/online-duel-1v1.md` | The live HTTP authority slice now includes health checks, room-message handling, server-owned round summaries, revision-tagged sync, stale round-submit rejection, SSE room updates, attach/error resync, resume-token validation, event-cursor replay, explicit displacement of older live sessions after handoff, round lifecycle replay after reconnect, server-owned rematch reset, server-owned leave-room closure, and a dedicated live two-client validation test; the current product target is no longer a separate duel-lab surface but a real `PvP` flow: menu split into `Bot` and `PvP`, a `PvP` pre-match screen with the normal player build stack on the left plus room-entry controls on the right, then the standard combat screen with a real player replacing the bot |
| BACKEND-006 | Build PvP pre-match lobby on top of the standard player build stack | Backend / UI Integration | ✅ DONE | `features/online-duel-1v1.md` | `PvP` now opens a dedicated pre-match screen with the normal player silhouette plus `Builder / Builds / Inventory` on the left and room-entry controls on the right |
| BACKEND-007 | Transition PvP lobby into the standard combat screen with a real remote opponent | Backend / UI Integration | 🟡 IN PROGRESS | `features/online-duel-1v1.md` | The lobby now transitions into a PvP combat screen that closely mirrors the bot-fight layout: live combat log, intent, skills, consumables, recovery-hardened SSE sync, and a reduced room-dashboard layer are all live; the remaining work is final visual parity, disconnect UX, backend authority hardening for public play, and deployment polish |
| BACKEND-009 | Harden PvP for public-host deployment and fair authority rules | Backend / Service / Product | 🔴 TODO | `features/online-duel-1v1.md` | Finish the gap between a LAN-playable PvP prototype and an internet-ready product: deployable hosting, authority-side consumable and loadout validation, clearer reconnect states, observability, and operational safety |
| BACKEND-008 | Add first server-owned matchmaking queue for PvP | Backend / Matchmaking | ✅ DONE | `features/online-duel-1v1.md` | The first server-owned queue is live through `find_matchmaking_duel`; the next work is queue hardening, cancellation, timeout, and reconnect polish rather than first implementation |
| HUNT-001 | Define hunting domain model and save boundaries | Hunting Architecture | ✅ DONE | `features/hunting-mvp.md` | Hunting model contracts, starter zones, creation helpers, and the `state.hunting.*` save-boundary draft are now established |
| HUNT-002 | Implement autonomous idle hunt loop and session resolution | Hunting Runtime | ✅ DONE | `features/hunting-mvp.md` | `startHunt` and `resolveHunt` now provide deterministic idle hunt simulation with test coverage |
| HUNT-003 | Add reward bridge from hunting into shared inventory | Hunting Economy | ✅ DONE | `features/hunting-mvp.md` | `claimHuntRewards` now converts pending hunt rewards into shared inventory items through the existing inventory module |
| HUNT-004 | Implement hunter progression and base stat allocation | Hunting Progression | ✅ DONE | `features/hunting-mvp.md` | `addHunterExperience` and `allocateHunterStatPoint` are live with tests; level-step rewards and zone unlock timing are now verified |
| HUNT-005 | Implement hunting gear and pet-lite bonuses | Hunting Systems | ✅ DONE | `features/hunting-mvp.md` | Starter hunting gear and pet catalogs, equip and assign flows, and live resolver bonuses are now in place |
| HUNT-006 | Build first hunting UI shell and claim flow | Hunting UX | ✅ DONE | `features/hunting-mvp.md` | `HuntingScreen` and `useHuntingSandbox` now expose zone selection, start/resolve/claim flow, profile summary, pet summary, and shared inventory feedback |
| HUNT-007 | Document hunting architecture and verification flow | Hunting Docs / Safety | ✅ DONE | `features/hunting-mvp.md` | Hunting runtime reference, reward bridge rules, architecture overview sync, and root doc alignment are now documented and validated |
| HUNT-008 | Persist hunting state and offline return flow | Hunting Persistence | ✅ DONE | `features/hunting-mvp.md` | Hunting state now round-trips through the shared save envelope, restores route progress between sessions, and ships with a compact no-scroll lodge UI tuned around restored-session flow, route timing, and claim review |
| HUNT-009 | Add first hunting tool focus layer | Hunting Gameplay | 🟡 IN PROGRESS | `features/hunting-mvp.md` | Tool focus is now live and route stances add the second route-planning lever through `Steady`, `Greedy`, and `Cautious` hunt styles |
| CLEAN-001 | Build cleanup inventory and classify repo artifacts | Repo Hygiene | ✅ DONE | `features/project-cleanup-program.md` | Cleanup inventory is documented and now tracks backup, generated, stub, and oversized-file targets |
| CLEAN-002 | Remove low-risk junk from the live source tree | Repo Hygiene | ✅ DONE | `features/project-cleanup-program.md` | Removed orphan fetch script, source-tree backup files, tracked config sidecars, and recurring build junk from the live tree |
| CLEAN-003 | Separate source from generated and build artifacts | Architecture Hygiene | 🟡 IN PROGRESS | `features/project-cleanup-program.md` | Build artifacts are now separated and ignored; the remaining follow-up is clarifying long-lived generated content boundaries like Battle Kings starter items |
| CLEAN-004 | Prune stub bootstrap and future-only module layers | Runtime Architecture | ✅ DONE | `features/project-cleanup-program.md` | Placeholder bootstrap/application stubs were removed from the active runtime graph |
| CLEAN-005 | Reduce sandbox orchestration and hook surface area | UI / Orchestration | ✅ DONE | `features/project-cleanup-program.md` | `useCombatSandbox` is now split into data, actions, and flow helpers, shrinking the main hook into a clearer coordinator |
| CLEAN-006 | Continue heavyweight UI decomposition | UI Architecture | 🟡 IN PROGRESS | `features/project-cleanup-program.md` | `CombatSandboxScreen` is now mostly a coordinator over extracted stage, overlays, setup, actions, controls, targeting, layout, panels, resource-grid, state, derived, and popover siblings; follow-up slices also decomposed `BuilderPopover`, `BuildPresetsPopover`, `InventoryPopover`, `ItemPresentationCard`, and `BattleLogPanel`, so the next cleanup pressure is in older heavy files like `CombatSilhouette` and remaining legacy surfaces |
| CLEAN-007 | Lower combat core risk through safe decomposition | Combat Refactor | 🔴 TODO | `features/project-cleanup-program.md` | Break `resolveRound.ts` into smaller rule units only behind regression coverage |
| CLEAN-008 | Harden save loading and compatibility rules | Persistence / Safety | 🔴 TODO | `features/project-cleanup-program.md` | Validate save payloads on read, normalize older payloads, and add safe fallback behavior |
| CLEAN-009 | Sync docs and workflow after the cleanup pass | Docs / Workflow | 🟡 IN PROGRESS | `features/project-cleanup-program.md` | Root docs and structure notes are being synchronized with the cleanup track so the next refactor pass can resume from documented reality |

---

| TECH-001 | Stabilize PvP truth and revision-first sync selection | PvP / Sync | ✅ DONE | `MASTER-PLAN.md` | Online PvP now prefers freshest room state by `revision`; completeness fallback remains only for equal-revision ties |
| TECH-002 | Finish PvP UI parity with combat sandbox and reduce ambiguity | PvP / UX / UI | ✅ DONE | `MASTER-PLAN.md` | Online fight now shows real opponent resources and clearer primary control states instead of misleading ready-only wording |
| TECH-003 | Expand online PvP UI regression coverage | QA / PvP UI | ✅ DONE | `MASTER-PLAN.md` | Online UI regressions now cover stale-state recovery, synced opponent resources, and finished/profile parity on the live PvP screen |
| TECH-004 | Harden server authority and stale-action validation | Backend / PvP Authority | ✅ DONE | `MASTER-PLAN.md` | `submit_round_action` now validates stale sync by `expectedRevision` as well as round, and the client seam sends revision tags on submit |
| TECH-005 | Consolidate remote-play deployment and ops path | Ops / Deployment | рџ”ґ TODO | `MASTER-PLAN.md` | Turn the current quick-tunnel success into a repeatable operator path with safer env defaults, clearer launcher/runtime ownership, and a cleaner public-host checklist |
| TECH-006 | Decompose remaining heavyweight PvP and combat files | Architecture / Refactor | рџ”ґ TODO | `MASTER-PLAN.md` | Continue shrinking `OnlineDuelScreen`, related support modules, and high-risk combat surfaces so future fixes land in smaller, testable units |
| TECH-007 | Reduce combat-core risk behind stronger regression nets | Combat / Safety | рџ”ґ TODO | `MASTER-PLAN.md` | Move toward safer decomposition of `resolveRound.ts` and adjacent combat logic only after coverage and invariants are strong enough |
| TECH-008 | Harden persistence and compatibility boundaries | Persistence / Safety | рџ”ґ TODO | `MASTER-PLAN.md` | Validate save payloads on read, define migration rules, and keep future PvP/profile/hunting additions from silently breaking older local saves |

---

## PvP Debt Backlog

| ID | Задача | Область | Статус | Feature Doc | Notes |
|----|--------|---------|--------|-------------|-------|
| PVP-010 | Перенести truth по loadout на сервер | Backend / PvP Authority | ✅ DONE | `features/online-duel-1v1.md` | Сервер теперь нормализует и хранит server-owned loadout truth для комнаты, а не полагается на сырой клиентский loadout |
| PVP-011 | Перестроить submit action в server-authoritative flow | Backend / Combat Authority | ✅ DONE | `features/online-duel-1v1.md` | Клиент отправляет только выбор раунда, submission хранит selection, а authority пересобирает и валидирует итоговый `RoundAction` уже на серверной стороне |
| PVP-012 | Ввести server-side расход расходки и валидацию скиллов | Backend / Economy / Fairness | ✅ DONE | `features/online-duel-1v1.md` | Authority now enforces skill availability, cooldown, resources, consumable quantity, and resolve-time depleted-inventory validation through arena regressions |
| PVP-013 | Зафиксировать правила snapshot/reconnect/rematch | Backend / PvP Runtime | ✅ DONE | `features/online-duel-1v1.md` | Reconnect now preserves server-owned baseline truth, rematch rebuilds detached runtime state from baseline, and regression tests cover baseline immutability across rejoin/rematch |
| PVP-014 | Перевести PvP UI на полный server truth для соперника | UI / PvP Sync | 🟢 DONE | `features/online-duel-1v1.md` | `duel_state_sync` теперь отдаёт `opponentLoadout`, opponent profile/skills больше не зависят от локального build fallback, UI truth закреплён arena + EventSource tests |
| PVP-015 | Разбить `OnlineDuelScreen` на transport / state / ui слои | UI Architecture | 🟢 DONE | `features/online-duel-1v1.md` | `OnlineDuelScreen` теперь делегирует arena/presenter, session/controller, debug/operator и state/view-model сборку соседним модулям `onlineDuelScreenArena`, `onlineDuelScreenSession`, `onlineDuelScreenDebug` и `onlineDuelScreenState` |
| PVP-016 | Доделать reconnect/disconnect UX для реальных игроков | UX / PvP Recovery | 🔴 TODO | `features/online-duel-1v1.md` | Нужны явные состояния: переподключение, соперник вышел, сессия вытеснена, матч закрыт, ожидание следующего шага |
| PVP-017 | Подготовить PvP backend к публичному хостингу | Backend / Ops / Deployment | 🔴 TODO | `features/online-duel-1v1.md` | Нужны env-конфиги, health/ops checklist, логирование, reverse proxy/VPS path и базовая защита от abuse |
| PVP-018 | Расширить регрессионное покрытие реального PvP flow | QA / PvP | 🟡 IN PROGRESS | `features/online-duel-1v1.md` | Уже есть базовый набор, но нужно расширение на reconnect, rematch loops, matchmaking cancel/timeout и authority validation |

Порядок выполнения:

1. `PVP-010`
2. `PVP-011`
3. `PVP-012`
4. `PVP-013`
5. `PVP-014`
6. `PVP-015`
7. `PVP-016`
8. `PVP-018`
9. `PVP-017`

---

## PvP Progress Update - 2026-03-21

- `PVP-015` уже реально в работе:
  - `OnlineDuelScreen` уже разрезан на соседние модули `setup`, `support`, `panels`, `cards` и `lobby`
  - следующий шаг по этому треку: еще сильнее ужать orchestration-shell и дочистить границу view-model
- `PVP-016` уже реально в работе:
  - live PvP экран уже показывает явные состояния `Reconnecting`, `Opponent offline`, `Session replaced`, `Match closed`, `Live service offline` и `Syncing room`
  - экран уже умеет показывать recovery CTA и блокирует небезопасные боевые действия, когда матч больше не находится в валидном live-состоянии
- `PVP-017` уже реально в работе:
  - runtime env-конфиги backend, `/health`, логирование, proxy-aware client IP и базовый rate limiting уже live
  - следующий шаг по этому треку: закрепить deployment-path и операторский runbook для прямого хоста и reverse proxy

## PvP Progress Update - 2026-03-21 (Refresh)

- `PVP-010` through `PVP-013` are effectively landed in code:
  - room participants now keep server-owned baseline snapshot and loadout truth
  - reconnect does not silently mutate that baseline
  - rematch restores the original baseline build
  - clients submit selections while the server rebuilds and validates the real `RoundAction`
  - consumables are decremented from server-owned runtime state after round resolution
- `PVP-014` is materially advanced:
  - synced state now carries active-seat `yourSnapshot` and `opponentSnapshot`
  - PvP stat cards and opponent presentation rely much more on server truth and less on local fallback data
- `PVP-015` is now effectively landed:
  - `OnlineDuelScreen` is now split across `setup`, `support`, `panels`, `cards`, and `lobby` siblings
  - arena rendering now lives in `onlineDuelScreenArena.tsx`
  - session and transport orchestration now lives in `onlineDuelScreenSession.ts`
  - debug and operator tooling now lives in `onlineDuelScreenDebug.tsx`
  - derived PvP state and view-model composition now lives in `onlineDuelScreenState.ts`
  - the remaining screen is now an orchestration shell instead of the old monolith
- `PVP-016` is materially advanced:
  - live PvP now surfaces explicit reconnect, displaced-session, opponent-offline, room-closed, and syncing states
  - unsafe combat actions are blocked in invalid live states
  - matchmaking search now has player-facing `pause`, `resume`, and `timeout` behavior
- `PVP-017` is materially advanced:
  - backend runtime env config, deploy profiles, `/health`, request logging, rate limiting, reverse-proxy examples, env examples, and an ops runbook are now live
- `PVP-018` is materially advanced:
  - regression coverage now includes stale matchmaking cleanup
  - `abandoned -> rematch -> reconnect SSE`
  - `search -> stop -> resume -> match found -> first round resolve` over live HTTP and SSE
  - a longer live two-client lifecycle now covers `finished -> rematch -> leave`
  - the local player-facing screen now also covers `resolve round -> room closed -> rematch -> return to create flow`

## PvP Progress Update - 2026-03-22

- The first real remote PvP milestone is now achieved:
  - a launcher-assisted `trycloudflare` flow can bring up backend, frontend, both tunnels, and a runtime manifest for the browser-side operator flow
  - the `Admin Dashboard` now reads that manifest, shows readiness state, and can apply the backend tunnel override before opening PvP
  - one real remote match was played successfully through the public quick-tunnel path
- The player-facing PvP screen advanced materially:
  - match code is surfaced directly inside `Fight Controls`
  - round progress and wait status now explain whether the room is waiting for `Ready` or for both locked actions
  - the `Ready Up` control now toggles into `Cancel Ready` instead of living as a second detached button
  - online combat now restores hit / crit / block / dodge effect wiring and supports opening the fighter profile modal from the PvP screen
- Several live-sync and authority bugs were closed:
  - remote matches no longer hang when both seats start from the same fighter template because combatants now get unique online ids
  - winner/result presentation now resolves against the real online combatant identity instead of loose name fallback
  - online skill submission now validates against the active synced loadout instead of an outdated local fallback
- PvP verification moved from a thin smoke layer to a real online test program:
  - `npm run test:pvp`
  - `npm run test:pvp:matrix`
  - `npm run test:pvp:soak`
  - `npm run test:pvp:fuzz`
  - the live suite now covers scenario matrix flow, preset-vs-preset smoke, longer soak rounds, and seeded fuzz over real `HTTP + SSE`
- Tomorrow's highest-value follow-up remains clear:
  - prefer freshest synced room state by `revision`
  - surface real opponent resources instead of the current zero-strip fallback
  - finish the remaining PvP UI parity and reconnect clarity pass
  - add stronger online UI tests for animation/result/profile parity

---

## Unified Combat Presentation Program

Tracked product tasks:

- `PROD-001` - `🟡 IN PROGRESS` - unify player-facing combat presentation across sandbox and PvP
- `PROD-002` - `🔴 TODO` - remove tech-noise from the normal fight flow
- `PROD-003` - `🔴 TODO` - ship the first unified combat feel pass

Goal:

- stop maintaining separate player-facing combat presentation for sandbox/bot and online PvP
- move toward one shared combat screen shell, one visual language, and one combat feel layer
- make future visual upgrades land once instead of being repeated across two different fight screens

Scope:

- shared left / center / right combat stage presentation
- shared fight controls layout and round-state messaging
- shared impact, crit, block, dodge, penetration, and finish presentation
- shared battle log and round recap presentation
- separate adapters for sandbox/bot controller state and online PvP session state

Non-goals for the first slice:

- do not merge sandbox and PvP transport, matchmaking, or lobby logic
- do not rewrite combat rules or authority logic
- do not force debug/operator surfaces into the shared player shell

Execution phases:

### Phase U1 - Shared Presentation Contract

- define one combat screen view-model contract for local player, rival, center controls, round summary, battle log, and result state
- build adapter `fromCombatSandbox`
- build adapter `fromOnlineDuel`
- progress:
  - shared presentation contract added in `src/ui/screens/Combat/combatPresentationModel.ts`
  - sandbox adapter added in `src/ui/screens/Combat/combatPresentationAdapters.ts`
  - online duel adapter added in `src/ui/screens/Combat/combatPresentationAdapters.ts`
  - sandbox stage now renders its fighter/control data through the shared contract
  - online duel arena now renders its fighter/control data through the shared contract

### Phase U2 - Shared Combat Shell

- extract one shared player-facing combat shell
- make both sandbox and PvP render through it
- keep only source-specific orchestration outside the shell
- progress:
  - shared shell added in `src/ui/screens/Combat/combatPresentationShell.tsx`
  - sandbox stage now renders through the shared shell
  - online duel arena now renders through the shared shell
  - source-specific orchestration still stays outside the shell, as planned

### Phase U3 - Shared Feel Layer

- unify impact overlays, shake, zone hit markers, round reveal, result reveal, and future VFX hooks
- ensure visual additions hit both modes automatically
- progress:
  - shared result reveal now lives in `src/ui/screens/Combat/combatPresentationShell.tsx`
  - sandbox and online PvP both use the same end-of-match reveal surface
  - final victory / defeat / closed-match messaging is now handled at the shared shell layer
  - shared round reveal now lives in `src/ui/screens/Combat/combatRoundReveal.tsx`
  - sandbox and online PvP both use the same round-resolution reveal treatment
  - shared current-turn focus now lives in `src/ui/screens/Combat/combatSandboxScreenControls.tsx`
  - both modes now explain the current phase, next step, and locked/ready state through the same focus block
  - shared `Last Exchange` recap now lives in `src/ui/screens/Combat/combatSandboxScreenControls.tsx`
  - both modes now surface the previous resolved exchange directly in fight controls instead of relying only on the combat log
  - shared payoff tags for `Critical`, `Dodge`, `Block`, `Pierce`, `Finisher`, and `Impact` now live in `src/ui/screens/Combat/combatSandboxScreenControls.tsx`
  - both modes now highlight the tone of the previous exchange through the same visual badges

### Phase U4 - Product Cleanup

- remove duplicate tech-facing controls from the normal player path
- keep debug/operator surfaces isolated behind dev or admin entry points
- simplify fight-state wording so both modes read the same way
- progress:
  - normal online arena now hides routine live-status noise during healthy fights
  - top-of-screen banners are reserved for player-facing alerts instead of constant transport chatter
  - recovery actions still stay visible inside fight controls when the player actually needs to act

Acceptance criteria:

- one visual change to the combat stage should apply to both bot/sandbox and online PvP
- one round-state UX improvement should apply to both modes without duplicated implementation
- the shared shell must remain testable through both sandbox UI tests and PvP UI tests

Recommended execution order:

1. `PROD-001`
2. `PROD-002`
3. `PROD-003`
4. continue `PVP-016`
5. continue `PVP-018`

## Combat Presentation And Visual Polish Program

This is the product-facing polish track that sits on top of the shared combat shell.

The goal of this track is to make combat feel:

- more readable at a glance
- more tactile and satisfying
- less like a debug tool
- closer to a product-grade player experience

This track does not change combat rules or class identity directly.
It improves how combat is presented, understood, and emotionally felt.

Tracked visual tasks:

- `VIS-001` - define the product-grade combat readability baseline
- `VIS-002` - reduce normal-flow interface noise and clarify combat priorities
- `VIS-003` - strengthen impact, payoff, and round-resolution feedback
- `VIS-004` - improve result, victory, defeat, and post-round reveal quality
- `VIS-005` - unify combat visual language across sandbox and online PvP
- `VIS-006` - prepare a premium-feel pass for motion, layering, and finish polish

### Product pillars

1. Readability first

- the player should understand the current phase, the required next step, and the last meaningful outcome in under one second
- the center of the screen must answer: what is happening, what I should do, and what just happened

2. Combat feel

- hits should feel like hits
- crits, blocks, dodges, and finishers must read as distinct events, not just different log rows
- the player should feel momentum, contact, and payoff even before reading the combat log

3. Product-grade focus

- normal fights should feel like a game screen, not an operator console
- debug and recovery surfaces should stay available, but they must not dominate healthy player flow
- the most important actions should visually outweigh all secondary information

4. One visual truth across modes

- sandbox and online PvP should share the same player-facing presentation language
- visual improvements should land once through the shared shell and controls, not as two separate implementations

### Phase V1 - Readability And Information Hierarchy

Primary intent:

- make the screen easy to parse before adding more visual intensity

Focus:

- demote or remove technical labels from the normal fight path
- keep one strong primary status, one strong primary action, and one clear recap area
- tighten vertical rhythm and reduce card clutter in `Fight Controls`
- make `Current Turn Focus`, `Last Exchange`, and round-state messaging the center of player comprehension

Definition of done:

- a new player can identify current phase and next action without reading the full log
- the normal fight screen no longer feels like a debug-first layout
- sandbox and PvP share the same information hierarchy
- progress:
  - shared `Fight Controls` now groups match code, wait state, and round progress into one compact combat-status rail instead of three separate tech-style cards
  - the action summary now reads as a tighter player-facing HUD block with clearer phase and round emphasis
  - the central combat column now has less vertical clutter while preserving the same sandbox and PvP contract
  - center-stage wording now leans more into player-facing language (`Your Move`, cleaner recap phrasing) instead of panel-heavy technical labels
  - `Last Exchange` presentation is now a dedicated shared recap card, keeping the central flow easier to scan in both modes

### Phase V2 - Impact And Payoff Feel

Primary intent:

- make every resolved exchange feel more physical and more rewarding to read

Focus:

- improve hit flash, crit flash, block pulse, dodge read, and finisher emphasis
- strengthen screen-space shake, panel reaction, and zone-hit overlays without becoming noisy
- improve flying numbers and payoff tags so they read clearly under real match pacing
- make the difference between normal impact and high-value impact immediately visible

Definition of done:

- players can tell the difference between hit, crit, block, dodge, and finisher without reading detailed text
- combat outcomes feel more tactile during live play
- both sandbox and PvP receive the same impact language automatically
- progress:
  - shared silhouette impact treatment is now materially stronger through clearer hit, crit, block, dodge, penetration, and block-break overlays
  - round feedback now uses color-coded payoff language for skills, consumables, healing, blocks, and crits instead of a mostly neutral recap style
  - block outcomes now surface `% blocked` directly inside shared round recap badges

### Phase V3 - Round Reveal And Result Presentation

Primary intent:

- turn round resolution and fight finish into satisfying presentation beats

Focus:

- improve round reveal timing and payoff cadence
- make victory, defeat, and match-closed states feel deliberate and final
- add a cleaner post-round recap language around who won the exchange and why
- reduce the feeling that numbers changed "silently" between two states

Definition of done:

- a resolved round feels like a revealed outcome, not a silent state jump
- end-of-match states feel conclusive and emotionally readable
- result presentation is consistent across both modes
- progress:
  - sandbox and online PvP now share one `Round Reveal` component and one result-reveal language
  - round reveal timing was retuned to a fast entrance, long readable hold, and clean fade-out instead of the older lag-like dissolve
  - reveal rows now group by fighter, keep skill / consumable / heal chips on one horizontal action line, and avoid duplicate per-fighter rows for the same exchange
  - the reveal damage pill now carries stronger contrast and clearer color separation for normal hits, blocked hits, and crits

### Phase V4 - Premium Motion And Layering Pass

Primary intent:

- add polish that makes the combat screen feel richer without changing the architecture

Focus:

- improve animation timing and easing across shared combat presentation pieces
- add stronger silhouette focus, dimming, reveal staging, and payoff layering
- make resource and readiness states feel more alive
- make transitions between planning, locking, resolving, and finished states feel smoother

Definition of done:

- the screen feels intentional in motion, not only in static layout
- state changes feel staged and premium instead of abrupt
- additional polish still flows through shared presentation primitives
- progress:
  - round reveal cards now use heavier glow, deeper contrast, and stronger payoff emphasis without splitting sandbox and PvP into separate visual branches
  - the premium-motion pass is still incomplete, but the first shared timing/glow layer is already live in the shared combat presentation path

### Phase V5 - Product Validation And Feel QA

Primary intent:

- protect presentation quality from regression once polish starts landing faster

Focus:

- expand UI regression coverage for key player-facing combat states
- keep visual-critical shared layers under lightweight tests where possible
- record subjective playtest notes against concrete product criteria instead of vague taste
- use live PvP smoke sessions to verify that clarity improvements survive real latency and remote play

Definition of done:

- major combat presentation regressions are caught before shipping
- player-facing feel work is evaluated against shared criteria, not memory alone
- both automated tests and live smoke checks are part of the finish bar

### Acceptance criteria for the whole program

- a healthy PvP fight can be played without debug/operator knowledge
- sandbox and PvP look like the same game, not two related tools
- the center of combat explains phase, action, and last outcome clearly
- impact events are visually distinct and satisfying in live play
- victory and defeat feel readable, deliberate, and product-grade

### Recommended execution order

1. finish `PROD-001`
2. continue `PROD-002`
3. continue `PROD-003`
4. execute `VIS-001`
5. execute `VIS-002`
6. execute `VIS-003`
7. execute `VIS-004`
8. execute `VIS-005`
9. execute `VIS-006`
10. continue `PVP-016`
11. continue `PVP-018`

## Status Legend

- `🔴 TODO` - not started yet
- `🟡 IN PROGRESS` - actively being worked on
- `✅ DONE` - implemented and documented
- `⏸️ DEFERRED` - intentionally paused or postponed

---

## Execution Rules

- Work strictly phase by phase.
- Keep only one UI refactor task in `🟡 IN PROGRESS` at a time unless a parallel task is genuinely independent.
- Before starting the next phase, update the current task status and add the completed result to `Sprint History`.

---

## Upcoming UX Cleanup Queue

- `UI-011` - add a clear `Current Turn` focus block so the player always sees attack, target zone, defense, active skill or consumable, and readiness in one place
- `UI-012` - turn round setup into a guided path: attack -> zone -> defense -> optional skill or consumable -> resolve
- `UI-013` - reduce combat-screen noise and separate play-now information from analysis and log-heavy information
- `UI-014` - make `Exposed`, `Staggered`, and payoff windows self-explanatory directly in the combat UI
- `UI-015` - reduce build-editing friction by moving presets, inventory, equipment, and skills toward one clearer build center

---

## Technical Debt And Optimization Program

This is the main stabilization plan after the first real remote PvP milestone.

The goal of this track is to make the current game slice:

- more truthful
- more predictable
- easier to change safely
- easier to test
- easier to operate remotely

### Phase A - PvP Truth First

Primary tasks:

1. `TECH-001`
2. `TECH-002`
3. `TECH-003`

Focus:

- prefer freshest online room state by `revision`
- remove stale-state heuristics from player-facing PvP flow
- surface real opponent-facing truth instead of local or zero-value fallback data
- make phase, wait, lock, and result states obvious to both players
- cover the main online UI truth states with regression tests

Definition of done:

- no known stale-sync chooser remains on the main PvP screen path
- opponent resources and result state match live synced truth
- the common "it looks frozen" and "both clients think they won" class of issues are either fixed or directly tested
- online UI tests cover the main truth-heavy player states

### Phase B - Authority And Fairness

Primary tasks:

1. `TECH-004`
2. `PVP-010`
3. `PVP-011`
4. `PVP-012`
5. `PVP-013`

Focus:

- keep moving fairness-critical truth to the server
- accept intent and choice from the client, not trusted combat truth
- make reconnect, rematch, stale submit, displaced session, and resource validation explicit
- ensure weird client UI states do not create unfair combat outcomes

Definition of done:

- server-owned validation covers loadout, skills, consumables, resources, and session ownership cleanly
- reconnect/rematch lifecycle is reproducible and explicit
- live PvP tests catch stale or invalid mutation paths before UI polish can hide them

### Phase C - Deployment And Operator Reliability

Primary tasks:

1. `TECH-005`
2. `BACKEND-009`
3. `PVP-017`

Focus:

- keep one clean path for quick remote prototypes and one clean path for public-host or VPS prototypes
- keep launcher, runtime manifest, dashboard, and runbook aligned
- improve env defaults, startup clarity, and operator visibility

Definition of done:

- remote bootstrap is repeatable without tribal memory
- dashboard and runbook reflect the real launcher flow
- public-host checklist, proxy path, and runtime config are clear enough for the next deployment pass

### Phase D - Structural Debt

Primary tasks:

1. `TECH-006`
2. `TECH-007`
3. `TECH-008`
4. `CLEAN-006`
5. `CLEAN-007`
6. `CLEAN-008`

Focus:

- continue shrinking risky files
- reduce combat-core change risk only behind tests
- make save loading and compatibility an explicit boundary, not a best-effort guess

Definition of done:

- major PvP and combat fixes land in smaller modules
- save loading is validated and compatibility-aware
- the next refactor cycle is cheaper than the current one

### Recommended Working Order For Today

1. `TECH-001` - freshest sync by `revision`
2. `TECH-002` - real opponent resources plus remaining PvP UI ambiguity cleanup
3. `TECH-003` - online UI regression tests for truth, result, animation, and profile states
4. `TECH-004` - next authority hardening pass only after UI truth is stable

### Technical Debt Progress Update - 2026-03-22

- `TECH-001` is complete:
  - the main online PvP chooser now prefers freshest synced room state by `revision`
  - older-but-more-complete payloads no longer override newer room truth on the player-facing screen path
- `TECH-002` is complete:
  - opponent resource strips now render real synced values instead of a zeroed fallback
  - the primary fight-control button now reflects live phase truth like `Ready Up`, `Cancel Ready`, `Planning`, `Action Locked`, and `Match Closed`
- `TECH-003` is complete:
  - online UI regression tests now cover stale-state recovery, synced opponent resources, and finished/profile modal parity
  - this closes the main gap between server-heavy PvP tests and player-facing truth checks
- `TECH-004` is complete:
  - server authority now rejects stale round submissions by `expectedRevision`, not just `expectedRound`
  - the client seam sends `expectedRevision` on `submit_round_action`
  - arena seam tests now explicitly resync clients before submit, matching the hardened authority contract
- `PVP-010` is complete:
  - room creation and join now normalize incoming loadout truth on the authority side
  - participants keep detached baseline and runtime loadout state instead of trusting live client references
- `PVP-011` is complete:
  - round submit now stores only player selection inside the room state, not a prebuilt combat action
  - the authority rebuilds and revalidates `RoundAction` from current server combat state right before resolution
  - arena regressions now cover resolve-time rebuild against changed server state
- `PVP-012` is complete:
  - arena regressions now cover authority-side skill availability, active cooldown, and resolve-time depleted consumable validation
  - the fairness-critical economy checks are now locked to server-owned loadout and combat state instead of UI assumptions
- `PVP-013` is complete:
  - reconnect keeps server-owned baseline snapshot/loadout truth instead of accepting silent client-side replacement on rejoin
  - rematch now rebuilds detached runtime snapshot, fighter view, and loadout state from baseline-safe clones
  - arena regressions cover baseline immutability after rejoin and after rematch reset
- Next recommended order:
  1. `PVP-014`
  2. `PVP-015`
  3. `PVP-016`
  4. `PVP-018`

### Rules For This Program

- prefer truth bugs over content tweaks
- prefer reproducible tests over speculative fixes
- do not rebalance combat while PvP sync truth is still suspect
- any PvP behavior change should be checked against:
  - `npm run test:pvp`
  - `npm run test:pvp:matrix`
  - `npm run test:pvp:soak`
  - `npm run test:pvp:fuzz`
- any combat-core refactor should follow regression coverage, not precede it

---

## Project Cleanup Program

Detailed execution doc:

- `features/project-cleanup-program.md`

Phased order:

1. `CLEAN-001` - produce the concrete delete / move / keep inventory
2. `CLEAN-002` - remove low-risk repo junk and move backup artifacts out of `src`
3. `CLEAN-003` - separate hand-written source from generated and build outputs
4. `CLEAN-004` - prune or quarantine stub bootstrap and future-only module layers
5. `CLEAN-005` - shrink sandbox orchestration and `useCombatSandbox` complexity
6. `CLEAN-006` - continue decomposing heavyweight UI files
7. `CLEAN-007` - reduce `resolveRound.ts` risk behind regression coverage
8. `CLEAN-008` - harden save loading and compatibility behavior
9. `CLEAN-009` - sync root docs, project docs, and workflow rules after cleanup

Execution rules:

- do the cleanup track in order; do not mix `CLEAN-007` combat-core work into the early hygiene phases
- prefer deletion or relocation first, behavior refactor second
- treat generated content and save compatibility as separate risk domains
- after each cleanup slice, re-run `npm run test`, `npm run lint`, and `npm run build`

| PROFILE-001 | Define profile model and modal architecture | Profile / Architecture | рџџЎ IN PROGRESS | `features/profile-modal.md` | Profile MVP is scoped as a local client-side social card with a dedicated profile meta model and a combat-opened modal entry point |
| PROFILE-002 | Build first combat-integrated profile modal | Profile / UI | рџ”ґ TODO | `features/profile-modal.md` | Ship the first four-block profile modal from live combat data before expanding profile entry points |
| PROFILE-003 | Add session battle record and showcase blocks | Profile / UX | рџ”ґ TODO | `features/profile-modal.md` | Track local fight results and render medals, gifts, and wall placeholders as part of the profile experience |
| PROFILE-004 | Expand profile entry points beyond combat | Profile / Navigation | рџ”ґ TODO | `features/profile-modal.md` | Reuse the profile modal from menu and hunting surfaces once the first combat slice is stable |
| PROFILE-005 | Formalize profile persistence and future social bridge | Profile / Future Systems | рџ”ґ TODO | `features/profile-modal.md` | Decide what profile data should persist locally and what should stay deferred until a real backend exists |

---

## Sprint History

### v1.29 - Shared Combat Feel And Round Reveal Polish Landed

- continued the shared combat-presentation track so sandbox and online PvP now inherit the same `Round Reveal`, result reveal, and central readability improvements instead of drifting into separate fight UIs
- pushed `Round Reveal` much closer to a product-facing payoff layer with grouped per-fighter recap rows, stronger color coding for crit/block/heal events, readable action chips, longer stable timing, and sharper fade staging
- strengthened the first visual-polish pass across the shared combat shell, including heavier reveal glow/contrast and more readable impact language without breaking the common sandbox/PvP presentation contract

### v1.28 - PvP Lifecycle Regression Net Expanded

- added a longer live two-client PvP validation that now covers `finished -> rematch -> leave` across two independent clients and two SSE streams
- added a stable player-facing UI lifecycle regression that covers `resolve round -> room closed -> Play Another Match -> return to create flow`
- revalidated the PvP screen and build after the new regression pass so the project keeps moving toward a first playable deploy with better safety nets

### v1.27 - PvP Combat Parity And Recovery Pass Landed

- hardened the live PvP flow so lobby-launched rooms recover through the active player session instead of requiring debug-only dual-client subscriptions
- added dedicated realtime and EventSource regression coverage for live create, join, rematch, and multi-round recovery paths
- brought the PvP fight screen much closer to the bot-fight product surface by surfacing combat log, intent, skills, and consumables directly in the live match flow
- removed most of the residual room-dashboard wording from the fight screen, collapsed empty wrapper cards, and tied player-card intent coloring to the same visual language as the main combat screen

### v1.26 - Single Active Match Panel Landed

- unified the normal match surface into one neutral `Your Side` panel instead of keeping separate host and guest blocks in the player-facing flow
- added direct role and opponent context to that active-side card, so the room reads more like one player's match view than a two-seat operator console
- preserved explicit host/guest switching for local verification, but kept it under `Debug Tools` where it belongs
- revalidated the online screen again after the match-panel unification

### v1.25 - Focused Room Entry Flow Landed

- replaced the old simultaneously visible create/join onboarding with a focused `Match Entry` switch, so the player now sees only one room-entry intent at a time
- kept the host path on `Create Match -> Create Room` and the guest path on `Join Match -> Join Room Code`, which reduces the last obvious feeling that one person is meant to operate both onboarding roles at once
- preserved the existing local verification path and debug-side tools underneath, so the cleaner entry UX did not cost the team the current dual-client simulation hooks
- revalidated the online screen again so create, join, leave, and the local room flow still pass after the onboarding split
### v1.24 - Split Match Entry Paths Landed

- replaced the old side-by-side `Create Room` and `Join Room` setup with a clearer `Create Match / Join Match` entry switch, so players now choose one intent before seeing the corresponding room form
- kept the create path host-focused and the join path guest-focused, which reduces the feeling that one screen is asking a single player to operate both onboarding roles at once
- preserved the underlying dual-client lab support in the background, but moved the product surface closer to a true one-player room setup flow
- revalidated the online screen after the entry split so room creation, joining, leave, and the local verification path still pass
### v1.23 - Single-Player Online View Step Landed

- removed the top-level `Host Side / Guest Side` switch from the default product path so the online screen no longer opens as a two-operator control deck
- turned the active combat panel into `Your Side`, which keeps the current room flow readable while making the screen feel closer to a real player-facing online mode
- preserved host/guest side switching for development under `Debug Tools`, so diagnostics and local dual-client simulation still work without dominating the default UX
- revalidated the online screen after the view shift so the main room flow still passes its dedicated UI tests
### v1.22 - Online Duel Product Surface Cleanup Landed

- removed player/session identity details from the default online match panels so the main screen no longer reads like a transport debugger during normal play
- moved host/guest manual refresh actions fully into `Debug Tools`, keeping the core room flow focused on `Create`, `Join`, `Ready`, `Lock Attack`, `Leave`, and `Play Another Match`
- kept all developer recovery controls available behind the debug section instead of deleting useful diagnostics outright
- revalidated the product screen after the cleanup so the online duel UI still passes its dedicated screen tests
### v1.21 - Live Two-Client Validation Landed

- added a dedicated live integration test that runs two independent HTTP duel clients plus two SSE streams against one real online duel server process
- validated the full product-critical room path end to end: `create -> join -> ready -> resolve -> leave`
- confirmed that live room closure propagates to the opposing client over the realtime channel, not only through local request/response refresh
- turned the next backend question from “does live two-client flow work at all?” into “what remaining lab-only UX assumptions still need to be removed?”

### v1.20 - Server-Owned Leave Room Policy Landed

- added a dedicated `leave_duel` authority contract so `Leave Room` is now distinct from temporary disconnect and closes the room through backend-owned policy
- defined the first room-end rule: when a participant leaves, the room becomes `abandoned`, clears ready state, and stops pretending the match is still live
- wired the online screen to call the leave contract before returning to the create/join state, so the product surface now exits through the authority layer instead of only clearing local UI state
- widened arena, HTTP, and UI verification again so leave-room closure is covered end to end
### v1.19 - Server-Owned Rematch Flow Landed

- added a real `rematch_duel` authority contract, so `Play Another Match` now resets the duel inside the same room instead of only clearing local UI state
- reset rematched rooms back to a fresh `lobby` with cleared ready state, a new round-1 combat state, and the same room identity for both connected participants
- wired the online screen to call that backend-shaped rematch flow and refresh both local client views after a closed or completed match
- widened arena, HTTP, and UI verification again so room reset is covered through the authority service, the live endpoint, and the product-facing screen

### v1.18 - Playable Match Flow Landed

- added explicit match-finish UX to `Online Duel`, so closed or completed rooms now surface a dedicated finish card instead of leaving the player inside raw room state only
- added `Leave Room` and `Play Another Match` actions to the live room flow, which reset the current duel session back to a clean create/join state without relying on debug-only controls
- extended `Match Status` with an outcome summary so the screen can show `winner`, `Room closed`, or `In progress` as part of the main product path
- widened the online UI verification slice so timeout-to-reset flow is covered end to end through the product-facing buttons
### v1.17 - Round Lifecycle Replay Landed

- expanded SSE replay from plain `duel_state_sync` recovery into core round lifecycle events, so reconnect can now catch `round_ready` and `round_resolved` instead of only the latest room snapshot
- kept the replay stream seat-specific and resume-token guarded, so lifecycle replay still belongs to the active server-owned recovery session
- updated the online screen event tracking so reconnect cursors stay current across non-sync SSE events too
- widened backend verification to cover reconnect after a resolved round and confirm that lifecycle events replay before the latest synced room state

### v1.16 - Session Handoff Ownership Landed

- promoted `sessionId` into live duel mutations, so `ready`, `submit`, and connection changes now belong to the currently owned seat session instead of only a shared `playerId`
- allowed same-player rejoin with a newer live session to hand off seat ownership instead of hard-failing while the old session is still marked connected
- displaced the older live session after handoff, so stale clients now get `displaced_session` instead of being able to keep mutating the room
- widened arena verification to cover explicit seat handoff and old-session rejection

### v1.15 - Event Cursor Replay Landed

- started tagging pushed SSE room updates with event ids and keeping a short per-seat history on the server
- taught reconnecting clients to pass `afterEventId`, so the backend can replay missed room sync events instead of always jumping straight to a blind fresh snapshot
- kept the existing resume-token validation in place, so replay still belongs to the current server-owned recovery session
- widened backend verification to cover cursor-based replay after reconnect

### v1.14 - Resume Token Recovery Landed

- issued server-owned `resumeToken` values per duel seat and surfaced them through seat-specific state sync
- required that token on sync recovery paths, so `requestSync` and SSE reattach now bind to the current server-owned resume session instead of trusting only `playerId`
- invalidated stale recovery tokens when a player rejoins with a fresh session, which gives reconnect flow clearer ownership semantics without changing the core room model
- widened backend and arena verification to cover stale-session rejection and latest-token recovery

### v1.13 - SSE Recovery Pass Landed

- hardened the duel client seam so pushed sync payloads now ignore stale revisions instead of rolling room state backward
- taught the online duel screen to run an authoritative sync when the SSE channel opens or errors, so stream reattach can recover live room state instead of waiting on manual refresh
- widened backend verification to cover event-stream reattach and latest-state replay for a reconnecting player
- kept the current HTTP + SSE service slice simple while improving state-resume behavior without forking a second transport stack

### v1.12 - SSE Realtime Push Slice Landed

- added a first realtime delivery path through `GET /api/online-duel/events`, so active players can receive duel sync updates over server-sent events
- taught the online duel client seam and screen to accept pushed `duel_state_sync` messages instead of relying only on request/response refresh
- kept the backend-first HTTP authority flow intact while adding safe cleanup for long-lived event-stream subscribers
- widened backend verification again so the live service now covers health, message flow, and room sync push behavior
### v1.11 - Stale Round Submit Guard Landed

- added revision metadata to duel sync payloads so the backend and client now share an explicit freshness marker
- hardened the authority contract to reject round submissions that target an old round instead of silently accepting stale client state
- kept the current HTTP request/response flow playable by guarding stale combat actions without blocking normal ready-check interactions
- widened verification again across backend, arena, and the online screen so guarded submit behavior stays covered

### v1.10 - Server-Owned Round Result Card Landed

- extended the online authority contract with compact round summaries instead of exposing raw combat internals
- returned that summary from both `round_resolved` and duel sync payloads so reconnect and refresh flows can still restore the latest exchange
- added a product-facing `Round Result` card to `Online Duel` with commentary, damage outcome, and live HP state for both fighters
- widened backend, arena, and UI verification again so the summary path is covered end to end

### v1.09 - Backend-First Duel Transport Landed

- switched the duel transport seam to async so the same client contract now works across local and HTTP adapters
- connected the `Online Duel` screen to prefer the live backend service and automatically fall back to local authority when the backend is unavailable
- kept session reset, reconnect, and planner flow working across that transport split instead of forking the UI into separate debug paths
- widened verification again so arena client-seam tests and the online screen test both cover the async transport flow

### v1.08 - First HTTP Authority Slice Landed

- stood up the first real backend process for online duel flow behind `npm run online:server`
- mounted the existing duel authority handler behind HTTP `POST /api/online-duel/message` and `GET /health`
- kept room creation, room-code join, ready-state, and round resolution on the same shared arena contracts instead of forking server-only logic
- added end-to-end backend verification for health, create-room, join-by-code, and malformed-request handling

### v1.07 - Planner-Driven Round Submit Landed

- replaced hardcoded round submits with a real attack/defense planner on the online screen
- each side now selects one attack zone and two defense zones before `Lock Attack`
- the local online flow now mirrors the same zone-based combat language used in the bot and sandbox combat loop
- widened the online UI test again so the room flow verifies zone selection before round resolution

### v1.06 - Online Duel Product Surface Landed

- renamed the frontend-safe prototype from `Online Duel Lab` to `Online Duel`
- reworked the screen into `Create Room`, `Join Match`, `Match Status`, `Host Side`, and `Guest Side`
- moved reconnect, session reset, timeout, and raw message review into `Debug Tools` so the default flow reads like a playable room
- widened the UI verification slice so the product-facing screen is covered instead of only the older lab shell

### v1.05 - Stale Room Timeout Slice Landed

- added an authority-side timeout sweep so stale duel rooms can fall into `abandoned` instead of lingering forever
- exposed a safe `Force Timeout` control in `Online Duel Lab` so timeout hardening can be verified without waiting on real clocks
- widened online verification again so stale-room behavior is covered by both arena and UI tests

### v1.04 - Room Code And Reconnect Slice Landed

- added a dedicated `roomCode` to duel state sync and surfaced it in `Online Duel Lab`
- added first-pass disconnect and reconnect messages so room participants can flip between `connected` and `offline` without mutating combat internals directly
- pausing a participant now drops the room back to `lobby` instead of pretending planning is still safe

### v1.03 - Pre-Fight Lobby Gate Landed

- added an explicit `lobby -> ready -> planning` gate before the first duel exchange
- transport and client layers now support player readiness instead of jumping straight from join into attacks
- `Online Duel Lab` now behaves more like a real room flow and no longer skips pre-fight confirmation

### v1.02 - Local Client Seam Landed

- added a frontend-facing local duel client and transport wrapper over the backend authority service
- the online stack can now be exercised as `client -> transport -> authority -> server messages` without introducing a real socket runtime
- prepared the project for a future minimal host/join UI surface that can talk to the online backend seam instead of directly mutating duel state

### v1.01 - Duel Transport Adapter Slice Landed

- added the first transport-facing client/server message handler on top of the in-memory authority service
- transport messages can now create a duel, join it, request sync, submit actions, emit `round_ready`, and auto-resolve into `round_resolved`
- widened online-duel tests again so the next frontend or realtime layer can target verified message contracts instead of raw service calls

### v1.00 - In-Memory Duel Authority Service Landed

- extended the pure duel-room domain into a real in-memory authority service with room storage, state sync, and mutation entry points
- gave the online track its first backend-like API surface without introducing a real server process yet
- widened the backend verification slice so the next transport phase can target a stable service boundary instead of raw room objects

### v0.99 - Online Duel Backend Track Opened

- opened a dedicated `1v1 online` feature track with a backend-authoritative architecture plan
- added `BACKEND-001` through `BACKEND-005` to the master plan so online work now has an explicit execution order
- started the first implementation slice around authority-ready duel room contracts instead of jumping straight into transport or UI

### v0.1 - Planning Workflow Added

- added repo-level master plan for task tracking
- added feature documentation template under `features/`
- started formal tracking for UI / UX audit and refactor planning

### v0.2 - UI / UX Refactor Roadmap Defined

- converted the UI / UX audit into a tracked phased roadmap
- split the refactor effort into architecture, UX, and QA workstreams
- prepared task IDs for incremental execution instead of one large rewrite

### v0.3 - Current Baseline Saved

- locked the current planning baseline before implementation work
- marked the audit and roadmap task as complete
- confirmed that the next implementation step is `UI-002`

### v0.4 - UI Rollback Checkpoint Saved

- saved a dedicated UI backup point before starting `UI-002`
- copied the current live combat UI files into `docs/backup-points/2026-03-13-2155-ui-baseline/`
- recorded the checkpoint in `docs/backup-points/BACKUP-POINT-2026-03-13-2155-MSK.md`

### v0.5 - UI-002 Foundation Slice Landed

- added shared UI primitives under `src/ui/components/shared/`
- migrated `InventoryPopover.tsx` and `EquipmentSlotPopover.tsx` to shared modal and action-button primitives
- verified the slice with `tests/ui/combatSandboxScreen.test.tsx` and `npm run build`

### v0.6 - Build Presets Moved To Shared Layer

- migrated `BuildPresetsPopover.tsx` to `ModalOverlay`, `ModalSurface`, `ActionButton`, and `PanelCard`
- preserved the dedicated presets visual theme while reducing duplicated modal and panel code
- re-verified preset apply flow with `tests/ui/combatSandboxScreen.test.tsx` and `npm run build`

### v0.7 - Builder Shell Moved To Shared Layer

- migrated `BuilderPopover.tsx` outer modal shell to `ModalOverlay` and `ModalSurface`
- moved top-level builder actions and preset-entry actions to `ActionButton`
- kept inner builder cards feature-local on purpose to avoid mixing `UI-002` with deeper component decomposition work

### v0.8 - UI-002 Closed, UI-004 Started

- finished the shared modal, panel, and action foundation pass across the main combat popovers
- aligned `BuilderPopover` local `PanelCard` with the shared panel primitive through a thin wrapper
- moved the active refactor focus to hover-preview and anchored popover infrastructure

### v0.9 - Anchored Preview Hook Introduced

- added `src/ui/hooks/useAnchoredPopup.ts` as a shared positioning hook for preview and anchored popover flows
- migrated `ItemHoverPreview.tsx` and the equipment preview inside `CombatSilhouette.tsx` to the new hook
- re-verified the first `UI-004` slice with `tests/ui/combatSandboxScreen.test.tsx` and `npm run build`

### v0.10 - Preview Surface Chrome Unified

- added `src/ui/components/shared/PreviewSurface.tsx` and `src/ui/components/shared/PreviewTag.tsx`
- migrated `ItemHoverPreview.tsx` and `CombatSilhouette.tsx` equipment preview chrome to the same shared preview surface
- kept the actual preview card content unchanged while removing duplicate hover-surface styling

### v0.11 - UI-004 Closed, UI-003 Started

- added `src/ui/components/shared/ItemPreviewPopover.tsx` to unify the preview content shell around `ItemPresentationCard`
- finished the main hover-preview infrastructure pass and closed `UI-004`
- moved the active refactor focus to decomposing `CombatSandboxScreen.tsx` into section-level components

### v0.12 - First Combat Screen Section Extracted

- extracted `PlayerCombatPanel` from `CombatSandboxScreen.tsx` as the first screen-level section component
- kept the player flow and equipment-slot overlay behavior unchanged while reducing the size of the main render body
- re-verified the screen with `tests/ui/combatSandboxScreen.test.tsx` and `npm run build`

### v0.13 - Fight Controls Extracted

- extracted `FightControlsPanel` from `CombatSandboxScreen.tsx` as the first central control section
- prepared `BotCombatPanelSidebar` as a helper for the next bot-panel extraction pass
- re-verified the screen with `tests/ui/combatSandboxScreen.test.tsx` and `npm run build`

### v0.14 - Attack Target And Round Extracted

- extracted `AttackTargetRoundPanel` from `CombatSandboxScreen.tsx`
- reduced the inline center-panel render further without changing round flow or zone selection behavior
- re-verified the screen with `tests/ui/combatSandboxScreen.test.tsx` and `npm run build`

### v0.15 - Combat Actions Extracted

- extracted `CombatActionsPanel` from `CombatSandboxScreen.tsx`
- moved the skills and consumables action-rail section out of the main render without changing combat action behavior
- re-verified the screen with `tests/ui/combatSandboxScreen.test.tsx` and `npm run build`

### v0.16 - Battle Log Section Extracted

- extracted `BattleLogSection` from `CombatSandboxScreen.tsx`
- moved the battle-log shell wrapper out of the main screen render while keeping the log behavior unchanged
- re-verified the screen with `tests/ui/combatSandboxScreen.test.tsx` and `npm run build`

### v0.17 - Bot Sidebar Swapped To Extracted Helper

- replaced the remaining inline bot sidebar in `CombatSandboxScreen.tsx` with `BotCombatPanelSidebar`
- finished the first safe extraction pass over the bot-side utility and snapshot sidebar without changing combat behavior
- re-verified the screen with `tests/ui/combatSandboxScreen.test.tsx` and `npm run build`

### v0.18 - Combat Screen Decomposition Closed

- extracted `BotCombatPanel` and `FightSetupPanel` from `CombatSandboxScreen.tsx`
- completed the screen-level decomposition so the combat screen now acts primarily as a section coordinator
- closed `UI-003` and moved the active refactor focus to `UI-008`

### v0.19 - Combat Silhouette Decomposition Started

- extracted `SilhouetteHeader`, `SilhouetteHpBar`, and `SilhouetteBoard` from `CombatSilhouette.tsx`
- started `UI-008` with a safe structure-first pass that does not change zone interaction or preview behavior
- re-verified the screen with `tests/ui/combatSandboxScreen.test.tsx` and `npm run build`

### v0.20 - Combat Silhouette Zone Layer Extracted

- extracted `SilhouetteFigure`, `SilhouetteZonesLayer`, and `SilhouetteLegend` from `CombatSilhouette.tsx`
- moved zone rendering and legend chrome out of the main silhouette component without changing zone selection or marker behavior
- re-verified the screen with `tests/ui/combatSandboxScreen.test.tsx` and `npm run build`

### v0.21 - Combat Silhouette Equipment Layer Extracted

- extracted `SilhouetteEquipmentLayer` from `CombatSilhouette.tsx`
- moved equipment-slot mapping and hover wiring out of the main silhouette component without changing preview or slot-click behavior
- re-verified the screen with `tests/ui/combatSandboxScreen.test.tsx` and `npm run build`

### v0.22 - Combat Silhouette Status Layer Extracted

- extracted `SilhouetteStatusEffects` from `CombatSilhouette.tsx`
- moved the header-level status-effects entry point out of the main silhouette header without changing badge or popup behavior
- re-verified the screen with `tests/ui/combatSandboxScreen.test.tsx` and `npm run build`

### v0.23 - Visual Polish Plan Added

- added `UI-010` as a dedicated visual polish task for combat UI
- separated visual styling improvements from the active structural refactor track
- prepared a dedicated visual-improvement backlog without mixing it into the structural UI refactor

### v0.82 - Hunting Tool Focus Layer Added

- opened `HUNT-009` as the first hunting gameplay layer after the stabilized lodge MVP
- added a compact tool-focus system that changes route-specific yields through `equipHuntingTool(...)`
- documented tool-driven route planning as the next hunting gameplay base after persistence and UI compaction

### v0.83 - Hunting Profile Tab Legacy Save Fix Added

- fixed the hunting `Profile` tab crash for older saves created before `profile.tool` existed
- added save normalization in `loadHuntingState(...)` so legacy hunting profiles automatically receive an empty tool loadout
- added regression coverage for legacy hunting saves without the tool field

### v0.84 - Hunting Route Stances Added

- extended `HUNT-009` with `Steady`, `Greedy`, and `Cautious` route stances
- connected stance bonuses to encounter pace, success rate, and payout behavior in `resolveHunt(...)`
- exposed stance selection in the hunting profile tab and added test coverage for the risk-vs-reward tradeoff

### v0.24 - Motion Feedback Added To Visual Plan

- expanded `UI-010` to include motion feedback as part of the combat visual polish pass
- added resource-ready button glow and radial progress concepts for action readiness states
- added silhouette hit-reaction animation as a planned feedback layer for received damage events

### v0.25 - UI-010 Motion Implementation Started

- started `UI-010` with `VP-M02`, the lowest-risk ready-state motion slice
- added a pulsing ready-state treatment for skill buttons when the required resource threshold is met
- added the same ready-state pulse to `Resolve Round` when the round is ready to resolve
- re-verified the combat screen with `tests/ui/combatSandboxScreen.test.tsx` and `npm run build`

### v0.26 - Silhouette Hit Reaction Landed

- implemented `VP-M03` as a short silhouette impact animation when the incoming combat result deals real damage
- applied the motion at the silhouette board layer so both player and bot silhouettes can react without touching combat logic
- re-verified the combat screen with `tests/ui/combatSandboxScreen.test.tsx` and `npm run build`

### v0.27 - Resource Ring Landed

- implemented `VP-M01` for skill buttons while the required resource is still building
- added a circular progress ring that fills toward readiness and hands off to the existing ready pulse once the threshold is reached
- re-verified the combat screen with `tests/ui/combatSandboxScreen.test.tsx` and `npm run build`

---

## Planned Refactor Phases

### Phase 1 - Stabilize UI Foundations

- goal: reduce repeated UI patterns before touching behavior-heavy screens
- tasks:
  - `UI-002`
  - `UI-004`
- expected outcome:
  - shared overlay, modal, button, pill, and panel primitives
  - one reusable preview / popover positioning pattern

### Phase 2 - Decompose Main Combat Screen

- goal: turn the sandbox screen into a screen-level coordinator instead of a monolith
- tasks:
  - `UI-003`
  - `UI-008`
- expected outcome:
  - smaller screen sections
  - lower coupling between screen layout and detailed presentation blocks

### Phase 3 - Improve UX Flow

- goal: make build setup and round setup easier to understand and operate
- tasks:
  - `UI-005`
  - `UI-006`
  - `UI-007`
  - `UI-010`
- expected outcome:
  - clearer build journey
  - guided round construction
  - less cognitive overload on the primary screen
  - stronger visual hierarchy and cleaner combat presentation
  - more readable motion feedback for combat readiness and impact states

### Phase 4 - Protect The Refactor

- goal: lock down behavior before or during invasive UI work
- tasks:
  - `UI-009`
- expected outcome:
  - contract tests for modal flows, action flows, and critical combat UI behavior

---

## Feature Docs

- `features/_TEMPLATE.md` - base template for every feature or refactor track
- `features/ui-ux-refactor.md` - reserved for the UI / UX refactor plan and progress log

---

## Saved Checkpoints

| Version | Type | Description | Next Step |
|---------|------|-------------|-----------|
| v0.3 | Planning Baseline | Current UI / UX audit, phased roadmap, and task-tracking workflow saved before refactor work starts | `UI-002` |
| v0.4 | UI Backup Point | Live UI snapshot saved before shared-primitives refactor begins | `UI-002` |
| v0.5 | UI Foundation Slice | Shared primitives introduced and first two popovers moved to the new layer | `UI-002` |
| v0.6 | Presets Shared-Layer Slice | Build presets popover now uses the shared modal, button, and panel primitives | `UI-002` |
| v0.7 | Builder Shell Slice | Builder modal shell and top-level actions now use shared primitives | `UI-002` |
| v0.8 | Foundation Closed | Shared modal, panel, and action primitives are now established enough to close `UI-002` | `UI-004` |
| v0.9 | Anchored Preview Slice | Shared hover/anchored popup hook now powers item hover and silhouette equipment preview positioning | `UI-004` |
| v0.10 | Preview Chrome Slice | Shared preview surface and tag now unify the hover-card chrome across combat UI | `UI-004` |
| v0.11 | Hover Infrastructure Closed | Shared preview hook, surface, tag, and item preview shell are now established enough to close `UI-004` | `UI-003` |
| v0.12 | Player Section Slice | First `CombatSandboxScreen` section extracted without changing combat flow | `UI-003` |
| v0.13 | Fight Controls Slice | First central fight-setup section extracted while preserving combat behavior | `UI-003` |
| v0.14 | Round Setup Slice | Attack target and round-control section extracted from the central combat panel | `UI-003` |
| v0.15 | Combat Actions Slice | Skills and consumables rails extracted from the central combat panel | `UI-003` |
| v0.16 | Battle Log Slice | Battle log shell extracted from the main combat screen render | `UI-003` |
| v0.17 | Bot Sidebar Slice | Bot utility and snapshot sidebar now render through the extracted helper | `UI-003` |
| v0.18 | Screen Decomposition Closed | Bot and center sections now render through extracted screen components; `UI-003` is complete | `UI-008` |
| v0.19 | Silhouette Structure Slice | `CombatSilhouette` now has extracted header, hp bar, and board shell components | `UI-008` |
| v0.20 | Silhouette Zone Slice | `CombatSilhouette` now has extracted figure, zone layer, and legend components | `UI-008` |
| v0.21 | Silhouette Equipment Slice | `CombatSilhouette` now has an extracted equipment-slot layer | `UI-008` |
| v0.22 | Silhouette Status Slice | `CombatSilhouette` now has an extracted status-effects layer entry point | `UI-008` |
| v0.23 | Visual Polish Plan | Dedicated visual design polish task added to the roadmap as `UI-010` | `UI-010` |
| v0.24 | Motion Feedback Plan | Resource-ready and hit-reaction animations added to the visual polish roadmap | `UI-010` |
| v0.25 | Ready-State Motion Slice | `VP-M02` ready-state pulse implemented for skill buttons and `Resolve Round` | `UI-010` |
| v0.26 | Silhouette Hit Reaction Slice | `VP-M03` silhouette impact animation implemented for real incoming damage | `UI-010` |
| v0.27 | Resource Ring Slice | `VP-M01` circular readiness ring implemented for skill buttons while resources are building | `UI-010` |
| v0.28 | Combat Design Rules Requirement | Combat design and rules documentation promoted to a tracked first-class requirement in the master plan | `COMBAT-001` |
| v0.29 | Combat Track Expanded | Combat documentation requirement split into spec, pipeline, test, refactor, and verification tasks | `COMBAT-001` |
| v0.30 | Combat Reference Draft Started | First source-of-truth combat design draft added under `docs/architecture/` and `COMBAT-001` moved to in-progress | `COMBAT-001` |
| v0.31 | Combat Formula Draft Expanded | Combat reference now includes formula coefficients, passive rules, and current coverage notes from the live test suite | `COMBAT-001` |
| v0.32 | Combat Order And Verification Slice | Combat reference now includes turn-order examples and a formal verification checklist for combat changes | `COMBAT-001` |
| v0.33 | Combat Reference Closed | Combat source-of-truth now covers runtime model, formulas, passives, turn order examples, bot assumptions, and rules-screen alignment | `COMBAT-002` |
| v0.34 | Combat Sequencing Slice | Combat pipeline documentation now captures exact per-actor sequencing, path order, and critical edge cases from `resolveRound(...)` | `COMBAT-002` |
| v0.35 | Combat Traceability Slice | Combat reference now maps major runtime rules to tests and Combat Rules dependencies for safer follow-up work | `COMBAT-002` |
| v0.36 | Combat Regression Matrix Added | Combat pipeline docs now hand off directly into a prioritized regression-test matrix for `COMBAT-003` | `COMBAT-003` |
| v0.37 | GitBook Docs Prep | Added docs landing pages, section indexes, and GitBook-friendly navigation links across architecture and decision docs | `DOC-001` |
| v0.38 | GitBook Navigation Finalized | Added `docs/SUMMARY.md` and synchronized root docs for GitBook export readiness | `DOC-001` |
| v0.39 | GitBook Publish Setup Added | Added publish setup guide, docs validation script, and GitHub workflow for GitBook-ready docs handoff | `DOC-001` |
| v0.40 | VitePress Docs Site Added | Added VitePress site config, GitHub Pages deploy workflow, and local docs build commands on top of the repo docs source | `DOC-001` |
| v0.41 | Docs Site Build Verified | Verified local VitePress build and opted workflows into Node 24 execution for GitHub Actions stability | `DOC-001` |
| v0.42 | Docs Site Polish Pass | Improved VitePress home page, section landing pages, sidebar structure, and theme styling for a more wiki-like docs experience | `DOC-001` |
| v0.43 | Docs Information Architecture Expanded | Added role-based Gameplay and Systems hubs, stronger home navigation, and a more discoverable wiki-style docs structure | `DOC-001` |
| v0.44 | Docs Section Hubs Refined | Upgraded Gameplay, Systems, Architecture, and Decisions landing pages into fuller wiki-style section hubs with clearer reading paths and task-oriented entry points | `DOC-001` |
| v0.45 | Combat Docs Subsections Added | Split the oversized combat reference into dedicated subsection pages for model, formulas, integrations, and verification with sidebar support | `DOC-001` |
| v0.46 | Combat Expansion Track Added | Added a dedicated master-plan workstream for new combat states, more varied skills, stronger archetype identity, and matching docs/test coverage | `COMBAT-006` |
| v0.47 | Combat State Layer Expanded | Extended the first-wave state system across axe and shield skills, keeping the same readable `Exposed` / `Staggered` layer while growing setup/payoff diversity and regression coverage | `COMBAT-006` |
| v0.48 | Combat Rules State Sync Started | Updated generated Combat Rules facts so the player-facing rules screen now explains the live `Exposed` / `Staggered` setup-payoff layer and condition-based skill bonuses | `COMBAT-009` |
| v0.49 | Combat Verification Docs Synced With State Layer | Extended combat integration and traceability docs so setup/payoff windows and short rider expiry behavior are explicitly part of combat verification | `COMBAT-009` |
| v0.50 | Combat Rules Copy Synced With State Layer | Updated the main English Combat Rules copy so named states and setup/payoff windows are explained directly in the reader-facing sections, not only in generated fact cards | `COMBAT-009` |
| v0.51 | Combat Rules State Sync Closed | Finished the first full docs/rules handoff for the new `Exposed` / `Staggered` layer so runtime, Combat Rules, and verification docs are aligned again | `COMBAT-009` |
| v0.52 | More Varied Payoff Skills Started | Began `COMBAT-007` by extending the current state windows into armor and accessory kits through `Body Check` and `Killer Focus` payoff interactions | `COMBAT-007` |
| v0.53 | Warden Counter Loop Started | Began `COMBAT-008` by turning guard-based kits into a clearer counter-archetype through `Shield Bash` setup into `Parry Riposte` and `Iron Brace` payoff pressure | `COMBAT-008` |
| v0.54 | Duelist And Executioner Loop Expanded | Extended `COMBAT-008` so `Execution Mark` now creates `Exposed` and `Heartseeker` now cashes it in, giving precision and finisher kits a clearer identity alongside the Warden slice | `COMBAT-008` |
| v0.55 | Combat Expansion Balance Snapshot Captured | Promoted `COMBAT-010` into active work after a fresh build matrix showed `Shield / Guard` leading the field while `Dagger / Crit` and `Heavy / Two-Hand` lag behind the current meta | `COMBAT-010` |
| v0.56 | Preset Balance Pass Measured | Rebalanced the curated presets and re-ran the matrix: `Heavy / Two-Hand` improved materially, `Shield / Guard` stayed dominant, and `Dagger / Crit` became the clearest weak point | `COMBAT-010` |
| v0.57 | Dagger Rescue Pass Measured | Restored a more direct burst profile to `Dagger / Crit` and re-ran the matrix: dagger improved clearly, `Shield / Guard` softened slightly, and `Sustain / Regen` emerged as the other top-tier outlier | `COMBAT-010` |
| v0.58 | Heavy Rescue Pass Measured | Restored the stable heavy preset shell, raised greatsword baseline pressure, and slightly strengthened `Execution Arc`; the matrix moved `Heavy / Two-Hand` from `Net -27` to `Net -24`, while `Mace / Control` slipped and the sustain/guard leaders stayed in place | `COMBAT-010` |
| v0.59 | UX Cleanup Track Added | Shifted the next product focus away from open-ended balance tuning and formalized a combat UX cleanup queue around a `Current Turn` block, guided round setup, lower screen noise, clearer state/payoff feedback, and a more unified build flow | `UI-011`, `UI-012`, `UI-013`, `UI-014`, `UI-015` |
| v0.60 | Hunting MVP Blueprint Added | Formalized `hunting` as an autonomous idle-sim workstream, added the first architecture blueprint, and created `HUNT-001` through `HUNT-007` as the implementation roadmap | `HUNT-001`, `HUNT-002`, `HUNT-003`, `HUNT-004`, `HUNT-005`, `HUNT-006`, `HUNT-007` |
| v0.61 | Hunting Domain Contracts Landed | Started `HUNT-001` by adding the first-pass hunting model contracts for hunter profile, hunting stats, hunt state, hunt rewards, pet-lite, gear, and expanded zone metadata, then verified the new bounded context layer with a clean build | `HUNT-001` |
| v0.62 | Hunting Factories And Save Draft Added | Extended `HUNT-001` with starter zones, profile and gear creation helpers, and a draft save-shape for `state.hunting.*`, leaving the module ready for deterministic hunt start and resolution work | `HUNT-001` |
| v0.63 | Hunting Runtime Slice Landed | Started `HUNT-002` by implementing deterministic `startHunt` and `resolveHunt`, added the first hunting module tests, and verified the new loop with green tests and build | `HUNT-002` |
| v0.64 | Hunting Reward Bridge Landed | Started `HUNT-003` by adding a dedicated hunting reward catalog and `claimHuntRewards`, then verified that pending hunt rewards can be claimed into the shared inventory through the existing inventory module | `HUNT-003` |
| v0.65 | Hunting Progression Slice Landed | Started `HUNT-004` by adding hunter experience, level-step progression, stat allocation, and verified zone unlock timing for the first hunting progression loop | `HUNT-004` |
| v0.66 | Hunting Gear And Pet-Lite Slice Landed | Started `HUNT-005` by adding starter gear and pet catalogs, profile-level equip and assign flows, and live resolver bonuses for speed, survival, loot quantity, and rare drops | `HUNT-005` |
| v0.67 | Hunting UI Shell Landed | Started `HUNT-006` by adding the first hunting screen, menu navigation, screen-state hook, and a visible start-resolve-claim loop over the live hunting runtime and reward bridge | `HUNT-006` |
| v0.68 | Hunting Docs Handoff Started | Started `HUNT-007` by adding a live hunting runtime reference, syncing architecture overview, and aligning root project docs with the now-live hunting module | `HUNT-007` |
| v0.69 | Hunting MVP Handoff Closed | Finished the first hunting documentation handoff, validated the docs, and closed the initial hunting MVP track with runtime, UI shell, and verification rules all in sync | `HUNT-007` |
| v0.70 | Hunting Persistence Slice Landed | Started `HUNT-008` by persisting hunting state through the shared save envelope, restoring the hook state on load, and adding dedicated persistence tests | `HUNT-008` |
| v0.71 | Hunting Restored-Session UX Added | Extended `HUNT-008` with a restored-session banner, a clearer step-strip, live elapsed and remaining route timing, and resolve gating so the player can understand saved hunting state and only finish a route once the timer is truly complete | `HUNT-008` |
| v0.72 | Hunting UI Polish Slice Added | Extended `HUNT-008` with a reverse route countdown bar, mini inventory strip, stronger route console, and MMO-style loot popup feedback so the hunting screen reads more like a live game mode than a raw debug shell | `HUNT-008` |
| v0.73 | Hunting Route Ledger Added | Extended `HUNT-008` with persist-backed recent claim history and a route ledger panel so the lodge keeps a short campaign log instead of only showing the latest haul | `HUNT-008` |
| v0.74 | Hunting Zone Board Enriched | Extended `HUNT-008` with richer route cards that surface base payout, threat pips, and loot-profile hints so route selection reads more like a real game board and less like raw data tags | `HUNT-008` |
| v0.75 | Hunting HUD Rail Added | Extended `HUNT-008` with a dedicated right-side HUD rail for active route state, companion status, quick stash, and latest haul so the lodge now reads as a single game panel instead of disconnected cards | `HUNT-008` |
| v0.76 | Hunting Route Atmosphere Added | Extended `HUNT-008` with route icons and richer loot-preview chips on zone cards so route selection feels more atmospheric and MMORPG-like instead of purely textual | `HUNT-008` |
| v0.77 | Hunting Action Motion Added | Extended `HUNT-008` with ready, resolve, and claim micro-interactions plus stronger ready-state emphasis on the route console and route HUD so the hunting flow feels more alive in motion | `HUNT-008` |
| v0.78 | Hunting Compact Layout Pass Added | Extended `HUNT-008` with a compact-mode layout, reduced panel density, fewer duplicate sections, and more tooltip-driven secondary details so the lodge is much closer to fitting into a single screen without scroll | `HUNT-008` |
| v0.79 | Hunting Tabbed Single-Screen Pass Added | Extended `HUNT-008` by replacing the lower multi-panel stack with a tabbed panel plus compact ledger column so the lodge is much closer to a true one-screen layout without losing route, status, or profile detail | `HUNT-008` |
| v0.80 | Hunting No-Scroll Pass Tightened | Tightened `HUNT-008` further by leaning harder into tabbed panels, shorter copy, and tooltip-driven secondary context so the lodge is more aggressively tuned for one-screen use | `HUNT-008` |
| v0.81 | Hunting HUD Compact Step Added | Tightened the right-side hunting HUD with smaller companion and haul cards so the one-screen layout wastes less vertical space in the snapshot rail | `HUNT-008` |
| v0.82 | Hunting Tool Focus Slice Landed | Closed the main `HUNT-008` persistence/UI work and opened `HUNT-009` with a first hunting tool-focus layer that changes route yields, persists through the hunter profile, and is selectable from the profile tab | `HUNT-009` |
| v0.83 | Combat Motion Layer Refactored | Split combat impact presentation into a dedicated motion helper, overlay component, and CSS layer so `CombatSilhouette` no longer owns all impact rendering details directly | `UI-008`, `UI-010` |
| v0.84 | Combat Finish And Block-Break Motion Added | Added persistent post-fight silhouette states, `BLOCK BREAK` feedback for penetrated blocks, and hardened impact resets so each new combat event cleanly replaces the previous linger animation | `UI-010` |
| v0.85 | Profile Modal Track Opened | Added a dedicated `Profile Modal` feature track, formalized `PROFILE-001` through `PROFILE-005`, and scoped the first release as a local client-side modal instead of a full social system | `PROFILE-001`, `PROFILE-002`, `PROFILE-003`, `PROFILE-004`, `PROFILE-005` |
| v0.86 | Project Cleanup Track Added | Added a dedicated cleanup program with phased repo hygiene, source-boundary cleanup, stub pruning, UI/runtime decomposition, persistence hardening, and docs-sync follow-up tasks | `CLEAN-001`, `CLEAN-002`, `CLEAN-003`, `CLEAN-004`, `CLEAN-005`, `CLEAN-006`, `CLEAN-007`, `CLEAN-008`, `CLEAN-009` |
| v0.87 | Cleanup Progress Synced | Closed cleanup inventory, safe junk removal, stub pruning, and sandbox hook decomposition; continued combat-screen file-splitting and synced docs so the next session can resume directly from the current cleanup frontier | `CLEAN-001`, `CLEAN-002`, `CLEAN-004`, `CLEAN-005`, `CLEAN-006`, `CLEAN-009` |
| v0.88 | Builder Surface Decomposition Extended | Split `BuilderPopover` into sibling state, derived, popover, primitive, and panel modules so the main file now acts as a thinner coordinator | `UI-008`, `CLEAN-006` |
| v0.89 | Preset, Inventory, And Item Card Helper Layers Extracted | Moved helper and visual-support code out of `BuildPresetsPopover`, `InventoryPopover`, and `ItemPresentationCard` into sibling modules to keep the main files focused on composition | `UI-008`, `CLEAN-006` |
| v0.90 | Battle Log Surface Refactored And Polished | Split `BattleLogPanel` into helper, card, and primitive layers, unified battle-log wording helpers, and refreshed the log header/cards without changing combat behavior | `UI-008`, `UI-010`, `CLEAN-006` |
| v0.91 | Combat Recovery Track Started | Chose a `per-damage-type` mitigation direction, formalized a combat recovery workstream, and removed bot-side zone omniscience so defense planning is no longer based on the player's announced attack zone | `COMBAT-011`, `COMBAT-012`, `COMBAT-013`, `COMBAT-014` |
| v0.92 | Typed Mitigation Slice Landed | Added a dedicated combat-mitigation service and switched round resolution from pooled-feeling armor reduction to typed zone-based mitigation, with direct regression tests for type weighting and defended-zone focus | `COMBAT-012` |
| v0.93 | Broken Weapon Presets Repaired | Replaced zero-damage starter weapons in the live dagger, axe, and heavy presets with real Battle Kings weapon entries so balance data and playtesting reflect actual weapon damage instead of fallback formulas alone | `COMBAT-012`, `COMBAT-010` |
| v0.94 | Control Preset Inputs Normalized | Fixed the under-budget `Mace / Control` stat allocation and removed the champion bot's zero-damage starter sword so blunt/control analysis now reflects actual systemic weakness instead of corrupted inputs | `COMBAT-012`, `COMBAT-010` |
| v0.95 | Blunt-Control Rescue Pass Started | Lowered generic blunt zone defense and strengthened the mace passive so blunt/control builds can convert more pressure into real follow-up damage without reopening the full combat system at once | `COMBAT-012`, `COMBAT-010` |
| v0.96 | Sustain And Sword Pressure Softened | Reduced `Open Wound` bleed ticks and shortened `regen-potion` strength so the top slash/sustain cluster stops dominating quite as hard while the newly repaired mid-tier archetypes keep their gains | `COMBAT-012`, `COMBAT-010` |
| v0.97 | Dagger Rescue Pass Started | Improved the dagger burst lane through slightly better survivability and a stronger `Vital Mark`, moving `Dagger / Crit` closer to the mid-tier without destabilizing the rest of the meta | `COMBAT-012`, `COMBAT-010` |
| v0.98 | Skill Carrier Snapshot Bug Fixed | Repaired a circular-import drift in starter skill carriers that was corrupting combat snapshots with `NaN`, restored real damage typing to zone audits, and reset the balance loop onto valid post-skill data | `COMBAT-016`, `COMBAT-010`, `COMBAT-012` |

---

## Update Checklist

When work changes state:

1. update the task row in `Global Master Plan`
2. update or create the matching file in `features/`
3. add completed work to `Sprint History`
4. update the timestamp at the top of this file
5. record sprint-level outcomes here, not every micro-step taken inside the sprint

---

> Last updated: 2026-03-22 22:40 MSK






