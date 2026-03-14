import { saveSchema, type SaveFile } from "@/core/storage/saveSchema";
import type { SaveRepository } from "@/core/storage/SaveRepository";
import { saveGame } from "@/orchestration/saveGame";
import type { Inventory } from "@/modules/inventory";
import type { HuntState } from "@/modules/hunting/model/HuntState";
import type { HunterProfile } from "@/modules/hunting/model/HunterProfile";
import type { HuntingPet } from "@/modules/hunting/model/HuntingPet";
import { createEmptyHuntingToolLoadout } from "@/modules/hunting/model/HuntingTool";

export interface HuntingSaveState {
  profile: HunterProfile;
  inventory: Inventory;
  huntState: HuntState;
  pets: HuntingPet[];
  selectedZoneId: string | null;
  lastClaimed: {
    reward: HuntState["pendingReward"];
    claimedAt: number;
  } | null;
  recentClaims?: Array<{
    reward: HuntState["pendingReward"];
    claimedAt: number;
  }>;
}

export function loadHuntingState(saveRepository: SaveRepository): HuntingSaveState | null {
  const raw = saveRepository.load<unknown>();
  const parsed = saveSchema.safeParse(raw);

  if (!parsed.success) {
    return null;
  }

  const hunting = parsed.data.state.hunting;
  if (!isHuntingSaveState(hunting)) {
    return null;
  }

  return normalizeHuntingSaveState(hunting);
}

export function saveHuntingState(saveRepository: SaveRepository, huntingState: HuntingSaveState) {
  const raw = saveRepository.load<unknown>();
  const parsed = saveSchema.safeParse(raw);
  const existingState = parsed.success ? parsed.data.state : {};

  saveGame(saveRepository, {
    ...existingState,
    hunting: huntingState,
  });
}

function isHuntingSaveState(value: unknown): value is HuntingSaveState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<HuntingSaveState>;
  return (
    isRecord(candidate.profile) &&
    isRecord(candidate.inventory) &&
    isRecord(candidate.huntState) &&
    Array.isArray(candidate.pets) &&
    (typeof candidate.selectedZoneId === "string" || candidate.selectedZoneId === null) &&
    (candidate.lastClaimed === null || isRecord(candidate.lastClaimed)) &&
    (candidate.recentClaims === undefined || Array.isArray(candidate.recentClaims))
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeHuntingSaveState(hunting: HuntingSaveState): HuntingSaveState {
  return {
    ...hunting,
    profile: normalizeHunterProfile(hunting.profile),
  };
}

function normalizeHunterProfile(profile: HunterProfile): HunterProfile {
  return {
    ...profile,
    tool: isRecord(profile.tool) && "slot" in profile.tool ? profile.tool : createEmptyHuntingToolLoadout(),
  };
}
