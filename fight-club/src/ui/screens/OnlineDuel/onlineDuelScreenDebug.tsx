import type { CSSProperties, Dispatch, SetStateAction } from "react";
import type { OnlineDuelSetup, } from "@/ui/screens/OnlineDuel/onlineDuelScreenSetup";
import type { ClientMode } from "@/ui/screens/OnlineDuel/onlineDuelScreenSupport";
import type { RoundDraft } from "@/orchestration/combat/roundDraft";
import type { OnlineDuelStateSync, OnlineDuelServerMessage } from "@/modules/arena";
import type { CombatZone } from "@/modules/combat";
import { RoundPlannerCard, SyncView } from "@/ui/screens/OnlineDuel/onlineDuelScreenCards";

export function OnlineDuelDebugPanel({
  launchedFromLobby,
  panelStyle,
  sectionHeadStyle,
  eyebrowStyle,
  chipStyle,
  ghostButtonStyle,
  primaryButtonStyle,
  helperTextStyle,
  buttonRowStyle,
  plannerCardStyle,
  plannerLabelStyle,
  plannerZoneRowStyle,
  plannerPrimaryButtonStyle,
  plannerGhostButtonStyle,
  emptyCardStyle,
  statStripStyle,
  statCardStyle,
  statLabelStyle,
  statValueStyle,
  clientMetaStyle,
  messageCardStyle,
  messageMetaStyle,
  debugOpen,
  setDebugOpen,
  debugClientMode,
  setDebugClientMode,
  debugSync,
  debugSeat,
  hostDraft,
  guestDraft,
  duelId,
  actionsDisabled,
  messages,
  setup,
  onHostSync,
  onGuestSync,
  onHostReady,
  onGuestReady,
  onHostConnection,
  onGuestConnection,
  onHostAttack,
  onGuestAttack,
  onForceTimeout,
  onNewHostSession,
  onNewGuestSession,
  onHostAttackZoneChange,
  onGuestAttackZoneChange,
  onHostDefenseZoneToggle,
  onGuestDefenseZoneToggle,
}: OnlineDuelDebugPanelProps) {
  if (launchedFromLobby) {
    return null;
  }

  return (
    <article style={panelStyle}>
      <div style={sectionHeadStyle}>
        <span style={eyebrowStyle}>Debug Tools</span>
        <button
          type="button"
          style={ghostButtonStyle}
          onClick={() => setDebugOpen((current) => !current)}
        >
          {debugOpen ? "Hide Debug Tools" : "Show Debug Tools"}
        </button>
      </div>
      {debugOpen ? (
        <>
          <p style={helperTextStyle}>
            These controls exercise session lifecycle behavior. Timeout forcing only works on the local fallback
            authority until the backend exposes the same debug hooks.
          </p>
          <div style={buttonRowStyle}>
            <button
              type="button"
              style={debugClientMode === "host" ? primaryButtonStyle : ghostButtonStyle}
              onClick={() => setDebugClientMode("host")}
            >
              Host Side
            </button>
            <button
              type="button"
              style={debugClientMode === "guest" ? primaryButtonStyle : ghostButtonStyle}
              onClick={() => setDebugClientMode("guest")}
            >
              Guest Side
            </button>
            <button
              type="button"
              style={ghostButtonStyle}
              onClick={() => void onHostSync()}
              disabled={!duelId || actionsDisabled}
            >
              Refresh Host
            </button>
            <button
              type="button"
              style={ghostButtonStyle}
              onClick={() => void onGuestSync()}
              disabled={!duelId || actionsDisabled}
            >
              Refresh Guest
            </button>
            <button type="button" style={ghostButtonStyle} onClick={onNewHostSession}>
              New Host Session
            </button>
            <button type="button" style={ghostButtonStyle} onClick={onNewGuestSession}>
              New Guest Session
            </button>
            <button
              type="button"
              style={ghostButtonStyle}
              onClick={() => void onHostConnection(false)}
              disabled={!duelId || actionsDisabled}
            >
              Host Disconnect
            </button>
            <button
              type="button"
              style={ghostButtonStyle}
              onClick={() => void onHostConnection(true)}
              disabled={!duelId || actionsDisabled}
            >
              Host Reconnect
            </button>
            <button
              type="button"
              style={ghostButtonStyle}
              onClick={() => void onGuestConnection(false)}
              disabled={!duelId || actionsDisabled}
            >
              Guest Disconnect
            </button>
            <button
              type="button"
              style={ghostButtonStyle}
              onClick={() => void onGuestConnection(true)}
              disabled={!duelId || actionsDisabled}
            >
              Guest Reconnect
            </button>
            <button
              type="button"
              style={ghostButtonStyle}
              onClick={() => void onForceTimeout()}
              disabled={!duelId || actionsDisabled || !setup.expireRooms}
            >
              Force Timeout
            </button>
          </div>

          <div style={{ ...panelStyle, marginTop: 14, background: "rgba(255,255,255,0.02)", boxShadow: "none" }}>
            <div style={sectionHeadStyle}>
              <span style={eyebrowStyle}>Selected Debug Side</span>
              <span style={chipStyle}>{debugSync?.yourSeat ?? debugSeat}</span>
            </div>
            <p style={helperTextStyle}>
              Use this operator view for local two-seat verification. It does not change the normal `Your Side`
              player surface above.
            </p>
            <RoundPlannerCard
              draft={debugClientMode === "host" ? hostDraft : guestDraft}
              mode={debugClientMode}
              onAttackZoneChange={debugClientMode === "host" ? onHostAttackZoneChange : onGuestAttackZoneChange}
              onDefenseZoneToggle={debugClientMode === "host" ? onHostDefenseZoneToggle : onGuestDefenseZoneToggle}
              plannerCardStyle={plannerCardStyle}
              sectionHeadStyle={sectionHeadStyle}
              eyebrowStyle={eyebrowStyle}
              chipStyle={chipStyle}
              plannerLabelStyle={plannerLabelStyle}
              plannerZoneRowStyle={plannerZoneRowStyle}
              plannerPrimaryButtonStyle={plannerPrimaryButtonStyle}
              plannerGhostButtonStyle={plannerGhostButtonStyle}
            />
            <div style={buttonRowStyle}>
              <button
                type="button"
                style={primaryButtonStyle}
                onClick={() => void (debugClientMode === "host" ? onHostReady(true) : onGuestReady(true))}
                disabled={!duelId || actionsDisabled}
              >
                Ready Selected Side
              </button>
              <button
                type="button"
                style={ghostButtonStyle}
                onClick={() => void (debugClientMode === "host" ? onHostReady(false) : onGuestReady(false))}
                disabled={!duelId || actionsDisabled}
              >
                Cancel Selected Ready
              </button>
              <button
                type="button"
                style={primaryButtonStyle}
                onClick={() => void (debugClientMode === "host" ? onHostAttack() : onGuestAttack())}
                disabled={!duelId || actionsDisabled}
              >
                Lock Selected Attack
              </button>
            </div>
            <SyncView
              sync={debugSync}
              emptyLabel="The selected debug client has not synced yet."
              emptyCardStyle={emptyCardStyle}
              statStripStyle={statStripStyle}
              statCardStyle={statCardStyle}
              statLabelStyle={statLabelStyle}
              statValueStyle={statValueStyle}
            />
          </div>

          <div style={{ ...panelStyle, marginTop: 14, background: "rgba(255,255,255,0.02)", boxShadow: "none" }}>
            <div style={sectionHeadStyle}>
              <span style={eyebrowStyle}>Session Details</span>
              <span style={chipStyle}>Developer</span>
            </div>
            <div style={{ ...clientMetaStyle, marginBottom: 0 }}>
              <span>Duel</span>
              <span>{duelId ?? "not-created"}</span>
            </div>
            <div style={{ ...clientMetaStyle, marginBottom: 0 }}>
              <span>{setup.hostClient.identity.playerId}</span>
              <span>{setup.hostClient.identity.sessionId}</span>
            </div>
            <div style={{ ...clientMetaStyle, marginBottom: 0, marginTop: 10 }}>
              <span>{setup.guestClient.identity.playerId}</span>
              <span>{setup.guestClient.identity.sessionId}</span>
            </div>
          </div>

          <div style={{ ...panelStyle, minHeight: 280, padding: 0, marginTop: 14, background: "transparent", boxShadow: "none" }}>
            <div style={sectionHeadStyle}>
              <span style={eyebrowStyle}>Server Messages</span>
              <span style={chipStyle}>{messages.length} entries</span>
            </div>
            <div
              style={{
                marginTop: 14,
                display: "grid",
                gap: 10,
                maxHeight: 320,
                overflowY: "auto",
                paddingRight: 6,
              }}
            >
              {messages.length === 0 ? (
                <div style={emptyCardStyle}>No online messages yet.</div>
              ) : (
                messages.map((message, index) => (
                  <div key={`${message.type}-${index}`} style={messageCardStyle}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                      <strong style={{ fontSize: 14 }}>{message.type}</strong>
                      {"duelId" in message ? (
                        <span style={messageMetaStyle}>{message.duelId}</span>
                      ) : (
                        <span style={messageMetaStyle}>payload</span>
                      )}
                    </div>
                    <pre
                      style={{
                        margin: "10px 0 0",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        color: "rgba(234, 229, 223, 0.78)",
                        fontSize: 12,
                        lineHeight: 1.5,
                        fontFamily: "Consolas, monospace",
                      }}
                    >
                      {JSON.stringify(message, null, 2)}
                    </pre>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      ) : (
        <p style={helperTextStyle}>Debug controls are hidden during normal play.</p>
      )}
    </article>
  );
}

interface OnlineDuelDebugPanelProps {
  launchedFromLobby: boolean;
  panelStyle: CSSProperties;
  sectionHeadStyle: CSSProperties;
  eyebrowStyle: CSSProperties;
  chipStyle: CSSProperties;
  ghostButtonStyle: CSSProperties;
  primaryButtonStyle: CSSProperties;
  helperTextStyle: CSSProperties;
  buttonRowStyle: CSSProperties;
  plannerCardStyle: CSSProperties;
  plannerLabelStyle: CSSProperties;
  plannerZoneRowStyle: CSSProperties;
  plannerPrimaryButtonStyle: CSSProperties;
  plannerGhostButtonStyle: CSSProperties;
  emptyCardStyle: CSSProperties;
  statStripStyle: CSSProperties;
  statCardStyle: CSSProperties;
  statLabelStyle: CSSProperties;
  statValueStyle: CSSProperties;
  clientMetaStyle: CSSProperties;
  messageCardStyle: CSSProperties;
  messageMetaStyle: CSSProperties;
  debugOpen: boolean;
  setDebugOpen: Dispatch<SetStateAction<boolean>>;
  debugClientMode: ClientMode;
  setDebugClientMode: Dispatch<SetStateAction<ClientMode>>;
  debugSync: OnlineDuelStateSync | null;
  debugSeat: string;
  hostDraft: RoundDraft;
  guestDraft: RoundDraft;
  duelId: string | null;
  actionsDisabled: boolean;
  messages: OnlineDuelServerMessage[];
  setup: OnlineDuelSetup;
  onHostSync: () => void | Promise<void>;
  onGuestSync: () => void | Promise<void>;
  onHostReady: (ready: boolean) => void | Promise<void>;
  onGuestReady: (ready: boolean) => void | Promise<void>;
  onHostConnection: (connected: boolean) => void | Promise<void>;
  onGuestConnection: (connected: boolean) => void | Promise<void>;
  onHostAttack: () => void | Promise<void>;
  onGuestAttack: () => void | Promise<void>;
  onForceTimeout: () => void | Promise<void>;
  onNewHostSession: () => void;
  onNewGuestSession: () => void;
  onHostAttackZoneChange: (zone: CombatZone) => void;
  onGuestAttackZoneChange: (zone: CombatZone) => void;
  onHostDefenseZoneToggle: (zone: CombatZone) => void;
  onGuestDefenseZoneToggle: (zone: CombatZone) => void;
}
