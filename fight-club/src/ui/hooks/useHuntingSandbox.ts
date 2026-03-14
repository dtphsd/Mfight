import { useEffect, useRef, useState } from "react";
import { huntingGearCatalog } from "@/content/hunting/gear";
import { huntingPetCatalog } from "@/content/hunting/pets";
import { huntingToolCatalog } from "@/content/hunting/tools";
import { huntingZones } from "@/content/hunting/zones";
import {
  addHunterExperience,
  assignPetToHunter,
  claimHuntRewards,
  createHunterProfile,
  createIdleHuntState,
  equipHuntingGear,
  equipHuntingTool,
  loadHuntingState,
  resolveHunt,
  saveHuntingState,
  startHunt,
  type HuntReward,
  type HuntState,
  type HunterProfile,
  type HuntingPet,
} from "@/modules/hunting";
import { createInventory, type Inventory } from "@/modules/inventory";
import { useGameApp } from "@/ui/hooks/useGameApp";

interface ClaimedHuntSummary {
  reward: HuntReward;
  claimedAt: number;
}

function createStarterHunterProfile() {
  let profile: HunterProfile = createHunterProfile("Trail Scout");

  for (const item of huntingGearCatalog) {
    const equipped = equipHuntingGear(profile, item);
    if (equipped.success) {
      profile = equipped.data;
    }
  }

  const withPet = assignPetToHunter(profile, huntingPetCatalog, huntingPetCatalog[0]?.id ?? null);
  profile = withPet.success ? withPet.data : profile;

  const withTool = equipHuntingTool(profile, huntingToolCatalog[0]);
  return withTool.success ? withTool.data : profile;
}

export function useHuntingSandbox() {
  const { saveRepository } = useGameApp();
  const persistedRef = useRef(loadHuntingState(saveRepository));
  const wasRestoredFromSave = persistedRef.current !== null;
  const [now, setNow] = useState(() => Date.now());
  const [profile, setProfile] = useState<HunterProfile>(() => persistedRef.current?.profile ?? createStarterHunterProfile());
  const [pets] = useState<HuntingPet[]>(() => persistedRef.current?.pets ?? huntingPetCatalog.map((pet) => ({ ...pet })));
  const [inventory, setInventory] = useState<Inventory>(() => persistedRef.current?.inventory ?? createInventory());
  const [huntState, setHuntState] = useState<HuntState>(() => persistedRef.current?.huntState ?? createIdleHuntState());
  const [selectedZoneId, setSelectedZoneId] = useState<string>(
    () => persistedRef.current?.selectedZoneId ?? huntingZones[0]?.id ?? ""
  );
  const [lastClaimed, setLastClaimed] = useState<ClaimedHuntSummary | null>(() => persistedRef.current?.lastClaimed ?? null);
  const [recentClaims, setRecentClaims] = useState<ClaimedHuntSummary[]>(() => {
    if (persistedRef.current?.recentClaims?.length) {
      return persistedRef.current.recentClaims;
    }

    return persistedRef.current?.lastClaimed ? [persistedRef.current.lastClaimed] : [];
  });

  const selectedZone = huntingZones.find((zone) => zone.id === selectedZoneId) ?? huntingZones[0] ?? null;
  const activeZone =
    (huntState.zoneId ? huntingZones.find((zone) => zone.id === huntState.zoneId) : null) ?? selectedZone;
  const activePet = pets.find((pet) => pet.id === profile.activePetId) ?? null;
  const routeElapsedMs =
    huntState.status === "hunting" && huntState.startedAt !== null ? Math.max(0, now - huntState.startedAt) : 0;
  const routeRemainingMs = huntState.status === "hunting" ? Math.max(0, huntState.durationMs - routeElapsedMs) : 0;
  const routeReadyToResolve = huntState.status === "hunting" && routeRemainingMs === 0;

  useEffect(() => {
    saveHuntingState(saveRepository, {
      profile,
      inventory,
      huntState,
      pets,
      selectedZoneId: selectedZoneId || null,
      lastClaimed,
      recentClaims,
    });
  }, [saveRepository, profile, inventory, huntState, pets, selectedZoneId, lastClaimed, recentClaims]);

  useEffect(() => {
    if (huntState.status !== "hunting") {
      return;
    }

    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, [huntState.status]);

  const startSelectedHunt = () => {
    if (!selectedZone) {
      return false;
    }

    const started = startHunt({
      profile,
      currentState: huntState,
      zone: selectedZone,
      startedAt: now,
    });

    if (!started.success) {
      return false;
    }

    setLastClaimed(null);
    setHuntState(started.data);
    return true;
  };

  const resolveActiveHunt = () => {
    if (!activeZone || huntState.status !== "hunting" || huntState.startedAt === null) {
      return false;
    }

    const resolved = resolveHunt({
      profile,
      pets,
      huntState,
      zone: activeZone,
      resolvedAt: now,
    });

    if (!resolved.success) {
      return false;
    }

    setHuntState(resolved.data);
    return true;
  };

  const claimActiveReward = () => {
    const claimed = claimHuntRewards(inventory, huntState);
    if (!claimed.success) {
      return false;
    }

    const earnedReward = huntState.pendingReward;
    setInventory(claimed.data.inventory);
    setHuntState(claimed.data.huntState);
    const claimSummary = {
      reward: earnedReward,
      claimedAt: Date.now(),
    };
    setLastClaimed(claimSummary);
    setRecentClaims((current) => [claimSummary, ...current].slice(0, 5));

    if (claimed.data.claimedExperience > 0) {
      const progressed = addHunterExperience(profile, claimed.data.claimedExperience);
      if (progressed.success) {
        setProfile(progressed.data);
        if (selectedZone && !progressed.data.unlockedZoneIds.includes(selectedZone.id)) {
          setSelectedZoneId(progressed.data.unlockedZoneIds[0] ?? selectedZoneId);
        }
      }
    }

    return true;
  };

  const equipToolByCode = (itemCode: string) => {
    const tool = huntingToolCatalog.find((entry) => entry.itemCode === itemCode);
    const equipped = equipHuntingTool(profile, tool);
    if (!equipped.success) {
      return false;
    }

    setProfile(equipped.data);
    return true;
  };

  return {
    profile,
    inventory,
    pets,
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
    toolCatalog: huntingToolCatalog,
    setSelectedZoneId,
    startSelectedHunt,
    resolveActiveHunt,
    claimActiveReward,
    equipToolByCode,
  };
}
