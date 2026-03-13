# SECURITY_ARCHITECTURE - Fight Club

> Last updated: 2026-03-13 02:00 MSK

**Status:** browser-only SPA  
**Risk level:** low to medium  
**Reason:** still no backend/auth/secrets surface, but runtime complexity and local persistence have grown

---

## Current Security Reality

The project still has no:

- backend
- external API calls
- auth
- cookies or sessions
- `.env`
- `fetch`
- `axios`
- `process.env`
- `import.meta.env`

That means the classic network attack surface is still very small.

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

### 3. Static content only

Current items, skills, combat effects, combat-rules content, and commentator phrases are internal project content.

There is still no untrusted remote content pipeline in the real app.

### 4. No dangerous HTML rendering in active flow

There is still no evidence of `dangerouslySetInnerHTML` in the live app flow.

### 5. Save schema exists

`fight-club/src/core/storage/saveSchema.ts` still exists and defines the save payload shape.

Current limitation remains:

- read path is still not validated through Zod in `LocalStorageSaveRepository.load()`

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

High-risk files:

- `fight-club/src/modules/combat/application/resolveRound.ts`
- `fight-club/src/modules/combat/model/CombatEffect.ts`
- `fight-club/src/modules/combat/config/combatWeaponPassives.ts`
- `fight-club/src/ui/components/combat/battleLogFormatting.ts`
- `fight-club/src/content/items/starterItems.ts`

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
- if network/auth/backend appears, rewrite this file immediately

---

## Security Rewrite Triggers

This document must be revised again if the project adds:

- `fetch` or any API client
- `.env`
- auth/session logic
- remote persistence
- account-based saves
- file upload
- multiplayer

---

## Current Summary

Today the security model is still simple:

- local-only browser app
- no backend trust boundary
- no secrets handling
- main real risk is unsafe local persistence plus local runtime regressions in combat/effect logic

---

> Last updated: 2026-03-13 02:00 MSK
