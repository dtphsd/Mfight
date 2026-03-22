import { useEffect, useMemo, useState } from "react";
import {
  canReachOnlineDuelBackend,
  clearOnlineDuelBackendBaseUrlOverride,
  getOnlineDuelBackendBaseUrl,
  isLoopbackOnlineDuelBackendBaseUrl,
  readOnlineDuelBackendBaseUrlOverride,
  setOnlineDuelBackendBaseUrlOverride,
} from "@/ui/screens/OnlineDuel/onlineDuelScreenSetup";

interface AdminDashboardScreenProps {
  onBack: () => void;
  onOpenPvp: () => void;
}

interface BackendHealthPayload {
  status?: string;
  transport?: string;
  uptimeMs?: number;
  rooms?: {
    subscribed?: number;
    trackedEventStreams?: number;
    replayBuffers?: number;
  };
  config?: {
    deployProfile?: string;
    staleSweepIntervalMs?: number;
    bodyLimitBytes?: number;
    corsOrigin?: string;
    rateLimitWindowMs?: number;
    messageRateLimitMax?: number;
    eventRateLimitMax?: number;
    trustProxy?: boolean;
  };
}

interface OnlineDuelRuntimeManifest {
  generatedAt?: string;
  mode?: string;
  frontendTunnelUrl?: string;
  backendTunnelUrl?: string;
  frontendLocalUrl?: string;
  backendLocalUrl?: string;
  backendRuntimeUrl?: string;
  launcherSummaryPath?: string;
}

const FRONTEND_TUNNEL_STORAGE_KEY = "fight-club-admin-frontend-tunnel-url";
const BACKEND_TUNNEL_STORAGE_KEY = "fight-club-admin-backend-tunnel-url";

export function AdminDashboardScreen({ onBack, onOpenPvp }: AdminDashboardScreenProps) {
  const [backendBaseUrl, setBackendBaseUrl] = useState(() => getOnlineDuelBackendBaseUrl());
  const [frontendTunnelUrl, setFrontendTunnelUrl] = useState(() =>
    readStoredValue(FRONTEND_TUNNEL_STORAGE_KEY)
  );
  const [backendTunnelUrl, setBackendTunnelUrl] = useState(() =>
    readStoredValue(BACKEND_TUNNEL_STORAGE_KEY)
  );
  const [overrideCopiedKey, setOverrideCopiedKey] = useState<"applied" | "cleared" | null>(null);
  const [backendReachable, setBackendReachable] = useState<boolean | null>(null);
  const [healthPayload, setHealthPayload] = useState<BackendHealthPayload | null>(null);
  const [lastCheckedAt, setLastCheckedAt] = useState<number | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [runtimeManifest, setRuntimeManifest] = useState<OnlineDuelRuntimeManifest | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);
  const [copiedKey, setCopiedKey] = useState<"frontend" | "backend" | "browser" | "runtime" | null>(null);

  useEffect(() => {
    writeStoredValue(FRONTEND_TUNNEL_STORAGE_KEY, frontendTunnelUrl);
  }, [frontendTunnelUrl]);

  useEffect(() => {
    writeStoredValue(BACKEND_TUNNEL_STORAGE_KEY, backendTunnelUrl);
  }, [backendTunnelUrl]);

  useEffect(() => {
    setBackendBaseUrl(getOnlineDuelBackendBaseUrl());
  }, [refreshTick]);

  useEffect(() => {
    let cancelled = false;

    async function loadRuntimeManifest() {
      try {
        const response = await fetch(`/online-duel-runtime.json?ts=${Date.now()}`);
        if (!response.ok) {
          throw new Error(`runtime_manifest_${response.status}`);
        }

        const payload = (await response.json()) as OnlineDuelRuntimeManifest;
        if (cancelled) {
          return;
        }

        setRuntimeManifest(payload);

        if (payload.frontendTunnelUrl?.trim()) {
          setFrontendTunnelUrl((current) => current.trim() || payload.frontendTunnelUrl?.trim() || "");
        }

        if (payload.backendTunnelUrl?.trim()) {
          setBackendTunnelUrl((current) => current.trim() || payload.backendTunnelUrl?.trim() || "");
        }
      } catch {
        if (!cancelled) {
          setRuntimeManifest(null);
        }
      }
    }

    void loadRuntimeManifest();

    return () => {
      cancelled = true;
    };
  }, [refreshTick]);

  useEffect(() => {
    let cancelled = false;

    async function loadHealth() {
      setHealthError(null);

      const reachable = await canReachOnlineDuelBackend(backendBaseUrl);
      if (cancelled) {
        return;
      }

      setBackendReachable(reachable);
      setLastCheckedAt(Date.now());

      if (!reachable) {
        setHealthPayload(null);
        return;
      }

      try {
        const response = await fetch(`${backendBaseUrl}/health`);
        if (!response.ok) {
          throw new Error(`health_status_${response.status}`);
        }

        const payload = (await response.json()) as BackendHealthPayload;
        if (!cancelled) {
          setHealthPayload(payload);
        }
      } catch (error) {
        if (!cancelled) {
          setHealthPayload(null);
          setHealthError(error instanceof Error ? error.message : "health_request_failed");
        }
      }
    }

    void loadHealth();

    const intervalId = window.setInterval(() => {
      void loadHealth();
    }, 15_000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [backendBaseUrl, refreshTick]);

  const frontendOrigin = typeof window === "undefined" ? "unknown" : window.location.origin;
  const runtimeOverride = readOnlineDuelBackendBaseUrlOverride();
  const backendLooksLocal = isLoopbackOnlineDuelBackendBaseUrl(backendBaseUrl);
  const frontendLooksRemote = isRemoteOrigin(frontendOrigin);
  const runtimeMatchesTunnel =
    backendTunnelUrl.trim().length > 0 &&
    normalizeUrl(backendTunnelUrl) === normalizeUrl(backendBaseUrl);
  const publicFlowReady = Boolean(frontendTunnelUrl.trim()) && Boolean(backendTunnelUrl.trim());
  const remoteRuntimeReady = !frontendLooksRemote || !backendLooksLocal;
  const fullyReady = backendReachable === true && publicFlowReady && remoteRuntimeReady;
  const suggestedNextStep =
    frontendLooksRemote && backendLooksLocal
      ? "Apply the backend tunnel as the runtime PvP URL, then open PvP from this dashboard."
      : backendReachable === false
      ? "Start the local PvP backend first, then refresh this panel."
      : !publicFlowReady
        ? "Paste the current frontend and backend tunnel URLs so the checklist reflects the live setup."
        : "Open the frontend tunnel URL in a second browser or on a second device and run one room-join smoke test.";

  const checklist = [
    {
      label: "Frontend app loaded in this browser",
      ok: frontendOrigin.length > 0 && frontendOrigin !== "unknown",
      detail: frontendOrigin,
    },
    {
      label: "Configured PvP backend base URL",
      ok: backendBaseUrl.length > 0 && remoteRuntimeReady,
      detail:
        frontendLooksRemote && backendLooksLocal
          ? `${backendBaseUrl} (local-only; switch to backend tunnel for remote play)`
          : backendBaseUrl,
    },
    {
      label: "Backend health check is reachable",
      ok: backendReachable === true,
      detail:
        backendReachable === null
          ? "Checking..."
          : backendReachable
            ? "Backend answered /health"
            : "Backend did not answer /health",
    },
    {
      label: "Frontend tunnel URL recorded",
      ok: Boolean(frontendTunnelUrl.trim()),
      detail: frontendTunnelUrl.trim() || "Paste the trycloudflare frontend URL here",
    },
    {
      label: "Backend tunnel URL recorded",
      ok: Boolean(backendTunnelUrl.trim()),
      detail: backendTunnelUrl.trim() || "Paste the trycloudflare backend URL here",
    },
    {
      label: "Runtime backend matches backend tunnel",
      ok: runtimeMatchesTunnel,
      detail:
        backendTunnelUrl.trim().length === 0
          ? "Record the backend tunnel URL first"
          : runtimeMatchesTunnel
            ? "PvP is pointed at the live backend tunnel"
            : "Use the backend tunnel override button below before opening a live PvP room",
    },
  ];

  async function copyValue(value: string, key: "frontend" | "backend" | "browser" | "runtime") {
    if (typeof navigator === "undefined" || !navigator.clipboard || value.trim().length === 0) {
      return;
    }

    await navigator.clipboard.writeText(value.trim());
    setCopiedKey(key);
    window.setTimeout(() => {
      setCopiedKey((current) => (current === key ? null : current));
    }, 1400);
  }

  function applyBackendTunnelOverride() {
    const trimmedTunnelUrl = normalizeUrl(backendTunnelUrl);
    if (!trimmedTunnelUrl) {
      return;
    }

    setOnlineDuelBackendBaseUrlOverride(trimmedTunnelUrl);
    setBackendBaseUrl(getOnlineDuelBackendBaseUrl());
    setRefreshTick((current) => current + 1);
    setOverrideCopiedKey("applied");
    window.setTimeout(() => {
      setOverrideCopiedKey((current) => (current === "applied" ? null : current));
    }, 1600);
  }

  function clearBackendOverride() {
    clearOnlineDuelBackendBaseUrlOverride();
    setBackendBaseUrl(getOnlineDuelBackendBaseUrl());
    setRefreshTick((current) => current + 1);
    setOverrideCopiedKey("cleared");
    window.setTimeout(() => {
      setOverrideCopiedKey((current) => (current === "cleared" ? null : current));
    }, 1600);
  }

  return (
    <section style={shellStyle}>
      <div style={heroStyle}>
        <div style={heroPanelStyle}>
          <p style={eyebrowStyle}>Admin Dashboard</p>
          <h1 style={titleStyle}>Live PvP Control Room</h1>
          <p style={copyStyle}>
            One place to see which URLs the browser is actually using, whether the local duel backend is alive,
            and what still needs to be running before you invite another player.
          </p>
          <div style={fullyReady ? readyBannerStyle : cautionBannerStyle}>
            <strong>{fullyReady ? "Ready to invite a second player" : "Not ready for a remote match yet"}</strong>
            <span>{suggestedNextStep}</span>
          </div>
          <div style={buttonRowStyle}>
            <button type="button" style={primaryButtonStyle} onClick={() => setRefreshTick((current) => current + 1)}>
              Refresh
            </button>
            <button type="button" style={ghostButtonStyle} onClick={onOpenPvp}>
              PvP
            </button>
            <button type="button" style={ghostButtonStyle} onClick={onBack}>
              Menu
            </button>
          </div>
        </div>

        <div style={snapshotPanelStyle}>
          <div style={sectionHeadStyle}>
            <span style={sectionLabelStyle}>Live Snapshot</span>
            <span style={chipStyle}>{backendReachable ? "Backend online" : backendReachable === false ? "Backend offline" : "Checking"}</span>
          </div>
          <div style={statGridStyle}>
            <StatusCard
              label="Frontend Origin"
              value={frontendOrigin}
            />
            <StatusCard
              label="PvP Backend URL"
              value={backendBaseUrl}
            />
            <StatusCard
              label="Last Health Check"
              value={lastCheckedAt ? formatRelativeTime(lastCheckedAt) : "Waiting"}
            />
            <StatusCard
              label="Deploy Profile"
              value={healthPayload?.config?.deployProfile ?? "Unknown"}
            />
            <StatusCard
              label="Runtime Manifest"
              value={runtimeManifest?.mode === "quicktunnel" ? "Launcher detected" : "Not detected"}
            />
            <StatusCard
              label="Manifest Updated"
              value={runtimeManifest?.generatedAt ? formatIsoTime(runtimeManifest.generatedAt) : "Unknown"}
            />
          </div>
        </div>
      </div>

      <div style={gridStyle}>
        <article style={panelStyle}>
          <div style={sectionHeadStyle}>
            <span style={sectionLabelStyle}>Runtime Inputs</span>
            <span style={chipStyle}>Sticky notes</span>
          </div>
          <div style={fieldGridStyle}>
            <label style={fieldLabelStyle}>
              Frontend tunnel URL
              <input
                value={frontendTunnelUrl}
                onChange={(event) => setFrontendTunnelUrl(event.target.value)}
                placeholder="https://your-frontend.trycloudflare.com"
                style={inputStyle}
              />
              <div style={inlineButtonRowStyle}>
                <button
                  type="button"
                  style={miniGhostButtonStyle}
                  onClick={() => void copyValue(frontendTunnelUrl, "frontend")}
                >
                  {copiedKey === "frontend" ? "Copied" : "Copy"}
                </button>
              </div>
            </label>
            <label style={fieldLabelStyle}>
              Backend tunnel URL
              <input
                value={backendTunnelUrl}
                onChange={(event) => setBackendTunnelUrl(event.target.value)}
                placeholder="https://your-backend.trycloudflare.com"
                style={inputStyle}
              />
              <div style={inlineButtonRowStyle}>
                <button
                  type="button"
                  style={miniGhostButtonStyle}
                  onClick={() => void copyValue(backendTunnelUrl, "backend")}
                >
                  {copiedKey === "backend" ? "Copied" : "Copy"}
                </button>
              </div>
            </label>
          </div>
          {runtimeManifest?.mode === "quicktunnel" ? (
            <div style={calloutStyle}>
              <div style={calloutTitleStyle}>Launcher Sync</div>
              <p style={calloutCopyStyle}>
                Tunnel URLs were auto-loaded from `online-duel-runtime.json`. You only need to paste them manually if you
                are using a different launcher or a fresh external URL.
              </p>
            </div>
          ) : null}
          <div style={compactInfoGridStyle}>
            <div style={compactInfoCardStyle}>
              <div style={statusLabelStyle}>Browser Origin</div>
              <div style={compactValueStyle}>{frontendOrigin}</div>
              <button
                type="button"
                style={miniGhostButtonStyle}
                onClick={() => void copyValue(frontendOrigin, "browser")}
              >
                {copiedKey === "browser" ? "Copied" : "Copy"}
              </button>
            </div>
            <div style={compactInfoCardStyle}>
              <div style={statusLabelStyle}>Runtime Backend</div>
              <div style={compactValueStyle}>{backendBaseUrl}</div>
              <button
                type="button"
                style={miniGhostButtonStyle}
                onClick={() => void copyValue(backendBaseUrl, "runtime")}
              >
                {copiedKey === "runtime" ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
          <div style={actionCardStyle}>
            <div style={actionCardCopyStyle}>
              <strong>Runtime backend switch</strong>
              <span>
                {runtimeOverride
                  ? `Override active: ${runtimeOverride}`
                  : "No override yet. Apply the backend tunnel here to make PvP stop targeting localhost."}
              </span>
            </div>
            <div style={buttonRowStyle}>
              <button
                type="button"
                style={primaryButtonStyle}
                onClick={applyBackendTunnelOverride}
                disabled={!backendTunnelUrl.trim()}
              >
                {overrideCopiedKey === "applied" ? "Backend tunnel applied" : "Use Backend Tunnel For PvP"}
              </button>
              <button
                type="button"
                style={ghostButtonStyle}
                onClick={clearBackendOverride}
              >
                {overrideCopiedKey === "cleared" ? "Override cleared" : "Clear Override"}
              </button>
            </div>
          </div>
          <div style={calloutStyle}>
            <div style={calloutTitleStyle}>Scope</div>
            <p style={calloutCopyStyle}>
              It can confirm what the current browser build points at, whether the duel service responds, and apply a
              browser-local backend override for this machine before you open PvP. The launcher env is still the cleanest
              source of truth, but the override is enough to rescue a session that is still targeting localhost.
            </p>
          </div>
        </article>

        <article style={panelStyle}>
          <div style={sectionHeadStyle}>
            <span style={sectionLabelStyle}>Launch Checklist</span>
            <span style={chipStyle}>{checklist.filter((item) => item.ok).length}/{checklist.length} ready</span>
          </div>
          <div style={listStyle}>
            {checklist.map((item) => (
              <div key={item.label} style={listCardStyle}>
                <div style={listHeadStyle}>
                  <strong style={listTitleStyle}>{item.label}</strong>
                  <span style={item.ok ? okBadgeStyle : pendingBadgeStyle}>{item.ok ? "OK" : "Pending"}</span>
                </div>
                <div style={listDetailStyle}>{item.detail}</div>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div style={gridStyle}>
        <article style={panelStyle}>
          <div style={sectionHeadStyle}>
            <span style={sectionLabelStyle}>Backend Health</span>
            <span style={chipStyle}>{healthPayload?.status ?? (backendReachable ? "No payload" : "Unavailable")}</span>
          </div>
          {healthError ? (
            <p style={warningStyle}>Health request error: {healthError}</p>
          ) : null}
          <div style={statGridStyle}>
            <StatusCard label="Transport" value={healthPayload?.transport ?? "Unknown"} />
            <StatusCard label="Uptime" value={formatDuration(healthPayload?.uptimeMs)} />
            <StatusCard
              label="Subscribers"
              value={String(healthPayload?.rooms?.trackedEventStreams ?? 0)}
            />
            <StatusCard
              label="Replay Buffers"
              value={String(healthPayload?.rooms?.replayBuffers ?? 0)}
            />
          </div>
          <div style={metaGridStyle}>
            <MetaLine label="CORS Origin" value={healthPayload?.config?.corsOrigin ?? "Unknown"} />
            <MetaLine label="Trust Proxy" value={String(healthPayload?.config?.trustProxy ?? "Unknown")} />
            <MetaLine
              label="Rate Limit Window"
              value={formatMs(healthPayload?.config?.rateLimitWindowMs)}
            />
            <MetaLine
              label="Message Limit"
              value={String(healthPayload?.config?.messageRateLimitMax ?? "Unknown")}
            />
            <MetaLine
              label="Event Limit"
              value={String(healthPayload?.config?.eventRateLimitMax ?? "Unknown")}
            />
          </div>
        </article>

        <article style={panelStyle}>
          <div style={sectionHeadStyle}>
            <span style={sectionLabelStyle}>Operator Notes</span>
            <span style={chipStyle}>No mystery steps</span>
          </div>
          <div style={listStyle}>
            {[
              "Keep four processes alive during remote play: backend, frontend, frontend tunnel, backend tunnel.",
              "If the frontend port changes, restart the frontend tunnel to point at the new Vite port.",
              "If the frontend tunnel URL changes, restart the backend with a matching CORS origin.",
              "If the backend tunnel URL changes, either restart the frontend with the new env or apply the runtime backend override here.",
              "Use this dashboard before inviting someone else so you can catch a browser that is still targeting localhost by mistake.",
              "If launcher sync is active, this screen auto-loads the latest trycloudflare URLs from the runtime manifest.",
            ].map((note) => (
              <div key={note} style={noteCardStyle}>
                {note}
              </div>
            ))}
          </div>
        </article>
      </div>

      <div style={gridStyle}>
        <article style={panelStyle}>
          <div style={sectionHeadStyle}>
            <span style={sectionLabelStyle}>Launcher Files</span>
            <span style={chipStyle}>One-click helpers</span>
          </div>
          <div style={listStyle}>
            <div style={noteCardStyle}>
              <strong style={launcherTitleStyle}>Start stack</strong>
              <div style={launcherPathStyle}>C:\Users\dtphs\.vscode\Project\fight-club\start-online-pvp-quicktunnel.bat</div>
            </div>
            <div style={noteCardStyle}>
              <strong style={launcherTitleStyle}>Stop stack</strong>
              <div style={launcherPathStyle}>C:\Users\dtphs\.vscode\Project\fight-club\stop-online-pvp-quicktunnel.bat</div>
            </div>
            <div style={calloutStyle}>
              <div style={calloutTitleStyle}>Workflow</div>
              <p style={calloutCopyStyle}>
                Start with the quick-tunnel launcher, paste the two public URLs into this dashboard, run one remote smoke
                match, then stop the whole stack with the stop launcher when you are done.
              </p>
            </div>
          </div>
        </article>

        <article style={panelStyle}>
          <div style={sectionHeadStyle}>
            <span style={sectionLabelStyle}>Smoke Test</span>
            <span style={chipStyle}>6 quick checks</span>
          </div>
          <div style={listStyle}>
            {[
              "Open the frontend tunnel URL in a second browser or on a second device.",
              "Create a PvP room on the first client and join it by code on the second.",
              "Confirm both clients show the same room and both players can press Ready.",
              "Lock actions on both sides and resolve at least one full round.",
              "Use Fight Again after the match or after one player wins.",
              "Use Leave Fight and confirm both clients return to a safe state.",
            ].map((step, index) => (
              <div key={step} style={listCardStyle}>
                <div style={smokeRowStyle}>
                  <span style={smokeIndexStyle}>{index + 1}</span>
                  <span style={smokeCopyStyle}>{step}</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

function StatusCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={statusCardStyle}>
      <div style={statusLabelStyle}>{label}</div>
      <div style={statusValueStyle}>{value}</div>
    </div>
  );
}

function MetaLine({ label, value }: { label: string; value: string }) {
  return (
    <div style={metaLineStyle}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function readStoredValue(key: string) {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(key) ?? "";
}

function writeStoredValue(key: string, value: string) {
  if (typeof window === "undefined") {
    return;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    window.localStorage.removeItem(key);
    return;
  }

  window.localStorage.setItem(key, trimmed);
}

function formatDuration(value?: number) {
  if (!value || value <= 0) {
    return "Unknown";
  }

  const totalSeconds = Math.floor(value / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}

function formatMs(value?: number) {
  if (!value || value <= 0) {
    return "Unknown";
  }

  return `${value} ms`;
}

function formatRelativeTime(timestamp: number) {
  const deltaSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (deltaSeconds < 5) {
    return "Just now";
  }

  if (deltaSeconds < 60) {
    return `${deltaSeconds}s ago`;
  }

  const minutes = Math.floor(deltaSeconds / 60);
  return `${minutes}m ago`;
}

function formatIsoTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleTimeString();
}

function normalizeUrl(value: string) {
  return value.trim().replace(/\/+$/, "");
}

function isRemoteOrigin(origin: string) {
  try {
    const parsedOrigin = new URL(origin);
    return !["127.0.0.1", "localhost", "::1"].includes(parsedOrigin.hostname);
  } catch {
    return false;
  }
}

const shellStyle = {
  display: "grid",
  gap: 12,
} as const;

const heroStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.18fr) minmax(320px, 0.82fr)",
  gap: 12,
} as const;

const heroPanelStyle = {
  border: "1px solid rgba(255, 244, 225, 0.09)",
  borderRadius: 24,
  padding: 18,
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.055), rgba(255,255,255,0.018))",
  boxShadow: "0 18px 36px rgba(0, 0, 0, 0.24)",
} as const;

const snapshotPanelStyle = {
  ...heroPanelStyle,
  display: "grid",
  gap: 10,
  alignContent: "start",
} as const;

const eyebrowStyle = {
  margin: 0,
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: "0.18em",
  color: "#d0b498",
} as const;

const titleStyle = {
  margin: "6px 0 8px",
  fontSize: "clamp(28px, 3.4vw, 44px)",
  lineHeight: 0.95,
} as const;

const copyStyle = {
  margin: 0,
  maxWidth: 760,
  color: "rgba(244, 239, 227, 0.76)",
  lineHeight: 1.48,
  fontSize: 14,
} as const;

const buttonRowStyle = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  marginTop: 10,
} as const;

const primaryButtonStyle = {
  padding: "10px 14px",
  borderRadius: 999,
  border: "1px solid rgba(255, 221, 188, 0.22)",
  background: "linear-gradient(180deg, #e28755, #c45d2c)",
  color: "#fff8ed",
  cursor: "pointer",
  fontWeight: 700,
} as const;

const ghostButtonStyle = {
  padding: "10px 14px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.04)",
  color: "#e6ded3",
  cursor: "pointer",
} as const;

const helperStyle = {
  margin: 0,
  color: "rgba(244, 239, 227, 0.72)",
  lineHeight: 1.5,
} as const;

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 12,
} as const;

const panelStyle = {
  border: "1px solid rgba(255, 244, 225, 0.09)",
  borderRadius: 24,
  padding: 16,
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.018))",
  boxShadow: "0 16px 34px rgba(0, 0, 0, 0.22)",
  display: "grid",
  gap: 10,
} as const;

const sectionHeadStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "center",
  flexWrap: "wrap",
} as const;

const sectionLabelStyle = {
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: "0.16em",
  color: "rgba(240, 203, 136, 0.88)",
} as const;

const chipStyle = {
  padding: "6px 10px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.045)",
  color: "rgba(255,244,231,0.82)",
  fontSize: 12,
} as const;

const statGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 8,
} as const;

const statusCardStyle = {
  borderRadius: 16,
  padding: 11,
  background: "rgba(255,255,255,0.032)",
  border: "1px solid rgba(255,255,255,0.08)",
} as const;

const statusLabelStyle = {
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "rgba(244,239,227,0.56)",
} as const;

const statusValueStyle = {
  marginTop: 5,
  fontSize: 15,
  fontWeight: 700,
  wordBreak: "break-word" as const,
} as const;

const fieldLabelStyle = {
  display: "grid",
  gap: 6,
  color: "rgba(244,239,227,0.86)",
  fontSize: 12,
} as const;

const inputStyle = {
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(7,10,18,0.74)",
  color: "rgba(255,244,231,0.94)",
  padding: "10px 12px",
  fontSize: 13,
} as const;

const calloutStyle = {
  borderRadius: 16,
  padding: 11,
  border: "1px solid rgba(120, 189, 255, 0.16)",
  background: "linear-gradient(180deg, rgba(120,189,255,0.08), rgba(255,255,255,0.02))",
} as const;

const calloutTitleStyle = {
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  color: "rgba(188,223,255,0.92)",
} as const;

const calloutCopyStyle = {
  margin: "6px 0 0",
  lineHeight: 1.4,
  color: "rgba(244,239,227,0.74)",
  fontSize: 13,
} as const;

const listStyle = {
  display: "grid",
  gap: 8,
} as const;

const listCardStyle = {
  borderRadius: 16,
  padding: 11,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.026)",
} as const;

const listHeadStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "center",
} as const;

const listTitleStyle = {
  fontSize: 14,
} as const;

const listDetailStyle = {
  marginTop: 5,
  color: "rgba(244,239,227,0.7)",
  lineHeight: 1.35,
  fontSize: 13,
  wordBreak: "break-word" as const,
} as const;

const okBadgeStyle = {
  padding: "6px 10px",
  borderRadius: 999,
  background: "rgba(102, 224, 138, 0.16)",
  border: "1px solid rgba(102, 224, 138, 0.22)",
  color: "#d9ffe1",
  fontSize: 11,
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
} as const;

const pendingBadgeStyle = {
  padding: "6px 10px",
  borderRadius: 999,
  background: "rgba(255, 196, 116, 0.12)",
  border: "1px solid rgba(255, 196, 116, 0.18)",
  color: "#ffe4bd",
  fontSize: 11,
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
} as const;

const warningStyle = {
  margin: 0,
  color: "rgba(255, 184, 184, 0.92)",
} as const;

const metaGridStyle = {
  display: "grid",
  gap: 6,
} as const;

const metaLineStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  padding: "8px 10px",
  borderRadius: 12,
  background: "rgba(255,255,255,0.028)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "rgba(244,239,227,0.76)",
  fontSize: 13,
} as const;

const noteCardStyle = {
  borderRadius: 14,
  padding: 10,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.03)",
  color: "rgba(244,239,227,0.78)",
  lineHeight: 1.35,
  fontSize: 13,
} as const;

const launcherTitleStyle = {
  display: "block",
  marginBottom: 6,
  color: "#fff4e8",
} as const;

const launcherPathStyle = {
  fontFamily: "Consolas, monospace",
  fontSize: 12,
  lineHeight: 1.35,
  color: "rgba(244,239,227,0.72)",
  wordBreak: "break-word" as const,
} as const;

const smokeRowStyle = {
  display: "grid",
  gridTemplateColumns: "28px minmax(0, 1fr)",
  gap: 10,
  alignItems: "start",
} as const;

const smokeIndexStyle = {
  width: 28,
  height: 28,
  borderRadius: 999,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "rgba(240,203,136,0.92)",
  fontSize: 12,
  fontWeight: 700,
} as const;

const smokeCopyStyle = {
  color: "rgba(244,239,227,0.84)",
  lineHeight: 1.35,
  fontSize: 13,
} as const;

const readyBannerStyle = {
  marginTop: 10,
  padding: "10px 12px",
  borderRadius: 16,
  border: "1px solid rgba(102, 224, 138, 0.24)",
  background: "linear-gradient(180deg, rgba(102,224,138,0.12), rgba(255,255,255,0.02))",
  display: "grid",
  gap: 4,
  color: "#d9ffe1",
} as const;

const cautionBannerStyle = {
  marginTop: 10,
  padding: "10px 12px",
  borderRadius: 16,
  border: "1px solid rgba(255, 196, 116, 0.2)",
  background: "linear-gradient(180deg, rgba(255,196,116,0.1), rgba(255,255,255,0.02))",
  display: "grid",
  gap: 4,
  color: "#ffe4bd",
} as const;

const fieldGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 10,
} as const;

const inlineButtonRowStyle = {
  display: "flex",
  justifyContent: "flex-end",
} as const;

const miniGhostButtonStyle = {
  padding: "7px 10px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.04)",
  color: "#e6ded3",
  cursor: "pointer",
  fontSize: 12,
} as const;

const compactInfoGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 8,
} as const;

const compactInfoCardStyle = {
  borderRadius: 16,
  padding: 10,
  background: "rgba(255,255,255,0.028)",
  border: "1px solid rgba(255,255,255,0.08)",
  display: "grid",
  gap: 6,
} as const;

const compactValueStyle = {
  fontSize: 13,
  lineHeight: 1.35,
  color: "rgba(255,244,231,0.92)",
  wordBreak: "break-word" as const,
} as const;

const actionCardStyle = {
  borderRadius: 16,
  padding: 11,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.03)",
  display: "grid",
  gap: 8,
} as const;

const actionCardCopyStyle = {
  display: "grid",
  gap: 4,
  color: "rgba(244,239,227,0.8)",
  lineHeight: 1.35,
  fontSize: 13,
} as const;
