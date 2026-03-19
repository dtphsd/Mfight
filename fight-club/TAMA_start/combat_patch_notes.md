# Combat Patch Notes

> Last updated: 2026-03-20 01:00 MSK

Use this file as the canonical running log only for combat-system changes connected to the Combat Systems Agent.

Include here:

- combat formula changes
- balance changes
- combat AI and planner changes
- combat UX changes on combat-agent surfaces
- combat-system fixes

Do not include here:

- unrelated UI work
- hunting changes
- generic app infrastructure changes
- non-combat experiments

Patch note rule for balance work:

- every balance or formula entry must include exact numbers
- use `old -> new` format
- do not write vague notes like "slightly increased" or "softened a bit"

---

## 2026-03-18 - Combat Tempo Formula Pass II Follow-up

- Kept the stronger defensive layer from pass II.
- Restored a small part of attacker payoff access after the slower meta pass pressed burst and control too hard.
- Attacker resource snowball was partially restored:
  - `critAttackerRage: 10 -> 11`
  - `cleanHitAttackerMomentum: 9 -> 10`
- Intention:
  - preserve the slower fight length
  - keep the stronger block and penetration layer
  - reopen a little more payoff access for burst and pressure kits
- Validation pending on build, targeted combat tests, skill audit, and matrix review.

## 2026-03-19 - Combat Specialist Surface Joined The Three-Agent Console

- Extended the shared `Ecosystem Agents` shell from `2 -> 3` tabs.
- Kept `Combat Master` on the same mirrored surface while adding `Backend Master`.
- Preserved the same combat-agent journal and patch-note channels so combat memory did not move or fork.

## 2026-03-20 - Combat Master Progression Docs Synced To The Shared TAMA Ladder

- Re-synced `combat_agent_profile.md` and `combat_agent_journal.md` with the real shared specialist progression logic.
- `Combat Master` docs now treat `Total XP` as the source of truth for derived level display.
- Current documented combat snapshot:
  - `Total XP: 48`
  - `Level: 10`
  - `Next Level XP: 51`

## 2026-03-18 - Combat Tempo Formula Pass II

- Pushed combat pace slower again through formulas, but without reducing the base damage curve further.
- Defense became stronger:
  - `penetrationArmorDivisor: 5 -> 5.4`
  - `baseBlockedPercent: 43 -> 46`
  - `strongBlockThresholdPercent: 60 -> 63`
- Attacker resource snowball became slower:
  - `critAttackerRage: 11 -> 10`
  - `cleanHitAttackerMomentum: 10 -> 9`
- Intention:
  - keep fights alive longer
  - slow down second-turn and third-turn burst conversion
  - avoid another direct hit to the base damage curve
- Validation pending on build, targeted combat tests, skill audit, and matrix review.

## 2026-03-18 - Combat Tempo Formula Pass

- Slowed the global combat pace through formulas instead of class-by-class tuning.
- Defense became stronger:
  - `penetrationArmorDivisor: 4.4 -> 5`
  - `baseBlockedPercent: 40 -> 43`
  - `strongBlockThresholdPercent: 55 -> 60`
- Attacker resource snowball became slower:
  - `dodgeDefenderFocus: 10 -> 8`
  - `blockDefenderGuard: 8 -> 7`
  - `penetrationAttackerMomentum: 8 -> 7`
  - `critAttackerRage: 14 -> 11`
  - `cleanHitAttackerMomentum: 12 -> 10`
- Base damage curve became softer:
  - `baseDamage: 8 -> 7`
  - `strengthToBaseDamageFactor: 1.2 -> 1.1`
- Validation ran through build, skill audit, matrix review, and targeted combat tests.

## 2026-03-18 - Combat Agent Metrics Upgrade

- Added clearer combat-agent progression rules for `Impact`, `XP`, and event typing.
- Introduced `bugsKilled` as a distinct metric from `bugsLogged`.
- Updated the visualizer so combat metrics now track milestones, high-impact entries, and bugs killed.
- Tightened the journal schema so future combat changes remain easier to read and quantify.

## 2026-03-18 - Dagger Burst Handoff Repair

- Restored the burst setup -> payoff loop for `Dagger / Crit`.
- `Execution Mark` now primes a short follow-up window instead of starving `Heartseeker`.
- Confirmed improvement through targeted tests, build, and skill-audit output.
- This remains the canonical example of an archetype-specific fix that should not be generalized into global combat rules by default.

## 2026-03-19 - Combat Intent V1 Introduced

- Added a one-turn `Combat Intent` layer to round drafting, round actions, combat resolution, sandbox UI, and bot action building.
- Added four live intents:
  - `neutral`
  - `aggressive`
  - `guarded`
  - `precise`
- Added intent formula modifiers in combat config:
  - `aggressive.outgoingDamageMultiplier: 1 -> 1.08`
  - `aggressive.critChanceBonus: 0 -> 4`
  - `aggressive.dodgeChanceBonus: 0 -> -6`
  - `aggressive.blockChanceBonus: 0 -> -8`
  - `guarded.outgoingDamageMultiplier: 1 -> 0.94`
  - `guarded.dodgeChanceBonus: 0 -> 8`
  - `guarded.blockChanceBonus: 0 -> 10`
  - `guarded.blockPowerBonus: 0 -> 8`
  - `precise.outgoingDamageMultiplier: 1 -> 0.96`
  - `precise.critChanceBonus: 0 -> 2`
  - `precise.dodgeSuppression: 0 -> 8`
  - `precise.stateBonusMultiplier: 1 -> 1.3`
- Added a sandbox intent selector so the player can choose `Neutral / Aggressive / Guarded / Precise` before resolving a round.
- Added first bot support so planner-driven actions can choose a matching intent without a separate class rebalance pass.
- Verification:
  - `npm run test -- tests/modules/combat.test.ts tests/orchestration/roundDraft.test.ts tests/ui/combatSandboxScreen.test.tsx`
  - `npm run build`

## 2026-03-19 - Combat Intent Audit Added

- Added a dedicated `combat:audit-intents` report so `Combat Intent` can be measured separately from skill usage and the matchup matrix.
- New generated outputs:
  - `docs/balance/latest-intent-audit.md`
  - `docs/balance/latest-intent-audit.json`
- First baseline read:
  - `Neutral` and `Guarded` dominate pick rates across most presets
  - `Precise` is almost absent outside a few narrow cases
  - `Aggressive` produces stronger damage when chosen, but is still underpicked by most kits
- Verification:
  - `npm run combat:audit-intents`
  - `npm run build`
  - `npm run docs:validate`

## 2026-03-19 - Intent Planner Pass And Low-Line Defense Variance

- Reworked bot `Combat Intent` choice from a simple ruleset into a score-driven planner pass.
- Added planner-side defense variance so non-recruit bots can sometimes cover `legs` instead of locking into the same upper-body pair every round.
- New planner variance config:
  - `defenseVariancePoolSize: 0 -> 4`
  - `defenseCloseScoreThreshold: 0 -> 1.5`
  - `lowLineDefenseFloorChance: 0 -> 14`
- Validation:
  - `npm run test -- tests/modules/botRoundPlanner.test.ts`
  - `npm run combat:audit-intents`
  - `npm run combat:audit-skills`
  - `npm run balance:matrix`
  - `npm run build`
- Current read:
  - `Precise` improved but is still underused outside `Axe / Pressure`
  - `Dagger / Crit` now uses `Aggressive` sometimes, but planner expression is still weaker than desired
  - low-line defense is no longer completely absent from planner behavior

## 2026-03-19 - Burst And Control Intent Weighting Tuned

- Pushed a second planner-only tuning pass for `Burst` and `Control` archetypes without touching runtime combat formulas.
- Changes focused on:
  - stronger `Aggressive` appetite for burst payoff turns
  - stronger `Precise` appetite for burst setup turns
  - stronger `Precise` appetite for tagged control windows
  - lower `Guarded` stickiness when payoff pressure is already live
- Validation:
  - `npm run test -- tests/modules/botRoundPlanner.test.ts`
  - `npm run combat:audit-intents`
  - `npm run combat:audit-skills`
  - `npm run balance:matrix`
- Current read:
  - `Dagger / Crit` improved from `Net -26 -> -22`
  - `Dagger / Crit aggressive pick rate: 3.5% -> 5.2%`
  - `Mace / Control` remains mostly flat, so its next bottleneck is likely not generic intent weighting alone
