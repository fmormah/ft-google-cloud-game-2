"use client";

import React from "react";
import OpeningScene2 from "@/components/organisms/scenes/OpeningScene2/OpeningScene2";
import HoloInformationScene from "@/components/organisms/scenes/HoloInformationScene/HoloInformationScene";
import CharacterSelect from "@/components/organisms/scenes/CharacterSelect/CharacterSelect";
import QuestionSceneShell from "@/components/organisms/QuestionSceneComponents/QuestionSceneShell/QuestionSceneShell";
import PostAction from "@/components/organisms/QuestionSceneComponents/PostAction/PostAction";
import EndOfYearHighlightsScene from "@/components/organisms/scenes/EndOfYear/EndOfYearHighlightsScene/EndOfYearHighlightsScene";
import { ASSETS, SCENE_MANAGER, OPENING_SCENE } from "@/utils/constants";
import { type MaterialIconName } from "@/components/atoms/Icon";
import type {
  CharacterProfile,
  CharacterScenarioSet,
  ScenarioAction,
  ScenarioQuestion,
} from "@/types/game";
import type { SceneKey } from "@/types/scene";
import { toPublicPath } from "@/utils/toPublicPath";
import { useIsMobile, useIsTablet } from "@/hooks/useDevice";
import { selectScenarioVideoSrc } from "@/utils/scenarioVideo";
import { getOpeningSplashVideoUrl } from "@/utils/browser";
import { assetUrl } from "@/utils/assetUrl";

interface SceneRendererProps {
  activeScene: SceneKey;
  pendingAction:
    | (ScenarioAction & {
        selectedIndex: number;
        isRepeatAttempt?: boolean;
      })
    | null;
  scenario: ScenarioQuestion | undefined;
  questionShouldAutoReveal: boolean;
  characterScenarios?: CharacterScenarioSet | undefined;
  totalQuestionsCount?: number;
  currentScenarioIndex?: number;
  onOpeningLoadingVisibilityChange: (visible: boolean) => void;
  onCharacterSelectNext: (nextIndex: number) => void;
  onCharacterSelectBack: (prevIndex: number) => void;
  onCharacterSelectPrimaryAction: (profile: CharacterProfile) => void;
  onCharacterSelectPrimaryActionWithFade: (profile: CharacterProfile) => void;
  onCharacterSelectUIVisible: () => void;
  onOpeningPrimaryAction: () => void;
  onOpeningLoadingTap: () => void;
  onHoloInfoNext: () => void;
  onQuestionOptionRegister: (info: { index?: number }) => void;
  onQuestionOptionCommit: (info: {
    selectedIndex: number | null;
    selected: { id: string; label: string } | null;
  }) => void;
  onQuestionOptionRegisterWithFade?: (info: { index?: number }) => void;
  onQuestionOptionCommitWithFade?: (info: {
    selectedIndex: number | null;
    selected: { id: string; label: string } | null;
  }) => void;
  onPostActionContinue: () => void;
  onPostActionContinueWithFade: () => void;
  onPostActionRewind: () => void;
  onScore: () => void;
  scoreToPass?: number;
}

const SceneRenderer: React.FC<SceneRendererProps> = ({
  activeScene,
  pendingAction,
  scenario,
  questionShouldAutoReveal,
  characterScenarios,
  totalQuestionsCount,
  currentScenarioIndex,
  onOpeningLoadingVisibilityChange,
  onCharacterSelectNext,
  onCharacterSelectBack,
  onCharacterSelectPrimaryAction,
  onCharacterSelectPrimaryActionWithFade,
  onCharacterSelectUIVisible,
  onOpeningPrimaryAction,
  onOpeningLoadingTap,
  onHoloInfoNext,
  onQuestionOptionRegister,
  onQuestionOptionCommit = () => {},
  onQuestionOptionRegisterWithFade,
  onQuestionOptionCommitWithFade,
  onPostActionContinue,
  onPostActionContinueWithFade,
  onPostActionRewind,
  onScore,
  scoreToPass,
}) => {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  switch (activeScene) {
    case "opening":
      return (
        <OpeningScene2
          initialDelaySec={SCENE_MANAGER.OPENING_INITIAL_DELAY_SEC}
          afterFadeDelaySec={SCENE_MANAGER.OPENING_AFTER_FADE_DELAY_SEC}
          backgroundVideoSrc={assetUrl(getOpeningSplashVideoUrl())}
          tilePlaybackRate={SCENE_MANAGER.OPENING_TILE_PLAYBACK_RATE}
          onLoadingVisibilityChange={onOpeningLoadingVisibilityChange}
          loadingProps={{
            message: "[CLICK ANYWHERE TO ENABLE SOUND]",
            primaryIrisDashLength: OPENING_SCENE.PRIMARY_IRIS_DASH_LENGTH,
            primaryIrisDashHeight: OPENING_SCENE.PRIMARY_IRIS_DASH_HEIGHT,
            primaryIrisGapLength: OPENING_SCENE.PRIMARY_IRIS_GAP_LENGTH,
            primaryIrisRotationSpeedSec:
              OPENING_SCENE.PRIMARY_IRIS_ROTATION_SPEED_SEC,
            primaryIrisColor: "#ffffff",
            primaryIrisDirection: "clockwise",
            secondaryIrisDashLength: OPENING_SCENE.SECONDARY_IRIS_DASH_LENGTH,
            secondaryIrisDashHeight: OPENING_SCENE.SECONDARY_IRIS_DASH_HEIGHT,
            secondaryIrisGapLength: OPENING_SCENE.SECONDARY_IRIS_GAP_LENGTH,
            secondaryIrisRotationSpeedSec:
              OPENING_SCENE.SECONDARY_IRIS_ROTATION_SPEED_SEC,
            secondaryIrisColor: "#ffffff",
            secondaryIrisDirection: "counter-clockwise",
            type: "persistent",
          }}
          splashProps={{
            variant: "default",
            headingHtml: "TRANSFORMING<br/>BUSINESS",
            primaryIrisColor: "#ffffff",
            secondaryIrisColor: "#ffffff",
            topTrailColor: "#ffffff",
            topTrailLineHeightPx: OPENING_SCENE.TRAIL_LINE_HEIGHT_PX,
            topTrailLineWidthPx: OPENING_SCENE.TRAIL_LINE_WIDTH_PX,
            topTrailGapPx: OPENING_SCENE.TRAIL_GAP_PX,
            topTrailDurationSec: OPENING_SCENE.TRAIL_DURATION_SEC,
            topTrailDirection: "ltr",
            bottomTrailColor: "#ffffff",
            bottomTrailLineHeightPx: OPENING_SCENE.TRAIL_LINE_HEIGHT_PX,
            bottomTrailLineWidthPx: OPENING_SCENE.TRAIL_LINE_WIDTH_PX,
            bottomTrailGapPx: OPENING_SCENE.TRAIL_GAP_PX,
            bottomTrailDurationSec: OPENING_SCENE.TRAIL_DURATION_SEC,
            bottomTrailDirection: "rtl",
            primaryIrisDashLength: OPENING_SCENE.PRIMARY_IRIS_DASH_LENGTH,
            primaryIrisDashHeight: OPENING_SCENE.PRIMARY_IRIS_DASH_HEIGHT,
            primaryIrisGapLength: OPENING_SCENE.PRIMARY_IRIS_GAP_LENGTH,
            secondaryIrisDashLength: OPENING_SCENE.SECONDARY_IRIS_DASH_LENGTH,
            secondaryIrisDashHeight: OPENING_SCENE.SECONDARY_IRIS_DASH_HEIGHT,
            secondaryIrisGapLength: OPENING_SCENE.SECONDARY_IRIS_GAP_LENGTH,
            secondaryIrisRotationSpeedSec:
              OPENING_SCENE.SECONDARY_IRIS_ROTATION_SPEED_SEC,
            primaryIrisRotationSpeedSec:
              OPENING_SCENE.PRIMARY_IRIS_ROTATION_SPEED_SEC,
            primaryIrisDirection: "clockwise",
            secondaryIrisDirection: "counter-clockwise",
          }}
          onPrimaryAction={onOpeningPrimaryAction}
          onLoadingTap={onOpeningLoadingTap}
        />
      );

    case "holoInfoIntro":
      return (
        <HoloInformationScene
          primaryCtaLabel="CONTINUE"
          videoSources={ASSETS.VIDEO_SOURCES.HOLO_INTRO_DISPLAY}
          onNext={onHoloInfoNext}
        >
          <h2>WELCOME</h2>
          <p>
            Like many businesses today, the fictional company Sunrise Cereals
            Co. is facing the challenge of balancing profitability and
            sustainability. We need you to make decisions that don’t just help
            the company in the short term, but ensure long term business
            resilience.
          </p>
          <p>
            Ready for your next promotion? Choose the role you most want to
            explore but remember, every role comes with its own challenges.
          </p>
        </HoloInformationScene>
      );

    case "characterSelect":
      return (
        <CharacterSelect
          videoSrc={
            isMobile && !isTablet
              ? ASSETS.VIDEO.CHARACTER_SELECTION_MOBILE
              : ASSETS.VIDEO.CHARACTER_SELECTION
          }
          onNext={onCharacterSelectNext}
          onBack={onCharacterSelectBack}
          onPrimaryAction={onCharacterSelectPrimaryAction}
          onPrimaryActionWithFade={onCharacterSelectPrimaryActionWithFade}
          onUIVisible={onCharacterSelectUIVisible}
        />
      );

    case "questionShell": {
      if (!scenario) return <EndOfYearHighlightsScene />;

      return (
        <QuestionSceneShell
          videoSrc={toPublicPath(scenario.scenarioVideo)}
          cardLabel={scenario.questionEyebrow}
          cardIconName="error"
          infoTitle={scenario.questionTitle}
          infoBody={scenario.scenarioDescription}
          autoRevealOnMount={questionShouldAutoReveal}
          actions={scenario.actionChoices.map((a, idx) => ({
            id: String(idx),
            label: a.actionDescription,
            iconName: a.icon as MaterialIconName,
          }))}
          onOptionRegister={onQuestionOptionRegister}
          onOptionCommit={onQuestionOptionCommit}
          onOptionRegisterWithFade={onQuestionOptionRegisterWithFade}
          onOptionCommitWithFade={onQuestionOptionCommitWithFade}
        />
      );
    }

    case "postAction": {
      if (!pendingAction) {
        return null;
      }

      const isLastQuestion =
        typeof totalQuestionsCount === "number" &&
        typeof currentScenarioIndex === "number" &&
        currentScenarioIndex >= totalQuestionsCount - 1;

      const getNextVideoSrc = () => {
        if (
          typeof currentScenarioIndex !== "number" ||
          typeof totalQuestionsCount !== "number" ||
          !characterScenarios
        )
          return undefined;

        const nextIndex = currentScenarioIndex + 1;
        if (nextIndex >= totalQuestionsCount) return undefined;

        const nextScenario = characterScenarios.questions?.[nextIndex];
        const raw = toPublicPath(nextScenario?.scenarioVideo) || undefined;
        return selectScenarioVideoSrc(raw, isMobile) || undefined;
      };

      const nextVideoSrc = getNextVideoSrc();

      return (
        <PostAction
          videoSrc={toPublicPath(pendingAction.postActionVideo)}
          nextVideoSrc={nextVideoSrc}
          scenarioIndex={
            typeof currentScenarioIndex === "number"
              ? currentScenarioIndex
              : undefined
          }
          notificationLabel={
            pendingAction.isCorrectAnswer ? "CORRECT" : "INCORRECT"
          }
          infoTitle={pendingAction.postActionTitle}
          infoBody={pendingAction.postActionDescription}
          variant={pendingAction.isCorrectAnswer ? "positive" : "negative"}
          notificationPercentChange={scoreToPass}
          hideNotificationLeftElement={Boolean(pendingAction.isRepeatAttempt)}
          onScore={onScore}
          onRewind={onPostActionRewind}
          onContinueWithFade={onPostActionContinueWithFade}
          isLastQuestion={isLastQuestion}
        />
      );
    }

    case "report":
      return <EndOfYearHighlightsScene />;

    default:
      return null;
  }
};

export default SceneRenderer;
