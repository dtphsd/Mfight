# Combat Expansion

> Last updated: 2026-03-18 18:28 MSK

**Feature:** Combat Expansion  
**Status:** IN PROGRESS

---

## Why

The combat system is stable enough to support deeper gameplay variety. The next growth step is not only safety and documentation, but also richer player decisions, stronger archetype identity, and more varied fights.

---

## Problem

The current combat loop is readable and functional, but it can become repetitive because many turns still collapse into straightforward damage trading plus a small set of effects and resource thresholds.

---

## Root Cause

- the runtime already has a good core pipeline, but the state space is still relatively narrow
- skills are useful, but many of them do not yet create strong setup/payoff patterns
- archetypes have direction, but they need more distinct combat states and synergies to feel truly different in play

---

## Solution

- introduce a small set of readable new combat states
- design more interesting skills around setup, payoff, control, defense, and tempo
- deepen archetype identity through state synergy rather than raw stat inflation
- expand tests and docs together with runtime changes so new combat depth stays understandable and safe

---

## Affects

- `src/modules/combat/application/resolveRound.ts`
- `src/modules/combat/model/CombatEffect.ts`
- `src/modules/combat/config/combatWeaponPassives.ts`
- `src/content/items/starterItems.ts`
- `src/orchestration/combat/combatSandboxConfigs.ts`
- `src/ui/screens/CombatRules/`
- `fight-club/docs/architecture/combat/`
- combat regression tests and balance verification

---

## Status

`IN PROGRESS`

Current live baseline has moved beyond the old handcrafted training sandbox:

- the legacy `training-*` item pool is no longer active in combat flow
- the sandbox now runs on generated `BazaBK` starter items
- the combat runtime now uses zone-based armor, random damage and armor ranges, and roll-based block reduction
- cooldown metadata is now supported by the live skill model and combatant runtime state
- `Combat Rules` content has been rebuilt in UTF-8 and re-synced with the current formulas

Planned focus:

- add a first wave of new readable combat states such as `Exposed` and `Staggered`
- build more varied skills around setup/payoff and archetype identity
- keep combat clarity high by updating docs, rules text, and tests alongside runtime changes

Current slice:

- `COMBAT-006` is now defining the first production-safe expansion layer around a small number of readable combat states
- the first wave is intentionally narrow so we deepen combat decisions without turning the rules into noise
- runtime now supports state-aware skill bonuses keyed off target active effects
- the first live state-aware skill set is anchored by:
  - `Opening Sense` -> applies `Exposed`
  - `Armor Crush` -> applies `Staggered`
  - `Execution Arc` -> gains payoff against `Exposed`
  - `Crushing Blow` -> gains payoff against `Staggered`
- the next live extension now spreads those same states across adjacent kits:
  - `Open Flank` -> applies `Exposed` through axe pressure
  - `Hook Chop` -> gains payoff against `Exposed`
  - `Shield Bash` -> now also applies the shared `Staggered` state while preserving resource drain pressure
- `COMBAT-007` is now active through a second-wave payoff slice:
  - `Body Check` now cashes in on `Staggered`
  - `Killer Focus` now cashes in on `Exposed`
- `COMBAT-008` is now active through a Warden counter slice:
  - `Parry Riposte` now punishes `Staggered` targets much harder
  - `Iron Brace` now also cashes in on `Staggered`, turning guard gear into a cleaner counter-pressure kit
- `COMBAT-008` now also deepens Duelist / Executioner identity:
  - `Execution Mark` now creates `Exposed` as a rage-based finisher setup
  - `Heartseeker` now cashes in on `Exposed` as a precision payoff strike
- `COMBAT-009` has now started: the generated `Combat Rules` layer explains named states and the live setup -> payoff loops directly in the player-facing rules screen
- architecture-side verification docs now also call out the named-state sync points and the actor-turn expiry nuance for short rider effects
- the main English `Combat Rules` copy now also explains setup -> payoff windows directly in the section text instead of relying only on generated fact cards
- `COMBAT-009` is now complete for the first-wave state layer: runtime, rules screen, and verification docs are back in sync
- the curated build browser has now gone through a compact one-page UI pass with avatar previews, archetype color zoning, and denser preset inspection
- combat impact feedback has also been hardened so text and block / crit / block-break overlays are emitted as one-shot pulses and do not reappear after fading out
- penetration now has its own dedicated `PIERCE` impact treatment instead of borrowing another feedback lane
- the combat recovery track also changed the baseline under skills:
  - mitigation is now explicitly `per-damage-type`
  - defended zones now document `zoneArmor + zoneArmorBySlot` as the truth model
  - bot omniscience was removed from the sandbox planner
  - the next meaningful skill work should build on this stabilized core instead of continuing early preset-only balance loops
- `COMBAT-015` has now started with the first production-safe metadata slice:
  - `CombatSkill` now supports explicit role metadata
  - skills can now carry preferred zone hints
  - skills can now carry soft AI usage hints
  - builder and item UI now surface those hints
  - bot planning now treats that metadata as soft scoring guidance instead of hard scripting
- `COMBAT-016` has now started too:
  - a hand-written starter skill layer now sits on top of the generated starter item pool
  - curated accessory skill carriers now inject real first-wave combat kits into the seven sandbox presets
  - presets no longer ship with empty `skillLoadout` arrays
  - sustain uses the imported momentum manual, while the other archetypes now get compact setup/payoff pairs aligned to their intended style
  - the first rollout also exposed a real content/runtime integration bug:
    - starter skill carriers were importing zero-value item profiles through a broad inventory barrel
    - that circular path corrupted combat snapshots with `NaN`
    - audits then misreported sword attacks as `blunt`, and matrix output drifted into fake draw-heavy combat
  - that bug is now fixed, so post-skill analytics are trustworthy again

---

## Skills Foundation Decision

The next expansion priority is now `skills`, not another isolated preset-balance pass.

Reason:

- the sandbox already supports active skills, cooldowns, effects, and named-state payoff windows
- but most curated presets still run with empty `skillLoadout` arrays, so combat feel is still too close to basic-hit trading
- future MMORPG combat depth will come more from build identity, unlock paths, counterplay, and tactical buttons than from endlessly tuning seven temporary presets against each other

This means the project should now treat combat skills as the main bridge between:

- base combat math
- itemization
- archetype identity
- future progression and unlock systems
- future trauma or injury hooks

---

## Skills Goals

The production goal for skills is:

- make turns feel different from one another
- create readable setup, payoff, counter, sustain, and tempo windows
- keep player-facing rules understandable without hidden exceptions
- let itemization and later MMO progression deepen the combat loop without replacing the core combat model

What skills should not become:

- a pile of flat damage buttons with slightly different costs
- a hidden scripting layer the player cannot read from the UI
- a second combat engine disconnected from the base `skill_attack` path

---

## Current Runtime Strengths

The live runtime already gives us useful foundations:

- `CombatSkill` supports cost, cooldown, damage multiplier, crit bonus, penetration bonus, active effects, and state-aware bonuses
- `resolveRound(...)` already resolves `skill_attack` through the same main combat pipeline
- active effects already support setup states like `Exposed` and `Staggered`
- UI already supports a 5-slot skill loadout and cooldown display
- docs and rules screen already explain named-state windows

These are strong enough to ship a real first skill layer without inventing a totally new engine.

## Combat Intent Track

The first new combat-variety layer now starts with `Combat Intent`, not another class-only balance loop.

Why this layer matters:

- it gives each round a directional choice without adding permanent stance complexity
- it creates expressive tradeoffs before adding more archetype-only tuning
- it increases decision density while preserving the existing combat truth model

Current v1 target:

- `Neutral`
- `Aggressive`
- `Guarded`
- `Precise`

This should be treated as the first reusable combat-expression mechanic before reactive windows are introduced.

---

## Current Gaps

The model is still missing several pieces that will matter for a real MMORPG-facing skill layer:

- no explicit skill role metadata such as `setup`, `payoff`, `counter`, `tempo`, `sustain`, or `control`
- no AI-facing metadata to help the bot understand when a skill is worth using
- no zone preference or targeting hint metadata for skills that conceptually want high-line or low-line pressure
- no progression-aware unlock plan beyond optional metadata fields
- no formal skill-pack baseline per archetype, because most presets still ship with no equipped skills
- no trauma hook surface yet for future injury-linked skills

Because of these gaps, the next skill pass should start with structure and curation, not with a giant content dump.

---

## Skills Architecture Plan

### Phase 1 - Foundation

- define the canonical skill roles:
  - `setup`
  - `payoff`
  - `counter`
  - `tempo`
  - `sustain`
  - `control`
- extend the skill model only where it creates real clarity:
  - role metadata
  - optional zone preference hints
  - optional AI usage hints
- keep all skills on the existing `skill_attack` runtime path

### Phase 2 - Curated First Packs

Each archetype should get a compact and readable first pack, not a huge library.

Recommended minimum pack shape:

- 1 setup skill
- 1 payoff skill
- 1 defensive or counter skill
- 1 tempo or sustain skill

This should be enough to make a preset feel like an archetype instead of a stat block.

### Phase 3 - Preset Integration

- equip real skill loadouts on the curated presets
- tune the packs around identity first, not mirror-balance
- verify that each preset now has at least one recognizable turn pattern instead of pure basic-attack flow

### Phase 4 - Verification

- add targeted tests around cooldown, cost thresholds, state windows, and payoff interactions
- add playtest checks that confirm the bot can use skill-equipped builds coherently
- refresh rules-screen facts and architecture docs after each skill wave

### Phase 5 - Future Hooks

Once skills are stable, they become the right place to attach:

- progression unlocks
- richer item identity
- trauma-aware finishers or anti-injury tools
- broader MMO combat kits

---

## First Production Skill Packs

The first real skill wave should stay intentionally small.

Recommended packs:

### Duelist / Precision

- opener that creates `Exposed`
- payoff strike that spikes against `Exposed`
- light defensive read or riposte button
- tempo button that helps keep initiative or focus pressure

### Breaker / Control

- setup strike that creates `Staggered`
- payoff strike that breaks through weakened defense
- anti-guard tool
- sustain or tempo button that keeps pressure live for one more exchange

### Warden / Guard

- defensive counter skill
- punish button that cashes in on `Staggered`
- guard recovery or brace tool
- measured setup tool that does not overlap too much with Breaker fantasy

### Executioner / Finisher

- setup or mark skill
- heavy payoff hit against `Exposed`
- rage-tempo tool
- survival button that helps the finisher survive long enough to cash in

---

## Guardrails

- do not add a huge generic skill pool before curated packs exist
- do not rebalance the entire combat meta around empty-skill presets anymore
- do not create skills that bypass the main combat pipeline
- do not add trauma-linked skills before the trauma model exists
- do not add complex scouting or reveal mechanics until the UI can surface them clearly

---

## First Expansion Slice

The first slice should introduce only two new named combat states into live gameplay:

- `Exposed`
- `Staggered`

Reason:

- both are easy to understand from player perspective
- both fit the current combat math and effect system without needing a new engine
- together they create setup/payoff, pressure, anti-guard, and finisher windows across multiple archetypes

---

## State Design Draft

### `Exposed`

Purpose:

- creates a clean payoff window for precision and finisher skills
- rewards setup instead of only raw burst

Planned gameplay meaning:

- target becomes more vulnerable to follow-up damage
- best used by Duelist and Executioner style builds

Recommended runtime shape:

- `kind`: debuff
- `target`: target
- `trigger`: mostly `on_hit`
- `duration`: 2 turns
- `max stacks`: 2

Recommended first implementation behavior:

- `+8% incomingDamagePercent` per stack
- no direct periodic damage
- keep it readable and generic in the first version instead of making it zone-specific immediately

Design notes:

- this should be a setup state, not just hidden bonus damage
- it should be visible in battle log and `Combat Rules`
- it should synergize with finisher skills, crit windows, and aggressive combo turns

### `Staggered`

Purpose:

- creates disruption and anti-guard play
- gives blunt / breaker-style tools a clearer combat identity

Planned gameplay meaning:

- target is temporarily worse at defending or stabilizing
- best used by Breaker and some Warden counter-tools

Recommended runtime shape:

- `kind`: debuff
- `target`: target
- `trigger`: mostly `on_hit`
- `duration`: 2 turns
- `max stacks`: 2

Recommended first implementation behavior:

- `-6 blockPower` per stack
- `-4 dodgeChanceBonus` per stack
- no periodic damage

Design notes:

- this should create "guard break" feeling without hard stun
- avoid skipping turns or hard crowd control in the first wave
- it should make the next enemy turn meaningfully less safe, but still readable

---

## Archetype Intent

### Duelist

- uses `Exposed` to create precision-finisher windows
- wants clean follow-up hits, crit timing, and targeted pressure

### Executioner

- uses `Exposed` as an execution setup state
- wants stronger payoff against low-HP or already softened targets

### Breaker

- uses `Staggered` to disrupt block and defense structure
- wants to open targets for heavier blunt or chop follow-ups

### Warden

- should not own the same setup patterns as Duelist or Breaker
- can optionally gain one counter-oriented interaction later, but is not the priority in slice one

---

## First Skill Direction Draft

The first skill wave should follow these patterns:

- one `Exposed` setup skill
- one `Staggered` setup skill
- one payoff skill that explicitly benefits from `Exposed`
- one pressure skill that becomes safer or stronger against `Staggered`

Recommended shape:

1. Duelist precision opener
   - moderate damage
   - applies `Exposed`
2. Breaker shock strike
   - lower raw damage
   - applies `Staggered`
3. Executioner finisher
   - higher multiplier or crit payoff if target is `Exposed`
4. Breaker follow-through
   - better penetration or block bypass if target is `Staggered`

---

## Guardrails For Implementation

- no hard stun or action denial in the first wave
- no more than two new named states in the first slice
- do not add hidden conditional rules that the player cannot read
- every new state must be visible in log, UI, and docs
- every new skill should belong clearly to an archetype fantasy

---

## Suggested Build Order

1. finalize `Exposed` and `Staggered` numeric rules
2. implement the two new states through current `CombatEffect` infrastructure
3. add the first 4 state-aware skills
4. widen the same states across more weapon families before inventing new named states
5. update `Combat Rules` and combat docs
6. add targeted tests and balance checks

---

## Next Step

The next execution pivot is now:

1. keep the first production skill packs live and stable
2. audit planner rhythm, cooldown cadence, and setup/payoff conversion on the repaired post-skill baseline
3. add verification for cooldowns, setup/payoff windows, and bot coherence
4. defer trauma-linked skill ideas until the injury model exists

That means the next gameplay adjustments should be usage-informed rather than purely additive or purely numeric.

---

## Current Balance Snapshot

Latest matrix source:

- `docs/balance/latest-build-matrix.md`

Observed read from the repaired post-skill snapshot:

- the earlier draw-heavy matrix was invalid
  - it was caused by a real skill-carrier integration bug, not by a subtle balance issue
  - starter skill carriers were poisoning combat snapshots with `NaN`, which pushed attacks into fallback damage typing and distorted both audit and matrix output
- after the fix, combat pace is fast again
  - most matchups now resolve in roughly `5-8` rounds instead of drifting toward `40`
- the current honest matrix is highly polar, not stalled
  - `Sword / Bleed` and `Axe / Pressure` are the new visible top cluster
  - `Sustain / Armor` is still strong
  - `Mace / Control` is the clearest weak outlier

Current working read:

- the next problem is no longer fake stall
- the next problem is whether the new skill kits are being used coherently enough to create readable setup -> payoff loops
- before more balance levers move, the project should verify:
  - how often planners choose setup skills versus payoff skills
  - whether cooldowns and costs delay payoff windows too much
  - whether weaker kits are losing because of numbers or because they fail to convert state windows into damage

Latest skill-usage audit:

- `docs/balance/latest-skill-audit.md` is now the live reference for post-fix skill behavior
- the first read is very clear:
  - every preset currently picks a skill on `100%` of turns where at least one skill is affordable
  - setup skills dominate most kits:
    - `Opening Sense` used `41` times while `Execution Arc` used `0`
    - `Execution Mark` used `119` times while `Heartseeker` used `3`
    - `Body Check` used `2` times while `Killer Focus` used `10`, but heavy only reached `13` total affordable skill turns
    - `Armor Crush` used `184` times while `Crushing Blow` used `8`
  - state-bonus conversion is nearly absent for most presets:
    - `Sword / Bleed`: `0`
    - `Blunt / Guard`: `0`
    - `Dagger / Crit`: `0`
    - `Heavy / Steel`: `0`
    - only `Mace / Control` and `Axe / Pressure` show visible payoff triggering

What this means:

- the immediate problem is not "skills are too weak" in the abstract
- the immediate problem is that the planner currently overspends skills whenever it can and does not preserve enough resources or tempo for payoff turns
- setup windows are being created much more often than they are being cashed in
- the next tuning pass should therefore target planner rhythm, skill scoring, cost cadence, or cooldown pacing before broad damage retuning

Follow-up planner experiment:

- a narrow planner pass was added to allow "hold for payoff" behavior when a setup-like skill would spend the same resource that a nearby payoff skill needs
- the isolated planner test passed, so the behavior exists as a supported option now
- but the live audit barely moved afterward, which is the more important result:
  - `Sword / Bleed` still never reaches `Execution Arc`
  - `Dagger / Crit` still almost never reaches `Heartseeker`
  - `Mace / Control` still rarely reaches `Crushing Blow`

Revised read after that experiment:

- planner greed is part of the story, but not the main bottleneck for the live roster
- the stronger bottleneck is resource economy and cost shape:
  - several payoff skills are simply too expensive relative to how their archetypes earn that resource
  - some kits create setup states on one resource and try to cash them in on a second, slower resource
- so the next corrective pass should prioritize:
  - payoff costs
  - resource gain cadence
  - and only secondarily more planner scoring changes

Follow-up payoff-window pass:

- planner scoring now also understands live payoff windows directly:
  - affordable payoff skills are now preferred when their required state is already active
  - active `stateBonuses` are now scored instead of being treated as invisible planner value
- the next content pass then narrowed the `Exposed` bottleneck:
  - `Exposed` duration increased from `2` to `3`
  - `Execution Arc` cost dropped from `18` to `16`
  - `Heartseeker` cost dropped from `20` to `16`

What changed after the pass:

- `Sword / Bleed` improved structurally:
  - `Execution Arc` usage rose from `0` to `40`
  - the sword kit now actually reads as setup -> payoff in the live audit
- `Dagger / Crit` improved only slightly:
  - `Heartseeker` still fires rarely, although it now shows at least one real tagged payoff trigger
- `Mace / Control` remains stable on the earlier guard-aligned payoff path

Latest economic pass:

- a narrow live-content economy pass is now in:
  - `Execution Arc` cost reduced from `24` to `18`
  - `Heartseeker` moved from `focus` to `rage` and its cost dropped from `24` to `20`
  - `Crushing Blow` moved from `momentum` to `guard` and its cost dropped from `23` to `19`

What changed after the pass:

- `Mace / Control` improved materially:
  - `Crushing Blow` usage rose from `8` to `37`
  - matrix net improved from `-36` to `-26`
- `Dagger / Crit` changed only slightly:
  - `Heartseeker` still fires rarely, but when it does the hit quality is excellent
  - this suggests dagger still needs more than just a resource-type alignment
- `Sword / Bleed` did not improve yet:
  - `Execution Arc` still does not come online in the live audit
  - that means sword pressure is bottlenecked somewhere beyond raw cost alone

Current best read:

- the economy pass validated the method
- `Mace / Control` was genuinely suffering from payoff access
- `Sword / Bleed` and `Dagger / Crit` still likely need either:
  - stronger resource cadence
  - less setup overspend inside burst loops
  - or less front-loaded setup spending

Current working conclusion:

- do not resume blind archetype tuning from the pre-fix notes
- treat the repaired matrix as a new baseline
- audit skill usage and combat rhythm first
- only then retune the weakest and strongest archetypes on top of valid data
- treat planner overspending and payoff starvation as the primary follow-up problem

Latest dagger handoff fix:

- the next narrow burst pass is now in and it clarified the problem further:
  - `Dagger / Crit` was not mainly failing because `Heartseeker` numbers were too low
  - it was failing because `Execution Mark` opened `Exposed` and spent the same zero-start `rage` economy that the finisher needed
- the live fix stayed archetype-specific instead of changing global resource rules:
  - `Execution Mark` now also applies `Killing Window`
  - `Killing Window` is a one-turn self-buff that grants `+16 rage` at the start of the next turn
  - that creates an explicit burst handoff instead of asking the dagger kit to crit at exactly the right moment just to afford its own payoff
- the result is large enough to count as a real loop repair:
  - `Heartseeker` usage rose from `2` to `74`
  - tagged payoff triggers rose from `1` to `67`
  - `Dagger / Crit` improved from `38-102` to `48-92`
- current read after the fix:
  - the burst lane now behaves like a readable setup -> payoff kit
  - the next weakest live archetypes are now more clearly in the guard/control cluster, not in dagger burst

## Combat System Build Order

The next combat phase should be treated as system construction, not rotating archetype repair.

Current live read from runtime and audits:

- the combat core already has a strong execution pipeline:
  - initiative order by agility
  - declared attack and defense zones
  - typed mitigation through `zoneArmor + zoneArmorBySlot`
  - dodge, block, penetration, crit, and damage resolution
  - turn-start effect ticks
  - cooldowns and active-effect state windows
- the content layer also already has a readable first skill language:
  - `setup`
  - `payoff`
  - `control`
  - `counter`
  - `tempo`
  - `sustain`
- the weak point is the layer between them:
  - resource cadence
  - planner rhythm
  - payoff conversion reliability
  - role identity under pressure

So the build order from here should be:

1. protect the combat foundation
   - keep `resolveRound(...)`, typed mitigation, turn-start effects, and cooldown behavior as the canonical truth model
   - avoid changing this layer casually for single-archetype pain unless the bug is clearly systemic
2. formalize combat pillars
   - burst must create and cash in on a short kill window
   - pressure must steadily amplify threat across repeated exchanges
   - control must disrupt defense quality or enemy tempo in a measurable way
   - defense must survive peaks and convert safety into counter-pressure
   - sustain must win longer exchanges without creating dead fights
3. stabilize shared economy rules
   - each archetype needs a believable way to reach its payoff button
   - setup and payoff should not accidentally compete on impossible timing by default
   - resource rewards should reinforce intended combat identity instead of only generic hit quality
4. improve planner behavior only where it expresses system truth
   - planner should recognize open payoff windows
   - planner should preserve resources when a real conversion turn is near
   - planner should not be used as a hidden patch for broken combat economics
5. rebalance archetypes only after the system layer is stable
   - class or preset changes should become the finishing pass, not the main repair loop

Practical development rule:

- if a combat problem appears in one kit only, prefer an archetype fix
- if it appears across multiple kits with the same failure shape, fix the shared system layer first

This means the next combat work should be framed as:

- build combat economy truth
- build readable role identity
- build reliable setup -> payoff conversion
- only then reopen broad archetype tuning

---

## Task Breakdown

- `COMBAT-006` - define first-wave combat expansion states and interaction rules
- `COMBAT-007` - design and implement more varied skills around setup/payoff patterns
- `COMBAT-008` - deepen archetype identity through state synergy and role-specific combat loops
- `COMBAT-009` - expand combat docs and Combat Rules for the new state/skill layer
- `COMBAT-010` - add regression and balance coverage for combat expansion content

---

> Last updated: 2026-03-18 18:28 MSK
