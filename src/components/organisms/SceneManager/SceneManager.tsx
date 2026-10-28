"use client";

import React from "react";
import { flushSync } from "react-dom";
import { useGameActions, useGameSelector } from "@/store/GameStore";
import ActiveCursorWrapper from "@/components/atoms/ActiveCursor/ActiveCursorWrapper";
import { CursorProvider } from "@/contexts/CursorContext";
import { useOptionalSoundManager, type SoundManager } from "@/contexts/SoundManagerContext";
import GameHUD from "./GameHUD";
import SceneRenderer from "./SceneRenderer";
import VideoPreloaderManager from "./VideoPreloaderManager";
import SceneTransitionWrapper from "./SceneTransitionWrapper";
import { GameSceneLogic } from "./GameSceneLogic";
import { formatCharacterId, useAnalytics } from "@/utils/analytics";
import { useDevice } from "@/hooks/useDevice";

function SceneManagerContent() {
  const actions = useGameActions();
  const activeScene = useGameSelector((s) => s.activeScene);
  const totalScore = useGameSelector((s) => s.totalScore);
  const audioMuted = useGameSelector((s) => s.audioMuted);
  const selectedCharacterIndex = useGameSelector((s) => s.selectedCharacterIndex);
  const { trackEvent } = useAnalytics();
  const [hasMounted, setHasMounted] = React.useState(false);
  const { width } = useDevice();
  const isCursorAllowedByWidth = width >= 800;

  const sound = useOptionalSoundManager();
  const soundRef = React.useRef<SoundManager | undefined>(undefined);
  soundRef.current = sound;

  React.useEffect(() => {
    if (typeof document === "undefined") return;
    const el = document.querySelector(".game-container");
    if (!el) return;

    const cls = "is-end-of-year";
    if (activeScene === "report") {
      el.classList.add(cls);
    } else {
      el.classList.remove(cls);
    }

    return () => {
      el.classList.remove(cls);
    };
  }, [activeScene]);

  React.useEffect(() => {
    if (typeof document === "undefined") return;
    const el = document.querySelector(".game-container");
    if (!el) return;

    const cls = "is-holo-info";
    if (activeScene === "holoInfoIntro") {
      el.classList.add(cls);
    } else {
      el.classList.remove(cls);
    }

    return () => {
      el.classList.remove(cls);
    };
  }, [activeScene]);

  const handleShare = React.useCallback(() => {
    trackEvent("share", {
      character: formatCharacterId(selectedCharacterIndex),
    });
  }, [selectedCharacterIndex, trackEvent]);

  const handleToggleAudio = React.useCallback(
    (muted: boolean) => {
      if (muted) {
        actions.setAudioMuted(true);
        return;
      }

      // Ensure the SoundManager sees the updated mute state before we attempt playback
      // (helps with autoplay restrictions by keeping the play() call tied to the gesture).
      flushSync(() => actions.setAudioMuted(false));
      soundRef.current?.startLoop("bgMusic");
    },
    [actions]
  );

  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  return (
    <GameSceneLogic>
      {({
        activeScene,
        isCharacterSelect,
        showHud,
        hideProgressAndScore,
        isCursorVisible,
        scenario,
        questionShouldAutoReveal,
        pendingAction,
        scoreToPass,
        hudShouldAnimateIn,
        hudScoreFlashVariant,
        preloadVideoSrc,
        characterScenarios,
        totalQuestionsCount,
        currentScenarioIndex,
        handleOpeningLoadingVisibilityChange,
        handleCharacterSelectNext,
        handleCharacterSelectBack,
        handleCharacterSelectPrimaryAction,
        handleCharacterSelectPrimaryActionWithFade,
        handleCharacterSelectUIVisible,
        handleOpeningPrimaryAction,
        handleOpeningLoadingTap,
        handleHoloInfoNext,
        handleQuestionOptionRegister,
        handleQuestionOptionCommit,
        handlePostActionContinue,
        handlePostActionContinueWithFade,
        handlePostActionRewind,
        handleScore,
      }) => {
        const shouldShowCustomCursor =
          hasMounted && isCursorVisible && isCursorAllowedByWidth;

        return (
          <div
            style={{
              position: "relative",
              height: "100%",
              width: "100%",
              // If the custom cursor is hidden for any reason (e.g. character select UI not yet visible),
              // fall back to the native cursor to avoid "no cursor at all" reports.
              cursor: shouldShowCustomCursor ? "none" : "auto",
            }}
          >
            <ActiveCursorWrapper
              isVisible={true}
              invertColors
              hideOnIdle={false}
            />
            <SceneTransitionWrapper activeSceneKey={activeScene}>
              <SceneRenderer
                activeScene={activeScene}
                pendingAction={pendingAction}
                scenario={scenario}
                questionShouldAutoReveal={questionShouldAutoReveal}
                onOpeningLoadingVisibilityChange={
                  handleOpeningLoadingVisibilityChange
                }
                onCharacterSelectNext={handleCharacterSelectNext}
                onCharacterSelectBack={handleCharacterSelectBack}
                onCharacterSelectPrimaryAction={
                  handleCharacterSelectPrimaryAction
                }
                onCharacterSelectPrimaryActionWithFade={
                  handleCharacterSelectPrimaryActionWithFade
                }
                onCharacterSelectUIVisible={handleCharacterSelectUIVisible}
                onOpeningPrimaryAction={handleOpeningPrimaryAction}
                onOpeningLoadingTap={handleOpeningLoadingTap}
                onHoloInfoNext={handleHoloInfoNext}
                onQuestionOptionRegister={handleQuestionOptionRegister}
                onQuestionOptionCommit={handleQuestionOptionCommit}
                onPostActionContinue={handlePostActionContinue}
                onPostActionContinueWithFade={handlePostActionContinueWithFade}
                onPostActionRewind={handlePostActionRewind}
                onScore={handleScore}
                scoreToPass={scoreToPass}
                characterScenarios={characterScenarios}
                totalQuestionsCount={totalQuestionsCount}
                currentScenarioIndex={currentScenarioIndex}
              />
            </SceneTransitionWrapper>

            <VideoPreloaderManager preloadVideoSrc={preloadVideoSrc} />

            {showHud && (
              <GameHUD
                shouldAnimateIn={hudShouldAnimateIn}
                isCharacterSelect={isCharacterSelect}
                hideProgressAndScore={hideProgressAndScore}
                totalScore={totalScore}
                audioMuted={audioMuted}
                onToggleAudio={handleToggleAudio}
                hudScoreFlashVariant={hudScoreFlashVariant}
                characterScenariosLength={totalQuestionsCount}
                currentScenarioIndex={currentScenarioIndex}
                showShareButton={activeScene === "report"}
                onShare={handleShare}
              />
            )}
          </div>
        );
      }}
    </GameSceneLogic>
  );
}

export default function SceneManager() {
  return (
    <CursorProvider>
      <SceneManagerContent />
    </CursorProvider>
  );
}
