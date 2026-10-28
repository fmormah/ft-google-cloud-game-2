import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import React from "react";
import {
  GameStoreProvider,
  useGameStore,
  useGameDispatch,
  useGameActions,
  type GameState,
} from "./GameStore";
import { type CharacterProfile } from "@/components/organisms/scenes/CharacterSelect/CharacterSelect";

const mockCharacterProfile: CharacterProfile = {
  index: 0,
  name: "Test Character",
  jobTitle: "Test Job",
  characterSelectVideoIndex: {
    desktop: 0,
    mobile: 0,
  },
  characterDescription: "Test character description",
};

const renderGameStoreHook = (initialValues?: Partial<GameState>) => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <GameStoreProvider initialValues={initialValues}>
      {children}
    </GameStoreProvider>
  );

  return renderHook(
    () => ({
      state: useGameStore(),
      dispatch: useGameDispatch(),
      actions: useGameActions(),
    }),
    { wrapper }
  );
};

describe("GameStore", () => {
  describe("Initial State", () => {
    it("should have correct default values", () => {
      const { result } = renderGameStoreHook();

      expect(result.current.state.activeScene).toBe("opening");
      expect(result.current.state.selectedCharacterIndex).toBe(0);
      expect(result.current.state.selectedCharacter).toBeNull();
      expect(result.current.state.currentScenarioIndex).toBe(0);
      expect(result.current.state.totalScore).toBe(100);
      expect(result.current.state.attemptCounts).toEqual({});
      expect(result.current.state.scoredImpacts).toEqual({});
      expect(result.current.state.attemptResults).toEqual({});
      expect(result.current.state.audioMuted).toBe(true);
      expect(result.current.state.chosenActionIcons).toEqual([]);
    });

    it("should accept initial values", () => {
      const initialValues: Partial<GameState> = {
        activeScene: "characterSelect",
        totalScore: 50,
        audioMuted: false,
      };

      const { result } = renderGameStoreHook(initialValues);

      expect(result.current.state.activeScene).toBe("characterSelect");
      expect(result.current.state.totalScore).toBe(50);
      expect(result.current.state.audioMuted).toBe(false);
    });
  });

  describe("Scene Management", () => {
    it("should set active scene", () => {
      const { result } = renderGameStoreHook();

      act(() => {
        result.current.actions.setScene("characterSelect");
      });

      expect(result.current.state.activeScene).toBe("characterSelect");
    });

    it("should set character and update related state", () => {
      const { result } = renderGameStoreHook();

      act(() => {
        result.current.actions.setCharacter(1, mockCharacterProfile);
      });

      expect(result.current.state.selectedCharacterIndex).toBe(1);
      expect(result.current.state.selectedCharacter).toEqual(mockCharacterProfile);
      expect(result.current.state.currentScenarioIndex).toBe(0);
    });

    it("should set character index", () => {
      const { result } = renderGameStoreHook();

      act(() => {
        result.current.actions.setCharacterIndex(2);
      });

      expect(result.current.state.selectedCharacterIndex).toBe(2);
    });

    it("should set scenario index", () => {
      const { result } = renderGameStoreHook();

      act(() => {
        result.current.actions.setScenarioIndex(3);
      });

      expect(result.current.state.currentScenarioIndex).toBe(3);
    });

    it("should increment scenario index", () => {
      const { result } = renderGameStoreHook({ currentScenarioIndex: 2 });

      act(() => {
        result.current.actions.incrementScenario();
      });

      expect(result.current.state.currentScenarioIndex).toBe(3);
    });
  });

  describe("Scoring System", () => {
    it("should score first attempt correctly", () => {
      const { result } = renderGameStoreHook({ totalScore: 100 });

      act(() => {
        result.current.actions.scoreAttempt("scenario-1", 10);
      });

      expect(result.current.state.totalScore).toBe(110); // 100 + 10
      expect(result.current.state.attemptCounts["scenario-1"]).toBe(1);
      expect(result.current.state.scoredImpacts["scenario-1"]).toBe(10);
    });

    it("should not change score on subsequent attempts (e.g. after rewind)", () => {
      const { result } = renderGameStoreHook({
        totalScore: 110,
        attemptCounts: { "scenario-1": 1 },
        scoredImpacts: { "scenario-1": 10 },
      });

      act(() => {
        result.current.actions.scoreAttempt("scenario-1", -20);
      });

      // Score is locked after the first attempt.
      expect(result.current.state.totalScore).toBe(110);
      expect(result.current.state.attemptCounts["scenario-1"]).toBe(2);
      expect(result.current.state.scoredImpacts["scenario-1"]).toBe(10);
    });

    it("should handle negative scores correctly", () => {
      const { result } = renderGameStoreHook({ totalScore: 100 });

      act(() => {
        result.current.actions.scoreAttempt("scenario-1", -20);
      });

      expect(result.current.state.totalScore).toBe(80); // 100 - 20
      expect(result.current.state.scoredImpacts["scenario-1"]).toBe(-20);
    });

    it("should not go below zero", () => {
      const { result } = renderGameStoreHook({ totalScore: 10 });

      act(() => {
        result.current.actions.scoreAttempt("scenario-1", -50);
      });

      expect(result.current.state.totalScore).toBe(0); // Min 0
    });
  });

  describe("Audio Management", () => {
    it("should set audio muted state", () => {
      const { result } = renderGameStoreHook();

      act(() => {
        result.current.actions.setAudioMuted(false);
      });

      expect(result.current.state.audioMuted).toBe(false);

      act(() => {
        result.current.actions.setAudioMuted(true);
      });

      expect(result.current.state.audioMuted).toBe(true);
    });

    it("should toggle audio muted state", () => {
      const { result } = renderGameStoreHook({ audioMuted: true });

      act(() => {
        result.current.actions.toggleAudioMuted();
      });

      expect(result.current.state.audioMuted).toBe(false);

      act(() => {
        result.current.actions.toggleAudioMuted();
      });

      expect(result.current.state.audioMuted).toBe(true);
    });
  });

  describe("Action Icons", () => {
    it("should log action icons for positive scores", () => {
      const { result } = renderGameStoreHook();

      act(() => {
        result.current.actions.logActionIcon("settings");
      });

      expect(result.current.state.chosenActionIcons).toEqual(["settings"]);
    });

    it("should not duplicate action icons", () => {
      const { result } = renderGameStoreHook({
        chosenActionIcons: ["build"]
      });

      act(() => {
        result.current.actions.logActionIcon("build");
      });

      expect(result.current.state.chosenActionIcons).toEqual(["build"]);
    });
  });

  describe("Game Reset", () => {
    it("should reset game to initial state", () => {
      const { result } = renderGameStoreHook();
      act(() => {
        result.current.actions.setScene("characterSelect");
        result.current.actions.setCharacter(1, mockCharacterProfile);
        result.current.actions.scoreAttempt("test", 10);
        result.current.actions.setAudioMuted(false);
      });
      expect(result.current.state.activeScene).toBe("characterSelect");
      expect(result.current.state.selectedCharacter).toEqual(mockCharacterProfile);
      expect(result.current.state.totalScore).toBe(110);
      expect(result.current.state.audioMuted).toBe(false);

      act(() => {
        result.current.actions.resetGame();
      });
      expect(result.current.state.activeScene).toBe("opening");
      expect(result.current.state.selectedCharacter).toBeNull();
      expect(result.current.state.totalScore).toBe(100);
      expect(result.current.state.audioMuted).toBe(true);
      expect(result.current.state.attemptCounts).toEqual({});
      expect(result.current.state.scoredImpacts).toEqual({});
      expect(result.current.state.attemptResults).toEqual({});
      expect(result.current.state.chosenActionIcons).toEqual([]);
    });
  });

  describe("Generic Set Action", () => {
    it("should merge partial state updates", () => {
      const { result } = renderGameStoreHook();

      act(() => {
        result.current.actions.set({
          totalScore: 200,
          audioMuted: false,
        });
      });

      expect(result.current.state.totalScore).toBe(200);
      expect(result.current.state.audioMuted).toBe(false);
      expect(result.current.state.activeScene).toBe("opening");
    });
  });

});
