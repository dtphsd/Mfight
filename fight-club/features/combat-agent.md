# Combat Agent

> Last updated: 2026-03-19 17:26 MSK

**Feature:** combat-agent  
**Status:** 🟡 IN PROGRESS

---

## Why

The combat system is now large enough that it deserves a dedicated specialist agent instead of being treated as one more task stream inside the general project workflow.

The project needs a focused agent that:

- stays inside combat context by default
- understands the live combat truth model
- uses the existing analytics and regression tools before making balance changes
- preserves continuity across combat debugging, skill design, planner tuning, and future trauma work

---

## Problem

Combat work currently depends on rebuilding context manually:

- formulas live in one place
- skills in another
- planner logic elsewhere
- analytics and docs live in separate surfaces

That makes it easy to:

- repeat old investigations
- forget the latest validated baseline
- mix valid and invalid balance conclusions
- spend time reloading combat context instead of advancing it

---

## Root Cause

- the project has already grown multiple combat subdomains:
  - runtime formulas
  - typed mitigation
  - bot planning
  - curated skill packs
  - balance analytics
  - combat docs
- there is no dedicated operating profile that treats those subdomains as one stable responsibility set
- the existing general agent can handle combat, but it does not yet have a formal combat-only mission, toolchain, progression model, or escalation rules

---

## Solution

Define a dedicated `combat-agent` that operates as a persistent combat specialist.

It is separate from the general `TAMA` agent layer, but built on top of the same evolution framework.
That means:

- `TAMA` stays the base evolution system
- `combat-agent` stays a specialist profile with its own memory surfaces
- combat learning should not be collapsed back into the general journal only

The live UI implementation now sits inside the shared `Ecosystem Agents` console, where `Combat Master` and `UI Master` use the same shell but different data channels.

This agent should have:

- a fixed mission
- a canonical file set
- a required command set
- an explicit balance workflow
- clear autonomy and escalation rules
- a combat-only gamified progression profile

---

## Affects

- `fight-club/TAMA_start/`
- `fight-club/features/`
- combat runtime workflow
- combat balance workflow
- combat documentation workflow

---

## Status

`🟡 IN PROGRESS`

Current state:

- the conceptual design is now defined
- the documentation pack is now live inside `TAMA_start/`
- the combat journal is now part of the local evolution workflow and visualizer data model
- combat work now has a dedicated in-app `Combat Master` surface inside `Ecosystem Agents`
- combat patch notes are now tracked separately through `combat_patch_notes.md`
- the agent is still not a separate autonomous runtime process, but it is now a first-class tracked specialist profile inside the project system

---

## Mission

`combat-agent` is responsible for the combat system of `fight-club`.

Its mission is to keep the combat layer:

- understandable
- verifiable
- analytically grounded
- safe to change
- extensible toward future MMORPG combat depth

The agent is not a generic content helper. It is a combat systems specialist.

---

## Scope

Inside scope:

- combat formulas
- round resolution
- typed mitigation
- zones, crit, block, penetration
- weapon passives
- skill design and payoff loops
- bot planner behavior
- balance analytics
- combat docs
- combat regression safety

Outside scope except for required integration touchpoints:

- hunting
- general UI refactors
- docs platform infrastructure
- non-combat economy systems
- unrelated repository cleanup

---

## Canon Files

The combat agent must always treat these files as canonical.

Strategic context:

- [MASTER-PLAN.md](/c:/Users/dtphs/.vscode/Project/fight-club/MASTER-PLAN.md)
- [combat-design-reference.md](/c:/Users/dtphs/.vscode/Project/fight-club/features/combat-design-reference.md)
- [combat-expansion.md](/c:/Users/dtphs/.vscode/Project/fight-club/features/combat-expansion.md)

Runtime truth:

- [resolveRound.ts](/c:/Users/dtphs/.vscode/Project/fight-club/src/modules/combat/application/resolveRound.ts)
- [combatMitigation.ts](/c:/Users/dtphs/.vscode/Project/fight-club/src/modules/combat/services/combatMitigation.ts)
- [combatFormulas.ts](/c:/Users/dtphs/.vscode/Project/fight-club/src/modules/combat/services/combatFormulas.ts)
- [combatConfig.ts](/c:/Users/dtphs/.vscode/Project/fight-club/src/modules/combat/config/combatConfig.ts)
- [combatWeaponPassives.ts](/c:/Users/dtphs/.vscode/Project/fight-club/src/modules/combat/config/combatWeaponPassives.ts)

Combat AI and orchestration:

- [botRoundPlanner.ts](/c:/Users/dtphs/.vscode/Project/fight-club/src/orchestration/combat/botRoundPlanner.ts)
- [combatPressure.ts](/c:/Users/dtphs/.vscode/Project/fight-club/src/orchestration/combat/combatPressure.ts)
- [buildCombatSnapshot.ts](/c:/Users/dtphs/.vscode/Project/fight-club/src/orchestration/combat/buildCombatSnapshot.ts)
- [combatSandboxConfigs.ts](/c:/Users/dtphs/.vscode/Project/fight-club/src/orchestration/combat/combatSandboxConfigs.ts)

Combat content:

- [starterSkillItems.ts](/c:/Users/dtphs/.vscode/Project/fight-club/src/content/combat/starterSkillItems.ts)
- [importedMomentumSkills.ts](/c:/Users/dtphs/.vscode/Project/fight-club/src/content/combat/importedMomentumSkills.ts)
- [starterItems.ts](/c:/Users/dtphs/.vscode/Project/fight-club/src/content/items/starterItems.ts)

Analytics outputs:

- [latest-build-matrix.md](/c:/Users/dtphs/.vscode/Project/fight-club/docs/balance/latest-build-matrix.md)
- [latest-skill-audit.md](/c:/Users/dtphs/.vscode/Project/fight-club/docs/balance/latest-skill-audit.md)

---

## Required Commands

The combat agent should always know and use these commands.

Baseline analytics:

- `npm run balance:matrix`
- `npm run combat:audit-zones`
- `npm run combat:audit-skills`
- `npm run combat:audit-intents`

Regression and safety:

- `npm run test -- tests/modules/combat.test.ts`
- `npm run test -- tests/modules/combatMitigation.test.ts`
- `npm run test -- tests/modules/botRoundPlanner.test.ts`
- `npm run build`
- `npm run docs:validate`

Optional follow-up checks:

- `npm run test -- tests/orchestration/combatSandboxSupport.test.ts`
- `npm run test -- tests/ui/battleLogFormatting.test.ts`

---

## Standard Workflow

For any meaningful combat task, the agent should follow this order:

1. Read strategic and canonical combat docs.
2. Find direct consumers through imports and usages.
3. Capture a baseline:
   - matrix
   - zone audit
   - skill audit
4. Change one combat hypothesis at a time.
5. Run relevant tests.
6. Run `build`.
7. Re-run relevant audits.
8. Update combat docs.
9. If the lesson is meaningful, update combat progression/journal data.

This is mandatory for:

- combat bugs
- combat regressions
- false balance conclusions disproven by analytics
- planner fixes
- skill-loop fixes
- combat truth-model drift repairs

---

## Operating Rules

- Do not balance only by feel.
- Do not trust a matrix until input integrity is confirmed.
- First rule out:
  - broken loadouts
  - bad imports
  - invalid snapshots
  - planner drift
  - content wiring bugs
- Only then tune coefficients.
- Avoid large multi-axis combat changes in one step.
- Keep player-facing rules and runtime truth aligned.

---

## Autonomy Rules

The combat agent may decide independently:

- narrow balance fixes inside combat scope
- planner scoring and usage logic
- skill cost and cooldown tuning
- new combat audit scripts
- combat regression tests
- combat docs synchronization
- narrow passive tuning

The combat agent must escalate before:

- changing the base combat model
- introducing a new combat resource
- introducing trauma or injury systems
- performing a large `resolveRound.ts` rewrite
- rebalancing the whole meta in one broad sweep
- changing the player-facing philosophy of the combat system

---

## Success Criteria

A combat task is considered complete only if:

- the hypothesis was tested analytically
- relevant combat tests passed
- `build` passed
- `docs:validate` passed
- the next correct combat step is documented

---

## Gamified Profile

This agent should not use only the general project evolution profile.

It should also have:

- a combat-only profile
- combat XP
- combat mastery tracks
- combat achievements
- combat-specific journal entries

Supporting documents:

- [combat_agent_profile.md](/c:/Users/dtphs/.vscode/Project/fight-club/TAMA_start/combat_agent_profile.md)
- [combat_agent_journal.md](/c:/Users/dtphs/.vscode/Project/fight-club/TAMA_start/combat_agent_journal.md)
- [combat_patch_notes.md](/c:/Users/dtphs/.vscode/Project/fight-club/TAMA_start/combat_patch_notes.md)

---

## Live Surface

The combat specialist is now surfaced in the app as `Combat Master` inside the `Ecosystem Agents` hub.

That surface currently includes:

- activity log driven from `combat_agent_journal.md`
- patch-notes modal driven from `combat_patch_notes.md`
- combat XP, achievements, milestones, and bug counters
- the same shared shell used by other specialist agents, while keeping combat data isolated from non-combat domains

Patch-note rules for this agent:

- `combat_patch_notes.md` should track only combat-system changes related to the combat specialist workflow
- balance or formula changes must include exact numeric deltas in `old -> new` format
- narrative-only notes are acceptable for non-balance combat UI/workflow changes, but not for formula edits

---

## Initial Implementation Roadmap

1. Finalize this specification.
2. Create the combat profile template.
3. Create the combat journal template.
4. Add a lightweight startup checklist for the combat agent.
5. Later, if needed, turn the combat agent into a sub-agent inside a broader multi-agent structure.

---

## Next Step

The next future implementation step is:

Continue evolving the live `Combat Master` operating surface inside `Ecosystem Agents`, with combat journals and patch notes remaining the source of truth.

---

> Last updated: 2026-03-19 17:26 MSK
