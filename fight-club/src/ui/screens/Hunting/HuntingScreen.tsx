import { useEffect, useState } from "react";
import { huntingZones } from "@/content/hunting/zones";
import {
  getHunterLevelStepCost,
  getHuntingPetLevelStepCost,
  getHuntingToolMasteryLevel,
} from "@/modules/hunting";
import { getItemQuantity } from "@/modules/inventory";
import type { HuntLogEntry } from "@/modules/hunting/model/HuntReward";
import { useGameApp } from "@/ui/hooks/useGameApp";
import { useHuntingSandbox } from "@/ui/hooks/useHuntingSandbox";

interface HuntingScreenProps {
  onBack: () => void;
}

type ActivePanel = "routes" | "status" | "profile";
type HuntLogFilter = "all" | "wins" | "losses" | "loot";

export function HuntingScreen({ onBack }: HuntingScreenProps) {
  const { logger } = useGameApp();
  const [showLootPopup, setShowLootPopup] = useState(false);
  const [activePanel, setActivePanel] = useState<ActivePanel>("routes");
  const [huntLogFilter, setHuntLogFilter] = useState<HuntLogFilter>("all");
  const {
    profile,
    inventory,
    huntState,
    selectedZone,
    selectedZoneId,
    activeZone,
    activePet,
    lastClaimed,
    recentClaims,
    wasRestoredFromSave,
    routeElapsedMs,
    routeRemainingMs,
    routeReadyToResolve,
    routeStances,
    toolCatalog,
    setSelectedZoneId,
    startSelectedHunt,
    resolveActiveHunt,
    claimActiveReward,
    equipToolByCode,
    setRouteStanceById,
  } = useHuntingSandbox();

  const routeProgressPercent =
    huntState.status === "hunting" && huntState.durationMs > 0
      ? Math.min(100, Math.max(0, (routeElapsedMs / huntState.durationMs) * 100))
      : huntState.status === "claimable"
        ? 100
        : 0;
  const reverseProgressPercent = 100 - routeProgressPercent;
  const miniInventoryItems = [
    { itemCode: "wood", label: "Wood", accent: "earth" },
    { itemCode: "herbs", label: "Herbs", accent: "grove" },
    { itemCode: "hide", label: "Hide", accent: "hide" },
    { itemCode: "ore", label: "Ore", accent: "steel" },
    { itemCode: "bone", label: "Bone", accent: "bone" },
    { itemCode: "relic", label: "Relic", accent: "arcane" },
    { itemCode: "egg", label: "Egg", accent: "sun" },
  ];
  const filteredPendingLog = filterHuntLog(huntState.pendingReward.log, huntLogFilter);
  const filteredClaimedLog = filterHuntLog(lastClaimed?.reward.log ?? [], huntLogFilter);
  const hunterStepCost = getHunterLevelStepCost(profile.level, profile.levelStep);
  const hunterExpPercent = hunterStepCost ? Math.min(100, Math.max(0, (profile.levelProgress / hunterStepCost) * 100)) : 100;
  const activePetStepCost = activePet ? getHuntingPetLevelStepCost(activePet.level) : null;
  const activePetExpPercent =
    activePet && activePetStepCost
      ? Math.min(100, Math.max(0, (activePet.levelProgress / activePetStepCost) * 100))
      : activePet
        ? 100
        : 0;

  useEffect(() => {
    if (!lastClaimed) {
      return;
    }

    setShowLootPopup(true);
    const timer = window.setTimeout(() => setShowLootPopup(false), 8000);
    return () => window.clearTimeout(timer);
  }, [lastClaimed]);

  return (
    <section className="hunting-lodge hunting-lodge--compact">
      {showLootPopup && lastClaimed ? (
        <aside className="hunting-lodge__loot-popup" aria-live="polite">
          <div className="hunting-lodge__loot-popup-label">Route Reward Secured</div>
          <div className="hunting-lodge__loot-popup-title">{lastClaimed.reward.currency} camp coins banked</div>
          <div className="hunting-lodge__loot-popup-copy">
            {lastClaimed.reward.experience} hunter EXP, {lastClaimed.reward.petExperience} pet EXP
          </div>
          <div className="hunting-lodge__loot-popup-tags">
            {lastClaimed.reward.items.slice(0, 4).map((entry) => (
              <span key={entry.itemCode} className="hunting-lodge__loot-pill">
                +{entry.quantity} {entry.itemCode}
              </span>
            ))}
          </div>
        </aside>
      ) : null}

      <div className="hunting-lodge__hero">
        <div className="hunting-lodge__panel">
          <p className="hunting-lodge__eyebrow">Autonomous Hunting Module</p>
          <h1 className="hunting-lodge__title">Hunting Lodge</h1>
          <p
            className="hunting-lodge__copy"
            title="Pick a route, wait for the timer, resolve the run, and claim shared rewards."
          >
            Pick route, wait, resolve, claim.
          </p>

          {wasRestoredFromSave ? (
            <div className="hunting-lodge__restore-banner">
              <div className="hunting-lodge__restore-title">Restored Saved Hunting State</div>
              <div className="hunting-lodge__restore-copy">
                Lodge progress, route state and rewards were restored from local save data.
              </div>
              {huntState.status === "hunting" ? (
                <div className="hunting-lodge__restore-meta">
                  {routeReadyToResolve
                    ? "The saved route has finished and is ready to resolve."
                    : `The saved route is still running. ${formatDuration(routeRemainingMs)} remaining.`}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="hunting-lodge__flow-strip">
            <div className={["hunting-lodge__flow-step", selectedZone ? "hunting-lodge__flow-step--active" : ""].filter(Boolean).join(" ")}>1. Route</div>
            <div
              className={[
                "hunting-lodge__flow-step",
                huntState.status === "hunting" || huntState.status === "claimable" ? "hunting-lodge__flow-step--active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              2. Run
            </div>
            <div
              className={["hunting-lodge__flow-step", huntState.status === "claimable" ? "hunting-lodge__flow-step--active" : ""].filter(Boolean).join(" ")}
            >
              3. Review
            </div>
            <div className={["hunting-lodge__flow-step", lastClaimed ? "hunting-lodge__flow-step--active" : ""].filter(Boolean).join(" ")}>4. Claim</div>
          </div>

          <div className="hunting-lodge__actions">
            <button
              type="button"
              className="main-menu__cta"
              onClick={() => {
                logger.info("Returned from hunting lodge");
                onBack();
              }}
            >
              Back
            </button>
            <button
              type="button"
              className={["main-menu__ghost", huntState.status === "idle" && selectedZone ? "hunting-lodge__action-button hunting-lodge__action-button--ready" : ""].filter(Boolean).join(" ")}
              onClick={() => {
                if (startSelectedHunt()) {
                  logger.info("Hunting session started");
                }
              }}
              disabled={huntState.status !== "idle" || !selectedZone}
            >
              Start
            </button>
            <button
              type="button"
              className={["main-menu__ghost", routeReadyToResolve ? "hunting-lodge__action-button hunting-lodge__action-button--resolve" : ""].filter(Boolean).join(" ")}
              onClick={() => {
                if (resolveActiveHunt()) {
                  logger.info("Hunting session resolved");
                }
              }}
              disabled={huntState.status !== "hunting" || !routeReadyToResolve}
            >
              Resolve
            </button>
            <button
              type="button"
              className={["main-menu__ghost", huntState.status === "claimable" ? "hunting-lodge__action-button hunting-lodge__action-button--claim" : ""].filter(Boolean).join(" ")}
              onClick={() => {
                if (claimActiveReward()) {
                  logger.info("Hunting rewards claimed");
                }
              }}
              disabled={huntState.status !== "claimable"}
            >
              Claim
            </button>
          </div>

          <div className={["hunting-lodge__route-console", routeReadyToResolve ? "hunting-lodge__route-console--ready" : "", huntState.status === "claimable" ? "hunting-lodge__route-console--claimable" : ""].filter(Boolean).join(" ")}>
            <div className="hunting-lodge__route-console-head">
              <div>
                <div className="hunting-lodge__section-label">Route Console</div>
                <div className="hunting-lodge__route-console-title">{activeZone ? activeZone.name : "No route selected"}</div>
              </div>
              <div className="hunting-lodge__route-state">{formatHuntStatus(huntState.status)}</div>
            </div>
            <div className="hunting-lodge__route-console-copy">
              {huntState.status === "hunting"
                ? `${formatDuration(routeRemainingMs)} remains before the party returns.`
                : huntState.status === "claimable"
                  ? "Route complete. Review and claim."
                  : "Choose a route and dispatch."}
            </div>
            <div className="hunting-lodge__countdown">
              <div className="hunting-lodge__countdown-track">
                <div className="hunting-lodge__countdown-fill" style={{ width: `${reverseProgressPercent}%` }} />
              </div>
              <div className="hunting-lodge__countdown-meta">
                <span>{huntState.status === "hunting" ? "Time left" : "Route state"}</span>
                <strong>{huntState.status === "hunting" ? formatDuration(routeRemainingMs) : huntState.status === "claimable" ? "Ready" : "Idle"}</strong>
              </div>
            </div>
          </div>
        </div>

        <aside className="hunting-lodge__snapshot">
          <div className={["hunting-lodge__hud-card", "hunting-lodge__hud-card--route", routeReadyToResolve ? "hunting-lodge__hud-card--route-ready" : ""].filter(Boolean).join(" ")}>
            <div className="hunting-lodge__snapshot-label">Active Route HUD</div>
            <div className="hunting-lodge__hud-route-name">{activeZone ? activeZone.name : "No active route"}</div>
            <div className="hunting-lodge__hud-route-meta">
              <span>Hunter {profile.name}</span>
              <span>Lv {profile.level}</span>
            </div>
            <div className="hunting-lodge__hud-route-meta">
              <span>Stance</span>
              <span>{routeStances.find((entry) => entry.id === profile.routeStanceId)?.name ?? "Steady"}</span>
            </div>
            <div className="hunting-lodge__hud-route-status">
              <div className="hunting-lodge__hud-route-state">{formatHuntStatus(huntState.status)}</div>
              <div className="hunting-lodge__hud-route-timer">{huntState.status === "hunting" ? formatDuration(routeRemainingMs) : huntState.status === "claimable" ? "Ready" : "Idle"}</div>
            </div>
            <div className="hunting-lodge__hud-route-progress">
              <div className="hunting-lodge__hud-route-progress-track">
                <div className="hunting-lodge__hud-route-progress-fill" style={{ width: `${routeProgressPercent}%` }} />
              </div>
            </div>
          </div>

          <div className="hunting-lodge__snapshot-grid">
            <div className="hunting-lodge__snapshot-card">
              <div className="hunting-lodge__snapshot-label">Hunter</div>
              <div className="hunting-lodge__snapshot-value">{profile.name}</div>
            </div>
            <div className="hunting-lodge__snapshot-card">
              <div className="hunting-lodge__snapshot-label">Level</div>
              <div className="hunting-lodge__snapshot-value">{profile.level}</div>
            </div>
          </div>

          <div className="hunting-lodge__hud-card">
            <div className="hunting-lodge__snapshot-label">Hunter EXP</div>
            <div
              className="hunting-lodge__progress"
              title={
                hunterStepCost
                  ? `Level ${profile.level} step ${profile.levelStep + 1}: ${profile.levelProgress} / ${hunterStepCost} EXP`
                  : "Current hunter level has reached the end of the configured progression curve."
              }
            >
              <div className="hunting-lodge__progress-track">
                <div className="hunting-lodge__progress-fill" style={{ width: `${hunterExpPercent}%` }} />
              </div>
              <div className="hunting-lodge__progress-meta">
                <span>Next step</span>
                <span>{hunterStepCost ? `${profile.levelProgress}/${hunterStepCost}` : "Capped"}</span>
              </div>
            </div>
          </div>

          <div className="hunting-lodge__hud-card">
            <div className="hunting-lodge__snapshot-label">Companion</div>
            <div className="hunting-lodge__pet-name">{activePet ? activePet.name : "No pet assigned"}</div>
            <div className="hunting-lodge__hud-route-meta">
              <span>{activePet ? activePet.species : "No species"}</span>
              <span>{activePet ? activePet.rarity : "No rarity"}</span>
            </div>
            {activePet ? (
              <div
                className="hunting-lodge__progress"
                title={
                  activePetStepCost
                    ? `${activePet.name}: ${activePet.levelProgress} / ${activePetStepCost} pet EXP to level ${activePet.level + 1}`
                    : `${activePet.name} has reached the end of the current pet level curve.`
                }
              >
                <div className="hunting-lodge__progress-track">
                  <div className="hunting-lodge__progress-fill" style={{ width: `${activePetExpPercent}%` }} />
                </div>
                <div className="hunting-lodge__progress-meta">
                  <span>Pet EXP</span>
                  <span>{activePetStepCost ? `${activePet.levelProgress}/${activePetStepCost}` : "Capped"}</span>
                </div>
              </div>
            ) : null}
            {activePet ? (
              <div className="hunting-lodge__pet-traits">
                <span className="hunting-lodge__tag" title="Companion hunt speed bonus">Speed +{activePet.traits.huntSpeedPercent}%</span>
                <span className="hunting-lodge__tag" title="Companion survival bonus">Survival +{activePet.traits.survivalPercent}%</span>
                <span className="hunting-lodge__tag" title="Companion rare drop bonus">Rare +{activePet.traits.rareDropPercent}%</span>
              </div>
            ) : null}
          </div>

          <div className="hunting-lodge__hud-card">
            <div className="hunting-lodge__snapshot-label">Quick Stash</div>
            <div className="hunting-lodge__mini-inventory">
              {miniInventoryItems.map((entry) => (
                <div key={entry.itemCode} className={`hunting-lodge__mini-slot hunting-lodge__mini-slot--${entry.accent}`} title={`${entry.label}: ${getItemQuantity(inventory, entry.itemCode)}`}>
                  <div className="hunting-lodge__mini-slot-name">{entry.label}</div>
                  <div className="hunting-lodge__mini-slot-value">{getItemQuantity(inventory, entry.itemCode)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="hunting-lodge__hud-card">
            <div className="hunting-lodge__snapshot-label">Latest Haul</div>
            {lastClaimed ? (
              <>
                <div className="hunting-lodge__hud-haul-value">{lastClaimed.reward.currency} coins · {lastClaimed.reward.experience} EXP</div>
                <div className="hunting-lodge__hud-haul-meta">{formatTimeAgo(lastClaimed.claimedAt)}</div>
                <div className="hunting-lodge__loot-popup-tags">
                  {lastClaimed.reward.items.slice(0, 3).map((entry) => (
                    <span key={entry.itemCode} className="hunting-lodge__loot-pill">
                      {entry.itemCode} x{entry.quantity}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <div className="hunting-lodge__hud-haul-meta">No routes claimed yet.</div>
            )}
          </div>
        </aside>
      </div>

      <div className="hunting-lodge__grid hunting-lodge__grid--compact">
        <div className="hunting-lodge__section hunting-lodge__section--tabbed">
          <div className="hunting-lodge__section-tabs" role="tablist" aria-label="Hunting panels">
            {(["routes", "status", "profile"] as const).map((panel) => (
              <button
                key={panel}
                type="button"
                className={["hunting-lodge__section-tab", activePanel === panel ? "hunting-lodge__section-tab--active" : ""].filter(Boolean).join(" ")}
                onClick={() => setActivePanel(panel)}
              >
                {panel === "routes" ? "Routes" : panel === "status" ? "Status" : "Profile"}
              </button>
            ))}
          </div>

          {activePanel === "routes" ? (
            <>
              <div className="hunting-lodge__section-head">
                <div>
                  <div className="hunting-lodge__section-label">Route Board</div>
                  <h2 className="hunting-lodge__section-title">Choose Hunting Zone</h2>
                </div>
                <div className="hunting-lodge__hint">
                  {selectedZone ? `${getZoneRiskLabel(selectedZone.dangerRating)} route · ${getZoneLootProfile(selectedZone)}` : "Unlocked by hunter level"}
                </div>
              </div>
              <div className="hunting-lodge__zone-list">
                {huntingZones.map((zone) => {
                  const unlocked = profile.unlockedZoneIds.includes(zone.id);
                  const isActiveRoute = activeZone?.id === zone.id && huntState.status === "hunting";
                  const isClaimableRoute = activeZone?.id === zone.id && huntState.status === "claimable";
                  const showExpandedZoneDetails = selectedZoneId === zone.id || isActiveRoute || isClaimableRoute;

                  return (
                    <button
                      key={zone.id}
                      type="button"
                      className={[
                        "hunting-lodge__zone-card",
                        selectedZoneId === zone.id ? "hunting-lodge__zone-card--active" : "",
                        !unlocked ? "hunting-lodge__zone-card--locked" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      disabled={!unlocked || huntState.status === "hunting"}
                      onClick={() => setSelectedZoneId(zone.id)}
                      title={`${zone.name} · ${zone.durationMinutes}m · danger ${zone.dangerRating} · ${zone.resourceTags.join(", ")}`}
                    >
                      <div className="hunting-lodge__zone-head">
                        <div className="hunting-lodge__zone-name-wrap">
                          <div className="hunting-lodge__zone-icon" aria-hidden="true">
                            {getZoneIcon(zone.id)}
                          </div>
                          <div className="hunting-lodge__zone-name">{zone.name}</div>
                        </div>
                        <span className="hunting-lodge__zone-pill">
                          {isActiveRoute ? "Running" : isClaimableRoute ? "Ready" : unlocked ? `Lv ${zone.minHunterLevel}+` : "Locked"}
                        </span>
                      </div>
                      <div className="hunting-lodge__zone-meta">
                        <span>{zone.durationMinutes} min route</span>
                        <span>Danger {zone.dangerRating}</span>
                        <span>Base {zone.baseCurrencyReward} coins</span>
                      </div>
                      <div className="hunting-lodge__zone-threat">
                        <div className="hunting-lodge__zone-threat-label">Threat</div>
                        <div className="hunting-lodge__zone-threat-pips">
                          {Array.from({ length: 3 }, (_, index) => (
                            <span
                              key={index}
                              className={[
                                "hunting-lodge__zone-threat-pip",
                                index < zone.dangerRating ? "hunting-lodge__zone-threat-pip--filled" : "",
                              ]
                                .filter(Boolean)
                                .join(" ")}
                            />
                          ))}
                        </div>
                      </div>
                      {showExpandedZoneDetails ? (
                        <>
                          <div className="hunting-lodge__zone-tags">
                            {zone.resourceTags.map((tag) => (
                              <span key={tag} className="hunting-lodge__tag">
                                {getResourceLabel(tag)}
                              </span>
                            ))}
                          </div>
                          <div className="hunting-lodge__zone-loot-preview">
                            {zone.resourceTags.map((tag) => (
                              <div key={tag} className="hunting-lodge__zone-loot-chip">
                                <span className="hunting-lodge__zone-loot-icon" aria-hidden="true">
                                  {getResourceIcon(tag)}
                                </span>
                                <span>{getLootPreview(tag)}</span>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : null}
                      <div className="hunting-lodge__zone-footer">
                        <span>{getZoneRiskLabel(zone.dangerRating)}</span>
                        <span>{getZoneLootProfile(zone)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          ) : null}

          {activePanel === "status" ? (
            <>
              <div className="hunting-lodge__section-head">
                <div>
                  <div className="hunting-lodge__section-label">Live Session</div>
                  <h2 className="hunting-lodge__section-title">Hunt Status</h2>
                </div>
                <div className="hunting-lodge__hint">
                  {activeZone ? `${activeZone.name} - ${describeNextAction(huntState.status)}` : "No route selected"}
                </div>
              </div>
              <div className="hunting-lodge__status-grid">
                <div className="hunting-lodge__status-card">
                  <div className="hunting-lodge__status-label">Current State</div>
                  <div className="hunting-lodge__status-value">{formatHuntStatus(huntState.status)}</div>
                </div>
                <div className="hunting-lodge__status-card">
                  <div className="hunting-lodge__status-label" title="Resolved route encounters">Encounters</div>
                  <div className="hunting-lodge__status-value">{huntState.encountersResolved}</div>
                </div>
                <div className="hunting-lodge__status-card">
                  <div className="hunting-lodge__status-label" title="Successes / Failures">W / L</div>
                  <div className="hunting-lodge__status-value">{huntState.successCount}/{huntState.failureCount}</div>
                </div>
                <div className="hunting-lodge__status-card">
                  <div className="hunting-lodge__status-label" title="Elapsed / Remaining">Timer</div>
                  <div className="hunting-lodge__status-value">
                    {huntState.status === "hunting"
                      ? `${formatDuration(routeElapsedMs)} / ${formatDuration(routeRemainingMs)}`
                      : "0:00 / 0:00"}
                  </div>
                </div>
              </div>

              {huntState.status === "hunting" ? (
                <div className="hunting-lodge__session-banner">
                  <div className="hunting-lodge__session-banner-title">Party In The Field</div>
                  <div className="hunting-lodge__session-banner-copy">Route is running in the background.</div>
                </div>
              ) : null}

              {huntState.status === "claimable" ? (
                <div className="hunting-lodge__reward-card">
                  <div className="hunting-lodge__reward-head">
                    <div className="hunting-lodge__section-label">Pending Reward</div>
                    <div className="hunting-lodge__hint">{huntState.pendingReward.summary.elapsedSeconds}s simulated</div>
                  </div>
                  <div className="hunting-lodge__reward-strip">
                    <div>
                      <div className="hunting-lodge__reward-value">{huntState.pendingReward.currency}</div>
                      <div className="hunting-lodge__reward-label">Currency</div>
                    </div>
                    <div>
                      <div className="hunting-lodge__reward-value">{huntState.pendingReward.experience}</div>
                      <div className="hunting-lodge__reward-label">Hunter EXP</div>
                    </div>
                    <div>
                      <div className="hunting-lodge__reward-value">{huntState.pendingReward.petExperience}</div>
                      <div className="hunting-lodge__reward-label">Pet EXP</div>
                    </div>
                  </div>
                  <div className="hunting-lodge__reward-tags">
                    {huntState.pendingReward.items.slice(0, 4).map((entry) => (
                      <span key={entry.itemCode} className="hunting-lodge__tag">
                        {entry.itemCode} x{entry.quantity}
                      </span>
                    ))}
                  </div>
                  <div className="hunting-lodge__hunt-log">
                    <div className="hunting-lodge__reward-head">
                      <div className="hunting-lodge__section-label">Hunt Log</div>
                      <div className="hunting-lodge__section-tabs" role="tablist" aria-label="Hunt log filter">
                        {(["all", "wins", "losses", "loot"] as const).map((filter) => (
                          <button
                            key={filter}
                            type="button"
                            className={[
                              "hunting-lodge__section-tab",
                              huntLogFilter === filter ? "hunting-lodge__section-tab--active" : "",
                            ]
                              .filter(Boolean)
                              .join(" ")}
                            onClick={() => setHuntLogFilter(filter)}
                          >
                            {filter === "all"
                              ? "All"
                              : filter === "wins"
                                ? "Wins"
                                : filter === "losses"
                                  ? "Losses"
                                  : "Loot"}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="hunting-lodge__hunt-log-list">
                      {filteredPendingLog.map((entry) => (
                        <div key={entry.id} className="hunting-lodge__hunt-log-row">
                          <div>
                            <div className="hunting-lodge__hunt-log-title">
                              <span className="hunting-lodge__hunt-log-icon" aria-hidden="true">
                                {getHuntEnemyIcon(entry.enemy)}
                              </span>
                              {entry.enemy} · {entry.outcome === "win" ? "Victory" : "Retreat"}
                            </div>
                            <div className="hunting-lodge__hunt-log-meta">
                              {entry.note}
                              {entry.loot ? ` Loot: ${entry.loot}` : ""}
                            </div>
                          </div>
                          <span
                            className={[
                              "hunting-lodge__tag",
                              entry.outcome === "win" ? "hunting-lodge__tag--success" : "hunting-lodge__tag--danger",
                            ]
                              .filter(Boolean)
                              .join(" ")}
                          >
                            {entry.outcome === "win" ? "Win" : "Loss"}
                          </span>
                        </div>
                      ))}
                      {filteredPendingLog.length === 0 ? <div className="hunting-lodge__empty">No entries for this filter.</div> : null}
                    </div>
                  </div>
                </div>
              ) : lastClaimed ? (
                <div className="hunting-lodge__reward-card hunting-lodge__reward-card--claimed">
                  <div className="hunting-lodge__section-label">Last Claimed Route</div>
                  <div className="hunting-lodge__reward-strip">
                    <div>
                      <div className="hunting-lodge__reward-value">{lastClaimed.reward.currency}</div>
                      <div className="hunting-lodge__reward-label">Currency</div>
                    </div>
                    <div>
                      <div className="hunting-lodge__reward-value">{lastClaimed.reward.experience}</div>
                      <div className="hunting-lodge__reward-label">Hunter EXP</div>
                    </div>
                    <div>
                      <div className="hunting-lodge__reward-value">{lastClaimed.reward.items.length}</div>
                      <div className="hunting-lodge__reward-label">Loot Entries</div>
                    </div>
                  </div>
                  <div className="hunting-lodge__hunt-log">
                    <div className="hunting-lodge__reward-head">
                      <div className="hunting-lodge__section-label">Hunt Log</div>
                      <div className="hunting-lodge__section-tabs" role="tablist" aria-label="Last hunt log filter">
                        {(["all", "wins", "losses", "loot"] as const).map((filter) => (
                          <button
                            key={filter}
                            type="button"
                            className={[
                              "hunting-lodge__section-tab",
                              huntLogFilter === filter ? "hunting-lodge__section-tab--active" : "",
                            ]
                              .filter(Boolean)
                              .join(" ")}
                            onClick={() => setHuntLogFilter(filter)}
                          >
                            {filter === "all"
                              ? "All"
                              : filter === "wins"
                                ? "Wins"
                                : filter === "losses"
                                  ? "Losses"
                                  : "Loot"}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="hunting-lodge__hunt-log-list">
                      {filteredClaimedLog.map((entry) => (
                        <div key={entry.id} className="hunting-lodge__hunt-log-row">
                          <div>
                            <div className="hunting-lodge__hunt-log-title">
                              <span className="hunting-lodge__hunt-log-icon" aria-hidden="true">
                                {getHuntEnemyIcon(entry.enemy)}
                              </span>
                              {entry.enemy} · {entry.outcome === "win" ? "Victory" : "Retreat"}
                            </div>
                            <div className="hunting-lodge__hunt-log-meta">
                              {entry.note}
                              {entry.loot ? ` Loot: ${entry.loot}` : ""}
                            </div>
                          </div>
                          <span
                            className={[
                              "hunting-lodge__tag",
                              entry.outcome === "win" ? "hunting-lodge__tag--success" : "hunting-lodge__tag--danger",
                            ]
                              .filter(Boolean)
                              .join(" ")}
                          >
                            {entry.outcome === "win" ? "Win" : "Loss"}
                          </span>
                        </div>
                      ))}
                      {filteredClaimedLog.length === 0 ? <div className="hunting-lodge__empty">No entries for this filter.</div> : null}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="hunting-lodge__empty">Start a route and wait for the timer to finish.</div>
              )}
            </>
          ) : null}

          {activePanel === "profile" ? (
            <>
              <div className="hunting-lodge__section-head">
                <div>
                  <div className="hunting-lodge__section-label">Hunter Profile</div>
                  <h2 className="hunting-lodge__section-title">Stats & Loadout</h2>
                </div>
                <div className="hunting-lodge__hint">{profile.unspentStatPoints} unspent points</div>
              </div>
              <div className="hunting-lodge__stat-row">
                <div className="hunting-lodge__stat-chip">Power {profile.stats.power}</div>
                <div className="hunting-lodge__stat-chip">Speed {profile.stats.speed}</div>
                <div className="hunting-lodge__stat-chip">Survival {profile.stats.survival}</div>
                <div className="hunting-lodge__stat-chip">Fortune {profile.stats.fortune}</div>
              </div>
              <div
                className="hunting-lodge__progress"
                title={
                  hunterStepCost
                    ? `Level ${profile.level} step ${profile.levelStep + 1}: ${profile.levelProgress} / ${hunterStepCost} EXP`
                    : "Current hunter level has reached the end of the configured progression curve."
                }
              >
                <div className="hunting-lodge__progress-track">
                  <div className="hunting-lodge__progress-fill" style={{ width: `${hunterExpPercent}%` }} />
                </div>
                <div className="hunting-lodge__progress-meta">
                  <span>Hunter EXP</span>
                  <span>{hunterStepCost ? `${profile.levelProgress}/${hunterStepCost}` : "Capped"}</span>
                </div>
              </div>
              <div className="hunting-lodge__gear-list">
                {profile.gear.map((entry) => (
                  <div key={entry.slot} className="hunting-lodge__gear-row" title={entry.item?.name ?? "Empty slot"}>
                    <div className="hunting-lodge__gear-slot">{entry.slot}</div>
                    <div className="hunting-lodge__gear-name">{entry.item?.name ?? "Empty slot"}</div>
                  </div>
                ))}
              </div>
              <div className="hunting-lodge__tool-kit">
                <div className="hunting-lodge__section-label">Tool Focus</div>
                <div className="hunting-lodge__tool-grid">
                  {toolCatalog.map((tool) => {
                    const masteryLevel = getHuntingToolMasteryLevel(profile.toolMastery[tool.itemCode] ?? 0);
                    return (
                    <button
                      key={tool.itemCode}
                      type="button"
                      className={[
                        "hunting-lodge__tool-chip",
                        profile.tool?.item?.itemCode === tool.itemCode ? "hunting-lodge__tool-chip--active" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      title={`${tool.name}: ${tool.description}`}
                      onClick={() => {
                        if (equipToolByCode(tool.itemCode)) {
                          logger.info(`Equipped hunting tool ${tool.itemCode}`);
                        }
                      }}
                    >
                      <span className="hunting-lodge__tool-name">
                        {tool.name}
                        {masteryLevel > 0 ? ` · M${masteryLevel}` : ""}
                      </span>
                      <span className="hunting-lodge__tool-meta">
                        {tool.targetResourceTags.join(", ")} · +{tool.bonuses.targetedYieldPercent}%
                      </span>
                    </button>
                    );
                  })}
                </div>
              </div>
              <div className="hunting-lodge__tool-kit">
                <div className="hunting-lodge__section-label">Route Stance</div>
                <div className="hunting-lodge__tool-grid">
                  {routeStances.map((stance) => (
                    <button
                      key={stance.id}
                      type="button"
                      className={[
                        "hunting-lodge__tool-chip",
                        profile.routeStanceId === stance.id ? "hunting-lodge__tool-chip--active" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      title={`${stance.name}: ${stance.description}`}
                      onClick={() => {
                        if (setRouteStanceById(stance.id)) {
                          logger.info(`Selected hunting route stance ${stance.id}`);
                        }
                      }}
                    >
                      <span className="hunting-lodge__tool-name">{stance.name}</span>
                      <span className="hunting-lodge__tool-meta">
                        {stance.bonuses.rewardQuantityPercent >= 0 ? "+" : ""}
                        {stance.bonuses.rewardQuantityPercent}% haul · {stance.bonuses.successRateBonus >= 0 ? "+" : ""}
                        {Math.round(stance.bonuses.successRateBonus * 100)}% clear
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>

        <div className="hunting-lodge__section">
          <div className="hunting-lodge__section-head">
            <div>
              <div className="hunting-lodge__section-label">Route Ledger</div>
              <h2 className="hunting-lodge__section-title">Recent Hauls</h2>
            </div>
            <div className="hunting-lodge__hint">{recentClaims.length} stored reports</div>
          </div>
          {recentClaims.length ? (
            <div className="hunting-lodge__ledger-list">
              {recentClaims.slice(0, 3).map((entry) => (
                <div key={entry.claimedAt} className="hunting-lodge__ledger-row">
                  <div>
                    <div className="hunting-lodge__ledger-title">
                      {entry.reward.currency} coins · {entry.reward.experience} EXP
                    </div>
                    <div className="hunting-lodge__ledger-meta">
                      {entry.reward.items.slice(0, 3).map((item) => `${item.itemCode} x${item.quantity}`).join(" · ")}
                    </div>
                  </div>
                  <div className="hunting-lodge__ledger-time">{formatTimeAgo(entry.claimedAt)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="hunting-lodge__empty">Claimed route summaries will appear here.</div>
          )}
        </div>
      </div>
    </section>
  );
}

function formatHuntStatus(status: string) {
  switch (status) {
    case "idle":
      return "Idle";
    case "hunting":
      return "On Route";
    case "claimable":
      return "Ready To Claim";
    case "completed":
      return "Completed";
    default:
      return status;
  }
}

function describeNextAction(status: string) {
  switch (status) {
    case "idle":
      return "start a route";
    case "hunting":
      return "wait for the route to finish";
    case "claimable":
      return "claim pending rewards";
    default:
      return "continue";
  }
}

function filterHuntLog(entries: HuntLogEntry[], filter: HuntLogFilter) {
  switch (filter) {
    case "wins":
      return entries.filter((entry) => entry.outcome === "win");
    case "losses":
      return entries.filter((entry) => entry.outcome === "loss");
    case "loot":
      return entries.filter((entry) => entry.loot !== null);
    default:
      return entries;
  }
}

function getHuntEnemyIcon(enemy: string) {
  const value = enemy.toLowerCase();
  if (value.includes("wolf") || value.includes("hyena")) {
    return "\uD83D\uDC3A";
  }
  if (value.includes("boar") || value.includes("stoneback")) {
    return "\uD83D\uDC17";
  }
  if (value.includes("vulture")) {
    return "\uD83E\uDDA4";
  }
  if (value.includes("shade")) {
    return "\uD83D\uDC7B";
  }
  if (value.includes("bandit") || value.includes("raider") || value.includes("scavenger")) {
    return "\u2694";
  }
  return "\u2726";
}

function formatDuration(durationMs: number) {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function formatTimeAgo(timestamp: number) {
  const diffSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (diffSeconds < 60) {
    return `${diffSeconds}s ago`;
  }

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  return `${diffHours}h ago`;
}

function getZoneRiskLabel(dangerRating: number) {
  switch (dangerRating) {
    case 1:
      return "Low risk";
    case 2:
      return "Balanced risk";
    case 3:
      return "High risk";
    default:
      return "Unknown risk";
  }
}

function getZoneLootProfile(zone: { resourceTags: readonly string[] }) {
  if (zone.resourceTags.includes("egg") || zone.resourceTags.includes("relic")) {
    return "Rare salvage";
  }

  if (zone.resourceTags.includes("ore") || zone.resourceTags.includes("bone")) {
    return "Heavy materials";
  }

  return "Starter resources";
}

function getResourceLabel(tag: string) {
  switch (tag) {
    case "wood":
      return "Timber";
    case "herbs":
      return "Herbs";
    case "hide":
      return "Hide";
    case "ore":
      return "Ore";
    case "bone":
      return "Bone";
    case "relic":
      return "Relic";
    case "egg":
      return "Egg";
    default:
      return tag;
  }
}

function getZoneIcon(zoneId: string) {
  switch (zoneId) {
    case "forest-edge":
      return "\uD83C\uDF32";
    case "rocky-hills":
      return "\u26F0";
    case "ruined-trail":
      return "\uD83C\uDFDB";
    default:
      return "\u25C8";
  }
}

function getResourceIcon(tag: string) {
  switch (tag) {
    case "wood":
      return "\uD83E\uDEB5";
    case "herbs":
      return "\uD83C\uDF3F";
    case "hide":
      return "\uD83E\uDD8C";
    case "ore":
      return "\u26CF";
    case "bone":
      return "\u2620";
    case "relic":
      return "\u2726";
    case "egg":
      return "\uD83E\uDD5A";
    default:
      return "\u25E6";
  }
}

function getLootPreview(tag: string) {
  switch (tag) {
    case "wood":
      return "timber caches";
    case "herbs":
      return "field herbs";
    case "hide":
      return "game hide";
    case "ore":
      return "ore veins";
    case "bone":
      return "bone shards";
    case "relic":
      return "relic salvage";
    case "egg":
      return "rare nests";
    default:
      return tag;
  }
}
