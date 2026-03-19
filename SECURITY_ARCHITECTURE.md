# SECURITY_ARCHITECTURE - Fight Club

> Last updated: 2026-03-20 01:00 MSK

**Status:** browser-first SPA plus local online-duel backend slice  
**Risk level:** medium  
**Reason:** there is still no auth/secrets surface, but the repo now includes a real local HTTP/SSE authority runtime for online duel on top of the existing client and persistence complexity

---

## Current Security Reality

The project still has no:

- third-party external API dependency
- auth
- cookies or sessions
- `.env`
- `axios`
- `process.env`
- `import.meta.env`

The classic public-internet attack surface is still small, but it is no longer purely local-state only:

- the frontend uses `fetch` for backend health checks and HTTP duel transport
- the repo now includes a local online-duel server entrypoint and SSE room stream

---

## Real Security Controls In Code

### 1. Strict typed app

- TypeScript strict mode is enabled
- domain contracts are strongly typed
- large shape changes usually fail at build time

### 2. Structured combat and item models

Important runtime shapes are typed:

- `CombatState`
- `CombatSnapshot`
- `CombatantState`
- `RoundAction`
- `RoundResult`
- `CombatEffect`
- `Item`

This matters because the app now includes timed combat effects, richer consumables, and more UI formatting layers.

The same typed-contract benefit now also applies to the local online-duel seam:

- `OnlineDuel`
- `OnlineDuelStateSync`
- `OnlineDuelClientMessage`
- `OnlineDuelServerMessage`

### 3. Static content plus local authority runtime

Current items, skills, combat effects, combat-rules content, and commentator phrases are internal project content.

There is still no untrusted third-party content pipeline in the real app.

### 4. No dangerous HTML rendering in active flow

There is still no evidence of `dangerouslySetInnerHTML` in the live app flow.

### 5. Save schema exists

`fight-club/src/core/storage/saveSchema.ts` still exists and defines the save payload shape.

Current limitation remains:

- read path is still not validated through Zod in `LocalStorageSaveRepository.load()`

### 6. Local backend contracts are typed too

The online-duel runtime now moves through typed local contracts across the backend slice:

- HTTP duel message schema
- SSE room-event payloads
- `revision` freshness markers
- `resumeToken` recovery
- `sessionId` ownership checks

---

## Real Weak Spots

### 1. `localStorage` remains untrusted input

File:

- `fight-club/src/core/storage/LocalStorageSaveRepository.ts`

Risks:

- user can tamper with stored state
- corrupted payload can break runtime assumptions
- no schema validation on read
- no migration layer

### 2. Runtime complexity increased

The combat runtime now includes:

- timed buffs/debuffs
- periodic heals/damage
- consumables that can apply effects
- weapon-class passive effects
- stackable active combat effects
- richer battle-log formatting

This is not a network risk, but it increases the chance of local logic regressions and bad state transitions if models drift.

The same is now true for the local online-duel backend slice:

- room lifecycle and room-code join flow
- HTTP message handling
- SSE event replay
- reconnect / disconnect state
- ready-state coordination
- authority sync between two client sessions

High-risk files:

- `fight-club/src/modules/combat/application/resolveRound.ts`
- `fight-club/src/modules/combat/model/CombatEffect.ts`
- `fight-club/src/modules/combat/config/combatWeaponPassives.ts`
- `fight-club/src/ui/components/combat/battleLogFormatting.ts`
- `fight-club/src/content/items/starterItems.ts`
- `fight-club/src/modules/arena/application/createInMemoryOnlineDuelService.ts`
- `fight-club/src/modules/arena/application/joinOnlineDuelRoom.ts`
- `fight-club/src/ui/screens/OnlineDuel/OnlineDuelScreen.tsx`

### 3. IDs are not security identifiers

File:

- `fight-club/src/core/ids/createId.ts`

Rule:

- do not use generated IDs as a trust boundary or stable secure identity

### 4. Save payload integrity is still absent

Current state:

- plain JSON in browser storage
- no signing
- no encryption
- no tamper detection

Acceptable for a local sandbox, not for competitive or multi-user trust.

---

## Threat Model

### Realistic current risks

- local save corruption
- manual client-side state editing through devtools
- combat/runtime regressions from item/effect/config changes
- UI and formatter drift from domain result contracts
- local duel-room tampering through devtools or client message abuse against the local backend

### Not applicable right now

- SQL injection
- CSRF
- JWT leakage
- session hijacking
- broken server access control
- CORS misconfiguration

Reason:

- the required subsystems do not exist

---

## Safe Development Rules

- do not add secrets to client code
- do not treat `localStorage` as trusted
- do not weaken strict typing
- do not replace typed contracts with `any`
- if persistence expands, update validation and compatibility first
- if auth, secrets, public deployment, or remote persistence appears, rewrite this file immediately

---

## Security Rewrite Triggers

This document must be revised again if the project adds:

- `.env`
- auth/session logic
- remote persistence
- account-based saves
- file upload
- public multiplayer exposure beyond the current local authority slice

---

## Current Summary

Today the security model is still relatively compact:

- local-first frontend app plus a local online-duel backend slice
- no auth or secrets handling yet
- no real account trust boundary yet
- main real risks are unsafe local persistence, authority-message misuse in the local duel service, and runtime regressions in combat/effect logic

---

> Last updated: 2026-03-20 01:00 MSK
