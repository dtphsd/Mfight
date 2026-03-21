import type { CSSProperties } from "react";
import type { OnlineDuelClient, OnlineDuelRoundSummary } from "@/modules/arena";
import { combatZones, type CombatZone } from "@/modules/combat";
import type { RoundDraft } from "@/orchestration/combat/roundDraft";

const zoneLabels: Record<CombatZone, string> = {
  head: "Head",
  chest: "Chest",
  belly: "Belly",
  waist: "Waist",
  legs: "Legs",
};

function capitalizeLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function RoundPlannerCard({
  draft,
  mode,
  onAttackZoneChange,
  onDefenseZoneToggle,
  plannerCardStyle,
  sectionHeadStyle,
  eyebrowStyle,
  chipStyle,
  plannerLabelStyle,
  plannerZoneRowStyle,
  plannerPrimaryButtonStyle,
  plannerGhostButtonStyle,
}: {
  draft: RoundDraft;
  mode: string;
  onAttackZoneChange: (zone: CombatZone) => void;
  onDefenseZoneToggle: (zone: CombatZone) => void;
  plannerCardStyle: CSSProperties;
  sectionHeadStyle: CSSProperties;
  eyebrowStyle: CSSProperties;
  chipStyle: CSSProperties;
  plannerLabelStyle: CSSProperties;
  plannerZoneRowStyle: CSSProperties;
  plannerPrimaryButtonStyle: CSSProperties;
  plannerGhostButtonStyle: CSSProperties;
}) {
  return (
    <div style={plannerCardStyle}>
      <div style={sectionHeadStyle}>
        <span style={eyebrowStyle}>Round Plan</span>
        <span style={chipStyle}>
          {zoneLabels[draft.attackZone]} / Guard {draft.defenseZones.map((zone) => zoneLabels[zone]).join(" + ")}
        </span>
      </div>
      <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
        <div>
          <div style={plannerLabelStyle}>Attack Zone</div>
          <div style={plannerZoneRowStyle}>
            {combatZones.map((zone) => {
              const selected = draft.attackZone === zone;
              return (
                <button
                  key={`${mode}-attack-${zone}`}
                  type="button"
                  onClick={() => onAttackZoneChange(zone)}
                  aria-label={`${capitalizeLabel(mode)} attack zone ${zone}`}
                  style={selected ? plannerPrimaryButtonStyle : plannerGhostButtonStyle}
                >
                  {zoneLabels[zone]}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <div style={plannerLabelStyle}>Defense Zones</div>
          <div style={plannerZoneRowStyle}>
            {combatZones.map((zone) => {
              const selected = draft.defenseZones.includes(zone);
              return (
                <button
                  key={`${mode}-defense-${zone}`}
                  type="button"
                  onClick={() => onDefenseZoneToggle(zone)}
                  aria-label={`${capitalizeLabel(mode)} defense zone ${zone}`}
                  style={selected ? plannerPrimaryButtonStyle : plannerGhostButtonStyle}
                >
                  {zoneLabels[zone]}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export function RoundResultCard({
  summary,
  panelStyle,
  sectionHeadStyle,
  eyebrowStyle,
  chipStyle,
  helperTextStyle,
  statStripStyle,
  statCardStyle,
  statLabelStyle,
  statValueStyle,
  messageCardStyle,
  messageMetaStyle,
}: {
  summary: OnlineDuelRoundSummary | null;
  panelStyle: CSSProperties;
  sectionHeadStyle: CSSProperties;
  eyebrowStyle: CSSProperties;
  chipStyle: CSSProperties;
  helperTextStyle: CSSProperties;
  statStripStyle: CSSProperties;
  statCardStyle: CSSProperties;
  statLabelStyle: CSSProperties;
  statValueStyle: CSSProperties;
  messageCardStyle: CSSProperties;
  messageMetaStyle: CSSProperties;
}) {
  if (!summary) {
    return (
      <article style={panelStyle}>
        <div style={sectionHeadStyle}>
          <span style={eyebrowStyle}>Round Result</span>
          <span style={chipStyle}>Waiting</span>
        </div>
        <p style={helperTextStyle}>Resolve a round to see the exchange summary here.</p>
      </article>
    );
  }

  return (
    <article style={panelStyle}>
      <div style={sectionHeadStyle}>
        <span style={eyebrowStyle}>Round Result</span>
        <span style={chipStyle}>Round {summary.round}</span>
      </div>
      <div style={statStripStyle}>
        {summary.combatants.map((combatant) => (
          <div key={combatant.id} style={statCardStyle}>
            <div style={statLabelStyle}>{combatant.name}</div>
            <div style={statValueStyle}>
              {combatant.currentHp} / {combatant.maxHp} HP
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
        {summary.entries.map((entry, index) => (
          <div key={`${summary.round}-${entry.attackerName}-${index}`} style={messageCardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <strong style={{ fontSize: 14 }}>
                {entry.attackerName} {"->"} {entry.defenderName}
              </strong>
              <span style={messageMetaStyle}>
                {zoneLabels[entry.attackZone]} | {entry.dodged ? "dodged" : entry.blocked ? "blocked" : "landed"}
                {entry.crit ? " | crit" : ""} | {entry.finalDamage} dmg
              </span>
            </div>
            <p style={{ margin: "10px 0 0", color: "rgba(255,244,231,0.82)", lineHeight: 1.55 }}>{entry.commentary}</p>
            {entry.knockoutCommentary ? (
              <p style={{ margin: "8px 0 0", color: "rgba(255,210,168,0.92)", lineHeight: 1.5 }}>
                KO: {entry.knockoutCommentary}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </article>
  );
}

export function MatchFinishCard({
  status,
  winnerName,
  onLeave,
  onPlayAgain,
  transportIssue,
  opponentConnected,
  panelStyle,
  sectionHeadStyle,
  eyebrowStyle,
  chipStyle,
  helperTextStyle,
  buttonRowStyle,
  ghostButtonStyle,
  primaryButtonStyle,
}: {
  status: string | null;
  winnerName: string | null;
  onLeave: () => void | Promise<void>;
  onPlayAgain: () => void | Promise<void>;
  transportIssue?: string | null;
  opponentConnected?: boolean;
  panelStyle: CSSProperties;
  sectionHeadStyle: CSSProperties;
  eyebrowStyle: CSSProperties;
  chipStyle: CSSProperties;
  helperTextStyle: CSSProperties;
  buttonRowStyle: CSSProperties;
  ghostButtonStyle: CSSProperties;
  primaryButtonStyle: CSSProperties;
}) {
  const matchClosed = status === "abandoned" || transportIssue === "duel_not_found";
  const displacedSession = transportIssue === "displaced_session";

  if (status !== "finished" && !matchClosed && !displacedSession) {
    return null;
  }

  return (
    <article style={panelStyle}>
      <div style={sectionHeadStyle}>
        <span style={eyebrowStyle}>Fight Finish</span>
        <span style={chipStyle}>{displacedSession ? "Replaced" : status === "finished" ? "Complete" : "Closed"}</span>
      </div>
      <p style={helperTextStyle}>
        {displacedSession
          ? "This fighter is active in a newer session now. Leave this screen and continue from the latest one."
          : matchClosed
            ? "This match has been closed. Leave the room and open a new duel when you are ready."
            : status === "finished"
          ? winnerName
            ? `${winnerName} wins the duel.`
            : "The duel has finished."
          : opponentConnected === false
            ? "The duel is over and the opponent is currently offline."
            : "This match has been closed."}
      </p>
      <div style={buttonRowStyle}>
        <button type="button" style={ghostButtonStyle} onClick={onLeave}>
          Leave Fight
        </button>
        {!matchClosed && !displacedSession ? (
          <button type="button" style={primaryButtonStyle} onClick={onPlayAgain}>
            Fight Again
          </button>
        ) : null}
      </div>
    </article>
  );
}

export function SyncView({
  sync,
  emptyLabel,
  emptyCardStyle,
  statStripStyle,
  statCardStyle,
  statLabelStyle,
  statValueStyle,
}: {
  sync: ReturnType<OnlineDuelClient["getLastSync"]>;
  emptyLabel: string;
  emptyCardStyle: CSSProperties;
  statStripStyle: CSSProperties;
  statCardStyle: CSSProperties;
  statLabelStyle: CSSProperties;
  statValueStyle: CSSProperties;
}) {
  if (!sync) {
    return <div style={emptyCardStyle}>{emptyLabel}</div>;
  }

  return (
    <>
      <div style={statStripStyle}>
        <div style={statCardStyle}>
          <div style={statLabelStyle}>Status</div>
          <div style={statValueStyle}>{sync.status}</div>
        </div>
        <div style={statCardStyle}>
          <div style={statLabelStyle}>Round</div>
          <div style={statValueStyle}>{sync.round ?? "-"}</div>
        </div>
        <div style={statCardStyle}>
          <div style={statLabelStyle}>Winner</div>
          <div style={statValueStyle}>{sync.winnerSeat ?? "-"}</div>
        </div>
        <div style={statCardStyle}>
          <div style={statLabelStyle}>Seat</div>
          <div style={statValueStyle}>{sync.yourSeat ?? "-"}</div>
        </div>
      </div>
      <div style={statStripStyle}>
        {sync.participants.map((participant) => (
          <div key={participant.seat} style={statCardStyle}>
            <div style={statLabelStyle}>{participant.displayName}</div>
            <div style={statValueStyle}>{participant.connected ? (participant.ready ? "Ready" : "Waiting") : "Offline"}</div>
            <div style={{ marginTop: 6, color: "rgba(255,244,231,0.58)", fontSize: 12 }}>
              {participant.connected ? "connected" : "disconnected"}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
