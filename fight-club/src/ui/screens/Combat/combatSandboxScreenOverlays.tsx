import { Suspense, lazy, type CSSProperties, type Dispatch, type SetStateAction } from "react";
import { baseBlockPenetration, critMultiplier } from "@/modules/combat";
import type { EquipmentSlot } from "@/modules/equipment";
import type { Item } from "@/modules/inventory";
import {
  countUnreadMailboxEntries,
  createProfileMailboxes,
  createProfileMeta,
  markMailboxEntriesAsRead,
  sendProfileMail,
} from "@/modules/profile";
import type { CombatFigureId } from "@/ui/components/combat/CombatSilhouette";
import { useCombatSandbox } from "@/ui/hooks/useCombatSandbox";
import { buildProfileDerivedStats, formatIdLabel, resolvePresetFigure } from "./combatSandboxScreenDerived";
import { BotBuildPresetsPopover as CombatBotBuildPresetsPopover, SkillLoadoutPopover } from "./combatSandboxScreenPopovers";

const loadBuildPresetsPopover = () =>
  import("@/ui/components/combat/BuildPresetsPopover").then((module) => ({ default: module.BuildPresetsPopover }));
const loadBuilderPopover = () =>
  import("@/ui/components/combat/BuilderPopover").then((module) => ({ default: module.BuilderPopover }));
const loadInventoryPopover = () =>
  import("@/ui/components/combat/InventoryPopover").then((module) => ({ default: module.InventoryPopover }));
const loadProfileModal = () =>
  import("@/ui/components/profile/ProfileModal").then((module) => ({ default: module.ProfileModal }));

const BuildPresetsPopover = lazy(loadBuildPresetsPopover);
const BuilderPopover = lazy(loadBuilderPopover);
const InventoryPopover = lazy(loadInventoryPopover);
const ProfileModal = lazy(loadProfileModal);

type CombatSandboxModel = ReturnType<typeof useCombatSandbox>;

export function preloadCombatSandboxOverlays() {
  return Promise.allSettled([
    loadBuildPresetsPopover(),
    loadBuilderPopover(),
    loadInventoryPopover(),
    loadProfileModal(),
  ]);
}

export function CombatSandboxOverlays({
  sandbox,
  buttonStyle,
  panelStyle,
  buildPresetsOpen,
  botBuildPresetsOpen,
  builderOpen,
  skillLoadoutOpen,
  inventoryOpen,
  profileTarget,
  playerName,
  playerFigure,
  botFigure,
  playerEquipment,
  botEquipment,
  playerProfile,
  botProfile,
  mailboxes,
  onPlayerNameChange,
  onCloseBuildPresets,
  onCloseBotBuildPresets,
  onCloseBuilder,
  onOpenBuildPresets,
  onCloseSkillLoadout,
  onCloseInventory,
  onCloseProfile,
  onSetPlayerFigure,
  onSetPlayerProfile,
  onSetMailboxes,
}: {
  sandbox: CombatSandboxModel;
  buttonStyle: CSSProperties;
  panelStyle: CSSProperties;
  buildPresetsOpen: boolean;
  botBuildPresetsOpen: boolean;
  builderOpen: boolean;
  skillLoadoutOpen: boolean;
  inventoryOpen: boolean;
  profileTarget: "player" | "bot" | null;
  playerName: string;
  playerFigure: CombatFigureId;
  botFigure: CombatFigureId;
  playerEquipment: Array<{ slot: EquipmentSlot; item: Item | null }>;
  botEquipment: Array<{ slot: EquipmentSlot; item: Item | null }>;
  playerProfile: ReturnType<typeof createProfileMeta>;
  botProfile: ReturnType<typeof createProfileMeta>;
  mailboxes: ReturnType<typeof createProfileMailboxes>;
  onPlayerNameChange: (value: string) => void;
  onCloseBuildPresets: () => void;
  onCloseBotBuildPresets: () => void;
  onCloseBuilder: () => void;
  onOpenBuildPresets: () => void;
  onCloseSkillLoadout: () => void;
  onCloseInventory: () => void;
  onCloseProfile: () => void;
  onSetPlayerFigure: (figure: CombatFigureId) => void;
  onSetPlayerProfile: Dispatch<SetStateAction<ReturnType<typeof createProfileMeta>>>;
  onSetMailboxes: Dispatch<SetStateAction<ReturnType<typeof createProfileMailboxes>>>;
}) {
  return (
    <>
      {buildPresetsOpen ? (
        <Suspense fallback={<DeferredOverlayFallback label="Loading builds..." />}>
          <BuildPresetsPopover
            buildPresets={sandbox.buildPresets}
            onApplyBuild={(presetId) => {
              sandbox.applyPreset(presetId);
              onSetPlayerFigure(resolvePresetFigure(presetId, "rush-chip"));
              onCloseBuildPresets();
            }}
            onApplyItemsOnly={(presetId) => {
              sandbox.applyPresetItemsOnly(presetId);
              onSetPlayerFigure(resolvePresetFigure(presetId, "rush-chip"));
            }}
            onApplySkillsOnly={(presetId) => {
              sandbox.applyPresetSkillsOnly(presetId);
              onSetPlayerFigure(resolvePresetFigure(presetId, "rush-chip"));
            }}
            onClose={onCloseBuildPresets}
          />
        </Suspense>
      ) : null}
      {botBuildPresetsOpen ? (
        <CombatBotBuildPresetsPopover
          panelStyle={panelStyle}
          buttonStyle={buttonStyle}
          buildPresets={sandbox.botBuildPresets}
          selectedPresetId={sandbox.botBuildPresetId}
          onApplyBuild={(presetId) => {
            sandbox.setBotBuildPreset(presetId);
            onCloseBotBuildPresets();
          }}
          onClose={onCloseBotBuildPresets}
        />
      ) : null}
      {builderOpen ? (
        <Suspense fallback={<DeferredOverlayFallback label="Loading builder..." />}>
          <BuilderPopover
            buildPresets={sandbox.buildPresets}
            unlockedSkills={sandbox.unlockedSkills}
            equippedSkillIds={sandbox.equippedSkillIds}
            maxEquippedSkills={sandbox.maxEquippedSkills}
            playerCharacter={sandbox.playerCharacter}
            metrics={sandbox.metrics}
            increaseStat={sandbox.increaseStat}
            decreaseStat={sandbox.decreaseStat}
            applyPreset={(presetId) => {
              sandbox.applyPreset(presetId);
              onSetPlayerFigure(resolvePresetFigure(presetId, "rush-chip"));
            }}
            resetBuild={() => {
              sandbox.resetBuild();
              onSetPlayerFigure("rush-chip");
            }}
            toggleEquippedSkill={sandbox.toggleEquippedSkill}
            onOpenBuildPresets={onOpenBuildPresets}
            onClose={onCloseBuilder}
          />
        </Suspense>
      ) : null}
      {skillLoadoutOpen ? (
        <SkillLoadoutPopover
          buttonStyle={buttonStyle}
          unlockedSkills={sandbox.unlockedSkills}
          equippedSkillIds={sandbox.equippedSkillIds}
          maxEquippedSkills={sandbox.maxEquippedSkills}
          onToggleSkill={sandbox.toggleEquippedSkill}
          onClose={onCloseSkillLoadout}
        />
      ) : null}
      {profileTarget === "player" ? (
        <Suspense fallback={<DeferredOverlayFallback label="Loading profile..." />}>
          <ProfileModal
            onClose={onCloseProfile}
            name={playerName}
            level={sandbox.playerCharacter.level}
            figure={playerFigure}
            mirrored
            currentHp={sandbox.playerCombatant?.currentHp ?? sandbox.playerSnapshot.maxHp}
            maxHp={sandbox.playerCombatant?.maxHp ?? sandbox.playerSnapshot.maxHp}
            activeEffects={sandbox.playerCombatant?.activeEffects ?? []}
            equipmentSlots={playerEquipment}
            profile={playerProfile}
            baseStats={sandbox.playerSnapshot.stats}
            derivedStats={buildProfileDerivedStats({
              totalDamage: sandbox.metrics.totalDamage,
              stats: sandbox.playerSnapshot.stats,
              totalArmor: sandbox.metrics.totalArmor,
              dodgeBonus: sandbox.playerSnapshot.dodgeChanceBonus,
              critBonus: sandbox.playerSnapshot.critChanceBonus,
              totalCritMultiplier: sandbox.metrics.totalCritMultiplier,
              baseBlockPenetrationValue: sandbox.metrics.baseBlockPenetration,
              armorPenetrationPercent: sandbox.playerSnapshot.armorPenetrationPercent,
            })}
            skillLabels={sandbox.equippedSkills.map((skill) => skill.name)}
            isOwnProfile
            onNameChange={onPlayerNameChange}
            onMottoChange={(value) => onSetPlayerProfile((current) => ({ ...current, motto: value }))}
            mailboxActorId="player"
            mailboxEntries={mailboxes.player.entries}
            unreadMailCount={countUnreadMailboxEntries(mailboxes, "player")}
            onOpenMailbox={() => onSetMailboxes((current) => markMailboxEntriesAsRead(current, "player"))}
            onSendMail={({ toActorId, toName, subject, body }) =>
              onSetMailboxes((current) =>
                sendProfileMail({
                  mailboxes: current,
                  fromActorId: "player",
                  fromName: playerName,
                  toActorId,
                  toName,
                  subject,
                  body,
                })
              )
            }
          />
        </Suspense>
      ) : null}
      {profileTarget === "bot" ? (
        <Suspense fallback={<DeferredOverlayFallback label="Loading profile..." />}>
          <ProfileModal
            onClose={onCloseProfile}
            name="Arena Bot"
            level={sandbox.botBuildPreset.targetFightLength === "long" ? 4 : 3}
            figure={botFigure}
            currentHp={sandbox.botCombatant?.currentHp ?? sandbox.botSnapshot.maxHp}
            maxHp={sandbox.botCombatant?.maxHp ?? sandbox.botSnapshot.maxHp}
            activeEffects={sandbox.botCombatant?.activeEffects ?? []}
            equipmentSlots={botEquipment}
            profile={botProfile}
            baseStats={sandbox.botSnapshot.stats}
            derivedStats={buildProfileDerivedStats({
              totalDamage: sandbox.metrics.opponentTotalDamage,
              stats: sandbox.botSnapshot.stats,
              totalArmor: sandbox.metrics.opponentTotalArmor,
              dodgeBonus: sandbox.botSnapshot.dodgeChanceBonus,
              critBonus: sandbox.botSnapshot.critChanceBonus,
              totalCritMultiplier:
                critMultiplier(sandbox.botSnapshot.stats.rage, sandbox.botSnapshot.stats.endurance) +
                sandbox.botSnapshot.critMultiplierBonus,
              baseBlockPenetrationValue: baseBlockPenetration(sandbox.botSnapshot.stats.strength),
              armorPenetrationPercent: sandbox.botSnapshot.armorPenetrationPercent,
            })}
            skillLabels={sandbox.botBuildPreset.skillLoadout.map(formatIdLabel)}
            mailboxActorId="bot"
            mailboxEntries={mailboxes.bot.entries}
            unreadMailCount={countUnreadMailboxEntries(mailboxes, "bot")}
            directMessageTarget={{ actorId: "bot", name: "Arena Bot" }}
            onOpenMailbox={() => onSetMailboxes((current) => markMailboxEntriesAsRead(current, "bot"))}
            onSendMail={({ toActorId, toName, subject, body }) =>
              onSetMailboxes((current) =>
                sendProfileMail({
                  mailboxes: current,
                  fromActorId: "player",
                  fromName: playerName,
                  toActorId,
                  toName,
                  subject,
                  body,
                })
              )
            }
          />
        </Suspense>
      ) : null}
      {inventoryOpen ? (
        <Suspense fallback={<DeferredOverlayFallback label="Loading inventory..." />}>
          <InventoryPopover
            entries={sandbox.inventory.entries}
            slotsUsed={sandbox.inventorySlots.used}
            slotsMax={sandbox.inventorySlots.max}
            equippedItems={sandbox.equippedItems}
            onEquip={sandbox.equipItemByCode}
            onClose={onCloseInventory}
          />
        </Suspense>
      ) : null}
    </>
  );
}

function DeferredOverlayFallback({ label = "Loading..." }: { label?: string }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: "24px 24px auto auto",
        zIndex: 90,
        padding: "8px 12px",
        borderRadius: "999px",
        border: "1px solid rgba(255,255,255,0.1)",
        background: "rgba(18,16,14,0.9)",
        color: "#efe6da",
        fontSize: "11px",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
      }}
    >
      {label}
    </div>
  );
}
