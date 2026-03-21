# Fight Club

Browser-only combat sandbox built with React, TypeScript, and Vite.

Last updated: 2026-03-21

## Current State

The project is no longer a minimal skeleton.

It now includes:

- live `Combat Sandbox`
- live `Hunting Lodge`
- live `Online Duel` prototype
- generated Battle Kings combat items
- zone-based armor and defended-zone weighting
- random damage and armor ranges
- roll-based block reduction in the `40-70%` band
- cooldown-aware combat skills
- item-driven combat effects, passives, and consumables
- local docs site with architecture, systems, gameplay, and balance references

## Main Commands

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run test`
- `npm run lint`
- `npm run docs:validate`
- `npm run balance:matrix`
- `npm run online:server`
- `npm run online:server:lan`
- `npm run online:server:public`
- `npm run online:server:proxy`
- `npm run baza:parse`
- `npm run baza:generate-items`

## Runtime Shape

- `src/core`
  - shared technical primitives
- `src/modules`
  - headless gameplay domains such as combat, inventory, equipment, hunting, and profile
- `src/content`
  - static and generated gameplay data
- `src/orchestration`
  - cross-module runtime assembly for combat and hunting flows
- `src/ui`
  - React screens, hooks, and presentational components
- `docs`
  - repo-native documentation, architecture references, and balance artifacts
- `BazaBK`
  - local Battle Kings source pages, item images, parsed catalogs, and generation inputs

## Combat Sandbox

The live combat flow supports:

- manual attack zone and two defense zones
- 7 curated build presets
- manual 5-slot skill loadout selection
- MMO-style inventory with bag grid and paper-doll equipment
- silhouette equipment previews
- consumables in combat flow
- battle log, status effects, and combat impact overlays

Current curated presets:

- `Sword / Bleed`
- `Shield / Guard`
- `Dagger / Crit`
- `Mace / Control`
- `Axe / Pressure`
- `Heavy / Two-Hand`
- `Sustain / Regen`

## Combat Runtime Facts

- initiative is driven by `agility`
- combat uses typed damage profiles:
  - `slash`
  - `pierce`
  - `blunt`
  - `chop`
- defended hits use:
  - zone armor
  - penetration
  - roll-based block reduction
- crit multiplier now scales from both `Rage` and `Endurance`
- combatants now track skill cooldown state
- penetration has its own `PIERCE` impact feedback lane

## PvP

The app now includes a backend-driven `PvP` flow backed by the local HTTP/SSE authority service.

Current flow:

- a player enters through the dedicated `PvP` lobby
- the player can create a room, join by code, or use matchmaking
- lobby-launched PvP requires the live backend instead of silently falling back to a fake local room
- once inside the room, the fight screen mirrors the standard combat surface:
  - local player on the left
  - live combat controls in the center
  - second player on the right instead of the bot
- the live PvP fight now includes combat intent, skills, consumables, and a real combat log
- duel state uses the HTTP/SSE authority path for room sync, round resolution, reconnect recovery, rematch, and leave-room flow
- reconnect/disconnect UX now surfaces explicit live states such as reconnecting, opponent offline, session replaced, room closed, and recovery CTAs
- matchmaking search now supports player-facing pause, resume, and timeout recovery inside the live PvP lobby flow
- the live backend now exposes operator-oriented `/health` diagnostics, configurable CORS/body limits, minimal request logging, and basic in-memory rate limiting for message and SSE traffic
- docs now also include an `Online Duel Ops Runbook` for direct-host and reverse-proxy deployment paths
- reverse-proxy examples now live in `ops/online-duel/` for `nginx` and `Caddy`
- frontend/backend PvP env examples now also live in `ops/online-duel/`
- regression coverage now includes longer live authority flows such as stale matchmaking cleanup, rematch plus reconnect recovery, `search -> stop -> resume -> match found -> first round resolve` over HTTP and SSE, and a two-client `finished -> rematch -> leave` lifecycle validation
- the local player-facing screen is now also covered by a longer lifecycle regression: resolve a round, close the room, rematch back into lobby, and return cleanly to the create flow

Current scope:

- no auth
- no server persistence
- local-network / prototype deployment stage
- some diagnostics and local verification controls still live under `Debug Tools`
- the local backend entrypoint is `npm run online:server`

PvP backend runtime env:

- `HOST`
  - HTTP bind host, default `0.0.0.0` in `online:server`
- `PORT`
  - HTTP port, default `3001`
- `ONLINE_DUEL_SEED`
  - optional authority RNG seed for deterministic debugging
- `ONLINE_DUEL_STALE_SWEEP_MS`
  - room timeout sweep interval in milliseconds
- `ONLINE_DUEL_BODY_LIMIT_BYTES`
  - max request body size for `/api/online-duel/message`
- `ONLINE_DUEL_CORS_ORIGIN`
  - CORS origin for HTTP and SSE responses, default `*`
- `ONLINE_DUEL_LOG_LEVEL`
  - `info`, `error`, or `silent`
- `ONLINE_DUEL_RATE_LIMIT_WINDOW_MS`
  - shared rate-limit window for public HTTP/SSE traffic
- `ONLINE_DUEL_MESSAGE_RATE_LIMIT_MAX`
  - max `/api/online-duel/message` requests per client within the window
- `ONLINE_DUEL_EVENT_RATE_LIMIT_MAX`
  - max `/api/online-duel/events` attach attempts per client within the window
- `ONLINE_DUEL_TRUST_PROXY`
  - set to `true` only when the service is behind a trusted reverse proxy and `X-Forwarded-For` should be used for rate limiting
  - keep it `false` for direct host exposure or local development
- `ONLINE_DUEL_DEPLOY_PROFILE`
  - optional startup profile: `default`, `lan`, `public`, or `proxy`
  - profile defaults can still be overridden by explicit env values

Operator quick check:

1. start the server with `npm run online:server`, `npm run online:server:lan`, `npm run online:server:public`, or `npm run online:server:proxy`
2. verify `GET /health`
3. confirm `/health` reports the expected `deployProfile`, `corsOrigin`, `bodyLimitBytes`, sweep interval, and rate-limit config
4. open two clients and verify create/join, live SSE updates, rematch, and leave-room

## Item And Data Pipeline

The active starter combat pool now comes from local Battle Kings source data.

Workflow:

1. normalize / collect source pages inside `BazaBK/`
2. parse them with `npm run baza:parse`
3. generate live starter items with `npm run baza:generate-items`
4. consume them through `src/content/items/starterItems.ts`

Important files:

- `BazaBK/README.md`
- `scripts/parse-bazakbk-pages.mjs`
- `scripts/generate-bazakbk-starter-items.mjs`
- `src/content/items/generatedBattleKingsStarterItems.ts`

## Docs And Source Of Truth

Start here:

- `docs/README.md`
- `docs/gameplay/index.md`
- `docs/systems/index.md`
- `docs/architecture/combat-design-reference.md`

Rules:

- code is the source of truth
- if combat behavior changes, update docs in the same pass
- if Battle Kings source data changes, rerun parse and generation before calling the state final

## Verification

Current regular checks:

- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run docs:validate`
- `npm run balance:matrix`

For item-pool changes also run:

- `npm run baza:parse`
- `npm run baza:generate-items`

Current verified suite size:

- `28` test files
- `178` tests
