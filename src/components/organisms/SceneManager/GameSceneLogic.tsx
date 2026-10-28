"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { flushSync } from "react-dom";
import { useGameActions, useGameSelector } from "@/store/GameStore";
import { useIsMobile, useIsTablet } from "@/hooks/useDevice";
import { useCursor } from "@/contexts/CursorContext";
import {
  useOptionalSoundManager,
  type SoundManager,
} from "@/contexts/SoundManagerContext";
import { characterIndex0Scenarios } from "@/data/scenarios/character_index_0_scenarios";
import { characterIndex1Scenarios } from "@/data/scenarios/character_index_1_scenarios";
import { characterIndex2Scenarios } from "@/data/scenarios/character_index_2_scenarios";
import { characterIndex3Scenarios } from "@/data/scenarios/character_index_3_scenarios";
import { ASSETS } from "@/utils/constants";
import type {
  CharacterScenarioSet,
  ScenarioQuestion,
  ScenarioAction,
  CharacterProfile,
  MaterialIconName,
} from "@/types/game";
import {
  useAnalytics,
  formatCharacterId,
  formatQuestionId,
  formatAnswerId,
} from "@/utils/analytics";
import type { SceneKey } from "@/types/scene";
import { toPublicPath } from "@/utils/toPublicPath";
import { selectScenarioVideoSrc } from "@/utils/scenarioVideo";

const SCENARIOS: Record<number, CharacterScenarioSet> = {
  0: characterIndex0Scenarios,
  1: characterIndex1Scenarios,
  2: characterIndex2Scenarios,
  3: characterIndex3Scenarios,
};

const SCENE_TRANSITIONS: Record<SceneKey, SceneKey[]> = {
  opening: ["holoInfoIntro"],
  holoInfoIntro: ["characterSelect"],
  holoInfoPreQuestions: ["questionShell"],
  characterSelect: ["questionShell"],
  questionShell: ["postAction"],
  postAction: ["questionShell", "report"],
  report: [],
};

function transitionScene(current: SceneKey, next: SceneKey): SceneKey {
  const allowed = SCENE_TRANSITIONS[current] ?? [];

  if (!allowed.includes(next)) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[SceneMachine] Invalid scene transition", {
        from: current,
        to: next,
      });
    }
    return current;
  }

  return next;
}

function getNextScenarioVideo(
  selectedCharacterIndex: number,
  currentScenarioIndex: number,
  isMobile: boolean
): string | null {
  const characterScenarios = SCENARIOS[selectedCharacterIndex];
  if (!characterScenarios?.questions) return null;

  const nextIndex = currentScenarioIndex + 1;
  if (nextIndex >= characterScenarios.questions.length) return null;

  const nextScenario = characterScenarios.questions[nextIndex];
  const raw = toPublicPath(nextScenario.scenarioVideo) || null;
  return selectScenarioVideoSrc(raw, isMobile);
}

interface SceneNavigationParams {
  activeScene: SceneKey;
  currentScenarioIndex: number;
  isMobile: boolean;
  setScene: (scene: SceneKey) => void;
  setScenarioIndex: (index: number) => void;
}

function useSceneNavigation({
  activeScene,
  currentScenarioIndex,
  isMobile,
  setScene,
  setScenarioIndex,
}: SceneNavigationParams) {
  const isOpening = activeScene === "opening";
  const isCharacterSelect = activeScene === "characterSelect";
  const isReport = activeScene === "report";
  const isHoloInfo = activeScene === "holoInfoIntro";

  const showHud = !isOpening;
  const hideProgressAndScore = isReport || (isHoloInfo && !isMobile);
  // Cursor is always visible on desktop (width >= 800 check is handled in SceneManager)
  const isCursorVisible = true;

  const setSceneSafe = React.useCallback(
    (next: SceneKey) => {
      const validated = transitionScene(activeScene, next);
      if (validated !== activeScene) {
        setScene(validated);
      }
    },
    [activeScene, setScene]
  );

  const goToNextScenarioOrReport = React.useCallback(
    (totalQuestionsCount: number) => {
      const nextIndex = currentScenarioIndex + 1;

      if (nextIndex < totalQuestionsCount) {
        setScenarioIndex(nextIndex);
        setSceneSafe("questionShell");
        return { nextIndex, isLastQuestion: false as const };
      }

      setSceneSafe("report");
      return { isLastQuestion: true as const };
    },
    [currentScenarioIndex, setSceneSafe, setScenarioIndex]
  );

  return {
    activeScene,
    isOpening,
    isCharacterSelect,
    isReport,
    isHoloInfo,
    showHud,
    hideProgressAndScore,
    isCursorVisible,
    setSceneSafe,
    goToNextScenarioOrReport,
  };
}

function useSceneCursor(
  activeScene: SceneKey,
  isOpeningLoadingVisible: boolean
) {
  const { setMode, setLabel } = useCursor();

  React.useEffect(() => {
    const isOpeningScene = activeScene === "opening";

    if (isOpeningScene) {
      if (isOpeningLoadingVisible) {
        setMode("default");
        setLabel("");
      } else {
        setMode("hover");
        setLabel("BEGIN");
      }
      return;
    }

    setMode("default");
    setLabel("");
  }, [activeScene, isOpeningLoadingVisible, setMode, setLabel]);
}

function useVideoPreload() {
  const [preloadVideoSrc, setPreloadVideoSrc] = useState<string | null>(null);

  return { preloadVideoSrc, setPreloadVideoSrc };
}

interface UseAnswerAnalyticsParams {
  selectedCharacterIndex: number;
  currentScenarioIndex: number;
  scenarioKey: string;
  previousAnswers: Record<string, string>;
  setPreviousAnswers: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;
  trackEvent: ReturnType<typeof useAnalytics>["trackEvent"];
}

function useAnswerAnalytics({
  selectedCharacterIndex,
  currentScenarioIndex,
  scenarioKey,
  previousAnswers,
  setPreviousAnswers,
  trackEvent,
}: UseAnswerAnalyticsParams) {
  const scenarioNumber = Math.min(5, Math.max(1, currentScenarioIndex + 1)) as
    | 1
    | 2
    | 3
    | 4
    | 5;

  const trackAnswerSelect = React.useCallback(
    (answerIndex: number) => {
      const questionId = formatQuestionId(
        selectedCharacterIndex,
        currentScenarioIndex
      );
      const answerId = formatAnswerId(answerIndex);
      const previousAnswer = previousAnswers[scenarioKey];

      trackEvent("answer_select", {
        question: questionId,
        answer: answerId,
        ...(previousAnswer ? { answer_given: previousAnswer } : {}),
      });

      setPreviousAnswers((prev) => ({
        ...prev,
        [scenarioKey]: answerId,
      }));
    },
    [
      selectedCharacterIndex,
      currentScenarioIndex,
      previousAnswers,
      scenarioKey,
      setPreviousAnswers,
      trackEvent,
    ]
  );

  const trackAnswerResult = React.useCallback(
    (answerIndex: number, isCorrect: boolean) => {
      const questionId = formatQuestionId(
        selectedCharacterIndex,
        currentScenarioIndex
      );
      const answerId = formatAnswerId(answerIndex);

      if (isCorrect) {
        trackEvent(`Scenario ${scenarioNumber} correct answer`, {
          question: questionId,
          answer: answerId,
        });
      } else {
        trackEvent(`Scenario ${scenarioNumber} incorrect answer`, {
          question: questionId,
          answer_given: answerId,
        });
      }
    },
    [selectedCharacterIndex, currentScenarioIndex, scenarioNumber, trackEvent]
  );

  const trackAnswerRewind = React.useCallback(() => {
    const questionId = formatQuestionId(
      selectedCharacterIndex,
      currentScenarioIndex
    );
    const previousAnswer = previousAnswers[scenarioKey];

    trackEvent(`Rewind to scenario ${scenarioNumber}`, {
      question: questionId,
      ...(previousAnswer ? { answer_given: previousAnswer } : {}),
    });
  }, [
    selectedCharacterIndex,
    currentScenarioIndex,
    scenarioNumber,
    previousAnswers,
    scenarioKey,
    trackEvent,
  ]);

  const trackAnswerProgress = React.useCallback(
    (hasNextQuestion: boolean) => {
      const questionId = formatQuestionId(
        selectedCharacterIndex,
        currentScenarioIndex
      );

      if (hasNextQuestion) {
        trackEvent("answer_continue", { question: questionId });
      } else {
        trackEvent("See how you did", { question: questionId });
      }
    },
    [selectedCharacterIndex, currentScenarioIndex, trackEvent]
  );

  return {
    trackAnswerSelect,
    trackAnswerResult,
    trackAnswerRewind,
    trackAnswerProgress,
  };
}

interface GameSceneLogicProps {
  children: (props: {
    activeScene: SceneKey;
    isOpening: boolean;
    isCharacterSelect: boolean;
    isReport: boolean;
    isHoloInfo: boolean;
    showHud: boolean;
    hideProgressAndScore: boolean;
    isCursorVisible: boolean;

    characterScenarios: CharacterScenarioSet | undefined;
    scenario: ScenarioQuestion | undefined;
    totalQuestionsCount: number;
    scenarioKey: string;
    isFirstAttempt: boolean;
    scoreToPass: number | undefined;
    currentScenarioIndex: number;

    hudShouldAnimateIn: boolean;
    questionShouldAutoReveal: boolean;
    isCharacterSelectUIVisible: boolean;
    isOpeningLoadingVisible: boolean;
    pendingAction: (ScenarioAction & {
      selectedIndex: number;
      isRepeatAttempt?: boolean;
    }) | null;
    hudScoreFlashVariant: "positive" | "negative" | undefined;
    preloadVideoSrc: string | null;

    // Event handlers
    handleOpeningLoadingVisibilityChange: (visible: boolean) => void;
    handleCharacterSelectNext: (nextIndex: number) => void;
    handleCharacterSelectBack: (prevIndex: number) => void;
    handleCharacterSelectPrimaryAction: (profile: CharacterProfile) => void;
    handleCharacterSelectPrimaryActionWithFade: (
      profile: CharacterProfile
    ) => void;
    handleCharacterSelectUIVisible: () => void;
    handleOpeningPrimaryAction: () => void;
    handleOpeningLoadingTap: () => void;
    handleHoloInfoNext: () => void;
    handleQuestionOptionRegister: (info: { index?: number }) => void;
    handleQuestionOptionCommit: (info: {
      selectedIndex: number | null;
      selected: { id: string; label: string } | null;
    }) => void;
    handleQuestionOptionRegisterWithFade: (info: { index?: number }) => void;
    handleQuestionOptionCommitWithFade: (info: {
      selectedIndex: number | null;
      selected: { id: string; label: string } | null;
    }) => void;
    handlePostActionContinue: () => void;
    handlePostActionContinueWithFade: () => void;
    handlePostActionRewind: () => void;
    handleScore: () => void;
  }) => React.ReactElement;
}

export function GameSceneLogic({ children }: GameSceneLogicProps) {
  // Subscribe to only the store slices this component needs.
  // This avoids re-rendering this heavy component on unrelated store updates.
  const activeScene = useGameSelector((s) => s.activeScene);
  const selectedCharacterIndex = useGameSelector(
    (s) => s.selectedCharacterIndex
  );
  const currentScenarioIndex = useGameSelector((s) => s.currentScenarioIndex);
  const attemptCounts = useGameSelector((s) => s.attemptCounts);
  const scoredImpacts = useGameSelector((s) => s.scoredImpacts);
  const audioMuted = useGameSelector((s) => s.audioMuted);
  const actions = useGameActions();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const { trackEvent } = useAnalytics();

  const sound = useOptionalSoundManager();
  const soundRef = useRef<SoundManager | undefined>(undefined);
  soundRef.current = sound;

  const [hudShouldAnimateIn, setHudShouldAnimateIn] = useState(false);
  const [questionShouldAutoReveal, setQuestionShouldAutoReveal] =
    useState(false);
  const [isCharacterSelectUIVisible, setIsCharacterSelectUIVisible] =
    useState(false);
  const [isOpeningLoadingVisible, setIsOpeningLoadingVisible] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    (ScenarioAction & { selectedIndex: number; isRepeatAttempt?: boolean }) | null
  >(null);
  const [hudScoreFlashVariant, setHudScoreFlashVariant] = useState<
    "positive" | "negative" | undefined
  >(undefined);
  const [previousAnswers, setPreviousAnswers] = useState<
    Record<string, string>
  >({});
  const { preloadVideoSrc, setPreloadVideoSrc } = useVideoPreload();

  // Ensure delayed transitions (fade timers) can’t fire after unmount / fast navigation.
  const timeoutIdsRef = useRef<number[]>([]);
  const setSafeTimeout = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timeoutIdsRef.current.push(id);
    return id;
  }, []);
  useEffect(() => {
    return () => {
      timeoutIdsRef.current.forEach((id) => window.clearTimeout(id));
      timeoutIdsRef.current = [];
    };
  }, []);

  // Scroll to top when returning to opening scene (e.g., after "Play as new character")
  useEffect(() => {
    if (activeScene === "opening") {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [activeScene]);

  const characterScenarios = useMemo(
    () => SCENARIOS[selectedCharacterIndex],
    [selectedCharacterIndex]
  );

  const scenario = useMemo(() => {
    const raw = characterScenarios?.questions?.[currentScenarioIndex];
    if (!raw) return raw;
    return {
      ...raw,
      scenarioVideo:
        selectScenarioVideoSrc(raw.scenarioVideo, isMobile) ??
        raw.scenarioVideo,
      actionChoices: raw.actionChoices.map((a) => ({
        ...a,
        postActionVideo:
          selectScenarioVideoSrc(a.postActionVideo, isMobile) ??
          a.postActionVideo,
      })),
    };
  }, [characterScenarios, currentScenarioIndex, isMobile]);

  const totalQuestionsCount = characterScenarios?.questions?.length ?? 0;

  const scenarioKey = useMemo(() => {
    return `${selectedCharacterIndex}:${currentScenarioIndex}`;
  }, [selectedCharacterIndex, currentScenarioIndex]);

  const isFirstAttempt = useMemo(() => {
    const count = attemptCounts[scenarioKey] ?? 0;
    return count === 0;
  }, [attemptCounts, scenarioKey]);

  const scoreToPass = pendingAction ? pendingAction.pointsImpact : undefined;

  const {
    isOpening,
    isCharacterSelect,
    isReport,
    isHoloInfo,
    showHud,
    hideProgressAndScore,
    isCursorVisible,
    setSceneSafe,
    goToNextScenarioOrReport,
  } = useSceneNavigation({
    activeScene,
    currentScenarioIndex,
    isMobile,
    setScene: actions.setScene,
    setScenarioIndex: actions.setScenarioIndex,
  });

  useSceneCursor(activeScene, isOpeningLoadingVisible);

  const {
    trackAnswerSelect,
    trackAnswerResult,
    trackAnswerRewind,
    trackAnswerProgress,
  } = useAnswerAnalytics({
    selectedCharacterIndex,
    currentScenarioIndex,
    scenarioKey,
    previousAnswers,
    setPreviousAnswers,
    trackEvent,
  });

  useEffect(() => {
    if (activeScene !== "postAction") {
      setHudScoreFlashVariant(undefined);
    }
  }, [activeScene, currentScenarioIndex]);

  useEffect(() => {
    if (activeScene === "questionShell" && questionShouldAutoReveal) {
      const id = window.setTimeout(() => setQuestionShouldAutoReveal(false), 0);
      return () => window.clearTimeout(id);
    }
  }, [activeScene, questionShouldAutoReveal]);

  const handleOpeningLoadingVisibilityChange = useCallback(
    (visible: boolean) => setIsOpeningLoadingVisible(visible),
    []
  );

  const handleCharacterSelectNext = useCallback(
    (nextIndex: number) => {
      trackEvent("character_next");
      actions.setCharacterIndex(nextIndex);
    },
    [actions, trackEvent]
  );

  const handleCharacterSelectBack = useCallback(
    (prevIndex: number) => {
      trackEvent("character_back");
      actions.setCharacterIndex(prevIndex);
    },
    [actions, trackEvent]
  );

  const handleCharacterSelectPrimaryAction = useCallback(
    (profile: CharacterProfile) => {
      const name = (profile.name || "").toLowerCase();
      const event =
        name === "stella"
          ? ("Stella character" as const)
          : name === "sidney"
            ? ("Sidney character" as const)
            : name === "mo"
              ? ("Mo character" as const)
              : name === "ali"
                ? ("Ali character" as const)
                : ("character_select" as const);
      trackEvent(event, { character: formatCharacterId(profile.index) });
      actions.setCharacter(profile.index, profile);
      setSceneSafe("questionShell");
    },
    [actions, setSceneSafe, trackEvent]
  );

  const handleCharacterSelectPrimaryActionWithFade = useCallback(
    (profile: CharacterProfile) => {
      const name = (profile.name || "").toLowerCase();
      const event =
        name === "stella"
          ? ("Stella character" as const)
          : name === "sidney"
            ? ("Sidney character" as const)
            : name === "mo"
              ? ("Mo character" as const)
              : name === "ali"
                ? ("Ali character" as const)
                : ("character_select" as const);
      trackEvent(event, { character: formatCharacterId(profile.index) });
      actions.setCharacter(profile.index, profile);

      if (SCENARIOS[profile.index]?.questions?.[0]) {
        const firstScenario = SCENARIOS[profile.index].questions[0];
        const firstVariant =
          selectScenarioVideoSrc(firstScenario.scenarioVideo, isMobile) ??
          firstScenario.scenarioVideo;
        const firstVideoSrc = toPublicPath(firstVariant) || null;
        setPreloadVideoSrc(firstVideoSrc);
      }

      setSafeTimeout(() => {
        setSceneSafe("questionShell");
      }, 200);
    },
    [actions, setPreloadVideoSrc, setSafeTimeout, setSceneSafe, trackEvent]
  );

  const handleCharacterSelectUIVisible = useCallback(
    () => setIsCharacterSelectUIVisible(true),
    []
  );

  const handleOpeningPrimaryAction = useCallback(() => {
    setHudShouldAnimateIn(true);
    setSceneSafe("holoInfoIntro");
  }, [setSceneSafe]);

  const handleOpeningLoadingTap = useCallback(() => {
    if (audioMuted) {
      flushSync(() => actions.setAudioMuted(false));
      soundRef.current?.startLoop("bgMusic");
    }
  }, [audioMuted, actions]);

  const handleHoloInfoNext = useCallback(() => {
    trackEvent("Welcome continue");
    setPreloadVideoSrc(
      isMobile && !isTablet
        ? ASSETS.VIDEO.CHARACTER_SELECTION_MOBILE
        : ASSETS.VIDEO.CHARACTER_SELECTION
    );
    setSceneSafe("characterSelect");
  }, [isMobile, isTablet, setPreloadVideoSrc, setSceneSafe, trackEvent]);

  const applyAnswerSelection = useCallback(
    (
      selectedIndex: number,
      options: { fade?: boolean; preload?: boolean } = {}
    ) => {
      if (!scenario) return;
      const action = scenario.actionChoices[selectedIndex];
      if (!action) return;

      trackAnswerSelect(selectedIndex);

      // If the player has already received a score for this scenarioKey, any further
      // attempts are "re-answers" (typically after a rewind).
      const hasScoredBefore = Object.prototype.hasOwnProperty.call(
        scoredImpacts,
        scenarioKey
      );

      if (options.preload) {
        const variant =
          selectScenarioVideoSrc(action.postActionVideo, isMobile) ??
          action.postActionVideo;
        const videoSrc = toPublicPath(variant) || null;
        setPreloadVideoSrc(videoSrc);
      }

      // Persist the user's choice immediately so End-of-Year highlights always have a video source,
      // even if the PostAction video fails to load/play (iOS autoplay edge cases, decode errors, etc.).
      actions.logAttemptResult({
        scenarioKey,
        questionIndex: scenario.questionIndex ?? currentScenarioIndex,
        selectedIndex,
        pointsImpact: action.pointsImpact,
        isCorrect: action.isCorrectAnswer,
        videoSrc: toPublicPath(
          selectScenarioVideoSrc(action.postActionVideo, isMobile) ??
            action.postActionVideo
        ),
      });

      setPendingAction({
        ...action,
        selectedIndex,
        isRepeatAttempt: hasScoredBefore,
      });

      if (options.fade) {
        setSafeTimeout(() => {
          setSceneSafe("postAction");
        }, 200);
      } else {
        setSceneSafe("postAction");
      }
    },
    [
      scenario,
      trackAnswerSelect,
      setPreloadVideoSrc,
      setPendingAction,
      setSceneSafe,
      setSafeTimeout,
      actions,
      scenarioKey,
      currentScenarioIndex,
      scoredImpacts,
      isMobile,
    ]
  );

  const handleQuestionOptionRegister = useCallback(
    ({ index }: { index?: number }) => {
      if (index == null) return;
      applyAnswerSelection(index, { preload: true, fade: false });
    },
    [applyAnswerSelection]
  );

  const handleQuestionOptionCommit = useCallback(
    (info: {
      selectedIndex: number | null;
      selected: { id: string; label: string } | null;
    }) => {
      if (info.selectedIndex == null) return;
      applyAnswerSelection(info.selectedIndex, { preload: false, fade: false });
    },
    [applyAnswerSelection]
  );

  const handleQuestionOptionRegisterWithFade = useCallback(
    ({ index }: { index?: number }) => {
      if (index == null) return;
      applyAnswerSelection(index, { preload: true, fade: true });
    },
    [applyAnswerSelection]
  );

  const handleQuestionOptionCommitWithFade = useCallback(
    (info: {
      selectedIndex: number | null;
      selected: { id: string; label: string } | null;
    }) => {
      if (info.selectedIndex == null) return;
      applyAnswerSelection(info.selectedIndex, { preload: false, fade: true });
    },
    [applyAnswerSelection]
  );

  const handlePostActionContinueWithFade = useCallback(() => {
    const nextIndex = currentScenarioIndex + 1;
    setPendingAction(null);

    const hasNextQuestion = nextIndex < totalQuestionsCount;
    trackAnswerProgress(hasNextQuestion);

    if (hasNextQuestion) {
      const nextVideoSrc = getNextScenarioVideo(
        selectedCharacterIndex,
        currentScenarioIndex,
        isMobile
      );
      setPreloadVideoSrc(nextVideoSrc);
    }

    setSafeTimeout(() => {
      goToNextScenarioOrReport(totalQuestionsCount);
    }, 200);
  }, [
    currentScenarioIndex,
    totalQuestionsCount,
    selectedCharacterIndex,
    goToNextScenarioOrReport,
    setPreloadVideoSrc,
    isMobile,
    setSafeTimeout,
    trackAnswerProgress,
  ]);

  const handlePostActionContinue = useCallback(() => {
    const nextIndex = currentScenarioIndex + 1;
    setPendingAction(null);

    const hasNextQuestion = nextIndex < totalQuestionsCount;
    trackAnswerProgress(hasNextQuestion);

    if (hasNextQuestion) {
      const nextVideoSrc = getNextScenarioVideo(
        selectedCharacterIndex,
        currentScenarioIndex,
        isMobile
      );
      setPreloadVideoSrc(nextVideoSrc);
    }

    goToNextScenarioOrReport(totalQuestionsCount);
  }, [
    currentScenarioIndex,
    totalQuestionsCount,
    selectedCharacterIndex,
    goToNextScenarioOrReport,
    setPreloadVideoSrc,
    trackAnswerProgress,
  ]);

  const handlePostActionRewind = useCallback(() => {
    trackAnswerRewind();

    setPendingAction(null);
    setQuestionShouldAutoReveal(true);
    setSceneSafe("questionShell");
  }, [setSceneSafe, trackAnswerRewind]);

  const handleScore = useCallback(() => {
    if (!pendingAction) return;

    actions.logAttemptResult({
      scenarioKey,
      questionIndex: scenario?.questionIndex ?? currentScenarioIndex,
      selectedIndex: pendingAction.selectedIndex,
      pointsImpact: pendingAction.pointsImpact,
      isCorrect: pendingAction.isCorrectAnswer,
      videoSrc: toPublicPath(
        selectScenarioVideoSrc(pendingAction.postActionVideo, isMobile) ??
          pendingAction.postActionVideo
      ),
    });

    const nextIndex = currentScenarioIndex + 1;
    if (nextIndex < totalQuestionsCount) {
      const nextVideoSrc = getNextScenarioVideo(
        selectedCharacterIndex,
        currentScenarioIndex,
        isMobile
      );
      setPreloadVideoSrc(nextVideoSrc);
    }

    // Score only on the first "finalised" PostAction for this scenarioKey.
    // Rewinds can still show alternative outcomes, but do not change the score.
    trackAnswerResult(pendingAction.selectedIndex, pendingAction.isCorrectAnswer);

    actions.scoreAttempt(scenarioKey, pendingAction.pointsImpact);
    if (pendingAction.pointsImpact > 0 && pendingAction.icon) {
      actions.logActionIcon(pendingAction.icon as MaterialIconName);
    }
    setHudScoreFlashVariant(pendingAction.isCorrectAnswer ? "positive" : "negative");
  }, [
    pendingAction,
    actions,
    scenarioKey,
    trackAnswerResult,
    scenario?.questionIndex,
    currentScenarioIndex,
    totalQuestionsCount,
    selectedCharacterIndex,
    setPreloadVideoSrc,
    isMobile,
  ]);

  return children({
    activeScene,
    isOpening,
    isCharacterSelect,
    isReport,
    isHoloInfo,
    showHud,
    hideProgressAndScore,
    isCursorVisible,

    characterScenarios,
    scenario,
    totalQuestionsCount,
    scenarioKey,
    isFirstAttempt,
    scoreToPass,
    currentScenarioIndex,

    hudShouldAnimateIn,
    questionShouldAutoReveal,
    isCharacterSelectUIVisible,
    isOpeningLoadingVisible,
    pendingAction,
    hudScoreFlashVariant,
    preloadVideoSrc,

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
    handleQuestionOptionRegisterWithFade,
    handleQuestionOptionCommitWithFade,
    handlePostActionContinue,
    handlePostActionContinueWithFade,
    handlePostActionRewind,
    handleScore,
  });
}
