# Combat Design Reference

> Last updated: 2026-03-18 18:28 MSK

**Feature:** Combat Design Reference  
**Status:** IN PROGRESS

---

## Why

The combat system is one of the most important parts of Fight Club. Much of the project depends on its rules, formulas, runtime order, and user-facing behavior, so the combat design reference must be treated as critical project infrastructure.

---

## Problem

Combat knowledge is currently spread across runtime code, tests, UI behavior, and partial notes. That makes safe changes harder because the full working model is not captured in one convenient document.

---

## Root Cause

- combat rules evolved through implementation-first work across `resolveRound.ts`, orchestration, content, and UI
- the runtime already contains many coupled decisions about effects, resources, turn flow, and skill or consumable behavior
- there is no single complete reference that explains the live combat system from start to finish

---

## Solution

- create one complete combat design and rules reference based on real code
- document the full resolution pipeline and turn-order behavior
- add regression tests for high-risk rule combinations
- reduce `resolveRound.ts` risk only after the documentation and safety net are in place
- formalize a combat verification checklist for future changes

---

## Affects

- `src/modules/combat/application/resolveRound.ts`
- `src/modules/combat/config/combatConfig.ts`
- `src/modules/combat/model/*`
- `src/orchestration/combat/*`
- `src/content/items/starterItems.ts`
- `src/ui/hooks/useCombatSandbox.ts`
- `src/ui/screens/Combat/CombatSandboxScreen.tsx`
- combat rules screen content
- balance checks and playtest verification

---

## Status

`IN PROGRESS`

Current state:

The requirement is now formalized in `RULES.md` and tracked in `MASTER-PLAN.md` as a dedicated combat workstream. The live runtime draft covers combat model, resources, zones, resolution flow, exact formula coefficients, weapon passives, current test coverage, concrete turn-order examples, a combat verification checklist, bot-planner assumptions, Combat Rules screen alignment, exact sequencing notes for `resolveRound(...)`, a traceability map from runtime to tests to player-facing rules, and a regression-test target matrix.

A combat recovery track is now active with these explicit decisions:

- use `per-damage-type` mitigation as the target model
- treat `zoneArmor` plus `zoneArmorBySlot` as the source of truth for zone defense
- do not allow the bot planner to see the player's announced `opponentAttackZone`
- defer trauma or injury work until the core hit and mitigation loop is stabilized

The first live recovery slices are now landed:

- `COMBAT-011` is closed: bot planning no longer gets the player's announced attack zone from the sandbox flow
- `COMBAT-012` is active: typed mitigation now runs through `src/modules/combat/services/combatMitigation.ts`, where zone-defense scalar is distributed across damage types using the defender's armor profile plus zone-defense fallback weighting
- the live preset roster has also been sanitized so `Dagger / Crit`, `Axe / Pressure`, and `Heavy / Steel` no longer reference zero-damage starter weapons that were corrupting balance conclusions
- the remaining blunt/control presets now use sane input budgets too: `Mace / Control` no longer runs on an accidentally tiny stat allocation, and the champion bot no longer equips a zero-damage main-hand during matrix and planner-driven analysis
- the first blunt/control rescue pass is now live too: generic blunt zone defense was lowered and `Concussed Guard` was strengthened to make mace pressure stick more reliably across multi-turn fights
- the first top-tier softening pass is now live as well: sword bleed pressure was lowered from `4` to `3` per stack and `regen-potion` dropped to `2` turns of `3` healing, which reduced the sustain cluster without undoing the earlier blunt/axe repairs
- the first dagger rescue pass is now live too: the burst preset gained a little more survivability and `Vital Mark` now punishes successful crit windows harder, which improved `Dagger / Crit` from `Net -30` to `Net -20`
- `COMBAT-013` is now closed too: `Combat Rules`, combat architecture docs, and the recovery docs all describe the live `zoneArmor + zoneArmorBySlot` defense model, current zone modifiers, the `4.4` penetration divisor, the live sword, dagger, and mace passive values, and the short `regen-potion` sustain effect
- the first live skill-pack rollout also exposed a real runtime integrity bug:
  - starter skill carriers were importing zero-value item profiles through a broad inventory barrel
  - that circular path corrupted combat snapshots with `NaN`
  - zone audits then mislabeled sword attacks as `blunt`, and the matrix drifted into false draw-heavy combat
  - the carrier layer now imports those zero profiles directly from the item model, and a regression test protects the equipment path

---

## Next Step

Run the next combat sequence in this order:

1. `COMBAT-016` - audit live skill-kit usage on the repaired baseline:
   - planner rhythm
   - cooldown cadence
   - setup -> payoff conversion
2. `COMBAT-010` - refresh matrix and zone-audit interpretation only after that usage audit
3. `COMBAT-003` - expand regression coverage around the corrected combat and content pipeline
4. `COMBAT-004` - split `resolveRound.ts` only after the repaired truth model is covered
5. `COMBAT-014` - add trauma hooks once the core loop and first skill layer are both stable

Current audit read:

- the new `combat:audit-skills` report is now live under `docs/balance/latest-skill-audit.md`
- the first pass shows that the next combat problem is not hidden formula drift:
  - planners currently choose a skill on `100%` of affordable turns
  - most kits are overusing setup buttons and starving payoff buttons
  - state-bonus conversion is near-zero for several archetypes

So the next combat sequence should target skill-usage behavior first:

1. preserve or reward payoff windows in planner scoring
2. review whether setup skills are too cheap relative to payoff skills
3. verify that cooldown cadence does not lock kits into setup-only loops
4. only then apply another coefficient or archetype balance pass

Latest correction to that read:

- a targeted planner pass for "hold resources for payoff" was implemented and validated by test
- the live roster barely changed afterward, which narrows the diagnosis further:
  - for the real preset packs, the bigger issue is not only planner greed
  - the bigger issue is that several payoff buttons are economically late for their archetypes
- the next planner slice is now in too:
  - payoff candidate selection now prioritizes affordable payoff skills when their required state is already active
  - payoff scoring now counts live `stateBonuses` instead of evaluating those skills like generic attacks
  - a tagged-target regression test now protects that behavior

Current strongest hypothesis:

- `Exposed`-based kits care about both window length and resource cadence, while `Staggered`-based control kits are already closer to healthy
- future work should therefore keep planner rewrites narrow and inspect payoff access per archetype instead of reopening the whole skill model

Current validation status:

- a first narrow economy pass already confirmed that hypothesis is useful:
  - `Crushing Blow` usage rose sharply once its resource and cost were aligned with the control loop
  - `Mace / Control` improved meaningfully in the matrix afterward
- a second narrow pass is now live too:
  - `Exposed` duration increased from `2` to `3`
  - `Execution Arc` cost dropped from `18` to `16`
  - `Heartseeker` cost dropped from `20` to `16`
- that changed the live audit materially:
  - `Execution Arc` now fires `40` times instead of `0`
  - `Sword / Bleed` now behaves like a real setup -> payoff kit
  - `Heartseeker` is still rare, but it now at least shows a real state-bonus trigger

So the next combat follow-up is now narrower still:

1. inspect why `Dagger / Crit` still starves payoff access after the longer `Exposed` window
2. confirm whether burst rage cadence or setup-spend behavior is still the limiting factor
3. keep broader planner rewrites paused unless the new data proves they are needed

Latest dagger follow-up:

- that narrower check is now resolved enough to move the baseline forward:
  - `Execution Mark` was not only opening `Exposed`
  - it was also spending the same `rage` resource that `Heartseeker` needed, while the fight still started from zero resources
  - in practice that meant the burst kit could create the payoff window and then immediately fail to cash it in
- the fix stayed narrow and identity-aligned:
  - `Execution Mark` now also applies a short self-buff, `Killing Window`
  - `Killing Window` grants `+16 rage` at the start of the next turn
  - that keeps the setup turn readable while explicitly handing the burst kit into its intended finisher turn
- validation after the fix:
  - targeted combat and planner tests passed
  - build passed
  - `combat:audit-skills` now shows `Heartseeker` usage rising from `2` to `74`
  - `Dagger / Crit` improved from `38-102` to `48-92`
  - dagger state-bonus triggers rose to `67`, which means the kit now behaves like a real setup -> payoff loop instead of a mostly one-button setup lane

## Combat Economy Truth

The next stable combat baseline should treat resource flow as first-class design truth, not only as content metadata.

Current runtime facts:

- every combatant starts at `0` for all combat resources
- the live combat resources are:
  - `rage`
  - `guard`
  - `momentum`
  - `focus`
- resources are gained from runtime events before any archetype-specific effects are considered:
  - defender gains `focus` on dodge
  - defender gains `guard` on block
  - attacker gains `momentum` on penetration
  - attacker gains `momentum` on clean hit
  - attacker gains `rage` on crit
- active effects may also add or remove resources at turn start through `periodic.resourceDelta`

Design implication:

- the combat economy is already event-driven
- this means archetype identity should be built around "how a kit naturally earns its next meaningful turn"
- a kit is healthy when its setup, payoff, and defensive tools align with the events it can realistically trigger

Current role-to-resource map from live rules:

- `rage`
  - strongest natural home for burst or crit lanes
  - also directly increases crit chance and crit multiplier through the core formulas
  - therefore `rage` should usually support explosive payoff windows, not generic utility spam
- `guard`
  - strongest natural home for defensive, control, or counter lanes
  - naturally enters the system when the fighter successfully blocks
  - therefore `guard` skills should convert defense quality into stability, disruption, or punish windows
- `momentum`
  - strongest natural home for pressure and tempo lanes
  - naturally enters the system on clean hits and penetrations
  - therefore `momentum` should usually reward continuing initiative and repeated successful exchanges
- `focus`
  - strongest natural home for evasive, scouting, or precision-reactive lanes
  - naturally enters the system on dodge
  - therefore `focus` should not be the default cost for core payoff buttons unless the kit really lives on evasion timing

Current systemic rule for future combat changes:

- do not assign a resource to a skill only because the number looks convenient
- assign a resource based on the event loop that archetype is supposed to live on
- if setup and payoff both consume the same zero-start resource, the kit must either:
  - earn that resource naturally fast enough
  - start with a different cadence expectation
  - or include an explicit handoff mechanic like a short resource-priming buff

## Combat Intent V1

The sandbox now supports a one-turn `Combat Intent` layer on top of the explicit round draft.

Current intents:

- `Neutral` - no directional modifier
- `Aggressive` - better offense, weaker defense
- `Guarded` - better defense, weaker offense
- `Precise` - lighter raw force, stronger payoff and execution shaping

Intent rules:

- intent is selected per round
- intent lives on the explicit `RoundAction`
- intent affects only the current turn and then disappears
- intent is shared by both player and bot actions

Current v1 usage:

- `Aggressive` boosts outgoing damage and crit pressure, but weakens dodge and guard quality
- `Guarded` improves dodge and guard quality while reducing outgoing force
- `Precise` slightly lowers raw damage, suppresses dodge, and amplifies state-bonus conversion

This is intentionally a thin mechanic layer, not a permanent stance system.

This is now the preferred order for combat-economy work:

1. identify the event loop a role is meant to farm
2. align setup and payoff skills to that loop
3. verify the loop under zero-start combat conditions
4. only then retune costs, rewards, or planner scoring

## Role Loop Matrix

This matrix should now be treated as the preferred combat-design scaffold for future skill packs and archetype work.

### Burst

- native resource loop: `rage`
- native event source: crits, burst handoff effects, short payoff windows
- allowed shape:
  - setup creates a brief kill window
  - payoff lands one turn later or inside the same short burst sequence
  - utility should stay light and serve the finisher
- anti-patterns:
  - setup and payoff both consume the same zero-start resource with no handoff
  - burst kit depends on long defensive farming before becoming functional
  - payoff is priced like a late-fight button in a short-window archetype

### Pressure

- native resource loop: `momentum`
- native event source: clean hits, penetration, repeated initiative wins
- allowed shape:
  - setup can be light and frequent
  - payoff can be moderate but should keep pressure rolling instead of fully resetting the loop
  - pressure should feel like compound advantage across exchanges
- anti-patterns:
  - pressure loses all access if one setup turn fails
  - pressure buttons are too expensive for a resource earned only by already-winning turns
  - the kit pauses too often and starts reading like burst instead of pressure

### Control

- native resource loop: `guard`
- native event source: blocks, defensive stability, guard-quality disruption, controlled exchanges
- allowed shape:
  - setup weakens enemy defense quality or tempo
  - payoff converts that instability into a punish or lock on the next exchange
  - control may share some counter identity, but should still produce measurable disruption
- anti-patterns:
  - control pays with a resource it does not naturally farm
  - control only deals damage and does not alter enemy rhythm or defense quality
  - control payoff is balanced like burst while its loop is slower and more defensive

### Defense

- native resource loop: `guard`
- native event source: blocks, braces, stability buffs, safe exchanges
- allowed shape:
  - defense should survive spikes first
  - then convert safety into counter-pressure, guard advantage, or enemy overextension punish
  - defensive tools should not become dead turns unless they buy a real future edge
- anti-patterns:
  - defense spends resources only to not lose ground
  - defensive turns never hand into counter-pressure
  - defense creates stalls with no credible win condition

### Sustain

- native resource loop: usually `momentum` or `guard`, depending on whether the lane is proactive or reactive
- native event source: continued exchange survival, light pressure upkeep, safe healing windows
- allowed shape:
  - sustain should reward lasting one more exchange than the opponent
  - sustain tools may lower risk, recover hp, or extend a soft advantage
  - sustain must still move the fight toward a winner
- anti-patterns:
  - sustain creates draw-heavy dead fights
  - sustain has no pressure companion and only delays defeat
  - sustain is priced as if it were free despite already extending time-to-kill

### Precision Or Evasion

- native resource loop: `focus`
- native event source: dodge, read-based defense, reactive timing
- allowed shape:
  - focus skills should reward successful avoidance, reads, or precision follow-up
  - payoff can be high quality, but it should feel earned through evasive play
  - this lane works best when it remains reactive or tactical, not generic
- anti-patterns:
  - `focus` becomes a default generic cost for unrelated archetypes
  - core payoff access depends on dodge in kits that are not built to evade
  - focus is used as a balance patch instead of a real identity loop

---

## Task Breakdown

- `COMBAT-001` - create the complete combat design and rules reference
- `COMBAT-002` - document the exact combat resolution pipeline and turn order
- `COMBAT-003` - add composition regression tests for rule combinations
- `COMBAT-004` - safely reduce `resolveRound.ts` risk without changing behavior
- `COMBAT-005` - formalize the combat change checklist and verification flow
- `COMBAT-011` - remove unfair bot defense omniscience and stabilize planning fairness
- `COMBAT-012` - convert mitigation truth model to per-damage-type resolution
- `COMBAT-013` - unify zone-defense truth across runtime, docs, and rules screen
- `COMBAT-015` - formalize production skill architecture and role taxonomy
- `COMBAT-016` - equip curated presets with first production skill packs
- `COMBAT-014` - add trauma hooks after core combat stabilization

---

> Last updated: 2026-03-18 18:28 MSK
