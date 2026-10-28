import React from "react";
import { describe, it, expect, vi } from "vitest";
import { act, render } from "@testing-library/react";

import {
  GameStoreProvider,
  useGameStore,
  useGameActions,
  type GameState,
} from "@/store/GameStore";
import { GameSceneLogic } from "./GameSceneLogic";

// Mock analytics to avoid touching real trackers
const trackEventMock = vi.fn();

vi.mock("@/utils/analytics", () => {
  return {
    useAnalytics: () => ({
      trackEvent: trackEventMock,
    }),
    formatCharacterId: (index: number) => `CH${index + 1}`,
    formatQuestionId: (characterIndex: number, questionIndex: number) =>
      `CH${characterIndex + 1}Q${questionIndex + 1}`,
    formatAnswerId: (answerIndex: number) => `A${answerIndex + 1}`,
  };
});

// Mock cursor context so GameSceneLogic can run without a real CursorProvider
vi.mock("@/contexts/CursorContext", () => ({
  useCursor: () => ({
    mode: "default" as const,
    label: "",
    setMode: vi.fn(),
    setLabel: vi.fn(),
    setTemporaryMode: vi.fn(),
  }),
  CursorProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

type LogicProps = React.ComponentProps<typeof GameSceneLogic>;
type LogicRenderProps = Parameters<NonNullable<LogicProps["children"]>>[0];

let lastProps: LogicRenderProps | null = null;
let lastState: GameState | null = null;
let lastActions: ReturnType<typeof useGameActions> | null = null;

function TestHarness() {
  const state = useGameStore();
  const actions = useGameActions();

  return (
    <GameSceneLogic>
      {(props) => {
        lastProps = props;
        lastState = state;
        lastActions = actions;
        return <div data-testid="logic-root" />;
      }}
    </GameSceneLogic>
  );
}

function renderLogic(initialValues?: Partial<GameState>) {
  lastProps = null;
  lastState = null;
  lastActions = null;
  trackEventMock.mockClear();

  render(
    <GameStoreProvider initialValues={initialValues}>
      <TestHarness />
    </GameStoreProvider>
  );

  if (!lastProps || !lastState || !lastActions) {
    throw new Error("GameSceneLogic did not expose render props as expected");
  }
}

describe("GameSceneLogic - scene navigation", () => {
  it("allows valid transition from opening to holoInfoIntro via handleOpeningPrimaryAction", () => {
    renderLogic({ activeScene: "opening" });

    expect(lastState?.activeScene).toBe("opening");

    act(() => {
      lastProps?.handleOpeningPrimaryAction();
    });

    expect(lastState?.activeScene).toBe("holoInfoIntro");
  });

  it("blocks invalid transition from questionShell to holoInfoIntro via scene state machine", () => {
    renderLogic({ activeScene: "questionShell" });

    const initialScene = lastState?.activeScene;
    expect(initialScene).toBe("questionShell");

    act(() => {
      lastProps?.handleOpeningPrimaryAction();
    });

    // Scene should remain unchanged because transition is not allowed
    expect(lastState?.activeScene).toBe(initialScene);
  });

  it("from postAction continues to next question when more questions remain", () => {
    // Start in postAction on the first scenario
    renderLogic({ activeScene: "postAction", currentScenarioIndex: 0 });

    const initialIndex = lastState?.currentScenarioIndex;
    expect(initialIndex).toBe(0);

    act(() => {
      lastProps?.handlePostActionContinue();
    });

    expect(lastState?.activeScene).toBe("questionShell");
    expect(lastState?.currentScenarioIndex).toBe(1);
  });

  it("from postAction on last question transitions to report", () => {
    renderLogic();

    const totalQuestions = lastProps?.totalQuestionsCount ?? 0;
    expect(totalQuestions).toBeGreaterThan(0);

    const lastIndex = Math.max(0, totalQuestions - 1);

    act(() => {
      // Move to last question and into postAction scene
      lastActions?.setScenarioIndex(lastIndex);
      lastActions?.setScene("postAction");
    });

    expect(lastState?.currentScenarioIndex).toBe(lastIndex);
    expect(lastState?.activeScene).toBe("postAction");

    act(() => {
      lastProps?.handlePostActionContinue();
    });

    expect(lastState?.activeScene).toBe("report");
  });
});

describe("GameSceneLogic - re-answer attempts", () => {
  it("flags pendingAction as repeat attempt when the scenario was already scored", () => {
    renderLogic({
      activeScene: "questionShell",
      scoredImpacts: { "0:0": 10 },
    });

    act(() => {
      lastProps?.handleQuestionOptionCommit({
        selectedIndex: 0,
        selected: { id: "0", label: "Any" },
      });
    });

    expect(lastState?.activeScene).toBe("postAction");
    expect(lastProps?.pendingAction?.isRepeatAttempt).toBe(true);
  });
});


