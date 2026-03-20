import { SeededRandom } from "@/core/rng/SeededRandom";
import { createCharacter } from "@/modules/character";
import {
  createLocalOnlineDuelTransport,
  createInMemoryOnlineDuelService,
  createOnlineDuelClient,
  createOnlineDuelRoom,
  handleOnlineDuelClientMessage,
  joinOnlineDuelRoom,
  resolveOnlineDuelRound,
  submitOnlineDuelAction,
} from "@/modules/arena";
import { createBasicAttackAction } from "@/modules/combat";
import { buildCombatSnapshot } from "@/orchestration/combat/buildCombatSnapshot";

describe("online duel arena domain", () => {
  function stripCombatState<T>(value: T): T {
    if (Array.isArray(value)) {
      return value.map((entry) => stripCombatState(entry)) as T;
    }

    if (value && typeof value === "object") {
      const next: Record<string, unknown> = {};
      for (const [key, entry] of Object.entries(value)) {
        if (key === "combatState") {
          continue;
        }
        next[key] = stripCombatState(entry);
      }
      return next as T;
    }

    return value;
  }

  function createSnapshots() {
    const first = createCharacter("Alpha");
    const second = createCharacter("Beta");

    if (!first.success || !second.success) {
      throw new Error("character creation failed");
    }

    return {
      alpha: buildCombatSnapshot({
        character: first.data,
        flatBonuses: [],
        percentBonuses: [],
      }),
      beta: buildCombatSnapshot({
        character: second.data,
        flatBonuses: [],
        percentBonuses: [],
      }),
    };
  }

  it("creates a waiting duel room and enters lobby when the second player joins", () => {
    const { alpha, beta } = createSnapshots();
    const room = createOnlineDuelRoom({
      playerId: "player-alpha",
      sessionId: "session-alpha",
      displayName: "Alpha",
      snapshot: alpha,
      createdAt: 1000,
    });

    expect(room.status).toBe("waiting_for_players");
    expect(room.combatState).toBeNull();

    const joined = joinOnlineDuelRoom(room, {
      playerId: "player-beta",
      sessionId: "session-beta",
      displayName: "Beta",
      snapshot: beta,
      joinedAt: 2000,
    });

    expect(joined.success).toBe(true);
    if (!joined.success) {
      return;
    }

    expect(joined.data.status).toBe("lobby");
    expect(joined.data.combatState?.status).toBe("active");
    expect(joined.data.currentRound?.round).toBe(1);
    expect(joined.data.participants.playerB?.displayName).toBe("Beta");
    expect(joined.data.participants.playerA.readyAt).toBeNull();
    expect(joined.data.participants.playerB?.readyAt).toBeNull();
  });

  it("lets the host ready up before the second player joins and keeps that ready state after join", () => {
    const { alpha, beta } = createSnapshots();
    const service = createInMemoryOnlineDuelService(new SeededRandom(9));

    const room = service.createRoom({
      playerId: "player-alpha",
      sessionId: "session-alpha",
      displayName: "Alpha",
      snapshot: alpha,
      createdAt: 1000,
    });
    const readyHost = service.setReadyState(room.id, {
      seat: "playerA",
      playerId: "player-alpha",
      sessionId: "session-alpha",
      ready: true,
      updatedAt: 1500,
    });
    expect(readyHost.success).toBe(true);
    if (!readyHost.success) {
      return;
    }

    expect(readyHost.data.status).toBe("waiting_for_players");
    expect(readyHost.data.participants.playerA.readyAt).toBe(1500);

    const joined = service.joinRoom(room.id, {
      playerId: "player-beta",
      sessionId: "session-beta",
      displayName: "Beta",
      snapshot: beta,
      joinedAt: 2000,
    });
    expect(joined.success).toBe(true);
    if (!joined.success) {
      return;
    }

    expect(joined.data.status).toBe("lobby");
    expect(joined.data.participants.playerA.readyAt).toBe(1500);
    expect(joined.data.participants.playerB?.readyAt).toBeNull();
  });

  it("keeps fighter view data in sync when a room is created and joined through the client seam", async () => {
    const { alpha, beta } = createSnapshots();
    const service = createInMemoryOnlineDuelService(new SeededRandom(9));
    const transport = createLocalOnlineDuelTransport(service);
    const alphaClient = createOnlineDuelClient(transport, {
      playerId: "player-alpha",
      sessionId: "session-alpha",
      displayName: "Alpha",
    });
    const betaClient = createOnlineDuelClient(transport, {
      playerId: "player-beta",
      sessionId: "session-beta",
      displayName: "Beta",
    });

    const alphaEquipment = [{ slot: "mainHand" as const, item: null }];
    const betaEquipment = [{ slot: "offHand" as const, item: null }];
    const created = await alphaClient.createDuel(alpha, {
      figure: "rush-chip",
      equipment: alphaEquipment,
    });
    const duelId =
      created[0].type === "duel_created"
        ? created[0].duelId
        : (() => {
            throw new Error("duel was not created");
          })();

    await betaClient.joinDuel(duelId, beta, {
      figure: "kitsune-bit",
      equipment: betaEquipment,
    });

    expect(betaClient.getLastSync()?.participants).toEqual([
      {
        seat: "playerA",
        displayName: "Alpha",
        connected: true,
        ready: false,
        fighterView: {
          figure: "rush-chip",
          equipment: alphaEquipment,
        },
      },
      {
        seat: "playerB",
        displayName: "Beta",
        connected: true,
        ready: false,
        fighterView: {
          figure: "kitsune-bit",
          equipment: betaEquipment,
        },
      },
    ]);
  });

  it("pairs two matchmaking requests into the same duel", async () => {
    const { alpha, beta } = createSnapshots();
    const service = createInMemoryOnlineDuelService(new SeededRandom(9));
    const transport = createLocalOnlineDuelTransport(service);
    const alphaClient = createOnlineDuelClient(transport, {
      playerId: "queue-alpha",
      sessionId: "queue-session-alpha",
      displayName: "Alpha",
    });
    const betaClient = createOnlineDuelClient(transport, {
      playerId: "queue-beta",
      sessionId: "queue-session-beta",
      displayName: "Beta",
    });

    const alphaMessages = await alphaClient.findMatchmakingDuel(alpha, {
      figure: "rush-chip",
      equipment: [],
    });
    const created = alphaMessages.find((message) => message.type === "duel_created");
    expect(created?.type).toBe("duel_created");
    if (created?.type !== "duel_created") {
      return;
    }

    const betaMessages = await betaClient.findMatchmakingDuel(beta, {
      figure: "kitsune-bit",
      equipment: [],
    });
    const betaSync = betaMessages.find((message) => message.type === "duel_state_sync");
    expect(betaSync?.type).toBe("duel_state_sync");
    if (betaSync?.type !== "duel_state_sync") {
      return;
    }

    expect(betaSync.payload.duelId).toBe(created.duelId);
    expect(betaSync.payload.yourSeat).toBe("playerB");

    const alphaRefresh = await alphaClient.requestSync(created.duelId);
    const alphaSync = alphaRefresh.find((message) => message.type === "duel_state_sync");
    expect(alphaSync?.type).toBe("duel_state_sync");
    if (alphaSync?.type !== "duel_state_sync") {
      return;
    }

    expect(alphaSync.payload.participants).toHaveLength(2);
    expect(alphaSync.payload.status).toBe("lobby");
    expect(alphaSync.payload.roomCode).toBe(betaSync.payload.roomCode);
  });

  it("requires a lobby-ready check before duel actions can be submitted", () => {
    const { alpha, beta } = createSnapshots();
    const room = createOnlineDuelRoom({
      playerId: "player-alpha",
      sessionId: "session-alpha",
      displayName: "Alpha",
      snapshot: alpha,
      createdAt: 1000,
    });
    const joined = joinOnlineDuelRoom(room, {
      playerId: "player-beta",
      sessionId: "session-beta",
      displayName: "Beta",
      snapshot: beta,
      joinedAt: 2000,
    });

    expect(joined.success).toBe(true);
    if (!joined.success) {
      return;
    }

    const blocked = submitOnlineDuelAction(joined.data, {
      seat: "playerA",
      playerId: "player-alpha",
      sessionId: "session-alpha",
      action: createBasicAttackAction({
        attackerId: alpha.characterId,
        attackZone: "head",
        defenseZones: ["chest", "belly"],
      }),
      submittedAt: 3000,
    });

    expect(blocked).toEqual({
      success: false,
      reason: "not_ready",
    });
  });

  it("collects both submitted actions before round resolution once both players are ready", () => {
    const { alpha, beta } = createSnapshots();
    const service = createInMemoryOnlineDuelService(new SeededRandom(9));
    const room = service.createRoom({
      playerId: "player-alpha",
      sessionId: "session-alpha",
      displayName: "Alpha",
      snapshot: alpha,
      createdAt: 1000,
    });

    const joined = service.joinRoom(room.id, {
      playerId: "player-beta",
      sessionId: "session-beta",
      displayName: "Beta",
      snapshot: beta,
      joinedAt: 2000,
    });
    expect(joined.success).toBe(true);
    if (!joined.success) {
      return;
    }

    const readyA = service.setReadyState(room.id, {
      seat: "playerA",
      playerId: "player-alpha",
      sessionId: "session-alpha",
      ready: true,
      updatedAt: 2500,
    });
    expect(readyA.success).toBe(true);
    const readyB = service.setReadyState(room.id, {
      seat: "playerB",
      playerId: "player-beta",
      sessionId: "session-beta",
      ready: true,
      updatedAt: 2600,
    });
    expect(readyB.success).toBe(true);
    if (!readyB.success) {
      return;
    }

    const afterFirstSubmit = submitOnlineDuelAction(readyB.data, {
      seat: "playerA",
      playerId: "player-alpha",
      sessionId: "session-alpha",
      action: createBasicAttackAction({
        attackerId: alpha.characterId,
        attackZone: "head",
        defenseZones: ["chest", "belly"],
      }),
      submittedAt: 3000,
    });

    expect(afterFirstSubmit.success).toBe(true);
    if (!afterFirstSubmit.success) {
      return;
    }

    expect(afterFirstSubmit.data.status).toBe("planning");

    const afterSecondSubmit = submitOnlineDuelAction(afterFirstSubmit.data, {
      seat: "playerB",
      playerId: "player-beta",
      sessionId: "session-beta",
      action: createBasicAttackAction({
        attackerId: beta.characterId,
        attackZone: "legs",
        defenseZones: ["head", "waist"],
      }),
      submittedAt: 4000,
    });

    expect(afterSecondSubmit.success).toBe(true);
    if (!afterSecondSubmit.success) {
      return;
    }

    expect(afterSecondSubmit.data.status).toBe("ready_to_resolve");
    expect(afterSecondSubmit.data.currentRound?.submissions.playerA?.action.attackerId).toBe(alpha.characterId);
    expect(afterSecondSubmit.data.currentRound?.submissions.playerB?.action.attackerId).toBe(beta.characterId);
  });

  it("resolves an authority-side duel round and advances back to planning", () => {
    const { alpha, beta } = createSnapshots();
    const service = createInMemoryOnlineDuelService(new SeededRandom(9));
    const room = service.createRoom({
      playerId: "player-alpha",
      sessionId: "session-alpha",
      displayName: "Alpha",
      snapshot: alpha,
      createdAt: 1000,
    });
    service.joinRoom(room.id, {
      playerId: "player-beta",
      sessionId: "session-beta",
      displayName: "Beta",
      snapshot: beta,
      joinedAt: 2000,
    });
    service.setReadyState(room.id, {
      seat: "playerA",
      playerId: "player-alpha",
      sessionId: "session-alpha",
      ready: true,
      updatedAt: 2500,
    });
    const readyRoom = service.setReadyState(room.id, {
      seat: "playerB",
      playerId: "player-beta",
      sessionId: "session-beta",
      ready: true,
      updatedAt: 2600,
    });
    expect(readyRoom.success).toBe(true);
    if (!readyRoom.success) {
      return;
    }

    const withAlphaAction = submitOnlineDuelAction(readyRoom.data, {
      seat: "playerA",
      playerId: "player-alpha",
      sessionId: "session-alpha",
      action: createBasicAttackAction({
        attackerId: alpha.characterId,
        attackZone: "head",
        defenseZones: ["chest", "belly"],
      }),
      submittedAt: 3000,
    });
    expect(withAlphaAction.success).toBe(true);
    if (!withAlphaAction.success) {
      return;
    }

    const bothSubmitted = submitOnlineDuelAction(withAlphaAction.data, {
      seat: "playerB",
      playerId: "player-beta",
      sessionId: "session-beta",
      action: createBasicAttackAction({
        attackerId: beta.characterId,
        attackZone: "legs",
        defenseZones: ["head", "waist"],
      }),
      submittedAt: 4000,
    });
    expect(bothSubmitted.success).toBe(true);
    if (!bothSubmitted.success) {
      return;
    }

    const resolved = resolveOnlineDuelRound(bothSubmitted.data, new SeededRandom(9));

    expect(resolved.success).toBe(true);
    if (!resolved.success) {
      return;
    }

    expect(resolved.data.combatState?.round).toBe(2);
    expect(resolved.data.combatState?.log.length).toBeGreaterThan(0);
    expect(resolved.data.status).toBe("planning");
    expect(resolved.data.currentRound?.round).toBe(2);
    expect(resolved.data.currentRound?.submissions.playerA).toBeUndefined();
    expect(resolved.data.currentRound?.submissions.playerB).toBeUndefined();
  });

  it("rejects actions that do not belong to the declared seat", () => {
    const { alpha, beta } = createSnapshots();
    const room = createOnlineDuelRoom({
      playerId: "player-alpha",
      sessionId: "session-alpha",
      displayName: "Alpha",
      snapshot: alpha,
    });
    const joined = joinOnlineDuelRoom(room, {
      playerId: "player-beta",
      sessionId: "session-beta",
      displayName: "Beta",
      snapshot: beta,
    });

    expect(joined.success).toBe(true);
    if (!joined.success) {
      return;
    }

    const invalidSubmit = submitOnlineDuelAction(joined.data, {
      seat: "playerA",
      playerId: "player-alpha",
      sessionId: "session-alpha",
      action: createBasicAttackAction({
        attackerId: beta.characterId,
        attackZone: "legs",
        defenseZones: ["head", "waist"],
      }),
    });

    expect(invalidSubmit).toEqual({
      success: false,
      reason: "not_ready",
    });
  });

  it("persists rooms through the in-memory authority service and exposes state sync", () => {
    const { alpha, beta } = createSnapshots();
    const service = createInMemoryOnlineDuelService(new SeededRandom(9));
    const room = service.createRoom({
      playerId: "player-alpha",
      sessionId: "session-alpha",
      displayName: "Alpha",
      snapshot: alpha,
      createdAt: 1000,
    });

    const joined = service.joinRoom(room.id, {
      playerId: "player-beta",
      sessionId: "session-beta",
      displayName: "Beta",
      snapshot: beta,
      joinedAt: 2000,
    });
    expect(joined.success).toBe(true);
    if (!joined.success) {
      return;
    }

    service.setReadyState(room.id, {
      seat: "playerA",
      playerId: "player-alpha",
      sessionId: "session-alpha",
      ready: true,
      updatedAt: 2500,
    });
    service.setReadyState(room.id, {
      seat: "playerB",
      playerId: "player-beta",
      sessionId: "session-beta",
      ready: true,
      updatedAt: 2600,
    });

    const submittedA = service.submitAction(room.id, {
      seat: "playerA",
      playerId: "player-alpha",
      sessionId: "session-alpha",
      action: createBasicAttackAction({
        attackerId: alpha.characterId,
        attackZone: "head",
        defenseZones: ["chest", "belly"],
      }),
      submittedAt: 3000,
    });
    expect(submittedA.success).toBe(true);
    if (!submittedA.success) {
      return;
    }

    const submittedB = service.submitAction(room.id, {
      seat: "playerB",
      playerId: "player-beta",
      sessionId: "session-beta",
      action: createBasicAttackAction({
        attackerId: beta.characterId,
        attackZone: "legs",
        defenseZones: ["head", "waist"],
      }),
      submittedAt: 4000,
    });
    expect(submittedB.success).toBe(true);
    if (!submittedB.success) {
      return;
    }

    const syncBeforeResolve = service.buildStateSync(room.id, "player-alpha");
    expect(stripCombatState(syncBeforeResolve)).toEqual({
      success: true,
      data: {
        duelId: room.id,
        roomCode: room.roomCode,
        revision: 6,
        status: "ready_to_resolve",
        round: 1,
        winnerSeat: null,
        yourSeat: "playerA",
        resumeToken: expect.any(String),
        participants: [
          { seat: "playerA", displayName: "Alpha", connected: true, ready: true },
          { seat: "playerB", displayName: "Beta", connected: true, ready: true },
        ],
        currentRoundState: {
          round: 1,
          submittedSeats: ["playerA", "playerB"],
          yourActionSubmitted: true,
          opponentActionSubmitted: true,
          readyToResolve: true,
        },
      },
    });

    const resolved = service.resolveRound(room.id);
    expect(resolved.success).toBe(true);
    if (!resolved.success) {
      return;
    }

    const stored = service.getRoom(room.id);
    expect(stored.success).toBe(true);
    if (!stored.success) {
      return;
    }

    expect(stored.data.combatState?.round).toBe(2);
    expect(stored.data.currentRound?.round).toBe(2);

    const missing = service.getRoom("missing-room");
    expect(missing).toEqual({
      success: false,
      reason: "duel_not_found",
    });
  });

  it("translates create and join transport messages into backend server messages", () => {
    const { alpha, beta } = createSnapshots();
    const service = createInMemoryOnlineDuelService(new SeededRandom(9));

    const created = handleOnlineDuelClientMessage(service, {
      type: "create_duel",
      playerId: "player-alpha",
      sessionId: "session-alpha",
      displayName: "Alpha",
      snapshot: alpha,
    });

    expect(created[0]).toMatchObject({
      type: "duel_created",
      roomCode: expect.any(String),
      yourSeat: "playerA",
    });

    const duelId =
      created[0].type === "duel_created"
        ? created[0].duelId
        : (() => {
            throw new Error("duel was not created");
          })();

    const joined = handleOnlineDuelClientMessage(service, {
      type: "join_duel",
      duelId,
      playerId: "player-beta",
      sessionId: "session-beta",
      displayName: "Beta",
      snapshot: beta,
    });

    expect(stripCombatState(joined)).toEqual([
      {
        type: "duel_state_sync",
        payload: {
          duelId,
          roomCode: expect.any(String),
          revision: 2,
          status: "lobby",
          round: 1,
          winnerSeat: null,
          yourSeat: "playerB",
          resumeToken: expect.any(String),
          participants: [
            { seat: "playerA", displayName: "Alpha", connected: true, ready: false },
            { seat: "playerB", displayName: "Beta", connected: true, ready: false },
          ],
        },
      },
    ]);
  });

  it("joins a duel by room code through the transport layer", () => {
    const { alpha, beta } = createSnapshots();
    const service = createInMemoryOnlineDuelService(new SeededRandom(9));

    const created = handleOnlineDuelClientMessage(service, {
      type: "create_duel",
      playerId: "player-alpha",
      sessionId: "session-alpha",
      displayName: "Alpha",
      snapshot: alpha,
    });

    const roomCode =
      created[0]?.type === "duel_created"
        ? created[0].roomCode
        : (() => {
            throw new Error("duel was not created");
          })();

    const joined = handleOnlineDuelClientMessage(service, {
      type: "join_duel_by_code",
      roomCode,
      playerId: "player-beta",
      sessionId: "session-beta",
      displayName: "Beta",
      snapshot: beta,
    });

    expect(stripCombatState(joined)).toEqual([
      {
        type: "duel_state_sync",
        payload: {
          duelId: expect.any(String),
          roomCode,
          revision: 2,
          status: "lobby",
          round: 1,
          winnerSeat: null,
          yourSeat: "playerB",
          resumeToken: expect.any(String),
          participants: [
            { seat: "playerA", displayName: "Alpha", connected: true, ready: false },
            { seat: "playerB", displayName: "Beta", connected: true, ready: false },
          ],
        },
      },
    ]);
  });

  it("updates readiness and auto-resolves a round when transport messages complete both submissions", () => {
    const { alpha, beta } = createSnapshots();
    const service = createInMemoryOnlineDuelService(new SeededRandom(9));
    const room = service.createRoom({
      playerId: "player-alpha",
      sessionId: "session-alpha",
      displayName: "Alpha",
      snapshot: alpha,
      createdAt: 1000,
    });

    service.joinRoom(room.id, {
      playerId: "player-beta",
      sessionId: "session-beta",
      displayName: "Beta",
      snapshot: beta,
      joinedAt: 2000,
    });

    const readyA = handleOnlineDuelClientMessage(service, {
      type: "set_ready",
      duelId: room.id,
      seat: "playerA",
      playerId: "player-alpha",
      sessionId: "session-alpha",
      ready: true,
    });
    expect(readyA.some((message) => message.type === "readiness_updated")).toBe(true);
    const readyB = handleOnlineDuelClientMessage(service, {
      type: "set_ready",
      duelId: room.id,
      seat: "playerB",
      playerId: "player-beta",
      sessionId: "session-beta",
      ready: true,
    });
    expect(readyB.some((message) => message.type === "duel_ready")).toBe(true);

    const firstSubmit = handleOnlineDuelClientMessage(service, {
      type: "submit_round_action",
      duelId: room.id,
      seat: "playerA",
      playerId: "player-alpha",
      sessionId: "session-alpha",
      action: createBasicAttackAction({
        attackerId: alpha.characterId,
        attackZone: "head",
        defenseZones: ["chest", "belly"],
      }),
    });

    expect(stripCombatState(firstSubmit)).toEqual([
      {
        type: "duel_state_sync",
        payload: {
          duelId: room.id,
          roomCode: room.roomCode,
          revision: 5,
          status: "planning",
          round: 1,
          winnerSeat: null,
          yourSeat: "playerA",
          resumeToken: expect.any(String),
          participants: [
            { seat: "playerA", displayName: "Alpha", connected: true, ready: true },
            { seat: "playerB", displayName: "Beta", connected: true, ready: true },
          ],
          currentRoundState: {
            round: 1,
            submittedSeats: ["playerA"],
            yourActionSubmitted: true,
            opponentActionSubmitted: false,
            readyToResolve: false,
          },
        },
      },
    ]);

    const secondSubmit = handleOnlineDuelClientMessage(service, {
      type: "submit_round_action",
      duelId: room.id,
      seat: "playerB",
      playerId: "player-beta",
      sessionId: "session-beta",
      action: createBasicAttackAction({
        attackerId: beta.characterId,
        attackZone: "legs",
        defenseZones: ["head", "waist"],
      }),
    });

    expect(secondSubmit.some((message) => message.type === "round_ready")).toBe(true);
    expect(secondSubmit.some((message) => message.type === "round_resolved")).toBe(true);
    expect(secondSubmit.find((message) => message.type === "round_resolved")).toMatchObject({
      type: "round_resolved",
      duelId: room.id,
      winnerSeat: null,
      summary: {
        round: 1,
        winnerSeat: null,
        combatants: [
          { name: "Alpha", currentHp: expect.any(Number), maxHp: expect.any(Number) },
          { name: "Beta", currentHp: expect.any(Number), maxHp: expect.any(Number) },
        ],
      },
    });
    expect(stripCombatState(secondSubmit.at(-1))).toEqual({
      type: "duel_state_sync",
      payload: {
        duelId: room.id,
        roomCode: room.roomCode,
        revision: 7,
        status: "planning",
        round: 2,
        winnerSeat: null,
        yourSeat: "playerB",
        resumeToken: expect.any(String),
        participants: [
          { seat: "playerA", displayName: "Alpha", connected: true, ready: true },
          { seat: "playerB", displayName: "Beta", connected: true, ready: true },
        ],
        currentRoundState: {
          round: 2,
          submittedSeats: [],
          yourActionSubmitted: false,
          opponentActionSubmitted: false,
          readyToResolve: false,
        },
        lastResolvedRound: {
          round: 1,
          winnerSeat: null,
          entries: expect.any(Array),
          combatants: [
            { id: alpha.characterId, name: "Alpha", currentHp: expect.any(Number), maxHp: expect.any(Number) },
            { id: beta.characterId, name: "Beta", currentHp: expect.any(Number), maxHp: expect.any(Number) },
          ],
        },
      },
    });
  });

  it("returns a fresh sync when round resolution fails so clients can recover room state", () => {
    const { alpha, beta } = createSnapshots();
    const service = createInMemoryOnlineDuelService(new SeededRandom(9));
    const room = service.createRoom({
      playerId: "player-alpha",
      sessionId: "session-alpha",
      displayName: "Alpha",
      snapshot: alpha,
      createdAt: 1000,
    });

    service.joinRoom(room.id, {
      playerId: "player-beta",
      sessionId: "session-beta",
      displayName: "Beta",
      snapshot: beta,
      joinedAt: 2000,
    });

    handleOnlineDuelClientMessage(service, {
      type: "set_ready",
      duelId: room.id,
      seat: "playerA",
      playerId: "player-alpha",
      sessionId: "session-alpha",
      ready: true,
    });
    handleOnlineDuelClientMessage(service, {
      type: "set_ready",
      duelId: room.id,
      seat: "playerB",
      playerId: "player-beta",
      sessionId: "session-beta",
      ready: true,
    });

    handleOnlineDuelClientMessage(service, {
      type: "submit_round_action",
      duelId: room.id,
      seat: "playerA",
      playerId: "player-alpha",
      sessionId: "session-alpha",
      action: createBasicAttackAction({
        attackerId: alpha.characterId,
        attackZone: "head",
        defenseZones: ["chest", "belly"],
      }),
    });

    const secondSubmit = handleOnlineDuelClientMessage(service, {
      type: "submit_round_action",
      duelId: room.id,
      seat: "playerB",
      playerId: "player-beta",
      sessionId: "session-beta",
      action: createBasicAttackAction({
        attackerId: beta.characterId,
        attackZone: "legs",
        defenseZones: ["head", "head"],
      }),
    });

    expect(secondSubmit.some((message) => message.type === "round_ready")).toBe(true);
    expect(secondSubmit).toContainEqual({
      type: "duel_error",
      duelId: room.id,
      reason: "duplicate_defense_zones",
    });
    expect(stripCombatState(secondSubmit.at(-1))).toEqual({
      type: "duel_state_sync",
      payload: {
        duelId: room.id,
        roomCode: room.roomCode,
        revision: 6,
        status: "ready_to_resolve",
        round: 1,
        winnerSeat: null,
        yourSeat: "playerB",
        resumeToken: expect.any(String),
        participants: [
          { seat: "playerA", displayName: "Alpha", connected: true, ready: true },
          { seat: "playerB", displayName: "Beta", connected: true, ready: true },
        ],
        currentRoundState: {
          round: 1,
          submittedSeats: ["playerA", "playerB"],
          yourActionSubmitted: true,
          opponentActionSubmitted: true,
          readyToResolve: true,
        },
      },
    });
  });

  it("lets local frontend clients talk through the transport seam and keep sync state", async () => {
    const { alpha, beta } = createSnapshots();
    const service = createInMemoryOnlineDuelService(new SeededRandom(9));
    const transport = createLocalOnlineDuelTransport(service);
    const alphaClient = createOnlineDuelClient(transport, {
      playerId: "player-alpha",
      sessionId: "session-alpha",
      displayName: "Alpha",
    });
    const betaClient = createOnlineDuelClient(transport, {
      playerId: "player-beta",
      sessionId: "session-beta",
      displayName: "Beta",
    });

    const created = await alphaClient.createDuel(alpha);
    expect(created[0]).toMatchObject({
      type: "duel_created",
      roomCode: expect.any(String),
      yourSeat: "playerA",
    });

    const duelId =
      created[0].type === "duel_created"
        ? created[0].duelId
        : (() => {
            throw new Error("duel was not created");
          })();

    await betaClient.joinDuel(duelId, beta);
    expect(stripCombatState(betaClient.getLastSync())).toEqual({
      duelId,
      roomCode: expect.any(String),
      revision: 2,
      status: "lobby",
      round: 1,
      winnerSeat: null,
      yourSeat: "playerB",
      resumeToken: expect.any(String),
      participants: [
        { seat: "playerA", displayName: "Alpha", connected: true, ready: false },
        { seat: "playerB", displayName: "Beta", connected: true, ready: false },
      ],
    });

    await alphaClient.setReady(duelId, "playerA", true);
    await betaClient.setReady(duelId, "playerB", true);

    await alphaClient.submitRoundAction(
      duelId,
      "playerA",
      createBasicAttackAction({
        attackerId: alpha.characterId,
        attackZone: "head",
        defenseZones: ["chest", "belly"],
      })
    );
    const betaMessages = await betaClient.submitRoundAction(
      duelId,
      "playerB",
      createBasicAttackAction({
        attackerId: beta.characterId,
        attackZone: "legs",
        defenseZones: ["head", "waist"],
      })
    );

    expect(betaMessages.some((message) => message.type === "round_ready")).toBe(true);
    expect(betaMessages.some((message) => message.type === "round_resolved")).toBe(true);
    expect(stripCombatState(betaClient.getLastSync())).toEqual({
      duelId,
      roomCode: expect.any(String),
      revision: 7,
      status: "planning",
      round: 2,
      winnerSeat: null,
      yourSeat: "playerB",
      resumeToken: expect.any(String),
      participants: [
        { seat: "playerA", displayName: "Alpha", connected: true, ready: true },
        { seat: "playerB", displayName: "Beta", connected: true, ready: true },
      ],
      currentRoundState: {
        round: 2,
        submittedSeats: [],
        yourActionSubmitted: false,
        opponentActionSubmitted: false,
        readyToResolve: false,
      },
      lastResolvedRound: {
        round: 1,
        winnerSeat: null,
        entries: expect.any(Array),
        combatants: [
          { id: alpha.characterId, name: "Alpha", currentHp: expect.any(Number), maxHp: expect.any(Number) },
          { id: beta.characterId, name: "Beta", currentHp: expect.any(Number), maxHp: expect.any(Number) },
        ],
      },
    });
  });

  it("ignores stale pushed sync messages and keeps the newest revision in the client", async () => {
    const { alpha, beta } = createSnapshots();
    const service = createInMemoryOnlineDuelService(new SeededRandom(9));
    const transport = createLocalOnlineDuelTransport(service);
    const alphaClient = createOnlineDuelClient(transport, {
      playerId: "player-alpha",
      sessionId: "session-alpha",
      displayName: "Alpha",
    });
    const betaClient = createOnlineDuelClient(transport, {
      playerId: "player-beta",
      sessionId: "session-beta",
      displayName: "Beta",
    });

    const created = await alphaClient.createDuel(alpha);
    const duelId =
      created[0].type === "duel_created"
        ? created[0].duelId
        : (() => {
            throw new Error("duel was not created");
          })();

    await betaClient.joinDuel(duelId, beta);
    await alphaClient.requestSync(duelId);

    const freshSync = alphaClient.getLastSync();
    expect(freshSync?.revision).toBe(2);

    const staleAccepted = alphaClient.acceptServerMessage({
      type: "duel_state_sync",
      payload: {
        duelId,
        roomCode: freshSync?.roomCode ?? "ROOM01",
        revision: 1,
        status: "waiting_for_players",
        round: null,
        winnerSeat: null,
        yourSeat: "playerA",
        resumeToken: freshSync?.resumeToken ?? "resume-token",
        participants: [{ seat: "playerA", displayName: "Alpha", connected: true, ready: false }],
      },
    });

    expect(staleAccepted).toBe(false);
    expect(alphaClient.getLastSync()?.revision).toBe(2);

    const freshAccepted = alphaClient.acceptServerMessage({
      type: "duel_state_sync",
      payload: {
        duelId,
        roomCode: freshSync?.roomCode ?? "ROOM01",
        revision: 3,
        status: "lobby",
        round: 1,
        winnerSeat: null,
        yourSeat: "playerA",
        resumeToken: freshSync?.resumeToken ?? "resume-token",
        participants: [
          { seat: "playerA", displayName: "Alpha", connected: true, ready: true },
          { seat: "playerB", displayName: "Beta", connected: true, ready: false },
        ],
      },
    });

    expect(freshAccepted).toBe(true);
    expect(alphaClient.getLastSync()?.revision).toBe(3);
    expect(alphaClient.getLastSync()?.participants).toEqual([
      { seat: "playerA", displayName: "Alpha", connected: true, ready: true },
      { seat: "playerB", displayName: "Beta", connected: true, ready: false },
    ]);
  });

  it("pauses the duel when a participant disconnects and restores lobby sync on reconnect", () => {
    const { alpha, beta } = createSnapshots();
    const service = createInMemoryOnlineDuelService(new SeededRandom(9));
    const room = service.createRoom({
      playerId: "player-alpha",
      sessionId: "session-alpha",
      displayName: "Alpha",
      snapshot: alpha,
      createdAt: 1000,
    });

    service.joinRoom(room.id, {
      playerId: "player-beta",
      sessionId: "session-beta",
      displayName: "Beta",
      snapshot: beta,
      joinedAt: 2000,
    });
    service.setReadyState(room.id, {
      seat: "playerA",
      playerId: "player-alpha",
      sessionId: "session-alpha",
      ready: true,
      updatedAt: 2500,
    });
    service.setReadyState(room.id, {
      seat: "playerB",
      playerId: "player-beta",
      sessionId: "session-beta",
      ready: true,
      updatedAt: 2600,
    });

    const disconnected = handleOnlineDuelClientMessage(service, {
      type: "set_connection",
      duelId: room.id,
      seat: "playerB",
      playerId: "player-beta",
      sessionId: "session-beta",
      connected: false,
    });

    expect(disconnected.some((message) => message.type === "connection_updated")).toBe(true);
    expect(stripCombatState(disconnected.at(-1))).toEqual({
      type: "duel_state_sync",
      payload: {
        duelId: room.id,
        roomCode: room.roomCode,
        revision: 5,
        status: "lobby",
        round: 1,
        winnerSeat: null,
        yourSeat: "playerB",
        resumeToken: expect.any(String),
        participants: [
          { seat: "playerA", displayName: "Alpha", connected: true, ready: true },
          { seat: "playerB", displayName: "Beta", connected: false, ready: false },
        ],
      },
    });

    const blockedReady = service.setReadyState(room.id, {
      seat: "playerB",
      playerId: "player-beta",
      sessionId: "session-beta",
      ready: true,
      updatedAt: 2700,
    });
    expect(blockedReady).toEqual({
      success: false,
      reason: "participant_disconnected",
    });

    const reconnected = handleOnlineDuelClientMessage(service, {
      type: "set_connection",
      duelId: room.id,
      seat: "playerB",
      playerId: "player-beta",
      sessionId: "session-beta",
      connected: true,
    });

    expect(stripCombatState(reconnected.at(-1))).toEqual({
      type: "duel_state_sync",
      payload: {
        duelId: room.id,
        roomCode: room.roomCode,
        revision: 6,
        status: "lobby",
        round: 1,
        winnerSeat: null,
        yourSeat: "playerB",
        resumeToken: expect.any(String),
        participants: [
          { seat: "playerA", displayName: "Alpha", connected: true, ready: true },
          { seat: "playerB", displayName: "Beta", connected: true, ready: false },
        ],
      },
    });
  });

  it("rejoins a disconnected participant by room code and restores their seat", () => {
    const { alpha, beta } = createSnapshots();
    const service = createInMemoryOnlineDuelService(new SeededRandom(9));

    const created = handleOnlineDuelClientMessage(service, {
      type: "create_duel",
      playerId: "player-alpha",
      sessionId: "session-alpha",
      displayName: "Alpha",
      snapshot: alpha,
    });

    const roomCode =
      created[0]?.type === "duel_created"
        ? created[0].roomCode
        : (() => {
            throw new Error("duel was not created");
          })();
    const duelId =
      created[0]?.type === "duel_created"
        ? created[0].duelId
        : (() => {
            throw new Error("duel was not created");
          })();

    handleOnlineDuelClientMessage(service, {
      type: "join_duel_by_code",
      roomCode,
      playerId: "player-beta",
      sessionId: "session-beta",
      displayName: "Beta",
      snapshot: beta,
    });

    handleOnlineDuelClientMessage(service, {
      type: "set_connection",
      duelId,
      seat: "playerB",
      playerId: "player-beta",
      sessionId: "session-beta",
      connected: false,
    });

    const rejoined = handleOnlineDuelClientMessage(service, {
      type: "join_duel_by_code",
      roomCode,
      playerId: "player-beta",
      sessionId: "session-beta-2",
      displayName: "Beta",
      snapshot: beta,
    });

    expect(stripCombatState(rejoined)).toEqual([
      {
        type: "duel_state_sync",
        payload: {
          duelId,
          roomCode,
          revision: 4,
          status: "lobby",
          round: 1,
          winnerSeat: null,
          yourSeat: "playerB",
          resumeToken: expect.any(String),
          participants: [
            { seat: "playerA", displayName: "Alpha", connected: true, ready: false },
            { seat: "playerB", displayName: "Beta", connected: true, ready: false },
          ],
        },
      },
    ]);
  });

  it("abandons stale rooms when the authority timeout sweep runs", () => {
    const { alpha, beta } = createSnapshots();
    const service = createInMemoryOnlineDuelService(new SeededRandom(9));
    const room = service.createRoom({
      playerId: "player-alpha",
      sessionId: "session-alpha",
      displayName: "Alpha",
      snapshot: alpha,
      createdAt: 1000,
    });

    service.joinRoom(room.id, {
      playerId: "player-beta",
      sessionId: "session-beta",
      displayName: "Beta",
      snapshot: beta,
      joinedAt: 2000,
    });
    service.setReadyState(room.id, {
      seat: "playerA",
      playerId: "player-alpha",
      sessionId: "session-alpha",
      ready: true,
      updatedAt: 2500,
    });
    service.setReadyState(room.id, {
      seat: "playerB",
      playerId: "player-beta",
      sessionId: "session-beta",
      ready: true,
      updatedAt: 2600,
    });

    const expiredCount = service.expireStaleRooms(2600 + 3 * 60 * 1000);
    expect(expiredCount).toBe(1);

    const sync = service.buildStateSync(room.id, "player-alpha");
    expect(stripCombatState(sync)).toEqual({
      success: true,
      data: {
        duelId: room.id,
        roomCode: room.roomCode,
        revision: 4,
        status: "abandoned",
        round: 1,
        winnerSeat: null,
        yourSeat: "playerA",
        resumeToken: expect.any(String),
        participants: [
          { seat: "playerA", displayName: "Alpha", connected: true, ready: false },
          { seat: "playerB", displayName: "Beta", connected: true, ready: false },
        ],
      },
    });
  });

  it("rejects stale round submissions when the client acts on an old round", () => {
    const { alpha, beta } = createSnapshots();
    const service = createInMemoryOnlineDuelService(new SeededRandom(9));
    const room = service.createRoom({
      playerId: "player-alpha",
      sessionId: "session-alpha",
      displayName: "Alpha",
      snapshot: alpha,
      createdAt: 1000,
    });

    const joined = service.joinRoom(room.id, {
      playerId: "player-beta",
      sessionId: "session-beta",
      displayName: "Beta",
      snapshot: beta,
      joinedAt: 2000,
    });
    expect(joined.success).toBe(true);
    if (!joined.success) {
      return;
    }

    const readyA = service.setReadyState(room.id, {
      seat: "playerA",
      playerId: "player-alpha",
      sessionId: "session-alpha",
      ready: true,
      updatedAt: 2500,
    });
    expect(readyA.success).toBe(true);
    const readyB = service.setReadyState(room.id, {
      seat: "playerB",
      playerId: "player-beta",
      sessionId: "session-beta",
      ready: true,
      updatedAt: 2600,
    });
    expect(readyB.success).toBe(true);

    const staleSubmit = service.submitAction(room.id, {
      seat: "playerB",
      playerId: "player-beta",
      sessionId: "session-beta",
      action: createBasicAttackAction({
        attackerId: beta.characterId,
        attackZone: "legs",
        defenseZones: ["head", "waist"],
      }),
      expectedRound: 0,
      submittedAt: 3100,
    });

    expect(staleSubmit).toEqual({
      success: false,
      reason: "stale_sync",
    });
  });

  it("rejects stale resume tokens after a player rejoins with a fresh session", () => {
    const { alpha, beta } = createSnapshots();
    const service = createInMemoryOnlineDuelService(new SeededRandom(9));
    const created = handleOnlineDuelClientMessage(service, {
      type: "create_duel",
      playerId: "player-alpha",
      sessionId: "session-alpha",
      displayName: "Alpha",
      snapshot: alpha,
    });
    const createdSync =
      created[1]?.type === "duel_state_sync"
        ? created[1].payload
        : (() => {
            throw new Error("host sync was not returned");
          })();
    const roomCode =
      created[0]?.type === "duel_created"
        ? created[0].roomCode
        : (() => {
            throw new Error("duel was not created");
          })();
    const duelId =
      created[0]?.type === "duel_created"
        ? created[0].duelId
        : (() => {
            throw new Error("duel was not created");
          })();

    const joined = handleOnlineDuelClientMessage(service, {
      type: "join_duel_by_code",
      roomCode,
      playerId: "player-beta",
      sessionId: "session-beta",
      displayName: "Beta",
      snapshot: beta,
    });
    const betaSync =
      joined[0]?.type === "duel_state_sync"
        ? joined[0].payload
        : (() => {
            throw new Error("guest sync was not returned");
          })();

    handleOnlineDuelClientMessage(service, {
      type: "set_connection",
      duelId,
      seat: "playerB",
      playerId: "player-beta",
      sessionId: "session-beta",
      connected: false,
    });

    const rejoined = handleOnlineDuelClientMessage(service, {
      type: "join_duel_by_code",
      roomCode,
      playerId: "player-beta",
      sessionId: "session-beta-2",
      displayName: "Beta",
      snapshot: beta,
    });
    const betaRejoinSync =
      rejoined[0]?.type === "duel_state_sync"
        ? rejoined[0].payload
        : (() => {
            throw new Error("guest rejoin sync was not returned");
          })();

    expect(betaRejoinSync.resumeToken).not.toBe(betaSync.resumeToken);

    const staleHostResume = service.buildStateSync(duelId, "player-alpha", `${createdSync.resumeToken}-stale`);
    expect(staleHostResume).toEqual({
      success: false,
      reason: "stale_session",
    });

    const staleGuestResume = service.buildStateSync(duelId, "player-beta", betaSync.resumeToken);
    expect(staleGuestResume).toEqual({
      success: false,
      reason: "stale_session",
    });

    const freshGuestResume = service.buildStateSync(duelId, "player-beta", betaRejoinSync.resumeToken);
    expect(stripCombatState(freshGuestResume)).toEqual({
      success: true,
      data: {
        duelId,
        roomCode,
        revision: 4,
        status: "lobby",
        round: 1,
        winnerSeat: null,
        yourSeat: "playerB",
        resumeToken: betaRejoinSync.resumeToken,
        participants: [
          { seat: "playerA", displayName: "Alpha", connected: true, ready: false },
          { seat: "playerB", displayName: "Beta", connected: true, ready: false },
        ],
      },
    });
  });

  it("hands seat ownership to a newer live session and displaces the old one", () => {
    const { alpha, beta } = createSnapshots();
    const service = createInMemoryOnlineDuelService(new SeededRandom(9));
    const created = handleOnlineDuelClientMessage(service, {
      type: "create_duel",
      playerId: "player-alpha",
      sessionId: "session-alpha",
      displayName: "Alpha",
      snapshot: alpha,
    });
    const duelId =
      created[0]?.type === "duel_created"
        ? created[0].duelId
        : (() => {
            throw new Error("duel was not created");
          })();
    const roomCode =
      created[0]?.type === "duel_created"
        ? created[0].roomCode
        : (() => {
            throw new Error("duel was not created");
          })();

    handleOnlineDuelClientMessage(service, {
      type: "join_duel_by_code",
      roomCode,
      playerId: "player-beta",
      sessionId: "session-beta",
      displayName: "Beta",
      snapshot: beta,
    });

    const handedOff = handleOnlineDuelClientMessage(service, {
      type: "join_duel_by_code",
      roomCode,
      playerId: "player-beta",
      sessionId: "session-beta-2",
      displayName: "Beta",
      snapshot: beta,
    });

    expect(stripCombatState(handedOff)).toEqual([
      {
        type: "duel_state_sync",
        payload: {
          duelId,
          roomCode,
          revision: 3,
          status: "lobby",
          round: 1,
          winnerSeat: null,
          yourSeat: "playerB",
          resumeToken: expect.any(String),
          participants: [
            { seat: "playerA", displayName: "Alpha", connected: true, ready: false },
            { seat: "playerB", displayName: "Beta", connected: true, ready: false },
          ],
        },
      },
    ]);

    const displacedReady = handleOnlineDuelClientMessage(service, {
      type: "set_ready",
      duelId,
      seat: "playerB",
      playerId: "player-beta",
      sessionId: "session-beta",
      ready: true,
    });
    expect(displacedReady).toEqual([
      {
        type: "duel_error",
        duelId,
        reason: "displaced_session",
      },
    ]);

    const liveReady = handleOnlineDuelClientMessage(service, {
      type: "set_ready",
      duelId,
      seat: "playerB",
      playerId: "player-beta",
      sessionId: "session-beta-2",
      ready: true,
    });
    expect(liveReady.some((message) => message.type === "readiness_updated")).toBe(true);
  });

  it("resets a finished or abandoned room into a fresh lobby through rematch", () => {
    const { alpha, beta } = createSnapshots();
    const service = createInMemoryOnlineDuelService(new SeededRandom(9));
    const created = handleOnlineDuelClientMessage(service, {
      type: "create_duel",
      playerId: "player-alpha",
      sessionId: "session-alpha",
      displayName: "Alpha",
      snapshot: alpha,
    });
    const duelId =
      created[0]?.type === "duel_created"
        ? created[0].duelId
        : (() => {
            throw new Error("duel was not created");
          })();
    const roomCode =
      created[0]?.type === "duel_created"
        ? created[0].roomCode
        : (() => {
            throw new Error("duel was not created");
          })();

    handleOnlineDuelClientMessage(service, {
      type: "join_duel_by_code",
      roomCode,
      playerId: "player-beta",
      sessionId: "session-beta",
      displayName: "Beta",
      snapshot: beta,
    });

    service.expireStaleRooms(Date.now() + 10 * 60 * 1000);

    const rematched = handleOnlineDuelClientMessage(service, {
      type: "rematch_duel",
      duelId,
      playerId: "player-alpha",
      sessionId: "session-alpha",
    });

    expect(stripCombatState(rematched)).toEqual([
      {
        type: "duel_state_sync",
        payload: {
          duelId,
          roomCode,
          revision: 3,
          status: "lobby",
          round: 1,
          winnerSeat: null,
          yourSeat: "playerA",
          resumeToken: expect.any(String),
          participants: [
            { seat: "playerA", displayName: "Alpha", connected: true, ready: false },
            { seat: "playerB", displayName: "Beta", connected: true, ready: false },
          ],
        },
      },
    ]);
  });

  it("abandons the room immediately when a participant leaves through the authority contract", () => {
    const { alpha, beta } = createSnapshots();
    const service = createInMemoryOnlineDuelService(new SeededRandom(9));
    const created = handleOnlineDuelClientMessage(service, {
      type: "create_duel",
      playerId: "player-alpha",
      sessionId: "session-alpha",
      displayName: "Alpha",
      snapshot: alpha,
    });
    const duelId =
      created[0]?.type === "duel_created"
        ? created[0].duelId
        : (() => {
            throw new Error("duel was not created");
          })();
    const roomCode =
      created[0]?.type === "duel_created"
        ? created[0].roomCode
        : (() => {
            throw new Error("duel was not created");
          })();

    handleOnlineDuelClientMessage(service, {
      type: "join_duel_by_code",
      roomCode,
      playerId: "player-beta",
      sessionId: "session-beta",
      displayName: "Beta",
      snapshot: beta,
    });

    const left = handleOnlineDuelClientMessage(service, {
      type: "leave_duel",
      duelId,
      playerId: "player-beta",
      sessionId: "session-beta",
    });

    expect(stripCombatState(left)).toEqual([
      {
        type: "duel_state_sync",
        payload: {
          duelId,
          roomCode,
          revision: 3,
          status: "abandoned",
          round: 1,
          winnerSeat: null,
          yourSeat: "playerB",
          resumeToken: expect.any(String),
          participants: [
            { seat: "playerA", displayName: "Alpha", connected: true, ready: false },
            { seat: "playerB", displayName: "Beta", connected: false, ready: false },
          ],
        },
      },
    ]);
  });
});

