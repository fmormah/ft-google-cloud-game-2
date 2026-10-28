"use client";

import React, { useContext, useMemo, useRef, useSyncExternalStore } from "react";
import { type CharacterProfile, type MaterialIconName } from "@/types/game";
import { useRateLimit } from "@/hooks/useRateLimit";
import type { SceneKey } from "@/types/scene";

export type AttemptResult = {
  scenarioKey: string;
  questionIndex: number;
  selectedIndex: number;
  pointsImpact: number;
  isCorrect: boolean;
  videoSrc?: string;
};

export interface GameState {
  activeScene: SceneKey;
  selectedCharacterIndex: number;
  selectedCharacter: CharacterProfile | null;
  currentScenarioIndex: number;
  totalScore: number;
  attemptCounts: Record<string, number>;
  /**
   * The pointsImpact applied for each scenarioKey on the first scored attempt.
   * Subsequent attempts (e.g. after rewind) are tracked in `attemptCounts` but do not
   * change the score.
   */
  scoredImpacts: Record<string, number>;
  attemptResults: Record<string, AttemptResult>;
  audioMuted: boolean;
  chosenActionIcons: MaterialIconName[];
}

type GameAction =
  | { type: "SET_SCENE"; payload: SceneKey }
  | {
      type: "SET_CHARACTER";
      payload: { index: number; profile: CharacterProfile };
    }
  | { type: "SET_CHARACTER_INDEX"; payload: number }
  | { type: "SET_SCENARIO_INDEX"; payload: number }
  | { type: "INCREMENT_SCENARIO" }
  | { type: "SCORE_ATTEMPT"; payload: { scenarioKey: string; points: number } }
  | { type: "LOG_ATTEMPT_RESULT"; payload: AttemptResult }
  | { type: "RESET_GAME" }
  | { type: "SET_AUDIO_MUTED"; payload: boolean }
  | { type: "TOGGLE_AUDIO_MUTED" }
  | { type: "LOG_ACTION_ICON"; payload: MaterialIconName }
  | { type: "SET"; payload: Partial<GameState> };

const initialState: GameState = {
  activeScene: "opening",
  selectedCharacterIndex: 0,
  selectedCharacter: null,
  currentScenarioIndex: 0,
  totalScore: 100,
  attemptCounts: {},
  scoredImpacts: {},
  attemptResults: {},
  audioMuted: true,
  chosenActionIcons: [],
};

function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "SET_SCENE":
      return { ...state, activeScene: action.payload };
    case "SET_CHARACTER":
      return {
        ...state,
        selectedCharacterIndex: action.payload.index,
        selectedCharacter: action.payload.profile,
        currentScenarioIndex: 0,
      };
    case "SET_CHARACTER_INDEX":
      return { ...state, selectedCharacterIndex: action.payload };
    case "SET_SCENARIO_INDEX":
      return { ...state, currentScenarioIndex: action.payload };
    case "INCREMENT_SCENARIO":
      return { ...state, currentScenarioIndex: state.currentScenarioIndex + 1 };
    case "SCORE_ATTEMPT": {
      const { scenarioKey, points } = action.payload;
      const count = state.attemptCounts[scenarioKey] ?? 0;
      const hasScoredBefore = Object.prototype.hasOwnProperty.call(
        state.scoredImpacts,
        scenarioKey
      );

      // Only the first scored attempt impacts totalScore (per spec).
      // Rewinds / subsequent attempts are still counted for analytics/debugging.
      if (hasScoredBefore) {
        return {
          ...state,
          attemptCounts: { ...state.attemptCounts, [scenarioKey]: count + 1 },
        };
      }

      return {
        ...state,
        attemptCounts: { ...state.attemptCounts, [scenarioKey]: count + 1 },
        scoredImpacts: { ...state.scoredImpacts, [scenarioKey]: points },
        totalScore: Math.max(0, state.totalScore + points),
      };
    }
    case "LOG_ATTEMPT_RESULT": {
      const result = action.payload;
      return {
        ...state,
        attemptResults: {
          ...state.attemptResults,
          [result.scenarioKey]: result,
        },
      };
    }
    case "SET_AUDIO_MUTED":
      return { ...state, audioMuted: action.payload };
    case "TOGGLE_AUDIO_MUTED":
      return { ...state, audioMuted: !state.audioMuted };
    case "RESET_GAME":
      return initialState;
    case "LOG_ACTION_ICON": {
      const icon = action.payload;
      if (state.chosenActionIcons.includes(icon)) {
        return state;
      }
      return {
        ...state,
        chosenActionIcons: [...state.chosenActionIcons, icon],
      };
    }
    case "SET":
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

type Listener = () => void;

interface GameStoreApi {
  getState: () => GameState;
  dispatch: (action: GameAction) => void;
  subscribe: (listener: Listener) => () => void;
}

function createGameStore(initial: GameState): GameStoreApi {
  let state = initial;
  const listeners = new Set<Listener>();

  return {
    getState: () => state,
    dispatch: (action) => {
      const next = reducer(state, action);
      if (next === state) return;
      state = next;
      listeners.forEach((l) => l());
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

const noopSubscribe = () => () => {};
const getUndefinedState = () => undefined as unknown as GameState;

const GameStoreContext = React.createContext<GameStoreApi | undefined>(undefined);

export function GameStoreProvider({
  children,
  initialValues,
}: {
  children: React.ReactNode;
  initialValues?: Partial<GameState>;
}): React.ReactElement {
  const storeRef = useRef<GameStoreApi | null>(null);
  if (!storeRef.current) {
    storeRef.current = createGameStore(
      initialValues ? { ...initialState, ...initialValues } : initialState
    );
  }

  return (
    <GameStoreContext.Provider value={storeRef.current}>
      {children}
    </GameStoreContext.Provider>
  );
}

export function useGameStore(): GameState {
  const store = useContext(GameStoreContext);
  if (!store) throw new Error("useGameStore must be used within GameStoreProvider");
  return useSyncExternalStore(store.subscribe, store.getState, store.getState);
}

export function useGameDispatch(): React.Dispatch<GameAction> {
  const store = useContext(GameStoreContext);
  if (!store) throw new Error("useGameDispatch must be used within GameStoreProvider");
  return store.dispatch;
}

export function useGameStoreOptional(): GameState | undefined {
  const store = useContext(GameStoreContext);
  const state = useSyncExternalStore(
    store?.subscribe ?? noopSubscribe,
    store?.getState ?? getUndefinedState,
    store?.getState ?? getUndefinedState
  );
  return store ? state : undefined;
}

export function useGameDispatchOptional(): React.Dispatch<GameAction> | undefined {
  const store = useContext(GameStoreContext);
  return store?.dispatch;
}

export function useGameSelector<T>(
  selector: (state: GameState) => T,
  equalityFn: (a: T, b: T) => boolean = Object.is
): T {
  const store = useContext(GameStoreContext);
  if (!store) throw new Error("useGameSelector must be used within GameStoreProvider");

  const lastRef = useRef<{ hasValue: boolean; value: T }>({
    hasValue: false,
    value: undefined as unknown as T,
  });

  const getSnapshot = () => {
    const next = selector(store.getState());
    const last = lastRef.current;
    if (last.hasValue && equalityFn(last.value, next)) {
      return last.value;
    }
    lastRef.current = { hasValue: true, value: next };
    return next;
  };

  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}

export function useGameSelectorOptional<T>(
  selector: (state: GameState) => T,
  fallback: T,
  equalityFn: (a: T, b: T) => boolean = Object.is
): T {
  const store = useContext(GameStoreContext);
  const lastRef = useRef<{ hasValue: boolean; value: T }>({
    hasValue: true,
    value: fallback,
  });

  const getSnapshot = () => {
    if (!store) return fallback;
    const next = selector(store.getState());
    const last = lastRef.current;
    if (last.hasValue && equalityFn(last.value, next)) {
      return last.value;
    }
    lastRef.current = { hasValue: true, value: next };
    return next;
  };

  return useSyncExternalStore(
    store?.subscribe ?? noopSubscribe,
    getSnapshot,
    getSnapshot
  );
}

export function useGameActions() {
  const dispatch = useGameDispatch();

  const rateLimitedSetScene = useRateLimit(
    (scene: SceneKey) => dispatch({ type: "SET_SCENE", payload: scene }),
    { limit: 5, windowMs: 1000 }
  );

  const rateLimitedSetCharacter = useRateLimit(
    (index: number, profile: CharacterProfile) =>
      dispatch({ type: "SET_CHARACTER", payload: { index, profile } }),
    { limit: 3, windowMs: 1000 }
  );

  return {
    setScene: rateLimitedSetScene,
    setCharacter: rateLimitedSetCharacter,
    setCharacterIndex: (index: number) =>
      dispatch({ type: "SET_CHARACTER_INDEX", payload: index }),
    setScenarioIndex: (index: number) =>
      dispatch({ type: "SET_SCENARIO_INDEX", payload: index }),
    incrementScenario: () => dispatch({ type: "INCREMENT_SCENARIO" }),
    scoreAttempt: (scenarioKey: string, points: number) =>
      dispatch({ type: "SCORE_ATTEMPT", payload: { scenarioKey, points } }),
    logAttemptResult: (result: AttemptResult) =>
      dispatch({ type: "LOG_ATTEMPT_RESULT", payload: result }),
    setAudioMuted: (muted: boolean) =>
      dispatch({ type: "SET_AUDIO_MUTED", payload: muted }),
    toggleAudioMuted: () => dispatch({ type: "TOGGLE_AUDIO_MUTED" }),
    logActionIcon: (icon: MaterialIconName) =>
      dispatch({ type: "LOG_ACTION_ICON", payload: icon }),
    resetGame: () => dispatch({ type: "RESET_GAME" }),
    set: (patch: Partial<GameState>) =>
      dispatch({ type: "SET", payload: patch }),
  };
}

export function useGameActionsOptional():
  | ReturnType<typeof useGameActions>
  | undefined {
  const dispatch = useGameDispatchOptional();

  // Always call hooks; just noop if dispatch is missing (e.g. Storybook usage).
  const rateLimitedSetScene = useRateLimit(
    (scene: SceneKey) => dispatch?.({ type: "SET_SCENE", payload: scene }),
    { limit: 5, windowMs: 1000 }
  );

  const rateLimitedSetCharacter = useRateLimit(
    (index: number, profile: CharacterProfile) =>
      dispatch?.({ type: "SET_CHARACTER", payload: { index, profile } }),
    { limit: 3, windowMs: 1000 }
  );

  const actions = useMemo(() => {
    if (!dispatch) return undefined;
    return {
      setScene: rateLimitedSetScene,
      setCharacter: rateLimitedSetCharacter,
      setCharacterIndex: (index: number) =>
        dispatch({ type: "SET_CHARACTER_INDEX", payload: index }),
      setScenarioIndex: (index: number) =>
        dispatch({ type: "SET_SCENARIO_INDEX", payload: index }),
      incrementScenario: () => dispatch({ type: "INCREMENT_SCENARIO" }),
      scoreAttempt: (scenarioKey: string, points: number) =>
        dispatch({ type: "SCORE_ATTEMPT", payload: { scenarioKey, points } }),
      logAttemptResult: (result: AttemptResult) =>
        dispatch({ type: "LOG_ATTEMPT_RESULT", payload: result }),
      setAudioMuted: (muted: boolean) =>
        dispatch({ type: "SET_AUDIO_MUTED", payload: muted }),
      toggleAudioMuted: () => dispatch({ type: "TOGGLE_AUDIO_MUTED" }),
      logActionIcon: (icon: MaterialIconName) =>
        dispatch({ type: "LOG_ACTION_ICON", payload: icon }),
      resetGame: () => dispatch({ type: "RESET_GAME" }),
      set: (patch: Partial<GameState>) =>
        dispatch({ type: "SET", payload: patch }),
    };
  }, [dispatch, rateLimitedSetCharacter, rateLimitedSetScene]);

  return actions;
}
