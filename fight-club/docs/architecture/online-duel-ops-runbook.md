# Online Duel Ops Runbook

> Last updated: 2026-03-21 13:10 MSK

This runbook describes how to start, expose, and sanity-check the current `Online Duel` HTTP/SSE service.

Use it for:

- local network testing
- direct public host prototypes
- reverse-proxy or VPS prototypes

---

## Service Shape

Current PvP transport:

- `POST /api/online-duel/message`
- `GET /api/online-duel/events`
- `GET /health`

Current backend entrypoint:

- `npm run online:server`
- `npm run online:server:lan`
- `npm run online:server:public`
- `npm run online:server:proxy`

The current service is still a prototype slice:

- no auth
- no persistence
- in-memory room registry
- basic in-memory rate limiting

---

## Runtime Env

Supported backend env values:

- `HOST`
  - bind host, default `0.0.0.0`
- `PORT`
  - bind port, default `3001`
- `ONLINE_DUEL_SEED`
  - optional deterministic debug seed
- `ONLINE_DUEL_STALE_SWEEP_MS`
  - stale room cleanup interval
- `ONLINE_DUEL_BODY_LIMIT_BYTES`
  - max request body size for `POST /api/online-duel/message`
- `ONLINE_DUEL_CORS_ORIGIN`
  - allowed origin for HTTP and SSE, default `*`
- `ONLINE_DUEL_LOG_LEVEL`
  - `info`, `error`, or `silent`
- `ONLINE_DUEL_RATE_LIMIT_WINDOW_MS`
  - shared rate-limit window for live traffic
- `ONLINE_DUEL_MESSAGE_RATE_LIMIT_MAX`
  - max message requests per client inside the window
- `ONLINE_DUEL_EVENT_RATE_LIMIT_MAX`
  - max SSE attach attempts per client inside the window
- `ONLINE_DUEL_TRUST_PROXY`
  - `true` only behind a trusted reverse proxy
  - `false` for direct host exposure or local development
- `ONLINE_DUEL_DEPLOY_PROFILE`
  - optional startup profile: `default`, `lan`, `public`, or `proxy`
  - explicit env values still override the profile defaults

Frontend note:

- if the frontend talks to a different public backend host, set `VITE_ONLINE_DUEL_BASE_URL` for the web app

---

## Launch Modes

### Local Or LAN

Use this when both players are on the same machine or local network.

Shortcut:

```powershell
npm run online:server:lan
```

Backend:

```powershell
$env:HOST="0.0.0.0"
$env:PORT="3001"
$env:ONLINE_DUEL_CORS_ORIGIN="*"
$env:ONLINE_DUEL_LOG_LEVEL="info"
npm run online:server
```

Frontend:

```powershell
$env:VITE_ONLINE_DUEL_BASE_URL="http://<your-lan-ip>:3001"
npm run dev:public
```

### Direct Public Host

Use this only for prototype exposure with explicit firewall and router rules.

Shortcut:

```powershell
npm run online:server:public
```

Backend:

```powershell
$env:HOST="0.0.0.0"
$env:PORT="3001"
$env:ONLINE_DUEL_CORS_ORIGIN="https://your-frontend-host.example"
$env:ONLINE_DUEL_LOG_LEVEL="info"
$env:ONLINE_DUEL_RATE_LIMIT_WINDOW_MS="10000"
$env:ONLINE_DUEL_MESSAGE_RATE_LIMIT_MAX="60"
$env:ONLINE_DUEL_EVENT_RATE_LIMIT_MAX="20"
$env:ONLINE_DUEL_TRUST_PROXY="false"
npm run online:server
```

Frontend:

```powershell
$env:VITE_ONLINE_DUEL_BASE_URL="https://your-backend-host.example"
npm run build
```

### Reverse Proxy Or VPS

Use this when the Node service sits behind `nginx`, `Caddy`, or another trusted proxy.

Shortcut:

```powershell
npm run online:server:proxy
```

Backend:

```powershell
$env:HOST="127.0.0.1"
$env:PORT="3001"
$env:ONLINE_DUEL_CORS_ORIGIN="https://your-frontend-host.example"
$env:ONLINE_DUEL_LOG_LEVEL="info"
$env:ONLINE_DUEL_TRUST_PROXY="true"
npm run online:server
```

Reverse-proxy requirements:

- forward `X-Forwarded-For`
- preserve long-lived SSE connections for `GET /api/online-duel/events`
- do not buffer SSE responses
- keep backend and frontend origins aligned with `ONLINE_DUEL_CORS_ORIGIN` and `VITE_ONLINE_DUEL_BASE_URL`

Repository examples:

- `ops/online-duel/nginx.online-duel.example.conf`
- `ops/online-duel/Caddyfile.online-duel.example`
- `ops/online-duel/frontend.env.production.example`
- `ops/online-duel/backend.proxy.env.example`

### Nginx Notes

If you deploy through `nginx`, make sure the SSE route keeps:

- `proxy_buffering off`
- long `proxy_read_timeout`
- forwarded `X-Forwarded-For`

The repo example already includes those settings.

### Caddy Notes

If you deploy through `Caddy`, make sure the SSE route keeps:

- `flush_interval -1`
- forwarded `X-Forwarded-For`

The repo example already includes those settings.

---

## Health Checklist

After startup, verify:

1. `GET /health` returns `status: ok`
2. `transport` is `http+sse`
3. `config.deployProfile` matches the intended launch mode
4. `config.corsOrigin` matches the intended frontend host
5. `config.bodyLimitBytes` matches the intended body policy
6. `config.rateLimitWindowMs`, `messageRateLimitMax`, and `eventRateLimitMax` match the expected public-host policy
7. `config.trustProxy` matches the actual network topology

Expected health shape includes:

- `uptimeMs`
- `rooms.subscribed`
- `rooms.trackedEventStreams`
- `rooms.replayBuffers`
- `config.*`

---

## Smoke Check

For a manual post-start verification:

1. start backend
2. verify `GET /health`
3. open two browser clients
4. create one room and join it from the second client
5. verify live SSE updates after `ready`
6. play at least two rounds
7. verify `Fight Again`
8. verify `Leave Fight`
9. verify reconnect recovery by refreshing one client

If the service is behind a reverse proxy, repeat the smoke check through the public URL, not only against `localhost`.

---

## Deployment Notes

Current limits of the prototype:

- rooms are in memory only
- server restart clears live matches
- no user auth or anti-cheat identity model
- rate limiting is process-local only

Recommended current deployment posture:

- acceptable for LAN, private VPS, or invite-only prototype use
- not yet suitable for untrusted large-scale public traffic

Recommended current repo-backed deployment path:

1. build frontend separately
2. run backend with `npm run online:server:proxy`
3. terminate public traffic at `nginx` or `Caddy`
4. forward `/api/online-duel/message`, `/api/online-duel/events`, and `/health` to `127.0.0.1:3001`
5. keep `ONLINE_DUEL_TRUST_PROXY=true`

## Frontend Deploy Checklist

Use this when the frontend is built separately from the backend process.

1. set `VITE_ONLINE_DUEL_BASE_URL` to the public PvP host
2. build the frontend with `npm run build`
3. verify the built app points to the public backend, not `localhost`
4. open the deployed app and create or join a real PvP room

Example frontend env file:

```dotenv
VITE_ONLINE_DUEL_BASE_URL=https://duel.example.com
```

Repository example:

- `ops/online-duel/frontend.env.production.example`

## Backend Proxy Checklist

Use this when the backend sits behind `nginx` or `Caddy`.

1. keep backend bind host on loopback, usually `127.0.0.1`
2. keep `ONLINE_DUEL_DEPLOY_PROFILE=proxy`
3. keep `ONLINE_DUEL_TRUST_PROXY=true`
4. set `ONLINE_DUEL_CORS_ORIGIN` to the real frontend origin
5. start backend with `npm run online:server:proxy`
6. verify `/health` reports `deployProfile: proxy`

Example backend env file:

```dotenv
HOST=127.0.0.1
PORT=3001
ONLINE_DUEL_DEPLOY_PROFILE=proxy
ONLINE_DUEL_CORS_ORIGIN=https://duel.example.com
ONLINE_DUEL_LOG_LEVEL=info
ONLINE_DUEL_TRUST_PROXY=true
ONLINE_DUEL_RATE_LIMIT_WINDOW_MS=10000
ONLINE_DUEL_MESSAGE_RATE_LIMIT_MAX=60
ONLINE_DUEL_EVENT_RATE_LIMIT_MAX=20
```

Repository example:

- `ops/online-duel/backend.proxy.env.example`

---

## When To Keep `TRUST_PROXY` Off

Keep `ONLINE_DUEL_TRUST_PROXY=false` when:

- the Node service is exposed directly to the internet
- the Node service is used on a LAN
- the upstream proxy is not fully controlled by you

Enable it only when:

- you own the reverse proxy
- you know it sets `X-Forwarded-For` correctly
- the Node process should rate-limit by the real client IP instead of the proxy IP

---

> Last updated: 2026-03-21 13:10 MSK
