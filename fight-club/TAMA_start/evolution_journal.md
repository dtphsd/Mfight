# 🧬 Agent Evolution Lab Journal

> **Created**: {{DATE}}
> **Project**: {{PROJECT_NAME}}
> **Agent**: {{AGENT_ID}}
> **Rules**: `.agents/workflows/auto-evolution.md` (RULE 1-8)
> **Format**: JSON-compatible for Tamagotchi visualization

---

## 🎮 Система Уровней

| Level | Название | XP Диапазон | Описание |
|-------|----------|-------------|----------|
| 1-10 | 🟢 **Novice** | 0-50 XP | Учится на ошибках, повторяет баги |
| 11-20 | 🔵 **Apprentice** | 51-120 XP | Знает основные паттерны, читает инструкции |
| 21-30 | 🟣 **Operative** | 121-220 XP | Предупреждает баги до их появления |
| 31-40 | 🟠 **Specialist** | 221-350 XP | Создаёт системы предотвращения |
| 41-50 | 🔴 **Architect** | 351-500 XP | Self-healing pipelines |
| 51-60 | ⚫ **Sentinel** | 501-700 XP | Предсказывает failure modes |
| 61-70 | 🌟 **Mastermind** | 701-950 XP | Каждое решение — шаблон |
| 71-80 | 💎 **Legendary** | 951-1250 XP | Документация самодостаточна |
| 81-90 | 🏆 **Mythic** | 1251-1600 XP | Pipeline эволюционирует автономно |
| 91-100 | 👑 **Transcendent** | 1601+ XP | Полная автономия |

### XP за Impact Score

| Impact | Score | XP | Категория |
|--------|-------|-----|-----------|
| 1-2 | 📝 | +3 | Cosmetic |
| 3-4 | 📋 | +5 | Procedural |
| 5-6 | 🔧 | +8 | Structural |
| 7-8 | 🛡️ | +13 | Preventive |
| 9-10 | 💥 | +21 | Paradigm Shift |

### Бонусы
- **3+ записей за сессию**: +5 XP streak bonus
- **Предотвращённый повторный баг** (confirmed): +8 XP
- **Паттерн переиспользован другим агентом** (confirmed): +13 XP

---

## 📊 Текущий Статус

```
┌─────────────────────────────────────────────────┐
│  🧬 AGENT EVOLUTION STATUS                      │
│                                                 │
│  Level: 1 🟢 Novice                             │
│  Total XP: 56 / 120                             │
│  Next Level: Operative (121 XP)                 │
│  Evolution Entries: 7                           │
│  ██████████████░░░░░░░░░░░░░░  46%           │
│                                                 │
│  Session Streak: 7 entries                      │
│  Top Impact: 6                                  │
│  Patterns Extracted: 7                          │
│  Anti-Patterns Registered: 0                    │
└─────────────────────────────────────────────────┘
```

<!-- STATUS_JSON
{
  "agent_id": "my-agent-001",
  "project": "My Project",
  "level": 11,
  "level_name": "Apprentice",
  "level_emoji": "🔵",
  "xp_current": 161,
  "xp_next_level": 120,
  "total_entries": 20,
  "total_patterns": 20,
  "total_anti_patterns": 0,
  "top_impact": 7,
  "streak": 20,
  "last_updated": "2026-03-17T00:53:00+03:00"
}
-->

---

## 📓 Журнал Эволюции

> Записи добавляются AI-агентом автоматически по RULE 8 из `auto-evolution.md`.
> Каждая запись = EVO-NNN с Impact Score, XP, извлечённым паттерном.

### EVO-001 · Combat Silhouette Safe Decomposition
**Date**: 2026-03-16
**Impact**: 6/10 🔧 Structural
**XP**: +8 · **Cumulative**: 8 XP
**Type**: Process improvement

#### What happened
`CombatSilhouette.tsx` had accumulated multiple render responsibilities in one file while still being consumed by both the combat screen and the profile modal.

#### Why it happened
The component had grown organically around visuals, hover equipment, impact motion, figure rendering, and status presentation, which increased change risk for downstream consumers.

#### Evolution step
The refactor was done as isolated sibling extractions with explicit consumer tracing first, then `lint` and `build` verification after each meaningful slice.

#### 🧠 Extracted Pattern → PAT-001
> **"Trace consumers before UI decomposition"**: Before splitting a heavyweight UI component, first map direct imports and usages so internal extractions do not accidentally mutate the external contract.

<!-- EVO_JSON
{"id":"EVO-001","date":"2026-03-16","impact":6,"xp":8,"category":"Structural","type":"Process improvement","pattern":"PAT-001","title":"Combat Silhouette Safe Decomposition"}
-->

### EVO-002 · Post-Refactor Verification Caught Contract Drift
**Date**: 2026-03-16
**Impact**: 6/10 🔧 Structural
**XP**: +8 · **Cumulative**: 16 XP
**Type**: Verification improvement

#### What happened
During the next `CombatSilhouette` decomposition slice, the equipment layer was extracted into a sibling module and a stale local type import was removed too aggressively.

#### Why it happened
The component body was being reduced quickly, but `CombatSilhouetteProps` still referenced `Item`, so the file-level contract and the local implementation details were temporarily out of sync.

#### Evolution step
The break was detected immediately by post-refactor build verification, then fixed by restoring the required type import without rolling back the extraction.

#### 🧠 Extracted Pattern → PAT-002
> **"Verify right after extraction"**: After every structural extraction, run verification immediately so contract drift is caught while the patch context is still small and obvious.

<!-- EVO_JSON
{"id":"EVO-002","date":"2026-03-16","impact":6,"xp":8,"category":"Structural","type":"Verification improvement","pattern":"PAT-002","title":"Post-Refactor Verification Caught Contract Drift"}
-->

### EVO-003 · Stateful Impact Logic Moved Behind A Hook
**Date**: 2026-03-16
**Impact**: 6/10 🔧 Structural
**XP**: +8 · **Cumulative**: 24 XP
**Type**: Architecture refinement

#### What happened
After extracting the visual layers of `CombatSilhouette`, the file still owned the entire impact-motion lifecycle and timing state directly.

#### Why it happened
Presentation decomposition happened first, but the stateful behavior that coordinated linger, motion activation, and impact payload updates was still embedded in the component body.

#### Evolution step
The impact orchestration was moved into a dedicated `useCombatImpactMotion` hook so the component can keep shrinking toward a composition surface while the timing behavior stays isolated and testable.

#### 🧠 Extracted Pattern → PAT-003
> **"Extract stateful behavior after visual layers stabilize"**: Once render layers are separated, move the remaining timing or lifecycle orchestration into a dedicated hook so the top-level component becomes a clear coordinator.

<!-- EVO_JSON
{"id":"EVO-003","date":"2026-03-16","impact":6,"xp":8,"category":"Structural","type":"Architecture refinement","pattern":"PAT-003","title":"Stateful Impact Logic Moved Behind A Hook"}
-->

### EVO-004 · Legacy Resource Grid Duplicate Removed
**Date**: 2026-03-16
**Impact**: 6/10 🔧 Structural
**XP**: +8 · **Cumulative**: 32 XP
**Type**: Cleanup hardening

#### What happened
`CombatSandboxScreen.tsx` still contained a dead local `ResourceGrid` implementation even though the live screen had already switched to the extracted `combatSandboxScreenResourceGrid` module.

#### Why it happened
The refactor had stabilized the real replacement first, but the original in-file helper was left behind as inert legacy code at the bottom of the screen file.

#### Evolution step
The duplicate block was removed only after confirming the active import and render path, then `lint` and `build` were rerun immediately to prove the screen no longer depended on the stale local copy.

#### 🧠 Extracted Pattern → PAT-004
> **"Remove dead duplicates after the replacement stabilizes"**: Once an extracted module is confirmed as the live path, delete the old in-file duplicate promptly so it cannot drift, confuse future edits, or mask the real source of truth.

<!-- EVO_JSON
{"id":"EVO-004","date":"2026-03-16","impact":6,"xp":8,"category":"Structural","type":"Cleanup hardening","pattern":"PAT-004","title":"Legacy Resource Grid Duplicate Removed"}
-->

### EVO-005 · Fight Setup Flow Extracted From The Screen Shell
**Date**: 2026-03-16
**Impact**: 6/10 🔧 Structural
**XP**: +8 · **Cumulative**: 40 XP
**Type**: Composition refinement

#### What happened
`CombatSandboxScreen.tsx` still owned the full fight-setup render flow for controls, targeting, round advance, and action rails even after other slices had already been split into sibling modules.

#### Why it happened
The screen was shrinking incrementally, but the central setup section remained embedded because it stitched together several already-extracted child panels and shared style tokens.

#### Evolution step
The setup render layer was moved into `combatSandboxScreenSetup.tsx` and wired back into the screen through explicit style and behavior props, keeping the top-level file closer to a pure coordinator while preserving runtime behavior.

#### 🧠 Extracted Pattern → PAT-005
> **"Extract local composition once child modules are already stable"**: When a screen still feels heavy after helper and panel extractions, move the remaining in-file composition block into its own sibling module and pass styles/actions explicitly instead of keeping a half-container inside the parent file.

<!-- EVO_JSON
{"id":"EVO-005","date":"2026-03-16","impact":6,"xp":8,"category":"Structural","type":"Composition refinement","pattern":"PAT-005","title":"Fight Setup Flow Extracted From The Screen Shell"}
-->

### EVO-006 · Combat Stage Extracted Into A Dedicated Screen Module
**Date**: 2026-03-16
**Impact**: 6/10 🔧 Structural
**XP**: +8 · **Cumulative**: 48 XP
**Type**: Screen decomposition

#### What happened
`CombatSandboxScreen.tsx` still held the full stage composition that stitched together the player panel, setup panel, bot panel, finish flash, and victory/defeat visual state.

#### Why it happened
Even after helper and setup extractions, the parent screen still mixed top-level orchestration with a large layout surface that passed shared styles and callbacks down to multiple combat panels.

#### Evolution step
The entire stage composition was moved into `combatSandboxScreenStage.tsx`, with shared style tokens and actions passed explicitly so the parent screen could keep shrinking toward a true orchestration shell.

#### 🧠 Extracted Pattern → PAT-006
> **"Extract the stage shell before touching overlay orchestration"**: When a screen contains both a large visible stage and a complex overlay layer, separate the static composition shell first so the remaining overlay work can be handled in a smaller, more focused file.

<!-- EVO_JSON
{"id":"EVO-006","date":"2026-03-16","impact":6,"xp":8,"category":"Structural","type":"Screen decomposition","pattern":"PAT-006","title":"Combat Stage Extracted Into A Dedicated Screen Module"}
-->

### EVO-007 · Overlay Orchestration Extracted After Stage Stabilization
**Date**: 2026-03-16
**Impact**: 6/10 🔧 Structural
**XP**: +8 · **Cumulative**: 56 XP
**Type**: Overlay decomposition

#### What happened
After the stage shell moved out, `CombatSandboxScreen.tsx` still owned the entire overlay orchestration layer for lazy popovers, inventory, build flows, and profile modals.

#### Why it happened
The overlay side was riskier than the visible stage because it mixed lazy imports, fallback UI, profile mail actions, and multiple modal-specific data contracts in one remaining block.

#### Evolution step
The full overlay layer was moved into `combatSandboxScreenOverlays.tsx` together with its lazy loaders and preload helper, then the parent screen was rewired to call a single preload function and render one overlay module.

#### 🧠 Extracted Pattern → PAT-007
> **"Move lazy overlay orchestration with its loaders"**: When extracting a modal-heavy overlay block, move the lazy imports, fallback UI, and preload helper into the same sibling module so the parent shell does not keep hidden coupling to modal internals.

<!-- EVO_JSON
{"id":"EVO-007","date":"2026-03-16","impact":6,"xp":8,"category":"Structural","type":"Overlay decomposition","pattern":"PAT-007","title":"Overlay Orchestration Extracted After Stage Stabilization"}
-->

### EVO-008 · Bot Omniscience Removed From Combat Planning
**Date**: 2026-03-16
**Impact**: 7/10 🛡️ Preventive
**XP**: +13 · **Cumulative**: 69 XP
**Type**: Gameplay integrity fix

#### What happened
Combat analysis showed that the sandbox flow passed the player's announced attack zone into bot planning, which let higher-difficulty bots defend the exact target before resolution.

#### Why it happened
The planner had kept an old `opponentAttackZone` hook that turned a useful debug shortcut into live gameplay behavior, making defended hits look unnaturally prescient and distorting shield-break feel, low-line attacks, and overall fairness.

#### Evolution step
The sandbox flow stopped supplying the player's announced zone to bot planning, and the planner tests were updated to verify stable, unique defense zones without relying on that hidden knowledge.

#### 🧠 Extracted Pattern → PAT-008
> **"Remove planner omniscience before tuning formulas"**: If an AI planner gets hidden future knowledge, fix that fairness leak first; otherwise balance work, combat feel, and formula debugging all happen on top of corrupted inputs.

<!-- EVO_JSON
{"id":"EVO-008","date":"2026-03-16","impact":7,"xp":13,"category":"Preventive","type":"Gameplay integrity fix","pattern":"PAT-008","title":"Bot Omniscience Removed From Combat Planning"}
-->

### EVO-009 · Typed Zone Mitigation Moved Into A Dedicated Combat Service
**Date**: 2026-03-16
**Impact**: 6/10 🔧 Structural
**XP**: +8 · **Cumulative**: 77 XP
**Type**: Combat math refactor

#### What happened
The live mitigation path inside `resolveRound.ts` reduced mixed attacks through one pooled armor value, which drifted away from the intended typed combat model.

#### Why it happened
The runtime had separate damage profiles, penetration profiles, and armor profiles, but the actual round resolver still collapsed the hit into one `totalAttack` number before mitigation.

#### Evolution step
A dedicated `combatMitigation.ts` service now resolves zone armor into typed shares and mitigates `slash`, `pierce`, `blunt`, and `chop` separately, with direct tests covering type weighting and defended-zone focus.

#### 🧠 Extracted Pattern → PAT-009
> **"Extract combat math before retuning coefficients"**: Move the formula core into a dedicated service and pin it with targeted tests first; only then start rebalance work, otherwise math changes stay buried inside a monolith.

<!-- EVO_JSON
{"id":"EVO-009","date":"2026-03-16","impact":6,"xp":8,"category":"Structural","type":"Combat math refactor","pattern":"PAT-009","title":"Typed Zone Mitigation Moved Into A Dedicated Combat Service"}
-->

### EVO-010 · Dedicated Zone Audit Harness Added For Combat Calibration
**Date**: 2026-03-16
**Impact**: 5/10 🔧 Structural
**XP**: +8 · **Cumulative**: 85 XP
**Type**: Verification tooling

#### What happened
After landing typed mitigation, the next risk was retuning zones and block or penetration behavior from intuition instead of repeatable evidence.

#### Why it happened
The project had matchup matrix tooling, but no focused harness that isolated one attacker, one defender, and the exact `open` versus `defended` outcome for each target zone.

#### Evolution step
A dedicated `combat:audit-zones` script was added so the project can print deterministic per-zone summaries with average final damage, block rate, penetration rate, crit rate, and dominant damage type before changing coefficients.

#### 🧠 Extracted Pattern → PAT-010
> **"Add a narrow audit harness before coefficient tuning"**: When a system feels wrong in specific slices like target zones or guard states, create a focused measurement tool first so balancing starts from evidence instead of anecdote.

<!-- EVO_JSON
{"id":"EVO-010","date":"2026-03-16","impact":5,"xp":8,"category":"Structural","type":"Verification tooling","pattern":"PAT-010","title":"Dedicated Zone Audit Harness Added For Combat Calibration"}
-->

### EVO-011 · Live Presets Stopped Pointing At Zero-Damage Weapons
**Date**: 2026-03-16
**Impact**: 6/10 🔧 Structural
**XP**: +8 · **Cumulative**: 93 XP
**Type**: Balance-input correction

#### What happened
Targeted combat audits revealed that some live combat presets were built around Battle Kings main-hand items with `baseDamage: 0`, which made matchup and zone-balance conclusions partly reflect broken content instead of actual weapon behavior.

#### Why it happened
The generated starter-item pool contains both valid weapon entries and empty placeholder-like variants, and the preset roster had drifted onto the wrong item codes for dagger, axe, and heavy sword slices.

#### Evolution step
The preset loadouts were rewired to real non-zero weapon entries before continuing formula tuning, so the matrix and zone-audit tools now measure combat on top of actual weapon damage.

#### 🧠 Extracted Pattern → PAT-011
> **"Validate live preset inputs before trusting balance outputs"**: If balance data looks strange, verify that curated presets still point at valid content first; otherwise analytics can be precise but still fundamentally misleading.

<!-- EVO_JSON
{"id":"EVO-011","date":"2026-03-16","impact":6,"xp":8,"category":"Structural","type":"Balance-input correction","pattern":"PAT-011","title":"Live Presets Stopped Pointing At Zero-Damage Weapons"}
-->

### EVO-012 · Blunt And Bot Analysis Inputs Were Normalized Before Retuning
**Date**: 2026-03-16
**Impact**: 6/10 🔧 Structural
**XP**: +8 · **Cumulative**: 101 XP
**Type**: Audit hardening

#### What happened
The focused blunt/control audit showed that `Mace / Control` was still running below the normal preset stat budget, and the champion bot loadout still used a zero-damage sword during matrix-driven analysis.

#### Why it happened
Even after fixing the most obvious weapon drift, some analysis inputs were still dirty: one curated preset had an accidental low-budget allocation map, and one core planner loadout still referenced a broken generated weapon.

#### Evolution step
Both inputs were normalized before continuing balance work, so the remaining blunt/control weakness now reads as a real systemic issue rather than a hidden preset-quality problem.

#### 🧠 Extracted Pattern → PAT-012
> **"Normalize audit inputs completely before calling a mechanic weak"**: If one archetype still looks broken, verify its stats, loadout, and shared bot baselines together; otherwise you can blame the formula for what is really a corrupted test fixture.

<!-- EVO_JSON
{"id":"EVO-012","date":"2026-03-16","impact":6,"xp":8,"category":"Structural","type":"Audit hardening","pattern":"PAT-012","title":"Blunt And Bot Analysis Inputs Were Normalized Before Retuning"}
-->

### EVO-013 · Blunt-Control Rescue Started With A Narrow Formula Pass
**Date**: 2026-03-16
**Impact**: 6/10 🔧 Structural
**XP**: +8 · **Cumulative**: 109 XP
**Type**: Focused balance refinement

#### What happened
Once the blunt/control inputs were cleaned up, the remaining weakness still showed up in the matrix and zone audit, especially into the broad defensive shell built by `Sustain / Armor`.

#### Why it happened
Generic zone defense was still overprotecting against blunt, and the mace passive was too short and too light to convert hits into meaningful follow-up pressure.

#### Evolution step
The rescue pass lowered generic blunt zone-defense values and upgraded `Concussed Guard` into a longer, heavier debuff, which improved `Blunt / Guard` from `Net -20` to `Net -12` while keeping the rest of the combat system stable.

#### 🧠 Extracted Pattern → PAT-013
> **"Narrow the rescue pass to one damage family"**: When one archetype cluster is weak, tune the specific defense interaction and passive payoff for that family first instead of reopening every combat coefficient at once.

<!-- EVO_JSON
{"id":"EVO-013","date":"2026-03-16","impact":6,"xp":8,"category":"Structural","type":"Focused balance refinement","pattern":"PAT-013","title":"Blunt-Control Rescue Started With A Narrow Formula Pass"}
-->

### EVO-014 · Top-Tier Slash And Sustain Pressure Were Softened Together
**Date**: 2026-03-16
**Impact**: 6/10 🔧 Structural
**XP**: +8 · **Cumulative**: 117 XP
**Type**: Targeted balance containment

#### What happened
After the blunt/control rescue, the matrix still showed `Sword / Bleed` and `Sustain / Armor` as the dominant top cluster, with both archetypes leaning on slash pressure and durable healing loops.

#### Why it happened
`Open Wound` was still adding too much passive follow-up value to sword lines, while `regen-potion` gave sustain shells a very efficient multi-turn reset without enough opportunity cost.

#### Evolution step
The containment pass reduced sword bleed ticks from `4` to `3` and cut `regen-potion` down to `2` turns of `3` healing, which brought `Sustain / Armor` from `Net +44` to `Net +38` while keeping the broader recovery track stable.

#### 🧠 Extracted Pattern → PAT-014
> **"Trim the top cluster through its distinct engines"**: When two leading archetypes share a meta tier but not the exact same source of power, nerf each one through its own engine instead of flattening general combat damage across the board.

<!-- EVO_JSON
{"id":"EVO-014","date":"2026-03-16","impact":6,"xp":8,"category":"Structural","type":"Targeted balance containment","pattern":"PAT-014","title":"Top-Tier Slash And Sustain Pressure Were Softened Together"}
-->

### EVO-015 · Dagger Burst Lane Was Rescued Through Identity-Aligned Buffs
**Date**: 2026-03-16
**Impact**: 6/10 🔧 Structural
**XP**: +8 · **Cumulative**: 125 XP
**Type**: Archetype rescue

#### What happened
After the blunt rescue and top-tier softening passes, `Dagger / Crit` still sat below the mid-tier even though its raw zone damage was already respectable.

#### Why it happened
The burst lane was not primarily failing on base damage; it was failing to survive long enough and to convert crit windows hard enough once they did happen.

#### Evolution step
The rescue pass shifted one point from agility into endurance on the dagger preset and strengthened `Vital Mark`, which improved `Dagger / Crit` from `Net -30` to `Net -20` without creating a new top-tier outlier.

#### 🧠 Extracted Pattern → PAT-015
> **"Rescue an archetype through its identity, not generic damage inflation"**: If a burst build already hits hard enough in isolation, improve its window conversion or survivability instead of blindly raising base damage.

<!-- EVO_JSON
{"id":"EVO-015","date":"2026-03-16","impact":6,"xp":8,"category":"Structural","type":"Archetype rescue","pattern":"PAT-015","title":"Dagger Burst Lane Was Rescued Through Identity-Aligned Buffs"}
-->

### EVO-016 · Combat Truth Model Was Synced Back Into Rules And Docs
**Date**: 2026-03-16
**Impact**: 4/10 📋 Procedural
**XP**: +5 · **Cumulative**: 130 XP
**Type**: Documentation convergence

#### What happened
The combat recovery track had already changed live runtime behavior, but the player-facing rules screen and combat architecture docs were still describing pre-recovery numbers and outdated defended-zone wording.

#### Why it happened
Formula work moved faster than documentation, so the project temporarily had two competing explanations for zone modifiers, defended-zone armor, weapon passives, and consumable sustain.

#### Evolution step
The sync pass updated the rules screen and core combat markdowns to match the live `per-damage-type` model, `zoneArmor + zoneArmorBySlot` defended-zone wording, the new zone multipliers, the `4.4` penetration divisor, and the current sword, dagger, mace, and regeneration values.

#### 🧠 Extracted Pattern → PAT-016
> **"Freeze the truth model in docs right after a formula pivot"**: Once combat math changes shape, immediately sync the player rules and architecture docs so future tuning debates happen against the runtime instead of stale explanations.

<!-- EVO_JSON
{"id":"EVO-016","date":"2026-03-16","impact":4,"xp":5,"category":"Procedural","type":"Documentation convergence","pattern":"PAT-016","title":"Combat Truth Model Was Synced Back Into Rules And Docs"}
-->

### EVO-017 · Skill Work Was Reframed Around Production Combat Kits
**Date**: 2026-03-17
**Impact**: 4/10 📋 Procedural
**XP**: +5 · **Cumulative**: 135 XP
**Type**: Planning correction

#### What happened
The combat workstream was at risk of circling around temporary preset balance even though the long-term game goal is an MMORPG-style fighting system with real skill kits, progression, and broader item depth.

#### Why it happened
The current sandbox exposes active skills in the engine and UI, but curated presets still mostly run without equipped loadouts, which made it too easy to over-invest in balancing empty or half-empty archetypes.

#### Evolution step
The plan was reframed so the next combat expansion priority is now production skill architecture: define canonical skill roles, curated first-pack shape, preset integration rules, and the path from empty skill rails to real combat kits before moving on to trauma hooks.

#### 🧠 Extracted Pattern → PAT-017
> **"Stop balancing around placeholder loadouts once the real progression layer becomes the bottleneck"**: When the core engine is stable enough, shift effort from temporary archetype tuning toward the missing systems that will actually define long-term combat identity.

<!-- EVO_JSON
{"id":"EVO-017","date":"2026-03-17","impact":4,"xp":5,"category":"Procedural","type":"Planning correction","pattern":"PAT-017","title":"Skill Work Was Reframed Around Production Combat Kits"}
-->

### EVO-018 · Production Skill Metadata Landed As A Shared Contract
**Date**: 2026-03-17
**Impact**: 5/10 🔧 Structural
**XP**: +8 · **Cumulative**: 140 XP
**Type**: Systems foundation

#### What happened
The skill roadmap moved from planning into code: the combat model now carries explicit role metadata, preferred zone hints, and soft AI guidance for skills.

#### Why it happened
The project needed a real production-ready contract for skills before curated packs could be attached to presets, surfaced in UI, or used coherently by the bot planner.

#### Evolution step
`CombatSkill` was extended with minimal metadata, imported reference skills were annotated, builder and item UI started surfacing the new fields, and bot planning now treats those fields as soft scoring hints instead of hard scripting rules.

#### 🧠 Extracted Pattern → PAT-018
> **"Land new progression-facing metadata as a cross-layer contract, not as a docs-only idea"**: If a future system must shape content, UI, and AI together, introduce it first as a minimal shared contract that every layer can already read.

<!-- EVO_JSON
{"id":"EVO-018","date":"2026-03-17","impact":5,"xp":8,"category":"Structural","type":"Systems foundation","pattern":"PAT-018","title":"Production Skill Metadata Landed As A Shared Contract"}
-->

### EVO-019 · Curated Presets Finally Moved Onto Real Skill Kits
**Date**: 2026-03-17
**Impact**: 6/10 🔧 Structural
**XP**: +8 · **Cumulative**: 148 XP
**Type**: Content integration

#### What happened
The sandbox finally stopped pretending that skills existed only in theory: the curated combat presets now carry real first-wave combat kits instead of empty `skillLoadout` arrays.

#### Why it happened
The engine, UI, and planner were already ready for skills, but the starter content graph still lacked equipped skill carriers, which left the curated roster playing like stat blocks with a mostly unused skill system.

#### Evolution step
A small hand-written starter skill layer was added on top of the generated item pool through accessory skill carriers, those carriers were attached to the curated presets, and the preset-state test contract was extended so only unlocked skill ids survive into the live sandbox state.

#### 🧠 Extracted Pattern → PAT-019
> **"Bridge a ready system into live gameplay with a thin handwritten content layer before rewriting the whole dataset"**: When runtime and UI are prepared but generated content lags behind, use a narrow curated overlay to activate the system safely instead of waiting for a full data-pipeline rewrite.

<!-- EVO_JSON
{"id":"EVO-019","date":"2026-03-17","impact":6,"xp":8,"category":"Structural","type":"Content integration","pattern":"PAT-019","title":"Curated Presets Finally Moved Onto Real Skill Kits"}
-->

### EVO-020 В· Barrel Import Drift Corrupted Skill Carrier Combat Data
**Date**: 2026-03-17
**Impact**: 7/10 рџ›ЎпёЏ Preventive
**XP**: +13 В· **Cumulative**: 161 XP
**Type**: Circular import prevention

#### What happened
After the first live skill kits landed, combat analytics suddenly collapsed into long draws and the zone audit reported `blunt` even for sword attacks. The real issue was lower-level than tuning: starter skill carrier items were being created with empty `baseDamage` and missing `combatBonuses`, which poisoned combat snapshots with `NaN`.

#### Why it happened
`starterSkillItems.ts` was importing zero-value item profiles through the broad inventory barrel, and that barrel recursed back through starter inventory assembly. The circular path left the carrier items with unstable zero-profile data at module initialization time.

#### Evolution step
The skill carrier layer was switched to direct model imports from `Item.ts`, a regression test was added at the equipment layer, and the combat audit recovered from false `blunt` fallback data back to real `slash` sword hits. This also restored matchup reality by removing a fake draw-heavy meta caused by corrupted snapshots.

#### рџ§  Extracted Pattern в†’ PAT-020
> **"Avoid broad feature barrels in content overlays that also feed startup data"**: When a thin content layer depends on zero-value model constants, import them from the owning model file directly instead of a barrel that can recurse back through inventory/bootstrap code.

<!-- EVO_JSON
{"id":"EVO-020","date":"2026-03-17","impact":7,"xp":13,"category":"Preventive","type":"Circular import prevention","pattern":"PAT-020","title":"Barrel Import Drift Corrupted Skill Carrier Combat Data"}
-->

---

## 🧠 Pattern Registry (что ДЕЛАТЬ)

| # | Паттерн | Source | Применимость |
|---|---------|--------|-------------|
| PAT-001 | Trace consumers before UI decomposition | EVO-001 | Любой безопасный рефактор тяжелого UI-компонента с живыми consumers |
| PAT-002 | Verify right after extraction | EVO-002 | Любая декомпозиция, где легко потерять локальный тип или контракт после выноса кода |
| PAT-003 | Extract stateful behavior after visual layers stabilize | EVO-003 | UI-компоненты, где render уже разложен, но timing/lifecycle логика все еще застряла в верхнем файле |
| PAT-004 | Remove dead duplicates after the replacement stabilizes | EVO-004 | Cleanup после extraction, когда новый sibling-модуль уже живой, а старый локальный дубликат только путает источник правды |
| PAT-005 | Extract local composition once child modules are already stable | EVO-005 | Большие screen/container-файлы, где почти все дочерние блоки уже вынесены, но центральная раскладка все еще держит файл раздутым |
| PAT-006 | Extract the stage shell before touching overlay orchestration | EVO-006 | Экраны с крупным visible-stage и отдельным сложным overlay-слоем, где безопаснее сначала отделить статическую композицию |
| PAT-007 | Move lazy overlay orchestration with its loaders | EVO-007 | Modal-heavy UI-экраны, где lazy imports, fallback UI и preload-логика должны жить рядом с самим overlay-слоем |
| PAT-008 | Remove planner omniscience before tuning formulas | EVO-008 | Combat AI, balance, and formula debugging, where hidden future knowledge can corrupt playtest conclusions before any math is touched |
| PAT-009 | Extract combat math before retuning coefficients | EVO-009 | Combat-system refactors where formula behavior must become testable and visible before balance tuning starts |
| PAT-010 | Add a narrow audit harness before coefficient tuning | EVO-010 | Balance work on specific mechanics like target zones, defended states, and penetration, where focused measurements beat vague playfeel |
| PAT-011 | Validate live preset inputs before trusting balance outputs | EVO-011 | Matchup matrices, combat audits, and any balance loop that depends on curated preset rosters staying tied to valid content |
| PAT-012 | Normalize audit inputs completely before calling a mechanic weak | EVO-012 | Focused balance investigations where a weak archetype might still be carrying broken stats, loadouts, or shared baseline fixtures |
| PAT-013 | Narrow the rescue pass to one damage family | EVO-013 | Combat balance work where one archetype cluster is weak and should be repaired without destabilizing the whole ruleset |
| PAT-014 | Trim the top cluster through its distinct engines | EVO-014 | Meta containment passes where different top archetypes need separate, source-specific nerfs rather than one blunt global damage cut |
| PAT-015 | Rescue an archetype through its identity, not generic damage inflation | EVO-015 | Balance passes where a weak burst, control, or sustain build should be repaired through its own gameplay hook instead of flat global buffs |
| PAT-016 | Freeze the truth model in docs right after a formula pivot | EVO-016 | Combat-system recovery work where runtime formulas changed enough that stale docs would otherwise become a second source of bugs |
| PAT-017 | Stop balancing around placeholder loadouts once the real progression layer becomes the bottleneck | EVO-017 | Combat planning pivots where the engine is ready enough that missing skill kits and progression matter more than another temporary preset-versus-preset balance pass |
| PAT-018 | Land new progression-facing metadata as a cross-layer contract, not as a docs-only idea | EVO-018 | Systems work where content, UI, and AI will all need to read the same new skill-layer metadata before deeper rollout starts |
| PAT-019 | Bridge a ready system into live gameplay with a thin handwritten content layer before rewriting the whole dataset | EVO-019 | Cases where runtime and UI are ready, but generated content still needs a safe overlay to activate the new system in production-like play |
| PAT-020 | Avoid broad feature barrels in content overlays that also feed startup data | EVO-020 | Content/bootstrap code where a convenient barrel can recurse into inventory or startup assembly and silently corrupt zero-value model data |

---

## 🚫 Anti-Pattern Registry (что НЕ ДЕЛАТЬ)

| # | Anti-Pattern | Source | Root Cause |
|---|-------------|--------|-----------|
<!-- Anti-patterns will be added here by the AI agent -->

---

## 📈 XP Timeline

| Session | Entries | XP Earned | Total | Level |
|---------|---------|-----------|-------|-------|
| 2026-03-16 | 16 | +130 | 130 | 21 🟣 Operative |
| 2026-03-17 | 4 | +34 | 161 | 21 🟣 Operative |

---

## 📏 Метрики

| Метрика | Значение |
|---------|----------|
| Всего EVO-записей | 20 |
| Preventive entries | 2 (10.0%) |
| Structural entries | 16 (80.0%) |
| Procedural entries | 2 (10.0%) |
| Средний Impact | 5.9 |
| Паттернов (PAT) | 20 |
| Anti-паттернов (AP) | 0 |
| Повторных багов предотвращено | 0 |

---

## 🎮 Визуализация

> Этот документ спроектирован для парсинга. JSON блоки в HTML-комментариях (`STATUS_JSON`, `EVO_JSON`)
> содержат machine-readable данные для визуализации на сайте-тамагочи.
>
> Откройте `visualizer/index.html` в браузере и загрузите этот файл чтобы увидеть своего тамагочи!
